import get from "lodash/get";
import { isAuthorized } from "../../../lib/backend/bot/webapp";

export default async function authorize(req, res) {
  if (req.method === "POST") {
    const input = get(req, "body.data", {});

    if (await isAuthorized(input)) {
      res.status(200).json({});
    } else {
      res.status(401).json({});
    }
  }

  res.status(405).json({});
}
