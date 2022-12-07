import { createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";
import get from "lodash/get";

export const getDelivery = (state) => state.delivery;
export const getDeliveryType = createSelector(getDelivery, property("type"));
export const getDeliveryAddressInput = createSelector(
  getDelivery,
  property("addressInput")
);
export const getDeliveryCalculationResult = createSelector(
  getDelivery,
  ({ sum, min, max }) => ({ sum, min, max })
);
const getDeliveryLat = createSelector(getDelivery, ({ lat }) => lat);
const getDeliveryLng = createSelector(getDelivery, ({ lng }) => lng);
export const getDeliveryCoordinates = createSelector(
  getDeliveryLat,
  getDeliveryLng,
  (lat, lng) => ({ lat, lng })
);
export const getDeliveryAddress = createSelector(
  getDelivery,
  property("address")
);
export const getDeliveryCity = createSelector(getDelivery, property("city"));
export const getDeliveryCityName = createSelector(getDeliveryCity, (city) =>
  get(city, "label", "")
);
const tempDeliveryCityCoordinates = { lat: 56.092356, lng: 38.185341 };
export const getDeliveryCityCoordinates = createSelector(
  getDeliveryCity,
  (city) =>
    city
      ? { lat: city.latitude, lng: city.longitude }
      : tempDeliveryCityCoordinates
);
export const getDeliveryAddressSuggestions = createSelector(
  getDelivery,
  property("addressSuggestions")
);
export const getDeliveryCitySuggestions = createSelector(
  getDelivery,
  property("citySuggestions")
);
export const getGeocodingStatus = createSelector(
  getDelivery,
  property("geocodingStatus")
);
export const getCalculationStatus = createSelector(
  getDelivery,
  property("calculationStatus")
);
export const getDeliveryPoints = createSelector(
  getDelivery,
  property("deliveryPoints")
);
export const getDeliveryPointsStatus = createSelector(
  getDelivery,
  property("deliveryPointsStatus")
);
export const getDeliveryPoint = createSelector(
  getDelivery,
  property("deliveryPoint")
);
export const isDialogVisible = createSelector(
  getDelivery,
  property("isDialogVisible")
);

export default createSlice({
  name: "delivery",

  initialState: {
    type: "store", // store | home

    isAPILoaded: false,

    address: null,
    addressInput: "",
    addressSuggestions: [],

    geocodingStatus: "initial", // failed | insufficient | ok
    lat: null,
    lng: null,

    city: null,
    cityInput: "",
    citySuggestions: [],

    calculationStatus: "initial", // calculating | failed | ok
    sum: null,
    min: null,
    max: null,

    isDialogVisible: false, // диалог выбора ПВЗ

    deliveryPoint: null,
    deliveryPoints: [],
    deliveryPointsStatus: "initial", // fetching | failed | ok
  },

  reducers: {
    apiLoaded(state) {
      state.isAPILoaded = true;
    },
    changeAddressInput(state, { payload }) {
      state.addressInput = payload;
      state.geocodingStatus = "initial";
    },
    changeCityInput(state, { payload }) {
      state.cityInput = payload;
    },
    setAddressSuggestions(state, { payload }) {
      state.addressSuggestions = payload;
    },
    setCitySuggestions(state, { payload }) {
      state.citySuggestions = payload;
    },
    setAddress(state, { payload }) {
      state.address = payload;
    },
    setCity(state, { payload }) {
      state.city = payload;
      state.deliveryPoints = [];
      state.deliveryPointsStatus = "initial";
    },
    setGeocodingStatus(state, { payload }) {
      state.geocodingStatus = payload;
    },
    setCoordinates(state, { payload }) {
      const [lat, lng] = payload;

      state.lat = lat;
      state.lng = lng;
    },
    setType(state, { payload }) {
      state.type = payload;
    },
    setCalculationResult(state, { payload: { sum, min, max } }) {
      state.calculationStatus = "ok";
      state.sum = sum;
      state.min = min;
      state.max = max;
    },
    showDialog(state) {
      state.isDialogVisible = true;
    },
    hideDialog(state) {
      state.isDialogVisible = false;
    },
    setDeliveryPointsStatus(state, { payload }) {
      state.deliveryPointsStatus = payload;
    },
    setDeliveryPoints(state, { payload }) {
      state.deliveryPoints = payload;
    },
    setDeliveryPoint(state, { payload }) {
      state.deliveryPoint = payload;
      state.calculationStatus = "calculating";
    },
  },
});
