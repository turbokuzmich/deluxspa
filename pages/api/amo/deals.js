import amocrm from "../../../lib/backend/amo";

async function deals(req, res) {
  const results = await amocrm.request.get("/api/v4/events", {
    limit: 20,
    filter: {
      entity: "lead",
      entity_id: 19760275,
    },
  });

  return res.status(200).json(results.data._embedded.events);
}

export default deals;
