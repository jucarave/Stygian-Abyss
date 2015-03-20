function SaveManager(game){
	this.game = game;
}

SaveManager.prototype = {
	saveGame: function(){
		var saveObject = {
			_c: circular.register('StygianGame'),
			version: version, 
			player: this.game.player,
			inventory: this.game.inventory,
			maps: this.game.maps
		};
		var serialized = circular.serialize(saveObject);
		var serializedObject = JSON.parse(serialized);
		console.log(serializedObject);
	}
}

module.exports = SaveManager;