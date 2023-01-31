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

// TODO: добавить статус заказа
export const Order = sequelize.define("order", {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
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
  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  returned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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

if (process.env.NODE_ENV !== "production") {
  sequelize.sync();
}

export default sequelize;
