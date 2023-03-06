import { createSelector, createAction, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const setApiLoaded = createAction("auth/setApiLoaded");

export const getAuth = property("auth");
export const getAuthState = createSelector(getAuth, property("state"));
export const getUserName = createSelector(getAuth, property("firstName"));
export const getQueryId = createSelector(getAuth, property("queryId"));
export const getUserId = createSelector(getAuth, property("userId"));
export const getToken = createSelector(getAuth, property("token"));

export default createSlice({
  name: "auth",
  initialState: {
    state: "initial", // authorizing | authorized | unauthorized
    queryId: "",
    userId: 0,
    token: null,
    firstName: "",
    lastName: "",
  },
  reducers: {
    setAuthorized(
      state,
      { payload: { userId, queryId, token, firstName, lastName } }
    ) {
      state.state = "authorized";
      state.userId = userId;
      state.queryId = queryId;
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
