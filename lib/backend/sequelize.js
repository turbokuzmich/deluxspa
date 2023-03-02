import fs from "fs";
import { Sequelize, Model, DataTypes, QueryTypes } from "sequelize";
import { resolve, join } from "path";
import { createHmac } from "crypto";
import { getItemById, formatCapacity } from "../helpers/catalog";
import { orderStatuses } from "../../constants";
import { i18n } from "next-i18next";
import t from "../helpers/i18n";
import get from "lodash/get";
import set from "lodash/set";
import omit from "lodash/omit";
import negate from "lodash/negate";
import isNil from "lodash/isNil";
import fromPairs from "lodash/fromPairs";
import property from "lodash/property";
import isString from "lodash/isString";
import pick from "lodash/pick";
import first from "lodash/first";

const timestampFieldNames = ["updatedAt", "createdAt"];

// FIXME move crm to secrets
const crt = fs
  .readFileSync(join(process.cwd(), ".mysql", "root.crt"))
  .toString();

const isNotNil = negate(isNil);
const externalIdOffset = parseInt(process.env.ORDER_EXTERNAL_OFFSET, 10);

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {
        logging: false,
        dialect: "mysql",
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: true,
            ca: crt,
          },
        },
      }
    : {
        logging: false,
        dialect: "sqlite",
        storage: resolve(process.cwd(), "site.db"),
      };

const sequelize = new Sequelize(connectionParams);

export class Session extends Model {
  async restoreSession() {
    const cookie = this.cookie;

    const items = await this.getCartItems().then(function (items) {
      return items.map(function (item) {
        return item.sessionData;
      });
    });

    const feedbackRequests = await this.getFeedbackRequests().then(function (
      requests
    ) {
      return requests.map(function (request) {
        return omit(request.toJSON(), timestampFieldNames);
      });
    });

    return { cookie, items, feedbackRequests };
  }
  async getCartTotal() {
    const cartItems = await this.getCartItems();

    return cartItems.reduce((total, item) => total + item.total, 0);
  }
}

Session.init(
  {
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    httpOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
    },
    secure: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sameSite: {
      type: DataTypes.ENUM,
      values: ["lax", "strict", "none", "true"],
    },
    maxAge: {
      type: DataTypes.INTEGER,
    },
    expires: {
      type: DataTypes.DATE,
    },
    touchedAt: {
      type: DataTypes.DATE,
    },
    cookie: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          "httpOnly",
          "path",
          "domain",
          "secure",
          "maxAge",
          "expires",
          "sameSite",
        ].reduce((cookie, key) => {
          const value = this[key];

          if (isNil(value)) {
            return cookie;
          }

          if (key === "sameSite") {
            return set(
              cookie,
              "sameSite",
              this.sameSite === "true" ? true : this.sameSite
            );
          }

          return set(cookie, key, value);
        }, {});
      },
      set(newCookie) {
        [
          "httpOnly",
          "path",
          "domain",
          "secure",
          "maxAge",
          "expires",
          "sameSite",
        ].forEach((key) => {
          if (isNil(newCookie[key])) {
            this[key] = null;
          } else if (key === "sameSite" && newCookie.sameSite === true) {
            this[key] = "true";
          } else {
            this[key] = newCookie[key];
          }
        });
      },
    },
  },
  { sequelize }
);

export class CartItem extends Model {}

CartItem.init(
  {
    itemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.VIRTUAL,
      get() {
        const catalogItem = getItemById(this.itemId);

        return t(catalogItem.title, "ru");
      },
    },
    title_en: {
      type: DataTypes.VIRTUAL,
      get() {
        const catalogItem = getItemById(this.itemId);

        return t(catalogItem.title, "en");
      },
    },
    brief: {
      type: DataTypes.VIRTUAL,
      get() {
        const catalogItem = getItemById(this.itemId);

        return t(catalogItem.brief, "ru");
      },
    },
    brief_en: {
      type: DataTypes.VIRTUAL,
      get() {
        const catalogItem = getItemById(this.itemId);

        return t(catalogItem.brief, "en");
      },
    },
    capacity: {
      type: DataTypes.VIRTUAL,
      get() {
        const {
          unit,
          variants: { byId },
        } = getItemById(this.itemId);

        const { volume } = byId[this.variantId];
        const [capacity, unitKey] = formatCapacity(volume, unit);

        return `${capacity} ${t(unitKey, "ru")}`;
      },
    },
    capacity_en: {
      type: DataTypes.VIRTUAL,
      get() {
        const {
          unit,
          variants: { byId },
        } = getItemById(this.itemId);

        const { volume } = byId[this.variantId];
        const [capacity, unitKey] = formatCapacity(volume, unit);

        return `${capacity} ${t(unitKey, "en")}`;
      },
    },
    unit: {
      type: DataTypes.VIRTUAL,
      get() {
        const { unit } = getItemById(this.itemId);

        return unit;
      },
    },
    price: {
      type: DataTypes.VIRTUAL,
      get() {
        const catalogItem = getItemById(this.itemId);

        return catalogItem.variants.byId[this.variantId].price;
      },
    },
    total: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.price * this.qty;
      },
    },
    orderData: {
      type: DataTypes.VIRTUAL,
      get() {
        return {
          title: this.title,
          title_en: this.title_en,
          brief: this.brief,
          brief_en: this.brief_en,
          capacity: this.capacity,
          capacity_en: this.capacity_en,
          unit: this.unit,
          variant: this.variantId,
          price: this.price,
          qty: this.qty,
          total: this.total,
        };
      },
    },
    sessionData: {
      type: DataTypes.VIRTUAL,
      get() {
        return {
          itemId: this.itemId,
          variantId: this.variantId,
          qty: this.qty,
        };
      },
    },
  },
  { sequelize }
);

