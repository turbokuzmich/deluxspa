import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { getItemById } from "../../../lib/helpers/catalog";
import sequelize from "../../../lib/backend/sequelize";
import amocrm from "../../../lib/backend/amo";
import property from "lodash/property";

export default async function checkout(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({});
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({});
  }

  const user = await sequelize.models.User.findOne({
    where: { email: session.user.email },
  });

  if (user === null) {
    return res.status(401).json({});
  }

  // FIXME что-то можно и параллельно запустить
  const { items, subtotal, letterHtml, noteHtml } = await processCart(user);
  const amoUserId = await findOrCreateAmoUser(user);
  const leadId = await createLead(letterHtml, noteHtml, subtotal, amoUserId);

  await createOrderAndCleanCart(items, leadId, user);

  res.status(200).json({ orderId: leadId });
}

async function processCart(user) {
  const items = await user.getCartItems();

  // все эти рассчеты сделать за одну проходку
  const quantity = items.reduce(
    (overall, { quantity }) => overall + quantity,
    0
  );
  const subtotal = items.reduce(
    (subtotal, { item_id, quantity }) =>
      subtotal + getItemById(item_id).price * quantity,
    0
  );
  const orderItems = items.map((item) => {
    const { title, brief, volume, price } = getItemById(item.item_id);
    return `${brief} «${title}» (${volume} мл.) — ${item.quantity} x ${price}₽`;
  });

  return {
    items,
    subtotal,
    letterHtml: `<p><strong>Позиций: ${quantity},<br />Подытог: ${subtotal}₽</strong></p>`,
    noteHtml: ["В заказе:", ...orderItems, `Итого: ${subtotal}₽`].join("\n"),
  };
}

async function findOrCreateAmoUser(user) {
  const page = await amocrm.contacts.get({
    query: user.email,
    limit: 1,
  });
  const existing = page.getData();

  if (existing.length === 0) {
    // FIXME создавать
  }

  const [{ id }] = existing;

  return id;
}

async function createLead(letterHtml, noteHtml, subtotal, amoUserId) {
  const [{ id }] = await amocrm.leads.create([
    {
      name: "Заказ в интернет-магазине DeluxSPA",
      pipeline_id: 5831023, // FIXME в константы
      responsible_user_id: 8542888, // FIXME пока это будет Каролина
      price: subtotal,
      custom_fields_values: [
        {
          field_id: 1167053, // FIXME в константы
          values: [
            {
              value: letterHtml,
            },
          ],
        },
      ],
      _embedded: {
        contacts: [{ id: amoUserId }],
        tags: [{ id: 276681 }],
      },
    },
  ]);

  await amocrm.request.post(`/api/v4/leads/${id}/notes`, [
    {
      note_type: "common",
      params: {
        text: noteHtml,
      },
    },
  ]);

  return id;
}

async function createOrderAndCleanCart(items, leadId, user) {
  const order = await sequelize.models.Order.create({
    amoLeadId: leadId,
  });

  await order.setUser(user);

  const orderItemsData = items.map((item) => {
    const { title, brief, volume, price } = getItemById(item.item_id);

    return {
      title,
      brief,
      volume,
      price,
      item_id: item.item_id,
      quantity: item.quantity,
      OrderId: order.id,
    };
  });

  await sequelize.models.OrderItem.bulkCreate(orderItemsData);

  await sequelize.models.CartItem.destroy({
    where: { id: items.map(property("id")) },
  });
}
