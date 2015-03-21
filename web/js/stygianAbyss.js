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

circular.setTransient('Enemy', 'billboard');
circular.setTransient('Enemy', 'textureCoords');

function Enemy(position, enemy, mapManager){
	this._c = circular.register('Enemy');
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
	var str = Utils.rollDice(this.enemy.stats.str);
	var dfs = Utils.rollDice(this.mapManager.game.player.stats.dfs);
	
	// Check if the player has the protection spell
	if (this.mapManager.game.protection > 0){
		dfs += 15;
	}
	
	var dmg = Math.max(str - dfs, 0);
	
	if (dmg > 0){
		this.mapManager.addMessage(dmg + " damage inflicted");
		player.receiveDamage(dmg);
	}else{
		this.mapManager.addMessage("Blocked!");
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
				this.mapManager.addMessage(this.enemy.name + " attacks!");
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

function Item(position, item, mapManager){
	this._c = circular.register('Item');
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
		} else if (this.item.type == 'feature'){
			mm.addMessage("You see a "+this.item.name);
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
		
		// Temp: Dungeon features as items
		orb: {name: "Orb", tex: "items", subImg: 17, type: 'feature'},
		deadTree: {name: "Dead Tree", tex: "items", subImg: 18, type: 'feature'},
		tree: {name: "Tree", tex: "items", subImg: 19, type: 'feature'},
		statue: {name: "Statue", tex: "items", subImg: 20, type: 'feature'},
		signPost: {name: "Signpost", tex: "items", subImg: 21, type: 'feature'},
		well: {name: "Well", tex: "items", subImg: 22, type: 'feature'},
		smallSign: {name: "Sign", tex: "items", subImg: 23, type: 'feature'},
		lamp: {name: "Lamp", tex: "items", subImg: 24, type: 'feature'},
		flame: {name: "Flame", tex: "items", subImg: 25, type: 'feature'},
		campfire: {name: "Campfire", tex: "items", subImg: 26, type: 'feature'},
		altar: {name: "Altar", tex: "items", subImg: 27, type: 'feature'},
		prisonerThing: {name: "Shackles", tex: "items", subImg: 28, type: 'feature'},
		fountain: {name: "Fountain", tex: "items", subImg: 29, type: 'feature'}
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
	
	this.initializeTiles(mapData.tiles);
}

module.exports = MapAssembler;

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

circular.setTransient('MapManager', 'game');

function MapManager(game, map, depth){
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

circular.setTransient('WebGLObject', 'vertexBuffer');
circular.setTransient('WebGLObject', 'texBuffer');
circular.setTransient('WebGLObject', 'indicesBuffer');
circular.setTransient('WebGLObject', 'darkBuffer');

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
			_c: circular.register('WebGLObject'),
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
	console.log(direction);
	
	this._c = circular.register('Player');
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
			this.launchAttackCounter = 5;
		}else if (weapon && weapon.ranged){
			this.castMissile(weapon);
		}
		
		if (weapon && weapon.status < 0.05){
			this.mapManager.game.inventory.destroyItem(weapon);
			this.mapManager.addMessage(weapon.name + " damaged!");
		}
	} else if (game.getKeyPressed(79)){ // O, TODO: change to Ctrl+S 
		game.saveManager.saveGame();
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

},{}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SaveManager.js":[function(require,module,exports){
function SaveManager(game){
	this.game = game;
}

SaveManager.prototype = {
	saveGame: function(){
		var saveObject = {
			_c: circular.register('StygianGame'),
			version: version, 
			player: this.game.player,
			inventory: this.game.inventory,
			maps: this.game.maps
		};
		var serialized = circular.serialize(saveObject);
		
		var serializedObject = JSON.parse(serialized);
		console.log(serializedObject);
		console.log("Size: "+serialized.length);
	}
}

module.exports = SaveManager;
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

circular.setTransient('Stairs', 'billboard');

function Stairs(position, mapManager, direction){
	this._c = circular.register("Stairs");
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
	this.saveManager = new SaveManager(this);
	this.font = '10px "Courier"';
	
	this.grPack = 'img/';
	
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
	this.images.vpSword = this.GL.loadImage(cp + this.grPack + "vpSword.png?version=" + version, false);
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
	this.UI.drawText('Level '+this.floorDepth, 10,24,this.console);
	this.UI.drawText(this.player.className, 10,31,this.console);
	this.UI.drawText('HP: '+ps.hp, 10,9,this.console);
	this.UI.drawText('Mana:'+ps.mana, 10,17,this.console);
	
	// Draw the compass
	this.UI.drawSprite(this.images.compass, 320, 12, 0);
	this.UI.drawSpriteExt(this.images.compass, 320, 12, 1, Math.PI + this.map.player.rotation.b);
	
	// TODO: Change sprite (or don't draw) based on current weapon
	this.UI.drawSprite(this.images.vpSword, 220, 130 + this.map.player.launchAttackCounter * 2 - this.map.player.attackWait * 1.5, 0);
	
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

},{"./AnimatedTexture":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\AnimatedTexture.js","./Audio":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Audio.js","./Console":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Console.js","./Inventory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Inventory.js","./Item":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Item.js","./ItemFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ItemFactory.js","./MapManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\MapManager.js","./Missile":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Missile.js","./ObjectFactory":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\ObjectFactory.js","./PlayerStats":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\PlayerStats.js","./SaveManager":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\SaveManager.js","./TitleScreen":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\TitleScreen.js","./UI":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\UI.js","./Utils":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js","./WebGL":"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\WebGL.js"}],"C:\\Users\\Ramirez\\My Documents\\Aptana Studio 3 Workspace\\Stygian-Abyss\\web\\js\\Utils.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZW15LmpzIiwianNcXEVuZW15RmFjdG9yeS5qcyIsImpzXFxJbnZlbnRvcnkuanMiLCJqc1xcSXRlbS5qcyIsImpzXFxJdGVtRmFjdG9yeS5qcyIsImpzXFxNYXBBc3NlbWJsZXIuanMiLCJqc1xcTWFwTWFuYWdlci5qcyIsImpzXFxNYXRyaXguanMiLCJqc1xcTWlzc2lsZS5qcyIsImpzXFxPYmplY3RGYWN0b3J5LmpzIiwianNcXFBsYXllci5qcyIsImpzXFxQbGF5ZXJTdGF0cy5qcyIsImpzXFxTYXZlTWFuYWdlci5qcyIsImpzXFxTZWxlY3RDbGFzcy5qcyIsImpzXFxTdGFpcnMuanMiLCJqc1xcVGl0bGVTY3JlZW4uanMiLCJqc1xcVUkuanMiLCJqc1xcVW5kZXJ3b3JsZC5qcyIsImpzXFxVdGlscy5qcyIsImpzXFxXZWJHTC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9qQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3h3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XzFGcmFtZTogW10sXHJcblx0XzJGcmFtZXM6IFtdLFxyXG5cdF8zRnJhbWVzOiBbXSxcclxuXHRfNEZyYW1lczogW10sXHJcblx0aXRlbUNvb3JkczogW10sXHJcblx0XHJcblx0aW5pdDogZnVuY3Rpb24oZ2wpe1xyXG5cdFx0Ly8gMSBGcmFtZVxyXG5cdFx0dmFyIGNvb3JkcyA9IFsxLjAsMS4wLDAuMCwxLjAsMS4wLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzFGcmFtZS5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRcclxuXHRcdC8vIDIgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMDAsMS4wMCwwLjUwLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0Y29vcmRzID0gWzEuMDAsMS4wMCwwLjUwLDEuMDAsMS4wMCwwLjAwLDAuNTAsMC4wMF07XHJcblx0XHR0aGlzLl8yRnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMyBGcmFtZXMsIDQgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC4yNSwxLjAwLDAuMDAsMS4wMCwwLjI1LDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMjUsMS4wMCwwLjUwLDAuMDAsMC4yNSwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC43NSwxLjAwLDAuNTAsMS4wMCwwLjc1LDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNzUsMS4wMCwxLjAwLDAuMDAsMC43NSwwLjAwXTtcclxuXHRcdHRoaXMuXzRGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdH0sXHJcblx0XHJcblx0cHJlcGFyZUJ1ZmZlcjogZnVuY3Rpb24oY29vcmRzLCBnbCl7XHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGNvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGNvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGV4QnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0QnlOdW1GcmFtZXM6IGZ1bmN0aW9uKG51bUZyYW1lcyl7XHJcblx0XHRpZiAobnVtRnJhbWVzID09IDEpIHJldHVybiB0aGlzLl8xRnJhbWU7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMikgcmV0dXJuIHRoaXMuXzJGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMykgcmV0dXJuIHRoaXMuXzNGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gNCkgcmV0dXJuIHRoaXMuXzRGcmFtZXM7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUZXh0dXJlQnVmZmVyQ29vcmRzOiBmdW5jdGlvbih4SW1nTnVtLCB5SW1nTnVtLCBnbCl7XHJcblx0XHR2YXIgcmV0ID0gW107XHJcblx0XHR2YXIgd2lkdGggPSAxIC8geEltZ051bTtcclxuXHRcdHZhciBoZWlnaHQgPSAxIC8geUltZ051bTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaT0wO2k8eUltZ051bTtpKyspe1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajx4SW1nTnVtO2orKyl7XHJcblx0XHRcdFx0dmFyIHgxID0gaiAqIHdpZHRoO1xyXG5cdFx0XHRcdHZhciB5MSA9IDEgLSBpICogaGVpZ2h0IC0gaGVpZ2h0O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB4MiA9IHgxICsgd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkyID0geTEgKyBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGNvb3JkcyA9IFt4Mix5Mix4MSx5Mix4Mix5MSx4MSx5MV07XHJcblx0XHRcdFx0cmV0LnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5mdW5jdGlvbiBBdWRpb0FQSSgpe1xyXG5cdHRoaXMuX2F1ZGlvID0gW107XHJcblx0XHJcblx0dGhpcy5hdWRpb0N0eCA9IG51bGw7XHJcblx0dGhpcy5nYWluTm9kZSA9IG51bGw7XHJcblx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuaW5pdEF1ZGlvRW5naW5lKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXVkaW9BUEk7XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuaW5pdEF1ZGlvRW5naW5lID0gZnVuY3Rpb24oKXtcclxuXHRpZiAod2luZG93LkF1ZGlvQ29udGV4dCl7XHJcblx0XHR0aGlzLmF1ZGlvQ3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdFx0dGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdH1lbHNlXHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhlIEF1ZGlvIEFQSVwiKTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5sb2FkQXVkaW8gPSBmdW5jdGlvbih1cmwsIGlzTXVzaWMpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghZW5nLmF1ZGlvQ3R4KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR2YXIgYXVkaW8gPSB7YnVmZmVyOiBudWxsLCBzb3VyY2U6IG51bGwsIHJlYWR5OiBmYWxzZSwgaXNNdXNpYzogaXNNdXNpYywgcGF1c2VkQXQ6IDB9O1xyXG5cdFxyXG5cdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuXHRodHRwLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcblx0XHJcblx0aHR0cC5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0ZW5nLmF1ZGlvQ3R4LmRlY29kZUF1ZGlvRGF0YShodHRwLnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpe1xyXG5cdFx0XHRhdWRpby5idWZmZXIgPSBidWZmZXI7XHJcblx0XHRcdGF1ZGlvLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdH0sIGZ1bmN0aW9uKG1zZyl7XHJcblx0XHRcdGFsZXJ0KG1zZyk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdGh0dHAuc2VuZCgpO1xyXG5cdFxyXG5cdHRoaXMuX2F1ZGlvLnB1c2goYXVkaW8pO1xyXG5cdFxyXG5cdHJldHVybiBhdWRpbztcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGF1ZGlvLnRpbWVPKXtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KGF1ZGlvLnRpbWVPKTtcclxuXHRcdH1lbHNlIGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSwgdm9sdW1lKXtcclxuXHR2YXIgZW5nID0gdGhpcztcclxuXHRpZiAoIXNvdW5kRmlsZSB8fCAhc291bmRGaWxlLnJlYWR5KXtcclxuXHRcdGlmICh0cnlJZk5vdFJlYWR5KXsgc291bmRGaWxlLnRpbWVPID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBlbmcucGxheVNvdW5kKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSk7IH0sIDEwMDApOyB9IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpIHRoaXMuc3RvcE11c2ljKCk7XHJcblx0XHJcblx0c291bmRGaWxlLnRpbWVPID0gbnVsbDtcclxuXHRzb3VuZEZpbGUucGxheWluZyA9IHRydWU7XHJcblx0IFxyXG5cdHZhciBzb3VyY2UgPSBlbmcuYXVkaW9DdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcblx0c291cmNlLmJ1ZmZlciA9IHNvdW5kRmlsZS5idWZmZXI7XHJcblx0XHJcblx0dmFyIGdhaW5Ob2RlO1xyXG5cdGlmICh2b2x1bWUgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRnYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdFx0Z2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZvbHVtZTtcclxuXHRcdHNvdW5kRmlsZS52b2x1bWUgPSB2b2x1bWU7XHJcblx0fWVsc2V7XHJcblx0XHRnYWluTm9kZSA9IGVuZy5nYWluTm9kZTtcclxuXHR9XHJcblx0XHJcblx0c291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xyXG5cdGdhaW5Ob2RlLmNvbm5lY3QoZW5nLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCkgLSBzb3VuZEZpbGUucGF1c2VkQXQ7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCwgKHNvdW5kRmlsZS5wYXVzZWRBdCAvIDEwMDApICUgc291bmRGaWxlLmJ1ZmZlci5kdXJhdGlvbik7XHJcblx0XHRzb3VuZEZpbGUucGF1c2VkQXQgPSAwO1xyXG5cdH1lbHNle1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCk7XHJcblx0fVxyXG5cdHNvdXJjZS5sb29wID0gbG9vcDtcclxuXHRzb3VyY2UubG9vcGluZyA9IGxvb3A7XHJcblx0c291cmNlLm9uZW5kZWQgPSBmdW5jdGlvbigpeyBzb3VuZEZpbGUucGxheWluZyA9IGZhbHNlOyB9O1xyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUuaXNNdXNpYylcclxuXHRcdHNvdW5kRmlsZS5zb3VyY2UgPSBzb3VyY2U7XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGF1c2VNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRhdWRpby5wYXVzZWRBdCA9IDA7XHJcblx0XHRpZiAoYXVkaW8uaXNNdXNpYyAmJiBhdWRpby5zb3VyY2Upe1xyXG5cdFx0XHRhdWRpby53YXNQbGF5aW5nID0gYXVkaW8ucGxheWluZztcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8ucGF1c2VkQXQgPSAoRGF0ZS5ub3coKSAtIGF1ZGlvLnN0YXJ0ZWRBdCk7XHJcblx0XHRcdGF1ZGlvLnJlc3RvcmVMb29wID0gYXVkaW8uc291cmNlLmxvb3A7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnJlc3RvcmVNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWF1ZGlvLmxvb3BpbmcgJiYgIWF1ZGlvLndhc1BsYXlpbmcpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlICYmIGF1ZGlvLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0XHRhdWRpby5zb3VyY2UgPSBudWxsO1xyXG5cdFx0XHR0aGlzLnBsYXlTb3VuZChhdWRpbywgYXVkaW8ucmVzdG9yZUxvb3AsIHRydWUsIGF1ZGlvLnZvbHVtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy5tdXRlZCl7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5tdXRlZCA9IHRydWU7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxO1xyXG5cdH1cclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbi8vVE9ETzogVGhpcyBjbGFzcyBpcyBub3QgcmVmZXJlbmNlcyBhbnl3aGVyZT9cclxuXHJcbmZ1bmN0aW9uIEJpbGxib2FyZChwb3NpdGlvbiwgdGV4dHVyZUNvZGUsIG1hcE1hbmFnZXIsIHBhcmFtcyl7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb29yZHMgPSBudWxsO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMTtcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuYWN0aW9ucyA9IG51bGw7XHJcblx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHJcblx0aWYgKHBhcmFtcykgdGhpcy5wYXJzZVBhcmFtcyhwYXJhbXMpO1xyXG5cdGlmICh0ZXh0dXJlQ29kZSA9PSBcIm5vbmVcIikgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmlsbGJvYXJkO1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5wYXJzZVBhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcyl7XHJcblx0Zm9yICh2YXIgaSBpbiBwYXJhbXMpe1xyXG5cdFx0dmFyIHAgPSBwYXJhbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpID09IFwibmZcIil7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBwO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMocCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImlzXCIpeyAvLyBJbWFnZSBzcGVlZFxyXG5cdFx0XHR0aGlzLmltZ1NwZCA9IHA7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImNiXCIpeyAvLyBDdXN0b20gYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQocCwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImFjXCIpeyAvLyBBY3Rpb25zXHJcblx0XHRcdHRoaXMuYWN0aW9ucyA9IHA7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmFjdGlvbnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYWMgPSB0aGlzLmFjdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdGlmIChhYyA9PSBcInR2XCIpeyAvLyBUb29nbGUgdmlzaWJpbGl0eVxyXG5cdFx0XHR0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjdF9cIikgPT0gMCl7IC8vIENoYW5nZSB0ZXh0dXJlXHJcblx0XHRcdHRoaXMudGV4dHVyZUNvZGUgPSBhYy5yZXBsYWNlKFwiY3RfXCIsIFwiXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJuZl9cIikgPT0gMCl7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dmFyIG5mID0gcGFyc2VJbnQoYWMucmVwbGFjZShcIm5mX1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubnVtRnJhbWVzID0gbmY7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhuZik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY2ZfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciBmcmFtZXMgPSBhYy5yZXBsYWNlKFwiY2ZfXCIsXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IHBhcnNlSW50KGZyYW1lc1t0aGlzLmNpcmNsZUZyYW1lSW5kZXhdLCAxMCk7XHJcblx0XHRcdGlmICh0aGlzLmNpcmNsZUZyYW1lSW5kZXgrKyA+PSBmcmFtZXMubGVuZ3RoLTEpIHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN3X1wiKSA9PSAwKXsgLy8gQ2lyY2xlIGZyYW1lc1xyXG5cdFx0XHR2YXIgdGV4dHVyZUlkID0gcGFyc2VJbnQoYWMucmVwbGFjZShcImN3X1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5jaGFuZ2VXYWxsVGV4dHVyZSh0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdGV4dHVyZUlkKTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwidWRfXCIpID09IDApeyAvLyBVbmxvY2sgZG9vclxyXG5cdFx0XHR2YXIgcG9zID0gYWMucmVwbGFjZShcInVkX1wiLCBcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdChwYXJzZUludChwb3NbMF0sIDEwKSwgcGFyc2VJbnQocG9zWzFdLCAxMCksIHBhcnNlSW50KHBvc1syXSwgMTApKTtcclxuXHRcdFx0aWYgKGRvb3IpeyBcclxuXHRcdFx0XHRkb29yLmxvY2sgPSBudWxsO1xyXG5cdFx0XHRcdGRvb3IuYWN0aXZhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGFjID09IFwiZGVzdHJveVwiKXsgLy8gRGVzdHJveSB0aGUgYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIENvbnNvbGUoLypJbnQqLyBtYXhNZXNzYWdlcywgLypJbnQqLyBsaW1pdCwgLypJbnQqLyBzcGxpdEF0LCAgLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdHRoaXMubWF4TWVzc2FnZXMgPSBtYXhNZXNzYWdlcztcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMubGltaXQgPSBsaW1pdDtcclxuXHR0aGlzLnNwbGl0QXQgPSBzcGxpdEF0O1xyXG5cdFxyXG5cdHRoaXMuc3ByaXRlRm9udCA9IG51bGw7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zZkNvbnRleHQgPSBudWxsO1xyXG5cdHRoaXMuc3BhY2VDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUxpbmVzID0gbnVsbDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlO1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oLypJbnQqLyB4LCAvKkludCovIHkpe1xyXG5cdHZhciBzID0gdGhpcy5tZXNzYWdlcy5sZW5ndGggLSAxO1xyXG5cdHZhciBjdHggPSB0aGlzLmdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdGN0eC5kcmF3SW1hZ2UodGhpcy5zZkNvbnRleHQuY2FudmFzLCB4LCB5KTtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZUZvbnQgPSBmdW5jdGlvbigvKkltYWdlKi8gc3ByaXRlRm9udCwgLypTdHJpbmcqLyBjaGFyYWN0ZXJzVXNlZCwgLypJbnQqLyB2ZXJ0aWNhbFNwYWNlKXtcclxuXHR0aGlzLnNwcml0ZUZvbnQgPSBzcHJpdGVGb250O1xyXG5cdHRoaXMubGlzdE9mQ2hhcnMgPSBjaGFyYWN0ZXJzVXNlZDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSB2ZXJ0aWNhbFNwYWNlO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwMDtcclxuXHRjYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLnNmQ29udGV4dC5jYW52YXMgPSBjYW52YXM7XHJcblx0XHJcblx0dGhpcy5zcGFjZUNoYXJzID0gc3ByaXRlRm9udC53aWR0aCAvIGNoYXJhY3RlcnNVc2VkLmxlbmd0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmZvcm1hdFRleHQgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciB0eHQgPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcclxuXHR2YXIgbGluZSA9IFwiXCI7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dHh0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIHdvcmQgPSB0eHRbaV07XHJcblx0XHRpZiAoKGxpbmUgKyBcIiBcIiArIHdvcmQpLmxlbmd0aCA8PSB0aGlzLnNwbGl0QXQpe1xyXG5cdFx0XHRpZiAobGluZSAhPSBcIlwiKSBsaW5lICs9IFwiIFwiO1xyXG5cdFx0XHRsaW5lICs9IHdvcmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0LnB1c2gobGluZSk7XHJcblx0XHRcdGxpbmUgPSB3b3JkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXQucHVzaChsaW5lKTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuYWRkU0ZNZXNzYWdlID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgbXNnID0gdGhpcy5mb3JtYXRUZXh0KG1lc3NhZ2UpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49bXNnLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1zZ1tpXSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubGltaXQpe1xyXG5cdFx0dGhpcy5tZXNzYWdlcy5zcGxpY2UoMCwxKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGMgPSB0aGlzLnNmQ29udGV4dC5jYW52YXM7XHJcblx0dmFyIHcgPSB0aGlzLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSB0aGlzLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdHRoaXMuc2ZDb250ZXh0LmNsZWFyUmVjdCgwLDAsYy53aWR0aCxjLmhlaWdodCk7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLm1lc3NhZ2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG1zZyA9IHRoaXMubWVzc2FnZXNbaV07XHJcblx0XHR2YXIgeCA9IDA7XHJcblx0XHR2YXIgeSA9ICh0aGlzLnNwYWNlTGluZXMgKiB0aGlzLmxpbWl0KSAtIHRoaXMuc3BhY2VMaW5lcyAqIChsZW4gLSBpIC0gMSk7XHJcblx0XHRcclxuXHRcdHZhciBtVyA9IG1zZy5sZW5ndGggKiB3O1xyXG5cdFx0aWYgKG1XID4gYy53aWR0aCkgYy53aWR0aCA9IG1XICsgKDIgKiB3KTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49bXNnLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0dmFyIGNoYXJhID0gbXNnLmNoYXJBdChqKTtcclxuXHRcdFx0dmFyIGluZCA9IHRoaXMubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0XHR0aGlzLnNmQ29udGV4dC5kcmF3SW1hZ2UodGhpcy5zcHJpdGVGb250LFxyXG5cdFx0XHRcdFx0dyAqIGluZCwgMCwgdywgaCxcclxuXHRcdFx0XHRcdHgsIHksIHcsIGgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR4ICs9IHc7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBEb29yKG1hcE1hbmFnZXIsIHdhbGxQb3NpdGlvbiwgZGlyLCB0ZXh0dXJlQ29kZSwgd2FsbFRleHR1cmUsIGxvY2spe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy53YWxsUG9zaXRpb24gPSB3YWxsUG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IDA7XHJcblx0dGhpcy5kaXIgPSBkaXI7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMuclRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7IC8vIERlbGV0ZVxyXG5cclxuXHR0aGlzLmRvb3JQb3NpdGlvbiA9IHdhbGxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cdHRoaXMud2FsbFRleHR1cmUgPSB3YWxsVGV4dHVyZTtcclxuXHRcdFxyXG5cdHRoaXMuYm91bmRpbmdCb3ggPSBudWxsO1xyXG5cdHRoaXMucG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHRpZiAoZGlyID09IFwiSFwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygtMC4yNSwgMC4wLCAwLjApKTsgfWVsc2VcclxuXHRpZiAoZGlyID09IFwiVlwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygwLjAsIDAuMCwgLTAuMjUpKTsgdGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjsgfVxyXG5cdFxyXG5cdHRoaXMubG9jayA9IGxvY2s7XHJcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xyXG5cdHRoaXMuYW5pbWF0aW9uID0gIDA7XHJcblx0dGhpcy5vcGVuU3BlZWQgPSBNYXRoLmRlZ1RvUmFkKDEwKTtcclxuXHRcclxuXHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERvb3I7XHJcblxyXG5Eb29yLnByb3RvdHlwZS5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuYm91bmRpbmdCb3g7XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5sb2NrKXtcclxuXHRcdHZhciBrZXkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0UGxheWVySXRlbSh0aGlzLmxvY2spO1xyXG5cdFx0aWYgKGtleSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGtleS5uYW1lICsgXCIgdXNlZFwiKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLnJlbW92ZVBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdFx0dGhpcy5sb2NrID0gbnVsbDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkxvY2tlZFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5jbG9zZWQpIHRoaXMuYW5pbWF0aW9uID0gMTtcclxuXHRlbHNlIHRoaXMuYW5pbWF0aW9uID0gMjsgXHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gIT0gMCkgcmV0dXJuIHRydWU7XHJcblx0cmV0dXJuIHRoaXMuY2xvc2VkO1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubW9kaWZ5Q29sbGlzaW9uID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kaXIgPT0gXCJIXCIpe1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSAtIDAuMDUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuMSwgaDogMC41XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fWVsc2V7XHJcblx0XHRpZiAodGhpcy5jbG9zZWQpe1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSAtIDAuMDUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgYW4xID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMiAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdHZhciBhbjIgPSAoKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJIXCIpIHx8ICh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiVlwiKSk7XHJcblx0XHJcblx0aWYgKGFuMSAmJiB0aGlzLnJvdGF0aW9uIDwgTWF0aC5QSV8yKXtcclxuXHRcdHRoaXMucm90YXRpb24gKz0gdGhpcy5vcGVuU3BlZWQ7XHJcblx0XHRpZiAodGhpcy5yb3RhdGlvbiA+PSBNYXRoLlBJXzIpe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gTWF0aC5QSV8yO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIlZcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKGFuMiAmJiB0aGlzLnJvdGF0aW9uID4gMCl7XHJcblx0XHR0aGlzLnJvdGF0aW9uIC09IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPD0gMCl7XHJcblx0XHRcdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIkhcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICdiaWxsYm9hcmQnKTtcclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICd0ZXh0dXJlQ29vcmRzJyk7XHJcblxyXG5mdW5jdGlvbiBFbmVteShwb3NpdGlvbiwgZW5lbXksIG1hcE1hbmFnZXIpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignRW5lbXknKTtcclxuXHRpZiAoZW5lbXkuc3dpbSkgcG9zaXRpb24uYiAtPSAwLjI7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUJhc2UgPSBlbmVteS50ZXh0dXJlQmFzZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYW5pbWF0aW9uID0gXCJydW5cIjtcclxuXHR0aGlzLmVuZW15ID0gZW5lbXk7XHJcblx0dGhpcy50YXJnZXQgPSBmYWxzZTtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcygyKTtcclxuXHR0aGlzLm51bUZyYW1lcyA9IDI7XHJcblx0dGhpcy5pbWdTcGQgPSAxLzc7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5odXJ0ID0gMC4wO1xyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy5zb2xpZCA9IHRydWU7XHJcblx0dGhpcy5zbGVlcCA9IDA7XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMC4wO1xyXG5cdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLnJlY2VpdmVEYW1hZ2UgPSBmdW5jdGlvbihkbWcpe1xyXG5cdHRoaXMuaHVydCA9IDUuMDtcclxuXHRcclxuXHR0aGlzLmVuZW15LmhwIC09IGRtZztcclxuXHRpZiAodGhpcy5lbmVteS5ocCA8PSAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmFkZEV4cGVyaWVuY2UodGhpcy5lbmVteS5zdGF0cy5leHApO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIga2lsbGVkXCIpO1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29rRm9yID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAoIXBsYXllci5tb3ZlZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdFxyXG5cdHZhciBkeCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0dmFyIGR6ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcclxuXHRpZiAoIXRoaXMudGFyZ2V0ICYmIChkeCA8PSA0IHx8IGR6IDw9IDQpKXtcclxuXHRcdC8vIENhc3QgYSByYXkgdG93YXJkcyB0aGUgcGxheWVyIHRvIGNoZWNrIGlmIGhlJ3Mgb24gdGhlIHZpc2lvbiBvZiB0aGUgY3JlYXR1cmVcclxuXHRcdHZhciByeCA9IHRoaXMucG9zaXRpb24uYTtcclxuXHRcdHZhciByeSA9IHRoaXMucG9zaXRpb24uYztcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMztcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4zO1xyXG5cdFx0XHJcblx0XHR2YXIgc2VhcmNoID0gMTU7XHJcblx0XHR3aGlsZSAoc2VhcmNoID4gMCl7XHJcblx0XHRcdHJ4ICs9IGR4O1xyXG5cdFx0XHRyeSArPSBkeTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjeCA9IChyeCA8PCAwKTtcclxuXHRcdFx0dmFyIGN5ID0gKHJ5IDw8IDApO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMubWFwTWFuYWdlci5pc1NvbGlkKGN4LCBjeSwgMCkpe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHB4ID0gKHAuYSA8PCAwKTtcclxuXHRcdFx0XHR2YXIgcHkgPSAocC5jIDw8IDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChjeCA9PSBweCAmJiBjeSA9PSBweSl7XHJcblx0XHRcdFx0XHR0aGlzLnRhcmdldCA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRcdFx0XHRzZWFyY2ggPSAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VhcmNoIC09IDE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jLCB0cnVlKTtcclxuXHRpZiAodGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgcG9pbnRZIDwgMC4wKSBwb2ludFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcblx0XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gdGhpcy5wb3NpdGlvbi5iKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHRoaXMub25XYXRlcik7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0LCB0aGlzKTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5lbmVteS5zdGF0cy5mbHkgJiYgIXRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiB0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYSAtPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmMgLT0gbW92ZW1lbnQuYjtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuZW5lbXkuc3RhdHMuc3dpbSAmJiAhdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5kb1ZlcnRpY2FsQ2hlY2tzKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmF0dGFja1BsYXllciA9IGZ1bmN0aW9uKHBsYXllcil7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZSh0aGlzLmVuZW15LnN0YXRzLnN0cik7XHJcblx0dmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXllci5zdGF0cy5kZnMpO1xyXG5cdFxyXG5cdC8vIENoZWNrIGlmIHRoZSBwbGF5ZXIgaGFzIHRoZSBwcm90ZWN0aW9uIHNwZWxsXHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnByb3RlY3Rpb24gPiAwKXtcclxuXHRcdGRmcyArPSAxNTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCk7XHJcblx0XHJcblx0aWYgKGRtZyA+IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoZG1nICsgXCIgZGFtYWdlIGluZmxpY3RlZFwiKTtcclxuXHRcdHBsYXllci5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSA5MDtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdHZhciBwID0gcGxheWVyLnBvc2l0aW9uO1xyXG5cdGlmICh0aGlzLmVuZW15QXR0YWNrQ291bnRlciA+IDApe1xyXG5cdFx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgLS07XHJcblx0XHRpZiAodGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPT0gMCl7XHJcblx0XHRcdHZhciB4eCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0XHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRcdGlmICh4eCA8PSAxICYmIHl5IDw9MSl7XHJcblx0XHRcdFx0dGhpcy5hdHRhY2tQbGF5ZXIocGxheWVyKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHRoaXMudGFyZ2V0KXtcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKHAuYSAtIHRoaXMucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeXkgPSBNYXRoLmFicyhwLmMgLSB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdFx0aWYgKHRoaXMuYXR0YWNrV2FpdCA+IDApe1xyXG5cdFx0XHR0aGlzLmF0dGFja1dhaXQgLS07XHJcblx0XHR9XHJcblx0XHRpZiAoeHggPD0gMSAmJiB5eSA8PTEpe1xyXG5cdFx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID09IDApe1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGF0dGFja3MhXCIpO1xyXG5cdFx0XHRcdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMTA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh4eCA+IDEwIHx8IHl5ID4gMTApe1xyXG5cdFx0XHR0aGlzLnRhcmdldCA9IG51bGw7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGRpciA9IE1hdGguZ2V0QW5nbGUodGhpcy5wb3NpdGlvbiwgcCk7XHJcblx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIpICogMC4wMjtcclxuXHRcdHZhciBkeSA9IC1NYXRoLnNpbihkaXIpICogMC4wMjtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdCA9IHZlYzIoTWF0aC5jb3MoZGlyICsgTWF0aC5QSV8yKSwgLU1hdGguc2luKGRpciArIE1hdGguUElfMikpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1vdmVUbyhkeCwgZHksIGxhdCk7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmxvb2tGb3IoKTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZ2V0VGV4dHVyZUNvZGUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBmYWNlID0gdGhpcy5kaXJlY3Rpb247XHJcblx0dmFyIGEgPSB0aGlzLmFuaW1hdGlvbjtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gPT0gXCJzdGFuZFwiKSBhID0gXCJydW5cIjtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlQmFzZSArIFwiX1wiICsgYTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQucGFpbnRJblJlZCA9ICh0aGlzLmh1cnQgPiAwKTtcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLmdldFRleHR1cmVDb2RlKCksdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwKXsgdGhpcy5odXJ0IC09IDE7IH1cclxuXHRpZiAodGhpcy5zbGVlcCA+IDApeyB0aGlzLnNsZWVwIC09IDE7IH1cclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmIChnYW1lLnBhdXNlZCB8fCBnYW1lLnRpbWVTdG9wID4gMCB8fCB0aGlzLnNsZWVwID4gMCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA8PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9ZWxzZSBpZiAodGhpcy50YXJnZXRZID4gdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiArPSAwLjA4O1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA+PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGVuZW1pZXM6IHtcclxuXHRcdGJhdDoge25hbWU6ICdHaWFudCBCYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDQsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmF0OiB7bmFtZTogJ0dpYW50IFJhdCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYXQnLCBzdGF0czoge3N0cjogJzFEOScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c3BpZGVyOiB7bmFtZTogJ0dpYW50IFNwaWRlcicsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdzcGlkZXInLCBzdGF0czoge3N0cjogJzFEMTEnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdyZW1saW46IHtuYW1lOiAnR3JlbWxpbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdncmVtbGluJywgc3RhdHM6IHtzdHI6ICcyRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNrZWxldG9uOiB7bmFtZTogJ1NrZWxldG9uJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3NrZWxldG9uJywgc3RhdHM6IHtzdHI6ICczRDQnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdGhlYWRsZXNzOiB7bmFtZTogJ0hlYWRsZXNzJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2hlYWRsZXNzJywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdC8vbml4aWU6IHtuYW1lOiAnTml4aWUnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICczRDUnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcdFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0d2lzcDoge25hbWU6ICdXaXNwJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ3dpc3AnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDV9fSxcclxuXHRcdGdob3N0OiB7bmFtZTogJ0dob3N0JywgaHA6IDgwLCB0ZXh0dXJlQmFzZTogJ2dob3N0Jywgc3RhdHM6IHtzdHI6ICcyRDE1JywgZGZzOiAnMkQyJywgZXhwOiA2LCBmbHk6IHRydWV9fSxcclxuXHRcdHRyb2xsOiB7bmFtZTogJ1Ryb2xsJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ3Ryb2xsJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSwgLy8gTm90IHVzZWQgYnkgdGhlIGdlbmVyYXRvcj9cclxuXHRcdGxhdmFMaXphcmQ6IHtuYW1lOiAnTGF2YSBMaXphcmQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbGF2YUxpemFyZCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtb25nYmF0OiB7bmFtZTogJ01vbmdiYXQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnbW9uZ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3LCBmbHk6IHRydWV9fSwgXHJcblx0XHRvY3RvcHVzOiB7bmFtZTogJ0dpYW50IFNxdWlkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ29jdG9wdXMnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LFxyXG5cdFx0ZGFlbW9uOiB7bmFtZTogJ0RhZW1vbicsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnZGFlbW9uJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDh9fSxcclxuXHRcdC8vcGhhbnRvbToge25hbWU6ICdQaGFudG9tJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzFEMTUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHNlYVNlcnBlbnQ6IHtuYW1lOiAnU2VhIFNlcnBlbnQnLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ3NlYVNlcnBlbnQnLCBzdGF0czoge3N0cjogJzNENicsIGRmczogJzJEMicsIGV4cDogOSwgc3dpbTogdHJ1ZX19LCAvLyBub3Qgc3VpdGFibGVcclxuXHRcdGV2aWxNYWdlOiB7bmFtZTogJ0V2aWwgTWFnZScsIGhwOiAxNzYsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNkQ1JywgZGZzOiAnMkQyJywgZXhwOiAxMn19LCAvL1RPRE86IEFkZCB0ZXh0dXJlXHJcblx0XHRsaWNoZToge25hbWU6ICdMaWNoZScsIGhwOiAxOTIsIHRleHR1cmVCYXNlOiAnbGljaGUnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTN9fSxcclxuXHRcdGh5ZHJhOiB7bmFtZTogJ0h5ZHJhJywgaHA6IDIwOCwgdGV4dHVyZUJhc2U6ICdoeWRyYScsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNH19LFxyXG5cdFx0ZHJhZ29uOiB7bmFtZTogJ0RyYWdvbicsIGhwOiAyMjQsIHRleHR1cmVCYXNlOiAnZHJhZ29uJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE1LCBmbHk6IHRydWV9fSxcdFx0XHRcdC8vIE5vdCBzdWl0YWJsZVxyXG5cdFx0em9ybjoge25hbWU6ICdab3JuJywgaHA6IDI0MCwgdGV4dHVyZUJhc2U6ICd6b3JuJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRnYXplcjoge25hbWU6ICdHYXplcicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnZ2F6ZXInLCBzdGF0czoge3N0cjogJzVEOCcsIGRmczogJzJEMicsIGV4cDogMTYsIGZseTogdHJ1ZX19LFxyXG5cdFx0cmVhcGVyOiB7bmFtZTogJ1JlYXBlcicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAncmVhcGVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHRiYWxyb246IHtuYW1lOiAnQmFscm9uJywgaHA6IDI1NSwgdGV4dHVyZUJhc2U6ICdiYWxyb24nLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTZ9fSxcclxuXHRcdC8vdHdpc3Rlcjoge25hbWU6ICdUd2lzdGVyJywgaHA6IDI1LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnNEQyJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHRcclxuXHRcdHdhcnJpb3I6IHtuYW1lOiAnRmlnaHRlcicsIGhwOiA5OCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdG1hZ2U6IHtuYW1lOiAnTWFnZScsIGhwOiAxMTIsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA4fX0sXHJcblx0XHRiYXJkOiB7bmFtZTogJ0JhcmQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAnYmFyZCcsIHN0YXRzOiB7c3RyOiAnMkQxMCcsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0ZHJ1aWQ6IHtuYW1lOiAnRHJ1aWQnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnbWFnZScsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiAxMH19LFxyXG5cdFx0dGlua2VyOiB7bmFtZTogJ1RpbmtlcicsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cGFsYWRpbjoge25hbWU6ICdQYWxhZGluJywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdmaWdodGVyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNoZXBoZXJkOiB7bmFtZTogJ1NoZXBoZXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3JhbmdlcicsIHN0YXRzOiB7c3RyOiAnM0QzJywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHJcblx0XHRyYW5nZXI6IHtuYW1lOiAnUmFuZ2VyJywgaHA6IDE0NCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogM319XHJcblx0fSxcclxuXHRcclxuXHRnZXRFbmVteTogZnVuY3Rpb24obmFtZSl7XHJcblx0XHRpZiAoIXRoaXMuZW5lbWllc1tuYW1lXSkgdGhyb3cgXCJJbnZhbGlkIGVuZW15IG5hbWU6IFwiICsgbmFtZTtcclxuXHRcdFxyXG5cdFx0dmFyIGVuZW15ID0gdGhpcy5lbmVtaWVzW25hbWVdO1xyXG5cdFx0dmFyIHJldCA9IHtcclxuXHRcdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaSBpbiBlbmVteSl7XHJcblx0XHRcdHJldFtpXSA9IGVuZW15W2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwiZnVuY3Rpb24gSW52ZW50b3J5KGxpbWl0SXRlbXMpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignSW52ZW50b3J5Jyk7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG5cdHRoaXMubGltaXRJdGVtcyA9IGxpbWl0SXRlbXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW52ZW50b3J5O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pdGVtcyA9IFtdO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0aWYgKHRoaXMuaXRlbXMubGVuZ3RoID09IHRoaXMubGltaXRJdGVtcyl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZXF1aXBJdGVtID0gZnVuY3Rpb24oaXRlbUlkKXtcclxuXHR2YXIgdHlwZSA9IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ZW0udHlwZSA9PSB0eXBlKXtcclxuXHRcdFx0aXRlbS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHR0aGlzLml0ZW1zW2l0ZW1JZF0uZXF1aXBwZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRFcXVpcHBlZEl0ZW0gPSBmdW5jdGlvbih0eXBlKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdGVtLnR5cGUgPT0gdHlwZSAmJiBpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0cmV0dXJuIGl0ZW07XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRXZWFwb24gPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmdldEVxdWlwcGVkSXRlbSgnd2VhcG9uJyk7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmdldEFybW91ciA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuZ2V0RXF1aXBwZWRJdGVtKCdhcm1vdXInKTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZGVzdHJveUl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRpdGVtLnN0YXR1cyA9IDAuMDtcclxuXHRpdGVtLmVxdWlwcGVkID0gZmFsc2U7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ID0gdGhpcy5pdGVtc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGl0ID09PSBpdGVtKXtcclxuXHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5kcm9wSXRlbSA9IGZ1bmN0aW9uKGl0ZW1JZCl7XHJcblx0aWYgKHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICd3ZWFwb24nIHx8IHRoaXMuaXRlbXNbaXRlbUlkXS50eXBlID09ICdhcm1vdXInKXtcclxuXHRcdHRoaXMuaXRlbXNbaXRlbUlkXS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdH1cclxuXHR0aGlzLml0ZW1zLnNwbGljZShpdGVtSWQsIDEpO1xyXG59O1xyXG4iLCJ2YXIgQmlsbGJvYXJkID0gcmVxdWlyZSgnLi9CaWxsYm9hcmQnKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdJdGVtJywgJ2JpbGxib2FyZCcpO1xyXG5cclxuZnVuY3Rpb24gSXRlbShwb3NpdGlvbiwgaXRlbSwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdJdGVtJyk7XHJcblx0dmFyIGdsID0gbWFwTWFuYWdlci5nYW1lLkdMLmN0eDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5pdGVtID0gbnVsbDtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCBnbCk7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdHRoaXMuc29saWQgPSBmYWxzZTtcclxuXHRcclxuXHRpZiAoaXRlbSkgdGhpcy5zZXRJdGVtKGl0ZW0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5zZXRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0dGhpcy5pdGVtID0gaXRlbTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1t0aGlzLml0ZW0uc3ViSW1nXTtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gaXRlbS50ZXg7XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1tID0gdGhpcy5tYXBNYW5hZ2VyO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKHRoaXMuaXRlbS5pc0l0ZW0pe1xyXG5cdFx0aWYgKHRoaXMuaXRlbS50eXBlID09ICdjb2RleCcpe1xyXG5cdFx0XHQvLyAxMCBsaW5lc1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhlIGJvdW5kbGVzcyBrbm93bmxlZGdlIG9mIHRoZSBDb2RleCBpcyByZXZlYWxlZCB1bnRvIHRoZWUuXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiQSB2b2ljZSB0aHVuZGVycyFcIilcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlRob3UgaGFzdCBwcm92ZW4gdGh5c2VsZiB0byBiZSB0cnVseSBnb29kIGluIG5hdHVyZVwiKVxyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIilcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcInF1ZXN0IG9mIGEgbGlmZXRpbWUuXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiQXZhdGFyaG9vZCBpcyBhIGxpdmluZyBnaWZ0LCBJdCBtdXN0IGFsd2F5cyBhbmQgZm9yZXZlciBiZSBudXJ0dXJlZFwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcInRvIGZsdW9yaXNoLCBmb3IgaWYgdGhvdSBkb3N0IHN0cmF5IGZyb20gdGhlIHBhdGhzIG9mIHZpcnR1ZSwgdGh5IHdheVwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIm1heSBiZSBsb3N0IGZvcmV2ZXIuXCIpXHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJSZXR1cm4gbm93IHVudG8gdGhpbmUgb3VyIHdvcmxkLCBsaXZlIHRoZXJlIGFzIGFuIGV4YW1wbGUgdG8gdGh5XCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwicGVvcGxlLCBhcyBvdXIgbWVtb3J5IG9mIHRoeSBnYWxsYW50IGRlZWRzIHNlcnZlcyB1cy5cIilcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2ZlYXR1cmUnKXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBzZWUgYSBcIit0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHR9IGVsc2UgaWYgKGdhbWUuYWRkSXRlbSh0aGlzLml0ZW0pKXtcclxuXHRcdFx0dmFyIHN0YXQgPSAnJztcclxuXHRcdFx0aWYgKHRoaXMuaXRlbS5zdGF0dXMgIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRzdGF0ID0gSXRlbUZhY3RvcnkuZ2V0U3RhdHVzTmFtZSh0aGlzLml0ZW0uc3RhdHVzKSArICcgJztcclxuXHRcdFx0XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2Uoc3RhdCArIHRoaXMuaXRlbS5uYW1lICsgXCIgcGlja2VkLlwiKTtcclxuXHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3UgY2FuJ3QgY2FycnkgYW55IG1vcmUgaXRlbXNcIik7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wYXVzZWQpe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRpdGVtczoge1xyXG5cdFx0Ly8gSXRlbXNcclxuXHRcdHllbGxvd1BvdGlvbjoge25hbWU6IFwiWWVsbG93IHBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAwLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRyZWRQb3Rpb246IHtuYW1lOiBcIlJlZCBQb3Rpb25cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMSwgdHlwZTogJ3BvdGlvbid9LFxyXG5cdFx0XHJcblx0XHQvLyBXZWFwb25zXHJcblx0XHRzdGFmZjoge25hbWU6IFwiU3RhZmZcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzRENCcsIHdlYXI6IDAuMDJ9LFxyXG5cdFx0ZGFnZ2VyOiB7bmFtZTogXCJEYWdnZXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMywgdHlwZTogJ3dlYXBvbicsIHN0cjogJzNEOCcsIHdlYXI6IDAuMDV9LFxyXG5cdFx0c2xpbmc6IHtuYW1lOiBcIlNsaW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc0RDgnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAncm9jaycsIHdlYXI6IDAuMDR9LFxyXG5cdFx0bWFjZToge25hbWU6IFwiTWFjZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA1LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTBENCcsIHdlYXI6IDAuMDN9LFxyXG5cdFx0YXhlOiB7bmFtZTogXCJBeGVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEyRDQnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdHN3b3JkOiB7bmFtZTogXCJTd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA4LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTZENCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdG15c3RpY1N3b3JkOiB7bmFtZTogXCJNeXN0aWMgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogOSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE2RDE2Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0Ym93OiB7bmFtZTogXCJCb3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTAsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMEQ0JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Fycm93Jywgd2VhcjogMC4wMX0sXHJcblx0XHRjcm9zc2Jvdzoge25hbWU6IFwiQ3Jvc3Nib3dcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTEsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNkQ0JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ2Nyb3NzYm93IGJvbHQnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRcclxuXHRcdC8vIEFybW91clxyXG5cdFx0bGVhdGhlcjoge25hbWU6IFwiTGVhdGhlciBhcm1vdXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTIsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcxOEQ4Jywgd2VhcjogMC4wNX0sXHJcblx0XHRjaGFpbjoge25hbWU6IFwiQ2hhaW4gbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMywgdHlwZTogJ2FybW91cicsIGRmczogJzIwRDgnLCB3ZWFyOiAwLjAzfSxcclxuXHRcdHBsYXRlOiB7bmFtZTogXCJQbGF0ZSBtYWlsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE0LCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMjJEOCcsIHdlYXI6IDAuMDE1fSxcclxuXHRcdG15c3RpYzoge25hbWU6IFwiTXlzdGljIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNSwgdHlwZTogJ2FybW91cicsIGRmczogJzMxRDgnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRcclxuXHRcdC8vIFNwZWxsIG1peGVzXHJcblx0XHRjdXJlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBDdXJlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAwLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1fSxcclxuXHRcdGhlYWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEhlYWxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDEwLCBwZXJjZW50OiAwLjJ9LFxyXG5cdFx0bGlnaHQ6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIExpZ2h0XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiA1LCBsaWdodFRpbWU6IDEwMDB9LFxyXG5cdFx0bWlzc2lsZToge25hbWU6IFwiU3BlbGxtaXggb2YgbWFnaWMgbWlzc2lsZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMzBENScsIG1hbmE6IDV9LFxyXG5cdFx0aWNlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSWNlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNCwgdHlwZTogJ21hZ2ljJywgc3RyOiAnNjVENScsIG1hbmE6IDIwfSxcclxuXHRcdHJlcGVsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBSZXBlbCBVbmRlYWRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDUsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGJsaW5rOiB7bmFtZTogXCJTcGVsbG1peCBvZiBCbGlua1wiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0ZmlyZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEZpcmViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA3LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICcxMDBENScsIG1hbmE6IDE1fSxcclxuXHRcdHByb3RlY3Rpb246IHtuYW1lOiBcIlNwZWxsbWl4IG9mIHByb3RlY3Rpb25cIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdtYWdpYycsIHByb3RUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdHRpbWU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRpbWUgU3RvcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOSwgdHlwZTogJ21hZ2ljJywgc3RvcFRpbWU6IDYwMCwgbWFuYTogMzB9LFxyXG5cdFx0c2xlZXA6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFNsZWVwXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ21hZ2ljJywgc2xlZXBUaW1lOiA0MDAsIG1hbmE6IDE1fSxcclxuXHRcdGppbng6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEppbnhcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDExLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHR0cmVtb3I6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFRyZW1vclwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdGtpbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEtpbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc0MDBENScsIG1hbmE6IDI1fSxcclxuXHRcdFxyXG5cdFx0Ly8gQ29kZXhcclxuXHRcdGNvZGV4OiB7bmFtZTogXCJDb2RleCBvZiBVbHRpbWF0ZSBXaXNkb21cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTYsIHR5cGU6ICdjb2RleCd9LFxyXG5cdFx0XHJcblx0XHQvLyBUZW1wOiBEdW5nZW9uIGZlYXR1cmVzIGFzIGl0ZW1zXHJcblx0XHRvcmI6IHtuYW1lOiBcIk9yYlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNywgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGRlYWRUcmVlOiB7bmFtZTogXCJEZWFkIFRyZWVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTgsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHR0cmVlOiB7bmFtZTogXCJUcmVlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE5LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0c3RhdHVlOiB7bmFtZTogXCJTdGF0dWVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjAsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRzaWduUG9zdDoge25hbWU6IFwiU2lnbnBvc3RcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjEsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHR3ZWxsOiB7bmFtZTogXCJXZWxsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIyLCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0c21hbGxTaWduOiB7bmFtZTogXCJTaWduXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIzLCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0bGFtcDoge25hbWU6IFwiTGFtcFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNCwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGZsYW1lOiB7bmFtZTogXCJGbGFtZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNSwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGNhbXBmaXJlOiB7bmFtZTogXCJDYW1wZmlyZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNiwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGFsdGFyOiB7bmFtZTogXCJBbHRhclwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyNywgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHByaXNvbmVyVGhpbmc6IHtuYW1lOiBcIlNoYWNrbGVzXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI4LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0Zm91bnRhaW46IHtuYW1lOiBcIkZvdW50YWluXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI5LCB0eXBlOiAnZmVhdHVyZSd9XHJcblx0fSxcclxuXHRcclxuXHRnZXRJdGVtQnlDb2RlOiBmdW5jdGlvbihpdGVtQ29kZSwgc3RhdHVzKXtcclxuXHRcdGlmICghdGhpcy5pdGVtc1tpdGVtQ29kZV0pIHRocm93IFwiSW52YWxpZCBJdGVtIGNvZGU6IFwiICsgaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdHZhciBpdGVtID0gdGhpcy5pdGVtc1tpdGVtQ29kZV07XHJcblx0XHR2YXIgcmV0ID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0XHR9O1xyXG5cdFx0Zm9yICh2YXIgaSBpbiBpdGVtKXtcclxuXHRcdFx0cmV0W2ldID0gaXRlbVtpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0LmlzSXRlbSA9IHRydWU7XHJcblx0XHRyZXQuY29kZSA9IGl0ZW1Db2RlO1xyXG5cdFx0XHJcblx0XHRpZiAocmV0LnR5cGUgPT0gJ3dlYXBvbicgfHwgcmV0LnR5cGUgPT0gJ2FybW91cicpe1xyXG5cdFx0XHRyZXQuZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcdFx0cmV0LnN0YXR1cyA9IHN0YXR1cztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFN0YXR1c05hbWU6IGZ1bmN0aW9uKHN0YXR1cyl7XHJcblx0XHRpZiAoc3RhdHVzID49IDAuOCl7XHJcblx0XHRcdHJldHVybiAnRXhjZWxsZW50JztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC41KXtcclxuXHRcdFx0cmV0dXJuICdTZXJ2aWNlYWJsZSc7XHJcblx0XHR9ZWxzZSBpZiAoc3RhdHVzID49IDAuMil7XHJcblx0XHRcdHJldHVybiAnV29ybic7XHJcblx0XHR9ZWxzZSBpZiAoc3RhdHVzID4gMC4wKXtcclxuXHRcdFx0cmV0dXJuICdCYWRseSB3b3JuJztcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gJ1J1aW5lZCc7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xyXG52YXIgRW5lbXkgPSByZXF1aXJlKCcuL0VuZW15Jyk7XHJcbnZhciBFbmVteUZhY3RvcnkgPSByZXF1aXJlKCcuL0VuZW15RmFjdG9yeScpO1xyXG52YXIgSXRlbSA9IHJlcXVpcmUoJy4vSXRlbScpO1xyXG52YXIgSXRlbUZhY3RvcnkgPSByZXF1aXJlKCcuL0l0ZW1GYWN0b3J5Jyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgU3RhaXJzID0gcmVxdWlyZSgnLi9TdGFpcnMnKTtcclxuXHJcbmZ1bmN0aW9uIE1hcEFzc2VtYmxlcihtYXBNYW5hZ2VyLCBtYXBEYXRhLCBHTCl7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gIG1hcE1hbmFnZXI7XHJcblx0dGhpcy5jb3BpZWRUaWxlcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMucGFyc2VNYXAobWFwRGF0YSwgR0wpO1xyXG5cdFx0XHRcdFxyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBEYXRhLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5pbml0aWFsaXplVGlsZXMgPSBmdW5jdGlvbih0aWxlcyl7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aWxlcy5sZW5ndGg7IGkrKyl7XHJcblx0XHRpZiAodGlsZXNbaV0pXHJcblx0XHRcdHRpbGVzW2ldLl9jID0gY2lyY3VsYXIuc2V0U2FmZSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuZ2V0RW1wdHlHcmlkID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ3JpZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MDt5PDY0O3krKyl7XHJcblx0XHRncmlkW3ldID0gW107XHJcblx0XHRmb3IgKHZhciB4PTA7eDw2NDt4Kyspe1xyXG5cdFx0XHRncmlkW3ldW3hdID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGdyaWQ7XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmNvcHlUaWxlID0gZnVuY3Rpb24odGlsZSl7XHJcblx0dmFyIHJldCA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHR9O1xyXG5cdFxyXG5cdGZvciAodmFyIGkgaW4gdGlsZSl7XHJcblx0XHRyZXRbaV0gPSB0aWxlW2ldO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZUZsb29yID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Zsb29ycyA9IFtdO1xyXG5cdHZhciBmbG9vcnNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5mKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gZmxvb3JzSW5kLmluZGV4T2YodGlsZS5mKTtcclxuXHRcdFx0XHR2YXIgZmw7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRmbG9vcnNJbmQucHVzaCh0aWxlLmYpO1xyXG5cdFx0XHRcdFx0ZmwgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0ZmwudGlsZSA9IHRpbGUuZjtcclxuXHRcdFx0XHRcdGZsLnJUaWxlID0gdGlsZS5yZjtcclxuXHRcdFx0XHRcdG9GbG9vcnMucHVzaChmbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRmbCA9IG9GbG9vcnNbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHl5ID0gdGlsZS55O1xyXG5cdFx0XHRcdGlmICh0aWxlLncpIHl5ICs9IHRpbGUuaDtcclxuXHRcdFx0XHRpZiAodGlsZS5meSkgeXkgPSB0aWxlLmZ5O1xyXG5cdFx0XHRcdGZsW3ldW3hdID0ge3RpbGU6IHRpbGUuZiwgeTogeXl9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9GbG9vcnMubGVuZ3RoO2krKyl7XHJcblx0XHR2YXIgZmxvb3IzRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob0Zsb29yc1tpXSwgXCJGXCIsIEdMKTtcclxuXHRcdGZsb29yM0QudGV4SW5kID0gb0Zsb29yc1tpXS50aWxlO1xyXG5cdFx0Zmxvb3IzRC5yVGV4SW5kID0gb0Zsb29yc1tpXS5yVGlsZTtcclxuXHRcdGZsb29yM0QudHlwZSA9IFwiRlwiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKGZsb29yM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVDZWlscyA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9DZWlscyA9IFtdO1xyXG5cdHZhciBjZWlsc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLmMpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBjZWlsc0luZC5pbmRleE9mKHRpbGUuYyk7XHJcblx0XHRcdFx0dmFyIGNsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Y2VpbHNJbmQucHVzaCh0aWxlLmMpO1xyXG5cdFx0XHRcdFx0Y2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0Y2wudGlsZSA9IHRpbGUuYztcclxuXHRcdFx0XHRcdG9DZWlscy5wdXNoKGNsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGNsID0gb0NlaWxzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNsW3ldW3hdID0ge3RpbGU6IHRpbGUuYywgeTogdGlsZS5jaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0NlaWxzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGNlaWwzRCA9IE9iamVjdEZhY3RvcnkuYXNzZW1ibGVPYmplY3Qob0NlaWxzW2ldLCBcIkNcIiwgR0wpO1xyXG5cdFx0Y2VpbDNELnRleEluZCA9IG9DZWlsc1tpXS50aWxlO1xyXG5cdFx0Y2VpbDNELnR5cGUgPSBcIkNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChjZWlsM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVCbG9ja3MgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQmxvY2tzID0gW107XHJcblx0dmFyIGJsb2Nrc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLncpe1xyXG5cdFx0XHRcdHZhciBpbmQgPSBibG9ja3NJbmQuaW5kZXhPZih0aWxlLncpO1xyXG5cdFx0XHRcdHZhciB3bDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGJsb2Nrc0luZC5wdXNoKHRpbGUudyk7XHJcblx0XHRcdFx0XHR3bCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHR3bC50aWxlID0gdGlsZS53O1xyXG5cdFx0XHRcdFx0b0Jsb2Nrcy5wdXNoKHdsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHdsID0gb0Jsb2Nrc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3bFt5XVt4XSA9IHt0aWxlOiB0aWxlLncsIHk6IHRpbGUueSwgaDogdGlsZS5ofTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvQmxvY2tzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGJsb2NrM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9CbG9ja3NbaV0sIFwiQlwiLCBHTCk7XHJcblx0XHRibG9jazNELnRleEluZCA9IG9CbG9ja3NbaV0udGlsZTtcclxuXHRcdGJsb2NrM0QudHlwZSA9IFwiQlwiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKGJsb2NrM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVTbG9wZXMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvU2xvcGVzID0gW107XHJcblx0dmFyIHNsb3Blc0luZCA9IFtdO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdGlmICh0aWxlLnNsKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gc2xvcGVzSW5kLmluZGV4T2YodGlsZS5zbCk7XHJcblx0XHRcdFx0dmFyIHNsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0c2xvcGVzSW5kLnB1c2godGlsZS5zbCk7XHJcblx0XHRcdFx0XHRzbCA9IG1hcE0uZ2V0RW1wdHlHcmlkKCk7XHJcblx0XHRcdFx0XHRzbC50aWxlID0gdGlsZS5zbDtcclxuXHRcdFx0XHRcdG9TbG9wZXMucHVzaChzbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRzbCA9IG9TbG9wZXNbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHl5ID0gdGlsZS55O1xyXG5cdFx0XHRcdGlmICh0aWxlLncpIHl5ICs9IHRpbGUuaDtcclxuXHRcdFx0XHRpZiAodGlsZS5meSkgeXkgPSB0aWxlLmZ5O1xyXG5cdFx0XHRcdHNsW3ldW3hdID0ge3RpbGU6IHRpbGUuc2wsIHk6IHl5LCBkaXI6IHRpbGUuZGlyfTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvU2xvcGVzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIHNsb3BlM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9TbG9wZXNbaV0sIFwiU1wiLCBHTCk7XHJcblx0XHRzbG9wZTNELnRleEluZCA9IG9TbG9wZXNbaV0udGlsZTtcclxuXHRcdHNsb3BlM0QudHlwZSA9IFwiU1wiO1xyXG5cdFx0bWFwTS5tYXBNYW5hZ2VyLm1hcFRvRHJhdy5wdXNoKHNsb3BlM0QpO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUucGFyc2VNYXAgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdGZvciAodmFyIHk9MCxsZW49bWFwRGF0YS5tYXAubGVuZ3RoO3k8bGVuO3krKyl7XHJcblx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhLm1hcFt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4XSAhPSAwKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gbWFwRGF0YS5tYXBbeV1beF07XHJcblx0XHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLnRpbGVzW2luZF07XHJcblx0XHRcdFx0bWFwRGF0YS5tYXBbeV1beF0gPSB0aWxlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh0aWxlLmYgJiYgdGlsZS5mID4gMTAwKXtcclxuXHRcdFx0XHRcdHRpbGUucmYgPSB0aWxlLmYgLSAxMDA7XHJcblx0XHRcdFx0XHR0aWxlLmlzV2F0ZXIgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR0aWxlLnkgPSAtMC4yO1xyXG5cdFx0XHRcdFx0dGlsZS5meSA9IC0wLjI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh0aWxlLmYgPCAxMDApe1xyXG5cdFx0XHRcdFx0dmFyIHQxLCB0MiwgdDMsIHQ0O1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ldW3grMV0pIHQxID0gKG1hcERhdGEudGlsZXNbbWFwRGF0YS5tYXBbeV1beCsxXV0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeS0xXSkgdDIgPSAobWFwRGF0YS5tYXBbeS0xXVt4XS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4LTFdKSB0MyA9IChtYXBEYXRhLm1hcFt5XVt4LTFdLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3krMV0pIHQ0ID0gKG1hcERhdGEudGlsZXNbbWFwRGF0YS5tYXBbeSsxXVt4XV0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICh0MSB8fCB0MiB8fCB0MyB8fCB0NCl7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNvcGllZFRpbGVzW2luZF0pe1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmNvcGllZFRpbGVzW2luZF0gPSB0aGlzLmNvcHlUaWxlKHRpbGUpO1xyXG5cdFx0XHRcdFx0XHRcdHRpbGUgPSB0aGlzLmNvcGllZFRpbGVzW2luZF07XHJcblx0XHRcdFx0XHRcdFx0bWFwRGF0YS5tYXBbeV1beF0gPSB0aWxlO1xyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHRpbGUueSA9IC0xO1xyXG5cdFx0XHRcdFx0XHRcdHRpbGUuaCArPSAxO1xyXG5cdFx0XHRcdFx0XHRcdGlmICghdGlsZS53KXtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUudyA9IDEwO1xyXG5cdFx0XHRcdFx0XHRcdFx0dGlsZS5oID0gMTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlT2JqZWN0cyA9IGZ1bmN0aW9uKG1hcERhdGEpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49bWFwRGF0YS5vYmplY3RzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIG8gPSBtYXBEYXRhLm9iamVjdHNbaV07XHJcblx0XHR2YXIgeCA9IG8ueDtcclxuXHRcdHZhciB5ID0gby55O1xyXG5cdFx0dmFyIHogPSBvLno7XHJcblx0XHRcclxuXHRcdHN3aXRjaCAoby50eXBlKXtcclxuXHRcdFx0Y2FzZSBcInBsYXllclwiOlxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIgPSBuZXcgUGxheWVyKHZlYzMoeCwgeSwgeiksIHZlYzMoMC4wLCBvLmRpciAqIE1hdGguUElfMiwgMC4wKSwgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJpdGVtXCI6XHJcblx0XHRcdFx0dmFyIHN0YXR1cyA9IE1hdGgubWluKDAuMyArIChNYXRoLnJhbmRvbSgpICogMC43KSwgMS4wKTtcclxuXHRcdFx0XHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoby5pdGVtLCBzdGF0dXMpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChuZXcgSXRlbSh2ZWMzKHgsIHksIHopLCBpdGVtLCB0aGlzLm1hcE1hbmFnZXIpKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJlbmVteVwiOlxyXG5cdFx0XHRcdHZhciBlbmVteSA9IEVuZW15RmFjdG9yeS5nZXRFbmVteShvLmVuZW15KTtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobmV3IEVuZW15KHZlYzMoeCwgeSwgeiksIGVuZW15LCB0aGlzLm1hcE1hbmFnZXIpKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdGFpcnNcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobmV3IFN0YWlycyh2ZWMzKHgsIHksIHopLCB0aGlzLm1hcE1hbmFnZXIsIG8uZGlyKSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZG9vclwiOlxyXG5cdFx0XHRcdHZhciB4eCA9ICh4IDw8IDApIC0gKChvLmRpciA9PSBcIkhcIik/IDEgOiAwKTtcclxuXHRcdFx0XHR2YXIgenogPSAoeiA8PCAwKSAtICgoby5kaXIgPT0gXCJWXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt6el1beHhdLnc7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmRvb3JzLnB1c2gobmV3IERvb3IodGhpcy5tYXBNYW5hZ2VyLCB2ZWMzKHgsIHksIHopLCBvLmRpciwgXCJkb29yMVwiLCB0aWxlKSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxufTsiLCJ2YXIgTWFwQXNzZW1ibGVyID0gcmVxdWlyZSgnLi9NYXBBc3NlbWJsZXInKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdNYXBNYW5hZ2VyJywgJ2dhbWUnKTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwTWFuYWdlcjtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdlbmVyYXRlTWFwID0gZnVuY3Rpb24oZGVwdGgpe1xyXG5cdHZhciBjb25maWcgPSB7XHJcblx0XHRNSU5fV0lEVEg6IDEwLFxyXG5cdFx0TUlOX0hFSUdIVDogMTAsXHJcblx0XHRNQVhfV0lEVEg6IDIwLFxyXG5cdFx0TUFYX0hFSUdIVDogMjAsXHJcblx0XHRMRVZFTF9XSURUSDogNjQsXHJcblx0XHRMRVZFTF9IRUlHSFQ6IDY0LFxyXG5cdFx0U1VCRElWSVNJT05fREVQVEg6IDMsXHJcblx0XHRTTElDRV9SQU5HRV9TVEFSVDogMy84LFxyXG5cdFx0U0xJQ0VfUkFOR0VfRU5EOiA1LzgsXHJcblx0XHRSSVZFUl9TRUdNRU5UX0xFTkdUSDogMTAsXHJcblx0XHRNSU5fUklWRVJfU0VHTUVOVFM6IDEwLFxyXG5cdFx0TUFYX1JJVkVSX1NFR01FTlRTOiAyMCxcclxuXHRcdE1JTl9SSVZFUlM6IDMsXHJcblx0XHRNQVhfUklWRVJTOiA1XHJcblx0fTtcclxuXHR2YXIgZ2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvcihjb25maWcpO1xyXG5cdHZhciBrcmFtZ2luZUV4cG9ydGVyID0gbmV3IEtyYW1naW5lRXhwb3J0ZXIoY29uZmlnKTtcclxuXHR2YXIgZ2VuZXJhdGVkTGV2ZWwgPSBnZW5lcmF0b3IuZ2VuZXJhdGVMZXZlbChkZXB0aCk7XHJcblx0XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHRyeXtcclxuXHRcdHdpbmRvdy5nZW5lcmF0ZWRMZXZlbCA9IChnZW5lcmF0ZWRMZXZlbC5sZXZlbCk7XHJcblx0XHR2YXIgbWFwRGF0YSA9IGtyYW1naW5lRXhwb3J0ZXIuZ2V0TGV2ZWwoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0d2luZG93Lm1hcERhdGEgPSAobWFwRGF0YSk7XHJcblx0XHRuZXcgTWFwQXNzZW1ibGVyKG1hcE0sIG1hcERhdGEsIG1hcE0uZ2FtZS5HTC5jdHgpO1xyXG5cdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRtYXBNLmdldEluc3RhbmNlc1RvRHJhdygpO1xyXG5cdH1jYXRjaCAoZSl7XHJcblx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHR9XHJcblx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcE5hbWUpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRodHRwLm9wZW4oJ0dFVCcsIGNwICsgJ21hcHMvJyArIG1hcE5hbWUgKyBcIi5qc29uXCIsIHRydWUpO1xyXG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgXHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICBcdFx0XHR0cnl7XHJcblx0XHRcdFx0bWFwRGF0YSA9IEpTT04ucGFyc2UoaHR0cC5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG5ldyBNYXBBc3NlbWJsZXIobWFwTSwgbWFwRGF0YSwgbWFwTS5nYW1lLkdMLmN0eCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBtYXBEYXRhLm1hcDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0XHRcdG1hcE0uZ2V0SW5zdGFuY2VzVG9EcmF3KCk7XHJcblx0XHRcdH1jYXRjaCAoZSl7XHJcblx0XHRcdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUuc3RhY2spO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH07XHJcblx0aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XHJcblx0aHR0cC5zZW5kKCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1dhdGVyVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuICh0aGlzLndhdGVyVGlsZXMuaW5kZXhPZih0aWxlSWQpICE9IC0xKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc1dhdGVyVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhUG9zaXRpb24gPSBmdW5jdGlvbih4LCB6KXtcclxuXHR4ID0geCA8PCAwO1xyXG5cdHogPSB6IDw8IDA7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIDA7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSB1bmRlZmluZWQpIHJldHVybiAwO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gMDtcclxuXHRcclxuXHR2YXIgdCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC5mKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMuaXNMYXZhVGlsZSh0LmYpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNMYXZhVGlsZSA9IGZ1bmN0aW9uKHRpbGVJZCl7XHJcblx0cmV0dXJuIHRpbGVJZCA9PSAxMDM7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuY2hhbmdlV2FsbFRleHR1cmUgPSBmdW5jdGlvbih4LCB6LCB0ZXh0dXJlSWQpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGVsc2UgaWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIGJhc2UgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIWJhc2UuY2xvbmVkKXtcclxuXHRcdHZhciBuZXdXID0ge307XHJcblx0XHRmb3IgKHZhciBpIGluIGJhc2Upe1xyXG5cdFx0XHRuZXdXW2ldID0gYmFzZVtpXTtcclxuXHRcdH1cclxuXHRcdG5ld1cuY2xvbmVkID0gdHJ1ZTtcclxuXHRcdHRoaXMubWFwW3pdW3hdID0gbmV3VztcclxuXHRcdGJhc2UgPSBuZXdXO1xyXG5cdH1cclxuXHRcclxuXHRiYXNlLncgPSB0ZXh0dXJlSWQ7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yQXQgPSBmdW5jdGlvbih4LCB5LCB6KXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgZG9vciA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRpZiAoZG9vci53YWxsUG9zaXRpb24uZXF1YWxzKHgsIHksIHopKSByZXR1cm4gZG9vcjtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0ID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uZXF1YWxzKHBvc2l0aW9uKSl7XHJcblx0XHRcdHJldHVybiB0aGlzLmluc3RhbmNlc1tpXTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZUF0R3JpZCA9IGZ1bmN0aW9uKHBvc2l0aW9uKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6ID0gTWF0aC5mbG9vcih0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPT0gcG9zaXRpb24uYSAmJiB6ID09IHBvc2l0aW9uLmMpe1xyXG5cdFx0XHRyZXR1cm4gKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXROZWFyZXN0Q2xlYW5JdGVtVGlsZSA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRcclxuXHR2YXIgbWluWCA9IHggLSAxO1xyXG5cdHZhciBtaW5aID0geiAtIDE7XHJcblx0dmFyIG1heFggPSB4ICsgMTtcclxuXHR2YXIgbWF4WiA9IHogKyAxO1xyXG5cdFxyXG5cdGZvciAodmFyIHp6PW1pblo7eno8PW1heFo7enorKyl7XHJcblx0XHRmb3IgKHZhciB4eD1taW5YO3h4PD1tYXhYO3h4Kyspe1xyXG5cdFx0XHRpZiAodGhpcy5pc1NvbGlkKHh4LCB6eiwgMCkgfHwgdGhpcy5pc1dhdGVyUG9zaXRpb24oeHgsIHp6KSl7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwb3MgPSB2ZWMzKHh4LCAwLCB6eik7XHJcblx0XHRcdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHBvcyk7XHJcblx0XHRcdGlmICghaW5zIHx8ICghaW5zLml0ZW0gJiYgIWlucy5zdGFpcnMpKXtcclxuXHRcdFx0XHRyZXR1cm4gcG9zO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzTmVhcmVzdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBkaXN0YW5jZSwgaGFzUHJvcGVydHkpe1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKHRoaXMuaW5zdGFuY2VzW2ldLmRlc3Ryb3llZCkgY29udGludWU7XHJcblx0XHRpZiAoaGFzUHJvcGVydHkgJiYgIXRoaXMuaW5zdGFuY2VzW2ldW2hhc1Byb3BlcnR5XSkgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gTWF0aC5hYnModGhpcy5pbnN0YW5jZXNbaV0ucG9zaXRpb24uYSAtIHBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5jIC0gcG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4IDw9IGRpc3RhbmNlICYmIHogPD0gZGlzdGFuY2Upe1xyXG5cdFx0XHRyZXQucHVzaCh0aGlzLmluc3RhbmNlc1tpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgc2VsZil7XHJcblx0dmFyIHAgPSBwb3MuY2xvbmUoKTtcclxuXHRwLmEgPSBwLmEgKyBzcGQuYTtcclxuXHRwLmMgPSBwLmMgKyBzcGQuYjtcclxuXHRcclxuXHR2YXIgaW5zdCA9IG51bGwsIGhvcjtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMgfHwgaW5zLmRlc3Ryb3llZCB8fCAhaW5zLnNvbGlkKSBjb250aW51ZTtcclxuXHRcdGlmIChpbnMgPT09IHNlbGYpIGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYSAtIHAuYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHAuYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA8PSAwLjggJiYgenogPD0gMC44KXtcclxuXHRcdFx0aWYgKHBvcy5hIDw9IGlucy5wb3NpdGlvbi5hIC0gMC44IHx8IHBvcy5hID49IGlucy5wb3NpdGlvbi5hICsgMC44KSBob3IgPSB0cnVlO1xyXG5cdFx0XHRlbHNlIGlmIChwb3MuYyA8PSBpbnMucG9zaXRpb24uYyAtIDAuOCB8fCBwb3MuYyA+PSBpbnMucG9zaXRpb24uYyArIDAuOCkgaG9yID0gZmFsc2U7ICBcclxuXHRcdFx0aW5zdCA9IGlucztcclxuXHRcdFx0aSA9IGxlbjtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0XHJcblx0aWYgKCFpbnN0KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoaW5zdC5oZWlnaHQpe1xyXG5cdFx0aWYgKHBvcy5iICsgaCA8IGluc3QucG9zaXRpb24uYikgcmV0dXJuIG51bGw7XHJcblx0XHRpZiAocG9zLmIgPj0gaW5zdC5wb3NpdGlvbi5iICsgaW5zdC5oZWlnaHQpIHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoaG9yKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnJpZ2h0O1xyXG5cdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS53YWxsSGFzTm9ybWFsID0gZnVuY3Rpb24oeCwgeSwgbm9ybWFsKXtcclxuXHR2YXIgdDEgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRzd2l0Y2ggKG5vcm1hbCl7XHJcblx0XHRjYXNlICd1JzogeSAtPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ2wnOiB4IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnZCc6IHkgKz0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdyJzogeCArPSAxOyBicmVhaztcclxuXHR9XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt5XSkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0aGlzLm1hcFt5XVt4XSA9PT0gMCkgcmV0dXJuIHRydWU7XHJcblx0dmFyIHQyID0gdGhpcy5tYXBbeV1beF07XHJcblx0XHJcblx0aWYgKCF0Mi53KSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodDIudyAmJiAhKHQyLnkgPT0gdDEueSAmJiB0Mi5oID09IHQxLmgpKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXREb29yTm9ybWFsID0gZnVuY3Rpb24ocG9zLCBzcGQsIGgsIGluV2F0ZXIpe1xyXG5cdHZhciB4eCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHp6ID0gKChwb3MuYyArIHNwZC5iKSA8PCAwKTtcclxuXHR2YXIgeSA9IHBvcy5iO1xyXG5cdFxyXG5cdHZhciBkb29yID0gdGhpcy5nZXREb29yQXQoeHgsIHksIHp6KTtcclxuXHRpZiAoZG9vcil7XHJcblx0XHR2YXIgeHh4ID0gKHBvcy5hICsgc3BkLmEpIC0geHg7XHJcblx0XHR2YXIgenp6ID0gKHBvcy5jICsgc3BkLmIpIC0geno7XHJcblx0XHRcclxuXHRcdHZhciB4ID0gKHBvcy5hIC0geHgpO1xyXG5cdFx0dmFyIHogPSAocG9zLmMgLSB6eik7XHJcblx0XHRpZiAoZG9vci5kaXIgPT0gXCJWXCIpe1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0O1xyXG5cdFx0XHRpZiAoenp6ID4gMC4yNSAmJiB6enogPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHggPCAwIHx8IHggPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGVsc2UgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZiAoZG9vciAmJiBkb29yLmlzU29saWQoKSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0aWYgKHh4eCA+IDAuMjUgJiYgeHh4IDwgMC43NSkgcmV0dXJuIG51bGw7XHJcblx0XHRcdGlmICh6IDwgMCB8fCB6ID4gMSkgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNTb2xpZCA9IGZ1bmN0aW9uKHgsIHosIHkpe1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQudyAmJiAhdC5kdyAmJiAhdC53ZCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdGlmICh5ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0aWYgKHQueSArIHQuaCA8PSB5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgdCwgdGg7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt6el0pIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRpID0gNDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHRoID0gdC5oIC0gMC4zO1xyXG5cdGlmIChpbldhdGVyKSB5ICs9IDAuMztcclxuXHRpZiAodC5zbCkgdGggKz0gMC4yO1xyXG5cdFxyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC55K3RoIDw9IHkpIHJldHVybiBudWxsO1xyXG5cdGVsc2UgaWYgKHQueSA+IHkgKyBoKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0Lncpe1xyXG5cdFx0dmFyIHRleCA9IHRoaXMuZ2FtZS5nZXRUZXh0dXJlQnlJZCh0LncsIFwid2FsbFwiKTtcclxuXHRcdGlmICh0ZXguaXNTb2xpZCl7XHJcblx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgJiYgenp6IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpICYmIHp6eiA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpICYmIHh4eCA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0OyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpICYmIHh4eCA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDsgfVxyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICh0LmR3KXtcclxuXHRcdHZhciB4LCB6LCB4eHgsIHp6eiwgbm9ybWFsO1xyXG5cdFx0eCA9IHBvcy5hICsgc3BkLmE7XHJcblx0XHR6ID0gcG9zLmMgKyBzcGQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKHQuYXcgPT0gMCl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwTGVmdDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAxKXsgeHh4ID0geCAtIHh4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBSaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAyKXsgeHh4ID0geCAtIHh4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93blJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDMpeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duTGVmdDsgfVxyXG5cdFx0aWYgKHp6eiA+PSB4eHgpe1xyXG5cdFx0XHRyZXR1cm4gbm9ybWFsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFlGbG9vciA9IGZ1bmN0aW9uKHgsIHksIG5vV2F0ZXIpe1xyXG5cdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeDw8MCwwLHk8PDApKTtcclxuXHRpZiAoaW5zICE9IG51bGwgJiYgaW5zLmhlaWdodCl7XHJcblx0XHRyZXR1cm4gaW5zLnBvc2l0aW9uLmIgKyBpbnMuaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgeHggPSB4IC0gKHggPDwgMCk7XHJcblx0dmFyIHl5ID0geSAtICh5IDw8IDApO1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eSA9IHkgPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbeV1beF07XHJcblx0dmFyIHR0ID0gdC55O1xyXG5cdFxyXG5cdGlmICh0LncpIHR0ICs9IHQuaDtcclxuXHRpZiAodC5mKSB0dCA9IHQuZnk7XHJcblx0XHJcblx0aWYgKCFub1dhdGVyICYmIHRoaXMuaXNXYXRlclRpbGUodC5mKSkgdHQgLT0gMC4zO1xyXG5cdFxyXG5cdGlmICh0LnNsKXtcclxuXHRcdGlmICh0LmRpciA9PSAwKSB0dCArPSB5eSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDEpIHR0ICs9IHh4ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMikgdHQgKz0gKDEuMCAtIHl5KSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDMpIHR0ICs9ICgxLjAgLSB4eCkgKiAwLjU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0dDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmRyYXdNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciB4LCB5O1xyXG5cdHggPSB0aGlzLnBsYXllci5wb3NpdGlvbi5hO1xyXG5cdHkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi5jO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tYXBUb0RyYXcubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXRkID0gdGhpcy5tYXBUb0RyYXdbaV07XHJcblx0XHRcclxuXHRcdGlmICh4IDwgbXRkLmJvdW5kYXJpZXNbMF0gfHwgeCA+IG10ZC5ib3VuZGFyaWVzWzJdIHx8IHkgPCBtdGQuYm91bmRhcmllc1sxXSB8fCB5ID4gbXRkLmJvdW5kYXJpZXNbM10pXHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobXRkLnR5cGUgPT0gXCJCXCIpeyAvLyBCbG9ja3NcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdCbG9jayhtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiRlwiKXsgLy8gRmxvb3JzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdGlmICh0aGlzLmlzV2F0ZXJUaWxlKHR0KSl7IFxyXG5cdFx0XHRcdHR0ID0gKG10ZC5yVGV4SW5kKSArICh0aGlzLndhdGVyRnJhbWUgPDwgMCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnd2F0ZXInKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnZmxvb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiQ1wiKXsgLy8gQ2VpbHNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnY2VpbCcpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiU1wiKXsgLy8gU2xvcGVcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdTbG9wZShtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoaW52W2ldLmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRyZXR1cm4gaW52W2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSwgYW1vdW50KXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IGludltpXTtcclxuXHRcdGlmIChpdC5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0aWYgKC0taXQuYW1vdW50ID09IDApe1xyXG5cdFx0XHRcdGludi5zcGxpY2UoaSwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmFkZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHR0aGlzLmdhbWUuY29uc29sZS5hZGRTRk1lc3NhZ2UodGV4dCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLnRpbWVTdG9wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy53YXRlckZyYW1lICs9IDAuMTtcclxuXHRpZiAodGhpcy53YXRlckZyYW1lID49IDIpIHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNUb0RyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdGktLTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciBkaXN0ID0geHggKiB4eCArIHp6ICogeno7XHJcblx0XHR2YXIgYWRkZWQgPSBmYWxzZTtcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRpZiAoZGlzdCA+IHRoaXMub3JkZXJJbnN0YW5jZXNbal0uZGlzdCl7XHJcblx0XHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaiwwLHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdFx0XHRhZGRlZCA9IHRydWU7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCFhZGRlZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMucHVzaCh7X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdPcmRlckluc3RhbmNlJyksIGluczogaW5zLCBkaXN0OiBkaXN0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzQXQgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aWYgKE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmEpID09IHggJiYgTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYykgPT0geilcclxuXHRcdFx0cmV0LnB1c2goaW5zKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcCA9PSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3TWFwKCk7XHJcblx0XHJcblx0dGhpcy5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5vcmRlckluc3RhbmNlc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aW5zID0gaW5zLmlucztcclxuXHRcdFxyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcihpbnMucG9zaXRpb24uYSwgaW5zLnBvc2l0aW9uLmIsIGlucy5wb3NpdGlvbi5jLCBpbnMucm90YXRpb24sIGlucy50ZXh0dXJlQ29kZSk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3JXYWxsKGlucy5kb29yUG9zaXRpb24uYSwgaW5zLmRvb3JQb3NpdGlvbi5iLCBpbnMuZG9vclBvc2l0aW9uLmMsIGlucy53YWxsVGV4dHVyZSwgKGlucy5kaXIgPT0gXCJWXCIpKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIubG9vcCgpO1xyXG5cdGlmICh0aGlzLnBvaXNvbkNvdW50ID4gMCl7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50IC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZ2FtZS5wbGF5ZXIucG9pc29uZWQgJiYgdGhpcy5wb2lzb25Db3VudCA9PSAwKXtcclxuXHRcdHRoaXMucGxheWVyLnJlY2VpdmVEYW1hZ2UoMTApO1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCA9IDEwMDtcclxuXHR9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1ha2VQZXJzcGVjdGl2ZTogZnVuY3Rpb24oZm92LCBhc3BlY3RSYXRpbywgek5lYXIsIHpGYXIpe1xyXG5cdFx0dmFyIHpMaW1pdCA9IHpOZWFyICogTWF0aC50YW4oZm92ICogTWF0aC5QSSAvIDM2MCk7XHJcblx0XHR2YXIgQSA9IC0oekZhciArIHpOZWFyKSAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEIgPSAtMiAqIHpGYXIgKiB6TmVhciAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEMgPSAoMiAqIHpOZWFyKSAvICh6TGltaXQgKiBhc3BlY3RSYXRpbyAqIDIpO1xyXG5cdFx0dmFyIEQgPSAoMiAqIHpOZWFyKSAvICgyICogekxpbWl0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0QywgMCwgMCwgMCxcclxuXHRcdFx0MCwgRCwgMCwgMCxcclxuXHRcdFx0MCwgMCwgQSwtMSxcclxuXHRcdFx0MCwgMCwgQiwgMFxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG5ld01hdHJpeDogZnVuY3Rpb24oY29scywgcm93cyl7XHJcblx0XHR2YXIgcmV0ID0gbmV3IEFycmF5KHJvd3MpO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8cm93cztpKyspe1xyXG5cdFx0XHRyZXRbaV0gPSBuZXcgQXJyYXkoY29scyk7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPGNvbHM7aisrKXtcclxuXHRcdFx0XHRyZXRbaV1bal0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRJZGVudGl0eTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtYWtlVHJhbnNmb3JtOiBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSl7XHJcblx0XHQvLyBTdGFydHMgd2l0aCB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0XHR2YXIgdE1hdCA9IHRoaXMuZ2V0SWRlbnRpdHkoKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3RcclxuXHRcdC8vIFVudGlsIEkgZmluZCB0aGUgbmVlZCB0byByb3RhdGUgYW4gb2JqZWN0IGl0c2VsZiBpdCByZWFtaW5zIGFzIGNvbW1lbnRcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgob2JqZWN0LnJvdGF0aW9uLmEpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKG9iamVjdC5yb3RhdGlvbi5iKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKG9iamVjdC5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIElmIHRoZSBvYmplY3QgaXMgYSBiaWxsYm9hcmQsIHRoZW4gbWFrZSBpdCBsb29rIHRvIHRoZSBjYW1lcmFcclxuXHRcdGlmIChvYmplY3QuaXNCaWxsYm9hcmQgJiYgIW9iamVjdC5ub1JvdGF0ZSkgdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoLShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IHRvIGl0cyBwb3NpdGlvblxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbihvYmplY3QucG9zaXRpb24uYSwgb2JqZWN0LnBvc2l0aW9uLmIsIG9iamVjdC5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCBpbiByZWxhdGlvbiB0byB0aGUgY2FtZXJhXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKC1jYW1lcmEucG9zaXRpb24uYSwgLWNhbWVyYS5wb3NpdGlvbi5iIC0gY2FtZXJhLmNhbWVyYUhlaWdodCwgLWNhbWVyYS5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0IGluIHRoZSBjYW1lcmEgZGlyZWN0aW9uIChJIGRvbid0IHJlYWxseSByb3RhdGUgaW4gdGhlIFogYXhpcylcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWCgtY2FtZXJhLnJvdGF0aW9uLmEpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblooLWNhbWVyYS5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0TWF0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0VHJhbnNsYXRpb246IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0eCwgeSwgeiwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWDogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgQywgUywgMCxcclxuXHRcdFx0MCwtUywgQywgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWTogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIDAsIFMsIDAsXHJcblx0XHRcdCAwLCAxLCAwLCAwLFxyXG5cdFx0XHQtUywgMCwgQywgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblo6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCBTLCAwLCAwLFxyXG5cdFx0XHQtUywgQywgMCwgMCxcclxuXHRcdFx0IDAsIDAsIDEsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWluaU1hdHJpeE11bHQ6IGZ1bmN0aW9uKHJvdywgY29sdW1uKXtcclxuXHRcdHZhciByZXN1bHQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1yb3cubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHJlc3VsdCArPSByb3dbaV0gKiBjb2x1bW5baV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSxcclxuXHRcclxuXHRtYXRyaXhNdWx0aXBsaWNhdGlvbjogZnVuY3Rpb24obWF0cml4QSwgbWF0cml4Qil7XHJcblx0XHR2YXIgQTEgPSBbbWF0cml4QVswXSwgIG1hdHJpeEFbMV0sICBtYXRyaXhBWzJdLCAgbWF0cml4QVszXV07XHJcblx0XHR2YXIgQTIgPSBbbWF0cml4QVs0XSwgIG1hdHJpeEFbNV0sICBtYXRyaXhBWzZdLCAgbWF0cml4QVs3XV07XHJcblx0XHR2YXIgQTMgPSBbbWF0cml4QVs4XSwgIG1hdHJpeEFbOV0sICBtYXRyaXhBWzEwXSwgbWF0cml4QVsxMV1dO1xyXG5cdFx0dmFyIEE0ID0gW21hdHJpeEFbMTJdLCBtYXRyaXhBWzEzXSwgbWF0cml4QVsxNF0sIG1hdHJpeEFbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIEIxID0gW21hdHJpeEJbMF0sIG1hdHJpeEJbNF0sIG1hdHJpeEJbOF0sICBtYXRyaXhCWzEyXV07XHJcblx0XHR2YXIgQjIgPSBbbWF0cml4QlsxXSwgbWF0cml4Qls1XSwgbWF0cml4Qls5XSwgIG1hdHJpeEJbMTNdXTtcclxuXHRcdHZhciBCMyA9IFttYXRyaXhCWzJdLCBtYXRyaXhCWzZdLCBtYXRyaXhCWzEwXSwgbWF0cml4QlsxNF1dO1xyXG5cdFx0dmFyIEI0ID0gW21hdHJpeEJbM10sIG1hdHJpeEJbN10sIG1hdHJpeEJbMTFdLCBtYXRyaXhCWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBtbW0gPSB0aGlzLm1pbmlNYXRyaXhNdWx0O1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0bW1tKEExLCBCMSksIG1tbShBMSwgQjIpLCBtbW0oQTEsIEIzKSwgbW1tKEExLCBCNCksXHJcblx0XHRcdG1tbShBMiwgQjEpLCBtbW0oQTIsIEIyKSwgbW1tKEEyLCBCMyksIG1tbShBMiwgQjQpLFxyXG5cdFx0XHRtbW0oQTMsIEIxKSwgbW1tKEEzLCBCMiksIG1tbShBMywgQjMpLCBtbW0oQTMsIEI0KSxcclxuXHRcdFx0bW1tKEE0LCBCMSksIG1tbShBNCwgQjIpLCBtbW0oQTQsIEIzKSwgbW1tKEE0LCBCNClcclxuXHRcdF07XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBNaXNzaWxlKHBvc2l0aW9uLCByb3RhdGlvbiwgdHlwZSwgdGFyZ2V0LCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMudHlwZSA9IHR5cGU7XHJcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0dGhpcy5zdHIgPSAwO1xyXG5cdHRoaXMuc3BlZWQgPSAwLjM7XHJcblx0dGhpcy5taXNzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnZzcGVlZCA9IDA7XHJcblx0dGhpcy5ncmF2aXR5ID0gMDtcclxuXHRcclxuXHR2YXIgc3ViSW1nID0gMDtcclxuXHRzd2l0Y2ggKHR5cGUpe1xyXG5cdFx0Y2FzZSAnc2xpbmcnOiBcclxuXHRcdFx0c3ViSW1nID0gMDtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRcdHRoaXMuZ3Jhdml0eSA9IDAuMDA1O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdib3cnOiBcclxuXHRcdFx0c3ViSW1nID0gMTtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Nyb3NzYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDI7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdtYWdpY01pc3NpbGUnOiBcclxuXHRcdFx0c3ViSW1nID0gMzsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ljZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA0OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnZmlyZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA1OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHN1YkltZyA9IDY7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC41O1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSAnYm9sdHMnO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tzdWJJbWddO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3NpbGU7XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5jaGVja0NvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1hcCA9IHRoaXMubWFwTWFuYWdlci5tYXA7XHJcblx0aWYgKHRoaXMucG9zaXRpb24uYSA8IDAgfHwgdGhpcy5wb3NpdGlvbi5jIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmEgPj0gbWFwWzBdLmxlbmd0aCB8fCB0aGlzLnBvc2l0aW9uLmMgPj0gbWFwLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciB4ID0gdGhpcy5wb3NpdGlvbi5hIDw8IDA7XHJcblx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgKyAwLjU7XHJcblx0dmFyIHogPSB0aGlzLnBvc2l0aW9uLmMgPDwgMDtcclxuXHR2YXIgdGlsZSA9IG1hcFt6XVt4XTtcclxuXHRcclxuXHRpZiAodGlsZS53IHx8IHRpbGUud2QgfHwgdGlsZS53ZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh5IDwgdGlsZS5meSB8fCB5ID4gdGlsZS5jaCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciBpbnMsIGRmcztcclxuXHRpZiAodGhpcy50YXJnZXQgPT0gJ2VuZW15Jyl7XHJcblx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlc05lYXJlc3QodGhpcy5wb3NpdGlvbiwgMC41LCAnZW5lbXknKTtcclxuXHRcdHZhciBkaXN0ID0gMTAwMDA7XHJcblx0XHRpZiAoaW5zdGFuY2VzLmxlbmd0aCA+IDEpe1xyXG5cdFx0XHRmb3IgKHZhciBpPTAsbGVuPWluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHR2YXIgeHggPSBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLmEgLSBpbnN0YW5jZXNbaV0ucG9zaXRpb24uYSk7XHJcblx0XHRcdFx0dmFyIHl5ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5jIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBkID0geHggKiB4eCArIHl5ICogeXk7XHJcblx0XHRcdFx0aWYgKGQgPCBkaXN0KXtcclxuXHRcdFx0XHRcdGRpc3QgPSBkO1xyXG5cdFx0XHRcdFx0aW5zID0gaW5zdGFuY2VzW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGluc3RhbmNlcy5sZW5ndGggPT0gMSl7XHJcblx0XHRcdGlucyA9IGluc3RhbmNlc1swXTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZGZzID0gVXRpbHMucm9sbERpY2UoaW5zLmVuZW15LnN0YXRzLmRmcyk7XHJcblx0fWVsc2V7XHJcblx0XHRpbnMgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0ZGZzID0gVXRpbHMucm9sbERpY2UodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheWVyLnN0YXRzLmRmcyk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heCh0aGlzLnN0ciAtIGRmcywgMCk7XHJcblx0XHJcblx0aWYgKHRoaXMubWlzc2VkKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZG1nICE9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoZG1nICsgXCIgcG9pbnRzIGluZmxpY3RlZFwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHRpbnMucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnZzcGVlZCArPSB0aGlzLmdyYXZpdHk7XHJcblx0XHJcblx0dmFyIHhUbyA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdHZhciB5VG8gPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmEpICogdGhpcy5zcGVlZCAtIHRoaXMudnNwZWVkO1xyXG5cdHZhciB6VG8gPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMuc3BlZWQ7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbi5zdW0odmVjMyh4VG8sIHlUbywgelRvKSk7XHJcblx0XHJcblx0aWYgKCF0aGlzLmNoZWNrQ29sbGlzaW9uKCkpe1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1dlYkdMT2JqZWN0JywgJ3ZlcnRleEJ1ZmZlcicpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1dlYkdMT2JqZWN0JywgJ3RleEJ1ZmZlcicpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1dlYkdMT2JqZWN0JywgJ2luZGljZXNCdWZmZXInKTtcclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdXZWJHTE9iamVjdCcsICdkYXJrQnVmZmVyJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRub3JtYWxzOiB7XHJcblx0XHRkb3duOiAgdmVjMiggMCwgMSksXHJcblx0XHRyaWdodDogdmVjMiggMSwgMCksXHJcblx0XHR1cDogICAgdmVjMiggMCwtMSksXHJcblx0XHRsZWZ0OiAgdmVjMigtMSwgMCksXHJcblx0XHRcclxuXHRcdHVwUmlnaHQ6ICB2ZWMyKE1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgLU1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHR1cExlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93blJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHRkb3duTGVmdDogIHZlYzIoLU1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKVxyXG5cdH0sXHJcblx0XHJcblx0Y3ViZTogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgbGlnaHQsIC8qW3UsbCxkLHJdKi8gZmFjZXMpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtdO1xyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0aWYgKCFmYWNlcykgZmFjZXMgPSBbMSwxLDEsMV07XHJcblx0XHRpZiAoZmFjZXNbMF0peyAvLyBVcCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCBcdCB3LCAgMCwgLWwsXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDEsMSwxLDEpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzFdKXsgLy8gTGVmdCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHRcdCB3LCAgMCwgLWwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbMl0peyAvLyBEb3duIEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1szXSl7IC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwLDAsMCwwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdFxyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0XHQwLjAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0Zmxvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGNlaWw6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDIsIDEsIDEsIDIsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3JXYWxsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgKiAwLjA1O1xyXG5cdFx0XHJcblx0XHR2YXIgdzIgPSAtc2l6ZS5hICogMC4yNTtcclxuXHRcdHZhciB3MyA9IHNpemUuYSAqIDAuMjU7XHJcblx0XHRcclxuXHRcdHZhciBoMiA9IDEgLSBzaXplLmIgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIFJpZ2h0IHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdC13LCAgMCwgIGwsXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTGVmdCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgIDAsIC1sLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTWlkZGxlIHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgaDIsIC1sLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgaDIsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gQm90dG9tIEZhY2VcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAgbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDY7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4yNSwgdHksXHJcblx0XHRcdFx0MC4yNSwwLjAsXHJcblx0XHRcdFx0MC4wMCwgdHksXHJcblx0XHRcdFx0MC4wMCwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC41LDEuMCxcclxuXHRcdFx0XHQwLjUsMC43NSxcclxuXHRcdFx0XHQwLjAsMS4wLFxyXG5cdFx0XHRcdDAuMCwwLjc1XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDM2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0KXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdCAwLCAgaCwgIGwsXHJcblx0XHRcdCAwLCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2godHgsIHR5LCB0eCwwLjAsIDAuMCwgdHksIDAuMCwwLjApO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goMC4wLCB0eSwgMC4wLDAuMCwgdHgsIHR5LCB0eCwwLjApO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjAxLDAuMDEsXHJcblx0XHRcdFx0MC4wMSwwLjAsXHJcblx0XHRcdFx0MC4wICwwLjAxLFxyXG5cdFx0XHRcdDAuMCAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDE2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRyZXR1cm4gZG9vcjtcclxuXHR9LFxyXG5cdFxyXG5cdGJpbGxib2FyZDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgIGgsICAwLFxyXG5cdFx0XHQtdywgIGgsICAwLFxyXG5cdFx0XHQgdywgIDAsICAwLFxyXG5cdFx0XHQtdywgIDAsICAwLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj00O2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdF07XHJcblx0XHRcdFx0IFxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJpbGwgPSAgdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRiaWxsLmlzQmlsbGJvYXJkID0gdHJ1ZTtcclxuXHRcdHJldHVybiBiaWxsO1xyXG5cdH0sXHJcblx0XHJcblx0c2xvcGU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGRpcil7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IC8vIEZyb250IFNsb3BlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdCAvLyBSaWdodCBTaWRlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgLWwsXHJcblx0XHRcdCBcclxuXHRcdFx0IC8vIExlZnQgU2lkZVxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjAsICBsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpZiAoZGlyICE9IDApe1xyXG5cdFx0XHR2YXIgYW5nID0gTWF0aC5kZWdUb1JhZChkaXIgKiAtOTApO1xyXG5cdFx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8dmVydGV4Lmxlbmd0aDtpKz0zKXtcclxuXHRcdFx0XHR2YXIgYSA9IHZlcnRleFtpXSAqIEMgLSB2ZXJ0ZXhbaSsyXSAqIFM7XHJcblx0XHRcdFx0dmFyIGIgPSB2ZXJ0ZXhbaV0gKiBTICsgdmVydGV4W2krMl0gKiBDO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZlcnRleFtpXSA9IGE7XHJcblx0XHRcdFx0dmVydGV4W2krMl0gPSBiO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMsIDQsIDUsIDYsIDcsIDgsIDkpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgMC4wLFxyXG5cdFx0XHQwLjAsICB0eSxcclxuXHRcdFx0XHJcblx0XHRcdCB0eCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDAsMCwwLDAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGFzc2VtYmxlT2JqZWN0OiBmdW5jdGlvbihtYXBEYXRhLCBvYmplY3RUeXBlLCBnbCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVjdCA9IFs2NCw2NCwwLDBdOyAvLyBbeDEseTEseDIseTJdXHJcblx0XHRmb3IgKHZhciB5PTAseWxlbj1tYXBEYXRhLmxlbmd0aDt5PHlsZW47eSsrKXtcclxuXHRcdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YVt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdFx0dmFyIHQgPSAobWFwRGF0YVt5XVt4XS50aWxlKT8gbWFwRGF0YVt5XVt4XS50aWxlIDogMDtcclxuXHRcdFx0XHRpZiAodCAhPSAwKXtcclxuXHRcdFx0XHRcdC8vIFNlbGVjdGluZyBib3VuZGFyaWVzIG9mIHRoZSBtYXAgcGFydFxyXG5cdFx0XHRcdFx0cmVjdFswXSA9IE1hdGgubWluKHJlY3RbMF0sIHggLSA2KTtcclxuXHRcdFx0XHRcdHJlY3RbMV0gPSBNYXRoLm1pbihyZWN0WzFdLCB5IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzJdID0gTWF0aC5tYXgocmVjdFsyXSwgeCArIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFszXSA9IE1hdGgubWF4KHJlY3RbM10sIHkgKyA2KTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZ2O1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJGXCIpeyB2diA9IHRoaXMuZmxvb3IodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gRmxvb3JcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQ1wiKXsgdnYgPSB0aGlzLmNlaWwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gQ2VpbFxyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJCXCIpeyB2diA9IHRoaXMuY3ViZSh2ZWMzKDEuMCxtYXBEYXRhW3ldW3hdLmgsMS4wKSwgdmVjMigxLjAsbWFwRGF0YVt5XVt4XS5oKSwgZ2wsIGZhbHNlLCB0aGlzLmdldEN1YmVGYWNlcyhtYXBEYXRhLCB4LCB5KSk7IH1lbHNlIC8vIEJsb2NrXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIlNcIil7IHZ2ID0gdGhpcy5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wsIG1hcERhdGFbeV1beF0uZGlyKTsgfSAvLyBTbG9wZVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgdmVydGV4T2ZmID0gdmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRcdFx0XHR4eCA9IHZ2LnZlcnRpY2VzW2ldICsgeCArIDAuNTtcclxuXHRcdFx0XHRcdFx0eXkgPSB2di52ZXJ0aWNlc1tpKzFdICsgbWFwRGF0YVt5XVt4XS55O1xyXG5cdFx0XHRcdFx0XHR6eiA9IHZ2LnZlcnRpY2VzW2krMl0gKyB5ICsgMC41O1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGljZXMucHVzaCh4eCwgeXksIHp6KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di5pbmRpY2VzLmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZ2LmluZGljZXNbaV0gKyB2ZXJ0ZXhPZmYpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnRleENvb3Jkcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdHRleENvb3Jkcy5wdXNoKHZ2LnRleENvb3Jkc1tpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuZGFya1ZlcnRleC5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCh2di5kYXJrVmVydGV4W2ldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmVjcmVhdGUgYnVmZmVyIGRhdGEgb24gZGVzZXJpYWxpemF0aW9uXHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YnVmZmVyLmJvdW5kYXJpZXMgPSByZWN0O1xyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdFxyXG5cdGdldEN1YmVGYWNlczogZnVuY3Rpb24obWFwLCB4LCB5KXtcclxuXHRcdHZhciByZXQgPSBbMSwxLDEsMV07XHJcblx0XHR2YXIgdGlsZSA9IG1hcFt5XVt4XTtcclxuXHRcdFxyXG5cdFx0Ly8gVXAgRmFjZVxyXG5cdFx0aWYgKHkgPiAwICYmIG1hcFt5LTFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5LTFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzBdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gTGVmdCBmYWNlXHJcblx0XHRpZiAoeCA8IDYzICYmIG1hcFt5XVt4KzFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4KzFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzFdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gRG93biBmYWNlXHJcblx0XHRpZiAoeSA8IDYzICYmIG1hcFt5KzFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5KzFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzJdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gUmlnaHQgZmFjZVxyXG5cdFx0aWYgKHggPiAwICYmIG1hcFt5XVt4LTFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4LTFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzNdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0T2JqZWN0V2l0aFByb3BlcnRpZXM6IGZ1bmN0aW9uKHZlcnRleEJ1ZmZlciwgaW5kZXhCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcil7XHJcblx0XHR2YXIgb2JqID0ge1xyXG5cdFx0XHRfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ1dlYkdMT2JqZWN0JyksXHJcblx0XHRcdHJvdGF0aW9uOiB2ZWMzKDAsIDAsIDApLFxyXG5cdFx0XHRwb3NpdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0dmVydGV4QnVmZmVyOiB2ZXJ0ZXhCdWZmZXIsIFxyXG5cdFx0XHRpbmRpY2VzQnVmZmVyOiBpbmRleEJ1ZmZlciwgXHJcblx0XHRcdHRleEJ1ZmZlcjogdGV4QnVmZmVyLFxyXG5cdFx0XHRkYXJrQnVmZmVyOiBkYXJrQnVmZmVyXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH0sXHJcblx0XHJcblx0Y3JlYXRlM0RPYmplY3Q6IGZ1bmN0aW9uKGdsLCBiYXNlT2JqZWN0KXtcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoYmFzZU9iamVjdC52ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudmVydGljZXMubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC50ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoYmFzZU9iamVjdC5pbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QuaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGJhc2VPYmplY3QuZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBidWZmZXIgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdHRyYW5zbGF0ZU9iamVjdDogZnVuY3Rpb24ob2JqZWN0LCB0cmFuc2xhdGlvbil7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPW9iamVjdC52ZXJ0aWNlcy5sZW5ndGg7aTxsZW47aSs9Myl7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpXSArPSB0cmFuc2xhdGlvbi5hO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsxXSArPSB0cmFuc2xhdGlvbi5iO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsyXSArPSB0cmFuc2xhdGlvbi5jO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqZWN0O1xyXG5cdH0sXHJcblx0XHJcblx0ZnV6ZU9iamVjdHM6IGZ1bmN0aW9uKG9iamVjdExpc3Qpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIGluZGV4Q291bnQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3RMaXN0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHR2YXIgb2JqID0gb2JqZWN0TGlzdFtpXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai52ZXJ0aWNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dmVydGljZXMucHVzaChvYmoudmVydGljZXNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudGV4Q29vcmRzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHR0ZXhDb29yZHMucHVzaChvYmoudGV4Q29vcmRzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmluZGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGluZGljZXMucHVzaChvYmouaW5kaWNlc1tqXSArIGluZGV4Q291bnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmouZGFya1ZlcnRleC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKG9iai5kYXJrVmVydGV4W2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aW5kZXhDb3VudCArPSBvYmoudmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGljZXMsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGxvYWQzRE1vZGVsOiBmdW5jdGlvbihtb2RlbEZpbGUsIGdsKXtcclxuXHRcdHZhciBtb2RlbCA9IHtyZWFkeTogZmFsc2V9O1xyXG5cdFx0XHJcblx0XHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRcdGh0dHAub3BlbihcIkdFVFwiLCBjcCArIFwibW9kZWxzL1wiICsgbW9kZWxGaWxlICsgXCIub2JqP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHRcdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGh0dHAucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG5cdFx0XHRcdHZhciBsaW5lcyA9IGh0dHAucmVzcG9uc2VUZXh0LnNwbGl0KFwiXFxuXCIpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB2ZXJ0aWNlcyA9IFtdLCB0ZXhDb29yZHMgPSBbXSwgdHJpYW5nbGVzID0gW10sIHZlcnRleEluZGV4ID0gW10sIHRleEluZGljZXMgPSBbXSwgaW5kaWNlcyA9IFtdLCBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcdFx0dmFyIHdvcmtpbmc7XHJcblx0XHRcdFx0dmFyIHQgPSBmYWxzZTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPWxpbmVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0dmFyIGwgPSBsaW5lc1tpXS50cmltKCk7XHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIlwiKXsgY29udGludWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdmVydGljZXNcIil7IHdvcmtpbmcgPSB2ZXJ0aWNlczsgdCA9IGZhbHNlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRleENvb3Jkc1wiKXsgd29ya2luZyA9IHRleENvb3JkczsgdCA9IHRydWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdHJpYW5nbGVzXCIpeyB3b3JraW5nID0gdHJpYW5nbGVzOyB0ID0gZmFsc2U7IH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhciBwYXJhbXMgPSBsLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49cGFyYW1zLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcmFtc1tqXSkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW1zW2pdID0gcGFyc2VGbG9hdChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXQpIHdvcmtpbmcucHVzaChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmICh0KSB3b3JraW5nLnB1c2gocGFyYW1zKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHVzZWRWZXIgPSBbXTtcclxuXHRcdFx0XHR2YXIgdXNlZEluZCA9IFtdO1xyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dHJpYW5nbGVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0aWYgKHVzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pICE9IC0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHVzZWRJbmRbdXNlZFZlci5pbmRleE9mKHRyaWFuZ2xlc1tpXSldKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR1c2VkVmVyLnB1c2godHJpYW5nbGVzW2ldKTtcclxuXHRcdFx0XHRcdFx0dmFyIHQgPSB0cmlhbmdsZXNbaV0uc3BsaXQoXCIvXCIpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRbMF0gPSBwYXJzZUludCh0WzBdKSAtIDE7XHJcblx0XHRcdFx0XHRcdHRbMV0gPSBwYXJzZUludCh0WzFdKSAtIDE7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdHVzZWRJbmQucHVzaCh2ZXJ0ZXhJbmRleC5sZW5ndGggLyAzKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRleEluZGV4LnB1c2godmVydGljZXNbdFswXSAqIDNdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDFdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDJdKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRleEluZGljZXMucHVzaCh0ZXhDb29yZHNbdFsxXV1bMF0sIHRleENvb3Jkc1t0WzFdXVsxXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dGV4SW5kaWNlcy5sZW5ndGgvMjtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgYmFzZSA9IHt2ZXJ0aWNlczogdmVydGV4SW5kZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4SW5kaWNlcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0XHRcdFx0dmFyIG1vZGVsM0QgPSB0aGlzLmNyZWF0ZTNET2JqZWN0KGdsLCBiYXNlKTtcclxuXHJcblx0XHRcdFx0bW9kZWwucm90YXRpb24gPSBtb2RlbDNELnJvdGF0aW9uO1xyXG5cdFx0XHRcdG1vZGVsLnBvc2l0aW9uID0gbW9kZWwzRC5wb3NpdGlvbjtcclxuXHRcdFx0XHRtb2RlbC52ZXJ0ZXhCdWZmZXIgPSBtb2RlbDNELnZlcnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5pbmRpY2VzQnVmZmVyID0gbW9kZWwzRC5pbmRpY2VzQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnRleEJ1ZmZlciA9IG1vZGVsM0QudGV4QnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLmRhcmtCdWZmZXIgPSBtb2RlbDNELmRhcmtCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0aHR0cC5zZW5kKCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBtb2RlbDtcclxuXHR9XHJcbn07XHJcbiIsInZhciBNaXNzaWxlID0gcmVxdWlyZSgnLi9NaXNzaWxlJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbnZhciBjaGVhdEVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbiwgZGlyZWN0aW9uLCBtYXBNYW5hZ2VyKXtcclxuXHRjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG5cdFxyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignUGxheWVyJyk7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMucm90YXRpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHRcclxuXHR0aGlzLnJvdGF0aW9uU3BkID0gdmVjMihNYXRoLmRlZ1RvUmFkKDEpLCBNYXRoLmRlZ1RvUmFkKDQpKTtcclxuXHR0aGlzLm1vdmVtZW50U3BkID0gMC4wNTtcclxuXHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNTtcclxuXHR0aGlzLm1heFZlcnRSb3RhdGlvbiA9IE1hdGguZGVnVG9SYWQoNDUpO1xyXG5cdFxyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy55U3BlZWQgPSAwLjA7XHJcblx0dGhpcy55R3Jhdml0eSA9IDAuMDtcclxuXHRcclxuXHR0aGlzLmpvZyA9IHZlYzQoMC4wLCAxLCAwLjAsIDEpO1xyXG5cdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHJcblx0dGhpcy5odXJ0ID0gMC4wO1x0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMDtcclxuXHRcclxuXHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuXHJcblBsYXllci5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLnBsYXllcjtcclxuXHRwbGF5ZXIuaHAgLT0gZG1nO1xyXG5cdGlmIChwbGF5ZXIuaHAgPD0gMCl7XHJcblx0XHRwbGF5ZXIuaHAgPSAwO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3UgZGllZCFcIik7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0TWlzc2lsZSA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMuc3RyKTtcclxuXHRpZiAod2VhcG9uKSBzdHIgKz0gVXRpbHMucm9sbERpY2Uod2VhcG9uLnN0cikgKiB3ZWFwb24uc3RhdHVzO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHRoaXMucG9zaXRpb24uY2xvbmUoKSwgdGhpcy5yb3RhdGlvbi5jbG9uZSgpLCB3ZWFwb24uY29kZSwgJ2VuZW15JywgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdG1pc3NpbGUubWlzc2VkID0gKHByb2IgPiBwcy5zdGF0cy5kZXgpO1xyXG5cdC8vIGlmICh3ZWFwb24pIHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTtcclxuXHRcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBzaG9vdCBcIiArIHdlYXBvbi5zdWJJdGVtTmFtZSk7XHJcblx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdHRoaXMubW92ZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tZWxlZUF0dGFjayA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGVuZW1pZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAxLjAsICdlbmVteScpO1xyXG5cdFx0XHJcblx0dmFyIHh4ID0gdGhpcy5wb3NpdGlvbi5hO1xyXG5cdHZhciB6eiA9IHRoaXMucG9zaXRpb24uYztcclxuXHR2YXIgZHggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdHZhciBkeiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR4eCArPSBkeDtcclxuXHRcdHp6ICs9IGR6O1xyXG5cdFx0dmFyIG9iamVjdDtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49ZW5lbWllcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdHZhciBpbnMgPSBlbmVtaWVzW2pdO1xyXG5cdFx0XHR2YXIgeCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0geHgpO1xyXG5cdFx0XHR2YXIgeiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0genopO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHggPCAwLjMgJiYgeiA8IDAuMyl7XHJcblx0XHRcdFx0b2JqZWN0ID0gaW5zO1xyXG5cdFx0XHRcdGogPSBqbGVuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmVuZW15KXtcclxuXHRcdFx0dGhpcy5jYXN0QXR0YWNrKG9iamVjdCwgd2VhcG9uKTtcclxuXHRcdFx0dGhpcy5hdHRhY2tXYWl0ID0gMjA7XHJcblx0XHRcdHRoaXMubW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRpID0gMTE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0QXR0YWNrID0gZnVuY3Rpb24odGFyZ2V0LCB3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdGlmIChwcm9iID4gcHMuc3RhdHMuZGV4KXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdC8vdmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRhcmdldC5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdHZhciBkZnMgPSAwO1xyXG5cdFxyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCkgPDwgMDtcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkF0dGFja2luZyBcIiArIHRhcmdldC5lbmVteS5uYW1lKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShkbWcgKyBcIiBwb2ludHMgaW5mbGljdGVkXCIpO1xyXG5cdFx0dGFyZ2V0LnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8vaWYgKHdlYXBvbikgd2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5qb2dNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlcil7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA1ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwOCAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKSB0aGlzLmpvZy5iID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR2YXIgc3dpbSA9ICh0aGlzLm9uTGF2YSB8fCB0aGlzLm9uV2F0ZXIpO1xyXG5cdGlmIChzd2ltKXsgeFRvIC89IDI7IHpUbyAvPTI7IH1cclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHN3aW0pO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHR0aGlzLmRvVmVydGljYWxDaGVja3MoKTtcclxuXHRcdHRoaXMuam9nTW92ZW1lbnQoKTtcclxuXHRcdG1vdmVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IG1vdmVkO1xyXG5cdHJldHVybiBtb3ZlZDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW91c2VMb29rID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbU1vdmVtZW50ID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuZ2V0TW91c2VNb3ZlbWVudCgpO1xyXG5cdFxyXG5cdGlmIChtTW92ZW1lbnQueCAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmIgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueCk7IH1cclxuXHRpZiAobU1vdmVtZW50LnkgIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5hIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LnkpOyB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdHRoaXMubW91c2VMb29rKCk7XHJcblxyXG5cdC8vIFJvdGF0aW9uIHdpdGgga2V5Ym9hcmRcclxuXHRpZiAoZ2FtZS5rZXlzWzgxXSA9PSAxIHx8IGdhbWUua2V5c1szN10gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgKz0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjldID09IDEgfHwgZ2FtZS5rZXlzWzM5XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiAtPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1szOF0gPT0gMSl7IC8vIFVwIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgKz0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNDBdID09IDEpeyAvLyBEb3duIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgLT0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHR2YXIgQSA9IDAuMCwgQiA9IDAuMDtcclxuXHRpZiAoZ2FtZS5rZXlzWzg3XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s4M10gPT0gMSl7XHJcblx0XHRBID0gLU1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdFx0QiA9IE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZ2FtZS5rZXlzWzY1XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OF0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoQSAhPSAwLjAgfHwgQiAhPSAwLjApeyB0aGlzLm1vdmVUbyhBLCBCKTsgfWVsc2V7IHRoaXMuam9nLmEgPSAwLjA7IH1cclxuXHRpZiAodGhpcy5yb3RhdGlvbi5hID4gdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IHRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG5cdGVsc2UgaWYgKHRoaXMucm90YXRpb24uYSA8IC10aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gLXRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jaGVja0FjdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDMyKSl7IC8vIFNwYWNlXHJcblx0XHR2YXIgeHggPSAodGhpcy5wb3NpdGlvbi5hICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdHZhciB6eiA9ICh0aGlzLnBvc2l0aW9uLmMgLSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0XHJcblx0XHRpZiAoKHRoaXMucG9zaXRpb24uYSA8PCAwKSA9PSB4eCAmJiAodGhpcy5wb3NpdGlvbi5jIDw8IDApID09IHp6KSByZXR1cm47XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdCh4eCwgdGhpcy5wb3NpdGlvbi5iLCB6eik7XHJcblx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRkb29yLmFjdGl2YXRlKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KSk7XHJcblx0XHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmFjdGl2YXRlKVxyXG5cdFx0XHRcdG9iamVjdC5hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNoZWF0RW5hYmxlZCl7XHJcblx0XHRcdGlmIChnYW1lLmZsb29yRGVwdGggPCA4KVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIGdhbWUuZmxvb3JEZXB0aCArIDEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKChnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpIHx8IGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykpICYmIHRoaXMuYXR0YWNrV2FpdCA9PSAwKXtcdC8vIE1lbGVlIGF0dGFjaywgRW50ZXJcclxuXHRcdHZhciB3ZWFwb24gPSBnYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFxyXG5cdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpe1xyXG5cdFx0XHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSA1O1xyXG5cdFx0fWVsc2UgaWYgKHdlYXBvbiAmJiB3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5jYXN0TWlzc2lsZSh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAod2VhcG9uICYmIHdlYXBvbi5zdGF0dXMgPCAwLjA1KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmRlc3Ryb3lJdGVtKHdlYXBvbik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHdlYXBvbi5uYW1lICsgXCIgZGFtYWdlZCFcIik7XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmIChnYW1lLmdldEtleVByZXNzZWQoNzkpKXsgLy8gTywgVE9ETzogY2hhbmdlIHRvIEN0cmwrUyBcclxuXHRcdGdhbWUuc2F2ZU1hbmFnZXIuc2F2ZUdhbWUoKTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYyk7XHJcblx0dmFyIHd5ID0gKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSk/IDAuMyA6IDA7XHJcblx0dmFyIHB5ID0gTWF0aC5mbG9vcigocG9pbnRZIC0gKHRoaXMucG9zaXRpb24uYiArIHd5KSkgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmlzTGF2YVBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdGlmICghdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5vbkxhdmEgPSB0cnVlO1xyXG5cdFx0XHJcblx0fSBlbHNlIGlmICh0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID09IHRoaXMudGFyZ2V0WSlcclxuXHRcdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDI1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gdHJ1ZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fWVsc2Uge1xyXG5cdFx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHRcdHRoaXMub25MYXZhID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvRmxvYXQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm9uV2F0ZXIgJiYgdGhpcy5qb2cuYSA9PSAwLjApe1xyXG5cdFx0dGhpcy5qb2cuYyArPSAwLjAwNSAqIHRoaXMuam9nLmQ7XHJcblx0XHRpZiAodGhpcy5qb2cuYyA+PSAwLjAzICYmIHRoaXMuam9nLmQgPT0gMSkgdGhpcy5qb2cuZCA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYyA8PSAtMC4wMyAmJiB0aGlzLmpvZy5kID09IC0xKSB0aGlzLmpvZy5kID0gMTtcclxuXHRcdHRoaXMuY2FtZXJhSGVpZ2h0ID0gMC41ICsgdGhpcy5qb2cuYSArIHRoaXMuam9nLmM7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5jID0gMC4wO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaHVydCA+IDAuMCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuZG9GbG9hdCgpO1xyXG5cdHRoaXMubW92ZW1lbnQoKTtcclxuXHR0aGlzLmNoZWNrQWN0aW9uKCk7XHJcblx0XHJcblx0aWYgKHRoaXMudGFyZ2V0WSA8IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgLT0gMC4xO1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID49IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1cclxuXHRcclxuXHQvL3RoaXMudGFyZ2V0WSA9IHRoaXMucG9zaXRpb24uYjtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5jYW1lcmFIZWlnaHQgPiAwLjIpeyBcclxuXHRcdFx0dGhpcy5jYW1lcmFIZWlnaHQgLT0gMC4wMTsgXHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGlmICh0aGlzLm9uTGF2YSl7XHJcblx0XHRpZiAodGhpcy5sYXZhQ291bnRlciA+IDMwKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyKys7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdH1cclxuXHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCkgdGhpcy5hdHRhY2tXYWl0IC09IDE7XHJcblx0aWYgKHRoaXMuaHVydCA+IDApIHRoaXMuaHVydCAtPSAxO1xyXG5cdGlmICh0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPiAwKXtcclxuXHRcdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlci0tO1xyXG5cdFx0aWYgKHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHdlYXBvbiA9IHRoaXMubWFwTWFuYWdlci5nYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpXHJcblx0XHRcdFx0dGhpcy5tZWxlZUF0dGFjayh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnN0ZXAoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gUGxheWVyU3RhdHMoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ1BsYXllclN0YXRzJyk7XHJcblx0dGhpcy5ocCA9IDA7XHJcblx0dGhpcy5tSFAgPSAwO1xyXG5cdHRoaXMubWFuYSA9IDA7XHJcblx0dGhpcy5tTWFuYSA9IDA7XHJcblx0XHJcblx0dGhpcy52aXJ0dWUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0dGhpcy5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuc3RhdHMgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpLFxyXG5cdFx0c3RyOiAnMEQwJywgXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclN0YXRzO1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKSxcclxuXHRcdHN0cjogJzBEMCcsXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmFkZEV4cGVyaWVuY2UgPSBmdW5jdGlvbihhbW91bnQsIGNvbnNvbGUpe1xyXG5cdHRoaXMuZXhwICs9IGFtb3VudDtcclxuXHRcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShhbW91bnQgKyBcIiBYUCBnYWluZWRcIik7XHJcblx0dmFyIG5leHRFeHAgPSAoTWF0aC5wb3codGhpcy5sdmwsIDEuNSkgKiA1MDApIDw8IDA7XHJcblx0aWYgKHRoaXMuZXhwID49IG5leHRFeHApeyB0aGlzLmxldmVsVXAoY29uc29sZSk7IH1cclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5sZXZlbFVwID0gZnVuY3Rpb24oY29uc29sZSl7XHJcblx0dGhpcy5sdmwgKz0gMTtcclxuXHRcclxuXHQvLyBVcGdyYWRlIEhQIGFuZCBNYW5hXHJcblx0dmFyIGhwTmV3ID0gTWF0aC5pUmFuZG9tKDEwLCAyNSk7XHJcblx0dmFyIG1hbmFOZXcgPSBNYXRoLmlSYW5kb20oNSwgMTUpO1xyXG5cdFxyXG5cdHZhciBocE9sZCA9IHRoaXMubUhQO1xyXG5cdHZhciBtYW5hT2xkID0gdGhpcy5tTWFuYTtcclxuXHRcclxuXHR0aGlzLmhwICArPSBocE5ldztcclxuXHR0aGlzLm1hbmEgKz0gbWFuYU5ldztcclxuXHR0aGlzLm1IUCArPSBocE5ldztcclxuXHR0aGlzLm1NYW5hICs9IG1hbmFOZXc7XHJcblx0XHJcblx0Ly8gVXBncmFkZSBhIHJhbmRvbSBzdGF0IGJ5IDEtMyBwb2ludHNcclxuXHQvKlxyXG5cdHZhciBzdGF0cyA9IFsnc3RyJywgJ2RmcyddO1xyXG5cdHZhciBuYW1lcyA9IFsnU3RyZW5ndGgnLCAnRGVmZW5zZSddO1xyXG5cdHZhciBzdCwgbm07XHJcblx0d2hpbGUgKCFzdCl7XHJcblx0XHR2YXIgaW5kID0gTWF0aC5pUmFuZG9tKHN0YXRzLmxlbmd0aCk7XHJcblx0XHRzdCA9IHN0YXRzW2luZF07XHJcblx0XHRubSA9IG5hbWVzW2luZF07XHJcblx0fVxyXG5cdFxyXG5cdHZhciBwYXJ0MSA9IHBhcnNlSW50KHRoaXMuc3RhdHNbc3RdLnN1YnN0cmluZygwLCB0aGlzLnN0YXRzW3N0XS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0cGFydDEgKz0gTWF0aC5pUmFuZG9tKDEsIDMpO1xyXG5cdFxyXG5cdHZhciBvbGQgPSB0aGlzLnN0YXRzW3N0XTtcclxuXHR0aGlzLnN0YXRzW3N0XSA9IHBhcnQxICsgJ0QzJzsqL1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTGV2ZWwgdXA6IFwiICsgdGhpcy5sdmwgKyBcIiFcIik7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIUCBpbmNyZWFzZWQgZnJvbSBcIiArIGhwT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1IUCk7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNYW5hIGluY3JlYXNlZCBmcm9tIFwiICsgbWFuYU9sZCArIFwiIHRvIFwiICsgdGhpcy5tTWFuYSk7XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShubSArIFwiIGluY3JlYXNlZCBmcm9tIFwiICsgb2xkICsgXCIgdG8gXCIgKyB0aGlzLnN0YXRzW3N0XSk7XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuc2V0VmlydHVlID0gZnVuY3Rpb24odmlydHVlTmFtZSl7XHJcblx0dGhpcy52aXJ0dWUgPSB2aXJ0dWVOYW1lO1xyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0c3dpdGNoICh2aXJ0dWVOYW1lKXtcclxuXHRcdGNhc2UgXCJIb25lc3R5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDIwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuODtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnTWFnZSc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkNvbXBhc3Npb25cIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdCYXJkJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiVmFsb3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDgwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRmlnaHRlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkhvbm9yXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnUGFsYWRpbic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNwaXJpdHVhbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDY7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdSYW5nZXInO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJIdW1pbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNjAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdTaGVwaGVyZCc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNhY3JpZmljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSA1MDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Rpbmtlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkp1c3RpY2VcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRHJ1aWQnO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubUhQID0gdGhpcy5ocDtcclxuXHR0aGlzLnN0YXRzLnN0ciArPSAnRDMnO1xyXG5cdHRoaXMuc3RhdHMuZGZzICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyICs9ICdEMyc7XHJcblx0dGhpcy5tTWFuYSA9IHRoaXMubWFuYTtcclxufTtcclxuIiwiZnVuY3Rpb24gU2F2ZU1hbmFnZXIoZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxufVxyXG5cclxuU2F2ZU1hbmFnZXIucHJvdG90eXBlID0ge1xyXG5cdHNhdmVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNhdmVPYmplY3QgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5yZWdpc3RlcignU3R5Z2lhbkdhbWUnKSxcclxuXHRcdFx0dmVyc2lvbjogdmVyc2lvbiwgXHJcblx0XHRcdHBsYXllcjogdGhpcy5nYW1lLnBsYXllcixcclxuXHRcdFx0aW52ZW50b3J5OiB0aGlzLmdhbWUuaW52ZW50b3J5LFxyXG5cdFx0XHRtYXBzOiB0aGlzLmdhbWUubWFwc1xyXG5cdFx0fTtcclxuXHRcdHZhciBzZXJpYWxpemVkID0gY2lyY3VsYXIuc2VyaWFsaXplKHNhdmVPYmplY3QpO1xyXG5cdFx0XHJcblx0XHR2YXIgc2VyaWFsaXplZE9iamVjdCA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XHJcblx0XHRjb25zb2xlLmxvZyhzZXJpYWxpemVkT2JqZWN0KTtcclxuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZTogXCIrc2VyaWFsaXplZC5sZW5ndGgpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTYXZlTWFuYWdlcjsiLCJmdW5jdGlvbiBTZWxlY3RDbGFzcygvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdENsYXNzO1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5nYW1lO1xyXG5cdHZhciBwbGF5ZXJTID0gZ2FtZS5wbGF5ZXI7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHR2YXIgbW91c2UgPSBnYW1lLm1vdXNlO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5iID49IDI4ICYmIGdhbWUubW91c2UuYiA8IDEwMCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25lc3R5XCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiQ29tcGFzc2lvblwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlZhbG9yXCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJKdXN0aWNlXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGdhbWUubW91c2UuYiA+PSAxMDAgJiYgZ2FtZS5tb3VzZS5iIDwgMTcwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNhY3JpZmljZVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbm9yXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU3Bpcml0dWFsaXR5XCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIdW1pbGl0eVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHBsYXllclMudmlydHVlICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkocGxheWVyUy5jbGFzc05hbWUpO1xyXG5cdFx0XHRnYW1lLmxvYWRNYXAoZmFsc2UsIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5zZWxlY3RDbGFzcywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1N0YWlycycsICdiaWxsYm9hcmQnKTtcclxuXHJcbmZ1bmN0aW9uIFN0YWlycyhwb3NpdGlvbiwgbWFwTWFuYWdlciwgZGlyZWN0aW9uKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoXCJTdGFpcnNcIik7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0dGhpcy5zdGFpcnMgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcclxuXHR0aGlzLnRhcmdldElkID0gdGhpcy5tYXBNYW5hZ2VyLmRlcHRoO1xyXG5cdGlmICh0aGlzLmRpcmVjdGlvbiA9PSAndXAnKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgLT0gMTtcclxuXHR9ZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ2Rvd24nKXtcclxuXHRcdHRoaXMudGFyZ2V0SWQgKz0gMTtcclxuXHRcdHRoaXMuaW1nSW5kID0gMTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgdGhpcy5tYXBNYW5hZ2VyLmdhbWUuR0wuY3R4KTtcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbdGhpcy5pbWdJbmRdO1xyXG5cdHRoaXMuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSBudWxsO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWlycztcclxuXHJcblN0YWlycy5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRhcmdldElkIDwgOSlcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIHRoaXMudGFyZ2V0SWQpO1xyXG5cdGVsc2Uge1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50aWxlICE9IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSB0aGlzLm1hcE1hbmFnZXIubWFwW3RoaXMucG9zaXRpb24uYyA8PCAwXVt0aGlzLnBvc2l0aW9uLmEgPDwgMF07XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcgJiYgdGhpcy50aWxlLmNoID4gMSl7XHJcblx0XHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiA8PCAwO1xyXG5cdFx0Zm9yICh2YXIgaT15KzE7aTx0aGlzLnRpbGUuY2g7aSsrKXtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0cG9zLmIgPSBpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzJdO1xyXG5cdFx0XHRnYW1lLmRyYXdCaWxsYm9hcmQocG9zLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzNdO1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5nZXRUaWxlKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsInZhciBTZWxlY3RDbGFzcyA9IHJlcXVpcmUoJy4vU2VsZWN0Q2xhc3MnKTtcclxuXHJcbmZ1bmN0aW9uIFRpdGxlU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5ibGluayA9IDMwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlU2NyZWVuO1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdHRoaXMuZ2FtZS5zY2VuZSA9IG5ldyBTZWxlY3RDbGFzcyh0aGlzLmdhbWUpO1xyXG5cdH1cclxufTtcclxuXHJcblRpdGxlU2NyZWVuLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy50aXRsZVNjcmVlbiwgMCwgMCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFVJKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7XHJcblxyXG5VSS5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSAwO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHR0aGlzLmN0eC53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuXHR0aGlzLmN0eC5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG5cdHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0dGhpcy5zY2FsZSA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jayA9IGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2s7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2Upe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5kcmF3SW1hZ2Uoc3ByaXRlLFxyXG5cdFx0eEltZyAqIHNwcml0ZS5pbWdXaWR0aCwgeUltZyAqIHNwcml0ZS5pbWdIZWlnaHQsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodCxcclxuXHRcdHgsIHksIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodFxyXG5cdFx0KTtcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3U3ByaXRlRXh0ID0gZnVuY3Rpb24oc3ByaXRlLCB4LCB5LCBzdWJJbWFnZSwgaW1hZ2VBbmdsZSl7XHJcblx0dmFyIHhJbWcgPSBzdWJJbWFnZSAlIHNwcml0ZS5pbWdOdW07XHJcblx0dmFyIHlJbWcgPSAoc3ViSW1hZ2UgLyBzcHJpdGUuaW1nTnVtKSA8PCAwO1xyXG5cdFxyXG5cdHRoaXMuY3R4LnNhdmUoKTtcclxuXHR0aGlzLmN0eC50cmFuc2xhdGUoeCtzcHJpdGUueE9yaWcsIHkrc3ByaXRlLnlPcmlnKTtcclxuXHR0aGlzLmN0eC5yb3RhdGUoaW1hZ2VBbmdsZSk7XHJcblx0XHJcblx0dGhpcy5jdHguZHJhd0ltYWdlKHNwcml0ZSxcclxuXHRcdHhJbWcgKiBzcHJpdGUuaW1nV2lkdGgsIHlJbWcgKiBzcHJpdGUuaW1nSGVpZ2h0LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHQsXHJcblx0XHQtc3ByaXRlLnhPcmlnLCAtc3ByaXRlLnlPcmlnLCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHRcclxuXHRcdCk7XHJcblx0XHRcclxuXHR0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1RleHQgPSBmdW5jdGlvbih0ZXh0LCB4LCB5LCBjb25zb2xlKXtcclxuXHR2YXIgdyA9IGNvbnNvbGUuc3BhY2VDaGFycztcclxuXHR2YXIgaCA9IGNvbnNvbGUuc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0Zm9yICh2YXIgaj0wLGpsZW49dGV4dC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHR2YXIgY2hhcmEgPSB0ZXh0LmNoYXJBdChqKTtcclxuXHRcdHZhciBpbmQgPSBjb25zb2xlLmxpc3RPZkNoYXJzLmluZGV4T2YoY2hhcmEpO1xyXG5cdFx0aWYgKGluZCAhPSAtMSl7XHJcblx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZShjb25zb2xlLnNwcml0ZUZvbnQsXHJcblx0XHRcdFx0dyAqIGluZCwgMCwgdywgaCxcclxuXHRcdFx0XHR4LCB5LCB3LCBoKTtcclxuXHRcdH1cclxuXHRcdHggKz0gdztcclxuXHR9XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIEF1ZGlvQVBJID0gcmVxdWlyZSgnLi9BdWRpbycpO1xyXG52YXIgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xyXG52YXIgSW52ZW50b3J5ID0gcmVxdWlyZSgnLi9JbnZlbnRvcnknKTtcclxudmFyIEl0ZW0gPSByZXF1aXJlKCcuL0l0ZW0nKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgTWFwTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFwTWFuYWdlcicpO1xyXG52YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgUGxheWVyU3RhdHMgPSByZXF1aXJlKCcuL1BsYXllclN0YXRzJyk7XHJcbnZhciBTYXZlTWFuYWdlciA9IHJlcXVpcmUoJy4vU2F2ZU1hbmFnZXInKTtcclxudmFyIFRpdGxlU2NyZWVuID0gcmVxdWlyZSgnLi9UaXRsZVNjcmVlbicpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL1VJJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxudmFyIFdlYkdMID0gcmVxdWlyZSgnLi9XZWJHTCcpO1xyXG5cclxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHRcdFx0XHQgN0RSTDE1IFNvdXJjZSBDb2RlXHJcblx0XHRcdFx0XHJcblx0XHRcdEJ5IENhbWlsbyBSYW3DrXJleiAoSnVjYXJhdmUpXHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0ICAyMDE1XHJcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG5mdW5jdGlvbiBVbmRlcndvcmxkKCl7XHJcblx0dGhpcy5zaXplID0gdmVjMigzNTUsIDIwMCk7XHJcblx0XHJcblx0dGhpcy5HTCA9IG5ldyBXZWJHTCh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5VSSA9IG5ldyBVSSh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5hdWRpbyA9IG5ldyBBdWRpb0FQSSgpO1xyXG5cdFxyXG5cdHRoaXMucGxheWVyID0gbmV3IFBsYXllclN0YXRzKCk7XHJcblx0dGhpcy5pbnZlbnRvcnkgPSBuZXcgSW52ZW50b3J5KDEwKTtcclxuXHR0aGlzLmNvbnNvbGUgPSBuZXcgQ29uc29sZSgxMCwgMTAsIDMwMCwgdGhpcyk7XHJcblx0dGhpcy5zYXZlTWFuYWdlciA9IG5ldyBTYXZlTWFuYWdlcih0aGlzKTtcclxuXHR0aGlzLmZvbnQgPSAnMTBweCBcIkNvdXJpZXJcIic7XHJcblx0XHJcblx0dGhpcy5nclBhY2sgPSAnaW1nLyc7XHJcblx0XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMua2V5cyA9IFtdO1xyXG5cdHRoaXMubW91c2UgPSB2ZWMzKDAuMCwgMC4wLCAwKTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdHRoaXMuaW1hZ2VzID0ge307XHJcblx0dGhpcy5tdXNpYyA9IHt9O1xyXG5cdHRoaXMuc291bmRzID0ge307XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbXSwgZmxvb3I6IFtdLCBjZWlsOiBbXX07XHJcblx0dGhpcy5vYmplY3RUZXggPSB7fTtcclxuXHR0aGlzLm1vZGVscyA9IHt9O1xyXG5cdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMudGltZVN0b3AgPSAwO1xyXG5cdHRoaXMucHJvdGVjdGlvbiA9IDA7XHJcblx0XHJcblx0dGhpcy5mcHMgPSAoMTAwMCAvIDMwKSA8PCAwO1xyXG5cdHRoaXMubGFzdFQgPSAwO1xyXG5cdHRoaXMubnVtYmVyRnJhbWVzID0gMDtcclxuXHR0aGlzLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFxyXG5cdHRoaXMubG9hZEltYWdlcygpO1xyXG5cdHRoaXMubG9hZE11c2ljKCk7XHJcblx0dGhpcy5sb2FkVGV4dHVyZXMoKTtcclxuXHRcclxuXHR0aGlzLmNyZWF0ZTNET2JqZWN0cygpO1xyXG5cdEFuaW1hdGVkVGV4dHVyZS5pbml0KHRoaXMuR0wuY3R4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlM0RPYmplY3RzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmRvb3IgPSBPYmplY3RGYWN0b3J5LmRvb3IodmVjMygwLjUsMC43NSwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgZmFsc2UpO1xyXG5cdHRoaXMuZG9vclcgPSBPYmplY3RGYWN0b3J5LmRvb3JXYWxsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5kb29yQyA9IE9iamVjdEZhY3RvcnkuY3ViZSh2ZWMzKDEuMCwxLjAsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDAuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLnNsb3BlID0gT2JqZWN0RmFjdG9yeS5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMuR0wuY3R4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zb3VuZHMuaGl0ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9oaXQud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMubWlzcyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvbWlzcy53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24xID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wOF8tX1VsdGltYV80Xy1fQzY0Xy1fRHVuZ2VvbnMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24yID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMl8tX1VsdGltYV81Xy1fQzY0Xy1fTG9yZF9CbGFja3Rob3JuLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDVfLV9VbHRpbWFfM18tX0M2NF8tX0NvbWJhdC5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzNfLV9DNjRfLV9FeG9kdXMnX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjUgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA0Xy1fVWx0aW1hXzVfLV9DNjRfLV9FbmdhZ2VtZW50X2FuZF9NZWxlZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjYgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAzXy1fVWx0aW1hXzRfLV9DNjRfLV9Mb3JkX0JyaXRpc2gnc19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb243ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMV8tX1VsdGltYV81Xy1fQzY0Xy1fV29ybGRzX0JlbG93Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uOCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTBfLV9VbHRpbWFfNV8tX0M2NF8tX0hhbGxzX29mX0Rvb20ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmNvZGV4Um9vbSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfNF8tX0M2NF8tX1NocmluZXMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRJbWFnZXMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW1hZ2VzLml0ZW1zX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaXRlbXNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA4LCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuc3BlbGxzX3VpID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic3BlbGxzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLnRpdGxlU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGl0bGVTY3JlZW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuZW5kaW5nU2NyZWVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5kaW5nLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnNlbGVjdENsYXNzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2VsZWN0Q2xhc3MucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiaW52ZW50b3J5RHJvcC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiAxLCBpbWdWTnVtOiAyfSk7XHJcblx0dGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlfc2VsZWN0ZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2Nyb2xsRm9udCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInNjcm9sbEZvbnRXaGl0ZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5yZXN0YXJ0ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicmVzdGFydC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5wYXVzZWQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJwYXVzZWQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMudnBTd29yZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInZwU3dvcmQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuY29tcGFzcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNvbXBhc3NVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7eE9yaWc6IDExLCB5T3JpZzogMTEsIGltZ051bTogMiwgaW1nVk51bTogMX0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZFRleHR1cmVzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnRleHR1cmVzID0ge3dhbGw6IFtudWxsXSwgZmxvb3I6IFtudWxsXSwgY2VpbDogW251bGxdLCB3YXRlcjogW251bGxdfTtcclxuXHRcclxuXHQvLyBObyBUZXh0dXJlXHJcblx0dmFyIG5vVGV4ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwibm9UZXh0dXJlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaChub1RleCk7XHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2gobm9UZXgpO1xyXG5cdFxyXG5cdC8vIFdhbGxzXHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4V2FsbDAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDQucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw1LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHRcclxuXHQvLyBGbG9vcnNcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Rmxvb3IwMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3I0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tRmxvb3IzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpKTtcclxuXHRcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yWzUwXSA9ICh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhIb2xlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNTAsIHRydWUpKTtcclxuXHRcclxuXHQvLyBMaXF1aWRzXHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhdGVyMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhdGVyMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleExhdmEwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhdGVyLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TGF2YTAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIENlaWxpbmdzXHJcblx0dGhpcy50ZXh0dXJlcy5jZWlsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Q2VpbDAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybldhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbFs1MF0gPSAodGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SG9sZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUwLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gSXRlbXNcclxuXHR0aGlzLm9iamVjdFRleC5pdGVtcyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEl0ZW1zLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDgsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhTcGVsbHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGVsbHMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDQsIDQsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHQvLyBNYWdpYyBCb2x0c1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4Qm9sdHMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5ib2x0cy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIFN0YWlyc1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFN0YWlycy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoMiwgMiwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIEVuZW1pZXNcclxuXHR0aGlzLm9iamVjdFRleC5iYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zcGlkZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTcGlkZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC50cm9sbF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFRyb2xsUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2F6ZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHYXplclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oZWFkbGVzc19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEhlYWRsZXNzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNywgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgub3JjX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T3JjUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmVhcGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmVhcGVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgOSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2tlbGV0b25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTa2VsZXRvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC5kYWVtb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhEYWVtb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubW9uZ2JhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE1vbmdiYXRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguaHlkcmFfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhIeWRyYVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zZWFTZXJwZW50X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4U2VhU2VycGVudFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vY3RvcHVzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4T2N0b3B1c1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYWxyb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYWxyb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGljaGVfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhMaWNoZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5naG9zdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdob3N0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdyZW1saW5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHcmVtbGluUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmRyYWdvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERyYWdvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC56b3JuX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4Wm9yblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLm9iamVjdFRleC53aXNwX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4V2lzcFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tYWdlX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TWFnZVJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yYW5nZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSYW5nZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZmlnaHRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEZpZ2h0ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguYmFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubGF2YUxpemFyZF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExhdmFMaXphcmRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wb3N0TG9hZGluZyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLmNyZWF0ZVNwcml0ZUZvbnQodGhpcy5pbWFnZXMuc2Nyb2xsRm9udCwgXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSE/LC4vXCIsIDYpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuc3RvcE11c2ljID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmF1ZGlvLnN0b3BNdXNpYygpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheU11c2ljID0gZnVuY3Rpb24obXVzaWNDb2RlLCBsb29wKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5tdXNpY1ttdXNpY0NvZGVdO1xyXG5cdGlmICghYXVkaW9GKSByZXR1cm4gbnVsbDtcclxuXHR0aGlzLnN0b3BNdXNpYygpO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgbG9vcCwgdHJ1ZSwgMC4yKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kQ29kZSl7XHJcblx0dmFyIGF1ZGlvRiA9IHRoaXMuc291bmRzW3NvdW5kQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuYXVkaW8ucGxheVNvdW5kKGF1ZGlvRiwgZmFsc2UsIGZhbHNlLCAwLjMpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VUkgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLlVJLmN0eDtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldFRleHR1cmVCeUlkID0gZnVuY3Rpb24odGV4dHVyZUlkLCB0eXBlKXtcclxuXHRpZiAoIXRoaXMudGV4dHVyZXNbdHlwZV1bdGV4dHVyZUlkXSkgdGV4dHVyZUlkID0gMTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0T2JqZWN0VGV4dHVyZSA9IGZ1bmN0aW9uKHRleHR1cmVDb2RlKXtcclxuXHRpZiAoIXRoaXMub2JqZWN0VGV4W3RleHR1cmVDb2RlXSkgdGhyb3cgXCJJbnZhbGlkIHRleHR1cmUgY29kZTogXCIgKyB0ZXh0dXJlQ29kZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZE1hcCA9IGZ1bmN0aW9uKG1hcCwgZGVwdGgpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRpZiAoZGVwdGggPT09IHVuZGVmaW5lZCB8fCAhZ2FtZS5tYXBzW2RlcHRoIC0gMV0pe1xyXG5cdFx0Z2FtZS5tYXAgPSBuZXcgTWFwTWFuYWdlcihnYW1lLCBtYXAsIGRlcHRoKTtcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlcHRoO1xyXG5cdFx0Z2FtZS5tYXBzLnB1c2goZ2FtZS5tYXApO1xyXG5cdH1lbHNlIGlmIChnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IGdhbWUubWFwc1tkZXB0aCAtIDFdO1xyXG5cdH1cclxuXHRnYW1lLnNjZW5lID0gbnVsbDtcclxuXHRpZiAoZGVwdGgpXHJcblx0XHRnYW1lLnBsYXlNdXNpYygnZHVuZ2VvbicrZGVwdGgsIGZhbHNlKTtcclxuXHRlbHNlIGlmIChtYXAgPT09ICdjb2RleFJvb20nKVxyXG5cdFx0Z2FtZS5wbGF5TXVzaWMoJ2NvZGV4Um9vbScsIGZhbHNlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnByaW50R3JlZXQgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuY29uc29sZS5tZXNzYWdlcyA9IFtdO1xyXG5cdFxyXG5cdC8vIFNob3dzIGEgd2VsY29tZSBtZXNzYWdlIHdpdGggdGhlIGdhbWUgaW5zdHJ1Y3Rpb25zLlxyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJZb3UgZW50ZXIgdGhlIGxlZ2VuZGFyeSBTdHlnaWFuIEFieXNzLlwiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVXNlIFEtVy1FIHRvIG1vdmUgZm9yd2FyZCwgQS1TLUQgdG8gc3RyYWZlIGFuZCBzdGVwIGJhY2tcIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlByZXNzIFNwYWNlIGJhciB0byBpbnRlcmFjdCBhbmQgRW50ZXIgdG8gYXR0YWNrXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQcmVzcyBUIHRvIGRyb3Agb2JqZWN0c1wiKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW52ZW50b3J5LnJlc2V0KCk7XHJcblx0dGhpcy5wbGF5ZXIucmVzZXQoKTtcclxuXHRcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLm1hcCA9IG51bGw7XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5wcmludEdyZWV0KCk7XHJcblx0XHRcclxuXHR0aGlzLnNjZW5lID0gbmV3IFRpdGxlU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEdhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHRpZiAoZ2FtZS5HTC5hcmVJbWFnZXNSZWFkeSgpKXtcclxuXHRcdGdhbWUucG9zdExvYWRpbmcoKTtcclxuXHRcdGdhbWUubmV3R2FtZSgpO1xyXG5cdH1lbHNle1xyXG5cdFx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvYWRHYW1lKCk7IH0pO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRyZXR1cm4gdGhpcy5pbnZlbnRvcnkuYWRkSXRlbShpdGVtKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIHRleHR1cmUpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KG9iamVjdCwgY2FtZXJhLCB0ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdCbG9jayA9IGZ1bmN0aW9uKGJsb2NrT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGNhbWVyYSA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRcclxuXHR0aGlzLkdMLmRyYXdPYmplY3QoYmxvY2tPYmplY3QsIGNhbWVyYSwgdGhpcy5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JXYWxsID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JXLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yVywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vckN1YmUgPSBmdW5jdGlvbih4LCB5LCB6LCB0ZXhJZCwgdmVydGljYWwpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuZG9vckMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGlmICh2ZXJ0aWNhbCkgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCxNYXRoLlBJXzIsMCk7IGVsc2UgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCwwLDApO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3JDLCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yID0gZnVuY3Rpb24oeCwgeSwgeiwgcm90YXRpb24sIHRleElkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3IucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGdhbWUuZG9vci5yb3RhdGlvbi5iID0gcm90YXRpb247XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vciwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3Rmxvb3IgPSBmdW5jdGlvbihmbG9vck9iamVjdCwgdGV4SWQsIHR5cGVPZil7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIGZ0ID0gdHlwZU9mO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChmbG9vck9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBmdCkudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmlsbGJvYXJkID0gZnVuY3Rpb24ocG9zaXRpb24sIHRleElkLCBiaWxsYm9hcmQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdGlmICghYmlsbGJvYXJkKSBiaWxsYm9hcmQgPSBnYW1lLmJpbGxib2FyZDtcclxuXHRcclxuXHRiaWxsYm9hcmQucG9zaXRpb24uc2V0KHBvc2l0aW9uKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoYmlsbGJvYXJkLCBjYW1lcmEsIGdhbWUub2JqZWN0VGV4W3RleElkXS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdTbG9wZSA9IGZ1bmN0aW9uKHNsb3BlT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KHNsb3BlT2JqZWN0LCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwiZmxvb3JcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3VUkgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgcGxheWVyID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdGlmICghcGxheWVyKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGN0eCA9IGdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdC8vIERyYXcgaGVhbHRoIGJhclxyXG5cdHZhciBocCA9IHBzLmhwIC8gcHMubUhQO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigxMjIsMCwxMjIpXCIgOiBcInJnYigxMjIsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsNzUsNCk7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IChwcy5wb2lzb25lZCk/IFwicmdiKDIwMCwwLDIwMClcIiA6IFwicmdiKDIwMCwwLDApXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsOCwoNzUgKiBocCkgPDwgMCw0KTtcclxuXHRcclxuXHQvLyBEcmF3IG1hbmFcclxuXHR2YXIgbWFuYSA9IHBzLm1hbmEgLyBwcy5tTWFuYTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTgxLDk4LDIwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LDYwLDIpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsMTM4LDI4KVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LCg2MCAqIG1hbmEpIDw8IDAsMik7XHJcblx0XHJcblx0Ly8gRHJhdyBJbnZlbnRvcnlcclxuXHRpZiAodGhpcy5zZXREcm9wSXRlbSlcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wLCA5MCwgNiwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeSwgOTAsIDYsIDApO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnZlbnRvcnkuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdFx0dmFyIHNwciA9IGl0ZW0udGV4ICsgJ191aSc7XHJcblxyXG5cdFx0aWYgKCF0aGlzLnNldERyb3BJdGVtICYmIChpdGVtLnR5cGUgPT0gJ3dlYXBvbicgfHwgaXRlbS50eXBlID09ICdhcm1vdXInKSAmJiBpdGVtLmVxdWlwcGVkKVxyXG5cdFx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQsIDkwICsgKDIyICogaSksIDYsIDApO1x0XHRcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlc1tzcHJdLCA5MyArICgyMiAqIGkpLCA5LCBpdGVtLnN1YkltZyk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAxKTtcclxuXHRcclxuXHQvLyBJZiB0aGUgcGxheWVyIGlzIGh1cnQgZHJhdyBhIHJlZCBzY3JlZW5cclxuXHRpZiAocGxheWVyLmh1cnQgPiAwLjApe1xyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLDAuNSlcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1lbHNlIGlmICh0aGlzLnByb3RlY3Rpb24gPiAwLjApe1x0Ly8gSWYgdGhlIHBsYXllciBoYXMgcHJvdGVjdGlvbiB0aGVuIGRyYXcgaXQgc2xpZ2h0bHkgYmx1ZVxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSg0MCw0MCwyNTUsMC4yKVwiO1xyXG5cdFx0Y3R4LmZpbGxSZWN0KDAsMCxjdHgud2lkdGgsY3R4LmhlaWdodCk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKXtcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5yZXN0YXJ0LCA4NSwgOTQsIDApO1xyXG5cdH1lbHNlIGlmICh0aGlzLnBhdXNlZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucGF1c2VkLCAxNDcsIDk0LCAwKTtcclxuXHR9XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTGV2ZWwgJyt0aGlzLmZsb29yRGVwdGgsIDEwLDI0LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCh0aGlzLnBsYXllci5jbGFzc05hbWUsIDEwLDMxLHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnSFA6ICcrcHMuaHAsIDEwLDksdGhpcy5jb25zb2xlKTtcclxuXHR0aGlzLlVJLmRyYXdUZXh0KCdNYW5hOicrcHMubWFuYSwgMTAsMTcsdGhpcy5jb25zb2xlKTtcclxuXHRcclxuXHQvLyBEcmF3IHRoZSBjb21wYXNzXHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDApO1xyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZUV4dCh0aGlzLmltYWdlcy5jb21wYXNzLCAzMjAsIDEyLCAxLCBNYXRoLlBJICsgdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uLmIpO1xyXG5cdFxyXG5cdC8vIFRPRE86IENoYW5nZSBzcHJpdGUgKG9yIGRvbid0IGRyYXcpIGJhc2VkIG9uIGN1cnJlbnQgd2VhcG9uXHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnZwU3dvcmQsIDIyMCwgMTMwICsgdGhpcy5tYXAucGxheWVyLmxhdW5jaEF0dGFja0NvdW50ZXIgKiAyIC0gdGhpcy5tYXAucGxheWVyLmF0dGFja1dhaXQgKiAxLjUsIDApO1xyXG5cdFxyXG5cdGdhbWUuY29uc29sZS5yZW5kZXIoOCwgMTMwKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFkZEV4cGVyaWVuY2UgPSBmdW5jdGlvbihleHBQb2ludHMpe1xyXG5cdHRoaXMucGxheWVyLmFkZEV4cGVyaWVuY2UoZXhwUG9pbnRzLCB0aGlzLmNvbnNvbGUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlSW5pdGlhbEludmVudG9yeSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMgPSBbXTtcclxuXHRcclxuXHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ215c3RpY1N3b3JkJywgMS4wKTtcclxuXHRpdGVtLmVxdWlwcGVkID0gdHJ1ZTtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljJywgMS4wKTtcclxuXHRpdGVtLmVxdWlwcGVkID0gdHJ1ZTtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdNYWdlJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgJ0RydWlkJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnUGFsYWRpbic6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2xpZ2h0JykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdCYXJkJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGNhc2UgJ1Rpbmtlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRkZWZhdWx0OlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3JlZFBvdGlvbicpKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnRHJ1aWQnOiBjYXNlICdSYW5nZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdib3cnLCAwLjYpKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdUaW5rZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdzbGluZycsIDAuNykpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS51c2VJdGVtID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWN0aXZlU3BlbGwgPSBmdW5jdGlvbihpbmRleCl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpbmRleF07XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0dmFyIHAgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0cC5tb3ZlZCA9IHRydWU7XHJcblx0XHJcblx0aWYgKHBzLm1hbmEgPCBpdGVtLm1hbmEpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdCBlbm91Z2ggbWFuYVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0cHMubWFuYSA9IE1hdGgubWF4KHBzLm1hbmEgLSBpdGVtLm1hbmEsIDApO1xyXG5cdFxyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ2N1cmUnOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWCFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1guLi5cIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZWRQb3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnYXJsaWMgcG90aW9uIGN1cmVzIHlvdS5cIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3RoaW5nIGhhcHBlbnNcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdoZWFsJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAodGhpcy5wbGF5ZXIubUhQICogaXRlbS5wZXJjZW50KSA8PCAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk1BTkkhIFwiK2hlYWwgKyBcIiBwb2ludHMgaGVhbGVkXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2xpZ2h0JzpcclxuXHRcdFx0aWYgKHRoaXMuR0wubGlnaHQgPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLkdMLmxpZ2h0ID0gaXRlbS5saWdodFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIExPUiFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdtaXNzaWxlJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZShwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ21hZ2ljTWlzc2lsZScsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJHUkFWIFBPUiFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaWNlYmFsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdpY2VCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGUklPIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZXBlbCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnYmxpbmsnOlxyXG5cdFx0XHR2YXIgbGFzdFBvcyA9IG51bGw7XHJcblx0XHRcdHZhciBwb3J0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMubWFwLnBsYXllci5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlyID0gdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyLmIpO1xyXG5cdFx0XHR2YXIgZHogPSAtTWF0aC5zaW4oZGlyLmIpO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8MTU7aSsrKXtcclxuXHRcdFx0XHRwb3MuYSArPSBkeDtcclxuXHRcdFx0XHRwb3MuYyArPSBkejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY3ggPSBwb3MuYSA8PCAwO1xyXG5cdFx0XHRcdHZhciBjeSA9IHBvcy5jIDw8IDA7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFwLmlzU29saWQoY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcG9ydGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aSA9IDE1O1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1hcC5pc1dhdGVyUG9zaXRpb24oY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRcdHZhciBpbnMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWlucyl7XHJcblx0XHRcdFx0XHRcdFx0bGFzdFBvcyA9IHZlYzMoY3gsIHBvcy5iLCBjeSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghcG9ydGVkKXtcclxuXHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnZmlyZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnZmlyZUJhbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiVkFTIEZMQU0hXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3Byb3RlY3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5wcm90ZWN0aW9uID0gaXRlbS5wcm90VGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gU0FOQ1QhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndGltZSc6XHJcblx0XHRcdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy50aW1lU3RvcCA9IGl0ZW0uc3RvcFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlJFTCBUWU0hXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnc2xlZXAnOlxyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gWlUhXCIpO1xyXG5cdFx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXAuZ2V0SW5zdGFuY2VzTmVhcmVzdChwLnBvc2l0aW9uLCA2LCAnZW5lbXknKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0aW5zdGFuY2VzW2ldLnNsZWVwID0gaXRlbS5zbGVlcFRpbWU7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdqaW54JzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd0cmVtb3InOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAna2lsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJYRU4gQ09SUCFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaW5kZXgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJvcEl0ZW0gPSBmdW5jdGlvbihpKXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0dmFyIGNsZWFuUG9zID0gdGhpcy5tYXAuZ2V0TmVhcmVzdENsZWFuSXRlbVRpbGUocGxheWVyLnBvc2l0aW9uLmEsIHBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRpZiAoIWNsZWFuUG9zKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ0NhbiBub3QgZHJvcCBpdCBoZXJlJyk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgZHJvcHBlZCcpO1xyXG5cdFx0Y2xlYW5Qb3MuYSArPSAwLjU7XHJcblx0XHRjbGVhblBvcy5jICs9IDAuNTtcclxuXHRcdFxyXG5cdFx0dmFyIG5JdCA9IG5ldyBJdGVtKGNsZWFuUG9zLCBudWxsLCB0aGlzLm1hcCk7XHJcblx0XHRuSXQuc2V0SXRlbShpdGVtKTtcclxuXHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG5JdCk7XHJcblx0XHRcclxuXHRcdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGkpO1xyXG5cdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNoZWNrSW52Q29udHJvbCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRcclxuXHRpZiAocGxheWVyICYmIHBsYXllci5kZXN0cm95ZWQpe1xyXG5cdFx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4Mikpe1xyXG5cdFx0XHRkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuXHRcdFx0dGhpcy5uZXdHYW1lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICghcGxheWVyIHx8IHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgwKSl7XHJcblx0XHR0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZDtcclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMucGF1c2VkKSByZXR1cm47XHJcblx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4NCkpe1xyXG5cdFx0aWYgKCF0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnU2VsZWN0IHRoZSBpdGVtIHRvIGRyb3AnKTtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IHRydWU7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MTA7aSsrKXtcclxuXHRcdHZhciBpbmRleCA9IDQ5ICsgaTtcclxuXHRcdGlmIChpID09IDkpXHJcblx0XHRcdGluZGV4ID0gNDg7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKGluZGV4KSl7XHJcblx0XHRcdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaV07XHJcblx0XHRcdGlmICghaXRlbSl7XHJcblx0XHRcdFx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZSgnTm8gaXRlbScpO1xyXG5cdFx0XHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHRcdHRoaXMuZHJvcEl0ZW0oaSk7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmIChpdGVtLnR5cGUgPT0gJ3dlYXBvbicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3aWVsZGVkJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdhcm1vdXInICYmICFpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgd29yZScpO1xyXG5cdFx0XHRcdHRoaXMuaW52ZW50b3J5LmVxdWlwSXRlbShpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnbWFnaWMnKXtcclxuXHRcdFx0XHR0aGlzLmFjdGl2ZVNwZWxsKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdwb3Rpb24nKXtcclxuXHRcdFx0XHR0aGlzLnVzZUl0ZW0oaSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IFxyXG5cdFxyXG5cdHJldHVybjtcclxuXHRcclxuXHRpZiAocHMucG90aW9ucyA+IDApe1xyXG5cdFx0aWYgKHBzLmhwID09IHBzLm1IUCl7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIZWFsdGggaXMgYWxyZWFkeSBhdCBtYXhcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cHMucG90aW9ucyAtPSAxO1xyXG5cdFx0cHMuaHAgPSBNYXRoLm1pbihwcy5tSFAsIHBzLmhwICsgNSk7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUG90aW9uIHVzZWRcIik7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm8gbW9yZSBwb3Rpb25zIGxlZnQuXCIpO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdsb2JhbExvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnByb3RlY3Rpb24gPiAwKXsgdGhpcy5wcm90ZWN0aW9uIC09IDE7IH1cclxuXHRpZiAodGhpcy50aW1lU3RvcCA+IDApeyB0aGlzLnRpbWVTdG9wIC09IDE7IH1cclxuXHRpZiAodGhpcy5HTC5saWdodCA+IDApeyB0aGlzLkdMLmxpZ2h0IC09IDE7IH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHR2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuXHR2YXIgZFQgPSAobm93IC0gZ2FtZS5sYXN0VCk7XHJcblx0XHJcblx0Ly8gTGltaXQgdGhlIGdhbWUgdG8gdGhlIGJhc2Ugc3BlZWQgb2YgdGhlIGdhbWVcclxuXHRpZiAoZFQgPiBnYW1lLmZwcyl7XHJcblx0XHRnYW1lLmxhc3RUID0gbm93IC0gKGRUICUgZ2FtZS5mcHMpO1xyXG5cdFx0XHJcblx0XHRpZiAoIWdhbWUuR0wuYWN0aXZlKXtcclxuXHRcdFx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvb3AoKTsgfSk7IFxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLm1hcCAhPSBudWxsKXtcclxuXHRcdFx0dmFyIGdsID0gZ2FtZS5HTC5jdHg7XHJcblx0XHRcdFxyXG5cdFx0XHRnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcblx0XHRcdGdhbWUuVUkuY2xlYXIoKTtcclxuXHRcdFx0XHJcblx0XHRcdGdhbWUuZ2xvYmFsTG9vcCgpO1xyXG5cdFx0XHRnYW1lLmNoZWNrSW52Q29udHJvbCgpO1xyXG5cdFx0XHRnYW1lLm1hcC5sb29wKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRnYW1lLmRyYXdVSSgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodGhpcy5zY2VuZSAhPSBudWxsKXtcclxuXHRcdFx0Z2FtZS5zY2VuZS5sb29wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb29wKCk7IH0pO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0S2V5UHJlc3NlZCA9IGZ1bmN0aW9uKGtleUNvZGUpe1xyXG5cdGlmICh0aGlzLmtleXNba2V5Q29kZV0gPT0gMSl7XHJcblx0XHR0aGlzLmtleXNba2V5Q29kZV0gPSAyO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE1vdXNlQnV0dG9uUHJlc3NlZCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMubW91c2UuYyA9PSAxKXtcclxuXHRcdHRoaXMubW91c2UuYyA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHJldCA9IHt4OiB0aGlzLm1vdXNlTW92ZW1lbnQueCwgeTogdGhpcy5tb3VzZU1vdmVtZW50Lnl9O1xyXG5cdHRoaXMubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSBuZXcgVW5kZXJ3b3JsZCgpO1xyXG5cdGdhbWUubG9hZEdhbWUoKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGUua2V5Q29kZSA9PSA4KXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLmtleXNbZS5rZXlDb2RlXSA9PSAyKSByZXR1cm47XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwia2V5dXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Z2FtZS5rZXlzW2Uua2V5Q29kZV0gPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubWFwICE9IG51bGwpXHJcblx0XHRcdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5jID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUubW91c2UuYyA9IDE7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRnYW1lLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFx0Z2FtZS5udW1iZXJGcmFtZXMgPSAwO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJyZXNpemVcIiwgZnVuY3Rpb24oKXtcclxuXHRcdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBnYW1lLnNpemUuYjtcclxuXHRcdHZhciBjYW52YXMgPSBnYW1lLkdMLmNhbnZhcztcclxuXHRcdFxyXG5cdFx0Y2FudmFzID0gZ2FtZS5VSS5jYW52YXM7XHJcblx0XHRnYW1lLlVJLnNjYWxlID0gY2FudmFzLm9mZnNldEhlaWdodCAvIGNhbnZhcy5oZWlnaHQ7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIG1vdmVDYWxsYmFjayA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnggPSBlLm1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WCB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdGdhbWUubW91c2VNb3ZlbWVudC55ID0gZS5tb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS5tb3pNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0ZS53ZWJraXRNb3ZlbWVudFkgfHxcclxuXHRcdFx0XHRcdFx0MDtcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBwb2ludGVybG9ja2NoYW5nZSA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKGRvY3VtZW50LnBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50Lm1velBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzIHx8XHJcblx0XHRcdGRvY3VtZW50LndlYmtpdFBvaW50ZXJMb2NrRWxlbWVudCA9PT0gY2FudmFzKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlQ2FsbGJhY2spO1xyXG5cdFx0XHRnYW1lLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwicG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIm1venBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJ3ZWJraXRwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImJsdXJcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gZmFsc2U7IGdhbWUuYXVkaW8ucGF1c2VNdXNpYygpOyAgfSk7XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcImZvY3VzXCIsIGZ1bmN0aW9uKGUpeyBnYW1lLkdMLmFjdGl2ZSA9IHRydWU7IGdhbWUuYXVkaW8ucmVzdG9yZU11c2ljKCk7IH0pO1xyXG59KTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0YWRkRXZlbnQ6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZ1bmMpe1xyXG5cdFx0aWYgKG9iai5hZGRFdmVudExpc3RlbmVyKXtcclxuXHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuYywgZmFsc2UpO1xyXG5cdFx0fWVsc2UgaWYgKG9iai5hdHRhY2hFdmVudCl7XHJcblx0XHRcdG9iai5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmdW5jKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdCQkOiBmdW5jdGlvbihvYmpJZCl7XHJcblx0XHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9iaklkKTtcclxuXHRcdGlmICghZWxlbSkgYWxlcnQoXCJDb3VsZG4ndCBmaW5kIGVsZW1lbnQ6IFwiICsgb2JqSWQpO1xyXG5cdFx0cmV0dXJuIGVsZW07XHJcblx0fSxcclxuXHRnZXRIdHRwOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGh0dHA7XHJcblx0XHRpZiAgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcdH1lbHNlIGlmICh3aW5kb3cuQWN0aXZlWE9iamVjdCl7XHJcblx0XHRcdGh0dHAgPSBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGh0dHA7XHJcblx0fSxcclxuXHRyb2xsRGljZTogZnVuY3Rpb24gKHBhcmFtKXtcclxuXHRcdHZhciBhID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKDAsIHBhcmFtLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRcdHZhciBiID0gcGFyc2VJbnQocGFyYW0uc3Vic3RyaW5nKHBhcmFtLmluZGV4T2YoJ0QnKSArIDEpLCAxMCk7XHJcblx0XHR2YXIgcm9sbDEgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBiKTtcclxuXHRcdHZhciByb2xsMiA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0cmV0dXJuIE1hdGguY2VpbChhICogKHJvbGwxK3JvbGwyKS8yKTtcclxuXHR9XHJcbn1cclxuXHRcclxuLy8gTWF0aCBwcm90b3R5cGUgb3ZlcnJpZGVzXHRcclxuTWF0aC5yYWRSZWxhdGlvbiA9IE1hdGguUEkgLyAxODA7XHJcbk1hdGguZGVnUmVsYXRpb24gPSAxODAgLyBNYXRoLlBJO1xyXG5NYXRoLmRlZ1RvUmFkID0gZnVuY3Rpb24oZGVncmVlcyl7XHJcblx0cmV0dXJuIGRlZ3JlZXMgKiB0aGlzLnJhZFJlbGF0aW9uO1xyXG59O1xyXG5NYXRoLnJhZFRvRGVnID0gZnVuY3Rpb24ocmFkaWFucyl7XHJcblx0cmV0dXJuICgocmFkaWFucyAqIHRoaXMuZGVnUmVsYXRpb24pICsgNzIwKSAlIDM2MDtcclxufTtcclxuTWF0aC5pUmFuZG9tID0gZnVuY3Rpb24oYSwgYil7XHJcblx0aWYgKGIgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRiID0gYTtcclxuXHRcdGEgPSAwO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gYSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChiIC0gYSkpO1xyXG59O1xyXG5cclxuTWF0aC5nZXRBbmdsZSA9IGZ1bmN0aW9uKC8qVmVjMiovIGEsIC8qVmVjMiovIGIpe1xyXG5cdHZhciB4eCA9IE1hdGguYWJzKGEuYSAtIGIuYSk7XHJcblx0dmFyIHl5ID0gTWF0aC5hYnMoYS5jIC0gYi5jKTtcclxuXHRcclxuXHR2YXIgYW5nID0gTWF0aC5hdGFuMih5eSwgeHgpO1xyXG5cdFxyXG5cdC8vIEFkanVzdCB0aGUgYW5nbGUgYWNjb3JkaW5nIHRvIGJvdGggcG9zaXRpb25zXHJcblx0aWYgKGIuYSA8PSBhLmEgJiYgYi5jIDw9IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJIC0gYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPD0gYS5hICYmIGIuYyA+IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJICsgYW5nO1xyXG5cdH1lbHNlIGlmIChiLmEgPiBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkyIC0gYW5nO1xyXG5cdH1cclxuXHRcclxuXHRhbmcgPSAoYW5nICsgTWF0aC5QSTIpICUgTWF0aC5QSTI7XHJcblx0XHJcblx0cmV0dXJuIGFuZztcclxufTtcclxuXHJcbk1hdGguUElfMiA9IE1hdGguUEkgLyAyO1xyXG5NYXRoLlBJMiA9IE1hdGguUEkgKiAyO1xyXG5NYXRoLlBJM18yID0gTWF0aC5QSSAqIDMgLyAyO1xyXG5cclxuLy8gQ3Jvc3Nicm93c2VyIGFuaW1hdGlvbi9hdWRpbyBvdmVycmlkZXNcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gXHJcblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fCBcclxuXHR3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxyXG5cdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHwgXHJcblx0d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fCBcclxuXHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8IFxyXG5cdGZ1bmN0aW9uKC8qIGZ1bmN0aW9uICovIGRyYXcxKXtcclxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KGRyYXcxLCAxMDAwIC8gMzApO1xyXG5cdH07XHJcblxyXG53aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0OyIsInZhciBNYXRyaXggPSByZXF1aXJlKCcuL01hdHJpeCcpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBXZWJHTChzaXplLCBjb250YWluZXIpe1xyXG5cdGlmICghdGhpcy5pbml0Q2FudmFzKHNpemUsIGNvbnRhaW5lcikpIHJldHVybiBudWxsOyBcclxuXHR0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblx0dGhpcy5wcm9jZXNzU2hhZGVycygpO1xyXG5cdFxyXG5cdHRoaXMuaW1hZ2VzID0gW107XHJcblx0XHJcblx0dGhpcy5hY3RpdmUgPSB0cnVlO1xyXG5cdHRoaXMubGlnaHQgPSAwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYkdMO1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBzY2FsZSA9IFV0aWxzLiQkKFwiZGl2R2FtZVwiKS5vZmZzZXRIZWlnaHQgLyBzaXplLmI7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gc2l6ZS5hO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzaXplLmI7XHJcblx0Y2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG5cdGNhbnZhcy5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuXHRcclxuXHRpZiAoIWNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpKXtcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiKTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpO1xyXG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdFByb3BlcnRpZXMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcclxuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcblx0Z2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKCBnbC5CTEVORCApO1xyXG5cdGdsLmJsZW5kRXF1YXRpb24oIGdsLkZVTkNfQUREICk7XHJcblx0Z2wuYmxlbmRGdW5jKCBnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEgKTtcclxuXHRcclxuXHR0aGlzLmFzcGVjdFJhdGlvID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcblx0dGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCA9IE1hdHJpeC5tYWtlUGVyc3BlY3RpdmUoNDUsIHRoaXMuYXNwZWN0UmF0aW8sIDAuMDAyLCA1LjApO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnByb2Nlc3NTaGFkZXJzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBDb21waWxlIGZyYWdtZW50IHNoYWRlclxyXG5cdHZhciBlbFNoYWRlciA9IFV0aWxzLiQkKFwiZnJhZ21lbnRTaGFkZXJcIik7XHJcblx0dmFyIGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciBmU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XHJcblx0Z2wuc2hhZGVyU291cmNlKGZTaGFkZXIsIGNvZGUpO1xyXG5cdGdsLmNvbXBpbGVTaGFkZXIoZlNoYWRlcik7XHJcblx0XHJcblx0Ly8gQ29tcGlsZSB2ZXJ0ZXggc2hhZGVyXHJcblx0ZWxTaGFkZXIgPSBVdGlscy4kJChcInZlcnRleFNoYWRlclwiKTtcclxuXHRjb2RlID0gdGhpcy5nZXRTaGFkZXJDb2RlKGVsU2hhZGVyKTtcclxuXHR2YXIgdlNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UodlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcih2U2hhZGVyKTtcclxuXHRcclxuXHQvLyBDcmVhdGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblx0dGhpcy5zaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIGZTaGFkZXIpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sIHZTaGFkZXIpO1xyXG5cdGdsLmxpbmtQcm9ncmFtKHRoaXMuc2hhZGVyUHJvZ3JhbSk7XHJcblx0XHJcblx0aWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcblx0XHRhbGVydChcIkVycm9yIGluaXRpYWxpemluZyB0aGUgc2hhZGVyIHByb2dyYW1cIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG4gIFxyXG5cdGdsLnVzZVByb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHQvLyBHZXQgYXR0cmlidXRlIGxvY2F0aW9uc1xyXG5cdHRoaXMuYVZlcnRleFBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFWZXJ0ZXhQb3NpdGlvblwiKTtcclxuXHR0aGlzLmFUZXh0dXJlQ29vcmQgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVRleHR1cmVDb29yZFwiKTtcclxuXHR0aGlzLmFWZXJ0ZXhJc0RhcmsgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleElzRGFya1wiKTtcclxuXHRcclxuXHQvLyBFbmFibGUgYXR0cmlidXRlc1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleFBvc2l0aW9uKTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFUZXh0dXJlQ29vcmQpO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVZlcnRleElzRGFyayk7XHJcblx0XHJcblx0Ly8gR2V0IHRoZSB1bmlmb3JtIGxvY2F0aW9uc1xyXG5cdHRoaXMudVNhbXBsZXIgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVTYW1wbGVyXCIpO1xyXG5cdHRoaXMudVRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1VHJhbnNmb3JtYXRpb25NYXRyaXhcIik7XHJcblx0dGhpcy51UGVyc3BlY3RpdmVNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQZXJzcGVjdGl2ZU1hdHJpeFwiKTtcclxuXHR0aGlzLnVQYWludEluUmVkID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1UGFpbnRJblJlZFwiKTtcclxuXHR0aGlzLnVMaWdodERlcHRoID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1TGlnaHREZXB0aFwiKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5nZXRTaGFkZXJDb2RlID0gZnVuY3Rpb24oc2hhZGVyKXtcclxuXHR2YXIgY29kZSA9IFwiXCI7XHJcblx0dmFyIG5vZGUgPSBzaGFkZXIuZmlyc3RDaGlsZDtcclxuXHR2YXIgdG4gPSBub2RlLlRFWFRfTk9ERTtcclxuXHRcclxuXHR3aGlsZSAobm9kZSl7XHJcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PSB0bilcclxuXHRcdFx0Y29kZSArPSBub2RlLnRleHRDb250ZW50O1xyXG5cdFx0bm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBjb2RlO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uKHNyYywgbWFrZUl0VGV4dHVyZSwgdGV4dHVyZUluZGV4LCBpc1NvbGlkLCBwYXJhbXMpe1xyXG5cdGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcclxuXHRpZiAoIXBhcmFtcy5pbWdOdW0pIHBhcmFtcy5pbWdOdW0gPSAxO1xyXG5cdGlmICghcGFyYW1zLmltZ1ZOdW0pIHBhcmFtcy5pbWdWTnVtID0gMTtcclxuXHRpZiAoIXBhcmFtcy54T3JpZykgcGFyYW1zLnhPcmlnID0gMDtcclxuXHRpZiAoIXBhcmFtcy55T3JpZykgcGFyYW1zLnlPcmlnID0gMDtcclxuXHRcclxuXHR2YXIgZ2wgPSB0aGlzO1xyXG5cdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcclxuXHRpbWcuc3JjID0gc3JjO1xyXG5cdGltZy5yZWFkeSA9IGZhbHNlO1xyXG5cdGltZy50ZXh0dXJlID0gbnVsbDtcclxuXHRpbWcudGV4dHVyZUluZGV4ID0gdGV4dHVyZUluZGV4O1xyXG5cdGltZy5pc1NvbGlkID0gKGlzU29saWQgPT09IHRydWUpO1xyXG5cdGltZy5pbWdOdW0gPSBwYXJhbXMuaW1nTnVtO1xyXG5cdGltZy52SW1nTnVtID0gcGFyYW1zLmltZ1ZOdW07XHJcblx0aW1nLnhPcmlnID0gcGFyYW1zLnhPcmlnO1xyXG5cdGltZy55T3JpZyA9IHBhcmFtcy55T3JpZztcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChpbWcsIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdFx0aW1nLmltZ1dpZHRoID0gaW1nLndpZHRoIC8gaW1nLmltZ051bTtcclxuXHRcdGltZy5pbWdIZWlnaHQgPSBpbWcuaGVpZ2h0IC8gaW1nLnZJbWdOdW07XHJcblx0XHRpbWcucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobWFrZUl0VGV4dHVyZSl7XHJcblx0XHRcdGltZy50ZXh0dXJlID0gZ2wucGFyc2VUZXh0dXJlKGltZyk7XHJcblx0XHRcdGltZy50ZXh0dXJlLnRleHR1cmVJbmRleCA9IGltZy50ZXh0dXJlSW5kZXg7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0Z2wuaW1hZ2VzLnB1c2goaW1nKTtcclxuXHRyZXR1cm4gaW1nO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLnBhcnNlVGV4dHVyZSA9IGZ1bmN0aW9uKGltZyl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ3JlYXRlcyBhIHRleHR1cmUgaG9sZGVyIHRvIHdvcmsgd2l0aFxyXG5cdHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcclxuXHRcclxuXHQvLyBGbGlwIHZlcnRpY2FsIHRoZSB0ZXh0dXJlXHJcblx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblx0XHJcblx0Ly8gTG9hZCB0aGUgaW1hZ2UgZGF0YVxyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcclxuXHRcclxuXHQvLyBBc3NpZ24gcHJvcGVydGllcyBvZiBzY2FsaW5nXHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcclxuXHRcclxuXHQvLyBSZWxlYXNlcyB0aGUgdGV4dHVyZSBmcm9tIHRoZSB3b3Jrc3BhY2VcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcclxuXHRyZXR1cm4gdGV4O1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdmVydGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC52ZXJ0ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4UG9zaXRpb24sIG9iamVjdC52ZXJ0ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgdGV4dHVyZSBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFUZXh0dXJlQ29vcmQsIG9iamVjdC50ZXhCdWZmZXIuaXRlbVNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgZGFyayBidWZmZXIgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0aWYgKG9iamVjdC5kYXJrQnVmZmVyKXtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QuZGFya0J1ZmZlcik7XHJcblx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleElzRGFyaywgb2JqZWN0LmRhcmtCdWZmZXIuaXRlbVNpemUsIGdsLlVOU0lHTkVEX0JZVEUsIGZhbHNlLCAwLCAwKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gUGFpbnQgdGhlIG9iamVjdCBpbiByZWQgKFdoZW4gaHVydCBmb3IgZXhhbXBsZSlcclxuXHR2YXIgcmVkID0gKG9iamVjdC5wYWludEluUmVkKT8gMS4wIDogMC4wOyBcclxuXHRnbC51bmlmb3JtMWYodGhpcy51UGFpbnRJblJlZCwgcmVkKTtcclxuXHRcclxuXHQvLyBIb3cgbXVjaCBsaWdodCB0aGUgcGxheWVyIGNhc3RcclxuXHR2YXIgbGlnaHQgPSAodGhpcy5saWdodCA+IDApPyAwLjAgOiAxLjA7XHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudUxpZ2h0RGVwdGgsIGxpZ2h0KTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHRleHR1cmUgdG8gd29yayB3aXRoXHJcblx0Z2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblx0Z2wudW5pZm9ybTFpKHRoaXMudVNhbXBsZXIsIDApO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybSB0aGUgb2JqZWN0XHJcblx0dmFyIHRyYW5zZm9ybWF0aW9uTWF0cml4ID0gTWF0cml4Lm1ha2VUcmFuc2Zvcm0ob2JqZWN0LCBjYW1lcmEpO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGluZGljZXMgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgb2JqZWN0LmluZGljZXNCdWZmZXIpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgcGVyc3BlY3RpdmUgYW5kIHRyYW5zZm9ybWF0aW9uIG1hdHJpY2VzXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wZXJzcGVjdGl2ZU1hdHJpeCkpO1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRyYW5zZm9ybWF0aW9uTWF0cml4KSk7XHJcblx0XHJcblx0aWYgKG9iamVjdC5ub1JvdGF0ZSkgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdC8vIERyYXcgdGhlIHRyaWFuZ2xlc1xyXG5cdGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIG9iamVjdC5pbmRpY2VzQnVmZmVyLm51bUl0ZW1zLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcblx0XHJcblx0Z2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuYXJlSW1hZ2VzUmVhZHkgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbWFnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoIXRoaXMuaW1hZ2VzW2ldLnJlYWR5KSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59OyJdfQ==
