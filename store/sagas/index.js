import api from "../../lib/frontend/api";
import cartSlice from "../slices/cart";
import deliverySlice, {
  getDeliveryAddress,
  getDeliveryInfo,
} from "../slices/delivery";
import {
  all,
  call,
  put,
  select,
  debounce,
  takeLatest,
} from "redux-saga/effects";

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

export function* handlePayment() {
  const info = yield select(getDeliveryInfo);

  const {
    data: { url },
  } = yield call([api, api.post], "/checkout", info);

  location.href = url;
}

export function* fetchCdekCitiesSuggestions({ payload: title }) {
  if (title.length === 0) {
    return yield put(deliverySlice.actions.setCitySuggestions([]));
  }

  const { data: citySuggestions } = yield call([api, api.get], "/cdek/cities", {
    params: {
      title,
    },
  });

  yield put(
    deliverySlice.actions.setCitySuggestions(
      citySuggestions.map((city) => ({
        ...city,
        label: `${city.city}, ${city.region}`,
        value: city.code,
      }))
    )
  );
}

export function* fetchCdekPointsSuggestions({ payload: city }) {
  if (city === null) {
    return;
  }

  const { data: points } = yield call([api, api.get], "/cdek/points", {
    params: { city: city.code },
  });

  yield put(deliverySlice.actions.setPoints(points));
}

export function* calculateCdekTariff({ payload: point }) {
  if (point === null) {
    return;
  }

  const { data: calculation } = yield call([api, api.get], "/cdek/calculate", {
    params: {
      code: point.location.city_code,
      address: point.location.address_full,
    },
  });

  yield put(deliverySlice.actions.setCalculation(calculation));
}

export default function* rootSaga() {
  yield all([
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
    takeLatest(cartSlice.actions.toPayment, handlePayment),
    debounce(
      300,
      deliverySlice.actions.changeAddressInput,
      fetchAddressSuggestions
    ),
    takeLatest(deliverySlice.actions.setAddress, geocodeAddress),
    debounce(
      300,
      deliverySlice.actions.changeTitleInput,
      fetchCdekCitiesSuggestions
    ),
    takeLatest(deliverySlice.actions.setCity, fetchCdekPointsSuggestions),
    takeLatest(deliverySlice.actions.setPoint, calculateCdekTariff),
  ]);

  yield call(getItemsSaga);
}
