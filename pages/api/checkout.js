import { v4 as uuid } from "uuid";
import { getSession } from "../../lib/helpers/session";
import { getItemById } from "../../lib/helpers/catalog";
import { i18n } from "next-i18next";
import axios from "axios";
import get from "lodash/get";
import sequelize from "../../lib/backend/sequelize";

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

const locales = {
  ru: "ru_RU",
  en: "en_US",
};

// {
//   id: '2b6b93b5-000f-5000-9000-1ec8e23febb4',
//   status: 'pending',
//   amount: { value: '100.00', currency: 'RUB' },
//   description: 'Order 1',
//   recipient: { account_id: '945343', gateway_id: '2009333' },
//   created_at: '2023-01-31T20:54:13.749Z',
//   confirmation: {
//     type: 'redirect',
//     confirmation_url: 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=2b6b93b5-000f-5000-9000-1ec8e23febb4'
//   },
//   test: true,
//   paid: false,
//   refundable: false,
//   metadata: {}
// }
export default async function checkout(req, res) {
  const db = await sequelize;

  if (req.method === "GET") {
    // TODO валидация ключа

    const { order, locale = "ru" } = req.query;

    const session = await getSession(req, res);

    session.items = [];

    await session.commit();

    res.redirect(`/${locale}/order/${order}`);
  } else if (req.method === "POST") {
    // TODO проверка на нулевой заказ
    // TODO валидация полей через yup

    const orderData = [
      "phone",
      "email",
      "comment",
      "address",
      "lat",
      "lng",
    ].reduce((data, key) => {
      return req.body[key] ? { ...data, [key]: req.body[key] } : data;
    }, {});

    const { sessionId } = await getSession(req, res);

    const session = await db.models.Session.findOne({
      where: { SessionId: sessionId },
    });

    const [cartItems, cartTotal] = await Promise.all([
      session.getCartItems(),
      session.getCartTotal(),
    ]);

    const order = await db.models.Order.create({
      ...orderData,
    });

    await db.models.OrderItem.bulkCreate(
      cartItems.map((item) => ({ ...item.orderData, OrderId: order.id }))
    );

    try {
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
            value: cartTotal.toFixed(2),
            currency: "RUB",
          },
          capture: true,
          confirmation: {
            type: "redirect",
            locale: locales[i18n.language],
            // FIXME тут нужен хеш
            return_url: `${process.env.SITE_URL}/api/checkout?order=${order.key}&locale=${i18n.language}`,
          },
          save_payment_method: true,
          merchant_customer_id: order.paymentPhone,
          metadata: {
            order: order.externalId,
            locale: i18n.language,
          },
          receipt: {
            customer: order.paymentData,
            items: cartItems.map(({ title, variantId, price, qty }) => ({
              vat_code: 1,
              quantity: qty,
              description: `${title} (${variantId})`,
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

      res.status(200).json({ url: confirmation_url });
    } catch (error) {
      res.status(500).json({});
    }
  } else {
    res.status(405).json({});
  }
}
