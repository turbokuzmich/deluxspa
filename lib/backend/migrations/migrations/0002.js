const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.createTable("LockBoxSites", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lockBoxKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.createTable("LockBoxSiteNames", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    LockBoxSiteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "LockBoxSites",
        key: "id",
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
}

async function down({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.dropTable("LockBoxSiteNames");
  await queryInterface.dropTable("LockBoxSites");
}

module.exports = { up, down };
