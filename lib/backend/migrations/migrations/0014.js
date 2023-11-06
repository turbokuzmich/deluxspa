const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Orders", "discount", {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Orders", "discount");
}

module.exports = { up, down };
