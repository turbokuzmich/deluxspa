import {
  isRoot,
  isAuthorized,
  sendVerificationEmail,
  authorize,
  restricted,
  root,
  getUsers,
} from "./auth.js";
import { getEmails, getEmailPassword, getSitePassword } from "../cloud.js";
import { Order, Point, LockBoxSite } from "../sequelize.js";
import createFormatter from "../../helpers/markdown";
import { formatPointInfo } from "../../helpers/cdek.js";
import { suggestLink, addLink } from "../wiki.js";
import { format } from "../../helpers/numeral";
import { formatRU } from "../../helpers/date";
import { formatPhone } from "../../helpers/phone.js";
import TelegramBot from "node-telegram-bot-api";
import get from "lodash/get.js";
import decline from "../../helpers/declension.js";
import { getAssortment } from "../moysklad.js";
import { getItemById, formatCapacity } from "../../helpers/catalog.js";
import { getOrderViewUrl, getPasswordUrl } from "../../helpers/bot.js";
import { format as formatNumber } from "../../helpers/numeral";
import { v4 as uuid } from "uuid";
import t from "../../helpers/i18n";
import { viewOrder, listOrders } from "../neon.js";
import { getNeonBeardCatalogs, uploadNeonBeardCatalog } from "../storage";
import { getFeedback, sendFeedbackResponse } from "./admin.js";

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

/**
 * @type {TelegramBot}
 */
let bot = null;

let registerReplyExpectation = () => {};
let registerAutoDestroy = () => {};

let waiters = [];
let initializing = false;

