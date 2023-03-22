import { Order, OrderItem } from "../../../../lib/backend/sequelize";
import omit from "lodash/omit";
import get from "lodash/get";
import { orderStatuses } from "../../../../constants";
import { restricted } from "../../../../lib/middleware/admin";

export default restricted(async function orders(req, res) {
  const id = get(req, ["query", "id"], null);

  if (id) {
    const order = await Order.findByPk(id, {
      include: [OrderItem],
    });

    if (order === null) {
      res.status(404).json();
    }

    if (req.method === "POST") {
      const status = get(req, ["body", "status"]);

      if (orderStatuses.includes(status)) {
        await order.update({ status });

        res
          .status(200)
          .json(omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));
      } else {
        res.status(400).json();
      }
    } else {
      res.status(200).json(omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));
    }
  } else {
    const filter = get(req, ["query", "filter"]);

    const base = {
      order: [["createdAt", "DESC"]],
      include: [OrderItem],
    };

    const orders = (
      await Order.findAll(
        filter
          ? {
              ...base,
              where: {
                status: filter,
              },
            }
          : base
      )
    ).map((order) => omit(order.toJSON(), ["hmac", "paymentReturnUrl"]));

    res.status(200).json(orders);
  }
});
