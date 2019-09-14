let main = function() {
    let game = new Phaser.Game({
                        width: 320,
                        height: 240,
                        type : Phaser.WEBGL,
                        pixelArt: true,
                        antialias: false,
                        scaleMode: Phaser.Scale.ScaleModes.FIT,
                        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                        physics: {
                            default: 'arcade',
                            arcade: {
                                gravity: { y: 0 },
                                debug: false
                            }
                        },
                     });

    game.scene.add('Gameplay', Gameplay, false);
    game.scene.start('Gameplay');
};
