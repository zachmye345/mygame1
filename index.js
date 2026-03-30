// начало создания окна приложения ( для игры )
const path = require("path");
const { app, BrowserWindow } = require("electron");

const PORT = 700;
const PUBLIC_DIR = path.join(__dirname, "public");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};
let localServer;

app.commandLine.appendSwitch("force-device-scale-factor", "1");
app
  .whenReady()
  .then(onAppReady)
  .catch((error) => {
    console.error("Не удалось запустить приложение:", error);
    app.quit();
  });

app.on("before-quit", () => {
  if (localServer) {
    localServer.close();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

async function onAppReady() {
  localServer = await createServer();

  const game = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    show: false,
    backgroundColor: "#020814",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  const loadScreen = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    show: false,
    backgroundColor: "#000000",
  });

  loadScreen.once("ready-to-show", () => {
    loadScreen.show();
  });

  game.once("ready-to-show", () => {
    game.maximize();
    game.show();
    if (!loadScreen.isDestroyed()) {
      loadScreen.close();
    }
  });

  game.on("closed", () => {
    if (!loadScreen.isDestroyed()) {
      loadScreen.close();
    }
  });
  game.webContents.on("before-input-event", (event, input) => {
    if (
      input.type === "keyDown" &&
      (input.key === "F11" || (input.key === "Enter" && input.alt))
    ) {
      event.preventDefault();
      game.setFullScreen(!game.isFullScreen());
    }
  });
  game.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `Не удалось загрузить окно игры: ${errorCode} ${errorDescription} (${validatedURL})`
      );
    }
  );

  game.webContents.setZoomFactor(1);

  await loadScreen.loadFile(path.join(__dirname, "public", "load", "load.html"));
  await game.loadURL(`http://127.0.0.1:${PORT}/game/game.html`);
}
// конец создания окна приложения ( для игры )

// 1 шаг - поднять обычный http сервер, он будет выдавать файлы игрокам

