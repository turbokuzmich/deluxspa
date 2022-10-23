import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { format } from "date-fns";
import amocrm from "../../../lib/backend/amo";
import sequelize from "../../../lib/backend/sequelize";
import property from "lodash/property";
import fromPairs from "lodash/fromPairs";
import omit from "lodash/omit";
import groupBy from "lodash/groupBy";
import uniq from "lodash/uniq";
import pick from "lodash/pick";
import get from "lodash/get";

// FIXME нужен какой-то кэш на все эти списки

export default async function orders(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json([]);
  }

  const user = await sequelize.models.User.findOne({
    where: { email: session.user.email },
  });

  if (user === null) {
    return res.status(401).json([]);
  }

  const statuses = await getStatuses();
  const orders = await getOrders(user, statuses);

  return res.status(200).json(orders);
}

async function getOrders(user, statuses) {
  const ordersFromDB = await user.getOrders({
    include: sequelize.models.OrderItem,
  });

  if (ordersFromDB.length === 0) {
    return [];
  }

  const leadsIds = ordersFromDB.map(property("amoLeadId"));
  const ordersFromBBByLeadId = fromPairs(
    ordersFromDB.map((order) => [order.amoLeadId, order])
  );
  const leadsPagePromise = amocrm.leads.get({
    filter: {
      id: leadsIds,
    },
    order: {
      created_at: "desc",
    },
  });
  const eventsPagePromise = amocrm.connection.makeRequest(
    "GET",
    "/api/v4/events",
    {
      filter: {
        type: "lead_added,lead_status_changed",
        entity: "lead",
        entity_id: leadsIds,
      },
    }
  );

  const [leadsPage, eventsPage] = await Promise.all([
    leadsPagePromise,
    eventsPagePromise,
  ]);

  const events = prepareEvents(eventsPage, statuses);
  const leads = leadsPage.getData();
  const responsibles = await getResponsibles(leads);

  return leads.map((lead) => {
    const dbOrder = ordersFromBBByLeadId[lead.id];
    const payLink = getPayLink(lead);
    const orderItems = dbOrder.OrderItems.map((item) =>
      omit(item.toJSON(), ["OrderId", "createdAt", "id", "updatedAt"])
    );

    return {
      payLink,
      id: lead.id,
      name: `Заказ №${lead.id}`,
      price: lead.price,
      items: orderItems,
      events: events[lead.id],
      status: statuses[lead.status_id],
      createdAt: dbOrder.createdAt,
      responsible: responsibles[lead.responsible_user_id],
    };
  });
}

async function getResponsibles(leads) {
  const ids = uniq(leads.map(property("responsible_user_id")));
  const responsibles = await Promise.all(
    ids.map((id) => amocrm.connection.makeRequest("GET", `/api/v4/users/${id}`))
  );

  return fromPairs(
    responsibles
      .map(property("data"))
      .map((user) => [user.id, pick(user, ["name", "email"])])
  );
}

async function getStatuses() {
  const statusesResponse = await amocrm.connection.makeRequest(
    "GET",
    "/api/v4/leads/pipelines/5831023/statuses"
  );

  return statusesResponse.data._embedded.statuses.reduce(
    (statuses, { id, name }) => ({ ...statuses, [id]: name }),
    {}
  );
}

function prepareEvents(eventsPage, statuses) {
  const {
    data: {
      _embedded: { events },
    },
  } = eventsPage;

  return groupBy(
    events.map(({ id, type, entity_id, created_at, value_after }) => {
      const date = format(created_at * 1000, "dd.MM.yyyy H:mm");
      const text =
        type === "lead_added"
          ? `${date}: Заказ создан`
          : `${date}: Поменялся статус заказа — ${
              statuses[value_after[0].lead_status.id]
            }`;

      return { id, entity_id, text };
    }),
    property("entity_id")
  );
}

function getPayLink(lead) {
  // FIXME статус «Счет выставлен»; айдишник записать в константы
  if (lead.status_id !== 51036133) {
    return null;
  }

  // FIXME поле «Ссылка на оплату»; айдишник записать в константы
  const payLinkField = lead.custom_fields_values.find(
    ({ field_id }) => field_id === 1167115
  );

  if (!payLinkField) {
    return null;
  }

  return get(payLinkField, "values.0.value", "");
}
