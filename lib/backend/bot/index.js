import {
  isAuthorized,
  sendVerificationEmail,
  authorize,
  restricted,
  getChatIds,
} from "./auth.js";
import { format } from "../../helpers/numeral";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";

const isProduction = process.env.NODE_ENV === "production";

const commands = {
  start: { description: "Начало работы с ботом DeluxSPA" },
  auth: { description: "Авторизация в системе" },
  orders: { description: "Список заказов сайта DeluxSPA" },
};

const botCommands = Object.entries(commands).map(
  ([command, { description }]) => ({
    command: `/${command}`,
    description,
  })
);

const commandRegExps = Object.keys(commands).reduce(
  (regExps, command) => ({
    ...regExps,
    [command]: new RegExp(`^\/${command}$`),
  }),
  {}
);
const botPromise = Promise.resolve()
  .then(() => {
    if (isProduction === false && global.bot) {
      return global.bot.stopPolling();
    }
  })
  .then(() => {
    const replyActions = {};

    const bot = new TelegramBot(
      process.env.TELEGRAM_API_TOKEN,
      isProduction ? { webHook: true } : { polling: true }
    );

    if (isProduction === false) {
      global.bot = bot;
    }

    bot.onText(commandRegExps.start, async function (message) {
      const {
        from: { first_name, last_name },
        chat: { id },
      } = message;

      await bot.sendMessage(
        id,
        `Добро пожаловать, ${[first_name, last_name]
          .filter(Boolean)
          .join(" ")}.`
      );
    });

    bot.onText(
      commandRegExps.orders,
      restricted(async function (message) {
        const {
          chat: { id },
        } = message;

        await bot.sendMessage(id, "Перед вами список заказов сайта DeluxSPA");
      })
    );

    bot.onText(commandRegExps.auth, async function (message) {
      const {
        message_id,
        from: { first_name, last_name },
        chat: { id },
      } = message;

      const name = [first_name, last_name].filter(Boolean).join(" ");

      if (await isAuthorized(id)) {
        await bot.sendMessage(id, `${name}, вы уже авторизованы`, {
          reply_to_message_id: message_id,
        });
      } else {
        await sendVerificationEmail(id, name);

        const requestMessage = await bot.sendMessage(
          id,
          `${name}, вы не авторизованы. На почту info@deluxspa.ru направлен код авторизации. Пожалуйста, укажите его в ответном сообщении.`,
          {
            reply_to_message_id: message_id,
          }
        );

        replyActions[requestMessage.message_id] = async ({ text }) => {
          const [isSuccess, message] = await authorize(id, text);

          if (isSuccess) {
            await bot.sendMessage(id, `${name}, вы успешно авторизовались.`);
          } else {
            await bot.sendMessage(id, `Ну удалось авторизоваться. ${message}`);
          }
        };
      }
    });

    bot.on("message", async function (message) {
      const replyTo = get(message, "reply_to_message.message_id");

      if (replyTo in replyActions) {
        replyActions[replyTo](message);

        delete replyActions[replyTo];
      }
    });
    return bot;
  });

// [
//   "chat_member",
//   "chat_member_updated",
//   "error",
//   "left_chat_member",
//   "my_chat_member",
//   "new_chat_members",
// ].forEach((event) => {
//   bot.on(event, (...args) => {
//     console.log(event, ...args);
//   });
// });

export async function notifyOfNewOrder(order) {
  const [bot, chatIds, orderItems] = await Promise.all([
    botPromise,
    getChatIds(),
    order.getOrderItems(),
  ]);

  const text = [
    `Новый заказ №${order.id} на сумму ${format(order.total)} руб`,
    `Телефон: +7${order.phone}`,
    `Email: ${order.email ? order.email : "—"}`,
    `Пункт: «${order.name}»`,
    `Адрес: ${order.address}`,
    "",
    ...orderItems.map(
      ({ brief, title, capacity, qty }) =>
        `${brief} ${title} ${capacity} — ${qty}`
    ),
    "",
    `Комментарий: ${order.comment ? order.comment : "—"}`,
  ].join("\n");

  await Promise.all(chatIds.map((id) => bot.sendMessage(id, text)));
}

export default async function run() {
  const bot = await botPromise;

  await bot.setMyCommands(botCommands);

  if (isProduction) {
    if (bot.hasOpenWebHook()) {
      await bot.closeWebHook();
    }

    console.log(
      "set webhook",
      await bot.setWebHook(
        `https://tg.deluxspa.ru/bot${process.env.TELEGRAM_API_TOKEN}`
      )
    );

    console.log("open webhook", await bot.openWebHook());

    console.log("webhook info", await bot.getWebHookInfo());
  }
}
