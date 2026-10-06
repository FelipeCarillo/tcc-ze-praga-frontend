import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }), { virtual: true });
const mockSessions = { sessions: [], loading: false, error: false, reload: jest.fn() };
jest.mock("../../Chat/SessionsList", () => ({ useSessions: () => mockSessions }));

const { default: ConversationHistory, groupConversations, when } = require("../ConversationHistory");

const NOW = new Date(2026, 9, 6, 12, 0).getTime();

test("agrupa em Hoje, Esta semana e Antes", () => {
  const groups = groupConversations(
    [
      { id: "a", updatedAt: new Date(2026, 9, 6, 7, 42).toISOString() },
      { id: "b", updatedAt: new Date(2026, 9, 2).toISOString() },
      { id: "c", updatedAt: new Date(2026, 8, 12).toISOString() },
    ],
    NOW,
  );
  expect(groups.map((g) => g.label)).toEqual(["Hoje", "Esta semana", "Antes"]);
  expect(when(new Date(2026, 9, 6, 7, 42).toISOString(), NOW)).toBe("07:42");
});

test("cartão com foto, resposta do Zé, laudos e talhão; tocar reabre a conversa", () => {
  mockSessions.sessions = [
    { id: "s1", title: "Folhas de baixo amarelando", updatedAt: new Date().toISOString(), lastReply: "Ferrugem-asiática, risco alto.", diagnosisCount: 1, talhaoNome: "Talhão 3", imageUrl: "blob:x" },
    { id: "s2", title: "Mensagem de voz", updatedAt: new Date().toISOString(), lastReply: "A mancha-alvo..." },
  ];
  render(<ConversationHistory />);
  expect(screen.getByText("Zé: Ferrugem-asiática, risco alto.")).toBeInTheDocument();
  expect(screen.getByText("1 laudo")).toBeInTheDocument();
  expect(screen.getByText("Talhão 3")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Folhas de baixo amarelando"));
  expect(mockNavigate).toHaveBeenCalledWith("/chat", { state: { sessionId: "s1" } });
});

test("busca filtra pela resposta do Zé e mostra vazio honesto", () => {
  render(<ConversationHistory />);
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar nas conversas" }), { target: { value: "mancha" } });
  expect(screen.queryByText("Folhas de baixo amarelando")).not.toBeInTheDocument();
  expect(screen.getByText("Mensagem de voz")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar nas conversas" }), { target: { value: "zzz" } });
  expect(screen.getByText("Nenhuma conversa encontrada")).toBeInTheDocument();
});
