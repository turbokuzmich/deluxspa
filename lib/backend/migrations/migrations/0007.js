const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Users", "country", {
    type: DataTypes.STRING(3),
  });
  await queryInterface.addColumn("Users", "company", {
    type: DataTypes.TEXT,
  });
  await queryInterface.addColumn("Users", "site", {
    type: DataTypes.TEXT,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Users", "country");
  await queryInterface.removeColumn("Users", "company");
  await queryInterface.removeColumn("Users", "site");
}

module.exports = { up, down };
