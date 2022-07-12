import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";

export default function Cooperation() {
  return (
    <Layout>
      <>
        <Container>
          <Box
            sx={{
              pt: 8,
            }}
          >
            <Typography
              variant="h3"
              sx={{ textTransform: "uppercase" }}
              paragraph
            >
              сотрудничество
            </Typography>
          </Box>
        </Container>
      </>
    </Layout>
  );
}
