import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "../../components/header";
import Typography from "@mui/material/Typography";

export default function About() {
  return (
    <>
      <Header />
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
            деятельности с 2020 года, представляя на зарубежных рынках продукцию
            высокого качества. Торговые марки DeluxSPA, ONNO, NEON BEARD, SPORT
            HIT, NEW//BREEZE, представлены на рынках стран СНГ, а также
            азиатских стран. Наши международные партнеры – это успешные и быстро
            развивающиеся компании. Всегда рады сотрудничеству.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
