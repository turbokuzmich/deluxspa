import get from "lodash/get";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";

const defaultSx = {
  category: {},
};

const categoryStyleOverride = {
  body_massage_oil: {
    backgroundPosition: "80% 70%",
    backgroundSize: "24%",
  },
  face_massage_oil: {
    backgroundPosition: "80% 71%",
    backgroundSize: "27%",
  },
  hair_massage_oil: {
    backgroundPosition: "80% 71%",
    backgroundSize: "27%",
  },
  scrub_for_face: {
    backgroundPosition: "100% 100%",
    backgroundSize: "contain",
  },
  scrub_for_body: {
    backgroundPosition: "80% 86%",
    backgroundSize: "28%",
  },
  essential_oil: {
    backgroundPosition: "80% 74%",
  },
  aromatherapy_for_home: {
    backgroundPosition: "80% 78%",
  },
};

export default function Category({
  id,
  title,
  image,
  addonBefore,
  description,
  sx = defaultSx,
}) {
  const { t } = useTranslation();
  const { category: categorySx, ...containerSx } = sx;

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        ...containerSx,
      }}
    >
      {addonBefore}
      <Container
        sx={{
          backgroundImage: {
            md: `url(${image})`,
          },
          backgroundPosition: "80% 100%",
          backgroundSize: "30%",
          backgroundRepeat: "no-repeat",
          display: "flex",
          gap: 4,
          position: "relative",
          ...categorySx,
          ...get(categoryStyleOverride, id, {}),
        }}
      >
        <Box
          sx={{
            pt: {
              xs: 2,
              md: 6,
            },
            pb: 6,
            flexShrink: {
              md: 0,
            },
            flexGrow: {
              md: 0,
            },
            width: {
              md: "50%",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
            paragraph
          >
            {t(title)}
          </Typography>
          {description
            ? description.map((line, index) => (
                <Typography
                  key={index}
                  variant="h6"
                  paragraph={index < description.length - 1}
                  dangerouslySetInnerHTML={{ __html: t(line) }}
                />
              ))
            : null}
        </Box>
        <Box
          sx={{
            width: "50%",
            display: {
              xs: "none",
              md: "initial",
            },
          }}
        />
      </Container>
    </Box>
  );
}
