import React, { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { IS_DEMO } from "../../config/runtime";
export default function RuntimeNotice() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <Box sx={{ flexShrink: 0 }}>
      {IS_DEMO && (
        <Box
          role="status"
          sx={{
            textAlign: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 0.7,
            px: 2,
            fontSize: ".8rem",
          }}
        >
          Demonstração local · respostas e análises simuladas
        </Box>
      )}
      {offline && (
        <Alert severity="warning">
          Você está sem conexão. Os envios não serão feitos automaticamente.
        </Alert>
      )}
    </Box>
  );
}
