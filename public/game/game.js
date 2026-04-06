////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// socket //
// настройка соединения с сервером
    
const socket_config = {
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
};
// ip нужно указать своего компьютера !!
const adress = "localhost";
const port = 700;
// создания сокета ( объекта подключения к серверу и обмена с ним сообщениями )
const socket = io(`http://${adress}:${port}`, socket_config);

// происходит автоматически по подключению к серверу
socket.on("connect", () => {
  socket.on("kakaxa_disconnect", (num) => {
    kakaxiPole.children[num].remove();
    kakaxArray.splice(num, 1);
  });
  socket.on("animation_sword", (num) => {
    player_field.children[
      num
    ].children[0].style.animation = `hit .5s linear forwards`;
    setTimeout(() => {
      player_field.children[num].children[0].style.animation = ``;
    }, 501);
  });
  socket.on("porverka_na_kakaxy", () => {
    for (let i = 0; i < kakaxArray.length; i++) {
      let item = kakaxArray[i];
      let player = playerElem.getBoundingClientRect();
      let x = player_x;
      let y = player_y;

      let player_x2 = x + player.width;
      let player_y2 = y + player.width;

      let item_x = item.x_kakaxi;
      let item_y = item.y_kakaxi;

      let item_x2 = item_x + item.size_kakaxi;
      let item_y2 = item_y + item.size_kakaxi;
      if (x <= item_x && y <= item_y2) {
        if (player_x2 >= item_x2 && player_y2 >= item_y2) {
          plusExp("rock");
          kakaxiPole.children[i].remove();
          kakaxArray.splice(i, 1);
          socket.emit("score_update", 5, my_num);
          socket.emit("kakaxa_disconnect", i);
        }
      }
    }
  });
  socket.on("score_update", (players) => {
    clearList();
    list(players);
  });

  socket.on("spawn_kakaxArr", (kakas) => {
    for (let kakaxa in kakas) {
      let item = kakas[kakaxa];
      kakaxArray.push(item);
      const div = document.createElement("div");
      div.classList.add("kakaxa");
      div.style.top = item.y_kakaxi + "px";
      div.style.left = item.x_kakaxi + "px";
      div.style.height = item.size_kakaxi + "px";
      div.style.width = item.size_kakaxi + "px";
      div.style.backgroundColor = `${item.color_kakaxi}`;
      div.style.boxShadow = `0px 0px 20px 3px ${item.color_kakaxi}`;
      kakaxiPole.append(div);
    }
    socket.on("spawn_kakaxi", (kakaxa) => {
      kakaxArray.push(kakaxa);
      const div = document.createElement("div");
      div.classList.add("kakaxa");
      div.style.top = kakaxa.y_kakaxi + "px";
      div.style.left = kakaxa.x_kakaxi + "px";
      div.style.height = kakaxa.size_kakaxi + "px";
      div.style.width = kakaxa.size_kakaxi + "px";
      div.style.backgroundColor = `${kakaxa.color_kakaxi}`;
      div.style.boxShadow = `0px 0px 20px 3px ${kakaxa.color_kakaxi}`;
      kakaxiPole.append(div);
    });
  });
  socket.on("number", (num) => {
    my_num = num;
  });
  socket.on("proslyshak_na_kill", (e, a) => {
    let moneyVas = localStorage.getItem("plusMoney");
    moneyVas = Number(moneyVas) + 50;
    let killVas = localStorage.getItem("plusKills");
    killVas++;
    let money = localStorage.getItem("money");
    money = Number(money) + 50;
    let kill = localStorage.getItem("kill");
    kill++;
    localStorage.setItem("money", money);
    localStorage.setItem("kill", kill);

    localStorage.setItem("plusMoney", moneyVas);
    localStorage.setItem("plusKills", killVas);
    socket.emit("score_update", 100, a);
    plusExp(e);
    money_ui.textContent = "";
    money_ui.textContent = money;
  });
  socket.on("some_player_disconnect", (num, players) => {
    if (my_num === num && start2 != 0) {
      start3 = 0;
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keyup", onKeyup);

      cancelAnimationFrame(movingID);
      cancelAnimationFrame(movingID2);
      cancelAnimationFrame(movingID3);
      cancelAnimationFrame(movingID4);

      movingRight = false;
      movingLeft = false;
      movingUp = false;
      movingBottom = false;
      beforeMenu.style.display = "flex";
      ui.style.display = "none";
      map.style.filter = "blur(55px)";
      let a = JSON.parse(localStorage.getItem("money"));
      let b = JSON.parse(localStorage.getItem("kill"));
      let d = JSON.parse(localStorage.getItem("death"));
      let z = JSON.parse(localStorage.getItem("plusMoney"));
      let c = JSON.parse(localStorage.getItem("plusKills"));
      moneyBefore.textContent = a;
      killBefore.textContent = b;
      deathBefore.textContent = d;
      console.log(z);
      console.log(c);
      if (c == null) {
        plusMoney.textContent = `+0`;
        plusKills.textContent = `+0`;
      } else {
        plusMoney.textContent = `+${z}`;
        plusKills.textContent = `+${c}`;
      }
      let death = localStorage.getItem("death");
      death++;
      localStorage.setItem("death", death);
    } else {
      socket.emit("number");
    }
    if (start2 != 0) {
      player_field.children[num].remove();
      for (let i = 1; i < score_list.children.length; i++) {
        if (
          score_list.children[i].textContent ===
          `${players[num].name}: ${players[num].score}`
        ) {
          score_list.children[i].remove();
        }
      }
    }
  });
  socket.on("spawn", (num, x, y, skin, size, players) => {
    my_num = num;
    playerElem = firstCreatePlayer(x, y, skin, size);
    // clearList();
    // setTimeout(() => {
    //   list(players);
    // }, 10);
  });
  socket.on("send_players", (players) => {
    createPlayers(players);
  });

  socket.on("new_player", (x, y, name, skin, size, players) => {
    createPlayer(x, y, skin, size);
    // clearList();
    // setTimeout(() => {
    //   list(players);
    // }, 10);
  });

  socket.on("player_move_side", (num, deg) => {
    if (start3 === 1) {
      player_field.children[num].style.transform = `rotate(${deg}deg)`;
    }
  });
  socket.on("player_set_char", (size, num) => {
    if (start3 === 1) {
      player_field.children[num].style.width = `${size}px`;
      player_field.children[num].style.height = `${size}px`;
    }
  });
  socket.on("some_player_moved", (x, y, num) => {
    if (start3 === 1) {
      // ставим его элементу ( по номеру ) его координаты
      player_field.children[num].style.top = y + "px";
      player_field.children[num].style.left = x + "px";
    }
  });
});

socket.connect();
let plusMoney = document.getElementById("plusMoney");
let plusKills = document.getElementById("plusKills");
let start3 = 0;
let playerStartCount = 0;
document.removeEventListener("mousedown", mouseDown);
document.removeEventListener("mouseup", mouseUp);
document.removeEventListener("keydown", onKeydown);
document.removeEventListener("keyup", onKeyup);
let kakaxArray = [];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Меню //
document.addEventListener("contextmenu", (event) => event.preventDefault());
let exit = document.querySelector(".exit-menu");
let my_num = null;
let playerElem = null;
let player_x = 0;
let player_y = 0;
let world = document.querySelector(".map");
exit.addEventListener("click", () => {
  window.location.href = "https://www.google.com.ua/";
  // window.close();
  // socket.emit("exit");
});
let asd = 0;
setInterval(() => {
  asd = 0;
}, 10);
let start = document.querySelector(".button-menu"),
  menu = document.querySelector(".main-block"),
  input = document.querySelector(".input-menu"),
  ui = document.querySelector(".ui"),
  map = document.querySelector(".map"),
  html = document.querySelector("html"),
  body = document.querySelector("body"),
  gif = document.querySelector(".gif"),
  score_list = document.querySelector(".score_list"),
  kakaxiPole = document.querySelector(".kakaxi"),
  menu_block = document.querySelector(".menu-block");

