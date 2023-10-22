const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.createTable("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["physical", "legal"],
    },
    comment: {
      type: DataTypes.TEXT,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.dropTable("Users");
}

module.exports = { up, down };
