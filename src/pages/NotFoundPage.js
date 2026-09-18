import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import Page from "../components/common/Page";
export default function NotFoundPage() {
  return (
    <Page
      eyebrow="Caminho não encontrado"
      title="Este caminho não está no caderno."
      description="A página não existe ou o endereço mudou. Volte ao início para começar uma observação."
    >
      <Button component={Link} to="/" variant="contained">
        Voltar ao início
      </Button>
    </Page>
  );
}