function createServer() {
  const fs = require("fs");
  const http = require("http");
  const server = http.createServer(onConnectionHttp);
  const port = PORT;

  // 2 шаг - поднять io сервер для обмена данными между игроками
  // socket.io - модуль для быстрого обмена сообщениями через сервер

  // подключение и настройка сервера на основе http сервера
  const io = require("socket.io");
  const ioServer = io(server);

  ioServer.set("transports", ["websocket"]);
  ioServer.on("connection", onConnectSocket);

  // массив игроков ( храним игроков и их координаты )
  const players = [];
  // массив сокетов игроков
  const players_sockets = [];

  // обработка http запросов ( http сервер выдает файлы )
  function onConnectionHttp(req, res) {
    const requestUrl = req.url || "/";

    if (requestUrl.startsWith("/socket.io/")) {
      return;
    }

    const pathname = decodeURIComponent(requestUrl.split("?")[0]);
    if (pathname === "/") {
      res.statusCode = 302;
      res.setHeader("Location", "/game/game.html");
      res.end();
      return;
    }

    const relativePath = pathname.replace(/^\/+/, "");
    const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));
    const isInsidePublicDir =
      filePath === PUBLIC_DIR || filePath.startsWith(`${PUBLIC_DIR}${path.sep}`);

    if (!isInsidePublicDir) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    const contentType =
      MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Не удалось отдать ${pathname}:`, err.message);
        res.statusCode = err.code === "ENOENT" ? 404 : 500;
        res.end(err.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      res.setHeader("Content-Type", contentType);
      if (req.method === "HEAD") {
        res.end();
        return;
      }

      res.end(data);
    });
  }

  // Обработка socket.io запросов ( обмен данными между игроками )
  function onConnectSocket(socket) {
    console.log("ioServer : new socket connected");
    socket.on("player_move", (x, y, num) => {
      // обновляем его координаты в его обекте ( в массиве игроков )
      players[num].x = x;
      players[num].y = y;
      // отсылаем всем его координаты и номер, чтобы его сдвинули
      socket.broadcast.emit("some_player_moved", x, y, num);
    });
    socket.on("score_update", (plus, num) => {
      players[num].score = players[num].score + plus;
      ioServer.emit("score_update", players);
    });
    socket.on("player_hit", (hitBlockf, number) => {
      for (let i = 0; i < players.length; i++) {
        if (number != i) {
          let item = players[i];

          let block_x = item.x;
          let block_y = item.y;

          let block_x2 = block_x + item.size;
          let block_y2 = block_y + item.size;
          if (
            block_x < hitBlockf.x2 &&
            block_x2 > hitBlockf.x &&
            block_y < hitBlockf.y2 &&
            block_y2 > hitBlockf.y
          ) {
            ioServer.emit(
              "some_player_disconnect",
              i,
              players[i].name,
              players[i].score
            );
            players.splice(i, 1);
            players_sockets.splice(i, 1);
            for (; i < players_sockets.length; i++) {
              players_sockets[i].num--;
            }
            console.log(players_sockets.length);
            console.log(players);
            ioServer.emit("animation_sword", socket.num);
            ioServer.emit("score_update", players);
            socket.emit("proslyshak_na_kill", "kill", socket.num);
          } else {
            ioServer.emit("animation_sword", socket.num);
          }
        } else {
          ioServer.emit("animation_sword", socket.num);
        }
      }
    });
    socket.on("number", () => {
      socket.emit("number", socket.num);
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected");
      socket.broadcast.emit(
        "some_player_disconnect",
        socket.num,
        players
        // players[socket.num].name,
        // players[socket.num].score
      );
      players.splice(socket.num, 1);
      players_sockets.splice(socket.num, 1);
      for (let i = socket.num; i < players_sockets.length; i++) {
        players_sockets[i].num--;
      }
      ioServer.emit("score_update", players);
    });
    socket.on("setChar", (size, num) => {
      players[num].size = size;
      socket.broadcast.emit("player_set_char", size, num);
    });
    socket.on("proverka", () => {
      socket.emit("porverka_na_kakaxy");
    });
    socket.on("kakaxa_disconnect", (num) => {
      socket.broadcast.emit("kakaxa_disconnect", num);
      kakaxArray.splice(num, 1);
    });
    socket.on("player_move_side", (num, side1) => {
      if (side1 === "left") {
        ioServer.emit("player_move_side", num, 270);
        players[num].side = 270;
      } else if (side1 === "right") {
        ioServer.emit("player_move_side", num, 90);
        players[num].side = 90;
      } else if (side1 === "up") {
        ioServer.emit("player_move_side", num, 0);
        players[num].side = 0;
      } else if (side1 === "down") {
        ioServer.emit("player_move_side", num, 180);
        players[num].side = 180;
      }
    });
    socket.on("spawn", (x, y, name, skin, size, count) => {
      players_sockets.push(socket);
      if (count === 1) {
        socket.emit("send_players", players);
      }
      socket.emit("spawn_kakaxArr", kakaxArray);
      players.push({
        name: name,
        skin: skin,
        x: x,
        y: y,
        size: size,
        score: 0,
        side: 90,
      });
      socket.num = players.length - 1;
      socket.emit(
        "spawn",
        socket.num,
        players[socket.num].x,
        players[socket.num].y,
        players[socket.num].skin,
        players[socket.num].size,
        players
      );
      socket.broadcast.emit(
        "new_player",
        players[socket.num].x,
        players[socket.num].y,
        players[socket.num].name,
        players[socket.num].skin,
        players[socket.num].size,
        players
      );
    });
    // socket.on("exit", () => {
    //   app.exit();
    // });
  }
  setInterval(() => {
    let x_kakaxi = Math.floor(Math.random() * 5660);
    let y_kakaxi = Math.floor(Math.random() * 3150);
    let color_kakaxi = colorArray[Math.floor(Math.random() * 14)];
    let size_kakaxi = randomInteger(25, 60);
    let kakaxa = new Kakaxa(x_kakaxi, y_kakaxi, color_kakaxi, size_kakaxi);
    kakaxArray.push(kakaxa);
    function Kakaxa(x_kakaxi, y_kakaxi, color_kakaxi, size_kakaxi) {
      this.x_kakaxi = x_kakaxi;
      this.y_kakaxi = y_kakaxi;
      this.size_kakaxi = size_kakaxi;
      this.color_kakaxi = color_kakaxi;
    }
    ioServer.emit("spawn_kakaxi", kakaxa);
  }, 500);
  setInterval(() => {
    ioServer.emit("score_update", players);
  }, 0);

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => {
      console.log(`server online on port ${port}`);
      resolve(server);
    });
  });
}

let kakaxArray = [];
let colorArray = [
  "#ff0000",
  "#ff5e00",
  "#ffab00",
  "#fff400",
  "#8eff00",
  "#0eff00",
  "#00ffef",
  "#009fff",
  "#005bff",
  "#0009ff",
  "#6f00ff",
  "#9a00ff",
  "#f400ff",
  "#ff00b9",
];
function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}
