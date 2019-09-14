let Player = function (scene, x, y) {
  Phaser.GameObjects.Sprite.call(this, scene, x, y, 'test_sheet', 0);

  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.currentMoveSpeed = GameplayConstants.MoveSpeed;
  this.currentState = PlayerStates.NORMAL;
  this.keys = {};

  this.inputData = {
    directonVector: new Phaser.Math.Vector2(0, 0),
    currentAngle: 0,
    aButtonDown: false
  };
  this.initKeysInput();
}

Player.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.initKeysInput = function () {
  // attach keys
  this.keys.rightArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  this.keys.leftArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  this.keys.downArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  this.keys.upArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

  this.keys.aKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
};
Player.prototype.updateInputData = function () {
  this.inputData.directonVector.set(0, 0);
  this.inputData.aButtonDown = false;

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

  // Gamepad update
  if (this.scene.input.gamepad && (this.scene.input.gamepad.total > 0)) {
    var pad = this.scene.input.gamepad.getPad(0);
    if (pad.leftStick.lengthSq() > 0.0001) {
      this.inputData.directonVector.x = pad.leftStick.x;
      this.inputData.directonVector.y = pad.leftStick.y;
    }

    this.inputData.aButtonDown = (pad.A || this.inputData.aButtonDown);
  }

  // TODO: normalize this to camera direction later
  if (this.inputData.directonVector.lengthSq() > 1.0) {
    this.inputData.directonVector.normalize();
  }
};
Player.prototype.update = function () {
  this.updateInputData();

  if ((this.currentState === PlayerStates.NORMAL) && this.inputData.aButtonDown) {
    this.currentState = PlayerStates.DASHING;
    this.currentMoveSpeed = GameplayConstants.DashSpeed;

    this.scene.time.delayedCall(GameplayConstants.DashDuration, () => {
      this.currentMoveSpeed = GameplayConstants.MoveSpeed;
      this.currentState = PlayerStates.NORMAL;
    }, [], this);
  }

  if (this.currentState === PlayerStates.NORMAL) {
    if (this.inputData.directonVector.lengthSq() > 0.001) {
      this.inputData.currentAngle = this.inputData.directonVector.angle();
    }
    this.body.velocity.x = this.inputData.directonVector.x * this.currentMoveSpeed;
    this.body.velocity.y = this.inputData.directonVector.y * this.currentMoveSpeed;
  } else if (this.currentState === PlayerStates.DASHING) {
    this.body.velocity.x = Math.cos(this.inputData.currentAngle) * this.currentMoveSpeed;
    this.body.velocity.y = Math.sin(this.inputData.currentAngle) * this.currentMoveSpeed;
  }

  this.rotation = this.inputData.currentAngle + (Math.PI * 0.5);
};