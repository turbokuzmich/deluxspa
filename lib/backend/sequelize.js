import fs from "fs";
import { Sequelize, Model, DataTypes } from "sequelize";
import { resolve, join } from "path";
import { createHmac } from "crypto";
import { getItemById, formatCapacity } from "../helpers/catalog";
import { i18n } from "next-i18next";
import t from "../helpers/i18n";
import negate from "lodash/negate";
import isNil from "lodash/isNil";
import fromPairs from "lodash/fromPairs";

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
      type: DataTypes.STRING,
    },
    maxAge: {
      type: DataTypes.INTEGER,
    },
    expires: {
      type: DataTypes.DATE,
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
  },
  { sequelize }
);

export class Order extends Model {
  async getOrderSize() {
    return (await this.getOrderItems()).length;
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
      values: [
        "created",
        "pending",
        "waiting_for_capture",
        "succeeded",
        "canceled",
        "delivered",
      ],
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
        return `${process.env.SITE_URL}/api/checkout?order=${this.externalId}&s=${this.hmac}&locale=${i18n.language}`;
      },
    },
    infoUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${process.env.SITE_URL}/${i18n.language}/order/${this.externalId}-${this.hmac}`;
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
  },
  { sequelize }
);

export class City extends Model {}

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
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    secret: {
      type: DataTypes.STRING,
    },
    challengedAt: {
      type: DataTypes.DATE,
    },
  },
  { sequelize }
);

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

export default sequelize.sync();
