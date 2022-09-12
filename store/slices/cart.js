import { createSelector, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import property from "lodash/property";

export const getCart = (state) => state.cart;
export const getCartItems = createSelector(getCart, (cart) => cart.items);
export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("qty")).reduce((count, qty) => count + qty, 0)
);
export const isChangingItem = (id) => (state) =>
  Boolean(state.cart.changingItems[id]);

export default createSlice({
  name: "cart",
  initialState: {
    isFetching: false,
    items: [],
    changingItems: {},
  },
  reducers: {
    fetch(state) {
      state.isFetching = true;
    },
    fetchComplete(state, { payload: { items } }) {
      state.items = items;
      state.isFetching = false;
    },
    changeItem(state, { payload: { id, qty = 1, append = false } }) {
      state.changingItems[id] = true;

      const index = state.items.find(({ id: itemId }) => itemId === id);

      if (index > -1) {
        state.items[index].qty = append ? state.items[index].qty + qty : qty;
      } else {
        state.items.push({ id, qty });
      }
    },
    changeItemComplete(state, { payload: { id, items } }) {
      state.changingItems[id] = false;
      state.items = items;
    },
  },
  extraReducers: {
    [HYDRATE]: (state) => {
      return { ...state };
    },
  },
});
