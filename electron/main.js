/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const greenworks = require("./greenworks");

if (greenworks.init()) {
  console.log("Steam API has been initialized.");
} else {
  console.log("Steam API has failed to initialize.");
}

const debug = false;

let win = null;

require("http")
  .createServer(async function (req, res) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      win.webContents.executeJavaScript(`document.saveFile("${data.filename}", "${data.code}")`).then((result) => {
        res.write(result);
        res.end();
      });
    });
  })
  .listen(9990);

function createWindow(killall) {
  win = new BrowserWindow({
    show: false,
    backgroundThrottling: false,
    backgroundColor: "#000000",
  });

  win.removeMenu();
  win.maximize();
  noScripts = killall ? { query: { noScripts: killall } } : {};
  win.loadFile("index.html", noScripts);
  win.show();
  if (debug) win.webContents.openDevTools();

  win.webContents.on("new-window", function (e, url) {
    // make sure local urls stay in electron perimeter
    if (url.substr(0, "file://".length) === "file://") {
      return;
    }

    // and open every other protocols on the browser
    e.preventDefault();
    shell.openExternal(url);
  });
  win.webContents.backgroundThrottling = false;

  // This is backward but the game fills in an array called `document.achievements` and we retrieve it from
  // here. Hey if it works it works.
  const achievements = greenworks.getAchievementNames();
  const intervalID = setInterval(async () => {
    const achs = await win.webContents.executeJavaScript("document.achievements");
    for (const ach of achs) {
      if (!achievements.includes(ach)) continue;
      greenworks.activateAchievement(ach, () => undefined);
    }
  }, 1000);
  win.achievementsIntervalID = intervalID;

  const reloadAndKill = (killScripts = true) => {
    setStopProcessHandler(app, win, false);
    if (intervalID) clearInterval(intervalID);
    win.webContents.forcefullyCrashRenderer();
    win.close();
    createWindow(killScripts);
  };
  const promptForReload = () => {
    win.off('unresponsive', promptForReload);
    dialog.showMessageBox({
      type: 'error',
      title: 'Bitburner > Application Unresponsive',
      message: 'The application is unresponsive, possibly due to an infinite loop in your scripts.',
      detail:' Did you forget a ns.sleep(x)?\n\n' +
        'The application will be restarted for you, do you want to kill all running scripts?',
      buttons: ['Restart', 'Cancel'],
      defaultId: 0,
      checkboxLabel: 'Kill all running scripts',
      checkboxChecked: true,
      noLink: true,
    }).then(({response, checkboxChecked}) => {
      if (response === 0) {
        reloadAndKill(checkboxChecked);
      } else {
        win.on('unresponsive', promptForReload)
      }
    });
  }
  win.on('unresponsive', promptForReload);

  // Create the Application's main menu
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        ],
      },
      {
        label: "reloads",
        submenu: [
          {
            label: "reload",
            accelerator: "f5",
            click: () => {
              win.loadFile("index.html");
            },
          },
          {
            label: "reload & kill all scripts",
            click: reloadAndKill
          },
        ],
      },
      {
        label: "fullscreen",
        submenu: [
          {
            label: "toggle",
            accelerator: "f9",
            click: (() => {
              let full = false;
              return () => {
                full = !full;
                win.setFullScreen(full);
              };
            })(),
          },
        ],
      },
      {
        label: "debug",
        submenu: [
          {
            label: "activate",
            click: () => win.webContents.openDevTools(),
          },
        ],
      },
    ]),
  );

  return win;
}

function setStopProcessHandler(app, window, enabled) {
  const clearWindowHandler = () => {
    if (window.achievementsIntervalID) {
      clearInterval(window.achievementsIntervalID);
    }
    window = null;
  };

  const stopProcessHandler = () => {
    if (process.platform !== "darwin") {
      app.quit();
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    }
  };

  if (enabled) {
    window.on("closed", clearWindowHandler);
    app.on("window-all-closed", stopProcessHandler);
  } else {
    window.removeListener("closed", clearWindowHandler);
    app.removeListener("window-all-closed", stopProcessHandler);
  }
}

app.whenReady().then(() => {
  const win = createWindow(process.argv.includes("--no-scripts"));
  setStopProcessHandler(app, win, true);
});
