import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Image from "./image";

export default function Category({ title }) {
  return (
    <Box
      sx={{
        mb: 4,
        backgroundColor: "background.paper",
      }}
    >
      <Container
        sx={{
          display: "flex",
          gap: 4,
        }}
      >
        <Box
          sx={{
            width: "50%",
            flexShrink: 0,
            flexGrow: 0,
            paddingTop: 6,
            paddingBottom: 6,
          }}
        >
          <Typography
            variant="h4"
            sx={{ textTransform: "uppercase" }}
            paragraph
          >
            {title}
          </Typography>
          <Typography paragraph>
            Косметические средства для ухода за лицом представлены в двух линиях
            — ARAVIA Professional и ARAVIA Laboratories. Это высокотехнологичный
            инновационный уход и профессиональная забота о коже. Максимальная
            результативность продуктов, предназначенных для лица, шеи и зоны
            декольте, достигается за счет комплексного подхода, проверенных
            рецептур и высоких стандартов качества.
          </Typography>
          <Typography>
            Широкий выбор средств по проблеме, высокая безопасность и
            сочетаемость компонентов сделают кожу молодой и здоровой, а лицо
            сияющим.
          </Typography>
        </Box>
        <Box
          sx={{
            width: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            flexGrow: 0,
            backgroundImage: "url(/images/face.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
      </Container>
    </Box>
  );
}
