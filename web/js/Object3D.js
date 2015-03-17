function Object3D(position, model, texture, mapManager){
	this.position = position;
	this.rotation = vec3(0,0,0);
	this.model = model;
	this.texture = texture;
	this.mapManager = mapManager;
	
	this.visible = true;
	this.destroyed = false;
}

Object3D.prototype.activate = function(){
};

Object3D.prototype.draw = function(){
	if (!this.visible) return;
	var game = this.mapManager.game;
	
	this.model.position = this.position;
	this.model.rotation = this.rotation;
	game.drawObject(this.model, this.texture);
};

Object3D.prototype.loop = function(){
	this.draw();
};
