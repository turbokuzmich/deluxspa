import { Order, OrderItem } from "../../../lib/backend/sequelize";
import omit from "lodash/omit";
import get from "lodash/get";
import { restricted } from "../../../lib/middleware/admin";

export default async function orders(req, res) {
  const id = get(req, ["query", "id"], null);

  if (id) {
    const order = await Order.findByPk(id, {
      include: [OrderItem],
    });

    if (order) {
      res.status(200).json(omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));
    } else {
      res.status(404).json();
    }
  } else {
    const orders = (
      await Order.findAll({
        order: [["createdAt", "DESC"]],
        include: [OrderItem],
      })
    ).map((order) => omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));

    res.status(200).json(orders);
  }
}
