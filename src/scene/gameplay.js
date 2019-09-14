

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

    this.player = null;
    this.map = null;
    this.foreground = null;
    this.three = null;
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

    this.three = this.add.extern();

    let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

    let scene = new THREE.Scene();

    let geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    let renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
    this.three.render = function (prenderer, pcamera, pcalcMatrix) {
        mesh.rotation.x += 0.01;


        renderer.state.reset();
        renderer.render(scene, camera);
    };

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
    this.three = null;
};
