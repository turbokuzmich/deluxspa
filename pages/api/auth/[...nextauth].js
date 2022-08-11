import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import adapter from "../../../lib/adapters/strapi";
import nodemailer from "nodemailer";
import signUp from "../../../lib/letters/signup";

export default NextAuth({
  adapter: adapter,
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
});
