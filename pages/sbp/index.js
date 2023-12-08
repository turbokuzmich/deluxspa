import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import QRCode from "react-qr-code";
import api from "../../lib/frontend/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";

const Code = styled(QRCode)``;

export default function Promo() {
  const [sum, setSum] = useState(0);
  const [url, setUrl] = useState(null);
  const [generating, setIsGenerating] = useState(false);

  const onGenerate = useCallback(() => {
    setIsGenerating(true);
    api
      .post("/sbp", {
        sum: sum,
      })
      .then(({ data: { url } }) => {
        console.log(url);
        setUrl(url);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [sum]);

  const onChange = useCallback(
    (event) => {
      setSum(parseInt(event.target.value, 10));
      setUrl(null);
    },
    [setUrl, setSum]
  );

  return (
    <Container>
      <Box
        sx={{
          pt: 8,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            id="filled-basic"
            label="Сумма"
            variant="filled"
            type="number"
            onChange={onChange}
            sx={{
              width: "100%",
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onGenerate}
            disabled={!sum || generating}
          >
            Получить код
          </Button>
        </Box>
        {url && !generating ? (
          <Code
            size={256}
            value={url}
            viewBox={`0 0 256 256`}
            sx={{
              width: "100%",
              height: "auto",
              maxWidth: 500,
            }}
          />
        ) : null}
      </Box>
    </Container>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
