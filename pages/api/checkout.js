import { getSession } from "../../lib/helpers/session";
import { createPayment } from "../../lib/backend/yookassa";
import sequelize, { Order } from "../../lib/backend/sequelize";

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

    res.redirect(`/${locale}/order/${id}-${s}`);
  } else if (req.method === "POST") {
    // TODO CSRF
    // TODO проверка на нулевой заказ
    // TODO валидация полей через yup
    // TODO sequelize transactions

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

      res.status(200).json({ url });
    } catch (error) {
      console.log(error);
      res.status(500).json({});
    }
  } else {
    res.status(405).json({});
  }
}
