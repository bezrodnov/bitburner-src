import React, { useEffect, useState } from "react";

import { Box, Button, ButtonGroup } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Settings } from "../../Settings/Settings";
import { Modal } from "../../ui/React/Modal";
import { SnackbarEvents, ToastVariant } from "../../ui/React/Snackbar";
import { IPredefinedTheme, getPredefinedThemes } from "../Themes";
import { StyleEditorButton } from "./StyleEditorButton";
import { ThemeEvents } from "./Theme";
import { ThemeCollaborate } from "./ThemeCollaborate";
import { ThemeEditorButton } from "./ThemeEditorButton";
import { ThemeEntry } from "./ThemeEntry";

// Everything dies when the theme gets reloaded, so we'll keep the current scroll to not jump around.
let previousScrollY = 0;

export function ThemeBrowser(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | undefined>();
  const predefinedThemes = getPredefinedThemes();
  const themes = (predefinedThemes &&
    Object.entries(predefinedThemes).map(([key, templateTheme]) => (
      <ThemeEntry
        key={key}
        theme={templateTheme}
        onActivated={() => setTheme(templateTheme)}
        onImageClick={handleZoom}
      />
    ))) || <></>;

  function setTheme(theme: IPredefinedTheme): void {
    previousScrollY = window.scrollY;
    const previousColors = { ...Settings.theme };
    Object.assign(Settings.theme, theme.colors);
    ThemeEvents.emit();
    SnackbarEvents.emit(
      <>
        Updated theme to "<strong>{theme.name}</strong>"
        <Button
          sx={{ ml: 1 }}
          color="secondary"
          size="small"
          onClick={() => {
            Object.assign(Settings.theme, previousColors);
            ThemeEvents.emit();
          }}
        >
          UNDO
        </Button>
      </>,
      ToastVariant.INFO,
      30000,
    );
  }

  function handleZoom(src: string): void {
    previousScrollY = window.scrollY;
    setModalImageSrc(src);
    setModalOpen(true);
  }

  function handleCloseZoom(): void {
    previousScrollY = window.scrollY;
    setModalOpen(false);
  }

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, previousScrollY));
  });

  return (
    <Box sx={{ mx: 2 }}>
      <Typography variant="h4">Theme Browser</Typography>
      <Paper sx={{ px: 2, py: 1, my: 1 }}>
        <ThemeCollaborate />
        <ButtonGroup sx={{ mb: 2, display: "block" }}>
          <ThemeEditorButton />
          <StyleEditorButton />
        </ButtonGroup>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>{themes}</Box>
        <Modal open={modalOpen} onClose={handleCloseZoom}>
          <img src={modalImageSrc} style={{ width: "100%" }} />
        </Modal>
      </Paper>
    </Box>
  );
}