start.addEventListener("click", () => {
  let ae = document.querySelector(".error");
  if (input.value === "") {
    if (!ae) {
      const div = document.createElement("div");
      div.classList.add("error");
      div.textContent = "Вы ничего не вписали!";
      input.after(div);
    }
  } else {
    localStorage.setItem("plusKills", 0);
    localStorage.setItem("plusMoney", 0);
    lvl = 1;
    lvlprocent = 0;
    lvlprocent2 = 0;
    countForLvl = 0;
    rangeIncrease = 1;
    start3 = 1;
    lvlprocent = 0;
    lvl = 1;
    level.textContent = lvl;
    playerStartCount++;
    start2++;
    video_bg.style.display = "none";
    menu.style.display = "none";
    ui.style.display = "block";
    map.style.display = "block";
    gif.style.display = "block";
    html.style.width = "10000px";
    html.style.height = "10000px";
    body.style.width = "10000px";
    body.style.height = "10000px";
    let skin = localStorage.getItem("skin");
    money_ui.textContent = localStorage.getItem("money");
    let x = randomInteger(550, 5060);
    let y = randomInteger(550, 2500);
    socket.emit("spawn", x, y, input.value, skin, 150, playerStartCount);
    setTimeout(() => {
      document.addEventListener("mousedown", mouseDown);
      document.addEventListener("mouseup", mouseUp);
      document.addEventListener("keydown", onKeydown);
      document.addEventListener("keyup", onKeyup);
    }, 100);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Генерация персонажа //
function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function list(players) {
  let list = players
    .sort(function (a, b) {
      if (a.score > b.score) {
        return 1;
      }
      if (a.score < b.score) {
        return -1;
      }
      if (a.score == b.score) {
        return 0;
      }
    })
    .reverse();
  fillNames(list);
}

function fillNames(players) {
  for (let i = 0; i < players.length; i++) {
    createNameLine(players[i].name, players[i].score);
  }
}
function clearList() {
  score_list.innerHTML = "";
}
function createNameLine(name, score2) {
  const nameLine = document.createElement("div");
  nameLine.classList.add("score_player");
  nameLine.textContent = `${name}: `;
  score_list.append(nameLine);
  const score = document.createElement("span");
  score.textContent = score2;
  nameLine.append(score);
}
function firstCreatePlayer(x, y, skin, size) {
  const div = document.createElement("div");
  div.classList.add("player");
  div.style.height = size + "px";
  div.style.width = size + "px";
  div.style.top = y + "px";
  div.style.left = x + "px";
  player_field.append(div);
  player_x = x;
  player_y = y;
  window.scrollTo(x + 1060 + 150, y + 2950);
  const sword = document.createElement("div");
  sword.classList.add("sword");
  sword.style.top = -100 + "%";
  sword.style.left = 65 + "%";
  div.append(sword);
  const img = document.createElement("img");
  img.classList.add("player_img");
  img.src = `../images/character${skin}.png`;
  div.append(img);
  const img2 = document.createElement("img");
  img2.classList.add("sword_img");
  img2.src = `../images/sword${skin}.png`;
  sword.append(img2);
  return div;
}


function createPlayer(x, y, skin, size, side) {
  const div = document.createElement("div");
  div.classList.add("player");
  div.style.top = y + "px";
  div.style.left = x + "px";
  div.style.height = size + "px";
  div.style.width = size + "px";
  div.style.transform = `rotate(${side}deg)`;
  player_field.append(div);
  const sword = document.createElement("div");
  sword.classList.add("sword");
  sword.style.top = -100 + "%";
  sword.style.left = 65 + "%";
  div.append(sword);
  const img = document.createElement("img");
  img.classList.add("player_img");
  img.src = `../images/character${skin}.png`;
  div.append(img);
  const img2 = document.createElement("img");
  img2.classList.add("sword_img");
  img2.src = `../images/sword${skin}.png`;
  sword.append(img2);
  return div;
}

function createPlayers(players) {
  for (let i = 0; i < players.length; i++) {
    createPlayer(
      players[i].x,
      players[i].y,
      players[i].skin,
      players[i].size,
      players[i].side
    );
  }
}

// Движение персонажа //
let start2 = 0;

let staminaPocent = 100;
let mosey = false;
let mouseID = null;
let regenID = null;
let regenID2 = null;
let mosey2 = false;
let count_stamina = 0;
setInterval(() => {
  if (staminaPocent < 100 && mosey === false && count_stamina === 0) {
    count_stamina++;
    regen();
  }
}, 2000);

function regen() {
  staminaPocent = staminaPocent + 0.5;
  zapol2.style.width = `${staminaPocent}%`;
  regenID = requestAnimationFrame(regen);
  if (staminaPocent === 100 || mosey === true) {
    count_stamina = 0;
    cancelAnimationFrame(regenID);
  }
}

function mouseUp(e) {
  let b = e.button;
  if (b === 2 && mosey === true) {
    step = step - 5;
    mosey = false;
    cancelAnimationFrame(mouseID);
  }
}

function mouseDown(e) {
  let b = e.button;
  if (b === 2 && mosey === false && staminaPocent > 0) {
    mosey = true;
    step = step + 5;
    stamina();
  }
  if (b === 0 && mosey2 === false && start2 != 0) {
    mosey2 = true;
    hit();
  }
}

function hit() {
  cancelAnimationFrame(movingID);
  cancelAnimationFrame(movingID2);
  cancelAnimationFrame(movingID3);
  cancelAnimationFrame(movingID4);

  movingRight = false;
  movingLeft = false;
  movingUp = false;
  movingBottom = false;

  document.removeEventListener("mousedown", mouseDown);
  document.removeEventListener("mouseup", mouseUp);
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("keyup", onKeyup);
  let playerElemBound = playerElem.getBoundingClientRect();
  // animationSword.style.animation = `hit 1.0s linear forwards`;
  // ! let div = null;
  switch (side) {
    case "up":
      hitBlockf = {
        x: `${player_x - 50 * rangeIncrease}`,
        y: `${player_y - 160 * rangeIncrease}`,
        x2: `${player_x + playerElemBound.width + 100 * rangeIncrease}`,
        y2: `${player_y + playerElemBound.width + 150 * rangeIncrease}`,
      };
      // ? div = document.createElement("div");
      // ? div.style.position = "absolute";
      // ? div.style.top = hitBlockf.y + "px";
      // ? div.style.left = hitBlockf.x + "px";
      // ? div.style.height =
      // ? `${playerElemBound.width + 150 * rangeIncrease}` + "px";
      // ? div.style.width = `${playerElemBound.width + 100 * rangeIncrease}` + "px";
      // ? div.style.backgroundColor = "red";
      // ? div.style.opacity = "0.2";
      // ? hitBlocks.append(div);
      socket.emit("player_hit", hitBlockf, my_num, side);
      break;
    case "down":
      hitBlockf = {
        x: `${player_x - 50 * rangeIncrease}`,
        y: `${player_y + 10 * rangeIncrease}`,
        x2: `${player_x + playerElemBound.width + 100 * rangeIncrease}`,
        y2: `${player_y + playerElemBound.width + 150 * rangeIncrease}`,
      };
      socket.emit("player_hit", hitBlockf, my_num, side);
      break;
    case "left":
      hitBlockf = {
        x: `${player_x - 160 * rangeIncrease}`,
        y: `${player_y - 50 * rangeIncrease}`,
        x2: `${player_x + playerElemBound.width + 150 * rangeIncrease}`,
        y2: `${player_y + playerElemBound.width + 100 * rangeIncrease}`,
      };
      socket.emit("player_hit", hitBlockf, my_num, side);
      break;
    case "right":
      hitBlockf = {
        x: `${player_x + 10 * rangeIncrease}`,
        y: `${player_y - 50 * rangeIncrease}`,
        x2: `${player_x + playerElemBound.width + 100 * rangeIncrease}`,
        y2: `${player_y + playerElemBound.width + 150 * rangeIncrease}`,
      };
      socket.emit("player_hit", hitBlockf, my_num, side);
      break;
  }
  setTimeout(() => {
    mosey2 = false;
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
  }, 501);
}

function stamina() {
  mouseID = requestAnimationFrame(stamina);
  staminaPocent--;
  zapol2.style.width = `${staminaPocent}%`;
  if (staminaPocent <= 0) {
    step = 10;
    mosey = false;
    cancelAnimationFrame(mouseID);
  }
}

let step = 10;
let step2 = 10;

let movingID = null,
  movingID2 = null,
  movingID3 = null,
  movingID4 = null;

let movingRight = false,
  movingLeft = false,
  movingUp = false,
  movingBottom = false;

function onKeydown(e) {
  if (
    (e.key === "d" || e.key === "D" || e.key === "в" || e.key === "В") &&
    movingRight === false
  ) {
    movingRight = true;
    moveRight();
  }
  if (
    (e.key === "ф" || e.key === "Ф" || e.key === "a" || e.key === "A") &&
    movingLeft === false
  ) {
    movingLeft = true;
    moveLeft();
  }
  if (
    (e.key === "Ы" || e.key === "ы" || e.key === "S" || e.key === "s") &&
    movingBottom === false
  ) {
    movingBottom = true;
    moveBottom();
  }
  if (
    (e.key === "ц" || e.key === "Ц" || e.key === "W" || e.key === "w") &&
    movingUp === false
  ) {
    movingUp = true;
    moveUp();
  }
}

function onKeyup(e) {
  if (
    (e.key === "d" || e.key === "D" || e.key === "в" || e.key === "В") &&
    movingRight === true
  ) {
    movingRight = false;
    cancelAnimationFrame(movingID);
  }
  if (
    (e.key === "ф" || e.key === "Ф" || e.key === "a" || e.key === "A") &&
    movingLeft === true
  ) {
    movingLeft = false;
    cancelAnimationFrame(movingID2);
  }
  if (
    (e.key === "Ы" || e.key === "ы" || e.key === "S" || e.key === "s") &&
    movingBottom === true
  ) {
    movingBottom = false;
    cancelAnimationFrame(movingID3);
  }
  if (
    (e.key === "ц" || e.key === "Ц" || e.key === "W" || e.key === "w") &&
    movingUp === true
  ) {
    movingUp = false;
    cancelAnimationFrame(movingID4);
  }
}
let side = "up";
function moveRight() {
  let playerElemBound = playerElem.getBoundingClientRect();
  let player_x2 = player_x + playerElemBound.width;
  if (player_x2 >= 5760) {
    return null;
  } else {
    movingID = requestAnimationFrame(moveRight);
    player_x += step;
    playerElem.style.left = player_x + "px";
    window.scrollBy(step, 0);
    side = "right";
    socket.emit("player_move", player_x, player_y, my_num, side);
    socket.emit("player_move_side", my_num, side);
    socket.emit("proverka");
  }
}
function moveLeft() {
  if (player_x <= 0) {
    return null;
  } else {
    movingID2 = requestAnimationFrame(moveLeft);
    player_x -= step;
    playerElem.style.left = player_x + "px";
    window.scrollBy(-step, 0);
    side = "left";
    socket.emit("player_move", player_x, player_y, my_num, side);
    socket.emit("player_move_side", my_num, side);
    socket.emit("proverka");
  }
}
function moveBottom() {
  let playerElemBound = playerElem.getBoundingClientRect();
  let player_y2 = player_y + playerElemBound.height;
  if (player_y2 >= 3250) {
    return null;
  } else {
    movingID3 = requestAnimationFrame(moveBottom);
    player_y += step;
    playerElem.style.top = player_y + "px";
    window.scrollBy(0, step);
    side = "down";
    socket.emit("player_move", player_x, player_y, my_num, side);
    socket.emit("player_move_side", my_num, side);
    socket.emit("proverka");
  }
}
function moveUp() {
  if (player_y <= 0) {
    return null;
  } else {
    movingID4 = requestAnimationFrame(moveUp);
    player_y -= step;
    playerElem.style.top = player_y + "px";
    window.scrollBy(0, -step);
    side = "up";
    socket.emit("player_move", player_x, player_y, my_num, side);
    socket.emit("player_move_side", my_num, side);
    socket.emit("proverka");
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Генерация карты //

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 5760;
canvas.height = 3250;

let grid = [];
let globalOffset = 1000;

let color = null;
ctx.strokeStyle = "#02060a";
function createHex() {
  for (let i = 0; i < 40; i++) {
    for (let j = 0; j < 34; j++) {
      //  else if (color_random == 1) {
      //   color_random++;
      //   color = "#141414";
      // } else if (color_random == 2) {
      //   color_random++;
      //   color = "#232323";
      // } else if (color_random == 3) {
      //   color_random = color_random + 1;
      //   color = "#333333";
      // } else if (color_random == 4) {
      //   color_random = color_random + 1;
      //   color = "#1D1C1C";
      // } else if (color_random == 5) {
      //   color_random = color_random - 5;
      //   color = "#221F1F";
      // }
      let hex = new Hex(i, j, 100, "#323e4e");
      grid.push(hex);
    }
  }

  for (let hex in grid) {
    let item = grid[hex];
    ctx.beginPath();
    ctx.moveTo(item.points[0].x, item.points[0].y);
    for (let k = 1; k < item.points.length; k++) {
      ctx.lineTo(item.points[k].x, item.points[k].y);
    }
    ctx.lineWidth = "35";
    ctx.fillStyle = grid[hex].color;
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  }


  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  function Hex(x, y, size, color) {
    this.size = 100;
    this.x = x;
    this.y = y;
    this.points = [];
    this.id = [];
    this.color = color;

    this.create = function (x, y) {
      let offSetX = (size / 2) * x * -1;
      let offSetY = 0;

      if (x % 2 == 1) {
        offSetY = (Math.sqrt(3) / 2) * this.size;
      }

      let center = new Point(
        x * this.size * 2 + offSetX,
        ((y * Math.sqrt(3)) / 2) * this.size * 2 + offSetY
      );

      this.midPoint = center;

      this.id[0] = x;
      this.id[1] = y;

      for (let i = 0; i < 6; i++) {
        let degree = 60 * i;
        let radian = (Math.PI / 180) * degree;

        let point = new Point(
          center.x + size * Math.cos(radian),
          center.y + size * Math.sin(radian)
        );

        this.points.push(point);
      }
    };

    this.create(x, y);
  }
}



createHex();
//////////////////////// Магазин /////////////////////////////////////
                                                                                       
if(localStorage.getItem("money") === null){
  localStorage.setItem("money", 0);
}

if(localStorage.getItem("kill") === null){
  localStorage.setItem("kill", 0);
}

if(localStorage.getItem("death") === null){
  localStorage.setItem("death", 0);
}

if(localStorage.getItem("plusKills") === null){
  localStorage.setItem("plusKills", 0);
}

if(localStorage.getItem("plusMoney") === null){
  localStorage.setItem("plusMoney", 0);
}                                                                                                                                                                                     
let buttonStore = document.querySelectorAll(".button-store");
let cenaStore = document.querySelectorAll(".cena");
let arrStore = [];
let skins = JSON.parse(localStorage.getItem("skins")) || [0];

// 🔥 восстанавливаем купленные скины
skins.forEach((id) => {
  if(id === 0) return;

  let btn = buttonStore[id - 1];

  if(btn){
    btn.textContent = "Продано";
    btn.style.backgroundColor = "#6b8e6b";
    btn.style.border = "2px solid #3e5c3e";
    btn.style.pointerEvents = "none";
  }
});

function buySkin(index) {
  let cost = Number(cenaStore[index].textContent);
  let stateMoney = Number(localStorage.getItem("money"));
if (stateMoney >= cost && buttonStore[index].textContent != "Продано") {

  let m = localStorage.getItem("money");
  localStorage.setItem("money", m - cost);

  skins = JSON.parse(localStorage.getItem("skins"));

  // 🔥 ВОТ ЭТА ЧАСТЬ
  buttonStore[index].textContent = "Продано";
  buttonStore[index].style.backgroundColor = "#6b8e6b";
  buttonStore[index].style.border = "2px solid #3e5c3e";
  buttonStore[index].style.pointerEvents = "none";

  index = index + 1;
  skins.push(index);

  localStorage.setItem("skins", JSON.stringify(skins));

  money.textContent = localStorage.getItem("money");

  } else if (stateMoney < cost) {
    console.warn("Недостаточно денег");
  }
}
buttonStore.forEach((elem) => {
  arrStore.push(elem);
});
arrStore.forEach((elem) => {
  elem.addEventListener("click", () => {
    let index = arrStore.indexOf(elem);
    buySkin(index);
  });
});

// if (JSON.parse(localStorage.getItem("skins")).includes(1)) {
//   console.log("pyk");
// }
localStorage.setItem("skin", 0);
money.textContent = localStorage.getItem("money");
kill.textContent = localStorage.getItem("kill");
death.textContent = localStorage.getItem("death");
let leftArrow = document.querySelector(".arrow-left"),
  rightArrow = document.querySelector(".arrow-right"),
  imgChoose = document.querySelector(".player-choose");

leftArrow.addEventListener("click", () => {
  skins = JSON.parse(localStorage.getItem("skins"));
  let countForArrow = +imgChoose.getAttribute("data-current");

  countForArrow++;
  if (countForArrow >= skins.length) {
    countForArrow = 0;
  }
  imgChoose.setAttribute("data-current", countForArrow);
  imgChoose.innerHTML = `<img src="../images/character${skins[countForArrow]}.png" class="img-choose" /> `;
  localStorage.setItem("skin", skins[countForArrow]);
});
rightArrow.addEventListener("click", () => {
  skins = JSON.parse(localStorage.getItem("skins"));
  let countForArrow = +imgChoose.getAttribute("data-current");
  countForArrow--;
  if (countForArrow < 0) {
    countForArrow = skins.length - 1;
  }
  imgChoose.setAttribute("data-current", countForArrow);
  imgChoose.innerHTML = `<img src="../images/character${skins[countForArrow]}.png" class="img-choose" /> `;
  
  localStorage.setItem("skin", skins[countForArrow]);
});

////////////////////////////////////// Левел ///////////////////////////////////
let lvl = 1;
let lvlprocent = 0;
let lvlprocent2 = 0;
let countForLvl = 0;
let rangeIncrease = 1;

function plusExp(event) {
  if (event === "rock") {
    lvlprocent = lvlprocent + 5;
    lvlprocent2 = lvlprocent2 + 5;
  } else if (event === "kill") {
    lvlprocent = lvlprocent + 100;
    lvlprocent2 = lvlprocent2 + 100;
  }

  switch (lvl) {
    case 1:
      zapol1.style.width = `${lvlprocent2}%`;
      break;
    case 2:
      zapol1.style.width = `${lvlprocent2}%`;
      break;
    case 3:
      zapol1.style.width = `${lvlprocent2 / 2}%`;
      break;
    case 4:
      zapol1.style.width = `${lvlprocent2 / 4}%`;
      break;
    case 5:
      zapol1.style.width = `${lvlprocent2 / 4}%`;
      break;
    case 6:
      zapol1.style.width = `${lvlprocent2 / 4}%`;
      break;
    case 7:
      zapol1.style.width = `${lvlprocent2 / 6}%`;
      break;
    case 8:
      zapol1.style.width = `${lvlprocent2 / 6}%`;
      break;
    case 9:
      zapol1.style.width = `${lvlprocent2 / 12}%`;
      break;
  }

  if (lvlprocent >= 100 && countForLvl === 0) {
    lvl = 2;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 100;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 200 && countForLvl === 1) {
    lvl = 3;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 200;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 400 && countForLvl === 2) {
    lvl = 4;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 400;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 800 && countForLvl === 3) {
    lvl = 5;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 800;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 1200 && countForLvl === 4) {
    lvl = 6;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 1200;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 1600 && countForLvl === 5) {
    lvl = 7;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 1600;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 2200 && countForLvl === 6) {
    lvl = 8;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 2200;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 2800 && countForLvl === 7) {
    lvl = 9;
    countForLvl++;
    zapol1.style.width = `${0}%`;
    lvlprocent2 = 0;
    lvlprocent = 2800;
    setCharacteristics(lvl);
    level.textContent = lvl;
  } else if (lvlprocent >= 4000 && countForLvl === 8) {
    lvl = "MAX";
    level.style.fontSize = "2.6em";
    level.style.top = "10%";
    zapol1.style.width = `${100}%`;
    countForLvl++;
    setCharacteristics(lvl);
    level.textContent = lvl;
  }
}

function setCharacteristics(lvl) {
  if (lvl === 2) {
    step = 10;
    window.scrollTo(player_x + 1060 + 165, player_y + 2950);
    playerElem.style.width = 162 + "px";
    playerElem.style.height = 162 + "px";
    rangeIncrease = 1.1;
    socket.emit("setChar", 162, my_num);
  } else if (lvl === 3) {
    step = 9;
    window.scrollTo(player_x + 1060 + 174, player_y + 2950);
    playerElem.style.width = 174 + "px";
    playerElem.style.height = 174 + "px";
    rangeIncrease = 1.2;
    socket.emit("setChar", 174, my_num);
  } else if (lvl === 4) {
    step = 9;
    window.scrollTo(player_x + 1060 + 186, player_y + 2950);
    playerElem.style.width = 186 + "px";
    playerElem.style.height = 186 + "px";
    rangeIncrease = 1.3;
    socket.emit("setChar", 186, my_num);
  } else if (lvl === 5) {
    step = 8;
    window.scrollTo(player_x + 1060 + 198, player_y + 2950);
    playerElem.style.width = 198 + "px";
    playerElem.style.height = 198 + "px";
    rangeIncrease = 1.4;
    socket.emit("setChar", 198, my_num);
  } else if (lvl === 6) {
    step = 8;
    window.scrollTo(player_x + 1060 + 210, player_y + 2950);
    playerElem.style.width = 210 + "px";
    playerElem.style.height = 210 + "px";
    rangeIncrease = 1.5;
    socket.emit("setChar", 210, my_num);
  } else if (lvl === 7) {
    step = 7;
    window.scrollTo(player_x + 1060 + 222, player_y + 2950);
    playerElem.style.width = 222 + "px";
    playerElem.style.height = 222 + "px";
    rangeIncrease = 1.6;
    socket.emit("setChar", 222, my_num);
  } else if (lvl === 8) {
    step = 7;
    window.scrollTo(player_x + 1060 + 234, player_y + 2950);
    playerElem.style.width = 234 + "px";
    playerElem.style.height = 234 + "px";
    rangeIncrease = 1.7;
    socket.emit("setChar", 234, my_num);
  } else if (lvl === 9) {
    step = 6;
    window.scrollTo(player_x + 1060 + 246, player_y + 2950);
    playerElem.style.width = 246 + "px";
    playerElem.style.height = 246 + "px";
    rangeIncrease = 1.8;
    socket.emit("setChar", 246, my_num);
  } else if (lvl === "MAX") {
    step = 6;
    window.scrollTo(player_x + 1060 + 258, player_y + 2950);
    playerElem.style.width = 258 + "px";
    playerElem.style.height = 258 + "px";
    rangeIncrease = 1.9;
    socket.emit("setChar", 258, my_num);
  }
}



















////////////////////////////////////// Удар и коллизия игроков ///////////////////////////////////
let beforeMenuBtn = document.querySelector(".menu-menu");
beforeMenuBtn.addEventListener("click", () => {
  socket.emit("number");
  beforeMenu.style.display = "none";
  map.style.filter = "blur(0px)";
  video_bg.style.display = "block";
  menu.style.display = "flex";
  ui.style.display = "none";
  map.style.display = "none";
  gif.style.display = "none";
  html.style.width = "100%";
  html.style.height = "100%";
  body.style.width = "100%";
  body.style.height = "100%";
  money.textContent = localStorage.getItem("money");
  kill.textContent = localStorage.getItem("kill");
  death.textContent = localStorage.getItem("death");
});


let currentStore = 0;

function changeStore(dir) {
  currentStore += dir;

  if (currentStore < 0) currentStore = 1;
  if (currentStore > 1) currentStore = 0;

  const storeName = document.getElementById("storeName");
  const skinsStore = document.getElementById("skinsStore");
  const weaponsStore = document.getElementById("weaponsStore");

  if (currentStore === 0) {
    storeName.textContent = "Магазин скинов";
    skinsStore.style.display = "grid";
    weaponsStore.style.display = "none";
  } else {
    storeName.textContent = "Магазин оружия";
    skinsStore.style.display = "none";
    weaponsStore.style.display = "grid";
  }
}
const arena = document.querySelector(".map");

const hearts = document.createElement("div");
hearts.style.position = "absolute";
hearts.style.right = "30px";
hearts.style.bottom = "30px";
hearts.style.display = "flex";
hearts.style.gap = "10px";
hearts.style.zIndex = "999999";

for(let i=0;i<3;i++){
    const heart = document.createElement("img");
    heart.src = "../images/stam111.png";
    heart.style.width = "50px";
    heart.style.height = "50px";
    hearts.appendChild(heart);
}












let playerHP = 6;
let coins = Number(localStorage.getItem("money")) || 0;

// 🔥 ДОБАВЬ ЭТО
let kills = Number(localStorage.getItem("kill")) || 0;
let deaths = Number(localStorage.getItem("death")) || 0;

setTimeout(() => {
  let moneyEl = document.getElementById("money");
  let killEl = document.getElementById("kill");
  let deathEl = document.getElementById("death");

  if(moneyEl) moneyEl.innerText = coins;
  if(killEl) killEl.innerText = kills;
  if(deathEl) deathEl.innerText = deaths;
}, 100);
// 👇 дальше твой код
let startHP = playerHP;

// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct0.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 5;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
  window.gameOver = true;
  gamePaused = true;


// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// 🔥 СОХРАНЕНИЕ + RESTART
btn.onclick = function(){

  localStorage.setItem("money", coins);
  localStorage.setItem("kill", kills);
  localStorage.setItem("death", deaths);

  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- CONTINUE ЛОГИКА --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
	// 💰 сохранить coins
  localStorage.setItem("coins", coins);
  // 💀 сохраняем убийства
  localStorage.setItem("kill", kills);

  // ☠️ сохраняем смерти
  localStorage.setItem("death", deaths);
location.reload();
};

// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

if(monsterHP <= 0){

kills++;
localStorage.setItem("kill", kills);

  // удаляем монстра
  monster.remove();
  monsterHPText.remove();

  console.log("Монстр убит");
  
	// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);


// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove();

      if(playerHP < 6){
        playerHP++;

        let heartsBox = document.querySelector(".hearts");

        // полностью перерисовать HP
        heartsBox.innerHTML = "";

        for(let i = 0; i < playerHP; i++){

          let hp = document.createElement("img");
          hp.src = "../images/stam111.png";
          hp.className = "heart";

          heartsBox.appendChild(hp);

        }

      }

    }

  });

},100);


// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 1  ";

document.body.appendChild(victory);




      }

    }

  });

},1000);
// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct1.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";
  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 7;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";
  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;

  // берём HP игрока, если он уже есть в игре
  let currentPlayerHP = (typeof playerHP !== "undefined") ? playerHP : 6;

  function syncPlayerHP(){
    if(typeof playerHP !== "undefined"){
      playerHP = currentPlayerHP;
    }
  }

  // ==========================
  // 💥 ВЗРЫВ
  // ==========================
  function createExplosion(x, y){
    let boom = document.createElement("div");

    boom.style.position = "absolute";
    boom.style.left = x + "px";
    boom.style.top = y + "px";
    boom.style.width = "80px";
    boom.style.height = "80px";
    boom.style.borderRadius = "50%";
    boom.style.background = "radial-gradient(circle, #ffcc00, #ff3300, transparent)";
    boom.style.zIndex = "50";
    boom.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(boom);

    boom.animate([
      { transform: "scale(0.5)", opacity: 1 },
      { transform: "scale(2)", opacity: 0 }
    ], {
      duration: 400,
      easing: "ease-out"
    });

    setTimeout(() => {
      boom.remove();
    }, 400);
  }

  // ==========================
  // 🔥 ОГНЕННЫЙ ШАР
  // ==========================
  function shootFireball(startX, startY){

    let fire = document.createElement("div");

    fire.style.position = "absolute";
    fire.style.left = startX + "px";
    fire.style.top = startY + "px";
    fire.style.width = "20px";
    fire.style.height = "20px";
    fire.style.borderRadius = "50%";
    fire.style.background = "orange";
    fire.style.boxShadow = "0 0 20px red";
    fire.style.zIndex = "20";
    fire.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(fire);

    let fireX = startX;
    let fireY = startY;
    let fireSpeed = 5;

    let fireInterval = setInterval(() => {

      let player = document.querySelector("#player_field img");
      if(!player){
        clearInterval(fireInterval);
        fire.remove();
        return;
      }

      let p = player.getBoundingClientRect();

      let dx = p.left - fireX;
      let dy = p.top - fireY;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if(dist > 1){
        fireX += (dx / dist) * fireSpeed;
        fireY += (dy / dist) * fireSpeed;
      }

      fire.style.left = fireX + "px";
      fire.style.top = fireY + "px";

      // попадание
      if(dist < 50){

        createExplosion(fireX, fireY);

        clearInterval(fireInterval);
        fire.remove();

        let hearts = document.querySelectorAll(".heart");

        if(currentPlayerHP > 0){
          currentPlayerHP--;
          syncPlayerHP();

          if(hearts[currentPlayerHP]){
            hearts[currentPlayerHP].remove();
          }
        }

        let playerEl = document.querySelector("#player_field img");
        if(playerEl){
          playerEl.style.filter = "brightness(0.3)";
          setTimeout(() => {
            playerEl.style.filter = "";
          }, 200);
        }

        if(currentPlayerHP <= 0 && !window.gameOver){

          deaths++;
          localStorage.setItem("death", deaths);

          window.gameOver = true;
          gamePaused = true;

          let gameOver = document.createElement("div");
          gameOver.style.position = "fixed";gameOver.style.top = "0";
          gameOver.style.left = "0";
          gameOver.style.width = "100%";
          gameOver.style.height = "100%";
          gameOver.style.background = "rgba(0,0,0,0.85)";
          gameOver.style.display = "flex";
          gameOver.style.flexDirection = "column";
          gameOver.style.alignItems = "center";
          gameOver.style.justifyContent = "center";
          gameOver.style.zIndex = "999999";

          document.body.appendChild(gameOver);

          let text = document.createElement("div");
          text.innerText = "YOU LOST";
          text.style.fontSize = "80px";
          text.style.color = "red";
          text.style.fontWeight = "bold";
          text.style.marginBottom = "40px";
          text.style.transform = "scale(0)";
          text.style.transition = "0.4s";

          gameOver.appendChild(text);

          let btn = document.createElement("div");
          btn.innerText = "RESTART";
          btn.style.background = "#8db4d1";
          btn.style.padding = "14px 25px";
          btn.style.border = "2px solid #4b6b80";
          btn.style.borderRadius = "10px";
          btn.style.cursor = "pointer";
          btn.style.fontWeight = "bold";
          btn.style.fontSize = "18px";
          btn.style.zIndex = "1000000";

          gameOver.appendChild(btn);

          btn.onclick = function(){
            localStorage.setItem("money", coins || 0);
            localStorage.setItem("kill", kills || 0);
            localStorage.setItem("death", deaths || 0);
            location.reload();
          };

          setTimeout(() => {
            text.style.transform = "scale(1)";
          }, 50);
        }
      }

    }, 16);

    setTimeout(() => {
      clearInterval(fireInterval);
      if(fire.parentNode){
        fire.remove();
      }
    }, 3000);
  }

  // ==========================
  // ❤️ ПОДБОР СЕРДЦА
  // ==========================
  let pickHeartInterval = setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let heartsDrop = document.querySelectorAll(".dropHeart");

    heartsDrop.forEach((heart) => {

      let p = player.getBoundingClientRect();
      let h = heart.getBoundingClientRect();

      if(
        p.left < h.right &&
        p.right > h.left &&
        p.top < h.bottom &&
        p.bottom > h.top
      ){
        heart.remove();

        if(currentPlayerHP < 6){
          currentPlayerHP++;
          syncPlayerHP();

          let hp = document.createElement("img");
          hp.src = "../images/stam111.png";
          hp.className = "heart";

          document.querySelector(".hearts").appendChild(hp);
        }
      }

    });

  }, 100);

  // ==========================
  // 🚶 ДВИЖЕНИЕ И АТАКА
  // ==========================
  let monsterMoveInterval = setInterval(() => {

    if(window.gameOver){
      clearInterval(monsterMoveInterval);
      clearInterval(pickHeartInterval);
      return;
    }

    if(!monster.parentNode) {
      clearInterval(monsterMoveInterval);
      return;
    }

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // рандомный огненный шар
	 
  if(distance < 250 && Math.random() < 0.02){
  shootFireball(monsterX + 100, monsterY + 100);
}

if(monster && monster.parentNode && distance < 120 && monsterCanHit){

  monsterCanHit = false;

  // анимация атаки
  monster.style.transform = "scale(1.3)";
  setTimeout(()=>{
    monster.style.transform = "scale(1)";
  },200);

  // эффект удара
  player.style.filter = "brightness(0.4)";
  setTimeout(()=>{
    player.style.filter = "";
  },200);

  let hearts = document.querySelectorAll(".heart");

  // защита от багов
  if(typeof playerHP !== "undefined" && playerHP > 0){

    playerHP--;

    if(hearts[playerHP]){
      hearts[playerHP].remove();
    }
  }

  // смерть игрока
  if(typeof playerHP !== "undefined" && playerHP <= 0 && !window.gameOver){

    deaths++;
    localStorage.setItem("death", deaths);

    window.gameOver = true;
    gamePaused = true;

    let gameOver = document.createElement("div");

    gameOver.style.position = "fixed";
    gameOver.style.top = "0";
    gameOver.style.left = "0";
    gameOver.style.width = "100%";
    gameOver.style.height = "100%";
    gameOver.style.background = "rgba(0,0,0,0.85)";
    gameOver.style.display = "flex";
    gameOver.style.flexDirection = "column";
    gameOver.style.alignItems = "center";
    gameOver.style.justifyContent = "center";
    gameOver.style.zIndex = "999999";

    document.body.appendChild(gameOver);

    let text = document.createElement("div");

    text.innerText = "YOU LOST";
    text.style.fontSize = "80px";
    text.style.color = "red";
    text.style.fontWeight = "bold";
    text.style.marginBottom = "40px";
    text.style.transform = "scale(0)";
    text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

btn.onclick = function(){

  // 💥 БЕРЁМ АКТУАЛЬНЫЕ ДАННЫЕ (на всякий случай)
  let currentCoins = coins;
  let currentKills = kills;
  let currentDeaths = deaths;

  console.log("SAVE:", currentCoins, currentKills, currentDeaths);

  // 💾 СОХРАНЯЕМ
  localStorage.setItem("money", currentCoins);
  localStorage.setItem("kill", currentKills);
  localStorage.setItem("death", currentDeaths);

  // 🔄 перезапуск
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- CONTINUE ЛОГИКА --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};
    btn.onclick = function(){
      localStorage.setItem("coins", coins);
      localStorage.setItem("kill", kills);
      localStorage.setItem("death", deaths);
      location.reload();
    };

    setTimeout(()=>{
      text.style.transform = "scale(1)";
    },50);
  }

  setTimeout(()=>{
    monsterCanHit = true;
  },1000);
}

  }, 16);
  

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e) => {

    if(e.button !== 0) return;
    if(!monster.parentNode) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(() => {
        if(monster.parentNode){
          monster.style.filter = "";
        }
      }, 150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){

        kills++;
        localStorage.setItem("kill", kills);

        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");

        // награда в коинах
        let lostHP = startHP - currentPlayerHP;
        let reward = 0;

        if(lostHP === 0){
          reward = 30;
        } else if(lostHP === 1){
          reward = 20;
        } else if(lostHP === 2){
          reward = 10;
        } else {
          reward = 5;
        }

        coins += reward;
        localStorage.setItem("money", coins);

        let moneyUI = document.getElementById("money_ui");
        if(moneyUI){
          moneyUI.innerText = coins;
        }

        // монета
        let coin = document.createElement("img");
        coin.src = "../images/coin.png";
        coin.style.position = "absolute";
        coin.style.left = monsterX + "px";
        coin.style.top = monsterY + "px";
        coin.style.width = "50px";
        coin.style.zIndex = "20";

        document.querySelector(".map").appendChild(coin);

        setTimeout(() => {
          if(coin.parentNode){
            coin.remove();
          }
        }, 5000);

        // выпадение сердца
        let heart = document.createElement("img");
        heart.src = "../images/stam111.png";
        heart.className = "dropHeart";
        heart.style.position = "absolute";
        heart.style.left = monsterX + "px";
        heart.style.top = monsterY + "px";
        heart.style.width = "60px";
        heart.style.zIndex = "20";

        document.querySelector(".map").appendChild(heart);

        // вспышка
        let flash = document.createElement("div");
        flash.className = "flashEffect";
        document.querySelector(".map").appendChild(flash);

        setTimeout(() => {
          flash.remove();
        }, 400);

        // взрыв
        createExplosion(monsterX, monsterY);

        let victory = document.createElement("div");
        victory.id = "roundVictory";
        victory.innerText = "";

        document.body.appendChild(victory);
      }
    }

  });

}, 50000);


// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct0.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

 let monsterX = window.innerWidth - 150; // 👉 справа
let monsterY = 300;


  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";
  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 7;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";
  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;

  // берём HP игрока, если он уже есть в игре
  let currentPlayerHP = (typeof playerHP !== "undefined") ? playerHP : 6;

  function syncPlayerHP(){
    if(typeof playerHP !== "undefined"){
      playerHP = currentPlayerHP;
    }
  }

  // ==========================
  // 💥 ВЗРЫВ
  // ==========================
  function createExplosion(x, y){
    let boom = document.createElement("div");

    boom.style.position = "absolute";
    boom.style.left = x + "px";
    boom.style.top = y + "px";
    boom.style.width = "80px";
    boom.style.height = "80px";
    boom.style.borderRadius = "50%";
    boom.style.background = "radial-gradient(circle, #ffcc00, #ff3300, transparent)";
    boom.style.zIndex = "50";
    boom.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(boom);

    boom.animate([
      { transform: "scale(0.5)", opacity: 1 },
      { transform: "scale(2)", opacity: 0 }
    ], {
      duration: 400,
      easing: "ease-out"
    });

    setTimeout(() => {
      boom.remove();
    }, 400);
  }

  // ==========================
  // 🔥 ОГНЕННЫЙ ШАР
  // ==========================
  function shootFireball(startX, startY){

    let fire = document.createElement("div");

    fire.style.position = "absolute";
    fire.style.left = startX + "px";
    fire.style.top = startY + "px";
    fire.style.width = "20px";
    fire.style.height = "20px";
    fire.style.borderRadius = "50%";
    fire.style.background = "orange";
    fire.style.boxShadow = "0 0 20px red";
    fire.style.zIndex = "20";
    fire.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(fire);

    let fireX = startX;
    let fireY = startY;
    let fireSpeed = 5;

    let fireInterval = setInterval(() => {

      let player = document.querySelector("#player_field img");
      if(!player){
        clearInterval(fireInterval);
        fire.remove();
        return;
      }

      let p = player.getBoundingClientRect();

      let dx = p.left - fireX;
      let dy = p.top - fireY;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if(dist > 1){
        fireX += (dx / dist) * fireSpeed;
        fireY += (dy / dist) * fireSpeed;
      }

      fire.style.left = fireX + "px";
      fire.style.top = fireY + "px";

      // попадание
      if(dist < 50){

        createExplosion(fireX, fireY);

        clearInterval(fireInterval);
        fire.remove();

        let hearts = document.querySelectorAll(".heart");

        if(currentPlayerHP > 0){
          currentPlayerHP--;
          syncPlayerHP();

          if(hearts[currentPlayerHP]){
            hearts[currentPlayerHP].remove();
          }
        }

        let playerEl = document.querySelector("#player_field img");
        if(playerEl){
          playerEl.style.filter = "brightness(0.3)";
          setTimeout(() => {
            playerEl.style.filter = "";
          }, 200);
        }

        if(currentPlayerHP <= 0 && !window.gameOver){

          deaths++;
          localStorage.setItem("death", deaths);

          window.gameOver = true;
          gamePaused = true;

          let gameOver = document.createElement("div");
          gameOver.style.position = "fixed";gameOver.style.top = "0";
          gameOver.style.left = "0";
          gameOver.style.width = "100%";
          gameOver.style.height = "100%";
          gameOver.style.background = "rgba(0,0,0,0.85)";
          gameOver.style.display = "flex";
          gameOver.style.flexDirection = "column";
          gameOver.style.alignItems = "center";
          gameOver.style.justifyContent = "center";
          gameOver.style.zIndex = "999999";

          document.body.appendChild(gameOver);

          let text = document.createElement("div");
          text.innerText = "YOU LOST";
          text.style.fontSize = "80px";
          text.style.color = "red";
          text.style.fontWeight = "bold";
          text.style.marginBottom = "40px";
          text.style.transform = "scale(0)";
          text.style.transition = "0.4s";

          gameOver.appendChild(text);

          let btn = document.createElement("div");
          btn.innerText = "RESTART";
          btn.style.background = "#8db4d1";
          btn.style.padding = "14px 25px";
          btn.style.border = "2px solid #4b6b80";
          btn.style.borderRadius = "10px";
          btn.style.cursor = "pointer";
          btn.style.fontWeight = "bold";
          btn.style.fontSize = "18px";
          btn.style.zIndex = "1000000";

          gameOver.appendChild(btn);

          btn.onclick = function(){
            localStorage.setItem("money", coins || 0);
            localStorage.setItem("kill", kills || 0);
            localStorage.setItem("death", deaths || 0);
            location.reload();
          };

          setTimeout(() => {
            text.style.transform = "scale(1)";
          }, 50);
        }
      }

    }, 16);

    setTimeout(() => {
      clearInterval(fireInterval);
      if(fire.parentNode){
        fire.remove();
      }
    }, 3000);
  }

  // ==========================
  // ❤️ ПОДБОР СЕРДЦА
  // ==========================
  let pickHeartInterval = setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let heartsDrop = document.querySelectorAll(".dropHeart");

    heartsDrop.forEach((heart) => {

      let p = player.getBoundingClientRect();
      let h = heart.getBoundingClientRect();

      if(
        p.left < h.right &&
        p.right > h.left &&
        p.top < h.bottom &&
        p.bottom > h.top
      ){
        heart.remove();

        if(currentPlayerHP < 6){
          currentPlayerHP++;
          syncPlayerHP();

          let hp = document.createElement("img");
          hp.src = "../images/stam111.png";
          hp.className = "heart";

          document.querySelector(".hearts").appendChild(hp);
        }
      }

    });

  }, 100);

  // ==========================
  // 🚶 ДВИЖЕНИЕ И АТАКА
  // ==========================
  let monsterMoveInterval = setInterval(() => {

    if(window.gameOver){
      clearInterval(monsterMoveInterval);
      clearInterval(pickHeartInterval);
      return;
    }

    if(!monster.parentNode) {
      clearInterval(monsterMoveInterval);
      return;
    }

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = (playerRect.x + 160) - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // рандомный огненный шар
	 
  if(distance < 250 && Math.random() < 0.02){
  shootFireball(monsterX + 100, monsterY + 100);
}

if(monster && monster.parentNode && distance < 120 && monsterCanHit){

  monsterCanHit = false;

  // анимация атаки
  monster.style.transform = "scale(1.3)";
  setTimeout(()=>{
    monster.style.transform = "scale(1)";
  },200);

  // эффект удара
  player.style.filter = "brightness(0.4)";
  setTimeout(()=>{
    player.style.filter = "";
  },200);

  let hearts = document.querySelectorAll(".heart");

  // защита от багов
  if(typeof playerHP !== "undefined" && playerHP > 0){

    playerHP--;

    if(hearts[playerHP]){
      hearts[playerHP].remove();
    }
  }

  // смерть игрока
  if(typeof playerHP !== "undefined" && playerHP <= 0 && !window.gameOver){

    deaths++;
    localStorage.setItem("death", deaths);

    window.gameOver = true;
    gamePaused = true;

    let gameOver = document.createElement("div");

    gameOver.style.position = "fixed";
    gameOver.style.top = "0";
    gameOver.style.left = "0";
    gameOver.style.width = "100%";
    gameOver.style.height = "100%";
    gameOver.style.background = "rgba(0,0,0,0.85)";
    gameOver.style.display = "flex";
    gameOver.style.flexDirection = "column";
    gameOver.style.alignItems = "center";
    gameOver.style.justifyContent = "center";
    gameOver.style.zIndex = "999999";

    document.body.appendChild(gameOver);

    let text = document.createElement("div");

    text.innerText = "YOU LOST";
    text.style.fontSize = "80px";
    text.style.color = "red";
    text.style.fontWeight = "bold";
    text.style.marginBottom = "40px";
    text.style.transform = "scale(0)";
    text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

btn.onclick = function(){

  // 💥 БЕРЁМ АКТУАЛЬНЫЕ ДАННЫЕ (на всякий случай)
  let currentCoins = coins;
  let currentKills = kills;
  let currentDeaths = deaths;

  console.log("SAVE:", currentCoins, currentKills, currentDeaths);

  // 💾 СОХРАНЯЕМ
  localStorage.setItem("money", currentCoins);
  localStorage.setItem("kill", currentKills);
  localStorage.setItem("death", currentDeaths);

  // 🔄 перезапуск
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- CONTINUE ЛОГИКА --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};
    btn.onclick = function(){
      localStorage.setItem("coins", coins);
      localStorage.setItem("kill", kills);
      localStorage.setItem("death", deaths);
      location.reload();
    };

    setTimeout(()=>{
      text.style.transform = "scale(1)";
    },50);
  }

  setTimeout(()=>{
    monsterCanHit = true;
  },1000);
}

  }, 16);
  

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e) => {

    if(e.button !== 0) return;
    if(!monster.parentNode) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(() => {
        if(monster.parentNode){
          monster.style.filter = "";
        }
      }, 150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){

        kills++;
        localStorage.setItem("kill", kills);

        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");

        // награда в коинах
        let lostHP = startHP - currentPlayerHP;
        let reward = 0;

        if(lostHP === 0){
          reward = 30;
        } else if(lostHP === 1){
          reward = 20;
        } else if(lostHP === 2){
          reward = 10;
        } else {
          reward = 5;
        }

        coins += reward;
        localStorage.setItem("money", coins);

        let moneyUI = document.getElementById("money_ui");
        if(moneyUI){
          moneyUI.innerText = coins;
        }

        // монета
        let coin = document.createElement("img");
        coin.src = "../images/coin.png";
        coin.style.position = "absolute";
        coin.style.left = monsterX + "px";
        coin.style.top = monsterY + "px";
        coin.style.width = "50px";
        coin.style.zIndex = "20";

        document.querySelector(".map").appendChild(coin);

        setTimeout(() => {
          if(coin.parentNode){
            coin.remove();
          }
        }, 5000);

        // выпадение сердца
        let heart = document.createElement("img");
        heart.src = "../images/stam111.png";
        heart.className = "dropHeart";
        heart.style.position = "absolute";
        heart.style.left = monsterX + "px";
        heart.style.top = monsterY + "px";
        heart.style.width = "60px";
        heart.style.zIndex = "20";

        document.querySelector(".map").appendChild(heart);

        // вспышка
        let flash = document.createElement("div");
        flash.className = "flashEffect";
        document.querySelector(".map").appendChild(flash);

        setTimeout(() => {
          flash.remove();
        }, 400);

        // взрыв
        createExplosion(monsterX, monsterY);

        let victory = document.createElement("div");
        victory.id = "roundVictory";
        victory.innerText = "";

        document.body.appendChild(victory);
      }
    }

  });

}, 60000);
// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct1.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";
  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 7;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";
  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;

  // берём HP игрока, если он уже есть в игре
  let currentPlayerHP = (typeof playerHP !== "undefined") ? playerHP : 6;

  function syncPlayerHP(){
    if(typeof playerHP !== "undefined"){
      playerHP = currentPlayerHP;
    }
  }

  // ==========================
  // 💥 ВЗРЫВ
  // ==========================
  function createExplosion(x, y){
    let boom = document.createElement("div");

    boom.style.position = "absolute";
    boom.style.left = x + "px";
    boom.style.top = y + "px";
    boom.style.width = "80px";
    boom.style.height = "80px";
    boom.style.borderRadius = "50%";
    boom.style.background = "radial-gradient(circle, #ffcc00, #ff3300, transparent)";
    boom.style.zIndex = "50";
    boom.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(boom);

    boom.animate([
      { transform: "scale(0.5)", opacity: 1 },
      { transform: "scale(2)", opacity: 0 }
    ], {
      duration: 400,
      easing: "ease-out"
    });

    setTimeout(() => {
      boom.remove();
    }, 400);
  }

  // ==========================
  // 🔥 ОГНЕННЫЙ ШАР
  // ==========================
  function shootFireball(startX, startY){

    let fire = document.createElement("div");

    fire.style.position = "absolute";
    fire.style.left = startX + "px";
    fire.style.top = startY + "px";
    fire.style.width = "20px";
    fire.style.height = "20px";
    fire.style.borderRadius = "50%";
    fire.style.background = "orange";
    fire.style.boxShadow = "0 0 20px red";
    fire.style.zIndex = "20";
    fire.style.pointerEvents = "none";

    document.querySelector(".map").appendChild(fire);

    let fireX = startX;
    let fireY = startY;
    let fireSpeed = 5;

    let fireInterval = setInterval(() => {

      let player = document.querySelector("#player_field img");
      if(!player){
        clearInterval(fireInterval);
        fire.remove();
        return;
      }

      let p = player.getBoundingClientRect();

      let dx = p.left - fireX;
      let dy = p.top - fireY;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if(dist > 1){
        fireX += (dx / dist) * fireSpeed;
        fireY += (dy / dist) * fireSpeed;
      }

      fire.style.left = fireX + "px";
      fire.style.top = fireY + "px";

      // попадание
      if(dist < 50){

        createExplosion(fireX, fireY);

        clearInterval(fireInterval);
        fire.remove();

        let hearts = document.querySelectorAll(".heart");

        if(currentPlayerHP > 0){
          currentPlayerHP--;
          syncPlayerHP();

          if(hearts[currentPlayerHP]){
            hearts[currentPlayerHP].remove();
          }
        }

        let playerEl = document.querySelector("#player_field img");
        if(playerEl){
          playerEl.style.filter = "brightness(0.3)";
          setTimeout(() => {
            playerEl.style.filter = "";
          }, 200);
        }

        if(currentPlayerHP <= 0 && !window.gameOver){

          deaths++;
          localStorage.setItem("death", deaths);

          window.gameOver = true;
          gamePaused = true;

          let gameOver = document.createElement("div");
          gameOver.style.position = "fixed";gameOver.style.top = "0";
          gameOver.style.left = "0";
          gameOver.style.width = "100%";
          gameOver.style.height = "100%";
          gameOver.style.background = "rgba(0,0,0,0.85)";
          gameOver.style.display = "flex";
          gameOver.style.flexDirection = "column";
          gameOver.style.alignItems = "center";
          gameOver.style.justifyContent = "center";
          gameOver.style.zIndex = "999999";

          document.body.appendChild(gameOver);

          let text = document.createElement("div");
          text.innerText = "YOU LOST";
          text.style.fontSize = "80px";
          text.style.color = "red";
          text.style.fontWeight = "bold";
          text.style.marginBottom = "40px";
          text.style.transform = "scale(0)";
          text.style.transition = "0.4s";

          gameOver.appendChild(text);

          let btn = document.createElement("div");
          btn.innerText = "RESTART";
          btn.style.background = "#8db4d1";
          btn.style.padding = "14px 25px";
          btn.style.border = "2px solid #4b6b80";
          btn.style.borderRadius = "10px";
          btn.style.cursor = "pointer";
          btn.style.fontWeight = "bold";
          btn.style.fontSize = "18px";
          btn.style.zIndex = "1000000";

          gameOver.appendChild(btn);

          btn.onclick = function(){
            localStorage.setItem("money", coins || 0);
            localStorage.setItem("kill", kills || 0);
            localStorage.setItem("death", deaths || 0);
            location.reload();
          };

          setTimeout(() => {
            text.style.transform = "scale(1)";
          }, 50);
        }
      }

    }, 16);

    setTimeout(() => {
      clearInterval(fireInterval);
      if(fire.parentNode){
        fire.remove();
      }
    }, 3000);
  }

  // ==========================
  // ❤️ ПОДБОР СЕРДЦА
  // ==========================
  let pickHeartInterval = setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let heartsDrop = document.querySelectorAll(".dropHeart");

    heartsDrop.forEach((heart) => {

      let p = player.getBoundingClientRect();
      let h = heart.getBoundingClientRect();

      if(
        p.left < h.right &&
        p.right > h.left &&
        p.top < h.bottom &&
        p.bottom > h.top
      ){
        heart.remove();

        if(currentPlayerHP < 6){
          currentPlayerHP++;
          syncPlayerHP();

          let hp = document.createElement("img");
          hp.src = "../images/stam111.png";
          hp.className = "heart";

          document.querySelector(".hearts").appendChild(hp);
        }
      }

    });

  }, 100);

  // ==========================
  // 🚶 ДВИЖЕНИЕ И АТАКА
  // ==========================
  let monsterMoveInterval = setInterval(() => {

    if(window.gameOver){
      clearInterval(monsterMoveInterval);
      clearInterval(pickHeartInterval);
      return;
    }

    if(!monster.parentNode) {
      clearInterval(monsterMoveInterval);
      return;
    }

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // рандомный огненный шар
	 
  if(distance < 250 && Math.random() < 0.02){
  shootFireball(monsterX + 100, monsterY + 100);
}

if(monster && monster.parentNode && distance < 120 && monsterCanHit){

  monsterCanHit = false;

  // анимация атаки
  monster.style.transform = "scale(1.3)";
  setTimeout(()=>{
    monster.style.transform = "scale(1)";
  },200);

  // эффект удара
  player.style.filter = "brightness(0.4)";
  setTimeout(()=>{
    player.style.filter = "";
  },200);

  let hearts = document.querySelectorAll(".heart");

  // защита от багов
  if(typeof playerHP !== "undefined" && playerHP > 0){

    playerHP--;

    if(hearts[playerHP]){
      hearts[playerHP].remove();
    }
  }

  // смерть игрока
  if(typeof playerHP !== "undefined" && playerHP <= 0 && !window.gameOver){

    deaths++;
    localStorage.setItem("death", deaths);

    window.gameOver = true;
    gamePaused = true;

    let gameOver = document.createElement("div");

    gameOver.style.position = "fixed";
    gameOver.style.top = "0";
    gameOver.style.left = "0";
    gameOver.style.width = "100%";
    gameOver.style.height = "100%";
    gameOver.style.background = "rgba(0,0,0,0.85)";
    gameOver.style.display = "flex";
    gameOver.style.flexDirection = "column";
    gameOver.style.alignItems = "center";
    gameOver.style.justifyContent = "center";
    gameOver.style.zIndex = "999999";

    document.body.appendChild(gameOver);

    let text = document.createElement("div");

    text.innerText = "YOU LOST";
    text.style.fontSize = "80px";
    text.style.color = "red";
    text.style.fontWeight = "bold";
    text.style.marginBottom = "40px";
    text.style.transform = "scale(0)";
    text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

btn.onclick = function(){

  // 💥 БЕРЁМ АКТУАЛЬНЫЕ ДАННЫЕ (на всякий случай)
  let currentCoins = coins;
  let currentKills = kills;
  let currentDeaths = deaths;

  console.log("SAVE:", currentCoins, currentKills, currentDeaths);

  // 💾 СОХРАНЯЕМ
  localStorage.setItem("money", currentCoins);
  localStorage.setItem("kill", currentKills);
  localStorage.setItem("death", currentDeaths);

  // 🔄 перезапуск
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- CONTINUE ЛОГИКА --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};
    btn.onclick = function(){
      localStorage.setItem("coins", coins);
      localStorage.setItem("kill", kills);
      localStorage.setItem("death", deaths);
      location.reload();
    };

    setTimeout(()=>{
      text.style.transform = "scale(1)";
    },50);
  }

  setTimeout(()=>{
    monsterCanHit = true;
  },1000);
}

  }, 16);
  

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e) => {

    if(e.button !== 0) return;
    if(!monster.parentNode) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(() => {
        if(monster.parentNode){
          monster.style.filter = "";
        }
      }, 150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){

        kills++;
        localStorage.setItem("kill", kills);

        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");

        // награда в коинах
        let lostHP = startHP - currentPlayerHP;
        let reward = 0;

        if(lostHP === 0){
          reward = 30;
        } else if(lostHP === 1){
          reward = 20;
        } else if(lostHP === 2){
          reward = 10;
        } else {
          reward = 5;
        }

        coins += reward;
        localStorage.setItem("money", coins);

        let moneyUI = document.getElementById("money_ui");
        if(moneyUI){
          moneyUI.innerText = coins;
        }

        // монета
        let coin = document.createElement("img");
        coin.src = "../images/coin.png";
        coin.style.position = "absolute";
        coin.style.left = monsterX + "px";
        coin.style.top = monsterY + "px";
        coin.style.width = "50px";
        coin.style.zIndex = "20";

        document.querySelector(".map").appendChild(coin);

        setTimeout(() => {
          if(coin.parentNode){
            coin.remove();
          }
        }, 5000);

        // выпадение сердца
        let heart = document.createElement("img");
        heart.src = "../images/stam111.png";
        heart.className = "dropHeart";
        heart.style.position = "absolute";
        heart.style.left = monsterX + "px";
        heart.style.top = monsterY + "px";
        heart.style.width = "60px";
        heart.style.zIndex = "20";

        document.querySelector(".map").appendChild(heart);

        // вспышка
        let flash = document.createElement("div");
        flash.className = "flashEffect";
        document.querySelector(".map").appendChild(flash);

        setTimeout(() => {
          flash.remove();
        }, 400);

        // взрыв
        createExplosion(monsterX, monsterY);

        let victory = document.createElement("div");
        victory.id = "roundVictory";
        victory.innerText = "ROUND 2 ";

        document.body.appendChild(victory);
      }
    }

  });

}, 70000);


// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct2.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 9;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);



// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------



setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove();

       if(playerHP < 6){
        playerHP++;

        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 3  ";

document.body.appendChild(victory);




      }

    }

  });

},100000);

// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct3.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 9;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);



// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
		
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove(); // убрать сердце

      if(playerHP < 6){
        playerHP++;

        // добавить сердце в панель HP
        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 4  ";

document.body.appendChild(victory);




      }

    }

  });

},150000);



// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct4.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 12;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);



// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
		
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove(); // убрать сердце

      if(playerHP < 6){
        playerHP++;

        // добавить сердце в панель HP
        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 5  ";

document.body.appendChild(victory);




      }

    }

  });

},250000);


// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct5.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 12;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";
gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
		
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove(); // убрать сердце

      if(playerHP < 6){
        playerHP++;

        // добавить сердце в панель HP
        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 6  ";

document.body.appendChild(victory);




      }

    }

  });

},300000);



// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct6.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 14;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
		
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove(); // убрать сердце

      if(playerHP < 6){
        playerHP++;

        // добавить сердце в панель HP
        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 7  ";

document.body.appendChild(victory);




      }

    }

  });

},400000);


// ---------------- MONSTER ----------------

setTimeout(() => {

  let monster = document.createElement("img");
  monster.src = "../images/monct7.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "300px";

  monster.style.zIndex = "10";

  // HP монстра
  let monsterHP = 16;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";

  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 6;

  // движение и атака
  setInterval(() => {

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

    monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    // позиция HP
    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    // атака монстра
    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      // анимация атаки
      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      // игрок получает урон
      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }
if(playerHP <= 0 && !window.gameOver){
deaths++;
localStorage.setItem("death", deaths);
window.gameOver = true;
gamePaused = true;

// затемнение
let gameOver = document.createElement("div");

gameOver.style.position = "fixed";
gameOver.style.top = "0";
gameOver.style.left = "0";
gameOver.style.width = "100%";
gameOver.style.height = "100%";
gameOver.style.background = "rgba(0,0,0,0.85)";
gameOver.style.display = "flex";
gameOver.style.flexDirection = "column";
gameOver.style.alignItems = "center";
gameOver.style.justifyContent = "center";
gameOver.style.zIndex = "999999";

document.body.appendChild(gameOver);


// текст
let text = document.createElement("div");

text.innerText = "YOU LOST";
text.style.fontSize = "80px";
text.style.color = "red";
text.style.fontWeight = "bold";
text.style.marginBottom = "40px";
text.style.transform = "scale(0)";
text.style.transition = "0.4s";

gameOver.appendChild(text);

// -------- RESTART --------
let btn = document.createElement("div");

btn.innerText = "RESTART";
btn.style.background = "#8db4d1";
btn.style.padding = "14px 30px";
btn.style.border = "2px solid #4b6b80";
btn.style.borderRadius = "12px";
btn.style.cursor = "pointer";
btn.style.fontWeight = "bold";
btn.style.fontSize = "18px";
btn.style.width = "200px";
btn.style.textAlign = "center";
btn.style.marginTop = "10px";
btn.style.transition = "0.2s";
btn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
btn.onmouseover = function(){
  btn.style.transform = "scale(1.07)";
};

btn.onmouseout = function(){
  btn.style.transform = "scale(1)";
};

// 🔥 CLICK
btn.onmousedown = function(){
  btn.style.transform = "scale(0.95)";
  btn.style.boxShadow = "0 2px 0 #4b6b80";
};

btn.onmouseup = function(){
  btn.style.transform = "scale(1.07)";
  btn.style.boxShadow = "0 5px 0 #4b6b80";
};

// логика
btn.onclick = function(){
  location.reload();
};

gameOver.appendChild(btn);


// -------- CONTINUE --------
let continueBtn = document.createElement("div");

continueBtn.innerText = "CONTINUE";
continueBtn.style.background = "#8db4d1";
continueBtn.style.padding = "14px 30px";
continueBtn.style.border = "2px solid #4b6b80";
continueBtn.style.borderRadius = "12px";
continueBtn.style.cursor = "pointer";
continueBtn.style.fontWeight = "bold";
continueBtn.style.fontSize = "18px";
continueBtn.style.width = "200px";
continueBtn.style.textAlign = "center";
continueBtn.style.marginTop = "12px";
continueBtn.style.transition = "0.2s";
continueBtn.style.boxShadow = "0 5px 0 #4b6b80";

// 🔥 HOVER
continueBtn.onmouseover = function(){
  continueBtn.style.transform = "scale(1.07)";
};

continueBtn.onmouseout = function(){
  continueBtn.style.transform = "scale(1)";
};

// 🔥 CLICK
continueBtn.onmousedown = function(){
  continueBtn.style.transform = "scale(0.95)";
  continueBtn.style.boxShadow = "0 2px 0 #4b6b80";
};

continueBtn.onmouseup = function(){
  continueBtn.style.transform = "scale(1.07)";
  continueBtn.style.boxShadow = "0 5px 0 #4b6b80";
};

gameOver.appendChild(continueBtn);


// -------- ЛОГИКА CONTINUE --------
continueBtn.onclick = function(){

  gameOver.remove();

  window.gameOver = false;
  gamePaused = false;

  // восстановить HP
  playerHP = 6;

  let heartsBox = document.querySelector(".hearts");

  if(heartsBox){
    heartsBox.innerHTML = "";

    for(let i = 0; i < playerHP; i++){
      let hp = document.createElement("img");
      hp.src = "../images/stam111.png";
      hp.className = "heart";
      heartsBox.appendChild(hp);
    }
  }
};

btn.onclick = function(){
location.reload();
};


// анимация
setTimeout(()=>{
text.style.transform = "scale(1)";
},50);

}
      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);

  // ---------------- УРОН ОТ МЕЧА ----------------

  document.addEventListener("mousedown", (e)=>{

    if(e.button !== 0) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 150){

      monsterHP--;

      monsterHPText.innerText = "HP: " + monsterHP;

      monster.style.filter = "brightness(2)";
      setTimeout(()=>{
        monster.style.filter = "";
      },150);

      console.log("Монстр получил урон");

      if(monsterHP <= 0){
kills++;
localStorage.setItem("kill", kills);
        monster.remove();
        monsterHPText.remove();

        console.log("Монстр убит");
		
			// награда в коинах
  let lostHP = startHP - playerHP;
  let reward = 0;

  if(lostHP === 0){
    reward = 30;
  } else if(lostHP === 1){
    reward = 20;
  } else if(lostHP === 2){
    reward = 10;
  } else {
    reward = 5;
  }

  coins += reward;

  let moneyUI = document.getElementById("money_ui");
  if(moneyUI){
    moneyUI.innerText = coins;
  }

  // монета
  let coin = document.createElement("img");
  coin.src = "../images/coin.png";
  coin.style.position = "absolute";
  coin.style.left = monsterX + "px";
  coin.style.top = monsterY + "px";
  coin.style.width = "50px";
  coin.style.zIndex = "20";

  document.querySelector(".map").appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
		
// ❤️ выпадение сердца
let heart = document.createElement("img");

heart.src = "../images/stam111.png";
heart.className = "dropHeart";

heart.style.position = "absolute";
heart.style.left = monsterX + "px";
heart.style.top = monsterY + "px";
heart.style.width = "60px";
heart.style.zIndex = "20";

document.querySelector(".map").appendChild(heart);

// ---------------- PICK HEART ----------------

setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  let hearts = document.querySelectorAll(".dropHeart");

  hearts.forEach((heart)=>{

    let p = player.getBoundingClientRect();
    let h = heart.getBoundingClientRect();

    if(
      p.left < h.right &&
      p.right > h.left &&
      p.top < h.bottom &&
      p.bottom > h.top
    ){

      heart.remove(); // убрать сердце

      if(playerHP < 6){
        playerHP++;

        // добавить сердце в панель HP
        let hp = document.createElement("img");
        hp.src = "../images/stam111.png";
        hp.className = "heart";

        document.querySelector(".hearts").appendChild(hp);
      }

    }

  });

},100);

// вспышка
let flash = document.createElement("div");
flash.className = "flashEffect";
document.querySelector(".map").appendChild(flash);

setTimeout(()=>{
flash.remove();
},400);

let victory = document.createElement("div");
victory.id = "roundVictory";
victory.innerText = "ROUND 8  ";

document.body.appendChild(victory);




      }

    }

  });

},450000);


