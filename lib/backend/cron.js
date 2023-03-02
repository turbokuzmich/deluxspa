import { CronJob } from "cron";
import { Order } from "./sequelize";
import { getPayment } from "./yookassa";
import { updateAll } from "./cdek";
import get from "lodash/get";

// TODO если заказ долго в pending, то лучше/ его отменить
// TODO отправлять письма при изменении статуса
export const paymentsStatusesJob = new CronJob(
  "* * * * *",
  async function () {
    const pendingOrders = await Order.findAll({
      where: {
        status: "pending",
      },
    });

    const kassaOrders = (
      await Promise.all(
        pendingOrders.map(({ paymentId }) => getPayment(paymentId))
      )
    ).reduce((orders, response) => {
      const id = get(response, "data.id");
      const status = get(response, "data.status");

      if (id && status && status !== "pending") {
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
  true,
  null,
  null,
  true
);

// every 6 hours
export const cdekCitiesJob = new CronJob(
  "0 */6 * * *",
  (function () {
    let cdekJobFinished = false;

    return async function () {
      if (cdekJobFinished === false) {
        return;
      }

      cdekJobFinished = false;

      try {
        await updateAll();
      } catch (error) {
      } finally {
        cdekJobFinished = true;
      }
    };
  })(),
  null,
  true,
  null,
  null,
  true
);
