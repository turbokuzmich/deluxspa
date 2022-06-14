import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Item from "./item";

export default function Items() {
  return (
    <Box sx={{ mb: 4 }}>
      <Container
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {[1, 2, 3, 4, 5].map((id) => (
          <Item key={id} />
        ))}
      </Container>
    </Box>
  );
}
