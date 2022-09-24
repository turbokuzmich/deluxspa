import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import signUp from "../../../lib/backend/letters/signup";
import SequelizeAdapter from "@next-auth/sequelize-adapter";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.NODE_ENV === "production"
    ? {
        dialect: "mysql",
        host: process.env.MYSQL_HOST,
        port: 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        ssl: {
          ca: fs.readFileSync("~/.mysql/root.crt"),
        },
      }
    : {
        dialect: "sqlite",
        storage: "./site.db",
      }
);

if (process.env.NODE_ENV !== "production") {
  sequelize.sync();
}

export const authOptions = {
  adapter: SequelizeAdapter(sequelize),
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_USER,
      secret: process.env.NEXTAUTH_SECRET,
      server: {
        host: "smtp.yandex.ru",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      async sendVerificationRequest({ identifier, url, provider }) {
        const transport = nodemailer.createTransport(provider.server);

        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          sender: process.env.EMAIL_SENDER,
          subject: `Авторизация на сайте DeluxSPA`,
          text: `Для авторизации на сайте DeluxSPA, пожалуйста, перейдите по ссылке ${url}`,
          html: signUp(url),
        });

        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
