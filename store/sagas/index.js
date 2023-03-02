import api from "../../lib/frontend/api";
import get from "lodash/get";
import geoSlice, { isAPILoaded, getUserCity } from "../slices/geo";
import cartSlice from "../slices/cart";
import deliverySlice, {
  getDeliveryCity,
  getDeliveryAddress,
  getDeliveryInfo,
} from "../slices/delivery";
import feedbackSlice from "../slices/feedback";
import { getIsOnline, getIsVisible } from "../slices/environment";
import notificationsSlice, {
  checkNotifications,
  showSuccessNotification,
  showErrorNotification,
  getAutoHideNotifications,
  getDueNotifications,
} from "../slices/notifications";
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
  } catch (_) {
    yield put(showErrorNotification("Не удалось изменить количество товара"));
  }
}

export function* maybeSetDeliveryCity() {
  const userCity = yield select(getUserCity);
  const deliveryCity = yield select(getDeliveryCity);

  const userCityCode = get(userCity, "code", -1);
  const deliveryCityCode = get(deliveryCity, "code", -2);

  if (userCity && userCityCode !== deliveryCityCode) {
    const city = {
      ...userCity,
      label: `${userCity.city}, ${userCity.region}`,
      value: userCity.code,
    };

    yield put(deliverySlice.actions.changeTitleInput(city.label));
    yield put(deliverySlice.actions.setCitySuggestions([city]));
    yield put(deliverySlice.actions.setCity(city));
  }
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
    return yield put(showErrorNotification("Не удалось проверить адрес."));
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
  try {
    const info = yield select(getDeliveryInfo);

    const {
      data: { url },
    } = yield call([api, api.post], "/checkout", info);

    location.href = url;
  } catch (_) {
    yield put(
      showErrorNotification(
        "Возникла ошибка при оплате. Пожалуйста, попробуйте позже."
      )
    );
  }
}

export function* fetchCdekCitiesSuggestions({ payload: title }) {
  if (title.length === 0) {
    return yield put(deliverySlice.actions.setCitySuggestions([]));
  }

  try {
    const { data: citySuggestions } = yield call(
      [api, api.get],
      "/cdek/cities",
      {
        params: {
          title,
        },
      }
    );

    yield put(
      deliverySlice.actions.setCitySuggestions(
        citySuggestions.map((city) => ({
          ...city,
          label: `${city.city}, ${city.region}`,
          value: city.code,
        }))
      )
    );
  } catch (_) {
    yield put(
      showErrorNotification("Не удалось загрузить список городов доставки.")
    );
  }
}

export function* fetchCdekPointsSuggestions({ payload: city }) {
  if (city === null) {
    return;
  }

  try {
    const { data: points } = yield call([api, api.get], "/cdek/points", {
      params: { city: city.code },
    });

    yield put(deliverySlice.actions.setPoints(points));
  } catch (_) {
    yield put(showErrorNotification("Не удалось найти пункты выдачи заказов."));
  }
}

export function* calculateCdekTariff({ payload: point }) {
  if (point === null) {
    return;
  }

  try {
    const { data: calculation } = yield call(
      [api, api.get],
      "/cdek/calculate",
      {
        params: {
          code: point.location.city_code,
          address: point.location.address_full,
        },
      }
    );

    yield put(deliverySlice.actions.setCalculation(calculation));
  } catch (_) {
    yield put(showErrorNotification("Не удалось рассчитать доставку."));
  }
}

export function* sendFeedback({ payload }) {
  yield put(feedbackSlice.actions.send());

  try {
    yield call([api, api.post], "/feedback", payload);
    yield put(feedbackSlice.actions.sent());
    yield put(
      showSuccessNotification("Сообщение отправлено. Мы скоро вам ответим!")
    );
  } catch (error) {
    yield put(
      showErrorNotification(
        "Что-то пошло не так. Пожалуйста, попробуйте позже."
      )
    );
    yield put(feedbackSlice.actions.failed());
  } finally {
    yield delay(2000);
    yield put(feedbackSlice.actions.reset());
  }
}

function* destroyDueNotifications() {
  const notifications = yield select(getDueNotifications);

  for (const notification of notifications) {
    yield put(notificationsSlice.actions.silentlyRemove(notification.id));
  }

  yield delay(1000);
  yield put(checkNotifications());
}

function* setDestroyTimeout(timeout) {
  yield delay(timeout);

  if (!(yield cancelled())) {
    yield call(destroyDueNotifications);
  }
}

export function* watchNotifications() {
  let destroyTimerTask = null;

  while (true) {
    yield take([
      notificationsSlice.actions.add,
      notificationsSlice.actions.remove,
      showSuccessNotification,
      showErrorNotification,
      checkNotifications,
    ]);

    const now = Date.now();
    const autoHideNotifications = yield select(getAutoHideNotifications);

    if (autoHideNotifications.length === 0) {
      continue;
    }

    if (destroyTimerTask) {
      yield cancel(destroyTimerTask);
    }

    const checkTimeout = autoHideNotifications.reduce(
      (timeout, notification) => {
        const notificationTimeout =
          notification.at + notification.autoHide - now + 20;

        return notificationTimeout < timeout ? notificationTimeout : timeout;
      },
      Infinity
    );

    if (checkTimeout <= 0) {
      yield call(destroyDueNotifications);
    } else {
      destroyTimerTask = yield spawn(setDestroyTimeout, checkTimeout);
    }
  }
}

export function* watchSession() {
  const checkInterval = parseInt(
    process.env.NEXT_PUBLIC_API_SESSION_CHECK_INTERVAL,
    10
  );

  while (true) {
    if ((yield select(getIsVisible)) === false) {
      yield delay(checkInterval);

      continue;
    }

    if ((yield select(getIsOnline)) === false) {
      yield delay(checkInterval);

      continue;
    }

    try {
      const {
        data: { responds },
      } = yield call([api, api.get], "/feedback");

      if (responds.length) {
        yield call([api, api.delete], "/feedback", {
          params: {
            key: responds.map(({ key }) => key).join(","),
          },
        });

        for (const response of responds) {
          yield put(
            showSuccessNotification(response.response, false, {
              title: response.message,
            })
          );
        }
      }
    } catch (error) {}

    yield delay(checkInterval);
  }
}

export function* waitMapsApi() {
  const isLoaded = yield select(isAPILoaded);

  if (!isLoaded) {
    yield take(geoSlice.actions.setAPILoaded);
  }
}

export function* findNearestCity() {
  yield call(waitMapsApi);

  const {
    geoObjects: {
      position: [latitude, longitude],
    },
  } = yield ymaps.geolocation.get({
    provider: "browser",
  });

  yield put(geoSlice.actions.setUserLocation({ latitude, longitude }));

  const { data: city } = yield call([api, api.get], "/cdek/nearest", {
    params: {
      lat: latitude,
      lng: longitude,
    },
  });

  yield put(geoSlice.actions.setUserCity(city));
}

export default function* rootSaga() {
  yield all([
    takeLatest(cartSlice.actions.changeItem, changeItemSaga),
    takeLatest(cartSlice.actions.toDelivery, maybeSetDeliveryCity),
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
    takeLeading(feedbackSlice.actions.submit, sendFeedback),
  ]);

  yield call(getItemsSaga);

  yield spawn(watchNotifications);
  yield spawn(watchSession);
  yield spawn(findNearestCity);
}
