import cartSlice from "../slices/cart";
import ordersSlice from "../slices/orders";
import api from "../../lib/frontend/api";
import { all, call, put, takeLatest, takeLeading } from "redux-saga/effects";

export function* fetchCartSaga() {
  const { data } = yield call([api, api.get], "/cart");

  yield put(cartSlice.actions.fetchComplete(data));
}

export function* changeItemSaga({ payload }) {
  const { id } = payload;

  try {
    const {
      data: { items },
    } = yield call([api, api.post], "/cart", payload);

    yield put(cartSlice.actions.changeItemComplete({ id, items }));
  } catch (_) {}
}

export function* checkoutSaga() {
  yield call([api, api.post], "/cart/checkout");
  yield put(cartSlice.actions.checkoutComplete());
}

export function* fetchOrders() {
  const { data: orders } = yield call([api, api.get], "/orders");
  yield put(ordersSlice.actions.fetchOrdersComplete(orders));
}

export default function* rootSaga() {
  yield all([
    takeLeading(cartSlice.actions.checkout, checkoutSaga),
    takeLatest(ordersSlice.actions.fetchOrders, fetchOrders),
    takeLatest(cartSlice.actions.fetch, fetchCartSaga),
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
  ]);

  // load cart items on start
  yield put(cartSlice.actions.fetch());
}
