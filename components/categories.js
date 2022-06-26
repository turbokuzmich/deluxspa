import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import A from "@mui/material/Link";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import * as Color from "color";
import { categoriesDispayedOnPane, catalogTree } from "../constants";
import memoize from "lodash/memoize";

const gridConfig = [
  (theme) => ({
    backgroundColor: Color(theme.palette.background.paper)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridRowStart: 1,
    gridRowEnd: 4,
  }),
  (theme) => ({
    backgroundColor: Color(theme.palette.custom.pane2)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridRowStart: 1,
    gridRowEnd: 3,
  }),
  (theme) => ({
    backgroundColor: Color(theme.palette.custom.pane3)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridRowStart: 3,
    gridRowEnd: 4,
  }),
  (theme) => ({
    backgroundColor: Color(theme.palette.custom.pane4)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridColumnStart: 3,
    gridColumnEnd: 5,
  }),
  (theme) => ({
    backgroundColor: Color(theme.palette.custom.pane2)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridRowStart: 2,
    gridRowEnd: 4,
  }),
  (theme) => ({
    backgroundColor: Color(theme.palette.background.paper)
      .lighten(0.1)
      .rgb()
      .toString(),
    gridRowStart: 2,
    gridRowEnd: 4,
  }),
];

// TODO move to helpers
const getCategoryByPath = memoize(
  (path) => {
    function searcher(path, categories) {
      const normalizedPath = [].concat(path);

      if (normalizedPath.length === 1) {
        return categories.find(({ id }) => id === normalizedPath[0]);
      }

      const categoryId = normalizedPath.shift();
      const category = categories.find(({ id }) => id === categoryId);

      return searcher(normalizedPath, category.categories);
    }

    return searcher(path, catalogTree);
  },
  (path) => path.toString()
);

// Плитка категорий на главной
export default function CategoriesPane() {
  return (
    <Container sx={{ mb: 4 }}>
      <Box
        sx={(theme) => ({
          display: "grid",
          gridGap: theme.spacing(2),
          gridAutoRows: "130px",
          gridTemplateColumns: "repeat(4, 1fr)",
        })}
      >
        {categoriesDispayedOnPane.map((categoryPath, index) => {
          const category = getCategoryByPath(categoryPath);
          const title = category.paneTitle || category.title;

          return (
            <Link
              key={categoryPath}
              href={`/catalog/category/${category.id}`}
              passHref
            >
              <A
                underline="none"
                variant="subtitle2"
                sx={(theme) => {
                  const itemStyles = gridConfig[index](theme);

                  return {
                    ...itemStyles,
                    p: 2,
                    display: "flex",
                    position: "relative",
                    alignItems: "flex-end",
                    color: "text.primary",
                    backgroundImage: "url(/images/face.png)",
                    backgroundSize: "80%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "100% 100%",
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
                        `${Color(itemStyles.backgroundColor)
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
                  };
                }}
              >
                <Typography
                  className="title"
                  sx={{
                    position: "relative",
                  }}
                >
                  {title}
                </Typography>
              </A>
            </Link>
          );
        })}
      </Box>
    </Container>
  );
}
