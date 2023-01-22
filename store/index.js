import { isServer } from "../lib/helpers/features";
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import rootSaga from "./sagas";
import cartSlice from "./slices/cart";
import createSagaMiddleware from "redux-saga";

function makeStore() {
  const config = {
    reducer: {
      [cartSlice.name]: cartSlice.reducer,
    },
  };

  if (isServer()) {
    return configureStore(config);
  }

  const sagas = createSagaMiddleware();

  const store = configureStore({
    ...config,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagas),
    devTools: process.env.NODE_ENV === "development",
  });

  sagas.run(rootSaga);

  return store;
}

const wrapper = createWrapper(makeStore);

export default wrapper;