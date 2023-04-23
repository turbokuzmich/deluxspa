import { CronJob } from "cron";
import { Order } from "./sequelize";
// import { getPayment } from "./yookassa";
import { getTransaction } from "./modulbank";
import { updateAll } from "./cdek";
import { sendOrderStatus } from "./queue";
import get from "lodash/get";

function convertModulBankState(state) {
  if (state === "PROCESSING" || state === "WAITING_FOR_3DS") {
    return "pending";
  } else if (state === "COMPLETE") {
    return "succeeded";
  } else {
    return "canceled";
  }
}

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

      const transactionStatuses = await Promise.all(
        pendingOrders.map(({ paymentId }) =>
          getTransaction(paymentId)
            .then((payment) => {
              const id = get(payment, "data.transaction.transaction_id");

              const status = convertModulBankState(
                get(payment, "data.transaction.state")
              );

              if (id && status) {
                return { id, status };
              } else {
                return { id: paymentId, status: "pending" };
              }
            })
            .catch(() => {
              return {
                id: paymentId,
                status: "canceled",
              };
            })
        )
      );

      const operations = pendingOrders.reduce((operations, order, index) => {
        const payment = transactionStatuses[index];

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
