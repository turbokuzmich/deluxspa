import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import Link from "next/link";

export default function Ingredients() {
  return (
    <Layout>
      <>
        <Container>
          <Box
            sx={{
              pt: 8,
              width: {
                md: 800,
              },
            }}
          >
            <Typography variant="h4">Ингредиенты</Typography>
          </Box>
        </Container>
      </>
    </Layout>
  );
}
