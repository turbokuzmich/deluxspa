import { createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const getDelivery = (state) => state.delivery;
export const getDeliveryType = createSelector(getDelivery, property("type"));
export const getDeliveryInput = createSelector(getDelivery, property("input"));
export const getDeliveryCalculationResult = createSelector(
  getDelivery,
  ({ sum, min, max }) => ({ sum, min, max })
);
export const getDeliveryCoordinates = createSelector(
  getDelivery,
  ({ lat, lng }) => ({ lat, lng })
);
export const getDeliveryAddress = createSelector(
  getDelivery,
  property("address")
);
export const getDeliverySuggestions = createSelector(
  getDelivery,
  property("suggestions")
);
export const getGeocodingStatus = createSelector(
  getDelivery,
  property("geocodingStatus")
);
export const getCalculationStatus = createSelector(
  getDelivery,
  property("calculationStatus")
);

export default createSlice({
  name: "delivery",

  initialState: {
    isAPILoaded: false,
    address: null,
    input: "",
    suggestions: [],
    geocodingStatus: "initial", // failed | insufficient | ok
    lat: null,
    lng: null,
    type: "home", // store | home
    calculationStatus: "initial", // calculating | failed | ok
    sum: null,
    min: null,
    max: null,
  },

  reducers: {
    apiLoaded(state) {
      state.isAPILoaded = true;
    },
    changeInput(state, { payload }) {
      state.input = payload;
      state.geocodingStatus = "initial";
    },
    setSuggestions(state, { payload }) {
      state.suggestions = payload;
    },
    setAddress(state, { payload }) {
      state.address = payload;
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
    calculate(state) {
      state.calculationStatus = "calculating";
    },
    setCalculationResult(state, { payload: { sum, min, max } }) {
      state.calculationStatus = "ok";
      state.sum = sum;
      state.min = min;
      state.max = max;
    },
  },
});
