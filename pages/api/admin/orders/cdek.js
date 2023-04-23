import get from "lodash/get";
import omit from "lodash/omit";
import { Order, OrderItem } from "../../../../lib/backend/sequelize";
import { restricted } from "../../../../lib/middleware/admin";

export default restricted(async function bindCdek(req, res) {
  const orderId = get(req, ["body", "order"], "");
  const cdekId = get(req, ["body", "cdek"], "");

  const order = await Order.findByPk(orderId, {
    include: [OrderItem],
  });

  if (order) {
    await order.update({ cdekOrderId: cdekId });

    res.status(200).json(omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));
  } else {
    res.status(404).json({});
  }
});
