import sequelize, { BotUser } from "../sequelize";
import get from "lodash/get";
import isObject from "lodash/isObject";
import { createHmac } from "crypto";

const secretKey = createHmac("sha256", "WebAppData")
  .update(process.env.TELEGRAM_API_TOKEN)
  .digest();

export async function isAuthorized(input) {
  const chatId = get(input, "user.id", 0);
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
    return false;
  }

  await sequelize;

  const user = await BotUser.findOne({ where: { chatId } });

  if (!user || !user.confirmed) {
    return false;
  }

  return true;
}
