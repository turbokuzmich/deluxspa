import get from "lodash/get";
import { isAuthorized } from "../../../lib/backend/bot/webapp";

// TODO стоит перейти на JWT авторизацию после проверки тг пользователя,
// чтобы каждый раз не проверять initData
export default async function authorize(req, res) {
  if (req.method === "POST") {
    const input = get(req, "body.data", {});

    if (await isAuthorized(input)) {
      return res.status(200).json({});
    } else {
      return res.status(401).json({});
    }
  }

  res.status(405).json({});
}
