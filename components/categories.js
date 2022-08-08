import { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import A from "@mui/material/Link";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import * as Color from "color";
import { getCategoriesWithItems } from "../lib/helpers/catalog";
import { useTheme } from "@mui/material/styles";

const gridConfig = [
  (theme) => ({
    height: 200,
    backgroundSize: "43%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 1,
      gridRowEnd: 3,
      backgroundSize: "100%",
    },
  }),
  (theme) => ({
    height: 200,
    backgroundSize: "50%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 1,
      gridRowEnd: 2,
      backgroundSize: "80%",
      backgroundPosition: "50% 0",
    },
  }),
  (theme) => ({
    height: 200,
    backgroundSize: "46%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 2,
      gridRowEnd: 3,
      backgroundSize: "80%",
      backgroundPosition: "50% 0",
    },
  }),
  (theme) => ({
    height: 200,
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 1,
      gridRowEnd: 2,
      backgroundSize: "80%",
      backgroundSize: "contain",
    },
  }),
  (theme) => ({
    height: 200,
    backgroundSize: "34%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 2,
      gridRowEnd: 3,
      backgroundPosition: "50% 0",
      backgroundSize: "50%",
    },
  }),
  (theme) => ({
    height: 200,
    backgroundSize: "71%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 1,
      gridRowEnd: 2,
      backgroundSize: "80%",
      backgroundPosition: "50% 0",
    },
  }),
  (theme) => ({
    height: 200,
    backgroundSize: "72%",
    [theme.breakpoints.up("md")]: {
      height: "auto",
      gridRowStart: 2,
      gridRowEnd: 3,
      backgroundSize: "80%",
      backgroundPosition: "66% 17%",
    },
  }),
];

export default function CategoriesPane() {
  const theme = useTheme();

  const backgroundColors = useMemo(() =>
    theme.palette.custom.panes.map((color) =>
      Color(color).lighten(0.1).rgb().toString()
    )
  );

  return (
    <Container sx={{ mb: 4, mt: 4 }}>
      <Typography
        align="center"
        variant="h4"
        sx={{
          fontWeight: "bold",
          textTransform: "uppercase",
          fontFamily: "BancoLight",
        }}
        paragraph
      >
        ваше время — бесценно!
      </Typography>
      <Box
        sx={(theme) => ({
          display: "grid",
          gridGap: theme.spacing(2),
          [theme.breakpoints.up("md")]: {
            display: "grid",
            gridGap: theme.spacing(2),
            gridAutoRows: "200px",
            gridTemplateColumns: "repeat(4, 1fr)",
          },
        })}
      >
        {getCategoriesWithItems().map((category, index) => {
          const backgroundColor =
            backgroundColors[index % backgroundColors.length];

          return (
            <Link
              key={category.id}
              href={`/catalog/category/${category.id}`}
              passHref
            >
              <A
                underline="none"
                variant="subtitle2"
                sx={(theme) => {
                  const itemStyles = gridConfig[index](theme);

                  return {
                    backgroundColor,
                    display: "flex",
                    position: "relative",
                    alignItems: "flex-end",
                    color: "text.primary",
                    backgroundImage: `url(${category.image})`,
                    backgroundSize: "80%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "50% 100%",
                    "&::after": {
                      content: '""',
                      opacity: 0,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      transition: "opacity 0.2s ease-out",
                      background: `linear-gradient(${[
                        "to bottom right",
                        theme.palette.background.default,
                        `${Color(backgroundColor)
                          .alpha(0)
                          .rgb()
                          .toString()}  30%`,
                      ].join(",")})`,
                    },
                    "&:hover::after, &:hover .title::after": {
                      opacity: 1,
                    },
                    "& .title::before, & .title::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      height: "1px",
                      backgroundColor: "text.primary",
                      transition: "left .2s ease-out, right .2s ease-out",
                      left: "50%",
                      right: "50%",
                    },
                    "&:hover .title::before": {
                      left: 0,
                    },
                    "&:hover .title::after": {
                      right: 0,
                    },
                    ...itemStyles,
                  };
                }}
              >
                <Box
                  sx={{
                    pb: 2,
                    pt: 5,
                    textAlign: "center",
                    width: "100%",
                    background: `linear-gradient(${[
                      "to bottom",
                      Color(backgroundColor).alpha(0).rgb().toString(),
                      Color(backgroundColor).alpha(1).rgb().toString(),
                    ].join(",")})`,
                  }}
                >
                  <Typography
                    className="title"
                    component="span"
                    variant="body2"
                    sx={{
                      position: "relative",
                      textTransform: "uppercase",
                    }}
                  >
                    {category.title}
                  </Typography>
                </Box>
              </A>
            </Link>
          );
        })}
      </Box>
    </Container>
  );
}
