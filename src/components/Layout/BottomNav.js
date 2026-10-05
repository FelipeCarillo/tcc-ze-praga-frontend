import React, { useRef } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Portal from "@mui/material/Portal";
import { Camera, History, Home, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const items = [
  { label: "Início", path: "/", Icon: Home },
  { label: "Histórico", path: "/historico", Icon: History, requiresAuth: true },
  { camera: true },
  { label: "Planos", path: "/planos", Icon: Sparkles },
  { label: "Perfil", path: "/perfil", Icon: UserRound },
];

function isActive(pathname, path) {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

const itemSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  minHeight: 56,
  fontFamily: "inherit",
  fontSize: "0.75rem",
  textDecoration: "none",
  borderRadius: 2,
};

/**
 * Navegação inferior fixa (mobile) — rebrand 2026.
 * A câmera é o item central, elevado e em verde-broto (padrão "câmera em 1
 * toque" do benchmark): abre a câmera traseira e entrega o arquivo ao /chat.
 * Sem login, leva para /login com o destino preservado.
 *
 * Renderizada num Portal: a transição de rota (App.RouteTransition) anima cada
 * página com `transform`, o que prende `position: fixed` ao container animado e
 * jogava a barra para o fim da página.
 */
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);

  const openCamera = () => {
    if (!user) {
      navigate("/login", { state: { from: "/chat" } });
      return;
    }
    if (inputRef.current) inputRef.current.click();
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    navigate("/chat", file ? { state: { pendingFile: file } } : undefined);
    e.target.value = "";
  };

  return (
    <Portal>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          pb: "env(safe-area-inset-bottom)",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          alignItems: "start",
          pt: 0.75,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleFile}
          data-testid="bottomnav-camera-input"
        />
        {items.map((item) => {
          if (item.camera) {
            return (
              <ButtonBase
                key="camera"
                onClick={openCamera}
                aria-label="Fotografar folha"
                sx={{ ...itemSx, color: "text.primary", fontWeight: 800 }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 60,
                    height: 60,
                    mt: "-26px",
                    borderRadius: "20px",
                    bgcolor: "cta.main",
                    color: "cta.contrastText",
                    border: "4px solid",
                    borderColor: "background.default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "zpPulse 2.4s 1s infinite",
                    "@keyframes zpPulse": {
                      "0%": { boxShadow: "0 0 0 0 rgba(200,241,105,.75)" },
                      "70%": { boxShadow: "0 0 0 14px rgba(200,241,105,0)" },
                      "100%": { boxShadow: "0 0 0 0 rgba(200,241,105,0)" },
                    },
                  }}
                >
                  <Camera size={26} strokeWidth={2.2} />
                </Box>
                Analisar
              </ButtonBase>
            );
          }
          if (item.requiresAuth && !user) return <Box key={item.path} />;
          const active = isActive(location.pathname, item.path);
          const { Icon } = item;
          return (
            <Box
              key={item.path}
              component={RouterLink}
              to={item.path}
              aria-current={active ? "page" : undefined}
              sx={{
                ...itemSx,
                color: active ? "primary.main" : "text.secondary",
                fontWeight: active ? 800 : 600,
              }}
            >
              <Icon
                size={24}
                strokeWidth={2}
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.15 : 0}
              />
              {item.label}
            </Box>
          );
        })}
      </Box>
    </Portal>
  );
}

export default BottomNav;
