function SelectClass(/*Game*/ game){
	this.game = game;
}

SelectClass.prototype.step = function(){
	var game = this.game;
	var playerS = game.player;
	if (game.getKeyPressed(13) || game.getMouseButtonPressed()){
		var mouse = game.mouse;
		
		if (game.mouse.a >= 154 && game.mouse.a < 214 && game.mouse.b >= 1){
			if (game.mouse.b < 61){
				playerS.setVirtue("Compassion");
			}else if (game.mouse.b >= 67 && game.mouse.b < 127){
				playerS.setVirtue("Honor");
			}else if (game.mouse.b >= 133 && game.mouse.b < 193){
				playerS.setVirtue("Humility");
			}
		}else if (game.mouse.a >= 221 && game.mouse.a < 280 && game.mouse.b >= 1){
			if (game.mouse.b < 61){
				playerS.setVirtue("Honesty");
			}else if (game.mouse.b >= 133 && game.mouse.b < 193){
				playerS.setVirtue("Sacrifice");
			}
		}else if (game.mouse.a >= 288 && game.mouse.a < 347 && game.mouse.b >= 1){
			if (game.mouse.b < 61){
				playerS.setVirtue("Valor");
			}else if (game.mouse.b >= 67 && game.mouse.b < 127){
				playerS.setVirtue("Spirituality");
			}else if (game.mouse.b >= 133 && game.mouse.b < 193){
				playerS.setVirtue("Justice");
			}
		}
		
		if (playerS.virtue != null){
			game.createInitialInventory(playerS.className);
			game.loadMap(false, 1);
		}
	}
};

SelectClass.prototype.loop = function(){
	this.step();
	
	var ui = this.game.getUI();
	ui.drawImage(this.game.images.selectClass, 0, 0);
};
