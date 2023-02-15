import {
  isAuthorized,
  sendVerificationEmail,
  authorize,
  restricted,
  getChatIds,
} from "./auth.js";
import { format } from "../../helpers/numeral";
import { formatDate } from "../../helpers/date";
import { URL } from "url";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";
import sequelize, { Order } from "../sequelize.js";
import { getAssortment } from "../moysklad.js";
import { getItemById, formatCapacity } from "../../helpers/catalog.js";
import { format as formatNumber } from "../../helpers/numeral";
import t from "../../helpers/i18n";

function getOrderViewUrl(id) {
  const orderUrl = new URL(process.env.ADMIN_URL);

  orderUrl.searchParams.set("order_id", id);

  return orderUrl.toString();
}

const isProduction = process.env.NODE_ENV === "production";
const orderIdRegExp = /^\/order (\d+)/;

const commands = {
  start: { description: "Начало работы с ботом DeluxSPA" },
  auth: { description: "Авторизация в системе" },
  admin: { description: "Админка сайта" },
  order: { description: "Краткая информация по заказу" },
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
      commandRegExps.admin,
      restricted(async function (message) {
        const {
          chat: { id },
        } = message;

        await bot.sendMessage(id, "Управление сайтом", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Заказы",
                  web_app: {
                    url: process.env.ADMIN_URL,
                  },
                },
                {
                  text: "Остатки",
                  callback_data: "getStock",
                },
              ],
            ],
          },
        });
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

    bot.onText(
      orderIdRegExp,
      restricted(async function ({ chat: { id }, text }) {
        const orderId = parseInt(text.match(orderIdRegExp)[1], 10);

        await sequelize;

        const order = await Order.findByPk(orderId);

        if (order) {
          await bot.sendMessage(
            id,
            `Заказ №${orderId} от ${formatDate(
              new Date(order.createdAt)
            )}  на сумму ${format(order.total)} ₽`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Посмотреть",
                      web_app: {
                        url: getOrderViewUrl(order.id),
                      },
                    },
                  ],
                ],
              },
            }
          );
        } else {
          await bot.sendMessage(id, `Заказ №${orderId} не найден.`);
        }
      })
    );

    bot.on("message", async function (message) {
      const replyTo = get(message, "reply_to_message.message_id");

      if (replyTo in replyActions) {
        replyActions[replyTo](message);

        delete replyActions[replyTo];
      }
    });

    bot.on("callback_query", async function (message) {
      const {
        data,
        message: {
          chat: { id },
        },
      } = message;

      if (data === "getStock") {
        const assortment = await getAssortment();

        const text = Object.keys(assortment)
          .map((itemId) => {
            const item = getItemById(itemId);

            const title = t(item.title, "ru");
            const brief = t(item.brief, "ru");

            const siteLink = `${process.env.SITE_URL_PRODUCTION}/catalog/item/${itemId}`;

            const itemTitle = [
              `[${brief} ${title}]`.toUpperCase(),
              `(${siteLink})`,
            ].join("");

            const varians = item.variants.list.map((variantId) => {
              const stock = assortment[itemId][variantId];

              const volume = get(item, [
                "variants",
                "byId",
                variantId,
                "volume",
              ]);

              const [capacity, unitKey] = formatCapacity(volume, item.unit);

              const variantTitle = ` ${formatNumber(capacity)} ${t(
                unitKey,
                "ru"
              )}`;

              return stock === null
                ? ` ${variantTitle} — неизвестно`
                : ` ${variantTitle} — ${stock}`;
            });

            return [itemTitle, ...varians].join("\n");
          })
          .join("\n\n");

        await bot.sendMessage(id, text, { parse_mode: "MarkdownV2" });
      }
    });

    return bot;
  });

export async function notifyOfNewOrder(order) {
  const [bot, chatIds] = await Promise.all([botPromise, getChatIds()]);

  await Promise.all(
    chatIds.map((id) =>
      bot.sendMessage(
        id,
        `Новый заказ №${order.id} на сумму ${format(order.total)} ₽`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Посмотреть",
                  web_app: {
                    url: getOrderViewUrl(order.id),
                  },
                },
              ],
            ],
          },
        }
      )
    )
  );
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
        `${process.env.BOT_URL}${process.env.TELEGRAM_API_TOKEN}`
      )
    );

    console.log("open webhook", await bot.openWebHook());

    console.log("webhook info", await bot.getWebHookInfo());
  }
}
