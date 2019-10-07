
let Strike = function (scene) {
  Phaser.GameObjects.Sprite.call(this, scene, -99999, -99999, 'test_sheet', 17);

  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setScale(0.5, 0.5);
}
Strike.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Strike.prototype.constructor = Strike;


let Player = function (scene, x, y, strike, agitationPerStrike, agitationCooldownPerFrame) {
  Phaser.GameObjects.Sprite.call(this, scene, x, y, 'test_sheet', 0);

  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.body.setSize(15, 15, true);

  this.currentMoveSpeed = GameplayConstants.MoveSpeed;
  this.currentState = PlayerStates.NORMAL;
  this.keys = {};

  this.strike = strike;

  this.agitation = 0;
  this.agitationPerStrike = agitationPerStrike;
  this.agitationCooldownPerFrame = agitationCooldownPerFrame;

  this.dashEvent = null;

  this.inputData = {
    directonVector: new Phaser.Math.Vector2(0, 0),
    currentAngle: 0,
    aButtonDown: false,
    bButtonDown: false,
    lButtonDown: false,
    rButtonDown: false,
    cameraAngle: new Phaser.Math.Vector2(0, 0),
    computeMat: new Phaser.Math.Matrix3()
  };
  this.initKeysInput();
}

Player.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.initKeysInput = function () {
  // attach keys
  this.keys.rightArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  this.keys.leftArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.keys.downArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.keys.upArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

  this.keys.aKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  this.keys.bKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

  this.keys.rKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  this.keys.lKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
};
Player.prototype.updateInputData = function () {
  this.inputData.directonVector.set(0, 0);
  this.inputData.aButtonDown = false;
  this.inputData.bButtonDown = false;
  this.inputData.lButtonDown = false;
  this.inputData.rButtonDown = false;

  // Keyboard update
  if (this.keys.rightArrow.isDown) {
     this.inputData.directonVector.x = 1;
  } else if (this.keys.leftArrow.isDown) {
     this.inputData.directonVector.x = -1;
  } else {
     this.inputData.directonVector.x = 0;
  }
  if (this.keys.downArrow.isDown) {
     this.inputData.directonVector.y = 1;
  } else if (this.keys.upArrow.isDown) {
     this.inputData.directonVector.y = -1;
  } else {
     this.inputData.directonVector.y = 0;
  }

  this.inputData.aButtonDown = (this.keys.aKey.isDown || this.inputData.aButtonDown);
  this.inputData.bButtonDown = (this.keys.bKey.isDown || this.inputData.bButtonDown);
  this.inputData.lButtonDown = (this.keys.lKey.isDown || this.inputData.lButtonDown);
  this.inputData.rButtonDown = (this.keys.rKey.isDown || this.inputData.rButtonDown);

  // Gamepad update
  if (this.scene.input.gamepad && (this.scene.input.gamepad.total > 0)) {
    var pad = this.scene.input.gamepad.getPad(0);
    if (pad.leftStick.lengthSq() > 0.0001) {
      this.inputData.directonVector.x = pad.leftStick.x;
      this.inputData.directonVector.y = pad.leftStick.y;
    }

    this.inputData.aButtonDown = (pad.A || this.inputData.aButtonDown);
    this.inputData.bButtonDown = (pad.B || this.inputData.bButtonDown);
  }

  // TODO: normalize this to camera direction later
  if (this.inputData.directonVector.lengthSq() > 1.0) {
    this.inputData.directonVector.normalize();
  }
  this.inputData.computeMat.identity();
  this.inputData.computeMat.rotate(Phaser.Math.DegToRad(-1 * this.inputData.cameraAngle.x));
  this.inputData.directonVector.transformMat3(this.inputData.computeMat);
};
Player.prototype.initiateStrike = function () {
  this.currentState = PlayerStates.STRIKING;
  this.agitation += this.agitationPerStrike;
  this.tint = 0x777700;
  //console.log('windup...');
  let windUp = this.scene.time.delayedCall(GameplayConstants.StrikeWindup, () => {
    const dx = GameplayConstants.StrikeDistance * Math.cos(this.inputData.currentAngle);
    const dy = GameplayConstants.StrikeDistance * Math.sin(this.inputData.currentAngle);
    this.strike.setPosition(this.x + dx, this.y + dy);

    //console.log('strike!');
    this.tint = 0xFFFF00;
    let strike = this.scene.time.delayedCall(GameplayConstants.StrikeTime, () => {
      this.strike.setPosition(-999999);
      //console.log('cooldown');
      this.tint = 0x444400;
      let cooldown = this.scene.time.delayedCall(GameplayConstants.StrikeCooldown, () => {
        //console.log('done.');
        this.tint = 0xffffff;
        this.currentState = PlayerStates.NORMAL;
      }, [], this);
    }, [], this);
  }, [], this);
};
Player.prototype.initiateDash = function () {
  this.currentState = PlayerStates.DASHING;
  this.currentMoveSpeed = GameplayConstants.DashSpeed;

  this.tint = 0x0000ff;
  this.dashEvent = this.scene.time.delayedCall(GameplayConstants.DashDuration, () => {
    this.currentMoveSpeed = GameplayConstants.MoveSpeed;
    this.currentState = PlayerStates.NORMAL;
    this.dashEvent = null;
    this.tint = 0xffffff;
  }, [], this);
};
Player.prototype.update = function () {
  this.updateInputData();

  // NORMAL -> DASHING
  if ((this.currentState === PlayerStates.NORMAL) && this.inputData.aButtonDown) {
    //this.initiateDash();
  }

  // NORMAL -> STRIKING
  if ((this.currentState === PlayerStates.NORMAL) && this.inputData.bButtonDown) {
    //this.initiateStrike();
  }

  // NORMAL update
  if (this.currentState === PlayerStates.NORMAL) {
    if (this.inputData.directonVector.lengthSq() > 0.001) {
      this.inputData.currentAngle = this.inputData.directonVector.angle();
    }
    this.body.velocity.x = this.inputData.directonVector.x * this.currentMoveSpeed;
    this.body.velocity.y = this.inputData.directonVector.y * this.currentMoveSpeed;
  }

  // DASHING update
  if (this.currentState === PlayerStates.DASHING) {
    this.body.velocity.x = Math.cos(this.inputData.currentAngle) * this.currentMoveSpeed;
    this.body.velocity.y = Math.sin(this.inputData.currentAngle) * this.currentMoveSpeed;

    if (this.dashEvent) {
      // Early exit logic
      if ((this.dashEvent.elapsed > (GameplayConstants.DashDuration - GameplayConstants.DashToStrikeEarlyWindow)) && this.inputData.bButtonDown) {
        console.log('early exit');

        this.dashEvent.remove();
        this.dashEvent = null;
        this.currentMoveSpeed = GameplayConstants.MoveSpeed;

        if (this.inputData.directonVector.lengthSq() > 0.001) {
          this.inputData.currentAngle = this.inputData.directonVector.angle();
        }

        this.initiateStrike();
      }
    }
  }

  // STRIKING update
  if (this.currentState === PlayerStates.STRIKING) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  this.rotation = this.inputData.currentAngle + (Math.PI * 0.5);

  if (this.inputData.lButtonDown) {
    this.inputData.cameraAngle.x -= GameplayConstants.CameraTurnSpeed;
  } else if (this.inputData.rButtonDown) {
    this.inputData.cameraAngle.x += GameplayConstants.CameraTurnSpeed;
  }

  // Agitation
  this.agitation = Math.max(this.agitation - this.agitationCooldownPerFrame, 0);
  if (this.agitation > GameplayConstants.AgitationMax) {
    console.log('death');
  }
};