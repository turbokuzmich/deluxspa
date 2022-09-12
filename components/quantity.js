import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import noop from "lodash/noop";
import { useCallback, useEffect, useState } from "react";

export default function QuantityInput({
  quantity = 1,
  isChanging = false,
  onChange = noop,
}) {
  const [value, setValue] = useState(quantity);

  const handleDec = useCallback(() => {
    const newValue = Math.max(1, value - 1);

    setValue(newValue);
    onChange(newValue);
  }, [value, setValue, onChange]);

  const handleInc = useCallback(() => {
    const newValue = value + 1;

    setValue(newValue);
    onChange(newValue);
  }, [value, setValue, onChange]);

  useEffect(() => {
    if (!isChanging) {
      setValue(1);
    }
  }, [isChanging, setValue]);

  return (
    <TextField
      value={value}
      size="small"
      sx={{
        width: "130px",
      }}
      InputProps={{
        readOnly: true,
        sx: {
          p: "1px 0",
          "& input": {
            textAlign: "center",
          },
        },
        endAdornment: (
          <InputAdornment position="end">
            <Button
              sx={{ minWidth: 40 }}
              onClick={handleInc}
              disabled={isChanging}
            >
              +
            </Button>
          </InputAdornment>
        ),
        startAdornment: (
          <InputAdornment position="start">
            <Button
              sx={{ minWidth: 40 }}
              onClick={handleDec}
              disabled={isChanging}
            >
              &ndash;
            </Button>
          </InputAdornment>
        ),
      }}
    />
  );
}
