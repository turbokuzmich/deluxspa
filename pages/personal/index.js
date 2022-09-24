import Layout from "../../components/layout";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { signOut } from "next-auth/react";
import { useCallback } from "react";

export default function Personal({ email }) {
  const handleLogout = useCallback(() => signOut(), []);

  return (
    <Layout>
      <Container>
        <Typography variant="h3" sx={{ textTransform: "uppercase" }} paragraph>
          Профиль {email}
        </Typography>
        <Typography>
          <Button onClick={handleLogout}>Выйти</Button>
        </Typography>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const {
    user: { email },
  } = session;

  return {
    props: { email },
  };
}
