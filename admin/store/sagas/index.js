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
  takeEvery,
} from "redux-saga/effects";

import auth, {
  setApiLoaded,
  getQueryId,
  getUserId,
  getToken,
} from "../slices/auth";

import orders, {
  getOrdersData,
  getOrdersFilter,
  updateOrderStatus,
} from "../slices/orders";

import ui from "../slices/ui";
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

function* updatePassword({ payload }) {
  const token = yield select(getToken);
  const userId = yield select(getUserId);

  try {
    yield put(ui.actions.setFetching());
    yield call([api, api.post], "/admin/passwords", {
      ...payload,
      userId,
      token,
    });
  } catch (_) {
  } finally {
    yield put(ui.actions.setFetching(false));
    get(window, ["Telegram", "WebApp", "close"], function () {
      console.log("close webapp");
    })();
  }
}

function* fetchOrders() {
  try {
    const token = yield select(getToken);
    const filter = yield select(getOrdersFilter);

    const base = { token };

    const { data: list } = yield call([api, api.get], "/admin/orders", {
      params: filter === null ? base : { ...base, filter },
    });

    yield put(orders.actions.fetchListSuccess(list));
  } catch (_) {
    yield put(orders.actions.fetchListFail());
  } finally {
  }
}

function* fetchOrder({ payload: id }) {
  const ordersData = yield select(getOrdersData);

  if (id in ordersData) {
    yield put(orders.actions.fetchOrderSucces(ordersData[id]));
  } else {
    try {
      const token = yield select(getToken);

      const { data: order } = yield call([api, api.get], "/admin/orders", {
        params: {
          id,
          token,
        },
      });

      yield put(orders.actions.fetchOrderSucces(order));
    } catch (_) {
      yield put(orders.actions.fetchOrderFail(id));
    }
  }
}

function* setOrderStatus({ payload: { id, status } }) {
  const token = yield select(getToken);
  const ordersData = yield select(getOrdersData);
  const orderStatus = get(ordersData, [id, "status"]);

  if (status !== orderStatus) {
    try {
      const { data: order } = yield call(
        [api, api.post],
        "/admin/orders",
        { status },
        { params: { id, token } }
      );

      yield put(orders.actions.fetchOrderSucces(order));
    } catch (error) {
      yield put(orders.actions.setOrderStatus({ id, orderStatus }));
    }
  }
}

export default function* root() {
  yield all([
    takeLeading(setApiLoaded, authorize),
    takeLeading(setPassword, updatePassword),
    takeEvery(orders.actions.fetchOrder, fetchOrder),
    takeEvery(updateOrderStatus, setOrderStatus),
    takeLatest(
      [orders.actions.fetchList, orders.actions.setFilter],
      fetchOrders
    ),
  ]);
}
