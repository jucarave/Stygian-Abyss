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
}

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
	this.console.addSFMessage("Press T to drop objects");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxBcHBEYXRhXFxSb2FtaW5nXFxucG1cXG5vZGVfbW9kdWxlc1xcd2F0Y2hpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXEFuaW1hdGVkVGV4dHVyZS5qcyIsImpzXFxBdWRpby5qcyIsImpzXFxCaWxsYm9hcmQuanMiLCJqc1xcQ29uc29sZS5qcyIsImpzXFxEb29yLmpzIiwianNcXEVuZW15LmpzIiwianNcXEVuZW15RmFjdG9yeS5qcyIsImpzXFxJbnZlbnRvcnkuanMiLCJqc1xcSXRlbS5qcyIsImpzXFxJdGVtRmFjdG9yeS5qcyIsImpzXFxNYXBBc3NlbWJsZXIuanMiLCJqc1xcTWFwTWFuYWdlci5qcyIsImpzXFxNYXRyaXguanMiLCJqc1xcTWlzc2lsZS5qcyIsImpzXFxPYmplY3RGYWN0b3J5LmpzIiwianNcXFBsYXllci5qcyIsImpzXFxQbGF5ZXJTdGF0cy5qcyIsImpzXFxTYXZlTWFuYWdlci5qcyIsImpzXFxTZWxlY3RDbGFzcy5qcyIsImpzXFxTdGFpcnMuanMiLCJqc1xcU3RvcmFnZS5qcyIsImpzXFxUaXRsZVNjcmVlbi5qcyIsImpzXFxVSS5qcyIsImpzXFxVbmRlcndvcmxkLmpzIiwianNcXFV0aWxzLmpzIiwianNcXFdlYkdMLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsd0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRfMUZyYW1lOiBbXSxcclxuXHRfMkZyYW1lczogW10sXHJcblx0XzNGcmFtZXM6IFtdLFxyXG5cdF80RnJhbWVzOiBbXSxcclxuXHRpdGVtQ29vcmRzOiBbXSxcclxuXHRcclxuXHRpbml0OiBmdW5jdGlvbihnbCl7XHJcblx0XHQvLyAxIEZyYW1lXHJcblx0XHR2YXIgY29vcmRzID0gWzEuMCwxLjAsMC4wLDEuMCwxLjAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMUZyYW1lLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdFxyXG5cdFx0Ly8gMiBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4wMCwxLjAwLDAuNTAsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fMkZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHRjb29yZHMgPSBbMS4wMCwxLjAwLDAuNTAsMS4wMCwxLjAwLDAuMDAsMC41MCwwLjAwXTtcclxuXHRcdHRoaXMuXzJGcmFtZXMucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHJcblx0XHQvLyAzIEZyYW1lcywgNCBGcmFtZXNcclxuXHRcdGNvb3JkcyA9IFswLjI1LDEuMDAsMC4wMCwxLjAwLDAuMjUsMC4wMCwwLjAwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjUwLDEuMDAsMC4yNSwxLjAwLDAuNTAsMC4wMCwwLjI1LDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFswLjc1LDEuMDAsMC41MCwxLjAwLDAuNzUsMC4wMCwwLjUwLDAuMDBdO1xyXG5cdFx0dGhpcy5fM0ZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0XHR0aGlzLl80RnJhbWVzLnB1c2godGhpcy5wcmVwYXJlQnVmZmVyKGNvb3JkcywgZ2wpKTtcclxuXHRcdGNvb3JkcyA9IFsxLjAwLDEuMDAsMC43NSwxLjAwLDEuMDAsMC4wMCwwLjc1LDAuMDBdO1xyXG5cdFx0dGhpcy5fNEZyYW1lcy5wdXNoKHRoaXMucHJlcGFyZUJ1ZmZlcihjb29yZHMsIGdsKSk7XHJcblx0fSxcclxuXHRcclxuXHRwcmVwYXJlQnVmZmVyOiBmdW5jdGlvbihjb29yZHMsIGdsKXtcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoY29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gY29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdHJldHVybiB0ZXhCdWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHRnZXRCeU51bUZyYW1lczogZnVuY3Rpb24obnVtRnJhbWVzKXtcclxuXHRcdGlmIChudW1GcmFtZXMgPT0gMSkgcmV0dXJuIHRoaXMuXzFGcmFtZTsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAyKSByZXR1cm4gdGhpcy5fMkZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSAzKSByZXR1cm4gdGhpcy5fM0ZyYW1lczsgZWxzZVxyXG5cdFx0aWYgKG51bUZyYW1lcyA9PSA0KSByZXR1cm4gdGhpcy5fNEZyYW1lcztcclxuXHR9LFxyXG5cdFxyXG5cdGdldFRleHR1cmVCdWZmZXJDb29yZHM6IGZ1bmN0aW9uKHhJbWdOdW0sIHlJbWdOdW0sIGdsKXtcclxuXHRcdHZhciByZXQgPSBbXTtcclxuXHRcdHZhciB3aWR0aCA9IDEgLyB4SW1nTnVtO1xyXG5cdFx0dmFyIGhlaWdodCA9IDEgLyB5SW1nTnVtO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpPTA7aTx5SW1nTnVtO2krKyl7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPHhJbWdOdW07aisrKXtcclxuXHRcdFx0XHR2YXIgeDEgPSBqICogd2lkdGg7XHJcblx0XHRcdFx0dmFyIHkxID0gMSAtIGkgKiBoZWlnaHQgLSBoZWlnaHQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIHgyID0geDEgKyB3aWR0aDtcclxuXHRcdFx0XHR2YXIgeTIgPSB5MSArIGhlaWdodDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY29vcmRzID0gW3gyLHkyLHgxLHkyLHgyLHkxLHgxLHkxXTtcclxuXHRcdFx0XHRyZXQucHVzaCh0aGlzLnByZXBhcmVCdWZmZXIoY29vcmRzLCBnbCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbmZ1bmN0aW9uIEF1ZGlvQVBJKCl7XHJcblx0dGhpcy5fYXVkaW8gPSBbXTtcclxuXHRcclxuXHR0aGlzLmF1ZGlvQ3R4ID0gbnVsbDtcclxuXHR0aGlzLmdhaW5Ob2RlID0gbnVsbDtcclxuXHR0aGlzLm11dGVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5pbml0QXVkaW9FbmdpbmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5pbml0QXVkaW9FbmdpbmUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh3aW5kb3cuQXVkaW9Db250ZXh0KXtcclxuXHRcdHRoaXMuYXVkaW9DdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblx0XHR0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0fWVsc2VcclxuXHRcdGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGUgQXVkaW8gQVBJXCIpO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKHVybCwgaXNNdXNpYyl7XHJcblx0dmFyIGVuZyA9IHRoaXM7XHJcblx0aWYgKCFlbmcuYXVkaW9DdHgpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHZhciBhdWRpbyA9IHtidWZmZXI6IG51bGwsIHNvdXJjZTogbnVsbCwgcmVhZHk6IGZhbHNlLCBpc011c2ljOiBpc011c2ljLCBwYXVzZWRBdDogMH07XHJcblx0XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cdGh0dHAucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuXHRcclxuXHRodHRwLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRlbmcuYXVkaW9DdHguZGVjb2RlQXVkaW9EYXRhKGh0dHAucmVzcG9uc2UsIGZ1bmN0aW9uKGJ1ZmZlcil7XHJcblx0XHRcdGF1ZGlvLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHRcdFx0YXVkaW8ucmVhZHkgPSB0cnVlO1xyXG5cdFx0fSwgZnVuY3Rpb24obXNnKXtcclxuXHRcdFx0YWxlcnQobXNnKTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblx0XHJcblx0aHR0cC5zZW5kKCk7XHJcblx0XHJcblx0dGhpcy5fYXVkaW8ucHVzaChhdWRpbyk7XHJcblx0XHJcblx0cmV0dXJuIGF1ZGlvO1xyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLnN0b3BNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLl9hdWRpby5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBhdWRpbyA9IHRoaXMuX2F1ZGlvW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoYXVkaW8udGltZU8pe1xyXG5cdFx0XHRjbGVhclRpbWVvdXQoYXVkaW8udGltZU8pO1xyXG5cdFx0fWVsc2UgaWYgKGF1ZGlvLmlzTXVzaWMgJiYgYXVkaW8uc291cmNlKXtcclxuXHRcdFx0YXVkaW8uc291cmNlLnN0b3AoKTtcclxuXHRcdFx0YXVkaW8uc291cmNlID0gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucGxheVNvdW5kID0gZnVuY3Rpb24oc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5LCB2b2x1bWUpe1xyXG5cdHZhciBlbmcgPSB0aGlzO1xyXG5cdGlmICghc291bmRGaWxlIHx8ICFzb3VuZEZpbGUucmVhZHkpe1xyXG5cdFx0aWYgKHRyeUlmTm90UmVhZHkpeyBzb3VuZEZpbGUudGltZU8gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVuZy5wbGF5U291bmQoc291bmRGaWxlLCBsb29wLCB0cnlJZk5vdFJlYWR5KTsgfSwgMTAwMCk7IH0gXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUuaXNNdXNpYykgdGhpcy5zdG9wTXVzaWMoKTtcclxuXHRcclxuXHRzb3VuZEZpbGUudGltZU8gPSBudWxsO1xyXG5cdHNvdW5kRmlsZS5wbGF5aW5nID0gdHJ1ZTtcclxuXHQgXHJcblx0dmFyIHNvdXJjZSA9IGVuZy5hdWRpb0N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuXHRzb3VyY2UuYnVmZmVyID0gc291bmRGaWxlLmJ1ZmZlcjtcclxuXHRcclxuXHR2YXIgZ2Fpbk5vZGU7XHJcblx0aWYgKHZvbHVtZSAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdGdhaW5Ob2RlID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVHYWluKCk7XHJcblx0XHRnYWluTm9kZS5nYWluLnZhbHVlID0gdm9sdW1lO1xyXG5cdFx0c291bmRGaWxlLnZvbHVtZSA9IHZvbHVtZTtcclxuXHR9ZWxzZXtcclxuXHRcdGdhaW5Ob2RlID0gZW5nLmdhaW5Ob2RlO1xyXG5cdH1cclxuXHRcclxuXHRzb3VyY2UuY29ubmVjdChnYWluTm9kZSk7XHJcblx0Z2Fpbk5vZGUuY29ubmVjdChlbmcuYXVkaW9DdHguZGVzdGluYXRpb24pO1xyXG5cdFxyXG5cdGlmIChzb3VuZEZpbGUucGF1c2VkQXQgIT0gMCl7XHJcblx0XHRzb3VuZEZpbGUuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKSAtIHNvdW5kRmlsZS5wYXVzZWRBdDtcclxuXHRcdHNvdXJjZS5zdGFydCgwLCAoc291bmRGaWxlLnBhdXNlZEF0IC8gMTAwMCkgJSBzb3VuZEZpbGUuYnVmZmVyLmR1cmF0aW9uKTtcclxuXHRcdHNvdW5kRmlsZS5wYXVzZWRBdCA9IDA7XHJcblx0fWVsc2V7XHJcblx0XHRzb3VuZEZpbGUuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcclxuXHRcdHNvdXJjZS5zdGFydCgwKTtcclxuXHR9XHJcblx0c291cmNlLmxvb3AgPSBsb29wO1xyXG5cdHNvdXJjZS5sb29waW5nID0gbG9vcDtcclxuXHRzb3VyY2Uub25lbmRlZCA9IGZ1bmN0aW9uKCl7IHNvdW5kRmlsZS5wbGF5aW5nID0gZmFsc2U7IH07XHJcblx0XHJcblx0aWYgKHNvdW5kRmlsZS5pc011c2ljKVxyXG5cdFx0c291bmRGaWxlLnNvdXJjZSA9IHNvdXJjZTtcclxufTtcclxuXHJcbkF1ZGlvQVBJLnByb3RvdHlwZS5wYXVzZU11c2ljID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGF1ZGlvID0gdGhpcy5fYXVkaW9baV07XHJcblx0XHRcclxuXHRcdGF1ZGlvLnBhdXNlZEF0ID0gMDtcclxuXHRcdGlmIChhdWRpby5pc011c2ljICYmIGF1ZGlvLnNvdXJjZSl7XHJcblx0XHRcdGF1ZGlvLndhc1BsYXlpbmcgPSBhdWRpby5wbGF5aW5nO1xyXG5cdFx0XHRhdWRpby5zb3VyY2Uuc3RvcCgpO1xyXG5cdFx0XHRhdWRpby5wYXVzZWRBdCA9IChEYXRlLm5vdygpIC0gYXVkaW8uc3RhcnRlZEF0KTtcclxuXHRcdFx0YXVkaW8ucmVzdG9yZUxvb3AgPSBhdWRpby5zb3VyY2UubG9vcDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUucmVzdG9yZU11c2ljID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGF1ZGlvID0gdGhpcy5fYXVkaW9baV07XHJcblx0XHRcclxuXHRcdGlmICghYXVkaW8ubG9vcGluZyAmJiAhYXVkaW8ud2FzUGxheWluZykgY29udGludWU7XHJcblx0XHRpZiAoYXVkaW8uaXNNdXNpYyAmJiBhdWRpby5zb3VyY2UgJiYgYXVkaW8ucGF1c2VkQXQgIT0gMCl7XHJcblx0XHRcdGF1ZGlvLnNvdXJjZSA9IG51bGw7XHJcblx0XHRcdHRoaXMucGxheVNvdW5kKGF1ZGlvLCBhdWRpby5yZXN0b3JlTG9vcCwgdHJ1ZSwgYXVkaW8udm9sdW1lKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5BdWRpb0FQSS5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLm11dGVkKXtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDA7XHJcblx0XHR0aGlzLm11dGVkID0gdHJ1ZTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubXV0ZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDE7XHJcblx0fVxyXG59O1xyXG5cclxuQXVkaW9BUEkucHJvdG90eXBlLmFyZVNvdW5kc1JlYWR5ID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuX2F1ZGlvLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKCF0aGlzLl9hdWRpb1tpXS5yZWFkeSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTsiLCJ2YXIgQW5pbWF0ZWRUZXh0dXJlID0gcmVxdWlyZSgnLi9BbmltYXRlZFRleHR1cmUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbi8vVE9ETzogVGhpcyBjbGFzcyBpcyBub3QgcmVmZXJlbmNlcyBhbnl3aGVyZT9cclxuXHJcbmZ1bmN0aW9uIEJpbGxib2FyZChwb3NpdGlvbiwgdGV4dHVyZUNvZGUsIG1hcE1hbmFnZXIsIHBhcmFtcyl7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSBtYXBNYW5hZ2VyO1xyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkID0gbnVsbDtcclxuXHR0aGlzLnRleHR1cmVDb29yZHMgPSBudWxsO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMTtcclxuXHR0aGlzLmltZ1NwZCA9IDA7XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdHRoaXMuYWN0aW9ucyA9IG51bGw7XHJcblx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xyXG5cdFxyXG5cdHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHJcblx0aWYgKHBhcmFtcykgdGhpcy5wYXJzZVBhcmFtcyhwYXJhbXMpO1xyXG5cdGlmICh0ZXh0dXJlQ29kZSA9PSBcIm5vbmVcIikgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmlsbGJvYXJkO1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5wYXJzZVBhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcyl7XHJcblx0Zm9yICh2YXIgaSBpbiBwYXJhbXMpe1xyXG5cdFx0dmFyIHAgPSBwYXJhbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpID09IFwibmZcIil7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dGhpcy5udW1GcmFtZXMgPSBwO1xyXG5cdFx0XHR0aGlzLnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMocCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImlzXCIpeyAvLyBJbWFnZSBzcGVlZFxyXG5cdFx0XHR0aGlzLmltZ1NwZCA9IHA7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImNiXCIpeyAvLyBDdXN0b20gYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQocCwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0XHR9ZWxzZSBpZiAoaSA9PSBcImFjXCIpeyAvLyBBY3Rpb25zXHJcblx0XHRcdHRoaXMuYWN0aW9ucyA9IHA7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmFjdGlvbnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgYWMgPSB0aGlzLmFjdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdGlmIChhYyA9PSBcInR2XCIpeyAvLyBUb29nbGUgdmlzaWJpbGl0eVxyXG5cdFx0XHR0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJjdF9cIikgPT0gMCl7IC8vIENoYW5nZSB0ZXh0dXJlXHJcblx0XHRcdHRoaXMudGV4dHVyZUNvZGUgPSBhYy5yZXBsYWNlKFwiY3RfXCIsIFwiXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGFjLmluZGV4T2YoXCJuZl9cIikgPT0gMCl7IC8vIE51bWJlciBvZiBmcmFtZXNcclxuXHRcdFx0dmFyIG5mID0gcGFyc2VJbnQoYWMucmVwbGFjZShcIm5mX1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubnVtRnJhbWVzID0gbmY7XHJcblx0XHRcdHRoaXMudGV4dHVyZUNvb3JkcyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRCeU51bUZyYW1lcyhuZik7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwiY2ZfXCIpID09IDApeyAvLyBDaXJjbGUgZnJhbWVzXHJcblx0XHRcdHZhciBmcmFtZXMgPSBhYy5yZXBsYWNlKFwiY2ZfXCIsXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IHBhcnNlSW50KGZyYW1lc1t0aGlzLmNpcmNsZUZyYW1lSW5kZXhdLCAxMCk7XHJcblx0XHRcdGlmICh0aGlzLmNpcmNsZUZyYW1lSW5kZXgrKyA+PSBmcmFtZXMubGVuZ3RoLTEpIHRoaXMuY2lyY2xlRnJhbWVJbmRleCA9IDA7XHJcblx0XHR9ZWxzZSBpZiAoYWMuaW5kZXhPZihcImN3X1wiKSA9PSAwKXsgLy8gQ2lyY2xlIGZyYW1lc1xyXG5cdFx0XHR2YXIgdGV4dHVyZUlkID0gcGFyc2VJbnQoYWMucmVwbGFjZShcImN3X1wiLFwiXCIpLCAxMCk7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5jaGFuZ2VXYWxsVGV4dHVyZSh0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdGV4dHVyZUlkKTtcclxuXHRcdH1lbHNlIGlmIChhYy5pbmRleE9mKFwidWRfXCIpID09IDApeyAvLyBVbmxvY2sgZG9vclxyXG5cdFx0XHR2YXIgcG9zID0gYWMucmVwbGFjZShcInVkX1wiLCBcIlwiKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdChwYXJzZUludChwb3NbMF0sIDEwKSwgcGFyc2VJbnQocG9zWzFdLCAxMCksIHBhcnNlSW50KHBvc1syXSwgMTApKTtcclxuXHRcdFx0aWYgKGRvb3IpeyBcclxuXHRcdFx0XHRkb29yLmxvY2sgPSBudWxsO1xyXG5cdFx0XHRcdGRvb3IuYWN0aXZhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGFjID09IFwiZGVzdHJveVwiKXsgLy8gRGVzdHJveSB0aGUgYmlsbGJvYXJkXHJcblx0XHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuQmlsbGJvYXJkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuYmlsbGJvYXJkICYmIHRoaXMudGV4dHVyZUNvb3Jkcyl7XHJcblx0XHR0aGlzLmJpbGxib2FyZC50ZXhCdWZmZXIgPSB0aGlzLnRleHR1cmVDb29yZHNbKHRoaXMuaW1nSW5kIDw8IDApXTtcclxuXHR9XHJcblx0XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5CaWxsYm9hcmQucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmltZ1NwZCA+IDAgJiYgdGhpcy5udW1GcmFtZXMgPiAxKXtcclxuXHRcdHRoaXMuaW1nSW5kICs9IHRoaXMuaW1nU3BkO1xyXG5cdFx0aWYgKCh0aGlzLmltZ0luZCA8PCAwKSA+PSB0aGlzLm51bUZyYW1lcyl7XHJcblx0XHRcdHRoaXMuaW1nSW5kID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIENvbnNvbGUoLypJbnQqLyBtYXhNZXNzYWdlcywgLypJbnQqLyBsaW1pdCwgLypJbnQqLyBzcGxpdEF0LCAgLypHYW1lKi8gZ2FtZSl7XHJcblx0dGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cdHRoaXMubWF4TWVzc2FnZXMgPSBtYXhNZXNzYWdlcztcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG5cdHRoaXMubGltaXQgPSBsaW1pdDtcclxuXHR0aGlzLnNwbGl0QXQgPSBzcGxpdEF0O1xyXG5cdFxyXG5cdHRoaXMuc3ByaXRlRm9udCA9IG51bGw7XHJcblx0dGhpcy5saXN0T2ZDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zZkNvbnRleHQgPSBudWxsO1xyXG5cdHRoaXMuc3BhY2VDaGFycyA9IG51bGw7XHJcblx0dGhpcy5zcGFjZUxpbmVzID0gbnVsbDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlO1xyXG5cclxuQ29uc29sZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oLypJbnQqLyB4LCAvKkludCovIHkpe1xyXG5cdHZhciBzID0gdGhpcy5tZXNzYWdlcy5sZW5ndGggLSAxO1xyXG5cdHZhciBjdHggPSB0aGlzLmdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdGN0eC5kcmF3SW1hZ2UodGhpcy5zZkNvbnRleHQuY2FudmFzLCB4LCB5KTtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLnBhcnNlRm9udCA9IGZ1bmN0aW9uKHNwcml0ZUZvbnQpe1xyXG5cdHZhciBjaGFyYXNXaWR0aCA9IFtdO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNwcml0ZUZvbnQud2lkdGg7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNwcml0ZUZvbnQuaGVpZ2h0O1xyXG5cdFxyXG5cdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdGN0eC5kcmF3SW1hZ2Uoc3ByaXRlRm9udCwgMCwgMCk7XHJcblx0XHJcblx0dmFyIGltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsMCxjYW52YXMud2lkdGgsMSk7XHJcblx0dmFyIHdpZHRoID0gMDtcclxuXHRmb3IgKHZhciBpPTAsbGVuPWltZ0RhdGEuZGF0YS5sZW5ndGg7aTxsZW47aSs9NCl7XHJcblx0XHR2YXIgciA9IGltZ0RhdGEuZGF0YVtpXTtcclxuXHRcdHZhciBnID0gaW1nRGF0YS5kYXRhW2krMV07XHJcblx0XHR2YXIgYiA9IGltZ0RhdGEuZGF0YVtpKzJdO1xyXG5cdFx0XHJcblx0XHRpZiAociA9PSAyNTUgJiYgZyA9PSAwICYmIGIgPT0gMjU1KXtcclxuXHRcdFx0d2lkdGgrKztcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZiAod2lkdGggIT0gMCl7XHJcblx0XHRcdFx0Y2hhcmFzV2lkdGgucHVzaCh3aWR0aCk7XHJcblx0XHRcdFx0d2lkdGggPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBjaGFyYXNXaWR0aDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZUZvbnQgPSBmdW5jdGlvbigvKkltYWdlKi8gc3ByaXRlRm9udCwgLypTdHJpbmcqLyBjaGFyYWN0ZXJzVXNlZCwgLypJbnQqLyB2ZXJ0aWNhbFNwYWNlKXtcclxuXHR0aGlzLnNwcml0ZUZvbnQgPSBzcHJpdGVGb250O1xyXG5cdHRoaXMubGlzdE9mQ2hhcnMgPSBjaGFyYWN0ZXJzVXNlZDtcclxuXHR0aGlzLnNwYWNlTGluZXMgPSB2ZXJ0aWNhbFNwYWNlO1xyXG5cdFxyXG5cdHRoaXMuY2hhcmFzV2lkdGggPSB0aGlzLnBhcnNlRm9udChzcHJpdGVGb250KTtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSAxMDA7XHJcblx0Y2FudmFzLmhlaWdodCA9IDEwMDtcclxuXHR0aGlzLnNmQ29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblx0dGhpcy5zZkNvbnRleHQuY2FudmFzID0gY2FudmFzO1xyXG5cdFxyXG5cdHRoaXMuc3BhY2VDaGFycyA9IHNwcml0ZUZvbnQud2lkdGggLyBjaGFyYWN0ZXJzVXNlZC5sZW5ndGg7XHJcbn07XHJcblxyXG5Db25zb2xlLnByb3RvdHlwZS5mb3JtYXRUZXh0ID0gZnVuY3Rpb24oLypTdHJpbmcqLyBtZXNzYWdlKXtcclxuXHR2YXIgdHh0ID0gbWVzc2FnZS5zcGxpdChcIiBcIik7XHJcblx0dmFyIGxpbmUgPSBcIlwiO1xyXG5cdHZhciByZXQgPSBbXTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXR4dC5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciB3b3JkID0gdHh0W2ldO1xyXG5cdFx0aWYgKChsaW5lICsgXCIgXCIgKyB3b3JkKS5sZW5ndGggPD0gdGhpcy5zcGxpdEF0KXtcclxuXHRcdFx0aWYgKGxpbmUgIT0gXCJcIikgbGluZSArPSBcIiBcIjtcclxuXHRcdFx0bGluZSArPSB3b3JkO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldC5wdXNoKGxpbmUpO1xyXG5cdFx0XHRsaW5lID0gd29yZDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0LnB1c2gobGluZSk7XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbkNvbnNvbGUucHJvdG90eXBlLmFkZFNGTWVzc2FnZSA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gbWVzc2FnZSl7XHJcblx0dmFyIG1zZyA9IHRoaXMuZm9ybWF0VGV4dChtZXNzYWdlKTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1zZy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHRoaXMubWVzc2FnZXMucHVzaChtc2dbaV0pO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiB0aGlzLmxpbWl0KXtcclxuXHRcdHRoaXMubWVzc2FnZXMuc3BsaWNlKDAsMSk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBjID0gdGhpcy5zZkNvbnRleHQuY2FudmFzO1xyXG5cdHZhciB3ID0gdGhpcy5zcGFjZUNoYXJzO1xyXG5cdHZhciBoID0gdGhpcy5zcHJpdGVGb250LmhlaWdodDtcclxuXHR0aGlzLnNmQ29udGV4dC5jbGVhclJlY3QoMCwwLGMud2lkdGgsYy5oZWlnaHQpO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tZXNzYWdlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBtc2cgPSB0aGlzLm1lc3NhZ2VzW2ldO1xyXG5cdFx0dmFyIHggPSAwO1xyXG5cdFx0dmFyIHkgPSAodGhpcy5zcGFjZUxpbmVzICogdGhpcy5saW1pdCkgLSB0aGlzLnNwYWNlTGluZXMgKiAobGVuIC0gaSAtIDEpO1xyXG5cdFx0XHJcblx0XHR2YXIgbVcgPSBtc2cubGVuZ3RoICogdztcclxuXHRcdGlmIChtVyA+IGMud2lkdGgpIGMud2lkdGggPSBtVyArICgyICogdyk7XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPW1zZy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdHZhciBjaGFyYSA9IG1zZy5jaGFyQXQoaik7XHJcblx0XHRcdHZhciBpbmQgPSB0aGlzLmxpc3RPZkNoYXJzLmluZGV4T2YoY2hhcmEpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGluZCAhPSAtMSl7XHJcblx0XHRcdFx0dGhpcy5zZkNvbnRleHQuZHJhd0ltYWdlKHRoaXMuc3ByaXRlRm9udCxcclxuXHRcdFx0XHRcdHcgKiBpbmQsIDEsIHcsIGggLSAxLFxyXG5cdFx0XHRcdFx0eCwgeSwgdywgaCAtIDEpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0eCArPSB0aGlzLmNoYXJhc1dpZHRoW2luZF0gKyAxO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR4ICs9IHc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsImZ1bmN0aW9uIERvb3IobWFwTWFuYWdlciwgd2FsbFBvc2l0aW9uLCBkaXIsIHRleHR1cmVDb2RlLCB3YWxsVGV4dHVyZSwgbG9jayl7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLndhbGxQb3NpdGlvbiA9IHdhbGxQb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gMDtcclxuXHR0aGlzLmRpciA9IGRpcjtcclxuXHR0aGlzLnRleHR1cmVDb2RlID0gdGV4dHVyZUNvZGU7XHJcblx0dGhpcy5yVGV4dHVyZUNvZGUgPSB0ZXh0dXJlQ29kZTsgLy8gRGVsZXRlXHJcblxyXG5cdHRoaXMuZG9vclBvc2l0aW9uID0gd2FsbFBvc2l0aW9uLmNsb25lKCk7XHJcblx0dGhpcy53YWxsVGV4dHVyZSA9IHdhbGxUZXh0dXJlO1xyXG5cdFx0XHJcblx0dGhpcy5ib3VuZGluZ0JveCA9IG51bGw7XHJcblx0dGhpcy5wb3NpdGlvbiA9IHdhbGxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cdGlmIChkaXIgPT0gXCJIXCIpeyB0aGlzLnBvc2l0aW9uLnN1bSh2ZWMzKC0wLjI1LCAwLjAsIDAuMCkpOyB9ZWxzZVxyXG5cdGlmIChkaXIgPT0gXCJWXCIpeyB0aGlzLnBvc2l0aW9uLnN1bSh2ZWMzKDAuMCwgMC4wLCAtMC4yNSkpOyB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSV8yOyB9XHJcblx0XHJcblx0dGhpcy5sb2NrID0gbG9jaztcclxuXHR0aGlzLmNsb3NlZCA9IHRydWU7XHJcblx0dGhpcy5hbmltYXRpb24gPSAgMDtcclxuXHR0aGlzLm9wZW5TcGVlZCA9IE1hdGguZGVnVG9SYWQoMTApO1xyXG5cdFxyXG5cdHRoaXMubW9kaWZ5Q29sbGlzaW9uKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRG9vcjtcclxuXHJcbkRvb3IucHJvdG90eXBlLmdldEJvdW5kaW5nQm94ID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5ib3VuZGluZ0JveDtcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5hbmltYXRpb24gIT0gMCkgcmV0dXJuO1xyXG5cdFxyXG5cdGlmICh0aGlzLmxvY2spe1xyXG5cdFx0dmFyIGtleSA9IHRoaXMubWFwTWFuYWdlci5nZXRQbGF5ZXJJdGVtKHRoaXMubG9jayk7XHJcblx0XHRpZiAoa2V5KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2Uoa2V5Lm5hbWUgKyBcIiB1c2VkXCIpO1xyXG5cdFx0XHR0aGlzLm1hcE1hbmFnZXIucmVtb3ZlUGxheWVySXRlbSh0aGlzLmxvY2spO1xyXG5cdFx0XHR0aGlzLmxvY2sgPSBudWxsO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTG9ja2VkXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLmNsb3NlZCkgdGhpcy5hbmltYXRpb24gPSAxO1xyXG5cdGVsc2UgdGhpcy5hbmltYXRpb24gPSAyOyBcclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmlzU29saWQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmFuaW1hdGlvbiAhPSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRyZXR1cm4gdGhpcy5jbG9zZWQ7XHJcbn07XHJcblxyXG5Eb29yLnByb3RvdHlwZS5tb2RpZnlDb2xsaXNpb24gPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRpciA9PSBcIkhcIil7XHJcblx0XHRpZiAodGhpcy5jbG9zZWQpe1xyXG5cdFx0XHR0aGlzLmJvdW5kaW5nQm94ID0ge1xyXG5cdFx0XHRcdHg6IHRoaXMucG9zaXRpb24uYSArIDAuNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41IC0gMC4wNSxcclxuXHRcdFx0XHR3OiAwLjUsIGg6IDAuMVxyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41LCB5OiB0aGlzLnBvc2l0aW9uLmMgKyAwLjUsXHJcblx0XHRcdFx0dzogMC4xLCBoOiAwLjVcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9ZWxzZXtcclxuXHRcdGlmICh0aGlzLmNsb3NlZCl7XHJcblx0XHRcdHRoaXMuYm91bmRpbmdCb3ggPSB7XHJcblx0XHRcdFx0eDogdGhpcy5wb3NpdGlvbi5hICsgMC41IC0gMC4wNSwgeTogdGhpcy5wb3NpdGlvbi5jICsgMC41LFxyXG5cdFx0XHRcdHc6IDAuMSwgaDogMC41XHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5ib3VuZGluZ0JveCA9IHtcclxuXHRcdFx0XHR4OiB0aGlzLnBvc2l0aW9uLmEgKyAwLjUsIHk6IHRoaXMucG9zaXRpb24uYyArIDAuNSxcclxuXHRcdFx0XHR3OiAwLjUsIGg6IDAuMVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkRvb3IucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBhbjEgPSAoKHRoaXMuYW5pbWF0aW9uID09IDEgJiYgdGhpcy5kaXIgPT0gXCJIXCIpIHx8ICh0aGlzLmFuaW1hdGlvbiA9PSAyICYmIHRoaXMuZGlyID09IFwiVlwiKSk7XHJcblx0dmFyIGFuMiA9ICgodGhpcy5hbmltYXRpb24gPT0gMiAmJiB0aGlzLmRpciA9PSBcIkhcIikgfHwgKHRoaXMuYW5pbWF0aW9uID09IDEgJiYgdGhpcy5kaXIgPT0gXCJWXCIpKTtcclxuXHRcclxuXHRpZiAoYW4xICYmIHRoaXMucm90YXRpb24gPCBNYXRoLlBJXzIpe1xyXG5cdFx0dGhpcy5yb3RhdGlvbiArPSB0aGlzLm9wZW5TcGVlZDtcclxuXHRcdGlmICh0aGlzLnJvdGF0aW9uID49IE1hdGguUElfMil7XHJcblx0XHRcdHRoaXMucm90YXRpb24gPSBNYXRoLlBJXzI7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uICA9IDA7XHJcblx0XHRcdHRoaXMuY2xvc2VkID0gKHRoaXMuZGlyID09IFwiVlwiKTtcclxuXHRcdFx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxuXHRcdH1cclxuXHR9ZWxzZSBpZiAoYW4yICYmIHRoaXMucm90YXRpb24gPiAwKXtcclxuXHRcdHRoaXMucm90YXRpb24gLT0gdGhpcy5vcGVuU3BlZWQ7XHJcblx0XHRpZiAodGhpcy5yb3RhdGlvbiA8PSAwKXtcclxuXHRcdFx0dGhpcy5yb3RhdGlvbiA9IDA7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uICA9IDA7XHJcblx0XHRcdHRoaXMuY2xvc2VkID0gKHRoaXMuZGlyID09IFwiSFwiKTtcclxuXHRcdFx0dGhpcy5tb2RpZnlDb2xsaXNpb24oKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBBbmltYXRlZFRleHR1cmUgPSByZXF1aXJlKCcuL0FuaW1hdGVkVGV4dHVyZScpO1xyXG52YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ2JpbGxib2FyZCcpO1xyXG5jaXJjdWxhci5zZXRUcmFuc2llbnQoJ0VuZW15JywgJ3RleHR1cmVDb29yZHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0VuZW15JywgZnVuY3Rpb24ob2JqZWN0LCBnYW1lKSB7XHJcblx0b2JqZWN0LmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCBnYW1lLkdMLmN0eCk7XHJcblx0b2JqZWN0LnRleHR1cmVDb29yZHMgPSBBbmltYXRlZFRleHR1cmUuZ2V0QnlOdW1GcmFtZXMoMik7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gRW5lbXkoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0VuZW15Jyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ0VuZW15JywgRW5lbXkpO1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZW5lbXksIG1hcE1hbmFnZXIpe1xyXG5cdGlmIChlbmVteS5zd2ltKSBwb3NpdGlvbi5iIC09IDAuMjtcclxuXHRcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy50ZXh0dXJlQmFzZSA9IGVuZW15LnRleHR1cmVCYXNlO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5hbmltYXRpb24gPSBcInJ1blwiO1xyXG5cdHRoaXMuZW5lbXkgPSBlbmVteTtcclxuXHR0aGlzLnRhcmdldCA9IGZhbHNlO1xyXG5cdHRoaXMuYmlsbGJvYXJkID0gT2JqZWN0RmFjdG9yeS5iaWxsYm9hcmQodmVjMygxLjAsIDEuMCwgMS4wKSwgdmVjMigxLjAsIDEuMCksIHRoaXMubWFwTWFuYWdlci5nYW1lLkdMLmN0eCk7XHJcblx0dGhpcy50ZXh0dXJlQ29vcmRzID0gQW5pbWF0ZWRUZXh0dXJlLmdldEJ5TnVtRnJhbWVzKDIpO1xyXG5cdHRoaXMubnVtRnJhbWVzID0gMjtcclxuXHR0aGlzLmltZ1NwZCA9IDEvNztcclxuXHR0aGlzLmltZ0luZCA9IDA7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLmh1cnQgPSAwLjA7XHJcblx0dGhpcy50YXJnZXRZID0gcG9zaXRpb24uYjtcclxuXHR0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHR0aGlzLnNsZWVwID0gMDtcclxuXHRcclxuXHR0aGlzLmF0dGFja1dhaXQgPSAwLjA7XHJcblx0dGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPSAwO1xyXG5cdHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbkVuZW15LnByb3RvdHlwZS5yZWNlaXZlRGFtYWdlID0gZnVuY3Rpb24oZG1nKXtcclxuXHR0aGlzLmh1cnQgPSA1LjA7XHJcblx0XHJcblx0dGhpcy5lbmVteS5ocCAtPSBkbWc7XHJcblx0aWYgKHRoaXMuZW5lbXkuaHAgPD0gMCl7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuZ2FtZS5hZGRFeHBlcmllbmNlKHRoaXMuZW5lbXkuc3RhdHMuZXhwKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHRoaXMuZW5lbXkubmFtZSArIFwiIGtpbGxlZFwiKTtcclxuXHRcdHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUubG9va0ZvciA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0aWYgKCFwbGF5ZXIubW92ZWQpIHJldHVybjtcclxuXHR2YXIgcCA9IHBsYXllci5wb3NpdGlvbjtcclxuXHRcclxuXHR2YXIgZHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdHZhciBkeiA9IE1hdGguYWJzKHAuYyAtIHRoaXMucG9zaXRpb24uYyk7XHJcblx0XHJcblx0aWYgKCF0aGlzLnRhcmdldCAmJiAoZHggPD0gNCB8fCBkeiA8PSA0KSl7XHJcblx0XHQvLyBDYXN0IGEgcmF5IHRvd2FyZHMgdGhlIHBsYXllciB0byBjaGVjayBpZiBoZSdzIG9uIHRoZSB2aXNpb24gb2YgdGhlIGNyZWF0dXJlXHJcblx0XHR2YXIgcnggPSB0aGlzLnBvc2l0aW9uLmE7XHJcblx0XHR2YXIgcnkgPSB0aGlzLnBvc2l0aW9uLmM7XHJcblx0XHR2YXIgZGlyID0gTWF0aC5nZXRBbmdsZSh0aGlzLnBvc2l0aW9uLCBwKTtcclxuXHRcdHZhciBkeCA9IE1hdGguY29zKGRpcikgKiAwLjM7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMztcclxuXHRcdFxyXG5cdFx0dmFyIHNlYXJjaCA9IDE1O1xyXG5cdFx0d2hpbGUgKHNlYXJjaCA+IDApe1xyXG5cdFx0XHRyeCArPSBkeDtcclxuXHRcdFx0cnkgKz0gZHk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY3ggPSAocnggPDwgMCk7XHJcblx0XHRcdHZhciBjeSA9IChyeSA8PCAwKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLm1hcE1hbmFnZXIuaXNTb2xpZChjeCwgY3ksIDApKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHZhciBweCA9IChwLmEgPDwgMCk7XHJcblx0XHRcdFx0dmFyIHB5ID0gKHAuYyA8PCAwKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoY3ggPT0gcHggJiYgY3kgPT0gcHkpe1xyXG5cdFx0XHRcdFx0dGhpcy50YXJnZXQgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0XHRcdFx0c2VhcmNoID0gMDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHNlYXJjaCAtPSAxO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5kb1ZlcnRpY2FsQ2hlY2tzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgcG9pbnRZID0gdGhpcy5tYXBNYW5hZ2VyLmdldFlGbG9vcih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYywgdHJ1ZSk7XHJcblx0aWYgKHRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmIHBvaW50WSA8IDAuMCkgcG9pbnRZID0gdGhpcy5wb3NpdGlvbi5iO1xyXG5cdFxyXG5cdHZhciBweSA9IE1hdGguZmxvb3IoKHBvaW50WSAtIHRoaXMucG9zaXRpb24uYikgKiAxMDApIC8gMTAwO1xyXG5cdGlmIChweSA8PSAwLjMpIHRoaXMudGFyZ2V0WSA9IHBvaW50WTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4VG8sIHpUbyl7XHJcblx0dmFyIG1vdmVtZW50ID0gdmVjMih4VG8sIHpUbyk7XHJcblx0dmFyIHNwZCA9IHZlYzIoeFRvICogMS41LCAwKTtcclxuXHR2YXIgZmFrZVBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFxyXG5cdGZvciAodmFyIGk9MDtpPDI7aSsrKXtcclxuXHRcdHZhciBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0QkJveFdhbGxOb3JtYWwoZmFrZVBvcywgc3BkLCAwLjMpO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCwgdGhpcyk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0c3BkID0gdmVjMigwLCB6VG8gKiAxLjUpO1xyXG5cdH1cclxuXHRcclxuXHRpZiAobW92ZW1lbnQuYSAhPSAwIHx8IG1vdmVtZW50LmIgIT0gMCl7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmEgKz0gbW92ZW1lbnQuYTtcclxuXHRcdHRoaXMucG9zaXRpb24uYyArPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHJcblx0XHRpZiAoIXRoaXMuZW5lbXkuc3RhdHMuZmx5ICYmICF0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgdGhpcy5tYXBNYW5hZ2VyLmlzV2F0ZXJQb3NpdGlvbih0aGlzLnBvc2l0aW9uLmEsIHRoaXMucG9zaXRpb24uYykpe1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLmEgLT0gbW92ZW1lbnQuYTtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5jIC09IG1vdmVtZW50LmI7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLmVuZW15LnN0YXRzLnN3aW0gJiYgIXRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi5hIC09IG1vdmVtZW50LmE7XHJcblx0XHRcdHRoaXMucG9zaXRpb24uYyAtPSBtb3ZlbWVudC5iO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZG9WZXJ0aWNhbENoZWNrcygpO1xyXG5cdH1cclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5hdHRhY2tQbGF5ZXIgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG5cdGlmICh0aGlzLmh1cnQgPiAwLjApIHJldHVybjtcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UodGhpcy5lbmVteS5zdGF0cy5zdHIpO1xyXG5cdHZhciBkZnMgPSBVdGlscy5yb2xsRGljZSh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wbGF5ZXIuc3RhdHMuZGZzKTtcclxuXHRcclxuXHQvLyBDaGVjayBpZiB0aGUgcGxheWVyIGhhcyB0aGUgcHJvdGVjdGlvbiBzcGVsbFxyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuZ2FtZS5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRkZnMgKz0gMTU7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heChzdHIgLSBkZnMsIDApO1xyXG5cdFxyXG5cdGlmIChkbWcgPiAwKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKGRtZyArIFwiIGRhbWFnZSBpbmZsaWN0ZWRcIik7XHJcblx0XHRwbGF5ZXIucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5hdHRhY2tXYWl0ID0gOTA7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHBsYXllciA9IHRoaXMubWFwTWFuYWdlci5wbGF5ZXI7XHJcblx0aWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcclxuXHR2YXIgcCA9IHBsYXllci5wb3NpdGlvbjtcclxuXHRpZiAodGhpcy5lbmVteUF0dGFja0NvdW50ZXIgPiAwKXtcclxuXHRcdHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyIC0tO1xyXG5cdFx0aWYgKHRoaXMuZW5lbXlBdHRhY2tDb3VudGVyID09IDApe1xyXG5cdFx0XHR2YXIgeHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdFx0XHR2YXIgeXkgPSBNYXRoLmFicyhwLmMgLSB0aGlzLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHRpZiAoeHggPD0gMSAmJiB5eSA8PTEpe1xyXG5cdFx0XHRcdHRoaXMuYXR0YWNrUGxheWVyKHBsYXllcik7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0aGlzLnRhcmdldCl7XHJcblx0XHR2YXIgeHggPSBNYXRoLmFicyhwLmEgLSB0aGlzLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHl5ID0gTWF0aC5hYnMocC5jIC0gdGhpcy5wb3NpdGlvbi5jKTtcclxuXHRcdGlmICh0aGlzLmF0dGFja1dhaXQgPiAwKXtcclxuXHRcdFx0dGhpcy5hdHRhY2tXYWl0IC0tO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHh4IDw9IDEgJiYgeXkgPD0xKXtcclxuXHRcdFx0aWYgKHRoaXMuYXR0YWNrV2FpdCA9PSAwKXtcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZSh0aGlzLmVuZW15Lm5hbWUgKyBcIiBhdHRhY2tzIVwiKTtcclxuXHRcdFx0XHR0aGlzLmVuZW15QXR0YWNrQ291bnRlciA9IDEwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoeHggPiAxMCB8fCB5eSA+IDEwKXtcclxuXHRcdFx0dGhpcy50YXJnZXQgPSBudWxsO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBkaXIgPSBNYXRoLmdldEFuZ2xlKHRoaXMucG9zaXRpb24sIHApO1xyXG5cdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyKSAqIDAuMDI7XHJcblx0XHR2YXIgZHkgPSAtTWF0aC5zaW4oZGlyKSAqIDAuMDI7XHJcblx0XHRcclxuXHRcdHZhciBsYXQgPSB2ZWMyKE1hdGguY29zKGRpciArIE1hdGguUElfMiksIC1NYXRoLnNpbihkaXIgKyBNYXRoLlBJXzIpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tb3ZlVG8oZHgsIGR5LCBsYXQpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5sb29rRm9yKCk7XHJcblx0fVxyXG59O1xyXG5cclxuRW5lbXkucHJvdG90eXBlLmdldFRleHR1cmVDb2RlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZmFjZSA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdHZhciBhID0gdGhpcy5hbmltYXRpb247XHJcblx0aWYgKHRoaXMuYW5pbWF0aW9uID09IFwic3RhbmRcIikgYSA9IFwicnVuXCI7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMudGV4dHVyZUJhc2UgKyBcIl9cIiArIGE7XHJcbn07XHJcblxyXG5FbmVteS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdGlmICh0aGlzLmJpbGxib2FyZCAmJiB0aGlzLnRleHR1cmVDb29yZHMpe1xyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy50ZXh0dXJlQ29vcmRzWyh0aGlzLmltZ0luZCA8PCAwKV07XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuYmlsbGJvYXJkLnBhaW50SW5SZWQgPSAodGhpcy5odXJ0ID4gMCk7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy5nZXRUZXh0dXJlQ29kZSgpLHRoaXMuYmlsbGJvYXJkKTtcclxufTtcclxuXHJcbkVuZW15LnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCl7IHRoaXMuaHVydCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuc2xlZXAgPiAwKXsgdGhpcy5zbGVlcCAtPSAxOyB9XHJcblx0XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5wYXVzZWQgfHwgZ2FtZS50aW1lU3RvcCA+IDAgfHwgdGhpcy5zbGVlcCA+IDApe1xyXG5cdFx0dGhpcy5kcmF3KCk7IFxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAodGhpcy5pbWdTcGQgPiAwICYmIHRoaXMubnVtRnJhbWVzID4gMSl7XHJcblx0XHR0aGlzLmltZ0luZCArPSB0aGlzLmltZ1NwZDtcclxuXHRcdGlmICgodGhpcy5pbWdJbmQgPDwgMCkgPj0gdGhpcy5udW1GcmFtZXMpe1xyXG5cdFx0XHR0aGlzLmltZ0luZCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnRhcmdldFkgPCB0aGlzLnBvc2l0aW9uLmIpe1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5iIC09IDAuMTtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPD0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fWVsc2UgaWYgKHRoaXMudGFyZ2V0WSA+IHRoaXMucG9zaXRpb24uYil7XHJcblx0XHR0aGlzLnBvc2l0aW9uLmIgKz0gMC4wODtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRlbmVtaWVzOiB7XHJcblx0XHRiYXQ6IHtuYW1lOiAnR2lhbnQgQmF0JywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnMUQ5JywgZGZzOiAnMkQyJywgZXhwOiA0LCBmbHk6IHRydWV9fSxcclxuXHRcdHJhdDoge25hbWU6ICdHaWFudCBSYXQnLCBocDogNDgsIHRleHR1cmVCYXNlOiAncmF0Jywgc3RhdHM6IHtzdHI6ICcxRDknLCBkZnM6ICcyRDInLCBleHA6IDR9fSxcclxuXHRcdHNwaWRlcjoge25hbWU6ICdHaWFudCBTcGlkZXInLCBocDogNjQsIHRleHR1cmVCYXNlOiAnc3BpZGVyJywgc3RhdHM6IHtzdHI6ICcxRDExJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHRncmVtbGluOiB7bmFtZTogJ0dyZW1saW4nLCBocDogNDgsIHRleHR1cmVCYXNlOiAnZ3JlbWxpbicsIHN0YXRzOiB7c3RyOiAnMkQ5JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRza2VsZXRvbjoge25hbWU6ICdTa2VsZXRvbicsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdza2VsZXRvbicsIHN0YXRzOiB7c3RyOiAnM0Q0JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRoZWFkbGVzczoge25hbWU6ICdIZWFkbGVzcycsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICdoZWFkbGVzcycsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHQvL25peGllOiB7bmFtZTogJ05peGllJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ2JhdCcsIHN0YXRzOiB7c3RyOiAnM0Q1JywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHRcdFx0XHQvLyBub3QgaW4gdTVcclxuXHRcdHdpc3A6IHtuYW1lOiAnV2lzcCcsIGhwOiA2NCwgdGV4dHVyZUJhc2U6ICd3aXNwJywgc3RhdHM6IHtzdHI6ICcyRDEwJywgZGZzOiAnMkQyJywgZXhwOiA1fX0sXHJcblx0XHRnaG9zdDoge25hbWU6ICdHaG9zdCcsIGhwOiA4MCwgdGV4dHVyZUJhc2U6ICdnaG9zdCcsIHN0YXRzOiB7c3RyOiAnMkQxNScsIGRmczogJzJEMicsIGV4cDogNiwgZmx5OiB0cnVlfX0sXHJcblx0XHR0cm9sbDoge25hbWU6ICdUcm9sbCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICd0cm9sbCcsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sIC8vIE5vdCB1c2VkIGJ5IHRoZSBnZW5lcmF0b3I/XHJcblx0XHRsYXZhTGl6YXJkOiB7bmFtZTogJ0xhdmEgTGl6YXJkJywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ2xhdmFMaXphcmQnLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogN319LFxyXG5cdFx0bW9uZ2JhdDoge25hbWU6ICdNb25nYmF0JywgaHA6IDk2LCB0ZXh0dXJlQmFzZTogJ21vbmdiYXQnLCBzdGF0czoge3N0cjogJzRENScsIGRmczogJzJEMicsIGV4cDogNywgZmx5OiB0cnVlfX0sIFxyXG5cdFx0b2N0b3B1czoge25hbWU6ICdHaWFudCBTcXVpZCcsIGhwOiA5NiwgdGV4dHVyZUJhc2U6ICdvY3RvcHVzJywgc3RhdHM6IHtzdHI6ICczRDYnLCBkZnM6ICcyRDInLCBleHA6IDksIHN3aW06IHRydWV9fSxcclxuXHRcdGRhZW1vbjoge25hbWU6ICdEYWVtb24nLCBocDogMTEyLCB0ZXh0dXJlQmFzZTogJ2RhZW1vbicsIHN0YXRzOiB7c3RyOiAnNEQ1JywgZGZzOiAnMkQyJywgZXhwOiA4fX0sXHJcblx0XHQvL3BoYW50b206IHtuYW1lOiAnUGhhbnRvbScsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnYmF0Jywgc3RhdHM6IHtzdHI6ICcxRDE1JywgZGZzOiAnMkQyJywgZXhwOiA5fX0sXHRcdFx0Ly8gbm90IGluIHU1XHJcblx0XHRzZWFTZXJwZW50OiB7bmFtZTogJ1NlYSBTZXJwZW50JywgaHA6IDEyOCwgdGV4dHVyZUJhc2U6ICdzZWFTZXJwZW50Jywgc3RhdHM6IHtzdHI6ICczRDYnLCBkZnM6ICcyRDInLCBleHA6IDksIHN3aW06IHRydWV9fSwgLy8gbm90IHN1aXRhYmxlXHJcblx0XHRldmlsTWFnZToge25hbWU6ICdFdmlsIE1hZ2UnLCBocDogMTc2LCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzZENScsIGRmczogJzJEMicsIGV4cDogMTJ9fSwgLy9UT0RPOiBBZGQgdGV4dHVyZVxyXG5cdFx0bGljaGU6IHtuYW1lOiAnTGljaGUnLCBocDogMTkyLCB0ZXh0dXJlQmFzZTogJ2xpY2hlJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDEzfX0sXHJcblx0XHRoeWRyYToge25hbWU6ICdIeWRyYScsIGhwOiAyMDgsIHRleHR1cmVCYXNlOiAnaHlkcmEnLCBzdGF0czoge3N0cjogJzlENCcsIGRmczogJzJEMicsIGV4cDogMTR9fSxcclxuXHRcdGRyYWdvbjoge25hbWU6ICdEcmFnb24nLCBocDogMjI0LCB0ZXh0dXJlQmFzZTogJ2RyYWdvbicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNSwgZmx5OiB0cnVlfX0sXHRcdFx0XHQvLyBOb3Qgc3VpdGFibGVcclxuXHRcdHpvcm46IHtuYW1lOiAnWm9ybicsIGhwOiAyNDAsIHRleHR1cmVCYXNlOiAnem9ybicsIHN0YXRzOiB7c3RyOiAnOUQ0JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0Z2F6ZXI6IHtuYW1lOiAnR2F6ZXInLCBocDogMjQwLCB0ZXh0dXJlQmFzZTogJ2dhemVyJywgc3RhdHM6IHtzdHI6ICc1RDgnLCBkZnM6ICcyRDInLCBleHA6IDE2LCBmbHk6IHRydWV9fSxcclxuXHRcdHJlYXBlcjoge25hbWU6ICdSZWFwZXInLCBocDogMjU1LCB0ZXh0dXJlQmFzZTogJ3JlYXBlcicsIHN0YXRzOiB7c3RyOiAnNUQ4JywgZGZzOiAnMkQyJywgZXhwOiAxNn19LFxyXG5cdFx0YmFscm9uOiB7bmFtZTogJ0JhbHJvbicsIGhwOiAyNTUsIHRleHR1cmVCYXNlOiAnYmFscm9uJywgc3RhdHM6IHtzdHI6ICc5RDQnLCBkZnM6ICcyRDInLCBleHA6IDE2fX0sXHJcblx0XHQvL3R3aXN0ZXI6IHtuYW1lOiAnVHdpc3RlcicsIGhwOiAyNSwgdGV4dHVyZUJhc2U6ICdiYXQnLCBzdGF0czoge3N0cjogJzREMicsIGRmczogJzJEMicsIGV4cDogNX19LFx0XHRcdC8vIG5vdCBpbiB1NVxyXG5cdFx0XHJcblx0XHR3YXJyaW9yOiB7bmFtZTogJ0ZpZ2h0ZXInLCBocDogOTgsIHRleHR1cmVCYXNlOiAnZmlnaHRlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA3fX0sXHJcblx0XHRtYWdlOiB7bmFtZTogJ01hZ2UnLCBocDogMTEyLCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzVENScsIGRmczogJzJEMicsIGV4cDogOH19LFxyXG5cdFx0YmFyZDoge25hbWU6ICdCYXJkJywgaHA6IDQ4LCB0ZXh0dXJlQmFzZTogJ2JhcmQnLCBzdGF0czoge3N0cjogJzJEMTAnLCBkZnM6ICcyRDInLCBleHA6IDd9fSxcclxuXHRcdGRydWlkOiB7bmFtZTogJ0RydWlkJywgaHA6IDY0LCB0ZXh0dXJlQmFzZTogJ21hZ2UnLCBzdGF0czoge3N0cjogJzNENScsIGRmczogJzJEMicsIGV4cDogMTB9fSxcclxuXHRcdHRpbmtlcjoge25hbWU6ICdUaW5rZXInLCBocDogOTYsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICc0RDUnLCBkZnM6ICcyRDInLCBleHA6IDl9fSxcclxuXHRcdHBhbGFkaW46IHtuYW1lOiAnUGFsYWRpbicsIGhwOiAxMjgsIHRleHR1cmVCYXNlOiAnZmlnaHRlcicsIHN0YXRzOiB7c3RyOiAnNUQ1JywgZGZzOiAnMkQyJywgZXhwOiA0fX0sXHJcblx0XHRzaGVwaGVyZDoge25hbWU6ICdTaGVwaGVyZCcsIGhwOiA0OCwgdGV4dHVyZUJhc2U6ICdyYW5nZXInLCBzdGF0czoge3N0cjogJzNEMycsIGRmczogJzJEMicsIGV4cDogOX19LFxyXG5cdFx0cmFuZ2VyOiB7bmFtZTogJ1JhbmdlcicsIGhwOiAxNDQsIHRleHR1cmVCYXNlOiAncmFuZ2VyJywgc3RhdHM6IHtzdHI6ICc1RDUnLCBkZnM6ICcyRDInLCBleHA6IDN9fVxyXG5cdH0sXHJcblx0XHJcblx0Z2V0RW5lbXk6IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0aWYgKCF0aGlzLmVuZW1pZXNbbmFtZV0pIHRocm93IFwiSW52YWxpZCBlbmVteSBuYW1lOiBcIiArIG5hbWU7XHJcblx0XHRcclxuXHRcdHZhciBlbmVteSA9IHRoaXMuZW5lbWllc1tuYW1lXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGkgaW4gZW5lbXkpe1xyXG5cdFx0XHRyZXRbaV0gPSBlbmVteVtpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcbn07XHJcbiIsImZ1bmN0aW9uIEludmVudG9yeShsaW1pdEl0ZW1zKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0ludmVudG9yeScpO1xyXG5cdHRoaXMuaXRlbXMgPSBbXTtcclxuXHR0aGlzLmxpbWl0SXRlbXMgPSBsaW1pdEl0ZW1zO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEludmVudG9yeTtcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnSW52ZW50b3J5JywgSW52ZW50b3J5KTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuaXRlbXMgPSBbXTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuYWRkSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG5cdGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PSB0aGlzLmxpbWl0SXRlbXMpe1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmVxdWlwSXRlbSA9IGZ1bmN0aW9uKGl0ZW1JZCl7XHJcblx0dmFyIHR5cGUgPSB0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdGVtLnR5cGUgPT0gdHlwZSl7XHJcblx0XHRcdGl0ZW0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0dGhpcy5pdGVtc1tpdGVtSWRdLmVxdWlwcGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0RXF1aXBwZWRJdGVtID0gZnVuY3Rpb24odHlwZSl7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLml0ZW1zLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xyXG5cdFx0XHJcblx0XHRpZiAoaXRlbS50eXBlID09IHR5cGUgJiYgaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdHJldHVybiBpdGVtO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZ2V0V2VhcG9uID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5nZXRFcXVpcHBlZEl0ZW0oJ3dlYXBvbicpO1xyXG59O1xyXG5cclxuSW52ZW50b3J5LnByb3RvdHlwZS5nZXRBcm1vdXIgPSBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB0aGlzLmdldEVxdWlwcGVkSXRlbSgnYXJtb3VyJyk7XHJcbn07XHJcblxyXG5JbnZlbnRvcnkucHJvdG90eXBlLmRlc3Ryb3lJdGVtID0gZnVuY3Rpb24oaXRlbSl7XHJcblx0aXRlbS5zdGF0dXMgPSAwLjA7XHJcblx0aXRlbS5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pdGVtcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IHRoaXMuaXRlbXNbaV07XHJcblx0XHRcclxuXHRcdGlmIChpdCA9PT0gaXRlbSl7XHJcblx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGksIDEpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbkludmVudG9yeS5wcm90b3R5cGUuZHJvcEl0ZW0gPSBmdW5jdGlvbihpdGVtSWQpe1xyXG5cdGlmICh0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZSA9PSAnd2VhcG9uJyB8fCB0aGlzLml0ZW1zW2l0ZW1JZF0udHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHR0aGlzLml0ZW1zW2l0ZW1JZF0uZXF1aXBwZWQgPSBmYWxzZTtcclxuXHR9XHJcblx0dGhpcy5pdGVtcy5zcGxpY2UoaXRlbUlkLCAxKTtcclxufTtcclxuIiwidmFyIEJpbGxib2FyZCA9IHJlcXVpcmUoJy4vQmlsbGJvYXJkJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnSXRlbScsICdiaWxsYm9hcmQnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ0l0ZW0nLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsIDEuMCksIGdhbWUuR0wuY3R4KTtcclxuXHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG51bGw7XHJcblx0aWYgKG9iamVjdC5pdGVtKSB7XHJcblx0XHRvYmplY3QuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IGdhbWUub2JqZWN0VGV4W29iamVjdC5pdGVtLnRleF0uYnVmZmVyc1tvYmplY3QuaXRlbS5zdWJJbWddO1xyXG5cdFx0b2JqZWN0LnRleHR1cmVDb2RlID0gb2JqZWN0Lml0ZW0udGV4O1xyXG5cdH1cclxufSk7XHRcclxuXHJcbmZ1bmN0aW9uIEl0ZW0oKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ0l0ZW0nKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJdGVtO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdJdGVtJywgSXRlbSk7XHJcblxyXG5JdGVtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGl0ZW0sIG1hcE1hbmFnZXIpe1xyXG5cdHZhciBnbCA9IG1hcE1hbmFnZXIuZ2FtZS5HTC5jdHg7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdHRoaXMuaXRlbSA9IG51bGw7XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG51bGw7XHJcblx0dGhpcy50ZXh0dXJlQ29kZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0XHJcblx0aWYgKGl0ZW0pIHRoaXMuc2V0SXRlbShpdGVtKTtcclxufVxyXG5cclxuXHJcbkl0ZW0ucHJvdG90eXBlLnNldEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHR0aGlzLml0ZW0gPSBpdGVtO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleFt0aGlzLml0ZW0udGV4XS5idWZmZXJzW3RoaXMuaXRlbS5zdWJJbWddO1xyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSBpdGVtLnRleDtcclxufTtcclxuXHJcbkl0ZW0ucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbW0gPSB0aGlzLm1hcE1hbmFnZXI7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAodGhpcy5pdGVtLmlzSXRlbSl7XHJcblx0XHRpZiAodGhpcy5pdGVtLnR5cGUgPT0gJ2NvZGV4Jyl7XHJcblx0XHRcdC8vIDEwIGxpbmVzXHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJUaGUgYm91bmRsZXNzIGtub3dubGVkZ2Ugb2YgdGhlIENvZGV4IGlzIHJldmVhbGVkIHVudG8gdGhlZS5cIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJBIHZvaWNlIHRodW5kZXJzIVwiKVxyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiVGhvdSBoYXN0IHByb3ZlbiB0aHlzZWxmIHRvIGJlIHRydWx5IGdvb2QgaW4gbmF0dXJlXCIpXHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJUaG91IG11c3Qga25vdyB0aGF0IHRoeSBxdWVzdCB0byBiZWNvbWUgYW4gQXZhdGFyIGlzIHRoZSBlbmRsZXNzIFwiKVxyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwicXVlc3Qgb2YgYSBsaWZldGltZS5cIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJBdmF0YXJob29kIGlzIGEgbGl2aW5nIGdpZnQsIEl0IG11c3QgYWx3YXlzIGFuZCBmb3JldmVyIGJlIG51cnR1cmVkXCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwidG8gZmx1b3Jpc2gsIGZvciBpZiB0aG91IGRvc3Qgc3RyYXkgZnJvbSB0aGUgcGF0aHMgb2YgdmlydHVlLCB0aHkgd2F5XCIpO1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwibWF5IGJlIGxvc3QgZm9yZXZlci5cIilcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIlJldHVybiBub3cgdW50byB0aGluZSBvdXIgd29ybGQsIGxpdmUgdGhlcmUgYXMgYW4gZXhhbXBsZSB0byB0aHlcIik7XHJcblx0XHRcdG1tLmFkZE1lc3NhZ2UoXCJwZW9wbGUsIGFzIG91ciBtZW1vcnkgb2YgdGh5IGdhbGxhbnQgZGVlZHMgc2VydmVzIHVzLlwiKVxyXG5cdFx0fSBlbHNlIGlmICh0aGlzLml0ZW0udHlwZSA9PSAnZmVhdHVyZScpe1xyXG5cdFx0XHRtbS5hZGRNZXNzYWdlKFwiWW91IHNlZSBhIFwiK3RoaXMuaXRlbS5uYW1lKTtcclxuXHRcdH0gZWxzZSBpZiAoZ2FtZS5hZGRJdGVtKHRoaXMuaXRlbSkpe1xyXG5cdFx0XHR2YXIgc3RhdCA9ICcnO1xyXG5cdFx0XHRpZiAodGhpcy5pdGVtLnN0YXR1cyAhPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRcdHN0YXQgPSBJdGVtRmFjdG9yeS5nZXRTdGF0dXNOYW1lKHRoaXMuaXRlbS5zdGF0dXMpICsgJyAnO1xyXG5cdFx0XHRcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShzdGF0ICsgdGhpcy5pdGVtLm5hbWUgKyBcIiBwaWNrZWQuXCIpO1xyXG5cdFx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0bW0uYWRkTWVzc2FnZShcIllvdSBjYW4ndCBjYXJyeSBhbnkgbW9yZSBpdGVtc1wiKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5JdGVtLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdGdhbWUuZHJhd0JpbGxib2FyZCh0aGlzLnBvc2l0aW9uLHRoaXMudGV4dHVyZUNvZGUsdGhpcy5iaWxsYm9hcmQpO1xyXG59O1xyXG5cclxuSXRlbS5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm47XHJcblx0aWYgKHRoaXMubWFwTWFuYWdlci5nYW1lLnBhdXNlZCl7XHJcblx0XHR0aGlzLmRyYXcoKTsgXHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGl0ZW1zOiB7XHJcblx0XHQvLyBJdGVtc1xyXG5cdFx0eWVsbG93UG90aW9uOiB7bmFtZTogXCJZZWxsb3cgcG90aW9uXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdwb3Rpb24nfSxcclxuXHRcdHJlZFBvdGlvbjoge25hbWU6IFwiUmVkIFBvdGlvblwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxLCB0eXBlOiAncG90aW9uJ30sXHJcblx0XHRcclxuXHRcdC8vIFdlYXBvbnNcclxuXHRcdHN0YWZmOiB7bmFtZTogXCJTdGFmZlwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyLCB2aWV3UG9ydEltZzogMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzRENCcsIHdlYXI6IDAuMDJ9LFxyXG5cdFx0ZGFnZ2VyOiB7bmFtZTogXCJEYWdnZXJcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMywgdmlld1BvcnRJbWc6IDIsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICczRDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdHNsaW5nOiB7bmFtZTogXCJTbGluZ1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA0LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnNEQ4JywgcmFuZ2VkOiB0cnVlLCBzdWJJdGVtTmFtZTogJ3JvY2snLCB3ZWFyOiAwLjA0fSxcclxuXHRcdG1hY2U6IHtuYW1lOiBcIk1hY2VcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogNSwgdmlld1BvcnRJbWc6IDMsIHR5cGU6ICd3ZWFwb24nLCBzdHI6ICcxMEQ0Jywgd2VhcjogMC4wM30sXHJcblx0XHRheGU6IHtuYW1lOiBcIkF4ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA2LCB2aWV3UG9ydEltZzogNCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEyRDQnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdHN3b3JkOiB7bmFtZTogXCJTd29yZFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiA4LCB2aWV3UG9ydEltZzogMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE2RDQnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRteXN0aWNTd29yZDoge25hbWU6IFwiTXlzdGljIFN3b3JkXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDksIHZpZXdQb3J0SW1nOiA1LCB0eXBlOiAnd2VhcG9uJywgc3RyOiAnMTZEMTYnLCB3ZWFyOiAwLjAwOH0sXHJcblx0XHRib3c6IHtuYW1lOiBcIkJvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMCwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzEwRDQnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnYXJyb3cnLCB3ZWFyOiAwLjAxfSxcclxuXHRcdGNyb3NzYm93OiB7bmFtZTogXCJDcm9zc2Jvd1wiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMSwgdHlwZTogJ3dlYXBvbicsIHN0cjogJzE2RDQnLCByYW5nZWQ6IHRydWUsIHN1Ykl0ZW1OYW1lOiAnY3Jvc3Nib3cgYm9sdCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdFxyXG5cdFx0Ly8gQXJtb3VyXHJcblx0XHRsZWF0aGVyOiB7bmFtZTogXCJMZWF0aGVyIGFybW91clwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ2FybW91cicsIGRmczogJzE4RDgnLCB3ZWFyOiAwLjA1fSxcclxuXHRcdGNoYWluOiB7bmFtZTogXCJDaGFpbiBtYWlsXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDEzLCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMjBEOCcsIHdlYXI6IDAuMDN9LFxyXG5cdFx0cGxhdGU6IHtuYW1lOiBcIlBsYXRlIG1haWxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTQsIHR5cGU6ICdhcm1vdXInLCBkZnM6ICcyMkQ4Jywgd2VhcjogMC4wMTV9LFxyXG5cdFx0bXlzdGljOiB7bmFtZTogXCJNeXN0aWMgYXJtb3VyXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE1LCB0eXBlOiAnYXJtb3VyJywgZGZzOiAnMzFEOCcsIHdlYXI6IDAuMDA4fSxcclxuXHRcdFxyXG5cdFx0Ly8gU3BlbGwgbWl4ZXNcclxuXHRcdGN1cmU6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEN1cmVcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDAsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDV9LFxyXG5cdFx0aGVhbDoge25hbWU6IFwiU3BlbGxtaXggb2YgSGVhbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTAsIHBlcmNlbnQ6IDAuMn0sXHJcblx0XHRsaWdodDoge25hbWU6IFwiU3BlbGxtaXggb2YgTGlnaHRcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDIsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDUsIGxpZ2h0VGltZTogMTAwMH0sXHJcblx0XHRtaXNzaWxlOiB7bmFtZTogXCJTcGVsbG1peCBvZiBtYWdpYyBtaXNzaWxlXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAzLCB0eXBlOiAnbWFnaWMnLCBzdHI6ICczMEQ1JywgbWFuYTogNX0sXHJcblx0XHRpY2ViYWxsOiB7bmFtZTogXCJTcGVsbG1peCBvZiBJY2ViYWxsXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA0LCB0eXBlOiAnbWFnaWMnLCBzdHI6ICc2NUQ1JywgbWFuYTogMjB9LFxyXG5cdFx0cmVwZWw6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIFJlcGVsIFVuZGVhZFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogNSwgdHlwZTogJ21hZ2ljJywgbWFuYTogMTV9LFxyXG5cdFx0Ymxpbms6IHtuYW1lOiBcIlNwZWxsbWl4IG9mIEJsaW5rXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA2LCB0eXBlOiAnbWFnaWMnLCBtYW5hOiAxNX0sXHJcblx0XHRmaXJlYmFsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgRmlyZWJhbGxcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDcsIHR5cGU6ICdtYWdpYycsIHN0cjogJzEwMEQ1JywgbWFuYTogMTV9LFxyXG5cdFx0cHJvdGVjdGlvbjoge25hbWU6IFwiU3BlbGxtaXggb2YgcHJvdGVjdGlvblwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogOCwgdHlwZTogJ21hZ2ljJywgcHJvdFRpbWU6IDQwMCwgbWFuYTogMTV9LFxyXG5cdFx0dGltZToge25hbWU6IFwiU3BlbGxtaXggb2YgVGltZSBTdG9wXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiA5LCB0eXBlOiAnbWFnaWMnLCBzdG9wVGltZTogNjAwLCBtYW5hOiAzMH0sXHJcblx0XHRzbGVlcDoge25hbWU6IFwiU3BlbGxtaXggb2YgU2xlZXBcIiwgdGV4OiBcInNwZWxsc1wiLCBzdWJJbWc6IDEwLCB0eXBlOiAnbWFnaWMnLCBzbGVlcFRpbWU6IDQwMCwgbWFuYTogMTV9LFxyXG5cdFx0amlueDoge25hbWU6IFwiU3BlbGxtaXggb2YgSmlueFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTEsIHR5cGU6ICdtYWdpYycsIG1hbmE6IDMwfSxcclxuXHRcdHRyZW1vcjoge25hbWU6IFwiU3BlbGxtaXggb2YgVHJlbW9yXCIsIHRleDogXCJzcGVsbHNcIiwgc3ViSW1nOiAxMiwgdHlwZTogJ21hZ2ljJywgbWFuYTogMzB9LFxyXG5cdFx0a2lsbDoge25hbWU6IFwiU3BlbGxtaXggb2YgS2lsbFwiLCB0ZXg6IFwic3BlbGxzXCIsIHN1YkltZzogMTMsIHR5cGU6ICdtYWdpYycsIHN0cjogJzQwMEQ1JywgbWFuYTogMjV9LFxyXG5cdFx0XHJcblx0XHQvLyBDb2RleFxyXG5cdFx0Y29kZXg6IHtuYW1lOiBcIkNvZGV4IG9mIFVsdGltYXRlIFdpc2RvbVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxNiwgdHlwZTogJ2NvZGV4J30sXHJcblx0XHRcclxuXHRcdC8vIFRlbXA6IER1bmdlb24gZmVhdHVyZXMgYXMgaXRlbXNcclxuXHRcdG9yYjoge25hbWU6IFwiT3JiXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDE3LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0ZGVhZFRyZWU6IHtuYW1lOiBcIkRlYWQgVHJlZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAxOCwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHRyZWU6IHtuYW1lOiBcIlRyZWVcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMTksIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRzdGF0dWU6IHtuYW1lOiBcIlN0YXR1ZVwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMCwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHNpZ25Qb3N0OiB7bmFtZTogXCJTaWducG9zdFwiLCB0ZXg6IFwiaXRlbXNcIiwgc3ViSW1nOiAyMSwgdHlwZTogJ2ZlYXR1cmUnfSxcclxuXHRcdHdlbGw6IHtuYW1lOiBcIldlbGxcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjIsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRzbWFsbFNpZ246IHtuYW1lOiBcIlNpZ25cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjMsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRsYW1wOiB7bmFtZTogXCJMYW1wXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI0LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0ZmxhbWU6IHtuYW1lOiBcIkZsYW1lXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI1LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0Y2FtcGZpcmU6IHtuYW1lOiBcIkNhbXBmaXJlXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI2LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0YWx0YXI6IHtuYW1lOiBcIkFsdGFyXCIsIHRleDogXCJpdGVtc1wiLCBzdWJJbWc6IDI3LCB0eXBlOiAnZmVhdHVyZSd9LFxyXG5cdFx0cHJpc29uZXJUaGluZzoge25hbWU6IFwiU2hhY2tsZXNcIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjgsIHR5cGU6ICdmZWF0dXJlJ30sXHJcblx0XHRmb3VudGFpbjoge25hbWU6IFwiRm91bnRhaW5cIiwgdGV4OiBcIml0ZW1zXCIsIHN1YkltZzogMjksIHR5cGU6ICdmZWF0dXJlJ31cclxuXHR9LFxyXG5cdFxyXG5cdGdldEl0ZW1CeUNvZGU6IGZ1bmN0aW9uKGl0ZW1Db2RlLCBzdGF0dXMpe1xyXG5cdFx0aWYgKCF0aGlzLml0ZW1zW2l0ZW1Db2RlXSkgdGhyb3cgXCJJbnZhbGlkIEl0ZW0gY29kZTogXCIgKyBpdGVtQ29kZTtcclxuXHRcdFxyXG5cdFx0dmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2l0ZW1Db2RlXTtcclxuXHRcdHZhciByZXQgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKClcclxuXHRcdH07XHJcblx0XHRmb3IgKHZhciBpIGluIGl0ZW0pe1xyXG5cdFx0XHRyZXRbaV0gPSBpdGVtW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXQuaXNJdGVtID0gdHJ1ZTtcclxuXHRcdHJldC5jb2RlID0gaXRlbUNvZGU7XHJcblx0XHRcclxuXHRcdGlmIChyZXQudHlwZSA9PSAnd2VhcG9uJyB8fCByZXQudHlwZSA9PSAnYXJtb3VyJyl7XHJcblx0XHRcdHJldC5lcXVpcHBlZCA9IGZhbHNlO1xyXG5cdFx0XHRyZXQuc3RhdHVzID0gc3RhdHVzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0U3RhdHVzTmFtZTogZnVuY3Rpb24oc3RhdHVzKXtcclxuXHRcdGlmIChzdGF0dXMgPj0gMC44KXtcclxuXHRcdFx0cmV0dXJuICdFeGNlbGxlbnQnO1xyXG5cdFx0fWVsc2UgaWYgKHN0YXR1cyA+PSAwLjUpe1xyXG5cdFx0XHRyZXR1cm4gJ1NlcnZpY2VhYmxlJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPj0gMC4yKXtcclxuXHRcdFx0cmV0dXJuICdXb3JuJztcclxuXHRcdH1lbHNlIGlmIChzdGF0dXMgPiAwLjApe1xyXG5cdFx0XHRyZXR1cm4gJ0JhZGx5IHdvcm4nO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiAnUnVpbmVkJztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsInZhciBEb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XHJcbnZhciBFbmVteSA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxudmFyIEVuZW15RmFjdG9yeSA9IHJlcXVpcmUoJy4vRW5lbXlGYWN0b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBTdGFpcnMgPSByZXF1aXJlKCcuL1N0YWlycycpO1xyXG5cclxuZnVuY3Rpb24gTWFwQXNzZW1ibGVyKCl7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwQXNzZW1ibGVyO1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5hc3NlbWJsZU1hcCA9IGZ1bmN0aW9uKG1hcE1hbmFnZXIsIG1hcERhdGEsIEdMKXtcclxuXHR0aGlzLm1hcE1hbmFnZXIgPSAgbWFwTWFuYWdlcjtcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5wYXJzZU1hcChtYXBEYXRhLCBHTCk7XHJcblx0XHRcdFx0XHJcblx0dGhpcy5hc3NlbWJsZUZsb29yKG1hcERhdGEsIEdMKTsgXHJcblx0dGhpcy5hc3NlbWJsZUNlaWxzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlQmxvY2tzKG1hcERhdGEsIEdMKTtcclxuXHR0aGlzLmFzc2VtYmxlU2xvcGVzKG1hcERhdGEsIEdMKTtcclxuXHRcclxuXHR0aGlzLnBhcnNlT2JqZWN0cyhtYXBEYXRhKTtcclxuXHRcclxuXHR0aGlzLmNvcGllZFRpbGVzID0gW107XHJcblx0XHJcblx0dGhpcy5pbml0aWFsaXplVGlsZXMobWFwRGF0YS50aWxlcyk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVUZXJyYWluID0gZnVuY3Rpb24obWFwTWFuYWdlciwgR0wpe1xyXG5cdHRoaXMubWFwTWFuYWdlciA9ICBtYXBNYW5hZ2VyO1xyXG5cdHRoaXMuYXNzZW1ibGVGbG9vcihtYXBNYW5hZ2VyLCBHTCk7IFxyXG5cdHRoaXMuYXNzZW1ibGVDZWlscyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZUJsb2NrcyhtYXBNYW5hZ2VyLCBHTCk7XHJcblx0dGhpcy5hc3NlbWJsZVNsb3BlcyhtYXBNYW5hZ2VyLCBHTCk7XHJcbn1cclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZVRpbGVzID0gZnVuY3Rpb24odGlsZXMpe1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0aWYgKHRpbGVzW2ldKVxyXG5cdFx0XHR0aWxlc1tpXS5fYyA9IGNpcmN1bGFyLnNldFNhZmUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmdldEVtcHR5R3JpZCA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdyaWQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTA7eTw2NDt5Kyspe1xyXG5cdFx0Z3JpZFt5XSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgeD0wO3g8NjQ7eCsrKXtcclxuXHRcdFx0Z3JpZFt5XVt4XSA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBncmlkO1xyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5jb3B5VGlsZSA9IGZ1bmN0aW9uKHRpbGUpe1xyXG5cdHZhciByZXQgPSB7XHJcblx0XHRfYzogY2lyY3VsYXIuc2V0U2FmZSgpXHJcblx0fTtcclxuXHRcclxuXHRmb3IgKHZhciBpIGluIHRpbGUpe1xyXG5cdFx0cmV0W2ldID0gdGlsZVtpXTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcEFzc2VtYmxlci5wcm90b3R5cGUuYXNzZW1ibGVGbG9vciA9IGZ1bmN0aW9uKG1hcERhdGEsIEdMKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIG9GbG9vcnMgPSBbXTtcclxuXHR2YXIgZmxvb3JzSW5kID0gW107XHJcblx0Zm9yICh2YXIgeT0wLGxlbj1tYXBEYXRhLm1hcC5sZW5ndGg7eTxsZW47eSsrKXtcclxuXHRcdGZvciAodmFyIHg9MCx4bGVuPW1hcERhdGEubWFwW3ldLmxlbmd0aDt4PHhsZW47eCsrKXtcclxuXHRcdFx0dmFyIHRpbGUgPSBtYXBEYXRhLm1hcFt5XVt4XTtcclxuXHRcdFx0aWYgKHRpbGUuZil7XHJcblx0XHRcdFx0dmFyIGluZCA9IGZsb29yc0luZC5pbmRleE9mKHRpbGUuZik7XHJcblx0XHRcdFx0dmFyIGZsO1xyXG5cdFx0XHRcdGlmIChpbmQgPT0gLTEpe1xyXG5cdFx0XHRcdFx0Zmxvb3JzSW5kLnB1c2godGlsZS5mKTtcclxuXHRcdFx0XHRcdGZsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGZsLnRpbGUgPSB0aWxlLmY7XHJcblx0XHRcdFx0XHRmbC5yVGlsZSA9IHRpbGUucmY7XHJcblx0XHRcdFx0XHRvRmxvb3JzLnB1c2goZmwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0ZmwgPSBvRmxvb3JzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRmbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmYsIHk6IHl5fTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmb3IgKHZhciBpPTA7aTxvRmxvb3JzLmxlbmd0aDtpKyspe1xyXG5cdFx0dmFyIGZsb29yM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9GbG9vcnNbaV0sIFwiRlwiLCBHTCk7XHJcblx0XHRmbG9vcjNELnRleEluZCA9IG9GbG9vcnNbaV0udGlsZTtcclxuXHRcdGZsb29yM0QuclRleEluZCA9IG9GbG9vcnNbaV0uclRpbGU7XHJcblx0XHRmbG9vcjNELnR5cGUgPSBcIkZcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChmbG9vcjNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQ2VpbHMgPSBmdW5jdGlvbihtYXBEYXRhLCBHTCl7XHJcblx0dmFyIG1hcE0gPSB0aGlzO1xyXG5cdHZhciBvQ2VpbHMgPSBbXTtcclxuXHR2YXIgY2VpbHNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5jKXtcclxuXHRcdFx0XHR2YXIgaW5kID0gY2VpbHNJbmQuaW5kZXhPZih0aWxlLmMpO1xyXG5cdFx0XHRcdHZhciBjbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdGNlaWxzSW5kLnB1c2godGlsZS5jKTtcclxuXHRcdFx0XHRcdGNsID0gbWFwTS5nZXRFbXB0eUdyaWQoKTtcclxuXHRcdFx0XHRcdGNsLnRpbGUgPSB0aWxlLmM7XHJcblx0XHRcdFx0XHRvQ2VpbHMucHVzaChjbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjbCA9IG9DZWlsc1tpbmRdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjbFt5XVt4XSA9IHt0aWxlOiB0aWxlLmMsIHk6IHRpbGUuY2h9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPG9DZWlscy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBjZWlsM0QgPSBPYmplY3RGYWN0b3J5LmFzc2VtYmxlT2JqZWN0KG9DZWlsc1tpXSwgXCJDXCIsIEdMKTtcclxuXHRcdGNlaWwzRC50ZXhJbmQgPSBvQ2VpbHNbaV0udGlsZTtcclxuXHRcdGNlaWwzRC50eXBlID0gXCJDXCI7XHJcblx0XHRtYXBNLm1hcE1hbmFnZXIubWFwVG9EcmF3LnB1c2goY2VpbDNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlQmxvY2tzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb0Jsb2NrcyA9IFtdO1xyXG5cdHZhciBibG9ja3NJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS53KXtcclxuXHRcdFx0XHR2YXIgaW5kID0gYmxvY2tzSW5kLmluZGV4T2YodGlsZS53KTtcclxuXHRcdFx0XHR2YXIgd2w7XHJcblx0XHRcdFx0aWYgKGluZCA9PSAtMSl7XHJcblx0XHRcdFx0XHRibG9ja3NJbmQucHVzaCh0aWxlLncpO1xyXG5cdFx0XHRcdFx0d2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0d2wudGlsZSA9IHRpbGUudztcclxuXHRcdFx0XHRcdG9CbG9ja3MucHVzaCh3bCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR3bCA9IG9CbG9ja3NbaW5kXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2xbeV1beF0gPSB7dGlsZTogdGlsZS53LCB5OiB0aWxlLnksIGg6IHRpbGUuaH07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b0Jsb2Nrcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBibG9jazNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvQmxvY2tzW2ldLCBcIkJcIiwgR0wpO1xyXG5cdFx0YmxvY2szRC50ZXhJbmQgPSBvQmxvY2tzW2ldLnRpbGU7XHJcblx0XHRibG9jazNELnR5cGUgPSBcIkJcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChibG9jazNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLmFzc2VtYmxlU2xvcGVzID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR2YXIgb1Nsb3BlcyA9IFtdO1xyXG5cdHZhciBzbG9wZXNJbmQgPSBbXTtcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHR2YXIgdGlsZSA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRpZiAodGlsZS5zbCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IHNsb3Blc0luZC5pbmRleE9mKHRpbGUuc2wpO1xyXG5cdFx0XHRcdHZhciBzbDtcclxuXHRcdFx0XHRpZiAoaW5kID09IC0xKXtcclxuXHRcdFx0XHRcdHNsb3Blc0luZC5wdXNoKHRpbGUuc2wpO1xyXG5cdFx0XHRcdFx0c2wgPSBtYXBNLmdldEVtcHR5R3JpZCgpO1xyXG5cdFx0XHRcdFx0c2wudGlsZSA9IHRpbGUuc2w7XHJcblx0XHRcdFx0XHRvU2xvcGVzLnB1c2goc2wpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2wgPSBvU2xvcGVzW2luZF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB5eSA9IHRpbGUueTtcclxuXHRcdFx0XHRpZiAodGlsZS53KSB5eSArPSB0aWxlLmg7XHJcblx0XHRcdFx0aWYgKHRpbGUuZnkpIHl5ID0gdGlsZS5meTtcclxuXHRcdFx0XHRzbFt5XVt4XSA9IHt0aWxlOiB0aWxlLnNsLCB5OiB5eSwgZGlyOiB0aWxlLmRpcn07XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0Zm9yICh2YXIgaT0wO2k8b1Nsb3Blcy5sZW5ndGg7aSsrKXtcclxuXHRcdHZhciBzbG9wZTNEID0gT2JqZWN0RmFjdG9yeS5hc3NlbWJsZU9iamVjdChvU2xvcGVzW2ldLCBcIlNcIiwgR0wpO1xyXG5cdFx0c2xvcGUzRC50ZXhJbmQgPSBvU2xvcGVzW2ldLnRpbGU7XHJcblx0XHRzbG9wZTNELnR5cGUgPSBcIlNcIjtcclxuXHRcdG1hcE0ubWFwTWFuYWdlci5tYXBUb0RyYXcucHVzaChzbG9wZTNEKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBBc3NlbWJsZXIucHJvdG90eXBlLnBhcnNlTWFwID0gZnVuY3Rpb24obWFwRGF0YSwgR0wpe1xyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHRmb3IgKHZhciB5PTAsbGVuPW1hcERhdGEubWFwLmxlbmd0aDt5PGxlbjt5Kyspe1xyXG5cdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YS5tYXBbeV0ubGVuZ3RoO3g8eGxlbjt4Kyspe1xyXG5cdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beF0gIT0gMCl7XHJcblx0XHRcdFx0dmFyIGluZCA9IG1hcERhdGEubWFwW3ldW3hdO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS50aWxlc1tpbmRdO1xyXG5cdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mICYmIHRpbGUuZiA+IDEwMCl7XHJcblx0XHRcdFx0XHR0aWxlLnJmID0gdGlsZS5mIC0gMTAwO1xyXG5cdFx0XHRcdFx0dGlsZS5pc1dhdGVyID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dGlsZS55ID0gLTAuMjtcclxuXHRcdFx0XHRcdHRpbGUuZnkgPSAtMC4yO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAodGlsZS5mIDwgMTAwKXtcclxuXHRcdFx0XHRcdHZhciB0MSwgdDIsIHQzLCB0NDtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5XVt4KzFdKSB0MSA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3ldW3grMV1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0aWYgKG1hcERhdGEubWFwW3ktMV0pIHQyID0gKG1hcERhdGEubWFwW3ktMV1beF0uZiA+IDEwMCk7XHJcblx0XHRcdFx0XHRpZiAobWFwRGF0YS5tYXBbeV1beC0xXSkgdDMgPSAobWFwRGF0YS5tYXBbeV1beC0xXS5mID4gMTAwKTtcclxuXHRcdFx0XHRcdGlmIChtYXBEYXRhLm1hcFt5KzFdKSB0NCA9IChtYXBEYXRhLnRpbGVzW21hcERhdGEubWFwW3krMV1beF1dLmYgPiAxMDApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAodDEgfHwgdDIgfHwgdDMgfHwgdDQpe1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jb3BpZWRUaWxlc1tpbmRdKXtcclxuXHRcdFx0XHRcdFx0XHRtYXBEYXRhLm1hcFt5XVt4XSA9IHRoaXMuY29waWVkVGlsZXNbaW5kXTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5jb3BpZWRUaWxlc1tpbmRdID0gdGhpcy5jb3B5VGlsZSh0aWxlKTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlID0gdGhpcy5jb3BpZWRUaWxlc1tpbmRdO1xyXG5cdFx0XHRcdFx0XHRcdG1hcERhdGEubWFwW3ldW3hdID0gdGlsZTtcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHR0aWxlLnkgPSAtMTtcclxuXHRcdFx0XHRcdFx0XHR0aWxlLmggKz0gMTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXRpbGUudyl7XHJcblx0XHRcdFx0XHRcdFx0XHR0aWxlLncgPSAxMDtcclxuXHRcdFx0XHRcdFx0XHRcdHRpbGUuaCA9IDE7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwQXNzZW1ibGVyLnByb3RvdHlwZS5wYXJzZU9iamVjdHMgPSBmdW5jdGlvbihtYXBEYXRhKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPW1hcERhdGEub2JqZWN0cy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBvID0gbWFwRGF0YS5vYmplY3RzW2ldO1xyXG5cdFx0dmFyIHggPSBvLng7XHJcblx0XHR2YXIgeSA9IG8ueTtcclxuXHRcdHZhciB6ID0gby56O1xyXG5cdFx0XHJcblx0XHRzd2l0Y2ggKG8udHlwZSl7XHJcblx0XHRcdGNhc2UgXCJwbGF5ZXJcIjpcclxuXHRcdFx0XHR0aGlzLm1hcE1hbmFnZXIucGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5wbGF5ZXIuaW5pdCh2ZWMzKHgsIHksIHopLCB2ZWMzKDAuMCwgby5kaXIgKiBNYXRoLlBJXzIsIDAuMCksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiaXRlbVwiOlxyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBNYXRoLm1pbigwLjMgKyAoTWF0aC5yYW5kb20oKSAqIDAuNyksIDEuMCk7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKG8uaXRlbSwgc3RhdHVzKTtcclxuXHRcdFx0XHR2YXIgaXRlbU9iamVjdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRcdFx0aXRlbU9iamVjdC5pbml0KHZlYzMoeCwgeSwgeiksIGl0ZW0sIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGl0ZW1PYmplY3QpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVuZW15XCI6XHJcblx0XHRcdFx0dmFyIGVuZW15ID0gRW5lbXlGYWN0b3J5LmdldEVuZW15KG8uZW5lbXkpO1xyXG5cdFx0XHRcdHZhciBlbmVteU9iamVjdCA9IG5ldyBFbmVteSgpO1xyXG5cdFx0XHRcdGVuZW15T2JqZWN0LmluaXQodmVjMyh4LCB5LCB6KSwgZW5lbXksIHRoaXMubWFwTWFuYWdlcik7XHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKGVuZW15T2JqZWN0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdGFpcnNcIjpcclxuXHRcdFx0XHR2YXIgc3RhaXJzT2JqID0gbmV3IFN0YWlycygpO1xyXG5cdFx0XHRcdHN0YWlyc09iai5pbml0KHZlYzMoeCwgeSwgeiksIHRoaXMubWFwTWFuYWdlciwgby5kaXIpO1xyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5pbnN0YW5jZXMucHVzaChzdGFpcnNPYmopO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JcIjpcclxuXHRcdFx0XHR2YXIgeHggPSAoeCA8PCAwKSAtICgoby5kaXIgPT0gXCJIXCIpPyAxIDogMCk7XHJcblx0XHRcdFx0dmFyIHp6ID0gKHogPDwgMCkgLSAoKG8uZGlyID09IFwiVlwiKT8gMSA6IDApO1xyXG5cdFx0XHRcdHZhciB0aWxlID0gbWFwRGF0YS5tYXBbenpdW3h4XS53O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5kb29ycy5wdXNoKG5ldyBEb29yKHRoaXMubWFwTWFuYWdlciwgdmVjMyh4LCB5LCB6KSwgby5kaXIsIFwiZG9vcjFcIiwgdGlsZSkpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07IiwidmFyIE1hcEFzc2VtYmxlciA9IHJlcXVpcmUoJy4vTWFwQXNzZW1ibGVyJyk7XHJcbnZhciBPYmplY3RGYWN0b3J5ID0gcmVxdWlyZSgnLi9PYmplY3RGYWN0b3J5Jyk7XHJcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcclxuXHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdnYW1lJyk7XHJcbmNpcmN1bGFyLnNldFRyYW5zaWVudCgnTWFwTWFuYWdlcicsICdtYXBUb0RyYXcnKTtcclxuXHJcbmNpcmN1bGFyLnNldFJldml2ZXIoJ01hcE1hbmFnZXInLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5nYW1lID0gZ2FtZTtcclxuXHR2YXIgR0wgPSBnYW1lLkdMLmN0eDtcclxuXHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdG9iamVjdC5tYXBUb0RyYXcgPSBbXTtcclxuXHRtYXBBc3NlbWJsZXIuYXNzZW1ibGVUZXJyYWluKG9iamVjdCwgR0wpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIE1hcE1hbmFnZXIoKXtcclxuXHR0aGlzLl9jID0gY2lyY3VsYXIucmVnaXN0ZXIoJ01hcE1hbmFnZXInKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBNYW5hZ2VyO1xyXG5jaXJjdWxhci5yZWdpc3RlckNsYXNzKCdNYXBNYW5hZ2VyJywgTWFwTWFuYWdlcik7XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ2FtZSwgbWFwLCBkZXB0aCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdNYXBNYW5hZ2VyJyk7XHJcblx0dGhpcy5tYXAgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMud2F0ZXJUaWxlcyA9IFtdO1xyXG5cdHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcblx0XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnBsYXllciA9IG51bGw7XHJcblx0dGhpcy5pbnN0YW5jZXMgPSBbXTtcclxuXHR0aGlzLm9yZGVySW5zdGFuY2VzID0gW107XHJcblx0dGhpcy5kb29ycyA9IFtdO1xyXG5cdHRoaXMucGxheWVyTGFzdCA9IG51bGw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cdHRoaXMucG9pc29uQ291bnQgPSAwO1xyXG5cdFxyXG5cdHRoaXMubWFwVG9EcmF3ID0gW107XHJcblx0XHJcblx0aWYgKG1hcCA9PSBcInRlc3RcIil7XHJcblx0XHR0aGlzLmxvYWRNYXAoXCJ0ZXN0TWFwXCIpO1xyXG5cdH0gZWxzZSBpZiAobWFwID09IFwiY29kZXhSb29tXCIpe1xyXG5cdFx0dGhpcy5sb2FkTWFwKFwiY29kZXhSb29tXCIpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmdlbmVyYXRlTWFwKGRlcHRoKTtcclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZW5lcmF0ZU1hcCA9IGZ1bmN0aW9uKGRlcHRoKXtcclxuXHR2YXIgY29uZmlnID0ge1xyXG5cdFx0TUlOX1dJRFRIOiAxMCxcclxuXHRcdE1JTl9IRUlHSFQ6IDEwLFxyXG5cdFx0TUFYX1dJRFRIOiAyMCxcclxuXHRcdE1BWF9IRUlHSFQ6IDIwLFxyXG5cdFx0TEVWRUxfV0lEVEg6IDY0LFxyXG5cdFx0TEVWRUxfSEVJR0hUOiA2NCxcclxuXHRcdFNVQkRJVklTSU9OX0RFUFRIOiAzLFxyXG5cdFx0U0xJQ0VfUkFOR0VfU1RBUlQ6IDMvOCxcclxuXHRcdFNMSUNFX1JBTkdFX0VORDogNS84LFxyXG5cdFx0UklWRVJfU0VHTUVOVF9MRU5HVEg6IDEwLFxyXG5cdFx0TUlOX1JJVkVSX1NFR01FTlRTOiAxMCxcclxuXHRcdE1BWF9SSVZFUl9TRUdNRU5UUzogMjAsXHJcblx0XHRNSU5fUklWRVJTOiAzLFxyXG5cdFx0TUFYX1JJVkVSUzogNVxyXG5cdH07XHJcblx0dmFyIGdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IoY29uZmlnKTtcclxuXHR2YXIga3JhbWdpbmVFeHBvcnRlciA9IG5ldyBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyk7XHJcblx0dmFyIGdlbmVyYXRlZExldmVsID0gZ2VuZXJhdG9yLmdlbmVyYXRlTGV2ZWwoZGVwdGgpO1xyXG5cdFxyXG5cdHZhciBtYXBNID0gdGhpcztcclxuXHR0cnl7XHJcblx0XHR3aW5kb3cuZ2VuZXJhdGVkTGV2ZWwgPSAoZ2VuZXJhdGVkTGV2ZWwubGV2ZWwpO1xyXG5cdFx0dmFyIG1hcERhdGEgPSBrcmFtZ2luZUV4cG9ydGVyLmdldExldmVsKGdlbmVyYXRlZExldmVsLmxldmVsKTtcclxuXHRcdHdpbmRvdy5tYXBEYXRhID0gKG1hcERhdGEpO1xyXG5cdFx0dmFyIG1hcEFzc2VtYmxlciA9IG5ldyBNYXBBc3NlbWJsZXIoKTtcclxuXHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdG1hcE0ubWFwID0gbWFwRGF0YS5tYXA7XHJcblx0XHRtYXBNLndhdGVyVGlsZXMgPSBbMTAxLCAxMDNdO1xyXG5cdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHR9Y2F0Y2ggKGUpe1xyXG5cdFx0aWYgKGUubWVzc2FnZSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihlLnN0YWNrKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0fVxyXG5cdFx0bWFwTS5tYXAgPSBudWxsO1xyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbihtYXBOYW1lKXtcclxuXHR2YXIgbWFwTSA9IHRoaXM7XHJcblx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0aHR0cC5vcGVuKCdHRVQnLCBjcCArICdtYXBzLycgKyBtYXBOYW1lICsgXCIuanNvblwiLCB0cnVlKTtcclxuXHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gIFx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgXHRcdFx0dHJ5e1xyXG5cdFx0XHRcdG1hcERhdGEgPSBKU09OLnBhcnNlKGh0dHAucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgbWFwQXNzZW1ibGVyID0gbmV3IE1hcEFzc2VtYmxlcigpO1xyXG5cdFx0XHRcdG1hcEFzc2VtYmxlci5hc3NlbWJsZU1hcChtYXBNLCBtYXBEYXRhLCBtYXBNLmdhbWUuR0wuY3R4KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRtYXBNLm1hcCA9IG1hcERhdGEubWFwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcE0ud2F0ZXJUaWxlcyA9IFsxMDEsIDEwM107XHJcblx0XHRcdFx0bWFwTS5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcdFx0fWNhdGNoIChlKXtcclxuXHRcdFx0XHRpZiAoZS5tZXNzYWdlKXtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZS5zdGFjayk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRtYXBNLm1hcCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fTtcclxuXHRodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIixcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcclxuXHRodHRwLnNlbmQoKTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmlzV2F0ZXJUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gKHRoaXMud2F0ZXJUaWxlcy5pbmRleE9mKHRpbGVJZCkgIT0gLTEpO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuaXNXYXRlclBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdGlmICghdGhpcy5tYXBbel0pIHJldHVybiAwO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcclxuXHRlbHNlIGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gMCkgcmV0dXJuIDA7XHJcblx0XHJcblx0dmFyIHQgPSB0aGlzLm1hcFt6XVt4XTtcclxuXHRpZiAoIXQuZikgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzLmlzV2F0ZXJUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHope1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eiA9IHogPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3pdKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbel1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbel1beF07XHJcblx0aWYgKCF0LmYpIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHRyZXR1cm4gdGhpcy5pc0xhdmFUaWxlKHQuZik7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc0xhdmFUaWxlID0gZnVuY3Rpb24odGlsZUlkKXtcclxuXHRyZXR1cm4gdGlsZUlkID09IDEwMztcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGFuZ2VXYWxsVGV4dHVyZSA9IGZ1bmN0aW9uKHgsIHosIHRleHR1cmVJZCl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbel1beF0gPT09IDApIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHR2YXIgYmFzZSA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghYmFzZS5jbG9uZWQpe1xyXG5cdFx0dmFyIG5ld1cgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgaW4gYmFzZSl7XHJcblx0XHRcdG5ld1dbaV0gPSBiYXNlW2ldO1xyXG5cdFx0fVxyXG5cdFx0bmV3Vy5jbG9uZWQgPSB0cnVlO1xyXG5cdFx0dGhpcy5tYXBbel1beF0gPSBuZXdXO1xyXG5cdFx0YmFzZSA9IG5ld1c7XHJcblx0fVxyXG5cdFxyXG5cdGJhc2UudyA9IHRleHR1cmVJZDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JBdCA9IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5kb29ycy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBkb29yID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdGlmIChkb29yLndhbGxQb3NpdGlvbi5lcXVhbHMoeCwgeSwgeikpIHJldHVybiBkb29yO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXQgPSBmdW5jdGlvbihwb3NpdGlvbil7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdGlmICh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5lcXVhbHMocG9zaXRpb24pKXtcclxuXHRcdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldEluc3RhbmNlQXRHcmlkID0gZnVuY3Rpb24ocG9zaXRpb24pe1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmEpO1xyXG5cdFx0dmFyIHogPSBNYXRoLmZsb29yKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeCA9PSBwb3NpdGlvbi5hICYmIHogPT0gcG9zaXRpb24uYyl7XHJcblx0XHRcdHJldHVybiAodGhpcy5pbnN0YW5jZXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldE5lYXJlc3RDbGVhbkl0ZW1UaWxlID0gZnVuY3Rpb24oeCwgeil7XHJcblx0eCA9IHggPDwgMDtcclxuXHR6ID0geiA8PCAwO1xyXG5cdFxyXG5cdHZhciBtaW5YID0geCAtIDE7XHJcblx0dmFyIG1pblogPSB6IC0gMTtcclxuXHR2YXIgbWF4WCA9IHggKyAxO1xyXG5cdHZhciBtYXhaID0geiArIDE7XHJcblx0XHJcblx0Zm9yICh2YXIgeno9bWluWjt6ejw9bWF4Wjt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PW1pblg7eHg8PW1heFg7eHgrKyl7XHJcblx0XHRcdGlmICh0aGlzLmlzU29saWQoeHgsIHp6LCAwKSB8fCB0aGlzLmlzV2F0ZXJQb3NpdGlvbih4eCwgenopKXtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHBvcyA9IHZlYzMoeHgsIDAsIHp6KTtcclxuXHRcdFx0dmFyIGlucyA9IHRoaXMuZ2V0SW5zdGFuY2VBdEdyaWQocG9zKTtcclxuXHRcdFx0aWYgKCFpbnMgfHwgKCFpbnMuaXRlbSAmJiAhaW5zLnN0YWlycykpe1xyXG5cdFx0XHRcdHJldHVybiBwb3M7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNOZWFyZXN0ID0gZnVuY3Rpb24ocG9zaXRpb24sIGRpc3RhbmNlLCBoYXNQcm9wZXJ0eSl7XHJcblx0dmFyIHJldCA9IFtdO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAodGhpcy5pbnN0YW5jZXNbaV0uZGVzdHJveWVkKSBjb250aW51ZTtcclxuXHRcdGlmIChoYXNQcm9wZXJ0eSAmJiAhdGhpcy5pbnN0YW5jZXNbaV1baGFzUHJvcGVydHldKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSBNYXRoLmFicyh0aGlzLmluc3RhbmNlc1tpXS5wb3NpdGlvbi5hIC0gcG9zaXRpb24uYSk7XHJcblx0XHR2YXIgeiA9IE1hdGguYWJzKHRoaXMuaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMgLSBwb3NpdGlvbi5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHggPD0gZGlzdGFuY2UgJiYgeiA8PSBkaXN0YW5jZSl7XHJcblx0XHRcdHJldC5wdXNoKHRoaXMuaW5zdGFuY2VzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZU5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBzZWxmKXtcclxuXHR2YXIgcCA9IHBvcy5jbG9uZSgpO1xyXG5cdHAuYSA9IHAuYSArIHNwZC5hO1xyXG5cdHAuYyA9IHAuYyArIHNwZC5iO1xyXG5cdFxyXG5cdHZhciBpbnN0ID0gbnVsbCwgaG9yO1xyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5pbnN0YW5jZXNbaV07XHJcblx0XHRpZiAoIWlucyB8fCBpbnMuZGVzdHJveWVkIHx8ICFpbnMuc29saWQpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucyA9PT0gc2VsZikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gcC5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gcC5jKTtcclxuXHRcdFxyXG5cdFx0aWYgKHh4IDw9IDAuOCAmJiB6eiA8PSAwLjgpe1xyXG5cdFx0XHRpZiAocG9zLmEgPD0gaW5zLnBvc2l0aW9uLmEgLSAwLjggfHwgcG9zLmEgPj0gaW5zLnBvc2l0aW9uLmEgKyAwLjgpIGhvciA9IHRydWU7XHJcblx0XHRcdGVsc2UgaWYgKHBvcy5jIDw9IGlucy5wb3NpdGlvbi5jIC0gMC44IHx8IHBvcy5jID49IGlucy5wb3NpdGlvbi5jICsgMC44KSBob3IgPSBmYWxzZTsgIFxyXG5cdFx0XHRpbnN0ID0gaW5zO1xyXG5cdFx0XHRpID0gbGVuO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpZiAoIWluc3QpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdGlmIChpbnN0LmhlaWdodCl7XHJcblx0XHRpZiAocG9zLmIgKyBoIDwgaW5zdC5wb3NpdGlvbi5iKSByZXR1cm4gbnVsbDtcclxuXHRcdGlmIChwb3MuYiA+PSBpbnN0LnBvc2l0aW9uLmIgKyBpbnN0LmhlaWdodCkgcmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChob3IpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMucmlnaHQ7XHJcblx0cmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy51cDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLndhbGxIYXNOb3JtYWwgPSBmdW5jdGlvbih4LCB5LCBub3JtYWwpe1xyXG5cdHZhciB0MSA9IHRoaXMubWFwW3ldW3hdO1xyXG5cdHN3aXRjaCAobm9ybWFsKXtcclxuXHRcdGNhc2UgJ3UnOiB5IC09IDE7IGJyZWFrO1xyXG5cdFx0Y2FzZSAnbCc6IHggLT0gMTsgYnJlYWs7XHJcblx0XHRjYXNlICdkJzogeSArPSAxOyBicmVhaztcclxuXHRcdGNhc2UgJ3InOiB4ICs9IDE7IGJyZWFrO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XHJcblx0aWYgKHRoaXMubWFwW3ldW3hdID09PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHR2YXIgdDIgPSB0aGlzLm1hcFt5XVt4XTtcclxuXHRcclxuXHRpZiAoIXQyLncpIHJldHVybiB0cnVlO1xyXG5cdGlmICh0Mi53ICYmICEodDIueSA9PSB0MS55ICYmIHQyLmggPT0gdDEuaCkpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldERvb3JOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgaCwgaW5XYXRlcil7XHJcblx0dmFyIHh4ID0gKChwb3MuYSArIHNwZC5hKSA8PCAwKTtcclxuXHR2YXIgenogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGRvb3IgPSB0aGlzLmdldERvb3JBdCh4eCwgeSwgenopO1xyXG5cdGlmIChkb29yKXtcclxuXHRcdHZhciB4eHggPSAocG9zLmEgKyBzcGQuYSkgLSB4eDtcclxuXHRcdHZhciB6enogPSAocG9zLmMgKyBzcGQuYikgLSB6ejtcclxuXHRcdFxyXG5cdFx0dmFyIHggPSAocG9zLmEgLSB4eCk7XHJcblx0XHR2YXIgeiA9IChwb3MuYyAtIHp6KTtcclxuXHRcdGlmIChkb29yLmRpciA9PSBcIlZcIil7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdGlmICh6enogPiAwLjI1ICYmIHp6eiA8IDAuNzUpIHJldHVybiBudWxsO1xyXG5cdFx0XHRpZiAoeCA8IDAgfHwgeCA+IDEpIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdFx0ZWxzZSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmIChkb29yICYmIGRvb3IuaXNTb2xpZCgpKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRpZiAoeHh4ID4gMC4yNSAmJiB4eHggPCAwLjc1KSByZXR1cm4gbnVsbDtcclxuXHRcdFx0aWYgKHogPCAwIHx8IHogPiAxKSByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwO1xyXG5cdFx0XHRlbHNlIHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMubGVmdDtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5pc1NvbGlkID0gZnVuY3Rpb24oeCwgeiwgeSl7XHJcblx0aWYgKCF0aGlzLm1hcFt6XSkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0aGlzLm1hcFt6XVt4XSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHRoaXMubWFwW3pdW3hdID09PSAwKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0dCA9IHRoaXMubWFwW3pdW3hdO1xyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gZmFsc2U7XHJcblx0XHJcblx0aWYgKHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRpZiAodC55ICsgdC5oIDw9IHkpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5jaGVja0JveENvbGxpc2lvbiA9IGZ1bmN0aW9uKGJveDEsIGJveDIpe1xyXG5cdGlmIChib3gxLngyIDwgYm94Mi54MSB8fCBib3gxLngxID4gYm94Mi54MiB8fCBib3gxLnoyIDwgYm94Mi56MSB8fCBib3gxLnoxID4gYm94Mi56Mil7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0QkJveFdhbGxOb3JtYWwgPSBmdW5jdGlvbihwb3MsIHNwZCwgYldpZHRoKXtcclxuXHR2YXIgeCA9ICgocG9zLmEgKyBzcGQuYSkgPDwgMCk7XHJcblx0dmFyIHogPSAoKHBvcy5jICsgc3BkLmIpIDw8IDApO1xyXG5cdHZhciB5ID0gcG9zLmI7XHJcblx0XHJcblx0dmFyIGJCb3ggPSB7XHJcblx0XHR4MTogcG9zLmEgKyBzcGQuYSAtIGJXaWR0aCxcclxuXHRcdHoxOiBwb3MuYyArIHNwZC5iIC0gYldpZHRoLFxyXG5cdFx0eDI6IHBvcy5hICsgc3BkLmEgKyBiV2lkdGgsXHJcblx0XHR6MjogcG9zLmMgKyBzcGQuYiArIGJXaWR0aFxyXG5cdH07XHJcblx0XHJcblx0dmFyIHhtID0geCAtIDE7XHJcblx0dmFyIHptID0geiAtIDE7XHJcblx0dmFyIHhNID0geG0gKyAzO1xyXG5cdHZhciB6TSA9IHptICsgMztcclxuXHRcclxuXHR2YXIgdDtcclxuXHRmb3IgKHZhciB6ej16bTt6ejx6TTt6eisrKXtcclxuXHRcdGZvciAodmFyIHh4PXhtO3h4PHhNO3h4Kyspe1xyXG5cdFx0XHRpZiAoIXRoaXMubWFwW3p6XSkgY29udGludWU7XHJcblx0XHRcdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHRpZiAodGhpcy5tYXBbenpdW3h4XSA9PT0gMCkgY29udGludWU7XHJcblx0XHRcdFxyXG5cdFx0XHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRcdFx0XHJcblx0XHRcdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSBjb250aW51ZTtcclxuXHRcdFx0aWYgKHQueSt0LmggPD0geSkgY29udGludWU7XHJcblx0XHRcdGVsc2UgaWYgKHQueSA+IHkgKyAwLjUpIGNvbnRpbnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGJveCA9IHtcclxuXHRcdFx0XHR4MTogeHgsXHJcblx0XHRcdFx0ejE6IHp6LFxyXG5cdFx0XHRcdHgyOiB4eCArIDEsXHJcblx0XHRcdFx0ejI6IHp6ICsgMVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHRoaXMuY2hlY2tCb3hDb2xsaXNpb24oYkJveCwgYm94KSl7XHJcblx0XHRcdFx0dmFyIHh4eCA9IHBvcy5hIC0geHg7XHJcblx0XHRcdFx0dmFyIHp6eiA9IHBvcy5jIC0geno7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG5WID0gdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ3UnKSB8fCB0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpO1xyXG5cdFx0XHRcdHZhciBuSCA9IHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICdyJykgfHwgdGhpcy53YWxsSGFzTm9ybWFsKHh4LCB6eiwgJ2wnKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoenp6ID49IC1iV2lkdGggJiYgenp6IDwgMSArIGJXaWR0aCAmJiBuSCl7XHJcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLmxlZnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh4eHggPj0gLWJXaWR0aCAmJiB4eHggPCAxICsgYldpZHRoICYmIG5WKXtcclxuXHRcdFx0XHRcdHJldHVybiBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0V2FsbE5vcm1hbCA9IGZ1bmN0aW9uKHBvcywgc3BkLCBoLCBpbldhdGVyKXtcclxuXHR2YXIgdCwgdGg7XHJcblx0dmFyIHkgPSBwb3MuYjtcclxuXHRcclxuXHR2YXIgeHggPSAoKHBvcy5hICsgc3BkLmEpIDw8IDApO1xyXG5cdHZhciB6eiA9ICgocG9zLmMgKyBzcGQuYikgPDwgMCk7XHJcblx0XHJcblx0aWYgKCF0aGlzLm1hcFt6el0pIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0aGlzLm1hcFt6el1beHhdID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHR0ID0gdGhpcy5tYXBbenpdW3h4XTtcclxuXHRpID0gNDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdFxyXG5cdHRoID0gdC5oIC0gMC4zO1xyXG5cdGlmIChpbldhdGVyKSB5ICs9IDAuMztcclxuXHRpZiAodC5zbCkgdGggKz0gMC4yO1xyXG5cdFxyXG5cdGlmICghdC53ICYmICF0LmR3ICYmICF0LndkKSByZXR1cm4gbnVsbDtcclxuXHRpZiAodC55K3RoIDw9IHkpIHJldHVybiBudWxsO1xyXG5cdGVsc2UgaWYgKHQueSA+IHkgKyBoKSByZXR1cm4gbnVsbDtcclxuXHRcclxuXHRpZiAoIXQpIHJldHVybiBudWxsO1xyXG5cdGlmICh0Lncpe1xyXG5cdFx0dmFyIHRleCA9IHRoaXMuZ2FtZS5nZXRUZXh0dXJlQnlJZCh0LncsIFwid2FsbFwiKTtcclxuXHRcdGlmICh0ZXguaXNTb2xpZCl7XHJcblx0XHRcdHZhciB4eHggPSBwb3MuYSAtIHh4O1xyXG5cdFx0XHR2YXIgenp6ID0gcG9zLmMgLSB6ejtcclxuXHRcdFx0aWYgKHRoaXMud2FsbEhhc05vcm1hbCh4eCwgenosICd1JykgJiYgenp6IDw9IDApeyByZXR1cm4gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnZCcpICYmIHp6eiA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duOyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAnbCcpICYmIHh4eCA8PSAwKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5sZWZ0OyB9XHJcblx0XHRcdGlmICh0aGlzLndhbGxIYXNOb3JtYWwoeHgsIHp6LCAncicpICYmIHh4eCA+PSAxKXsgcmV0dXJuIE9iamVjdEZhY3Rvcnkubm9ybWFscy5yaWdodDsgfVxyXG5cdFx0fVxyXG5cdH1lbHNlIGlmICh0LmR3KXtcclxuXHRcdHZhciB4LCB6LCB4eHgsIHp6eiwgbm9ybWFsO1xyXG5cdFx0eCA9IHBvcy5hICsgc3BkLmE7XHJcblx0XHR6ID0gcG9zLmMgKyBzcGQuYjtcclxuXHRcdFxyXG5cdFx0aWYgKHQuYXcgPT0gMCl7IHh4eCA9ICh4eCArIDEpIC0geDsgenp6ID0gIHogLSB6ejsgbm9ybWFsID0gT2JqZWN0RmFjdG9yeS5ub3JtYWxzLnVwTGVmdDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAxKXsgeHh4ID0geCAtIHh4OyB6enogPSAgeiAtIHp6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMudXBSaWdodDsgfVxyXG5cdFx0ZWxzZSBpZiAodC5hdyA9PSAyKXsgeHh4ID0geCAtIHh4OyB6enogPSAgKHp6ICsgMSkgLSB6OyBub3JtYWwgPSBPYmplY3RGYWN0b3J5Lm5vcm1hbHMuZG93blJpZ2h0OyB9XHJcblx0XHRlbHNlIGlmICh0LmF3ID09IDMpeyB4eHggPSAoeHggKyAxKSAtIHg7IHp6eiA9ICAoenogKyAxKSAtIHo7IG5vcm1hbCA9IE9iamVjdEZhY3Rvcnkubm9ybWFscy5kb3duTGVmdDsgfVxyXG5cdFx0aWYgKHp6eiA+PSB4eHgpe1xyXG5cdFx0XHRyZXR1cm4gbm9ybWFsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFlGbG9vciA9IGZ1bmN0aW9uKHgsIHksIG5vV2F0ZXIpe1xyXG5cdHZhciBpbnMgPSB0aGlzLmdldEluc3RhbmNlQXRHcmlkKHZlYzMoeDw8MCwwLHk8PDApKTtcclxuXHRpZiAoaW5zICE9IG51bGwgJiYgaW5zLmhlaWdodCl7XHJcblx0XHRyZXR1cm4gaW5zLnBvc2l0aW9uLmIgKyBpbnMuaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR2YXIgeHggPSB4IC0gKHggPDwgMCk7XHJcblx0dmFyIHl5ID0geSAtICh5IDw8IDApO1xyXG5cdHggPSB4IDw8IDA7XHJcblx0eSA9IHkgPDwgMDtcclxuXHRpZiAoIXRoaXMubWFwW3ldKSByZXR1cm4gMDtcclxuXHRpZiAodGhpcy5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcblx0ZWxzZSBpZiAodGhpcy5tYXBbeV1beF0gPT09IDApIHJldHVybiAwO1xyXG5cdFxyXG5cdHZhciB0ID0gdGhpcy5tYXBbeV1beF07XHJcblx0dmFyIHR0ID0gdC55O1xyXG5cdFxyXG5cdGlmICh0LncpIHR0ICs9IHQuaDtcclxuXHRpZiAodC5mKSB0dCA9IHQuZnk7XHJcblx0XHJcblx0aWYgKCFub1dhdGVyICYmIHRoaXMuaXNXYXRlclRpbGUodC5mKSkgdHQgLT0gMC4zO1xyXG5cdFxyXG5cdGlmICh0LnNsKXtcclxuXHRcdGlmICh0LmRpciA9PSAwKSB0dCArPSB5eSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDEpIHR0ICs9IHh4ICogMC41OyBlbHNlXHJcblx0XHRpZiAodC5kaXIgPT0gMikgdHQgKz0gKDEuMCAtIHl5KSAqIDAuNTsgZWxzZVxyXG5cdFx0aWYgKHQuZGlyID09IDMpIHR0ICs9ICgxLjAgLSB4eCkgKiAwLjU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB0dDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmRyYXdNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciB4LCB5O1xyXG5cdHggPSB0aGlzLnBsYXllci5wb3NpdGlvbi5hO1xyXG5cdHkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi5jO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5tYXBUb0RyYXcubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgbXRkID0gdGhpcy5tYXBUb0RyYXdbaV07XHJcblx0XHRcclxuXHRcdGlmICh4IDwgbXRkLmJvdW5kYXJpZXNbMF0gfHwgeCA+IG10ZC5ib3VuZGFyaWVzWzJdIHx8IHkgPCBtdGQuYm91bmRhcmllc1sxXSB8fCB5ID4gbXRkLmJvdW5kYXJpZXNbM10pXHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHJcblx0XHRpZiAobXRkLnR5cGUgPT0gXCJCXCIpeyAvLyBCbG9ja3NcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdCbG9jayhtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiRlwiKXsgLy8gRmxvb3JzXHJcblx0XHRcdHZhciB0dCA9IG10ZC50ZXhJbmQ7XHJcblx0XHRcdGlmICh0aGlzLmlzV2F0ZXJUaWxlKHR0KSl7IFxyXG5cdFx0XHRcdHR0ID0gKG10ZC5yVGV4SW5kKSArICh0aGlzLndhdGVyRnJhbWUgPDwgMCk7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnd2F0ZXInKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnZmxvb3InKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiQ1wiKXsgLy8gQ2VpbHNcclxuXHRcdFx0dmFyIHR0ID0gbXRkLnRleEluZDtcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdGbG9vcihtdGQsIHR0LCAnY2VpbCcpO1xyXG5cdFx0fWVsc2UgaWYgKG10ZC50eXBlID09IFwiU1wiKXsgLy8gU2xvcGVcclxuXHRcdFx0dGhpcy5nYW1lLmRyYXdTbG9wZShtdGQsIG10ZC50ZXhJbmQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmdldFBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSl7XHJcblx0dmFyIGludiA9IHRoaXMuZ2FtZS5pbnZlbnRvcnkuaXRlbXM7XHJcblx0Zm9yICh2YXIgaT0wLGxlbj1pbnYubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRpZiAoaW52W2ldLmNvZGUgPT0gaXRlbUNvZGUpe1xyXG5cdFx0XHRyZXR1cm4gaW52W2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVBsYXllckl0ZW0gPSBmdW5jdGlvbihpdGVtQ29kZSwgYW1vdW50KXtcclxuXHR2YXIgaW52ID0gdGhpcy5nYW1lLmludmVudG9yeS5pdGVtcztcclxuXHRmb3IgKHZhciBpPTAsbGVuPWludi5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdHZhciBpdCA9IGludltpXTtcclxuXHRcdGlmIChpdC5jb2RlID09IGl0ZW1Db2RlKXtcclxuXHRcdFx0aWYgKC0taXQuYW1vdW50ID09IDApe1xyXG5cdFx0XHRcdGludi5zcGxpY2UoaSwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmFkZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHR0aGlzLmdhbWUuY29uc29sZS5hZGRTRk1lc3NhZ2UodGV4dCk7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5nYW1lLnRpbWVTdG9wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy53YXRlckZyYW1lICs9IDAuMTtcclxuXHRpZiAodGhpcy53YXRlckZyYW1lID49IDIpIHRoaXMud2F0ZXJGcmFtZSA9IDA7XHJcbn07XHJcblxyXG5NYXBNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbnN0YW5jZXNUb0RyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMub3JkZXJJbnN0YW5jZXMgPSBbXTtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW5zdGFuY2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuaW5zdGFuY2VzW2ldO1xyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdGktLTtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB4eCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYSk7XHJcblx0XHR2YXIgenogPSBNYXRoLmFicyhpbnMucG9zaXRpb24uYyAtIHRoaXMucGxheWVyLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHJcblx0XHRpZiAoeHggPiA2IHx8IHp6ID4gNikgY29udGludWU7XHJcblx0XHRcclxuXHRcdHZhciBkaXN0ID0geHggKiB4eCArIHp6ICogeno7XHJcblx0XHR2YXIgYWRkZWQgPSBmYWxzZTtcclxuXHRcdGZvciAodmFyIGo9MCxqbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRpZiAoZGlzdCA+IHRoaXMub3JkZXJJbnN0YW5jZXNbal0uZGlzdCl7XHJcblx0XHRcdFx0dGhpcy5vcmRlckluc3RhbmNlcy5zcGxpY2UoaiwwLHtfYzogY2lyY3VsYXIucmVnaXN0ZXIoJ09yZGVySW5zdGFuY2UnKSwgaW5zOiBpbnMsIGRpc3Q6IGRpc3R9KTtcclxuXHRcdFx0XHRhZGRlZCA9IHRydWU7XHJcblx0XHRcdFx0aiA9IGpsZW47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCFhZGRlZCl7XHJcblx0XHRcdHRoaXMub3JkZXJJbnN0YW5jZXMucHVzaCh7X2M6IGNpcmN1bGFyLnJlZ2lzdGVyKCdPcmRlckluc3RhbmNlJyksIGluczogaW5zLCBkaXN0OiBkaXN0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuTWFwTWFuYWdlci5wcm90b3R5cGUuZ2V0SW5zdGFuY2VzQXQgPSBmdW5jdGlvbih4LCB6KXtcclxuXHR2YXIgcmV0ID0gW107XHJcblx0Zm9yICh2YXIgaT0wLGxlbj10aGlzLmRvb3JzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0dmFyIGlucyA9IHRoaXMuZG9vcnNbaV07XHJcblx0XHRcclxuXHRcdGlmICghaW5zKSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aWYgKE1hdGgucm91bmQoaW5zLnBvc2l0aW9uLmEpID09IHggJiYgTWF0aC5yb3VuZChpbnMucG9zaXRpb24uYykgPT0geilcclxuXHRcdFx0cmV0LnB1c2goaW5zKTtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIHJldDtcclxufTtcclxuXHJcbk1hcE1hbmFnZXIucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1hcCA9PSBudWxsKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dGhpcy5kcmF3TWFwKCk7XHJcblx0XHJcblx0dGhpcy5nZXRJbnN0YW5jZXNUb0RyYXcoKTtcclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMub3JkZXJJbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5vcmRlckluc3RhbmNlc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0aW5zID0gaW5zLmlucztcclxuXHRcdFxyXG5cdFx0aWYgKGlucy5kZXN0cm95ZWQpe1xyXG5cdFx0XHR0aGlzLm9yZGVySW5zdGFuY2VzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpbnMubG9vcCgpO1xyXG5cdH1cclxuXHRcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuZG9vcnMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaW5zID0gdGhpcy5kb29yc1tpXTtcclxuXHRcdFxyXG5cdFx0aWYgKCFpbnMpIGNvbnRpbnVlO1xyXG5cdFx0dmFyIHh4ID0gTWF0aC5hYnMoaW5zLnBvc2l0aW9uLmEgLSB0aGlzLnBsYXllci5wb3NpdGlvbi5hKTtcclxuXHRcdHZhciB6eiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0gdGhpcy5wbGF5ZXIucG9zaXRpb24uYyk7XHJcblx0XHRcclxuXHRcdGlmICh4eCA+IDYgfHwgenogPiA2KSBjb250aW51ZTtcclxuXHRcdFxyXG5cdFx0aW5zLmxvb3AoKTtcclxuXHRcdHRoaXMuZ2FtZS5kcmF3RG9vcihpbnMucG9zaXRpb24uYSwgaW5zLnBvc2l0aW9uLmIsIGlucy5wb3NpdGlvbi5jLCBpbnMucm90YXRpb24sIGlucy50ZXh0dXJlQ29kZSk7XHJcblx0XHR0aGlzLmdhbWUuZHJhd0Rvb3JXYWxsKGlucy5kb29yUG9zaXRpb24uYSwgaW5zLmRvb3JQb3NpdGlvbi5iLCBpbnMuZG9vclBvc2l0aW9uLmMsIGlucy53YWxsVGV4dHVyZSwgKGlucy5kaXIgPT0gXCJWXCIpKTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5wbGF5ZXIubG9vcCgpO1xyXG5cdGlmICh0aGlzLnBvaXNvbkNvdW50ID4gMCl7XHJcblx0XHR0aGlzLnBvaXNvbkNvdW50IC09IDE7XHJcblx0fWVsc2UgaWYgKHRoaXMuZ2FtZS5wbGF5ZXIucG9pc29uZWQgJiYgdGhpcy5wb2lzb25Db3VudCA9PSAwKXtcclxuXHRcdHRoaXMucGxheWVyLnJlY2VpdmVEYW1hZ2UoMTApO1xyXG5cdFx0dGhpcy5wb2lzb25Db3VudCA9IDEwMDtcclxuXHR9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1ha2VQZXJzcGVjdGl2ZTogZnVuY3Rpb24oZm92LCBhc3BlY3RSYXRpbywgek5lYXIsIHpGYXIpe1xyXG5cdFx0dmFyIHpMaW1pdCA9IHpOZWFyICogTWF0aC50YW4oZm92ICogTWF0aC5QSSAvIDM2MCk7XHJcblx0XHR2YXIgQSA9IC0oekZhciArIHpOZWFyKSAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEIgPSAtMiAqIHpGYXIgKiB6TmVhciAvICh6RmFyIC0gek5lYXIpO1xyXG5cdFx0dmFyIEMgPSAoMiAqIHpOZWFyKSAvICh6TGltaXQgKiBhc3BlY3RSYXRpbyAqIDIpO1xyXG5cdFx0dmFyIEQgPSAoMiAqIHpOZWFyKSAvICgyICogekxpbWl0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0QywgMCwgMCwgMCxcclxuXHRcdFx0MCwgRCwgMCwgMCxcclxuXHRcdFx0MCwgMCwgQSwtMSxcclxuXHRcdFx0MCwgMCwgQiwgMFxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdG5ld01hdHJpeDogZnVuY3Rpb24oY29scywgcm93cyl7XHJcblx0XHR2YXIgcmV0ID0gbmV3IEFycmF5KHJvd3MpO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8cm93cztpKyspe1xyXG5cdFx0XHRyZXRbaV0gPSBuZXcgQXJyYXkoY29scyk7XHJcblx0XHRcdGZvciAodmFyIGo9MDtqPGNvbHM7aisrKXtcclxuXHRcdFx0XHRyZXRbaV1bal0gPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHRcclxuXHRnZXRJZGVudGl0eTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdDEsIDAsIDAsIDAsXHJcblx0XHRcdDAsIDEsIDAsIDAsXHJcblx0XHRcdDAsIDAsIDEsIDAsXHJcblx0XHRcdDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRtYWtlVHJhbnNmb3JtOiBmdW5jdGlvbihvYmplY3QsIGNhbWVyYSl7XHJcblx0XHQvLyBTdGFydHMgd2l0aCB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0XHR2YXIgdE1hdCA9IHRoaXMuZ2V0SWRlbnRpdHkoKTtcclxuXHRcdFxyXG5cdFx0Ly8gUm90YXRlIHRoZSBvYmplY3RcclxuXHRcdC8vIFVudGlsIEkgZmluZCB0aGUgbmVlZCB0byByb3RhdGUgYW4gb2JqZWN0IGl0c2VsZiBpdCByZWFtaW5zIGFzIGNvbW1lbnRcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblgob2JqZWN0LnJvdGF0aW9uLmEpKTtcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKG9iamVjdC5yb3RhdGlvbi5iKSk7XHJcblx0XHQvL3RNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25aKG9iamVjdC5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIElmIHRoZSBvYmplY3QgaXMgYSBiaWxsYm9hcmQsIHRoZW4gbWFrZSBpdCBsb29rIHRvIHRoZSBjYW1lcmFcclxuXHRcdGlmIChvYmplY3QuaXNCaWxsYm9hcmQgJiYgIW9iamVjdC5ub1JvdGF0ZSkgdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblkoLShjYW1lcmEucm90YXRpb24uYiAtIE1hdGguUElfMikpKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZSB0aGUgb2JqZWN0IHRvIGl0cyBwb3NpdGlvblxyXG5cdFx0dE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRUcmFuc2xhdGlvbihvYmplY3QucG9zaXRpb24uYSwgb2JqZWN0LnBvc2l0aW9uLmIsIG9iamVjdC5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIG9iamVjdCBpbiByZWxhdGlvbiB0byB0aGUgY2FtZXJhXHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFRyYW5zbGF0aW9uKC1jYW1lcmEucG9zaXRpb24uYSwgLWNhbWVyYS5wb3NpdGlvbi5iIC0gY2FtZXJhLmNhbWVyYUhlaWdodCwgLWNhbWVyYS5wb3NpdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdC8vIFJvdGF0ZSB0aGUgb2JqZWN0IGluIHRoZSBjYW1lcmEgZGlyZWN0aW9uIChJIGRvbid0IHJlYWxseSByb3RhdGUgaW4gdGhlIFogYXhpcylcclxuXHRcdHRNYXQgPSB0aGlzLm1hdHJpeE11bHRpcGxpY2F0aW9uKHRNYXQsIHRoaXMuZ2V0Um90YXRpb25ZKGNhbWVyYS5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSk7XHJcblx0XHR0TWF0ID0gdGhpcy5tYXRyaXhNdWx0aXBsaWNhdGlvbih0TWF0LCB0aGlzLmdldFJvdGF0aW9uWCgtY2FtZXJhLnJvdGF0aW9uLmEpKTtcclxuXHRcdC8vdE1hdCA9IHRoaXMubWF0cml4TXVsdGlwbGljYXRpb24odE1hdCwgdGhpcy5nZXRSb3RhdGlvblooLWNhbWVyYS5yb3RhdGlvbi5jKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0TWF0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0VHJhbnNsYXRpb246IGZ1bmN0aW9uKHgsIHksIHope1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgMSwgMCwgMCxcclxuXHRcdFx0MCwgMCwgMSwgMCxcclxuXHRcdFx0eCwgeSwgeiwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWDogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0MSwgMCwgMCwgMCxcclxuXHRcdFx0MCwgQywgUywgMCxcclxuXHRcdFx0MCwtUywgQywgMCxcclxuXHRcdFx0MCwgMCwgMCwgMVxyXG5cdFx0XTtcclxuXHR9LFxyXG5cdFxyXG5cdGdldFJvdGF0aW9uWTogZnVuY3Rpb24oYW5nKXtcclxuXHRcdHZhciBDID0gTWF0aC5jb3MoYW5nKTtcclxuXHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0IEMsIDAsIFMsIDAsXHJcblx0XHRcdCAwLCAxLCAwLCAwLFxyXG5cdFx0XHQtUywgMCwgQywgMCxcclxuXHRcdFx0IDAsIDAsIDAsIDFcclxuXHRcdF07XHJcblx0fSxcclxuXHRcclxuXHRnZXRSb3RhdGlvblo6IGZ1bmN0aW9uKGFuZyl7XHJcblx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHR2YXIgUyA9IE1hdGguc2luKGFuZyk7XHJcblx0XHRcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdCBDLCBTLCAwLCAwLFxyXG5cdFx0XHQtUywgQywgMCwgMCxcclxuXHRcdFx0IDAsIDAsIDEsIDAsXHJcblx0XHRcdCAwLCAwLCAwLCAxXHJcblx0XHRdO1xyXG5cdH0sXHJcblx0XHJcblx0bWluaU1hdHJpeE11bHQ6IGZ1bmN0aW9uKHJvdywgY29sdW1uKXtcclxuXHRcdHZhciByZXN1bHQgPSAwO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1yb3cubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdHJlc3VsdCArPSByb3dbaV0gKiBjb2x1bW5baV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSxcclxuXHRcclxuXHRtYXRyaXhNdWx0aXBsaWNhdGlvbjogZnVuY3Rpb24obWF0cml4QSwgbWF0cml4Qil7XHJcblx0XHR2YXIgQTEgPSBbbWF0cml4QVswXSwgIG1hdHJpeEFbMV0sICBtYXRyaXhBWzJdLCAgbWF0cml4QVszXV07XHJcblx0XHR2YXIgQTIgPSBbbWF0cml4QVs0XSwgIG1hdHJpeEFbNV0sICBtYXRyaXhBWzZdLCAgbWF0cml4QVs3XV07XHJcblx0XHR2YXIgQTMgPSBbbWF0cml4QVs4XSwgIG1hdHJpeEFbOV0sICBtYXRyaXhBWzEwXSwgbWF0cml4QVsxMV1dO1xyXG5cdFx0dmFyIEE0ID0gW21hdHJpeEFbMTJdLCBtYXRyaXhBWzEzXSwgbWF0cml4QVsxNF0sIG1hdHJpeEFbMTVdXTtcclxuXHRcdFxyXG5cdFx0dmFyIEIxID0gW21hdHJpeEJbMF0sIG1hdHJpeEJbNF0sIG1hdHJpeEJbOF0sICBtYXRyaXhCWzEyXV07XHJcblx0XHR2YXIgQjIgPSBbbWF0cml4QlsxXSwgbWF0cml4Qls1XSwgbWF0cml4Qls5XSwgIG1hdHJpeEJbMTNdXTtcclxuXHRcdHZhciBCMyA9IFttYXRyaXhCWzJdLCBtYXRyaXhCWzZdLCBtYXRyaXhCWzEwXSwgbWF0cml4QlsxNF1dO1xyXG5cdFx0dmFyIEI0ID0gW21hdHJpeEJbM10sIG1hdHJpeEJbN10sIG1hdHJpeEJbMTFdLCBtYXRyaXhCWzE1XV07XHJcblx0XHRcclxuXHRcdHZhciBtbW0gPSB0aGlzLm1pbmlNYXRyaXhNdWx0O1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0bW1tKEExLCBCMSksIG1tbShBMSwgQjIpLCBtbW0oQTEsIEIzKSwgbW1tKEExLCBCNCksXHJcblx0XHRcdG1tbShBMiwgQjEpLCBtbW0oQTIsIEIyKSwgbW1tKEEyLCBCMyksIG1tbShBMiwgQjQpLFxyXG5cdFx0XHRtbW0oQTMsIEIxKSwgbW1tKEEzLCBCMiksIG1tbShBMywgQjMpLCBtbW0oQTMsIEI0KSxcclxuXHRcdFx0bW1tKEE0LCBCMSksIG1tbShBNCwgQjIpLCBtbW0oQTQsIEIzKSwgbW1tKEE0LCBCNClcclxuXHRcdF07XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBNaXNzaWxlKHBvc2l0aW9uLCByb3RhdGlvbiwgdHlwZSwgdGFyZ2V0LCBtYXBNYW5hZ2VyKXtcclxuXHR2YXIgZ2wgPSBtYXBNYW5hZ2VyLmdhbWUuR0wuY3R4O1xyXG5cdFxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2wpO1xyXG5cdHRoaXMudHlwZSA9IHR5cGU7XHJcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblx0dGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcclxuXHR0aGlzLnNvbGlkID0gZmFsc2U7XHJcblx0dGhpcy5zdHIgPSAwO1xyXG5cdHRoaXMuc3BlZWQgPSAwLjM7XHJcblx0dGhpcy5taXNzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnZzcGVlZCA9IDA7XHJcblx0dGhpcy5ncmF2aXR5ID0gMDtcclxuXHRcclxuXHR2YXIgc3ViSW1nID0gMDtcclxuXHRzd2l0Y2ggKHR5cGUpe1xyXG5cdFx0Y2FzZSAnc2xpbmcnOiBcclxuXHRcdFx0c3ViSW1nID0gMDtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRcdHRoaXMuZ3Jhdml0eSA9IDAuMDA1O1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdib3cnOiBcclxuXHRcdFx0c3ViSW1nID0gMTtcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuMjsgXHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Nyb3NzYm93JzogXHJcblx0XHRcdHN1YkltZyA9IDI7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC4zO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRjYXNlICdtYWdpY01pc3NpbGUnOiBcclxuXHRcdFx0c3ViSW1nID0gMzsgXHJcblx0XHRcdHRoaXMuc3BlZWQgPSAwLjQ7XHJcblx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2ljZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA0OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnZmlyZUJhbGwnOlxyXG5cdFx0XHRzdWJJbWcgPSA1OyBcclxuXHRcdFx0dGhpcy5zcGVlZCA9IDAuNDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAna2lsbCc6XHJcblx0XHRcdHN1YkltZyA9IDY7IFxyXG5cdFx0XHR0aGlzLnNwZWVkID0gMC41O1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMudGV4dHVyZUNvZGUgPSAnYm9sdHMnO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IG1hcE1hbmFnZXIuZ2FtZS5vYmplY3RUZXguYm9sdHMuYnVmZmVyc1tzdWJJbWddO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3NpbGU7XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5jaGVja0NvbGxpc2lvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIG1hcCA9IHRoaXMubWFwTWFuYWdlci5tYXA7XHJcblx0aWYgKHRoaXMucG9zaXRpb24uYSA8IDAgfHwgdGhpcy5wb3NpdGlvbi5jIDwgMCB8fCB0aGlzLnBvc2l0aW9uLmEgPj0gbWFwWzBdLmxlbmd0aCB8fCB0aGlzLnBvc2l0aW9uLmMgPj0gbWFwLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciB4ID0gdGhpcy5wb3NpdGlvbi5hIDw8IDA7XHJcblx0dmFyIHkgPSB0aGlzLnBvc2l0aW9uLmIgKyAwLjU7XHJcblx0dmFyIHogPSB0aGlzLnBvc2l0aW9uLmMgPDwgMDtcclxuXHR2YXIgdGlsZSA9IG1hcFt6XVt4XTtcclxuXHRcclxuXHRpZiAodGlsZS53IHx8IHRpbGUud2QgfHwgdGlsZS53ZCkgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh5IDwgdGlsZS5meSB8fCB5ID4gdGlsZS5jaCkgcmV0dXJuIGZhbHNlO1xyXG5cdFxyXG5cdHZhciBpbnMsIGRmcztcclxuXHRpZiAodGhpcy50YXJnZXQgPT0gJ2VuZW15Jyl7XHJcblx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXBNYW5hZ2VyLmdldEluc3RhbmNlc05lYXJlc3QodGhpcy5wb3NpdGlvbiwgMC41LCAnZW5lbXknKTtcclxuXHRcdHZhciBkaXN0ID0gMTAwMDA7XHJcblx0XHRpZiAoaW5zdGFuY2VzLmxlbmd0aCA+IDEpe1xyXG5cdFx0XHRmb3IgKHZhciBpPTAsbGVuPWluc3RhbmNlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHR2YXIgeHggPSBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLmEgLSBpbnN0YW5jZXNbaV0ucG9zaXRpb24uYSk7XHJcblx0XHRcdFx0dmFyIHl5ID0gTWF0aC5hYnModGhpcy5wb3NpdGlvbi5jIC0gaW5zdGFuY2VzW2ldLnBvc2l0aW9uLmMpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBkID0geHggKiB4eCArIHl5ICogeXk7XHJcblx0XHRcdFx0aWYgKGQgPCBkaXN0KXtcclxuXHRcdFx0XHRcdGRpc3QgPSBkO1xyXG5cdFx0XHRcdFx0aW5zID0gaW5zdGFuY2VzW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fWVsc2UgaWYgKGluc3RhbmNlcy5sZW5ndGggPT0gMSl7XHJcblx0XHRcdGlucyA9IGluc3RhbmNlc1swXTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZGZzID0gVXRpbHMucm9sbERpY2UoaW5zLmVuZW15LnN0YXRzLmRmcyk7XHJcblx0fWVsc2V7XHJcblx0XHRpbnMgPSB0aGlzLm1hcE1hbmFnZXIucGxheWVyO1xyXG5cdFx0ZGZzID0gVXRpbHMucm9sbERpY2UodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGxheWVyLnN0YXRzLmRmcyk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBkbWcgPSBNYXRoLm1heCh0aGlzLnN0ciAtIGRmcywgMCk7XHJcblx0XHJcblx0aWYgKHRoaXMubWlzc2VkKXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiTWlzc2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZG1nICE9IDApe1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoZG1nICsgXCIgcG9pbnRzIGluZmxpY3RlZFwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHRpbnMucmVjZWl2ZURhbWFnZShkbWcpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJCbG9ja2VkIVwiKTtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLnBsYXlTb3VuZCgnbWlzcycpO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLnZzcGVlZCArPSB0aGlzLmdyYXZpdHk7XHJcblx0XHJcblx0dmFyIHhUbyA9IE1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLnNwZWVkO1xyXG5cdHZhciB5VG8gPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmEpICogdGhpcy5zcGVlZCAtIHRoaXMudnNwZWVkO1xyXG5cdHZhciB6VG8gPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMuc3BlZWQ7XHJcblx0XHJcblx0dGhpcy5wb3NpdGlvbi5zdW0odmVjMyh4VG8sIHlUbywgelRvKSk7XHJcblx0XHJcblx0aWYgKCF0aGlzLmNoZWNrQ29sbGlzaW9uKCkpe1xyXG5cdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxufTtcclxuXHJcbk1pc3NpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuO1xyXG5cdFxyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sdGhpcy50ZXh0dXJlQ29kZSx0aGlzLmJpbGxib2FyZCk7XHJcbn07XHJcblxyXG5NaXNzaWxlLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnN0ZXAoKTtcclxuXHR0aGlzLmRyYXcoKTtcclxufTsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRub3JtYWxzOiB7XHJcblx0XHRkb3duOiAgdmVjMiggMCwgMSksXHJcblx0XHRyaWdodDogdmVjMiggMSwgMCksXHJcblx0XHR1cDogICAgdmVjMiggMCwtMSksXHJcblx0XHRsZWZ0OiAgdmVjMigtMSwgMCksXHJcblx0XHRcclxuXHRcdHVwUmlnaHQ6ICB2ZWMyKE1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgLU1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHR1cExlZnQ6ICB2ZWMyKC1NYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIC1NYXRoLnNpbihNYXRoLmRlZ1RvUmFkKDQ1KSkpLFxyXG5cdFx0ZG93blJpZ2h0OiAgdmVjMihNYXRoLmNvcyhNYXRoLmRlZ1RvUmFkKDQ1KSksIE1hdGguc2luKE1hdGguZGVnVG9SYWQoNDUpKSksXHJcblx0XHRkb3duTGVmdDogIHZlYzIoLU1hdGguY29zKE1hdGguZGVnVG9SYWQoNDUpKSwgTWF0aC5zaW4oTWF0aC5kZWdUb1JhZCg0NSkpKVxyXG5cdH0sXHJcblx0XHJcblx0Y3ViZTogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCwgbGlnaHQsIC8qW3UsbCxkLHJdKi8gZmFjZXMpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzLCBkYXJrVmVydGV4O1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtdO1xyXG5cdFx0ZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0aWYgKCFmYWNlcykgZmFjZXMgPSBbMSwxLDEsMV07XHJcblx0XHRpZiAoZmFjZXNbMF0peyAvLyBVcCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgLWwsXHJcblx0XHRcdCBcdCB3LCAgMCwgLWwsXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGFya1ZlcnRleC5wdXNoKDEsMSwxLDEpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZhY2VzWzFdKXsgLy8gTGVmdCBGYWNlXHJcblx0XHRcdHZlcnRleC5wdXNoKFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCxcclxuXHRcdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHRcdCB3LCAgMCwgLWwpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkYXJrVmVydGV4LnB1c2goMCwwLDAsMCk7XHJcblx0XHR9XHJcblx0XHRpZiAoZmFjZXNbMl0peyAvLyBEb3duIEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAgbCxcclxuXHRcdFx0XHQtdywgIDAsICBsLFxyXG5cdFx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdFx0IHcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgxLDEsMSwxKTtcclxuXHRcdH1cclxuXHRcdGlmIChmYWNlc1szXSl7IC8vIFJpZ2h0IEZhY2VcclxuXHRcdFx0dmVydGV4LnB1c2goXHJcblx0XHRcdFx0LXcsICBoLCAtbCxcclxuXHRcdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdFx0LXcsICAwLCAgbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwLDAsMCwwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzID0gW107XHJcblx0XHRmb3IgKHZhciBpPTAsbGVuPXZlcnRleC5sZW5ndGgvMztpPGxlbjtpKz00KXtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKGksIGkrMSwgaSsyLCBpKzIsIGkrMSwgaSszKTtcclxuXHRcdFxyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdFx0MC4wLCB0eSxcclxuXHRcdFx0XHQwLjAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRleCwgaW5kaWNlczogaW5kaWNlcywgdGV4Q29vcmRzOiB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdH0sXHJcblx0XHJcblx0Zmxvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGNlaWw6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wpe1xyXG5cdFx0dmFyIHZlcnRleCwgaW5kaWNlcywgdGV4Q29vcmRzO1xyXG5cdFx0dmFyIHcgPSBzaXplLmEgLyAyO1xyXG5cdFx0dmFyIGggPSBzaXplLmIgLyAyO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgLyAyO1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdCB3LCAwLjAsICBsLFxyXG5cdFx0XHQgdywgMC4wLCAtbCxcclxuXHRcdFx0LXcsIDAuMCwgIGwsXHJcblx0XHRcdC13LCAwLjAsIC1sLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDIsIDEsIDEsIDIsIDMpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIHR5LFxyXG5cdFx0XHQgdHgsMC4wLFxyXG5cdFx0XHQwLjAsIHR5LFxyXG5cdFx0XHQwLjAsMC4wXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3JXYWxsOiBmdW5jdGlvbihzaXplLCB0ZXhSZXBlYXQsIGdsKXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hIC8gMjtcclxuXHRcdHZhciBoID0gc2l6ZS5iO1xyXG5cdFx0dmFyIGwgPSBzaXplLmMgKiAwLjA1O1xyXG5cdFx0XHJcblx0XHR2YXIgdzIgPSAtc2l6ZS5hICogMC4yNTtcclxuXHRcdHZhciB3MyA9IHNpemUuYSAqIDAuMjU7XHJcblx0XHRcclxuXHRcdHZhciBoMiA9IDEgLSBzaXplLmIgKiAwLjI1O1xyXG5cdFx0XHJcblx0XHR2YXIgdHggPSB0ZXhSZXBlYXQuYTtcclxuXHRcdHZhciB0eSA9IHRleFJlcGVhdC5iO1xyXG5cdFx0XHJcblx0XHR2ZXJ0ZXggPSBbXHJcblx0XHRcdC8vIFJpZ2h0IHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHQtdywgIGgsIC1sLFxyXG5cdFx0XHQtdywgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdC13LCAgaCwgIGwsXHJcblx0XHRcdC13LCAgMCwgIGwsXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHR3MiwgIGgsICBsLFxyXG5cdFx0XHR3MiwgIDAsICBsLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTGVmdCBwYXJ0IG9mIHRoZSBkb29yXHJcblx0XHRcdC8vIEZyb250IEZhY2VcclxuXHRcdFx0IHcsICBoLCAtbCxcclxuXHRcdFx0IHcsICAwLCAtbCxcclxuXHRcdFx0dzMsICBoLCAtbCxcclxuXHRcdFx0dzMsICAwLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdC8vIEJhY2sgRmFjZVxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgIDAsIC1sLFxyXG5cdFx0XHR3MywgIGgsICBsLFxyXG5cdFx0XHR3MywgIDAsICBsLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTWlkZGxlIHBhcnQgb2YgdGhlIGRvb3JcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHR3MywgIGgsIC1sLFxyXG5cdFx0XHR3MywgaDIsIC1sLFxyXG5cdFx0XHR3MiwgIGgsIC1sLFxyXG5cdFx0XHR3MiwgaDIsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdHcyLCAgaCwgIGwsXHJcblx0XHRcdHcyLCBoMiwgIGwsXHJcblx0XHRcdHczLCAgaCwgIGwsXHJcblx0XHRcdHczLCBoMiwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gQm90dG9tIEZhY2VcclxuXHRcdFx0dzMsIGgyLCAtbCxcclxuXHRcdFx0dzMsIGgyLCAgbCxcclxuXHRcdFx0dzIsIGgyLCAtbCxcclxuXHRcdFx0dzIsIGgyLCAgbCxcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdGluZGljZXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49dmVydGV4Lmxlbmd0aC8zO2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDY7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC4yNSwgdHksXHJcblx0XHRcdFx0MC4yNSwwLjAsXHJcblx0XHRcdFx0MC4wMCwgdHksXHJcblx0XHRcdFx0MC4wMCwwLjBcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKXtcclxuXHRcdFx0dGV4Q29vcmRzLnB1c2goXHJcblx0XHRcdFx0MC41LDEuMCxcclxuXHRcdFx0XHQwLjUsMC43NSxcclxuXHRcdFx0XHQwLjAsMS4wLFxyXG5cdFx0XHRcdDAuMCwwLjc1XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDM2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLmdldE9iamVjdFdpdGhQcm9wZXJ0aWVzKHZlcnRleEJ1ZmZlciwgaW5kaWNlc0J1ZmZlciwgdGV4QnVmZmVyLCBkYXJrQnVmZmVyKTtcclxuXHR9LFxyXG5cdFxyXG5cdGRvb3I6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGxpZ2h0KXtcclxuXHRcdHZhciB2ZXJ0ZXgsIGluZGljZXMsIHRleENvb3JkcywgZGFya1ZlcnRleDtcclxuXHRcdHZhciB3ID0gc2l6ZS5hO1xyXG5cdFx0dmFyIGggPSBzaXplLmI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0Ly8gRnJvbnQgRmFjZVxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gQmFjayBGYWNlXHJcblx0XHRcdCAwLCAgaCwgIGwsXHJcblx0XHRcdCAwLCAgMCwgIGwsXHJcblx0XHRcdCB3LCAgaCwgIGwsXHJcblx0XHRcdCB3LCAgMCwgIGwsXHJcblx0XHRcdCBcclxuXHRcdFx0Ly8gUmlnaHQgRmFjZVxyXG5cdFx0XHQgdywgIGgsICBsLFxyXG5cdFx0XHQgdywgIDAsICBsLFxyXG5cdFx0XHQgdywgIGgsIC1sLFxyXG5cdFx0XHQgdywgIDAsIC1sLFxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIExlZnQgRmFjZVxyXG5cdFx0XHQgMCwgIGgsIC1sLFxyXG5cdFx0XHQgMCwgIDAsIC1sLFxyXG5cdFx0XHQgMCwgIGgsICBsLFxyXG5cdFx0XHQgMCwgIDAsICBsLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj12ZXJ0ZXgubGVuZ3RoLzM7aTxsZW47aSs9NCl7XHJcblx0XHRcdGluZGljZXMucHVzaChpLCBpKzEsIGkrMiwgaSsyLCBpKzEsIGkrMyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2godHgsIHR5LCB0eCwwLjAsIDAuMCwgdHksIDAuMCwwLjApO1xyXG5cdFx0dGV4Q29vcmRzLnB1c2goMC4wLCB0eSwgMC4wLDAuMCwgdHgsIHR5LCB0eCwwLjApO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0XHR0ZXhDb29yZHMucHVzaChcclxuXHRcdFx0XHQwLjAxLDAuMDEsXHJcblx0XHRcdFx0MC4wMSwwLjAsXHJcblx0XHRcdFx0MC4wICwwLjAxLFxyXG5cdFx0XHRcdDAuMCAsMC4wXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGRhcmtWZXJ0ZXggPSBbXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPDE2O2krKyl7XHJcblx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlc1xyXG5cdFx0dmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0ZXgubGVuZ3RoO1xyXG5cdFx0dmVydGV4QnVmZmVyLml0ZW1TaXplID0gMztcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgYnVmZmVyIGRhdGEgZm9yIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcblx0XHR2YXIgdGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IHRleENvb3Jkcy5sZW5ndGg7XHJcblx0XHR0ZXhCdWZmZXIuaXRlbVNpemUgPSAyO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIGluZGljZXNcclxuXHRcdHZhciBpbmRpY2VzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5udW1JdGVtcyA9IGluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShkYXJrVmVydGV4KSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0ZGFya0J1ZmZlci5udW1JdGVtcyA9IGRhcmtCdWZmZXIubGVuZ3RoO1xyXG5cdFx0ZGFya0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRyZXR1cm4gZG9vcjtcclxuXHR9LFxyXG5cdFxyXG5cdGJpbGxib2FyZDogZnVuY3Rpb24oc2l6ZSwgdGV4UmVwZWF0LCBnbCl7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHMsIGRhcmtWZXJ0ZXg7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYjtcclxuXHRcdHZhciBsID0gc2l6ZS5jIC8gMjtcclxuXHRcdFxyXG5cdFx0dmFyIHR4ID0gdGV4UmVwZWF0LmE7XHJcblx0XHR2YXIgdHkgPSB0ZXhSZXBlYXQuYjtcclxuXHRcdFxyXG5cdFx0dmVydGV4ID0gW1xyXG5cdFx0XHQgdywgIGgsICAwLFxyXG5cdFx0XHQtdywgIGgsICAwLFxyXG5cdFx0XHQgdywgIDAsICAwLFxyXG5cdFx0XHQtdywgIDAsICAwLFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj00O2k8bGVuO2krPTQpe1xyXG5cdFx0XHRpbmRpY2VzLnB1c2goaSwgaSsxLCBpKzIsIGkrMiwgaSsxLCBpKzMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXHJcblx0XHRcdCB0eCwgdHksXHJcblx0XHRcdDAuMCwgdHksXHJcblx0XHRcdCB0eCwwLjAsXHJcblx0XHRcdDAuMCwwLjBcclxuXHRcdF07XHJcblx0XHRcdFx0IFxyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleCksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHZlcnRleEJ1ZmZlci5udW1JdGVtcyA9IHZlcnRleC5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya0J1ZmZlci5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJpbGwgPSAgdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRiaWxsLmlzQmlsbGJvYXJkID0gdHJ1ZTtcclxuXHRcdHJldHVybiBiaWxsO1xyXG5cdH0sXHJcblx0XHJcblx0c2xvcGU6IGZ1bmN0aW9uKHNpemUsIHRleFJlcGVhdCwgZ2wsIGRpcil7XHJcblx0XHR2YXIgdmVydGV4LCBpbmRpY2VzLCB0ZXhDb29yZHM7XHJcblx0XHR2YXIgdyA9IHNpemUuYSAvIDI7XHJcblx0XHR2YXIgaCA9IHNpemUuYiAvIDI7XHJcblx0XHR2YXIgbCA9IHNpemUuYyAvIDI7XHJcblx0XHRcclxuXHRcdHZhciB0eCA9IHRleFJlcGVhdC5hO1xyXG5cdFx0dmFyIHR5ID0gdGV4UmVwZWF0LmI7XHJcblx0XHRcclxuXHRcdHZlcnRleCA9IFtcclxuXHRcdFx0IC8vIEZyb250IFNsb3BlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsIC1sLFxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0XHJcblx0XHRcdCAvLyBSaWdodCBTaWRlXHJcblx0XHRcdCB3LCAgMC41LCAgbCxcclxuXHRcdFx0IHcsICAwLjAsICBsLFxyXG5cdFx0XHQgdywgIDAuMCwgLWwsXHJcblx0XHRcdCBcclxuXHRcdFx0IC8vIExlZnQgU2lkZVxyXG5cdFx0XHQtdywgIDAuNSwgIGwsXHJcblx0XHRcdC13LCAgMC4wLCAtbCxcclxuXHRcdFx0LXcsICAwLjAsICBsXHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRpZiAoZGlyICE9IDApe1xyXG5cdFx0XHR2YXIgYW5nID0gTWF0aC5kZWdUb1JhZChkaXIgKiAtOTApO1xyXG5cdFx0XHR2YXIgQyA9IE1hdGguY29zKGFuZyk7XHJcblx0XHRcdHZhciBTID0gTWF0aC5zaW4oYW5nKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8dmVydGV4Lmxlbmd0aDtpKz0zKXtcclxuXHRcdFx0XHR2YXIgYSA9IHZlcnRleFtpXSAqIEMgLSB2ZXJ0ZXhbaSsyXSAqIFM7XHJcblx0XHRcdFx0dmFyIGIgPSB2ZXJ0ZXhbaV0gKiBTICsgdmVydGV4W2krMl0gKiBDO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZlcnRleFtpXSA9IGE7XHJcblx0XHRcdFx0dmVydGV4W2krMl0gPSBiO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cdFx0aW5kaWNlcy5wdXNoKDAsIDEsIDIsIDIsIDEsIDMsIDQsIDUsIDYsIDcsIDgsIDkpO1xyXG5cdFx0XHJcblx0XHR0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHRleENvb3Jkcy5wdXNoKFxyXG5cdFx0XHQgdHgsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgMC4wLFxyXG5cdFx0XHQwLjAsICB0eSxcclxuXHRcdFx0XHJcblx0XHRcdCB0eCwgMC4wLFxyXG5cdFx0XHQgdHgsICB0eSxcclxuXHRcdFx0MC4wLCAgdHksXHJcblx0XHRcdFxyXG5cdFx0XHQwLjAsIDAuMCxcclxuXHRcdFx0IHR4LCAgdHksXHJcblx0XHRcdDAuMCwgIHR5XHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRkYXJrVmVydGV4ID0gWzAsMCwwLDAsMCwwLDAsMCwwLDBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge3ZlcnRpY2VzOiB2ZXJ0ZXgsIGluZGljZXM6IGluZGljZXMsIHRleENvb3JkczogdGV4Q29vcmRzLCBkYXJrVmVydGV4OiBkYXJrVmVydGV4fTtcclxuXHR9LFxyXG5cdFxyXG5cdGFzc2VtYmxlT2JqZWN0OiBmdW5jdGlvbihtYXBEYXRhLCBvYmplY3RUeXBlLCBnbCl7XHJcblx0XHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHRcdHZhciB0ZXhDb29yZHMgPSBbXTtcclxuXHRcdHZhciBpbmRpY2VzID0gW107XHJcblx0XHR2YXIgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVjdCA9IFs2NCw2NCwwLDBdOyAvLyBbeDEseTEseDIseTJdXHJcblx0XHRmb3IgKHZhciB5PTAseWxlbj1tYXBEYXRhLmxlbmd0aDt5PHlsZW47eSsrKXtcclxuXHRcdFx0Zm9yICh2YXIgeD0wLHhsZW49bWFwRGF0YVt5XS5sZW5ndGg7eDx4bGVuO3grKyl7XHJcblx0XHRcdFx0dmFyIHQgPSAobWFwRGF0YVt5XVt4XS50aWxlKT8gbWFwRGF0YVt5XVt4XS50aWxlIDogMDtcclxuXHRcdFx0XHRpZiAodCAhPSAwKXtcclxuXHRcdFx0XHRcdC8vIFNlbGVjdGluZyBib3VuZGFyaWVzIG9mIHRoZSBtYXAgcGFydFxyXG5cdFx0XHRcdFx0cmVjdFswXSA9IE1hdGgubWluKHJlY3RbMF0sIHggLSA2KTtcclxuXHRcdFx0XHRcdHJlY3RbMV0gPSBNYXRoLm1pbihyZWN0WzFdLCB5IC0gNik7XHJcblx0XHRcdFx0XHRyZWN0WzJdID0gTWF0aC5tYXgocmVjdFsyXSwgeCArIDYpO1xyXG5cdFx0XHRcdFx0cmVjdFszXSA9IE1hdGgubWF4KHJlY3RbM10sIHkgKyA2KTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dmFyIHZ2O1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJGXCIpeyB2diA9IHRoaXMuZmxvb3IodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gRmxvb3JcclxuXHRcdFx0XHRcdGlmIChvYmplY3RUeXBlID09IFwiQ1wiKXsgdnYgPSB0aGlzLmNlaWwodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLDEuMCksIGdsKTsgfWVsc2UgLy8gQ2VpbFxyXG5cdFx0XHRcdFx0aWYgKG9iamVjdFR5cGUgPT0gXCJCXCIpeyB2diA9IHRoaXMuY3ViZSh2ZWMzKDEuMCxtYXBEYXRhW3ldW3hdLmgsMS4wKSwgdmVjMigxLjAsbWFwRGF0YVt5XVt4XS5oKSwgZ2wsIGZhbHNlLCB0aGlzLmdldEN1YmVGYWNlcyhtYXBEYXRhLCB4LCB5KSk7IH1lbHNlIC8vIEJsb2NrXHJcblx0XHRcdFx0XHRpZiAob2JqZWN0VHlwZSA9PSBcIlNcIil7IHZ2ID0gdGhpcy5zbG9wZSh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgZ2wsIG1hcERhdGFbeV1beF0uZGlyKTsgfSAvLyBTbG9wZVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgdmVydGV4T2ZmID0gdmVydGljZXMubGVuZ3RoIC8gMztcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRcdFx0XHR4eCA9IHZ2LnZlcnRpY2VzW2ldICsgeCArIDAuNTtcclxuXHRcdFx0XHRcdFx0eXkgPSB2di52ZXJ0aWNlc1tpKzFdICsgbWFwRGF0YVt5XVt4XS55O1xyXG5cdFx0XHRcdFx0XHR6eiA9IHZ2LnZlcnRpY2VzW2krMl0gKyB5ICsgMC41O1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dmVydGljZXMucHVzaCh4eCwgeXksIHp6KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj12di5pbmRpY2VzLmxlbmd0aDtpPGxlbjtpKz0xKXtcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZ2LmluZGljZXNbaV0gKyB2ZXJ0ZXhPZmYpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXZ2LnRleENvb3Jkcy5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdHRleENvb3Jkcy5wdXNoKHZ2LnRleENvb3Jkc1tpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MCxsZW49dnYuZGFya1ZlcnRleC5sZW5ndGg7aTxsZW47aSs9MSl7XHJcblx0XHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCh2di5kYXJrVmVydGV4W2ldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmVjcmVhdGUgYnVmZmVyIGRhdGEgb24gZGVzZXJpYWxpemF0aW9uXHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdmVydGljZXNcclxuXHRcdHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSB2ZXJ0aWNlcy5sZW5ndGg7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIuaXRlbVNpemUgPSAzO1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuXHRcdHZhciB0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGV4Q29vcmRzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cdFx0dGV4QnVmZmVyLm51bUl0ZW1zID0gdGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRpbmRpY2VzQnVmZmVyLm51bUl0ZW1zID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0XHRpbmRpY2VzQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhcmtCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBkYXJrQnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLG5ldyBVaW50OEFycmF5KGRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gZGFya1ZlcnRleC5sZW5ndGg7XHJcblx0XHRkYXJrQnVmZmVyLml0ZW1TaXplID0gMTtcclxuXHRcdFxyXG5cdFx0dmFyIGJ1ZmZlciA9IHRoaXMuZ2V0T2JqZWN0V2l0aFByb3BlcnRpZXModmVydGV4QnVmZmVyLCBpbmRpY2VzQnVmZmVyLCB0ZXhCdWZmZXIsIGRhcmtCdWZmZXIpO1xyXG5cdFx0YnVmZmVyLmJvdW5kYXJpZXMgPSByZWN0O1xyXG5cdFx0cmV0dXJuIGJ1ZmZlcjtcclxuXHR9LFxyXG5cdFxyXG5cdFxyXG5cdGdldEN1YmVGYWNlczogZnVuY3Rpb24obWFwLCB4LCB5KXtcclxuXHRcdHZhciByZXQgPSBbMSwxLDEsMV07XHJcblx0XHR2YXIgdGlsZSA9IG1hcFt5XVt4XTtcclxuXHRcdFxyXG5cdFx0Ly8gVXAgRmFjZVxyXG5cdFx0aWYgKHkgPiAwICYmIG1hcFt5LTFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5LTFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzBdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gTGVmdCBmYWNlXHJcblx0XHRpZiAoeCA8IDYzICYmIG1hcFt5XVt4KzFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4KzFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzFdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gRG93biBmYWNlXHJcblx0XHRpZiAoeSA8IDYzICYmIG1hcFt5KzFdW3hdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5KzFdW3hdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzJdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gUmlnaHQgZmFjZVxyXG5cdFx0aWYgKHggPiAwICYmIG1hcFt5XVt4LTFdICE9IDApe1xyXG5cdFx0XHR2YXIgdCA9IG1hcFt5XVt4LTFdO1xyXG5cdFx0XHRpZiAodC55IDw9IHRpbGUueSAmJiAodC55ICsgdC5oKSA+PSAodGlsZS55ICsgdGlsZS5oKSl7XHJcblx0XHRcdFx0cmV0WzNdID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblx0XHJcblx0Z2V0T2JqZWN0V2l0aFByb3BlcnRpZXM6IGZ1bmN0aW9uKHZlcnRleEJ1ZmZlciwgaW5kZXhCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcil7XHJcblx0XHR2YXIgb2JqID0ge1xyXG5cdFx0XHRyb3RhdGlvbjogdmVjMygwLCAwLCAwKSxcclxuXHRcdFx0cG9zaXRpb246IHZlYzMoMCwgMCwgMCksXHJcblx0XHRcdHZlcnRleEJ1ZmZlcjogdmVydGV4QnVmZmVyLCBcclxuXHRcdFx0aW5kaWNlc0J1ZmZlcjogaW5kZXhCdWZmZXIsIFxyXG5cdFx0XHR0ZXhCdWZmZXI6IHRleEJ1ZmZlcixcclxuXHRcdFx0ZGFya0J1ZmZlcjogZGFya0J1ZmZlclxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9LFxyXG5cdFxyXG5cdGNyZWF0ZTNET2JqZWN0OiBmdW5jdGlvbihnbCwgYmFzZU9iamVjdCl7XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBidWZmZXIgZGF0YSBmb3IgdGhlIHZlcnRpY2VzXHJcblx0XHR2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuXHRcdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGJhc2VPYmplY3QudmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHR2ZXJ0ZXhCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LnZlcnRpY2VzLmxlbmd0aDtcclxuXHRcdHZlcnRleEJ1ZmZlci5pdGVtU2l6ZSA9IDM7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgdGV4dHVyZSBjb29yZGluYXRlc1xyXG5cdFx0dmFyIHRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShiYXNlT2JqZWN0LnRleENvb3JkcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdHRleEJ1ZmZlci5udW1JdGVtcyA9IGJhc2VPYmplY3QudGV4Q29vcmRzLmxlbmd0aDtcclxuXHRcdHRleEJ1ZmZlci5pdGVtU2l6ZSA9IDI7XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgdGhlIGJ1ZmZlciBkYXRhIGZvciB0aGUgaW5kaWNlc1xyXG5cdFx0dmFyIGluZGljZXNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXNCdWZmZXIpO1xyXG5cdFx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IFVpbnQxNkFycmF5KGJhc2VPYmplY3QuaW5kaWNlcyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHRcdGluZGljZXNCdWZmZXIubnVtSXRlbXMgPSBiYXNlT2JqZWN0LmluZGljZXMubGVuZ3RoO1xyXG5cdFx0aW5kaWNlc0J1ZmZlci5pdGVtU2l6ZSA9IDE7XHJcblx0XHRcclxuXHRcdHZhciBkYXJrQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZGFya0J1ZmZlcik7XHJcblx0XHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixuZXcgVWludDhBcnJheShiYXNlT2JqZWN0LmRhcmtWZXJ0ZXgpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblx0XHRkYXJrQnVmZmVyLm51bUl0ZW1zID0gYmFzZU9iamVjdC5kYXJrVmVydGV4Lmxlbmd0aDtcclxuXHRcdGRhcmtCdWZmZXIuaXRlbVNpemUgPSAxO1xyXG5cdFx0XHJcblx0XHR2YXIgYnVmZmVyID0gdGhpcy5nZXRPYmplY3RXaXRoUHJvcGVydGllcyh2ZXJ0ZXhCdWZmZXIsIGluZGljZXNCdWZmZXIsIHRleEJ1ZmZlciwgZGFya0J1ZmZlcik7XHJcblx0XHRcclxuXHRcdHJldHVybiBidWZmZXI7XHJcblx0fSxcclxuXHRcclxuXHR0cmFuc2xhdGVPYmplY3Q6IGZ1bmN0aW9uKG9iamVjdCwgdHJhbnNsYXRpb24pe1xyXG5cdFx0Zm9yICh2YXIgaT0wLGxlbj1vYmplY3QudmVydGljZXMubGVuZ3RoO2k8bGVuO2krPTMpe1xyXG5cdFx0XHRvYmplY3QudmVydGljZXNbaV0gKz0gdHJhbnNsYXRpb24uYTtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMV0gKz0gdHJhbnNsYXRpb24uYjtcclxuXHRcdFx0b2JqZWN0LnZlcnRpY2VzW2krMl0gKz0gdHJhbnNsYXRpb24uYztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9iamVjdDtcclxuXHR9LFxyXG5cdFxyXG5cdGZ1emVPYmplY3RzOiBmdW5jdGlvbihvYmplY3RMaXN0KXtcclxuXHRcdHZhciB2ZXJ0aWNlcyA9IFtdO1xyXG5cdFx0dmFyIHRleENvb3JkcyA9IFtdO1xyXG5cdFx0dmFyIGluZGljZXMgPSBbXTtcclxuXHRcdHZhciBkYXJrVmVydGV4ID0gW107XHJcblx0XHRcclxuXHRcdHZhciBpbmRleENvdW50ID0gMDtcclxuXHRcdGZvciAodmFyIGk9MCxsZW49b2JqZWN0TGlzdC5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0dmFyIG9iaiA9IG9iamVjdExpc3RbaV07XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBqPTAsamxlbj1vYmoudmVydGljZXMubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2gob2JqLnZlcnRpY2VzW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLnRleENvb3Jkcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0dGV4Q29vcmRzLnB1c2gob2JqLnRleENvb3Jkc1tqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGo9MCxqbGVuPW9iai5pbmRpY2VzLmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdFx0XHRpbmRpY2VzLnB1c2gob2JqLmluZGljZXNbal0gKyBpbmRleENvdW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaj0wLGpsZW49b2JqLmRhcmtWZXJ0ZXgubGVuZ3RoO2o8amxlbjtqKyspe1xyXG5cdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaChvYmouZGFya1ZlcnRleFtqXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGluZGV4Q291bnQgKz0gb2JqLnZlcnRpY2VzLmxlbmd0aCAvIDM7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB7dmVydGljZXM6IHZlcnRpY2VzLCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleENvb3JkcywgZGFya1ZlcnRleDogZGFya1ZlcnRleH07XHJcblx0fSxcclxuXHRcclxuXHRsb2FkM0RNb2RlbDogZnVuY3Rpb24obW9kZWxGaWxlLCBnbCl7XHJcblx0XHR2YXIgbW9kZWwgPSB7cmVhZHk6IGZhbHNlfTtcclxuXHRcdFxyXG5cdFx0dmFyIGh0dHAgPSBVdGlscy5nZXRIdHRwKCk7XHJcblx0XHRodHRwLm9wZW4oXCJHRVRcIiwgY3AgKyBcIm1vZGVscy9cIiArIG1vZGVsRmlsZSArIFwiLm9iaj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0XHRodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT0gNCAmJiBodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuXHRcdFx0XHR2YXIgbGluZXMgPSBodHRwLnJlc3BvbnNlVGV4dC5zcGxpdChcIlxcblwiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdmVydGljZXMgPSBbXSwgdGV4Q29vcmRzID0gW10sIHRyaWFuZ2xlcyA9IFtdLCB2ZXJ0ZXhJbmRleCA9IFtdLCB0ZXhJbmRpY2VzID0gW10sIGluZGljZXMgPSBbXSwgZGFya1ZlcnRleCA9IFtdO1xyXG5cdFx0XHRcdHZhciB3b3JraW5nO1xyXG5cdFx0XHRcdHZhciB0ID0gZmFsc2U7XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1saW5lcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdHZhciBsID0gbGluZXNbaV0udHJpbSgpO1xyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCJcIil7IGNvbnRpbnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHZlcnRpY2VzXCIpeyB3b3JraW5nID0gdmVydGljZXM7IHQgPSBmYWxzZTsgfWVsc2VcclxuXHRcdFx0XHRcdGlmIChsID09IFwiIyB0ZXhDb29yZHNcIil7IHdvcmtpbmcgPSB0ZXhDb29yZHM7IHQgPSB0cnVlOyB9ZWxzZVxyXG5cdFx0XHRcdFx0aWYgKGwgPT0gXCIjIHRyaWFuZ2xlc1wiKXsgd29ya2luZyA9IHRyaWFuZ2xlczsgdCA9IGZhbHNlOyB9XHJcblx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHR2YXIgcGFyYW1zID0gbC5zcGxpdChcIiBcIik7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGo9MCxqbGVuPXBhcmFtcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFpc05hTihwYXJhbXNbal0pKXtcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtc1tqXSA9IHBhcnNlRmxvYXQocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0KSB3b3JraW5nLnB1c2gocGFyYW1zW2pdKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAodCkgd29ya2luZy5wdXNoKHBhcmFtcyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciB1c2VkVmVyID0gW107XHJcblx0XHRcdFx0dmFyIHVzZWRJbmQgPSBbXTtcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRyaWFuZ2xlcy5sZW5ndGg7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGlmICh1c2VkVmVyLmluZGV4T2YodHJpYW5nbGVzW2ldKSAhPSAtMSl7XHJcblx0XHRcdFx0XHRcdGluZGljZXMucHVzaCh1c2VkSW5kW3VzZWRWZXIuaW5kZXhPZih0cmlhbmdsZXNbaV0pXSk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dXNlZFZlci5wdXNoKHRyaWFuZ2xlc1tpXSk7XHJcblx0XHRcdFx0XHRcdHZhciB0ID0gdHJpYW5nbGVzW2ldLnNwbGl0KFwiL1wiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0WzBdID0gcGFyc2VJbnQodFswXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHR0WzFdID0gcGFyc2VJbnQodFsxXSkgLSAxO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aW5kaWNlcy5wdXNoKHZlcnRleEluZGV4Lmxlbmd0aCAvIDMpO1xyXG5cdFx0XHRcdFx0XHR1c2VkSW5kLnB1c2godmVydGV4SW5kZXgubGVuZ3RoIC8gMyk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR2ZXJ0ZXhJbmRleC5wdXNoKHZlcnRpY2VzW3RbMF0gKiAzXSwgdmVydGljZXNbdFswXSAqIDMgKyAxXSwgdmVydGljZXNbdFswXSAqIDMgKyAyXSk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0ZXhJbmRpY2VzLnB1c2godGV4Q29vcmRzW3RbMV1dWzBdLCB0ZXhDb29yZHNbdFsxXV1bMV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IgKHZhciBpPTAsbGVuPXRleEluZGljZXMubGVuZ3RoLzI7aTxsZW47aSsrKXtcclxuXHRcdFx0XHRcdGRhcmtWZXJ0ZXgucHVzaCgwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGJhc2UgPSB7dmVydGljZXM6IHZlcnRleEluZGV4LCBpbmRpY2VzOiBpbmRpY2VzLCB0ZXhDb29yZHM6IHRleEluZGljZXMsIGRhcmtWZXJ0ZXg6IGRhcmtWZXJ0ZXh9O1xyXG5cdFx0XHRcdHZhciBtb2RlbDNEID0gdGhpcy5jcmVhdGUzRE9iamVjdChnbCwgYmFzZSk7XHJcblxyXG5cdFx0XHRcdG1vZGVsLnJvdGF0aW9uID0gbW9kZWwzRC5yb3RhdGlvbjtcclxuXHRcdFx0XHRtb2RlbC5wb3NpdGlvbiA9IG1vZGVsM0QucG9zaXRpb247XHJcblx0XHRcdFx0bW9kZWwudmVydGV4QnVmZmVyID0gbW9kZWwzRC52ZXJ0ZXhCdWZmZXI7XHJcblx0XHRcdFx0bW9kZWwuaW5kaWNlc0J1ZmZlciA9IG1vZGVsM0QuaW5kaWNlc0J1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC50ZXhCdWZmZXIgPSBtb2RlbDNELnRleEJ1ZmZlcjtcclxuXHRcdFx0XHRtb2RlbC5kYXJrQnVmZmVyID0gbW9kZWwzRC5kYXJrQnVmZmVyO1xyXG5cdFx0XHRcdG1vZGVsLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdGh0dHAuc2VuZCgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbW9kZWw7XHJcblx0fVxyXG59O1xyXG4iLCJ2YXIgTWlzc2lsZSA9IHJlcXVpcmUoJy4vTWlzc2lsZScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcblxyXG52YXIgY2hlYXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBQbGF5ZXIocG9zaXRpb24sIGRpcmVjdGlvbiwgbWFwTWFuYWdlcil7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKCdQbGF5ZXInKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1BsYXllcicsIFBsYXllcik7XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwb3NpdGlvbiwgZGlyZWN0aW9uLCBtYXBNYW5hZ2VyKXtcclxuXHRjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHR0aGlzLnJvdGF0aW9uID0gZGlyZWN0aW9uO1xyXG5cdHRoaXMubWFwTWFuYWdlciA9IG1hcE1hbmFnZXI7XHJcblx0XHJcblx0dGhpcy5yb3RhdGlvblNwZCA9IHZlYzIoTWF0aC5kZWdUb1JhZCgxKSwgTWF0aC5kZWdUb1JhZCg0KSk7XHJcblx0dGhpcy5tb3ZlbWVudFNwZCA9IDAuMDU7XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjU7XHJcblx0dGhpcy5tYXhWZXJ0Um90YXRpb24gPSBNYXRoLmRlZ1RvUmFkKDQ1KTtcclxuXHRcclxuXHR0aGlzLnRhcmdldFkgPSBwb3NpdGlvbi5iO1xyXG5cdHRoaXMueVNwZWVkID0gMC4wO1xyXG5cdHRoaXMueUdyYXZpdHkgPSAwLjA7XHJcblx0XHJcblx0dGhpcy5qb2cgPSB2ZWM0KDAuMCwgMSwgMC4wLCAxKTtcclxuXHR0aGlzLm9uV2F0ZXIgPSBmYWxzZTtcclxuXHR0aGlzLm1vdmVkID0gZmFsc2U7XHJcblxyXG5cdHRoaXMuaHVydCA9IDAuMDtcdFxyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDA7XHJcblx0XHJcblx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID0gMDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUucmVjZWl2ZURhbWFnZSA9IGZ1bmN0aW9uKGRtZyl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRcclxuXHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0dGhpcy5odXJ0ID0gNS4wO1xyXG5cdHZhciBwbGF5ZXIgPSBnYW1lLnBsYXllcjtcclxuXHRwbGF5ZXIuaHAgLT0gZG1nO1xyXG5cdGlmIChwbGF5ZXIuaHAgPD0gMCl7XHJcblx0XHRwbGF5ZXIuaHAgPSAwO1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJZb3UgZGllZCFcIik7XHJcblx0XHR0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0TWlzc2lsZSA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHR2YXIgcHMgPSBnYW1lLnBsYXllcjtcclxuXHRcclxuXHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMuc3RyKTtcclxuXHRpZiAod2VhcG9uKSBzdHIgKz0gVXRpbHMucm9sbERpY2Uod2VhcG9uLnN0cikgKiB3ZWFwb24uc3RhdHVzO1xyXG5cdFxyXG5cdHZhciBwcm9iID0gTWF0aC5yYW5kb20oKTtcclxuXHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHRoaXMucG9zaXRpb24uY2xvbmUoKSwgdGhpcy5yb3RhdGlvbi5jbG9uZSgpLCB3ZWFwb24uY29kZSwgJ2VuZW15JywgdGhpcy5tYXBNYW5hZ2VyKTtcclxuXHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdG1pc3NpbGUubWlzc2VkID0gKHByb2IgPiBwcy5zdGF0cy5kZXgpO1xyXG5cdC8vIGlmICh3ZWFwb24pIHdlYXBvbi5zdGF0dXMgKj0gKDEuMCAtIHdlYXBvbi53ZWFyKTtcclxuXHRcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIllvdSBzaG9vdCBcIiArIHdlYXBvbi5zdWJJdGVtTmFtZSk7XHJcblx0dGhpcy5tYXBNYW5hZ2VyLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdHRoaXMuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdHRoaXMubW92ZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5tZWxlZUF0dGFjayA9IGZ1bmN0aW9uKHdlYXBvbil7XHJcblx0dmFyIGVuZW1pZXMgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VzTmVhcmVzdCh0aGlzLnBvc2l0aW9uLCAxLjAsICdlbmVteScpO1xyXG5cdFx0XHJcblx0dmFyIHh4ID0gdGhpcy5wb3NpdGlvbi5hO1xyXG5cdHZhciB6eiA9IHRoaXMucG9zaXRpb24uYztcclxuXHR2YXIgZHggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdHZhciBkeiA9IC1NYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC4xO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR4eCArPSBkeDtcclxuXHRcdHp6ICs9IGR6O1xyXG5cdFx0dmFyIG9iamVjdDtcclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgaj0wLGpsZW49ZW5lbWllcy5sZW5ndGg7ajxqbGVuO2orKyl7XHJcblx0XHRcdHZhciBpbnMgPSBlbmVtaWVzW2pdO1xyXG5cdFx0XHR2YXIgeCA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5hIC0geHgpO1xyXG5cdFx0XHR2YXIgeiA9IE1hdGguYWJzKGlucy5wb3NpdGlvbi5jIC0genopO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHggPCAwLjMgJiYgeiA8IDAuMyl7XHJcblx0XHRcdFx0b2JqZWN0ID0gaW5zO1xyXG5cdFx0XHRcdGogPSBqbGVuO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmVuZW15KXtcclxuXHRcdFx0dGhpcy5jYXN0QXR0YWNrKG9iamVjdCwgd2VhcG9uKTtcclxuXHRcdFx0dGhpcy5hdHRhY2tXYWl0ID0gMjA7XHJcblx0XHRcdHRoaXMubW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRpID0gMTE7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jYXN0QXR0YWNrID0gZnVuY3Rpb24odGFyZ2V0LCB3ZWFwb24pe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0dmFyIHBzID0gZ2FtZS5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIHByb2IgPSBNYXRoLnJhbmRvbSgpO1xyXG5cdGlmIChwcm9iID4gcHMuc3RhdHMuZGV4KXtcclxuXHRcdGdhbWUucGxheVNvdW5kKCdtaXNzJyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIk1pc3NlZCFcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5zdHIpO1xyXG5cdC8vdmFyIGRmcyA9IFV0aWxzLnJvbGxEaWNlKHRhcmdldC5lbmVteS5zdGF0cy5kZnMpO1xyXG5cdHZhciBkZnMgPSAwO1xyXG5cdFxyXG5cdGlmICh3ZWFwb24pIHN0ciArPSBVdGlscy5yb2xsRGljZSh3ZWFwb24uc3RyKSAqIHdlYXBvbi5zdGF0dXM7XHJcblx0XHJcblx0dmFyIGRtZyA9IE1hdGgubWF4KHN0ciAtIGRmcywgMCkgPDwgMDtcclxuXHRcclxuXHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkF0dGFja2luZyBcIiArIHRhcmdldC5lbmVteS5uYW1lKTtcclxuXHRcclxuXHRpZiAoZG1nID4gMCl7XHJcblx0XHRnYW1lLnBsYXlTb3VuZCgnaGl0Jyk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShkbWcgKyBcIiBwb2ludHMgaW5mbGljdGVkXCIpO1xyXG5cdFx0dGFyZ2V0LnJlY2VpdmVEYW1hZ2UoZG1nKTtcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKFwiQmxvY2tlZCFcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8vaWYgKHdlYXBvbikgd2VhcG9uLnN0YXR1cyAqPSAoMS4wIC0gd2VhcG9uLndlYXIpO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5qb2dNb3ZlbWVudCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlcil7XHJcblx0XHR0aGlzLmpvZy5hICs9IDAuMDA1ICogdGhpcy5qb2cuYjtcclxuXHRcdGlmICh0aGlzLmpvZy5hID49IDAuMDMgJiYgdGhpcy5qb2cuYiA9PSAxKSB0aGlzLmpvZy5iID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5hIDw9IC0wLjAzICYmIHRoaXMuam9nLmIgPT0gLTEpIHRoaXMuam9nLmIgPSAxO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5qb2cuYSArPSAwLjAwOCAqIHRoaXMuam9nLmI7XHJcblx0XHRpZiAodGhpcy5qb2cuYSA+PSAwLjAzICYmIHRoaXMuam9nLmIgPT0gMSkgdGhpcy5qb2cuYiA9IC0xOyBlbHNlXHJcblx0XHRpZiAodGhpcy5qb2cuYSA8PSAtMC4wMyAmJiB0aGlzLmpvZy5iID09IC0xKSB0aGlzLmpvZy5iID0gMTtcclxuXHR9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uKHhUbywgelRvKXtcclxuXHR2YXIgbW92ZWQgPSBmYWxzZTtcclxuXHRcclxuXHR2YXIgc3dpbSA9ICh0aGlzLm9uTGF2YSB8fCB0aGlzLm9uV2F0ZXIpO1xyXG5cdGlmIChzd2ltKXsgeFRvIC89IDI7IHpUbyAvPTI7IH1cclxuXHR2YXIgbW92ZW1lbnQgPSB2ZWMyKHhUbywgelRvKTtcclxuXHR2YXIgc3BkID0gdmVjMih4VG8gKiAxLjUsIDApO1xyXG5cdHZhciBmYWtlUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHJcblx0Zm9yICh2YXIgaT0wO2k8MjtpKyspe1xyXG5cdFx0dmFyIG5vcm1hbCA9IHRoaXMubWFwTWFuYWdlci5nZXRXYWxsTm9ybWFsKGZha2VQb3MsIHNwZCwgdGhpcy5jYW1lcmFIZWlnaHQsIHN3aW0pO1xyXG5cdFx0aWYgKCFub3JtYWwpeyBub3JtYWwgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0SW5zdGFuY2VOb3JtYWwoZmFrZVBvcywgc3BkLCB0aGlzLmNhbWVyYUhlaWdodCk7IH0gXHJcblx0XHRcclxuXHRcdGlmIChub3JtYWwpe1xyXG5cdFx0XHRub3JtYWwgPSBub3JtYWwuY2xvbmUoKTtcclxuXHRcdFx0dmFyIGRpc3QgPSBtb3ZlbWVudC5kb3Qobm9ybWFsKTtcclxuXHRcdFx0bm9ybWFsLm11bHRpcGx5KC1kaXN0KTtcclxuXHRcdFx0bW92ZW1lbnQuc3VtKG5vcm1hbCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZha2VQb3MuYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0XHJcblx0XHRzcGQgPSB2ZWMyKDAsIHpUbyAqIDEuNSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChtb3ZlbWVudC5hICE9IDAgfHwgbW92ZW1lbnQuYiAhPSAwKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYSArPSBtb3ZlbWVudC5hO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5jICs9IG1vdmVtZW50LmI7XHJcblx0XHR0aGlzLmRvVmVydGljYWxDaGVja3MoKTtcclxuXHRcdHRoaXMuam9nTW92ZW1lbnQoKTtcclxuXHRcdG1vdmVkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IG1vdmVkO1xyXG5cdHJldHVybiBtb3ZlZDtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUubW91c2VMb29rID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgbU1vdmVtZW50ID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuZ2V0TW91c2VNb3ZlbWVudCgpO1xyXG5cdFxyXG5cdGlmIChtTW92ZW1lbnQueCAhPSAtMTAwMDApeyB0aGlzLnJvdGF0aW9uLmIgLT0gTWF0aC5kZWdUb1JhZChtTW92ZW1lbnQueCk7IH1cclxuXHRpZiAobU1vdmVtZW50LnkgIT0gLTEwMDAwKXsgdGhpcy5yb3RhdGlvbi5hIC09IE1hdGguZGVnVG9SYWQobU1vdmVtZW50LnkpOyB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVtZW50ID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXMubWFwTWFuYWdlci5nYW1lO1xyXG5cdFxyXG5cdHRoaXMubW91c2VMb29rKCk7XHJcblxyXG5cdC8vIFJvdGF0aW9uIHdpdGgga2V5Ym9hcmRcclxuXHRpZiAoZ2FtZS5rZXlzWzgxXSA9PSAxIHx8IGdhbWUua2V5c1szN10gPT0gMSl7XHJcblx0XHR0aGlzLnJvdGF0aW9uLmIgKz0gdGhpcy5yb3RhdGlvblNwZC5iO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNjldID09IDEgfHwgZ2FtZS5rZXlzWzM5XSA9PSAxKXtcclxuXHRcdHRoaXMucm90YXRpb24uYiAtPSB0aGlzLnJvdGF0aW9uU3BkLmI7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1szOF0gPT0gMSl7IC8vIFVwIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgKz0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1lbHNlIGlmIChnYW1lLmtleXNbNDBdID09IDEpeyAvLyBEb3duIGFycm93XHJcblx0XHR0aGlzLnJvdGF0aW9uLmEgLT0gdGhpcy5yb3RhdGlvblNwZC5hO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHR2YXIgQSA9IDAuMCwgQiA9IDAuMDtcclxuXHRpZiAoZ2FtZS5rZXlzWzg3XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s4M10gPT0gMSl7XHJcblx0XHRBID0gLU1hdGguY29zKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdFx0QiA9IE1hdGguc2luKHRoaXMucm90YXRpb24uYikgKiB0aGlzLm1vdmVtZW50U3BkICogMC4zO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoZ2FtZS5rZXlzWzY1XSA9PSAxKXtcclxuXHRcdEEgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uLmIgKyBNYXRoLlBJXzIpICogdGhpcy5tb3ZlbWVudFNwZDtcclxuXHRcdEIgPSAtTWF0aC5zaW4odGhpcy5yb3RhdGlvbi5iICsgTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0fWVsc2UgaWYgKGdhbWUua2V5c1s2OF0gPT0gMSl7XHJcblx0XHRBID0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iIC0gTWF0aC5QSV8yKSAqIHRoaXMubW92ZW1lbnRTcGQ7XHJcblx0XHRCID0gLU1hdGguc2luKHRoaXMucm90YXRpb24uYiAtIE1hdGguUElfMikgKiB0aGlzLm1vdmVtZW50U3BkO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoQSAhPSAwLjAgfHwgQiAhPSAwLjApeyB0aGlzLm1vdmVUbyhBLCBCKTsgfWVsc2V7IHRoaXMuam9nLmEgPSAwLjA7IH1cclxuXHRpZiAodGhpcy5yb3RhdGlvbi5hID4gdGhpcy5tYXhWZXJ0Um90YXRpb24pIHRoaXMucm90YXRpb24uYSA9IHRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG5cdGVsc2UgaWYgKHRoaXMucm90YXRpb24uYSA8IC10aGlzLm1heFZlcnRSb3RhdGlvbikgdGhpcy5yb3RhdGlvbi5hID0gLXRoaXMubWF4VmVydFJvdGF0aW9uO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5jaGVja0FjdGlvbiA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzLm1hcE1hbmFnZXIuZ2FtZTtcclxuXHRpZiAoZ2FtZS5nZXRLZXlQcmVzc2VkKDMyKSl7IC8vIFNwYWNlXHJcblx0XHR2YXIgeHggPSAodGhpcy5wb3NpdGlvbi5hICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbi5iKSAqIDAuNikgPDwgMDtcclxuXHRcdHZhciB6eiA9ICh0aGlzLnBvc2l0aW9uLmMgLSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uLmIpICogMC42KSA8PCAwO1xyXG5cdFx0XHJcblx0XHRpZiAoKHRoaXMucG9zaXRpb24uYSA8PCAwKSA9PSB4eCAmJiAodGhpcy5wb3NpdGlvbi5jIDw8IDApID09IHp6KSByZXR1cm47XHJcblx0XHRcclxuXHRcdHZhciBkb29yID0gdGhpcy5tYXBNYW5hZ2VyLmdldERvb3JBdCh4eCwgdGhpcy5wb3NpdGlvbi5iLCB6eik7XHJcblx0XHRpZiAoZG9vcil7IFxyXG5cdFx0XHRkb29yLmFjdGl2YXRlKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIG9iamVjdCA9IHRoaXMubWFwTWFuYWdlci5nZXRJbnN0YW5jZUF0R3JpZCh2ZWMzKHh4LCB0aGlzLnBvc2l0aW9uLmIsIHp6KSk7XHJcblx0XHRcdGlmIChvYmplY3QgJiYgb2JqZWN0LmFjdGl2YXRlKVxyXG5cdFx0XHRcdG9iamVjdC5hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNoZWF0RW5hYmxlZCl7XHJcblx0XHRcdGlmIChnYW1lLmZsb29yRGVwdGggPCA4KVxyXG5cdFx0XHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIGdhbWUuZmxvb3JEZXB0aCArIDEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0XHR9XHJcblx0fWVsc2UgaWYgKChnYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpIHx8IGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykpICYmIHRoaXMuYXR0YWNrV2FpdCA9PSAwKXtcdC8vIE1lbGVlIGF0dGFjaywgRW50ZXJcclxuXHRcdHZhciB3ZWFwb24gPSBnYW1lLmludmVudG9yeS5nZXRXZWFwb24oKTtcclxuXHRcdFxyXG5cdFx0aWYgKCF3ZWFwb24gfHwgIXdlYXBvbi5yYW5nZWQpe1xyXG5cdFx0XHR0aGlzLmxhdW5jaEF0dGFja0NvdW50ZXIgPSA1O1xyXG5cdFx0fWVsc2UgaWYgKHdlYXBvbiAmJiB3ZWFwb24ucmFuZ2VkKXtcclxuXHRcdFx0dGhpcy5jYXN0TWlzc2lsZSh3ZWFwb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAod2VhcG9uICYmIHdlYXBvbi5zdGF0dXMgPCAwLjA1KXtcclxuXHRcdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmRlc3Ryb3lJdGVtKHdlYXBvbik7XHJcblx0XHRcdHRoaXMubWFwTWFuYWdlci5hZGRNZXNzYWdlKHdlYXBvbi5uYW1lICsgXCIgZGFtYWdlZCFcIik7XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmIChnYW1lLmdldEtleVByZXNzZWQoNzkpKXsgLy8gTywgVE9ETzogY2hhbmdlIHRvIEN0cmwrU1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmFkZE1lc3NhZ2UoXCJTYXZpbmcgZ2FtZS5cIik7XHJcblx0XHRnYW1lLnNhdmVNYW5hZ2VyLnNhdmVHYW1lKCk7XHJcblx0XHR0aGlzLm1hcE1hbmFnZXIuYWRkTWVzc2FnZShcIkdhbWUgU2F2ZWQuXCIpO1xyXG5cdH1cclxuXHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmRvVmVydGljYWxDaGVja3MgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwb2ludFkgPSB0aGlzLm1hcE1hbmFnZXIuZ2V0WUZsb29yKHRoaXMucG9zaXRpb24uYSwgdGhpcy5wb3NpdGlvbi5jKTtcclxuXHR2YXIgd3kgPSAodGhpcy5vbldhdGVyIHx8IHRoaXMub25MYXZhKT8gMC4zIDogMDtcclxuXHR2YXIgcHkgPSBNYXRoLmZsb29yKChwb2ludFkgLSAodGhpcy5wb3NpdGlvbi5iICsgd3kpKSAqIDEwMCkgLyAxMDA7XHJcblx0aWYgKHB5IDw9IDAuMykgdGhpcy50YXJnZXRZID0gcG9pbnRZO1xyXG5cdGlmICh0aGlzLm1hcE1hbmFnZXIuaXNMYXZhUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdFx0aWYgKCF0aGlzLm9uTGF2YSl7XHJcblx0XHRcdHRoaXMucmVjZWl2ZURhbWFnZSg4MCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLm9uTGF2YSA9IHRydWU7XHJcblx0XHRcclxuXHR9IGVsc2UgaWYgKHRoaXMubWFwTWFuYWdlci5pc1dhdGVyUG9zaXRpb24odGhpcy5wb3NpdGlvbi5hLCB0aGlzLnBvc2l0aW9uLmMpKXtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPT0gdGhpcy50YXJnZXRZKVxyXG5cdFx0XHR0aGlzLm1vdmVtZW50U3BkID0gMC4wMjU7XHJcblx0XHR0aGlzLm9uV2F0ZXIgPSB0cnVlO1xyXG5cdFx0dGhpcy5vbkxhdmEgPSBmYWxzZTtcclxuXHR9ZWxzZSB7XHJcblx0XHR0aGlzLm1vdmVtZW50U3BkID0gMC4wNTtcclxuXHRcdHRoaXMub25XYXRlciA9IGZhbHNlO1xyXG5cdFx0dGhpcy5vbkxhdmEgPSBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjUgKyB0aGlzLmpvZy5hICsgdGhpcy5qb2cuYztcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUuZG9GbG9hdCA9IGZ1bmN0aW9uKCl7XHJcblx0aWYgKHRoaXMub25XYXRlciAmJiB0aGlzLmpvZy5hID09IDAuMCl7XHJcblx0XHR0aGlzLmpvZy5jICs9IDAuMDA1ICogdGhpcy5qb2cuZDtcclxuXHRcdGlmICh0aGlzLmpvZy5jID49IDAuMDMgJiYgdGhpcy5qb2cuZCA9PSAxKSB0aGlzLmpvZy5kID0gLTE7IGVsc2VcclxuXHRcdGlmICh0aGlzLmpvZy5jIDw9IC0wLjAzICYmIHRoaXMuam9nLmQgPT0gLTEpIHRoaXMuam9nLmQgPSAxO1xyXG5cdFx0dGhpcy5jYW1lcmFIZWlnaHQgPSAwLjUgKyB0aGlzLmpvZy5hICsgdGhpcy5qb2cuYztcclxuXHR9ZWxzZXtcclxuXHRcdHRoaXMuam9nLmMgPSAwLjA7XHJcblx0fVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5odXJ0ID4gMC4wKSByZXR1cm47XHJcblx0XHJcblx0dGhpcy5kb0Zsb2F0KCk7XHJcblx0dGhpcy5tb3ZlbWVudCgpO1xyXG5cdHRoaXMuY2hlY2tBY3Rpb24oKTtcclxuXHRcclxuXHRpZiAodGhpcy50YXJnZXRZIDwgdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiAtPSAwLjE7XHJcblx0XHR0aGlzLmpvZy5hID0gMC4wO1xyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24uYiA8PSB0aGlzLnRhcmdldFkpIHRoaXMucG9zaXRpb24uYiA9IHRoaXMudGFyZ2V0WTtcclxuXHR9ZWxzZSBpZiAodGhpcy50YXJnZXRZID4gdGhpcy5wb3NpdGlvbi5iKXtcclxuXHRcdHRoaXMucG9zaXRpb24uYiArPSAwLjA4O1xyXG5cdFx0dGhpcy5qb2cuYSA9IDAuMDtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLmIgPj0gdGhpcy50YXJnZXRZKSB0aGlzLnBvc2l0aW9uLmIgPSB0aGlzLnRhcmdldFk7XHJcblx0fVxyXG5cdFxyXG5cdC8vdGhpcy50YXJnZXRZID0gdGhpcy5wb3NpdGlvbi5iO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5tYXBNYW5hZ2VyLmdhbWUucGF1c2VkKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMuZGVzdHJveWVkKXtcclxuXHRcdGlmICh0aGlzLm9uV2F0ZXIgfHwgdGhpcy5vbkxhdmEpe1xyXG5cdFx0XHR0aGlzLmRvRmxvYXQoKTtcclxuXHRcdH1lbHNlIGlmICh0aGlzLmNhbWVyYUhlaWdodCA+IDAuMil7IFxyXG5cdFx0XHR0aGlzLmNhbWVyYUhlaWdodCAtPSAwLjAxOyBcclxuXHRcdH1cclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aWYgKHRoaXMub25MYXZhKXtcclxuXHRcdGlmICh0aGlzLmxhdmFDb3VudGVyID4gMzApe1xyXG5cdFx0XHR0aGlzLnJlY2VpdmVEYW1hZ2UoODApO1xyXG5cdFx0XHR0aGlzLmxhdmFDb3VudGVyID0gMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubGF2YUNvdW50ZXIrKztcclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhpcy5sYXZhQ291bnRlciA9IDA7XHJcblx0fVxyXG5cdGlmICh0aGlzLmF0dGFja1dhaXQgPiAwKSB0aGlzLmF0dGFja1dhaXQgLT0gMTtcclxuXHRpZiAodGhpcy5odXJ0ID4gMCkgdGhpcy5odXJ0IC09IDE7XHJcblx0aWYgKHRoaXMubGF1bmNoQXR0YWNrQ291bnRlciA+IDApe1xyXG5cdFx0dGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyLS07XHJcblx0XHRpZiAodGhpcy5sYXVuY2hBdHRhY2tDb3VudGVyID09IDApe1xyXG5cdFx0XHR2YXIgd2VhcG9uID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUuaW52ZW50b3J5LmdldFdlYXBvbigpO1xyXG5cdFx0XHRpZiAoIXdlYXBvbiB8fCAhd2VhcG9uLnJhbmdlZClcclxuXHRcdFx0XHR0aGlzLm1lbGVlQXR0YWNrKHdlYXBvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0dGhpcy5tb3ZlZCA9IGZhbHNlO1xyXG5cdHRoaXMuc3RlcCgpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBQbGF5ZXJTdGF0cygpe1xyXG5cdHRoaXMuX2MgPSBjaXJjdWxhci5yZWdpc3RlcignUGxheWVyU3RhdHMnKTtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5zdGF0cyA9IHtcclxuXHRcdF9jOiBjaXJjdWxhci5zZXRTYWZlKCksXHJcblx0XHRzdHI6ICcwRDAnLCBcclxuXHRcdGRmczogJzBEMCcsXHJcblx0XHRkZXg6IDAsXHJcblx0XHRtYWdpY1Bvd2VyOiAnMEQwJ1xyXG5cdH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyU3RhdHM7XHJcbmNpcmN1bGFyLnJlZ2lzdGVyQ2xhc3MoJ1BsYXllclN0YXRzJywgUGxheWVyU3RhdHMpO1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmhwID0gMDtcclxuXHR0aGlzLm1IUCA9IDA7XHJcblx0dGhpcy5tYW5hID0gMDtcclxuXHR0aGlzLm1NYW5hID0gMDtcclxuXHRcclxuXHR0aGlzLnZpcnR1ZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5sdmwgPSAxO1xyXG5cdHRoaXMuZXhwID0gMDtcclxuXHRcclxuXHR0aGlzLnN0YXRzID0ge1xyXG5cdFx0X2M6IGNpcmN1bGFyLnNldFNhZmUoKSxcclxuXHRcdHN0cjogJzBEMCcsXHJcblx0XHRkZnM6ICcwRDAnLFxyXG5cdFx0ZGV4OiAwLFxyXG5cdFx0bWFnaWNQb3dlcjogJzBEMCdcclxuXHR9O1xyXG59O1xyXG5cclxuUGxheWVyU3RhdHMucHJvdG90eXBlLmFkZEV4cGVyaWVuY2UgPSBmdW5jdGlvbihhbW91bnQsIGNvbnNvbGUpe1xyXG5cdHRoaXMuZXhwICs9IGFtb3VudDtcclxuXHRcclxuXHRjb25zb2xlLmFkZFNGTWVzc2FnZShhbW91bnQgKyBcIiBYUCBnYWluZWRcIik7XHJcblx0dmFyIG5leHRFeHAgPSAoTWF0aC5wb3codGhpcy5sdmwsIDEuNSkgKiA1MDApIDw8IDA7XHJcblx0aWYgKHRoaXMuZXhwID49IG5leHRFeHApeyB0aGlzLmxldmVsVXAoY29uc29sZSk7IH1cclxufTtcclxuXHJcblBsYXllclN0YXRzLnByb3RvdHlwZS5sZXZlbFVwID0gZnVuY3Rpb24oY29uc29sZSl7XHJcblx0dGhpcy5sdmwgKz0gMTtcclxuXHRcclxuXHQvLyBVcGdyYWRlIEhQIGFuZCBNYW5hXHJcblx0dmFyIGhwTmV3ID0gTWF0aC5pUmFuZG9tKDEwLCAyNSk7XHJcblx0dmFyIG1hbmFOZXcgPSBNYXRoLmlSYW5kb20oNSwgMTUpO1xyXG5cdFxyXG5cdHZhciBocE9sZCA9IHRoaXMubUhQO1xyXG5cdHZhciBtYW5hT2xkID0gdGhpcy5tTWFuYTtcclxuXHRcclxuXHR0aGlzLmhwICArPSBocE5ldztcclxuXHR0aGlzLm1hbmEgKz0gbWFuYU5ldztcclxuXHR0aGlzLm1IUCArPSBocE5ldztcclxuXHR0aGlzLm1NYW5hICs9IG1hbmFOZXc7XHJcblx0XHJcblx0Ly8gVXBncmFkZSBhIHJhbmRvbSBzdGF0IGJ5IDEtMyBwb2ludHNcclxuXHQvKlxyXG5cdHZhciBzdGF0cyA9IFsnc3RyJywgJ2RmcyddO1xyXG5cdHZhciBuYW1lcyA9IFsnU3RyZW5ndGgnLCAnRGVmZW5zZSddO1xyXG5cdHZhciBzdCwgbm07XHJcblx0d2hpbGUgKCFzdCl7XHJcblx0XHR2YXIgaW5kID0gTWF0aC5pUmFuZG9tKHN0YXRzLmxlbmd0aCk7XHJcblx0XHRzdCA9IHN0YXRzW2luZF07XHJcblx0XHRubSA9IG5hbWVzW2luZF07XHJcblx0fVxyXG5cdFxyXG5cdHZhciBwYXJ0MSA9IHBhcnNlSW50KHRoaXMuc3RhdHNbc3RdLnN1YnN0cmluZygwLCB0aGlzLnN0YXRzW3N0XS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0cGFydDEgKz0gTWF0aC5pUmFuZG9tKDEsIDMpO1xyXG5cdFxyXG5cdHZhciBvbGQgPSB0aGlzLnN0YXRzW3N0XTtcclxuXHR0aGlzLnN0YXRzW3N0XSA9IHBhcnQxICsgJ0QzJzsqL1xyXG5cdFxyXG5cdGNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiTGV2ZWwgdXA6IFwiICsgdGhpcy5sdmwgKyBcIiFcIik7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJIUCBpbmNyZWFzZWQgZnJvbSBcIiArIGhwT2xkICsgXCIgdG8gXCIgKyB0aGlzLm1IUCk7XHJcblx0Y29uc29sZS5hZGRTRk1lc3NhZ2UoXCJNYW5hIGluY3JlYXNlZCBmcm9tIFwiICsgbWFuYU9sZCArIFwiIHRvIFwiICsgdGhpcy5tTWFuYSk7XHJcblx0Ly9jb25zb2xlLmFkZFNGTWVzc2FnZShubSArIFwiIGluY3JlYXNlZCBmcm9tIFwiICsgb2xkICsgXCIgdG8gXCIgKyB0aGlzLnN0YXRzW3N0XSk7XHJcbn07XHJcblxyXG5QbGF5ZXJTdGF0cy5wcm90b3R5cGUuc2V0VmlydHVlID0gZnVuY3Rpb24odmlydHVlTmFtZSl7XHJcblx0dGhpcy52aXJ0dWUgPSB2aXJ0dWVOYW1lO1xyXG5cdHRoaXMubHZsID0gMTtcclxuXHR0aGlzLmV4cCA9IDA7XHJcblx0XHJcblx0c3dpdGNoICh2aXJ0dWVOYW1lKXtcclxuXHRcdGNhc2UgXCJIb25lc3R5XCI6XHJcblx0XHRcdHRoaXMuaHAgPSA2MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDIwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuODtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnTWFnZSc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkNvbXBhc3Npb25cIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdCYXJkJztcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlIFwiVmFsb3JcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDgwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRmlnaHRlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkhvbm9yXCI6XHJcblx0XHRcdHRoaXMuaHAgPSA3MDA7XHJcblx0XHRcdHRoaXMubWFuYSA9IDEwMDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gNDtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzInO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnUGFsYWRpbic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNwaXJpdHVhbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNzAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAxMDA7XHJcblx0XHRcdHRoaXMuc3RhdHMubWFnaWNQb3dlciA9IDY7XHJcblx0XHRcdHRoaXMuc3RhdHMuc3RyID0gJzQnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRmcyA9ICc0JztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZXggPSAwLjk1O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdSYW5nZXInO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgXCJIdW1pbGl0eVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gNjAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSAwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSAyO1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC44O1xyXG5cdFx0XHR0aGlzLmNsYXNzTmFtZSA9ICdTaGVwaGVyZCc7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIlNhY3JpZmljZVwiOlxyXG5cdFx0XHR0aGlzLmhwID0gODAwO1xyXG5cdFx0XHR0aGlzLm1hbmEgPSA1MDtcclxuXHRcdFx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyID0gMjtcclxuXHRcdFx0dGhpcy5zdGF0cy5zdHIgPSAnNCc7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGZzID0gJzYnO1xyXG5cdFx0XHR0aGlzLnN0YXRzLmRleCA9IDAuOTU7XHJcblx0XHRcdHRoaXMuY2xhc3NOYW1lID0gJ1Rpbmtlcic7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSBcIkp1c3RpY2VcIjpcclxuXHRcdFx0dGhpcy5ocCA9IDcwMDtcclxuXHRcdFx0dGhpcy5tYW5hID0gMTUwO1xyXG5cdFx0XHR0aGlzLnN0YXRzLm1hZ2ljUG93ZXIgPSA0O1xyXG5cdFx0XHR0aGlzLnN0YXRzLnN0ciA9ICcyJztcclxuXHRcdFx0dGhpcy5zdGF0cy5kZnMgPSAnMic7XHJcblx0XHRcdHRoaXMuc3RhdHMuZGV4ID0gMC45NTtcclxuXHRcdFx0dGhpcy5jbGFzc05hbWUgPSAnRHJ1aWQnO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMubUhQID0gdGhpcy5ocDtcclxuXHR0aGlzLnN0YXRzLnN0ciArPSAnRDMnO1xyXG5cdHRoaXMuc3RhdHMuZGZzICs9ICdEMyc7XHJcblx0dGhpcy5zdGF0cy5tYWdpY1Bvd2VyICs9ICdEMyc7XHJcblx0dGhpcy5tTWFuYSA9IHRoaXMubWFuYTtcclxufTtcclxuIiwiZnVuY3Rpb24gU2F2ZU1hbmFnZXIoZ2FtZSl7XHJcblx0dGhpcy5nYW1lID0gZ2FtZTtcclxuXHR0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZSgpO1xyXG59XHJcblxyXG52YXIgU3RvcmFnZSA9IHJlcXVpcmUoJy4vU3RvcmFnZScpO1xyXG5cclxuU2F2ZU1hbmFnZXIucHJvdG90eXBlID0ge1xyXG5cdHNhdmVHYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHNhdmVPYmplY3QgPSB7XHJcblx0XHRcdF9jOiBjaXJjdWxhci5yZWdpc3RlcignU3R5Z2lhbkdhbWUnKSxcclxuXHRcdFx0dmVyc2lvbjogdmVyc2lvbiwgXHJcblx0XHRcdHBsYXllcjogdGhpcy5nYW1lLnBsYXllcixcclxuXHRcdFx0aW52ZW50b3J5OiB0aGlzLmdhbWUuaW52ZW50b3J5LFxyXG5cdFx0XHRtYXBzOiB0aGlzLmdhbWUubWFwcyxcclxuXHRcdFx0Zmxvb3JEZXB0aDogdGhpcy5nYW1lLmZsb29yRGVwdGhcclxuXHRcdH07XHJcblx0XHR2YXIgc2VyaWFsaXplZCA9IGNpcmN1bGFyLnNlcmlhbGl6ZShzYXZlT2JqZWN0KTtcclxuXHRcdFxyXG5cdFx0Lyp2YXIgc2VyaWFsaXplZE9iamVjdCA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XHJcblx0XHRjb25zb2xlLmxvZyhzZXJpYWxpemVkT2JqZWN0KTtcclxuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZTogXCIrc2VyaWFsaXplZC5sZW5ndGgpOyovXHJcblx0XHRcclxuXHRcdHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdzdHlnaWFuR2FtZScsIHNlcmlhbGl6ZWQpO1xyXG5cdH0sXHJcblx0cmVzdG9yZUdhbWU6IGZ1bmN0aW9uKGdhbWUpe1xyXG5cdFx0dmFyIGdhbWVEYXRhID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ3N0eWdpYW5HYW1lJyk7XHJcblx0XHRpZiAoIWdhbWVEYXRhKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRlc2VyaWFsaXplZCA9IGNpcmN1bGFyLnBhcnNlKGdhbWVEYXRhLCBnYW1lKTtcclxuXHRcdGlmIChkZXNlcmlhbGl6ZWQudmVyc2lvbiAhPSB2ZXJzaW9uKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0Z2FtZS5wbGF5ZXIgPSBkZXNlcmlhbGl6ZWQucGxheWVyO1xyXG5cdFx0Z2FtZS5pbnZlbnRvcnkgPSBkZXNlcmlhbGl6ZWQuaW52ZW50b3J5O1xyXG5cdFx0Z2FtZS5tYXBzID0gZGVzZXJpYWxpemVkLm1hcHM7XHJcblx0XHRnYW1lLmZsb29yRGVwdGggPSBkZXNlcmlhbGl6ZWQuZmxvb3JEZXB0aDtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTYXZlTWFuYWdlcjsiLCJmdW5jdGlvbiBTZWxlY3RDbGFzcygvKkdhbWUqLyBnYW1lKXtcclxuXHR0aGlzLmdhbWUgPSBnYW1lO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdENsYXNzO1xyXG5cclxuU2VsZWN0Q2xhc3MucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5nYW1lO1xyXG5cdHZhciBwbGF5ZXJTID0gZ2FtZS5wbGF5ZXI7XHJcblx0aWYgKGdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgZ2FtZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQoKSl7XHJcblx0XHR2YXIgbW91c2UgPSBnYW1lLm1vdXNlO1xyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5tb3VzZS5iID49IDI4ICYmIGdhbWUubW91c2UuYiA8IDEwMCl7XHJcblx0XHRcdGlmIChnYW1lLm1vdXNlLmEgPD0gODgpXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIb25lc3R5XCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMTc4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiQ29tcGFzc2lvblwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDI2OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlZhbG9yXCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJKdXN0aWNlXCIpO1xyXG5cdFx0fWVsc2UgaWYgKGdhbWUubW91c2UuYiA+PSAxMDAgJiYgZ2FtZS5tb3VzZS5iIDwgMTcwKXtcclxuXHRcdFx0aWYgKGdhbWUubW91c2UuYSA8PSA4OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIlNhY3JpZmljZVwiKTtcclxuXHRcdFx0ZWxzZSBpZiAoZ2FtZS5tb3VzZS5hIDw9IDE3OClcclxuXHRcdFx0XHRwbGF5ZXJTLnNldFZpcnR1ZShcIkhvbm9yXCIpO1xyXG5cdFx0XHRlbHNlIGlmIChnYW1lLm1vdXNlLmEgPD0gMjY4KVxyXG5cdFx0XHRcdHBsYXllclMuc2V0VmlydHVlKFwiU3Bpcml0dWFsaXR5XCIpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGxheWVyUy5zZXRWaXJ0dWUoXCJIdW1pbGl0eVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHBsYXllclMudmlydHVlICE9IG51bGwpe1xyXG5cdFx0XHRnYW1lLmNyZWF0ZUluaXRpYWxJbnZlbnRvcnkocGxheWVyUy5jbGFzc05hbWUpO1xyXG5cdFx0XHRnYW1lLnByaW50R3JlZXQoKTtcclxuXHRcdFx0Z2FtZS5sb2FkTWFwKGZhbHNlLCAxKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5TZWxlY3RDbGFzcy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5zdGVwKCk7XHJcblx0XHJcblx0dmFyIHVpID0gdGhpcy5nYW1lLmdldFVJKCk7XHJcblx0dWkuZHJhd0ltYWdlKHRoaXMuZ2FtZS5pbWFnZXMuc2VsZWN0Q2xhc3MsIDAsIDApO1xyXG59O1xyXG4iLCJ2YXIgT2JqZWN0RmFjdG9yeSA9IHJlcXVpcmUoJy4vT2JqZWN0RmFjdG9yeScpO1xyXG5cclxuY2lyY3VsYXIuc2V0VHJhbnNpZW50KCdTdGFpcnMnLCAnYmlsbGJvYXJkJyk7XHJcblxyXG5jaXJjdWxhci5zZXRSZXZpdmVyKCdTdGFpcnMnLCBmdW5jdGlvbihvYmplY3QsIGdhbWUpe1xyXG5cdG9iamVjdC5iaWxsYm9hcmQgPSBPYmplY3RGYWN0b3J5LmJpbGxib2FyZCh2ZWMzKDEuMCwgMS4wLCAxLjApLCB2ZWMyKDEuMCwgMS4wKSwgZ2FtZS5HTC5jdHgpO1xyXG5cdG9iamVjdC5iaWxsYm9hcmQudGV4QnVmZmVyID0gZ2FtZS5vYmplY3RUZXguc3RhaXJzLmJ1ZmZlcnNbb2JqZWN0LmltZ0luZF07XHJcblx0b2JqZWN0LmJpbGxib2FyZC5ub1JvdGF0ZSA9IHRydWU7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gU3RhaXJzKCl7XHJcblx0dGhpcy5fYyA9IGNpcmN1bGFyLnJlZ2lzdGVyKFwiU3RhaXJzXCIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWlycztcclxuY2lyY3VsYXIucmVnaXN0ZXJDbGFzcygnU3RhaXJzJywgU3RhaXJzKTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChwb3NpdGlvbiwgbWFwTWFuYWdlciwgZGlyZWN0aW9uKXtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0dGhpcy5tYXBNYW5hZ2VyID0gbWFwTWFuYWdlcjtcclxuXHR0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHR0aGlzLnN0YWlycyA9IHRydWU7XHJcblx0XHJcblx0dGhpcy5pbWdJbmQgPSAwO1xyXG5cdFxyXG5cdHRoaXMudGFyZ2V0SWQgPSB0aGlzLm1hcE1hbmFnZXIuZGVwdGg7XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcpe1xyXG5cdFx0dGhpcy50YXJnZXRJZCAtPSAxO1xyXG5cdH1lbHNlIGlmICh0aGlzLmRpcmVjdGlvbiA9PSAnZG93bicpe1xyXG5cdFx0dGhpcy50YXJnZXRJZCArPSAxO1xyXG5cdFx0dGhpcy5pbWdJbmQgPSAxO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLCAxLjAsIDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLm1hcE1hbmFnZXIuZ2FtZS5HTC5jdHgpO1xyXG5cdHRoaXMuYmlsbGJvYXJkLnRleEJ1ZmZlciA9IHRoaXMubWFwTWFuYWdlci5nYW1lLm9iamVjdFRleC5zdGFpcnMuYnVmZmVyc1t0aGlzLmltZ0luZF07XHJcblx0dGhpcy5iaWxsYm9hcmQubm9Sb3RhdGUgPSB0cnVlO1xyXG5cdFxyXG5cdHRoaXMudGlsZSA9IG51bGw7XHJcbn1cclxuXHJcblN0YWlycy5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLnRhcmdldElkIDwgOSlcclxuXHRcdHRoaXMubWFwTWFuYWdlci5nYW1lLmxvYWRNYXAoZmFsc2UsIHRoaXMudGFyZ2V0SWQpO1xyXG5cdGVsc2Uge1xyXG5cdFx0dGhpcy5tYXBNYW5hZ2VyLmdhbWUubG9hZE1hcCgnY29kZXhSb29tJyk7XHJcblx0fVxyXG59O1xyXG5cclxuU3RhaXJzLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy50aWxlICE9IG51bGwpIHJldHVybjtcclxuXHRcclxuXHR0aGlzLnRpbGUgPSB0aGlzLm1hcE1hbmFnZXIubWFwW3RoaXMucG9zaXRpb24uYyA8PCAwXVt0aGlzLnBvc2l0aW9uLmEgPDwgMF07XHJcbn07XHJcblxyXG5TdGFpcnMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWU7XHJcblx0XHJcblx0aWYgKHRoaXMuZGlyZWN0aW9uID09ICd1cCcgJiYgdGhpcy50aWxlLmNoID4gMSl7XHJcblx0XHR2YXIgeSA9IHRoaXMucG9zaXRpb24uYiA8PCAwO1xyXG5cdFx0Zm9yICh2YXIgaT15KzE7aTx0aGlzLnRpbGUuY2g7aSsrKXtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0cG9zLmIgPSBpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzJdO1xyXG5cdFx0XHRnYW1lLmRyYXdCaWxsYm9hcmQocG9zLCdzdGFpcnMnLHRoaXMuYmlsbGJvYXJkKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5iaWxsYm9hcmQudGV4QnVmZmVyID0gdGhpcy5tYXBNYW5hZ2VyLmdhbWUub2JqZWN0VGV4LnN0YWlycy5idWZmZXJzWzNdO1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1lbHNle1xyXG5cdFx0Z2FtZS5kcmF3QmlsbGJvYXJkKHRoaXMucG9zaXRpb24sJ3N0YWlycycsdGhpcy5iaWxsYm9hcmQpO1xyXG5cdH1cclxufTtcclxuXHJcblN0YWlycy5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5nZXRUaWxlKCk7XHJcblx0dGhpcy5kcmF3KCk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIFN0b3JhZ2UoKXtcclxuXHQgdHJ5IHtcclxuXHRcdCBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnX190ZXN0JywgJ3Rlc3QnKTtcclxuXHRcdCBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX190ZXN0Jyk7XHJcblx0XHQgdGhpcy5lbmFibGVkID0gdHJ1ZTtcclxuXHQgfSBjYXRjaChlKSB7XHJcblx0XHQgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcblx0IH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuXHJcblN0b3JhZ2UucHJvdG90eXBlID0ge1xyXG5cdHNldEl0ZW06IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcclxuXHR9LFxyXG5cdHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGtleSl7XHJcblx0XHRpZiAoIXRoaXMuZW5hYmxlZCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcblx0fSxcclxuXHRnZXRJdGVtOiBmdW5jdGlvbihrZXkpe1xyXG5cdFx0aWYgKCF0aGlzLmVuYWJsZWQpe1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xyXG5cdH1cclxufVxyXG4gXHJcbiIsInZhciBTZWxlY3RDbGFzcyA9IHJlcXVpcmUoJy4vU2VsZWN0Q2xhc3MnKTtcclxuXHJcbmZ1bmN0aW9uIFRpdGxlU2NyZWVuKC8qR2FtZSovIGdhbWUpe1xyXG5cdHRoaXMuZ2FtZSA9IGdhbWU7XHJcblx0dGhpcy5ibGluayA9IDMwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpdGxlU2NyZWVuO1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLmdhbWUuZ2V0S2V5UHJlc3NlZCgxMykgfHwgdGhpcy5nYW1lLmdldE1vdXNlQnV0dG9uUHJlc3NlZCgpKXtcclxuXHRcdGlmICh0aGlzLmdhbWUuc2F2ZU1hbmFnZXIucmVzdG9yZUdhbWUodGhpcy5nYW1lKSl7XHJcblx0XHRcdHRoaXMuZ2FtZS5wcmludFdlbGNvbWVCYWNrKCk7XHJcblx0XHRcdHRoaXMuZ2FtZS5sb2FkTWFwKHRoaXMuZ2FtZS5wbGF5ZXIuY3VycmVudE1hcCwgdGhpcy5nYW1lLnBsYXllci5jdXJyZW50RGVwdGgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5nYW1lLnNjZW5lID0gbmV3IFNlbGVjdENsYXNzKHRoaXMuZ2FtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuVGl0bGVTY3JlZW4ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc3RlcCgpO1xyXG5cdHZhciB1aSA9IHRoaXMuZ2FtZS5nZXRVSSgpO1xyXG5cdHVpLmRyYXdJbWFnZSh0aGlzLmdhbWUuaW1hZ2VzLnRpdGxlU2NyZWVuLCAwLCAwKTtcclxufTtcclxuIiwiZnVuY3Rpb24gVUkoc2l6ZSwgY29udGFpbmVyKXtcclxuXHR0aGlzLmluaXRDYW52YXMoc2l6ZSwgY29udGFpbmVyKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTtcclxuXHJcblVJLnByb3RvdHlwZS5pbml0Q2FudmFzID0gZnVuY3Rpb24oc2l6ZSwgY29udGFpbmVyKXtcclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRjYW52YXMud2lkdGggPSBzaXplLmE7XHJcblx0Y2FudmFzLmhlaWdodCA9IHNpemUuYjtcclxuXHRcclxuXHRjYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcblx0Y2FudmFzLnN0eWxlLnRvcCA9IDA7XHJcblx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cdFxyXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdHRoaXMuY3R4LndpZHRoID0gY2FudmFzLndpZHRoO1xyXG5cdHRoaXMuY3R4LmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcblx0dGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblx0XHJcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHRcclxuXHR0aGlzLnNjYWxlID0gY2FudmFzLm9mZnNldEhlaWdodCAvIHNpemUuYjtcclxuXHRcclxuXHRjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrID0gY2FudmFzLnJlcXVlc3RQb2ludGVyTG9jayB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLm1velJlcXVlc3RQb2ludGVyTG9jayB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLndlYmtpdFJlcXVlc3RQb2ludGVyTG9jaztcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3U3ByaXRlID0gZnVuY3Rpb24oc3ByaXRlLCB4LCB5LCBzdWJJbWFnZSl7XHJcblx0dmFyIHhJbWcgPSBzdWJJbWFnZSAlIHNwcml0ZS5pbWdOdW07XHJcblx0dmFyIHlJbWcgPSAoc3ViSW1hZ2UgLyBzcHJpdGUuaW1nTnVtKSA8PCAwO1xyXG5cdFxyXG5cdHRoaXMuY3R4LmRyYXdJbWFnZShzcHJpdGUsXHJcblx0XHR4SW1nICogc3ByaXRlLmltZ1dpZHRoLCB5SW1nICogc3ByaXRlLmltZ0hlaWdodCwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0LFxyXG5cdFx0eCwgeSwgc3ByaXRlLmltZ1dpZHRoLCBzcHJpdGUuaW1nSGVpZ2h0XHJcblx0XHQpO1xyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmRyYXdTcHJpdGVFeHQgPSBmdW5jdGlvbihzcHJpdGUsIHgsIHksIHN1YkltYWdlLCBpbWFnZUFuZ2xlKXtcclxuXHR2YXIgeEltZyA9IHN1YkltYWdlICUgc3ByaXRlLmltZ051bTtcclxuXHR2YXIgeUltZyA9IChzdWJJbWFnZSAvIHNwcml0ZS5pbWdOdW0pIDw8IDA7XHJcblx0XHJcblx0dGhpcy5jdHguc2F2ZSgpO1xyXG5cdHRoaXMuY3R4LnRyYW5zbGF0ZSh4K3Nwcml0ZS54T3JpZywgeStzcHJpdGUueU9yaWcpO1xyXG5cdHRoaXMuY3R4LnJvdGF0ZShpbWFnZUFuZ2xlKTtcclxuXHRcclxuXHR0aGlzLmN0eC5kcmF3SW1hZ2Uoc3ByaXRlLFxyXG5cdFx0eEltZyAqIHNwcml0ZS5pbWdXaWR0aCwgeUltZyAqIHNwcml0ZS5pbWdIZWlnaHQsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodCxcclxuXHRcdC1zcHJpdGUueE9yaWcsIC1zcHJpdGUueU9yaWcsIHNwcml0ZS5pbWdXaWR0aCwgc3ByaXRlLmltZ0hlaWdodFxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdHRoaXMuY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcblVJLnByb3RvdHlwZS5kcmF3VGV4dCA9IGZ1bmN0aW9uKHRleHQsIHgsIHksIGNvbnNvbGUpe1xyXG5cdHZhciB3ID0gY29uc29sZS5zcGFjZUNoYXJzO1xyXG5cdHZhciBoID0gY29uc29sZS5zcHJpdGVGb250LmhlaWdodDtcclxuXHRmb3IgKHZhciBqPTAsamxlbj10ZXh0Lmxlbmd0aDtqPGpsZW47aisrKXtcclxuXHRcdHZhciBjaGFyYSA9IHRleHQuY2hhckF0KGopO1xyXG5cdFx0dmFyIGluZCA9IGNvbnNvbGUubGlzdE9mQ2hhcnMuaW5kZXhPZihjaGFyYSk7XHJcblx0XHRpZiAoaW5kICE9IC0xKXtcclxuXHRcdFx0dGhpcy5jdHguZHJhd0ltYWdlKGNvbnNvbGUuc3ByaXRlRm9udCxcclxuXHRcdFx0XHR3ICogaW5kLCAxLCB3LCBoIC0gMSxcclxuXHRcdFx0XHR4LCB5LCB3LCBoIC0gMSk7XHJcblx0XHR9XHJcblx0XHR4ICs9IHc7XHJcblx0fVxyXG59O1xyXG5cclxuVUkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbn07IiwidmFyIEFuaW1hdGVkVGV4dHVyZSA9IHJlcXVpcmUoJy4vQW5pbWF0ZWRUZXh0dXJlJyk7XHJcbnZhciBBdWRpb0FQSSA9IHJlcXVpcmUoJy4vQXVkaW8nKTtcclxudmFyIENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcclxudmFyIEludmVudG9yeSA9IHJlcXVpcmUoJy4vSW52ZW50b3J5Jyk7XHJcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XHJcbnZhciBJdGVtRmFjdG9yeSA9IHJlcXVpcmUoJy4vSXRlbUZhY3RvcnknKTtcclxudmFyIE1hcE1hbmFnZXIgPSByZXF1aXJlKCcuL01hcE1hbmFnZXInKTtcclxudmFyIE1pc3NpbGUgPSByZXF1aXJlKCcuL01pc3NpbGUnKTtcclxudmFyIE9iamVjdEZhY3RvcnkgPSByZXF1aXJlKCcuL09iamVjdEZhY3RvcnknKTtcclxudmFyIFBsYXllclN0YXRzID0gcmVxdWlyZSgnLi9QbGF5ZXJTdGF0cycpO1xyXG52YXIgU2F2ZU1hbmFnZXIgPSByZXF1aXJlKCcuL1NhdmVNYW5hZ2VyJyk7XHJcbnZhciBUaXRsZVNjcmVlbiA9IHJlcXVpcmUoJy4vVGl0bGVTY3JlZW4nKTtcclxudmFyIFVJID0gcmVxdWlyZSgnLi9VSScpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbnZhciBXZWJHTCA9IHJlcXVpcmUoJy4vV2ViR0wnKTtcclxuXHJcbi8qPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblx0XHRcdFx0IDdEUkwxNSBTb3VyY2UgQ29kZVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRCeSBDYW1pbG8gUmFtw61yZXogKEp1Y2FyYXZlKVxyXG5cdFx0XHRcclxuXHRcdFx0XHRcdCAgMjAxNVxyXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuZnVuY3Rpb24gVW5kZXJ3b3JsZCgpe1xyXG5cdHRoaXMuc2l6ZSA9IHZlYzIoMzU1LCAyMDApO1xyXG5cdFxyXG5cdHRoaXMuR0wgPSBuZXcgV2ViR0wodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuVUkgPSBuZXcgVUkodGhpcy5zaXplLCBVdGlscy4kJChcImRpdkdhbWVcIikpO1xyXG5cdHRoaXMuYXVkaW8gPSBuZXcgQXVkaW9BUEkoKTtcclxuXHRcclxuXHR0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXJTdGF0cygpO1xyXG5cdHRoaXMuaW52ZW50b3J5ID0gbmV3IEludmVudG9yeSgxMCk7XHJcblx0dGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUoMTAsIDEwLCAzMDAsIHRoaXMpO1xyXG5cdHRoaXMuc2F2ZU1hbmFnZXIgPSBuZXcgU2F2ZU1hbmFnZXIodGhpcyk7XHJcblx0dGhpcy5mb250ID0gJzEwcHggXCJDb3VyaWVyXCInO1xyXG5cdFxyXG5cdHRoaXMuZ3JQYWNrID0gJ2ltZy8nO1xyXG5cdFxyXG5cdHRoaXMuc2NlbmUgPSBudWxsO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLm1hcHMgPSBbXTtcclxuXHR0aGlzLmtleXMgPSBbXTtcclxuXHR0aGlzLm1vdXNlID0gdmVjMygwLjAsIDAuMCwgMCk7XHJcblx0dGhpcy5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHR0aGlzLmltYWdlcyA9IHt9O1xyXG5cdHRoaXMubXVzaWMgPSB7fTtcclxuXHR0aGlzLnNvdW5kcyA9IHt9O1xyXG5cdHRoaXMudGV4dHVyZXMgPSB7d2FsbDogW10sIGZsb29yOiBbXSwgY2VpbDogW119O1xyXG5cdHRoaXMub2JqZWN0VGV4ID0ge307XHJcblx0dGhpcy5tb2RlbHMgPSB7fTtcclxuXHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnRpbWVTdG9wID0gMDtcclxuXHR0aGlzLnByb3RlY3Rpb24gPSAwO1xyXG5cdFxyXG5cdHRoaXMuZnBzID0gKDEwMDAgLyAzMCkgPDwgMDtcclxuXHR0aGlzLmxhc3RUID0gMDtcclxuXHR0aGlzLm51bWJlckZyYW1lcyA9IDA7XHJcblx0dGhpcy5maXJzdEZyYW1lID0gRGF0ZS5ub3coKTtcclxuXHRcclxuXHR0aGlzLmxvYWRJbWFnZXMoKTtcclxuXHR0aGlzLmxvYWRNdXNpYygpO1xyXG5cdHRoaXMubG9hZFRleHR1cmVzKCk7XHJcblx0XHJcblx0dGhpcy5jcmVhdGUzRE9iamVjdHMoKTtcclxuXHRBbmltYXRlZFRleHR1cmUuaW5pdCh0aGlzLkdMLmN0eCk7XHJcbn1cclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmNyZWF0ZTNET2JqZWN0cyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5kb29yID0gT2JqZWN0RmFjdG9yeS5kb29yKHZlYzMoMC41LDAuNzUsMC4xKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgsIGZhbHNlKTtcclxuXHR0aGlzLmRvb3JXID0gT2JqZWN0RmFjdG9yeS5kb29yV2FsbCh2ZWMzKDEuMCwxLjAsMS4wKSwgdmVjMigxLjAsMS4wKSwgdGhpcy5HTC5jdHgpO1xyXG5cdHRoaXMuZG9vckMgPSBPYmplY3RGYWN0b3J5LmN1YmUodmVjMygxLjAsMS4wLDAuMSksIHZlYzIoMS4wLDEuMCksIHRoaXMuR0wuY3R4LCB0cnVlKTtcclxuXHRcclxuXHR0aGlzLmJpbGxib2FyZCA9IE9iamVjdEZhY3RvcnkuYmlsbGJvYXJkKHZlYzMoMS4wLDEuMCwwLjApLCB2ZWMyKDEuMCwxLjApLCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0dGhpcy5zbG9wZSA9IE9iamVjdEZhY3Rvcnkuc2xvcGUodmVjMygxLjAsMS4wLDEuMCksIHZlYzIoMS4wLCAxLjApLCB0aGlzLkdMLmN0eCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTXVzaWMgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuc291bmRzLmhpdCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJ3YXYvaGl0Lndhdj92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuc291bmRzLm1pc3MgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwid2F2L21pc3Mud2F2P3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDhfLV9VbHRpbWFfNF8tX0M2NF8tX0R1bmdlb25zLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkTXVzaWNQb3N0ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm11c2ljLmR1bmdlb24yID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMl8tX1VsdGltYV81Xy1fQzY0Xy1fTG9yZF9CbGFja3Rob3JuLm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uMyA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDVfLV9VbHRpbWFfM18tX0M2NF8tX0NvbWJhdC5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjQgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA3Xy1fVWx0aW1hXzNfLV9DNjRfLV9FeG9kdXMnX0Nhc3RsZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjUgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzA0Xy1fVWx0aW1hXzVfLV9DNjRfLV9FbmdhZ2VtZW50X2FuZF9NZWxlZS5vZ2c/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUpO1xyXG5cdHRoaXMubXVzaWMuZHVuZ2VvbjYgPSB0aGlzLmF1ZGlvLmxvYWRBdWRpbyhjcCArIFwib2dnLzAzXy1fVWx0aW1hXzRfLV9DNjRfLV9Mb3JkX0JyaXRpc2gnc19DYXN0bGUub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmR1bmdlb243ID0gdGhpcy5hdWRpby5sb2FkQXVkaW8oY3AgKyBcIm9nZy8xMV8tX1VsdGltYV81Xy1fQzY0Xy1fV29ybGRzX0JlbG93Lm9nZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSk7XHJcblx0dGhpcy5tdXNpYy5kdW5nZW9uOCA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMTBfLV9VbHRpbWFfNV8tX0M2NF8tX0hhbGxzX29mX0Rvb20ub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxuXHR0aGlzLm11c2ljLmNvZGV4Um9vbSA9IHRoaXMuYXVkaW8ubG9hZEF1ZGlvKGNwICsgXCJvZ2cvMDdfLV9VbHRpbWFfNF8tX0M2NF8tX1NocmluZXMub2dnP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlKTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubG9hZEltYWdlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbWFnZXMuaXRlbXNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpdGVtc1VJLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDgsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5zcGVsbHNfdWkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzcGVsbHNVSS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlLCAwLCAwLCB7aW1nTnVtOiA0LCBpbWdWTnVtOiA0fSk7XHJcblx0dGhpcy5pbWFnZXMudGl0bGVTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0aXRsZVNjcmVlbi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5lbmRpbmdTY3JlZW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmRpbmcucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSk7XHJcblx0dGhpcy5pbWFnZXMuc2VsZWN0Q2xhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJzZWxlY3RDbGFzcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnkgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogMSwgaW1nVk51bTogMn0pO1xyXG5cdHRoaXMuaW1hZ2VzLmludmVudG9yeURyb3AgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJpbnZlbnRvcnlEcm9wLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UsIDAsIDAsIHtpbWdOdW06IDEsIGltZ1ZOdW06IDJ9KTtcclxuXHR0aGlzLmltYWdlcy5pbnZlbnRvcnlTZWxlY3RlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImludmVudG9yeV9zZWxlY3RlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy5zY3JvbGxGb250ID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwic2Nyb2xsRm9udFdoaXRlLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnJlc3RhcnQgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyZXN0YXJ0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgZmFsc2UpO1xyXG5cdHRoaXMuaW1hZ2VzLnBhdXNlZCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInBhdXNlZC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIGZhbHNlKTtcclxuXHR0aGlzLmltYWdlcy52aWV3cG9ydFdlYXBvbnMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ2aWV3cG9ydFdlYXBvbnMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge2ltZ051bTogNCwgaW1nVk51bTogNH0pO1xyXG5cdHRoaXMuaW1hZ2VzLmNvbXBhc3MgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjb21wYXNzVUkucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCBmYWxzZSwgMCwgMCwge3hPcmlnOiAxMSwgeU9yaWc6IDExLCBpbWdOdW06IDIsIGltZ1ZOdW06IDF9KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRUZXh0dXJlcyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy50ZXh0dXJlcyA9IHt3YWxsOiBbbnVsbF0sIGZsb29yOiBbbnVsbF0sIGNlaWw6IFtudWxsXSwgd2F0ZXI6IFtudWxsXX07XHJcblx0XHJcblx0Ly8gTm8gVGV4dHVyZVxyXG5cdHZhciBub1RleCA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcIm5vVGV4dHVyZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKG5vVGV4KTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2gobm9UZXgpO1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKG5vVGV4KTtcclxuXHRcclxuXHQvLyBXYWxsc1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleFdhbGwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYWxsMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGwxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbVdhbGw0LnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2FsbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInJvb21XYWxsNS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLndhbGwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJyb29tV2FsbDYucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA4LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YWxsLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuV2FsbDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA5LCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gRmxvb3JzXHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDIucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAyLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEZsb29yMDMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiY2F2ZXJuRmxvb3IyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMuZmxvb3IucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5GbG9vcjMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA2LCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImNhdmVybkZsb29yNC5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmZsb29yLnB1c2godGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwicm9vbUZsb29yMy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKSk7XHJcblx0XHJcblx0dGhpcy50ZXh0dXJlcy5mbG9vcls1MF0gPSAodGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4SG9sZS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDUwLCB0cnVlKSk7XHJcblx0XHJcblx0Ly8gTGlxdWlkc1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAxLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhXYXRlcjAyLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSkpO1xyXG5cdHRoaXMudGV4dHVyZXMud2F0ZXIucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhMYXZhMDEucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAzLCB0cnVlKSk7XHJcblx0dGhpcy50ZXh0dXJlcy53YXRlci5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleExhdmEwMi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpKTtcclxuXHRcclxuXHQvLyBDZWlsaW5nc1xyXG5cdHRoaXMudGV4dHVyZXMuY2VpbC5wdXNoKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleENlaWwwMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWwucHVzaCh0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJjYXZlcm5XYWxsMS5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDIsIHRydWUpKTtcclxuXHR0aGlzLnRleHR1cmVzLmNlaWxbNTBdID0gKHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEhvbGUucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1MCwgdHJ1ZSkpO1xyXG5cdFxyXG5cdC8vIEl0ZW1zXHJcblx0dGhpcy5vYmplY3RUZXguaXRlbXMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhJdGVtcy5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lml0ZW1zLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg4LCA0LCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0dGhpcy5vYmplY3RUZXguc3BlbGxzID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwidGV4U3BlbGxzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3BlbGxzLmJ1ZmZlcnMgPSBBbmltYXRlZFRleHR1cmUuZ2V0VGV4dHVyZUJ1ZmZlckNvb3Jkcyg0LCA0LCB0aGlzLkdMLmN0eCk7XHJcblx0XHJcblx0Ly8gTWFnaWMgQm9sdHNcclxuXHR0aGlzLm9iamVjdFRleC5ib2x0cyA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcInRleEJvbHRzLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguYm9sdHMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDQsIDIsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHQvLyBTdGFpcnNcclxuXHR0aGlzLm9iamVjdFRleC5zdGFpcnMgPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJ0ZXhTdGFpcnMucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5zdGFpcnMuYnVmZmVycyA9IEFuaW1hdGVkVGV4dHVyZS5nZXRUZXh0dXJlQnVmZmVyQ29vcmRzKDIsIDIsIHRoaXMuR0wuY3R4KTtcclxuXHRcclxuXHQvLyBFbmVtaWVzXHJcblx0dGhpcy5vYmplY3RUZXguYmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4QmF0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMSwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmF0X3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmF0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMiwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc3BpZGVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4U3BpZGVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMywgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgudHJvbGxfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhUcm9sbFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDQsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmdhemVyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R2F6ZXJSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCA1LCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5naG9zdF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleEdob3N0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgNiwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguaGVhZGxlc3NfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhIZWFkbGVzc1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDcsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm9yY19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE9yY1J1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDgsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnJlYXBlcl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFJlYXBlclJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDksIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LnNrZWxldG9uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4U2tlbGV0b25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0XHJcblx0dGhpcy5vYmplY3RUZXguZGFlbW9uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4RGFlbW9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lm1vbmdiYXRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhNb25nYmF0UnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4Lmh5ZHJhX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4SHlkcmFSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguc2VhU2VycGVudF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFNlYVNlcnBlbnRSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgub2N0b3B1c19ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE9jdG9wdXNSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguYmFscm9uX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4QmFscm9uUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmxpY2hlX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4TGljaGVSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguZ2hvc3RfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhHaG9zdFJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5ncmVtbGluX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4R3JlbWxpblJ1bi5wbmc/dmVyc2lvbj1cIiArIHZlcnNpb24sIHRydWUsIDEwLCB0cnVlKTtcclxuXHR0aGlzLm9iamVjdFRleC5kcmFnb25fcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhEcmFnb25SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXguem9ybl9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFpvcm5SdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0XHJcblx0dGhpcy5vYmplY3RUZXgud2lzcF9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleFdpc3BSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgubWFnZV9ydW4gPSB0aGlzLkdMLmxvYWRJbWFnZShjcCArIHRoaXMuZ3JQYWNrICsgXCJlbmVtaWVzL3RleE1hZ2VSdW4ucG5nP3ZlcnNpb249XCIgKyB2ZXJzaW9uLCB0cnVlLCAxMCwgdHJ1ZSk7XHJcblx0dGhpcy5vYmplY3RUZXgucmFuZ2VyX3J1biA9IHRoaXMuR0wubG9hZEltYWdlKGNwICsgdGhpcy5nclBhY2sgKyBcImVuZW1pZXMvdGV4UmFuZ2VyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmZpZ2h0ZXJfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhGaWdodGVyUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmJhcmRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhCYXJkUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG5cdHRoaXMub2JqZWN0VGV4LmxhdmFMaXphcmRfcnVuID0gdGhpcy5HTC5sb2FkSW1hZ2UoY3AgKyB0aGlzLmdyUGFjayArIFwiZW5lbWllcy90ZXhMYXZhTGl6YXJkUnVuLnBuZz92ZXJzaW9uPVwiICsgdmVyc2lvbiwgdHJ1ZSwgMTAsIHRydWUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUucG9zdExvYWRpbmcgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMuY29uc29sZS5jcmVhdGVTcHJpdGVGb250KHRoaXMuaW1hZ2VzLnNjcm9sbEZvbnQsIFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODkhPywuL1wiLCA3KTtcclxuXHR0aGlzLmxvYWRNdXNpY1Bvc3QoKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnN0b3BNdXNpYyA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5hdWRpby5zdG9wTXVzaWMoKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLnBsYXlNdXNpYyA9IGZ1bmN0aW9uKG11c2ljQ29kZSwgbG9vcCl7XHJcblx0dmFyIGF1ZGlvRiA9IHRoaXMubXVzaWNbbXVzaWNDb2RlXTtcclxuXHRpZiAoIWF1ZGlvRikgcmV0dXJuIG51bGw7XHJcblx0dGhpcy5zdG9wTXVzaWMoKTtcclxuXHR0aGlzLmF1ZGlvLnBsYXlTb3VuZChhdWRpb0YsIGxvb3AsIHRydWUsIDAuMik7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wbGF5U291bmQgPSBmdW5jdGlvbihzb3VuZENvZGUpe1xyXG5cdHZhciBhdWRpb0YgPSB0aGlzLnNvdW5kc1tzb3VuZENvZGVdO1xyXG5cdGlmICghYXVkaW9GKSByZXR1cm4gbnVsbDtcclxuXHR0aGlzLmF1ZGlvLnBsYXlTb3VuZChhdWRpb0YsIGZhbHNlLCBmYWxzZSwgMC4zKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldFVJID0gZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4gdGhpcy5VSS5jdHg7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRUZXh0dXJlQnlJZCA9IGZ1bmN0aW9uKHRleHR1cmVJZCwgdHlwZSl7XHJcblx0aWYgKCF0aGlzLnRleHR1cmVzW3R5cGVdW3RleHR1cmVJZF0pIHRleHR1cmVJZCA9IDE7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMudGV4dHVyZXNbdHlwZV1bdGV4dHVyZUlkXTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE9iamVjdFRleHR1cmUgPSBmdW5jdGlvbih0ZXh0dXJlQ29kZSl7XHJcblx0aWYgKCF0aGlzLm9iamVjdFRleFt0ZXh0dXJlQ29kZV0pIHRocm93IFwiSW52YWxpZCB0ZXh0dXJlIGNvZGU6IFwiICsgdGV4dHVyZUNvZGU7XHJcblx0XHJcblx0cmV0dXJuIHRoaXMub2JqZWN0VGV4W3RleHR1cmVDb2RlXTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbihtYXAsIGRlcHRoKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0aWYgKGRlcHRoID09PSB1bmRlZmluZWQgfHwgIWdhbWUubWFwc1tkZXB0aCAtIDFdKXtcclxuXHRcdGdhbWUubWFwID0gbmV3IE1hcE1hbmFnZXIoKTtcclxuXHRcdGdhbWUubWFwLmluaXQoZ2FtZSwgbWFwLCBkZXB0aCk7XHJcblx0XHRnYW1lLmZsb29yRGVwdGggPSBkZXB0aDtcclxuXHRcdGdhbWUubWFwcy5wdXNoKGdhbWUubWFwKTtcclxuXHR9ZWxzZSBpZiAoZ2FtZS5tYXBzW2RlcHRoIC0gMV0pe1xyXG5cdFx0Z2FtZS5tYXAgPSBnYW1lLm1hcHNbZGVwdGggLSAxXTtcclxuXHR9XHJcblx0Z2FtZS5zY2VuZSA9IG51bGw7XHJcblx0aWYgKGRlcHRoKVxyXG5cdFx0Z2FtZS5wbGF5TXVzaWMoJ2R1bmdlb24nK2RlcHRoLCB0cnVlKTtcclxuXHRlbHNlIGlmIChtYXAgPT09ICdjb2RleFJvb20nKVxyXG5cdFx0Z2FtZS5wbGF5TXVzaWMoJ2NvZGV4Um9vbScsIHRydWUpO1xyXG5cdGdhbWUucGxheWVyLmN1cnJlbnRNYXAgPSBtYXA7XHJcblx0Z2FtZS5wbGF5ZXIuY3VycmVudERlcHRoID0gZGVwdGg7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wcmludEdyZWV0ID0gZnVuY3Rpb24oKXtcclxuXHQvLyBTaG93cyBhIHdlbGNvbWUgbWVzc2FnZSB3aXRoIHRoZSBnYW1lIGluc3RydWN0aW9ucy5cclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiWW91IGVudGVyIHRoZSBsZWdlbmRhcnkgU3R5Z2lhbiBBYnlzcy5cIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlVzZSBRLVctRSB0byBtb3ZlIGZvcndhcmQsIEEtUy1EIHRvIHN0cmFmZSBhbmQgc3RlcCBiYWNrXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJQcmVzcyBTcGFjZSBiYXIgdG8gaW50ZXJhY3QgYW5kIEVudGVyIHRvIGF0dGFja1wiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiUHJlc3MgVCB0byBkcm9wIG9iamVjdHNcIik7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5wcmludFdlbGNvbWVCYWNrID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiXCIpO1xyXG5cdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJcIik7XHJcblx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlwiKTtcclxuXHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiWW91IHdha2UgdXAuXCIpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUubmV3R2FtZSA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5pbnZlbnRvcnkucmVzZXQoKTtcclxuXHR0aGlzLnBsYXllci5yZXNldCgpO1xyXG5cdFxyXG5cdHRoaXMubWFwcyA9IFtdO1xyXG5cdHRoaXMubWFwID0gbnVsbDtcclxuXHR0aGlzLnNjZW5lID0gbnVsbDtcclxuXHR0aGlzLmNvbnNvbGUubWVzc2FnZXMgPSBbXTtcdFxyXG5cdHRoaXMuc2NlbmUgPSBuZXcgVGl0bGVTY3JlZW4odGhpcyk7XHJcblx0dGhpcy5sb29wKCk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb2FkR2FtZSA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdFxyXG5cdGlmIChnYW1lLkdMLmFyZUltYWdlc1JlYWR5KCkgJiYgZ2FtZS5hdWRpby5hcmVTb3VuZHNSZWFkeSgpKXtcclxuXHRcdGdhbWUucG9zdExvYWRpbmcoKTtcclxuXHRcdGdhbWUubmV3R2FtZSgpO1xyXG5cdH1lbHNle1xyXG5cdFx0cmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbigpeyBnYW1lLmxvYWRHYW1lKCk7IH0pO1xyXG5cdH1cclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcclxuXHRyZXR1cm4gdGhpcy5pbnZlbnRvcnkuYWRkSXRlbShpdGVtKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIHRleHR1cmUpe1xyXG5cdHZhciBjYW1lcmEgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dGhpcy5HTC5kcmF3T2JqZWN0KG9iamVjdCwgY2FtZXJhLCB0ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdCbG9jayA9IGZ1bmN0aW9uKGJsb2NrT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGNhbWVyYSA9IHRoaXMubWFwLnBsYXllcjtcclxuXHRcclxuXHR0aGlzLkdMLmRyYXdPYmplY3QoYmxvY2tPYmplY3QsIGNhbWVyYSwgdGhpcy5nZXRUZXh0dXJlQnlJZCh0ZXhJZCwgXCJ3YWxsXCIpLnRleHR1cmUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJhd0Rvb3JXYWxsID0gZnVuY3Rpb24oeCwgeSwgeiwgdGV4SWQsIHZlcnRpY2FsKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3JXLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuXHRpZiAodmVydGljYWwpIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsTWF0aC5QSV8yLDApOyBlbHNlIGdhbWUuZG9vclcucm90YXRpb24uc2V0KDAsMCwwKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoZ2FtZS5kb29yVywgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBcIndhbGxcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3RG9vckN1YmUgPSBmdW5jdGlvbih4LCB5LCB6LCB0ZXhJZCwgdmVydGljYWwpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdFxyXG5cdGdhbWUuZG9vckMucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGlmICh2ZXJ0aWNhbCkgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCxNYXRoLlBJXzIsMCk7IGVsc2UgZ2FtZS5kb29yQy5yb3RhdGlvbi5zZXQoMCwwLDApO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChnYW1lLmRvb3JDLCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwid2FsbFwiKS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdEb29yID0gZnVuY3Rpb24oeCwgeSwgeiwgcm90YXRpb24sIHRleElkKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0dmFyIGNhbWVyYSA9IGdhbWUubWFwLnBsYXllcjtcclxuXHRcclxuXHRnYW1lLmRvb3IucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG5cdGdhbWUuZG9vci5yb3RhdGlvbi5iID0gcm90YXRpb247XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KGdhbWUuZG9vciwgY2FtZXJhLCBnYW1lLm9iamVjdFRleFt0ZXhJZF0udGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3Rmxvb3IgPSBmdW5jdGlvbihmbG9vck9iamVjdCwgdGV4SWQsIHR5cGVPZil7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0dmFyIGZ0ID0gdHlwZU9mO1xyXG5cdGdhbWUuR0wuZHJhd09iamVjdChmbG9vck9iamVjdCwgY2FtZXJhLCBnYW1lLmdldFRleHR1cmVCeUlkKHRleElkLCBmdCkudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3QmlsbGJvYXJkID0gZnVuY3Rpb24ocG9zaXRpb24sIHRleElkLCBiaWxsYm9hcmQpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgY2FtZXJhID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdGlmICghYmlsbGJvYXJkKSBiaWxsYm9hcmQgPSBnYW1lLmJpbGxib2FyZDtcclxuXHRcclxuXHRiaWxsYm9hcmQucG9zaXRpb24uc2V0KHBvc2l0aW9uKTtcclxuXHRnYW1lLkdMLmRyYXdPYmplY3QoYmlsbGJvYXJkLCBjYW1lcmEsIGdhbWUub2JqZWN0VGV4W3RleElkXS50ZXh0dXJlKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmRyYXdTbG9wZSA9IGZ1bmN0aW9uKHNsb3BlT2JqZWN0LCB0ZXhJZCl7XHJcblx0dmFyIGdhbWUgPSB0aGlzO1xyXG5cdHZhciBjYW1lcmEgPSBnYW1lLm1hcC5wbGF5ZXI7XHJcblx0XHJcblx0Z2FtZS5HTC5kcmF3T2JqZWN0KHNsb3BlT2JqZWN0LCBjYW1lcmEsIGdhbWUuZ2V0VGV4dHVyZUJ5SWQodGV4SWQsIFwiZmxvb3JcIikudGV4dHVyZSk7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5kcmF3VUkgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gdGhpcztcclxuXHR2YXIgcGxheWVyID0gZ2FtZS5tYXAucGxheWVyO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdGlmICghcGxheWVyKSByZXR1cm47XHJcblx0XHJcblx0dmFyIGN0eCA9IGdhbWUuVUkuY3R4O1xyXG5cdFxyXG5cdC8vIERyYXcgaGVhbHRoIGJhclxyXG5cdHZhciBocCA9IHBzLmhwIC8gcHMubUhQO1xyXG5cdGN0eC5maWxsU3R5bGUgPSAocHMucG9pc29uZWQpPyBcInJnYigxMjIsMCwxMjIpXCIgOiBcInJnYigxMjIsMCwwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDgsNzUsNCk7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IChwcy5wb2lzb25lZCk/IFwicmdiKDIwMCwwLDIwMClcIiA6IFwicmdiKDIwMCwwLDApXCI7XHJcblx0Y3R4LmZpbGxSZWN0KDgsOCwoNzUgKiBocCkgPDwgMCw0KTtcclxuXHRcclxuXHQvLyBEcmF3IG1hbmFcclxuXHR2YXIgbWFuYSA9IHBzLm1hbmEgLyBwcy5tTWFuYTtcclxuXHRjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTgxLDk4LDIwKVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LDYwLDIpO1xyXG5cdGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsMTM4LDI4KVwiO1xyXG5cdGN0eC5maWxsUmVjdCg4LDE2LCg2MCAqIG1hbmEpIDw8IDAsMik7XHJcblx0XHJcblx0Ly8gRHJhdyBJbnZlbnRvcnlcclxuXHRpZiAodGhpcy5zZXREcm9wSXRlbSlcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnlEcm9wLCA5MCwgNiwgMCk7XHJcblx0ZWxzZVxyXG5cdFx0dGhpcy5VSS5kcmF3U3ByaXRlKHRoaXMuaW1hZ2VzLmludmVudG9yeSwgOTAsIDYsIDApO1xyXG5cdFxyXG5cdGZvciAodmFyIGk9MCxsZW49dGhpcy5pbnZlbnRvcnkuaXRlbXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdFx0dmFyIHNwciA9IGl0ZW0udGV4ICsgJ191aSc7XHJcblxyXG5cdFx0aWYgKCF0aGlzLnNldERyb3BJdGVtICYmIChpdGVtLnR5cGUgPT0gJ3dlYXBvbicgfHwgaXRlbS50eXBlID09ICdhcm1vdXInKSAmJiBpdGVtLmVxdWlwcGVkKVxyXG5cdFx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMuaW52ZW50b3J5U2VsZWN0ZWQsIDkwICsgKDIyICogaSksIDYsIDApO1x0XHRcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlc1tzcHJdLCA5MyArICgyMiAqIGkpLCA5LCBpdGVtLnN1YkltZyk7XHJcblx0fVxyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5pbnZlbnRvcnksIDkwLCA2LCAxKTtcclxuXHRcclxuXHQvLyBJZiB0aGUgcGxheWVyIGlzIGh1cnQgZHJhdyBhIHJlZCBzY3JlZW5cclxuXHRpZiAocGxheWVyLmh1cnQgPiAwLjApe1xyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLDAuNSlcIjtcclxuXHRcdGN0eC5maWxsUmVjdCgwLDAsY3R4LndpZHRoLGN0eC5oZWlnaHQpO1xyXG5cdH1lbHNlIGlmICh0aGlzLnByb3RlY3Rpb24gPiAwLjApe1x0Ly8gSWYgdGhlIHBsYXllciBoYXMgcHJvdGVjdGlvbiB0aGVuIGRyYXcgaXQgc2xpZ2h0bHkgYmx1ZVxyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSg0MCw0MCwyNTUsMC4yKVwiO1xyXG5cdFx0Y3R4LmZpbGxSZWN0KDAsMCxjdHgud2lkdGgsY3R4LmhlaWdodCk7XHJcblx0fVxyXG5cdFxyXG5cdGlmIChwbGF5ZXIuZGVzdHJveWVkKXtcclxuXHRcdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5yZXN0YXJ0LCA4NSwgOTQsIDApO1xyXG5cdH1lbHNlIGlmICh0aGlzLnBhdXNlZCl7XHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMucGF1c2VkLCAxNDcsIDk0LCAwKTtcclxuXHR9XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnTGV2ZWwgJyt0aGlzLmZsb29yRGVwdGgsIDEwLDI0LHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCh0aGlzLnBsYXllci5jbGFzc05hbWUsIDEwLDMxLHRoaXMuY29uc29sZSk7XHJcblx0dGhpcy5VSS5kcmF3VGV4dCgnSFA6ICcrcHMuaHAsIDEwLDksdGhpcy5jb25zb2xlKTtcclxuXHR0aGlzLlVJLmRyYXdUZXh0KCdNYW5hOicrcHMubWFuYSwgMTAsMTcsdGhpcy5jb25zb2xlKTtcclxuXHJcblx0Ly8gRHJhdyB0aGUgY29tcGFzc1xyXG5cdHRoaXMuVUkuZHJhd1Nwcml0ZSh0aGlzLmltYWdlcy5jb21wYXNzLCAzMjAsIDEyLCAwKTtcclxuXHR0aGlzLlVJLmRyYXdTcHJpdGVFeHQodGhpcy5pbWFnZXMuY29tcGFzcywgMzIwLCAxMiwgMSwgTWF0aC5QSSArIHRoaXMubWFwLnBsYXllci5yb3RhdGlvbi5iKTtcclxuXHJcblx0dmFyIHdlYXBvbiA9IHRoaXMuaW52ZW50b3J5LmdldFdlYXBvbigpO1xyXG5cdGlmICh3ZWFwb24gJiYgd2VhcG9uLnZpZXdQb3J0SW1nID49IDApXHJcblx0XHR0aGlzLlVJLmRyYXdTcHJpdGUodGhpcy5pbWFnZXMudmlld3BvcnRXZWFwb25zLCAxNjAsIDEzMCArIHRoaXMubWFwLnBsYXllci5sYXVuY2hBdHRhY2tDb3VudGVyICogMiAtIHRoaXMubWFwLnBsYXllci5hdHRhY2tXYWl0ICogMS41LCB3ZWFwb24udmlld1BvcnRJbWcpO1xyXG5cdGdhbWUuY29uc29sZS5yZW5kZXIoOCwgMTIwKTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmFkZEV4cGVyaWVuY2UgPSBmdW5jdGlvbihleHBQb2ludHMpe1xyXG5cdHRoaXMucGxheWVyLmFkZEV4cGVyaWVuY2UoZXhwUG9pbnRzLCB0aGlzLmNvbnNvbGUpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuY3JlYXRlSW5pdGlhbEludmVudG9yeSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XHJcblx0dGhpcy5pbnZlbnRvcnkuaXRlbXMgPSBbXTtcclxuXHRcclxuXHR2YXIgaXRlbSA9IEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ215c3RpY1N3b3JkJywgMS4wKTtcclxuXHRpdGVtLmVxdWlwcGVkID0gdHJ1ZTtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdFxyXG5cdHZhciBpdGVtID0gSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbXlzdGljJywgMS4wKTtcclxuXHRpdGVtLmVxdWlwcGVkID0gdHJ1ZTtcclxuXHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdNYWdlJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnbWlzc2lsZScpKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgJ0RydWlkJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgnaGVhbCcpKTtcclxuXHRjYXNlICdCYXJkJzogY2FzZSAnUGFsYWRpbic6IGNhc2UgJ1Jhbmdlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2hlYWwnKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ2xpZ2h0JykpO1xyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdtaXNzaWxlJykpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHN3aXRjaCAoY2xhc3NOYW1lKXtcclxuXHRjYXNlICdCYXJkJzpcclxuXHRcdHRoaXMuaW52ZW50b3J5Lml0ZW1zLnB1c2goSXRlbUZhY3RvcnkuZ2V0SXRlbUJ5Q29kZSgneWVsbG93UG90aW9uJykpO1xyXG5cdGNhc2UgJ1Rpbmtlcic6XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3llbGxvd1BvdGlvbicpKTtcclxuXHRkZWZhdWx0OlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCd5ZWxsb3dQb3Rpb24nKSk7XHJcblx0XHR0aGlzLmludmVudG9yeS5pdGVtcy5wdXNoKEl0ZW1GYWN0b3J5LmdldEl0ZW1CeUNvZGUoJ3JlZFBvdGlvbicpKTtcclxuXHRcdGJyZWFrO1xyXG5cdH1cclxuXHRzd2l0Y2ggKGNsYXNzTmFtZSl7XHJcblx0Y2FzZSAnRHJ1aWQnOiBjYXNlICdSYW5nZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdib3cnLCAwLjYpKTtcclxuXHRcdGJyZWFrO1xyXG5cdGNhc2UgJ0JhcmQnOiBjYXNlICdUaW5rZXInOlxyXG5cdFx0dGhpcy5pbnZlbnRvcnkuaXRlbXMucHVzaChJdGVtRmFjdG9yeS5nZXRJdGVtQnlDb2RlKCdzbGluZycsIDAuNykpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS51c2VJdGVtID0gZnVuY3Rpb24oaW5kZXgpe1xyXG5cdHZhciBpdGVtID0gdGhpcy5pbnZlbnRvcnkuaXRlbXNbaW5kZXhdO1xyXG5cdHZhciBwcyA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBwID0gdGhpcy5tYXAucGxheWVyO1xyXG5cdHAubW92ZWQgPSB0cnVlO1xyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ3JlZFBvdGlvbic6XHJcblx0XHRcdGlmICh0aGlzLnBsYXllci5wb2lzb25lZCl7XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIucG9pc29uZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIGdhcmxpYyBwb3Rpb24gY3VyZXMgeW91LlwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdGhpbmcgaGFwcGVuc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cdHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGluZGV4KTtcclxufVxyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuYWN0aXZlU3BlbGwgPSBmdW5jdGlvbihpbmRleCl7XHJcblx0dmFyIGl0ZW0gPSB0aGlzLmludmVudG9yeS5pdGVtc1tpbmRleF07XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0dmFyIHAgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0cC5tb3ZlZCA9IHRydWU7XHJcblx0XHJcblx0aWYgKHBzLm1hbmEgPCBpdGVtLm1hbmEpe1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vdCBlbm91Z2ggbWFuYVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0cHMubWFuYSA9IE1hdGgubWF4KHBzLm1hbmEgLSBpdGVtLm1hbmEsIDApO1xyXG5cdFxyXG5cdHN3aXRjaCAoaXRlbS5jb2RlKXtcclxuXHRcdGNhc2UgJ2N1cmUnOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIkFOIE5PWCFcIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJBTiBOT1guLi5cIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZWRQb3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wbGF5ZXIucG9pc29uZWQpe1xyXG5cdFx0XHRcdHRoaXMucGxheWVyLnBvaXNvbmVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnYXJsaWMgcG90aW9uIGN1cmVzIHlvdS5cIik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJOb3RoaW5nIGhhcHBlbnNcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdoZWFsJzpcclxuXHRcdFx0dmFyIGhlYWwgPSAodGhpcy5wbGF5ZXIubUhQICogaXRlbS5wZXJjZW50KSA8PCAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk1BTkkhIFwiK2hlYWwgKyBcIiBwb2ludHMgaGVhbGVkXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3llbGxvd1BvdGlvbic6XHJcblx0XHRcdHZhciBoZWFsID0gMTAwO1xyXG5cdFx0XHR0aGlzLnBsYXllci5ocCA9IE1hdGgubWluKHRoaXMucGxheWVyLmhwICsgaGVhbCwgdGhpcy5wbGF5ZXIubUhQKTtcclxuXHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBnaW5zZW5nIHBvdGlvbiBoZWFscyB5b3UgZm9yIFwiK2hlYWwgKyBcIiBwb2ludHMuXCIpO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2xpZ2h0JzpcclxuXHRcdFx0aWYgKHRoaXMuR0wubGlnaHQgPiAwKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiVGhlIHNwZWxsIGZpenpsZXMhXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLkdMLmxpZ2h0ID0gaXRlbS5saWdodFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIklOIExPUiFcIik7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdtaXNzaWxlJzpcclxuXHRcdFx0dmFyIHN0ciA9IFV0aWxzLnJvbGxEaWNlKHBzLnN0YXRzLm1hZ2ljUG93ZXIpICsgVXRpbHMucm9sbERpY2UoaXRlbS5zdHIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1pc3NpbGUgPSBuZXcgTWlzc2lsZShwLnBvc2l0aW9uLmNsb25lKCksIHAucm90YXRpb24uY2xvbmUoKSwgJ21hZ2ljTWlzc2lsZScsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJHUkFWIFBPUiFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnaWNlYmFsbCc6XHJcblx0XHRcdHZhciBzdHIgPSBVdGlscy5yb2xsRGljZShwcy5zdGF0cy5tYWdpY1Bvd2VyKSArIFV0aWxzLnJvbGxEaWNlKGl0ZW0uc3RyKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBtaXNzaWxlID0gbmV3IE1pc3NpbGUocC5wb3NpdGlvbi5jbG9uZSgpLCBwLnJvdGF0aW9uLmNsb25lKCksICdpY2VCYWxsJywgJ2VuZW15JywgdGhpcy5tYXApO1xyXG5cdFx0XHRtaXNzaWxlLnN0ciA9IHN0ciA8PCAwO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5tYXAuYWRkTWVzc2FnZShcIlZBUyBGUklPIVwiKTtcclxuXHRcdFx0dGhpcy5tYXAuaW5zdGFuY2VzLnB1c2gobWlzc2lsZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRwLmF0dGFja1dhaXQgPSAzMDtcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdyZXBlbCc6XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnYmxpbmsnOlxyXG5cdFx0XHR2YXIgbGFzdFBvcyA9IG51bGw7XHJcblx0XHRcdHZhciBwb3J0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHBvcyA9IHRoaXMubWFwLnBsYXllci5wb3NpdGlvbi5jbG9uZSgpO1xyXG5cdFx0XHR2YXIgZGlyID0gdGhpcy5tYXAucGxheWVyLnJvdGF0aW9uO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGR4ID0gTWF0aC5jb3MoZGlyLmIpO1xyXG5cdFx0XHR2YXIgZHogPSAtTWF0aC5zaW4oZGlyLmIpO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIgaT0wO2k8MTU7aSsrKXtcclxuXHRcdFx0XHRwb3MuYSArPSBkeDtcclxuXHRcdFx0XHRwb3MuYyArPSBkejtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgY3ggPSBwb3MuYSA8PCAwO1xyXG5cdFx0XHRcdHZhciBjeSA9IHBvcy5jIDw8IDA7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFwLmlzU29saWQoY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJJTiBQT1IhXCIpO1xyXG5cdFx0XHRcdFx0XHRsYXN0UG9zLnN1bSh2ZWMzKDAuNSwwLDAuNSkpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcG9ydGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0cC5wb3NpdGlvbiA9IGxhc3RQb3M7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aSA9IDE1O1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1hcC5pc1dhdGVyUG9zaXRpb24oY3gsIGN5KSl7XHJcblx0XHRcdFx0XHRcdHZhciBpbnMgPSB0aGlzLm1hcC5nZXRJbnN0YW5jZUF0R3JpZChwb3MpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWlucyl7XHJcblx0XHRcdFx0XHRcdFx0bGFzdFBvcyA9IHZlYzMoY3gsIHBvcy5iLCBjeSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghcG9ydGVkKXtcclxuXHRcdFx0XHRpZiAobGFzdFBvcyl7XHJcblx0XHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gUE9SIVwiKTtcclxuXHRcdFx0XHRcdGxhc3RQb3Muc3VtKHZlYzMoMC41LDAsMC41KSk7XHJcblx0XHRcdFx0XHRwLnBvc2l0aW9uID0gbGFzdFBvcztcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoXCJUaGUgc3BlbGwgZml6emxlcyFcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnZmlyZWJhbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAnZmlyZUJhbGwnLCAnZW5lbXknLCB0aGlzLm1hcCk7XHJcblx0XHRcdG1pc3NpbGUuc3RyID0gc3RyIDw8IDA7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm1hcC5hZGRNZXNzYWdlKFwiVkFTIEZMQU0hXCIpO1xyXG5cdFx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChtaXNzaWxlKTtcclxuXHRcdFx0XHJcblx0XHRcdHAuYXR0YWNrV2FpdCA9IDMwO1xyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ3Byb3RlY3Rpb24nOlxyXG5cdFx0XHRpZiAodGhpcy5wcm90ZWN0aW9uID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5wcm90ZWN0aW9uID0gaXRlbS5wcm90VGltZTtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gU0FOQ1QhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAndGltZSc6XHJcblx0XHRcdGlmICh0aGlzLnRpbWVTdG9wID4gMCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlRoZSBzcGVsbCBmaXp6bGVzIVwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy50aW1lU3RvcCA9IGl0ZW0uc3RvcFRpbWU7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlJFTCBUWU0hXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRicmVhaztcclxuXHRcdFxyXG5cdFx0Y2FzZSAnc2xlZXAnOlxyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSU4gWlUhXCIpO1xyXG5cdFx0XHR2YXIgaW5zdGFuY2VzID0gdGhpcy5tYXAuZ2V0SW5zdGFuY2VzTmVhcmVzdChwLnBvc2l0aW9uLCA2LCAnZW5lbXknKTtcclxuXHRcdFx0Zm9yICh2YXIgaT0wLGxlbj1pbnN0YW5jZXMubGVuZ3RoO2k8bGVuO2krKyl7XHJcblx0XHRcdFx0aW5zdGFuY2VzW2ldLnNsZWVwID0gaXRlbS5zbGVlcFRpbWU7XHJcblx0XHRcdH1cclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICdqaW54JzpcclxuXHRcdGJyZWFrO1xyXG5cdFx0XHJcblx0XHRjYXNlICd0cmVtb3InOlxyXG5cdFx0YnJlYWs7XHJcblx0XHRcclxuXHRcdGNhc2UgJ2tpbGwnOlxyXG5cdFx0XHR2YXIgc3RyID0gVXRpbHMucm9sbERpY2UocHMuc3RhdHMubWFnaWNQb3dlcikgKyBVdGlscy5yb2xsRGljZShpdGVtLnN0cik7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbWlzc2lsZSA9IG5ldyBNaXNzaWxlKHAucG9zaXRpb24uY2xvbmUoKSwgcC5yb3RhdGlvbi5jbG9uZSgpLCAna2lsbCcsICdlbmVteScsIHRoaXMubWFwKTtcclxuXHRcdFx0bWlzc2lsZS5zdHIgPSBzdHIgPDwgMDtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubWFwLmFkZE1lc3NhZ2UoXCJYRU4gQ09SUCFcIik7XHJcblx0XHRcdHRoaXMubWFwLmluc3RhbmNlcy5wdXNoKG1pc3NpbGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0cC5hdHRhY2tXYWl0ID0gMzA7XHJcblx0XHRicmVhaztcclxuXHR9XHJcblx0dGhpcy5pbnZlbnRvcnkuZHJvcEl0ZW0oaW5kZXgpO1xyXG59O1xyXG5cclxuVW5kZXJ3b3JsZC5wcm90b3R5cGUuZHJvcEl0ZW0gPSBmdW5jdGlvbihpKXtcclxuXHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0dmFyIGNsZWFuUG9zID0gdGhpcy5tYXAuZ2V0TmVhcmVzdENsZWFuSXRlbVRpbGUocGxheWVyLnBvc2l0aW9uLmEsIHBsYXllci5wb3NpdGlvbi5jKTtcclxuXHRpZiAoIWNsZWFuUG9zKXtcclxuXHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ0NhbiBub3QgZHJvcCBpdCBoZXJlJyk7XHJcblx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0fWVsc2V7XHJcblx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgZHJvcHBlZCcpO1xyXG5cdFx0Y2xlYW5Qb3MuYSArPSAwLjU7XHJcblx0XHRjbGVhblBvcy5jICs9IDAuNTtcclxuXHRcdFxyXG5cdFx0dmFyIG5JdCA9IG5ldyBJdGVtKCk7XHJcblx0XHRuSXQuaW5pdChjbGVhblBvcywgbnVsbCwgdGhpcy5tYXApO1xyXG5cdFx0bkl0LnNldEl0ZW0oaXRlbSk7XHJcblx0XHR0aGlzLm1hcC5pbnN0YW5jZXMucHVzaChuSXQpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmludmVudG9yeS5kcm9wSXRlbShpKTtcclxuXHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5jaGVja0ludkNvbnRyb2wgPSBmdW5jdGlvbigpe1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLm1hcC5wbGF5ZXI7XHJcblx0dmFyIHBzID0gdGhpcy5wbGF5ZXI7XHJcblx0XHJcblx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZGVzdHJveWVkKXtcclxuXHRcdGlmICh0aGlzLmdldEtleVByZXNzZWQoODIpKXtcclxuXHRcdFx0ZG9jdW1lbnQuZXhpdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcdHRoaXMubmV3R2FtZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpZiAoIXBsYXllciB8fCBwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XHJcblx0XHJcblx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZCg4MCkpe1xyXG5cdFx0dGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWQ7XHJcblx0fVxyXG5cdFxyXG5cdGlmICh0aGlzLnBhdXNlZCkgcmV0dXJuO1xyXG5cdGlmICh0aGlzLmdldEtleVByZXNzZWQoODQpKXtcclxuXHRcdGlmICghdGhpcy5zZXREcm9wSXRlbSl7XHJcblx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ1NlbGVjdCB0aGUgaXRlbSB0byBkcm9wJyk7XHJcblx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSB0cnVlO1xyXG5cdFx0fWVsc2UgaWYgKHRoaXMuc2V0RHJvcEl0ZW0pe1xyXG5cdFx0XHR0aGlzLnNldERyb3BJdGVtID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGZvciAodmFyIGk9MDtpPDEwO2krKyl7XHJcblx0XHR2YXIgaW5kZXggPSA0OSArIGk7XHJcblx0XHRpZiAoaSA9PSA5KVxyXG5cdFx0XHRpbmRleCA9IDQ4O1xyXG5cdFx0aWYgKHRoaXMuZ2V0S2V5UHJlc3NlZChpbmRleCkpe1xyXG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuaW52ZW50b3J5Lml0ZW1zW2ldO1xyXG5cdFx0XHRpZiAoIWl0ZW0pe1xyXG5cdFx0XHRcdGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0XHRcdHRoaXMuY29uc29sZS5hZGRTRk1lc3NhZ2UoJ05vIGl0ZW0nKTtcclxuXHRcdFx0XHRcdHRoaXMuc2V0RHJvcEl0ZW0gPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICh0aGlzLnNldERyb3BJdGVtKXtcclxuXHRcdFx0XHR0aGlzLmRyb3BJdGVtKGkpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaXRlbS50eXBlID09ICd3ZWFwb24nICYmICFpdGVtLmVxdWlwcGVkKXtcclxuXHRcdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKGl0ZW0ubmFtZSArICcgd2llbGRlZCcpO1xyXG5cdFx0XHRcdHRoaXMuaW52ZW50b3J5LmVxdWlwSXRlbShpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnYXJtb3VyJyAmJiAhaXRlbS5lcXVpcHBlZCl7XHJcblx0XHRcdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShpdGVtLm5hbWUgKyAnIHdvcmUnKTtcclxuXHRcdFx0XHR0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0oaSk7XHJcblx0XHRcdH1lbHNlIGlmIChpdGVtLnR5cGUgPT0gJ21hZ2ljJyl7XHJcblx0XHRcdFx0dGhpcy5hY3RpdmVTcGVsbChpKTtcclxuXHRcdFx0fWVsc2UgaWYgKGl0ZW0udHlwZSA9PSAncG90aW9uJyl7XHJcblx0XHRcdFx0dGhpcy51c2VJdGVtKGkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSBcclxuXHRcclxuXHRyZXR1cm47XHJcblx0XHJcblx0aWYgKHBzLnBvdGlvbnMgPiAwKXtcclxuXHRcdGlmIChwcy5ocCA9PSBwcy5tSFApe1xyXG5cdFx0XHR0aGlzLmNvbnNvbGUuYWRkU0ZNZXNzYWdlKFwiSGVhbHRoIGlzIGFscmVhZHkgYXQgbWF4XCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHBzLnBvdGlvbnMgLT0gMTtcclxuXHRcdHBzLmhwID0gTWF0aC5taW4ocHMubUhQLCBwcy5ocCArIDUpO1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIlBvdGlvbiB1c2VkXCIpO1xyXG5cdH1lbHNle1xyXG5cdFx0dGhpcy5jb25zb2xlLmFkZFNGTWVzc2FnZShcIk5vIG1vcmUgcG90aW9ucyBsZWZ0LlwiKTtcclxuXHR9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nbG9iYWxMb29wID0gZnVuY3Rpb24oKXtcclxuXHRpZiAodGhpcy5wcm90ZWN0aW9uID4gMCl7IHRoaXMucHJvdGVjdGlvbiAtPSAxOyB9XHJcblx0aWYgKHRoaXMudGltZVN0b3AgPiAwKXsgdGhpcy50aW1lU3RvcCAtPSAxOyB9XHJcblx0aWYgKHRoaXMuR0wubGlnaHQgPiAwKXsgdGhpcy5HTC5saWdodCAtPSAxOyB9XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2FtZSA9IHRoaXM7XHJcblx0XHJcblx0dmFyIG5vdyA9IERhdGUubm93KCk7XHJcblx0dmFyIGRUID0gKG5vdyAtIGdhbWUubGFzdFQpO1xyXG5cdFxyXG5cdC8vIExpbWl0IHRoZSBnYW1lIHRvIHRoZSBiYXNlIHNwZWVkIG9mIHRoZSBnYW1lXHJcblx0aWYgKGRUID4gZ2FtZS5mcHMpe1xyXG5cdFx0Z2FtZS5sYXN0VCA9IG5vdyAtIChkVCAlIGdhbWUuZnBzKTtcclxuXHRcdFxyXG5cdFx0aWYgKCFnYW1lLkdMLmFjdGl2ZSl7XHJcblx0XHRcdHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24oKXsgZ2FtZS5sb29wKCk7IH0pOyBcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAodGhpcy5tYXAgIT0gbnVsbCl7XHJcblx0XHRcdHZhciBnbCA9IGdhbWUuR0wuY3R4O1xyXG5cdFx0XHRcclxuXHRcdFx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG5cdFx0XHRnYW1lLlVJLmNsZWFyKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRnYW1lLmdsb2JhbExvb3AoKTtcclxuXHRcdFx0Z2FtZS5jaGVja0ludkNvbnRyb2woKTtcclxuXHRcdFx0Z2FtZS5tYXAubG9vcCgpO1xyXG5cdFx0XHRcclxuXHRcdFx0Z2FtZS5kcmF3VUkoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKHRoaXMuc2NlbmUgIT0gbnVsbCl7XHJcblx0XHRcdGdhbWUuc2NlbmUubG9vcCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7IGdhbWUubG9vcCgpOyB9KTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldEtleVByZXNzZWQgPSBmdW5jdGlvbihrZXlDb2RlKXtcclxuXHRpZiAodGhpcy5rZXlzW2tleUNvZGVdID09IDEpe1xyXG5cdFx0dGhpcy5rZXlzW2tleUNvZGVdID0gMjtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5VbmRlcndvcmxkLnByb3RvdHlwZS5nZXRNb3VzZUJ1dHRvblByZXNzZWQgPSBmdW5jdGlvbigpe1xyXG5cdGlmICh0aGlzLm1vdXNlLmMgPT0gMSl7XHJcblx0XHR0aGlzLm1vdXNlLmMgPSAyO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblVuZGVyd29ybGQucHJvdG90eXBlLmdldE1vdXNlTW92ZW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdHZhciByZXQgPSB7eDogdGhpcy5tb3VzZU1vdmVtZW50LngsIHk6IHRoaXMubW91c2VNb3ZlbWVudC55fTtcclxuXHR0aGlzLm1vdXNlTW92ZW1lbnQgPSB7eDogLTEwMDAwLCB5OiAtMTAwMDB9O1xyXG5cdFxyXG5cdHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5VdGlscy5hZGRFdmVudCh3aW5kb3csIFwibG9hZFwiLCBmdW5jdGlvbigpe1xyXG5cdHZhciBnYW1lID0gbmV3IFVuZGVyd29ybGQoKTtcclxuXHRnYW1lLmxvYWRHYW1lKCk7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwia2V5ZG93blwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChlLmtleUNvZGUgPT0gOCl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoZ2FtZS5rZXlzW2Uua2V5Q29kZV0gPT0gMikgcmV0dXJuO1xyXG5cdFx0Z2FtZS5rZXlzW2Uua2V5Q29kZV0gPSAxO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcImtleXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0aWYgKGUua2V5Q29kZSA9PSA4KXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGdhbWUua2V5c1tlLmtleUNvZGVdID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHR2YXIgY2FudmFzID0gZ2FtZS5VSS5jYW52YXM7XHJcblx0VXRpbHMuYWRkRXZlbnQoY2FudmFzLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRcclxuXHRcdGlmIChnYW1lLm1hcCAhPSBudWxsKVxyXG5cdFx0XHRjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcblx0XHRcclxuXHRcdGdhbWUubW91c2UuYSA9IE1hdGgucm91bmQoKGUuY2xpZW50WCAtIGNhbnZhcy5vZmZzZXRMZWZ0KSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5iID0gTWF0aC5yb3VuZCgoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCkgLyBnYW1lLlVJLnNjYWxlKTtcclxuXHRcdFxyXG5cdFx0aWYgKGdhbWUubW91c2UuYyA9PSAyKSByZXR1cm47XHJcblx0XHRnYW1lLm1vdXNlLmMgPSAxO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGNhbnZhcywgXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdFx0Z2FtZS5tb3VzZS5jID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudChjYW52YXMsIFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcclxuXHRcdFxyXG5cdFx0Z2FtZS5tb3VzZS5hID0gTWF0aC5yb3VuZCgoZS5jbGllbnRYIC0gY2FudmFzLm9mZnNldExlZnQpIC8gZ2FtZS5VSS5zY2FsZSk7XHJcblx0XHRnYW1lLm1vdXNlLmIgPSBNYXRoLnJvdW5kKChlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKSAvIGdhbWUuVUkuc2NhbGUpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xyXG5cdFx0Z2FtZS5maXJzdEZyYW1lID0gRGF0ZS5ub3coKTtcclxuXHRcdGdhbWUubnVtYmVyRnJhbWVzID0gMDtcclxuXHR9KTtcclxuXHRcclxuXHRVdGlscy5hZGRFdmVudCh3aW5kb3csIFwicmVzaXplXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgc2NhbGUgPSBVdGlscy4kJChcImRpdkdhbWVcIikub2Zmc2V0SGVpZ2h0IC8gZ2FtZS5zaXplLmI7XHJcblx0XHR2YXIgY2FudmFzID0gZ2FtZS5HTC5jYW52YXM7XHJcblx0XHRcclxuXHRcdGNhbnZhcyA9IGdhbWUuVUkuY2FudmFzO1xyXG5cdFx0Z2FtZS5VSS5zY2FsZSA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBjYW52YXMuaGVpZ2h0O1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBtb3ZlQ2FsbGJhY2sgPSBmdW5jdGlvbihlKXtcclxuXHRcdGdhbWUubW91c2VNb3ZlbWVudC54ID0gZS5tb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0ZS5tb3pNb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0ZS53ZWJraXRNb3ZlbWVudFggfHxcclxuXHRcdFx0XHRcdFx0MDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRnYW1lLm1vdXNlTW92ZW1lbnQueSA9IGUubW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdGUubW96TW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdGUud2Via2l0TW92ZW1lbnRZIHx8XHJcblx0XHRcdFx0XHRcdDA7XHJcblx0fTtcclxuXHRcclxuXHR2YXIgcG9pbnRlcmxvY2tjaGFuZ2UgPSBmdW5jdGlvbihlKXtcclxuXHRcdGlmIChkb2N1bWVudC5wb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyB8fFxyXG5cdFx0XHRkb2N1bWVudC5tb3pQb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyB8fFxyXG5cdFx0XHRkb2N1bWVudC53ZWJraXRQb2ludGVyTG9ja0VsZW1lbnQgPT09IGNhbnZhcyl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcIm1vdXNlbW92ZVwiLCBtb3ZlQ2FsbGJhY2spO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUNhbGxiYWNrKTtcclxuXHRcdFx0Z2FtZS5tb3VzZU1vdmVtZW50ID0ge3g6IC0xMDAwMCwgeTogLTEwMDAwfTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KGRvY3VtZW50LCBcInBvaW50ZXJsb2NrY2hhbmdlXCIsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuXHRVdGlscy5hZGRFdmVudChkb2N1bWVudCwgXCJtb3pwb2ludGVybG9ja2NoYW5nZVwiLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcblx0VXRpbHMuYWRkRXZlbnQoZG9jdW1lbnQsIFwid2Via2l0cG9pbnRlcmxvY2tjaGFuZ2VcIiwgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG5cdFxyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJibHVyXCIsIGZ1bmN0aW9uKGUpeyBnYW1lLkdMLmFjdGl2ZSA9IGZhbHNlOyBnYW1lLmF1ZGlvLnBhdXNlTXVzaWMoKTsgIH0pO1xyXG5cdFV0aWxzLmFkZEV2ZW50KHdpbmRvdywgXCJmb2N1c1wiLCBmdW5jdGlvbihlKXsgZ2FtZS5HTC5hY3RpdmUgPSB0cnVlOyBnYW1lLmF1ZGlvLnJlc3RvcmVNdXNpYygpOyB9KTtcclxufSk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGFkZEV2ZW50OiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmdW5jKXtcclxuXHRcdGlmIChvYmouYWRkRXZlbnRMaXN0ZW5lcil7XHJcblx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZ1bmMsIGZhbHNlKTtcclxuXHRcdH1lbHNlIGlmIChvYmouYXR0YWNoRXZlbnQpe1xyXG5cdFx0XHRvYmouYXR0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZnVuYyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHQkJDogZnVuY3Rpb24ob2JqSWQpe1xyXG5cdFx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvYmpJZCk7XHJcblx0XHRpZiAoIWVsZW0pIGFsZXJ0KFwiQ291bGRuJ3QgZmluZCBlbGVtZW50OiBcIiArIG9iaklkKTtcclxuXHRcdHJldHVybiBlbGVtO1xyXG5cdH0sXHJcblx0Z2V0SHR0cDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBodHRwO1xyXG5cdFx0aWYgICh3aW5kb3cuWE1MSHR0cFJlcXVlc3Qpe1xyXG5cdFx0XHRodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHR9ZWxzZSBpZiAod2luZG93LkFjdGl2ZVhPYmplY3Qpe1xyXG5cdFx0XHRodHRwID0gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBodHRwO1xyXG5cdH0sXHJcblx0cm9sbERpY2U6IGZ1bmN0aW9uIChwYXJhbSl7XHJcblx0XHR2YXIgYSA9IHBhcnNlSW50KHBhcmFtLnN1YnN0cmluZygwLCBwYXJhbS5pbmRleE9mKCdEJykpLCAxMCk7XHJcblx0XHR2YXIgYiA9IHBhcnNlSW50KHBhcmFtLnN1YnN0cmluZyhwYXJhbS5pbmRleE9mKCdEJykgKyAxKSwgMTApO1xyXG5cdFx0dmFyIHJvbGwxID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogYik7XHJcblx0XHR2YXIgcm9sbDIgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBiKTtcclxuXHRcdHJldHVybiBNYXRoLmNlaWwoYSAqIChyb2xsMStyb2xsMikvMik7XHJcblx0fVxyXG59XHJcblx0XHJcbi8vIE1hdGggcHJvdG90eXBlIG92ZXJyaWRlc1x0XHJcbk1hdGgucmFkUmVsYXRpb24gPSBNYXRoLlBJIC8gMTgwO1xyXG5NYXRoLmRlZ1JlbGF0aW9uID0gMTgwIC8gTWF0aC5QSTtcclxuTWF0aC5kZWdUb1JhZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpe1xyXG5cdHJldHVybiBkZWdyZWVzICogdGhpcy5yYWRSZWxhdGlvbjtcclxufTtcclxuTWF0aC5yYWRUb0RlZyA9IGZ1bmN0aW9uKHJhZGlhbnMpe1xyXG5cdHJldHVybiAoKHJhZGlhbnMgKiB0aGlzLmRlZ1JlbGF0aW9uKSArIDcyMCkgJSAzNjA7XHJcbn07XHJcbk1hdGguaVJhbmRvbSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG5cdGlmIChiID09PSB1bmRlZmluZWQpe1xyXG5cdFx0YiA9IGE7XHJcblx0XHRhID0gMDtcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIGEgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoYiAtIGEpKTtcclxufTtcclxuXHJcbk1hdGguZ2V0QW5nbGUgPSBmdW5jdGlvbigvKlZlYzIqLyBhLCAvKlZlYzIqLyBiKXtcclxuXHR2YXIgeHggPSBNYXRoLmFicyhhLmEgLSBiLmEpO1xyXG5cdHZhciB5eSA9IE1hdGguYWJzKGEuYyAtIGIuYyk7XHJcblx0XHJcblx0dmFyIGFuZyA9IE1hdGguYXRhbjIoeXksIHh4KTtcclxuXHRcclxuXHQvLyBBZGp1c3QgdGhlIGFuZ2xlIGFjY29yZGluZyB0byBib3RoIHBvc2l0aW9uc1xyXG5cdGlmIChiLmEgPD0gYS5hICYmIGIuYyA8PSBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSSAtIGFuZztcclxuXHR9ZWxzZSBpZiAoYi5hIDw9IGEuYSAmJiBiLmMgPiBhLmMpe1xyXG5cdFx0YW5nID0gTWF0aC5QSSArIGFuZztcclxuXHR9ZWxzZSBpZiAoYi5hID4gYS5hICYmIGIuYyA+IGEuYyl7XHJcblx0XHRhbmcgPSBNYXRoLlBJMiAtIGFuZztcclxuXHR9XHJcblx0XHJcblx0YW5nID0gKGFuZyArIE1hdGguUEkyKSAlIE1hdGguUEkyO1xyXG5cdFxyXG5cdHJldHVybiBhbmc7XHJcbn07XHJcblxyXG5NYXRoLlBJXzIgPSBNYXRoLlBJIC8gMjtcclxuTWF0aC5QSTIgPSBNYXRoLlBJICogMjtcclxuTWF0aC5QSTNfMiA9IE1hdGguUEkgKiAzIC8gMjtcclxuXHJcbi8vIENyb3NzYnJvd3NlciBhbmltYXRpb24vYXVkaW8gb3ZlcnJpZGVzXHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IFxyXG5cdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHwgXHJcblx0d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcclxuXHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8IFxyXG5cdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHwgXHJcblx0d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCBcclxuXHRmdW5jdGlvbigvKiBmdW5jdGlvbiAqLyBkcmF3MSl7XHJcblx0XHR3aW5kb3cuc2V0VGltZW91dChkcmF3MSwgMTAwMCAvIDMwKTtcclxuXHR9O1xyXG5cclxud2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDsiLCJ2YXIgTWF0cml4ID0gcmVxdWlyZSgnLi9NYXRyaXgnKTtcclxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpO1xyXG5cclxuZnVuY3Rpb24gV2ViR0woc2l6ZSwgY29udGFpbmVyKXtcclxuXHRpZiAoIXRoaXMuaW5pdENhbnZhcyhzaXplLCBjb250YWluZXIpKSByZXR1cm4gbnVsbDsgXHJcblx0dGhpcy5pbml0UHJvcGVydGllcygpO1xyXG5cdHRoaXMucHJvY2Vzc1NoYWRlcnMoKTtcclxuXHRcclxuXHR0aGlzLmltYWdlcyA9IFtdO1xyXG5cdFxyXG5cdHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuXHR0aGlzLmxpZ2h0ID0gMDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXZWJHTDtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5pbml0Q2FudmFzID0gZnVuY3Rpb24oc2l6ZSwgY29udGFpbmVyKXtcclxuXHR2YXIgc2NhbGUgPSBVdGlscy4kJChcImRpdkdhbWVcIikub2Zmc2V0SGVpZ2h0IC8gc2l6ZS5iO1xyXG5cdFxyXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5cdGNhbnZhcy53aWR0aCA9IHNpemUuYTtcclxuXHRjYW52YXMuaGVpZ2h0ID0gc2l6ZS5iO1xyXG5cdGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHRjYW52YXMuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuXHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0XHJcblx0aWYgKCFjYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKSl7XHJcblx0XHRhbGVydChcIllvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIik7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKTtcclxuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cdFxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmluaXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKXtcclxuXHR2YXIgZ2wgPSB0aGlzLmN0eDtcclxuXHRcclxuXHRnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XHJcblx0Z2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG5cdGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xyXG5cdFxyXG5cdGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG5cdFxyXG5cdGdsLmVuYWJsZSggZ2wuQkxFTkQgKTtcclxuXHRnbC5ibGVuZEVxdWF0aW9uKCBnbC5GVU5DX0FERCApO1xyXG5cdGdsLmJsZW5kRnVuYyggZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBICk7XHJcblx0XHJcblx0dGhpcy5hc3BlY3RSYXRpbyA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG5cdHRoaXMucGVyc3BlY3RpdmVNYXRyaXggPSBNYXRyaXgubWFrZVBlcnNwZWN0aXZlKDQ1LCB0aGlzLmFzcGVjdFJhdGlvLCAwLjAwMiwgNS4wKTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5wcm9jZXNzU2hhZGVycyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIGdsID0gdGhpcy5jdHg7XHJcblx0XHJcblx0Ly8gQ29tcGlsZSBmcmFnbWVudCBzaGFkZXJcclxuXHR2YXIgZWxTaGFkZXIgPSBVdGlscy4kJChcImZyYWdtZW50U2hhZGVyXCIpO1xyXG5cdHZhciBjb2RlID0gdGhpcy5nZXRTaGFkZXJDb2RlKGVsU2hhZGVyKTtcclxuXHR2YXIgZlNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG5cdGdsLnNoYWRlclNvdXJjZShmU2hhZGVyLCBjb2RlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKGZTaGFkZXIpO1xyXG5cdFxyXG5cdC8vIENvbXBpbGUgdmVydGV4IHNoYWRlclxyXG5cdGVsU2hhZGVyID0gVXRpbHMuJCQoXCJ2ZXJ0ZXhTaGFkZXJcIik7XHJcblx0Y29kZSA9IHRoaXMuZ2V0U2hhZGVyQ29kZShlbFNoYWRlcik7XHJcblx0dmFyIHZTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XHJcblx0Z2wuc2hhZGVyU291cmNlKHZTaGFkZXIsIGNvZGUpO1xyXG5cdGdsLmNvbXBpbGVTaGFkZXIodlNoYWRlcik7XHJcblx0XHJcblx0Ly8gQ3JlYXRlIHRoZSBzaGFkZXIgcHJvZ3JhbVxyXG5cdHRoaXMuc2hhZGVyUHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHRnbC5hdHRhY2hTaGFkZXIodGhpcy5zaGFkZXJQcm9ncmFtLCBmU2hhZGVyKTtcclxuXHRnbC5hdHRhY2hTaGFkZXIodGhpcy5zaGFkZXJQcm9ncmFtLCB2U2hhZGVyKTtcclxuXHRnbC5saW5rUHJvZ3JhbSh0aGlzLnNoYWRlclByb2dyYW0pO1xyXG5cdFxyXG5cdGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG5cdFx0YWxlcnQoXCJFcnJvciBpbml0aWFsaXppbmcgdGhlIHNoYWRlciBwcm9ncmFtXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuICBcclxuXHRnbC51c2VQcm9ncmFtKHRoaXMuc2hhZGVyUHJvZ3JhbSk7XHJcblx0XHJcblx0Ly8gR2V0IGF0dHJpYnV0ZSBsb2NhdGlvbnNcclxuXHR0aGlzLmFWZXJ0ZXhQb3NpdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJhVmVydGV4UG9zaXRpb25cIik7XHJcblx0dGhpcy5hVGV4dHVyZUNvb3JkID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFUZXh0dXJlQ29vcmRcIik7XHJcblx0dGhpcy5hVmVydGV4SXNEYXJrID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5zaGFkZXJQcm9ncmFtLCBcImFWZXJ0ZXhJc0RhcmtcIik7XHJcblx0XHJcblx0Ly8gRW5hYmxlIGF0dHJpYnV0ZXNcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFWZXJ0ZXhQb3NpdGlvbik7XHJcblx0Z2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hVGV4dHVyZUNvb3JkKTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFWZXJ0ZXhJc0RhcmspO1xyXG5cdFxyXG5cdC8vIEdldCB0aGUgdW5pZm9ybSBsb2NhdGlvbnNcclxuXHR0aGlzLnVTYW1wbGVyID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1U2FtcGxlclwiKTtcclxuXHR0aGlzLnVUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVRyYW5zZm9ybWF0aW9uTWF0cml4XCIpO1xyXG5cdHRoaXMudVBlcnNwZWN0aXZlTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSwgXCJ1UGVyc3BlY3RpdmVNYXRyaXhcIik7XHJcblx0dGhpcy51UGFpbnRJblJlZCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidVBhaW50SW5SZWRcIik7XHJcblx0dGhpcy51TGlnaHREZXB0aCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnNoYWRlclByb2dyYW0sIFwidUxpZ2h0RGVwdGhcIik7XHJcbn07XHJcblxyXG5XZWJHTC5wcm90b3R5cGUuZ2V0U2hhZGVyQ29kZSA9IGZ1bmN0aW9uKHNoYWRlcil7XHJcblx0dmFyIGNvZGUgPSBcIlwiO1xyXG5cdHZhciBub2RlID0gc2hhZGVyLmZpcnN0Q2hpbGQ7XHJcblx0dmFyIHRuID0gbm9kZS5URVhUX05PREU7XHJcblx0XHJcblx0d2hpbGUgKG5vZGUpe1xyXG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgPT0gdG4pXHJcblx0XHRcdGNvZGUgKz0gbm9kZS50ZXh0Q29udGVudDtcclxuXHRcdG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gY29kZTtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbihzcmMsIG1ha2VJdFRleHR1cmUsIHRleHR1cmVJbmRleCwgaXNTb2xpZCwgcGFyYW1zKXtcclxuXHRpZiAoIXBhcmFtcykgcGFyYW1zID0ge307XHJcblx0aWYgKCFwYXJhbXMuaW1nTnVtKSBwYXJhbXMuaW1nTnVtID0gMTtcclxuXHRpZiAoIXBhcmFtcy5pbWdWTnVtKSBwYXJhbXMuaW1nVk51bSA9IDE7XHJcblx0aWYgKCFwYXJhbXMueE9yaWcpIHBhcmFtcy54T3JpZyA9IDA7XHJcblx0aWYgKCFwYXJhbXMueU9yaWcpIHBhcmFtcy55T3JpZyA9IDA7XHJcblx0XHJcblx0dmFyIGdsID0gdGhpcztcclxuXHR2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcblx0XHJcblx0aW1nLnNyYyA9IHNyYztcclxuXHRpbWcucmVhZHkgPSBmYWxzZTtcclxuXHRpbWcudGV4dHVyZSA9IG51bGw7XHJcblx0aW1nLnRleHR1cmVJbmRleCA9IHRleHR1cmVJbmRleDtcclxuXHRpbWcuaXNTb2xpZCA9IChpc1NvbGlkID09PSB0cnVlKTtcclxuXHRpbWcuaW1nTnVtID0gcGFyYW1zLmltZ051bTtcclxuXHRpbWcudkltZ051bSA9IHBhcmFtcy5pbWdWTnVtO1xyXG5cdGltZy54T3JpZyA9IHBhcmFtcy54T3JpZztcclxuXHRpbWcueU9yaWcgPSBwYXJhbXMueU9yaWc7XHJcblx0XHJcblx0VXRpbHMuYWRkRXZlbnQoaW1nLCBcImxvYWRcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGltZy5pbWdXaWR0aCA9IGltZy53aWR0aCAvIGltZy5pbWdOdW07XHJcblx0XHRpbWcuaW1nSGVpZ2h0ID0gaW1nLmhlaWdodCAvIGltZy52SW1nTnVtO1xyXG5cdFx0aW1nLnJlYWR5ID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0aWYgKG1ha2VJdFRleHR1cmUpe1xyXG5cdFx0XHRpbWcudGV4dHVyZSA9IGdsLnBhcnNlVGV4dHVyZShpbWcpO1xyXG5cdFx0XHRpbWcudGV4dHVyZS50ZXh0dXJlSW5kZXggPSBpbWcudGV4dHVyZUluZGV4O1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdGdsLmltYWdlcy5wdXNoKGltZyk7XHJcblx0cmV0dXJuIGltZztcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5wYXJzZVRleHR1cmUgPSBmdW5jdGlvbihpbWcpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIENyZWF0ZXMgYSB0ZXh0dXJlIGhvbGRlciB0byB3b3JrIHdpdGhcclxuXHR2YXIgdGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleCk7XHJcblx0XHJcblx0Ly8gRmxpcCB2ZXJ0aWNhbCB0aGUgdGV4dHVyZVxyXG5cdGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xyXG5cdFxyXG5cdC8vIExvYWQgdGhlIGltYWdlIGRhdGFcclxuXHRnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltZyk7XHJcblx0XHJcblx0Ly8gQXNzaWduIHByb3BlcnRpZXMgb2Ygc2NhbGluZ1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblx0Z2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XHJcblx0XHJcblx0Ly8gUmVsZWFzZXMgdGhlIHRleHR1cmUgZnJvbSB0aGUgd29ya3NwYWNlXHJcblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XHJcblx0cmV0dXJuIHRleDtcclxufTtcclxuXHJcbldlYkdMLnByb3RvdHlwZS5kcmF3T2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCBjYW1lcmEsIHRleHR1cmUpe1xyXG5cdHZhciBnbCA9IHRoaXMuY3R4O1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIHZlcnRpY2VzIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBvYmplY3QudmVydGV4QnVmZmVyKTtcclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYVZlcnRleFBvc2l0aW9uLCBvYmplY3QudmVydGV4QnVmZmVyLml0ZW1TaXplLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIHRleHR1cmUgZGF0YSB0byB0aGUgc2hhZGVyXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG9iamVjdC50ZXhCdWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hVGV4dHVyZUNvb3JkLCBvYmplY3QudGV4QnVmZmVyLml0ZW1TaXplLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cdFxyXG5cdC8vIFBhc3MgdGhlIGRhcmsgYnVmZmVyIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGlmIChvYmplY3QuZGFya0J1ZmZlcil7XHJcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgb2JqZWN0LmRhcmtCdWZmZXIpO1xyXG5cdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFWZXJ0ZXhJc0RhcmssIG9iamVjdC5kYXJrQnVmZmVyLml0ZW1TaXplLCBnbC5VTlNJR05FRF9CWVRFLCBmYWxzZSwgMCwgMCk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFBhaW50IHRoZSBvYmplY3QgaW4gcmVkIChXaGVuIGh1cnQgZm9yIGV4YW1wbGUpXHJcblx0dmFyIHJlZCA9IChvYmplY3QucGFpbnRJblJlZCk/IDEuMCA6IDAuMDsgXHJcblx0Z2wudW5pZm9ybTFmKHRoaXMudVBhaW50SW5SZWQsIHJlZCk7XHJcblx0XHJcblx0Ly8gSG93IG11Y2ggbGlnaHQgdGhlIHBsYXllciBjYXN0XHJcblx0dmFyIGxpZ2h0ID0gKHRoaXMubGlnaHQgPiAwKT8gMC4wIDogMS4wO1xyXG5cdGdsLnVuaWZvcm0xZih0aGlzLnVMaWdodERlcHRoLCBsaWdodCk7XHJcblx0XHJcblx0Ly8gU2V0IHRoZSB0ZXh0dXJlIHRvIHdvcmsgd2l0aFxyXG5cdGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG5cdGdsLnVuaWZvcm0xaSh0aGlzLnVTYW1wbGVyLCAwKTtcclxuXHRcclxuXHQvLyBDcmVhdGUgdGhlIHBlcnNwZWN0aXZlIGFuZCB0cmFuc2Zvcm0gdGhlIG9iamVjdFxyXG5cdHZhciB0cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IE1hdHJpeC5tYWtlVHJhbnNmb3JtKG9iamVjdCwgY2FtZXJhKTtcclxuXHRcclxuXHQvLyBQYXNzIHRoZSBpbmRpY2VzIGRhdGEgdG8gdGhlIHNoYWRlclxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG9iamVjdC5pbmRpY2VzQnVmZmVyKTtcclxuXHRcclxuXHQvLyBTZXQgdGhlIHBlcnNwZWN0aXZlIGFuZCB0cmFuc2Zvcm1hdGlvbiBtYXRyaWNlc1xyXG5cdGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51UGVyc3BlY3RpdmVNYXRyaXgsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGVyc3BlY3RpdmVNYXRyaXgpKTtcclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHRoaXMudVRyYW5zZm9ybWF0aW9uTWF0cml4LCBmYWxzZSwgbmV3IEZsb2F0MzJBcnJheSh0cmFuc2Zvcm1hdGlvbk1hdHJpeCkpO1xyXG5cdFxyXG5cdGlmIChvYmplY3Qubm9Sb3RhdGUpIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcclxuXHRcclxuXHQvLyBEcmF3IHRoZSB0cmlhbmdsZXNcclxuXHRnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCBvYmplY3QuaW5kaWNlc0J1ZmZlci5udW1JdGVtcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG5cdFxyXG5cdGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG59O1xyXG5cclxuV2ViR0wucHJvdG90eXBlLmFyZUltYWdlc1JlYWR5ID0gZnVuY3Rpb24oKXtcclxuXHRmb3IgKHZhciBpPTAsbGVuPXRoaXMuaW1hZ2VzLmxlbmd0aDtpPGxlbjtpKyspe1xyXG5cdFx0aWYgKCF0aGlzLmltYWdlc1tpXS5yZWFkeSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gdHJ1ZTtcclxufTsiXX0=
