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
var Missile = require('./Missile');

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
};

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

Enemy.prototype.castMissile = function(player){
	var game = this.mapManager.game;
	var ps = game.player;
	
	var str = Utils.rollDice(this.enemy.stats.str);
	var dir = Math.getAngle(this.position, player.position);
	
	var missile = new Missile();
	missile.init(this.position.clone(), vec2(0, dir), 'bow', 'player', this.mapManager);
	missile.str = str << 0;
	missile.spd *= 0.5;

	this.mapManager.instances.push(missile);
	this.attackWait = 90;
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
			
			if (this.enemy.stats.ranged && xx <= 3 && yy <= 3){
				this.castMissile(player);
				return;
			}else if (xx <= 1 && yy <=1){
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
		
		if ((xx <= 1 && yy <=1) || (this.enemy.stats.ranged && xx <= 3 && yy <= 3)){
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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\AnimatedTexture.js","./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Missile.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\src\\EnemyFactory.js":[function(require,module,exports){
module.exports = {
	enemies: {
		bat: {name: 'Giant Bat', hp: 48, textureBase: 'bat', stats: {str: '1D9', dfs: '2D2', exp: 4, fly: true}},
		rat: {name: 'Giant Rat', hp: 48, textureBase: 'rat', stats: {str: '1D9', dfs: '2D2', exp: 4}},
		spider: {name: 'Giant Spider', hp: 64, textureBase: 'spider', stats: {str: '1D11', dfs: '2D2', exp: 5}},
		gremlin: {name: 'Gremlin', hp: 48, textureBase: 'gremlin', stats: {str: '2D9', dfs: '2D2', exp: 4}},
		skeleton: {name: 'Skeleton', hp: 48, textureBase: 'skeleton', stats: {str: '3D4', dfs: '2D2', exp: 4}},
		headless: {name: 'Headless', hp: 64, textureBase: 'headless', stats: {str: '3D5', dfs: '2D2', exp: 5}},
		//nixie: {name: 'Nixie', hp: 64, textureBase: 'bat', stats: {str: '3D5', dfs: '2D2', exp: 5}},				// not in u5
		wisp: {name: 'Wisp', hp: 64, textureBase: 'wisp', stats: {str: '2D10', dfs: '2D2', exp: 5, ranged: true}},
		ghost: {name: 'Ghost', hp: 80, textureBase: 'ghost', stats: {str: '2D15', dfs: '2D2', exp: 6, fly: true}},
		troll: {name: 'Troll', hp: 96, textureBase: 'troll', stats: {str: '4D5', dfs: '2D2', exp: 7}}, // Not used by the generator?
		lavaLizard: {name: 'Lava Lizard', hp: 96, textureBase: 'lavaLizard', stats: {str: '4D5', dfs: '2D2', exp: 7}},
		mongbat: {name: 'Mongbat', hp: 96, textureBase: 'mongbat', stats: {str: '4D5', dfs: '2D2', exp: 7, fly: true}}, 
		octopus: {name: 'Giant Squid', hp: 96, textureBase: 'octopus', stats: {str: '3D6', dfs: '2D2', exp: 9, swim: true}},
		daemon: {name: 'Daemon', hp: 112, textureBase: 'daemon', stats: {str: '4D5', dfs: '2D2', exp: 8, ranged: true}},
		//phantom: {name: 'Phantom', hp: 128, textureBase: 'bat', stats: {str: '1D15', dfs: '2D2', exp: 9}},			// not in u5
		seaSerpent: {name: 'Sea Serpent', hp: 128, textureBase: 'seaSerpent', stats: {str: '3D6', dfs: '2D2', exp: 9, swim: true}},
		evilMage: {name: 'Evil Mage', hp: 176, textureBase: 'mage', stats: {str: '6D5', dfs: '2D2', exp: 12, ranged: true}}, //TODO: Add texture
		liche: {name: 'Liche', hp: 192, textureBase: 'liche', stats: {str: '9D4', dfs: '2D2', exp: 13, ranged: true}},
		hydra: {name: 'Hydra', hp: 208, textureBase: 'hydra', stats: {str: '9D4', dfs: '2D2', exp: 14}},
		dragon: {name: 'Dragon', hp: 224, textureBase: 'dragon', stats: {str: '9D4', dfs: '2D2', exp: 15, fly: true, ranged: true}},				// Not suitable
		zorn: {name: 'Zorn', hp: 240, textureBase: 'zorn', stats: {str: '9D4', dfs: '2D2', exp: 16}},
		gazer: {name: 'Gazer', hp: 240, textureBase: 'gazer', stats: {str: '5D8', dfs: '2D2', exp: 16, fly: true, ranged: true}},
		reaper: {name: 'Reaper', hp: 255, textureBase: 'reaper', stats: {str: '5D8', dfs: '2D2', exp: 16, ranged: true}},
		balron: {name: 'Balron', hp: 255, textureBase: 'balron', stats: {str: '9D4', dfs: '2D2', exp: 16, ranged: true}},
		//twister: {name: 'Twister', hp: 25, textureBase: 'bat', stats: {str: '4D2', dfs: '2D2', exp: 5}},			// not in u5
		
		warrior: {name: 'Fighter', hp: 98, textureBase: 'fighter', stats: {str: '5D5', dfs: '2D2', exp: 7}},
		mage: {name: 'Mage', hp: 112, textureBase: 'mage', stats: {str: '5D5', dfs: '2D2', exp: 8, ranged: true}},
		bard: {name: 'Bard', hp: 48, textureBase: 'bard', stats: {str: '2D10', dfs: '2D2', exp: 7}},
		druid: {name: 'Druid', hp: 64, textureBase: 'mage', stats: {str: '3D5', dfs: '2D2', exp: 10}},
		tinker: {name: 'Tinker', hp: 96, textureBase: 'ranger', stats: {str: '4D5', dfs: '2D2', exp: 9}},
		paladin: {name: 'Paladin', hp: 128, textureBase: 'fighter', stats: {str: '5D5', dfs: '2D2', exp: 4}},
		shepherd: {name: 'Shepherd', hp: 48, textureBase: 'ranger', stats: {str: '3D3', dfs: '2D2', exp: 9}},
		ranger: {name: 'Ranger', hp: 144, textureBase: 'ranger', stats: {str: '5D5', dfs: '2D2', exp: 3, ranged: true}}
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
};

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
};


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
	}else if (this.target == 'player'){
		ins = this.mapManager.player;
		var xx = Math.abs(ins.position.a - this.position.a);
		var zz = Math.abs(ins.position.c - this.position.c);
		if (zz > 0.5 || xx > 0.5) return true;
		
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
	this.objectTex.items = this.GL.loadImage(cp + this.grPack + "texItems.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.items.buffers = AnimatedTexture.getTextureBufferCoords(8, 8, this.GL.ctx);
	this.objectTex.itemsMisc = this.GL.loadImage(cp + this.grPack + "texMisc.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.itemsMisc.buffers = AnimatedTexture.getTextureBufferCoords(8, 4, this.GL.ctx);
	
	this.objectTex.spells = this.GL.loadImage(cp + this.grPack + "texSpells.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.spells.buffers = AnimatedTexture.getTextureBufferCoords(4, 4, this.GL.ctx);
	
	// Magic Bolts
	this.objectTex.bolts = this.GL.loadImage(cp + this.grPack + "texBolts.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.bolts.buffers = AnimatedTexture.getTextureBufferCoords(4, 2, this.GL.ctx);
	
	// Stairs
	this.objectTex.stairs = this.GL.loadImage(cp + this.grPack + "texStairs.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.stairs.buffers = AnimatedTexture.getTextureBufferCoords(2, 2, this.GL.ctx);
	
	// Enemies
	this.objectTex.bat_run = this.GL.loadImage(cp + this.grPack + "enemies/texBatRun.png?version=" + version, true, 1, true, {clampWrap: true});
	this.objectTex.rat_run = this.GL.loadImage(cp + this.grPack + "enemies/texRatRun.png?version=" + version, true, 2, true, {clampWrap: true});
	this.objectTex.spider_run = this.GL.loadImage(cp + this.grPack + "enemies/texSpiderRun.png?version=" + version, true, 3, true, {clampWrap: true});
	this.objectTex.troll_run = this.GL.loadImage(cp + this.grPack + "enemies/texTrollRun.png?version=" + version, true, 4, true, {clampWrap: true});
	this.objectTex.gazer_run = this.GL.loadImage(cp + this.grPack + "enemies/texGazerRun.png?version=" + version, true, 5, true, {clampWrap: true});
	this.objectTex.ghost_run = this.GL.loadImage(cp + this.grPack + "enemies/texGhostRun.png?version=" + version, true, 6, true, {clampWrap: true});
	this.objectTex.headless_run = this.GL.loadImage(cp + this.grPack + "enemies/texHeadlessRun.png?version=" + version, true, 7, true, {clampWrap: true});
	this.objectTex.orc_run = this.GL.loadImage(cp + this.grPack + "enemies/texOrcRun.png?version=" + version, true, 8, true, {clampWrap: true});
	this.objectTex.reaper_run = this.GL.loadImage(cp + this.grPack + "enemies/texReaperRun.png?version=" + version, true, 9, true, {clampWrap: true});
	this.objectTex.skeleton_run = this.GL.loadImage(cp + this.grPack + "enemies/texSkeletonRun.png?version=" + version, true, 10, true, {clampWrap: true});
	
	this.objectTex.daemon_run = this.GL.loadImage(cp + this.grPack + "enemies/texDaemonRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.mongbat_run = this.GL.loadImage(cp + this.grPack + "enemies/texMongbatRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.hydra_run = this.GL.loadImage(cp + this.grPack + "enemies/texHydraRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.seaSerpent_run = this.GL.loadImage(cp + this.grPack + "enemies/texSeaSerpentRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.octopus_run = this.GL.loadImage(cp + this.grPack + "enemies/texOctopusRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.balron_run = this.GL.loadImage(cp + this.grPack + "enemies/texBalronRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.liche_run = this.GL.loadImage(cp + this.grPack + "enemies/texLicheRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.ghost_run = this.GL.loadImage(cp + this.grPack + "enemies/texGhostRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.gremlin_run = this.GL.loadImage(cp + this.grPack + "enemies/texGremlinRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.dragon_run = this.GL.loadImage(cp + this.grPack + "enemies/texDragonRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.zorn_run = this.GL.loadImage(cp + this.grPack + "enemies/texZornRun.png?version=" + version, true, 10, true, {clampWrap: true});
	
	this.objectTex.wisp_run = this.GL.loadImage(cp + this.grPack + "enemies/texWispRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.mage_run = this.GL.loadImage(cp + this.grPack + "enemies/texMageRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.ranger_run = this.GL.loadImage(cp + this.grPack + "enemies/texRangerRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.fighter_run = this.GL.loadImage(cp + this.grPack + "enemies/texFighterRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.bard_run = this.GL.loadImage(cp + this.grPack + "enemies/texBardRun.png?version=" + version, true, 10, true, {clampWrap: true});
	this.objectTex.lavaLizard_run = this.GL.loadImage(cp + this.grPack + "enemies/texLavaLizardRun.png?version=" + version, true, 10, true, {clampWrap: true});
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
			img.texture = gl.parseTexture(img, params.clampWrap);
			img.texture.textureIndex = img.textureIndex;
		}
	});
	
	gl.images.push(img);
	return img;
};

WebGL.prototype.parseTexture = function(img, clampEdges){
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
	if (clampEdges){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi5cXHNyY1xcQW5pbWF0ZWRUZXh0dXJlLmpzIiwiLi5cXHNyY1xcQXVkaW8uanMiLCIuLlxcc3JjXFxCaWxsYm9hcmQuanMiLCIuLlxcc3JjXFxDb25zb2xlLmpzIiwiLi5cXHNyY1xcRG9vci5qcyIsIi4uXFxzcmNcXEVuZGluZ1NjcmVlbi5qcyIsIi4uXFxzcmNcXEVuZW15LmpzIiwiLi5cXHNyY1xcRW5lbXlGYWN0b3J5LmpzIiwiLi5cXHNyY1xcSW52ZW50b3J5LmpzIiwiLi5cXHNyY1xcSXRlbS5qcyIsIi4uXFxzcmNcXEl0ZW1GYWN0b3J5LmpzIiwiLi5cXHNyY1xcTWFwQXNzZW1ibGVyLmpzIiwiLi5cXHNyY1xcTWFwTWFuYWdlci5qcyIsIi4uXFxzcmNcXE1hdHJpeC5qcyIsIi4uXFxzcmNcXE1pc3NpbGUuanMiLCIuLlxcc3JjXFxPYmplY3RGYWN0b3J5LmpzIiwiLi5cXHNyY1xcUGxheWVyLmpzIiwiLi5cXHNyY1xcUGxheWVyU3RhdHMuanMiLCIuLlxcc3JjXFxTYXZlTWFuYWdlci5qcyIsIi4uXFxzcmNcXFNlbGVjdENsYXNzLmpzIiwiLi5cXHNyY1xcU3RhaXJzLmpzIiwiLi5cXHNyY1xcU3RvcmFnZS5qcyIsIi4uXFxzcmNcXFRpdGxlU2NyZWVuLmpzIiwiLi5cXHNyY1xcVUkuanMiLCIuLlxcc3JjXFxVbmRlcndvcmxkLmpzIiwiLi5cXHNyY1xcVXRpbHMuanMiLCIuLlxcc3JjXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcitCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRfMUZyYW1lOiBbXSxcclxuXHRfMkZyYW1lczogW10sXHJcblx0XzNGcmFtZXM6IFtdLFxyXG5cdF80RnJhbWVzOiBbXSxcclxuXHRpdGVtQ29vcmRzOiBbXSxcclxuXHRcclxuXHRpbml0OiBmdW5jdGlvbihnbCl7XHJcblx0XHQvLyAxIEZyYW1lXHJcblx0XHR2YXIgY29vcmRzID0gWzEuMCwxLjAsMC4wLDEuMCwxLjAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMUZyYW1lLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMiBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4wMCwxLjAwLDAuNTAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMkZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNTAsMS4wMCwxLjAwLDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHJcblx0XHQvLyAzIEZyYW1lcywgNCBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjI1LDEuMDAsMC4wMCwxLjAwLDAuMjUsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4yNSwxLjAwLDAuNTAsMC4wMCwwLjI1LDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjc1LDEuMDAsMC41MCwxLjAwLDAuNzUsMC4wMCwwLjUwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFsxLjAwLDEuMDAsMC43NSwxLjAwLDEuMDAsMC4wMCwwLjc1LDAuMDBdO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0fSxcclxuXHRcclxuXHRwcmVwYXJlQnVmZmVyOiBmdW5jdGlvbihjb29yZHMsIGdsKXtcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoY29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gY29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdHJldHVybiB0ZXhCdWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRnZXRCeU51bUZyYW1lczogZnVuY3Rpb24obnVtRnJhbWVzKXtcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMSkgcmV0dXJuIHRoaXMuXzFGcmFtZTsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAyKSByZXR1cm4gdGhpcy5fMkZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAzKSByZXR1cm4gdGhpcy5fM0ZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSA0KSByZXR1cm4gdGhpcy5fNEZyYW1lcztcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRleHR1cmVCdWZmZXJDb29yZHM6IGZ1bmN0aW9uKHhJbWdOdW0sIHlJbWdOdW0sIGdsKXtcclxuXHRcdHZhciByZXQgPSBbXTtcclxuXHRcdHZhciB3aWR0aCA9IDEgLyB4SW1nTnVtO1xyXG5cdFx0dmFyIGhlaWdodCA9IDEgLyB5SW1nTnVtO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpPTA7aTx5SW1nTnVtO2krKyl7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPHhJbWdOdW07aisrKXtcclxuXHRcdFx0XHR2YXIgeDEgPSBqICogd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkxID0gMSAtIGkgKiBoZWlnaHQgLSBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHgyID0geDEgKyB3aWR0aDtcclxuXHRcdFx0XHR2YXIgeTIgPSB5MSArIGhlaWdodDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY29vcmRzID0gW3gyLHkyLHgxLHkyLHgyLHkxLHgxLHkxXTtcclxuXHRcdFx0XHRyZXQucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbmZ1bmN0aW9uIEF1ZGlvQVBJKCl7XHJcblx0dGhpcy5fYXVkaW8gPSBbXTtcclxuXHRcclxuXHR0aGlzLmF1ZGlvQ3R4ID0gbnVsbDtcclxuXHR0aGlzLmdhaW5Ob2RlID0gbnVsbDtcclxuXHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5pbml0QXVkaW9FbmdpbmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5pbml0QXVkaW9FbmdpbmUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh3aW5kb3cuQXVkaW9Db250ZXh0KXtcclxuXHRcdHRoaXMuYXVkaW9DdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblx0XHR0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0fWVsc2VcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgQXVkaW8gQVBJXCIpO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKHVybCwgaXNNdXNpYyl7XHJcblx0dmFyIGVuZyA9IHRoaXM7XHJcblx0aWYgKCFlbmcuYXVkaW9DdHgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHZhciBhdWRpbyA9IHtidWZmZXI6IG51bGwsIHNvdXJjZTogbnVsbCwgcmVhZHk6IGZhbHNlLCBpc011c2ljOiBpc011c2ljLCBwYXVzZWRBdDogMH07XHJcblx0XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cdGh0dHAucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuXHRcclxuXHRodHRwLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRlbmcuYXVkaW9DdHguZGVjb2RlQXVkaW9EYXRhKGh0dHAucmVzcG9uc2UsIGZ1bmN0aW9uKGJ1ZmZlcil7XHJcblx0XHRcdGF1ZGlvLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHRcdFx0YXVkaW8ucmVhZHkgPSB0cnVlO1xyXG5cdFx0fSwgZnVuY3Rpb24obXNnKXtcclxuXHRcdFx0YWxlcnQobXNnKTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0aHR0cC5zZW5kKCk7XHJcblx0XHJcblx0dGhpcy5fYXVkaW8ucHVzaChhdWRpbyk7XHJcblx0XHJcblx0cmV0dXJuIGF1ZGlvO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnN0b3BNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoYXVkaW8udGltZU8pe1xyXG5cdFx0XHRjbGVhclRpbWVvdXQoYXVkaW8udGltZU8pO1xyXG5cdFx0fWVsc2UgaWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghc291bmRGaWxlIHx8ICFzb3VuZEZpbGUucmVhZHkpe1xyXG5cdFx0aWYgKHRyeUlmTm90UmVhZHkpeyBzb3VuZEZpbGUudGltZU8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVuZy5wbGF5U291bmQoc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpOyB9LCAxMDAwKTsgfSBcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5pc011c2ljKSB0aGlzLnN0b3BNdXNpYygpO1xyXG5cdFxyXG5cdHNvdW5kRmlsZS50aW1lTyA9IG51bGw7XHJcblx0c291bmRGaWxlLnBsYXlpbmcgPSB0cnVlO1xyXG5cdCBcclxuXHR2YXIgc291cmNlID0gZW5nLmF1ZGlvQ3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG5cdHNvdXJjZS5idWZmZXIgPSBzb3VuZEZpbGUuYnVmZmVyO1xyXG5cdFxyXG5cdHZhciBnYWluTm9kZTtcclxuXHRpZiAodm9sdW1lICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0Z2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcclxuXHRcdGdhaW5Ob2RlLmdhaW4udmFsdWUgPSB2b2x1bWU7XHJcblx0XHRzb3VuZEZpbGUudm9sdW1lID0gdm9sdW1lO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2Fpbk5vZGUgPSBlbmcuZ2Fpbk5vZGU7XHJcblx0fVxyXG5cdFxyXG5cdHNvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcclxuXHRnYWluTm9kZS5jb25uZWN0KGVuZy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpIC0gc291bmRGaWxlLnBhdXNlZEF0O1xyXG5cdFx0c291cmNlLnN0YXJ0KDAsIChzb3VuZEZpbGUucGF1c2VkQXQgLyAxMDAwKSAlIHNvdW5kRmlsZS5idWZmZXIuZHVyYXRpb24pO1xyXG5cdFx0c291bmRGaWxlLnBhdXNlZEF0ID0gMDtcclxuXHR9ZWxzZXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG5cdFx0c291cmNlLnN0YXJ0KDApO1xyXG5cdH1cclxuXHRzb3VyY2UubG9vcCA9IGxvb3A7XHJcblx0c291cmNlLmxvb3BpbmcgPSBsb29wO1xyXG5cdHNvdXJjZS5vbmVuZGVkID0gZnVuY3Rpb24oKXsgc291bmRGaWxlLnBsYXlpbmcgPSBmYWxzZTsgfTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpXHJcblx0XHRzb3VuZEZpbGUuc291cmNlID0gc291cmNlO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBhdXNlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0YXVkaW8ucGF1c2VkQXQgPSAwO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8ud2FzUGxheWluZyA9IGF1ZGlvLnBsYXlpbmc7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnBhdXNlZEF0ID0gKERhdGUubm93KCkgLSBhdWRpby5zdGFydGVkQXQpO1xyXG5cdFx0XHRhdWRpby5yZXN0b3JlTG9vcCA9IGF1ZGlvLnNvdXJjZS5sb29wO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5yZXN0b3JlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFhdWRpby5sb29waW5nICYmICFhdWRpby53YXNQbGF5aW5nKSBjb250aW51ZTtcclxuXHRcdGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSAmJiBhdWRpby5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wbGF5U291bmQoYXVkaW8sIGF1ZGlvLnJlc3RvcmVMb29wLCB0cnVlLCBhdWRpby52b2x1bWUpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMubXV0ZWQpe1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMDtcclxuXHRcdHRoaXMubXV0ZWQgPSB0cnVlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuYXJlU291bmRzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuX2F1ZGlvW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuZnVuY3Rpb24gQmlsbGJvYXJkKHBvc2l0aW9uLCB0ZXh0dXJlQ29kZSwgbWFwTWFuYWdlciwgcGFyYW1zKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IG51bGw7XHJcblx0dGhpcy5udW1GcmFtZXMgPSAxO1xyXG5cdHRoaXMuaW1nU3BkID0gMDtcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5hY3Rpb25zID0gbnVsbDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcclxuXHRpZiAocGFyYW1zKSB0aGlzLnBhcnNlUGFyYW1zKHBhcmFtcyk7XHJcblx0aWYgKHRleHR1cmVDb2RlID09IFwibm9uZVwiKSB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCaWxsYm9hcmQ7XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLnBhcnNlUGFyYW1zID0gZnVuY3Rpb24ocGFyYW1zKXtcclxuXHRmb3IgKHZhciBpIGluIHBhcmFtcyl7XHJcblx0XHR2YXIgcCA9IHBhcmFtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGkgPT0gXCJuZlwiKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR0aGlzLm51bUZyYW1lcyA9IHA7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhwKTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiaXNcIil7IC8vIEltYWdlIHNwZWVkXHJcblx0XHRcdHRoaXMuaW1nU3BkID0gcDtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiY2JcIil7IC8vIEN1c3RvbSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZChwLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiYWNcIil7IC8vIEFjdGlvbnNcclxuXHRcdFx0dGhpcy5hY3Rpb25zID0gcDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuYWN0aW9ucy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhYyA9IHRoaXMuYWN0aW9uc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGFjID09IFwidHZcIil7IC8vIFRvb2dsZSB2aXNpYmlsaXR5XHJcblx0XHRcdHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN0X1wiKSA9PSAwKXsgLy8gQ2hhbmdlIHRleHR1cmVcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29kZSA9IGFjLnJlcGxhY2UoXCJjdF9cIiwgXCJcIik7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcIm5mX1wiKSA9PSAwKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR2YXIgbmYgPSBwYXJzZUludChhYy5yZXBsYWNlKFwibmZfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBuZjtcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKG5mKTtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjZl9cIikgPT0gMCl7IC8vIENpcmNsZSBmcmFtZXNcclxuXHRcdFx0dmFyIGZyYW1lcyA9IGFjLnJlcGxhY2UoXCJjZl9cIixcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gcGFyc2VJbnQoZnJhbWVzW3RoaXMuY2lyY2xlRnJhbWVJbmRleF0sIDEwKTtcclxuXHRcdFx0aWYgKHRoaXMuY2lyY2xlRnJhbWVJbmRleCsrID49IGZyYW1lcy5sZW5ndGgtMSkgdGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY3dfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciB0ZXh0dXJlSWQgPSBwYXJzZUludChhYy5yZXBsYWNlKFwiY3dfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmNoYW5nZVdhbGxUZXh0dXJlKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0ZXh0dXJlSWQpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJ1ZF9cIikgPT0gMCl7IC8vIFVubG9jayBkb29yXHJcblx0XHRcdHZhciBwb3MgPSBhYy5yZXBsYWNlKFwidWRfXCIsIFwiXCIpLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0dmFyIGRvb3IgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0RG9vckF0KHBhcnNlSW50KHBvc1swXSwgMTApLCBwYXJzZUludChwb3NbMV0sIDEwKSwgcGFyc2VJbnQocG9zWzJdLCAxMCkpO1xyXG5cdFx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRcdGRvb3IubG9jayA9IG51bGw7XHJcblx0XHRcdFx0ZG9vci5hY3RpdmF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAoYWMgPT0gXCJkZXN0cm95XCIpeyAvLyBEZXN0cm95IHRoZSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy52aXNpYmxlKSByZXR1cm47XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5iaWxsYm9hcmQgJiYgdGhpcy50ZXh0dXJlQ29vcmRzKXtcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMudGV4dHVyZUNvb3Jkc1sodGhpcy5pbWdJbmQgPDwgMCldO1xyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCAmJiB0aGlzLm51bUZyYW1lcyA+IDEpe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMubnVtRnJhbWVzKXtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gQ29uc29sZSgvKkludCovIG1heE1lc3NhZ2VzLCAvKkludCovIGxpbWl0LCAvKkludCovIHNwbGl0QXQsICAvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLm1lc3NhZ2VzID0gW107XHJcblx0dGhpcy5tYXhNZXNzYWdlcyA9IG1heE1lc3NhZ2VzO1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5saW1pdCA9IGxpbWl0O1xyXG5cdHRoaXMuc3BsaXRBdCA9IHNwbGl0QXQ7XHJcblx0XHJcblx0dGhpcy5zcHJpdGVGb250ID0gbnVsbDtcclxuXHR0aGlzLmxpc3RPZkNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNmQ29udGV4dCA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSBudWxsO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGU7XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigvKkludCovIHgsIC8qSW50Ki8geSl7XHJcblx0dmFyIHMgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDE7XHJcblx0dmFyIGN0eCA9IHRoaXMuZ2FtZS5VSS5jdHg7XHJcblx0XHJcblx0Y3R4LmRyYXdJbWFnZSh0aGlzLnNmQ29udGV4dC5jYW52YXMsIHgsIHkpO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucGFyc2VGb250ID0gZnVuY3Rpb24oc3ByaXRlRm9udCl7XHJcblx0dmFyIGNoYXJhc1dpZHRoID0gW107XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc3ByaXRlRm9udC53aWR0aDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0XHJcblx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0Y3R4LmRyYXdJbWFnZShzcHJpdGVGb250LCAwLCAwKTtcclxuXHRcclxuXHR2YXIgaW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwwLGNhbnZhcy53aWR0aCwxKTtcclxuXHR2YXIgd2lkdGggPSAwO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW1nRGF0YS5kYXRhLmxlbmd0aDtpPGxlbjtpKz00KXtcclxuXHRcdHZhciByID0gaW1nRGF0YS5kYXRhW2ldO1xyXG5cdFx0dmFyIGcgPSBpbWdEYXRhLmRhdGFbaSsxXTtcclxuXHRcdHZhciBiID0gaW1nRGF0YS5kYXRhW2krMl07XHJcblx0XHRcclxuXHRcdGlmIChyID09IDI1NSAmJiBnID09IDAgJiYgYiA9PSAyNTUpe1xyXG5cdFx0XHR3aWR0aCsrO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmICh3aWR0aCAhPSAwKXtcclxuXHRcdFx0XHRjaGFyYXNXaWR0aC5wdXNoKHdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNoYXJhc1dpZHRoO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuY3JlYXRlU3ByaXRlRm9udCA9IGZ1bmN0aW9uKC8qSW1hZ2UqLyBzcHJpdGVGb250LCAvKlN0cmluZyovIGNoYXJhY3RlcnNVc2VkLCAvKkludCovIHZlcnRpY2FsU3BhY2Upe1xyXG5cdHRoaXMuc3ByaXRlRm9udCA9IHNwcml0ZUZvbnQ7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IGNoYXJhY3RlcnNVc2VkO1xyXG5cdHRoaXMuc3BhY2VMaW5lcyA9IHZlcnRpY2FsU3BhY2U7XHJcblx0XHJcblx0dGhpcy5jaGFyYXNXaWR0aCA9IHRoaXMucGFyc2VGb250KHNwcml0ZUZvbnQpO1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwMDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLnNmQ29udGV4dC5jYW52YXMgPSBjYW52YXM7XHJcblx0XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gc3ByaXRlRm9udC53aWR0aCAvIGNoYXJhY3RlcnNVc2VkLmxlbmd0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmZvcm1hdFRleHQgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciB0eHQgPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcclxuXHR2YXIgbGluZSA9IFwiXCI7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dHh0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIHdvcmQgPSB0eHRbaV07XHJcblx0XHRpZiAoKGxpbmUgKyBcIiBcIiArIHdvcmQpLmxlbmd0aCA8PSB0aGlzLnNwbGl0QXQpe1xyXG5cdFx0XHRpZiAobGluZSAhPSBcIlwiKSBsaW5lICs9IFwiIFwiO1xyXG5cdFx0XHRsaW5lICs9IHdvcmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0LnB1c2gobGluZSk7XHJcblx0XHRcdGxpbmUgPSB3b3JkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXQucHVzaChsaW5lKTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuYWRkU0ZNZXNzYWdlID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgbXNnID0gdGhpcy5mb3JtYXRUZXh0KG1lc3NhZ2UpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49bXNnLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1zZ1tpXSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubGltaXQpe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5zcGxpY2UoMCwxKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGMgPSB0aGlzLnNmQ29udGV4dC5jYW52YXM7XHJcblx0dGhpcy5zZkNvbnRleHQuY2xlYXJSZWN0KDAsMCxjLndpZHRoLGMuaGVpZ2h0KTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMubWVzc2FnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXNnID0gdGhpcy5tZXNzYWdlc1tpXTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gKHRoaXMuc3BhY2VMaW5lcyAqIHRoaXMubGltaXQpIC0gdGhpcy5zcGFjZUxpbmVzICogKGxlbiAtIGkgLSAxKTtcclxuXHRcdHRoaXMucHJpbnRUZXh0KHgseSxtc2cpO1xyXG5cdH1cclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnByaW50VGV4dCA9IGZ1bmN0aW9uICh4LHksbXNnLCBjdHgpe1xyXG5cdGlmICghY3R4KXtcclxuXHRcdGN0eCA9IHRoaXMuc2ZDb250ZXh0O1xyXG5cdH1cclxuXHR2YXIgYyA9IGN0eC5jYW52YXM7XHJcblx0XHJcblx0dmFyIHcgPSB0aGlzLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSB0aGlzLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdFxyXG5cdHZhciBtVyA9IG1zZy5sZW5ndGggKiB3O1xyXG5cdGlmIChtVyA+IGMud2lkdGgpIGMud2lkdGggPSBtVyArICgyICogdyk7XHJcblx0XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49bXNnLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IG1zZy5jaGFyQXQoaik7XHJcblx0XHR2YXIgaW5kID0gdGhpcy5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHR4LCB5LCB3LCBoIC0gMSk7XHJcblx0XHRcdHggKz0gdGhpcy5jaGFyYXNXaWR0aFtpbmRdICsgMTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR4ICs9IHc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZnVuY3Rpb24gRG9vcihtYXBNYW5hZ2VyLCB3YWxsUG9zaXRpb24sIGRpciwgdGV4dHVyZUNvZGUsIHdhbGxUZXh0dXJlLCBsb2NrKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMud2FsbFBvc2l0aW9uID0gd2FsbFBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdHRoaXMuZGlyID0gZGlyO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLnJUZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlOyAvLyBEZWxldGVcclxuXHJcblx0dGhpcy5kb29yUG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHR0aGlzLndhbGxUZXh0dXJlID0gd2FsbFRleHR1cmU7XHJcblx0XHRcclxuXHR0aGlzLmJvdW5kaW5nQm94ID0gbnVsbDtcclxuXHR0aGlzLnBvc2l0aW9uID0gd2FsbFBvc2l0aW9uLmNsb25lKCk7XHJcblx0aWYgKGRpciA9PSBcIkhcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoLTAuMjUsIDAuMCwgMC4wKSk7IH1lbHNlXHJcblx0aWYgKGRpciA9PSBcIlZcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoMC4wLCAwLjAsIC0wLjI1KSk7IHRoaXMucm90YXRpb24gPSBNYXRoLlBJXzI7IH1cclxuXHRcclxuXHR0aGlzLmxvY2sgPSBsb2NrO1xyXG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcclxuXHR0aGlzLmFuaW1hdGlvbiA9ICAwO1xyXG5cdHRoaXMub3BlblNwZWVkID0gTWF0aC5kZWdUb1JhZCgxMCk7XHJcblx0XHJcblx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEb29yO1xyXG5cclxuRG9vci5wcm90b3R5cGUuZ2V0Qm91bmRpbmdCb3ggPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmJvdW5kaW5nQm94O1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiAhPSAwKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMubG9jayl7XHJcblx0XHR2YXIga2V5ID0gdGhpcy5tYXBNYW5hZ2VyLmdldFBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdGlmIChrZXkpe1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShrZXkubmFtZSArIFwiIHVzZWRcIik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5yZW1vdmVQbGF5ZXJJdGVtKHRoaXMubG9jayk7XHJcblx0XHRcdHRoaXMubG9jayA9IG51bGw7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJMb2NrZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuY2xvc2VkKSB0aGlzLmFuaW1hdGlvbiA9IDE7XHJcblx0ZWxzZSB0aGlzLmFuaW1hdGlvbiA9IDI7IFxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybiB0cnVlO1xyXG5cdHJldHVybiB0aGlzLmNsb3NlZDtcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLm1vZGlmeUNvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGlyID09IFwiSFwiKXtcclxuXHRcdGlmICh0aGlzLmNsb3NlZCl7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUgLSAwLjA1LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1lbHNle1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUgLSAwLjA1LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC4xLCBoOiAwLjVcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFuMSA9ICgodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIkhcIikgfHwgKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJWXCIpKTtcclxuXHR2YXIgYW4yID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAyICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdFxyXG5cdGlmIChhbjEgJiYgdGhpcy5yb3RhdGlvbiA8IE1hdGguUElfMil7XHJcblx0XHR0aGlzLnJvdGF0aW9uICs9IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPj0gTWF0aC5QSV8yKXtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJWXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1lbHNlIGlmIChhbjIgJiYgdGhpcy5yb3RhdGlvbiA+IDApe1xyXG5cdFx0dGhpcy5yb3RhdGlvbiAtPSB0aGlzLm9wZW5TcGVlZDtcclxuXHRcdGlmICh0aGlzLnJvdGF0aW9uIDw9IDApe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gMDtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJIXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gRW5kaW5nU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5jdXJyZW50U2NyZWVuID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmRpbmdTY3JlZW47XHJcblxyXG5FbmRpbmdTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMilcclxuXHRcdFx0dGhpcy5nYW1lLm5ld0dhbWUoKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0fVxyXG59O1xyXG5cclxuRW5kaW5nU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHRpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDApXHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5lbmRpbmdTY3JlZW4sIDAsIDApO1xyXG5cdGVsc2UgaWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSAxKVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMiwgMCwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbnZhciBNaXNzaWxlID0gcmVxdWlyZSgnLi9NaXNzaWxlJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ2JpbGxib2FyZCcpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ3RleHR1cmVDb29yZHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0VuZW15JywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKSB7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMoMik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gRW5lbXkoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0VuZW15Jyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0VuZW15JywgRW5lbXkpO1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZW5lbXksIG1hcE1hbmFnZXIpe1xyXG5cdGlmIChlbmVteS5zd2ltKSBwb3NpdGlvbi5iIC09IDAuMjtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQmFzZSA9IGVuZW15LnRleHR1cmVCYXNlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5hbmltYXRpb24gPSBcInJ1blwiO1xyXG5cdHRoaXMuZW5lbXkgPSBlbmVteTtcclxuXHR0aGlzLnRhcmdldCA9IGZhbHNlO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMjtcclxuXHR0aGlzLmltZ1NwZCA9IDEvNztcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLmh1cnQgPSAwLjA7XHJcblx0dGhpcy50YXJnZXRZID0gcG9zaXRpb24uYjtcclxuXHR0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHR0aGlzLnNsZWVwID0gMDtcclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwLjA7XHJcblx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPSAwO1xyXG5cdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdFxyXG5cdHRoaXMuZW5lbXkuaHAgLT0gZG1nO1xyXG5cdGlmICh0aGlzLmVuZW15LmhwIDw9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuYWRkRXhwZXJpZW5jZSh0aGlzLmVuZW15LnN0YXRzLmV4cCk7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGtpbGxlZFwiKTtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUubG9va0ZvciA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0aWYgKCFwbGF5ZXIubW92ZWQpIHJldHVybjtcclxuXHR2YXIgcCA9IHBsYXllci5wb3NpdGlvbjtcclxuXHRcclxuXHR2YXIgZHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdHZhciBkeiA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHJcblx0aWYgKCF0aGlzLnRhcmdldCAmJiAoZHggPD0gNCB8fCBkeiA8PSA0KSl7XHJcblx0XHQvLyBDYXN0IGEgcmF5IHRvd2FyZHMgdGhlIHBsYXllciB0byBjaGVjayBpZiBoZSdzIG9uIHRoZSB2aXNpb24gb2YgdGhlIGNyZWF0dXJlXHJcblx0XHR2YXIgcnggPSB0aGlzLnBvc2l0aW9uLmE7XHJcblx0XHR2YXIgcnkgPSB0aGlzLnBvc2l0aW9uLmM7XHJcblx0XHR2YXIgZGlyID0gTWF0aC5nZXRBbmdsZSh0aGlzLnBvc2l0aW9uLCBwKTtcclxuXHRcdHZhciBkeCA9IE1hdGguY29zKGRpcikgKiAwLjM7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMztcclxuXHRcdFxyXG5cdFx0dmFyIHNlYXJjaCA9IDE1O1xyXG5cdFx0d2hpbGUgKHNlYXJjaCA+IDApe1xyXG5cdFx0XHRyeCArPSBkeDtcclxuXHRcdFx0cnkgKz0gZHk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY3ggPSAocnggPDwgMCk7XHJcblx0XHRcdHZhciBjeSA9IChyeSA8PCAwKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLm1hcE1hbmFnZXIuaXNTb2xpZChjeCwgY3ksIDApKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHZhciBweCA9IChwLmEgPDwgMCk7XHJcblx0XHRcdFx0dmFyIHB5ID0gKHAuYyA8PCAwKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoY3ggPT0gcHggJiYgY3kgPT0gcHkpe1xyXG5cdFx0XHRcdFx0dGhpcy50YXJnZXQgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0XHRcdFx0c2VhcmNoID0gMDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHNlYXJjaCAtPSAxO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdHJ1ZSk7XHJcblx0aWYgKHRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmIHBvaW50WSA8IDAuMCkgcG9pbnRZID0gdGhpcy5wb3NpdGlvbi5iO1xyXG5cdFxyXG5cdHZhciBweSA9IE1hdGguZmxvb3IoKHBvaW50WSAtIHRoaXMucG9zaXRpb24uYikgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4VG8sIHpUbyl7XHJcblx0dmFyIG1vdmVtZW50ID0gdmVjMih4VG8sIHpUbyk7XHJcblx0dmFyIHNwZCA9IHZlYzIoeFRvICogMS41LCAwKTtcclxuXHR2YXIgZmFrZVBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFxyXG5cdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdHZhciBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0QkJveFdhbGxOb3JtYWwoZmFrZVBvcywgc3BkLCAwLjMpO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCwgdGhpcyk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0c3BkID0gdmVjMigwLCB6VG8gKiAxLjUpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAobW92ZW1lbnQuYSAhPSAwIHx8IG1vdmVtZW50LmIgIT0gMCl7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHRoaXMucG9zaXRpb24uYyArPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmICF0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgIXRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5hIC09IG1vdmVtZW50LmE7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYyAtPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZG9WZXJ0aWNhbENoZWNrcygpO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5jYXN0TWlzc2lsZSA9IGZ1bmN0aW9uKHBsYXllcil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UodGhpcy5lbmVteS5zdGF0cy5zdHIpO1xyXG5cdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHBsYXllci5wb3NpdGlvbik7XHJcblx0XHJcblx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdG1pc3NpbGUuaW5pdCh0aGlzLnBvc2l0aW9uLmNsb25lKCksIHZlYzIoMCwgZGlyKSwgJ2JvdycsICdwbGF5ZXInLCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0bWlzc2lsZS5zcGQgKj0gMC41O1xyXG5cclxuXHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gOTA7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuYXR0YWNrUGxheWVyID0gZnVuY3Rpb24ocGxheWVyKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMC4wKSByZXR1cm47XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHRoaXMuZW5lbXkuc3RhdHMuc3RyKTtcclxuXHR2YXIgZGZzID0gVXRpbHMucm9sbERpY2UodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheWVyLnN0YXRzLmRmcyk7XHJcblx0XHJcblx0Ly8gQ2hlY2sgaWYgdGhlIHBsYXllciBoYXMgdGhlIHByb3RlY3Rpb24gc3BlbGxcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmdhbWUucHJvdGVjdGlvbiA+IDApe1xyXG5cdFx0ZGZzICs9IDE1O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgoc3RyIC0gZGZzLCAwKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh0aGlzLmVuZW15Lm5hbWUgKyBcIiBhdHRhY2tzIHhcIitkbWcpO1xyXG5cdFx0cGxheWVyLnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnYmxvY2snKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gOTA7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0aWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcclxuXHR2YXIgcCA9IHBsYXllci5wb3NpdGlvbjtcclxuXHRpZiAodGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPiAwKXtcclxuXHRcdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyIC0tO1xyXG5cdFx0aWYgKHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID09IDApe1xyXG5cdFx0XHR2YXIgeHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdFx0XHR2YXIgeXkgPSBNYXRoLmFicyhwLmMgLSB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuZW5lbXkuc3RhdHMucmFuZ2VkICYmIHh4IDw9IDMgJiYgeXkgPD0gMyl7XHJcblx0XHRcdFx0dGhpcy5jYXN0TWlzc2lsZShwbGF5ZXIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fWVsc2UgaWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0XHR0aGlzLmF0dGFja1BsYXllcihwbGF5ZXIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAodGhpcy50YXJnZXQpe1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCl7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCAtLTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCh4eCA8PSAxICYmIHl5IDw9MSkgfHwgKHRoaXMuZW5lbXkuc3RhdHMucmFuZ2VkICYmIHh4IDw9IDMgJiYgeXkgPD0gMykpe1xyXG5cdFx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID09IDApe1xyXG5cdFx0XHRcdC8vIHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGF0dGFja3MhXCIpOyBSZW1vdmVkLCB3aWxsIGJlIHJlcGxhY2VkIGJ5IGF0dGFjayBhbmltYXRpb25cclxuXHRcdFx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9IDEwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoeHggPiAxMCB8fCB5eSA+IDEwKXtcclxuXHRcdFx0dGhpcy50YXJnZXQgPSBudWxsO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMDI7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMDI7XHJcblx0XHRcclxuXHRcdHZhciBsYXQgPSB2ZWMyKE1hdGguY29zKGRpciArIE1hdGguUElfMiksIC1NYXRoLnNpbihkaXIgKyBNYXRoLlBJXzIpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tb3ZlVG8oZHgsIGR5LCBsYXQpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5sb29rRm9yKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmdldFRleHR1cmVDb2RlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZmFjZSA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdHZhciBhID0gdGhpcy5hbmltYXRpb247XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uID09IFwic3RhbmRcIikgYSA9IFwicnVuXCI7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMudGV4dHVyZUJhc2UgKyBcIl9cIiArIGE7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmJpbGxib2FyZCAmJiB0aGlzLnRleHR1cmVDb29yZHMpe1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy50ZXh0dXJlQ29vcmRzWyh0aGlzLmltZ0luZCA8PCAwKV07XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkLnBhaW50SW5SZWQgPSAodGhpcy5odXJ0ID4gMCk7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy5nZXRUZXh0dXJlQ29kZSgpLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCl7IHRoaXMuaHVydCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuc2xlZXAgPiAwKXsgdGhpcy5zbGVlcCAtPSAxOyB9XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5wYXVzZWQgfHwgZ2FtZS50aW1lU3RvcCA+IDAgfHwgdGhpcy5zbGVlcCA+IDApe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMubnVtRnJhbWVzID4gMSl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5udW1GcmFtZXMpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRlbmVtaWVzOiB7XHJcblx0XHRiYXQ6IHtuYW1lOiAnR2lhbnQgQmF0JywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnMUQ5JywgZGZzOiAnMkQyJywgZXhwOiA0LCBmbHk6IHRydWV9fSxcclxuXHRcdHJhdDoge25hbWU6ICdHaWFudCBSYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAncmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNwaWRlcjoge25hbWU6ICdHaWFudCBTcGlkZXInLCBocDogNjQsIHRleHR1cmVCYXNlOiAnc3BpZGVyJywgc3RhdHM6IHtzdHI6ICcxRDExJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHRncmVtbGluOiB7bmFtZTogJ0dyZW1saW4nLCBocDogNDgsIHRleHR1cmVCYXNlOiAnZ3JlbWxpbicsIHN0YXRzOiB7c3RyOiAnMkQ5JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRza2VsZXRvbjoge25hbWU6ICdTa2VsZXRvbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdza2VsZXRvbicsIHN0YXRzOiB7c3RyOiAnM0Q0JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRoZWFkbGVzczoge25hbWU6ICdIZWFkbGVzcycsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdoZWFkbGVzcycsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHQvL25peGllOiB7bmFtZTogJ05peGllJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHdpc3A6IHtuYW1lOiAnV2lzcCcsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICd3aXNwJywgc3RhdHM6IHtzdHI6ICcyRDEwJywgZGZzOiAnMkQyJywgZXhwOiA1LCByYW5nZWQ6IHRydWV9fSxcclxuXHRcdGdob3N0OiB7bmFtZTogJ0dob3N0JywgaHA6IDgwLCB0ZXh0dXJlQmFzZTogJ2dob3N0Jywgc3RhdHM6IHtzdHI6ICcyRDE1JywgZGZzOiAnMkQyJywgZXhwOiA2LCBmbHk6IHRydWV9fSxcclxuXHRcdHRyb2xsOiB7bmFtZTogJ1Ryb2xsJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3Ryb2xsJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSwgLy8gTm90IHVzZWQgYnkgdGhlIGdlbmVyYXRvcj9cclxuXHRcdGxhdmFMaXphcmQ6IHtuYW1lOiAnTGF2YSBMaXphcmQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbGF2YUxpemFyZCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtb25nYmF0OiB7bmFtZTogJ01vbmdiYXQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbW9uZ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3LCBmbHk6IHRydWV9fSwgXHJcblx0XHRvY3RvcHVzOiB7bmFtZTogJ0dpYW50IFNxdWlkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ29jdG9wdXMnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZGFlbW9uOiB7bmFtZTogJ0RhZW1vbicsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnZGFlbW9uJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDgsIHJhbmdlZDogdHJ1ZX19LFxyXG5cdFx0Ly9waGFudG9tOiB7bmFtZTogJ1BoYW50b20nLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnMUQxNScsIGRmczogJzJEMicsIGV4cDogOX19LFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0c2VhU2VycGVudDoge25hbWU6ICdTZWEgU2VycGVudCcsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnc2VhU2VycGVudCcsIHN0YXRzOiB7c3RyOiAnM0Q2JywgZGZzOiAnMkQyJywgZXhwOiA5LCBzd2ltOiB0cnVlfX0sXHJcblx0XHRldmlsTWFnZToge25hbWU6ICdFdmlsIE1hZ2UnLCBocDogMTc2LCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzZENScsIGRmczogJzJEMicsIGV4cDogMTIsIHJhbmdlZDogdHJ1ZX19LCAvL1RPRE86IEFkZCB0ZXh0dXJlXHJcblx0XHRsaWNoZToge25hbWU6ICdMaWNoZScsIGhwOiAxOTIsIHRleHR1cmVCYXNlOiAnbGljaGUnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTMsIHJhbmdlZDogdHJ1ZX19LFxyXG5cdFx0aHlkcmE6IHtuYW1lOiAnSHlkcmEnLCBocDogMjA4LCB0ZXh0dXJlQmFzZTogJ2h5ZHJhJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE0fX0sXHJcblx0XHRkcmFnb246IHtuYW1lOiAnRHJhZ29uJywgaHA6IDIyNCwgdGV4dHVyZUJhc2U6ICdkcmFnb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTUsIGZseTogdHJ1ZSwgcmFuZ2VkOiB0cnVlfX0sXHRcdFx0XHQvLyBOb3Qgc3VpdGFibGVcclxuXHRcdHpvcm46IHtuYW1lOiAnWm9ybicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnem9ybicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0Z2F6ZXI6IHtuYW1lOiAnR2F6ZXInLCBocDogMjQwLCB0ZXh0dXJlQmFzZTogJ2dhemVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2LCBmbHk6IHRydWUsIHJhbmdlZDogdHJ1ZX19LFxyXG5cdFx0cmVhcGVyOiB7bmFtZTogJ1JlYXBlcicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAncmVhcGVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2LCByYW5nZWQ6IHRydWV9fSxcclxuXHRcdGJhbHJvbjoge25hbWU6ICdCYWxyb24nLCBocDogMjU1LCB0ZXh0dXJlQmFzZTogJ2JhbHJvbicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNiwgcmFuZ2VkOiB0cnVlfX0sXHJcblx0XHQvL3R3aXN0ZXI6IHtuYW1lOiAnVHdpc3RlcicsIGhwOiAyNSwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzREMicsIGRmczogJzJEMicsIGV4cDogNX19LFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0XHJcblx0XHR3YXJyaW9yOiB7bmFtZTogJ0ZpZ2h0ZXInLCBocDogOTgsIHRleHR1cmVCYXNlOiAnZmlnaHRlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtYWdlOiB7bmFtZTogJ01hZ2UnLCBocDogMTEyLCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogOCwgcmFuZ2VkOiB0cnVlfX0sXHJcblx0XHRiYXJkOiB7bmFtZTogJ0JhcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmFyZCcsIHN0YXRzOiB7c3RyOiAnMkQxMCcsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0ZHJ1aWQ6IHtuYW1lOiAnRHJ1aWQnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiAxMH19LFxyXG5cdFx0dGlua2VyOiB7bmFtZTogJ1RpbmtlcicsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cGFsYWRpbjoge25hbWU6ICdQYWxhZGluJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNoZXBoZXJkOiB7bmFtZTogJ1NoZXBoZXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnM0QzJywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRyYW5nZXI6IHtuYW1lOiAnUmFuZ2VyJywgaHA6IDE0NCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogMywgcmFuZ2VkOiB0cnVlfX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEVuZW15OiBmdW5jdGlvbihuYW1lKXtcclxuXHRcdGlmICghdGhpcy5lbmVtaWVzW25hbWVdKSB0aHJvdyBcIkludmFsaWQgZW5lbXkgbmFtZTogXCIgKyBuYW1lO1xyXG5cdFx0XHJcblx0XHR2YXIgZW5lbXkgPSB0aGlzLmVuZW1pZXNbbmFtZV07XHJcblx0XHR2YXIgcmV0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpIGluIGVuZW15KXtcclxuXHRcdFx0cmV0W2ldID0gZW5lbXlbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBJbnZlbnRvcnkobGltaXRJdGVtcyl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJbnZlbnRvcnknKTtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcblx0dGhpcy5saW1pdEl0ZW1zID0gbGltaXRJdGVtcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0ludmVudG9yeScsIEludmVudG9yeSk7XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpZiAodGhpcy5pdGVtcy5sZW5ndGggPT0gdGhpcy5saW1pdEl0ZW1zKXtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5lcXVpcEl0ZW0gPSBmdW5jdGlvbihpdGVtSWQpe1xyXG5cdHZhciB0eXBlID0gdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGU7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXRlbS50eXBlID09IHR5cGUpe1xyXG5cdFx0XHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IHRydWU7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEVxdWlwcGVkSXRlbSA9IGZ1bmN0aW9uKHR5cGUpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlICYmIGl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRyZXR1cm4gaXRlbTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldFdlYXBvbiA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCd3ZWFwb24nKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0QXJtb3VyID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5nZXRFcXVpcHBlZEl0ZW0oJ2FybW91cicpO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kZXN0cm95SXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdGl0ZW0uc3RhdHVzID0gMC4wO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXQgPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXQgPT09IGl0ZW0pe1xyXG5cdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpLCAxKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmRyb3BJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHRpZiAodGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ3dlYXBvbicgfHwgdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ2FybW91cicpe1xyXG5cdFx0dGhpcy5pdGVtc1tpdGVtSWRdLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0fVxyXG5cdHRoaXMuaXRlbXMuc3BsaWNlKGl0ZW1JZCwgMSk7XHJcbn07XHJcbiIsInZhciBCaWxsYm9hcmQgPSByZXF1aXJlKCcuL0JpbGxib2FyZCcpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0l0ZW0nLCAnYmlsbGJvYXJkJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdJdGVtJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdGlmIChvYmplY3QuaXRlbSkge1xyXG5cdFx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleFtvYmplY3QuaXRlbS50ZXhdLmJ1ZmZlcnNbb2JqZWN0Lml0ZW0uc3ViSW1nXTtcclxuXHRcdG9iamVjdC50ZXh0dXJlQ29kZSA9IG9iamVjdC5pdGVtLnRleDtcclxuXHR9XHJcbn0pO1x0XHJcblxyXG5mdW5jdGlvbiBJdGVtKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJdGVtJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSXRlbTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnSXRlbScsIEl0ZW0pO1xyXG5cclxuSXRlbS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBpdGVtLCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLml0ZW0gPSBudWxsO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBudWxsO1xyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHRcclxuXHRpZiAoaXRlbSkgdGhpcy5zZXRJdGVtKGl0ZW0pO1xyXG59O1xyXG5cclxuXHJcbkl0ZW0ucHJvdG90eXBlLnNldEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHR0aGlzLml0ZW0gPSBpdGVtO1xyXG5cdFxyXG5cdHRoaXMuc29saWQgPSBpdGVtLnNvbGlkO1xyXG5cdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0aWYgKHRoaXMuaXRlbS5hbmltYXRpb25MZW5ndGgpeyB0aGlzLmltZ1NwZCA9IDEgLyA2OyB9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4W3RoaXMuaXRlbS50ZXhdLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBpdGVtLnRleDtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbW0gPSB0aGlzLm1hcE1hbmFnZXI7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAodGhpcy5pdGVtLmlzSXRlbSl7XHJcblx0XHRpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2NvZGV4Jyl7XHJcblx0XHRcdC8qbW0uYWRkTWVzc2FnZShcIlRoZSBib3VuZGxlc3Mga25vd25sZWRnZSBvZiB0aGUgQ29kZXggaXMgcmV2ZWFsZWQgdW50byB0aGVlLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkEgdm9pY2UgdGh1bmRlcnMhXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBoYXN0IHByb3ZlbiB0aHlzZWxmIHRvIGJlIHRydWx5IGdvb2QgaW4gbmF0dXJlXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJxdWVzdCBvZiBhIGxpZmV0aW1lLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkF2YXRhcmhvb2QgaXMgYSBsaXZpbmcgZ2lmdCwgSXQgbXVzdCBhbHdheXMgYW5kIGZvcmV2ZXIgYmUgbnVydHVyZWRcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJ0byBmbHVvcmlzaCwgZm9yIGlmIHRob3UgZG9zdCBzdHJheSBmcm9tIHRoZSBwYXRocyBvZiB2aXJ0dWUsIHRoeSB3YXlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJtYXkgYmUgbG9zdCBmb3JldmVyLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlJldHVybiBub3cgdW50byB0aGluZSBvdXIgd29ybGQsIGxpdmUgdGhlcmUgYXMgYW4gZXhhbXBsZSB0byB0aHlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJwZW9wbGUsIGFzIG91ciBtZW1vcnkgb2YgdGh5IGdhbGxhbnQgZGVlZHMgc2VydmVzIHVzLlwiKTsqL1xyXG5cdFx0XHRkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0Z2FtZS5wbGF5ZXIuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0Z2FtZS5lbmRpbmcoKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2ZlYXR1cmUnKXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBzZWUgYSBcIit0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHR9IGVsc2UgaWYgKGdhbWUuYWRkSXRlbSh0aGlzLml0ZW0pKXtcclxuXHRcdFx0dmFyIHN0YXQgPSAnJztcclxuXHRcdFx0aWYgKHRoaXMuaXRlbS5zdGF0dXMgIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRzdGF0ID0gSXRlbUZhY3RvcnkuZ2V0U3RhdHVzTmFtZSh0aGlzLml0ZW0uc3RhdHVzKSArICcgJztcclxuXHRcdFx0XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3UgcGljayB1cCBhIFwiK3N0YXQgKyB0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiWW91IGNhbid0IGNhcnJ5IGFueSBtb3JlIGl0ZW1zXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCl7XHJcblx0XHR2YXIgaW5kID0gKHRoaXMuaW1nSW5kIDw8IDApO1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1tpbmRdO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlcil7XHJcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5pdGVtLmFuaW1hdGlvbkxlbmd0aCA+IDApe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMuaXRlbS5zdWJJbWcgKyB0aGlzLml0ZW0uYW5pbWF0aW9uTGVuZ3RoIC0gMSl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGl0ZW1zOiB7XHJcblx0XHQvLyBJdGVtc1xyXG5cdFx0eWVsbG93UG90aW9uOiB7bmFtZTogXCJZZWxsb3cgcG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdHJlZFBvdGlvbjoge25hbWU6IFwiUmVkIFBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRcclxuXHRcdC8vIFdlYXBvbnNcclxuXHRcdC8qXHJcblx0XHQgKiBEYWdnZXJzOiBMb3cgZGFtYWdlLCBsb3cgdmFyaWFuY2UsIEhpZ2ggc3BlZWQsIEQzLCAxNjBETUcgXHJcblx0XHQgKiBTdGF2ZXM6IE1pZCBkYW1hZ2UsIExvdyB2YXJpYW5jZSwgTWlkIHNwZWVkLCBEMywgMjQwRE1HXHJcblx0XHQgKiBNYWNlczogSGlnaCBEYW1hZ2UsIEhpZ2ggVmFyaWFuY2UsIExvdyBzcGVlZCwgRDEyLCAzNjAgRE1HXHJcblx0XHQgKiBBeGVzOiBNaWQgRGFtYWdlLCBMb3cgVmFyaWFuY2UsIExvdyBzcGVlZCwgRDMsIDI0MERNR1xyXG5cdFx0ICogU3dvcmRzOiBNaWQgRGFtYWdlLCBNaWQgdmFyaWFuY2UsIE1pZCBzcGVlZCwgRDYsIDI0MERNR1xyXG5cdFx0ICogXHJcblx0XHQgKiBNeXN0aWMgU3dvcmQ6IE1pZCBEYW1hZ2UsIFJhbmRvbSBEYW1hZ2UsIE1pZCBzcGVlZCwgRDMyIDI1NkRNR1xyXG5cdFx0ICovXHJcblx0XHRkYWdnZXJQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBEYWdnZXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMiwgdmlld1BvcnRJbWc6IDIsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyMEQzJywgd2VhcjogMC4wNX0sXHJcblx0XHRkYWdnZXJGYW5nOiB7bmFtZTogXCJGYW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDMsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0ZGFnZ2VyU3Rpbmc6IHtuYW1lOiBcIlN0aW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDQsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0XHJcblx0XHRzdGFmZkdhcmdveWxlOiB7bmFtZTogXCJHYXJnb3lsZSBTdGFmZlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA1LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQWdlczoge25hbWU6IFwiU3RhZmYgb2YgQWdlc1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA2LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzgwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQ2FieXJ1czoge25hbWU6IFwiU3RhZmYgb2YgQ2FieXJ1c1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA3LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwMEQzJywgd2VhcjogMC4wMn0sXHJcblx0XHRcclxuXHRcdG1hY2VCYW5lOiB7bmFtZTogXCJNYWNlIG9mIFVuZGVhZCBCYW5lXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDgsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMjBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdG1hY2VCb25lQ3J1c2hlcjoge25hbWU6IFwiQm9uZSBDcnVzaGVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogOSwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyNUQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZUp1Z2dlcm5hdXQ6IHtuYW1lOiBcIkp1Z2dlcm5hdXQgTWFjZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMCwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICczMEQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZVNsYXllcjoge25hbWU6IFwiU2xheWVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTEsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdFxyXG5cdFx0YXhlRHdhcnZpc2g6IHtuYW1lOiBcIkR3YXJ2aXNoIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMiwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgd2VhcjogMC4wMX0sXHJcblx0XHRheGVSdW5lOiB7bmFtZTogXCJSdW5lZCBBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTMsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnODBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0YXhlRGVjZWl2ZXI6IHtuYW1lOiBcIkRlY2VpdmVyIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNCwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0XHJcblx0XHRzd29yZEZpcmU6IHtuYW1lOiBcIkZpcmUgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTUsIHZpZXdQb3J0SW1nOiAwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBENicsIHdlYXI6IDAuMDA4fSxcclxuXHRcdHN3b3JkQ2hhb3M6IHtuYW1lOiBcIkNoYW9zIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE2LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzQwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZERyYWdvbjoge25hbWU6IFwiRHJhZ29uc2xheWVyIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE3LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzUwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZFF1aWNrOiB7bmFtZTogXCJFbmlsbm8sIHRoZSBRdWlja3N3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE4LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRcclxuXHRcdHNsaW5nRXR0aW46IHtuYW1lOiBcIkV0dGluIFNsaW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE5LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVEMTInLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAncm9jaycsIHdlYXI6IDAuMDR9LFxyXG5cdFx0XHJcblx0XHRib3dQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBCb3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNUQ2JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Fycm93Jywgd2VhcjogMC4wMX0sXHJcblx0XHRib3dTbGVlcDoge25hbWU6IFwiU2xlZXAgQm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIxLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdhcnJvdycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0Ym93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIEJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzIwRDYnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGNyb3NzYm93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENyb3NzYm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMzBENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdib2x0Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHR3YW5kTGlnaHRuaW5nOiB7bmFtZTogXCJXYW5kIG9mIExpZ2h0bmluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0d2FuZEZpcmU6IHtuYW1lOiBcIldhbmQgb2YgRmlyZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0cGhhem9yOiB7bmFtZTogXCJQaGF6b3JcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjYsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdiZWFtJywgd2VhcjogMC4wMX0sXHJcblx0XHRcclxuXHRcdG15c3RpY1N3b3JkOiB7bmFtZTogXCJNeXN0aWMgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzQsIHZpZXdQb3J0SW1nOiA1LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnOEQzMicsIHdlYXI6IDAuMH0sXHJcblx0XHRcclxuXHRcdC8vIEFybW91clxyXG5cdFx0Ly9UT0RPOiBBZGQgYXJtb3IgZGVncmFkYXRpb25cclxuXHRcdGxlYXRoZXJJbXA6IHtuYW1lOiBcIkltcCBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNywgdHlwZTogJ2FybW91cicsIGRmczogJzI1RDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGxlYXRoZXJEcmFnb246IHtuYW1lOiBcIkRyYWdvbiBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyOCwgdHlwZTogJ2FybW91cicsIGRmczogJzMwRDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGNoYWluTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENoYWluIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjksIHR5cGU6ICdhcm1vdXInLCBkZnM6ICczNUQ4Jywgd2VhcjogMC4wM30sXHJcblx0XHRjaGFpbkR3YXJ2ZW46IHtuYW1lOiBcIkR3YXJ2ZW4gQ2hhaW4gbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMCwgdHlwZTogJ2FybW91cicsIGRmczogJzQwRDgnLCB3ZWFyOiAwLjAzfSxcclxuXHRcdHBsYXRlTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIFBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzEsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICc0NUQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0cGxhdGVFdGVybml1bToge25hbWU6IFwiRXRlcm5pdW0gUGxhdGUgbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMiwgdHlwZTogJ2FybW91cicsIGRmczogJzUwRDgnLCB3ZWFyOiAwLjAxNX0sXHJcblx0XHRcclxuXHRcdG15c3RpYzoge25hbWU6IFwiTXlzdGljIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMywgdHlwZTogJ2FybW91cicsIGRmczogJzIwRDgnLCBpbmRlc3RydWN0aWJsZTogdHJ1ZX0sXHJcblx0XHRcclxuXHRcdC8vIFNwZWxsIG1peGVzXHJcblx0XHRjdXJlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBDdXJlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAwLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1fSxcclxuXHRcdGhlYWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEhlYWxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDEwLCBwZXJjZW50OiAwLjJ9LFxyXG5cdFx0bGlnaHQ6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIExpZ2h0XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1LCBsaWdodFRpbWU6IDEwMDB9LFxyXG5cdFx0bWlzc2lsZToge25hbWU6IFwiU3BlbGxtaXggb2YgbWFnaWMgbWlzc2lsZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMzBENScsIG1hbmE6IDV9LFxyXG5cdFx0aWNlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSWNlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNCwgdHlwZTogJ21hZ2ljJywgc3RyOiAnNjVENScsIG1hbmE6IDIwfSxcclxuXHRcdHJlcGVsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBSZXBlbCBVbmRlYWRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDUsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGJsaW5rOiB7bmFtZTogXCJTcGVsbG1peCBvZiBCbGlua1wiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0ZmlyZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEZpcmViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA3LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICcxMDBENScsIG1hbmE6IDE1fSxcclxuXHRcdHByb3RlY3Rpb246IHtuYW1lOiBcIlNwZWxsbWl4IG9mIHByb3RlY3Rpb25cIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdtYWdpYycsIHByb3RUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdHRpbWU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRpbWUgU3RvcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOSwgdHlwZTogJ21hZ2ljJywgc3RvcFRpbWU6IDYwMCwgbWFuYTogMzB9LFxyXG5cdFx0c2xlZXA6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFNsZWVwXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ21hZ2ljJywgc2xlZXBUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdGppbng6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEppbnhcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDExLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHR0cmVtb3I6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRyZW1vclwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdGtpbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEtpbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc0MDBENScsIG1hbmE6IDI1fSxcclxuXHRcdFxyXG5cdFx0Ly8gQ29kZXhcclxuXHRcdGNvZGV4OiB7bmFtZTogXCJDb2RleCBvZiBVbHRpbWF0ZSBXaXNkb21cIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdjb2RleCd9LFxyXG5cdFx0XHJcblx0XHQvLyBEdW5nZW9uIGZlYXR1cmVzXHJcblx0XHRvcmI6IHtuYW1lOiBcIk9yYlwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRkZWFkVHJlZToge25hbWU6IFwiRGVhZCBUcmVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHRyZWU6IHtuYW1lOiBcIlRyZWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDMsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c3RhdHVlOiB7bmFtZTogXCJTdGF0dWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDQsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c2lnblBvc3Q6IHtuYW1lOiBcIlNpZ25wb3N0XCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA1LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHdlbGw6IHtuYW1lOiBcIldlbGxcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDYsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c21hbGxTaWduOiB7bmFtZTogXCJTaWduXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA3LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGxhbXA6IHtuYW1lOiBcIkxhbXBcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0ZmxhbWU6IHtuYW1lOiBcIkZsYW1lXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA5LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGNhbXBmaXJlOiB7bmFtZTogXCJDYW1wZmlyZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTAsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0YWx0YXI6IHtuYW1lOiBcIkFsdGFyXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRwcmlzb25lclRoaW5nOiB7bmFtZTogXCJTdG9ja3NcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGZvdW50YWluOiB7bmFtZTogXCJGb3VudGFpblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTMsIGFuaW1hdGlvbkxlbmd0aDogNCwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEl0ZW1CeUNvZGU6IGZ1bmN0aW9uKGl0ZW1Db2RlLCBzdGF0dXMpe1xyXG5cdFx0aWYgKCF0aGlzLml0ZW1zW2l0ZW1Db2RlXSkgdGhyb3cgXCJJbnZhbGlkIEl0ZW0gY29kZTogXCIgKyBpdGVtQ29kZTtcclxuXHRcdFxyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2l0ZW1Db2RlXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKCl7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZU1hcCA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTsgXHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlVGVycmFpbiA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmFzc2VtYmxlRmxvb3IobWFwTWFuYWdlciwgR0wpOyBcclxuXHR0aGlzLmFzc2VtYmxlQ2VpbHMobWFwTWFuYWdlciwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVCbG9ja3MobWFwTWFuYWdlciwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVTbG9wZXMobWFwTWFuYWdlciwgR0wpO1xyXG59XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmluaXRpYWxpemVUaWxlcyA9IGZ1bmN0aW9uKHRpbGVzKXtcclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbGVzLmxlbmd0aDsgaSsrKXtcclxuXHRcdGlmICh0aWxlc1tpXSlcclxuXHRcdFx0dGlsZXNbaV0uX2MgPSBjaXJjdWxhci5zZXRTYWZlKCk7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuZ2V0RW1wdHlHcmlkID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ3JpZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MDt5PDY0O3krKyl7XHJcblx0XHRncmlkW3ldID0gW107XHJcblx0XHRmb3IgKHZhciB4PTA7eDw2NDt4Kyspe1xyXG5cdFx0XHRncmlkW3ldW3hdID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGdyaWQ7XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmNvcHlUaWxlID0gZnVuY3Rpb24odGlsZSl7XHJcblx0dmFyIHJldCA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHR9O1xyXG5cdFxyXG5cdGZvciAodmFyIGkgaW4gdGlsZSl7XHJcblx0XHRyZXRbaV0gPSB0aWxlW2ldO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZUZsb29yID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Zsb29ycyA9IFtdO1xyXG5cdHZhciBmbG9vcnNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5mKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gZmxvb3JzSW5kLmluZGV4T2YodGlsZS5mKTtcclxuXHRcdFx0XHR2YXIgZmw7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRmbG9vcnNJbmQucHVzaCh0aWxlLmYpO1xyXG5cdFx0XHRcdFx0ZmwgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0ZmwudGlsZSA9IHRpbGUuZjtcclxuXHRcdFx0XHRcdGZsLnJUaWxlID0gdGlsZS5yZjtcclxuXHRcdFx0XHRcdG9GbG9vcnMucHVzaChmbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRmbCA9IG9GbG9vcnNbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHl5ID0gdGlsZS55O1xyXG5cdFx0XHRcdGlmICh0aWxlLncpIHl5ICs9IHRpbGUuaDtcclxuXHRcdFx0XHRpZiAodGlsZS5meSkgeXkgPSB0aWxlLmZ5O1xyXG5cdFx0XHRcdGZsW3ldW3hdID0ge3RpbGU6IHRpbGUuZiwgeTogeXl9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9GbG9vcnMubGVuZ3RoO2krKyl7XHJcblx0XHR2YXIgZmxvb3IzRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob0Zsb29yc1tpXSwgXCJGXCIsIEdMKTtcclxuXHRcdGZsb29yM0QudGV4SW5kID0gb0Zsb29yc1tpXS50aWxlO1xyXG5cdFx0Zmxvb3IzRC5yVGV4SW5kID0gb0Zsb29yc1tpXS5yVGlsZTtcclxuXHRcdGZsb29yM0QudHlwZSA9IFwiRlwiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKGZsb29yM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVDZWlscyA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9DZWlscyA9IFtdO1xyXG5cdHZhciBjZWlsc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLmMpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBjZWlsc0luZC5pbmRleE9mKHRpbGUuYyk7XHJcblx0XHRcdFx0dmFyIGNsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Y2VpbHNJbmQucHVzaCh0aWxlLmMpO1xyXG5cdFx0XHRcdFx0Y2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0Y2wudGlsZSA9IHRpbGUuYztcclxuXHRcdFx0XHRcdG9DZWlscy5wdXNoKGNsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGNsID0gb0NlaWxzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNsW3ldW3hdID0ge3RpbGU6IHRpbGUuYywgeTogdGlsZS5jaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0NlaWxzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGNlaWwzRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob0NlaWxzW2ldLCBcIkNcIiwgR0wpO1xyXG5cdFx0Y2VpbDNELnRleEluZCA9IG9DZWlsc1tpXS50aWxlO1xyXG5cdFx0Y2VpbDNELnR5cGUgPSBcIkNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChjZWlsM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVCbG9ja3MgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQmxvY2tzID0gW107XHJcblx0dmFyIGJsb2Nrc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLncpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBibG9ja3NJbmQuaW5kZXhPZih0aWxlLncpO1xyXG5cdFx0XHRcdHZhciB3bDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGJsb2Nrc0luZC5wdXNoKHRpbGUudyk7XHJcblx0XHRcdFx0XHR3bCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHR3bC50aWxlID0gdGlsZS53O1xyXG5cdFx0XHRcdFx0b0Jsb2Nrcy5wdXNoKHdsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHdsID0gb0Jsb2Nrc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3bFt5XVt4XSA9IHt0aWxlOiB0aWxlLncsIHk6IHRpbGUueSwgaDogdGlsZS5ofTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvQmxvY2tzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGJsb2NrM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9CbG9ja3NbaV0sIFwiQlwiLCBHTCk7XHJcblx0XHRibG9jazNELnRleEluZCA9IG9CbG9ja3NbaV0udGlsZTtcclxuXHRcdGJsb2NrM0QudHlwZSA9IFwiQlwiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKGJsb2NrM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVTbG9wZXMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvU2xvcGVzID0gW107XHJcblx0dmFyIHNsb3Blc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLnNsKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gc2xvcGVzSW5kLmluZGV4T2YodGlsZS5zbCk7XHJcblx0XHRcdFx0dmFyIHNsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0c2xvcGVzSW5kLnB1c2godGlsZS5zbCk7XHJcblx0XHRcdFx0XHRzbCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHRzbC50aWxlID0gdGlsZS5zbDtcclxuXHRcdFx0XHRcdG9TbG9wZXMucHVzaChzbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRzbCA9IG9TbG9wZXNbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHl5ID0gdGlsZS55O1xyXG5cdFx0XHRcdGlmICh0aWxlLncpIHl5ICs9IHRpbGUuaDtcclxuXHRcdFx0XHRpZiAodGlsZS5meSkgeXkgPSB0aWxlLmZ5O1xyXG5cdFx0XHRcdHNsW3ldW3hdID0ge3RpbGU6IHRpbGUuc2wsIHk6IHl5LCBkaXI6IHRpbGUuZGlyfTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvU2xvcGVzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIHNsb3BlM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9TbG9wZXNbaV0sIFwiU1wiLCBHTCk7XHJcblx0XHRzbG9wZTNELnRleEluZCA9IG9TbG9wZXNbaV0udGlsZTtcclxuXHRcdHNsb3BlM0QudHlwZSA9IFwiU1wiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKHNsb3BlM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUucGFyc2VNYXAgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4XSAhPSAwKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLnRpbGVzW2luZF07XHJcblx0XHRcdFx0bWFwRGF0YS5tYXBbeV1beF0gPSB0aWxlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh0aWxlLmYgJiYgdGlsZS5mID4gMTAwKXtcclxuXHRcdFx0XHRcdHRpbGUucmYgPSB0aWxlLmYgLSAxMDA7XHJcblx0XHRcdFx0XHR0aWxlLmlzV2F0ZXIgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR0aWxlLnkgPSAtMC4yO1xyXG5cdFx0XHRcdFx0dGlsZS5meSA9IC0wLjI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh0aWxlLmYgPCAxMDApe1xyXG5cdFx0XHRcdFx0dmFyIHQxLCB0MiwgdDMsIHQ0O1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ldW3grMV0pIHQxID0gKG1hcERhdGEudGlsZXNbbWFwRGF0YS5tYXBbeV1beCsxXV0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeS0xXSkgdDIgPSAobWFwRGF0YS5tYXBbeS0xXVt4XS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4LTFdKSB0MyA9IChtYXBEYXRhLm1hcFt5XVt4LTFdLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3krMV0pIHQ0ID0gKG1hcERhdGEudGlsZXNbbWFwRGF0YS5tYXBbeSsxXVt4XV0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICh0MSB8fCB0MiB8fCB0MyB8fCB0NCl7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNvcGllZFRpbGVzW2luZF0pe1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmNvcGllZFRpbGVzW2luZF0gPSB0aGlzLmNvcHlUaWxlKHRpbGUpO1xyXG5cdFx0XHRcdFx0XHRcdHRpbGUgPSB0aGlzLmNvcGllZFRpbGVzW2luZF07XHJcblx0XHRcdFx0XHRcdFx0bWFwRGF0YS5tYXBbeV1beF0gPSB0aWxlO1xyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHRpbGUueSA9IC0xO1xyXG5cdFx0XHRcdFx0XHRcdHRpbGUuaCArPSAxO1xyXG5cdFx0XHRcdFx0XHRcdGlmICghdGlsZS53KXtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUudyA9IDEwO1xyXG5cdFx0XHRcdFx0XHRcdFx0dGlsZS5oID0gMTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlT2JqZWN0cyA9IGZ1bmN0aW9uKG1hcERhdGEpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49bWFwRGF0YS5vYmplY3RzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG8gPSBtYXBEYXRhLm9iamVjdHNbaV07XHJcblx0XHR2YXIgeCA9IG8ueDtcclxuXHRcdHZhciB5ID0gby55O1xyXG5cdFx0dmFyIHogPSBvLno7XHJcblx0XHRcclxuXHRcdHN3aXRjaCAoby50eXBlKXtcclxuXHRcdFx0Y2FzZSBcInBsYXllclwiOlxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIgPSBuZXcgUGxheWVyKCk7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLnBsYXllci5pbml0KHZlYzMoeCwgeSwgeiksIHZlYzMoMC4wLCBvLmRpciAqIE1hdGguUElfMiwgMC4wKSwgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJpdGVtXCI6XHJcblx0XHRcdFx0dmFyIHN0YXR1cyA9IE1hdGgubWluKDAuMyArIChNYXRoLnJhbmRvbSgpICogMC43KSwgMS4wKTtcclxuXHRcdFx0XHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoby5pdGVtLCBzdGF0dXMpO1xyXG5cdFx0XHRcdHZhciBpdGVtT2JqZWN0ID0gbmV3IEl0ZW0oKTtcclxuXHRcdFx0XHRpdGVtT2JqZWN0LmluaXQodmVjMyh4LCB5LCB6KSwgaXRlbSwgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2goaXRlbU9iamVjdCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZW5lbXlcIjpcclxuXHRcdFx0XHR2YXIgZW5lbXkgPSBFbmVteUZhY3RvcnkuZ2V0RW5lbXkoby5lbmVteSk7XHJcblx0XHRcdFx0dmFyIGVuZW15T2JqZWN0ID0gbmV3IEVuZW15KCk7XHJcblx0XHRcdFx0ZW5lbXlPYmplY3QuaW5pdCh2ZWMzKHgsIHksIHopLCBlbmVteSwgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2goZW5lbXlPYmplY3QpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInN0YWlyc1wiOlxyXG5cdFx0XHRcdHZhciBzdGFpcnNPYmogPSBuZXcgU3RhaXJzKCk7XHJcblx0XHRcdFx0c3RhaXJzT2JqLmluaXQodmVjMyh4LCB5LCB6KSwgdGhpcy5tYXBNYW5hZ2VyLCBvLmRpcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKHN0YWlyc09iaik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZG9vclwiOlxyXG5cdFx0XHRcdHZhciB4eCA9ICh4IDw8IDApIC0gKChvLmRpciA9PSBcIkhcIik/IDEgOiAwKTtcclxuXHRcdFx0XHR2YXIgenogPSAoeiA8PCAwKSAtICgoby5kaXIgPT0gXCJWXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt6el1beHhdLnc7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmRvb3JzLnB1c2gobmV3IERvb3IodGhpcy5tYXBNYW5hZ2VyLCB2ZWMzKHgsIHksIHopLCBvLmRpciwgXCJkb29yMVwiLCB0aWxlKSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxufTsiLCJ2YXIgTWFwQXNzZW1ibGVyID0gcmVxdWlyZSgnLi9NYXBBc3NlbWJsZXInKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdNYXBNYW5hZ2VyJywgJ2dhbWUnKTtcclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdNYXBNYW5hZ2VyJywgJ21hcFRvRHJhdycpO1xyXG5cclxuY2lyY3VsYXIuc2V0UmV2aXZlcignTWFwTWFuYWdlcicsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSl7XHJcblx0b2JqZWN0LmdhbWUgPSBnYW1lO1xyXG5cdHZhciBHTCA9IGdhbWUuR0wuY3R4O1xyXG5cdHZhciBtYXBBc3NlbWJsZXIgPSBuZXcgTWFwQXNzZW1ibGVyKCk7XHJcblx0b2JqZWN0Lm1hcFRvRHJhdyA9IFtdO1xyXG5cdG1hcEFzc2VtYmxlci5hc3NlbWJsZVRlcnJhaW4ob2JqZWN0LCBHTCk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gTWFwTWFuYWdlcigpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignTWFwTWFuYWdlcicpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcE1hbmFnZXI7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ01hcE1hbmFnZXInLCBNYXBNYW5hZ2VyKTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihnYW1lLCBtYXAsIGRlcHRoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01hcE1hbmFnZXInKTtcclxuXHR0aGlzLm1hcCA9IG51bGw7XHJcblx0XHJcblx0dGhpcy53YXRlclRpbGVzID0gW107XHJcblx0dGhpcy53YXRlckZyYW1lID0gMDtcclxuXHRcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMucGxheWVyID0gbnVsbDtcclxuXHR0aGlzLmluc3RhbmNlcyA9IFtdO1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLmRvb3JzID0gW107XHJcblx0dGhpcy5wbGF5ZXJMYXN0ID0gbnVsbDtcclxuXHR0aGlzLmRlcHRoID0gZGVwdGg7XHJcblx0dGhpcy5wb2lzb25Db3VudCA9IDA7XHJcblx0XHJcblx0dGhpcy5tYXBUb0RyYXcgPSBbXTtcclxuXHRcclxuXHRpZiAobWFwID09IFwidGVzdFwiKXtcclxuXHRcdHRoaXMubG9hZE1hcChcInRlc3RNYXBcIik7XHJcblx0fSBlbHNlIGlmIChtYXAgPT0gXCJjb2RleFJvb21cIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJjb2RleFJvb21cIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMuZ2VuZXJhdGVNYXAoZGVwdGgpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdlbmVyYXRlTWFwID0gZnVuY3Rpb24oZGVwdGgpe1xyXG5cdHZhciBjb25maWcgPSB7XHJcblx0XHRNSU5fV0lEVEg6IDEwLFxyXG5cdFx0TUlOX0hFSUdIVDogMTAsXHJcblx0XHRNQVhfV0lEVEg6IDIwLFxyXG5cdFx0TUFYX0hFSUdIVDogMjAsXHJcblx0XHRMRVZFTF9XSURUSDogNjQsXHJcblx0XHRMRVZFTF9IRUlHSFQ6IDY0LFxyXG5cdFx0U1VCRElWSVNJT05fREVQVEg6IDMsXHJcblx0XHRTTElDRV9SQU5HRV9TVEFSVDogMy84LFxyXG5cdFx0U0xJQ0VfUkFOR0VfRU5EOiA1LzgsXHJcblx0XHRSSVZFUl9TRUdNRU5UX0xFTkdUSDogMTAsXHJcblx0XHRNSU5fUklWRVJfU0VHTUVOVFM6IDEwLFxyXG5cdFx0TUFYX1JJVkVSX1NFR01FTlRTOiAyMCxcclxuXHRcdE1JTl9SSVZFUlM6IDMsXHJcblx0XHRNQVhfUklWRVJTOiA1XHJcblx0fTtcclxuXHR2YXIgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihjb25maWcpO1xyXG5cdHZhciBrcmFtZ2luZUV4cG9ydGVyID0gbmV3IEtyYW1naW5lRXhwb3J0ZXIoY29uZmlnKTtcclxuXHR2YXIgZ2VuZXJhdGVkTGV2ZWwgPSBnZW5lcmF0b3IuZ2VuZXJhdGVMZXZlbChkZXB0aCwgdGhpcy5nYW1lLnVuaXF1ZVJlZ2lzdHJ5KTtcclxuXHRcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dHJ5e1xyXG5cdFx0d2luZG93LmdlbmVyYXRlZExldmVsID0gKGdlbmVyYXRlZExldmVsLmxldmVsKTtcclxuXHRcdHZhciBtYXBEYXRhID0ga3JhbWdpbmVFeHBvcnRlci5nZXRMZXZlbChnZW5lcmF0ZWRMZXZlbC5sZXZlbCk7XHJcblx0XHR3aW5kb3cubWFwRGF0YSA9IChtYXBEYXRhKTtcclxuXHRcdHZhciBtYXBBc3NlbWJsZXIgPSBuZXcgTWFwQXNzZW1ibGVyKCk7XHJcblx0XHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVNYXAobWFwTSwgbWFwRGF0YSwgbWFwTS5nYW1lLkdMLmN0eCk7XHJcblx0XHRtYXBNLm1hcCA9IG1hcERhdGEubWFwO1xyXG5cdFx0bWFwTS53YXRlclRpbGVzID0gWzEwMSwgMTAzXTtcclxuXHRcdG1hcE0uZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0fWNhdGNoIChlKXtcclxuXHRcdGlmIChlLm1lc3NhZ2Upe1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZS5zdGFjayk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdH1cclxuXHRcdG1hcE0ubWFwID0gbnVsbDtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5sb2FkTWFwID0gZnVuY3Rpb24obWFwTmFtZSl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdGh0dHAub3BlbignR0VUJywgY3AgKyAnbWFwcy8nICsgbWFwTmFtZSArIFwiLmpzb25cIiwgdHJ1ZSk7XHJcblx0aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICBcdFx0aWYgKGh0dHAucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gIFx0XHRcdHRyeXtcclxuXHRcdFx0XHRtYXBEYXRhID0gSlNPTi5wYXJzZShodHRwLnJlc3BvbnNlVGV4dCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG1hcEFzc2VtYmxlciA9IG5ldyBNYXBBc3NlbWJsZXIoKTtcclxuXHRcdFx0XHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVNYXAobWFwTSwgbWFwRGF0YSwgbWFwTS5nYW1lLkdMLmN0eCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0XHRcdG1hcE0uZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0XHRcdH1jYXRjaCAoZSl7XHJcblx0XHRcdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH07XHJcblx0aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XHJcblx0aHR0cC5zZW5kKCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1dhdGVyVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuICh0aGlzLndhdGVyVGlsZXMuaW5kZXhPZih0aWxlSWQpICE9IC0xKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc1dhdGVyVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhUG9zaXRpb24gPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC5mKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMuaXNMYXZhVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuIHRpbGVJZCA9PSAxMDM7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuY2hhbmdlV2FsbFRleHR1cmUgPSBmdW5jdGlvbih4LCB6LCB0ZXh0dXJlSWQpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIGJhc2UgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIWJhc2UuY2xvbmVkKXtcclxuXHRcdHZhciBuZXdXID0ge307XHJcblx0XHRmb3IgKHZhciBpIGluIGJhc2Upe1xyXG5cdFx0XHRuZXdXW2ldID0gYmFzZVtpXTtcclxuXHRcdH1cclxuXHRcdG5ld1cuY2xvbmVkID0gdHJ1ZTtcclxuXHRcdHRoaXMubWFwW3pdW3hdID0gbmV3VztcclxuXHRcdGJhc2UgPSBuZXdXO1xyXG5cdH1cclxuXHRcclxuXHRiYXNlLncgPSB0ZXh0dXJlSWQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yQXQgPSBmdW5jdGlvbih4LCB5LCB6KXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRpZiAoZG9vci53YWxsUG9zaXRpb24uZXF1YWxzKHgsIHksIHopKSByZXR1cm4gZG9vcjtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0ID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uZXF1YWxzKHBvc2l0aW9uKSl7XHJcblx0XHRcdHJldHVybiB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0R3JpZCA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPT0gcG9zaXRpb24uYSAmJiB6ID09IHBvc2l0aW9uLmMpe1xyXG5cdFx0XHRyZXR1cm4gKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZSA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRcclxuXHR2YXIgbWluWCA9IHggLSAxO1xyXG5cdHZhciBtaW5aID0geiAtIDE7XHJcblx0dmFyIG1heFggPSB4ICsgMTtcclxuXHR2YXIgbWF4WiA9IHogKyAxO1xyXG5cdFxyXG5cdGZvciAodmFyIHp6PW1pblo7eno8PW1heFo7enorKyl7XHJcblx0XHRmb3IgKHZhciB4eD1taW5YO3h4PD1tYXhYO3h4Kyspe1xyXG5cdFx0XHRpZiAodGhpcy5pc1NvbGlkKHh4LCB6eiwgMCkgfHwgdGhpcy5pc1dhdGVyUG9zaXRpb24oeHgsIHp6KSl7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwb3MgPSB2ZWMzKHh4LCAwLCB6eik7XHJcblx0XHRcdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHBvcyk7XHJcblx0XHRcdGlmICghaW5zIHx8ICghaW5zLml0ZW0gJiYgIWlucy5zdGFpcnMpKXtcclxuXHRcdFx0XHRyZXR1cm4gcG9zO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzTmVhcmVzdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBkaXN0YW5jZSwgaGFzUHJvcGVydHkpe1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRpZiAoaGFzUHJvcGVydHkgJiYgIXRoaXMuaW5zdGFuY2VzW2ldW2hhc1Byb3BlcnR5XSkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5hYnModGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYSAtIHBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jIC0gcG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4IDw9IGRpc3RhbmNlICYmIHogPD0gZGlzdGFuY2Upe1xyXG5cdFx0XHRyZXQucHVzaCh0aGlzLmluc3RhbmNlc1tpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgc2VsZil7XHJcblx0dmFyIHAgPSBwb3MuY2xvbmUoKTtcclxuXHRwLmEgPSBwLmEgKyBzcGQuYTtcclxuXHRwLmMgPSBwLmMgKyBzcGQuYjtcclxuXHRcclxuXHR2YXIgaW5zdCA9IG51bGwsIGhvcjtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMgfHwgaW5zLmRlc3Ryb3llZCB8fCAhaW5zLnNvbGlkKSBjb250aW51ZTtcclxuXHRcdGlmIChpbnMgPT09IHNlbGYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHAuYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHAuYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA8PSAwLjggJiYgenogPD0gMC44KXtcclxuXHRcdFx0aWYgKHBvcy5hIDw9IGlucy5wb3NpdGlvbi5hIC0gMC44IHx8IHBvcy5hID49IGlucy5wb3NpdGlvbi5hICsgMC44KSBob3IgPSB0cnVlO1xyXG5cdFx0XHRlbHNlIGlmIChwb3MuYyA8PSBpbnMucG9zaXRpb24uYyAtIDAuOCB8fCBwb3MuYyA+PSBpbnMucG9zaXRpb24uYyArIDAuOCkgaG9yID0gZmFsc2U7ICBcclxuXHRcdFx0aW5zdCA9IGlucztcclxuXHRcdFx0aSA9IGxlbjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0XHJcblx0aWYgKCFpbnN0KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoaW5zdC5oZWlnaHQpe1xyXG5cdFx0aWYgKHBvcy5iICsgaCA8IGluc3QucG9zaXRpb24uYikgcmV0dXJuIG51bGw7XHJcblx0XHRpZiAocG9zLmIgPj0gaW5zdC5wb3NpdGlvbi5iICsgaW5zdC5oZWlnaHQpIHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoaG9yKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnJpZ2h0O1xyXG5cdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS53YWxsSGFzTm9ybWFsID0gZnVuY3Rpb24oeCwgeSwgbm9ybWFsKXtcclxuXHR2YXIgdDEgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRzd2l0Y2ggKG5vcm1hbCl7XHJcblx0XHRjYXNlICd1JzogeSAtPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ2wnOiB4IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnZCc6IHkgKz0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdyJzogeCArPSAxOyBicmVhaztcclxuXHR9XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt5XSkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gMCkgcmV0dXJuIHRydWU7XHJcblx0dmFyIHQyID0gdGhpcy5tYXBbeV1beF07XHJcblx0XHJcblx0aWYgKCF0Mi53KSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodDIudyAmJiAhKHQyLnkgPT0gdDEueSAmJiB0Mi5oID09IHQxLmgpKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIGluV2F0ZXIpe1xyXG5cdHZhciB4eCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHp6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciBkb29yID0gdGhpcy5nZXREb29yQXQoeHgsIHksIHp6KTtcclxuXHRpZiAoZG9vcil7XHJcblx0XHR2YXIgeHh4ID0gKHBvcy5hICsgc3BkLmEpIC0geHg7XHJcblx0XHR2YXIgenp6ID0gKHBvcy5jICsgc3BkLmIpIC0geno7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gKHBvcy5hIC0geHgpO1xyXG5cdFx0dmFyIHogPSAocG9zLmMgLSB6eik7XHJcblx0XHRpZiAoZG9vci5kaXIgPT0gXCJWXCIpe1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRpZiAoenp6ID4gMC4yNSAmJiB6enogPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHggPCAwIHx8IHggPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGVsc2UgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0aWYgKHh4eCA+IDAuMjUgJiYgeHh4IDwgMC43NSkgcmV0dXJuIG51bGw7XHJcblx0XHRcdGlmICh6IDwgMCB8fCB6ID4gMSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKHgsIHosIHkpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQudyAmJiAhdC5kdyAmJiAhdC53ZCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdGlmICh5ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0aWYgKHQueSArIHQuaCA8PSB5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuY2hlY2tCb3hDb2xsaXNpb24gPSBmdW5jdGlvbihib3gxLCBib3gyKXtcclxuXHRpZiAoYm94MS54MiA8IGJveDIueDEgfHwgYm94MS54MSA+IGJveDIueDIgfHwgYm94MS56MiA8IGJveDIuejEgfHwgYm94MS56MSA+IGJveDIuejIpe1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEJCb3hXYWxsTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGJXaWR0aCl7XHJcblx0dmFyIHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciBiQm94ID0ge1xyXG5cdFx0eDE6IHBvcy5hICsgc3BkLmEgLSBiV2lkdGgsXHJcblx0XHR6MTogcG9zLmMgKyBzcGQuYiAtIGJXaWR0aCxcclxuXHRcdHgyOiBwb3MuYSArIHNwZC5hICsgYldpZHRoLFxyXG5cdFx0ejI6IHBvcy5jICsgc3BkLmIgKyBiV2lkdGhcclxuXHR9O1xyXG5cdFxyXG5cdHZhciB4bSA9IHggLSAxO1xyXG5cdHZhciB6bSA9IHogLSAxO1xyXG5cdHZhciB4TSA9IHhtICsgMztcclxuXHR2YXIgek0gPSB6bSArIDM7XHJcblx0XHJcblx0dmFyIHQ7XHJcblx0Zm9yICh2YXIgeno9em07eno8ek07enorKyl7XHJcblx0XHRmb3IgKHZhciB4eD14bTt4eDx4TTt4eCsrKXtcclxuXHRcdFx0aWYgKCF0aGlzLm1hcFt6el0pIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IDApIGNvbnRpbnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0dCA9IHRoaXMubWFwW3p6XVt4eF07XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIXQudyAmJiAhdC5kdyAmJiAhdC53ZCkgY29udGludWU7XHJcblx0XHRcdGlmICh0LnkrdC5oIDw9IHkpIGNvbnRpbnVlO1xyXG5cdFx0XHRlbHNlIGlmICh0LnkgPiB5ICsgMC41KSBjb250aW51ZTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBib3ggPSB7XHJcblx0XHRcdFx0eDE6IHh4LFxyXG5cdFx0XHRcdHoxOiB6eixcclxuXHRcdFx0XHR4MjogeHggKyAxLFxyXG5cdFx0XHRcdHoyOiB6eiArIDFcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLmNoZWNrQm94Q29sbGlzaW9uKGJCb3gsIGJveCkpe1xyXG5cdFx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHRcdHZhciB6enogPSBwb3MuYyAtIHp6O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBuViA9IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgfHwgdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2QnKTtcclxuXHRcdFx0XHR2YXIgbkggPSB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpIHx8IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdsJyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHp6eiA+PSAtYldpZHRoICYmIHp6eiA8IDEgKyBiV2lkdGggJiYgbkgpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoeHh4ID49IC1iV2lkdGggJiYgeHh4IDwgMSArIGJXaWR0aCAmJiBuVil7XHJcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFdhbGxOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgaW5XYXRlcil7XHJcblx0dmFyIHQsIHRoO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIHh4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgenogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdFxyXG5cdGlmICghdGhpcy5tYXBbenpdKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gMCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0dCA9IHRoaXMubWFwW3p6XVt4eF07XHJcblx0aSA9IDQ7XHJcblx0XHJcblx0aWYgKCF0KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0aCA9IHQuaCAtIDAuMztcclxuXHRpZiAoaW5XYXRlcikgeSArPSAwLjM7XHJcblx0aWYgKHQuc2wpIHRoICs9IDAuMjtcclxuXHRcclxuXHRpZiAoIXQudyAmJiAhdC5kdyAmJiAhdC53ZCkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHQueSt0aCA8PSB5KSByZXR1cm4gbnVsbDtcclxuXHRlbHNlIGlmICh0LnkgPiB5ICsgaCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0aWYgKCF0KSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC53KXtcclxuXHRcdHZhciB0ZXggPSB0aGlzLmdhbWUuZ2V0VGV4dHVyZUJ5SWQodC53LCBcIndhbGxcIik7XHJcblx0XHRpZiAodGV4LmlzU29saWQpe1xyXG5cdFx0XHR2YXIgeHh4ID0gcG9zLmEgLSB4eDtcclxuXHRcdFx0dmFyIHp6eiA9IHBvcy5jIC0geno7XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAndScpICYmIHp6eiA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDsgfVxyXG5cdFx0XHRpZiAodGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2QnKSAmJiB6enogPj0gMSl7IHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93bjsgfVxyXG5cdFx0XHRpZiAodGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2wnKSAmJiB4eHggPD0gMCl7IHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDsgfVxyXG5cdFx0XHRpZiAodGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3InKSAmJiB4eHggPj0gMSl7IHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMucmlnaHQ7IH1cclxuXHRcdH1cclxuXHR9ZWxzZSBpZiAodC5kdyl7XHJcblx0XHR2YXIgeCwgeiwgeHh4LCB6enosIG5vcm1hbDtcclxuXHRcdHggPSBwb3MuYSArIHNwZC5hO1xyXG5cdFx0eiA9IHBvcy5jICsgc3BkLmI7XHJcblx0XHRcclxuXHRcdGlmICh0LmF3ID09IDApeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICB6IC0geno7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy51cExlZnQ7IH1cclxuXHRcdGVsc2UgaWYgKHQuYXcgPT0gMSl7IHh4eCA9IHggLSB4eDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwUmlnaHQ7IH1cclxuXHRcdGVsc2UgaWYgKHQuYXcgPT0gMil7IHh4eCA9IHggLSB4eDsgenp6ID0gICh6eiArIDEpIC0gejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmRvd25SaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAzKXsgeHh4ID0gKHh4ICsgMSkgLSB4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93bkxlZnQ7IH1cclxuXHRcdGlmICh6enogPj0geHh4KXtcclxuXHRcdFx0cmV0dXJuIG5vcm1hbDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRZRmxvb3IgPSBmdW5jdGlvbih4LCB5LCBub1dhdGVyKXtcclxuXHR2YXIgaW5zID0gdGhpcy5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHg8PDAsMCx5PDwwKSk7XHJcblx0aWYgKGlucyAhPSBudWxsICYmIGlucy5oZWlnaHQpe1xyXG5cdFx0cmV0dXJuIGlucy5wb3NpdGlvbi5iICsgaW5zLmhlaWdodDtcclxuXHR9XHJcblx0XHJcblx0dmFyIHh4ID0geCAtICh4IDw8IDApO1xyXG5cdHZhciB5eSA9IHkgLSAoeSA8PCAwKTtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHkgPSB5IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt5XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3ldW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdHZhciB0dCA9IHQueTtcclxuXHRcclxuXHRpZiAodC53KSB0dCArPSB0Lmg7XHJcblx0aWYgKHQuZikgdHQgPSB0LmZ5O1xyXG5cdFxyXG5cdGlmICghbm9XYXRlciAmJiB0aGlzLmlzV2F0ZXJUaWxlKHQuZikpIHR0IC09IDAuMztcclxuXHRcclxuXHRpZiAodC5zbCl7XHJcblx0XHRpZiAodC5kaXIgPT0gMCkgdHQgKz0geXkgKiAwLjU7IGVsc2VcclxuXHRcdGlmICh0LmRpciA9PSAxKSB0dCArPSB4eCAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDIpIHR0ICs9ICgxLjAgLSB5eSkgKiAwLjU7IGVsc2VcclxuXHRcdGlmICh0LmRpciA9PSAzKSB0dCArPSAoMS4wIC0geHgpICogMC41O1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5kcmF3TWFwID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgeCwgeTtcclxuXHR4ID0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYTtcclxuXHR5ID0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYztcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMubWFwVG9EcmF3Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG10ZCA9IHRoaXMubWFwVG9EcmF3W2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA8IG10ZC5ib3VuZGFyaWVzWzBdIHx8IHggPiBtdGQuYm91bmRhcmllc1syXSB8fCB5IDwgbXRkLmJvdW5kYXJpZXNbMV0gfHwgeSA+IG10ZC5ib3VuZGFyaWVzWzNdKVxyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aWYgKG10ZC50eXBlID09IFwiQlwiKXsgLy8gQmxvY2tzXHJcblx0XHRcdHRoaXMuZ2FtZS5kcmF3QmxvY2sobXRkLCBtdGQudGV4SW5kKTtcclxuXHRcdH1lbHNlIGlmIChtdGQudHlwZSA9PSBcIkZcIil7IC8vIEZsb29yc1xyXG5cdFx0XHR2YXIgdHQgPSBtdGQudGV4SW5kO1xyXG5cdFx0XHRpZiAodGhpcy5pc1dhdGVyVGlsZSh0dCkpeyBcclxuXHRcdFx0XHR0dCA9IChtdGQuclRleEluZCkgKyAodGhpcy53YXRlckZyYW1lIDw8IDApO1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5kcmF3Rmxvb3IobXRkLCB0dCwgJ3dhdGVyJyk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5kcmF3Rmxvb3IobXRkLCB0dCwgJ2Zsb29yJyk7XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmIChtdGQudHlwZSA9PSBcIkNcIil7IC8vIENlaWxzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdHRoaXMuZ2FtZS5kcmF3Rmxvb3IobXRkLCB0dCwgJ2NlaWwnKTtcclxuXHRcdH1lbHNlIGlmIChtdGQudHlwZSA9PSBcIlNcIil7IC8vIFNsb3BlXHJcblx0XHRcdHRoaXMuZ2FtZS5kcmF3U2xvcGUobXRkLCBtdGQudGV4SW5kKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRQbGF5ZXJJdGVtID0gZnVuY3Rpb24oaXRlbUNvZGUpe1xyXG5cdHZhciBpbnYgPSB0aGlzLmdhbWUuaW52ZW50b3J5Lml0ZW1zO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW52Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKGludltpXS5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0cmV0dXJuIGludltpXTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXJJdGVtID0gZnVuY3Rpb24oaXRlbUNvZGUsIGFtb3VudCl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXQgPSBpbnZbaV07XHJcblx0XHRpZiAoaXQuY29kZSA9PSBpdGVtQ29kZSl7XHJcblx0XHRcdGlmICgtLWl0LmFtb3VudCA9PSAwKXtcclxuXHRcdFx0XHRpbnYuc3BsaWNlKGksMSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5hZGRNZXNzYWdlID0gZnVuY3Rpb24odGV4dCl7XHJcblx0dGhpcy5nYW1lLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKHRleHQpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZ2FtZS50aW1lU3RvcCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJGcmFtZSArPSAwLjE7XHJcblx0aWYgKHRoaXMud2F0ZXJGcmFtZSA+PSAyKSB0aGlzLndhdGVyRnJhbWUgPSAwO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzVG9EcmF3ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdGlmIChpbnMuZGVzdHJveWVkKXtcclxuXHRcdFx0dGhpcy5pbnN0YW5jZXMuc3BsaWNlKGksIDEpO1xyXG5cdFx0XHRpLS07XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHp6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4ID4gNiB8fCB6eiA+IDYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgZGlzdCA9IHh4ICogeHggKyB6eiAqIHp6O1xyXG5cdFx0dmFyIGFkZGVkID0gZmFsc2U7XHJcblx0XHRmb3IgKHZhciBqPTAsamxlbj10aGlzLm9yZGVySW5zdGFuY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0aWYgKGRpc3QgPiB0aGlzLm9yZGVySW5zdGFuY2VzW2pdLmRpc3Qpe1xyXG5cdFx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMuc3BsaWNlKGosMCx7X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdPcmRlckluc3RhbmNlJyksIGluczogaW5zLCBkaXN0OiBkaXN0fSk7XHJcblx0XHRcdFx0YWRkZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGogPSBqbGVuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICghYWRkZWQpe1xyXG5cdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnB1c2goe19jOiBjaXJjdWxhci5yZWdpc3RlcignT3JkZXJJbnN0YW5jZScpLCBpbnM6IGlucywgZGlzdDogZGlzdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc0F0ID0gZnVuY3Rpb24oeCwgeil7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRcclxuXHRcdGlmIChNYXRoLnJvdW5kKGlucy5wb3NpdGlvbi5hKSA9PSB4ICYmIE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmMpID09IHopXHJcblx0XHRcdHJldC5wdXNoKGlucyk7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhd01hcCgpO1xyXG5cdFxyXG5cdHRoaXMuZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm9yZGVySW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMub3JkZXJJbnN0YW5jZXNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdGlucyA9IGlucy5pbnM7XHJcblx0XHRcclxuXHRcdGlmIChpbnMuZGVzdHJveWVkKXtcclxuXHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHR9XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdGlucy5sb29wKCk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3IoaW5zLnBvc2l0aW9uLmEsIGlucy5wb3NpdGlvbi5iLCBpbnMucG9zaXRpb24uYywgaW5zLnJvdGF0aW9uLCBpbnMudGV4dHVyZUNvZGUpO1xyXG5cdFx0dGhpcy5nYW1lLmRyYXdEb29yV2FsbChpbnMuZG9vclBvc2l0aW9uLmEsIGlucy5kb29yUG9zaXRpb24uYiwgaW5zLmRvb3JQb3NpdGlvbi5jLCBpbnMud2FsbFRleHR1cmUsIChpbnMuZGlyID09IFwiVlwiKSk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMucGxheWVyLmxvb3AoKTtcclxuXHRpZiAodGhpcy5wb2lzb25Db3VudCA+IDApe1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCAtPSAxO1xyXG5cdH1lbHNlIGlmICh0aGlzLmdhbWUucGxheWVyLnBvaXNvbmVkICYmIHRoaXMucG9pc29uQ291bnQgPT0gMCl7XHJcblx0XHR0aGlzLnBsYXllci5yZWNlaXZlRGFtYWdlKDEwKTtcclxuXHRcdHRoaXMucG9pc29uQ291bnQgPSAxMDA7XHJcblx0fVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRtYWtlUGVyc3BlY3RpdmU6IGZ1bmN0aW9uKGZvdiwgYXNwZWN0UmF0aW8sIHpOZWFyLCB6RmFyKXtcclxuXHRcdHZhciB6TGltaXQgPSB6TmVhciAqIE1hdGgudGFuKGZvdiAqIE1hdGguUEkgLyAzNjApO1xyXG5cdFx0dmFyIEEgPSAtKHpGYXIgKyB6TmVhcikgLyAoekZhciAtIHpOZWFyKTtcclxuXHRcdHZhciBCID0gLTIgKiB6RmFyICogek5lYXIgLyAoekZhciAtIHpOZWFyKTtcclxuXHRcdHZhciBDID0gKDIgKiB6TmVhcikgLyAoekxpbWl0ICogYXNwZWN0UmF0aW8gKiAyKTtcclxuXHRcdHZhciBEID0gKDIgKiB6TmVhcikgLyAoMiAqIHpMaW1pdCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdEMsIDAsIDAsIDAsXHJcblx0XHRcdDAsIEQsIDAsIDAsXHJcblx0XHRcdDAsIDAsIEEsLTEsXHJcblx0XHRcdDAsIDAsIEIsIDBcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRuZXdNYXRyaXg6IGZ1bmN0aW9uKGNvbHMsIHJvd3Mpe1xyXG5cdFx0dmFyIHJldCA9IG5ldyBBcnJheShyb3dzKTtcclxuXHRcdGZvciAodmFyIGk9MDtpPHJvd3M7aSsrKXtcclxuXHRcdFx0cmV0W2ldID0gbmV3IEFycmF5KGNvbHMpO1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajxjb2xzO2orKyl7XHJcblx0XHRcdFx0cmV0W2ldW2pdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0SWRlbnRpdHk6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCAxLCAwLCAwLFxyXG5cdFx0XHQwLCAwLCAxLCAwLFxyXG5cdFx0XHQwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWFrZVRyYW5zZm9ybTogZnVuY3Rpb24ob2JqZWN0LCBjYW1lcmEpe1xyXG5cdFx0Ly8gU3RhcnRzIHdpdGggdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdFx0dmFyIHRNYXQgPSB0aGlzLmdldElkZW50aXR5KCk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0XHJcblx0XHQvLyBVbnRpbCBJIGZpbmQgdGhlIG5lZWQgdG8gcm90YXRlIGFuIG9iamVjdCBpdHNlbGYgaXQgcmVhbWlucyBhcyBjb21tZW50XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25YKG9iamVjdC5yb3RhdGlvbi5hKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWShvYmplY3Qucm90YXRpb24uYikpO1xyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWihvYmplY3Qucm90YXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBJZiB0aGUgb2JqZWN0IGlzIGEgYmlsbGJvYXJkLCB0aGVuIG1ha2UgaXQgbG9vayB0byB0aGUgY2FtZXJhXHJcblx0XHRpZiAob2JqZWN0LmlzQmlsbGJvYXJkICYmICFvYmplY3Qubm9Sb3RhdGUpIHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKC0oY2FtZXJhLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCB0byBpdHMgcG9zaXRpb25cclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0VHJhbnNsYXRpb24ob2JqZWN0LnBvc2l0aW9uLmEsIG9iamVjdC5wb3NpdGlvbi5iLCBvYmplY3QucG9zaXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlIHRoZSBvYmplY3QgaW4gcmVsYXRpb24gdG8gdGhlIGNhbWVyYVxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbigtY2FtZXJhLnBvc2l0aW9uLmEsIC1jYW1lcmEucG9zaXRpb24uYiAtIGNhbWVyYS5jYW1lcmFIZWlnaHQsIC1jYW1lcmEucG9zaXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBSb3RhdGUgdGhlIG9iamVjdCBpbiB0aGUgY2FtZXJhIGRpcmVjdGlvbiAoSSBkb24ndCByZWFsbHkgcm90YXRlIGluIHRoZSBaIGF4aXMpXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpO1xyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgoLWNhbWVyYS5yb3RhdGlvbi5hKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKC1jYW1lcmEucm90YXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdE1hdDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRyYW5zbGF0aW9uOiBmdW5jdGlvbih4LCB5LCB6KXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdHgsIHksIHosIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblg6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIEMsIFMsIDAsXHJcblx0XHRcdDAsLVMsIEMsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblk6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCAwLCBTLCAwLFxyXG5cdFx0XHQgMCwgMSwgMCwgMCxcclxuXHRcdFx0LVMsIDAsIEMsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25aOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQgQywgUywgMCwgMCxcclxuXHRcdFx0LVMsIEMsIDAsIDAsXHJcblx0XHRcdCAwLCAwLCAxLCAwLFxyXG5cdFx0XHQgMCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG1pbmlNYXRyaXhNdWx0OiBmdW5jdGlvbihyb3csIGNvbHVtbil7XHJcblx0XHR2YXIgcmVzdWx0ID0gMDtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49cm93Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRyZXN1bHQgKz0gcm93W2ldICogY29sdW1uW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0sXHJcblx0XHJcblx0bWF0cml4TXVsdGlwbGljYXRpb246IGZ1bmN0aW9uKG1hdHJpeEEsIG1hdHJpeEIpe1xyXG5cdFx0dmFyIEExID0gW21hdHJpeEFbMF0sICBtYXRyaXhBWzFdLCAgbWF0cml4QVsyXSwgIG1hdHJpeEFbM11dO1xyXG5cdFx0dmFyIEEyID0gW21hdHJpeEFbNF0sICBtYXRyaXhBWzVdLCAgbWF0cml4QVs2XSwgIG1hdHJpeEFbN11dO1xyXG5cdFx0dmFyIEEzID0gW21hdHJpeEFbOF0sICBtYXRyaXhBWzldLCAgbWF0cml4QVsxMF0sIG1hdHJpeEFbMTFdXTtcclxuXHRcdHZhciBBNCA9IFttYXRyaXhBWzEyXSwgbWF0cml4QVsxM10sIG1hdHJpeEFbMTRdLCBtYXRyaXhBWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBCMSA9IFttYXRyaXhCWzBdLCBtYXRyaXhCWzRdLCBtYXRyaXhCWzhdLCAgbWF0cml4QlsxMl1dO1xyXG5cdFx0dmFyIEIyID0gW21hdHJpeEJbMV0sIG1hdHJpeEJbNV0sIG1hdHJpeEJbOV0sICBtYXRyaXhCWzEzXV07XHJcblx0XHR2YXIgQjMgPSBbbWF0cml4QlsyXSwgbWF0cml4Qls2XSwgbWF0cml4QlsxMF0sIG1hdHJpeEJbMTRdXTtcclxuXHRcdHZhciBCNCA9IFttYXRyaXhCWzNdLCBtYXRyaXhCWzddLCBtYXRyaXhCWzExXSwgbWF0cml4QlsxNV1dO1xyXG5cdFx0XHJcblx0XHR2YXIgbW1tID0gdGhpcy5taW5pTWF0cml4TXVsdDtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdG1tbShBMSwgQjEpLCBtbW0oQTEsIEIyKSwgbW1tKEExLCBCMyksIG1tbShBMSwgQjQpLFxyXG5cdFx0XHRtbW0oQTIsIEIxKSwgbW1tKEEyLCBCMiksIG1tbShBMiwgQjMpLCBtbW0oQTIsIEI0KSxcclxuXHRcdFx0bW1tKEEzLCBCMSksIG1tbShBMywgQjIpLCBtbW0oQTMsIEIzKSwgbW1tKEEzLCBCNCksXHJcblx0XHRcdG1tbShBNCwgQjEpLCBtbW0oQTQsIEIyKSwgbW1tKEE0LCBCMyksIG1tbShBNCwgQjQpXHJcblx0XHRdO1xyXG5cdH1cclxufTtcclxuIiwidmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdNaXNzaWxlJywgJ2JpbGxib2FyZCcpO1xyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdNaXNzaWxlJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKSB7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleC5ib2x0cy5idWZmZXJzW29iamVjdC5zdWJJbWddO1xyXG5cdFxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIE1pc3NpbGUoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01pc3NpbGUnKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNaXNzaWxlO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdNaXNzaWxlJywgTWlzc2lsZSk7XHJcblxyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCByb3RhdGlvbiwgdHlwZSwgdGFyZ2V0LCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMudHlwZSA9IHR5cGU7XHJcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0dGhpcy5zdHIgPSAwO1xyXG5cdHRoaXMuc3BlZWQgPSAwLjM7XHJcblx0dGhpcy5taXNzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnZzcGVlZCA9IDA7XHJcblx0dGhpcy5ncmF2aXR5ID0gMDtcclxuXHRcclxuXHR2YXIgc3ViSW1nID0gMDtcclxuXHRzd2l0Y2ggKHR5cGUpe1xyXG5cdFx0Y2FzZSAnc2xpbmcnOiBcclxuXHRcdFx0c3ViSW1nID0gMDtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRcdHRoaXMuZ3Jhdml0eSA9IDAuMDA1O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdib3cnOiBcclxuXHRcdFx0c3ViSW1nID0gMTtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Nyb3NzYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDI7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdtYWdpY01pc3NpbGUnOiBcclxuXHRcdFx0c3ViSW1nID0gMzsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ljZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA0OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnZmlyZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA1OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHN1YkltZyA9IDY7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC41O1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuc3ViSW1nID0gc3ViSW1nO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSAnYm9sdHMnO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tzdWJJbWddO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuY2hlY2tDb2xsaXNpb24gPSBmdW5jdGlvbigpe1xyXG5cdHZhciBtYXAgPSB0aGlzLm1hcE1hbmFnZXIubWFwO1xyXG5cdGlmICh0aGlzLnBvc2l0aW9uLmEgPCAwIHx8IHRoaXMucG9zaXRpb24uYyA8IDAgfHwgdGhpcy5wb3NpdGlvbi5hID49IG1hcFswXS5sZW5ndGggfHwgdGhpcy5wb3NpdGlvbi5jID49IG1hcC5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgeCA9IHRoaXMucG9zaXRpb24uYSA8PCAwO1xyXG5cdHZhciB5ID0gdGhpcy5wb3NpdGlvbi5iICsgMC41O1xyXG5cdHZhciB6ID0gdGhpcy5wb3NpdGlvbi5jIDw8IDA7XHJcblx0dmFyIHRpbGUgPSBtYXBbel1beF07XHJcblx0XHJcblx0aWYgKHRpbGUudyB8fCB0aWxlLndkIHx8IHRpbGUud2Qpe1xyXG5cdFx0aWYgKCEodGlsZS55ICsgdGlsZS5oIDwgeSB8fCB0aWxlLnkgPiB5KSl7XHJcblx0XHRcdCByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmICh5IDwgdGlsZS5meSB8fCB5ID4gdGlsZS5jaCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciBpbnMsIGRmcztcclxuXHRpZiAodGhpcy50YXJnZXQgPT0gJ2VuZW15Jyl7XHJcblx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlc05lYXJlc3QodGhpcy5wb3NpdGlvbiwgMC41LCAnZW5lbXknKTtcclxuXHRcdHZhciBkaXN0ID0gMTAwMDA7XHJcblx0XHRpZiAoaW5zdGFuY2VzLmxlbmd0aCA+IDEpe1xyXG5cdFx0XHRmb3IgKHZhciBpPTAsbGVuPWluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHR2YXIgeHggPSBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLmEgLSBpbnN0YW5jZXNbaV0ucG9zaXRpb24uYSk7XHJcblx0XHRcdFx0dmFyIHl5ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5jIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBkID0geHggKiB4eCArIHl5ICogeXk7XHJcblx0XHRcdFx0aWYgKGQgPCBkaXN0KXtcclxuXHRcdFx0XHRcdGRpc3QgPSBkO1xyXG5cdFx0XHRcdFx0aW5zID0gaW5zdGFuY2VzW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGluc3RhbmNlcy5sZW5ndGggPT0gMSl7XHJcblx0XHRcdGlucyA9IGluc3RhbmNlc1swXTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZGZzID0gVXRpbHMucm9sbERpY2UoaW5zLmVuZW15LnN0YXRzLmRmcyk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0ID09ICdwbGF5ZXInKXtcclxuXHRcdGlucyA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRpZiAoenogPiAwLjUgfHwgeHggPiAwLjUpIHJldHVybiB0cnVlO1xyXG5cdFx0XHJcblx0XHRkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHRoaXMuc3RyIC0gZGZzLCAwKTtcclxuXHRcclxuXHRpZiAodGhpcy5taXNzZWQpe1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKGRtZyAhPSAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIGRhbWFnZVwiKTsgLy8gVE9ETzogUmVwbGFjZSB3aXRoIHBvcHVwIG92ZXIgaW5zXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2hpdCcpO1xyXG5cdFx0aW5zLnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnYmxvY2snKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy52c3BlZWQgKz0gdGhpcy5ncmF2aXR5O1xyXG5cdFxyXG5cdHZhciB4VG8gPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5zcGVlZDtcclxuXHR2YXIgeVRvID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5hKSAqIHRoaXMuc3BlZWQgLSB0aGlzLnZzcGVlZDtcclxuXHR2YXIgelRvID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24uc3VtKHZlYzMoeFRvLCB5VG8sIHpUbykpO1xyXG5cdFxyXG5cdGlmICghdGhpcy5jaGVja0NvbGxpc2lvbigpKXtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07IiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bm9ybWFsczoge1xyXG5cdFx0ZG93bjogIHZlYzIoIDAsIDEpLFxyXG5cdFx0cmlnaHQ6IHZlYzIoIDEsIDApLFxyXG5cdFx0dXA6ICAgIHZlYzIoIDAsLTEpLFxyXG5cdFx0bGVmdDogIHZlYzIoLTEsIDApLFxyXG5cdFx0XHJcblx0XHR1cFJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0dXBMZWZ0OiAgdmVjMigtTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCAtTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKSxcclxuXHRcdGRvd25SaWdodDogIHZlYzIoTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCBNYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93bkxlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSlcclxuXHR9LFxyXG5cdFxyXG5cdGN1YmU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0LCAvKlt1LGwsZCxyXSovIGZhY2VzKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXTtcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGlmICghZmFjZXMpIGZhY2VzID0gWzEsMSwxLDFdO1xyXG5cdFx0aWYgKGZhY2VzWzBdKXsgLy8gVXAgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgXHQgdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1sxXSl7IC8vIExlZnQgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0XHQgdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDAsMCwwLDApO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzJdKXsgLy8gRG93biBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMSwxLDEsMSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbM10peyAvLyBSaWdodCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHRcdC13LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHRcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHRcdDAuMCwgdHksXHJcblx0XHRcdFx0MC4wLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGZsb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRjZWlsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAyLCAxLCAxLCAyLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRkb29yV2FsbDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jICogMC4wNTtcclxuXHRcdFxyXG5cdFx0dmFyIHcyID0gLXNpemUuYSAqIDAuMjU7XHJcblx0XHR2YXIgdzMgPSBzaXplLmEgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgaDIgPSAxIC0gc2l6ZS5iICogMC4yNTtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQvLyBSaWdodCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dzIsICBoLCAgbCxcclxuXHRcdFx0dzIsICAwLCAgbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIExlZnQgcGFydCBvZiB0aGUgZG9vclxyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCB3LCAgMCwgLWwsXHJcblx0XHRcdHczLCAgaCwgLWwsXHJcblx0XHRcdHczLCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIE1pZGRsZSBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgaDIsICBsLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgaDIsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIEJvdHRvbSBGYWNlXHJcblx0XHRcdHczLCBoMiwgLWwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdHcyLCBoMiwgLWwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTw2O2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuMjUsIHR5LFxyXG5cdFx0XHRcdDAuMjUsMC4wLFxyXG5cdFx0XHRcdDAuMDAsIHR5LFxyXG5cdFx0XHRcdDAuMDAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuNSwxLjAsXHJcblx0XHRcdFx0MC41LDAuNzUsXHJcblx0XHRcdFx0MC4wLDEuMCxcclxuXHRcdFx0XHQwLjAsMC43NVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0fSxcclxuXHRcclxuXHRkb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBsaWdodCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYTtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAgbCxcclxuXHRcdFx0IDAsICAwLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKHR4LCB0eSwgdHgsMC4wLCAwLjAsIHR5LCAwLjAsMC4wKTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKDAuMCwgdHksIDAuMCwwLjAsIHR4LCB0eSwgdHgsMC4wKTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4wMSwwLjAxLFxyXG5cdFx0XHRcdDAuMDEsMC4wLFxyXG5cdFx0XHRcdDAuMCAsMC4wMSxcclxuXHRcdFx0XHQwLjAgLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwxNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0cmV0dXJuIGRvb3I7XHJcblx0fSxcclxuXHRcclxuXHRiaWxsYm9hcmQ6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IHcsICBoLCAgMCxcclxuXHRcdFx0LXcsICBoLCAgMCxcclxuXHRcdFx0IHcsICAwLCAgMCxcclxuXHRcdFx0LXcsICAwLCAgMCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49NDtpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW1xyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHRdO1xyXG5cdFx0XHRcdCBcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBiaWxsID0gIHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YmlsbC5pc0JpbGxib2FyZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gYmlsbDtcclxuXHR9LFxyXG5cdFxyXG5cdHNsb3BlOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBkaXIpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCAvLyBGcm9udCBTbG9wZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQgLy8gUmlnaHQgU2lkZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdCAvLyBMZWZ0IFNpZGVcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdC13LCAgMC4wLCAgbFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aWYgKGRpciAhPSAwKXtcclxuXHRcdFx0dmFyIGFuZyA9IE1hdGguZGVnVG9SYWQoZGlyICogLTkwKTtcclxuXHRcdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHZlcnRleC5sZW5ndGg7aSs9Myl7XHJcblx0XHRcdFx0dmFyIGEgPSB2ZXJ0ZXhbaV0gKiBDIC0gdmVydGV4W2krMl0gKiBTO1xyXG5cdFx0XHRcdHZhciBiID0gdmVydGV4W2ldICogUyArIHZlcnRleFtpKzJdICogQztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2ZXJ0ZXhbaV0gPSBhO1xyXG5cdFx0XHRcdHZlcnRleFtpKzJdID0gYjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzLCA0LCA1LCA2LCA3LCA4LCA5KTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5LFxyXG5cdFx0XHRcclxuXHRcdFx0MC4wLCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsICB0eVxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwLDAsMCwwLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRhc3NlbWJsZU9iamVjdDogZnVuY3Rpb24obWFwRGF0YSwgb2JqZWN0VHlwZSwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIHJlY3QgPSBbNjQsNjQsMCwwXTsgLy8gW3gxLHkxLHgyLHkyXVxyXG5cdFx0Zm9yICh2YXIgeT0wLHlsZW49bWFwRGF0YS5sZW5ndGg7eTx5bGVuO3krKyl7XHJcblx0XHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGFbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRcdHZhciB0ID0gKG1hcERhdGFbeV1beF0udGlsZSk/IG1hcERhdGFbeV1beF0udGlsZSA6IDA7XHJcblx0XHRcdFx0aWYgKHQgIT0gMCl7XHJcblx0XHRcdFx0XHQvLyBTZWxlY3RpbmcgYm91bmRhcmllcyBvZiB0aGUgbWFwIHBhcnRcclxuXHRcdFx0XHRcdHJlY3RbMF0gPSBNYXRoLm1pbihyZWN0WzBdLCB4IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzFdID0gTWF0aC5taW4ocmVjdFsxXSwgeSAtIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFsyXSA9IE1hdGgubWF4KHJlY3RbMl0sIHggKyA2KTtcclxuXHRcdFx0XHRcdHJlY3RbM10gPSBNYXRoLm1heChyZWN0WzNdLCB5ICsgNik7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHZhciB2djtcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiRlwiKXsgdnYgPSB0aGlzLmZsb29yKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIEZsb29yXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIkNcIil7IHZ2ID0gdGhpcy5jZWlsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIENlaWxcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQlwiKXsgdnYgPSB0aGlzLmN1YmUodmVjMygxLjAsbWFwRGF0YVt5XVt4XS5oLDEuMCksIHZlYzIoMS4wLG1hcERhdGFbeV1beF0uaCksIGdsLCBmYWxzZSwgdGhpcy5nZXRDdWJlRmFjZXMobWFwRGF0YSwgeCwgeSkpOyB9ZWxzZSAvLyBCbG9ja1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJTXCIpeyB2diA9IHRoaXMuc2xvcGUodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsLCBtYXBEYXRhW3ldW3hdLmRpcik7IH0gLy8gU2xvcGVcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZlcnRleE9mZiA9IHZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnZlcnRpY2VzLmxlbmd0aDtpPGxlbjtpKz0zKXtcclxuXHRcdFx0XHRcdFx0eHggPSB2di52ZXJ0aWNlc1tpXSArIHggKyAwLjU7XHJcblx0XHRcdFx0XHRcdHl5ID0gdnYudmVydGljZXNbaSsxXSArIG1hcERhdGFbeV1beF0ueTtcclxuXHRcdFx0XHRcdFx0enogPSB2di52ZXJ0aWNlc1tpKzJdICsgeSArIDAuNTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRpY2VzLnB1c2goeHgsIHl5LCB6eik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuaW5kaWNlcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh2di5pbmRpY2VzW2ldICsgdmVydGV4T2ZmKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di50ZXhDb29yZHMubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHR0ZXhDb29yZHMucHVzaCh2di50ZXhDb29yZHNbaV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LmRhcmtWZXJ0ZXgubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHRkYXJrVmVydGV4LnB1c2godnYuZGFya1ZlcnRleFtpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IFJlY3JlYXRlIGJ1ZmZlciBkYXRhIG9uIGRlc2VyaWFsaXphdGlvblxyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGljZXMubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtWZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBidWZmZXIgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdGJ1ZmZlci5ib3VuZGFyaWVzID0gcmVjdDtcclxuXHRcdHJldHVybiBidWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRcclxuXHRnZXRDdWJlRmFjZXM6IGZ1bmN0aW9uKG1hcCwgeCwgeSl7XHJcblx0XHR2YXIgcmV0ID0gWzEsMSwxLDFdO1xyXG5cdFx0dmFyIHRpbGUgPSBtYXBbeV1beF07XHJcblx0XHRcclxuXHRcdC8vIFVwIEZhY2VcclxuXHRcdGlmICh5ID4gMCAmJiBtYXBbeS0xXVt4XSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeS0xXVt4XTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFswXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIExlZnQgZmFjZVxyXG5cdFx0aWYgKHggPCA2MyAmJiBtYXBbeV1beCsxXSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeV1beCsxXTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFsxXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIERvd24gZmFjZVxyXG5cdFx0aWYgKHkgPCA2MyAmJiBtYXBbeSsxXVt4XSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeSsxXVt4XTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFsyXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIFJpZ2h0IGZhY2VcclxuXHRcdGlmICh4ID4gMCAmJiBtYXBbeV1beC0xXSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeV1beC0xXTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFszXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldE9iamVjdFdpdGhQcm9wZXJ0aWVzOiBmdW5jdGlvbih2ZXJ0ZXhCdWZmZXIsIGluZGV4QnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpe1xyXG5cdFx0dmFyIG9iaiA9IHtcclxuXHRcdFx0cm90YXRpb246IHZlYzMoMCwgMCwgMCksXHJcblx0XHRcdHBvc2l0aW9uOiB2ZWMzKDAsIDAsIDApLFxyXG5cdFx0XHR2ZXJ0ZXhCdWZmZXI6IHZlcnRleEJ1ZmZlciwgXHJcblx0XHRcdGluZGljZXNCdWZmZXI6IGluZGV4QnVmZmVyLCBcclxuXHRcdFx0dGV4QnVmZmVyOiB0ZXhCdWZmZXIsXHJcblx0XHRcdGRhcmtCdWZmZXI6IGRhcmtCdWZmZXJcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fSxcclxuXHRcclxuXHRjcmVhdGUzRE9iamVjdDogZnVuY3Rpb24oZ2wsIGJhc2VPYmplY3Qpe1xyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShiYXNlT2JqZWN0LnZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC52ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoYmFzZU9iamVjdC50ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LnRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShiYXNlT2JqZWN0LmluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC5pbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoYmFzZU9iamVjdC5kYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QuZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gYnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0dHJhbnNsYXRlT2JqZWN0OiBmdW5jdGlvbihvYmplY3QsIHRyYW5zbGF0aW9uKXtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49b2JqZWN0LnZlcnRpY2VzLmxlbmd0aDtpPGxlbjtpKz0zKXtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2ldICs9IHRyYW5zbGF0aW9uLmE7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpKzFdICs9IHRyYW5zbGF0aW9uLmI7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpKzJdICs9IHRyYW5zbGF0aW9uLmM7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBvYmplY3Q7XHJcblx0fSxcclxuXHRcclxuXHRmdXplT2JqZWN0czogZnVuY3Rpb24ob2JqZWN0TGlzdCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgaW5kZXhDb3VudCA9IDA7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPW9iamVjdExpc3QubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHZhciBvYmogPSBvYmplY3RMaXN0W2ldO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLnZlcnRpY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHR2ZXJ0aWNlcy5wdXNoKG9iai52ZXJ0aWNlc1tqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai50ZXhDb29yZHMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdHRleENvb3Jkcy5wdXNoKG9iai50ZXhDb29yZHNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmouaW5kaWNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0aW5kaWNlcy5wdXNoKG9iai5pbmRpY2VzW2pdICsgaW5kZXhDb3VudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai5kYXJrVmVydGV4Lmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRkYXJrVmVydGV4LnB1c2gob2JqLmRhcmtWZXJ0ZXhbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpbmRleENvdW50ICs9IG9iai52ZXJ0aWNlcy5sZW5ndGggLyAzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0aWNlcywgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0bG9hZDNETW9kZWw6IGZ1bmN0aW9uKG1vZGVsRmlsZSwgZ2wpe1xyXG5cdFx0dmFyIG1vZGVsID0ge3JlYWR5OiBmYWxzZX07XHJcblx0XHRcclxuXHRcdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdFx0aHR0cC5vcGVuKFwiR0VUXCIsIGNwICsgXCJtb2RlbHMvXCIgKyBtb2RlbEZpbGUgKyBcIi5vYmo/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdFx0aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcblx0XHRcdFx0dmFyIGxpbmVzID0gaHR0cC5yZXNwb25zZVRleHQuc3BsaXQoXCJcXG5cIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHZlcnRpY2VzID0gW10sIHRleENvb3JkcyA9IFtdLCB0cmlhbmdsZXMgPSBbXSwgdmVydGV4SW5kZXggPSBbXSwgdGV4SW5kaWNlcyA9IFtdLCBpbmRpY2VzID0gW10sIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFx0XHR2YXIgd29ya2luZztcclxuXHRcdFx0XHR2YXIgdCA9IGZhbHNlO1xyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49bGluZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHR2YXIgbCA9IGxpbmVzW2ldLnRyaW0oKTtcclxuXHRcdFx0XHRcdGlmIChsID09IFwiXCIpeyBjb250aW51ZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB2ZXJ0aWNlc1wiKXsgd29ya2luZyA9IHZlcnRpY2VzOyB0ID0gZmFsc2U7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdGV4Q29vcmRzXCIpeyB3b3JraW5nID0gdGV4Q29vcmRzOyB0ID0gdHJ1ZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB0cmlhbmdsZXNcIil7IHdvcmtpbmcgPSB0cmlhbmdsZXM7IHQgPSBmYWxzZTsgfVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFyIHBhcmFtcyA9IGwuc3BsaXQoXCIgXCIpO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBqPTAsamxlbj1wYXJhbXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdFx0XHRcdGlmICghaXNOYU4ocGFyYW1zW2pdKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbXNbal0gPSBwYXJzZUZsb2F0KHBhcmFtc1tqXSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdGlmICghdCkgd29ya2luZy5wdXNoKHBhcmFtc1tqXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKHQpIHdvcmtpbmcucHVzaChwYXJhbXMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdXNlZFZlciA9IFtdO1xyXG5cdFx0XHRcdHZhciB1c2VkSW5kID0gW107XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj10cmlhbmdsZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHRpZiAodXNlZFZlci5pbmRleE9mKHRyaWFuZ2xlc1tpXSkgIT0gLTEpe1xyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godXNlZEluZFt1c2VkVmVyLmluZGV4T2YodHJpYW5nbGVzW2ldKV0pO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHVzZWRWZXIucHVzaCh0cmlhbmdsZXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR2YXIgdCA9IHRyaWFuZ2xlc1tpXS5zcGxpdChcIi9cIik7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dFswXSA9IHBhcnNlSW50KHRbMF0pIC0gMTtcclxuXHRcdFx0XHRcdFx0dFsxXSA9IHBhcnNlSW50KHRbMV0pIC0gMTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh2ZXJ0ZXhJbmRleC5sZW5ndGggLyAzKTtcclxuXHRcdFx0XHRcdFx0dXNlZEluZC5wdXNoKHZlcnRleEluZGV4Lmxlbmd0aCAvIDMpO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGV4SW5kZXgucHVzaCh2ZXJ0aWNlc1t0WzBdICogM10sIHZlcnRpY2VzW3RbMF0gKiAzICsgMV0sIHZlcnRpY2VzW3RbMF0gKiAzICsgMl0pO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGV4SW5kaWNlcy5wdXNoKHRleENvb3Jkc1t0WzFdXVswXSwgdGV4Q29vcmRzW3RbMV1dWzFdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj10ZXhJbmRpY2VzLmxlbmd0aC8yO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBiYXNlID0ge3ZlcnRpY2VzOiB2ZXJ0ZXhJbmRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhJbmRpY2VzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHRcdFx0XHR2YXIgbW9kZWwzRCA9IHRoaXMuY3JlYXRlM0RPYmplY3QoZ2wsIGJhc2UpO1xyXG5cclxuXHRcdFx0XHRtb2RlbC5yb3RhdGlvbiA9IG1vZGVsM0Qucm90YXRpb247XHJcblx0XHRcdFx0bW9kZWwucG9zaXRpb24gPSBtb2RlbDNELnBvc2l0aW9uO1xyXG5cdFx0XHRcdG1vZGVsLnZlcnRleEJ1ZmZlciA9IG1vZGVsM0QudmVydGV4QnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLmluZGljZXNCdWZmZXIgPSBtb2RlbDNELmluZGljZXNCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwudGV4QnVmZmVyID0gbW9kZWwzRC50ZXhCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwuZGFya0J1ZmZlciA9IG1vZGVsM0QuZGFya0J1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5yZWFkeSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRodHRwLnNlbmQoKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG1vZGVsO1xyXG5cdH1cclxufTtcclxuIiwidmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxudmFyIGNoZWF0RW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHBvc2l0aW9uLCBkaXJlY3Rpb24sIG1hcE1hbmFnZXIpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignUGxheWVyJyk7IFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnUGxheWVyJywgUGxheWVyKTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBkaXJlY3Rpb24sIG1hcE1hbmFnZXIpe1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5yb3RhdGlvblNwZCA9IHZlYzIoTWF0aC5kZWdUb1JhZCgxKSwgTWF0aC5kZWdUb1JhZCg0KSk7XHJcblx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjU7XHJcblx0dGhpcy5tYXhWZXJ0Um90YXRpb24gPSBNYXRoLmRlZ1RvUmFkKDQ1KTtcclxuXHRcclxuXHR0aGlzLnRhcmdldFkgPSBwb3NpdGlvbi5iO1xyXG5cdHRoaXMueVNwZWVkID0gMC4wO1xyXG5cdHRoaXMueUdyYXZpdHkgPSAwLjA7XHJcblx0XHJcblx0dGhpcy5qb2cgPSB2ZWM0KDAuMCwgMSwgMC4wLCAxKTtcclxuXHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblx0dGhpcy5zdGVwSW5kID0gMTtcclxuXHJcblx0dGhpcy5odXJ0ID0gMC4wO1x0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMDtcclxuXHRcclxuXHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSAwO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5yZWNlaXZlRGFtYWdlID0gZnVuY3Rpb24oZG1nKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHR0aGlzLmh1cnQgPSA1LjA7XHJcblx0dmFyIHBsYXllciA9IGdhbWUucGxheWVyO1xyXG5cdHBsYXllci5ocCAtPSBkbWc7XHJcblx0aWYgKHBsYXllci5ocCA8PSAwKXtcclxuXHRcdHBsYXllci5ocCA9IDA7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBkaWVkIVwiKTtcclxuXHRcdGdhbWUuc2F2ZU1hbmFnZXIuZGVsZXRlR2FtZSgpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2FzdE1pc3NpbGUgPSBmdW5jdGlvbih3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLnN0cik7XHJcblx0aWYgKHdlYXBvbikgc3RyICs9IFV0aWxzLnJvbGxEaWNlKHdlYXBvbi5zdHIpICogd2VhcG9uLnN0YXR1cztcclxuXHRcclxuXHR2YXIgcHJvYiA9IE1hdGgucmFuZG9tKCk7XHJcblx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdG1pc3NpbGUuaW5pdCh0aGlzLnBvc2l0aW9uLmNsb25lKCksIHRoaXMucm90YXRpb24uY2xvbmUoKSwgd2VhcG9uLmNvZGUsICdlbmVteScsIHRoaXMubWFwTWFuYWdlcik7XHJcblx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRtaXNzaWxlLm1pc3NlZCA9IChwcm9iID4gcHMuc3RhdHMuZGV4KTtcclxuXHRpZiAod2VhcG9uKSBcclxuXHRcdHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTsgLy8gVE9ETzogRW5oYW5jZSB3ZWFwb24gZGVncmFkYXRpb25cclxuXHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiWW91IHNob290IGEgXCIgKyB3ZWFwb24uc3ViSXRlbU5hbWUpO1xyXG5cdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAzMDtcclxuXHR0aGlzLm1vdmVkID0gdHJ1ZTtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubWVsZWVBdHRhY2sgPSBmdW5jdGlvbih3ZWFwb24pe1xyXG5cdHZhciBlbmVtaWVzID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlc05lYXJlc3QodGhpcy5wb3NpdGlvbiwgMS4wLCAnZW5lbXknKTtcclxuXHRcdFxyXG5cdHZhciB4eCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHR2YXIgenogPSB0aGlzLnBvc2l0aW9uLmM7XHJcblx0dmFyIGR4ID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuMTtcclxuXHR2YXIgZHogPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIDAuMTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0eHggKz0gZHg7XHJcblx0XHR6eiArPSBkejtcclxuXHRcdHZhciBvYmplY3Q7XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPWVuZW1pZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHR2YXIgaW5zID0gZW5lbWllc1tqXTtcclxuXHRcdFx0dmFyIHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHh4KTtcclxuXHRcdFx0dmFyIHogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHp6KTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh4IDwgMC4zICYmIHogPCAwLjMpe1xyXG5cdFx0XHRcdG9iamVjdCA9IGlucztcclxuXHRcdFx0XHRqID0gamxlbjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAob2JqZWN0ICYmIG9iamVjdC5lbmVteSl7XHJcblx0XHRcdHRoaXMuY2FzdEF0dGFjayhvYmplY3QsIHdlYXBvbik7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCA9IDIwO1xyXG5cdFx0XHR0aGlzLm1vdmVkID0gdHJ1ZTtcclxuXHRcdFx0aSA9IDExO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2FzdEF0dGFjayA9IGZ1bmN0aW9uKHRhcmdldCwgd2VhcG9uKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdHZhciBwcyA9IGdhbWUucGxheWVyO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHRpZiAocHJvYiA+IHBzLnN0YXRzLmRleCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdC8vdmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRhcmdldC5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdHZhciBkZnMgPSAwO1xyXG5cdFxyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCkgPDwgMDtcclxuXHRcclxuXHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQXR0YWNraW5nIFwiICsgdGFyZ2V0LmVuZW15Lm5hbWUpO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRhcmdldC5lbmVteS5uYW1lICsgXCIgZGFtYWdlZCB4XCIrZG1nKTsgLy8gVE9ETzogUmVwbGFjZSB3aXRoIGRhbWFnZSBwb3B1cCBvbiB0aGUgZW5lbXlcclxuXHRcdHRhcmdldC5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHQvLyB0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdibG9jaycpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAod2VhcG9uKSBcclxuXHRcdHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTsgLy8gVE9ETzogRW5oYW5jZSB3ZWFwb24gZGVncmFkYXRpb25cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuam9nTW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIpe1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwNSAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKSB0aGlzLmpvZy5iID0gMTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuam9nLmEgKz0gMC4wMDggKiB0aGlzLmpvZy5iO1xyXG5cdFx0aWYgKHRoaXMuam9nLmEgPj0gMC4wMyAmJiB0aGlzLmpvZy5iID09IDEpIHRoaXMuam9nLmIgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmEgPD0gLTAuMDMgJiYgdGhpcy5qb2cuYiA9PSAtMSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnc3RlcCcgKyB0aGlzLnN0ZXBJbmQpO1xyXG5cdFx0XHRpZiAoKyt0aGlzLnN0ZXBJbmQgPT0gMykgdGhpcy5zdGVwSW5kID0gMTtcclxuXHRcdFx0dGhpcy5qb2cuYiA9IDE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4VG8sIHpUbyl7XHJcblx0dmFyIG1vdmVkID0gZmFsc2U7XHJcblx0XHJcblx0dmFyIHN3aW0gPSAodGhpcy5vbkxhdmEgfHwgdGhpcy5vbldhdGVyKTtcclxuXHRpZiAoc3dpbSl7XHJcblx0XHR4VG8gKj0gMC43NTsgXHJcblx0XHR6VG8gKj0gMC43NTtcclxuXHR9XHJcblx0dmFyIG1vdmVtZW50ID0gdmVjMih4VG8sIHpUbyk7XHJcblx0dmFyIHNwZCA9IHZlYzIoeFRvICogMS41LCAwKTtcclxuXHR2YXIgZmFrZVBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFxyXG5cdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdHZhciBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0V2FsbE5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCBzd2ltKTtcclxuXHRcdGlmICghbm9ybWFsKXsgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQpOyB9IFxyXG5cdFx0XHJcblx0XHRpZiAobm9ybWFsKXtcclxuXHRcdFx0bm9ybWFsID0gbm9ybWFsLmNsb25lKCk7XHJcblx0XHRcdHZhciBkaXN0ID0gbW92ZW1lbnQuZG90KG5vcm1hbCk7XHJcblx0XHRcdG5vcm1hbC5tdWx0aXBseSgtZGlzdCk7XHJcblx0XHRcdG1vdmVtZW50LnN1bShub3JtYWwpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmYWtlUG9zLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdFxyXG5cdFx0c3BkID0gdmVjMigwLCB6VG8gKiAxLjUpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAobW92ZW1lbnQuYSAhPSAwIHx8IG1vdmVtZW50LmIgIT0gMCl7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHRoaXMucG9zaXRpb24uYyArPSBtb3ZlbWVudC5iO1xyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0XHR0aGlzLmpvZ01vdmVtZW50KCk7XHJcblx0XHRtb3ZlZCA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBtb3ZlZDtcclxuXHRyZXR1cm4gbW92ZWQ7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdXNlTG9vayA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1Nb3ZlbWVudCA9IHRoaXMubWFwTWFuYWdlci5nYW1lLmdldE1vdXNlTW92ZW1lbnQoKTtcclxuXHRcclxuXHRpZiAobU1vdmVtZW50LnggIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5iIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LngpOyB9XHJcblx0aWYgKG1Nb3ZlbWVudC55ICE9IC0xMDAwMCl7IHRoaXMucm90YXRpb24uYSAtPSBNYXRoLmRlZ1RvUmFkKG1Nb3ZlbWVudC55KTsgfVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHR0aGlzLm1vdXNlTG9vaygpO1xyXG5cclxuXHQvLyBSb3RhdGlvbiB3aXRoIGtleWJvYXJkXHJcblx0aWYgKGdhbWUua2V5c1s4MV0gPT0gMSB8fCBnYW1lLmtleXNbMzddID09IDEpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5iICs9IHRoaXMucm90YXRpb25TcGQuYjtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzY5XSA9PSAxIHx8IGdhbWUua2V5c1szOV0gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgLT0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbMzhdID09IDEpeyAvLyBVcCBhcnJvd1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5hICs9IHRoaXMucm90YXRpb25TcGQuYTtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzQwXSA9PSAxKXsgLy8gRG93biBhcnJvd1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5hIC09IHRoaXMucm90YXRpb25TcGQuYTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0dmFyIEEgPSAwLjAsIEIgPSAwLjA7XHJcblx0aWYgKGdhbWUua2V5c1s4N10gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbODNdID09IDEpe1xyXG5cdFx0QSA9IC1NYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZCAqIDAuMztcclxuXHRcdEIgPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZCAqIDAuMztcclxuXHR9XHJcblx0XHJcblx0aWYgKGdhbWUua2V5c1s2NV0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiArIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjhdID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9XHJcblx0XHJcblx0aWYgKEEgIT0gMC4wIHx8IEIgIT0gMC4wKXsgdGhpcy5tb3ZlVG8oQSwgQik7IH1lbHNleyB0aGlzLmpvZy5hID0gMC4wOyB9XHJcblx0aWYgKHRoaXMucm90YXRpb24uYSA+IHRoaXMubWF4VmVydFJvdGF0aW9uKSB0aGlzLnJvdGF0aW9uLmEgPSB0aGlzLm1heFZlcnRSb3RhdGlvbjtcclxuXHRlbHNlIGlmICh0aGlzLnJvdGF0aW9uLmEgPCAtdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IC10aGlzLm1heFZlcnRSb3RhdGlvbjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2hlY2tBY3Rpb24gPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgzMikpeyAvLyBTcGFjZVxyXG5cdFx0dmFyIHh4ID0gKHRoaXMucG9zaXRpb24uYSArIE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiAwLjYpIDw8IDA7XHJcblx0XHR2YXIgenogPSAodGhpcy5wb3NpdGlvbi5jIC0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdFxyXG5cdFx0dmFyIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KSk7XHJcblx0XHRpZiAoIW9iamVjdCkgb2JqZWN0ID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlQXRHcmlkKHZlYzModGhpcy5wb3NpdGlvbi5hIDw8IDAsIHRoaXMucG9zaXRpb24uYiwgdGhpcy5wb3NpdGlvbi5jIDw8IDApKTtcclxuXHRcdFxyXG5cdFx0aWYgKG9iamVjdCAmJiBvYmplY3QuYWN0aXZhdGUpXHJcblx0XHRcdG9iamVjdC5hY3RpdmF0ZSgpO1xyXG5cdFx0XHRcclxuXHRcdGlmIChjaGVhdEVuYWJsZWQpe1xyXG5cdFx0XHRpZiAoZ2FtZS5mbG9vckRlcHRoIDwgOClcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKGZhbHNlLCBnYW1lLmZsb29yRGVwdGggKyAxKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoJ2NvZGV4Um9vbScpO1xyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICgoZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSB8fCBnYW1lLmdldEtleVByZXNzZWQoMTMpKSAmJiB0aGlzLmF0dGFja1dhaXQgPT0gMCl7XHQvLyBNZWxlZSBhdHRhY2ssIEVudGVyXHJcblx0XHR2YXIgd2VhcG9uID0gZ2FtZS5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0XHRcclxuXHRcdGlmICghd2VhcG9uIHx8ICF3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID0gNTtcclxuXHRcdH1lbHNlIGlmICh3ZWFwb24gJiYgd2VhcG9uLnJhbmdlZCl7XHJcblx0XHRcdHRoaXMuY2FzdE1pc3NpbGUod2VhcG9uKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHdlYXBvbiAmJiB3ZWFwb24uc3RhdHVzIDwgMC4wNSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmludmVudG9yeS5kZXN0cm95SXRlbSh3ZWFwb24pO1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh3ZWFwb24ubmFtZSArIFwiIGRhbWFnZWQhXCIpO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDc5KSl7IC8vIE8sIFRPRE86IGNoYW5nZSB0byBDdHJsK1NcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiU2F2aW5nIGdhbWUuXCIpO1xyXG5cdFx0Z2FtZS5zYXZlTWFuYWdlci5zYXZlR2FtZSgpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJHYW1lIFNhdmVkLlwiKTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYyk7XHJcblx0dmFyIHd5ID0gKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSk/IDAuMyA6IDA7XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gKHRoaXMucG9zaXRpb24uYiArIHd5KSkgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmlzTGF2YVBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdGlmICghdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5vbkxhdmEgPSB0cnVlO1xyXG5cdFx0XHJcblx0fSBlbHNlIGlmICh0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID09IHRoaXMudGFyZ2V0WSlcclxuXHRcdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDI1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gdHJ1ZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fWVsc2Uge1xyXG5cdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvRmxvYXQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIgJiYgdGhpcy5qb2cuYSA9PSAwLjApe1xyXG5cdFx0dGhpcy5qb2cuYyArPSAwLjAwNSAqIHRoaXMuam9nLmQ7XHJcblx0XHRpZiAodGhpcy5qb2cuYyA+PSAwLjAzICYmIHRoaXMuam9nLmQgPT0gMSkgdGhpcy5qb2cuZCA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYyA8PSAtMC4wMyAmJiB0aGlzLmpvZy5kID09IC0xKSB0aGlzLmpvZy5kID0gMTtcclxuXHRcdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5jID0gMC4wO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuZG9GbG9hdCgpO1xyXG5cdHRoaXMubW92ZW1lbnQoKTtcclxuXHR0aGlzLmNoZWNrQWN0aW9uKCk7XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID49IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1cclxuXHRcclxuXHQvL3RoaXMudGFyZ2V0WSA9IHRoaXMucG9zaXRpb24uYjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5jYW1lcmFIZWlnaHQgPiAwLjIpeyBcclxuXHRcdFx0dGhpcy5jYW1lcmFIZWlnaHQgLT0gMC4wMTsgXHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGlmICh0aGlzLm9uTGF2YSl7XHJcblx0XHRpZiAodGhpcy5sYXZhQ291bnRlciA+IDMwKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyKys7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdH1cclxuXHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCkgdGhpcy5hdHRhY2tXYWl0IC09IDE7XHJcblx0aWYgKHRoaXMuaHVydCA+IDApIHRoaXMuaHVydCAtPSAxO1xyXG5cdGlmICh0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPiAwKXtcclxuXHRcdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlci0tO1xyXG5cdFx0aWYgKHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHdlYXBvbiA9IHRoaXMubWFwTWFuYWdlci5nYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpXHJcblx0XHRcdFx0dGhpcy5tZWxlZUF0dGFjayh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ZXAoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gUGxheWVyU3RhdHMoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ1BsYXllclN0YXRzJyk7XHJcblx0dGhpcy5ocCA9IDA7XHJcblx0dGhpcy5tSFAgPSAwO1xyXG5cdHRoaXMubWFuYSA9IDA7XHJcblx0dGhpcy5tTWFuYSA9IDA7XHJcblx0XHJcblx0dGhpcy5yZWdlbkNvdW50ID0gMDtcclxuXHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAwO1xyXG5cdFxyXG5cdHRoaXMudmlydHVlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmx2bCA9IDE7XHJcblx0dGhpcy5leHAgPSAwO1xyXG5cdFxyXG5cdHRoaXMucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKSxcclxuXHRcdHN0cjogJzBEMCcsIFxyXG5cdFx0ZGZzOiAnMEQwJyxcclxuXHRcdGRleDogMCxcclxuXHRcdG1hZ2ljUG93ZXI6ICcwRDAnXHJcblx0fTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJTdGF0cztcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnUGxheWVyU3RhdHMnLCBQbGF5ZXJTdGF0cyk7XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaHAgPSAwO1xyXG5cdHRoaXMubUhQID0gMDtcclxuXHR0aGlzLm1hbmEgPSAwO1xyXG5cdHRoaXMubU1hbmEgPSAwO1xyXG5cdFxyXG5cdHRoaXMudmlydHVlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmx2bCA9IDE7XHJcblx0dGhpcy5leHAgPSAwO1xyXG5cdFxyXG5cdHRoaXMuc3RhdHMgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpLFxyXG5cdFx0c3RyOiAnMEQwJyxcclxuXHRcdGRmczogJzBEMCcsXHJcblx0XHRkZXg6IDAsXHJcblx0XHRtYWdpY1Bvd2VyOiAnMEQwJ1xyXG5cdH07XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGFtb3VudCwgY29uc29sZSl7XHJcblx0dGhpcy5leHAgKz0gYW1vdW50O1xyXG5cdFxyXG5cdC8vY29uc29sZS5hZGRTRk1lc3NhZ2UoYW1vdW50ICsgXCIgWFAgZ2FpbmVkXCIpO1xyXG5cdHZhciBuZXh0RXhwID0gKE1hdGgucG93KHRoaXMubHZsLCAxLjUpICogNTAwKSA8PCAwO1xyXG5cdGlmICh0aGlzLmV4cCA+PSBuZXh0RXhwKXsgdGhpcy5sZXZlbFVwKGNvbnNvbGUpOyB9XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUubGV2ZWxVcCA9IGZ1bmN0aW9uKGNvbnNvbGUpe1xyXG5cdHRoaXMubHZsICs9IDE7XHJcblx0XHJcblx0Ly8gVXBncmFkZSBIUCBhbmQgTWFuYVxyXG5cdHZhciBocE5ldyA9IE1hdGguaVJhbmRvbSgxMCwgMjUpO1xyXG5cdHZhciBtYW5hTmV3ID0gTWF0aC5pUmFuZG9tKDUsIDE1KTtcclxuXHRcclxuXHR2YXIgaHBPbGQgPSB0aGlzLm1IUDtcclxuXHR2YXIgbWFuYU9sZCA9IHRoaXMubU1hbmE7XHJcblx0XHJcblx0dGhpcy5ocCAgKz0gaHBOZXc7XHJcblx0dGhpcy5tYW5hICs9IG1hbmFOZXc7XHJcblx0dGhpcy5tSFAgKz0gaHBOZXc7XHJcblx0dGhpcy5tTWFuYSArPSBtYW5hTmV3O1xyXG5cdFxyXG5cdC8vIFVwZ3JhZGUgYSByYW5kb20gc3RhdCBieSAxLTMgcG9pbnRzXHJcblx0LypcclxuXHR2YXIgc3RhdHMgPSBbJ3N0cicsICdkZnMnXTtcclxuXHR2YXIgbmFtZXMgPSBbJ1N0cmVuZ3RoJywgJ0RlZmVuc2UnXTtcclxuXHR2YXIgc3QsIG5tO1xyXG5cdHdoaWxlICghc3Qpe1xyXG5cdFx0dmFyIGluZCA9IE1hdGguaVJhbmRvbShzdGF0cy5sZW5ndGgpO1xyXG5cdFx0c3QgPSBzdGF0c1tpbmRdO1xyXG5cdFx0bm0gPSBuYW1lc1tpbmRdO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgcGFydDEgPSBwYXJzZUludCh0aGlzLnN0YXRzW3N0XS5zdWJzdHJpbmcoMCwgdGhpcy5zdGF0c1tzdF0uaW5kZXhPZignRCcpKSwgMTApO1xyXG5cdHBhcnQxICs9IE1hdGguaVJhbmRvbSgxLCAzKTtcclxuXHRcclxuXHR2YXIgb2xkID0gdGhpcy5zdGF0c1tzdF07XHJcblx0dGhpcy5zdGF0c1tzdF0gPSBwYXJ0MSArICdEMyc7Ki9cclxuXHRcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIkxldmVsIHVwOiBcIiArIHRoaXMubHZsICsgXCIhXCIpO1xyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSFAgaW5jcmVhc2VkIGZyb20gXCIgKyBocE9sZCArIFwiIHRvIFwiICsgdGhpcy5tSFApO1xyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTWFuYSBpbmNyZWFzZWQgZnJvbSBcIiArIG1hbmFPbGQgKyBcIiB0byBcIiArIHRoaXMubU1hbmEpO1xyXG5cdC8vY29uc29sZS5hZGRTRk1lc3NhZ2Uobm0gKyBcIiBpbmNyZWFzZWQgZnJvbSBcIiArIG9sZCArIFwiIHRvIFwiICsgdGhpcy5zdGF0c1tzdF0pO1xyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnNldFZpcnR1ZSA9IGZ1bmN0aW9uKHZpcnR1ZU5hbWUpe1xyXG5cdHRoaXMudmlydHVlID0gdmlydHVlTmFtZTtcclxuXHR0aGlzLmx2bCA9IDE7XHJcblx0dGhpcy5leHAgPSAwO1xyXG5cdFxyXG5cdHN3aXRjaCAodmlydHVlTmFtZSl7XHJcblx0XHRjYXNlIFwiSG9uZXN0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNjAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAyMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDY7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjg7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ01hZ2UnO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDU7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkNvbXBhc3Npb25cIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdCYXJkJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA3O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJWYWxvclwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdGaWdodGVyJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiAxMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSG9ub3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdQYWxhZGluJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA4O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJTcGlyaXR1YWxpdHlcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA2O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnUmFuZ2VyJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA5O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJIdW1pbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNjAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdTaGVwaGVyZCc7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogNztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU2FjcmlmaWNlXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA4MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnVGlua2VyJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA3O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJKdXN0aWNlXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDE1MDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ0RydWlkJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA2O1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubUhQID0gdGhpcy5ocDtcclxuXHR0aGlzLnN0YXRzLnN0ciArPSAnRDMnO1xyXG5cdHRoaXMuc3RhdHMuZGZzICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyICs9ICdEMyc7XHJcblx0dGhpcy5tTWFuYSA9IHRoaXMubWFuYTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5yZWdlbk1hbmEgPSBmdW5jdGlvbigpe1xyXG5cdGlmICgrK3RoaXMucmVnZW5Db3VudCA+PSB0aGlzLm1hbmFSZWdlbkZyZXEpe1xyXG5cdFx0dGhpcy5tYW5hID0gTWF0aC5taW4odGhpcy5tYW5hICsgMSwgdGhpcy5tTWFuYSk7XHJcblx0XHR0aGlzLnJlZ2VuQ291bnQgPSAwO1xyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gU2F2ZU1hbmFnZXIoZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZSgpO1xyXG59XHJcblxyXG52YXIgU3RvcmFnZSA9IHJlcXVpcmUoJy4vU3RvcmFnZScpO1xyXG5cclxuU2F2ZU1hbmFnZXIucHJvdG90eXBlID0ge1xyXG5cdHNhdmVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNhdmVPYmplY3QgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5yZWdpc3RlcignU3R5Z2lhbkdhbWUnKSxcclxuXHRcdFx0dmVyc2lvbjogdmVyc2lvbiwgXHJcblx0XHRcdHBsYXllcjogdGhpcy5nYW1lLnBsYXllcixcclxuXHRcdFx0aW52ZW50b3J5OiB0aGlzLmdhbWUuaW52ZW50b3J5LFxyXG5cdFx0XHRtYXBzOiB0aGlzLmdhbWUubWFwcyxcclxuXHRcdFx0Zmxvb3JEZXB0aDogdGhpcy5nYW1lLmZsb29yRGVwdGgsXHJcblx0XHRcdHVuaXF1ZVJlZ2lzdHJ5OiB0aGlzLmdhbWUudW5pcXVlUmVnaXN0cnlcclxuXHRcdH07XHJcblx0XHR2YXIgc2VyaWFsaXplZCA9IGNpcmN1bGFyLnNlcmlhbGl6ZShzYXZlT2JqZWN0KTtcclxuXHRcdFxyXG5cdFx0Lyp2YXIgc2VyaWFsaXplZE9iamVjdCA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XHJcblx0XHRjb25zb2xlLmxvZyhzZXJpYWxpemVkT2JqZWN0KTtcclxuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZTogXCIrc2VyaWFsaXplZC5sZW5ndGgpOyovXHJcblx0XHRcclxuXHRcdHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdzdHlnaWFuR2FtZScsIHNlcmlhbGl6ZWQpO1xyXG5cdH0sXHJcblx0cmVzdG9yZUdhbWU6IGZ1bmN0aW9uKGdhbWUpe1xyXG5cdFx0dmFyIGdhbWVEYXRhID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ3N0eWdpYW5HYW1lJyk7XHJcblx0XHRpZiAoIWdhbWVEYXRhKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRlc2VyaWFsaXplZCA9IGNpcmN1bGFyLnBhcnNlKGdhbWVEYXRhLCBnYW1lKTtcclxuXHRcdGlmIChkZXNlcmlhbGl6ZWQudmVyc2lvbiAhPSB2ZXJzaW9uKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0Z2FtZS5wbGF5ZXIgPSBkZXNlcmlhbGl6ZWQucGxheWVyO1xyXG5cdFx0Z2FtZS5pbnZlbnRvcnkgPSBkZXNlcmlhbGl6ZWQuaW52ZW50b3J5O1xyXG5cdFx0Z2FtZS5tYXBzID0gZGVzZXJpYWxpemVkLm1hcHM7XHJcblx0XHRnYW1lLmZsb29yRGVwdGggPSBkZXNlcmlhbGl6ZWQuZmxvb3JEZXB0aDtcclxuXHRcdGdhbWUudW5pcXVlUmVnaXN0cnkgPSBkZXNlcmlhbGl6ZWQudW5pcXVlUmVnaXN0cnk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cdGRlbGV0ZUdhbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnc3R5Z2lhbkdhbWUnKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2F2ZU1hbmFnZXI7IiwiZnVuY3Rpb24gU2VsZWN0Q2xhc3MoLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RDbGFzcztcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMuZ2FtZTtcclxuXHR2YXIgcGxheWVyUyA9IGdhbWUucGxheWVyO1xyXG5cdGlmIChnYW1lLmdldEtleVByZXNzZWQoMTMpIHx8IGdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkpe1xyXG5cdFx0dmFyIG1vdXNlID0gZ2FtZS5tb3VzZTtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubW91c2UuYiA+PSAyOCAmJiBnYW1lLm1vdXNlLmIgPCAxMDApe1xyXG5cdFx0XHRpZiAoZ2FtZS5tb3VzZS5hIDw9IDg4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSG9uZXN0eVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkNvbXBhc3Npb25cIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAyNjgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJWYWxvclwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSnVzdGljZVwiKTtcclxuXHRcdH1lbHNlIGlmIChnYW1lLm1vdXNlLmIgPj0gMTAwICYmIGdhbWUubW91c2UuYiA8IDE3MCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJTYWNyaWZpY2VcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAxNzgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25vclwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNwaXJpdHVhbGl0eVwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSHVtaWxpdHlcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChwbGF5ZXJTLnZpcnR1ZSAhPSBudWxsKXtcclxuXHRcdFx0Z2FtZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5KHBsYXllclMuY2xhc3NOYW1lKTtcclxuXHRcdFx0Z2FtZS5wcmludEdyZWV0KCk7XHJcblx0XHRcdGdhbWUubG9hZE1hcChmYWxzZSwgMSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHZhciB1aSA9IHRoaXMuZ2FtZS5nZXRVSSgpO1xyXG5cdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLnNlbGVjdENsYXNzLCAwLCAwKTtcclxufTtcclxuIiwidmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnU3RhaXJzJywgJ2JpbGxib2FyZCcpO1xyXG5cclxuY2lyY3VsYXIuc2V0UmV2aXZlcignU3RhaXJzJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIGdhbWUuR0wuY3R4KTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzW29iamVjdC5pbWdJbmRdO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQubm9Sb3RhdGUgPSB0cnVlO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIFN0YWlycygpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcihcIlN0YWlyc1wiKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGFpcnM7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1N0YWlycycsIFN0YWlycyk7XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocG9zaXRpb24sIG1hcE1hbmFnZXIsIGRpcmVjdGlvbil7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5zdGFpcnMgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLnRhcmdldElkID0gdGhpcy5tYXBNYW5hZ2VyLmRlcHRoO1xyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ2Rvd24nKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgKz0gMTtcclxuXHRcdHRoaXMuaW1nSW5kID0gMTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSBudWxsO1xyXG59XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50YXJnZXRJZCA8IDkpXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKGZhbHNlLCB0aGlzLnRhcmdldElkKTtcclxuXHRlbHNlIHtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoJ2NvZGV4Um9vbScpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuZ2V0VGlsZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMudGlsZSAhPSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy50aWxlID0gdGhpcy5tYXBNYW5hZ2VyLm1hcFt0aGlzLnBvc2l0aW9uLmMgPDwgMF1bdGhpcy5wb3NpdGlvbi5hIDw8IDBdO1xyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnICYmIHRoaXMudGlsZS5jaCA+IDEpe1xyXG5cdFx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgPDwgMDtcclxuXHRcdGZvciAodmFyIGk9eSsxO2k8dGhpcy50aWxlLmNoO2krKyl7XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcdHBvcy5iID0gaTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1syXTtcclxuXHRcdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHBvcywnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1szXTtcclxuXHRcdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHR9ZWxzZXtcclxuXHRcdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHR9XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuZ2V0VGlsZSgpO1xyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBTdG9yYWdlKCl7XHJcblx0IHRyeSB7XHJcblx0XHQgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ19fdGVzdCcsICd0ZXN0Jyk7XHJcblx0XHQgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19fdGVzdCcpO1xyXG5cdFx0IHRoaXMuZW5hYmxlZCA9IHRydWU7XHJcblx0IH0gY2F0Y2goZSkge1xyXG5cdFx0IHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xyXG5cdCB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XHJcblxyXG5TdG9yYWdlLnByb3RvdHlwZSA9IHtcclxuXHRzZXRJdGVtOiBmdW5jdGlvbihrZXksIHZhbHVlKXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XHJcblx0fSxcclxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbihrZXkpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG5cdH0sXHJcblx0Z2V0SXRlbTogZnVuY3Rpb24oa2V5KXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuXHR9XHJcbn1cclxuIFxyXG4iLCJ2YXIgU2VsZWN0Q2xhc3MgPSByZXF1aXJlKCcuL1NlbGVjdENsYXNzJyk7XHJcblxyXG5mdW5jdGlvbiBUaXRsZVNjcmVlbigvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMuYmxpbmsgPSAzMDtcclxuXHR0aGlzLmN1cnJlbnRTY3JlZW4gPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlU2NyZWVuO1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMCl7XHJcblx0XHRcdGlmICh0aGlzLmdhbWUuc2F2ZU1hbmFnZXIucmVzdG9yZUdhbWUodGhpcy5nYW1lKSl7XHJcblx0XHRcdFx0dGhpcy5nYW1lLnByaW50V2VsY29tZUJhY2soKTtcclxuXHRcdFx0XHR0aGlzLmdhbWUubG9hZE1hcCh0aGlzLmdhbWUucGxheWVyLmN1cnJlbnRNYXAsIHRoaXMuZ2FtZS5wbGF5ZXIuY3VycmVudERlcHRoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRTY3JlZW4rKztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gNCl7XHJcblx0XHRcdHRoaXMuZ2FtZS5zY2VuZSA9IG5ldyBTZWxlY3RDbGFzcyh0aGlzLmdhbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdHZhciB1aSA9IHRoaXMuZ2FtZS5nZXRVSSgpO1xyXG5cdHN3aXRjaCAodGhpcy5jdXJyZW50U2NyZWVuKXtcclxuXHRjYXNlIDA6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy50aXRsZVNjcmVlbiwgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDE6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzEsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAyOlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuaW50cm8yLCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgMzpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmludHJvMywgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDQ6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzQsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJmdW5jdGlvbiBVSShzaXplLCBjb250YWluZXIpe1xyXG5cdHRoaXMuaW5pdENhbnZhcyhzaXplLCBjb250YWluZXIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJO1xyXG5cclxuVUkucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNpemUuYTtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHRjYW52YXMuc3R5bGUudG9wID0gMDtcclxuXHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0dGhpcy5jdHgud2lkdGggPSBjYW52YXMud2lkdGg7XHJcblx0dGhpcy5jdHguaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHRcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cdFxyXG5cdHRoaXMuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgPSBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdTcHJpdGUgPSBmdW5jdGlvbihzcHJpdGUsIHgsIHksIHN1YkltYWdlKXtcclxuXHR2YXIgeEltZyA9IHN1YkltYWdlICUgc3ByaXRlLmltZ051bTtcclxuXHR2YXIgeUltZyA9IChzdWJJbWFnZSAvIHNwcml0ZS5pbWdOdW0pIDw8IDA7XHJcblx0XHJcblx0dGhpcy5jdHguZHJhd0ltYWdlKHNwcml0ZSxcclxuXHRcdHhJbWcgKiBzcHJpdGUuaW1nV2lkdGgsIHlJbWcgKiBzcHJpdGUuaW1nSGVpZ2h0LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHQsXHJcblx0XHR4LCB5LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHRcclxuXHRcdCk7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZUV4dCA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2UsIGltYWdlQW5nbGUpe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5zYXZlKCk7XHJcblx0dGhpcy5jdHgudHJhbnNsYXRlKHgrc3ByaXRlLnhPcmlnLCB5K3Nwcml0ZS55T3JpZyk7XHJcblx0dGhpcy5jdHgucm90YXRlKGltYWdlQW5nbGUpO1xyXG5cdFxyXG5cdHRoaXMuY3R4LmRyYXdJbWFnZShzcHJpdGUsXHJcblx0XHR4SW1nICogc3ByaXRlLmltZ1dpZHRoLCB5SW1nICogc3ByaXRlLmltZ0hlaWdodCwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0LFxyXG5cdFx0LXNwcml0ZS54T3JpZywgLXNwcml0ZS55T3JpZywgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0dGhpcy5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24odGV4dCwgeCwgeSwgY29uc29sZSl7XHJcblx0Y29uc29sZS5wcmludFRleHQoeCx5LCB0ZXh0LCB0aGlzLmN0eCk7XHJcblx0Lyp2YXIgdyA9IGNvbnNvbGUuc3BhY2VDaGFycztcclxuXHR2YXIgaCA9IGNvbnNvbGUuc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49dGV4dC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHR2YXIgY2hhcmEgPSB0ZXh0LmNoYXJBdChqKTtcclxuXHRcdHZhciBpbmQgPSBjb25zb2xlLmxpc3RPZkNoYXJzLmluZGV4T2YoY2hhcmEpO1xyXG5cdFx0aWYgKGluZCAhPSAtMSl7XHJcblx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZShjb25zb2xlLnNwcml0ZUZvbnQsXHJcblx0XHRcdFx0dyAqIGluZCwgMSwgdywgaCAtIDEsXHJcblx0XHRcdFx0eCwgeSwgdywgaCAtIDEpO1xyXG5cdFx0fVxyXG5cdFx0eCArPSB3O1xyXG5cdH0qL1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbn07IiwidmFyIEFuaW1hdGVkVGV4dHVyZSA9IHJlcXVpcmUoJy4vQW5pbWF0ZWRUZXh0dXJlJyk7XHJcbnZhciBBdWRpb0FQSSA9IHJlcXVpcmUoJy4vQXVkaW8nKTtcclxudmFyIENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcclxudmFyIEludmVudG9yeSA9IHJlcXVpcmUoJy4vSW52ZW50b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE1hcE1hbmFnZXIgPSByZXF1aXJlKCcuL01hcE1hbmFnZXInKTtcclxudmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllclN0YXRzID0gcmVxdWlyZSgnLi9QbGF5ZXJTdGF0cycpO1xyXG52YXIgU2F2ZU1hbmFnZXIgPSByZXF1aXJlKCcuL1NhdmVNYW5hZ2VyJyk7XHJcbnZhciBUaXRsZVNjcmVlbiA9IHJlcXVpcmUoJy4vVGl0bGVTY3JlZW4nKTtcclxudmFyIEVuZGluZ1NjcmVlbiA9IHJlcXVpcmUoJy4vRW5kaW5nU2NyZWVuJyk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vVUknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG52YXIgV2ViR0wgPSByZXF1aXJlKCcuL1dlYkdMJyk7XHJcblxyXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblx0XHRcdFx0IFx0XHRcdFN0eWdpYW4gQWJ5c3NcclxuXHRcdFx0XHRcclxuICBCeSBDYW1pbG8gUmFtw61yZXogKGh0dHA6Ly9qdWNhcmF2ZS5jb20pIGFuZCBTbGFzaCAoaHR0cDovL3NsYXNoaWUubmV0KVxyXG5cdFx0XHRcclxuXHRcdFx0XHRcdCAgXHRcdFx0MjAxNVxyXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuZnVuY3Rpb24gVW5kZXJ3b3JsZCgpe1xyXG5cdHRoaXMuc2l6ZSA9IHZlYzIoMzU1LCAyMDApO1xyXG5cdFxyXG5cdHRoaXMuR0wgPSBuZXcgV2ViR0wodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuVUkgPSBuZXcgVUkodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuYXVkaW8gPSBuZXcgQXVkaW9BUEkoKTtcclxuXHRcclxuXHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXJTdGF0cygpO1xyXG5cdHRoaXMuaW52ZW50b3J5ID0gbmV3IEludmVudG9yeSgxMCk7XHJcblx0dGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUoMTAsIDEwLCAzMDAsIHRoaXMpO1xyXG5cdHRoaXMuc2F2ZU1hbmFnZXIgPSBuZXcgU2F2ZU1hbmFnZXIodGhpcyk7XHJcblx0dGhpcy5mb250ID0gJzEwcHggXCJDb3VyaWVyXCInO1xyXG5cdFxyXG5cdHRoaXMuZ3JQYWNrID0gJ2ltZ19oci8nO1xyXG5cdFxyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLmtleXMgPSBbXTtcclxuXHR0aGlzLnVuaXF1ZVJlZ2lzdHJ5ID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKVxyXG5cdH07XHJcblx0dGhpcy5tb3VzZSA9IHZlYzMoMC4wLCAwLjAsIDApO1xyXG5cdHRoaXMubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0dGhpcy5pbWFnZXMgPSB7fTtcclxuXHR0aGlzLm11c2ljID0ge307XHJcblx0dGhpcy5zb3VuZHMgPSB7fTtcclxuXHR0aGlzLnRleHR1cmVzID0ge3dhbGw6IFtdLCBmbG9vcjogW10sIGNlaWw6IFtdfTtcclxuXHR0aGlzLm9iamVjdFRleCA9IHt9O1xyXG5cdHRoaXMubW9kZWxzID0ge307XHJcblx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdHRoaXMucGF1c2VkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy50aW1lU3RvcCA9IDA7XHJcblx0dGhpcy5wcm90ZWN0aW9uID0gMDtcclxuXHRcclxuXHR0aGlzLmZwcyA9ICgxMDAwIC8gMzApIDw8IDA7XHJcblx0dGhpcy5sYXN0VCA9IDA7XHJcblx0dGhpcy5udW1iZXJGcmFtZXMgPSAwO1xyXG5cdHRoaXMuZmlyc3RGcmFtZSA9IERhdGUubm93KCk7XHJcblx0XHJcblx0dGhpcy5sb2FkSW1hZ2VzKCk7XHJcblx0dGhpcy5sb2FkTXVzaWMoKTtcclxuXHR0aGlzLmxvYWRUZXh0dXJlcygpO1xyXG5cdFxyXG5cdHRoaXMuY3JlYXRlM0RPYmplY3RzKCk7XHJcblx0QW5pbWF0ZWRUZXh0dXJlLmluaXQodGhpcy5HTC5jdHgpO1xyXG59XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGUzRE9iamVjdHMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuZG9vciA9IE9iamVjdEZhY3RvcnkuZG9vcih2ZWMzKDAuNSwwLjc1LDAuMSksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4LCBmYWxzZSk7XHJcblx0dGhpcy5kb29yVyA9IE9iamVjdEZhY3RvcnkuZG9vcldhbGwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHR0aGlzLmRvb3JDID0gT2JqZWN0RmFjdG9yeS5jdWJlKHZlYzMoMS4wLDEuMCwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgdHJ1ZSk7XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMC4wKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdHRoaXMuc2xvcGUgPSBPYmplY3RGYWN0b3J5LnNsb3BlKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnNvdW5kcy5zdGVwMSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvc3RlcDEud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMuc3RlcDIgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwid2F2L3N0ZXAyLndhdj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuc291bmRzLmhpdCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvaGl0Lndhdj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuc291bmRzLm1pc3MgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwid2F2L21pc3Mud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMuYmxvY2sgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwid2F2L2Jsb2NrLndhdj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjEgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA4Xy1fVWx0aW1hXzRfLV9DNjRfLV9EdW5nZW9ucy5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE11c2ljUG9zdCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMiA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDJfLV9VbHRpbWFfNV8tX0M2NF8tX0JyaXRhbm5pY19MYW5kcy5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjMgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA1Xy1fVWx0aW1hXzNfLV9DNjRfLV9Db21iYXQub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb240ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wN18tX1VsdGltYV8zXy1fQzY0Xy1fRXhvZHVzJ19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb241ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wNF8tX1VsdGltYV81Xy1fQzY0Xy1fRW5nYWdlbWVudF9hbmRfTWVsZWUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb242ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wM18tX1VsdGltYV80Xy1fQzY0Xy1fTG9yZF9Ccml0aXNoJ3NfQ2FzdGxlLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTFfLV9VbHRpbWFfNV8tX0M2NF8tX1dvcmxkc19CZWxvdy5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjggPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzEwXy1fVWx0aW1hXzVfLV9DNjRfLV9IYWxsc19vZl9Eb29tLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5jb2RleFJvb20gPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzRfLV9DNjRfLV9TaHJpbmVzLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkSW1hZ2VzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmltYWdlcy5pdGVtc191aSA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcIml0ZW1zVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogOCwgaW1nVk51bTogOH0pO1xyXG5cdHRoaXMuaW1hZ2VzLnNwZWxsc191aSA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNwZWxsc1VJLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDQsIGltZ1ZOdW06IDR9KTtcclxuXHR0aGlzLmltYWdlcy50aXRsZVNjcmVlbiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRpdGxlU2NyZWVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzLmludHJvMSA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludHJvMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnRybzIgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnRybzIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW50cm8zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm8zLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludHJvNCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludHJvNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHRcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmRpbmcucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuZW5kaW5nU2NyZWVuMiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZGluZzIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuZW5kaW5nU2NyZWVuMyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZGluZzMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2VsZWN0Q2xhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzZWxlY3RDbGFzcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogMSwgaW1nVk51bTogMn0pO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeURyb3AgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlEcm9wLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlTZWxlY3RlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeV9zZWxlY3RlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5zY3JvbGxGb250ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2Nyb2xsRm9udFdoaXRlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnJlc3RhcnQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyZXN0YXJ0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnBhdXNlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInBhdXNlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ2aWV3cG9ydFdlYXBvbnMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLmNvbXBhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjb21wYXNzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge3hPcmlnOiAxMSwgeU9yaWc6IDExLCBpbWdOdW06IDIsIGltZ1ZOdW06IDF9KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRUZXh0dXJlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbbnVsbF0sIGZsb29yOiBbbnVsbF0sIGNlaWw6IFtudWxsXSwgd2F0ZXI6IFtudWxsXX07XHJcblx0XHJcblx0Ly8gTm8gVGV4dHVyZVxyXG5cdHZhciBub1RleCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcIm5vVGV4dHVyZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKG5vVGV4KTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKG5vVGV4KTtcclxuXHRcclxuXHQvLyBXYWxsc1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYWxsMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDYucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTEsIHRydWUpKTtcclxuXHRcclxuXHQvLyBGbG9vcnNcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3I0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yWzUwXSA9ICh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhIb2xlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNTAsIHRydWUpKTtcclxuXHRcclxuXHQvLyBMaXF1aWRzXHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhdGVyMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhdGVyMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleExhdmEwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TGF2YTAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIENlaWxpbmdzXHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Q2VpbDAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbFs1MF0gPSAodGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SG9sZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUwLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gSXRlbXNcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEl0ZW1zLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg4LCA4LCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXNNaXNjID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TWlzYy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtc01pc2MuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDgsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhTcGVsbHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3BlbGxzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCA0LCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gTWFnaWMgQm9sdHNcclxuXHR0aGlzLm9iamVjdFRleC5ib2x0cyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEJvbHRzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gU3RhaXJzXHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4U3RhaXJzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoMiwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIEVuZW1pZXNcclxuXHR0aGlzLm9iamVjdFRleC5iYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmF0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwaWRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNwaWRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC50cm9sbF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFRyb2xsUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdhemVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2F6ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2hvc3RfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHaG9zdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5oZWFkbGVzc19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEhlYWRsZXNzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9yY19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE9yY1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5yZWFwZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSZWFwZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2tlbGV0b25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTa2VsZXRvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0XHJcblx0dGhpcy5vYmplY3RUZXguZGFlbW9uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RGFlbW9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5tb25nYmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TW9uZ2JhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguaHlkcmFfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhIeWRyYVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2VhU2VycGVudF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNlYVNlcnBlbnRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9jdG9wdXNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPY3RvcHVzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5iYWxyb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYWxyb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LmxpY2hlX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGljaGVSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdyZW1saW5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHcmVtbGluUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5kcmFnb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhEcmFnb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4Lnpvcm5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhab3JuUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC53aXNwX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4V2lzcFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXgubWFnZV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE1hZ2VSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhbmdlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhbmdlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcblx0dGhpcy5vYmplY3RUZXguZmlnaHRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEZpZ2h0ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSwge2NsYW1wV3JhcDogdHJ1ZX0pO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhcmRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXJkUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUsIHtjbGFtcFdyYXA6IHRydWV9KTtcclxuXHR0aGlzLm9iamVjdFRleC5sYXZhTGl6YXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGF2YUxpemFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlLCB7Y2xhbXBXcmFwOiB0cnVlfSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wb3N0TG9hZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLmNyZWF0ZVNwcml0ZUZvbnQodGhpcy5pbWFnZXMuc2Nyb2xsRm9udCwgXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSE/LC4vXCIsIDcpO1xyXG5cdHRoaXMubG9hZE11c2ljUG9zdCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuc3RvcE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmF1ZGlvLnN0b3BNdXNpYygpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheU11c2ljID0gZnVuY3Rpb24obXVzaWNDb2RlLCBsb29wKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5tdXNpY1ttdXNpY0NvZGVdO1xyXG5cdGlmICghYXVkaW9GKSByZXR1cm4gbnVsbDtcclxuXHR0aGlzLnN0b3BNdXNpYygpO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgbG9vcCwgdHJ1ZSwgMC4yKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kQ29kZSl7XHJcblx0dmFyIGF1ZGlvRiA9IHRoaXMuc291bmRzW3NvdW5kQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgZmFsc2UsIGZhbHNlLCAwLjMpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VUkgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLlVJLmN0eDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldFRleHR1cmVCeUlkID0gZnVuY3Rpb24odGV4dHVyZUlkLCB0eXBlKXtcclxuXHRpZiAoIXRoaXMudGV4dHVyZXNbdHlwZV1bdGV4dHVyZUlkXSkgdGV4dHVyZUlkID0gMTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0T2JqZWN0VGV4dHVyZSA9IGZ1bmN0aW9uKHRleHR1cmVDb2RlKXtcclxuXHRpZiAoIXRoaXMub2JqZWN0VGV4W3RleHR1cmVDb2RlXSkgdGhyb3cgXCJJbnZhbGlkIHRleHR1cmUgY29kZTogXCIgKyB0ZXh0dXJlQ29kZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcCwgZGVwdGgpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRpZiAoZGVwdGggPT09IHVuZGVmaW5lZCB8fCAhZ2FtZS5tYXBzW2RlcHRoIC0gMV0pe1xyXG5cdFx0Z2FtZS5tYXAgPSBuZXcgTWFwTWFuYWdlcigpO1xyXG5cdFx0Z2FtZS5tYXAuaW5pdChnYW1lLCBtYXAsIGRlcHRoKTtcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlcHRoO1xyXG5cdFx0Z2FtZS5tYXBzLnB1c2goZ2FtZS5tYXApO1xyXG5cdH1lbHNlIGlmIChnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IGdhbWUubWFwc1tkZXB0aCAtIDFdO1xyXG5cdH1cclxuXHRnYW1lLnNjZW5lID0gbnVsbDtcclxuXHRpZiAoZGVwdGgpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnZHVuZ2VvbicrZGVwdGgsIHRydWUpO1xyXG5cdGVsc2UgaWYgKG1hcCA9PT0gJ2NvZGV4Um9vbScpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnY29kZXhSb29tJywgdHJ1ZSk7XHJcblx0Z2FtZS5wbGF5ZXIuY3VycmVudE1hcCA9IG1hcDtcclxuXHRnYW1lLnBsYXllci5jdXJyZW50RGVwdGggPSBkZXB0aDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnByaW50R3JlZXQgPSBmdW5jdGlvbigpe1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRXZWxjb21lQmFjayA9IGZ1bmN0aW9uKCl7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5uZXdHYW1lID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmludmVudG9yeS5yZXNldCgpO1xyXG5cdHRoaXMucGxheWVyLnJlc2V0KCk7XHJcblx0XHJcblx0dGhpcy5tYXBzID0gW107XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMuY29uc29sZS5tZXNzYWdlcyA9IFtdO1x0XHJcblx0dGhpcy5zY2VuZSA9IG5ldyBUaXRsZVNjcmVlbih0aGlzKTtcclxuXHR0aGlzLmxvb3AoKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmVuZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbnZlbnRvcnkucmVzZXQoKTtcclxuXHR0aGlzLnBsYXllci5yZXNldCgpO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHR0aGlzLmNvbnNvbGUubWVzc2FnZXMgPSBbXTtcdFxyXG5cdHRoaXMuc2NlbmUgPSBuZXcgRW5kaW5nU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEdhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHRpZiAoZ2FtZS5HTC5hcmVJbWFnZXNSZWFkeSgpICYmIGdhbWUuYXVkaW8uYXJlU291bmRzUmVhZHkoKSl7XHJcblx0XHRnYW1lLnBvc3RMb2FkaW5nKCk7XHJcblx0XHRnYW1lLm5ld0dhbWUoKTtcclxuXHR9ZWxzZXtcclxuXHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb2FkR2FtZSgpOyB9KTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0cmV0dXJuIHRoaXMuaW52ZW50b3J5LmFkZEl0ZW0oaXRlbSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCB0ZXh0dXJlKXtcclxuXHR2YXIgY2FtZXJhID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHRoaXMuR0wuZHJhd09iamVjdChvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmxvY2sgPSBmdW5jdGlvbihibG9ja09iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KGJsb2NrT2JqZWN0LCBjYW1lcmEsIHRoaXMuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yV2FsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHRleElkLCB2ZXJ0aWNhbCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yVy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0aWYgKHZlcnRpY2FsKSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLE1hdGguUElfMiwwKTsgZWxzZSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLDAsMCk7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vclcsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JDdWJlID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JDLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yQywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vciA9IGZ1bmN0aW9uKHgsIHksIHosIHJvdGF0aW9uLCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRnYW1lLmRvb3Iucm90YXRpb24uYiA9IHJvdGF0aW9uO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3IsIGNhbWVyYSwgZ2FtZS5vYmplY3RUZXhbdGV4SWRdLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Zsb29yID0gZnVuY3Rpb24oZmxvb3JPYmplY3QsIHRleElkLCB0eXBlT2Ype1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHZhciBmdCA9IHR5cGVPZjtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZmxvb3JPYmplY3QsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgZnQpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0JpbGxib2FyZCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB0ZXhJZCwgYmlsbGJvYXJkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRpZiAoIWJpbGxib2FyZCkgYmlsbGJvYXJkID0gZ2FtZS5iaWxsYm9hcmQ7XHJcblx0XHJcblx0YmlsbGJvYXJkLnBvc2l0aW9uLnNldChwb3NpdGlvbik7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGJpbGxib2FyZCwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3U2xvcGUgPSBmdW5jdGlvbihzbG9wZU9iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuR0wuZHJhd09iamVjdChzbG9wZU9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcImZsb29yXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd1VJID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIHBsYXllciA9IGdhbWUubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRpZiAoIXBsYXllcikgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBjdHggPSBnYW1lLlVJLmN0eDtcclxuXHRcclxuXHQvLyBEcmF3IGhlYWx0aCBiYXJcclxuXHR2YXIgaHAgPSBwcy5ocCAvIHBzLm1IUDtcclxuXHRjdHguZmlsbFN0eWxlID0gKHBzLnBvaXNvbmVkKT8gXCJyZ2IoMTIyLDAsMTIyKVwiIDogXCJyZ2IoMTIyLDAsMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCw4LDc1LDQpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigyMDAsMCwyMDApXCIgOiBcInJnYigyMDAsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsKDc1ICogaHApIDw8IDAsNCk7XHJcblx0XHJcblx0Ly8gRHJhdyBtYW5hXHJcblx0dmFyIG1hbmEgPSBwcy5tYW5hIC8gcHMubU1hbmE7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKDE4MSw5OCwyMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiw2MCwyKTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LDEzOCwyOClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiwoNjAgKiBtYW5hKSA8PCAwLDIpO1xyXG5cdFxyXG5cdC8vIERyYXcgSW52ZW50b3J5XHJcblx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pXHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCwgOTAsIDYsIDApO1xyXG5cdGVsc2VcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAwKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW52ZW50b3J5Lml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdHZhciBzcHIgPSBpdGVtLnRleCArICdfdWknO1xyXG5cclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSAmJiAoaXRlbS50eXBlID09ICd3ZWFwb24nIHx8IGl0ZW0udHlwZSA9PSAnYXJtb3VyJykgJiYgaXRlbS5lcXVpcHBlZClcclxuXHRcdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkLCA5MCArICgyMiAqIGkpLCA2LCAwKTtcdFx0XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXNbc3ByXSwgOTMgKyAoMjIgKiBpKSwgOSwgaXRlbS5zdWJJbWcpO1xyXG5cdH1cclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5LCA5MCwgNiwgMSk7XHJcblx0XHJcblx0Ly8gSWYgdGhlIHBsYXllciBpcyBodXJ0IGRyYXcgYSByZWQgc2NyZWVuXHJcblx0aWYgKHBsYXllci5odXJ0ID4gMC4wKXtcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjUpXCI7XHJcblx0XHRjdHguZmlsbFJlY3QoMCwwLGN0eC53aWR0aCxjdHguaGVpZ2h0KTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wcm90ZWN0aW9uID4gMC4wKXtcdC8vIElmIHRoZSBwbGF5ZXIgaGFzIHByb3RlY3Rpb24gdGhlbiBkcmF3IGl0IHNsaWdodGx5IGJsdWVcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoNDAsNDAsMjU1LDAuMilcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucmVzdGFydCwgODUsIDk0LCAwKTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wYXVzZWQpe1xyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnBhdXNlZCwgMTQ3LCA5NCwgMCk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0RlcHRoICcrdGhpcy5mbG9vckRlcHRoLCAxMCwyNSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0xldmVsICcgKyBwcy5sdmwrJyAnK3RoaXMucGxheWVyLmNsYXNzTmFtZSwgMTAsMzMsdGhpcy5jb25zb2xlKTtcclxuXHR0aGlzLlVJLmRyYXdUZXh0KCdIUDogJytwcy5ocCwgMTAsOSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ01hbmE6Jytwcy5tYW5hLCAxMCwxNyx0aGlzLmNvbnNvbGUpO1xyXG5cclxuXHQvLyBEcmF3IHRoZSBjb21wYXNzXHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDApO1xyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZUV4dCh0aGlzLmltYWdlcy5jb21wYXNzLCAzMjAsIDEyLCAxLCBNYXRoLlBJICsgdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uLmIpO1xyXG5cclxuXHR2YXIgd2VhcG9uID0gdGhpcy5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0aWYgKHdlYXBvbiAmJiB3ZWFwb24udmlld1BvcnRJbWcgPj0gMClcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMsIDE2MCwgMTMwICsgdGhpcy5tYXAucGxheWVyLmxhdW5jaEF0dGFja0NvdW50ZXIgKiAyIC0gdGhpcy5tYXAucGxheWVyLmF0dGFja1dhaXQgKiAxLjUsIHdlYXBvbi52aWV3UG9ydEltZyk7XHJcblx0Z2FtZS5jb25zb2xlLnJlbmRlcig4LCAxMjApO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGV4cFBvaW50cyl7XHJcblx0dGhpcy5wbGF5ZXIuYWRkRXhwZXJpZW5jZShleHBQb2ludHMsIHRoaXMuY29uc29sZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5ID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcyA9IFtdO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljU3dvcmQnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWMnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ01hZ2UnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAnRHJ1aWQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdQYWxhZGluJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbGlnaHQnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0JhcmQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0Y2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGRlZmF1bHQ6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgncmVkUG90aW9uJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdEcnVpZCc6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2Jvd01hZ2ljJywgMC42KSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnc2xpbmdFdHRpbicsIDAuNykpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS51c2VJdGVtID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFjdGl2ZVNwZWxsID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdFxyXG5cdGlmIChwcy5tYW5hIDwgaXRlbS5tYW5hKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3QgZW5vdWdoIG1hbmFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHBzLm1hbmEgPSBNYXRoLm1heChwcy5tYW5hIC0gaXRlbS5tYW5hLCAwKTtcclxuXHRcclxuXHRzd2l0Y2ggKGl0ZW0uY29kZSl7XHJcblx0XHRjYXNlICdjdXJlJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1ghXCIpO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJZb3UgYXJlIGN1cmVkLlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWC4uLlwiKTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncmVkUG90aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2FybGljIHBvdGlvbiBjdXJlcyB5b3UuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaGVhbCc6XHJcblx0XHRcdHZhciBoZWFsID0gKHRoaXMucGxheWVyLm1IUCAqIGl0ZW0ucGVyY2VudCkgPDwgMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNQU5JISBcIitoZWFsICsgXCIgcG9pbnRzIGhlYWxlZFwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd5ZWxsb3dQb3Rpb24nOlxyXG5cdFx0XHR2YXIgaGVhbCA9IDEwMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2luc2VuZyBwb3Rpb24gaGVhbHMgeW91IGZvciBcIitoZWFsICsgXCIgcG9pbnRzLlwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdsaWdodCc6XHJcblx0XHRcdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5HTC5saWdodCA9IGl0ZW0ubGlnaHRUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBMT1IhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnbWlzc2lsZSc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRcdFx0bWlzc2lsZS5pbml0KHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnbWFnaWNNaXNzaWxlJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIkdSQVYgUE9SIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdpY2ViYWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdpY2VCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGUklPIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZXBlbCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnYmxpbmsnOlxyXG5cdFx0XHR2YXIgbGFzdFBvcyA9IG51bGw7XHJcblx0XHRcdHZhciBwb3J0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMubWFwLnBsYXllci5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlyID0gdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyLmIpO1xyXG5cdFx0XHR2YXIgZHogPSAtTWF0aC5zaW4oZGlyLmIpO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8MTU7aSsrKXtcclxuXHRcdFx0XHRwb3MuYSArPSBkeDtcclxuXHRcdFx0XHRwb3MuYyArPSBkejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY3ggPSBwb3MuYSA8PCAwO1xyXG5cdFx0XHRcdHZhciBjeSA9IHBvcy5jIDw8IDA7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFwLmlzU29saWQoY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcG9ydGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aSA9IDE1O1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1hcC5pc1dhdGVyUG9zaXRpb24oY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRcdHZhciBpbnMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWlucyl7XHJcblx0XHRcdFx0XHRcdFx0bGFzdFBvcyA9IHZlYzMoY3gsIHBvcy5iLCBjeSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghcG9ydGVkKXtcclxuXHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnZmlyZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0XHRcdG1pc3NpbGUuaW5pdChwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2ZpcmVCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGTEFNIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdwcm90ZWN0aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMucHJvdGVjdGlvbiA9IGl0ZW0ucHJvdFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFNBTkNUIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3RpbWUnOlxyXG5cdFx0XHRpZiAodGhpcy50aW1lU3RvcCA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMudGltZVN0b3AgPSBpdGVtLnN0b3BUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJSRUwgVFlNIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3NsZWVwJzpcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFpVIVwiKTtcclxuXHRcdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwLmdldEluc3RhbmNlc05lYXJlc3QocC5wb3NpdGlvbiwgNiwgJ2VuZW15Jyk7XHJcblx0XHRcdGZvciAodmFyIGk9MCxsZW49aW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdGluc3RhbmNlc1tpXS5zbGVlcCA9IGl0ZW0uc2xlZXBUaW1lO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnamlueCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndHJlbW9yJzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdraWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdraWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlhFTiBDT1JQIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpbmRleCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGkpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaV07XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwLnBsYXllcjtcclxuXHR2YXIgY2xlYW5Qb3MgPSB0aGlzLm1hcC5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZShwbGF5ZXIucG9zaXRpb24uYSwgcGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdGlmICghY2xlYW5Qb3Mpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnQ2Fubm90IGRyb3AgaXQgaGVyZScpO1xyXG5cdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIGRyb3BwZWQnKTtcclxuXHRcdGNsZWFuUG9zLmEgKz0gMC41O1xyXG5cdFx0Y2xlYW5Qb3MuYyArPSAwLjU7XHJcblx0XHRcclxuXHRcdHZhciBuSXQgPSBuZXcgSXRlbSgpO1xyXG5cdFx0bkl0LmluaXQoY2xlYW5Qb3MsIG51bGwsIHRoaXMubWFwKTtcclxuXHRcdG5JdC5zZXRJdGVtKGl0ZW0pO1xyXG5cdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobkl0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaSk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY2hlY2tJbnZDb250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdFxyXG5cdGlmIChwbGF5ZXIgJiYgcGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgyKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpO1xyXG5cdFx0XHR0aGlzLm5ld0dhbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKCFwbGF5ZXIgfHwgcGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODApKXtcclxuXHRcdHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5wYXVzZWQpIHJldHVybjtcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDg0KSl7XHJcblx0XHRpZiAoIXRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdTZWxlY3QgdGhlIGl0ZW0gdG8gZHJvcCcpO1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gdHJ1ZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0dmFyIGluZGV4ID0gNDkgKyBpO1xyXG5cdFx0aWYgKGkgPT0gOSlcclxuXHRcdFx0aW5kZXggPSA0ODtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoaW5kZXgpKXtcclxuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdFx0aWYgKCFpdGVtKXtcclxuXHRcdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdObyBpdGVtJyk7XHJcblx0XHRcdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0dGhpcy5kcm9wSXRlbShpKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGl0ZW0udHlwZSA9PSAnd2VhcG9uJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdpZWxkZWQnKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ2FybW91cicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3b3JuJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdtYWdpYycpe1xyXG5cdFx0XHRcdHRoaXMuYWN0aXZlU3BlbGwoaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3BvdGlvbicpe1xyXG5cdFx0XHRcdHRoaXMudXNlSXRlbShpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gXHJcblx0XHJcblx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmIChwcy5wb3Rpb25zID4gMCl7XHJcblx0XHRpZiAocHMuaHAgPT0gcHMubUhQKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkhlYWx0aCBpcyBhbHJlYWR5IGF0IG1heFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRwcy5wb3Rpb25zIC09IDE7XHJcblx0XHRwcy5ocCA9IE1hdGgubWluKHBzLm1IUCwgcHMuaHAgKyA1KTtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQb3Rpb24gdXNlZFwiKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJObyBtb3JlIHBvdGlvbnMgbGVmdC5cIik7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2xvYmFsTG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApeyB0aGlzLnByb3RlY3Rpb24gLT0gMTsgfVxyXG5cdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7IHRoaXMudGltZVN0b3AgLT0gMTsgfVxyXG5cdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7IHRoaXMuR0wubGlnaHQgLT0gMTsgfVxyXG5cdFxyXG5cdHRoaXMucGxheWVyLnJlZ2VuTWFuYSgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG5cdHZhciBkVCA9IChub3cgLSBnYW1lLmxhc3RUKTtcclxuXHRcclxuXHQvLyBMaW1pdCB0aGUgZ2FtZSB0byB0aGUgYmFzZSBzcGVlZCBvZiB0aGUgZ2FtZVxyXG5cdGlmIChkVCA+IGdhbWUuZnBzKXtcclxuXHRcdGdhbWUubGFzdFQgPSBub3cgLSAoZFQgJSBnYW1lLmZwcyk7XHJcblx0XHRcclxuXHRcdGlmICghZ2FtZS5HTC5hY3RpdmUpe1xyXG5cdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTsgXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMubWFwICE9IG51bGwpe1xyXG5cdFx0XHR2YXIgZ2wgPSBnYW1lLkdMLmN0eDtcclxuXHRcdFx0XHJcblx0XHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHRcdFx0Z2FtZS5VSS5jbGVhcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0Z2FtZS5nbG9iYWxMb29wKCk7XHJcblx0XHRcdGdhbWUuY2hlY2tJbnZDb250cm9sKCk7XHJcblx0XHRcdGdhbWUubWFwLmxvb3AoKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLm1hcClcclxuXHRcdFx0XHRnYW1lLmRyYXdVSSgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodGhpcy5zY2VuZSAhPSBudWxsKXtcclxuXHRcdFx0Z2FtZS5zY2VuZS5sb29wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb29wKCk7IH0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0S2V5UHJlc3NlZCA9IGZ1bmN0aW9uKGtleUNvZGUpe1xyXG5cdGlmICh0aGlzLmtleXNba2V5Q29kZV0gPT0gMSl7XHJcblx0XHR0aGlzLmtleXNba2V5Q29kZV0gPSAyO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE1vdXNlQnV0dG9uUHJlc3NlZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubW91c2UuYyA9PSAxKXtcclxuXHRcdHRoaXMubW91c2UuYyA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHJldCA9IHt4OiB0aGlzLm1vdXNlTW92ZW1lbnQueCwgeTogdGhpcy5tb3VzZU1vdmVtZW50Lnl9O1xyXG5cdHRoaXMubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSBuZXcgVW5kZXJ3b3JsZCgpO1xyXG5cdGdhbWUubG9hZEdhbWUoKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGUua2V5Q29kZSA9PSA4KXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLmtleXNbZS5rZXlDb2RlXSA9PSAyKSByZXR1cm47XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwia2V5dXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Z2FtZS5rZXlzW2Uua2V5Q29kZV0gPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubWFwICE9IG51bGwpXHJcblx0XHRcdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5jID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUubW91c2UuYyA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRnYW1lLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFx0Z2FtZS5udW1iZXJGcmFtZXMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJyZXNpemVcIiwgZnVuY3Rpb24oKXtcclxuXHRcdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBnYW1lLnNpemUuYjtcclxuXHRcdHZhciBjYW52YXMgPSBnYW1lLkdMLmNhbnZhcztcclxuXHRcdFxyXG5cdFx0Y2FudmFzID0gZ2FtZS5VSS5jYW52YXM7XHJcblx0XHRnYW1lLlVJLnNjYWxlID0gY2FudmFzLm9mZnNldEhlaWdodCAvIGNhbnZhcy5oZWlnaHQ7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIG1vdmVDYWxsYmFjayA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnggPSBlLm1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdGdhbWUubW91c2VNb3ZlbWVudC55ID0gZS5tb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS5tb3pNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS53ZWJraXRNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0MDtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBwb2ludGVybG9ja2NoYW5nZSA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKGRvY3VtZW50LnBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50Lm1velBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50LndlYmtpdFBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlQ2FsbGJhY2spO1xyXG5cdFx0XHRnYW1lLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwicG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIm1venBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJ3ZWJraXRwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImJsdXJcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gZmFsc2U7IGdhbWUuYXVkaW8ucGF1c2VNdXNpYygpOyAgfSk7XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKGUpeyBnYW1lLkdMLmFjdGl2ZSA9IHRydWU7IGdhbWUuYXVkaW8ucmVzdG9yZU11c2ljKCk7IH0pO1xyXG59KTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0YWRkRXZlbnQ6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZ1bmMpe1xyXG5cdFx0aWYgKG9iai5hZGRFdmVudExpc3RlbmVyKXtcclxuXHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuYywgZmFsc2UpO1xyXG5cdFx0fWVsc2UgaWYgKG9iai5hdHRhY2hFdmVudCl7XHJcblx0XHRcdG9iai5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmdW5jKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdCQkOiBmdW5jdGlvbihvYmpJZCl7XHJcblx0XHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9iaklkKTtcclxuXHRcdGlmICghZWxlbSkgYWxlcnQoXCJDb3VsZG4ndCBmaW5kIGVsZW1lbnQ6IFwiICsgb2JqSWQpO1xyXG5cdFx0cmV0dXJuIGVsZW07XHJcblx0fSxcclxuXHRnZXRIdHRwOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGh0dHA7XHJcblx0XHRpZiAgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcdH1lbHNlIGlmICh3aW5kb3cuQWN0aXZlWE9iamVjdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGh0dHA7XHJcblx0fSxcclxuXHRyb2xsRGljZTogZnVuY3Rpb24gKHBhcmFtKXtcclxuXHRcdHZhciBhID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKDAsIHBhcmFtLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRcdHZhciBiID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKHBhcmFtLmluZGV4T2YoJ0QnKSArIDEpLCAxMCk7XHJcblx0XHR2YXIgcm9sbDEgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBiKTtcclxuXHRcdHZhciByb2xsMiA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0cmV0dXJuIE1hdGguY2VpbChhICogKHJvbGwxK3JvbGwyKS8yKTtcclxuXHR9XHJcbn1cclxuXHRcclxuLy8gTWF0aCBwcm90b3R5cGUgb3ZlcnJpZGVzXHRcclxuTWF0aC5yYWRSZWxhdGlvbiA9IE1hdGguUEkgLyAxODA7XHJcbk1hdGguZGVnUmVsYXRpb24gPSAxODAgLyBNYXRoLlBJO1xyXG5NYXRoLmRlZ1RvUmFkID0gZnVuY3Rpb24oZGVncmVlcyl7XHJcblx0cmV0dXJuIGRlZ3JlZXMgKiB0aGlzLnJhZFJlbGF0aW9uO1xyXG59O1xyXG5NYXRoLnJhZFRvRGVnID0gZnVuY3Rpb24ocmFkaWFucyl7XHJcblx0cmV0dXJuICgocmFkaWFucyAqIHRoaXMuZGVnUmVsYXRpb24pICsgNzIwKSAlIDM2MDtcclxufTtcclxuTWF0aC5pUmFuZG9tID0gZnVuY3Rpb24oYSwgYil7XHJcblx0aWYgKGIgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRiID0gYTtcclxuXHRcdGEgPSAwO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gYSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChiIC0gYSkpO1xyXG59O1xyXG5cclxuTWF0aC5nZXRBbmdsZSA9IGZ1bmN0aW9uKC8qVmVjMiovIGEsIC8qVmVjMiovIGIpe1xyXG5cdHZhciB4eCA9IE1hdGguYWJzKGEuYSAtIGIuYSk7XHJcblx0dmFyIHl5ID0gTWF0aC5hYnMoYS5jIC0gYi5jKTtcclxuXHRcclxuXHR2YXIgYW5nID0gTWF0aC5hdGFuMih5eSwgeHgpO1xyXG5cdFxyXG5cdC8vIEFkanVzdCB0aGUgYW5nbGUgYWNjb3JkaW5nIHRvIGJvdGggcG9zaXRpb25zXHJcblx0aWYgKGIuYSA8PSBhLmEgJiYgYi5jIDw9IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJIC0gYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPD0gYS5hICYmIGIuYyA+IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJICsgYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPiBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkyIC0gYW5nO1xyXG5cdH1cclxuXHRcclxuXHRhbmcgPSAoYW5nICsgTWF0aC5QSTIpICUgTWF0aC5QSTI7XHJcblx0XHJcblx0cmV0dXJuIGFuZztcclxufTtcclxuXHJcbk1hdGguUElfMiA9IE1hdGguUEkgLyAyO1xyXG5NYXRoLlBJMiA9IE1hdGguUEkgKiAyO1xyXG5NYXRoLlBJM18yID0gTWF0aC5QSSAqIDMgLyAyO1xyXG5cclxuLy8gQ3Jvc3Nicm93c2VyIGFuaW1hdGlvbi9hdWRpbyBvdmVycmlkZXNcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gXHJcblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fCBcclxuXHR3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxyXG5cdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHwgXHJcblx0d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fCBcclxuXHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8IFxyXG5cdGZ1bmN0aW9uKC8qIGZ1bmN0aW9uICovIGRyYXcxKXtcclxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KGRyYXcxLCAxMDAwIC8gMzApO1xyXG5cdH07XHJcblxyXG53aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0OyIsInZhciBNYXRyaXggPSByZXF1aXJlKCcuL01hdHJpeCcpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBXZWJHTChzaXplLCBjb250YWluZXIpe1xyXG5cdGlmICghdGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcikpIHJldHVybiBudWxsOyBcclxuXHR0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblx0dGhpcy5wcm9jZXNzU2hhZGVycygpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzID0gW107XHJcblx0XHJcblx0dGhpcy5hY3RpdmUgPSB0cnVlO1xyXG5cdHRoaXMubGlnaHQgPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYkdMO1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHRpZiAoIWNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpKXtcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiKTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpO1xyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdFByb3BlcnRpZXMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcclxuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcblx0Z2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKCBnbC5CTEVORCApO1xyXG5cdGdsLmJsZW5kRXF1YXRpb24oIGdsLkZVTkNfQUREICk7XHJcblx0Z2wuYmxlbmRGdW5jKCBnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEgKTtcclxuXHRcclxuXHR0aGlzLmFzcGVjdFJhdGlvID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcblx0dGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCA9IE1hdHJpeC5tYWtlUGVyc3BlY3RpdmUoNDUsIHRoaXMuYXNwZWN0UmF0aW8sIDAuMDAyLCA1LjApO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnByb2Nlc3NTaGFkZXJzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBDb21waWxlIGZyYWdtZW50IHNoYWRlclxyXG5cdHZhciBlbFNoYWRlciA9IFV0aWxzLiQkKFwiZnJhZ21lbnRTaGFkZXJcIik7XHJcblx0dmFyIGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciBmU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XHJcblx0Z2wuc2hhZGVyU291cmNlKGZTaGFkZXIsIGNvZGUpO1xyXG5cdGdsLmNvbXBpbGVTaGFkZXIoZlNoYWRlcik7XHJcblx0XHJcblx0Ly8gQ29tcGlsZSB2ZXJ0ZXggc2hhZGVyXHJcblx0ZWxTaGFkZXIgPSBVdGlscy4kJChcInZlcnRleFNoYWRlclwiKTtcclxuXHRjb2RlID0gdGhpcy5nZXRTaGFkZXJDb2RlKGVsU2hhZGVyKTtcclxuXHR2YXIgdlNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UodlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcih2U2hhZGVyKTtcclxuXHRcclxuXHQvLyBDcmVhdGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblx0dGhpcy5zaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIGZTaGFkZXIpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIHZTaGFkZXIpO1xyXG5cdGdsLmxpbmtQcm9ncmFtKHRoaXMuc2hhZGVyUHJvZ3JhbSk7XHJcblx0XHJcblx0aWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcblx0XHRhbGVydChcIkVycm9yIGluaXRpYWxpemluZyB0aGUgc2hhZGVyIHByb2dyYW1cIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG4gIFxyXG5cdGdsLnVzZVByb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHQvLyBHZXQgYXR0cmlidXRlIGxvY2F0aW9uc1xyXG5cdHRoaXMuYVZlcnRleFBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFWZXJ0ZXhQb3NpdGlvblwiKTtcclxuXHR0aGlzLmFUZXh0dXJlQ29vcmQgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVRleHR1cmVDb29yZFwiKTtcclxuXHR0aGlzLmFWZXJ0ZXhJc0RhcmsgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleElzRGFya1wiKTtcclxuXHRcclxuXHQvLyBFbmFibGUgYXR0cmlidXRlc1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleFBvc2l0aW9uKTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFUZXh0dXJlQ29vcmQpO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleElzRGFyayk7XHJcblx0XHJcblx0Ly8gR2V0IHRoZSB1bmlmb3JtIGxvY2F0aW9uc1xyXG5cdHRoaXMudVNhbXBsZXIgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVTYW1wbGVyXCIpO1xyXG5cdHRoaXMudVRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1VHJhbnNmb3JtYXRpb25NYXRyaXhcIik7XHJcblx0dGhpcy51UGVyc3BlY3RpdmVNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQZXJzcGVjdGl2ZU1hdHJpeFwiKTtcclxuXHR0aGlzLnVQYWludEluUmVkID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1UGFpbnRJblJlZFwiKTtcclxuXHR0aGlzLnVMaWdodERlcHRoID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1TGlnaHREZXB0aFwiKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5nZXRTaGFkZXJDb2RlID0gZnVuY3Rpb24oc2hhZGVyKXtcclxuXHR2YXIgY29kZSA9IFwiXCI7XHJcblx0dmFyIG5vZGUgPSBzaGFkZXIuZmlyc3RDaGlsZDtcclxuXHR2YXIgdG4gPSBub2RlLlRFWFRfTk9ERTtcclxuXHRcclxuXHR3aGlsZSAobm9kZSl7XHJcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PSB0bilcclxuXHRcdFx0Y29kZSArPSBub2RlLnRleHRDb250ZW50O1xyXG5cdFx0bm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBjb2RlO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uKHNyYywgbWFrZUl0VGV4dHVyZSwgdGV4dHVyZUluZGV4LCBpc1NvbGlkLCBwYXJhbXMpe1xyXG5cdGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcclxuXHRpZiAoIXBhcmFtcy5pbWdOdW0pIHBhcmFtcy5pbWdOdW0gPSAxO1xyXG5cdGlmICghcGFyYW1zLmltZ1ZOdW0pIHBhcmFtcy5pbWdWTnVtID0gMTtcclxuXHRpZiAoIXBhcmFtcy54T3JpZykgcGFyYW1zLnhPcmlnID0gMDtcclxuXHRpZiAoIXBhcmFtcy55T3JpZykgcGFyYW1zLnlPcmlnID0gMDtcclxuXHRcclxuXHR2YXIgZ2wgPSB0aGlzO1xyXG5cdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcclxuXHRpbWcuc3JjID0gc3JjO1xyXG5cdGltZy5yZWFkeSA9IGZhbHNlO1xyXG5cdGltZy50ZXh0dXJlID0gbnVsbDtcclxuXHRpbWcudGV4dHVyZUluZGV4ID0gdGV4dHVyZUluZGV4O1xyXG5cdGltZy5pc1NvbGlkID0gKGlzU29saWQgPT09IHRydWUpO1xyXG5cdGltZy5pbWdOdW0gPSBwYXJhbXMuaW1nTnVtO1xyXG5cdGltZy52SW1nTnVtID0gcGFyYW1zLmltZ1ZOdW07XHJcblx0aW1nLnhPcmlnID0gcGFyYW1zLnhPcmlnO1xyXG5cdGltZy55T3JpZyA9IHBhcmFtcy55T3JpZztcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChpbWcsIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdFx0aW1nLmltZ1dpZHRoID0gaW1nLndpZHRoIC8gaW1nLmltZ051bTtcclxuXHRcdGltZy5pbWdIZWlnaHQgPSBpbWcuaGVpZ2h0IC8gaW1nLnZJbWdOdW07XHJcblx0XHRpbWcucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobWFrZUl0VGV4dHVyZSl7XHJcblx0XHRcdGltZy50ZXh0dXJlID0gZ2wucGFyc2VUZXh0dXJlKGltZywgcGFyYW1zLmNsYW1wV3JhcCk7XHJcblx0XHRcdGltZy50ZXh0dXJlLnRleHR1cmVJbmRleCA9IGltZy50ZXh0dXJlSW5kZXg7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0Z2wuaW1hZ2VzLnB1c2goaW1nKTtcclxuXHRyZXR1cm4gaW1nO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnBhcnNlVGV4dHVyZSA9IGZ1bmN0aW9uKGltZywgY2xhbXBFZGdlcyl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ3JlYXRlcyBhIHRleHR1cmUgaG9sZGVyIHRvIHdvcmsgd2l0aFxyXG5cdHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcclxuXHRcclxuXHQvLyBGbGlwIHZlcnRpY2FsIHRoZSB0ZXh0dXJlXHJcblx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblx0XHJcblx0Ly8gTG9hZCB0aGUgaW1hZ2UgZGF0YVxyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcclxuXHRcclxuXHQvLyBBc3NpZ24gcHJvcGVydGllcyBvZiBzY2FsaW5nXHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRpZiAoY2xhbXBFZGdlcyl7XHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xyXG5cdH1cclxuXHRnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcclxuXHRcclxuXHQvLyBSZWxlYXNlcyB0aGUgdGV4dHVyZSBmcm9tIHRoZSB3b3Jrc3BhY2VcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcclxuXHRyZXR1cm4gdGV4O1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdmVydGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC52ZXJ0ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4UG9zaXRpb24sIG9iamVjdC52ZXJ0ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdGV4dHVyZSBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFUZXh0dXJlQ29vcmQsIG9iamVjdC50ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgZGFyayBidWZmZXIgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0aWYgKG9iamVjdC5kYXJrQnVmZmVyKXtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QuZGFya0J1ZmZlcik7XHJcblx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleElzRGFyaywgb2JqZWN0LmRhcmtCdWZmZXIuaXRlbVNpemUsIGdsLlVOU0lHTkVEX0JZVEUsIGZhbHNlLCAwLCAwKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gUGFpbnQgdGhlIG9iamVjdCBpbiByZWQgKFdoZW4gaHVydCBmb3IgZXhhbXBsZSlcclxuXHR2YXIgcmVkID0gKG9iamVjdC5wYWludEluUmVkKT8gMS4wIDogMC4wOyBcclxuXHRnbC51bmlmb3JtMWYodGhpcy51UGFpbnRJblJlZCwgcmVkKTtcclxuXHRcclxuXHQvLyBIb3cgbXVjaCBsaWdodCB0aGUgcGxheWVyIGNhc3RcclxuXHR2YXIgbGlnaHQgPSAodGhpcy5saWdodCA+IDApPyAwLjAgOiAxLjA7XHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudUxpZ2h0RGVwdGgsIGxpZ2h0KTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHRleHR1cmUgdG8gd29yayB3aXRoXHJcblx0Z2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblx0Z2wudW5pZm9ybTFpKHRoaXMudVNhbXBsZXIsIDApO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybSB0aGUgb2JqZWN0XHJcblx0dmFyIHRyYW5zZm9ybWF0aW9uTWF0cml4ID0gTWF0cml4Lm1ha2VUcmFuc2Zvcm0ob2JqZWN0LCBjYW1lcmEpO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGluZGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgb2JqZWN0LmluZGljZXNCdWZmZXIpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybWF0aW9uIG1hdHJpY2VzXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCkpO1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRyYW5zZm9ybWF0aW9uTWF0cml4KSk7XHJcblx0XHJcblx0aWYgKG9iamVjdC5ub1JvdGF0ZSkgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdC8vIERyYXcgdGhlIHRyaWFuZ2xlc1xyXG5cdGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIG9iamVjdC5pbmRpY2VzQnVmZmVyLm51bUl0ZW1zLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuYXJlSW1hZ2VzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbWFnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuaW1hZ2VzW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyJdfQ==
