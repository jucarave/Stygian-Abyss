(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\AnimatedTexture.js":[function(require,module,exports){
module.exports = {
	_1Frame: [],
	_2Frames: [],
	_3Frames: [],
	_4Frames: [],
	itemCoords: [],
	
	init: function(gl){
		// 1 Frame
		var coords = [1.0,1.0,0.0,1.0,1.0,0.00,0.00,0.00];
		this._1Frame.push(this.prepareBuffer(coords, gl));
		
		// 2 Frames
		coords = [0.50,1.00,0.00,1.00,0.50,0.00,0.00,0.00];
		this._2Frames.push(this.prepareBuffer(coords, gl));
		coords = [1.00,1.00,0.50,1.00,1.00,0.00,0.50,0.00];
		this._2Frames.push(this.prepareBuffer(coords, gl));
		
		// 3 Frames, 4 Frames
		coords = [0.25,1.00,0.00,1.00,0.25,0.00,0.00,0.00];
		this._3Frames.push(this.prepareBuffer(coords, gl));
		this._4Frames.push(this.prepareBuffer(coords, gl));
		coords = [0.50,1.00,0.25,1.00,0.50,0.00,0.25,0.00];
		this._3Frames.push(this.prepareBuffer(coords, gl));
		this._4Frames.push(this.prepareBuffer(coords, gl));
		coords = [0.75,1.00,0.50,1.00,0.75,0.00,0.50,0.00];
		this._3Frames.push(this.prepareBuffer(coords, gl));
		this._4Frames.push(this.prepareBuffer(coords, gl));
		coords = [1.00,1.00,0.75,1.00,1.00,0.00,0.75,0.00];
		this._4Frames.push(this.prepareBuffer(coords, gl));
	},
	
	prepareBuffer: function(coords, gl){
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
		texBuffer.numItems = coords.length;
		texBuffer.itemSize = 2;
		
		return texBuffer;
	},
	
	getByNumFrames: function(numFrames){
		if (numFrames == 1) return this._1Frame; else
		if (numFrames == 2) return this._2Frames; else
		if (numFrames == 3) return this._3Frames; else
		if (numFrames == 4) return this._4Frames;
	},
	
	getTextureBufferCoords: function(xImgNum, yImgNum, gl){
		var ret = [];
		var width = 1 / xImgNum;
		var height = 1 / yImgNum;
		
		for (var i=0;i<yImgNum;i++){
			for (var j=0;j<xImgNum;j++){
				var x1 = j * width;
				var y1 = 1 - i * height - height;
				
				var x2 = x1 + width;
				var y2 = y1 + height;
				
				var coords = [x2,y2,x1,y2,x2,y1,x1,y1];
				ret.push(this.prepareBuffer(coords, gl));
			}
		}
		
		return ret;
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Audio.js":[function(require,module,exports){
var Utils = require('./Utils');
function AudioAPI(){
	this._audio = [];
	
	this.audioCtx = null;
	this.gainNode = null;
	this.muted = false;
	
	this.initAudioEngine();
}

module.exports = AudioAPI;

AudioAPI.prototype.initAudioEngine = function(){
	if (window.AudioContext){
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
	}else
		alert("Your browser doesn't support the Audio API");
};

AudioAPI.prototype.loadAudio = function(url, isMusic){
	var eng = this;
	if (!eng.audioCtx) return null;
	
	var audio = {buffer: null, source: null, ready: false, isMusic: isMusic, pausedAt: 0};
	
	var http = Utils.getHttp();
	http.open('GET', url, true);
	http.responseType = 'arraybuffer';
	
	http.onload = function(){
		eng.audioCtx.decodeAudioData(http.response, function(buffer){
			audio.buffer = buffer;
			audio.ready = true;
		}, function(msg){
			alert(msg);
		});
	};
	
	http.send();
	
	this._audio.push(audio);
	
	return audio;
};

AudioAPI.prototype.stopMusic = function(){
	for (var i=0,len=this._audio.length;i<len;i++){
		var audio = this._audio[i];
		
		if (audio.timeO){
			clearTimeout(audio.timeO);
		}else if (audio.isMusic && audio.source){
			audio.source.stop();
			audio.source = null;
		}
	}
};

AudioAPI.prototype.playSound = function(soundFile, loop, tryIfNotReady, volume){
	var eng = this;
	if (!soundFile || !soundFile.ready){
		if (tryIfNotReady){ soundFile.timeO = setTimeout(function(){ eng.playSound(soundFile, loop, tryIfNotReady, volume); }, 1000); } 
		return;
	}
	
	if (soundFile.isMusic) this.stopMusic();
	
	soundFile.timeO = null;
	soundFile.playing = true;
	 
	var source = eng.audioCtx.createBufferSource();
	source.buffer = soundFile.buffer;
	
	var gainNode;
	if (volume !== undefined){
		gainNode = this.audioCtx.createGain();
		gainNode.gain.value = volume;
		soundFile.volume = volume;
	}else{
		gainNode = eng.gainNode;
	}
	
	source.connect(gainNode);
	gainNode.connect(eng.audioCtx.destination);
	
	if (soundFile.pausedAt != 0){
		soundFile.startedAt = Date.now() - soundFile.pausedAt;
		source.start(0, (soundFile.pausedAt / 1000) % soundFile.buffer.duration);
		soundFile.pausedAt = 0;
	}else{
		soundFile.startedAt = Date.now();
		source.start(0);
	}
	source.loop = loop;
	source.looping = loop;
	source.onended = function(){ soundFile.playing = false; };
	
	if (soundFile.isMusic)
		soundFile.source = source;
};

AudioAPI.prototype.pauseMusic = function(){
	for (var i=0,len=this._audio.length;i<len;i++){
		var audio = this._audio[i];
		
		audio.pausedAt = 0;
		if (audio.isMusic && audio.source){
			audio.wasPlaying = audio.playing;
			audio.source.stop();
			audio.pausedAt = (Date.now() - audio.startedAt);
			audio.restoreLoop = audio.source.loop;
		}
	}
};

AudioAPI.prototype.restoreMusic = function(){
	for (var i=0,len=this._audio.length;i<len;i++){
		var audio = this._audio[i];
		
		if (!audio.looping && !audio.wasPlaying) continue;
		if (audio.isMusic && audio.source && audio.pausedAt != 0){
			audio.source = null;
			this.playSound(audio, audio.restoreLoop, true, audio.volume);
		}
	}
};

AudioAPI.prototype.mute = function(){
	if (!this.muted){
		this.gainNode.gain.value = 0;
		this.muted = true;
	}else{
		this.muted = false;
		this.gainNode.gain.value = 1;
	}
};

AudioAPI.prototype.areSoundsReady = function(){
	for (var i=0,len=this._audio.length;i<len;i++){
		if (!this._audio[i].ready) return false;
	}
	
	return true;
};
},{"./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Billboard.js":[function(require,module,exports){
var AnimatedTexture = require('./AnimatedTexture');
var ObjectFactory = require('./ObjectFactory');

function Billboard(position, textureCode, mapManager, params){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.billboard = null;
	this.textureCoords = null;
	this.numFrames = 1;
	this.imgSpd = 0;
	this.imgInd = 0;
	this.actions = null;
	this.visible = true;
	this.destroyed = false;
	
	this.circleFrameIndex = 0;
	
	if (params) this.parseParams(params);
	if (textureCode == "none") this.visible = false;
}

module.exports = Billboard;

Billboard.prototype.parseParams = function(params){
	for (var i in params){
		var p = params[i];
		
		if (i == "nf"){ // Number of frames
			this.numFrames = p;
			this.textureCoords = AnimatedTexture.getByNumFrames(p);
		}else if (i == "is"){ // Image speed
			this.imgSpd = p;
		}else if (i == "cb"){ // Custom billboard
			this.billboard = ObjectFactory.billboard(p, vec2(1.0, 1.0), this.mapManager.game.GL.ctx);
		}else if (i == "ac"){ // Actions
			this.actions = p;
		}
	}
};

Billboard.prototype.activate = function(){
	for (var i=0,len=this.actions.length;i<len;i++){
		var ac = this.actions[i];
		
		if (ac == "tv"){ // Toogle visibility
			this.visible = !this.visible;
		}else if (ac.indexOf("ct_") == 0){ // Change texture
			this.textureCode = ac.replace("ct_", "");
		}else if (ac.indexOf("nf_") == 0){ // Number of frames
			var nf = parseInt(ac.replace("nf_",""), 10);
			this.numFrames = nf;
			this.textureCoords = AnimatedTexture.getByNumFrames(nf);
			this.imgInd = 0;
		}else if (ac.indexOf("cf_") == 0){ // Circle frames
			var frames = ac.replace("cf_","").split(",");
			this.imgInd = parseInt(frames[this.circleFrameIndex], 10);
			if (this.circleFrameIndex++ >= frames.length-1) this.circleFrameIndex = 0;
		}else if (ac.indexOf("cw_") == 0){ // Circle frames
			var textureId = parseInt(ac.replace("cw_",""), 10);
			this.mapManager.changeWallTexture(this.position.a, this.position.c, textureId);
		}else if (ac.indexOf("ud_") == 0){ // Unlock door
			var pos = ac.replace("ud_", "").split(",");
			var door = this.mapManager.getDoorAt(parseInt(pos[0], 10), parseInt(pos[1], 10), parseInt(pos[2], 10));
			if (door){ 
				door.lock = null;
				door.activate();
			}
		}else if (ac == "destroy"){ // Destroy the billboard
			this.destroyed = true;
			this.visible = false;
		}
	}
};

Billboard.prototype.draw = function(){
	if (!this.visible) return;
	var game = this.mapManager.game;
	
	if (this.billboard && this.textureCoords){
		this.billboard.texBuffer = this.textureCoords[(this.imgInd << 0)];
	}
	
	game.drawBillboard(this.position,this.textureCode,this.billboard);
};

Billboard.prototype.loop = function(){
	if (this.imgSpd > 0 && this.numFrames > 1){
		this.imgInd += this.imgSpd;
		if ((this.imgInd << 0) >= this.numFrames){
			this.imgInd = 0;
		}
	}
	this.draw();
};

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\AnimatedTexture.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Console.js":[function(require,module,exports){
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

module.exports = Console;

Console.prototype.render = function(/*Int*/ x, /*Int*/ y){
	var s = this.messages.length - 1;
	var ctx = this.game.UI.ctx;
	
	ctx.drawImage(this.sfContext.canvas, x, y);
};

Console.prototype.parseFont = function(spriteFont){
	var charasWidth = [];
	
	var canvas = document.createElement("canvas");
	canvas.width = spriteFont.width;
	canvas.height = spriteFont.height;
	
	var ctx = canvas.getContext("2d");
	ctx.drawImage(spriteFont, 0, 0);
	
	var imgData = ctx.getImageData(0,0,canvas.width,1);
	var width = 0;
	for (var i=0,len=imgData.data.length;i<len;i+=4){
		var r = imgData.data[i];
		var g = imgData.data[i+1];
		var b = imgData.data[i+2];
		
		if (r == 255 && g == 0 && b == 255){
			width++;
		}else{
			if (width != 0){
				charasWidth.push(width);
				width = 0;
			}
		}
	}
	
	return charasWidth;
};

Console.prototype.createSpriteFont = function(/*Image*/ spriteFont, /*String*/ charactersUsed, /*Int*/ verticalSpace){
	this.spriteFont = spriteFont;
	this.listOfChars = charactersUsed;
	this.spaceLines = verticalSpace;
	
	this.charasWidth = this.parseFont(spriteFont);
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
	this.sfContext.clearRect(0,0,c.width,c.height);
	for (var i=0,len=this.messages.length;i<len;i++){
		var msg = this.messages[i];
		var x = 0;
		var y = (this.spaceLines * this.limit) - this.spaceLines * (len - i - 1);
		this.printText(x,y,msg);
	}
};

Console.prototype.printText = function (x,y,msg, ctx){
	if (!ctx){
		ctx = this.sfContext;
	}
	var c = ctx.canvas;
	
	var w = this.spaceChars;
	var h = this.spriteFont.height;
	
	var mW = msg.length * w;
	if (mW > c.width) c.width = mW + (2 * w);
	
	for (var j=0,jlen=msg.length;j<jlen;j++){
		var chara = msg.charAt(j);
		var ind = this.listOfChars.indexOf(chara);
		if (ind != -1){
			ctx.drawImage(this.spriteFont,
				w * ind, 1, w, h - 1,
				x, y, w, h - 1);
			x += this.charasWidth[ind] + 1;
		}else{
			x += w;
		}
	}
}
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Door.js":[function(require,module,exports){
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

module.exports = Door;

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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\EndingScreen.js":[function(require,module,exports){
function EndingScreen(/*Game*/ game){
	this.game = game;
	this.currentScreen = 0;
}

module.exports = EndingScreen;

EndingScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		if (this.currentScreen == 2)
			this.game.newGame();
		else
			this.currentScreen++;
	}
};

EndingScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	if (this.currentScreen == 0)
		ui.drawImage(this.game.images.endingScreen, 0, 0);
	else if (this.currentScreen == 1)
		ui.drawImage(this.game.images.endingScreen2, 0, 0);
	else
		ui.drawImage(this.game.images.endingScreen3, 0, 0);
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Enemy.js":[function(require,module,exports){
var AnimatedTexture = require('./AnimatedTexture');
var ObjectFactory = require('./ObjectFactory');
var Utils = require('./Utils');

circular.setTransient('Enemy', 'billboard');
circular.setTransient('Enemy', 'textureCoords');

circular.setReviver('Enemy', function(object, game) {
	object.billboard = ObjectFactory.billboard(vec3(1.0, 1.0, 1.0), vec2(1.0, 1.0), game.GL.ctx);
	object.textureCoords = AnimatedTexture.getByNumFrames(2);
});

function Enemy(){
	this._c = circular.register('Enemy');
}

module.exports = Enemy;
circular.registerClass('Enemy', Enemy);

Enemy.prototype.init = function(position, enemy, mapManager){
	if (enemy.swim) position.b -= 0.2;
	
	this.position = position;
	this.textureBase = enemy.textureBase;
	this.mapManager = mapManager;
	
	this.animation = "run";
	this.enemy = enemy;
	this.target = false;
	this.billboard = ObjectFactory.billboard(vec3(1.0, 1.0, 1.0), vec2(1.0, 1.0), this.mapManager.game.GL.ctx);
	this.textureCoords = AnimatedTexture.getByNumFrames(2);
	this.numFrames = 2;
	this.imgSpd = 1/7;
	this.imgInd = 0;
	this.destroyed = false;
	this.hurt = 0.0;
	this.targetY = position.b;
	this.solid = true;
	this.sleep = 0;
	
	this.attackWait = 0.0;
	this.enemyAttackCounter = 0;
	this.visible = true;
}

Enemy.prototype.receiveDamage = function(dmg){
	this.hurt = 5.0;
	
	this.enemy.hp -= dmg;
	if (this.enemy.hp <= 0){
		this.mapManager.game.addExperience(this.enemy.stats.exp);
		//this.mapManager.addMessage(this.enemy.name + " killed");
		this.destroyed = true;
	}
};

Enemy.prototype.lookFor = function(){
	var player = this.mapManager.player;
	if (!player.moved) return;
	var p = player.position;
	
	var dx = Math.abs(p.a - this.position.a);
	var dz = Math.abs(p.c - this.position.c);
	
	if (!this.target && (dx <= 4 || dz <= 4)){
		// Cast a ray towards the player to check if he's on the vision of the creature
		var rx = this.position.a;
		var ry = this.position.c;
		var dir = Math.getAngle(this.position, p);
		var dx = Math.cos(dir) * 0.3;
		var dy = -Math.sin(dir) * 0.3;
		
		var search = 15;
		while (search > 0){
			rx += dx;
			ry += dy;
			
			var cx = (rx << 0);
			var cy = (ry << 0);
			
			if (this.mapManager.isSolid(cx, cy, 0)){
				return;
			}else{
				var px = (p.a << 0);
				var py = (p.c << 0);
				
				if (cx == px && cy == py){
					this.target = this.mapManager.player;
					search = 0;
				}
			}
			
			search -= 1;
		}
	}
};

Enemy.prototype.doVerticalChecks = function(){
	var pointY = this.mapManager.getYFloor(this.position.a, this.position.c, true);
	if (this.enemy.stats.fly && pointY < 0.0) pointY = this.position.b;
	
	var py = Math.floor((pointY - this.position.b) * 100) / 100;
	if (py <= 0.3) this.targetY = pointY;
};

Enemy.prototype.moveTo = function(xTo, zTo){
	var movement = vec2(xTo, zTo);
	var spd = vec2(xTo * 1.5, 0);
	var fakePos = this.position.clone();
		
	for (var i=0;i<2;i++){
		var normal = this.mapManager.getBBoxWallNormal(fakePos, spd, 0.3);
		if (!normal){ normal = this.mapManager.getInstanceNormal(fakePos, spd, this.cameraHeight, this); } 
		
		if (normal){
			normal = normal.clone();
			var dist = movement.dot(normal);
			normal.multiply(-dist);
			movement.sum(normal);
		}
		
		fakePos.a += movement.a;
		spd = vec2(0, zTo * 1.5);
	}
	
	if (movement.a != 0 || movement.b != 0){
		this.position.a += movement.a;
		this.position.c += movement.b;
		
		if (!this.enemy.stats.fly && !this.enemy.stats.swim && this.mapManager.isWaterPosition(this.position.a, this.position.c)){
			this.position.a -= movement.a;
			this.position.c -= movement.b;
			return false;
		}else if (this.enemy.stats.swim && !this.mapManager.isWaterPosition(this.position.a, this.position.c)){
			this.position.a -= movement.a;
			this.position.c -= movement.b;
			return false;
		}
		
		this.doVerticalChecks();
	}
};

Enemy.prototype.attackPlayer = function(player){
	if (this.hurt > 0.0) return;
	var str = Utils.rollDice(this.enemy.stats.str);
	var dfs = Utils.rollDice(this.mapManager.game.player.stats.dfs);
	
	// Check if the player has the protection spell
	if (this.mapManager.game.protection > 0){
		dfs += 15;
	}
	
	var dmg = Math.max(str - dfs, 0);
	
	if (dmg > 0){
		this.mapManager.addMessage(this.enemy.name + " attacks x"+dmg);
		player.receiveDamage(dmg);
	}else{
		//this.mapManager.addMessage("Blocked!");
		this.mapManager.game.playSound('block');
	}
	
	this.attackWait = 90;
};

Enemy.prototype.step = function(){
	var player = this.mapManager.player;
	if (player.destroyed) return;
	var p = player.position;
	if (this.enemyAttackCounter > 0){
		this.enemyAttackCounter --;
		if (this.enemyAttackCounter == 0){
			var xx = Math.abs(p.a - this.position.a);
			var yy = Math.abs(p.c - this.position.c);
			if (xx <= 1 && yy <=1){
				this.attackPlayer(player);
				return;
			}
		}
	} else if (this.target){
		var xx = Math.abs(p.a - this.position.a);
		var yy = Math.abs(p.c - this.position.c);
		if (this.attackWait > 0){
			this.attackWait --;
		}
		if (xx <= 1 && yy <=1){
			if (this.attackWait == 0){
				// this.mapManager.addMessage(this.enemy.name + " attacks!"); Removed, will be replaced by attack animation
				this.enemyAttackCounter = 10;
			}
			return;
		}

		if (xx > 10 || yy > 10){
			this.target = null;
			return;
		}
		
		var dir = Math.getAngle(this.position, p);
		var dx = Math.cos(dir) * 0.02;
		var dy = -Math.sin(dir) * 0.02;
		
		var lat = vec2(Math.cos(dir + Math.PI_2), -Math.sin(dir + Math.PI_2));
		
		this.moveTo(dx, dy, lat);
	}else{
		this.lookFor();
	}
};

Enemy.prototype.getTextureCode = function(){
	var face = this.direction;
	var a = this.animation;
	if (this.animation == "stand") a = "run";
	
	return this.textureBase + "_" + a;
};

Enemy.prototype.draw = function(){
	if (!this.visible) return;
	if (this.destroyed) return;
	
	var game = this.mapManager.game;
	
	if (this.billboard && this.textureCoords){
		this.billboard.texBuffer = this.textureCoords[(this.imgInd << 0)];
	}
	
	this.billboard.paintInRed = (this.hurt > 0);
	game.drawBillboard(this.position,this.getTextureCode(),this.billboard);
};

Enemy.prototype.loop = function(){
	if (this.hurt > 0){ this.hurt -= 1; }
	if (this.sleep > 0){ this.sleep -= 1; }
	
	var game = this.mapManager.game;
	if (game.paused || game.timeStop > 0 || this.sleep > 0){
		this.draw(); 
		return;
	}
	
	if (this.imgSpd > 0 && this.numFrames > 1){
		this.imgInd += this.imgSpd;
		if ((this.imgInd << 0) >= this.numFrames){
			this.imgInd = 0;
		}
	}
	
	if (this.targetY < this.position.b){
		this.position.b -= 0.1;
		if (this.position.b <= this.targetY) this.position.b = this.targetY;
	}else if (this.targetY > this.position.b){
		this.position.b += 0.08;
		if (this.position.b >= this.targetY) this.position.b = this.targetY;
	}
	
	this.step();
	
	this.draw();
};

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\AnimatedTexture.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\EnemyFactory.js":[function(require,module,exports){
module.exports = {
	enemies: {
		bat: {name: 'Giant Bat', hp: 48, textureBase: 'bat', stats: {str: '1D9', dfs: '2D2', exp: 4, fly: true}},
		rat: {name: 'Giant Rat', hp: 48, textureBase: 'rat', stats: {str: '1D9', dfs: '2D2', exp: 4}},
		spider: {name: 'Giant Spider', hp: 64, textureBase: 'spider', stats: {str: '1D11', dfs: '2D2', exp: 5}},
		gremlin: {name: 'Gremlin', hp: 48, textureBase: 'gremlin', stats: {str: '2D9', dfs: '2D2', exp: 4}},
		skeleton: {name: 'Skeleton', hp: 48, textureBase: 'skeleton', stats: {str: '3D4', dfs: '2D2', exp: 4}},
		headless: {name: 'Headless', hp: 64, textureBase: 'headless', stats: {str: '3D5', dfs: '2D2', exp: 5}},
		//nixie: {name: 'Nixie', hp: 64, textureBase: 'bat', stats: {str: '3D5', dfs: '2D2', exp: 5}},				// not in u5
		wisp: {name: 'Wisp', hp: 64, textureBase: 'wisp', stats: {str: '2D10', dfs: '2D2', exp: 5}},
		ghost: {name: 'Ghost', hp: 80, textureBase: 'ghost', stats: {str: '2D15', dfs: '2D2', exp: 6, fly: true}},
		troll: {name: 'Troll', hp: 96, textureBase: 'troll', stats: {str: '4D5', dfs: '2D2', exp: 7}}, // Not used by the generator?
		lavaLizard: {name: 'Lava Lizard', hp: 96, textureBase: 'lavaLizard', stats: {str: '4D5', dfs: '2D2', exp: 7}},
		mongbat: {name: 'Mongbat', hp: 96, textureBase: 'mongbat', stats: {str: '4D5', dfs: '2D2', exp: 7, fly: true}}, 
		octopus: {name: 'Giant Squid', hp: 96, textureBase: 'octopus', stats: {str: '3D6', dfs: '2D2', exp: 9, swim: true}},
		daemon: {name: 'Daemon', hp: 112, textureBase: 'daemon', stats: {str: '4D5', dfs: '2D2', exp: 8}},
		//phantom: {name: 'Phantom', hp: 128, textureBase: 'bat', stats: {str: '1D15', dfs: '2D2', exp: 9}},			// not in u5
		seaSerpent: {name: 'Sea Serpent', hp: 128, textureBase: 'seaSerpent', stats: {str: '3D6', dfs: '2D2', exp: 9, swim: true}},
		evilMage: {name: 'Evil Mage', hp: 176, textureBase: 'mage', stats: {str: '6D5', dfs: '2D2', exp: 12}}, //TODO: Add texture
		liche: {name: 'Liche', hp: 192, textureBase: 'liche', stats: {str: '9D4', dfs: '2D2', exp: 13}},
		hydra: {name: 'Hydra', hp: 208, textureBase: 'hydra', stats: {str: '9D4', dfs: '2D2', exp: 14}},
		dragon: {name: 'Dragon', hp: 224, textureBase: 'dragon', stats: {str: '9D4', dfs: '2D2', exp: 15, fly: true}},				// Not suitable
		zorn: {name: 'Zorn', hp: 240, textureBase: 'zorn', stats: {str: '9D4', dfs: '2D2', exp: 16}},
		gazer: {name: 'Gazer', hp: 240, textureBase: 'gazer', stats: {str: '5D8', dfs: '2D2', exp: 16, fly: true}},
		reaper: {name: 'Reaper', hp: 255, textureBase: 'reaper', stats: {str: '5D8', dfs: '2D2', exp: 16}},
		balron: {name: 'Balron', hp: 255, textureBase: 'balron', stats: {str: '9D4', dfs: '2D2', exp: 16}},
		//twister: {name: 'Twister', hp: 25, textureBase: 'bat', stats: {str: '4D2', dfs: '2D2', exp: 5}},			// not in u5
		
		warrior: {name: 'Fighter', hp: 98, textureBase: 'fighter', stats: {str: '5D5', dfs: '2D2', exp: 7}},
		mage: {name: 'Mage', hp: 112, textureBase: 'mage', stats: {str: '5D5', dfs: '2D2', exp: 8}},
		bard: {name: 'Bard', hp: 48, textureBase: 'bard', stats: {str: '2D10', dfs: '2D2', exp: 7}},
		druid: {name: 'Druid', hp: 64, textureBase: 'mage', stats: {str: '3D5', dfs: '2D2', exp: 10}},
		tinker: {name: 'Tinker', hp: 96, textureBase: 'ranger', stats: {str: '4D5', dfs: '2D2', exp: 9}},
		paladin: {name: 'Paladin', hp: 128, textureBase: 'fighter', stats: {str: '5D5', dfs: '2D2', exp: 4}},
		shepherd: {name: 'Shepherd', hp: 48, textureBase: 'ranger', stats: {str: '3D3', dfs: '2D2', exp: 9}},
		ranger: {name: 'Ranger', hp: 144, textureBase: 'ranger', stats: {str: '5D5', dfs: '2D2', exp: 3}}
	},
	
	getEnemy: function(name){
		if (!this.enemies[name]) throw "Invalid enemy name: " + name;
		
		var enemy = this.enemies[name];
		var ret = {
			_c: circular.setSafe()
		};
		
		for (var i in enemy){
			ret[i] = enemy[i];
		}
		
		return ret;
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Inventory.js":[function(require,module,exports){
function Inventory(limitItems){
	this._c = circular.register('Inventory');
	this.items = [];
	this.limitItems = limitItems;
}

module.exports = Inventory;
circular.registerClass('Inventory', Inventory);

Inventory.prototype.reset = function(){
	this.items = [];
};

Inventory.prototype.addItem = function(item){
	if (this.items.length == this.limitItems){
		return false;
	}
	
	this.items.push(item);
	return true;
};

Inventory.prototype.equipItem = function(itemId){
	var type = this.items[itemId].type;
	
	for (var i=0,len=this.items.length;i<len;i++){
		var item = this.items[i];
		
		if (item.type == type){
			item.equipped = false;
		}
	}
	
	this.items[itemId].equipped = true;
};

Inventory.prototype.getEquippedItem = function(type){
	for (var i=0,len=this.items.length;i<len;i++){
		var item = this.items[i];
		
		if (item.type == type && item.equipped){
			return item;
		}
	}
	
	return null;
};

Inventory.prototype.getWeapon = function(){
	return this.getEquippedItem('weapon');
};

Inventory.prototype.getArmour = function(){
	return this.getEquippedItem('armour');
};

Inventory.prototype.destroyItem = function(item){
	item.status = 0.0;
	item.equipped = false;
	
	for (var i=0,len=this.items.length;i<len;i++){
		var it = this.items[i];
		
		if (it === item){
			this.items.splice(i, 1);
			return;
		}
	}
};


Inventory.prototype.dropItem = function(itemId){
	if (this.items[itemId].type == 'weapon' || this.items[itemId].type == 'armour'){
		this.items[itemId].equipped = false;
	}
	this.items.splice(itemId, 1);
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Item.js":[function(require,module,exports){
var Billboard = require('./Billboard');
var ItemFactory = require('./ItemFactory');
var ObjectFactory = require('./ObjectFactory');

circular.setTransient('Item', 'billboard');

circular.setReviver('Item', function(object, game){
	object.billboard = ObjectFactory.billboard(vec3(1.0,1.0,1.0), vec2(1.0, 1.0), game.GL.ctx);
	object.billboard.texBuffer = null;
	if (object.item) {
		object.billboard.texBuffer = game.objectTex[object.item.tex].buffers[object.item.subImg];
		object.textureCode = object.item.tex;
	}
});	

function Item(){
	this._c = circular.register('Item');
}

module.exports = Item;
circular.registerClass('Item', Item);

Item.prototype.init = function(position, item, mapManager){
	var gl = mapManager.game.GL.ctx;
	
	this.position = position;
	this.item = null;
	this.mapManager = mapManager;
	this.billboard = ObjectFactory.billboard(vec3(1.0,1.0,1.0), vec2(1.0, 1.0), gl);
	this.billboard.texBuffer = null;
	this.textureCode = null;
	this.imgInd = 0;
	
	this.destroyed = false;
	this.solid = false;
	
	if (item) this.setItem(item);
};


Item.prototype.setItem = function(item){
	this.item = item;
	
	this.solid = item.solid;
	this.imgInd = this.item.subImg;
	this.imgSpd = 0;
	if (this.item.animationLength){ this.imgSpd = 1 / 6; }
	
	this.billboard.texBuffer = this.mapManager.game.objectTex[this.item.tex].buffers[this.imgInd];
	this.textureCode = item.tex;
};

Item.prototype.activate = function(){
	var mm = this.mapManager;
	var game = this.mapManager.game;
	if (this.item.isItem){
		if (this.item.type == 'codex'){
			/*mm.addMessage("The boundless knownledge of the Codex is revealed unto thee.");
			mm.addMessage("A voice thunders!");
			mm.addMessage("Thou hast proven thyself to be truly good in nature");
			mm.addMessage("Thou must know that thy quest to become an Avatar is the endless ");
			mm.addMessage("quest of a lifetime.");
			mm.addMessage("Avatarhood is a living gift, It must always and forever be nurtured");
			mm.addMessage("to fluorish, for if thou dost stray from the paths of virtue, thy way");
			mm.addMessage("may be lost forever.");
			mm.addMessage("Return now unto thine our world, live there as an example to thy");
			mm.addMessage("people, as our memory of thy gallant deeds serves us.");*/
			document.exitPointerLock();
			game.player.destroyed = true;
			game.ending();
		} else if (this.item.type == 'feature'){
			mm.addMessage("You see a "+this.item.name);
		} else if (game.addItem(this.item)){
			var stat = '';
			if (this.item.status !== undefined)
				stat = ItemFactory.getStatusName(this.item.status) + ' ';
			
			mm.addMessage("You pick up a "+stat + this.item.name);
			this.destroyed = true;
		}else{
			mm.addMessage("You can't carry any more items");
		}
	}
};

Item.prototype.draw = function(){
	if (this.destroyed) return;
	
	var game = this.mapManager.game;
	
	if (this.imgSpd > 0){
		var ind = (this.imgInd << 0);
		this.billboard.texBuffer = game.objectTex[this.item.tex].buffers[ind];
		
		if (!this.billboard.texBuffer){
			console.log(this);
		}
	}
	
	game.drawBillboard(this.position,this.textureCode,this.billboard);
};

Item.prototype.loop = function(){
	if (this.imgSpd > 0 && this.item.animationLength > 0){
		this.imgInd += this.imgSpd;
		if ((this.imgInd << 0) >= this.item.subImg + this.item.animationLength - 1){
			this.imgInd = this.item.subImg;
		}
	}
	
	if (this.destroyed) return;
	if (this.mapManager.game.paused){
		this.draw(); 
		return;
	}
	
	this.draw();
};
},{"./Billboard":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Billboard.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ItemFactory.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ItemFactory.js":[function(require,module,exports){
module.exports = {
	items: {
		// Items
		yellowPotion: {name: "Yellow potion", tex: "items", subImg: 0, type: 'potion'},
		redPotion: {name: "Red Potion", tex: "items", subImg: 1, type: 'potion'},
		
		// Weapons
		/*
		 * Daggers: Low damage, low variance, High speed, D3, 160DMG 
		 * Staves: Mid damage, Low variance, Mid speed, D3, 240DMG
		 * Maces: High Damage, High Variance, Low speed, D12, 360 DMG
		 * Axes: Mid Damage, Low Variance, Low speed, D3, 240DMG
		 * Swords: Mid Damage, Mid variance, Mid speed, D6, 240DMG
		 * 
		 * Mystic Sword: Mid Damage, Random Damage, Mid speed, D32 256DMG
		 */
		daggerPoison: {name: "Poison Dagger", tex: "items", subImg: 2, viewPortImg: 2, type: 'weapon', str: '20D3', wear: 0.05},
		daggerFang: {name: "Fang", tex: "items", subImg: 3, viewPortImg: 2, type: 'weapon', str: '50D3', wear: 0.05},
		daggerSting: {name: "Sting", tex: "items", subImg: 4, viewPortImg: 2, type: 'weapon', str: '50D3', wear: 0.05},
		
		staffGargoyle: {name: "Gargoyle Staff", tex: "items", subImg: 5, viewPortImg: 1, type: 'weapon', str: '60D3', wear: 0.02},
		staffAges: {name: "Staff of Ages", tex: "items", subImg: 6, viewPortImg: 1, type: 'weapon', str: '80D3', wear: 0.02},
		staffCabyrus: {name: "Staff of Cabyrus", tex: "items", subImg: 7, viewPortImg: 1, type: 'weapon', str: '100D3', wear: 0.02},
		
		maceBane: {name: "Mace of Undead Bane", tex: "items", subImg: 8, viewPortImg: 3, type: 'weapon', str: '20D12', wear: 0.03},
		maceBoneCrusher: {name: "Bone Crusher Mace", tex: "items", subImg: 9, viewPortImg: 3, type: 'weapon', str: '25D12', wear: 0.03},
		maceJuggernaut: {name: "Juggernaut Mace", tex: "items", subImg: 10, viewPortImg: 3, type: 'weapon', str: '30D12', wear: 0.03},
		maceSlayer: {name: "Slayer Mace", tex: "items", subImg: 11, viewPortImg: 3, type: 'weapon', str: '40D12', wear: 0.03},
		
		axeDwarvish: {name: "Dwarvish Axe", tex: "items", subImg: 12, viewPortImg: 4, type: 'weapon', str: '60D3', wear: 0.01},
		axeRune: {name: "Runed Axe", tex: "items", subImg: 13, viewPortImg: 4, type: 'weapon', str: '80D3', wear: 0.01},
		axeDeceiver: {name: "Deceiver Axe", tex: "items", subImg: 14, viewPortImg: 4, type: 'weapon', str: '100D3', wear: 0.01},
		
		swordFire: {name: "Fire Sword", tex: "items", subImg: 15, viewPortImg: 0, type: 'weapon', str: '40D6', wear: 0.008},
		swordChaos: {name: "Chaos Sword", tex: "items", subImg: 16, viewPortImg: 0, type: 'weapon', str: '40D6', wear: 0.008},
		swordDragon: {name: "Dragonslayer Sword", tex: "items", subImg: 17, viewPortImg: 0, type: 'weapon', str: '50D6', wear: 0.008},
		swordQuick: {name: "Enilno, the Quicksword", tex: "items", subImg: 18, viewPortImg: 0, type: 'weapon', str: '60D6', wear: 0.008},
		
		slingEttin: {name: "Ettin Sling", tex: "items", subImg: 19, type: 'weapon', str: '15D12', ranged: true, subItemName: 'rock', wear: 0.04},
		
		bowPoison: {name: "Poison Bow", tex: "items", subImg: 20, type: 'weapon', str: '15D6', ranged: true, subItemName: 'arrow', wear: 0.01},
		bowSleep: {name: "Sleep Bow", tex: "items", subImg: 21, type: 'weapon', str: '15D6', ranged: true, subItemName: 'arrow', wear: 0.01},
		bowMagic: {name: "Magic Bow", tex: "items", subImg: 22, type: 'weapon', str: '20D6', ranged: true, subItemName: 'arrow', wear: 0.01},
		crossbowMagic: {name: "Magic Crossbow", tex: "items", subImg: 23, type: 'weapon', str: '30D6', ranged: true, subItemName: 'bolt', wear: 0.008},
		
		wandLightning: {name: "Wand of Lightning", tex: "items", subImg: 24, type: 'weapon', str: '60D3', ranged: true, subItemName: 'beam', wear: 0.01},
		wandFire: {name: "Wand of Fire", tex: "items", subImg: 25, type: 'weapon', str: '60D3', ranged: true, subItemName: 'beam', wear: 0.01},
		phazor: {name: "Phazor", tex: "items", subImg: 26, type: 'weapon', str: '100D3', ranged: true, subItemName: 'beam', wear: 0.01},
		
		mysticSword: {name: "Mystic Sword", tex: "items", subImg: 34, viewPortImg: 5, type: 'weapon', str: '8D32', wear: 0.0},
		
		// Armour
		//TODO: Add armor degradation
		leatherImp: {name: "Imp Leather armour", tex: "items", subImg: 27, type: 'armour', dfs: '25D8', wear: 0.05},
		leatherDragon: {name: "Dragon Leather armour", tex: "items", subImg: 28, type: 'armour', dfs: '30D8', wear: 0.05},
		chainMagic: {name: "Magic Chain mail", tex: "items", subImg: 29, type: 'armour', dfs: '35D8', wear: 0.03},
		chainDwarven: {name: "Dwarven Chain mail", tex: "items", subImg: 30, type: 'armour', dfs: '40D8', wear: 0.03},
		plateMagic: {name: "Magic Plate mail", tex: "items", subImg: 31, type: 'armour', dfs: '45D8', wear: 0.015},
		plateEternium: {name: "Eternium Plate mail", tex: "items", subImg: 32, type: 'armour', dfs: '50D8', wear: 0.015},
		
		mystic: {name: "Mystic armour", tex: "items", subImg: 33, type: 'armour', dfs: '20D8', indestructible: true},
		
		// Spell mixes
		cure: {name: "Spellmix of Cure", tex: "spells", subImg: 0, type: 'magic', mana: 5},
		heal: {name: "Spellmix of Heal", tex: "spells", subImg: 1, type: 'magic', mana: 10, percent: 0.2},
		light: {name: "Spellmix of Light", tex: "spells", subImg: 2, type: 'magic', mana: 5, lightTime: 1000},
		missile: {name: "Spellmix of magic missile", tex: "spells", subImg: 3, type: 'magic', str: '30D5', mana: 5},
		iceball: {name: "Spellmix of Iceball", tex: "spells", subImg: 4, type: 'magic', str: '65D5', mana: 20},
		repel: {name: "Spellmix of Repel Undead", tex: "spells", subImg: 5, type: 'magic', mana: 15},
		blink: {name: "Spellmix of Blink", tex: "spells", subImg: 6, type: 'magic', mana: 15},
		fireball: {name: "Spellmix of Fireball", tex: "spells", subImg: 7, type: 'magic', str: '100D5', mana: 15},
		protection: {name: "Spellmix of protection", tex: "spells", subImg: 8, type: 'magic', protTime: 400, mana: 15},
		time: {name: "Spellmix of Time Stop", tex: "spells", subImg: 9, type: 'magic', stopTime: 600, mana: 30},
		sleep: {name: "Spellmix of Sleep", tex: "spells", subImg: 10, type: 'magic', sleepTime: 400, mana: 15},
		jinx: {name: "Spellmix of Jinx", tex: "spells", subImg: 11, type: 'magic', mana: 30},
		tremor: {name: "Spellmix of Tremor", tex: "spells", subImg: 12, type: 'magic', mana: 30},
		kill: {name: "Spellmix of Kill", tex: "spells", subImg: 13, type: 'magic', str: '400D5', mana: 25},
		
		// Codex
		codex: {name: "Codex of Ultimate Wisdom", tex: "itemsMisc", subImg: 0, type: 'codex'},
		
		// Dungeon features
		orb: {name: "Orb", tex: "itemsMisc", subImg: 1, type: 'feature', solid: true},
		deadTree: {name: "Dead Tree", tex: "itemsMisc", subImg: 2, type: 'feature', solid: true},
		tree: {name: "Tree", tex: "itemsMisc", subImg: 3, type: 'feature', solid: true},
		statue: {name: "Statue", tex: "itemsMisc", subImg: 4, type: 'feature', solid: true},
		signPost: {name: "Signpost", tex: "itemsMisc", subImg: 5, type: 'feature', solid: true},
		well: {name: "Well", tex: "itemsMisc", subImg: 6, type: 'feature', solid: true},
		smallSign: {name: "Sign", tex: "itemsMisc", subImg: 7, type: 'feature', solid: true},
		lamp: {name: "Lamp", tex: "itemsMisc", subImg: 8, type: 'feature', solid: true},
		flame: {name: "Flame", tex: "itemsMisc", subImg: 9, type: 'feature', solid: true},
		campfire: {name: "Campfire", tex: "itemsMisc", subImg: 10, type: 'feature', solid: true},
		altar: {name: "Altar", tex: "itemsMisc", subImg: 11, type: 'feature', solid: true},
		prisonerThing: {name: "Stocks", tex: "itemsMisc", subImg: 12, type: 'feature', solid: true},
		fountain: {name: "Fountain", tex: "itemsMisc", subImg: 13, animationLength: 4, type: 'feature', solid: true}
	},
	
	getItemByCode: function(itemCode, status){
		if (!this.items[itemCode]) throw "Invalid Item code: " + itemCode;
		
		var item = this.items[itemCode];
		var ret = {
			_c: circular.setSafe()
		};
		for (var i in item){
			ret[i] = item[i];
		}
		
		ret.isItem = true;
		ret.code = itemCode;
		
		if (ret.type == 'weapon' || ret.type == 'armour'){
			ret.equipped = false;
			ret.status = status;
		}
		
		return ret;
	},
	
	getStatusName: function(status){
		if (status >= 0.8){
			return 'Excellent';
		}else if (status >= 0.5){
			return 'Serviceable';
		}else if (status >= 0.2){
			return 'Worn';
		}else if (status > 0.0){
			return 'Badly worn';
		}else{
			return 'Ruined';
		}
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\MapAssembler.js":[function(require,module,exports){
var Door = require('./Door');
var Enemy = require('./Enemy');
var EnemyFactory = require('./EnemyFactory');
var Item = require('./Item');
var ItemFactory = require('./ItemFactory');
var ObjectFactory = require('./ObjectFactory');
var Player = require('./Player');
var Stairs = require('./Stairs');

function MapAssembler(){
}

module.exports = MapAssembler;

MapAssembler.prototype.assembleMap = function(mapManager, mapData, GL){
	this.mapManager =  mapManager;
	this.copiedTiles = [];
	
	this.parseMap(mapData, GL);
				
	this.assembleFloor(mapData, GL); 
	this.assembleCeils(mapData, GL);
	this.assembleBlocks(mapData, GL);
	this.assembleSlopes(mapData, GL);
	
	this.parseObjects(mapData);
	
	this.copiedTiles = [];
	
	this.initializeTiles(mapData.tiles);
}

MapAssembler.prototype.assembleTerrain = function(mapManager, GL){
	this.mapManager =  mapManager;
	this.assembleFloor(mapManager, GL); 
	this.assembleCeils(mapManager, GL);
	this.assembleBlocks(mapManager, GL);
	this.assembleSlopes(mapManager, GL);
}

MapAssembler.prototype.initializeTiles = function(tiles){
	for (var i = 0; i < tiles.length; i++){
		if (tiles[i])
			tiles[i]._c = circular.setSafe();
	}
}


MapAssembler.prototype.getEmptyGrid = function(){
	var grid = [];
	for (var y=0;y<64;y++){
		grid[y] = [];
		for (var x=0;x<64;x++){
			grid[y][x] = 0;
		}
	}
	
	return grid;
};

MapAssembler.prototype.copyTile = function(tile){
	var ret = {
		_c: circular.setSafe()
	};
	
	for (var i in tile){
		ret[i] = tile[i];
	}
	
	return ret;
};

MapAssembler.prototype.assembleFloor = function(mapData, GL){
	var mapM = this;
	var oFloors = [];
	var floorsInd = [];
	for (var y=0,len=mapData.map.length;y<len;y++){
		for (var x=0,xlen=mapData.map[y].length;x<xlen;x++){
			var tile = mapData.map[y][x];
			if (tile.f){
				var ind = floorsInd.indexOf(tile.f);
				var fl;
				if (ind == -1){
					floorsInd.push(tile.f);
					fl = mapM.getEmptyGrid();
					fl.tile = tile.f;
					fl.rTile = tile.rf;
					oFloors.push(fl);
				}else{
					fl = oFloors[ind];
				}
				
				var yy = tile.y;
				if (tile.w) yy += tile.h;
				if (tile.fy) yy = tile.fy;
				fl[y][x] = {tile: tile.f, y: yy};
				
			}
		}
	}
	for (var i=0;i<oFloors.length;i++){
		var floor3D = ObjectFactory.assembleObject(oFloors[i], "F", GL);
		floor3D.texInd = oFloors[i].tile;
		floor3D.rTexInd = oFloors[i].rTile;
		floor3D.type = "F";
		mapM.mapManager.mapToDraw.push(floor3D);
	}
};

MapAssembler.prototype.assembleCeils = function(mapData, GL){
	var mapM = this;
	var oCeils = [];
	var ceilsInd = [];
	for (var y=0,len=mapData.map.length;y<len;y++){
		for (var x=0,xlen=mapData.map[y].length;x<xlen;x++){
			var tile = mapData.map[y][x];
			if (tile.c){
				var ind = ceilsInd.indexOf(tile.c);
				var cl;
				if (ind == -1){
					ceilsInd.push(tile.c);
					cl = mapM.getEmptyGrid();
					cl.tile = tile.c;
					oCeils.push(cl);
				}else{
					cl = oCeils[ind];
				}
				
				cl[y][x] = {tile: tile.c, y: tile.ch};
				
			}
		}
	}
	for (var i=0;i<oCeils.length;i++){
		var ceil3D = ObjectFactory.assembleObject(oCeils[i], "C", GL);
		ceil3D.texInd = oCeils[i].tile;
		ceil3D.type = "C";
		mapM.mapManager.mapToDraw.push(ceil3D);
	}
};

MapAssembler.prototype.assembleBlocks = function(mapData, GL){
	var mapM = this;
	var oBlocks = [];
	var blocksInd = [];
	for (var y=0,len=mapData.map.length;y<len;y++){
		for (var x=0,xlen=mapData.map[y].length;x<xlen;x++){
			var tile = mapData.map[y][x];
			if (tile.w){
				var ind = blocksInd.indexOf(tile.w);
				var wl;
				if (ind == -1){
					blocksInd.push(tile.w);
					wl = mapM.getEmptyGrid();
					wl.tile = tile.w;
					oBlocks.push(wl);
				}else{
					wl = oBlocks[ind];
				}
				
				wl[y][x] = {tile: tile.w, y: tile.y, h: tile.h};
				
			}
		}
	}
	for (var i=0;i<oBlocks.length;i++){
		var block3D = ObjectFactory.assembleObject(oBlocks[i], "B", GL);
		block3D.texInd = oBlocks[i].tile;
		block3D.type = "B";
		mapM.mapManager.mapToDraw.push(block3D);
	}
};

MapAssembler.prototype.assembleSlopes = function(mapData, GL){
	var mapM = this;
	var oSlopes = [];
	var slopesInd = [];
	for (var y=0,len=mapData.map.length;y<len;y++){
		for (var x=0,xlen=mapData.map[y].length;x<xlen;x++){
			var tile = mapData.map[y][x];
			if (tile.sl){
				var ind = slopesInd.indexOf(tile.sl);
				var sl;
				if (ind == -1){
					slopesInd.push(tile.sl);
					sl = mapM.getEmptyGrid();
					sl.tile = tile.sl;
					oSlopes.push(sl);
				}else{
					sl = oSlopes[ind];
				}
				
				var yy = tile.y;
				if (tile.w) yy += tile.h;
				if (tile.fy) yy = tile.fy;
				sl[y][x] = {tile: tile.sl, y: yy, dir: tile.dir};
				
			}
		}
	}
	for (var i=0;i<oSlopes.length;i++){
		var slope3D = ObjectFactory.assembleObject(oSlopes[i], "S", GL);
		slope3D.texInd = oSlopes[i].tile;
		slope3D.type = "S";
		mapM.mapManager.mapToDraw.push(slope3D);
	}
};

MapAssembler.prototype.parseMap = function(mapData, GL){
	var mapM = this;
	for (var y=0,len=mapData.map.length;y<len;y++){
		for (var x=0,xlen=mapData.map[y].length;x<xlen;x++){
			if (mapData.map[y][x] != 0){
				var ind = mapData.map[y][x];
				var tile = mapData.tiles[ind];
				mapData.map[y][x] = tile;
				
				if (tile.f && tile.f > 100){
					tile.rf = tile.f - 100;
					tile.isWater = true;
					
					tile.y = -0.2;
					tile.fy = -0.2;
				}
				
				if (tile.f < 100){
					var t1, t2, t3, t4;
					if (mapData.map[y][x+1]) t1 = (mapData.tiles[mapData.map[y][x+1]].f > 100);
					if (mapData.map[y-1]) t2 = (mapData.map[y-1][x].f > 100);
					if (mapData.map[y][x-1]) t3 = (mapData.map[y][x-1].f > 100);
					if (mapData.map[y+1]) t4 = (mapData.tiles[mapData.map[y+1][x]].f > 100);
					
					if (t1 || t2 || t3 || t4){
						if (this.copiedTiles[ind]){
							mapData.map[y][x] = this.copiedTiles[ind];
						}else{
							this.copiedTiles[ind] = this.copyTile(tile);
							tile = this.copiedTiles[ind];
							mapData.map[y][x] = tile;
							
							tile.y = -1;
							tile.h += 1;
							if (!tile.w){
								tile.w = 10;
								tile.h = 1;
							}
							
						}
					}
				}
				
			}
		}
	}
};

MapAssembler.prototype.parseObjects = function(mapData){
	for (var i=0,len=mapData.objects.length;i<len;i++){
		var o = mapData.objects[i];
		var x = o.x;
		var y = o.y;
		var z = o.z;
		
		switch (o.type){
			case "player":
				this.mapManager.player = new Player();
				this.mapManager.player.init(vec3(x, y, z), vec3(0.0, o.dir * Math.PI_2, 0.0), this.mapManager);
			break;
			case "item":
				var status = Math.min(0.3 + (Math.random() * 0.7), 1.0);
				var item = ItemFactory.getItemByCode(o.item, status);
				var itemObject = new Item();
				itemObject.init(vec3(x, y, z), item, this.mapManager);
				this.mapManager.instances.push(itemObject);
			break;
			case "enemy":
				var enemy = EnemyFactory.getEnemy(o.enemy);
				var enemyObject = new Enemy();
				enemyObject.init(vec3(x, y, z), enemy, this.mapManager);
				this.mapManager.instances.push(enemyObject);
			break;
			case "stairs":
				var stairsObj = new Stairs();
				stairsObj.init(vec3(x, y, z), this.mapManager, o.dir);
				this.mapManager.instances.push(stairsObj);
			break;
			case "door":
				var xx = (x << 0) - ((o.dir == "H")? 1 : 0);
				var zz = (z << 0) - ((o.dir == "V")? 1 : 0);
				var tile = mapData.map[zz][xx].w;
				
				this.mapManager.doors.push(new Door(this.mapManager, vec3(x, y, z), o.dir, "door1", tile));
			break;
		}
	}
};
},{"./Door":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Door.js","./Enemy":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Enemy.js","./EnemyFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\EnemyFactory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ItemFactory.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./Player":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Player.js","./Stairs":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Stairs.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\MapManager.js":[function(require,module,exports){
var MapAssembler = require('./MapAssembler');
var ObjectFactory = require('./ObjectFactory');
var Utils = require('./Utils');

circular.setTransient('MapManager', 'game');
circular.setTransient('MapManager', 'mapToDraw');

circular.setReviver('MapManager', function(object, game){
	object.game = game;
	var GL = game.GL.ctx;
	var mapAssembler = new MapAssembler();
	object.mapToDraw = [];
	mapAssembler.assembleTerrain(object, GL);
});

function MapManager(){
	this._c = circular.register('MapManager');
}

module.exports = MapManager;
circular.registerClass('MapManager', MapManager);

MapManager.prototype.init = function(game, map, depth){
	this._c = circular.register('MapManager');
	this.map = null;
	
	this.waterTiles = [];
	this.waterFrame = 0;
	
	this.game = game;
	this.player = null;
	this.instances = [];
	this.orderInstances = [];
	this.doors = [];
	this.playerLast = null;
	this.depth = depth;
	this.poisonCount = 0;
	
	this.mapToDraw = [];
	
	if (map == "test"){
		this.loadMap("testMap");
	} else if (map == "codexRoom"){
		this.loadMap("codexRoom");
	} else {
		this.generateMap(depth);
	}
};

MapManager.prototype.generateMap = function(depth){
	var config = {
		MIN_WIDTH: 10,
		MIN_HEIGHT: 10,
		MAX_WIDTH: 20,
		MAX_HEIGHT: 20,
		LEVEL_WIDTH: 64,
		LEVEL_HEIGHT: 64,
		SUBDIVISION_DEPTH: 3,
		SLICE_RANGE_START: 3/8,
		SLICE_RANGE_END: 5/8,
		RIVER_SEGMENT_LENGTH: 10,
		MIN_RIVER_SEGMENTS: 10,
		MAX_RIVER_SEGMENTS: 20,
		MIN_RIVERS: 3,
		MAX_RIVERS: 5
	};
	var generator = new Generator(config);
	var kramgineExporter = new KramgineExporter(config);
	var generatedLevel = generator.generateLevel(depth, this.game.uniqueRegistry);
	
	var mapM = this;
	try{
		window.generatedLevel = (generatedLevel.level);
		var mapData = kramgineExporter.getLevel(generatedLevel.level);
		window.mapData = (mapData);
		var mapAssembler = new MapAssembler();
		mapAssembler.assembleMap(mapM, mapData, mapM.game.GL.ctx);
		mapM.map = mapData.map;
		mapM.waterTiles = [101, 103];
		mapM.getInstancesToDraw();
	}catch (e){
		if (e.message){
			console.error(e.message);
			console.error(e.stack);
		}else{
			console.error(e);
		}
		mapM.map = null;
	}
};

MapManager.prototype.loadMap = function(mapName){
	var mapM = this;
	var http = Utils.getHttp();
	http.open('GET', cp + 'maps/' + mapName + ".json", true);
	http.onreadystatechange = function() {
  		if (http.readyState == 4 && http.status == 200) {
  			try{
				mapData = JSON.parse(http.responseText);
				
				var mapAssembler = new MapAssembler();
				mapAssembler.assembleMap(mapM, mapData, mapM.game.GL.ctx);
				
				mapM.map = mapData.map;
				
				mapM.waterTiles = [101, 103];
				mapM.getInstancesToDraw();
			}catch (e){
				if (e.message){
					console.error(e.message);
					console.error(e.stack);
				}else{
					console.error(e);
				}
				mapM.map = null;
			}
			
		}
	};
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.send();
};

MapManager.prototype.isWaterTile = function(tileId){
	return (this.waterTiles.indexOf(tileId) != -1);
};

MapManager.prototype.isWaterPosition = function(x, z){
	x = x << 0;
	z = z << 0;
	if (!this.map[z]) return 0;
	if (this.map[z][x] === undefined) return 0;
	else if (this.map[z][x] === 0) return 0;
	
	var t = this.map[z][x];
	if (!t.f) return false;
	
	return this.isWaterTile(t.f);
};

MapManager.prototype.isLavaPosition = function(x, z){
	x = x << 0;
	z = z << 0;
	if (!this.map[z]) return 0;
	if (this.map[z][x] === undefined) return 0;
	else if (this.map[z][x] === 0) return 0;
	
	var t = this.map[z][x];
	if (!t.f) return false;
	
	return this.isLavaTile(t.f);
};

MapManager.prototype.isLavaTile = function(tileId){
	return tileId == 103;
};


MapManager.prototype.changeWallTexture = function(x, z, textureId){
	if (!this.map[z]) return false;
	if (this.map[z][x] === undefined) return false;
	else if (this.map[z][x] === 0) return false;
	
	var base = this.map[z][x];
	if (!base.cloned){
		var newW = {};
		for (var i in base){
			newW[i] = base[i];
		}
		newW.cloned = true;
		this.map[z][x] = newW;
		base = newW;
	}
	
	base.w = textureId;
};

MapManager.prototype.getDoorAt = function(x, y, z){
	for (var i=0,len=this.doors.length;i<len;i++){
		var door = this.doors[i];
		if (door.wallPosition.equals(x, y, z)) return door;
	}
	
	return null;
};

MapManager.prototype.getInstanceAt = function(position){
	for (var i=0,len=this.instances.length;i<len;i++){
		if (this.instances[i].position.equals(position)){
			return this.instances[i];
		}
	}
	
	return null;
};

MapManager.prototype.getInstanceAtGrid = function(position){
	for (var i=0,len=this.instances.length;i<len;i++){
		if (this.instances[i].destroyed) continue;
		
		var x = Math.floor(this.instances[i].position.a);
		var z = Math.floor(this.instances[i].position.c);
		
		if (x == position.a && z == position.c){
			return (this.instances[i]);
		}
	}
	
	return null;
};

MapManager.prototype.getNearestCleanItemTile = function(x, z){
	x = x << 0;
	z = z << 0;
	
	var minX = x - 1;
	var minZ = z - 1;
	var maxX = x + 1;
	var maxZ = z + 1;
	
	for (var zz=minZ;zz<=maxZ;zz++){
		for (var xx=minX;xx<=maxX;xx++){
			if (this.isSolid(xx, zz, 0) || this.isWaterPosition(xx, zz)){
				continue;
			}
			
			var pos = vec3(xx, 0, zz);
			var ins = this.getInstanceAtGrid(pos);
			if (!ins || (!ins.item && !ins.stairs)){
				return pos;
			}
		}
	}
	
	return null;
};

MapManager.prototype.getInstancesNearest = function(position, distance, hasProperty){
	var ret = [];
	for (var i=0,len=this.instances.length;i<len;i++){
		if (this.instances[i].destroyed) continue;
		if (hasProperty && !this.instances[i][hasProperty]) continue;
		
		var x = Math.abs(this.instances[i].position.a - position.a);
		var z = Math.abs(this.instances[i].position.c - position.c);
		
		if (x <= distance && z <= distance){
			ret.push(this.instances[i]);
		}
	}
	
	return ret;
};


MapManager.prototype.getInstanceNormal = function(pos, spd, h, self){
	var p = pos.clone();
	p.a = p.a + spd.a;
	p.c = p.c + spd.b;
	
	var inst = null, hor;
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (!ins || ins.destroyed || !ins.solid) continue;
		if (ins === self) continue;
		
		var xx = Math.abs(ins.position.a - p.a);
		var zz = Math.abs(ins.position.c - p.c);
		
		if (xx <= 0.8 && zz <= 0.8){
			if (pos.a <= ins.position.a - 0.8 || pos.a >= ins.position.a + 0.8) hor = true;
			else if (pos.c <= ins.position.c - 0.8 || pos.c >= ins.position.c + 0.8) hor = false;  
			inst = ins;
			i = len;
		}
	}
	
	
	if (!inst) return null;
	
	if (inst.height){
		if (pos.b + h < inst.position.b) return null;
		if (pos.b >= inst.position.b + inst.height) return null;
	}
	
	if (hor) return ObjectFactory.normals.right;
	return ObjectFactory.normals.up;
};

MapManager.prototype.wallHasNormal = function(x, y, normal){
	var t1 = this.map[y][x];
	switch (normal){
		case 'u': y -= 1; break;
		case 'l': x -= 1; break;
		case 'd': y += 1; break;
		case 'r': x += 1; break;
	}
	
	if (!this.map[y]) return true;
	if (this.map[y][x] === undefined) return true;
	if (this.map[y][x] === 0) return true;
	var t2 = this.map[y][x];
	
	if (!t2.w) return true;
	if (t2.w && !(t2.y == t1.y && t2.h == t1.h)){
		return true;
	}
	
	return false;
};

MapManager.prototype.getDoorNormal = function(pos, spd, h, inWater){
	var xx = ((pos.a + spd.a) << 0);
	var zz = ((pos.c + spd.b) << 0);
	var y = pos.b;
	
	var door = this.getDoorAt(xx, y, zz);
	if (door){
		var xxx = (pos.a + spd.a) - xx;
		var zzz = (pos.c + spd.b) - zz;
		
		var x = (pos.a - xx);
		var z = (pos.c - zz);
		if (door.dir == "V"){
			if (door && door.isSolid()) return ObjectFactory.normals.left;
			if (zzz > 0.25 && zzz < 0.75) return null;
			if (x < 0 || x > 1) return ObjectFactory.normals.left;
			else return ObjectFactory.normals.up;
		}else{
			if (door && door.isSolid()) return ObjectFactory.normals.up;
			if (xxx > 0.25 && xxx < 0.75) return null;
			if (z < 0 || z > 1) return ObjectFactory.normals.up;
			else return ObjectFactory.normals.left;
		}
	}
};

MapManager.prototype.isSolid = function(x, z, y){
	if (!this.map[z]) return false;
	if (this.map[z][x] === undefined) return false;
	if (this.map[z][x] === 0) return false;
	
	t = this.map[z][x];
	if (!t.w && !t.dw && !t.wd) return false;
	
	if (y !== undefined){
		if (t.y + t.h <= y) return false;
	}
	
	return true;
};

MapManager.prototype.checkBoxCollision = function(box1, box2){
	if (box1.x2 < box2.x1 || box1.x1 > box2.x2 || box1.z2 < box2.z1 || box1.z1 > box2.z2){
		return false;
	}
	
	return true;
};

MapManager.prototype.getBBoxWallNormal = function(pos, spd, bWidth){
	var x = ((pos.a + spd.a) << 0);
	var z = ((pos.c + spd.b) << 0);
	var y = pos.b;
	
	var bBox = {
		x1: pos.a + spd.a - bWidth,
		z1: pos.c + spd.b - bWidth,
		x2: pos.a + spd.a + bWidth,
		z2: pos.c + spd.b + bWidth
	};
	
	var xm = x - 1;
	var zm = z - 1;
	var xM = xm + 3;
	var zM = zm + 3;
	
	var t;
	for (var zz=zm;zz<zM;zz++){
		for (var xx=xm;xx<xM;xx++){
			if (!this.map[zz]) continue;
			if (this.map[zz][xx] === undefined) continue;
			if (this.map[zz][xx] === 0) continue;
			
			t = this.map[zz][xx];
			
			if (!t.w && !t.dw && !t.wd) continue;
			if (t.y+t.h <= y) continue;
			else if (t.y > y + 0.5) continue;
			
			var box = {
				x1: xx,
				z1: zz,
				x2: xx + 1,
				z2: zz + 1
			};
			
			if (this.checkBoxCollision(bBox, box)){
				var xxx = pos.a - xx;
				var zzz = pos.c - zz;
				
				var nV = this.wallHasNormal(xx, zz, 'u') || this.wallHasNormal(xx, zz, 'd');
				var nH = this.wallHasNormal(xx, zz, 'r') || this.wallHasNormal(xx, zz, 'l');
				
				if (zzz >= -bWidth && zzz < 1 + bWidth && nH){
					return ObjectFactory.normals.left;
				}
				
				if (xxx >= -bWidth && xxx < 1 + bWidth && nV){
					return ObjectFactory.normals.up;
				}
			}
		}
	}
	
	return null;
};

MapManager.prototype.getWallNormal = function(pos, spd, h, inWater){
	var t, th;
	var y = pos.b;
	
	var xx = ((pos.a + spd.a) << 0);
	var zz = ((pos.c + spd.b) << 0);
	
	if (!this.map[zz]) return null;
	if (this.map[zz][xx] === undefined) return null;
	if (this.map[zz][xx] === 0) return null;
	
	t = this.map[zz][xx];
	i = 4;
	
	if (!t) return null;
	
	th = t.h - 0.3;
	if (inWater) y += 0.3;
	if (t.sl) th += 0.2;
	
	if (!t.w && !t.dw && !t.wd) return null;
	if (t.y+th <= y) return null;
	else if (t.y > y + h) return null;
	
	if (!t) return null;
	if (t.w){
		var tex = this.game.getTextureById(t.w, "wall");
		if (tex.isSolid){
			var xxx = pos.a - xx;
			var zzz = pos.c - zz;
			if (this.wallHasNormal(xx, zz, 'u') && zzz <= 0){ return ObjectFactory.normals.up; }
			if (this.wallHasNormal(xx, zz, 'd') && zzz >= 1){ return ObjectFactory.normals.down; }
			if (this.wallHasNormal(xx, zz, 'l') && xxx <= 0){ return ObjectFactory.normals.left; }
			if (this.wallHasNormal(xx, zz, 'r') && xxx >= 1){ return ObjectFactory.normals.right; }
		}
	}else if (t.dw){
		var x, z, xxx, zzz, normal;
		x = pos.a + spd.a;
		z = pos.c + spd.b;
		
		if (t.aw == 0){ xxx = (xx + 1) - x; zzz =  z - zz; normal = ObjectFactory.normals.upLeft; }
		else if (t.aw == 1){ xxx = x - xx; zzz =  z - zz; normal = ObjectFactory.normals.upRight; }
		else if (t.aw == 2){ xxx = x - xx; zzz =  (zz + 1) - z; normal = ObjectFactory.normals.downRight; }
		else if (t.aw == 3){ xxx = (xx + 1) - x; zzz =  (zz + 1) - z; normal = ObjectFactory.normals.downLeft; }
		if (zzz >= xxx){
			return normal;
		}
	}
	
	return null;
};

MapManager.prototype.getYFloor = function(x, y, noWater){
	var ins = this.getInstanceAtGrid(vec3(x<<0,0,y<<0));
	if (ins != null && ins.height){
		return ins.position.b + ins.height;
	}
	
	var xx = x - (x << 0);
	var yy = y - (y << 0);
	x = x << 0;
	y = y << 0;
	if (!this.map[y]) return 0;
	if (this.map[y][x] === undefined) return 0;
	else if (this.map[y][x] === 0) return 0;
	
	var t = this.map[y][x];
	var tt = t.y;
	
	if (t.w) tt += t.h;
	if (t.f) tt = t.fy;
	
	if (!noWater && this.isWaterTile(t.f)) tt -= 0.3;
	
	if (t.sl){
		if (t.dir == 0) tt += yy * 0.5; else
		if (t.dir == 1) tt += xx * 0.5; else
		if (t.dir == 2) tt += (1.0 - yy) * 0.5; else
		if (t.dir == 3) tt += (1.0 - xx) * 0.5;
	}
	
	return tt;
};

MapManager.prototype.drawMap = function(){
	var x, y;
	x = this.player.position.a;
	y = this.player.position.c;
	
	for (var i=0,len=this.mapToDraw.length;i<len;i++){
		var mtd = this.mapToDraw[i];
		
		if (x < mtd.boundaries[0] || x > mtd.boundaries[2] || y < mtd.boundaries[1] || y > mtd.boundaries[3])
			continue;
		
		if (mtd.type == "B"){ // Blocks
			this.game.drawBlock(mtd, mtd.texInd);
		}else if (mtd.type == "F"){ // Floors
			var tt = mtd.texInd;
			if (this.isWaterTile(tt)){ 
				tt = (mtd.rTexInd) + (this.waterFrame << 0);
				this.game.drawFloor(mtd, tt, 'water');
			}else{
				this.game.drawFloor(mtd, tt, 'floor');
			}
		}else if (mtd.type == "C"){ // Ceils
			var tt = mtd.texInd;
			this.game.drawFloor(mtd, tt, 'ceil');
		}else if (mtd.type == "S"){ // Slope
			this.game.drawSlope(mtd, mtd.texInd);
		}
	}
};

MapManager.prototype.getPlayerItem = function(itemCode){
	var inv = this.game.inventory.items;
	for (var i=0,len=inv.length;i<len;i++){
		if (inv[i].code == itemCode){
			return inv[i];
		}
	}
	
	return null;
};

MapManager.prototype.removePlayerItem = function(itemCode, amount){
	var inv = this.game.inventory.items;
	for (var i=0,len=inv.length;i<len;i++){
		var it = inv[i];
		if (it.code == itemCode){
			if (--it.amount == 0){
				inv.splice(i,1);
			}
		}
	}
};

MapManager.prototype.addMessage = function(text){
	this.game.console.addSFMessage(text);
};

MapManager.prototype.step = function(){
	if (this.game.timeStop) return;
	
	this.waterFrame += 0.1;
	if (this.waterFrame >= 2) this.waterFrame = 0;
};

MapManager.prototype.getInstancesToDraw = function(){
	this.orderInstances = [];
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (!ins) continue;
		if (ins.destroyed){
			this.instances.splice(i, 1);
			i--;
			continue;
		}
		
		var xx = Math.abs(ins.position.a - this.player.position.a);
		var zz = Math.abs(ins.position.c - this.player.position.c);
		
		if (xx > 6 || zz > 6) continue;
		
		var dist = xx * xx + zz * zz;
		var added = false;
		for (var j=0,jlen=this.orderInstances.length;j<jlen;j++){
			if (dist > this.orderInstances[j].dist){
				this.orderInstances.splice(j,0,{_c: circular.register('OrderInstance'), ins: ins, dist: dist});
				added = true;
				j = jlen;
			}
		}
		
		if (!added){
			this.orderInstances.push({_c: circular.register('OrderInstance'), ins: ins, dist: dist});
		}
	}
};

MapManager.prototype.getInstancesAt = function(x, z){
	var ret = [];
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		
		if (!ins) continue;
		
		if (Math.round(ins.position.a) == x && Math.round(ins.position.c) == z)
			ret.push(ins);
	}
	
	return ret;
};

MapManager.prototype.loop = function(){
	if (this.map == null) return;
	
	this.step();
	
	this.drawMap();
	
	this.getInstancesToDraw();
	
	for (var i=0,len=this.orderInstances.length;i<len;i++){
		var ins = this.orderInstances[i];
		
		if (!ins) continue;
		ins = ins.ins;
		
		if (ins.destroyed){
			this.orderInstances.splice(i--,1);
			continue;
		}
		
		ins.loop();
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		
		if (!ins) continue;
		var xx = Math.abs(ins.position.a - this.player.position.a);
		var zz = Math.abs(ins.position.c - this.player.position.c);
		
		if (xx > 6 || zz > 6) continue;
		
		ins.loop();
		this.game.drawDoor(ins.position.a, ins.position.b, ins.position.c, ins.rotation, ins.textureCode);
		this.game.drawDoorWall(ins.doorPosition.a, ins.doorPosition.b, ins.doorPosition.c, ins.wallTexture, (ins.dir == "V"));
	}
	
	this.player.loop();
	if (this.poisonCount > 0){
		this.poisonCount -= 1;
	}else if (this.game.player.poisoned && this.poisonCount == 0){
		this.player.receiveDamage(10);
		this.poisonCount = 100;
	}
};

},{"./MapAssembler":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\MapAssembler.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Matrix.js":[function(require,module,exports){
module.exports = {
	makePerspective: function(fov, aspectRatio, zNear, zFar){
		var zLimit = zNear * Math.tan(fov * Math.PI / 360);
		var A = -(zFar + zNear) / (zFar - zNear);
		var B = -2 * zFar * zNear / (zFar - zNear);
		var C = (2 * zNear) / (zLimit * aspectRatio * 2);
		var D = (2 * zNear) / (2 * zLimit);
		
		return [
			C, 0, 0, 0,
			0, D, 0, 0,
			0, 0, A,-1,
			0, 0, B, 0
		];
	},
	
	newMatrix: function(cols, rows){
		var ret = new Array(rows);
		for (var i=0;i<rows;i++){
			ret[i] = new Array(cols);
			for (var j=0;j<cols;j++){
				ret[i][j] = 0;
			}
		}
		
		return ret;
	},
	
	getIdentity: function(){
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	},
	
	makeTransform: function(object, camera){
		// Starts with the identity matrix
		var tMat = this.getIdentity();
		
		// Rotate the object
		// Until I find the need to rotate an object itself it reamins as comment
		//tMat = this.matrixMultiplication(tMat, this.getRotationX(object.rotation.a));
		tMat = this.matrixMultiplication(tMat, this.getRotationY(object.rotation.b));
		//tMat = this.matrixMultiplication(tMat, this.getRotationZ(object.rotation.c));
		
		// If the object is a billboard, then make it look to the camera
		if (object.isBillboard && !object.noRotate) tMat = this.matrixMultiplication(tMat, this.getRotationY(-(camera.rotation.b - Math.PI_2)));
		
		// Move the object to its position
		tMat = this.matrixMultiplication(tMat, this.getTranslation(object.position.a, object.position.b, object.position.c));
		
		// Move the object in relation to the camera
		tMat = this.matrixMultiplication(tMat, this.getTranslation(-camera.position.a, -camera.position.b - camera.cameraHeight, -camera.position.c));
		
		// Rotate the object in the camera direction (I don't really rotate in the Z axis)
		tMat = this.matrixMultiplication(tMat, this.getRotationY(camera.rotation.b - Math.PI_2));
		tMat = this.matrixMultiplication(tMat, this.getRotationX(-camera.rotation.a));
		//tMat = this.matrixMultiplication(tMat, this.getRotationZ(-camera.rotation.c));
		
		return tMat;
	},
	
	getTranslation: function(x, y, z){
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		];
	},
	
	getRotationX: function(ang){
		var C = Math.cos(ang);
		var S = Math.sin(ang);
		
		return [
			1, 0, 0, 0,
			0, C, S, 0,
			0,-S, C, 0,
			0, 0, 0, 1
		];
	},
	
	getRotationY: function(ang){
		var C = Math.cos(ang);
		var S = Math.sin(ang);
		
		return [
			 C, 0, S, 0,
			 0, 1, 0, 0,
			-S, 0, C, 0,
			 0, 0, 0, 1
		];
	},
	
	getRotationZ: function(ang){
		var C = Math.cos(ang);
		var S = Math.sin(ang);
		
		return [
			 C, S, 0, 0,
			-S, C, 0, 0,
			 0, 0, 1, 0,
			 0, 0, 0, 1
		];
	},
	
	miniMatrixMult: function(row, column){
		var result = 0;
		for (var i=0,len=row.length;i<len;i++){
			result += row[i] * column[i];
		}
		
		return result;
	},
	
	matrixMultiplication: function(matrixA, matrixB){
		var A1 = [matrixA[0],  matrixA[1],  matrixA[2],  matrixA[3]];
		var A2 = [matrixA[4],  matrixA[5],  matrixA[6],  matrixA[7]];
		var A3 = [matrixA[8],  matrixA[9],  matrixA[10], matrixA[11]];
		var A4 = [matrixA[12], matrixA[13], matrixA[14], matrixA[15]];
		
		var B1 = [matrixB[0], matrixB[4], matrixB[8],  matrixB[12]];
		var B2 = [matrixB[1], matrixB[5], matrixB[9],  matrixB[13]];
		var B3 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
		var B4 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];
		
		var mmm = this.miniMatrixMult;
		return [
			mmm(A1, B1), mmm(A1, B2), mmm(A1, B3), mmm(A1, B4),
			mmm(A2, B1), mmm(A2, B2), mmm(A2, B3), mmm(A2, B4),
			mmm(A3, B1), mmm(A3, B2), mmm(A3, B3), mmm(A3, B4),
			mmm(A4, B1), mmm(A4, B2), mmm(A4, B3), mmm(A4, B4)
		];
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Missile.js":[function(require,module,exports){
var ObjectFactory = require('./ObjectFactory');
var Utils = require('./Utils');

circular.setTransient('Missile', 'billboard');
circular.setReviver('Missile', function(object, game) {
	object.billboard = ObjectFactory.billboard(vec3(1.0, 1.0, 1.0), vec2(1.0, 1.0), game.GL.ctx);
	object.billboard.texBuffer = game.objectTex.bolts.buffers[object.subImg];
	
});

function Missile(){
	this._c = circular.register('Missile');
}

module.exports = Missile;
circular.registerClass('Missile', Missile);


Missile.prototype.init = function(position, rotation, type, target, mapManager){
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
	this.subImg = subImg;
	this.textureCode = 'bolts';
	this.billboard.texBuffer = mapManager.game.objectTex.bolts.buffers[subImg];
};

Missile.prototype.checkCollision = function(){
	var map = this.mapManager.map;
	if (this.position.a < 0 || this.position.c < 0 || this.position.a >= map[0].length || this.position.c >= map.length) return false;
	
	var x = this.position.a << 0;
	var y = this.position.b + 0.5;
	var z = this.position.c << 0;
	var tile = map[z][x];
	
	if (tile.w || tile.wd || tile.wd){
		if (!(tile.y + tile.h < y || tile.y > y)){
			 return false;
		}
	}
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
		
		dfs = Utils.rollDice(ins.enemy.stats.dfs);
	}else{
		ins = this.mapManager.player;
		dfs = Utils.rollDice(this.mapManager.game.player.stats.dfs);
	}
	
	var dmg = Math.max(this.str - dfs, 0);
	
	if (this.missed){
		//this.mapManager.addMessage("Missed!");
		this.mapManager.game.playSound('miss');
		return;
	}
	
	if (dmg != 0){
		this.mapManager.addMessage(dmg + " damage"); // TODO: Replace with popup over ins
		this.mapManager.game.playSound('hit');
		ins.receiveDamage(dmg);
	}else{
		//this.mapManager.addMessage("Blocked!");
		this.mapManager.game.playSound('block');
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
},{"./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js":[function(require,module,exports){
var Utils = require('./Utils');

module.exports = {
	normals: {
		down:  vec2( 0, 1),
		right: vec2( 1, 0),
		up:    vec2( 0,-1),
		left:  vec2(-1, 0),
		
		upRight:  vec2(Math.cos(Math.degToRad(45)), -Math.sin(Math.degToRad(45))),
		upLeft:  vec2(-Math.cos(Math.degToRad(45)), -Math.sin(Math.degToRad(45))),
		downRight:  vec2(Math.cos(Math.degToRad(45)), Math.sin(Math.degToRad(45))),
		downLeft:  vec2(-Math.cos(Math.degToRad(45)), Math.sin(Math.degToRad(45)))
	},
	
	cube: function(size, texRepeat, gl, light, /*[u,l,d,r]*/ faces){
		var vertex, indices, texCoords, darkVertex;
		var w = size.a / 2;
		var h = size.b;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [];
		darkVertex = [];
		if (!faces) faces = [1,1,1,1];
		if (faces[0]){ // Up Face
			vertex.push(
				 w,  h, -l,
			 	 w,  0, -l,
				-w,  h, -l,
				-w,  0, -l);
				
			darkVertex.push(1,1,1,1);
		}
		if (faces[1]){ // Left Face
			vertex.push(
				 w,  h,  l,
				 w,  0,  l,
				 w,  h, -l,
				 w,  0, -l);
				
			darkVertex.push(0,0,0,0);
		}
		if (faces[2]){ // Down Face
			vertex.push(
				-w,  h,  l,
				-w,  0,  l,
				 w,  h,  l,
				 w,  0,  l);
				
			darkVertex.push(1,1,1,1);
		}
		if (faces[3]){ // Right Face
			vertex.push(
				-w,  h, -l,
				-w,  0, -l,
				-w,  h,  l,
				-w,  0,  l);
				
			darkVertex.push(0,0,0,0);
		}
		
		indices = [];
		texCoords = [];
		for (var i=0,len=vertex.length/3;i<len;i+=4){
			indices.push(i, i+1, i+2, i+2, i+1, i+3);
		
			texCoords.push(
				 tx, ty,
				 tx,0.0,
				0.0, ty,
				0.0,0.0
			);
		}
		
		return {vertices: vertex, indices: indices, texCoords: texCoords, darkVertex: darkVertex};
	},
	
	floor: function(size, texRepeat, gl){
		var vertex, indices, texCoords;
		var w = size.a / 2;
		var h = size.b / 2;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			 w, 0.0,  l,
			 w, 0.0, -l,
			-w, 0.0,  l,
			-w, 0.0, -l,
		];
		
		indices = [];
		indices.push(0, 1, 2, 2, 1, 3);
		
		texCoords = [];
		texCoords.push(
			 tx, ty,
			 tx,0.0,
			0.0, ty,
			0.0,0.0
		);
		
		darkVertex = [0,0,0,0];
		
		return {vertices: vertex, indices: indices, texCoords: texCoords, darkVertex: darkVertex};
	},
	
	ceil: function(size, texRepeat, gl){
		var vertex, indices, texCoords;
		var w = size.a / 2;
		var h = size.b / 2;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			 w, 0.0,  l,
			 w, 0.0, -l,
			-w, 0.0,  l,
			-w, 0.0, -l,
		];
		
		indices = [];
		indices.push(0, 2, 1, 1, 2, 3);
		
		texCoords = [];
		texCoords.push(
			 tx, ty,
			 tx,0.0,
			0.0, ty,
			0.0,0.0
		);
		
		darkVertex = [0,0,0,0];
		
		return {vertices: vertex, indices: indices, texCoords: texCoords, darkVertex: darkVertex};
	},
	
	doorWall: function(size, texRepeat, gl){
		var vertex, indices, texCoords, darkVertex;
		var w = size.a / 2;
		var h = size.b;
		var l = size.c * 0.05;
		
		var w2 = -size.a * 0.25;
		var w3 = size.a * 0.25;
		
		var h2 = 1 - size.b * 0.25;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			// Right part of the door
			// Front Face
			w2,  h, -l,
			w2,  0, -l,
			-w,  h, -l,
			-w,  0, -l,
			
			// Back Face
			-w,  h,  l,
			-w,  0,  l,
			w2,  h,  l,
			w2,  0,  l,
			 
			// Right Face
			w2,  h,  l,
			w2,  0,  l,
			w2,  h, -l,
			w2,  0, -l,
			
			// Left part of the door
			// Front Face
			 w,  h, -l,
			 w,  0, -l,
			w3,  h, -l,
			w3,  0, -l,
			
			// Back Face
			w3,  h,  l,
			w3,  0,  l,
			 w,  h,  l,
			 w,  0,  l,
			 
			// Left Face
			w3,  h, -l,
			w3,  0, -l,
			w3,  h,  l,
			w3,  0,  l,
			
			// Middle part of the door
			// Front Face
			w3,  h, -l,
			w3, h2, -l,
			w2,  h, -l,
			w2, h2, -l,
			
			// Back Face
			w2,  h,  l,
			w2, h2,  l,
			w3,  h,  l,
			w3, h2,  l,
			 
			// Bottom Face
			w3, h2, -l,
			w3, h2,  l,
			w2, h2, -l,
			w2, h2,  l,
		];
		
		indices = [];
		for (var i=0,len=vertex.length/3;i<len;i+=4){
			indices.push(i, i+1, i+2, i+2, i+1, i+3);
		}
		
		texCoords = [];
		for (var i=0;i<6;i++){
			texCoords.push(
				0.25, ty,
				0.25,0.0,
				0.00, ty,
				0.00,0.0
			);
		}
		for (var i=0;i<3;i++){
			texCoords.push(
				0.5,1.0,
				0.5,0.75,
				0.0,1.0,
				0.0,0.75
			);
		}
		
		darkVertex = [];
		for (var i=0;i<36;i++){
			darkVertex.push(0);
		}
		
		// Creates the buffer data for the vertices
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
		vertexBuffer.numItems = vertex.length;
		vertexBuffer.itemSize = 3;
		
		// Creates the buffer data for the texture coordinates
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		texBuffer.numItems = texCoords.length;
		texBuffer.itemSize = 2;
		
		// Creates the buffer data for the indices
		var indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		indicesBuffer.numItems = indices.length;
		indicesBuffer.itemSize = 1;
		
		var darkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, darkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(darkVertex), gl.STATIC_DRAW);
		darkBuffer.numItems = darkBuffer.length;
		darkBuffer.itemSize = 1;
		
		return this.getObjectWithProperties(vertexBuffer, indicesBuffer, texBuffer, darkBuffer);
	},
	
	door: function(size, texRepeat, gl, light){
		var vertex, indices, texCoords, darkVertex;
		var w = size.a;
		var h = size.b;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			// Front Face
			 w,  h, -l,
			 w,  0, -l,
			 0,  h, -l,
			 0,  0, -l,
			
			// Back Face
			 0,  h,  l,
			 0,  0,  l,
			 w,  h,  l,
			 w,  0,  l,
			 
			// Right Face
			 w,  h,  l,
			 w,  0,  l,
			 w,  h, -l,
			 w,  0, -l,
			 
			// Left Face
			 0,  h, -l,
			 0,  0, -l,
			 0,  h,  l,
			 0,  0,  l,
		];
		
		indices = [];
		for (var i=0,len=vertex.length/3;i<len;i+=4){
			indices.push(i, i+1, i+2, i+2, i+1, i+3);
		}
		
		texCoords = [];
		texCoords.push(tx, ty, tx,0.0, 0.0, ty, 0.0,0.0);
		texCoords.push(0.0, ty, 0.0,0.0, tx, ty, tx,0.0);
		for (var i=0;i<2;i++){
			texCoords.push(
				0.01,0.01,
				0.01,0.0,
				0.0 ,0.01,
				0.0 ,0.0
			);
		}
		
		darkVertex = [];
		for (var i=0;i<16;i++){
			darkVertex.push(0);
		}
		
		// Creates the buffer data for the vertices
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
		vertexBuffer.numItems = vertex.length;
		vertexBuffer.itemSize = 3;
		
		// Creates the buffer data for the texture coordinates
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		texBuffer.numItems = texCoords.length;
		texBuffer.itemSize = 2;
		
		// Creates the buffer data for the indices
		var indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		indicesBuffer.numItems = indices.length;
		indicesBuffer.itemSize = 1;
		
		var darkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, darkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(darkVertex), gl.STATIC_DRAW);
		darkBuffer.numItems = darkBuffer.length;
		darkBuffer.itemSize = 1;
		
		var door = this.getObjectWithProperties(vertexBuffer, indicesBuffer, texBuffer, darkBuffer);
		return door;
	},
	
	billboard: function(size, texRepeat, gl){
		var vertex, indices, texCoords, darkVertex;
		var w = size.a / 2;
		var h = size.b;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			 w,  h,  0,
			-w,  h,  0,
			 w,  0,  0,
			-w,  0,  0,
		];
		
		indices = [];
		for (var i=0,len=4;i<len;i+=4){
			indices.push(i, i+1, i+2, i+2, i+1, i+3);
		}
		
		texCoords = [
			 tx, ty,
			0.0, ty,
			 tx,0.0,
			0.0,0.0
		];
				 
		
		darkVertex = [0,0,0,0];
		
		// Creates the buffer data for the vertices
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
		vertexBuffer.numItems = vertex.length;
		vertexBuffer.itemSize = 3;
		
		// Creates the buffer data for the texture coordinates
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		texBuffer.numItems = texCoords.length;
		texBuffer.itemSize = 2;
		
		// Creates the buffer data for the indices
		var indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		indicesBuffer.numItems = indices.length;
		indicesBuffer.itemSize = 1;
		
		var darkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, darkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(darkVertex), gl.STATIC_DRAW);
		darkBuffer.numItems = darkBuffer.length;
		darkBuffer.itemSize = 1;
		
		var bill =  this.getObjectWithProperties(vertexBuffer, indicesBuffer, texBuffer, darkBuffer);
		bill.isBillboard = true;
		return bill;
	},
	
	slope: function(size, texRepeat, gl, dir){
		var vertex, indices, texCoords;
		var w = size.a / 2;
		var h = size.b / 2;
		var l = size.c / 2;
		
		var tx = texRepeat.a;
		var ty = texRepeat.b;
		
		vertex = [
			 // Front Slope
			 w,  0.5,  l,
			 w,  0.0, -l,
			-w,  0.5,  l,
			-w,  0.0, -l,
			
			 // Right Side
			 w,  0.5,  l,
			 w,  0.0,  l,
			 w,  0.0, -l,
			 
			 // Left Side
			-w,  0.5,  l,
			-w,  0.0, -l,
			-w,  0.0,  l
		];
		
		if (dir != 0){
			var ang = Math.degToRad(dir * -90);
			var C = Math.cos(ang);
			var S = Math.sin(ang);
			for (var i=0;i<vertex.length;i+=3){
				var a = vertex[i] * C - vertex[i+2] * S;
				var b = vertex[i] * S + vertex[i+2] * C;
				
				vertex[i] = a;
				vertex[i+2] = b;
			}
		}
		
		
		indices = [];
		indices.push(0, 1, 2, 2, 1, 3, 4, 5, 6, 7, 8, 9);
		
		texCoords = [];
		texCoords.push(
			 tx, 0.0,
			 tx,  ty,
			0.0, 0.0,
			0.0,  ty,
			
			 tx, 0.0,
			 tx,  ty,
			0.0,  ty,
			
			0.0, 0.0,
			 tx,  ty,
			0.0,  ty
		);
		
		darkVertex = [0,0,0,0,0,0,0,0,0,0];
		
		return {vertices: vertex, indices: indices, texCoords: texCoords, darkVertex: darkVertex};
	},
	
	assembleObject: function(mapData, objectType, gl){
		var vertices = [];
		var texCoords = [];
		var indices = [];
		var darkVertex = [];
		
		var rect = [64,64,0,0]; // [x1,y1,x2,y2]
		for (var y=0,ylen=mapData.length;y<ylen;y++){
			for (var x=0,xlen=mapData[y].length;x<xlen;x++){
				var t = (mapData[y][x].tile)? mapData[y][x].tile : 0;
				if (t != 0){
					// Selecting boundaries of the map part
					rect[0] = Math.min(rect[0], x - 6);
					rect[1] = Math.min(rect[1], y - 6);
					rect[2] = Math.max(rect[2], x + 6);
					rect[3] = Math.max(rect[3], y + 6);
					
					var vv;
					if (objectType == "F"){ vv = this.floor(vec3(1.0,1.0,1.0), vec2(1.0,1.0), gl); }else // Floor
					if (objectType == "C"){ vv = this.ceil(vec3(1.0,1.0,1.0), vec2(1.0,1.0), gl); }else // Ceil
					if (objectType == "B"){ vv = this.cube(vec3(1.0,mapData[y][x].h,1.0), vec2(1.0,mapData[y][x].h), gl, false, this.getCubeFaces(mapData, x, y)); }else // Block
					if (objectType == "S"){ vv = this.slope(vec3(1.0,1.0,1.0), vec2(1.0,1.0), gl, mapData[y][x].dir); } // Slope
					
					var vertexOff = vertices.length / 3;
					for (var i=0,len=vv.vertices.length;i<len;i+=3){
						xx = vv.vertices[i] + x + 0.5;
						yy = vv.vertices[i+1] + mapData[y][x].y;
						zz = vv.vertices[i+2] + y + 0.5;
						
						vertices.push(xx, yy, zz);
					}
					
					for (var i=0,len=vv.indices.length;i<len;i+=1){
						indices.push(vv.indices[i] + vertexOff);
					}
					
					for (var i=0,len=vv.texCoords.length;i<len;i+=1){
						texCoords.push(vv.texCoords[i]);
					}
					
					for (var i=0,len=vv.darkVertex.length;i<len;i+=1){
						darkVertex.push(vv.darkVertex[i]);
					}
				}
			}
		}
		
		// TODO: Recreate buffer data on deserialization
		
		// Creates the buffer data for the vertices
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		vertexBuffer.numItems = vertices.length;
		vertexBuffer.itemSize = 3;
		
		// Creates the buffer data for the texture coordinates
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		texBuffer.numItems = texCoords.length;
		texBuffer.itemSize = 2;
		
		// Creates the buffer data for the indices
		var indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		indicesBuffer.numItems = indices.length;
		indicesBuffer.itemSize = 1;
		
		var darkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, darkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(darkVertex), gl.STATIC_DRAW);
		darkBuffer.numItems = darkVertex.length;
		darkBuffer.itemSize = 1;
		
		var buffer = this.getObjectWithProperties(vertexBuffer, indicesBuffer, texBuffer, darkBuffer);
		buffer.boundaries = rect;
		return buffer;
	},
	
	
	getCubeFaces: function(map, x, y){
		var ret = [1,1,1,1];
		var tile = map[y][x];
		
		// Up Face
		if (y > 0 && map[y-1][x] != 0){
			var t = map[y-1][x];
			if (t.y <= tile.y && (t.y + t.h) >= (tile.y + tile.h)){
				ret[0] = 0;
			}
		}
		// Left face
		if (x < 63 && map[y][x+1] != 0){
			var t = map[y][x+1];
			if (t.y <= tile.y && (t.y + t.h) >= (tile.y + tile.h)){
				ret[1] = 0;
			}
		}
		// Down face
		if (y < 63 && map[y+1][x] != 0){
			var t = map[y+1][x];
			if (t.y <= tile.y && (t.y + t.h) >= (tile.y + tile.h)){
				ret[2] = 0;
			}
		}
		// Right face
		if (x > 0 && map[y][x-1] != 0){
			var t = map[y][x-1];
			if (t.y <= tile.y && (t.y + t.h) >= (tile.y + tile.h)){
				ret[3] = 0;
			}
		}
		
		return ret;
	},
	
	getObjectWithProperties: function(vertexBuffer, indexBuffer, texBuffer, darkBuffer){
		var obj = {
			rotation: vec3(0, 0, 0),
			position: vec3(0, 0, 0),
			vertexBuffer: vertexBuffer, 
			indicesBuffer: indexBuffer, 
			texBuffer: texBuffer,
			darkBuffer: darkBuffer
		};
		
		return obj;
	},
	
	create3DObject: function(gl, baseObject){
		// Creates the buffer data for the vertices
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baseObject.vertices), gl.STATIC_DRAW);
		vertexBuffer.numItems = baseObject.vertices.length;
		vertexBuffer.itemSize = 3;
		
		// Creates the buffer data for the texture coordinates
		var texBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baseObject.texCoords), gl.STATIC_DRAW);
		texBuffer.numItems = baseObject.texCoords.length;
		texBuffer.itemSize = 2;
		
		// Creates the buffer data for the indices
		var indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(baseObject.indices), gl.STATIC_DRAW);
		indicesBuffer.numItems = baseObject.indices.length;
		indicesBuffer.itemSize = 1;
		
		var darkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, darkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(baseObject.darkVertex), gl.STATIC_DRAW);
		darkBuffer.numItems = baseObject.darkVertex.length;
		darkBuffer.itemSize = 1;
		
		var buffer = this.getObjectWithProperties(vertexBuffer, indicesBuffer, texBuffer, darkBuffer);
		
		return buffer;
	},
	
	translateObject: function(object, translation){
		for (var i=0,len=object.vertices.length;i<len;i+=3){
			object.vertices[i] += translation.a;
			object.vertices[i+1] += translation.b;
			object.vertices[i+2] += translation.c;
		}
		
		return object;
	},
	
	fuzeObjects: function(objectList){
		var vertices = [];
		var texCoords = [];
		var indices = [];
		var darkVertex = [];
		
		var indexCount = 0;
		for (var i=0,len=objectList.length;i<len;i++){
			var obj = objectList[i];
			
			for (var j=0,jlen=obj.vertices.length;j<jlen;j++){
				vertices.push(obj.vertices[j]);
			}
			
			for (var j=0,jlen=obj.texCoords.length;j<jlen;j++){
				texCoords.push(obj.texCoords[j]);
			}
			
			for (var j=0,jlen=obj.indices.length;j<jlen;j++){
				indices.push(obj.indices[j] + indexCount);
			}
			
			for (var j=0,jlen=obj.darkVertex.length;j<jlen;j++){
				darkVertex.push(obj.darkVertex[j]);
			}
			
			indexCount += obj.vertices.length / 3;
		}
		
		return {vertices: vertices, indices: indices, texCoords: texCoords, darkVertex: darkVertex};
	},
	
	load3DModel: function(modelFile, gl){
		var model = {ready: false};
		
		var http = Utils.getHttp();
		http.open("GET", cp + "models/" + modelFile + ".obj?version=" + version, true);
		http.onreadystatechange = function(){
			if (http.readyState == 4 && http.status == 200) {
				var lines = http.responseText.split("\n");
				
				var vertices = [], texCoords = [], triangles = [], vertexIndex = [], texIndices = [], indices = [], darkVertex = [];
				var working;
				var t = false;
				for (var i=0,len=lines.length;i<len;i++){
					var l = lines[i].trim();
					if (l == ""){ continue; }else
					if (l == "# vertices"){ working = vertices; t = false; }else
					if (l == "# texCoords"){ working = texCoords; t = true; }else
					if (l == "# triangles"){ working = triangles; t = false; }
					else{
						var params = l.split(" ");
						for (var j=0,jlen=params.length;j<jlen;j++){
							if (!isNaN(params[j])){
								params[j] = parseFloat(params[j]);
							}
							
							if (!t) working.push(params[j]);
						}
						if (t) working.push(params);
					}
				}
				
				var usedVer = [];
				var usedInd = [];
				for (var i=0,len=triangles.length;i<len;i++){
					if (usedVer.indexOf(triangles[i]) != -1){
						indices.push(usedInd[usedVer.indexOf(triangles[i])]);
					}else{
						usedVer.push(triangles[i]);
						var t = triangles[i].split("/");
					
						t[0] = parseInt(t[0]) - 1;
						t[1] = parseInt(t[1]) - 1;
						
						indices.push(vertexIndex.length / 3);
						usedInd.push(vertexIndex.length / 3);
						
						vertexIndex.push(vertices[t[0] * 3], vertices[t[0] * 3 + 1], vertices[t[0] * 3 + 2]);
						
						texIndices.push(texCoords[t[1]][0], texCoords[t[1]][1]);
					}
				}
				
				for (var i=0,len=texIndices.length/2;i<len;i++){
					darkVertex.push(0);
				}
				
				var base = {vertices: vertexIndex, indices: indices, texCoords: texIndices, darkVertex: darkVertex};
				var model3D = this.create3DObject(gl, base);

				model.rotation = model3D.rotation;
				model.position = model3D.position;
				model.vertexBuffer = model3D.vertexBuffer;
				model.indicesBuffer = model3D.indicesBuffer;
				model.texBuffer = model3D.texBuffer;
				model.darkBuffer = model3D.darkBuffer;
				model.ready = true;
			}
		};
		http.send();
		
		return model;
	}
};

},{"./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Player.js":[function(require,module,exports){
var Missile = require('./Missile');
var Utils = require('./Utils');

var cheatEnabled = false;

function Player(position, direction, mapManager){
	this._c = circular.register('Player'); 
}

module.exports = Player;
circular.registerClass('Player', Player);

Player.prototype.init = function(position, direction, mapManager){
	this.position = position;
	this.rotation = direction;
	this.mapManager = mapManager;
	
	this.rotationSpd = vec2(Math.degToRad(1), Math.degToRad(4));
	this.movementSpd = 0.05;
	this.cameraHeight = 0.5;
	this.maxVertRotation = Math.degToRad(45);
	
	this.targetY = position.b;
	this.ySpeed = 0.0;
	this.yGravity = 0.0;
	
	this.jog = vec4(0.0, 1, 0.0, 1);
	this.onWater = false;
	this.moved = false;
	this.stepInd = 1;

	this.hurt = 0.0;	
	this.attackWait = 0;
	
	this.lavaCounter = 0;
	this.launchAttackCounter = 0;
};

Player.prototype.receiveDamage = function(dmg){
	var game = this.mapManager.game;
	
	game.playSound('hit');
	this.hurt = 5.0;
	var player = game.player;
	player.hp -= dmg;
	if (player.hp <= 0){
		player.hp = 0;
		this.mapManager.addMessage("You died!");
		game.saveManager.deleteGame();
		this.destroyed = true;
	}
};

Player.prototype.castMissile = function(weapon){
	var game = this.mapManager.game;
	var ps = game.player;
	
	var str = Utils.rollDice(ps.stats.str);
	if (weapon) str += Utils.rollDice(weapon.str) * weapon.status;
	
	var prob = Math.random();
	var missile = new Missile();
	missile.init(this.position.clone(), this.rotation.clone(), weapon.code, 'enemy', this.mapManager);
	missile.str = str << 0;
	missile.missed = (prob > ps.stats.dex);
	if (weapon) 
		weapon.status *= (1.0 - weapon.wear); // TODO: Enhance weapon degradation
	//this.mapManager.addMessage("You shoot a " + weapon.subItemName);
	this.mapManager.instances.push(missile);
	this.attackWait = 30;
	this.moved = true;
};

Player.prototype.meleeAttack = function(weapon){
	var enemies = this.mapManager.getInstancesNearest(this.position, 1.0, 'enemy');
		
	var xx = this.position.a;
	var zz = this.position.c;
	var dx = Math.cos(this.rotation.b) * 0.1;
	var dz = -Math.sin(this.rotation.b) * 0.1;
	
	for (var i=0;i<10;i++){
		xx += dx;
		zz += dz;
		var object;
		
		for (var j=0,jlen=enemies.length;j<jlen;j++){
			var ins = enemies[j];
			var x = Math.abs(ins.position.a - xx);
			var z = Math.abs(ins.position.c - zz);
			
			if (x < 0.3 && z < 0.3){
				object = ins;
				j = jlen;
			}
		}
		
		if (object && object.enemy){
			this.castAttack(object, weapon);
			this.attackWait = 20;
			this.moved = true;
			i = 11;
		}
	}
};

Player.prototype.castAttack = function(target, weapon){
	var game = this.mapManager.game;
	var ps = game.player;
	
	var prob = Math.random();
	if (prob > ps.stats.dex){
		game.playSound('miss');
		//this.mapManager.addMessage("Missed!");
		return;
	}
	
	var str = Utils.rollDice(ps.stats.str);
	//var dfs = Utils.rollDice(target.enemy.stats.dfs);
	var dfs = 0;
	
	if (weapon) str += Utils.rollDice(weapon.str) * weapon.status;
	
	var dmg = Math.max(str - dfs, 0) << 0;
	
	//this.mapManager.addMessage("Attacking " + target.enemy.name);
	
	if (dmg > 0){
		game.playSound('hit');
		this.mapManager.addMessage(target.enemy.name + " damaged x"+dmg); // TODO: Replace with damage popup on the enemy
		target.receiveDamage(dmg);
	}else{
		// this.mapManager.addMessage("Blocked!");
		this.mapManager.game.playSound('block');
	}
	
	if (weapon) 
		weapon.status *= (1.0 - weapon.wear); // TODO: Enhance weapon degradation
};

Player.prototype.jogMovement = function(){
	if (this.onWater){
		this.jog.a += 0.005 * this.jog.b;
		if (this.jog.a >= 0.03 && this.jog.b == 1) this.jog.b = -1; else
		if (this.jog.a <= -0.03 && this.jog.b == -1) this.jog.b = 1;
	}else{
		this.jog.a += 0.008 * this.jog.b;
		if (this.jog.a >= 0.03 && this.jog.b == 1) this.jog.b = -1; else
		if (this.jog.a <= -0.03 && this.jog.b == -1){
			this.mapManager.game.playSound('step' + this.stepInd);
			if (++this.stepInd == 3) this.stepInd = 1;
			this.jog.b = 1;
		}
	}
};

Player.prototype.moveTo = function(xTo, zTo){
	var moved = false;
	
	var swim = (this.onLava || this.onWater);
	if (swim){
		xTo *= 0.75; 
		zTo *= 0.75;
	}
	var movement = vec2(xTo, zTo);
	var spd = vec2(xTo * 1.5, 0);
	var fakePos = this.position.clone();
		
	for (var i=0;i<2;i++){
		var normal = this.mapManager.getWallNormal(fakePos, spd, this.cameraHeight, swim);
		if (!normal){ normal = this.mapManager.getInstanceNormal(fakePos, spd, this.cameraHeight); } 
		
		if (normal){
			normal = normal.clone();
			var dist = movement.dot(normal);
			normal.multiply(-dist);
			movement.sum(normal);
		}
		
		fakePos.a += movement.a;
		
		spd = vec2(0, zTo * 1.5);
	}
	
	if (movement.a != 0 || movement.b != 0){
		this.position.a += movement.a;
		this.position.c += movement.b;
		this.doVerticalChecks();
		this.jogMovement();
		moved = true;
	}
	
	this.moved = moved;
	return moved;
};

Player.prototype.mouseLook = function(){
	var mMovement = this.mapManager.game.getMouseMovement();
	
	if (mMovement.x != -10000){ this.rotation.b -= Math.degToRad(mMovement.x); }
	if (mMovement.y != -10000){ this.rotation.a -= Math.degToRad(mMovement.y); }
};

Player.prototype.movement = function(){
	var game = this.mapManager.game;
	
	this.mouseLook();

	// Rotation with keyboard
	if (game.keys[81] == 1 || game.keys[37] == 1){
		this.rotation.b += this.rotationSpd.b;
	}else if (game.keys[69] == 1 || game.keys[39] == 1){
		this.rotation.b -= this.rotationSpd.b;
	}else if (game.keys[38] == 1){ // Up arrow
		this.rotation.a += this.rotationSpd.a;
	}else if (game.keys[40] == 1){ // Down arrow
		this.rotation.a -= this.rotationSpd.a;
	}
	
	
	var A = 0.0, B = 0.0;
	if (game.keys[87] == 1){
		A = Math.cos(this.rotation.b) * this.movementSpd;
		B = -Math.sin(this.rotation.b) * this.movementSpd;
	}else if (game.keys[83] == 1){
		A = -Math.cos(this.rotation.b) * this.movementSpd * 0.3;
		B = Math.sin(this.rotation.b) * this.movementSpd * 0.3;
	}
	
	if (game.keys[65] == 1){
		A = Math.cos(this.rotation.b + Math.PI_2) * this.movementSpd;
		B = -Math.sin(this.rotation.b + Math.PI_2) * this.movementSpd;
	}else if (game.keys[68] == 1){
		A = Math.cos(this.rotation.b - Math.PI_2) * this.movementSpd;
		B = -Math.sin(this.rotation.b - Math.PI_2) * this.movementSpd;
	}
	
	if (A != 0.0 || B != 0.0){ this.moveTo(A, B); }else{ this.jog.a = 0.0; }
	if (this.rotation.a > this.maxVertRotation) this.rotation.a = this.maxVertRotation;
	else if (this.rotation.a < -this.maxVertRotation) this.rotation.a = -this.maxVertRotation;
};

Player.prototype.checkAction = function(){
	var game = this.mapManager.game;
	if (game.getKeyPressed(32)){ // Space
		var xx = (this.position.a + Math.cos(this.rotation.b) * 0.6) << 0;
		var zz = (this.position.c - Math.sin(this.rotation.b) * 0.6) << 0;
		
		var object = this.mapManager.getInstanceAtGrid(vec3(xx, this.position.b, zz));
		if (!object) object = this.mapManager.getInstanceAtGrid(vec3(this.position.a << 0, this.position.b, this.position.c << 0));
		
		if (object && object.activate)
			object.activate();
			
		if (cheatEnabled){
			if (game.floorDepth < 8)
				this.mapManager.game.loadMap(false, game.floorDepth + 1);
			else
				this.mapManager.game.loadMap('codexRoom');
		}
	}else if ((game.getMouseButtonPressed() || game.getKeyPressed(13)) && this.attackWait == 0){	// Melee attack, Enter
		var weapon = game.inventory.getWeapon();
		
		if (!weapon || !weapon.ranged){
			this.launchAttackCounter = 5;
		}else if (weapon && weapon.ranged){
			this.castMissile(weapon);
		}
		
		if (weapon && weapon.status < 0.05){
			this.mapManager.game.inventory.destroyItem(weapon);
			this.mapManager.addMessage(weapon.name + " damaged!");
		}
	} else if (game.getKeyPressed(79)){ // O, TODO: change to Ctrl+S
		this.mapManager.addMessage("Saving game.");
		game.saveManager.saveGame();
		this.mapManager.addMessage("Game Saved.");
	}

};

Player.prototype.doVerticalChecks = function(){
	var pointY = this.mapManager.getYFloor(this.position.a, this.position.c);
	var wy = (this.onWater || this.onLava)? 0.3 : 0;
	var py = Math.floor((pointY - (this.position.b + wy)) * 100) / 100;
	if (py <= 0.3) this.targetY = pointY;
	if (this.mapManager.isLavaPosition(this.position.a, this.position.c)){
		this.onWater = false;
		if (!this.onLava){
			this.receiveDamage(80);
		}
		this.onLava = true;
		
	} else if (this.mapManager.isWaterPosition(this.position.a, this.position.c)){
		if (this.position.b == this.targetY)
			this.movementSpd = 0.025;
		this.onWater = true;
		this.onLava = false;
	}else {
		this.movementSpd = 0.05;
		this.onWater = false;
		this.onLava = false;
	}
	
	this.cameraHeight = 0.5 + this.jog.a + this.jog.c;
};

Player.prototype.doFloat = function(){
	if (this.onWater && this.jog.a == 0.0){
		this.jog.c += 0.005 * this.jog.d;
		if (this.jog.c >= 0.03 && this.jog.d == 1) this.jog.d = -1; else
		if (this.jog.c <= -0.03 && this.jog.d == -1) this.jog.d = 1;
		this.cameraHeight = 0.5 + this.jog.a + this.jog.c;
	}else{
		this.jog.c = 0.0;
	}
};

Player.prototype.step = function(){
	if (this.hurt > 0.0) return;
	
	this.doFloat();
	this.movement();
	this.checkAction();
	
	if (this.targetY < this.position.b){
		this.position.b -= 0.1;
		this.jog.a = 0.0;
		if (this.position.b <= this.targetY) this.position.b = this.targetY;
	}else if (this.targetY > this.position.b){
		this.position.b += 0.08;
		this.jog.a = 0.0;
		if (this.position.b >= this.targetY) this.position.b = this.targetY;
	}
	
	//this.targetY = this.position.b;
};

Player.prototype.loop = function(){
	if (this.mapManager.game.paused) return;
	
	if (this.destroyed){
		if (this.onWater || this.onLava){
			this.doFloat();
		}else if (this.cameraHeight > 0.2){ 
			this.cameraHeight -= 0.01; 
		}
		return;
	}
	if (this.onLava){
		if (this.lavaCounter > 30){
			this.receiveDamage(80);
			this.lavaCounter = 0;
		} else {
			this.lavaCounter++;
		}
	} else {
		this.lavaCounter = 0;
	}
	if (this.attackWait > 0) this.attackWait -= 1;
	if (this.hurt > 0) this.hurt -= 1;
	if (this.launchAttackCounter > 0){
		this.launchAttackCounter--;
		if (this.launchAttackCounter == 0){
			var weapon = this.mapManager.game.inventory.getWeapon();
			if (!weapon || !weapon.ranged)
				this.meleeAttack(weapon);
		}
		
	}
	
	this.moved = false;
	this.step();
};

},{"./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Missile.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\PlayerStats.js":[function(require,module,exports){
function PlayerStats(){
	this._c = circular.register('PlayerStats');
	this.hp = 0;
	this.mHP = 0;
	this.mana = 0;
	this.mMana = 0;
	
	this.regenCount = 0;
	this.manaRegenFreq = 0;
	
	this.virtue = null;
	
	this.lvl = 1;
	this.exp = 0;
	
	this.poisoned = false;
	
	this.stats = {
		_c: circular.setSafe(),
		str: '0D0', 
		dfs: '0D0',
		dex: 0,
		magicPower: '0D0'
	};
}

module.exports = PlayerStats;
circular.registerClass('PlayerStats', PlayerStats);

PlayerStats.prototype.reset = function(){
	this.hp = 0;
	this.mHP = 0;
	this.mana = 0;
	this.mMana = 0;
	
	this.virtue = null;
	
	this.lvl = 1;
	this.exp = 0;
	
	this.stats = {
		_c: circular.setSafe(),
		str: '0D0',
		dfs: '0D0',
		dex: 0,
		magicPower: '0D0'
	};
};

PlayerStats.prototype.addExperience = function(amount, console){
	this.exp += amount;
	
	//console.addSFMessage(amount + " XP gained");
	var nextExp = (Math.pow(this.lvl, 1.5) * 500) << 0;
	if (this.exp >= nextExp){ this.levelUp(console); }
};

PlayerStats.prototype.levelUp = function(console){
	this.lvl += 1;
	
	// Upgrade HP and Mana
	var hpNew = Math.iRandom(10, 25);
	var manaNew = Math.iRandom(5, 15);
	
	var hpOld = this.mHP;
	var manaOld = this.mMana;
	
	this.hp  += hpNew;
	this.mana += manaNew;
	this.mHP += hpNew;
	this.mMana += manaNew;
	
	// Upgrade a random stat by 1-3 points
	/*
	var stats = ['str', 'dfs'];
	var names = ['Strength', 'Defense'];
	var st, nm;
	while (!st){
		var ind = Math.iRandom(stats.length);
		st = stats[ind];
		nm = names[ind];
	}
	
	var part1 = parseInt(this.stats[st].substring(0, this.stats[st].indexOf('D')), 10);
	part1 += Math.iRandom(1, 3);
	
	var old = this.stats[st];
	this.stats[st] = part1 + 'D3';*/
	
	console.addSFMessage("Level up: " + this.lvl + "!");
	console.addSFMessage("HP increased from " + hpOld + " to " + this.mHP);
	console.addSFMessage("Mana increased from " + manaOld + " to " + this.mMana);
	//console.addSFMessage(nm + " increased from " + old + " to " + this.stats[st]);
};

PlayerStats.prototype.setVirtue = function(virtueName){
	this.virtue = virtueName;
	this.lvl = 1;
	this.exp = 0;
	
	switch (virtueName){
		case "Honesty":
			this.hp = 600;
			this.mana = 200;
			this.stats.magicPower = 6;
			this.stats.str = '2';
			this.stats.dfs = '2';
			this.stats.dex = 0.8;
			this.className = 'Mage';
			this.manaRegenFreq = 30 * 5;
		break;
		
		case "Compassion":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 4;
			this.stats.str = '4';
			this.stats.dfs = '4';
			this.stats.dex = 0.9;
			this.className = 'Bard';
			this.manaRegenFreq = 30 * 7;
		break;
		
		case "Valor":
			this.hp = 800;
			this.mana = 0;
			this.stats.magicPower = 2;
			this.stats.str = '6';
			this.stats.dfs = '2';
			this.stats.dex = 0.9;
			this.className = 'Fighter';
			this.manaRegenFreq = 30 * 10;
		break;
		
		case "Honor":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 4;
			this.stats.str = '6';
			this.stats.dfs = '2';
			this.stats.dex = 0.9;
			this.className = 'Paladin';
			this.manaRegenFreq = 30 * 8;
		break;
		
		case "Spirituality":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 6;
			this.stats.str = '4';
			this.stats.dfs = '4';
			this.stats.dex = 0.95;
			this.className = 'Ranger';
			this.manaRegenFreq = 30 * 9;
		break;
		
		case "Humility":
			this.hp = 600;
			this.mana = 0;
			this.stats.magicPower = 2;
			this.stats.str = '2';
			this.stats.dfs = '2';
			this.stats.dex = 0.8;
			this.className = 'Shepherd';
			this.manaRegenFreq = 30 * 7;
		break;
		
		case "Sacrifice":
			this.hp = 800;
			this.mana = 50;
			this.stats.magicPower = 2;
			this.stats.str = '4';
			this.stats.dfs = '6';
			this.stats.dex = 0.95;
			this.className = 'Tinker';
			this.manaRegenFreq = 30 * 7;
		break;
		
		case "Justice":
			this.hp = 700;
			this.mana = 150;
			this.stats.magicPower = 4;
			this.stats.str = '2';
			this.stats.dfs = '2';
			this.stats.dex = 0.95;
			this.className = 'Druid';
			this.manaRegenFreq = 30 * 6;
		break;
	}
	
	this.mHP = this.hp;
	this.stats.str += 'D3';
	this.stats.dfs += 'D3';
	this.stats.magicPower += 'D3';
	this.mMana = this.mana;
};

PlayerStats.prototype.regenMana = function(){
	if (++this.regenCount >= this.manaRegenFreq){
		this.mana = Math.min(this.mana + 1, this.mMana);
		this.regenCount = 0;
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\SaveManager.js":[function(require,module,exports){
function SaveManager(game){
	this.game = game;
	this.storage = new Storage();
}

var Storage = require('./Storage');

SaveManager.prototype = {
	saveGame: function(){
		var saveObject = {
			_c: circular.register('StygianGame'),
			version: version, 
			player: this.game.player,
			inventory: this.game.inventory,
			maps: this.game.maps,
			floorDepth: this.game.floorDepth,
			uniqueRegistry: this.game.uniqueRegistry
		};
		var serialized = circular.serialize(saveObject);
		
		/*var serializedObject = JSON.parse(serialized);
		console.log(serializedObject);
		console.log("Size: "+serialized.length);*/
		
		this.storage.setItem('stygianGame', serialized);
	},
	restoreGame: function(game){
		var gameData = this.storage.getItem('stygianGame');
		if (!gameData){
			return false;
		}
		var deserialized = circular.parse(gameData, game);
		if (deserialized.version != version){
			return false;
		}
		game.player = deserialized.player;
		game.inventory = deserialized.inventory;
		game.maps = deserialized.maps;
		game.floorDepth = deserialized.floorDepth;
		game.uniqueRegistry = deserialized.uniqueRegistry;
		return true;
	},
	deleteGame: function(){
		this.storage.removeItem('stygianGame');
	}
}

module.exports = SaveManager;
},{"./Storage":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Storage.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\SelectClass.js":[function(require,module,exports){
function SelectClass(/*Game*/ game){
	this.game = game;
}

module.exports = SelectClass;

SelectClass.prototype.step = function(){
	var game = this.game;
	var playerS = game.player;
	if (game.getKeyPressed(13) || game.getMouseButtonPressed()){
		var mouse = game.mouse;
		
		if (game.mouse.b >= 28 && game.mouse.b < 100){
			if (game.mouse.a <= 88)
				playerS.setVirtue("Honesty");
			else if (game.mouse.a <= 178)
				playerS.setVirtue("Compassion");
			else if (game.mouse.a <= 268)
				playerS.setVirtue("Valor");
			else
				playerS.setVirtue("Justice");
		}else if (game.mouse.b >= 100 && game.mouse.b < 170){
			if (game.mouse.a <= 88)
				playerS.setVirtue("Sacrifice");
			else if (game.mouse.a <= 178)
				playerS.setVirtue("Honor");
			else if (game.mouse.a <= 268)
				playerS.setVirtue("Spirituality");
			else
				playerS.setVirtue("Humility");
		}
		
		if (playerS.virtue != null){
			game.createInitialInventory(playerS.className);
			game.printGreet();
			game.loadMap(false, 1);
		}
	}
};

SelectClass.prototype.loop = function(){
	this.step();
	
	var ui = this.game.getUI();
	ui.drawImage(this.game.images.selectClass, 0, 0);
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Stairs.js":[function(require,module,exports){
var ObjectFactory = require('./ObjectFactory');

circular.setTransient('Stairs', 'billboard');

circular.setReviver('Stairs', function(object, game){
	object.billboard = ObjectFactory.billboard(vec3(1.0, 1.0, 1.0), vec2(1.0, 1.0), game.GL.ctx);
	object.billboard.texBuffer = game.objectTex.stairs.buffers[object.imgInd];
	object.billboard.noRotate = true;
});

function Stairs(){
	this._c = circular.register("Stairs");
}

module.exports = Stairs;
circular.registerClass('Stairs', Stairs);

Stairs.prototype.init = function (position, mapManager, direction){
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

},{"./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Storage.js":[function(require,module,exports){
function Storage(){
	 try {
		 localStorage.setItem('__test', 'test');
		 localStorage.removeItem('__test');
		 this.enabled = true;
	 } catch(e) {
		 this.enabled = false;
	 }
};

module.exports = Storage;

Storage.prototype = {
	setItem: function(key, value){
		if (!this.enabled){
			return;
		}
		localStorage.setItem(key, value);
	},
	removeItem: function(key){
		if (!this.enabled){
			return;
		}
		localStorage.removeItem(key);
	},
	getItem: function(key){
		if (!this.enabled){
			return null;
		}
		return localStorage.getItem(key);
	}
}
 

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\TitleScreen.js":[function(require,module,exports){
var SelectClass = require('./SelectClass');

function TitleScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
	this.currentScreen = 0;
}

module.exports = TitleScreen;

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		if (this.currentScreen == 0){
			if (this.game.saveManager.restoreGame(this.game)){
				this.game.printWelcomeBack();
				this.game.loadMap(this.game.player.currentMap, this.game.player.currentDepth);
			} else {
				this.currentScreen++;
			}
		} else if (this.currentScreen == 4){
			this.game.scene = new SelectClass(this.game);
		} else {
			this.currentScreen++;
		}
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	switch (this.currentScreen){
	case 0:
		ui.drawImage(this.game.images.titleScreen, 0, 0);
		break;
	case 1:
		ui.drawImage(this.game.images.intro1, 0, 0);
		break;
	case 2:
		ui.drawImage(this.game.images.intro2, 0, 0);
		break;
	case 3:
		ui.drawImage(this.game.images.intro3, 0, 0);
		break;
	case 4:
		ui.drawImage(this.game.images.intro4, 0, 0);
		break;
	}
	
};

},{"./SelectClass":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\SelectClass.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\UI.js":[function(require,module,exports){
function UI(size, container){
	this.initCanvas(size, container);
}

module.exports = UI;

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
	this.ctx.imageSmoothingEnabled = false;
	
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

UI.prototype.drawSpriteExt = function(sprite, x, y, subImage, imageAngle){
	var xImg = subImage % sprite.imgNum;
	var yImg = (subImage / sprite.imgNum) << 0;
	
	this.ctx.save();
	this.ctx.translate(x+sprite.xOrig, y+sprite.yOrig);
	this.ctx.rotate(imageAngle);
	
	this.ctx.drawImage(sprite,
		xImg * sprite.imgWidth, yImg * sprite.imgHeight, sprite.imgWidth, sprite.imgHeight,
		-sprite.xOrig, -sprite.yOrig, sprite.imgWidth, sprite.imgHeight
		);
		
	this.ctx.restore();
};

UI.prototype.drawText = function(text, x, y, console){
	console.printText(x,y, text, this.ctx);
	/*var w = console.spaceChars;
	var h = console.spriteFont.height;
	for (var j=0,jlen=text.length;j<jlen;j++){
		var chara = text.charAt(j);
		var ind = console.listOfChars.indexOf(chara);
		if (ind != -1){
			this.ctx.drawImage(console.spriteFont,
				w * ind, 1, w, h - 1,
				x, y, w, h - 1);
		}
		x += w;
	}*/
};

UI.prototype.clear = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Underworld.js":[function(require,module,exports){
var AnimatedTexture = require('./AnimatedTexture');
var AudioAPI = require('./Audio');
var Console = require('./Console');
var Inventory = require('./Inventory');
var Item = require('./Item');
var ItemFactory = require('./ItemFactory');
var MapManager = require('./MapManager');
var Missile = require('./Missile');
var ObjectFactory = require('./ObjectFactory');
var PlayerStats = require('./PlayerStats');
var SaveManager = require('./SaveManager');
var TitleScreen = require('./TitleScreen');
var EndingScreen = require('./EndingScreen');
var UI = require('./UI');
var Utils = require('./Utils');
var WebGL = require('./WebGL');

/*=======================================================================
				 			Stygian Abyss
				
  By Camilo Ramírez (http://jucarave.com) and Slash (http://slashie.net)
			
					  			2015
========================================================================*/

function Underworld(){
	this.size = vec2(355, 200);
	
	this.GL = new WebGL(this.size, Utils.$$("divGame"));
	this.UI = new UI(this.size, Utils.$$("divGame"));
	this.audio = new AudioAPI();
	
	this.player = new PlayerStats();
	this.inventory = new Inventory(10);
	this.console = new Console(10, 10, 300, this);
	this.saveManager = new SaveManager(this);
	this.font = '10px "Courier"';
	
	this.grPack = 'img_hr/';
	
	this.scene = null;
	this.map = null;
	this.maps = [];
	this.keys = [];
	this.uniqueRegistry = {
		_c: circular.setSafe()
	};
	this.mouse = vec3(0.0, 0.0, 0);
	this.mouseMovement = {x: -10000, y: -10000};
	this.images = {};
	this.music = {};
	this.sounds = {};
	this.textures = {wall: [], floor: [], ceil: []};
	this.objectTex = {};
	this.models = {};
	this.setDropItem = false;
	this.paused = false;
	
	this.timeStop = 0;
	this.protection = 0;
	
	this.fps = (1000 / 30) << 0;
	this.lastT = 0;
	this.numberFrames = 0;
	this.firstFrame = Date.now();
	
	this.loadImages();
	this.loadMusic();
	this.loadTextures();
	
	this.create3DObjects();
	AnimatedTexture.init(this.GL.ctx);
}

Underworld.prototype.create3DObjects = function(){
	this.door = ObjectFactory.door(vec3(0.5,0.75,0.1), vec2(1.0,1.0), this.GL.ctx, false);
	this.doorW = ObjectFactory.doorWall(vec3(1.0,1.0,1.0), vec2(1.0,1.0), this.GL.ctx);
	this.doorC = ObjectFactory.cube(vec3(1.0,1.0,0.1), vec2(1.0,1.0), this.GL.ctx, true);
	
	this.billboard = ObjectFactory.billboard(vec3(1.0,1.0,0.0), vec2(1.0,1.0), this.GL.ctx);
	
	this.slope = ObjectFactory.slope(vec3(1.0,1.0,1.0), vec2(1.0, 1.0), this.GL.ctx);
};

Underworld.prototype.loadMusic = function(){
	this.sounds.step1 = this.audio.loadAudio(cp + "wav/step1.wav?version=" + version, false);
	this.sounds.step2 = this.audio.loadAudio(cp + "wav/step2.wav?version=" + version, false);
	this.sounds.hit = this.audio.loadAudio(cp + "wav/hit.wav?version=" + version, false);
	this.sounds.miss = this.audio.loadAudio(cp + "wav/miss.wav?version=" + version, false);
	this.sounds.block = this.audio.loadAudio(cp + "wav/block.wav?version=" + version, false);
	this.music.dungeon1 = this.audio.loadAudio(cp + "ogg/08_-_Ultima_4_-_C64_-_Dungeons.ogg?version=" + version, true);
};

Underworld.prototype.loadMusicPost = function(){
	this.music.dungeon2 = this.audio.loadAudio(cp + "ogg/02_-_Ultima_5_-_C64_-_Britannic_Lands.ogg?version=" + version, true);
	this.music.dungeon3 = this.audio.loadAudio(cp + "ogg/05_-_Ultima_3_-_C64_-_Combat.ogg?version=" + version, true);
	this.music.dungeon4 = this.audio.loadAudio(cp + "ogg/07_-_Ultima_3_-_C64_-_Exodus'_Castle.ogg?version=" + version, true);
	this.music.dungeon5 = this.audio.loadAudio(cp + "ogg/04_-_Ultima_5_-_C64_-_Engagement_and_Melee.ogg?version=" + version, true);
	this.music.dungeon6 = this.audio.loadAudio(cp + "ogg/03_-_Ultima_4_-_C64_-_Lord_British's_Castle.ogg?version=" + version, true);
	this.music.dungeon7 = this.audio.loadAudio(cp + "ogg/11_-_Ultima_5_-_C64_-_Worlds_Below.ogg?version=" + version, true);
	this.music.dungeon8 = this.audio.loadAudio(cp + "ogg/10_-_Ultima_5_-_C64_-_Halls_of_Doom.ogg?version=" + version, true);
	this.music.codexRoom = this.audio.loadAudio(cp + "ogg/07_-_Ultima_4_-_C64_-_Shrines.ogg?version=" + version, true);
};

Underworld.prototype.loadImages = function(){
	this.images.items_ui = this.GL.loadImage(cp + this.grPack + "itemsUI.png?version=" + version, false, 0, 0, {imgNum: 8, imgVNum: 8});
	this.images.spells_ui = this.GL.loadImage(cp + this.grPack + "spellsUI.png?version=" + version, false, 0, 0, {imgNum: 4, imgVNum: 4});
	this.images.titleScreen = this.GL.loadImage(cp + this.grPack + "titleScreen.png?version=" + version, false);
	
	this.images.intro1 = this.GL.loadImage(cp + this.grPack + "intro1.png?version=" + version, false);
	this.images.intro2 = this.GL.loadImage(cp + this.grPack + "intro2.png?version=" + version, false);
	this.images.intro3 = this.GL.loadImage(cp + this.grPack + "intro3.png?version=" + version, false);
	this.images.intro4 = this.GL.loadImage(cp + this.grPack + "intro4.png?version=" + version, false);
	
	this.images.endingScreen = this.GL.loadImage(cp + this.grPack + "ending.png?version=" + version, false);
	this.images.endingScreen2 = this.GL.loadImage(cp + this.grPack + "ending2.png?version=" + version, false);
	this.images.endingScreen3 = this.GL.loadImage(cp + this.grPack + "ending3.png?version=" + version, false);
	this.images.selectClass = this.GL.loadImage(cp + this.grPack + "selectClass.png?version=" + version, false);
	this.images.inventory = this.GL.loadImage(cp + this.grPack + "inventory.png?version=" + version, false, 0, 0, {imgNum: 1, imgVNum: 2});
	this.images.inventoryDrop = this.GL.loadImage(cp + this.grPack + "inventoryDrop.png?version=" + version, false, 0, 0, {imgNum: 1, imgVNum: 2});
	this.images.inventorySelected = this.GL.loadImage(cp + this.grPack + "inventory_selected.png?version=" + version, false);
	this.images.scrollFont = this.GL.loadImage(cp + this.grPack + "scrollFontWhite.png?version=" + version, false);
	this.images.restart = this.GL.loadImage(cp + this.grPack + "restart.png?version=" + version, false);
	this.images.paused = this.GL.loadImage(cp + this.grPack + "paused.png?version=" + version, false);
	this.images.viewportWeapons = this.GL.loadImage(cp + this.grPack + "viewportWeapons.png?version=" + version, false, 0, 0, {imgNum: 4, imgVNum: 4});
	this.images.compass = this.GL.loadImage(cp + this.grPack + "compassUI.png?version=" + version, false, 0, 0, {xOrig: 11, yOrig: 11, imgNum: 2, imgVNum: 1});
};

Underworld.prototype.loadTextures = function(){
	this.textures = {wall: [null], floor: [null], ceil: [null], water: [null]};
	
	// No Texture
	var noTex = this.GL.loadImage(cp + this.grPack + "noTexture.png?version=" + version, true, 1, true);
	this.textures.wall.push(noTex);
	this.textures.floor.push(noTex);
	this.textures.ceil.push(noTex);
	
	// Walls
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "texWall01.png?version=" + version, true, 1, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "texWall02.png?version=" + version, true, 2, true));
	
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall1.png?version=" + version, true, 3, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall2.png?version=" + version, true, 4, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall3.png?version=" + version, true, 5, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall4.png?version=" + version, true, 6, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall5.png?version=" + version, true, 7, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "roomWall6.png?version=" + version, true, 8, true));
	
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "cavernWall1.png?version=" + version, true, 9, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "cavernWall2.png?version=" + version, true, 10, true));
	this.textures.wall.push(this.GL.loadImage(cp + this.grPack + "cavernWall3.png?version=" + version, true, 11, true));
	
	// Floors
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "texFloor01.png?version=" + version, true, 1, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "texFloor02.png?version=" + version, true, 2, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "texFloor03.png?version=" + version, true, 3, true));
	
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "cavernFloor1.png?version=" + version, true, 4, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "cavernFloor2.png?version=" + version, true, 5, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "cavernFloor3.png?version=" + version, true, 6, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "cavernFloor4.png?version=" + version, true, 7, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "roomFloor1.png?version=" + version, true, 8, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "roomFloor2.png?version=" + version, true, 9, true));
	this.textures.floor.push(this.GL.loadImage(cp + this.grPack + "roomFloor3.png?version=" + version, true, 10, true));
	
	this.textures.floor[50] = (this.GL.loadImage(cp + this.grPack + "texHole.png?version=" + version, true, 50, true));
	
	// Liquids
	this.textures.water.push(this.GL.loadImage(cp + this.grPack + "texWater01.png?version=" + version, true, 1, true));
	this.textures.water.push(this.GL.loadImage(cp + this.grPack + "texWater02.png?version=" + version, true, 2, true));
	this.textures.water.push(this.GL.loadImage(cp + this.grPack + "texLava01.png?version=" + version, true, 3, true));
	this.textures.water.push(this.GL.loadImage(cp + this.grPack + "texLava02.png?version=" + version, true, 4, true));
	
	// Ceilings
	this.textures.ceil.push(this.GL.loadImage(cp + this.grPack + "texCeil01.png?version=" + version, true, 1, true));
	this.textures.ceil.push(this.GL.loadImage(cp + this.grPack + "cavernWall1.png?version=" + version, true, 2, true));
	this.textures.ceil[50] = (this.GL.loadImage(cp + this.grPack + "texHole.png?version=" + version, true, 50, true));
	
	// Items
	this.objectTex.items = this.GL.loadImage(cp + this.grPack + "texItems.png?version=" + version, true, 1, true);
	this.objectTex.items.buffers = AnimatedTexture.getTextureBufferCoords(8, 8, this.GL.ctx);
	this.objectTex.itemsMisc = this.GL.loadImage(cp + this.grPack + "texMisc.png?version=" + version, true, 1, true);
	this.objectTex.itemsMisc.buffers = AnimatedTexture.getTextureBufferCoords(8, 4, this.GL.ctx);
	
	this.objectTex.spells = this.GL.loadImage(cp + this.grPack + "texSpells.png?version=" + version, true, 1, true);
	this.objectTex.spells.buffers = AnimatedTexture.getTextureBufferCoords(4, 4, this.GL.ctx);
	
	// Magic Bolts
	this.objectTex.bolts = this.GL.loadImage(cp + this.grPack + "texBolts.png?version=" + version, true, 1, true);
	this.objectTex.bolts.buffers = AnimatedTexture.getTextureBufferCoords(4, 2, this.GL.ctx);
	
	// Stairs
	this.objectTex.stairs = this.GL.loadImage(cp + this.grPack + "texStairs.png?version=" + version, true, 1, true);
	this.objectTex.stairs.buffers = AnimatedTexture.getTextureBufferCoords(2, 2, this.GL.ctx);
	
	// Enemies
	this.objectTex.bat_run = this.GL.loadImage(cp + this.grPack + "enemies/texBatRun.png?version=" + version, true, 1, true);
	this.objectTex.rat_run = this.GL.loadImage(cp + this.grPack + "enemies/texRatRun.png?version=" + version, true, 2, true);
	this.objectTex.spider_run = this.GL.loadImage(cp + this.grPack + "enemies/texSpiderRun.png?version=" + version, true, 3, true);
	this.objectTex.troll_run = this.GL.loadImage(cp + this.grPack + "enemies/texTrollRun.png?version=" + version, true, 4, true);
	this.objectTex.gazer_run = this.GL.loadImage(cp + this.grPack + "enemies/texGazerRun.png?version=" + version, true, 5, true);
	this.objectTex.ghost_run = this.GL.loadImage(cp + this.grPack + "enemies/texGhostRun.png?version=" + version, true, 6, true);
	this.objectTex.headless_run = this.GL.loadImage(cp + this.grPack + "enemies/texHeadlessRun.png?version=" + version, true, 7, true);
	this.objectTex.orc_run = this.GL.loadImage(cp + this.grPack + "enemies/texOrcRun.png?version=" + version, true, 8, true);
	this.objectTex.reaper_run = this.GL.loadImage(cp + this.grPack + "enemies/texReaperRun.png?version=" + version, true, 9, true);
	this.objectTex.skeleton_run = this.GL.loadImage(cp + this.grPack + "enemies/texSkeletonRun.png?version=" + version, true, 10, true);
	
	this.objectTex.daemon_run = this.GL.loadImage(cp + this.grPack + "enemies/texDaemonRun.png?version=" + version, true, 10, true);
	this.objectTex.mongbat_run = this.GL.loadImage(cp + this.grPack + "enemies/texMongbatRun.png?version=" + version, true, 10, true);
	this.objectTex.hydra_run = this.GL.loadImage(cp + this.grPack + "enemies/texHydraRun.png?version=" + version, true, 10, true);
	this.objectTex.seaSerpent_run = this.GL.loadImage(cp + this.grPack + "enemies/texSeaSerpentRun.png?version=" + version, true, 10, true);
	this.objectTex.octopus_run = this.GL.loadImage(cp + this.grPack + "enemies/texOctopusRun.png?version=" + version, true, 10, true);
	this.objectTex.balron_run = this.GL.loadImage(cp + this.grPack + "enemies/texBalronRun.png?version=" + version, true, 10, true);
	this.objectTex.liche_run = this.GL.loadImage(cp + this.grPack + "enemies/texLicheRun.png?version=" + version, true, 10, true);
	this.objectTex.ghost_run = this.GL.loadImage(cp + this.grPack + "enemies/texGhostRun.png?version=" + version, true, 10, true);
	this.objectTex.gremlin_run = this.GL.loadImage(cp + this.grPack + "enemies/texGremlinRun.png?version=" + version, true, 10, true);
	this.objectTex.dragon_run = this.GL.loadImage(cp + this.grPack + "enemies/texDragonRun.png?version=" + version, true, 10, true);
	this.objectTex.zorn_run = this.GL.loadImage(cp + this.grPack + "enemies/texZornRun.png?version=" + version, true, 10, true);
	
	this.objectTex.wisp_run = this.GL.loadImage(cp + this.grPack + "enemies/texWispRun.png?version=" + version, true, 10, true);
	this.objectTex.mage_run = this.GL.loadImage(cp + this.grPack + "enemies/texMageRun.png?version=" + version, true, 10, true);
	this.objectTex.ranger_run = this.GL.loadImage(cp + this.grPack + "enemies/texRangerRun.png?version=" + version, true, 10, true);
	this.objectTex.fighter_run = this.GL.loadImage(cp + this.grPack + "enemies/texFighterRun.png?version=" + version, true, 10, true);
	this.objectTex.bard_run = this.GL.loadImage(cp + this.grPack + "enemies/texBardRun.png?version=" + version, true, 10, true);
	this.objectTex.lavaLizard_run = this.GL.loadImage(cp + this.grPack + "enemies/texLavaLizardRun.png?version=" + version, true, 10, true);
};

Underworld.prototype.postLoading = function(){
	this.console.createSpriteFont(this.images.scrollFont, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?,./", 7);
	this.loadMusicPost();
};

Underworld.prototype.stopMusic = function(){
	this.audio.stopMusic();
};

Underworld.prototype.playMusic = function(musicCode, loop){
	var audioF = this.music[musicCode];
	if (!audioF) return null;
	this.stopMusic();
	this.audio.playSound(audioF, loop, true, 0.2);
};

Underworld.prototype.playSound = function(soundCode){
	var audioF = this.sounds[soundCode];
	if (!audioF) return null;
	this.audio.playSound(audioF, false, false, 0.3);
};

Underworld.prototype.getUI = function(){
	return this.UI.ctx;
};

Underworld.prototype.getTextureById = function(textureId, type){
	if (!this.textures[type][textureId]) textureId = 1;
	
	return this.textures[type][textureId];
};

Underworld.prototype.getObjectTexture = function(textureCode){
	if (!this.objectTex[textureCode]) throw "Invalid texture code: " + textureCode;
	
	return this.objectTex[textureCode];
};

Underworld.prototype.loadMap = function(map, depth){
	var game = this;
	if (depth === undefined || !game.maps[depth - 1]){
		game.map = new MapManager();
		game.map.init(game, map, depth);
		game.floorDepth = depth;
		game.maps.push(game.map);
	}else if (game.maps[depth - 1]){
		game.map = game.maps[depth - 1];
	}
	game.scene = null;
	if (depth)
		game.playMusic('dungeon'+depth, true);
	else if (map === 'codexRoom')
		game.playMusic('codexRoom', true);
	game.player.currentMap = map;
	game.player.currentDepth = depth;
};

Underworld.prototype.printGreet = function(){
};

Underworld.prototype.printWelcomeBack = function(){
};

Underworld.prototype.newGame = function(){
	this.inventory.reset();
	this.player.reset();
	
	this.maps = [];
	this.map = null;
	this.scene = null;
	this.console.messages = [];	
	this.scene = new TitleScreen(this);
	this.loop();
};

Underworld.prototype.ending = function(){
	this.inventory.reset();
	this.player.reset();
	this.maps = [];
	this.map = null;
	this.scene = null;
	this.console.messages = [];	
	this.scene = new EndingScreen(this);
	this.loop();
};

Underworld.prototype.loadGame = function(){
	var game = this;
	
	if (game.GL.areImagesReady() && game.audio.areSoundsReady()){
		game.postLoading();
		game.newGame();
	}else{
		requestAnimFrame(function(){ game.loadGame(); });
	}
};

Underworld.prototype.addItem = function(item){
	return this.inventory.addItem(item);
};

Underworld.prototype.drawObject = function(object, texture){
	var camera = this.map.player;
	
	this.GL.drawObject(object, camera, texture);
};

Underworld.prototype.drawBlock = function(blockObject, texId){
	var camera = this.map.player;
	
	this.GL.drawObject(blockObject, camera, this.getTextureById(texId, "wall").texture);
};

Underworld.prototype.drawDoorWall = function(x, y, z, texId, vertical){
	var game = this;
	var camera = game.map.player;
	
	game.doorW.position.set(x, y, z);
	if (vertical) game.doorW.rotation.set(0,Math.PI_2,0); else game.doorW.rotation.set(0,0,0);
	game.GL.drawObject(game.doorW, camera, game.getTextureById(texId, "wall").texture);
};

Underworld.prototype.drawDoorCube = function(x, y, z, texId, vertical){
	var game = this;
	var camera = game.map.player;
	
	game.doorC.position.set(x, y, z);
	if (vertical) game.doorC.rotation.set(0,Math.PI_2,0); else game.doorC.rotation.set(0,0,0);
	game.GL.drawObject(game.doorC, camera, game.getTextureById(texId, "wall").texture);
};

Underworld.prototype.drawDoor = function(x, y, z, rotation, texId){
	var game = this;
	var camera = game.map.player;
	
	game.door.position.set(x, y, z);
	game.door.rotation.b = rotation;
	game.GL.drawObject(game.door, camera, game.objectTex[texId].texture);
};

Underworld.prototype.drawFloor = function(floorObject, texId, typeOf){
	var game = this;
	var camera = game.map.player;
	
	var ft = typeOf;
	game.GL.drawObject(floorObject, camera, game.getTextureById(texId, ft).texture);
};

Underworld.prototype.drawBillboard = function(position, texId, billboard){
	var game = this;
	var camera = game.map.player;
	if (!billboard) billboard = game.billboard;
	
	billboard.position.set(position);
	game.GL.drawObject(billboard, camera, game.objectTex[texId].texture);
};

Underworld.prototype.drawSlope = function(slopeObject, texId){
	var game = this;
	var camera = game.map.player;
	
	game.GL.drawObject(slopeObject, camera, game.getTextureById(texId, "floor").texture);
};

Underworld.prototype.drawUI = function(){
	var game = this;
	var player = game.map.player;
	var ps = this.player;
	if (!player) return;
	
	var ctx = game.UI.ctx;
	
	// Draw health bar
	var hp = ps.hp / ps.mHP;
	ctx.fillStyle = (ps.poisoned)? "rgb(122,0,122)" : "rgb(122,0,0)";
	ctx.fillRect(8,8,75,4);
	ctx.fillStyle = (ps.poisoned)? "rgb(200,0,200)" : "rgb(200,0,0)";
	ctx.fillRect(8,8,(75 * hp) << 0,4);
	
	// Draw mana
	var mana = ps.mana / ps.mMana;
	ctx.fillStyle = "rgb(181,98,20)";
	ctx.fillRect(8,16,60,2);
	ctx.fillStyle = "rgb(255,138,28)";
	ctx.fillRect(8,16,(60 * mana) << 0,2);
	
	// Draw Inventory
	if (this.setDropItem)
		this.UI.drawSprite(this.images.inventoryDrop, 90, 6, 0);
	else
		this.UI.drawSprite(this.images.inventory, 90, 6, 0);
	
	for (var i=0,len=this.inventory.items.length;i<len;i++){
		var item = this.inventory.items[i];
		var spr = item.tex + '_ui';

		if (!this.setDropItem && (item.type == 'weapon' || item.type == 'armour') && item.equipped)
			this.UI.drawSprite(this.images.inventorySelected, 90 + (22 * i), 6, 0);		
		this.UI.drawSprite(this.images[spr], 93 + (22 * i), 9, item.subImg);
	}
	this.UI.drawSprite(this.images.inventory, 90, 6, 1);
	
	// If the player is hurt draw a red screen
	if (player.hurt > 0.0){
		ctx.fillStyle = "rgba(255,0,0,0.5)";
		ctx.fillRect(0,0,ctx.width,ctx.height);
	}else if (this.protection > 0.0){	// If the player has protection then draw it slightly blue
		ctx.fillStyle = "rgba(40,40,255,0.2)";
		ctx.fillRect(0,0,ctx.width,ctx.height);
	}
	
	if (player.destroyed){
		this.UI.drawSprite(this.images.restart, 85, 94, 0);
	}else if (this.paused){
		this.UI.drawSprite(this.images.paused, 147, 94, 0);
	}
	this.UI.drawText('Depth '+this.floorDepth, 10,25,this.console);
	this.UI.drawText('Level ' + ps.lvl+' '+this.player.className, 10,33,this.console);
	this.UI.drawText('HP: '+ps.hp, 10,9,this.console);
	this.UI.drawText('Mana:'+ps.mana, 10,17,this.console);

	// Draw the compass
	this.UI.drawSprite(this.images.compass, 320, 12, 0);
	this.UI.drawSpriteExt(this.images.compass, 320, 12, 1, Math.PI + this.map.player.rotation.b);

	var weapon = this.inventory.getWeapon();
	if (weapon && weapon.viewPortImg >= 0)
		this.UI.drawSprite(this.images.viewportWeapons, 160, 130 + this.map.player.launchAttackCounter * 2 - this.map.player.attackWait * 1.5, weapon.viewPortImg);
	game.console.render(8, 120);
};

Underworld.prototype.addExperience = function(expPoints){
	this.player.addExperience(expPoints, this.console);
};

Underworld.prototype.createInitialInventory = function(className){
	this.inventory.items = [];
	
	var item = ItemFactory.getItemByCode('mysticSword', 1.0);
	item.equipped = true;
	this.inventory.items.push(item);
	
	var item = ItemFactory.getItemByCode('mystic', 1.0);
	item.equipped = true;
	this.inventory.items.push(item);
	switch (className){
	case 'Mage':
		this.inventory.items.push(ItemFactory.getItemByCode('heal'));
		this.inventory.items.push(ItemFactory.getItemByCode('heal'));
		this.inventory.items.push(ItemFactory.getItemByCode('heal'));
		this.inventory.items.push(ItemFactory.getItemByCode('missile'));
		this.inventory.items.push(ItemFactory.getItemByCode('missile'));
		this.inventory.items.push(ItemFactory.getItemByCode('missile'));
		break;
	case 'Druid':
		this.inventory.items.push(ItemFactory.getItemByCode('heal'));
	case 'Bard': case 'Paladin': case 'Ranger':
		this.inventory.items.push(ItemFactory.getItemByCode('heal'));
		this.inventory.items.push(ItemFactory.getItemByCode('light'));
		this.inventory.items.push(ItemFactory.getItemByCode('missile'));
		break;
	}
	switch (className){
	case 'Bard':
		this.inventory.items.push(ItemFactory.getItemByCode('yellowPotion'));
	case 'Tinker':
		this.inventory.items.push(ItemFactory.getItemByCode('yellowPotion'));
	default:
		this.inventory.items.push(ItemFactory.getItemByCode('yellowPotion'));
		this.inventory.items.push(ItemFactory.getItemByCode('redPotion'));
		break;
	}
	switch (className){
	case 'Druid': case 'Ranger':
		this.inventory.items.push(ItemFactory.getItemByCode('bowMagic', 0.6));
		break;
	case 'Bard': case 'Tinker':
		this.inventory.items.push(ItemFactory.getItemByCode('slingEttin', 0.7));
		break;
		
	}
	
	
	
};

Underworld.prototype.useItem = function(index){
	var item = this.inventory.items[index];
	var ps = this.player;
	var p = this.map.player;
	p.moved = true;
	switch (item.code){
		case 'redPotion':
			if (this.player.poisoned){
				this.player.poisoned = false;
				this.console.addSFMessage("The garlic potion cures you.");
			}else{
				this.console.addSFMessage("Nothing happens");
			}
		break;
		
		case 'yellowPotion':
			var heal = 100;
			this.player.hp = Math.min(this.player.hp + heal, this.player.mHP);
			this.console.addSFMessage("The ginseng potion heals you for "+heal + " points.");
		break;
	}
	this.inventory.dropItem(index);
};

Underworld.prototype.activeSpell = function(index){
	var item = this.inventory.items[index];
	var ps = this.player;
	var p = this.map.player;
	p.moved = true;
	
	if (ps.mana < item.mana){
		this.console.addSFMessage("Not enough mana");
		return;
	}
	
	ps.mana = Math.max(ps.mana - item.mana, 0);
	
	switch (item.code){
		case 'cure':
			if (this.player.poisoned){
				this.player.poisoned = false;
				this.console.addSFMessage("AN NOX!");
				this.console.addSFMessage("You are cured.");
			}else{
				this.console.addSFMessage("AN NOX...");
				this.console.addSFMessage("Nothing happens");
			}
		break;
		
		case 'redPotion':
			if (this.player.poisoned){
				this.player.poisoned = false;
				this.console.addSFMessage("The garlic potion cures you.");
			}else{
				this.console.addSFMessage("Nothing happens");
			}
		break;
		
		case 'heal':
			var heal = (this.player.mHP * item.percent) << 0;
			this.player.hp = Math.min(this.player.hp + heal, this.player.mHP);
			this.console.addSFMessage("MANI! "+heal + " points healed");
		break;
		
		case 'yellowPotion':
			var heal = 100;
			this.player.hp = Math.min(this.player.hp + heal, this.player.mHP);
			this.console.addSFMessage("The ginseng potion heals you for "+heal + " points.");
		break;
		
		case 'light':
			if (this.GL.light > 0){
				this.console.addSFMessage("The spell fizzles!");
			}else{
				this.GL.light = item.lightTime;
				this.console.addSFMessage("IN LOR!");
			}
		break;
		
		case 'missile':
			var str = Utils.rollDice(ps.stats.magicPower) + Utils.rollDice(item.str);
			
			var missile = new Missile();
			missile.init(p.position.clone(), p.rotation.clone(), 'magicMissile', 'enemy', this.map);
			missile.str = str << 0;
			
			this.map.addMessage("GRAV POR!");
			this.map.instances.push(missile);
			
			p.attackWait = 30;
		break;
		
		case 'iceball':
			var str = Utils.rollDice(ps.stats.magicPower) + Utils.rollDice(item.str);
			
			var missile = new Missile();
			missile.init(p.position.clone(), p.rotation.clone(), 'iceBall', 'enemy', this.map);
			missile.str = str << 0;
			
			this.map.addMessage("VAS FRIO!");
			this.map.instances.push(missile);
			
			p.attackWait = 30;
		break;
		
		case 'repel':
		break;
		
		case 'blink':
			var lastPos = null;
			var ported = false;
			var pos = this.map.player.position.clone();
			var dir = this.map.player.rotation;
			
			var dx = Math.cos(dir.b);
			var dz = -Math.sin(dir.b);
			
			for (var i=0;i<15;i++){
				pos.a += dx;
				pos.c += dz;
				
				var cx = pos.a << 0;
				var cy = pos.c << 0;
				if (this.map.isSolid(cx, cy)){
					if (lastPos){
						this.console.addSFMessage("IN POR!");
						lastPos.sum(vec3(0.5,0,0.5));
						var ported = true;
						p.position = lastPos;
					}else{
						this.console.addSFMessage("The spell fizzles!");
					}
					
					i = 15;
				}else{
					if (!this.map.isWaterPosition(cx, cy)){
						var ins = this.map.getInstanceAtGrid(pos);
						if (!ins){
							lastPos = vec3(cx, pos.b, cy);
						}
					}
				}
			}
			
			if (!ported){
				if (lastPos){
					this.console.addSFMessage("IN POR!");
					lastPos.sum(vec3(0.5,0,0.5));
					p.position = lastPos;
				}else{
					this.console.addSFMessage("The spell fizzles!");
				}
			}
		break;
		
		case 'fireball':
			var str = Utils.rollDice(ps.stats.magicPower) + Utils.rollDice(item.str);
			
			var missile = new Missile();
			missile.init(p.position.clone(), p.rotation.clone(), 'fireBall', 'enemy', this.map);
			missile.str = str << 0;
			
			this.map.addMessage("VAS FLAM!");
			this.map.instances.push(missile);
			
			p.attackWait = 30;
		break;
		
		case 'protection':
			if (this.protection > 0){
				this.console.addSFMessage("The spell fizzles!");
			}else{
				this.protection = item.protTime;
				this.console.addSFMessage("IN SANCT!");
			}
		break;
		
		case 'time':
			if (this.timeStop > 0){
				this.console.addSFMessage("The spell fizzles!");
			}else{
				this.timeStop = item.stopTime;
				this.console.addSFMessage("REL TYM!");
			}
		break;
		
		case 'sleep':
			this.console.addSFMessage("IN ZU!");
			var instances = this.map.getInstancesNearest(p.position, 6, 'enemy');
			for (var i=0,len=instances.length;i<len;i++){
				instances[i].sleep = item.sleepTime;
			}
		break;
		
		case 'jinx':
		break;
		
		case 'tremor':
		break;
		
		case 'kill':
			var str = Utils.rollDice(ps.stats.magicPower) + Utils.rollDice(item.str);
			
			var missile = new Missile();
			missile.init(p.position.clone(), p.rotation.clone(), 'kill', 'enemy', this.map);
			missile.str = str << 0;
			
			this.map.addMessage("XEN CORP!");
			this.map.instances.push(missile);
			
			p.attackWait = 30;
		break;
	}
	this.inventory.dropItem(index);
};

Underworld.prototype.dropItem = function(i){
	var item = this.inventory.items[i];
	var player = this.map.player;
	var cleanPos = this.map.getNearestCleanItemTile(player.position.a, player.position.c);
	if (!cleanPos){
		this.console.addSFMessage('Cannot drop it here');
		this.setDropItem = false;
	}else{
		this.console.addSFMessage(item.name + ' dropped');
		cleanPos.a += 0.5;
		cleanPos.c += 0.5;
		
		var nIt = new Item();
		nIt.init(cleanPos, null, this.map);
		nIt.setItem(item);
		this.map.instances.push(nIt);
		
		this.inventory.dropItem(i);
		this.setDropItem = false;
	}
};

Underworld.prototype.checkInvControl = function(){
	var player = this.map.player;
	var ps = this.player;
	
	if (player && player.destroyed){
		if (this.getKeyPressed(82)){
			document.exitPointerLock();
			this.newGame();
		}
	}
	
	if (!player || player.destroyed) return;
	
	if (this.getKeyPressed(80)){
		this.paused = !this.paused;
	}
	
	if (this.paused) return;
	if (this.getKeyPressed(84)){
		if (!this.setDropItem){
			this.console.addSFMessage('Select the item to drop');
			this.setDropItem = true;
		}else if (this.setDropItem){
			this.setDropItem = false;
		}
	}
	
	for (var i=0;i<10;i++){
		var index = 49 + i;
		if (i == 9)
			index = 48;
		if (this.getKeyPressed(index)){
			var item = this.inventory.items[i];
			if (!item){
				if (this.setDropItem){
					this.console.addSFMessage('No item');
					this.setDropItem = false;
				}
				continue;
			}
			
			if (this.setDropItem){
				this.dropItem(i);
				continue;
			}
			
			if (item.type == 'weapon' && !item.equipped){
				this.console.addSFMessage(item.name + ' wielded');
				this.inventory.equipItem(i);
			}else if (item.type == 'armour' && !item.equipped){
				this.console.addSFMessage(item.name + ' worn');
				this.inventory.equipItem(i);
			}else if (item.type == 'magic'){
				this.activeSpell(i);
			}else if (item.type == 'potion'){
				this.useItem(i);
			}
		}
	} 
	
	return;
	
	if (ps.potions > 0){
		if (ps.hp == ps.mHP){
			this.console.addSFMessage("Health is already at max");
			return;
		}
		
		ps.potions -= 1;
		ps.hp = Math.min(ps.mHP, ps.hp + 5);
		this.console.addSFMessage("Potion used");
	}else{
		this.console.addSFMessage("No more potions left.");
	}
};

Underworld.prototype.globalLoop = function(){
	if (this.protection > 0){ this.protection -= 1; }
	if (this.timeStop > 0){ this.timeStop -= 1; }
	if (this.GL.light > 0){ this.GL.light -= 1; }
	
	this.player.regenMana();
};

Underworld.prototype.loop = function(){
	var game = this;
	
	var now = Date.now();
	var dT = (now - game.lastT);
	
	// Limit the game to the base speed of the game
	if (dT > game.fps){
		game.lastT = now - (dT % game.fps);
		
		if (!game.GL.active){
			requestAnimFrame(function(){ game.loop(); }); 
			return;
		}
		
		if (this.map != null){
			var gl = game.GL.ctx;
			
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			game.UI.clear();
			
			game.globalLoop();
			game.checkInvControl();
			game.map.loop();
			
			if (this.map)
				game.drawUI();
		}
		
		if (this.scene != null){
			game.scene.loop();
		}
	}
	
	requestAnimFrame(function(){ game.loop(); });
};

Underworld.prototype.getKeyPressed = function(keyCode){
	if (this.keys[keyCode] == 1){
		this.keys[keyCode] = 2;
		return true;
	}
	
	return false;
};

Underworld.prototype.getMouseButtonPressed = function(){
	if (this.mouse.c == 1){
		this.mouse.c = 2;
		return true;
	}
	
	return false;
};

Underworld.prototype.getMouseMovement = function(){
	var ret = {x: this.mouseMovement.x, y: this.mouseMovement.y};
	this.mouseMovement = {x: -10000, y: -10000};
	
	return ret;
};

Utils.addEvent(window, "load", function(){
	var game = new Underworld();
	game.loadGame();
	
	Utils.addEvent(document, "keydown", function(e){
		if (window.event) e = window.event;
		
		if (e.keyCode == 8){
			e.preventDefault();
			e.cancelBubble = true;
		}
		
		if (game.keys[e.keyCode] == 2) return;
		game.keys[e.keyCode] = 1;
	});
	
	Utils.addEvent(document, "keyup", function(e){
		if (window.event) e = window.event;
		
		if (e.keyCode == 8){
			e.preventDefault();
			e.cancelBubble = true;
		}
		
		game.keys[e.keyCode] = 0;
	});
	
	var canvas = game.UI.canvas;
	Utils.addEvent(canvas, "mousedown", function(e){
		if (window.event) e = window.event;
		
		if (game.map != null)
			canvas.requestPointerLock();
		
		game.mouse.a = Math.round((e.clientX - canvas.offsetLeft) / game.UI.scale);
		game.mouse.b = Math.round((e.clientY - canvas.offsetTop) / game.UI.scale);
		
		if (game.mouse.c == 2) return;
		game.mouse.c = 1;
	});
	
	Utils.addEvent(canvas, "mouseup", function(e){
		if (window.event) e = window.event;
		
		game.mouse.a = Math.round((e.clientX - canvas.offsetLeft) / game.UI.scale);
		game.mouse.b = Math.round((e.clientY - canvas.offsetTop) / game.UI.scale);
		game.mouse.c = 0;
	});
	
	Utils.addEvent(canvas, "mousemove", function(e){
		if (window.event) e = window.event;
		
		game.mouse.a = Math.round((e.clientX - canvas.offsetLeft) / game.UI.scale);
		game.mouse.b = Math.round((e.clientY - canvas.offsetTop) / game.UI.scale);
	});
	
	Utils.addEvent(window, "focus", function(){
		game.firstFrame = Date.now();
		game.numberFrames = 0;
	});
	
	Utils.addEvent(window, "resize", function(){
		var scale = Utils.$$("divGame").offsetHeight / game.size.b;
		var canvas = game.GL.canvas;
		
		canvas = game.UI.canvas;
		game.UI.scale = canvas.offsetHeight / canvas.height;
	});
	
	var moveCallback = function(e){
		game.mouseMovement.x = e.movementX ||
						e.mozMovementX ||
						e.webkitMovementX ||
						0;
						
		game.mouseMovement.y = e.movementY ||
						e.mozMovementY ||
						e.webkitMovementY ||
						0;
	};
	
	var pointerlockchange = function(e){
		if (document.pointerLockElement === canvas ||
			document.mozPointerLockElement === canvas ||
			document.webkitPointerLockElement === canvas){
				
			Utils.addEvent(document, "mousemove", moveCallback);
		}else{
			document.removeEventListener("mousemove", moveCallback);
			game.mouseMovement = {x: -10000, y: -10000};
		}
	};
	
	Utils.addEvent(document, "pointerlockchange", pointerlockchange);
	Utils.addEvent(document, "mozpointerlockchange", pointerlockchange);
	Utils.addEvent(document, "webkitpointerlockchange", pointerlockchange);
	
	Utils.addEvent(window, "blur", function(e){ game.GL.active = false; game.audio.pauseMusic();  });
	Utils.addEvent(window, "focus", function(e){ game.GL.active = true; game.audio.restoreMusic(); });
});

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\AnimatedTexture.js","./Audio":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Audio.js","./Console":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Console.js","./EndingScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\EndingScreen.js","./Inventory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Inventory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ItemFactory.js","./MapManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\MapManager.js","./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Missile.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./PlayerStats":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\PlayerStats.js","./SaveManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\SaveManager.js","./TitleScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\TitleScreen.js","./UI":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\UI.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js","./WebGL":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\WebGL.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js":[function(require,module,exports){
module.exports = {
	addEvent: function (obj, type, func){
		if (obj.addEventListener){
			obj.addEventListener(type, func, false);
		}else if (obj.attachEvent){
			obj.attachEvent("on" + type, func);
		}
	},
	$$: function(objId){
		var elem = document.getElementById(objId);
		if (!elem) alert("Couldn't find element: " + objId);
		return elem;
	},
	getHttp: function(){
		var http;
		if  (window.XMLHttpRequest){
			http = new XMLHttpRequest();
		}else if (window.ActiveXObject){
			http = new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		
		return http;
	},
	rollDice: function (param){
		var a = parseInt(param.substring(0, param.indexOf('D')), 10);
		var b = parseInt(param.substring(param.indexOf('D') + 1), 10);
		var roll1 = Math.round(Math.random() * b);
		var roll2 = Math.round(Math.random() * b);
		return Math.ceil(a * (roll1+roll2)/2);
	}
}
	
// Math prototype overrides	
Math.radRelation = Math.PI / 180;
Math.degRelation = 180 / Math.PI;
Math.degToRad = function(degrees){
	return degrees * this.radRelation;
};
Math.radToDeg = function(radians){
	return ((radians * this.degRelation) + 720) % 360;
};
Math.iRandom = function(a, b){
	if (b === undefined){
		b = a;
		a = 0;
	}
	
	return a + Math.round(Math.random() * (b - a));
};

Math.getAngle = function(/*Vec2*/ a, /*Vec2*/ b){
	var xx = Math.abs(a.a - b.a);
	var yy = Math.abs(a.c - b.c);
	
	var ang = Math.atan2(yy, xx);
	
	// Adjust the angle according to both positions
	if (b.a <= a.a && b.c <= a.c){
		ang = Math.PI - ang;
	}else if (b.a <= a.a && b.c > a.c){
		ang = Math.PI + ang;
	}else if (b.a > a.a && b.c > a.c){
		ang = Math.PI2 - ang;
	}
	
	ang = (ang + Math.PI2) % Math.PI2;
	
	return ang;
};

Math.PI_2 = Math.PI / 2;
Math.PI2 = Math.PI * 2;
Math.PI3_2 = Math.PI * 3 / 2;

// Crossbrowser animation/audio overrides

window.requestAnimFrame = 
	window.requestAnimationFrame       || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame    || 
	window.oRequestAnimationFrame      || 
	window.msRequestAnimationFrame     || 
	function(/* function */ draw1){
		window.setTimeout(draw1, 1000 / 30);
	};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\WebGL.js":[function(require,module,exports){
var Matrix = require('./Matrix');
var Utils = require('./Utils');

function WebGL(size, container){
	if (!this.initCanvas(size, container)) return null; 
	this.initProperties();
	this.processShaders();
	
	this.images = [];
	
	this.active = true;
	this.light = 0;
}

module.exports = WebGL;

WebGL.prototype.initCanvas = function(size, container){
	var scale = Utils.$$("divGame").offsetHeight / size.b;
	
	var canvas = document.createElement("canvas");
	canvas.width = size.a;
	canvas.height = size.b;
	canvas.style.position = "absolute";
	canvas.style.top = "0px";
	canvas.style.height = "100%";
	
	if (!canvas.getContext("experimental-webgl")){
		alert("Your browser doesn't support WebGL");
		return false;
	}
	
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("experimental-webgl");
	container.appendChild(this.canvas);
	
	return true;
};

WebGL.prototype.initProperties = function(){
	var gl = this.ctx;
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	
	gl.enable(gl.CULL_FACE);
	
	gl.enable( gl.BLEND );
	gl.blendEquation( gl.FUNC_ADD );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	
	this.aspectRatio = this.canvas.width / this.canvas.height;
	this.perspectiveMatrix = Matrix.makePerspective(45, this.aspectRatio, 0.002, 5.0);
};

WebGL.prototype.processShaders = function(){
	var gl = this.ctx;
	
	// Compile fragment shader
	var elShader = Utils.$$("fragmentShader");
	var code = this.getShaderCode(elShader);
	var fShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fShader, code);
	gl.compileShader(fShader);
	
	// Compile vertex shader
	elShader = Utils.$$("vertexShader");
	code = this.getShaderCode(elShader);
	var vShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vShader, code);
	gl.compileShader(vShader);
	
	// Create the shader program
	this.shaderProgram = gl.createProgram();
	gl.attachShader(this.shaderProgram, fShader);
	gl.attachShader(this.shaderProgram, vShader);
	gl.linkProgram(this.shaderProgram);
	
	if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
		alert("Error initializing the shader program");
		return;
	}
  
	gl.useProgram(this.shaderProgram);
	
	// Get attribute locations
	this.aVertexPosition = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
	this.aTextureCoord = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	this.aVertexIsDark = gl.getAttribLocation(this.shaderProgram, "aVertexIsDark");
	
	// Enable attributes
	gl.enableVertexAttribArray(this.aVertexPosition);
	gl.enableVertexAttribArray(this.aTextureCoord);
	gl.enableVertexAttribArray(this.aVertexIsDark);
	
	// Get the uniform locations
	this.uSampler = gl.getUniformLocation(this.shaderProgram, "uSampler");
	this.uTransformationMatrix = gl.getUniformLocation(this.shaderProgram, "uTransformationMatrix");
	this.uPerspectiveMatrix = gl.getUniformLocation(this.shaderProgram, "uPerspectiveMatrix");
	this.uPaintInRed = gl.getUniformLocation(this.shaderProgram, "uPaintInRed");
	this.uLightDepth = gl.getUniformLocation(this.shaderProgram, "uLightDepth");
};

WebGL.prototype.getShaderCode = function(shader){
	var code = "";
	var node = shader.firstChild;
	var tn = node.TEXT_NODE;
	
	while (node){
		if (node.nodeType == tn)
			code += node.textContent;
		node = node.nextSibling;
	}
	
	return code;
};

WebGL.prototype.loadImage = function(src, makeItTexture, textureIndex, isSolid, params){
	if (!params) params = {};
	if (!params.imgNum) params.imgNum = 1;
	if (!params.imgVNum) params.imgVNum = 1;
	if (!params.xOrig) params.xOrig = 0;
	if (!params.yOrig) params.yOrig = 0;
	
	var gl = this;
	var img = new Image();
	
	img.src = src;
	img.ready = false;
	img.texture = null;
	img.textureIndex = textureIndex;
	img.isSolid = (isSolid === true);
	img.imgNum = params.imgNum;
	img.vImgNum = params.imgVNum;
	img.xOrig = params.xOrig;
	img.yOrig = params.yOrig;
	
	Utils.addEvent(img, "load", function(){
		img.imgWidth = img.width / img.imgNum;
		img.imgHeight = img.height / img.vImgNum;
		img.ready = true;
		
		if (makeItTexture){
			img.texture = gl.parseTexture(img);
			img.texture.textureIndex = img.textureIndex;
		}
	});
	
	gl.images.push(img);
	return img;
};

WebGL.prototype.parseTexture = function(img){
	var gl = this.ctx;
	
	// Creates a texture holder to work with
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	
	// Flip vertical the texture
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	// Load the image data
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	
	// Assign properties of scaling
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	// Releases the texture from the workspace
	gl.bindTexture(gl.TEXTURE_2D, null);
	return tex;
};

WebGL.prototype.drawObject = function(object, camera, texture){
	var gl = this.ctx;
	
	// Pass the vertices data to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
	gl.vertexAttribPointer(this.aVertexPosition, object.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// Pass the texture data to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, object.texBuffer);
	gl.vertexAttribPointer(this.aTextureCoord, object.texBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// Pass the dark buffer data to the shader
	if (object.darkBuffer){
		gl.bindBuffer(gl.ARRAY_BUFFER, object.darkBuffer);
		gl.vertexAttribPointer(this.aVertexIsDark, object.darkBuffer.itemSize, gl.UNSIGNED_BYTE, false, 0, 0);
	}
	
	// Paint the object in red (When hurt for example)
	var red = (object.paintInRed)? 1.0 : 0.0; 
	gl.uniform1f(this.uPaintInRed, red);
	
	// How much light the player cast
	var light = (this.light > 0)? 0.0 : 1.0;
	gl.uniform1f(this.uLightDepth, light);
	
	// Set the texture to work with
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(this.uSampler, 0);
	
	// Create the perspective and transform the object
	var transformationMatrix = Matrix.makeTransform(object, camera);
	
	// Pass the indices data to the shader
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indicesBuffer);
	
	// Set the perspective and transformation matrices
	gl.uniformMatrix4fv(this.uPerspectiveMatrix, false, new Float32Array(this.perspectiveMatrix));
	gl.uniformMatrix4fv(this.uTransformationMatrix, false, new Float32Array(transformationMatrix));
	
	if (object.noRotate) gl.disable(gl.CULL_FACE);
	
	// Draw the triangles
	gl.drawElements(gl.TRIANGLES, object.indicesBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	gl.enable(gl.CULL_FACE);
};

WebGL.prototype.areImagesReady = function(){
	for (var i=0,len=this.images.length;i<len;i++){
		if (!this.images[i].ready) return false;
	}
	
	return true;
};
},{"./Matrix":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Matrix.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}]},{},["C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Underworld.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi5cXHNyY1xcQW5pbWF0ZWRUZXh0dXJlLmpzIiwiLi5cXHNyY1xcQXVkaW8uanMiLCIuLlxcc3JjXFxCaWxsYm9hcmQuanMiLCIuLlxcc3JjXFxDb25zb2xlLmpzIiwiLi5cXHNyY1xcRG9vci5qcyIsIi4uXFxzcmNcXEVuZGluZ1NjcmVlbi5qcyIsIi4uXFxzcmNcXEVuZW15LmpzIiwiLi5cXHNyY1xcRW5lbXlGYWN0b3J5LmpzIiwiLi5cXHNyY1xcSW52ZW50b3J5LmpzIiwiLi5cXHNyY1xcSXRlbS5qcyIsIi4uXFxzcmNcXEl0ZW1GYWN0b3J5LmpzIiwiLi5cXHNyY1xcTWFwQXNzZW1ibGVyLmpzIiwiLi5cXHNyY1xcTWFwTWFuYWdlci5qcyIsIi4uXFxzcmNcXE1hdHJpeC5qcyIsIi4uXFxzcmNcXE1pc3NpbGUuanMiLCIuLlxcc3JjXFxPYmplY3RGYWN0b3J5LmpzIiwiLi5cXHNyY1xcUGxheWVyLmpzIiwiLi5cXHNyY1xcUGxheWVyU3RhdHMuanMiLCIuLlxcc3JjXFxTYXZlTWFuYWdlci5qcyIsIi4uXFxzcmNcXFNlbGVjdENsYXNzLmpzIiwiLi5cXHNyY1xcU3RhaXJzLmpzIiwiLi5cXHNyY1xcU3RvcmFnZS5qcyIsIi4uXFxzcmNcXFRpdGxlU2NyZWVuLmpzIiwiLi5cXHNyY1xcVUkuanMiLCIuLlxcc3JjXFxVbmRlcndvcmxkLmpzIiwiLi5cXHNyY1xcVXRpbHMuanMiLCIuLlxcc3JjXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRfMUZyYW1lOiBbXSxcclxuXHRfMkZyYW1lczogW10sXHJcblx0XzNGcmFtZXM6IFtdLFxyXG5cdF80RnJhbWVzOiBbXSxcclxuXHRpdGVtQ29vcmRzOiBbXSxcclxuXHRcclxuXHRpbml0OiBmdW5jdGlvbihnbCl7XHJcblx0XHQvLyAxIEZyYW1lXHJcblx0XHR2YXIgY29vcmRzID0gWzEuMCwxLjAsMC4wLDEuMCwxLjAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMUZyYW1lLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMiBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4wMCwxLjAwLDAuNTAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMkZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNTAsMS4wMCwxLjAwLDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHJcblx0XHQvLyAzIEZyYW1lcywgNCBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjI1LDEuMDAsMC4wMCwxLjAwLDAuMjUsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4yNSwxLjAwLDAuNTAsMC4wMCwwLjI1LDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjc1LDEuMDAsMC41MCwxLjAwLDAuNzUsMC4wMCwwLjUwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFsxLjAwLDEuMDAsMC43NSwxLjAwLDEuMDAsMC4wMCwwLjc1LDAuMDBdO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0fSxcclxuXHRcclxuXHRwcmVwYXJlQnVmZmVyOiBmdW5jdGlvbihjb29yZHMsIGdsKXtcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoY29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gY29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdHJldHVybiB0ZXhCdWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRnZXRCeU51bUZyYW1lczogZnVuY3Rpb24obnVtRnJhbWVzKXtcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMSkgcmV0dXJuIHRoaXMuXzFGcmFtZTsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAyKSByZXR1cm4gdGhpcy5fMkZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAzKSByZXR1cm4gdGhpcy5fM0ZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSA0KSByZXR1cm4gdGhpcy5fNEZyYW1lcztcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRleHR1cmVCdWZmZXJDb29yZHM6IGZ1bmN0aW9uKHhJbWdOdW0sIHlJbWdOdW0sIGdsKXtcclxuXHRcdHZhciByZXQgPSBbXTtcclxuXHRcdHZhciB3aWR0aCA9IDEgLyB4SW1nTnVtO1xyXG5cdFx0dmFyIGhlaWdodCA9IDEgLyB5SW1nTnVtO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpPTA7aTx5SW1nTnVtO2krKyl7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPHhJbWdOdW07aisrKXtcclxuXHRcdFx0XHR2YXIgeDEgPSBqICogd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkxID0gMSAtIGkgKiBoZWlnaHQgLSBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHgyID0geDEgKyB3aWR0aDtcclxuXHRcdFx0XHR2YXIgeTIgPSB5MSArIGhlaWdodDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY29vcmRzID0gW3gyLHkyLHgxLHkyLHgyLHkxLHgxLHkxXTtcclxuXHRcdFx0XHRyZXQucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbmZ1bmN0aW9uIEF1ZGlvQVBJKCl7XHJcblx0dGhpcy5fYXVkaW8gPSBbXTtcclxuXHRcclxuXHR0aGlzLmF1ZGlvQ3R4ID0gbnVsbDtcclxuXHR0aGlzLmdhaW5Ob2RlID0gbnVsbDtcclxuXHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5pbml0QXVkaW9FbmdpbmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5pbml0QXVkaW9FbmdpbmUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh3aW5kb3cuQXVkaW9Db250ZXh0KXtcclxuXHRcdHRoaXMuYXVkaW9DdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblx0XHR0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0fWVsc2VcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgQXVkaW8gQVBJXCIpO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKHVybCwgaXNNdXNpYyl7XHJcblx0dmFyIGVuZyA9IHRoaXM7XHJcblx0aWYgKCFlbmcuYXVkaW9DdHgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHZhciBhdWRpbyA9IHtidWZmZXI6IG51bGwsIHNvdXJjZTogbnVsbCwgcmVhZHk6IGZhbHNlLCBpc011c2ljOiBpc011c2ljLCBwYXVzZWRBdDogMH07XHJcblx0XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cdGh0dHAucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuXHRcclxuXHRodHRwLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRlbmcuYXVkaW9DdHguZGVjb2RlQXVkaW9EYXRhKGh0dHAucmVzcG9uc2UsIGZ1bmN0aW9uKGJ1ZmZlcil7XHJcblx0XHRcdGF1ZGlvLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHRcdFx0YXVkaW8ucmVhZHkgPSB0cnVlO1xyXG5cdFx0fSwgZnVuY3Rpb24obXNnKXtcclxuXHRcdFx0YWxlcnQobXNnKTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0aHR0cC5zZW5kKCk7XHJcblx0XHJcblx0dGhpcy5fYXVkaW8ucHVzaChhdWRpbyk7XHJcblx0XHJcblx0cmV0dXJuIGF1ZGlvO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnN0b3BNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoYXVkaW8udGltZU8pe1xyXG5cdFx0XHRjbGVhclRpbWVvdXQoYXVkaW8udGltZU8pO1xyXG5cdFx0fWVsc2UgaWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghc291bmRGaWxlIHx8ICFzb3VuZEZpbGUucmVhZHkpe1xyXG5cdFx0aWYgKHRyeUlmTm90UmVhZHkpeyBzb3VuZEZpbGUudGltZU8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVuZy5wbGF5U291bmQoc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpOyB9LCAxMDAwKTsgfSBcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5pc011c2ljKSB0aGlzLnN0b3BNdXNpYygpO1xyXG5cdFxyXG5cdHNvdW5kRmlsZS50aW1lTyA9IG51bGw7XHJcblx0c291bmRGaWxlLnBsYXlpbmcgPSB0cnVlO1xyXG5cdCBcclxuXHR2YXIgc291cmNlID0gZW5nLmF1ZGlvQ3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG5cdHNvdXJjZS5idWZmZXIgPSBzb3VuZEZpbGUuYnVmZmVyO1xyXG5cdFxyXG5cdHZhciBnYWluTm9kZTtcclxuXHRpZiAodm9sdW1lICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0Z2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcclxuXHRcdGdhaW5Ob2RlLmdhaW4udmFsdWUgPSB2b2x1bWU7XHJcblx0XHRzb3VuZEZpbGUudm9sdW1lID0gdm9sdW1lO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2Fpbk5vZGUgPSBlbmcuZ2Fpbk5vZGU7XHJcblx0fVxyXG5cdFxyXG5cdHNvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcclxuXHRnYWluTm9kZS5jb25uZWN0KGVuZy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpIC0gc291bmRGaWxlLnBhdXNlZEF0O1xyXG5cdFx0c291cmNlLnN0YXJ0KDAsIChzb3VuZEZpbGUucGF1c2VkQXQgLyAxMDAwKSAlIHNvdW5kRmlsZS5idWZmZXIuZHVyYXRpb24pO1xyXG5cdFx0c291bmRGaWxlLnBhdXNlZEF0ID0gMDtcclxuXHR9ZWxzZXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG5cdFx0c291cmNlLnN0YXJ0KDApO1xyXG5cdH1cclxuXHRzb3VyY2UubG9vcCA9IGxvb3A7XHJcblx0c291cmNlLmxvb3BpbmcgPSBsb29wO1xyXG5cdHNvdXJjZS5vbmVuZGVkID0gZnVuY3Rpb24oKXsgc291bmRGaWxlLnBsYXlpbmcgPSBmYWxzZTsgfTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpXHJcblx0XHRzb3VuZEZpbGUuc291cmNlID0gc291cmNlO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBhdXNlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0YXVkaW8ucGF1c2VkQXQgPSAwO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8ud2FzUGxheWluZyA9IGF1ZGlvLnBsYXlpbmc7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnBhdXNlZEF0ID0gKERhdGUubm93KCkgLSBhdWRpby5zdGFydGVkQXQpO1xyXG5cdFx0XHRhdWRpby5yZXN0b3JlTG9vcCA9IGF1ZGlvLnNvdXJjZS5sb29wO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5yZXN0b3JlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFhdWRpby5sb29waW5nICYmICFhdWRpby53YXNQbGF5aW5nKSBjb250aW51ZTtcclxuXHRcdGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSAmJiBhdWRpby5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wbGF5U291bmQoYXVkaW8sIGF1ZGlvLnJlc3RvcmVMb29wLCB0cnVlLCBhdWRpby52b2x1bWUpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMubXV0ZWQpe1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMDtcclxuXHRcdHRoaXMubXV0ZWQgPSB0cnVlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuYXJlU291bmRzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuX2F1ZGlvW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuZnVuY3Rpb24gQmlsbGJvYXJkKHBvc2l0aW9uLCB0ZXh0dXJlQ29kZSwgbWFwTWFuYWdlciwgcGFyYW1zKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IG51bGw7XHJcblx0dGhpcy5udW1GcmFtZXMgPSAxO1xyXG5cdHRoaXMuaW1nU3BkID0gMDtcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5hY3Rpb25zID0gbnVsbDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcclxuXHRpZiAocGFyYW1zKSB0aGlzLnBhcnNlUGFyYW1zKHBhcmFtcyk7XHJcblx0aWYgKHRleHR1cmVDb2RlID09IFwibm9uZVwiKSB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCaWxsYm9hcmQ7XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLnBhcnNlUGFyYW1zID0gZnVuY3Rpb24ocGFyYW1zKXtcclxuXHRmb3IgKHZhciBpIGluIHBhcmFtcyl7XHJcblx0XHR2YXIgcCA9IHBhcmFtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGkgPT0gXCJuZlwiKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR0aGlzLm51bUZyYW1lcyA9IHA7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhwKTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiaXNcIil7IC8vIEltYWdlIHNwZWVkXHJcblx0XHRcdHRoaXMuaW1nU3BkID0gcDtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiY2JcIil7IC8vIEN1c3RvbSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZChwLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiYWNcIil7IC8vIEFjdGlvbnNcclxuXHRcdFx0dGhpcy5hY3Rpb25zID0gcDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuYWN0aW9ucy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhYyA9IHRoaXMuYWN0aW9uc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGFjID09IFwidHZcIil7IC8vIFRvb2dsZSB2aXNpYmlsaXR5XHJcblx0XHRcdHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN0X1wiKSA9PSAwKXsgLy8gQ2hhbmdlIHRleHR1cmVcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29kZSA9IGFjLnJlcGxhY2UoXCJjdF9cIiwgXCJcIik7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcIm5mX1wiKSA9PSAwKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR2YXIgbmYgPSBwYXJzZUludChhYy5yZXBsYWNlKFwibmZfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBuZjtcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKG5mKTtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjZl9cIikgPT0gMCl7IC8vIENpcmNsZSBmcmFtZXNcclxuXHRcdFx0dmFyIGZyYW1lcyA9IGFjLnJlcGxhY2UoXCJjZl9cIixcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gcGFyc2VJbnQoZnJhbWVzW3RoaXMuY2lyY2xlRnJhbWVJbmRleF0sIDEwKTtcclxuXHRcdFx0aWYgKHRoaXMuY2lyY2xlRnJhbWVJbmRleCsrID49IGZyYW1lcy5sZW5ndGgtMSkgdGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY3dfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciB0ZXh0dXJlSWQgPSBwYXJzZUludChhYy5yZXBsYWNlKFwiY3dfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmNoYW5nZVdhbGxUZXh0dXJlKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0ZXh0dXJlSWQpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJ1ZF9cIikgPT0gMCl7IC8vIFVubG9jayBkb29yXHJcblx0XHRcdHZhciBwb3MgPSBhYy5yZXBsYWNlKFwidWRfXCIsIFwiXCIpLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0dmFyIGRvb3IgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0RG9vckF0KHBhcnNlSW50KHBvc1swXSwgMTApLCBwYXJzZUludChwb3NbMV0sIDEwKSwgcGFyc2VJbnQocG9zWzJdLCAxMCkpO1xyXG5cdFx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRcdGRvb3IubG9jayA9IG51bGw7XHJcblx0XHRcdFx0ZG9vci5hY3RpdmF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAoYWMgPT0gXCJkZXN0cm95XCIpeyAvLyBEZXN0cm95IHRoZSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy52aXNpYmxlKSByZXR1cm47XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5iaWxsYm9hcmQgJiYgdGhpcy50ZXh0dXJlQ29vcmRzKXtcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMudGV4dHVyZUNvb3Jkc1sodGhpcy5pbWdJbmQgPDwgMCldO1xyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCAmJiB0aGlzLm51bUZyYW1lcyA+IDEpe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMubnVtRnJhbWVzKXtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gQ29uc29sZSgvKkludCovIG1heE1lc3NhZ2VzLCAvKkludCovIGxpbWl0LCAvKkludCovIHNwbGl0QXQsICAvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLm1lc3NhZ2VzID0gW107XHJcblx0dGhpcy5tYXhNZXNzYWdlcyA9IG1heE1lc3NhZ2VzO1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5saW1pdCA9IGxpbWl0O1xyXG5cdHRoaXMuc3BsaXRBdCA9IHNwbGl0QXQ7XHJcblx0XHJcblx0dGhpcy5zcHJpdGVGb250ID0gbnVsbDtcclxuXHR0aGlzLmxpc3RPZkNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNmQ29udGV4dCA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSBudWxsO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGU7XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigvKkludCovIHgsIC8qSW50Ki8geSl7XHJcblx0dmFyIHMgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDE7XHJcblx0dmFyIGN0eCA9IHRoaXMuZ2FtZS5VSS5jdHg7XHJcblx0XHJcblx0Y3R4LmRyYXdJbWFnZSh0aGlzLnNmQ29udGV4dC5jYW52YXMsIHgsIHkpO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucGFyc2VGb250ID0gZnVuY3Rpb24oc3ByaXRlRm9udCl7XHJcblx0dmFyIGNoYXJhc1dpZHRoID0gW107XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc3ByaXRlRm9udC53aWR0aDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0XHJcblx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0Y3R4LmRyYXdJbWFnZShzcHJpdGVGb250LCAwLCAwKTtcclxuXHRcclxuXHR2YXIgaW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwwLGNhbnZhcy53aWR0aCwxKTtcclxuXHR2YXIgd2lkdGggPSAwO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW1nRGF0YS5kYXRhLmxlbmd0aDtpPGxlbjtpKz00KXtcclxuXHRcdHZhciByID0gaW1nRGF0YS5kYXRhW2ldO1xyXG5cdFx0dmFyIGcgPSBpbWdEYXRhLmRhdGFbaSsxXTtcclxuXHRcdHZhciBiID0gaW1nRGF0YS5kYXRhW2krMl07XHJcblx0XHRcclxuXHRcdGlmIChyID09IDI1NSAmJiBnID09IDAgJiYgYiA9PSAyNTUpe1xyXG5cdFx0XHR3aWR0aCsrO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmICh3aWR0aCAhPSAwKXtcclxuXHRcdFx0XHRjaGFyYXNXaWR0aC5wdXNoKHdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNoYXJhc1dpZHRoO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuY3JlYXRlU3ByaXRlRm9udCA9IGZ1bmN0aW9uKC8qSW1hZ2UqLyBzcHJpdGVGb250LCAvKlN0cmluZyovIGNoYXJhY3RlcnNVc2VkLCAvKkludCovIHZlcnRpY2FsU3BhY2Upe1xyXG5cdHRoaXMuc3ByaXRlRm9udCA9IHNwcml0ZUZvbnQ7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IGNoYXJhY3RlcnNVc2VkO1xyXG5cdHRoaXMuc3BhY2VMaW5lcyA9IHZlcnRpY2FsU3BhY2U7XHJcblx0XHJcblx0dGhpcy5jaGFyYXNXaWR0aCA9IHRoaXMucGFyc2VGb250KHNwcml0ZUZvbnQpO1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwMDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLnNmQ29udGV4dC5jYW52YXMgPSBjYW52YXM7XHJcblx0XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gc3ByaXRlRm9udC53aWR0aCAvIGNoYXJhY3RlcnNVc2VkLmxlbmd0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmZvcm1hdFRleHQgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciB0eHQgPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcclxuXHR2YXIgbGluZSA9IFwiXCI7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dHh0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIHdvcmQgPSB0eHRbaV07XHJcblx0XHRpZiAoKGxpbmUgKyBcIiBcIiArIHdvcmQpLmxlbmd0aCA8PSB0aGlzLnNwbGl0QXQpe1xyXG5cdFx0XHRpZiAobGluZSAhPSBcIlwiKSBsaW5lICs9IFwiIFwiO1xyXG5cdFx0XHRsaW5lICs9IHdvcmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0LnB1c2gobGluZSk7XHJcblx0XHRcdGxpbmUgPSB3b3JkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXQucHVzaChsaW5lKTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuYWRkU0ZNZXNzYWdlID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgbXNnID0gdGhpcy5mb3JtYXRUZXh0KG1lc3NhZ2UpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49bXNnLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1zZ1tpXSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubGltaXQpe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5zcGxpY2UoMCwxKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGMgPSB0aGlzLnNmQ29udGV4dC5jYW52YXM7XHJcblx0dGhpcy5zZkNvbnRleHQuY2xlYXJSZWN0KDAsMCxjLndpZHRoLGMuaGVpZ2h0KTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMubWVzc2FnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXNnID0gdGhpcy5tZXNzYWdlc1tpXTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gKHRoaXMuc3BhY2VMaW5lcyAqIHRoaXMubGltaXQpIC0gdGhpcy5zcGFjZUxpbmVzICogKGxlbiAtIGkgLSAxKTtcclxuXHRcdHRoaXMucHJpbnRUZXh0KHgseSxtc2cpO1xyXG5cdH1cclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnByaW50VGV4dCA9IGZ1bmN0aW9uICh4LHksbXNnLCBjdHgpe1xyXG5cdGlmICghY3R4KXtcclxuXHRcdGN0eCA9IHRoaXMuc2ZDb250ZXh0O1xyXG5cdH1cclxuXHR2YXIgYyA9IGN0eC5jYW52YXM7XHJcblx0XHJcblx0dmFyIHcgPSB0aGlzLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSB0aGlzLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdFxyXG5cdHZhciBtVyA9IG1zZy5sZW5ndGggKiB3O1xyXG5cdGlmIChtVyA+IGMud2lkdGgpIGMud2lkdGggPSBtVyArICgyICogdyk7XHJcblx0XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49bXNnLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IG1zZy5jaGFyQXQoaik7XHJcblx0XHR2YXIgaW5kID0gdGhpcy5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHR4LCB5LCB3LCBoIC0gMSk7XHJcblx0XHRcdHggKz0gdGhpcy5jaGFyYXNXaWR0aFtpbmRdICsgMTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR4ICs9IHc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZnVuY3Rpb24gRG9vcihtYXBNYW5hZ2VyLCB3YWxsUG9zaXRpb24sIGRpciwgdGV4dHVyZUNvZGUsIHdhbGxUZXh0dXJlLCBsb2NrKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMud2FsbFBvc2l0aW9uID0gd2FsbFBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdHRoaXMuZGlyID0gZGlyO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLnJUZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlOyAvLyBEZWxldGVcclxuXHJcblx0dGhpcy5kb29yUG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHR0aGlzLndhbGxUZXh0dXJlID0gd2FsbFRleHR1cmU7XHJcblx0XHRcclxuXHR0aGlzLmJvdW5kaW5nQm94ID0gbnVsbDtcclxuXHR0aGlzLnBvc2l0aW9uID0gd2FsbFBvc2l0aW9uLmNsb25lKCk7XHJcblx0aWYgKGRpciA9PSBcIkhcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoLTAuMjUsIDAuMCwgMC4wKSk7IH1lbHNlXHJcblx0aWYgKGRpciA9PSBcIlZcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoMC4wLCAwLjAsIC0wLjI1KSk7IHRoaXMucm90YXRpb24gPSBNYXRoLlBJXzI7IH1cclxuXHRcclxuXHR0aGlzLmxvY2sgPSBsb2NrO1xyXG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcclxuXHR0aGlzLmFuaW1hdGlvbiA9ICAwO1xyXG5cdHRoaXMub3BlblNwZWVkID0gTWF0aC5kZWdUb1JhZCgxMCk7XHJcblx0XHJcblx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEb29yO1xyXG5cclxuRG9vci5wcm90b3R5cGUuZ2V0Qm91bmRpbmdCb3ggPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmJvdW5kaW5nQm94O1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiAhPSAwKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMubG9jayl7XHJcblx0XHR2YXIga2V5ID0gdGhpcy5tYXBNYW5hZ2VyLmdldFBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdGlmIChrZXkpe1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShrZXkubmFtZSArIFwiIHVzZWRcIik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5yZW1vdmVQbGF5ZXJJdGVtKHRoaXMubG9jayk7XHJcblx0XHRcdHRoaXMubG9jayA9IG51bGw7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJMb2NrZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuY2xvc2VkKSB0aGlzLmFuaW1hdGlvbiA9IDE7XHJcblx0ZWxzZSB0aGlzLmFuaW1hdGlvbiA9IDI7IFxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybiB0cnVlO1xyXG5cdHJldHVybiB0aGlzLmNsb3NlZDtcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLm1vZGlmeUNvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGlyID09IFwiSFwiKXtcclxuXHRcdGlmICh0aGlzLmNsb3NlZCl7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUgLSAwLjA1LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1lbHNle1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUgLSAwLjA1LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC4xLCBoOiAwLjVcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFuMSA9ICgodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIkhcIikgfHwgKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJWXCIpKTtcclxuXHR2YXIgYW4yID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAyICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdFxyXG5cdGlmIChhbjEgJiYgdGhpcy5yb3RhdGlvbiA8IE1hdGguUElfMil7XHJcblx0XHR0aGlzLnJvdGF0aW9uICs9IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPj0gTWF0aC5QSV8yKXtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJWXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1lbHNlIGlmIChhbjIgJiYgdGhpcy5yb3RhdGlvbiA+IDApe1xyXG5cdFx0dGhpcy5yb3RhdGlvbiAtPSB0aGlzLm9wZW5TcGVlZDtcclxuXHRcdGlmICh0aGlzLnJvdGF0aW9uIDw9IDApe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gMDtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJIXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gRW5kaW5nU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5jdXJyZW50U2NyZWVuID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmRpbmdTY3JlZW47XHJcblxyXG5FbmRpbmdTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMilcclxuXHRcdFx0dGhpcy5nYW1lLm5ld0dhbWUoKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0fVxyXG59O1xyXG5cclxuRW5kaW5nU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHRpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDApXHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5lbmRpbmdTY3JlZW4sIDAsIDApO1xyXG5cdGVsc2UgaWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSAxKVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMiwgMCwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ2JpbGxib2FyZCcpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ3RleHR1cmVDb29yZHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0VuZW15JywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKSB7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMoMik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gRW5lbXkoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0VuZW15Jyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0VuZW15JywgRW5lbXkpO1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZW5lbXksIG1hcE1hbmFnZXIpe1xyXG5cdGlmIChlbmVteS5zd2ltKSBwb3NpdGlvbi5iIC09IDAuMjtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQmFzZSA9IGVuZW15LnRleHR1cmVCYXNlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5hbmltYXRpb24gPSBcInJ1blwiO1xyXG5cdHRoaXMuZW5lbXkgPSBlbmVteTtcclxuXHR0aGlzLnRhcmdldCA9IGZhbHNlO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMjtcclxuXHR0aGlzLmltZ1NwZCA9IDEvNztcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLmh1cnQgPSAwLjA7XHJcblx0dGhpcy50YXJnZXRZID0gcG9zaXRpb24uYjtcclxuXHR0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHR0aGlzLnNsZWVwID0gMDtcclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwLjA7XHJcblx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPSAwO1xyXG5cdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbkVuZW15LnByb3RvdHlwZS5yZWNlaXZlRGFtYWdlID0gZnVuY3Rpb24oZG1nKXtcclxuXHR0aGlzLmh1cnQgPSA1LjA7XHJcblx0XHJcblx0dGhpcy5lbmVteS5ocCAtPSBkbWc7XHJcblx0aWYgKHRoaXMuZW5lbXkuaHAgPD0gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5hZGRFeHBlcmllbmNlKHRoaXMuZW5lbXkuc3RhdHMuZXhwKTtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIga2lsbGVkXCIpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29rRm9yID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAoIXBsYXllci5tb3ZlZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdFxyXG5cdHZhciBkeCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0dmFyIGR6ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcclxuXHRpZiAoIXRoaXMudGFyZ2V0ICYmIChkeCA8PSA0IHx8IGR6IDw9IDQpKXtcclxuXHRcdC8vIENhc3QgYSByYXkgdG93YXJkcyB0aGUgcGxheWVyIHRvIGNoZWNrIGlmIGhlJ3Mgb24gdGhlIHZpc2lvbiBvZiB0aGUgY3JlYXR1cmVcclxuXHRcdHZhciByeCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHRcdHZhciByeSA9IHRoaXMucG9zaXRpb24uYztcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMztcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4zO1xyXG5cdFx0XHJcblx0XHR2YXIgc2VhcmNoID0gMTU7XHJcblx0XHR3aGlsZSAoc2VhcmNoID4gMCl7XHJcblx0XHRcdHJ4ICs9IGR4O1xyXG5cdFx0XHRyeSArPSBkeTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjeCA9IChyeCA8PCAwKTtcclxuXHRcdFx0dmFyIGN5ID0gKHJ5IDw8IDApO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMubWFwTWFuYWdlci5pc1NvbGlkKGN4LCBjeSwgMCkpe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHB4ID0gKHAuYSA8PCAwKTtcclxuXHRcdFx0XHR2YXIgcHkgPSAocC5jIDw8IDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChjeCA9PSBweCAmJiBjeSA9PSBweSl7XHJcblx0XHRcdFx0XHR0aGlzLnRhcmdldCA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRcdFx0XHRzZWFyY2ggPSAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VhcmNoIC09IDE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0cnVlKTtcclxuXHRpZiAodGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgcG9pbnRZIDwgMC4wKSBwb2ludFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcblx0XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gdGhpcy5wb3NpdGlvbi5iKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRCQm94V2FsbE5vcm1hbChmYWtlUG9zLCBzcGQsIDAuMyk7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCB0aGlzKTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgIXRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiB0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYSAtPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmMgLT0gbW92ZW1lbnQuYjtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiAhdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmF0dGFja1BsYXllciA9IGZ1bmN0aW9uKHBsYXllcil7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZSh0aGlzLmVuZW15LnN0YXRzLnN0cik7XHJcblx0dmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdFxyXG5cdC8vIENoZWNrIGlmIHRoZSBwbGF5ZXIgaGFzIHRoZSBwcm90ZWN0aW9uIHNwZWxsXHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnByb3RlY3Rpb24gPiAwKXtcclxuXHRcdGRmcyArPSAxNTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCk7XHJcblx0XHJcblx0aWYgKGRtZyA+IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIgYXR0YWNrcyB4XCIrZG1nKTtcclxuXHRcdHBsYXllci5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2Jsb2NrJyk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDkwO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XHJcblx0dmFyIHAgPSBwbGF5ZXIucG9zaXRpb247XHJcblx0aWYgKHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID4gMCl7XHJcblx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciAtLTtcclxuXHRcdGlmICh0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdFx0dmFyIHl5ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcdFx0aWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0XHR0aGlzLmF0dGFja1BsYXllcihwbGF5ZXIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAodGhpcy50YXJnZXQpe1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCl7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCAtLTtcclxuXHRcdH1cclxuXHRcdGlmICh4eCA8PSAxICYmIHl5IDw9MSl7XHJcblx0XHRcdGlmICh0aGlzLmF0dGFja1dhaXQgPT0gMCl7XHJcblx0XHRcdFx0Ly8gdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIgYXR0YWNrcyFcIik7IFJlbW92ZWQsIHdpbGwgYmUgcmVwbGFjZWQgYnkgYXR0YWNrIGFuaW1hdGlvblxyXG5cdFx0XHRcdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMTA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh4eCA+IDEwIHx8IHl5ID4gMTApe1xyXG5cdFx0XHR0aGlzLnRhcmdldCA9IG51bGw7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGRpciA9IE1hdGguZ2V0QW5nbGUodGhpcy5wb3NpdGlvbiwgcCk7XHJcblx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIpICogMC4wMjtcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4wMjtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdCA9IHZlYzIoTWF0aC5jb3MoZGlyICsgTWF0aC5QSV8yKSwgLU1hdGguc2luKGRpciArIE1hdGguUElfMikpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1vdmVUbyhkeCwgZHksIGxhdCk7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmxvb2tGb3IoKTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZ2V0VGV4dHVyZUNvZGUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBmYWNlID0gdGhpcy5kaXJlY3Rpb247XHJcblx0dmFyIGEgPSB0aGlzLmFuaW1hdGlvbjtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gPT0gXCJzdGFuZFwiKSBhID0gXCJydW5cIjtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlQmFzZSArIFwiX1wiICsgYTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQucGFpbnRJblJlZCA9ICh0aGlzLmh1cnQgPiAwKTtcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLmdldFRleHR1cmVDb2RlKCksdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwKXsgdGhpcy5odXJ0IC09IDE7IH1cclxuXHRpZiAodGhpcy5zbGVlcCA+IDApeyB0aGlzLnNsZWVwIC09IDE7IH1cclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmIChnYW1lLnBhdXNlZCB8fCBnYW1lLnRpbWVTdG9wID4gMCB8fCB0aGlzLnNsZWVwID4gMCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA8PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9ZWxzZSBpZiAodGhpcy50YXJnZXRZID4gdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiArPSAwLjA4O1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA+PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGVuZW1pZXM6IHtcclxuXHRcdGJhdDoge25hbWU6ICdHaWFudCBCYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDQsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmF0OiB7bmFtZTogJ0dpYW50IFJhdCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYXQnLCBzdGF0czoge3N0cjogJzFEOScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c3BpZGVyOiB7bmFtZTogJ0dpYW50IFNwaWRlcicsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdzcGlkZXInLCBzdGF0czoge3N0cjogJzFEMTEnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdyZW1saW46IHtuYW1lOiAnR3JlbWxpbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdncmVtbGluJywgc3RhdHM6IHtzdHI6ICcyRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNrZWxldG9uOiB7bmFtZTogJ1NrZWxldG9uJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3NrZWxldG9uJywgc3RhdHM6IHtzdHI6ICczRDQnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdGhlYWRsZXNzOiB7bmFtZTogJ0hlYWRsZXNzJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2hlYWRsZXNzJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdC8vbml4aWU6IHtuYW1lOiAnTml4aWUnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0d2lzcDoge25hbWU6ICdXaXNwJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ3dpc3AnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdob3N0OiB7bmFtZTogJ0dob3N0JywgaHA6IDgwLCB0ZXh0dXJlQmFzZTogJ2dob3N0Jywgc3RhdHM6IHtzdHI6ICcyRDE1JywgZGZzOiAnMkQyJywgZXhwOiA2LCBmbHk6IHRydWV9fSxcclxuXHRcdHRyb2xsOiB7bmFtZTogJ1Ryb2xsJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3Ryb2xsJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSwgLy8gTm90IHVzZWQgYnkgdGhlIGdlbmVyYXRvcj9cclxuXHRcdGxhdmFMaXphcmQ6IHtuYW1lOiAnTGF2YSBMaXphcmQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbGF2YUxpemFyZCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtb25nYmF0OiB7bmFtZTogJ01vbmdiYXQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbW9uZ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3LCBmbHk6IHRydWV9fSwgXHJcblx0XHRvY3RvcHVzOiB7bmFtZTogJ0dpYW50IFNxdWlkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ29jdG9wdXMnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZGFlbW9uOiB7bmFtZTogJ0RhZW1vbicsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnZGFlbW9uJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdC8vcGhhbnRvbToge25hbWU6ICdQaGFudG9tJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzFEMTUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHNlYVNlcnBlbnQ6IHtuYW1lOiAnU2VhIFNlcnBlbnQnLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ3NlYVNlcnBlbnQnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZXZpbE1hZ2U6IHtuYW1lOiAnRXZpbCBNYWdlJywgaHA6IDE3NiwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICc2RDUnLCBkZnM6ICcyRDInLCBleHA6IDEyfX0sIC8vVE9ETzogQWRkIHRleHR1cmVcclxuXHRcdGxpY2hlOiB7bmFtZTogJ0xpY2hlJywgaHA6IDE5MiwgdGV4dHVyZUJhc2U6ICdsaWNoZScsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxM319LFxyXG5cdFx0aHlkcmE6IHtuYW1lOiAnSHlkcmEnLCBocDogMjA4LCB0ZXh0dXJlQmFzZTogJ2h5ZHJhJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE0fX0sXHJcblx0XHRkcmFnb246IHtuYW1lOiAnRHJhZ29uJywgaHA6IDIyNCwgdGV4dHVyZUJhc2U6ICdkcmFnb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTUsIGZseTogdHJ1ZX19LFx0XHRcdFx0Ly8gTm90IHN1aXRhYmxlXHJcblx0XHR6b3JuOiB7bmFtZTogJ1pvcm4nLCBocDogMjQwLCB0ZXh0dXJlQmFzZTogJ3pvcm4nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdGdhemVyOiB7bmFtZTogJ0dhemVyJywgaHA6IDI0MCwgdGV4dHVyZUJhc2U6ICdnYXplcicsIHN0YXRzOiB7c3RyOiAnNUQ4JywgZGZzOiAnMkQyJywgZXhwOiAxNiwgZmx5OiB0cnVlfX0sXHJcblx0XHRyZWFwZXI6IHtuYW1lOiAnUmVhcGVyJywgaHA6IDI1NSwgdGV4dHVyZUJhc2U6ICdyZWFwZXInLCBzdGF0czoge3N0cjogJzVEOCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdGJhbHJvbjoge25hbWU6ICdCYWxyb24nLCBocDogMjU1LCB0ZXh0dXJlQmFzZTogJ2JhbHJvbicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0Ly90d2lzdGVyOiB7bmFtZTogJ1R3aXN0ZXInLCBocDogMjUsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICc0RDInLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdFxyXG5cdFx0d2Fycmlvcjoge25hbWU6ICdGaWdodGVyJywgaHA6IDk4LCB0ZXh0dXJlQmFzZTogJ2ZpZ2h0ZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0bWFnZToge25hbWU6ICdNYWdlJywgaHA6IDExMiwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdGJhcmQ6IHtuYW1lOiAnQmFyZCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdiYXJkJywgc3RhdHM6IHtzdHI6ICcyRDEwJywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRkcnVpZDoge25hbWU6ICdEcnVpZCcsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDEwfX0sXHJcblx0XHR0aW5rZXI6IHtuYW1lOiAnVGlua2VyJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRwYWxhZGluOiB7bmFtZTogJ1BhbGFkaW4nLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ2ZpZ2h0ZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c2hlcGhlcmQ6IHtuYW1lOiAnU2hlcGhlcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICczRDMnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcclxuXHRcdHJhbmdlcjoge25hbWU6ICdSYW5nZXInLCBocDogMTQ0LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiAzfX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEVuZW15OiBmdW5jdGlvbihuYW1lKXtcclxuXHRcdGlmICghdGhpcy5lbmVtaWVzW25hbWVdKSB0aHJvdyBcIkludmFsaWQgZW5lbXkgbmFtZTogXCIgKyBuYW1lO1xyXG5cdFx0XHJcblx0XHR2YXIgZW5lbXkgPSB0aGlzLmVuZW1pZXNbbmFtZV07XHJcblx0XHR2YXIgcmV0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpIGluIGVuZW15KXtcclxuXHRcdFx0cmV0W2ldID0gZW5lbXlbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBJbnZlbnRvcnkobGltaXRJdGVtcyl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJbnZlbnRvcnknKTtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcblx0dGhpcy5saW1pdEl0ZW1zID0gbGltaXRJdGVtcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0ludmVudG9yeScsIEludmVudG9yeSk7XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpZiAodGhpcy5pdGVtcy5sZW5ndGggPT0gdGhpcy5saW1pdEl0ZW1zKXtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5lcXVpcEl0ZW0gPSBmdW5jdGlvbihpdGVtSWQpe1xyXG5cdHZhciB0eXBlID0gdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGU7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXRlbS50eXBlID09IHR5cGUpe1xyXG5cdFx0XHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IHRydWU7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEVxdWlwcGVkSXRlbSA9IGZ1bmN0aW9uKHR5cGUpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlICYmIGl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRyZXR1cm4gaXRlbTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldFdlYXBvbiA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCd3ZWFwb24nKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0QXJtb3VyID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5nZXRFcXVpcHBlZEl0ZW0oJ2FybW91cicpO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kZXN0cm95SXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdGl0ZW0uc3RhdHVzID0gMC4wO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXQgPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXQgPT09IGl0ZW0pe1xyXG5cdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpLCAxKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmRyb3BJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHRpZiAodGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ3dlYXBvbicgfHwgdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ2FybW91cicpe1xyXG5cdFx0dGhpcy5pdGVtc1tpdGVtSWRdLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0fVxyXG5cdHRoaXMuaXRlbXMuc3BsaWNlKGl0ZW1JZCwgMSk7XHJcbn07XHJcbiIsInZhciBCaWxsYm9hcmQgPSByZXF1aXJlKCcuL0JpbGxib2FyZCcpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0l0ZW0nLCAnYmlsbGJvYXJkJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdJdGVtJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdGlmIChvYmplY3QuaXRlbSkge1xyXG5cdFx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleFtvYmplY3QuaXRlbS50ZXhdLmJ1ZmZlcnNbb2JqZWN0Lml0ZW0uc3ViSW1nXTtcclxuXHRcdG9iamVjdC50ZXh0dXJlQ29kZSA9IG9iamVjdC5pdGVtLnRleDtcclxuXHR9XHJcbn0pO1x0XHJcblxyXG5mdW5jdGlvbiBJdGVtKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJdGVtJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSXRlbTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnSXRlbScsIEl0ZW0pO1xyXG5cclxuSXRlbS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBpdGVtLCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLml0ZW0gPSBudWxsO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBudWxsO1xyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHRcclxuXHRpZiAoaXRlbSkgdGhpcy5zZXRJdGVtKGl0ZW0pO1xyXG59O1xyXG5cclxuXHJcbkl0ZW0ucHJvdG90eXBlLnNldEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHR0aGlzLml0ZW0gPSBpdGVtO1xyXG5cdFxyXG5cdHRoaXMuc29saWQgPSBpdGVtLnNvbGlkO1xyXG5cdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0aWYgKHRoaXMuaXRlbS5hbmltYXRpb25MZW5ndGgpeyB0aGlzLmltZ1NwZCA9IDEgLyA2OyB9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4W3RoaXMuaXRlbS50ZXhdLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBpdGVtLnRleDtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbW0gPSB0aGlzLm1hcE1hbmFnZXI7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAodGhpcy5pdGVtLmlzSXRlbSl7XHJcblx0XHRpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2NvZGV4Jyl7XHJcblx0XHRcdC8qbW0uYWRkTWVzc2FnZShcIlRoZSBib3VuZGxlc3Mga25vd25sZWRnZSBvZiB0aGUgQ29kZXggaXMgcmV2ZWFsZWQgdW50byB0aGVlLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkEgdm9pY2UgdGh1bmRlcnMhXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBoYXN0IHByb3ZlbiB0aHlzZWxmIHRvIGJlIHRydWx5IGdvb2QgaW4gbmF0dXJlXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJxdWVzdCBvZiBhIGxpZmV0aW1lLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkF2YXRhcmhvb2QgaXMgYSBsaXZpbmcgZ2lmdCwgSXQgbXVzdCBhbHdheXMgYW5kIGZvcmV2ZXIgYmUgbnVydHVyZWRcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJ0byBmbHVvcmlzaCwgZm9yIGlmIHRob3UgZG9zdCBzdHJheSBmcm9tIHRoZSBwYXRocyBvZiB2aXJ0dWUsIHRoeSB3YXlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJtYXkgYmUgbG9zdCBmb3JldmVyLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlJldHVybiBub3cgdW50byB0aGluZSBvdXIgd29ybGQsIGxpdmUgdGhlcmUgYXMgYW4gZXhhbXBsZSB0byB0aHlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJwZW9wbGUsIGFzIG91ciBtZW1vcnkgb2YgdGh5IGdhbGxhbnQgZGVlZHMgc2VydmVzIHVzLlwiKTsqL1xyXG5cdFx0XHRkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0Z2FtZS5wbGF5ZXIuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0Z2FtZS5lbmRpbmcoKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2ZlYXR1cmUnKXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBzZWUgYSBcIit0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHR9IGVsc2UgaWYgKGdhbWUuYWRkSXRlbSh0aGlzLml0ZW0pKXtcclxuXHRcdFx0dmFyIHN0YXQgPSAnJztcclxuXHRcdFx0aWYgKHRoaXMuaXRlbS5zdGF0dXMgIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRzdGF0ID0gSXRlbUZhY3RvcnkuZ2V0U3RhdHVzTmFtZSh0aGlzLml0ZW0uc3RhdHVzKSArICcgJztcclxuXHRcdFx0XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3UgcGljayB1cCBhIFwiK3N0YXQgKyB0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiWW91IGNhbid0IGNhcnJ5IGFueSBtb3JlIGl0ZW1zXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCl7XHJcblx0XHR2YXIgaW5kID0gKHRoaXMuaW1nSW5kIDw8IDApO1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1tpbmRdO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlcil7XHJcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5pdGVtLmFuaW1hdGlvbkxlbmd0aCA+IDApe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMuaXRlbS5zdWJJbWcgKyB0aGlzLml0ZW0uYW5pbWF0aW9uTGVuZ3RoIC0gMSl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGl0ZW1zOiB7XHJcblx0XHQvLyBJdGVtc1xyXG5cdFx0eWVsbG93UG90aW9uOiB7bmFtZTogXCJZZWxsb3cgcG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdHJlZFBvdGlvbjoge25hbWU6IFwiUmVkIFBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRcclxuXHRcdC8vIFdlYXBvbnNcclxuXHRcdC8qXHJcblx0XHQgKiBEYWdnZXJzOiBMb3cgZGFtYWdlLCBsb3cgdmFyaWFuY2UsIEhpZ2ggc3BlZWQsIEQzLCAxNjBETUcgXHJcblx0XHQgKiBTdGF2ZXM6IE1pZCBkYW1hZ2UsIExvdyB2YXJpYW5jZSwgTWlkIHNwZWVkLCBEMywgMjQwRE1HXHJcblx0XHQgKiBNYWNlczogSGlnaCBEYW1hZ2UsIEhpZ2ggVmFyaWFuY2UsIExvdyBzcGVlZCwgRDEyLCAzNjAgRE1HXHJcblx0XHQgKiBBeGVzOiBNaWQgRGFtYWdlLCBMb3cgVmFyaWFuY2UsIExvdyBzcGVlZCwgRDMsIDI0MERNR1xyXG5cdFx0ICogU3dvcmRzOiBNaWQgRGFtYWdlLCBNaWQgdmFyaWFuY2UsIE1pZCBzcGVlZCwgRDYsIDI0MERNR1xyXG5cdFx0ICogXHJcblx0XHQgKiBNeXN0aWMgU3dvcmQ6IE1pZCBEYW1hZ2UsIFJhbmRvbSBEYW1hZ2UsIE1pZCBzcGVlZCwgRDMyIDI1NkRNR1xyXG5cdFx0ICovXHJcblx0XHRkYWdnZXJQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBEYWdnZXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMiwgdmlld1BvcnRJbWc6IDIsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyMEQzJywgd2VhcjogMC4wNX0sXHJcblx0XHRkYWdnZXJGYW5nOiB7bmFtZTogXCJGYW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDMsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0ZGFnZ2VyU3Rpbmc6IHtuYW1lOiBcIlN0aW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDQsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0XHJcblx0XHRzdGFmZkdhcmdveWxlOiB7bmFtZTogXCJHYXJnb3lsZSBTdGFmZlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA1LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQWdlczoge25hbWU6IFwiU3RhZmYgb2YgQWdlc1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA2LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzgwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQ2FieXJ1czoge25hbWU6IFwiU3RhZmYgb2YgQ2FieXJ1c1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA3LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwMEQzJywgd2VhcjogMC4wMn0sXHJcblx0XHRcclxuXHRcdG1hY2VCYW5lOiB7bmFtZTogXCJNYWNlIG9mIFVuZGVhZCBCYW5lXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDgsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMjBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdG1hY2VCb25lQ3J1c2hlcjoge25hbWU6IFwiQm9uZSBDcnVzaGVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogOSwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyNUQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZUp1Z2dlcm5hdXQ6IHtuYW1lOiBcIkp1Z2dlcm5hdXQgTWFjZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMCwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICczMEQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZVNsYXllcjoge25hbWU6IFwiU2xheWVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTEsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdFxyXG5cdFx0YXhlRHdhcnZpc2g6IHtuYW1lOiBcIkR3YXJ2aXNoIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMiwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgd2VhcjogMC4wMX0sXHJcblx0XHRheGVSdW5lOiB7bmFtZTogXCJSdW5lZCBBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTMsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnODBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0YXhlRGVjZWl2ZXI6IHtuYW1lOiBcIkRlY2VpdmVyIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNCwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0XHJcblx0XHRzd29yZEZpcmU6IHtuYW1lOiBcIkZpcmUgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTUsIHZpZXdQb3J0SW1nOiAwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBENicsIHdlYXI6IDAuMDA4fSxcclxuXHRcdHN3b3JkQ2hhb3M6IHtuYW1lOiBcIkNoYW9zIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE2LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzQwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZERyYWdvbjoge25hbWU6IFwiRHJhZ29uc2xheWVyIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE3LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzUwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZFF1aWNrOiB7bmFtZTogXCJFbmlsbm8sIHRoZSBRdWlja3N3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE4LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRcclxuXHRcdHNsaW5nRXR0aW46IHtuYW1lOiBcIkV0dGluIFNsaW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE5LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVEMTInLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAncm9jaycsIHdlYXI6IDAuMDR9LFxyXG5cdFx0XHJcblx0XHRib3dQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBCb3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNUQ2JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Fycm93Jywgd2VhcjogMC4wMX0sXHJcblx0XHRib3dTbGVlcDoge25hbWU6IFwiU2xlZXAgQm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIxLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdhcnJvdycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0Ym93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIEJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzIwRDYnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGNyb3NzYm93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENyb3NzYm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMzBENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdib2x0Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHR3YW5kTGlnaHRuaW5nOiB7bmFtZTogXCJXYW5kIG9mIExpZ2h0bmluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0d2FuZEZpcmU6IHtuYW1lOiBcIldhbmQgb2YgRmlyZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0cGhhem9yOiB7bmFtZTogXCJQaGF6b3JcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjYsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdiZWFtJywgd2VhcjogMC4wMX0sXHJcblx0XHRcclxuXHRcdG15c3RpY1N3b3JkOiB7bmFtZTogXCJNeXN0aWMgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzQsIHZpZXdQb3J0SW1nOiA1LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnOEQzMicsIHdlYXI6IDAuMH0sXHJcblx0XHRcclxuXHRcdC8vIEFybW91clxyXG5cdFx0Ly9UT0RPOiBBZGQgYXJtb3IgZGVncmFkYXRpb25cclxuXHRcdGxlYXRoZXJJbXA6IHtuYW1lOiBcIkltcCBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNywgdHlwZTogJ2FybW91cicsIGRmczogJzI1RDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGxlYXRoZXJEcmFnb246IHtuYW1lOiBcIkRyYWdvbiBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyOCwgdHlwZTogJ2FybW91cicsIGRmczogJzMwRDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGNoYWluTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENoYWluIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjksIHR5cGU6ICdhcm1vdXInLCBkZnM6ICczNUQ4Jywgd2VhcjogMC4wM30sXHJcblx0XHRjaGFpbkR3YXJ2ZW46IHtuYW1lOiBcIkR3YXJ2ZW4gQ2hhaW4gbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMCwgdHlwZTogJ2FybW91cicsIGRmczogJzQwRDgnLCB3ZWFyOiAwLjAzfSxcclxuXHRcdHBsYXRlTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIFBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzEsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICc0NUQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0cGxhdGVFdGVybml1bToge25hbWU6IFwiRXRlcm5pdW0gUGxhdGUgbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMiwgdHlwZTogJ2FybW91cicsIGRmczogJzUwRDgnLCB3ZWFyOiAwLjAxNX0sXHJcblx0XHRcclxuXHRcdG15c3RpYzoge25hbWU6IFwiTXlzdGljIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMywgdHlwZTogJ2FybW91cicsIGRmczogJzIwRDgnLCBpbmRlc3RydWN0aWJsZTogdHJ1ZX0sXHJcblx0XHRcclxuXHRcdC8vIFNwZWxsIG1peGVzXHJcblx0XHRjdXJlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBDdXJlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAwLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1fSxcclxuXHRcdGhlYWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEhlYWxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDEwLCBwZXJjZW50OiAwLjJ9LFxyXG5cdFx0bGlnaHQ6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIExpZ2h0XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1LCBsaWdodFRpbWU6IDEwMDB9LFxyXG5cdFx0bWlzc2lsZToge25hbWU6IFwiU3BlbGxtaXggb2YgbWFnaWMgbWlzc2lsZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMzBENScsIG1hbmE6IDV9LFxyXG5cdFx0aWNlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSWNlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNCwgdHlwZTogJ21hZ2ljJywgc3RyOiAnNjVENScsIG1hbmE6IDIwfSxcclxuXHRcdHJlcGVsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBSZXBlbCBVbmRlYWRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDUsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGJsaW5rOiB7bmFtZTogXCJTcGVsbG1peCBvZiBCbGlua1wiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0ZmlyZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEZpcmViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA3LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICcxMDBENScsIG1hbmE6IDE1fSxcclxuXHRcdHByb3RlY3Rpb246IHtuYW1lOiBcIlNwZWxsbWl4IG9mIHByb3RlY3Rpb25cIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdtYWdpYycsIHByb3RUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdHRpbWU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRpbWUgU3RvcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOSwgdHlwZTogJ21hZ2ljJywgc3RvcFRpbWU6IDYwMCwgbWFuYTogMzB9LFxyXG5cdFx0c2xlZXA6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFNsZWVwXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ21hZ2ljJywgc2xlZXBUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdGppbng6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEppbnhcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDExLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHR0cmVtb3I6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRyZW1vclwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdGtpbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEtpbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc0MDBENScsIG1hbmE6IDI1fSxcclxuXHRcdFxyXG5cdFx0Ly8gQ29kZXhcclxuXHRcdGNvZGV4OiB7bmFtZTogXCJDb2RleCBvZiBVbHRpbWF0ZSBXaXNkb21cIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdjb2RleCd9LFxyXG5cdFx0XHJcblx0XHQvLyBEdW5nZW9uIGZlYXR1cmVzXHJcblx0XHRvcmI6IHtuYW1lOiBcIk9yYlwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRkZWFkVHJlZToge25hbWU6IFwiRGVhZCBUcmVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHRyZWU6IHtuYW1lOiBcIlRyZWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDMsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c3RhdHVlOiB7bmFtZTogXCJTdGF0dWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDQsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c2lnblBvc3Q6IHtuYW1lOiBcIlNpZ25wb3N0XCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA1LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHdlbGw6IHtuYW1lOiBcIldlbGxcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDYsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c21hbGxTaWduOiB7bmFtZTogXCJTaWduXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA3LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGxhbXA6IHtuYW1lOiBcIkxhbXBcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0ZmxhbWU6IHtuYW1lOiBcIkZsYW1lXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA5LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGNhbXBmaXJlOiB7bmFtZTogXCJDYW1wZmlyZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTAsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0YWx0YXI6IHtuYW1lOiBcIkFsdGFyXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRwcmlzb25lclRoaW5nOiB7bmFtZTogXCJTdG9ja3NcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGZvdW50YWluOiB7bmFtZTogXCJGb3VudGFpblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTMsIGFuaW1hdGlvbkxlbmd0aDogNCwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEl0ZW1CeUNvZGU6IGZ1bmN0aW9uKGl0ZW1Db2RlLCBzdGF0dXMpe1xyXG5cdFx0aWYgKCF0aGlzLml0ZW1zW2l0ZW1Db2RlXSkgdGhyb3cgXCJJbnZhbGlkIEl0ZW0gY29kZTogXCIgKyBpdGVtQ29kZTtcclxuXHRcdFxyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2l0ZW1Db2RlXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKCl7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZU1hcCA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTsgXHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVUZXJyYWluID0gZnVuY3Rpb24obWFwTWFuYWdlciwgR0wpe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9ICBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBNYW5hZ2VyLCBHTCk7IFxyXG5cdHRoaXMuYXNzZW1ibGVDZWlscyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUJsb2NrcyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZVNsb3BlcyhtYXBNYW5hZ2VyLCBHTCk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZVRpbGVzID0gZnVuY3Rpb24odGlsZXMpe1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0aWYgKHRpbGVzW2ldKVxyXG5cdFx0XHR0aWxlc1tpXS5fYyA9IGNpcmN1bGFyLnNldFNhZmUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmdldEVtcHR5R3JpZCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdyaWQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTA7eTw2NDt5Kyspe1xyXG5cdFx0Z3JpZFt5XSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgeD0wO3g8NjQ7eCsrKXtcclxuXHRcdFx0Z3JpZFt5XVt4XSA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBncmlkO1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5jb3B5VGlsZSA9IGZ1bmN0aW9uKHRpbGUpe1xyXG5cdHZhciByZXQgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0fTtcclxuXHRcclxuXHRmb3IgKHZhciBpIGluIHRpbGUpe1xyXG5cdFx0cmV0W2ldID0gdGlsZVtpXTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVGbG9vciA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9GbG9vcnMgPSBbXTtcclxuXHR2YXIgZmxvb3JzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuZil7XHJcblx0XHRcdFx0dmFyIGluZCA9IGZsb29yc0luZC5pbmRleE9mKHRpbGUuZik7XHJcblx0XHRcdFx0dmFyIGZsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Zmxvb3JzSW5kLnB1c2godGlsZS5mKTtcclxuXHRcdFx0XHRcdGZsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGZsLnRpbGUgPSB0aWxlLmY7XHJcblx0XHRcdFx0XHRmbC5yVGlsZSA9IHRpbGUucmY7XHJcblx0XHRcdFx0XHRvRmxvb3JzLnB1c2goZmwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0ZmwgPSBvRmxvb3JzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRmbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmYsIHk6IHl5fTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvRmxvb3JzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGZsb29yM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9GbG9vcnNbaV0sIFwiRlwiLCBHTCk7XHJcblx0XHRmbG9vcjNELnRleEluZCA9IG9GbG9vcnNbaV0udGlsZTtcclxuXHRcdGZsb29yM0QuclRleEluZCA9IG9GbG9vcnNbaV0uclRpbGU7XHJcblx0XHRmbG9vcjNELnR5cGUgPSBcIkZcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChmbG9vcjNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQ2VpbHMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQ2VpbHMgPSBbXTtcclxuXHR2YXIgY2VpbHNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5jKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gY2VpbHNJbmQuaW5kZXhPZih0aWxlLmMpO1xyXG5cdFx0XHRcdHZhciBjbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGNlaWxzSW5kLnB1c2godGlsZS5jKTtcclxuXHRcdFx0XHRcdGNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGNsLnRpbGUgPSB0aWxlLmM7XHJcblx0XHRcdFx0XHRvQ2VpbHMucHVzaChjbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjbCA9IG9DZWlsc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmMsIHk6IHRpbGUuY2h9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9DZWlscy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBjZWlsM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9DZWlsc1tpXSwgXCJDXCIsIEdMKTtcclxuXHRcdGNlaWwzRC50ZXhJbmQgPSBvQ2VpbHNbaV0udGlsZTtcclxuXHRcdGNlaWwzRC50eXBlID0gXCJDXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goY2VpbDNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQmxvY2tzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Jsb2NrcyA9IFtdO1xyXG5cdHZhciBibG9ja3NJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS53KXtcclxuXHRcdFx0XHR2YXIgaW5kID0gYmxvY2tzSW5kLmluZGV4T2YodGlsZS53KTtcclxuXHRcdFx0XHR2YXIgd2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRibG9ja3NJbmQucHVzaCh0aWxlLncpO1xyXG5cdFx0XHRcdFx0d2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0d2wudGlsZSA9IHRpbGUudztcclxuXHRcdFx0XHRcdG9CbG9ja3MucHVzaCh3bCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR3bCA9IG9CbG9ja3NbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2xbeV1beF0gPSB7dGlsZTogdGlsZS53LCB5OiB0aWxlLnksIGg6IHRpbGUuaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Jsb2Nrcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBibG9jazNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQmxvY2tzW2ldLCBcIkJcIiwgR0wpO1xyXG5cdFx0YmxvY2szRC50ZXhJbmQgPSBvQmxvY2tzW2ldLnRpbGU7XHJcblx0XHRibG9jazNELnR5cGUgPSBcIkJcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChibG9jazNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlU2xvcGVzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb1Nsb3BlcyA9IFtdO1xyXG5cdHZhciBzbG9wZXNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5zbCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IHNsb3Blc0luZC5pbmRleE9mKHRpbGUuc2wpO1xyXG5cdFx0XHRcdHZhciBzbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdHNsb3Blc0luZC5wdXNoKHRpbGUuc2wpO1xyXG5cdFx0XHRcdFx0c2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0c2wudGlsZSA9IHRpbGUuc2w7XHJcblx0XHRcdFx0XHRvU2xvcGVzLnB1c2goc2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2wgPSBvU2xvcGVzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRzbFt5XVt4XSA9IHt0aWxlOiB0aWxlLnNsLCB5OiB5eSwgZGlyOiB0aWxlLmRpcn07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b1Nsb3Blcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBzbG9wZTNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvU2xvcGVzW2ldLCBcIlNcIiwgR0wpO1xyXG5cdFx0c2xvcGUzRC50ZXhJbmQgPSBvU2xvcGVzW2ldLnRpbGU7XHJcblx0XHRzbG9wZTNELnR5cGUgPSBcIlNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChzbG9wZTNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlTWFwID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beF0gIT0gMCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS50aWxlc1tpbmRdO1xyXG5cdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mICYmIHRpbGUuZiA+IDEwMCl7XHJcblx0XHRcdFx0XHR0aWxlLnJmID0gdGlsZS5mIC0gMTAwO1xyXG5cdFx0XHRcdFx0dGlsZS5pc1dhdGVyID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGlsZS55ID0gLTAuMjtcclxuXHRcdFx0XHRcdHRpbGUuZnkgPSAtMC4yO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mIDwgMTAwKXtcclxuXHRcdFx0XHRcdHZhciB0MSwgdDIsIHQzLCB0NDtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4KzFdKSB0MSA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3ldW3grMV1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ktMV0pIHQyID0gKG1hcERhdGEubWFwW3ktMV1beF0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beC0xXSkgdDMgPSAobWFwRGF0YS5tYXBbeV1beC0xXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5KzFdKSB0NCA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3krMV1beF1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAodDEgfHwgdDIgfHwgdDMgfHwgdDQpe1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jb3BpZWRUaWxlc1tpbmRdKXtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5jb3BpZWRUaWxlc1tpbmRdID0gdGhpcy5jb3B5VGlsZSh0aWxlKTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHR0aWxlLnkgPSAtMTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlLmggKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXRpbGUudyl7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLncgPSAxMDtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUuaCA9IDE7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU9iamVjdHMgPSBmdW5jdGlvbihtYXBEYXRhKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1hcERhdGEub2JqZWN0cy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBvID0gbWFwRGF0YS5vYmplY3RzW2ldO1xyXG5cdFx0dmFyIHggPSBvLng7XHJcblx0XHR2YXIgeSA9IG8ueTtcclxuXHRcdHZhciB6ID0gby56O1xyXG5cdFx0XHJcblx0XHRzd2l0Y2ggKG8udHlwZSl7XHJcblx0XHRcdGNhc2UgXCJwbGF5ZXJcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIuaW5pdCh2ZWMzKHgsIHksIHopLCB2ZWMzKDAuMCwgby5kaXIgKiBNYXRoLlBJXzIsIDAuMCksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiaXRlbVwiOlxyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBNYXRoLm1pbigwLjMgKyAoTWF0aC5yYW5kb20oKSAqIDAuNyksIDEuMCk7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKG8uaXRlbSwgc3RhdHVzKTtcclxuXHRcdFx0XHR2YXIgaXRlbU9iamVjdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRcdFx0aXRlbU9iamVjdC5pbml0KHZlYzMoeCwgeSwgeiksIGl0ZW0sIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGl0ZW1PYmplY3QpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVuZW15XCI6XHJcblx0XHRcdFx0dmFyIGVuZW15ID0gRW5lbXlGYWN0b3J5LmdldEVuZW15KG8uZW5lbXkpO1xyXG5cdFx0XHRcdHZhciBlbmVteU9iamVjdCA9IG5ldyBFbmVteSgpO1xyXG5cdFx0XHRcdGVuZW15T2JqZWN0LmluaXQodmVjMyh4LCB5LCB6KSwgZW5lbXksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGVuZW15T2JqZWN0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdGFpcnNcIjpcclxuXHRcdFx0XHR2YXIgc3RhaXJzT2JqID0gbmV3IFN0YWlycygpO1xyXG5cdFx0XHRcdHN0YWlyc09iai5pbml0KHZlYzMoeCwgeSwgeiksIHRoaXMubWFwTWFuYWdlciwgby5kaXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChzdGFpcnNPYmopO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JcIjpcclxuXHRcdFx0XHR2YXIgeHggPSAoeCA8PCAwKSAtICgoby5kaXIgPT0gXCJIXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHp6ID0gKHogPDwgMCkgLSAoKG8uZGlyID09IFwiVlwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbenpdW3h4XS53O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5kb29ycy5wdXNoKG5ldyBEb29yKHRoaXMubWFwTWFuYWdlciwgdmVjMyh4LCB5LCB6KSwgby5kaXIsIFwiZG9vcjFcIiwgdGlsZSkpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07IiwidmFyIE1hcEFzc2VtYmxlciA9IHJlcXVpcmUoJy4vTWFwQXNzZW1ibGVyJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdnYW1lJyk7XHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdtYXBUb0RyYXcnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ01hcE1hbmFnZXInLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5nYW1lID0gZ2FtZTtcclxuXHR2YXIgR0wgPSBnYW1lLkdMLmN0eDtcclxuXHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdG9iamVjdC5tYXBUb0RyYXcgPSBbXTtcclxuXHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVUZXJyYWluKG9iamVjdCwgR0wpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01hcE1hbmFnZXInKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBNYW5hZ2VyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdNYXBNYW5hZ2VyJywgTWFwTWFuYWdlcik7XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZW5lcmF0ZU1hcCA9IGZ1bmN0aW9uKGRlcHRoKXtcclxuXHR2YXIgY29uZmlnID0ge1xyXG5cdFx0TUlOX1dJRFRIOiAxMCxcclxuXHRcdE1JTl9IRUlHSFQ6IDEwLFxyXG5cdFx0TUFYX1dJRFRIOiAyMCxcclxuXHRcdE1BWF9IRUlHSFQ6IDIwLFxyXG5cdFx0TEVWRUxfV0lEVEg6IDY0LFxyXG5cdFx0TEVWRUxfSEVJR0hUOiA2NCxcclxuXHRcdFNVQkRJVklTSU9OX0RFUFRIOiAzLFxyXG5cdFx0U0xJQ0VfUkFOR0VfU1RBUlQ6IDMvOCxcclxuXHRcdFNMSUNFX1JBTkdFX0VORDogNS84LFxyXG5cdFx0UklWRVJfU0VHTUVOVF9MRU5HVEg6IDEwLFxyXG5cdFx0TUlOX1JJVkVSX1NFR01FTlRTOiAxMCxcclxuXHRcdE1BWF9SSVZFUl9TRUdNRU5UUzogMjAsXHJcblx0XHRNSU5fUklWRVJTOiAzLFxyXG5cdFx0TUFYX1JJVkVSUzogNVxyXG5cdH07XHJcblx0dmFyIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IoY29uZmlnKTtcclxuXHR2YXIga3JhbWdpbmVFeHBvcnRlciA9IG5ldyBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyk7XHJcblx0dmFyIGdlbmVyYXRlZExldmVsID0gZ2VuZXJhdG9yLmdlbmVyYXRlTGV2ZWwoZGVwdGgsIHRoaXMuZ2FtZS51bmlxdWVSZWdpc3RyeSk7XHJcblx0XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHRyeXtcclxuXHRcdHdpbmRvdy5nZW5lcmF0ZWRMZXZlbCA9IChnZW5lcmF0ZWRMZXZlbC5sZXZlbCk7XHJcblx0XHR2YXIgbWFwRGF0YSA9IGtyYW1naW5lRXhwb3J0ZXIuZ2V0TGV2ZWwoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0d2luZG93Lm1hcERhdGEgPSAobWFwRGF0YSk7XHJcblx0XHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdFx0bWFwQXNzZW1ibGVyLmFzc2VtYmxlTWFwKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdH1jYXRjaCAoZSl7XHJcblx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHR9XHJcblx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcE5hbWUpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRodHRwLm9wZW4oJ0dFVCcsIGNwICsgJ21hcHMvJyArIG1hcE5hbWUgKyBcIi5qc29uXCIsIHRydWUpO1xyXG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgXHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICBcdFx0XHR0cnl7XHJcblx0XHRcdFx0bWFwRGF0YSA9IEpTT04ucGFyc2UoaHR0cC5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBtYXBBc3NlbWJsZXIgPSBuZXcgTWFwQXNzZW1ibGVyKCk7XHJcblx0XHRcdFx0bWFwQXNzZW1ibGVyLmFzc2VtYmxlTWFwKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcE0ubWFwID0gbWFwRGF0YS5tYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwTS53YXRlclRpbGVzID0gWzEwMSwgMTAzXTtcclxuXHRcdFx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdFx0XHR9Y2F0Y2ggKGUpe1xyXG5cdFx0XHRcdGlmIChlLm1lc3NhZ2Upe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlLnN0YWNrKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG1hcE0ubWFwID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9O1xyXG5cdGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIpO1xyXG5cdGh0dHAuc2VuZCgpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNXYXRlclRpbGUgPSBmdW5jdGlvbih0aWxlSWQpe1xyXG5cdHJldHVybiAodGhpcy53YXRlclRpbGVzLmluZGV4T2YodGlsZUlkKSAhPSAtMSk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1dhdGVyUG9zaXRpb24gPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC5mKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMuaXNXYXRlclRpbGUodC5mKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzTGF2YVBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQuZikgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLmlzTGF2YVRpbGUodC5mKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzTGF2YVRpbGUgPSBmdW5jdGlvbih0aWxlSWQpe1xyXG5cdHJldHVybiB0aWxlSWQgPT0gMTAzO1xyXG59O1xyXG5cclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmNoYW5nZVdhbGxUZXh0dXJlID0gZnVuY3Rpb24oeCwgeiwgdGV4dHVyZUlkKXtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciBiYXNlID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCFiYXNlLmNsb25lZCl7XHJcblx0XHR2YXIgbmV3VyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSBpbiBiYXNlKXtcclxuXHRcdFx0bmV3V1tpXSA9IGJhc2VbaV07XHJcblx0XHR9XHJcblx0XHRuZXdXLmNsb25lZCA9IHRydWU7XHJcblx0XHR0aGlzLm1hcFt6XVt4XSA9IG5ld1c7XHJcblx0XHRiYXNlID0gbmV3VztcclxuXHR9XHJcblx0XHJcblx0YmFzZS53ID0gdGV4dHVyZUlkO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0RG9vckF0ID0gZnVuY3Rpb24oeCwgeSwgeil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGRvb3IgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0aWYgKGRvb3Iud2FsbFBvc2l0aW9uLmVxdWFscyh4LCB5LCB6KSkgcmV0dXJuIGRvb3I7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VBdCA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmVxdWFscyhwb3NpdGlvbikpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VBdEdyaWQgPSBmdW5jdGlvbihwb3NpdGlvbil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5kZXN0cm95ZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IE1hdGguZmxvb3IodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeiA9IE1hdGguZmxvb3IodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4ID09IHBvc2l0aW9uLmEgJiYgeiA9PSBwb3NpdGlvbi5jKXtcclxuXHRcdFx0cmV0dXJuICh0aGlzLmluc3RhbmNlc1tpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0TmVhcmVzdENsZWFuSXRlbVRpbGUgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0XHJcblx0dmFyIG1pblggPSB4IC0gMTtcclxuXHR2YXIgbWluWiA9IHogLSAxO1xyXG5cdHZhciBtYXhYID0geCArIDE7XHJcblx0dmFyIG1heFogPSB6ICsgMTtcclxuXHRcclxuXHRmb3IgKHZhciB6ej1taW5aO3p6PD1tYXhaO3p6Kyspe1xyXG5cdFx0Zm9yICh2YXIgeHg9bWluWDt4eDw9bWF4WDt4eCsrKXtcclxuXHRcdFx0aWYgKHRoaXMuaXNTb2xpZCh4eCwgenosIDApIHx8IHRoaXMuaXNXYXRlclBvc2l0aW9uKHh4LCB6eikpe1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgcG9zID0gdmVjMyh4eCwgMCwgenopO1xyXG5cdFx0XHR2YXIgaW5zID0gdGhpcy5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRpZiAoIWlucyB8fCAoIWlucy5pdGVtICYmICFpbnMuc3RhaXJzKSl7XHJcblx0XHRcdFx0cmV0dXJuIHBvcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc05lYXJlc3QgPSBmdW5jdGlvbihwb3NpdGlvbiwgZGlzdGFuY2UsIGhhc1Byb3BlcnR5KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5kZXN0cm95ZWQpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGhhc1Byb3BlcnR5ICYmICF0aGlzLmluc3RhbmNlc1tpXVtoYXNQcm9wZXJ0eV0pIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IE1hdGguYWJzKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEgLSBwb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6ID0gTWF0aC5hYnModGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYyAtIHBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA8PSBkaXN0YW5jZSAmJiB6IDw9IGRpc3RhbmNlKXtcclxuXHRcdFx0cmV0LnB1c2godGhpcy5pbnN0YW5jZXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIHNlbGYpe1xyXG5cdHZhciBwID0gcG9zLmNsb25lKCk7XHJcblx0cC5hID0gcC5hICsgc3BkLmE7XHJcblx0cC5jID0gcC5jICsgc3BkLmI7XHJcblx0XHJcblx0dmFyIGluc3QgPSBudWxsLCBob3I7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdGlmICghaW5zIHx8IGlucy5kZXN0cm95ZWQgfHwgIWlucy5zb2xpZCkgY29udGludWU7XHJcblx0XHRpZiAoaW5zID09PSBzZWxmKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSBwLmEpO1xyXG5cdFx0dmFyIHp6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSBwLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPD0gMC44ICYmIHp6IDw9IDAuOCl7XHJcblx0XHRcdGlmIChwb3MuYSA8PSBpbnMucG9zaXRpb24uYSAtIDAuOCB8fCBwb3MuYSA+PSBpbnMucG9zaXRpb24uYSArIDAuOCkgaG9yID0gdHJ1ZTtcclxuXHRcdFx0ZWxzZSBpZiAocG9zLmMgPD0gaW5zLnBvc2l0aW9uLmMgLSAwLjggfHwgcG9zLmMgPj0gaW5zLnBvc2l0aW9uLmMgKyAwLjgpIGhvciA9IGZhbHNlOyAgXHJcblx0XHRcdGluc3QgPSBpbnM7XHJcblx0XHRcdGkgPSBsZW47XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGlmICghaW5zdCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0aWYgKGluc3QuaGVpZ2h0KXtcclxuXHRcdGlmIChwb3MuYiArIGggPCBpbnN0LnBvc2l0aW9uLmIpIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKHBvcy5iID49IGluc3QucG9zaXRpb24uYiArIGluc3QuaGVpZ2h0KSByZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0aWYgKGhvcikgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDtcclxuXHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUud2FsbEhhc05vcm1hbCA9IGZ1bmN0aW9uKHgsIHksIG5vcm1hbCl7XHJcblx0dmFyIHQxID0gdGhpcy5tYXBbeV1beF07XHJcblx0c3dpdGNoIChub3JtYWwpe1xyXG5cdFx0Y2FzZSAndSc6IHkgLT0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdsJzogeCAtPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ2QnOiB5ICs9IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAncic6IHggKz0gMTsgYnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdGlmICghdGhpcy5tYXBbeV0pIHJldHVybiB0cnVlO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiB0cnVlO1xyXG5cdHZhciB0MiA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdFxyXG5cdGlmICghdDIudykgcmV0dXJuIHRydWU7XHJcblx0aWYgKHQyLncgJiYgISh0Mi55ID09IHQxLnkgJiYgdDIuaCA9PSB0MS5oKSl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0RG9vck5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgZG9vciA9IHRoaXMuZ2V0RG9vckF0KHh4LCB5LCB6eik7XHJcblx0aWYgKGRvb3Ipe1xyXG5cdFx0dmFyIHh4eCA9IChwb3MuYSArIHNwZC5hKSAtIHh4O1xyXG5cdFx0dmFyIHp6eiA9IChwb3MuYyArIHNwZC5iKSAtIHp6O1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IChwb3MuYSAtIHh4KTtcclxuXHRcdHZhciB6ID0gKHBvcy5jIC0genopO1xyXG5cdFx0aWYgKGRvb3IuZGlyID09IFwiVlwiKXtcclxuXHRcdFx0aWYgKGRvb3IgJiYgZG9vci5pc1NvbGlkKCkpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0aWYgKHp6eiA+IDAuMjUgJiYgenp6IDwgMC43NSkgcmV0dXJuIG51bGw7XHJcblx0XHRcdGlmICh4IDwgMCB8fCB4ID4gMSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRlbHNlIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0aWYgKGRvb3IgJiYgZG9vci5pc1NvbGlkKCkpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdGlmICh4eHggPiAwLjI1ICYmIHh4eCA8IDAuNzUpIHJldHVybiBudWxsO1xyXG5cdFx0XHRpZiAoeiA8IDAgfHwgeiA+IDEpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdGVsc2UgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzU29saWQgPSBmdW5jdGlvbih4LCB6LCB5KXtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRpZiAoeSAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdGlmICh0LnkgKyB0LmggPD0geSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmNoZWNrQm94Q29sbGlzaW9uID0gZnVuY3Rpb24oYm94MSwgYm94Mil7XHJcblx0aWYgKGJveDEueDIgPCBib3gyLngxIHx8IGJveDEueDEgPiBib3gyLngyIHx8IGJveDEuejIgPCBib3gyLnoxIHx8IGJveDEuejEgPiBib3gyLnoyKXtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRCQm94V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBiV2lkdGgpe1xyXG5cdHZhciB4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgeiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgYkJveCA9IHtcclxuXHRcdHgxOiBwb3MuYSArIHNwZC5hIC0gYldpZHRoLFxyXG5cdFx0ejE6IHBvcy5jICsgc3BkLmIgLSBiV2lkdGgsXHJcblx0XHR4MjogcG9zLmEgKyBzcGQuYSArIGJXaWR0aCxcclxuXHRcdHoyOiBwb3MuYyArIHNwZC5iICsgYldpZHRoXHJcblx0fTtcclxuXHRcclxuXHR2YXIgeG0gPSB4IC0gMTtcclxuXHR2YXIgem0gPSB6IC0gMTtcclxuXHR2YXIgeE0gPSB4bSArIDM7XHJcblx0dmFyIHpNID0gem0gKyAzO1xyXG5cdFxyXG5cdHZhciB0O1xyXG5cdGZvciAodmFyIHp6PXptO3p6PHpNO3p6Kyspe1xyXG5cdFx0Zm9yICh2YXIgeHg9eG07eHg8eE07eHgrKyl7XHJcblx0XHRcdGlmICghdGhpcy5tYXBbenpdKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblx0XHRcdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSBjb250aW51ZTtcclxuXHRcdFx0XHJcblx0XHRcdHQgPSB0aGlzLm1hcFt6el1beHhdO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodC55K3QuaCA8PSB5KSBjb250aW51ZTtcclxuXHRcdFx0ZWxzZSBpZiAodC55ID4geSArIDAuNSkgY29udGludWU7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgYm94ID0ge1xyXG5cdFx0XHRcdHgxOiB4eCxcclxuXHRcdFx0XHR6MTogenosXHJcblx0XHRcdFx0eDI6IHh4ICsgMSxcclxuXHRcdFx0XHR6MjogenogKyAxXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5jaGVja0JveENvbGxpc2lvbihiQm94LCBib3gpKXtcclxuXHRcdFx0XHR2YXIgeHh4ID0gcG9zLmEgLSB4eDtcclxuXHRcdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgblYgPSB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAndScpIHx8IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdkJyk7XHJcblx0XHRcdFx0dmFyIG5IID0gdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3InKSB8fCB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh6enogPj0gLWJXaWR0aCAmJiB6enogPCAxICsgYldpZHRoICYmIG5IKXtcclxuXHRcdFx0XHRcdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHh4eCA+PSAtYldpZHRoICYmIHh4eCA8IDEgKyBiV2lkdGggJiYgblYpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRXYWxsTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIGluV2F0ZXIpe1xyXG5cdHZhciB0LCB0aDtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciB4eCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHp6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHRcclxuXHRpZiAoIXRoaXMubWFwW3p6XSkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IDApIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHQgPSB0aGlzLm1hcFt6el1beHhdO1xyXG5cdGkgPSA0O1xyXG5cdFxyXG5cdGlmICghdCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0dGggPSB0LmggLSAwLjM7XHJcblx0aWYgKGluV2F0ZXIpIHkgKz0gMC4zO1xyXG5cdGlmICh0LnNsKSB0aCArPSAwLjI7XHJcblx0XHJcblx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIHJldHVybiBudWxsO1xyXG5cdGlmICh0LnkrdGggPD0geSkgcmV0dXJuIG51bGw7XHJcblx0ZWxzZSBpZiAodC55ID4geSArIGgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdGlmICghdCkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHQudyl7XHJcblx0XHR2YXIgdGV4ID0gdGhpcy5nYW1lLmdldFRleHR1cmVCeUlkKHQudywgXCJ3YWxsXCIpO1xyXG5cdFx0aWYgKHRleC5pc1NvbGlkKXtcclxuXHRcdFx0dmFyIHh4eCA9IHBvcy5hIC0geHg7XHJcblx0XHRcdHZhciB6enogPSBwb3MuYyAtIHp6O1xyXG5cdFx0XHRpZiAodGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3UnKSAmJiB6enogPD0gMCl7IHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdkJykgJiYgenp6ID49IDEpeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmRvd247IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdsJykgJiYgeHh4IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdyJykgJiYgeHh4ID49IDEpeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnJpZ2h0OyB9XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKHQuZHcpe1xyXG5cdFx0dmFyIHgsIHosIHh4eCwgenp6LCBub3JtYWw7XHJcblx0XHR4ID0gcG9zLmEgKyBzcGQuYTtcclxuXHRcdHogPSBwb3MuYyArIHNwZC5iO1xyXG5cdFx0XHJcblx0XHRpZiAodC5hdyA9PSAwKXsgeHh4ID0gKHh4ICsgMSkgLSB4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBMZWZ0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDEpeyB4eHggPSB4IC0geHg7IHp6eiA9ICB6IC0geno7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy51cFJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDIpeyB4eHggPSB4IC0geHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duUmlnaHQ7IH1cclxuXHRcdGVsc2UgaWYgKHQuYXcgPT0gMyl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gICh6eiArIDEpIC0gejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmRvd25MZWZ0OyB9XHJcblx0XHRpZiAoenp6ID49IHh4eCl7XHJcblx0XHRcdHJldHVybiBub3JtYWw7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0WUZsb29yID0gZnVuY3Rpb24oeCwgeSwgbm9XYXRlcil7XHJcblx0dmFyIGlucyA9IHRoaXMuZ2V0SW5zdGFuY2VBdEdyaWQodmVjMyh4PDwwLDAseTw8MCkpO1xyXG5cdGlmIChpbnMgIT0gbnVsbCAmJiBpbnMuaGVpZ2h0KXtcclxuXHRcdHJldHVybiBpbnMucG9zaXRpb24uYiArIGlucy5oZWlnaHQ7XHJcblx0fVxyXG5cdFxyXG5cdHZhciB4eCA9IHggLSAoeCA8PCAwKTtcclxuXHR2YXIgeXkgPSB5IC0gKHkgPDwgMCk7XHJcblx0eCA9IHggPDwgMDtcclxuXHR5ID0geSA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbeV0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHR2YXIgdHQgPSB0Lnk7XHJcblx0XHJcblx0aWYgKHQudykgdHQgKz0gdC5oO1xyXG5cdGlmICh0LmYpIHR0ID0gdC5meTtcclxuXHRcclxuXHRpZiAoIW5vV2F0ZXIgJiYgdGhpcy5pc1dhdGVyVGlsZSh0LmYpKSB0dCAtPSAwLjM7XHJcblx0XHJcblx0aWYgKHQuc2wpe1xyXG5cdFx0aWYgKHQuZGlyID09IDApIHR0ICs9IHl5ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMSkgdHQgKz0geHggKiAwLjU7IGVsc2VcclxuXHRcdGlmICh0LmRpciA9PSAyKSB0dCArPSAoMS4wIC0geXkpICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMykgdHQgKz0gKDEuMCAtIHh4KSAqIDAuNTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHR0O1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZHJhd01hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHgsIHk7XHJcblx0eCA9IHRoaXMucGxheWVyLnBvc2l0aW9uLmE7XHJcblx0eSA9IHRoaXMucGxheWVyLnBvc2l0aW9uLmM7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm1hcFRvRHJhdy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBtdGQgPSB0aGlzLm1hcFRvRHJhd1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPCBtdGQuYm91bmRhcmllc1swXSB8fCB4ID4gbXRkLmJvdW5kYXJpZXNbMl0gfHwgeSA8IG10ZC5ib3VuZGFyaWVzWzFdIHx8IHkgPiBtdGQuYm91bmRhcmllc1szXSlcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHRcclxuXHRcdGlmIChtdGQudHlwZSA9PSBcIkJcIil7IC8vIEJsb2Nrc1xyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd0Jsb2NrKG10ZCwgbXRkLnRleEluZCk7XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJGXCIpeyAvLyBGbG9vcnNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0aWYgKHRoaXMuaXNXYXRlclRpbGUodHQpKXsgXHJcblx0XHRcdFx0dHQgPSAobXRkLnJUZXhJbmQpICsgKHRoaXMud2F0ZXJGcmFtZSA8PCAwKTtcclxuXHRcdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICd3YXRlcicpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICdmbG9vcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJDXCIpeyAvLyBDZWlsc1xyXG5cdFx0XHR2YXIgdHQgPSBtdGQudGV4SW5kO1xyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICdjZWlsJyk7XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJTXCIpeyAvLyBTbG9wZVxyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd1Nsb3BlKG10ZCwgbXRkLnRleEluZCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0UGxheWVySXRlbSA9IGZ1bmN0aW9uKGl0ZW1Db2RlKXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmIChpbnZbaV0uY29kZSA9PSBpdGVtQ29kZSl7XHJcblx0XHRcdHJldHVybiBpbnZbaV07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlUGxheWVySXRlbSA9IGZ1bmN0aW9uKGl0ZW1Db2RlLCBhbW91bnQpe1xyXG5cdHZhciBpbnYgPSB0aGlzLmdhbWUuaW52ZW50b3J5Lml0ZW1zO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW52Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ID0gaW52W2ldO1xyXG5cdFx0aWYgKGl0LmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRpZiAoLS1pdC5hbW91bnQgPT0gMCl7XHJcblx0XHRcdFx0aW52LnNwbGljZShpLDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuYWRkTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpe1xyXG5cdHRoaXMuZ2FtZS5jb25zb2xlLmFkZFNGTWVzc2FnZSh0ZXh0KTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUudGltZVN0b3ApIHJldHVybjtcclxuXHRcclxuXHR0aGlzLndhdGVyRnJhbWUgKz0gMC4xO1xyXG5cdGlmICh0aGlzLndhdGVyRnJhbWUgPj0gMikgdGhpcy53YXRlckZyYW1lID0gMDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc1RvRHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5vcmRlckluc3RhbmNlcyA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRpZiAoaW5zLmRlc3Ryb3llZCl7XHJcblx0XHRcdHRoaXMuaW5zdGFuY2VzLnNwbGljZShpLCAxKTtcclxuXHRcdFx0aS0tO1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIGRpc3QgPSB4eCAqIHh4ICsgenogKiB6ejtcclxuXHRcdHZhciBhZGRlZCA9IGZhbHNlO1xyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49dGhpcy5vcmRlckluc3RhbmNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdGlmIChkaXN0ID4gdGhpcy5vcmRlckluc3RhbmNlc1tqXS5kaXN0KXtcclxuXHRcdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShqLDAse19jOiBjaXJjdWxhci5yZWdpc3RlcignT3JkZXJJbnN0YW5jZScpLCBpbnM6IGlucywgZGlzdDogZGlzdH0pO1xyXG5cdFx0XHRcdGFkZGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRqID0gamxlbjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoIWFkZGVkKXtcclxuXHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5wdXNoKHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNBdCA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAoTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYSkgPT0geCAmJiBNYXRoLnJvdW5kKGlucy5wb3NpdGlvbi5jKSA9PSB6KVxyXG5cdFx0XHRyZXQucHVzaChpbnMpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwID09IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR0aGlzLmRyYXdNYXAoKTtcclxuXHRcclxuXHR0aGlzLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5vcmRlckluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLm9yZGVySW5zdGFuY2VzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRpbnMgPSBpbnMuaW5zO1xyXG5cdFx0XHJcblx0XHRpZiAoaW5zLmRlc3Ryb3llZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlucy5sb29wKCk7XHJcblx0fVxyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHp6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4ID4gNiB8fCB6eiA+IDYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdFx0dGhpcy5nYW1lLmRyYXdEb29yKGlucy5wb3NpdGlvbi5hLCBpbnMucG9zaXRpb24uYiwgaW5zLnBvc2l0aW9uLmMsIGlucy5yb3RhdGlvbiwgaW5zLnRleHR1cmVDb2RlKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcldhbGwoaW5zLmRvb3JQb3NpdGlvbi5hLCBpbnMuZG9vclBvc2l0aW9uLmIsIGlucy5kb29yUG9zaXRpb24uYywgaW5zLndhbGxUZXh0dXJlLCAoaW5zLmRpciA9PSBcIlZcIikpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLnBsYXllci5sb29wKCk7XHJcblx0aWYgKHRoaXMucG9pc29uQ291bnQgPiAwKXtcclxuXHRcdHRoaXMucG9pc29uQ291bnQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5nYW1lLnBsYXllci5wb2lzb25lZCAmJiB0aGlzLnBvaXNvbkNvdW50ID09IDApe1xyXG5cdFx0dGhpcy5wbGF5ZXIucmVjZWl2ZURhbWFnZSgxMCk7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50ID0gMTAwO1xyXG5cdH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bWFrZVBlcnNwZWN0aXZlOiBmdW5jdGlvbihmb3YsIGFzcGVjdFJhdGlvLCB6TmVhciwgekZhcil7XHJcblx0XHR2YXIgekxpbWl0ID0gek5lYXIgKiBNYXRoLnRhbihmb3YgKiBNYXRoLlBJIC8gMzYwKTtcclxuXHRcdHZhciBBID0gLSh6RmFyICsgek5lYXIpIC8gKHpGYXIgLSB6TmVhcik7XHJcblx0XHR2YXIgQiA9IC0yICogekZhciAqIHpOZWFyIC8gKHpGYXIgLSB6TmVhcik7XHJcblx0XHR2YXIgQyA9ICgyICogek5lYXIpIC8gKHpMaW1pdCAqIGFzcGVjdFJhdGlvICogMik7XHJcblx0XHR2YXIgRCA9ICgyICogek5lYXIpIC8gKDIgKiB6TGltaXQpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRDLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCBELCAwLCAwLFxyXG5cdFx0XHQwLCAwLCBBLC0xLFxyXG5cdFx0XHQwLCAwLCBCLCAwXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bmV3TWF0cml4OiBmdW5jdGlvbihjb2xzLCByb3dzKXtcclxuXHRcdHZhciByZXQgPSBuZXcgQXJyYXkocm93cyk7XHJcblx0XHRmb3IgKHZhciBpPTA7aTxyb3dzO2krKyl7XHJcblx0XHRcdHJldFtpXSA9IG5ldyBBcnJheShjb2xzKTtcclxuXHRcdFx0Zm9yICh2YXIgaj0wO2o8Y29scztqKyspe1xyXG5cdFx0XHRcdHJldFtpXVtqXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldElkZW50aXR5OiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG1ha2VUcmFuc2Zvcm06IGZ1bmN0aW9uKG9iamVjdCwgY2FtZXJhKXtcclxuXHRcdC8vIFN0YXJ0cyB3aXRoIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHRcdHZhciB0TWF0ID0gdGhpcy5nZXRJZGVudGl0eSgpO1xyXG5cdFx0XHJcblx0XHQvLyBSb3RhdGUgdGhlIG9iamVjdFxyXG5cdFx0Ly8gVW50aWwgSSBmaW5kIHRoZSBuZWVkIHRvIHJvdGF0ZSBhbiBvYmplY3QgaXRzZWxmIGl0IHJlYW1pbnMgYXMgY29tbWVudFxyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWChvYmplY3Qucm90YXRpb24uYSkpO1xyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkob2JqZWN0LnJvdGF0aW9uLmIpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvbloob2JqZWN0LnJvdGF0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gSWYgdGhlIG9iamVjdCBpcyBhIGJpbGxib2FyZCwgdGhlbiBtYWtlIGl0IGxvb2sgdG8gdGhlIGNhbWVyYVxyXG5cdFx0aWYgKG9iamVjdC5pc0JpbGxib2FyZCAmJiAhb2JqZWN0Lm5vUm90YXRlKSB0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWSgtKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSkpO1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlIHRoZSBvYmplY3QgdG8gaXRzIHBvc2l0aW9uXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKG9iamVjdC5wb3NpdGlvbi5hLCBvYmplY3QucG9zaXRpb24uYiwgb2JqZWN0LnBvc2l0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IGluIHJlbGF0aW9uIHRvIHRoZSBjYW1lcmFcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0VHJhbnNsYXRpb24oLWNhbWVyYS5wb3NpdGlvbi5hLCAtY2FtZXJhLnBvc2l0aW9uLmIgLSBjYW1lcmEuY2FtZXJhSGVpZ2h0LCAtY2FtZXJhLnBvc2l0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3QgaW4gdGhlIGNhbWVyYSBkaXJlY3Rpb24gKEkgZG9uJ3QgcmVhbGx5IHJvdGF0ZSBpbiB0aGUgWiBheGlzKVxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoY2FtZXJhLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25YKC1jYW1lcmEucm90YXRpb24uYSkpO1xyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWigtY2FtZXJhLnJvdGF0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRNYXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUcmFuc2xhdGlvbjogZnVuY3Rpb24oeCwgeSwgeil7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCAxLCAwLCAwLFxyXG5cdFx0XHQwLCAwLCAxLCAwLFxyXG5cdFx0XHR4LCB5LCB6LCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25YOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCBDLCBTLCAwLFxyXG5cdFx0XHQwLC1TLCBDLCAwLFxyXG5cdFx0XHQwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25ZOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQgQywgMCwgUywgMCxcclxuXHRcdFx0IDAsIDEsIDAsIDAsXHJcblx0XHRcdC1TLCAwLCBDLCAwLFxyXG5cdFx0XHQgMCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWjogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIFMsIDAsIDAsXHJcblx0XHRcdC1TLCBDLCAwLCAwLFxyXG5cdFx0XHQgMCwgMCwgMSwgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtaW5pTWF0cml4TXVsdDogZnVuY3Rpb24ocm93LCBjb2x1bW4pe1xyXG5cdFx0dmFyIHJlc3VsdCA9IDA7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXJvdy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0cmVzdWx0ICs9IHJvd1tpXSAqIGNvbHVtbltpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9LFxyXG5cdFxyXG5cdG1hdHJpeE11bHRpcGxpY2F0aW9uOiBmdW5jdGlvbihtYXRyaXhBLCBtYXRyaXhCKXtcclxuXHRcdHZhciBBMSA9IFttYXRyaXhBWzBdLCAgbWF0cml4QVsxXSwgIG1hdHJpeEFbMl0sICBtYXRyaXhBWzNdXTtcclxuXHRcdHZhciBBMiA9IFttYXRyaXhBWzRdLCAgbWF0cml4QVs1XSwgIG1hdHJpeEFbNl0sICBtYXRyaXhBWzddXTtcclxuXHRcdHZhciBBMyA9IFttYXRyaXhBWzhdLCAgbWF0cml4QVs5XSwgIG1hdHJpeEFbMTBdLCBtYXRyaXhBWzExXV07XHJcblx0XHR2YXIgQTQgPSBbbWF0cml4QVsxMl0sIG1hdHJpeEFbMTNdLCBtYXRyaXhBWzE0XSwgbWF0cml4QVsxNV1dO1xyXG5cdFx0XHJcblx0XHR2YXIgQjEgPSBbbWF0cml4QlswXSwgbWF0cml4Qls0XSwgbWF0cml4Qls4XSwgIG1hdHJpeEJbMTJdXTtcclxuXHRcdHZhciBCMiA9IFttYXRyaXhCWzFdLCBtYXRyaXhCWzVdLCBtYXRyaXhCWzldLCAgbWF0cml4QlsxM11dO1xyXG5cdFx0dmFyIEIzID0gW21hdHJpeEJbMl0sIG1hdHJpeEJbNl0sIG1hdHJpeEJbMTBdLCBtYXRyaXhCWzE0XV07XHJcblx0XHR2YXIgQjQgPSBbbWF0cml4QlszXSwgbWF0cml4Qls3XSwgbWF0cml4QlsxMV0sIG1hdHJpeEJbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIG1tbSA9IHRoaXMubWluaU1hdHJpeE11bHQ7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRtbW0oQTEsIEIxKSwgbW1tKEExLCBCMiksIG1tbShBMSwgQjMpLCBtbW0oQTEsIEI0KSxcclxuXHRcdFx0bW1tKEEyLCBCMSksIG1tbShBMiwgQjIpLCBtbW0oQTIsIEIzKSwgbW1tKEEyLCBCNCksXHJcblx0XHRcdG1tbShBMywgQjEpLCBtbW0oQTMsIEIyKSwgbW1tKEEzLCBCMyksIG1tbShBMywgQjQpLFxyXG5cdFx0XHRtbW0oQTQsIEIxKSwgbW1tKEE0LCBCMiksIG1tbShBNCwgQjMpLCBtbW0oQTQsIEI0KVxyXG5cdFx0XTtcclxuXHR9XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWlzc2lsZScsICdiaWxsYm9hcmQnKTtcclxuY2lyY3VsYXIuc2V0UmV2aXZlcignTWlzc2lsZScsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSkge1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tvYmplY3Quc3ViSW1nXTtcclxuXHRcclxufSk7XHJcblxyXG5mdW5jdGlvbiBNaXNzaWxlKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNaXNzaWxlJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWlzc2lsZTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnTWlzc2lsZScsIE1pc3NpbGUpO1xyXG5cclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgcm90YXRpb24sIHR5cGUsIHRhcmdldCwgbWFwTWFuYWdlcil7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLnR5cGUgPSB0eXBlO1xyXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5zb2xpZCA9IGZhbHNlO1xyXG5cdHRoaXMuc3RyID0gMDtcclxuXHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdHRoaXMubWlzc2VkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy52c3BlZWQgPSAwO1xyXG5cdHRoaXMuZ3Jhdml0eSA9IDA7XHJcblx0XHJcblx0dmFyIHN1YkltZyA9IDA7XHJcblx0c3dpdGNoICh0eXBlKXtcclxuXHRcdGNhc2UgJ3NsaW5nJzogXHJcblx0XHRcdHN1YkltZyA9IDA7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0XHR0aGlzLmdyYXZpdHkgPSAwLjAwNTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDE7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdjcm9zc2Jvdyc6IFxyXG5cdFx0XHRzdWJJbWcgPSAyOyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMztcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnbWFnaWNNaXNzaWxlJzogXHJcblx0XHRcdHN1YkltZyA9IDM7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC40O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdpY2VCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNDsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ZpcmVCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNTsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA2OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLnN1YkltZyA9IHN1YkltZztcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gJ2JvbHRzJztcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBtYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnNbc3ViSW1nXTtcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmNoZWNrQ29sbGlzaW9uID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbWFwID0gdGhpcy5tYXBNYW5hZ2VyLm1hcDtcclxuXHRpZiAodGhpcy5wb3NpdGlvbi5hIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmMgPCAwIHx8IHRoaXMucG9zaXRpb24uYSA+PSBtYXBbMF0ubGVuZ3RoIHx8IHRoaXMucG9zaXRpb24uYyA+PSBtYXAubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIHggPSB0aGlzLnBvc2l0aW9uLmEgPDwgMDtcclxuXHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiArIDAuNTtcclxuXHR2YXIgeiA9IHRoaXMucG9zaXRpb24uYyA8PCAwO1xyXG5cdHZhciB0aWxlID0gbWFwW3pdW3hdO1xyXG5cdFxyXG5cdGlmICh0aWxlLncgfHwgdGlsZS53ZCB8fCB0aWxlLndkKXtcclxuXHRcdGlmICghKHRpbGUueSArIHRpbGUuaCA8IHkgfHwgdGlsZS55ID4geSkpe1xyXG5cdFx0XHQgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAoeSA8IHRpbGUuZnkgfHwgeSA+IHRpbGUuY2gpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgaW5zLCBkZnM7XHJcblx0aWYgKHRoaXMudGFyZ2V0ID09ICdlbmVteScpe1xyXG5cdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZXNOZWFyZXN0KHRoaXMucG9zaXRpb24sIDAuNSwgJ2VuZW15Jyk7XHJcblx0XHR2YXIgZGlzdCA9IDEwMDAwO1xyXG5cdFx0aWYgKGluc3RhbmNlcy5sZW5ndGggPiAxKXtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0dmFyIHh4ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5hIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0XHRcdHZhciB5eSA9IE1hdGguYWJzKHRoaXMucG9zaXRpb24uYyAtIGluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgZCA9IHh4ICogeHggKyB5eSAqIHl5O1xyXG5cdFx0XHRcdGlmIChkIDwgZGlzdCl7XHJcblx0XHRcdFx0XHRkaXN0ID0gZDtcclxuXHRcdFx0XHRcdGlucyA9IGluc3RhbmNlc1tpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmIChpbnN0YW5jZXMubGVuZ3RoID09IDEpe1xyXG5cdFx0XHRpbnMgPSBpbnN0YW5jZXNbMF07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKGlucy5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdH1lbHNle1xyXG5cdFx0aW5zID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgodGhpcy5zdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdGlmICh0aGlzLm1pc3NlZCl7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZG1nICE9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoZG1nICsgXCIgZGFtYWdlXCIpOyAvLyBUT0RPOiBSZXBsYWNlIHdpdGggcG9wdXAgb3ZlciBpbnNcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHRpbnMucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdibG9jaycpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnZzcGVlZCArPSB0aGlzLmdyYXZpdHk7XHJcblx0XHJcblx0dmFyIHhUbyA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdHZhciB5VG8gPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmEpICogdGhpcy5zcGVlZCAtIHRoaXMudnNwZWVkO1xyXG5cdHZhciB6VG8gPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMuc3BlZWQ7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbi5zdW0odmVjMyh4VG8sIHlUbywgelRvKSk7XHJcblx0XHJcblx0aWYgKCF0aGlzLmNoZWNrQ29sbGlzaW9uKCkpe1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRub3JtYWxzOiB7XHJcblx0XHRkb3duOiAgdmVjMiggMCwgMSksXHJcblx0XHRyaWdodDogdmVjMiggMSwgMCksXHJcblx0XHR1cDogICAgdmVjMiggMCwtMSksXHJcblx0XHRsZWZ0OiAgdmVjMigtMSwgMCksXHJcblx0XHRcclxuXHRcdHVwUmlnaHQ6ICB2ZWMyKE1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgLU1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHR1cExlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93blJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHRkb3duTGVmdDogIHZlYzIoLU1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKVxyXG5cdH0sXHJcblx0XHJcblx0Y3ViZTogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgbGlnaHQsIC8qW3UsbCxkLHJdKi8gZmFjZXMpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtdO1xyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0aWYgKCFmYWNlcykgZmFjZXMgPSBbMSwxLDEsMV07XHJcblx0XHRpZiAoZmFjZXNbMF0peyAvLyBVcCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCBcdCB3LCAgMCwgLWwsXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDEsMSwxLDEpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzFdKXsgLy8gTGVmdCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHRcdCB3LCAgMCwgLWwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbMl0peyAvLyBEb3duIEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1szXSl7IC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwLDAsMCwwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdFxyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0XHQwLjAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0Zmxvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGNlaWw6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDIsIDEsIDEsIDIsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3JXYWxsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgKiAwLjA1O1xyXG5cdFx0XHJcblx0XHR2YXIgdzIgPSAtc2l6ZS5hICogMC4yNTtcclxuXHRcdHZhciB3MyA9IHNpemUuYSAqIDAuMjU7XHJcblx0XHRcclxuXHRcdHZhciBoMiA9IDEgLSBzaXplLmIgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIFJpZ2h0IHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdC13LCAgMCwgIGwsXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTGVmdCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgIDAsIC1sLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTWlkZGxlIHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgaDIsIC1sLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgaDIsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gQm90dG9tIEZhY2VcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAgbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDY7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4yNSwgdHksXHJcblx0XHRcdFx0MC4yNSwwLjAsXHJcblx0XHRcdFx0MC4wMCwgdHksXHJcblx0XHRcdFx0MC4wMCwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC41LDEuMCxcclxuXHRcdFx0XHQwLjUsMC43NSxcclxuXHRcdFx0XHQwLjAsMS4wLFxyXG5cdFx0XHRcdDAuMCwwLjc1XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDM2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0KXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdCAwLCAgaCwgIGwsXHJcblx0XHRcdCAwLCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2godHgsIHR5LCB0eCwwLjAsIDAuMCwgdHksIDAuMCwwLjApO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goMC4wLCB0eSwgMC4wLDAuMCwgdHgsIHR5LCB0eCwwLjApO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjAxLDAuMDEsXHJcblx0XHRcdFx0MC4wMSwwLjAsXHJcblx0XHRcdFx0MC4wICwwLjAxLFxyXG5cdFx0XHRcdDAuMCAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDE2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRyZXR1cm4gZG9vcjtcclxuXHR9LFxyXG5cdFxyXG5cdGJpbGxib2FyZDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgIGgsICAwLFxyXG5cdFx0XHQtdywgIGgsICAwLFxyXG5cdFx0XHQgdywgIDAsICAwLFxyXG5cdFx0XHQtdywgIDAsICAwLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj00O2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdF07XHJcblx0XHRcdFx0IFxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJpbGwgPSAgdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRiaWxsLmlzQmlsbGJvYXJkID0gdHJ1ZTtcclxuXHRcdHJldHVybiBiaWxsO1xyXG5cdH0sXHJcblx0XHJcblx0c2xvcGU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGRpcil7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IC8vIEZyb250IFNsb3BlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdCAvLyBSaWdodCBTaWRlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgLWwsXHJcblx0XHRcdCBcclxuXHRcdFx0IC8vIExlZnQgU2lkZVxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjAsICBsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpZiAoZGlyICE9IDApe1xyXG5cdFx0XHR2YXIgYW5nID0gTWF0aC5kZWdUb1JhZChkaXIgKiAtOTApO1xyXG5cdFx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8dmVydGV4Lmxlbmd0aDtpKz0zKXtcclxuXHRcdFx0XHR2YXIgYSA9IHZlcnRleFtpXSAqIEMgLSB2ZXJ0ZXhbaSsyXSAqIFM7XHJcblx0XHRcdFx0dmFyIGIgPSB2ZXJ0ZXhbaV0gKiBTICsgdmVydGV4W2krMl0gKiBDO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZlcnRleFtpXSA9IGE7XHJcblx0XHRcdFx0dmVydGV4W2krMl0gPSBiO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMsIDQsIDUsIDYsIDcsIDgsIDkpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgMC4wLFxyXG5cdFx0XHQwLjAsICB0eSxcclxuXHRcdFx0XHJcblx0XHRcdCB0eCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDAsMCwwLDAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGFzc2VtYmxlT2JqZWN0OiBmdW5jdGlvbihtYXBEYXRhLCBvYmplY3RUeXBlLCBnbCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVjdCA9IFs2NCw2NCwwLDBdOyAvLyBbeDEseTEseDIseTJdXHJcblx0XHRmb3IgKHZhciB5PTAseWxlbj1tYXBEYXRhLmxlbmd0aDt5PHlsZW47eSsrKXtcclxuXHRcdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YVt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdFx0dmFyIHQgPSAobWFwRGF0YVt5XVt4XS50aWxlKT8gbWFwRGF0YVt5XVt4XS50aWxlIDogMDtcclxuXHRcdFx0XHRpZiAodCAhPSAwKXtcclxuXHRcdFx0XHRcdC8vIFNlbGVjdGluZyBib3VuZGFyaWVzIG9mIHRoZSBtYXAgcGFydFxyXG5cdFx0XHRcdFx0cmVjdFswXSA9IE1hdGgubWluKHJlY3RbMF0sIHggLSA2KTtcclxuXHRcdFx0XHRcdHJlY3RbMV0gPSBNYXRoLm1pbihyZWN0WzFdLCB5IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzJdID0gTWF0aC5tYXgocmVjdFsyXSwgeCArIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFszXSA9IE1hdGgubWF4KHJlY3RbM10sIHkgKyA2KTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZ2O1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJGXCIpeyB2diA9IHRoaXMuZmxvb3IodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gRmxvb3JcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQ1wiKXsgdnYgPSB0aGlzLmNlaWwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gQ2VpbFxyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJCXCIpeyB2diA9IHRoaXMuY3ViZSh2ZWMzKDEuMCxtYXBEYXRhW3ldW3hdLmgsMS4wKSwgdmVjMigxLjAsbWFwRGF0YVt5XVt4XS5oKSwgZ2wsIGZhbHNlLCB0aGlzLmdldEN1YmVGYWNlcyhtYXBEYXRhLCB4LCB5KSk7IH1lbHNlIC8vIEJsb2NrXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIlNcIil7IHZ2ID0gdGhpcy5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wsIG1hcERhdGFbeV1beF0uZGlyKTsgfSAvLyBTbG9wZVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgdmVydGV4T2ZmID0gdmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRcdFx0XHR4eCA9IHZ2LnZlcnRpY2VzW2ldICsgeCArIDAuNTtcclxuXHRcdFx0XHRcdFx0eXkgPSB2di52ZXJ0aWNlc1tpKzFdICsgbWFwRGF0YVt5XVt4XS55O1xyXG5cdFx0XHRcdFx0XHR6eiA9IHZ2LnZlcnRpY2VzW2krMl0gKyB5ICsgMC41O1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGljZXMucHVzaCh4eCwgeXksIHp6KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di5pbmRpY2VzLmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZ2LmluZGljZXNbaV0gKyB2ZXJ0ZXhPZmYpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnRleENvb3Jkcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdHRleENvb3Jkcy5wdXNoKHZ2LnRleENvb3Jkc1tpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuZGFya1ZlcnRleC5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCh2di5kYXJrVmVydGV4W2ldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmVjcmVhdGUgYnVmZmVyIGRhdGEgb24gZGVzZXJpYWxpemF0aW9uXHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YnVmZmVyLmJvdW5kYXJpZXMgPSByZWN0O1xyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdFxyXG5cdGdldEN1YmVGYWNlczogZnVuY3Rpb24obWFwLCB4LCB5KXtcclxuXHRcdHZhciByZXQgPSBbMSwxLDEsMV07XHJcblx0XHR2YXIgdGlsZSA9IG1hcFt5XVt4XTtcclxuXHRcdFxyXG5cdFx0Ly8gVXAgRmFjZVxyXG5cdFx0aWYgKHkgPiAwICYmIG1hcFt5LTFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5LTFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzBdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gTGVmdCBmYWNlXHJcblx0XHRpZiAoeCA8IDYzICYmIG1hcFt5XVt4KzFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4KzFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzFdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gRG93biBmYWNlXHJcblx0XHRpZiAoeSA8IDYzICYmIG1hcFt5KzFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5KzFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzJdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gUmlnaHQgZmFjZVxyXG5cdFx0aWYgKHggPiAwICYmIG1hcFt5XVt4LTFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4LTFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzNdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0T2JqZWN0V2l0aFByb3BlcnRpZXM6IGZ1bmN0aW9uKHZlcnRleEJ1ZmZlciwgaW5kZXhCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcil7XHJcblx0XHR2YXIgb2JqID0ge1xyXG5cdFx0XHRyb3RhdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0cG9zaXRpb246IHZlYzMoMCwgMCwgMCksXHJcblx0XHRcdHZlcnRleEJ1ZmZlcjogdmVydGV4QnVmZmVyLCBcclxuXHRcdFx0aW5kaWNlc0J1ZmZlcjogaW5kZXhCdWZmZXIsIFxyXG5cdFx0XHR0ZXhCdWZmZXI6IHRleEJ1ZmZlcixcclxuXHRcdFx0ZGFya0J1ZmZlcjogZGFya0J1ZmZlclxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9LFxyXG5cdFxyXG5cdGNyZWF0ZTNET2JqZWN0OiBmdW5jdGlvbihnbCwgYmFzZU9iamVjdCl7XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LnZlcnRpY2VzLmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShiYXNlT2JqZWN0LnRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGJhc2VPYmplY3QuaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC5kYXJrVmVydGV4Lmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgYnVmZmVyID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRcclxuXHRcdHJldHVybiBidWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHR0cmFuc2xhdGVPYmplY3Q6IGZ1bmN0aW9uKG9iamVjdCwgdHJhbnNsYXRpb24pe1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3QudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaV0gKz0gdHJhbnNsYXRpb24uYTtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMV0gKz0gdHJhbnNsYXRpb24uYjtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMl0gKz0gdHJhbnNsYXRpb24uYztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iamVjdDtcclxuXHR9LFxyXG5cdFxyXG5cdGZ1emVPYmplY3RzOiBmdW5jdGlvbihvYmplY3RMaXN0KXtcclxuXHRcdHZhciB2ZXJ0aWNlcyA9IFtdO1xyXG5cdFx0dmFyIHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dmFyIGluZGljZXMgPSBbXTtcclxuXHRcdHZhciBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcclxuXHRcdHZhciBpbmRleENvdW50ID0gMDtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49b2JqZWN0TGlzdC5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0dmFyIG9iaiA9IG9iamVjdExpc3RbaV07XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudmVydGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2gob2JqLnZlcnRpY2VzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLnRleENvb3Jkcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dGV4Q29vcmRzLnB1c2gob2JqLnRleENvb3Jkc1tqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai5pbmRpY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRpbmRpY2VzLnB1c2gob2JqLmluZGljZXNbal0gKyBpbmRleENvdW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmRhcmtWZXJ0ZXgubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaChvYmouZGFya1ZlcnRleFtqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGluZGV4Q291bnQgKz0gb2JqLnZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRpY2VzLCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRsb2FkM0RNb2RlbDogZnVuY3Rpb24obW9kZWxGaWxlLCBnbCl7XHJcblx0XHR2YXIgbW9kZWwgPSB7cmVhZHk6IGZhbHNlfTtcclxuXHRcdFxyXG5cdFx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0XHRodHRwLm9wZW4oXCJHRVRcIiwgY3AgKyBcIm1vZGVscy9cIiArIG1vZGVsRmlsZSArIFwiLm9iaj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0XHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuXHRcdFx0XHR2YXIgbGluZXMgPSBodHRwLnJlc3BvbnNlVGV4dC5zcGxpdChcIlxcblwiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdmVydGljZXMgPSBbXSwgdGV4Q29vcmRzID0gW10sIHRyaWFuZ2xlcyA9IFtdLCB2ZXJ0ZXhJbmRleCA9IFtdLCB0ZXhJbmRpY2VzID0gW10sIGluZGljZXMgPSBbXSwgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHRcdHZhciB3b3JraW5nO1xyXG5cdFx0XHRcdHZhciB0ID0gZmFsc2U7XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1saW5lcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdHZhciBsID0gbGluZXNbaV0udHJpbSgpO1xyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCJcIil7IGNvbnRpbnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHZlcnRpY2VzXCIpeyB3b3JraW5nID0gdmVydGljZXM7IHQgPSBmYWxzZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB0ZXhDb29yZHNcIil7IHdvcmtpbmcgPSB0ZXhDb29yZHM7IHQgPSB0cnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRyaWFuZ2xlc1wiKXsgd29ya2luZyA9IHRyaWFuZ2xlczsgdCA9IGZhbHNlOyB9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YXIgcGFyYW1zID0gbC5zcGxpdChcIiBcIik7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGo9MCxqbGVuPXBhcmFtcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFpc05hTihwYXJhbXNbal0pKXtcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtc1tqXSA9IHBhcnNlRmxvYXQocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0KSB3b3JraW5nLnB1c2gocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAodCkgd29ya2luZy5wdXNoKHBhcmFtcyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB1c2VkVmVyID0gW107XHJcblx0XHRcdFx0dmFyIHVzZWRJbmQgPSBbXTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRyaWFuZ2xlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGlmICh1c2VkVmVyLmluZGV4T2YodHJpYW5nbGVzW2ldKSAhPSAtMSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh1c2VkSW5kW3VzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pXSk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dXNlZFZlci5wdXNoKHRyaWFuZ2xlc1tpXSk7XHJcblx0XHRcdFx0XHRcdHZhciB0ID0gdHJpYW5nbGVzW2ldLnNwbGl0KFwiL1wiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0WzBdID0gcGFyc2VJbnQodFswXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHR0WzFdID0gcGFyc2VJbnQodFsxXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZlcnRleEluZGV4Lmxlbmd0aCAvIDMpO1xyXG5cdFx0XHRcdFx0XHR1c2VkSW5kLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR2ZXJ0ZXhJbmRleC5wdXNoKHZlcnRpY2VzW3RbMF0gKiAzXSwgdmVydGljZXNbdFswXSAqIDMgKyAxXSwgdmVydGljZXNbdFswXSAqIDMgKyAyXSk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0ZXhJbmRpY2VzLnB1c2godGV4Q29vcmRzW3RbMV1dWzBdLCB0ZXhDb29yZHNbdFsxXV1bMV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRleEluZGljZXMubGVuZ3RoLzI7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGJhc2UgPSB7dmVydGljZXM6IHZlcnRleEluZGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleEluZGljZXMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdFx0XHRcdHZhciBtb2RlbDNEID0gdGhpcy5jcmVhdGUzRE9iamVjdChnbCwgYmFzZSk7XHJcblxyXG5cdFx0XHRcdG1vZGVsLnJvdGF0aW9uID0gbW9kZWwzRC5yb3RhdGlvbjtcclxuXHRcdFx0XHRtb2RlbC5wb3NpdGlvbiA9IG1vZGVsM0QucG9zaXRpb247XHJcblx0XHRcdFx0bW9kZWwudmVydGV4QnVmZmVyID0gbW9kZWwzRC52ZXJ0ZXhCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwuaW5kaWNlc0J1ZmZlciA9IG1vZGVsM0QuaW5kaWNlc0J1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC50ZXhCdWZmZXIgPSBtb2RlbDNELnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5kYXJrQnVmZmVyID0gbW9kZWwzRC5kYXJrQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdGh0dHAuc2VuZCgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbW9kZWw7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG52YXIgY2hlYXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBQbGF5ZXIocG9zaXRpb24sIGRpcmVjdGlvbiwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdQbGF5ZXInKTsgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdQbGF5ZXInLCBQbGF5ZXIpO1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGRpcmVjdGlvbiwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHRcclxuXHR0aGlzLnJvdGF0aW9uU3BkID0gdmVjMihNYXRoLmRlZ1RvUmFkKDEpLCBNYXRoLmRlZ1RvUmFkKDQpKTtcclxuXHR0aGlzLm1vdmVtZW50U3BkID0gMC4wNTtcclxuXHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNTtcclxuXHR0aGlzLm1heFZlcnRSb3RhdGlvbiA9IE1hdGguZGVnVG9SYWQoNDUpO1xyXG5cdFxyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy55U3BlZWQgPSAwLjA7XHJcblx0dGhpcy55R3Jhdml0eSA9IDAuMDtcclxuXHRcclxuXHR0aGlzLmpvZyA9IHZlYzQoMC4wLCAxLCAwLjAsIDEpO1xyXG5cdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ZXBJbmQgPSAxO1xyXG5cclxuXHR0aGlzLmh1cnQgPSAwLjA7XHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9IDA7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnJlY2VpdmVEYW1hZ2UgPSBmdW5jdGlvbihkbWcpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0Z2FtZS5wbGF5U291bmQoJ2hpdCcpO1xyXG5cdHRoaXMuaHVydCA9IDUuMDtcclxuXHR2YXIgcGxheWVyID0gZ2FtZS5wbGF5ZXI7XHJcblx0cGxheWVyLmhwIC09IGRtZztcclxuXHRpZiAocGxheWVyLmhwIDw9IDApe1xyXG5cdFx0cGxheWVyLmhwID0gMDtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiWW91IGRpZWQhXCIpO1xyXG5cdFx0Z2FtZS5zYXZlTWFuYWdlci5kZWxldGVHYW1lKCk7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0TWlzc2lsZSA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMuc3RyKTtcclxuXHRpZiAod2VhcG9uKSBzdHIgKz0gVXRpbHMucm9sbERpY2Uod2VhcG9uLnN0cikgKiB3ZWFwb24uc3RhdHVzO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0bWlzc2lsZS5pbml0KHRoaXMucG9zaXRpb24uY2xvbmUoKSwgdGhpcy5yb3RhdGlvbi5jbG9uZSgpLCB3ZWFwb24uY29kZSwgJ2VuZW15JywgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdG1pc3NpbGUubWlzc2VkID0gKHByb2IgPiBwcy5zdGF0cy5kZXgpO1xyXG5cdGlmICh3ZWFwb24pIFxyXG5cdFx0d2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpOyAvLyBUT0RPOiBFbmhhbmNlIHdlYXBvbiBkZWdyYWRhdGlvblxyXG5cdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3Ugc2hvb3QgYSBcIiArIHdlYXBvbi5zdWJJdGVtTmFtZSk7XHJcblx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdHRoaXMubW92ZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tZWxlZUF0dGFjayA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGVuZW1pZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAxLjAsICdlbmVteScpO1xyXG5cdFx0XHJcblx0dmFyIHh4ID0gdGhpcy5wb3NpdGlvbi5hO1xyXG5cdHZhciB6eiA9IHRoaXMucG9zaXRpb24uYztcclxuXHR2YXIgZHggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdHZhciBkeiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR4eCArPSBkeDtcclxuXHRcdHp6ICs9IGR6O1xyXG5cdFx0dmFyIG9iamVjdDtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49ZW5lbWllcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdHZhciBpbnMgPSBlbmVtaWVzW2pdO1xyXG5cdFx0XHR2YXIgeCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0geHgpO1xyXG5cdFx0XHR2YXIgeiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0genopO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHggPCAwLjMgJiYgeiA8IDAuMyl7XHJcblx0XHRcdFx0b2JqZWN0ID0gaW5zO1xyXG5cdFx0XHRcdGogPSBqbGVuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmVuZW15KXtcclxuXHRcdFx0dGhpcy5jYXN0QXR0YWNrKG9iamVjdCwgd2VhcG9uKTtcclxuXHRcdFx0dGhpcy5hdHRhY2tXYWl0ID0gMjA7XHJcblx0XHRcdHRoaXMubW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRpID0gMTE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0QXR0YWNrID0gZnVuY3Rpb24odGFyZ2V0LCB3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdGlmIChwcm9iID4gcHMuc3RhdHMuZGV4KXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLnN0cik7XHJcblx0Ly92YXIgZGZzID0gVXRpbHMucm9sbERpY2UodGFyZ2V0LmVuZW15LnN0YXRzLmRmcyk7XHJcblx0dmFyIGRmcyA9IDA7XHJcblx0XHJcblx0aWYgKHdlYXBvbikgc3RyICs9IFV0aWxzLnJvbGxEaWNlKHdlYXBvbi5zdHIpICogd2VhcG9uLnN0YXR1cztcclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgoc3RyIC0gZGZzLCAwKSA8PCAwO1xyXG5cdFxyXG5cdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJBdHRhY2tpbmcgXCIgKyB0YXJnZXQuZW5lbXkubmFtZSk7XHJcblx0XHJcblx0aWYgKGRtZyA+IDApe1xyXG5cdFx0Z2FtZS5wbGF5U291bmQoJ2hpdCcpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGFyZ2V0LmVuZW15Lm5hbWUgKyBcIiBkYW1hZ2VkIHhcIitkbWcpOyAvLyBUT0RPOiBSZXBsYWNlIHdpdGggZGFtYWdlIHBvcHVwIG9uIHRoZSBlbmVteVxyXG5cdFx0dGFyZ2V0LnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdC8vIHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2Jsb2NrJyk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh3ZWFwb24pIFxyXG5cdFx0d2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpOyAvLyBUT0RPOiBFbmhhbmNlIHdlYXBvbiBkZWdyYWRhdGlvblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5qb2dNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlcil7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA1ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwOCAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdzdGVwJyArIHRoaXMuc3RlcEluZCk7XHJcblx0XHRcdGlmICgrK3RoaXMuc3RlcEluZCA9PSAzKSB0aGlzLnN0ZXBJbmQgPSAxO1xyXG5cdFx0XHR0aGlzLmpvZy5iID0gMTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR2YXIgc3dpbSA9ICh0aGlzLm9uTGF2YSB8fCB0aGlzLm9uV2F0ZXIpO1xyXG5cdGlmIChzd2ltKXtcclxuXHRcdHhUbyAqPSAwLjc1OyBcclxuXHRcdHpUbyAqPSAwLjc1O1xyXG5cdH1cclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHN3aW0pO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHR0aGlzLmRvVmVydGljYWxDaGVja3MoKTtcclxuXHRcdHRoaXMuam9nTW92ZW1lbnQoKTtcclxuXHRcdG1vdmVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IG1vdmVkO1xyXG5cdHJldHVybiBtb3ZlZDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW91c2VMb29rID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbU1vdmVtZW50ID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuZ2V0TW91c2VNb3ZlbWVudCgpO1xyXG5cdFxyXG5cdGlmIChtTW92ZW1lbnQueCAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmIgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueCk7IH1cclxuXHRpZiAobU1vdmVtZW50LnkgIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5hIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LnkpOyB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdHRoaXMubW91c2VMb29rKCk7XHJcblxyXG5cdC8vIFJvdGF0aW9uIHdpdGgga2V5Ym9hcmRcclxuXHRpZiAoZ2FtZS5rZXlzWzgxXSA9PSAxIHx8IGdhbWUua2V5c1szN10gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgKz0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjldID09IDEgfHwgZ2FtZS5rZXlzWzM5XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiAtPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1szOF0gPT0gMSl7IC8vIFVwIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgKz0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNDBdID09IDEpeyAvLyBEb3duIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgLT0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHR2YXIgQSA9IDAuMCwgQiA9IDAuMDtcclxuXHRpZiAoZ2FtZS5rZXlzWzg3XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s4M10gPT0gMSl7XHJcblx0XHRBID0gLU1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdFx0QiA9IE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZ2FtZS5rZXlzWzY1XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OF0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoQSAhPSAwLjAgfHwgQiAhPSAwLjApeyB0aGlzLm1vdmVUbyhBLCBCKTsgfWVsc2V7IHRoaXMuam9nLmEgPSAwLjA7IH1cclxuXHRpZiAodGhpcy5yb3RhdGlvbi5hID4gdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IHRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG5cdGVsc2UgaWYgKHRoaXMucm90YXRpb24uYSA8IC10aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gLXRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jaGVja0FjdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDMyKSl7IC8vIFNwYWNlXHJcblx0XHR2YXIgeHggPSAodGhpcy5wb3NpdGlvbi5hICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdHZhciB6eiA9ICh0aGlzLnBvc2l0aW9uLmMgLSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0XHJcblx0XHR2YXIgb2JqZWN0ID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeHgsIHRoaXMucG9zaXRpb24uYiwgenopKTtcclxuXHRcdGlmICghb2JqZWN0KSBvYmplY3QgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VBdEdyaWQodmVjMyh0aGlzLnBvc2l0aW9uLmEgPDwgMCwgdGhpcy5wb3NpdGlvbi5iLCB0aGlzLnBvc2l0aW9uLmMgPDwgMCkpO1xyXG5cdFx0XHJcblx0XHRpZiAob2JqZWN0ICYmIG9iamVjdC5hY3RpdmF0ZSlcclxuXHRcdFx0b2JqZWN0LmFjdGl2YXRlKCk7XHJcblx0XHRcdFxyXG5cdFx0aWYgKGNoZWF0RW5hYmxlZCl7XHJcblx0XHRcdGlmIChnYW1lLmZsb29yRGVwdGggPCA4KVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIGdhbWUuZmxvb3JEZXB0aCArIDEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKChnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpIHx8IGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykpICYmIHRoaXMuYXR0YWNrV2FpdCA9PSAwKXtcdC8vIE1lbGVlIGF0dGFjaywgRW50ZXJcclxuXHRcdHZhciB3ZWFwb24gPSBnYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFxyXG5cdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpe1xyXG5cdFx0XHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSA1O1xyXG5cdFx0fWVsc2UgaWYgKHdlYXBvbiAmJiB3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5jYXN0TWlzc2lsZSh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAod2VhcG9uICYmIHdlYXBvbi5zdGF0dXMgPCAwLjA1KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmRlc3Ryb3lJdGVtKHdlYXBvbik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHdlYXBvbi5uYW1lICsgXCIgZGFtYWdlZCFcIik7XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmIChnYW1lLmdldEtleVByZXNzZWQoNzkpKXsgLy8gTywgVE9ETzogY2hhbmdlIHRvIEN0cmwrU1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJTYXZpbmcgZ2FtZS5cIik7XHJcblx0XHRnYW1lLnNhdmVNYW5hZ2VyLnNhdmVHYW1lKCk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkdhbWUgU2F2ZWQuXCIpO1xyXG5cdH1cclxuXHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKTtcclxuXHR2YXIgd3kgPSAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKT8gMC4zIDogMDtcclxuXHR2YXIgcHkgPSBNYXRoLmZsb29yKChwb2ludFkgLSAodGhpcy5wb3NpdGlvbi5iICsgd3kpKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuaXNMYXZhUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdFx0aWYgKCF0aGlzLm9uTGF2YSl7XHJcblx0XHRcdHRoaXMucmVjZWl2ZURhbWFnZSg4MCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLm9uTGF2YSA9IHRydWU7XHJcblx0XHRcclxuXHR9IGVsc2UgaWYgKHRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPT0gdGhpcy50YXJnZXRZKVxyXG5cdFx0XHR0aGlzLm1vdmVtZW50U3BkID0gMC4wMjU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSB0cnVlO1xyXG5cdFx0dGhpcy5vbkxhdmEgPSBmYWxzZTtcclxuXHR9ZWxzZSB7XHJcblx0XHR0aGlzLm1vdmVtZW50U3BkID0gMC4wNTtcclxuXHRcdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdFx0dGhpcy5vbkxhdmEgPSBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjUgKyB0aGlzLmpvZy5hICsgdGhpcy5qb2cuYztcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuZG9GbG9hdCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlciAmJiB0aGlzLmpvZy5hID09IDAuMCl7XHJcblx0XHR0aGlzLmpvZy5jICs9IDAuMDA1ICogdGhpcy5qb2cuZDtcclxuXHRcdGlmICh0aGlzLmpvZy5jID49IDAuMDMgJiYgdGhpcy5qb2cuZCA9PSAxKSB0aGlzLmpvZy5kID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5jIDw9IC0wLjAzICYmIHRoaXMuam9nLmQgPT0gLTEpIHRoaXMuam9nLmQgPSAxO1xyXG5cdFx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjUgKyB0aGlzLmpvZy5hICsgdGhpcy5qb2cuYztcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuam9nLmMgPSAwLjA7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMC4wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0dGhpcy5tb3ZlbWVudCgpO1xyXG5cdHRoaXMuY2hlY2tBY3Rpb24oKTtcclxuXHRcclxuXHRpZiAodGhpcy50YXJnZXRZIDwgdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiAtPSAwLjE7XHJcblx0XHR0aGlzLmpvZy5hID0gMC4wO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA8PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9ZWxzZSBpZiAodGhpcy50YXJnZXRZID4gdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiArPSAwLjA4O1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdC8vdGhpcy50YXJnZXRZID0gdGhpcy5wb3NpdGlvbi5iO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGF1c2VkKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKXtcclxuXHRcdGlmICh0aGlzLm9uV2F0ZXIgfHwgdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLmRvRmxvYXQoKTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLmNhbWVyYUhlaWdodCA+IDAuMil7IFxyXG5cdFx0XHR0aGlzLmNhbWVyYUhlaWdodCAtPSAwLjAxOyBcclxuXHRcdH1cclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aWYgKHRoaXMub25MYXZhKXtcclxuXHRcdGlmICh0aGlzLmxhdmFDb3VudGVyID4gMzApe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubGF2YUNvdW50ZXIrKztcclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0fVxyXG5cdGlmICh0aGlzLmF0dGFja1dhaXQgPiAwKSB0aGlzLmF0dGFja1dhaXQgLT0gMTtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCkgdGhpcy5odXJ0IC09IDE7XHJcblx0aWYgKHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA+IDApe1xyXG5cdFx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyLS07XHJcblx0XHRpZiAodGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID09IDApe1xyXG5cdFx0XHR2YXIgd2VhcG9uID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmdldFdlYXBvbigpO1xyXG5cdFx0XHRpZiAoIXdlYXBvbiB8fCAhd2VhcG9uLnJhbmdlZClcclxuXHRcdFx0XHR0aGlzLm1lbGVlQXR0YWNrKHdlYXBvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IGZhbHNlO1xyXG5cdHRoaXMuc3RlcCgpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBQbGF5ZXJTdGF0cygpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignUGxheWVyU3RhdHMnKTtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnJlZ2VuQ291bnQgPSAwO1xyXG5cdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDA7XHJcblx0XHJcblx0dGhpcy52aXJ0dWUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0dGhpcy5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuc3RhdHMgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpLFxyXG5cdFx0c3RyOiAnMEQwJywgXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclN0YXRzO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdQbGF5ZXJTdGF0cycsIFBsYXllclN0YXRzKTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5ocCA9IDA7XHJcblx0dGhpcy5tSFAgPSAwO1xyXG5cdHRoaXMubWFuYSA9IDA7XHJcblx0dGhpcy5tTWFuYSA9IDA7XHJcblx0XHJcblx0dGhpcy52aXJ0dWUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0dGhpcy5zdGF0cyA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKCksXHJcblx0XHRzdHI6ICcwRDAnLFxyXG5cdFx0ZGZzOiAnMEQwJyxcclxuXHRcdGRleDogMCxcclxuXHRcdG1hZ2ljUG93ZXI6ICcwRDAnXHJcblx0fTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5hZGRFeHBlcmllbmNlID0gZnVuY3Rpb24oYW1vdW50LCBjb25zb2xlKXtcclxuXHR0aGlzLmV4cCArPSBhbW91bnQ7XHJcblx0XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShhbW91bnQgKyBcIiBYUCBnYWluZWRcIik7XHJcblx0dmFyIG5leHRFeHAgPSAoTWF0aC5wb3codGhpcy5sdmwsIDEuNSkgKiA1MDApIDw8IDA7XHJcblx0aWYgKHRoaXMuZXhwID49IG5leHRFeHApeyB0aGlzLmxldmVsVXAoY29uc29sZSk7IH1cclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5sZXZlbFVwID0gZnVuY3Rpb24oY29uc29sZSl7XHJcblx0dGhpcy5sdmwgKz0gMTtcclxuXHRcclxuXHQvLyBVcGdyYWRlIEhQIGFuZCBNYW5hXHJcblx0dmFyIGhwTmV3ID0gTWF0aC5pUmFuZG9tKDEwLCAyNSk7XHJcblx0dmFyIG1hbmFOZXcgPSBNYXRoLmlSYW5kb20oNSwgMTUpO1xyXG5cdFxyXG5cdHZhciBocE9sZCA9IHRoaXMubUhQO1xyXG5cdHZhciBtYW5hT2xkID0gdGhpcy5tTWFuYTtcclxuXHRcclxuXHR0aGlzLmhwICArPSBocE5ldztcclxuXHR0aGlzLm1hbmEgKz0gbWFuYU5ldztcclxuXHR0aGlzLm1IUCArPSBocE5ldztcclxuXHR0aGlzLm1NYW5hICs9IG1hbmFOZXc7XHJcblx0XHJcblx0Ly8gVXBncmFkZSBhIHJhbmRvbSBzdGF0IGJ5IDEtMyBwb2ludHNcclxuXHQvKlxyXG5cdHZhciBzdGF0cyA9IFsnc3RyJywgJ2RmcyddO1xyXG5cdHZhciBuYW1lcyA9IFsnU3RyZW5ndGgnLCAnRGVmZW5zZSddO1xyXG5cdHZhciBzdCwgbm07XHJcblx0d2hpbGUgKCFzdCl7XHJcblx0XHR2YXIgaW5kID0gTWF0aC5pUmFuZG9tKHN0YXRzLmxlbmd0aCk7XHJcblx0XHRzdCA9IHN0YXRzW2luZF07XHJcblx0XHRubSA9IG5hbWVzW2luZF07XHJcblx0fVxyXG5cdFxyXG5cdHZhciBwYXJ0MSA9IHBhcnNlSW50KHRoaXMuc3RhdHNbc3RdLnN1YnN0cmluZygwLCB0aGlzLnN0YXRzW3N0XS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0cGFydDEgKz0gTWF0aC5pUmFuZG9tKDEsIDMpO1xyXG5cdFxyXG5cdHZhciBvbGQgPSB0aGlzLnN0YXRzW3N0XTtcclxuXHR0aGlzLnN0YXRzW3N0XSA9IHBhcnQxICsgJ0QzJzsqL1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTGV2ZWwgdXA6IFwiICsgdGhpcy5sdmwgKyBcIiFcIik7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIUCBpbmNyZWFzZWQgZnJvbSBcIiArIGhwT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1IUCk7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNYW5hIGluY3JlYXNlZCBmcm9tIFwiICsgbWFuYU9sZCArIFwiIHRvIFwiICsgdGhpcy5tTWFuYSk7XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShubSArIFwiIGluY3JlYXNlZCBmcm9tIFwiICsgb2xkICsgXCIgdG8gXCIgKyB0aGlzLnN0YXRzW3N0XSk7XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuc2V0VmlydHVlID0gZnVuY3Rpb24odmlydHVlTmFtZSl7XHJcblx0dGhpcy52aXJ0dWUgPSB2aXJ0dWVOYW1lO1xyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0c3dpdGNoICh2aXJ0dWVOYW1lKXtcclxuXHRcdGNhc2UgXCJIb25lc3R5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDIwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuODtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnTWFnZSc7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogNTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiQ29tcGFzc2lvblwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ0JhcmQnO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlZhbG9yXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA4MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDI7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ0ZpZ2h0ZXInO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDEwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJIb25vclwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1BhbGFkaW4nO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDg7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNwaXJpdHVhbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDY7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdSYW5nZXInO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDk7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkh1bWlsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDI7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjg7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1NoZXBoZXJkJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA3O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJTYWNyaWZpY2VcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDgwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gNTA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDI7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdUaW5rZXInO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkp1c3RpY2VcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRHJ1aWQnO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDY7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tSFAgPSB0aGlzLmhwO1xyXG5cdHRoaXMuc3RhdHMuc3RyICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5kZnMgKz0gJ0QzJztcclxuXHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgKz0gJ0QzJztcclxuXHR0aGlzLm1NYW5hID0gdGhpcy5tYW5hO1xyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnJlZ2VuTWFuYSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCsrdGhpcy5yZWdlbkNvdW50ID49IHRoaXMubWFuYVJlZ2VuRnJlcSl7XHJcblx0XHR0aGlzLm1hbmEgPSBNYXRoLm1pbih0aGlzLm1hbmEgKyAxLCB0aGlzLm1NYW5hKTtcclxuXHRcdHRoaXMucmVnZW5Db3VudCA9IDA7XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBTYXZlTWFuYWdlcihnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlKCk7XHJcbn1cclxuXHJcbnZhciBTdG9yYWdlID0gcmVxdWlyZSgnLi9TdG9yYWdlJyk7XHJcblxyXG5TYXZlTWFuYWdlci5wcm90b3R5cGUgPSB7XHJcblx0c2F2ZUdhbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgc2F2ZU9iamVjdCA9IHtcclxuXHRcdFx0X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdTdHlnaWFuR2FtZScpLFxyXG5cdFx0XHR2ZXJzaW9uOiB2ZXJzaW9uLCBcclxuXHRcdFx0cGxheWVyOiB0aGlzLmdhbWUucGxheWVyLFxyXG5cdFx0XHRpbnZlbnRvcnk6IHRoaXMuZ2FtZS5pbnZlbnRvcnksXHJcblx0XHRcdG1hcHM6IHRoaXMuZ2FtZS5tYXBzLFxyXG5cdFx0XHRmbG9vckRlcHRoOiB0aGlzLmdhbWUuZmxvb3JEZXB0aCxcclxuXHRcdFx0dW5pcXVlUmVnaXN0cnk6IHRoaXMuZ2FtZS51bmlxdWVSZWdpc3RyeVxyXG5cdFx0fTtcclxuXHRcdHZhciBzZXJpYWxpemVkID0gY2lyY3VsYXIuc2VyaWFsaXplKHNhdmVPYmplY3QpO1xyXG5cdFx0XHJcblx0XHQvKnZhciBzZXJpYWxpemVkT2JqZWN0ID0gSlNPTi5wYXJzZShzZXJpYWxpemVkKTtcclxuXHRcdGNvbnNvbGUubG9nKHNlcmlhbGl6ZWRPYmplY3QpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJTaXplOiBcIitzZXJpYWxpemVkLmxlbmd0aCk7Ki9cclxuXHRcdFxyXG5cdFx0dGhpcy5zdG9yYWdlLnNldEl0ZW0oJ3N0eWdpYW5HYW1lJywgc2VyaWFsaXplZCk7XHJcblx0fSxcclxuXHRyZXN0b3JlR2FtZTogZnVuY3Rpb24oZ2FtZSl7XHJcblx0XHR2YXIgZ2FtZURhdGEgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnc3R5Z2lhbkdhbWUnKTtcclxuXHRcdGlmICghZ2FtZURhdGEpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR2YXIgZGVzZXJpYWxpemVkID0gY2lyY3VsYXIucGFyc2UoZ2FtZURhdGEsIGdhbWUpO1xyXG5cdFx0aWYgKGRlc2VyaWFsaXplZC52ZXJzaW9uICE9IHZlcnNpb24pe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRnYW1lLnBsYXllciA9IGRlc2VyaWFsaXplZC5wbGF5ZXI7XHJcblx0XHRnYW1lLmludmVudG9yeSA9IGRlc2VyaWFsaXplZC5pbnZlbnRvcnk7XHJcblx0XHRnYW1lLm1hcHMgPSBkZXNlcmlhbGl6ZWQubWFwcztcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlc2VyaWFsaXplZC5mbG9vckRlcHRoO1xyXG5cdFx0Z2FtZS51bmlxdWVSZWdpc3RyeSA9IGRlc2VyaWFsaXplZC51bmlxdWVSZWdpc3RyeTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0sXHJcblx0ZGVsZXRlR2FtZTogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuc3RvcmFnZS5yZW1vdmVJdGVtKCdzdHlnaWFuR2FtZScpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTYXZlTWFuYWdlcjsiLCJmdW5jdGlvbiBTZWxlY3RDbGFzcygvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdENsYXNzO1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5nYW1lO1xyXG5cdHZhciBwbGF5ZXJTID0gZ2FtZS5wbGF5ZXI7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHR2YXIgbW91c2UgPSBnYW1lLm1vdXNlO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5iID49IDI4ICYmIGdhbWUubW91c2UuYiA8IDEwMCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25lc3R5XCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiQ29tcGFzc2lvblwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlZhbG9yXCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJKdXN0aWNlXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGdhbWUubW91c2UuYiA+PSAxMDAgJiYgZ2FtZS5tb3VzZS5iIDwgMTcwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNhY3JpZmljZVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbm9yXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU3Bpcml0dWFsaXR5XCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIdW1pbGl0eVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHBsYXllclMudmlydHVlICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkocGxheWVyUy5jbGFzc05hbWUpO1xyXG5cdFx0XHRnYW1lLnByaW50R3JlZXQoKTtcclxuXHRcdFx0Z2FtZS5sb2FkTWFwKGZhbHNlLCAxKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5TZWxlY3RDbGFzcy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dmFyIHVpID0gdGhpcy5nYW1lLmdldFVJKCk7XHJcblx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuc2VsZWN0Q2xhc3MsIDAsIDApO1xyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdTdGFpcnMnLCAnYmlsbGJvYXJkJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdTdGFpcnMnLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbb2JqZWN0LmltZ0luZF07XHJcblx0b2JqZWN0LmJpbGxib2FyZC5ub1JvdGF0ZSA9IHRydWU7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gU3RhaXJzKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKFwiU3RhaXJzXCIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWlycztcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnU3RhaXJzJywgU3RhaXJzKTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwb3NpdGlvbiwgbWFwTWFuYWdlciwgZGlyZWN0aW9uKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHR0aGlzLnN0YWlycyA9IHRydWU7XHJcblx0XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFxyXG5cdHRoaXMudGFyZ2V0SWQgPSB0aGlzLm1hcE1hbmFnZXIuZGVwdGg7XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcpe1xyXG5cdFx0dGhpcy50YXJnZXRJZCAtPSAxO1xyXG5cdH1lbHNlIGlmICh0aGlzLmRpcmVjdGlvbiA9PSAnZG93bicpe1xyXG5cdFx0dGhpcy50YXJnZXRJZCArPSAxO1xyXG5cdFx0dGhpcy5pbWdJbmQgPSAxO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1t0aGlzLmltZ0luZF07XHJcblx0dGhpcy5iaWxsYm9hcmQubm9Sb3RhdGUgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMudGlsZSA9IG51bGw7XHJcbn1cclxuXHJcblN0YWlycy5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRhcmdldElkIDwgOSlcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIHRoaXMudGFyZ2V0SWQpO1xyXG5cdGVsc2Uge1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50aWxlICE9IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSB0aGlzLm1hcE1hbmFnZXIubWFwW3RoaXMucG9zaXRpb24uYyA8PCAwXVt0aGlzLnBvc2l0aW9uLmEgPDwgMF07XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcgJiYgdGhpcy50aWxlLmNoID4gMSl7XHJcblx0XHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiA8PCAwO1xyXG5cdFx0Zm9yICh2YXIgaT15KzE7aTx0aGlzLnRpbGUuY2g7aSsrKXtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0cG9zLmIgPSBpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzJdO1xyXG5cdFx0XHRnYW1lLmRyYXdCaWxsYm9hcmQocG9zLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzNdO1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5nZXRUaWxlKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFN0b3JhZ2UoKXtcclxuXHQgdHJ5IHtcclxuXHRcdCBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnX190ZXN0JywgJ3Rlc3QnKTtcclxuXHRcdCBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX190ZXN0Jyk7XHJcblx0XHQgdGhpcy5lbmFibGVkID0gdHJ1ZTtcclxuXHQgfSBjYXRjaChlKSB7XHJcblx0XHQgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcblx0IH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuXHJcblN0b3JhZ2UucHJvdG90eXBlID0ge1xyXG5cdHNldEl0ZW06IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcclxuXHR9LFxyXG5cdHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGtleSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcblx0fSxcclxuXHRnZXRJdGVtOiBmdW5jdGlvbihrZXkpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xyXG5cdH1cclxufVxyXG4gXHJcbiIsInZhciBTZWxlY3RDbGFzcyA9IHJlcXVpcmUoJy4vU2VsZWN0Q2xhc3MnKTtcclxuXHJcbmZ1bmN0aW9uIFRpdGxlU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5ibGluayA9IDMwO1xyXG5cdHRoaXMuY3VycmVudFNjcmVlbiA9IDA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVTY3JlZW47XHJcblxyXG5UaXRsZVNjcmVlbi5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSB8fCB0aGlzLmdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkpe1xyXG5cdFx0aWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSAwKXtcclxuXHRcdFx0aWYgKHRoaXMuZ2FtZS5zYXZlTWFuYWdlci5yZXN0b3JlR2FtZSh0aGlzLmdhbWUpKXtcclxuXHRcdFx0XHR0aGlzLmdhbWUucHJpbnRXZWxjb21lQmFjaygpO1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5sb2FkTWFwKHRoaXMuZ2FtZS5wbGF5ZXIuY3VycmVudE1hcCwgdGhpcy5nYW1lLnBsYXllci5jdXJyZW50RGVwdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuY3VycmVudFNjcmVlbisrO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSA0KXtcclxuXHRcdFx0dGhpcy5nYW1lLnNjZW5lID0gbmV3IFNlbGVjdENsYXNzKHRoaXMuZ2FtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRTY3JlZW4rKztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5UaXRsZVNjcmVlbi5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dmFyIHVpID0gdGhpcy5nYW1lLmdldFVJKCk7XHJcblx0c3dpdGNoICh0aGlzLmN1cnJlbnRTY3JlZW4pe1xyXG5cdGNhc2UgMDpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLnRpdGxlU2NyZWVuLCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgMTpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmludHJvMSwgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDI6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzIsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAzOlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuaW50cm8zLCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgNDpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmludHJvNCwgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0XHJcbn07XHJcbiIsImZ1bmN0aW9uIFVJKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7XHJcblxyXG5VSS5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSAwO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLmN0eC53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuXHR0aGlzLmN0eC5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG5cdHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0dGhpcy5zY2FsZSA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jayA9IGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2s7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2Upe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5kcmF3SW1hZ2Uoc3ByaXRlLFxyXG5cdFx0eEltZyAqIHNwcml0ZS5pbWdXaWR0aCwgeUltZyAqIHNwcml0ZS5pbWdIZWlnaHQsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodCxcclxuXHRcdHgsIHksIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodFxyXG5cdFx0KTtcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3U3ByaXRlRXh0ID0gZnVuY3Rpb24oc3ByaXRlLCB4LCB5LCBzdWJJbWFnZSwgaW1hZ2VBbmdsZSl7XHJcblx0dmFyIHhJbWcgPSBzdWJJbWFnZSAlIHNwcml0ZS5pbWdOdW07XHJcblx0dmFyIHlJbWcgPSAoc3ViSW1hZ2UgLyBzcHJpdGUuaW1nTnVtKSA8PCAwO1xyXG5cdFxyXG5cdHRoaXMuY3R4LnNhdmUoKTtcclxuXHR0aGlzLmN0eC50cmFuc2xhdGUoeCtzcHJpdGUueE9yaWcsIHkrc3ByaXRlLnlPcmlnKTtcclxuXHR0aGlzLmN0eC5yb3RhdGUoaW1hZ2VBbmdsZSk7XHJcblx0XHJcblx0dGhpcy5jdHguZHJhd0ltYWdlKHNwcml0ZSxcclxuXHRcdHhJbWcgKiBzcHJpdGUuaW1nV2lkdGgsIHlJbWcgKiBzcHJpdGUuaW1nSGVpZ2h0LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHQsXHJcblx0XHQtc3ByaXRlLnhPcmlnLCAtc3ByaXRlLnlPcmlnLCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHRcclxuXHRcdCk7XHJcblx0XHRcclxuXHR0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1RleHQgPSBmdW5jdGlvbih0ZXh0LCB4LCB5LCBjb25zb2xlKXtcclxuXHRjb25zb2xlLnByaW50VGV4dCh4LHksIHRleHQsIHRoaXMuY3R4KTtcclxuXHQvKnZhciB3ID0gY29uc29sZS5zcGFjZUNoYXJzO1xyXG5cdHZhciBoID0gY29uc29sZS5zcHJpdGVGb250LmhlaWdodDtcclxuXHRmb3IgKHZhciBqPTAsamxlbj10ZXh0Lmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IHRleHQuY2hhckF0KGopO1xyXG5cdFx0dmFyIGluZCA9IGNvbnNvbGUubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0dGhpcy5jdHguZHJhd0ltYWdlKGNvbnNvbGUuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHR4LCB5LCB3LCBoIC0gMSk7XHJcblx0XHR9XHJcblx0XHR4ICs9IHc7XHJcblx0fSovXHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIEF1ZGlvQVBJID0gcmVxdWlyZSgnLi9BdWRpbycpO1xyXG52YXIgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xyXG52YXIgSW52ZW50b3J5ID0gcmVxdWlyZSgnLi9JbnZlbnRvcnknKTtcclxudmFyIEl0ZW0gPSByZXF1aXJlKCcuL0l0ZW0nKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgTWFwTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFwTWFuYWdlcicpO1xyXG52YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgUGxheWVyU3RhdHMgPSByZXF1aXJlKCcuL1BsYXllclN0YXRzJyk7XHJcbnZhciBTYXZlTWFuYWdlciA9IHJlcXVpcmUoJy4vU2F2ZU1hbmFnZXInKTtcclxudmFyIFRpdGxlU2NyZWVuID0gcmVxdWlyZSgnLi9UaXRsZVNjcmVlbicpO1xyXG52YXIgRW5kaW5nU2NyZWVuID0gcmVxdWlyZSgnLi9FbmRpbmdTY3JlZW4nKTtcclxudmFyIFVJID0gcmVxdWlyZSgnLi9VSScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbnZhciBXZWJHTCA9IHJlcXVpcmUoJy4vV2ViR0wnKTtcclxuXHJcbi8qPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHRcdFx0XHQgXHRcdFx0U3R5Z2lhbiBBYnlzc1xyXG5cdFx0XHRcdFxyXG4gIEJ5IENhbWlsbyBSYW3DrXJleiAoaHR0cDovL2p1Y2FyYXZlLmNvbSkgYW5kIFNsYXNoIChodHRwOi8vc2xhc2hpZS5uZXQpXHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0ICBcdFx0XHQyMDE1XHJcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG5mdW5jdGlvbiBVbmRlcndvcmxkKCl7XHJcblx0dGhpcy5zaXplID0gdmVjMigzNTUsIDIwMCk7XHJcblx0XHJcblx0dGhpcy5HTCA9IG5ldyBXZWJHTCh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5VSSA9IG5ldyBVSSh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5hdWRpbyA9IG5ldyBBdWRpb0FQSSgpO1xyXG5cdFxyXG5cdHRoaXMucGxheWVyID0gbmV3IFBsYXllclN0YXRzKCk7XHJcblx0dGhpcy5pbnZlbnRvcnkgPSBuZXcgSW52ZW50b3J5KDEwKTtcclxuXHR0aGlzLmNvbnNvbGUgPSBuZXcgQ29uc29sZSgxMCwgMTAsIDMwMCwgdGhpcyk7XHJcblx0dGhpcy5zYXZlTWFuYWdlciA9IG5ldyBTYXZlTWFuYWdlcih0aGlzKTtcclxuXHR0aGlzLmZvbnQgPSAnMTBweCBcIkNvdXJpZXJcIic7XHJcblx0XHJcblx0dGhpcy5nclBhY2sgPSAnaW1nX2hyLyc7XHJcblx0XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMua2V5cyA9IFtdO1xyXG5cdHRoaXMudW5pcXVlUmVnaXN0cnkgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0fTtcclxuXHR0aGlzLm1vdXNlID0gdmVjMygwLjAsIDAuMCwgMCk7XHJcblx0dGhpcy5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHR0aGlzLmltYWdlcyA9IHt9O1xyXG5cdHRoaXMubXVzaWMgPSB7fTtcclxuXHR0aGlzLnNvdW5kcyA9IHt9O1xyXG5cdHRoaXMudGV4dHVyZXMgPSB7d2FsbDogW10sIGZsb29yOiBbXSwgY2VpbDogW119O1xyXG5cdHRoaXMub2JqZWN0VGV4ID0ge307XHJcblx0dGhpcy5tb2RlbHMgPSB7fTtcclxuXHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnRpbWVTdG9wID0gMDtcclxuXHR0aGlzLnByb3RlY3Rpb24gPSAwO1xyXG5cdFxyXG5cdHRoaXMuZnBzID0gKDEwMDAgLyAzMCkgPDwgMDtcclxuXHR0aGlzLmxhc3RUID0gMDtcclxuXHR0aGlzLm51bWJlckZyYW1lcyA9IDA7XHJcblx0dGhpcy5maXJzdEZyYW1lID0gRGF0ZS5ub3coKTtcclxuXHRcclxuXHR0aGlzLmxvYWRJbWFnZXMoKTtcclxuXHR0aGlzLmxvYWRNdXNpYygpO1xyXG5cdHRoaXMubG9hZFRleHR1cmVzKCk7XHJcblx0XHJcblx0dGhpcy5jcmVhdGUzRE9iamVjdHMoKTtcclxuXHRBbmltYXRlZFRleHR1cmUuaW5pdCh0aGlzLkdMLmN0eCk7XHJcbn1cclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNyZWF0ZTNET2JqZWN0cyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5kb29yID0gT2JqZWN0RmFjdG9yeS5kb29yKHZlYzMoMC41LDAuNzUsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIGZhbHNlKTtcclxuXHR0aGlzLmRvb3JXID0gT2JqZWN0RmFjdG9yeS5kb29yV2FsbCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG5cdHRoaXMuZG9vckMgPSBPYmplY3RGYWN0b3J5LmN1YmUodmVjMygxLjAsMS4wLDAuMSksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4LCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwwLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0dGhpcy5zbG9wZSA9IE9iamVjdEZhY3Rvcnkuc2xvcGUodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLkdMLmN0eCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc291bmRzLnN0ZXAxID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9zdGVwMS53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLnNvdW5kcy5zdGVwMiA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvc3RlcDIud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMuaGl0ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9oaXQud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMubWlzcyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvbWlzcy53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLnNvdW5kcy5ibG9jayA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvYmxvY2sud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDhfLV9VbHRpbWFfNF8tX0M2NF8tX0R1bmdlb25zLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTXVzaWNQb3N0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24yID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wMl8tX1VsdGltYV81Xy1fQzY0Xy1fQnJpdGFubmljX0xhbmRzLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDVfLV9VbHRpbWFfM18tX0M2NF8tX0NvbWJhdC5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzNfLV9DNjRfLV9FeG9kdXMnX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjUgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA0Xy1fVWx0aW1hXzVfLV9DNjRfLV9FbmdhZ2VtZW50X2FuZF9NZWxlZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjYgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAzXy1fVWx0aW1hXzRfLV9DNjRfLV9Mb3JkX0JyaXRpc2gnc19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb243ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMV8tX1VsdGltYV81Xy1fQzY0Xy1fV29ybGRzX0JlbG93Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uOCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTBfLV9VbHRpbWFfNV8tX0M2NF8tX0hhbGxzX29mX0Rvb20ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmNvZGV4Um9vbSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfNF8tX0M2NF8tX1NocmluZXMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRJbWFnZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW1hZ2VzLml0ZW1zX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaXRlbXNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA4LCBpbWdWTnVtOiA4fSk7XHJcblx0dGhpcy5pbWFnZXMuc3BlbGxzX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic3BlbGxzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLnRpdGxlU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGl0bGVTY3JlZW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMuaW50cm8xID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm8xLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludHJvMiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludHJvMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnRybzMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnRybzMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW50cm80ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm80LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzLmVuZGluZ1NjcmVlbiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZGluZy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4yID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5zZWxlY3RDbGFzcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNlbGVjdENsYXNzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeSA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiAxLCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeURyb3AucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogMSwgaW1nVk51bTogMn0pO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5X3NlbGVjdGVkLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnNjcm9sbEZvbnQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzY3JvbGxGb250V2hpdGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMucmVzdGFydCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJlc3RhcnQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMucGF1c2VkID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicGF1c2VkLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnZpZXdwb3J0V2VhcG9ucyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInZpZXdwb3J0V2VhcG9ucy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA0LCBpbWdWTnVtOiA0fSk7XHJcblx0dGhpcy5pbWFnZXMuY29tcGFzcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNvbXBhc3NVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7eE9yaWc6IDExLCB5T3JpZzogMTEsIGltZ051bTogMiwgaW1nVk51bTogMX0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZFRleHR1cmVzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnRleHR1cmVzID0ge3dhbGw6IFtudWxsXSwgZmxvb3I6IFtudWxsXSwgY2VpbDogW251bGxdLCB3YXRlcjogW251bGxdfTtcclxuXHRcclxuXHQvLyBObyBUZXh0dXJlXHJcblx0dmFyIG5vVGV4ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwibm9UZXh0dXJlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaChub1RleCk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2gobm9UZXgpO1xyXG5cdFxyXG5cdC8vIFdhbGxzXHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2FsbDAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw1LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMSwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEZsb29yc1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3JbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIExpcXVpZHNcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TGF2YTAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gQ2VpbGluZ3NcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhDZWlsMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsWzUwXSA9ICh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhIb2xlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNTAsIHRydWUpKTtcclxuXHRcclxuXHQvLyBJdGVtc1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SXRlbXMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtcy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoOCwgOCwgdGhpcy5HTC5jdHgpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zTWlzYyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleE1pc2MucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtc01pc2MuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDgsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhTcGVsbHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDQsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHQvLyBNYWdpYyBCb2x0c1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Qm9sdHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5ib2x0cy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIFN0YWlyc1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFN0YWlycy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoMiwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIEVuZW1pZXNcclxuXHR0aGlzLm9iamVjdFRleC5iYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGlkZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTcGlkZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC50cm9sbF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFRyb2xsUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2F6ZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHYXplclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oZWFkbGVzc19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEhlYWRsZXNzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgub3JjX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T3JjUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmVhcGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmVhcGVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2tlbGV0b25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTa2VsZXRvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5kYWVtb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhEYWVtb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubW9uZ2JhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE1vbmdiYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguaHlkcmFfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhIeWRyYVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zZWFTZXJwZW50X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4U2VhU2VycGVudFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vY3RvcHVzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T2N0b3B1c1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYWxyb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYWxyb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGljaGVfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhMaWNoZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5naG9zdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdob3N0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdyZW1saW5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHcmVtbGluUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmRyYWdvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERyYWdvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC56b3JuX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4Wm9yblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC53aXNwX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4V2lzcFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tYWdlX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TWFnZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYW5nZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYW5nZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZmlnaHRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEZpZ2h0ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguYmFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGF2YUxpemFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExhdmFMaXphcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wb3N0TG9hZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLmNyZWF0ZVNwcml0ZUZvbnQodGhpcy5pbWFnZXMuc2Nyb2xsRm9udCwgXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSE/LC4vXCIsIDcpO1xyXG5cdHRoaXMubG9hZE11c2ljUG9zdCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuc3RvcE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmF1ZGlvLnN0b3BNdXNpYygpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheU11c2ljID0gZnVuY3Rpb24obXVzaWNDb2RlLCBsb29wKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5tdXNpY1ttdXNpY0NvZGVdO1xyXG5cdGlmICghYXVkaW9GKSByZXR1cm4gbnVsbDtcclxuXHR0aGlzLnN0b3BNdXNpYygpO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgbG9vcCwgdHJ1ZSwgMC4yKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kQ29kZSl7XHJcblx0dmFyIGF1ZGlvRiA9IHRoaXMuc291bmRzW3NvdW5kQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgZmFsc2UsIGZhbHNlLCAwLjMpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VUkgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLlVJLmN0eDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldFRleHR1cmVCeUlkID0gZnVuY3Rpb24odGV4dHVyZUlkLCB0eXBlKXtcclxuXHRpZiAoIXRoaXMudGV4dHVyZXNbdHlwZV1bdGV4dHVyZUlkXSkgdGV4dHVyZUlkID0gMTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0T2JqZWN0VGV4dHVyZSA9IGZ1bmN0aW9uKHRleHR1cmVDb2RlKXtcclxuXHRpZiAoIXRoaXMub2JqZWN0VGV4W3RleHR1cmVDb2RlXSkgdGhyb3cgXCJJbnZhbGlkIHRleHR1cmUgY29kZTogXCIgKyB0ZXh0dXJlQ29kZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcCwgZGVwdGgpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRpZiAoZGVwdGggPT09IHVuZGVmaW5lZCB8fCAhZ2FtZS5tYXBzW2RlcHRoIC0gMV0pe1xyXG5cdFx0Z2FtZS5tYXAgPSBuZXcgTWFwTWFuYWdlcigpO1xyXG5cdFx0Z2FtZS5tYXAuaW5pdChnYW1lLCBtYXAsIGRlcHRoKTtcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlcHRoO1xyXG5cdFx0Z2FtZS5tYXBzLnB1c2goZ2FtZS5tYXApO1xyXG5cdH1lbHNlIGlmIChnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IGdhbWUubWFwc1tkZXB0aCAtIDFdO1xyXG5cdH1cclxuXHRnYW1lLnNjZW5lID0gbnVsbDtcclxuXHRpZiAoZGVwdGgpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnZHVuZ2VvbicrZGVwdGgsIHRydWUpO1xyXG5cdGVsc2UgaWYgKG1hcCA9PT0gJ2NvZGV4Um9vbScpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnY29kZXhSb29tJywgdHJ1ZSk7XHJcblx0Z2FtZS5wbGF5ZXIuY3VycmVudE1hcCA9IG1hcDtcclxuXHRnYW1lLnBsYXllci5jdXJyZW50RGVwdGggPSBkZXB0aDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnByaW50R3JlZXQgPSBmdW5jdGlvbigpe1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRXZWxjb21lQmFjayA9IGZ1bmN0aW9uKCl7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5uZXdHYW1lID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmludmVudG9yeS5yZXNldCgpO1xyXG5cdHRoaXMucGxheWVyLnJlc2V0KCk7XHJcblx0XHJcblx0dGhpcy5tYXBzID0gW107XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMuY29uc29sZS5tZXNzYWdlcyA9IFtdO1x0XHJcblx0dGhpcy5zY2VuZSA9IG5ldyBUaXRsZVNjcmVlbih0aGlzKTtcclxuXHR0aGlzLmxvb3AoKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmVuZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbnZlbnRvcnkucmVzZXQoKTtcclxuXHR0aGlzLnBsYXllci5yZXNldCgpO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHR0aGlzLmNvbnNvbGUubWVzc2FnZXMgPSBbXTtcdFxyXG5cdHRoaXMuc2NlbmUgPSBuZXcgRW5kaW5nU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEdhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHRpZiAoZ2FtZS5HTC5hcmVJbWFnZXNSZWFkeSgpICYmIGdhbWUuYXVkaW8uYXJlU291bmRzUmVhZHkoKSl7XHJcblx0XHRnYW1lLnBvc3RMb2FkaW5nKCk7XHJcblx0XHRnYW1lLm5ld0dhbWUoKTtcclxuXHR9ZWxzZXtcclxuXHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb2FkR2FtZSgpOyB9KTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0cmV0dXJuIHRoaXMuaW52ZW50b3J5LmFkZEl0ZW0oaXRlbSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCB0ZXh0dXJlKXtcclxuXHR2YXIgY2FtZXJhID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHRoaXMuR0wuZHJhd09iamVjdChvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmxvY2sgPSBmdW5jdGlvbihibG9ja09iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KGJsb2NrT2JqZWN0LCBjYW1lcmEsIHRoaXMuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yV2FsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHRleElkLCB2ZXJ0aWNhbCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yVy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0aWYgKHZlcnRpY2FsKSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLE1hdGguUElfMiwwKTsgZWxzZSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLDAsMCk7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vclcsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JDdWJlID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JDLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yQywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vciA9IGZ1bmN0aW9uKHgsIHksIHosIHJvdGF0aW9uLCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRnYW1lLmRvb3Iucm90YXRpb24uYiA9IHJvdGF0aW9uO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3IsIGNhbWVyYSwgZ2FtZS5vYmplY3RUZXhbdGV4SWRdLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Zsb29yID0gZnVuY3Rpb24oZmxvb3JPYmplY3QsIHRleElkLCB0eXBlT2Ype1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHZhciBmdCA9IHR5cGVPZjtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZmxvb3JPYmplY3QsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgZnQpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0JpbGxib2FyZCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB0ZXhJZCwgYmlsbGJvYXJkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRpZiAoIWJpbGxib2FyZCkgYmlsbGJvYXJkID0gZ2FtZS5iaWxsYm9hcmQ7XHJcblx0XHJcblx0YmlsbGJvYXJkLnBvc2l0aW9uLnNldChwb3NpdGlvbik7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGJpbGxib2FyZCwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3U2xvcGUgPSBmdW5jdGlvbihzbG9wZU9iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuR0wuZHJhd09iamVjdChzbG9wZU9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcImZsb29yXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd1VJID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIHBsYXllciA9IGdhbWUubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRpZiAoIXBsYXllcikgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBjdHggPSBnYW1lLlVJLmN0eDtcclxuXHRcclxuXHQvLyBEcmF3IGhlYWx0aCBiYXJcclxuXHR2YXIgaHAgPSBwcy5ocCAvIHBzLm1IUDtcclxuXHRjdHguZmlsbFN0eWxlID0gKHBzLnBvaXNvbmVkKT8gXCJyZ2IoMTIyLDAsMTIyKVwiIDogXCJyZ2IoMTIyLDAsMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCw4LDc1LDQpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigyMDAsMCwyMDApXCIgOiBcInJnYigyMDAsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsKDc1ICogaHApIDw8IDAsNCk7XHJcblx0XHJcblx0Ly8gRHJhdyBtYW5hXHJcblx0dmFyIG1hbmEgPSBwcy5tYW5hIC8gcHMubU1hbmE7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKDE4MSw5OCwyMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiw2MCwyKTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LDEzOCwyOClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiwoNjAgKiBtYW5hKSA8PCAwLDIpO1xyXG5cdFxyXG5cdC8vIERyYXcgSW52ZW50b3J5XHJcblx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pXHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCwgOTAsIDYsIDApO1xyXG5cdGVsc2VcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAwKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW52ZW50b3J5Lml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdHZhciBzcHIgPSBpdGVtLnRleCArICdfdWknO1xyXG5cclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSAmJiAoaXRlbS50eXBlID09ICd3ZWFwb24nIHx8IGl0ZW0udHlwZSA9PSAnYXJtb3VyJykgJiYgaXRlbS5lcXVpcHBlZClcclxuXHRcdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkLCA5MCArICgyMiAqIGkpLCA2LCAwKTtcdFx0XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXNbc3ByXSwgOTMgKyAoMjIgKiBpKSwgOSwgaXRlbS5zdWJJbWcpO1xyXG5cdH1cclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5LCA5MCwgNiwgMSk7XHJcblx0XHJcblx0Ly8gSWYgdGhlIHBsYXllciBpcyBodXJ0IGRyYXcgYSByZWQgc2NyZWVuXHJcblx0aWYgKHBsYXllci5odXJ0ID4gMC4wKXtcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjUpXCI7XHJcblx0XHRjdHguZmlsbFJlY3QoMCwwLGN0eC53aWR0aCxjdHguaGVpZ2h0KTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wcm90ZWN0aW9uID4gMC4wKXtcdC8vIElmIHRoZSBwbGF5ZXIgaGFzIHByb3RlY3Rpb24gdGhlbiBkcmF3IGl0IHNsaWdodGx5IGJsdWVcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoNDAsNDAsMjU1LDAuMilcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucmVzdGFydCwgODUsIDk0LCAwKTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wYXVzZWQpe1xyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnBhdXNlZCwgMTQ3LCA5NCwgMCk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0RlcHRoICcrdGhpcy5mbG9vckRlcHRoLCAxMCwyNSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0xldmVsICcgKyBwcy5sdmwrJyAnK3RoaXMucGxheWVyLmNsYXNzTmFtZSwgMTAsMzMsdGhpcy5jb25zb2xlKTtcclxuXHR0aGlzLlVJLmRyYXdUZXh0KCdIUDogJytwcy5ocCwgMTAsOSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ01hbmE6Jytwcy5tYW5hLCAxMCwxNyx0aGlzLmNvbnNvbGUpO1xyXG5cclxuXHQvLyBEcmF3IHRoZSBjb21wYXNzXHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDApO1xyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZUV4dCh0aGlzLmltYWdlcy5jb21wYXNzLCAzMjAsIDEyLCAxLCBNYXRoLlBJICsgdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uLmIpO1xyXG5cclxuXHR2YXIgd2VhcG9uID0gdGhpcy5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0aWYgKHdlYXBvbiAmJiB3ZWFwb24udmlld1BvcnRJbWcgPj0gMClcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMsIDE2MCwgMTMwICsgdGhpcy5tYXAucGxheWVyLmxhdW5jaEF0dGFja0NvdW50ZXIgKiAyIC0gdGhpcy5tYXAucGxheWVyLmF0dGFja1dhaXQgKiAxLjUsIHdlYXBvbi52aWV3UG9ydEltZyk7XHJcblx0Z2FtZS5jb25zb2xlLnJlbmRlcig4LCAxMjApO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGV4cFBvaW50cyl7XHJcblx0dGhpcy5wbGF5ZXIuYWRkRXhwZXJpZW5jZShleHBQb2ludHMsIHRoaXMuY29uc29sZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5ID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcyA9IFtdO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljU3dvcmQnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWMnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ01hZ2UnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAnRHJ1aWQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdQYWxhZGluJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbGlnaHQnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0JhcmQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0Y2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGRlZmF1bHQ6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgncmVkUG90aW9uJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdEcnVpZCc6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2Jvd01hZ2ljJywgMC42KSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnc2xpbmdFdHRpbicsIDAuNykpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS51c2VJdGVtID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFjdGl2ZVNwZWxsID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdFxyXG5cdGlmIChwcy5tYW5hIDwgaXRlbS5tYW5hKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3QgZW5vdWdoIG1hbmFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHBzLm1hbmEgPSBNYXRoLm1heChwcy5tYW5hIC0gaXRlbS5tYW5hLCAwKTtcclxuXHRcclxuXHRzd2l0Y2ggKGl0ZW0uY29kZSl7XHJcblx0XHRjYXNlICdjdXJlJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1ghXCIpO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJZb3UgYXJlIGN1cmVkLlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWC4uLlwiKTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncmVkUG90aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2FybGljIHBvdGlvbiBjdXJlcyB5b3UuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaGVhbCc6XHJcblx0XHRcdHZhciBoZWFsID0gKHRoaXMucGxheWVyLm1IUCAqIGl0ZW0ucGVyY2VudCkgPDwgMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNQU5JISBcIitoZWFsICsgXCIgcG9pbnRzIGhlYWxlZFwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd5ZWxsb3dQb3Rpb24nOlxyXG5cdFx0XHR2YXIgaGVhbCA9IDEwMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2luc2VuZyBwb3Rpb24gaGVhbHMgeW91IGZvciBcIitoZWFsICsgXCIgcG9pbnRzLlwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdsaWdodCc6XHJcblx0XHRcdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5HTC5saWdodCA9IGl0ZW0ubGlnaHRUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBMT1IhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnbWlzc2lsZSc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRcdFx0bWlzc2lsZS5pbml0KHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnbWFnaWNNaXNzaWxlJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIkdSQVYgUE9SIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdpY2ViYWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdpY2VCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGUklPIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZXBlbCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnYmxpbmsnOlxyXG5cdFx0XHR2YXIgbGFzdFBvcyA9IG51bGw7XHJcblx0XHRcdHZhciBwb3J0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMubWFwLnBsYXllci5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlyID0gdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyLmIpO1xyXG5cdFx0XHR2YXIgZHogPSAtTWF0aC5zaW4oZGlyLmIpO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8MTU7aSsrKXtcclxuXHRcdFx0XHRwb3MuYSArPSBkeDtcclxuXHRcdFx0XHRwb3MuYyArPSBkejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY3ggPSBwb3MuYSA8PCAwO1xyXG5cdFx0XHRcdHZhciBjeSA9IHBvcy5jIDw8IDA7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFwLmlzU29saWQoY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcG9ydGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aSA9IDE1O1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1hcC5pc1dhdGVyUG9zaXRpb24oY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRcdHZhciBpbnMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWlucyl7XHJcblx0XHRcdFx0XHRcdFx0bGFzdFBvcyA9IHZlYzMoY3gsIHBvcy5iLCBjeSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghcG9ydGVkKXtcclxuXHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnZmlyZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0XHRcdG1pc3NpbGUuaW5pdChwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2ZpcmVCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGTEFNIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdwcm90ZWN0aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMucHJvdGVjdGlvbiA9IGl0ZW0ucHJvdFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFNBTkNUIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3RpbWUnOlxyXG5cdFx0XHRpZiAodGhpcy50aW1lU3RvcCA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMudGltZVN0b3AgPSBpdGVtLnN0b3BUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJSRUwgVFlNIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3NsZWVwJzpcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFpVIVwiKTtcclxuXHRcdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwLmdldEluc3RhbmNlc05lYXJlc3QocC5wb3NpdGlvbiwgNiwgJ2VuZW15Jyk7XHJcblx0XHRcdGZvciAodmFyIGk9MCxsZW49aW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdGluc3RhbmNlc1tpXS5zbGVlcCA9IGl0ZW0uc2xlZXBUaW1lO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnamlueCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndHJlbW9yJzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdraWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdraWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlhFTiBDT1JQIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpbmRleCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGkpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaV07XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwLnBsYXllcjtcclxuXHR2YXIgY2xlYW5Qb3MgPSB0aGlzLm1hcC5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZShwbGF5ZXIucG9zaXRpb24uYSwgcGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdGlmICghY2xlYW5Qb3Mpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnQ2Fubm90IGRyb3AgaXQgaGVyZScpO1xyXG5cdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIGRyb3BwZWQnKTtcclxuXHRcdGNsZWFuUG9zLmEgKz0gMC41O1xyXG5cdFx0Y2xlYW5Qb3MuYyArPSAwLjU7XHJcblx0XHRcclxuXHRcdHZhciBuSXQgPSBuZXcgSXRlbSgpO1xyXG5cdFx0bkl0LmluaXQoY2xlYW5Qb3MsIG51bGwsIHRoaXMubWFwKTtcclxuXHRcdG5JdC5zZXRJdGVtKGl0ZW0pO1xyXG5cdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobkl0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaSk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY2hlY2tJbnZDb250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdFxyXG5cdGlmIChwbGF5ZXIgJiYgcGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgyKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpO1xyXG5cdFx0XHR0aGlzLm5ld0dhbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKCFwbGF5ZXIgfHwgcGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODApKXtcclxuXHRcdHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5wYXVzZWQpIHJldHVybjtcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDg0KSl7XHJcblx0XHRpZiAoIXRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdTZWxlY3QgdGhlIGl0ZW0gdG8gZHJvcCcpO1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gdHJ1ZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0dmFyIGluZGV4ID0gNDkgKyBpO1xyXG5cdFx0aWYgKGkgPT0gOSlcclxuXHRcdFx0aW5kZXggPSA0ODtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoaW5kZXgpKXtcclxuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdFx0aWYgKCFpdGVtKXtcclxuXHRcdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdObyBpdGVtJyk7XHJcblx0XHRcdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0dGhpcy5kcm9wSXRlbShpKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGl0ZW0udHlwZSA9PSAnd2VhcG9uJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdpZWxkZWQnKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ2FybW91cicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3b3JuJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdtYWdpYycpe1xyXG5cdFx0XHRcdHRoaXMuYWN0aXZlU3BlbGwoaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3BvdGlvbicpe1xyXG5cdFx0XHRcdHRoaXMudXNlSXRlbShpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gXHJcblx0XHJcblx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmIChwcy5wb3Rpb25zID4gMCl7XHJcblx0XHRpZiAocHMuaHAgPT0gcHMubUhQKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkhlYWx0aCBpcyBhbHJlYWR5IGF0IG1heFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRwcy5wb3Rpb25zIC09IDE7XHJcblx0XHRwcy5ocCA9IE1hdGgubWluKHBzLm1IUCwgcHMuaHAgKyA1KTtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQb3Rpb24gdXNlZFwiKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJObyBtb3JlIHBvdGlvbnMgbGVmdC5cIik7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2xvYmFsTG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApeyB0aGlzLnByb3RlY3Rpb24gLT0gMTsgfVxyXG5cdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7IHRoaXMudGltZVN0b3AgLT0gMTsgfVxyXG5cdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7IHRoaXMuR0wubGlnaHQgLT0gMTsgfVxyXG5cdFxyXG5cdHRoaXMucGxheWVyLnJlZ2VuTWFuYSgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG5cdHZhciBkVCA9IChub3cgLSBnYW1lLmxhc3RUKTtcclxuXHRcclxuXHQvLyBMaW1pdCB0aGUgZ2FtZSB0byB0aGUgYmFzZSBzcGVlZCBvZiB0aGUgZ2FtZVxyXG5cdGlmIChkVCA+IGdhbWUuZnBzKXtcclxuXHRcdGdhbWUubGFzdFQgPSBub3cgLSAoZFQgJSBnYW1lLmZwcyk7XHJcblx0XHRcclxuXHRcdGlmICghZ2FtZS5HTC5hY3RpdmUpe1xyXG5cdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTsgXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMubWFwICE9IG51bGwpe1xyXG5cdFx0XHR2YXIgZ2wgPSBnYW1lLkdMLmN0eDtcclxuXHRcdFx0XHJcblx0XHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHRcdFx0Z2FtZS5VSS5jbGVhcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0Z2FtZS5nbG9iYWxMb29wKCk7XHJcblx0XHRcdGdhbWUuY2hlY2tJbnZDb250cm9sKCk7XHJcblx0XHRcdGdhbWUubWFwLmxvb3AoKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLm1hcClcclxuXHRcdFx0XHRnYW1lLmRyYXdVSSgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodGhpcy5zY2VuZSAhPSBudWxsKXtcclxuXHRcdFx0Z2FtZS5zY2VuZS5sb29wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb29wKCk7IH0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0S2V5UHJlc3NlZCA9IGZ1bmN0aW9uKGtleUNvZGUpe1xyXG5cdGlmICh0aGlzLmtleXNba2V5Q29kZV0gPT0gMSl7XHJcblx0XHR0aGlzLmtleXNba2V5Q29kZV0gPSAyO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE1vdXNlQnV0dG9uUHJlc3NlZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubW91c2UuYyA9PSAxKXtcclxuXHRcdHRoaXMubW91c2UuYyA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHJldCA9IHt4OiB0aGlzLm1vdXNlTW92ZW1lbnQueCwgeTogdGhpcy5tb3VzZU1vdmVtZW50Lnl9O1xyXG5cdHRoaXMubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSBuZXcgVW5kZXJ3b3JsZCgpO1xyXG5cdGdhbWUubG9hZEdhbWUoKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGUua2V5Q29kZSA9PSA4KXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLmtleXNbZS5rZXlDb2RlXSA9PSAyKSByZXR1cm47XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwia2V5dXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Z2FtZS5rZXlzW2Uua2V5Q29kZV0gPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubWFwICE9IG51bGwpXHJcblx0XHRcdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5jID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUubW91c2UuYyA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRnYW1lLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFx0Z2FtZS5udW1iZXJGcmFtZXMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJyZXNpemVcIiwgZnVuY3Rpb24oKXtcclxuXHRcdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBnYW1lLnNpemUuYjtcclxuXHRcdHZhciBjYW52YXMgPSBnYW1lLkdMLmNhbnZhcztcclxuXHRcdFxyXG5cdFx0Y2FudmFzID0gZ2FtZS5VSS5jYW52YXM7XHJcblx0XHRnYW1lLlVJLnNjYWxlID0gY2FudmFzLm9mZnNldEhlaWdodCAvIGNhbnZhcy5oZWlnaHQ7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIG1vdmVDYWxsYmFjayA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnggPSBlLm1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdGdhbWUubW91c2VNb3ZlbWVudC55ID0gZS5tb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS5tb3pNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS53ZWJraXRNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0MDtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBwb2ludGVybG9ja2NoYW5nZSA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKGRvY3VtZW50LnBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50Lm1velBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50LndlYmtpdFBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlQ2FsbGJhY2spO1xyXG5cdFx0XHRnYW1lLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwicG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIm1venBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJ3ZWJraXRwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImJsdXJcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gZmFsc2U7IGdhbWUuYXVkaW8ucGF1c2VNdXNpYygpOyAgfSk7XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKGUpeyBnYW1lLkdMLmFjdGl2ZSA9IHRydWU7IGdhbWUuYXVkaW8ucmVzdG9yZU11c2ljKCk7IH0pO1xyXG59KTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0YWRkRXZlbnQ6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZ1bmMpe1xyXG5cdFx0aWYgKG9iai5hZGRFdmVudExpc3RlbmVyKXtcclxuXHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuYywgZmFsc2UpO1xyXG5cdFx0fWVsc2UgaWYgKG9iai5hdHRhY2hFdmVudCl7XHJcblx0XHRcdG9iai5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmdW5jKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdCQkOiBmdW5jdGlvbihvYmpJZCl7XHJcblx0XHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9iaklkKTtcclxuXHRcdGlmICghZWxlbSkgYWxlcnQoXCJDb3VsZG4ndCBmaW5kIGVsZW1lbnQ6IFwiICsgb2JqSWQpO1xyXG5cdFx0cmV0dXJuIGVsZW07XHJcblx0fSxcclxuXHRnZXRIdHRwOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGh0dHA7XHJcblx0XHRpZiAgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcdH1lbHNlIGlmICh3aW5kb3cuQWN0aXZlWE9iamVjdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGh0dHA7XHJcblx0fSxcclxuXHRyb2xsRGljZTogZnVuY3Rpb24gKHBhcmFtKXtcclxuXHRcdHZhciBhID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKDAsIHBhcmFtLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRcdHZhciBiID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKHBhcmFtLmluZGV4T2YoJ0QnKSArIDEpLCAxMCk7XHJcblx0XHR2YXIgcm9sbDEgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBiKTtcclxuXHRcdHZhciByb2xsMiA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0cmV0dXJuIE1hdGguY2VpbChhICogKHJvbGwxK3JvbGwyKS8yKTtcclxuXHR9XHJcbn1cclxuXHRcclxuLy8gTWF0aCBwcm90b3R5cGUgb3ZlcnJpZGVzXHRcclxuTWF0aC5yYWRSZWxhdGlvbiA9IE1hdGguUEkgLyAxODA7XHJcbk1hdGguZGVnUmVsYXRpb24gPSAxODAgLyBNYXRoLlBJO1xyXG5NYXRoLmRlZ1RvUmFkID0gZnVuY3Rpb24oZGVncmVlcyl7XHJcblx0cmV0dXJuIGRlZ3JlZXMgKiB0aGlzLnJhZFJlbGF0aW9uO1xyXG59O1xyXG5NYXRoLnJhZFRvRGVnID0gZnVuY3Rpb24ocmFkaWFucyl7XHJcblx0cmV0dXJuICgocmFkaWFucyAqIHRoaXMuZGVnUmVsYXRpb24pICsgNzIwKSAlIDM2MDtcclxufTtcclxuTWF0aC5pUmFuZG9tID0gZnVuY3Rpb24oYSwgYil7XHJcblx0aWYgKGIgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRiID0gYTtcclxuXHRcdGEgPSAwO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gYSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChiIC0gYSkpO1xyXG59O1xyXG5cclxuTWF0aC5nZXRBbmdsZSA9IGZ1bmN0aW9uKC8qVmVjMiovIGEsIC8qVmVjMiovIGIpe1xyXG5cdHZhciB4eCA9IE1hdGguYWJzKGEuYSAtIGIuYSk7XHJcblx0dmFyIHl5ID0gTWF0aC5hYnMoYS5jIC0gYi5jKTtcclxuXHRcclxuXHR2YXIgYW5nID0gTWF0aC5hdGFuMih5eSwgeHgpO1xyXG5cdFxyXG5cdC8vIEFkanVzdCB0aGUgYW5nbGUgYWNjb3JkaW5nIHRvIGJvdGggcG9zaXRpb25zXHJcblx0aWYgKGIuYSA8PSBhLmEgJiYgYi5jIDw9IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJIC0gYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPD0gYS5hICYmIGIuYyA+IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJICsgYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPiBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkyIC0gYW5nO1xyXG5cdH1cclxuXHRcclxuXHRhbmcgPSAoYW5nICsgTWF0aC5QSTIpICUgTWF0aC5QSTI7XHJcblx0XHJcblx0cmV0dXJuIGFuZztcclxufTtcclxuXHJcbk1hdGguUElfMiA9IE1hdGguUEkgLyAyO1xyXG5NYXRoLlBJMiA9IE1hdGguUEkgKiAyO1xyXG5NYXRoLlBJM18yID0gTWF0aC5QSSAqIDMgLyAyO1xyXG5cclxuLy8gQ3Jvc3Nicm93c2VyIGFuaW1hdGlvbi9hdWRpbyBvdmVycmlkZXNcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gXHJcblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fCBcclxuXHR3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxyXG5cdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHwgXHJcblx0d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fCBcclxuXHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8IFxyXG5cdGZ1bmN0aW9uKC8qIGZ1bmN0aW9uICovIGRyYXcxKXtcclxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KGRyYXcxLCAxMDAwIC8gMzApO1xyXG5cdH07XHJcblxyXG53aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0OyIsInZhciBNYXRyaXggPSByZXF1aXJlKCcuL01hdHJpeCcpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBXZWJHTChzaXplLCBjb250YWluZXIpe1xyXG5cdGlmICghdGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcikpIHJldHVybiBudWxsOyBcclxuXHR0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblx0dGhpcy5wcm9jZXNzU2hhZGVycygpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzID0gW107XHJcblx0XHJcblx0dGhpcy5hY3RpdmUgPSB0cnVlO1xyXG5cdHRoaXMubGlnaHQgPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYkdMO1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHRpZiAoIWNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpKXtcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiKTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpO1xyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdFByb3BlcnRpZXMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcclxuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcblx0Z2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKCBnbC5CTEVORCApO1xyXG5cdGdsLmJsZW5kRXF1YXRpb24oIGdsLkZVTkNfQUREICk7XHJcblx0Z2wuYmxlbmRGdW5jKCBnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEgKTtcclxuXHRcclxuXHR0aGlzLmFzcGVjdFJhdGlvID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcblx0dGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCA9IE1hdHJpeC5tYWtlUGVyc3BlY3RpdmUoNDUsIHRoaXMuYXNwZWN0UmF0aW8sIDAuMDAyLCA1LjApO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnByb2Nlc3NTaGFkZXJzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBDb21waWxlIGZyYWdtZW50IHNoYWRlclxyXG5cdHZhciBlbFNoYWRlciA9IFV0aWxzLiQkKFwiZnJhZ21lbnRTaGFkZXJcIik7XHJcblx0dmFyIGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciBmU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XHJcblx0Z2wuc2hhZGVyU291cmNlKGZTaGFkZXIsIGNvZGUpO1xyXG5cdGdsLmNvbXBpbGVTaGFkZXIoZlNoYWRlcik7XHJcblx0XHJcblx0Ly8gQ29tcGlsZSB2ZXJ0ZXggc2hhZGVyXHJcblx0ZWxTaGFkZXIgPSBVdGlscy4kJChcInZlcnRleFNoYWRlclwiKTtcclxuXHRjb2RlID0gdGhpcy5nZXRTaGFkZXJDb2RlKGVsU2hhZGVyKTtcclxuXHR2YXIgdlNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UodlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcih2U2hhZGVyKTtcclxuXHRcclxuXHQvLyBDcmVhdGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblx0dGhpcy5zaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIGZTaGFkZXIpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIHZTaGFkZXIpO1xyXG5cdGdsLmxpbmtQcm9ncmFtKHRoaXMuc2hhZGVyUHJvZ3JhbSk7XHJcblx0XHJcblx0aWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcblx0XHRhbGVydChcIkVycm9yIGluaXRpYWxpemluZyB0aGUgc2hhZGVyIHByb2dyYW1cIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG4gIFxyXG5cdGdsLnVzZVByb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHQvLyBHZXQgYXR0cmlidXRlIGxvY2F0aW9uc1xyXG5cdHRoaXMuYVZlcnRleFBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFWZXJ0ZXhQb3NpdGlvblwiKTtcclxuXHR0aGlzLmFUZXh0dXJlQ29vcmQgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVRleHR1cmVDb29yZFwiKTtcclxuXHR0aGlzLmFWZXJ0ZXhJc0RhcmsgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleElzRGFya1wiKTtcclxuXHRcclxuXHQvLyBFbmFibGUgYXR0cmlidXRlc1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleFBvc2l0aW9uKTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFUZXh0dXJlQ29vcmQpO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleElzRGFyayk7XHJcblx0XHJcblx0Ly8gR2V0IHRoZSB1bmlmb3JtIGxvY2F0aW9uc1xyXG5cdHRoaXMudVNhbXBsZXIgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVTYW1wbGVyXCIpO1xyXG5cdHRoaXMudVRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1VHJhbnNmb3JtYXRpb25NYXRyaXhcIik7XHJcblx0dGhpcy51UGVyc3BlY3RpdmVNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQZXJzcGVjdGl2ZU1hdHJpeFwiKTtcclxuXHR0aGlzLnVQYWludEluUmVkID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1UGFpbnRJblJlZFwiKTtcclxuXHR0aGlzLnVMaWdodERlcHRoID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1TGlnaHREZXB0aFwiKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5nZXRTaGFkZXJDb2RlID0gZnVuY3Rpb24oc2hhZGVyKXtcclxuXHR2YXIgY29kZSA9IFwiXCI7XHJcblx0dmFyIG5vZGUgPSBzaGFkZXIuZmlyc3RDaGlsZDtcclxuXHR2YXIgdG4gPSBub2RlLlRFWFRfTk9ERTtcclxuXHRcclxuXHR3aGlsZSAobm9kZSl7XHJcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PSB0bilcclxuXHRcdFx0Y29kZSArPSBub2RlLnRleHRDb250ZW50O1xyXG5cdFx0bm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBjb2RlO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uKHNyYywgbWFrZUl0VGV4dHVyZSwgdGV4dHVyZUluZGV4LCBpc1NvbGlkLCBwYXJhbXMpe1xyXG5cdGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcclxuXHRpZiAoIXBhcmFtcy5pbWdOdW0pIHBhcmFtcy5pbWdOdW0gPSAxO1xyXG5cdGlmICghcGFyYW1zLmltZ1ZOdW0pIHBhcmFtcy5pbWdWTnVtID0gMTtcclxuXHRpZiAoIXBhcmFtcy54T3JpZykgcGFyYW1zLnhPcmlnID0gMDtcclxuXHRpZiAoIXBhcmFtcy55T3JpZykgcGFyYW1zLnlPcmlnID0gMDtcclxuXHRcclxuXHR2YXIgZ2wgPSB0aGlzO1xyXG5cdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcclxuXHRpbWcuc3JjID0gc3JjO1xyXG5cdGltZy5yZWFkeSA9IGZhbHNlO1xyXG5cdGltZy50ZXh0dXJlID0gbnVsbDtcclxuXHRpbWcudGV4dHVyZUluZGV4ID0gdGV4dHVyZUluZGV4O1xyXG5cdGltZy5pc1NvbGlkID0gKGlzU29saWQgPT09IHRydWUpO1xyXG5cdGltZy5pbWdOdW0gPSBwYXJhbXMuaW1nTnVtO1xyXG5cdGltZy52SW1nTnVtID0gcGFyYW1zLmltZ1ZOdW07XHJcblx0aW1nLnhPcmlnID0gcGFyYW1zLnhPcmlnO1xyXG5cdGltZy55T3JpZyA9IHBhcmFtcy55T3JpZztcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChpbWcsIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdFx0aW1nLmltZ1dpZHRoID0gaW1nLndpZHRoIC8gaW1nLmltZ051bTtcclxuXHRcdGltZy5pbWdIZWlnaHQgPSBpbWcuaGVpZ2h0IC8gaW1nLnZJbWdOdW07XHJcblx0XHRpbWcucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobWFrZUl0VGV4dHVyZSl7XHJcblx0XHRcdGltZy50ZXh0dXJlID0gZ2wucGFyc2VUZXh0dXJlKGltZyk7XHJcblx0XHRcdGltZy50ZXh0dXJlLnRleHR1cmVJbmRleCA9IGltZy50ZXh0dXJlSW5kZXg7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0Z2wuaW1hZ2VzLnB1c2goaW1nKTtcclxuXHRyZXR1cm4gaW1nO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnBhcnNlVGV4dHVyZSA9IGZ1bmN0aW9uKGltZyl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ3JlYXRlcyBhIHRleHR1cmUgaG9sZGVyIHRvIHdvcmsgd2l0aFxyXG5cdHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcclxuXHRcclxuXHQvLyBGbGlwIHZlcnRpY2FsIHRoZSB0ZXh0dXJlXHJcblx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblx0XHJcblx0Ly8gTG9hZCB0aGUgaW1hZ2UgZGF0YVxyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcclxuXHRcclxuXHQvLyBBc3NpZ24gcHJvcGVydGllcyBvZiBzY2FsaW5nXHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcclxuXHRcclxuXHQvLyBSZWxlYXNlcyB0aGUgdGV4dHVyZSBmcm9tIHRoZSB3b3Jrc3BhY2VcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcclxuXHRyZXR1cm4gdGV4O1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdmVydGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC52ZXJ0ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4UG9zaXRpb24sIG9iamVjdC52ZXJ0ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdGV4dHVyZSBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFUZXh0dXJlQ29vcmQsIG9iamVjdC50ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgZGFyayBidWZmZXIgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0aWYgKG9iamVjdC5kYXJrQnVmZmVyKXtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QuZGFya0J1ZmZlcik7XHJcblx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleElzRGFyaywgb2JqZWN0LmRhcmtCdWZmZXIuaXRlbVNpemUsIGdsLlVOU0lHTkVEX0JZVEUsIGZhbHNlLCAwLCAwKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gUGFpbnQgdGhlIG9iamVjdCBpbiByZWQgKFdoZW4gaHVydCBmb3IgZXhhbXBsZSlcclxuXHR2YXIgcmVkID0gKG9iamVjdC5wYWludEluUmVkKT8gMS4wIDogMC4wOyBcclxuXHRnbC51bmlmb3JtMWYodGhpcy51UGFpbnRJblJlZCwgcmVkKTtcclxuXHRcclxuXHQvLyBIb3cgbXVjaCBsaWdodCB0aGUgcGxheWVyIGNhc3RcclxuXHR2YXIgbGlnaHQgPSAodGhpcy5saWdodCA+IDApPyAwLjAgOiAxLjA7XHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudUxpZ2h0RGVwdGgsIGxpZ2h0KTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHRleHR1cmUgdG8gd29yayB3aXRoXHJcblx0Z2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblx0Z2wudW5pZm9ybTFpKHRoaXMudVNhbXBsZXIsIDApO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybSB0aGUgb2JqZWN0XHJcblx0dmFyIHRyYW5zZm9ybWF0aW9uTWF0cml4ID0gTWF0cml4Lm1ha2VUcmFuc2Zvcm0ob2JqZWN0LCBjYW1lcmEpO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGluZGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgb2JqZWN0LmluZGljZXNCdWZmZXIpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybWF0aW9uIG1hdHJpY2VzXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCkpO1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRyYW5zZm9ybWF0aW9uTWF0cml4KSk7XHJcblx0XHJcblx0aWYgKG9iamVjdC5ub1JvdGF0ZSkgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdC8vIERyYXcgdGhlIHRyaWFuZ2xlc1xyXG5cdGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIG9iamVjdC5pbmRpY2VzQnVmZmVyLm51bUl0ZW1zLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuYXJlSW1hZ2VzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbWFnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuaW1hZ2VzW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyJdfQ==
