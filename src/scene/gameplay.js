

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

    this.player = null;
    this.map = null;
    this.foreground = null;

    this.three = null;
    this.camera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT, 1, 1000 );
    this.renderer = null;
    this.threeScene = new THREE.Scene();

};
Gameplay.prototype.init = function () {
    this.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );


    this.events.on('shutdown', this.shutdown, this);

};
Gameplay.prototype.preload = function () {
    this.load.spritesheet('test_sheet', 'asset/image/fromJesse.png', { frameWidth: 32, frameHeight: 32 });
    this.load.binary('roompusher', './asset/model/roompusher.glb');

    this.load.image('test_sheet_image', 'asset/image/fromJesse.png');
    this.load.tilemapTiledJSON('test_map', 'asset/map/test_map.json');
};
Gameplay.prototype.setupThreeBackground = function () {
    this.three = this.add.extern(); 
    let that = this;
    let threeRenderer = this.renderer;
    let threeScene = this.threeScene;
    let threeCam = this.camera;
    this.three.render = function (prenderer, pcamera, pcalcMatrix) {
        that.updateThreeScene();

        threeRenderer.state.reset();
        threeRenderer.render(threeScene, threeCam);
    };
};
Gameplay.prototype.initializeThreeScene = function () {
    this.camera.position.set(0, 0, 400);

    let geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

    let mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
    this.threeScene.add( mesh );
};
Gameplay.prototype.updateThreeScene = function () {
    //
};
Gameplay.prototype.create = function () {
    console.log('create');
    this.setupThreeBackground();
    this.initializeThreeScene();

    this.player = new Player(this, 128, 64);

    this.map = this.add.tilemap('test_map');
    this.map.addTilesetImage('tilesheet', 'test_sheet_image');
    this.foreground = this.map.createStaticLayer('foreground', 'tilesheet');
    this.foreground.setCollision([14]);

    let spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', (ev) => {
        spaceKey.removeAllListeners();
        this.events.removeListener('update', this.player.update, this.player);
        this.scene.restart();
        //this.game.scene.stop('Gameplay');
        //
    });

    this.physics.add.collider(this.player, this.foreground);
};
Gameplay.prototype.update = function () {
};
Gameplay.prototype.shutdown = function () {
    this.player = null;
    this.map = null;
    this.foreground = null;

    while(this.threeScene.children.length > 0){ 
        this.threeScene.remove(this.threeScene.children[0]); 
    }
    this.three = null;
};
