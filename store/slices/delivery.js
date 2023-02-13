import { createSelector, createSlice } from "@reduxjs/toolkit";
import fromPairs from "lodash/fromPairs";
import property from "lodash/property";

const geoCodingStatuses = ["initial", "failed", "insufficient", "ok"];
export const GeoCodingStatus = fromPairs(
  geoCodingStatuses.map((status) => [status, status])
);

export const getDelivery = (state) => state.delivery;

export const getDeliveryPhone = createSelector(getDelivery, property("phone"));
export const getDeliveryEmail = createSelector(getDelivery, property("email"));
export const getDeliveryLat = createSelector(getDelivery, property("lat"));
export const getDeliveryLng = createSelector(getDelivery, property("lng"));

export const getDeliveryAddress = createSelector(
  getDelivery,
  property("address")
);

export const getDeliveryAddressSuggestions = createSelector(
  getDelivery,
  property("addressSuggestions")
);

export const getDeliveryComment = createSelector(
  getDelivery,
  property("comment")
);

export const getDeliveryCity = createSelector(getDelivery, property("city"));
export const getDeliveryTitle = createSelector(getDelivery, property("title"));
export const getDeliveryPoint = createSelector(getDelivery, property("point"));
export const getDeliveryPointCode = createSelector(
  getDeliveryPoint,
  property("code")
);
export const getDeliveryPointName = createSelector(
  getDeliveryPoint,
  property("name")
);
export const getDeliveryPointLocation = createSelector(
  getDeliveryPoint,
  property("location")
);
export const getDeliveryPointCityCode = createSelector(
  getDeliveryPointLocation,
  property("city_code")
);
export const getDeliveryPointAddress = createSelector(
  getDeliveryPointLocation,
  property("address_full")
);
export const getDeliveryPointLatitude = createSelector(
  getDeliveryPointLocation,
  property("latitude")
);
export const getDeliveryPointLongitude = createSelector(
  getDeliveryPointLocation,
  property("longitude")
);
export const getDeliveryCalculation = createSelector(
  getDelivery,
  property("calculation")
);
export const getDeliveryPoints = createSelector(
  getDelivery,
  property("points")
);
export const getDeliveryCitySuggestions = createSelector(
  getDelivery,
  property("citySuggestions")
);

export const getDeliveryFormValues = createSelector(
  getDeliveryPhone,
  getDeliveryEmail,
  getDeliveryComment,
  (phone, email, comment) => ({ phone, email, comment })
);

export const getDeliveryInfo = createSelector(
  getDeliveryPhone,
  getDeliveryEmail,
  getDeliveryComment,
  getDeliveryPointCode,
  getDeliveryPointCityCode,
  getDeliveryPointName,
  getDeliveryPointAddress,
  getDeliveryPointLatitude,
  getDeliveryPointLongitude,
  (phone, email, comment, code, city, name, address, latitude, longitude) => ({
    phone,
    email,
    comment,
    code,
    city,
    name,
    address,
    latitude,
    longitude,
  })
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

    title: "",
    citySuggestions: [],
    city: null,
    points: [],
    point: null,
    calculation: null,
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
    setContactInfo(
      state,
      { payload: { phone = "", email = "", comment = "" } }
    ) {
      state.phone = phone;
      state.email = email;
      state.comment = comment;
    },
    changeTitleInput(state, { payload }) {
      state.city = null;
      state.points = [];
      state.point = null;
      state.calculation = null;
      state.title = payload;
    },
    setCity(state, { payload }) {
      state.city = payload;
      state.points = [];
      state.point = null;
      state.calculation = null;
    },
    setCitySuggestions(state, { payload }) {
      state.citySuggestions = payload;
      state.points = [];
      state.point = null;
      state.calculation = null;
    },
    setPoints(state, { payload }) {
      state.points = payload;
      state.point = null;
      state.calculation = null;
    },
    setPoint(state, { payload }) {
      state.point = payload;
      state.calculation = null;
    },
    setCalculation(state, { payload }) {
      state.calculation = payload;
    },
  },
});
