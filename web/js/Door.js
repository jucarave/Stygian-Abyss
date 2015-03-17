function Door(mapManager, wallPosition, dir, textureCode, wallTexture, lock){
	this.mapManager = mapManager;
	this.wallPosition = wallPosition;
	this.rotation = 0;
	this.dir = dir;
	this.textureCode = textureCode;
	this.rTextureCode = textureCode; // Delete

	this.doorPosition = wallPosition.clone();
	this.wallTexture = wallTexture;
		
	this.boundingBox = null;
	this.position = wallPosition.clone();
	if (dir == "H"){ this.position.sum(vec3(-0.25, 0.0, 0.0)); }else
	if (dir == "V"){ this.position.sum(vec3(0.0, 0.0, -0.25)); this.rotation = Math.PI_2; }
	
	this.lock = lock;
	this.closed = true;
	this.animation =  0;
	this.openSpeed = Math.degToRad(10);
	
	this.modifyCollision();
}

Door.prototype.getBoundingBox = function(){
	return this.boundingBox;
};

Door.prototype.activate = function(){
	if (this.animation != 0) return;
	
	if (this.lock){
		var key = this.mapManager.getPlayerItem(this.lock);
		if (key){
			this.mapManager.addMessage(key.name + " used");
			this.mapManager.removePlayerItem(this.lock);
			this.lock = null;
		}else{
			this.mapManager.addMessage("Locked");
			return;
		}
	}
	
	if (this.closed) this.animation = 1;
	else this.animation = 2; 
};

Door.prototype.isSolid = function(){
	if (this.animation != 0) return true;
	return this.closed;
};

Door.prototype.modifyCollision = function(){
	if (this.dir == "H"){
		if (this.closed){
			this.boundingBox = {
				x: this.position.a + 0.5, y: this.position.c + 0.5 - 0.05,
				w: 0.5, h: 0.1
			};
		}else{
			this.boundingBox = {
				x: this.position.a + 0.5, y: this.position.c + 0.5,
				w: 0.1, h: 0.5
			};
		}
	}else{
		if (this.closed){
			this.boundingBox = {
				x: this.position.a + 0.5 - 0.05, y: this.position.c + 0.5,
				w: 0.1, h: 0.5
			};
		}else{
			this.boundingBox = {
				x: this.position.a + 0.5, y: this.position.c + 0.5,
				w: 0.5, h: 0.1
			};
		}
	}
};

Door.prototype.loop = function(){
	var an1 = ((this.animation == 1 && this.dir == "H") || (this.animation == 2 && this.dir == "V"));
	var an2 = ((this.animation == 2 && this.dir == "H") || (this.animation == 1 && this.dir == "V"));
	
	if (an1 && this.rotation < Math.PI_2){
		this.rotation += this.openSpeed;
		if (this.rotation >= Math.PI_2){
			this.rotation = Math.PI_2;
			this.animation  = 0;
			this.closed = (this.dir == "V");
			this.modifyCollision();
		}
	}else if (an2 && this.rotation > 0){
		this.rotation -= this.openSpeed;
		if (this.rotation <= 0){
			this.rotation = 0;
			this.animation  = 0;
			this.closed = (this.dir == "H");
			this.modifyCollision();
		}
	}
};
