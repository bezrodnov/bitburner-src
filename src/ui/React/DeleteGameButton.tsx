import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import Button from "@mui/material/Button";

import { pushDisableRestore } from "../../Electron";
import { deleteGame } from "../../db";
import { ConfirmationModal } from "./ConfirmationModal";

interface IProps {
  color?: "primary" | "warning" | "error";
}

export function DeleteGameButton({ color = "primary" }: IProps): React.ReactElement {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <Tooltip title="This will permanently delete your local save game. Did you export it before?">
        <Button startIcon={<DeleteIcon />} color={color} onClick={() => setModalOpened(true)}>
          Delete Save
        </Button>
      </Tooltip>
      <ConfirmationModal
        onConfirm={() => {
          setModalOpened(false);
          deleteGame()
            .then(() => {
              pushDisableRestore();
              setTimeout(() => location.reload(), 1000);
            })
            .catch((r) => console.error(`Could not delete game: ${r}`));
        }}
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        confirmationText={"Really delete your game? (It's permanent!)"}
      />
    </>
  );
}