async function getApi() {
  if (process.env.TELEGRAM_BOT_ENABLED === "1") {
    if (bot) {
      return { bot, registerReplyExpectation, registerAutoDestroy };
    } else {
      if (initializing) {
        return new Promise(function (resolve) {
          waiters.push(resolve);
        });
      } else {
        if (isProduction === false && global.bot) {
          console.log("stopping old bot");
          await global.bot.stopPolling();
          console.log("old bot stopped");
        }

        async function viewEmailPassword(chatId, email) {
          const password = await getEmailPassword(email);

          return registerAutoDestroy(
            await bot.sendMessage(
              chatId,
              createFormatter()
                .inline(password)
                .space()
                .text("(нажимте, чтоюбы скопировать)")
                .paragraph()
                .italic("Это сообщение удалится автоматически через 15 секунд")
                .toString(),
              {
                parse_mode: "MarkdownV2",
                protect_content: true,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Изменить",
                        web_app: {
                          url: getPasswordUrl("email", email),
                        },
                      },
                    ],
                    [
                      {
                        text: "Отправить",
                        callback_data: [
                          "send",
                          "password",
                          "email",
                          email,
                        ].join(","),
                      },
                    ],
                  ],
                },
              }
            )
          );
        }

        async function viewSitePassword(id, key) {
          const site = await LockBoxSite.findByPk(key);
          const password = await getSitePassword(site.lockBoxKey);

          const text = createFormatter()
            .bold(`Доступ к ${site.name}`)
            .paragraph();

          if (site.url) {
            text.text("Адрес сайта:").space().text(site.url).newline();
          }
          if (site.brief) {
            text.text("Описание:").space().text(site.brief).newline();
          }

          text
            .text("Логин:")
            .space()
            .inline(site.login)
            .newline()
            .text("Пароль:")
            .space()
            .inline(password)
            .paragraph()
            .italic("Это сообщение удалится автоматически через 15 секунд");

          return registerAutoDestroy(
            await bot.sendMessage(id, text.toString(), {
              parse_mode: "MarkdownV2",
              protect_content: true,
            })
          );
        }

        bot = new TelegramBot(
          process.env.TELEGRAM_API_TOKEN,
          isProduction ? { webHook: true } : { polling: true }
        );

        registerReplyExpectation = (function () {
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

        registerAutoDestroy = function (
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
                        callback_data: ["passwords", "site"].join(","),
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
            id: queryId,
            data,
            from: { first_name, last_name },
          } = message;

          const message_id = get(message, ["message", "message_id"]);

          const id = get(
            message,
            ["message", "chat", "id"],
            get(message, ["from", "id"])
          );

          const [command, ...params] = data.split(",");

          await bot.answerCallbackQuery(queryId, {
            callback_query_id: queryId,
            show_alert: false,
          });

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
                const catalogs = await getNeonBeardCatalogs(locale);

                await bot.editMessageText(
                  `${catalogs.length} ${decline(catalogs.length, [
                    "последний каталог",
                    "последних каталога",
                    "последних каталогов",
                  ])} Neon Beard на ${flag}`,
                  { message_id, chat_id: id }
                );
                await bot.editMessageReplyMarkup(
                  {
                    inline_keyboard: [
                      ...catalogs,
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

                  await bot.sendChatAction(id, "upload_document");

                  const resultMessagePrefix =
                    "Подождите, пока файл загрузится в хранилище";

                  const resultMessage = await bot.sendMessage(
                    id,
                    [resultMessagePrefix, "(0%)"].join(" ")
                  );

                  const { location, date } = await uploadNeonBeardCatalog(
                    bot.getFileStream(document.file_id),
                    locale,
                    async function ({ loaded, total }) {
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
                    }
                  );

                  await bot.editMessageText(
                    `Каталог Neon Beard ${flag} от ${formatRU(
                      date
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
                            url: location,
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
              if (site === "neon") {
                const [, orderId] = params;

                if (orderId) {
                  const { status, text, order } = await viewOrder(orderId);

                  if (status === "success") {
                    const keyboard = [
                      [{ text: "Открыть на сайте", url: order.infoUrl }],
                    ];

                    if (order.type === "cdek") {
                      keyboard.push([
                        {
                          text: "Информация о пукте выдачи",
                          callback_data: [
                            "cdek",
                            "point",
                            "view",
                            order.cdekPointCode,
                          ].join(","),
                        },
                      ]);
                    }

                    await bot.sendMessage(id, text, {
                      parse_mode: "MarkdownV2",
                      reply_markup: {
                        inline_keyboard: keyboard,
                      },
                    });

                    if (
                      order.type === "courier" &&
                      order.courierLat &&
                      order.courierLng
                    ) {
                      await bot.sendLocation(
                        id,
                        order.courierLat,
                        order.courierLng
                      );
                    }
                  } else {
                    await bot.sendMessage(
                      id,
                      "Не удалось получить информацию по заказу"
                    );
                  }
                }
              }
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
                            "?command=view-order&site=deluxspa&id=",
                        },
                        {
                          text: "Neon Beard",
                          switch_inline_query_current_chat:
                            "?command=view-order&site=neon&id=",
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
              await bot.editMessageReplyMarkup(
                {
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
                },
                {
                  chat_id: id,
                  message_id,
                }
              );
            }
            if (type === "site") {
              await bot.editMessageText("Выберите действие с паролями сайтов", {
                chat_id: id,
                message_id,
              });
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "Добавить",
                        web_app: {
                          url: getPasswordUrl("site"),
                        },
                      },
                    ],
                    [
                      {
                        text: "Посмотреть",
                        switch_inline_query_current_chat: `?command=search-sites&key=${uuid()}&query=`,
                      },
                    ],
                  ],
                },
                {
                  chat_id: id,
                  message_id,
                }
              );
            }
          }

          if (command === "password") {
            const [type] = params;

            if (type === "email") {
              const [, email] = params;

              await viewEmailPassword(id, email);
            }
            if (type === "site") {
              const [, siteId] = params;

              await viewSitePassword(id, siteId);
            }
          }

          if (command === "send") {
            const [resource, type, key, recipient] = params;

            if (resource === "password") {
              if (type === "email") {
                if (recipient) {
                  await bot.sendMessage(
                    recipient,
                    `Вам доступен пароль от ${key}`,
                    {
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: "Посмотреть",
                              callback_data: ["password", "email", key].join(
                                ","
                              ),
                            },
                          ],
                        ],
                      },
                    }
                  );
                } else {
                  const users = await getUsers();
                  const info = await Promise.all(
                    users.map(({ chatId }) => bot.getChat(chatId))
                  );

                  await bot.sendMessage(
                    id,
                    `Выберите, кому отправить пароль от ${key}:`,
                    {
                      reply_markup: {
                        inline_keyboard: info.map(
                          ({ id, first_name, last_name, username }) => [
                            {
                              text: [
                                first_name,
                                last_name,
                                username ? `(${username})` : undefined,
                              ].join(" "),
                              callback_data: [
                                "send",
                                "password",
                                "email",
                                key,
                                id,
                              ].join(","),
                            },
                          ]
                        ),
                      },
                    }
                  );
                }
              }
            }
          }

          if (command === "cdek") {
            const [entity, action, entityId] = params;

            if (entity === "point") {
              if (action === "view") {
                const point = await Point.findOne({
                  where: {
                    code: entityId,
                  },
                });

                if (point) {
                  const info = JSON.parse(point.info);

                  await bot.sendMessage(id, formatPointInfo(info), {
                    parse_mode: "MarkdownV2",
                  });
                  await bot.sendLocation(
                    id,
                    get(info, ["location", "latitude"], 0),
                    get(info, ["location", "longitude"], 0)
                  );
                } else {
                  await bot.sendMessage(
                    id,
                    createFormatter()
                      .text("Пункт выдачи СДЭК")
                      .space()
                      .inline(entityId)
                      .space()
                      .text("не найден")
                      .toString(),
                    {
                      parse_mode: "MarkdownV2",
                    }
                  );
                }
              }
            }
          }

          if (command === "feedback") {
            const [action, key] = params;

            if (action === "view") {
              const { status, feedback } = await getFeedback(id, key);

              if (status === "success") {
                const name = get(feedback, "name", "не указан");
                const phone = formatPhone(get(feedback, "phone"));
                const email = get(feedback, "email", "не указан");
                const message = get(feedback, "message", "—");
                const isResponded = Boolean(feedback.response);
                const response = get(feedback, "response", "—");
                const createdAt = formatRU(
                  new Date(get(feedback, "createdAt"))
                );

                const text = createFormatter()
                  .bold("Вопрос на сайте Delux SPA от")
                  .space()
                  .bold(createdAt)
                  .paragraph()
                  .inline(message)
                  .paragraph()
                  .definition("От", name)
                  .newline()
                  .definition("Телефон", phone)
                  .newline()
                  .definition("Электронный адрес", email)
                  .paragraph();

                if (isResponded) {
                  text
                    .bold("Была дана обратная связь")
                    .paragraph()
                    .inline(response);
                } else {
                  text.italic(
                    "Вы можете дать обратную связь, ответив на это сообщение"
                  );
                }

                registerReplyExpectation(
                  await bot.sendMessage(id, text.toString(), {
                    parse_mode: "MarkdownV2",
                  }),
                  async function ({ text }) {
                    const { status } = await sendFeedbackResponse(
                      id,
                      key,
                      text
                    );

                    if (status === "success") {
                      await bot.sendMessage(id, "Ответ успешно отправлен");
                    } else {
                      await bot.sendMessage(id, "Не удалось отправить ответ");
                    }
                  }
                );
              } else {
                await bot.sendMessage(id, "Не удалось найти вопрос");
              }
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

          if (command === "search-sites") {
            const site = params.has("query") ? params.get("query") : "";
            const results = await LockBoxSite.suggest(site);

            await bot.answerInlineQuery(
              id,
              results.map(function (site) {
                return {
                  id: site.id,
                  title: site.name,
                  description: site.brief ? site.brief : "",
                  type: "article",
                  input_message_content: {
                    message_text: `Пароль для ${site.name}`,
                  },
                };
              }),
              { cache_time: 0 }
            );
          }

          if (command === "view-order") {
            const orderId = String(parseInt(params.get("id"), 10) || "");
            const site = params.get("site");

            if (site === "deluxspa") {
              const orders = await Order.suggestById(orderId);

              await bot.answerInlineQuery(
                id,
                orders.map((order) => ({
                  id: order.id,
                  type: "article",
                  title: `Заказ №${order.id} (${order.externalId})`,
                  description: `На сумму ${format(order.total)}₽ от ${formatRU(
                    new Date(order.get("createdAt"))
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

            if (site === "neon") {
              const orders = await listOrders(orderId);

              await bot.answerInlineQuery(
                id,
                orders.map(
                  ({ order: { id, infoUrl }, title, description }) => ({
                    id,
                    title,
                    description,
                    type: "article",
                    reply_markup: {
                      inline_keyboard: [
                        [
                          {
                            text: "Посмотреть",
                            callback_data: ["order", "neon", id].join(","),
                          },
                        ],
                      ],
                    },
                    input_message_content: {
                      message_text: `Информация по заказу №${id} Neon Beard`,
                    },
                  })
                ),
                { cache_time: 0 }
              );
            }
          }

          if (command === "search-link") {
            const text = params.has("text") ? params.get("text") : "";
            const links = await suggestLink(text);

            await bot.answerInlineQuery(
              id,
              links.map(({ id, link, date, author }) => ({
                id,
                type: "article",
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
            await viewEmailPassword(id, result_id);
          }

          if (command === "search-sites") {
            await viewSitePassword(id, result_id);
          }
        });

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

        const api = { bot, registerReplyExpectation, registerAutoDestroy };

        waiters.forEach((waiter) => waiter(api));
        waiters = [];

        initializing = false;

        return api;
      }
    }
  } else {
    return Promise.resolve(null);
  }
}

export function withApi(handler) {
  return async function (...args) {
    const api = await getApi();

    if (api === null) {
      return Promise.resolve(null);
    }

    return handler(api, ...args);
  };
}

export default async function init() {
  await getApi();
}
