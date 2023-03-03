import { GraphQLClient, gql } from "graphql-request";
import { string } from "yup";

const emailPageId = 41;
const isEmail = string().required().email();

function validateEmail(candidate) {
  try {
    return (
      candidate.length > 0 &&
      candidate.includes("@") &&
      isEmail.validateSync(candidate)
    );
  } catch (_) {
    return false;
  }
}

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
        id
        path
        locale
        content
      }
    }
  }
`;

// update(
//   id: Int!
//   content: String
//   description: String
//   editor: String
//   isPrivate: Boolean
//   isPublished: Boolean
//   locale: String
//   path: String
//   publishEndDate: Date
//   publishStartDate: Date
//   scriptCss: String
//   scriptJs: String
//   tags: [String]
//   title: String
// ):
// {"query": "mutation { pages { update ( id: 38, content: \"Тут был йа\", tags: [\"obanze\"], isPublished: true ) { responseResult { succeeded slug message } } } }"}
const pageMutation = gql`
  mutation updatePage($id: Int!, $content: String) {
    pages {
      update(id: $id, content: $content, tags: [], isPublished: true) {
        responseResult {
          slug
          message
          succeeded
        }
      }
    }
  }
`;

const client = new GraphQLClient(process.env.WIKI_API_URL, {
  headers: {
    Authorization: `Bearer ${process.env.WIKI_TOKEN}`,
  },
});

export async function suggestEmail(query) {
  const {
    pages: {
      single: { content },
    },
  } = await client.request(pageQuery, { id: emailPageId });

  const token = query.trim().toLowerCase();

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => validateEmail(line) && line.includes(token));
}

export async function getEmailPassword(email) {
  const {
    pages: {
      single: { content },
    },
  } = await client.request(pageQuery, { id: emailPageId });

  const lines = content.split("\n");
  const token = email.trim().toLowerCase();

  const emailIndex = lines
    .map((line) => line.trim())
    .findIndex((line) => validateEmail(line) && line === token);

  if (emailIndex < 0) {
    return null;
  }

  return lines[emailIndex + 1].trim();
}

// type Page {
//   id: Int!
//   path: String!
//   hash: String!
//   title: String!
//   description: String!
//   isPrivate: Boolean! @auth(requires: ["write:pages", "manage:system"])
//   isPublished: Boolean! @auth(requires: ["write:pages", "manage:system"])
//   privateNS: String @auth(requires: ["write:pages", "manage:system"])
//   publishStartDate: Date! @auth(requires: ["write:pages", "manage:system"])
//   publishEndDate: Date! @auth(requires: ["write:pages", "manage:system"])
//   tags: [PageTag]!
//   content: String! @auth(requires: ["read:source", "write:pages", "manage:system"])
//   render: String
//   toc: String
//   contentType: String!
//   createdAt: Date!
//   updatedAt: Date!
//   editor: String! @auth(requires: ["write:pages", "manage:system"])
//   locale: String!
//   scriptCss: String
//   scriptJs: String
//   authorId: Int! @auth(requires: ["write:pages", "manage:system"])
//   authorName: String! @auth(requires: ["write:pages", "manage:system"])
//   authorEmail: String! @auth(requires: ["write:pages", "manage:system"])
//   creatorId: Int! @auth(requires: ["write:pages", "manage:system"])
//   creatorName: String! @auth(requires: ["write:pages", "manage:system"])
//   creatorEmail: String! @auth(requires: ["write:pages", "manage:system"])
// }

export async function setEmailPassword(email, password, append = true) {
  const {
    pages: {
      single: { content },
    },
  } = await client.request(pageQuery, { id: emailPageId });

  const lines = content.split("\n");
  const token = email.trim().toLowerCase();

  const emailIndex = lines
    .map((line) => line.trim())
    .findIndex((line) => validateEmail(line) && line === token);

  if (emailIndex > 0 && append) {
    lines[emailIndex + 1] = password;
  } else {
    lines.push("\n", email, password);
  }

  await client.request(pageMutation, {
    id: emailPageId,
    content: lines.join("\n"),
  });
}
