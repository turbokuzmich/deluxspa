import sequelize, { BotUser } from "../../../lib/backend/sequelize";
import get from "lodash/get";
import isObject from "lodash/isObject";
import { createHmac } from "crypto";

const secretKey = createHmac("sha256", "WebAppData")
  .update(process.env.TELEGRAM_API_TOKEN)
  .digest();

export default async function authorize(req, res) {
  if (req.method === "POST") {
    const input = get(req, "body.data", {});
    const hashToCheck = get(input, "hash", "");

    const data = Object.keys(input)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) =>
        isObject(input[key])
          ? `${key}=${JSON.stringify(input[key])}`
          : `${key}=${input[key]}`
      )
      .join("\n");

    const hash = createHmac("sha256", secretKey).update(data).digest("hex");

    if (hash !== hashToCheck) {
      return res.status(401).json({});
    }

    await sequelize;

    const { id } = JSON.parse(params.get("user"));
    const user = await BotUser.findOne({ where: { chatId: id } });

    if (!user || !user.confirmed) {
      return res.status(401).json({});
    }

    res.status(200).json({});
  }

  res.status(405).json({});
}
