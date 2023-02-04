import { Sequelize, Model, DataTypes } from "sequelize";
import { resolve } from "path";
import { getItemById } from "../helpers/catalog";
import { i18n } from "next-i18next";
import get from "lodash/get";
import negate from "lodash/negate";
import isNil from "lodash/isNil";
import fromPairs from "lodash/fromPairs";

const isNotNil = negate(isNil);

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {}
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

        return get(
          i18n.getDataByLanguage("ru"),
          ["common", catalogItem.title],
          catalogItem.title
        );
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
          variant: this.variantId,
          price: this.price,
          qty: this.qty,
        };
      },
    },
  },
  { sequelize }
);

export class Order extends Model {}

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
    address: {
      type: DataTypes.STRING,
    },
    lat: {
      type: DataTypes.FLOAT,
    },
    lng: {
      type: DataTypes.FLOAT,
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
    externalId: {
      type: DataTypes.VIRTUAL,
      get() {
        return process.env.ORDER_EXTERNAL_OFFSET + this.id;
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
  },
  { sequelize }
);

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

export default sequelize.sync();