// ==========================
// 🎮 ПАУЗА ИГРЫ (ФИНАЛ)
// ==========================

let gamePaused = false;
let soundOn = true;


// ==========================
// 💀 ЖЁСТКАЯ ОСТАНОВКА ИГРЫ
// ==========================

// перехват setInterval
const _setInterval = window.setInterval;

window.setInterval = function(fn, time){
  return _setInterval(function(){
    if(gamePaused) return;
    fn();
  }, time);
};


// перехват requestAnimationFrame
const _raf = window.requestAnimationFrame;

window.requestAnimationFrame = function(callback){
  return _raf(function(time){
    if(gamePaused) return;
    callback(time);
  });
};


// ==========================
// ⛔ ПРАВИЛЬНЫЙ БЛОК КЛИКОВ
// ==========================

document.addEventListener("click", function(e){

  if(gamePaused){

    // ✅ меню паузы
    if(pauseMenu && pauseMenu.contains(e.target)) return;

    // ✅ кнопка паузы
    if(e.target === pauseBtn) return;

    // ✅ экран проигрыша (ГЛАВНОЕ)
    if(window.gameOver && window.gameOver.contains(e.target)) return;

    e.stopImmediatePropagation();
    e.preventDefault();
  }

}, true);


// блок клавиатуры
document.addEventListener("keydown", function(e){

  if(gamePaused){
    e.stopImmediatePropagation();
    e.preventDefault();
  }

}, true);


