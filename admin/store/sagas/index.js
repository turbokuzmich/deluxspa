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

import api from "../../lib/api";
import get from "lodash/get";
import auth, { setApiLoaded } from "../slices/auth";

function* authorize() {
  if (process.env.NODE_ENV === "development") {
    yield put(
      auth.actions.setAuthorized({
        token: "123",
        firstName: "Дмитрий",
      })
    );
  } else {
    try {
      const initData = get(
        window,
        ["Telegram", "WebApp", "initDataUnsafe"],
        {}
      );

      const id = get(initData, ["user", "id"], 0);
      const firstName = get(initData, ["user", "first_name"], "");
      const lastName = get(initData, ["user", "last_name"], "");

      yield put(auth.actions.setAuthorizing());

      const {
        data: { token },
      } = yield call([api, api.post], "/admin/auth", {
        data: initData,
      });

      yield put(auth.actions.setAuthorized({ id, token, firstName, lastName }));
    } catch (_) {
      yield put(auth.actions.setUnauthorized());
    }
  }
}

export default function* root() {
  yield all([takeLeading(setApiLoaded, authorize)]);
}