import { createSelector, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import fromPairs from "lodash/fromPairs";

export const getOrders = (state) => state.orders;
export const getState = createSelector(getOrders, (orders) => orders.state);
export const getList = createSelector(getOrders, (orders) => orders.list);

export default createSlice({
  name: "orders",
  initialState: {
    state: "initial", // fetching | list
    list: [],
    byId: {},
  },
  reducers: {
    fetchOrders(state) {
      state.state = "fetching";
    },
    fetchOrdersComplete(state, { payload: orders }) {
      state.state = "list";
      state.list = orders;
      state.byId = fromPairs(orders.map((order) => [order.id, order]));
    },
  },
  extraReducers: {
    [HYDRATE]: (state) => {
      return { ...state };
    },
  },
});
