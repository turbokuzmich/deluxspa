import pick from "lodash/pick";
import get from "lodash/get";
import { Op } from "sequelize";
import { CronJob } from "cron";
import { Order } from "./sequelize";
import { getPayment } from "./yookassa";
import { updateAll, orderByIm } from "./cdek";
import { sendOrderStatus, sendInactiveOrders } from "./queue";
import { getHumanStatus } from "../helpers/order";
import { orderStatusesKeys } from "../../constants";
import { addHours } from "date-fns";

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
            operations.push(
              sendOrderStatus(
                order.id,
                getHumanStatus(orderStatusesKeys.succeeded)
              )
            );
          }

          if (payment.status === "canceled") {
            operations.push(
              sendOrderStatus(
                order.id,
                getHumanStatus(orderStatusesKeys.canceled)
              )
            );
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

export const deliveryStatusesJob = new CronJob(
  "* * * * *",
  async function () {
    if (process.env.CRON_JOB_DELIVERY === "1") {
      const pendingDeliveries = await Order.findAll({
        where: {
          status: orderStatusesKeys.shipping,
          cdekOrderId: {
            [Op.not]: null,
          },
        },
      });

      const deliveryInfos = await Promise.all(
        pendingDeliveries.map((order) => {
          return orderByIm(order.cdekOrderId).catch(() => null);
        })
      );

      const operations = pendingDeliveries.reduce(
        (operations, order, index) => {
          const status = get(deliveryInfos, [
            index,
            "entity",
            "statuses",
            0,
            "code",
          ]);

          if (status === "DELIVERED") {
            operations.push(
              order.update({ status: orderStatusesKeys.delivered }),
              sendOrderStatus(
                order.id,
                getHumanStatus(orderStatusesKeys.delivered)
              )
            );
          }

          return operations;
        },
        []
      );

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

export const orderActivityJob = new CronJob(
  "0 * * * *", // every hour
  async function () {
    const moreThanTwoHours = addHours(new Date(), -2);

    const orders = await Order.findAll({
      where: {
        status: orderStatusesKeys.succeeded,
        updatedAt: {
          [Op.lte]: moreThanTwoHours,
        },
      },
    });

    await sendInactiveOrders(
      orders.map((order) => pick(order, ["id", "externalId"]))
    );
  },
  null,
  true,
  null,
  null,
  true
);
