import { sign as jwtSign, verify as jwtVerify } from "jsonwebtoken";

export function sign(payload) {
  return jwtSign(payload, process.env.KEY, {
    algorithm: "HS512",
  });
}

export function verify(token) {
  return jwtVerify(token, process.env.KEY);
}
