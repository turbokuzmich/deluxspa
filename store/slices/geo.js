import { createSlice, createSelector } from "@reduxjs/toolkit";
import property from "lodash/property";

export const getGeo = property("geo");
export const isAPILoaded = createSelector(getGeo, property("apiLoaded"));
export const getUserCity = createSelector(getGeo, property("userCity"));

export default createSlice({
  name: "geo",
  initialState: {
    apiLoaded: false,
    userCity: null,
    userLatitude: null,
    userLongitude: null,
  },
  reducers: {
    setAPILoaded(state) {
      state.apiLoaded = true;
    },
    setUserLocation(state, { payload: { latitude, longitude } }) {
      state.userLatitude = latitude;
      state.userLongitude = longitude;
    },
    setUserCity(state, { payload }) {
      state.userCity = payload;
    },
  },
});
