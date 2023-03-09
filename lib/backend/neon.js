import axios from "axios";
import { sign } from "../helpers/bot";
import createFormatter from "../helpers/markdown";
import { formatRU } from "../helpers/date";
import { format } from "../helpers/numeral";
import { formatPhone } from "../helpers/phone";

export const api = axios.create({
  baseURL: "https://neonbeard.ru/api/bot",
});

export async function viewOrder(id) {
  try {
    const { data: order } = await api.post(
      "/",
      sign({ id, command: "viewOrder" })
    );

    const text = createFormatter()
      .bold(`Информация по заказу №${order.id} Neon Beard`)
      .paragraph()
      .text(`ID: ${order.id}`)
      .newline()
      .text(`Дата создания: ${formatRU(new Date(order.createdAt))}`)
      .newline()
      .text(`Статус: ${order.status}`)
      .newline()
      .text(`Итого: ${format(order.total)}₽`)
      .newline()
      .text(`Итого за товары: ${format(order.subtotal)}₽`)
      .newline()
      .text(`Итого за доставку: ${format(order.delivery)}₽`)
      .newline()
      .text(`ID платежа (YooKassa): ${order.paymentId}`)
      .newline()
      .text(`Тип доставки: ${order.type}`)
      .newline()
      .text(`Телефон покупателя: ${formatPhone(order.phone)}`);

    if (order.email) {
      text.newline().text(`Email покупателя: ${order.email}`);
    }
    if (order.comment) {
      text.newline().text(`Комментарий покупателя: ${order.comment}`);
    }

    text.paragraph();

    if (order.type === "cdek") {
      text
        .bold("Информация по доставке СДЭК")
        .paragraph()
        .text(`Название пункта доставки: ${order.cdekPointTitle}`)
        .newline()
        .text(`Код пункта доставки: ${order.cdekPointCode}`)
        .newline()
        .text(`Адрес пункта доставки: ${order.cdekPointAddress}`)
        .newline()
        .text(
          `Координаты пункта доставки: ${order.cdekPointLat},${order.cdekPointLng}`
        );
    } else {
      text
        .bold("Информация для курьерской доставки")
        .paragraph()
        .text(
          `Адрес для курьера: ${
            order.courierAddress ? order.courierAddress : "не указан"
          }`
        )
        .newline()
        .text(
          `Координаты для курьера: ${
            order.courierLat
              ? [order.courierLat, order.courierLng].join(",")
              : "не указаны"
          }`
        );
    }

    text.paragraph().bold("Состав заказа").paragraph();

    order.OrderItems.forEach((item) => {
      text
        .text(item.title)
        .newline()
        .text("Объем:")
        .space()
        .text(item.capacity)
        .newline()
        .text("Цена:")
        .space()
        .text(format(item.price))
        .text("₽")
        .newline()
        .text("Количество:")
        .space()
        .text(format(item.qty))
        .newline()
        .text("Стоимость:")
        .space()
        .text(format(item.total))
        .text("₽")
        .paragraph();
    });

    return { status: "success", order, text: text.toString() };
  } catch (_) {
    console.log(_);
    return { status: "error" };
  }
}

export async function listOrders(id) {
  try {
    const { data: orders } = await api.post(
      "/",
      sign({ id, command: "listOrders" })
    );

    return orders.map((order) => ({
      order,
      title: `Заказ №${order.id} (${order.externalId})`,
      description: `На сумму ${format(order.total)}₽ от ${formatRU(
        new Date(order.createdAt)
      )} (${order.status})`,
    }));
  } catch (_) {
    return [];
  }
}
