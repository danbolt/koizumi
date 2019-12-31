

let Gameplay = function (config) {
    Phaser.Scene.call(this, config);

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
    this.actorTable = {};
    this.mixers = [];

    this.mapKey = '';

    this.uiScene = null;

    this.initialized = false;
};
Gameplay.prototype.init = function (sceneData) {
    this.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
    this.renderer.autoClear = false;

    this.mapKey = sceneData.map ? sceneData.map : 'test_map';

    this.events.on('shutdown', this.shutdown, this);
};
Gameplay.prototype.preload = function () {
    // TODO: Move this stuff to another scene

    this.load.spritesheet('test_sheet', 'asset/image/fromJesse.png', { frameWidth: 32, frameHeight: 32 });
    this.load.binary('roompusher', './asset/model/roompusher.glb');
    this.load.binary('badboi', './asset/model/badboi.glb');
    this.load.binary('green_shrimp', './asset/model/green_shrimp.glb');
    this.load.binary('ref', './asset/model/ref.glb');

    this.load.binary(this.mapKey, 'asset/model/' + this.mapKey + '.glb');
    this.load.tilemapTiledJSON(this.mapKey, 'asset/map/' + this.mapKey + '.json');

    this.load.image('test_sheet_image', 'asset/image/fromJesse.png');

    this.load.json('story', 'asset/dialogue/story.json');
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
Gameplay.prototype.initializeThreeScene = function (player, wallLayerData, monsters, map) {
    const loader = new THREE.GLTFLoader();

    // standard ambient lighting for principled BSDFs
    let l = new THREE.AmbientLight(0xFFFFFF);
    l.intensity = 2.0
    this.threeScene.add(l);

    // Player
    let playerMesh = new THREE.Group();
    this.threeScene.add(playerMesh);
    this.sceneMeshData.player = playerMesh;
    this.actorTable['player'] = { MESH: player };

    let playerLight = new THREE.PointLight(0xFFFF77, 2, 10);
    playerLight.position.set(0.15, 0, 0);
    playerLight.decay = 0.5;
    playerMesh.add(playerLight);

    const playerModelData = this.cache.binary.get('roompusher');
    loader.parse(playerModelData, 'asset/model/', (gltf) => {

        // HACK: tweak the scale, position, and rotation
        gltf.scene.position.y = 0.5;
        gltf.scene.rotation.y = Math.PI * 0.5;
        gltf.scene.scale.set(0.5, 0.5, 0.5); 

        playerMesh.add(gltf.scene);
        let mixer = new THREE.AnimationMixer(gltf.scene);
        this.mixers.push(mixer);
        const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'idle');
        const idleAction = mixer.clipAction(idleClip);
        idleAction.play();
        const runClip = THREE.AnimationClip.findByName(gltf.animations, 'run');
        const runAction = mixer.clipAction(runClip);
        runAction.timeScale = 2.1;
        runAction.play();

        //var helper = new THREE.SkeletonHelper( gltf.scene );
        //helper.material.linewidth = 3;
        //this.threeScene.add( helper );

        this.events.addListener('update', () => {
            if (this.player.body.velocity.lengthSq() < 0.1) {
                runAction.stop();
                idleAction.play();
            } else {
                idleAction.stop();
                runAction.play();
            }
        });
    });

    // If we have a map mesh, try loading that. If we don't, then create some dummy cubes and a floor for now
    if (map.properties && map.properties.mesh) {
        const mapMeshName = map.properties.mesh;
        const mapMeshData = this.cache.binary.get(mapMeshName);

        loader.parse(mapMeshData, 'asset/model/', (gltf) => {
            this.threeScene.add(gltf.scene);
        });
    } else {
        // TODO: remove this with a real model later
        let dummyFloorGeom = new THREE.PlaneGeometry(9000, 9000);
        let dummerFloorMaterial = new THREE.MeshBasicMaterial({ color: 0x554444 });
        let dummyFloorMesh = new THREE.Mesh(dummyFloorGeom, dummerFloorMaterial);
        dummyFloorMesh.rotation.x = Math.PI * 1.5;
        dummyFloorMesh.position.y = -0.5;
        this.threeScene.add(dummyFloorMesh);

        // TODO: remove this with a real model later
        let debugWallGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
        let debugWallMaterial = new THREE.MeshBasicMaterial( { color: 0x00FFF0 } );
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
    }

    const exitLightMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, side: THREE.BackSide, opacity: 0.5, transparent: true} );
    const exitLayer = this.map.getObjectLayer('exits');
    exitLayer.objects.forEach((exit) => {
        const exitGeom = new THREE.BoxBufferGeometry(exit.width * INV_GAME_TILE_SIZE, 10, exit.height * INV_GAME_TILE_SIZE);
        const exitMesh = new THREE.Mesh(exitGeom, exitLightMaterial);
        exitMesh.position.set((exit.x + (exit.width * 0.5)) * INV_GAME_TILE_SIZE, 5, (exit.y + (exit.height * 0.5)) * INV_GAME_TILE_SIZE);
        this.threeScene.add(exitMesh);
    });

    // characters
    this.sceneMeshData.monsters = [];
    monsters.forEach((monster, i) => {
        let badboiMeshData = this.cache.binary.get(monster.mesh);
        let monsterMeshClone = new THREE.Group();
        monsterMeshClone.rotation.y = monster.rotation;
        monsterMeshClone.position.set((monster.x - (monster.width * 0.5)) * INV_GAME_TILE_SIZE, 0, (monster.y - (monster.height * 0.5)) * INV_GAME_TILE_SIZE);
        this.sceneMeshData.monsters.push(monsterMeshClone);
        this.threeScene.add( monsterMeshClone );

        loader.parse(badboiMeshData, 'asset/model/', (gltf) => {
            let meshScene = gltf.scene;
            monsterMeshClone.add(meshScene);
            this.actorTable[monster.name] = { MESH: monster };

            if (gltf.animations.length > 0) {
                let mixer = new THREE.AnimationMixer(meshScene);
                this.mixers.push(mixer);
                gltf.animations.forEach((animationData) => {
                    const action = mixer.clipAction(animationData);
                    action.loop = THREE.LoopOnce;
                    this.actorTable[monster.name][animationData.name] = action;
                    //console.log(this.actorTable);
                });
            }
        });
    }, this);
};
Gameplay.prototype.updateThreeScene = function () {
    this.sceneMeshData.player.position.set((this.player.x - (this.player.width * 0.5)) * INV_GAME_TILE_SIZE, 0, (this.player.y - (this.player.height * 0.5)) * INV_GAME_TILE_SIZE);
    this.sceneMeshData.player.rotation.y = this.player.inputData.currentAngle * -1;

    const offsetX = Math.sin(this.player.inputData.cameraAngle.x * Phaser.Math.DEG_TO_RAD) * DisplayConstants.CameraDistance;
    const offsetZ = Math.cos(this.player.inputData.cameraAngle.x * Phaser.Math.DEG_TO_RAD) * DisplayConstants.CameraDistance;
    this.camera.position.set(((this.cameras.cameras[0].scrollX + (this.cameras.cameras[0].displayWidth * 0.5)) * INV_GAME_TILE_SIZE) + offsetX, DisplayConstants.CameraHeight, ((this.cameras.cameras[0].scrollY + (this.cameras.cameras[0].displayHeight * 0.5)) * INV_GAME_TILE_SIZE) + offsetZ);

    const targetMesh = this.sceneMeshData.player;
    this.camera.lookAt(((this.cameras.cameras[0].scrollX + (this.cameras.cameras[0].displayWidth * 0.5)) * INV_GAME_TILE_SIZE), 0, ((this.cameras.cameras[0].scrollY + (this.cameras.cameras[0].displayHeight * 0.5)) * INV_GAME_TILE_SIZE));
};
Gameplay.prototype.setupEvents = function () {
    this.events.addListener('update', this.player.update, this.player);

    this.monsters.forEach(function(monster) {
        this.events.addListener('update', monster.update, monster);
    }, this);

};
Gameplay.prototype.removeEvents = function () {
    this.events.removeListener('update');
    this.events.removeListener('update', this.player.update, this.player);
    this.events.removeListener('shutdown');

    this.monsters.forEach(function(monster) {
        this.events.removeListener('update', monster.update, monster);
    }, this);
};
Gameplay.prototype.create = function (sceneData) {
    this.uiScene = this.scene.get('InGameUI');
    this.setupThreeBackground();

    this.strike = new Strike(this, 0, 0);
    this.player = new Player(this, 128, 128, this.strike, 13, 0.082);
    this.player.visible = false;
    this.player.strike.visible = false;

    this.map = this.add.tilemap(this.mapKey);
    this.map.addTilesetImage('tilesheet', 'test_sheet_image');
    this.exitLayer = this.map.getObjectLayer('exits');
    this.foreground = this.map.createStaticLayer('foreground', 'tilesheet');
    this.foreground.setCollision([14]);
    this.foreground.visible = false;

    this.monsters = [];

    const monsterLayer = this.map.getObjectLayer('enemies');
    this.monsters = monsterLayer.objects.map((monsterData) => {
        if (monsterData.type === 'test_monster') {
            let m = new Monster(this, monsterData.x, monsterData.y, this.player);
            m.rotation = monsterData.rotation;
            m.name = monsterData.name;
            m.convo = monsterData.properties ? monsterData.properties.convo : undefined;
            m.mesh = monsterData.properties ? monsterData.properties.mesh : undefined;
            return m;
        }

        return null;
    }).filter((newMonster) => { return newMonster !== null});
    this.monsters.forEach(function (m) { m.visible = false; });

    this.physics.add.collider(this.player, this.foreground);

    this.cameras.cameras[0].startFollow(this.player, false, GameplayConstants.CameraFollowDecay, GameplayConstants.CameraFollowDecay);

    // UI setup
    this.setupEvents();
    this.initializeThreeScene(this.player, this.foreground.layer, this.monsters, this.map);

    this.initialized = true;
};
Gameplay.prototype.dialogueDone = function () {
    this.player.currentState = PlayerStates.NORMAL;
    this.cameras.cameras[0].pan(this.player.x, this.player.y, 200);
    this.cameras.cameras[0].startFollow(this.player, false, GameplayConstants.CameraFollowDecay, GameplayConstants.CameraFollowDecay);
};
Gameplay.prototype.panToSpeaker = function(speakerName) {
    if (this.player.currentState !== PlayerStates.STRIKING) {
        console.warn('Tried to pan to ' + speakerName + ' while not in dialogue!')
        return;
    }

    if (this.actorTable[speakerName] === undefined) {
        console.warn('speaker ' + speakerName + ' not found in actor table!');
        return;
    }
    const speaker = this.actorTable[speakerName].MESH;
    this.cameras.cameras[0].pan(speaker.x, speaker.y, 300);
};
Gameplay.prototype.playCharacterAnimation = function(character, animationName) {
    const actor = this.actorTable[character];
    if (actor === undefined) {
        console.warn('could not find actor ' + character + 'for animating with ' + animationName);
        return;
    }

    const anim = actor[animationName];
    if (anim === undefined) {
        console.warn('could not find animation ' + animationName + 'for ' + character);
        return;
    }

    anim.reset();
    anim.play();
};
Gameplay.prototype.update = function () {
    if (this.initialized !== true) {
        return;
    }

    this.mixers.forEach((mixer) => {
        // TODO: variable timestep this for lower framerates
        const sixtyFramesPerSecond = 0.016;
        mixer.update(sixtyFramesPerSecond);
    })
    this.updateThreeScene();

    // Check if the player has entered an exit
    for (let i = 0; i < this.exitLayer.objects.length; i++) {
        const exit = this.exitLayer.objects[i];

        // PERF: do less per-frame allocations by not using an array
        const overlappingEntities = this.physics.overlapRect(exit.x, exit.y, exit.width, exit.height);

        // TODO: Only check for the player
        if (overlappingEntities.length > 0) {
            //console.log(exit.name);
            this.scene.start('Gameplay', {
                map: exit.name
            });
            return;
        }
    }

    // Check for closest monster if able
    if (this.player.currentState === PlayerStates.NORMAL) {
        let closeMonster = null;
        this.monsters.forEach(function (m) {
            if (Phaser.Math.Distance.Squared(this.player.x, this.player.y, m.x, m.y) < (GAME_TIME_SIZE_SQ * 5.4)) {
                closeMonster = m;
            }
        }, this);
        if (closeMonster !== null && (closeMonster.convo !== undefined)) {
            this.uiScene.toggleTalkPrompt(true);

            if (this.player.inputData.aButtonDown) {
                this.uiScene.toggleTalkPrompt(false);

                this.cameras.cameras[0].stopFollow();

                this.player.currentState = PlayerStates.STRIKING;
                this.uiScene.startDialogue(closeMonster.convo);
            }
        } else {
            this.uiScene.toggleTalkPrompt(false);
        }
    }
};
Gameplay.prototype.shutdown = function () {
    this.removeEvents();
    this.player = null;
    this.strike = null;
    this.map = null;
    this.foreground = null;

    this.monsters = [];

    while(this.threeScene.children.length > 0){ 
        this.threeScene.remove(this.threeScene.children[0]); 
    }
    this.three = null;
    this.sceneMeshData = {};
    this.actorTable = {};
    this.mixers = [];

    this.initialized = false;
};
