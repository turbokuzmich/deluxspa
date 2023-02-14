import sequelize, { Order } from "../../../lib/backend/sequelize";
import omit from "lodash/omit";
import { isAuthorized } from "../../../lib/backend/bot/webapp";

export default async function orders(req, res) {
  const input = get(req, "body.data", {});

  if (!(await isAuthorized(input))) {
    return res.status(401).json({});
  }

  await sequelize;

  const orders = (
    await Order.findAll({
      order: [["createdAt", "DESC"]],
    })
  ).map((order) => omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));

  res.status(200).json(orders);
}
