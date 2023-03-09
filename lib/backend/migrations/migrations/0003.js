const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Points", "info", {
    type: DataTypes.JSON,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Points", "info");
}

module.exports = { up, down };
