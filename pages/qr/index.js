import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import QrNeon from "../../components/qrneon";
import QrSporthit from "../../components/qrsporthit";

export default function Qr() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5vmin",
        }}
      >
        <Box sx={{ width: "30vmin", textAlign: "center", color: "#0277bd" }}>
          <Typography variant="h4" fontWeight="bold">
            Neon Beard
          </Typography>
          <QrNeon
            sx={{
              maxWidth: "100%",
            }}
          />
        </Box>
        <Box sx={{ width: "30vmin", textAlign: "center", color: "#0277bd" }}>
          <Typography variant="h4" fontWeight="bold">
            SportHIT
          </Typography>
          <QrSporthit
            sx={{
              maxWidth: "100%",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
