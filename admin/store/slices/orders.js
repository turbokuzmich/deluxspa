import { createSelector, createSlice, createAction } from "@reduxjs/toolkit";
import property from "lodash/property";
import get from "lodash/get";
import keyBy from "lodash/keyBy";

export const getOrders = property("orders");
export const getOrdersList = createSelector(getOrders, property("list"));
export const getOrdersIds = createSelector(getOrders, property("id"));
export const getOrdersState = createSelector(getOrders, property("state"));
export const getOrdersError = createSelector(getOrders, property("error"));
export const getOrdersSelected = createSelector(
  getOrders,
  property("selected")
);
export const getOrder = createSelector(
  getOrdersIds,
  getOrdersSelected,
  (ids, selected) => get(ids, selected)
);

export default createSlice({
  name: "orders",
  initialState: {
    id: {},
    list: [],
    state: "initial", // fetching | fetched | failed
    selected: null,
    error: "",
  },
  reducers: {
    fetch(state) {
      state.state = "fetching";
    },
    fetchSuccess(state, { payload }) {
      state.state = "fetched";
      state.list = payload;
      state.id = keyBy(payload, property("id"));
      state.error = "";
    },
    fetchFail(state) {
      state.state = "error";
      state.list = [];
      state.error = "Ошибка при получении заказов";
    },
    setOrder(state, { payload }) {
      if (payload === null || payload in state.id) {
        state.selected = payload;
      } else {
        state.selected = null;
      }
    },
  },
});
