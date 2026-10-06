import React from "react";
import { render, screen } from "@testing-library/react";
import FarmMap, { layoutBlocks } from "../FarmMap";

// Os blocos são <rect> de SVG, sem papel acessível próprio.
/* eslint-disable testing-library/no-container, testing-library/no-node-access */

test("blocos ocupam o retângulo inteiro, proporcionais ao peso", () => {
  const items = [{ weight: 60 }, { weight: 48 }, { weight: 40 }, { weight: 34 }];
  const blocks = layoutBlocks(items, 0, 0, 324, 168);
  expect(blocks).toHaveLength(4);
  const area = blocks.reduce((s, b) => s + b.w * b.h, 0);
  expect(area).toBeCloseTo(324 * 168, 3);
  const total = 182;
  blocks.forEach((b) => expect((b.w * b.h) / (324 * 168)).toBeCloseTo(b.weight / total, 3));
});

test("um item só ocupa tudo; lista vazia não desenha", () => {
  expect(layoutBlocks([{ weight: 1 }], 0, 0, 10, 5)).toEqual([{ weight: 1, x: 0, y: 0, w: 10, h: 5 }]);
  expect(layoutBlocks([], 0, 0, 10, 5)).toEqual([]);
});

test("mapa tem rótulo acessível e um bloco por talhão", () => {
  const { container } = render(
    <FarmMap
      talhoes={[
        { id: "a", nome: "Talhão 3", apelido: "Sede", hectares: 60, last: { severity: "alta" } },
        { id: "b", nome: "Talhão 9", apelido: "Rio", hectares: null, last: null },
      ]}
    />,
  );
  expect(screen.getByRole("img", { name: /Mapa esquemático/ })).toBeInTheDocument();
  expect(container.querySelectorAll("rect")).toHaveLength(2);
  expect(container.querySelector("rect").getAttribute("fill")).toBe("#8A1C12");
});
