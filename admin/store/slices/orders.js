import { createAction, createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";
import keyBy from "lodash/keyBy";

export const getSlice = property("orders");

export const getOrdersIds = createSelector(getSlice, property("list"));
export const getOrdersData = createSelector(getSlice, property("id"));
export const getState = createSelector(getSlice, property("state"));
export const getOrdersListState = createSelector(getState, property("list"));
export const getOrdersViewState = createSelector(getState, property("view"));
export const getOrdersFilter = createSelector(getSlice, property("filter"));

export const updateOrderStatus = createAction("orders/updateOrderStatus");

export default createSlice({
  name: "orders",
  initialState: {
    id: {},
    list: [],

    filter: null,

    state: {
      list: "initial",
      view: {},
    },

    error: {
      list: null,
      view: {},
    },
  },
  reducers: {
    fetchList(state) {
      state.state.list = "fetching";
    },
    fetchListSuccess(state, { payload }) {
      state.state.list = "fetched";
      state.list = payload.map(property("id"));
      state.id = keyBy(payload, property("id"));
      state.error.list = null;
    },
    fetchListFail(state) {
      state.state.list = "failed";
      state.error.list = "Ошибка при получении заказов";
      state.list = [];
    },
    fetchOrder(state, { payload }) {
      state.state.view[payload] = "fetching";
    },
    fetchOrderSucces(state, { payload }) {
      state.state.view[payload.id] = "fetched";
      state.id[payload.id] = payload;
    },
    fetchOrderFail(state, { payload }) {
      state.state.view[payload] = "failed";
    },
    setOrderStatus(state, { payload: { id, status } }) {
      state.id[id].status = status;
    },
    setFilter(state, { payload }) {
      state.filter = payload;
      state.state.list = "fetching";
    },
  },
});
