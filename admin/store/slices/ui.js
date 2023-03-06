import { createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const getUi = property("uid");
export const isFetching = createSelector(getUi, property("fetching"));

export default createSlice({
  name: "ui",
  initialState: {
    fetching: false,
  },
  reducers: {
    setFetching(state, { payload = true }) {
      state.fetching = payload;
    },
  },
});
