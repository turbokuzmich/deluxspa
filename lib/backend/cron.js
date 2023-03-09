import { CronJob } from "cron";
import { Order } from "./sequelize";
import { getPayment } from "./yookassa";
import { updateAll } from "./cdek";
import { sendOrderStatus } from "./queue";
import get from "lodash/get";

// TODO если заказ долго в pending, то лучше/ его отменить
// TODO отправлять письма при изменении статуса
export const paymentsStatusesJob = new CronJob(
  "* * * * *",
  async function () {
    if (process.env.CRON_JOB_PAYMENTS === "1") {
      const pendingOrders = await Order.findAll({
        where: {
          status: "pending",
        },
      });

      const kassaPayments = await Promise.all(
        pendingOrders.map(({ paymentId }) =>
          getPayment(paymentId)
            .then((payment) => {
              const id = get(payment, "data.id");
              const status = get(payment, "data.status");

              if (id && status) {
                return { id, status };
              } else {
                return { id: paymentId, status: "pending" };
              }
            })
            .catch(() => ({
              id: paymentId,
              status: "canceled",
            }))
        )
      );

      const operations = pendingOrders.reduce((operations, order, index) => {
        const payment = kassaPayments[index];

        if (payment.status !== "pending") {
          operations.push(order.update({ status: payment.status }));

          if (payment.status === "succeeded") {
            operations.push(sendOrderStatus(order.id, "оплачен"));
          }

          if (payment.status === "canceled") {
            operations.push(sendOrderStatus(order.id, "отменен"));
          }
        }

        return operations;
      }, []);

      await Promise.all(operations);
    }
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
    let cdekJobFinished = true;

    return async function () {
      if (process.env.CRON_JOB_CDEK === "1") {
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
      }
    };
  })(),
  null,
  true,
  null,
  null,
  true
);