// ==========================
// ⏸ КНОПКА ПАУЗЫ
// ==========================

const pauseBtn = document.createElement("div");

pauseBtn.innerText = "⏸";
pauseBtn.style.position = "fixed";
pauseBtn.style.left = "20px";
pauseBtn.style.bottom = "20px";
pauseBtn.style.width = "50px";
pauseBtn.style.height = "50px";
pauseBtn.style.background = "#d9c9a3";
pauseBtn.style.border = "3px solid #6b4f2a";
pauseBtn.style.borderRadius = "10px";
pauseBtn.style.display = "flex";
pauseBtn.style.alignItems = "center";
pauseBtn.style.justifyContent = "center";
pauseBtn.style.fontSize = "24px";
pauseBtn.style.cursor = "pointer";
pauseBtn.style.zIndex = "9999";

document.body.appendChild(pauseBtn);


// ==========================
// 🌑 OVERLAY
// ==========================

const pauseOverlay = document.createElement("div");

pauseOverlay.style.position = "fixed";
pauseOverlay.style.top = "0";
pauseOverlay.style.left = "0";
pauseOverlay.style.width = "100%";
pauseOverlay.style.height = "100%";
pauseOverlay.style.background = "rgba(0,0,0,0.6)";
pauseOverlay.style.display = "none";
pauseOverlay.style.justifyContent = "center";
pauseOverlay.style.alignItems = "center";
pauseOverlay.style.zIndex = "10000";

document.body.appendChild(pauseOverlay);


// ==========================
// 📦 МЕНЮ
// ==========================



const pauseMenu = document.createElement("div");
pauseMenu.id = "pauseMenu";
pauseMenu.style.background = "#efe3c5";
pauseMenu.style.border = "4px solid #6b4f2a";
pauseMenu.style.borderRadius = "12px";
pauseMenu.style.padding = "30px";
pauseMenu.style.display = "flex";
pauseMenu.style.flexDirection = "column";
pauseMenu.style.gap = "15px";
pauseMenu.style.width = "220px";
pauseMenu.style.textAlign = "center";

pauseOverlay.appendChild(pauseMenu);
// ==========================
// 🚫 БЛОК КЛИКОВ МЕНЮ (FIX)
// ==========================

