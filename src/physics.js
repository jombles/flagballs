var dots = [
  [0, -25],
  [17.677, -17.677],
  [25, 0],
  [17.677, 17.677],
  [0, 25],
  [-17.677, 17.677],
  [-25, 0],
  [-17.677, -17.677]
];

class Puck {
  constructor(startingX, startingY) {
    this.levelSizeX = 1000;
    this.levelSizeY = 550;
    this.spawnX = startingX;
    this.spawnY = startingY;
    this.x = startingX;
    this.y = startingY;
    this.xd = 0;
    this.yd = 0;
    this.xa = 0.0;
    this.ya = 0.0;
    this.sx = 0.0;
    this.sy = 0.0;
    this.d = 0.0;
    this.m = 2;
    this.hX = startingX + 10;
    this.hY = startingY;
    this.prevX = startingX + 9;
    this.prevY = startingY - 1;
    this.aon = false;
    this.won = false;
    this.don = false;
    this.son = false;
    this.braking = false;
    this.speedMultiplier = 300.0;
    this.size = 10;
    this.locXSpeedMultiplier = 300.0;
    this.frictionXMultiplier = 300.0;
    this.locYSpeedMultiplier = 300.0;
    this.frictionYMultiplier = 300.0;
    this.boosted = false;
    this.boosting = false;
    this.fullBoostLoops = 0;
    this.maxSpeedMod = 6;
    this.globalSpeedMod = 0.6;
    this.controllerEnabled = false;
    this.controllerX = 0.0;
    this.controllerY = 0.0;
    this.controllerDist = 0.0;
    this.justBounced = false;
  }

