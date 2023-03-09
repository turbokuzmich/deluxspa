import has from "lodash/has";
import get from "lodash/get";
import constant from "lodash/constant";
import createFormatter from "./markdown";
import { formatPhone } from "./phone";
import { format } from "./numeral";

const formattableCdekNumberRegExp = /^\+7\d\d\d\d\d\d\d\d\d\d$/;

function optional(formatter, data) {
  return function (path, definition) {
    if (has(data, path)) {
      const value = get(data, path);

      return {
        string() {
          return formatter.definition(definition, value).newline();
        },
        number() {
          return formatter.definition(definition, format(value)).newline();
        },
        boolean() {
          return formatter
            .definition(definition, value ? "да" : "нет")
            .newline();
        },
      };
    } else {
      return {
        string: constant(formatter),
        number: constant(formatter),
        boolean: constant(formatter),
      };
    }
  };
}

export function formatPointInfo(data) {
  const info = createFormatter();
  const formatOptional = optional(info, data);

  info.bold(`Офис СДЭК «${data.name}»`).paragraph();
  info.bold("Общая информация").newline();
  info.definition("Код", data.code).newline();
  info.definition("Название", data.name).newline();
  info
    .definition("Тип", { PVZ: "склад", POSTAMAT: "постамат" }[data.type])
    .newline();
  info.definition("Принадлежность", data.owner_code).newline();
  info.definition("Режим работы", data.work_time).paragraph();

  info.bold("Адрес офиса").newline();
  info.definition("Адрес", data.location.address_full).newline();
  formatOptional("address_comment", "Описание местоположения").string();
  formatOptional(
    "nearest_station",
    "Ближайшая станция/остановка транспорта"
  ).string();
  formatOptional("nearest_metro_station", "Ближайшая станция метро").string();
  formatOptional("note", "Примечание по офису").string();
  info.definition("Почтовый индекс", data.location.postal_code).paragraph();

  info.bold("Контакты").newline().text("Телефон:").space();
  data.phones.forEach(({ number, additional }, index) => {
    if (formattableCdekNumberRegExp.test(number)) {
      info.text(formatPhone(number.slice(2)));
    } else {
      info.text(number);
    }

    if (additional) {
      info.space().text("(").text(additional).text(")");
    }

    if (index === data.phones.length - 1) {
      info.newline();
    } else {
      info.text(",").space();
    }
  });
  formatOptional("site", "Веб-страница офиса").string();
  formatOptional("email", "Адрес электронной почты").string();

  info.newline().bold("Характеристики").newline();

  [
    ["is_handout", "Является пунктом выдачи"],
    ["is_reception", "Является пунктом приёма"],
    ["is_dressing_room", "Есть ли примерочная"],
    ["have_cashless", "Есть безналичный расчет"],
    ["have_cash", "Есть приём наличных"],
    ["allowed_cod", "Разрешен наложенный платеж"],
    ["fulfillment", "Наличие зоны фулфилмента"],
  ].forEach(([path, definition]) => {
    formatOptional(path, definition).boolean();
  });

  if (
    has(data, "weight_min") ||
    has(data, "weight_max") ||
    has(data, "dimensions")
  ) {
    info.newline().bold("Ограничения").newline();

    formatOptional("weight_min", "Минимальный принимаемый вес (кг.)").number();
    formatOptional("weight_max", "Максимальный принимаемый вес (кг.)").number();

    const dimensions = get(data, "dimensions", []);

    if (dimensions.length > 0) {
      info.text("Максимальные размеры ячеек (см.):").space();

      dimensions.forEach(({ width, height, depth }, index) => {
        info.text(width).text("x").text(height).text("x").text(depth);

        if (index < dimensions.length - 1) {
          info.text(",").space();
        }

        info.newline();
      });
    }
  }

  const images = get(data, "office_image_list", []);

  if (images.length > 0) {
    info.newline().bold("Фото офиса").newline();

    images.forEach(({ url }, index) => {
      info.url(url, `Фото ${index + 1}`).newline();
    });
  }

  return info.toString();
}
