import cartSlice, { getCartItems } from "../slices/cart";
import api from "../../lib/frontend/api";
import { all, delay, call, put, select, takeLatest } from "redux-saga/effects";

export function* fetchCartSaga() {
  const { data } = yield call([api, api.get], "/cart");

  yield put(cartSlice.actions.fetchComplete(data));
}

export function* changeItemSaga({ payload: { id } }) {
  const items = yield select(getCartItems);

  yield delay(2000);
  yield put(cartSlice.actions.changeItemComplete({ id, items }));
}

export default function* rootSaga() {
  yield all([
    takeLatest(cartSlice.actions.fetch, fetchCartSaga),
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
  ]);

  // load cart items on start
  yield put(cartSlice.actions.fetch());
}
