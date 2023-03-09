import { BotUser } from "../sequelize";
import { verify } from "../../helpers/bot";
import get from "lodash/get";

export async function isAuthorizedUserId(chatId) {
  const user = await BotUser.findOne({ where: { chatId } });

  return Boolean(user && user.confirmed);
}

export async function isAuthorized(input) {
  return verify(input) && (await isAuthorizedUserId(get(input, "user.id", 0)));
}
