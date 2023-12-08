import axios from "axios";
import get from "lodash/get";
import { v4 as uuid } from "uuid";
import { i18n } from "next-i18next";
import { getPriceWithDiscount } from "../helpers/order";

const locales = {
  ru: "ru_RU",
  en: "en_US",
};

const api = axios.create({
  baseURL: process.env.YOOKASSA_API_URL,
  auth: {
    username: process.env.YOOKASSA_SHOP_ID,
    password: process.env.YOOKASSA_SECRET_KEY,
  },
  header: {
    "content-type": "application/json",
  },
});

/**
 * @param {number} sum
 */
export async function createSBPPayment(sum) {
  const {
    data: {
      confirmation: { confirmation_data },
    },
  } = await api.post(
    "payments",
    {
      amount: {
        value: sum.toFixed(2),
        currency: "RUB",
      },
      payment_method_data: {
        type: "sbp",
      },
      confirmation: {
        type: "qr",
      },
      receipt: {
        customer: {
          email: "kurteev.d@yandex.ru",
        },
        items: [
          {
            vat_code: 1,
            quantity: 1,
            description: "Покупка на выставке",
            amount: {
              value: sum.toFixed(),
              currency: "RUB",
            },
          },
        ],
      },
      capture: true,
      description: "Оплата на выставке",
    },
    {
      headers: {
        "idempotence-key": uuid(),
      },
    }
  );

  return confirmation_data;
}

export async function createPayment(order) {
  const items = await order.getOrderItems();
  const lang = get(i18n, "language", "ru");

  const {
    data: {
      id: paymentId,
      status,
      confirmation: { confirmation_url },
    },
  } = await api.post(
    "payments",
    {
      amount: {
        value: order.total.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        locale: locales[lang],
        return_url: order.paymentReturnUrl,
      },
      metadata: {
        user: order.UserId ?? 0,
        discount: order.discount,
        order: order.externalId,
        locale: lang,
      },
      receipt: {
        customer: order.paymentData,
        items: items
          .map(({ title, variant, price, qty }) => ({
            vat_code: 1,
            quantity: qty,
            description: `${title} (${variant})`,
            amount: {
              value: getPriceWithDiscount(price, order.discount).toFixed(2),
              currency: "RUB",
            },
          }))
          .concat({
            vat_code: 1,
            quantity: 1,
            description: "Доставка СДЭК",
            amount: {
              value: order.delivery.toFixed(2),
              currency: "RUB",
            },
          }),
      },
      description: `Заказ №${order.externalId}`,
    },
    {
      headers: {
        "idempotence-key": uuid(),
      },
    }
  );

  await order.update({ paymentId, status });

  return confirmation_url;
}

export async function getPayment(id) {
  return await api.get(`payments/${id}`, {
    headers: {
      "idempotence-key": uuid(),
    },
  });
}

export default api;
