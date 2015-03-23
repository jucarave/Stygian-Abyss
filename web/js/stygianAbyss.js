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
					w * ind, 1, w, h - 1,
					x, y, w, h - 1);
					
				x += this.charasWidth[ind] + 1;
			}else{
				x += w;
			}
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
			// 10 lines
			mm.addMessage("The boundless knownledge of the Codex is revealed unto thee.");
			mm.addMessage("A voice thunders!");
			mm.addMessage("Thou hast proven thyself to be truly good in nature");
			mm.addMessage("Thou must know that thy quest to become an Avatar is the endless ");
			mm.addMessage("quest of a lifetime.");
			mm.addMessage("Avatarhood is a living gift, It must always and forever be nurtured");
			mm.addMessage("to fluorish, for if thou dost stray from the paths of virtue, thy way");
			mm.addMessage("may be lost forever.");
			mm.addMessage("Return now unto thine our world, live there as an example to thy");
			mm.addMessage("people, as our memory of thy gallant deeds serves us.");
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
		staff: {name: "Staff", tex: "items", subImg: 2, viewPortImg: 1, type: 'weapon', str: '4D4', wear: 0.02},
		dagger: {name: "Dagger", tex: "items", subImg: 3, viewPortImg: 2, type: 'weapon', str: '3D8', wear: 0.05},
		sling: {name: "Sling", tex: "items", subImg: 4, type: 'weapon', str: '4D8', ranged: true, subItemName: 'rock', wear: 0.04},
		mace: {name: "Mace", tex: "items", subImg: 5, viewPortImg: 3, type: 'weapon', str: '10D4', wear: 0.03},
		axe: {name: "Axe", tex: "items", subImg: 6, viewPortImg: 4, type: 'weapon', str: '12D4', wear: 0.01},
		sword: {name: "Sword", tex: "items", subImg: 8, viewPortImg: 0, type: 'weapon', str: '16D4', wear: 0.008},
		mysticSword: {name: "Mystic Sword", tex: "items", subImg: 9, viewPortImg: 5, type: 'weapon', str: '16D16', wear: 0.008},
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
		codex: {name: "Codex of Ultimate Wisdom", tex: "itemsMisc", subImg: 0, type: 'codex'},
		
		// Temp: Dungeon features as items
		orb: {name: "Orb", tex: "itemsMisc", subImg: 1, type: 'feature'},
		deadTree: {name: "Dead Tree", tex: "itemsMisc", subImg: 2, type: 'feature'},
		tree: {name: "Tree", tex: "itemsMisc", subImg: 3, type: 'feature'},
		statue: {name: "Statue", tex: "itemsMisc", subImg: 4, type: 'feature'},
		signPost: {name: "Signpost", tex: "itemsMisc", subImg: 5, type: 'feature'},
		well: {name: "Well", tex: "itemsMisc", subImg: 6, type: 'feature'},
		smallSign: {name: "Sign", tex: "itemsMisc", subImg: 7, type: 'feature'},
		lamp: {name: "Lamp", tex: "itemsMisc", subImg: 8, type: 'feature'},
		flame: {name: "Flame", tex: "itemsMisc", subImg: 9, type: 'feature'},
		campfire: {name: "Campfire", tex: "itemsMisc", subImg: 10, type: 'feature'},
		altar: {name: "Altar", tex: "itemsMisc", subImg: 11, type: 'feature'},
		prisonerThing: {name: "Shackles", tex: "itemsMisc", subImg: 12, type: 'feature'},
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
	var generatedLevel = generator.generateLevel(depth);
	
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
	console.log(direction);
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
			floorDepth: this.game.floorDepth
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
}

module.exports = TitleScreen;

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		if (this.game.saveManager.restoreGame(this.game)){
			this.game.printWelcomeBack();
			this.game.loadMap(this.game.player.currentMap, this.game.player.currentDepth);
		} else {
			this.game.scene = new SelectClass(this.game);
		}
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
				w * ind, 1, w, h - 1,
				x, y, w, h - 1);
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
};

Underworld.prototype.loadMusicPost = function(){
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
	this.objectTex.items.buffers = AnimatedTexture.getTextureBufferCoords(8, 2, this.GL.ctx);
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
	// Shows a welcome message with the game instructions.
	this.console.addSFMessage("You enter the legendary Stygian Abyss.");
	this.console.addSFMessage("Use Q-W-E to move forward, A-S-D to strafe and step back");
	this.console.addSFMessage("Press Space bar to interact and Enter to attack");
	this.console.addSFMessage("Press T to drop objects and O to Save your game");
};

