function EndingScreen(/*Game*/ game){
	this.game = game;
	this.currentScreen = 0;
}

module.exports = EndingScreen;

EndingScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		if (this.currentScreen == 2)
			this.game.newGame();
		else
			this.currentScreen++;
	}
};

EndingScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	if (this.currentScreen == 0)
		ui.drawImage(this.game.images.endingScreen, 0, 0);
	else if (this.currentScreen == 1)
		ui.drawImage(this.game.images.endingScreen2, 0, 0);
	else
		ui.drawImage(this.game.images.endingScreen3, 0, 0);
};
