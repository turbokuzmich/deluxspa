const { readFileSync } = require("fs");
const { resolve, join } = require("path");
const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");

require("dotenv").config({ path: resolve(process.cwd(), ".env.local") });

const crt = readFileSync(join(process.cwd(), ".mysql", "root.crt")).toString();

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {
        logging: false,
        dialect: "mysql",
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: true,
            ca: crt,
          },
        },
      }
    : {
        logging: false,
        dialect: "sqlite",
        storage: resolve(process.cwd(), "site.db"),
      };

const sequelize = new Sequelize(connectionParams);

const umzug = new Umzug({
  migrations: {
    glob: resolve(
      process.cwd(),
      "lib",
      "backend",
      "migrations",
      "migrations",
      "*.js"
    ),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

umzug.runAsCLI();
