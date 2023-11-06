import * as yup from "yup";
import memoize from "lodash/memoize";
import get from "lodash/get";
import { generateSecret, generateToken, verifyToken } from "node-2fa";
import t from "../../lib/helpers/i18n";
import { csrf } from "../../lib/backend/csrf";
import { userType } from "../../constants";
import { User } from "../../lib/backend/sequelize";
import { sendSignupEmail } from "../../lib/backend/letters";
import runWithSession, { runIfHasSession } from "../../lib/backend/session";

const tokenPeriod = parseInt(process.env.TOKEN_EXPIRATION_INTERVAL, 10);

const getEmailSchema = memoize(() =>
  yup.object().shape({
    email: yup
      .string()
      .required(t("cart-page-email-incorrect"))
      .email(t("cart-page-email-incorrect")),
    country: yup
      .string()
      .nullable()
      .optional()
      .matches(/^\d+$/, "Укажите код страны")
      .max(3, "Укажите код страны"),
    phone: yup
      .string()
      .nullable()
      .optional()
      .matches(/^\d+$/, "Укажите номер телефона")
      .max(11, "Укажите номер телефона"),
  })
);

const getCodeSchema = memoize(() =>
  yup.object().shape({
    email: yup.string().email(t("cart-page-email-incorrect")),
    code: yup
      .string()
      .required("Введите проверочный код")
      .length(6, "Введите 6 цифр проверочного кода")
      .matches(/^\d+$/, "Введите 6 цифр проверочного кода"),
  })
);

const getPatchSchema = memoize(() =>
  yup.object().shape({
    name: yup.string().nullable().optional(),
    site: yup.string().nullable().optional(),
    company: yup.string().nullable().optional(),
    type: yup.string().oneOf(Object.keys(userType)),
    country: yup
      .string()
      .nullable()
      .optional()
      .matches(/^\d+$/, "Укажите код страны")
      .max(3, "Укажите код страны"),
    phone: yup
      .string()
      .nullable()
      .optional()
      .matches(/^\d+$/, "Укажите номер телефона")
      .max(11, "Укажите номер телефона"),
  })
);

async function sendVerificationCode(req, res) {
  const { email, country, phone } = await getEmailSchema().validate(
    get(req, "body", {}),
    {
      strict: true,
      stripUnknown: true,
    }
  );

  const challengedAt = new Date();
  const { secret } = generateSecret({ name: email });
  const { token } = generateToken(secret);

  await runWithSession(
    async (session) => {
      session.secret = secret;
      session.auth = { email, country, phone };
      session.challengedAt = challengedAt;
    },
    req,
    res
  );

  await sendSignupEmail(email, token);

  res.status(200).json({ token });
}

async function findOrCreateUser({ email, country, phone }) {
  if (country && phone) {
    const phoneUser = await User.findOne({
      where: { country, phone },
    });

    const emailUser = await User.findOne({ where: { email } });

    if (emailUser) {
      return null;
    } else if (phoneUser.email) {
      return phoneUser.email === email ? phoneUser : null;
    } else {
      await phoneUser.update({
        email,
      });

      return phoneUser;
    }
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return existingUser;
  } else {
    return await User.create({
      email,
      type: "physical",
    });
  }
}

function getSessionAuthData(session) {
  try {
    const { email, country, phone } = JSON.parse(session.auth);

    return { email, country, phone };
  } catch (error) {
    return { email: null, country: null, phone: null };
  }
}

async function verifyCode(req, res) {
  const { email, code } = await getCodeSchema().validate(get(req, "body", {}), {
    strict: true,
    stripUnknown: true,
  });

  await runWithSession(
    async (session) => {
      const auth = getSessionAuthData(session);

      if (auth.email !== email) {
        return res
          .status(400)
          .json({ error: "Неправильный электронный адрес" });
      }

      if (
        !session.challengedAt ||
        Date.now() - session.challengedAt.getTime() > tokenPeriod
      ) {
        return res.status(400).json({ error: "Код устарел" });
      }

      if (!verifyToken(get(session, "secret", ""), code)) {
        return res.status(400).json({ error: "Неправильный проверочный код" });
      }

      const user = await findOrCreateUser(auth);

      if (user) {
        session.auth = null;
        session.secret = null;
        session.challengedAt = null;
        session.UserId = user.id;

        res.status(200).json({ user: user.sessionData });
      } else {
        res.status(400).json({ error: "Некорректный электронный адрес" });
      }
    },
    req,
    res
  );
}

async function authorize(req, res) {
  if ("email" in req.body && "code" in req.body) {
    await verifyCode(req, res);
  } else if ("email" in req.body) {
    await sendVerificationCode(req, res);
  } else {
    res.status(400).json({});
  }
}

async function patch(req, res) {
  const patchData = await getPatchSchema().validate(get(req, "body", {}), {
    strict: true,
    stripUnknown: true,
  });

  await runIfHasSession(
    async (session) => {
      if (!session.user || !session.user.id) {
        return void res.status(404).json({});
      }

      const user = await User.findByPk(session.user.id);

      if (!user) {
        return void res.status(404).json({});
      }

      await user.update(patchData);

      res.status(200).json({ user: user.sessionData });
    },
    () => {
      res.status(404).json({});
    },
    req,
    res
  );
}

async function logout(req, res) {
  await runIfHasSession(
    async (session) => {
      session.UserId = null;

      res.status(200).json({});
    },
    () => {
      res.status(200).json({});
    },
    req,
    res
  );
}

export default csrf(function auth(req, res) {
  if (req.method === "POST") {
    return authorize(req, res);
  } else if (req.method === "PUT") {
    return patch(req, res);
  } else if (req.method === "DELETE") {
    return logout(req, res);
  }

  res.status(405).json({});
});
