import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { getItemById } from "../../../lib/helpers/catalog";
import sequelize from "../../../lib/backend/sequelize";
import amocrm from "../../../lib/backend/amo";
import property from "lodash/property";
import decline from "../../../lib/helpers/declension";
import render from "../../../lib/backend/letters/render";
import { format } from "../../../lib/helpers/numeral";

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

  try {
    const [{ items, subtotal, quantity, itemsData, noteHtml }, amoUserId] =
      await Promise.all([processCart(user), findOrCreateAmoUser(user)]);

    const leadId = await createLead(
      quantity,
      itemsData,
      noteHtml,
      subtotal,
      amoUserId
    );

    await createOrderAndCleanCart(items, leadId, user);

    res.status(200).json({ orderId: leadId });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
}

async function processCart(user) {
  const items = await user.getCartItems();

  const { noteItems, subtotal, quantity, itemsData } = items.reduce(
    (result, item) => {
      const { title, brief, volume, price } = getItemById(item.item_id);

      result.quantity += item.quantity;
      result.subtotal += price * item.quantity;

      result.noteItems.push(
        `${brief} «${title}» (${format(volume)} мл) — ${format(
          item.quantity
        )} x ${format(price)}₽`
      );

      result.itemsData.push({
        brief,
        title,
        volume: {
          value: format(volume),
          unit: "мл",
        },
        quantity: format(item.quantity),
        price: format(price),
        total: format(price * item.quantity),
      });

      return result;
    },
    { noteItems: [], subtotal: 0, quantity: 0, itemsData: [] }
  );

  return {
    items,
    quantity,
    subtotal,
    itemsData,
    noteHtml: ["В заказе:", ...noteItems, `Итого: ${format(subtotal)}₽`].join(
      "\n"
    ),
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

async function createLead(quantity, itemsData, noteHtml, subtotal, amoUserId) {
  const letterHtml = await render("new_order", {
    order: {
      size: quantity,
      subtotal: format(subtotal),
      text: {
        positions: decline(quantity, ["позиция", "позиции", "позиций"]),
      },
      items: itemsData,
    },
    // FIXME нужно как-то устанавливать ответственного
    responsible: {
      name: "Каролина",
      email: "office@deluxspa.ru",
      phone: {
        text: "+7 (495) 665 9015",
        value: "74956659015",
      },
    },
  });

  const [{ id }] = await amocrm.leads.create([
    {
      name: "Заказ в интернет-магазине DeluxSPA",
      pipeline_id: 5831023, // FIXME в константы
      responsible_user_id: 8542888, // FIXME пока это будет Каролина
      price: subtotal,
      custom_fields_values: [
        {
          field_id: 1167443, // FIXME в константы
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
