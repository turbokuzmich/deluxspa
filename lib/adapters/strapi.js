import axios from "axios";
import omit from "lodash/omit";

const adapter = {
  async createUser({ email, emailVerified }) {
    const {
      data: {
        data: { id },
      },
    } = await axios.post(
      "http://localhost:1337/api/site-users/",
      {
        data: {
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

    return { id, email, emailVerified };
  },

  async getUser(id) {
    const {
      data: { data },
    } = await axios.get(`http://localhost:1337/api/site-users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.API_TOKEN}`,
      },
    });

    const {
      attributes: { name, email, emailVerified },
    } = data;

    return { id, name, email, emailVerified };
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
        id,
        attributes: { name, emailVerified },
      },
    ] = data;

    return { id, name, email, emailVerified };
  },

  async updateUser(updates) {
    const { id } = updates;
    const user = await adapter.getUser(id);

    const updatedUser = { ...omit(user, "id"), ...omit(updates, "id") };

    await axios.put(
      `http://localhost:1337/api/site-users/${id}`,
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
