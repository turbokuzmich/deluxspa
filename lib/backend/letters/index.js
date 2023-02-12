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
    const [items, total] = await Promise.all([
      order.getOrderItems(),
      order.getOrderTotal(),
    ]);

    // TODO i18n
    await send(
      order.email,
      `Заказ ${order.externalId} на сайте deluxspa.ru`,
      "order",
      {
        order: {
          size: items.length,
          url: order.infoUrl,
          subtotal: format(total),
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

export default async function send(to, subject, tpl, data) {
  const html = await render(tpl, data);

  const result = await transport.sendMail({
    to,
    html,
    subject,
    from: process.env.EMAIL_SENDER,
  });
}
