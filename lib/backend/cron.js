import { CronJob } from "cron";
import sequelize, { Order, City } from "./sequelize";
import { getPayment } from "./yookassa";
import { cities as fetchCities } from "./cdek";
import get from "lodash/get";

const statusesToFetch = ["created", "pending"];

// TODO если заказ долго в pending, то лучше/ его отменить
// TODO отправлять письма при изменении статуса
export const paymentsStatusesJob = new CronJob(
  "*/5 * * * *",
  async function () {
    await sequelize;

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

// every 6 hours
export const cdekCitiesJob = new CronJob(
  "0 */6 * * *",
  (function () {
    let cdekJobFinished = true;

    return async function () {
      if (cdekJobFinished === false) {
        return;
      }

      cdekJobFinished = false;

      const db = await sequelize;

      await City.update({ confirmed: false }, { where: { confirmed: true } });

      const updateTransaction = await db.transaction();

      try {
        for (let page = 0; ; page++) {
          const cities = await fetchCities(page);

          if (cities.length === 0) {
            break;
          }

          for (const {
            code,
            city,
            country,
            region,
            longitude,
            latitude,
          } of cities) {
            const existingCity = await City.findOne({ where: { code } });

            const cityData = {
              code,
              city: city.toLowerCase(),
              country: country ? country.toLowerCase() : null,
              region: region ? region.toLowerCase() : null,
              longitude,
              latitude,
              confirmed: true,
            };

            if (existingCity) {
              await existingCity.update(cityData);
            } else {
              await City.create(cityData);
            }
          }

          console.log("complete", page);
        }

        await updateTransaction.commit();
      } catch (error) {
        await updateTransaction.rollback();
      } finally {
        cdekJobFinished = true;
      }
    };
  })(),
  null,
  true
);
