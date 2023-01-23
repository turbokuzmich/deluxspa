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

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

if (process.env.NODE_ENV !== "production") {
  sequelize.sync();
}

export default sequelize;
