const { Sequelize } = require("sequelize");

async function up({ context: queryInterface }) {
  // await queryInterface.createTable("test", {
  //   id: {
  //     type: Sequelize.INTEGER,
  //     allowNull: false,
  //     primaryKey: true,
  //   },
  //   name: {
  //     type: Sequelize.STRING,
  //     allowNull: false,
  //   },
  //   createdAt: {
  //     type: Sequelize.DATE,
  //     allowNull: false,
  //   },
  //   updatedAt: {
  //     type: Sequelize.DATE,
  //     allowNull: false,
  //   },
  // });
}

async function down({ context: queryInterface }) {
  // await queryInterface.dropTable("test");
}

module.exports = { up, down };
