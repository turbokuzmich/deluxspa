const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Orders", "fio", {
    type: DataTypes.STRING,
  });
  await queryInterface.changeColumn("Orders", "subtotal", {
    type: DataTypes.FLOAT,
    allowNull: false,
  });
  await queryInterface.changeColumn("Orders", "delivery", {
    type: DataTypes.FLOAT,
    allowNull: false,
  });
  await queryInterface.changeColumn("Orders", "discount", {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  });
  await queryInterface.changeColumn("Orders", "total", {
    type: DataTypes.FLOAT,
    allowNull: false,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Orders", "fio");
  await queryInterface.changeColumn("Orders", "subtotal", {
    type: DataTypes.INTEGER,
    allowNull: false,
  });
  await queryInterface.changeColumn("Orders", "delivery", {
    type: DataTypes.INTEGER,
    allowNull: false,
  });
  await queryInterface.changeColumn("Orders", "discount", {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  });
  await queryInterface.changeColumn("Orders", "total", {
    type: DataTypes.INTEGER,
    allowNull: false,
  });
}

module.exports = { up, down };
