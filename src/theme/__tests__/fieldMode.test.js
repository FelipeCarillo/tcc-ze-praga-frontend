import { createAppTheme } from "../theme";

const htmlFont = (theme) => theme.components.MuiCssBaseline.styleOverrides.html.fontSize;

test("modo campo aumenta a letra e o contraste", () => {
  const normal = createAppTheme("light");
  const campo = createAppTheme("light", { field: true });
  expect(htmlFont(normal)).toBeUndefined();
  expect(htmlFont(campo)).toBe("112.5%");
  expect(campo.palette.text.secondary).not.toBe(normal.palette.text.secondary);
  expect(campo.palette.divider).not.toBe(normal.palette.divider);
});
