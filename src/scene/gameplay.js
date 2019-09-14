

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

    this.player = null;
    this.map = null;
    this.foreground = null;
};
Gameplay.prototype.init = function () {
    //
};
Gameplay.prototype.preload = function () {

    this.load.spritesheet('test_sheet', 'asset/image/fromJesse.png', { frameWidth: 32, frameHeight: 32 });
    this.load.binary('roompusher', './asset/model/roompusher.glb');

    this.load.image('test_sheet_image', 'asset/image/fromJesse.png');
    this.load.tilemapTiledJSON('test_map', 'asset/map/test_map.json');
};
Gameplay.prototype.create = function () {
    this.player = new Player(this, 128, 64);

    this.map = this.add.tilemap('test_map');
    this.map.addTilesetImage('tilesheet', 'test_sheet_image');
    this.foreground = this.map.createStaticLayer('foreground', 'tilesheet');
    this.foreground.setCollision([14]);

    this.physics.add.collider(this.player, this.foreground);
};
Gameplay.prototype.update = function () {
};
Gameplay.prototype.shutdown = function () {
    this.player = null;
    this.map = null;
    this.foreground = null;
};
