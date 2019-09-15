

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

    this.agitationBar = null;
    this.player = null;
    this.strike = null;
    this.map = null;
    this.foreground = null;

    this.three = null;
    this.camera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT, 1, 1000 );
    this.renderer = null;
    this.threeScene = new THREE.Scene();
    this.sceneMeshData = {};

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
    let material = new THREE.MeshBasicMaterial( { color: 0x440000 } );

    let mesh = new THREE.Mesh( geometry, material );
    this.threeScene.add( mesh );

    this.sceneMeshData.testMesh = mesh;
};
Gameplay.prototype.updateThreeScene = function () {
    this.sceneMeshData.testMesh.rotation.set((this.player.x / GAME_WIDTH) * Math.PI * 2, (this.player.y / GAME_WIDTH) * Math.PI * 2, 0);
};
Gameplay.prototype.setupEvents = function () {
    this.events.addListener('update', this.player.update, this.player);

};
Gameplay.prototype.removeEvents = function () {
    this.events.removeListener('update', this.player.update, this.player);
};
Gameplay.prototype.create = function () {
    this.setupThreeBackground();
    this.initializeThreeScene();

    this.agitationBar = this.add.rectangle(GAME_WIDTH * 0.5, 0, 1, 16, 0x333333);
    this.strike = new Strike(this, 0, 0);
    this.player = new Player(this, 128, 128, this.strike, 13, 0.082);

    this.map = this.add.tilemap('test_map');
    this.map.addTilesetImage('tilesheet', 'test_sheet_image');
    this.foreground = this.map.createStaticLayer('foreground', 'tilesheet');
    this.foreground.setCollision([14]);

    this.setupEvents();

    // TODO: restart the scene on appropriate player death
    let spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    spaceKey.on('down', (ev) => {
        spaceKey.removeAllListeners();
        this.removeEvents();
        this.scene.restart();
    });

    this.physics.add.collider(this.player, this.foreground);
};
Gameplay.prototype.update = function () {
    const agitationRatio = (this.player.agitation / GameplayConstants.AgitationMax);
    this.agitationBar.scaleX = agitationRatio * GAME_WIDTH;
    this.agitationBar.fillColor = Phaser.Display.Color.GetColor(~~((0.5 + 0.5 * agitationRatio) * 255), ~~(0.5 * 255), ~~(0.5 * 255));

    this.updateThreeScene();
};
Gameplay.prototype.shutdown = function () {
    this.player = null;
    this.strike = null;
    this.agitationBar = null;
    this.map = null;
    this.foreground = null;

    while(this.threeScene.children.length > 0){ 
        this.threeScene.remove(this.threeScene.children[0]); 
    }
    this.three = null;
    this.sceneMeshData = {};
};
