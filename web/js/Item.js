function Item(position, item, mapManager){
	var gl = mapManager.game.GL.ctx;
	
	this.position = position;
	this.item = null;
	this.mapManager = mapManager;
	this.billboard = ObjectFactory.billboard(vec3(1.0,1.0,1.0), vec2(1.0, 1.0), gl);
	this.billboard.texBuffer = null;
	this.textureCode = null;
	
	this.destroyed = false;
	this.solid = false;
	
	if (item) this.setItem(item);
}

Item.prototype.setItem = function(item){
	this.item = item;
	this.billboard.texBuffer = this.mapManager.game.objectTex[this.item.tex].buffers[this.item.subImg];
	this.textureCode = item.tex;
};

Item.prototype.activate = function(){
	var mm = this.mapManager;
	var game = this.mapManager.game;
	if (this.item.isItem){
		if (this.item.type == 'codex'){
			// 10 lines
			mm.addMessage("The boundless knownledge of the Codex is revealed unto thee.");
			mm.addMessage("A voice thunders!")
			mm.addMessage("Thou hast proven thyself to be truly good in nature")
			mm.addMessage("Thou must know that thy quest to become an Avatar is the endless ")
			mm.addMessage("quest of a lifetime.");
			mm.addMessage("Avatarhood is a living gift, It must always and forever be nurtured");
			mm.addMessage("to fluorish, for if thou dost stray from the paths of virtue, thy way");
			mm.addMessage("may be lost forever.")
			mm.addMessage("Return now unto thine our world, live there as an example to thy");
			mm.addMessage("people, as our memory of thy gallant deeds serves us.")
		} else if (game.addItem(this.item)){
			var stat = '';
			if (this.item.status !== undefined)
				stat = ItemFactory.getStatusName(this.item.status) + ' ';
			
			mm.addMessage(stat + this.item.name + " picked.");
			this.destroyed = true;
		}else{
			mm.addMessage("You can't carry any more items");
		}
	}
};

Item.prototype.draw = function(){
	if (this.destroyed) return;
	
	var game = this.mapManager.game;
	game.drawBillboard(this.position,this.textureCode,this.billboard);
};

Item.prototype.loop = function(){
	if (this.destroyed) return;
	if (this.mapManager.game.paused){
		this.draw(); 
		return;
	}
	
	this.draw();
};