// blocPONG
// Like pong but hella better
//
// Souma Mondal

//

var PI = Math.PI;
var ENDZONE = 30;
var PADDLE_WIDTH = 80;
var ANGLE_SCALE_FACTOR = PI / 24;

var OBJECT_BALL = 1,
    OBJECT_PLAYER = 2,
    OBJECT_COMPUTER = 4;

window.addEventListener("load", function() {
  Game.initialize("game", startGame);
});

var startGame = function() {
  Game.setBoard(0, new Banner("blocPONG",
                              "Press <space> to RAGE",
                              true,
                              playGame));
};

var playGame = function() {
  var gameBoard = new GameBoard();
  gameBoard.add( new Player(false) );
  gameBoard.add( new Computer(false) );
  gameBoard.add( new Ball() );
  Game.setBoard(0, new DummyBG(true) )
  Game.setBoard(1, gameBoard);
};

var Player = function(clear) {
  this.w = PADDLE_WIDTH;
  this.h = 5;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - ENDZONE;
  this.maxVel = 200;
  this.clear = clear;
};

Player.prototype = new Paddle();
Player.prototype.type = OBJECT_PLAYER;
Player.prototype.step = function(dt) {
  if(Game.keys["left"]) {
    this.vx = -this.maxVel;
  } else if(Game.keys["right"]) {
    this.vx = this.maxVel;
  } else {
    this.vx = 0;
  }
  this.x += this.vx * dt;

  if(this.x < 0) {
    this.x = 0;
  } else if(this.x > Game.width - this.w) {
    this.x = Game.width - this.w;
  }
};

var Computer = function(clear) {
  this.w = PADDLE_WIDTH;
  this.h = 5;
  this.x = (Game.width / 2) - (this.w / 2);
  this.y = ENDZONE - this.h;
  this.vx = 0;
  this.maxVel = 200;
  this.clear = clear;
  this.target = null;
};

Computer.prototype = new Paddle();
Computer.prototype.type = OBJECT_COMPUTER;
Computer.prototype.step = function(dt) {


  this.target = this.target || this.board.findBall(this);

  if (this.target.dead) {
    return;
  }

  // ball in comp side of court
  if (this.target.y + this.target.radius < Game.height / 3 &&
       this.target.vy < 0) {
    // ball to the right of comp
    if (this.target.x + this.target.radius > this.x + (this.w / 2) ) {
      this.vx += this.maxVel / 4;
      if (this.vx > this.maxVel / 2) {
        this.vx = this.maxVel / 2;
      }
    } else if (this.target.x + this.target.radius  < this.x + (this.w / 2) ) {
      this.vx -= this.maxVel / 4;
      if (this.vx < -this.maxVel / 2) {
        this.vx = -this.maxVel / 2;
      }
    }
  } else {
    this.vx = 0;
  }

  this.x += this.vx * dt;

  if(this.x < 0) {
    this.x = 0;
  } else if(this.x > Game.width - this.w) {
    this.x = Game.width - this.w;
  }

};

var Ball = function() {
  this.x = Game.width / 2;
  this.y = Game.height / 2;
  this.radius = 5;
  this.w = this.radius * 2;
  this.h = this.radius * 2;

  var magnitude = 200;
  var theta = PI / 4;
  this.vx = magnitude * Math.cos(theta);
  this.vy = magnitude * Math.sin(theta);
  this.radian = PI/4;
  this.dead = false;
};

Ball.prototype.type = OBJECT_BALL;

Ball.prototype.step = function(dt) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;

  // bounce off walls
  if (this.x < 0 || this.x + this.w > Game.width) {
    this.vx = -this.vx;
  }
  // pass through floor or ceiling
  if (this.y < 0 || this.y > Game.height - this.h) {
    this.board.remove(this);
  }

  // reflection is a strange one.
  // it is either an object or false
  var reflection;
  if (this.y + this.h > Game.height - ENDZONE && !this.dead) {
    reflection = this.board.reflect(this, OBJECT_PLAYER);
    reflection ? this.board.bounceAngle(this, reflection, OBJECT_PLAYER) : this.dead = true;
    if (this.dead) {
      Game.computerScore += 1;
      Game.setBoard(2, new ScoreBoard(playGame) );
    }
  }
  if (this.y < ENDZONE && !this.dead) {
    reflection = this.board.reflect(this, OBJECT_COMPUTER);
    reflection ? this.board.bounceAngle(this, reflection, OBJECT_COMPUTER) : this.dead = true;
    if (this.dead) {
      Game.playerScore += 1;
      Game.setBoard(2, new ScoreBoard(playGame) );
    }
  }
};

Ball.prototype.draw = function(ctx) {
  if (this.dead) {
    ctx.strokeStyle = "#FF0000";
    ctx.fillStyle = "#FF0000";
  } else {
    ctx.strokeStyle = "#00FF00";
    ctx.fillStyle = "#00FF00";
  }
  ctx.beginPath();
  ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, 2*Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
};
