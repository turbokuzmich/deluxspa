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
  const { items, subtotal, letterHtml } = await processCart(user);
  const amoUserId = await findOrCreateAmoUser(user);
  const leadId = await createLead(letterHtml, subtotal, amoUserId);

  await createOrderAndCleanCart(items, leadId, user);

  res.status(200).json({ orderId: leadId });
}

async function processCart(user) {
  const items = await user.getCartItems();
  const quantity = items.reduce(
    (overall, { quantity }) => overall + quantity,
    0
  );
  const subtotal = items.reduce(
    (subtotal, { item_id, quantity }) =>
      subtotal + getItemById(item_id).price * quantity,
    0
  );

  return {
    items,
    subtotal,
    letterHtml: `<p><strong>Позиций: ${quantity},<br />Подытог: ${subtotal}₽</strong></p>`,
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

async function createLead(letterHtml, subtotal, amoUserId) {
  const [{ id }] = await amocrm.leads.create([
    {
      name: "Сделка из интернет-магазина DeluxSPA",
      pipeline_id: 5831023, // FIXME в константы
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
    const { title, price } = getItemById(item.item_id);

    return {
      title,
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
