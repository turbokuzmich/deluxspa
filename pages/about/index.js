import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";

export default function About() {
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
            <Typography variant="h4">DeluxSPA</Typography>
            <Typography variant="h5" paragraph>
              Профессиональный путь к красоте
            </Typography>
            <Typography>
              ООО «Демидов Люкс СПА» является участником внешнеэкономической
              деятельности с 2020 года, представляя на зарубежных рынках
              продукцию высокого качества. Торговые марки Delux SPA, Yoko, Neon
              Beard, Sport Hit, NEW//BREEZE представлены на рынках стран СНГ, а
              также азиатских стран. Наши международные партнеры – это успешные
              и быстро развивающиеся компании. Всегда рады сотрудничеству.
            </Typography>
          </Box>
        </Container>
      </>
    </Layout>
  );
}
