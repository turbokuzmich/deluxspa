import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Shield from "@mui/icons-material/Shield";
import Language from "@mui/icons-material/Language";
import * as Color from "color";

const iconProps = {
  fontSize: "inherit",
  sx: (theme) => ({
    color: Color(theme.palette.custom.panes[6]).rgb().toString(),
  }),
};

const advantages = [
  {
    id: "shipping",
    icon: <LocalShipping {...iconProps} />,
    title: "Бесплатная доставка",
    subtitle: "На все заказы более 1 500₽",
  },
  {
    id: "warranty",
    icon: <Shield {...iconProps} />,
    title: "Гарантия — 30 дней",
    subtitle: "На все заказы более 1 500₽",
  },
  {
    id: "global",
    icon: <Language {...iconProps} />,
    title: "Доставка по всему миру",
    subtitle: "На все заказы более 1 500₽",
  },
];

export default function Advantages() {
  return (
    <Box sx={{ mb: 4, backgroundColor: "common.white" }}>
      <Container>
        <Grid container>
          {advantages.map(({ id, icon, title, subtitle }) => (
            <Grid
              key={id}
              xs={12}
              md={4}
              sx={{
                pt: 3,
                pb: 3,
                fontSize: 40,
                display: "flex",
                flexDirection: "row",
              }}
              item
            >
              {icon}
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
