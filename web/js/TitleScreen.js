var SelectClass = require('./SelectClass');

function TitleScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
	this.currentScreen = 0;
}

module.exports = TitleScreen;

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		if (this.currentScreen == 0){
			if (this.game.saveManager.restoreGame(this.game)){
				this.game.printWelcomeBack();
				this.game.loadMap(this.game.player.currentMap, this.game.player.currentDepth);
			} else {
				this.currentScreen++;
			}
		} else if (this.currentScreen == 4){
			this.game.scene = new SelectClass(this.game);
		} else {
			this.currentScreen++;
		}
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	switch (this.currentScreen){
	case 0:
		ui.drawImage(this.game.images.titleScreen, 0, 0);
		break;
	case 1:
		ui.drawImage(this.game.images.intro1, 0, 0);
		break;
	case 2:
		ui.drawImage(this.game.images.intro2, 0, 0);
		break;
	case 3:
		ui.drawImage(this.game.images.intro3, 0, 0);
		break;
	case 4:
		ui.drawImage(this.game.images.intro4, 0, 0);
		break;
	}
	
};