export class Order extends Model {
  async getOrderSize() {
    return (await this.getOrderItems()).length;
  }
  async getViewData() {
    const items = await this.getOrderItems();

    return { ...this.viewData, items: items.map(property("viewData")) };
  }
  validateHmac(hmac) {
    return this.hmac === hmac;
  }
  static getByExternalId(externalId) {
    const id = externalId - externalIdOffset;

    return Order.findByPk(id);
  }
}

Order.init(
  {
    key: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    paymentId: {
      type: DataTypes.STRING(36),
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    comment: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: "created",
      values: orderStatuses,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hmac: {
      type: DataTypes.VIRTUAL,
      get() {
        return createHmac("sha256", process.env.KEY)
          .update(`${this.externalId}-${this.key}`)
          .digest("hex");
      },
    },
    externalId: {
      type: DataTypes.VIRTUAL,
      get() {
        return externalIdOffset + this.id;
      },
    },
    paymentPhone: {
      type: DataTypes.VIRTUAL,
      get() {
        return `7${this.phone}`;
      },
    },
    paymentData: {
      type: DataTypes.VIRTUAL,
      get() {
        const phone = ["phone", this.paymentPhone];
        const email = ["email", this.email];

        return fromPairs(
          [phone, email].filter(([_, value]) => isNotNil(value))
        );
      },
    },
    paymentReturnUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const lang = get(i18n, "language", "ru");

        return `${process.env.SITE_URL}/api/checkout?order=${this.externalId}&s=${this.hmac}&locale=${lang}`;
      },
    },
    infoUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const lang = get(i18n, "language", "ru");

        return `${process.env.SITE_URL}/${lang}/order/${this.externalId}-${this.hmac}`;
      },
    },
    viewData: {
      type: DataTypes.VIRTUAL,
      get() {
        return pick(this, [
          "address",
          "name",
          "total",
          "delivery",
          "status",
          "externalId",
        ]);
      },
    },
  },
  { sequelize }
);

export class OrderItem extends Model {}

OrderItem.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.price * this.qty;
      },
    },
    viewData: {
      type: DataTypes.VIRTUAL,
      get() {
        return pick(this, [
          "title",
          "title_en",
          "brief",
          "brief_en",
          "capacity",
          "capacity_en",
          "unit",
          "variant",
          "qty",
          "price",
          "total",
        ]);
      },
    },
  },
  { sequelize }
);

export class City extends Model {
  static async getNearestCity(lat, lng) {
    const cities = await sequelize.query(
      `
SELECT * FROM (
  SELECT *, 
    (
      (
        (
          acos(
            sin(( ${lat} * pi() / 180)) *
            sin(( latitude * pi() / 180)) + cos(( ${lat} * pi() / 180 )) *
            cos(( latitude * pi() / 180)) * cos((( ${lng} - longitude) * pi() / 180))
          )
        ) * 180 / pi()
      ) * 60 * 1.1515
    ) as distance FROM Cities
  WHERE confirmed = 1 and count > 0
) Cities
ORDER BY distance
LIMIT 1;`,
      { type: QueryTypes.SELECT, model: City, mapToModel: true }
    );

    return first(cities);
  }
}

City.init(
  {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: DataTypes.STRING,
    region: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mapData: {
      type: DataTypes.VIRTUAL,
      get() {
        return pick(this, [
          "code",
          "city",
          "country",
          "region",
          "latitude",
          "longitude",
        ]);
      },
    },
  },
  { sequelize }
);

export class Point extends Model {}

Point.init(
  {
    code: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regionCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    regionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mapData: {
      type: DataTypes.VIRTUAL,
      get() {
        return {
          name: this.name,
          code: this.code,
          location: {
            region_code: this.regionCode,
            region: this.regionName,
            city_code: this.cityCode,
            city: this.cityName,
            latitude: this.latitude,
            longitude: this.longitude,
            address_full: this.address,
          },
        };
      },
    },
  },
  { sequelize }
);

export class BotUser extends Model {}

BotUser.init(
  {
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING,
    },
    becameRootAt: {
      type: DataTypes.DATE,
    },
    secret: {
      type: DataTypes.STRING,
    },
    challengedAt: {
      type: DataTypes.DATE,
    },
  },
  { sequelize }
);

export class FeedbackRequest extends Model {
  static async createFromSite(sessionId, values) {
    const fieldValues = [
      "key",
      "name",
      "phone",
      "email",
      "message",
      "SessionId",
    ].reduce((result, key) => {
      if (!values[key] || isNil(values[key])) {
        return { ...result, [key]: null };
      }
      if (
        key === "email" &&
        "email" in values &&
        isString(values["email"]) &&
        values["email"].trim().length === 0
      ) {
        return { ...result, email: null };
      }
      return { ...result, [key]: values[key] };
    }, {});

    return await FeedbackRequest.create({
      ...fieldValues,
      SessionId: sessionId,
    });
  }
  static async reply(key, response) {
    const request = await this.findOne({ where: { key } });

    if (request === null) {
      return;
    }

    await request.update({ response });
  }
}

FeedbackRequest.init(
  {
    key: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.STRING,
    },
    response: {
      type: DataTypes.STRING,
    },
    isSeen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { sequelize }
);

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

Session.hasMany(FeedbackRequest);
FeedbackRequest.belongsTo(Session);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

City.hasMany(Point);
Point.belongsTo(City);

export default sequelize;
// export default process.env.NODE_ENV === "production"
//   ? Promise.resolve(sequelize)
//   : sequelize.sync();