  updatePositionC(timeDifference) {
    if (
      this.controllerX < 0.08 &&
      this.controllerX > -0.08 &&
      this.controllerY < 0.08 &&
      this.controllerY > -0.08
    ) {
      //console.log("no movment");
      this.calculateForce(-2, timeDifference);
    } else {
      //console.log("still moving for some reason");
      var radAngle = Math.atan2(-this.controllerX, -this.controllerY);
      var angle = radAngle * (180 / Math.PI) + 180;
      var hLength = Math.sqrt(
        this.controllerX * this.controllerX +
          this.controllerY * this.controllerY
      );

      this.controllerDist = hLength;
      this.calculateForce(angle, timeDifference);
    }
    if (this.x > this.levelSizeX - this.size) {
      this.x = this.levelSizeX - this.size;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.x < 5) {
      this.x = 5;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.y > this.levelSizeY - this.size) {
      this.y = this.levelSizeY - this.size;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
    if (this.y < 5) {
      this.y = 5;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
  }

  calculateForce(d, timeDifference) {
    if (
      (d === -1 || d === -2) &&
      this.sx < 1.3 &&
      this.sx > -1.3 &&
      this.sy < 1.3 &&
      this.sy > -1.3
    ) {
      this.sx = 0;
      this.sy = 0;
      return;
    }
    var speedMod = 1.4;
    var accelMod = 0.92;
    var radians = (d * Math.PI) / 180.0;
    var friction = 0;
    friction = Math.atan2(-this.xa, -this.ya);
    if (d === -1 || d === -2) {
      radians = friction;
    }
    var xFriction = (8 * Math.sin(friction)) / timeDifference;
    var xChange = (8 * Math.sin(radians)) / timeDifference;
    var yFriction = (8 * Math.cos(friction)) / timeDifference;
    var yChange = (8 * Math.cos(radians)) / timeDifference;

    if (xChange < 0.01 && xChange > -0.01) {
      xChange = xFriction;
    }
    if (yChange < 0.01 && yChange > -0.01) {
      yChange = yFriction;
    }

    this.sy += (yChange * accelMod) / 2.5;
    this.sx += (xChange * accelMod) / 2.5;
    if (this.sx > this.maxSpeedMod) {
      this.sx = this.maxSpeedMod;
    }
    if (this.sx < -this.maxSpeedMod) {
      this.sx = -this.maxSpeedMod;
    }
    if (this.sy > this.maxSpeedMod) {
      this.sy = this.maxSpeedMod;
    }
    if (this.sy < -this.maxSpeedMod) {
      this.sy = -this.maxSpeedMod;
    }
    /*if (d <= 90) {
      this.sy += xChange / 10;
      this.sa += yChange / 10;
    } else if (d <= 180) {
      this.sx -= xChange / 10;
      this.sy += yChange / 10;
    } else if (d <= 270) {
      this.sx -= xChange / 10;
      this.sy -= yChange / 10;
    } else {
      this.sx += xChange / 10;
      this.sy += yChange / 10;
    }*/
    var brakeSMod = 2.15;
    var brakeAMod = 1.05;
    var boostSMod = 1.0;
    var boostAMod = 1.0;

    if (this.boosted && !this.boosting) {
      this.boosting = true;
      this.boosted = false;
      this.maxSpeedMod = 14;
      this.fullBoostLoops = 4;
      var that = this;
      setTimeout(function() {
        that.boosting = false;
        that.maxSpeedMod = 11;
        setTimeout(function() {
          that.boosting = false;
          that.maxSpeedMod = 6;
        }, 400);
      }, 900);
    }
    if (this.boosting) {
      boostSMod = 0.8;
      boostAMod = 1.95;
      if (this.fullBoostLoops !== 0) {
        boostSMod = 2.5;
        boostAMod = 2.7;
        this.fullBoostLoops -= 1;
      }
    }

    if (this.braking === false) {
      this.xa = xChange * speedMod * boostSMod + this.sx * boostAMod;
      this.ya = yChange * speedMod * boostSMod + this.sy * boostAMod;
    }
    if (this.braking === true) {
      //if ((xChange > 0 && this.xa > 0) || (xChange < 0 && this.xa < 0)) {
      this.sx = this.sx / brakeAMod;
      //}
      //if ((yChange > 0 && this.ya > 0) || (yChange < 0 && this.ya < 0)) {
      this.sy = this.sy / brakeAMod;
      //}
      this.xa = xChange * brakeSMod + this.sx;
      this.ya = yChange * brakeSMod + this.sy;
    }
    if (d === -1) {
      if (this.xa < 0.9 && this.xa > -0.9) {
        this.xa = 0;
        this.sx = this.sx / 1.2;
      }
      if (this.ya < 0.9 && this.ya > -0.9) {
        this.ya = 0;
        this.sy = this.sy / 1.2;
      }
    }
    this.prevX = this.x;
    this.prevY = this.y;
    if (this.xa > 0.35 || this.xa < -0.35) {
      if (this.controllerEnabled) {
        this.xd = this.xa * this.globalSpeedMod * this.controllerDist;
        this.x += this.xd;
      } else {
        this.xd = this.xa * this.globalSpeedMod;
        this.x += this.xd;
      }
    }
    if (this.ya > 0.35 || this.ya < -0.35) {
      if (this.controllerEnabled) {
        this.yd = this.ya * this.globalSpeedMod * this.controllerDist;
        this.y += this.yd;
      } else {
        this.yd = this.ya * this.globalSpeedMod;
        this.y += this.yd;
      }
    }
  }

  checkAnalogRidgeCollisions2(activeSpells) {
    for (var id in activeSpells) {
      var spell = activeSpells[id];
      var x1 = spell.x1;
      var x2 = spell.x2;
      var x3 = spell.x3;
      var x4 = spell.x4;
      var y1 = spell.y1;
      var y2 = spell.y2;
      var y3 = spell.y3;
      var y4 = spell.y4;
      if (spell.angle < 270 && spell.angle >= 180) {
        x1 = spell.x3;
        x2 = spell.x1;
        x3 = spell.x4;
        x4 = spell.x2;
        y1 = spell.y3;
        y2 = spell.y1;
        y3 = spell.y4;
        y4 = spell.y2;
      } else if (spell.angle < 180 && spell.angle >= 90) {
        x1 = spell.x4;
        x2 = spell.x3;
        x3 = spell.x2;
        x4 = spell.x1;
        y1 = spell.y4;
        y2 = spell.y3;
        y3 = spell.y2;
        y4 = spell.y1;
      } else if (spell.angle < 90 && spell.angle >= 0) {
        x1 = spell.x2;
        x2 = spell.x4;
        x3 = spell.x1;
        x4 = spell.x3;
        y1 = spell.y2;
        y2 = spell.y4;
        y3 = spell.y1;
        y4 = spell.y3;
      }
      var lineCoords = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
      /*if (
        this.x + 22 > x1 &&
        this.x - 22 < x4 &&
        (this.y - 22 < y2 && this.y + 22 > y3)
      ) {*/
      for (var i = 0; i < dots.length; i++) {
        var dx = dots[i][0];
        var dy = dots[i][1];
        for (var j = 0; j < lineCoords.length; j++) {
          var p = lineCoords[j][0];
          var q = lineCoords[j][1];
          var r = lineCoords[(j + 1) % 4][0];
          var s = lineCoords[(j + 1) % 4][1];
          var a = this.prevX + dx;
          var b = this.prevY + dy;
          var c = this.x + dx;
          var d = this.y + dy;
          //console.log("a: " + a);
          //console.log("b: " + b);
          //console.log("c: " + c);
          //console.log("d: " + d);
          //console.log("p: " + p);
          //console.log("q: " + q);
          //console.log("r: " + r);
          //console.log("s: " + s);
          var det, gamma, lambda;
          det = (c - a) * (s - q) - (r - p) * (d - b);
          if (det === 0) {
            console.log("parrallel");
          } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            if (0 < lambda && lambda < 1 && (0 < gamma && gamma < 1)) {
              //console.log("det: " + det);
              var dey = q - s;
              var dex = p - r;
              var theta = Math.atan2(dey, dex);
              var puckTheta = Math.atan2(this.sy, this.sx);
              var puckH = Math.sqrt(this.sy * this.sy + this.sx * this.sx);
              var finalAngle = theta + theta - puckTheta;
              finalAngle += 2 * 1.57;
              this.sy = -puckH * Math.sin(finalAngle);
              this.sx = -puckH * Math.cos(finalAngle);
              this.y += this.sy * 2;
              this.x += this.sx * 2;
              //this.sy = -puckH * Math.sin(finalAngle);
              //this.sx = -puckH * Math.cos(finalAngle);
              //var moveX = 26 * Math.sin(theta - 1.5708);
              //var moveY = -26 * Math.cos(theta - 1.5708);
              //this.y += moveX;
              //this.x += moveY;
              console.log("theta: " + theta);
              console.log("puckTheta: " + puckTheta);
              console.log("finalAngle: " + finalAngle);
              return;
            }
          }
        }
      }
      /*}*/
    }
  }

  checkAnalogRidgeCollisions(activeSpells) {
    for (var id in activeSpells) {
      var spell = activeSpells[id];
      var x1 = spell.x1;
      var x2 = spell.x2;
      var x3 = spell.x3;
      var x4 = spell.x4;
      var y1 = spell.y1;
      var y2 = spell.y2;
      var y3 = spell.y3;
      var y4 = spell.y4;
      /*
      console.log("x1: " + x1);
      console.log("x4: " + x4);
      console.log("y1: " + y1);
      console.log("y4: " + y4);*/
      if (spell.angle < 270 && spell.angle >= 180) {
        x1 = spell.x3;
        x2 = spell.x1;
        x3 = spell.x4;
        x4 = spell.x2;
        y1 = spell.y3;
        y2 = spell.y1;
        y3 = spell.y4;
        y4 = spell.y2;
      } else if (spell.angle < 180 && spell.angle >= 90) {
        x1 = spell.x4;
        x2 = spell.x3;
        x3 = spell.x2;
        x4 = spell.x1;
        y1 = spell.y4;
        y2 = spell.y3;
        y3 = spell.y2;
        y4 = spell.y1;
      } else if (spell.angle < 90 && spell.angle >= 0) {
        x1 = spell.x2;
        x2 = spell.x4;
        x3 = spell.x1;
        x4 = spell.x3;
        y1 = spell.y2;
        y2 = spell.y4;
        y3 = spell.y1;
        y4 = spell.y3;
      }

      var xLoc1 = 0;
      var xLoc2 = 0;
      var xLoc3 = 0;
      var xLoc4 = 0;
      var yLoc1 = 0;
      var yLoc2 = 0;
      var yLoc3 = 0;
      var yLoc4 = 0;
      var distanceX1 = 0;
      var distanceY1 = 0;
      var distanceX2 = 0;
      var distanceY2 = 0;
      var distanceX3 = 0;
      var distanceY3 = 0;
      if (Math.abs(y1) > Math.abs(this.y)) {
        distanceY1 = Math.abs(y1) - Math.abs(this.y);
      } else {
        distanceY1 = Math.abs(this.y) - Math.abs(y1);
      }
      if (Math.abs(x1) > Math.abs(this.x)) {
        distanceX1 = Math.abs(x1) - Math.abs(this.x);
      } else {
        distanceX1 = Math.abs(this.x) - Math.abs(x1);
      }
      if (Math.abs(y2) > Math.abs(this.y)) {
        distanceY2 = Math.abs(y2) - Math.abs(this.y);
      } else {
        distanceY2 = Math.abs(this.y) - Math.abs(y2);
      }
      if (Math.abs(x2) > Math.abs(this.x)) {
        distanceX2 = Math.abs(x2) - Math.abs(this.x);
      } else {
        distanceX2 = Math.abs(this.x) - Math.abs(x2);
      }
      if (Math.abs(y3) > Math.abs(this.y)) {
        distanceY3 = Math.abs(y3) - Math.abs(this.y);
      } else {
        distanceY3 = Math.abs(this.y) - Math.abs(y3);
      }
      if (Math.abs(x3) > Math.abs(this.x)) {
        distanceX3 = Math.abs(x2) - Math.abs(this.x);
      } else {
        distanceX3 = Math.abs(this.x) - Math.abs(x3);
      }
      /*
      console.log("x: " + this.x);
      console.log(x1);
      console.log(x4);*/

      if (spell.name === "analogRidge") {
        if (this.x + 22 > x1) {
        }
        if (this.x + 22 > x1 && this.x - 22 < x4) {
        }
        if (
          this.x + 22 > x1 &&
          this.x - 22 < x4 &&
          (this.y - 22 < y2 && this.y + 22 > y3)
        ) {
          xLoc1 =
            distanceY1 * Math.tan(Math.abs(spell.angle % 90) * (Math.PI / 180));
          xLoc2 =
            distanceY2 * Math.tan(Math.abs(spell.angle % 90) * (Math.PI / 180));
          yLoc1 =
            distanceX1 *
            -Math.tan((90 - Math.abs(spell.angle % 90)) * (Math.PI / 180));
          yLoc2 =
            distanceX2 *
            -Math.tan((90 - Math.abs(spell.angle % 90)) * (Math.PI / 180));
          xLoc3 =
            distanceY1 *
            Math.tan((90 - Math.abs(spell.angle % 90)) * (Math.PI / 180));
          xLoc4 =
            distanceY3 *
            Math.tan((90 - Math.abs(spell.angle % 90)) * (Math.PI / 180));
          yLoc3 =
            distanceX1 * Math.tan(Math.abs(spell.angle % 90) * (Math.PI / 180));
          yLoc4 =
            distanceX3 * Math.tan(Math.abs(spell.angle % 90) * (Math.PI / 180));
          //console.log(Math.abs((spell.angle - 90) % 90));
          //console.log(90 - Math.abs(spell.angle % 90));
          var vector1 = Math.sqrt(this.xa * this.xa + this.ya * this.ya);
          var vector2 = Math.sqrt(this.sx * this.sx + this.sy * this.sy);
          var angle = Math.atan2(this.xa, this.ya);
          var angleTemp = -spell.angle;
          if (angleTemp <= -180) {
            angleTemp += 360;
          }
          angleTemp = angleTemp % 90;
          if (angleTemp < 0) {
            angleTemp += 90;
          }

          var rAngle = (angleTemp + 90) * (Math.PI / 180);
          var rCAngle = angleTemp * (Math.PI / 180);
          //console.log(angleTemp + 90);
          //console.log((angle * 180) / Math.PI);
          if (
            (angleTemp >= -180 && angleTemp <= -90) ||
            (angleTemp > 0 && angleTemp <= 90)
          ) {
            var swap = rAngle;
            rAngle = rCAngle;
            rCAngle = swap;
          }
          //console.log("wall ang: " + angleTemp);
          //console.log((angle * 180) / Math.PI);
          //console.log(this.x - (x1 + xLoc1));
          //console.log(this.y - (y1 + yLoc1));
          //console.log(angleTemp);
          if (angleTemp < 85 || angleTemp > 5) {
            console.log("angled wall");
          }
          if (
            this.x - (x1 + xLoc1) < 10 &&
            this.y - (y1 + yLoc1) < 10 &&
            this.x - (x1 + xLoc1) > -22 &&
            this.y - (y1 + yLoc1) > -22
          ) {
            //console.log("x: " + 10 * Math.sin(rCAngle));
            //console.log("y: " + 10 * Math.cos(rCAngle));
            this.x += 6 * Math.cos(rCAngle);
            this.y -= 6 * Math.sin(rCAngle);
            //console.log("we got a hit from ab0ve");
            var finalAngle = rAngle + (rAngle - angle);
            if (finalAngle >= Math.PI) {
              finalAngle -= 2 * Math.PI;
            } else if (finalAngle < -Math.PI) {
              finalAngle += 2 * Math.PI;
            }
            this.xa = -vector1 * Math.cos(finalAngle);
            this.ya = -vector1 * Math.sin(finalAngle);
            this.sy = -vector2 * Math.cos(finalAngle);
            this.sx = -vector2 * Math.sin(finalAngle);
            console.log("we got a hit from above");
          } else if (
            this.x - (x2 + xLoc2) > -10 &&
            this.y - (y2 + yLoc2) > -10 &&
            this.x - (x2 + xLoc2) < 22 &&
            this.y - (y2 + yLoc2) < 22
          ) {
            //console.log("x: " + 10 * Math.sin(rCAngle));
            //console.log("y: " + 10 * Math.cos(rCAngle));
            this.x -= 6 * Math.cos(rCAngle);
            this.y += 6 * Math.sin(rCAngle);
            var finalAngle = rAngle + (rAngle - angle);
            if (finalAngle >= Math.PI) {
              finalAngle -= 2 * Math.PI;
            } else if (finalAngle < -Math.PI) {
              finalAngle += 2 * Math.PI;
            }
            this.xa = -vector1 * Math.cos(finalAngle);
            this.ya = -vector1 * Math.sin(finalAngle);
            this.sy = -vector2 * Math.cos(finalAngle);
            this.sx = -vector2 * Math.sin(finalAngle);
            console.log("we got a hit from below");
          } else if (
            this.x - (x1 + xLoc3) < 10 &&
            this.y - (y1 + yLoc3) > -10 &&
            this.x - (x1 + xLoc3) > -22 &&
            this.y - (y1 + yLoc3) < 22
          ) {
            var changer = rAngle;
            rAngle = rCAngle;
            rCAngle = changer;
            //console.log("x: " + 10 * Math.cos(rCAngle));
            //console.log("y: " + 10 * Math.sin(rCAngle));
            this.x -= 6 * Math.cos(rCAngle);
            this.y += 6 * Math.sin(rCAngle);
            var finalAngle = rAngle + (rAngle - angle);
            if (finalAngle >= Math.PI) {
              finalAngle -= 2 * Math.PI;
            } else if (finalAngle < -Math.PI) {
              finalAngle += 2 * Math.PI;
            }
            this.xa = -vector1 * Math.cos(finalAngle);
            this.ya = -vector1 * Math.sin(finalAngle);
            this.sy = -vector2 * Math.cos(finalAngle);
            this.sx = -vector2 * Math.sin(finalAngle);
            console.log("we got a hit from 3");
          } else if (
            this.x - (x3 + xLoc4) > -10 &&
            this.y - (y3 + yLoc4) < 10 &&
            this.x - (x3 + xLoc4) < 22 &&
            this.y - (y3 + yLoc4) > -22
          ) {
            var changer = rAngle;
            rAngle = rCAngle;
            rCAngle = changer;
            //console.log("x: " + 10 * Math.cos(rCAngle));
            //console.log("y: " + 10 * Math.sin(rCAngle));
            this.x += 6 * Math.cos(rCAngle);
            this.y -= 6 * Math.sin(rCAngle);
            var finalAngle = rAngle + (rAngle - angle);
            if (finalAngle >= Math.PI) {
              finalAngle -= 2 * Math.PI;
            } else if (finalAngle < -Math.PI) {
              finalAngle += 2 * Math.PI;
            }
            this.xa = -vector1 * Math.cos(finalAngle);
            this.ya = -vector1 * Math.sin(finalAngle);
            this.sy = -vector2 * Math.cos(finalAngle);
            this.sx = -vector2 * Math.sin(finalAngle);
            console.log("we got a hit from 4");
          }
        }
      }
    }
  }

  decelerate(timeDifference) {
    var angle = Math.atan2(this.xa, -this.ya);
    var xChange = (10 * Math.sin(angle)) / timeDifference;
    var yChange = (10 * Math.sin(angle)) / timeDifference;
    this.sx -= xChange / 60;
    this.sy -= yChange / 60;
  }

  updatePosition2(timeDifference) {
    if (
      (this.aon && !this.won && !this.son && !this.don) ||
      (this.aon && this.won && this.son && !this.don)
    ) {
      this.calculateForce(270, timeDifference);
    } else if (this.aon && this.won && !this.son && !this.don) {
      this.calculateForce(225, timeDifference);
    } else if (this.aon && !this.won && this.son && !this.don) {
      this.calculateForce(315, timeDifference);
    } else if (
      (!this.aon && this.won && !this.son && !this.don) ||
      (this.aon && this.won && !this.son && this.don)
    ) {
      this.calculateForce(180, timeDifference);
    } else if (!this.aon && this.won && !this.son && this.don) {
      this.calculateForce(135, timeDifference);
    } else if (
      (!this.aon && !this.won && !this.son && this.don) ||
      (!this.aon && this.won && this.son && this.don)
    ) {
      this.calculateForce(90, timeDifference);
    } else if (!this.aon && !this.won && this.son && this.don) {
      this.calculateForce(45, timeDifference);
    } else if (
      (!this.aon && !this.won && this.son && !this.don) ||
      (this.aon && !this.won && this.son && this.don)
    ) {
      this.calculateForce(0, timeDifference);
    } else {
      this.calculateForce(-1, timeDifference);
    }
    if (this.x > this.levelSizeX - this.size) {
      this.x = this.levelSizeX - this.size;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.x < 5) {
      this.x = 5;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.y > this.levelSizeY - this.size) {
      this.y = this.levelSizeY - this.size;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
    if (this.y < 5) {
      this.y = 5;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
  }

  updatePosition(timeDifference) {
    if (Math.abs(this.xa) > 3) {
      this.locXSpeedMultiplier = this.speedMultiplier * 2;
      this.frictionXMultiplier = this.speedMultiplier / 2;
    }
    if (Math.abs(this.xa) > 6) {
      this.locXSpeedMultiplier = this.speedMultiplier * 3;
      this.frictionXMultiplier = this.speedMultiplier / 3;
    }
    if (Math.abs(this.xa) > 9) {
      this.locXSpeedMultiplier = this.speedMultiplier * 4;
      this.frictionXMultiplier = this.speedMultiplier / 4;
    }
    if (Math.abs(this.xa) > 12) {
      this.locXSpeedMultiplier = this.speedMultiplier * 5;
      this.frictionXMultiplier = this.speedMultiplier / 5;
    }
    if (Math.abs(this.ya) > 3) {
      this.locYSpeedMultiplier = this.speedMultiplier * 2;
      this.frictionYMultiplier = this.speedMultiplier / 2;
    }
    if (Math.abs(this.ya) > 6) {
      this.locYSpeedMultiplier = this.speedMultiplier * 3;
      this.frictionYMultiplier = this.speedMultiplier / 3;
    }
    if (Math.abs(this.ya) > 9) {
      this.locYSpeedMultiplier = this.speedMultiplier * 4;
      this.frictionYMultiplier = this.speedMultiplier / 4;
    }
    if (Math.abs(this.ya) > 12) {
      this.locYSpeedMultiplier = this.speedMultiplier * 5;
      this.frictionYMultiplier = this.speedMultiplier / 5;
    }

    if (this.aon && !this.don) {
      this.xa -= timeDifference / this.locXSpeedMultiplier;
      this.x += this.xa;
    } else if (!this.aon && this.don) {
      this.xa += timeDifference / this.locXSpeedMultiplier;
      this.x += this.xa;
    } else {
      if (this.xa > 0.5) {
        this.xa -= timeDifference / this.frictionXMultiplier;
        this.x += this.xa;
      } else if (this.xa < -0.5) {
        this.xa += timeDifference / this.frictionXMultiplier;
        this.x += this.xa;
      } else {
        this.xa = 0.0;
      }
    }
    if (this.won && !this.son) {
      this.ya -= timeDifference / this.locYSpeedMultiplier;
      this.y += this.ya;
    } else if (!this.won && this.son) {
      this.ya += timeDifference / this.locYSpeedMultiplier;
      this.y += this.ya;
    } else {
      if (this.ya > 0.5) {
        this.ya -= timeDifference / this.frictionYMultiplier;
        this.y += this.ya;
      } else if (this.ya < -0.5) {
        this.ya += timeDifference / this.frictionYMultiplier;
        this.y += this.ya;
      } else {
        this.ya = 0.0;
      }
    }
    if (this.x > this.levelSizeX - this.size) {
      this.x = this.levelSizeX - this.size;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.x < 5) {
      this.x = 5;
      this.xa = -this.xa;
      this.sx = -this.sx;
    }
    if (this.y > this.levelSizeY - this.size) {
      this.y = this.levelSizeY - this.size;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
    if (this.y < 5) {
      this.y = 5;
      this.ya = -this.ya;
      this.sy = -this.sy;
    }
  }
  checkRidgeCollisions(activeSpells) {
    if (this.xa > 0) {
      for (var id in activeSpells) {
        var spell = activeSpells[id];
        if (spell.name === "ridge") {
          if (
            spell.leftX - this.x < 22 &&
            spell.leftX - this.x > 0 &&
            this.y > spell.topY - 22 &&
            this.y < spell.bottomY + 22
          ) {
            this.xa = -this.xa;
            this.sx = -this.sx;
          }
        }
      }
    }
    if (this.xa < 0) {
      for (var id in activeSpells) {
        var spell = activeSpells[id];
        if (spell.name === "ridge") {
          if (
            this.x - spell.rightX < 22 &&
            this.x - spell.rightX > 0 &&
            this.y > spell.topY - 22 &&
            this.y < spell.bottomY + 22
          ) {
            this.xa = -this.xa;
            this.sx = -this.sx;
          }
        }
      }
    }
    if (this.ya > 0) {
      for (var id in activeSpells) {
        var spell = activeSpells[id];
        if (spell.name === "ridge") {
          if (
            spell.topY - this.y < 22 &&
            spell.topY - this.y > 0 &&
            this.x > spell.leftX - 22 &&
            this.x < spell.rightX + 22
          ) {
            this.ya = -this.ya;
            this.sy = -this.sy;
          }
        }
      }
    }
    if (this.ya < 0) {
      for (var id in activeSpells) {
        var spell = activeSpells[id];
        if (spell.name === "ridge") {
          if (
            this.y - spell.bottomY < 22 &&
            this.y - spell.bottomY > 0 &&
            this.x > spell.leftX - 22 &&
            this.x < spell.rightX + 22
          ) {
            this.ya = -this.ya;
            this.sy = -this.sy;
          }
        }
      }
    }
  }
}

module.exports = {
  Puck: Puck
};
