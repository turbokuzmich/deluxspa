import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import adapter from "../../../lib/adapters/strapi";
// import SequelizeAdapter from "@next-auth/sequelize-adapter";
// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: "./temp.db",
//   logging: false,
// });
// const adapter = new SequelizeAdapter(sequelize);

// sequelize.sync();

export default NextAuth({
  adapter: adapter,
  secret: process.env.SESSION_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_USER,
      secret: process.env.SESSION_SECRET,
      server: {
        host: "smtp.yandex.ru",
        port: 465,
        secure: true,
        auth: {
          type: "login",
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
  ],
});
