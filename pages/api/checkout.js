import { getSession } from "../../lib/helpers/session";
import { createPayment } from "../../lib/backend/yookassa";
import t from "../../lib/helpers/i18n";
import * as yup from "yup";
import sequelize, { Order } from "../../lib/backend/sequelize";
import send, { sendNewOrderEmail } from "../../lib/backend/letters";

const orderValidators = yup.object().shape({
  phone: yup
    .string()
    .trim()
    .required(t("cart-page-phone-number-empty"))
    .matches(/^\d{10}$/, t("cart-page-phone-number-incorrect")),
  email: yup.string().email(t("cart-page-email-incorrect")),
  comment: yup.string(),
  address: yup.string().nullable(),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
});

export default async function checkout(req, res) {
  const db = await sequelize;

  if (req.method === "GET") {
    const { s, order: id, locale = "ru" } = req.query;

    const order = await Order.getByExternalId(id);

    if (!order) {
      return res.status(404).json({});
    }

    if (!order.validateHmac(s)) {
      return res.status(400).json({});
    }

    const session = await getSession(req, res);

    session.items = [];

    await session.commit();

    res.redirect(order.infoUrl);
  } else if (req.method === "POST") {
    // TODO CSRF
    // TODO sequelize transactions

    const orderData = await orderValidators.validate(req.body, {
      strict: true,
      stripUnknown: true,
    });

    const { sessionId } = await getSession(req, res);

    const session = await db.models.Session.findOne({
      where: { SessionId: sessionId },
    });

    if (!session) {
      return res.status(404).json({});
    }

    const cartItems = await session.getCartItems();

    if (cartItems.length === 0) {
      return res.status(400).json({});
    }

    // FIXME transaction
    const order = await db.models.Order.create({
      ...orderData,
    });

    await db.models.OrderItem.bulkCreate(
      cartItems.map((item) => ({ ...item.orderData, OrderId: order.id }))
    );

    try {
      const url = await createPayment(order);

      await sendNewOrderEmail(order);

      res.status(200).json({ url });
    } catch (error) {
      console.log(error);
      res.status(500).json({});
    }
  } else {
    res.status(405).json({});
  }
}
