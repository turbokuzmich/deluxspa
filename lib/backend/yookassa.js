import axios from "axios";
import { v4 as uuid } from "uuid";
import { i18n } from "next-i18next";

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

export async function createPayment(order) {
  const [total, items] = await Promise.all([
    order.getOrderTotal(),
    order.getOrderItems(),
  ]);

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
        value: total.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        locale: locales[i18n.language],
        return_url: order.paymentReturnUrl,
      },
      metadata: {
        order: order.externalId,
        locale: i18n.language,
      },
      receipt: {
        customer: order.paymentData,
        items: items.map(({ title, variant, price, qty }) => ({
          vat_code: 1,
          quantity: qty,
          description: `${title} (${variant})`,
          amount: {
            value: price.toFixed(2),
            currency: "RUB",
          },
        })),
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

export default api;
