import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChatInput from "../ChatInput";

// O seletor de arquivo é um <input type="file"> escondido, sem papel acessível.
/* eslint-disable testing-library/no-container, testing-library/no-node-access */

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});

const box = () => screen.getByRole("textbox", { name: "Mensagem para o Zé" });

it("conserva o rascunho quando o envio falha", async () => {
  const onSend = jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<ChatInput onSend={onSend} />);
  fireEvent.change(box(), { target: { value: "o que é ferrugem?" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  await screen.findByText(/Sua mensagem foi mantida/);
  expect(box()).toHaveValue("o que é ferrugem?");
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  await waitFor(() => expect(box()).toHaveValue(""));
  expect(onSend).toHaveBeenLastCalledWith("o que é ferrugem?", null, "resnet50", null);
});

it("a foto da galeria vai para a conferência, não fica presa no campo", () => {
  const onPickFile = jest.fn();
  const { container } = render(<ChatInput onSend={jest.fn()} onPickFile={onPickFile} />);
  const file = new File(["image"], "folha.jpg", { type: "image/jpeg" });
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
  expect(onPickFile).toHaveBeenCalledWith(file);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

it("recusa arquivo incompatível", () => {
  const onPickFile = jest.fn();
  const { container } = render(<ChatInput onSend={jest.fn()} onPickFile={onPickFile} />);
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(["pdf"], "doc.pdf", { type: "application/pdf" })] } });
  expect(screen.getByRole("alert")).toHaveTextContent(/JPG|PNG|WebP/);
  expect(onPickFile).not.toHaveBeenCalled();
});

it("analisando: campo vazio e desabilitado, microfone vira Parar", () => {
  const onStop = jest.fn();
  render(<ChatInput onSend={jest.fn()} busy onStop={onStop} />);
  expect(box()).toBeDisabled();
  expect(box()).toHaveAttribute("placeholder", "O Zé está analisando…");
  expect(screen.queryByRole("button", { name: "Gravar mensagem de voz" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Parar análise" }));
  expect(onStop).toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Fotografar folha" })).toBeDisabled();
});
