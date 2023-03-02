import {
  isRoot,
  isAuthorized,
  sendVerificationEmail,
  authorize,
  restricted,
  root,
  getChatIds,
  getUsers,
} from "./auth.js";
import { resolve } from "path";
import { format } from "../../helpers/numeral";
import { formatDate } from "../../helpers/date";
import { URL } from "url";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";
import unset from "lodash/unset";
import sequelize, { Order, FeedbackRequest } from "../sequelize.js";
import { getPasswords } from "../wiki.js";
import { getAssortment } from "../moysklad.js";
import { getItemById, formatCapacity } from "../../helpers/catalog.js";
import { format as formatNumber } from "../../helpers/numeral";
import { Left, Right } from "@sniptt/monads";
import t from "../../helpers/i18n";
import { set } from "lodash";
import s3 from "../aws";
import fs from "fs";
import utils from "util";

const unlink = utils.promisify(fs.unlink);
const readFile = utils.promisify(fs.readFile);

function getOrderViewUrl(id) {
  const orderUrl = new URL(process.env.ADMIN_URL);

  orderUrl.searchParams.set("order_id", id);

  return orderUrl.toString();
}

const isProduction = process.env.NODE_ENV === "production";

const orderIdRegExp = /^\/order (\d+)/;
const rootRegExp = /^\/root$/;
const usersRegExp = /^\/users$/;
const passwordsRegExp = /^\/passwords$/;

