import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { Adjuster } from "./Adjuster";

const bigNumber = 1e27;

export function Gang(): React.ReactElement {
  function addTonsGangCycles(): void {
    if (Player.gang) {
      Player.gang.storedCycles = bigNumber;
    }
  }

  function modifyGangCycles(modify: number): (x: number) => void {
    return function (cycles: number): void {
      if (Player.gang) {
        Player.gang.storedCycles += cycles * modify;
      }
    };
  }

  function resetGangCycles(): void {
    if (Player.gang) {
      Player.gang.storedCycles = 0;
    }
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Gang</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Cycles:</Typography>
              </td>
              <td>
                <Adjuster
                  label="cycles"
                  placeholder="amt"
                  tons={addTonsGangCycles}
                  add={modifyGangCycles(1)}
                  subtract={modifyGangCycles(-1)}
                  reset={resetGangCycles}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
