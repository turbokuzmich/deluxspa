import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Card from "@mui/icons-material/CardMembership";
import Verified from "@mui/icons-material/Verified";
import * as Color from "color";

const iconProps = {
  fontSize: "inherit",
  sx: (theme) => ({
    color: Color(theme.palette.custom.panes[6]).rgb().toString(),
  }),
};

const advantages = [
  {
    id: "global",
    icon: <Verified {...iconProps} />,
    title: "Высокое качество",
  },
  {
    id: "shipping",
    icon: <LocalShipping {...iconProps} />,
    title: "Доставка по РФ и СНГ",
  },
  {
    id: "warranty",
    icon: <Card {...iconProps} />,
    title: "Продукция сертифицирована",
  },
];

export default function Advantages() {
  return (
    <Box sx={{ pb: 2, pt: 2, backgroundColor: "common.white" }}>
      <Container>
        <Grid container>
          {advantages.map(({ id, icon, title }) => (
            <Grid
              key={id}
              xs={12}
              md={4}
              sx={{
                pt: {
                  xs: 1,
                  md: 3,
                },
                pb: {
                  xs: 1,
                  md: 3,
                },
                fontSize: 32,
                display: "flex",
                flexDirection: "row",
              }}
              item
            >
              {icon}
              <Box sx={{ ml: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
