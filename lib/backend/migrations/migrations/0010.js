const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn("Sessions", "email", {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  });
  await queryInterface.addColumn("Sessions", "secret", {
    type: DataTypes.STRING,
  });
  await queryInterface.addColumn("Sessions", "challengedAt", {
    type: DataTypes.DATE,
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.removeColumn("Sessions", "email");
  await queryInterface.removeColumn("Sessions", "secret");
  await queryInterface.removeColumn("Sessions", "challengedAt");
}

module.exports = { up, down };
