function EndingScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
}

EndingScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		//TODO: Goto title
	}
};

EndingScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	ui.drawImage(this.game.images.endingScreen, 0, 0);
};
