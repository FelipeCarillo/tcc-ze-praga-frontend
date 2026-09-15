import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import Page from "../components/common/Page";
export default function NotFoundPage() {
  return (
    <Page
      eyebrow="Caminho não encontrado"
      title="Vamos voltar para a lavoura?"
      description="Esta página não existe ou o endereço mudou."
    >
      <Button component={Link} to="/" variant="contained">
        Voltar ao início
      </Button>
    </Page>
  );
}
