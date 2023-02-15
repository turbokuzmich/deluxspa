import { createAction, createSelector, createSlice } from "@reduxjs/toolkit";
import property from "lodash/property";
import defaults from "lodash/defaults";
import { v4 as uuid } from "uuid";

export const getNotificationsSlice = property("notifications");

export const getNotifications = createSelector(
  getNotificationsSlice,
  property("notifications")
);

export const getAutoHideNotifications = createSelector(
  getNotifications,
  (notifications) => notifications.filter(({ autoHide }) => Boolean(autoHide))
);

export const getDueNotifications = createSelector(
  getNotifications,
  (notifications) =>
    notifications.filter(({ at, autoHide }) =>
      autoHide ? Date.now() > at + autoHide : false
    )
);

const defaultAutoHideInterval = 6000;

const defaultNotificationData = {
  autoHide: defaultAutoHideInterval,
  severity: "info",
  message: "",
};

function build(payload) {
  return defaults(
    payload,
    {
      id: uuid(),
      at: Date.now(),
    },
    defaultNotificationData
  );
}

// id uuid
// autoHide ms
// severity info | success | error
// message str

export default createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
  },
  reducers: {
    add(state, { payload }) {
      state.notifications.push(build(payload));
    },
    remove(state, { payload }) {
      state.notifications = state.notifications.filter(
        ({ id }) => id !== payload
      );
    },
    silentlyRemove(state, { payload }) {
      state.notifications = state.notifications.filter(
        ({ id }) => id !== payload
      );
    },
  },
  extraReducers(builder) {
    builder.addCase(showSuccessNotification, (state, { payload }) => {
      state.notifications.push(build(payload));
    });
    builder.addCase(showErrorNotification, (state, { payload }) => {
      state.notifications.push(build(payload));
    });
  },
});

export const checkNotifications = createAction("notifications@check");

export const showSuccessNotification = createAction(
  "notifications@success",
  function (message, autoHide = defaultAutoHideInterval) {
    return {
      payload: {
        message,
        autoHide,
        severity: "success",
      },
    };
  }
);

export const showErrorNotification = createAction(
  "notifications@error",
  function (message, autoHide = defaultAutoHideInterval) {
    return {
      payload: {
        message,
        autoHide,
        severity: "error",
      },
    };
  }
);
