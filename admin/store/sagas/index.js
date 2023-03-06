import {
  all,
  call,
  put,
  delay,
  take,
  select,
  cancel,
  cancelled,
  debounce,
  takeLeading,
  takeLatest,
  spawn,
} from "redux-saga/effects";

import auth, {
  setApiLoaded,
  getQueryId,
  getUserId,
  getToken,
} from "../slices/auth";

import api from "../../lib/api";
import get from "lodash/get";
import { setPassword } from "../actions";

function* authorize() {
  if (process.env.NODE_ENV === "development") {
    yield put(
      auth.actions.setAuthorized({
        userId: 1,
        queryId: "query-id",
        token: "123",
        firstName: "Дмитрий",
        lastName: "Андреевич",
      })
    );
  } else {
    try {
      const initData = get(
        window,
        ["Telegram", "WebApp", "initDataUnsafe"],
        {}
      );

      const queryId = get(initData, ["query_id"], "query-id");
      const userId = get(initData, ["user", "id"], 0);
      const firstName = get(initData, ["user", "first_name"], "");
      const lastName = get(initData, ["user", "last_name"], "");

      yield put(auth.actions.setAuthorizing());

      const {
        data: { token },
      } = yield call([api, api.post], "/admin/auth", {
        data: initData,
      });

      yield put(
        auth.actions.setAuthorized({
          userId,
          queryId,
          token,
          firstName,
          lastName,
        })
      );
    } catch (_) {
      yield put(auth.actions.setUnauthorized());
    }
  }
}

function* updatePassword({ payload: { key, type, password } }) {
  const token = yield select(getToken);
  const userId = yield select(getUserId);
  const queryId = yield select(getQueryId);

  try {
    yield call([api, api.post], "/admin/passwords", {
      key,
      type,
      password,
      queryId,
      userId,
      token,
    });
  } catch (_) {
  } finally {
    get(window, ["Telegram", "WebApp", "close"], function () {
      console.log("close webapp");
    })();
  }
}

export default function* root() {
  yield all([
    takeLeading(setApiLoaded, authorize),
    takeLeading(setPassword, updatePassword),
  ]);
}
