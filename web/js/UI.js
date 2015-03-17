function UI(size, container){
	this.initCanvas(size, container);
}

UI.prototype.initCanvas = function(size, container){
	var canvas = document.createElement("canvas");
	canvas.width = size.a;
	canvas.height = size.b;
	
	canvas.style.position = "absolute";
	canvas.style.top = 0;
	canvas.style.height = "100%";
	
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.ctx.width = canvas.width;
	this.ctx.height = canvas.height;
	
	container.appendChild(this.canvas);
	
	this.scale = canvas.offsetHeight / size.b;
	
	canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;
};

UI.prototype.drawSprite = function(sprite, x, y, subImage){
	var xImg = subImage % sprite.imgNum;
	var yImg = (subImage / sprite.imgNum) << 0;
	
	this.ctx.drawImage(sprite,
		xImg * sprite.imgWidth, yImg * sprite.imgHeight, sprite.imgWidth, sprite.imgHeight,
		x, y, sprite.imgWidth, sprite.imgHeight
		);
};

UI.prototype.drawText = function(text, x, y, console){
	var w = console.spaceChars;
	var h = console.spriteFont.height;
	for (var j=0,jlen=text.length;j<jlen;j++){
		var chara = text.charAt(j);
		var ind = console.listOfChars.indexOf(chara);
		if (ind != -1){
			this.ctx.drawImage(console.spriteFont,
				w * ind, 0, w, h,
				x, y, w, h);
		}
		x += w;
	}
}

UI.prototype.clear = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};