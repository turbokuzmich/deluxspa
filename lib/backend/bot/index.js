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
import { format } from "../../helpers/numeral";
import { formatDate, formatRU } from "../../helpers/date";
import { URL } from "url";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";
import unset from "lodash/unset";
import decline from "../../helpers/declension.js";
import debounce from "lodash/debounce";
import { Order, FeedbackRequest } from "../sequelize.js";
import { getPasswords } from "../wiki.js";
import { getAssortment } from "../moysklad.js";
import { getItemById, formatCapacity } from "../../helpers/catalog.js";
import { format as formatNumber } from "../../helpers/numeral";
import { Left, Right } from "@sniptt/monads";
import t from "../../helpers/i18n";
import { set } from "lodash";
import s3 from "../aws";

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
        const bot = new TelegramBot(
          process.env.TELEGRAM_API_TOKEN,
          isProduction ? { webHook: true } : { polling: true }
        );

        const registerReplyExpectation = (function () {
          const replyActions = {};
          const replyTimers = {};

          function checkReply(message) {
            const replyTo = get(message, "reply_to_message.message_id");

            if (replyActions[replyTo]) {
              clearTimeout(replyTimers[replyTo]);

              replyActions[replyTo](message);

              delete replyActions[replyTo];
              delete replyTimers[replyTo];
            }
          }

          ["message", "document"].forEach(function (event) {
            bot.on(event, checkReply);
          });

          return function (message, handler, timeout = 30000) {
            const {
              chat: { id },
              message_id,
            } = message;

            replyActions[message_id] = handler;
            replyTimers[message_id] = setTimeout(async function () {
              if (replyActions[message_id]) {
                delete replyActions[message_id];
                delete replyTimers[message_id];

                await bot.deleteMessage(id, message_id);
              }
            }, timeout);
          };
        })();

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
                      callback_data: "stock",
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

            registerReplyExpectation(
              await bot.sendMessage(
                id,
                `${name}, вы не авторизованы. На почту info@deluxspa.ru направлен код авторизации. Пожалуйста, укажите его в ответном сообщении.`,
                {
                  reply_to_message_id: message_id,
                }
              ),
              async ({ text }) => {
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
              }
            );
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

            registerReplyExpectation(
              await bot.sendMessage(
                id,
                `${name}, на вашу почту отправлен код подтверждения. Пришлите его в ответном сообщении.`,
                {
                  reply_to_message_id: message_id,
                }
              ),
              async ({ text }) => {
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
              }
            );
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
          commandRegExps.order,
          restricted(async function ({ chat: { id } }) {
            await bot.sendMessage(
              id,
              "Выберите проект для управления заказами",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Delux SPA",
                        callback_data: ["order", "deluxspa"].join(","),
                      },
                      {
                        text: "Neon Beard",
                        callback_data: ["order", "neon"].join(","),
                      },
                    ],
                  ],
                },
              }
            );
          })
        );

        bot.onText(
          commandRegExps.uploads,
          restricted(async function (message) {
            const {
              chat: { id },
            } = message;

            await bot.sendMessage(
              id,
              "Выберите проект для управления загрузками",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Neon Beard",
                        callback_data: ["uploads", "neon"].join(","),
                      },
                    ],
                  ],
                },
              }
            );
          })
        );

        bot.on("callback_query", async function (message) {
          const {
            data,
            message: {
              message_id,
              chat: { id },
            },
          } = message;

          const [command, ...params] = data.split(",");

          if (command === "getStock") {
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

          if (command === "uploads") {
            const [site] = params;

            if (site === "neon") {
              await bot.editMessageText(
                "Загрузить на Neon Beard или скачать?",
                { message_id, chat_id: id }
              );
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "🔼 загрузить",
                        callback_data: ["upload", "neon"].join(","),
                      },
                      {
                        text: "🔽 скачать",
                        callback_data: ["download", "neon"].join(","),
                      },
                    ],
                  ],
                },
                { message_id, chat_id: id }
              );
            }
          }

          if (command === "download") {
            const [site, locale] = params;

            if (site === "neon") {
              if (locale) {
                const flag = { en: "🇬🇧", ru: "🇷🇺" }[locale];

                const { Contents } = await s3
                  .listObjects({
                    Bucket: "deluxspa-downloads",
                    Prefix: `catalog/neon-beard/${locale}`,
                  })
                  .promise();

                new Date().toLocaleString;

                const objects = [...Contents]
                  .reverse()
                  .slice(0, 5)
                  .map(({ Key, LastModified }) => [
                    {
                      text: formatRU(LastModified, "d MMMM yyyy HH:mm"),
                      url: `https://deluxspa-downloads.storage.yandexcloud.net/${Key}`,
                    },
                  ]);

                await bot.editMessageText(
                  `${objects.length} ${decline(objects.length, [
                    "последний каталог",
                    "последних каталога",
                    "последних каталогов",
                  ])} Neon Beard на ${flag}`,
                  { message_id, chat_id: id }
                );
                await bot.editMessageReplyMarkup(
                  {
                    inline_keyboard: [
                      ...objects,
                      [
                        {
                          text: "Перейти в раздел загрузок Neon Beard",
                          callback_data: ["uploads", "neon"].join(","),
                        },
                      ],
                    ],
                  },
                  { message_id, chat_id: id }
                );
              } else {
                await bot.editMessageText(
                  "На каком языке показать файлы Neon Beard?",
                  { message_id, chat_id: id }
                );
                await bot.editMessageReplyMarkup(
                  {
                    inline_keyboard: [
                      [
                        {
                          text: "🇷🇺",
                          callback_data: ["download", "neon", "ru"].join(","),
                        },
                        {
                          text: "🇬🇧",
                          callback_data: ["download", "neon", "en"].join(","),
                        },
                      ],
                      [
                        {
                          text: "Перейти в раздел загрузок Neon Beard",
                          callback_data: ["uploads", "neon"].join(","),
                        },
                      ],
                    ],
                  },
                  { message_id, chat_id: id }
                );
              }
            }
          }

          if (command === "upload") {
            const [site, locale] = params;

            if (site === "neon") {
              if (locale) {
                await bot.editMessageReplyMarkup(
                  { inline_keyboard: [] },
                  { message_id, chat_id: id }
                );

                const flag = { en: "🇬🇧", ru: "🇷🇺" }[locale];

                await bot.editMessageText(
                  `Загрузите каталог на ${flag} в формате pdf ответом на данное сообщение`,
                  { message_id, chat_id: id }
                );
                await bot.editMessageReplyMarkup(
                  {
                    inline_keyboard: [
                      [
                        {
                          text: "Перейти в раздел загрузок Neon Beard",
                          callback_data: ["uploads", "neon"].join(","),
                        },
                      ],
                    ],
                  },
                  { message_id, chat_id: id }
                );

                registerReplyExpectation(message.message, async (message) => {
                  const { chat, document } = message;
                  const { id } = chat;

                  if (!document || document.mime_type !== "application/pdf") {
                    return bot.editMessageText("Нужно загрузить pdf-файл", {
                      message_id,
                      chat_id: id,
                    });
                  }

                  const stream = bot.getFileStream(document.file_id);
                  const key = `catalog/neon-beard/${locale}/${Date.now()}`;

                  await bot.sendChatAction(id, "upload_document");

                  const resultMessagePrefix =
                    "Подождите, пока файл загрузится в хранилище";
                  const resultMessage = await bot.sendMessage(
                    id,
                    [resultMessagePrefix, "(0%)"].join(" ")
                  );

                  const upload = s3.upload({
                    Body: stream,
                    Bucket: "deluxspa-downloads",
                    ContentType: "application/pdf",
                    Key: key,
                    ContentLength: document.file_size,
                  });

                  const progressHandler = async function ({ loaded, total }) {
                    await bot.editMessageText(
                      [
                        resultMessagePrefix,
                        `(${Math.round((loaded / total) * 100)}%)`,
                      ].join(" "),
                      {
                        chat_id: resultMessage.chat.id,
                        message_id: resultMessage.message_id,
                      }
                    );
                  };

                  upload.on("httpUploadProgress", progressHandler);

                  const { Location, Key } = await upload.promise();

                  const { LastModified } = await s3
                    .headObject({
                      Key,
                      Bucket: "deluxspa-downloads",
                    })
                    .promise();

                  await bot.editMessageText(
                    `Каталог Neon Beard ${flag} от ${formatRU(
                      LastModified,
                      "d MMMM yyyy HH:mm"
                    )} успешно обновлен`,
                    {
                      chat_id: resultMessage.chat.id,
                      message_id: resultMessage.message_id,
                    }
                  );
                  await bot.editMessageReplyMarkup(
                    {
                      inline_keyboard: [
                        [
                          {
                            text: "Прямая ссылка на файл в хранилище",
                            url: Location,
                          },
                        ],
                        [
                          {
                            text: "Ссылка на сайте Neon Beard",
                            url: `https://neonbeard.ru/api/downloads/catalog/${locale}`,
                          },
                        ],
                        [
                          {
                            text: "Ссылка на раздел загрузок",
                            url: "https://neon-beard.ru/downloads.html",
                          },
                        ],
                        [
                          {
                            text: "Перейти в раздел загрузок Neon Beard",
                            callback_data: ["uploads", "neon"].join(","),
                          },
                        ],
                      ],
                    },
                    {
                      message_id: resultMessage.message_id,
                      chat_id: resultMessage.chat.id,
                    }
                  );
                });
              } else {
                await bot.editMessageText(
                  "На каком языке загрузить каталог на Neon Beard?",
                  { message_id, chat_id: id }
                );
                await bot.editMessageReplyMarkup(
                  {
                    inline_keyboard: [
                      [
                        {
                          text: "🇷🇺",
                          callback_data: ["upload", "neon", "ru"].join(","),
                        },
                        {
                          text: "🇬🇧",
                          callback_data: ["upload", "neon", "en"].join(","),
                        },
                      ],
                      [
                        {
                          text: "Перейти в раздел загрузок Neon Beard",
                          callback_data: ["uploads", "neon"].join(","),
                        },
                      ],
                    ],
                  },
                  { message_id, chat_id: id }
                );
              }
            }
          }

          if (command === "order") {
            const [site] = params;

            if (site === "neon") {
            }
            if (site === "deluxspa") {
              await bot.editMessageText(
                "Укажите номер заказа на сайте Delux SPA в ответном сообщении",
                { message_id, chat_id: id }
              );

              registerReplyExpectation(
                message.message,
                async function ({ text, chat: { id } }) {
                  if (/^\d+$/.test(text)) {
                    const orderId = parseInt(text, 10);

                    const order = await Order.findByPk(orderId);

                    if (order) {
                      await bot.sendMessage(
                        id,
                        `Заказ №${orderId} от ${formatRU(
                          new Date(order.createdAt),
                          "d MMMM yyyy HH:mm"
                        )} на сумму ${format(order.total)} ₽`,
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
                              [
                                {
                                  text: "Проверить другой заказ",
                                  callback_data: ["order", "deluxspa"].join(
                                    ","
                                  ),
                                },
                              ],
                            ],
                          },
                        }
                      );
                    } else {
                      await bot.sendMessage(id, `Заказ №${orderId} не найден`, {
                        reply_markup: {
                          inline_keyboard: [
                            [
                              {
                                text: "Проверить другой заказ",
                                callback_data: ["order", "deluxspa"].join(","),
                              },
                            ],
                          ],
                        },
                      });
                    }
                  } else {
                    await bot.sendMessage(id, "Неверный номер заказа", {
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: "Проверить другой заказ",
                              callback_data: ["order", "deluxspa"].join(","),
                            },
                          ],
                        ],
                      },
                    });
                  }
                }
              );
            }
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
