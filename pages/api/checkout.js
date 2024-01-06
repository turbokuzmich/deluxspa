import withSession, { getSessionId } from "../../lib/backend/session";
import { createPayment } from "../../lib/backend/yookassa";
import t from "../../lib/helpers/i18n";
import * as yup from "yup";
import { calculate } from "../../lib/backend/cdek";
import { csrf } from "../../lib/backend/csrf";
import { sendOrder } from "../../lib/backend/queue";
import omit from "lodash/omit";
import noop from "lodash/noop";
import memoize from "lodash/memoize";
import sequelize, {
  Order,
  OrderItem,
  Session,
  CartItem,
  User,
} from "../../lib/backend/sequelize";

const getOrderValidators = memoize(() => {
  return yup.object().shape({
    fio: yup.string().trim(),
    phone: yup
      .string()
      .trim()
      .required(t("cart-page-phone-number-empty"))
      .matches(/^\+?\d{9,13}$/, t("cart-page-phone-number-incorrect")),
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
  let sanitized = { ...orderData };

  if (sanitized.email === "") {
    sanitized = omit(sanitized, "email");
  }

  sanitized.phone = sanitized.phone.replace("+", "");

  return sanitized;
}

async function doCheckout(req, res) {
  const orderData = sanitize(
    await getOrderValidators().validate(req.body, {
      strict: true,
      stripUnknown: true,
    })
  );

  const id = getSessionId(req);

  if (id.isNone()) {
    return res.status(404).json({});
  }

  const session = await Session.findOne({
    where: { SessionId: id.unwrap() },
    include: [CartItem, User],
  });

  if (!session || session.CartItems.length === 0) {
    return res.status(404).json({});
  }

  const cartItems = session.CartItems;
  const orderTransaction = await sequelize.transaction();

  try {
    const [{ total_sum: delivery }, subtotal, subtotalWithDiscount, discount] =
      await Promise.all([
        await calculate(orderData.city, orderData.address, cartItems),
        await session.getCartTotal(),
        await session.getCartTotalWithDiscount(),
        await session.getDiscount(),
      ]);

    const order = await Order.create({
      ...orderData,
      discount,
      subtotal,
      delivery,
      total: subtotalWithDiscount + delivery,
      UserId: session.User?.id ?? null,
    });

    await OrderItem.bulkCreate(
      cartItems.map((item) => ({ ...item.orderData, OrderId: order.id }))
    );

    await orderTransaction.commit();

    const url = await createPayment(order);

    sendOrder(order).then(noop).catch(noop);

    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    await orderTransaction.rollback();

    return res.status(500).json({});
  }
}

async function finalizeCheckout(req, res) {
  const { s, order: id, locale = "ru" } = req.query;

  const order = await Order.getByExternalId(id);

  if (!order) {
    return res.status(404).json({});
  }

  if (!order.validateHmac(s)) {
    return res.status(400).json({});
  }

  await withSession(
    async function (session) {
      session.items = [];
    },
    req,
    res
  );

  res.redirect(order.infoUrl);
}

export default csrf(async function (req, res) {
  if (req.method === "GET") {
    return finalizeCheckout(req, res);
  } else if (req.method === "POST") {
    return doCheckout(req, res);
  } else {
    res.status(405).json({});
  }
});
