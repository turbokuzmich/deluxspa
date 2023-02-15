import nodemailer from "nodemailer";
import { generateSecret, generateToken, verifyToken } from "node-2fa";
import memoize from "lodash/memoize.js";
import get from "lodash/get.js";
import property from "lodash/property";
import sequelize, { BotUser } from "../sequelize";

const getTransport = memoize(() => {
  return nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
});

export async function isAuthorized(chatId) {
  await sequelize;

  const existingUser = await BotUser.findOne({ where: { chatId } });

  return get(existingUser, "confirmed", false);
}

export async function isRoot(chatId) {
  await sequelize;

  const existingUser = await BotUser.findOne({ where: { chatId } });

  if (existingUser === null) {
    return false;
  }

  if (existingUser.becameRootAt === null) {
    return false;
  }

  const now = Date.now();

  return (
    existingUser.confirmed &&
    now - existingUser.becameRootAt.getTime() <
      parseInt(process.env.ROOT_PERIOD, 10)
  );
}

export async function sendVerificationEmail(chatId, name, root = false) {
  const challengedAt = new Date();
  const { secret } = generateSecret({ name });
  const { token } = generateToken(secret);

  const existingUser = await BotUser.findOne({ where: { chatId } });

  if (existingUser) {
    await existingUser.update({
      secret,
      challengedAt,
    });
  } else {
    await BotUser.create({
      chatId,
      secret,
      challengedAt,
    });
  }

  const to = root ? process.env.ROOT_EMAIL : process.env.EMAIL_USER;

  const result = await getTransport().sendMail({
    to,
    html: `<p>Код подтверждения — ${token}`,
    subject: "Авторизация в боте DeluxSPA",
    from: process.env.EMAIL_SENDER,
  });
}

// TODO validate date
export async function authorize(chatId, token, root = false) {
  const existingUser = await BotUser.findOne({ where: { chatId } });

  if (!existingUser) {
    return [false, "Пользователь не найден."];
  }

  const secret = existingUser.secret;

  if (secret === null) {
    return [false, "Ошибка авторизации."];
  }

  const result = verifyToken(secret, token);

  if (result === null) {
    return [false, "Неправильный код."];
  }

  const defaultUpdate = {
    secret: null,
    confirmed: true,
    challengedAt: null,
  };

  await existingUser.update(
    root ? { ...defaultUpdate, becameRootAt: new Date() } : defaultUpdate
  );

  return [true];
}

export function restricted(handler) {
  return async function (message) {
    if (await isAuthorized(message.chat.id)) {
      await handler(message);
    }
  };
}

export function root(handler) {
  return async function (message) {
    if (await isRoot(message.chat.id)) {
      await handler(message);
    }
  };
}

export async function getChatIds() {
  return (await BotUser.findAll({ where: { confirmed: true } })).map(
    property("chatId")
  );
}

export async function getUsers() {
  return await BotUser.findAll({ where: { confirmed: true } });
}

/**
 * 
 * Удалили и остановили бота
 * 
 * my_chat_member {
  chat: {
    id: 177074269,
    first_name: 'Дмитрий',
    last_name: 'Куртеев',
    username: 'turbokuzmich',
    type: 'private'
  },
  from: {
    id: 177074269,
    is_bot: false,
    first_name: 'Дмитрий',
    last_name: 'Куртеев',
    username: 'turbokuzmich',
    language_code: 'en'
  },
  date: 1676282407,
  old_chat_member: {
    user: {
      id: 5414480340,
      is_bot: true,
      first_name: 'DeluxSPA Bot',
      username: 'deluxspa_bot'
    },
    status: 'member'
  },
  new_chat_member: {
    user: {
      id: 5414480340,
      is_bot: true,
      first_name: 'DeluxSPA Bot',
      username: 'deluxspa_bot'
    },
    status: 'kicked',
    until_date: 0
  }
}
 */

/**
 * Добавился участник
 * 
 * my_chat_member {
  chat: {
    id: 177074269,
    first_name: 'Дмитрий',
    last_name: 'Куртеев',
    username: 'turbokuzmich',
    type: 'private'
  },
  from: {
    id: 177074269,
    is_bot: false,
    first_name: 'Дмитрий',
    last_name: 'Куртеев',
    username: 'turbokuzmich',
    language_code: 'en'
  },
  date: 1676282518,
  old_chat_member: {
    user: {
      id: 5414480340,
      is_bot: true,
      first_name: 'DeluxSPA Bot',
      username: 'deluxspa_bot'
    },
    status: 'kicked',
    until_date: 0
  },
  new_chat_member: {
    user: {
      id: 5414480340,
      is_bot: true,
      first_name: 'DeluxSPA Bot',
      username: 'deluxspa_bot'
    },
    status: 'member'
  }
}
 */
