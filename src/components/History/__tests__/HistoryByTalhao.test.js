import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => mockNavigate,
    Link: require("react").forwardRef(({ to, children, ...rest }, ref) => (
      <a href={to} ref={ref} {...rest}>
        {children}
      </a>
    )),
  }),
  { virtual: true },
);
const mockSetActive = jest.fn();
jest.mock("../../../services/activeTalhao", () => ({
  setActiveTalhao: (...args) => mockSetActive(...args),
}));

const HistoryByTalhao = require("../HistoryByTalhao").default;

const laudo = (id, disease, severity) => ({
  id,
  disease,
  severity,
  confidence: 0.9,
  timestamp: "2026-10-05T10:00:00Z",
});

const groups = [
  {
    talhaoId: "t-1",
    talhaoNome: "Sede",
    total: 5,
    severityTrend: ["nenhuma", "media", "alta"],
    recent: [
      laudo("d3", "Ferrugem", "alta"),
      laudo("d2", "Míldio", "media"),
      laudo("d1", "Saudável", "nenhuma"),
    ],
  },
  {
    talhaoId: "t-2",
    talhaoNome: "Baixada",
    total: 0,
    severityTrend: [],
    recent: [],
  },
  {
    talhaoId: null,
    talhaoNome: null,
    total: 1,
    severityTrend: ["baixa"],
    recent: [laudo("d9", "Cercosporiose", "baixa")],
  },
];

beforeEach(() => jest.clearAllMocks());

test("um cartão por talhão, com tendência de risco e laudos recentes", () => {
  render(<HistoryByTalhao groups={groups} onShowAll={jest.fn()} />);
  expect(screen.getByRole("region", { name: "Sede" })).toHaveTextContent(
    "5 laudos · risco subindo",
  );
  expect(screen.getByRole("region", { name: "Baixada" })).toHaveTextContent(
    "Nenhum laudo ainda",
  );
  expect(
    screen.getByRole("region", { name: "Sem talhão" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Ferrugem/ })).toHaveAttribute(
    "href",
    "/historico/d3",
  );
  expect(screen.getAllByText("Risco alto")).toHaveLength(1);
});

test("ver todos abre a lista filtrada pelo grupo", () => {
  const onShowAll = jest.fn();
  render(<HistoryByTalhao groups={groups} onShowAll={onShowAll} />);
  fireEvent.click(screen.getByRole("button", { name: "Ver os 5 laudos" }));
  expect(onShowAll).toHaveBeenCalledWith(groups[0]);
});

test("analisar neste talhão já deixa o talhão ativo para a foto", () => {
  render(<HistoryByTalhao groups={groups} onShowAll={jest.fn()} />);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Analisar neste talhão" })[1],
  );
  expect(mockSetActive).toHaveBeenCalledWith({ id: "t-2", nome: "Baixada" });
  expect(mockNavigate).toHaveBeenCalledWith("/chat");
});
