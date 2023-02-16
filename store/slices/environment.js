import { createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const getEnvironmentSlice = property("environment");
export const getIsOnline = createSelector(
  getEnvironmentSlice,
  property("online")
);
export const getIsVisible = createSelector(
  getEnvironmentSlice,
  property("visible")
);

export default createSlice({
  name: "environment",
  initialState: {
    visible: false,
    online: false,
  },
  reducers: {
    setVisibility(state, { payload }) {
      state.visible = payload;
    },
    setOnline(state, { payload }) {
      state.online = payload;
    },
  },
});
