import { createSelector, createAction, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const setApiLoaded = createAction("auth/setApiLoaded");

export const getAuth = property("auth");
export const getAuthState = createSelector(getAuth, property("state"));
export const getUserName = createSelector(getAuth, property("firstName"));

export default createSlice({
  name: "auth",
  initialState: {
    state: "initial", // authorizing | authorized | unauthorized
    token: null,
    firstName: "",
    lastName: "",
  },
  reducers: {
    setAuthorized(state, { payload: { token, firstName, lastName } }) {
      state.state = "authorized";
      state.token = token;
      state.firstName = firstName;
      state.lastName = lastName;
    },
    setAuthorizing(state) {
      state.state = "authorizing";
    },
    setUnauthorized(state) {
      state.state = "unauthorized";
    },
  },
});
