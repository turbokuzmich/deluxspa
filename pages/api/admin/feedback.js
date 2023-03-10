import { FeedbackRequest } from "../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function feedback(req, res) {
  if (req.method === "GET") {
    const key = get(req, ["query", "key"], "");

    const feedback = await FeedbackRequest.findOne({
      where: {
        key,
      },
    });

    if (feedback) {
      return res.status(200).json(feedback.toJSON());
    } else {
      return res.status(404).json({});
    }
  } else if (req.method === "POST") {
    const key = get(req, ["body", "key"], "");
    const response = get(req, ["body", "response"], "");

    const feedback = await FeedbackRequest.findOne({
      where: {
        key,
      },
    });

    if (feedback) {
      if (feedback.response) {
        return res.status(406).json({});
      } else {
        await feedback.update({ response });

        return res.status(200).json(feedback.toJSON());
      }
    } else {
      return res.status(404).json({});
    }
  }

  res.status(405).json({});
}
