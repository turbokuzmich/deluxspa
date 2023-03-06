import { isServer } from "../../lib/helpers/features";
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import saga from "./sagas";
import ui from "./slices/ui";
import auth from "./slices/auth";
import orders from "./slices/orders";
import createSagaMiddleware from "redux-saga";

function makeStore() {
  const config = {
    reducer: {
      [ui.name]: ui.reducer,
      [auth.name]: auth.reducer,
      [orders.name]: orders.reducer,
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

  sagas.run(saga);

  return store;
}

export default createWrapper(makeStore);
