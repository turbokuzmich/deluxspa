import { v4 as uuid } from "uuid";
import { getSession } from "../../lib/helpers/session";
import { getItemById } from "../../lib/helpers/catalog";
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
  if (req.method === "GET") {
    // TODO валидация ключа
    // TODO показать успех один раз

    const { order: key } = req.query;

    const [order, session] = await Promise.all([
      sequelize.models.order.findOne({ where: { key } }),
      getSession(req, res),
    ]);

    session.items = [];

    await Promise.all([order.update({ returned: true }), session.commit()]);

    res.redirect("/");
  } else if (req.method === "POST") {
    // TODO проверка на нулевой заказ
    // TODO валидация полей через yup
    // FIXME не создается заказ только с телефоном

    const orderKey = uuid();
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

    const session = await getSession(req, res);
    const cartItems = get(session, "items", []);

    const { total, items } = cartItems.reduce(
      (result, cartItem) => {
        const catalogItem = getItemById(cartItem.itemId);
        const variant = catalogItem.variants.byId[cartItem.variantId];

        result.items.push({
          title: catalogItem.title,
          variant: cartItem.variantId,
          price: variant.price,
          qty: cartItem.qty,
        });

        result.total += cartItem.qty * variant.price;

        return result;
      },
      {
        total: 0,
        items: [],
      }
    );

    const order = await sequelize.models.order.create({
      key: orderKey,
      paid: false,
      returned: false,
      ...orderData,
    });

    await sequelize.models.orderItem.bulkCreate(
      items.map((item) => ({ ...item, orderId: order.id }))
    );

    try {
      const {
        data: {
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
            return_url: `http://localhost:3000/api/checkout?order=${orderKey}`,
          },
          metadata: {
            order: order.id,
          },
          receipt: {
            phone: `7${req.body.phone}`, // FIXME clean
            email: req.body.email, // FIXME clean
            customer: {
              phone: `7${req.body.phone}`, // FIXME clean
              email: req.body.email, // FIXME clean
            },
            items: items.map(({ title, variant, price, qty }) => ({
              vat_code: 1,
              quantity: qty,
              description: `${title} ${variant}`,
              amount: {
                value: price.toFixed(2),
                currency: "RUB",
              },
            })),
          },
          description: `Заказ №${order.id}`,
        },
        {
          headers: {
            "idempotence-key": uuid(),
          },
        }
      );

      res.status(200).json({ url: confirmation_url });
    } catch (error) {
      res.status(500).json({});
    }
  } else {
    res.status(405).json({});
  }
}
