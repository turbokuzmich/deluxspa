const { DataTypes, QueryInterface } = require("sequelize");

async function up({ context }) {
  /**
   * @type {QueryInterface}
   */
  const queryInterface = context;

  await queryInterface.addColumn(
    "Cities",
    "count",
    {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    { after: "longitude" }
  );

  await queryInterface.addColumn(
    "Cities",
    "confirmed",
    {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    { after: "count" }
  );

  await queryInterface.createTable("Points", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regionCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    regionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    CityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Cities",
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

  await queryInterface.removeColumn("Cities", "count");
  await queryInterface.removeColumn("Cities", "confirmed");
  await queryInterface.dropTable("Points");
}

module.exports = { up, down };
