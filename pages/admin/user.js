import A from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import Typography from "@mui/material/Typography";

export default function User() {
  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link href="/admin/" passHref>
        <A>Главная</A>
      </Link>
      <Typography color="text.primary">Пользователь</Typography>
    </Breadcrumbs>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      title: "Пользователь",
    },
  };
}
