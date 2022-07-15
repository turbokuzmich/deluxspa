import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Grid from "@mui/material/Grid";
import { compositionItems, compositionItemsGridOrder } from "../../constants";
import A from "@mui/material/Link";
import Link from "next/link";

export default function Ingredients() {
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
          <Typography
            variant="h3"
            sx={{
              textTransform: "uppercase",
              mb: 4,
            }}
          >
            Ингредиенты
          </Typography>
          <Grid
            rowSpacing={{
              xs: 2,
              md: 4,
            }}
            columnSpacing={8}
            container
          >
            {compositionItemsGridOrder.map((id) => (
              <Grid key={id} md={6} item>
                <Link href={`/ingredients/${id}`} passHref>
                  <A
                    underline="none"
                    sx={{
                      "&:hover .title": {
                        textDecoration: "underline",
                      },
                      "&:hover .brief": {
                        textDecoration: "none",
                      },
                    }}
                  >
                    <Typography
                      variant="h5"
                      className="title"
                      sx={{
                        textTransform: "uppercase",
                      }}
                    >
                      {compositionItems[id].title}
                    </Typography>
                    <Typography
                      className="brief"
                      dangerouslySetInnerHTML={{
                        __html: compositionItems[id].brief,
                      }}
                    ></Typography>
                  </A>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}
