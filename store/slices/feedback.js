import { createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";

export const getFeedback = (state) => state.feedback;
export const getFeedBackName = createSelector(getFeedback, property("name"));
export const getFeedBackPhone = createSelector(getFeedback, property("phone"));
export const getFeedBackEmail = createSelector(getFeedback, property("email"));
export const getFeedBackMessage = createSelector(
  getFeedback,
  property("message")
);
export const getFeedBackStatus = createSelector(
  getFeedback,
  property("status")
);

export const getFeedbackFormValues = createSelector(
  getFeedBackName,
  getFeedBackPhone,
  getFeedBackEmail,
  getFeedBackMessage,
  (name, phone, email, message) => ({
    name,
    phone,
    email,
    message,
  })
);

export default createSlice({
  name: "feedback",
  initialState: {
    name: "",
    phone: "",
    email: "",
    message: "",

    status: "initial", // ready | error | sending | sent
  },
  reducers: {
    submit(state, { payload: { name, phone, email, message } }) {
      state.name = name;
      state.phone = phone;
      state.email = email;
      state.message = message;

      state.status = "ready";
    },
    reset(state) {
      state.name = "";
      state.phone = "";
      state.email = "";
      state.message = "";

      state.status = "initial";
    },
    send(state) {
      state.status = "sending";
    },
    sent(state) {
      state.name = "";
      state.phone = "";
      state.email = "";
      state.message = "";

      state.status = "sent";
    },
    failed(state) {
      state.name = "";
      state.phone = "";
      state.email = "";
      state.message = "";

      state.status = "error";
    },
  },
});
