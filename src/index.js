//TESTING COMMIT FUNCTIONALITY

var express = require("express");
var app = express();

var server = require("http").createServer(app);
var io = require("socket.io")(server);

var physics = require("./physics");
var Puck = physics.Puck;

var abandonedChildren = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

console.log("Server started.");

Object.keys(io.sockets.sockets).forEach(function(s) {
  io.sockets.sockets[s].disconnect(true);
});

var ridge = {
  length: 230
};

var players = {};
var speedMultiplier = 300.0;
var playerSpeed = 2;
var levelSizeX = 1000;
var levelSizeY = 550;
var puckSize = 10;
var timer = -1;
var spells = {
  ridge: "ridge"
};

var speedMode = true;

var activeSpells = {};
var rechargeSpeed = 3;
var ridgeTime = 6;
var spellIndex = 0;
var fourPlayer = true;
var playerCount = 0;
var player1 = {};
var player2 = {};
var player3 = {};
var player4 = {};
var lobbyCount = 0;
var goalWidth = 120;
var winScore = 15;
var gameOn = false;
var win = -1;
var flags = {
  0: {
    x: 125,
    y: 275,
    team: 0,
    grabbed: false,
    scored: false
  },
  1: {
    x: 875,
    y: 275,
    team: 1,
    grabbed: false,
    scored: false
  }
};
var goals = {
  0: {
    x: 0,
    y: 0
  },
  1: {
    x: levelSizeX - goalWidth,
    y: 0
  }
};
var score = {
  0: 0,
  1: 0
};
var ID = function() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