["mousedown","mouseup","click","mousemove"].forEach(event => {

  pauseMenu.addEventListener(event, function(e){
    e.stopPropagation();
    e.stopImmediatePropagation();
  });

  pauseOverlay.addEventListener(event, function(e){
    e.stopPropagation();
    e.stopImmediatePropagation();
  });

});
// ==========================
// 🔘 КНОПКИ
// ==========================

function createButton(text){

  let btn = document.createElement("div");

  btn.innerText = text;
  btn.style.background = "#8db4d1";
  btn.style.border = "2px solid #4b6b80";
  btn.style.borderRadius = "8px";
  btn.style.padding = "10px";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "bold";

  return btn;
}

const resumeBtn = createButton("Продолжить игру");
const soundBtn = createButton("Выключить звук");
const saveBtn = createButton("Сохранить игру");
const exitBtn = createButton("Выйти из игры");

pauseMenu.appendChild(resumeBtn);
pauseMenu.appendChild(soundBtn);
pauseMenu.appendChild(saveBtn);
pauseMenu.appendChild(exitBtn);


// ==========================
// ▶️ ПАУЗА
// ==========================

pauseBtn.onclick = function(){

  gamePaused = true;
  pauseOverlay.style.display = "flex";

};


// ▶️ ПРОДОЛЖИТЬ
resumeBtn.onclick = function(){

  gamePaused = false;
  pauseOverlay.style.display = "none";

};


// ==========================
// 🔊 ЗВУК
// ==========================

soundBtn.onclick = function(){

  soundOn = !soundOn;

  document.querySelectorAll("audio").forEach(a=>{
    a.muted = !soundOn;
  });

  soundBtn.innerText = soundOn ? "Выключить звук" : "Включить звук";
};


// ==========================
// 💾 СЕЙВ
// ==========================

saveBtn.onclick = function(){

  let save = {
    coins: typeof coins !== "undefined" ? coins : 0,
    kills: typeof kills !== "undefined" ? kills : 0,
    deaths: typeof deaths !== "undefined" ? deaths : 0,
    hp: typeof playerHP !== "undefined" ? playerHP : 6
  };

  // сохраняем основной сейв
  localStorage.setItem("arenaSave", JSON.stringify(save));

  // 🔥 синхронизация с магазином
  localStorage.setItem("money", save.coins);
  localStorage.setItem("kill", save.kills);
  localStorage.setItem("death", save.deaths);

  // уведомление
  let text = document.createElement("div");

  text.innerText = " Игра сохранена";
  text.style.position = "fixed";
  text.style.top = "20%";
  text.style.left = "50%";
  text.style.transform = "translate(-50%)";
  text.style.background = "#d9c9a3";
  text.style.border = "3px solid #6b4f2a";
  text.style.borderRadius = "10px";
  text.style.padding = "10px 20px";
  text.style.fontWeight = "bold";
  text.style.zIndex = "99999";

  document.body.appendChild(text);

  setTimeout(()=>text.remove(), 1500);
};

// ==========================
// 📥 ЗАГРУЗКА
// ==========================

let load = localStorage.getItem("arenaSave");

if(load){

  let data = JSON.parse(load);

  if(typeof coins !== "undefined") coins = data.coins || 0;
  if(typeof kills !== "undefined") kills = data.kills || 0;
  if(typeof playerHP !== "undefined") playerHP = data.hp || 6;

}


// ==========================
// 🚪 ВЫХОД
// ==========================

exitBtn.onclick = function(){
  location.reload();
};
// ==========================
// 💎 КРАСИВОЕ БОЛЬШОЕ МЕНЮ
// ==========================
setTimeout(() => {

  // ===== МЕНЮ =====
  pauseMenu.style.width = "380px";            // чуть больше
  pauseMenu.style.padding = "30px";
  pauseMenu.style.borderRadius = "22px";

  pauseMenu.style.background = "linear-gradient(#f5e6c8, #e6d3a3)";
  pauseMenu.style.border = "4px solid #8b6a3f";
  pauseMenu.style.boxShadow = "0 15px 40px rgba(0,0,0,0.5)";

  pauseMenu.style.display = "flex";
  pauseMenu.style.flexDirection = "column";
  pauseMenu.style.alignItems = "center";
  pauseMenu.style.gap = "15px";

  // ===== КНОПКИ =====
  let buttons = pauseMenu.children;

  for (let i = 0; i < buttons.length; i++) {

    let btn = buttons[i];

    btn.style.width = "260px";
    btn.style.padding = "16px";
    btn.style.fontSize = "19px";
    btn.style.fontWeight = "bold";

    btn.style.borderRadius = "14px";
    btn.style.color = "#2c3e50";

    // 🔥 красивый градиент
    btn.style.background = "linear-gradient(#b9d8ef, #8fc0e3)";
    btn.style.border = "2px solid #4b6b80";

    // 🔥 мягкая тень
    btn.style.boxShadow = "0 5px 0 #4b6b80";
    btn.style.transition = "all 0.15s ease";

    // ===== ХОВЕР =====
    btn.onmouseover = () => {
      btn.style.background = "linear-gradient(#d3ecff, #a9d3f5)";
      btn.style.transform = "translateY(-2px)";
    };

    btn.onmouseout = () => {
      btn.style.background = "linear-gradient(#b9d8ef, #8fc0e3)";
      btn.style.transform = "translateY(0)";
    };

    // ===== НАЖАТИЕ =====
    btn.onmousedown = () => {
      btn.style.transform = "translateY(2px)";
      btn.style.boxShadow = "0 2px 0 #4b6b80";
    };

    btn.onmouseup = () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 5px 0 #4b6b80";
    };

  }

}, 100);


