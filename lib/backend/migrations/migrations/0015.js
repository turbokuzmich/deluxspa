const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.changeColumn("Sessions", "auth", {
    type: DataTypes.TEXT,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.changeColumn("Sessions", "auth", {
    type: DataTypes.STRING,
  });
}

module.exports = { up, down };
