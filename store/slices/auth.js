import { createSlice, createSelector } from "@reduxjs/toolkit";
import get from "lodash/get";
import property from "lodash/property";

export const AuthState = {
  initial: "initial",
  anonymous: "anonimous",
  authorized: "authorized",
};

export const AuthFormState = {
  email: "email",
  code: "code",
};

export const getAuth = property("auth");
export const getAuthIsFetching = createSelector(getAuth, property("fetching"));
export const getAuthState = createSelector(getAuth, property("state"));
export const getAuthForm = createSelector(getAuth, property("authForm"));
export const getAuthFormEmail = createSelector(getAuthForm, property("email"));
export const getAuthFormCode = createSelector(getAuthForm, property("code"));
export const getAuthFormState = createSelector(getAuthForm, property("state"));
export const getAuthFormError = createSelector(getAuthForm, property("error"));
export const getAuthUser = createSelector(getAuth, property("user"));
export const getAuthUserName = createSelector(getAuthUser, property("name"));
export const getAuthUserEmail = createSelector(getAuthUser, property("email"));
export const getAuthUserCountry = createSelector(
  getAuthUser,
  property("country")
);
export const getAuthUserPhone = createSelector(getAuthUser, property("phone"));
export const getAuthUserType = createSelector(getAuthUser, (user) =>
  get(user, "type", "physical")
);
export const getAuthUserCompany = createSelector(
  getAuthUser,
  property("company")
);
export const getAuthUserSite = createSelector(getAuthUser, property("site"));
export const getAuthUserDiscount = createSelector(
  getAuthUser,
  property("discount", 0)
);
export const getAuthUserNameOrEmail = createSelector(
  getAuthUserName,
  getAuthUserEmail,
  (name, email) => name ?? email
);

export const getAuthFormEmailValues = createSelector(
  getAuthFormEmail,
  (email) => ({ email })
);
export const getAuthFormCodeValues = createSelector(
  getAuthFormCode,
  (code) => ({ code })
);
export const getAuthProfileValues = createSelector(
  getAuthUserName,
  getAuthUserType,
  getAuthUserCountry,
  getAuthUserPhone,
  getAuthUserSite,
  getAuthUserCompany,
  (name, type, country, phone, site, company) => ({
    name,
    type,
    country,
    phone,
    site,
    company,
  })
);

export default createSlice({
  name: "auth",
  initialState: {
    state: AuthState.initial,
    fetching: false,
    authForm: {
      email: "",
      code: "",
      state: AuthFormState.email,
      error: null,
    },
    user: null,
  },
  reducers: {
    setUser(state, { payload: user }) {
      state.user = user;
      state.state = user === null ? AuthState.anonymous : AuthState.authorized;
    },
    patchUser(state, { payload: user }) {
      const newUser = { ...state.user, ...user };
      state.user = newUser;
    },
    setAuthFormEmail(state, { payload: email }) {
      state.authForm.email = email;
      state.authForm.code = "";
      state.authForm.state = AuthFormState.code;
      state.authForm.error = null;
    },
    setAuthFormCode(state, { payload: code }) {
      state.authForm.code = code;
      state.authForm.error = null;
    },
    resetAuthForm(state) {
      state.authForm.email = "";
      state.authForm.code = "";
      state.authForm.state = AuthFormState.email;
      state.authForm.error = null;
    },
    logout(state) {
      state.user = null;
      state.state = AuthState.anonymous;
    },
  },
});
