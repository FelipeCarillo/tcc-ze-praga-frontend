import { act, renderHook, waitFor } from "@testing-library/react";
import { useActionPlan } from "../useActionPlan";
import { getActionPlan } from "../../services/actionPlanService";
jest.mock("../../services/actionPlanService", () => ({
  getActionPlan: jest.fn(),
}));
beforeEach(() => jest.clearAllMocks());
test("trocar a doença nunca exibe o plano da doença anterior", async () => {
  getActionPlan.mockResolvedValueOnce({ essencial: ["Plano A"] });
  const { result, rerender } = renderHook(({ id }) => useActionPlan(id), {
    initialProps: { id: "a" },
  });
  await waitFor(() =>
    expect(result.current.actionPlan?.essencial).toEqual(["Plano A"]),
  );
  let resolve;
  getActionPlan.mockReturnValueOnce(
    new Promise((r) => {
      resolve = r;
    }),
  );
  rerender({ id: "b" });
  expect(result.current.actionPlan).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => resolve({ essencial: ["Plano B"] }));
  expect(result.current.actionPlan.essencial).toEqual(["Plano B"]);
});
test("falha permite nova tentativa e descarta resposta obsoleta", async () => {
  getActionPlan.mockRejectedValueOnce(new Error("offline"));
  const { result } = renderHook(() => useActionPlan("a"));
  await waitFor(() => expect(result.current.error).toBeTruthy());
  getActionPlan.mockResolvedValueOnce({ essencial: ["Recuperado"] });
  act(() => result.current.retry());
  await waitFor(() =>
    expect(result.current.actionPlan?.essencial).toEqual(["Recuperado"]),
  );
  expect(result.current.error).toBeNull();
});
