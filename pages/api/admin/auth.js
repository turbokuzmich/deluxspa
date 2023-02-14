import get from "lodash/get";
import { isAuthorized } from "../../../lib/backend/bot/webapp";
import { sign } from "../../../lib/helpers/jwt";

export default async function authorize(req, res) {
  if (req.method === "POST") {
    const input = get(req, "body.data", {});

    if (await isAuthorized(input)) {
      return res.status(200).json({ token: sign({ chatId: input.user.id }) });
    } else {
      return res.status(401).json({});
    }
  }

  res.status(405).json({});
}
