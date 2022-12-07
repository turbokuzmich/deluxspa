import { Op } from "sequelize";
import {
  cityList as fetchPickpointCities,
  clientPostamatList as fetchPickpointPaints,
} from "../../../lib/backend/pickpoint";
import {
  cities as fetchCdekCities,
  regions as fetchCdekRegions,
  deliveryPoints as fetchCdekPoints,
} from "../../../lib/backend/cdek";
import sequelize from "../../../lib/backend/sequelize";
import get from "lodash/get";
import property from "lodash/property";
import isFunction from "lodash/isFunction";
import differenceWith from "lodash/differenceWith";
import groupBy from "lodash/groupBy";
import chunk from "lodash/chunk";

const corrections = {
  "обл.": "область",
  "авт.": (index, tokens) =>
    tokens[index + 1] === "обл." ? "автономная" : "автономный",
  "респ.": "республика",
};

const switches = [
  "Крым",
  "Бурятия",
  "Алтай",
  "Карелия",
  "Коми",
  "Тыва",
  "Хакасия",
];

const aliases = {
  "Башкортостан республика": "Башкортостан",
  "Дагестан республика": "Дагестан",
  "Кабардино-Балкарская республика": "Кабардино-Балкария",
  "Калмыкия республика": "Калмыкия",
  "Карачаево-Черкесская республика": "Карачаево-Черкесия",
  "Марий Эл республика": "Марий Эл",
  "Мордовия республика": "Мордовия",
  "Саха (Якутия) республика": "Республика Саха (Якутия)",
  "Северная Осетия-Алания республика": "Республика Северная Осетия - Алания",
  "Татарстан республика": "Татарстан",
  "Ханты-Мансийский автономный округ-Югра":
    "Ханты-Мансийский автономный округ - Югра",
  "Удмуртская республика": "Удмуртия",
  "Ингушская республика": "Ингушетия",
  "Чувашия республика": "Чувашия",
  "Адыгея республика": "Адыгея",
  "Чечня республика": "Чеченская Республика",
};

function correctPickpointRegion(region) {
  let tokens = region.split(" ").map((token, index, array) => {
    const correction = get(corrections, token, token);

    return isFunction(correction) ? correction(index, array) : correction;
  });

  if (switches.includes(tokens[0])) {
    tokens = [
      `${tokens[1].charAt(0).toUpperCase()}${tokens[1].slice(1)}`,
      tokens[0],
    ];
  }

  const corrected = tokens.join(" ");

  return get(aliases, corrected, corrected);
}

async function importCdekRegions() {
  for (let page = 0; page < 1; page++) {
    const cdekRegions = await fetchCdekRegions(page);

    if (cdekRegions.length === 0) {
      break;
    }

    const existing = await sequelize.models.Region.findAll({
      where: {
        code: {
          [Op.in]: cdekRegions.map(property("region_code")),
        },
      },
    });

    const newCdekRegions = differenceWith(
      cdekRegions,
      existing,
      (incomingRegion, existingRegion) =>
        incomingRegion.region_code === existingRegion.code
    );

    await sequelize.models.Region.bulkCreate(
      newCdekRegions.map(({ region, region_code }) => ({
        code: region_code,
        name: region,
        name_lo: region.toLowerCase(),
      }))
    );
  }

  console.log("sdek regions imported");
}

async function importCdekCities() {
  for (let page = 0; true; page++) {
    const cdekCities = await fetchCdekCities(page);

    if (cdekCities.length === 0) {
      break;
    }

    const existing = await sequelize.models.City.findAll({
      where: {
        cdekCode: {
          [Op.in]: cdekCities.map(property("code")),
        },
      },
    });

    const newCdekCities = differenceWith(
      cdekCities,
      existing,
      (incomingCity, existingCity) =>
        incomingCity.code === existingCity.cdekCode
    );

    await sequelize.models.City.bulkCreate(
      newCdekCities.map(
        ({
          code,
          city,
          region = "",
          region_code,
          fias_guid,
          kladr_code,
          latitude,
          longitude,
        }) => ({
          name: city,
          name_lo: city.toLowerCase(),
          region: region,
          region_lo: region.toLowerCase(),
          cdekCode: code,
          cdekRegionCode: region_code,
          latitude,
          longitude,
          fiasId: fias_guid,
          kladrId: kladr_code,
        })
      )
    );

    console.log("imported page", page, "of cdek");
  }

  console.log("cdek imported");
}

