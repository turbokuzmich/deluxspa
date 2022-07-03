import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Item from "./item";

export default function Items({ items }) {
  return (
    <Box sx={{ mb: 4, mt: 4 }}>
      <Container
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {items.map((id) => (
          <Item key={id} id={id} />
        ))}
      </Container>
    </Box>
  );
}
