import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Card from "@mui/icons-material/CardMembership";
import Verified from "@mui/icons-material/Verified";
import { useTranslation } from "next-i18next";

const iconProps = {
  fontSize: "inherit",
  sx: {
    color: "custom.eco",
  },
};

const advantages = [
  {
    id: "global",
    icon: <Verified {...iconProps} />,
    title: "advantages-high-quality",
  },
  {
    id: "shipping",
    icon: <LocalShipping {...iconProps} />,
    title: "advantages-delivery",
  },
  {
    id: "warranty",
    icon: <Card {...iconProps} />,
    title: "advantages-certified",
  },
];

export default function Advantages() {
  const { t } = useTranslation();

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
                  {t(title)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
