import { GraphQLClient, gql } from "graphql-request";
import get from "lodash/get";
import set from "lodash/set";

const pagesQuery = gql`
  {
    pages {
      list {
        id
        path
      }
    }
  }
`;

const pageQuery = gql`
  query getPage($id: Int!) {
    pages {
      single(id: $id) {
        content
      }
    }
  }
`;

const client = new GraphQLClient(process.env.WIKI_API_URL, {
  headers: {
    Authorization: `Bearer ${process.env.WIKI_TOKEN}`,
  },
});

export async function getPasswords() {
  const {
    pages: { list },
  } = await client.request(pagesQuery);

  const { id } = list.find(({ path }) => path === "passwords/sites");

  const {
    pages: {
      single: { content },
    },
  } = await client.request(pageQuery, { id });

  const data = content.split("\n").reduce(
    (result, line) => {
      if (line.startsWith("##")) {
        const name = line.slice(3);

        set(result, "name", name);

        set(result, ["passwords", name], get(result, ["passwords", name], []));
      } else if (result.name !== null) {
        result.passwords[result.name].push(line);
      }

      return result;
    },
    { name: null, passwords: {} }
  );

  return Object.keys(data.passwords)
    .map((key) => [key, ...data.passwords[key]].join("\n"))
    .join("\n\n");
}
