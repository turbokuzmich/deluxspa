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

if (process.env.NODE_ENV !== "production") {
  sequelize.sync();
}

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

User.hasMany(CartItem);
CartItem.belongsTo(User);

export default sequelize;
