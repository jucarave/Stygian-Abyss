function Missile(position, rotation, type, target, mapManager){
	var gl = mapManager.game.GL.ctx;
	
	this.position = position;
	this.rotation = rotation;
	this.mapManager = mapManager;
	this.billboard = ObjectFactory.billboard(vec3(1.0,1.0,1.0), vec2(1.0, 1.0), gl);
	this.type = type;
	this.target = target;
	this.destroyed = false;
	this.solid = false;
	this.str = 0;
	this.speed = 0.3;
	this.missed = false;
	
	this.vspeed = 0;
	this.gravity = 0;
	
	var subImg = 0;
	switch (type){
		case 'sling': 
			subImg = 0;
			this.speed = 0.2; 
			this.gravity = 0.005;
		break;
		case 'bow': 
			subImg = 1;
			this.speed = 0.2; 
		break;
		case 'crossbow': 
			subImg = 2; 
			this.speed = 0.3;
		break;
		case 'magicMissile': 
			subImg = 3; 
			this.speed = 0.4;
		break;
		case 'iceBall':
			subImg = 4; 
			this.speed = 0.4;
		break;
		case 'fireBall':
			subImg = 5; 
			this.speed = 0.4;
		break;
		case 'kill':
			subImg = 6; 
			this.speed = 0.5;
		break;
	}
	
	this.textureCode = 'bolts';
	this.billboard.texBuffer = mapManager.game.objectTex.bolts.buffers[subImg];
}

Missile.prototype.checkCollision = function(){
	var map = this.mapManager.map;
	if (this.position.a < 0 || this.position.c < 0 || this.position.a >= map[0].length || this.position.c >= map.length) return false;
	
	var x = this.position.a << 0;
	var y = this.position.b + 0.5;
	var z = this.position.c << 0;
	var tile = map[z][x];
	
	if (tile.w || tile.wd || tile.wd) return false;
	if (y < tile.fy || y > tile.ch) return false;
	
	var ins, dfs;
	if (this.target == 'enemy'){
		var instances = this.mapManager.getInstancesNearest(this.position, 0.5, 'enemy');
		var dist = 10000;
		if (instances.length > 1){
			for (var i=0,len=instances.length;i<len;i++){
				var xx = Math.abs(this.position.a - instances[i].position.a);
				var yy = Math.abs(this.position.c - instances[i].position.c);
				
				var d = xx * xx + yy * yy;
				if (d < dist){
					dist = d;
					ins = instances[i];
				}
			}
		}else if (instances.length == 1){
			ins = instances[0];
		}else{
			return true;
		}
		
		dfs = rollDice(ins.enemy.stats.dfs);
	}else{
		ins = this.mapManager.player;
		dfs = rollDice(this.mapManager.game.player.stats.dfs);
	}
	
	var dmg = Math.max(this.str - dfs, 0);
	
	if (this.missed){
		this.mapManager.addMessage("Missed!");
		return;
	}
	
	if (dmg != 0){
		this.mapManager.addMessage(dmg + " points inflicted");
		ins.receiveDamage(dmg);
	}else{
		this.mapManager.addMessage("Blocked!");
	}
	
	return false;
};

Missile.prototype.step = function(){
	this.vspeed += this.gravity;
	
	var xTo = Math.cos(this.rotation.b) * this.speed;
	var yTo = Math.sin(this.rotation.a) * this.speed - this.vspeed;
	var zTo = -Math.sin(this.rotation.b) * this.speed;
	
	this.position.sum(vec3(xTo, yTo, zTo));
	
	if (!this.checkCollision()){
		this.destroyed = true;
	}
	
};

Missile.prototype.draw = function(){
	if (this.destroyed) return;
	
	var game = this.mapManager.game;
	game.drawBillboard(this.position,this.textureCode,this.billboard);
};

Missile.prototype.loop = function(){
	if (this.destroyed) return;
	
	this.step();
	this.draw();
};