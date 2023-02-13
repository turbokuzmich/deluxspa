import { getSession } from "../../lib/helpers/session";
import { createPayment } from "../../lib/backend/yookassa";
import t from "../../lib/helpers/i18n";
import * as yup from "yup";
import sequelize, { Order } from "../../lib/backend/sequelize";
import { sendNewOrderEmail } from "../../lib/backend/letters";
import { calculate } from "../../lib/backend/cdek";
import { notifyOfNewOrder } from "../../lib/backend/bot";
import omit from "lodash/omit";
import memoize from "lodash/memoize";

const getOrderValidators = memoize(() => {
  return yup.object().shape({
    phone: yup
      .string()
      .trim()
      .required(t("cart-page-phone-number-empty"))
      .matches(/^\d{10}$/, t("cart-page-phone-number-incorrect")),
    code: yup.string().trim().required(),
    city: yup.number().required(),
    name: yup.string().trim().required(),
    address: yup.string().trim().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
    email: yup.string().email(t("cart-page-email-incorrect")).nullable(),
    comment: yup.string().nullable(),
  });
});

function sanitize(orderData) {
  if (orderData.email === "") {
    return omit(orderData, "email");
  }

  return orderData;
}

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

    const orderData = sanitize(
      await getOrderValidators().validate(req.body, {
        strict: true,
        stripUnknown: true,
      })
    );

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

    const orderTransaction = await db.transaction();

    try {
      const [{ total_sum: delivery }, subtotal] = await Promise.all([
        await calculate(orderData.city, orderData.address),
        await session.getCartTotal(),
      ]);

      const order = await db.models.Order.create({
        ...orderData,
        subtotal,
        delivery,
        total: subtotal + delivery,
      });

      await db.models.OrderItem.bulkCreate(
        cartItems.map((item) => ({ ...item.orderData, OrderId: order.id }))
      );

      await orderTransaction.commit();

      const url = await createPayment(order);

      await Promise.all([sendNewOrderEmail(order), notifyOfNewOrder(order)]);

      res.status(200).json({ url });
    } catch (error) {
      console.log(error);
      await orderTransaction.rollback();

      return res.status(500).json({});
    }
  } else {
    res.status(405).json({});
  }
}
