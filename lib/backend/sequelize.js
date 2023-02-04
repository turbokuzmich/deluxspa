import { Sequelize, DataTypes } from "sequelize";
import { resolve } from "path";

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {}
    : {
        logging: false,
        dialect: "sqlite",
        storage: resolve(process.cwd(), "site.db"),
      };

const sequelize = new Sequelize(connectionParams);

export const Session = sequelize.define("session", {
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
});

export const CartItem = sequelize.define("cartItem", {
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
});

export const Order = sequelize.define("order", {
  key: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  payment: {
    type: DataTypes.STRING,
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
    defaultValue: "pending",
    values: ["pending", "paid", "confirmed", "delivered", "cancelled"],
  },
});

export const OrderItem = sequelize.define("orderItem", {
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
});

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

export default sequelize.sync({ alter: true });
