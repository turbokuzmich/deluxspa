const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Users", "phone");
  await queryInterface.removeColumn("Users", "email");

  await queryInterface.addColumn("Users", "phone", {
    type: DataTypes.STRING(11),
  });
  await queryInterface.addColumn("Users", "email", {
    type: DataTypes.STRING,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Users", "phone");
  await queryInterface.removeColumn("Users", "email");

  await queryInterface.addColumn("Users", "phone", {
    type: DataTypes.STRING(11),
    unique: true,
  });
  await queryInterface.addColumn("Users", "email", {
    type: DataTypes.STRING,
    unique: true,
  });
}

module.exports = { up, down };
