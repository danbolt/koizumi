let InGameUI = function () {
  this.keyboard = null;
  this.isPresenting = false;

  this.choiceText = null;
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
  this.keyboard = this.scene.scene.input.keyboard;

  this.choiceText = this.add.bitmapText(16, 16, 'newsgeek', '');
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
  this.keyboard = null;
  this.isPresenting = false;

  this.choiceText = null;
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

  let doChoices = () => {
    const choices = this.story.currentChoices;

    let currentChoiceIndex = 0;
    let refreshChoiceText = () => {
      const choiceText = this.choiceText;
      choiceText.text = '';
      choices.forEach((choice, choiceIndex) => {
        if (choiceIndex === currentChoiceIndex) {
          choiceText.text += '>';
        } else {
          choiceText.text += ' ';
        }

        choiceText.text += choice.text;
        choiceText.text += '\n';
      });
    };
    refreshChoiceText();

    // TODO: make these user-settable for accessibility
    const downFunc = function (event) {
      currentChoiceIndex = (currentChoiceIndex + 1) % choices.length;
      refreshChoiceText();
    };
    const upFunc = function (event) {
      currentChoiceIndex = (currentChoiceIndex - 1 + choices.length) % choices.length;
      refreshChoiceText();
    };
    const selectFunc = function (event) {
      this.choiceText.text = '';
      this.input.keyboard.removeListener('keydown-S', downFunc, this);
      this.input.keyboard.removeListener('keydown-W', upFunc, this);
      this.input.keyboard.removeListener('keydown-X', selectFunc, this);

      this.story.ChooseChoiceIndex(currentChoiceIndex);
      doText();
    }
    this.input.keyboard.on('keydown-S', downFunc, this);
    this.input.keyboard.on('keydown-W', upFunc, this);
    this.input.keyboard.on('keydown-X', selectFunc, this);
  };

  let doText = () => {
    let line = this.story.Continue();

    const tags = this.story.currentTags;
    tags.forEach((tagString) => {
      const splitted = tagString.split('=');
      if (tagString.length < 2) {
        return;
      }

      const tagType = splitted[0];
      const tagData = splitted[1];

      // Speaker panning
      if (tagType === 'speaker') {
        this.gameplayScene.panToSpeaker(tagData);
        return;
      }

      // Animation playing
      if (tagType === 'animation') {
        let splitData = tagData.split(',');
        if (splitData.length < 2) {
          console.warn('Bad animation pair data: ' + tagData);
          return;
        }

        this.gameplayScene.playCharacterAnimation(splitData[0], splitData[1]);
        return;
      }
    });

    let i = 0;
    let u = () => {
      i++;
      this.dialogueText.text = line.substr(0, i);

      if (i < line.length) {
        this.time.delayedCall(DisplayConstants.TextBipTime, u, [], this);
      } else {
        this.time.delayedCall(DisplayConstants.EndLineTime, () => {
          // If we can't continue and there are no choices, end the dialogue.
          if ((!(this.story.canContinue)) && (this.story.currentChoices.length < 1)) {
            this.isPresenting = false;
            this.dialogueText.visible = false;
            this.gameplayScene.dialogueDone();
            return;
          }

          // If we can't continue but there are choices, enter the choice state?
          if ((!(this.story.canContinue)) && (this.story.currentChoices.length > 0)) {
            doChoices();
            return;
          }

          this.dialogueText.text = '';
          doText();
        }, [], this);
      }
    };
    this.time.delayedCall(DisplayConstants.TextBipTime, u, [], this);
  };
  doText();
};
