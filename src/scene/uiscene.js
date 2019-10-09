let InGameUI = function () {
    this.isPresenting = false;

    this.dialogueText = null;
    this.talkPromptText = null;

    this.gameplayScene = null;
};
InGameUI.prototype.preload = function () {
    this.load.bitmapFont('newsgeek', 'asset/font/newsgeek.png', 'asset/font/newsgeek.fnt');
};
InGameUI.prototype.create = function () {
    this.dialogueText = this.add.bitmapText(32, 128, 'newsgeek', 'hello im percy');
    this.dialogueText.visible = false;

    this.talkPromptText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'newsgeek', 'talk!');
    this.talkPromptText.visible = false;
    this.talkPromptText.setCenterAlign();

    this.gameplayScene = this.scene.get('Gameplay');
};
InGameUI.prototype.shutdown = function () {
    this.isPresenting = false;

    this.dialogueText = null;
    this.talkPromptText = null;

    this.gameplayScene = null;
};

// Commands from elsewhere
InGameUI.prototype.reboot = function () {
    this.scene.restart();
};
InGameUI.prototype.toggleTalkPrompt = function(value) {
  this.talkPromptText.visible = value;
};
InGameUI.prototype.startDialogue = function(key) {
  this.isPresenting = true;

  // HACK: some dummy text for now
  const q = 'hello im ' + key;

  this.dialogueText.text = '';
  this.dialogueText.visible = true;

  let i = 0;

  let u = () => {
    i++;
    this.dialogueText.text = q.substr(0, i);


    if (i < q.length) {
      this.time.delayedCall(20, u, [], this);
    } else {
      this.time.delayedCall(1000, () => {
        this.dialogueText.visible = false;
        this.gameplayScene.dialogueDone();
      }, [], this);
    }
  };
  this.time.delayedCall(20, u, [], this);
};
