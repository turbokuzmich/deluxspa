import axios from "axios";
import omit from "lodash/omit";
import { v4 as uuidv4 } from "uuid";

// Вместо uid пользователя использовать id из strapi

const adapter = {
  async createUser({ email, emailVerified }) {
    const uid = uuidv4();

    await axios.post(
      "http://localhost:1337/api/site-users/",
      {
        data: {
          uid,
          email,
          emailVerified,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    return { id: uid, email, emailVerified };
  },

  async getUser(id) {
    const {
      data: { data },
    } = await axios.get("http://localhost:1337/api/site-users/", {
      params: {
        "filters[uid]": id,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.API_TOKEN}`,
      },
    });

    if (data.length === 0) {
      return null;
    }

    const [
      {
        id: _id,
        attributes: { uid, name, email, emailVerified },
      },
    ] = data;

    return { _id, id: uid, name, email, emailVerified };
  },

  async getUserByEmail(email) {
    const {
      data: { data },
    } = await axios.get("http://localhost:1337/api/site-users/", {
      params: {
        "filters[email]": email,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.API_TOKEN}`,
      },
    });

    if (data.length === 0) {
      return null;
    }

    const [
      {
        id: _id,
        attributes: { uid, name, emailVerified },
      },
    ] = data;

    return { _id, id: uid, name, email, emailVerified };
  },

  async updateUser({ id, emailVerified }) {
    const user = await adapter.getUser(id);

    const updatedUser = { ...omit(user, ["_id", "id"]), emailVerified };

    await axios.put(
      `http://localhost:1337/api/site-users/${user._id}`,
      {
        data: updatedUser,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    return updatedUser;
  },

  createVerificationToken({ identifier, expires, token }) {
    return axios.post(
      "http://localhost:1337/api/verification-tokens/",
      {
        data: {
          identifier,
          expires,
          token,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.API_TOKEN}`,
        },
      }
    );
  },

  async useVerificationToken({ identifier, token }) {
    const {
      data: { data },
    } = await axios.get("http://localhost:1337/api/verification-tokens/", {
      params: {
        "filters[$and][0][token][$eq]": token,
        "filters[$and][1][identifier][$eq]": identifier,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.API_TOKEN}`,
      },
    });

    if (data.length === 0) {
      return null;
    }

    const [
      {
        id,
        attributes: { expires },
      },
    ] = data;

    await axios.delete(`http://localhost:1337/api/verification-tokens/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.API_TOKEN}`,
      },
    });

    return { identifier, token, expires: new Date(expires) };
  },
};

export default adapter;
