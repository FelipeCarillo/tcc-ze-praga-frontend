import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChatInput from "../ChatInput";

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => "blob:preview");
});

it("permite conferir a foto e conserva o rascunho após falha no envio", async () => {
  const onSend = jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const file = new File(["image"], "folha.jpg", { type: "image/jpeg" });
  render(<ChatInput onSend={onSend} pendingFile={file} />);
  expect(screen.getByRole("img", { name: /Foto selecionada/ })).toBeInTheDocument();
  expect(onSend).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("textbox", { name: "Mensagem para o Zé" }), { target: { value: "Folha da área norte" } });
  fireEvent.click(screen.getByRole("button", { name: "Analisar esta folha" }));
  await screen.findByText(/Sua foto e mensagem foram mantidas/);
  expect(screen.getByRole("textbox")).toHaveValue("Folha da área norte");
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(onSend).toHaveBeenLastCalledWith("Folha da área norte", file, "resnet50", null);
  fireEvent.click(screen.getByRole("button", { name: "Analisar esta folha" }));
  await waitFor(() => expect(screen.queryByRole("img")).not.toBeInTheDocument());
  expect(screen.getByRole("textbox")).toHaveValue("");
});

it("recusa arquivo incompatível antes de oferecer a análise", () => {
  const onSend = jest.fn();
  render(<ChatInput onSend={onSend} pendingFile={new File(["pdf"], "doc.pdf", { type: "application/pdf" })} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/JPG|PNG|WebP/);
  expect(screen.queryByRole("button", { name: "Analisar esta folha" })).not.toBeInTheDocument();
  expect(onSend).not.toHaveBeenCalled();
});
