import { createSelector, createSlice } from "@reduxjs/toolkit";
import { getItemById } from "../../lib/helpers/catalog";
import property from "lodash/property";
import get from "lodash/get";
import fromPairs from "lodash/fromPairs";
import {
  getDiscount as calculateDiscount,
  getSubtotal,
} from "../../lib/helpers/order";
import { AuthState, getAuthState, getAuthUserDiscount } from "./auth";

const cartStates = [
  "initial",
  "fetching",
  "fetched",
  "delivery",
  "payment",
  "success",
];
export const CartState = fromPairs(cartStates.map((state) => [state, state]));

export const getCart = (state) => state.cart;

export const getCartState = createSelector(getCart, ({ state }) => state);

export const getCartItems = createSelector(getCart, (cart) =>
  get(cart, "items", [])
);

export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("qty")).reduce((count, qty) => count + qty, 0)
);

export const getCartSubtotal = createSelector(getCartItems, (items) =>
  items.reduce(
    (subtotal, { itemId, variantId, qty }) =>
      subtotal + getItemById(itemId).variants.byId[variantId].price * qty,
    0
  )
);

export const getDiscount = createSelector(
  getAuthState,
  getAuthUserDiscount,
  getCartSubtotal,
  getCartItemsCount,
  (auth, discount, subtotal, count) =>
    calculateDiscount(
      count,
      subtotal,
      auth === AuthState.authorized ? discount : 0
    )
);

export const getCartSubtotalWithDiscount = createSelector(
  getCartItems,
  getDiscount,
  (items, discount) =>
    getSubtotal(
      items.map(({ itemId, variantId, qty }) => ({
        price: getItemById(itemId).variants.byId[variantId].price,
        qty,
      })),
      discount
    )
);

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
  ({ items }) =>
    getItemTotal(items[index]);

export default createSlice({
  name: "cart",
  initialState: {
    state: CartState.initial,
    items: [],
    changingItems: {},
  },
  reducers: {
    fetch(state) {
      state.state = CartState.fetching;
    },
    fetchComplete(state, { payload: { items } }) {
      state.items = items;
      state.state = CartState.fetched;
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
    toItems(state) {
      state.state = "fetched";
    },
    toDelivery(state) {
      state.state = "delivery";
    },
    toPayment(state) {
      state.state = "payment";
    },
  },
});