io.on("connection", function(socket) {
  console.log("my id: " + socket.id);
  var sessionID = ID();
  players[sessionID] = {
    puck: new Puck()
  };
  socket.on("checkID", function(data) {
    console.log("checking");

    for (var child in abandonedChildren) {
      console.log("sessionID: " + abandonedChildren[child].id);
      console.log("data: " + data);
      if (abandonedChildren[child].id === data) {
        sessionID = abandonedChildren[child].id;
        socket.emit("playerRole", players[sessionID]);
        break;
      }
    }

    console.log("checkingggg");
    console.log("no id match");
    socket.emit("noIDmatch", sessionID);
  });
  socket.on("disconnect", function() {
    console.log("my id: " + socket.id);
    console.log("someone has left");
    if (players[sessionID]) {
      abandonedChildren.push(players[sessionID]);
    }
  });
  socket.on("newPlayer", function() {
    socket.emit("storeID", sessionID);
    console.log("my id: " + socket.id);
    var playerID = lobbyCount;
    var startingX = 75;
    var startingY = 275;
    players[sessionID] = {
      id: sessionID,
      title: "player",
      team: -1,
      playing: false,
      flagging: false,
      ready: false,
      spawnX: startingX,
      spawnY: startingY,
      x: startingX,
      y: startingY,
      prevX: 299,
      prevY: 299,
      xa: 0.0,
      ya: 0.0,
      won: false,
      aon: false,
      son: false,
      don: false,
      wclick: false,
      aclick: false,
      sclick: false,
      dclick: false,
      canBoost: true,
      holdingDownSpaceCheck: false,
      spell: "ridge",
      recharge: false,
      puck: new Puck(startingX, startingY)
    };
    socket.emit("playerRole", players[sessionID]);
    createPlayerLoop(players[sessionID]);
    console.log(sessionID);
    lobbyCount++;
  });
  socket.on("playerJoin", function() {
    var player = players[sessionID] || {};
    console.log("joining");
    if (playerCount === 0) {
      player1 = player;
      player1.playing = true;
      player1.team = 0;
      player1.x = 75;
      player1.puck.x = 75;
      player1.spawnX = 75;
      player1.y = 200;
      player1.puck.x = 200;
      player1.spawnX = 200;
      socket.emit("setTeam", 0);
      playerCount++;
      //console.log("player1 has entered");
    }
    if (playerCount === 1 && !player.playing) {
      player2 = player;
      player2.playing = true;
      player2.team = 0;
      player2.x = 75;
      player2.puck.x = 75;
      player2.spawnX = 75;
      player2.y = 300;
      player2.puck.y = 300;
      player2.spawnY = 300;

      socket.emit("setTeam", 0);
      playerCount++;
      console.log("player2 has entered");
    }
    if (playerCount === 2 && !player.playing) {
      player3 = player;
      player3.playing = true;
      player3.team = 1;
      player3.x = 925;
      player3.puck.x = 925;
      player3.spawnX = 925;
      player3.y = 200;
      player3.puck.y = 200;
      player3.spawnY = 200;

      socket.emit("setTeam", 1);
      playerCount++;
      console.log("player2 has entered");
    }
    if (playerCount === 3 && !player.playing) {
      player4 = player;
      player4.playing = true;
      player4.team = 1;
      player4.x = 925;
      player4.puck.x = 925;
      player4.spawnX = 925;
      player4.y = 300;
      player4.puck.y = 300;
      player4.spawnY = 300;

      socket.emit("setTeam", 1);
      playerCount++;
      console.log("player2 has entered");
    }
  });
  socket.on("playerReady", function() {
    var player = players[sessionID] || {};
    if (player.team !== -1) {
      player.ready = true;
    }
    if (speedMode) {
      gameOn = true;
    }
    if (
      player1.ready &&
      player2.ready &&
      player3.ready &&
      player4.ready &&
      !gameOn
    ) {
      timer = 3;
      player1.x = player1.spawnX;
      player1.y = player1.spawnY;
      player2.x = player2.spawnX;
      player2.y = player2.spawnY;
      player3.x = player3.spawnX;
      player3.y = player3.spawnY;
      player4.x = player4.spawnX;
      player4.y = player4.spawnY;
      player1.puck.x = player1.spawnX;
      player1.puck.y = player1.spawnY;
      player2.puck.x = player2.spawnX;
      player2.puck.y = player2.spawnY;
      player3.puck.x = player3.spawnX;
      player3.puck.y = player3.spawnY;
      player4.puck.x = player4.spawnX;
      player4.puck.y = player4.spawnY;

      var countdown = setInterval(function() {
        timer--;
        if (timer <= 0) {
          timer = -1;
          gameOn = true;
          clearInterval(countdown);
        }
      }, 1000);
    }
  });
  socket.on("movement", function(data) {
    var player = players[sessionID] || {};
    if (player.playing && gameOn) {
      var puck = player.puck;
      puck.aon = data.left;
      puck.won = data.up;
      puck.don = data.right;
      puck.son = data.down;
      puck.braking = data.brake;
      if (!data.boost) {
        player.holdingDownSpace = false;
      }
      if (player.canBoost && data.boost && !player.holdingDownSpace) {
        puck.boosted = data.boost;
        player.holdingDownSpace = true;
        player.canBoost = false;
        setTimeout(function() {
          player.canBoost = true;
        }, 3000);
      }
    }
  });
  socket.on("spell", function(data) {
    if (!data.left && !data.up && !data.right && !data.down) {
      return;
    }
    var player = players[sessionID] || {};
    if (player.playing && gameOn) {
      if (player.recharge) {
        return;
      }
      if (player.spell === "ridge") {
        drawRidge(player, data);
      }
      player.recharge = true;
      setTimeout(function() {
        player.recharge = false;
      }, rechargeSpeed * 1000);
    }
  });
});

