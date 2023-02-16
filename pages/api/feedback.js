import * as yup from "yup";
import memoize from "lodash/memoize";
import get from "lodash/get";
import pick from "lodash/pick";
import t from "../../lib/helpers/i18n";
import { v4 as uuid } from "uuid";
import { notifyOfFeedBack } from "../../lib/backend/bot";
import withSession, { runIfHasSession } from "../../lib/backend/session";

const getFeedbackValidators = memoize(() =>
  yup.object().shape({
    phone: yup
      .string()
      .trim()
      .required(t("cart-page-phone-number-empty"))
      .matches(/^\d{10}$/, t("cart-page-phone-number-incorrect")),
    email: yup.string().email(t("cart-page-email-incorrect")),
    message: yup.string().trim().required("Пожалуйста, напишите нам сообщение"),
  })
);

export default async function feedback(req, res) {
  if (req.method === "POST") {
    const feedbackData = await getFeedbackValidators().validate(
      get(req, "body", {}),
      {
        strict: true,
        stripUnknown: true,
      }
    );

    const feedback = {
      key: uuid(),
      ...feedbackData,
    };

    await withSession(
      async function (session) {
        session.feedbackRequests.push(feedback);

        await notifyOfFeedBack(feedback);
      },
      req,
      res
    );

    res.status(200).json({});
  } else if (req.method === "GET") {
    await runIfHasSession(
      async (session) => {
        const responds = session.feedbackRequests
          .filter((resp) => {
            const { isSeen, response } = resp;
            return Boolean(response) && !isSeen;
          })
          .map((request) => pick(request, ["key", "message", "response"]));

        res.status(200).json({ responds });
      },
      async () => {
        res.status(200).json({ responds: 0 });
      },
      req,
      res
    );
  } else if (req.method === "DELETE") {
    return await runIfHasSession(
      async (session) => {
        const keys = new Set(get(req, ["query", "key"], "").split(","));

        for (let i = 0; i < session.feedbackRequests.length; i++) {
          session.feedbackRequests[i].isSeen = true;
        }

        res.status(200).json({});
      },
      async () => {
        res.status(200).json({});
      },
      req,
      res
    );
  } else {
    res.status(405).json({});
  }
}
