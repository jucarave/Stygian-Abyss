var SelectClass = require('./SelectClass');

function TitleScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
}

module.exports = TitleScreen;

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		this.game.scene = new SelectClass(this.game);
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	ui.drawImage(this.game.images.titleScreen, 0, 0);
};
