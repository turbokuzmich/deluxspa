import nextSession from "next-session";
import sessionStore from "../backend/session-store";

const sessionOptions = {
  name: "deluxspa-session",
  store: sessionStore,
  autoCommit: false,
};

export const getSession = nextSession(sessionOptions);
