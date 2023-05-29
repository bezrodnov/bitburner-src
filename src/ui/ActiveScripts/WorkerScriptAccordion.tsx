/**
 * React Component for displaying a single WorkerScript's info as an
 * Accordion element
 */
import * as React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { WorkerScript } from "../../Netscript/WorkerScript";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { arrayToString } from "../../utils/helpers/ArrayHelpers";
import { dialogBoxCreate } from "../React/DialogBox";
import { LogBoxEvents } from "../React/LogBoxManager";
import { Money } from "../React/Money";
import { MoneyRate } from "../React/MoneyRate";
import { formatExp, formatThreads } from "../formatNumber";

const useStyles = makeStyles({
  noborder: {
    borderBottom: "none",
  },
});

interface IProps {
  workerScript: WorkerScript;
}

export function WorkerScriptAccordion(props: IProps): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const workerScript = props.workerScript;
  const scriptRef = workerScript.scriptRef;

  function logClickHandler(): void {
    LogBoxEvents.emit(scriptRef);
  }
  const killScript = killWorkerScriptByPid.bind(null, scriptRef.pid);

  function killScriptClickHandler(): void {
    if (killScript()) dialogBoxCreate("Killing script");
  }

  // Calculations for script stats
  const onlineMps = scriptRef.onlineMoneyMade / scriptRef.onlineRunningTime;
  const onlineEps = scriptRef.onlineExpGained / scriptRef.onlineRunningTime;

  return (
    <>
      <ListItemButton onClick={() => setOpen((old) => !old)} component={Paper}>
        <ListItemText
          primary={
            <Typography>
              └ {props.workerScript.name} {JSON.stringify(props.workerScript.args)}
            </Typography>
          }
        />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open} timeout={0} unmountOnExit>
        <Box mx={6}>
          <Table padding="none" size="small">
            <TableBody>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Threads:</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>{formatThreads(props.workerScript.scriptRef.threads)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={2}>
                  <Typography>└ Args: {arrayToString(props.workerScript.args)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Online Time:</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>{convertTimeMsToTimeElapsedString(scriptRef.onlineRunningTime * 1e3)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Offline Time:</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>{convertTimeMsToTimeElapsedString(scriptRef.offlineRunningTime * 1e3)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Total online production:</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <Money money={scriptRef.onlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>&nbsp;{formatExp(scriptRef.onlineExpGained) + " hacking exp"}</Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Online production rate:</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <MoneyRate money={onlineMps} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>&nbsp;{formatExp(onlineEps) + " hacking exp / sec"}</Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ Total offline production:</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <Money money={scriptRef.offlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>&nbsp;{formatExp(scriptRef.offlineExpGained) + " hacking exp"}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button onClick={logClickHandler}>LOG</Button>
          <IconButton onClick={killScriptClickHandler}>
            <DeleteIcon color="error" />
          </IconButton>
        </Box>
      </Collapse>
    </>
  );
}
