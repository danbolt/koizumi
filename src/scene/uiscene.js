let InGameUI = function () {
    this.dialogueText = null;
};
InGameUI.prototype.preload = function () {
    this.load.bitmapFont('newsgeek', 'asset/font/newsgeek.png', 'asset/font/newsgeek.fnt');
};
InGameUI.prototype.create = function () {
    this.dialogueText = this.add.bitmapText(8, 8, 'newsgeek', 'foo foo...' + ~~(Math.random() * 100));
};
InGameUI.prototype.shutdown = function () {
    this.dialogueText = null;
};
InGameUI.prototype.reboot = function () {
    this.scene.restart();
};

