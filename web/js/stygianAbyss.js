(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Audio.js":[function(require,module,exports){
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
},{"./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Billboard.js":[function(require,module,exports){
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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Console.js":[function(require,module,exports){
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
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Door.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\EndingScreen.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Enemy.js":[function(require,module,exports){
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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\EnemyFactory.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Inventory.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Item.js":[function(require,module,exports){
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
},{"./Billboard":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Billboard.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapAssembler.js":[function(require,module,exports){
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
},{"./Door":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Door.js","./Enemy":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Enemy.js","./EnemyFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\EnemyFactory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./Player":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Player.js","./Stairs":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Stairs.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapManager.js":[function(require,module,exports){
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

},{"./MapAssembler":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapAssembler.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Matrix.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js":[function(require,module,exports){
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
},{"./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js":[function(require,module,exports){
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

},{"./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Player.js":[function(require,module,exports){
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
		if (this.jog.a <= -0.03 && this.jog.b == -1) this.jog.b = 1;
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

},{"./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\PlayerStats.js":[function(require,module,exports){
function PlayerStats(){
	this._c = circular.register('PlayerStats');
	this.hp = 0;
	this.mHP = 0;
	this.mana = 0;
	this.mMana = 0;
	
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
		break;
		
		case "Compassion":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 4;
			this.stats.str = '4';
			this.stats.dfs = '4';
			this.stats.dex = 0.9;
			this.className = 'Bard';
		break;
		
		case "Valor":
			this.hp = 800;
			this.mana = 0;
			this.stats.magicPower = 2;
			this.stats.str = '6';
			this.stats.dfs = '2';
			this.stats.dex = 0.9;
			this.className = 'Fighter';
		break;
		
		case "Honor":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 4;
			this.stats.str = '6';
			this.stats.dfs = '2';
			this.stats.dex = 0.9;
			this.className = 'Paladin';
		break;
		
		case "Spirituality":
			this.hp = 700;
			this.mana = 100;
			this.stats.magicPower = 6;
			this.stats.str = '4';
			this.stats.dfs = '4';
			this.stats.dex = 0.95;
			this.className = 'Ranger';
		break;
		
		case "Humility":
			this.hp = 600;
			this.mana = 0;
			this.stats.magicPower = 2;
			this.stats.str = '2';
			this.stats.dfs = '2';
			this.stats.dex = 0.8;
			this.className = 'Shepherd';
		break;
		
		case "Sacrifice":
			this.hp = 800;
			this.mana = 50;
			this.stats.magicPower = 2;
			this.stats.str = '4';
			this.stats.dfs = '6';
			this.stats.dex = 0.95;
			this.className = 'Tinker';
		break;
		
		case "Justice":
			this.hp = 700;
			this.mana = 150;
			this.stats.magicPower = 4;
			this.stats.str = '2';
			this.stats.dfs = '2';
			this.stats.dex = 0.95;
			this.className = 'Druid';
		break;
	}
	
	this.mHP = this.hp;
	this.stats.str += 'D3';
	this.stats.dfs += 'D3';
	this.stats.magicPower += 'D3';
	this.mMana = this.mana;
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SaveManager.js":[function(require,module,exports){
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
},{"./Storage":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Storage.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SelectClass.js":[function(require,module,exports){
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Stairs.js":[function(require,module,exports){
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

},{"./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Storage.js":[function(require,module,exports){
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
 

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\TitleScreen.js":[function(require,module,exports){
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

},{"./SelectClass":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SelectClass.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\UI.js":[function(require,module,exports){
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
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Underworld.js":[function(require,module,exports){
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

/*============================================================
				 Stygian Abyss
				
  By Camilo Ramírez (Jucarave) and Slash (http://slashie.net)
			
					  2015
=============================================================*/

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
	
	this.grPack = 'img/';
	
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
}

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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js","./Audio":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Audio.js","./Console":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Console.js","./EndingScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\EndingScreen.js","./Inventory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Inventory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./MapManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapManager.js","./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./PlayerStats":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\PlayerStats.js","./SaveManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SaveManager.js","./TitleScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\TitleScreen.js","./UI":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\UI.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js","./WebGL":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\WebGL.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js":[function(require,module,exports){
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
},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\WebGL.js":[function(require,module,exports){
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
},{"./Matrix":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Matrix.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}]},{},["C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Underworld.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZGluZ1NjcmVlbi5qcyIsImpzXFxFbmVteS5qcyIsImpzXFxFbmVteUZhY3RvcnkuanMiLCJqc1xcSW52ZW50b3J5LmpzIiwianNcXEl0ZW0uanMiLCJqc1xcSXRlbUZhY3RvcnkuanMiLCJqc1xcTWFwQXNzZW1ibGVyLmpzIiwianNcXE1hcE1hbmFnZXIuanMiLCJqc1xcTWF0cml4LmpzIiwianNcXE1pc3NpbGUuanMiLCJqc1xcT2JqZWN0RmFjdG9yeS5qcyIsImpzXFxQbGF5ZXIuanMiLCJqc1xcUGxheWVyU3RhdHMuanMiLCJqc1xcU2F2ZU1hbmFnZXIuanMiLCJqc1xcU2VsZWN0Q2xhc3MuanMiLCJqc1xcU3RhaXJzLmpzIiwianNcXFN0b3JhZ2UuanMiLCJqc1xcVGl0bGVTY3JlZW4uanMiLCJqc1xcVUkuanMiLCJqc1xcVW5kZXJ3b3JsZC5qcyIsImpzXFxVdGlscy5qcyIsImpzXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRfMUZyYW1lOiBbXSxcclxuXHRfMkZyYW1lczogW10sXHJcblx0XzNGcmFtZXM6IFtdLFxyXG5cdF80RnJhbWVzOiBbXSxcclxuXHRpdGVtQ29vcmRzOiBbXSxcclxuXHRcclxuXHRpbml0OiBmdW5jdGlvbihnbCl7XHJcblx0XHQvLyAxIEZyYW1lXHJcblx0XHR2YXIgY29vcmRzID0gWzEuMCwxLjAsMC4wLDEuMCwxLjAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMUZyYW1lLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMiBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4wMCwxLjAwLDAuNTAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMkZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNTAsMS4wMCwxLjAwLDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHJcblx0XHQvLyAzIEZyYW1lcywgNCBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjI1LDEuMDAsMC4wMCwxLjAwLDAuMjUsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4yNSwxLjAwLDAuNTAsMC4wMCwwLjI1LDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjc1LDEuMDAsMC41MCwxLjAwLDAuNzUsMC4wMCwwLjUwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFsxLjAwLDEuMDAsMC43NSwxLjAwLDEuMDAsMC4wMCwwLjc1LDAuMDBdO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0fSxcclxuXHRcclxuXHRwcmVwYXJlQnVmZmVyOiBmdW5jdGlvbihjb29yZHMsIGdsKXtcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoY29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gY29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdHJldHVybiB0ZXhCdWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRnZXRCeU51bUZyYW1lczogZnVuY3Rpb24obnVtRnJhbWVzKXtcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMSkgcmV0dXJuIHRoaXMuXzFGcmFtZTsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAyKSByZXR1cm4gdGhpcy5fMkZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAzKSByZXR1cm4gdGhpcy5fM0ZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSA0KSByZXR1cm4gdGhpcy5fNEZyYW1lcztcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRleHR1cmVCdWZmZXJDb29yZHM6IGZ1bmN0aW9uKHhJbWdOdW0sIHlJbWdOdW0sIGdsKXtcclxuXHRcdHZhciByZXQgPSBbXTtcclxuXHRcdHZhciB3aWR0aCA9IDEgLyB4SW1nTnVtO1xyXG5cdFx0dmFyIGhlaWdodCA9IDEgLyB5SW1nTnVtO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpPTA7aTx5SW1nTnVtO2krKyl7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPHhJbWdOdW07aisrKXtcclxuXHRcdFx0XHR2YXIgeDEgPSBqICogd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkxID0gMSAtIGkgKiBoZWlnaHQgLSBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHgyID0geDEgKyB3aWR0aDtcclxuXHRcdFx0XHR2YXIgeTIgPSB5MSArIGhlaWdodDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY29vcmRzID0gW3gyLHkyLHgxLHkyLHgyLHkxLHgxLHkxXTtcclxuXHRcdFx0XHRyZXQucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbmZ1bmN0aW9uIEF1ZGlvQVBJKCl7XHJcblx0dGhpcy5fYXVkaW8gPSBbXTtcclxuXHRcclxuXHR0aGlzLmF1ZGlvQ3R4ID0gbnVsbDtcclxuXHR0aGlzLmdhaW5Ob2RlID0gbnVsbDtcclxuXHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5pbml0QXVkaW9FbmdpbmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5pbml0QXVkaW9FbmdpbmUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh3aW5kb3cuQXVkaW9Db250ZXh0KXtcclxuXHRcdHRoaXMuYXVkaW9DdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblx0XHR0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0fWVsc2VcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgQXVkaW8gQVBJXCIpO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKHVybCwgaXNNdXNpYyl7XHJcblx0dmFyIGVuZyA9IHRoaXM7XHJcblx0aWYgKCFlbmcuYXVkaW9DdHgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHZhciBhdWRpbyA9IHtidWZmZXI6IG51bGwsIHNvdXJjZTogbnVsbCwgcmVhZHk6IGZhbHNlLCBpc011c2ljOiBpc011c2ljLCBwYXVzZWRBdDogMH07XHJcblx0XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cdGh0dHAucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuXHRcclxuXHRodHRwLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRlbmcuYXVkaW9DdHguZGVjb2RlQXVkaW9EYXRhKGh0dHAucmVzcG9uc2UsIGZ1bmN0aW9uKGJ1ZmZlcil7XHJcblx0XHRcdGF1ZGlvLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHRcdFx0YXVkaW8ucmVhZHkgPSB0cnVlO1xyXG5cdFx0fSwgZnVuY3Rpb24obXNnKXtcclxuXHRcdFx0YWxlcnQobXNnKTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0aHR0cC5zZW5kKCk7XHJcblx0XHJcblx0dGhpcy5fYXVkaW8ucHVzaChhdWRpbyk7XHJcblx0XHJcblx0cmV0dXJuIGF1ZGlvO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnN0b3BNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoYXVkaW8udGltZU8pe1xyXG5cdFx0XHRjbGVhclRpbWVvdXQoYXVkaW8udGltZU8pO1xyXG5cdFx0fWVsc2UgaWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghc291bmRGaWxlIHx8ICFzb3VuZEZpbGUucmVhZHkpe1xyXG5cdFx0aWYgKHRyeUlmTm90UmVhZHkpeyBzb3VuZEZpbGUudGltZU8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVuZy5wbGF5U291bmQoc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpOyB9LCAxMDAwKTsgfSBcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5pc011c2ljKSB0aGlzLnN0b3BNdXNpYygpO1xyXG5cdFxyXG5cdHNvdW5kRmlsZS50aW1lTyA9IG51bGw7XHJcblx0c291bmRGaWxlLnBsYXlpbmcgPSB0cnVlO1xyXG5cdCBcclxuXHR2YXIgc291cmNlID0gZW5nLmF1ZGlvQ3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG5cdHNvdXJjZS5idWZmZXIgPSBzb3VuZEZpbGUuYnVmZmVyO1xyXG5cdFxyXG5cdHZhciBnYWluTm9kZTtcclxuXHRpZiAodm9sdW1lICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0Z2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcclxuXHRcdGdhaW5Ob2RlLmdhaW4udmFsdWUgPSB2b2x1bWU7XHJcblx0XHRzb3VuZEZpbGUudm9sdW1lID0gdm9sdW1lO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2Fpbk5vZGUgPSBlbmcuZ2Fpbk5vZGU7XHJcblx0fVxyXG5cdFxyXG5cdHNvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcclxuXHRnYWluTm9kZS5jb25uZWN0KGVuZy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpIC0gc291bmRGaWxlLnBhdXNlZEF0O1xyXG5cdFx0c291cmNlLnN0YXJ0KDAsIChzb3VuZEZpbGUucGF1c2VkQXQgLyAxMDAwKSAlIHNvdW5kRmlsZS5idWZmZXIuZHVyYXRpb24pO1xyXG5cdFx0c291bmRGaWxlLnBhdXNlZEF0ID0gMDtcclxuXHR9ZWxzZXtcclxuXHRcdHNvdW5kRmlsZS5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG5cdFx0c291cmNlLnN0YXJ0KDApO1xyXG5cdH1cclxuXHRzb3VyY2UubG9vcCA9IGxvb3A7XHJcblx0c291cmNlLmxvb3BpbmcgPSBsb29wO1xyXG5cdHNvdXJjZS5vbmVuZGVkID0gZnVuY3Rpb24oKXsgc291bmRGaWxlLnBsYXlpbmcgPSBmYWxzZTsgfTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpXHJcblx0XHRzb3VuZEZpbGUuc291cmNlID0gc291cmNlO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBhdXNlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0YXVkaW8ucGF1c2VkQXQgPSAwO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8ud2FzUGxheWluZyA9IGF1ZGlvLnBsYXlpbmc7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnBhdXNlZEF0ID0gKERhdGUubm93KCkgLSBhdWRpby5zdGFydGVkQXQpO1xyXG5cdFx0XHRhdWRpby5yZXN0b3JlTG9vcCA9IGF1ZGlvLnNvdXJjZS5sb29wO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5yZXN0b3JlTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFhdWRpby5sb29waW5nICYmICFhdWRpby53YXNQbGF5aW5nKSBjb250aW51ZTtcclxuXHRcdGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSAmJiBhdWRpby5wYXVzZWRBdCAhPSAwKXtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wbGF5U291bmQoYXVkaW8sIGF1ZGlvLnJlc3RvcmVMb29wLCB0cnVlLCBhdWRpby52b2x1bWUpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMubXV0ZWQpe1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMDtcclxuXHRcdHRoaXMubXV0ZWQgPSB0cnVlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuYXJlU291bmRzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuX2F1ZGlvW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuZnVuY3Rpb24gQmlsbGJvYXJkKHBvc2l0aW9uLCB0ZXh0dXJlQ29kZSwgbWFwTWFuYWdlciwgcGFyYW1zKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IG51bGw7XHJcblx0dGhpcy5udW1GcmFtZXMgPSAxO1xyXG5cdHRoaXMuaW1nU3BkID0gMDtcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5hY3Rpb25zID0gbnVsbDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcclxuXHRpZiAocGFyYW1zKSB0aGlzLnBhcnNlUGFyYW1zKHBhcmFtcyk7XHJcblx0aWYgKHRleHR1cmVDb2RlID09IFwibm9uZVwiKSB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCaWxsYm9hcmQ7XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLnBhcnNlUGFyYW1zID0gZnVuY3Rpb24ocGFyYW1zKXtcclxuXHRmb3IgKHZhciBpIGluIHBhcmFtcyl7XHJcblx0XHR2YXIgcCA9IHBhcmFtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGkgPT0gXCJuZlwiKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR0aGlzLm51bUZyYW1lcyA9IHA7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhwKTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiaXNcIil7IC8vIEltYWdlIHNwZWVkXHJcblx0XHRcdHRoaXMuaW1nU3BkID0gcDtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiY2JcIil7IC8vIEN1c3RvbSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZChwLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHRcdH1lbHNlIGlmIChpID09IFwiYWNcIil7IC8vIEFjdGlvbnNcclxuXHRcdFx0dGhpcy5hY3Rpb25zID0gcDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuYWN0aW9ucy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhYyA9IHRoaXMuYWN0aW9uc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGFjID09IFwidHZcIil7IC8vIFRvb2dsZSB2aXNpYmlsaXR5XHJcblx0XHRcdHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN0X1wiKSA9PSAwKXsgLy8gQ2hhbmdlIHRleHR1cmVcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29kZSA9IGFjLnJlcGxhY2UoXCJjdF9cIiwgXCJcIik7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcIm5mX1wiKSA9PSAwKXsgLy8gTnVtYmVyIG9mIGZyYW1lc1xyXG5cdFx0XHR2YXIgbmYgPSBwYXJzZUludChhYy5yZXBsYWNlKFwibmZfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBuZjtcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKG5mKTtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjZl9cIikgPT0gMCl7IC8vIENpcmNsZSBmcmFtZXNcclxuXHRcdFx0dmFyIGZyYW1lcyA9IGFjLnJlcGxhY2UoXCJjZl9cIixcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gcGFyc2VJbnQoZnJhbWVzW3RoaXMuY2lyY2xlRnJhbWVJbmRleF0sIDEwKTtcclxuXHRcdFx0aWYgKHRoaXMuY2lyY2xlRnJhbWVJbmRleCsrID49IGZyYW1lcy5sZW5ndGgtMSkgdGhpcy5jaXJjbGVGcmFtZUluZGV4ID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY3dfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciB0ZXh0dXJlSWQgPSBwYXJzZUludChhYy5yZXBsYWNlKFwiY3dfXCIsXCJcIiksIDEwKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmNoYW5nZVdhbGxUZXh0dXJlKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0ZXh0dXJlSWQpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJ1ZF9cIikgPT0gMCl7IC8vIFVubG9jayBkb29yXHJcblx0XHRcdHZhciBwb3MgPSBhYy5yZXBsYWNlKFwidWRfXCIsIFwiXCIpLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0dmFyIGRvb3IgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0RG9vckF0KHBhcnNlSW50KHBvc1swXSwgMTApLCBwYXJzZUludChwb3NbMV0sIDEwKSwgcGFyc2VJbnQocG9zWzJdLCAxMCkpO1xyXG5cdFx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRcdGRvb3IubG9jayA9IG51bGw7XHJcblx0XHRcdFx0ZG9vci5hY3RpdmF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAoYWMgPT0gXCJkZXN0cm95XCIpeyAvLyBEZXN0cm95IHRoZSBiaWxsYm9hcmRcclxuXHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy52aXNpYmxlKSByZXR1cm47XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5iaWxsYm9hcmQgJiYgdGhpcy50ZXh0dXJlQ29vcmRzKXtcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMudGV4dHVyZUNvb3Jkc1sodGhpcy5pbWdJbmQgPDwgMCldO1xyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCAmJiB0aGlzLm51bUZyYW1lcyA+IDEpe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMubnVtRnJhbWVzKXtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gQ29uc29sZSgvKkludCovIG1heE1lc3NhZ2VzLCAvKkludCovIGxpbWl0LCAvKkludCovIHNwbGl0QXQsICAvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLm1lc3NhZ2VzID0gW107XHJcblx0dGhpcy5tYXhNZXNzYWdlcyA9IG1heE1lc3NhZ2VzO1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5saW1pdCA9IGxpbWl0O1xyXG5cdHRoaXMuc3BsaXRBdCA9IHNwbGl0QXQ7XHJcblx0XHJcblx0dGhpcy5zcHJpdGVGb250ID0gbnVsbDtcclxuXHR0aGlzLmxpc3RPZkNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNmQ29udGV4dCA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gbnVsbDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSBudWxsO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGU7XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigvKkludCovIHgsIC8qSW50Ki8geSl7XHJcblx0dmFyIHMgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDE7XHJcblx0dmFyIGN0eCA9IHRoaXMuZ2FtZS5VSS5jdHg7XHJcblx0XHJcblx0Y3R4LmRyYXdJbWFnZSh0aGlzLnNmQ29udGV4dC5jYW52YXMsIHgsIHkpO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucGFyc2VGb250ID0gZnVuY3Rpb24oc3ByaXRlRm9udCl7XHJcblx0dmFyIGNoYXJhc1dpZHRoID0gW107XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc3ByaXRlRm9udC53aWR0aDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0XHJcblx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0Y3R4LmRyYXdJbWFnZShzcHJpdGVGb250LCAwLCAwKTtcclxuXHRcclxuXHR2YXIgaW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwwLGNhbnZhcy53aWR0aCwxKTtcclxuXHR2YXIgd2lkdGggPSAwO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW1nRGF0YS5kYXRhLmxlbmd0aDtpPGxlbjtpKz00KXtcclxuXHRcdHZhciByID0gaW1nRGF0YS5kYXRhW2ldO1xyXG5cdFx0dmFyIGcgPSBpbWdEYXRhLmRhdGFbaSsxXTtcclxuXHRcdHZhciBiID0gaW1nRGF0YS5kYXRhW2krMl07XHJcblx0XHRcclxuXHRcdGlmIChyID09IDI1NSAmJiBnID09IDAgJiYgYiA9PSAyNTUpe1xyXG5cdFx0XHR3aWR0aCsrO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmICh3aWR0aCAhPSAwKXtcclxuXHRcdFx0XHRjaGFyYXNXaWR0aC5wdXNoKHdpZHRoKTtcclxuXHRcdFx0XHR3aWR0aCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNoYXJhc1dpZHRoO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuY3JlYXRlU3ByaXRlRm9udCA9IGZ1bmN0aW9uKC8qSW1hZ2UqLyBzcHJpdGVGb250LCAvKlN0cmluZyovIGNoYXJhY3RlcnNVc2VkLCAvKkludCovIHZlcnRpY2FsU3BhY2Upe1xyXG5cdHRoaXMuc3ByaXRlRm9udCA9IHNwcml0ZUZvbnQ7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IGNoYXJhY3RlcnNVc2VkO1xyXG5cdHRoaXMuc3BhY2VMaW5lcyA9IHZlcnRpY2FsU3BhY2U7XHJcblx0XHJcblx0dGhpcy5jaGFyYXNXaWR0aCA9IHRoaXMucGFyc2VGb250KHNwcml0ZUZvbnQpO1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwMDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLnNmQ29udGV4dC5jYW52YXMgPSBjYW52YXM7XHJcblx0XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gc3ByaXRlRm9udC53aWR0aCAvIGNoYXJhY3RlcnNVc2VkLmxlbmd0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmZvcm1hdFRleHQgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciB0eHQgPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcclxuXHR2YXIgbGluZSA9IFwiXCI7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dHh0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIHdvcmQgPSB0eHRbaV07XHJcblx0XHRpZiAoKGxpbmUgKyBcIiBcIiArIHdvcmQpLmxlbmd0aCA8PSB0aGlzLnNwbGl0QXQpe1xyXG5cdFx0XHRpZiAobGluZSAhPSBcIlwiKSBsaW5lICs9IFwiIFwiO1xyXG5cdFx0XHRsaW5lICs9IHdvcmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0LnB1c2gobGluZSk7XHJcblx0XHRcdGxpbmUgPSB3b3JkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXQucHVzaChsaW5lKTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuYWRkU0ZNZXNzYWdlID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgbXNnID0gdGhpcy5mb3JtYXRUZXh0KG1lc3NhZ2UpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49bXNnLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1zZ1tpXSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubGltaXQpe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5zcGxpY2UoMCwxKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGMgPSB0aGlzLnNmQ29udGV4dC5jYW52YXM7XHJcblx0dGhpcy5zZkNvbnRleHQuY2xlYXJSZWN0KDAsMCxjLndpZHRoLGMuaGVpZ2h0KTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMubWVzc2FnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXNnID0gdGhpcy5tZXNzYWdlc1tpXTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gKHRoaXMuc3BhY2VMaW5lcyAqIHRoaXMubGltaXQpIC0gdGhpcy5zcGFjZUxpbmVzICogKGxlbiAtIGkgLSAxKTtcclxuXHRcdHRoaXMucHJpbnRUZXh0KHgseSxtc2cpO1xyXG5cdH1cclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnByaW50VGV4dCA9IGZ1bmN0aW9uICh4LHksbXNnLCBjdHgpe1xyXG5cdGlmICghY3R4KXtcclxuXHRcdGN0eCA9IHRoaXMuc2ZDb250ZXh0O1xyXG5cdH1cclxuXHR2YXIgYyA9IGN0eC5jYW52YXM7XHJcblx0XHJcblx0dmFyIHcgPSB0aGlzLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSB0aGlzLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdFxyXG5cdHZhciBtVyA9IG1zZy5sZW5ndGggKiB3O1xyXG5cdGlmIChtVyA+IGMud2lkdGgpIGMud2lkdGggPSBtVyArICgyICogdyk7XHJcblx0XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49bXNnLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IG1zZy5jaGFyQXQoaik7XHJcblx0XHR2YXIgaW5kID0gdGhpcy5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHR4LCB5LCB3LCBoIC0gMSk7XHJcblx0XHRcdHggKz0gdGhpcy5jaGFyYXNXaWR0aFtpbmRdICsgMTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR4ICs9IHc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiZnVuY3Rpb24gRG9vcihtYXBNYW5hZ2VyLCB3YWxsUG9zaXRpb24sIGRpciwgdGV4dHVyZUNvZGUsIHdhbGxUZXh0dXJlLCBsb2NrKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMud2FsbFBvc2l0aW9uID0gd2FsbFBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdHRoaXMuZGlyID0gZGlyO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLnJUZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlOyAvLyBEZWxldGVcclxuXHJcblx0dGhpcy5kb29yUG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHR0aGlzLndhbGxUZXh0dXJlID0gd2FsbFRleHR1cmU7XHJcblx0XHRcclxuXHR0aGlzLmJvdW5kaW5nQm94ID0gbnVsbDtcclxuXHR0aGlzLnBvc2l0aW9uID0gd2FsbFBvc2l0aW9uLmNsb25lKCk7XHJcblx0aWYgKGRpciA9PSBcIkhcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoLTAuMjUsIDAuMCwgMC4wKSk7IH1lbHNlXHJcblx0aWYgKGRpciA9PSBcIlZcIil7IHRoaXMucG9zaXRpb24uc3VtKHZlYzMoMC4wLCAwLjAsIC0wLjI1KSk7IHRoaXMucm90YXRpb24gPSBNYXRoLlBJXzI7IH1cclxuXHRcclxuXHR0aGlzLmxvY2sgPSBsb2NrO1xyXG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcclxuXHR0aGlzLmFuaW1hdGlvbiA9ICAwO1xyXG5cdHRoaXMub3BlblNwZWVkID0gTWF0aC5kZWdUb1JhZCgxMCk7XHJcblx0XHJcblx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEb29yO1xyXG5cclxuRG9vci5wcm90b3R5cGUuZ2V0Qm91bmRpbmdCb3ggPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmJvdW5kaW5nQm94O1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiAhPSAwKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMubG9jayl7XHJcblx0XHR2YXIga2V5ID0gdGhpcy5tYXBNYW5hZ2VyLmdldFBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdGlmIChrZXkpe1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShrZXkubmFtZSArIFwiIHVzZWRcIik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5yZW1vdmVQbGF5ZXJJdGVtKHRoaXMubG9jayk7XHJcblx0XHRcdHRoaXMubG9jayA9IG51bGw7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJMb2NrZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuY2xvc2VkKSB0aGlzLmFuaW1hdGlvbiA9IDE7XHJcblx0ZWxzZSB0aGlzLmFuaW1hdGlvbiA9IDI7IFxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybiB0cnVlO1xyXG5cdHJldHVybiB0aGlzLmNsb3NlZDtcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLm1vZGlmeUNvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGlyID09IFwiSFwiKXtcclxuXHRcdGlmICh0aGlzLmNsb3NlZCl7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUgLSAwLjA1LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1lbHNle1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUgLSAwLjA1LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC4xLCBoOiAwLjVcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuNSwgaDogMC4xXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFuMSA9ICgodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIkhcIikgfHwgKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJWXCIpKTtcclxuXHR2YXIgYW4yID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAyICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMSAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdFxyXG5cdGlmIChhbjEgJiYgdGhpcy5yb3RhdGlvbiA8IE1hdGguUElfMil7XHJcblx0XHR0aGlzLnJvdGF0aW9uICs9IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPj0gTWF0aC5QSV8yKXtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJWXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1lbHNlIGlmIChhbjIgJiYgdGhpcy5yb3RhdGlvbiA+IDApe1xyXG5cdFx0dGhpcy5yb3RhdGlvbiAtPSB0aGlzLm9wZW5TcGVlZDtcclxuXHRcdGlmICh0aGlzLnJvdGF0aW9uIDw9IDApe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gMDtcclxuXHRcdFx0dGhpcy5hbmltYXRpb24gID0gMDtcclxuXHRcdFx0dGhpcy5jbG9zZWQgPSAodGhpcy5kaXIgPT0gXCJIXCIpO1xyXG5cdFx0XHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gRW5kaW5nU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5jdXJyZW50U2NyZWVuID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmRpbmdTY3JlZW47XHJcblxyXG5FbmRpbmdTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMilcclxuXHRcdFx0dGhpcy5nYW1lLm5ld0dhbWUoKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0fVxyXG59O1xyXG5cclxuRW5kaW5nU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHRpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDApXHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5lbmRpbmdTY3JlZW4sIDAsIDApO1xyXG5cdGVsc2UgaWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSAxKVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMiwgMCwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuMywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ2JpbGxib2FyZCcpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ3RleHR1cmVDb29yZHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0VuZW15JywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKSB7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMoMik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gRW5lbXkoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0VuZW15Jyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0VuZW15JywgRW5lbXkpO1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZW5lbXksIG1hcE1hbmFnZXIpe1xyXG5cdGlmIChlbmVteS5zd2ltKSBwb3NpdGlvbi5iIC09IDAuMjtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQmFzZSA9IGVuZW15LnRleHR1cmVCYXNlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5hbmltYXRpb24gPSBcInJ1blwiO1xyXG5cdHRoaXMuZW5lbXkgPSBlbmVteTtcclxuXHR0aGlzLnRhcmdldCA9IGZhbHNlO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMjtcclxuXHR0aGlzLmltZ1NwZCA9IDEvNztcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLmh1cnQgPSAwLjA7XHJcblx0dGhpcy50YXJnZXRZID0gcG9zaXRpb24uYjtcclxuXHR0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHR0aGlzLnNsZWVwID0gMDtcclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwLjA7XHJcblx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPSAwO1xyXG5cdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbkVuZW15LnByb3RvdHlwZS5yZWNlaXZlRGFtYWdlID0gZnVuY3Rpb24oZG1nKXtcclxuXHR0aGlzLmh1cnQgPSA1LjA7XHJcblx0XHJcblx0dGhpcy5lbmVteS5ocCAtPSBkbWc7XHJcblx0aWYgKHRoaXMuZW5lbXkuaHAgPD0gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5hZGRFeHBlcmllbmNlKHRoaXMuZW5lbXkuc3RhdHMuZXhwKTtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIga2lsbGVkXCIpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29rRm9yID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAoIXBsYXllci5tb3ZlZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdFxyXG5cdHZhciBkeCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0dmFyIGR6ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcclxuXHRpZiAoIXRoaXMudGFyZ2V0ICYmIChkeCA8PSA0IHx8IGR6IDw9IDQpKXtcclxuXHRcdC8vIENhc3QgYSByYXkgdG93YXJkcyB0aGUgcGxheWVyIHRvIGNoZWNrIGlmIGhlJ3Mgb24gdGhlIHZpc2lvbiBvZiB0aGUgY3JlYXR1cmVcclxuXHRcdHZhciByeCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHRcdHZhciByeSA9IHRoaXMucG9zaXRpb24uYztcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMztcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4zO1xyXG5cdFx0XHJcblx0XHR2YXIgc2VhcmNoID0gMTU7XHJcblx0XHR3aGlsZSAoc2VhcmNoID4gMCl7XHJcblx0XHRcdHJ4ICs9IGR4O1xyXG5cdFx0XHRyeSArPSBkeTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjeCA9IChyeCA8PCAwKTtcclxuXHRcdFx0dmFyIGN5ID0gKHJ5IDw8IDApO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMubWFwTWFuYWdlci5pc1NvbGlkKGN4LCBjeSwgMCkpe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHB4ID0gKHAuYSA8PCAwKTtcclxuXHRcdFx0XHR2YXIgcHkgPSAocC5jIDw8IDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChjeCA9PSBweCAmJiBjeSA9PSBweSl7XHJcblx0XHRcdFx0XHR0aGlzLnRhcmdldCA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRcdFx0XHRzZWFyY2ggPSAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VhcmNoIC09IDE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0cnVlKTtcclxuXHRpZiAodGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgcG9pbnRZIDwgMC4wKSBwb2ludFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcblx0XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gdGhpcy5wb3NpdGlvbi5iKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRCQm94V2FsbE5vcm1hbChmYWtlUG9zLCBzcGQsIDAuMyk7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCB0aGlzKTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgIXRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiB0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYSAtPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmMgLT0gbW92ZW1lbnQuYjtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiAhdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmF0dGFja1BsYXllciA9IGZ1bmN0aW9uKHBsYXllcil7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZSh0aGlzLmVuZW15LnN0YXRzLnN0cik7XHJcblx0dmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdFxyXG5cdC8vIENoZWNrIGlmIHRoZSBwbGF5ZXIgaGFzIHRoZSBwcm90ZWN0aW9uIHNwZWxsXHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnByb3RlY3Rpb24gPiAwKXtcclxuXHRcdGRmcyArPSAxNTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCk7XHJcblx0XHJcblx0aWYgKGRtZyA+IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIgYXR0YWNrcyB4XCIrZG1nKTtcclxuXHRcdHBsYXllci5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2Jsb2NrJyk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDkwO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XHJcblx0dmFyIHAgPSBwbGF5ZXIucG9zaXRpb247XHJcblx0aWYgKHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID4gMCl7XHJcblx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciAtLTtcclxuXHRcdGlmICh0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdFx0dmFyIHl5ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcdFx0aWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0XHR0aGlzLmF0dGFja1BsYXllcihwbGF5ZXIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAodGhpcy50YXJnZXQpe1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCl7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCAtLTtcclxuXHRcdH1cclxuXHRcdGlmICh4eCA8PSAxICYmIHl5IDw9MSl7XHJcblx0XHRcdGlmICh0aGlzLmF0dGFja1dhaXQgPT0gMCl7XHJcblx0XHRcdFx0Ly8gdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIgYXR0YWNrcyFcIik7IFJlbW92ZWQsIHdpbGwgYmUgcmVwbGFjZWQgYnkgYXR0YWNrIGFuaW1hdGlvblxyXG5cdFx0XHRcdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMTA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh4eCA+IDEwIHx8IHl5ID4gMTApe1xyXG5cdFx0XHR0aGlzLnRhcmdldCA9IG51bGw7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGRpciA9IE1hdGguZ2V0QW5nbGUodGhpcy5wb3NpdGlvbiwgcCk7XHJcblx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIpICogMC4wMjtcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4wMjtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdCA9IHZlYzIoTWF0aC5jb3MoZGlyICsgTWF0aC5QSV8yKSwgLU1hdGguc2luKGRpciArIE1hdGguUElfMikpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1vdmVUbyhkeCwgZHksIGxhdCk7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmxvb2tGb3IoKTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZ2V0VGV4dHVyZUNvZGUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBmYWNlID0gdGhpcy5kaXJlY3Rpb247XHJcblx0dmFyIGEgPSB0aGlzLmFuaW1hdGlvbjtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gPT0gXCJzdGFuZFwiKSBhID0gXCJydW5cIjtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlQmFzZSArIFwiX1wiICsgYTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQucGFpbnRJblJlZCA9ICh0aGlzLmh1cnQgPiAwKTtcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLmdldFRleHR1cmVDb2RlKCksdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwKXsgdGhpcy5odXJ0IC09IDE7IH1cclxuXHRpZiAodGhpcy5zbGVlcCA+IDApeyB0aGlzLnNsZWVwIC09IDE7IH1cclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmIChnYW1lLnBhdXNlZCB8fCBnYW1lLnRpbWVTdG9wID4gMCB8fCB0aGlzLnNsZWVwID4gMCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA8PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9ZWxzZSBpZiAodGhpcy50YXJnZXRZID4gdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiArPSAwLjA4O1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA+PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGVuZW1pZXM6IHtcclxuXHRcdGJhdDoge25hbWU6ICdHaWFudCBCYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDQsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmF0OiB7bmFtZTogJ0dpYW50IFJhdCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYXQnLCBzdGF0czoge3N0cjogJzFEOScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c3BpZGVyOiB7bmFtZTogJ0dpYW50IFNwaWRlcicsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdzcGlkZXInLCBzdGF0czoge3N0cjogJzFEMTEnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdyZW1saW46IHtuYW1lOiAnR3JlbWxpbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdncmVtbGluJywgc3RhdHM6IHtzdHI6ICcyRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNrZWxldG9uOiB7bmFtZTogJ1NrZWxldG9uJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3NrZWxldG9uJywgc3RhdHM6IHtzdHI6ICczRDQnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdGhlYWRsZXNzOiB7bmFtZTogJ0hlYWRsZXNzJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2hlYWRsZXNzJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdC8vbml4aWU6IHtuYW1lOiAnTml4aWUnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0d2lzcDoge25hbWU6ICdXaXNwJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ3dpc3AnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdob3N0OiB7bmFtZTogJ0dob3N0JywgaHA6IDgwLCB0ZXh0dXJlQmFzZTogJ2dob3N0Jywgc3RhdHM6IHtzdHI6ICcyRDE1JywgZGZzOiAnMkQyJywgZXhwOiA2LCBmbHk6IHRydWV9fSxcclxuXHRcdHRyb2xsOiB7bmFtZTogJ1Ryb2xsJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3Ryb2xsJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSwgLy8gTm90IHVzZWQgYnkgdGhlIGdlbmVyYXRvcj9cclxuXHRcdGxhdmFMaXphcmQ6IHtuYW1lOiAnTGF2YSBMaXphcmQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbGF2YUxpemFyZCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtb25nYmF0OiB7bmFtZTogJ01vbmdiYXQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbW9uZ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3LCBmbHk6IHRydWV9fSwgXHJcblx0XHRvY3RvcHVzOiB7bmFtZTogJ0dpYW50IFNxdWlkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ29jdG9wdXMnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZGFlbW9uOiB7bmFtZTogJ0RhZW1vbicsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnZGFlbW9uJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdC8vcGhhbnRvbToge25hbWU6ICdQaGFudG9tJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzFEMTUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHNlYVNlcnBlbnQ6IHtuYW1lOiAnU2VhIFNlcnBlbnQnLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ3NlYVNlcnBlbnQnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZXZpbE1hZ2U6IHtuYW1lOiAnRXZpbCBNYWdlJywgaHA6IDE3NiwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICc2RDUnLCBkZnM6ICcyRDInLCBleHA6IDEyfX0sIC8vVE9ETzogQWRkIHRleHR1cmVcclxuXHRcdGxpY2hlOiB7bmFtZTogJ0xpY2hlJywgaHA6IDE5MiwgdGV4dHVyZUJhc2U6ICdsaWNoZScsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxM319LFxyXG5cdFx0aHlkcmE6IHtuYW1lOiAnSHlkcmEnLCBocDogMjA4LCB0ZXh0dXJlQmFzZTogJ2h5ZHJhJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE0fX0sXHJcblx0XHRkcmFnb246IHtuYW1lOiAnRHJhZ29uJywgaHA6IDIyNCwgdGV4dHVyZUJhc2U6ICdkcmFnb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTUsIGZseTogdHJ1ZX19LFx0XHRcdFx0Ly8gTm90IHN1aXRhYmxlXHJcblx0XHR6b3JuOiB7bmFtZTogJ1pvcm4nLCBocDogMjQwLCB0ZXh0dXJlQmFzZTogJ3pvcm4nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdGdhemVyOiB7bmFtZTogJ0dhemVyJywgaHA6IDI0MCwgdGV4dHVyZUJhc2U6ICdnYXplcicsIHN0YXRzOiB7c3RyOiAnNUQ4JywgZGZzOiAnMkQyJywgZXhwOiAxNiwgZmx5OiB0cnVlfX0sXHJcblx0XHRyZWFwZXI6IHtuYW1lOiAnUmVhcGVyJywgaHA6IDI1NSwgdGV4dHVyZUJhc2U6ICdyZWFwZXInLCBzdGF0czoge3N0cjogJzVEOCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdGJhbHJvbjoge25hbWU6ICdCYWxyb24nLCBocDogMjU1LCB0ZXh0dXJlQmFzZTogJ2JhbHJvbicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0Ly90d2lzdGVyOiB7bmFtZTogJ1R3aXN0ZXInLCBocDogMjUsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICc0RDInLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdFxyXG5cdFx0d2Fycmlvcjoge25hbWU6ICdGaWdodGVyJywgaHA6IDk4LCB0ZXh0dXJlQmFzZTogJ2ZpZ2h0ZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0bWFnZToge25hbWU6ICdNYWdlJywgaHA6IDExMiwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdGJhcmQ6IHtuYW1lOiAnQmFyZCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdiYXJkJywgc3RhdHM6IHtzdHI6ICcyRDEwJywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRkcnVpZDoge25hbWU6ICdEcnVpZCcsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdtYWdlJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDEwfX0sXHJcblx0XHR0aW5rZXI6IHtuYW1lOiAnVGlua2VyJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRwYWxhZGluOiB7bmFtZTogJ1BhbGFkaW4nLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ2ZpZ2h0ZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c2hlcGhlcmQ6IHtuYW1lOiAnU2hlcGhlcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICczRDMnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcclxuXHRcdHJhbmdlcjoge25hbWU6ICdSYW5nZXInLCBocDogMTQ0LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiAzfX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEVuZW15OiBmdW5jdGlvbihuYW1lKXtcclxuXHRcdGlmICghdGhpcy5lbmVtaWVzW25hbWVdKSB0aHJvdyBcIkludmFsaWQgZW5lbXkgbmFtZTogXCIgKyBuYW1lO1xyXG5cdFx0XHJcblx0XHR2YXIgZW5lbXkgPSB0aGlzLmVuZW1pZXNbbmFtZV07XHJcblx0XHR2YXIgcmV0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpIGluIGVuZW15KXtcclxuXHRcdFx0cmV0W2ldID0gZW5lbXlbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBJbnZlbnRvcnkobGltaXRJdGVtcyl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJbnZlbnRvcnknKTtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcblx0dGhpcy5saW1pdEl0ZW1zID0gbGltaXRJdGVtcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0ludmVudG9yeScsIEludmVudG9yeSk7XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLml0ZW1zID0gW107XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpZiAodGhpcy5pdGVtcy5sZW5ndGggPT0gdGhpcy5saW1pdEl0ZW1zKXtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5lcXVpcEl0ZW0gPSBmdW5jdGlvbihpdGVtSWQpe1xyXG5cdHZhciB0eXBlID0gdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGU7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXRlbS50eXBlID09IHR5cGUpe1xyXG5cdFx0XHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IHRydWU7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEVxdWlwcGVkSXRlbSA9IGZ1bmN0aW9uKHR5cGUpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlICYmIGl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRyZXR1cm4gaXRlbTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldFdlYXBvbiA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCd3ZWFwb24nKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0QXJtb3VyID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5nZXRFcXVpcHBlZEl0ZW0oJ2FybW91cicpO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kZXN0cm95SXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdGl0ZW0uc3RhdHVzID0gMC4wO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXQgPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXQgPT09IGl0ZW0pe1xyXG5cdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpLCAxKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmRyb3BJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHRpZiAodGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ3dlYXBvbicgfHwgdGhpcy5pdGVtc1tpdGVtSWRdLnR5cGUgPT0gJ2FybW91cicpe1xyXG5cdFx0dGhpcy5pdGVtc1tpdGVtSWRdLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0fVxyXG5cdHRoaXMuaXRlbXMuc3BsaWNlKGl0ZW1JZCwgMSk7XHJcbn07XHJcbiIsInZhciBCaWxsYm9hcmQgPSByZXF1aXJlKCcuL0JpbGxib2FyZCcpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0l0ZW0nLCAnYmlsbGJvYXJkJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdJdGVtJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdGlmIChvYmplY3QuaXRlbSkge1xyXG5cdFx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleFtvYmplY3QuaXRlbS50ZXhdLmJ1ZmZlcnNbb2JqZWN0Lml0ZW0uc3ViSW1nXTtcclxuXHRcdG9iamVjdC50ZXh0dXJlQ29kZSA9IG9iamVjdC5pdGVtLnRleDtcclxuXHR9XHJcbn0pO1x0XHJcblxyXG5mdW5jdGlvbiBJdGVtKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJdGVtJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSXRlbTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnSXRlbScsIEl0ZW0pO1xyXG5cclxuSXRlbS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBpdGVtLCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLml0ZW0gPSBudWxsO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBudWxsO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBudWxsO1xyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHRcclxuXHRpZiAoaXRlbSkgdGhpcy5zZXRJdGVtKGl0ZW0pO1xyXG59O1xyXG5cclxuXHJcbkl0ZW0ucHJvdG90eXBlLnNldEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHR0aGlzLml0ZW0gPSBpdGVtO1xyXG5cdFxyXG5cdHRoaXMuc29saWQgPSBpdGVtLnNvbGlkO1xyXG5cdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0aWYgKHRoaXMuaXRlbS5hbmltYXRpb25MZW5ndGgpeyB0aGlzLmltZ1NwZCA9IDEgLyA2OyB9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4W3RoaXMuaXRlbS50ZXhdLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBpdGVtLnRleDtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbW0gPSB0aGlzLm1hcE1hbmFnZXI7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAodGhpcy5pdGVtLmlzSXRlbSl7XHJcblx0XHRpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2NvZGV4Jyl7XHJcblx0XHRcdC8qbW0uYWRkTWVzc2FnZShcIlRoZSBib3VuZGxlc3Mga25vd25sZWRnZSBvZiB0aGUgQ29kZXggaXMgcmV2ZWFsZWQgdW50byB0aGVlLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkEgdm9pY2UgdGh1bmRlcnMhXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBoYXN0IHByb3ZlbiB0aHlzZWxmIHRvIGJlIHRydWx5IGdvb2QgaW4gbmF0dXJlXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJxdWVzdCBvZiBhIGxpZmV0aW1lLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkF2YXRhcmhvb2QgaXMgYSBsaXZpbmcgZ2lmdCwgSXQgbXVzdCBhbHdheXMgYW5kIGZvcmV2ZXIgYmUgbnVydHVyZWRcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJ0byBmbHVvcmlzaCwgZm9yIGlmIHRob3UgZG9zdCBzdHJheSBmcm9tIHRoZSBwYXRocyBvZiB2aXJ0dWUsIHRoeSB3YXlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJtYXkgYmUgbG9zdCBmb3JldmVyLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlJldHVybiBub3cgdW50byB0aGluZSBvdXIgd29ybGQsIGxpdmUgdGhlcmUgYXMgYW4gZXhhbXBsZSB0byB0aHlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJwZW9wbGUsIGFzIG91ciBtZW1vcnkgb2YgdGh5IGdhbGxhbnQgZGVlZHMgc2VydmVzIHVzLlwiKTsqL1xyXG5cdFx0XHRkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0Z2FtZS5wbGF5ZXIuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0Z2FtZS5lbmRpbmcoKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2ZlYXR1cmUnKXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBzZWUgYSBcIit0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHR9IGVsc2UgaWYgKGdhbWUuYWRkSXRlbSh0aGlzLml0ZW0pKXtcclxuXHRcdFx0dmFyIHN0YXQgPSAnJztcclxuXHRcdFx0aWYgKHRoaXMuaXRlbS5zdGF0dXMgIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRzdGF0ID0gSXRlbUZhY3RvcnkuZ2V0U3RhdHVzTmFtZSh0aGlzLml0ZW0uc3RhdHVzKSArICcgJztcclxuXHRcdFx0XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3UgcGljayB1cCBhIFwiK3N0YXQgKyB0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiWW91IGNhbid0IGNhcnJ5IGFueSBtb3JlIGl0ZW1zXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCl7XHJcblx0XHR2YXIgaW5kID0gKHRoaXMuaW1nSW5kIDw8IDApO1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1tpbmRdO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlcil7XHJcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5pdGVtLmFuaW1hdGlvbkxlbmd0aCA+IDApe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMuaXRlbS5zdWJJbWcgKyB0aGlzLml0ZW0uYW5pbWF0aW9uTGVuZ3RoIC0gMSl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gdGhpcy5pdGVtLnN1YkltZztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGl0ZW1zOiB7XHJcblx0XHQvLyBJdGVtc1xyXG5cdFx0eWVsbG93UG90aW9uOiB7bmFtZTogXCJZZWxsb3cgcG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdHJlZFBvdGlvbjoge25hbWU6IFwiUmVkIFBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRcclxuXHRcdC8vIFdlYXBvbnNcclxuXHRcdC8qXHJcblx0XHQgKiBEYWdnZXJzOiBMb3cgZGFtYWdlLCBsb3cgdmFyaWFuY2UsIEhpZ2ggc3BlZWQsIEQzLCAxNjBETUcgXHJcblx0XHQgKiBTdGF2ZXM6IE1pZCBkYW1hZ2UsIExvdyB2YXJpYW5jZSwgTWlkIHNwZWVkLCBEMywgMjQwRE1HXHJcblx0XHQgKiBNYWNlczogSGlnaCBEYW1hZ2UsIEhpZ2ggVmFyaWFuY2UsIExvdyBzcGVlZCwgRDEyLCAzNjAgRE1HXHJcblx0XHQgKiBBeGVzOiBNaWQgRGFtYWdlLCBMb3cgVmFyaWFuY2UsIExvdyBzcGVlZCwgRDMsIDI0MERNR1xyXG5cdFx0ICogU3dvcmRzOiBNaWQgRGFtYWdlLCBNaWQgdmFyaWFuY2UsIE1pZCBzcGVlZCwgRDYsIDI0MERNR1xyXG5cdFx0ICogXHJcblx0XHQgKiBNeXN0aWMgU3dvcmQ6IE1pZCBEYW1hZ2UsIFJhbmRvbSBEYW1hZ2UsIE1pZCBzcGVlZCwgRDMyIDI1NkRNR1xyXG5cdFx0ICovXHJcblx0XHRkYWdnZXJQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBEYWdnZXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMiwgdmlld1BvcnRJbWc6IDIsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyMEQzJywgd2VhcjogMC4wNX0sXHJcblx0XHRkYWdnZXJGYW5nOiB7bmFtZTogXCJGYW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDMsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0ZGFnZ2VyU3Rpbmc6IHtuYW1lOiBcIlN0aW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDQsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNTBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0XHJcblx0XHRzdGFmZkdhcmdveWxlOiB7bmFtZTogXCJHYXJnb3lsZSBTdGFmZlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA1LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQWdlczoge25hbWU6IFwiU3RhZmYgb2YgQWdlc1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA2LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzgwRDMnLCB3ZWFyOiAwLjAyfSxcclxuXHRcdHN0YWZmQ2FieXJ1czoge25hbWU6IFwiU3RhZmYgb2YgQ2FieXJ1c1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA3LCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwMEQzJywgd2VhcjogMC4wMn0sXHJcblx0XHRcclxuXHRcdG1hY2VCYW5lOiB7bmFtZTogXCJNYWNlIG9mIFVuZGVhZCBCYW5lXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDgsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMjBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdG1hY2VCb25lQ3J1c2hlcjoge25hbWU6IFwiQm9uZSBDcnVzaGVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogOSwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyNUQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZUp1Z2dlcm5hdXQ6IHtuYW1lOiBcIkp1Z2dlcm5hdXQgTWFjZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMCwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICczMEQxMicsIHdlYXI6IDAuMDN9LFxyXG5cdFx0bWFjZVNsYXllcjoge25hbWU6IFwiU2xheWVyIE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTEsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdFxyXG5cdFx0YXhlRHdhcnZpc2g6IHtuYW1lOiBcIkR3YXJ2aXNoIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMiwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgd2VhcjogMC4wMX0sXHJcblx0XHRheGVSdW5lOiB7bmFtZTogXCJSdW5lZCBBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTMsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnODBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0YXhlRGVjZWl2ZXI6IHtuYW1lOiBcIkRlY2VpdmVyIEF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNCwgdmlld1BvcnRJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0XHJcblx0XHRzd29yZEZpcmU6IHtuYW1lOiBcIkZpcmUgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTUsIHZpZXdQb3J0SW1nOiAwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNDBENicsIHdlYXI6IDAuMDA4fSxcclxuXHRcdHN3b3JkQ2hhb3M6IHtuYW1lOiBcIkNoYW9zIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE2LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzQwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZERyYWdvbjoge25hbWU6IFwiRHJhZ29uc2xheWVyIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE3LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzUwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZFF1aWNrOiB7bmFtZTogXCJFbmlsbm8sIHRoZSBRdWlja3N3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE4LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRcclxuXHRcdHNsaW5nRXR0aW46IHtuYW1lOiBcIkV0dGluIFNsaW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE5LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVEMTInLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAncm9jaycsIHdlYXI6IDAuMDR9LFxyXG5cdFx0XHJcblx0XHRib3dQb2lzb246IHtuYW1lOiBcIlBvaXNvbiBCb3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNUQ2JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Fycm93Jywgd2VhcjogMC4wMX0sXHJcblx0XHRib3dTbGVlcDoge25hbWU6IFwiU2xlZXAgQm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIxLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdhcnJvdycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0Ym93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIEJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzIwRDYnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGNyb3NzYm93TWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENyb3NzYm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMzBENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdib2x0Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHR3YW5kTGlnaHRuaW5nOiB7bmFtZTogXCJXYW5kIG9mIExpZ2h0bmluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0d2FuZEZpcmU6IHtuYW1lOiBcIldhbmQgb2YgRmlyZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzYwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0cGhhem9yOiB7bmFtZTogXCJQaGF6b3JcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjYsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdiZWFtJywgd2VhcjogMC4wMX0sXHJcblx0XHRcclxuXHRcdG15c3RpY1N3b3JkOiB7bmFtZTogXCJNeXN0aWMgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzQsIHZpZXdQb3J0SW1nOiA1LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnOEQzMicsIHdlYXI6IDAuMH0sXHJcblx0XHRcclxuXHRcdC8vIEFybW91clxyXG5cdFx0Ly9UT0RPOiBBZGQgYXJtb3IgZGVncmFkYXRpb25cclxuXHRcdGxlYXRoZXJJbXA6IHtuYW1lOiBcIkltcCBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNywgdHlwZTogJ2FybW91cicsIGRmczogJzI1RDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGxlYXRoZXJEcmFnb246IHtuYW1lOiBcIkRyYWdvbiBMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyOCwgdHlwZTogJ2FybW91cicsIGRmczogJzMwRDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGNoYWluTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIENoYWluIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjksIHR5cGU6ICdhcm1vdXInLCBkZnM6ICczNUQ4Jywgd2VhcjogMC4wM30sXHJcblx0XHRjaGFpbkR3YXJ2ZW46IHtuYW1lOiBcIkR3YXJ2ZW4gQ2hhaW4gbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMCwgdHlwZTogJ2FybW91cicsIGRmczogJzQwRDgnLCB3ZWFyOiAwLjAzfSxcclxuXHRcdHBsYXRlTWFnaWM6IHtuYW1lOiBcIk1hZ2ljIFBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzEsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICc0NUQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0cGxhdGVFdGVybml1bToge25hbWU6IFwiRXRlcm5pdW0gUGxhdGUgbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMiwgdHlwZTogJ2FybW91cicsIGRmczogJzUwRDgnLCB3ZWFyOiAwLjAxNX0sXHJcblx0XHRcclxuXHRcdG15c3RpYzoge25hbWU6IFwiTXlzdGljIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzMywgdHlwZTogJ2FybW91cicsIGRmczogJzIwRDgnLCBpbmRlc3RydWN0aWJsZTogdHJ1ZX0sXHJcblx0XHRcclxuXHRcdC8vIFNwZWxsIG1peGVzXHJcblx0XHRjdXJlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBDdXJlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAwLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1fSxcclxuXHRcdGhlYWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEhlYWxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDEwLCBwZXJjZW50OiAwLjJ9LFxyXG5cdFx0bGlnaHQ6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIExpZ2h0XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1LCBsaWdodFRpbWU6IDEwMDB9LFxyXG5cdFx0bWlzc2lsZToge25hbWU6IFwiU3BlbGxtaXggb2YgbWFnaWMgbWlzc2lsZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMzBENScsIG1hbmE6IDV9LFxyXG5cdFx0aWNlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSWNlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNCwgdHlwZTogJ21hZ2ljJywgc3RyOiAnNjVENScsIG1hbmE6IDIwfSxcclxuXHRcdHJlcGVsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBSZXBlbCBVbmRlYWRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDUsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGJsaW5rOiB7bmFtZTogXCJTcGVsbG1peCBvZiBCbGlua1wiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0ZmlyZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEZpcmViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA3LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICcxMDBENScsIG1hbmE6IDE1fSxcclxuXHRcdHByb3RlY3Rpb246IHtuYW1lOiBcIlNwZWxsbWl4IG9mIHByb3RlY3Rpb25cIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdtYWdpYycsIHByb3RUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdHRpbWU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRpbWUgU3RvcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOSwgdHlwZTogJ21hZ2ljJywgc3RvcFRpbWU6IDYwMCwgbWFuYTogMzB9LFxyXG5cdFx0c2xlZXA6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFNsZWVwXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ21hZ2ljJywgc2xlZXBUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdGppbng6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEppbnhcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDExLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHR0cmVtb3I6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRyZW1vclwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdGtpbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEtpbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc0MDBENScsIG1hbmE6IDI1fSxcclxuXHRcdFxyXG5cdFx0Ly8gQ29kZXhcclxuXHRcdGNvZGV4OiB7bmFtZTogXCJDb2RleCBvZiBVbHRpbWF0ZSBXaXNkb21cIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdjb2RleCd9LFxyXG5cdFx0XHJcblx0XHQvLyBEdW5nZW9uIGZlYXR1cmVzXHJcblx0XHRvcmI6IHtuYW1lOiBcIk9yYlwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRkZWFkVHJlZToge25hbWU6IFwiRGVhZCBUcmVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHRyZWU6IHtuYW1lOiBcIlRyZWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDMsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c3RhdHVlOiB7bmFtZTogXCJTdGF0dWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDQsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c2lnblBvc3Q6IHtuYW1lOiBcIlNpZ25wb3N0XCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA1LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHdlbGw6IHtuYW1lOiBcIldlbGxcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDYsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0c21hbGxTaWduOiB7bmFtZTogXCJTaWduXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA3LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGxhbXA6IHtuYW1lOiBcIkxhbXBcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0ZmxhbWU6IHtuYW1lOiBcIkZsYW1lXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA5LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGNhbXBmaXJlOiB7bmFtZTogXCJDYW1wZmlyZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTAsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0YWx0YXI6IHtuYW1lOiBcIkFsdGFyXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRwcmlzb25lclRoaW5nOiB7bmFtZTogXCJTdG9ja3NcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGZvdW50YWluOiB7bmFtZTogXCJGb3VudGFpblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTMsIGFuaW1hdGlvbkxlbmd0aDogNCwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEl0ZW1CeUNvZGU6IGZ1bmN0aW9uKGl0ZW1Db2RlLCBzdGF0dXMpe1xyXG5cdFx0aWYgKCF0aGlzLml0ZW1zW2l0ZW1Db2RlXSkgdGhyb3cgXCJJbnZhbGlkIEl0ZW0gY29kZTogXCIgKyBpdGVtQ29kZTtcclxuXHRcdFxyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2l0ZW1Db2RlXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKCl7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZU1hcCA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTsgXHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVUZXJyYWluID0gZnVuY3Rpb24obWFwTWFuYWdlciwgR0wpe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9ICBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBNYW5hZ2VyLCBHTCk7IFxyXG5cdHRoaXMuYXNzZW1ibGVDZWlscyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUJsb2NrcyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZVNsb3BlcyhtYXBNYW5hZ2VyLCBHTCk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZVRpbGVzID0gZnVuY3Rpb24odGlsZXMpe1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0aWYgKHRpbGVzW2ldKVxyXG5cdFx0XHR0aWxlc1tpXS5fYyA9IGNpcmN1bGFyLnNldFNhZmUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmdldEVtcHR5R3JpZCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdyaWQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTA7eTw2NDt5Kyspe1xyXG5cdFx0Z3JpZFt5XSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgeD0wO3g8NjQ7eCsrKXtcclxuXHRcdFx0Z3JpZFt5XVt4XSA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBncmlkO1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5jb3B5VGlsZSA9IGZ1bmN0aW9uKHRpbGUpe1xyXG5cdHZhciByZXQgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0fTtcclxuXHRcclxuXHRmb3IgKHZhciBpIGluIHRpbGUpe1xyXG5cdFx0cmV0W2ldID0gdGlsZVtpXTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVGbG9vciA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9GbG9vcnMgPSBbXTtcclxuXHR2YXIgZmxvb3JzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuZil7XHJcblx0XHRcdFx0dmFyIGluZCA9IGZsb29yc0luZC5pbmRleE9mKHRpbGUuZik7XHJcblx0XHRcdFx0dmFyIGZsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Zmxvb3JzSW5kLnB1c2godGlsZS5mKTtcclxuXHRcdFx0XHRcdGZsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGZsLnRpbGUgPSB0aWxlLmY7XHJcblx0XHRcdFx0XHRmbC5yVGlsZSA9IHRpbGUucmY7XHJcblx0XHRcdFx0XHRvRmxvb3JzLnB1c2goZmwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0ZmwgPSBvRmxvb3JzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRmbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmYsIHk6IHl5fTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvRmxvb3JzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGZsb29yM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9GbG9vcnNbaV0sIFwiRlwiLCBHTCk7XHJcblx0XHRmbG9vcjNELnRleEluZCA9IG9GbG9vcnNbaV0udGlsZTtcclxuXHRcdGZsb29yM0QuclRleEluZCA9IG9GbG9vcnNbaV0uclRpbGU7XHJcblx0XHRmbG9vcjNELnR5cGUgPSBcIkZcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChmbG9vcjNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQ2VpbHMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQ2VpbHMgPSBbXTtcclxuXHR2YXIgY2VpbHNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5jKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gY2VpbHNJbmQuaW5kZXhPZih0aWxlLmMpO1xyXG5cdFx0XHRcdHZhciBjbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGNlaWxzSW5kLnB1c2godGlsZS5jKTtcclxuXHRcdFx0XHRcdGNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGNsLnRpbGUgPSB0aWxlLmM7XHJcblx0XHRcdFx0XHRvQ2VpbHMucHVzaChjbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjbCA9IG9DZWlsc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmMsIHk6IHRpbGUuY2h9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9DZWlscy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBjZWlsM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9DZWlsc1tpXSwgXCJDXCIsIEdMKTtcclxuXHRcdGNlaWwzRC50ZXhJbmQgPSBvQ2VpbHNbaV0udGlsZTtcclxuXHRcdGNlaWwzRC50eXBlID0gXCJDXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goY2VpbDNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQmxvY2tzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Jsb2NrcyA9IFtdO1xyXG5cdHZhciBibG9ja3NJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS53KXtcclxuXHRcdFx0XHR2YXIgaW5kID0gYmxvY2tzSW5kLmluZGV4T2YodGlsZS53KTtcclxuXHRcdFx0XHR2YXIgd2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRibG9ja3NJbmQucHVzaCh0aWxlLncpO1xyXG5cdFx0XHRcdFx0d2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0d2wudGlsZSA9IHRpbGUudztcclxuXHRcdFx0XHRcdG9CbG9ja3MucHVzaCh3bCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR3bCA9IG9CbG9ja3NbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2xbeV1beF0gPSB7dGlsZTogdGlsZS53LCB5OiB0aWxlLnksIGg6IHRpbGUuaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Jsb2Nrcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBibG9jazNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQmxvY2tzW2ldLCBcIkJcIiwgR0wpO1xyXG5cdFx0YmxvY2szRC50ZXhJbmQgPSBvQmxvY2tzW2ldLnRpbGU7XHJcblx0XHRibG9jazNELnR5cGUgPSBcIkJcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChibG9jazNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlU2xvcGVzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb1Nsb3BlcyA9IFtdO1xyXG5cdHZhciBzbG9wZXNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5zbCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IHNsb3Blc0luZC5pbmRleE9mKHRpbGUuc2wpO1xyXG5cdFx0XHRcdHZhciBzbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdHNsb3Blc0luZC5wdXNoKHRpbGUuc2wpO1xyXG5cdFx0XHRcdFx0c2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0c2wudGlsZSA9IHRpbGUuc2w7XHJcblx0XHRcdFx0XHRvU2xvcGVzLnB1c2goc2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2wgPSBvU2xvcGVzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRzbFt5XVt4XSA9IHt0aWxlOiB0aWxlLnNsLCB5OiB5eSwgZGlyOiB0aWxlLmRpcn07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b1Nsb3Blcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBzbG9wZTNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvU2xvcGVzW2ldLCBcIlNcIiwgR0wpO1xyXG5cdFx0c2xvcGUzRC50ZXhJbmQgPSBvU2xvcGVzW2ldLnRpbGU7XHJcblx0XHRzbG9wZTNELnR5cGUgPSBcIlNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChzbG9wZTNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlTWFwID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beF0gIT0gMCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS50aWxlc1tpbmRdO1xyXG5cdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mICYmIHRpbGUuZiA+IDEwMCl7XHJcblx0XHRcdFx0XHR0aWxlLnJmID0gdGlsZS5mIC0gMTAwO1xyXG5cdFx0XHRcdFx0dGlsZS5pc1dhdGVyID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGlsZS55ID0gLTAuMjtcclxuXHRcdFx0XHRcdHRpbGUuZnkgPSAtMC4yO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mIDwgMTAwKXtcclxuXHRcdFx0XHRcdHZhciB0MSwgdDIsIHQzLCB0NDtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4KzFdKSB0MSA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3ldW3grMV1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ktMV0pIHQyID0gKG1hcERhdGEubWFwW3ktMV1beF0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beC0xXSkgdDMgPSAobWFwRGF0YS5tYXBbeV1beC0xXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5KzFdKSB0NCA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3krMV1beF1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAodDEgfHwgdDIgfHwgdDMgfHwgdDQpe1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jb3BpZWRUaWxlc1tpbmRdKXtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5jb3BpZWRUaWxlc1tpbmRdID0gdGhpcy5jb3B5VGlsZSh0aWxlKTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHR0aWxlLnkgPSAtMTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlLmggKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXRpbGUudyl7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLncgPSAxMDtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUuaCA9IDE7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU9iamVjdHMgPSBmdW5jdGlvbihtYXBEYXRhKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1hcERhdGEub2JqZWN0cy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBvID0gbWFwRGF0YS5vYmplY3RzW2ldO1xyXG5cdFx0dmFyIHggPSBvLng7XHJcblx0XHR2YXIgeSA9IG8ueTtcclxuXHRcdHZhciB6ID0gby56O1xyXG5cdFx0XHJcblx0XHRzd2l0Y2ggKG8udHlwZSl7XHJcblx0XHRcdGNhc2UgXCJwbGF5ZXJcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIuaW5pdCh2ZWMzKHgsIHksIHopLCB2ZWMzKDAuMCwgby5kaXIgKiBNYXRoLlBJXzIsIDAuMCksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiaXRlbVwiOlxyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBNYXRoLm1pbigwLjMgKyAoTWF0aC5yYW5kb20oKSAqIDAuNyksIDEuMCk7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKG8uaXRlbSwgc3RhdHVzKTtcclxuXHRcdFx0XHR2YXIgaXRlbU9iamVjdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRcdFx0aXRlbU9iamVjdC5pbml0KHZlYzMoeCwgeSwgeiksIGl0ZW0sIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGl0ZW1PYmplY3QpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVuZW15XCI6XHJcblx0XHRcdFx0dmFyIGVuZW15ID0gRW5lbXlGYWN0b3J5LmdldEVuZW15KG8uZW5lbXkpO1xyXG5cdFx0XHRcdHZhciBlbmVteU9iamVjdCA9IG5ldyBFbmVteSgpO1xyXG5cdFx0XHRcdGVuZW15T2JqZWN0LmluaXQodmVjMyh4LCB5LCB6KSwgZW5lbXksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGVuZW15T2JqZWN0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdGFpcnNcIjpcclxuXHRcdFx0XHR2YXIgc3RhaXJzT2JqID0gbmV3IFN0YWlycygpO1xyXG5cdFx0XHRcdHN0YWlyc09iai5pbml0KHZlYzMoeCwgeSwgeiksIHRoaXMubWFwTWFuYWdlciwgby5kaXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChzdGFpcnNPYmopO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JcIjpcclxuXHRcdFx0XHR2YXIgeHggPSAoeCA8PCAwKSAtICgoby5kaXIgPT0gXCJIXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHp6ID0gKHogPDwgMCkgLSAoKG8uZGlyID09IFwiVlwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbenpdW3h4XS53O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5kb29ycy5wdXNoKG5ldyBEb29yKHRoaXMubWFwTWFuYWdlciwgdmVjMyh4LCB5LCB6KSwgby5kaXIsIFwiZG9vcjFcIiwgdGlsZSkpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07IiwidmFyIE1hcEFzc2VtYmxlciA9IHJlcXVpcmUoJy4vTWFwQXNzZW1ibGVyJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdnYW1lJyk7XHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdtYXBUb0RyYXcnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ01hcE1hbmFnZXInLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5nYW1lID0gZ2FtZTtcclxuXHR2YXIgR0wgPSBnYW1lLkdMLmN0eDtcclxuXHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdG9iamVjdC5tYXBUb0RyYXcgPSBbXTtcclxuXHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVUZXJyYWluKG9iamVjdCwgR0wpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01hcE1hbmFnZXInKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBNYW5hZ2VyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdNYXBNYW5hZ2VyJywgTWFwTWFuYWdlcik7XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZW5lcmF0ZU1hcCA9IGZ1bmN0aW9uKGRlcHRoKXtcclxuXHR2YXIgY29uZmlnID0ge1xyXG5cdFx0TUlOX1dJRFRIOiAxMCxcclxuXHRcdE1JTl9IRUlHSFQ6IDEwLFxyXG5cdFx0TUFYX1dJRFRIOiAyMCxcclxuXHRcdE1BWF9IRUlHSFQ6IDIwLFxyXG5cdFx0TEVWRUxfV0lEVEg6IDY0LFxyXG5cdFx0TEVWRUxfSEVJR0hUOiA2NCxcclxuXHRcdFNVQkRJVklTSU9OX0RFUFRIOiAzLFxyXG5cdFx0U0xJQ0VfUkFOR0VfU1RBUlQ6IDMvOCxcclxuXHRcdFNMSUNFX1JBTkdFX0VORDogNS84LFxyXG5cdFx0UklWRVJfU0VHTUVOVF9MRU5HVEg6IDEwLFxyXG5cdFx0TUlOX1JJVkVSX1NFR01FTlRTOiAxMCxcclxuXHRcdE1BWF9SSVZFUl9TRUdNRU5UUzogMjAsXHJcblx0XHRNSU5fUklWRVJTOiAzLFxyXG5cdFx0TUFYX1JJVkVSUzogNVxyXG5cdH07XHJcblx0dmFyIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IoY29uZmlnKTtcclxuXHR2YXIga3JhbWdpbmVFeHBvcnRlciA9IG5ldyBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyk7XHJcblx0dmFyIGdlbmVyYXRlZExldmVsID0gZ2VuZXJhdG9yLmdlbmVyYXRlTGV2ZWwoZGVwdGgsIHRoaXMuZ2FtZS51bmlxdWVSZWdpc3RyeSk7XHJcblx0XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHRyeXtcclxuXHRcdHdpbmRvdy5nZW5lcmF0ZWRMZXZlbCA9IChnZW5lcmF0ZWRMZXZlbC5sZXZlbCk7XHJcblx0XHR2YXIgbWFwRGF0YSA9IGtyYW1naW5lRXhwb3J0ZXIuZ2V0TGV2ZWwoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0d2luZG93Lm1hcERhdGEgPSAobWFwRGF0YSk7XHJcblx0XHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdFx0bWFwQXNzZW1ibGVyLmFzc2VtYmxlTWFwKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdH1jYXRjaCAoZSl7XHJcblx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHR9XHJcblx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcE5hbWUpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRodHRwLm9wZW4oJ0dFVCcsIGNwICsgJ21hcHMvJyArIG1hcE5hbWUgKyBcIi5qc29uXCIsIHRydWUpO1xyXG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgXHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICBcdFx0XHR0cnl7XHJcblx0XHRcdFx0bWFwRGF0YSA9IEpTT04ucGFyc2UoaHR0cC5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBtYXBBc3NlbWJsZXIgPSBuZXcgTWFwQXNzZW1ibGVyKCk7XHJcblx0XHRcdFx0bWFwQXNzZW1ibGVyLmFzc2VtYmxlTWFwKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcE0ubWFwID0gbWFwRGF0YS5tYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwTS53YXRlclRpbGVzID0gWzEwMSwgMTAzXTtcclxuXHRcdFx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdFx0XHR9Y2F0Y2ggKGUpe1xyXG5cdFx0XHRcdGlmIChlLm1lc3NhZ2Upe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlLnN0YWNrKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG1hcE0ubWFwID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9O1xyXG5cdGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIpO1xyXG5cdGh0dHAuc2VuZCgpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNXYXRlclRpbGUgPSBmdW5jdGlvbih0aWxlSWQpe1xyXG5cdHJldHVybiAodGhpcy53YXRlclRpbGVzLmluZGV4T2YodGlsZUlkKSAhPSAtMSk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1dhdGVyUG9zaXRpb24gPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC5mKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMuaXNXYXRlclRpbGUodC5mKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzTGF2YVBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQuZikgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLmlzTGF2YVRpbGUodC5mKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzTGF2YVRpbGUgPSBmdW5jdGlvbih0aWxlSWQpe1xyXG5cdHJldHVybiB0aWxlSWQgPT0gMTAzO1xyXG59O1xyXG5cclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmNoYW5nZVdhbGxUZXh0dXJlID0gZnVuY3Rpb24oeCwgeiwgdGV4dHVyZUlkKXtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciBiYXNlID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCFiYXNlLmNsb25lZCl7XHJcblx0XHR2YXIgbmV3VyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSBpbiBiYXNlKXtcclxuXHRcdFx0bmV3V1tpXSA9IGJhc2VbaV07XHJcblx0XHR9XHJcblx0XHRuZXdXLmNsb25lZCA9IHRydWU7XHJcblx0XHR0aGlzLm1hcFt6XVt4XSA9IG5ld1c7XHJcblx0XHRiYXNlID0gbmV3VztcclxuXHR9XHJcblx0XHJcblx0YmFzZS53ID0gdGV4dHVyZUlkO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0RG9vckF0ID0gZnVuY3Rpb24oeCwgeSwgeil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGRvb3IgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0aWYgKGRvb3Iud2FsbFBvc2l0aW9uLmVxdWFscyh4LCB5LCB6KSkgcmV0dXJuIGRvb3I7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VBdCA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmVxdWFscyhwb3NpdGlvbikpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VBdEdyaWQgPSBmdW5jdGlvbihwb3NpdGlvbil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5kZXN0cm95ZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IE1hdGguZmxvb3IodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeiA9IE1hdGguZmxvb3IodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4ID09IHBvc2l0aW9uLmEgJiYgeiA9PSBwb3NpdGlvbi5jKXtcclxuXHRcdFx0cmV0dXJuICh0aGlzLmluc3RhbmNlc1tpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0TmVhcmVzdENsZWFuSXRlbVRpbGUgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0XHJcblx0dmFyIG1pblggPSB4IC0gMTtcclxuXHR2YXIgbWluWiA9IHogLSAxO1xyXG5cdHZhciBtYXhYID0geCArIDE7XHJcblx0dmFyIG1heFogPSB6ICsgMTtcclxuXHRcclxuXHRmb3IgKHZhciB6ej1taW5aO3p6PD1tYXhaO3p6Kyspe1xyXG5cdFx0Zm9yICh2YXIgeHg9bWluWDt4eDw9bWF4WDt4eCsrKXtcclxuXHRcdFx0aWYgKHRoaXMuaXNTb2xpZCh4eCwgenosIDApIHx8IHRoaXMuaXNXYXRlclBvc2l0aW9uKHh4LCB6eikpe1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgcG9zID0gdmVjMyh4eCwgMCwgenopO1xyXG5cdFx0XHR2YXIgaW5zID0gdGhpcy5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRpZiAoIWlucyB8fCAoIWlucy5pdGVtICYmICFpbnMuc3RhaXJzKSl7XHJcblx0XHRcdFx0cmV0dXJuIHBvcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc05lYXJlc3QgPSBmdW5jdGlvbihwb3NpdGlvbiwgZGlzdGFuY2UsIGhhc1Byb3BlcnR5KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5kZXN0cm95ZWQpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGhhc1Byb3BlcnR5ICYmICF0aGlzLmluc3RhbmNlc1tpXVtoYXNQcm9wZXJ0eV0pIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IE1hdGguYWJzKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEgLSBwb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6ID0gTWF0aC5hYnModGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYyAtIHBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA8PSBkaXN0YW5jZSAmJiB6IDw9IGRpc3RhbmNlKXtcclxuXHRcdFx0cmV0LnB1c2godGhpcy5pbnN0YW5jZXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIHNlbGYpe1xyXG5cdHZhciBwID0gcG9zLmNsb25lKCk7XHJcblx0cC5hID0gcC5hICsgc3BkLmE7XHJcblx0cC5jID0gcC5jICsgc3BkLmI7XHJcblx0XHJcblx0dmFyIGluc3QgPSBudWxsLCBob3I7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdGlmICghaW5zIHx8IGlucy5kZXN0cm95ZWQgfHwgIWlucy5zb2xpZCkgY29udGludWU7XHJcblx0XHRpZiAoaW5zID09PSBzZWxmKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSBwLmEpO1xyXG5cdFx0dmFyIHp6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSBwLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPD0gMC44ICYmIHp6IDw9IDAuOCl7XHJcblx0XHRcdGlmIChwb3MuYSA8PSBpbnMucG9zaXRpb24uYSAtIDAuOCB8fCBwb3MuYSA+PSBpbnMucG9zaXRpb24uYSArIDAuOCkgaG9yID0gdHJ1ZTtcclxuXHRcdFx0ZWxzZSBpZiAocG9zLmMgPD0gaW5zLnBvc2l0aW9uLmMgLSAwLjggfHwgcG9zLmMgPj0gaW5zLnBvc2l0aW9uLmMgKyAwLjgpIGhvciA9IGZhbHNlOyAgXHJcblx0XHRcdGluc3QgPSBpbnM7XHJcblx0XHRcdGkgPSBsZW47XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGlmICghaW5zdCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0aWYgKGluc3QuaGVpZ2h0KXtcclxuXHRcdGlmIChwb3MuYiArIGggPCBpbnN0LnBvc2l0aW9uLmIpIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKHBvcy5iID49IGluc3QucG9zaXRpb24uYiArIGluc3QuaGVpZ2h0KSByZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0aWYgKGhvcikgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDtcclxuXHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUud2FsbEhhc05vcm1hbCA9IGZ1bmN0aW9uKHgsIHksIG5vcm1hbCl7XHJcblx0dmFyIHQxID0gdGhpcy5tYXBbeV1beF07XHJcblx0c3dpdGNoIChub3JtYWwpe1xyXG5cdFx0Y2FzZSAndSc6IHkgLT0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdsJzogeCAtPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ2QnOiB5ICs9IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAncic6IHggKz0gMTsgYnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdGlmICghdGhpcy5tYXBbeV0pIHJldHVybiB0cnVlO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiB0cnVlO1xyXG5cdHZhciB0MiA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdFxyXG5cdGlmICghdDIudykgcmV0dXJuIHRydWU7XHJcblx0aWYgKHQyLncgJiYgISh0Mi55ID09IHQxLnkgJiYgdDIuaCA9PSB0MS5oKSl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0RG9vck5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgZG9vciA9IHRoaXMuZ2V0RG9vckF0KHh4LCB5LCB6eik7XHJcblx0aWYgKGRvb3Ipe1xyXG5cdFx0dmFyIHh4eCA9IChwb3MuYSArIHNwZC5hKSAtIHh4O1xyXG5cdFx0dmFyIHp6eiA9IChwb3MuYyArIHNwZC5iKSAtIHp6O1xyXG5cdFx0XHJcblx0XHR2YXIgeCA9IChwb3MuYSAtIHh4KTtcclxuXHRcdHZhciB6ID0gKHBvcy5jIC0genopO1xyXG5cdFx0aWYgKGRvb3IuZGlyID09IFwiVlwiKXtcclxuXHRcdFx0aWYgKGRvb3IgJiYgZG9vci5pc1NvbGlkKCkpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0aWYgKHp6eiA+IDAuMjUgJiYgenp6IDwgMC43NSkgcmV0dXJuIG51bGw7XHJcblx0XHRcdGlmICh4IDwgMCB8fCB4ID4gMSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRlbHNlIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0aWYgKGRvb3IgJiYgZG9vci5pc1NvbGlkKCkpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdGlmICh4eHggPiAwLjI1ICYmIHh4eCA8IDAuNzUpIHJldHVybiBudWxsO1xyXG5cdFx0XHRpZiAoeiA8IDAgfHwgeiA+IDEpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdGVsc2UgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzU29saWQgPSBmdW5jdGlvbih4LCB6LCB5KXtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRpZiAoeSAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdGlmICh0LnkgKyB0LmggPD0geSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmNoZWNrQm94Q29sbGlzaW9uID0gZnVuY3Rpb24oYm94MSwgYm94Mil7XHJcblx0aWYgKGJveDEueDIgPCBib3gyLngxIHx8IGJveDEueDEgPiBib3gyLngyIHx8IGJveDEuejIgPCBib3gyLnoxIHx8IGJveDEuejEgPiBib3gyLnoyKXtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRCQm94V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBiV2lkdGgpe1xyXG5cdHZhciB4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgeiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgYkJveCA9IHtcclxuXHRcdHgxOiBwb3MuYSArIHNwZC5hIC0gYldpZHRoLFxyXG5cdFx0ejE6IHBvcy5jICsgc3BkLmIgLSBiV2lkdGgsXHJcblx0XHR4MjogcG9zLmEgKyBzcGQuYSArIGJXaWR0aCxcclxuXHRcdHoyOiBwb3MuYyArIHNwZC5iICsgYldpZHRoXHJcblx0fTtcclxuXHRcclxuXHR2YXIgeG0gPSB4IC0gMTtcclxuXHR2YXIgem0gPSB6IC0gMTtcclxuXHR2YXIgeE0gPSB4bSArIDM7XHJcblx0dmFyIHpNID0gem0gKyAzO1xyXG5cdFxyXG5cdHZhciB0O1xyXG5cdGZvciAodmFyIHp6PXptO3p6PHpNO3p6Kyspe1xyXG5cdFx0Zm9yICh2YXIgeHg9eG07eHg8eE07eHgrKyl7XHJcblx0XHRcdGlmICghdGhpcy5tYXBbenpdKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblx0XHRcdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSBjb250aW51ZTtcclxuXHRcdFx0XHJcblx0XHRcdHQgPSB0aGlzLm1hcFt6el1beHhdO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodC55K3QuaCA8PSB5KSBjb250aW51ZTtcclxuXHRcdFx0ZWxzZSBpZiAodC55ID4geSArIDAuNSkgY29udGludWU7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgYm94ID0ge1xyXG5cdFx0XHRcdHgxOiB4eCxcclxuXHRcdFx0XHR6MTogenosXHJcblx0XHRcdFx0eDI6IHh4ICsgMSxcclxuXHRcdFx0XHR6MjogenogKyAxXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5jaGVja0JveENvbGxpc2lvbihiQm94LCBib3gpKXtcclxuXHRcdFx0XHR2YXIgeHh4ID0gcG9zLmEgLSB4eDtcclxuXHRcdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgblYgPSB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAndScpIHx8IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdkJyk7XHJcblx0XHRcdFx0dmFyIG5IID0gdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3InKSB8fCB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh6enogPj0gLWJXaWR0aCAmJiB6enogPCAxICsgYldpZHRoICYmIG5IKXtcclxuXHRcdFx0XHRcdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHh4eCA+PSAtYldpZHRoICYmIHh4eCA8IDEgKyBiV2lkdGggJiYgblYpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRXYWxsTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIGluV2F0ZXIpe1xyXG5cdHZhciB0LCB0aDtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciB4eCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHp6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHRcclxuXHRpZiAoIXRoaXMubWFwW3p6XSkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHRoaXMubWFwW3p6XVt4eF0gPT09IDApIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHQgPSB0aGlzLm1hcFt6el1beHhdO1xyXG5cdGkgPSA0O1xyXG5cdFxyXG5cdGlmICghdCkgcmV0dXJuIG51bGw7XHJcblx0XHJcblx0dGggPSB0LmggLSAwLjM7XHJcblx0aWYgKGluV2F0ZXIpIHkgKz0gMC4zO1xyXG5cdGlmICh0LnNsKSB0aCArPSAwLjI7XHJcblx0XHJcblx0aWYgKCF0LncgJiYgIXQuZHcgJiYgIXQud2QpIHJldHVybiBudWxsO1xyXG5cdGlmICh0LnkrdGggPD0geSkgcmV0dXJuIG51bGw7XHJcblx0ZWxzZSBpZiAodC55ID4geSArIGgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdGlmICghdCkgcmV0dXJuIG51bGw7XHJcblx0aWYgKHQudyl7XHJcblx0XHR2YXIgdGV4ID0gdGhpcy5nYW1lLmdldFRleHR1cmVCeUlkKHQudywgXCJ3YWxsXCIpO1xyXG5cdFx0aWYgKHRleC5pc1NvbGlkKXtcclxuXHRcdFx0dmFyIHh4eCA9IHBvcy5hIC0geHg7XHJcblx0XHRcdHZhciB6enogPSBwb3MuYyAtIHp6O1xyXG5cdFx0XHRpZiAodGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3UnKSAmJiB6enogPD0gMCl7IHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdkJykgJiYgenp6ID49IDEpeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmRvd247IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdsJykgJiYgeHh4IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7IH1cclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdyJykgJiYgeHh4ID49IDEpeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnJpZ2h0OyB9XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKHQuZHcpe1xyXG5cdFx0dmFyIHgsIHosIHh4eCwgenp6LCBub3JtYWw7XHJcblx0XHR4ID0gcG9zLmEgKyBzcGQuYTtcclxuXHRcdHogPSBwb3MuYyArIHNwZC5iO1xyXG5cdFx0XHJcblx0XHRpZiAodC5hdyA9PSAwKXsgeHh4ID0gKHh4ICsgMSkgLSB4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBMZWZ0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDEpeyB4eHggPSB4IC0geHg7IHp6eiA9ICB6IC0geno7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy51cFJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDIpeyB4eHggPSB4IC0geHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duUmlnaHQ7IH1cclxuXHRcdGVsc2UgaWYgKHQuYXcgPT0gMyl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gICh6eiArIDEpIC0gejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmRvd25MZWZ0OyB9XHJcblx0XHRpZiAoenp6ID49IHh4eCl7XHJcblx0XHRcdHJldHVybiBub3JtYWw7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0WUZsb29yID0gZnVuY3Rpb24oeCwgeSwgbm9XYXRlcil7XHJcblx0dmFyIGlucyA9IHRoaXMuZ2V0SW5zdGFuY2VBdEdyaWQodmVjMyh4PDwwLDAseTw8MCkpO1xyXG5cdGlmIChpbnMgIT0gbnVsbCAmJiBpbnMuaGVpZ2h0KXtcclxuXHRcdHJldHVybiBpbnMucG9zaXRpb24uYiArIGlucy5oZWlnaHQ7XHJcblx0fVxyXG5cdFxyXG5cdHZhciB4eCA9IHggLSAoeCA8PCAwKTtcclxuXHR2YXIgeXkgPSB5IC0gKHkgPDwgMCk7XHJcblx0eCA9IHggPDwgMDtcclxuXHR5ID0geSA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbeV0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHR2YXIgdHQgPSB0Lnk7XHJcblx0XHJcblx0aWYgKHQudykgdHQgKz0gdC5oO1xyXG5cdGlmICh0LmYpIHR0ID0gdC5meTtcclxuXHRcclxuXHRpZiAoIW5vV2F0ZXIgJiYgdGhpcy5pc1dhdGVyVGlsZSh0LmYpKSB0dCAtPSAwLjM7XHJcblx0XHJcblx0aWYgKHQuc2wpe1xyXG5cdFx0aWYgKHQuZGlyID09IDApIHR0ICs9IHl5ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMSkgdHQgKz0geHggKiAwLjU7IGVsc2VcclxuXHRcdGlmICh0LmRpciA9PSAyKSB0dCArPSAoMS4wIC0geXkpICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMykgdHQgKz0gKDEuMCAtIHh4KSAqIDAuNTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHR0O1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZHJhd01hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHgsIHk7XHJcblx0eCA9IHRoaXMucGxheWVyLnBvc2l0aW9uLmE7XHJcblx0eSA9IHRoaXMucGxheWVyLnBvc2l0aW9uLmM7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm1hcFRvRHJhdy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBtdGQgPSB0aGlzLm1hcFRvRHJhd1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPCBtdGQuYm91bmRhcmllc1swXSB8fCB4ID4gbXRkLmJvdW5kYXJpZXNbMl0gfHwgeSA8IG10ZC5ib3VuZGFyaWVzWzFdIHx8IHkgPiBtdGQuYm91bmRhcmllc1szXSlcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHRcclxuXHRcdGlmIChtdGQudHlwZSA9PSBcIkJcIil7IC8vIEJsb2Nrc1xyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd0Jsb2NrKG10ZCwgbXRkLnRleEluZCk7XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJGXCIpeyAvLyBGbG9vcnNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0aWYgKHRoaXMuaXNXYXRlclRpbGUodHQpKXsgXHJcblx0XHRcdFx0dHQgPSAobXRkLnJUZXhJbmQpICsgKHRoaXMud2F0ZXJGcmFtZSA8PCAwKTtcclxuXHRcdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICd3YXRlcicpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICdmbG9vcicpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJDXCIpeyAvLyBDZWlsc1xyXG5cdFx0XHR2YXIgdHQgPSBtdGQudGV4SW5kO1xyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd0Zsb29yKG10ZCwgdHQsICdjZWlsJyk7XHJcblx0XHR9ZWxzZSBpZiAobXRkLnR5cGUgPT0gXCJTXCIpeyAvLyBTbG9wZVxyXG5cdFx0XHR0aGlzLmdhbWUuZHJhd1Nsb3BlKG10ZCwgbXRkLnRleEluZCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0UGxheWVySXRlbSA9IGZ1bmN0aW9uKGl0ZW1Db2RlKXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmIChpbnZbaV0uY29kZSA9PSBpdGVtQ29kZSl7XHJcblx0XHRcdHJldHVybiBpbnZbaV07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlUGxheWVySXRlbSA9IGZ1bmN0aW9uKGl0ZW1Db2RlLCBhbW91bnQpe1xyXG5cdHZhciBpbnYgPSB0aGlzLmdhbWUuaW52ZW50b3J5Lml0ZW1zO1xyXG5cdGZvciAodmFyIGk9MCxsZW49aW52Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ID0gaW52W2ldO1xyXG5cdFx0aWYgKGl0LmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRpZiAoLS1pdC5hbW91bnQgPT0gMCl7XHJcblx0XHRcdFx0aW52LnNwbGljZShpLDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuYWRkTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpe1xyXG5cdHRoaXMuZ2FtZS5jb25zb2xlLmFkZFNGTWVzc2FnZSh0ZXh0KTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUudGltZVN0b3ApIHJldHVybjtcclxuXHRcclxuXHR0aGlzLndhdGVyRnJhbWUgKz0gMC4xO1xyXG5cdGlmICh0aGlzLndhdGVyRnJhbWUgPj0gMikgdGhpcy53YXRlckZyYW1lID0gMDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc1RvRHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5vcmRlckluc3RhbmNlcyA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRpZiAoaW5zLmRlc3Ryb3llZCl7XHJcblx0XHRcdHRoaXMuaW5zdGFuY2VzLnNwbGljZShpLCAxKTtcclxuXHRcdFx0aS0tO1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIGRpc3QgPSB4eCAqIHh4ICsgenogKiB6ejtcclxuXHRcdHZhciBhZGRlZCA9IGZhbHNlO1xyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49dGhpcy5vcmRlckluc3RhbmNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdGlmIChkaXN0ID4gdGhpcy5vcmRlckluc3RhbmNlc1tqXS5kaXN0KXtcclxuXHRcdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShqLDAse19jOiBjaXJjdWxhci5yZWdpc3RlcignT3JkZXJJbnN0YW5jZScpLCBpbnM6IGlucywgZGlzdDogZGlzdH0pO1xyXG5cdFx0XHRcdGFkZGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRqID0gamxlbjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoIWFkZGVkKXtcclxuXHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5wdXNoKHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNBdCA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAoTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYSkgPT0geCAmJiBNYXRoLnJvdW5kKGlucy5wb3NpdGlvbi5jKSA9PSB6KVxyXG5cdFx0XHRyZXQucHVzaChpbnMpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwID09IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR0aGlzLmRyYXdNYXAoKTtcclxuXHRcclxuXHR0aGlzLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5vcmRlckluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLm9yZGVySW5zdGFuY2VzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRpbnMgPSBpbnMuaW5zO1xyXG5cdFx0XHJcblx0XHRpZiAoaW5zLmRlc3Ryb3llZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlucy5sb29wKCk7XHJcblx0fVxyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHp6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4ID4gNiB8fCB6eiA+IDYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdFx0dGhpcy5nYW1lLmRyYXdEb29yKGlucy5wb3NpdGlvbi5hLCBpbnMucG9zaXRpb24uYiwgaW5zLnBvc2l0aW9uLmMsIGlucy5yb3RhdGlvbiwgaW5zLnRleHR1cmVDb2RlKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcldhbGwoaW5zLmRvb3JQb3NpdGlvbi5hLCBpbnMuZG9vclBvc2l0aW9uLmIsIGlucy5kb29yUG9zaXRpb24uYywgaW5zLndhbGxUZXh0dXJlLCAoaW5zLmRpciA9PSBcIlZcIikpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLnBsYXllci5sb29wKCk7XHJcblx0aWYgKHRoaXMucG9pc29uQ291bnQgPiAwKXtcclxuXHRcdHRoaXMucG9pc29uQ291bnQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5nYW1lLnBsYXllci5wb2lzb25lZCAmJiB0aGlzLnBvaXNvbkNvdW50ID09IDApe1xyXG5cdFx0dGhpcy5wbGF5ZXIucmVjZWl2ZURhbWFnZSgxMCk7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50ID0gMTAwO1xyXG5cdH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bWFrZVBlcnNwZWN0aXZlOiBmdW5jdGlvbihmb3YsIGFzcGVjdFJhdGlvLCB6TmVhciwgekZhcil7XHJcblx0XHR2YXIgekxpbWl0ID0gek5lYXIgKiBNYXRoLnRhbihmb3YgKiBNYXRoLlBJIC8gMzYwKTtcclxuXHRcdHZhciBBID0gLSh6RmFyICsgek5lYXIpIC8gKHpGYXIgLSB6TmVhcik7XHJcblx0XHR2YXIgQiA9IC0yICogekZhciAqIHpOZWFyIC8gKHpGYXIgLSB6TmVhcik7XHJcblx0XHR2YXIgQyA9ICgyICogek5lYXIpIC8gKHpMaW1pdCAqIGFzcGVjdFJhdGlvICogMik7XHJcblx0XHR2YXIgRCA9ICgyICogek5lYXIpIC8gKDIgKiB6TGltaXQpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRDLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCBELCAwLCAwLFxyXG5cdFx0XHQwLCAwLCBBLC0xLFxyXG5cdFx0XHQwLCAwLCBCLCAwXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bmV3TWF0cml4OiBmdW5jdGlvbihjb2xzLCByb3dzKXtcclxuXHRcdHZhciByZXQgPSBuZXcgQXJyYXkocm93cyk7XHJcblx0XHRmb3IgKHZhciBpPTA7aTxyb3dzO2krKyl7XHJcblx0XHRcdHJldFtpXSA9IG5ldyBBcnJheShjb2xzKTtcclxuXHRcdFx0Zm9yICh2YXIgaj0wO2o8Y29scztqKyspe1xyXG5cdFx0XHRcdHJldFtpXVtqXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldElkZW50aXR5OiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG1ha2VUcmFuc2Zvcm06IGZ1bmN0aW9uKG9iamVjdCwgY2FtZXJhKXtcclxuXHRcdC8vIFN0YXJ0cyB3aXRoIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHRcdHZhciB0TWF0ID0gdGhpcy5nZXRJZGVudGl0eSgpO1xyXG5cdFx0XHJcblx0XHQvLyBSb3RhdGUgdGhlIG9iamVjdFxyXG5cdFx0Ly8gVW50aWwgSSBmaW5kIHRoZSBuZWVkIHRvIHJvdGF0ZSBhbiBvYmplY3QgaXRzZWxmIGl0IHJlYW1pbnMgYXMgY29tbWVudFxyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWChvYmplY3Qucm90YXRpb24uYSkpO1xyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkob2JqZWN0LnJvdGF0aW9uLmIpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvbloob2JqZWN0LnJvdGF0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gSWYgdGhlIG9iamVjdCBpcyBhIGJpbGxib2FyZCwgdGhlbiBtYWtlIGl0IGxvb2sgdG8gdGhlIGNhbWVyYVxyXG5cdFx0aWYgKG9iamVjdC5pc0JpbGxib2FyZCAmJiAhb2JqZWN0Lm5vUm90YXRlKSB0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWSgtKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSkpO1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlIHRoZSBvYmplY3QgdG8gaXRzIHBvc2l0aW9uXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKG9iamVjdC5wb3NpdGlvbi5hLCBvYmplY3QucG9zaXRpb24uYiwgb2JqZWN0LnBvc2l0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IGluIHJlbGF0aW9uIHRvIHRoZSBjYW1lcmFcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0VHJhbnNsYXRpb24oLWNhbWVyYS5wb3NpdGlvbi5hLCAtY2FtZXJhLnBvc2l0aW9uLmIgLSBjYW1lcmEuY2FtZXJhSGVpZ2h0LCAtY2FtZXJhLnBvc2l0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3QgaW4gdGhlIGNhbWVyYSBkaXJlY3Rpb24gKEkgZG9uJ3QgcmVhbGx5IHJvdGF0ZSBpbiB0aGUgWiBheGlzKVxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoY2FtZXJhLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25YKC1jYW1lcmEucm90YXRpb24uYSkpO1xyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWigtY2FtZXJhLnJvdGF0aW9uLmMpKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRNYXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUcmFuc2xhdGlvbjogZnVuY3Rpb24oeCwgeSwgeil7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCAxLCAwLCAwLFxyXG5cdFx0XHQwLCAwLCAxLCAwLFxyXG5cdFx0XHR4LCB5LCB6LCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25YOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCBDLCBTLCAwLFxyXG5cdFx0XHQwLC1TLCBDLCAwLFxyXG5cdFx0XHQwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25ZOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQgQywgMCwgUywgMCxcclxuXHRcdFx0IDAsIDEsIDAsIDAsXHJcblx0XHRcdC1TLCAwLCBDLCAwLFxyXG5cdFx0XHQgMCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWjogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIFMsIDAsIDAsXHJcblx0XHRcdC1TLCBDLCAwLCAwLFxyXG5cdFx0XHQgMCwgMCwgMSwgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtaW5pTWF0cml4TXVsdDogZnVuY3Rpb24ocm93LCBjb2x1bW4pe1xyXG5cdFx0dmFyIHJlc3VsdCA9IDA7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXJvdy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0cmVzdWx0ICs9IHJvd1tpXSAqIGNvbHVtbltpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9LFxyXG5cdFxyXG5cdG1hdHJpeE11bHRpcGxpY2F0aW9uOiBmdW5jdGlvbihtYXRyaXhBLCBtYXRyaXhCKXtcclxuXHRcdHZhciBBMSA9IFttYXRyaXhBWzBdLCAgbWF0cml4QVsxXSwgIG1hdHJpeEFbMl0sICBtYXRyaXhBWzNdXTtcclxuXHRcdHZhciBBMiA9IFttYXRyaXhBWzRdLCAgbWF0cml4QVs1XSwgIG1hdHJpeEFbNl0sICBtYXRyaXhBWzddXTtcclxuXHRcdHZhciBBMyA9IFttYXRyaXhBWzhdLCAgbWF0cml4QVs5XSwgIG1hdHJpeEFbMTBdLCBtYXRyaXhBWzExXV07XHJcblx0XHR2YXIgQTQgPSBbbWF0cml4QVsxMl0sIG1hdHJpeEFbMTNdLCBtYXRyaXhBWzE0XSwgbWF0cml4QVsxNV1dO1xyXG5cdFx0XHJcblx0XHR2YXIgQjEgPSBbbWF0cml4QlswXSwgbWF0cml4Qls0XSwgbWF0cml4Qls4XSwgIG1hdHJpeEJbMTJdXTtcclxuXHRcdHZhciBCMiA9IFttYXRyaXhCWzFdLCBtYXRyaXhCWzVdLCBtYXRyaXhCWzldLCAgbWF0cml4QlsxM11dO1xyXG5cdFx0dmFyIEIzID0gW21hdHJpeEJbMl0sIG1hdHJpeEJbNl0sIG1hdHJpeEJbMTBdLCBtYXRyaXhCWzE0XV07XHJcblx0XHR2YXIgQjQgPSBbbWF0cml4QlszXSwgbWF0cml4Qls3XSwgbWF0cml4QlsxMV0sIG1hdHJpeEJbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIG1tbSA9IHRoaXMubWluaU1hdHJpeE11bHQ7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRtbW0oQTEsIEIxKSwgbW1tKEExLCBCMiksIG1tbShBMSwgQjMpLCBtbW0oQTEsIEI0KSxcclxuXHRcdFx0bW1tKEEyLCBCMSksIG1tbShBMiwgQjIpLCBtbW0oQTIsIEIzKSwgbW1tKEEyLCBCNCksXHJcblx0XHRcdG1tbShBMywgQjEpLCBtbW0oQTMsIEIyKSwgbW1tKEEzLCBCMyksIG1tbShBMywgQjQpLFxyXG5cdFx0XHRtbW0oQTQsIEIxKSwgbW1tKEE0LCBCMiksIG1tbShBNCwgQjMpLCBtbW0oQTQsIEI0KVxyXG5cdFx0XTtcclxuXHR9XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWlzc2lsZScsICdiaWxsYm9hcmQnKTtcclxuY2lyY3VsYXIuc2V0UmV2aXZlcignTWlzc2lsZScsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSkge1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tvYmplY3Quc3ViSW1nXTtcclxuXHRcclxufSk7XHJcblxyXG5mdW5jdGlvbiBNaXNzaWxlKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNaXNzaWxlJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWlzc2lsZTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnTWlzc2lsZScsIE1pc3NpbGUpO1xyXG5cclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgcm90YXRpb24sIHR5cGUsIHRhcmdldCwgbWFwTWFuYWdlcil7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLnR5cGUgPSB0eXBlO1xyXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5zb2xpZCA9IGZhbHNlO1xyXG5cdHRoaXMuc3RyID0gMDtcclxuXHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdHRoaXMubWlzc2VkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy52c3BlZWQgPSAwO1xyXG5cdHRoaXMuZ3Jhdml0eSA9IDA7XHJcblx0XHJcblx0dmFyIHN1YkltZyA9IDA7XHJcblx0c3dpdGNoICh0eXBlKXtcclxuXHRcdGNhc2UgJ3NsaW5nJzogXHJcblx0XHRcdHN1YkltZyA9IDA7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0XHR0aGlzLmdyYXZpdHkgPSAwLjAwNTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDE7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdjcm9zc2Jvdyc6IFxyXG5cdFx0XHRzdWJJbWcgPSAyOyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMztcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnbWFnaWNNaXNzaWxlJzogXHJcblx0XHRcdHN1YkltZyA9IDM7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC40O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdpY2VCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNDsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ZpcmVCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNTsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA2OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLnN1YkltZyA9IHN1YkltZztcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gJ2JvbHRzJztcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBtYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnNbc3ViSW1nXTtcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmNoZWNrQ29sbGlzaW9uID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbWFwID0gdGhpcy5tYXBNYW5hZ2VyLm1hcDtcclxuXHRpZiAodGhpcy5wb3NpdGlvbi5hIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmMgPCAwIHx8IHRoaXMucG9zaXRpb24uYSA+PSBtYXBbMF0ubGVuZ3RoIHx8IHRoaXMucG9zaXRpb24uYyA+PSBtYXAubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIHggPSB0aGlzLnBvc2l0aW9uLmEgPDwgMDtcclxuXHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiArIDAuNTtcclxuXHR2YXIgeiA9IHRoaXMucG9zaXRpb24uYyA8PCAwO1xyXG5cdHZhciB0aWxlID0gbWFwW3pdW3hdO1xyXG5cdFxyXG5cdGlmICh0aWxlLncgfHwgdGlsZS53ZCB8fCB0aWxlLndkKXtcclxuXHRcdGlmICghKHRpbGUueSArIHRpbGUuaCA8IHkgfHwgdGlsZS55ID4geSkpe1xyXG5cdFx0XHQgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAoeSA8IHRpbGUuZnkgfHwgeSA+IHRpbGUuY2gpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgaW5zLCBkZnM7XHJcblx0aWYgKHRoaXMudGFyZ2V0ID09ICdlbmVteScpe1xyXG5cdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZXNOZWFyZXN0KHRoaXMucG9zaXRpb24sIDAuNSwgJ2VuZW15Jyk7XHJcblx0XHR2YXIgZGlzdCA9IDEwMDAwO1xyXG5cdFx0aWYgKGluc3RhbmNlcy5sZW5ndGggPiAxKXtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0dmFyIHh4ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5hIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0XHRcdHZhciB5eSA9IE1hdGguYWJzKHRoaXMucG9zaXRpb24uYyAtIGluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgZCA9IHh4ICogeHggKyB5eSAqIHl5O1xyXG5cdFx0XHRcdGlmIChkIDwgZGlzdCl7XHJcblx0XHRcdFx0XHRkaXN0ID0gZDtcclxuXHRcdFx0XHRcdGlucyA9IGluc3RhbmNlc1tpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmIChpbnN0YW5jZXMubGVuZ3RoID09IDEpe1xyXG5cdFx0XHRpbnMgPSBpbnN0YW5jZXNbMF07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKGlucy5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdH1lbHNle1xyXG5cdFx0aW5zID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgodGhpcy5zdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdGlmICh0aGlzLm1pc3NlZCl7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZG1nICE9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoZG1nICsgXCIgZGFtYWdlXCIpOyAvLyBUT0RPOiBSZXBsYWNlIHdpdGggcG9wdXAgb3ZlciBpbnNcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHRpbnMucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdibG9jaycpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnZzcGVlZCArPSB0aGlzLmdyYXZpdHk7XHJcblx0XHJcblx0dmFyIHhUbyA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdHZhciB5VG8gPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmEpICogdGhpcy5zcGVlZCAtIHRoaXMudnNwZWVkO1xyXG5cdHZhciB6VG8gPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMuc3BlZWQ7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbi5zdW0odmVjMyh4VG8sIHlUbywgelRvKSk7XHJcblx0XHJcblx0aWYgKCF0aGlzLmNoZWNrQ29sbGlzaW9uKCkpe1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRub3JtYWxzOiB7XHJcblx0XHRkb3duOiAgdmVjMiggMCwgMSksXHJcblx0XHRyaWdodDogdmVjMiggMSwgMCksXHJcblx0XHR1cDogICAgdmVjMiggMCwtMSksXHJcblx0XHRsZWZ0OiAgdmVjMigtMSwgMCksXHJcblx0XHRcclxuXHRcdHVwUmlnaHQ6ICB2ZWMyKE1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgLU1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHR1cExlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93blJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHRkb3duTGVmdDogIHZlYzIoLU1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKVxyXG5cdH0sXHJcblx0XHJcblx0Y3ViZTogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgbGlnaHQsIC8qW3UsbCxkLHJdKi8gZmFjZXMpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtdO1xyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0aWYgKCFmYWNlcykgZmFjZXMgPSBbMSwxLDEsMV07XHJcblx0XHRpZiAoZmFjZXNbMF0peyAvLyBVcCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCBcdCB3LCAgMCwgLWwsXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDEsMSwxLDEpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzFdKXsgLy8gTGVmdCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHRcdCB3LCAgMCwgLWwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbMl0peyAvLyBEb3duIEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1szXSl7IC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwLDAsMCwwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdFxyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0XHQwLjAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0Zmxvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGNlaWw6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDIsIDEsIDEsIDIsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3JXYWxsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgKiAwLjA1O1xyXG5cdFx0XHJcblx0XHR2YXIgdzIgPSAtc2l6ZS5hICogMC4yNTtcclxuXHRcdHZhciB3MyA9IHNpemUuYSAqIDAuMjU7XHJcblx0XHRcclxuXHRcdHZhciBoMiA9IDEgLSBzaXplLmIgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIFJpZ2h0IHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdC13LCAgMCwgIGwsXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTGVmdCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgIDAsIC1sLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTWlkZGxlIHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgaDIsIC1sLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgaDIsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gQm90dG9tIEZhY2VcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAgbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDY7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4yNSwgdHksXHJcblx0XHRcdFx0MC4yNSwwLjAsXHJcblx0XHRcdFx0MC4wMCwgdHksXHJcblx0XHRcdFx0MC4wMCwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC41LDEuMCxcclxuXHRcdFx0XHQwLjUsMC43NSxcclxuXHRcdFx0XHQwLjAsMS4wLFxyXG5cdFx0XHRcdDAuMCwwLjc1XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDM2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0KXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdCAwLCAgaCwgIGwsXHJcblx0XHRcdCAwLCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2godHgsIHR5LCB0eCwwLjAsIDAuMCwgdHksIDAuMCwwLjApO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goMC4wLCB0eSwgMC4wLDAuMCwgdHgsIHR5LCB0eCwwLjApO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjAxLDAuMDEsXHJcblx0XHRcdFx0MC4wMSwwLjAsXHJcblx0XHRcdFx0MC4wICwwLjAxLFxyXG5cdFx0XHRcdDAuMCAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDE2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRyZXR1cm4gZG9vcjtcclxuXHR9LFxyXG5cdFxyXG5cdGJpbGxib2FyZDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgIGgsICAwLFxyXG5cdFx0XHQtdywgIGgsICAwLFxyXG5cdFx0XHQgdywgIDAsICAwLFxyXG5cdFx0XHQtdywgIDAsICAwLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj00O2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdF07XHJcblx0XHRcdFx0IFxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJpbGwgPSAgdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRiaWxsLmlzQmlsbGJvYXJkID0gdHJ1ZTtcclxuXHRcdHJldHVybiBiaWxsO1xyXG5cdH0sXHJcblx0XHJcblx0c2xvcGU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGRpcil7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IC8vIEZyb250IFNsb3BlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdCAvLyBSaWdodCBTaWRlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgLWwsXHJcblx0XHRcdCBcclxuXHRcdFx0IC8vIExlZnQgU2lkZVxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjAsICBsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpZiAoZGlyICE9IDApe1xyXG5cdFx0XHR2YXIgYW5nID0gTWF0aC5kZWdUb1JhZChkaXIgKiAtOTApO1xyXG5cdFx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8dmVydGV4Lmxlbmd0aDtpKz0zKXtcclxuXHRcdFx0XHR2YXIgYSA9IHZlcnRleFtpXSAqIEMgLSB2ZXJ0ZXhbaSsyXSAqIFM7XHJcblx0XHRcdFx0dmFyIGIgPSB2ZXJ0ZXhbaV0gKiBTICsgdmVydGV4W2krMl0gKiBDO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZlcnRleFtpXSA9IGE7XHJcblx0XHRcdFx0dmVydGV4W2krMl0gPSBiO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMsIDQsIDUsIDYsIDcsIDgsIDkpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgMC4wLFxyXG5cdFx0XHQwLjAsICB0eSxcclxuXHRcdFx0XHJcblx0XHRcdCB0eCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDAsMCwwLDAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGFzc2VtYmxlT2JqZWN0OiBmdW5jdGlvbihtYXBEYXRhLCBvYmplY3RUeXBlLCBnbCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVjdCA9IFs2NCw2NCwwLDBdOyAvLyBbeDEseTEseDIseTJdXHJcblx0XHRmb3IgKHZhciB5PTAseWxlbj1tYXBEYXRhLmxlbmd0aDt5PHlsZW47eSsrKXtcclxuXHRcdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YVt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdFx0dmFyIHQgPSAobWFwRGF0YVt5XVt4XS50aWxlKT8gbWFwRGF0YVt5XVt4XS50aWxlIDogMDtcclxuXHRcdFx0XHRpZiAodCAhPSAwKXtcclxuXHRcdFx0XHRcdC8vIFNlbGVjdGluZyBib3VuZGFyaWVzIG9mIHRoZSBtYXAgcGFydFxyXG5cdFx0XHRcdFx0cmVjdFswXSA9IE1hdGgubWluKHJlY3RbMF0sIHggLSA2KTtcclxuXHRcdFx0XHRcdHJlY3RbMV0gPSBNYXRoLm1pbihyZWN0WzFdLCB5IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzJdID0gTWF0aC5tYXgocmVjdFsyXSwgeCArIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFszXSA9IE1hdGgubWF4KHJlY3RbM10sIHkgKyA2KTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZ2O1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJGXCIpeyB2diA9IHRoaXMuZmxvb3IodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gRmxvb3JcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQ1wiKXsgdnYgPSB0aGlzLmNlaWwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gQ2VpbFxyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJCXCIpeyB2diA9IHRoaXMuY3ViZSh2ZWMzKDEuMCxtYXBEYXRhW3ldW3hdLmgsMS4wKSwgdmVjMigxLjAsbWFwRGF0YVt5XVt4XS5oKSwgZ2wsIGZhbHNlLCB0aGlzLmdldEN1YmVGYWNlcyhtYXBEYXRhLCB4LCB5KSk7IH1lbHNlIC8vIEJsb2NrXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIlNcIil7IHZ2ID0gdGhpcy5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wsIG1hcERhdGFbeV1beF0uZGlyKTsgfSAvLyBTbG9wZVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgdmVydGV4T2ZmID0gdmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRcdFx0XHR4eCA9IHZ2LnZlcnRpY2VzW2ldICsgeCArIDAuNTtcclxuXHRcdFx0XHRcdFx0eXkgPSB2di52ZXJ0aWNlc1tpKzFdICsgbWFwRGF0YVt5XVt4XS55O1xyXG5cdFx0XHRcdFx0XHR6eiA9IHZ2LnZlcnRpY2VzW2krMl0gKyB5ICsgMC41O1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGljZXMucHVzaCh4eCwgeXksIHp6KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di5pbmRpY2VzLmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZ2LmluZGljZXNbaV0gKyB2ZXJ0ZXhPZmYpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnRleENvb3Jkcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdHRleENvb3Jkcy5wdXNoKHZ2LnRleENvb3Jkc1tpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuZGFya1ZlcnRleC5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCh2di5kYXJrVmVydGV4W2ldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmVjcmVhdGUgYnVmZmVyIGRhdGEgb24gZGVzZXJpYWxpemF0aW9uXHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YnVmZmVyLmJvdW5kYXJpZXMgPSByZWN0O1xyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdFxyXG5cdGdldEN1YmVGYWNlczogZnVuY3Rpb24obWFwLCB4LCB5KXtcclxuXHRcdHZhciByZXQgPSBbMSwxLDEsMV07XHJcblx0XHR2YXIgdGlsZSA9IG1hcFt5XVt4XTtcclxuXHRcdFxyXG5cdFx0Ly8gVXAgRmFjZVxyXG5cdFx0aWYgKHkgPiAwICYmIG1hcFt5LTFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5LTFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzBdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gTGVmdCBmYWNlXHJcblx0XHRpZiAoeCA8IDYzICYmIG1hcFt5XVt4KzFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4KzFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzFdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gRG93biBmYWNlXHJcblx0XHRpZiAoeSA8IDYzICYmIG1hcFt5KzFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5KzFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzJdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gUmlnaHQgZmFjZVxyXG5cdFx0aWYgKHggPiAwICYmIG1hcFt5XVt4LTFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4LTFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzNdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0T2JqZWN0V2l0aFByb3BlcnRpZXM6IGZ1bmN0aW9uKHZlcnRleEJ1ZmZlciwgaW5kZXhCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcil7XHJcblx0XHR2YXIgb2JqID0ge1xyXG5cdFx0XHRyb3RhdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0cG9zaXRpb246IHZlYzMoMCwgMCwgMCksXHJcblx0XHRcdHZlcnRleEJ1ZmZlcjogdmVydGV4QnVmZmVyLCBcclxuXHRcdFx0aW5kaWNlc0J1ZmZlcjogaW5kZXhCdWZmZXIsIFxyXG5cdFx0XHR0ZXhCdWZmZXI6IHRleEJ1ZmZlcixcclxuXHRcdFx0ZGFya0J1ZmZlcjogZGFya0J1ZmZlclxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9LFxyXG5cdFxyXG5cdGNyZWF0ZTNET2JqZWN0OiBmdW5jdGlvbihnbCwgYmFzZU9iamVjdCl7XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LnZlcnRpY2VzLmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShiYXNlT2JqZWN0LnRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGJhc2VPYmplY3QuaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC5kYXJrVmVydGV4Lmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgYnVmZmVyID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRcclxuXHRcdHJldHVybiBidWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHR0cmFuc2xhdGVPYmplY3Q6IGZ1bmN0aW9uKG9iamVjdCwgdHJhbnNsYXRpb24pe1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3QudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaV0gKz0gdHJhbnNsYXRpb24uYTtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMV0gKz0gdHJhbnNsYXRpb24uYjtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMl0gKz0gdHJhbnNsYXRpb24uYztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iamVjdDtcclxuXHR9LFxyXG5cdFxyXG5cdGZ1emVPYmplY3RzOiBmdW5jdGlvbihvYmplY3RMaXN0KXtcclxuXHRcdHZhciB2ZXJ0aWNlcyA9IFtdO1xyXG5cdFx0dmFyIHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dmFyIGluZGljZXMgPSBbXTtcclxuXHRcdHZhciBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcclxuXHRcdHZhciBpbmRleENvdW50ID0gMDtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49b2JqZWN0TGlzdC5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0dmFyIG9iaiA9IG9iamVjdExpc3RbaV07XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudmVydGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2gob2JqLnZlcnRpY2VzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLnRleENvb3Jkcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dGV4Q29vcmRzLnB1c2gob2JqLnRleENvb3Jkc1tqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai5pbmRpY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRpbmRpY2VzLnB1c2gob2JqLmluZGljZXNbal0gKyBpbmRleENvdW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmRhcmtWZXJ0ZXgubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaChvYmouZGFya1ZlcnRleFtqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGluZGV4Q291bnQgKz0gb2JqLnZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRpY2VzLCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRsb2FkM0RNb2RlbDogZnVuY3Rpb24obW9kZWxGaWxlLCBnbCl7XHJcblx0XHR2YXIgbW9kZWwgPSB7cmVhZHk6IGZhbHNlfTtcclxuXHRcdFxyXG5cdFx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0XHRodHRwLm9wZW4oXCJHRVRcIiwgY3AgKyBcIm1vZGVscy9cIiArIG1vZGVsRmlsZSArIFwiLm9iaj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0XHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuXHRcdFx0XHR2YXIgbGluZXMgPSBodHRwLnJlc3BvbnNlVGV4dC5zcGxpdChcIlxcblwiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdmVydGljZXMgPSBbXSwgdGV4Q29vcmRzID0gW10sIHRyaWFuZ2xlcyA9IFtdLCB2ZXJ0ZXhJbmRleCA9IFtdLCB0ZXhJbmRpY2VzID0gW10sIGluZGljZXMgPSBbXSwgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHRcdHZhciB3b3JraW5nO1xyXG5cdFx0XHRcdHZhciB0ID0gZmFsc2U7XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1saW5lcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdHZhciBsID0gbGluZXNbaV0udHJpbSgpO1xyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCJcIil7IGNvbnRpbnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHZlcnRpY2VzXCIpeyB3b3JraW5nID0gdmVydGljZXM7IHQgPSBmYWxzZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB0ZXhDb29yZHNcIil7IHdvcmtpbmcgPSB0ZXhDb29yZHM7IHQgPSB0cnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRyaWFuZ2xlc1wiKXsgd29ya2luZyA9IHRyaWFuZ2xlczsgdCA9IGZhbHNlOyB9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YXIgcGFyYW1zID0gbC5zcGxpdChcIiBcIik7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGo9MCxqbGVuPXBhcmFtcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFpc05hTihwYXJhbXNbal0pKXtcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtc1tqXSA9IHBhcnNlRmxvYXQocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0KSB3b3JraW5nLnB1c2gocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAodCkgd29ya2luZy5wdXNoKHBhcmFtcyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB1c2VkVmVyID0gW107XHJcblx0XHRcdFx0dmFyIHVzZWRJbmQgPSBbXTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRyaWFuZ2xlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGlmICh1c2VkVmVyLmluZGV4T2YodHJpYW5nbGVzW2ldKSAhPSAtMSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh1c2VkSW5kW3VzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pXSk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dXNlZFZlci5wdXNoKHRyaWFuZ2xlc1tpXSk7XHJcblx0XHRcdFx0XHRcdHZhciB0ID0gdHJpYW5nbGVzW2ldLnNwbGl0KFwiL1wiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0WzBdID0gcGFyc2VJbnQodFswXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHR0WzFdID0gcGFyc2VJbnQodFsxXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZlcnRleEluZGV4Lmxlbmd0aCAvIDMpO1xyXG5cdFx0XHRcdFx0XHR1c2VkSW5kLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR2ZXJ0ZXhJbmRleC5wdXNoKHZlcnRpY2VzW3RbMF0gKiAzXSwgdmVydGljZXNbdFswXSAqIDMgKyAxXSwgdmVydGljZXNbdFswXSAqIDMgKyAyXSk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0ZXhJbmRpY2VzLnB1c2godGV4Q29vcmRzW3RbMV1dWzBdLCB0ZXhDb29yZHNbdFsxXV1bMV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRleEluZGljZXMubGVuZ3RoLzI7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGJhc2UgPSB7dmVydGljZXM6IHZlcnRleEluZGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleEluZGljZXMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdFx0XHRcdHZhciBtb2RlbDNEID0gdGhpcy5jcmVhdGUzRE9iamVjdChnbCwgYmFzZSk7XHJcblxyXG5cdFx0XHRcdG1vZGVsLnJvdGF0aW9uID0gbW9kZWwzRC5yb3RhdGlvbjtcclxuXHRcdFx0XHRtb2RlbC5wb3NpdGlvbiA9IG1vZGVsM0QucG9zaXRpb247XHJcblx0XHRcdFx0bW9kZWwudmVydGV4QnVmZmVyID0gbW9kZWwzRC52ZXJ0ZXhCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwuaW5kaWNlc0J1ZmZlciA9IG1vZGVsM0QuaW5kaWNlc0J1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC50ZXhCdWZmZXIgPSBtb2RlbDNELnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5kYXJrQnVmZmVyID0gbW9kZWwzRC5kYXJrQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdGh0dHAuc2VuZCgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbW9kZWw7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG52YXIgY2hlYXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBQbGF5ZXIocG9zaXRpb24sIGRpcmVjdGlvbiwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdQbGF5ZXInKTsgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdQbGF5ZXInLCBQbGF5ZXIpO1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGRpcmVjdGlvbiwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHRcclxuXHR0aGlzLnJvdGF0aW9uU3BkID0gdmVjMihNYXRoLmRlZ1RvUmFkKDEpLCBNYXRoLmRlZ1RvUmFkKDQpKTtcclxuXHR0aGlzLm1vdmVtZW50U3BkID0gMC4wNTtcclxuXHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNTtcclxuXHR0aGlzLm1heFZlcnRSb3RhdGlvbiA9IE1hdGguZGVnVG9SYWQoNDUpO1xyXG5cdFxyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy55U3BlZWQgPSAwLjA7XHJcblx0dGhpcy55R3Jhdml0eSA9IDAuMDtcclxuXHRcclxuXHR0aGlzLmpvZyA9IHZlYzQoMC4wLCAxLCAwLjAsIDEpO1xyXG5cdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHJcblx0dGhpcy5odXJ0ID0gMC4wO1x0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMDtcclxuXHRcclxuXHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSAwO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5yZWNlaXZlRGFtYWdlID0gZnVuY3Rpb24oZG1nKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHR0aGlzLmh1cnQgPSA1LjA7XHJcblx0dmFyIHBsYXllciA9IGdhbWUucGxheWVyO1xyXG5cdHBsYXllci5ocCAtPSBkbWc7XHJcblx0aWYgKHBsYXllci5ocCA8PSAwKXtcclxuXHRcdHBsYXllci5ocCA9IDA7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBkaWVkIVwiKTtcclxuXHRcdGdhbWUuc2F2ZU1hbmFnZXIuZGVsZXRlR2FtZSgpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2FzdE1pc3NpbGUgPSBmdW5jdGlvbih3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLnN0cik7XHJcblx0aWYgKHdlYXBvbikgc3RyICs9IFV0aWxzLnJvbGxEaWNlKHdlYXBvbi5zdHIpICogd2VhcG9uLnN0YXR1cztcclxuXHRcclxuXHR2YXIgcHJvYiA9IE1hdGgucmFuZG9tKCk7XHJcblx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdG1pc3NpbGUuaW5pdCh0aGlzLnBvc2l0aW9uLmNsb25lKCksIHRoaXMucm90YXRpb24uY2xvbmUoKSwgd2VhcG9uLmNvZGUsICdlbmVteScsIHRoaXMubWFwTWFuYWdlcik7XHJcblx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRtaXNzaWxlLm1pc3NlZCA9IChwcm9iID4gcHMuc3RhdHMuZGV4KTtcclxuXHRpZiAod2VhcG9uKSBcclxuXHRcdHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTsgLy8gVE9ETzogRW5oYW5jZSB3ZWFwb24gZGVncmFkYXRpb25cclxuXHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiWW91IHNob290IGEgXCIgKyB3ZWFwb24uc3ViSXRlbU5hbWUpO1xyXG5cdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAzMDtcclxuXHR0aGlzLm1vdmVkID0gdHJ1ZTtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubWVsZWVBdHRhY2sgPSBmdW5jdGlvbih3ZWFwb24pe1xyXG5cdHZhciBlbmVtaWVzID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlc05lYXJlc3QodGhpcy5wb3NpdGlvbiwgMS4wLCAnZW5lbXknKTtcclxuXHRcdFxyXG5cdHZhciB4eCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHR2YXIgenogPSB0aGlzLnBvc2l0aW9uLmM7XHJcblx0dmFyIGR4ID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuMTtcclxuXHR2YXIgZHogPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIDAuMTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0eHggKz0gZHg7XHJcblx0XHR6eiArPSBkejtcclxuXHRcdHZhciBvYmplY3Q7XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPWVuZW1pZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHR2YXIgaW5zID0gZW5lbWllc1tqXTtcclxuXHRcdFx0dmFyIHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHh4KTtcclxuXHRcdFx0dmFyIHogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHp6KTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh4IDwgMC4zICYmIHogPCAwLjMpe1xyXG5cdFx0XHRcdG9iamVjdCA9IGlucztcclxuXHRcdFx0XHRqID0gamxlbjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAob2JqZWN0ICYmIG9iamVjdC5lbmVteSl7XHJcblx0XHRcdHRoaXMuY2FzdEF0dGFjayhvYmplY3QsIHdlYXBvbik7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCA9IDIwO1xyXG5cdFx0XHR0aGlzLm1vdmVkID0gdHJ1ZTtcclxuXHRcdFx0aSA9IDExO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2FzdEF0dGFjayA9IGZ1bmN0aW9uKHRhcmdldCwgd2VhcG9uKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdHZhciBwcyA9IGdhbWUucGxheWVyO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHRpZiAocHJvYiA+IHBzLnN0YXRzLmRleCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdC8vdmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRhcmdldC5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdHZhciBkZnMgPSAwO1xyXG5cdFxyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCkgPDwgMDtcclxuXHRcclxuXHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQXR0YWNraW5nIFwiICsgdGFyZ2V0LmVuZW15Lm5hbWUpO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRhcmdldC5lbmVteS5uYW1lICsgXCIgZGFtYWdlZCB4XCIrZG1nKTsgLy8gVE9ETzogUmVwbGFjZSB3aXRoIGRhbWFnZSBwb3B1cCBvbiB0aGUgZW5lbXlcclxuXHRcdHRhcmdldC5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHQvLyB0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdibG9jaycpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAod2VhcG9uKSBcclxuXHRcdHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTsgLy8gVE9ETzogRW5oYW5jZSB3ZWFwb24gZGVncmFkYXRpb25cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuam9nTW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIpe1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwNSAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKSB0aGlzLmpvZy5iID0gMTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuam9nLmEgKz0gMC4wMDggKiB0aGlzLmpvZy5iO1xyXG5cdFx0aWYgKHRoaXMuam9nLmEgPj0gMC4wMyAmJiB0aGlzLmpvZy5iID09IDEpIHRoaXMuam9nLmIgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmEgPD0gLTAuMDMgJiYgdGhpcy5qb2cuYiA9PSAtMSkgdGhpcy5qb2cuYiA9IDE7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4VG8sIHpUbyl7XHJcblx0dmFyIG1vdmVkID0gZmFsc2U7XHJcblx0XHJcblx0dmFyIHN3aW0gPSAodGhpcy5vbkxhdmEgfHwgdGhpcy5vbldhdGVyKTtcclxuXHRpZiAoc3dpbSl7XHJcblx0XHR4VG8gKj0gMC43NTsgXHJcblx0XHR6VG8gKj0gMC43NTtcclxuXHR9XHJcblx0dmFyIG1vdmVtZW50ID0gdmVjMih4VG8sIHpUbyk7XHJcblx0dmFyIHNwZCA9IHZlYzIoeFRvICogMS41LCAwKTtcclxuXHR2YXIgZmFrZVBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFxyXG5cdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdHZhciBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0V2FsbE5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCBzd2ltKTtcclxuXHRcdGlmICghbm9ybWFsKXsgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQpOyB9IFxyXG5cdFx0XHJcblx0XHRpZiAobm9ybWFsKXtcclxuXHRcdFx0bm9ybWFsID0gbm9ybWFsLmNsb25lKCk7XHJcblx0XHRcdHZhciBkaXN0ID0gbW92ZW1lbnQuZG90KG5vcm1hbCk7XHJcblx0XHRcdG5vcm1hbC5tdWx0aXBseSgtZGlzdCk7XHJcblx0XHRcdG1vdmVtZW50LnN1bShub3JtYWwpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmYWtlUG9zLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdFxyXG5cdFx0c3BkID0gdmVjMigwLCB6VG8gKiAxLjUpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAobW92ZW1lbnQuYSAhPSAwIHx8IG1vdmVtZW50LmIgIT0gMCl7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHRoaXMucG9zaXRpb24uYyArPSBtb3ZlbWVudC5iO1xyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0XHR0aGlzLmpvZ01vdmVtZW50KCk7XHJcblx0XHRtb3ZlZCA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBtb3ZlZDtcclxuXHRyZXR1cm4gbW92ZWQ7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdXNlTG9vayA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1Nb3ZlbWVudCA9IHRoaXMubWFwTWFuYWdlci5nYW1lLmdldE1vdXNlTW92ZW1lbnQoKTtcclxuXHRcclxuXHRpZiAobU1vdmVtZW50LnggIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5iIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LngpOyB9XHJcblx0aWYgKG1Nb3ZlbWVudC55ICE9IC0xMDAwMCl7IHRoaXMucm90YXRpb24uYSAtPSBNYXRoLmRlZ1RvUmFkKG1Nb3ZlbWVudC55KTsgfVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHR0aGlzLm1vdXNlTG9vaygpO1xyXG5cclxuXHQvLyBSb3RhdGlvbiB3aXRoIGtleWJvYXJkXHJcblx0aWYgKGdhbWUua2V5c1s4MV0gPT0gMSB8fCBnYW1lLmtleXNbMzddID09IDEpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5iICs9IHRoaXMucm90YXRpb25TcGQuYjtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzY5XSA9PSAxIHx8IGdhbWUua2V5c1szOV0gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgLT0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbMzhdID09IDEpeyAvLyBVcCBhcnJvd1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5hICs9IHRoaXMucm90YXRpb25TcGQuYTtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzQwXSA9PSAxKXsgLy8gRG93biBhcnJvd1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5hIC09IHRoaXMucm90YXRpb25TcGQuYTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0dmFyIEEgPSAwLjAsIEIgPSAwLjA7XHJcblx0aWYgKGdhbWUua2V5c1s4N10gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbODNdID09IDEpe1xyXG5cdFx0QSA9IC1NYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZCAqIDAuMztcclxuXHRcdEIgPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZCAqIDAuMztcclxuXHR9XHJcblx0XHJcblx0aWYgKGdhbWUua2V5c1s2NV0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiArIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjhdID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9XHJcblx0XHJcblx0aWYgKEEgIT0gMC4wIHx8IEIgIT0gMC4wKXsgdGhpcy5tb3ZlVG8oQSwgQik7IH1lbHNleyB0aGlzLmpvZy5hID0gMC4wOyB9XHJcblx0aWYgKHRoaXMucm90YXRpb24uYSA+IHRoaXMubWF4VmVydFJvdGF0aW9uKSB0aGlzLnJvdGF0aW9uLmEgPSB0aGlzLm1heFZlcnRSb3RhdGlvbjtcclxuXHRlbHNlIGlmICh0aGlzLnJvdGF0aW9uLmEgPCAtdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IC10aGlzLm1heFZlcnRSb3RhdGlvbjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuY2hlY2tBY3Rpb24gPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgzMikpeyAvLyBTcGFjZVxyXG5cdFx0dmFyIHh4ID0gKHRoaXMucG9zaXRpb24uYSArIE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiAwLjYpIDw8IDA7XHJcblx0XHR2YXIgenogPSAodGhpcy5wb3NpdGlvbi5jIC0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdFxyXG5cdFx0dmFyIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KSk7XHJcblx0XHRpZiAoIW9iamVjdCkgb2JqZWN0ID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlQXRHcmlkKHZlYzModGhpcy5wb3NpdGlvbi5hIDw8IDAsIHRoaXMucG9zaXRpb24uYiwgdGhpcy5wb3NpdGlvbi5jIDw8IDApKTtcclxuXHRcdFxyXG5cdFx0aWYgKG9iamVjdCAmJiBvYmplY3QuYWN0aXZhdGUpXHJcblx0XHRcdG9iamVjdC5hY3RpdmF0ZSgpO1xyXG5cdFx0XHRcclxuXHRcdGlmIChjaGVhdEVuYWJsZWQpe1xyXG5cdFx0XHRpZiAoZ2FtZS5mbG9vckRlcHRoIDwgOClcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKGZhbHNlLCBnYW1lLmZsb29yRGVwdGggKyAxKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoJ2NvZGV4Um9vbScpO1xyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICgoZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSB8fCBnYW1lLmdldEtleVByZXNzZWQoMTMpKSAmJiB0aGlzLmF0dGFja1dhaXQgPT0gMCl7XHQvLyBNZWxlZSBhdHRhY2ssIEVudGVyXHJcblx0XHR2YXIgd2VhcG9uID0gZ2FtZS5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0XHRcclxuXHRcdGlmICghd2VhcG9uIHx8ICF3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID0gNTtcclxuXHRcdH1lbHNlIGlmICh3ZWFwb24gJiYgd2VhcG9uLnJhbmdlZCl7XHJcblx0XHRcdHRoaXMuY2FzdE1pc3NpbGUod2VhcG9uKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHdlYXBvbiAmJiB3ZWFwb24uc3RhdHVzIDwgMC4wNSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmludmVudG9yeS5kZXN0cm95SXRlbSh3ZWFwb24pO1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh3ZWFwb24ubmFtZSArIFwiIGRhbWFnZWQhXCIpO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDc5KSl7IC8vIE8sIFRPRE86IGNoYW5nZSB0byBDdHJsK1NcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiU2F2aW5nIGdhbWUuXCIpO1xyXG5cdFx0Z2FtZS5zYXZlTWFuYWdlci5zYXZlR2FtZSgpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJHYW1lIFNhdmVkLlwiKTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYyk7XHJcblx0dmFyIHd5ID0gKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSk/IDAuMyA6IDA7XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gKHRoaXMucG9zaXRpb24uYiArIHd5KSkgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmlzTGF2YVBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdGlmICghdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5vbkxhdmEgPSB0cnVlO1xyXG5cdFx0XHJcblx0fSBlbHNlIGlmICh0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID09IHRoaXMudGFyZ2V0WSlcclxuXHRcdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDI1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gdHJ1ZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fWVsc2Uge1xyXG5cdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvRmxvYXQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIgJiYgdGhpcy5qb2cuYSA9PSAwLjApe1xyXG5cdFx0dGhpcy5qb2cuYyArPSAwLjAwNSAqIHRoaXMuam9nLmQ7XHJcblx0XHRpZiAodGhpcy5qb2cuYyA+PSAwLjAzICYmIHRoaXMuam9nLmQgPT0gMSkgdGhpcy5qb2cuZCA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYyA8PSAtMC4wMyAmJiB0aGlzLmpvZy5kID09IC0xKSB0aGlzLmpvZy5kID0gMTtcclxuXHRcdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5jID0gMC4wO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuZG9GbG9hdCgpO1xyXG5cdHRoaXMubW92ZW1lbnQoKTtcclxuXHR0aGlzLmNoZWNrQWN0aW9uKCk7XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID49IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1cclxuXHRcclxuXHQvL3RoaXMudGFyZ2V0WSA9IHRoaXMucG9zaXRpb24uYjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5jYW1lcmFIZWlnaHQgPiAwLjIpeyBcclxuXHRcdFx0dGhpcy5jYW1lcmFIZWlnaHQgLT0gMC4wMTsgXHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGlmICh0aGlzLm9uTGF2YSl7XHJcblx0XHRpZiAodGhpcy5sYXZhQ291bnRlciA+IDMwKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyKys7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdH1cclxuXHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCkgdGhpcy5hdHRhY2tXYWl0IC09IDE7XHJcblx0aWYgKHRoaXMuaHVydCA+IDApIHRoaXMuaHVydCAtPSAxO1xyXG5cdGlmICh0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPiAwKXtcclxuXHRcdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlci0tO1xyXG5cdFx0aWYgKHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHdlYXBvbiA9IHRoaXMubWFwTWFuYWdlci5nYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpXHJcblx0XHRcdFx0dGhpcy5tZWxlZUF0dGFjayh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ZXAoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gUGxheWVyU3RhdHMoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ1BsYXllclN0YXRzJyk7XHJcblx0dGhpcy5ocCA9IDA7XHJcblx0dGhpcy5tSFAgPSAwO1xyXG5cdHRoaXMubWFuYSA9IDA7XHJcblx0dGhpcy5tTWFuYSA9IDA7XHJcblx0XHJcblx0dGhpcy52aXJ0dWUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0dGhpcy5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuc3RhdHMgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpLFxyXG5cdFx0c3RyOiAnMEQwJywgXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclN0YXRzO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdQbGF5ZXJTdGF0cycsIFBsYXllclN0YXRzKTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5ocCA9IDA7XHJcblx0dGhpcy5tSFAgPSAwO1xyXG5cdHRoaXMubWFuYSA9IDA7XHJcblx0dGhpcy5tTWFuYSA9IDA7XHJcblx0XHJcblx0dGhpcy52aXJ0dWUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0dGhpcy5zdGF0cyA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKCksXHJcblx0XHRzdHI6ICcwRDAnLFxyXG5cdFx0ZGZzOiAnMEQwJyxcclxuXHRcdGRleDogMCxcclxuXHRcdG1hZ2ljUG93ZXI6ICcwRDAnXHJcblx0fTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5hZGRFeHBlcmllbmNlID0gZnVuY3Rpb24oYW1vdW50LCBjb25zb2xlKXtcclxuXHR0aGlzLmV4cCArPSBhbW91bnQ7XHJcblx0XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShhbW91bnQgKyBcIiBYUCBnYWluZWRcIik7XHJcblx0dmFyIG5leHRFeHAgPSAoTWF0aC5wb3codGhpcy5sdmwsIDEuNSkgKiA1MDApIDw8IDA7XHJcblx0aWYgKHRoaXMuZXhwID49IG5leHRFeHApeyB0aGlzLmxldmVsVXAoY29uc29sZSk7IH1cclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5sZXZlbFVwID0gZnVuY3Rpb24oY29uc29sZSl7XHJcblx0dGhpcy5sdmwgKz0gMTtcclxuXHRcclxuXHQvLyBVcGdyYWRlIEhQIGFuZCBNYW5hXHJcblx0dmFyIGhwTmV3ID0gTWF0aC5pUmFuZG9tKDEwLCAyNSk7XHJcblx0dmFyIG1hbmFOZXcgPSBNYXRoLmlSYW5kb20oNSwgMTUpO1xyXG5cdFxyXG5cdHZhciBocE9sZCA9IHRoaXMubUhQO1xyXG5cdHZhciBtYW5hT2xkID0gdGhpcy5tTWFuYTtcclxuXHRcclxuXHR0aGlzLmhwICArPSBocE5ldztcclxuXHR0aGlzLm1hbmEgKz0gbWFuYU5ldztcclxuXHR0aGlzLm1IUCArPSBocE5ldztcclxuXHR0aGlzLm1NYW5hICs9IG1hbmFOZXc7XHJcblx0XHJcblx0Ly8gVXBncmFkZSBhIHJhbmRvbSBzdGF0IGJ5IDEtMyBwb2ludHNcclxuXHQvKlxyXG5cdHZhciBzdGF0cyA9IFsnc3RyJywgJ2RmcyddO1xyXG5cdHZhciBuYW1lcyA9IFsnU3RyZW5ndGgnLCAnRGVmZW5zZSddO1xyXG5cdHZhciBzdCwgbm07XHJcblx0d2hpbGUgKCFzdCl7XHJcblx0XHR2YXIgaW5kID0gTWF0aC5pUmFuZG9tKHN0YXRzLmxlbmd0aCk7XHJcblx0XHRzdCA9IHN0YXRzW2luZF07XHJcblx0XHRubSA9IG5hbWVzW2luZF07XHJcblx0fVxyXG5cdFxyXG5cdHZhciBwYXJ0MSA9IHBhcnNlSW50KHRoaXMuc3RhdHNbc3RdLnN1YnN0cmluZygwLCB0aGlzLnN0YXRzW3N0XS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0cGFydDEgKz0gTWF0aC5pUmFuZG9tKDEsIDMpO1xyXG5cdFxyXG5cdHZhciBvbGQgPSB0aGlzLnN0YXRzW3N0XTtcclxuXHR0aGlzLnN0YXRzW3N0XSA9IHBhcnQxICsgJ0QzJzsqL1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTGV2ZWwgdXA6IFwiICsgdGhpcy5sdmwgKyBcIiFcIik7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIUCBpbmNyZWFzZWQgZnJvbSBcIiArIGhwT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1IUCk7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNYW5hIGluY3JlYXNlZCBmcm9tIFwiICsgbWFuYU9sZCArIFwiIHRvIFwiICsgdGhpcy5tTWFuYSk7XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShubSArIFwiIGluY3JlYXNlZCBmcm9tIFwiICsgb2xkICsgXCIgdG8gXCIgKyB0aGlzLnN0YXRzW3N0XSk7XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuc2V0VmlydHVlID0gZnVuY3Rpb24odmlydHVlTmFtZSl7XHJcblx0dGhpcy52aXJ0dWUgPSB2aXJ0dWVOYW1lO1xyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0c3dpdGNoICh2aXJ0dWVOYW1lKXtcclxuXHRcdGNhc2UgXCJIb25lc3R5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDIwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuODtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnTWFnZSc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkNvbXBhc3Npb25cIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdCYXJkJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiVmFsb3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDgwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRmlnaHRlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkhvbm9yXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnUGFsYWRpbic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNwaXJpdHVhbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDY7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdSYW5nZXInO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJIdW1pbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNjAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdTaGVwaGVyZCc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNhY3JpZmljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSA1MDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Rpbmtlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkp1c3RpY2VcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRHJ1aWQnO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubUhQID0gdGhpcy5ocDtcclxuXHR0aGlzLnN0YXRzLnN0ciArPSAnRDMnO1xyXG5cdHRoaXMuc3RhdHMuZGZzICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyICs9ICdEMyc7XHJcblx0dGhpcy5tTWFuYSA9IHRoaXMubWFuYTtcclxufTtcclxuIiwiZnVuY3Rpb24gU2F2ZU1hbmFnZXIoZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZSgpO1xyXG59XHJcblxyXG52YXIgU3RvcmFnZSA9IHJlcXVpcmUoJy4vU3RvcmFnZScpO1xyXG5cclxuU2F2ZU1hbmFnZXIucHJvdG90eXBlID0ge1xyXG5cdHNhdmVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNhdmVPYmplY3QgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5yZWdpc3RlcignU3R5Z2lhbkdhbWUnKSxcclxuXHRcdFx0dmVyc2lvbjogdmVyc2lvbiwgXHJcblx0XHRcdHBsYXllcjogdGhpcy5nYW1lLnBsYXllcixcclxuXHRcdFx0aW52ZW50b3J5OiB0aGlzLmdhbWUuaW52ZW50b3J5LFxyXG5cdFx0XHRtYXBzOiB0aGlzLmdhbWUubWFwcyxcclxuXHRcdFx0Zmxvb3JEZXB0aDogdGhpcy5nYW1lLmZsb29yRGVwdGgsXHJcblx0XHRcdHVuaXF1ZVJlZ2lzdHJ5OiB0aGlzLmdhbWUudW5pcXVlUmVnaXN0cnlcclxuXHRcdH07XHJcblx0XHR2YXIgc2VyaWFsaXplZCA9IGNpcmN1bGFyLnNlcmlhbGl6ZShzYXZlT2JqZWN0KTtcclxuXHRcdFxyXG5cdFx0Lyp2YXIgc2VyaWFsaXplZE9iamVjdCA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XHJcblx0XHRjb25zb2xlLmxvZyhzZXJpYWxpemVkT2JqZWN0KTtcclxuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZTogXCIrc2VyaWFsaXplZC5sZW5ndGgpOyovXHJcblx0XHRcclxuXHRcdHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdzdHlnaWFuR2FtZScsIHNlcmlhbGl6ZWQpO1xyXG5cdH0sXHJcblx0cmVzdG9yZUdhbWU6IGZ1bmN0aW9uKGdhbWUpe1xyXG5cdFx0dmFyIGdhbWVEYXRhID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ3N0eWdpYW5HYW1lJyk7XHJcblx0XHRpZiAoIWdhbWVEYXRhKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRlc2VyaWFsaXplZCA9IGNpcmN1bGFyLnBhcnNlKGdhbWVEYXRhLCBnYW1lKTtcclxuXHRcdGlmIChkZXNlcmlhbGl6ZWQudmVyc2lvbiAhPSB2ZXJzaW9uKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0Z2FtZS5wbGF5ZXIgPSBkZXNlcmlhbGl6ZWQucGxheWVyO1xyXG5cdFx0Z2FtZS5pbnZlbnRvcnkgPSBkZXNlcmlhbGl6ZWQuaW52ZW50b3J5O1xyXG5cdFx0Z2FtZS5tYXBzID0gZGVzZXJpYWxpemVkLm1hcHM7XHJcblx0XHRnYW1lLmZsb29yRGVwdGggPSBkZXNlcmlhbGl6ZWQuZmxvb3JEZXB0aDtcclxuXHRcdGdhbWUudW5pcXVlUmVnaXN0cnkgPSBkZXNlcmlhbGl6ZWQudW5pcXVlUmVnaXN0cnk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cdGRlbGV0ZUdhbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnc3R5Z2lhbkdhbWUnKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2F2ZU1hbmFnZXI7IiwiZnVuY3Rpb24gU2VsZWN0Q2xhc3MoLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RDbGFzcztcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMuZ2FtZTtcclxuXHR2YXIgcGxheWVyUyA9IGdhbWUucGxheWVyO1xyXG5cdGlmIChnYW1lLmdldEtleVByZXNzZWQoMTMpIHx8IGdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkpe1xyXG5cdFx0dmFyIG1vdXNlID0gZ2FtZS5tb3VzZTtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubW91c2UuYiA+PSAyOCAmJiBnYW1lLm1vdXNlLmIgPCAxMDApe1xyXG5cdFx0XHRpZiAoZ2FtZS5tb3VzZS5hIDw9IDg4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSG9uZXN0eVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkNvbXBhc3Npb25cIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAyNjgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJWYWxvclwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSnVzdGljZVwiKTtcclxuXHRcdH1lbHNlIGlmIChnYW1lLm1vdXNlLmIgPj0gMTAwICYmIGdhbWUubW91c2UuYiA8IDE3MCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJTYWNyaWZpY2VcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAxNzgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25vclwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNwaXJpdHVhbGl0eVwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSHVtaWxpdHlcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChwbGF5ZXJTLnZpcnR1ZSAhPSBudWxsKXtcclxuXHRcdFx0Z2FtZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5KHBsYXllclMuY2xhc3NOYW1lKTtcclxuXHRcdFx0Z2FtZS5wcmludEdyZWV0KCk7XHJcblx0XHRcdGdhbWUubG9hZE1hcChmYWxzZSwgMSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHZhciB1aSA9IHRoaXMuZ2FtZS5nZXRVSSgpO1xyXG5cdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLnNlbGVjdENsYXNzLCAwLCAwKTtcclxufTtcclxuIiwidmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnU3RhaXJzJywgJ2JpbGxib2FyZCcpO1xyXG5cclxuY2lyY3VsYXIuc2V0UmV2aXZlcignU3RhaXJzJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIGdhbWUuR0wuY3R4KTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzW29iamVjdC5pbWdJbmRdO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQubm9Sb3RhdGUgPSB0cnVlO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIFN0YWlycygpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcihcIlN0YWlyc1wiKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGFpcnM7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1N0YWlycycsIFN0YWlycyk7XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocG9zaXRpb24sIG1hcE1hbmFnZXIsIGRpcmVjdGlvbil7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5zdGFpcnMgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLnRhcmdldElkID0gdGhpcy5tYXBNYW5hZ2VyLmRlcHRoO1xyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ2Rvd24nKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgKz0gMTtcclxuXHRcdHRoaXMuaW1nSW5kID0gMTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSBudWxsO1xyXG59XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50YXJnZXRJZCA8IDkpXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKGZhbHNlLCB0aGlzLnRhcmdldElkKTtcclxuXHRlbHNlIHtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoJ2NvZGV4Um9vbScpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuZ2V0VGlsZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMudGlsZSAhPSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy50aWxlID0gdGhpcy5tYXBNYW5hZ2VyLm1hcFt0aGlzLnBvc2l0aW9uLmMgPDwgMF1bdGhpcy5wb3NpdGlvbi5hIDw8IDBdO1xyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnICYmIHRoaXMudGlsZS5jaCA+IDEpe1xyXG5cdFx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgPDwgMDtcclxuXHRcdGZvciAodmFyIGk9eSsxO2k8dGhpcy50aWxlLmNoO2krKyl7XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcdHBvcy5iID0gaTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1syXTtcclxuXHRcdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHBvcywnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1szXTtcclxuXHRcdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHR9ZWxzZXtcclxuXHRcdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHR9XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuZ2V0VGlsZSgpO1xyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBTdG9yYWdlKCl7XHJcblx0IHRyeSB7XHJcblx0XHQgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ19fdGVzdCcsICd0ZXN0Jyk7XHJcblx0XHQgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19fdGVzdCcpO1xyXG5cdFx0IHRoaXMuZW5hYmxlZCA9IHRydWU7XHJcblx0IH0gY2F0Y2goZSkge1xyXG5cdFx0IHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xyXG5cdCB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XHJcblxyXG5TdG9yYWdlLnByb3RvdHlwZSA9IHtcclxuXHRzZXRJdGVtOiBmdW5jdGlvbihrZXksIHZhbHVlKXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XHJcblx0fSxcclxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbihrZXkpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG5cdH0sXHJcblx0Z2V0SXRlbTogZnVuY3Rpb24oa2V5KXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuXHR9XHJcbn1cclxuIFxyXG4iLCJ2YXIgU2VsZWN0Q2xhc3MgPSByZXF1aXJlKCcuL1NlbGVjdENsYXNzJyk7XHJcblxyXG5mdW5jdGlvbiBUaXRsZVNjcmVlbigvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMuYmxpbmsgPSAzMDtcclxuXHR0aGlzLmN1cnJlbnRTY3JlZW4gPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlU2NyZWVuO1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMCl7XHJcblx0XHRcdGlmICh0aGlzLmdhbWUuc2F2ZU1hbmFnZXIucmVzdG9yZUdhbWUodGhpcy5nYW1lKSl7XHJcblx0XHRcdFx0dGhpcy5nYW1lLnByaW50V2VsY29tZUJhY2soKTtcclxuXHRcdFx0XHR0aGlzLmdhbWUubG9hZE1hcCh0aGlzLmdhbWUucGxheWVyLmN1cnJlbnRNYXAsIHRoaXMuZ2FtZS5wbGF5ZXIuY3VycmVudERlcHRoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRTY3JlZW4rKztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gNCl7XHJcblx0XHRcdHRoaXMuZ2FtZS5zY2VuZSA9IG5ldyBTZWxlY3RDbGFzcyh0aGlzLmdhbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdHZhciB1aSA9IHRoaXMuZ2FtZS5nZXRVSSgpO1xyXG5cdHN3aXRjaCAodGhpcy5jdXJyZW50U2NyZWVuKXtcclxuXHRjYXNlIDA6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy50aXRsZVNjcmVlbiwgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDE6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzEsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAyOlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuaW50cm8yLCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgMzpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmludHJvMywgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDQ6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzQsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG59O1xyXG4iLCJmdW5jdGlvbiBVSShzaXplLCBjb250YWluZXIpe1xyXG5cdHRoaXMuaW5pdENhbnZhcyhzaXplLCBjb250YWluZXIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJO1xyXG5cclxuVUkucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNpemUuYTtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHRjYW52YXMuc3R5bGUudG9wID0gMDtcclxuXHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0dGhpcy5jdHgud2lkdGggPSBjYW52YXMud2lkdGg7XHJcblx0dGhpcy5jdHguaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHRcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cdFxyXG5cdHRoaXMuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgPSBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdTcHJpdGUgPSBmdW5jdGlvbihzcHJpdGUsIHgsIHksIHN1YkltYWdlKXtcclxuXHR2YXIgeEltZyA9IHN1YkltYWdlICUgc3ByaXRlLmltZ051bTtcclxuXHR2YXIgeUltZyA9IChzdWJJbWFnZSAvIHNwcml0ZS5pbWdOdW0pIDw8IDA7XHJcblx0XHJcblx0dGhpcy5jdHguZHJhd0ltYWdlKHNwcml0ZSxcclxuXHRcdHhJbWcgKiBzcHJpdGUuaW1nV2lkdGgsIHlJbWcgKiBzcHJpdGUuaW1nSGVpZ2h0LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHQsXHJcblx0XHR4LCB5LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHRcclxuXHRcdCk7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZUV4dCA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2UsIGltYWdlQW5nbGUpe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5zYXZlKCk7XHJcblx0dGhpcy5jdHgudHJhbnNsYXRlKHgrc3ByaXRlLnhPcmlnLCB5K3Nwcml0ZS55T3JpZyk7XHJcblx0dGhpcy5jdHgucm90YXRlKGltYWdlQW5nbGUpO1xyXG5cdFxyXG5cdHRoaXMuY3R4LmRyYXdJbWFnZShzcHJpdGUsXHJcblx0XHR4SW1nICogc3ByaXRlLmltZ1dpZHRoLCB5SW1nICogc3ByaXRlLmltZ0hlaWdodCwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0LFxyXG5cdFx0LXNwcml0ZS54T3JpZywgLXNwcml0ZS55T3JpZywgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0dGhpcy5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24odGV4dCwgeCwgeSwgY29uc29sZSl7XHJcblx0Y29uc29sZS5wcmludFRleHQoeCx5LCB0ZXh0LCB0aGlzLmN0eCk7XHJcblx0Lyp2YXIgdyA9IGNvbnNvbGUuc3BhY2VDaGFycztcclxuXHR2YXIgaCA9IGNvbnNvbGUuc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49dGV4dC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHR2YXIgY2hhcmEgPSB0ZXh0LmNoYXJBdChqKTtcclxuXHRcdHZhciBpbmQgPSBjb25zb2xlLmxpc3RPZkNoYXJzLmluZGV4T2YoY2hhcmEpO1xyXG5cdFx0aWYgKGluZCAhPSAtMSl7XHJcblx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZShjb25zb2xlLnNwcml0ZUZvbnQsXHJcblx0XHRcdFx0dyAqIGluZCwgMSwgdywgaCAtIDEsXHJcblx0XHRcdFx0eCwgeSwgdywgaCAtIDEpO1xyXG5cdFx0fVxyXG5cdFx0eCArPSB3O1xyXG5cdH0qL1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbn07IiwidmFyIEFuaW1hdGVkVGV4dHVyZSA9IHJlcXVpcmUoJy4vQW5pbWF0ZWRUZXh0dXJlJyk7XHJcbnZhciBBdWRpb0FQSSA9IHJlcXVpcmUoJy4vQXVkaW8nKTtcclxudmFyIENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcclxudmFyIEludmVudG9yeSA9IHJlcXVpcmUoJy4vSW52ZW50b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE1hcE1hbmFnZXIgPSByZXF1aXJlKCcuL01hcE1hbmFnZXInKTtcclxudmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllclN0YXRzID0gcmVxdWlyZSgnLi9QbGF5ZXJTdGF0cycpO1xyXG52YXIgU2F2ZU1hbmFnZXIgPSByZXF1aXJlKCcuL1NhdmVNYW5hZ2VyJyk7XHJcbnZhciBUaXRsZVNjcmVlbiA9IHJlcXVpcmUoJy4vVGl0bGVTY3JlZW4nKTtcclxudmFyIEVuZGluZ1NjcmVlbiA9IHJlcXVpcmUoJy4vRW5kaW5nU2NyZWVuJyk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vVUknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG52YXIgV2ViR0wgPSByZXF1aXJlKCcuL1dlYkdMJyk7XHJcblxyXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cdFx0XHRcdCBTdHlnaWFuIEFieXNzXHJcblx0XHRcdFx0XHJcbiAgQnkgQ2FtaWxvIFJhbcOtcmV6IChKdWNhcmF2ZSkgYW5kIFNsYXNoIChodHRwOi8vc2xhc2hpZS5uZXQpXHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0ICAyMDE1XHJcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuZnVuY3Rpb24gVW5kZXJ3b3JsZCgpe1xyXG5cdHRoaXMuc2l6ZSA9IHZlYzIoMzU1LCAyMDApO1xyXG5cdFxyXG5cdHRoaXMuR0wgPSBuZXcgV2ViR0wodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuVUkgPSBuZXcgVUkodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuYXVkaW8gPSBuZXcgQXVkaW9BUEkoKTtcclxuXHRcclxuXHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXJTdGF0cygpO1xyXG5cdHRoaXMuaW52ZW50b3J5ID0gbmV3IEludmVudG9yeSgxMCk7XHJcblx0dGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUoMTAsIDEwLCAzMDAsIHRoaXMpO1xyXG5cdHRoaXMuc2F2ZU1hbmFnZXIgPSBuZXcgU2F2ZU1hbmFnZXIodGhpcyk7XHJcblx0dGhpcy5mb250ID0gJzEwcHggXCJDb3VyaWVyXCInO1xyXG5cdFxyXG5cdHRoaXMuZ3JQYWNrID0gJ2ltZy8nO1xyXG5cdFxyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLmtleXMgPSBbXTtcclxuXHR0aGlzLnVuaXF1ZVJlZ2lzdHJ5ID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKVxyXG5cdH07XHJcblx0dGhpcy5tb3VzZSA9IHZlYzMoMC4wLCAwLjAsIDApO1xyXG5cdHRoaXMubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0dGhpcy5pbWFnZXMgPSB7fTtcclxuXHR0aGlzLm11c2ljID0ge307XHJcblx0dGhpcy5zb3VuZHMgPSB7fTtcclxuXHR0aGlzLnRleHR1cmVzID0ge3dhbGw6IFtdLCBmbG9vcjogW10sIGNlaWw6IFtdfTtcclxuXHR0aGlzLm9iamVjdFRleCA9IHt9O1xyXG5cdHRoaXMubW9kZWxzID0ge307XHJcblx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdHRoaXMucGF1c2VkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy50aW1lU3RvcCA9IDA7XHJcblx0dGhpcy5wcm90ZWN0aW9uID0gMDtcclxuXHRcclxuXHR0aGlzLmZwcyA9ICgxMDAwIC8gMzApIDw8IDA7XHJcblx0dGhpcy5sYXN0VCA9IDA7XHJcblx0dGhpcy5udW1iZXJGcmFtZXMgPSAwO1xyXG5cdHRoaXMuZmlyc3RGcmFtZSA9IERhdGUubm93KCk7XHJcblx0XHJcblx0dGhpcy5sb2FkSW1hZ2VzKCk7XHJcblx0dGhpcy5sb2FkTXVzaWMoKTtcclxuXHR0aGlzLmxvYWRUZXh0dXJlcygpO1xyXG5cdFxyXG5cdHRoaXMuY3JlYXRlM0RPYmplY3RzKCk7XHJcblx0QW5pbWF0ZWRUZXh0dXJlLmluaXQodGhpcy5HTC5jdHgpO1xyXG59XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGUzRE9iamVjdHMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuZG9vciA9IE9iamVjdEZhY3RvcnkuZG9vcih2ZWMzKDAuNSwwLjc1LDAuMSksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4LCBmYWxzZSk7XHJcblx0dGhpcy5kb29yVyA9IE9iamVjdEZhY3RvcnkuZG9vcldhbGwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHR0aGlzLmRvb3JDID0gT2JqZWN0RmFjdG9yeS5jdWJlKHZlYzMoMS4wLDEuMCwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgdHJ1ZSk7XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMC4wKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdHRoaXMuc2xvcGUgPSBPYmplY3RGYWN0b3J5LnNsb3BlKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnNvdW5kcy5oaXQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwid2F2L2hpdC53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLnNvdW5kcy5taXNzID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9taXNzLndhdj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuc291bmRzLmJsb2NrID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9ibG9jay53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24xID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wOF8tX1VsdGltYV80Xy1fQzY0Xy1fRHVuZ2VvbnMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpY1Bvc3QgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjIgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAyXy1fVWx0aW1hXzVfLV9DNjRfLV9Ccml0YW5uaWNfTGFuZHMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24zID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wNV8tX1VsdGltYV8zXy1fQzY0Xy1fQ29tYmF0Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfM18tX0M2NF8tX0V4b2R1cydfQ2FzdGxlLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDRfLV9VbHRpbWFfNV8tX0M2NF8tX0VuZ2FnZW1lbnRfYW5kX01lbGVlLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNiA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDNfLV9VbHRpbWFfNF8tX0M2NF8tX0xvcmRfQnJpdGlzaCdzX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjcgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzExXy1fVWx0aW1hXzVfLV9DNjRfLV9Xb3JsZHNfQmVsb3cub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb244ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMF8tX1VsdGltYV81Xy1fQzY0Xy1fSGFsbHNfb2ZfRG9vbS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuY29kZXhSb29tID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wN18tX1VsdGltYV80Xy1fQzY0Xy1fU2hyaW5lcy5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEltYWdlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbWFnZXMuaXRlbXNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpdGVtc1VJLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDgsIGltZ1ZOdW06IDh9KTtcclxuXHR0aGlzLmltYWdlcy5zcGVsbHNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzcGVsbHNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA0LCBpbWdWTnVtOiA0fSk7XHJcblx0dGhpcy5pbWFnZXMudGl0bGVTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0aXRsZVNjcmVlbi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHRcclxuXHR0aGlzLmltYWdlcy5pbnRybzEgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnRybzEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW50cm8yID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm8yLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludHJvMyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludHJvMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnRybzQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnRybzQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMuZW5kaW5nU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmVuZGluZ1NjcmVlbjIgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmRpbmcyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmVuZGluZ1NjcmVlbjMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmRpbmczLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnNlbGVjdENsYXNzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2VsZWN0Q2xhc3MucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5RHJvcC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiAxLCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlfc2VsZWN0ZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2Nyb2xsRm9udCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNjcm9sbEZvbnRXaGl0ZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5yZXN0YXJ0ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicmVzdGFydC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5wYXVzZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJwYXVzZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMudmlld3BvcnRXZWFwb25zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidmlld3BvcnRXZWFwb25zLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDQsIGltZ1ZOdW06IDR9KTtcclxuXHR0aGlzLmltYWdlcy5jb21wYXNzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY29tcGFzc1VJLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHt4T3JpZzogMTEsIHlPcmlnOiAxMSwgaW1nTnVtOiAyLCBpbWdWTnVtOiAxfSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkVGV4dHVyZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMudGV4dHVyZXMgPSB7d2FsbDogW251bGxdLCBmbG9vcjogW251bGxdLCBjZWlsOiBbbnVsbF0sIHdhdGVyOiBbbnVsbF19O1xyXG5cdFxyXG5cdC8vIE5vIFRleHR1cmVcclxuXHR2YXIgbm9UZXggPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJub1RleHR1cmUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaChub1RleCk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKG5vVGV4KTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaChub1RleCk7XHJcblx0XHJcblx0Ly8gV2FsbHNcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYWxsMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2FsbDAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw2LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDExLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gRmxvb3JzXHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vcls1MF0gPSAodGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SG9sZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUwLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gTGlxdWlkc1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleExhdmEwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHRcclxuXHQvLyBDZWlsaW5nc1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleENlaWwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWxbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEl0ZW1zXHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhJdGVtcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg4LCA4LCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXNNaXNjID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TWlzYy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zTWlzYy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoOCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFNwZWxscy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIE1hZ2ljIEJvbHRzXHJcblx0dGhpcy5vYmplY3RUZXguYm9sdHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhCb2x0cy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gU3RhaXJzXHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4U3RhaXJzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3JkcygyLCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gRW5lbWllc1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwaWRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNwaWRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnRyb2xsX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4VHJvbGxSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5nYXplcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdhemVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2hvc3RfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHaG9zdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmhlYWRsZXNzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4SGVhZGxlc3NSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vcmNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPcmNSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yZWFwZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSZWFwZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5za2VsZXRvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNrZWxldG9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LmRhZW1vbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERhZW1vblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tb25nYmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TW9uZ2JhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oeWRyYV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEh5ZHJhUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNlYVNlcnBlbnRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTZWFTZXJwZW50UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9jdG9wdXNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPY3RvcHVzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhbHJvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhbHJvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5saWNoZV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExpY2hlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ3JlbWxpbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdyZW1saW5SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZHJhZ29uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RHJhZ29uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lnpvcm5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhab3JuUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4Lndpc3BfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhXaXNwUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm1hZ2VfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhNYWdlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhbmdlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhbmdlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5maWdodGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RmlnaHRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4QmFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5sYXZhTGl6YXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGF2YUxpemFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBvc3RMb2FkaW5nID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmNvbnNvbGUuY3JlYXRlU3ByaXRlRm9udCh0aGlzLmltYWdlcy5zY3JvbGxGb250LCBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5IT8sLi9cIiwgNyk7XHJcblx0dGhpcy5sb2FkTXVzaWNQb3N0KCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuYXVkaW8uc3RvcE11c2ljKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wbGF5TXVzaWMgPSBmdW5jdGlvbihtdXNpY0NvZGUsIGxvb3Ape1xyXG5cdHZhciBhdWRpb0YgPSB0aGlzLm11c2ljW211c2ljQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuc3RvcE11c2ljKCk7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBsb29wLCB0cnVlLCAwLjIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRDb2RlKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5zb3VuZHNbc291bmRDb2RlXTtcclxuXHRpZiAoIWF1ZGlvRikgcmV0dXJuIG51bGw7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBmYWxzZSwgZmFsc2UsIDAuMyk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRVSSA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuVUkuY3R4O1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VGV4dHVyZUJ5SWQgPSBmdW5jdGlvbih0ZXh0dXJlSWQsIHR5cGUpe1xyXG5cdGlmICghdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdKSB0ZXh0dXJlSWQgPSAxO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLnRleHR1cmVzW3R5cGVdW3RleHR1cmVJZF07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRPYmplY3RUZXh0dXJlID0gZnVuY3Rpb24odGV4dHVyZUNvZGUpe1xyXG5cdGlmICghdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdKSB0aHJvdyBcIkludmFsaWQgdGV4dHVyZSBjb2RlOiBcIiArIHRleHR1cmVDb2RlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLm9iamVjdFRleFt0ZXh0dXJlQ29kZV07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTWFwID0gZnVuY3Rpb24obWFwLCBkZXB0aCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdGlmIChkZXB0aCA9PT0gdW5kZWZpbmVkIHx8ICFnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IG5ldyBNYXBNYW5hZ2VyKCk7XHJcblx0XHRnYW1lLm1hcC5pbml0KGdhbWUsIG1hcCwgZGVwdGgpO1xyXG5cdFx0Z2FtZS5mbG9vckRlcHRoID0gZGVwdGg7XHJcblx0XHRnYW1lLm1hcHMucHVzaChnYW1lLm1hcCk7XHJcblx0fWVsc2UgaWYgKGdhbWUubWFwc1tkZXB0aCAtIDFdKXtcclxuXHRcdGdhbWUubWFwID0gZ2FtZS5tYXBzW2RlcHRoIC0gMV07XHJcblx0fVxyXG5cdGdhbWUuc2NlbmUgPSBudWxsO1xyXG5cdGlmIChkZXB0aClcclxuXHRcdGdhbWUucGxheU11c2ljKCdkdW5nZW9uJytkZXB0aCwgdHJ1ZSk7XHJcblx0ZWxzZSBpZiAobWFwID09PSAnY29kZXhSb29tJylcclxuXHRcdGdhbWUucGxheU11c2ljKCdjb2RleFJvb20nLCB0cnVlKTtcclxuXHRnYW1lLnBsYXllci5jdXJyZW50TWFwID0gbWFwO1xyXG5cdGdhbWUucGxheWVyLmN1cnJlbnREZXB0aCA9IGRlcHRoO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRHcmVldCA9IGZ1bmN0aW9uKCl7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wcmludFdlbGNvbWVCYWNrID0gZnVuY3Rpb24oKXtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW52ZW50b3J5LnJlc2V0KCk7XHJcblx0dGhpcy5wbGF5ZXIucmVzZXQoKTtcclxuXHRcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLm1hcCA9IG51bGw7XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5jb25zb2xlLm1lc3NhZ2VzID0gW107XHRcclxuXHR0aGlzLnNjZW5lID0gbmV3IFRpdGxlU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZW5kaW5nID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmludmVudG9yeS5yZXNldCgpO1xyXG5cdHRoaXMucGxheWVyLnJlc2V0KCk7XHJcblx0dGhpcy5tYXBzID0gW107XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMuY29uc29sZS5tZXNzYWdlcyA9IFtdO1x0XHJcblx0dGhpcy5zY2VuZSA9IG5ldyBFbmRpbmdTY3JlZW4odGhpcyk7XHJcblx0dGhpcy5sb29wKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkR2FtZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdGlmIChnYW1lLkdMLmFyZUltYWdlc1JlYWR5KCkgJiYgZ2FtZS5hdWRpby5hcmVTb3VuZHNSZWFkeSgpKXtcclxuXHRcdGdhbWUucG9zdExvYWRpbmcoKTtcclxuXHRcdGdhbWUubmV3R2FtZSgpO1xyXG5cdH1lbHNle1xyXG5cdFx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvYWRHYW1lKCk7IH0pO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRyZXR1cm4gdGhpcy5pbnZlbnRvcnkuYWRkSXRlbShpdGVtKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIHRleHR1cmUpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KG9iamVjdCwgY2FtZXJhLCB0ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdCbG9jayA9IGZ1bmN0aW9uKGJsb2NrT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGNhbWVyYSA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRcclxuXHR0aGlzLkdMLmRyYXdPYmplY3QoYmxvY2tPYmplY3QsIGNhbWVyYSwgdGhpcy5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JXYWxsID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JXLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yVywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vckN1YmUgPSBmdW5jdGlvbih4LCB5LCB6LCB0ZXhJZCwgdmVydGljYWwpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuZG9vckMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGlmICh2ZXJ0aWNhbCkgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCxNYXRoLlBJXzIsMCk7IGVsc2UgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCwwLDApO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3JDLCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yID0gZnVuY3Rpb24oeCwgeSwgeiwgcm90YXRpb24sIHRleElkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3IucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGdhbWUuZG9vci5yb3RhdGlvbi5iID0gcm90YXRpb247XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vciwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3Rmxvb3IgPSBmdW5jdGlvbihmbG9vck9iamVjdCwgdGV4SWQsIHR5cGVPZil7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIGZ0ID0gdHlwZU9mO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChmbG9vck9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBmdCkudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmlsbGJvYXJkID0gZnVuY3Rpb24ocG9zaXRpb24sIHRleElkLCBiaWxsYm9hcmQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdGlmICghYmlsbGJvYXJkKSBiaWxsYm9hcmQgPSBnYW1lLmJpbGxib2FyZDtcclxuXHRcclxuXHRiaWxsYm9hcmQucG9zaXRpb24uc2V0KHBvc2l0aW9uKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoYmlsbGJvYXJkLCBjYW1lcmEsIGdhbWUub2JqZWN0VGV4W3RleElkXS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdTbG9wZSA9IGZ1bmN0aW9uKHNsb3BlT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KHNsb3BlT2JqZWN0LCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwiZmxvb3JcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3VUkgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgcGxheWVyID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdGlmICghcGxheWVyKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGN0eCA9IGdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdC8vIERyYXcgaGVhbHRoIGJhclxyXG5cdHZhciBocCA9IHBzLmhwIC8gcHMubUhQO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigxMjIsMCwxMjIpXCIgOiBcInJnYigxMjIsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsNzUsNCk7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IChwcy5wb2lzb25lZCk/IFwicmdiKDIwMCwwLDIwMClcIiA6IFwicmdiKDIwMCwwLDApXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsOCwoNzUgKiBocCkgPDwgMCw0KTtcclxuXHRcclxuXHQvLyBEcmF3IG1hbmFcclxuXHR2YXIgbWFuYSA9IHBzLm1hbmEgLyBwcy5tTWFuYTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTgxLDk4LDIwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LDYwLDIpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsMTM4LDI4KVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LCg2MCAqIG1hbmEpIDw8IDAsMik7XHJcblx0XHJcblx0Ly8gRHJhdyBJbnZlbnRvcnlcclxuXHRpZiAodGhpcy5zZXREcm9wSXRlbSlcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wLCA5MCwgNiwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeSwgOTAsIDYsIDApO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnZlbnRvcnkuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdFx0dmFyIHNwciA9IGl0ZW0udGV4ICsgJ191aSc7XHJcblxyXG5cdFx0aWYgKCF0aGlzLnNldERyb3BJdGVtICYmIChpdGVtLnR5cGUgPT0gJ3dlYXBvbicgfHwgaXRlbS50eXBlID09ICdhcm1vdXInKSAmJiBpdGVtLmVxdWlwcGVkKVxyXG5cdFx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQsIDkwICsgKDIyICogaSksIDYsIDApO1x0XHRcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlc1tzcHJdLCA5MyArICgyMiAqIGkpLCA5LCBpdGVtLnN1YkltZyk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAxKTtcclxuXHRcclxuXHQvLyBJZiB0aGUgcGxheWVyIGlzIGh1cnQgZHJhdyBhIHJlZCBzY3JlZW5cclxuXHRpZiAocGxheWVyLmh1cnQgPiAwLjApe1xyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLDAuNSlcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1lbHNlIGlmICh0aGlzLnByb3RlY3Rpb24gPiAwLjApe1x0Ly8gSWYgdGhlIHBsYXllciBoYXMgcHJvdGVjdGlvbiB0aGVuIGRyYXcgaXQgc2xpZ2h0bHkgYmx1ZVxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSg0MCw0MCwyNTUsMC4yKVwiO1xyXG5cdFx0Y3R4LmZpbGxSZWN0KDAsMCxjdHgud2lkdGgsY3R4LmhlaWdodCk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKXtcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5yZXN0YXJ0LCA4NSwgOTQsIDApO1xyXG5cdH1lbHNlIGlmICh0aGlzLnBhdXNlZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucGF1c2VkLCAxNDcsIDk0LCAwKTtcclxuXHR9XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnRGVwdGggJyt0aGlzLmZsb29yRGVwdGgsIDEwLDI1LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTGV2ZWwgJyArIHBzLmx2bCsnICcrdGhpcy5wbGF5ZXIuY2xhc3NOYW1lLCAxMCwzMyx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0hQOiAnK3BzLmhwLCAxMCw5LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTWFuYTonK3BzLm1hbmEsIDEwLDE3LHRoaXMuY29uc29sZSk7XHJcblxyXG5cdC8vIERyYXcgdGhlIGNvbXBhc3NcclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuY29tcGFzcywgMzIwLCAxMiwgMCk7XHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlRXh0KHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDEsIE1hdGguUEkgKyB0aGlzLm1hcC5wbGF5ZXIucm90YXRpb24uYik7XHJcblxyXG5cdHZhciB3ZWFwb24gPSB0aGlzLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRpZiAod2VhcG9uICYmIHdlYXBvbi52aWV3UG9ydEltZyA+PSAwKVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnZpZXdwb3J0V2VhcG9ucywgMTYwLCAxMzAgKyB0aGlzLm1hcC5wbGF5ZXIubGF1bmNoQXR0YWNrQ291bnRlciAqIDIgLSB0aGlzLm1hcC5wbGF5ZXIuYXR0YWNrV2FpdCAqIDEuNSwgd2VhcG9uLnZpZXdQb3J0SW1nKTtcclxuXHRnYW1lLmNvbnNvbGUucmVuZGVyKDgsIDEyMCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRFeHBlcmllbmNlID0gZnVuY3Rpb24oZXhwUG9pbnRzKXtcclxuXHR0aGlzLnBsYXllci5hZGRFeHBlcmllbmNlKGV4cFBvaW50cywgdGhpcy5jb25zb2xlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkgPSBmdW5jdGlvbihjbGFzc05hbWUpe1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zID0gW107XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWNTd29yZCcsIDEuMCk7XHJcblx0aXRlbS5lcXVpcHBlZCA9IHRydWU7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChpdGVtKTtcclxuXHRcclxuXHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ215c3RpYycsIDEuMCk7XHJcblx0aXRlbS5lcXVpcHBlZCA9IHRydWU7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChpdGVtKTtcclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnTWFnZSc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdEcnVpZCc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0Y2FzZSAnQmFyZCc6IGNhc2UgJ1BhbGFkaW4nOiBjYXNlICdSYW5nZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdsaWdodCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnQmFyZCc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRjYXNlICdUaW5rZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0ZGVmYXVsdDpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdyZWRQb3Rpb24nKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0RydWlkJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnYm93TWFnaWMnLCAwLjYpKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdUaW5rZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdzbGluZ0V0dGluJywgMC43KSk7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnVzZUl0ZW0gPSBmdW5jdGlvbihpbmRleCl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpbmRleF07XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0dmFyIHAgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0cC5tb3ZlZCA9IHRydWU7XHJcblx0c3dpdGNoIChpdGVtLmNvZGUpe1xyXG5cdFx0Y2FzZSAncmVkUG90aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2FybGljIHBvdGlvbiBjdXJlcyB5b3UuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAneWVsbG93UG90aW9uJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAxMDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdpbnNlbmcgcG90aW9uIGhlYWxzIHlvdSBmb3IgXCIraGVhbCArIFwiIHBvaW50cy5cIik7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaW5kZXgpO1xyXG59XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hY3RpdmVTcGVsbCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2luZGV4XTtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHR2YXIgcCA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRwLm1vdmVkID0gdHJ1ZTtcclxuXHRcclxuXHRpZiAocHMubWFuYSA8IGl0ZW0ubWFuYSl7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90IGVub3VnaCBtYW5hXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRwcy5tYW5hID0gTWF0aC5tYXgocHMubWFuYSAtIGl0ZW0ubWFuYSwgMCk7XHJcblx0XHJcblx0c3dpdGNoIChpdGVtLmNvZGUpe1xyXG5cdFx0Y2FzZSAnY3VyZSc6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiQU4gTk9YIVwiKTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiWW91IGFyZSBjdXJlZC5cIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1guLi5cIik7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2hlYWwnOlxyXG5cdFx0XHR2YXIgaGVhbCA9ICh0aGlzLnBsYXllci5tSFAgKiBpdGVtLnBlcmNlbnQpIDw8IDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTUFOSSEgXCIraGVhbCArIFwiIHBvaW50cyBoZWFsZWRcIik7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAneWVsbG93UG90aW9uJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAxMDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdpbnNlbmcgcG90aW9uIGhlYWxzIHlvdSBmb3IgXCIraGVhbCArIFwiIHBvaW50cy5cIik7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnbGlnaHQnOlxyXG5cdFx0XHRpZiAodGhpcy5HTC5saWdodCA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuR0wubGlnaHQgPSBpdGVtLmxpZ2h0VGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gTE9SIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ21pc3NpbGUnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0XHRcdG1pc3NpbGUuaW5pdChwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ21hZ2ljTWlzc2lsZScsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJHUkFWIFBPUiFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaWNlYmFsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRcdFx0bWlzc2lsZS5pbml0KHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnaWNlQmFsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJWQVMgRlJJTyFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncmVwZWwnOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2JsaW5rJzpcclxuXHRcdFx0dmFyIGxhc3RQb3MgPSBudWxsO1xyXG5cdFx0XHR2YXIgcG9ydGVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLm1hcC5wbGF5ZXIucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpciA9IHRoaXMubWFwLnBsYXllci5yb3RhdGlvbjtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBkeCA9IE1hdGguY29zKGRpci5iKTtcclxuXHRcdFx0dmFyIGR6ID0gLU1hdGguc2luKGRpci5iKTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPDE1O2krKyl7XHJcblx0XHRcdFx0cG9zLmEgKz0gZHg7XHJcblx0XHRcdFx0cG9zLmMgKz0gZHo7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGN4ID0gcG9zLmEgPDwgMDtcclxuXHRcdFx0XHR2YXIgY3kgPSBwb3MuYyA8PCAwO1xyXG5cdFx0XHRcdGlmICh0aGlzLm1hcC5pc1NvbGlkKGN4LCBjeSkpe1xyXG5cdFx0XHRcdFx0aWYgKGxhc3RQb3Mpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdFx0bGFzdFBvcy5zdW0odmVjMygwLjUsMCwwLjUpKTtcclxuXHRcdFx0XHRcdFx0dmFyIHBvcnRlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHAucG9zaXRpb24gPSBsYXN0UG9zO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGkgPSAxNTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGlmICghdGhpcy5tYXAuaXNXYXRlclBvc2l0aW9uKGN4LCBjeSkpe1xyXG5cdFx0XHRcdFx0XHR2YXIgaW5zID0gdGhpcy5tYXAuZ2V0SW5zdGFuY2VBdEdyaWQocG9zKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFpbnMpe1xyXG5cdFx0XHRcdFx0XHRcdGxhc3RQb3MgPSB2ZWMzKGN4LCBwb3MuYiwgY3kpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIXBvcnRlZCl7XHJcblx0XHRcdFx0aWYgKGxhc3RQb3Mpe1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFBPUiFcIik7XHJcblx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ZpcmViYWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdmaXJlQmFsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJWQVMgRkxBTSFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncHJvdGVjdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnByb3RlY3Rpb24gPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLnByb3RlY3Rpb24gPSBpdGVtLnByb3RUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBTQU5DVCFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd0aW1lJzpcclxuXHRcdFx0aWYgKHRoaXMudGltZVN0b3AgPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLnRpbWVTdG9wID0gaXRlbS5zdG9wVGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUkVMIFRZTSFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdzbGVlcCc6XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBaVSFcIik7XHJcblx0XHRcdHZhciBpbnN0YW5jZXMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZXNOZWFyZXN0KHAucG9zaXRpb24sIDYsICdlbmVteScpO1xyXG5cdFx0XHRmb3IgKHZhciBpPTAsbGVuPWluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRpbnN0YW5jZXNbaV0uc2xlZXAgPSBpdGVtLnNsZWVwVGltZTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ppbngnOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3RyZW1vcic6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRcdFx0bWlzc2lsZS5pbml0KHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAna2lsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJYRU4gQ09SUCFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaW5kZXgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJvcEl0ZW0gPSBmdW5jdGlvbihpKXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0dmFyIGNsZWFuUG9zID0gdGhpcy5tYXAuZ2V0TmVhcmVzdENsZWFuSXRlbVRpbGUocGxheWVyLnBvc2l0aW9uLmEsIHBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRpZiAoIWNsZWFuUG9zKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ0Nhbm5vdCBkcm9wIGl0IGhlcmUnKTtcclxuXHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyBkcm9wcGVkJyk7XHJcblx0XHRjbGVhblBvcy5hICs9IDAuNTtcclxuXHRcdGNsZWFuUG9zLmMgKz0gMC41O1xyXG5cdFx0XHJcblx0XHR2YXIgbkl0ID0gbmV3IEl0ZW0oKTtcclxuXHRcdG5JdC5pbml0KGNsZWFuUG9zLCBudWxsLCB0aGlzLm1hcCk7XHJcblx0XHRuSXQuc2V0SXRlbShpdGVtKTtcclxuXHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG5JdCk7XHJcblx0XHRcclxuXHRcdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGkpO1xyXG5cdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNoZWNrSW52Q29udHJvbCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRcclxuXHRpZiAocGxheWVyICYmIHBsYXllci5kZXN0cm95ZWQpe1xyXG5cdFx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4Mikpe1xyXG5cdFx0XHRkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0dGhpcy5uZXdHYW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICghcGxheWVyIHx8IHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgwKSl7XHJcblx0XHR0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZDtcclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMucGF1c2VkKSByZXR1cm47XHJcblx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4NCkpe1xyXG5cdFx0aWYgKCF0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnU2VsZWN0IHRoZSBpdGVtIHRvIGRyb3AnKTtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IHRydWU7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MTA7aSsrKXtcclxuXHRcdHZhciBpbmRleCA9IDQ5ICsgaTtcclxuXHRcdGlmIChpID09IDkpXHJcblx0XHRcdGluZGV4ID0gNDg7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKGluZGV4KSl7XHJcblx0XHRcdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaV07XHJcblx0XHRcdGlmICghaXRlbSl7XHJcblx0XHRcdFx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnTm8gaXRlbScpO1xyXG5cdFx0XHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHRcdHRoaXMuZHJvcEl0ZW0oaSk7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmIChpdGVtLnR5cGUgPT0gJ3dlYXBvbicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3aWVsZGVkJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdhcm1vdXInICYmICFpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgd29ybicpO1xyXG5cdFx0XHRcdHRoaXMuaW52ZW50b3J5LmVxdWlwSXRlbShpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnbWFnaWMnKXtcclxuXHRcdFx0XHR0aGlzLmFjdGl2ZVNwZWxsKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdwb3Rpb24nKXtcclxuXHRcdFx0XHR0aGlzLnVzZUl0ZW0oaSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IFxyXG5cdFxyXG5cdHJldHVybjtcclxuXHRcclxuXHRpZiAocHMucG90aW9ucyA+IDApe1xyXG5cdFx0aWYgKHBzLmhwID09IHBzLm1IUCl7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIZWFsdGggaXMgYWxyZWFkeSBhdCBtYXhcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cHMucG90aW9ucyAtPSAxO1xyXG5cdFx0cHMuaHAgPSBNYXRoLm1pbihwcy5tSFAsIHBzLmhwICsgNSk7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUG90aW9uIHVzZWRcIik7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm8gbW9yZSBwb3Rpb25zIGxlZnQuXCIpO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdsb2JhbExvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnByb3RlY3Rpb24gPiAwKXsgdGhpcy5wcm90ZWN0aW9uIC09IDE7IH1cclxuXHRpZiAodGhpcy50aW1lU3RvcCA+IDApeyB0aGlzLnRpbWVTdG9wIC09IDE7IH1cclxuXHRpZiAodGhpcy5HTC5saWdodCA+IDApeyB0aGlzLkdMLmxpZ2h0IC09IDE7IH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHR2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuXHR2YXIgZFQgPSAobm93IC0gZ2FtZS5sYXN0VCk7XHJcblx0XHJcblx0Ly8gTGltaXQgdGhlIGdhbWUgdG8gdGhlIGJhc2Ugc3BlZWQgb2YgdGhlIGdhbWVcclxuXHRpZiAoZFQgPiBnYW1lLmZwcyl7XHJcblx0XHRnYW1lLmxhc3RUID0gbm93IC0gKGRUICUgZ2FtZS5mcHMpO1xyXG5cdFx0XHJcblx0XHRpZiAoIWdhbWUuR0wuYWN0aXZlKXtcclxuXHRcdFx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvb3AoKTsgfSk7IFxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLm1hcCAhPSBudWxsKXtcclxuXHRcdFx0dmFyIGdsID0gZ2FtZS5HTC5jdHg7XHJcblx0XHRcdFxyXG5cdFx0XHRnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcblx0XHRcdGdhbWUuVUkuY2xlYXIoKTtcclxuXHRcdFx0XHJcblx0XHRcdGdhbWUuZ2xvYmFsTG9vcCgpO1xyXG5cdFx0XHRnYW1lLmNoZWNrSW52Q29udHJvbCgpO1xyXG5cdFx0XHRnYW1lLm1hcC5sb29wKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5tYXApXHJcblx0XHRcdFx0Z2FtZS5kcmF3VUkoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMuc2NlbmUgIT0gbnVsbCl7XHJcblx0XHRcdGdhbWUuc2NlbmUubG9vcCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldEtleVByZXNzZWQgPSBmdW5jdGlvbihrZXlDb2RlKXtcclxuXHRpZiAodGhpcy5rZXlzW2tleUNvZGVdID09IDEpe1xyXG5cdFx0dGhpcy5rZXlzW2tleUNvZGVdID0gMjtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1vdXNlLmMgPT0gMSl7XHJcblx0XHR0aGlzLm1vdXNlLmMgPSAyO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE1vdXNlTW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdHZhciByZXQgPSB7eDogdGhpcy5tb3VzZU1vdmVtZW50LngsIHk6IHRoaXMubW91c2VNb3ZlbWVudC55fTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5VdGlscy5hZGRFdmVudCh3aW5kb3csIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gbmV3IFVuZGVyd29ybGQoKTtcclxuXHRnYW1lLmxvYWRHYW1lKCk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwia2V5ZG93blwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChlLmtleUNvZGUgPT0gOCl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5rZXlzW2Uua2V5Q29kZV0gPT0gMikgcmV0dXJuO1xyXG5cdFx0Z2FtZS5rZXlzW2Uua2V5Q29kZV0gPSAxO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcImtleXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGUua2V5Q29kZSA9PSA4KXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGdhbWUua2V5c1tlLmtleUNvZGVdID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZ2FtZS5VSS5jYW52YXM7XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1hcCAhPSBudWxsKVxyXG5cdFx0XHRjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubW91c2UuYyA9PSAyKSByZXR1cm47XHJcblx0XHRnYW1lLm1vdXNlLmMgPSAxO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5jID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xyXG5cdFx0Z2FtZS5maXJzdEZyYW1lID0gRGF0ZS5ub3coKTtcclxuXHRcdGdhbWUubnVtYmVyRnJhbWVzID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwicmVzaXplXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgc2NhbGUgPSBVdGlscy4kJChcImRpdkdhbWVcIikub2Zmc2V0SGVpZ2h0IC8gZ2FtZS5zaXplLmI7XHJcblx0XHR2YXIgY2FudmFzID0gZ2FtZS5HTC5jYW52YXM7XHJcblx0XHRcclxuXHRcdGNhbnZhcyA9IGdhbWUuVUkuY2FudmFzO1xyXG5cdFx0Z2FtZS5VSS5zY2FsZSA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBjYW52YXMuaGVpZ2h0O1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBtb3ZlQ2FsbGJhY2sgPSBmdW5jdGlvbihlKXtcclxuXHRcdGdhbWUubW91c2VNb3ZlbWVudC54ID0gZS5tb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0ZS5tb3pNb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0ZS53ZWJraXRNb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0MDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRnYW1lLm1vdXNlTW92ZW1lbnQueSA9IGUubW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdGUubW96TW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdGUud2Via2l0TW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdDA7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgcG9pbnRlcmxvY2tjaGFuZ2UgPSBmdW5jdGlvbihlKXtcclxuXHRcdGlmIChkb2N1bWVudC5wb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyB8fFxyXG5cdFx0XHRkb2N1bWVudC5tb3pQb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyB8fFxyXG5cdFx0XHRkb2N1bWVudC53ZWJraXRQb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIm1vdXNlbW92ZVwiLCBtb3ZlQ2FsbGJhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUNhbGxiYWNrKTtcclxuXHRcdFx0Z2FtZS5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcInBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJtb3pwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwid2Via2l0cG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJibHVyXCIsIGZ1bmN0aW9uKGUpeyBnYW1lLkdMLmFjdGl2ZSA9IGZhbHNlOyBnYW1lLmF1ZGlvLnBhdXNlTXVzaWMoKTsgIH0pO1xyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJmb2N1c1wiLCBmdW5jdGlvbihlKXsgZ2FtZS5HTC5hY3RpdmUgPSB0cnVlOyBnYW1lLmF1ZGlvLnJlc3RvcmVNdXNpYygpOyB9KTtcclxufSk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGFkZEV2ZW50OiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmdW5jKXtcclxuXHRcdGlmIChvYmouYWRkRXZlbnRMaXN0ZW5lcil7XHJcblx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZ1bmMsIGZhbHNlKTtcclxuXHRcdH1lbHNlIGlmIChvYmouYXR0YWNoRXZlbnQpe1xyXG5cdFx0XHRvYmouYXR0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZnVuYyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHQkJDogZnVuY3Rpb24ob2JqSWQpe1xyXG5cdFx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvYmpJZCk7XHJcblx0XHRpZiAoIWVsZW0pIGFsZXJ0KFwiQ291bGRuJ3QgZmluZCBlbGVtZW50OiBcIiArIG9iaklkKTtcclxuXHRcdHJldHVybiBlbGVtO1xyXG5cdH0sXHJcblx0Z2V0SHR0cDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBodHRwO1xyXG5cdFx0aWYgICh3aW5kb3cuWE1MSHR0cFJlcXVlc3Qpe1xyXG5cdFx0XHRodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHR9ZWxzZSBpZiAod2luZG93LkFjdGl2ZVhPYmplY3Qpe1xyXG5cdFx0XHRodHRwID0gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBodHRwO1xyXG5cdH0sXHJcblx0cm9sbERpY2U6IGZ1bmN0aW9uIChwYXJhbSl7XHJcblx0XHR2YXIgYSA9IHBhcnNlSW50KHBhcmFtLnN1YnN0cmluZygwLCBwYXJhbS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0XHR2YXIgYiA9IHBhcnNlSW50KHBhcmFtLnN1YnN0cmluZyhwYXJhbS5pbmRleE9mKCdEJykgKyAxKSwgMTApO1xyXG5cdFx0dmFyIHJvbGwxID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogYik7XHJcblx0XHR2YXIgcm9sbDIgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBiKTtcclxuXHRcdHJldHVybiBNYXRoLmNlaWwoYSAqIChyb2xsMStyb2xsMikvMik7XHJcblx0fVxyXG59XHJcblx0XHJcbi8vIE1hdGggcHJvdG90eXBlIG92ZXJyaWRlc1x0XHJcbk1hdGgucmFkUmVsYXRpb24gPSBNYXRoLlBJIC8gMTgwO1xyXG5NYXRoLmRlZ1JlbGF0aW9uID0gMTgwIC8gTWF0aC5QSTtcclxuTWF0aC5kZWdUb1JhZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpe1xyXG5cdHJldHVybiBkZWdyZWVzICogdGhpcy5yYWRSZWxhdGlvbjtcclxufTtcclxuTWF0aC5yYWRUb0RlZyA9IGZ1bmN0aW9uKHJhZGlhbnMpe1xyXG5cdHJldHVybiAoKHJhZGlhbnMgKiB0aGlzLmRlZ1JlbGF0aW9uKSArIDcyMCkgJSAzNjA7XHJcbn07XHJcbk1hdGguaVJhbmRvbSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG5cdGlmIChiID09PSB1bmRlZmluZWQpe1xyXG5cdFx0YiA9IGE7XHJcblx0XHRhID0gMDtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGEgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoYiAtIGEpKTtcclxufTtcclxuXHJcbk1hdGguZ2V0QW5nbGUgPSBmdW5jdGlvbigvKlZlYzIqLyBhLCAvKlZlYzIqLyBiKXtcclxuXHR2YXIgeHggPSBNYXRoLmFicyhhLmEgLSBiLmEpO1xyXG5cdHZhciB5eSA9IE1hdGguYWJzKGEuYyAtIGIuYyk7XHJcblx0XHJcblx0dmFyIGFuZyA9IE1hdGguYXRhbjIoeXksIHh4KTtcclxuXHRcclxuXHQvLyBBZGp1c3QgdGhlIGFuZ2xlIGFjY29yZGluZyB0byBib3RoIHBvc2l0aW9uc1xyXG5cdGlmIChiLmEgPD0gYS5hICYmIGIuYyA8PSBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSSAtIGFuZztcclxuXHR9ZWxzZSBpZiAoYi5hIDw9IGEuYSAmJiBiLmMgPiBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSSArIGFuZztcclxuXHR9ZWxzZSBpZiAoYi5hID4gYS5hICYmIGIuYyA+IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJMiAtIGFuZztcclxuXHR9XHJcblx0XHJcblx0YW5nID0gKGFuZyArIE1hdGguUEkyKSAlIE1hdGguUEkyO1xyXG5cdFxyXG5cdHJldHVybiBhbmc7XHJcbn07XHJcblxyXG5NYXRoLlBJXzIgPSBNYXRoLlBJIC8gMjtcclxuTWF0aC5QSTIgPSBNYXRoLlBJICogMjtcclxuTWF0aC5QSTNfMiA9IE1hdGguUEkgKiAzIC8gMjtcclxuXHJcbi8vIENyb3NzYnJvd3NlciBhbmltYXRpb24vYXVkaW8gb3ZlcnJpZGVzXHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IFxyXG5cdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHwgXHJcblx0d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcclxuXHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8IFxyXG5cdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHwgXHJcblx0d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCBcclxuXHRmdW5jdGlvbigvKiBmdW5jdGlvbiAqLyBkcmF3MSl7XHJcblx0XHR3aW5kb3cuc2V0VGltZW91dChkcmF3MSwgMTAwMCAvIDMwKTtcclxuXHR9O1xyXG5cclxud2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDsiLCJ2YXIgTWF0cml4ID0gcmVxdWlyZSgnLi9NYXRyaXgnKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuZnVuY3Rpb24gV2ViR0woc2l6ZSwgY29udGFpbmVyKXtcclxuXHRpZiAoIXRoaXMuaW5pdENhbnZhcyhzaXplLCBjb250YWluZXIpKSByZXR1cm4gbnVsbDsgXHJcblx0dGhpcy5pbml0UHJvcGVydGllcygpO1xyXG5cdHRoaXMucHJvY2Vzc1NoYWRlcnMoKTtcclxuXHRcclxuXHR0aGlzLmltYWdlcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuXHR0aGlzLmxpZ2h0ID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXZWJHTDtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5pbml0Q2FudmFzID0gZnVuY3Rpb24oc2l6ZSwgY29udGFpbmVyKXtcclxuXHR2YXIgc2NhbGUgPSBVdGlscy4kJChcImRpdkdhbWVcIikub2Zmc2V0SGVpZ2h0IC8gc2l6ZS5iO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNpemUuYTtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc2l6ZS5iO1xyXG5cdGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHRjYW52YXMuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuXHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0XHJcblx0aWYgKCFjYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKSl7XHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIik7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKTtcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmluaXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHRnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XHJcblx0Z2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG5cdGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xyXG5cdFxyXG5cdGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdGdsLmVuYWJsZSggZ2wuQkxFTkQgKTtcclxuXHRnbC5ibGVuZEVxdWF0aW9uKCBnbC5GVU5DX0FERCApO1xyXG5cdGdsLmJsZW5kRnVuYyggZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBICk7XHJcblx0XHJcblx0dGhpcy5hc3BlY3RSYXRpbyA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG5cdHRoaXMucGVyc3BlY3RpdmVNYXRyaXggPSBNYXRyaXgubWFrZVBlcnNwZWN0aXZlKDQ1LCB0aGlzLmFzcGVjdFJhdGlvLCAwLjAwMiwgNS4wKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5wcm9jZXNzU2hhZGVycyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ29tcGlsZSBmcmFnbWVudCBzaGFkZXJcclxuXHR2YXIgZWxTaGFkZXIgPSBVdGlscy4kJChcImZyYWdtZW50U2hhZGVyXCIpO1xyXG5cdHZhciBjb2RlID0gdGhpcy5nZXRTaGFkZXJDb2RlKGVsU2hhZGVyKTtcclxuXHR2YXIgZlNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG5cdGdsLnNoYWRlclNvdXJjZShmU2hhZGVyLCBjb2RlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKGZTaGFkZXIpO1xyXG5cdFxyXG5cdC8vIENvbXBpbGUgdmVydGV4IHNoYWRlclxyXG5cdGVsU2hhZGVyID0gVXRpbHMuJCQoXCJ2ZXJ0ZXhTaGFkZXJcIik7XHJcblx0Y29kZSA9IHRoaXMuZ2V0U2hhZGVyQ29kZShlbFNoYWRlcik7XHJcblx0dmFyIHZTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XHJcblx0Z2wuc2hhZGVyU291cmNlKHZTaGFkZXIsIGNvZGUpO1xyXG5cdGdsLmNvbXBpbGVTaGFkZXIodlNoYWRlcik7XHJcblx0XHJcblx0Ly8gQ3JlYXRlIHRoZSBzaGFkZXIgcHJvZ3JhbVxyXG5cdHRoaXMuc2hhZGVyUHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHRnbC5hdHRhY2hTaGFkZXIodGhpcy5zaGFkZXJQcm9ncmFtLCBmU2hhZGVyKTtcclxuXHRnbC5hdHRhY2hTaGFkZXIodGhpcy5zaGFkZXJQcm9ncmFtLCB2U2hhZGVyKTtcclxuXHRnbC5saW5rUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG5cdFxyXG5cdGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG5cdFx0YWxlcnQoXCJFcnJvciBpbml0aWFsaXppbmcgdGhlIHNoYWRlciBwcm9ncmFtXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuICBcclxuXHRnbC51c2VQcm9ncmFtKHRoaXMuc2hhZGVyUHJvZ3JhbSk7XHJcblx0XHJcblx0Ly8gR2V0IGF0dHJpYnV0ZSBsb2NhdGlvbnNcclxuXHR0aGlzLmFWZXJ0ZXhQb3NpdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVmVydGV4UG9zaXRpb25cIik7XHJcblx0dGhpcy5hVGV4dHVyZUNvb3JkID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFUZXh0dXJlQ29vcmRcIik7XHJcblx0dGhpcy5hVmVydGV4SXNEYXJrID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFWZXJ0ZXhJc0RhcmtcIik7XHJcblx0XHJcblx0Ly8gRW5hYmxlIGF0dHJpYnV0ZXNcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFWZXJ0ZXhQb3NpdGlvbik7XHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVGV4dHVyZUNvb3JkKTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFWZXJ0ZXhJc0RhcmspO1xyXG5cdFxyXG5cdC8vIEdldCB0aGUgdW5pZm9ybSBsb2NhdGlvbnNcclxuXHR0aGlzLnVTYW1wbGVyID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1U2FtcGxlclwiKTtcclxuXHR0aGlzLnVUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVRyYW5zZm9ybWF0aW9uTWF0cml4XCIpO1xyXG5cdHRoaXMudVBlcnNwZWN0aXZlTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1UGVyc3BlY3RpdmVNYXRyaXhcIik7XHJcblx0dGhpcy51UGFpbnRJblJlZCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVBhaW50SW5SZWRcIik7XHJcblx0dGhpcy51TGlnaHREZXB0aCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidUxpZ2h0RGVwdGhcIik7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuZ2V0U2hhZGVyQ29kZSA9IGZ1bmN0aW9uKHNoYWRlcil7XHJcblx0dmFyIGNvZGUgPSBcIlwiO1xyXG5cdHZhciBub2RlID0gc2hhZGVyLmZpcnN0Q2hpbGQ7XHJcblx0dmFyIHRuID0gbm9kZS5URVhUX05PREU7XHJcblx0XHJcblx0d2hpbGUgKG5vZGUpe1xyXG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgPT0gdG4pXHJcblx0XHRcdGNvZGUgKz0gbm9kZS50ZXh0Q29udGVudDtcclxuXHRcdG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gY29kZTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbihzcmMsIG1ha2VJdFRleHR1cmUsIHRleHR1cmVJbmRleCwgaXNTb2xpZCwgcGFyYW1zKXtcclxuXHRpZiAoIXBhcmFtcykgcGFyYW1zID0ge307XHJcblx0aWYgKCFwYXJhbXMuaW1nTnVtKSBwYXJhbXMuaW1nTnVtID0gMTtcclxuXHRpZiAoIXBhcmFtcy5pbWdWTnVtKSBwYXJhbXMuaW1nVk51bSA9IDE7XHJcblx0aWYgKCFwYXJhbXMueE9yaWcpIHBhcmFtcy54T3JpZyA9IDA7XHJcblx0aWYgKCFwYXJhbXMueU9yaWcpIHBhcmFtcy55T3JpZyA9IDA7XHJcblx0XHJcblx0dmFyIGdsID0gdGhpcztcclxuXHR2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcblx0XHJcblx0aW1nLnNyYyA9IHNyYztcclxuXHRpbWcucmVhZHkgPSBmYWxzZTtcclxuXHRpbWcudGV4dHVyZSA9IG51bGw7XHJcblx0aW1nLnRleHR1cmVJbmRleCA9IHRleHR1cmVJbmRleDtcclxuXHRpbWcuaXNTb2xpZCA9IChpc1NvbGlkID09PSB0cnVlKTtcclxuXHRpbWcuaW1nTnVtID0gcGFyYW1zLmltZ051bTtcclxuXHRpbWcudkltZ051bSA9IHBhcmFtcy5pbWdWTnVtO1xyXG5cdGltZy54T3JpZyA9IHBhcmFtcy54T3JpZztcclxuXHRpbWcueU9yaWcgPSBwYXJhbXMueU9yaWc7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoaW1nLCBcImxvYWRcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGltZy5pbWdXaWR0aCA9IGltZy53aWR0aCAvIGltZy5pbWdOdW07XHJcblx0XHRpbWcuaW1nSGVpZ2h0ID0gaW1nLmhlaWdodCAvIGltZy52SW1nTnVtO1xyXG5cdFx0aW1nLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0aWYgKG1ha2VJdFRleHR1cmUpe1xyXG5cdFx0XHRpbWcudGV4dHVyZSA9IGdsLnBhcnNlVGV4dHVyZShpbWcpO1xyXG5cdFx0XHRpbWcudGV4dHVyZS50ZXh0dXJlSW5kZXggPSBpbWcudGV4dHVyZUluZGV4O1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdGdsLmltYWdlcy5wdXNoKGltZyk7XHJcblx0cmV0dXJuIGltZztcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5wYXJzZVRleHR1cmUgPSBmdW5jdGlvbihpbWcpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIENyZWF0ZXMgYSB0ZXh0dXJlIGhvbGRlciB0byB3b3JrIHdpdGhcclxuXHR2YXIgdGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleCk7XHJcblx0XHJcblx0Ly8gRmxpcCB2ZXJ0aWNhbCB0aGUgdGV4dHVyZVxyXG5cdGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xyXG5cdFxyXG5cdC8vIExvYWQgdGhlIGltYWdlIGRhdGFcclxuXHRnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltZyk7XHJcblx0XHJcblx0Ly8gQXNzaWduIHByb3BlcnRpZXMgb2Ygc2NhbGluZ1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblx0Z2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XHJcblx0XHJcblx0Ly8gUmVsZWFzZXMgdGhlIHRleHR1cmUgZnJvbSB0aGUgd29ya3NwYWNlXHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XHJcblx0cmV0dXJuIHRleDtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCBjYW1lcmEsIHRleHR1cmUpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIHZlcnRpY2VzIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QudmVydGV4QnVmZmVyKTtcclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleFBvc2l0aW9uLCBvYmplY3QudmVydGV4QnVmZmVyLml0ZW1TaXplLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIHRleHR1cmUgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC50ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVGV4dHVyZUNvb3JkLCBvYmplY3QudGV4QnVmZmVyLml0ZW1TaXplLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGRhcmsgYnVmZmVyIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGlmIChvYmplY3QuZGFya0J1ZmZlcil7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LmRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFWZXJ0ZXhJc0RhcmssIG9iamVjdC5kYXJrQnVmZmVyLml0ZW1TaXplLCBnbC5VTlNJR05FRF9CWVRFLCBmYWxzZSwgMCwgMCk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFBhaW50IHRoZSBvYmplY3QgaW4gcmVkIChXaGVuIGh1cnQgZm9yIGV4YW1wbGUpXHJcblx0dmFyIHJlZCA9IChvYmplY3QucGFpbnRJblJlZCk/IDEuMCA6IDAuMDsgXHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudVBhaW50SW5SZWQsIHJlZCk7XHJcblx0XHJcblx0Ly8gSG93IG11Y2ggbGlnaHQgdGhlIHBsYXllciBjYXN0XHJcblx0dmFyIGxpZ2h0ID0gKHRoaXMubGlnaHQgPiAwKT8gMC4wIDogMS4wO1xyXG5cdGdsLnVuaWZvcm0xZih0aGlzLnVMaWdodERlcHRoLCBsaWdodCk7XHJcblx0XHJcblx0Ly8gU2V0IHRoZSB0ZXh0dXJlIHRvIHdvcmsgd2l0aFxyXG5cdGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG5cdGdsLnVuaWZvcm0xaSh0aGlzLnVTYW1wbGVyLCAwKTtcclxuXHRcclxuXHQvLyBDcmVhdGUgdGhlIHBlcnNwZWN0aXZlIGFuZCB0cmFuc2Zvcm0gdGhlIG9iamVjdFxyXG5cdHZhciB0cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IE1hdHJpeC5tYWtlVHJhbnNmb3JtKG9iamVjdCwgY2FtZXJhKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSBpbmRpY2VzIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG9iamVjdC5pbmRpY2VzQnVmZmVyKTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHBlcnNwZWN0aXZlIGFuZCB0cmFuc2Zvcm1hdGlvbiBtYXRyaWNlc1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51UGVyc3BlY3RpdmVNYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGVyc3BlY3RpdmVNYXRyaXgpKTtcclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHRoaXMudVRyYW5zZm9ybWF0aW9uTWF0cml4LCBmYWxzZSwgbmV3IEZsb2F0MzJBcnJheSh0cmFuc2Zvcm1hdGlvbk1hdHJpeCkpO1xyXG5cdFxyXG5cdGlmIChvYmplY3Qubm9Sb3RhdGUpIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcclxuXHRcclxuXHQvLyBEcmF3IHRoZSB0cmlhbmdsZXNcclxuXHRnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCBvYmplY3QuaW5kaWNlc0J1ZmZlci5udW1JdGVtcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG5cdFxyXG5cdGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmFyZUltYWdlc1JlYWR5ID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW1hZ2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKCF0aGlzLmltYWdlc1tpXS5yZWFkeSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTsiXX0=
