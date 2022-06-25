import Box from "@mui/material/Box";
import Header from "./header";
import Footer from "./footer";

export default function Layout({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box sx={{ flexGrow: 1, flexShrink: 0 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
