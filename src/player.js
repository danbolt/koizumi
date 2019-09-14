

let Player = function (scene, x, y) {
  Phaser.GameObjects.Sprite.call(this, scene, x, y, 'test_sheet', 0);

  scene.add.existing(this);
  scene.physics.add.existing(this);
  scene.events.addListener('update', this.update, this);

  this.kMoveSpeed = 60;
  this.keys = {};

  this.initInput();
}

Player.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.initInput = function () {
  // attach keys
  this.keys.rightArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  this.keys.leftArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  this.keys.downArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  this.keys.upArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
};

Player.prototype.update = function () {
  if (this.keys.rightArrow.isDown) {
     // @ts-ignore
     this.body.velocity.x = this.kMoveSpeed;
  } else if (this.keys.leftArrow.isDown) {
      // @ts-ignore
      this.body.velocity.x = this.kMoveSpeed * -1;
  } else {
     // @ts-ignore
      this.body.velocity.x = 0;
  }

  if (this.keys.downArrow.isDown) {
     // @ts-ignore
     this.body.velocity.y = this.kMoveSpeed;
  } else if (this.keys.upArrow.isDown) {
      // @ts-ignore
      this.body.velocity.y = this.kMoveSpeed * -1;
  } else {
  // @ts-ignore
     this.body.velocity.y = 0;
  }
};