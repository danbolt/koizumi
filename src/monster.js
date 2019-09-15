let Monster = function (scene, x, y, player) {
  Phaser.GameObjects.Sprite.call(this, scene, x, y, 'test_sheet', 20);

  this.player = player;

  scene.add.existing(this);
  scene.physics.add.existing(this);
};
Monster.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Monster.prototype.constructor = Monster;

Monster.prototype.update = function () {
  //
};