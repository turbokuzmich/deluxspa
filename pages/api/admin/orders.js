import { Order, OrderItem } from "../../../lib/backend/sequelize";
import omit from "lodash/omit";
import { restricted } from "../../../lib/middleware/admin";

export default restricted(async function orders(_, res) {
  const orders = (
    await Order.findAll({
      order: [["createdAt", "DESC"]],
      include: [OrderItem],
    })
  ).map((order) => omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));

  res.status(200).json(orders);
});
