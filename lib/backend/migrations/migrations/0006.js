const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn(
    "Users",
    "name",
    {
      type: DataTypes.STRING,
    },
    { after: "type" }
  );
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Users", "name");
}

module.exports = { up, down };
