import omit from "lodash/omit";
import api from "../api";

const adapter = {
  async createUser({ email, emailVerified }) {
    const {
      data: {
        data: { id },
      },
    } = await api.post("/site-users", {
      data: {
        email,
        emailVerified,
      },
    });

    return { id, email, emailVerified };
  },

  async getUser(id) {
    const {
      data: { data },
    } = await api.get(`/site-users/${id}`);

    const {
      attributes: { name, email, emailVerified },
    } = data;

    return { id, name, email, emailVerified };
  },

  async getUserByEmail(email) {
    const {
      data: { data },
    } = await api.get("/site-users", {
      params: {
        "filters[email]": email,
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

    await api.put(`/site-users/${id}`, {
      data: updatedUser,
    });

    return updatedUser;
  },

  createVerificationToken({ identifier, expires, token }) {
    return api.post("/verification-tokens", {
      data: {
        identifier,
        expires,
        token,
      },
    });
  },

  async useVerificationToken({ identifier, token }) {
    const {
      data: { data },
    } = await api.get("/verification-tokens", {
      params: {
        "filters[$and][0][token][$eq]": token,
        "filters[$and][1][identifier][$eq]": identifier,
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

    await api.delete(`/verification-tokens/${id}`);

    return { identifier, token, expires: new Date(expires) };
  },
};

export default adapter;
