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
import { join } from "path";
import json2md, { escape } from "../../helpers/markdown";
import { suggestLink, addLink } from "../wiki.js";
import { getEmails, getEmailPassword, addEmailPassword } from "../cloud.js";
import { format } from "../../helpers/numeral";
import { formatRU } from "../../helpers/date";
import { URL } from "url";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";
import unset from "lodash/unset";
import decline from "../../helpers/declension.js";
import { Order, FeedbackRequest } from "../sequelize.js";
import { getAssortment } from "../moysklad.js";
import { getItemById, formatCapacity } from "../../helpers/catalog.js";
import { format as formatNumber } from "../../helpers/numeral";
import { Left, Right } from "@sniptt/monads";
import { createHash } from "crypto";
import { v4 as uuid } from "uuid";
import t from "../../helpers/i18n";
import { set } from "lodash";
import s3 from "../aws";

function getOrderViewUrl(id) {
  const orderUrl = new URL(process.env.ADMIN_URL);

  orderUrl.pathname = join(orderUrl.pathname, "orders");
  orderUrl.searchParams.set("order_id", id);

  return orderUrl.toString();
}

function getPasswordUrl(type, key = "") {
  const passwordUrl = new URL(process.env.ADMIN_URL);

  passwordUrl.pathname = join(passwordUrl.pathname, "password");
  passwordUrl.searchParams.set("type", type);
  passwordUrl.searchParams.set("key", key);

  return passwordUrl.toString();
}

const isProduction = process.env.NODE_ENV === "production";

const rootRegExp = /^\/root$/;

