import { createSelector, createSlice } from "@reduxjs/toolkit";
import { getItemById } from "../../lib/helpers/catalog";
import property from "lodash/property";
import get from "lodash/get";

export const getCart = (state) => state.cart;

export const getCartItems = createSelector(getCart, (cart) =>
  get(cart, "items", [])
);

export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("qty")).reduce((count, qty) => count + qty, 0)
);

// export const isChangingItem = (id) => (state) =>
//   Boolean(state.cart.changingItems[id]);

// export const getCartSubtotal = createSelector(getCartItems, (items) =>
//   items.reduce(
//     (subtotal, { id, qty }) => subtotal + getItemById(id).price * qty,
//     0
//   )
// );

export const getItemTotal = ({ itemId, variantId, qty }) =>
  qty * getItemById(itemId).variants.byId[variantId].price;

export const getItemTotalById =
  (id, variant) =>
  ({ items }) => {
    const item = items.find(
      ({ itemId, variantId }) => itemId === id && variantId === variant
    );

    return item ? getItemTotal(item) : 0;
  };

export const getItemTotalByIndex =
  (index) =>
  ({ items }) => {
    console.log(items[index])
    return getItemTotal(items[index]);
  };

export default createSlice({
  name: "cart",
  initialState: {
    isCheckouting: false,
    isFetching: false,
    isFetched: false,
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
      state.isFetched = true;
    },
    changeItem(state, { payload: { id, variant, qty = 1, append = false } }) {
      state.changingItems[id] = true;

      const index = state.items.findIndex(
        ({ itemId, variantId }) => itemId === id && variantId === variant
      );

      if (index > -1) {
        state.items[index].qty = append ? state.items[index].qty + qty : qty;
      } else {
        state.items.push({ itemId: id, variantId: variant, qty });
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
});
