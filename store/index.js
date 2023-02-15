import { isServer } from "../lib/helpers/features";
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import rootSaga from "./sagas";
import cartSlice from "./slices/cart";
import deliverySlice from "./slices/delivery";
import feedbackSlice from "./slices/feedback";
import notificationsSlice from "./slices/notifications";
import createSagaMiddleware from "redux-saga";

function makeStore() {
  const config = {
    reducer: {
      [cartSlice.name]: cartSlice.reducer,
      [deliverySlice.name]: deliverySlice.reducer,
      [feedbackSlice.name]: feedbackSlice.reducer,
      [notificationsSlice.name]: notificationsSlice.reducer,
    },
  };

  if (isServer()) {
    return configureStore(config);
  }

  const sagas = createSagaMiddleware();

  const store = configureStore({
    ...config,
    devTools: process.env.NODE_ENV === "development",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagas),
  });

  sagas.run(rootSaga);

  return store;
}

const wrapper = createWrapper(makeStore);

export default wrapper;
