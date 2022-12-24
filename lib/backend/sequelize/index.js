import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { models } from "@next-auth/sequelize-adapter";
import { oilItemsIds } from "../../../constants";

// FIXME move crm to secrets
const crt = fs
  .readFileSync(path.join(process.cwd(), ".mysql", "root.crt"))
  .toString();

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

export const Region = sequelize.define(
  "Region",
  {
    code: DataTypes.INTEGER,
    name: DataTypes.TEXT,
    name_lo: DataTypes.TEXT,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["code"],
      },
    ],
  }
);

export const City = sequelize.define(
  "City",
  {
    name: DataTypes.TEXT,
    name_lo: DataTypes.TEXT,
    region: DataTypes.TEXT,
    region_lo: DataTypes.TEXT,
    pickpointId: DataTypes.INTEGER,
    cdekCode: DataTypes.INTEGER,
    cdekRegionCode: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    fiasId: DataTypes.TEXT,
    kladrId: DataTypes.TEXT,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["cdekCode"],
      },
      {
        unique: true,
        fields: ["pickpointId"],
      },
    ],
  }
);

// FIXME нужно добавить телефоны
export const Point = sequelize.define(
  "Point",
  {
    externalId: DataTypes.CHAR(255),
    name: DataTypes.TEXT,
    type: DataTypes.ENUM("cdek", "pickpoint"),
    email: DataTypes.STRING,
    site: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    workingTime: DataTypes.STRING,
    address: DataTypes.STRING,
    addressComment: DataTypes.STRING,
    city: DataTypes.INTEGER,
  },
  {
    indexes: [
      {
        name: "typed_id",
        unique: true,
        fields: ["type", "externalId"],
      },
      {
        name: "typed_city",
        fields: ["type", "city"],
      },
    ],
  }
);

User.hasMany(CartItem);
CartItem.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// if (process.env.NODE_ENV !== "production") {
// sequelize.sync();
// }

export default sequelize;
