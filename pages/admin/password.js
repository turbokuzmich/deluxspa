import Layout from "../../admin/components/layout";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import get from "lodash/get";
import { useRouter } from "next/router";

export default function Admin() {
  const { query } = useRouter();

  const type = get(query, "type");
  const key = get(query, "key");

  return (
    <Layout title="Установка пароля">
      <Typography>
        Установка пароля для {type}: {key}
      </Typography>
      <Button></Button>
    </Layout>
  );
}