async function importPickpointCities() {
  const pickpointCities = await fetchPickpointCities();

  for (const pickpointCity of pickpointCities) {
    const existingByPickpointId = await sequelize.models.City.findOne({
      where: {
        pickpointId: pickpointCity.Id,
      },
    });

    if (existingByPickpointId !== null) {
      continue;
    }

    const region = correctPickpointRegion(pickpointCity.RegionName);

    if (pickpointCity.FiasId) {
      const existingByFias = await sequelize.models.City.findAll({
        where: {
          fiasId: pickpointCity.FiasId,
        },
      });

      if (existingByFias.length === 1) {
        const [match] = existingByFias;

        let update = {
          pickpointId: pickpointCity.Id,
        };

        if (pickpointCity.KladrId && !existingByFias.kladrId) {
          update.kladrId = pickpointCity.KladrId;
        }

        await match.update(update);

        console.log("updated by fias", pickpointCity.Name);

        continue;
      } else if (existingByFias.length > 1) {
        console.log("multiple for fias", pickpointCity.FiasId);
      }
    }

    if (pickpointCity.KladrId) {
      const existingByKladr = await sequelize.models.City.findAll({
        where: {
          kladrId: pickpointCity.KladrId,
        },
      });

      if (existingByKladr.length === 1) {
        const [match] = existingByKladr;

        let update = {
          pickpointId: pickpointCity.Id,
        };

        if (pickpointCity.FiasId && !existingByKladr.fiasId) {
          update.fiasId = pickpointCity.FiasId;
        }

        await match.update(update);

        console.log("updated by kladr", pickpointCity.Name);

        continue;
      } else if (existingByKladr.length > 1) {
        console.log("multiple for kladr", pickpointCity.KladrId);
      }
    }

    const existingByName = await sequelize.models.City.findAll({
      where: {
        name_lo: pickpointCity.Name.toLowerCase(),
      },
    });

    if (existingByName.length) {
      const match = existingByName.find(
        (city) =>
          city.region === region ||
          city.fiasId === pickpointCity.FiasId ||
          city.kladrId === pickpointCity.KladrId
      );

      if (match) {
        const update = {
          pickpointId: pickpointCity.Id,
        };

        if (pickpointCity.FiasId && !match.fiasId) {
          update.fiasId = pickpointCity.FiasId;
        }

        if (pickpointCity.FiasId && !match.fiasId) {
          update.fiasId = pickpointCity.FiasId;
        }

        await match.update(update);

        console.log("updated by name", pickpointCity.Name);

        continue;
      }
    }

    const createData = {
      name: pickpointCity.Name,
      name_lo: pickpointCity.Name.toLowerCase(),
      region: region,
      region_lo: region.toLowerCase(),
      pickpointId: pickpointCity.Id,
      fiasId: pickpointCity.FiasId,
      kladrId: pickpointCity.KladrId,
    };

    // FIXME от Pickpoint не приходят координаты городов

    const existingRegion = await sequelize.models.Region.findOne({
      where: {
        name: region,
      },
    });

    if (existingRegion !== null) {
      createData.cdekRegionCode = existingRegion.code;
    }

    await sequelize.models.City.create(createData);
  }

  console.log("pickpoint imported");
}

async function updateLonePickpoints() {
  const alone = await sequelize.models.City.findAll({
    where: {
      cdekRegionCode: {
        [Op.is]: null,
      },
      region: {
        [Op.not]: null,
      },
    },
  });

  const regionNames = Array.from(
    alone.reduce(
      (regions, city) =>
        city.region.length ? regions.add(city.region) : regions,
      new Set()
    )
  );

  const regions = await sequelize.models.Region.findAll({
    where: {
      name: {
        [Op.in]: regionNames,
      },
    },
  });

  const regionCodesByNames = regions.reduce(
    (names, region) => ({ ...names, [region.name]: region.code }),
    {}
  );

  const groupedCities = groupBy(alone, property("region"));

  await Promise.all(
    Object.keys(regionCodesByNames).map((region) =>
      sequelize.models.City.update(
        {
          cdekRegionCode: regionCodesByNames[region],
        },
        {
          where: {
            id: groupedCities[region].map((city) => city.id),
          },
        }
      )
    )
  );
}

async function importPoints(points, type) {
  const chunks = chunk(points, 1000);

  for (const slice of chunks) {
    const ids = slice.map(property("externalId"));

    const existing = await sequelize.models.Point.findAll({
      where: {
        type,
        externalId: ids,
      },
    });

    // FIXME skip updates for now

    const newPoints = differenceWith(slice, existing, property("externalId"));

    await sequelize.models.Point.bulkCreate(newPoints);
  }
}

async function importPickpointPoints() {
  await importPoints(await fetchPickpointPaints(), "pickpoint");
}

async function importCdekPoints() {
  await importPoints(await fetchCdekPoints(), "cdek");
}

export default async function cache(_, res) {
  await importCdekRegions();
  await importCdekCities();
  await importPickpointCities();
  await importCdekPoints();
  await importPickpointPoints();

  // await updateLonePickpoints();

  res.status(200).json({});
}
