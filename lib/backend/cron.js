import { CronJob } from "cron";
import { Order } from "./sequelize";
import { getPayment } from "./yookassa";
import { updateAll } from "./cdek";
import { receive } from "./aws/queue";
import { handleNeonBeardMessages } from "./bot";
import get from "lodash/get";

export const messageQueueJob = new CronJob(
  "* * * * *",
  async function () {
    if (process.env.CRON_JOB_MESSAGE_QUEUE === "1") {
      const messages = await receive();

      if (messages.length) {
        await handleNeonBeardMessages(messages);
      }
    }
  },
  null,
  true,
  null,
  null,
  true
);

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
          .map((order) =>
            order.update({ status: kassaOrders[order.paymentId] })
          )
      );
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
