import get from "lodash/get";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const defaultSx = {
  category: {},
};

const categoryStyleOverride = {
  body_massage_oil: {
    backgroundSize: "24%",
  },
  face_massage_oil: {
    backgroundSize: "28%",
  },
  hair_massage_oil: {
    backgroundSize: "28%",
    backgroundPosition: "86% 100%",
  },
  scrub_for_face: {
    backgroundSize: "contain",
    backgroundPosition: "100% 100%",
  },
  scrub_for_body: {
    backgroundSize: "28%",
    backgroundPosition: "80% -76%",
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
            {title}
          </Typography>
          {description
            ? description.map((line, index) => (
                <Typography
                  key={index}
                  variant="h6"
                  paragraph={index < description.length - 1}
                  dangerouslySetInnerHTML={{ __html: line }}
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
