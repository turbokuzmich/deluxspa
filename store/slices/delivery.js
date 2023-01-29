import { createSelector, createSlice } from "@reduxjs/toolkit";
import fromPairs from "lodash/fromPairs";
import property from "lodash/property";

const geoCodingStatuses = ["initial", "failed", "insufficient", "ok"];
export const GeoCodingStatus = fromPairs(
  geoCodingStatuses.map((status) => [status, status])
);

export const getDelivery = (state) => state.delivery;

export const getDeliveryAddress = createSelector(
  getDelivery,
  property("address")
);

export const getDeliveryAddressSuggestions = createSelector(
  getDelivery,
  property("addressSuggestions")
);

export const getDeliveryPhone = createSelector(getDelivery, property("phone"));
export const getDeliveryEmail = createSelector(getDelivery, property("email"));
export const getDeliveryComment = createSelector(
  getDelivery,
  property("comment")
);

export const getDeliveryFormValues = createSelector(
  getDeliveryPhone,
  getDeliveryEmail,
  getDeliveryComment,
  (phone, email, comment) => ({ phone, email, comment })
);

export default createSlice({
  name: "delivery",

  initialState: {
    isAPILoaded: false,

    phone: "",
    email: "",
    comment: "",

    address: null,
    addressInput: "",
    addressSuggestions: [],

    geocodingStatus: GeoCodingStatus.initial,
    lat: null,
    lng: null,
  },
  reducers: {
    apiLoaded(state) {
      state.isAPILoaded = true;
    },
    changeAddressInput(state, { payload }) {
      state.addressInput = payload;
      state.geocodingStatus = GeoCodingStatus.initial;
    },
    setAddress(state, { payload }) {
      state.address = payload;
    },
    setAddressSuggestions(state, { payload }) {
      state.addressSuggestions = payload;
    },
    setGeocodingStatus(state, { payload }) {
      state.geocodingStatus = payload;
    },
    setCoordinates(state, { payload }) {
      const [lat, lng] = payload;

      state.lat = lat;
      state.lng = lng;
    },
  },
});
