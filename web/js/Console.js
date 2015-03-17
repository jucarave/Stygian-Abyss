function Console(/*Int*/ maxMessages, /*Int*/ limit, /*Int*/ splitAt,  /*Game*/ game){
	this.messages = [];
	this.maxMessages = maxMessages;
	this.game = game;
	this.limit = limit;
	this.splitAt = splitAt;
	
	this.spriteFont = null;
	this.listOfChars = null;
	this.sfContext = null;
	this.spaceChars = null;
	this.spaceLines = null;
}


Console.prototype.render = function(/*Int*/ x, /*Int*/ y){
	var s = this.messages.length - 1;
	var ctx = this.game.UI.ctx;
	
	ctx.drawImage(this.sfContext.canvas, x, y);
};

Console.prototype.createSpriteFont = function(/*Image*/ spriteFont, /*String*/ charactersUsed, /*Int*/ verticalSpace){
	this.spriteFont = spriteFont;
	this.listOfChars = charactersUsed;
	this.spaceLines = verticalSpace;
	
	var canvas = document.createElement("canvas");
	canvas.width = 100;
	canvas.height = 100;
	this.sfContext = canvas.getContext("2d");
	this.sfContext.canvas = canvas;
	
	this.spaceChars = spriteFont.width / charactersUsed.length;
};

Console.prototype.formatText = function(/*String*/ message){
	var txt = message.split(" ");
	var line = "";
	var ret = [];
	
	for (var i=0,len=txt.length;i<len;i++){
		var word = txt[i];
		if ((line + " " + word).length <= this.splitAt){
			if (line != "") line += " ";
			line += word;
		}else{
			ret.push(line);
			line = word;
		}
	}
	
	ret.push(line);
	
	return ret;
};

Console.prototype.addSFMessage = function(/*String*/ message){
	var msg = this.formatText(message);
	for (var i=0,len=msg.length;i<len;i++){
		this.messages.push(msg[i]);
	}
	
	if (this.messages.length > this.limit){
		this.messages.splice(0,1);
	}
	
	var c = this.sfContext.canvas;
	var w = this.spaceChars;
	var h = this.spriteFont.height;
	this.sfContext.clearRect(0,0,c.width,c.height);
	for (var i=0,len=this.messages.length;i<len;i++){
		var msg = this.messages[i];
		var x = 0;
		var y = (this.spaceLines * this.limit) - this.spaceLines * (len - i - 1);
		
		var mW = msg.length * w;
		if (mW > c.width) c.width = mW + (2 * w);
		
		for (var j=0,jlen=msg.length;j<jlen;j++){
			var chara = msg.charAt(j);
			var ind = this.listOfChars.indexOf(chara);
			
			if (ind != -1){
				this.sfContext.drawImage(this.spriteFont,
					w * ind, 0, w, h,
					x, y, w, h);
			}
			
			x += w;
		}
	}
};
