class Puck {
  constructor(startingX, startingY) {
    this.levelSizeX = 1000;
    this.levelSizeY = 550;
    this.spawnX = startingX;
    this.spawnY = startingY;
    this.x = startingX;
    this.y = startingY;
    this.xa = 0.0;
    this.ya = 0.0;
    this.sx = 0.0;
    this.sy = 0.0;
    this.d = 0.0;
    this.m = 2;
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
    this.maxSpeedMod = 6.0;
  }

  calculateForce(d, timeDifference) {
    if (
      d === -1 &&
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
    if (d === -1) {
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
    if (this.boosting) {
      this.maxSpeedMod = 14;
    }
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
          that.maxSpeedMod = 7;
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
    if (this.xa > 0.35 || this.xa < -0.35) {
      this.x += this.xa;
    }
    if (this.ya > 0.35 || this.ya < -0.35) {
      this.y += this.ya;
    }
  }

  decelerate(timeDifference) {
    var angle = Math.atan2(this.xa, this.ya);
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
