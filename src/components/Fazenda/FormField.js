import React from "react";
import { Box, InputBase } from "@mui/material";

/** Campo com rótulo em cima — o mesmo desenho do m-Login, para os cadastros. */
export default function FormField({ label, name, hint, inputProps, sx, ...rest }) {
  const id = "campo-" + name;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0, ...sx }}>
      <Box component="label" htmlFor={id} sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
        {label}
        {hint && (
          <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
            {" "}· {hint}
          </Box>
        )}
      </Box>
      <InputBase
        id={id}
        name={name}
        inputProps={inputProps}
        {...rest}
        sx={{
          height: 48,
          px: 1.5,
          border: "1.5px solid",
          borderColor: (t) => (t.palette.mode === "dark" ? "#3A5243" : "#B9C4B3"),
          borderRadius: "12px",
          bgcolor: "background.paper",
          fontSize: "1rem",
          "&.Mui-focused": { borderColor: "primary.main", outline: "3px solid #C8F169", outlineOffset: "1px" },
        }}
      />
    </Box>
  );
}
