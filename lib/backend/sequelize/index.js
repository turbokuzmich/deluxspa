import { Sequelize, DataTypes } from "sequelize";
import { models } from "@next-auth/sequelize-adapter";
import { oilItemsIds } from "../../../constants";

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {
        dialect: "mysql",
        host: process.env.MYSQL_HOST,
        port: 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        ssl: {
          ca: fs.readFileSync("~/.mysql/root.crt"),
        },
      }
    : {
        dialect: "sqlite",
        storage: "./site.db",
      };

const sequelize = new Sequelize(connectionParams);

export const User = sequelize.define("User", {
  ...models.User,
});

export const CartItem = sequelize.define("CartItem", {
  item_id: {
    type: DataTypes.STRING,
    validate: {
      isIn: [oilItemsIds],
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
});

export const Order = sequelize.define("Order", {
  amoLeadId: {
    type: DataTypes.INTEGER,
  },
});

export const OrderItem = sequelize.define("OrderItem", {
  item_id: {
    type: DataTypes.STRING,
    validate: {
      isIn: [oilItemsIds],
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.TEXT,
  },
  brief: {
    type: DataTypes.TEXT,
  },
  volume: {
    type: DataTypes.INTEGER,
  },
  price: {
    type: DataTypes.FLOAT,
  },
});

User.hasMany(CartItem);
CartItem.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

if (process.env.NODE_ENV !== "production") {
  sequelize.sync();
}

export default sequelize;
