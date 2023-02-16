import * as yup from "yup";
import memoize from "lodash/memoize";
import t from "../../lib/helpers/i18n";
import { notifyOfFeedBack } from "../../lib/backend/bot";
import withSession from "../../lib/backend/session";

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
  const feedback = await getFeedbackValidators().validate(req.body, {
    strict: true,
    stripUnknown: true,
  });

  await withSession(
    async function (session) {
      session.feedbackRequests = session.feedbackRequests
        ? [...session.feedbackRequests, feedback]
        : [feedback];

      await notifyOfFeedBack(feedback);
    },
    req,
    res
  );

  res.status(200).json({});
}
