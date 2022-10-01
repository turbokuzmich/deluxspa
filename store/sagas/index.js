import get from "lodash/get";
import api from "../../lib/frontend/api";
import cartSlice from "../slices/cart";
import ordersSlice from "../slices/orders";
import deliverySlice, {
  getDeliveryType,
  getDeliveryAddress,
  getDeliveryCoordinates,
} from "../slices/delivery";
import {
  all,
  call,
  put,
  select,
  takeLatest,
  takeLeading,
  debounce,
} from "redux-saga/effects";

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

export function* fetchAddressSuggestions({ payload: input }) {
  if (input.length === 0) {
    return yield put(deliverySlice.actions.setSuggestions([]));
  }

  const suggestions = yield call([ymaps, ymaps.suggest], input);

  yield put(
    deliverySlice.actions.setSuggestions(
      suggestions.map(({ displayName: label, value }) => ({ label, value }))
    )
  );
}

export function* geocodeAddress() {
  const address = yield select(getDeliveryAddress);
  const response = yield call([ymaps, ymaps.geocode], address);
  const geo = response.geoObjects.get(0);

  if (!geo) {
    // TODO показывать ошибку
    return;
  }

  const precision = geo.properties.get(
    "metaDataProperty.GeocoderMetaData.precision"
  );

  if (precision === "exact") {
    yield put(deliverySlice.actions.setGeocodingStatus("ok"));
    yield put(
      deliverySlice.actions.setCoordinates(
        ymaps.util.bounds.getCenter(geo.properties.get("boundedBy"))
      )
    );
  } else {
    yield put(deliverySlice.actions.setGeocodingStatus("insufficient"));
  }
}

export function* calculateDelivery() {
  const type = yield select(getDeliveryType);
  const address = yield select(getDeliveryAddress);
  const coordinates = yield select(getDeliveryCoordinates);

  const response = yield call([api, api.post], "/delivery/calculate", {
    type,
    address,
    coordinates,
  });

  const sum = get(response, "data.total_sum", null);
  const min = get(response, "data.period_min", null);
  const max = get(response, "data.period_max", null);

  yield put(deliverySlice.actions.setCalculationResult({ sum, min, max }));
}

export default function* rootSaga() {
  yield all([
    takeLeading(cartSlice.actions.checkout, checkoutSaga),
    takeLatest(ordersSlice.actions.fetchOrders, fetchOrders),
    takeLatest(cartSlice.actions.fetch, fetchCartSaga),
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
    debounce(300, deliverySlice.actions.changeInput, fetchAddressSuggestions),
    takeLatest(deliverySlice.actions.setAddress, geocodeAddress),
    takeLatest(deliverySlice.actions.calculate, calculateDelivery),
  ]);

  // load cart items on start
  yield put(cartSlice.actions.fetch());
}
