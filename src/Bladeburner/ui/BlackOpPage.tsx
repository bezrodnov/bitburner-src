import * as React from "react";

import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";

import { FactionNames } from "../../Faction/data/FactionNames";
import { Router } from "../../ui/GameRoot";
import { CorruptableText } from "../../ui/React/CorruptableText";
import { Bladeburner } from "../Bladeburner";
import { BlackOperationNames } from "../data/BlackOperationNames";
import { BlackOpList } from "./BlackOpList";

interface IProps {
  bladeburner: Bladeburner;
}

export function BlackOpPage(props: IProps): React.ReactElement {
  return (
    <>
      <Typography>
        Black Operations (Black Ops) are special, one-time covert operations. Each Black Op must be unlocked
        successively by completing the one before it.
        <br />
        <br />
        <b>
          Your ultimate goal to climb through the ranks of {FactionNames.Bladeburners} is to complete all of the Black
          Ops.
        </b>
        <br />
        <br />
        Like normal operations, you may use a team for Black Ops. Failing a black op will incur heavy HP and rank
        losses.
      </Typography>
      {props.bladeburner.blackops[BlackOperationNames.OperationDaedalus] ? (
        <Button sx={{ my: 1, p: 1 }} onClick={() => Router.toBitVerse(false, false)}>
          <CorruptableText content="Destroy w0rld_d34mon"></CorruptableText>
        </Button>
      ) : (
        <BlackOpList bladeburner={props.bladeburner} />
      )}
    </>
  );
}
