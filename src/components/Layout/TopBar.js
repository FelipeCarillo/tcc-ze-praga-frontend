import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { Camera, Moon, Sun } from "lucide-react";
import BrandLockup from "../Brand/BrandLockup";
import AvatarMenu from "./AvatarMenu";
import { useAuth } from "../../hooks/useAuth";
import { useColorMode } from "../../hooks/useColorMode";

// Abas do canvas (d-Historico): Conversa · Histórico · Modelos · API · Planos.
const LINKS_USER = [
  { label: "Conversa", path: "/chat" },
  { label: "Histórico", path: "/historico" },
  { label: "Fazendas", path: "/fazendas" },
  { label: "Modelos", path: "/modelos" },
  { label: "API", path: "/api-docs" },
  { label: "Planos", path: "/planos" },
];
// Deslogado (d-Landing): Como funciona · Doenças · Modelos · Planos.
const LINKS_GUEST = [
  { label: "Como funciona", path: "/#como" },
  { label: "Doenças", path: "/#doencas" },
  { label: "Modelos", path: "/modelos" },
  { label: "Planos", path: "/planos" },
];

function isActive(pathname, path) {
  if (path.startsWith("/#")) return false;
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

/**
 * Barra de topo do desktop — rebrand 2026, igual ao canvas.
 * `variant="solid"`: branca, abas em pílula e "Nova análise" verde-broto.
 * `variant="overlay"`: transparente sobre a foto do hero da landing, com
 * "Entrar" em pílula palha. No mobile a barra não existe: cada tela tem o
 * próprio cabeçalho e a navegação é a BottomNav.
 */
export default function TopBar({ variant = "solid" }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const overlay = variant === "overlay";
  const links = user ? LINKS_USER : LINKS_GUEST;

  return (
    <Box
      component="header"
      sx={{
        display: { xs: "none", md: "block" },
        position: overlay ? "absolute" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: overlay ? "transparent" : "background.paper",
        borderBottom: overlay ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          maxWidth: overlay ? 1240 : 1280,
          mx: "auto",
          px: 4,
          py: overlay ? 3 : 1.75,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <BrandLockup
          size={overlay ? 36 : 32}
          tone={overlay ? "light" : "default"}
        />
        <Box
          component="nav"
          aria-label="Principal"
          sx={{
            display: "flex",
            gap: overlay ? 3.5 : 0.75,
            flexWrap: "wrap",
            flexGrow: 1,
            justifyContent: overlay ? "flex-end" : "flex-start",
          }}
        >
          {links.map((l) => {
            const active = isActive(pathname, l.path);
            const Comp = l.path.startsWith("/#") ? "a" : Link;
            const linkProps = l.path.startsWith("/#")
              ? { href: l.path }
              : { to: l.path };
            return (
              <Box
                key={l.path}
                component={Comp}
                {...linkProps}
                aria-current={active ? "page" : undefined}
                sx={
                  overlay
                    ? {
                        color: "#EEF2E8",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        py: 1.25,
                        "&:hover": { color: "#FFFFFF" },
                      }
                    : {
                        px: 1.75,
                        py: 1.25,
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontSize: "0.9375rem",
                        fontWeight: active ? 800 : 600,
                        color: active ? "text.primary" : "text.secondary",
                        bgcolor: active ? "surface.muted" : "transparent",
                        "&:hover": {
                          color: "text.primary",
                          bgcolor: "action.hover",
                        },
                      }
                }
              >
                {l.label}
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          {!overlay && (
            <Tooltip title={mode === "dark" ? "Modo claro" : "Modo noite"}>
              <IconButton
                aria-label={
                  mode === "dark" ? "Ativar modo claro" : "Ativar modo noite"
                }
                onClick={toggleColorMode}
                sx={{ color: "text.secondary" }}
              >
                {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </Tooltip>
          )}
          {overlay && !user ? (
            <Box
              component={Link}
              to="/login"
              sx={{
                bgcolor: "#F2F4EE",
                color: "#0F1A13",
                fontWeight: 700,
                fontSize: "0.9375rem",
                textDecoration: "none",
                px: 2.25,
                py: 1.25,
                borderRadius: 999,
              }}
            >
              Entrar
            </Box>
          ) : (
            <>
              <Button
                component={Link}
                to="/chat"
                startIcon={<Camera size={18} />}
                sx={{
                  bgcolor: "cta.main",
                  color: "cta.contrastText",
                  fontWeight: 800,
                  minHeight: 44,
                  px: 2.25,
                  borderRadius: "12px",
                  "&:hover": { bgcolor: "cta.hover" },
                }}
              >
                Nova análise
              </Button>
              <AvatarMenu />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
