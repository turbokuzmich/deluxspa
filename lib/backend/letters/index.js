import fs from "fs";
import path from "path";
import mjml from "mjml";
import nodemailer from "nodemailer";
import MjColumn from "mjml-column";
import MjText from "mjml-text";
import MjBody from "mjml-body";
import MjTable from "mjml-table";
import memoize from "lodash/memoize";
import property from "lodash/property";
import template from "lodash/template";
import { minify } from "html-minifier-terser";
import decline from "../../helpers/declension";
import { format } from "../../helpers/numeral";
import { getHumanStatus } from "../../helpers/order";
import { orderByIm } from "../cdek";

const transport = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function getDataProviderComponent(data) {
  return class Body extends MjBody {
    getChildContext() {
      return {
        ...super.getChildContext(),
        templateData: data,
      };
    }
  };
}

class Text extends MjText {
  getContent() {
    const render = template(super.getContent(), { variable: "data" });

    return render(this.context.templateData);
  }
}

class Table extends MjTable {
  getContent() {
    const render = template(super.getContent(), { variable: "data" });

    return render(this.context.templateData);
  }
}

class Column extends MjColumn {
  getStyles() {
    const { parsedWidth, unit } = super.getParsedWidth();
    const width = `${parsedWidth}${unit}`;

    const styles = super.getStyles();

    return {
      ...styles,
      div: {
        ...styles.div,
        width: width,
        "max-width": width,
      },
    };
  }
  render() {
    return super.render();
  }
}

const loadTemplate = memoize((name) =>
  fs.readFileSync(
    path.resolve("./lib/backend/letters/templates", `${name}.mjml`),
    "utf8"
  )
);

export async function render(name, data) {
  const { html } = mjml(loadTemplate(name), {
    skeleton: property("content"),
    presets: [
      {
        components: [Column, Table, Text, getDataProviderComponent(data)],
        dependencies: {},
      },
    ],
  });

  return await minify(html, {
    collapseWhitespace: true,
    minifyCSS: false,
    caseSensitive: true,
    removeEmptyAttributes: true,
  });
}

export async function sendNewOrderEmail(order) {
  if (order.email) {
    const items = await order.getOrderItems();

    // TODO i18n
    await send(
      order.email,
      `Заказ ${order.externalId} на сайте deluxspa.ru`,
      "new-order",
      {
        order: {
          size: items.length,
          url: order.infoUrl,
          name: order.name,
          address: order.address,
          delivery: format(order.delivery),
          subtotal: format(order.subtotal),
          total: format(order.total),
          text: {
            positions: decline(items.length, ["позиция", "позиции", "позиций"]),
          },
          items: items.map((item) => ({
            qty: item.qty,
            brief: item.brief,
            title: item.title,
            capacity: item.capacity,
            price: format(item.price),
            total: format(item.total),
          })),
        },
      }
    );
  }
}

export async function sendOrderStatusEmail(order) {
  if (order.email) {
    // TODO i18n
    await send(
      order.email,
      `Изменение заказа ${order.externalId} на сайте deluxspa.ru`,
      "order-status",
      {
        order: {
          id: order.externalId,
          status: getHumanStatus(order.status),
          url: order.infoUrl,
        },
      }
    );
  }
}

export async function sendOrderTrackingEmail(order) {
  if (!order.email || !order.cdekOrderId) {
    return;
  }

  try {
    const deliveryOrder = await orderByIm(order.cdekOrderId);

    // TODO i18n
    await send(
      order.email,
      `Отслеживание доставки заказа ${order.externalId} на сайте deluxspa.ru`,
      "order-tracking",
      {
        order: {
          id: order.externalId,
          trackingUrl: `https://www.cdek.ru/ru/tracking?order_id=${deliveryOrder.entity.cdek_number}`,
          url: order.infoUrl,
        },
      }
    );
  } catch (error) {}
}

export default async function send(to, subject, tpl, data) {
  const html = await render(tpl, data);

  const result = await transport.sendMail({
    to,
    html,
    subject,
    from: process.env.EMAIL_SENDER,
  });
}
