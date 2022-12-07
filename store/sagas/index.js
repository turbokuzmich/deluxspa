import { getSession } from "next-auth/react";
import get from "lodash/get";
import api from "../../lib/frontend/api";
import cartSlice from "../slices/cart";
import ordersSlice from "../slices/orders";
import deliverySlice, {
  getDeliveryCity,
  getDeliveryType,
  getDeliveryPoint,
  getDeliveryAddress,
  getDeliveryCoordinates,
  getDeliveryPointsStatus,
} from "../slices/delivery";
import {
  all,
  call,
  put,
  race,
  take,
  spawn,
  cancel,
  select,
  takeLatest,
  takeLeading,
  debounce,
} from "redux-saga/effects";

export function* fetchCartSaga() {
  const session = yield call(getSession);

  if (session !== null) {
    const { data } = yield call([api, api.get], "/cart");

    yield put(cartSlice.actions.fetchComplete(data));
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
    return yield put(deliverySlice.actions.setAddressSuggestions([]));
  }

  const addressSuggestions = yield call([ymaps, ymaps.suggest], input);

  yield put(
    deliverySlice.actions.setAddressSuggestions(
      addressSuggestions.map(({ displayName: label, value }) => ({
        label,
        value,
      }))
    )
  );
}

export function* fetchCitySuggestions({ payload: input }) {
  if (input.length === 0) {
    return yield put(deliverySlice.actions.setCitySuggestions([]));
  }

  const { data: citySuggestions } = yield call(
    [api, api.get],
    "/delivery/cities",
    {
      params: { city: input },
    }
  );

  yield put(
    deliverySlice.actions.setCitySuggestions(
      citySuggestions.map(({ id, name, region, latitude, longitude }) => ({
        value: id,
        label: `${name} (${region})`,
        latitude,
        longitude,
      }))
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
  const deliveryPoint = yield select(getDeliveryPoint);

  if (type === "store" && !deliveryPoint) {
    // FIXME поругаться
  }

  const address = yield select(getDeliveryAddress);
  const coordinates = yield select(getDeliveryCoordinates);

  const baseParams = {
    type,
    address,
    coordinates,
  };

  const calculationParams =
    type === "store"
      ? {
          ...baseParams,
          company: deliveryPoint.type,
          point_id: deliveryPoint.externalId,
        }
      : baseParams;

  const response = yield call(
    [api, api.post],
    "/delivery/calculate",
    calculationParams
  );

  const sum = get(response, "data.total_sum", null);
  const min = get(response, "data.period_min", null);
  const max = get(response, "data.period_max", null);

  yield put(deliverySlice.actions.setCalculationResult({ sum, min, max }));
}

function* fetchDeliveryPoints() {
  yield put(deliverySlice.actions.setDeliveryPointsStatus("fetching"));

  const { value } = yield select(getDeliveryCity);
  const { data } = yield call([api, api.get], "/delivery/points", {
    params: { city: value },
  });

  yield put(deliverySlice.actions.setDeliveryPoints(data));
  yield put(deliverySlice.actions.setDeliveryPointsStatus("ok"));
}

export function* watchDeliveryPoints() {
  let task = null;

  while (true) {
    const { open, city } = yield race({
      open: take(deliverySlice.actions.showDialog),
      city: take(deliverySlice.actions.setCity),
    });

    if (city) {
      if (task && task.isRunning()) {
        yield cancel(task);
      }

      continue;
    }

    if (open) {
      const status = yield select(getDeliveryPointsStatus);

      if (!task || status === "initial") {
        task = yield spawn(fetchDeliveryPoints);
      }
    }
  }
}

export default function* rootSaga() {
  yield all([
    takeLeading(cartSlice.actions.checkout, checkoutSaga),
    takeLatest(ordersSlice.actions.fetchOrders, fetchOrders),
    takeLatest(cartSlice.actions.fetch, fetchCartSaga),
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
    debounce(
      300,
      deliverySlice.actions.changeAddressInput,
      fetchAddressSuggestions
    ),
    debounce(300, deliverySlice.actions.changeCityInput, fetchCitySuggestions),
    takeLatest(deliverySlice.actions.setAddress, geocodeAddress),
    takeLatest(deliverySlice.actions.setDeliveryPoint, calculateDelivery),
  ]);

  // load delivery points on first modal open
  yield spawn(watchDeliveryPoints);

  // load cart items on start
  yield put(cartSlice.actions.fetch());
}
