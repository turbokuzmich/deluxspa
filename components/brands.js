import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Link from "next/link";
import YokoLogo from "./yoko";
import SporthitLogo from "./sporthit";
import Image from "./image";
import get from "lodash/get";

const brands = ["yoko", "neonbeard", "sporthit"];

const data = {
  yoko: {
    title: "Yoko",
    description: "Тут что-то нужно написать про чудеснейшую линеечку Yoko",
    logo: <YokoLogo />,
    href: "https://yoko24.ru",
  },
  neonbeard: {
    title: "Neon Beard",
    description:
      "Селективная косметика для мужчин для ухода за кожей лица и бородой",
    logo: (
      <Image
        src="https://neon-beard.ru/assets/images/logo.png"
        sx={{
          width: 250,
        }}
      />
    ),
    href: "https://neon-beard.ru",
    background:
      "linear-gradient(90deg, rgba(18,53,115,1) 0%, rgba(139,46,176,1) 100%)",
  },
  sporthit: {
    title: "Sport Hit",
    description:
      "Косметические средства для людей, ведущих активный образ жизни",
    logo: <SporthitLogo />,
    href: "https://sporthit.online",
  },
};

export default function Brands() {
  return (
    <Container
      sx={{
        mb: 4,
      }}
    >
      <Typography align="center" variant="h4" paragraph>
        Наши бренды
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
        }}
      >
        {brands.map((brand) => (
          <Link key={brand} href={data[brand].href} passHref>
            <A
              target="_blank"
              underline="none"
              sx={{
                color: 'text.primary',
                flexShrink: 0,
                flexGrow: 0,
                width: 300,
              }}
            >
              <Box
                sx={{
                  mb: 2,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: get(data, [brand, "background"], "transparent"),
                }}
              >
                {data[brand].logo}
              </Box>
              <Typography
                sx={{
                  textAlign: "center",
                }}
              >
                {data[brand].description}
              </Typography>
            </A>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
