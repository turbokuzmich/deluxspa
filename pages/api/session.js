import pick from "lodash/pick";
import { runIfHasSession } from "../../lib/backend/session";

export default async function session(req, res) {
  if (req.method === "GET") {
    await runIfHasSession(
      async (session) => {
        const responds = session.feedbackRequests
          .filter(({ isSeen, response }) => Boolean(response) && !isSeen)
          .map((request) => pick(request, ["key", "message", "response"]));

        res.status(200).json({ responds, user: session.user });
      },
      async () => {
        res.status(200).json({ responds: 0, user: null });
      },
      req,
      res
    );
  } else {
    res.status(405).json({});
  }
}
