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
		if (tryIfNotReady){ soundFile.timeO = setTimeout(function(){ eng.playSound(soundFile, loop, tryIfNotReady); }, 1000); } 
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
},{"./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Billboard.js":[function(require,module,exports){
var AnimatedTexture = require('./AnimatedTexture');
var ObjectFactory = require('./ObjectFactory');

//TODO: This class is not references anywhere?

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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Enemy.js":[function(require,module,exports){
var AnimatedTexture = require('./AnimatedTexture');
var ObjectFactory = require('./ObjectFactory');
var Utils = require('./Utils');


function Enemy(position, enemy, mapManager){
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
	
	this.visible = true;
}

module.exports = Enemy;

Enemy.prototype.receiveDamage = function(dmg){
	this.hurt = 5.0;
	
	this.enemy.hp -= dmg;
	if (this.enemy.hp <= 0){
		this.mapManager.game.addExperience(this.enemy.stats.exp);
		this.mapManager.addMessage(this.enemy.name + " killed");
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
		var normal = this.mapManager.getWallNormal(fakePos, spd, this.cameraHeight, this.onWater);
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
	if (this.attackWait > 0){
		this.attackWait -= 1;
		return;
	}
	
	var str = Utils.rollDice(this.enemy.stats.str);
	var dfs = Utils.rollDice(this.mapManager.game.player.stats.dfs);
	
	// Check if the player has the protection spell
	if (this.mapManager.game.protection > 0){
		dfs += 15;
	}
	
	var dmg = Math.max(str - dfs, 0);
	
	this.mapManager.addMessage(this.enemy.name + " attacks!");
	
	if (dmg > 0){
		this.mapManager.addMessage(dmg + " damage inflicted");
		player.receiveDamage(dmg);
	}else{
		this.mapManager.addMessage("Blocked!");
	}
	
	this.attackWait = 90;
};

Enemy.prototype.step = function(){
	if (this.target){
		var player = this.mapManager.player;
		if (player.destroyed) return;
		var p = player.position;
		
		var xx = Math.abs(p.a - this.position.a);
		var yy = Math.abs(p.c - this.position.c);
		
		if (xx <= 1 && yy <=1){
			this.attackPlayer(player);
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
		seaSerpent: {name: 'Sea Serpent', hp: 128, textureBase: 'seaSerpent', stats: {str: '3D6', dfs: '2D2', exp: 9, swim: true}}, // not suitable
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
		var ret = {};
		
		for (var i in enemy){
			ret[i] = enemy[i];
		}
		
		return ret;
	}
};

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Inventory.js":[function(require,module,exports){
function Inventory(limitItems){
	this.items = [];
	
	this.limitItems = limitItems;
}

module.exports = Inventory;

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

module.exports = Item;

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
},{"./Billboard":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Billboard.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js":[function(require,module,exports){
module.exports = {
	items: {
		// Items
		yellowPotion: {name: "Yellow potion", tex: "items", subImg: 0, type: 'potion'},
		redPotion: {name: "Red Potion", tex: "items", subImg: 1, type: 'potion'},
		
		// Weapons
		staff: {name: "Staff", tex: "items", subImg: 2, type: 'weapon', str: '4D4', wear: 0.02},
		dagger: {name: "Dagger", tex: "items", subImg: 3, type: 'weapon', str: '3D8', wear: 0.05},
		sling: {name: "Sling", tex: "items", subImg: 4, type: 'weapon', str: '4D8', ranged: true, subItemName: 'rock', wear: 0.04},
		mace: {name: "Mace", tex: "items", subImg: 5, type: 'weapon', str: '10D4', wear: 0.03},
		axe: {name: "Axe", tex: "items", subImg: 6, type: 'weapon', str: '12D4', wear: 0.01},
		sword: {name: "Sword", tex: "items", subImg: 8, type: 'weapon', str: '16D4', wear: 0.008},
		mysticSword: {name: "Mystic Sword", tex: "items", subImg: 9, type: 'weapon', str: '16D16', wear: 0.008},
		bow: {name: "Bow", tex: "items", subImg: 10, type: 'weapon', str: '10D4', ranged: true, subItemName: 'arrow', wear: 0.01},
		crossbow: {name: "Crossbow", tex: "items", subImg: 11, type: 'weapon', str: '16D4', ranged: true, subItemName: 'crossbow bolt', wear: 0.008},
		
		// Armour
		leather: {name: "Leather armour", tex: "items", subImg: 12, type: 'armour', dfs: '18D8', wear: 0.05},
		chain: {name: "Chain mail", tex: "items", subImg: 13, type: 'armour', dfs: '20D8', wear: 0.03},
		plate: {name: "Plate mail", tex: "items", subImg: 14, type: 'armour', dfs: '22D8', wear: 0.015},
		mystic: {name: "Mystic armour", tex: "items", subImg: 15, type: 'armour', dfs: '31D8', wear: 0.008},
		
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
		codex: {name: "Codex of Ultimate Wisdom", tex: "items", subImg: 16, type: 'codex'},
	},
	
	getItemByCode: function(itemCode, status){
		if (!this.items[itemCode]) throw "Invalid Item code: " + itemCode;
		
		var item = this.items[itemCode];
		var ret = {};
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

function MapAssembler(mapManager, mapData, GL){
	this.mapManager =  mapManager;
	this.copiedTiles = [];
	
	this.parseMap(mapData, GL);
				
	this.assembleFloor(mapData, GL);
	this.assembleCeils(mapData, GL);
	this.assembleBlocks(mapData, GL);
	this.assembleSlopes(mapData, GL);
	
	this.parseObjects(mapData);
	
	this.copiedTiles = [];
}

module.exports = MapAssembler;

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
	var ret = {};
	
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
				this.mapManager.player = new Player(vec3(x, y, z), vec3(0.0, o.dir * Math.PI_2, 0.0), this.mapManager);
			break;
			case "item":
				var status = Math.min(0.3 + (Math.random() * 0.7), 1.0);
				var item = ItemFactory.getItemByCode(o.item, status);
				this.mapManager.instances.push(new Item(vec3(x, y, z), item, this.mapManager));
			break;
			case "enemy":
				var enemy = EnemyFactory.getEnemy(o.enemy);
				this.mapManager.instances.push(new Enemy(vec3(x, y, z), enemy, this.mapManager));
			break;
			case "stairs":
				this.mapManager.instances.push(new Stairs(vec3(x, y, z), this.mapManager, o.dir));
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

function MapManager(game, map, depth){
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
}

module.exports = MapManager;

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
	var generatedLevel = generator.generateLevel(depth);
	
	var mapM = this;
	try{
		window.generatedLevel = (generatedLevel.level);
		var mapData = kramgineExporter.getLevel(generatedLevel.level);
		window.mapData = (mapData);
		new MapAssembler(mapM, mapData, mapM.game.GL.ctx);
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
				
				new MapAssembler(mapM, mapData, mapM.game.GL.ctx);
				
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
				this.orderInstances.splice(j,0,{ins: ins, dist: dist});
				added = true;
				j = jlen;
			}
		}
		
		if (!added){
			this.orderInstances.push({ins: ins, dist: dist});
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

module.exports = Missile;

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
		
		dfs = Utils.rollDice(ins.enemy.stats.dfs);
	}else{
		ins = this.mapManager.player;
		dfs = Utils.rollDice(this.mapManager.game.player.stats.dfs);
	}
	
	var dmg = Math.max(this.str - dfs, 0);
	
	if (this.missed){
		this.mapManager.addMessage("Missed!");
		this.mapManager.game.playSound('miss');
		return;
	}
	
	if (dmg != 0){
		this.mapManager.addMessage(dmg + " points inflicted");
		this.mapManager.game.playSound('hit');
		ins.receiveDamage(dmg);
	}else{
		this.mapManager.addMessage("Blocked!");
		this.mapManager.game.playSound('miss');
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
}

module.exports = Player;

Player.prototype.receiveDamage = function(dmg){
	var game = this.mapManager.game;
	
	game.playSound('hit');
	this.hurt = 5.0;
	var player = game.player;
	player.hp -= dmg;
	if (player.hp <= 0){
		player.hp = 0;
		this.mapManager.addMessage("You died!");
		this.destroyed = true;
	}
};

Player.prototype.castMissile = function(weapon){
	var game = this.mapManager.game;
	var ps = game.player;
	
	var str = Utils.rollDice(ps.stats.str);
	if (weapon) str += Utils.rollDice(weapon.str) * weapon.status;
	
	var prob = Math.random();
	var missile = new Missile(this.position.clone(), this.rotation.clone(), weapon.code, 'enemy', this.mapManager);
	missile.str = str << 0;
	missile.missed = (prob > ps.stats.dex);
	// if (weapon) weapon.status *= (1.0 - weapon.wear);
	
	
	this.mapManager.addMessage("You shoot " + weapon.subItemName);
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
			this.attackWait = 30;
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
		this.mapManager.addMessage("Missed!");
		return;
	}
	
	var str = Utils.rollDice(ps.stats.str);
	//var dfs = Utils.rollDice(target.enemy.stats.dfs);
	var dfs = 0;
	
	if (weapon) str += Utils.rollDice(weapon.str) * weapon.status;
	
	var dmg = Math.max(str - dfs, 0) << 0;
	
	this.mapManager.addMessage("Attacking " + target.enemy.name);
	
	if (dmg > 0){
		game.playSound('hit');
		this.mapManager.addMessage(dmg + " points inflicted");
		target.receiveDamage(dmg);
	}else{
		this.mapManager.addMessage("Blocked!");
	}
	
	//if (weapon) weapon.status *= (1.0 - weapon.wear);
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
	if (swim){ xTo /= 2; zTo /=2; }
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
		
		if ((this.position.a << 0) == xx && (this.position.c << 0) == zz) return;
		
		var door = this.mapManager.getDoorAt(xx, this.position.b, zz);
		if (door){ 
			door.activate();
		}else{
			var object = this.mapManager.getInstanceAtGrid(vec3(xx, this.position.b, zz));
			if (object && object.activate)
				object.activate();
		}
		if (cheatEnabled){
			if (game.floorDepth < 8)
				this.mapManager.game.loadMap(false, game.floorDepth + 1);
			else
				this.mapManager.game.loadMap('codexRoom');
		}
	}else if ((game.getMouseButtonPressed() || game.getKeyPressed(13)) && this.attackWait == 0){	// Melee attack, Enter
		var weapon = game.inventory.getWeapon();
		
		if (!weapon || !weapon.ranged){ 
			this.meleeAttack(weapon);
		}else if (weapon && weapon.ranged){
			this.castMissile(weapon);
		}
		
		if (weapon && weapon.status < 0.05){
			this.mapManager.game.inventory.destroyItem(weapon);
			this.mapManager.addMessage(weapon.name + " damaged!");
		}
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
	
	this.moved = false;
	this.step();
};

},{"./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\PlayerStats.js":[function(require,module,exports){
function PlayerStats(){
	this.hp = 0;
	this.mHP = 0;
	this.mana = 0;
	this.mMana = 0;
	
	this.virtue = null;
	
	this.lvl = 1;
	this.exp = 0;
	
	this.poisoned = false;
	
	this.stats = {
		str: '0D0',
		dfs: '0D0',
		dex: 0,
		magicPower: '0D0'
	};
}

module.exports = PlayerStats;

PlayerStats.prototype.reset = function(){
	this.hp = 0;
	this.mHP = 0;
	this.mana = 0;
	this.mMana = 0;
	
	this.virtue = null;
	
	this.lvl = 1;
	this.exp = 0;
	
	this.stats = {
		str: '0D0',
		dfs: '0D0',
		dex: 0,
		magicPower: '0D0'
	};
};

PlayerStats.prototype.addExperience = function(amount, console){
	this.exp += amount;
	
	console.addSFMessage(amount + " XP gained");
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SelectClass.js":[function(require,module,exports){
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

function Stairs(position, mapManager, direction){
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

module.exports = Stairs;

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

},{"./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\TitleScreen.js":[function(require,module,exports){
var SelectClass = require('./SelectClass');

function TitleScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
}

module.exports = TitleScreen;

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		this.game.scene = new SelectClass(this.game);
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	var ui = this.game.getUI();
	ui.drawImage(this.game.images.titleScreen, 0, 0);
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
var TitleScreen = require('./TitleScreen');
var UI = require('./UI');
var Utils = require('./Utils');
var WebGL = require('./WebGL');

/*===================================================
				 7DRL15 Source Code
				
			By Camilo Ramírez (Jucarave)
			
					  2015
===================================================*/

function Underworld(){
	this.size = vec2(355, 200);
	
	this.GL = new WebGL(this.size, Utils.$$("divGame"));
	this.UI = new UI(this.size, Utils.$$("divGame"));
	this.audio = new AudioAPI();
	
	this.player = new PlayerStats();
	this.inventory = new Inventory(10);
	this.console = new Console(10, 10, 300, this);
	this.font = '10px "Courier"';
	
	this.grPack = 'img_hr/';
	
	this.scene = null;
	this.map = null;
	this.maps = [];
	this.keys = [];
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
	this.music.dungeon1 = this.audio.loadAudio(cp + "ogg/08_-_Ultima_4_-_C64_-_Dungeons.ogg?version=" + version, true);
	this.music.dungeon2 = this.audio.loadAudio(cp + "ogg/12_-_Ultima_5_-_C64_-_Lord_Blackthorn.ogg?version=" + version, true);
	this.music.dungeon3 = this.audio.loadAudio(cp + "ogg/05_-_Ultima_3_-_C64_-_Combat.ogg?version=" + version, true);
	this.music.dungeon4 = this.audio.loadAudio(cp + "ogg/07_-_Ultima_3_-_C64_-_Exodus'_Castle.ogg?version=" + version, true);
	this.music.dungeon5 = this.audio.loadAudio(cp + "ogg/04_-_Ultima_5_-_C64_-_Engagement_and_Melee.ogg?version=" + version, true);
	this.music.dungeon6 = this.audio.loadAudio(cp + "ogg/03_-_Ultima_4_-_C64_-_Lord_British's_Castle.ogg?version=" + version, true);
	this.music.dungeon7 = this.audio.loadAudio(cp + "ogg/11_-_Ultima_5_-_C64_-_Worlds_Below.ogg?version=" + version, true);
	this.music.dungeon8 = this.audio.loadAudio(cp + "ogg/10_-_Ultima_5_-_C64_-_Halls_of_Doom.ogg?version=" + version, true);
	this.music.codexRoom = this.audio.loadAudio(cp + "ogg/07_-_Ultima_4_-_C64_-_Shrines.ogg?version=" + version, true);
};

Underworld.prototype.loadImages = function(){
	this.images.items_ui = this.GL.loadImage(cp + this.grPack + "itemsUI.png?version=" + version, false, 0, 0, {imgNum: 8, imgVNum: 2});
	this.images.spells_ui = this.GL.loadImage(cp + this.grPack + "spellsUI.png?version=" + version, false, 0, 0, {imgNum: 4, imgVNum: 4});
	this.images.titleScreen = this.GL.loadImage(cp + this.grPack + "titleScreen.png?version=" + version, false);
	this.images.endingScreen = this.GL.loadImage(cp + this.grPack + "ending.png?version=" + version, false);
	this.images.selectClass = this.GL.loadImage(cp + this.grPack + "selectClass.png?version=" + version, false);
	this.images.inventory = this.GL.loadImage(cp + this.grPack + "inventory.png?version=" + version, false, 0, 0, {imgNum: 1, imgVNum: 2});
	this.images.inventoryDrop = this.GL.loadImage(cp + this.grPack + "inventoryDrop.png?version=" + version, false, 0, 0, {imgNum: 1, imgVNum: 2});
	this.images.inventorySelected = this.GL.loadImage(cp + this.grPack + "inventory_selected.png?version=" + version, false);
	this.images.scrollFont = this.GL.loadImage(cp + this.grPack + "scrollFontWhite.png?version=" + version, false);
	this.images.restart = this.GL.loadImage(cp + this.grPack + "restart.png?version=" + version, false);
	this.images.paused = this.GL.loadImage(cp + this.grPack + "paused.png?version=" + version, false);
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
	this.objectTex.items.buffers = AnimatedTexture.getTextureBufferCoords(8, 4, this.GL.ctx);
	
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
	this.console.createSpriteFont(this.images.scrollFont, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?,./", 6);
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
		game.map = new MapManager(game, map, depth);
		game.floorDepth = depth;
		game.maps.push(game.map);
	}else if (game.maps[depth - 1]){
		game.map = game.maps[depth - 1];
	}
	game.scene = null;
	if (depth)
		game.playMusic('dungeon'+depth, false);
	else if (map === 'codexRoom')
		game.playMusic('codexRoom', false);
};

Underworld.prototype.printGreet = function(){
	this.console.messages = [];
	
	// Shows a welcome message with the game instructions.
	this.console.addSFMessage("You enter the legendary Stygian Abyss.");
	this.console.addSFMessage("Use Q-W-E to move forward, A-S-D to strafe and step back");
	this.console.addSFMessage("Press Space bar to interact and Enter to attack");
	this.console.addSFMessage("Press T to drop objects");
};

Underworld.prototype.newGame = function(){
	this.inventory.reset();
	this.player.reset();
	
	this.maps = [];
	this.map = null;
	this.scene = null;
	
	this.printGreet();
		
	this.scene = new TitleScreen(this);
	this.loop();
};

Underworld.prototype.loadGame = function(){
	var game = this;
	
	if (game.GL.areImagesReady()){
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
	ctx.fillRect(8,8,80,4);
	ctx.fillStyle = (ps.poisoned)? "rgb(200,0,200)" : "rgb(200,0,0)";
	ctx.fillRect(8,8,(80 * hp) << 0,4);
	
	// Draw mana
	var mana = ps.mana / ps.mMana;
	ctx.fillStyle = "rgb(181,98,20)";
	ctx.fillRect(8,16,60,2);
	ctx.fillStyle = "rgb(255,138,28)";
	ctx.fillRect(8,16,(60 * mana) << 0,2);
	
	// Draw Inventory
	if (this.setDropItem)
		this.UI.drawSprite(this.images.inventoryDrop, 110, 6, 0);
	else
		this.UI.drawSprite(this.images.inventory, 110, 6, 0);
	
	for (var i=0,len=this.inventory.items.length;i<len;i++){
		var item = this.inventory.items[i];
		var spr = item.tex + '_ui';

		if (!this.setDropItem && (item.type == 'weapon' || item.type == 'armour') && item.equipped)
			this.UI.drawSprite(this.images.inventorySelected, 110 + (22 * i), 6, 0);		
		this.UI.drawSprite(this.images[spr], 113 + (22 * i), 9, item.subImg);
	}
	this.UI.drawSprite(this.images.inventory, 110, 6, 1);
	
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
	this.UI.drawText('Level '+this.floorDepth, 10,24,this.console);
	this.UI.drawText(this.player.className, 10,31,this.console);
	this.UI.drawText('HP: '+ps.hp, 10,9,this.console);
	this.UI.drawText('Mana:'+ps.mana, 10,17,this.console);
	
	game.console.render(8, 130);
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
		this.inventory.items.push(ItemFactory.getItemByCode('bow', 0.6));
		break;
	case 'Bard': case 'Tinker':
		this.inventory.items.push(ItemFactory.getItemByCode('sling', 0.7));
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
			}else{
				this.console.addSFMessage("AN NOX...");
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
			
			var missile = new Missile(p.position.clone(), p.rotation.clone(), 'magicMissile', 'enemy', this.map);
			missile.str = str << 0;
			
			this.map.addMessage("GRAV POR!");
			this.map.instances.push(missile);
			
			p.attackWait = 30;
		break;
		
		case 'iceball':
			var str = Utils.rollDice(ps.stats.magicPower) + Utils.rollDice(item.str);
			
			var missile = new Missile(p.position.clone(), p.rotation.clone(), 'iceBall', 'enemy', this.map);
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
			
			var missile = new Missile(p.position.clone(), p.rotation.clone(), 'fireBall', 'enemy', this.map);
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
			
			var missile = new Missile(p.position.clone(), p.rotation.clone(), 'kill', 'enemy', this.map);
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
		this.console.addSFMessage('Can not drop it here');
		this.setDropItem = false;
	}else{
		this.console.addSFMessage(item.name + ' dropped');
		cleanPos.a += 0.5;
		cleanPos.c += 0.5;
		
		var nIt = new Item(cleanPos, null, this.map);
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
				this.console.addSFMessage(item.name + ' wore');
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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js","./Audio":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Audio.js","./Console":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Console.js","./Inventory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Inventory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./MapManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapManager.js","./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./PlayerStats":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\PlayerStats.js","./TitleScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\TitleScreen.js","./UI":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\UI.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js","./WebGL":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\WebGL.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js":[function(require,module,exports){
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
	
	var gl = this;
	var img = new Image();
	
	img.src = src;
	img.ready = false;
	img.texture = null;
	img.textureIndex = textureIndex;
	img.isSolid = (isSolid === true);
	img.imgNum = params.imgNum;
	img.vImgNum = params.imgVNum;
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZW15LmpzIiwianNcXEVuZW15RmFjdG9yeS5qcyIsImpzXFxJbnZlbnRvcnkuanMiLCJqc1xcSXRlbS5qcyIsImpzXFxJdGVtRmFjdG9yeS5qcyIsImpzXFxNYXBBc3NlbWJsZXIuanMiLCJqc1xcTWFwTWFuYWdlci5qcyIsImpzXFxNYXRyaXguanMiLCJqc1xcTWlzc2lsZS5qcyIsImpzXFxPYmplY3RGYWN0b3J5LmpzIiwianNcXFBsYXllci5qcyIsImpzXFxQbGF5ZXJTdGF0cy5qcyIsImpzXFxTZWxlY3RDbGFzcy5qcyIsImpzXFxTdGFpcnMuanMiLCJqc1xcVGl0bGVTY3JlZW4uanMiLCJqc1xcVUkuanMiLCJqc1xcVW5kZXJ3b3JsZC5qcyIsImpzXFxVdGlscy5qcyIsImpzXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNod0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XzFGcmFtZTogW10sXHJcblx0XzJGcmFtZXM6IFtdLFxyXG5cdF8zRnJhbWVzOiBbXSxcclxuXHRfNEZyYW1lczogW10sXHJcblx0aXRlbUNvb3JkczogW10sXHJcblx0XHJcblx0aW5pdDogZnVuY3Rpb24oZ2wpe1xyXG5cdFx0Ly8gMSBGcmFtZVxyXG5cdFx0dmFyIGNvb3JkcyA9IFsxLjAsMS4wLDAuMCwxLjAsMS4wLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzFGcmFtZS5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRcclxuXHRcdC8vIDIgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMDAsMS4wMCwwLjUwLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0Y29vcmRzID0gWzEuMDAsMS4wMCwwLjUwLDEuMDAsMS4wMCwwLjAwLDAuNTAsMC4wMF07XHJcblx0XHR0aGlzLl8yRnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMyBGcmFtZXMsIDQgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC4yNSwxLjAwLDAuMDAsMS4wMCwwLjI1LDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMjUsMS4wMCwwLjUwLDAuMDAsMC4yNSwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC43NSwxLjAwLDAuNTAsMS4wMCwwLjc1LDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNzUsMS4wMCwxLjAwLDAuMDAsMC43NSwwLjAwXTtcclxuXHRcdHRoaXMuXzRGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdH0sXHJcblx0XHJcblx0cHJlcGFyZUJ1ZmZlcjogZnVuY3Rpb24oY29vcmRzLCBnbCl7XHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGNvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGNvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGV4QnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0QnlOdW1GcmFtZXM6IGZ1bmN0aW9uKG51bUZyYW1lcyl7XHJcblx0XHRpZiAobnVtRnJhbWVzID09IDEpIHJldHVybiB0aGlzLl8xRnJhbWU7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMikgcmV0dXJuIHRoaXMuXzJGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMykgcmV0dXJuIHRoaXMuXzNGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gNCkgcmV0dXJuIHRoaXMuXzRGcmFtZXM7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUZXh0dXJlQnVmZmVyQ29vcmRzOiBmdW5jdGlvbih4SW1nTnVtLCB5SW1nTnVtLCBnbCl7XHJcblx0XHR2YXIgcmV0ID0gW107XHJcblx0XHR2YXIgd2lkdGggPSAxIC8geEltZ051bTtcclxuXHRcdHZhciBoZWlnaHQgPSAxIC8geUltZ051bTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaT0wO2k8eUltZ051bTtpKyspe1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajx4SW1nTnVtO2orKyl7XHJcblx0XHRcdFx0dmFyIHgxID0gaiAqIHdpZHRoO1xyXG5cdFx0XHRcdHZhciB5MSA9IDEgLSBpICogaGVpZ2h0IC0gaGVpZ2h0O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB4MiA9IHgxICsgd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkyID0geTEgKyBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGNvb3JkcyA9IFt4Mix5Mix4MSx5Mix4Mix5MSx4MSx5MV07XHJcblx0XHRcdFx0cmV0LnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5mdW5jdGlvbiBBdWRpb0FQSSgpe1xyXG5cdHRoaXMuX2F1ZGlvID0gW107XHJcblx0XHJcblx0dGhpcy5hdWRpb0N0eCA9IG51bGw7XHJcblx0dGhpcy5nYWluTm9kZSA9IG51bGw7XHJcblx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuaW5pdEF1ZGlvRW5naW5lKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXVkaW9BUEk7XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuaW5pdEF1ZGlvRW5naW5lID0gZnVuY3Rpb24oKXtcclxuXHRpZiAod2luZG93LkF1ZGlvQ29udGV4dCl7XHJcblx0XHR0aGlzLmF1ZGlvQ3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdFx0dGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdH1lbHNlXHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhlIEF1ZGlvIEFQSVwiKTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5sb2FkQXVkaW8gPSBmdW5jdGlvbih1cmwsIGlzTXVzaWMpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghZW5nLmF1ZGlvQ3R4KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR2YXIgYXVkaW8gPSB7YnVmZmVyOiBudWxsLCBzb3VyY2U6IG51bGwsIHJlYWR5OiBmYWxzZSwgaXNNdXNpYzogaXNNdXNpYywgcGF1c2VkQXQ6IDB9O1xyXG5cdFxyXG5cdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuXHRodHRwLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcblx0XHJcblx0aHR0cC5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0ZW5nLmF1ZGlvQ3R4LmRlY29kZUF1ZGlvRGF0YShodHRwLnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpe1xyXG5cdFx0XHRhdWRpby5idWZmZXIgPSBidWZmZXI7XHJcblx0XHRcdGF1ZGlvLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdH0sIGZ1bmN0aW9uKG1zZyl7XHJcblx0XHRcdGFsZXJ0KG1zZyk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdGh0dHAuc2VuZCgpO1xyXG5cdFxyXG5cdHRoaXMuX2F1ZGlvLnB1c2goYXVkaW8pO1xyXG5cdFxyXG5cdHJldHVybiBhdWRpbztcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGF1ZGlvLnRpbWVPKXtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KGF1ZGlvLnRpbWVPKTtcclxuXHRcdH1lbHNlIGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSwgdm9sdW1lKXtcclxuXHR2YXIgZW5nID0gdGhpcztcclxuXHRpZiAoIXNvdW5kRmlsZSB8fCAhc291bmRGaWxlLnJlYWR5KXtcclxuXHRcdGlmICh0cnlJZk5vdFJlYWR5KXsgc291bmRGaWxlLnRpbWVPID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBlbmcucGxheVNvdW5kKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSk7IH0sIDEwMDApOyB9IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpIHRoaXMuc3RvcE11c2ljKCk7XHJcblx0XHJcblx0c291bmRGaWxlLnRpbWVPID0gbnVsbDtcclxuXHRzb3VuZEZpbGUucGxheWluZyA9IHRydWU7XHJcblx0IFxyXG5cdHZhciBzb3VyY2UgPSBlbmcuYXVkaW9DdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcblx0c291cmNlLmJ1ZmZlciA9IHNvdW5kRmlsZS5idWZmZXI7XHJcblx0XHJcblx0dmFyIGdhaW5Ob2RlO1xyXG5cdGlmICh2b2x1bWUgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRnYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdFx0Z2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZvbHVtZTtcclxuXHRcdHNvdW5kRmlsZS52b2x1bWUgPSB2b2x1bWU7XHJcblx0fWVsc2V7XHJcblx0XHRnYWluTm9kZSA9IGVuZy5nYWluTm9kZTtcclxuXHR9XHJcblx0XHJcblx0c291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xyXG5cdGdhaW5Ob2RlLmNvbm5lY3QoZW5nLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCkgLSBzb3VuZEZpbGUucGF1c2VkQXQ7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCwgKHNvdW5kRmlsZS5wYXVzZWRBdCAvIDEwMDApICUgc291bmRGaWxlLmJ1ZmZlci5kdXJhdGlvbik7XHJcblx0XHRzb3VuZEZpbGUucGF1c2VkQXQgPSAwO1xyXG5cdH1lbHNle1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCk7XHJcblx0fVxyXG5cdHNvdXJjZS5sb29wID0gbG9vcDtcclxuXHRzb3VyY2UubG9vcGluZyA9IGxvb3A7XHJcblx0c291cmNlLm9uZW5kZWQgPSBmdW5jdGlvbigpeyBzb3VuZEZpbGUucGxheWluZyA9IGZhbHNlOyB9O1xyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUuaXNNdXNpYylcclxuXHRcdHNvdW5kRmlsZS5zb3VyY2UgPSBzb3VyY2U7XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGF1c2VNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRhdWRpby5wYXVzZWRBdCA9IDA7XHJcblx0XHRpZiAoYXVkaW8uaXNNdXNpYyAmJiBhdWRpby5zb3VyY2Upe1xyXG5cdFx0XHRhdWRpby53YXNQbGF5aW5nID0gYXVkaW8ucGxheWluZztcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8ucGF1c2VkQXQgPSAoRGF0ZS5ub3coKSAtIGF1ZGlvLnN0YXJ0ZWRBdCk7XHJcblx0XHRcdGF1ZGlvLnJlc3RvcmVMb29wID0gYXVkaW8uc291cmNlLmxvb3A7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnJlc3RvcmVNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWF1ZGlvLmxvb3BpbmcgJiYgIWF1ZGlvLndhc1BsYXlpbmcpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlICYmIGF1ZGlvLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0XHRhdWRpby5zb3VyY2UgPSBudWxsO1xyXG5cdFx0XHR0aGlzLnBsYXlTb3VuZChhdWRpbywgYXVkaW8ucmVzdG9yZUxvb3AsIHRydWUsIGF1ZGlvLnZvbHVtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy5tdXRlZCl7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5tdXRlZCA9IHRydWU7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxO1xyXG5cdH1cclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbi8vVE9ETzogVGhpcyBjbGFzcyBpcyBub3QgcmVmZXJlbmNlcyBhbnl3aGVyZT9cclxuXHJcbmZ1bmN0aW9uIEJpbGxib2FyZChwb3NpdGlvbiwgdGV4dHVyZUNvZGUsIG1hcE1hbmFnZXIsIHBhcmFtcyl7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb29yZHMgPSBudWxsO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMTtcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuYWN0aW9ucyA9IG51bGw7XHJcblx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHJcblx0aWYgKHBhcmFtcykgdGhpcy5wYXJzZVBhcmFtcyhwYXJhbXMpO1xyXG5cdGlmICh0ZXh0dXJlQ29kZSA9PSBcIm5vbmVcIikgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmlsbGJvYXJkO1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5wYXJzZVBhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcyl7XHJcblx0Zm9yICh2YXIgaSBpbiBwYXJhbXMpe1xyXG5cdFx0dmFyIHAgPSBwYXJhbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpID09IFwibmZcIil7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBwO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMocCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImlzXCIpeyAvLyBJbWFnZSBzcGVlZFxyXG5cdFx0XHR0aGlzLmltZ1NwZCA9IHA7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImNiXCIpeyAvLyBDdXN0b20gYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQocCwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImFjXCIpeyAvLyBBY3Rpb25zXHJcblx0XHRcdHRoaXMuYWN0aW9ucyA9IHA7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmFjdGlvbnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYWMgPSB0aGlzLmFjdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdGlmIChhYyA9PSBcInR2XCIpeyAvLyBUb29nbGUgdmlzaWJpbGl0eVxyXG5cdFx0XHR0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjdF9cIikgPT0gMCl7IC8vIENoYW5nZSB0ZXh0dXJlXHJcblx0XHRcdHRoaXMudGV4dHVyZUNvZGUgPSBhYy5yZXBsYWNlKFwiY3RfXCIsIFwiXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJuZl9cIikgPT0gMCl7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dmFyIG5mID0gcGFyc2VJbnQoYWMucmVwbGFjZShcIm5mX1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubnVtRnJhbWVzID0gbmY7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhuZik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY2ZfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciBmcmFtZXMgPSBhYy5yZXBsYWNlKFwiY2ZfXCIsXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IHBhcnNlSW50KGZyYW1lc1t0aGlzLmNpcmNsZUZyYW1lSW5kZXhdLCAxMCk7XHJcblx0XHRcdGlmICh0aGlzLmNpcmNsZUZyYW1lSW5kZXgrKyA+PSBmcmFtZXMubGVuZ3RoLTEpIHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN3X1wiKSA9PSAwKXsgLy8gQ2lyY2xlIGZyYW1lc1xyXG5cdFx0XHR2YXIgdGV4dHVyZUlkID0gcGFyc2VJbnQoYWMucmVwbGFjZShcImN3X1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5jaGFuZ2VXYWxsVGV4dHVyZSh0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdGV4dHVyZUlkKTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwidWRfXCIpID09IDApeyAvLyBVbmxvY2sgZG9vclxyXG5cdFx0XHR2YXIgcG9zID0gYWMucmVwbGFjZShcInVkX1wiLCBcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdChwYXJzZUludChwb3NbMF0sIDEwKSwgcGFyc2VJbnQocG9zWzFdLCAxMCksIHBhcnNlSW50KHBvc1syXSwgMTApKTtcclxuXHRcdFx0aWYgKGRvb3IpeyBcclxuXHRcdFx0XHRkb29yLmxvY2sgPSBudWxsO1xyXG5cdFx0XHRcdGRvb3IuYWN0aXZhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGFjID09IFwiZGVzdHJveVwiKXsgLy8gRGVzdHJveSB0aGUgYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIENvbnNvbGUoLypJbnQqLyBtYXhNZXNzYWdlcywgLypJbnQqLyBsaW1pdCwgLypJbnQqLyBzcGxpdEF0LCAgLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdHRoaXMubWF4TWVzc2FnZXMgPSBtYXhNZXNzYWdlcztcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMubGltaXQgPSBsaW1pdDtcclxuXHR0aGlzLnNwbGl0QXQgPSBzcGxpdEF0O1xyXG5cdFxyXG5cdHRoaXMuc3ByaXRlRm9udCA9IG51bGw7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zZkNvbnRleHQgPSBudWxsO1xyXG5cdHRoaXMuc3BhY2VDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUxpbmVzID0gbnVsbDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlO1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oLypJbnQqLyB4LCAvKkludCovIHkpe1xyXG5cdHZhciBzID0gdGhpcy5tZXNzYWdlcy5sZW5ndGggLSAxO1xyXG5cdHZhciBjdHggPSB0aGlzLmdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdGN0eC5kcmF3SW1hZ2UodGhpcy5zZkNvbnRleHQuY2FudmFzLCB4LCB5KTtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZUZvbnQgPSBmdW5jdGlvbigvKkltYWdlKi8gc3ByaXRlRm9udCwgLypTdHJpbmcqLyBjaGFyYWN0ZXJzVXNlZCwgLypJbnQqLyB2ZXJ0aWNhbFNwYWNlKXtcclxuXHR0aGlzLnNwcml0ZUZvbnQgPSBzcHJpdGVGb250O1xyXG5cdHRoaXMubGlzdE9mQ2hhcnMgPSBjaGFyYWN0ZXJzVXNlZDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSB2ZXJ0aWNhbFNwYWNlO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwMDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLnNmQ29udGV4dC5jYW52YXMgPSBjYW52YXM7XHJcblx0XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gc3ByaXRlRm9udC53aWR0aCAvIGNoYXJhY3RlcnNVc2VkLmxlbmd0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmZvcm1hdFRleHQgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciB0eHQgPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcclxuXHR2YXIgbGluZSA9IFwiXCI7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dHh0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIHdvcmQgPSB0eHRbaV07XHJcblx0XHRpZiAoKGxpbmUgKyBcIiBcIiArIHdvcmQpLmxlbmd0aCA8PSB0aGlzLnNwbGl0QXQpe1xyXG5cdFx0XHRpZiAobGluZSAhPSBcIlwiKSBsaW5lICs9IFwiIFwiO1xyXG5cdFx0XHRsaW5lICs9IHdvcmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0LnB1c2gobGluZSk7XHJcblx0XHRcdGxpbmUgPSB3b3JkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXQucHVzaChsaW5lKTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuYWRkU0ZNZXNzYWdlID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgbXNnID0gdGhpcy5mb3JtYXRUZXh0KG1lc3NhZ2UpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49bXNnLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1zZ1tpXSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubGltaXQpe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5zcGxpY2UoMCwxKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGMgPSB0aGlzLnNmQ29udGV4dC5jYW52YXM7XHJcblx0dmFyIHcgPSB0aGlzLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSB0aGlzLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdHRoaXMuc2ZDb250ZXh0LmNsZWFyUmVjdCgwLDAsYy53aWR0aCxjLmhlaWdodCk7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm1lc3NhZ2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG1zZyA9IHRoaXMubWVzc2FnZXNbaV07XHJcblx0XHR2YXIgeCA9IDA7XHJcblx0XHR2YXIgeSA9ICh0aGlzLnNwYWNlTGluZXMgKiB0aGlzLmxpbWl0KSAtIHRoaXMuc3BhY2VMaW5lcyAqIChsZW4gLSBpIC0gMSk7XHJcblx0XHRcclxuXHRcdHZhciBtVyA9IG1zZy5sZW5ndGggKiB3O1xyXG5cdFx0aWYgKG1XID4gYy53aWR0aCkgYy53aWR0aCA9IG1XICsgKDIgKiB3KTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49bXNnLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0dmFyIGNoYXJhID0gbXNnLmNoYXJBdChqKTtcclxuXHRcdFx0dmFyIGluZCA9IHRoaXMubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0XHR0aGlzLnNmQ29udGV4dC5kcmF3SW1hZ2UodGhpcy5zcHJpdGVGb250LFxyXG5cdFx0XHRcdFx0dyAqIGluZCwgMCwgdywgaCxcclxuXHRcdFx0XHRcdHgsIHksIHcsIGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR4ICs9IHc7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBEb29yKG1hcE1hbmFnZXIsIHdhbGxQb3NpdGlvbiwgZGlyLCB0ZXh0dXJlQ29kZSwgd2FsbFRleHR1cmUsIGxvY2spe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy53YWxsUG9zaXRpb24gPSB3YWxsUG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IDA7XHJcblx0dGhpcy5kaXIgPSBkaXI7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMuclRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7IC8vIERlbGV0ZVxyXG5cclxuXHR0aGlzLmRvb3JQb3NpdGlvbiA9IHdhbGxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cdHRoaXMud2FsbFRleHR1cmUgPSB3YWxsVGV4dHVyZTtcclxuXHRcdFxyXG5cdHRoaXMuYm91bmRpbmdCb3ggPSBudWxsO1xyXG5cdHRoaXMucG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHRpZiAoZGlyID09IFwiSFwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygtMC4yNSwgMC4wLCAwLjApKTsgfWVsc2VcclxuXHRpZiAoZGlyID09IFwiVlwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygwLjAsIDAuMCwgLTAuMjUpKTsgdGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjsgfVxyXG5cdFxyXG5cdHRoaXMubG9jayA9IGxvY2s7XHJcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xyXG5cdHRoaXMuYW5pbWF0aW9uID0gIDA7XHJcblx0dGhpcy5vcGVuU3BlZWQgPSBNYXRoLmRlZ1RvUmFkKDEwKTtcclxuXHRcclxuXHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERvb3I7XHJcblxyXG5Eb29yLnByb3RvdHlwZS5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuYm91bmRpbmdCb3g7XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5sb2NrKXtcclxuXHRcdHZhciBrZXkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0UGxheWVySXRlbSh0aGlzLmxvY2spO1xyXG5cdFx0aWYgKGtleSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGtleS5uYW1lICsgXCIgdXNlZFwiKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLnJlbW92ZVBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdFx0dGhpcy5sb2NrID0gbnVsbDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkxvY2tlZFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5jbG9zZWQpIHRoaXMuYW5pbWF0aW9uID0gMTtcclxuXHRlbHNlIHRoaXMuYW5pbWF0aW9uID0gMjsgXHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gIT0gMCkgcmV0dXJuIHRydWU7XHJcblx0cmV0dXJuIHRoaXMuY2xvc2VkO1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubW9kaWZ5Q29sbGlzaW9uID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kaXIgPT0gXCJIXCIpe1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSAtIDAuMDUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuMSwgaDogMC41XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fWVsc2V7XHJcblx0XHRpZiAodGhpcy5jbG9zZWQpe1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSAtIDAuMDUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgYW4xID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMiAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdHZhciBhbjIgPSAoKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJIXCIpIHx8ICh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiVlwiKSk7XHJcblx0XHJcblx0aWYgKGFuMSAmJiB0aGlzLnJvdGF0aW9uIDwgTWF0aC5QSV8yKXtcclxuXHRcdHRoaXMucm90YXRpb24gKz0gdGhpcy5vcGVuU3BlZWQ7XHJcblx0XHRpZiAodGhpcy5yb3RhdGlvbiA+PSBNYXRoLlBJXzIpe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gTWF0aC5QSV8yO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIlZcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKGFuMiAmJiB0aGlzLnJvdGF0aW9uID4gMCl7XHJcblx0XHR0aGlzLnJvdGF0aW9uIC09IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPD0gMCl7XHJcblx0XHRcdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIkhcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIEVuZW15KHBvc2l0aW9uLCBlbmVteSwgbWFwTWFuYWdlcil7XHJcblx0aWYgKGVuZW15LnN3aW0pIHBvc2l0aW9uLmIgLT0gMC4yO1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnRleHR1cmVCYXNlID0gZW5lbXkudGV4dHVyZUJhc2U7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHRcclxuXHR0aGlzLmFuaW1hdGlvbiA9IFwicnVuXCI7XHJcblx0dGhpcy5lbmVteSA9IGVuZW15O1xyXG5cdHRoaXMudGFyZ2V0ID0gZmFsc2U7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMoMik7XHJcblx0dGhpcy5udW1GcmFtZXMgPSAyO1xyXG5cdHRoaXMuaW1nU3BkID0gMS83O1xyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuaHVydCA9IDAuMDtcclxuXHR0aGlzLnRhcmdldFkgPSBwb3NpdGlvbi5iO1xyXG5cdHRoaXMuc29saWQgPSB0cnVlO1xyXG5cdHRoaXMuc2xlZXAgPSAwO1xyXG5cdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDAuMDtcclxuXHRcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLnJlY2VpdmVEYW1hZ2UgPSBmdW5jdGlvbihkbWcpe1xyXG5cdHRoaXMuaHVydCA9IDUuMDtcclxuXHRcclxuXHR0aGlzLmVuZW15LmhwIC09IGRtZztcclxuXHRpZiAodGhpcy5lbmVteS5ocCA8PSAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmFkZEV4cGVyaWVuY2UodGhpcy5lbmVteS5zdGF0cy5leHApO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIga2lsbGVkXCIpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29rRm9yID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAoIXBsYXllci5tb3ZlZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdFxyXG5cdHZhciBkeCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0dmFyIGR6ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcclxuXHRpZiAoIXRoaXMudGFyZ2V0ICYmIChkeCA8PSA0IHx8IGR6IDw9IDQpKXtcclxuXHRcdC8vIENhc3QgYSByYXkgdG93YXJkcyB0aGUgcGxheWVyIHRvIGNoZWNrIGlmIGhlJ3Mgb24gdGhlIHZpc2lvbiBvZiB0aGUgY3JlYXR1cmVcclxuXHRcdHZhciByeCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHRcdHZhciByeSA9IHRoaXMucG9zaXRpb24uYztcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMztcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4zO1xyXG5cdFx0XHJcblx0XHR2YXIgc2VhcmNoID0gMTU7XHJcblx0XHR3aGlsZSAoc2VhcmNoID4gMCl7XHJcblx0XHRcdHJ4ICs9IGR4O1xyXG5cdFx0XHRyeSArPSBkeTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjeCA9IChyeCA8PCAwKTtcclxuXHRcdFx0dmFyIGN5ID0gKHJ5IDw8IDApO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMubWFwTWFuYWdlci5pc1NvbGlkKGN4LCBjeSwgMCkpe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHB4ID0gKHAuYSA8PCAwKTtcclxuXHRcdFx0XHR2YXIgcHkgPSAocC5jIDw8IDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChjeCA9PSBweCAmJiBjeSA9PSBweSl7XHJcblx0XHRcdFx0XHR0aGlzLnRhcmdldCA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRcdFx0XHRzZWFyY2ggPSAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VhcmNoIC09IDE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0cnVlKTtcclxuXHRpZiAodGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgcG9pbnRZIDwgMC4wKSBwb2ludFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcblx0XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gdGhpcy5wb3NpdGlvbi5iKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHRoaXMub25XYXRlcik7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCB0aGlzKTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgIXRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiB0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYSAtPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmMgLT0gbW92ZW1lbnQuYjtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiAhdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmF0dGFja1BsYXllciA9IGZ1bmN0aW9uKHBsYXllcil7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmF0dGFja1dhaXQgPiAwKXtcclxuXHRcdHRoaXMuYXR0YWNrV2FpdCAtPSAxO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UodGhpcy5lbmVteS5zdGF0cy5zdHIpO1xyXG5cdHZhciBkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHRcclxuXHQvLyBDaGVjayBpZiB0aGUgcGxheWVyIGhhcyB0aGUgcHJvdGVjdGlvbiBzcGVsbFxyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRkZnMgKz0gMTU7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heChzdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGF0dGFja3MhXCIpO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIGRhbWFnZSBpbmZsaWN0ZWRcIik7XHJcblx0XHRwbGF5ZXIucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gOTA7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMudGFyZ2V0KXtcclxuXHRcdHZhciBwbGF5ZXIgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0aWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdFx0XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHl5ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0dGhpcy5hdHRhY2tQbGF5ZXIocGxheWVyKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoeHggPiAxMCB8fCB5eSA+IDEwKXtcclxuXHRcdFx0dGhpcy50YXJnZXQgPSBudWxsO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMDI7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMDI7XHJcblx0XHRcclxuXHRcdHZhciBsYXQgPSB2ZWMyKE1hdGguY29zKGRpciArIE1hdGguUElfMiksIC1NYXRoLnNpbihkaXIgKyBNYXRoLlBJXzIpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tb3ZlVG8oZHgsIGR5LCBsYXQpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5sb29rRm9yKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmdldFRleHR1cmVDb2RlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZmFjZSA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdHZhciBhID0gdGhpcy5hbmltYXRpb247XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uID09IFwic3RhbmRcIikgYSA9IFwicnVuXCI7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMudGV4dHVyZUJhc2UgKyBcIl9cIiArIGE7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmJpbGxib2FyZCAmJiB0aGlzLnRleHR1cmVDb29yZHMpe1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy50ZXh0dXJlQ29vcmRzWyh0aGlzLmltZ0luZCA8PCAwKV07XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkLnBhaW50SW5SZWQgPSAodGhpcy5odXJ0ID4gMCk7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy5nZXRUZXh0dXJlQ29kZSgpLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCl7IHRoaXMuaHVydCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuc2xlZXAgPiAwKXsgdGhpcy5zbGVlcCAtPSAxOyB9XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5wYXVzZWQgfHwgZ2FtZS50aW1lU3RvcCA+IDAgfHwgdGhpcy5zbGVlcCA+IDApe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMubnVtRnJhbWVzID4gMSl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5udW1GcmFtZXMpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGVuZW1pZXM6IHtcclxuXHRcdGJhdDoge25hbWU6ICdHaWFudCBCYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDQsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmF0OiB7bmFtZTogJ0dpYW50IFJhdCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYXQnLCBzdGF0czoge3N0cjogJzFEOScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c3BpZGVyOiB7bmFtZTogJ0dpYW50IFNwaWRlcicsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdzcGlkZXInLCBzdGF0czoge3N0cjogJzFEMTEnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdyZW1saW46IHtuYW1lOiAnR3JlbWxpbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdncmVtbGluJywgc3RhdHM6IHtzdHI6ICcyRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNrZWxldG9uOiB7bmFtZTogJ1NrZWxldG9uJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3NrZWxldG9uJywgc3RhdHM6IHtzdHI6ICczRDQnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdGhlYWRsZXNzOiB7bmFtZTogJ0hlYWRsZXNzJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2hlYWRsZXNzJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdC8vbml4aWU6IHtuYW1lOiAnTml4aWUnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0d2lzcDoge25hbWU6ICdXaXNwJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ3dpc3AnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdob3N0OiB7bmFtZTogJ0dob3N0JywgaHA6IDgwLCB0ZXh0dXJlQmFzZTogJ2dob3N0Jywgc3RhdHM6IHtzdHI6ICcyRDE1JywgZGZzOiAnMkQyJywgZXhwOiA2LCBmbHk6IHRydWV9fSxcclxuXHRcdHRyb2xsOiB7bmFtZTogJ1Ryb2xsJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3Ryb2xsJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSwgLy8gTm90IHVzZWQgYnkgdGhlIGdlbmVyYXRvcj9cclxuXHRcdGxhdmFMaXphcmQ6IHtuYW1lOiAnTGF2YSBMaXphcmQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbGF2YUxpemFyZCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtb25nYmF0OiB7bmFtZTogJ01vbmdiYXQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbW9uZ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3LCBmbHk6IHRydWV9fSwgXHJcblx0XHRvY3RvcHVzOiB7bmFtZTogJ0dpYW50IFNxdWlkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ29jdG9wdXMnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZGFlbW9uOiB7bmFtZTogJ0RhZW1vbicsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnZGFlbW9uJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdC8vcGhhbnRvbToge25hbWU6ICdQaGFudG9tJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzFEMTUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHNlYVNlcnBlbnQ6IHtuYW1lOiAnU2VhIFNlcnBlbnQnLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ3NlYVNlcnBlbnQnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LCAvLyBub3Qgc3VpdGFibGVcclxuXHRcdGV2aWxNYWdlOiB7bmFtZTogJ0V2aWwgTWFnZScsIGhwOiAxNzYsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNkQ1JywgZGZzOiAnMkQyJywgZXhwOiAxMn19LCAvL1RPRE86IEFkZCB0ZXh0dXJlXHJcblx0XHRsaWNoZToge25hbWU6ICdMaWNoZScsIGhwOiAxOTIsIHRleHR1cmVCYXNlOiAnbGljaGUnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTN9fSxcclxuXHRcdGh5ZHJhOiB7bmFtZTogJ0h5ZHJhJywgaHA6IDIwOCwgdGV4dHVyZUJhc2U6ICdoeWRyYScsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNH19LFxyXG5cdFx0ZHJhZ29uOiB7bmFtZTogJ0RyYWdvbicsIGhwOiAyMjQsIHRleHR1cmVCYXNlOiAnZHJhZ29uJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE1LCBmbHk6IHRydWV9fSxcdFx0XHRcdC8vIE5vdCBzdWl0YWJsZVxyXG5cdFx0em9ybjoge25hbWU6ICdab3JuJywgaHA6IDI0MCwgdGV4dHVyZUJhc2U6ICd6b3JuJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRnYXplcjoge25hbWU6ICdHYXplcicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnZ2F6ZXInLCBzdGF0czoge3N0cjogJzVEOCcsIGRmczogJzJEMicsIGV4cDogMTYsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmVhcGVyOiB7bmFtZTogJ1JlYXBlcicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAncmVhcGVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRiYWxyb246IHtuYW1lOiAnQmFscm9uJywgaHA6IDI1NSwgdGV4dHVyZUJhc2U6ICdiYWxyb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdC8vdHdpc3Rlcjoge25hbWU6ICdUd2lzdGVyJywgaHA6IDI1LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQyJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHRcclxuXHRcdHdhcnJpb3I6IHtuYW1lOiAnRmlnaHRlcicsIGhwOiA5OCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdG1hZ2U6IHtuYW1lOiAnTWFnZScsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA4fX0sXHJcblx0XHRiYXJkOiB7bmFtZTogJ0JhcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmFyZCcsIHN0YXRzOiB7c3RyOiAnMkQxMCcsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0ZHJ1aWQ6IHtuYW1lOiAnRHJ1aWQnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiAxMH19LFxyXG5cdFx0dGlua2VyOiB7bmFtZTogJ1RpbmtlcicsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cGFsYWRpbjoge25hbWU6ICdQYWxhZGluJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNoZXBoZXJkOiB7bmFtZTogJ1NoZXBoZXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnM0QzJywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRyYW5nZXI6IHtuYW1lOiAnUmFuZ2VyJywgaHA6IDE0NCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogM319XHJcblx0fSxcclxuXHRcclxuXHRnZXRFbmVteTogZnVuY3Rpb24obmFtZSl7XHJcblx0XHRpZiAoIXRoaXMuZW5lbWllc1tuYW1lXSkgdGhyb3cgXCJJbnZhbGlkIGVuZW15IG5hbWU6IFwiICsgbmFtZTtcclxuXHRcdFxyXG5cdFx0dmFyIGVuZW15ID0gdGhpcy5lbmVtaWVzW25hbWVdO1xyXG5cdFx0dmFyIHJldCA9IHt9O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpIGluIGVuZW15KXtcclxuXHRcdFx0cmV0W2ldID0gZW5lbXlbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBJbnZlbnRvcnkobGltaXRJdGVtcyl7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMubGltaXRJdGVtcyA9IGxpbWl0SXRlbXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW52ZW50b3J5O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0aWYgKHRoaXMuaXRlbXMubGVuZ3RoID09IHRoaXMubGltaXRJdGVtcyl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZXF1aXBJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHR2YXIgdHlwZSA9IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlKXtcclxuXHRcdFx0aXRlbS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHR0aGlzLml0ZW1zW2l0ZW1JZF0uZXF1aXBwZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRFcXVpcHBlZEl0ZW0gPSBmdW5jdGlvbih0eXBlKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdGVtLnR5cGUgPT0gdHlwZSAmJiBpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0cmV0dXJuIGl0ZW07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRXZWFwb24gPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmdldEVxdWlwcGVkSXRlbSgnd2VhcG9uJyk7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEFybW91ciA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCdhcm1vdXInKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZGVzdHJveUl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpdGVtLnN0YXR1cyA9IDAuMDtcclxuXHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ID09PSBpdGVtKXtcclxuXHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGl0ZW1JZCl7XHJcblx0aWYgKHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICd3ZWFwb24nIHx8IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICdhcm1vdXInKXtcclxuXHRcdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdH1cclxuXHR0aGlzLml0ZW1zLnNwbGljZShpdGVtSWQsIDEpO1xyXG59O1xyXG4iLCJ2YXIgQmlsbGJvYXJkID0gcmVxdWlyZSgnLi9CaWxsYm9hcmQnKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuZnVuY3Rpb24gSXRlbShwb3NpdGlvbiwgaXRlbSwgbWFwTWFuYWdlcil7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5pdGVtID0gbnVsbDtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnbCk7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHRcclxuXHRpZiAoaXRlbSkgdGhpcy5zZXRJdGVtKGl0ZW0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5zZXRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0dGhpcy5pdGVtID0gaXRlbTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1t0aGlzLml0ZW0uc3ViSW1nXTtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gaXRlbS50ZXg7XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1tID0gdGhpcy5tYXBNYW5hZ2VyO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKHRoaXMuaXRlbS5pc0l0ZW0pe1xyXG5cdFx0aWYgKHRoaXMuaXRlbS50eXBlID09ICdjb2RleCcpe1xyXG5cdFx0XHQvLyAxMCBsaW5lc1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhlIGJvdW5kbGVzcyBrbm93bmxlZGdlIG9mIHRoZSBDb2RleCBpcyByZXZlYWxlZCB1bnRvIHRoZWUuXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiQSB2b2ljZSB0aHVuZGVycyFcIilcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlRob3UgaGFzdCBwcm92ZW4gdGh5c2VsZiB0byBiZSB0cnVseSBnb29kIGluIG5hdHVyZVwiKVxyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIilcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcInF1ZXN0IG9mIGEgbGlmZXRpbWUuXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiQXZhdGFyaG9vZCBpcyBhIGxpdmluZyBnaWZ0LCBJdCBtdXN0IGFsd2F5cyBhbmQgZm9yZXZlciBiZSBudXJ0dXJlZFwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcInRvIGZsdW9yaXNoLCBmb3IgaWYgdGhvdSBkb3N0IHN0cmF5IGZyb20gdGhlIHBhdGhzIG9mIHZpcnR1ZSwgdGh5IHdheVwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIm1heSBiZSBsb3N0IGZvcmV2ZXIuXCIpXHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJSZXR1cm4gbm93IHVudG8gdGhpbmUgb3VyIHdvcmxkLCBsaXZlIHRoZXJlIGFzIGFuIGV4YW1wbGUgdG8gdGh5XCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwicGVvcGxlLCBhcyBvdXIgbWVtb3J5IG9mIHRoeSBnYWxsYW50IGRlZWRzIHNlcnZlcyB1cy5cIilcclxuXHRcdH0gZWxzZSBpZiAoZ2FtZS5hZGRJdGVtKHRoaXMuaXRlbSkpe1xyXG5cdFx0XHR2YXIgc3RhdCA9ICcnO1xyXG5cdFx0XHRpZiAodGhpcy5pdGVtLnN0YXR1cyAhPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRcdHN0YXQgPSBJdGVtRmFjdG9yeS5nZXRTdGF0dXNOYW1lKHRoaXMuaXRlbS5zdGF0dXMpICsgJyAnO1xyXG5cdFx0XHRcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShzdGF0ICsgdGhpcy5pdGVtLm5hbWUgKyBcIiBwaWNrZWQuXCIpO1xyXG5cdFx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBjYW4ndCBjYXJyeSBhbnkgbW9yZSBpdGVtc1wiKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGl0ZW1zOiB7XHJcblx0XHQvLyBJdGVtc1xyXG5cdFx0eWVsbG93UG90aW9uOiB7bmFtZTogXCJZZWxsb3cgcG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdHJlZFBvdGlvbjoge25hbWU6IFwiUmVkIFBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRcclxuXHRcdC8vIFdlYXBvbnNcclxuXHRcdHN0YWZmOiB7bmFtZTogXCJTdGFmZlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNEQ0Jywgd2VhcjogMC4wMn0sXHJcblx0XHRkYWdnZXI6IHtuYW1lOiBcIkRhZ2dlclwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnM0Q4Jywgd2VhcjogMC4wNX0sXHJcblx0XHRzbGluZzoge25hbWU6IFwiU2xpbmdcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzREOCcsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdyb2NrJywgd2VhcjogMC4wNH0sXHJcblx0XHRtYWNlOiB7bmFtZTogXCJNYWNlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDUsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMEQ0Jywgd2VhcjogMC4wM30sXHJcblx0XHRheGU6IHtuYW1lOiBcIkF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA2LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTJENCcsIHdlYXI6IDAuMDF9LFxyXG5cdFx0c3dvcmQ6IHtuYW1lOiBcIlN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDgsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNkQ0Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0bXlzdGljU3dvcmQ6IHtuYW1lOiBcIk15c3RpYyBTd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA5LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTZEMTYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRib3c6IHtuYW1lOiBcIkJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwRDQnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGNyb3NzYm93OiB7bmFtZTogXCJDcm9zc2Jvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE2RDQnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnY3Jvc3Nib3cgYm9sdCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdFxyXG5cdFx0Ly8gQXJtb3VyXHJcblx0XHRsZWF0aGVyOiB7bmFtZTogXCJMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ2FybW91cicsIGRmczogJzE4RDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGNoYWluOiB7bmFtZTogXCJDaGFpbiBtYWlsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMjBEOCcsIHdlYXI6IDAuMDN9LFxyXG5cdFx0cGxhdGU6IHtuYW1lOiBcIlBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTQsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcyMkQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0bXlzdGljOiB7bmFtZTogXCJNeXN0aWMgYXJtb3VyXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE1LCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMzFEOCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdFxyXG5cdFx0Ly8gU3BlbGwgbWl4ZXNcclxuXHRcdGN1cmU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEN1cmVcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDV9LFxyXG5cdFx0aGVhbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSGVhbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTAsIHBlcmNlbnQ6IDAuMn0sXHJcblx0XHRsaWdodDoge25hbWU6IFwiU3BlbGxtaXggb2YgTGlnaHRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDUsIGxpZ2h0VGltZTogMTAwMH0sXHJcblx0XHRtaXNzaWxlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBtYWdpYyBtaXNzaWxlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICczMEQ1JywgbWFuYTogNX0sXHJcblx0XHRpY2ViYWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBJY2ViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA0LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc2NUQ1JywgbWFuYTogMjB9LFxyXG5cdFx0cmVwZWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFJlcGVsIFVuZGVhZFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0Ymxpbms6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEJsaW5rXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA2LCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxNX0sXHJcblx0XHRmaXJlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgRmlyZWJhbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDcsIHR5cGU6ICdtYWdpYycsIHN0cjogJzEwMEQ1JywgbWFuYTogMTV9LFxyXG5cdFx0cHJvdGVjdGlvbjoge25hbWU6IFwiU3BlbGxtaXggb2YgcHJvdGVjdGlvblwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOCwgdHlwZTogJ21hZ2ljJywgcHJvdFRpbWU6IDQwMCwgbWFuYTogMTV9LFxyXG5cdFx0dGltZToge25hbWU6IFwiU3BlbGxtaXggb2YgVGltZSBTdG9wXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA5LCB0eXBlOiAnbWFnaWMnLCBzdG9wVGltZTogNjAwLCBtYW5hOiAzMH0sXHJcblx0XHRzbGVlcDoge25hbWU6IFwiU3BlbGxtaXggb2YgU2xlZXBcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEwLCB0eXBlOiAnbWFnaWMnLCBzbGVlcFRpbWU6IDQwMCwgbWFuYTogMTV9LFxyXG5cdFx0amlueDoge25hbWU6IFwiU3BlbGxtaXggb2YgSmlueFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdHRyZW1vcjoge25hbWU6IFwiU3BlbGxtaXggb2YgVHJlbW9yXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMzB9LFxyXG5cdFx0a2lsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgS2lsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTMsIHR5cGU6ICdtYWdpYycsIHN0cjogJzQwMEQ1JywgbWFuYTogMjV9LFxyXG5cdFx0XHJcblx0XHQvLyBDb2RleFxyXG5cdFx0Y29kZXg6IHtuYW1lOiBcIkNvZGV4IG9mIFVsdGltYXRlIFdpc2RvbVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNiwgdHlwZTogJ2NvZGV4J30sXHJcblx0fSxcclxuXHRcclxuXHRnZXRJdGVtQnlDb2RlOiBmdW5jdGlvbihpdGVtQ29kZSwgc3RhdHVzKXtcclxuXHRcdGlmICghdGhpcy5pdGVtc1tpdGVtQ29kZV0pIHRocm93IFwiSW52YWxpZCBJdGVtIGNvZGU6IFwiICsgaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpdGVtQ29kZV07XHJcblx0XHR2YXIgcmV0ID0ge307XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQ2VpbHMobWFwRGF0YSwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVCbG9ja3MobWFwRGF0YSwgR0wpO1xyXG5cdHRoaXMuYXNzZW1ibGVTbG9wZXMobWFwRGF0YSwgR0wpO1xyXG5cdFxyXG5cdHRoaXMucGFyc2VPYmplY3RzKG1hcERhdGEpO1xyXG5cdFxyXG5cdHRoaXMuY29waWVkVGlsZXMgPSBbXTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBBc3NlbWJsZXI7XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmdldEVtcHR5R3JpZCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdyaWQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTA7eTw2NDt5Kyspe1xyXG5cdFx0Z3JpZFt5XSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgeD0wO3g8NjQ7eCsrKXtcclxuXHRcdFx0Z3JpZFt5XVt4XSA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBncmlkO1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5jb3B5VGlsZSA9IGZ1bmN0aW9uKHRpbGUpe1xyXG5cdHZhciByZXQgPSB7fTtcclxuXHRcclxuXHRmb3IgKHZhciBpIGluIHRpbGUpe1xyXG5cdFx0cmV0W2ldID0gdGlsZVtpXTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVGbG9vciA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9GbG9vcnMgPSBbXTtcclxuXHR2YXIgZmxvb3JzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuZil7XHJcblx0XHRcdFx0dmFyIGluZCA9IGZsb29yc0luZC5pbmRleE9mKHRpbGUuZik7XHJcblx0XHRcdFx0dmFyIGZsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Zmxvb3JzSW5kLnB1c2godGlsZS5mKTtcclxuXHRcdFx0XHRcdGZsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGZsLnRpbGUgPSB0aWxlLmY7XHJcblx0XHRcdFx0XHRmbC5yVGlsZSA9IHRpbGUucmY7XHJcblx0XHRcdFx0XHRvRmxvb3JzLnB1c2goZmwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0ZmwgPSBvRmxvb3JzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRmbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmYsIHk6IHl5fTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvRmxvb3JzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGZsb29yM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9GbG9vcnNbaV0sIFwiRlwiLCBHTCk7XHJcblx0XHRmbG9vcjNELnRleEluZCA9IG9GbG9vcnNbaV0udGlsZTtcclxuXHRcdGZsb29yM0QuclRleEluZCA9IG9GbG9vcnNbaV0uclRpbGU7XHJcblx0XHRmbG9vcjNELnR5cGUgPSBcIkZcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChmbG9vcjNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQ2VpbHMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQ2VpbHMgPSBbXTtcclxuXHR2YXIgY2VpbHNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5jKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gY2VpbHNJbmQuaW5kZXhPZih0aWxlLmMpO1xyXG5cdFx0XHRcdHZhciBjbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGNlaWxzSW5kLnB1c2godGlsZS5jKTtcclxuXHRcdFx0XHRcdGNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGNsLnRpbGUgPSB0aWxlLmM7XHJcblx0XHRcdFx0XHRvQ2VpbHMucHVzaChjbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjbCA9IG9DZWlsc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmMsIHk6IHRpbGUuY2h9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9DZWlscy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBjZWlsM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9DZWlsc1tpXSwgXCJDXCIsIEdMKTtcclxuXHRcdGNlaWwzRC50ZXhJbmQgPSBvQ2VpbHNbaV0udGlsZTtcclxuXHRcdGNlaWwzRC50eXBlID0gXCJDXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goY2VpbDNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQmxvY2tzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Jsb2NrcyA9IFtdO1xyXG5cdHZhciBibG9ja3NJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS53KXtcclxuXHRcdFx0XHR2YXIgaW5kID0gYmxvY2tzSW5kLmluZGV4T2YodGlsZS53KTtcclxuXHRcdFx0XHR2YXIgd2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRibG9ja3NJbmQucHVzaCh0aWxlLncpO1xyXG5cdFx0XHRcdFx0d2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0d2wudGlsZSA9IHRpbGUudztcclxuXHRcdFx0XHRcdG9CbG9ja3MucHVzaCh3bCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR3bCA9IG9CbG9ja3NbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2xbeV1beF0gPSB7dGlsZTogdGlsZS53LCB5OiB0aWxlLnksIGg6IHRpbGUuaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Jsb2Nrcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBibG9jazNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQmxvY2tzW2ldLCBcIkJcIiwgR0wpO1xyXG5cdFx0YmxvY2szRC50ZXhJbmQgPSBvQmxvY2tzW2ldLnRpbGU7XHJcblx0XHRibG9jazNELnR5cGUgPSBcIkJcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChibG9jazNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlU2xvcGVzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb1Nsb3BlcyA9IFtdO1xyXG5cdHZhciBzbG9wZXNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5zbCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IHNsb3Blc0luZC5pbmRleE9mKHRpbGUuc2wpO1xyXG5cdFx0XHRcdHZhciBzbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdHNsb3Blc0luZC5wdXNoKHRpbGUuc2wpO1xyXG5cdFx0XHRcdFx0c2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0c2wudGlsZSA9IHRpbGUuc2w7XHJcblx0XHRcdFx0XHRvU2xvcGVzLnB1c2goc2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2wgPSBvU2xvcGVzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRzbFt5XVt4XSA9IHt0aWxlOiB0aWxlLnNsLCB5OiB5eSwgZGlyOiB0aWxlLmRpcn07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b1Nsb3Blcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBzbG9wZTNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvU2xvcGVzW2ldLCBcIlNcIiwgR0wpO1xyXG5cdFx0c2xvcGUzRC50ZXhJbmQgPSBvU2xvcGVzW2ldLnRpbGU7XHJcblx0XHRzbG9wZTNELnR5cGUgPSBcIlNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChzbG9wZTNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlTWFwID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beF0gIT0gMCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS50aWxlc1tpbmRdO1xyXG5cdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mICYmIHRpbGUuZiA+IDEwMCl7XHJcblx0XHRcdFx0XHR0aWxlLnJmID0gdGlsZS5mIC0gMTAwO1xyXG5cdFx0XHRcdFx0dGlsZS5pc1dhdGVyID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGlsZS55ID0gLTAuMjtcclxuXHRcdFx0XHRcdHRpbGUuZnkgPSAtMC4yO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mIDwgMTAwKXtcclxuXHRcdFx0XHRcdHZhciB0MSwgdDIsIHQzLCB0NDtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4KzFdKSB0MSA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3ldW3grMV1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ktMV0pIHQyID0gKG1hcERhdGEubWFwW3ktMV1beF0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beC0xXSkgdDMgPSAobWFwRGF0YS5tYXBbeV1beC0xXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5KzFdKSB0NCA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3krMV1beF1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAodDEgfHwgdDIgfHwgdDMgfHwgdDQpe1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jb3BpZWRUaWxlc1tpbmRdKXtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5jb3BpZWRUaWxlc1tpbmRdID0gdGhpcy5jb3B5VGlsZSh0aWxlKTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHR0aWxlLnkgPSAtMTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlLmggKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXRpbGUudyl7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLncgPSAxMDtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUuaCA9IDE7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU9iamVjdHMgPSBmdW5jdGlvbihtYXBEYXRhKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1hcERhdGEub2JqZWN0cy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBvID0gbWFwRGF0YS5vYmplY3RzW2ldO1xyXG5cdFx0dmFyIHggPSBvLng7XHJcblx0XHR2YXIgeSA9IG8ueTtcclxuXHRcdHZhciB6ID0gby56O1xyXG5cdFx0XHJcblx0XHRzd2l0Y2ggKG8udHlwZSl7XHJcblx0XHRcdGNhc2UgXCJwbGF5ZXJcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyID0gbmV3IFBsYXllcih2ZWMzKHgsIHksIHopLCB2ZWMzKDAuMCwgby5kaXIgKiBNYXRoLlBJXzIsIDAuMCksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiaXRlbVwiOlxyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBNYXRoLm1pbigwLjMgKyAoTWF0aC5yYW5kb20oKSAqIDAuNyksIDEuMCk7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKG8uaXRlbSwgc3RhdHVzKTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobmV3IEl0ZW0odmVjMyh4LCB5LCB6KSwgaXRlbSwgdGhpcy5tYXBNYW5hZ2VyKSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZW5lbXlcIjpcclxuXHRcdFx0XHR2YXIgZW5lbXkgPSBFbmVteUZhY3RvcnkuZ2V0RW5lbXkoby5lbmVteSk7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG5ldyBFbmVteSh2ZWMzKHgsIHksIHopLCBlbmVteSwgdGhpcy5tYXBNYW5hZ2VyKSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwic3RhaXJzXCI6XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG5ldyBTdGFpcnModmVjMyh4LCB5LCB6KSwgdGhpcy5tYXBNYW5hZ2VyLCBvLmRpcikpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JcIjpcclxuXHRcdFx0XHR2YXIgeHggPSAoeCA8PCAwKSAtICgoby5kaXIgPT0gXCJIXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHp6ID0gKHogPDwgMCkgLSAoKG8uZGlyID09IFwiVlwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbenpdW3h4XS53O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5kb29ycy5wdXNoKG5ldyBEb29yKHRoaXMubWFwTWFuYWdlciwgdmVjMyh4LCB5LCB6KSwgby5kaXIsIFwiZG9vcjFcIiwgdGlsZSkpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07IiwidmFyIE1hcEFzc2VtYmxlciA9IHJlcXVpcmUoJy4vTWFwQXNzZW1ibGVyJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwTWFuYWdlcjtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdlbmVyYXRlTWFwID0gZnVuY3Rpb24oZGVwdGgpe1xyXG5cdHZhciBjb25maWcgPSB7XHJcblx0XHRNSU5fV0lEVEg6IDEwLFxyXG5cdFx0TUlOX0hFSUdIVDogMTAsXHJcblx0XHRNQVhfV0lEVEg6IDIwLFxyXG5cdFx0TUFYX0hFSUdIVDogMjAsXHJcblx0XHRMRVZFTF9XSURUSDogNjQsXHJcblx0XHRMRVZFTF9IRUlHSFQ6IDY0LFxyXG5cdFx0U1VCRElWSVNJT05fREVQVEg6IDMsXHJcblx0XHRTTElDRV9SQU5HRV9TVEFSVDogMy84LFxyXG5cdFx0U0xJQ0VfUkFOR0VfRU5EOiA1LzgsXHJcblx0XHRSSVZFUl9TRUdNRU5UX0xFTkdUSDogMTAsXHJcblx0XHRNSU5fUklWRVJfU0VHTUVOVFM6IDEwLFxyXG5cdFx0TUFYX1JJVkVSX1NFR01FTlRTOiAyMCxcclxuXHRcdE1JTl9SSVZFUlM6IDMsXHJcblx0XHRNQVhfUklWRVJTOiA1XHJcblx0fTtcclxuXHR2YXIgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihjb25maWcpO1xyXG5cdHZhciBrcmFtZ2luZUV4cG9ydGVyID0gbmV3IEtyYW1naW5lRXhwb3J0ZXIoY29uZmlnKTtcclxuXHR2YXIgZ2VuZXJhdGVkTGV2ZWwgPSBnZW5lcmF0b3IuZ2VuZXJhdGVMZXZlbChkZXB0aCk7XHJcblx0XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHRyeXtcclxuXHRcdHdpbmRvdy5nZW5lcmF0ZWRMZXZlbCA9IChnZW5lcmF0ZWRMZXZlbC5sZXZlbCk7XHJcblx0XHR2YXIgbWFwRGF0YSA9IGtyYW1naW5lRXhwb3J0ZXIuZ2V0TGV2ZWwoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0d2luZG93Lm1hcERhdGEgPSAobWFwRGF0YSk7XHJcblx0XHRuZXcgTWFwQXNzZW1ibGVyKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdH1jYXRjaCAoZSl7XHJcblx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHR9XHJcblx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcE5hbWUpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRodHRwLm9wZW4oJ0dFVCcsIGNwICsgJ21hcHMvJyArIG1hcE5hbWUgKyBcIi5qc29uXCIsIHRydWUpO1xyXG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgXHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICBcdFx0XHR0cnl7XHJcblx0XHRcdFx0bWFwRGF0YSA9IEpTT04ucGFyc2UoaHR0cC5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG5ldyBNYXBBc3NlbWJsZXIobWFwTSwgbWFwRGF0YSwgbWFwTS5nYW1lLkdMLmN0eCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0XHRcdG1hcE0uZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0XHRcdH1jYXRjaCAoZSl7XHJcblx0XHRcdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH07XHJcblx0aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XHJcblx0aHR0cC5zZW5kKCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1dhdGVyVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuICh0aGlzLndhdGVyVGlsZXMuaW5kZXhPZih0aWxlSWQpICE9IC0xKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc1dhdGVyVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhUG9zaXRpb24gPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC5mKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMuaXNMYXZhVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuIHRpbGVJZCA9PSAxMDM7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuY2hhbmdlV2FsbFRleHR1cmUgPSBmdW5jdGlvbih4LCB6LCB0ZXh0dXJlSWQpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIGJhc2UgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIWJhc2UuY2xvbmVkKXtcclxuXHRcdHZhciBuZXdXID0ge307XHJcblx0XHRmb3IgKHZhciBpIGluIGJhc2Upe1xyXG5cdFx0XHRuZXdXW2ldID0gYmFzZVtpXTtcclxuXHRcdH1cclxuXHRcdG5ld1cuY2xvbmVkID0gdHJ1ZTtcclxuXHRcdHRoaXMubWFwW3pdW3hdID0gbmV3VztcclxuXHRcdGJhc2UgPSBuZXdXO1xyXG5cdH1cclxuXHRcclxuXHRiYXNlLncgPSB0ZXh0dXJlSWQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yQXQgPSBmdW5jdGlvbih4LCB5LCB6KXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRpZiAoZG9vci53YWxsUG9zaXRpb24uZXF1YWxzKHgsIHksIHopKSByZXR1cm4gZG9vcjtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0ID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uZXF1YWxzKHBvc2l0aW9uKSl7XHJcblx0XHRcdHJldHVybiB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0R3JpZCA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPT0gcG9zaXRpb24uYSAmJiB6ID09IHBvc2l0aW9uLmMpe1xyXG5cdFx0XHRyZXR1cm4gKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZSA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRcclxuXHR2YXIgbWluWCA9IHggLSAxO1xyXG5cdHZhciBtaW5aID0geiAtIDE7XHJcblx0dmFyIG1heFggPSB4ICsgMTtcclxuXHR2YXIgbWF4WiA9IHogKyAxO1xyXG5cdFxyXG5cdGZvciAodmFyIHp6PW1pblo7eno8PW1heFo7enorKyl7XHJcblx0XHRmb3IgKHZhciB4eD1taW5YO3h4PD1tYXhYO3h4Kyspe1xyXG5cdFx0XHRpZiAodGhpcy5pc1NvbGlkKHh4LCB6eiwgMCkgfHwgdGhpcy5pc1dhdGVyUG9zaXRpb24oeHgsIHp6KSl7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwb3MgPSB2ZWMzKHh4LCAwLCB6eik7XHJcblx0XHRcdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHBvcyk7XHJcblx0XHRcdGlmICghaW5zIHx8ICghaW5zLml0ZW0gJiYgIWlucy5zdGFpcnMpKXtcclxuXHRcdFx0XHRyZXR1cm4gcG9zO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzTmVhcmVzdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBkaXN0YW5jZSwgaGFzUHJvcGVydHkpe1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRpZiAoaGFzUHJvcGVydHkgJiYgIXRoaXMuaW5zdGFuY2VzW2ldW2hhc1Byb3BlcnR5XSkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5hYnModGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYSAtIHBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jIC0gcG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4IDw9IGRpc3RhbmNlICYmIHogPD0gZGlzdGFuY2Upe1xyXG5cdFx0XHRyZXQucHVzaCh0aGlzLmluc3RhbmNlc1tpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgc2VsZil7XHJcblx0dmFyIHAgPSBwb3MuY2xvbmUoKTtcclxuXHRwLmEgPSBwLmEgKyBzcGQuYTtcclxuXHRwLmMgPSBwLmMgKyBzcGQuYjtcclxuXHRcclxuXHR2YXIgaW5zdCA9IG51bGwsIGhvcjtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMgfHwgaW5zLmRlc3Ryb3llZCB8fCAhaW5zLnNvbGlkKSBjb250aW51ZTtcclxuXHRcdGlmIChpbnMgPT09IHNlbGYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHAuYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHAuYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA8PSAwLjggJiYgenogPD0gMC44KXtcclxuXHRcdFx0aWYgKHBvcy5hIDw9IGlucy5wb3NpdGlvbi5hIC0gMC44IHx8IHBvcy5hID49IGlucy5wb3NpdGlvbi5hICsgMC44KSBob3IgPSB0cnVlO1xyXG5cdFx0XHRlbHNlIGlmIChwb3MuYyA8PSBpbnMucG9zaXRpb24uYyAtIDAuOCB8fCBwb3MuYyA+PSBpbnMucG9zaXRpb24uYyArIDAuOCkgaG9yID0gZmFsc2U7ICBcclxuXHRcdFx0aW5zdCA9IGlucztcclxuXHRcdFx0aSA9IGxlbjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0XHJcblx0aWYgKCFpbnN0KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoaW5zdC5oZWlnaHQpe1xyXG5cdFx0aWYgKHBvcy5iICsgaCA8IGluc3QucG9zaXRpb24uYikgcmV0dXJuIG51bGw7XHJcblx0XHRpZiAocG9zLmIgPj0gaW5zdC5wb3NpdGlvbi5iICsgaW5zdC5oZWlnaHQpIHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoaG9yKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnJpZ2h0O1xyXG5cdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS53YWxsSGFzTm9ybWFsID0gZnVuY3Rpb24oeCwgeSwgbm9ybWFsKXtcclxuXHR2YXIgdDEgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRzd2l0Y2ggKG5vcm1hbCl7XHJcblx0XHRjYXNlICd1JzogeSAtPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ2wnOiB4IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnZCc6IHkgKz0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdyJzogeCArPSAxOyBicmVhaztcclxuXHR9XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt5XSkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gMCkgcmV0dXJuIHRydWU7XHJcblx0dmFyIHQyID0gdGhpcy5tYXBbeV1beF07XHJcblx0XHJcblx0aWYgKCF0Mi53KSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodDIudyAmJiAhKHQyLnkgPT0gdDEueSAmJiB0Mi5oID09IHQxLmgpKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIGluV2F0ZXIpe1xyXG5cdHZhciB4eCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHp6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciBkb29yID0gdGhpcy5nZXREb29yQXQoeHgsIHksIHp6KTtcclxuXHRpZiAoZG9vcil7XHJcblx0XHR2YXIgeHh4ID0gKHBvcy5hICsgc3BkLmEpIC0geHg7XHJcblx0XHR2YXIgenp6ID0gKHBvcy5jICsgc3BkLmIpIC0geno7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gKHBvcy5hIC0geHgpO1xyXG5cdFx0dmFyIHogPSAocG9zLmMgLSB6eik7XHJcblx0XHRpZiAoZG9vci5kaXIgPT0gXCJWXCIpe1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRpZiAoenp6ID4gMC4yNSAmJiB6enogPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHggPCAwIHx8IHggPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGVsc2UgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0aWYgKHh4eCA+IDAuMjUgJiYgeHh4IDwgMC43NSkgcmV0dXJuIG51bGw7XHJcblx0XHRcdGlmICh6IDwgMCB8fCB6ID4gMSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKHgsIHosIHkpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQudyAmJiAhdC5kdyAmJiAhdC53ZCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdGlmICh5ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0aWYgKHQueSArIHQuaCA8PSB5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgdCwgdGg7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt6el0pIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRpID0gNDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHRoID0gdC5oIC0gMC4zO1xyXG5cdGlmIChpbldhdGVyKSB5ICs9IDAuMztcclxuXHRpZiAodC5zbCkgdGggKz0gMC4yO1xyXG5cdFxyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC55K3RoIDw9IHkpIHJldHVybiBudWxsO1xyXG5cdGVsc2UgaWYgKHQueSA+IHkgKyBoKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0Lncpe1xyXG5cdFx0dmFyIHRleCA9IHRoaXMuZ2FtZS5nZXRUZXh0dXJlQnlJZCh0LncsIFwid2FsbFwiKTtcclxuXHRcdGlmICh0ZXguaXNTb2xpZCl7XHJcblx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgJiYgenp6IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpICYmIHp6eiA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpICYmIHh4eCA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0OyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpICYmIHh4eCA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDsgfVxyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICh0LmR3KXtcclxuXHRcdHZhciB4LCB6LCB4eHgsIHp6eiwgbm9ybWFsO1xyXG5cdFx0eCA9IHBvcy5hICsgc3BkLmE7XHJcblx0XHR6ID0gcG9zLmMgKyBzcGQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKHQuYXcgPT0gMCl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwTGVmdDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAxKXsgeHh4ID0geCAtIHh4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBSaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAyKXsgeHh4ID0geCAtIHh4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93blJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDMpeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duTGVmdDsgfVxyXG5cdFx0aWYgKHp6eiA+PSB4eHgpe1xyXG5cdFx0XHRyZXR1cm4gbm9ybWFsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFlGbG9vciA9IGZ1bmN0aW9uKHgsIHksIG5vV2F0ZXIpe1xyXG5cdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeDw8MCwwLHk8PDApKTtcclxuXHRpZiAoaW5zICE9IG51bGwgJiYgaW5zLmhlaWdodCl7XHJcblx0XHRyZXR1cm4gaW5zLnBvc2l0aW9uLmIgKyBpbnMuaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgeHggPSB4IC0gKHggPDwgMCk7XHJcblx0dmFyIHl5ID0geSAtICh5IDw8IDApO1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eSA9IHkgPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbeV1beF07XHJcblx0dmFyIHR0ID0gdC55O1xyXG5cdFxyXG5cdGlmICh0LncpIHR0ICs9IHQuaDtcclxuXHRpZiAodC5mKSB0dCA9IHQuZnk7XHJcblx0XHJcblx0aWYgKCFub1dhdGVyICYmIHRoaXMuaXNXYXRlclRpbGUodC5mKSkgdHQgLT0gMC4zO1xyXG5cdFxyXG5cdGlmICh0LnNsKXtcclxuXHRcdGlmICh0LmRpciA9PSAwKSB0dCArPSB5eSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDEpIHR0ICs9IHh4ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMikgdHQgKz0gKDEuMCAtIHl5KSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDMpIHR0ICs9ICgxLjAgLSB4eCkgKiAwLjU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0dDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmRyYXdNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciB4LCB5O1xyXG5cdHggPSB0aGlzLnBsYXllci5wb3NpdGlvbi5hO1xyXG5cdHkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi5jO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tYXBUb0RyYXcubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXRkID0gdGhpcy5tYXBUb0RyYXdbaV07XHJcblx0XHRcclxuXHRcdGlmICh4IDwgbXRkLmJvdW5kYXJpZXNbMF0gfHwgeCA+IG10ZC5ib3VuZGFyaWVzWzJdIHx8IHkgPCBtdGQuYm91bmRhcmllc1sxXSB8fCB5ID4gbXRkLmJvdW5kYXJpZXNbM10pXHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobXRkLnR5cGUgPT0gXCJCXCIpeyAvLyBCbG9ja3NcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdCbG9jayhtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiRlwiKXsgLy8gRmxvb3JzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdGlmICh0aGlzLmlzV2F0ZXJUaWxlKHR0KSl7IFxyXG5cdFx0XHRcdHR0ID0gKG10ZC5yVGV4SW5kKSArICh0aGlzLndhdGVyRnJhbWUgPDwgMCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnd2F0ZXInKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnZmxvb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiQ1wiKXsgLy8gQ2VpbHNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnY2VpbCcpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiU1wiKXsgLy8gU2xvcGVcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdTbG9wZShtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoaW52W2ldLmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRyZXR1cm4gaW52W2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSwgYW1vdW50KXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IGludltpXTtcclxuXHRcdGlmIChpdC5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0aWYgKC0taXQuYW1vdW50ID09IDApe1xyXG5cdFx0XHRcdGludi5zcGxpY2UoaSwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmFkZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHR0aGlzLmdhbWUuY29uc29sZS5hZGRTRk1lc3NhZ2UodGV4dCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLnRpbWVTdG9wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy53YXRlckZyYW1lICs9IDAuMTtcclxuXHRpZiAodGhpcy53YXRlckZyYW1lID49IDIpIHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNUb0RyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdGktLTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciBkaXN0ID0geHggKiB4eCArIHp6ICogeno7XHJcblx0XHR2YXIgYWRkZWQgPSBmYWxzZTtcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRpZiAoZGlzdCA+IHRoaXMub3JkZXJJbnN0YW5jZXNbal0uZGlzdCl7XHJcblx0XHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaiwwLHtpbnM6IGlucywgZGlzdDogZGlzdH0pO1xyXG5cdFx0XHRcdGFkZGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRqID0gamxlbjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoIWFkZGVkKXtcclxuXHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5wdXNoKHtpbnM6IGlucywgZGlzdDogZGlzdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlc0F0ID0gZnVuY3Rpb24oeCwgeil7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpbnMgPSB0aGlzLmRvb3JzW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWlucykgY29udGludWU7XHJcblx0XHRcclxuXHRcdGlmIChNYXRoLnJvdW5kKGlucy5wb3NpdGlvbi5hKSA9PSB4ICYmIE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmMpID09IHopXHJcblx0XHRcdHJldC5wdXNoKGlucyk7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tYXAgPT0gbnVsbCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhd01hcCgpO1xyXG5cdFxyXG5cdHRoaXMuZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm9yZGVySW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMub3JkZXJJbnN0YW5jZXNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdGlucyA9IGlucy5pbnM7XHJcblx0XHRcclxuXHRcdGlmIChpbnMuZGVzdHJveWVkKXtcclxuXHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRjb250aW51ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHR9XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdGlucy5sb29wKCk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3IoaW5zLnBvc2l0aW9uLmEsIGlucy5wb3NpdGlvbi5iLCBpbnMucG9zaXRpb24uYywgaW5zLnJvdGF0aW9uLCBpbnMudGV4dHVyZUNvZGUpO1xyXG5cdFx0dGhpcy5nYW1lLmRyYXdEb29yV2FsbChpbnMuZG9vclBvc2l0aW9uLmEsIGlucy5kb29yUG9zaXRpb24uYiwgaW5zLmRvb3JQb3NpdGlvbi5jLCBpbnMud2FsbFRleHR1cmUsIChpbnMuZGlyID09IFwiVlwiKSk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMucGxheWVyLmxvb3AoKTtcclxuXHRpZiAodGhpcy5wb2lzb25Db3VudCA+IDApe1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCAtPSAxO1xyXG5cdH1lbHNlIGlmICh0aGlzLmdhbWUucGxheWVyLnBvaXNvbmVkICYmIHRoaXMucG9pc29uQ291bnQgPT0gMCl7XHJcblx0XHR0aGlzLnBsYXllci5yZWNlaXZlRGFtYWdlKDEwKTtcclxuXHRcdHRoaXMucG9pc29uQ291bnQgPSAxMDA7XHJcblx0fVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRtYWtlUGVyc3BlY3RpdmU6IGZ1bmN0aW9uKGZvdiwgYXNwZWN0UmF0aW8sIHpOZWFyLCB6RmFyKXtcclxuXHRcdHZhciB6TGltaXQgPSB6TmVhciAqIE1hdGgudGFuKGZvdiAqIE1hdGguUEkgLyAzNjApO1xyXG5cdFx0dmFyIEEgPSAtKHpGYXIgKyB6TmVhcikgLyAoekZhciAtIHpOZWFyKTtcclxuXHRcdHZhciBCID0gLTIgKiB6RmFyICogek5lYXIgLyAoekZhciAtIHpOZWFyKTtcclxuXHRcdHZhciBDID0gKDIgKiB6TmVhcikgLyAoekxpbWl0ICogYXNwZWN0UmF0aW8gKiAyKTtcclxuXHRcdHZhciBEID0gKDIgKiB6TmVhcikgLyAoMiAqIHpMaW1pdCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdEMsIDAsIDAsIDAsXHJcblx0XHRcdDAsIEQsIDAsIDAsXHJcblx0XHRcdDAsIDAsIEEsLTEsXHJcblx0XHRcdDAsIDAsIEIsIDBcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRuZXdNYXRyaXg6IGZ1bmN0aW9uKGNvbHMsIHJvd3Mpe1xyXG5cdFx0dmFyIHJldCA9IG5ldyBBcnJheShyb3dzKTtcclxuXHRcdGZvciAodmFyIGk9MDtpPHJvd3M7aSsrKXtcclxuXHRcdFx0cmV0W2ldID0gbmV3IEFycmF5KGNvbHMpO1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajxjb2xzO2orKyl7XHJcblx0XHRcdFx0cmV0W2ldW2pdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0SWRlbnRpdHk6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQxLCAwLCAwLCAwLFxyXG5cdFx0XHQwLCAxLCAwLCAwLFxyXG5cdFx0XHQwLCAwLCAxLCAwLFxyXG5cdFx0XHQwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWFrZVRyYW5zZm9ybTogZnVuY3Rpb24ob2JqZWN0LCBjYW1lcmEpe1xyXG5cdFx0Ly8gU3RhcnRzIHdpdGggdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdFx0dmFyIHRNYXQgPSB0aGlzLmdldElkZW50aXR5KCk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0XHJcblx0XHQvLyBVbnRpbCBJIGZpbmQgdGhlIG5lZWQgdG8gcm90YXRlIGFuIG9iamVjdCBpdHNlbGYgaXQgcmVhbWlucyBhcyBjb21tZW50XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25YKG9iamVjdC5yb3RhdGlvbi5hKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWShvYmplY3Qucm90YXRpb24uYikpO1xyXG5cdFx0Ly90TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWihvYmplY3Qucm90YXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBJZiB0aGUgb2JqZWN0IGlzIGEgYmlsbGJvYXJkLCB0aGVuIG1ha2UgaXQgbG9vayB0byB0aGUgY2FtZXJhXHJcblx0XHRpZiAob2JqZWN0LmlzQmlsbGJvYXJkICYmICFvYmplY3Qubm9Sb3RhdGUpIHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKC0oY2FtZXJhLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCB0byBpdHMgcG9zaXRpb25cclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0VHJhbnNsYXRpb24ob2JqZWN0LnBvc2l0aW9uLmEsIG9iamVjdC5wb3NpdGlvbi5iLCBvYmplY3QucG9zaXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlIHRoZSBvYmplY3QgaW4gcmVsYXRpb24gdG8gdGhlIGNhbWVyYVxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbigtY2FtZXJhLnBvc2l0aW9uLmEsIC1jYW1lcmEucG9zaXRpb24uYiAtIGNhbWVyYS5jYW1lcmFIZWlnaHQsIC1jYW1lcmEucG9zaXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHQvLyBSb3RhdGUgdGhlIG9iamVjdCBpbiB0aGUgY2FtZXJhIGRpcmVjdGlvbiAoSSBkb24ndCByZWFsbHkgcm90YXRlIGluIHRoZSBaIGF4aXMpXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpO1xyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgoLWNhbWVyYS5yb3RhdGlvbi5hKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKC1jYW1lcmEucm90YXRpb24uYykpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdE1hdDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRyYW5zbGF0aW9uOiBmdW5jdGlvbih4LCB5LCB6KXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdHgsIHksIHosIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblg6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIEMsIFMsIDAsXHJcblx0XHRcdDAsLVMsIEMsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblk6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCAwLCBTLCAwLFxyXG5cdFx0XHQgMCwgMSwgMCwgMCxcclxuXHRcdFx0LVMsIDAsIEMsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Um90YXRpb25aOiBmdW5jdGlvbihhbmcpe1xyXG5cdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHQgQywgUywgMCwgMCxcclxuXHRcdFx0LVMsIEMsIDAsIDAsXHJcblx0XHRcdCAwLCAwLCAxLCAwLFxyXG5cdFx0XHQgMCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG1pbmlNYXRyaXhNdWx0OiBmdW5jdGlvbihyb3csIGNvbHVtbil7XHJcblx0XHR2YXIgcmVzdWx0ID0gMDtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49cm93Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRyZXN1bHQgKz0gcm93W2ldICogY29sdW1uW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0sXHJcblx0XHJcblx0bWF0cml4TXVsdGlwbGljYXRpb246IGZ1bmN0aW9uKG1hdHJpeEEsIG1hdHJpeEIpe1xyXG5cdFx0dmFyIEExID0gW21hdHJpeEFbMF0sICBtYXRyaXhBWzFdLCAgbWF0cml4QVsyXSwgIG1hdHJpeEFbM11dO1xyXG5cdFx0dmFyIEEyID0gW21hdHJpeEFbNF0sICBtYXRyaXhBWzVdLCAgbWF0cml4QVs2XSwgIG1hdHJpeEFbN11dO1xyXG5cdFx0dmFyIEEzID0gW21hdHJpeEFbOF0sICBtYXRyaXhBWzldLCAgbWF0cml4QVsxMF0sIG1hdHJpeEFbMTFdXTtcclxuXHRcdHZhciBBNCA9IFttYXRyaXhBWzEyXSwgbWF0cml4QVsxM10sIG1hdHJpeEFbMTRdLCBtYXRyaXhBWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBCMSA9IFttYXRyaXhCWzBdLCBtYXRyaXhCWzRdLCBtYXRyaXhCWzhdLCAgbWF0cml4QlsxMl1dO1xyXG5cdFx0dmFyIEIyID0gW21hdHJpeEJbMV0sIG1hdHJpeEJbNV0sIG1hdHJpeEJbOV0sICBtYXRyaXhCWzEzXV07XHJcblx0XHR2YXIgQjMgPSBbbWF0cml4QlsyXSwgbWF0cml4Qls2XSwgbWF0cml4QlsxMF0sIG1hdHJpeEJbMTRdXTtcclxuXHRcdHZhciBCNCA9IFttYXRyaXhCWzNdLCBtYXRyaXhCWzddLCBtYXRyaXhCWzExXSwgbWF0cml4QlsxNV1dO1xyXG5cdFx0XHJcblx0XHR2YXIgbW1tID0gdGhpcy5taW5pTWF0cml4TXVsdDtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdG1tbShBMSwgQjEpLCBtbW0oQTEsIEIyKSwgbW1tKEExLCBCMyksIG1tbShBMSwgQjQpLFxyXG5cdFx0XHRtbW0oQTIsIEIxKSwgbW1tKEEyLCBCMiksIG1tbShBMiwgQjMpLCBtbW0oQTIsIEI0KSxcclxuXHRcdFx0bW1tKEEzLCBCMSksIG1tbShBMywgQjIpLCBtbW0oQTMsIEIzKSwgbW1tKEEzLCBCNCksXHJcblx0XHRcdG1tbShBNCwgQjEpLCBtbW0oQTQsIEIyKSwgbW1tKEE0LCBCMyksIG1tbShBNCwgQjQpXHJcblx0XHRdO1xyXG5cdH1cclxufTtcclxuIiwidmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuZnVuY3Rpb24gTWlzc2lsZShwb3NpdGlvbiwgcm90YXRpb24sIHR5cGUsIHRhcmdldCwgbWFwTWFuYWdlcil7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdsKTtcclxuXHR0aGlzLnR5cGUgPSB0eXBlO1xyXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5zb2xpZCA9IGZhbHNlO1xyXG5cdHRoaXMuc3RyID0gMDtcclxuXHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdHRoaXMubWlzc2VkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy52c3BlZWQgPSAwO1xyXG5cdHRoaXMuZ3Jhdml0eSA9IDA7XHJcblx0XHJcblx0dmFyIHN1YkltZyA9IDA7XHJcblx0c3dpdGNoICh0eXBlKXtcclxuXHRcdGNhc2UgJ3NsaW5nJzogXHJcblx0XHRcdHN1YkltZyA9IDA7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0XHR0aGlzLmdyYXZpdHkgPSAwLjAwNTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDE7XHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjI7IFxyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdjcm9zc2Jvdyc6IFxyXG5cdFx0XHRzdWJJbWcgPSAyOyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMztcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnbWFnaWNNaXNzaWxlJzogXHJcblx0XHRcdHN1YkltZyA9IDM7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC40O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdpY2VCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNDsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ZpcmVCYWxsJzpcclxuXHRcdFx0c3ViSW1nID0gNTsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA2OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gJ2JvbHRzJztcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBtYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnNbc3ViSW1nXTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNaXNzaWxlO1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuY2hlY2tDb2xsaXNpb24gPSBmdW5jdGlvbigpe1xyXG5cdHZhciBtYXAgPSB0aGlzLm1hcE1hbmFnZXIubWFwO1xyXG5cdGlmICh0aGlzLnBvc2l0aW9uLmEgPCAwIHx8IHRoaXMucG9zaXRpb24uYyA8IDAgfHwgdGhpcy5wb3NpdGlvbi5hID49IG1hcFswXS5sZW5ndGggfHwgdGhpcy5wb3NpdGlvbi5jID49IG1hcC5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgeCA9IHRoaXMucG9zaXRpb24uYSA8PCAwO1xyXG5cdHZhciB5ID0gdGhpcy5wb3NpdGlvbi5iICsgMC41O1xyXG5cdHZhciB6ID0gdGhpcy5wb3NpdGlvbi5jIDw8IDA7XHJcblx0dmFyIHRpbGUgPSBtYXBbel1beF07XHJcblx0XHJcblx0aWYgKHRpbGUudyB8fCB0aWxlLndkIHx8IHRpbGUud2QpIHJldHVybiBmYWxzZTtcclxuXHRpZiAoeSA8IHRpbGUuZnkgfHwgeSA+IHRpbGUuY2gpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgaW5zLCBkZnM7XHJcblx0aWYgKHRoaXMudGFyZ2V0ID09ICdlbmVteScpe1xyXG5cdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZXNOZWFyZXN0KHRoaXMucG9zaXRpb24sIDAuNSwgJ2VuZW15Jyk7XHJcblx0XHR2YXIgZGlzdCA9IDEwMDAwO1xyXG5cdFx0aWYgKGluc3RhbmNlcy5sZW5ndGggPiAxKXtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0dmFyIHh4ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5hIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0XHRcdHZhciB5eSA9IE1hdGguYWJzKHRoaXMucG9zaXRpb24uYyAtIGluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgZCA9IHh4ICogeHggKyB5eSAqIHl5O1xyXG5cdFx0XHRcdGlmIChkIDwgZGlzdCl7XHJcblx0XHRcdFx0XHRkaXN0ID0gZDtcclxuXHRcdFx0XHRcdGlucyA9IGluc3RhbmNlc1tpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmIChpbnN0YW5jZXMubGVuZ3RoID09IDEpe1xyXG5cdFx0XHRpbnMgPSBpbnN0YW5jZXNbMF07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKGlucy5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdH1lbHNle1xyXG5cdFx0aW5zID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRcdGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgodGhpcy5zdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdGlmICh0aGlzLm1pc3NlZCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKGRtZyAhPSAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIHBvaW50cyBpbmZsaWN0ZWRcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ2hpdCcpO1xyXG5cdFx0aW5zLnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy52c3BlZWQgKz0gdGhpcy5ncmF2aXR5O1xyXG5cdFxyXG5cdHZhciB4VG8gPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5zcGVlZDtcclxuXHR2YXIgeVRvID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5hKSAqIHRoaXMuc3BlZWQgLSB0aGlzLnZzcGVlZDtcclxuXHR2YXIgelRvID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24uc3VtKHZlYzMoeFRvLCB5VG8sIHpUbykpO1xyXG5cdFxyXG5cdGlmICghdGhpcy5jaGVja0NvbGxpc2lvbigpKXtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07IiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bm9ybWFsczoge1xyXG5cdFx0ZG93bjogIHZlYzIoIDAsIDEpLFxyXG5cdFx0cmlnaHQ6IHZlYzIoIDEsIDApLFxyXG5cdFx0dXA6ICAgIHZlYzIoIDAsLTEpLFxyXG5cdFx0bGVmdDogIHZlYzIoLTEsIDApLFxyXG5cdFx0XHJcblx0XHR1cFJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0dXBMZWZ0OiAgdmVjMigtTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCAtTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKSxcclxuXHRcdGRvd25SaWdodDogIHZlYzIoTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCBNYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93bkxlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSlcclxuXHR9LFxyXG5cdFxyXG5cdGN1YmU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0LCAvKlt1LGwsZCxyXSovIGZhY2VzKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXTtcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGlmICghZmFjZXMpIGZhY2VzID0gWzEsMSwxLDFdO1xyXG5cdFx0aWYgKGZhY2VzWzBdKXsgLy8gVXAgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgXHQgdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1sxXSl7IC8vIExlZnQgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0XHQgdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDAsMCwwLDApO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzJdKXsgLy8gRG93biBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHRcdCB3LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMSwxLDEsMSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbM10peyAvLyBSaWdodCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHRcdC13LCAgMCwgIGwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHRcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHRcdDAuMCwgdHksXHJcblx0XHRcdFx0MC4wLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGZsb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRjZWlsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgMC4wLCAgbCxcclxuXHRcdFx0IHcsIDAuMCwgLWwsXHJcblx0XHRcdC13LCAwLjAsICBsLFxyXG5cdFx0XHQtdywgMC4wLCAtbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAyLCAxLCAxLCAyLCAzKTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRkb29yV2FsbDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jICogMC4wNTtcclxuXHRcdFxyXG5cdFx0dmFyIHcyID0gLXNpemUuYSAqIDAuMjU7XHJcblx0XHR2YXIgdzMgPSBzaXplLmEgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgaDIgPSAxIC0gc2l6ZS5iICogMC4yNTtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQvLyBSaWdodCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0LXcsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dzIsICBoLCAgbCxcclxuXHRcdFx0dzIsICAwLCAgbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIExlZnQgcGFydCBvZiB0aGUgZG9vclxyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCB3LCAgMCwgLWwsXHJcblx0XHRcdHczLCAgaCwgLWwsXHJcblx0XHRcdHczLCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsICAwLCAgbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIE1pZGRsZSBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzIsICBoLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgaDIsICBsLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgaDIsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIEJvdHRvbSBGYWNlXHJcblx0XHRcdHczLCBoMiwgLWwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdHcyLCBoMiwgLWwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTw2O2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuMjUsIHR5LFxyXG5cdFx0XHRcdDAuMjUsMC4wLFxyXG5cdFx0XHRcdDAuMDAsIHR5LFxyXG5cdFx0XHRcdDAuMDAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuNSwxLjAsXHJcblx0XHRcdFx0MC41LDAuNzUsXHJcblx0XHRcdFx0MC4wLDEuMCxcclxuXHRcdFx0XHQwLjAsMC43NVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwzNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0fSxcclxuXHRcclxuXHRkb29yOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBsaWdodCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYTtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBMZWZ0IEZhY2VcclxuXHRcdFx0IDAsICBoLCAtbCxcclxuXHRcdFx0IDAsICAwLCAtbCxcclxuXHRcdFx0IDAsICBoLCAgbCxcclxuXHRcdFx0IDAsICAwLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKHR4LCB0eSwgdHgsMC4wLCAwLjAsIHR5LCAwLjAsMC4wKTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKDAuMCwgdHksIDAuMCwwLjAsIHR4LCB0eSwgdHgsMC4wKTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4wMSwwLjAxLFxyXG5cdFx0XHRcdDAuMDEsMC4wLFxyXG5cdFx0XHRcdDAuMCAsMC4wMSxcclxuXHRcdFx0XHQwLjAgLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRmb3IgKHZhciBpPTA7aTwxNjtpKyspe1xyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0cmV0dXJuIGRvb3I7XHJcblx0fSxcclxuXHRcclxuXHRiaWxsYm9hcmQ6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IHcsICBoLCAgMCxcclxuXHRcdFx0LXcsICBoLCAgMCxcclxuXHRcdFx0IHcsICAwLCAgMCxcclxuXHRcdFx0LXcsICAwLCAgMCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49NDtpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW1xyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHRdO1xyXG5cdFx0XHRcdCBcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBiaWxsID0gIHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YmlsbC5pc0JpbGxib2FyZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gYmlsbDtcclxuXHR9LFxyXG5cdFxyXG5cdHNsb3BlOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBkaXIpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCAvLyBGcm9udCBTbG9wZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQgLy8gUmlnaHQgU2lkZVxyXG5cdFx0XHQgdywgIDAuNSwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdCAvLyBMZWZ0IFNpZGVcclxuXHRcdFx0LXcsICAwLjUsICBsLFxyXG5cdFx0XHQtdywgIDAuMCwgLWwsXHJcblx0XHRcdC13LCAgMC4wLCAgbFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aWYgKGRpciAhPSAwKXtcclxuXHRcdFx0dmFyIGFuZyA9IE1hdGguZGVnVG9SYWQoZGlyICogLTkwKTtcclxuXHRcdFx0dmFyIEMgPSBNYXRoLmNvcyhhbmcpO1xyXG5cdFx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHZlcnRleC5sZW5ndGg7aSs9Myl7XHJcblx0XHRcdFx0dmFyIGEgPSB2ZXJ0ZXhbaV0gKiBDIC0gdmVydGV4W2krMl0gKiBTO1xyXG5cdFx0XHRcdHZhciBiID0gdmVydGV4W2ldICogUyArIHZlcnRleFtpKzJdICogQztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2ZXJ0ZXhbaV0gPSBhO1xyXG5cdFx0XHRcdHZlcnRleFtpKzJdID0gYjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGluZGljZXMucHVzaCgwLCAxLCAyLCAyLCAxLCAzLCA0LCA1LCA2LCA3LCA4LCA5KTtcclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0IHR4LCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5LFxyXG5cdFx0XHRcclxuXHRcdFx0MC4wLCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsICB0eVxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFswLDAsMCwwLDAsMCwwLDAsMCwwXTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRhc3NlbWJsZU9iamVjdDogZnVuY3Rpb24obWFwRGF0YSwgb2JqZWN0VHlwZSwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIHJlY3QgPSBbNjQsNjQsMCwwXTsgLy8gW3gxLHkxLHgyLHkyXVxyXG5cdFx0Zm9yICh2YXIgeT0wLHlsZW49bWFwRGF0YS5sZW5ndGg7eTx5bGVuO3krKyl7XHJcblx0XHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGFbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRcdHZhciB0ID0gKG1hcERhdGFbeV1beF0udGlsZSk/IG1hcERhdGFbeV1beF0udGlsZSA6IDA7XHJcblx0XHRcdFx0aWYgKHQgIT0gMCl7XHJcblx0XHRcdFx0XHQvLyBTZWxlY3RpbmcgYm91bmRhcmllcyBvZiB0aGUgbWFwIHBhcnRcclxuXHRcdFx0XHRcdHJlY3RbMF0gPSBNYXRoLm1pbihyZWN0WzBdLCB4IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzFdID0gTWF0aC5taW4ocmVjdFsxXSwgeSAtIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFsyXSA9IE1hdGgubWF4KHJlY3RbMl0sIHggKyA2KTtcclxuXHRcdFx0XHRcdHJlY3RbM10gPSBNYXRoLm1heChyZWN0WzNdLCB5ICsgNik7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHZhciB2djtcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiRlwiKXsgdnYgPSB0aGlzLmZsb29yKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIEZsb29yXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIkNcIil7IHZ2ID0gdGhpcy5jZWlsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCk7IH1lbHNlIC8vIENlaWxcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQlwiKXsgdnYgPSB0aGlzLmN1YmUodmVjMygxLjAsbWFwRGF0YVt5XVt4XS5oLDEuMCksIHZlYzIoMS4wLG1hcERhdGFbeV1beF0uaCksIGdsLCBmYWxzZSwgdGhpcy5nZXRDdWJlRmFjZXMobWFwRGF0YSwgeCwgeSkpOyB9ZWxzZSAvLyBCbG9ja1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJTXCIpeyB2diA9IHRoaXMuc2xvcGUodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsLCBtYXBEYXRhW3ldW3hdLmRpcik7IH0gLy8gU2xvcGVcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZlcnRleE9mZiA9IHZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnZlcnRpY2VzLmxlbmd0aDtpPGxlbjtpKz0zKXtcclxuXHRcdFx0XHRcdFx0eHggPSB2di52ZXJ0aWNlc1tpXSArIHggKyAwLjU7XHJcblx0XHRcdFx0XHRcdHl5ID0gdnYudmVydGljZXNbaSsxXSArIG1hcERhdGFbeV1beF0ueTtcclxuXHRcdFx0XHRcdFx0enogPSB2di52ZXJ0aWNlc1tpKzJdICsgeSArIDAuNTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRpY2VzLnB1c2goeHgsIHl5LCB6eik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuaW5kaWNlcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh2di5pbmRpY2VzW2ldICsgdmVydGV4T2ZmKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di50ZXhDb29yZHMubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHR0ZXhDb29yZHMucHVzaCh2di50ZXhDb29yZHNbaV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LmRhcmtWZXJ0ZXgubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHRkYXJrVmVydGV4LnB1c2godnYuZGFya1ZlcnRleFtpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YnVmZmVyLmJvdW5kYXJpZXMgPSByZWN0O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gYnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0Q3ViZUZhY2VzOiBmdW5jdGlvbihtYXAsIHgsIHkpe1xyXG5cdFx0dmFyIHJldCA9IFsxLDEsMSwxXTtcclxuXHRcdHZhciB0aWxlID0gbWFwW3ldW3hdO1xyXG5cdFx0XHJcblx0XHQvLyBVcCBGYWNlXHJcblx0XHRpZiAoeSA+IDAgJiYgbWFwW3ktMV1beF0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ktMV1beF07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMF0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBMZWZ0IGZhY2VcclxuXHRcdGlmICh4IDwgNjMgJiYgbWFwW3ldW3grMV0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ldW3grMV07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMV0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBEb3duIGZhY2VcclxuXHRcdGlmICh5IDwgNjMgJiYgbWFwW3krMV1beF0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3krMV1beF07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMl0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBSaWdodCBmYWNlXHJcblx0XHRpZiAoeCA+IDAgJiYgbWFwW3ldW3gtMV0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ldW3gtMV07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbM10gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRPYmplY3RXaXRoUHJvcGVydGllczogZnVuY3Rpb24odmVydGV4QnVmZmVyLCBpbmRleEJ1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKXtcclxuXHRcdHZhciBvYmogPSB7XHJcblx0XHRcdHJvdGF0aW9uOiB2ZWMzKDAsIDAsIDApLFxyXG5cdFx0XHRwb3NpdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0dmVydGV4QnVmZmVyOiB2ZXJ0ZXhCdWZmZXIsIFxyXG5cdFx0XHRpbmRpY2VzQnVmZmVyOiBpbmRleEJ1ZmZlciwgXHJcblx0XHRcdHRleEJ1ZmZlcjogdGV4QnVmZmVyLFxyXG5cdFx0XHRkYXJrQnVmZmVyOiBkYXJrQnVmZmVyXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH0sXHJcblx0XHJcblx0Y3JlYXRlM0RPYmplY3Q6IGZ1bmN0aW9uKGdsLCBiYXNlT2JqZWN0KXtcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoYmFzZU9iamVjdC52ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudmVydGljZXMubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC50ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoYmFzZU9iamVjdC5pbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QuaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGJhc2VPYmplY3QuZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBidWZmZXIgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdHRyYW5zbGF0ZU9iamVjdDogZnVuY3Rpb24ob2JqZWN0LCB0cmFuc2xhdGlvbil7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPW9iamVjdC52ZXJ0aWNlcy5sZW5ndGg7aTxsZW47aSs9Myl7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpXSArPSB0cmFuc2xhdGlvbi5hO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsxXSArPSB0cmFuc2xhdGlvbi5iO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsyXSArPSB0cmFuc2xhdGlvbi5jO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqZWN0O1xyXG5cdH0sXHJcblx0XHJcblx0ZnV6ZU9iamVjdHM6IGZ1bmN0aW9uKG9iamVjdExpc3Qpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIGluZGV4Q291bnQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3RMaXN0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHR2YXIgb2JqID0gb2JqZWN0TGlzdFtpXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai52ZXJ0aWNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dmVydGljZXMucHVzaChvYmoudmVydGljZXNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudGV4Q29vcmRzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHR0ZXhDb29yZHMucHVzaChvYmoudGV4Q29vcmRzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmluZGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGluZGljZXMucHVzaChvYmouaW5kaWNlc1tqXSArIGluZGV4Q291bnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmouZGFya1ZlcnRleC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKG9iai5kYXJrVmVydGV4W2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aW5kZXhDb3VudCArPSBvYmoudmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGljZXMsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGxvYWQzRE1vZGVsOiBmdW5jdGlvbihtb2RlbEZpbGUsIGdsKXtcclxuXHRcdHZhciBtb2RlbCA9IHtyZWFkeTogZmFsc2V9O1xyXG5cdFx0XHJcblx0XHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRcdGh0dHAub3BlbihcIkdFVFwiLCBjcCArIFwibW9kZWxzL1wiICsgbW9kZWxGaWxlICsgXCIub2JqP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHRcdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGh0dHAucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG5cdFx0XHRcdHZhciBsaW5lcyA9IGh0dHAucmVzcG9uc2VUZXh0LnNwbGl0KFwiXFxuXCIpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB2ZXJ0aWNlcyA9IFtdLCB0ZXhDb29yZHMgPSBbXSwgdHJpYW5nbGVzID0gW10sIHZlcnRleEluZGV4ID0gW10sIHRleEluZGljZXMgPSBbXSwgaW5kaWNlcyA9IFtdLCBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcdFx0dmFyIHdvcmtpbmc7XHJcblx0XHRcdFx0dmFyIHQgPSBmYWxzZTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPWxpbmVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0dmFyIGwgPSBsaW5lc1tpXS50cmltKCk7XHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIlwiKXsgY29udGludWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdmVydGljZXNcIil7IHdvcmtpbmcgPSB2ZXJ0aWNlczsgdCA9IGZhbHNlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRleENvb3Jkc1wiKXsgd29ya2luZyA9IHRleENvb3JkczsgdCA9IHRydWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdHJpYW5nbGVzXCIpeyB3b3JraW5nID0gdHJpYW5nbGVzOyB0ID0gZmFsc2U7IH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhciBwYXJhbXMgPSBsLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49cGFyYW1zLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcmFtc1tqXSkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW1zW2pdID0gcGFyc2VGbG9hdChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXQpIHdvcmtpbmcucHVzaChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmICh0KSB3b3JraW5nLnB1c2gocGFyYW1zKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHVzZWRWZXIgPSBbXTtcclxuXHRcdFx0XHR2YXIgdXNlZEluZCA9IFtdO1xyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dHJpYW5nbGVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0aWYgKHVzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pICE9IC0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHVzZWRJbmRbdXNlZFZlci5pbmRleE9mKHRyaWFuZ2xlc1tpXSldKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR1c2VkVmVyLnB1c2godHJpYW5nbGVzW2ldKTtcclxuXHRcdFx0XHRcdFx0dmFyIHQgPSB0cmlhbmdsZXNbaV0uc3BsaXQoXCIvXCIpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRbMF0gPSBwYXJzZUludCh0WzBdKSAtIDE7XHJcblx0XHRcdFx0XHRcdHRbMV0gPSBwYXJzZUludCh0WzFdKSAtIDE7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdHVzZWRJbmQucHVzaCh2ZXJ0ZXhJbmRleC5sZW5ndGggLyAzKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRleEluZGV4LnB1c2godmVydGljZXNbdFswXSAqIDNdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDFdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDJdKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRleEluZGljZXMucHVzaCh0ZXhDb29yZHNbdFsxXV1bMF0sIHRleENvb3Jkc1t0WzFdXVsxXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dGV4SW5kaWNlcy5sZW5ndGgvMjtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgYmFzZSA9IHt2ZXJ0aWNlczogdmVydGV4SW5kZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4SW5kaWNlcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0XHRcdFx0dmFyIG1vZGVsM0QgPSB0aGlzLmNyZWF0ZTNET2JqZWN0KGdsLCBiYXNlKTtcclxuXHJcblx0XHRcdFx0bW9kZWwucm90YXRpb24gPSBtb2RlbDNELnJvdGF0aW9uO1xyXG5cdFx0XHRcdG1vZGVsLnBvc2l0aW9uID0gbW9kZWwzRC5wb3NpdGlvbjtcclxuXHRcdFx0XHRtb2RlbC52ZXJ0ZXhCdWZmZXIgPSBtb2RlbDNELnZlcnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5pbmRpY2VzQnVmZmVyID0gbW9kZWwzRC5pbmRpY2VzQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnRleEJ1ZmZlciA9IG1vZGVsM0QudGV4QnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLmRhcmtCdWZmZXIgPSBtb2RlbDNELmRhcmtCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0aHR0cC5zZW5kKCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBtb2RlbDtcclxuXHR9XHJcbn07XHJcbiIsInZhciBNaXNzaWxlID0gcmVxdWlyZSgnLi9NaXNzaWxlJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbnZhciBjaGVhdEVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbiwgZGlyZWN0aW9uLCBtYXBNYW5hZ2VyKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IGRpcmVjdGlvbjtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMucm90YXRpb25TcGQgPSB2ZWMyKE1hdGguZGVnVG9SYWQoMSksIE1hdGguZGVnVG9SYWQoNCkpO1xyXG5cdHRoaXMubW92ZW1lbnRTcGQgPSAwLjA1O1xyXG5cdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41O1xyXG5cdHRoaXMubWF4VmVydFJvdGF0aW9uID0gTWF0aC5kZWdUb1JhZCg0NSk7XHJcblx0XHJcblx0dGhpcy50YXJnZXRZID0gcG9zaXRpb24uYjtcclxuXHR0aGlzLnlTcGVlZCA9IDAuMDtcclxuXHR0aGlzLnlHcmF2aXR5ID0gMC4wO1xyXG5cdFxyXG5cdHRoaXMuam9nID0gdmVjNCgwLjAsIDEsIDAuMCwgMSk7XHJcblx0dGhpcy5vbldhdGVyID0gZmFsc2U7XHJcblx0dGhpcy5tb3ZlZCA9IGZhbHNlO1xyXG5cclxuXHR0aGlzLmh1cnQgPSAwLjA7XHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuXHJcblBsYXllci5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLnBsYXllcjtcclxuXHRwbGF5ZXIuaHAgLT0gZG1nO1xyXG5cdGlmIChwbGF5ZXIuaHAgPD0gMCl7XHJcblx0XHRwbGF5ZXIuaHAgPSAwO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3UgZGllZCFcIik7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0TWlzc2lsZSA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMuc3RyKTtcclxuXHRpZiAod2VhcG9uKSBzdHIgKz0gVXRpbHMucm9sbERpY2Uod2VhcG9uLnN0cikgKiB3ZWFwb24uc3RhdHVzO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHRoaXMucG9zaXRpb24uY2xvbmUoKSwgdGhpcy5yb3RhdGlvbi5jbG9uZSgpLCB3ZWFwb24uY29kZSwgJ2VuZW15JywgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdG1pc3NpbGUubWlzc2VkID0gKHByb2IgPiBwcy5zdGF0cy5kZXgpO1xyXG5cdC8vIGlmICh3ZWFwb24pIHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTtcclxuXHRcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBzaG9vdCBcIiArIHdlYXBvbi5zdWJJdGVtTmFtZSk7XHJcblx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdHRoaXMubW92ZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tZWxlZUF0dGFjayA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGVuZW1pZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAxLjAsICdlbmVteScpO1xyXG5cdFx0XHJcblx0dmFyIHh4ID0gdGhpcy5wb3NpdGlvbi5hO1xyXG5cdHZhciB6eiA9IHRoaXMucG9zaXRpb24uYztcclxuXHR2YXIgZHggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdHZhciBkeiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR4eCArPSBkeDtcclxuXHRcdHp6ICs9IGR6O1xyXG5cdFx0dmFyIG9iamVjdDtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49ZW5lbWllcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdHZhciBpbnMgPSBlbmVtaWVzW2pdO1xyXG5cdFx0XHR2YXIgeCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0geHgpO1xyXG5cdFx0XHR2YXIgeiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0genopO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHggPCAwLjMgJiYgeiA8IDAuMyl7XHJcblx0XHRcdFx0b2JqZWN0ID0gaW5zO1xyXG5cdFx0XHRcdGogPSBqbGVuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmVuZW15KXtcclxuXHRcdFx0dGhpcy5jYXN0QXR0YWNrKG9iamVjdCwgd2VhcG9uKTtcclxuXHRcdFx0dGhpcy5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRcdHRoaXMubW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRpID0gMTE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0QXR0YWNrID0gZnVuY3Rpb24odGFyZ2V0LCB3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdGlmIChwcm9iID4gcHMuc3RhdHMuZGV4KXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdC8vdmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRhcmdldC5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdHZhciBkZnMgPSAwO1xyXG5cdFxyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCkgPDwgMDtcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkF0dGFja2luZyBcIiArIHRhcmdldC5lbmVteS5uYW1lKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShkbWcgKyBcIiBwb2ludHMgaW5mbGljdGVkXCIpO1xyXG5cdFx0dGFyZ2V0LnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8vaWYgKHdlYXBvbikgd2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5qb2dNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlcil7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA1ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwOCAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKSB0aGlzLmpvZy5iID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR2YXIgc3dpbSA9ICh0aGlzLm9uTGF2YSB8fCB0aGlzLm9uV2F0ZXIpO1xyXG5cdGlmIChzd2ltKXsgeFRvIC89IDI7IHpUbyAvPTI7IH1cclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHN3aW0pO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHR0aGlzLmRvVmVydGljYWxDaGVja3MoKTtcclxuXHRcdHRoaXMuam9nTW92ZW1lbnQoKTtcclxuXHRcdG1vdmVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IG1vdmVkO1xyXG5cdHJldHVybiBtb3ZlZDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW91c2VMb29rID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbU1vdmVtZW50ID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuZ2V0TW91c2VNb3ZlbWVudCgpO1xyXG5cdFxyXG5cdGlmIChtTW92ZW1lbnQueCAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmIgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueCk7IH1cclxuXHRpZiAobU1vdmVtZW50LnkgIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5hIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LnkpOyB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdHRoaXMubW91c2VMb29rKCk7XHJcblxyXG5cdC8vIFJvdGF0aW9uIHdpdGgga2V5Ym9hcmRcclxuXHRpZiAoZ2FtZS5rZXlzWzgxXSA9PSAxIHx8IGdhbWUua2V5c1szN10gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgKz0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjldID09IDEgfHwgZ2FtZS5rZXlzWzM5XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiAtPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1szOF0gPT0gMSl7IC8vIFVwIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgKz0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNDBdID09IDEpeyAvLyBEb3duIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgLT0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHR2YXIgQSA9IDAuMCwgQiA9IDAuMDtcclxuXHRpZiAoZ2FtZS5rZXlzWzg3XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s4M10gPT0gMSl7XHJcblx0XHRBID0gLU1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdFx0QiA9IE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZ2FtZS5rZXlzWzY1XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OF0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoQSAhPSAwLjAgfHwgQiAhPSAwLjApeyB0aGlzLm1vdmVUbyhBLCBCKTsgfWVsc2V7IHRoaXMuam9nLmEgPSAwLjA7IH1cclxuXHRpZiAodGhpcy5yb3RhdGlvbi5hID4gdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IHRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG5cdGVsc2UgaWYgKHRoaXMucm90YXRpb24uYSA8IC10aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gLXRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jaGVja0FjdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDMyKSl7IC8vIFNwYWNlXHJcblx0XHR2YXIgeHggPSAodGhpcy5wb3NpdGlvbi5hICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdHZhciB6eiA9ICh0aGlzLnBvc2l0aW9uLmMgLSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0XHJcblx0XHRpZiAoKHRoaXMucG9zaXRpb24uYSA8PCAwKSA9PSB4eCAmJiAodGhpcy5wb3NpdGlvbi5jIDw8IDApID09IHp6KSByZXR1cm47XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdCh4eCwgdGhpcy5wb3NpdGlvbi5iLCB6eik7XHJcblx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRkb29yLmFjdGl2YXRlKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KSk7XHJcblx0XHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmFjdGl2YXRlKVxyXG5cdFx0XHRcdG9iamVjdC5hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNoZWF0RW5hYmxlZCl7XHJcblx0XHRcdGlmIChnYW1lLmZsb29yRGVwdGggPCA4KVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIGdhbWUuZmxvb3JEZXB0aCArIDEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKChnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpIHx8IGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykpICYmIHRoaXMuYXR0YWNrV2FpdCA9PSAwKXtcdC8vIE1lbGVlIGF0dGFjaywgRW50ZXJcclxuXHRcdHZhciB3ZWFwb24gPSBnYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFxyXG5cdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpeyBcclxuXHRcdFx0dGhpcy5tZWxlZUF0dGFjayh3ZWFwb24pO1xyXG5cdFx0fWVsc2UgaWYgKHdlYXBvbiAmJiB3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5jYXN0TWlzc2lsZSh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAod2VhcG9uICYmIHdlYXBvbi5zdGF0dXMgPCAwLjA1KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmRlc3Ryb3lJdGVtKHdlYXBvbik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHdlYXBvbi5uYW1lICsgXCIgZGFtYWdlZCFcIik7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYyk7XHJcblx0dmFyIHd5ID0gKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSk/IDAuMyA6IDA7XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gKHRoaXMucG9zaXRpb24uYiArIHd5KSkgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmlzTGF2YVBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdGlmICghdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5vbkxhdmEgPSB0cnVlO1xyXG5cdFx0XHJcblx0fSBlbHNlIGlmICh0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID09IHRoaXMudGFyZ2V0WSlcclxuXHRcdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDI1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gdHJ1ZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fWVsc2Uge1xyXG5cdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvRmxvYXQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIgJiYgdGhpcy5qb2cuYSA9PSAwLjApe1xyXG5cdFx0dGhpcy5qb2cuYyArPSAwLjAwNSAqIHRoaXMuam9nLmQ7XHJcblx0XHRpZiAodGhpcy5qb2cuYyA+PSAwLjAzICYmIHRoaXMuam9nLmQgPT0gMSkgdGhpcy5qb2cuZCA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYyA8PSAtMC4wMyAmJiB0aGlzLmpvZy5kID09IC0xKSB0aGlzLmpvZy5kID0gMTtcclxuXHRcdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5jID0gMC4wO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuZG9GbG9hdCgpO1xyXG5cdHRoaXMubW92ZW1lbnQoKTtcclxuXHR0aGlzLmNoZWNrQWN0aW9uKCk7XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID49IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1cclxuXHRcclxuXHQvL3RoaXMudGFyZ2V0WSA9IHRoaXMucG9zaXRpb24uYjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5jYW1lcmFIZWlnaHQgPiAwLjIpeyBcclxuXHRcdFx0dGhpcy5jYW1lcmFIZWlnaHQgLT0gMC4wMTsgXHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGlmICh0aGlzLm9uTGF2YSl7XHJcblx0XHRpZiAodGhpcy5sYXZhQ291bnRlciA+IDMwKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyKys7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdH1cclxuXHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCkgdGhpcy5hdHRhY2tXYWl0IC09IDE7XHJcblx0aWYgKHRoaXMuaHVydCA+IDApIHRoaXMuaHVydCAtPSAxO1xyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ZXAoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gUGxheWVyU3RhdHMoKXtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5zdGF0cyA9IHtcclxuXHRcdHN0cjogJzBEMCcsXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclN0YXRzO1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0c3RyOiAnMEQwJyxcclxuXHRcdGRmczogJzBEMCcsXHJcblx0XHRkZXg6IDAsXHJcblx0XHRtYWdpY1Bvd2VyOiAnMEQwJ1xyXG5cdH07XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGFtb3VudCwgY29uc29sZSl7XHJcblx0dGhpcy5leHAgKz0gYW1vdW50O1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKGFtb3VudCArIFwiIFhQIGdhaW5lZFwiKTtcclxuXHR2YXIgbmV4dEV4cCA9IChNYXRoLnBvdyh0aGlzLmx2bCwgMS41KSAqIDUwMCkgPDwgMDtcclxuXHRpZiAodGhpcy5leHAgPj0gbmV4dEV4cCl7IHRoaXMubGV2ZWxVcChjb25zb2xlKTsgfVxyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmxldmVsVXAgPSBmdW5jdGlvbihjb25zb2xlKXtcclxuXHR0aGlzLmx2bCArPSAxO1xyXG5cdFxyXG5cdC8vIFVwZ3JhZGUgSFAgYW5kIE1hbmFcclxuXHR2YXIgaHBOZXcgPSBNYXRoLmlSYW5kb20oMTAsIDI1KTtcclxuXHR2YXIgbWFuYU5ldyA9IE1hdGguaVJhbmRvbSg1LCAxNSk7XHJcblx0XHJcblx0dmFyIGhwT2xkID0gdGhpcy5tSFA7XHJcblx0dmFyIG1hbmFPbGQgPSB0aGlzLm1NYW5hO1xyXG5cdFxyXG5cdHRoaXMuaHAgICs9IGhwTmV3O1xyXG5cdHRoaXMubWFuYSArPSBtYW5hTmV3O1xyXG5cdHRoaXMubUhQICs9IGhwTmV3O1xyXG5cdHRoaXMubU1hbmEgKz0gbWFuYU5ldztcclxuXHRcclxuXHQvLyBVcGdyYWRlIGEgcmFuZG9tIHN0YXQgYnkgMS0zIHBvaW50c1xyXG5cdC8qXHJcblx0dmFyIHN0YXRzID0gWydzdHInLCAnZGZzJ107XHJcblx0dmFyIG5hbWVzID0gWydTdHJlbmd0aCcsICdEZWZlbnNlJ107XHJcblx0dmFyIHN0LCBubTtcclxuXHR3aGlsZSAoIXN0KXtcclxuXHRcdHZhciBpbmQgPSBNYXRoLmlSYW5kb20oc3RhdHMubGVuZ3RoKTtcclxuXHRcdHN0ID0gc3RhdHNbaW5kXTtcclxuXHRcdG5tID0gbmFtZXNbaW5kXTtcclxuXHR9XHJcblx0XHJcblx0dmFyIHBhcnQxID0gcGFyc2VJbnQodGhpcy5zdGF0c1tzdF0uc3Vic3RyaW5nKDAsIHRoaXMuc3RhdHNbc3RdLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRwYXJ0MSArPSBNYXRoLmlSYW5kb20oMSwgMyk7XHJcblx0XHJcblx0dmFyIG9sZCA9IHRoaXMuc3RhdHNbc3RdO1xyXG5cdHRoaXMuc3RhdHNbc3RdID0gcGFydDEgKyAnRDMnOyovXHJcblx0XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJMZXZlbCB1cDogXCIgKyB0aGlzLmx2bCArIFwiIVwiKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIkhQIGluY3JlYXNlZCBmcm9tIFwiICsgaHBPbGQgKyBcIiB0byBcIiArIHRoaXMubUhQKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIk1hbmEgaW5jcmVhc2VkIGZyb20gXCIgKyBtYW5hT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1NYW5hKTtcclxuXHQvL2NvbnNvbGUuYWRkU0ZNZXNzYWdlKG5tICsgXCIgaW5jcmVhc2VkIGZyb20gXCIgKyBvbGQgKyBcIiB0byBcIiArIHRoaXMuc3RhdHNbc3RdKTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5zZXRWaXJ0dWUgPSBmdW5jdGlvbih2aXJ0dWVOYW1lKXtcclxuXHR0aGlzLnZpcnR1ZSA9IHZpcnR1ZU5hbWU7XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHRzd2l0Y2ggKHZpcnR1ZU5hbWUpe1xyXG5cdFx0Y2FzZSBcIkhvbmVzdHlcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDYwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMjAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA2O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdNYWdlJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiQ29tcGFzc2lvblwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ0JhcmQnO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJWYWxvclwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdGaWdodGVyJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSG9ub3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdQYWxhZGluJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU3Bpcml0dWFsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Jhbmdlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkh1bWlsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDI7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjg7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1NoZXBoZXJkJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU2FjcmlmaWNlXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA4MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnVGlua2VyJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSnVzdGljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxNTA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdEcnVpZCc7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tSFAgPSB0aGlzLmhwO1xyXG5cdHRoaXMuc3RhdHMuc3RyICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5kZnMgKz0gJ0QzJztcclxuXHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgKz0gJ0QzJztcclxuXHR0aGlzLm1NYW5hID0gdGhpcy5tYW5hO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBTZWxlY3RDbGFzcygvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdENsYXNzO1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5nYW1lO1xyXG5cdHZhciBwbGF5ZXJTID0gZ2FtZS5wbGF5ZXI7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHR2YXIgbW91c2UgPSBnYW1lLm1vdXNlO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5iID49IDI4ICYmIGdhbWUubW91c2UuYiA8IDEwMCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25lc3R5XCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiQ29tcGFzc2lvblwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlZhbG9yXCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJKdXN0aWNlXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGdhbWUubW91c2UuYiA+PSAxMDAgJiYgZ2FtZS5tb3VzZS5iIDwgMTcwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNhY3JpZmljZVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbm9yXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU3Bpcml0dWFsaXR5XCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIdW1pbGl0eVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHBsYXllclMudmlydHVlICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkocGxheWVyUy5jbGFzc05hbWUpO1xyXG5cdFx0XHRnYW1lLmxvYWRNYXAoZmFsc2UsIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5zZWxlY3RDbGFzcywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5mdW5jdGlvbiBTdGFpcnMocG9zaXRpb24sIG1hcE1hbmFnZXIsIGRpcmVjdGlvbil7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5zdGFpcnMgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLnRhcmdldElkID0gdGhpcy5tYXBNYW5hZ2VyLmRlcHRoO1xyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ2Rvd24nKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgKz0gMTtcclxuXHRcdHRoaXMuaW1nSW5kID0gMTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSBudWxsO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWlycztcclxuXHJcblN0YWlycy5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRhcmdldElkIDwgOSlcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIHRoaXMudGFyZ2V0SWQpO1xyXG5cdGVsc2Uge1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50aWxlICE9IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSB0aGlzLm1hcE1hbmFnZXIubWFwW3RoaXMucG9zaXRpb24uYyA8PCAwXVt0aGlzLnBvc2l0aW9uLmEgPDwgMF07XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcgJiYgdGhpcy50aWxlLmNoID4gMSl7XHJcblx0XHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiA8PCAwO1xyXG5cdFx0Zm9yICh2YXIgaT15KzE7aTx0aGlzLnRpbGUuY2g7aSsrKXtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0cG9zLmIgPSBpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzJdO1xyXG5cdFx0XHRnYW1lLmRyYXdCaWxsYm9hcmQocG9zLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzNdO1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5nZXRUaWxlKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsInZhciBTZWxlY3RDbGFzcyA9IHJlcXVpcmUoJy4vU2VsZWN0Q2xhc3MnKTtcclxuXHJcbmZ1bmN0aW9uIFRpdGxlU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5ibGluayA9IDMwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlU2NyZWVuO1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdHRoaXMuZ2FtZS5zY2VuZSA9IG5ldyBTZWxlY3RDbGFzcyh0aGlzLmdhbWUpO1xyXG5cdH1cclxufTtcclxuXHJcblRpdGxlU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy50aXRsZVNjcmVlbiwgMCwgMCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFVJKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7XHJcblxyXG5VSS5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSAwO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLmN0eC53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuXHR0aGlzLmN0eC5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG5cdFxyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0dGhpcy5zY2FsZSA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jayA9IGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2s7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2Upe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5kcmF3SW1hZ2Uoc3ByaXRlLFxyXG5cdFx0eEltZyAqIHNwcml0ZS5pbWdXaWR0aCwgeUltZyAqIHNwcml0ZS5pbWdIZWlnaHQsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodCxcclxuXHRcdHgsIHksIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodFxyXG5cdFx0KTtcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3VGV4dCA9IGZ1bmN0aW9uKHRleHQsIHgsIHksIGNvbnNvbGUpe1xyXG5cdHZhciB3ID0gY29uc29sZS5zcGFjZUNoYXJzO1xyXG5cdHZhciBoID0gY29uc29sZS5zcHJpdGVGb250LmhlaWdodDtcclxuXHRmb3IgKHZhciBqPTAsamxlbj10ZXh0Lmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IHRleHQuY2hhckF0KGopO1xyXG5cdFx0dmFyIGluZCA9IGNvbnNvbGUubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0dGhpcy5jdHguZHJhd0ltYWdlKGNvbnNvbGUuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAwLCB3LCBoLFxyXG5cdFx0XHRcdHgsIHksIHcsIGgpO1xyXG5cdFx0fVxyXG5cdFx0eCArPSB3O1xyXG5cdH1cclxufVxyXG5cclxuVUkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbn07IiwidmFyIEFuaW1hdGVkVGV4dHVyZSA9IHJlcXVpcmUoJy4vQW5pbWF0ZWRUZXh0dXJlJyk7XHJcbnZhciBBdWRpb0FQSSA9IHJlcXVpcmUoJy4vQXVkaW8nKTtcclxudmFyIENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcclxudmFyIEludmVudG9yeSA9IHJlcXVpcmUoJy4vSW52ZW50b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE1hcE1hbmFnZXIgPSByZXF1aXJlKCcuL01hcE1hbmFnZXInKTtcclxudmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllclN0YXRzID0gcmVxdWlyZSgnLi9QbGF5ZXJTdGF0cycpO1xyXG52YXIgVGl0bGVTY3JlZW4gPSByZXF1aXJlKCcuL1RpdGxlU2NyZWVuJyk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vVUknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG52YXIgV2ViR0wgPSByZXF1aXJlKCcuL1dlYkdMJyk7XHJcblxyXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cdFx0XHRcdCA3RFJMMTUgU291cmNlIENvZGVcclxuXHRcdFx0XHRcclxuXHRcdFx0QnkgQ2FtaWxvIFJhbcOtcmV6IChKdWNhcmF2ZSlcclxuXHRcdFx0XHJcblx0XHRcdFx0XHQgIDIwMTVcclxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cclxuXHJcbmZ1bmN0aW9uIFVuZGVyd29ybGQoKXtcclxuXHR0aGlzLnNpemUgPSB2ZWMyKDM1NSwgMjAwKTtcclxuXHRcclxuXHR0aGlzLkdMID0gbmV3IFdlYkdMKHRoaXMuc2l6ZSwgVXRpbHMuJCQoXCJkaXZHYW1lXCIpKTtcclxuXHR0aGlzLlVJID0gbmV3IFVJKHRoaXMuc2l6ZSwgVXRpbHMuJCQoXCJkaXZHYW1lXCIpKTtcclxuXHR0aGlzLmF1ZGlvID0gbmV3IEF1ZGlvQVBJKCk7XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyU3RhdHMoKTtcclxuXHR0aGlzLmludmVudG9yeSA9IG5ldyBJbnZlbnRvcnkoMTApO1xyXG5cdHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKDEwLCAxMCwgMzAwLCB0aGlzKTtcclxuXHR0aGlzLmZvbnQgPSAnMTBweCBcIkNvdXJpZXJcIic7XHJcblx0XHJcblx0dGhpcy5nclBhY2sgPSAnaW1nX2hyLyc7XHJcblx0XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMua2V5cyA9IFtdO1xyXG5cdHRoaXMubW91c2UgPSB2ZWMzKDAuMCwgMC4wLCAwKTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdHRoaXMuaW1hZ2VzID0ge307XHJcblx0dGhpcy5tdXNpYyA9IHt9O1xyXG5cdHRoaXMuc291bmRzID0ge307XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbXSwgZmxvb3I6IFtdLCBjZWlsOiBbXX07XHJcblx0dGhpcy5vYmplY3RUZXggPSB7fTtcclxuXHR0aGlzLm1vZGVscyA9IHt9O1xyXG5cdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMudGltZVN0b3AgPSAwO1xyXG5cdHRoaXMucHJvdGVjdGlvbiA9IDA7XHJcblx0XHJcblx0dGhpcy5mcHMgPSAoMTAwMCAvIDMwKSA8PCAwO1xyXG5cdHRoaXMubGFzdFQgPSAwO1xyXG5cdHRoaXMubnVtYmVyRnJhbWVzID0gMDtcclxuXHR0aGlzLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFxyXG5cdHRoaXMubG9hZEltYWdlcygpO1xyXG5cdHRoaXMubG9hZE11c2ljKCk7XHJcblx0dGhpcy5sb2FkVGV4dHVyZXMoKTtcclxuXHRcclxuXHR0aGlzLmNyZWF0ZTNET2JqZWN0cygpO1xyXG5cdEFuaW1hdGVkVGV4dHVyZS5pbml0KHRoaXMuR0wuY3R4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlM0RPYmplY3RzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmRvb3IgPSBPYmplY3RGYWN0b3J5LmRvb3IodmVjMygwLjUsMC43NSwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgZmFsc2UpO1xyXG5cdHRoaXMuZG9vclcgPSBPYmplY3RGYWN0b3J5LmRvb3JXYWxsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5kb29yQyA9IE9iamVjdEZhY3RvcnkuY3ViZSh2ZWMzKDEuMCwxLjAsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDAuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLnNsb3BlID0gT2JqZWN0RmFjdG9yeS5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMuR0wuY3R4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zb3VuZHMuaGl0ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9oaXQud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMubWlzcyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvbWlzcy53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24xID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wOF8tX1VsdGltYV80Xy1fQzY0Xy1fRHVuZ2VvbnMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24yID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMl8tX1VsdGltYV81Xy1fQzY0Xy1fTG9yZF9CbGFja3Rob3JuLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDVfLV9VbHRpbWFfM18tX0M2NF8tX0NvbWJhdC5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzNfLV9DNjRfLV9FeG9kdXMnX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjUgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA0Xy1fVWx0aW1hXzVfLV9DNjRfLV9FbmdhZ2VtZW50X2FuZF9NZWxlZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjYgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAzXy1fVWx0aW1hXzRfLV9DNjRfLV9Mb3JkX0JyaXRpc2gnc19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb243ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMV8tX1VsdGltYV81Xy1fQzY0Xy1fV29ybGRzX0JlbG93Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uOCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTBfLV9VbHRpbWFfNV8tX0M2NF8tX0hhbGxzX29mX0Rvb20ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmNvZGV4Um9vbSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfNF8tX0M2NF8tX1NocmluZXMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRJbWFnZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW1hZ2VzLml0ZW1zX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaXRlbXNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA4LCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuc3BlbGxzX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic3BlbGxzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLnRpdGxlU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGl0bGVTY3JlZW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuZW5kaW5nU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnNlbGVjdENsYXNzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2VsZWN0Q2xhc3MucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5RHJvcC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiAxLCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlfc2VsZWN0ZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2Nyb2xsRm9udCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNjcm9sbEZvbnRXaGl0ZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5yZXN0YXJ0ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicmVzdGFydC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5wYXVzZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJwYXVzZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkVGV4dHVyZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMudGV4dHVyZXMgPSB7d2FsbDogW251bGxdLCBmbG9vcjogW251bGxdLCBjZWlsOiBbbnVsbF0sIHdhdGVyOiBbbnVsbF19O1xyXG5cdFxyXG5cdC8vIE5vIFRleHR1cmVcclxuXHR2YXIgbm9UZXggPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJub1RleHR1cmUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaChub1RleCk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKG5vVGV4KTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaChub1RleCk7XHJcblx0XHJcblx0Ly8gV2FsbHNcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYWxsMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2FsbDAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw2LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEZsb29yc1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhGbG9vcjAzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3JbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIExpcXVpZHNcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2F0ZXIwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TGF2YTAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gQ2VpbGluZ3NcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhDZWlsMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsWzUwXSA9ICh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhIb2xlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNTAsIHRydWUpKTtcclxuXHRcclxuXHQvLyBJdGVtc1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SXRlbXMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtcy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoOCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFNwZWxscy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIE1hZ2ljIEJvbHRzXHJcblx0dGhpcy5vYmplY3RUZXguYm9sdHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhCb2x0cy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gU3RhaXJzXHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4U3RhaXJzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3JkcygyLCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gRW5lbWllc1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwaWRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNwaWRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnRyb2xsX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4VHJvbGxSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5nYXplcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdhemVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2hvc3RfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHaG9zdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmhlYWRsZXNzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4SGVhZGxlc3NSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vcmNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPcmNSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yZWFwZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSZWFwZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5za2VsZXRvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNrZWxldG9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LmRhZW1vbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERhZW1vblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tb25nYmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TW9uZ2JhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oeWRyYV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEh5ZHJhUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNlYVNlcnBlbnRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTZWFTZXJwZW50UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9jdG9wdXNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPY3RvcHVzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhbHJvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhbHJvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5saWNoZV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExpY2hlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ3JlbWxpbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdyZW1saW5SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZHJhZ29uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RHJhZ29uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lnpvcm5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhab3JuUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4Lndpc3BfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhXaXNwUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm1hZ2VfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhNYWdlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhbmdlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhbmdlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5maWdodGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RmlnaHRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4QmFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5sYXZhTGl6YXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGF2YUxpemFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBvc3RMb2FkaW5nID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmNvbnNvbGUuY3JlYXRlU3ByaXRlRm9udCh0aGlzLmltYWdlcy5zY3JvbGxGb250LCBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5IT8sLi9cIiwgNik7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuYXVkaW8uc3RvcE11c2ljKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wbGF5TXVzaWMgPSBmdW5jdGlvbihtdXNpY0NvZGUsIGxvb3Ape1xyXG5cdHZhciBhdWRpb0YgPSB0aGlzLm11c2ljW211c2ljQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuc3RvcE11c2ljKCk7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBsb29wLCB0cnVlLCAwLjIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRDb2RlKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5zb3VuZHNbc291bmRDb2RlXTtcclxuXHRpZiAoIWF1ZGlvRikgcmV0dXJuIG51bGw7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBmYWxzZSwgZmFsc2UsIDAuMyk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRVSSA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuVUkuY3R4O1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VGV4dHVyZUJ5SWQgPSBmdW5jdGlvbih0ZXh0dXJlSWQsIHR5cGUpe1xyXG5cdGlmICghdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdKSB0ZXh0dXJlSWQgPSAxO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLnRleHR1cmVzW3R5cGVdW3RleHR1cmVJZF07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRPYmplY3RUZXh0dXJlID0gZnVuY3Rpb24odGV4dHVyZUNvZGUpe1xyXG5cdGlmICghdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdKSB0aHJvdyBcIkludmFsaWQgdGV4dHVyZSBjb2RlOiBcIiArIHRleHR1cmVDb2RlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLm9iamVjdFRleFt0ZXh0dXJlQ29kZV07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTWFwID0gZnVuY3Rpb24obWFwLCBkZXB0aCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdGlmIChkZXB0aCA9PT0gdW5kZWZpbmVkIHx8ICFnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IG5ldyBNYXBNYW5hZ2VyKGdhbWUsIG1hcCwgZGVwdGgpO1xyXG5cdFx0Z2FtZS5mbG9vckRlcHRoID0gZGVwdGg7XHJcblx0XHRnYW1lLm1hcHMucHVzaChnYW1lLm1hcCk7XHJcblx0fWVsc2UgaWYgKGdhbWUubWFwc1tkZXB0aCAtIDFdKXtcclxuXHRcdGdhbWUubWFwID0gZ2FtZS5tYXBzW2RlcHRoIC0gMV07XHJcblx0fVxyXG5cdGdhbWUuc2NlbmUgPSBudWxsO1xyXG5cdGlmIChkZXB0aClcclxuXHRcdGdhbWUucGxheU11c2ljKCdkdW5nZW9uJytkZXB0aCwgZmFsc2UpO1xyXG5cdGVsc2UgaWYgKG1hcCA9PT0gJ2NvZGV4Um9vbScpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnY29kZXhSb29tJywgZmFsc2UpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRHcmVldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLm1lc3NhZ2VzID0gW107XHJcblx0XHJcblx0Ly8gU2hvd3MgYSB3ZWxjb21lIG1lc3NhZ2Ugd2l0aCB0aGUgZ2FtZSBpbnN0cnVjdGlvbnMuXHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIllvdSBlbnRlciB0aGUgbGVnZW5kYXJ5IFN0eWdpYW4gQWJ5c3MuXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJVc2UgUS1XLUUgdG8gbW92ZSBmb3J3YXJkLCBBLVMtRCB0byBzdHJhZmUgYW5kIHN0ZXAgYmFja1wiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUHJlc3MgU3BhY2UgYmFyIHRvIGludGVyYWN0IGFuZCBFbnRlciB0byBhdHRhY2tcIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlByZXNzIFQgdG8gZHJvcCBvYmplY3RzXCIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubmV3R2FtZSA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbnZlbnRvcnkucmVzZXQoKTtcclxuXHR0aGlzLnBsYXllci5yZXNldCgpO1xyXG5cdFxyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLnByaW50R3JlZXQoKTtcclxuXHRcdFxyXG5cdHRoaXMuc2NlbmUgPSBuZXcgVGl0bGVTY3JlZW4odGhpcyk7XHJcblx0dGhpcy5sb29wKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkR2FtZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdGlmIChnYW1lLkdMLmFyZUltYWdlc1JlYWR5KCkpe1xyXG5cdFx0Z2FtZS5wb3N0TG9hZGluZygpO1xyXG5cdFx0Z2FtZS5uZXdHYW1lKCk7XHJcblx0fWVsc2V7XHJcblx0XHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9hZEdhbWUoKTsgfSk7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWRkSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdHJldHVybiB0aGlzLmludmVudG9yeS5hZGRJdGVtKGl0ZW0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd09iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCwgdGV4dHVyZSl7XHJcblx0dmFyIGNhbWVyYSA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRcclxuXHR0aGlzLkdMLmRyYXdPYmplY3Qob2JqZWN0LCBjYW1lcmEsIHRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Jsb2NrID0gZnVuY3Rpb24oYmxvY2tPYmplY3QsIHRleElkKXtcclxuXHR2YXIgY2FtZXJhID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHRoaXMuR0wuZHJhd09iamVjdChibG9ja09iamVjdCwgY2FtZXJhLCB0aGlzLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vcldhbGwgPSBmdW5jdGlvbih4LCB5LCB6LCB0ZXhJZCwgdmVydGljYWwpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuZG9vclcucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGlmICh2ZXJ0aWNhbCkgZ2FtZS5kb29yVy5yb3RhdGlvbi5zZXQoMCxNYXRoLlBJXzIsMCk7IGVsc2UgZ2FtZS5kb29yVy5yb3RhdGlvbi5zZXQoMCwwLDApO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3JXLCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yQ3ViZSA9IGZ1bmN0aW9uKHgsIHksIHosIHRleElkLCB2ZXJ0aWNhbCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yQy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0aWYgKHZlcnRpY2FsKSBnYW1lLmRvb3JDLnJvdGF0aW9uLnNldCgwLE1hdGguUElfMiwwKTsgZWxzZSBnYW1lLmRvb3JDLnJvdGF0aW9uLnNldCgwLDAsMCk7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vckMsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3IgPSBmdW5jdGlvbih4LCB5LCB6LCByb3RhdGlvbiwgdGV4SWQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuZG9vci5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0Z2FtZS5kb29yLnJvdGF0aW9uLmIgPSByb3RhdGlvbjtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yLCBjYW1lcmEsIGdhbWUub2JqZWN0VGV4W3RleElkXS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdGbG9vciA9IGZ1bmN0aW9uKGZsb29yT2JqZWN0LCB0ZXhJZCwgdHlwZU9mKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHR2YXIgZnQgPSB0eXBlT2Y7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGZsb29yT2JqZWN0LCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIGZ0KS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdCaWxsYm9hcmQgPSBmdW5jdGlvbihwb3NpdGlvbiwgdGV4SWQsIGJpbGxib2FyZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0aWYgKCFiaWxsYm9hcmQpIGJpbGxib2FyZCA9IGdhbWUuYmlsbGJvYXJkO1xyXG5cdFxyXG5cdGJpbGxib2FyZC5wb3NpdGlvbi5zZXQocG9zaXRpb24pO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChiaWxsYm9hcmQsIGNhbWVyYSwgZ2FtZS5vYmplY3RUZXhbdGV4SWRdLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd1Nsb3BlID0gZnVuY3Rpb24oc2xvcGVPYmplY3QsIHRleElkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLkdMLmRyYXdPYmplY3Qoc2xvcGVPYmplY3QsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJmbG9vclwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdVSSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0aWYgKCFwbGF5ZXIpIHJldHVybjtcclxuXHRcclxuXHR2YXIgY3R4ID0gZ2FtZS5VSS5jdHg7XHJcblx0XHJcblx0Ly8gRHJhdyBoZWFsdGggYmFyXHJcblx0dmFyIGhwID0gcHMuaHAgLyBwcy5tSFA7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IChwcy5wb2lzb25lZCk/IFwicmdiKDEyMiwwLDEyMilcIiA6IFwicmdiKDEyMiwwLDApXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsOCw4MCw0KTtcclxuXHRjdHguZmlsbFN0eWxlID0gKHBzLnBvaXNvbmVkKT8gXCJyZ2IoMjAwLDAsMjAwKVwiIDogXCJyZ2IoMjAwLDAsMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCw4LCg4MCAqIGhwKSA8PCAwLDQpO1xyXG5cdFxyXG5cdC8vIERyYXcgbWFuYVxyXG5cdHZhciBtYW5hID0gcHMubWFuYSAvIHBzLm1NYW5hO1xyXG5cdGN0eC5maWxsU3R5bGUgPSBcInJnYigxODEsOTgsMjApXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsMTYsNjAsMik7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwxMzgsMjgpXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsMTYsKDYwICogbWFuYSkgPDwgMCwyKTtcclxuXHRcclxuXHQvLyBEcmF3IEludmVudG9yeVxyXG5cdGlmICh0aGlzLnNldERyb3BJdGVtKVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeURyb3AsIDExMCwgNiwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeSwgMTEwLCA2LCAwKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW52ZW50b3J5Lml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdHZhciBzcHIgPSBpdGVtLnRleCArICdfdWknO1xyXG5cclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSAmJiAoaXRlbS50eXBlID09ICd3ZWFwb24nIHx8IGl0ZW0udHlwZSA9PSAnYXJtb3VyJykgJiYgaXRlbS5lcXVpcHBlZClcclxuXHRcdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkLCAxMTAgKyAoMjIgKiBpKSwgNiwgMCk7XHRcdFxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzW3Nwcl0sIDExMyArICgyMiAqIGkpLCA5LCBpdGVtLnN1YkltZyk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDExMCwgNiwgMSk7XHJcblx0XHJcblx0Ly8gSWYgdGhlIHBsYXllciBpcyBodXJ0IGRyYXcgYSByZWQgc2NyZWVuXHJcblx0aWYgKHBsYXllci5odXJ0ID4gMC4wKXtcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjUpXCI7XHJcblx0XHRjdHguZmlsbFJlY3QoMCwwLGN0eC53aWR0aCxjdHguaGVpZ2h0KTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wcm90ZWN0aW9uID4gMC4wKXtcdC8vIElmIHRoZSBwbGF5ZXIgaGFzIHByb3RlY3Rpb24gdGhlbiBkcmF3IGl0IHNsaWdodGx5IGJsdWVcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoNDAsNDAsMjU1LDAuMilcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucmVzdGFydCwgODUsIDk0LCAwKTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wYXVzZWQpe1xyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnBhdXNlZCwgMTQ3LCA5NCwgMCk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0xldmVsICcrdGhpcy5mbG9vckRlcHRoLCAxMCwyNCx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQodGhpcy5wbGF5ZXIuY2xhc3NOYW1lLCAxMCwzMSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0hQOiAnK3BzLmhwLCAxMCw5LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTWFuYTonK3BzLm1hbmEsIDEwLDE3LHRoaXMuY29uc29sZSk7XHJcblx0XHJcblx0Z2FtZS5jb25zb2xlLnJlbmRlcig4LCAxMzApO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGV4cFBvaW50cyl7XHJcblx0dGhpcy5wbGF5ZXIuYWRkRXhwZXJpZW5jZShleHBQb2ludHMsIHRoaXMuY29uc29sZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jcmVhdGVJbml0aWFsSW52ZW50b3J5ID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcyA9IFtdO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljU3dvcmQnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWMnLCAxLjApO1xyXG5cdGl0ZW0uZXF1aXBwZWQgPSB0cnVlO1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goaXRlbSk7XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ01hZ2UnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAnRHJ1aWQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdQYWxhZGluJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbGlnaHQnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0JhcmQnOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0Y2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGRlZmF1bHQ6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgncmVkUG90aW9uJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdEcnVpZCc6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2JvdycsIDAuNikpO1xyXG5cdFx0YnJlYWs7XHJcblx0Y2FzZSAnQmFyZCc6IGNhc2UgJ1Rpbmtlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3NsaW5nJywgMC43KSk7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnVzZUl0ZW0gPSBmdW5jdGlvbihpbmRleCl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpbmRleF07XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0dmFyIHAgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0cC5tb3ZlZCA9IHRydWU7XHJcblx0c3dpdGNoIChpdGVtLmNvZGUpe1xyXG5cdFx0Y2FzZSAncmVkUG90aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2FybGljIHBvdGlvbiBjdXJlcyB5b3UuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAneWVsbG93UG90aW9uJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAxMDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdpbnNlbmcgcG90aW9uIGhlYWxzIHlvdSBmb3IgXCIraGVhbCArIFwiIHBvaW50cy5cIik7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaW5kZXgpO1xyXG59XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hY3RpdmVTcGVsbCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2luZGV4XTtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHR2YXIgcCA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRwLm1vdmVkID0gdHJ1ZTtcclxuXHRcclxuXHRpZiAocHMubWFuYSA8IGl0ZW0ubWFuYSl7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90IGVub3VnaCBtYW5hXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRwcy5tYW5hID0gTWF0aC5tYXgocHMubWFuYSAtIGl0ZW0ubWFuYSwgMCk7XHJcblx0XHJcblx0c3dpdGNoIChpdGVtLmNvZGUpe1xyXG5cdFx0Y2FzZSAnY3VyZSc6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiQU4gTk9YIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWC4uLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2hlYWwnOlxyXG5cdFx0XHR2YXIgaGVhbCA9ICh0aGlzLnBsYXllci5tSFAgKiBpdGVtLnBlcmNlbnQpIDw8IDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTUFOSSEgXCIraGVhbCArIFwiIHBvaW50cyBoZWFsZWRcIik7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAneWVsbG93UG90aW9uJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAxMDA7XHJcblx0XHRcdHRoaXMucGxheWVyLmhwID0gTWF0aC5taW4odGhpcy5wbGF5ZXIuaHAgKyBoZWFsLCB0aGlzLnBsYXllci5tSFApO1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdpbnNlbmcgcG90aW9uIGhlYWxzIHlvdSBmb3IgXCIraGVhbCArIFwiIHBvaW50cy5cIik7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnbGlnaHQnOlxyXG5cdFx0XHRpZiAodGhpcy5HTC5saWdodCA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuR0wubGlnaHQgPSBpdGVtLmxpZ2h0VGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gTE9SIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ21pc3NpbGUnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnbWFnaWNNaXNzaWxlJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIkdSQVYgUE9SIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdpY2ViYWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZShwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2ljZUJhbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiVkFTIEZSSU8hXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3JlcGVsJzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdibGluayc6XHJcblx0XHRcdHZhciBsYXN0UG9zID0gbnVsbDtcclxuXHRcdFx0dmFyIHBvcnRlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5tYXAucGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcdHZhciBkaXIgPSB0aGlzLm1hcC5wbGF5ZXIucm90YXRpb247XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIuYik7XHJcblx0XHRcdHZhciBkeiA9IC1NYXRoLnNpbihkaXIuYik7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBpPTA7aTwxNTtpKyspe1xyXG5cdFx0XHRcdHBvcy5hICs9IGR4O1xyXG5cdFx0XHRcdHBvcy5jICs9IGR6O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBjeCA9IHBvcy5hIDw8IDA7XHJcblx0XHRcdFx0dmFyIGN5ID0gcG9zLmMgPDwgMDtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXAuaXNTb2xpZChjeCwgY3kpKXtcclxuXHRcdFx0XHRcdGlmIChsYXN0UG9zKXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFBPUiFcIik7XHJcblx0XHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRcdHZhciBwb3J0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpID0gMTU7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMubWFwLmlzV2F0ZXJQb3NpdGlvbihjeCwgY3kpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGlucyA9IHRoaXMubWFwLmdldEluc3RhbmNlQXRHcmlkKHBvcyk7XHJcblx0XHRcdFx0XHRcdGlmICghaW5zKXtcclxuXHRcdFx0XHRcdFx0XHRsYXN0UG9zID0gdmVjMyhjeCwgcG9zLmIsIGN5KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFwb3J0ZWQpe1xyXG5cdFx0XHRcdGlmIChsYXN0UG9zKXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0bGFzdFBvcy5zdW0odmVjMygwLjUsMCwwLjUpKTtcclxuXHRcdFx0XHRcdHAucG9zaXRpb24gPSBsYXN0UG9zO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdmaXJlYmFsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdmaXJlQmFsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJWQVMgRkxBTSFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncHJvdGVjdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnByb3RlY3Rpb24gPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLnByb3RlY3Rpb24gPSBpdGVtLnByb3RUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBTQU5DVCFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd0aW1lJzpcclxuXHRcdFx0aWYgKHRoaXMudGltZVN0b3AgPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLnRpbWVTdG9wID0gaXRlbS5zdG9wVGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUkVMIFRZTSFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdzbGVlcCc6XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBaVSFcIik7XHJcblx0XHRcdHZhciBpbnN0YW5jZXMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZXNOZWFyZXN0KHAucG9zaXRpb24sIDYsICdlbmVteScpO1xyXG5cdFx0XHRmb3IgKHZhciBpPTAsbGVuPWluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRpbnN0YW5jZXNbaV0uc2xlZXAgPSBpdGVtLnNsZWVwVGltZTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ppbngnOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3RyZW1vcic6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdraWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlhFTiBDT1JQIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpbmRleCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGkpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaV07XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwLnBsYXllcjtcclxuXHR2YXIgY2xlYW5Qb3MgPSB0aGlzLm1hcC5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZShwbGF5ZXIucG9zaXRpb24uYSwgcGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdGlmICghY2xlYW5Qb3Mpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnQ2FuIG5vdCBkcm9wIGl0IGhlcmUnKTtcclxuXHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyBkcm9wcGVkJyk7XHJcblx0XHRjbGVhblBvcy5hICs9IDAuNTtcclxuXHRcdGNsZWFuUG9zLmMgKz0gMC41O1xyXG5cdFx0XHJcblx0XHR2YXIgbkl0ID0gbmV3IEl0ZW0oY2xlYW5Qb3MsIG51bGwsIHRoaXMubWFwKTtcclxuXHRcdG5JdC5zZXRJdGVtKGl0ZW0pO1xyXG5cdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobkl0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaSk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY2hlY2tJbnZDb250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdFxyXG5cdGlmIChwbGF5ZXIgJiYgcGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgyKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpO1xyXG5cdFx0XHR0aGlzLm5ld0dhbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKCFwbGF5ZXIgfHwgcGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODApKXtcclxuXHRcdHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5wYXVzZWQpIHJldHVybjtcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDg0KSl7XHJcblx0XHRpZiAoIXRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdTZWxlY3QgdGhlIGl0ZW0gdG8gZHJvcCcpO1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gdHJ1ZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0dmFyIGluZGV4ID0gNDkgKyBpO1xyXG5cdFx0aWYgKGkgPT0gOSlcclxuXHRcdFx0aW5kZXggPSA0ODtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoaW5kZXgpKXtcclxuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdFx0aWYgKCFpdGVtKXtcclxuXHRcdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdObyBpdGVtJyk7XHJcblx0XHRcdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0dGhpcy5kcm9wSXRlbShpKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGl0ZW0udHlwZSA9PSAnd2VhcG9uJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdpZWxkZWQnKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ2FybW91cicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3b3JlJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdtYWdpYycpe1xyXG5cdFx0XHRcdHRoaXMuYWN0aXZlU3BlbGwoaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3BvdGlvbicpe1xyXG5cdFx0XHRcdHRoaXMudXNlSXRlbShpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gXHJcblx0XHJcblx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmIChwcy5wb3Rpb25zID4gMCl7XHJcblx0XHRpZiAocHMuaHAgPT0gcHMubUhQKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkhlYWx0aCBpcyBhbHJlYWR5IGF0IG1heFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRwcy5wb3Rpb25zIC09IDE7XHJcblx0XHRwcy5ocCA9IE1hdGgubWluKHBzLm1IUCwgcHMuaHAgKyA1KTtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQb3Rpb24gdXNlZFwiKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJObyBtb3JlIHBvdGlvbnMgbGVmdC5cIik7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2xvYmFsTG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApeyB0aGlzLnByb3RlY3Rpb24gLT0gMTsgfVxyXG5cdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7IHRoaXMudGltZVN0b3AgLT0gMTsgfVxyXG5cdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7IHRoaXMuR0wubGlnaHQgLT0gMTsgfVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG5cdHZhciBkVCA9IChub3cgLSBnYW1lLmxhc3RUKTtcclxuXHRcclxuXHQvLyBMaW1pdCB0aGUgZ2FtZSB0byB0aGUgYmFzZSBzcGVlZCBvZiB0aGUgZ2FtZVxyXG5cdGlmIChkVCA+IGdhbWUuZnBzKXtcclxuXHRcdGdhbWUubGFzdFQgPSBub3cgLSAoZFQgJSBnYW1lLmZwcyk7XHJcblx0XHRcclxuXHRcdGlmICghZ2FtZS5HTC5hY3RpdmUpe1xyXG5cdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTsgXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMubWFwICE9IG51bGwpe1xyXG5cdFx0XHR2YXIgZ2wgPSBnYW1lLkdMLmN0eDtcclxuXHRcdFx0XHJcblx0XHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHRcdFx0Z2FtZS5VSS5jbGVhcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0Z2FtZS5nbG9iYWxMb29wKCk7XHJcblx0XHRcdGdhbWUuY2hlY2tJbnZDb250cm9sKCk7XHJcblx0XHRcdGdhbWUubWFwLmxvb3AoKTtcclxuXHRcdFx0XHJcblx0XHRcdGdhbWUuZHJhd1VJKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLnNjZW5lICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLnNjZW5lLmxvb3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvb3AoKTsgfSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRLZXlQcmVzc2VkID0gZnVuY3Rpb24oa2V5Q29kZSl7XHJcblx0aWYgKHRoaXMua2V5c1trZXlDb2RlXSA9PSAxKXtcclxuXHRcdHRoaXMua2V5c1trZXlDb2RlXSA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VCdXR0b25QcmVzc2VkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tb3VzZS5jID09IDEpe1xyXG5cdFx0dGhpcy5tb3VzZS5jID0gMjtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRNb3VzZU1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcmV0ID0ge3g6IHRoaXMubW91c2VNb3ZlbWVudC54LCB5OiB0aGlzLm1vdXNlTW92ZW1lbnQueX07XHJcblx0dGhpcy5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVXRpbHMuYWRkRXZlbnQod2luZG93LCBcImxvYWRcIiwgZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IG5ldyBVbmRlcndvcmxkKCk7XHJcblx0Z2FtZS5sb2FkR2FtZSgpO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUua2V5c1tlLmtleUNvZGVdID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUua2V5c1tlLmtleUNvZGVdID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXl1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChlLmtleUNvZGUgPT0gOCl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGdhbWUuVUkuY2FudmFzO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tYXAgIT0gbnVsbClcclxuXHRcdFx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jaygpO1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1vdXNlLmMgPT0gMikgcmV0dXJuO1xyXG5cdFx0Z2FtZS5tb3VzZS5jID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGdhbWUuZmlyc3RGcmFtZSA9IERhdGUubm93KCk7XHJcblx0XHRnYW1lLm51bWJlckZyYW1lcyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcInJlc2l6ZVwiLCBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIGdhbWUuc2l6ZS5iO1xyXG5cdFx0dmFyIGNhbnZhcyA9IGdhbWUuR0wuY2FudmFzO1xyXG5cdFx0XHJcblx0XHRjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRcdGdhbWUuVUkuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gY2FudmFzLmhlaWdodDtcclxuXHR9KTtcclxuXHRcclxuXHR2YXIgbW92ZUNhbGxiYWNrID0gZnVuY3Rpb24oZSl7XHJcblx0XHRnYW1lLm1vdXNlTW92ZW1lbnQueCA9IGUubW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUubW96TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUud2Via2l0TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnkgPSBlLm1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHBvaW50ZXJsb2NrY2hhbmdlID0gZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAoZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQubW96UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQud2Via2l0UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMpe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZUNhbGxiYWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHRcdGdhbWUubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHR9XHJcblx0fTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW96cG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIndlYmtpdHBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiYmx1clwiLCBmdW5jdGlvbihlKXsgZ2FtZS5HTC5hY3RpdmUgPSBmYWxzZTsgZ2FtZS5hdWRpby5wYXVzZU11c2ljKCk7ICB9KTtcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gdHJ1ZTsgZ2FtZS5hdWRpby5yZXN0b3JlTXVzaWMoKTsgfSk7XHJcbn0pO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRhZGRFdmVudDogZnVuY3Rpb24gKG9iaiwgdHlwZSwgZnVuYyl7XHJcblx0XHRpZiAob2JqLmFkZEV2ZW50TGlzdGVuZXIpe1xyXG5cdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW5jLCBmYWxzZSk7XHJcblx0XHR9ZWxzZSBpZiAob2JqLmF0dGFjaEV2ZW50KXtcclxuXHRcdFx0b2JqLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGZ1bmMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0JCQ6IGZ1bmN0aW9uKG9iaklkKXtcclxuXHRcdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob2JqSWQpO1xyXG5cdFx0aWYgKCFlbGVtKSBhbGVydChcIkNvdWxkbid0IGZpbmQgZWxlbWVudDogXCIgKyBvYmpJZCk7XHJcblx0XHRyZXR1cm4gZWxlbTtcclxuXHR9LFxyXG5cdGdldEh0dHA6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaHR0cDtcclxuXHRcdGlmICAod2luZG93LlhNTEh0dHBSZXF1ZXN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0fWVsc2UgaWYgKHdpbmRvdy5BY3RpdmVYT2JqZWN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gaHR0cDtcclxuXHR9LFxyXG5cdHJvbGxEaWNlOiBmdW5jdGlvbiAocGFyYW0pe1xyXG5cdFx0dmFyIGEgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcoMCwgcGFyYW0uaW5kZXhPZignRCcpKSwgMTApO1xyXG5cdFx0dmFyIGIgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcocGFyYW0uaW5kZXhPZignRCcpICsgMSksIDEwKTtcclxuXHRcdHZhciByb2xsMSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0dmFyIHJvbGwyID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogYik7XHJcblx0XHRyZXR1cm4gTWF0aC5jZWlsKGEgKiAocm9sbDErcm9sbDIpLzIpO1xyXG5cdH1cclxufVxyXG5cdFxyXG4vLyBNYXRoIHByb3RvdHlwZSBvdmVycmlkZXNcdFxyXG5NYXRoLnJhZFJlbGF0aW9uID0gTWF0aC5QSSAvIDE4MDtcclxuTWF0aC5kZWdSZWxhdGlvbiA9IDE4MCAvIE1hdGguUEk7XHJcbk1hdGguZGVnVG9SYWQgPSBmdW5jdGlvbihkZWdyZWVzKXtcclxuXHRyZXR1cm4gZGVncmVlcyAqIHRoaXMucmFkUmVsYXRpb247XHJcbn07XHJcbk1hdGgucmFkVG9EZWcgPSBmdW5jdGlvbihyYWRpYW5zKXtcclxuXHRyZXR1cm4gKChyYWRpYW5zICogdGhpcy5kZWdSZWxhdGlvbikgKyA3MjApICUgMzYwO1xyXG59O1xyXG5NYXRoLmlSYW5kb20gPSBmdW5jdGlvbihhLCBiKXtcclxuXHRpZiAoYiA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdGIgPSBhO1xyXG5cdFx0YSA9IDA7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBhICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGIgLSBhKSk7XHJcbn07XHJcblxyXG5NYXRoLmdldEFuZ2xlID0gZnVuY3Rpb24oLypWZWMyKi8gYSwgLypWZWMyKi8gYil7XHJcblx0dmFyIHh4ID0gTWF0aC5hYnMoYS5hIC0gYi5hKTtcclxuXHR2YXIgeXkgPSBNYXRoLmFicyhhLmMgLSBiLmMpO1xyXG5cdFxyXG5cdHZhciBhbmcgPSBNYXRoLmF0YW4yKHl5LCB4eCk7XHJcblx0XHJcblx0Ly8gQWRqdXN0IHRoZSBhbmdsZSBhY2NvcmRpbmcgdG8gYm90aCBwb3NpdGlvbnNcclxuXHRpZiAoYi5hIDw9IGEuYSAmJiBiLmMgPD0gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgLSBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA8PSBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgKyBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA+IGEuYSAmJiBiLmMgPiBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSTIgLSBhbmc7XHJcblx0fVxyXG5cdFxyXG5cdGFuZyA9IChhbmcgKyBNYXRoLlBJMikgJSBNYXRoLlBJMjtcclxuXHRcclxuXHRyZXR1cm4gYW5nO1xyXG59O1xyXG5cclxuTWF0aC5QSV8yID0gTWF0aC5QSSAvIDI7XHJcbk1hdGguUEkyID0gTWF0aC5QSSAqIDI7XHJcbk1hdGguUEkzXzIgPSBNYXRoLlBJICogMyAvIDI7XHJcblxyXG4vLyBDcm9zc2Jyb3dzZXIgYW5pbWF0aW9uL2F1ZGlvIG92ZXJyaWRlc1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSBcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8IFxyXG5cdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXHJcblx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fCBcclxuXHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8IFxyXG5cdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHwgXHJcblx0ZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gZHJhdzEpe1xyXG5cdFx0d2luZG93LnNldFRpbWVvdXQoZHJhdzEsIDEwMDAgLyAzMCk7XHJcblx0fTtcclxuXHJcbndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7IiwidmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4vTWF0cml4Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIFdlYkdMKHNpemUsIGNvbnRhaW5lcil7XHJcblx0aWYgKCF0aGlzLmluaXRDYW52YXMoc2l6ZSwgY29udGFpbmVyKSkgcmV0dXJuIG51bGw7IFxyXG5cdHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHR0aGlzLnByb2Nlc3NTaGFkZXJzKCk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMgPSBbXTtcclxuXHRcclxuXHR0aGlzLmFjdGl2ZSA9IHRydWU7XHJcblx0dGhpcy5saWdodCA9IDA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2ViR0w7XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIHNpemUuYjtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzaXplLmE7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNpemUuYjtcclxuXHRjYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblx0Y2FudmFzLnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcblx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cdFxyXG5cdGlmICghY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIikpe1xyXG5cdFx0YWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCIpO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIik7XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5pbml0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Z2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xyXG5cdGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuXHRnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcclxuXHRcclxuXHRnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuXHRcclxuXHRnbC5lbmFibGUoIGdsLkJMRU5EICk7XHJcblx0Z2wuYmxlbmRFcXVhdGlvbiggZ2wuRlVOQ19BREQgKTtcclxuXHRnbC5ibGVuZEZ1bmMoIGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSApO1xyXG5cdFxyXG5cdHRoaXMuYXNwZWN0UmF0aW8gPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMuY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLnBlcnNwZWN0aXZlTWF0cml4ID0gTWF0cml4Lm1ha2VQZXJzcGVjdGl2ZSg0NSwgdGhpcy5hc3BlY3RSYXRpbywgMC4wMDIsIDUuMCk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUucHJvY2Vzc1NoYWRlcnMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIENvbXBpbGUgZnJhZ21lbnQgc2hhZGVyXHJcblx0dmFyIGVsU2hhZGVyID0gVXRpbHMuJCQoXCJmcmFnbWVudFNoYWRlclwiKTtcclxuXHR2YXIgY29kZSA9IHRoaXMuZ2V0U2hhZGVyQ29kZShlbFNoYWRlcik7XHJcblx0dmFyIGZTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcihmU2hhZGVyKTtcclxuXHRcclxuXHQvLyBDb21waWxlIHZlcnRleCBzaGFkZXJcclxuXHRlbFNoYWRlciA9IFV0aWxzLiQkKFwidmVydGV4U2hhZGVyXCIpO1xyXG5cdGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciB2U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG5cdGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBjb2RlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgc2hhZGVyIHByb2dyYW1cclxuXHR0aGlzLnNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZlNoYWRlcik7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgdlNoYWRlcik7XHJcblx0Z2wubGlua1Byb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHRpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5zaGFkZXJQcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuXHRcdGFsZXJ0KFwiRXJyb3IgaW5pdGlhbGl6aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcbiAgXHJcblx0Z2wudXNlUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG5cdFxyXG5cdC8vIEdldCBhdHRyaWJ1dGUgbG9jYXRpb25zXHJcblx0dGhpcy5hVmVydGV4UG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleFBvc2l0aW9uXCIpO1xyXG5cdHRoaXMuYVRleHR1cmVDb29yZCA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVGV4dHVyZUNvb3JkXCIpO1xyXG5cdHRoaXMuYVZlcnRleElzRGFyayA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVmVydGV4SXNEYXJrXCIpO1xyXG5cdFxyXG5cdC8vIEVuYWJsZSBhdHRyaWJ1dGVzXHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4UG9zaXRpb24pO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVRleHR1cmVDb29yZCk7XHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4SXNEYXJrKTtcclxuXHRcclxuXHQvLyBHZXQgdGhlIHVuaWZvcm0gbG9jYXRpb25zXHJcblx0dGhpcy51U2FtcGxlciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVNhbXBsZXJcIik7XHJcblx0dGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVUcmFuc2Zvcm1hdGlvbk1hdHJpeFwiKTtcclxuXHR0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVBlcnNwZWN0aXZlTWF0cml4XCIpO1xyXG5cdHRoaXMudVBhaW50SW5SZWQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQYWludEluUmVkXCIpO1xyXG5cdHRoaXMudUxpZ2h0RGVwdGggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVMaWdodERlcHRoXCIpO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmdldFNoYWRlckNvZGUgPSBmdW5jdGlvbihzaGFkZXIpe1xyXG5cdHZhciBjb2RlID0gXCJcIjtcclxuXHR2YXIgbm9kZSA9IHNoYWRlci5maXJzdENoaWxkO1xyXG5cdHZhciB0biA9IG5vZGUuVEVYVF9OT0RFO1xyXG5cdFxyXG5cdHdoaWxlIChub2RlKXtcclxuXHRcdGlmIChub2RlLm5vZGVUeXBlID09IHRuKVxyXG5cdFx0XHRjb2RlICs9IG5vZGUudGV4dENvbnRlbnQ7XHJcblx0XHRub2RlID0gbm9kZS5uZXh0U2libGluZztcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNvZGU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUubG9hZEltYWdlID0gZnVuY3Rpb24oc3JjLCBtYWtlSXRUZXh0dXJlLCB0ZXh0dXJlSW5kZXgsIGlzU29saWQsIHBhcmFtcyl7XHJcblx0aWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xyXG5cdGlmICghcGFyYW1zLmltZ051bSkgcGFyYW1zLmltZ051bSA9IDE7XHJcblx0aWYgKCFwYXJhbXMuaW1nVk51bSkgcGFyYW1zLmltZ1ZOdW0gPSAxO1xyXG5cdFxyXG5cdHZhciBnbCA9IHRoaXM7XHJcblx0dmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cdFxyXG5cdGltZy5zcmMgPSBzcmM7XHJcblx0aW1nLnJlYWR5ID0gZmFsc2U7XHJcblx0aW1nLnRleHR1cmUgPSBudWxsO1xyXG5cdGltZy50ZXh0dXJlSW5kZXggPSB0ZXh0dXJlSW5kZXg7XHJcblx0aW1nLmlzU29saWQgPSAoaXNTb2xpZCA9PT0gdHJ1ZSk7XHJcblx0aW1nLmltZ051bSA9IHBhcmFtcy5pbWdOdW07XHJcblx0aW1nLnZJbWdOdW0gPSBwYXJhbXMuaW1nVk51bTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChpbWcsIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdFx0aW1nLmltZ1dpZHRoID0gaW1nLndpZHRoIC8gaW1nLmltZ051bTtcclxuXHRcdGltZy5pbWdIZWlnaHQgPSBpbWcuaGVpZ2h0IC8gaW1nLnZJbWdOdW07XHJcblx0XHRpbWcucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobWFrZUl0VGV4dHVyZSl7XHJcblx0XHRcdGltZy50ZXh0dXJlID0gZ2wucGFyc2VUZXh0dXJlKGltZyk7XHJcblx0XHRcdGltZy50ZXh0dXJlLnRleHR1cmVJbmRleCA9IGltZy50ZXh0dXJlSW5kZXg7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0Z2wuaW1hZ2VzLnB1c2goaW1nKTtcclxuXHRyZXR1cm4gaW1nO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnBhcnNlVGV4dHVyZSA9IGZ1bmN0aW9uKGltZyl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ3JlYXRlcyBhIHRleHR1cmUgaG9sZGVyIHRvIHdvcmsgd2l0aFxyXG5cdHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcclxuXHRcclxuXHQvLyBGbGlwIHZlcnRpY2FsIHRoZSB0ZXh0dXJlXHJcblx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblx0XHJcblx0Ly8gTG9hZCB0aGUgaW1hZ2UgZGF0YVxyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcclxuXHRcclxuXHQvLyBBc3NpZ24gcHJvcGVydGllcyBvZiBzY2FsaW5nXHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcclxuXHRcclxuXHQvLyBSZWxlYXNlcyB0aGUgdGV4dHVyZSBmcm9tIHRoZSB3b3Jrc3BhY2VcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcclxuXHRyZXR1cm4gdGV4O1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdmVydGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC52ZXJ0ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4UG9zaXRpb24sIG9iamVjdC52ZXJ0ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdGV4dHVyZSBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFUZXh0dXJlQ29vcmQsIG9iamVjdC50ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgZGFyayBidWZmZXIgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0aWYgKG9iamVjdC5kYXJrQnVmZmVyKXtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QuZGFya0J1ZmZlcik7XHJcblx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleElzRGFyaywgb2JqZWN0LmRhcmtCdWZmZXIuaXRlbVNpemUsIGdsLlVOU0lHTkVEX0JZVEUsIGZhbHNlLCAwLCAwKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gUGFpbnQgdGhlIG9iamVjdCBpbiByZWQgKFdoZW4gaHVydCBmb3IgZXhhbXBsZSlcclxuXHR2YXIgcmVkID0gKG9iamVjdC5wYWludEluUmVkKT8gMS4wIDogMC4wOyBcclxuXHRnbC51bmlmb3JtMWYodGhpcy51UGFpbnRJblJlZCwgcmVkKTtcclxuXHRcclxuXHQvLyBIb3cgbXVjaCBsaWdodCB0aGUgcGxheWVyIGNhc3RcclxuXHR2YXIgbGlnaHQgPSAodGhpcy5saWdodCA+IDApPyAwLjAgOiAxLjA7XHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudUxpZ2h0RGVwdGgsIGxpZ2h0KTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHRleHR1cmUgdG8gd29yayB3aXRoXHJcblx0Z2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblx0Z2wudW5pZm9ybTFpKHRoaXMudVNhbXBsZXIsIDApO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybSB0aGUgb2JqZWN0XHJcblx0dmFyIHRyYW5zZm9ybWF0aW9uTWF0cml4ID0gTWF0cml4Lm1ha2VUcmFuc2Zvcm0ob2JqZWN0LCBjYW1lcmEpO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGluZGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgb2JqZWN0LmluZGljZXNCdWZmZXIpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybWF0aW9uIG1hdHJpY2VzXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCkpO1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRyYW5zZm9ybWF0aW9uTWF0cml4KSk7XHJcblx0XHJcblx0aWYgKG9iamVjdC5ub1JvdGF0ZSkgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdC8vIERyYXcgdGhlIHRyaWFuZ2xlc1xyXG5cdGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIG9iamVjdC5pbmRpY2VzQnVmZmVyLm51bUl0ZW1zLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuYXJlSW1hZ2VzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbWFnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuaW1hZ2VzW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyJdfQ==
