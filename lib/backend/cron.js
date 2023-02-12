import { CronJob } from "cron";
import { Order } from "../backend/sequelize";
import { getPayment } from "./yookassa";
import get from "lodash/get";

const statusesToFetch = ["created", "pending"];

// TODO если заказ долго в pending, то лучше/ его отменить
// TODO отправлять письма при изменении статуса
new CronJob(
  "*/10 * * * *",
  async function () {
    const pendingOrders = await Order.findAll({
      where: {
        status: statusesToFetch,
      },
    });

    const kassaOrders = (
      await Promise.all(
        pendingOrders.map(({ paymentId }) => getPayment(paymentId))
      )
    ).reduce((orders, response) => {
      const id = get(response, "data.id");
      const status = get(response, "data.status");

      if (id && status && !statusesToFetch.includes(status)) {
        return { ...orders, [id]: status };
      }

      return orders;
    }, {});

    await Promise.all(
      pendingOrders
        .filter((order) => order.paymentId in kassaOrders)
        .map((order) => order.update({ status: kassaOrders[order.paymentId] }))
    );
  },
  null,
  true
);
