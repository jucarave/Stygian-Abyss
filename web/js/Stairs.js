function Stairs(position, mapManager, direction){
	this.position = position;
	this.mapManager = mapManager;
	this.direction = direction;
	this.stairs = true;
	
	this.imgInd = 0;
	
	this.targetId = this.mapManager.depth;
	if (this.direction == 'up'){
		this.targetId -= 1;
	}else if (this.direction == 'down'){
		this.targetId += 1;
		this.imgInd = 1;
	}
	
	this.billboard = ObjectFactory.billboard(vec3(1.0, 1.0, 1.0), vec2(1.0, 1.0), this.mapManager.game.GL.ctx);
	this.billboard.texBuffer = this.mapManager.game.objectTex.stairs.buffers[this.imgInd];
	this.billboard.noRotate = true;
	
	this.tile = null;
}

Stairs.prototype.activate = function(){
	if (this.targetId < 9)
		this.mapManager.game.loadMap(false, this.targetId);
	else {
		this.mapManager.game.loadMap('codexRoom');
	}
};

Stairs.prototype.getTile = function(){
	if (this.tile != null) return;
	
	this.tile = this.mapManager.map[this.position.c << 0][this.position.a << 0];
};

Stairs.prototype.draw = function(){
	var game = this.mapManager.game;
	
	if (this.direction == 'up' && this.tile.ch > 1){
		var y = this.position.b << 0;
		for (var i=y+1;i<this.tile.ch;i++){
			var pos = this.position.clone();
			pos.b = i;
			
			this.billboard.texBuffer = this.mapManager.game.objectTex.stairs.buffers[2];
			game.drawBillboard(pos,'stairs',this.billboard);
		}
		
		this.billboard.texBuffer = this.mapManager.game.objectTex.stairs.buffers[3];
		game.drawBillboard(this.position,'stairs',this.billboard);
	}else{
		game.drawBillboard(this.position,'stairs',this.billboard);
	}
};

Stairs.prototype.loop = function(){
	this.getTile();
	this.draw();
};