const commands = {
  start: { description: "Начало работы с ботом DeluxSPA" },
  auth: { description: "Авторизация в системе" },
  admin: { description: "Админка сайта" },
  order: { description: "Краткая информация по заказу" },
  uploads: { description: "Загрузки" },
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

const registerMethod = (function () {
  let bot = Left(Promise.resolve());
  function registrator(handler) {
    return async function (...args) {
      return bot.mapRight((botPromise) =>
        botPromise.then((bot) => handler(bot, ...args))
      );
    };
  }

  registrator.unlock = function () {
    const botPromise = Promise.resolve()
      .then(() => {
        if (isProduction === false && global.bot) {
          return global.bot.stopPolling();
        }
      })
      .then(() => {
        console.log("init bot");
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
                await bot.sendMessage(
                  id,
                  `${name}, вы успешно авторизовались.`
                );
              } else {
                await bot.sendMessage(
                  id,
                  `Ну удалось авторизоваться. ${message}`
                );
              }
            };
          }
        });

        bot.onText(rootRegExp, async function (message) {
          const {
            message_id,
            from: { first_name, last_name },
            chat: { id },
          } = message;

          const name = [first_name, last_name].filter(Boolean).join(" ");

          if (await isRoot(id)) {
            await bot.sendMessage(id, `${name}, вы уже root`, {
              reply_to_message_id: message_id,
            });
          } else {
            await sendVerificationEmail(id, name, true);

            const requestMessage = await bot.sendMessage(
              id,
              `${name}, на вашу почту отправлен код подтверждения. Пришлите его в ответном сообщении.`,
              {
                reply_to_message_id: message_id,
              }
            );

            replyActions[requestMessage.message_id] = async ({ text }) => {
              const [isSuccess, message] = await authorize(id, text, true);

              if (isSuccess) {
                await bot.sendMessage(
                  id,
                  `${name}, вам разрешен полный доступ.`
                );
              } else {
                await bot.sendMessage(
                  id,
                  `Ну удалось получить полный доступ. ${message}`
                );
              }
            };
          }
        });

        bot.onText(
          usersRegExp,
          root(async function ({ chat: { id }, message_id }) {
            const users = await getUsers();
            const info = await Promise.all(
              users.map(({ chatId }) => bot.getChat(chatId))
            );

            const text = info
              .map(({ id, first_name, last_name, username }) =>
                [
                  id,
                  "—",
                  first_name,
                  last_name,
                  username ? `(${username})` : username,
                ]
                  .filter(Boolean)
                  .join(" ")
              )
              .join("\n");

            await bot.sendMessage(id, text, {
              reply_to_message_id: message_id,
            });
          })
        );

        bot.onText(
          passwordsRegExp,
          root(async function ({ chat: { id }, message_id }) {
            await bot.sendMessage(id, await getPasswords(), {
              reply_to_message_id: message_id,
            });
          })
        );

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

        bot.onText(commandRegExps.uploads, async function (message) {
          const {
            chat: { id },
          } = message;

          await bot.sendMessage(id, "Загрузка файлов", {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "каталог neon beard 🇷🇺",
                    callback_data: "uploadNeonCatalogRu",
                  },
                  {
                    text: "каталог neon beard 🇬🇧",
                    callback_data: "uploadNeonCatalogEn",
                  },
                ],
              ],
            },
          });
        });

        bot.on("message", async function (message) {
          const replyTo = get(message, "reply_to_message.message_id");

          if (replyTo in replyActions) {
            replyActions[replyTo](message);

            delete replyActions[replyTo];
          }
        });

        bot.on("document", async function (message) {
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

          if (
            data === "uploadNeonCatalogRu" ||
            data === "uploadNeonCatalogEn"
          ) {
            const locale = data.match(/(Ru|En)$/)[1].toLocaleLowerCase();

            const uploadRequestMessage = await bot.sendMessage(
              id,
              "Загрузите каталог в ответ на это сообщение"
            );

            replyActions[uploadRequestMessage.message_id] = async (message) => {
              const { chat, document } = message;
              const { id } = chat;

              if (!document || document.mime_type !== "application/pdf") {
                return bot.sendMessage(id, "Вам нужно прислать pdf-файл");
              }

              const uploadPath = await bot.downloadFile(
                document.file_id,
                resolve(process.cwd(), "tmp")
              );

              const catalog = await readFile(uploadPath);
              const key = `catalog/neon-beard/${locale}/${Date.now()}`;

              await unlink(uploadPath);

              const { Location } = await s3
                .upload({
                  Body: catalog,
                  Bucket: "deluxspa-downloads",
                  ContentType: "application/pdf",
                  Key: key,
                  ContentLength: document.file_size,
                })
                .promise();

              await bot.sendMessage(
                id,
                ["Каталог успешно загружен", Location].join("\n"),
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          url: Location,
                          text: "Проверить",
                        },
                      ],
                    ],
                  },
                }
              );
            };
          }
        });

        return bot;
      });

    bot = Right(botPromise);

    return botPromise;
  };

  return registrator;
})();

export const notifyOfNewOrder = registerMethod(async function (order) {
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
});

export const notifyOfFeedBack = registerMethod(
  (function () {
    const feedbackRequestsReplyListenersIds = {};

    return async function ({ key, name, phone, email, message }) {
      const [bot, chatIds] = await Promise.all([botPromise, getChatIds()]);

      const replyText = ["Вопрос на сайте", name, phone, email, message]
        .filter(Boolean)
        .concat(["", "Вы можете ответить на это сообшение"])
        .join("\n");

      const messages = await Promise.all(
        chatIds.map((id) => {
          return bot.sendMessage(id, replyText);
        })
      );

      const replyCallback = async ({ text, chat: { id } }) => {
        const listeners = get(feedbackRequestsReplyListenersIds, key);

        unset(feedbackRequestsReplyListenersIds, key);

        listeners.forEach((listener) => {
          bot.removeReplyListener(listener);
        });

        await FeedbackRequest.reply(key, text);
        await bot.sendMessage(id, "Спасибо, что заботитесь о клиентах.");
      };

      const listenerIds = messages.map(({ message_id, chat: { id } }) =>
        bot.onReplyToMessage(id, message_id, replyCallback)
      );

      set(feedbackRequestsReplyListenersIds, [key], listenerIds);
    };
  })()
);

export default async function run() {
  const bot = await registerMethod.unlock();

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
