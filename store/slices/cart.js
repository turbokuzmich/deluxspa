import { createSelector, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { getItemById } from "../../lib/helpers/catalog";
import property from "lodash/property";

export const getCart = (state) => state.cart;
export const getCartItems = createSelector(getCart, (cart) => cart.items);
export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("quantity")).reduce((count, qty) => count + qty, 0)
);
export const isChangingItem = (id) => (state) =>
  Boolean(state.cart.changingItems[id]);
export const getCartSubtotal = createSelector(getCartItems, (items) =>
  items.reduce(
    (subtotal, { id, quantity }) => subtotal + getItemById(id).price * quantity,
    0
  )
);

export default createSlice({
  name: "cart",
  initialState: {
    isCheckouting: false,
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
        state.items[index].quantity = append
          ? state.items[index].quantity + qty
          : qty;
      } else {
        state.items.push({ id, quantity: qty });
      }
    },
    changeItemComplete(state, { payload: { id, items } }) {
      state.changingItems[id] = false;
      state.items = items;
    },
    checkout(state) {
      state.isCheckouting = true;
    },
    checkoutComplete(state) {
      state.isCheckouting = false;
      state.isFetching = false;
      state.items = [];
      state.changingItems = {};
    },
  },
  extraReducers: {
    [HYDRATE]: (state) => {
      return { ...state };
    },
  },
});
