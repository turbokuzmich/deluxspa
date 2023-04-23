import property from "lodash/property";
import { createSlice, createSelector } from "@reduxjs/toolkit";

export const getCdekSlice = property("cdek");

export const getCdekInfoSearch = createSelector(
  getCdekSlice,
  property("info.search")
);

export const getCdekInfoSearchStatus = createSelector(
  getCdekSlice,
  property("info.searchStatus")
);

export const getCdekInfoBindStatus = createSelector(
  getCdekSlice,
  property("info.bindStatus")
);

export const isCdekInfoSearchValid = createSelector(
  getCdekInfoSearch,
  (search) => search.trim().length > 0
);

export const getCdekOrder = createSelector(
  getCdekSlice,
  property("info.order")
);

export default createSlice({
  name: "cdek",
  initialState: {
    info: {
      search: "",
      order: null,
      searchStatus: "initial", // fetching | found | failed | notfound
      bindStatus: "initial", // binding | bound | failed
    },
  },
  reducers: {
    changeSearch(state, { payload }) {
      state.info.search = payload;
    },
    reset(state) {
      state.info.search = "";
      state.info.order = null;
      state.info.searchStatus = "initial";
      state.info.bindStatus = "initial";
    },
    failed(state) {
      state.info.searchStatus = "failed";
    },
    notFound(state) {
      state.info.searchStatus = "notfound";
    },
    found(state, { payload }) {
      state.info.searchStatus = "found";
      state.info.order = payload;
    },
    search(state) {
      state.info.searchStatus = "fetching";
    },
    bindOrder(state) {
      state.info.bindStatus = "binding";
    },
    bindFailed(state) {
      state.info.bindStatus = "failed";
    },
    bound(state) {
      state.info.bindStatus = "bound";
    },
  },
});
