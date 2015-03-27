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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZGluZ1NjcmVlbi5qcyIsImpzXFxFbmVteS5qcyIsImpzXFxFbmVteUZhY3RvcnkuanMiLCJqc1xcSW52ZW50b3J5LmpzIiwianNcXEl0ZW0uanMiLCJqc1xcSXRlbUZhY3RvcnkuanMiLCJqc1xcTWFwQXNzZW1ibGVyLmpzIiwianNcXE1hcE1hbmFnZXIuanMiLCJqc1xcTWF0cml4LmpzIiwianNcXE1pc3NpbGUuanMiLCJqc1xcT2JqZWN0RmFjdG9yeS5qcyIsImpzXFxQbGF5ZXIuanMiLCJqc1xcUGxheWVyU3RhdHMuanMiLCJqc1xcU2F2ZU1hbmFnZXIuanMiLCJqc1xcU2VsZWN0Q2xhc3MuanMiLCJqc1xcU3RhaXJzLmpzIiwianNcXFN0b3JhZ2UuanMiLCJqc1xcVGl0bGVTY3JlZW4uanMiLCJqc1xcVUkuanMiLCJqc1xcVW5kZXJ3b3JsZC5qcyIsImpzXFxVdGlscy5qcyIsImpzXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbitCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XzFGcmFtZTogW10sXHJcblx0XzJGcmFtZXM6IFtdLFxyXG5cdF8zRnJhbWVzOiBbXSxcclxuXHRfNEZyYW1lczogW10sXHJcblx0aXRlbUNvb3JkczogW10sXHJcblx0XHJcblx0aW5pdDogZnVuY3Rpb24oZ2wpe1xyXG5cdFx0Ly8gMSBGcmFtZVxyXG5cdFx0dmFyIGNvb3JkcyA9IFsxLjAsMS4wLDAuMCwxLjAsMS4wLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzFGcmFtZS5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRcclxuXHRcdC8vIDIgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMDAsMS4wMCwwLjUwLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0Y29vcmRzID0gWzEuMDAsMS4wMCwwLjUwLDEuMDAsMS4wMCwwLjAwLDAuNTAsMC4wMF07XHJcblx0XHR0aGlzLl8yRnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMyBGcmFtZXMsIDQgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC4yNSwxLjAwLDAuMDAsMS4wMCwwLjI1LDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMjUsMS4wMCwwLjUwLDAuMDAsMC4yNSwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC43NSwxLjAwLDAuNTAsMS4wMCwwLjc1LDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNzUsMS4wMCwxLjAwLDAuMDAsMC43NSwwLjAwXTtcclxuXHRcdHRoaXMuXzRGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdH0sXHJcblx0XHJcblx0cHJlcGFyZUJ1ZmZlcjogZnVuY3Rpb24oY29vcmRzLCBnbCl7XHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGNvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGNvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGV4QnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0QnlOdW1GcmFtZXM6IGZ1bmN0aW9uKG51bUZyYW1lcyl7XHJcblx0XHRpZiAobnVtRnJhbWVzID09IDEpIHJldHVybiB0aGlzLl8xRnJhbWU7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMikgcmV0dXJuIHRoaXMuXzJGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMykgcmV0dXJuIHRoaXMuXzNGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gNCkgcmV0dXJuIHRoaXMuXzRGcmFtZXM7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUZXh0dXJlQnVmZmVyQ29vcmRzOiBmdW5jdGlvbih4SW1nTnVtLCB5SW1nTnVtLCBnbCl7XHJcblx0XHR2YXIgcmV0ID0gW107XHJcblx0XHR2YXIgd2lkdGggPSAxIC8geEltZ051bTtcclxuXHRcdHZhciBoZWlnaHQgPSAxIC8geUltZ051bTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaT0wO2k8eUltZ051bTtpKyspe1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajx4SW1nTnVtO2orKyl7XHJcblx0XHRcdFx0dmFyIHgxID0gaiAqIHdpZHRoO1xyXG5cdFx0XHRcdHZhciB5MSA9IDEgLSBpICogaGVpZ2h0IC0gaGVpZ2h0O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB4MiA9IHgxICsgd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkyID0geTEgKyBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGNvb3JkcyA9IFt4Mix5Mix4MSx5Mix4Mix5MSx4MSx5MV07XHJcblx0XHRcdFx0cmV0LnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5mdW5jdGlvbiBBdWRpb0FQSSgpe1xyXG5cdHRoaXMuX2F1ZGlvID0gW107XHJcblx0XHJcblx0dGhpcy5hdWRpb0N0eCA9IG51bGw7XHJcblx0dGhpcy5nYWluTm9kZSA9IG51bGw7XHJcblx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuaW5pdEF1ZGlvRW5naW5lKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXVkaW9BUEk7XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuaW5pdEF1ZGlvRW5naW5lID0gZnVuY3Rpb24oKXtcclxuXHRpZiAod2luZG93LkF1ZGlvQ29udGV4dCl7XHJcblx0XHR0aGlzLmF1ZGlvQ3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdFx0dGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdH1lbHNlXHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhlIEF1ZGlvIEFQSVwiKTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5sb2FkQXVkaW8gPSBmdW5jdGlvbih1cmwsIGlzTXVzaWMpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghZW5nLmF1ZGlvQ3R4KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR2YXIgYXVkaW8gPSB7YnVmZmVyOiBudWxsLCBzb3VyY2U6IG51bGwsIHJlYWR5OiBmYWxzZSwgaXNNdXNpYzogaXNNdXNpYywgcGF1c2VkQXQ6IDB9O1xyXG5cdFxyXG5cdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuXHRodHRwLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcblx0XHJcblx0aHR0cC5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0ZW5nLmF1ZGlvQ3R4LmRlY29kZUF1ZGlvRGF0YShodHRwLnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpe1xyXG5cdFx0XHRhdWRpby5idWZmZXIgPSBidWZmZXI7XHJcblx0XHRcdGF1ZGlvLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdH0sIGZ1bmN0aW9uKG1zZyl7XHJcblx0XHRcdGFsZXJ0KG1zZyk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdGh0dHAuc2VuZCgpO1xyXG5cdFxyXG5cdHRoaXMuX2F1ZGlvLnB1c2goYXVkaW8pO1xyXG5cdFxyXG5cdHJldHVybiBhdWRpbztcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGF1ZGlvLnRpbWVPKXtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KGF1ZGlvLnRpbWVPKTtcclxuXHRcdH1lbHNlIGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSwgdm9sdW1lKXtcclxuXHR2YXIgZW5nID0gdGhpcztcclxuXHRpZiAoIXNvdW5kRmlsZSB8fCAhc291bmRGaWxlLnJlYWR5KXtcclxuXHRcdGlmICh0cnlJZk5vdFJlYWR5KXsgc291bmRGaWxlLnRpbWVPID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBlbmcucGxheVNvdW5kKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSwgdm9sdW1lKTsgfSwgMTAwMCk7IH0gXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUuaXNNdXNpYykgdGhpcy5zdG9wTXVzaWMoKTtcclxuXHRcclxuXHRzb3VuZEZpbGUudGltZU8gPSBudWxsO1xyXG5cdHNvdW5kRmlsZS5wbGF5aW5nID0gdHJ1ZTtcclxuXHQgXHJcblx0dmFyIHNvdXJjZSA9IGVuZy5hdWRpb0N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuXHRzb3VyY2UuYnVmZmVyID0gc291bmRGaWxlLmJ1ZmZlcjtcclxuXHRcclxuXHR2YXIgZ2Fpbk5vZGU7XHJcblx0aWYgKHZvbHVtZSAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdGdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0XHRnYWluTm9kZS5nYWluLnZhbHVlID0gdm9sdW1lO1xyXG5cdFx0c291bmRGaWxlLnZvbHVtZSA9IHZvbHVtZTtcclxuXHR9ZWxzZXtcclxuXHRcdGdhaW5Ob2RlID0gZW5nLmdhaW5Ob2RlO1xyXG5cdH1cclxuXHRcclxuXHRzb3VyY2UuY29ubmVjdChnYWluTm9kZSk7XHJcblx0Z2Fpbk5vZGUuY29ubmVjdChlbmcuYXVkaW9DdHguZGVzdGluYXRpb24pO1xyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUucGF1c2VkQXQgIT0gMCl7XHJcblx0XHRzb3VuZEZpbGUuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKSAtIHNvdW5kRmlsZS5wYXVzZWRBdDtcclxuXHRcdHNvdXJjZS5zdGFydCgwLCAoc291bmRGaWxlLnBhdXNlZEF0IC8gMTAwMCkgJSBzb3VuZEZpbGUuYnVmZmVyLmR1cmF0aW9uKTtcclxuXHRcdHNvdW5kRmlsZS5wYXVzZWRBdCA9IDA7XHJcblx0fWVsc2V7XHJcblx0XHRzb3VuZEZpbGUuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcclxuXHRcdHNvdXJjZS5zdGFydCgwKTtcclxuXHR9XHJcblx0c291cmNlLmxvb3AgPSBsb29wO1xyXG5cdHNvdXJjZS5sb29waW5nID0gbG9vcDtcclxuXHRzb3VyY2Uub25lbmRlZCA9IGZ1bmN0aW9uKCl7IHNvdW5kRmlsZS5wbGF5aW5nID0gZmFsc2U7IH07XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5pc011c2ljKVxyXG5cdFx0c291bmRGaWxlLnNvdXJjZSA9IHNvdXJjZTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5wYXVzZU11c2ljID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGF1ZGlvID0gdGhpcy5fYXVkaW9baV07XHJcblx0XHRcclxuXHRcdGF1ZGlvLnBhdXNlZEF0ID0gMDtcclxuXHRcdGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLndhc1BsYXlpbmcgPSBhdWRpby5wbGF5aW5nO1xyXG5cdFx0XHRhdWRpby5zb3VyY2Uuc3RvcCgpO1xyXG5cdFx0XHRhdWRpby5wYXVzZWRBdCA9IChEYXRlLm5vdygpIC0gYXVkaW8uc3RhcnRlZEF0KTtcclxuXHRcdFx0YXVkaW8ucmVzdG9yZUxvb3AgPSBhdWRpby5zb3VyY2UubG9vcDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucmVzdG9yZU11c2ljID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGF1ZGlvID0gdGhpcy5fYXVkaW9baV07XHJcblx0XHRcclxuXHRcdGlmICghYXVkaW8ubG9vcGluZyAmJiAhYXVkaW8ud2FzUGxheWluZykgY29udGludWU7XHJcblx0XHRpZiAoYXVkaW8uaXNNdXNpYyAmJiBhdWRpby5zb3VyY2UgJiYgYXVkaW8ucGF1c2VkQXQgIT0gMCl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHRcdHRoaXMucGxheVNvdW5kKGF1ZGlvLCBhdWRpby5yZXN0b3JlTG9vcCwgdHJ1ZSwgYXVkaW8udm9sdW1lKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLm11dGVkKXtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDA7XHJcblx0XHR0aGlzLm11dGVkID0gdHJ1ZTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubXV0ZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDE7XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmFyZVNvdW5kc1JlYWR5ID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKCF0aGlzLl9hdWRpb1tpXS5yZWFkeSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbmZ1bmN0aW9uIEJpbGxib2FyZChwb3NpdGlvbiwgdGV4dHVyZUNvZGUsIG1hcE1hbmFnZXIsIHBhcmFtcyl7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb29yZHMgPSBudWxsO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMTtcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuYWN0aW9ucyA9IG51bGw7XHJcblx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHJcblx0aWYgKHBhcmFtcykgdGhpcy5wYXJzZVBhcmFtcyhwYXJhbXMpO1xyXG5cdGlmICh0ZXh0dXJlQ29kZSA9PSBcIm5vbmVcIikgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmlsbGJvYXJkO1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5wYXJzZVBhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcyl7XHJcblx0Zm9yICh2YXIgaSBpbiBwYXJhbXMpe1xyXG5cdFx0dmFyIHAgPSBwYXJhbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpID09IFwibmZcIil7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBwO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMocCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImlzXCIpeyAvLyBJbWFnZSBzcGVlZFxyXG5cdFx0XHR0aGlzLmltZ1NwZCA9IHA7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImNiXCIpeyAvLyBDdXN0b20gYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQocCwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImFjXCIpeyAvLyBBY3Rpb25zXHJcblx0XHRcdHRoaXMuYWN0aW9ucyA9IHA7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmFjdGlvbnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYWMgPSB0aGlzLmFjdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdGlmIChhYyA9PSBcInR2XCIpeyAvLyBUb29nbGUgdmlzaWJpbGl0eVxyXG5cdFx0XHR0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjdF9cIikgPT0gMCl7IC8vIENoYW5nZSB0ZXh0dXJlXHJcblx0XHRcdHRoaXMudGV4dHVyZUNvZGUgPSBhYy5yZXBsYWNlKFwiY3RfXCIsIFwiXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJuZl9cIikgPT0gMCl7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dmFyIG5mID0gcGFyc2VJbnQoYWMucmVwbGFjZShcIm5mX1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubnVtRnJhbWVzID0gbmY7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhuZik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY2ZfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciBmcmFtZXMgPSBhYy5yZXBsYWNlKFwiY2ZfXCIsXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IHBhcnNlSW50KGZyYW1lc1t0aGlzLmNpcmNsZUZyYW1lSW5kZXhdLCAxMCk7XHJcblx0XHRcdGlmICh0aGlzLmNpcmNsZUZyYW1lSW5kZXgrKyA+PSBmcmFtZXMubGVuZ3RoLTEpIHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN3X1wiKSA9PSAwKXsgLy8gQ2lyY2xlIGZyYW1lc1xyXG5cdFx0XHR2YXIgdGV4dHVyZUlkID0gcGFyc2VJbnQoYWMucmVwbGFjZShcImN3X1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5jaGFuZ2VXYWxsVGV4dHVyZSh0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdGV4dHVyZUlkKTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwidWRfXCIpID09IDApeyAvLyBVbmxvY2sgZG9vclxyXG5cdFx0XHR2YXIgcG9zID0gYWMucmVwbGFjZShcInVkX1wiLCBcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdChwYXJzZUludChwb3NbMF0sIDEwKSwgcGFyc2VJbnQocG9zWzFdLCAxMCksIHBhcnNlSW50KHBvc1syXSwgMTApKTtcclxuXHRcdFx0aWYgKGRvb3IpeyBcclxuXHRcdFx0XHRkb29yLmxvY2sgPSBudWxsO1xyXG5cdFx0XHRcdGRvb3IuYWN0aXZhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGFjID09IFwiZGVzdHJveVwiKXsgLy8gRGVzdHJveSB0aGUgYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIENvbnNvbGUoLypJbnQqLyBtYXhNZXNzYWdlcywgLypJbnQqLyBsaW1pdCwgLypJbnQqLyBzcGxpdEF0LCAgLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdHRoaXMubWF4TWVzc2FnZXMgPSBtYXhNZXNzYWdlcztcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMubGltaXQgPSBsaW1pdDtcclxuXHR0aGlzLnNwbGl0QXQgPSBzcGxpdEF0O1xyXG5cdFxyXG5cdHRoaXMuc3ByaXRlRm9udCA9IG51bGw7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zZkNvbnRleHQgPSBudWxsO1xyXG5cdHRoaXMuc3BhY2VDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUxpbmVzID0gbnVsbDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlO1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oLypJbnQqLyB4LCAvKkludCovIHkpe1xyXG5cdHZhciBzID0gdGhpcy5tZXNzYWdlcy5sZW5ndGggLSAxO1xyXG5cdHZhciBjdHggPSB0aGlzLmdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdGN0eC5kcmF3SW1hZ2UodGhpcy5zZkNvbnRleHQuY2FudmFzLCB4LCB5KTtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnBhcnNlRm9udCA9IGZ1bmN0aW9uKHNwcml0ZUZvbnQpe1xyXG5cdHZhciBjaGFyYXNXaWR0aCA9IFtdO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNwcml0ZUZvbnQud2lkdGg7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdFxyXG5cdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdGN0eC5kcmF3SW1hZ2Uoc3ByaXRlRm9udCwgMCwgMCk7XHJcblx0XHJcblx0dmFyIGltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsMCxjYW52YXMud2lkdGgsMSk7XHJcblx0dmFyIHdpZHRoID0gMDtcclxuXHRmb3IgKHZhciBpPTAsbGVuPWltZ0RhdGEuZGF0YS5sZW5ndGg7aTxsZW47aSs9NCl7XHJcblx0XHR2YXIgciA9IGltZ0RhdGEuZGF0YVtpXTtcclxuXHRcdHZhciBnID0gaW1nRGF0YS5kYXRhW2krMV07XHJcblx0XHR2YXIgYiA9IGltZ0RhdGEuZGF0YVtpKzJdO1xyXG5cdFx0XHJcblx0XHRpZiAociA9PSAyNTUgJiYgZyA9PSAwICYmIGIgPT0gMjU1KXtcclxuXHRcdFx0d2lkdGgrKztcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZiAod2lkdGggIT0gMCl7XHJcblx0XHRcdFx0Y2hhcmFzV2lkdGgucHVzaCh3aWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBjaGFyYXNXaWR0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZUZvbnQgPSBmdW5jdGlvbigvKkltYWdlKi8gc3ByaXRlRm9udCwgLypTdHJpbmcqLyBjaGFyYWN0ZXJzVXNlZCwgLypJbnQqLyB2ZXJ0aWNhbFNwYWNlKXtcclxuXHR0aGlzLnNwcml0ZUZvbnQgPSBzcHJpdGVGb250O1xyXG5cdHRoaXMubGlzdE9mQ2hhcnMgPSBjaGFyYWN0ZXJzVXNlZDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSB2ZXJ0aWNhbFNwYWNlO1xyXG5cdFxyXG5cdHRoaXMuY2hhcmFzV2lkdGggPSB0aGlzLnBhcnNlRm9udChzcHJpdGVGb250KTtcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSAxMDA7XHJcblx0Y2FudmFzLmhlaWdodCA9IDEwMDtcclxuXHR0aGlzLnNmQ29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0dGhpcy5zZkNvbnRleHQuY2FudmFzID0gY2FudmFzO1xyXG5cdFxyXG5cdHRoaXMuc3BhY2VDaGFycyA9IHNwcml0ZUZvbnQud2lkdGggLyBjaGFyYWN0ZXJzVXNlZC5sZW5ndGg7XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5mb3JtYXRUZXh0ID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgdHh0ID0gbWVzc2FnZS5zcGxpdChcIiBcIik7XHJcblx0dmFyIGxpbmUgPSBcIlwiO1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXR4dC5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciB3b3JkID0gdHh0W2ldO1xyXG5cdFx0aWYgKChsaW5lICsgXCIgXCIgKyB3b3JkKS5sZW5ndGggPD0gdGhpcy5zcGxpdEF0KXtcclxuXHRcdFx0aWYgKGxpbmUgIT0gXCJcIikgbGluZSArPSBcIiBcIjtcclxuXHRcdFx0bGluZSArPSB3b3JkO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldC5wdXNoKGxpbmUpO1xyXG5cdFx0XHRsaW5lID0gd29yZDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0LnB1c2gobGluZSk7XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmFkZFNGTWVzc2FnZSA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gbWVzc2FnZSl7XHJcblx0dmFyIG1zZyA9IHRoaXMuZm9ybWF0VGV4dChtZXNzYWdlKTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1zZy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHRoaXMubWVzc2FnZXMucHVzaChtc2dbaV0pO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiB0aGlzLmxpbWl0KXtcclxuXHRcdHRoaXMubWVzc2FnZXMuc3BsaWNlKDAsMSk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBjID0gdGhpcy5zZkNvbnRleHQuY2FudmFzO1xyXG5cdHRoaXMuc2ZDb250ZXh0LmNsZWFyUmVjdCgwLDAsYy53aWR0aCxjLmhlaWdodCk7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm1lc3NhZ2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG1zZyA9IHRoaXMubWVzc2FnZXNbaV07XHJcblx0XHR2YXIgeCA9IDA7XHJcblx0XHR2YXIgeSA9ICh0aGlzLnNwYWNlTGluZXMgKiB0aGlzLmxpbWl0KSAtIHRoaXMuc3BhY2VMaW5lcyAqIChsZW4gLSBpIC0gMSk7XHJcblx0XHR0aGlzLnByaW50VGV4dCh4LHksbXNnKTtcclxuXHR9XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5wcmludFRleHQgPSBmdW5jdGlvbiAoeCx5LG1zZywgY3R4KXtcclxuXHRpZiAoIWN0eCl7XHJcblx0XHRjdHggPSB0aGlzLnNmQ29udGV4dDtcclxuXHR9XHJcblx0dmFyIGMgPSBjdHguY2FudmFzO1xyXG5cdFxyXG5cdHZhciB3ID0gdGhpcy5zcGFjZUNoYXJzO1xyXG5cdHZhciBoID0gdGhpcy5zcHJpdGVGb250LmhlaWdodDtcclxuXHRcclxuXHR2YXIgbVcgPSBtc2cubGVuZ3RoICogdztcclxuXHRpZiAobVcgPiBjLndpZHRoKSBjLndpZHRoID0gbVcgKyAoMiAqIHcpO1xyXG5cdFxyXG5cdGZvciAodmFyIGo9MCxqbGVuPW1zZy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHR2YXIgY2hhcmEgPSBtc2cuY2hhckF0KGopO1xyXG5cdFx0dmFyIGluZCA9IHRoaXMubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLnNwcml0ZUZvbnQsXHJcblx0XHRcdFx0dyAqIGluZCwgMSwgdywgaCAtIDEsXHJcblx0XHRcdFx0eCwgeSwgdywgaCAtIDEpO1xyXG5cdFx0XHR4ICs9IHRoaXMuY2hhcmFzV2lkdGhbaW5kXSArIDE7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0eCArPSB3O1xyXG5cdFx0fVxyXG5cdH1cclxufSIsImZ1bmN0aW9uIERvb3IobWFwTWFuYWdlciwgd2FsbFBvc2l0aW9uLCBkaXIsIHRleHR1cmVDb2RlLCB3YWxsVGV4dHVyZSwgbG9jayl7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLndhbGxQb3NpdGlvbiA9IHdhbGxQb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gMDtcclxuXHR0aGlzLmRpciA9IGRpcjtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7XHJcblx0dGhpcy5yVGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTsgLy8gRGVsZXRlXHJcblxyXG5cdHRoaXMuZG9vclBvc2l0aW9uID0gd2FsbFBvc2l0aW9uLmNsb25lKCk7XHJcblx0dGhpcy53YWxsVGV4dHVyZSA9IHdhbGxUZXh0dXJlO1xyXG5cdFx0XHJcblx0dGhpcy5ib3VuZGluZ0JveCA9IG51bGw7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHdhbGxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cdGlmIChkaXIgPT0gXCJIXCIpeyB0aGlzLnBvc2l0aW9uLnN1bSh2ZWMzKC0wLjI1LCAwLjAsIDAuMCkpOyB9ZWxzZVxyXG5cdGlmIChkaXIgPT0gXCJWXCIpeyB0aGlzLnBvc2l0aW9uLnN1bSh2ZWMzKDAuMCwgMC4wLCAtMC4yNSkpOyB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSV8yOyB9XHJcblx0XHJcblx0dGhpcy5sb2NrID0gbG9jaztcclxuXHR0aGlzLmNsb3NlZCA9IHRydWU7XHJcblx0dGhpcy5hbmltYXRpb24gPSAgMDtcclxuXHR0aGlzLm9wZW5TcGVlZCA9IE1hdGguZGVnVG9SYWQoMTApO1xyXG5cdFxyXG5cdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRG9vcjtcclxuXHJcbkRvb3IucHJvdG90eXBlLmdldEJvdW5kaW5nQm94ID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5ib3VuZGluZ0JveDtcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gIT0gMCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmxvY2spe1xyXG5cdFx0dmFyIGtleSA9IHRoaXMubWFwTWFuYWdlci5nZXRQbGF5ZXJJdGVtKHRoaXMubG9jayk7XHJcblx0XHRpZiAoa2V5KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2Uoa2V5Lm5hbWUgKyBcIiB1c2VkXCIpO1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIucmVtb3ZlUGxheWVySXRlbSh0aGlzLmxvY2spO1xyXG5cdFx0XHR0aGlzLmxvY2sgPSBudWxsO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTG9ja2VkXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmNsb3NlZCkgdGhpcy5hbmltYXRpb24gPSAxO1xyXG5cdGVsc2UgdGhpcy5hbmltYXRpb24gPSAyOyBcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmlzU29saWQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiAhPSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRyZXR1cm4gdGhpcy5jbG9zZWQ7XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5tb2RpZnlDb2xsaXNpb24gPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRpciA9PSBcIkhcIil7XHJcblx0XHRpZiAodGhpcy5jbG9zZWQpe1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41IC0gMC4wNSxcclxuXHRcdFx0XHR3OiAwLjUsIGg6IDAuMVxyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC4xLCBoOiAwLjVcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9ZWxzZXtcclxuXHRcdGlmICh0aGlzLmNsb3NlZCl7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41IC0gMC4wNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuMSwgaDogMC41XHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjUsIGg6IDAuMVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBhbjEgPSAoKHRoaXMuYW5pbWF0aW9uID09IDEgJiYgdGhpcy5kaXIgPT0gXCJIXCIpIHx8ICh0aGlzLmFuaW1hdGlvbiA9PSAyICYmIHRoaXMuZGlyID09IFwiVlwiKSk7XHJcblx0dmFyIGFuMiA9ICgodGhpcy5hbmltYXRpb24gPT0gMiAmJiB0aGlzLmRpciA9PSBcIkhcIikgfHwgKHRoaXMuYW5pbWF0aW9uID09IDEgJiYgdGhpcy5kaXIgPT0gXCJWXCIpKTtcclxuXHRcclxuXHRpZiAoYW4xICYmIHRoaXMucm90YXRpb24gPCBNYXRoLlBJXzIpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbiArPSB0aGlzLm9wZW5TcGVlZDtcclxuXHRcdGlmICh0aGlzLnJvdGF0aW9uID49IE1hdGguUElfMil7XHJcblx0XHRcdHRoaXMucm90YXRpb24gPSBNYXRoLlBJXzI7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uICA9IDA7XHJcblx0XHRcdHRoaXMuY2xvc2VkID0gKHRoaXMuZGlyID09IFwiVlwiKTtcclxuXHRcdFx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxuXHRcdH1cclxuXHR9ZWxzZSBpZiAoYW4yICYmIHRoaXMucm90YXRpb24gPiAwKXtcclxuXHRcdHRoaXMucm90YXRpb24gLT0gdGhpcy5vcGVuU3BlZWQ7XHJcblx0XHRpZiAodGhpcy5yb3RhdGlvbiA8PSAwKXtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbiA9IDA7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uICA9IDA7XHJcblx0XHRcdHRoaXMuY2xvc2VkID0gKHRoaXMuZGlyID09IFwiSFwiKTtcclxuXHRcdFx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsImZ1bmN0aW9uIEVuZGluZ1NjcmVlbigvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMuY3VycmVudFNjcmVlbiA9IDA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5kaW5nU2NyZWVuO1xyXG5cclxuRW5kaW5nU2NyZWVuLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLmdldEtleVByZXNzZWQoMTMpIHx8IHRoaXMuZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHRpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDIpXHJcblx0XHRcdHRoaXMuZ2FtZS5uZXdHYW1lKCk7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRoaXMuY3VycmVudFNjcmVlbisrO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZGluZ1NjcmVlbi5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dmFyIHVpID0gdGhpcy5nYW1lLmdldFVJKCk7XHJcblx0aWYgKHRoaXMuY3VycmVudFNjcmVlbiA9PSAwKVxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuZW5kaW5nU2NyZWVuLCAwLCAwKTtcclxuXHRlbHNlIGlmICh0aGlzLmN1cnJlbnRTY3JlZW4gPT0gMSlcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmVuZGluZ1NjcmVlbjIsIDAsIDApO1xyXG5cdGVsc2VcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmVuZGluZ1NjcmVlbjMsIDAsIDApO1xyXG59O1xyXG4iLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICdiaWxsYm9hcmQnKTtcclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICd0ZXh0dXJlQ29vcmRzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdFbmVteScsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSkge1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIEVuZW15KCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdFbmVteScpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdFbmVteScsIEVuZW15KTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGVuZW15LCBtYXBNYW5hZ2VyKXtcclxuXHRpZiAoZW5lbXkuc3dpbSkgcG9zaXRpb24uYiAtPSAwLjI7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUJhc2UgPSBlbmVteS50ZXh0dXJlQmFzZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYW5pbWF0aW9uID0gXCJydW5cIjtcclxuXHR0aGlzLmVuZW15ID0gZW5lbXk7XHJcblx0dGhpcy50YXJnZXQgPSBmYWxzZTtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcygyKTtcclxuXHR0aGlzLm51bUZyYW1lcyA9IDI7XHJcblx0dGhpcy5pbWdTcGQgPSAxLzc7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5odXJ0ID0gMC4wO1xyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy5zb2xpZCA9IHRydWU7XHJcblx0dGhpcy5zbGVlcCA9IDA7XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMC4wO1xyXG5cdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG59XHJcblxyXG5FbmVteS5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdFxyXG5cdHRoaXMuZW5lbXkuaHAgLT0gZG1nO1xyXG5cdGlmICh0aGlzLmVuZW15LmhwIDw9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuYWRkRXhwZXJpZW5jZSh0aGlzLmVuZW15LnN0YXRzLmV4cCk7XHJcblx0XHQvL3RoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGtpbGxlZFwiKTtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUubG9va0ZvciA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0aWYgKCFwbGF5ZXIubW92ZWQpIHJldHVybjtcclxuXHR2YXIgcCA9IHBsYXllci5wb3NpdGlvbjtcclxuXHRcclxuXHR2YXIgZHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdHZhciBkeiA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHJcblx0aWYgKCF0aGlzLnRhcmdldCAmJiAoZHggPD0gNCB8fCBkeiA8PSA0KSl7XHJcblx0XHQvLyBDYXN0IGEgcmF5IHRvd2FyZHMgdGhlIHBsYXllciB0byBjaGVjayBpZiBoZSdzIG9uIHRoZSB2aXNpb24gb2YgdGhlIGNyZWF0dXJlXHJcblx0XHR2YXIgcnggPSB0aGlzLnBvc2l0aW9uLmE7XHJcblx0XHR2YXIgcnkgPSB0aGlzLnBvc2l0aW9uLmM7XHJcblx0XHR2YXIgZGlyID0gTWF0aC5nZXRBbmdsZSh0aGlzLnBvc2l0aW9uLCBwKTtcclxuXHRcdHZhciBkeCA9IE1hdGguY29zKGRpcikgKiAwLjM7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMztcclxuXHRcdFxyXG5cdFx0dmFyIHNlYXJjaCA9IDE1O1xyXG5cdFx0d2hpbGUgKHNlYXJjaCA+IDApe1xyXG5cdFx0XHRyeCArPSBkeDtcclxuXHRcdFx0cnkgKz0gZHk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY3ggPSAocnggPDwgMCk7XHJcblx0XHRcdHZhciBjeSA9IChyeSA8PCAwKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLm1hcE1hbmFnZXIuaXNTb2xpZChjeCwgY3ksIDApKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHZhciBweCA9IChwLmEgPDwgMCk7XHJcblx0XHRcdFx0dmFyIHB5ID0gKHAuYyA8PCAwKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoY3ggPT0gcHggJiYgY3kgPT0gcHkpe1xyXG5cdFx0XHRcdFx0dGhpcy50YXJnZXQgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0XHRcdFx0c2VhcmNoID0gMDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHNlYXJjaCAtPSAxO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdHJ1ZSk7XHJcblx0aWYgKHRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmIHBvaW50WSA8IDAuMCkgcG9pbnRZID0gdGhpcy5wb3NpdGlvbi5iO1xyXG5cdFxyXG5cdHZhciBweSA9IE1hdGguZmxvb3IoKHBvaW50WSAtIHRoaXMucG9zaXRpb24uYikgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4VG8sIHpUbyl7XHJcblx0dmFyIG1vdmVtZW50ID0gdmVjMih4VG8sIHpUbyk7XHJcblx0dmFyIHNwZCA9IHZlYzIoeFRvICogMS41LCAwKTtcclxuXHR2YXIgZmFrZVBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFxyXG5cdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdHZhciBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0QkJveFdhbGxOb3JtYWwoZmFrZVBvcywgc3BkLCAwLjMpO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCwgdGhpcyk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0c3BkID0gdmVjMigwLCB6VG8gKiAxLjUpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAobW92ZW1lbnQuYSAhPSAwIHx8IG1vdmVtZW50LmIgIT0gMCl7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHRoaXMucG9zaXRpb24uYyArPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmICF0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgIXRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5hIC09IG1vdmVtZW50LmE7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYyAtPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZG9WZXJ0aWNhbENoZWNrcygpO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5hdHRhY2tQbGF5ZXIgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwLjApIHJldHVybjtcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UodGhpcy5lbmVteS5zdGF0cy5zdHIpO1xyXG5cdHZhciBkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHRcclxuXHQvLyBDaGVjayBpZiB0aGUgcGxheWVyIGhhcyB0aGUgcHJvdGVjdGlvbiBzcGVsbFxyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRkZnMgKz0gMTU7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heChzdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGF0dGFja3MgeFwiK2RtZyk7XHJcblx0XHRwbGF5ZXIucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdibG9jaycpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSA5MDtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdGlmICh0aGlzLmVuZW15QXR0YWNrQ291bnRlciA+IDApe1xyXG5cdFx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgLS07XHJcblx0XHRpZiAodGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPT0gMCl7XHJcblx0XHRcdHZhciB4eCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0XHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRcdGlmICh4eCA8PSAxICYmIHl5IDw9MSl7XHJcblx0XHRcdFx0dGhpcy5hdHRhY2tQbGF5ZXIocGxheWVyKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHRoaXMudGFyZ2V0KXtcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeXkgPSBNYXRoLmFicyhwLmMgLSB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdFx0aWYgKHRoaXMuYXR0YWNrV2FpdCA+IDApe1xyXG5cdFx0XHR0aGlzLmF0dGFja1dhaXQgLS07XHJcblx0XHR9XHJcblx0XHRpZiAoeHggPD0gMSAmJiB5eSA8PTEpe1xyXG5cdFx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID09IDApe1xyXG5cdFx0XHRcdC8vIHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGF0dGFja3MhXCIpOyBSZW1vdmVkLCB3aWxsIGJlIHJlcGxhY2VkIGJ5IGF0dGFjayBhbmltYXRpb25cclxuXHRcdFx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9IDEwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoeHggPiAxMCB8fCB5eSA+IDEwKXtcclxuXHRcdFx0dGhpcy50YXJnZXQgPSBudWxsO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMDI7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMDI7XHJcblx0XHRcclxuXHRcdHZhciBsYXQgPSB2ZWMyKE1hdGguY29zKGRpciArIE1hdGguUElfMiksIC1NYXRoLnNpbihkaXIgKyBNYXRoLlBJXzIpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tb3ZlVG8oZHgsIGR5LCBsYXQpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5sb29rRm9yKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmdldFRleHR1cmVDb2RlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZmFjZSA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdHZhciBhID0gdGhpcy5hbmltYXRpb247XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uID09IFwic3RhbmRcIikgYSA9IFwicnVuXCI7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMudGV4dHVyZUJhc2UgKyBcIl9cIiArIGE7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmJpbGxib2FyZCAmJiB0aGlzLnRleHR1cmVDb29yZHMpe1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy50ZXh0dXJlQ29vcmRzWyh0aGlzLmltZ0luZCA8PCAwKV07XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkLnBhaW50SW5SZWQgPSAodGhpcy5odXJ0ID4gMCk7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy5nZXRUZXh0dXJlQ29kZSgpLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCl7IHRoaXMuaHVydCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuc2xlZXAgPiAwKXsgdGhpcy5zbGVlcCAtPSAxOyB9XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5wYXVzZWQgfHwgZ2FtZS50aW1lU3RvcCA+IDAgfHwgdGhpcy5zbGVlcCA+IDApe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMubnVtRnJhbWVzID4gMSl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5udW1GcmFtZXMpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRlbmVtaWVzOiB7XHJcblx0XHRiYXQ6IHtuYW1lOiAnR2lhbnQgQmF0JywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnMUQ5JywgZGZzOiAnMkQyJywgZXhwOiA0LCBmbHk6IHRydWV9fSxcclxuXHRcdHJhdDoge25hbWU6ICdHaWFudCBSYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAncmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNwaWRlcjoge25hbWU6ICdHaWFudCBTcGlkZXInLCBocDogNjQsIHRleHR1cmVCYXNlOiAnc3BpZGVyJywgc3RhdHM6IHtzdHI6ICcxRDExJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHRncmVtbGluOiB7bmFtZTogJ0dyZW1saW4nLCBocDogNDgsIHRleHR1cmVCYXNlOiAnZ3JlbWxpbicsIHN0YXRzOiB7c3RyOiAnMkQ5JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRza2VsZXRvbjoge25hbWU6ICdTa2VsZXRvbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdza2VsZXRvbicsIHN0YXRzOiB7c3RyOiAnM0Q0JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRoZWFkbGVzczoge25hbWU6ICdIZWFkbGVzcycsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdoZWFkbGVzcycsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHQvL25peGllOiB7bmFtZTogJ05peGllJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHdpc3A6IHtuYW1lOiAnV2lzcCcsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICd3aXNwJywgc3RhdHM6IHtzdHI6ICcyRDEwJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHRnaG9zdDoge25hbWU6ICdHaG9zdCcsIGhwOiA4MCwgdGV4dHVyZUJhc2U6ICdnaG9zdCcsIHN0YXRzOiB7c3RyOiAnMkQxNScsIGRmczogJzJEMicsIGV4cDogNiwgZmx5OiB0cnVlfX0sXHJcblx0XHR0cm9sbDoge25hbWU6ICdUcm9sbCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICd0cm9sbCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sIC8vIE5vdCB1c2VkIGJ5IHRoZSBnZW5lcmF0b3I/XHJcblx0XHRsYXZhTGl6YXJkOiB7bmFtZTogJ0xhdmEgTGl6YXJkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ2xhdmFMaXphcmQnLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0bW9uZ2JhdDoge25hbWU6ICdNb25nYmF0JywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ21vbmdiYXQnLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogNywgZmx5OiB0cnVlfX0sIFxyXG5cdFx0b2N0b3B1czoge25hbWU6ICdHaWFudCBTcXVpZCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdvY3RvcHVzJywgc3RhdHM6IHtzdHI6ICczRDYnLCBkZnM6ICcyRDInLCBleHA6IDksIHN3aW06IHRydWV9fSxcclxuXHRcdGRhZW1vbjoge25hbWU6ICdEYWVtb24nLCBocDogMTEyLCB0ZXh0dXJlQmFzZTogJ2RhZW1vbicsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA4fX0sXHJcblx0XHQvL3BoYW50b206IHtuYW1lOiAnUGhhbnRvbScsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDE1JywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHRzZWFTZXJwZW50OiB7bmFtZTogJ1NlYSBTZXJwZW50JywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdzZWFTZXJwZW50Jywgc3RhdHM6IHtzdHI6ICczRDYnLCBkZnM6ICcyRDInLCBleHA6IDksIHN3aW06IHRydWV9fSxcclxuXHRcdGV2aWxNYWdlOiB7bmFtZTogJ0V2aWwgTWFnZScsIGhwOiAxNzYsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNkQ1JywgZGZzOiAnMkQyJywgZXhwOiAxMn19LCAvL1RPRE86IEFkZCB0ZXh0dXJlXHJcblx0XHRsaWNoZToge25hbWU6ICdMaWNoZScsIGhwOiAxOTIsIHRleHR1cmVCYXNlOiAnbGljaGUnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTN9fSxcclxuXHRcdGh5ZHJhOiB7bmFtZTogJ0h5ZHJhJywgaHA6IDIwOCwgdGV4dHVyZUJhc2U6ICdoeWRyYScsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNH19LFxyXG5cdFx0ZHJhZ29uOiB7bmFtZTogJ0RyYWdvbicsIGhwOiAyMjQsIHRleHR1cmVCYXNlOiAnZHJhZ29uJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE1LCBmbHk6IHRydWV9fSxcdFx0XHRcdC8vIE5vdCBzdWl0YWJsZVxyXG5cdFx0em9ybjoge25hbWU6ICdab3JuJywgaHA6IDI0MCwgdGV4dHVyZUJhc2U6ICd6b3JuJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRnYXplcjoge25hbWU6ICdHYXplcicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnZ2F6ZXInLCBzdGF0czoge3N0cjogJzVEOCcsIGRmczogJzJEMicsIGV4cDogMTYsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmVhcGVyOiB7bmFtZTogJ1JlYXBlcicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAncmVhcGVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRiYWxyb246IHtuYW1lOiAnQmFscm9uJywgaHA6IDI1NSwgdGV4dHVyZUJhc2U6ICdiYWxyb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdC8vdHdpc3Rlcjoge25hbWU6ICdUd2lzdGVyJywgaHA6IDI1LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQyJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHRcclxuXHRcdHdhcnJpb3I6IHtuYW1lOiAnRmlnaHRlcicsIGhwOiA5OCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdG1hZ2U6IHtuYW1lOiAnTWFnZScsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA4fX0sXHJcblx0XHRiYXJkOiB7bmFtZTogJ0JhcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmFyZCcsIHN0YXRzOiB7c3RyOiAnMkQxMCcsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0ZHJ1aWQ6IHtuYW1lOiAnRHJ1aWQnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiAxMH19LFxyXG5cdFx0dGlua2VyOiB7bmFtZTogJ1RpbmtlcicsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cGFsYWRpbjoge25hbWU6ICdQYWxhZGluJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNoZXBoZXJkOiB7bmFtZTogJ1NoZXBoZXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnM0QzJywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRyYW5nZXI6IHtuYW1lOiAnUmFuZ2VyJywgaHA6IDE0NCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogM319XHJcblx0fSxcclxuXHRcclxuXHRnZXRFbmVteTogZnVuY3Rpb24obmFtZSl7XHJcblx0XHRpZiAoIXRoaXMuZW5lbWllc1tuYW1lXSkgdGhyb3cgXCJJbnZhbGlkIGVuZW15IG5hbWU6IFwiICsgbmFtZTtcclxuXHRcdFxyXG5cdFx0dmFyIGVuZW15ID0gdGhpcy5lbmVtaWVzW25hbWVdO1xyXG5cdFx0dmFyIHJldCA9IHtcclxuXHRcdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaSBpbiBlbmVteSl7XHJcblx0XHRcdHJldFtpXSA9IGVuZW15W2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gSW52ZW50b3J5KGxpbWl0SXRlbXMpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignSW52ZW50b3J5Jyk7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG5cdHRoaXMubGltaXRJdGVtcyA9IGxpbWl0SXRlbXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW52ZW50b3J5O1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdJbnZlbnRvcnknLCBJbnZlbnRvcnkpO1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0aWYgKHRoaXMuaXRlbXMubGVuZ3RoID09IHRoaXMubGltaXRJdGVtcyl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZXF1aXBJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHR2YXIgdHlwZSA9IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlKXtcclxuXHRcdFx0aXRlbS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHR0aGlzLml0ZW1zW2l0ZW1JZF0uZXF1aXBwZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRFcXVpcHBlZEl0ZW0gPSBmdW5jdGlvbih0eXBlKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdGVtLnR5cGUgPT0gdHlwZSAmJiBpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0cmV0dXJuIGl0ZW07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRXZWFwb24gPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmdldEVxdWlwcGVkSXRlbSgnd2VhcG9uJyk7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEFybW91ciA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCdhcm1vdXInKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZGVzdHJveUl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpdGVtLnN0YXR1cyA9IDAuMDtcclxuXHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ID09PSBpdGVtKXtcclxuXHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGl0ZW1JZCl7XHJcblx0aWYgKHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICd3ZWFwb24nIHx8IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICdhcm1vdXInKXtcclxuXHRcdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdH1cclxuXHR0aGlzLml0ZW1zLnNwbGljZShpdGVtSWQsIDEpO1xyXG59O1xyXG4iLCJ2YXIgQmlsbGJvYXJkID0gcmVxdWlyZSgnLi9CaWxsYm9hcmQnKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdJdGVtJywgJ2JpbGxib2FyZCcpO1xyXG5cclxuY2lyY3VsYXIuc2V0UmV2aXZlcignSXRlbScsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSl7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gbnVsbDtcclxuXHRpZiAob2JqZWN0Lml0ZW0pIHtcclxuXHRcdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXhbb2JqZWN0Lml0ZW0udGV4XS5idWZmZXJzW29iamVjdC5pdGVtLnN1YkltZ107XHJcblx0XHRvYmplY3QudGV4dHVyZUNvZGUgPSBvYmplY3QuaXRlbS50ZXg7XHJcblx0fVxyXG59KTtcdFxyXG5cclxuZnVuY3Rpb24gSXRlbSgpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignSXRlbScpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW07XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0l0ZW0nLCBJdGVtKTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgaXRlbSwgbWFwTWFuYWdlcil7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5pdGVtID0gbnVsbDtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnbCk7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gbnVsbDtcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0XHJcblx0aWYgKGl0ZW0pIHRoaXMuc2V0SXRlbShpdGVtKTtcclxufTtcclxuXHJcblxyXG5JdGVtLnByb3RvdHlwZS5zZXRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0dGhpcy5pdGVtID0gaXRlbTtcclxuXHRcclxuXHR0aGlzLnNvbGlkID0gaXRlbS5zb2xpZDtcclxuXHR0aGlzLmltZ0luZCA9IHRoaXMuaXRlbS5zdWJJbWc7XHJcblx0dGhpcy5pbWdTcGQgPSAwO1xyXG5cdGlmICh0aGlzLml0ZW0uYW5pbWF0aW9uTGVuZ3RoKXsgdGhpcy5pbWdTcGQgPSAxIC8gNjsgfVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleFt0aGlzLml0ZW0udGV4XS5idWZmZXJzW3RoaXMuaW1nSW5kXTtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gaXRlbS50ZXg7XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1tID0gdGhpcy5tYXBNYW5hZ2VyO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKHRoaXMuaXRlbS5pc0l0ZW0pe1xyXG5cdFx0aWYgKHRoaXMuaXRlbS50eXBlID09ICdjb2RleCcpe1xyXG5cdFx0XHQvKm1tLmFkZE1lc3NhZ2UoXCJUaGUgYm91bmRsZXNzIGtub3dubGVkZ2Ugb2YgdGhlIENvZGV4IGlzIHJldmVhbGVkIHVudG8gdGhlZS5cIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJBIHZvaWNlIHRodW5kZXJzIVwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlRob3UgaGFzdCBwcm92ZW4gdGh5c2VsZiB0byBiZSB0cnVseSBnb29kIGluIG5hdHVyZVwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlRob3UgbXVzdCBrbm93IHRoYXQgdGh5IHF1ZXN0IHRvIGJlY29tZSBhbiBBdmF0YXIgaXMgdGhlIGVuZGxlc3MgXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwicXVlc3Qgb2YgYSBsaWZldGltZS5cIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJBdmF0YXJob29kIGlzIGEgbGl2aW5nIGdpZnQsIEl0IG11c3QgYWx3YXlzIGFuZCBmb3JldmVyIGJlIG51cnR1cmVkXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwidG8gZmx1b3Jpc2gsIGZvciBpZiB0aG91IGRvc3Qgc3RyYXkgZnJvbSB0aGUgcGF0aHMgb2YgdmlydHVlLCB0aHkgd2F5XCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwibWF5IGJlIGxvc3QgZm9yZXZlci5cIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJSZXR1cm4gbm93IHVudG8gdGhpbmUgb3VyIHdvcmxkLCBsaXZlIHRoZXJlIGFzIGFuIGV4YW1wbGUgdG8gdGh5XCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwicGVvcGxlLCBhcyBvdXIgbWVtb3J5IG9mIHRoeSBnYWxsYW50IGRlZWRzIHNlcnZlcyB1cy5cIik7Ki9cclxuXHRcdFx0ZG9jdW1lbnQuZXhpdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcdGdhbWUucGxheWVyLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0XHRcdGdhbWUuZW5kaW5nKCk7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuaXRlbS50eXBlID09ICdmZWF0dXJlJyl7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3Ugc2VlIGEgXCIrdGhpcy5pdGVtLm5hbWUpO1xyXG5cdFx0fSBlbHNlIGlmIChnYW1lLmFkZEl0ZW0odGhpcy5pdGVtKSl7XHJcblx0XHRcdHZhciBzdGF0ID0gJyc7XHJcblx0XHRcdGlmICh0aGlzLml0ZW0uc3RhdHVzICE9PSB1bmRlZmluZWQpXHJcblx0XHRcdFx0c3RhdCA9IEl0ZW1GYWN0b3J5LmdldFN0YXR1c05hbWUodGhpcy5pdGVtLnN0YXR1cykgKyAnICc7XHJcblx0XHRcdFxyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiWW91IHBpY2sgdXAgYSBcIitzdGF0ICsgdGhpcy5pdGVtLm5hbWUpO1xyXG5cdFx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBjYW4ndCBjYXJyeSBhbnkgbW9yZSBpdGVtc1wiKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDApe1xyXG5cdFx0dmFyIGluZCA9ICh0aGlzLmltZ0luZCA8PCAwKTtcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4W3RoaXMuaXRlbS50ZXhdLmJ1ZmZlcnNbaW5kXTtcclxuXHRcdFxyXG5cdFx0aWYgKCF0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMuaXRlbS5hbmltYXRpb25MZW5ndGggPiAwKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLml0ZW0uc3ViSW1nICsgdGhpcy5pdGVtLmFuaW1hdGlvbkxlbmd0aCAtIDEpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IHRoaXMuaXRlbS5zdWJJbWc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wYXVzZWQpe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRpdGVtczoge1xyXG5cdFx0Ly8gSXRlbXNcclxuXHRcdHllbGxvd1BvdGlvbjoge25hbWU6IFwiWWVsbG93IHBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAwLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRyZWRQb3Rpb246IHtuYW1lOiBcIlJlZCBQb3Rpb25cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMSwgdHlwZTogJ3BvdGlvbid9LFxyXG5cdFx0XHJcblx0XHQvLyBXZWFwb25zXHJcblx0XHQvKlxyXG5cdFx0ICogRGFnZ2VyczogTG93IGRhbWFnZSwgbG93IHZhcmlhbmNlLCBIaWdoIHNwZWVkLCBEMywgMTYwRE1HIFxyXG5cdFx0ICogU3RhdmVzOiBNaWQgZGFtYWdlLCBMb3cgdmFyaWFuY2UsIE1pZCBzcGVlZCwgRDMsIDI0MERNR1xyXG5cdFx0ICogTWFjZXM6IEhpZ2ggRGFtYWdlLCBIaWdoIFZhcmlhbmNlLCBMb3cgc3BlZWQsIEQxMiwgMzYwIERNR1xyXG5cdFx0ICogQXhlczogTWlkIERhbWFnZSwgTG93IFZhcmlhbmNlLCBMb3cgc3BlZWQsIEQzLCAyNDBETUdcclxuXHRcdCAqIFN3b3JkczogTWlkIERhbWFnZSwgTWlkIHZhcmlhbmNlLCBNaWQgc3BlZWQsIEQ2LCAyNDBETUdcclxuXHRcdCAqIFxyXG5cdFx0ICogTXlzdGljIFN3b3JkOiBNaWQgRGFtYWdlLCBSYW5kb20gRGFtYWdlLCBNaWQgc3BlZWQsIEQzMiAyNTZETUdcclxuXHRcdCAqL1xyXG5cdFx0ZGFnZ2VyUG9pc29uOiB7bmFtZTogXCJQb2lzb24gRGFnZ2VyXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIsIHZpZXdQb3J0SW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMjBEMycsIHdlYXI6IDAuMDV9LFxyXG5cdFx0ZGFnZ2VyRmFuZzoge25hbWU6IFwiRmFuZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzLCB2aWV3UG9ydEltZzogMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzUwRDMnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGRhZ2dlclN0aW5nOiB7bmFtZTogXCJTdGluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA0LCB2aWV3UG9ydEltZzogMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzUwRDMnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdFxyXG5cdFx0c3RhZmZHYXJnb3lsZToge25hbWU6IFwiR2FyZ295bGUgU3RhZmZcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNSwgdmlld1BvcnRJbWc6IDEsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgd2VhcjogMC4wMn0sXHJcblx0XHRzdGFmZkFnZXM6IHtuYW1lOiBcIlN0YWZmIG9mIEFnZXNcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNiwgdmlld1BvcnRJbWc6IDEsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc4MEQzJywgd2VhcjogMC4wMn0sXHJcblx0XHRzdGFmZkNhYnlydXM6IHtuYW1lOiBcIlN0YWZmIG9mIENhYnlydXNcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNywgdmlld1BvcnRJbWc6IDEsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMDBEMycsIHdlYXI6IDAuMDJ9LFxyXG5cdFx0XHJcblx0XHRtYWNlQmFuZToge25hbWU6IFwiTWFjZSBvZiBVbmRlYWQgQmFuZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA4LCB2aWV3UG9ydEltZzogMywgdHlwZTogJ3dlYXBvbicsIHN0cjogJzIwRDEyJywgd2VhcjogMC4wM30sXHJcblx0XHRtYWNlQm9uZUNydXNoZXI6IHtuYW1lOiBcIkJvbmUgQ3J1c2hlciBNYWNlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDksIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMjVEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdG1hY2VKdWdnZXJuYXV0OiB7bmFtZTogXCJKdWdnZXJuYXV0IE1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTAsIHZpZXdQb3J0SW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMzBEMTInLCB3ZWFyOiAwLjAzfSxcclxuXHRcdG1hY2VTbGF5ZXI6IHtuYW1lOiBcIlNsYXllciBNYWNlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDExLCB2aWV3UG9ydEltZzogMywgdHlwZTogJ3dlYXBvbicsIHN0cjogJzQwRDEyJywgd2VhcjogMC4wM30sXHJcblx0XHRcclxuXHRcdGF4ZUR3YXJ2aXNoOiB7bmFtZTogXCJEd2FydmlzaCBBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTIsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNjBEMycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0YXhlUnVuZToge25hbWU6IFwiUnVuZWQgQXhlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEzLCB2aWV3UG9ydEltZzogNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzgwRDMnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGF4ZURlY2VpdmVyOiB7bmFtZTogXCJEZWNlaXZlciBBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTQsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTAwRDMnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdFxyXG5cdFx0c3dvcmRGaXJlOiB7bmFtZTogXCJGaXJlIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE1LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzQwRDYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRzd29yZENoYW9zOiB7bmFtZTogXCJDaGFvcyBTd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNiwgdmlld1BvcnRJbWc6IDAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc0MEQ2Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0c3dvcmREcmFnb246IHtuYW1lOiBcIkRyYWdvbnNsYXllciBTd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNywgdmlld1BvcnRJbWc6IDAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc1MEQ2Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0c3dvcmRRdWljazoge25hbWU6IFwiRW5pbG5vLCB0aGUgUXVpY2tzd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxOCwgdmlld1BvcnRJbWc6IDAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQ2Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHRzbGluZ0V0dGluOiB7bmFtZTogXCJFdHRpbiBTbGluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxOSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE1RDEyJywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ3JvY2snLCB3ZWFyOiAwLjA0fSxcclxuXHRcdFxyXG5cdFx0Ym93UG9pc29uOiB7bmFtZTogXCJQb2lzb24gQm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTVENicsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdhcnJvdycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0Ym93U2xlZXA6IHtuYW1lOiBcIlNsZWVwIEJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE1RDYnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGJvd01hZ2ljOiB7bmFtZTogXCJNYWdpYyBCb3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjIsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcyMEQ2JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Fycm93Jywgd2VhcjogMC4wMX0sXHJcblx0XHRjcm9zc2Jvd01hZ2ljOiB7bmFtZTogXCJNYWdpYyBDcm9zc2Jvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMywgdHlwZTogJ3dlYXBvbicsIHN0cjogJzMwRDYnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYm9sdCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdFxyXG5cdFx0d2FuZExpZ2h0bmluZzoge25hbWU6IFwiV2FuZCBvZiBMaWdodG5pbmdcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2JlYW0nLCB3ZWFyOiAwLjAxfSxcclxuXHRcdHdhbmRGaXJlOiB7bmFtZTogXCJXYW5kIG9mIEZpcmVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjUsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc2MEQzJywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2JlYW0nLCB3ZWFyOiAwLjAxfSxcclxuXHRcdHBoYXpvcjoge25hbWU6IFwiUGhhem9yXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI2LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTAwRDMnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYmVhbScsIHdlYXI6IDAuMDF9LFxyXG5cdFx0XHJcblx0XHRteXN0aWNTd29yZDoge25hbWU6IFwiTXlzdGljIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDM0LCB2aWV3UG9ydEltZzogNSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzhEMzInLCB3ZWFyOiAwLjB9LFxyXG5cdFx0XHJcblx0XHQvLyBBcm1vdXJcclxuXHRcdC8vVE9ETzogQWRkIGFybW9yIGRlZ3JhZGF0aW9uXHJcblx0XHRsZWF0aGVySW1wOiB7bmFtZTogXCJJbXAgTGVhdGhlciBhcm1vdXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjcsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcyNUQ4Jywgd2VhcjogMC4wNX0sXHJcblx0XHRsZWF0aGVyRHJhZ29uOiB7bmFtZTogXCJEcmFnb24gTGVhdGhlciBhcm1vdXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjgsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICczMEQ4Jywgd2VhcjogMC4wNX0sXHJcblx0XHRjaGFpbk1hZ2ljOiB7bmFtZTogXCJNYWdpYyBDaGFpbiBtYWlsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI5LCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMzVEOCcsIHdlYXI6IDAuMDN9LFxyXG5cdFx0Y2hhaW5Ed2FydmVuOiB7bmFtZTogXCJEd2FydmVuIENoYWluIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzAsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICc0MEQ4Jywgd2VhcjogMC4wM30sXHJcblx0XHRwbGF0ZU1hZ2ljOiB7bmFtZTogXCJNYWdpYyBQbGF0ZSBtYWlsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDMxLCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnNDVEOCcsIHdlYXI6IDAuMDE1fSxcclxuXHRcdHBsYXRlRXRlcm5pdW06IHtuYW1lOiBcIkV0ZXJuaXVtIFBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzIsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICc1MEQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0XHJcblx0XHRteXN0aWM6IHtuYW1lOiBcIk15c3RpYyBhcm1vdXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMzMsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcyMEQ4JywgaW5kZXN0cnVjdGlibGU6IHRydWV9LFxyXG5cdFx0XHJcblx0XHQvLyBTcGVsbCBtaXhlc1xyXG5cdFx0Y3VyZToge25hbWU6IFwiU3BlbGxtaXggb2YgQ3VyZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMCwgdHlwZTogJ21hZ2ljJywgbWFuYTogNX0sXHJcblx0XHRoZWFsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBIZWFsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxMCwgcGVyY2VudDogMC4yfSxcclxuXHRcdGxpZ2h0OiB7bmFtZTogXCJTcGVsbG1peCBvZiBMaWdodFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMiwgdHlwZTogJ21hZ2ljJywgbWFuYTogNSwgbGlnaHRUaW1lOiAxMDAwfSxcclxuXHRcdG1pc3NpbGU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIG1hZ2ljIG1pc3NpbGVcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDMsIHR5cGU6ICdtYWdpYycsIHN0cjogJzMwRDUnLCBtYW5hOiA1fSxcclxuXHRcdGljZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEljZWJhbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDQsIHR5cGU6ICdtYWdpYycsIHN0cjogJzY1RDUnLCBtYW5hOiAyMH0sXHJcblx0XHRyZXBlbDoge25hbWU6IFwiU3BlbGxtaXggb2YgUmVwZWwgVW5kZWFkXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA1LCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxNX0sXHJcblx0XHRibGluazoge25hbWU6IFwiU3BlbGxtaXggb2YgQmxpbmtcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDYsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGZpcmViYWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBGaXJlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMTAwRDUnLCBtYW5hOiAxNX0sXHJcblx0XHRwcm90ZWN0aW9uOiB7bmFtZTogXCJTcGVsbG1peCBvZiBwcm90ZWN0aW9uXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA4LCB0eXBlOiAnbWFnaWMnLCBwcm90VGltZTogNDAwLCBtYW5hOiAxNX0sXHJcblx0XHR0aW1lOiB7bmFtZTogXCJTcGVsbG1peCBvZiBUaW1lIFN0b3BcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDksIHR5cGU6ICdtYWdpYycsIHN0b3BUaW1lOiA2MDAsIG1hbmE6IDMwfSxcclxuXHRcdHNsZWVwOiB7bmFtZTogXCJTcGVsbG1peCBvZiBTbGVlcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTAsIHR5cGU6ICdtYWdpYycsIHNsZWVwVGltZTogNDAwLCBtYW5hOiAxNX0sXHJcblx0XHRqaW54OiB7bmFtZTogXCJTcGVsbG1peCBvZiBKaW54XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMzB9LFxyXG5cdFx0dHJlbW9yOiB7bmFtZTogXCJTcGVsbG1peCBvZiBUcmVtb3JcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHRraWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBLaWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnNDAwRDUnLCBtYW5hOiAyNX0sXHJcblx0XHRcclxuXHRcdC8vIENvZGV4XHJcblx0XHRjb2RleDoge25hbWU6IFwiQ29kZXggb2YgVWx0aW1hdGUgV2lzZG9tXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAwLCB0eXBlOiAnY29kZXgnfSxcclxuXHRcdFxyXG5cdFx0Ly8gRHVuZ2VvbiBmZWF0dXJlc1xyXG5cdFx0b3JiOiB7bmFtZTogXCJPcmJcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0ZGVhZFRyZWU6IHtuYW1lOiBcIkRlYWQgVHJlZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMiwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHR0cmVlOiB7bmFtZTogXCJUcmVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAzLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHN0YXR1ZToge25hbWU6IFwiU3RhdHVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA0LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHNpZ25Qb3N0OiB7bmFtZTogXCJTaWducG9zdFwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogNSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHR3ZWxsOiB7bmFtZTogXCJXZWxsXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA2LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdHNtYWxsU2lnbjoge25hbWU6IFwiU2lnblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogNywgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRsYW1wOiB7bmFtZTogXCJMYW1wXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA4LCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGZsYW1lOiB7bmFtZTogXCJGbGFtZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogOSwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRjYW1wZmlyZToge25hbWU6IFwiQ2FtcGZpcmVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEwLCB0eXBlOiAnZmVhdHVyZScsIHNvbGlkOiB0cnVlfSxcclxuXHRcdGFsdGFyOiB7bmFtZTogXCJBbHRhclwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTEsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9LFxyXG5cdFx0cHJpc29uZXJUaGluZzoge25hbWU6IFwiU3RvY2tzXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX0sXHJcblx0XHRmb3VudGFpbjoge25hbWU6IFwiRm91bnRhaW5cIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEzLCBhbmltYXRpb25MZW5ndGg6IDQsIHR5cGU6ICdmZWF0dXJlJywgc29saWQ6IHRydWV9XHJcblx0fSxcclxuXHRcclxuXHRnZXRJdGVtQnlDb2RlOiBmdW5jdGlvbihpdGVtQ29kZSwgc3RhdHVzKXtcclxuXHRcdGlmICghdGhpcy5pdGVtc1tpdGVtQ29kZV0pIHRocm93IFwiSW52YWxpZCBJdGVtIGNvZGU6IFwiICsgaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpdGVtQ29kZV07XHJcblx0XHR2YXIgcmV0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0XHR9O1xyXG5cdFx0Zm9yICh2YXIgaSBpbiBpdGVtKXtcclxuXHRcdFx0cmV0W2ldID0gaXRlbVtpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0LmlzSXRlbSA9IHRydWU7XHJcblx0XHRyZXQuY29kZSA9IGl0ZW1Db2RlO1xyXG5cdFx0XHJcblx0XHRpZiAocmV0LnR5cGUgPT0gJ3dlYXBvbicgfHwgcmV0LnR5cGUgPT0gJ2FybW91cicpe1xyXG5cdFx0XHRyZXQuZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcdFx0cmV0LnN0YXR1cyA9IHN0YXR1cztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFN0YXR1c05hbWU6IGZ1bmN0aW9uKHN0YXR1cyl7XHJcblx0XHRpZiAoc3RhdHVzID49IDAuOCl7XHJcblx0XHRcdHJldHVybiAnRXhjZWxsZW50JztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC41KXtcclxuXHRcdFx0cmV0dXJuICdTZXJ2aWNlYWJsZSc7XHJcblx0XHR9ZWxzZSBpZiAoc3RhdHVzID49IDAuMil7XHJcblx0XHRcdHJldHVybiAnV29ybic7XHJcblx0XHR9ZWxzZSBpZiAoc3RhdHVzID4gMC4wKXtcclxuXHRcdFx0cmV0dXJuICdCYWRseSB3b3JuJztcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gJ1J1aW5lZCc7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xyXG52YXIgRW5lbXkgPSByZXF1aXJlKCcuL0VuZW15Jyk7XHJcbnZhciBFbmVteUZhY3RvcnkgPSByZXF1aXJlKCcuL0VuZW15RmFjdG9yeScpO1xyXG52YXIgSXRlbSA9IHJlcXVpcmUoJy4vSXRlbScpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgU3RhaXJzID0gcmVxdWlyZSgnLi9TdGFpcnMnKTtcclxuXHJcbmZ1bmN0aW9uIE1hcEFzc2VtYmxlcigpe1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEFzc2VtYmxlcjtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVNYXAgPSBmdW5jdGlvbihtYXBNYW5hZ2VyLCBtYXBEYXRhLCBHTCl7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gIG1hcE1hbmFnZXI7XHJcblx0dGhpcy5jb3BpZWRUaWxlcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMucGFyc2VNYXAobWFwRGF0YSwgR0wpO1xyXG5cdFx0XHRcdFxyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBEYXRhLCBHTCk7IFxyXG5cdHRoaXMuYXNzZW1ibGVDZWlscyhtYXBEYXRhLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUJsb2NrcyhtYXBEYXRhLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZVNsb3BlcyhtYXBEYXRhLCBHTCk7XHJcblx0XHJcblx0dGhpcy5wYXJzZU9iamVjdHMobWFwRGF0YSk7XHJcblx0XHJcblx0dGhpcy5jb3BpZWRUaWxlcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMuaW5pdGlhbGl6ZVRpbGVzKG1hcERhdGEudGlsZXMpO1xyXG59XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlVGVycmFpbiA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmFzc2VtYmxlRmxvb3IobWFwTWFuYWdlciwgR0wpOyBcclxuXHR0aGlzLmFzc2VtYmxlQ2VpbHMobWFwTWFuYWdlciwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVCbG9ja3MobWFwTWFuYWdlciwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVTbG9wZXMobWFwTWFuYWdlciwgR0wpO1xyXG59XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmluaXRpYWxpemVUaWxlcyA9IGZ1bmN0aW9uKHRpbGVzKXtcclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbGVzLmxlbmd0aDsgaSsrKXtcclxuXHRcdGlmICh0aWxlc1tpXSlcclxuXHRcdFx0dGlsZXNbaV0uX2MgPSBjaXJjdWxhci5zZXRTYWZlKCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5nZXRFbXB0eUdyaWQgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBncmlkID0gW107XHJcblx0Zm9yICh2YXIgeT0wO3k8NjQ7eSsrKXtcclxuXHRcdGdyaWRbeV0gPSBbXTtcclxuXHRcdGZvciAodmFyIHg9MDt4PDY0O3grKyl7XHJcblx0XHRcdGdyaWRbeV1beF0gPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZ3JpZDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuY29weVRpbGUgPSBmdW5jdGlvbih0aWxlKXtcclxuXHR2YXIgcmV0ID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKVxyXG5cdH07XHJcblx0XHJcblx0Zm9yICh2YXIgaSBpbiB0aWxlKXtcclxuXHRcdHJldFtpXSA9IHRpbGVbaV07XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlRmxvb3IgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvRmxvb3JzID0gW107XHJcblx0dmFyIGZsb29yc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLmYpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBmbG9vcnNJbmQuaW5kZXhPZih0aWxlLmYpO1xyXG5cdFx0XHRcdHZhciBmbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGZsb29yc0luZC5wdXNoKHRpbGUuZik7XHJcblx0XHRcdFx0XHRmbCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHRmbC50aWxlID0gdGlsZS5mO1xyXG5cdFx0XHRcdFx0ZmwuclRpbGUgPSB0aWxlLnJmO1xyXG5cdFx0XHRcdFx0b0Zsb29ycy5wdXNoKGZsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGZsID0gb0Zsb29yc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgeXkgPSB0aWxlLnk7XHJcblx0XHRcdFx0aWYgKHRpbGUudykgeXkgKz0gdGlsZS5oO1xyXG5cdFx0XHRcdGlmICh0aWxlLmZ5KSB5eSA9IHRpbGUuZnk7XHJcblx0XHRcdFx0ZmxbeV1beF0gPSB7dGlsZTogdGlsZS5mLCB5OiB5eX07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Zsb29ycy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBmbG9vcjNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvRmxvb3JzW2ldLCBcIkZcIiwgR0wpO1xyXG5cdFx0Zmxvb3IzRC50ZXhJbmQgPSBvRmxvb3JzW2ldLnRpbGU7XHJcblx0XHRmbG9vcjNELnJUZXhJbmQgPSBvRmxvb3JzW2ldLnJUaWxlO1xyXG5cdFx0Zmxvb3IzRC50eXBlID0gXCJGXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goZmxvb3IzRCk7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZUNlaWxzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0NlaWxzID0gW107XHJcblx0dmFyIGNlaWxzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuYyl7XHJcblx0XHRcdFx0dmFyIGluZCA9IGNlaWxzSW5kLmluZGV4T2YodGlsZS5jKTtcclxuXHRcdFx0XHR2YXIgY2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRjZWlsc0luZC5wdXNoKHRpbGUuYyk7XHJcblx0XHRcdFx0XHRjbCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHRjbC50aWxlID0gdGlsZS5jO1xyXG5cdFx0XHRcdFx0b0NlaWxzLnB1c2goY2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0Y2wgPSBvQ2VpbHNbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y2xbeV1beF0gPSB7dGlsZTogdGlsZS5jLCB5OiB0aWxlLmNofTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvQ2VpbHMubGVuZ3RoO2krKyl7XHJcblx0XHR2YXIgY2VpbDNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQ2VpbHNbaV0sIFwiQ1wiLCBHTCk7XHJcblx0XHRjZWlsM0QudGV4SW5kID0gb0NlaWxzW2ldLnRpbGU7XHJcblx0XHRjZWlsM0QudHlwZSA9IFwiQ1wiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKGNlaWwzRCk7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZUJsb2NrcyA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9CbG9ja3MgPSBbXTtcclxuXHR2YXIgYmxvY2tzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUudyl7XHJcblx0XHRcdFx0dmFyIGluZCA9IGJsb2Nrc0luZC5pbmRleE9mKHRpbGUudyk7XHJcblx0XHRcdFx0dmFyIHdsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0YmxvY2tzSW5kLnB1c2godGlsZS53KTtcclxuXHRcdFx0XHRcdHdsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdHdsLnRpbGUgPSB0aWxlLnc7XHJcblx0XHRcdFx0XHRvQmxvY2tzLnB1c2god2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0d2wgPSBvQmxvY2tzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdsW3ldW3hdID0ge3RpbGU6IHRpbGUudywgeTogdGlsZS55LCBoOiB0aWxlLmh9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9CbG9ja3MubGVuZ3RoO2krKyl7XHJcblx0XHR2YXIgYmxvY2szRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob0Jsb2Nrc1tpXSwgXCJCXCIsIEdMKTtcclxuXHRcdGJsb2NrM0QudGV4SW5kID0gb0Jsb2Nrc1tpXS50aWxlO1xyXG5cdFx0YmxvY2szRC50eXBlID0gXCJCXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goYmxvY2szRCk7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZVNsb3BlcyA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9TbG9wZXMgPSBbXTtcclxuXHR2YXIgc2xvcGVzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuc2wpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBzbG9wZXNJbmQuaW5kZXhPZih0aWxlLnNsKTtcclxuXHRcdFx0XHR2YXIgc2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRzbG9wZXNJbmQucHVzaCh0aWxlLnNsKTtcclxuXHRcdFx0XHRcdHNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdHNsLnRpbGUgPSB0aWxlLnNsO1xyXG5cdFx0XHRcdFx0b1Nsb3Blcy5wdXNoKHNsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHNsID0gb1Nsb3Blc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgeXkgPSB0aWxlLnk7XHJcblx0XHRcdFx0aWYgKHRpbGUudykgeXkgKz0gdGlsZS5oO1xyXG5cdFx0XHRcdGlmICh0aWxlLmZ5KSB5eSA9IHRpbGUuZnk7XHJcblx0XHRcdFx0c2xbeV1beF0gPSB7dGlsZTogdGlsZS5zbCwgeTogeXksIGRpcjogdGlsZS5kaXJ9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9TbG9wZXMubGVuZ3RoO2krKyl7XHJcblx0XHR2YXIgc2xvcGUzRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob1Nsb3Blc1tpXSwgXCJTXCIsIEdMKTtcclxuXHRcdHNsb3BlM0QudGV4SW5kID0gb1Nsb3Blc1tpXS50aWxlO1xyXG5cdFx0c2xvcGUzRC50eXBlID0gXCJTXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goc2xvcGUzRCk7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU1hcCA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0aWYgKG1hcERhdGEubWFwW3ldW3hdICE9IDApe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEudGlsZXNbaW5kXTtcclxuXHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRpbGU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHRpbGUuZiAmJiB0aWxlLmYgPiAxMDApe1xyXG5cdFx0XHRcdFx0dGlsZS5yZiA9IHRpbGUuZiAtIDEwMDtcclxuXHRcdFx0XHRcdHRpbGUuaXNXYXRlciA9IHRydWU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHRpbGUueSA9IC0wLjI7XHJcblx0XHRcdFx0XHR0aWxlLmZ5ID0gLTAuMjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHRpbGUuZiA8IDEwMCl7XHJcblx0XHRcdFx0XHR2YXIgdDEsIHQyLCB0MywgdDQ7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beCsxXSkgdDEgPSAobWFwRGF0YS50aWxlc1ttYXBEYXRhLm1hcFt5XVt4KzFdXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5LTFdKSB0MiA9IChtYXBEYXRhLm1hcFt5LTFdW3hdLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ldW3gtMV0pIHQzID0gKG1hcERhdGEubWFwW3ldW3gtMV0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeSsxXSkgdDQgPSAobWFwRGF0YS50aWxlc1ttYXBEYXRhLm1hcFt5KzFdW3hdXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKHQxIHx8IHQyIHx8IHQzIHx8IHQ0KXtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY29waWVkVGlsZXNbaW5kXSl7XHJcblx0XHRcdFx0XHRcdFx0bWFwRGF0YS5tYXBbeV1beF0gPSB0aGlzLmNvcGllZFRpbGVzW2luZF07XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuY29waWVkVGlsZXNbaW5kXSA9IHRoaXMuY29weVRpbGUodGlsZSk7XHJcblx0XHRcdFx0XHRcdFx0dGlsZSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRpbGU7XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dGlsZS55ID0gLTE7XHJcblx0XHRcdFx0XHRcdFx0dGlsZS5oICs9IDE7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0aWxlLncpe1xyXG5cdFx0XHRcdFx0XHRcdFx0dGlsZS53ID0gMTA7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLmggPSAxO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUucGFyc2VPYmplY3RzID0gZnVuY3Rpb24obWFwRGF0YSl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1tYXBEYXRhLm9iamVjdHMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbyA9IG1hcERhdGEub2JqZWN0c1tpXTtcclxuXHRcdHZhciB4ID0gby54O1xyXG5cdFx0dmFyIHkgPSBvLnk7XHJcblx0XHR2YXIgeiA9IG8uejtcclxuXHRcdFxyXG5cdFx0c3dpdGNoIChvLnR5cGUpe1xyXG5cdFx0XHRjYXNlIFwicGxheWVyXCI6XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLnBsYXllciA9IG5ldyBQbGF5ZXIoKTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyLmluaXQodmVjMyh4LCB5LCB6KSwgdmVjMygwLjAsIG8uZGlyICogTWF0aC5QSV8yLCAwLjApLCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcIml0ZW1cIjpcclxuXHRcdFx0XHR2YXIgc3RhdHVzID0gTWF0aC5taW4oMC4zICsgKE1hdGgucmFuZG9tKCkgKiAwLjcpLCAxLjApO1xyXG5cdFx0XHRcdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZShvLml0ZW0sIHN0YXR1cyk7XHJcblx0XHRcdFx0dmFyIGl0ZW1PYmplY3QgPSBuZXcgSXRlbSgpO1xyXG5cdFx0XHRcdGl0ZW1PYmplY3QuaW5pdCh2ZWMzKHgsIHksIHopLCBpdGVtLCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChpdGVtT2JqZWN0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJlbmVteVwiOlxyXG5cdFx0XHRcdHZhciBlbmVteSA9IEVuZW15RmFjdG9yeS5nZXRFbmVteShvLmVuZW15KTtcclxuXHRcdFx0XHR2YXIgZW5lbXlPYmplY3QgPSBuZXcgRW5lbXkoKTtcclxuXHRcdFx0XHRlbmVteU9iamVjdC5pbml0KHZlYzMoeCwgeSwgeiksIGVuZW15LCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChlbmVteU9iamVjdCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwic3RhaXJzXCI6XHJcblx0XHRcdFx0dmFyIHN0YWlyc09iaiA9IG5ldyBTdGFpcnMoKTtcclxuXHRcdFx0XHRzdGFpcnNPYmouaW5pdCh2ZWMzKHgsIHksIHopLCB0aGlzLm1hcE1hbmFnZXIsIG8uZGlyKTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2goc3RhaXJzT2JqKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJkb29yXCI6XHJcblx0XHRcdFx0dmFyIHh4ID0gKHggPDwgMCkgLSAoKG8uZGlyID09IFwiSFwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB6eiA9ICh6IDw8IDApIC0gKChvLmRpciA9PSBcIlZcIik/IDEgOiAwKTtcclxuXHRcdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3p6XVt4eF0udztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuZG9vcnMucHVzaChuZXcgRG9vcih0aGlzLm1hcE1hbmFnZXIsIHZlYzMoeCwgeSwgeiksIG8uZGlyLCBcImRvb3IxXCIsIHRpbGUpKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG59OyIsInZhciBNYXBBc3NlbWJsZXIgPSByZXF1aXJlKCcuL01hcEFzc2VtYmxlcicpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ01hcE1hbmFnZXInLCAnZ2FtZScpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ01hcE1hbmFnZXInLCAnbWFwVG9EcmF3Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdNYXBNYW5hZ2VyJywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKXtcclxuXHRvYmplY3QuZ2FtZSA9IGdhbWU7XHJcblx0dmFyIEdMID0gZ2FtZS5HTC5jdHg7XHJcblx0dmFyIG1hcEFzc2VtYmxlciA9IG5ldyBNYXBBc3NlbWJsZXIoKTtcclxuXHRvYmplY3QubWFwVG9EcmF3ID0gW107XHJcblx0bWFwQXNzZW1ibGVyLmFzc2VtYmxlVGVycmFpbihvYmplY3QsIEdMKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBNYXBNYW5hZ2VyKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwTWFuYWdlcjtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnTWFwTWFuYWdlcicsIE1hcE1hbmFnZXIpO1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdhbWUsIG1hcCwgZGVwdGgpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignTWFwTWFuYWdlcicpO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLndhdGVyVGlsZXMgPSBbXTtcclxuXHR0aGlzLndhdGVyRnJhbWUgPSAwO1xyXG5cdFxyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5wbGF5ZXIgPSBudWxsO1xyXG5cdHRoaXMuaW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5vcmRlckluc3RhbmNlcyA9IFtdO1xyXG5cdHRoaXMuZG9vcnMgPSBbXTtcclxuXHR0aGlzLnBsYXllckxhc3QgPSBudWxsO1xyXG5cdHRoaXMuZGVwdGggPSBkZXB0aDtcclxuXHR0aGlzLnBvaXNvbkNvdW50ID0gMDtcclxuXHRcclxuXHR0aGlzLm1hcFRvRHJhdyA9IFtdO1xyXG5cdFxyXG5cdGlmIChtYXAgPT0gXCJ0ZXN0XCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwidGVzdE1hcFwiKTtcclxuXHR9IGVsc2UgaWYgKG1hcCA9PSBcImNvZGV4Um9vbVwiKXtcclxuXHRcdHRoaXMubG9hZE1hcChcImNvZGV4Um9vbVwiKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhpcy5nZW5lcmF0ZU1hcChkZXB0aCk7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2VuZXJhdGVNYXAgPSBmdW5jdGlvbihkZXB0aCl7XHJcblx0dmFyIGNvbmZpZyA9IHtcclxuXHRcdE1JTl9XSURUSDogMTAsXHJcblx0XHRNSU5fSEVJR0hUOiAxMCxcclxuXHRcdE1BWF9XSURUSDogMjAsXHJcblx0XHRNQVhfSEVJR0hUOiAyMCxcclxuXHRcdExFVkVMX1dJRFRIOiA2NCxcclxuXHRcdExFVkVMX0hFSUdIVDogNjQsXHJcblx0XHRTVUJESVZJU0lPTl9ERVBUSDogMyxcclxuXHRcdFNMSUNFX1JBTkdFX1NUQVJUOiAzLzgsXHJcblx0XHRTTElDRV9SQU5HRV9FTkQ6IDUvOCxcclxuXHRcdFJJVkVSX1NFR01FTlRfTEVOR1RIOiAxMCxcclxuXHRcdE1JTl9SSVZFUl9TRUdNRU5UUzogMTAsXHJcblx0XHRNQVhfUklWRVJfU0VHTUVOVFM6IDIwLFxyXG5cdFx0TUlOX1JJVkVSUzogMyxcclxuXHRcdE1BWF9SSVZFUlM6IDVcclxuXHR9O1xyXG5cdHZhciBnZW5lcmF0b3IgPSBuZXcgR2VuZXJhdG9yKGNvbmZpZyk7XHJcblx0dmFyIGtyYW1naW5lRXhwb3J0ZXIgPSBuZXcgS3JhbWdpbmVFeHBvcnRlcihjb25maWcpO1xyXG5cdHZhciBnZW5lcmF0ZWRMZXZlbCA9IGdlbmVyYXRvci5nZW5lcmF0ZUxldmVsKGRlcHRoLCB0aGlzLmdhbWUudW5pcXVlUmVnaXN0cnkpO1xyXG5cdFxyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR0cnl7XHJcblx0XHR3aW5kb3cuZ2VuZXJhdGVkTGV2ZWwgPSAoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0dmFyIG1hcERhdGEgPSBrcmFtZ2luZUV4cG9ydGVyLmdldExldmVsKGdlbmVyYXRlZExldmVsLmxldmVsKTtcclxuXHRcdHdpbmRvdy5tYXBEYXRhID0gKG1hcERhdGEpO1xyXG5cdFx0dmFyIG1hcEFzc2VtYmxlciA9IG5ldyBNYXBBc3NlbWJsZXIoKTtcclxuXHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdG1hcE0ubWFwID0gbWFwRGF0YS5tYXA7XHJcblx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHR9Y2F0Y2ggKGUpe1xyXG5cdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLnN0YWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0fVxyXG5cdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbihtYXBOYW1lKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCBjcCArICdtYXBzLycgKyBtYXBOYW1lICsgXCIuanNvblwiLCB0cnVlKTtcclxuXHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gIFx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgXHRcdFx0dHJ5e1xyXG5cdFx0XHRcdG1hcERhdGEgPSBKU09OLnBhcnNlKGh0dHAucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdFx0XHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLm1hcCA9IG1hcERhdGEubWFwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRcdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcdFx0fWNhdGNoIChlKXtcclxuXHRcdFx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5zdGFjayk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fTtcclxuXHRodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIixcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcclxuXHRodHRwLnNlbmQoKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gKHRoaXMud2F0ZXJUaWxlcy5pbmRleE9mKHRpbGVJZCkgIT0gLTEpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNXYXRlclBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQuZikgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLmlzV2F0ZXJUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc0xhdmFUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gdGlsZUlkID09IDEwMztcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGFuZ2VXYWxsVGV4dHVyZSA9IGZ1bmN0aW9uKHgsIHosIHRleHR1cmVJZCl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgYmFzZSA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghYmFzZS5jbG9uZWQpe1xyXG5cdFx0dmFyIG5ld1cgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgaW4gYmFzZSl7XHJcblx0XHRcdG5ld1dbaV0gPSBiYXNlW2ldO1xyXG5cdFx0fVxyXG5cdFx0bmV3Vy5jbG9uZWQgPSB0cnVlO1xyXG5cdFx0dGhpcy5tYXBbel1beF0gPSBuZXdXO1xyXG5cdFx0YmFzZSA9IG5ld1c7XHJcblx0fVxyXG5cdFxyXG5cdGJhc2UudyA9IHRleHR1cmVJZDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JBdCA9IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBkb29yID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdGlmIChkb29yLndhbGxQb3NpdGlvbi5lcXVhbHMoeCwgeSwgeikpIHJldHVybiBkb29yO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXQgPSBmdW5jdGlvbihwb3NpdGlvbil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5lcXVhbHMocG9zaXRpb24pKXtcclxuXHRcdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXRHcmlkID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA9PSBwb3NpdGlvbi5hICYmIHogPT0gcG9zaXRpb24uYyl7XHJcblx0XHRcdHJldHVybiAodGhpcy5pbnN0YW5jZXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldE5lYXJlc3RDbGVhbkl0ZW1UaWxlID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdFxyXG5cdHZhciBtaW5YID0geCAtIDE7XHJcblx0dmFyIG1pblogPSB6IC0gMTtcclxuXHR2YXIgbWF4WCA9IHggKyAxO1xyXG5cdHZhciBtYXhaID0geiArIDE7XHJcblx0XHJcblx0Zm9yICh2YXIgeno9bWluWjt6ejw9bWF4Wjt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PW1pblg7eHg8PW1heFg7eHgrKyl7XHJcblx0XHRcdGlmICh0aGlzLmlzU29saWQoeHgsIHp6LCAwKSB8fCB0aGlzLmlzV2F0ZXJQb3NpdGlvbih4eCwgenopKXtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHBvcyA9IHZlYzMoeHgsIDAsIHp6KTtcclxuXHRcdFx0dmFyIGlucyA9IHRoaXMuZ2V0SW5zdGFuY2VBdEdyaWQocG9zKTtcclxuXHRcdFx0aWYgKCFpbnMgfHwgKCFpbnMuaXRlbSAmJiAhaW5zLnN0YWlycykpe1xyXG5cdFx0XHRcdHJldHVybiBwb3M7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNOZWFyZXN0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGRpc3RhbmNlLCBoYXNQcm9wZXJ0eSl7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdGlmIChoYXNQcm9wZXJ0eSAmJiAhdGhpcy5pbnN0YW5jZXNbaV1baGFzUHJvcGVydHldKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hIC0gcG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeiA9IE1hdGguYWJzKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMgLSBwb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPD0gZGlzdGFuY2UgJiYgeiA8PSBkaXN0YW5jZSl7XHJcblx0XHRcdHJldC5wdXNoKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZU5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBzZWxmKXtcclxuXHR2YXIgcCA9IHBvcy5jbG9uZSgpO1xyXG5cdHAuYSA9IHAuYSArIHNwZC5hO1xyXG5cdHAuYyA9IHAuYyArIHNwZC5iO1xyXG5cdFxyXG5cdHZhciBpbnN0ID0gbnVsbCwgaG9yO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHRpZiAoIWlucyB8fCBpbnMuZGVzdHJveWVkIHx8ICFpbnMuc29saWQpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucyA9PT0gc2VsZikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gcC5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gcC5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4IDw9IDAuOCAmJiB6eiA8PSAwLjgpe1xyXG5cdFx0XHRpZiAocG9zLmEgPD0gaW5zLnBvc2l0aW9uLmEgLSAwLjggfHwgcG9zLmEgPj0gaW5zLnBvc2l0aW9uLmEgKyAwLjgpIGhvciA9IHRydWU7XHJcblx0XHRcdGVsc2UgaWYgKHBvcy5jIDw9IGlucy5wb3NpdGlvbi5jIC0gMC44IHx8IHBvcy5jID49IGlucy5wb3NpdGlvbi5jICsgMC44KSBob3IgPSBmYWxzZTsgIFxyXG5cdFx0XHRpbnN0ID0gaW5zO1xyXG5cdFx0XHRpID0gbGVuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpZiAoIWluc3QpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdGlmIChpbnN0LmhlaWdodCl7XHJcblx0XHRpZiAocG9zLmIgKyBoIDwgaW5zdC5wb3NpdGlvbi5iKSByZXR1cm4gbnVsbDtcclxuXHRcdGlmIChwb3MuYiA+PSBpbnN0LnBvc2l0aW9uLmIgKyBpbnN0LmhlaWdodCkgcmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChob3IpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMucmlnaHQ7XHJcblx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLndhbGxIYXNOb3JtYWwgPSBmdW5jdGlvbih4LCB5LCBub3JtYWwpe1xyXG5cdHZhciB0MSA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdHN3aXRjaCAobm9ybWFsKXtcclxuXHRcdGNhc2UgJ3UnOiB5IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnbCc6IHggLT0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdkJzogeSArPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ3InOiB4ICs9IDE7IGJyZWFrO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHR2YXIgdDIgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRcclxuXHRpZiAoIXQyLncpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0Mi53ICYmICEodDIueSA9PSB0MS55ICYmIHQyLmggPT0gdDEuaCkpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgaW5XYXRlcil7XHJcblx0dmFyIHh4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgenogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGRvb3IgPSB0aGlzLmdldERvb3JBdCh4eCwgeSwgenopO1xyXG5cdGlmIChkb29yKXtcclxuXHRcdHZhciB4eHggPSAocG9zLmEgKyBzcGQuYSkgLSB4eDtcclxuXHRcdHZhciB6enogPSAocG9zLmMgKyBzcGQuYikgLSB6ejtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSAocG9zLmEgLSB4eCk7XHJcblx0XHR2YXIgeiA9IChwb3MuYyAtIHp6KTtcclxuXHRcdGlmIChkb29yLmRpciA9PSBcIlZcIil7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGlmICh6enogPiAwLjI1ICYmIHp6eiA8IDAuNzUpIHJldHVybiBudWxsO1xyXG5cdFx0XHRpZiAoeCA8IDAgfHwgeCA+IDEpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRpZiAoeHh4ID4gMC4yNSAmJiB4eHggPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHogPCAwIHx8IHogPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRlbHNlIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oeCwgeiwgeSl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0aWYgKHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRpZiAodC55ICsgdC5oIDw9IHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGVja0JveENvbGxpc2lvbiA9IGZ1bmN0aW9uKGJveDEsIGJveDIpe1xyXG5cdGlmIChib3gxLngyIDwgYm94Mi54MSB8fCBib3gxLngxID4gYm94Mi54MiB8fCBib3gxLnoyIDwgYm94Mi56MSB8fCBib3gxLnoxID4gYm94Mi56Mil7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0QkJveFdhbGxOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgYldpZHRoKXtcclxuXHR2YXIgeCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGJCb3ggPSB7XHJcblx0XHR4MTogcG9zLmEgKyBzcGQuYSAtIGJXaWR0aCxcclxuXHRcdHoxOiBwb3MuYyArIHNwZC5iIC0gYldpZHRoLFxyXG5cdFx0eDI6IHBvcy5hICsgc3BkLmEgKyBiV2lkdGgsXHJcblx0XHR6MjogcG9zLmMgKyBzcGQuYiArIGJXaWR0aFxyXG5cdH07XHJcblx0XHJcblx0dmFyIHhtID0geCAtIDE7XHJcblx0dmFyIHptID0geiAtIDE7XHJcblx0dmFyIHhNID0geG0gKyAzO1xyXG5cdHZhciB6TSA9IHptICsgMztcclxuXHRcclxuXHR2YXIgdDtcclxuXHRmb3IgKHZhciB6ej16bTt6ejx6TTt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PXhtO3h4PHhNO3h4Kyspe1xyXG5cdFx0XHRpZiAoIXRoaXMubWFwW3p6XSkgY29udGludWU7XHJcblx0XHRcdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gMCkgY29udGludWU7XHJcblx0XHRcdFxyXG5cdFx0XHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHQueSt0LmggPD0geSkgY29udGludWU7XHJcblx0XHRcdGVsc2UgaWYgKHQueSA+IHkgKyAwLjUpIGNvbnRpbnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGJveCA9IHtcclxuXHRcdFx0XHR4MTogeHgsXHJcblx0XHRcdFx0ejE6IHp6LFxyXG5cdFx0XHRcdHgyOiB4eCArIDEsXHJcblx0XHRcdFx0ejI6IHp6ICsgMVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuY2hlY2tCb3hDb2xsaXNpb24oYkJveCwgYm94KSl7XHJcblx0XHRcdFx0dmFyIHh4eCA9IHBvcy5hIC0geHg7XHJcblx0XHRcdFx0dmFyIHp6eiA9IHBvcy5jIC0geno7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG5WID0gdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3UnKSB8fCB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpO1xyXG5cdFx0XHRcdHZhciBuSCA9IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdyJykgfHwgdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2wnKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoenp6ID49IC1iV2lkdGggJiYgenp6IDwgMSArIGJXaWR0aCAmJiBuSCl7XHJcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh4eHggPj0gLWJXaWR0aCAmJiB4eHggPCAxICsgYldpZHRoICYmIG5WKXtcclxuXHRcdFx0XHRcdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgdCwgdGg7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt6el0pIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRpID0gNDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHRoID0gdC5oIC0gMC4zO1xyXG5cdGlmIChpbldhdGVyKSB5ICs9IDAuMztcclxuXHRpZiAodC5zbCkgdGggKz0gMC4yO1xyXG5cdFxyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC55K3RoIDw9IHkpIHJldHVybiBudWxsO1xyXG5cdGVsc2UgaWYgKHQueSA+IHkgKyBoKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0Lncpe1xyXG5cdFx0dmFyIHRleCA9IHRoaXMuZ2FtZS5nZXRUZXh0dXJlQnlJZCh0LncsIFwid2FsbFwiKTtcclxuXHRcdGlmICh0ZXguaXNTb2xpZCl7XHJcblx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgJiYgenp6IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpICYmIHp6eiA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpICYmIHh4eCA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0OyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpICYmIHh4eCA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDsgfVxyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICh0LmR3KXtcclxuXHRcdHZhciB4LCB6LCB4eHgsIHp6eiwgbm9ybWFsO1xyXG5cdFx0eCA9IHBvcy5hICsgc3BkLmE7XHJcblx0XHR6ID0gcG9zLmMgKyBzcGQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKHQuYXcgPT0gMCl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwTGVmdDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAxKXsgeHh4ID0geCAtIHh4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBSaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAyKXsgeHh4ID0geCAtIHh4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93blJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDMpeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duTGVmdDsgfVxyXG5cdFx0aWYgKHp6eiA+PSB4eHgpe1xyXG5cdFx0XHRyZXR1cm4gbm9ybWFsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFlGbG9vciA9IGZ1bmN0aW9uKHgsIHksIG5vV2F0ZXIpe1xyXG5cdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeDw8MCwwLHk8PDApKTtcclxuXHRpZiAoaW5zICE9IG51bGwgJiYgaW5zLmhlaWdodCl7XHJcblx0XHRyZXR1cm4gaW5zLnBvc2l0aW9uLmIgKyBpbnMuaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgeHggPSB4IC0gKHggPDwgMCk7XHJcblx0dmFyIHl5ID0geSAtICh5IDw8IDApO1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eSA9IHkgPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbeV1beF07XHJcblx0dmFyIHR0ID0gdC55O1xyXG5cdFxyXG5cdGlmICh0LncpIHR0ICs9IHQuaDtcclxuXHRpZiAodC5mKSB0dCA9IHQuZnk7XHJcblx0XHJcblx0aWYgKCFub1dhdGVyICYmIHRoaXMuaXNXYXRlclRpbGUodC5mKSkgdHQgLT0gMC4zO1xyXG5cdFxyXG5cdGlmICh0LnNsKXtcclxuXHRcdGlmICh0LmRpciA9PSAwKSB0dCArPSB5eSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDEpIHR0ICs9IHh4ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMikgdHQgKz0gKDEuMCAtIHl5KSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDMpIHR0ICs9ICgxLjAgLSB4eCkgKiAwLjU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0dDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmRyYXdNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciB4LCB5O1xyXG5cdHggPSB0aGlzLnBsYXllci5wb3NpdGlvbi5hO1xyXG5cdHkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi5jO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tYXBUb0RyYXcubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXRkID0gdGhpcy5tYXBUb0RyYXdbaV07XHJcblx0XHRcclxuXHRcdGlmICh4IDwgbXRkLmJvdW5kYXJpZXNbMF0gfHwgeCA+IG10ZC5ib3VuZGFyaWVzWzJdIHx8IHkgPCBtdGQuYm91bmRhcmllc1sxXSB8fCB5ID4gbXRkLmJvdW5kYXJpZXNbM10pXHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobXRkLnR5cGUgPT0gXCJCXCIpeyAvLyBCbG9ja3NcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdCbG9jayhtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiRlwiKXsgLy8gRmxvb3JzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdGlmICh0aGlzLmlzV2F0ZXJUaWxlKHR0KSl7IFxyXG5cdFx0XHRcdHR0ID0gKG10ZC5yVGV4SW5kKSArICh0aGlzLndhdGVyRnJhbWUgPDwgMCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnd2F0ZXInKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnZmxvb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiQ1wiKXsgLy8gQ2VpbHNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnY2VpbCcpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiU1wiKXsgLy8gU2xvcGVcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdTbG9wZShtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoaW52W2ldLmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRyZXR1cm4gaW52W2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSwgYW1vdW50KXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IGludltpXTtcclxuXHRcdGlmIChpdC5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0aWYgKC0taXQuYW1vdW50ID09IDApe1xyXG5cdFx0XHRcdGludi5zcGxpY2UoaSwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmFkZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHR0aGlzLmdhbWUuY29uc29sZS5hZGRTRk1lc3NhZ2UodGV4dCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLnRpbWVTdG9wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy53YXRlckZyYW1lICs9IDAuMTtcclxuXHRpZiAodGhpcy53YXRlckZyYW1lID49IDIpIHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNUb0RyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdGktLTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciBkaXN0ID0geHggKiB4eCArIHp6ICogeno7XHJcblx0XHR2YXIgYWRkZWQgPSBmYWxzZTtcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRpZiAoZGlzdCA+IHRoaXMub3JkZXJJbnN0YW5jZXNbal0uZGlzdCl7XHJcblx0XHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaiwwLHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdFx0XHRhZGRlZCA9IHRydWU7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCFhZGRlZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMucHVzaCh7X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdPcmRlckluc3RhbmNlJyksIGluczogaW5zLCBkaXN0OiBkaXN0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzQXQgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aWYgKE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmEpID09IHggJiYgTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYykgPT0geilcclxuXHRcdFx0cmV0LnB1c2goaW5zKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcCA9PSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3TWFwKCk7XHJcblx0XHJcblx0dGhpcy5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5vcmRlckluc3RhbmNlc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aW5zID0gaW5zLmlucztcclxuXHRcdFxyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcihpbnMucG9zaXRpb24uYSwgaW5zLnBvc2l0aW9uLmIsIGlucy5wb3NpdGlvbi5jLCBpbnMucm90YXRpb24sIGlucy50ZXh0dXJlQ29kZSk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3JXYWxsKGlucy5kb29yUG9zaXRpb24uYSwgaW5zLmRvb3JQb3NpdGlvbi5iLCBpbnMuZG9vclBvc2l0aW9uLmMsIGlucy53YWxsVGV4dHVyZSwgKGlucy5kaXIgPT0gXCJWXCIpKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIubG9vcCgpO1xyXG5cdGlmICh0aGlzLnBvaXNvbkNvdW50ID4gMCl7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50IC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZ2FtZS5wbGF5ZXIucG9pc29uZWQgJiYgdGhpcy5wb2lzb25Db3VudCA9PSAwKXtcclxuXHRcdHRoaXMucGxheWVyLnJlY2VpdmVEYW1hZ2UoMTApO1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCA9IDEwMDtcclxuXHR9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1ha2VQZXJzcGVjdGl2ZTogZnVuY3Rpb24oZm92LCBhc3BlY3RSYXRpbywgek5lYXIsIHpGYXIpe1xyXG5cdFx0dmFyIHpMaW1pdCA9IHpOZWFyICogTWF0aC50YW4oZm92ICogTWF0aC5QSSAvIDM2MCk7XHJcblx0XHR2YXIgQSA9IC0oekZhciArIHpOZWFyKSAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEIgPSAtMiAqIHpGYXIgKiB6TmVhciAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEMgPSAoMiAqIHpOZWFyKSAvICh6TGltaXQgKiBhc3BlY3RSYXRpbyAqIDIpO1xyXG5cdFx0dmFyIEQgPSAoMiAqIHpOZWFyKSAvICgyICogekxpbWl0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0QywgMCwgMCwgMCxcclxuXHRcdFx0MCwgRCwgMCwgMCxcclxuXHRcdFx0MCwgMCwgQSwtMSxcclxuXHRcdFx0MCwgMCwgQiwgMFxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG5ld01hdHJpeDogZnVuY3Rpb24oY29scywgcm93cyl7XHJcblx0XHR2YXIgcmV0ID0gbmV3IEFycmF5KHJvd3MpO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8cm93cztpKyspe1xyXG5cdFx0XHRyZXRbaV0gPSBuZXcgQXJyYXkoY29scyk7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPGNvbHM7aisrKXtcclxuXHRcdFx0XHRyZXRbaV1bal0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRJZGVudGl0eTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtYWtlVHJhbnNmb3JtOiBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSl7XHJcblx0XHQvLyBTdGFydHMgd2l0aCB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0XHR2YXIgdE1hdCA9IHRoaXMuZ2V0SWRlbnRpdHkoKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3RcclxuXHRcdC8vIFVudGlsIEkgZmluZCB0aGUgbmVlZCB0byByb3RhdGUgYW4gb2JqZWN0IGl0c2VsZiBpdCByZWFtaW5zIGFzIGNvbW1lbnRcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgob2JqZWN0LnJvdGF0aW9uLmEpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKG9iamVjdC5yb3RhdGlvbi5iKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKG9iamVjdC5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIElmIHRoZSBvYmplY3QgaXMgYSBiaWxsYm9hcmQsIHRoZW4gbWFrZSBpdCBsb29rIHRvIHRoZSBjYW1lcmFcclxuXHRcdGlmIChvYmplY3QuaXNCaWxsYm9hcmQgJiYgIW9iamVjdC5ub1JvdGF0ZSkgdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoLShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IHRvIGl0cyBwb3NpdGlvblxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbihvYmplY3QucG9zaXRpb24uYSwgb2JqZWN0LnBvc2l0aW9uLmIsIG9iamVjdC5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCBpbiByZWxhdGlvbiB0byB0aGUgY2FtZXJhXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKC1jYW1lcmEucG9zaXRpb24uYSwgLWNhbWVyYS5wb3NpdGlvbi5iIC0gY2FtZXJhLmNhbWVyYUhlaWdodCwgLWNhbWVyYS5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0IGluIHRoZSBjYW1lcmEgZGlyZWN0aW9uIChJIGRvbid0IHJlYWxseSByb3RhdGUgaW4gdGhlIFogYXhpcylcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWCgtY2FtZXJhLnJvdGF0aW9uLmEpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblooLWNhbWVyYS5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0TWF0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0VHJhbnNsYXRpb246IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0eCwgeSwgeiwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWDogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgQywgUywgMCxcclxuXHRcdFx0MCwtUywgQywgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWTogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIDAsIFMsIDAsXHJcblx0XHRcdCAwLCAxLCAwLCAwLFxyXG5cdFx0XHQtUywgMCwgQywgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblo6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCBTLCAwLCAwLFxyXG5cdFx0XHQtUywgQywgMCwgMCxcclxuXHRcdFx0IDAsIDAsIDEsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWluaU1hdHJpeE11bHQ6IGZ1bmN0aW9uKHJvdywgY29sdW1uKXtcclxuXHRcdHZhciByZXN1bHQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1yb3cubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHJlc3VsdCArPSByb3dbaV0gKiBjb2x1bW5baV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSxcclxuXHRcclxuXHRtYXRyaXhNdWx0aXBsaWNhdGlvbjogZnVuY3Rpb24obWF0cml4QSwgbWF0cml4Qil7XHJcblx0XHR2YXIgQTEgPSBbbWF0cml4QVswXSwgIG1hdHJpeEFbMV0sICBtYXRyaXhBWzJdLCAgbWF0cml4QVszXV07XHJcblx0XHR2YXIgQTIgPSBbbWF0cml4QVs0XSwgIG1hdHJpeEFbNV0sICBtYXRyaXhBWzZdLCAgbWF0cml4QVs3XV07XHJcblx0XHR2YXIgQTMgPSBbbWF0cml4QVs4XSwgIG1hdHJpeEFbOV0sICBtYXRyaXhBWzEwXSwgbWF0cml4QVsxMV1dO1xyXG5cdFx0dmFyIEE0ID0gW21hdHJpeEFbMTJdLCBtYXRyaXhBWzEzXSwgbWF0cml4QVsxNF0sIG1hdHJpeEFbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIEIxID0gW21hdHJpeEJbMF0sIG1hdHJpeEJbNF0sIG1hdHJpeEJbOF0sICBtYXRyaXhCWzEyXV07XHJcblx0XHR2YXIgQjIgPSBbbWF0cml4QlsxXSwgbWF0cml4Qls1XSwgbWF0cml4Qls5XSwgIG1hdHJpeEJbMTNdXTtcclxuXHRcdHZhciBCMyA9IFttYXRyaXhCWzJdLCBtYXRyaXhCWzZdLCBtYXRyaXhCWzEwXSwgbWF0cml4QlsxNF1dO1xyXG5cdFx0dmFyIEI0ID0gW21hdHJpeEJbM10sIG1hdHJpeEJbN10sIG1hdHJpeEJbMTFdLCBtYXRyaXhCWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBtbW0gPSB0aGlzLm1pbmlNYXRyaXhNdWx0O1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0bW1tKEExLCBCMSksIG1tbShBMSwgQjIpLCBtbW0oQTEsIEIzKSwgbW1tKEExLCBCNCksXHJcblx0XHRcdG1tbShBMiwgQjEpLCBtbW0oQTIsIEIyKSwgbW1tKEEyLCBCMyksIG1tbShBMiwgQjQpLFxyXG5cdFx0XHRtbW0oQTMsIEIxKSwgbW1tKEEzLCBCMiksIG1tbShBMywgQjMpLCBtbW0oQTMsIEI0KSxcclxuXHRcdFx0bW1tKEE0LCBCMSksIG1tbShBNCwgQjIpLCBtbW0oQTQsIEIzKSwgbW1tKEE0LCBCNClcclxuXHRcdF07XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ01pc3NpbGUnLCAnYmlsbGJvYXJkJyk7XHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ01pc3NpbGUnLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpIHtcclxuXHRvYmplY3QuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIGdhbWUuR0wuY3R4KTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnNbb2JqZWN0LnN1YkltZ107XHJcblx0XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gTWlzc2lsZSgpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignTWlzc2lsZScpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3NpbGU7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ01pc3NpbGUnLCBNaXNzaWxlKTtcclxuXHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIHJvdGF0aW9uLCB0eXBlLCB0YXJnZXQsIG1hcE1hbmFnZXIpe1xyXG5cdHZhciBnbCA9IG1hcE1hbmFnZXIuZ2FtZS5HTC5jdHg7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSByb3RhdGlvbjtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnbCk7XHJcblx0dGhpcy50eXBlID0gdHlwZTtcclxuXHR0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ciA9IDA7XHJcblx0dGhpcy5zcGVlZCA9IDAuMztcclxuXHR0aGlzLm1pc3NlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMudnNwZWVkID0gMDtcclxuXHR0aGlzLmdyYXZpdHkgPSAwO1xyXG5cdFxyXG5cdHZhciBzdWJJbWcgPSAwO1xyXG5cdHN3aXRjaCAodHlwZSl7XHJcblx0XHRjYXNlICdzbGluZyc6IFxyXG5cdFx0XHRzdWJJbWcgPSAwO1xyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4yOyBcclxuXHRcdFx0dGhpcy5ncmF2aXR5ID0gMC4wMDU7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Jvdyc6IFxyXG5cdFx0XHRzdWJJbWcgPSAxO1xyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4yOyBcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnY3Jvc3Nib3cnOiBcclxuXHRcdFx0c3ViSW1nID0gMjsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjM7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ21hZ2ljTWlzc2lsZSc6IFxyXG5cdFx0XHRzdWJJbWcgPSAzOyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnaWNlQmFsbCc6XHJcblx0XHRcdHN1YkltZyA9IDQ7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC40O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdmaXJlQmFsbCc6XHJcblx0XHRcdHN1YkltZyA9IDU7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC40O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdraWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNjsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjU7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5zdWJJbWcgPSBzdWJJbWc7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9ICdib2x0cyc7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gbWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5ib2x0cy5idWZmZXJzW3N1YkltZ107XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5jaGVja0NvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1hcCA9IHRoaXMubWFwTWFuYWdlci5tYXA7XHJcblx0aWYgKHRoaXMucG9zaXRpb24uYSA8IDAgfHwgdGhpcy5wb3NpdGlvbi5jIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmEgPj0gbWFwWzBdLmxlbmd0aCB8fCB0aGlzLnBvc2l0aW9uLmMgPj0gbWFwLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciB4ID0gdGhpcy5wb3NpdGlvbi5hIDw8IDA7XHJcblx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgKyAwLjU7XHJcblx0dmFyIHogPSB0aGlzLnBvc2l0aW9uLmMgPDwgMDtcclxuXHR2YXIgdGlsZSA9IG1hcFt6XVt4XTtcclxuXHRcclxuXHRpZiAodGlsZS53IHx8IHRpbGUud2QgfHwgdGlsZS53ZCl7XHJcblx0XHRpZiAoISh0aWxlLnkgKyB0aWxlLmggPCB5IHx8IHRpbGUueSA+IHkpKXtcclxuXHRcdFx0IHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKHkgPCB0aWxlLmZ5IHx8IHkgPiB0aWxlLmNoKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIGlucywgZGZzO1xyXG5cdGlmICh0aGlzLnRhcmdldCA9PSAnZW5lbXknKXtcclxuXHRcdHZhciBpbnN0YW5jZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAwLjUsICdlbmVteScpO1xyXG5cdFx0dmFyIGRpc3QgPSAxMDAwMDtcclxuXHRcdGlmIChpbnN0YW5jZXMubGVuZ3RoID4gMSl7XHJcblx0XHRcdGZvciAodmFyIGk9MCxsZW49aW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdHZhciB4eCA9IE1hdGguYWJzKHRoaXMucG9zaXRpb24uYSAtIGluc3RhbmNlc1tpXS5wb3NpdGlvbi5hKTtcclxuXHRcdFx0XHR2YXIgeXkgPSBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLmMgLSBpbnN0YW5jZXNbaV0ucG9zaXRpb24uYyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGQgPSB4eCAqIHh4ICsgeXkgKiB5eTtcclxuXHRcdFx0XHRpZiAoZCA8IGRpc3Qpe1xyXG5cdFx0XHRcdFx0ZGlzdCA9IGQ7XHJcblx0XHRcdFx0XHRpbnMgPSBpbnN0YW5jZXNbaV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAoaW5zdGFuY2VzLmxlbmd0aCA9PSAxKXtcclxuXHRcdFx0aW5zID0gaW5zdGFuY2VzWzBdO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkZnMgPSBVdGlscy5yb2xsRGljZShpbnMuZW5lbXkuc3RhdHMuZGZzKTtcclxuXHR9ZWxzZXtcclxuXHRcdGlucyA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHRoaXMuc3RyIC0gZGZzLCAwKTtcclxuXHRcclxuXHRpZiAodGhpcy5taXNzZWQpe1xyXG5cdFx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKGRtZyAhPSAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIGRhbWFnZVwiKTsgLy8gVE9ETzogUmVwbGFjZSB3aXRoIHBvcHVwIG92ZXIgaW5zXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2hpdCcpO1xyXG5cdFx0aW5zLnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnYmxvY2snKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy52c3BlZWQgKz0gdGhpcy5ncmF2aXR5O1xyXG5cdFxyXG5cdHZhciB4VG8gPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5zcGVlZDtcclxuXHR2YXIgeVRvID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5hKSAqIHRoaXMuc3BlZWQgLSB0aGlzLnZzcGVlZDtcclxuXHR2YXIgelRvID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24uc3VtKHZlYzMoeFRvLCB5VG8sIHpUbykpO1xyXG5cdFxyXG5cdGlmICghdGhpcy5jaGVja0NvbGxpc2lvbigpKXtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07IiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bm9ybWFsczoge1xyXG5cdFx0ZG93bjogIHZlYzIoIDAsIDEpLFxyXG5cdFx0cmlnaHQ6IHZlYzIoIDEsIDApLFxyXG5cdFx0dXA6ICAgIHZlYzIoIDAsLTEpLFxyXG5cdFx0bGVmdDogIHZlYzIoLTEsIDApLFxyXG5cdFx0XHJcblx0XHR1cFJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0dXBMZWZ0OiAgdmVjMigtTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCAtTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKSxcclxuXHRcdGRvd25SaWdodDogIHZlYzIoTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCBNYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93bkxlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSlcclxuXHR9LFxyXG5cdFxyXG5cdGN1YmU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0LCAvKlt1LGwsZCxyXSovIGZhY2VzKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXTtcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGlmICghZmFjZXMpIGZhY2VzID0gWzEsMSwxLDFdO1xyXG5cdFx0aWYgKGZhY2VzWzBdKXsgLy8gVXAgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgXHQgdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1sxXSl7IC8vIExlZnQgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0XHQgdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDAsMCwwLDApO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzJdKXsgLy8gRG93biBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMSwxLDEsMSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbM10peyAvLyBSaWdodCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHRcdC13LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHRcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHRcdDAuMCwgdHksXHJcblx0XHRcdFx0MC4wLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGZsb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRjZWlsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAyLCAxLCAxLCAyLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRkb29yV2FsbDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jICogMC4wNTtcclxuXHRcdFxyXG5cdFx0dmFyIHcyID0gLXNpemUuYSAqIDAuMjU7XHJcblx0XHR2YXIgdzMgPSBzaXplLmEgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgaDIgPSAxIC0gc2l6ZS5iICogMC4yNTtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQvLyBSaWdodCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dzIsICBoLCAgbCxcclxuXHRcdFx0dzIsICAwLCAgbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIExlZnQgcGFydCBvZiB0aGUgZG9vclxyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCB3LCAgMCwgLWwsXHJcblx0XHRcdHczLCAgaCwgLWwsXHJcblx0XHRcdHczLCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIE1pZGRsZSBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgaDIsICBsLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgaDIsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIEJvdHRvbSBGYWNlXHJcblx0XHRcdHczLCBoMiwgLWwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdHcyLCBoMiwgLWwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTw2O2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuMjUsIHR5LFxyXG5cdFx0XHRcdDAuMjUsMC4wLFxyXG5cdFx0XHRcdDAuMDAsIHR5LFxyXG5cdFx0XHRcdDAuMDAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuNSwxLjAsXHJcblx0XHRcdFx0MC41LDAuNzUsXHJcblx0XHRcdFx0MC4wLDEuMCxcclxuXHRcdFx0XHQwLjAsMC43NVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0fSxcclxuXHRcclxuXHRkb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBsaWdodCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYTtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAgbCxcclxuXHRcdFx0IDAsICAwLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKHR4LCB0eSwgdHgsMC4wLCAwLjAsIHR5LCAwLjAsMC4wKTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKDAuMCwgdHksIDAuMCwwLjAsIHR4LCB0eSwgdHgsMC4wKTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4wMSwwLjAxLFxyXG5cdFx0XHRcdDAuMDEsMC4wLFxyXG5cdFx0XHRcdDAuMCAsMC4wMSxcclxuXHRcdFx0XHQwLjAgLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwxNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0cmV0dXJuIGRvb3I7XHJcblx0fSxcclxuXHRcclxuXHRiaWxsYm9hcmQ6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IHcsICBoLCAgMCxcclxuXHRcdFx0LXcsICBoLCAgMCxcclxuXHRcdFx0IHcsICAwLCAgMCxcclxuXHRcdFx0LXcsICAwLCAgMCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49NDtpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW1xyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHRdO1xyXG5cdFx0XHRcdCBcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBiaWxsID0gIHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YmlsbC5pc0JpbGxib2FyZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gYmlsbDtcclxuXHR9LFxyXG5cdFxyXG5cdHNsb3BlOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBkaXIpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCAvLyBGcm9udCBTbG9wZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQgLy8gUmlnaHQgU2lkZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdCAvLyBMZWZ0IFNpZGVcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdC13LCAgMC4wLCAgbFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aWYgKGRpciAhPSAwKXtcclxuXHRcdFx0dmFyIGFuZyA9IE1hdGguZGVnVG9SYWQoZGlyICogLTkwKTtcclxuXHRcdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHZlcnRleC5sZW5ndGg7aSs9Myl7XHJcblx0XHRcdFx0dmFyIGEgPSB2ZXJ0ZXhbaV0gKiBDIC0gdmVydGV4W2krMl0gKiBTO1xyXG5cdFx0XHRcdHZhciBiID0gdmVydGV4W2ldICogUyArIHZlcnRleFtpKzJdICogQztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2ZXJ0ZXhbaV0gPSBhO1xyXG5cdFx0XHRcdHZlcnRleFtpKzJdID0gYjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzLCA0LCA1LCA2LCA3LCA4LCA5KTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5LFxyXG5cdFx0XHRcclxuXHRcdFx0MC4wLCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsICB0eVxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwLDAsMCwwLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRhc3NlbWJsZU9iamVjdDogZnVuY3Rpb24obWFwRGF0YSwgb2JqZWN0VHlwZSwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIHJlY3QgPSBbNjQsNjQsMCwwXTsgLy8gW3gxLHkxLHgyLHkyXVxyXG5cdFx0Zm9yICh2YXIgeT0wLHlsZW49bWFwRGF0YS5sZW5ndGg7eTx5bGVuO3krKyl7XHJcblx0XHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGFbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRcdHZhciB0ID0gKG1hcERhdGFbeV1beF0udGlsZSk/IG1hcERhdGFbeV1beF0udGlsZSA6IDA7XHJcblx0XHRcdFx0aWYgKHQgIT0gMCl7XHJcblx0XHRcdFx0XHQvLyBTZWxlY3RpbmcgYm91bmRhcmllcyBvZiB0aGUgbWFwIHBhcnRcclxuXHRcdFx0XHRcdHJlY3RbMF0gPSBNYXRoLm1pbihyZWN0WzBdLCB4IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzFdID0gTWF0aC5taW4ocmVjdFsxXSwgeSAtIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFsyXSA9IE1hdGgubWF4KHJlY3RbMl0sIHggKyA2KTtcclxuXHRcdFx0XHRcdHJlY3RbM10gPSBNYXRoLm1heChyZWN0WzNdLCB5ICsgNik7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHZhciB2djtcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiRlwiKXsgdnYgPSB0aGlzLmZsb29yKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIEZsb29yXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIkNcIil7IHZ2ID0gdGhpcy5jZWlsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIENlaWxcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQlwiKXsgdnYgPSB0aGlzLmN1YmUodmVjMygxLjAsbWFwRGF0YVt5XVt4XS5oLDEuMCksIHZlYzIoMS4wLG1hcERhdGFbeV1beF0uaCksIGdsLCBmYWxzZSwgdGhpcy5nZXRDdWJlRmFjZXMobWFwRGF0YSwgeCwgeSkpOyB9ZWxzZSAvLyBCbG9ja1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJTXCIpeyB2diA9IHRoaXMuc2xvcGUodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsLCBtYXBEYXRhW3ldW3hdLmRpcik7IH0gLy8gU2xvcGVcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZlcnRleE9mZiA9IHZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnZlcnRpY2VzLmxlbmd0aDtpPGxlbjtpKz0zKXtcclxuXHRcdFx0XHRcdFx0eHggPSB2di52ZXJ0aWNlc1tpXSArIHggKyAwLjU7XHJcblx0XHRcdFx0XHRcdHl5ID0gdnYudmVydGljZXNbaSsxXSArIG1hcERhdGFbeV1beF0ueTtcclxuXHRcdFx0XHRcdFx0enogPSB2di52ZXJ0aWNlc1tpKzJdICsgeSArIDAuNTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRpY2VzLnB1c2goeHgsIHl5LCB6eik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuaW5kaWNlcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh2di5pbmRpY2VzW2ldICsgdmVydGV4T2ZmKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di50ZXhDb29yZHMubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHR0ZXhDb29yZHMucHVzaCh2di50ZXhDb29yZHNbaV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LmRhcmtWZXJ0ZXgubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHRkYXJrVmVydGV4LnB1c2godnYuZGFya1ZlcnRleFtpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IFJlY3JlYXRlIGJ1ZmZlciBkYXRhIG9uIGRlc2VyaWFsaXphdGlvblxyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGljZXMubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtWZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBidWZmZXIgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdGJ1ZmZlci5ib3VuZGFyaWVzID0gcmVjdDtcclxuXHRcdHJldHVybiBidWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRcclxuXHRnZXRDdWJlRmFjZXM6IGZ1bmN0aW9uKG1hcCwgeCwgeSl7XHJcblx0XHR2YXIgcmV0ID0gWzEsMSwxLDFdO1xyXG5cdFx0dmFyIHRpbGUgPSBtYXBbeV1beF07XHJcblx0XHRcclxuXHRcdC8vIFVwIEZhY2VcclxuXHRcdGlmICh5ID4gMCAmJiBtYXBbeS0xXVt4XSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeS0xXVt4XTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFswXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIExlZnQgZmFjZVxyXG5cdFx0aWYgKHggPCA2MyAmJiBtYXBbeV1beCsxXSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeV1beCsxXTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFsxXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIERvd24gZmFjZVxyXG5cdFx0aWYgKHkgPCA2MyAmJiBtYXBbeSsxXVt4XSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeSsxXVt4XTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFsyXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIFJpZ2h0IGZhY2VcclxuXHRcdGlmICh4ID4gMCAmJiBtYXBbeV1beC0xXSAhPSAwKXtcclxuXHRcdFx0dmFyIHQgPSBtYXBbeV1beC0xXTtcclxuXHRcdFx0aWYgKHQueSA8PSB0aWxlLnkgJiYgKHQueSArIHQuaCkgPj0gKHRpbGUueSArIHRpbGUuaCkpe1xyXG5cdFx0XHRcdHJldFszXSA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldE9iamVjdFdpdGhQcm9wZXJ0aWVzOiBmdW5jdGlvbih2ZXJ0ZXhCdWZmZXIsIGluZGV4QnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpe1xyXG5cdFx0dmFyIG9iaiA9IHtcclxuXHRcdFx0cm90YXRpb246IHZlYzMoMCwgMCwgMCksXHJcblx0XHRcdHBvc2l0aW9uOiB2ZWMzKDAsIDAsIDApLFxyXG5cdFx0XHR2ZXJ0ZXhCdWZmZXI6IHZlcnRleEJ1ZmZlciwgXHJcblx0XHRcdGluZGljZXNCdWZmZXI6IGluZGV4QnVmZmVyLCBcclxuXHRcdFx0dGV4QnVmZmVyOiB0ZXhCdWZmZXIsXHJcblx0XHRcdGRhcmtCdWZmZXI6IGRhcmtCdWZmZXJcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fSxcclxuXHRcclxuXHRjcmVhdGUzRE9iamVjdDogZnVuY3Rpb24oZ2wsIGJhc2VPYmplY3Qpe1xyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShiYXNlT2JqZWN0LnZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC52ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoYmFzZU9iamVjdC50ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LnRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShiYXNlT2JqZWN0LmluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC5pbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoYmFzZU9iamVjdC5kYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QuZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gYnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0dHJhbnNsYXRlT2JqZWN0OiBmdW5jdGlvbihvYmplY3QsIHRyYW5zbGF0aW9uKXtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49b2JqZWN0LnZlcnRpY2VzLmxlbmd0aDtpPGxlbjtpKz0zKXtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2ldICs9IHRyYW5zbGF0aW9uLmE7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpKzFdICs9IHRyYW5zbGF0aW9uLmI7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpKzJdICs9IHRyYW5zbGF0aW9uLmM7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBvYmplY3Q7XHJcblx0fSxcclxuXHRcclxuXHRmdXplT2JqZWN0czogZnVuY3Rpb24ob2JqZWN0TGlzdCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgaW5kZXhDb3VudCA9IDA7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPW9iamVjdExpc3QubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHZhciBvYmogPSBvYmplY3RMaXN0W2ldO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLnZlcnRpY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHR2ZXJ0aWNlcy5wdXNoKG9iai52ZXJ0aWNlc1tqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai50ZXhDb29yZHMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdHRleENvb3Jkcy5wdXNoKG9iai50ZXhDb29yZHNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmouaW5kaWNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0aW5kaWNlcy5wdXNoKG9iai5pbmRpY2VzW2pdICsgaW5kZXhDb3VudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai5kYXJrVmVydGV4Lmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRkYXJrVmVydGV4LnB1c2gob2JqLmRhcmtWZXJ0ZXhbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpbmRleENvdW50ICs9IG9iai52ZXJ0aWNlcy5sZW5ndGggLyAzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0aWNlcywgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0bG9hZDNETW9kZWw6IGZ1bmN0aW9uKG1vZGVsRmlsZSwgZ2wpe1xyXG5cdFx0dmFyIG1vZGVsID0ge3JlYWR5OiBmYWxzZX07XHJcblx0XHRcclxuXHRcdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdFx0aHR0cC5vcGVuKFwiR0VUXCIsIGNwICsgXCJtb2RlbHMvXCIgKyBtb2RlbEZpbGUgKyBcIi5vYmo/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdFx0aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcblx0XHRcdFx0dmFyIGxpbmVzID0gaHR0cC5yZXNwb25zZVRleHQuc3BsaXQoXCJcXG5cIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHZlcnRpY2VzID0gW10sIHRleENvb3JkcyA9IFtdLCB0cmlhbmdsZXMgPSBbXSwgdmVydGV4SW5kZXggPSBbXSwgdGV4SW5kaWNlcyA9IFtdLCBpbmRpY2VzID0gW10sIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFx0XHR2YXIgd29ya2luZztcclxuXHRcdFx0XHR2YXIgdCA9IGZhbHNlO1xyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49bGluZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHR2YXIgbCA9IGxpbmVzW2ldLnRyaW0oKTtcclxuXHRcdFx0XHRcdGlmIChsID09IFwiXCIpeyBjb250aW51ZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB2ZXJ0aWNlc1wiKXsgd29ya2luZyA9IHZlcnRpY2VzOyB0ID0gZmFsc2U7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdGV4Q29vcmRzXCIpeyB3b3JraW5nID0gdGV4Q29vcmRzOyB0ID0gdHJ1ZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB0cmlhbmdsZXNcIil7IHdvcmtpbmcgPSB0cmlhbmdsZXM7IHQgPSBmYWxzZTsgfVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0dmFyIHBhcmFtcyA9IGwuc3BsaXQoXCIgXCIpO1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBqPTAsamxlbj1wYXJhbXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdFx0XHRcdGlmICghaXNOYU4ocGFyYW1zW2pdKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbXNbal0gPSBwYXJzZUZsb2F0KHBhcmFtc1tqXSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdGlmICghdCkgd29ya2luZy5wdXNoKHBhcmFtc1tqXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKHQpIHdvcmtpbmcucHVzaChwYXJhbXMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdXNlZFZlciA9IFtdO1xyXG5cdFx0XHRcdHZhciB1c2VkSW5kID0gW107XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj10cmlhbmdsZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHRpZiAodXNlZFZlci5pbmRleE9mKHRyaWFuZ2xlc1tpXSkgIT0gLTEpe1xyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godXNlZEluZFt1c2VkVmVyLmluZGV4T2YodHJpYW5nbGVzW2ldKV0pO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHVzZWRWZXIucHVzaCh0cmlhbmdsZXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR2YXIgdCA9IHRyaWFuZ2xlc1tpXS5zcGxpdChcIi9cIik7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dFswXSA9IHBhcnNlSW50KHRbMF0pIC0gMTtcclxuXHRcdFx0XHRcdFx0dFsxXSA9IHBhcnNlSW50KHRbMV0pIC0gMTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh2ZXJ0ZXhJbmRleC5sZW5ndGggLyAzKTtcclxuXHRcdFx0XHRcdFx0dXNlZEluZC5wdXNoKHZlcnRleEluZGV4Lmxlbmd0aCAvIDMpO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGV4SW5kZXgucHVzaCh2ZXJ0aWNlc1t0WzBdICogM10sIHZlcnRpY2VzW3RbMF0gKiAzICsgMV0sIHZlcnRpY2VzW3RbMF0gKiAzICsgMl0pO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGV4SW5kaWNlcy5wdXNoKHRleENvb3Jkc1t0WzFdXVswXSwgdGV4Q29vcmRzW3RbMV1dWzFdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj10ZXhJbmRpY2VzLmxlbmd0aC8yO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBiYXNlID0ge3ZlcnRpY2VzOiB2ZXJ0ZXhJbmRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhJbmRpY2VzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHRcdFx0XHR2YXIgbW9kZWwzRCA9IHRoaXMuY3JlYXRlM0RPYmplY3QoZ2wsIGJhc2UpO1xyXG5cclxuXHRcdFx0XHRtb2RlbC5yb3RhdGlvbiA9IG1vZGVsM0Qucm90YXRpb247XHJcblx0XHRcdFx0bW9kZWwucG9zaXRpb24gPSBtb2RlbDNELnBvc2l0aW9uO1xyXG5cdFx0XHRcdG1vZGVsLnZlcnRleEJ1ZmZlciA9IG1vZGVsM0QudmVydGV4QnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLmluZGljZXNCdWZmZXIgPSBtb2RlbDNELmluZGljZXNCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwudGV4QnVmZmVyID0gbW9kZWwzRC50ZXhCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwuZGFya0J1ZmZlciA9IG1vZGVsM0QuZGFya0J1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5yZWFkeSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRodHRwLnNlbmQoKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG1vZGVsO1xyXG5cdH1cclxufTtcclxuIiwidmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxudmFyIGNoZWF0RW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHBvc2l0aW9uLCBkaXJlY3Rpb24sIG1hcE1hbmFnZXIpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignUGxheWVyJyk7IFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnUGxheWVyJywgUGxheWVyKTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBkaXJlY3Rpb24sIG1hcE1hbmFnZXIpe1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5yb3RhdGlvblNwZCA9IHZlYzIoTWF0aC5kZWdUb1JhZCgxKSwgTWF0aC5kZWdUb1JhZCg0KSk7XHJcblx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjU7XHJcblx0dGhpcy5tYXhWZXJ0Um90YXRpb24gPSBNYXRoLmRlZ1RvUmFkKDQ1KTtcclxuXHRcclxuXHR0aGlzLnRhcmdldFkgPSBwb3NpdGlvbi5iO1xyXG5cdHRoaXMueVNwZWVkID0gMC4wO1xyXG5cdHRoaXMueUdyYXZpdHkgPSAwLjA7XHJcblx0XHJcblx0dGhpcy5qb2cgPSB2ZWM0KDAuMCwgMSwgMC4wLCAxKTtcclxuXHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblxyXG5cdHRoaXMuaHVydCA9IDAuMDtcdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDA7XHJcblx0XHJcblx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID0gMDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLnBsYXllcjtcclxuXHRwbGF5ZXIuaHAgLT0gZG1nO1xyXG5cdGlmIChwbGF5ZXIuaHAgPD0gMCl7XHJcblx0XHRwbGF5ZXIuaHAgPSAwO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3UgZGllZCFcIik7XHJcblx0XHRnYW1lLnNhdmVNYW5hZ2VyLmRlbGV0ZUdhbWUoKTtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNhc3RNaXNzaWxlID0gZnVuY3Rpb24od2VhcG9uKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdHZhciBwcyA9IGdhbWUucGxheWVyO1xyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRtaXNzaWxlLmluaXQodGhpcy5wb3NpdGlvbi5jbG9uZSgpLCB0aGlzLnJvdGF0aW9uLmNsb25lKCksIHdlYXBvbi5jb2RlLCAnZW5lbXknLCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0bWlzc2lsZS5taXNzZWQgPSAocHJvYiA+IHBzLnN0YXRzLmRleCk7XHJcblx0aWYgKHdlYXBvbikgXHJcblx0XHR3ZWFwb24uc3RhdHVzICo9ICgxLjAgLSB3ZWFwb24ud2Vhcik7IC8vIFRPRE86IEVuaGFuY2Ugd2VhcG9uIGRlZ3JhZGF0aW9uXHJcblx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBzaG9vdCBhIFwiICsgd2VhcG9uLnN1Ykl0ZW1OYW1lKTtcclxuXHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMzA7XHJcblx0dGhpcy5tb3ZlZCA9IHRydWU7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1lbGVlQXR0YWNrID0gZnVuY3Rpb24od2VhcG9uKXtcclxuXHR2YXIgZW5lbWllcyA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZXNOZWFyZXN0KHRoaXMucG9zaXRpb24sIDEuMCwgJ2VuZW15Jyk7XHJcblx0XHRcclxuXHR2YXIgeHggPSB0aGlzLnBvc2l0aW9uLmE7XHJcblx0dmFyIHp6ID0gdGhpcy5wb3NpdGlvbi5jO1xyXG5cdHZhciBkeCA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiAwLjE7XHJcblx0dmFyIGR6ID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiAwLjE7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MTA7aSsrKXtcclxuXHRcdHh4ICs9IGR4O1xyXG5cdFx0enogKz0gZHo7XHJcblx0XHR2YXIgb2JqZWN0O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBqPTAsamxlbj1lbmVtaWVzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0dmFyIGlucyA9IGVuZW1pZXNbal07XHJcblx0XHRcdHZhciB4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB4eCk7XHJcblx0XHRcdHZhciB6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSB6eik7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoeCA8IDAuMyAmJiB6IDwgMC4zKXtcclxuXHRcdFx0XHRvYmplY3QgPSBpbnM7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKG9iamVjdCAmJiBvYmplY3QuZW5lbXkpe1xyXG5cdFx0XHR0aGlzLmNhc3RBdHRhY2sob2JqZWN0LCB3ZWFwb24pO1xyXG5cdFx0XHR0aGlzLmF0dGFja1dhaXQgPSAyMDtcclxuXHRcdFx0dGhpcy5tb3ZlZCA9IHRydWU7XHJcblx0XHRcdGkgPSAxMTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNhc3RBdHRhY2sgPSBmdW5jdGlvbih0YXJnZXQsIHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgcHJvYiA9IE1hdGgucmFuZG9tKCk7XHJcblx0aWYgKHByb2IgPiBwcy5zdGF0cy5kZXgpe1xyXG5cdFx0Z2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHRcdC8vdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJNaXNzZWQhXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMuc3RyKTtcclxuXHQvL3ZhciBkZnMgPSBVdGlscy5yb2xsRGljZSh0YXJnZXQuZW5lbXkuc3RhdHMuZGZzKTtcclxuXHR2YXIgZGZzID0gMDtcclxuXHRcclxuXHRpZiAod2VhcG9uKSBzdHIgKz0gVXRpbHMucm9sbERpY2Uod2VhcG9uLnN0cikgKiB3ZWFwb24uc3RhdHVzO1xyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heChzdHIgLSBkZnMsIDApIDw8IDA7XHJcblx0XHJcblx0Ly90aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkF0dGFja2luZyBcIiArIHRhcmdldC5lbmVteS5uYW1lKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh0YXJnZXQuZW5lbXkubmFtZSArIFwiIGRhbWFnZWQgeFwiK2RtZyk7IC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBkYW1hZ2UgcG9wdXAgb24gdGhlIGVuZW15XHJcblx0XHR0YXJnZXQucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0Ly8gdGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnYmxvY2snKTtcclxuXHR9XHJcblx0XHJcblx0aWYgKHdlYXBvbikgXHJcblx0XHR3ZWFwb24uc3RhdHVzICo9ICgxLjAgLSB3ZWFwb24ud2Vhcik7IC8vIFRPRE86IEVuaGFuY2Ugd2VhcG9uIGRlZ3JhZGF0aW9uXHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmpvZ01vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5vbldhdGVyKXtcclxuXHRcdHRoaXMuam9nLmEgKz0gMC4wMDUgKiB0aGlzLmpvZy5iO1xyXG5cdFx0aWYgKHRoaXMuam9nLmEgPj0gMC4wMyAmJiB0aGlzLmpvZy5iID09IDEpIHRoaXMuam9nLmIgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmEgPD0gLTAuMDMgJiYgdGhpcy5qb2cuYiA9PSAtMSkgdGhpcy5qb2cuYiA9IDE7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA4ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24oeFRvLCB6VG8pe1xyXG5cdHZhciBtb3ZlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHZhciBzd2ltID0gKHRoaXMub25MYXZhIHx8IHRoaXMub25XYXRlcik7XHJcblx0aWYgKHN3aW0pe1xyXG5cdFx0eFRvICo9IDAuNzU7IFxyXG5cdFx0elRvICo9IDAuNzU7XHJcblx0fVxyXG5cdHZhciBtb3ZlbWVudCA9IHZlYzIoeFRvLCB6VG8pO1xyXG5cdHZhciBzcGQgPSB2ZWMyKHhUbyAqIDEuNSwgMCk7XHJcblx0dmFyIGZha2VQb3MgPSB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcclxuXHRmb3IgKHZhciBpPTA7aTwyO2krKyl7XHJcblx0XHR2YXIgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldFdhbGxOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCwgc3dpbSk7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0KTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRcclxuXHRcdHNwZCA9IHZlYzIoMCwgelRvICogMS41KTtcclxuXHR9XHJcblx0XHJcblx0aWYgKG1vdmVtZW50LmEgIT0gMCB8fCBtb3ZlbWVudC5iICE9IDApe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5hICs9IG1vdmVtZW50LmE7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmMgKz0gbW92ZW1lbnQuYjtcclxuXHRcdHRoaXMuZG9WZXJ0aWNhbENoZWNrcygpO1xyXG5cdFx0dGhpcy5qb2dNb3ZlbWVudCgpO1xyXG5cdFx0bW92ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLm1vdmVkID0gbW92ZWQ7XHJcblx0cmV0dXJuIG1vdmVkO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3VzZUxvb2sgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBtTW92ZW1lbnQgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5nZXRNb3VzZU1vdmVtZW50KCk7XHJcblx0XHJcblx0aWYgKG1Nb3ZlbWVudC54ICE9IC0xMDAwMCl7IHRoaXMucm90YXRpb24uYiAtPSBNYXRoLmRlZ1RvUmFkKG1Nb3ZlbWVudC54KTsgfVxyXG5cdGlmIChtTW92ZW1lbnQueSAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmEgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueSk7IH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0dGhpcy5tb3VzZUxvb2soKTtcclxuXHJcblx0Ly8gUm90YXRpb24gd2l0aCBrZXlib2FyZFxyXG5cdGlmIChnYW1lLmtleXNbODFdID09IDEgfHwgZ2FtZS5rZXlzWzM3XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiArPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OV0gPT0gMSB8fCBnYW1lLmtleXNbMzldID09IDEpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5iIC09IHRoaXMucm90YXRpb25TcGQuYjtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzM4XSA9PSAxKXsgLy8gVXAgYXJyb3dcclxuXHRcdHRoaXMucm90YXRpb24uYSArPSB0aGlzLnJvdGF0aW9uU3BkLmE7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s0MF0gPT0gMSl7IC8vIERvd24gYXJyb3dcclxuXHRcdHRoaXMucm90YXRpb24uYSAtPSB0aGlzLnJvdGF0aW9uU3BkLmE7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdHZhciBBID0gMC4wLCBCID0gMC4wO1xyXG5cdGlmIChnYW1lLmtleXNbODddID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzgzXSA9PSAxKXtcclxuXHRcdEEgPSAtTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQgKiAwLjM7XHJcblx0XHRCID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQgKiAwLjM7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChnYW1lLmtleXNbNjVdID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYiArIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzY4XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChBICE9IDAuMCB8fCBCICE9IDAuMCl7IHRoaXMubW92ZVRvKEEsIEIpOyB9ZWxzZXsgdGhpcy5qb2cuYSA9IDAuMDsgfVxyXG5cdGlmICh0aGlzLnJvdGF0aW9uLmEgPiB0aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gdGhpcy5tYXhWZXJ0Um90YXRpb247XHJcblx0ZWxzZSBpZiAodGhpcy5yb3RhdGlvbi5hIDwgLXRoaXMubWF4VmVydFJvdGF0aW9uKSB0aGlzLnJvdGF0aW9uLmEgPSAtdGhpcy5tYXhWZXJ0Um90YXRpb247XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrQWN0aW9uID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmIChnYW1lLmdldEtleVByZXNzZWQoMzIpKXsgLy8gU3BhY2VcclxuXHRcdHZhciB4eCA9ICh0aGlzLnBvc2l0aW9uLmEgKyBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0dmFyIHp6ID0gKHRoaXMucG9zaXRpb24uYyAtIE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiAwLjYpIDw8IDA7XHJcblx0XHRcclxuXHRcdHZhciBvYmplY3QgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VBdEdyaWQodmVjMyh4eCwgdGhpcy5wb3NpdGlvbi5iLCB6eikpO1xyXG5cdFx0aWYgKCFvYmplY3QpIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHRoaXMucG9zaXRpb24uYSA8PCAwLCB0aGlzLnBvc2l0aW9uLmIsIHRoaXMucG9zaXRpb24uYyA8PCAwKSk7XHJcblx0XHRcclxuXHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmFjdGl2YXRlKVxyXG5cdFx0XHRvYmplY3QuYWN0aXZhdGUoKTtcclxuXHRcdFx0XHJcblx0XHRpZiAoY2hlYXRFbmFibGVkKXtcclxuXHRcdFx0aWYgKGdhbWUuZmxvb3JEZXB0aCA8IDgpXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcChmYWxzZSwgZ2FtZS5mbG9vckRlcHRoICsgMSk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKCdjb2RleFJvb20nKTtcclxuXHRcdH1cclxuXHR9ZWxzZSBpZiAoKGdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkgfHwgZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSkgJiYgdGhpcy5hdHRhY2tXYWl0ID09IDApe1x0Ly8gTWVsZWUgYXR0YWNrLCBFbnRlclxyXG5cdFx0dmFyIHdlYXBvbiA9IGdhbWUuaW52ZW50b3J5LmdldFdlYXBvbigpO1xyXG5cdFx0XHJcblx0XHRpZiAoIXdlYXBvbiB8fCAhd2VhcG9uLnJhbmdlZCl7XHJcblx0XHRcdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9IDU7XHJcblx0XHR9ZWxzZSBpZiAod2VhcG9uICYmIHdlYXBvbi5yYW5nZWQpe1xyXG5cdFx0XHR0aGlzLmNhc3RNaXNzaWxlKHdlYXBvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh3ZWFwb24gJiYgd2VhcG9uLnN0YXR1cyA8IDAuMDUpe1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5pbnZlbnRvcnkuZGVzdHJveUl0ZW0od2VhcG9uKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2Uod2VhcG9uLm5hbWUgKyBcIiBkYW1hZ2VkIVwiKTtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCg3OSkpeyAvLyBPLCBUT0RPOiBjaGFuZ2UgdG8gQ3RybCtTXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIlNhdmluZyBnYW1lLlwiKTtcclxuXHRcdGdhbWUuc2F2ZU1hbmFnZXIuc2F2ZUdhbWUoKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiR2FtZSBTYXZlZC5cIik7XHJcblx0fVxyXG5cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuZG9WZXJ0aWNhbENoZWNrcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBvaW50WSA9IHRoaXMubWFwTWFuYWdlci5nZXRZRmxvb3IodGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdHZhciB3eSA9ICh0aGlzLm9uV2F0ZXIgfHwgdGhpcy5vbkxhdmEpPyAwLjMgOiAwO1xyXG5cdHZhciBweSA9IE1hdGguZmxvb3IoKHBvaW50WSAtICh0aGlzLnBvc2l0aW9uLmIgKyB3eSkpICogMTAwKSAvIDEwMDtcclxuXHRpZiAocHkgPD0gMC4zKSB0aGlzLnRhcmdldFkgPSBwb2ludFk7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5pc0xhdmFQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0dGhpcy5vbldhdGVyID0gZmFsc2U7XHJcblx0XHRpZiAoIXRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdH1cclxuXHRcdHRoaXMub25MYXZhID0gdHJ1ZTtcclxuXHRcdFxyXG5cdH0gZWxzZSBpZiAodGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA9PSB0aGlzLnRhcmdldFkpXHJcblx0XHRcdHRoaXMubW92ZW1lbnRTcGQgPSAwLjAyNTtcclxuXHRcdHRoaXMub25XYXRlciA9IHRydWU7XHJcblx0XHR0aGlzLm9uTGF2YSA9IGZhbHNlO1xyXG5cdH1lbHNlIHtcclxuXHRcdHRoaXMubW92ZW1lbnRTcGQgPSAwLjA1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gZmFsc2U7XHJcblx0XHR0aGlzLm9uTGF2YSA9IGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNSArIHRoaXMuam9nLmEgKyB0aGlzLmpvZy5jO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb0Zsb2F0ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5vbldhdGVyICYmIHRoaXMuam9nLmEgPT0gMC4wKXtcclxuXHRcdHRoaXMuam9nLmMgKz0gMC4wMDUgKiB0aGlzLmpvZy5kO1xyXG5cdFx0aWYgKHRoaXMuam9nLmMgPj0gMC4wMyAmJiB0aGlzLmpvZy5kID09IDEpIHRoaXMuam9nLmQgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmMgPD0gLTAuMDMgJiYgdGhpcy5qb2cuZCA9PSAtMSkgdGhpcy5qb2cuZCA9IDE7XHJcblx0XHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNSArIHRoaXMuam9nLmEgKyB0aGlzLmpvZy5jO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYyA9IDAuMDtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwLjApIHJldHVybjtcclxuXHRcclxuXHR0aGlzLmRvRmxvYXQoKTtcclxuXHR0aGlzLm1vdmVtZW50KCk7XHJcblx0dGhpcy5jaGVja0FjdGlvbigpO1xyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iIDw9IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1lbHNlIGlmICh0aGlzLnRhcmdldFkgPiB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iICs9IDAuMDg7XHJcblx0XHR0aGlzLmpvZy5hID0gMC4wO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA+PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9XHJcblx0XHJcblx0Ly90aGlzLnRhcmdldFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wYXVzZWQpIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpe1xyXG5cdFx0aWYgKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSl7XHJcblx0XHRcdHRoaXMuZG9GbG9hdCgpO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuY2FtZXJhSGVpZ2h0ID4gMC4yKXsgXHJcblx0XHRcdHRoaXMuY2FtZXJhSGVpZ2h0IC09IDAuMDE7IFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRpZiAodGhpcy5vbkxhdmEpe1xyXG5cdFx0aWYgKHRoaXMubGF2YUNvdW50ZXIgPiAzMCl7XHJcblx0XHRcdHRoaXMucmVjZWl2ZURhbWFnZSg4MCk7XHJcblx0XHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlcisrO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHR9XHJcblx0aWYgKHRoaXMuYXR0YWNrV2FpdCA+IDApIHRoaXMuYXR0YWNrV2FpdCAtPSAxO1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwKSB0aGlzLmh1cnQgLT0gMTtcclxuXHRpZiAodGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID4gMCl7XHJcblx0XHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXItLTtcclxuXHRcdGlmICh0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPT0gMCl7XHJcblx0XHRcdHZhciB3ZWFwb24gPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0XHRcdGlmICghd2VhcG9uIHx8ICF3ZWFwb24ucmFuZ2VkKVxyXG5cdFx0XHRcdHRoaXMubWVsZWVBdHRhY2sod2VhcG9uKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblx0dGhpcy5zdGVwKCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFBsYXllclN0YXRzKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdQbGF5ZXJTdGF0cycpO1xyXG5cdHRoaXMuaHAgPSAwO1xyXG5cdHRoaXMubUhQID0gMDtcclxuXHR0aGlzLm1hbmEgPSAwO1xyXG5cdHRoaXMubU1hbmEgPSAwO1xyXG5cdFxyXG5cdHRoaXMucmVnZW5Db3VudCA9IDA7XHJcblx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5zdGF0cyA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKCksXHJcblx0XHRzdHI6ICcwRDAnLCBcclxuXHRcdGRmczogJzBEMCcsXHJcblx0XHRkZXg6IDAsXHJcblx0XHRtYWdpY1Bvd2VyOiAnMEQwJ1xyXG5cdH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyU3RhdHM7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1BsYXllclN0YXRzJywgUGxheWVyU3RhdHMpO1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKSxcclxuXHRcdHN0cjogJzBEMCcsXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmFkZEV4cGVyaWVuY2UgPSBmdW5jdGlvbihhbW91bnQsIGNvbnNvbGUpe1xyXG5cdHRoaXMuZXhwICs9IGFtb3VudDtcclxuXHRcclxuXHQvL2NvbnNvbGUuYWRkU0ZNZXNzYWdlKGFtb3VudCArIFwiIFhQIGdhaW5lZFwiKTtcclxuXHR2YXIgbmV4dEV4cCA9IChNYXRoLnBvdyh0aGlzLmx2bCwgMS41KSAqIDUwMCkgPDwgMDtcclxuXHRpZiAodGhpcy5leHAgPj0gbmV4dEV4cCl7IHRoaXMubGV2ZWxVcChjb25zb2xlKTsgfVxyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmxldmVsVXAgPSBmdW5jdGlvbihjb25zb2xlKXtcclxuXHR0aGlzLmx2bCArPSAxO1xyXG5cdFxyXG5cdC8vIFVwZ3JhZGUgSFAgYW5kIE1hbmFcclxuXHR2YXIgaHBOZXcgPSBNYXRoLmlSYW5kb20oMTAsIDI1KTtcclxuXHR2YXIgbWFuYU5ldyA9IE1hdGguaVJhbmRvbSg1LCAxNSk7XHJcblx0XHJcblx0dmFyIGhwT2xkID0gdGhpcy5tSFA7XHJcblx0dmFyIG1hbmFPbGQgPSB0aGlzLm1NYW5hO1xyXG5cdFxyXG5cdHRoaXMuaHAgICs9IGhwTmV3O1xyXG5cdHRoaXMubWFuYSArPSBtYW5hTmV3O1xyXG5cdHRoaXMubUhQICs9IGhwTmV3O1xyXG5cdHRoaXMubU1hbmEgKz0gbWFuYU5ldztcclxuXHRcclxuXHQvLyBVcGdyYWRlIGEgcmFuZG9tIHN0YXQgYnkgMS0zIHBvaW50c1xyXG5cdC8qXHJcblx0dmFyIHN0YXRzID0gWydzdHInLCAnZGZzJ107XHJcblx0dmFyIG5hbWVzID0gWydTdHJlbmd0aCcsICdEZWZlbnNlJ107XHJcblx0dmFyIHN0LCBubTtcclxuXHR3aGlsZSAoIXN0KXtcclxuXHRcdHZhciBpbmQgPSBNYXRoLmlSYW5kb20oc3RhdHMubGVuZ3RoKTtcclxuXHRcdHN0ID0gc3RhdHNbaW5kXTtcclxuXHRcdG5tID0gbmFtZXNbaW5kXTtcclxuXHR9XHJcblx0XHJcblx0dmFyIHBhcnQxID0gcGFyc2VJbnQodGhpcy5zdGF0c1tzdF0uc3Vic3RyaW5nKDAsIHRoaXMuc3RhdHNbc3RdLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRwYXJ0MSArPSBNYXRoLmlSYW5kb20oMSwgMyk7XHJcblx0XHJcblx0dmFyIG9sZCA9IHRoaXMuc3RhdHNbc3RdO1xyXG5cdHRoaXMuc3RhdHNbc3RdID0gcGFydDEgKyAnRDMnOyovXHJcblx0XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJMZXZlbCB1cDogXCIgKyB0aGlzLmx2bCArIFwiIVwiKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIkhQIGluY3JlYXNlZCBmcm9tIFwiICsgaHBPbGQgKyBcIiB0byBcIiArIHRoaXMubUhQKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIk1hbmEgaW5jcmVhc2VkIGZyb20gXCIgKyBtYW5hT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1NYW5hKTtcclxuXHQvL2NvbnNvbGUuYWRkU0ZNZXNzYWdlKG5tICsgXCIgaW5jcmVhc2VkIGZyb20gXCIgKyBvbGQgKyBcIiB0byBcIiArIHRoaXMuc3RhdHNbc3RdKTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5zZXRWaXJ0dWUgPSBmdW5jdGlvbih2aXJ0dWVOYW1lKXtcclxuXHR0aGlzLnZpcnR1ZSA9IHZpcnR1ZU5hbWU7XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHRzd2l0Y2ggKHZpcnR1ZU5hbWUpe1xyXG5cdFx0Y2FzZSBcIkhvbmVzdHlcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDYwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMjAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA2O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdNYWdlJztcclxuXHRcdFx0dGhpcy5tYW5hUmVnZW5GcmVxID0gMzAgKiA1O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJDb21wYXNzaW9uXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnQmFyZCc7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogNztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiVmFsb3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDgwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRmlnaHRlcic7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogMTA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkhvbm9yXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnUGFsYWRpbic7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogODtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU3Bpcml0dWFsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Jhbmdlcic7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogOTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSHVtaWxpdHlcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDYwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuODtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnU2hlcGhlcmQnO1xyXG5cdFx0XHR0aGlzLm1hbmFSZWdlbkZyZXEgPSAzMCAqIDc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNhY3JpZmljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSA1MDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Rpbmtlcic7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogNztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSnVzdGljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxNTA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdEcnVpZCc7XHJcblx0XHRcdHRoaXMubWFuYVJlZ2VuRnJlcSA9IDMwICogNjtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLm1IUCA9IHRoaXMuaHA7XHJcblx0dGhpcy5zdGF0cy5zdHIgKz0gJ0QzJztcclxuXHR0aGlzLnN0YXRzLmRmcyArPSAnRDMnO1xyXG5cdHRoaXMuc3RhdHMubWFnaWNQb3dlciArPSAnRDMnO1xyXG5cdHRoaXMubU1hbmEgPSB0aGlzLm1hbmE7XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUucmVnZW5NYW5hID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoKyt0aGlzLnJlZ2VuQ291bnQgPj0gdGhpcy5tYW5hUmVnZW5GcmVxKXtcclxuXHRcdHRoaXMubWFuYSA9IE1hdGgubWluKHRoaXMubWFuYSArIDEsIHRoaXMubU1hbmEpO1xyXG5cdFx0dGhpcy5yZWdlbkNvdW50ID0gMDtcclxuXHR9XHJcbn07XHJcbiIsImZ1bmN0aW9uIFNhdmVNYW5hZ2VyKGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5zdG9yYWdlID0gbmV3IFN0b3JhZ2UoKTtcclxufVxyXG5cclxudmFyIFN0b3JhZ2UgPSByZXF1aXJlKCcuL1N0b3JhZ2UnKTtcclxuXHJcblNhdmVNYW5hZ2VyLnByb3RvdHlwZSA9IHtcclxuXHRzYXZlR2FtZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBzYXZlT2JqZWN0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ1N0eWdpYW5HYW1lJyksXHJcblx0XHRcdHZlcnNpb246IHZlcnNpb24sIFxyXG5cdFx0XHRwbGF5ZXI6IHRoaXMuZ2FtZS5wbGF5ZXIsXHJcblx0XHRcdGludmVudG9yeTogdGhpcy5nYW1lLmludmVudG9yeSxcclxuXHRcdFx0bWFwczogdGhpcy5nYW1lLm1hcHMsXHJcblx0XHRcdGZsb29yRGVwdGg6IHRoaXMuZ2FtZS5mbG9vckRlcHRoLFxyXG5cdFx0XHR1bmlxdWVSZWdpc3RyeTogdGhpcy5nYW1lLnVuaXF1ZVJlZ2lzdHJ5XHJcblx0XHR9O1xyXG5cdFx0dmFyIHNlcmlhbGl6ZWQgPSBjaXJjdWxhci5zZXJpYWxpemUoc2F2ZU9iamVjdCk7XHJcblx0XHRcclxuXHRcdC8qdmFyIHNlcmlhbGl6ZWRPYmplY3QgPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWQpO1xyXG5cdFx0Y29uc29sZS5sb2coc2VyaWFsaXplZE9iamVjdCk7XHJcblx0XHRjb25zb2xlLmxvZyhcIlNpemU6IFwiK3NlcmlhbGl6ZWQubGVuZ3RoKTsqL1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0b3JhZ2Uuc2V0SXRlbSgnc3R5Z2lhbkdhbWUnLCBzZXJpYWxpemVkKTtcclxuXHR9LFxyXG5cdHJlc3RvcmVHYW1lOiBmdW5jdGlvbihnYW1lKXtcclxuXHRcdHZhciBnYW1lRGF0YSA9IHRoaXMuc3RvcmFnZS5nZXRJdGVtKCdzdHlnaWFuR2FtZScpO1xyXG5cdFx0aWYgKCFnYW1lRGF0YSl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHZhciBkZXNlcmlhbGl6ZWQgPSBjaXJjdWxhci5wYXJzZShnYW1lRGF0YSwgZ2FtZSk7XHJcblx0XHRpZiAoZGVzZXJpYWxpemVkLnZlcnNpb24gIT0gdmVyc2lvbil7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGdhbWUucGxheWVyID0gZGVzZXJpYWxpemVkLnBsYXllcjtcclxuXHRcdGdhbWUuaW52ZW50b3J5ID0gZGVzZXJpYWxpemVkLmludmVudG9yeTtcclxuXHRcdGdhbWUubWFwcyA9IGRlc2VyaWFsaXplZC5tYXBzO1xyXG5cdFx0Z2FtZS5mbG9vckRlcHRoID0gZGVzZXJpYWxpemVkLmZsb29yRGVwdGg7XHJcblx0XHRnYW1lLnVuaXF1ZVJlZ2lzdHJ5ID0gZGVzZXJpYWxpemVkLnVuaXF1ZVJlZ2lzdHJ5O1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHRkZWxldGVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ3N0eWdpYW5HYW1lJyk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVNYW5hZ2VyOyIsImZ1bmN0aW9uIFNlbGVjdENsYXNzKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0Q2xhc3M7XHJcblxyXG5TZWxlY3RDbGFzcy5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLmdhbWU7XHJcblx0dmFyIHBsYXllclMgPSBnYW1lLnBsYXllcjtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSB8fCBnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdHZhciBtb3VzZSA9IGdhbWUubW91c2U7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1vdXNlLmIgPj0gMjggJiYgZ2FtZS5tb3VzZS5iIDwgMTAwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbmVzdHlcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAxNzgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJDb21wYXNzaW9uXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiVmFsb3JcIik7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkp1c3RpY2VcIik7XHJcblx0XHR9ZWxzZSBpZiAoZ2FtZS5tb3VzZS5iID49IDEwMCAmJiBnYW1lLm1vdXNlLmIgPCAxNzApe1xyXG5cdFx0XHRpZiAoZ2FtZS5tb3VzZS5hIDw9IDg4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU2FjcmlmaWNlXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSG9ub3JcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAyNjgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJTcGlyaXR1YWxpdHlcIik7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkh1bWlsaXR5XCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAocGxheWVyUy52aXJ0dWUgIT0gbnVsbCl7XHJcblx0XHRcdGdhbWUuY3JlYXRlSW5pdGlhbEludmVudG9yeShwbGF5ZXJTLmNsYXNzTmFtZSk7XHJcblx0XHRcdGdhbWUucHJpbnRHcmVldCgpO1xyXG5cdFx0XHRnYW1lLmxvYWRNYXAoZmFsc2UsIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5zZWxlY3RDbGFzcywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1N0YWlycycsICdiaWxsYm9hcmQnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ1N0YWlycycsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSl7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1tvYmplY3QuaW1nSW5kXTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBTdGFpcnMoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoXCJTdGFpcnNcIik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhaXJzO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdTdGFpcnMnLCBTdGFpcnMpO1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBtYXBNYW5hZ2VyLCBkaXJlY3Rpb24pe1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMuc3RhaXJzID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHJcblx0dGhpcy50YXJnZXRJZCA9IHRoaXMubWFwTWFuYWdlci5kZXB0aDtcclxuXHRpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ3VwJyl7XHJcblx0XHR0aGlzLnRhcmdldElkIC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZGlyZWN0aW9uID09ICdkb3duJyl7XHJcblx0XHR0aGlzLnRhcmdldElkICs9IDE7XHJcblx0XHR0aGlzLmltZ0luZCA9IDE7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzW3RoaXMuaW1nSW5kXTtcclxuXHR0aGlzLmJpbGxib2FyZC5ub1JvdGF0ZSA9IHRydWU7XHJcblx0XHJcblx0dGhpcy50aWxlID0gbnVsbDtcclxufVxyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMudGFyZ2V0SWQgPCA5KVxyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcChmYWxzZSwgdGhpcy50YXJnZXRJZCk7XHJcblx0ZWxzZSB7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKCdjb2RleFJvb20nKTtcclxuXHR9XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmdldFRpbGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRpbGUgIT0gbnVsbCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMudGlsZSA9IHRoaXMubWFwTWFuYWdlci5tYXBbdGhpcy5wb3NpdGlvbi5jIDw8IDBdW3RoaXMucG9zaXRpb24uYSA8PCAwXTtcclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ3VwJyAmJiB0aGlzLnRpbGUuY2ggPiAxKXtcclxuXHRcdHZhciB5ID0gdGhpcy5wb3NpdGlvbi5iIDw8IDA7XHJcblx0XHRmb3IgKHZhciBpPXkrMTtpPHRoaXMudGlsZS5jaDtpKyspe1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHRwb3MuYiA9IGk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbMl07XHJcblx0XHRcdGdhbWUuZHJhd0JpbGxib2FyZChwb3MsJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbM107XHJcblx0XHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbiwnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0fWVsc2V7XHJcblx0XHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbiwnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmdldFRpbGUoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gU3RvcmFnZSgpe1xyXG5cdCB0cnkge1xyXG5cdFx0IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdfX3Rlc3QnLCAndGVzdCcpO1xyXG5cdFx0IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfX3Rlc3QnKTtcclxuXHRcdCB0aGlzLmVuYWJsZWQgPSB0cnVlO1xyXG5cdCB9IGNhdGNoKGUpIHtcclxuXHRcdCB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuXHQgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG5cclxuU3RvcmFnZS5wcm90b3R5cGUgPSB7XHJcblx0c2V0SXRlbTogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG5cdH0sXHJcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24oa2V5KXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuXHR9LFxyXG5cdGdldEl0ZW06IGZ1bmN0aW9uKGtleSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblx0fVxyXG59XHJcbiBcclxuIiwidmFyIFNlbGVjdENsYXNzID0gcmVxdWlyZSgnLi9TZWxlY3RDbGFzcycpO1xyXG5cclxuZnVuY3Rpb24gVGl0bGVTY3JlZW4oLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLmJsaW5rID0gMzA7XHJcblx0dGhpcy5jdXJyZW50U2NyZWVuID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZVNjcmVlbjtcclxuXHJcblRpdGxlU2NyZWVuLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLmdldEtleVByZXNzZWQoMTMpIHx8IHRoaXMuZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHRpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDApe1xyXG5cdFx0XHRpZiAodGhpcy5nYW1lLnNhdmVNYW5hZ2VyLnJlc3RvcmVHYW1lKHRoaXMuZ2FtZSkpe1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5wcmludFdlbGNvbWVCYWNrKCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmxvYWRNYXAodGhpcy5nYW1lLnBsYXllci5jdXJyZW50TWFwLCB0aGlzLmdhbWUucGxheWVyLmN1cnJlbnREZXB0aCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5jdXJyZW50U2NyZWVuKys7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAodGhpcy5jdXJyZW50U2NyZWVuID09IDQpe1xyXG5cdFx0XHR0aGlzLmdhbWUuc2NlbmUgPSBuZXcgU2VsZWN0Q2xhc3ModGhpcy5nYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuY3VycmVudFNjcmVlbisrO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblRpdGxlU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHRzd2l0Y2ggKHRoaXMuY3VycmVudFNjcmVlbil7XHJcblx0Y2FzZSAwOlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMudGl0bGVTY3JlZW4sIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAxOlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuaW50cm8xLCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgMjpcclxuXHRcdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLmludHJvMiwgMCwgMCk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlIDM6XHJcblx0XHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5pbnRybzMsIDAsIDApO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSA0OlxyXG5cdFx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuaW50cm80LCAwLCAwKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRcclxufTtcclxuIiwiZnVuY3Rpb24gVUkoc2l6ZSwgY29udGFpbmVyKXtcclxuXHR0aGlzLmluaXRDYW52YXMoc2l6ZSwgY29udGFpbmVyKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTtcclxuXHJcblVJLnByb3RvdHlwZS5pbml0Q2FudmFzID0gZnVuY3Rpb24oc2l6ZSwgY29udGFpbmVyKXtcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzaXplLmE7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNpemUuYjtcclxuXHRcclxuXHRjYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblx0Y2FudmFzLnN0eWxlLnRvcCA9IDA7XHJcblx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cdFxyXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdHRoaXMuY3R4LndpZHRoID0gY2FudmFzLndpZHRoO1xyXG5cdHRoaXMuY3R4LmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcblx0dGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblx0XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHRcclxuXHR0aGlzLnNjYWxlID0gY2FudmFzLm9mZnNldEhlaWdodCAvIHNpemUuYjtcclxuXHRcclxuXHRjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrID0gY2FudmFzLnJlcXVlc3RQb2ludGVyTG9jayB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLm1velJlcXVlc3RQb2ludGVyTG9jayB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLndlYmtpdFJlcXVlc3RQb2ludGVyTG9jaztcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3U3ByaXRlID0gZnVuY3Rpb24oc3ByaXRlLCB4LCB5LCBzdWJJbWFnZSl7XHJcblx0dmFyIHhJbWcgPSBzdWJJbWFnZSAlIHNwcml0ZS5pbWdOdW07XHJcblx0dmFyIHlJbWcgPSAoc3ViSW1hZ2UgLyBzcHJpdGUuaW1nTnVtKSA8PCAwO1xyXG5cdFxyXG5cdHRoaXMuY3R4LmRyYXdJbWFnZShzcHJpdGUsXHJcblx0XHR4SW1nICogc3ByaXRlLmltZ1dpZHRoLCB5SW1nICogc3ByaXRlLmltZ0hlaWdodCwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0LFxyXG5cdFx0eCwgeSwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0XHJcblx0XHQpO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdTcHJpdGVFeHQgPSBmdW5jdGlvbihzcHJpdGUsIHgsIHksIHN1YkltYWdlLCBpbWFnZUFuZ2xlKXtcclxuXHR2YXIgeEltZyA9IHN1YkltYWdlICUgc3ByaXRlLmltZ051bTtcclxuXHR2YXIgeUltZyA9IChzdWJJbWFnZSAvIHNwcml0ZS5pbWdOdW0pIDw8IDA7XHJcblx0XHJcblx0dGhpcy5jdHguc2F2ZSgpO1xyXG5cdHRoaXMuY3R4LnRyYW5zbGF0ZSh4K3Nwcml0ZS54T3JpZywgeStzcHJpdGUueU9yaWcpO1xyXG5cdHRoaXMuY3R4LnJvdGF0ZShpbWFnZUFuZ2xlKTtcclxuXHRcclxuXHR0aGlzLmN0eC5kcmF3SW1hZ2Uoc3ByaXRlLFxyXG5cdFx0eEltZyAqIHNwcml0ZS5pbWdXaWR0aCwgeUltZyAqIHNwcml0ZS5pbWdIZWlnaHQsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodCxcclxuXHRcdC1zcHJpdGUueE9yaWcsIC1zcHJpdGUueU9yaWcsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdHRoaXMuY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3VGV4dCA9IGZ1bmN0aW9uKHRleHQsIHgsIHksIGNvbnNvbGUpe1xyXG5cdGNvbnNvbGUucHJpbnRUZXh0KHgseSwgdGV4dCwgdGhpcy5jdHgpO1xyXG5cdC8qdmFyIHcgPSBjb25zb2xlLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSBjb25zb2xlLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdGZvciAodmFyIGo9MCxqbGVuPXRleHQubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0dmFyIGNoYXJhID0gdGV4dC5jaGFyQXQoaik7XHJcblx0XHR2YXIgaW5kID0gY29uc29sZS5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UoY29uc29sZS5zcHJpdGVGb250LFxyXG5cdFx0XHRcdHcgKiBpbmQsIDEsIHcsIGggLSAxLFxyXG5cdFx0XHRcdHgsIHksIHcsIGggLSAxKTtcclxuXHRcdH1cclxuXHRcdHggKz0gdztcclxuXHR9Ki9cclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG59OyIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgQXVkaW9BUEkgPSByZXF1aXJlKCcuL0F1ZGlvJyk7XHJcbnZhciBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XHJcbnZhciBJbnZlbnRvcnkgPSByZXF1aXJlKCcuL0ludmVudG9yeScpO1xyXG52YXIgSXRlbSA9IHJlcXVpcmUoJy4vSXRlbScpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBNYXBNYW5hZ2VyID0gcmVxdWlyZSgnLi9NYXBNYW5hZ2VyJyk7XHJcbnZhciBNaXNzaWxlID0gcmVxdWlyZSgnLi9NaXNzaWxlJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBQbGF5ZXJTdGF0cyA9IHJlcXVpcmUoJy4vUGxheWVyU3RhdHMnKTtcclxudmFyIFNhdmVNYW5hZ2VyID0gcmVxdWlyZSgnLi9TYXZlTWFuYWdlcicpO1xyXG52YXIgVGl0bGVTY3JlZW4gPSByZXF1aXJlKCcuL1RpdGxlU2NyZWVuJyk7XHJcbnZhciBFbmRpbmdTY3JlZW4gPSByZXF1aXJlKCcuL0VuZGluZ1NjcmVlbicpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL1VJJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxudmFyIFdlYkdMID0gcmVxdWlyZSgnLi9XZWJHTCcpO1xyXG5cclxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cdFx0XHRcdCBcdFx0XHRTdHlnaWFuIEFieXNzXHJcblx0XHRcdFx0XHJcbiAgQnkgQ2FtaWxvIFJhbcOtcmV6IChodHRwOi8vanVjYXJhdmUuY29tKSBhbmQgU2xhc2ggKGh0dHA6Ly9zbGFzaGllLm5ldClcclxuXHRcdFx0XHJcblx0XHRcdFx0XHQgIFx0XHRcdDIwMTVcclxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cclxuXHJcbmZ1bmN0aW9uIFVuZGVyd29ybGQoKXtcclxuXHR0aGlzLnNpemUgPSB2ZWMyKDM1NSwgMjAwKTtcclxuXHRcclxuXHR0aGlzLkdMID0gbmV3IFdlYkdMKHRoaXMuc2l6ZSwgVXRpbHMuJCQoXCJkaXZHYW1lXCIpKTtcclxuXHR0aGlzLlVJID0gbmV3IFVJKHRoaXMuc2l6ZSwgVXRpbHMuJCQoXCJkaXZHYW1lXCIpKTtcclxuXHR0aGlzLmF1ZGlvID0gbmV3IEF1ZGlvQVBJKCk7XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyU3RhdHMoKTtcclxuXHR0aGlzLmludmVudG9yeSA9IG5ldyBJbnZlbnRvcnkoMTApO1xyXG5cdHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKDEwLCAxMCwgMzAwLCB0aGlzKTtcclxuXHR0aGlzLnNhdmVNYW5hZ2VyID0gbmV3IFNhdmVNYW5hZ2VyKHRoaXMpO1xyXG5cdHRoaXMuZm9udCA9ICcxMHB4IFwiQ291cmllclwiJztcclxuXHRcclxuXHR0aGlzLmdyUGFjayA9ICdpbWdfaHIvJztcclxuXHRcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHR0aGlzLm1hcCA9IG51bGw7XHJcblx0dGhpcy5tYXBzID0gW107XHJcblx0dGhpcy5rZXlzID0gW107XHJcblx0dGhpcy51bmlxdWVSZWdpc3RyeSA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHR9O1xyXG5cdHRoaXMubW91c2UgPSB2ZWMzKDAuMCwgMC4wLCAwKTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdHRoaXMuaW1hZ2VzID0ge307XHJcblx0dGhpcy5tdXNpYyA9IHt9O1xyXG5cdHRoaXMuc291bmRzID0ge307XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbXSwgZmxvb3I6IFtdLCBjZWlsOiBbXX07XHJcblx0dGhpcy5vYmplY3RUZXggPSB7fTtcclxuXHR0aGlzLm1vZGVscyA9IHt9O1xyXG5cdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMudGltZVN0b3AgPSAwO1xyXG5cdHRoaXMucHJvdGVjdGlvbiA9IDA7XHJcblx0XHJcblx0dGhpcy5mcHMgPSAoMTAwMCAvIDMwKSA8PCAwO1xyXG5cdHRoaXMubGFzdFQgPSAwO1xyXG5cdHRoaXMubnVtYmVyRnJhbWVzID0gMDtcclxuXHR0aGlzLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFxyXG5cdHRoaXMubG9hZEltYWdlcygpO1xyXG5cdHRoaXMubG9hZE11c2ljKCk7XHJcblx0dGhpcy5sb2FkVGV4dHVyZXMoKTtcclxuXHRcclxuXHR0aGlzLmNyZWF0ZTNET2JqZWN0cygpO1xyXG5cdEFuaW1hdGVkVGV4dHVyZS5pbml0KHRoaXMuR0wuY3R4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlM0RPYmplY3RzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmRvb3IgPSBPYmplY3RGYWN0b3J5LmRvb3IodmVjMygwLjUsMC43NSwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgZmFsc2UpO1xyXG5cdHRoaXMuZG9vclcgPSBPYmplY3RGYWN0b3J5LmRvb3JXYWxsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5kb29yQyA9IE9iamVjdEZhY3RvcnkuY3ViZSh2ZWMzKDEuMCwxLjAsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDAuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLnNsb3BlID0gT2JqZWN0RmFjdG9yeS5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMuR0wuY3R4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zb3VuZHMuaGl0ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9oaXQud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMubWlzcyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvbWlzcy53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLnNvdW5kcy5ibG9jayA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvYmxvY2sud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDhfLV9VbHRpbWFfNF8tX0M2NF8tX0R1bmdlb25zLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTXVzaWNQb3N0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24yID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wMl8tX1VsdGltYV81Xy1fQzY0Xy1fQnJpdGFubmljX0xhbmRzLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDVfLV9VbHRpbWFfM18tX0M2NF8tX0NvbWJhdC5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzNfLV9DNjRfLV9FeG9kdXMnX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjUgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA0Xy1fVWx0aW1hXzVfLV9DNjRfLV9FbmdhZ2VtZW50X2FuZF9NZWxlZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjYgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAzXy1fVWx0aW1hXzRfLV9DNjRfLV9Mb3JkX0JyaXRpc2gnc19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb243ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMV8tX1VsdGltYV81Xy1fQzY0Xy1fV29ybGRzX0JlbG93Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uOCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTBfLV9VbHRpbWFfNV8tX0M2NF8tX0hhbGxzX29mX0Rvb20ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmNvZGV4Um9vbSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfNF8tX0M2NF8tX1NocmluZXMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRJbWFnZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW1hZ2VzLml0ZW1zX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaXRlbXNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA4LCBpbWdWTnVtOiA4fSk7XHJcblx0dGhpcy5pbWFnZXMuc3BlbGxzX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic3BlbGxzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLnRpdGxlU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGl0bGVTY3JlZW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMuaW50cm8xID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm8xLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludHJvMiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludHJvMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnRybzMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnRybzMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW50cm80ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW50cm80LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzLmVuZGluZ1NjcmVlbiA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZGluZy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4yID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5zZWxlY3RDbGFzcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNlbGVjdENsYXNzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeSA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiAxLCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeURyb3AucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogMSwgaW1nVk51bTogMn0pO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5X3NlbGVjdGVkLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnNjcm9sbEZvbnQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzY3JvbGxGb250V2hpdGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMucmVzdGFydCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJlc3RhcnQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMucGF1c2VkID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicGF1c2VkLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnZpZXdwb3J0V2VhcG9ucyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInZpZXdwb3J0V2VhcG9ucy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA0LCBpbWdWTnVtOiA0fSk7XHJcblx0dGhpcy5pbWFnZXMuY29tcGFzcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNvbXBhc3NVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7eE9yaWc6IDExLCB5T3JpZzogMTEsIGltZ051bTogMiwgaW1nVk51bTogMX0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZFRleHR1cmVzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnRleHR1cmVzID0ge3dhbGw6IFtudWxsXSwgZmxvb3I6IFtudWxsXSwgY2VpbDogW251bGxdLCB3YXRlcjogW251bGxdfTtcclxuXHRcclxuXHQvLyBObyBUZXh0dXJlXHJcblx0dmFyIG5vVGV4ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwibm9UZXh0dXJlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaChub1RleCk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2gobm9UZXgpO1xyXG5cdFxyXG5cdC8vIFdhbGxzXHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2FsbDAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw1LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMSwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEZsb29yc1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3JbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIExpcXVpZHNcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TGF2YTAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gQ2VpbGluZ3NcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhDZWlsMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsWzUwXSA9ICh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhIb2xlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNTAsIHRydWUpKTtcclxuXHRcclxuXHQvLyBJdGVtc1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SXRlbXMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtcy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoOCwgOCwgdGhpcy5HTC5jdHgpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zTWlzYyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleE1pc2MucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtc01pc2MuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDgsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhTcGVsbHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDQsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHQvLyBNYWdpYyBCb2x0c1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Qm9sdHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5ib2x0cy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIFN0YWlyc1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFN0YWlycy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoMiwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIEVuZW1pZXNcclxuXHR0aGlzLm9iamVjdFRleC5iYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGlkZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTcGlkZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC50cm9sbF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFRyb2xsUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2F6ZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHYXplclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oZWFkbGVzc19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEhlYWRsZXNzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgub3JjX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T3JjUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmVhcGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmVhcGVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2tlbGV0b25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTa2VsZXRvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5kYWVtb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhEYWVtb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubW9uZ2JhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE1vbmdiYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguaHlkcmFfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhIeWRyYVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zZWFTZXJwZW50X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4U2VhU2VycGVudFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vY3RvcHVzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T2N0b3B1c1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYWxyb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYWxyb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGljaGVfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhMaWNoZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5naG9zdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdob3N0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdyZW1saW5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHcmVtbGluUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmRyYWdvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERyYWdvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC56b3JuX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4Wm9yblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC53aXNwX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4V2lzcFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tYWdlX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TWFnZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYW5nZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYW5nZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZmlnaHRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEZpZ2h0ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguYmFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGF2YUxpemFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExhdmFMaXphcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wb3N0TG9hZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLmNyZWF0ZVNwcml0ZUZvbnQodGhpcy5pbWFnZXMuc2Nyb2xsRm9udCwgXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSE/LC4vXCIsIDcpO1xyXG5cdHRoaXMubG9hZE11c2ljUG9zdCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuc3RvcE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmF1ZGlvLnN0b3BNdXNpYygpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheU11c2ljID0gZnVuY3Rpb24obXVzaWNDb2RlLCBsb29wKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5tdXNpY1ttdXNpY0NvZGVdO1xyXG5cdGlmICghYXVkaW9GKSByZXR1cm4gbnVsbDtcclxuXHR0aGlzLnN0b3BNdXNpYygpO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgbG9vcCwgdHJ1ZSwgMC4yKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kQ29kZSl7XHJcblx0dmFyIGF1ZGlvRiA9IHRoaXMuc291bmRzW3NvdW5kQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgZmFsc2UsIGZhbHNlLCAwLjMpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VUkgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLlVJLmN0eDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldFRleHR1cmVCeUlkID0gZnVuY3Rpb24odGV4dHVyZUlkLCB0eXBlKXtcclxuXHRpZiAoIXRoaXMudGV4dHVyZXNbdHlwZV1bdGV4dHVyZUlkXSkgdGV4dHVyZUlkID0gMTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0T2JqZWN0VGV4dHVyZSA9IGZ1bmN0aW9uKHRleHR1cmVDb2RlKXtcclxuXHRpZiAoIXRoaXMub2JqZWN0VGV4W3RleHR1cmVDb2RlXSkgdGhyb3cgXCJJbnZhbGlkIHRleHR1cmUgY29kZTogXCIgKyB0ZXh0dXJlQ29kZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcCwgZGVwdGgpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRpZiAoZGVwdGggPT09IHVuZGVmaW5lZCB8fCAhZ2FtZS5tYXBzW2RlcHRoIC0gMV0pe1xyXG5cdFx0Z2FtZS5tYXAgPSBuZXcgTWFwTWFuYWdlcigpO1xyXG5cdFx0Z2FtZS5tYXAuaW5pdChnYW1lLCBtYXAsIGRlcHRoKTtcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlcHRoO1xyXG5cdFx0Z2FtZS5tYXBzLnB1c2goZ2FtZS5tYXApO1xyXG5cdH1lbHNlIGlmIChnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IGdhbWUubWFwc1tkZXB0aCAtIDFdO1xyXG5cdH1cclxuXHRnYW1lLnNjZW5lID0gbnVsbDtcclxuXHRpZiAoZGVwdGgpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnZHVuZ2VvbicrZGVwdGgsIHRydWUpO1xyXG5cdGVsc2UgaWYgKG1hcCA9PT0gJ2NvZGV4Um9vbScpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnY29kZXhSb29tJywgdHJ1ZSk7XHJcblx0Z2FtZS5wbGF5ZXIuY3VycmVudE1hcCA9IG1hcDtcclxuXHRnYW1lLnBsYXllci5jdXJyZW50RGVwdGggPSBkZXB0aDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnByaW50R3JlZXQgPSBmdW5jdGlvbigpe1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRXZWxjb21lQmFjayA9IGZ1bmN0aW9uKCl7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5uZXdHYW1lID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmludmVudG9yeS5yZXNldCgpO1xyXG5cdHRoaXMucGxheWVyLnJlc2V0KCk7XHJcblx0XHJcblx0dGhpcy5tYXBzID0gW107XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMuY29uc29sZS5tZXNzYWdlcyA9IFtdO1x0XHJcblx0dGhpcy5zY2VuZSA9IG5ldyBUaXRsZVNjcmVlbih0aGlzKTtcclxuXHR0aGlzLmxvb3AoKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmVuZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbnZlbnRvcnkucmVzZXQoKTtcclxuXHR0aGlzLnBsYXllci5yZXNldCgpO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHR0aGlzLmNvbnNvbGUubWVzc2FnZXMgPSBbXTtcdFxyXG5cdHRoaXMuc2NlbmUgPSBuZXcgRW5kaW5nU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEdhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHRpZiAoZ2FtZS5HTC5hcmVJbWFnZXNSZWFkeSgpICYmIGdhbWUuYXVkaW8uYXJlU291bmRzUmVhZHkoKSl7XHJcblx0XHRnYW1lLnBvc3RMb2FkaW5nKCk7XHJcblx0XHRnYW1lLm5ld0dhbWUoKTtcclxuXHR9ZWxzZXtcclxuXHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb2FkR2FtZSgpOyB9KTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0cmV0dXJuIHRoaXMuaW52ZW50b3J5LmFkZEl0ZW0oaXRlbSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCB0ZXh0dXJlKXtcclxuXHR2YXIgY2FtZXJhID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHRoaXMuR0wuZHJhd09iamVjdChvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmxvY2sgPSBmdW5jdGlvbihibG9ja09iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KGJsb2NrT2JqZWN0LCBjYW1lcmEsIHRoaXMuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yV2FsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHRleElkLCB2ZXJ0aWNhbCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yVy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0aWYgKHZlcnRpY2FsKSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLE1hdGguUElfMiwwKTsgZWxzZSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLDAsMCk7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vclcsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JDdWJlID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JDLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yQywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vciA9IGZ1bmN0aW9uKHgsIHksIHosIHJvdGF0aW9uLCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRnYW1lLmRvb3Iucm90YXRpb24uYiA9IHJvdGF0aW9uO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3IsIGNhbWVyYSwgZ2FtZS5vYmplY3RUZXhbdGV4SWRdLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Zsb29yID0gZnVuY3Rpb24oZmxvb3JPYmplY3QsIHRleElkLCB0eXBlT2Ype1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHZhciBmdCA9IHR5cGVPZjtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZmxvb3JPYmplY3QsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgZnQpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0JpbGxib2FyZCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB0ZXhJZCwgYmlsbGJvYXJkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRpZiAoIWJpbGxib2FyZCkgYmlsbGJvYXJkID0gZ2FtZS5iaWxsYm9hcmQ7XHJcblx0XHJcblx0YmlsbGJvYXJkLnBvc2l0aW9uLnNldChwb3NpdGlvbik7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGJpbGxib2FyZCwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3U2xvcGUgPSBmdW5jdGlvbihzbG9wZU9iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuR0wuZHJhd09iamVjdChzbG9wZU9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcImZsb29yXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd1VJID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIHBsYXllciA9IGdhbWUubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRpZiAoIXBsYXllcikgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBjdHggPSBnYW1lLlVJLmN0eDtcclxuXHRcclxuXHQvLyBEcmF3IGhlYWx0aCBiYXJcclxuXHR2YXIgaHAgPSBwcy5ocCAvIHBzLm1IUDtcclxuXHRjdHguZmlsbFN0eWxlID0gKHBzLnBvaXNvbmVkKT8gXCJyZ2IoMTIyLDAsMTIyKVwiIDogXCJyZ2IoMTIyLDAsMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCw4LDc1LDQpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigyMDAsMCwyMDApXCIgOiBcInJnYigyMDAsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsKDc1ICogaHApIDw8IDAsNCk7XHJcblx0XHJcblx0Ly8gRHJhdyBtYW5hXHJcblx0dmFyIG1hbmEgPSBwcy5tYW5hIC8gcHMubU1hbmE7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKDE4MSw5OCwyMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiw2MCwyKTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LDEzOCwyOClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiwoNjAgKiBtYW5hKSA8PCAwLDIpO1xyXG5cdFxyXG5cdC8vIERyYXcgSW52ZW50b3J5XHJcblx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pXHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCwgOTAsIDYsIDApO1xyXG5cdGVsc2VcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAwKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW52ZW50b3J5Lml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdHZhciBzcHIgPSBpdGVtLnRleCArICdfdWknO1xyXG5cclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSAmJiAoaXRlbS50eXBlID09ICd3ZWFwb24nIHx8IGl0ZW0udHlwZSA9PSAnYXJtb3VyJykgJiYgaXRlbS5lcXVpcHBlZClcclxuXHRcdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkLCA5MCArICgyMiAqIGkpLCA2LCAwKTtcdFx0XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXNbc3ByXSwgOTMgKyAoMjIgKiBpKSwgOSwgaXRlbS5zdWJJbWcpO1xyXG5cdH1cclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5LCA5MCwgNiwgMSk7XHJcblx0XHJcblx0Ly8gSWYgdGhlIHBsYXllciBpcyBodXJ0IGRyYXcgYSByZWQgc2NyZWVuXHJcblx0aWYgKHBsYXllci5odXJ0ID4gMC4wKXtcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjUpXCI7XHJcblx0XHRjdHguZmlsbFJlY3QoMCwwLGN0eC53aWR0aCxjdHguaGVpZ2h0KTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wcm90ZWN0aW9uID4gMC4wKXtcdC8vIElmIHRoZSBwbGF5ZXIgaGFzIHByb3RlY3Rpb24gdGhlbiBkcmF3IGl0IHNsaWdodGx5IGJsdWVcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoNDAsNDAsMjU1LDAuMilcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucmVzdGFydCwgODUsIDk0LCAwKTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wYXVzZWQpe1xyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnBhdXNlZCwgMTQ3LCA5NCwgMCk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0RlcHRoICcrdGhpcy5mbG9vckRlcHRoLCAxMCwyNSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0xldmVsICcgKyBwcy5sdmwrJyAnK3RoaXMucGxheWVyLmNsYXNzTmFtZSwgMTAsMzMsdGhpcy5jb25zb2xlKTtcclxuXHR0aGlzLlVJLmRyYXdUZXh0KCdIUDogJytwcy5ocCwgMTAsOSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ01hbmE6Jytwcy5tYW5hLCAxMCwxNyx0aGlzLmNvbnNvbGUpO1xyXG5cclxuXHQvLyBEcmF3IHRoZSBjb21wYXNzXHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDApO1xyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZUV4dCh0aGlzLmltYWdlcy5jb21wYXNzLCAzMjAsIDEyLCAxLCBNYXRoLlBJICsgdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uLmIpO1xyXG5cclxuXHR2YXIgd2VhcG9uID0gdGhpcy5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0aWYgKHdlYXBvbiAmJiB3ZWFwb24udmlld1BvcnRJbWcgPj0gMClcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMsIDE2MCwgMTMwICsgdGhpcy5tYXAucGxheWVyLmxhdW5jaEF0dGFja0NvdW50ZXIgKiAyIC0gdGhpcy5tYXAucGxheWVyLmF0dGFja1dhaXQgKiAxLjUsIHdlYXBvbi52aWV3UG9ydEltZyk7XHJcblx0Z2FtZS5jb25zb2xlLnJlbmRlcig4LCAxMjApO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGV4cFBvaW50cyl7XHJcblx0dGhpcy5wbGF5ZXIuYWRkRXhwZXJpZW5jZShleHBQb2ludHMsIHRoaXMuY29uc29sZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5ID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcyA9IFtdO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljU3dvcmQnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWMnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ01hZ2UnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAnRHJ1aWQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdQYWxhZGluJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbGlnaHQnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0JhcmQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0Y2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGRlZmF1bHQ6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgncmVkUG90aW9uJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdEcnVpZCc6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2Jvd01hZ2ljJywgMC42KSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnc2xpbmdFdHRpbicsIDAuNykpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS51c2VJdGVtID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWN0aXZlU3BlbGwgPSBmdW5jdGlvbihpbmRleCl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpbmRleF07XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0dmFyIHAgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0cC5tb3ZlZCA9IHRydWU7XHJcblx0XHJcblx0aWYgKHBzLm1hbmEgPCBpdGVtLm1hbmEpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdCBlbm91Z2ggbWFuYVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0cHMubWFuYSA9IE1hdGgubWF4KHBzLm1hbmEgLSBpdGVtLm1hbmEsIDApO1xyXG5cdFxyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ2N1cmUnOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWCFcIik7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIllvdSBhcmUgY3VyZWQuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiQU4gTk9YLi4uXCIpO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3RoaW5nIGhhcHBlbnNcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZWRQb3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnYXJsaWMgcG90aW9uIGN1cmVzIHlvdS5cIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3RoaW5nIGhhcHBlbnNcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdoZWFsJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAodGhpcy5wbGF5ZXIubUhQICogaXRlbS5wZXJjZW50KSA8PCAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk1BTkkhIFwiK2hlYWwgKyBcIiBwb2ludHMgaGVhbGVkXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2xpZ2h0JzpcclxuXHRcdFx0aWYgKHRoaXMuR0wubGlnaHQgPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLkdMLmxpZ2h0ID0gaXRlbS5saWdodFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIExPUiFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdtaXNzaWxlJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZSgpO1xyXG5cdFx0XHRtaXNzaWxlLmluaXQocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdtYWdpY01pc3NpbGUnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiR1JBViBQT1IhXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ljZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0XHRcdG1pc3NpbGUuaW5pdChwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2ljZUJhbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiVkFTIEZSSU8hXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3JlcGVsJzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdibGluayc6XHJcblx0XHRcdHZhciBsYXN0UG9zID0gbnVsbDtcclxuXHRcdFx0dmFyIHBvcnRlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5tYXAucGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcdHZhciBkaXIgPSB0aGlzLm1hcC5wbGF5ZXIucm90YXRpb247XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIuYik7XHJcblx0XHRcdHZhciBkeiA9IC1NYXRoLnNpbihkaXIuYik7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBpPTA7aTwxNTtpKyspe1xyXG5cdFx0XHRcdHBvcy5hICs9IGR4O1xyXG5cdFx0XHRcdHBvcy5jICs9IGR6O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBjeCA9IHBvcy5hIDw8IDA7XHJcblx0XHRcdFx0dmFyIGN5ID0gcG9zLmMgPDwgMDtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXAuaXNTb2xpZChjeCwgY3kpKXtcclxuXHRcdFx0XHRcdGlmIChsYXN0UG9zKXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFBPUiFcIik7XHJcblx0XHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRcdHZhciBwb3J0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpID0gMTU7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMubWFwLmlzV2F0ZXJQb3NpdGlvbihjeCwgY3kpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGlucyA9IHRoaXMubWFwLmdldEluc3RhbmNlQXRHcmlkKHBvcyk7XHJcblx0XHRcdFx0XHRcdGlmICghaW5zKXtcclxuXHRcdFx0XHRcdFx0XHRsYXN0UG9zID0gdmVjMyhjeCwgcG9zLmIsIGN5KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFwb3J0ZWQpe1xyXG5cdFx0XHRcdGlmIChsYXN0UG9zKXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0bGFzdFBvcy5zdW0odmVjMygwLjUsMCwwLjUpKTtcclxuXHRcdFx0XHRcdHAucG9zaXRpb24gPSBsYXN0UG9zO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdmaXJlYmFsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUoKTtcclxuXHRcdFx0bWlzc2lsZS5pbml0KHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnZmlyZUJhbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiVkFTIEZMQU0hXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3Byb3RlY3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5wcm90ZWN0aW9uID0gaXRlbS5wcm90VGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gU0FOQ1QhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndGltZSc6XHJcblx0XHRcdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy50aW1lU3RvcCA9IGl0ZW0uc3RvcFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlJFTCBUWU0hXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnc2xlZXAnOlxyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gWlUhXCIpO1xyXG5cdFx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXAuZ2V0SW5zdGFuY2VzTmVhcmVzdChwLnBvc2l0aW9uLCA2LCAnZW5lbXknKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0aW5zdGFuY2VzW2ldLnNsZWVwID0gaXRlbS5zbGVlcFRpbWU7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdqaW54JzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd0cmVtb3InOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKCk7XHJcblx0XHRcdG1pc3NpbGUuaW5pdChwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2tpbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiWEVOIENPUlAhXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyb3BJdGVtID0gZnVuY3Rpb24oaSl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBjbGVhblBvcyA9IHRoaXMubWFwLmdldE5lYXJlc3RDbGVhbkl0ZW1UaWxlKHBsYXllci5wb3NpdGlvbi5hLCBwbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0aWYgKCFjbGVhblBvcyl7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdDYW5ub3QgZHJvcCBpdCBoZXJlJyk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgZHJvcHBlZCcpO1xyXG5cdFx0Y2xlYW5Qb3MuYSArPSAwLjU7XHJcblx0XHRjbGVhblBvcy5jICs9IDAuNTtcclxuXHRcdFxyXG5cdFx0dmFyIG5JdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRuSXQuaW5pdChjbGVhblBvcywgbnVsbCwgdGhpcy5tYXApO1xyXG5cdFx0bkl0LnNldEl0ZW0oaXRlbSk7XHJcblx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChuSXQpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpKTtcclxuXHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jaGVja0ludkNvbnRyb2wgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0XHJcblx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZGVzdHJveWVkKXtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoODIpKXtcclxuXHRcdFx0ZG9jdW1lbnQuZXhpdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcdHRoaXMubmV3R2FtZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAoIXBsYXllciB8fCBwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4MCkpe1xyXG5cdFx0dGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWQ7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnBhdXNlZCkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODQpKXtcclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ1NlbGVjdCB0aGUgaXRlbSB0byBkcm9wJyk7XHJcblx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSB0cnVlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR2YXIgaW5kZXggPSA0OSArIGk7XHJcblx0XHRpZiAoaSA9PSA5KVxyXG5cdFx0XHRpbmRleCA9IDQ4O1xyXG5cdFx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZChpbmRleCkpe1xyXG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdFx0XHRpZiAoIWl0ZW0pe1xyXG5cdFx0XHRcdGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ05vIGl0ZW0nKTtcclxuXHRcdFx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0XHR0aGlzLmRyb3BJdGVtKGkpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaXRlbS50eXBlID09ICd3ZWFwb24nICYmICFpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgd2llbGRlZCcpO1xyXG5cdFx0XHRcdHRoaXMuaW52ZW50b3J5LmVxdWlwSXRlbShpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnYXJtb3VyJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdvcm4nKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ21hZ2ljJyl7XHJcblx0XHRcdFx0dGhpcy5hY3RpdmVTcGVsbChpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAncG90aW9uJyl7XHJcblx0XHRcdFx0dGhpcy51c2VJdGVtKGkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSBcclxuXHRcclxuXHRyZXR1cm47XHJcblx0XHJcblx0aWYgKHBzLnBvdGlvbnMgPiAwKXtcclxuXHRcdGlmIChwcy5ocCA9PSBwcy5tSFApe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSGVhbHRoIGlzIGFscmVhZHkgYXQgbWF4XCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHBzLnBvdGlvbnMgLT0gMTtcclxuXHRcdHBzLmhwID0gTWF0aC5taW4ocHMubUhQLCBwcy5ocCArIDUpO1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlBvdGlvbiB1c2VkXCIpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vIG1vcmUgcG90aW9ucyBsZWZ0LlwiKTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nbG9iYWxMb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5wcm90ZWN0aW9uID4gMCl7IHRoaXMucHJvdGVjdGlvbiAtPSAxOyB9XHJcblx0aWYgKHRoaXMudGltZVN0b3AgPiAwKXsgdGhpcy50aW1lU3RvcCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuR0wubGlnaHQgPiAwKXsgdGhpcy5HTC5saWdodCAtPSAxOyB9XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIucmVnZW5NYW5hKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0XHJcblx0dmFyIG5vdyA9IERhdGUubm93KCk7XHJcblx0dmFyIGRUID0gKG5vdyAtIGdhbWUubGFzdFQpO1xyXG5cdFxyXG5cdC8vIExpbWl0IHRoZSBnYW1lIHRvIHRoZSBiYXNlIHNwZWVkIG9mIHRoZSBnYW1lXHJcblx0aWYgKGRUID4gZ2FtZS5mcHMpe1xyXG5cdFx0Z2FtZS5sYXN0VCA9IG5vdyAtIChkVCAlIGdhbWUuZnBzKTtcclxuXHRcdFxyXG5cdFx0aWYgKCFnYW1lLkdMLmFjdGl2ZSl7XHJcblx0XHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb29wKCk7IH0pOyBcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodGhpcy5tYXAgIT0gbnVsbCl7XHJcblx0XHRcdHZhciBnbCA9IGdhbWUuR0wuY3R4O1xyXG5cdFx0XHRcclxuXHRcdFx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG5cdFx0XHRnYW1lLlVJLmNsZWFyKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRnYW1lLmdsb2JhbExvb3AoKTtcclxuXHRcdFx0Z2FtZS5jaGVja0ludkNvbnRyb2woKTtcclxuXHRcdFx0Z2FtZS5tYXAubG9vcCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMubWFwKVxyXG5cdFx0XHRcdGdhbWUuZHJhd1VJKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLnNjZW5lICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLnNjZW5lLmxvb3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvb3AoKTsgfSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRLZXlQcmVzc2VkID0gZnVuY3Rpb24oa2V5Q29kZSl7XHJcblx0aWYgKHRoaXMua2V5c1trZXlDb2RlXSA9PSAxKXtcclxuXHRcdHRoaXMua2V5c1trZXlDb2RlXSA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VCdXR0b25QcmVzc2VkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tb3VzZS5jID09IDEpe1xyXG5cdFx0dGhpcy5tb3VzZS5jID0gMjtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRNb3VzZU1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcmV0ID0ge3g6IHRoaXMubW91c2VNb3ZlbWVudC54LCB5OiB0aGlzLm1vdXNlTW92ZW1lbnQueX07XHJcblx0dGhpcy5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVXRpbHMuYWRkRXZlbnQod2luZG93LCBcImxvYWRcIiwgZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IG5ldyBVbmRlcndvcmxkKCk7XHJcblx0Z2FtZS5sb2FkR2FtZSgpO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUua2V5c1tlLmtleUNvZGVdID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUua2V5c1tlLmtleUNvZGVdID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXl1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChlLmtleUNvZGUgPT0gOCl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGdhbWUuVUkuY2FudmFzO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tYXAgIT0gbnVsbClcclxuXHRcdFx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jaygpO1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1vdXNlLmMgPT0gMikgcmV0dXJuO1xyXG5cdFx0Z2FtZS5tb3VzZS5jID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGdhbWUuZmlyc3RGcmFtZSA9IERhdGUubm93KCk7XHJcblx0XHRnYW1lLm51bWJlckZyYW1lcyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcInJlc2l6ZVwiLCBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIGdhbWUuc2l6ZS5iO1xyXG5cdFx0dmFyIGNhbnZhcyA9IGdhbWUuR0wuY2FudmFzO1xyXG5cdFx0XHJcblx0XHRjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRcdGdhbWUuVUkuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gY2FudmFzLmhlaWdodDtcclxuXHR9KTtcclxuXHRcclxuXHR2YXIgbW92ZUNhbGxiYWNrID0gZnVuY3Rpb24oZSl7XHJcblx0XHRnYW1lLm1vdXNlTW92ZW1lbnQueCA9IGUubW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUubW96TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUud2Via2l0TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnkgPSBlLm1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHBvaW50ZXJsb2NrY2hhbmdlID0gZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAoZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQubW96UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQud2Via2l0UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMpe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZUNhbGxiYWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHRcdGdhbWUubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHR9XHJcblx0fTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW96cG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIndlYmtpdHBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiYmx1clwiLCBmdW5jdGlvbihlKXsgZ2FtZS5HTC5hY3RpdmUgPSBmYWxzZTsgZ2FtZS5hdWRpby5wYXVzZU11c2ljKCk7ICB9KTtcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gdHJ1ZTsgZ2FtZS5hdWRpby5yZXN0b3JlTXVzaWMoKTsgfSk7XHJcbn0pO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRhZGRFdmVudDogZnVuY3Rpb24gKG9iaiwgdHlwZSwgZnVuYyl7XHJcblx0XHRpZiAob2JqLmFkZEV2ZW50TGlzdGVuZXIpe1xyXG5cdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW5jLCBmYWxzZSk7XHJcblx0XHR9ZWxzZSBpZiAob2JqLmF0dGFjaEV2ZW50KXtcclxuXHRcdFx0b2JqLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGZ1bmMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0JCQ6IGZ1bmN0aW9uKG9iaklkKXtcclxuXHRcdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob2JqSWQpO1xyXG5cdFx0aWYgKCFlbGVtKSBhbGVydChcIkNvdWxkbid0IGZpbmQgZWxlbWVudDogXCIgKyBvYmpJZCk7XHJcblx0XHRyZXR1cm4gZWxlbTtcclxuXHR9LFxyXG5cdGdldEh0dHA6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaHR0cDtcclxuXHRcdGlmICAod2luZG93LlhNTEh0dHBSZXF1ZXN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0fWVsc2UgaWYgKHdpbmRvdy5BY3RpdmVYT2JqZWN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gaHR0cDtcclxuXHR9LFxyXG5cdHJvbGxEaWNlOiBmdW5jdGlvbiAocGFyYW0pe1xyXG5cdFx0dmFyIGEgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcoMCwgcGFyYW0uaW5kZXhPZignRCcpKSwgMTApO1xyXG5cdFx0dmFyIGIgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcocGFyYW0uaW5kZXhPZignRCcpICsgMSksIDEwKTtcclxuXHRcdHZhciByb2xsMSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0dmFyIHJvbGwyID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogYik7XHJcblx0XHRyZXR1cm4gTWF0aC5jZWlsKGEgKiAocm9sbDErcm9sbDIpLzIpO1xyXG5cdH1cclxufVxyXG5cdFxyXG4vLyBNYXRoIHByb3RvdHlwZSBvdmVycmlkZXNcdFxyXG5NYXRoLnJhZFJlbGF0aW9uID0gTWF0aC5QSSAvIDE4MDtcclxuTWF0aC5kZWdSZWxhdGlvbiA9IDE4MCAvIE1hdGguUEk7XHJcbk1hdGguZGVnVG9SYWQgPSBmdW5jdGlvbihkZWdyZWVzKXtcclxuXHRyZXR1cm4gZGVncmVlcyAqIHRoaXMucmFkUmVsYXRpb247XHJcbn07XHJcbk1hdGgucmFkVG9EZWcgPSBmdW5jdGlvbihyYWRpYW5zKXtcclxuXHRyZXR1cm4gKChyYWRpYW5zICogdGhpcy5kZWdSZWxhdGlvbikgKyA3MjApICUgMzYwO1xyXG59O1xyXG5NYXRoLmlSYW5kb20gPSBmdW5jdGlvbihhLCBiKXtcclxuXHRpZiAoYiA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdGIgPSBhO1xyXG5cdFx0YSA9IDA7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBhICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGIgLSBhKSk7XHJcbn07XHJcblxyXG5NYXRoLmdldEFuZ2xlID0gZnVuY3Rpb24oLypWZWMyKi8gYSwgLypWZWMyKi8gYil7XHJcblx0dmFyIHh4ID0gTWF0aC5hYnMoYS5hIC0gYi5hKTtcclxuXHR2YXIgeXkgPSBNYXRoLmFicyhhLmMgLSBiLmMpO1xyXG5cdFxyXG5cdHZhciBhbmcgPSBNYXRoLmF0YW4yKHl5LCB4eCk7XHJcblx0XHJcblx0Ly8gQWRqdXN0IHRoZSBhbmdsZSBhY2NvcmRpbmcgdG8gYm90aCBwb3NpdGlvbnNcclxuXHRpZiAoYi5hIDw9IGEuYSAmJiBiLmMgPD0gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgLSBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA8PSBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgKyBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA+IGEuYSAmJiBiLmMgPiBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSTIgLSBhbmc7XHJcblx0fVxyXG5cdFxyXG5cdGFuZyA9IChhbmcgKyBNYXRoLlBJMikgJSBNYXRoLlBJMjtcclxuXHRcclxuXHRyZXR1cm4gYW5nO1xyXG59O1xyXG5cclxuTWF0aC5QSV8yID0gTWF0aC5QSSAvIDI7XHJcbk1hdGguUEkyID0gTWF0aC5QSSAqIDI7XHJcbk1hdGguUEkzXzIgPSBNYXRoLlBJICogMyAvIDI7XHJcblxyXG4vLyBDcm9zc2Jyb3dzZXIgYW5pbWF0aW9uL2F1ZGlvIG92ZXJyaWRlc1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSBcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8IFxyXG5cdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXHJcblx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fCBcclxuXHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8IFxyXG5cdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHwgXHJcblx0ZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gZHJhdzEpe1xyXG5cdFx0d2luZG93LnNldFRpbWVvdXQoZHJhdzEsIDEwMDAgLyAzMCk7XHJcblx0fTtcclxuXHJcbndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7IiwidmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4vTWF0cml4Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIFdlYkdMKHNpemUsIGNvbnRhaW5lcil7XHJcblx0aWYgKCF0aGlzLmluaXRDYW52YXMoc2l6ZSwgY29udGFpbmVyKSkgcmV0dXJuIG51bGw7IFxyXG5cdHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHR0aGlzLnByb2Nlc3NTaGFkZXJzKCk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMgPSBbXTtcclxuXHRcclxuXHR0aGlzLmFjdGl2ZSA9IHRydWU7XHJcblx0dGhpcy5saWdodCA9IDA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2ViR0w7XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIHNpemUuYjtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzaXplLmE7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNpemUuYjtcclxuXHRjYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblx0Y2FudmFzLnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcblx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cdFxyXG5cdGlmICghY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIikpe1xyXG5cdFx0YWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCIpO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIik7XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5pbml0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Z2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xyXG5cdGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuXHRnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcclxuXHRcclxuXHRnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuXHRcclxuXHRnbC5lbmFibGUoIGdsLkJMRU5EICk7XHJcblx0Z2wuYmxlbmRFcXVhdGlvbiggZ2wuRlVOQ19BREQgKTtcclxuXHRnbC5ibGVuZEZ1bmMoIGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSApO1xyXG5cdFxyXG5cdHRoaXMuYXNwZWN0UmF0aW8gPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMuY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLnBlcnNwZWN0aXZlTWF0cml4ID0gTWF0cml4Lm1ha2VQZXJzcGVjdGl2ZSg0NSwgdGhpcy5hc3BlY3RSYXRpbywgMC4wMDIsIDUuMCk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUucHJvY2Vzc1NoYWRlcnMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIENvbXBpbGUgZnJhZ21lbnQgc2hhZGVyXHJcblx0dmFyIGVsU2hhZGVyID0gVXRpbHMuJCQoXCJmcmFnbWVudFNoYWRlclwiKTtcclxuXHR2YXIgY29kZSA9IHRoaXMuZ2V0U2hhZGVyQ29kZShlbFNoYWRlcik7XHJcblx0dmFyIGZTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcihmU2hhZGVyKTtcclxuXHRcclxuXHQvLyBDb21waWxlIHZlcnRleCBzaGFkZXJcclxuXHRlbFNoYWRlciA9IFV0aWxzLiQkKFwidmVydGV4U2hhZGVyXCIpO1xyXG5cdGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciB2U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG5cdGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBjb2RlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgc2hhZGVyIHByb2dyYW1cclxuXHR0aGlzLnNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZlNoYWRlcik7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgdlNoYWRlcik7XHJcblx0Z2wubGlua1Byb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHRpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5zaGFkZXJQcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuXHRcdGFsZXJ0KFwiRXJyb3IgaW5pdGlhbGl6aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcbiAgXHJcblx0Z2wudXNlUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG5cdFxyXG5cdC8vIEdldCBhdHRyaWJ1dGUgbG9jYXRpb25zXHJcblx0dGhpcy5hVmVydGV4UG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleFBvc2l0aW9uXCIpO1xyXG5cdHRoaXMuYVRleHR1cmVDb29yZCA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVGV4dHVyZUNvb3JkXCIpO1xyXG5cdHRoaXMuYVZlcnRleElzRGFyayA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVmVydGV4SXNEYXJrXCIpO1xyXG5cdFxyXG5cdC8vIEVuYWJsZSBhdHRyaWJ1dGVzXHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4UG9zaXRpb24pO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVRleHR1cmVDb29yZCk7XHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4SXNEYXJrKTtcclxuXHRcclxuXHQvLyBHZXQgdGhlIHVuaWZvcm0gbG9jYXRpb25zXHJcblx0dGhpcy51U2FtcGxlciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVNhbXBsZXJcIik7XHJcblx0dGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVUcmFuc2Zvcm1hdGlvbk1hdHJpeFwiKTtcclxuXHR0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVBlcnNwZWN0aXZlTWF0cml4XCIpO1xyXG5cdHRoaXMudVBhaW50SW5SZWQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQYWludEluUmVkXCIpO1xyXG5cdHRoaXMudUxpZ2h0RGVwdGggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVMaWdodERlcHRoXCIpO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmdldFNoYWRlckNvZGUgPSBmdW5jdGlvbihzaGFkZXIpe1xyXG5cdHZhciBjb2RlID0gXCJcIjtcclxuXHR2YXIgbm9kZSA9IHNoYWRlci5maXJzdENoaWxkO1xyXG5cdHZhciB0biA9IG5vZGUuVEVYVF9OT0RFO1xyXG5cdFxyXG5cdHdoaWxlIChub2RlKXtcclxuXHRcdGlmIChub2RlLm5vZGVUeXBlID09IHRuKVxyXG5cdFx0XHRjb2RlICs9IG5vZGUudGV4dENvbnRlbnQ7XHJcblx0XHRub2RlID0gbm9kZS5uZXh0U2libGluZztcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNvZGU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUubG9hZEltYWdlID0gZnVuY3Rpb24oc3JjLCBtYWtlSXRUZXh0dXJlLCB0ZXh0dXJlSW5kZXgsIGlzU29saWQsIHBhcmFtcyl7XHJcblx0aWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xyXG5cdGlmICghcGFyYW1zLmltZ051bSkgcGFyYW1zLmltZ051bSA9IDE7XHJcblx0aWYgKCFwYXJhbXMuaW1nVk51bSkgcGFyYW1zLmltZ1ZOdW0gPSAxO1xyXG5cdGlmICghcGFyYW1zLnhPcmlnKSBwYXJhbXMueE9yaWcgPSAwO1xyXG5cdGlmICghcGFyYW1zLnlPcmlnKSBwYXJhbXMueU9yaWcgPSAwO1xyXG5cdFxyXG5cdHZhciBnbCA9IHRoaXM7XHJcblx0dmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cdFxyXG5cdGltZy5zcmMgPSBzcmM7XHJcblx0aW1nLnJlYWR5ID0gZmFsc2U7XHJcblx0aW1nLnRleHR1cmUgPSBudWxsO1xyXG5cdGltZy50ZXh0dXJlSW5kZXggPSB0ZXh0dXJlSW5kZXg7XHJcblx0aW1nLmlzU29saWQgPSAoaXNTb2xpZCA9PT0gdHJ1ZSk7XHJcblx0aW1nLmltZ051bSA9IHBhcmFtcy5pbWdOdW07XHJcblx0aW1nLnZJbWdOdW0gPSBwYXJhbXMuaW1nVk51bTtcclxuXHRpbWcueE9yaWcgPSBwYXJhbXMueE9yaWc7XHJcblx0aW1nLnlPcmlnID0gcGFyYW1zLnlPcmlnO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGltZywgXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRpbWcuaW1nV2lkdGggPSBpbWcud2lkdGggLyBpbWcuaW1nTnVtO1xyXG5cdFx0aW1nLmltZ0hlaWdodCA9IGltZy5oZWlnaHQgLyBpbWcudkltZ051bTtcclxuXHRcdGltZy5yZWFkeSA9IHRydWU7XHJcblx0XHRcclxuXHRcdGlmIChtYWtlSXRUZXh0dXJlKXtcclxuXHRcdFx0aW1nLnRleHR1cmUgPSBnbC5wYXJzZVRleHR1cmUoaW1nKTtcclxuXHRcdFx0aW1nLnRleHR1cmUudGV4dHVyZUluZGV4ID0gaW1nLnRleHR1cmVJbmRleDtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRnbC5pbWFnZXMucHVzaChpbWcpO1xyXG5cdHJldHVybiBpbWc7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUucGFyc2VUZXh0dXJlID0gZnVuY3Rpb24oaW1nKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBDcmVhdGVzIGEgdGV4dHVyZSBob2xkZXIgdG8gd29yayB3aXRoXHJcblx0dmFyIHRleCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXgpO1xyXG5cdFxyXG5cdC8vIEZsaXAgdmVydGljYWwgdGhlIHRleHR1cmVcclxuXHRnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcclxuXHRcclxuXHQvLyBMb2FkIHRoZSBpbWFnZSBkYXRhXHJcblx0Z2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWcpO1xyXG5cdFxyXG5cdC8vIEFzc2lnbiBwcm9wZXJ0aWVzIG9mIHNjYWxpbmdcclxuXHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xyXG5cdFxyXG5cdC8vIFJlbGVhc2VzIHRoZSB0ZXh0dXJlIGZyb20gdGhlIHdvcmtzcGFjZVxyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xyXG5cdHJldHVybiB0ZXg7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuZHJhd09iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCwgY2FtZXJhLCB0ZXh0dXJlKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSB2ZXJ0aWNlcyBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnZlcnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFWZXJ0ZXhQb3NpdGlvbiwgb2JqZWN0LnZlcnRleEJ1ZmZlci5pdGVtU2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSB0ZXh0dXJlIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QudGV4QnVmZmVyKTtcclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVRleHR1cmVDb29yZCwgb2JqZWN0LnRleEJ1ZmZlci5pdGVtU2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSBkYXJrIGJ1ZmZlciBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRpZiAob2JqZWN0LmRhcmtCdWZmZXIpe1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC5kYXJrQnVmZmVyKTtcclxuXHRcdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4SXNEYXJrLCBvYmplY3QuZGFya0J1ZmZlci5pdGVtU2l6ZSwgZ2wuVU5TSUdORURfQllURSwgZmFsc2UsIDAsIDApO1xyXG5cdH1cclxuXHRcclxuXHQvLyBQYWludCB0aGUgb2JqZWN0IGluIHJlZCAoV2hlbiBodXJ0IGZvciBleGFtcGxlKVxyXG5cdHZhciByZWQgPSAob2JqZWN0LnBhaW50SW5SZWQpPyAxLjAgOiAwLjA7IFxyXG5cdGdsLnVuaWZvcm0xZih0aGlzLnVQYWludEluUmVkLCByZWQpO1xyXG5cdFxyXG5cdC8vIEhvdyBtdWNoIGxpZ2h0IHRoZSBwbGF5ZXIgY2FzdFxyXG5cdHZhciBsaWdodCA9ICh0aGlzLmxpZ2h0ID4gMCk/IDAuMCA6IDEuMDtcclxuXHRnbC51bmlmb3JtMWYodGhpcy51TGlnaHREZXB0aCwgbGlnaHQpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgdGV4dHVyZSB0byB3b3JrIHdpdGhcclxuXHRnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHRnbC51bmlmb3JtMWkodGhpcy51U2FtcGxlciwgMCk7XHJcblx0XHJcblx0Ly8gQ3JlYXRlIHRoZSBwZXJzcGVjdGl2ZSBhbmQgdHJhbnNmb3JtIHRoZSBvYmplY3RcclxuXHR2YXIgdHJhbnNmb3JtYXRpb25NYXRyaXggPSBNYXRyaXgubWFrZVRyYW5zZm9ybShvYmplY3QsIGNhbWVyYSk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgaW5kaWNlcyBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBvYmplY3QuaW5kaWNlc0J1ZmZlcik7XHJcblx0XHJcblx0Ly8gU2V0IHRoZSBwZXJzcGVjdGl2ZSBhbmQgdHJhbnNmb3JtYXRpb24gbWF0cmljZXNcclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHRoaXMudVBlcnNwZWN0aXZlTWF0cml4LCBmYWxzZSwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBlcnNwZWN0aXZlTWF0cml4KSk7XHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVUcmFuc2Zvcm1hdGlvbk1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodHJhbnNmb3JtYXRpb25NYXRyaXgpKTtcclxuXHRcclxuXHRpZiAob2JqZWN0Lm5vUm90YXRlKSBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcblx0XHJcblx0Ly8gRHJhdyB0aGUgdHJpYW5nbGVzXHJcblx0Z2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgb2JqZWN0LmluZGljZXNCdWZmZXIubnVtSXRlbXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuXHRcclxuXHRnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5hcmVJbWFnZXNSZWFkeSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmltYWdlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICghdGhpcy5pbWFnZXNbaV0ucmVhZHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07Il19
