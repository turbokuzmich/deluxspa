import get from "lodash/get";
import { restricted } from "../../../../lib/middleware/admin";
import { orderByIm } from "../../../../lib/backend/cdek";

export default restricted(async function search(req, res) {
  const search = get(req, "query.search", "");

  try {
    const order = await orderByIm(search);

    res.status(200).json(order);
  } catch (error) {
    const errorCode = get(error, "response.data.requests.0.errors.0.code");

    if (errorCode === "v2_entity_not_found_im_number") {
      res.status(404).json();
    } else {
      res.status(500).json();
    }
  }
});
