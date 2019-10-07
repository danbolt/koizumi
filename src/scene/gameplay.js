

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

    this.agitationBar = null;
    this.player = null;
    this.strike = null;
    this.map = null;
    this.foreground = null;

    this.monsters = [];

    this.three = null;
    this.camera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT, 1, 500 );
    this.renderer = null;
    this.threeScene = new THREE.Scene();
    this.sceneMeshData = {};

};
Gameplay.prototype.init = function () {
    this.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
    this.renderer.autoClear = false;

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
        threeRenderer.sortObjects = true;
        threeRenderer.render(threeScene, threeCam);
    };
};
Gameplay.prototype.initializeThreeScene = function (player, wallLayerData, monsters) {
    const loader = new THREE.GLTFLoader();

    this.camera.position.set(0, 4, 4);
    this.camera.lookAt(0, 0, 0);

    // Player
    //let debugPlayerGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    //let debugPlayerMaterial = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    let playerMesh = new THREE.Group();
    this.threeScene.add(playerMesh);
    this.sceneMeshData.player = playerMesh;

    const modelData = this.cache.binary.get('roompusher');
    loader.parse(modelData, 'asset/model/', (gltf) => {
        for (let i = gltf.scene.children.length - 1; i > -1; i--) {
            // HACK: tweak the scale, position, and rotation
            gltf.scene.position.y = 0.5;
            gltf.scene.rotation.y = Math.PI * 0.5;
            gltf.scene.scale.set(0.5, 0.5, 0.5); 

            playerMesh.add(gltf.scene);
        }
    });

    // Debug walls
    let debugWallGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    let debugWallMaterial = new THREE.MeshBasicMaterial( { color: 0x560000 } );
    let debugWallMesh = new THREE.Mesh( debugWallGeometry, debugWallMaterial );
    wallLayerData.data.forEach(function (column) {
        column.forEach(function (tile) {
            if (tile.index === -1) {
                return;
            }

            let wallClone = debugWallMesh.clone();
            wallClone.position.set(tile.x, 0, tile.y);
            this.threeScene.add( wallClone );
        }, this);
    }, this);

    // enemies
    let debugMonsterGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    let debugMonsterMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
    let debugMonsterMesh = new THREE.Mesh( debugMonsterGeometry, debugMonsterMaterial );
    this.sceneMeshData.monsters = [];
    monsters.forEach((monster, i) => {
        let monsterMeshClone = debugMonsterMesh.clone();
        monsterMeshClone.position.set((monster.x - (monster.width * 0.5)) * INV_GAME_TILE_SIZE, 0, (monster.y - (monster.height * 0.5)) * INV_GAME_TILE_SIZE);
        this.sceneMeshData.monsters.push(monsterMeshClone);
        this.threeScene.add( monsterMeshClone );
    });
};
Gameplay.prototype.updateThreeScene = function () {
    this.sceneMeshData.player.position.set((this.player.x - (this.player.width * 0.5)) * INV_GAME_TILE_SIZE, 0, (this.player.y - (this.player.height * 0.5)) * INV_GAME_TILE_SIZE);
    this.sceneMeshData.player.rotation.y = this.player.inputData.currentAngle * -1;

    const offsetX = Math.sin(this.player.inputData.cameraAngle.x * Phaser.Math.DEG_TO_RAD) * DisplayConstants.CameraDistance;
    const offsetZ = Math.cos(this.player.inputData.cameraAngle.x * Phaser.Math.DEG_TO_RAD) * DisplayConstants.CameraDistance;
    this.camera.position.set(this.sceneMeshData.player.position.x + offsetX, DisplayConstants.CameraHeight, this.sceneMeshData.player.position.z + offsetZ);
    this.camera.lookAt(this.sceneMeshData.player.position);
};
Gameplay.prototype.setupEvents = function () {
    this.events.addListener('update', this.player.update, this.player);

    this.monsters.forEach(function(monster) {
        this.events.addListener('update', monster.update, monster);
    }, this);

};
Gameplay.prototype.removeEvents = function () {
    this.events.removeListener('update', this.player.update, this.player);

    this.monsters.forEach(function(monster) {
        this.events.removeListener('update', monster.update, monster);
    }, this);
};
Gameplay.prototype.create = function () {
    this.setupThreeBackground();

    this.strike = new Strike(this, 0, 0);
    this.player = new Player(this, 128, 128, this.strike, 13, 0.082);
    this.player.visible = false;
    this.player.strike.visible = false;

    this.map = this.add.tilemap('test_map');
    this.map.addTilesetImage('tilesheet', 'test_sheet_image');
    this.foreground = this.map.createStaticLayer('foreground', 'tilesheet');
    this.foreground.setCollision([14]);
    this.foreground.visible = false;

    // TODO: restart the scene on appropriate player death
    let resetKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    resetKey.on('down', (ev) => {
        resetKey.removeAllListeners();
        this.removeEvents();
        this.scene.restart();
    });

    this.monsters = [];

    const monsterLayer = this.map.getObjectLayer('enemies');
    this.monsters = monsterLayer.objects.map((monsterData) => {
        if (monsterData.type === 'test_monster') {
            return new Monster(this, monsterData.x, monsterData.y, this.player);
        }

        return null;
    }).filter((newMonster) => { return newMonster !== null});
    this.monsters.forEach(function (m) { m.visible = false; });

    this.physics.add.collider(this.player, this.foreground);
    this.physics.add.collider(this.player, this.monsters);

    this.cameras.cameras[0].startFollow(this.player, true, 0.1, 0.1);

    // UI setup
    this.agitationBar = this.add.rectangle(GAME_WIDTH * 0.5, 0, 1, 16, 0x333333);
    this.agitationBar.scrollFactorX = 0;
    this.agitationBar.scrollFactorY = 0;

    this.setupEvents();
    this.initializeThreeScene(this.player, this.foreground.layer, this.monsters);
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

    this.monsters = [];

    while(this.threeScene.children.length > 0){ 
        this.threeScene.remove(this.threeScene.children[0]); 
    }
    this.three = null;
    this.sceneMeshData = {};
};
