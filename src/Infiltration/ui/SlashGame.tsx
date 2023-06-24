import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/helpers/keyCodes";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";

interface Difficulty {
  [key: string]: number;
  window: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Impossible: Difficulty;
} = {
  Trivial: { window: 600 },
  Normal: { window: 325 },
  Hard: { window: 250 },
  Impossible: { window: 150 },
};

export function SlashGame({ difficulty: _difficulty, onSuccess, onFailure }: IMinigameProps): React.ReactElement {
  const difficulty: Difficulty = { window: 0 };
  interpolate(difficulties, _difficulty, difficulty);

  const [phase, setPhase] = useState(0);

  function press(this: Document, event: KeyboardEvent): void {
    event.preventDefault();
    if (event.key !== KEY.SPACE) return;
    if (phase !== 1) {
      onFailure();
    } else {
      onSuccess();
    }
  }

  const guardingTimeRef = useRef(Math.random() * 3250 + 1500 - (250 + difficulty.window));

  useEffect(() => {
    const preparingTime = difficulty.window;
    const attackingTime = 250;

    let id = window.setTimeout(() => {
      setPhase(1);
      id = window.setTimeout(() => {
        setPhase(2);
        id = window.setTimeout(() => onFailure(), attackingTime);
      }, preparingTime);
    }, guardingTimeRef.current);

    return () => {
      clearInterval(id);
    };
  }, [difficulty.window, onFailure]);

  const hasAugment = Player.hasAugmentation(AugmentationName.MightOfAres, true);
  return (
    <>
      <GameTimer millis={5000} onExpire={onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">Attack when his guard is down!</Typography>

        {hasAugment ? (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">Guard will drop in...</Typography>
            <GameTimer millis={guardingTimeRef.current} onExpire={() => null} ignoreAugment_WKSharmonizer noPaper />
          </Box>
        ) : (
          <></>
        )}

        {phase === 0 && <Typography variant="h4">Guarding ...</Typography>}
        {phase === 1 && <Typography variant="h4">Preparing?</Typography>}
        {phase === 2 && <Typography variant="h4">ATTACKING!</Typography>}
        <KeyHandler onKeyDown={press} onFailure={onFailure} />
      </Paper>
    </>
  );
}
