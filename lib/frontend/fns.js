import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const fnsApi = createApi({
  reducerPath: "fns",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api-fns.ru/api",
    paramsSerializer: (params) => {
      const query = new URLSearchParams(params);

      query.set("key", process.env.NEXT_PUBLIC_FNS_KEY);

      return query.toString();
    },
  }),
  endpoints: (builder) => ({
    search: builder.query({
      query: (inn) => ({
        url: "/egr",
        params: {
          req: inn,
        },
      }),
    }),
    check: builder.query({
      query: (inn) => ({
        url: "/check",
        params: {
          req: inn,
        },
      }),
    }),
  }),
});

export default fnsApi;
