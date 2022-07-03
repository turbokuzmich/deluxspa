import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function Category({ title, description }) {
  return (
    <Box
      sx={{
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
            sx={{ textTransform: "uppercase", fontWeight: "bold" }}
            paragraph
          >
            {title}
          </Typography>
          {description
            ? description.map((line, index) => (
                <Typography
                  key={index}
                  paragraph={index < description.length - 1}
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              ))
            : null}
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