const commands = {
  start: { description: "Начало работы с ботом DeluxSPA" },
  auth: { description: "Авторизация в системе" },
  admin: { description: "Управление сайтами" },
  uploads: { description: "Загрузки" },
  links: { description: "Ссылки" },
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

const rootCommands = {
  users: { description: "Управление пользователями" },
  passwords: { description: "Управление паролями" },
};

const rootCommandsRegExps = Object.keys(rootCommands).reduce(
  (regExps, command) => ({
    ...regExps,
    [command]: new RegExp(`^\/${command}`),
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

                try {
                  await bot.deleteMessage(id, message_id);
                } catch (_) {}
              }
            }, timeout);
          };
        })();

        const registerAutoDestroy = function (
          { message_id, chat: { id } },
          ttl = 15000
        ) {
          setTimeout(async function () {
            try {
              await bot.deleteMessage(id, message_id);
            } catch (_) {}
          }, ttl);
        };

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
              message_id,
              chat: { id },
            } = message;

            await bot.sendMessage(id, "Управление сайтом", {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Заказы",
                      callback_data: "order",
                    },
                    {
                      text: "Остатки",
                      callback_data: "stock",
                    },
                  ],
                ],
              },
            });

            await bot.deleteMessage(id, message_id);
          })
        );

        bot.onText(commandRegExps.auth, async function (message) {
          const {
            message_id,
            from: { first_name, last_name },
            chat: { id },
          } = message;

          const name = [first_name, last_name].filter(Boolean).join(" ");

          await bot.deleteMessage(id, message_id);

          if (await isAuthorized(id)) {
            await bot.sendMessage(
              id,
              `${name}, вы авторизованы. Здесь скоро появится список ваших персональных команд`
            );
          } else {
            const unauthorizedMessage = await bot.sendMessage(
              id,
              `${name}, вы не авторизованы. Для авторизации вам будет необходимо ввести проверочный код, который придет на почту info@deluxspa.ru`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Отправить проверочный код",
                        callback_data: "authorize",
                      },
                    ],
                  ],
                },
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
            await bot.sendMessage(
              id,
              `${name}, у вас админский доступ. Ниже список доступных комманд`,
              {
                reply_markup: {
                  keyboard: [
                    ...Object.keys(rootCommands).map((command) => [
                      {
                        text: `/${command} — ${rootCommands[command].description}`,
                      },
                    ]),
                  ],
                  is_persistent: false,
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              }
            );
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
          rootCommandsRegExps.users,
          root(async function ({ chat: { id }, message_id }) {
            const users = await getUsers();
            const info = await Promise.all(
              users.map(({ chatId }) => bot.getChat(chatId))
            );

            const text = ["Пользователи системы", ""]
              .concat(
                info.map(({ id, first_name, last_name, username }) =>
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
              )
              .join("\n");

            await bot.sendMessage(id, text);
          })
        );

        bot.onText(
          rootCommandsRegExps.passwords,
          root(async function ({ chat: { id }, message_id, text }) {
            await bot.deleteMessage(id, message_id);

            await bot.sendMessage(
              id,
              "Пожалуйста, подскажите от какой системы вам требуется пароль?",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Сайты",
                        switch_inline_query_current_chat:
                          "?command=search-sites&query=",
                      },
                      {
                        text: "Почта",
                        callback_data: ["passwords", "email"].join(","),
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
              message_id,
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

            await bot.deleteMessage(id, message_id);
          })
        );

        bot.onText(
          commandRegExps.links,
          restricted(async function ({ from, chat: { id } }) {
            await bot.sendMessage(id, "Управление ссылками", {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Искать",
                      switch_inline_query_current_chat:
                        "?command=search-link&text=",
                    },
                    {
                      text: "Добавить",
                      callback_data: ["links", "add"].join(","),
                    },
                  ],
                ],
              },
            });
          })
        );

        bot.on("callback_query", async function (message) {
          const {
            data,
            from: { first_name, last_name },
          } = message;

          const id = get(message, ["message", "chat", "id"]);
          const message_id = get(message, ["message", "message_id"]);

          const [command, ...params] = data.split(",");

          if (command === "stock") {
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

            if (site) {
            } else {
              await bot.sendMessage(
                id,
                "Выберите проект для управления заказами",
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Delux SPA",
                          switch_inline_query_current_chat:
                            "?command=view-order&id=",
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
            }
          }

          if (command === "authorize") {
            await bot.deleteMessage(id, message_id);

            const name = [first_name, last_name].filter(Boolean).join(" ");

            const verificationMessage = await bot.sendMessage(
              id,
              `${name}, На почту info@deluxspa.ru направлен проверочный код. Пожалуйста, укажите его в ответном сообщении`,
              {
                reply_markup: {
                  force_reply: true,
                },
              }
            );

            await sendVerificationEmail(id, name);

            registerReplyExpectation(verificationMessage, async ({ text }) => {
              // const [isSuccess, message] = await authorize(id, text);
              const isSuccess = true;
              const message = "asd";

              if (isSuccess) {
                await bot.sendMessage(id, `${name}, вы успешно авторизовались`);
              } else {
                await bot.sendMessage(
                  id,
                  `Ну удалось авторизоваться. ${message}`
                );
              }
            });
          }

          if (command === "links") {
            const [action] = params;

            if (action === "add") {
              registerReplyExpectation(
                await bot.sendMessage(
                  id,
                  "Добавьте ссылку в ответном сообщении",
                  {
                    reply_markup: {
                      force_reply: true,
                    },
                  }
                ),
                async function ({ text }) {
                  await addLink(text, message.from);

                  await bot.sendMessage(id, "Ссылка добавлена");
                }
              );
            }
          }

          if (command === "passwords") {
            const [type] = params;

            if (type === "email") {
              await bot.editMessageText("Выберите действие с паролями почты", {
                chat_id: id,
                message_id,
              });
              await bot.editMessageReplyMarkup({
                inline_keyboard: [
                  [
                    {
                      text: "Добавить",
                      web_app: {
                        url: getPasswordUrl("email"),
                      },
                    },
                  ],
                  [
                    {
                      text: "Посмотреть",
                      switch_inline_query_current_chat: `?command=search-emails&key=${uuid()}&query=`,
                    },
                  ],
                ],
              });
            }
          }
        });

        bot.on("inline_query", async function (message) {
          const { id, query } = message;

          const params = new URLSearchParams(query);
          const command = params.get("command");

          if (command === "search-emails") {
            const email = params.has("query") ? params.get("query") : "";
            const results = await getEmails(email, params.get("key"));

            await bot.answerInlineQuery(
              id,
              results.map(function (email) {
                return {
                  id: email,
                  title: email,
                  type: "article",
                  input_message_content: {
                    message_text: `Пароль для адреса ${email}:`,
                  },
                };
              }),
              { cache_time: 0 }
            );
          }

          if (command === "view-order") {
            const orderId = String(parseInt(params.get("id"), 10) || "");
            const orders = await Order.suggestById(orderId);

            await bot.answerInlineQuery(
              id,
              orders.map((order) => ({
                id: order.id,
                type: "article",
                title: `Заказ №${order.id} (${order.externalId})`,
                description: `На сумму ${format(order.total)}₽ от ${formatRU(
                  new Date(order.get("createdAt")),
                  "d MMMM yyyy HH:mm"
                )} (${order.status})`,
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
                        text: "Редактировать",
                        callback_data: [
                          "order",
                          "deluxspa",
                          "edit",
                          order.id,
                        ].join(","),
                      },
                    ],
                  ],
                },
                input_message_content: {
                  message_text: `Информация по заказу №${order.id}`,
                },
              })),
              { cache_time: 0 }
            );
          }

          if (command === "search-link") {
            const text = params.has("text") ? params.get("text") : "";

            const links = await suggestLink(text);

            await bot.answerInlineQuery(
              id,
              links.map(({ link, date, author }) => ({
                id: link,
                type: "article",
                url: link,
                title: link,
                description: `Добавил ${author} ${date}`,
                input_message_content: {
                  message_text: link,
                },
              })),
              { cache_time: 0 }
            );
          }
        });

        bot.on("chosen_inline_result", async function (result) {
          const {
            from: { id },
            query,
            result_id,
          } = result;

          const params = new URLSearchParams(query);
          const command = params.get("command");

          if (command === "search-emails") {
            const password = await getEmailPassword(result_id);

            return registerAutoDestroy(
              await bot.sendMessage(
                id,
                json2md([
                  {
                    bold: escape(
                      "Вы можете скопировать пароль, нажав на него."
                    ),
                  },
                  {
                    inline: escape(password),
                  },
                  {
                    italic: escape(
                      "Это сообщение удалится автоматически через 15 секунд"
                    ),
                  },
                ]),
                {
                  parse_mode: "MarkdownV2",
                  protect_content: true,
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Изменить",
                          web_app: {
                            url: getPasswordUrl("email", result_id),
                          },
                        },
                      ],
                    ],
                  },
                }
              )
            );
          }
        });

        return bot;
      });

    bot = Right(botPromise);

    return botPromise;
  };

  return registrator;
})();

export const notifyOfNewOrder = registerMethod(async function (bot, order) {
  const chatIds = await getChatIds();

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

    return async function (bot, { key, name, phone, email, message }) {
      const chatIds = await getChatIds();

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

export const notifyOfPasswordSet = registerMethod(async function (
  bot,
  { type, key, password, userId }
) {
  if (type === "email") {
    await addEmailPassword(key, password);

    await bot.sendMessage(userId, `Пароль от ${key} успешно установлен`);
  }
});

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
