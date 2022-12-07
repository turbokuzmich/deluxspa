const axios = require("axios");

let sessionId = null;

export const api = axios.create({
  baseURL: "https://e-solution.pickpoint.ru/api",
});

// data: {
//   SessionId: '9c60168b-8895-4f1b-af54-425376f895d5',
//   ErrorCode: 0,
//   ErrorMessage: null,
//   ExpiresIn: '2022-12-04 09:55:21'
// }
export async function login() {
  const {
    data: { SessionId },
  } = await api.post("/login", {
    Login: process.env.PICKPOINT_LOGIN,
    Password: process.env.PICKPOINT_PASSWORD,
  });

  sessionId = SessionId;
}

function ensureAuthorized(method) {
  return async function (data) {
    if (!sessionId) {
      await login();
    }

    try {
      return await method(data);
    } catch (error) {
      if (get(error, "response.status", 0) === 401) {
        await login();
        return await method(data);
      }
    }
  };
}

// {
//   Id: 445,
//   Name: 'Биробиджан',
//   NameEng: 'Birobidzhan',
//   Owner_Id: 0,
//   RegionName: 'Еврейская авт. обл.',
//   FiasId: '5d133391-46ee-496b-83a6-efeeaa903643',
//   KladrId: '7900000100000',
//   BitrixCode: '0001074211'
// },
export async function cityList() {
  const { data } = await api.get("/citylist");

  return data;
}

export function preparePostamat({
  Address,
  Number,
  CountryName,
  CitiId,
  CitiName,
  Region,
  TypeTitle,
  Latitude,
  Longitude,
  OutDescription,
  InDescription,
  WorkTimeSMS,
}) {
  return {
    externalId: Number,
    name: `${TypeTitle} ${Number}`,
    type: "pickpoint",
    latitude: Latitude,
    longitude: Longitude,
    workingTime: WorkTimeSMS,
    address: [CountryName, Region, CitiName, Address].join(", "),
    addressComment: [OutDescription, InDescription].filter(Boolean).join(" "),
    city: CitiId,
  };
}

export const clientPostamatList = ensureAuthorized(async function () {
  const { data } = await api.post("/clientpostamatlist", {
    SessionId: sessionId,
    IKN: process.env.PICKPOINT_IKN,
  });

  return data.map(preparePostamat);
});

export const calcTariff = ensureAuthorized(async function ({ point_id }) {
  const { data } = await api.post("/calctariff", {
    SessionId: sessionId,
    IKN: process.env.PICKPOINT_IKN,
    FromCity: "Москва",
    FromRegion: "Москва",
    PTNumber: point_id,
    Length: 20,
    Depth: 20,
    Width: 20,
  });

  return data;
});