function drawRidge(player, data) {
  if (data.up) {
    activeSpells[spellIndex] = {
      name: "ridge",
      leftX: player.x - 10,
      rightX: player.x + 10,
      bottomY: player.y - 25,
      topY: player.y - ridge.length,
      decay: new Date().getTime()
    };
    spellIndex += 1;
  } else if (data.left) {
    activeSpells[spellIndex] = {
      name: "ridge",
      leftX: player.x - ridge.length,
      rightX: player.x - 25,
      bottomY: player.y + 10,
      topY: player.y - 10,
      decay: new Date().getTime()
    };
    spellIndex += 1;
  } else if (data.right) {
    activeSpells[spellIndex] = {
      name: "ridge",
      leftX: player.x + 25,
      rightX: player.x + ridge.length,
      bottomY: player.y + 10,
      topY: player.y - 10,
      decay: new Date().getTime()
    };
    spellIndex += 1;
  } else {
    activeSpells[spellIndex] = {
      name: "ridge",
      leftX: player.x - 10,
      rightX: player.x + 10,
      bottomY: player.y + ridge.length,
      topY: player.y + 25,
      decay: new Date().getTime()
    };
    spellIndex += 1;
  }
}

function createPlayerLoop(player) {
  var lastUpdateTime = new Date().getTime();
  setInterval(function() {
    if (!gameOn || !player.playing) {
      lastUpdateTime = new Date().getTime();
      return;
    }
    var currentTime = new Date().getTime();
    var timeDifference = currentTime - lastUpdateTime;
    var puck = player.puck;
    puck.updatePosition2(timeDifference);
    puck.checkRidgeCollisions(activeSpells);

    player.x = puck.x;
    player.y = puck.y;

    lastUpdateTime = currentTime;
  }, 1000 / 60);
}

setInterval(function() {
  var hasScored = -1;
  for (var id in activeSpells) {
    var spell = activeSpells[id];
    if (spell.name === "ridge") {
      var currentTime = new Date().getTime();
      if (currentTime - spell.decay > ridgeTime * 1000) {
        console.log("deleting spell");
        delete activeSpells[id];
      }
    }
  }
  for (var id in players) {
    var player = players[id];
    if (!player.id === player1.id && !player.id === player2.id) {
      continue;
    }
    if (win === -1) {
      if (player.id === player1.id || player.id === player2.id) {
        if (
          Math.abs(player.x - flags[1].x) < 23 &&
          Math.abs(player.y - flags[1].y) < 23
        ) {
          flags[1].grabbed = true;
          player.flagging = true;
        }
        if (player.x < goalWidth && player.flagging) {
          hasScored = 0;
          player.flagging = false;
          flags[1].grabbed = false;
          score[0] += 1;
          if (score[0] === winScore) {
            win = 0;
          }
        }
      } else if (player.id === player3.id || player.id === player4.id) {
        if (
          Math.abs(player.x - flags[0].x) < 23 &&
          Math.abs(player.y - flags[0].y) < 23
        ) {
          flags[0].grabbed = true;
          player.flagging = true;
        }
        if (player.x > goals[1].x && player.flagging) {
          hasScored = 1;
          player.flagging = false;
          flags[0].grabbed = false;
          score[1] += 1;
          if (score[1] >= winScore) {
            win = 1;
          }
        }
      }
    }
  }

  //console.log("info");
  /*for (var id in players) {
    console.log(players[id].id);
  }*/
  //console.log(win);

  if (win !== -1) {
    score[0] = 0;
    score[1] = 0;
    for (var id in players) {
      var player = players[id];
      if (
        player.id === player1.id ||
        player.id === player2.id ||
        player.id === player3.id ||
        player.id === player4.id
      ) {
        player.playing = false;
        player.team = -1;
        player.flagging = false;
        player.ready = false;
        var puck = player.puck;
        puck.xa = 0.0;
        puck.ya = 0.0;
        puck.aon = false;
        puck.won = false;
        puck.don = false;
        puck.son = false;
      }
    }
    flags[0].grabbed = false;
    flags[1].grabbed = false;
    player1 = {};
    player2 = {};
    playerCount = 0;
    gameOn = false;
    setTimeout(function() {
      win = -1;
    }, 3000);
  }

  io.sockets.emit(
    "state",
    players,
    activeSpells,
    flags,
    goals,
    hasScored,
    score,
    win,
    player1.id,
    player2.id,
    player3.id,
    player4.id,
    timer,
    gameOn
  );
  hasScored = -1;
}, 1000 / 60);

server.listen(4141);
