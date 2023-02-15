import nextSession from "next-session";
import sessionStore from "../backend/session-store";
import { sign, unsign } from "cookie-signature";

const sessionOptions = {
  name: "deluxspa-session",
  store: sessionStore,
  autoCommit: false,
  decode(raw) {
    return unsign(raw, process.env.KEY);
  },
  encode(sid) {
    return sign(sid, process.env.KEY);
  },
  cookie: {
    secure: true,
    sameSite: "lax",
  },
};

export const getSession = nextSession(sessionOptions);
