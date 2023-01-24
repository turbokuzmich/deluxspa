import api from "../../lib/frontend/api";
import cartSlice from "../slices/cart";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getItemsSaga() {
  try {
    yield put(cartSlice.actions.fetch());

    const {
      data: { items },
    } = yield call([api, api.get], "/cart");

    yield put(cartSlice.actions.fetchComplete({ items }));
  } catch (_) {
    yield put(cartSlice.actions.fetchComplete({ items: [] }));
  }
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
  yield all([takeLatest(cartSlice.actions.changeItem, changeItemSaga)]);

  yield call(getItemsSaga);
}
