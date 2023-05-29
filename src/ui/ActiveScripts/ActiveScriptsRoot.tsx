/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { WorkerScript } from "../../Netscript/WorkerScript";
import { useRerender } from "../React/hooks";
import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";

interface IProps {
  workerScripts: Map<number, WorkerScript>;
}

export function ActiveScriptsRoot(props: IProps): React.ReactElement {
  const [tab, setTab] = useState<"active" | "recent">("active");
  useRerender(400);

  function handleChange(event: React.SyntheticEvent, tab: "active" | "recent"): void {
    setTab(tab);
  }
  return (
    <>
      <Tabs variant="fullWidth" value={tab} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "25%" }}>
        <Tab label={"Active"} value={"active"} />
        <Tab label={"Recently Killed"} value={"recent"} />
      </Tabs>

      {tab === "active" && <ActiveScriptsPage workerScripts={props.workerScripts} />}
      {tab === "recent" && <RecentScriptsPage />}
    </>
  );
}