// блок мыши (на всякий случай)
document.addEventListener("mousedown", function(e){

  if(gamePaused){
    if(!pauseMenu.contains(e.target)){
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }

}, true);


// блок клавиатуры
document.addEventListener("keydown", function(e){

  if(gamePaused){
    e.stopImmediatePropagation();
    e.preventDefault();
  }

}, true);





function startArenaTimer(){

let timer = document.createElement("div");

timer.style.position = "fixed";
timer.style.top = "50%";
timer.style.left = "50%";
timer.style.transform = "translate(-50%, -50%)";
timer.style.fontSize = "120px";
timer.style.fontWeight = "bold";
timer.style.color = "white";
timer.style.zIndex = "1";
timer.style.textShadow = "0 0 20px white";

document.body.appendChild(timer);

let time = 10;

let interval = setInterval(()=>{

timer.innerText = time;

time--;

if(time < 0){

clearInterval(interval);

timer.innerText = "START!";

timer.style.color = "#00ff88";
timer.style.fontSize = "140px";

setTimeout(()=>{
timer.remove();
},1500);

}

},1000);
}



let waitPlayer = setInterval(()=>{

let player = document.querySelector("#player_field img");

if(player){

clearInterval(waitPlayer);

startArenaTimer();

}

},500);

function createMonster() {

  let monster = document.createElement("img");
  monster.src = "../images/monct0.png";
  monster.className = "monster";

  document.querySelector(".map").appendChild(monster);

  let monsterX = 500;
  let monsterY = 300;

  monster.style.position = "absolute";
  monster.style.left = monsterX + "px";
  monster.style.top = monsterY + "px";
  monster.style.width = "200px";
  monster.style.height = "200px";
  monster.style.zIndex = "10";

  let monsterHP = 5;

  let monsterHPText = document.createElement("div");
  monsterHPText.style.position = "absolute";
  monsterHPText.style.color = "white";
  monsterHPText.style.fontSize = "22px";
  monsterHPText.style.fontWeight = "bold";
  monsterHPText.style.zIndex = "11";
  monsterHPText.innerText = "HP: " + monsterHP;

  document.querySelector(".map").appendChild(monsterHPText);

  let monsterCanHit = true;
  let playerHP = 3;

  setInterval(() => {

    if(gamePaused) return;

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let playerRect = player.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    let dx = playerRect.x - monsterRect.x;
    let dy = playerRect.y - monsterRect.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    let speed = 3;

    if(distance > 1){
      monsterX += (dx / distance) * speed;
      monsterY += (dy / distance) * speed;
    }

   
 monster.style.left = monsterX + "px";
    monster.style.top = monsterY + "px";

    monsterHPText.style.left = monsterX + "px";
    monsterHPText.style.top = (monsterY - 30) + "px";

    if(distance < 120 && monsterCanHit){

      monsterCanHit = false;

      monster.style.transform = "scale(1.3)";
      setTimeout(()=>{
        monster.style.transform = "scale(1)";
      },200);

      player.style.filter = "brightness(0.4)";
      setTimeout(()=>{
        player.style.filter = "";
      },200);

      let hearts = document.querySelectorAll(".heart");

      if(playerHP > 0){
        playerHP--;
        if(hearts[playerHP]){
          hearts[playerHP].remove();
        }
      }

      if(playerHP <= 0){
        alert("Игрок проиграл");
        window.location.reload();
      }

      setTimeout(()=>{
        monsterCanHit = true;
      },1000);
    }

  },16);
}









// ---------- ИНФОРМАЦИЯ ОБ ОРУЖИИ ----------

// создание окна
let weaponInfo = document.createElement("div");

weaponInfo.style.position = "fixed";
weaponInfo.style.top = "0";
weaponInfo.style.left = "0";
weaponInfo.style.width = "100%";
weaponInfo.style.height = "100%";
weaponInfo.style.background = "rgba(0,0,0,0.6)";
weaponInfo.style.display = "none";
weaponInfo.style.alignItems = "center";
weaponInfo.style.justifyContent = "center";
weaponInfo.style.zIndex = "99999";

document.body.appendChild(weaponInfo);


// окно внутри
let weaponBox = document.createElement("div");

weaponBox.style.background = "#efe3c5";
weaponBox.style.border = "4px solid #6b4f2a";
weaponBox.style.borderRadius = "12px";
weaponBox.style.padding = "25px";
weaponBox.style.textAlign = "center";
weaponBox.style.width = "260px";

weaponInfo.appendChild(weaponBox);


// название
let weaponName = document.createElement("h2");
weaponBox.appendChild(weaponName);


// характеристики
let weaponStats = document.createElement("div");
weaponStats.style.margin = "15px 0";
weaponBox.appendChild(weaponStats);


// кнопка закрыть
let closeBtn = document.createElement("button");

closeBtn.innerText = "Закрыть";
closeBtn.style.background = "#8db4d1";
closeBtn.style.border = "2px solid #4b6b80";
closeBtn.style.borderRadius = "8px";
closeBtn.style.padding = "8px 15px";
closeBtn.style.cursor = "pointer";

weaponBox.appendChild(closeBtn);

closeBtn.onclick = function(){
weaponInfo.style.display = "none";
};

function showWeaponInfo(id){

if(id === 1){
weaponName.innerText = "Вилы";
weaponStats.innerText = "⚔ Урон +1\n💡 Слабое оружие";
}

if(id === 2){
weaponName.innerText = "Гром";
weaponStats.innerText = "⚔ Урон +2\n💡 Быстрое оружие";
}

if(id === 3){
weaponName.innerText = "Клык";
weaponStats.innerText = "⚔ Урон +3\n💡 Острое оружие";
}

if(id === 4){
weaponName.innerText = "Леденец";
weaponStats.innerText = "⚡ Скорость +1\n💡 Очень быстрое";
}

if(id === 5){
weaponName.innerText = "Клинок";
weaponStats.innerText = "⚔ Урон +4\n💡 Сильное оружие";
}

if(id === 6){
weaponName.innerText = "Жезл";
weaponStats.innerText = "✨ Урон +5\n💡 Магическое оружие";
}

weaponInfo.style.display = "flex";
}

// ---------- ИНФОРМАЦИЯ О СКИНАХ ----------

// создаём окно
let skinInfo = document.createElement("div");

skinInfo.style.position = "fixed";
skinInfo.style.top = "0";
skinInfo.style.left = "0";
skinInfo.style.width = "100%";
skinInfo.style.height = "100%";
skinInfo.style.background = "rgba(0,0,0,0.6)";
skinInfo.style.display = "none";
skinInfo.style.alignItems = "center";
skinInfo.style.justifyContent = "center";
skinInfo.style.zIndex = "99999";

document.body.appendChild(skinInfo);


// окно внутри
let skinBox = document.createElement("div");

skinBox.style.background = "#efe3c5";
skinBox.style.border = "4px solid #6b4f2a";
skinBox.style.borderRadius = "12px";
skinBox.style.padding = "25px";
skinBox.style.textAlign = "center";
skinBox.style.width = "260px";

skinInfo.appendChild(skinBox);


// название
let skinName = document.createElement("h2");
skinBox.appendChild(skinName);


// характеристики
let skinStats = document.createElement("div");
skinStats.style.margin = "15px 0";
skinBox.appendChild(skinStats);


// кнопка закрыть
let closeBtnSkin = document.createElement("button");

closeBtnSkin.innerText = "Закрыть";
closeBtnSkin.style.background = "#8db4d1";
closeBtnSkin.style.border = "2px solid #4b6b80";
closeBtnSkin.style.borderRadius = "8px";
closeBtnSkin.style.padding = "8px 15px";
closeBtnSkin.style.cursor = "pointer";

skinBox.appendChild(closeBtnSkin);

closeBtnSkin.onclick = function(){
skinInfo.style.display = "none";
};
function showSkinInfo(id){

if(id === 1){
skinName.innerText = "Страж";
skinStats.innerText = "🛡 Защита +1\n💡 Древний защитник королевства";
}

if(id === 2){
skinName.innerText = "Викинг";
skinStats.innerText = "⚔ Урон +1\n💡 Воин с северных земель";
}

if(id === 3){
skinName.innerText = "Тень";
skinStats.innerText = "⚡ Скорость +1\n💡 Никто не видит его атаки";
}

if(id === 4){
skinName.innerText = "Шаман";
skinStats.innerText = "✨ Магия +2\n💡 Управляет силами духов";
}

if(id === 5){
skinName.innerText = "Бездна";
skinStats.innerText = "🛡 Защита +2\n💡 Существо из тёмного мира";
}

if(id === 6){
skinName.innerText = "Легенда";
skinStats.innerText = "⚔ Урон +3\n💡 Герой, о котором слагают мифы";
}

skinInfo.style.display = "flex";
}






// список купленных
let ownedSkins = JSON.parse(localStorage.getItem("ownedSkins")) || [];
let ownedWeapons = JSON.parse(localStorage.getItem("ownedWeapons")) || [];

// функция покупки
function buyItem(element, type, id){

  let price = parseInt(element.querySelector(".cena").innerText);

  if(coins < price){
    showNoMoney();
    return;
  }

  // списываем деньги
  coins -= price;

  // обновляем UI
  document.getElementById("money").innerText = coins;

  // сохраняем коины
  localStorage.setItem("arenaSave", JSON.stringify({
    coins: coins,
    kills: kills,
    deaths: deaths,
    hp: playerHP
  }));

  // сохраняем покупку
  if(type === "skin"){
    ownedSkins.push(id);
    localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
  }

  if(type === "weapon"){
    ownedWeapons.push(id);
    localStorage.setItem("ownedWeapons", JSON.stringify(ownedWeapons));
  }

  // меняем кнопку
  element.querySelector(".button-store").innerText = "Куплено";
}
function showNoMoney(){

  // затемнение фона
  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // окно
  let box = document.createElement("div");
  box.innerText = "❌ Недостаточно коинов";
  
  box.style.background = "#f3e6c9";
  box.style.border = "4px solid #6b4f2a";
  box.style.borderRadius = "15px";
  box.style.padding = "20px 40px";
  box.style.fontSize = "22px";
  box.style.fontWeight = "bold";
  box.style.color = "#3b2a18";
  box.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
  box.style.transform = "scale(0.5)";
  box.style.transition = "0.3s";

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // анимация появления
  setTimeout(()=>{
    box.style.transform = "scale(1)";
  }, 50);

  // закрытие по клику
  overlay.onclick = function(){
    overlay.remove();
  };

  // авто закрытие
  setTimeout(()=>{
    overlay.remove();
  }, 1500);
}

function showBuyMessage(type){

  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999999";

  let text = document.createElement("div");

  if(type === "skin"){
    text.innerText = "✅ Куплен новый скин";
  }

  if(type === "weapon"){
    text.innerText = "⚔ Куплено новое оружие";
  }

  text.style.background = "#d9c9a3";
  text.style.border = "4px solid #6b4f2a";
  text.style.borderRadius = "15px";
  text.style.padding = "20px 40px";
  text.style.fontSize = "22px";
  text.style.fontWeight = "bold";
  text.style.color = "#3b2a18";
  text.style.boxShadow = "0 0 25px rgba(0,0,0,0.5)";
  text.style.transform = "scale(0.5)";
  text.style.transition = "0.3s";

  overlay.appendChild(text);
  document.body.appendChild(overlay);

  setTimeout(()=>{
    text.style.transform = "scale(1)";
  },50);

  setTimeout(()=>{
    overlay.remove();
  },1500);
}




// ==========================
// ✨ АНИМАЦИЯ КНОПОК (SAFE)
// ==========================

setTimeout(()=>{

  let buttons = document.querySelectorAll("#pauseMenu div");

  buttons.forEach(btn => {

    btn.style.transition = "0.2s";

    btn.addEventListener("mouseenter", ()=>{
      btn.style.transform = "scale(1.05)";
      btn.style.boxShadow = "0 0 10px #8db4d1";
    });

    btn.addEventListener("mouseleave", ()=>{
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "none";
    });

    btn.addEventListener("mousedown", ()=>{
      btn.style.transform = "scale(0.95)";
    });

    btn.addEventListener("mouseup", ()=>{
      btn.style.transform = "scale(1.05)";
    });

  });

}, 500);





// ==========================
// 🎮 АНИМАЦИЯ КНОПОК
// ==========================

window.addEventListener("load", function(){

  const playBtn = document.querySelector(".button-menu");
  const exitBtn = document.querySelector(".exit-menu");

  // ===== ИГРАТЬ =====
  if(playBtn){

    playBtn.style.transition = "all 0.2s ease";

    playBtn.addEventListener("mouseenter", function(){
      playBtn.style.transform = "scale(1.1)";
      playBtn.style.background = "#5fa8ff";
      playBtn.style.boxShadow = "0 0 20px rgba(0,150,255,0.8)";
    });

    playBtn.addEventListener("mouseleave", function(){
      playBtn.style.transform = "scale(1)";
      playBtn.style.background = "#8db4d1"; // твой обычный цвет
      playBtn.style.boxShadow = "none";
    });

  }

  // ===== ВЫЙТИ =====
  if(exitBtn){

    exitBtn.style.transition = "all 0.2s ease";

    exitBtn.addEventListener("mouseenter", function(){
      exitBtn.style.transform = "scale(1.1)";
      exitBtn.style.background = "#ff6b6b";
      exitBtn.style.boxShadow = "0 0 20px rgba(255,80,80,0.8)";
    });

    exitBtn.addEventListener("mouseleave", function(){
      exitBtn.style.transform = "scale(1)";
      exitBtn.style.background = "#d98d8d"; // твой обычный цвет
      exitBtn.style.boxShadow = "none";
    });

  }

});

// ===== НАВЕДЕНИЕ НА КНОПКИ =====

function addHoverEffect(selector){

  let buttons = document.querySelectorAll(selector);

  buttons.forEach(btn => {

    btn.onmouseenter = function(){
      this.style.transform = "scale(1.08)";
      this.style.filter = "brightness(1.1)";
      this.style.cursor = "pointer";
    };

    btn.onmouseleave = function(){
      this.style.transform = "scale(1)";
      this.style.filter = "brightness(1)";
    };

  });

}

// применяем
setTimeout(()=>{
  addHoverEffect(".button-store");
  addHoverEffect(".button-menu");
  addHoverEffect(".exit-menu");
}, 500);


// ==========================
// ✨ НАВЕДЕНИЕ НА КНОПКИ КУПИТЬ / ПРОДАНО
// ==========================

function enableStoreButtonsHover(){

  let buttons = document.querySelectorAll(".button-store");

  buttons.forEach((btn) => {

    // чтобы кнопка точно ловила мышку
    btn.style.pointerEvents = "auto";
    btn.style.transition = "all 0.2s ease";

    btn.onmouseenter = function(){
      this.style.transform = "scale(1.08)";
      this.style.filter = "brightness(1.1)";
      this.style.boxShadow = "0 0 15px rgba(255,255,255,0.35)";
      this.style.cursor = "pointer";
    };

    btn.onmouseleave = function(){
      this.style.transform = "scale(1)";
      this.style.filter = "brightness(1)";
      this.style.boxShadow = "none";
    };

  });

}

// запуск сразу
setTimeout(function(){
  enableStoreButtonsHover();
}, 300);

// и ещё раз после покупок / изменений
setInterval(function(){
  enableStoreButtonsHover();
}, 1000);








// ==========================
// ✔ "ВЫ УЖЕ КУПИЛИ" ДЛЯ КНОПКИ "ПРОДАНО"
// ==========================

function showSold(){

  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  let box = document.createElement("div");
  box.innerText = "✔ Вы уже купили";

  box.style.background = "#f3e6c9";
  box.style.border = "4px solid #6b4f2a";
  box.style.borderRadius = "15px";
  box.style.padding = "20px 40px";
  box.style.fontSize = "22px";
  box.style.fontWeight = "bold";
  box.style.color = "#3b2a18";
  box.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
  box.style.transform = "scale(0.5)";
  box.style.transition = "0.3s";

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  setTimeout(() => {
    box.style.transform = "scale(1)";
  }, 50);

  overlay.onclick = function(){
    overlay.remove();
  };

  setTimeout(() => {
    overlay.remove();
  }, 1500);
}


// ==========================
// ЛОВИМ КЛИК ПО "ПРОДАНО"
// ==========================

document.addEventListener("click", function(e){

  let btn = e.target;

  if(btn.classList.contains("button-store") && btn.innerText.trim() === "Продано"){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showSold();
  }

}, true);





// ==========================
// 🔽 ЧУТЬ НИЖЕ КНОПКИ
// ==========================

window.addEventListener("load", function(){

    let play = document.querySelector(".button-menu");
    let exit = document.querySelector(".exit-menu");

    if(play){
        play.style.marginTop = "-2px"; // двигает вниз
    }

    if(exit){
        exit.style.marginTop = "-1px";
    }

});




// ==========================
// 💾 СТАБИЛЬНОЕ СОХРАНЕНИЕ
// ==========================

(function(){

  function saveGame(){
    try{
      localStorage.setItem("money", coins || 0);
      localStorage.setItem("kill", kills || 0);
      localStorage.setItem("death", deaths || 0);

      // пробуем взять HP из глобального окна
      if(typeof window.playerHP !== "undefined"){
        localStorage.setItem("hp", window.playerHP);
      }

      console.log("💾 Сохранено");
    }catch(e){
      console.log("Ошибка сохранения", e);
    }
  }

  // каждые 1 сек
  setInterval(saveGame, 1000);

  // 🔥 СОХРАНЕНИЕ ПРИ ПЕРЕЗАГРУЗКЕ
  window.addEventListener("beforeunload", saveGame);

})();



// ===============================
// 🎮 БЕЗОПАСНЫЕ АНИМАЦИИ
// ===============================

// 🧍‍♂️ ДЫХАНИЕ ИГРОКА
setInterval(() => {

  let player = document.querySelector("#player_field img");
  if(!player) return;

  // защита чтобы не ломало игру
  if(window.gameOver) return;

  player.style.transition = "0.2s";
  player.style.transform = "scale(1.03)";

  setTimeout(()=>{
    if(player){
      player.style.transform = "scale(1)";
    }
  },200);

}, 700);


// ⚔️ УДАР (БЕЗ ОШИБОК)
document.addEventListener("mousedown", (e)=>{

  if(e.button !== 0) return;

  let player = document.querySelector("#player_field img");
  if(!player) return;

  // 💥 ПРОСТО ЭФФЕКТ УДАРА (без меча)
  let rect = player.getBoundingClientRect();

  let hit = document.createElement("div");

  hit.style.position = "fixed";
  hit.style.left = rect.left + "px";
  hit.style.top = rect.top + "px";
  hit.style.width = "50px";
  hit.style.height = "50px";
  hit.style.borderRadius = "50%";
  hit.style.background = "radial-gradient(circle, yellow, red, transparent)";
  hit.style.zIndex = "9999";
  hit.style.pointerEvents = "none";

  document.body.appendChild(hit);

  setTimeout(()=>{
    if(hit) hit.remove();
  },150);

});


// 💢 ЭФФЕКТ ПРИ УДАРЕ ПО ИГРОКУ
function playerHitEffect(){

  let player = document.querySelector("#player_field img");
  if(!player) return;

  player.style.filter = "brightness(0.3)";

  setTimeout(()=>{
    if(player){
      player.style.filter = "";
    }
  },150);
}
// ===============================
// ⚔️ АНИМАЦИЯ + ЗВЁЗДОЧКИ (БЕЗ ШАРИКА)
// ===============================

document.addEventListener("mousedown", function(e){

  if(e.button !== 0) return;

  try{

    let player = document.querySelector("#player_field img");
    if(!player) return;

    let sword = document.querySelector(".sword");

    // ⚔️ анимация меча
    if(sword){
      sword.style.transform = "rotate(-30deg)";
      setTimeout(function(){
        sword.style.transform = "rotate(0deg)";
      },150);
    }

    // ⭐ звёздочки
    let rect = player.getBoundingClientRect();

    for(let i = 0; i < 4; i++){

      let star = document.createElement("div");
      star.innerText = "✦";

      star.style.position = "fixed";
      star.style.left = rect.left + "px";
      star.style.top = rect.top + "px";
      star.style.color = "yellow";
      star.style.fontSize = "20px";
      star.style.zIndex = "9999";

      document.body.appendChild(star);

      let x = (Math.random()*60)-30;
      let y = (Math.random()*60)-30;

      setTimeout(function(){
        star.style.transform = "translate("+x+"px,"+y+"px)";
        star.style.opacity = "0";
      },10);

      setTimeout(function(){
        star.remove();
      },300);
    }
	

  }catch(err){
    console.log(err);
  }

});





















