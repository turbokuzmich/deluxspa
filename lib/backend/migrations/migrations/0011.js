const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Users", "discount", {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Users", "discount");
}

module.exports = { up, down };
