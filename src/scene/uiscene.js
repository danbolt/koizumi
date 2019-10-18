let InGameUI = function () {
    this.isPresenting = false;

    this.dialogueText = null;
    this.talkPromptText = null;

    this.gameplayScene = null;

    this.story = null;
};
InGameUI.prototype.preload = function () {
    this.load.bitmapFont('newsgeek', 'asset/font/newsgeek.png', 'asset/font/newsgeek.fnt');

    this.load.json('story', 'asset/dialogue/story.json');
};
InGameUI.prototype.create = function () {
    this.dialogueText = this.add.bitmapText(8, 128, 'newsgeek', 'hello im percy');
    this.dialogueText.visible = false;

    this.talkPromptText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'newsgeek', 'talk!');
    this.talkPromptText.visible = false;
    this.talkPromptText.setCenterAlign();

    const storyContent = this.cache.json.get('story');
    this.story = new inkjs.Story(storyContent);

    this.gameplayScene = this.scene.get('Gameplay');
};
InGameUI.prototype.shutdown = function () {
    this.isPresenting = false;

    this.dialogueText = null;
    this.talkPromptText = null;

    this.gameplayScene = null;

    this.story = null;
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

  this.story.ChoosePathString(key, true, []);

  this.dialogueText.text = '';
  this.dialogueText.visible = true;

  let doText = () => {
    let line = this.story.Continue();
    let i = 0;
    let u = () => {
      i++;
      this.dialogueText.text = line.substr(0, i);

      if (i < line.length) {
        this.time.delayedCall(DisplayConstants.TextBipTime, u, [], this);
      } else {
        this.time.delayedCall(DisplayConstants.EndLineTime, () => {
          if (!(this.story.canContinue)) {
            this.isPresenting = false;
            this.dialogueText.visible = false;
            this.gameplayScene.dialogueDone();
          } else {
            this.dialogueText.text = '';
            doText();
          }
        }, [], this);
      }
    };
    this.time.delayedCall(DisplayConstants.TextBipTime, u, [], this);
  };
  doText();
};
