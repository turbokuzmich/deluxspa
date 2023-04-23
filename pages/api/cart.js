import property from "lodash/property";
import get from "lodash/get";
import withSession from "../../lib/backend/session";
import { csrf } from "../../lib/backend/csrf";
import initBot, { withApi } from "../../lib/backend/bot";
import { Order } from "../../lib/backend/sequelize"; // FIXME нужно использовать сервис
import { getChatIds } from "../../lib/backend/bot/auth";
import { subscribe } from "../../lib/backend/queue";
import createFormatter from "../../lib/helpers/markdown";
import { format } from "../../lib/helpers/numeral";
import { formatPhone } from "../../lib/helpers/phone";
import { getOrderViewUrl } from "../../lib/helpers/bot";
import {
  sendNewOrderEmail,
  sendOrderStatusEmail,
} from "../../lib/backend/letters";

import "../../lib/backend/cron";

const handlers = {
  "neon-beard-new-order": withApi(async function (api, input) {
    const chatIds = await getChatIds();

    const id = get(input, ["order", "id"]);
    const phone = get(input, ["order", "phone"]);
    const email = get(input, ["order", "email"]);
    const total = get(input, ["order", "total"]);

    const text = createFormatter()
      .bold(`На Neon Beard новый заказ №${id}`)
      .paragraph()
      .italic(`Сумма: ${format(total)}₽`)
      .newline()
      .italic(`Телефон: ${formatPhone(phone)}`);

    if (email) {
      text.newline().italic(`Email: ${email}`);
    }

    await Promise.all(
      chatIds.map((chatId) =>
        api.bot.sendMessage(chatId, text.toString(), {
          parse_mode: "MarkdownV2",
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
        })
      )
    );
  }),
  "deluxspa-new-order": [
    async function (data) {
      const order = await Order.findByPk(get(data, ["order", "id"]));

      if (order && order.email) {
        await sendNewOrderEmail(order);
      }
    },
    withApi(async function (api, input) {
      const chatIds = await getChatIds();

      const id = get(input, ["order", "id"]);
      const phone = get(input, ["order", "phone"]);
      const email = get(input, ["order", "email"]);
      const total = get(input, ["order", "total"]);

      const text = createFormatter()
        .bold(`На DeluxSPA новый заказ №${id}`)
        .paragraph()
        .italic(`Сумма: ${format(total)}₽`)
        .newline()
        .italic(`Телефон: ${formatPhone(phone)}`);

      if (email) {
        text.newline().italic(`Email: ${email}`);
      }

      await Promise.all(
        chatIds.map((chatId) =>
          api.bot.sendMessage(chatId, text.toString(), {
            parse_mode: "MarkdownV2",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Посмотреть",
                    web_app: {
                      url: getOrderViewUrl(id),
                    },
                  },
                ],
              ],
            },
          })
        )
      );
    }),
  ],
  "deluxspa-new-order-status": [
    async function (data) {
      const order = await Order.findByPk(get(data, ["id"]));

      if (order && order.email) {
        await sendOrderStatusEmail(order);
      }
    },
    withApi(async function (api, input) {
      const chatIds = await getChatIds();

      const id = get(input, "id");
      const status = get(input, "status");

      await Promise.all(
        chatIds.map((chatId) =>
          api.bot.sendMessage(chatId, `Новый статус заказа №${id}: ${status}`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Посмотреть",
                    web_app: {
                      url: getOrderViewUrl(id),
                    },
                  },
                ],
              ],
            },
          })
        )
      );
    }),
  ],
  "deluxspa-inactive-orders": withApi(async function (api, input) {
    const ids = get(input, "orders", []).map(property("id"));
    const chatIds = await getChatIds();

    const message = "Пожалуйста, актуализируйте статусы некоторых заказов";

    const reply_markup = {
      inline_keyboard: ids.map((id) => [
        {
          text: `Заказ №${id}`,
          web_app: {
            url: getOrderViewUrl(id),
          },
        },
      ]),
    };

    await Promise.all(
      chatIds.map((chatId) =>
        api.bot.sendMessage(chatId, message, { reply_markup })
      )
    );
  }),
  "deluxspa-new-feedback": withApi(async function (api, input) {
    const chatIds = await getChatIds();
    const key = get(input, "key");

    await Promise.all(
      chatIds.map((chatId) =>
        api.bot.sendMessage(chatId, "Новый вопрос на сайте Delux SPA", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Посмотреть",
                  callback_data: ["feedback", "view", key].join(),
                },
              ],
            ],
          },
        })
      )
    );
  }),
  "deluxspa-password-update": withApi(async function (api, input) {
    const uid = get(input, "uid", "");
    const key = get(input, "key", "");
    const name = get(input, "name", "");
    const entity = get(input, "entity", "");

    api.registerAutoDestroy(
      await api.bot.sendMessage(uid, `Пароль от ${name} установлен`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Посмотреть",
                callback_data: ["password", entity, key].join(","),
              },
            ],
          ],
        },
      })
    );
  }),
  "neon-beard-download": withApi(async function (api, input) {
    const chatIds = await getChatIds();

    const locale = get(input, "locale", "ru");
    const text = `Скачивание каталога ${locale} на Neon Beard`;

    await Promise.all(
      chatIds.map((chatId) => api.bot.sendMessage(chatId, text))
    );
  }),
  debug: withApi(async function (api, input) {
    const chatIds = await getChatIds();

    const text = get(input, "text");

    await Promise.all(
      chatIds.map((chatId) =>
        api.bot.sendMessage(chatId, text, {
          parse_mode: "MarkdownV2",
        })
      )
    );
  }),
};

subscribe(async function (type, data, message) {
  if (type in handlers) {
    try {
      await Promise.all(
        [].concat(handlers[type]).map((handler) => handler(data))
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return false;
});

if (process.env.TELEGRAM_BOT_ENABLED === "1") {
  initBot();
}

async function getCart(req, res) {
  await withSession(
    async function (session) {
      res.status(200).json({ items: get(session, "items", []) });
    },
    req,
    res
  );
}

// TODO validation
async function updateCart(req, res) {
  const session = await withSession(
    async function (session) {
      const { id, variant: variantStr, qty = 1, append = false } = req.body;

      const variant = parseInt(variantStr, 10);
      const items = get(session, "items", []);

      const itemsIndex = items.findIndex(
        ({ itemId, variantId }) => itemId === id && variantId === variant
      );

      if (itemsIndex > -1) {
        const currentQty = items[itemsIndex].qty;
        const newQty = append ? currentQty + qty : qty;

        if (newQty === 0) {
          session.items[itemsIndex].qty = 0;
          session.items.splice(itemsIndex, 1);
        } else {
          session.items[itemsIndex].qty = newQty;
        }
      } else {
        session.items.push({
          qty,
          itemId: id,
          variantId: variant,
        });
      }
    },
    req,
    res
  );

  res.status(200).json({ items: session.items });
}

export default csrf(async function (req, res) {
  if (req.method === "GET") {
    return getCart(req, res);
  } else if (req.method === "POST") {
    return updateCart(req, res);
  } else {
    res.status(405).json({});
  }
});
