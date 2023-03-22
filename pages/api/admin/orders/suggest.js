import get from "lodash/get";
import { Order } from "../../../../lib/backend/sequelize";
import { restricted } from "../../../../lib/middleware/admin";

export default restricted(async function suggestOrders(req, res) {
  const query = get(req, ["query", "query"], "");
  const orders = await Order.suggestById(query);

  res.status(200).json(orders.map((order) => order.toJSON()));
});
