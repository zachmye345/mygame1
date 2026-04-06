// начало создания окна приложения ( для игры )
const { app, BrowserWindow, ipcMain } = require("electron");
app.commandLine.appendSwitch("force-device-scale-factor", "1");
app.on("ready", onAppReady);

function onAppReady() {
  createServer();

  const game = new BrowserWindow({
    autoHideMenuBar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  game.webContents.setZoomFactor(1);
  game.setFullScreen(true);
  game.loadFile("public/game/game.html");
  const loadScreen = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  loadScreen.loadFile("public/game/game.html");
  loadScreen.once("ready-to-show", () => {
    setTimeout(() => {
      game.show();
      loadScreen.close();
    }, 0);
  });
}
// конец создания окна приложения ( для игры )

// 1 шаг - поднять обычный http сервер, он будет выдавать файлы игрокам

function createServer() {
  const fs = require("fs");
  const http = require("http");
  const server = http.createServer(onConnectionHttp);
  const port = 700;

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
    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      fs.readFile("public/game/game.html", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/menu.js") {
      res.setHeader("Content-Type", "text/js");
      fs.readFile("public/game/menu.js", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/game.js") {
      res.setHeader("Content-Type", "text/js");
      fs.readFile("public/game/game.js", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/menu.css") {
      res.setHeader("Content-Type", "text/css");
      fs.readFile("public/game/menu.css", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/game.css") {
      res.setHeader("Content-Type", "text/css");
      fs.readFile("public/game/game.css", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword6.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword6.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword5.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword5.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword4.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword4.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword3.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword3.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword1.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword1.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword2.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword2.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/sword0.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/sword0.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character1.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character1.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character2.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character2.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/coin.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/coin.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/logo.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/logo.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character3.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character3.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character4.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character4.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character0.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character0.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character5.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character5.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/character6.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/character6.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/stam.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/stam.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/Exp.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/Exp.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/video/fonVideo.mp4") {
      res.setHeader("Content-Type", "video/mp4");
      fs.readFile("public/video/fonVideo.mp4", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/fonVideo.jpg") {
      res.setHeader("Content-Type", "image/jpg");
      fs.readFile("public/images/fonVideo.jpg", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    } else if (req.url === "/images/backGround.png") {
      res.setHeader("Content-Type", "image/png");
      fs.readFile("public/images/backGround.png", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.end(data);
        }
      });
    }
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
  server.listen(port, () => {
    console.log("server online");
  });
  setInterval(() => {
    ioServer.emit("score_update", players);
  }, 0);
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
