import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Layout from "../../components/layout";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import A from "@mui/material/Link";
import Link from "next/link";
import Price from "../../components/price";
import Image from "../../components/image";
import { compositionItems } from "../../constants";
import { getItemsByCompositionId } from "../../lib/helpers/catalog";

function Content({ id, title, brief, description }) {
  const catalogItems = getItemsByCompositionId(id);

  return (
    <>
      <Typography paragraph>
        <Link href="/ingredients" passHref>
          <A>Все ингредиенты</A>
        </Link>
      </Typography>
      <Typography
        variant="h3"
        sx={{
          textTransform: "uppercase",
        }}
        paragraph
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: {
            xs: 2,
            md: 8,
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Box
          sx={{
            flexGrow: 0,
            width: {
              md: "60%",
            },
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h5"
            dangerouslySetInnerHTML={{
              __html: brief,
            }}
            paragraph
          />
          {description.map((line, index) => (
            <Typography
              key={index}
              dangerouslySetInnerHTML={{
                __html: line,
              }}
              paragraph
            ></Typography>
          ))}
        </Box>
        <Box
          sx={{
            flexGrow: 0,
            width: {
              md: "40%",
            },
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">Входит в состав:</Typography>
          <Box
            sx={{
              mt: 1,
              gap: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {catalogItems.map((item) => (
              <Link key={item.id} href={`/catalog/item/${item.id}`} passHref>
                <A
                  underline="none"
                  sx={{
                    gap: 2,
                    display: "flex",
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      flexGrow: 0,
                      flexShrink: 0,
                      display: "flex",
                    }}
                  >
                    <Image src={item.image} sx={{ maxWidth: "100%" }} />
                  </Box>
                  <Box
                    sx={{
                      flexGrow: 1,
                      flexShrink: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flexGrow: 1,
                        flexShrink: 0,
                      }}
                    >
                      {item.brief}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                    >
                      <Price sum={item.price} />
                    </Typography>
                  </Box>
                </A>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default function Ingredient() {
  const {
    query: { id },
  } = useRouter();

  const ingredient = compositionItems[id];

  return (
    <Layout>
      <Container>
        <Box
          sx={{
            pt: {
              xs: 4,
              md: 8,
            },
            pb: {
              xs: 4,
              md: 8,
            },
          }}
        >
          {ingredient ? <Content id={id} {...ingredient} /> : null}
        </Box>
      </Container>
    </Layout>
  );
}
