import get from "lodash/get";
import { verify } from "../helpers/jwt";
import { isAuthorizedUserId } from "../backend/bot/webapp";

export function restricted(handler) {
  return async function (req, res) {
    const token = get(req, "query.token", get(req, "body.token", ""));

    try {
      if (process.env.NODE_ENV === "production") {
        const result = verify(token);

        if (!result.chatId) {
          return res.status(401).json({});
        }

        const isAuthorized = await isAuthorizedUserId(result.chatId);

        if (!isAuthorized) {
          return res.status(401).json({});
        }

        await handler(req, res);
      } else {
        await handler(req, res);
      }
    } catch (error) {
      res.status(401).json({});
    }
  };
}