Underworld.prototype.printWelcomeBack = function(){
	this.console.addSFMessage("");
	this.console.addSFMessage("");
	this.console.addSFMessage("");
	this.console.addSFMessage("You wake up.");
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
	this.UI.drawText('Level '+this.floorDepth, 10,24,this.console);
	this.UI.drawText(this.player.className, 10,31,this.console);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZW15LmpzIiwianNcXEVuZW15RmFjdG9yeS5qcyIsImpzXFxJbnZlbnRvcnkuanMiLCJqc1xcSXRlbS5qcyIsImpzXFxJdGVtRmFjdG9yeS5qcyIsImpzXFxNYXBBc3NlbWJsZXIuanMiLCJqc1xcTWFwTWFuYWdlci5qcyIsImpzXFxNYXRyaXguanMiLCJqc1xcTWlzc2lsZS5qcyIsImpzXFxPYmplY3RGYWN0b3J5LmpzIiwianNcXFBsYXllci5qcyIsImpzXFxQbGF5ZXJTdGF0cy5qcyIsImpzXFxTYXZlTWFuYWdlci5qcyIsImpzXFxTZWxlY3RDbGFzcy5qcyIsImpzXFxTdGFpcnMuanMiLCJqc1xcU3RvcmFnZS5qcyIsImpzXFxUaXRsZVNjcmVlbi5qcyIsImpzXFxVSS5qcyIsImpzXFxVbmRlcndvcmxkLmpzIiwianNcXFV0aWxzLmpzIiwianNcXFdlYkdMLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XzFGcmFtZTogW10sXHJcblx0XzJGcmFtZXM6IFtdLFxyXG5cdF8zRnJhbWVzOiBbXSxcclxuXHRfNEZyYW1lczogW10sXHJcblx0aXRlbUNvb3JkczogW10sXHJcblx0XHJcblx0aW5pdDogZnVuY3Rpb24oZ2wpe1xyXG5cdFx0Ly8gMSBGcmFtZVxyXG5cdFx0dmFyIGNvb3JkcyA9IFsxLjAsMS4wLDAuMCwxLjAsMS4wLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzFGcmFtZS5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRcclxuXHRcdC8vIDIgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMDAsMS4wMCwwLjUwLDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0Y29vcmRzID0gWzEuMDAsMS4wMCwwLjUwLDEuMDAsMS4wMCwwLjAwLDAuNTAsMC4wMF07XHJcblx0XHR0aGlzLl8yRnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMyBGcmFtZXMsIDQgRnJhbWVzXHJcblx0XHRjb29yZHMgPSBbMC4yNSwxLjAwLDAuMDAsMS4wMCwwLjI1LDAuMDAsMC4wMCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC41MCwxLjAwLDAuMjUsMS4wMCwwLjUwLDAuMDAsMC4yNSwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMC43NSwxLjAwLDAuNTAsMS4wMCwwLjc1LDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzNGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNzUsMS4wMCwxLjAwLDAuMDAsMC43NSwwLjAwXTtcclxuXHRcdHRoaXMuXzRGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdH0sXHJcblx0XHJcblx0cHJlcGFyZUJ1ZmZlcjogZnVuY3Rpb24oY29vcmRzLCBnbCl7XHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGNvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGNvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gdGV4QnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0QnlOdW1GcmFtZXM6IGZ1bmN0aW9uKG51bUZyYW1lcyl7XHJcblx0XHRpZiAobnVtRnJhbWVzID09IDEpIHJldHVybiB0aGlzLl8xRnJhbWU7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMikgcmV0dXJuIHRoaXMuXzJGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMykgcmV0dXJuIHRoaXMuXzNGcmFtZXM7IGVsc2VcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gNCkgcmV0dXJuIHRoaXMuXzRGcmFtZXM7XHJcblx0fSxcclxuXHRcclxuXHRnZXRUZXh0dXJlQnVmZmVyQ29vcmRzOiBmdW5jdGlvbih4SW1nTnVtLCB5SW1nTnVtLCBnbCl7XHJcblx0XHR2YXIgcmV0ID0gW107XHJcblx0XHR2YXIgd2lkdGggPSAxIC8geEltZ051bTtcclxuXHRcdHZhciBoZWlnaHQgPSAxIC8geUltZ051bTtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaT0wO2k8eUltZ051bTtpKyspe1xyXG5cdFx0XHRmb3IgKHZhciBqPTA7ajx4SW1nTnVtO2orKyl7XHJcblx0XHRcdFx0dmFyIHgxID0gaiAqIHdpZHRoO1xyXG5cdFx0XHRcdHZhciB5MSA9IDEgLSBpICogaGVpZ2h0IC0gaGVpZ2h0O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB4MiA9IHgxICsgd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkyID0geTEgKyBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGNvb3JkcyA9IFt4Mix5Mix4MSx5Mix4Mix5MSx4MSx5MV07XHJcblx0XHRcdFx0cmV0LnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufTtcclxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5mdW5jdGlvbiBBdWRpb0FQSSgpe1xyXG5cdHRoaXMuX2F1ZGlvID0gW107XHJcblx0XHJcblx0dGhpcy5hdWRpb0N0eCA9IG51bGw7XHJcblx0dGhpcy5nYWluTm9kZSA9IG51bGw7XHJcblx0dGhpcy5tdXRlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuaW5pdEF1ZGlvRW5naW5lKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXVkaW9BUEk7XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUuaW5pdEF1ZGlvRW5naW5lID0gZnVuY3Rpb24oKXtcclxuXHRpZiAod2luZG93LkF1ZGlvQ29udGV4dCl7XHJcblx0XHR0aGlzLmF1ZGlvQ3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdFx0dGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdH1lbHNlXHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhlIEF1ZGlvIEFQSVwiKTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5sb2FkQXVkaW8gPSBmdW5jdGlvbih1cmwsIGlzTXVzaWMpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghZW5nLmF1ZGlvQ3R4KSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR2YXIgYXVkaW8gPSB7YnVmZmVyOiBudWxsLCBzb3VyY2U6IG51bGwsIHJlYWR5OiBmYWxzZSwgaXNNdXNpYzogaXNNdXNpYywgcGF1c2VkQXQ6IDB9O1xyXG5cdFxyXG5cdHZhciBodHRwID0gVXRpbHMuZ2V0SHR0cCgpO1xyXG5cdGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuXHRodHRwLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcblx0XHJcblx0aHR0cC5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0ZW5nLmF1ZGlvQ3R4LmRlY29kZUF1ZGlvRGF0YShodHRwLnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpe1xyXG5cdFx0XHRhdWRpby5idWZmZXIgPSBidWZmZXI7XHJcblx0XHRcdGF1ZGlvLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdH0sIGZ1bmN0aW9uKG1zZyl7XHJcblx0XHRcdGFsZXJ0KG1zZyk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cdFxyXG5cdGh0dHAuc2VuZCgpO1xyXG5cdFxyXG5cdHRoaXMuX2F1ZGlvLnB1c2goYXVkaW8pO1xyXG5cdFxyXG5cdHJldHVybiBhdWRpbztcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5fYXVkaW8ubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYXVkaW8gPSB0aGlzLl9hdWRpb1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKGF1ZGlvLnRpbWVPKXtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KGF1ZGlvLnRpbWVPKTtcclxuXHRcdH1lbHNlIGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZS5zdG9wKCk7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSwgdm9sdW1lKXtcclxuXHR2YXIgZW5nID0gdGhpcztcclxuXHRpZiAoIXNvdW5kRmlsZSB8fCAhc291bmRGaWxlLnJlYWR5KXtcclxuXHRcdGlmICh0cnlJZk5vdFJlYWR5KXsgc291bmRGaWxlLnRpbWVPID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBlbmcucGxheVNvdW5kKHNvdW5kRmlsZSwgbG9vcCwgdHJ5SWZOb3RSZWFkeSk7IH0sIDEwMDApOyB9IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoc291bmRGaWxlLmlzTXVzaWMpIHRoaXMuc3RvcE11c2ljKCk7XHJcblx0XHJcblx0c291bmRGaWxlLnRpbWVPID0gbnVsbDtcclxuXHRzb3VuZEZpbGUucGxheWluZyA9IHRydWU7XHJcblx0IFxyXG5cdHZhciBzb3VyY2UgPSBlbmcuYXVkaW9DdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcblx0c291cmNlLmJ1ZmZlciA9IHNvdW5kRmlsZS5idWZmZXI7XHJcblx0XHJcblx0dmFyIGdhaW5Ob2RlO1xyXG5cdGlmICh2b2x1bWUgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRnYWluTm9kZSA9IHRoaXMuYXVkaW9DdHguY3JlYXRlR2FpbigpO1xyXG5cdFx0Z2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZvbHVtZTtcclxuXHRcdHNvdW5kRmlsZS52b2x1bWUgPSB2b2x1bWU7XHJcblx0fWVsc2V7XHJcblx0XHRnYWluTm9kZSA9IGVuZy5nYWluTm9kZTtcclxuXHR9XHJcblx0XHJcblx0c291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xyXG5cdGdhaW5Ob2RlLmNvbm5lY3QoZW5nLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcclxuXHRcclxuXHRpZiAoc291bmRGaWxlLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCkgLSBzb3VuZEZpbGUucGF1c2VkQXQ7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCwgKHNvdW5kRmlsZS5wYXVzZWRBdCAvIDEwMDApICUgc291bmRGaWxlLmJ1ZmZlci5kdXJhdGlvbik7XHJcblx0XHRzb3VuZEZpbGUucGF1c2VkQXQgPSAwO1xyXG5cdH1lbHNle1xyXG5cdFx0c291bmRGaWxlLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcblx0XHRzb3VyY2Uuc3RhcnQoMCk7XHJcblx0fVxyXG5cdHNvdXJjZS5sb29wID0gbG9vcDtcclxuXHRzb3VyY2UubG9vcGluZyA9IGxvb3A7XHJcblx0c291cmNlLm9uZW5kZWQgPSBmdW5jdGlvbigpeyBzb3VuZEZpbGUucGxheWluZyA9IGZhbHNlOyB9O1xyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUuaXNNdXNpYylcclxuXHRcdHNvdW5kRmlsZS5zb3VyY2UgPSBzb3VyY2U7XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGF1c2VNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRhdWRpby5wYXVzZWRBdCA9IDA7XHJcblx0XHRpZiAoYXVkaW8uaXNNdXNpYyAmJiBhdWRpby5zb3VyY2Upe1xyXG5cdFx0XHRhdWRpby53YXNQbGF5aW5nID0gYXVkaW8ucGxheWluZztcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8ucGF1c2VkQXQgPSAoRGF0ZS5ub3coKSAtIGF1ZGlvLnN0YXJ0ZWRBdCk7XHJcblx0XHRcdGF1ZGlvLnJlc3RvcmVMb29wID0gYXVkaW8uc291cmNlLmxvb3A7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnJlc3RvcmVNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoIWF1ZGlvLmxvb3BpbmcgJiYgIWF1ZGlvLndhc1BsYXlpbmcpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlICYmIGF1ZGlvLnBhdXNlZEF0ICE9IDApe1xyXG5cdFx0XHRhdWRpby5zb3VyY2UgPSBudWxsO1xyXG5cdFx0XHR0aGlzLnBsYXlTb3VuZChhdWRpbywgYXVkaW8ucmVzdG9yZUxvb3AsIHRydWUsIGF1ZGlvLnZvbHVtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy5tdXRlZCl7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5tdXRlZCA9IHRydWU7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxO1xyXG5cdH1cclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5hcmVTb3VuZHNSZWFkeSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICghdGhpcy5fYXVkaW9baV0ucmVhZHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07IiwidmFyIEFuaW1hdGVkVGV4dHVyZSA9IHJlcXVpcmUoJy4vQW5pbWF0ZWRUZXh0dXJlJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5mdW5jdGlvbiBCaWxsYm9hcmQocG9zaXRpb24sIHRleHR1cmVDb2RlLCBtYXBNYW5hZ2VyLCBwYXJhbXMpe1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZCA9IG51bGw7XHJcblx0dGhpcy50ZXh0dXJlQ29vcmRzID0gbnVsbDtcclxuXHR0aGlzLm51bUZyYW1lcyA9IDE7XHJcblx0dGhpcy5pbWdTcGQgPSAwO1xyXG5cdHRoaXMuaW1nSW5kID0gMDtcclxuXHR0aGlzLmFjdGlvbnMgPSBudWxsO1xyXG5cdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLmNpcmNsZUZyYW1lSW5kZXggPSAwO1xyXG5cdFxyXG5cdGlmIChwYXJhbXMpIHRoaXMucGFyc2VQYXJhbXMocGFyYW1zKTtcclxuXHRpZiAodGV4dHVyZUNvZGUgPT0gXCJub25lXCIpIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJpbGxib2FyZDtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUucGFyc2VQYXJhbXMgPSBmdW5jdGlvbihwYXJhbXMpe1xyXG5cdGZvciAodmFyIGkgaW4gcGFyYW1zKXtcclxuXHRcdHZhciBwID0gcGFyYW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaSA9PSBcIm5mXCIpeyAvLyBOdW1iZXIgb2YgZnJhbWVzXHJcblx0XHRcdHRoaXMubnVtRnJhbWVzID0gcDtcclxuXHRcdFx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKHApO1xyXG5cdFx0fWVsc2UgaWYgKGkgPT0gXCJpc1wiKXsgLy8gSW1hZ2Ugc3BlZWRcclxuXHRcdFx0dGhpcy5pbWdTcGQgPSBwO1xyXG5cdFx0fWVsc2UgaWYgKGkgPT0gXCJjYlwiKXsgLy8gQ3VzdG9tIGJpbGxib2FyZFxyXG5cdFx0XHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHAsIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdFx0fWVsc2UgaWYgKGkgPT0gXCJhY1wiKXsgLy8gQWN0aW9uc1xyXG5cdFx0XHR0aGlzLmFjdGlvbnMgPSBwO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5hY3Rpb25zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGFjID0gdGhpcy5hY3Rpb25zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoYWMgPT0gXCJ0dlwiKXsgLy8gVG9vZ2xlIHZpc2liaWxpdHlcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY3RfXCIpID09IDApeyAvLyBDaGFuZ2UgdGV4dHVyZVxyXG5cdFx0XHR0aGlzLnRleHR1cmVDb2RlID0gYWMucmVwbGFjZShcImN0X1wiLCBcIlwiKTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwibmZfXCIpID09IDApeyAvLyBOdW1iZXIgb2YgZnJhbWVzXHJcblx0XHRcdHZhciBuZiA9IHBhcnNlSW50KGFjLnJlcGxhY2UoXCJuZl9cIixcIlwiKSwgMTApO1xyXG5cdFx0XHR0aGlzLm51bUZyYW1lcyA9IG5mO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMobmYpO1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImNmX1wiKSA9PSAwKXsgLy8gQ2lyY2xlIGZyYW1lc1xyXG5cdFx0XHR2YXIgZnJhbWVzID0gYWMucmVwbGFjZShcImNmX1wiLFwiXCIpLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSBwYXJzZUludChmcmFtZXNbdGhpcy5jaXJjbGVGcmFtZUluZGV4XSwgMTApO1xyXG5cdFx0XHRpZiAodGhpcy5jaXJjbGVGcmFtZUluZGV4KysgPj0gZnJhbWVzLmxlbmd0aC0xKSB0aGlzLmNpcmNsZUZyYW1lSW5kZXggPSAwO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjd19cIikgPT0gMCl7IC8vIENpcmNsZSBmcmFtZXNcclxuXHRcdFx0dmFyIHRleHR1cmVJZCA9IHBhcnNlSW50KGFjLnJlcGxhY2UoXCJjd19cIixcIlwiKSwgMTApO1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuY2hhbmdlV2FsbFRleHR1cmUodGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMsIHRleHR1cmVJZCk7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcInVkX1wiKSA9PSAwKXsgLy8gVW5sb2NrIGRvb3JcclxuXHRcdFx0dmFyIHBvcyA9IGFjLnJlcGxhY2UoXCJ1ZF9cIiwgXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHR2YXIgZG9vciA9IHRoaXMubWFwTWFuYWdlci5nZXREb29yQXQocGFyc2VJbnQocG9zWzBdLCAxMCksIHBhcnNlSW50KHBvc1sxXSwgMTApLCBwYXJzZUludChwb3NbMl0sIDEwKSk7XHJcblx0XHRcdGlmIChkb29yKXsgXHJcblx0XHRcdFx0ZG9vci5sb2NrID0gbnVsbDtcclxuXHRcdFx0XHRkb29yLmFjdGl2YXRlKCk7XHJcblx0XHRcdH1cclxuXHRcdH1lbHNlIGlmIChhYyA9PSBcImRlc3Ryb3lcIil7IC8vIERlc3Ryb3kgdGhlIGJpbGxib2FyZFxyXG5cdFx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0XHRcdHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkJpbGxib2FyZC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmJpbGxib2FyZCAmJiB0aGlzLnRleHR1cmVDb29yZHMpe1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy50ZXh0dXJlQ29vcmRzWyh0aGlzLmltZ0luZCA8PCAwKV07XHJcblx0fVxyXG5cdFxyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMubnVtRnJhbWVzID4gMSl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5udW1GcmFtZXMpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBDb25zb2xlKC8qSW50Ki8gbWF4TWVzc2FnZXMsIC8qSW50Ki8gbGltaXQsIC8qSW50Ki8gc3BsaXRBdCwgIC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHR0aGlzLm1heE1lc3NhZ2VzID0gbWF4TWVzc2FnZXM7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLmxpbWl0ID0gbGltaXQ7XHJcblx0dGhpcy5zcGxpdEF0ID0gc3BsaXRBdDtcclxuXHRcclxuXHR0aGlzLnNwcml0ZUZvbnQgPSBudWxsO1xyXG5cdHRoaXMubGlzdE9mQ2hhcnMgPSBudWxsO1xyXG5cdHRoaXMuc2ZDb250ZXh0ID0gbnVsbDtcclxuXHR0aGlzLnNwYWNlQ2hhcnMgPSBudWxsO1xyXG5cdHRoaXMuc3BhY2VMaW5lcyA9IG51bGw7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uc29sZTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKC8qSW50Ki8geCwgLypJbnQqLyB5KXtcclxuXHR2YXIgcyA9IHRoaXMubWVzc2FnZXMubGVuZ3RoIC0gMTtcclxuXHR2YXIgY3R4ID0gdGhpcy5nYW1lLlVJLmN0eDtcclxuXHRcclxuXHRjdHguZHJhd0ltYWdlKHRoaXMuc2ZDb250ZXh0LmNhbnZhcywgeCwgeSk7XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5wYXJzZUZvbnQgPSBmdW5jdGlvbihzcHJpdGVGb250KXtcclxuXHR2YXIgY2hhcmFzV2lkdGggPSBbXTtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzcHJpdGVGb250LndpZHRoO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBzcHJpdGVGb250LmhlaWdodDtcclxuXHRcclxuXHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHRjdHguZHJhd0ltYWdlKHNwcml0ZUZvbnQsIDAsIDApO1xyXG5cdFxyXG5cdHZhciBpbWdEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLDAsY2FudmFzLndpZHRoLDEpO1xyXG5cdHZhciB3aWR0aCA9IDA7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbWdEYXRhLmRhdGEubGVuZ3RoO2k8bGVuO2krPTQpe1xyXG5cdFx0dmFyIHIgPSBpbWdEYXRhLmRhdGFbaV07XHJcblx0XHR2YXIgZyA9IGltZ0RhdGEuZGF0YVtpKzFdO1xyXG5cdFx0dmFyIGIgPSBpbWdEYXRhLmRhdGFbaSsyXTtcclxuXHRcdFxyXG5cdFx0aWYgKHIgPT0gMjU1ICYmIGcgPT0gMCAmJiBiID09IDI1NSl7XHJcblx0XHRcdHdpZHRoKys7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0aWYgKHdpZHRoICE9IDApe1xyXG5cdFx0XHRcdGNoYXJhc1dpZHRoLnB1c2god2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gY2hhcmFzV2lkdGg7XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5jcmVhdGVTcHJpdGVGb250ID0gZnVuY3Rpb24oLypJbWFnZSovIHNwcml0ZUZvbnQsIC8qU3RyaW5nKi8gY2hhcmFjdGVyc1VzZWQsIC8qSW50Ki8gdmVydGljYWxTcGFjZSl7XHJcblx0dGhpcy5zcHJpdGVGb250ID0gc3ByaXRlRm9udDtcclxuXHR0aGlzLmxpc3RPZkNoYXJzID0gY2hhcmFjdGVyc1VzZWQ7XHJcblx0dGhpcy5zcGFjZUxpbmVzID0gdmVydGljYWxTcGFjZTtcclxuXHRcclxuXHR0aGlzLmNoYXJhc1dpZHRoID0gdGhpcy5wYXJzZUZvbnQoc3ByaXRlRm9udCk7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0Y2FudmFzLndpZHRoID0gMTAwO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSAxMDA7XHJcblx0dGhpcy5zZkNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdHRoaXMuc2ZDb250ZXh0LmNhbnZhcyA9IGNhbnZhcztcclxuXHRcclxuXHR0aGlzLnNwYWNlQ2hhcnMgPSBzcHJpdGVGb250LndpZHRoIC8gY2hhcmFjdGVyc1VzZWQubGVuZ3RoO1xyXG59O1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUuZm9ybWF0VGV4dCA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gbWVzc2FnZSl7XHJcblx0dmFyIHR4dCA9IG1lc3NhZ2Uuc3BsaXQoXCIgXCIpO1xyXG5cdHZhciBsaW5lID0gXCJcIjtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10eHQubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgd29yZCA9IHR4dFtpXTtcclxuXHRcdGlmICgobGluZSArIFwiIFwiICsgd29yZCkubGVuZ3RoIDw9IHRoaXMuc3BsaXRBdCl7XHJcblx0XHRcdGlmIChsaW5lICE9IFwiXCIpIGxpbmUgKz0gXCIgXCI7XHJcblx0XHRcdGxpbmUgKz0gd29yZDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXQucHVzaChsaW5lKTtcclxuXHRcdFx0bGluZSA9IHdvcmQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldC5wdXNoKGxpbmUpO1xyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5hZGRTRk1lc3NhZ2UgPSBmdW5jdGlvbigvKlN0cmluZyovIG1lc3NhZ2Upe1xyXG5cdHZhciBtc2cgPSB0aGlzLmZvcm1hdFRleHQobWVzc2FnZSk7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1tc2cubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR0aGlzLm1lc3NhZ2VzLnB1c2gobXNnW2ldKTtcclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gdGhpcy5saW1pdCl7XHJcblx0XHR0aGlzLm1lc3NhZ2VzLnNwbGljZSgwLDEpO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgYyA9IHRoaXMuc2ZDb250ZXh0LmNhbnZhcztcclxuXHR2YXIgdyA9IHRoaXMuc3BhY2VDaGFycztcclxuXHR2YXIgaCA9IHRoaXMuc3ByaXRlRm9udC5oZWlnaHQ7XHJcblx0dGhpcy5zZkNvbnRleHQuY2xlYXJSZWN0KDAsMCxjLndpZHRoLGMuaGVpZ2h0KTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMubWVzc2FnZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXNnID0gdGhpcy5tZXNzYWdlc1tpXTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gKHRoaXMuc3BhY2VMaW5lcyAqIHRoaXMubGltaXQpIC0gdGhpcy5zcGFjZUxpbmVzICogKGxlbiAtIGkgLSAxKTtcclxuXHRcdFxyXG5cdFx0dmFyIG1XID0gbXNnLmxlbmd0aCAqIHc7XHJcblx0XHRpZiAobVcgPiBjLndpZHRoKSBjLndpZHRoID0gbVcgKyAoMiAqIHcpO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBqPTAsamxlbj1tc2cubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHR2YXIgY2hhcmEgPSBtc2cuY2hhckF0KGopO1xyXG5cdFx0XHR2YXIgaW5kID0gdGhpcy5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHRcdHRoaXMuc2ZDb250ZXh0LmRyYXdJbWFnZSh0aGlzLnNwcml0ZUZvbnQsXHJcblx0XHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHRcdHgsIHksIHcsIGggLSAxKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdHggKz0gdGhpcy5jaGFyYXNXaWR0aFtpbmRdICsgMTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0eCArPSB3O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJmdW5jdGlvbiBEb29yKG1hcE1hbmFnZXIsIHdhbGxQb3NpdGlvbiwgZGlyLCB0ZXh0dXJlQ29kZSwgd2FsbFRleHR1cmUsIGxvY2spe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0dGhpcy53YWxsUG9zaXRpb24gPSB3YWxsUG9zaXRpb247XHJcblx0dGhpcy5yb3RhdGlvbiA9IDA7XHJcblx0dGhpcy5kaXIgPSBkaXI7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IHRleHR1cmVDb2RlO1xyXG5cdHRoaXMuclRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7IC8vIERlbGV0ZVxyXG5cclxuXHR0aGlzLmRvb3JQb3NpdGlvbiA9IHdhbGxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cdHRoaXMud2FsbFRleHR1cmUgPSB3YWxsVGV4dHVyZTtcclxuXHRcdFxyXG5cdHRoaXMuYm91bmRpbmdCb3ggPSBudWxsO1xyXG5cdHRoaXMucG9zaXRpb24gPSB3YWxsUG9zaXRpb24uY2xvbmUoKTtcclxuXHRpZiAoZGlyID09IFwiSFwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygtMC4yNSwgMC4wLCAwLjApKTsgfWVsc2VcclxuXHRpZiAoZGlyID09IFwiVlwiKXsgdGhpcy5wb3NpdGlvbi5zdW0odmVjMygwLjAsIDAuMCwgLTAuMjUpKTsgdGhpcy5yb3RhdGlvbiA9IE1hdGguUElfMjsgfVxyXG5cdFxyXG5cdHRoaXMubG9jayA9IGxvY2s7XHJcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xyXG5cdHRoaXMuYW5pbWF0aW9uID0gIDA7XHJcblx0dGhpcy5vcGVuU3BlZWQgPSBNYXRoLmRlZ1RvUmFkKDEwKTtcclxuXHRcclxuXHR0aGlzLm1vZGlmeUNvbGxpc2lvbigpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERvb3I7XHJcblxyXG5Eb29yLnByb3RvdHlwZS5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuYm91bmRpbmdCb3g7XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uICE9IDApIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5sb2NrKXtcclxuXHRcdHZhciBrZXkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0UGxheWVySXRlbSh0aGlzLmxvY2spO1xyXG5cdFx0aWYgKGtleSl7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGtleS5uYW1lICsgXCIgdXNlZFwiKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLnJlbW92ZVBsYXllckl0ZW0odGhpcy5sb2NrKTtcclxuXHRcdFx0dGhpcy5sb2NrID0gbnVsbDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkxvY2tlZFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5jbG9zZWQpIHRoaXMuYW5pbWF0aW9uID0gMTtcclxuXHRlbHNlIHRoaXMuYW5pbWF0aW9uID0gMjsgXHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gIT0gMCkgcmV0dXJuIHRydWU7XHJcblx0cmV0dXJuIHRoaXMuY2xvc2VkO1xyXG59O1xyXG5cclxuRG9vci5wcm90b3R5cGUubW9kaWZ5Q29sbGlzaW9uID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kaXIgPT0gXCJIXCIpe1xyXG5cdFx0aWYgKHRoaXMuY2xvc2VkKXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSAtIDAuMDUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuMSwgaDogMC41XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fWVsc2V7XHJcblx0XHRpZiAodGhpcy5jbG9zZWQpe1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSAtIDAuMDUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjEsIGg6IDAuNVxyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC41LCBoOiAwLjFcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgYW4xID0gKCh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiSFwiKSB8fCAodGhpcy5hbmltYXRpb24gPT0gMiAmJiB0aGlzLmRpciA9PSBcIlZcIikpO1xyXG5cdHZhciBhbjIgPSAoKHRoaXMuYW5pbWF0aW9uID09IDIgJiYgdGhpcy5kaXIgPT0gXCJIXCIpIHx8ICh0aGlzLmFuaW1hdGlvbiA9PSAxICYmIHRoaXMuZGlyID09IFwiVlwiKSk7XHJcblx0XHJcblx0aWYgKGFuMSAmJiB0aGlzLnJvdGF0aW9uIDwgTWF0aC5QSV8yKXtcclxuXHRcdHRoaXMucm90YXRpb24gKz0gdGhpcy5vcGVuU3BlZWQ7XHJcblx0XHRpZiAodGhpcy5yb3RhdGlvbiA+PSBNYXRoLlBJXzIpe1xyXG5cdFx0XHR0aGlzLnJvdGF0aW9uID0gTWF0aC5QSV8yO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIlZcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKGFuMiAmJiB0aGlzLnJvdGF0aW9uID4gMCl7XHJcblx0XHR0aGlzLnJvdGF0aW9uIC09IHRoaXMub3BlblNwZWVkO1xyXG5cdFx0aWYgKHRoaXMucm90YXRpb24gPD0gMCl7XHJcblx0XHRcdHRoaXMucm90YXRpb24gPSAwO1xyXG5cdFx0XHR0aGlzLmFuaW1hdGlvbiAgPSAwO1xyXG5cdFx0XHR0aGlzLmNsb3NlZCA9ICh0aGlzLmRpciA9PSBcIkhcIik7XHJcblx0XHRcdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICdiaWxsYm9hcmQnKTtcclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdFbmVteScsICd0ZXh0dXJlQ29vcmRzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdFbmVteScsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSkge1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIEVuZW15KCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdFbmVteScpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdFbmVteScsIEVuZW15KTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGVuZW15LCBtYXBNYW5hZ2VyKXtcclxuXHRpZiAoZW5lbXkuc3dpbSkgcG9zaXRpb24uYiAtPSAwLjI7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUJhc2UgPSBlbmVteS50ZXh0dXJlQmFzZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYW5pbWF0aW9uID0gXCJydW5cIjtcclxuXHR0aGlzLmVuZW15ID0gZW5lbXk7XHJcblx0dGhpcy50YXJnZXQgPSBmYWxzZTtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcygyKTtcclxuXHR0aGlzLm51bUZyYW1lcyA9IDI7XHJcblx0dGhpcy5pbWdTcGQgPSAxLzc7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5odXJ0ID0gMC4wO1xyXG5cdHRoaXMudGFyZ2V0WSA9IHBvc2l0aW9uLmI7XHJcblx0dGhpcy5zb2xpZCA9IHRydWU7XHJcblx0dGhpcy5zbGVlcCA9IDA7XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMC4wO1xyXG5cdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID0gMDtcclxuXHR0aGlzLnZpc2libGUgPSB0cnVlO1xyXG59XHJcblxyXG5FbmVteS5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdFxyXG5cdHRoaXMuZW5lbXkuaHAgLT0gZG1nO1xyXG5cdGlmICh0aGlzLmVuZW15LmhwIDw9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuYWRkRXhwZXJpZW5jZSh0aGlzLmVuZW15LnN0YXRzLmV4cCk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh0aGlzLmVuZW15Lm5hbWUgKyBcIiBraWxsZWRcIik7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmxvb2tGb3IgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdGlmICghcGxheWVyLm1vdmVkKSByZXR1cm47XHJcblx0dmFyIHAgPSBwbGF5ZXIucG9zaXRpb247XHJcblx0XHJcblx0dmFyIGR4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHR2YXIgZHogPSBNYXRoLmFicyhwLmMgLSB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdFxyXG5cdGlmICghdGhpcy50YXJnZXQgJiYgKGR4IDw9IDQgfHwgZHogPD0gNCkpe1xyXG5cdFx0Ly8gQ2FzdCBhIHJheSB0b3dhcmRzIHRoZSBwbGF5ZXIgdG8gY2hlY2sgaWYgaGUncyBvbiB0aGUgdmlzaW9uIG9mIHRoZSBjcmVhdHVyZVxyXG5cdFx0dmFyIHJ4ID0gdGhpcy5wb3NpdGlvbi5hO1xyXG5cdFx0dmFyIHJ5ID0gdGhpcy5wb3NpdGlvbi5jO1xyXG5cdFx0dmFyIGRpciA9IE1hdGguZ2V0QW5nbGUodGhpcy5wb3NpdGlvbiwgcCk7XHJcblx0XHR2YXIgZHggPSBNYXRoLmNvcyhkaXIpICogMC4zO1xyXG5cdFx0dmFyIGR5ID0gLU1hdGguc2luKGRpcikgKiAwLjM7XHJcblx0XHRcclxuXHRcdHZhciBzZWFyY2ggPSAxNTtcclxuXHRcdHdoaWxlIChzZWFyY2ggPiAwKXtcclxuXHRcdFx0cnggKz0gZHg7XHJcblx0XHRcdHJ5ICs9IGR5O1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGN4ID0gKHJ4IDw8IDApO1xyXG5cdFx0XHR2YXIgY3kgPSAocnkgPDwgMCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5tYXBNYW5hZ2VyLmlzU29saWQoY3gsIGN5LCAwKSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR2YXIgcHggPSAocC5hIDw8IDApO1xyXG5cdFx0XHRcdHZhciBweSA9IChwLmMgPDwgMCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGN4ID09IHB4ICYmIGN5ID09IHB5KXtcclxuXHRcdFx0XHRcdHRoaXMudGFyZ2V0ID0gdGhpcy5tYXBNYW5hZ2VyLnBsYXllcjtcclxuXHRcdFx0XHRcdHNlYXJjaCA9IDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRzZWFyY2ggLT0gMTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZG9WZXJ0aWNhbENoZWNrcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBvaW50WSA9IHRoaXMubWFwTWFuYWdlci5nZXRZRmxvb3IodGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMsIHRydWUpO1xyXG5cdGlmICh0aGlzLmVuZW15LnN0YXRzLmZseSAmJiBwb2ludFkgPCAwLjApIHBvaW50WSA9IHRoaXMucG9zaXRpb24uYjtcclxuXHRcclxuXHR2YXIgcHkgPSBNYXRoLmZsb29yKChwb2ludFkgLSB0aGlzLnBvc2l0aW9uLmIpICogMTAwKSAvIDEwMDtcclxuXHRpZiAocHkgPD0gMC4zKSB0aGlzLnRhcmdldFkgPSBwb2ludFk7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24oeFRvLCB6VG8pe1xyXG5cdHZhciBtb3ZlbWVudCA9IHZlYzIoeFRvLCB6VG8pO1xyXG5cdHZhciBzcGQgPSB2ZWMyKHhUbyAqIDEuNSwgMCk7XHJcblx0dmFyIGZha2VQb3MgPSB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcclxuXHRmb3IgKHZhciBpPTA7aTwyO2krKyl7XHJcblx0XHR2YXIgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldEJCb3hXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgMC4zKTtcclxuXHRcdGlmICghbm9ybWFsKXsgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHRoaXMpOyB9IFxyXG5cdFx0XHJcblx0XHRpZiAobm9ybWFsKXtcclxuXHRcdFx0bm9ybWFsID0gbm9ybWFsLmNsb25lKCk7XHJcblx0XHRcdHZhciBkaXN0ID0gbW92ZW1lbnQuZG90KG5vcm1hbCk7XHJcblx0XHRcdG5vcm1hbC5tdWx0aXBseSgtZGlzdCk7XHJcblx0XHRcdG1vdmVtZW50LnN1bShub3JtYWwpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmYWtlUG9zLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHNwZCA9IHZlYzIoMCwgelRvICogMS41KTtcclxuXHR9XHJcblx0XHJcblx0aWYgKG1vdmVtZW50LmEgIT0gMCB8fCBtb3ZlbWVudC5iICE9IDApe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5hICs9IG1vdmVtZW50LmE7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmMgKz0gbW92ZW1lbnQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKCF0aGlzLmVuZW15LnN0YXRzLmZseSAmJiAhdGhpcy5lbmVteS5zdGF0cy5zd2ltICYmIHRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5hIC09IG1vdmVtZW50LmE7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYyAtPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9ZWxzZSBpZiAodGhpcy5lbmVteS5zdGF0cy5zd2ltICYmICF0aGlzLm1hcE1hbmFnZXIuaXNXYXRlclBvc2l0aW9uKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKSl7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYSAtPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmMgLT0gbW92ZW1lbnQuYjtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmRvVmVydGljYWxDaGVja3MoKTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuYXR0YWNrUGxheWVyID0gZnVuY3Rpb24ocGxheWVyKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMC4wKSByZXR1cm47XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHRoaXMuZW5lbXkuc3RhdHMuc3RyKTtcclxuXHR2YXIgZGZzID0gVXRpbHMucm9sbERpY2UodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheWVyLnN0YXRzLmRmcyk7XHJcblx0XHJcblx0Ly8gQ2hlY2sgaWYgdGhlIHBsYXllciBoYXMgdGhlIHByb3RlY3Rpb24gc3BlbGxcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmdhbWUucHJvdGVjdGlvbiA+IDApe1xyXG5cdFx0ZGZzICs9IDE1O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgoc3RyIC0gZGZzLCAwKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShkbWcgKyBcIiBkYW1hZ2UgaW5mbGljdGVkXCIpO1xyXG5cdFx0cGxheWVyLnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDkwO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XHJcblx0dmFyIHAgPSBwbGF5ZXIucG9zaXRpb247XHJcblx0aWYgKHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID4gMCl7XHJcblx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciAtLTtcclxuXHRcdGlmICh0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9PSAwKXtcclxuXHRcdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdFx0dmFyIHl5ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcdFx0aWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0XHR0aGlzLmF0dGFja1BsYXllcihwbGF5ZXIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAodGhpcy50YXJnZXQpe1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMocC5hIC0gdGhpcy5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB5eSA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHRpZiAodGhpcy5hdHRhY2tXYWl0ID4gMCl7XHJcblx0XHRcdHRoaXMuYXR0YWNrV2FpdCAtLTtcclxuXHRcdH1cclxuXHRcdGlmICh4eCA8PSAxICYmIHl5IDw9MSl7XHJcblx0XHRcdGlmICh0aGlzLmF0dGFja1dhaXQgPT0gMCl7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UodGhpcy5lbmVteS5uYW1lICsgXCIgYXR0YWNrcyFcIik7XHJcblx0XHRcdFx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPSAxMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHh4ID4gMTAgfHwgeXkgPiAxMCl7XHJcblx0XHRcdHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgZGlyID0gTWF0aC5nZXRBbmdsZSh0aGlzLnBvc2l0aW9uLCBwKTtcclxuXHRcdHZhciBkeCA9IE1hdGguY29zKGRpcikgKiAwLjAyO1xyXG5cdFx0dmFyIGR5ID0gLU1hdGguc2luKGRpcikgKiAwLjAyO1xyXG5cdFx0XHJcblx0XHR2YXIgbGF0ID0gdmVjMihNYXRoLmNvcyhkaXIgKyBNYXRoLlBJXzIpLCAtTWF0aC5zaW4oZGlyICsgTWF0aC5QSV8yKSk7XHJcblx0XHRcclxuXHRcdHRoaXMubW92ZVRvKGR4LCBkeSwgbGF0KTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubG9va0ZvcigpO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5nZXRUZXh0dXJlQ29kZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGZhY2UgPSB0aGlzLmRpcmVjdGlvbjtcclxuXHR2YXIgYSA9IHRoaXMuYW5pbWF0aW9uO1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiA9PSBcInN0YW5kXCIpIGEgPSBcInJ1blwiO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLnRleHR1cmVCYXNlICsgXCJfXCIgKyBhO1xyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICghdGhpcy52aXNpYmxlKSByZXR1cm47XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5iaWxsYm9hcmQgJiYgdGhpcy50ZXh0dXJlQ29vcmRzKXtcclxuXHRcdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMudGV4dHVyZUNvb3Jkc1sodGhpcy5pbWdJbmQgPDwgMCldO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZC5wYWludEluUmVkID0gKHRoaXMuaHVydCA+IDApO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMuZ2V0VGV4dHVyZUNvZGUoKSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaHVydCA+IDApeyB0aGlzLmh1cnQgLT0gMTsgfVxyXG5cdGlmICh0aGlzLnNsZWVwID4gMCl7IHRoaXMuc2xlZXAgLT0gMTsgfVxyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0aWYgKGdhbWUucGF1c2VkIHx8IGdhbWUudGltZVN0b3AgPiAwIHx8IHRoaXMuc2xlZXAgPiAwKXtcclxuXHRcdHRoaXMuZHJhdygpOyBcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCAmJiB0aGlzLm51bUZyYW1lcyA+IDEpe1xyXG5cdFx0dGhpcy5pbWdJbmQgKz0gdGhpcy5pbWdTcGQ7XHJcblx0XHRpZiAoKHRoaXMuaW1nSW5kIDw8IDApID49IHRoaXMubnVtRnJhbWVzKXtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy50YXJnZXRZIDwgdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiAtPSAwLjE7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iIDw9IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1lbHNlIGlmICh0aGlzLnRhcmdldFkgPiB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iICs9IDAuMDg7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iID49IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0ZW5lbWllczoge1xyXG5cdFx0YmF0OiB7bmFtZTogJ0dpYW50IEJhdCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzFEOScsIGRmczogJzJEMicsIGV4cDogNCwgZmx5OiB0cnVlfX0sXHJcblx0XHRyYXQ6IHtuYW1lOiAnR2lhbnQgUmF0JywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ3JhdCcsIHN0YXRzOiB7c3RyOiAnMUQ5JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRzcGlkZXI6IHtuYW1lOiAnR2lhbnQgU3BpZGVyJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ3NwaWRlcicsIHN0YXRzOiB7c3RyOiAnMUQxMScsIGRmczogJzJEMicsIGV4cDogNX19LFxyXG5cdFx0Z3JlbWxpbjoge25hbWU6ICdHcmVtbGluJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2dyZW1saW4nLCBzdGF0czoge3N0cjogJzJEOScsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0c2tlbGV0b246IHtuYW1lOiAnU2tlbGV0b24nLCBocDogNDgsIHRleHR1cmVCYXNlOiAnc2tlbGV0b24nLCBzdGF0czoge3N0cjogJzNENCcsIGRmczogJzJEMicsIGV4cDogNH19LFxyXG5cdFx0aGVhZGxlc3M6IHtuYW1lOiAnSGVhZGxlc3MnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnaGVhZGxlc3MnLCBzdGF0czoge3N0cjogJzNENScsIGRmczogJzJEMicsIGV4cDogNX19LFxyXG5cdFx0Ly9uaXhpZToge25hbWU6ICdOaXhpZScsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzNENScsIGRmczogJzJEMicsIGV4cDogNX19LFx0XHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHR3aXNwOiB7bmFtZTogJ1dpc3AnLCBocDogNjQsIHRleHR1cmVCYXNlOiAnd2lzcCcsIHN0YXRzOiB7c3RyOiAnMkQxMCcsIGRmczogJzJEMicsIGV4cDogNX19LFxyXG5cdFx0Z2hvc3Q6IHtuYW1lOiAnR2hvc3QnLCBocDogODAsIHRleHR1cmVCYXNlOiAnZ2hvc3QnLCBzdGF0czoge3N0cjogJzJEMTUnLCBkZnM6ICcyRDInLCBleHA6IDYsIGZseTogdHJ1ZX19LFxyXG5cdFx0dHJvbGw6IHtuYW1lOiAnVHJvbGwnLCBocDogOTYsIHRleHR1cmVCYXNlOiAndHJvbGwnLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogN319LCAvLyBOb3QgdXNlZCBieSB0aGUgZ2VuZXJhdG9yP1xyXG5cdFx0bGF2YUxpemFyZDoge25hbWU6ICdMYXZhIExpemFyZCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdsYXZhTGl6YXJkJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdG1vbmdiYXQ6IHtuYW1lOiAnTW9uZ2JhdCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdtb25nYmF0Jywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDcsIGZseTogdHJ1ZX19LCBcclxuXHRcdG9jdG9wdXM6IHtuYW1lOiAnR2lhbnQgU3F1aWQnLCBocDogOTYsIHRleHR1cmVCYXNlOiAnb2N0b3B1cycsIHN0YXRzOiB7c3RyOiAnM0Q2JywgZGZzOiAnMkQyJywgZXhwOiA5LCBzd2ltOiB0cnVlfX0sXHJcblx0XHRkYWVtb246IHtuYW1lOiAnRGFlbW9uJywgaHA6IDExMiwgdGV4dHVyZUJhc2U6ICdkYWVtb24nLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogOH19LFxyXG5cdFx0Ly9waGFudG9tOiB7bmFtZTogJ1BoYW50b20nLCBocDogMTI4LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnMUQxNScsIGRmczogJzJEMicsIGV4cDogOX19LFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0c2VhU2VycGVudDoge25hbWU6ICdTZWEgU2VycGVudCcsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnc2VhU2VycGVudCcsIHN0YXRzOiB7c3RyOiAnM0Q2JywgZGZzOiAnMkQyJywgZXhwOiA5LCBzd2ltOiB0cnVlfX0sXHJcblx0XHRldmlsTWFnZToge25hbWU6ICdFdmlsIE1hZ2UnLCBocDogMTc2LCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzZENScsIGRmczogJzJEMicsIGV4cDogMTJ9fSwgLy9UT0RPOiBBZGQgdGV4dHVyZVxyXG5cdFx0bGljaGU6IHtuYW1lOiAnTGljaGUnLCBocDogMTkyLCB0ZXh0dXJlQmFzZTogJ2xpY2hlJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDEzfX0sXHJcblx0XHRoeWRyYToge25hbWU6ICdIeWRyYScsIGhwOiAyMDgsIHRleHR1cmVCYXNlOiAnaHlkcmEnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTR9fSxcclxuXHRcdGRyYWdvbjoge25hbWU6ICdEcmFnb24nLCBocDogMjI0LCB0ZXh0dXJlQmFzZTogJ2RyYWdvbicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNSwgZmx5OiB0cnVlfX0sXHRcdFx0XHQvLyBOb3Qgc3VpdGFibGVcclxuXHRcdHpvcm46IHtuYW1lOiAnWm9ybicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnem9ybicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0Z2F6ZXI6IHtuYW1lOiAnR2F6ZXInLCBocDogMjQwLCB0ZXh0dXJlQmFzZTogJ2dhemVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2LCBmbHk6IHRydWV9fSxcclxuXHRcdHJlYXBlcjoge25hbWU6ICdSZWFwZXInLCBocDogMjU1LCB0ZXh0dXJlQmFzZTogJ3JlYXBlcicsIHN0YXRzOiB7c3RyOiAnNUQ4JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0YmFscm9uOiB7bmFtZTogJ0JhbHJvbicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAnYmFscm9uJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHQvL3R3aXN0ZXI6IHtuYW1lOiAnVHdpc3RlcicsIGhwOiAyNSwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzREMicsIGRmczogJzJEMicsIGV4cDogNX19LFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0XHJcblx0XHR3YXJyaW9yOiB7bmFtZTogJ0ZpZ2h0ZXInLCBocDogOTgsIHRleHR1cmVCYXNlOiAnZmlnaHRlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtYWdlOiB7bmFtZTogJ01hZ2UnLCBocDogMTEyLCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogOH19LFxyXG5cdFx0YmFyZDoge25hbWU6ICdCYXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2JhcmQnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdGRydWlkOiB7bmFtZTogJ0RydWlkJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzNENScsIGRmczogJzJEMicsIGV4cDogMTB9fSxcclxuXHRcdHRpbmtlcjoge25hbWU6ICdUaW5rZXInLCBocDogOTYsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcclxuXHRcdHBhbGFkaW46IHtuYW1lOiAnUGFsYWRpbicsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnZmlnaHRlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRzaGVwaGVyZDoge25hbWU6ICdTaGVwaGVyZCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzNEMycsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cmFuZ2VyOiB7bmFtZTogJ1JhbmdlcicsIGhwOiAxNDQsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDN9fVxyXG5cdH0sXHJcblx0XHJcblx0Z2V0RW5lbXk6IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0aWYgKCF0aGlzLmVuZW1pZXNbbmFtZV0pIHRocm93IFwiSW52YWxpZCBlbmVteSBuYW1lOiBcIiArIG5hbWU7XHJcblx0XHRcclxuXHRcdHZhciBlbmVteSA9IHRoaXMuZW5lbWllc1tuYW1lXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGkgaW4gZW5lbXkpe1xyXG5cdFx0XHRyZXRbaV0gPSBlbmVteVtpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcbn07XHJcbiIsImZ1bmN0aW9uIEludmVudG9yeShsaW1pdEl0ZW1zKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0ludmVudG9yeScpO1xyXG5cdHRoaXMuaXRlbXMgPSBbXTtcclxuXHR0aGlzLmxpbWl0SXRlbXMgPSBsaW1pdEl0ZW1zO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEludmVudG9yeTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnSW52ZW50b3J5JywgSW52ZW50b3J5KTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaXRlbXMgPSBbXTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuYWRkSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PSB0aGlzLmxpbWl0SXRlbXMpe1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmVxdWlwSXRlbSA9IGZ1bmN0aW9uKGl0ZW1JZCl7XHJcblx0dmFyIHR5cGUgPSB0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdGVtLnR5cGUgPT0gdHlwZSl7XHJcblx0XHRcdGl0ZW0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0dGhpcy5pdGVtc1tpdGVtSWRdLmVxdWlwcGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0RXF1aXBwZWRJdGVtID0gZnVuY3Rpb24odHlwZSl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXRlbS50eXBlID09IHR5cGUgJiYgaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdHJldHVybiBpdGVtO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0V2VhcG9uID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5nZXRFcXVpcHBlZEl0ZW0oJ3dlYXBvbicpO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRBcm1vdXIgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmdldEVxdWlwcGVkSXRlbSgnYXJtb3VyJyk7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmRlc3Ryb3lJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0aXRlbS5zdGF0dXMgPSAwLjA7XHJcblx0aXRlbS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdCA9PT0gaXRlbSl7XHJcblx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGksIDEpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZHJvcEl0ZW0gPSBmdW5jdGlvbihpdGVtSWQpe1xyXG5cdGlmICh0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZSA9PSAnd2VhcG9uJyB8fCB0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHR0aGlzLml0ZW1zW2l0ZW1JZF0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHR9XHJcblx0dGhpcy5pdGVtcy5zcGxpY2UoaXRlbUlkLCAxKTtcclxufTtcclxuIiwidmFyIEJpbGxib2FyZCA9IHJlcXVpcmUoJy4vQmlsbGJvYXJkJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnSXRlbScsICdiaWxsYm9hcmQnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0l0ZW0nLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdhbWUuR0wuY3R4KTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG51bGw7XHJcblx0aWYgKG9iamVjdC5pdGVtKSB7XHJcblx0XHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4W29iamVjdC5pdGVtLnRleF0uYnVmZmVyc1tvYmplY3QuaXRlbS5zdWJJbWddO1xyXG5cdFx0b2JqZWN0LnRleHR1cmVDb2RlID0gb2JqZWN0Lml0ZW0udGV4O1xyXG5cdH1cclxufSk7XHRcclxuXHJcbmZ1bmN0aW9uIEl0ZW0oKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0l0ZW0nKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJdGVtO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdJdGVtJywgSXRlbSk7XHJcblxyXG5JdGVtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGl0ZW0sIG1hcE1hbmFnZXIpe1xyXG5cdHZhciBnbCA9IG1hcE1hbmFnZXIuZ2FtZS5HTC5jdHg7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMuaXRlbSA9IG51bGw7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG51bGw7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IG51bGw7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFxyXG5cdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XHJcblx0dGhpcy5zb2xpZCA9IGZhbHNlO1xyXG5cdFxyXG5cdGlmIChpdGVtKSB0aGlzLnNldEl0ZW0oaXRlbSk7XHJcbn07XHJcblxyXG5cclxuSXRlbS5wcm90b3R5cGUuc2V0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdHRoaXMuaXRlbSA9IGl0ZW07XHJcblx0XHJcblx0dGhpcy5zb2xpZCA9IGl0ZW0uc29saWQ7XHJcblx0dGhpcy5pbWdJbmQgPSB0aGlzLml0ZW0uc3ViSW1nO1xyXG5cdHRoaXMuaW1nU3BkID0gMDtcclxuXHRpZiAodGhpcy5pdGVtLmFuaW1hdGlvbkxlbmd0aCl7IHRoaXMuaW1nU3BkID0gMSAvIDY7IH1cclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXhbdGhpcy5pdGVtLnRleF0uYnVmZmVyc1t0aGlzLmltZ0luZF07XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IGl0ZW0udGV4O1xyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBtbSA9IHRoaXMubWFwTWFuYWdlcjtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmICh0aGlzLml0ZW0uaXNJdGVtKXtcclxuXHRcdGlmICh0aGlzLml0ZW0udHlwZSA9PSAnY29kZXgnKXtcclxuXHRcdFx0Ly8gMTAgbGluZXNcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlRoZSBib3VuZGxlc3Mga25vd25sZWRnZSBvZiB0aGUgQ29kZXggaXMgcmV2ZWFsZWQgdW50byB0aGVlLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkEgdm9pY2UgdGh1bmRlcnMhXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBoYXN0IHByb3ZlbiB0aHlzZWxmIHRvIGJlIHRydWx5IGdvb2QgaW4gbmF0dXJlXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBtdXN0IGtub3cgdGhhdCB0aHkgcXVlc3QgdG8gYmVjb21lIGFuIEF2YXRhciBpcyB0aGUgZW5kbGVzcyBcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJxdWVzdCBvZiBhIGxpZmV0aW1lLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIkF2YXRhcmhvb2QgaXMgYSBsaXZpbmcgZ2lmdCwgSXQgbXVzdCBhbHdheXMgYW5kIGZvcmV2ZXIgYmUgbnVydHVyZWRcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJ0byBmbHVvcmlzaCwgZm9yIGlmIHRob3UgZG9zdCBzdHJheSBmcm9tIHRoZSBwYXRocyBvZiB2aXJ0dWUsIHRoeSB3YXlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJtYXkgYmUgbG9zdCBmb3JldmVyLlwiKTtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlJldHVybiBub3cgdW50byB0aGluZSBvdXIgd29ybGQsIGxpdmUgdGhlcmUgYXMgYW4gZXhhbXBsZSB0byB0aHlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJwZW9wbGUsIGFzIG91ciBtZW1vcnkgb2YgdGh5IGdhbGxhbnQgZGVlZHMgc2VydmVzIHVzLlwiKTtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2ZlYXR1cmUnKXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBzZWUgYSBcIit0aGlzLml0ZW0ubmFtZSk7XHJcblx0XHR9IGVsc2UgaWYgKGdhbWUuYWRkSXRlbSh0aGlzLml0ZW0pKXtcclxuXHRcdFx0dmFyIHN0YXQgPSAnJztcclxuXHRcdFx0aWYgKHRoaXMuaXRlbS5zdGF0dXMgIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRzdGF0ID0gSXRlbUZhY3RvcnkuZ2V0U3RhdHVzTmFtZSh0aGlzLml0ZW0uc3RhdHVzKSArICcgJztcclxuXHRcdFx0XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2Uoc3RhdCArIHRoaXMuaXRlbS5uYW1lICsgXCIgcGlja2VkLlwiKTtcclxuXHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJZb3UgY2FuJ3QgY2FycnkgYW55IG1vcmUgaXRlbXNcIik7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwKXtcclxuXHRcdHZhciBpbmQgPSAodGhpcy5pbWdJbmQgPDwgMCk7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleFt0aGlzLml0ZW0udGV4XS5idWZmZXJzW2luZF07XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyKXtcclxuXHRcdFx0Y29uc29sZS5sb2codGhpcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuaW1nU3BkID4gMCAmJiB0aGlzLml0ZW0uYW5pbWF0aW9uTGVuZ3RoID4gMCl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5pdGVtLnN1YkltZyArIHRoaXMuaXRlbS5hbmltYXRpb25MZW5ndGggLSAxKXtcclxuXHRcdFx0dGhpcy5pbWdJbmQgPSB0aGlzLml0ZW0uc3ViSW1nO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGF1c2VkKXtcclxuXHRcdHRoaXMuZHJhdygpOyBcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0aXRlbXM6IHtcclxuXHRcdC8vIEl0ZW1zXHJcblx0XHR5ZWxsb3dQb3Rpb246IHtuYW1lOiBcIlllbGxvdyBwb3Rpb25cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMCwgdHlwZTogJ3BvdGlvbid9LFxyXG5cdFx0cmVkUG90aW9uOiB7bmFtZTogXCJSZWQgUG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdFxyXG5cdFx0Ly8gV2VhcG9uc1xyXG5cdFx0c3RhZmY6IHtuYW1lOiBcIlN0YWZmXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDIsIHZpZXdQb3J0SW1nOiAxLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNEQ0Jywgd2VhcjogMC4wMn0sXHJcblx0XHRkYWdnZXI6IHtuYW1lOiBcIkRhZ2dlclwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAzLCB2aWV3UG9ydEltZzogMiwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzNEOCcsIHdlYXI6IDAuMDV9LFxyXG5cdFx0c2xpbmc6IHtuYW1lOiBcIlNsaW5nXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDQsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICc0RDgnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAncm9jaycsIHdlYXI6IDAuMDR9LFxyXG5cdFx0bWFjZToge25hbWU6IFwiTWFjZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA1LCB2aWV3UG9ydEltZzogMywgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwRDQnLCB3ZWFyOiAwLjAzfSxcclxuXHRcdGF4ZToge25hbWU6IFwiQXhlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDYsIHZpZXdQb3J0SW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTJENCcsIHdlYXI6IDAuMDF9LFxyXG5cdFx0c3dvcmQ6IHtuYW1lOiBcIlN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDgsIHZpZXdQb3J0SW1nOiAwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTZENCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdG15c3RpY1N3b3JkOiB7bmFtZTogXCJNeXN0aWMgU3dvcmRcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogOSwgdmlld1BvcnRJbWc6IDUsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxNkQxNicsIHdlYXI6IDAuMDA4fSxcclxuXHRcdGJvdzoge25hbWU6IFwiQm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEwLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTBENCcsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdhcnJvdycsIHdlYXI6IDAuMDF9LFxyXG5cdFx0Y3Jvc3Nib3c6IHtuYW1lOiBcIkNyb3NzYm93XCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDExLCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTZENCcsIHJhbmdlZDogdHJ1ZSwgc3ViSXRlbU5hbWU6ICdjcm9zc2JvdyBib2x0Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHQvLyBBcm1vdXJcclxuXHRcdGxlYXRoZXI6IHtuYW1lOiBcIkxlYXRoZXIgYXJtb3VyXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMThEOCcsIHdlYXI6IDAuMDV9LFxyXG5cdFx0Y2hhaW46IHtuYW1lOiBcIkNoYWluIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTMsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcyMEQ4Jywgd2VhcjogMC4wM30sXHJcblx0XHRwbGF0ZToge25hbWU6IFwiUGxhdGUgbWFpbFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNCwgdHlwZTogJ2FybW91cicsIGRmczogJzIyRDgnLCB3ZWFyOiAwLjAxNX0sXHJcblx0XHRteXN0aWM6IHtuYW1lOiBcIk15c3RpYyBhcm1vdXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTUsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICczMUQ4Jywgd2VhcjogMC4wMDh9LFxyXG5cdFx0XHJcblx0XHQvLyBTcGVsbCBtaXhlc1xyXG5cdFx0Y3VyZToge25hbWU6IFwiU3BlbGxtaXggb2YgQ3VyZVwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMCwgdHlwZTogJ21hZ2ljJywgbWFuYTogNX0sXHJcblx0XHRoZWFsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBIZWFsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxMCwgcGVyY2VudDogMC4yfSxcclxuXHRcdGxpZ2h0OiB7bmFtZTogXCJTcGVsbG1peCBvZiBMaWdodFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMiwgdHlwZTogJ21hZ2ljJywgbWFuYTogNSwgbGlnaHRUaW1lOiAxMDAwfSxcclxuXHRcdG1pc3NpbGU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIG1hZ2ljIG1pc3NpbGVcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDMsIHR5cGU6ICdtYWdpYycsIHN0cjogJzMwRDUnLCBtYW5hOiA1fSxcclxuXHRcdGljZWJhbGw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEljZWJhbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDQsIHR5cGU6ICdtYWdpYycsIHN0cjogJzY1RDUnLCBtYW5hOiAyMH0sXHJcblx0XHRyZXBlbDoge25hbWU6IFwiU3BlbGxtaXggb2YgUmVwZWwgVW5kZWFkXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA1LCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxNX0sXHJcblx0XHRibGluazoge25hbWU6IFwiU3BlbGxtaXggb2YgQmxpbmtcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDYsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDE1fSxcclxuXHRcdGZpcmViYWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBGaXJlYmFsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNywgdHlwZTogJ21hZ2ljJywgc3RyOiAnMTAwRDUnLCBtYW5hOiAxNX0sXHJcblx0XHRwcm90ZWN0aW9uOiB7bmFtZTogXCJTcGVsbG1peCBvZiBwcm90ZWN0aW9uXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA4LCB0eXBlOiAnbWFnaWMnLCBwcm90VGltZTogNDAwLCBtYW5hOiAxNX0sXHJcblx0XHR0aW1lOiB7bmFtZTogXCJTcGVsbG1peCBvZiBUaW1lIFN0b3BcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDksIHR5cGU6ICdtYWdpYycsIHN0b3BUaW1lOiA2MDAsIG1hbmE6IDMwfSxcclxuXHRcdHNsZWVwOiB7bmFtZTogXCJTcGVsbG1peCBvZiBTbGVlcFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTAsIHR5cGU6ICdtYWdpYycsIHNsZWVwVGltZTogNDAwLCBtYW5hOiAxNX0sXHJcblx0XHRqaW54OiB7bmFtZTogXCJTcGVsbG1peCBvZiBKaW54XCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMzB9LFxyXG5cdFx0dHJlbW9yOiB7bmFtZTogXCJTcGVsbG1peCBvZiBUcmVtb3JcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEyLCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAzMH0sXHJcblx0XHRraWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBLaWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMywgdHlwZTogJ21hZ2ljJywgc3RyOiAnNDAwRDUnLCBtYW5hOiAyNX0sXHJcblx0XHRcclxuXHRcdC8vIENvZGV4XHJcblx0XHRjb2RleDoge25hbWU6IFwiQ29kZXggb2YgVWx0aW1hdGUgV2lzZG9tXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAwLCB0eXBlOiAnY29kZXgnfSxcclxuXHRcdFxyXG5cdFx0Ly8gVGVtcDogRHVuZ2VvbiBmZWF0dXJlcyBhcyBpdGVtc1xyXG5cdFx0b3JiOiB7bmFtZTogXCJPcmJcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRkZWFkVHJlZToge25hbWU6IFwiRGVhZCBUcmVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAyLCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0dHJlZToge25hbWU6IFwiVHJlZVwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMywgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHN0YXR1ZToge25hbWU6IFwiU3RhdHVlXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA0LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0c2lnblBvc3Q6IHtuYW1lOiBcIlNpZ25wb3N0XCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiA1LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0d2VsbDoge25hbWU6IFwiV2VsbFwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogNiwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHNtYWxsU2lnbjoge25hbWU6IFwiU2lnblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogNywgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGxhbXA6IHtuYW1lOiBcIkxhbXBcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDgsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRmbGFtZToge25hbWU6IFwiRmxhbWVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDksIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRjYW1wZmlyZToge25hbWU6IFwiQ2FtcGZpcmVcIiwgdGV4OiBcIml0ZW1zTWlzY1wiLCBzdWJJbWc6IDEwLCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0YWx0YXI6IHtuYW1lOiBcIkFsdGFyXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHByaXNvbmVyVGhpbmc6IHtuYW1lOiBcIlNoYWNrbGVzXCIsIHRleDogXCJpdGVtc01pc2NcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdGZvdW50YWluOiB7bmFtZTogXCJGb3VudGFpblwiLCB0ZXg6IFwiaXRlbXNNaXNjXCIsIHN1YkltZzogMTMsIGFuaW1hdGlvbkxlbmd0aDogNCwgdHlwZTogJ2ZlYXR1cmUnLCBzb2xpZDogdHJ1ZX1cclxuXHR9LFxyXG5cdFxyXG5cdGdldEl0ZW1CeUNvZGU6IGZ1bmN0aW9uKGl0ZW1Db2RlLCBzdGF0dXMpe1xyXG5cdFx0aWYgKCF0aGlzLml0ZW1zW2l0ZW1Db2RlXSkgdGhyb3cgXCJJbnZhbGlkIEl0ZW0gY29kZTogXCIgKyBpdGVtQ29kZTtcclxuXHRcdFxyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2l0ZW1Db2RlXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKCl7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZU1hcCA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTsgXHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVUZXJyYWluID0gZnVuY3Rpb24obWFwTWFuYWdlciwgR0wpe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9ICBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBNYW5hZ2VyLCBHTCk7IFxyXG5cdHRoaXMuYXNzZW1ibGVDZWlscyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUJsb2NrcyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZVNsb3BlcyhtYXBNYW5hZ2VyLCBHTCk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZVRpbGVzID0gZnVuY3Rpb24odGlsZXMpe1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0aWYgKHRpbGVzW2ldKVxyXG5cdFx0XHR0aWxlc1tpXS5fYyA9IGNpcmN1bGFyLnNldFNhZmUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmdldEVtcHR5R3JpZCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdyaWQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTA7eTw2NDt5Kyspe1xyXG5cdFx0Z3JpZFt5XSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgeD0wO3g8NjQ7eCsrKXtcclxuXHRcdFx0Z3JpZFt5XVt4XSA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBncmlkO1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5jb3B5VGlsZSA9IGZ1bmN0aW9uKHRpbGUpe1xyXG5cdHZhciByZXQgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0fTtcclxuXHRcclxuXHRmb3IgKHZhciBpIGluIHRpbGUpe1xyXG5cdFx0cmV0W2ldID0gdGlsZVtpXTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVGbG9vciA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9GbG9vcnMgPSBbXTtcclxuXHR2YXIgZmxvb3JzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuZil7XHJcblx0XHRcdFx0dmFyIGluZCA9IGZsb29yc0luZC5pbmRleE9mKHRpbGUuZik7XHJcblx0XHRcdFx0dmFyIGZsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Zmxvb3JzSW5kLnB1c2godGlsZS5mKTtcclxuXHRcdFx0XHRcdGZsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGZsLnRpbGUgPSB0aWxlLmY7XHJcblx0XHRcdFx0XHRmbC5yVGlsZSA9IHRpbGUucmY7XHJcblx0XHRcdFx0XHRvRmxvb3JzLnB1c2goZmwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0ZmwgPSBvRmxvb3JzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRmbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmYsIHk6IHl5fTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvRmxvb3JzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGZsb29yM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9GbG9vcnNbaV0sIFwiRlwiLCBHTCk7XHJcblx0XHRmbG9vcjNELnRleEluZCA9IG9GbG9vcnNbaV0udGlsZTtcclxuXHRcdGZsb29yM0QuclRleEluZCA9IG9GbG9vcnNbaV0uclRpbGU7XHJcblx0XHRmbG9vcjNELnR5cGUgPSBcIkZcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChmbG9vcjNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQ2VpbHMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQ2VpbHMgPSBbXTtcclxuXHR2YXIgY2VpbHNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5jKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gY2VpbHNJbmQuaW5kZXhPZih0aWxlLmMpO1xyXG5cdFx0XHRcdHZhciBjbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGNlaWxzSW5kLnB1c2godGlsZS5jKTtcclxuXHRcdFx0XHRcdGNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGNsLnRpbGUgPSB0aWxlLmM7XHJcblx0XHRcdFx0XHRvQ2VpbHMucHVzaChjbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjbCA9IG9DZWlsc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmMsIHk6IHRpbGUuY2h9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9DZWlscy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBjZWlsM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9DZWlsc1tpXSwgXCJDXCIsIEdMKTtcclxuXHRcdGNlaWwzRC50ZXhJbmQgPSBvQ2VpbHNbaV0udGlsZTtcclxuXHRcdGNlaWwzRC50eXBlID0gXCJDXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goY2VpbDNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQmxvY2tzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Jsb2NrcyA9IFtdO1xyXG5cdHZhciBibG9ja3NJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS53KXtcclxuXHRcdFx0XHR2YXIgaW5kID0gYmxvY2tzSW5kLmluZGV4T2YodGlsZS53KTtcclxuXHRcdFx0XHR2YXIgd2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRibG9ja3NJbmQucHVzaCh0aWxlLncpO1xyXG5cdFx0XHRcdFx0d2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0d2wudGlsZSA9IHRpbGUudztcclxuXHRcdFx0XHRcdG9CbG9ja3MucHVzaCh3bCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR3bCA9IG9CbG9ja3NbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2xbeV1beF0gPSB7dGlsZTogdGlsZS53LCB5OiB0aWxlLnksIGg6IHRpbGUuaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Jsb2Nrcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBibG9jazNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQmxvY2tzW2ldLCBcIkJcIiwgR0wpO1xyXG5cdFx0YmxvY2szRC50ZXhJbmQgPSBvQmxvY2tzW2ldLnRpbGU7XHJcblx0XHRibG9jazNELnR5cGUgPSBcIkJcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChibG9jazNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlU2xvcGVzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb1Nsb3BlcyA9IFtdO1xyXG5cdHZhciBzbG9wZXNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5zbCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IHNsb3Blc0luZC5pbmRleE9mKHRpbGUuc2wpO1xyXG5cdFx0XHRcdHZhciBzbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdHNsb3Blc0luZC5wdXNoKHRpbGUuc2wpO1xyXG5cdFx0XHRcdFx0c2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0c2wudGlsZSA9IHRpbGUuc2w7XHJcblx0XHRcdFx0XHRvU2xvcGVzLnB1c2goc2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2wgPSBvU2xvcGVzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRzbFt5XVt4XSA9IHt0aWxlOiB0aWxlLnNsLCB5OiB5eSwgZGlyOiB0aWxlLmRpcn07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b1Nsb3Blcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBzbG9wZTNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvU2xvcGVzW2ldLCBcIlNcIiwgR0wpO1xyXG5cdFx0c2xvcGUzRC50ZXhJbmQgPSBvU2xvcGVzW2ldLnRpbGU7XHJcblx0XHRzbG9wZTNELnR5cGUgPSBcIlNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChzbG9wZTNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlTWFwID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beF0gIT0gMCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS50aWxlc1tpbmRdO1xyXG5cdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mICYmIHRpbGUuZiA+IDEwMCl7XHJcblx0XHRcdFx0XHR0aWxlLnJmID0gdGlsZS5mIC0gMTAwO1xyXG5cdFx0XHRcdFx0dGlsZS5pc1dhdGVyID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGlsZS55ID0gLTAuMjtcclxuXHRcdFx0XHRcdHRpbGUuZnkgPSAtMC4yO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mIDwgMTAwKXtcclxuXHRcdFx0XHRcdHZhciB0MSwgdDIsIHQzLCB0NDtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4KzFdKSB0MSA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3ldW3grMV1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ktMV0pIHQyID0gKG1hcERhdGEubWFwW3ktMV1beF0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beC0xXSkgdDMgPSAobWFwRGF0YS5tYXBbeV1beC0xXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5KzFdKSB0NCA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3krMV1beF1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAodDEgfHwgdDIgfHwgdDMgfHwgdDQpe1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jb3BpZWRUaWxlc1tpbmRdKXtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5jb3BpZWRUaWxlc1tpbmRdID0gdGhpcy5jb3B5VGlsZSh0aWxlKTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHR0aWxlLnkgPSAtMTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlLmggKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXRpbGUudyl7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLncgPSAxMDtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUuaCA9IDE7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU9iamVjdHMgPSBmdW5jdGlvbihtYXBEYXRhKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1hcERhdGEub2JqZWN0cy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBvID0gbWFwRGF0YS5vYmplY3RzW2ldO1xyXG5cdFx0dmFyIHggPSBvLng7XHJcblx0XHR2YXIgeSA9IG8ueTtcclxuXHRcdHZhciB6ID0gby56O1xyXG5cdFx0XHJcblx0XHRzd2l0Y2ggKG8udHlwZSl7XHJcblx0XHRcdGNhc2UgXCJwbGF5ZXJcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIuaW5pdCh2ZWMzKHgsIHksIHopLCB2ZWMzKDAuMCwgby5kaXIgKiBNYXRoLlBJXzIsIDAuMCksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiaXRlbVwiOlxyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBNYXRoLm1pbigwLjMgKyAoTWF0aC5yYW5kb20oKSAqIDAuNyksIDEuMCk7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKG8uaXRlbSwgc3RhdHVzKTtcclxuXHRcdFx0XHR2YXIgaXRlbU9iamVjdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRcdFx0aXRlbU9iamVjdC5pbml0KHZlYzMoeCwgeSwgeiksIGl0ZW0sIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGl0ZW1PYmplY3QpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVuZW15XCI6XHJcblx0XHRcdFx0dmFyIGVuZW15ID0gRW5lbXlGYWN0b3J5LmdldEVuZW15KG8uZW5lbXkpO1xyXG5cdFx0XHRcdHZhciBlbmVteU9iamVjdCA9IG5ldyBFbmVteSgpO1xyXG5cdFx0XHRcdGVuZW15T2JqZWN0LmluaXQodmVjMyh4LCB5LCB6KSwgZW5lbXksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGVuZW15T2JqZWN0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdGFpcnNcIjpcclxuXHRcdFx0XHR2YXIgc3RhaXJzT2JqID0gbmV3IFN0YWlycygpO1xyXG5cdFx0XHRcdHN0YWlyc09iai5pbml0KHZlYzMoeCwgeSwgeiksIHRoaXMubWFwTWFuYWdlciwgby5kaXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChzdGFpcnNPYmopO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JcIjpcclxuXHRcdFx0XHR2YXIgeHggPSAoeCA8PCAwKSAtICgoby5kaXIgPT0gXCJIXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHp6ID0gKHogPDwgMCkgLSAoKG8uZGlyID09IFwiVlwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbenpdW3h4XS53O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5kb29ycy5wdXNoKG5ldyBEb29yKHRoaXMubWFwTWFuYWdlciwgdmVjMyh4LCB5LCB6KSwgby5kaXIsIFwiZG9vcjFcIiwgdGlsZSkpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07IiwidmFyIE1hcEFzc2VtYmxlciA9IHJlcXVpcmUoJy4vTWFwQXNzZW1ibGVyJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdnYW1lJyk7XHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdtYXBUb0RyYXcnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ01hcE1hbmFnZXInLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5nYW1lID0gZ2FtZTtcclxuXHR2YXIgR0wgPSBnYW1lLkdMLmN0eDtcclxuXHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdG9iamVjdC5tYXBUb0RyYXcgPSBbXTtcclxuXHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVUZXJyYWluKG9iamVjdCwgR0wpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01hcE1hbmFnZXInKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBNYW5hZ2VyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdNYXBNYW5hZ2VyJywgTWFwTWFuYWdlcik7XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZW5lcmF0ZU1hcCA9IGZ1bmN0aW9uKGRlcHRoKXtcclxuXHR2YXIgY29uZmlnID0ge1xyXG5cdFx0TUlOX1dJRFRIOiAxMCxcclxuXHRcdE1JTl9IRUlHSFQ6IDEwLFxyXG5cdFx0TUFYX1dJRFRIOiAyMCxcclxuXHRcdE1BWF9IRUlHSFQ6IDIwLFxyXG5cdFx0TEVWRUxfV0lEVEg6IDY0LFxyXG5cdFx0TEVWRUxfSEVJR0hUOiA2NCxcclxuXHRcdFNVQkRJVklTSU9OX0RFUFRIOiAzLFxyXG5cdFx0U0xJQ0VfUkFOR0VfU1RBUlQ6IDMvOCxcclxuXHRcdFNMSUNFX1JBTkdFX0VORDogNS84LFxyXG5cdFx0UklWRVJfU0VHTUVOVF9MRU5HVEg6IDEwLFxyXG5cdFx0TUlOX1JJVkVSX1NFR01FTlRTOiAxMCxcclxuXHRcdE1BWF9SSVZFUl9TRUdNRU5UUzogMjAsXHJcblx0XHRNSU5fUklWRVJTOiAzLFxyXG5cdFx0TUFYX1JJVkVSUzogNVxyXG5cdH07XHJcblx0dmFyIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IoY29uZmlnKTtcclxuXHR2YXIga3JhbWdpbmVFeHBvcnRlciA9IG5ldyBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyk7XHJcblx0dmFyIGdlbmVyYXRlZExldmVsID0gZ2VuZXJhdG9yLmdlbmVyYXRlTGV2ZWwoZGVwdGgpO1xyXG5cdFxyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR0cnl7XHJcblx0XHR3aW5kb3cuZ2VuZXJhdGVkTGV2ZWwgPSAoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0dmFyIG1hcERhdGEgPSBrcmFtZ2luZUV4cG9ydGVyLmdldExldmVsKGdlbmVyYXRlZExldmVsLmxldmVsKTtcclxuXHRcdHdpbmRvdy5tYXBEYXRhID0gKG1hcERhdGEpO1xyXG5cdFx0dmFyIG1hcEFzc2VtYmxlciA9IG5ldyBNYXBBc3NlbWJsZXIoKTtcclxuXHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdG1hcE0ubWFwID0gbWFwRGF0YS5tYXA7XHJcblx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHR9Y2F0Y2ggKGUpe1xyXG5cdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLnN0YWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0fVxyXG5cdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbihtYXBOYW1lKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCBjcCArICdtYXBzLycgKyBtYXBOYW1lICsgXCIuanNvblwiLCB0cnVlKTtcclxuXHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gIFx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgXHRcdFx0dHJ5e1xyXG5cdFx0XHRcdG1hcERhdGEgPSBKU09OLnBhcnNlKGh0dHAucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdFx0XHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLm1hcCA9IG1hcERhdGEubWFwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRcdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcdFx0fWNhdGNoIChlKXtcclxuXHRcdFx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5zdGFjayk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fTtcclxuXHRodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIixcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcclxuXHRodHRwLnNlbmQoKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gKHRoaXMud2F0ZXJUaWxlcy5pbmRleE9mKHRpbGVJZCkgIT0gLTEpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNXYXRlclBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQuZikgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLmlzV2F0ZXJUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc0xhdmFUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gdGlsZUlkID09IDEwMztcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGFuZ2VXYWxsVGV4dHVyZSA9IGZ1bmN0aW9uKHgsIHosIHRleHR1cmVJZCl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgYmFzZSA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghYmFzZS5jbG9uZWQpe1xyXG5cdFx0dmFyIG5ld1cgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgaW4gYmFzZSl7XHJcblx0XHRcdG5ld1dbaV0gPSBiYXNlW2ldO1xyXG5cdFx0fVxyXG5cdFx0bmV3Vy5jbG9uZWQgPSB0cnVlO1xyXG5cdFx0dGhpcy5tYXBbel1beF0gPSBuZXdXO1xyXG5cdFx0YmFzZSA9IG5ld1c7XHJcblx0fVxyXG5cdFxyXG5cdGJhc2UudyA9IHRleHR1cmVJZDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JBdCA9IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBkb29yID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdGlmIChkb29yLndhbGxQb3NpdGlvbi5lcXVhbHMoeCwgeSwgeikpIHJldHVybiBkb29yO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXQgPSBmdW5jdGlvbihwb3NpdGlvbil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5lcXVhbHMocG9zaXRpb24pKXtcclxuXHRcdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXRHcmlkID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA9PSBwb3NpdGlvbi5hICYmIHogPT0gcG9zaXRpb24uYyl7XHJcblx0XHRcdHJldHVybiAodGhpcy5pbnN0YW5jZXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldE5lYXJlc3RDbGVhbkl0ZW1UaWxlID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdFxyXG5cdHZhciBtaW5YID0geCAtIDE7XHJcblx0dmFyIG1pblogPSB6IC0gMTtcclxuXHR2YXIgbWF4WCA9IHggKyAxO1xyXG5cdHZhciBtYXhaID0geiArIDE7XHJcblx0XHJcblx0Zm9yICh2YXIgeno9bWluWjt6ejw9bWF4Wjt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PW1pblg7eHg8PW1heFg7eHgrKyl7XHJcblx0XHRcdGlmICh0aGlzLmlzU29saWQoeHgsIHp6LCAwKSB8fCB0aGlzLmlzV2F0ZXJQb3NpdGlvbih4eCwgenopKXtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHBvcyA9IHZlYzMoeHgsIDAsIHp6KTtcclxuXHRcdFx0dmFyIGlucyA9IHRoaXMuZ2V0SW5zdGFuY2VBdEdyaWQocG9zKTtcclxuXHRcdFx0aWYgKCFpbnMgfHwgKCFpbnMuaXRlbSAmJiAhaW5zLnN0YWlycykpe1xyXG5cdFx0XHRcdHJldHVybiBwb3M7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNOZWFyZXN0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGRpc3RhbmNlLCBoYXNQcm9wZXJ0eSl7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdGlmIChoYXNQcm9wZXJ0eSAmJiAhdGhpcy5pbnN0YW5jZXNbaV1baGFzUHJvcGVydHldKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hIC0gcG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeiA9IE1hdGguYWJzKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMgLSBwb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPD0gZGlzdGFuY2UgJiYgeiA8PSBkaXN0YW5jZSl7XHJcblx0XHRcdHJldC5wdXNoKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZU5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBzZWxmKXtcclxuXHR2YXIgcCA9IHBvcy5jbG9uZSgpO1xyXG5cdHAuYSA9IHAuYSArIHNwZC5hO1xyXG5cdHAuYyA9IHAuYyArIHNwZC5iO1xyXG5cdFxyXG5cdHZhciBpbnN0ID0gbnVsbCwgaG9yO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHRpZiAoIWlucyB8fCBpbnMuZGVzdHJveWVkIHx8ICFpbnMuc29saWQpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucyA9PT0gc2VsZikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gcC5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gcC5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4IDw9IDAuOCAmJiB6eiA8PSAwLjgpe1xyXG5cdFx0XHRpZiAocG9zLmEgPD0gaW5zLnBvc2l0aW9uLmEgLSAwLjggfHwgcG9zLmEgPj0gaW5zLnBvc2l0aW9uLmEgKyAwLjgpIGhvciA9IHRydWU7XHJcblx0XHRcdGVsc2UgaWYgKHBvcy5jIDw9IGlucy5wb3NpdGlvbi5jIC0gMC44IHx8IHBvcy5jID49IGlucy5wb3NpdGlvbi5jICsgMC44KSBob3IgPSBmYWxzZTsgIFxyXG5cdFx0XHRpbnN0ID0gaW5zO1xyXG5cdFx0XHRpID0gbGVuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpZiAoIWluc3QpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdGlmIChpbnN0LmhlaWdodCl7XHJcblx0XHRpZiAocG9zLmIgKyBoIDwgaW5zdC5wb3NpdGlvbi5iKSByZXR1cm4gbnVsbDtcclxuXHRcdGlmIChwb3MuYiA+PSBpbnN0LnBvc2l0aW9uLmIgKyBpbnN0LmhlaWdodCkgcmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChob3IpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMucmlnaHQ7XHJcblx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLndhbGxIYXNOb3JtYWwgPSBmdW5jdGlvbih4LCB5LCBub3JtYWwpe1xyXG5cdHZhciB0MSA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdHN3aXRjaCAobm9ybWFsKXtcclxuXHRcdGNhc2UgJ3UnOiB5IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnbCc6IHggLT0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdkJzogeSArPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ3InOiB4ICs9IDE7IGJyZWFrO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHR2YXIgdDIgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRcclxuXHRpZiAoIXQyLncpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0Mi53ICYmICEodDIueSA9PSB0MS55ICYmIHQyLmggPT0gdDEuaCkpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgaW5XYXRlcil7XHJcblx0dmFyIHh4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgenogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGRvb3IgPSB0aGlzLmdldERvb3JBdCh4eCwgeSwgenopO1xyXG5cdGlmIChkb29yKXtcclxuXHRcdHZhciB4eHggPSAocG9zLmEgKyBzcGQuYSkgLSB4eDtcclxuXHRcdHZhciB6enogPSAocG9zLmMgKyBzcGQuYikgLSB6ejtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSAocG9zLmEgLSB4eCk7XHJcblx0XHR2YXIgeiA9IChwb3MuYyAtIHp6KTtcclxuXHRcdGlmIChkb29yLmRpciA9PSBcIlZcIil7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGlmICh6enogPiAwLjI1ICYmIHp6eiA8IDAuNzUpIHJldHVybiBudWxsO1xyXG5cdFx0XHRpZiAoeCA8IDAgfHwgeCA+IDEpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRpZiAoeHh4ID4gMC4yNSAmJiB4eHggPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHogPCAwIHx8IHogPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRlbHNlIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oeCwgeiwgeSl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0aWYgKHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRpZiAodC55ICsgdC5oIDw9IHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGVja0JveENvbGxpc2lvbiA9IGZ1bmN0aW9uKGJveDEsIGJveDIpe1xyXG5cdGlmIChib3gxLngyIDwgYm94Mi54MSB8fCBib3gxLngxID4gYm94Mi54MiB8fCBib3gxLnoyIDwgYm94Mi56MSB8fCBib3gxLnoxID4gYm94Mi56Mil7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0QkJveFdhbGxOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgYldpZHRoKXtcclxuXHR2YXIgeCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGJCb3ggPSB7XHJcblx0XHR4MTogcG9zLmEgKyBzcGQuYSAtIGJXaWR0aCxcclxuXHRcdHoxOiBwb3MuYyArIHNwZC5iIC0gYldpZHRoLFxyXG5cdFx0eDI6IHBvcy5hICsgc3BkLmEgKyBiV2lkdGgsXHJcblx0XHR6MjogcG9zLmMgKyBzcGQuYiArIGJXaWR0aFxyXG5cdH07XHJcblx0XHJcblx0dmFyIHhtID0geCAtIDE7XHJcblx0dmFyIHptID0geiAtIDE7XHJcblx0dmFyIHhNID0geG0gKyAzO1xyXG5cdHZhciB6TSA9IHptICsgMztcclxuXHRcclxuXHR2YXIgdDtcclxuXHRmb3IgKHZhciB6ej16bTt6ejx6TTt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PXhtO3h4PHhNO3h4Kyspe1xyXG5cdFx0XHRpZiAoIXRoaXMubWFwW3p6XSkgY29udGludWU7XHJcblx0XHRcdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gMCkgY29udGludWU7XHJcblx0XHRcdFxyXG5cdFx0XHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHQueSt0LmggPD0geSkgY29udGludWU7XHJcblx0XHRcdGVsc2UgaWYgKHQueSA+IHkgKyAwLjUpIGNvbnRpbnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGJveCA9IHtcclxuXHRcdFx0XHR4MTogeHgsXHJcblx0XHRcdFx0ejE6IHp6LFxyXG5cdFx0XHRcdHgyOiB4eCArIDEsXHJcblx0XHRcdFx0ejI6IHp6ICsgMVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuY2hlY2tCb3hDb2xsaXNpb24oYkJveCwgYm94KSl7XHJcblx0XHRcdFx0dmFyIHh4eCA9IHBvcy5hIC0geHg7XHJcblx0XHRcdFx0dmFyIHp6eiA9IHBvcy5jIC0geno7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG5WID0gdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3UnKSB8fCB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpO1xyXG5cdFx0XHRcdHZhciBuSCA9IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdyJykgfHwgdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2wnKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoenp6ID49IC1iV2lkdGggJiYgenp6IDwgMSArIGJXaWR0aCAmJiBuSCl7XHJcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh4eHggPj0gLWJXaWR0aCAmJiB4eHggPCAxICsgYldpZHRoICYmIG5WKXtcclxuXHRcdFx0XHRcdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgdCwgdGg7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt6el0pIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRpID0gNDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHRoID0gdC5oIC0gMC4zO1xyXG5cdGlmIChpbldhdGVyKSB5ICs9IDAuMztcclxuXHRpZiAodC5zbCkgdGggKz0gMC4yO1xyXG5cdFxyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC55K3RoIDw9IHkpIHJldHVybiBudWxsO1xyXG5cdGVsc2UgaWYgKHQueSA+IHkgKyBoKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0Lncpe1xyXG5cdFx0dmFyIHRleCA9IHRoaXMuZ2FtZS5nZXRUZXh0dXJlQnlJZCh0LncsIFwid2FsbFwiKTtcclxuXHRcdGlmICh0ZXguaXNTb2xpZCl7XHJcblx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgJiYgenp6IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpICYmIHp6eiA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpICYmIHh4eCA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0OyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpICYmIHh4eCA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDsgfVxyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICh0LmR3KXtcclxuXHRcdHZhciB4LCB6LCB4eHgsIHp6eiwgbm9ybWFsO1xyXG5cdFx0eCA9IHBvcy5hICsgc3BkLmE7XHJcblx0XHR6ID0gcG9zLmMgKyBzcGQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKHQuYXcgPT0gMCl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwTGVmdDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAxKXsgeHh4ID0geCAtIHh4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBSaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAyKXsgeHh4ID0geCAtIHh4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93blJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDMpeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duTGVmdDsgfVxyXG5cdFx0aWYgKHp6eiA+PSB4eHgpe1xyXG5cdFx0XHRyZXR1cm4gbm9ybWFsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFlGbG9vciA9IGZ1bmN0aW9uKHgsIHksIG5vV2F0ZXIpe1xyXG5cdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeDw8MCwwLHk8PDApKTtcclxuXHRpZiAoaW5zICE9IG51bGwgJiYgaW5zLmhlaWdodCl7XHJcblx0XHRyZXR1cm4gaW5zLnBvc2l0aW9uLmIgKyBpbnMuaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgeHggPSB4IC0gKHggPDwgMCk7XHJcblx0dmFyIHl5ID0geSAtICh5IDw8IDApO1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eSA9IHkgPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbeV1beF07XHJcblx0dmFyIHR0ID0gdC55O1xyXG5cdFxyXG5cdGlmICh0LncpIHR0ICs9IHQuaDtcclxuXHRpZiAodC5mKSB0dCA9IHQuZnk7XHJcblx0XHJcblx0aWYgKCFub1dhdGVyICYmIHRoaXMuaXNXYXRlclRpbGUodC5mKSkgdHQgLT0gMC4zO1xyXG5cdFxyXG5cdGlmICh0LnNsKXtcclxuXHRcdGlmICh0LmRpciA9PSAwKSB0dCArPSB5eSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDEpIHR0ICs9IHh4ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMikgdHQgKz0gKDEuMCAtIHl5KSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDMpIHR0ICs9ICgxLjAgLSB4eCkgKiAwLjU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0dDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmRyYXdNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciB4LCB5O1xyXG5cdHggPSB0aGlzLnBsYXllci5wb3NpdGlvbi5hO1xyXG5cdHkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi5jO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tYXBUb0RyYXcubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXRkID0gdGhpcy5tYXBUb0RyYXdbaV07XHJcblx0XHRcclxuXHRcdGlmICh4IDwgbXRkLmJvdW5kYXJpZXNbMF0gfHwgeCA+IG10ZC5ib3VuZGFyaWVzWzJdIHx8IHkgPCBtdGQuYm91bmRhcmllc1sxXSB8fCB5ID4gbXRkLmJvdW5kYXJpZXNbM10pXHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobXRkLnR5cGUgPT0gXCJCXCIpeyAvLyBCbG9ja3NcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdCbG9jayhtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiRlwiKXsgLy8gRmxvb3JzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdGlmICh0aGlzLmlzV2F0ZXJUaWxlKHR0KSl7IFxyXG5cdFx0XHRcdHR0ID0gKG10ZC5yVGV4SW5kKSArICh0aGlzLndhdGVyRnJhbWUgPDwgMCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnd2F0ZXInKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnZmxvb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiQ1wiKXsgLy8gQ2VpbHNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnY2VpbCcpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiU1wiKXsgLy8gU2xvcGVcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdTbG9wZShtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoaW52W2ldLmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRyZXR1cm4gaW52W2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSwgYW1vdW50KXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IGludltpXTtcclxuXHRcdGlmIChpdC5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0aWYgKC0taXQuYW1vdW50ID09IDApe1xyXG5cdFx0XHRcdGludi5zcGxpY2UoaSwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmFkZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHR0aGlzLmdhbWUuY29uc29sZS5hZGRTRk1lc3NhZ2UodGV4dCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLnRpbWVTdG9wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy53YXRlckZyYW1lICs9IDAuMTtcclxuXHRpZiAodGhpcy53YXRlckZyYW1lID49IDIpIHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNUb0RyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdGktLTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciBkaXN0ID0geHggKiB4eCArIHp6ICogeno7XHJcblx0XHR2YXIgYWRkZWQgPSBmYWxzZTtcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRpZiAoZGlzdCA+IHRoaXMub3JkZXJJbnN0YW5jZXNbal0uZGlzdCl7XHJcblx0XHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaiwwLHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdFx0XHRhZGRlZCA9IHRydWU7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCFhZGRlZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMucHVzaCh7X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdPcmRlckluc3RhbmNlJyksIGluczogaW5zLCBkaXN0OiBkaXN0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzQXQgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aWYgKE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmEpID09IHggJiYgTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYykgPT0geilcclxuXHRcdFx0cmV0LnB1c2goaW5zKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcCA9PSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3TWFwKCk7XHJcblx0XHJcblx0dGhpcy5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5vcmRlckluc3RhbmNlc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aW5zID0gaW5zLmlucztcclxuXHRcdFxyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcihpbnMucG9zaXRpb24uYSwgaW5zLnBvc2l0aW9uLmIsIGlucy5wb3NpdGlvbi5jLCBpbnMucm90YXRpb24sIGlucy50ZXh0dXJlQ29kZSk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3JXYWxsKGlucy5kb29yUG9zaXRpb24uYSwgaW5zLmRvb3JQb3NpdGlvbi5iLCBpbnMuZG9vclBvc2l0aW9uLmMsIGlucy53YWxsVGV4dHVyZSwgKGlucy5kaXIgPT0gXCJWXCIpKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIubG9vcCgpO1xyXG5cdGlmICh0aGlzLnBvaXNvbkNvdW50ID4gMCl7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50IC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZ2FtZS5wbGF5ZXIucG9pc29uZWQgJiYgdGhpcy5wb2lzb25Db3VudCA9PSAwKXtcclxuXHRcdHRoaXMucGxheWVyLnJlY2VpdmVEYW1hZ2UoMTApO1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCA9IDEwMDtcclxuXHR9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1ha2VQZXJzcGVjdGl2ZTogZnVuY3Rpb24oZm92LCBhc3BlY3RSYXRpbywgek5lYXIsIHpGYXIpe1xyXG5cdFx0dmFyIHpMaW1pdCA9IHpOZWFyICogTWF0aC50YW4oZm92ICogTWF0aC5QSSAvIDM2MCk7XHJcblx0XHR2YXIgQSA9IC0oekZhciArIHpOZWFyKSAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEIgPSAtMiAqIHpGYXIgKiB6TmVhciAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEMgPSAoMiAqIHpOZWFyKSAvICh6TGltaXQgKiBhc3BlY3RSYXRpbyAqIDIpO1xyXG5cdFx0dmFyIEQgPSAoMiAqIHpOZWFyKSAvICgyICogekxpbWl0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0QywgMCwgMCwgMCxcclxuXHRcdFx0MCwgRCwgMCwgMCxcclxuXHRcdFx0MCwgMCwgQSwtMSxcclxuXHRcdFx0MCwgMCwgQiwgMFxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG5ld01hdHJpeDogZnVuY3Rpb24oY29scywgcm93cyl7XHJcblx0XHR2YXIgcmV0ID0gbmV3IEFycmF5KHJvd3MpO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8cm93cztpKyspe1xyXG5cdFx0XHRyZXRbaV0gPSBuZXcgQXJyYXkoY29scyk7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPGNvbHM7aisrKXtcclxuXHRcdFx0XHRyZXRbaV1bal0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRJZGVudGl0eTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtYWtlVHJhbnNmb3JtOiBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSl7XHJcblx0XHQvLyBTdGFydHMgd2l0aCB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0XHR2YXIgdE1hdCA9IHRoaXMuZ2V0SWRlbnRpdHkoKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3RcclxuXHRcdC8vIFVudGlsIEkgZmluZCB0aGUgbmVlZCB0byByb3RhdGUgYW4gb2JqZWN0IGl0c2VsZiBpdCByZWFtaW5zIGFzIGNvbW1lbnRcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgob2JqZWN0LnJvdGF0aW9uLmEpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKG9iamVjdC5yb3RhdGlvbi5iKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKG9iamVjdC5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIElmIHRoZSBvYmplY3QgaXMgYSBiaWxsYm9hcmQsIHRoZW4gbWFrZSBpdCBsb29rIHRvIHRoZSBjYW1lcmFcclxuXHRcdGlmIChvYmplY3QuaXNCaWxsYm9hcmQgJiYgIW9iamVjdC5ub1JvdGF0ZSkgdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoLShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IHRvIGl0cyBwb3NpdGlvblxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbihvYmplY3QucG9zaXRpb24uYSwgb2JqZWN0LnBvc2l0aW9uLmIsIG9iamVjdC5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCBpbiByZWxhdGlvbiB0byB0aGUgY2FtZXJhXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKC1jYW1lcmEucG9zaXRpb24uYSwgLWNhbWVyYS5wb3NpdGlvbi5iIC0gY2FtZXJhLmNhbWVyYUhlaWdodCwgLWNhbWVyYS5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0IGluIHRoZSBjYW1lcmEgZGlyZWN0aW9uIChJIGRvbid0IHJlYWxseSByb3RhdGUgaW4gdGhlIFogYXhpcylcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWCgtY2FtZXJhLnJvdGF0aW9uLmEpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblooLWNhbWVyYS5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0TWF0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0VHJhbnNsYXRpb246IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0eCwgeSwgeiwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWDogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgQywgUywgMCxcclxuXHRcdFx0MCwtUywgQywgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWTogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIDAsIFMsIDAsXHJcblx0XHRcdCAwLCAxLCAwLCAwLFxyXG5cdFx0XHQtUywgMCwgQywgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblo6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCBTLCAwLCAwLFxyXG5cdFx0XHQtUywgQywgMCwgMCxcclxuXHRcdFx0IDAsIDAsIDEsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWluaU1hdHJpeE11bHQ6IGZ1bmN0aW9uKHJvdywgY29sdW1uKXtcclxuXHRcdHZhciByZXN1bHQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1yb3cubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHJlc3VsdCArPSByb3dbaV0gKiBjb2x1bW5baV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSxcclxuXHRcclxuXHRtYXRyaXhNdWx0aXBsaWNhdGlvbjogZnVuY3Rpb24obWF0cml4QSwgbWF0cml4Qil7XHJcblx0XHR2YXIgQTEgPSBbbWF0cml4QVswXSwgIG1hdHJpeEFbMV0sICBtYXRyaXhBWzJdLCAgbWF0cml4QVszXV07XHJcblx0XHR2YXIgQTIgPSBbbWF0cml4QVs0XSwgIG1hdHJpeEFbNV0sICBtYXRyaXhBWzZdLCAgbWF0cml4QVs3XV07XHJcblx0XHR2YXIgQTMgPSBbbWF0cml4QVs4XSwgIG1hdHJpeEFbOV0sICBtYXRyaXhBWzEwXSwgbWF0cml4QVsxMV1dO1xyXG5cdFx0dmFyIEE0ID0gW21hdHJpeEFbMTJdLCBtYXRyaXhBWzEzXSwgbWF0cml4QVsxNF0sIG1hdHJpeEFbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIEIxID0gW21hdHJpeEJbMF0sIG1hdHJpeEJbNF0sIG1hdHJpeEJbOF0sICBtYXRyaXhCWzEyXV07XHJcblx0XHR2YXIgQjIgPSBbbWF0cml4QlsxXSwgbWF0cml4Qls1XSwgbWF0cml4Qls5XSwgIG1hdHJpeEJbMTNdXTtcclxuXHRcdHZhciBCMyA9IFttYXRyaXhCWzJdLCBtYXRyaXhCWzZdLCBtYXRyaXhCWzEwXSwgbWF0cml4QlsxNF1dO1xyXG5cdFx0dmFyIEI0ID0gW21hdHJpeEJbM10sIG1hdHJpeEJbN10sIG1hdHJpeEJbMTFdLCBtYXRyaXhCWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBtbW0gPSB0aGlzLm1pbmlNYXRyaXhNdWx0O1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0bW1tKEExLCBCMSksIG1tbShBMSwgQjIpLCBtbW0oQTEsIEIzKSwgbW1tKEExLCBCNCksXHJcblx0XHRcdG1tbShBMiwgQjEpLCBtbW0oQTIsIEIyKSwgbW1tKEEyLCBCMyksIG1tbShBMiwgQjQpLFxyXG5cdFx0XHRtbW0oQTMsIEIxKSwgbW1tKEEzLCBCMiksIG1tbShBMywgQjMpLCBtbW0oQTMsIEI0KSxcclxuXHRcdFx0bW1tKEE0LCBCMSksIG1tbShBNCwgQjIpLCBtbW0oQTQsIEIzKSwgbW1tKEE0LCBCNClcclxuXHRcdF07XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBNaXNzaWxlKHBvc2l0aW9uLCByb3RhdGlvbiwgdHlwZSwgdGFyZ2V0LCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMudHlwZSA9IHR5cGU7XHJcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0dGhpcy5zdHIgPSAwO1xyXG5cdHRoaXMuc3BlZWQgPSAwLjM7XHJcblx0dGhpcy5taXNzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnZzcGVlZCA9IDA7XHJcblx0dGhpcy5ncmF2aXR5ID0gMDtcclxuXHRcclxuXHR2YXIgc3ViSW1nID0gMDtcclxuXHRzd2l0Y2ggKHR5cGUpe1xyXG5cdFx0Y2FzZSAnc2xpbmcnOiBcclxuXHRcdFx0c3ViSW1nID0gMDtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRcdHRoaXMuZ3Jhdml0eSA9IDAuMDA1O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdib3cnOiBcclxuXHRcdFx0c3ViSW1nID0gMTtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Nyb3NzYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDI7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdtYWdpY01pc3NpbGUnOiBcclxuXHRcdFx0c3ViSW1nID0gMzsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ljZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA0OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnZmlyZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA1OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHN1YkltZyA9IDY7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC41O1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSAnYm9sdHMnO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tzdWJJbWddO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3NpbGU7XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5jaGVja0NvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1hcCA9IHRoaXMubWFwTWFuYWdlci5tYXA7XHJcblx0aWYgKHRoaXMucG9zaXRpb24uYSA8IDAgfHwgdGhpcy5wb3NpdGlvbi5jIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmEgPj0gbWFwWzBdLmxlbmd0aCB8fCB0aGlzLnBvc2l0aW9uLmMgPj0gbWFwLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciB4ID0gdGhpcy5wb3NpdGlvbi5hIDw8IDA7XHJcblx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgKyAwLjU7XHJcblx0dmFyIHogPSB0aGlzLnBvc2l0aW9uLmMgPDwgMDtcclxuXHR2YXIgdGlsZSA9IG1hcFt6XVt4XTtcclxuXHRcclxuXHRpZiAodGlsZS53IHx8IHRpbGUud2QgfHwgdGlsZS53ZCl7XHJcblx0XHRpZiAoISh0aWxlLnkgKyB0aWxlLmggPCB5IHx8IHRpbGUueSA+IHkpKXtcclxuXHRcdFx0IHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKHkgPCB0aWxlLmZ5IHx8IHkgPiB0aWxlLmNoKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dmFyIGlucywgZGZzO1xyXG5cdGlmICh0aGlzLnRhcmdldCA9PSAnZW5lbXknKXtcclxuXHRcdHZhciBpbnN0YW5jZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAwLjUsICdlbmVteScpO1xyXG5cdFx0dmFyIGRpc3QgPSAxMDAwMDtcclxuXHRcdGlmIChpbnN0YW5jZXMubGVuZ3RoID4gMSl7XHJcblx0XHRcdGZvciAodmFyIGk9MCxsZW49aW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdHZhciB4eCA9IE1hdGguYWJzKHRoaXMucG9zaXRpb24uYSAtIGluc3RhbmNlc1tpXS5wb3NpdGlvbi5hKTtcclxuXHRcdFx0XHR2YXIgeXkgPSBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLmMgLSBpbnN0YW5jZXNbaV0ucG9zaXRpb24uYyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGQgPSB4eCAqIHh4ICsgeXkgKiB5eTtcclxuXHRcdFx0XHRpZiAoZCA8IGRpc3Qpe1xyXG5cdFx0XHRcdFx0ZGlzdCA9IGQ7XHJcblx0XHRcdFx0XHRpbnMgPSBpbnN0YW5jZXNbaV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZSBpZiAoaW5zdGFuY2VzLmxlbmd0aCA9PSAxKXtcclxuXHRcdFx0aW5zID0gaW5zdGFuY2VzWzBdO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRkZnMgPSBVdGlscy5yb2xsRGljZShpbnMuZW5lbXkuc3RhdHMuZGZzKTtcclxuXHR9ZWxzZXtcclxuXHRcdGlucyA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0XHRkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHR9XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHRoaXMuc3RyIC0gZGZzLCAwKTtcclxuXHRcclxuXHRpZiAodGhpcy5taXNzZWQpe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJNaXNzZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmIChkbWcgIT0gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShkbWcgKyBcIiBwb2ludHMgaW5mbGljdGVkXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHRcdGlucy5yZWNlaXZlRGFtYWdlKGRtZyk7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkJsb2NrZWQhXCIpO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMudnNwZWVkICs9IHRoaXMuZ3Jhdml0eTtcclxuXHRcclxuXHR2YXIgeFRvID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMuc3BlZWQ7XHJcblx0dmFyIHlUbyA9IE1hdGguc2luKHRoaXMucm90YXRpb24uYSkgKiB0aGlzLnNwZWVkIC0gdGhpcy52c3BlZWQ7XHJcblx0dmFyIHpUbyA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5zcGVlZDtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uLnN1bSh2ZWMzKHhUbywgeVRvLCB6VG8pKTtcclxuXHRcclxuXHRpZiAoIXRoaXMuY2hlY2tDb2xsaXNpb24oKSl7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG59O1xyXG5cclxuTWlzc2lsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbix0aGlzLnRleHR1cmVDb2RlLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsInZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG5vcm1hbHM6IHtcclxuXHRcdGRvd246ICB2ZWMyKCAwLCAxKSxcclxuXHRcdHJpZ2h0OiB2ZWMyKCAxLCAwKSxcclxuXHRcdHVwOiAgICB2ZWMyKCAwLC0xKSxcclxuXHRcdGxlZnQ6ICB2ZWMyKC0xLCAwKSxcclxuXHRcdFxyXG5cdFx0dXBSaWdodDogIHZlYzIoTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCAtTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKSxcclxuXHRcdHVwTGVmdDogIHZlYzIoLU1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgLU1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHRkb3duUmlnaHQ6ICB2ZWMyKE1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKSxcclxuXHRcdGRvd25MZWZ0OiAgdmVjMigtTWF0aC5jb3MoTWF0aC5kZWdUb1JhZCg0NSkpLCBNYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpXHJcblx0fSxcclxuXHRcclxuXHRjdWJlOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsLCBsaWdodCwgLypbdSxsLGQscl0qLyBmYWNlcyl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW107XHJcblx0XHRkYXJrVmVydGV4ID0gW107XHJcblx0XHRpZiAoIWZhY2VzKSBmYWNlcyA9IFsxLDEsMSwxXTtcclxuXHRcdGlmIChmYWNlc1swXSl7IC8vIFVwIEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IFx0IHcsICAwLCAtbCxcclxuXHRcdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHRcdC13LCAgMCwgLWwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMSwxLDEsMSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbMV0peyAvLyBMZWZ0IEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdFx0IHcsICAwLCAtbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwLDAsMCwwKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1syXSl7IC8vIERvd24gRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQtdywgIGgsICBsLFxyXG5cdFx0XHRcdC13LCAgMCwgIGwsXHJcblx0XHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0XHQgdywgIDAsICBsKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDEsMSwxLDEpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzNdKXsgLy8gUmlnaHQgRmFjZVxyXG5cdFx0XHR2ZXJ0ZXgucHVzaChcclxuXHRcdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHRcdC13LCAgMCwgLWwsXHJcblx0XHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0XHQtdywgIDAsICBsKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDAsMCwwLDApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdCB0eCwgdHksXHJcblx0XHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHRcdDAuMCwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRmbG9vcjogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IHcsIDAuMCwgIGwsXHJcblx0XHRcdCB3LCAwLjAsIC1sLFxyXG5cdFx0XHQtdywgMC4wLCAgbCxcclxuXHRcdFx0LXcsIDAuMCwgLWwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRpbmRpY2VzLnB1c2goMCwgMSwgMiwgMiwgMSwgMyk7XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdCk7XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbMCwwLDAsMF07XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0Y2VpbDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IHcsIDAuMCwgIGwsXHJcblx0XHRcdCB3LCAwLjAsIC1sLFxyXG5cdFx0XHQtdywgMC4wLCAgbCxcclxuXHRcdFx0LXcsIDAuMCwgLWwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRpbmRpY2VzLnB1c2goMCwgMiwgMSwgMSwgMiwgMyk7XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdCk7XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbMCwwLDAsMF07XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0ZG9vcldhbGw6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAqIDAuMDU7XHJcblx0XHRcclxuXHRcdHZhciB3MiA9IC1zaXplLmEgKiAwLjI1O1xyXG5cdFx0dmFyIHczID0gc2l6ZS5hICogMC4yNTtcclxuXHRcdFxyXG5cdFx0dmFyIGgyID0gMSAtIHNpemUuYiAqIDAuMjU7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0Ly8gUmlnaHQgcGFydCBvZiB0aGUgZG9vclxyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdHcyLCAgaCwgLWwsXHJcblx0XHRcdHcyLCAgMCwgLWwsXHJcblx0XHRcdC13LCAgaCwgLWwsXHJcblx0XHRcdC13LCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0LXcsICAwLCAgbCxcclxuXHRcdFx0dzIsICBoLCAgbCxcclxuXHRcdFx0dzIsICAwLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBSaWdodCBGYWNlXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCAgMCwgIGwsXHJcblx0XHRcdHcyLCAgaCwgLWwsXHJcblx0XHRcdHcyLCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBMZWZ0IHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gTGVmdCBGYWNlXHJcblx0XHRcdHczLCAgaCwgLWwsXHJcblx0XHRcdHczLCAgMCwgLWwsXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCAgMCwgIGwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBNaWRkbGUgcGFydCBvZiB0aGUgZG9vclxyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdHczLCAgaCwgLWwsXHJcblx0XHRcdHczLCBoMiwgLWwsXHJcblx0XHRcdHcyLCAgaCwgLWwsXHJcblx0XHRcdHcyLCBoMiwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0dzIsICBoLCAgbCxcclxuXHRcdFx0dzIsIGgyLCAgbCxcclxuXHRcdFx0dzMsICBoLCAgbCxcclxuXHRcdFx0dzMsIGgyLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBCb3R0b20gRmFjZVxyXG5cdFx0XHR3MywgaDIsIC1sLFxyXG5cdFx0XHR3MywgaDIsICBsLFxyXG5cdFx0XHR3MiwgaDIsIC1sLFxyXG5cdFx0XHR3MiwgaDIsICBsLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8NjtpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjI1LCB0eSxcclxuXHRcdFx0XHQwLjI1LDAuMCxcclxuXHRcdFx0XHQwLjAwLCB0eSxcclxuXHRcdFx0XHQwLjAwLDAuMFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjUsMS4wLFxyXG5cdFx0XHRcdDAuNSwwLjc1LFxyXG5cdFx0XHRcdDAuMCwxLjAsXHJcblx0XHRcdFx0MC4wLDAuNzVcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MzY7aSsrKXtcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdH0sXHJcblx0XHJcblx0ZG9vcjogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgbGlnaHQpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmE7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQvLyBGcm9udCBGYWNlXHJcblx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCB3LCAgMCwgLWwsXHJcblx0XHRcdCAwLCAgaCwgLWwsXHJcblx0XHRcdCAwLCAgMCwgLWwsXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYWNrIEZhY2VcclxuXHRcdFx0IDAsICBoLCAgbCxcclxuXHRcdFx0IDAsICAwLCAgbCxcclxuXHRcdFx0IHcsICBoLCAgbCxcclxuXHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQvLyBSaWdodCBGYWNlXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCB3LCAgMCwgLWwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gTGVmdCBGYWNlXHJcblx0XHRcdCAwLCAgaCwgLWwsXHJcblx0XHRcdCAwLCAgMCwgLWwsXHJcblx0XHRcdCAwLCAgaCwgIGwsXHJcblx0XHRcdCAwLCAgMCwgIGwsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHR0ZXhDb29yZHMucHVzaCh0eCwgdHksIHR4LDAuMCwgMC4wLCB0eSwgMC4wLDAuMCk7XHJcblx0XHR0ZXhDb29yZHMucHVzaCgwLjAsIHR5LCAwLjAsMC4wLCB0eCwgdHksIHR4LDAuMCk7XHJcblx0XHRmb3IgKHZhciBpPTA7aTwyO2krKyl7XHJcblx0XHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHRcdDAuMDEsMC4wMSxcclxuXHRcdFx0XHQwLjAxLDAuMCxcclxuXHRcdFx0XHQwLjAgLDAuMDEsXHJcblx0XHRcdFx0MC4wICwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MTY7aSsrKXtcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRvb3IgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdHJldHVybiBkb29yO1xyXG5cdH0sXHJcblx0XHJcblx0YmlsbGJvYXJkOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAgaCwgIDAsXHJcblx0XHRcdC13LCAgaCwgIDAsXHJcblx0XHRcdCB3LCAgMCwgIDAsXHJcblx0XHRcdC13LCAgMCwgIDAsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPTQ7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtcclxuXHRcdFx0IHR4LCB0eSxcclxuXHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0IHR4LDAuMCxcclxuXHRcdFx0MC4wLDAuMFxyXG5cdFx0XTtcclxuXHRcdFx0XHQgXHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbMCwwLDAsMF07XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dmVydGV4QnVmZmVyLm51bUl0ZW1zID0gdmVydGV4Lmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrQnVmZmVyLmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgYmlsbCA9ICB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdGJpbGwuaXNCaWxsYm9hcmQgPSB0cnVlO1xyXG5cdFx0cmV0dXJuIGJpbGw7XHJcblx0fSxcclxuXHRcclxuXHRzbG9wZTogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgZGlyKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcztcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iIC8gMjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgLy8gRnJvbnQgU2xvcGVcclxuXHRcdFx0IHcsICAwLjUsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgLWwsXHJcblx0XHRcdC13LCAgMC41LCAgbCxcclxuXHRcdFx0LXcsICAwLjAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0IC8vIFJpZ2h0IFNpZGVcclxuXHRcdFx0IHcsICAwLjUsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgIGwsXHJcblx0XHRcdCB3LCAgMC4wLCAtbCxcclxuXHRcdFx0IFxyXG5cdFx0XHQgLy8gTGVmdCBTaWRlXHJcblx0XHRcdC13LCAgMC41LCAgbCxcclxuXHRcdFx0LXcsICAwLjAsIC1sLFxyXG5cdFx0XHQtdywgIDAuMCwgIGxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGlmIChkaXIgIT0gMCl7XHJcblx0XHRcdHZhciBhbmcgPSBNYXRoLmRlZ1RvUmFkKGRpciAqIC05MCk7XHJcblx0XHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdFx0dmFyIFMgPSBNYXRoLnNpbihhbmcpO1xyXG5cdFx0XHRmb3IgKHZhciBpPTA7aTx2ZXJ0ZXgubGVuZ3RoO2krPTMpe1xyXG5cdFx0XHRcdHZhciBhID0gdmVydGV4W2ldICogQyAtIHZlcnRleFtpKzJdICogUztcclxuXHRcdFx0XHR2YXIgYiA9IHZlcnRleFtpXSAqIFMgKyB2ZXJ0ZXhbaSsyXSAqIEM7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmVydGV4W2ldID0gYTtcclxuXHRcdFx0XHR2ZXJ0ZXhbaSsyXSA9IGI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0XHJcblx0XHRpbmRpY2VzID0gW107XHJcblx0XHRpbmRpY2VzLnB1c2goMCwgMSwgMiwgMiwgMSwgMywgNCwgNSwgNiwgNywgOCwgOSk7XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdCB0eCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAwLjAsXHJcblx0XHRcdDAuMCwgIHR5LFxyXG5cdFx0XHRcclxuXHRcdFx0IHR4LCAwLjAsXHJcblx0XHRcdCB0eCwgIHR5LFxyXG5cdFx0XHQwLjAsICB0eSxcclxuXHRcdFx0XHJcblx0XHRcdDAuMCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAgdHlcclxuXHRcdCk7XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbMCwwLDAsMCwwLDAsMCwwLDAsMF07XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0YXNzZW1ibGVPYmplY3Q6IGZ1bmN0aW9uKG1hcERhdGEsIG9iamVjdFR5cGUsIGdsKXtcclxuXHRcdHZhciB2ZXJ0aWNlcyA9IFtdO1xyXG5cdFx0dmFyIHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dmFyIGluZGljZXMgPSBbXTtcclxuXHRcdHZhciBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcclxuXHRcdHZhciByZWN0ID0gWzY0LDY0LDAsMF07IC8vIFt4MSx5MSx4Mix5Ml1cclxuXHRcdGZvciAodmFyIHk9MCx5bGVuPW1hcERhdGEubGVuZ3RoO3k8eWxlbjt5Kyspe1xyXG5cdFx0XHRmb3IgKHZhciB4PTAseGxlbj1tYXBEYXRhW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0XHR2YXIgdCA9IChtYXBEYXRhW3ldW3hdLnRpbGUpPyBtYXBEYXRhW3ldW3hdLnRpbGUgOiAwO1xyXG5cdFx0XHRcdGlmICh0ICE9IDApe1xyXG5cdFx0XHRcdFx0Ly8gU2VsZWN0aW5nIGJvdW5kYXJpZXMgb2YgdGhlIG1hcCBwYXJ0XHJcblx0XHRcdFx0XHRyZWN0WzBdID0gTWF0aC5taW4ocmVjdFswXSwgeCAtIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFsxXSA9IE1hdGgubWluKHJlY3RbMV0sIHkgLSA2KTtcclxuXHRcdFx0XHRcdHJlY3RbMl0gPSBNYXRoLm1heChyZWN0WzJdLCB4ICsgNik7XHJcblx0XHRcdFx0XHRyZWN0WzNdID0gTWF0aC5tYXgocmVjdFszXSwgeSArIDYpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgdnY7XHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIkZcIil7IHZ2ID0gdGhpcy5mbG9vcih2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wpOyB9ZWxzZSAvLyBGbG9vclxyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJDXCIpeyB2diA9IHRoaXMuY2VpbCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wpOyB9ZWxzZSAvLyBDZWlsXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIkJcIil7IHZ2ID0gdGhpcy5jdWJlKHZlYzMoMS4wLG1hcERhdGFbeV1beF0uaCwxLjApLCB2ZWMyKDEuMCxtYXBEYXRhW3ldW3hdLmgpLCBnbCwgZmFsc2UsIHRoaXMuZ2V0Q3ViZUZhY2VzKG1hcERhdGEsIHgsIHkpKTsgfWVsc2UgLy8gQmxvY2tcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiU1wiKXsgdnYgPSB0aGlzLnNsb3BlKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCBnbCwgbWFwRGF0YVt5XVt4XS5kaXIpOyB9IC8vIFNsb3BlXHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHZhciB2ZXJ0ZXhPZmYgPSB2ZXJ0aWNlcy5sZW5ndGggLyAzO1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di52ZXJ0aWNlcy5sZW5ndGg7aTxsZW47aSs9Myl7XHJcblx0XHRcdFx0XHRcdHh4ID0gdnYudmVydGljZXNbaV0gKyB4ICsgMC41O1xyXG5cdFx0XHRcdFx0XHR5eSA9IHZ2LnZlcnRpY2VzW2krMV0gKyBtYXBEYXRhW3ldW3hdLnk7XHJcblx0XHRcdFx0XHRcdHp6ID0gdnYudmVydGljZXNbaSsyXSArIHkgKyAwLjU7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR2ZXJ0aWNlcy5wdXNoKHh4LCB5eSwgenopO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LmluZGljZXMubGVuZ3RoO2k8bGVuO2krPTEpe1xyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godnYuaW5kaWNlc1tpXSArIHZlcnRleE9mZik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYudGV4Q29vcmRzLmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0dGV4Q29vcmRzLnB1c2godnYudGV4Q29vcmRzW2ldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di5kYXJrVmVydGV4Lmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKHZ2LmRhcmtWZXJ0ZXhbaV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBUT0RPOiBSZWNyZWF0ZSBidWZmZXIgZGF0YSBvbiBkZXNlcmlhbGl6YXRpb25cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRpY2VzLmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0ZXhDb29yZHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR0ZXhCdWZmZXIubnVtSXRlbXMgPSB0ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBpbmRpY2VzLmxlbmd0aDtcclxuXHRcdGluZGljZXNCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgZGFya0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsbmV3IFVpbnQ4QXJyYXkoZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBkYXJrVmVydGV4Lmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgYnVmZmVyID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRidWZmZXIuYm91bmRhcmllcyA9IHJlY3Q7XHJcblx0XHRyZXR1cm4gYnVmZmVyO1xyXG5cdH0sXHJcblx0XHJcblx0XHJcblx0Z2V0Q3ViZUZhY2VzOiBmdW5jdGlvbihtYXAsIHgsIHkpe1xyXG5cdFx0dmFyIHJldCA9IFsxLDEsMSwxXTtcclxuXHRcdHZhciB0aWxlID0gbWFwW3ldW3hdO1xyXG5cdFx0XHJcblx0XHQvLyBVcCBGYWNlXHJcblx0XHRpZiAoeSA+IDAgJiYgbWFwW3ktMV1beF0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ktMV1beF07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMF0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBMZWZ0IGZhY2VcclxuXHRcdGlmICh4IDwgNjMgJiYgbWFwW3ldW3grMV0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ldW3grMV07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMV0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBEb3duIGZhY2VcclxuXHRcdGlmICh5IDwgNjMgJiYgbWFwW3krMV1beF0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3krMV1beF07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbMl0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBSaWdodCBmYWNlXHJcblx0XHRpZiAoeCA+IDAgJiYgbWFwW3ldW3gtMV0gIT0gMCl7XHJcblx0XHRcdHZhciB0ID0gbWFwW3ldW3gtMV07XHJcblx0XHRcdGlmICh0LnkgPD0gdGlsZS55ICYmICh0LnkgKyB0LmgpID49ICh0aWxlLnkgKyB0aWxlLmgpKXtcclxuXHRcdFx0XHRyZXRbM10gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRPYmplY3RXaXRoUHJvcGVydGllczogZnVuY3Rpb24odmVydGV4QnVmZmVyLCBpbmRleEJ1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKXtcclxuXHRcdHZhciBvYmogPSB7XHJcblx0XHRcdHJvdGF0aW9uOiB2ZWMzKDAsIDAsIDApLFxyXG5cdFx0XHRwb3NpdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0dmVydGV4QnVmZmVyOiB2ZXJ0ZXhCdWZmZXIsIFxyXG5cdFx0XHRpbmRpY2VzQnVmZmVyOiBpbmRleEJ1ZmZlciwgXHJcblx0XHRcdHRleEJ1ZmZlcjogdGV4QnVmZmVyLFxyXG5cdFx0XHRkYXJrQnVmZmVyOiBkYXJrQnVmZmVyXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH0sXHJcblx0XHJcblx0Y3JlYXRlM0RPYmplY3Q6IGZ1bmN0aW9uKGdsLCBiYXNlT2JqZWN0KXtcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoYmFzZU9iamVjdC52ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudmVydGljZXMubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC50ZXhDb29yZHMubGVuZ3RoO1xyXG5cdFx0dGV4QnVmZmVyLml0ZW1TaXplID0gMjtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSBpbmRpY2VzXHJcblx0XHR2YXIgaW5kaWNlc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlc0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgVWludDE2QXJyYXkoYmFzZU9iamVjdC5pbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QuaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGJhc2VPYmplY3QuZGFya1ZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGRhcmtCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBidWZmZXIgPSB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdHRyYW5zbGF0ZU9iamVjdDogZnVuY3Rpb24ob2JqZWN0LCB0cmFuc2xhdGlvbil7XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPW9iamVjdC52ZXJ0aWNlcy5sZW5ndGg7aTxsZW47aSs9Myl7XHJcblx0XHRcdG9iamVjdC52ZXJ0aWNlc1tpXSArPSB0cmFuc2xhdGlvbi5hO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsxXSArPSB0cmFuc2xhdGlvbi5iO1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaSsyXSArPSB0cmFuc2xhdGlvbi5jO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gb2JqZWN0O1xyXG5cdH0sXHJcblx0XHJcblx0ZnV6ZU9iamVjdHM6IGZ1bmN0aW9uKG9iamVjdExpc3Qpe1xyXG5cdFx0dmFyIHZlcnRpY2VzID0gW107XHJcblx0XHR2YXIgdGV4Q29vcmRzID0gW107XHJcblx0XHR2YXIgaW5kaWNlcyA9IFtdO1xyXG5cdFx0dmFyIGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIGluZGV4Q291bnQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3RMaXN0Lmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHR2YXIgb2JqID0gb2JqZWN0TGlzdFtpXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai52ZXJ0aWNlcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dmVydGljZXMucHVzaChvYmoudmVydGljZXNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudGV4Q29vcmRzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHR0ZXhDb29yZHMucHVzaChvYmoudGV4Q29vcmRzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmluZGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGluZGljZXMucHVzaChvYmouaW5kaWNlc1tqXSArIGluZGV4Q291bnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmouZGFya1ZlcnRleC5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKG9iai5kYXJrVmVydGV4W2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aW5kZXhDb3VudCArPSBvYmoudmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHt2ZXJ0aWNlczogdmVydGljZXMsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGxvYWQzRE1vZGVsOiBmdW5jdGlvbihtb2RlbEZpbGUsIGdsKXtcclxuXHRcdHZhciBtb2RlbCA9IHtyZWFkeTogZmFsc2V9O1xyXG5cdFx0XHJcblx0XHR2YXIgaHR0cCA9IFV0aWxzLmdldEh0dHAoKTtcclxuXHRcdGh0dHAub3BlbihcIkdFVFwiLCBjcCArIFwibW9kZWxzL1wiICsgbW9kZWxGaWxlICsgXCIub2JqP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHRcdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGh0dHAucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG5cdFx0XHRcdHZhciBsaW5lcyA9IGh0dHAucmVzcG9uc2VUZXh0LnNwbGl0KFwiXFxuXCIpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB2ZXJ0aWNlcyA9IFtdLCB0ZXhDb29yZHMgPSBbXSwgdHJpYW5nbGVzID0gW10sIHZlcnRleEluZGV4ID0gW10sIHRleEluZGljZXMgPSBbXSwgaW5kaWNlcyA9IFtdLCBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcdFx0dmFyIHdvcmtpbmc7XHJcblx0XHRcdFx0dmFyIHQgPSBmYWxzZTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPWxpbmVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0dmFyIGwgPSBsaW5lc1tpXS50cmltKCk7XHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIlwiKXsgY29udGludWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdmVydGljZXNcIil7IHdvcmtpbmcgPSB2ZXJ0aWNlczsgdCA9IGZhbHNlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRleENvb3Jkc1wiKXsgd29ya2luZyA9IHRleENvb3JkczsgdCA9IHRydWU7IH1lbHNlXHJcblx0XHRcdFx0XHRpZiAobCA9PSBcIiMgdHJpYW5nbGVzXCIpeyB3b3JraW5nID0gdHJpYW5nbGVzOyB0ID0gZmFsc2U7IH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhciBwYXJhbXMgPSBsLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49cGFyYW1zLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHBhcmFtc1tqXSkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW1zW2pdID0gcGFyc2VGbG9hdChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXQpIHdvcmtpbmcucHVzaChwYXJhbXNbal0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmICh0KSB3b3JraW5nLnB1c2gocGFyYW1zKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHVzZWRWZXIgPSBbXTtcclxuXHRcdFx0XHR2YXIgdXNlZEluZCA9IFtdO1xyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dHJpYW5nbGVzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0aWYgKHVzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pICE9IC0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHVzZWRJbmRbdXNlZFZlci5pbmRleE9mKHRyaWFuZ2xlc1tpXSldKTtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHR1c2VkVmVyLnB1c2godHJpYW5nbGVzW2ldKTtcclxuXHRcdFx0XHRcdFx0dmFyIHQgPSB0cmlhbmdsZXNbaV0uc3BsaXQoXCIvXCIpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRbMF0gPSBwYXJzZUludCh0WzBdKSAtIDE7XHJcblx0XHRcdFx0XHRcdHRbMV0gPSBwYXJzZUludCh0WzFdKSAtIDE7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpbmRpY2VzLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdHVzZWRJbmQucHVzaCh2ZXJ0ZXhJbmRleC5sZW5ndGggLyAzKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZlcnRleEluZGV4LnB1c2godmVydGljZXNbdFswXSAqIDNdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDFdLCB2ZXJ0aWNlc1t0WzBdICogMyArIDJdKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRleEluZGljZXMucHVzaCh0ZXhDb29yZHNbdFsxXV1bMF0sIHRleENvb3Jkc1t0WzFdXVsxXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dGV4SW5kaWNlcy5sZW5ndGgvMjtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdFx0ZGFya1ZlcnRleC5wdXNoKDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgYmFzZSA9IHt2ZXJ0aWNlczogdmVydGV4SW5kZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4SW5kaWNlcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0XHRcdFx0dmFyIG1vZGVsM0QgPSB0aGlzLmNyZWF0ZTNET2JqZWN0KGdsLCBiYXNlKTtcclxuXHJcblx0XHRcdFx0bW9kZWwucm90YXRpb24gPSBtb2RlbDNELnJvdGF0aW9uO1xyXG5cdFx0XHRcdG1vZGVsLnBvc2l0aW9uID0gbW9kZWwzRC5wb3NpdGlvbjtcclxuXHRcdFx0XHRtb2RlbC52ZXJ0ZXhCdWZmZXIgPSBtb2RlbDNELnZlcnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5pbmRpY2VzQnVmZmVyID0gbW9kZWwzRC5pbmRpY2VzQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnRleEJ1ZmZlciA9IG1vZGVsM0QudGV4QnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLmRhcmtCdWZmZXIgPSBtb2RlbDNELmRhcmtCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwucmVhZHkgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0aHR0cC5zZW5kKCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBtb2RlbDtcclxuXHR9XHJcbn07XHJcbiIsInZhciBNaXNzaWxlID0gcmVxdWlyZSgnLi9NaXNzaWxlJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbnZhciBjaGVhdEVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbiwgZGlyZWN0aW9uLCBtYXBNYW5hZ2VyKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ1BsYXllcicpOyBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1BsYXllcicsIFBsYXllcik7XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZGlyZWN0aW9uLCBtYXBNYW5hZ2VyKXtcclxuXHRjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5yb3RhdGlvblNwZCA9IHZlYzIoTWF0aC5kZWdUb1JhZCgxKSwgTWF0aC5kZWdUb1JhZCg0KSk7XHJcblx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjU7XHJcblx0dGhpcy5tYXhWZXJ0Um90YXRpb24gPSBNYXRoLmRlZ1RvUmFkKDQ1KTtcclxuXHRcclxuXHR0aGlzLnRhcmdldFkgPSBwb3NpdGlvbi5iO1xyXG5cdHRoaXMueVNwZWVkID0gMC4wO1xyXG5cdHRoaXMueUdyYXZpdHkgPSAwLjA7XHJcblx0XHJcblx0dGhpcy5qb2cgPSB2ZWM0KDAuMCwgMSwgMC4wLCAxKTtcclxuXHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblxyXG5cdHRoaXMuaHVydCA9IDAuMDtcdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDA7XHJcblx0XHJcblx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID0gMDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLnBsYXllcjtcclxuXHRwbGF5ZXIuaHAgLT0gZG1nO1xyXG5cdGlmIChwbGF5ZXIuaHAgPD0gMCl7XHJcblx0XHRwbGF5ZXIuaHAgPSAwO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3UgZGllZCFcIik7XHJcblx0XHRnYW1lLnNhdmVNYW5hZ2VyLmRlbGV0ZUdhbWUoKTtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNhc3RNaXNzaWxlID0gZnVuY3Rpb24od2VhcG9uKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdHZhciBwcyA9IGdhbWUucGxheWVyO1xyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUodGhpcy5wb3NpdGlvbi5jbG9uZSgpLCB0aGlzLnJvdGF0aW9uLmNsb25lKCksIHdlYXBvbi5jb2RlLCAnZW5lbXknLCB0aGlzLm1hcE1hbmFnZXIpO1xyXG5cdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0bWlzc2lsZS5taXNzZWQgPSAocHJvYiA+IHBzLnN0YXRzLmRleCk7XHJcblx0Ly8gaWYgKHdlYXBvbikgd2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpO1xyXG5cdFxyXG5cdFxyXG5cdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiWW91IHNob290IFwiICsgd2VhcG9uLnN1Ykl0ZW1OYW1lKTtcclxuXHR0aGlzLm1hcE1hbmFnZXIuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gMzA7XHJcblx0dGhpcy5tb3ZlZCA9IHRydWU7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1lbGVlQXR0YWNrID0gZnVuY3Rpb24od2VhcG9uKXtcclxuXHR2YXIgZW5lbWllcyA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZXNOZWFyZXN0KHRoaXMucG9zaXRpb24sIDEuMCwgJ2VuZW15Jyk7XHJcblx0XHRcclxuXHR2YXIgeHggPSB0aGlzLnBvc2l0aW9uLmE7XHJcblx0dmFyIHp6ID0gdGhpcy5wb3NpdGlvbi5jO1xyXG5cdHZhciBkeCA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiAwLjE7XHJcblx0dmFyIGR6ID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiAwLjE7XHJcblx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MTA7aSsrKXtcclxuXHRcdHh4ICs9IGR4O1xyXG5cdFx0enogKz0gZHo7XHJcblx0XHR2YXIgb2JqZWN0O1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBqPTAsamxlbj1lbmVtaWVzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0dmFyIGlucyA9IGVuZW1pZXNbal07XHJcblx0XHRcdHZhciB4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB4eCk7XHJcblx0XHRcdHZhciB6ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmMgLSB6eik7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoeCA8IDAuMyAmJiB6IDwgMC4zKXtcclxuXHRcdFx0XHRvYmplY3QgPSBpbnM7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKG9iamVjdCAmJiBvYmplY3QuZW5lbXkpe1xyXG5cdFx0XHR0aGlzLmNhc3RBdHRhY2sob2JqZWN0LCB3ZWFwb24pO1xyXG5cdFx0XHR0aGlzLmF0dGFja1dhaXQgPSAyMDtcclxuXHRcdFx0dGhpcy5tb3ZlZCA9IHRydWU7XHJcblx0XHRcdGkgPSAxMTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNhc3RBdHRhY2sgPSBmdW5jdGlvbih0YXJnZXQsIHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgcHJvYiA9IE1hdGgucmFuZG9tKCk7XHJcblx0aWYgKHByb2IgPiBwcy5zdGF0cy5kZXgpe1xyXG5cdFx0Z2FtZS5wbGF5U291bmQoJ21pc3MnKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLnN0cik7XHJcblx0Ly92YXIgZGZzID0gVXRpbHMucm9sbERpY2UodGFyZ2V0LmVuZW15LnN0YXRzLmRmcyk7XHJcblx0dmFyIGRmcyA9IDA7XHJcblx0XHJcblx0aWYgKHdlYXBvbikgc3RyICs9IFV0aWxzLnJvbGxEaWNlKHdlYXBvbi5zdHIpICogd2VhcG9uLnN0YXR1cztcclxuXHRcclxuXHR2YXIgZG1nID0gTWF0aC5tYXgoc3RyIC0gZGZzLCAwKSA8PCAwO1xyXG5cdFxyXG5cdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQXR0YWNraW5nIFwiICsgdGFyZ2V0LmVuZW15Lm5hbWUpO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdoaXQnKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIHBvaW50cyBpbmZsaWN0ZWRcIik7XHJcblx0XHR0YXJnZXQucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHR9XHJcblx0XHJcblx0Ly9pZiAod2VhcG9uKSB3ZWFwb24uc3RhdHVzICo9ICgxLjAgLSB3ZWFwb24ud2Vhcik7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmpvZ01vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5vbldhdGVyKXtcclxuXHRcdHRoaXMuam9nLmEgKz0gMC4wMDUgKiB0aGlzLmpvZy5iO1xyXG5cdFx0aWYgKHRoaXMuam9nLmEgPj0gMC4wMyAmJiB0aGlzLmpvZy5iID09IDEpIHRoaXMuam9nLmIgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmEgPD0gLTAuMDMgJiYgdGhpcy5qb2cuYiA9PSAtMSkgdGhpcy5qb2cuYiA9IDE7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA4ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24oeFRvLCB6VG8pe1xyXG5cdHZhciBtb3ZlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHZhciBzd2ltID0gKHRoaXMub25MYXZhIHx8IHRoaXMub25XYXRlcik7XHJcblx0aWYgKHN3aW0peyB4VG8gLz0gMjsgelRvIC89MjsgfVxyXG5cdHZhciBtb3ZlbWVudCA9IHZlYzIoeFRvLCB6VG8pO1xyXG5cdHZhciBzcGQgPSB2ZWMyKHhUbyAqIDEuNSwgMCk7XHJcblx0dmFyIGZha2VQb3MgPSB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcclxuXHRmb3IgKHZhciBpPTA7aTwyO2krKyl7XHJcblx0XHR2YXIgbm9ybWFsID0gdGhpcy5tYXBNYW5hZ2VyLmdldFdhbGxOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCwgc3dpbSk7XHJcblx0XHRpZiAoIW5vcm1hbCl7IG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZU5vcm1hbChmYWtlUG9zLCBzcGQsIHRoaXMuY2FtZXJhSGVpZ2h0KTsgfSBcclxuXHRcdFxyXG5cdFx0aWYgKG5vcm1hbCl7XHJcblx0XHRcdG5vcm1hbCA9IG5vcm1hbC5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlzdCA9IG1vdmVtZW50LmRvdChub3JtYWwpO1xyXG5cdFx0XHRub3JtYWwubXVsdGlwbHkoLWRpc3QpO1xyXG5cdFx0XHRtb3ZlbWVudC5zdW0obm9ybWFsKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZmFrZVBvcy5hICs9IG1vdmVtZW50LmE7XHJcblx0XHRcclxuXHRcdHNwZCA9IHZlYzIoMCwgelRvICogMS41KTtcclxuXHR9XHJcblx0XHJcblx0aWYgKG1vdmVtZW50LmEgIT0gMCB8fCBtb3ZlbWVudC5iICE9IDApe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5hICs9IG1vdmVtZW50LmE7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmMgKz0gbW92ZW1lbnQuYjtcclxuXHRcdHRoaXMuZG9WZXJ0aWNhbENoZWNrcygpO1xyXG5cdFx0dGhpcy5qb2dNb3ZlbWVudCgpO1xyXG5cdFx0bW92ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLm1vdmVkID0gbW92ZWQ7XHJcblx0cmV0dXJuIG1vdmVkO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tb3VzZUxvb2sgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBtTW92ZW1lbnQgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5nZXRNb3VzZU1vdmVtZW50KCk7XHJcblx0XHJcblx0aWYgKG1Nb3ZlbWVudC54ICE9IC0xMDAwMCl7IHRoaXMucm90YXRpb24uYiAtPSBNYXRoLmRlZ1RvUmFkKG1Nb3ZlbWVudC54KTsgfVxyXG5cdGlmIChtTW92ZW1lbnQueSAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmEgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueSk7IH1cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0dGhpcy5tb3VzZUxvb2soKTtcclxuXHJcblx0Ly8gUm90YXRpb24gd2l0aCBrZXlib2FyZFxyXG5cdGlmIChnYW1lLmtleXNbODFdID09IDEgfHwgZ2FtZS5rZXlzWzM3XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiArPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OV0gPT0gMSB8fCBnYW1lLmtleXNbMzldID09IDEpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbi5iIC09IHRoaXMucm90YXRpb25TcGQuYjtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzM4XSA9PSAxKXsgLy8gVXAgYXJyb3dcclxuXHRcdHRoaXMucm90YXRpb24uYSArPSB0aGlzLnJvdGF0aW9uU3BkLmE7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s0MF0gPT0gMSl7IC8vIERvd24gYXJyb3dcclxuXHRcdHRoaXMucm90YXRpb24uYSAtPSB0aGlzLnJvdGF0aW9uU3BkLmE7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdHZhciBBID0gMC4wLCBCID0gMC4wO1xyXG5cdGlmIChnYW1lLmtleXNbODddID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzgzXSA9PSAxKXtcclxuXHRcdEEgPSAtTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQgKiAwLjM7XHJcblx0XHRCID0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQgKiAwLjM7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChnYW1lLmtleXNbNjVdID09IDEpe1xyXG5cdFx0QSA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYiArIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdFx0QiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5rZXlzWzY4XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgLSBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChBICE9IDAuMCB8fCBCICE9IDAuMCl7IHRoaXMubW92ZVRvKEEsIEIpOyB9ZWxzZXsgdGhpcy5qb2cuYSA9IDAuMDsgfVxyXG5cdGlmICh0aGlzLnJvdGF0aW9uLmEgPiB0aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gdGhpcy5tYXhWZXJ0Um90YXRpb247XHJcblx0ZWxzZSBpZiAodGhpcy5yb3RhdGlvbi5hIDwgLXRoaXMubWF4VmVydFJvdGF0aW9uKSB0aGlzLnJvdGF0aW9uLmEgPSAtdGhpcy5tYXhWZXJ0Um90YXRpb247XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrQWN0aW9uID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGlmIChnYW1lLmdldEtleVByZXNzZWQoMzIpKXsgLy8gU3BhY2VcclxuXHRcdHZhciB4eCA9ICh0aGlzLnBvc2l0aW9uLmEgKyBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0dmFyIHp6ID0gKHRoaXMucG9zaXRpb24uYyAtIE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiAwLjYpIDw8IDA7XHJcblx0XHRcclxuXHRcdGlmICgodGhpcy5wb3NpdGlvbi5hIDw8IDApID09IHh4ICYmICh0aGlzLnBvc2l0aW9uLmMgPDwgMCkgPT0genopIHJldHVybjtcclxuXHRcdFxyXG5cdFx0dmFyIGRvb3IgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0RG9vckF0KHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KTtcclxuXHRcdGlmIChkb29yKXsgXHJcblx0XHRcdGRvb3IuYWN0aXZhdGUoKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR2YXIgb2JqZWN0ID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeHgsIHRoaXMucG9zaXRpb24uYiwgenopKTtcclxuXHRcdFx0aWYgKG9iamVjdCAmJiBvYmplY3QuYWN0aXZhdGUpXHJcblx0XHRcdFx0b2JqZWN0LmFjdGl2YXRlKCk7XHJcblx0XHR9XHJcblx0XHRpZiAoY2hlYXRFbmFibGVkKXtcclxuXHRcdFx0aWYgKGdhbWUuZmxvb3JEZXB0aCA8IDgpXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcChmYWxzZSwgZ2FtZS5mbG9vckRlcHRoICsgMSk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKCdjb2RleFJvb20nKTtcclxuXHRcdH1cclxuXHR9ZWxzZSBpZiAoKGdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkgfHwgZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSkgJiYgdGhpcy5hdHRhY2tXYWl0ID09IDApe1x0Ly8gTWVsZWUgYXR0YWNrLCBFbnRlclxyXG5cdFx0dmFyIHdlYXBvbiA9IGdhbWUuaW52ZW50b3J5LmdldFdlYXBvbigpO1xyXG5cdFx0XHJcblx0XHRpZiAoIXdlYXBvbiB8fCAhd2VhcG9uLnJhbmdlZCl7XHJcblx0XHRcdHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA9IDU7XHJcblx0XHR9ZWxzZSBpZiAod2VhcG9uICYmIHdlYXBvbi5yYW5nZWQpe1xyXG5cdFx0XHR0aGlzLmNhc3RNaXNzaWxlKHdlYXBvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh3ZWFwb24gJiYgd2VhcG9uLnN0YXR1cyA8IDAuMDUpe1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5pbnZlbnRvcnkuZGVzdHJveUl0ZW0od2VhcG9uKTtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2Uod2VhcG9uLm5hbWUgKyBcIiBkYW1hZ2VkIVwiKTtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCg3OSkpeyAvLyBPLCBUT0RPOiBjaGFuZ2UgdG8gQ3RybCtTXHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIlNhdmluZyBnYW1lLlwiKTtcclxuXHRcdGdhbWUuc2F2ZU1hbmFnZXIuc2F2ZUdhbWUoKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiR2FtZSBTYXZlZC5cIik7XHJcblx0fVxyXG5cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuZG9WZXJ0aWNhbENoZWNrcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBvaW50WSA9IHRoaXMubWFwTWFuYWdlci5nZXRZRmxvb3IodGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdHZhciB3eSA9ICh0aGlzLm9uV2F0ZXIgfHwgdGhpcy5vbkxhdmEpPyAwLjMgOiAwO1xyXG5cdHZhciBweSA9IE1hdGguZmxvb3IoKHBvaW50WSAtICh0aGlzLnBvc2l0aW9uLmIgKyB3eSkpICogMTAwKSAvIDEwMDtcclxuXHRpZiAocHkgPD0gMC4zKSB0aGlzLnRhcmdldFkgPSBwb2ludFk7XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5pc0xhdmFQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0dGhpcy5vbldhdGVyID0gZmFsc2U7XHJcblx0XHRpZiAoIXRoaXMub25MYXZhKXtcclxuXHRcdFx0dGhpcy5yZWNlaXZlRGFtYWdlKDgwKTtcclxuXHRcdH1cclxuXHRcdHRoaXMub25MYXZhID0gdHJ1ZTtcclxuXHRcdFxyXG5cdH0gZWxzZSBpZiAodGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA9PSB0aGlzLnRhcmdldFkpXHJcblx0XHRcdHRoaXMubW92ZW1lbnRTcGQgPSAwLjAyNTtcclxuXHRcdHRoaXMub25XYXRlciA9IHRydWU7XHJcblx0XHR0aGlzLm9uTGF2YSA9IGZhbHNlO1xyXG5cdH1lbHNlIHtcclxuXHRcdHRoaXMubW92ZW1lbnRTcGQgPSAwLjA1O1xyXG5cdFx0dGhpcy5vbldhdGVyID0gZmFsc2U7XHJcblx0XHR0aGlzLm9uTGF2YSA9IGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNSArIHRoaXMuam9nLmEgKyB0aGlzLmpvZy5jO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5kb0Zsb2F0ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5vbldhdGVyICYmIHRoaXMuam9nLmEgPT0gMC4wKXtcclxuXHRcdHRoaXMuam9nLmMgKz0gMC4wMDUgKiB0aGlzLmpvZy5kO1xyXG5cdFx0aWYgKHRoaXMuam9nLmMgPj0gMC4wMyAmJiB0aGlzLmpvZy5kID09IDEpIHRoaXMuam9nLmQgPSAtMTsgZWxzZVxyXG5cdFx0aWYgKHRoaXMuam9nLmMgPD0gLTAuMDMgJiYgdGhpcy5qb2cuZCA9PSAtMSkgdGhpcy5qb2cuZCA9IDE7XHJcblx0XHR0aGlzLmNhbWVyYUhlaWdodCA9IDAuNSArIHRoaXMuam9nLmEgKyB0aGlzLmpvZy5jO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYyA9IDAuMDtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwLjApIHJldHVybjtcclxuXHRcclxuXHR0aGlzLmRvRmxvYXQoKTtcclxuXHR0aGlzLm1vdmVtZW50KCk7XHJcblx0dGhpcy5jaGVja0FjdGlvbigpO1xyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdHRoaXMuam9nLmEgPSAwLjA7XHJcblx0XHRpZiAodGhpcy5wb3NpdGlvbi5iIDw9IHRoaXMudGFyZ2V0WSkgdGhpcy5wb3NpdGlvbi5iID0gdGhpcy50YXJnZXRZO1xyXG5cdH1lbHNlIGlmICh0aGlzLnRhcmdldFkgPiB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iICs9IDAuMDg7XHJcblx0XHR0aGlzLmpvZy5hID0gMC4wO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA+PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9XHJcblx0XHJcblx0Ly90aGlzLnRhcmdldFkgPSB0aGlzLnBvc2l0aW9uLmI7XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wYXVzZWQpIHJldHVybjtcclxuXHRcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpe1xyXG5cdFx0aWYgKHRoaXMub25XYXRlciB8fCB0aGlzLm9uTGF2YSl7XHJcblx0XHRcdHRoaXMuZG9GbG9hdCgpO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuY2FtZXJhSGVpZ2h0ID4gMC4yKXsgXHJcblx0XHRcdHRoaXMuY2FtZXJhSGVpZ2h0IC09IDAuMDE7IFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRpZiAodGhpcy5vbkxhdmEpe1xyXG5cdFx0aWYgKHRoaXMubGF2YUNvdW50ZXIgPiAzMCl7XHJcblx0XHRcdHRoaXMucmVjZWl2ZURhbWFnZSg4MCk7XHJcblx0XHRcdHRoaXMubGF2YUNvdW50ZXIgPSAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5sYXZhQ291bnRlcisrO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHR9XHJcblx0aWYgKHRoaXMuYXR0YWNrV2FpdCA+IDApIHRoaXMuYXR0YWNrV2FpdCAtPSAxO1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwKSB0aGlzLmh1cnQgLT0gMTtcclxuXHRpZiAodGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID4gMCl7XHJcblx0XHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXItLTtcclxuXHRcdGlmICh0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPT0gMCl7XHJcblx0XHRcdHZhciB3ZWFwb24gPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5pbnZlbnRvcnkuZ2V0V2VhcG9uKCk7XHJcblx0XHRcdGlmICghd2VhcG9uIHx8ICF3ZWFwb24ucmFuZ2VkKVxyXG5cdFx0XHRcdHRoaXMubWVsZWVBdHRhY2sod2VhcG9uKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblx0dGhpcy5zdGVwKCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFBsYXllclN0YXRzKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdQbGF5ZXJTdGF0cycpO1xyXG5cdHRoaXMuaHAgPSAwO1xyXG5cdHRoaXMubUhQID0gMDtcclxuXHR0aGlzLm1hbmEgPSAwO1xyXG5cdHRoaXMubU1hbmEgPSAwO1xyXG5cdFxyXG5cdHRoaXMudmlydHVlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmx2bCA9IDE7XHJcblx0dGhpcy5leHAgPSAwO1xyXG5cdFxyXG5cdHRoaXMucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKSxcclxuXHRcdHN0cjogJzBEMCcsIFxyXG5cdFx0ZGZzOiAnMEQwJyxcclxuXHRcdGRleDogMCxcclxuXHRcdG1hZ2ljUG93ZXI6ICcwRDAnXHJcblx0fTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJTdGF0cztcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnUGxheWVyU3RhdHMnLCBQbGF5ZXJTdGF0cyk7XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaHAgPSAwO1xyXG5cdHRoaXMubUhQID0gMDtcclxuXHR0aGlzLm1hbmEgPSAwO1xyXG5cdHRoaXMubU1hbmEgPSAwO1xyXG5cdFxyXG5cdHRoaXMudmlydHVlID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmx2bCA9IDE7XHJcblx0dGhpcy5leHAgPSAwO1xyXG5cdFxyXG5cdHRoaXMuc3RhdHMgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpLFxyXG5cdFx0c3RyOiAnMEQwJyxcclxuXHRcdGRmczogJzBEMCcsXHJcblx0XHRkZXg6IDAsXHJcblx0XHRtYWdpY1Bvd2VyOiAnMEQwJ1xyXG5cdH07XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuYWRkRXhwZXJpZW5jZSA9IGZ1bmN0aW9uKGFtb3VudCwgY29uc29sZSl7XHJcblx0dGhpcy5leHAgKz0gYW1vdW50O1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKGFtb3VudCArIFwiIFhQIGdhaW5lZFwiKTtcclxuXHR2YXIgbmV4dEV4cCA9IChNYXRoLnBvdyh0aGlzLmx2bCwgMS41KSAqIDUwMCkgPDwgMDtcclxuXHRpZiAodGhpcy5leHAgPj0gbmV4dEV4cCl7IHRoaXMubGV2ZWxVcChjb25zb2xlKTsgfVxyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmxldmVsVXAgPSBmdW5jdGlvbihjb25zb2xlKXtcclxuXHR0aGlzLmx2bCArPSAxO1xyXG5cdFxyXG5cdC8vIFVwZ3JhZGUgSFAgYW5kIE1hbmFcclxuXHR2YXIgaHBOZXcgPSBNYXRoLmlSYW5kb20oMTAsIDI1KTtcclxuXHR2YXIgbWFuYU5ldyA9IE1hdGguaVJhbmRvbSg1LCAxNSk7XHJcblx0XHJcblx0dmFyIGhwT2xkID0gdGhpcy5tSFA7XHJcblx0dmFyIG1hbmFPbGQgPSB0aGlzLm1NYW5hO1xyXG5cdFxyXG5cdHRoaXMuaHAgICs9IGhwTmV3O1xyXG5cdHRoaXMubWFuYSArPSBtYW5hTmV3O1xyXG5cdHRoaXMubUhQICs9IGhwTmV3O1xyXG5cdHRoaXMubU1hbmEgKz0gbWFuYU5ldztcclxuXHRcclxuXHQvLyBVcGdyYWRlIGEgcmFuZG9tIHN0YXQgYnkgMS0zIHBvaW50c1xyXG5cdC8qXHJcblx0dmFyIHN0YXRzID0gWydzdHInLCAnZGZzJ107XHJcblx0dmFyIG5hbWVzID0gWydTdHJlbmd0aCcsICdEZWZlbnNlJ107XHJcblx0dmFyIHN0LCBubTtcclxuXHR3aGlsZSAoIXN0KXtcclxuXHRcdHZhciBpbmQgPSBNYXRoLmlSYW5kb20oc3RhdHMubGVuZ3RoKTtcclxuXHRcdHN0ID0gc3RhdHNbaW5kXTtcclxuXHRcdG5tID0gbmFtZXNbaW5kXTtcclxuXHR9XHJcblx0XHJcblx0dmFyIHBhcnQxID0gcGFyc2VJbnQodGhpcy5zdGF0c1tzdF0uc3Vic3RyaW5nKDAsIHRoaXMuc3RhdHNbc3RdLmluZGV4T2YoJ0QnKSksIDEwKTtcclxuXHRwYXJ0MSArPSBNYXRoLmlSYW5kb20oMSwgMyk7XHJcblx0XHJcblx0dmFyIG9sZCA9IHRoaXMuc3RhdHNbc3RdO1xyXG5cdHRoaXMuc3RhdHNbc3RdID0gcGFydDEgKyAnRDMnOyovXHJcblx0XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJMZXZlbCB1cDogXCIgKyB0aGlzLmx2bCArIFwiIVwiKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIkhQIGluY3JlYXNlZCBmcm9tIFwiICsgaHBPbGQgKyBcIiB0byBcIiArIHRoaXMubUhQKTtcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShcIk1hbmEgaW5jcmVhc2VkIGZyb20gXCIgKyBtYW5hT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1NYW5hKTtcclxuXHQvL2NvbnNvbGUuYWRkU0ZNZXNzYWdlKG5tICsgXCIgaW5jcmVhc2VkIGZyb20gXCIgKyBvbGQgKyBcIiB0byBcIiArIHRoaXMuc3RhdHNbc3RdKTtcclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5zZXRWaXJ0dWUgPSBmdW5jdGlvbih2aXJ0dWVOYW1lKXtcclxuXHR0aGlzLnZpcnR1ZSA9IHZpcnR1ZU5hbWU7XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHRzd2l0Y2ggKHZpcnR1ZU5hbWUpe1xyXG5cdFx0Y2FzZSBcIkhvbmVzdHlcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDYwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMjAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA2O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdNYWdlJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiQ29tcGFzc2lvblwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ0JhcmQnO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJWYWxvclwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdGaWdodGVyJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSG9ub3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc2JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdQYWxhZGluJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU3Bpcml0dWFsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Jhbmdlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkh1bWlsaXR5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDI7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjg7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1NoZXBoZXJkJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiU2FjcmlmaWNlXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA4MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnVGlua2VyJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiSnVzdGljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxNTA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDQ7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdEcnVpZCc7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tSFAgPSB0aGlzLmhwO1xyXG5cdHRoaXMuc3RhdHMuc3RyICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5kZnMgKz0gJ0QzJztcclxuXHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgKz0gJ0QzJztcclxuXHR0aGlzLm1NYW5hID0gdGhpcy5tYW5hO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBTYXZlTWFuYWdlcihnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMuc3RvcmFnZSA9IG5ldyBTdG9yYWdlKCk7XHJcbn1cclxuXHJcbnZhciBTdG9yYWdlID0gcmVxdWlyZSgnLi9TdG9yYWdlJyk7XHJcblxyXG5TYXZlTWFuYWdlci5wcm90b3R5cGUgPSB7XHJcblx0c2F2ZUdhbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgc2F2ZU9iamVjdCA9IHtcclxuXHRcdFx0X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdTdHlnaWFuR2FtZScpLFxyXG5cdFx0XHR2ZXJzaW9uOiB2ZXJzaW9uLCBcclxuXHRcdFx0cGxheWVyOiB0aGlzLmdhbWUucGxheWVyLFxyXG5cdFx0XHRpbnZlbnRvcnk6IHRoaXMuZ2FtZS5pbnZlbnRvcnksXHJcblx0XHRcdG1hcHM6IHRoaXMuZ2FtZS5tYXBzLFxyXG5cdFx0XHRmbG9vckRlcHRoOiB0aGlzLmdhbWUuZmxvb3JEZXB0aFxyXG5cdFx0fTtcclxuXHRcdHZhciBzZXJpYWxpemVkID0gY2lyY3VsYXIuc2VyaWFsaXplKHNhdmVPYmplY3QpO1xyXG5cdFx0XHJcblx0XHQvKnZhciBzZXJpYWxpemVkT2JqZWN0ID0gSlNPTi5wYXJzZShzZXJpYWxpemVkKTtcclxuXHRcdGNvbnNvbGUubG9nKHNlcmlhbGl6ZWRPYmplY3QpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJTaXplOiBcIitzZXJpYWxpemVkLmxlbmd0aCk7Ki9cclxuXHRcdFxyXG5cdFx0dGhpcy5zdG9yYWdlLnNldEl0ZW0oJ3N0eWdpYW5HYW1lJywgc2VyaWFsaXplZCk7XHJcblx0fSxcclxuXHRyZXN0b3JlR2FtZTogZnVuY3Rpb24oZ2FtZSl7XHJcblx0XHR2YXIgZ2FtZURhdGEgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnc3R5Z2lhbkdhbWUnKTtcclxuXHRcdGlmICghZ2FtZURhdGEpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR2YXIgZGVzZXJpYWxpemVkID0gY2lyY3VsYXIucGFyc2UoZ2FtZURhdGEsIGdhbWUpO1xyXG5cdFx0aWYgKGRlc2VyaWFsaXplZC52ZXJzaW9uICE9IHZlcnNpb24pe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRnYW1lLnBsYXllciA9IGRlc2VyaWFsaXplZC5wbGF5ZXI7XHJcblx0XHRnYW1lLmludmVudG9yeSA9IGRlc2VyaWFsaXplZC5pbnZlbnRvcnk7XHJcblx0XHRnYW1lLm1hcHMgPSBkZXNlcmlhbGl6ZWQubWFwcztcclxuXHRcdGdhbWUuZmxvb3JEZXB0aCA9IGRlc2VyaWFsaXplZC5mbG9vckRlcHRoO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHRkZWxldGVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ3N0eWdpYW5HYW1lJyk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVNYW5hZ2VyOyIsImZ1bmN0aW9uIFNlbGVjdENsYXNzKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0Q2xhc3M7XHJcblxyXG5TZWxlY3RDbGFzcy5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLmdhbWU7XHJcblx0dmFyIHBsYXllclMgPSBnYW1lLnBsYXllcjtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSB8fCBnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdHZhciBtb3VzZSA9IGdhbWUubW91c2U7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1vdXNlLmIgPj0gMjggJiYgZ2FtZS5tb3VzZS5iIDwgMTAwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbmVzdHlcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAxNzgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJDb21wYXNzaW9uXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiVmFsb3JcIik7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkp1c3RpY2VcIik7XHJcblx0XHR9ZWxzZSBpZiAoZ2FtZS5tb3VzZS5iID49IDEwMCAmJiBnYW1lLm1vdXNlLmIgPCAxNzApe1xyXG5cdFx0XHRpZiAoZ2FtZS5tb3VzZS5hIDw9IDg4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU2FjcmlmaWNlXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiSG9ub3JcIik7XHJcblx0XHRcdGVsc2UgaWYgKGdhbWUubW91c2UuYSA8PSAyNjgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJTcGlyaXR1YWxpdHlcIik7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkh1bWlsaXR5XCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAocGxheWVyUy52aXJ0dWUgIT0gbnVsbCl7XHJcblx0XHRcdGdhbWUuY3JlYXRlSW5pdGlhbEludmVudG9yeShwbGF5ZXJTLmNsYXNzTmFtZSk7XHJcblx0XHRcdGdhbWUucHJpbnRHcmVldCgpO1xyXG5cdFx0XHRnYW1lLmxvYWRNYXAoZmFsc2UsIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblNlbGVjdENsYXNzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHRcclxuXHR2YXIgdWkgPSB0aGlzLmdhbWUuZ2V0VUkoKTtcclxuXHR1aS5kcmF3SW1hZ2UodGhpcy5nYW1lLmltYWdlcy5zZWxlY3RDbGFzcywgMCwgMCk7XHJcbn07XHJcbiIsInZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ1N0YWlycycsICdiaWxsYm9hcmQnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ1N0YWlycycsIGZ1bmN0aW9uKG9iamVjdCwgZ2FtZSl7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LmJpbGxib2FyZC50ZXhCdWZmZXIgPSBnYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1tvYmplY3QuaW1nSW5kXTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLm5vUm90YXRlID0gdHJ1ZTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBTdGFpcnMoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoXCJTdGFpcnNcIik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhaXJzO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdTdGFpcnMnLCBTdGFpcnMpO1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBtYXBNYW5hZ2VyLCBkaXJlY3Rpb24pe1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMuc3RhaXJzID0gdHJ1ZTtcclxuXHRcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHJcblx0dGhpcy50YXJnZXRJZCA9IHRoaXMubWFwTWFuYWdlci5kZXB0aDtcclxuXHRpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ3VwJyl7XHJcblx0XHR0aGlzLnRhcmdldElkIC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZGlyZWN0aW9uID09ICdkb3duJyl7XHJcblx0XHR0aGlzLnRhcmdldElkICs9IDE7XHJcblx0XHR0aGlzLmltZ0luZCA9IDE7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzW3RoaXMuaW1nSW5kXTtcclxuXHR0aGlzLmJpbGxib2FyZC5ub1JvdGF0ZSA9IHRydWU7XHJcblx0XHJcblx0dGhpcy50aWxlID0gbnVsbDtcclxufVxyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMudGFyZ2V0SWQgPCA5KVxyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcChmYWxzZSwgdGhpcy50YXJnZXRJZCk7XHJcblx0ZWxzZSB7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5sb2FkTWFwKCdjb2RleFJvb20nKTtcclxuXHR9XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmdldFRpbGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRpbGUgIT0gbnVsbCkgcmV0dXJuO1xyXG5cdFxyXG5cdHRoaXMudGlsZSA9IHRoaXMubWFwTWFuYWdlci5tYXBbdGhpcy5wb3NpdGlvbi5jIDw8IDBdW3RoaXMucG9zaXRpb24uYSA8PCAwXTtcclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRpZiAodGhpcy5kaXJlY3Rpb24gPT0gJ3VwJyAmJiB0aGlzLnRpbGUuY2ggPiAxKXtcclxuXHRcdHZhciB5ID0gdGhpcy5wb3NpdGlvbi5iIDw8IDA7XHJcblx0XHRmb3IgKHZhciBpPXkrMTtpPHRoaXMudGlsZS5jaDtpKyspe1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHRwb3MuYiA9IGk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbMl07XHJcblx0XHRcdGdhbWUuZHJhd0JpbGxib2FyZChwb3MsJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbM107XHJcblx0XHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbiwnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0fWVsc2V7XHJcblx0XHRnYW1lLmRyYXdCaWxsYm9hcmQodGhpcy5wb3NpdGlvbiwnc3RhaXJzJyx0aGlzLmJpbGxib2FyZCk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmdldFRpbGUoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTtcclxuIiwiZnVuY3Rpb24gU3RvcmFnZSgpe1xyXG5cdCB0cnkge1xyXG5cdFx0IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdfX3Rlc3QnLCAndGVzdCcpO1xyXG5cdFx0IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfX3Rlc3QnKTtcclxuXHRcdCB0aGlzLmVuYWJsZWQgPSB0cnVlO1xyXG5cdCB9IGNhdGNoKGUpIHtcclxuXHRcdCB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuXHQgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG5cclxuU3RvcmFnZS5wcm90b3R5cGUgPSB7XHJcblx0c2V0SXRlbTogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG5cdH0sXHJcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24oa2V5KXtcclxuXHRcdGlmICghdGhpcy5lbmFibGVkKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuXHR9LFxyXG5cdGdldEl0ZW06IGZ1bmN0aW9uKGtleSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblx0fVxyXG59XHJcbiBcclxuIiwidmFyIFNlbGVjdENsYXNzID0gcmVxdWlyZSgnLi9TZWxlY3RDbGFzcycpO1xyXG5cclxuZnVuY3Rpb24gVGl0bGVTY3JlZW4oLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLmJsaW5rID0gMzA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVTY3JlZW47XHJcblxyXG5UaXRsZVNjcmVlbi5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZ2FtZS5nZXRLZXlQcmVzc2VkKDEzKSB8fCB0aGlzLmdhbWUuZ2V0TW91c2VCdXR0b25QcmVzc2VkKCkpe1xyXG5cdFx0aWYgKHRoaXMuZ2FtZS5zYXZlTWFuYWdlci5yZXN0b3JlR2FtZSh0aGlzLmdhbWUpKXtcclxuXHRcdFx0dGhpcy5nYW1lLnByaW50V2VsY29tZUJhY2soKTtcclxuXHRcdFx0dGhpcy5nYW1lLmxvYWRNYXAodGhpcy5nYW1lLnBsYXllci5jdXJyZW50TWFwLCB0aGlzLmdhbWUucGxheWVyLmN1cnJlbnREZXB0aCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmdhbWUuc2NlbmUgPSBuZXcgU2VsZWN0Q2xhc3ModGhpcy5nYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5UaXRsZVNjcmVlbi5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0dmFyIHVpID0gdGhpcy5nYW1lLmdldFVJKCk7XHJcblx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMudGl0bGVTY3JlZW4sIDAsIDApO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBVSShzaXplLCBjb250YWluZXIpe1xyXG5cdHRoaXMuaW5pdENhbnZhcyhzaXplLCBjb250YWluZXIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJO1xyXG5cclxuVUkucHJvdG90eXBlLmluaXRDYW52YXMgPSBmdW5jdGlvbihzaXplLCBjb250YWluZXIpe1xyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNpemUuYTtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHRjYW52YXMuc3R5bGUudG9wID0gMDtcclxuXHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0XHJcblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0dGhpcy5jdHgud2lkdGggPSBjYW52YXMud2lkdGg7XHJcblx0dGhpcy5jdHguaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHRcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cdFxyXG5cdHRoaXMuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gc2l6ZS5iO1xyXG5cdFxyXG5cdGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2sgPSBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdTcHJpdGUgPSBmdW5jdGlvbihzcHJpdGUsIHgsIHksIHN1YkltYWdlKXtcclxuXHR2YXIgeEltZyA9IHN1YkltYWdlICUgc3ByaXRlLmltZ051bTtcclxuXHR2YXIgeUltZyA9IChzdWJJbWFnZSAvIHNwcml0ZS5pbWdOdW0pIDw8IDA7XHJcblx0XHJcblx0dGhpcy5jdHguZHJhd0ltYWdlKHNwcml0ZSxcclxuXHRcdHhJbWcgKiBzcHJpdGUuaW1nV2lkdGgsIHlJbWcgKiBzcHJpdGUuaW1nSGVpZ2h0LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHQsXHJcblx0XHR4LCB5LCBzcHJpdGUuaW1nV2lkdGgsIHNwcml0ZS5pbWdIZWlnaHRcclxuXHRcdCk7XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuZHJhd1Nwcml0ZUV4dCA9IGZ1bmN0aW9uKHNwcml0ZSwgeCwgeSwgc3ViSW1hZ2UsIGltYWdlQW5nbGUpe1xyXG5cdHZhciB4SW1nID0gc3ViSW1hZ2UgJSBzcHJpdGUuaW1nTnVtO1xyXG5cdHZhciB5SW1nID0gKHN1YkltYWdlIC8gc3ByaXRlLmltZ051bSkgPDwgMDtcclxuXHRcclxuXHR0aGlzLmN0eC5zYXZlKCk7XHJcblx0dGhpcy5jdHgudHJhbnNsYXRlKHgrc3ByaXRlLnhPcmlnLCB5K3Nwcml0ZS55T3JpZyk7XHJcblx0dGhpcy5jdHgucm90YXRlKGltYWdlQW5nbGUpO1xyXG5cdFxyXG5cdHRoaXMuY3R4LmRyYXdJbWFnZShzcHJpdGUsXHJcblx0XHR4SW1nICogc3ByaXRlLmltZ1dpZHRoLCB5SW1nICogc3ByaXRlLmltZ0hlaWdodCwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0LFxyXG5cdFx0LXNwcml0ZS54T3JpZywgLXNwcml0ZS55T3JpZywgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0dGhpcy5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24odGV4dCwgeCwgeSwgY29uc29sZSl7XHJcblx0dmFyIHcgPSBjb25zb2xlLnNwYWNlQ2hhcnM7XHJcblx0dmFyIGggPSBjb25zb2xlLnNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdGZvciAodmFyIGo9MCxqbGVuPXRleHQubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0dmFyIGNoYXJhID0gdGV4dC5jaGFyQXQoaik7XHJcblx0XHR2YXIgaW5kID0gY29uc29sZS5saXN0T2ZDaGFycy5pbmRleE9mKGNoYXJhKTtcclxuXHRcdGlmIChpbmQgIT0gLTEpe1xyXG5cdFx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UoY29uc29sZS5zcHJpdGVGb250LFxyXG5cdFx0XHRcdHcgKiBpbmQsIDEsIHcsIGggLSAxLFxyXG5cdFx0XHRcdHgsIHksIHcsIGggLSAxKTtcclxuXHRcdH1cclxuXHRcdHggKz0gdztcclxuXHR9XHJcbn07XHJcblxyXG5VSS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIEF1ZGlvQVBJID0gcmVxdWlyZSgnLi9BdWRpbycpO1xyXG52YXIgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xyXG52YXIgSW52ZW50b3J5ID0gcmVxdWlyZSgnLi9JbnZlbnRvcnknKTtcclxudmFyIEl0ZW0gPSByZXF1aXJlKCcuL0l0ZW0nKTtcclxudmFyIEl0ZW1GYWN0b3J5ID0gcmVxdWlyZSgnLi9JdGVtRmFjdG9yeScpO1xyXG52YXIgTWFwTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFwTWFuYWdlcicpO1xyXG52YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgUGxheWVyU3RhdHMgPSByZXF1aXJlKCcuL1BsYXllclN0YXRzJyk7XHJcbnZhciBTYXZlTWFuYWdlciA9IHJlcXVpcmUoJy4vU2F2ZU1hbmFnZXInKTtcclxudmFyIFRpdGxlU2NyZWVuID0gcmVxdWlyZSgnLi9UaXRsZVNjcmVlbicpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL1VJJyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxudmFyIFdlYkdMID0gcmVxdWlyZSgnLi9XZWJHTCcpO1xyXG5cclxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHRcdFx0XHQgN0RSTDE1IFNvdXJjZSBDb2RlXHJcblx0XHRcdFx0XHJcblx0XHRcdEJ5IENhbWlsbyBSYW3DrXJleiAoSnVjYXJhdmUpXHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0ICAyMDE1XHJcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG5mdW5jdGlvbiBVbmRlcndvcmxkKCl7XHJcblx0dGhpcy5zaXplID0gdmVjMigzNTUsIDIwMCk7XHJcblx0XHJcblx0dGhpcy5HTCA9IG5ldyBXZWJHTCh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5VSSA9IG5ldyBVSSh0aGlzLnNpemUsIFV0aWxzLiQkKFwiZGl2R2FtZVwiKSk7XHJcblx0dGhpcy5hdWRpbyA9IG5ldyBBdWRpb0FQSSgpO1xyXG5cdFxyXG5cdHRoaXMucGxheWVyID0gbmV3IFBsYXllclN0YXRzKCk7XHJcblx0dGhpcy5pbnZlbnRvcnkgPSBuZXcgSW52ZW50b3J5KDEwKTtcclxuXHR0aGlzLmNvbnNvbGUgPSBuZXcgQ29uc29sZSgxMCwgMTAsIDMwMCwgdGhpcyk7XHJcblx0dGhpcy5zYXZlTWFuYWdlciA9IG5ldyBTYXZlTWFuYWdlcih0aGlzKTtcclxuXHR0aGlzLmZvbnQgPSAnMTBweCBcIkNvdXJpZXJcIic7XHJcblx0XHJcblx0dGhpcy5nclBhY2sgPSAnaW1nLyc7XHJcblx0XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMua2V5cyA9IFtdO1xyXG5cdHRoaXMubW91c2UgPSB2ZWMzKDAuMCwgMC4wLCAwKTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdHRoaXMuaW1hZ2VzID0ge307XHJcblx0dGhpcy5tdXNpYyA9IHt9O1xyXG5cdHRoaXMuc291bmRzID0ge307XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbXSwgZmxvb3I6IFtdLCBjZWlsOiBbXX07XHJcblx0dGhpcy5vYmplY3RUZXggPSB7fTtcclxuXHR0aGlzLm1vZGVscyA9IHt9O1xyXG5cdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMudGltZVN0b3AgPSAwO1xyXG5cdHRoaXMucHJvdGVjdGlvbiA9IDA7XHJcblx0XHJcblx0dGhpcy5mcHMgPSAoMTAwMCAvIDMwKSA8PCAwO1xyXG5cdHRoaXMubGFzdFQgPSAwO1xyXG5cdHRoaXMubnVtYmVyRnJhbWVzID0gMDtcclxuXHR0aGlzLmZpcnN0RnJhbWUgPSBEYXRlLm5vdygpO1xyXG5cdFxyXG5cdHRoaXMubG9hZEltYWdlcygpO1xyXG5cdHRoaXMubG9hZE11c2ljKCk7XHJcblx0dGhpcy5sb2FkVGV4dHVyZXMoKTtcclxuXHRcclxuXHR0aGlzLmNyZWF0ZTNET2JqZWN0cygpO1xyXG5cdEFuaW1hdGVkVGV4dHVyZS5pbml0KHRoaXMuR0wuY3R4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlM0RPYmplY3RzID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmRvb3IgPSBPYmplY3RGYWN0b3J5LmRvb3IodmVjMygwLjUsMC43NSwwLjEpLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCwgZmFsc2UpO1xyXG5cdHRoaXMuZG9vclcgPSBPYmplY3RGYWN0b3J5LmRvb3JXYWxsKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5kb29yQyA9IE9iamVjdEZhY3RvcnkuY3ViZSh2ZWMzKDEuMCwxLjAsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsMS4wLDAuMCksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHR0aGlzLnNsb3BlID0gT2JqZWN0RmFjdG9yeS5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMuR0wuY3R4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zb3VuZHMuaGl0ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIndhdi9oaXQud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5zb3VuZHMubWlzcyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvbWlzcy53YXY/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24xID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wOF8tX1VsdGltYV80Xy1fQzY0Xy1fRHVuZ2VvbnMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNdXNpY1Bvc3QgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjIgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzEyXy1fVWx0aW1hXzVfLV9DNjRfLV9Mb3JkX0JsYWNrdGhvcm4ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24zID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wNV8tX1VsdGltYV8zXy1fQzY0Xy1fQ29tYmF0Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfM18tX0M2NF8tX0V4b2R1cydfQ2FzdGxlLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDRfLV9VbHRpbWFfNV8tX0M2NF8tX0VuZ2FnZW1lbnRfYW5kX01lbGVlLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uNiA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDNfLV9VbHRpbWFfNF8tX0M2NF8tX0xvcmRfQnJpdGlzaCdzX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjcgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzExXy1fVWx0aW1hXzVfLV9DNjRfLV9Xb3JsZHNfQmVsb3cub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb244ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMF8tX1VsdGltYV81Xy1fQzY0Xy1fSGFsbHNfb2ZfRG9vbS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuY29kZXhSb29tID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8wN18tX1VsdGltYV80Xy1fQzY0Xy1fU2hyaW5lcy5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEltYWdlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbWFnZXMuaXRlbXNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpdGVtc1VJLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDgsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5zcGVsbHNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzcGVsbHNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA0LCBpbWdWTnVtOiA0fSk7XHJcblx0dGhpcy5pbWFnZXMudGl0bGVTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0aXRsZVNjcmVlbi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmRpbmcucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2VsZWN0Q2xhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzZWxlY3RDbGFzcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogMSwgaW1nVk51bTogMn0pO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeURyb3AgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlEcm9wLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlTZWxlY3RlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeV9zZWxlY3RlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5zY3JvbGxGb250ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2Nyb2xsRm9udFdoaXRlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnJlc3RhcnQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyZXN0YXJ0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnBhdXNlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInBhdXNlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ2aWV3cG9ydFdlYXBvbnMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLmNvbXBhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjb21wYXNzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge3hPcmlnOiAxMSwgeU9yaWc6IDExLCBpbWdOdW06IDIsIGltZ1ZOdW06IDF9KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRUZXh0dXJlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbbnVsbF0sIGZsb29yOiBbbnVsbF0sIGNlaWw6IFtudWxsXSwgd2F0ZXI6IFtudWxsXX07XHJcblx0XHJcblx0Ly8gTm8gVGV4dHVyZVxyXG5cdHZhciBub1RleCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcIm5vVGV4dHVyZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKG5vVGV4KTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKG5vVGV4KTtcclxuXHRcclxuXHQvLyBXYWxsc1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYWxsMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDYucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gRmxvb3JzXHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vcls1MF0gPSAodGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SG9sZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUwLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gTGlxdWlkc1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleExhdmEwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHRcclxuXHQvLyBDZWlsaW5nc1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleENlaWwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWxbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEl0ZW1zXHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhJdGVtcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg4LCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXNNaXNjID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4TWlzYy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zTWlzYy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoOCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFNwZWxscy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwZWxscy5idWZmZXJzID0gQW5pbWF0ZWRUZXh0dXJlLmdldFRleHR1cmVCdWZmZXJDb29yZHMoNCwgNCwgdGhpcy5HTC5jdHgpO1xyXG5cdFxyXG5cdC8vIE1hZ2ljIEJvbHRzXHJcblx0dGhpcy5vYmplY3RUZXguYm9sdHMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhCb2x0cy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJvbHRzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gU3RhaXJzXHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4U3RhaXJzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3JkcygyLCAyLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gRW5lbWllc1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNwaWRlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNwaWRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDMsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnRyb2xsX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4VHJvbGxSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA0LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5nYXplcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdhemVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2hvc3RfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHaG9zdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDYsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmhlYWRsZXNzX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4SGVhZGxlc3NSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA3LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5vcmNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPcmNSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5yZWFwZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhSZWFwZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5za2VsZXRvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNrZWxldG9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4LmRhZW1vbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleERhZW1vblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5tb25nYmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TW9uZ2JhdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5oeWRyYV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEh5ZHJhUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNlYVNlcnBlbnRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhTZWFTZXJwZW50UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9jdG9wdXNfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhPY3RvcHVzUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhbHJvbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEJhbHJvblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5saWNoZV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleExpY2hlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmdob3N0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2hvc3RSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ3JlbWxpbl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdyZW1saW5SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZHJhZ29uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RHJhZ29uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lnpvcm5fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhab3JuUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdFxyXG5cdHRoaXMub2JqZWN0VGV4Lndpc3BfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhXaXNwUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm1hZ2VfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhNYWdlUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJhbmdlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJhbmdlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5maWdodGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RmlnaHRlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5iYXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4QmFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5sYXZhTGl6YXJkX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGF2YUxpemFyZFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBvc3RMb2FkaW5nID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmNvbnNvbGUuY3JlYXRlU3ByaXRlRm9udCh0aGlzLmltYWdlcy5zY3JvbGxGb250LCBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5IT8sLi9cIiwgNyk7XHJcblx0dGhpcy5sb2FkTXVzaWNQb3N0KCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5zdG9wTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuYXVkaW8uc3RvcE11c2ljKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wbGF5TXVzaWMgPSBmdW5jdGlvbihtdXNpY0NvZGUsIGxvb3Ape1xyXG5cdHZhciBhdWRpb0YgPSB0aGlzLm11c2ljW211c2ljQ29kZV07XHJcblx0aWYgKCFhdWRpb0YpIHJldHVybiBudWxsO1xyXG5cdHRoaXMuc3RvcE11c2ljKCk7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBsb29wLCB0cnVlLCAwLjIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRDb2RlKXtcclxuXHR2YXIgYXVkaW9GID0gdGhpcy5zb3VuZHNbc291bmRDb2RlXTtcclxuXHRpZiAoIWF1ZGlvRikgcmV0dXJuIG51bGw7XHJcblx0dGhpcy5hdWRpby5wbGF5U291bmQoYXVkaW9GLCBmYWxzZSwgZmFsc2UsIDAuMyk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRVSSA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHRoaXMuVUkuY3R4O1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0VGV4dHVyZUJ5SWQgPSBmdW5jdGlvbih0ZXh0dXJlSWQsIHR5cGUpe1xyXG5cdGlmICghdGhpcy50ZXh0dXJlc1t0eXBlXVt0ZXh0dXJlSWRdKSB0ZXh0dXJlSWQgPSAxO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLnRleHR1cmVzW3R5cGVdW3RleHR1cmVJZF07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRPYmplY3RUZXh0dXJlID0gZnVuY3Rpb24odGV4dHVyZUNvZGUpe1xyXG5cdGlmICghdGhpcy5vYmplY3RUZXhbdGV4dHVyZUNvZGVdKSB0aHJvdyBcIkludmFsaWQgdGV4dHVyZSBjb2RlOiBcIiArIHRleHR1cmVDb2RlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLm9iamVjdFRleFt0ZXh0dXJlQ29kZV07XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTWFwID0gZnVuY3Rpb24obWFwLCBkZXB0aCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdGlmIChkZXB0aCA9PT0gdW5kZWZpbmVkIHx8ICFnYW1lLm1hcHNbZGVwdGggLSAxXSl7XHJcblx0XHRnYW1lLm1hcCA9IG5ldyBNYXBNYW5hZ2VyKCk7XHJcblx0XHRnYW1lLm1hcC5pbml0KGdhbWUsIG1hcCwgZGVwdGgpO1xyXG5cdFx0Z2FtZS5mbG9vckRlcHRoID0gZGVwdGg7XHJcblx0XHRnYW1lLm1hcHMucHVzaChnYW1lLm1hcCk7XHJcblx0fWVsc2UgaWYgKGdhbWUubWFwc1tkZXB0aCAtIDFdKXtcclxuXHRcdGdhbWUubWFwID0gZ2FtZS5tYXBzW2RlcHRoIC0gMV07XHJcblx0fVxyXG5cdGdhbWUuc2NlbmUgPSBudWxsO1xyXG5cdGlmIChkZXB0aClcclxuXHRcdGdhbWUucGxheU11c2ljKCdkdW5nZW9uJytkZXB0aCwgdHJ1ZSk7XHJcblx0ZWxzZSBpZiAobWFwID09PSAnY29kZXhSb29tJylcclxuXHRcdGdhbWUucGxheU11c2ljKCdjb2RleFJvb20nLCB0cnVlKTtcclxuXHRnYW1lLnBsYXllci5jdXJyZW50TWFwID0gbWFwO1xyXG5cdGdhbWUucGxheWVyLmN1cnJlbnREZXB0aCA9IGRlcHRoO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRHcmVldCA9IGZ1bmN0aW9uKCl7XHJcblx0Ly8gU2hvd3MgYSB3ZWxjb21lIG1lc3NhZ2Ugd2l0aCB0aGUgZ2FtZSBpbnN0cnVjdGlvbnMuXHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIllvdSBlbnRlciB0aGUgbGVnZW5kYXJ5IFN0eWdpYW4gQWJ5c3MuXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJVc2UgUS1XLUUgdG8gbW92ZSBmb3J3YXJkLCBBLVMtRCB0byBzdHJhZmUgYW5kIHN0ZXAgYmFja1wiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUHJlc3MgU3BhY2UgYmFyIHRvIGludGVyYWN0IGFuZCBFbnRlciB0byBhdHRhY2tcIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlByZXNzIFQgdG8gZHJvcCBvYmplY3RzIGFuZCBPIHRvIFNhdmUgeW91ciBnYW1lXCIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucHJpbnRXZWxjb21lQmFjayA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlwiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJcIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIllvdSB3YWtlIHVwLlwiKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaW52ZW50b3J5LnJlc2V0KCk7XHJcblx0dGhpcy5wbGF5ZXIucmVzZXQoKTtcclxuXHRcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLm1hcCA9IG51bGw7XHJcblx0dGhpcy5zY2VuZSA9IG51bGw7XHJcblx0dGhpcy5jb25zb2xlLm1lc3NhZ2VzID0gW107XHRcclxuXHR0aGlzLnNjZW5lID0gbmV3IFRpdGxlU2NyZWVuKHRoaXMpO1xyXG5cdHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEdhbWUgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHRcclxuXHRpZiAoZ2FtZS5HTC5hcmVJbWFnZXNSZWFkeSgpICYmIGdhbWUuYXVkaW8uYXJlU291bmRzUmVhZHkoKSl7XHJcblx0XHRnYW1lLnBvc3RMb2FkaW5nKCk7XHJcblx0XHRnYW1lLm5ld0dhbWUoKTtcclxuXHR9ZWxzZXtcclxuXHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb2FkR2FtZSgpOyB9KTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0cmV0dXJuIHRoaXMuaW52ZW50b3J5LmFkZEl0ZW0oaXRlbSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCB0ZXh0dXJlKXtcclxuXHR2YXIgY2FtZXJhID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHRoaXMuR0wuZHJhd09iamVjdChvYmplY3QsIGNhbWVyYSwgdGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmxvY2sgPSBmdW5jdGlvbihibG9ja09iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KGJsb2NrT2JqZWN0LCBjYW1lcmEsIHRoaXMuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yV2FsbCA9IGZ1bmN0aW9uKHgsIHksIHosIHRleElkLCB2ZXJ0aWNhbCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yVy5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblx0aWYgKHZlcnRpY2FsKSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLE1hdGguUElfMiwwKTsgZWxzZSBnYW1lLmRvb3JXLnJvdGF0aW9uLnNldCgwLDAsMCk7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vclcsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JDdWJlID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JDLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vckMucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yQywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vciA9IGZ1bmN0aW9uKHgsIHksIHosIHJvdGF0aW9uLCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5kb29yLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRnYW1lLmRvb3Iucm90YXRpb24uYiA9IHJvdGF0aW9uO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3IsIGNhbWVyYSwgZ2FtZS5vYmplY3RUZXhbdGV4SWRdLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Zsb29yID0gZnVuY3Rpb24oZmxvb3JPYmplY3QsIHRleElkLCB0eXBlT2Ype1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdHZhciBmdCA9IHR5cGVPZjtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZmxvb3JPYmplY3QsIGNhbWVyYSwgZ2FtZS5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgZnQpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0JpbGxib2FyZCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB0ZXhJZCwgYmlsbGJvYXJkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRpZiAoIWJpbGxib2FyZCkgYmlsbGJvYXJkID0gZ2FtZS5iaWxsYm9hcmQ7XHJcblx0XHJcblx0YmlsbGJvYXJkLnBvc2l0aW9uLnNldChwb3NpdGlvbik7XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGJpbGxib2FyZCwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3U2xvcGUgPSBmdW5jdGlvbihzbG9wZU9iamVjdCwgdGV4SWQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuR0wuZHJhd09iamVjdChzbG9wZU9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcImZsb29yXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd1VJID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIHBsYXllciA9IGdhbWUubWFwLnBsYXllcjtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHRpZiAoIXBsYXllcikgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBjdHggPSBnYW1lLlVJLmN0eDtcclxuXHRcclxuXHQvLyBEcmF3IGhlYWx0aCBiYXJcclxuXHR2YXIgaHAgPSBwcy5ocCAvIHBzLm1IUDtcclxuXHRjdHguZmlsbFN0eWxlID0gKHBzLnBvaXNvbmVkKT8gXCJyZ2IoMTIyLDAsMTIyKVwiIDogXCJyZ2IoMTIyLDAsMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCw4LDc1LDQpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigyMDAsMCwyMDApXCIgOiBcInJnYigyMDAsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsKDc1ICogaHApIDw8IDAsNCk7XHJcblx0XHJcblx0Ly8gRHJhdyBtYW5hXHJcblx0dmFyIG1hbmEgPSBwcy5tYW5hIC8gcHMubU1hbmE7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKDE4MSw5OCwyMClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiw2MCwyKTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LDEzOCwyOClcIjtcclxuXHRjdHguZmlsbFJlY3QoOCwxNiwoNjAgKiBtYW5hKSA8PCAwLDIpO1xyXG5cdFxyXG5cdC8vIERyYXcgSW52ZW50b3J5XHJcblx0aWYgKHRoaXMuc2V0RHJvcEl0ZW0pXHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5RHJvcCwgOTAsIDYsIDApO1xyXG5cdGVsc2VcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAwKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW52ZW50b3J5Lml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdHZhciBzcHIgPSBpdGVtLnRleCArICdfdWknO1xyXG5cclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSAmJiAoaXRlbS50eXBlID09ICd3ZWFwb24nIHx8IGl0ZW0udHlwZSA9PSAnYXJtb3VyJykgJiYgaXRlbS5lcXVpcHBlZClcclxuXHRcdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeVNlbGVjdGVkLCA5MCArICgyMiAqIGkpLCA2LCAwKTtcdFx0XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXNbc3ByXSwgOTMgKyAoMjIgKiBpKSwgOSwgaXRlbS5zdWJJbWcpO1xyXG5cdH1cclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5LCA5MCwgNiwgMSk7XHJcblx0XHJcblx0Ly8gSWYgdGhlIHBsYXllciBpcyBodXJ0IGRyYXcgYSByZWQgc2NyZWVuXHJcblx0aWYgKHBsYXllci5odXJ0ID4gMC4wKXtcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjUpXCI7XHJcblx0XHRjdHguZmlsbFJlY3QoMCwwLGN0eC53aWR0aCxjdHguaGVpZ2h0KTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wcm90ZWN0aW9uID4gMC4wKXtcdC8vIElmIHRoZSBwbGF5ZXIgaGFzIHByb3RlY3Rpb24gdGhlbiBkcmF3IGl0IHNsaWdodGx5IGJsdWVcclxuXHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYmEoNDAsNDAsMjU1LDAuMilcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAocGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucmVzdGFydCwgODUsIDk0LCAwKTtcclxuXHR9ZWxzZSBpZiAodGhpcy5wYXVzZWQpe1xyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnBhdXNlZCwgMTQ3LCA5NCwgMCk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0xldmVsICcrdGhpcy5mbG9vckRlcHRoLCAxMCwyNCx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQodGhpcy5wbGF5ZXIuY2xhc3NOYW1lLCAxMCwzMSx0aGlzLmNvbnNvbGUpO1xyXG5cdHRoaXMuVUkuZHJhd1RleHQoJ0hQOiAnK3BzLmhwLCAxMCw5LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTWFuYTonK3BzLm1hbmEsIDEwLDE3LHRoaXMuY29uc29sZSk7XHJcblxyXG5cdC8vIERyYXcgdGhlIGNvbXBhc3NcclxuXHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuY29tcGFzcywgMzIwLCAxMiwgMCk7XHJcblx0dGhpcy5VSS5kcmF3U3ByaXRlRXh0KHRoaXMuaW1hZ2VzLmNvbXBhc3MsIDMyMCwgMTIsIDEsIE1hdGguUEkgKyB0aGlzLm1hcC5wbGF5ZXIucm90YXRpb24uYik7XHJcblxyXG5cdHZhciB3ZWFwb24gPSB0aGlzLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRpZiAod2VhcG9uICYmIHdlYXBvbi52aWV3UG9ydEltZyA+PSAwKVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLnZpZXdwb3J0V2VhcG9ucywgMTYwLCAxMzAgKyB0aGlzLm1hcC5wbGF5ZXIubGF1bmNoQXR0YWNrQ291bnRlciAqIDIgLSB0aGlzLm1hcC5wbGF5ZXIuYXR0YWNrV2FpdCAqIDEuNSwgd2VhcG9uLnZpZXdQb3J0SW1nKTtcclxuXHRnYW1lLmNvbnNvbGUucmVuZGVyKDgsIDEyMCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5hZGRFeHBlcmllbmNlID0gZnVuY3Rpb24oZXhwUG9pbnRzKXtcclxuXHR0aGlzLnBsYXllci5hZGRFeHBlcmllbmNlKGV4cFBvaW50cywgdGhpcy5jb25zb2xlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkgPSBmdW5jdGlvbihjbGFzc05hbWUpe1xyXG5cdHRoaXMuaW52ZW50b3J5Lml0ZW1zID0gW107XHJcblx0XHJcblx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdteXN0aWNTd29yZCcsIDEuMCk7XHJcblx0aXRlbS5lcXVpcHBlZCA9IHRydWU7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChpdGVtKTtcclxuXHRcclxuXHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ215c3RpYycsIDEuMCk7XHJcblx0aXRlbS5lcXVpcHBlZCA9IHRydWU7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChpdGVtKTtcclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnTWFnZSc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ21pc3NpbGUnKSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdEcnVpZCc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0Y2FzZSAnQmFyZCc6IGNhc2UgJ1BhbGFkaW4nOiBjYXNlICdSYW5nZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdoZWFsJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdsaWdodCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnQmFyZCc6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRjYXNlICdUaW5rZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0ZGVmYXVsdDpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdyZWRQb3Rpb24nKSk7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0c3dpdGNoIChjbGFzc05hbWUpe1xyXG5cdGNhc2UgJ0RydWlkJzogY2FzZSAnUmFuZ2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnYm93JywgMC42KSk7XHJcblx0XHRicmVhaztcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnVGlua2VyJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnc2xpbmcnLCAwLjcpKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdFxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUudXNlSXRlbSA9IGZ1bmN0aW9uKGluZGV4KXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2luZGV4XTtcclxuXHR2YXIgcHMgPSB0aGlzLnBsYXllcjtcclxuXHR2YXIgcCA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRwLm1vdmVkID0gdHJ1ZTtcclxuXHRzd2l0Y2ggKGl0ZW0uY29kZSl7XHJcblx0XHRjYXNlICdyZWRQb3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnYXJsaWMgcG90aW9uIGN1cmVzIHlvdS5cIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3RoaW5nIGhhcHBlbnNcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd5ZWxsb3dQb3Rpb24nOlxyXG5cdFx0XHR2YXIgaGVhbCA9IDEwMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2luc2VuZyBwb3Rpb24gaGVhbHMgeW91IGZvciBcIitoZWFsICsgXCIgcG9pbnRzLlwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpbmRleCk7XHJcbn1cclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFjdGl2ZVNwZWxsID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdFxyXG5cdGlmIChwcy5tYW5hIDwgaXRlbS5tYW5hKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3QgZW5vdWdoIG1hbmFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHBzLm1hbmEgPSBNYXRoLm1heChwcy5tYW5hIC0gaXRlbS5tYW5hLCAwKTtcclxuXHRcclxuXHRzd2l0Y2ggKGl0ZW0uY29kZSl7XHJcblx0XHRjYXNlICdjdXJlJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1ghXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiQU4gTk9YLi4uXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncmVkUG90aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucGxheWVyLnBvaXNvbmVkKXtcclxuXHRcdFx0XHR0aGlzLnBsYXllci5wb2lzb25lZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2FybGljIHBvdGlvbiBjdXJlcyB5b3UuXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTm90aGluZyBoYXBwZW5zXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaGVhbCc6XHJcblx0XHRcdHZhciBoZWFsID0gKHRoaXMucGxheWVyLm1IUCAqIGl0ZW0ucGVyY2VudCkgPDwgMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNQU5JISBcIitoZWFsICsgXCIgcG9pbnRzIGhlYWxlZFwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd5ZWxsb3dQb3Rpb24nOlxyXG5cdFx0XHR2YXIgaGVhbCA9IDEwMDtcclxuXHRcdFx0dGhpcy5wbGF5ZXIuaHAgPSBNYXRoLm1pbih0aGlzLnBsYXllci5ocCArIGhlYWwsIHRoaXMucGxheWVyLm1IUCk7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgZ2luc2VuZyBwb3Rpb24gaGVhbHMgeW91IGZvciBcIitoZWFsICsgXCIgcG9pbnRzLlwiKTtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdsaWdodCc6XHJcblx0XHRcdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5HTC5saWdodCA9IGl0ZW0ubGlnaHRUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBMT1IhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnbWlzc2lsZSc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdtYWdpY01pc3NpbGUnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiR1JBViBQT1IhXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ljZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnaWNlQmFsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJWQVMgRlJJTyFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAncmVwZWwnOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2JsaW5rJzpcclxuXHRcdFx0dmFyIGxhc3RQb3MgPSBudWxsO1xyXG5cdFx0XHR2YXIgcG9ydGVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLm1hcC5wbGF5ZXIucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpciA9IHRoaXMubWFwLnBsYXllci5yb3RhdGlvbjtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBkeCA9IE1hdGguY29zKGRpci5iKTtcclxuXHRcdFx0dmFyIGR6ID0gLU1hdGguc2luKGRpci5iKTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPDE1O2krKyl7XHJcblx0XHRcdFx0cG9zLmEgKz0gZHg7XHJcblx0XHRcdFx0cG9zLmMgKz0gZHo7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGN4ID0gcG9zLmEgPDwgMDtcclxuXHRcdFx0XHR2YXIgY3kgPSBwb3MuYyA8PCAwO1xyXG5cdFx0XHRcdGlmICh0aGlzLm1hcC5pc1NvbGlkKGN4LCBjeSkpe1xyXG5cdFx0XHRcdFx0aWYgKGxhc3RQb3Mpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdFx0bGFzdFBvcy5zdW0odmVjMygwLjUsMCwwLjUpKTtcclxuXHRcdFx0XHRcdFx0dmFyIHBvcnRlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHAucG9zaXRpb24gPSBsYXN0UG9zO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGkgPSAxNTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGlmICghdGhpcy5tYXAuaXNXYXRlclBvc2l0aW9uKGN4LCBjeSkpe1xyXG5cdFx0XHRcdFx0XHR2YXIgaW5zID0gdGhpcy5tYXAuZ2V0SW5zdGFuY2VBdEdyaWQocG9zKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFpbnMpe1xyXG5cdFx0XHRcdFx0XHRcdGxhc3RQb3MgPSB2ZWMzKGN4LCBwb3MuYiwgY3kpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIXBvcnRlZCl7XHJcblx0XHRcdFx0aWYgKGxhc3RQb3Mpe1xyXG5cdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFBPUiFcIik7XHJcblx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2ZpcmViYWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZShwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2ZpcmVCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGTEFNIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdwcm90ZWN0aW9uJzpcclxuXHRcdFx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMucHJvdGVjdGlvbiA9IGl0ZW0ucHJvdFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFNBTkNUIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3RpbWUnOlxyXG5cdFx0XHRpZiAodGhpcy50aW1lU3RvcCA+IDApe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMudGltZVN0b3AgPSBpdGVtLnN0b3BUaW1lO1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJSRUwgVFlNIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3NsZWVwJzpcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIFpVIVwiKTtcclxuXHRcdFx0dmFyIGluc3RhbmNlcyA9IHRoaXMubWFwLmdldEluc3RhbmNlc05lYXJlc3QocC5wb3NpdGlvbiwgNiwgJ2VuZW15Jyk7XHJcblx0XHRcdGZvciAodmFyIGk9MCxsZW49aW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0XHRcdGluc3RhbmNlc1tpXS5zbGVlcCA9IGl0ZW0uc2xlZXBUaW1lO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnamlueCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndHJlbW9yJzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdraWxsJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZShwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ2tpbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiWEVOIENPUlAhXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyb3BJdGVtID0gZnVuY3Rpb24oaSl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBjbGVhblBvcyA9IHRoaXMubWFwLmdldE5lYXJlc3RDbGVhbkl0ZW1UaWxlKHBsYXllci5wb3NpdGlvbi5hLCBwbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0aWYgKCFjbGVhblBvcyl7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdDYW4gbm90IGRyb3AgaXQgaGVyZScpO1xyXG5cdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIGRyb3BwZWQnKTtcclxuXHRcdGNsZWFuUG9zLmEgKz0gMC41O1xyXG5cdFx0Y2xlYW5Qb3MuYyArPSAwLjU7XHJcblx0XHRcclxuXHRcdHZhciBuSXQgPSBuZXcgSXRlbSgpO1xyXG5cdFx0bkl0LmluaXQoY2xlYW5Qb3MsIG51bGwsIHRoaXMubWFwKTtcclxuXHRcdG5JdC5zZXRJdGVtKGl0ZW0pO1xyXG5cdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobkl0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaSk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY2hlY2tJbnZDb250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcGxheWVyID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdFxyXG5cdGlmIChwbGF5ZXIgJiYgcGxheWVyLmRlc3Ryb3llZCl7XHJcblx0XHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDgyKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpO1xyXG5cdFx0XHR0aGlzLm5ld0dhbWUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aWYgKCFwbGF5ZXIgfHwgcGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODApKXtcclxuXHRcdHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5wYXVzZWQpIHJldHVybjtcclxuXHRpZiAodGhpcy5nZXRLZXlQcmVzc2VkKDg0KSl7XHJcblx0XHRpZiAoIXRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdTZWxlY3QgdGhlIGl0ZW0gdG8gZHJvcCcpO1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gdHJ1ZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0dGhpcy5zZXREcm9wSXRlbSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTA7aTwxMDtpKyspe1xyXG5cdFx0dmFyIGluZGV4ID0gNDkgKyBpO1xyXG5cdFx0aWYgKGkgPT0gOSlcclxuXHRcdFx0aW5kZXggPSA0ODtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoaW5kZXgpKXtcclxuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpXTtcclxuXHRcdFx0aWYgKCFpdGVtKXtcclxuXHRcdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKCdObyBpdGVtJyk7XHJcblx0XHRcdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAodGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdFx0dGhpcy5kcm9wSXRlbShpKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGl0ZW0udHlwZSA9PSAnd2VhcG9uJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdpZWxkZWQnKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ2FybW91cicgJiYgIWl0ZW0uZXF1aXBwZWQpe1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoaXRlbS5uYW1lICsgJyB3b3JlJyk7XHJcblx0XHRcdFx0dGhpcy5pbnZlbnRvcnkuZXF1aXBJdGVtKGkpO1xyXG5cdFx0XHR9ZWxzZSBpZiAoaXRlbS50eXBlID09ICdtYWdpYycpe1xyXG5cdFx0XHRcdHRoaXMuYWN0aXZlU3BlbGwoaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3BvdGlvbicpe1xyXG5cdFx0XHRcdHRoaXMudXNlSXRlbShpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gXHJcblx0XHJcblx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmIChwcy5wb3Rpb25zID4gMCl7XHJcblx0XHRpZiAocHMuaHAgPT0gcHMubUhQKXtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkhlYWx0aCBpcyBhbHJlYWR5IGF0IG1heFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRwcy5wb3Rpb25zIC09IDE7XHJcblx0XHRwcy5ocCA9IE1hdGgubWluKHBzLm1IUCwgcHMuaHAgKyA1KTtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQb3Rpb24gdXNlZFwiKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJObyBtb3JlIHBvdGlvbnMgbGVmdC5cIik7XHJcblx0fVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2xvYmFsTG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMucHJvdGVjdGlvbiA+IDApeyB0aGlzLnByb3RlY3Rpb24gLT0gMTsgfVxyXG5cdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7IHRoaXMudGltZVN0b3AgLT0gMTsgfVxyXG5cdGlmICh0aGlzLkdMLmxpZ2h0ID4gMCl7IHRoaXMuR0wubGlnaHQgLT0gMTsgfVxyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG5cdHZhciBkVCA9IChub3cgLSBnYW1lLmxhc3RUKTtcclxuXHRcclxuXHQvLyBMaW1pdCB0aGUgZ2FtZSB0byB0aGUgYmFzZSBzcGVlZCBvZiB0aGUgZ2FtZVxyXG5cdGlmIChkVCA+IGdhbWUuZnBzKXtcclxuXHRcdGdhbWUubGFzdFQgPSBub3cgLSAoZFQgJSBnYW1lLmZwcyk7XHJcblx0XHRcclxuXHRcdGlmICghZ2FtZS5HTC5hY3RpdmUpe1xyXG5cdFx0XHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTsgXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMubWFwICE9IG51bGwpe1xyXG5cdFx0XHR2YXIgZ2wgPSBnYW1lLkdMLmN0eDtcclxuXHRcdFx0XHJcblx0XHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHRcdFx0Z2FtZS5VSS5jbGVhcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0Z2FtZS5nbG9iYWxMb29wKCk7XHJcblx0XHRcdGdhbWUuY2hlY2tJbnZDb250cm9sKCk7XHJcblx0XHRcdGdhbWUubWFwLmxvb3AoKTtcclxuXHRcdFx0XHJcblx0XHRcdGdhbWUuZHJhd1VJKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLnNjZW5lICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLnNjZW5lLmxvb3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvb3AoKTsgfSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRLZXlQcmVzc2VkID0gZnVuY3Rpb24oa2V5Q29kZSl7XHJcblx0aWYgKHRoaXMua2V5c1trZXlDb2RlXSA9PSAxKXtcclxuXHRcdHRoaXMua2V5c1trZXlDb2RlXSA9IDI7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZ2V0TW91c2VCdXR0b25QcmVzc2VkID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tb3VzZS5jID09IDEpe1xyXG5cdFx0dGhpcy5tb3VzZS5jID0gMjtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRNb3VzZU1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcmV0ID0ge3g6IHRoaXMubW91c2VNb3ZlbWVudC54LCB5OiB0aGlzLm1vdXNlTW92ZW1lbnQueX07XHJcblx0dGhpcy5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHRcclxuXHRyZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVXRpbHMuYWRkRXZlbnQod2luZG93LCBcImxvYWRcIiwgZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IG5ldyBVbmRlcndvcmxkKCk7XHJcblx0Z2FtZS5sb2FkR2FtZSgpO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDgpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUua2V5c1tlLmtleUNvZGVdID09IDIpIHJldHVybjtcclxuXHRcdGdhbWUua2V5c1tlLmtleUNvZGVdID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJrZXl1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChlLmtleUNvZGUgPT0gOCl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRnYW1lLmtleXNbZS5rZXlDb2RlXSA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0dmFyIGNhbnZhcyA9IGdhbWUuVUkuY2FudmFzO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAod2luZG93LmV2ZW50KSBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tYXAgIT0gbnVsbClcclxuXHRcdFx0Y2FudmFzLnJlcXVlc3RQb2ludGVyTG9jaygpO1xyXG5cdFx0XHJcblx0XHRnYW1lLm1vdXNlLmEgPSBNYXRoLnJvdW5kKChlLmNsaWVudFggLSBjYW52YXMub2Zmc2V0TGVmdCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYiA9IE1hdGgucm91bmQoKGUuY2xpZW50WSAtIGNhbnZhcy5vZmZzZXRUb3ApIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1vdXNlLmMgPT0gMikgcmV0dXJuO1xyXG5cdFx0Z2FtZS5tb3VzZS5jID0gMTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdGdhbWUubW91c2UuYyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGdhbWUuZmlyc3RGcmFtZSA9IERhdGUubm93KCk7XHJcblx0XHRnYW1lLm51bWJlckZyYW1lcyA9IDA7XHJcblx0fSk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQod2luZG93LCBcInJlc2l6ZVwiLCBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIGdhbWUuc2l6ZS5iO1xyXG5cdFx0dmFyIGNhbnZhcyA9IGdhbWUuR0wuY2FudmFzO1xyXG5cdFx0XHJcblx0XHRjYW52YXMgPSBnYW1lLlVJLmNhbnZhcztcclxuXHRcdGdhbWUuVUkuc2NhbGUgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gY2FudmFzLmhlaWdodDtcclxuXHR9KTtcclxuXHRcclxuXHR2YXIgbW92ZUNhbGxiYWNrID0gZnVuY3Rpb24oZSl7XHJcblx0XHRnYW1lLm1vdXNlTW92ZW1lbnQueCA9IGUubW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUubW96TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdGUud2Via2l0TW92ZW1lbnRYIHx8XHJcblx0XHRcdFx0XHRcdDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0Z2FtZS5tb3VzZU1vdmVtZW50LnkgPSBlLm1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLm1vek1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHRlLndlYmtpdE1vdmVtZW50WSB8fFxyXG5cdFx0XHRcdFx0XHQwO1xyXG5cdH07XHJcblx0XHJcblx0dmFyIHBvaW50ZXJsb2NrY2hhbmdlID0gZnVuY3Rpb24oZSl7XHJcblx0XHRpZiAoZG9jdW1lbnQucG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQubW96UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMgfHxcclxuXHRcdFx0ZG9jdW1lbnQud2Via2l0UG9pbnRlckxvY2tFbGVtZW50ID09PSBjYW52YXMpe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZUNhbGxiYWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVDYWxsYmFjayk7XHJcblx0XHRcdGdhbWUubW91c2VNb3ZlbWVudCA9IHt4OiAtMTAwMDAsIHk6IC0xMDAwMH07XHJcblx0XHR9XHJcblx0fTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwibW96cG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIndlYmtpdHBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiYmx1clwiLCBmdW5jdGlvbihlKXsgZ2FtZS5HTC5hY3RpdmUgPSBmYWxzZTsgZ2FtZS5hdWRpby5wYXVzZU11c2ljKCk7ICB9KTtcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwiZm9jdXNcIiwgZnVuY3Rpb24oZSl7IGdhbWUuR0wuYWN0aXZlID0gdHJ1ZTsgZ2FtZS5hdWRpby5yZXN0b3JlTXVzaWMoKTsgfSk7XHJcbn0pO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRhZGRFdmVudDogZnVuY3Rpb24gKG9iaiwgdHlwZSwgZnVuYyl7XHJcblx0XHRpZiAob2JqLmFkZEV2ZW50TGlzdGVuZXIpe1xyXG5cdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW5jLCBmYWxzZSk7XHJcblx0XHR9ZWxzZSBpZiAob2JqLmF0dGFjaEV2ZW50KXtcclxuXHRcdFx0b2JqLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGZ1bmMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0JCQ6IGZ1bmN0aW9uKG9iaklkKXtcclxuXHRcdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob2JqSWQpO1xyXG5cdFx0aWYgKCFlbGVtKSBhbGVydChcIkNvdWxkbid0IGZpbmQgZWxlbWVudDogXCIgKyBvYmpJZCk7XHJcblx0XHRyZXR1cm4gZWxlbTtcclxuXHR9LFxyXG5cdGdldEh0dHA6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaHR0cDtcclxuXHRcdGlmICAod2luZG93LlhNTEh0dHBSZXF1ZXN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0fWVsc2UgaWYgKHdpbmRvdy5BY3RpdmVYT2JqZWN0KXtcclxuXHRcdFx0aHR0cCA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gaHR0cDtcclxuXHR9LFxyXG5cdHJvbGxEaWNlOiBmdW5jdGlvbiAocGFyYW0pe1xyXG5cdFx0dmFyIGEgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcoMCwgcGFyYW0uaW5kZXhPZignRCcpKSwgMTApO1xyXG5cdFx0dmFyIGIgPSBwYXJzZUludChwYXJhbS5zdWJzdHJpbmcocGFyYW0uaW5kZXhPZignRCcpICsgMSksIDEwKTtcclxuXHRcdHZhciByb2xsMSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIGIpO1xyXG5cdFx0dmFyIHJvbGwyID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogYik7XHJcblx0XHRyZXR1cm4gTWF0aC5jZWlsKGEgKiAocm9sbDErcm9sbDIpLzIpO1xyXG5cdH1cclxufVxyXG5cdFxyXG4vLyBNYXRoIHByb3RvdHlwZSBvdmVycmlkZXNcdFxyXG5NYXRoLnJhZFJlbGF0aW9uID0gTWF0aC5QSSAvIDE4MDtcclxuTWF0aC5kZWdSZWxhdGlvbiA9IDE4MCAvIE1hdGguUEk7XHJcbk1hdGguZGVnVG9SYWQgPSBmdW5jdGlvbihkZWdyZWVzKXtcclxuXHRyZXR1cm4gZGVncmVlcyAqIHRoaXMucmFkUmVsYXRpb247XHJcbn07XHJcbk1hdGgucmFkVG9EZWcgPSBmdW5jdGlvbihyYWRpYW5zKXtcclxuXHRyZXR1cm4gKChyYWRpYW5zICogdGhpcy5kZWdSZWxhdGlvbikgKyA3MjApICUgMzYwO1xyXG59O1xyXG5NYXRoLmlSYW5kb20gPSBmdW5jdGlvbihhLCBiKXtcclxuXHRpZiAoYiA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdGIgPSBhO1xyXG5cdFx0YSA9IDA7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBhICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGIgLSBhKSk7XHJcbn07XHJcblxyXG5NYXRoLmdldEFuZ2xlID0gZnVuY3Rpb24oLypWZWMyKi8gYSwgLypWZWMyKi8gYil7XHJcblx0dmFyIHh4ID0gTWF0aC5hYnMoYS5hIC0gYi5hKTtcclxuXHR2YXIgeXkgPSBNYXRoLmFicyhhLmMgLSBiLmMpO1xyXG5cdFxyXG5cdHZhciBhbmcgPSBNYXRoLmF0YW4yKHl5LCB4eCk7XHJcblx0XHJcblx0Ly8gQWRqdXN0IHRoZSBhbmdsZSBhY2NvcmRpbmcgdG8gYm90aCBwb3NpdGlvbnNcclxuXHRpZiAoYi5hIDw9IGEuYSAmJiBiLmMgPD0gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgLSBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA8PSBhLmEgJiYgYi5jID4gYS5jKXtcclxuXHRcdGFuZyA9IE1hdGguUEkgKyBhbmc7XHJcblx0fWVsc2UgaWYgKGIuYSA+IGEuYSAmJiBiLmMgPiBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSTIgLSBhbmc7XHJcblx0fVxyXG5cdFxyXG5cdGFuZyA9IChhbmcgKyBNYXRoLlBJMikgJSBNYXRoLlBJMjtcclxuXHRcclxuXHRyZXR1cm4gYW5nO1xyXG59O1xyXG5cclxuTWF0aC5QSV8yID0gTWF0aC5QSSAvIDI7XHJcbk1hdGguUEkyID0gTWF0aC5QSSAqIDI7XHJcbk1hdGguUEkzXzIgPSBNYXRoLlBJICogMyAvIDI7XHJcblxyXG4vLyBDcm9zc2Jyb3dzZXIgYW5pbWF0aW9uL2F1ZGlvIG92ZXJyaWRlc1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSBcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8IFxyXG5cdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXHJcblx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fCBcclxuXHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8IFxyXG5cdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHwgXHJcblx0ZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gZHJhdzEpe1xyXG5cdFx0d2luZG93LnNldFRpbWVvdXQoZHJhdzEsIDEwMDAgLyAzMCk7XHJcblx0fTtcclxuXHJcbndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7IiwidmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4vTWF0cml4Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIFdlYkdMKHNpemUsIGNvbnRhaW5lcil7XHJcblx0aWYgKCF0aGlzLmluaXRDYW52YXMoc2l6ZSwgY29udGFpbmVyKSkgcmV0dXJuIG51bGw7IFxyXG5cdHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHR0aGlzLnByb2Nlc3NTaGFkZXJzKCk7XHJcblx0XHJcblx0dGhpcy5pbWFnZXMgPSBbXTtcclxuXHRcclxuXHR0aGlzLmFjdGl2ZSA9IHRydWU7XHJcblx0dGhpcy5saWdodCA9IDA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2ViR0w7XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuaW5pdENhbnZhcyA9IGZ1bmN0aW9uKHNpemUsIGNvbnRhaW5lcil7XHJcblx0dmFyIHNjYWxlID0gVXRpbHMuJCQoXCJkaXZHYW1lXCIpLm9mZnNldEhlaWdodCAvIHNpemUuYjtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzaXplLmE7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNpemUuYjtcclxuXHRjYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblx0Y2FudmFzLnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcblx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cdFxyXG5cdGlmICghY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIikpe1xyXG5cdFx0YWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCIpO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIik7XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5pbml0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Z2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xyXG5cdGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuXHRnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcclxuXHRcclxuXHRnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuXHRcclxuXHRnbC5lbmFibGUoIGdsLkJMRU5EICk7XHJcblx0Z2wuYmxlbmRFcXVhdGlvbiggZ2wuRlVOQ19BREQgKTtcclxuXHRnbC5ibGVuZEZ1bmMoIGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSApO1xyXG5cdFxyXG5cdHRoaXMuYXNwZWN0UmF0aW8gPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMuY2FudmFzLmhlaWdodDtcclxuXHR0aGlzLnBlcnNwZWN0aXZlTWF0cml4ID0gTWF0cml4Lm1ha2VQZXJzcGVjdGl2ZSg0NSwgdGhpcy5hc3BlY3RSYXRpbywgMC4wMDIsIDUuMCk7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUucHJvY2Vzc1NoYWRlcnMgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIENvbXBpbGUgZnJhZ21lbnQgc2hhZGVyXHJcblx0dmFyIGVsU2hhZGVyID0gVXRpbHMuJCQoXCJmcmFnbWVudFNoYWRlclwiKTtcclxuXHR2YXIgY29kZSA9IHRoaXMuZ2V0U2hhZGVyQ29kZShlbFNoYWRlcik7XHJcblx0dmFyIGZTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuXHRnbC5zaGFkZXJTb3VyY2UoZlNoYWRlciwgY29kZSk7XHJcblx0Z2wuY29tcGlsZVNoYWRlcihmU2hhZGVyKTtcclxuXHRcclxuXHQvLyBDb21waWxlIHZlcnRleCBzaGFkZXJcclxuXHRlbFNoYWRlciA9IFV0aWxzLiQkKFwidmVydGV4U2hhZGVyXCIpO1xyXG5cdGNvZGUgPSB0aGlzLmdldFNoYWRlckNvZGUoZWxTaGFkZXIpO1xyXG5cdHZhciB2U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG5cdGdsLnNoYWRlclNvdXJjZSh2U2hhZGVyLCBjb2RlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKHZTaGFkZXIpO1xyXG5cdFxyXG5cdC8vIENyZWF0ZSB0aGUgc2hhZGVyIHByb2dyYW1cclxuXHR0aGlzLnNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgZlNoYWRlcik7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSwgdlNoYWRlcik7XHJcblx0Z2wubGlua1Byb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKTtcclxuXHRcclxuXHRpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5zaGFkZXJQcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuXHRcdGFsZXJ0KFwiRXJyb3IgaW5pdGlhbGl6aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcbiAgXHJcblx0Z2wudXNlUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG5cdFxyXG5cdC8vIEdldCBhdHRyaWJ1dGUgbG9jYXRpb25zXHJcblx0dGhpcy5hVmVydGV4UG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwiYVZlcnRleFBvc2l0aW9uXCIpO1xyXG5cdHRoaXMuYVRleHR1cmVDb29yZCA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVGV4dHVyZUNvb3JkXCIpO1xyXG5cdHRoaXMuYVZlcnRleElzRGFyayA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVmVydGV4SXNEYXJrXCIpO1xyXG5cdFxyXG5cdC8vIEVuYWJsZSBhdHRyaWJ1dGVzXHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4UG9zaXRpb24pO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYVRleHR1cmVDb29yZCk7XHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVmVydGV4SXNEYXJrKTtcclxuXHRcclxuXHQvLyBHZXQgdGhlIHVuaWZvcm0gbG9jYXRpb25zXHJcblx0dGhpcy51U2FtcGxlciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVNhbXBsZXJcIik7XHJcblx0dGhpcy51VHJhbnNmb3JtYXRpb25NYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVUcmFuc2Zvcm1hdGlvbk1hdHJpeFwiKTtcclxuXHR0aGlzLnVQZXJzcGVjdGl2ZU1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVBlcnNwZWN0aXZlTWF0cml4XCIpO1xyXG5cdHRoaXMudVBhaW50SW5SZWQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVQYWludEluUmVkXCIpO1xyXG5cdHRoaXMudUxpZ2h0RGVwdGggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcInVMaWdodERlcHRoXCIpO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmdldFNoYWRlckNvZGUgPSBmdW5jdGlvbihzaGFkZXIpe1xyXG5cdHZhciBjb2RlID0gXCJcIjtcclxuXHR2YXIgbm9kZSA9IHNoYWRlci5maXJzdENoaWxkO1xyXG5cdHZhciB0biA9IG5vZGUuVEVYVF9OT0RFO1xyXG5cdFxyXG5cdHdoaWxlIChub2RlKXtcclxuXHRcdGlmIChub2RlLm5vZGVUeXBlID09IHRuKVxyXG5cdFx0XHRjb2RlICs9IG5vZGUudGV4dENvbnRlbnQ7XHJcblx0XHRub2RlID0gbm9kZS5uZXh0U2libGluZztcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGNvZGU7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUubG9hZEltYWdlID0gZnVuY3Rpb24oc3JjLCBtYWtlSXRUZXh0dXJlLCB0ZXh0dXJlSW5kZXgsIGlzU29saWQsIHBhcmFtcyl7XHJcblx0aWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xyXG5cdGlmICghcGFyYW1zLmltZ051bSkgcGFyYW1zLmltZ051bSA9IDE7XHJcblx0aWYgKCFwYXJhbXMuaW1nVk51bSkgcGFyYW1zLmltZ1ZOdW0gPSAxO1xyXG5cdGlmICghcGFyYW1zLnhPcmlnKSBwYXJhbXMueE9yaWcgPSAwO1xyXG5cdGlmICghcGFyYW1zLnlPcmlnKSBwYXJhbXMueU9yaWcgPSAwO1xyXG5cdFxyXG5cdHZhciBnbCA9IHRoaXM7XHJcblx0dmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cdFxyXG5cdGltZy5zcmMgPSBzcmM7XHJcblx0aW1nLnJlYWR5ID0gZmFsc2U7XHJcblx0aW1nLnRleHR1cmUgPSBudWxsO1xyXG5cdGltZy50ZXh0dXJlSW5kZXggPSB0ZXh0dXJlSW5kZXg7XHJcblx0aW1nLmlzU29saWQgPSAoaXNTb2xpZCA9PT0gdHJ1ZSk7XHJcblx0aW1nLmltZ051bSA9IHBhcmFtcy5pbWdOdW07XHJcblx0aW1nLnZJbWdOdW0gPSBwYXJhbXMuaW1nVk51bTtcclxuXHRpbWcueE9yaWcgPSBwYXJhbXMueE9yaWc7XHJcblx0aW1nLnlPcmlnID0gcGFyYW1zLnlPcmlnO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGltZywgXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRpbWcuaW1nV2lkdGggPSBpbWcud2lkdGggLyBpbWcuaW1nTnVtO1xyXG5cdFx0aW1nLmltZ0hlaWdodCA9IGltZy5oZWlnaHQgLyBpbWcudkltZ051bTtcclxuXHRcdGltZy5yZWFkeSA9IHRydWU7XHJcblx0XHRcclxuXHRcdGlmIChtYWtlSXRUZXh0dXJlKXtcclxuXHRcdFx0aW1nLnRleHR1cmUgPSBnbC5wYXJzZVRleHR1cmUoaW1nKTtcclxuXHRcdFx0aW1nLnRleHR1cmUudGV4dHVyZUluZGV4ID0gaW1nLnRleHR1cmVJbmRleDtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRnbC5pbWFnZXMucHVzaChpbWcpO1xyXG5cdHJldHVybiBpbWc7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUucGFyc2VUZXh0dXJlID0gZnVuY3Rpb24oaW1nKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBDcmVhdGVzIGEgdGV4dHVyZSBob2xkZXIgdG8gd29yayB3aXRoXHJcblx0dmFyIHRleCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXgpO1xyXG5cdFxyXG5cdC8vIEZsaXAgdmVydGljYWwgdGhlIHRleHR1cmVcclxuXHRnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcclxuXHRcclxuXHQvLyBMb2FkIHRoZSBpbWFnZSBkYXRhXHJcblx0Z2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWcpO1xyXG5cdFxyXG5cdC8vIEFzc2lnbiBwcm9wZXJ0aWVzIG9mIHNjYWxpbmdcclxuXHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cdGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xyXG5cdFxyXG5cdC8vIFJlbGVhc2VzIHRoZSB0ZXh0dXJlIGZyb20gdGhlIHdvcmtzcGFjZVxyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xyXG5cdHJldHVybiB0ZXg7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuZHJhd09iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCwgY2FtZXJhLCB0ZXh0dXJlKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSB2ZXJ0aWNlcyBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LnZlcnRleEJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFWZXJ0ZXhQb3NpdGlvbiwgb2JqZWN0LnZlcnRleEJ1ZmZlci5pdGVtU2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSB0ZXh0dXJlIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QudGV4QnVmZmVyKTtcclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVRleHR1cmVDb29yZCwgb2JqZWN0LnRleEJ1ZmZlci5pdGVtU2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSBkYXJrIGJ1ZmZlciBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRpZiAob2JqZWN0LmRhcmtCdWZmZXIpe1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC5kYXJrQnVmZmVyKTtcclxuXHRcdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVmVydGV4SXNEYXJrLCBvYmplY3QuZGFya0J1ZmZlci5pdGVtU2l6ZSwgZ2wuVU5TSUdORURfQllURSwgZmFsc2UsIDAsIDApO1xyXG5cdH1cclxuXHRcclxuXHQvLyBQYWludCB0aGUgb2JqZWN0IGluIHJlZCAoV2hlbiBodXJ0IGZvciBleGFtcGxlKVxyXG5cdHZhciByZWQgPSAob2JqZWN0LnBhaW50SW5SZWQpPyAxLjAgOiAwLjA7IFxyXG5cdGdsLnVuaWZvcm0xZih0aGlzLnVQYWludEluUmVkLCByZWQpO1xyXG5cdFxyXG5cdC8vIEhvdyBtdWNoIGxpZ2h0IHRoZSBwbGF5ZXIgY2FzdFxyXG5cdHZhciBsaWdodCA9ICh0aGlzLmxpZ2h0ID4gMCk/IDAuMCA6IDEuMDtcclxuXHRnbC51bmlmb3JtMWYodGhpcy51TGlnaHREZXB0aCwgbGlnaHQpO1xyXG5cdFxyXG5cdC8vIFNldCB0aGUgdGV4dHVyZSB0byB3b3JrIHdpdGhcclxuXHRnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHRnbC51bmlmb3JtMWkodGhpcy51U2FtcGxlciwgMCk7XHJcblx0XHJcblx0Ly8gQ3JlYXRlIHRoZSBwZXJzcGVjdGl2ZSBhbmQgdHJhbnNmb3JtIHRoZSBvYmplY3RcclxuXHR2YXIgdHJhbnNmb3JtYXRpb25NYXRyaXggPSBNYXRyaXgubWFrZVRyYW5zZm9ybShvYmplY3QsIGNhbWVyYSk7XHJcblx0XHJcblx0Ly8gUGFzcyB0aGUgaW5kaWNlcyBkYXRhIHRvIHRoZSBzaGFkZXJcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBvYmplY3QuaW5kaWNlc0J1ZmZlcik7XHJcblx0XHJcblx0Ly8gU2V0IHRoZSBwZXJzcGVjdGl2ZSBhbmQgdHJhbnNmb3JtYXRpb24gbWF0cmljZXNcclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHRoaXMudVBlcnNwZWN0aXZlTWF0cml4LCBmYWxzZSwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBlcnNwZWN0aXZlTWF0cml4KSk7XHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVUcmFuc2Zvcm1hdGlvbk1hdHJpeCwgZmFsc2UsIG5ldyBGbG9hdDMyQXJyYXkodHJhbnNmb3JtYXRpb25NYXRyaXgpKTtcclxuXHRcclxuXHRpZiAob2JqZWN0Lm5vUm90YXRlKSBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcblx0XHJcblx0Ly8gRHJhdyB0aGUgdHJpYW5nbGVzXHJcblx0Z2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgb2JqZWN0LmluZGljZXNCdWZmZXIubnVtSXRlbXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuXHRcclxuXHRnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5hcmVJbWFnZXNSZWFkeSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmltYWdlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICghdGhpcy5pbWFnZXNbaV0ucmVhZHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07Il19
