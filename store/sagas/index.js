import cartSlice from "../slices/cart";
import api from "../../lib/frontend/api";
import { all, call, put, takeLatest } from "redux-saga/effects";

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

export default function* rootSaga() {
  yield all([
    takeLatest(cartSlice.actions.fetch, fetchCartSaga),
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
  ]);

  // load cart items on start
  yield put(cartSlice.actions.fetch());
}
