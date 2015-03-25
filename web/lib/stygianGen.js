(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/administrator/git/stygiangen/src/CA.js":[function(require,module,exports){
module.exports = {
	runCA: function(map, transformFunction, times, cross){
		for (var i = 0; i < times; i++){
			var newMap = [];
			for (var x = 0; x < map.length; x++){
				newMap[x] = [];
			}
			for (var x = 0; x < map.length; x++){
				for (var y = 0; y < map[x].length; y++){
					var surroundingMap = [];
					for (var xx = x-1; xx <= x+1; xx++){
						for (var yy = y-1; yy <= y+1; yy++){
							if (cross && !(xx == x || yy == y))
								continue;
							if (xx > 0 && xx < map.length && yy > 0 && yy < map[x].length){
								var cell = map[xx][yy];
								if (surroundingMap[cell])
									surroundingMap[cell]++;
								else
									surroundingMap[cell] = 1;
							}
						}
					}
					var newCell = transformFunction(map[x][y], surroundingMap);
					if (newCell){
						newMap[x][y] = newCell;
					} else {
						newMap[x][y] = map[x][y];
					}
				}
			}
			map = newMap;
		}
		return map;
	}
}
},{}],"/home/administrator/git/stygiangen/src/CanvasRenderer.class.js":[function(require,module,exports){
function CanvasRenderer(config){
	this.config = config;
}

CanvasRenderer.prototype = {
	drawSketch: function(level, canvas, overlay){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="16px Avatar";
		if (!overlay)
			context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		for (var i = 0; i < level.areas.length; i++){
			var area = level.areas[i];
			context.beginPath();
			context.rect(area.x * zoom, area.y * zoom, area.w * zoom, area.h * zoom);
			if (!overlay){
				context.fillStyle = 'yellow';
				context.fill();
			}
			context.lineWidth = 2;
			context.strokeStyle = 'black';
			context.stroke();
			var areaDescription = '';
			if (area.areaType == 'rooms'){
				areaDescription = "Dungeon";
			} else if (area.floor == 'fakeWater'){ 
				areaDescription = "Lagoon";
			} else {
				areaDescription = "Cavern";
			}
			if (area.hasExit){
				areaDescription += " (d)";
			}
			if (area.hasEntrance){
				areaDescription += " (u)";
			}
			context.fillStyle = 'white';
			context.fillText(areaDescription,(area.x)* zoom + 5,(area.y )* zoom + 20);
			for (var j = 0; j < area.bridges.length; j++){
				var bridge = area.bridges[j];
				context.beginPath();
				context.rect((bridge.x) * zoom /*- zoom / 2*/, (bridge.y) * zoom /*- zoom / 2*/, zoom, zoom);
				context.lineWidth = 2;
				context.strokeStyle = 'red';
				context.stroke();
			}
		}
	},
	drawLevel: function(level, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var cells = level.cells;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var color = '#FFFFFF';
				var cell = cells[x][y];
				if (cell === 'water'){
					color = '#0000FF';
				} else if (cell === 'lava'){
					color = '#FF0000';
				} else if (cell === 'fakeWater'){
					color = '#0000FF';
				}else if (cell === 'solidRock'){
					color = '#594B2D';
				}else if (cell === 'darkRock'){
					color = '#332b1a';
				}else if (cell === 'grayRock'){
					color = '#595959';
				}else if (cell === 'cavernFloor'){
					color = '#876418';
				}else if (cell === 'downstairs'){
					color = '#FF0000';
				}else if (cell === 'upstairs'){
					color = '#00FF00';
				}else if (cell === 'stoneWall'){
					color = '#BBBBBB';
				}else if (cell === 'stoneFloor'){
					color = '#666666';
				}else if (cell === 'corridor'){
					color = '#FF0000';
				}else if (cell === 'padding'){
					color = '#00FF00';
				}else if (cell === 'bridge'){
					color = '#946800';
				}
				context.fillStyle = color;
				context.fillRect(x * zoom, y * zoom, zoom, zoom);
			}
		}
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			var color = '#FFFFFF';
			switch (enemy.code){
			case 'bat':
				color = '#EEEEEE';
				break;
			case 'lavaLizard':
				color = '#00FF88';
				break;
			case 'daemon':
				color = '#FF8800';
				break;
			}
			context.fillStyle = color;
			context.fillRect(enemy.x * zoom, enemy.y * zoom, zoom, zoom);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			var color = '#FFFFFF';
			switch (item.code){
			case 'dagger':
				color = '#EEEEEE';
				break;
			case 'leatherArmor':
				color = '#00FF88';
				break;
			}
			context.fillStyle = color;
			context.fillRect(item.x * zoom, item.y * zoom, zoom, zoom);
		}
	},
	drawLevelWithIcons: function(level, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var water = new Image();
		water.src = 'img/water.png';
		var fakeWater = new Image();
		fakeWater.src = 'img/water.png';
		var solidRock = new Image();
		solidRock.src = 'img/solidRock.png';
		var cavernFloor = new Image();
		cavernFloor.src = 'img/cavernFloor.png';
		var downstairs = new Image();
		downstairs.src = 'img/downstairs.png';
		var upstairs = new Image();
		upstairs.src = 'img/upstairs.png';
		var stoneWall = new Image();
		stoneWall.src = 'img/stoneWall.png';
		var stoneFloor = new Image();
		stoneFloor.src = 'img/stoneFloor.png';
		var bridge = new Image();
		bridge.src = 'img/bridge.png';
		var lava = new Image();
		lava.src = 'img/lava.png';
		var bat = new Image();
		bat.src = 'img/bat.png';
		var lavaLizard = new Image();
		lavaLizard.src = 'img/lavaLizard.png';
		var daemon = new Image();
		daemon.src = 'img/daemon.png';
		var treasure = new Image();
		treasure.src = 'img/treasure.png';
		var tiles = {
			water: water,
			fakeWater: fakeWater,
			solidRock: solidRock,
			cavernFloor: cavernFloor,
			downstairs: downstairs,
			upstairs: upstairs,
			stoneWall: stoneWall,
			stoneFloor: stoneFloor,
			bridge: bridge,
			lava: lava,
			bat: bat,
			lavaLizard: lavaLizard,
			daemon: daemon,
			treasure: treasure
		}
	    var cells = level.cells;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				context.drawImage(tiles[cell], x * 16, y * 16);
			}
		}
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			context.drawImage(tiles[enemy.code], enemy.x * 16, enemy.y * 16);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			context.drawImage(tiles['treasure'], item.x * 16, item.y * 16);
		}
	}
}

module.exports = CanvasRenderer;
},{}],"/home/administrator/git/stygiangen/src/FirstLevelGenerator.class.js":[function(require,module,exports){
function FirstLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Splitter = require('./Splitter');

FirstLevelGenerator.prototype = {
	LAVA_CHANCE:     [100,  0, 20,  0,100, 10, 50,100],
	WATER_CHANCE:    [  0,100, 10,100,  0, 50,  0,  0],
	CAVERN_CHANCE:   [ 80, 80, 20, 20, 60, 90, 10, 50],
	LAGOON_CHANCE:   [  0, 10, 10, 20,  0, 30,  0,  0],
	WALLLESS_CHANCE: [ 50, 10, 80, 90, 10, 90, 10, 50],
	HEIGHT:          [  1,  2,  1,  1,  1,  2,  2,  3],
	VERMIN: [
	         ['spider', 'rat'],
	         ['bat', 'rat'],
	         ['spider'],
	         ['bat'],
	         ['mongbat'],
	         ['headless'],
	         ['headless', 'mongbat'],
	         ['headless', 'skeleton']
	        ],
    OBJECTS: ['orb', 'deadTree', 'tree', 'statue', 'signPost', 'well', 'smallSign', 'lamp', 'flame', 'campfire', 'altar', 'prisonerThing', 'fountain'],
	GANGS: [
		[ // Level 1
			{boss: 'daemon', minions: ['mongbat'], quantity: 2},
			{minions: ['mongbat'], quantity: 2},
			{minions: ['lavaLizard'], quantity: 2},
			{boss: 'hydra', minions: ['mongbat'], quantity: 2}
		],
		[ // Level 2
			{boss: 'daemon', minions: ['seaSerpent', 'octopus'], quantity: 3},
			{boss: 'hydra', minions: ['seaSerpent', 'octopus'], quantity: 3},
			{boss: 'balron', minions: ['seaSerpent', 'octopus'], quantity: 3},
			{minions: ['seaSerpent'], quantity: 3},
			{minions: ['octopus'], quantity: 3}
		],
		[ // Level 3
			{minions: ['daemon'], quantity: 3},
			{boss: 'balron', minions: ['daemon'], quantity: 2}
		],
		[ // Level 4
			{boss: 'gazer', minions: ['headless'], quantity: 3},
			{boss: 'liche', minions: ['ghost'], quantity: 3},
			{boss: 'daemon', minions: ['gazer', 'gremlin'], quantity: 3},
		],
		[ // Level 5
			{minions: ['dragon', 'zorn', 'balron'], quantity: 3},
			{minions: ['reaper', 'gazer'], quantity: 3},
			{boss: 'balron', minions: ['headless'], quantity: 3},
			{boss: 'zorn', minions: ['headless'], quantity: 3},
			{minions: ['dragon', 'lavaLizard'], quantity: 3},
		],
		[ // Level 6
			{minions: ['reaper'], quantity: 3},
			{boss: 'balron', minions: ['daemon'], quantity: 3},
			{areaType: 'cave', minions: ['bat'], quantity: 5},
			{areaType: 'cave', minions: ['seaSerpent'], quantity: 5},
			{boss: 'balron', minions: ['hydra'], quantity: 3},
			{boss: 'balron', minions: ['evilMage'], quantity: 3}
		],
		[ // Level 7
			{minions: ['headless'], quantity: 8},
			{minions: ['hydra'], quantity: 3},
			{minions: ['skeleton', 'wisp', 'ghost'], quantity: 6},
			{boss: 'balron', minions: ['skeleton'], quantity: 10}
		],
		[ // Level 8
			{minions: ['dragon', 'daemon', 'balron'], quantity: 3},
			{minions: ['warrior', 'mage', 'bard', 'druid', 'tinker', 'paladin', 'shepherd', 'ranger'], quantity: 4},
			{minions: ['gazer', 'balron'], quantity: 3},
			{boss: 'liche', minions: ['skeleton'], quantity: 4},
			{minions: ['ghost', 'wisp'], quantity: 4},
			{minions: ['lavaLizard'], quantity: 5}
		]		
	],
	CAVERN_WALLS: 1,
	CAVERN_FLOORS: 4,
	STONE_WALLS: 6,
	STONE_FLOORS: 3,
	generateLevel: function(depth){
		var hasRiver = Util.chance(this.WATER_CHANCE[depth-1]);
		var hasLava = Util.chance(this.LAVA_CHANCE[depth-1]);
		var mainEntrance = depth == 1;
		var areas = this.generateAreas(depth, hasLava);
		this.placeExits(areas);
		var level = {
			hasRivers: hasRiver,
			hasLava: hasLava,
			mainEntrance: mainEntrance,
			strata: 'solidRock',
			areas: areas,
			depth: depth,
			ceilingHeight: this.HEIGHT[depth-1],
			vermin: this.VERMIN[depth-1]
		} 
		return level;
	},
	generateAreas: function(depth, hasLava){
		var bigArea = {
			x: 0,
			y: 0,
			w: this.config.LEVEL_WIDTH,
			h: this.config.LEVEL_HEIGHT
		}
		var maxDepth = this.config.SUBDIVISION_DEPTH;
		var MIN_WIDTH = this.config.MIN_WIDTH;
		var MIN_HEIGHT = this.config.MIN_HEIGHT;
		var MAX_WIDTH = this.config.MAX_WIDTH;
		var MAX_HEIGHT = this.config.MAX_HEIGHT;
		var SLICE_RANGE_START = this.config.SLICE_RANGE_START;
		var SLICE_RANGE_END = this.config.SLICE_RANGE_END;
		var areas = Splitter.subdivideArea(bigArea, maxDepth, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, SLICE_RANGE_START, SLICE_RANGE_END);
		Splitter.connectAreas(areas,3);
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			this.setAreaDetails(area, depth, hasLava);
		}
		return areas;
	},
	setAreaDetails: function(area, depth, hasLava){
		if (Util.chance(this.CAVERN_CHANCE[depth-1])){
			area.areaType = 'cavern';
			if (hasLava){
				area.floor = 'cavernFloor';
				area.cavernType = Util.randomElementOf(['rocky','bridges']);
			} else {
				if (Util.chance(this.LAGOON_CHANCE[depth-1])){
					area.floor = 'fakeWater';
				} else {
					area.floor = 'cavernFloor';
				}
				area.cavernType = Util.randomElementOf(['rocky','bridges','watery']);
			}
			area.floorType = Util.rand(1, this.CAVERN_FLOORS);
		} else {
			area.areaType = 'rooms';
			area.floor = 'stoneFloor';
			area.floorType = Util.rand(1, this.STONE_FLOORS);
			if (Util.chance(this.WALLLESS_CHANCE[depth-1])){
				area.wall = false;
			} else {
				area.wall = 'stoneWall';
				area.wallType = Util.rand(1, this.STONE_WALLS);
			}
			area.corridor = 'stoneFloor';
		}
		area.enemies = [];
		area.items = [];
		var randomGang = Util.randomElementOf(this.GANGS[depth-1]);
		area.enemies = randomGang.minions;
		area.enemyCount = randomGang.quantity + Util.rand(1,4);
		if (randomGang)
			area.boss = randomGang.boss;
		if (Util.chance(50)){
			area.feature = Util.randomElementOf(this.OBJECTS);
		}
	},
	placeExits: function(areas){
		var dist = null;
		var area1 = null;
		var area2 = null;
		var fuse = 1000;
		do {
			area1 = Util.randomElementOf(areas);
			area2 = Util.randomElementOf(areas);
			if (fuse < 0){
				break;
			}
			dist = Util.lineDistance(area1, area2);
			fuse--;
		} while (dist < (this.config.LEVEL_WIDTH + this.config.LEVEL_HEIGHT) / 3);
		area1.hasExit = true;
		area2.hasEntrance = true;
	}
}

module.exports = FirstLevelGenerator;
},{"./Splitter":"/home/administrator/git/stygiangen/src/Splitter.js","./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/Generator.class.js":[function(require,module,exports){
function Generator(config){
	this.config = config;
	this.firstLevelGenerator = new FirstLevelGenerator(config);
	this.secondLevelGenerator = new SecondLevelGenerator(config);
	this.thirdLevelGenerator = new ThirdLevelGenerator(config);
	this.monsterPopulator = new MonsterPopulator(config);
	this.itemPopulator = new ItemPopulator(config);
	this.veinGenerator = new VeinGenerator(config);
}

var FirstLevelGenerator = require('./FirstLevelGenerator.class');
var SecondLevelGenerator = require('./SecondLevelGenerator.class');
var ThirdLevelGenerator = require('./ThirdLevelGenerator.class');
var MonsterPopulator = require('./MonsterPopulator.class');
var ItemPopulator = require('./ItemPopulator.class');
var VeinGenerator = require('./VeinGenerator.class');

Generator.prototype = {
	generateLevel: function(depth, uniqueRegistry){
		var sketch = this.firstLevelGenerator.generateLevel(depth);
		var level = this.secondLevelGenerator.fillLevel(sketch);
		this.thirdLevelGenerator.fillLevel(sketch, level);
		this.secondLevelGenerator.frameLevel(sketch, level);
		this.monsterPopulator.populateLevel(sketch, level);
		this.itemPopulator.populateLevel(sketch, level, uniqueRegistry);
		this.veinGenerator.traceVeins(sketch, level);
		return {
			sketch: sketch,
			level: level
		}
	}
}

module.exports = Generator;

},{"./FirstLevelGenerator.class":"/home/administrator/git/stygiangen/src/FirstLevelGenerator.class.js","./ItemPopulator.class":"/home/administrator/git/stygiangen/src/ItemPopulator.class.js","./MonsterPopulator.class":"/home/administrator/git/stygiangen/src/MonsterPopulator.class.js","./SecondLevelGenerator.class":"/home/administrator/git/stygiangen/src/SecondLevelGenerator.class.js","./ThirdLevelGenerator.class":"/home/administrator/git/stygiangen/src/ThirdLevelGenerator.class.js","./VeinGenerator.class":"/home/administrator/git/stygiangen/src/VeinGenerator.class.js"}],"/home/administrator/git/stygiangen/src/ItemPopulator.class.js":[function(require,module,exports){
function ItemPopulator(config){
	this.config = config;
}

var Util = require('./Utils');

ItemPopulator.prototype = {
	populateLevel: function(sketch, level, uniqueRegistry){
		this.uniqueRegistry = uniqueRegistry;
		this.calculateRarities(level.depth);
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			this.populateArea(area, level);
		}
	},
	populateArea: function(area, level){
		var items = Util.rand(0,2);
		for (var i = 0; i < items; i++){
			var position = level.getFreePlace(area, false, true);
			var item = this.getAnItem();
			level.addItem(item, position.x, position.y);
		}
	},
	calculateRarities: function(depth){
		this.thresholds = [];
		this.generationChanceTotal = 0;
		for (var i = 0; i < this.ITEMS.length; i++){
			var item = this.ITEMS[i];
			var malus = Math.abs(depth-item.depth) > 1;
			var rarity = malus ? item.rarity / 2 : item.rarity;
			this.generationChanceTotal += rarity;
			this.thresholds.push({threshold: this.generationChanceTotal, item: item});
		}
	},
	ITEMS: [
		/* Original U4 items
		    {code: 'dagger', rarity: 500},
			{code: 'oilFlask', rarity: 1400},
			{code: 'staff', rarity: 350},
			{code: 'sling', rarity: 280},
			{code: 'mace', rarity: 70},
			{code: 'axe', rarity: 31},
			{code: 'bow', rarity: 28},
			{code: 'sword', rarity: 350},
			{code: 'halberd', rarity: 23},
			{code: 'crossbow', rarity: 11},
			{code: 'magicAxe', rarity: 5},
			{code: 'magicBow', rarity: 4},
			{code: 'magicSword', rarity: 4},
			{code: 'magicWand', rarity: 2},
			{code: 'cloth', rarity: 140},
			{code: 'leather', rarity: 35},
			{code: 'chain', rarity: 12},
			{code: 'plate', rarity: 4},
	 	*/

		{code: 'daggerPoison', rarity: 100},
		{code: 'daggerFang', rarity: 50, unique: true},
		{code: 'daggerSting', rarity: 50, unique: true},
		{code: 'staffGargoyle', rarity: 100, unique: true},
		{code: 'staffAges', rarity: 50, unique: true},
		{code: 'staffCabyrus', rarity: 50, unique: true},
		
		{code: 'maceBane', rarity: 50, unique: true},
		{code: 'maceBoneCrusher', rarity: 50, unique: true},
		{code: 'maceSlayer', rarity: 25, unique: true},
		{code: 'maceJuggernaut', rarity: 25, unique: true},
		
		{code: 'axeDwarvish', rarity: 100},
		{code: 'axeDeceiver', rarity: 50, unique: true},
		{code: 'axeRune', rarity: 50},
		
		{code: 'swordFire', rarity: 100, unique: true},
		{code: 'swordChaos', rarity: 100, unique: true},
		{code: 'swordDragon', rarity: 50},
		{code: 'swordQuick', rarity: 25, unique: true},
		
		{code: 'slingEttin', rarity: 100, unique: true},
		{code: 'bowPoison', rarity: 200},
		{code: 'bowSleep', rarity: 200},
		{code: 'bowMagic', rarity: 100},
		{code: 'crossbowMagic', rarity: 50},
		
		{code: 'phazor', rarity: 25, unique: true},
		{code: 'wandLightning', rarity: 50},
		{code: 'wandFire', rarity: 50},
		
		{code: 'leatherDragon', rarity: 75},
		{code: 'leatherImp', rarity: 100},
		{code: 'chainMagic', rarity: 50},
		{code: 'chainDwarven', rarity: 75},
		{code: 'plateEternium', rarity: 5},
		{code: 'plateMagic', rarity: 10},
		
		{code: 'cure', rarity: 2000, depth: 1},
		{code: 'heal', rarity: 2000, depth: 1},
		{code: 'redPotion', rarity: 2000, depth: 1},
		{code: 'yellowPotion', rarity: 2000, depth: 1},
		{code: 'light', rarity: 2000, depth: 2},
		{code: 'missile', rarity: 2000, depth: 3},
		{code: 'iceball', rarity: 1000, depth: 4},
		//{code: 'repel', rarity: 1000, depth: 5},
		{code: 'blink', rarity: 666, depth: 5},
		{code: 'fireball', rarity: 666, depth: 6},
		{code: 'protection', rarity: 500, depth: 6},
		{code: 'time', rarity: 400, depth: 7},
		{code: 'sleep', rarity: 400, depth: 7},
		//{code: 'jinx', rarity: 166, depth: 8},
		//{code: 'tremor', rarity: 166, depth: 8},
		{code: 'kill', rarity: 100, depth: 8}
	],
	getAnItem: function(){
		var number = Util.rand(0, this.generationChanceTotal);
		for (var i = 0; i < this.thresholds.length; i++){
			if (number <= this.thresholds[i].threshold){
				if (this.uniqueRegister && this.thresholds[i].item.unique && this.uniqueRegister[this.thresholds[i].item.code]){
					i = 0;
					number = Util.rand(0, this.generationChanceTotal);
					continue
				}
				return this.thresholds[i].item.code;
			}
		}
		return this.thresholds[0].item.code;
	}
}

module.exports = ItemPopulator;
},{"./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/KramgineExporter.class.js":[function(require,module,exports){
function KramgineExporter(config){
	this.config = config;
}

KramgineExporter.prototype = {
	getLevel: function(level){
		this.initTileDefs(level.ceilingHeight);
		var tiles = this.getTiles();
		var objects = this.getObjects(level);
		var map = this.getMap(level, objects);
		return {
			tiles: tiles,
			objects: objects,
			map: map
		};
	},
	initTileDefs: function(ceilingHeight){
		this.tiles = [];
		this.tilesMap = [];
		this.tiles.push(null);
		this.ceilingHeight = ceilingHeight;
		this.addTile('STONE_WALL_1', 4, 0, 0, 0);
		this.addTile('STONE_WALL_2', 5, 0, 0, 0);
		this.addTile('STONE_WALL_3', 6, 0, 0, 0);
		this.addTile('STONE_WALL_4', 7, 0, 0, 0);
		this.addTile('STONE_WALL_5', 8, 0, 0, 0);
		this.addTile('STONE_WALL_6', 9, 0, 0, 0);
		this.addTile('CAVERN_WALL_1', 10, 0, 0, 0);
		this.addTile('CAVERN_WALL_2', 11, 0, 0, 0);
		this.addTile('CAVERN_WALL_3', 12, 0, 0, 0);
		
		this.addTile('CAVERN_FLOOR_1', 0, 5, 3, 0);
		this.addTile('CAVERN_FLOOR_2', 0, 6, 3, 0);
		this.addTile('CAVERN_FLOOR_3', 0, 7, 3, 0);
		this.addTile('CAVERN_FLOOR_4', 0, 8, 3, 0);
		this.addTile('STONE_FLOOR_1', 0, 9, 3, 0);
		this.addTile('STONE_FLOOR_2', 0, 10, 3, 0);
		this.addTile('STONE_FLOOR_3', 0, 11, 3, 0);
		
		this.addTile('BRIDGE', 0, 4, 3, 0);
		this.addTile('WATER', 0, 101, 3, 0);
		this.addTile('LAVA', 0, 103, 3, 0);
		this.addTile('STAIRS_DOWN', 0, 50, 3, 0);
		this.addTile('STAIRS_UP', 0, 5, 50, 0);
	},
	addTile: function (id, wallTexture, floorTexture, ceilTexture, floorHeight){
		var tile = this.createTile(wallTexture, floorTexture, ceilTexture, floorHeight, this.ceilingHeight);
		this.tiles.push(tile);
		this.tilesMap[id] = this.tiles.length - 1;
	},
	getTile: function(id, type){
		if (!type)
			return this.tilesMap[id];
		var tile = this.tilesMap[id+"_"+type];
		if (tile)
			return tile;
		else
			return this.tilesMap[id+"_1"];
	},
	createTile: function(wallTexture, floorTexture, ceilTexture, floorHeight, height){
		return {
			w: wallTexture,
			y: floorHeight,
			h: height,
			f: floorTexture,
			fy: floorHeight,
			c: ceilTexture,
			ch: height,
			sl: 0,
			dir: 0
		};
	},
	getTiles: function(){
		return this.tiles;
	},
	getObjects: function(level){
		var objects = [];
		objects.push({
			x: level.start.x + 0.5,
			z: level.start.y + 0.5,
			y: 0,
			dir: 3,
			type: 'player'
		});
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			var enemyData =
			{
	            x: enemy.x + 0.5,
	            z: enemy.y + 0.5,
	            y: 0,
	            type: 'enemy',
	            enemy: enemy.code
	        };
			objects.push(enemyData);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			var itemData =
			{
	            x: item.x + 0.5,
	            z: item.y + 0.5,
	            y: 0,
	            type: 'item',
	            item: item.code
	        };
			objects.push(itemData);
		}
		for (var i = 0; i < level.features.length; i++){
			var feature = level.features[i];
			var itemData =
			{
	            x: feature.x + 0.5,
	            z: feature.y + 0.5,
	            y: 0,
	            type: 'item', //TODO: Change to feature once it's supported
	            item: feature.code //TODO: Change to feature once it's supported
	        };
			objects.push(itemData);
		}
		return objects;
	},
	getMap: function(level, objects){
		var map = [];
		var cells = level.cells;
		for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
			map[y] = [];
			for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
				var cell = cells[x][y];
				var area = level.getArea(x,y);
				if (!area.wallType)
					area.wallType = 1;
				if (!area.floorType)
					area.floorType = 1;
				var id = null;
				if (cell === 'water'){
					id = this.getTile("WATER");
				} else if (cell === 'fakeWater'){
					id = this.getTile("WATER");
				}else if (cell === 'solidRock'){
					id = this.getTile("CAVERN_WALL", 1);
				}else if (cell === 'grayRock'){
					id = this.getTile("CAVERN_WALL", 2);
				}else if (cell === 'darkRock'){
					id = this.getTile("CAVERN_WALL", 3);
				}else if (cell === 'cavernFloor'){ 
					id = this.getTile("CAVERN_FLOOR", area.floorType);
				}else if (cell === 'downstairs'){
					id = this.getTile("STAIRS_DOWN");
					objects.push({
						x: x + 0.5,
			            z: y + 0.5,
			            y: 0,
			            type: 'stairs',
			            dir: 'down'
					});
				}else if (cell === 'upstairs'){
					id = this.getTile("STAIRS_UP");
					if (level.depth > 1)
						objects.push({
							x: x + 0.5,
				            z: y + 0.5,
				            y: 0,
				            type: 'stairs',
				            dir: 'up'
						});
				}else if (cell === 'stoneWall'){
					id = this.getTile("STONE_WALL", area.wallType);
				}else if (cell === 'stoneFloor'){
					id = this.getTile("STONE_FLOOR",area.floorType);
				}else if (cell === 'corridor'){
					id = this.getTile("STONE_FLOOR", 1);
				}else if (cell === 'bridge'){
					id = this.getTile("BRIDGE");
				}else if (cell === 'lava'){
					id = this.getTile("LAVA");
				}
				map[y][x] = id;
			}
		}
		return map;
	}
}

module.exports = KramgineExporter;

},{}],"/home/administrator/git/stygiangen/src/Level.class.js":[function(require,module,exports){
function Level(config){
	this.config = config;
};

var Util = require('./Utils');

Level.prototype = {
	init: function(){
		this.cells = [];
		this.enemies = [];
		this.enemiesMap = {};
		this.items = [];
		this.features = [];
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			this.cells[x] = [];
		}
	},
	addEnemy: function(enemy, x, y){
		var enemy = {
			code: enemy,
			x: x,
			y: y
		};
		this.enemies.push(enemy);
		this.enemiesMap[x+"_"+y] = enemy;
	},
	getEnemy: function(x,y){
		return this.enemiesMap[x+"_"+y];
	},
	addItem: function(item, x, y){
		this.items.push({
			code: item,
			x: x,
			y: y
		});
	},
	addFeature: function(feature, x, y){
		this.features.push({
			code: feature,
			x: x,
			y: y
		});
	},
	getFreePlace: function(area, onlyWater, noWater){
		var tries = 0;
		while(true){
			var randPoint = {
				x: Util.rand(area.x, area.x+area.w-1),
				y: Util.rand(area.y, area.y+area.h-1)
			}
			var cell = this.cells[randPoint.x][randPoint.y]; 
			if (onlyWater){
				if (cell == 'water' || cell == 'fakeWater')
					return randPoint;
				else
					tries++;
				if (tries > 1000)
					return false;
			}  else if (noWater){
				if (cell == 'water' || cell == 'fakeWater'){
					tries++;
					if (tries > 1000)
						return false;
				} else if (cell == area.floor || area.corridor && cell == area.corridor) {
					return randPoint;
				}
			} else if (cell == area.floor || area.corridor && cell == area.corridor || cell == 'fakeWater')
				return randPoint;
		}
	},
	isFreeAround: function(spot, area){
		for (var x = -1; x <= 1; x++){
			for (var y = -1; y <= 1; y++){
				if (x == 0 && y == 0)
					continue;
				var cell = this.cells[spot.x + x][spot.y + y];
				if (cell != area.floor)
					return false;
			}
		}
		return true;
	},
	getFreePlaceOnLevel: function(onlyWater, noWater){
		var tries = 0;
		while(true){
			var randPoint = {
				x: Util.rand(0, this.cells.length - 1),
				y: Util.rand(0, this.cells[0].length - 1)
			}
			var cell = this.cells[randPoint.x][randPoint.y]; 
			if (onlyWater){
				if (cell == 'water' || cell == 'fakeWater')
					return randPoint;
				else
					tries++;
				if (tries > 1000)
					return false;
			}  else if (noWater){
				if (cell == 'water' || cell == 'fakeWater'){
					tries++;
					if (tries > 1000)
						return false;
				} else if (cell == 'stoneFloor' || cell == 'cavernFloor') {
					return randPoint;
				}
			} else if (cell == 'stoneFloor' || cell == 'cavernFloor' || cell == 'fakeWater')
				return randPoint;
		}
	},
	getArea: function(x,y){
		for (var i = 0; i < this.areasSketch.length; i++){
			var area = this.areasSketch[i];
			if (x >= area.x && x < area.x + area.w
					&& y >= area.y && y < area.y + area.h)
				return area;
		}
		return false;
	}
};

module.exports = Level;
},{"./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/MonsterPopulator.class.js":[function(require,module,exports){
function MonsterPopulator(config){
	this.config = config;
}

var Util = require('./Utils');

MonsterPopulator.prototype = {
	populateLevel: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			if (area.hasEntrance)
				continue;
			this.populateArea(area, level);
		}
		this.populateVermin(level);
	},
	populateVermin: function( level){
		var tries = 0;
		var vermin = 30;
		for (var i = 0; i < vermin; i++){
			var monster = Util.randomElementOf(level.vermin);
			var onlyWater = this.isWaterMonster(monster);
			var noWater = !onlyWater && !this.isFlyingMonster(monster);
			var position = level.getFreePlaceOnLevel(onlyWater, noWater);
			if (position){
				if (level.getEnemy(position.x, position.y)){
					tries++;
					if (tries < 100){
						i--;
					} else {
						tries = 0;
					}
					continue;
				}
				level.addEnemy(monster, position.x, position.y);
			}
		}
	},
	populateArea: function(area, level){
		if (area.boss){
			var position = level.getFreePlace(area, false, true);
			if (position){
				level.addEnemy(area.boss, position.x, position.y);
			}
		}
		var tries = 0;
		for (var i = 0; i < area.enemyCount; i++){
			var monster = Util.randomElementOf(area.enemies);
			var onlyWater = this.isWaterMonster(monster);
			var noWater = !onlyWater && !this.isFlyingMonster(monster);
			var position = level.getFreePlace(area, onlyWater, noWater);
			if (position){
				if (level.getEnemy(position.x, position.y)){
					tries++;
					if (tries < 100){
						i--;
					} else {
						tries = 0;
					}
					continue;
				}
				level.addEnemy(monster, position.x, position.y);
			}
		}
	},
	isWaterMonster: function(monster){
		return monster == 'octopus' || monster == 'seaSerpent'; 
	},
	isFlyingMonster: function(monster){
		return monster == 'bat' || monster == 'mongbat' || monster == 'ghost' || monster == 'dragon' || monster == 'gazer'; 
	}
}

module.exports = MonsterPopulator;
},{"./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/SecondLevelGenerator.class.js":[function(require,module,exports){
function SecondLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Level = require('./Level.class');
var CA = require('./CA');

SecondLevelGenerator.prototype = {
	fillLevel: function(sketch){
		var level = new Level(this.config);
		level.init();
		this.fillStrata(level, sketch);
		level.ceilingHeight = sketch.ceilingHeight;
		level.depth = sketch.depth;
		level.vermin = sketch.vermin;
		if (sketch.hasLava)
			this.plotRivers(level, sketch, 'lava');
		else if (sketch.hasRivers)
			this.plotRivers(level, sketch, 'water');
		this.copyGeo(level);
		return level;
	},
	fillStrata: function(level, sketch){
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				level.cells[x][y] = sketch.strata;
			}
		}
	},
	copyGeo: function(level){
		var geo = [];
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			geo[x] = [];
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				geo[x][y] = level.cells[x][y];
			}
		}
		level.geo = geo;
	},
	plotRivers: function(level, sketch, liquid){
		this.placeRiverlines(level, sketch, liquid);
		this.fattenRivers(level, liquid);
		if (liquid == 'lava')
			this.fattenRivers(level, liquid);
	},
	fattenRivers: function(level, liquid){
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding[liquid] > 1 && Util.chance(30))
				return liquid;
			return false;
		}, 1, true);
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding[liquid] > 1)
				return liquid;
			return false;
		}, 1, true);
	},
	placeRiverlines: function(level, sketch, liquid){
		// Place random line segments of water
		var rivers = Util.rand(this.config.MIN_RIVERS,this.config.MAX_RIVERS);
		var riverSegmentLength = this.config.RIVER_SEGMENT_LENGTH;
		var puddle = false;
		for (var i = 0; i < rivers; i++){
			var segments = Util.rand(this.config.MIN_RIVER_SEGMENTS,this.config.MAX_RIVER_SEGMENTS);
			var riverPoints = [];
			riverPoints.push({
				x: Util.rand(0, this.config.LEVEL_WIDTH),
				y: Util.rand(0, this.config.LEVEL_HEIGHT)
			});
			for (var j = 0; j < segments; j++){
				var randomPoint = Util.randomElementOf(riverPoints);
				if (riverPoints.length > 1 && !puddle)
					Util.removeFromArray(riverPoints, randomPoint);
				var iance = {
					x: Util.rand(-riverSegmentLength, riverSegmentLength),
					y: Util.rand(-riverSegmentLength, riverSegmentLength)
				};
				var newPoint = {
					x: randomPoint.x + iance.x,
					y: randomPoint.y + iance.y,
				};
				if (newPoint.x > 0 && newPoint.x < this.config.LEVEL_WIDTH && 
					newPoint.y > 0 && newPoint.y < this.config.LEVEL_HEIGHT)
					riverPoints.push(newPoint);
				var line = Util.line(randomPoint, newPoint);
				for (var k = 0; k < line.length; k++){
					var point = line[k];
					if (point.x > 0 && point.x < this.config.LEVEL_WIDTH && 
						point.y > 0 && point.y < this.config.LEVEL_HEIGHT)
					level.cells[point.x][point.y] = liquid;
				}
			}
		}
	},
	frameLevel: function(sketch, level){
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			if (level.cells[x][0] != 'stoneWall') level.cells[x][0] = sketch.strata;
			if (level.cells[x][this.config.LEVEL_HEIGHT-1] != 'stoneWall') level.cells[x][this.config.LEVEL_HEIGHT-1] = sketch.strata;
		}
		for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
			if (level.cells[0][y] != 'stoneWall') level.cells[0][y] = sketch.strata;
			if (level.cells[this.config.LEVEL_WIDTH-1][y] != 'stoneWall') level.cells[this.config.LEVEL_WIDTH-1][y] = sketch.strata;
		}
	}
}

module.exports = SecondLevelGenerator;
},{"./CA":"/home/administrator/git/stygiangen/src/CA.js","./Level.class":"/home/administrator/git/stygiangen/src/Level.class.js","./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/Splitter.js":[function(require,module,exports){
var Util = require('./Utils');

module.exports = {
	subdivideArea: function(bigArea, maxDepth, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, SLICE_RANGE_START, SLICE_RANGE_END, avoidPoints){
		var areas = [];
		var bigAreas = [];
		bigArea.depth = 0;
		bigAreas.push(bigArea);
		var retries = 0;
		while (bigAreas.length > 0){
			var bigArea = bigAreas.pop();
			if (bigArea.w < MIN_WIDTH + 1 && bigArea.h < MIN_HEIGHT + 1){
				bigArea.bridges = [];
				areas.push(bigArea);
				continue;
			}
			var horizontalSplit = Util.chance(50);
			if (bigArea.w < MIN_WIDTH + 1){
				horizontalSplit = true;
			} 
			if (bigArea.h < MIN_HEIGHT + 1){
				horizontalSplit = false;
			}
			var area1 = null;
			var area2 = null;
			if (horizontalSplit){
				var slice = Math.round(Util.rand(bigArea.h * SLICE_RANGE_START, bigArea.h * SLICE_RANGE_END));
				area1 = {
					x: bigArea.x,
					y: bigArea.y,
					w: bigArea.w,
					h: slice
				};
				area2 = {
					x: bigArea.x,
					y: bigArea.y + slice,
					w: bigArea.w,
					h: bigArea.h - slice
				}
			} else {
				var slice = Math.round(Util.rand(bigArea.w * SLICE_RANGE_START, bigArea.w * SLICE_RANGE_END));
				area1 = {
					x: bigArea.x,
					y: bigArea.y,
					w: slice,
					h: bigArea.h
				}
				area2 = {
					x: bigArea.x+slice,
					y: bigArea.y,
					w: bigArea.w-slice,
					h: bigArea.h
				};
			}
			if (area1.w < MIN_WIDTH || area1.h < MIN_HEIGHT ||
				area2.w < MIN_WIDTH || area2.h < MIN_HEIGHT){
				if (retries > 100){
					bigArea.bridges = [];
					areas.push(bigArea);
					retries = 0;
				} else {
					bigAreas.push(bigArea);
					retries++;
				}	
				continue;
			}
			if (bigArea.depth == maxDepth && 
					(area1.w > MAX_WIDTH || area1.h > MAX_HEIGHT ||
					area2.w > MAX_WIDTH || area2.h > MAX_HEIGHT)){
				if (retries < 100) {
					// Push back big area
					bigAreas.push(bigArea);
					retries++;
					continue;
				}
				retries = 0;
			}
			if (avoidPoints && (this.collidesWith(avoidPoints, area2) || this.collidesWith(avoidPoints, area1))){
				if (retries > 100){
					bigArea.bridges = [];
					areas.push(bigArea);
					retries = 0;
				} else {
					// Push back big area
					bigAreas.push(bigArea);
					retries++;
				}		
				continue; 
			}
			if (bigArea.depth == maxDepth){
				area1.bridges = [];
				area2.bridges = [];
				areas.push(area1);
				areas.push(area2);
			} else {
				area1.depth = bigArea.depth +1;
				area2.depth = bigArea.depth +1;
				bigAreas.push(area1);
				bigAreas.push(area2);
			}
		}
		return areas;
	},
	collidesWith: function(avoidPoints, area){
		for (var i = 0; i < avoidPoints.length; i++){
			var avoidPoint = avoidPoints[i];
			if (Util.flatDistance(area.x, area.y, avoidPoint.x, avoidPoint.y) <= 2 ||
				Util.flatDistance(area.x+area.w, area.y, avoidPoint.x, avoidPoint.y) <= 2 ||
				Util.flatDistance(area.x, area.y+area.h, avoidPoint.x, avoidPoint.y) <= 2 ||
				Util.flatDistance(area.x+area.w, area.y+area.h, avoidPoint.x, avoidPoint.y) <= 2){
				return true;
			}
		}
		return false;
	},
	connectAreas: function(areas, border){
		/* Make one area connected
		 * While not all areas connected,
		 *  Select a connected area
		 *  Select a valid wall from the area
		 *  Tear it down, connecting to the a nearby area
		 *  Mark area as connected
		 */
		if (!border){
			border = 1;
		}
		var connectedAreas = [];
		var randomArea = Util.randomElementOf(areas);
		connectedAreas.push(randomArea);
		var cursor = {};
		var vari = {};
		area: while (connectedAreas.length < areas.length){
			randomArea = Util.randomElementOf(connectedAreas);
			var wallDir = Util.rand(1,4);
			switch(wallDir){
			case 1: // Left
				cursor.x = randomArea.x;
				cursor.y = Util.rand(randomArea.y + border , randomArea.y+randomArea.h - border);
				vari.x = -2;
				vari.y = 0;
				break;
			case 2: //Right
				cursor.x = randomArea.x + randomArea.w;
				cursor.y = Util.rand(randomArea.y + border, randomArea.y+randomArea.h - border);
				vari.x = 2;
				vari.y = 0;
				break;
			case 3: //Up
				cursor.x = Util.rand(randomArea.x + border, randomArea.x+randomArea.w - border);
				cursor.y = randomArea.y;
				vari.x = 0;
				vari.y = -2;
				break;
			case 4: //Down
				cursor.x = Util.rand(randomArea.x + border, randomArea.x+randomArea.w - border);
				cursor.y = randomArea.y + randomArea.h;
				vari.x = 0;
				vari.y = 2;
				break;
			}
			var connectedArea = this.getAreaAt(cursor, vari, areas);
			if (connectedArea && !Util.contains(connectedAreas, connectedArea)){
				switch(wallDir){
				case 1:
				case 2:
					if (cursor.y <= connectedArea.y + border || cursor.y >= connectedArea.y + connectedArea.h - border)
						continue area;
					break;
				case 3:
				case 4:
					if (cursor.x <= connectedArea.x + border || cursor.x >= connectedArea.x + connectedArea.w - border)
						continue area;
					break;
				}
				
				this.connectArea(randomArea, connectedArea, cursor);
				connectedAreas.push(connectedArea);
			}
		}
	},
	getAreaAt: function(cursor, vari, areas){
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			if (cursor.x + vari.x >= area.x && cursor.x + vari.x <= area.x + area.w 
					&& cursor.y + vari.y >= area.y && cursor.y + vari.y <= area.y + area.h)
				return area;
		}
		return false;
	},
	connectArea: function(area1, area2, position){
		area1.bridges.push({
			x: position.x,
			y: position.y,
			to: area2
		});
		area2.bridges.push({
			x: position.x,
			y: position.y,
			to: area1
		});
	}
}
},{"./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/ThirdLevelGenerator.class.js":[function(require,module,exports){
function ThirdLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var CA = require('./CA');
var Splitter = require('./Splitter');

ThirdLevelGenerator.prototype = {
	fillLevel: function(sketch, level){
		this.fillRooms(sketch, level)
		this.fattenCaverns(level);
		this.placeExits(sketch, level);
		this.raiseIslands(level);
		this.enlargeBridges(level);
		this.placeFeatures(sketch, level);
		level.areasSketch = sketch.areas;
		return level;
	},
	fattenCaverns: function(level){
		// Grow caverns
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding['cavernFloor'] > 0 && Util.chance(20))
				return 'cavernFloor';
			return false;
		}, 1, true);
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding['cavernFloor'] > 1)
				return 'cavernFloor';
			return false;
		}, 1, true);
		// Grow lagoon areas
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding['fakeWater'] > 0 && Util.chance(40))
				return 'fakeWater';
			return false;
		}, 1, true);
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (surrounding['fakeWater'] > 0)
				return 'fakeWater';
			return false;
		}, 1, true);
		
		
		// Expand wall-less rooms
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'solidRock')
				return false;
			if (surrounding['stoneFloor'] > 2 && Util.chance(10))
				return 'cavernFloor';
			return false;
		}, 1);
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'solidRock')
				return false;
			if (surrounding['stoneFloor'] > 0 && surrounding['cavernFloor']>0)
				return 'cavernFloor';
			return false;
		}, 1, true);
		// Deteriorate wall rooms
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'stoneWall')
				return false;
			if (surrounding['stoneFloor'] > 0 && Util.chance(5))
				return 'stoneFloor';
			return false;
		}, 1, true);
		
	},
	enlargeBridges: function(level){
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'lava' && current != 'water' && current != 'fakeWater')
				return false;
			/*if (surrounding['cavernFloor'] > 0 || surrounding['stoneFloor'] > 0)
				return false;*/
			if (surrounding['bridge'] > 0)
				return 'bridge';
		}, 1, true);
	},
	raiseIslands: function(level){
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'water')
				return false;
			var caverns = surrounding['cavernFloor']; 
			if (caverns > 0 && Util.chance(70))
				return 'cavernFloor';
			return false;
		}, 1, true);
		// Island for exits on water
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'fakeWater' && current != 'water')
				return false;
			var stairs = surrounding['downstairs'] ? surrounding['downstairs'] : 0 +
					surrounding['upstairs'] ? surrounding['upstairs'] : 0; 
			if (stairs > 0)
				return 'cavernFloor';
			return false;
		}, 1);
	},
	fillRooms: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			var type = area.areaType;
			if (type === 'cavern'){ 
				this.fillWithCavern(level, area);
			} else if (type === 'rooms'){
				this.fillWithRooms(level, area);
			}
		}
	},
	placeExits: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			if (!area.hasExit && !area.hasEntrance)
				continue;
			var tile = null;
			if (area.hasExit){
				tile = 'downstairs';
			} else {
				tile = 'upstairs';
			}
			var freeSpot = level.getFreePlace(area);
			if (freeSpot.x == 0 || freeSpot.y == 0 || freeSpot.x == level.cells.length - 1 || freeSpot.y == level.cells[0].length - 1){
				i--;
				continue;
			}
			level.cells[freeSpot.x][freeSpot.y] = tile;
			if (area.hasExit){
				level.end = {
					x: freeSpot.x,
					y: freeSpot.y
				};
			} else {
				level.start = {
					x: freeSpot.x,
					y: freeSpot.y
				};
			}
		}
	},
	placeFeatures: function(sketch, level){
		var tries = 0;
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			if (!area.feature)
				continue;
			var freeSpot = level.getFreePlace(area);
			if (freeSpot.x == 0 || freeSpot.y == 0 || freeSpot.x == level.cells.length - 1 || freeSpot.y == level.cells[0].length - 1){
				i--;
				continue;
			}
			if (!level.isFreeAround(freeSpot, area) ||
				(Math.abs(freeSpot.x - level.end.x) < 3 && Math.abs(freeSpot.y - level.end.y) < 3) ||
				(Math.abs(freeSpot.x - level.start.x) < 3 && Math.abs(freeSpot.y - level.start.y) < 3)
					){
				tries++;
				if (tries > 100){
					tries = 0;
				} else {
					i--;
				}
				continue;
			}
			level.addFeature(area.feature, freeSpot.x, freeSpot.y);
		}
	},
	fillWithCavern: function(level, area){
		// Connect all bridges with midpoint
		var midpoint = {
			x: Math.round(Util.rand(area.x + area.w * 1/3, area.x+area.w * 2/3)),
			y: Math.round(Util.rand(area.y + area.h * 1/3, area.y+area.h * 2/3))
		}
		for (var i = 0; i < area.bridges.length; i++){
			var bridge = area.bridges[i];
			var line = Util.line(midpoint, bridge);
			for (var j = 0; j < line.length; j++){
				var point = line[j];
				var currentCell = level.cells[point.x][point.y];
				if (area.cavernType == 'rocky')
					level.cells[point.x][point.y] = area.floor;
				else if (currentCell == 'water' || currentCell == 'lava'){
					if (area.floor != 'fakeWater' && area.cavernType == 'bridges')
						level.cells[point.x][point.y] = 'bridge';
					else
						level.cells[point.x][point.y] = 'fakeWater';
				} else {
					level.cells[point.x][point.y] = area.floor;
				}
			}
		}
		// Scratch the area
		var scratches = Util.rand(2,4);
		var caveSegments = [];
		caveSegments.push(midpoint);
		for (var i = 0; i < scratches; i++){
			var p1 = Util.randomElementOf(caveSegments);
			if (caveSegments.length > 1)
				Util.removeFromArray(caveSegments, p1);
			var p2 = {
				x: Util.rand(area.x, area.x+area.w-1),
				y: Util.rand(area.y, area.y+area.h-1)
			}
			caveSegments.push(p2);
			var line = Util.line(p2, p1);
			for (var j = 0; j < line.length; j++){
				var point = line[j];
				var currentCell = level.cells[point.x][point.y];
				if (currentCell != 'water')  
					level.cells[point.x][point.y] = area.floor;
			}
		}
	},
	fillWithRooms: function(level, area){
		var bigArea = {
			x: area.x,
			y: area.y,
			w: area.w,
			h: area.h
		}
		var maxDepth = 2;
		var MIN_WIDTH = 6;
		var MIN_HEIGHT = 6;
		var MAX_WIDTH = 10;
		var MAX_HEIGHT = 10;
		var SLICE_RANGE_START = 3/8;
		var SLICE_RANGE_END = 5/8;
		var areas = Splitter.subdivideArea(bigArea, maxDepth, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, SLICE_RANGE_START, SLICE_RANGE_END, area.bridges);
		Splitter.connectAreas(areas, area.wall ? 2 : 1); 
		var bridgeAreas = [];
		for (var i = 0; i < areas.length; i++){
			var subarea = areas[i];
			for (var j = 0; j < area.bridges.length; j++){
				var bridge = area.bridges[j];
				if (Splitter.getAreaAt(bridge,{x:0,y:0}, areas) == subarea){
					if (!Util.contains(bridgeAreas, subarea)){
						bridgeAreas.push(subarea);
					}
					subarea.bridges.push({
						x: bridge.x,
						y: bridge.y
					});
				}
			}
		}
		this.useAreas(bridgeAreas, areas, bigArea);
		for (var i = 0; i < areas.length; i++){
			var subarea = areas[i];
			if (!subarea.render)
				continue;
			subarea.floor = area.floor;
			subarea.wall = area.wall;
			subarea.corridor = area.corridor;
			this.carveRoomAt(level, subarea);
		}
	},
	carveRoomAt: function(level, area){
		var minbox = {
			x: area.x + Math.floor(area.w / 2)-1,
			y: area.y + Math.floor(area.h / 2)-1,
			x2: area.x + Math.floor(area.w / 2)+1,
			y2: area.y + Math.floor(area.h / 2)+1,
		};
		// Trace corridors from exits
		for (var i = 0; i < area.bridges.length; i++){
			var bridge = area.bridges[i];
			var verticalBridge = false;
			var horizontalBridge = false;
			if (bridge.x == area.x){
				// Left Corridor
				horizontalBridge = true;
				for (var j = bridge.x; j < bridge.x + area.w / 2; j++){
					if (area.wall){
						if (level.cells[j][bridge.y-1] != area.corridor) level.cells[j][bridge.y-1] = area.wall;
						if (level.cells[j][bridge.y+1] != area.corridor) level.cells[j][bridge.y+1] = area.wall;
					}
					if (level.cells[j][bridge.y] == 'water' || level.cells[j][bridge.y] == 'lava'){ 
						level.cells[j][bridge.y] = 'bridge';
					} else {
						level.cells[j][bridge.y] = area.corridor;
					}
						
				}
			} else if (bridge.x == area.x + area.w){
				// Right corridor
				horizontalBridge = true;
				for (var j = bridge.x; j >= bridge.x - area.w / 2; j--){
					if (area.wall){
						if (level.cells[j][bridge.y-1] != area.corridor) level.cells[j][bridge.y-1] = area.wall;
						if (level.cells[j][bridge.y+1] != area.corridor) level.cells[j][bridge.y+1] = area.wall;
					} 
					if (level.cells[j][bridge.y] == 'water' || level.cells[j][bridge.y] == 'lava'){ 
						level.cells[j][bridge.y] = 'bridge';
					} else {
						level.cells[j][bridge.y] = area.corridor;
					}
				}
			} else if (bridge.y == area.y){
				// Top corridor
				verticalBridge = true;
				for (var j = bridge.y; j < bridge.y + area.h / 2; j++){
					if (area.wall){
						if (level.cells[bridge.x-1][j] != area.corridor) level.cells[bridge.x-1][j] = area.wall;
						if (level.cells[bridge.x+1][j] != area.corridor) level.cells[bridge.x+1][j] = area.wall;
					} 
					if (level.cells[bridge.x][j] == 'water' || level.cells[bridge.x][j] == 'lava'){ 
						level.cells[bridge.x][j] = 'bridge';
					} else {
						level.cells[bridge.x][j] = area.corridor;
					}
				}
			} else {
				// Down Corridor
				verticalBridge = true;
				for (var j = bridge.y; j >= bridge.y - area.h / 2; j--){
					if (area.wall){
						if (level.cells[bridge.x-1][j] != area.corridor) level.cells[bridge.x-1][j] = area.wall;
						if (level.cells[bridge.x+1][j] != area.corridor) level.cells[bridge.x+1][j] = area.wall; 
					} 
					if (level.cells[bridge.x][j] == 'water' || level.cells[bridge.x][j] == 'lava'){ 
						level.cells[bridge.x][j] = 'bridge';
					} else {
						level.cells[bridge.x][j] = area.corridor;
					}
				}
			}
			if (verticalBridge){
				if (bridge.x < minbox.x)
					minbox.x = bridge.x;
				if (bridge.x > minbox.x2)
					minbox.x2 = bridge.x;
			}
			if (horizontalBridge){
				if (bridge.y < minbox.y)
					minbox.y = bridge.y;
				if (bridge.y > minbox.y2)
					minbox.y2 = bridge.y;
			}
		}
		var minPadding = 0;
		if (area.wall)
			minPadding = 1;
		var padding = {
			top: Util.rand(minPadding, minbox.y - area.y - minPadding),
			bottom: Util.rand(minPadding, area.y + area.h - minbox.y2 - minPadding),
			left: Util.rand(minPadding, minbox.x - area.x - minPadding),
			right: Util.rand(minPadding, area.x + area.w - minbox.x2 - minPadding)
		};
		if (padding.top < 0) padding.top = 0;
		if (padding.bottom < 0) padding.bottom = 0;
		if (padding.left < 0) padding.left = 0;
		if (padding.right < 0) padding.right = 0;
		var roomx = area.x;
		var roomy = area.y;
		var roomw = area.w;
		var roomh = area.h;
		for (var x = roomx; x < roomx + roomw; x++){
			for (var y = roomy; y < roomy + roomh; y++){
				var drawWall = area.wall && level.cells[x][y] != area.corridor && level.cells[x][y] != 'bridge'; 
				if (y < roomy + padding.top){
					if (drawWall && y == roomy + padding.top - 1 && x + 1 >= roomx + padding.left && x <= roomx + roomw - padding.right)
						level.cells[x][y] = area.wall;
				} else if (x < roomx + padding.left){
					if (drawWall && x == roomx + padding.left - 1 && y >= roomy + padding.top && y <= roomy + roomh - padding.bottom)
						level.cells[x][y] = area.wall;
				} else if (y > roomy + roomh - 1 - padding.bottom){
					if (drawWall && y == roomy + roomh - padding.bottom && x + 1 >= roomx + padding.left && x <= roomx + roomw - padding.right)
						level.cells[x][y] = area.wall;
				} else if (x > roomx + roomw - 1 - padding.right){
					if (drawWall && x == roomx + roomw - padding.right && y >= roomy + padding.top && y <= roomy + roomh - padding.bottom)
						level.cells[x][y] = area.wall;
				} else if (area.marked)
					level.cells[x][y] = 'padding';
				else
					level.cells[x][y] = area.floor;
			}
		}
		
	},
	useAreas: function(keepAreas, areas, bigArea){
		// All keep areas should be connected with a single pivot area
		var pivotArea = Splitter.getAreaAt({x: Math.round(bigArea.x + bigArea.w/2), y: Math.round(bigArea.y + bigArea.h/2)},{x:0,y:0}, areas);
		var pathAreas = [];
		for (var i = 0; i < keepAreas.length; i++){
			var keepArea = keepAreas[i];
			keepArea.render = true;
			var areasPath = this.getDrunkenAreasPath(keepArea, pivotArea, areas);
			for (var j = 0; j < areasPath.length; j++){
				areasPath[j].render = true;
			}
		}
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			if (!area.render){
				bridgesRemove: for (var j = 0; j < area.bridges.length; j++){
					var bridge = area.bridges[j];
					if (!bridge.to)
						continue;
					for (var k = 0; k < bridge.to.bridges.length; k++){
						var sourceBridge = bridge.to.bridges[k];
						if (sourceBridge.x == bridge.x && sourceBridge.y == bridge.y){
							Util.removeFromArray(bridge.to.bridges, sourceBridge);
						}
					}
				}
			}
		}
	},
	getDrunkenAreasPath: function (fromArea, toArea, areas){
		var currentArea = fromArea;
		var path = [];
		path.push(fromArea);
		path.push(toArea);
		if (fromArea == toArea)
			return path;
		while (true){
			var randomBridge = Util.randomElementOf(currentArea.bridges);
			if (!randomBridge.to)
				continue;
			if (!Util.contains(path, randomBridge.to)){
				path.push(randomBridge.to);
			}
			if (randomBridge.to == toArea)
				break;
			currentArea = randomBridge.to;
		}
		return path;
	}
	
}

module.exports = ThirdLevelGenerator;
},{"./CA":"/home/administrator/git/stygiangen/src/CA.js","./Splitter":"/home/administrator/git/stygiangen/src/Splitter.js","./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/Utils.js":[function(require,module,exports){
module.exports = {
	rand: function (low, hi){
		return Math.floor(Math.random() * (hi - low + 1))+low;
	},
	randomElementOf: function (array){
		return array[Math.floor(Math.random()*array.length)];
	},
	distance: function (x1, y1, x2, y2) {
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	},
	flatDistance: function(x1, y1, x2, y2){
		var xDist = Math.abs(x1 - x2);
		var yDist = Math.abs(y1 - y2);
		if (xDist === yDist)
			return xDist;
		else
			return xDist + yDist;
	},
	lineDistance: function(point1, point2){
	  var xs = 0;
	  var ys = 0;
	  xs = point2.x - point1.x;
	  xs = xs * xs;
	  ys = point2.y - point1.y;
	  ys = ys * ys;
	  return Math.sqrt( xs + ys );
	},
	direction: function (a,b){
		return {x: sign(b.x - a.x), y: sign(b.y - a.y)};
	},
	chance: function (chance){
		return this.rand(0,100) <= chance;
	},
	contains: function(array, element){
	    return array.indexOf(element) > -1;
	},
	removeFromArray: function(array, object) {
		for (var i = 0; i < array.length; i++){
			if (array[i] == object){
				this.removeFromArrayIndex(array, i,i);
				return;
			}
		}
	},
	removeFromArrayIndex: function(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	},
	line: function (a, b){
		var coordinatesArray = new Array();
		var x1 = a.x;
		var y1 = a.y;
		var x2 = b.x;
		var y2 = b.y;
	    var dx = Math.abs(x2 - x1);
	    var dy = Math.abs(y2 - y1);
	    var sx = (x1 < x2) ? 1 : -1;
	    var sy = (y1 < y2) ? 1 : -1;
	    var err = dx - dy;
	    coordinatesArray.push({x: x1, y: y1});
	    while (!((x1 == x2) && (y1 == y2))) {
	    	var e2 = err << 1;
	    	if (e2 > -dy) {
	    		err -= dy;
	    		x1 += sx;
	    	}
	    	if (e2 < dx) {
	    		err += dx;
	    		y1 += sy;
	    	}
	    	coordinatesArray.push({x: x1, y: y1});
	    }
	    return coordinatesArray;
	}
}
},{}],"/home/administrator/git/stygiangen/src/VeinGenerator.class.js":[function(require,module,exports){
function VeinGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Level = require('./Level.class');
var CA = require('./CA');

VeinGenerator.prototype = {
	traceVeins: function(sketch, level){
		var veinMap = this.createVeinMap(sketch, level);
		this.seedVeins(veinMap);
		veinMap = this.growVeins(veinMap);
		this.applyVeins(level, veinMap);
	},
	createVeinMap: function(sketch, level){
		var ret = [];
		for (var x = 0; x < level.cells.length; x++){
			ret[x] = [];
			for (var y = 0; y < level.cells[x].length; y++){
				ret[x][y] = sketch.strata;
			}
		}
		return ret;
	},
	seedVeins: function(veinMap){
		var seeds = (veinMap.length * veinMap[0].length) / 16;
		for (var i = 0; i < seeds; i++){
			var point = {
				x: Math.round(Util.rand(1, veinMap.length-2)),
				y: Math.round(Util.rand(1, veinMap[0].length-2))
			}
			var mineral = Util.rand(1,2);
			switch (mineral){
			case 1:
				veinMap[point.x][point.y] = 'grayRock';
				break;
			case 2:
				veinMap[point.x][point.y] = 'darkRock';
				break;
			}
		}
	},
	growVeins: function(veinMap){
		veinMap = CA.runCA(veinMap, function(current, surrounding){
			if (surrounding['grayRock'] > 0 && Util.chance(80))
				return 'grayRock';
			return false;
		}, 3, true);
		veinMap = CA.runCA(veinMap, function(current, surrounding){
			if (surrounding['darkRock'] > 0 && Util.chance(80))
				return 'darkRock';
			return false;
		}, 3, true);
		return veinMap;
	},
	applyVeins: function(level, veinMap){
		for (var x = 0; x < level.cells.length; x++){
			for (var y = 0; y < level.cells[x].length; y++){
				if (level.cells[x][y] == 'solidRock'){
					level.cells[x][y] = veinMap[x][y];
				}
			}
		}
	}
}

module.exports = VeinGenerator;
},{"./CA":"/home/administrator/git/stygiangen/src/CA.js","./Level.class":"/home/administrator/git/stygiangen/src/Level.class.js","./Utils":"/home/administrator/git/stygiangen/src/Utils.js"}],"/home/administrator/git/stygiangen/src/WebTest.js":[function(require,module,exports){
window.Generator = require('./Generator.class');
window.CanvasRenderer = require('./CanvasRenderer.class');
window.KramgineExporter = require('./KramgineExporter.class');
},{"./CanvasRenderer.class":"/home/administrator/git/stygiangen/src/CanvasRenderer.class.js","./Generator.class":"/home/administrator/git/stygiangen/src/Generator.class.js","./KramgineExporter.class":"/home/administrator/git/stygiangen/src/KramgineExporter.class.js"}]},{},["/home/administrator/git/stygiangen/src/WebTest.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvQ0EuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9DYW52YXNSZW5kZXJlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0ZpcnN0TGV2ZWxHZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9HZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9JdGVtUG9wdWxhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvS3JhbWdpbmVFeHBvcnRlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0xldmVsLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvTW9uc3RlclBvcHVsYXRvci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL1NlY29uZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvU3BsaXR0ZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9UaGlyZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvVXRpbHMuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9WZWluR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvV2ViVGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRydW5DQTogZnVuY3Rpb24obWFwLCB0cmFuc2Zvcm1GdW5jdGlvbiwgdGltZXMsIGNyb3NzKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVzOyBpKyspe1xuXHRcdFx0dmFyIG5ld01hcCA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXAubGVuZ3RoOyB4Kyspe1xuXHRcdFx0XHRuZXdNYXBbeF0gPSBbXTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHggPSAwOyB4IDwgbWFwLmxlbmd0aDsgeCsrKXtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBtYXBbeF0ubGVuZ3RoOyB5Kyspe1xuXHRcdFx0XHRcdHZhciBzdXJyb3VuZGluZ01hcCA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIHh4ID0geC0xOyB4eCA8PSB4KzE7IHh4Kyspe1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgeXkgPSB5LTE7IHl5IDw9IHkrMTsgeXkrKyl7XG5cdFx0XHRcdFx0XHRcdGlmIChjcm9zcyAmJiAhKHh4ID09IHggfHwgeXkgPT0geSkpXG5cdFx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHRcdGlmICh4eCA+IDAgJiYgeHggPCBtYXAubGVuZ3RoICYmIHl5ID4gMCAmJiB5eSA8IG1hcFt4XS5sZW5ndGgpe1xuXHRcdFx0XHRcdFx0XHRcdHZhciBjZWxsID0gbWFwW3h4XVt5eV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHN1cnJvdW5kaW5nTWFwW2NlbGxdKVxuXHRcdFx0XHRcdFx0XHRcdFx0c3Vycm91bmRpbmdNYXBbY2VsbF0rKztcblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHRzdXJyb3VuZGluZ01hcFtjZWxsXSA9IDE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIG5ld0NlbGwgPSB0cmFuc2Zvcm1GdW5jdGlvbihtYXBbeF1beV0sIHN1cnJvdW5kaW5nTWFwKTtcblx0XHRcdFx0XHRpZiAobmV3Q2VsbCl7XG5cdFx0XHRcdFx0XHRuZXdNYXBbeF1beV0gPSBuZXdDZWxsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXdNYXBbeF1beV0gPSBtYXBbeF1beV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRtYXAgPSBuZXdNYXA7XG5cdFx0fVxuXHRcdHJldHVybiBtYXA7XG5cdH1cbn0iLCJmdW5jdGlvbiBDYW52YXNSZW5kZXJlcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlID0ge1xuXHRkcmF3U2tldGNoOiBmdW5jdGlvbihsZXZlbCwgY2FudmFzLCBvdmVybGF5KXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcblx0XHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdGNvbnRleHQuZm9udD1cIjE2cHggQXZhdGFyXCI7XG5cdFx0aWYgKCFvdmVybGF5KVxuXHRcdFx0Y29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHR2YXIgem9vbSA9IDg7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IGxldmVsLmFyZWFzW2ldO1xuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdGNvbnRleHQucmVjdChhcmVhLnggKiB6b29tLCBhcmVhLnkgKiB6b29tLCBhcmVhLncgKiB6b29tLCBhcmVhLmggKiB6b29tKTtcblx0XHRcdGlmICghb3ZlcmxheSl7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gJ3llbGxvdyc7XG5cdFx0XHRcdGNvbnRleHQuZmlsbCgpO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSAyO1xuXHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0XHRjb250ZXh0LnN0cm9rZSgpO1xuXHRcdFx0dmFyIGFyZWFEZXNjcmlwdGlvbiA9ICcnO1xuXHRcdFx0aWYgKGFyZWEuYXJlYVR5cGUgPT0gJ3Jvb21zJyl7XG5cdFx0XHRcdGFyZWFEZXNjcmlwdGlvbiA9IFwiRHVuZ2VvblwiO1xuXHRcdFx0fSBlbHNlIGlmIChhcmVhLmZsb29yID09ICdmYWtlV2F0ZXInKXsgXG5cdFx0XHRcdGFyZWFEZXNjcmlwdGlvbiA9IFwiTGFnb29uXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcmVhRGVzY3JpcHRpb24gPSBcIkNhdmVyblwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZWEuaGFzRXhpdCl7XG5cdFx0XHRcdGFyZWFEZXNjcmlwdGlvbiArPSBcIiAoZClcIjtcblx0XHRcdH1cblx0XHRcdGlmIChhcmVhLmhhc0VudHJhbmNlKXtcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uICs9IFwiICh1KVwiO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXHRcdFx0Y29udGV4dC5maWxsVGV4dChhcmVhRGVzY3JpcHRpb24sKGFyZWEueCkqIHpvb20gKyA1LChhcmVhLnkgKSogem9vbSArIDIwKTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgYXJlYS5icmlkZ2VzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIGJyaWRnZSA9IGFyZWEuYnJpZGdlc1tqXTtcblx0XHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdFx0Y29udGV4dC5yZWN0KChicmlkZ2UueCkgKiB6b29tIC8qLSB6b29tIC8gMiovLCAoYnJpZGdlLnkpICogem9vbSAvKi0gem9vbSAvIDIqLywgem9vbSwgem9vbSk7XG5cdFx0XHRcdGNvbnRleHQubGluZVdpZHRoID0gMjtcblx0XHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9ICdyZWQnO1xuXHRcdFx0XHRjb250ZXh0LnN0cm9rZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0ZHJhd0xldmVsOiBmdW5jdGlvbihsZXZlbCwgY2FudmFzKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcblx0XHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdGNvbnRleHQuZm9udD1cIjEycHggR2VvcmdpYVwiO1xuXHRcdGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0dmFyIHpvb20gPSA4O1xuXHRcdHZhciBjZWxscyA9IGxldmVsLmNlbGxzO1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdFx0dmFyIGNvbG9yID0gJyNGRkZGRkYnO1xuXHRcdFx0XHR2YXIgY2VsbCA9IGNlbGxzW3hdW3ldO1xuXHRcdFx0XHRpZiAoY2VsbCA9PT0gJ3dhdGVyJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzAwMDBGRic7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2VsbCA9PT0gJ2xhdmEnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjRkYwMDAwJztcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09PSAnZmFrZVdhdGVyJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzAwMDBGRic7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc29saWRSb2NrJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzU5NEIyRCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnZGFya1JvY2snKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMzMyYjFhJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdncmF5Um9jaycpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyM1OTU5NTknO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2NhdmVybkZsb29yJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzg3NjQxOCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnZG93bnN0YWlycycpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyNGRjAwMDAnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3Vwc3RhaXJzJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzAwRkYwMCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc3RvbmVXYWxsJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnI0JCQkJCQic7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc3RvbmVGbG9vcicpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyM2NjY2NjYnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2NvcnJpZG9yJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnI0ZGMDAwMCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAncGFkZGluZycpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyMwMEZGMDAnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2JyaWRnZScpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyM5NDY4MDAnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFJlY3QoeCAqIHpvb20sIHkgKiB6b29tLCB6b29tLCB6b29tKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5lbmVtaWVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBlbmVteSA9IGxldmVsLmVuZW1pZXNbaV07XG5cdFx0XHR2YXIgY29sb3IgPSAnI0ZGRkZGRic7XG5cdFx0XHRzd2l0Y2ggKGVuZW15LmNvZGUpe1xuXHRcdFx0Y2FzZSAnYmF0Jzpcblx0XHRcdFx0Y29sb3IgPSAnI0VFRUVFRSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGF2YUxpemFyZCc6XG5cdFx0XHRcdGNvbG9yID0gJyMwMEZGODgnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2RhZW1vbic6XG5cdFx0XHRcdGNvbG9yID0gJyNGRjg4MDAnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG5cdFx0XHRjb250ZXh0LmZpbGxSZWN0KGVuZW15LnggKiB6b29tLCBlbmVteS55ICogem9vbSwgem9vbSwgem9vbSk7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuaXRlbXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGl0ZW0gPSBsZXZlbC5pdGVtc1tpXTtcblx0XHRcdHZhciBjb2xvciA9ICcjRkZGRkZGJztcblx0XHRcdHN3aXRjaCAoaXRlbS5jb2RlKXtcblx0XHRcdGNhc2UgJ2RhZ2dlcic6XG5cdFx0XHRcdGNvbG9yID0gJyNFRUVFRUUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xlYXRoZXJBcm1vcic6XG5cdFx0XHRcdGNvbG9yID0gJyMwMEZGODgnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG5cdFx0XHRjb250ZXh0LmZpbGxSZWN0KGl0ZW0ueCAqIHpvb20sIGl0ZW0ueSAqIHpvb20sIHpvb20sIHpvb20pO1xuXHRcdH1cblx0fSxcblx0ZHJhd0xldmVsV2l0aEljb25zOiBmdW5jdGlvbihsZXZlbCwgY2FudmFzKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcblx0XHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdGNvbnRleHQuZm9udD1cIjEycHggR2VvcmdpYVwiO1xuXHRcdGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0dmFyIHpvb20gPSA4O1xuXHRcdHZhciB3YXRlciA9IG5ldyBJbWFnZSgpO1xuXHRcdHdhdGVyLnNyYyA9ICdpbWcvd2F0ZXIucG5nJztcblx0XHR2YXIgZmFrZVdhdGVyID0gbmV3IEltYWdlKCk7XG5cdFx0ZmFrZVdhdGVyLnNyYyA9ICdpbWcvd2F0ZXIucG5nJztcblx0XHR2YXIgc29saWRSb2NrID0gbmV3IEltYWdlKCk7XG5cdFx0c29saWRSb2NrLnNyYyA9ICdpbWcvc29saWRSb2NrLnBuZyc7XG5cdFx0dmFyIGNhdmVybkZsb29yID0gbmV3IEltYWdlKCk7XG5cdFx0Y2F2ZXJuRmxvb3Iuc3JjID0gJ2ltZy9jYXZlcm5GbG9vci5wbmcnO1xuXHRcdHZhciBkb3duc3RhaXJzID0gbmV3IEltYWdlKCk7XG5cdFx0ZG93bnN0YWlycy5zcmMgPSAnaW1nL2Rvd25zdGFpcnMucG5nJztcblx0XHR2YXIgdXBzdGFpcnMgPSBuZXcgSW1hZ2UoKTtcblx0XHR1cHN0YWlycy5zcmMgPSAnaW1nL3Vwc3RhaXJzLnBuZyc7XG5cdFx0dmFyIHN0b25lV2FsbCA9IG5ldyBJbWFnZSgpO1xuXHRcdHN0b25lV2FsbC5zcmMgPSAnaW1nL3N0b25lV2FsbC5wbmcnO1xuXHRcdHZhciBzdG9uZUZsb29yID0gbmV3IEltYWdlKCk7XG5cdFx0c3RvbmVGbG9vci5zcmMgPSAnaW1nL3N0b25lRmxvb3IucG5nJztcblx0XHR2YXIgYnJpZGdlID0gbmV3IEltYWdlKCk7XG5cdFx0YnJpZGdlLnNyYyA9ICdpbWcvYnJpZGdlLnBuZyc7XG5cdFx0dmFyIGxhdmEgPSBuZXcgSW1hZ2UoKTtcblx0XHRsYXZhLnNyYyA9ICdpbWcvbGF2YS5wbmcnO1xuXHRcdHZhciBiYXQgPSBuZXcgSW1hZ2UoKTtcblx0XHRiYXQuc3JjID0gJ2ltZy9iYXQucG5nJztcblx0XHR2YXIgbGF2YUxpemFyZCA9IG5ldyBJbWFnZSgpO1xuXHRcdGxhdmFMaXphcmQuc3JjID0gJ2ltZy9sYXZhTGl6YXJkLnBuZyc7XG5cdFx0dmFyIGRhZW1vbiA9IG5ldyBJbWFnZSgpO1xuXHRcdGRhZW1vbi5zcmMgPSAnaW1nL2RhZW1vbi5wbmcnO1xuXHRcdHZhciB0cmVhc3VyZSA9IG5ldyBJbWFnZSgpO1xuXHRcdHRyZWFzdXJlLnNyYyA9ICdpbWcvdHJlYXN1cmUucG5nJztcblx0XHR2YXIgdGlsZXMgPSB7XG5cdFx0XHR3YXRlcjogd2F0ZXIsXG5cdFx0XHRmYWtlV2F0ZXI6IGZha2VXYXRlcixcblx0XHRcdHNvbGlkUm9jazogc29saWRSb2NrLFxuXHRcdFx0Y2F2ZXJuRmxvb3I6IGNhdmVybkZsb29yLFxuXHRcdFx0ZG93bnN0YWlyczogZG93bnN0YWlycyxcblx0XHRcdHVwc3RhaXJzOiB1cHN0YWlycyxcblx0XHRcdHN0b25lV2FsbDogc3RvbmVXYWxsLFxuXHRcdFx0c3RvbmVGbG9vcjogc3RvbmVGbG9vcixcblx0XHRcdGJyaWRnZTogYnJpZGdlLFxuXHRcdFx0bGF2YTogbGF2YSxcblx0XHRcdGJhdDogYmF0LFxuXHRcdFx0bGF2YUxpemFyZDogbGF2YUxpemFyZCxcblx0XHRcdGRhZW1vbjogZGFlbW9uLFxuXHRcdFx0dHJlYXN1cmU6IHRyZWFzdXJlXG5cdFx0fVxuXHQgICAgdmFyIGNlbGxzID0gbGV2ZWwuY2VsbHM7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0XHR2YXIgY2VsbCA9IGNlbGxzW3hdW3ldOyBcblx0XHRcdFx0Y29udGV4dC5kcmF3SW1hZ2UodGlsZXNbY2VsbF0sIHggKiAxNiwgeSAqIDE2KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5lbmVtaWVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBlbmVteSA9IGxldmVsLmVuZW1pZXNbaV07XG5cdFx0XHRjb250ZXh0LmRyYXdJbWFnZSh0aWxlc1tlbmVteS5jb2RlXSwgZW5lbXkueCAqIDE2LCBlbmVteS55ICogMTYpO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLml0ZW1zLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBpdGVtID0gbGV2ZWwuaXRlbXNbaV07XG5cdFx0XHRjb250ZXh0LmRyYXdJbWFnZSh0aWxlc1sndHJlYXN1cmUnXSwgaXRlbS54ICogMTYsIGl0ZW0ueSAqIDE2KTtcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNSZW5kZXJlcjsiLCJmdW5jdGlvbiBGaXJzdExldmVsR2VuZXJhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcbnZhciBTcGxpdHRlciA9IHJlcXVpcmUoJy4vU3BsaXR0ZXInKTtcblxuRmlyc3RMZXZlbEdlbmVyYXRvci5wcm90b3R5cGUgPSB7XG5cdExBVkFfQ0hBTkNFOiAgICAgWzEwMCwgIDAsIDIwLCAgMCwxMDAsIDEwLCA1MCwxMDBdLFxuXHRXQVRFUl9DSEFOQ0U6ICAgIFsgIDAsMTAwLCAxMCwxMDAsICAwLCA1MCwgIDAsICAwXSxcblx0Q0FWRVJOX0NIQU5DRTogICBbIDgwLCA4MCwgMjAsIDIwLCA2MCwgOTAsIDEwLCA1MF0sXG5cdExBR09PTl9DSEFOQ0U6ICAgWyAgMCwgMTAsIDEwLCAyMCwgIDAsIDMwLCAgMCwgIDBdLFxuXHRXQUxMTEVTU19DSEFOQ0U6IFsgNTAsIDEwLCA4MCwgOTAsIDEwLCA5MCwgMTAsIDUwXSxcblx0SEVJR0hUOiAgICAgICAgICBbICAxLCAgMiwgIDEsICAxLCAgMSwgIDIsICAyLCAgM10sXG5cdFZFUk1JTjogW1xuXHQgICAgICAgICBbJ3NwaWRlcicsICdyYXQnXSxcblx0ICAgICAgICAgWydiYXQnLCAncmF0J10sXG5cdCAgICAgICAgIFsnc3BpZGVyJ10sXG5cdCAgICAgICAgIFsnYmF0J10sXG5cdCAgICAgICAgIFsnbW9uZ2JhdCddLFxuXHQgICAgICAgICBbJ2hlYWRsZXNzJ10sXG5cdCAgICAgICAgIFsnaGVhZGxlc3MnLCAnbW9uZ2JhdCddLFxuXHQgICAgICAgICBbJ2hlYWRsZXNzJywgJ3NrZWxldG9uJ11cblx0ICAgICAgICBdLFxuICAgIE9CSkVDVFM6IFsnb3JiJywgJ2RlYWRUcmVlJywgJ3RyZWUnLCAnc3RhdHVlJywgJ3NpZ25Qb3N0JywgJ3dlbGwnLCAnc21hbGxTaWduJywgJ2xhbXAnLCAnZmxhbWUnLCAnY2FtcGZpcmUnLCAnYWx0YXInLCAncHJpc29uZXJUaGluZycsICdmb3VudGFpbiddLFxuXHRHQU5HUzogW1xuXHRcdFsgLy8gTGV2ZWwgMVxuXHRcdFx0e2Jvc3M6ICdkYWVtb24nLCBtaW5pb25zOiBbJ21vbmdiYXQnXSwgcXVhbnRpdHk6IDJ9LFxuXHRcdFx0e21pbmlvbnM6IFsnbW9uZ2JhdCddLCBxdWFudGl0eTogMn0sXG5cdFx0XHR7bWluaW9uczogWydsYXZhTGl6YXJkJ10sIHF1YW50aXR5OiAyfSxcblx0XHRcdHtib3NzOiAnaHlkcmEnLCBtaW5pb25zOiBbJ21vbmdiYXQnXSwgcXVhbnRpdHk6IDJ9XG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDJcblx0XHRcdHtib3NzOiAnZGFlbW9uJywgbWluaW9uczogWydzZWFTZXJwZW50JywgJ29jdG9wdXMnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdoeWRyYScsIG1pbmlvbnM6IFsnc2VhU2VycGVudCcsICdvY3RvcHVzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydzZWFTZXJwZW50JywgJ29jdG9wdXMnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsnc2VhU2VycGVudCddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWydvY3RvcHVzJ10sIHF1YW50aXR5OiAzfVxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCAzXG5cdFx0XHR7bWluaW9uczogWydkYWVtb24nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ2RhZW1vbiddLCBxdWFudGl0eTogMn1cblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgNFxuXHRcdFx0e2Jvc3M6ICdnYXplcicsIG1pbmlvbnM6IFsnaGVhZGxlc3MnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdsaWNoZScsIG1pbmlvbnM6IFsnZ2hvc3QnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdkYWVtb24nLCBtaW5pb25zOiBbJ2dhemVyJywgJ2dyZW1saW4nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCA1XG5cdFx0XHR7bWluaW9uczogWydkcmFnb24nLCAnem9ybicsICdiYWxyb24nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsncmVhcGVyJywgJ2dhemVyJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydoZWFkbGVzcyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ3pvcm4nLCBtaW5pb25zOiBbJ2hlYWRsZXNzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ2RyYWdvbicsICdsYXZhTGl6YXJkJ10sIHF1YW50aXR5OiAzfSxcblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgNlxuXHRcdFx0e21pbmlvbnM6IFsncmVhcGVyJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydkYWVtb24nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2FyZWFUeXBlOiAnY2F2ZScsIG1pbmlvbnM6IFsnYmF0J10sIHF1YW50aXR5OiA1fSxcblx0XHRcdHthcmVhVHlwZTogJ2NhdmUnLCBtaW5pb25zOiBbJ3NlYVNlcnBlbnQnXSwgcXVhbnRpdHk6IDV9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ2h5ZHJhJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydldmlsTWFnZSddLCBxdWFudGl0eTogM31cblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgN1xuXHRcdFx0e21pbmlvbnM6IFsnaGVhZGxlc3MnXSwgcXVhbnRpdHk6IDh9LFxuXHRcdFx0e21pbmlvbnM6IFsnaHlkcmEnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsnc2tlbGV0b24nLCAnd2lzcCcsICdnaG9zdCddLCBxdWFudGl0eTogNn0sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnc2tlbGV0b24nXSwgcXVhbnRpdHk6IDEwfVxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCA4XG5cdFx0XHR7bWluaW9uczogWydkcmFnb24nLCAnZGFlbW9uJywgJ2JhbHJvbiddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWyd3YXJyaW9yJywgJ21hZ2UnLCAnYmFyZCcsICdkcnVpZCcsICd0aW5rZXInLCAncGFsYWRpbicsICdzaGVwaGVyZCcsICdyYW5nZXInXSwgcXVhbnRpdHk6IDR9LFxuXHRcdFx0e21pbmlvbnM6IFsnZ2F6ZXInLCAnYmFscm9uJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnbGljaGUnLCBtaW5pb25zOiBbJ3NrZWxldG9uJ10sIHF1YW50aXR5OiA0fSxcblx0XHRcdHttaW5pb25zOiBbJ2dob3N0JywgJ3dpc3AnXSwgcXVhbnRpdHk6IDR9LFxuXHRcdFx0e21pbmlvbnM6IFsnbGF2YUxpemFyZCddLCBxdWFudGl0eTogNX1cblx0XHRdXHRcdFxuXHRdLFxuXHRDQVZFUk5fV0FMTFM6IDEsXG5cdENBVkVSTl9GTE9PUlM6IDQsXG5cdFNUT05FX1dBTExTOiA2LFxuXHRTVE9ORV9GTE9PUlM6IDMsXG5cdGdlbmVyYXRlTGV2ZWw6IGZ1bmN0aW9uKGRlcHRoKXtcblx0XHR2YXIgaGFzUml2ZXIgPSBVdGlsLmNoYW5jZSh0aGlzLldBVEVSX0NIQU5DRVtkZXB0aC0xXSk7XG5cdFx0dmFyIGhhc0xhdmEgPSBVdGlsLmNoYW5jZSh0aGlzLkxBVkFfQ0hBTkNFW2RlcHRoLTFdKTtcblx0XHR2YXIgbWFpbkVudHJhbmNlID0gZGVwdGggPT0gMTtcblx0XHR2YXIgYXJlYXMgPSB0aGlzLmdlbmVyYXRlQXJlYXMoZGVwdGgsIGhhc0xhdmEpO1xuXHRcdHRoaXMucGxhY2VFeGl0cyhhcmVhcyk7XG5cdFx0dmFyIGxldmVsID0ge1xuXHRcdFx0aGFzUml2ZXJzOiBoYXNSaXZlcixcblx0XHRcdGhhc0xhdmE6IGhhc0xhdmEsXG5cdFx0XHRtYWluRW50cmFuY2U6IG1haW5FbnRyYW5jZSxcblx0XHRcdHN0cmF0YTogJ3NvbGlkUm9jaycsXG5cdFx0XHRhcmVhczogYXJlYXMsXG5cdFx0XHRkZXB0aDogZGVwdGgsXG5cdFx0XHRjZWlsaW5nSGVpZ2h0OiB0aGlzLkhFSUdIVFtkZXB0aC0xXSxcblx0XHRcdHZlcm1pbjogdGhpcy5WRVJNSU5bZGVwdGgtMV1cblx0XHR9IFxuXHRcdHJldHVybiBsZXZlbDtcblx0fSxcblx0Z2VuZXJhdGVBcmVhczogZnVuY3Rpb24oZGVwdGgsIGhhc0xhdmEpe1xuXHRcdHZhciBiaWdBcmVhID0ge1xuXHRcdFx0eDogMCxcblx0XHRcdHk6IDAsXG5cdFx0XHR3OiB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCxcblx0XHRcdGg6IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVFxuXHRcdH1cblx0XHR2YXIgbWF4RGVwdGggPSB0aGlzLmNvbmZpZy5TVUJESVZJU0lPTl9ERVBUSDtcblx0XHR2YXIgTUlOX1dJRFRIID0gdGhpcy5jb25maWcuTUlOX1dJRFRIO1xuXHRcdHZhciBNSU5fSEVJR0hUID0gdGhpcy5jb25maWcuTUlOX0hFSUdIVDtcblx0XHR2YXIgTUFYX1dJRFRIID0gdGhpcy5jb25maWcuTUFYX1dJRFRIO1xuXHRcdHZhciBNQVhfSEVJR0hUID0gdGhpcy5jb25maWcuTUFYX0hFSUdIVDtcblx0XHR2YXIgU0xJQ0VfUkFOR0VfU1RBUlQgPSB0aGlzLmNvbmZpZy5TTElDRV9SQU5HRV9TVEFSVDtcblx0XHR2YXIgU0xJQ0VfUkFOR0VfRU5EID0gdGhpcy5jb25maWcuU0xJQ0VfUkFOR0VfRU5EO1xuXHRcdHZhciBhcmVhcyA9IFNwbGl0dGVyLnN1YmRpdmlkZUFyZWEoYmlnQXJlYSwgbWF4RGVwdGgsIE1JTl9XSURUSCwgTUlOX0hFSUdIVCwgTUFYX1dJRFRILCBNQVhfSEVJR0hULCBTTElDRV9SQU5HRV9TVEFSVCwgU0xJQ0VfUkFOR0VfRU5EKTtcblx0XHRTcGxpdHRlci5jb25uZWN0QXJlYXMoYXJlYXMsMyk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IGFyZWFzW2ldO1xuXHRcdFx0dGhpcy5zZXRBcmVhRGV0YWlscyhhcmVhLCBkZXB0aCwgaGFzTGF2YSk7XG5cdFx0fVxuXHRcdHJldHVybiBhcmVhcztcblx0fSxcblx0c2V0QXJlYURldGFpbHM6IGZ1bmN0aW9uKGFyZWEsIGRlcHRoLCBoYXNMYXZhKXtcblx0XHRpZiAoVXRpbC5jaGFuY2UodGhpcy5DQVZFUk5fQ0hBTkNFW2RlcHRoLTFdKSl7XG5cdFx0XHRhcmVhLmFyZWFUeXBlID0gJ2NhdmVybic7XG5cdFx0XHRpZiAoaGFzTGF2YSl7XG5cdFx0XHRcdGFyZWEuZmxvb3IgPSAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0XHRhcmVhLmNhdmVyblR5cGUgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihbJ3JvY2t5JywnYnJpZGdlcyddKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChVdGlsLmNoYW5jZSh0aGlzLkxBR09PTl9DSEFOQ0VbZGVwdGgtMV0pKXtcblx0XHRcdFx0XHRhcmVhLmZsb29yID0gJ2Zha2VXYXRlcic7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXJlYS5mbG9vciA9ICdjYXZlcm5GbG9vcic7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXJlYS5jYXZlcm5UeXBlID0gVXRpbC5yYW5kb21FbGVtZW50T2YoWydyb2NreScsJ2JyaWRnZXMnLCd3YXRlcnknXSk7XG5cdFx0XHR9XG5cdFx0XHRhcmVhLmZsb29yVHlwZSA9IFV0aWwucmFuZCgxLCB0aGlzLkNBVkVSTl9GTE9PUlMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcmVhLmFyZWFUeXBlID0gJ3Jvb21zJztcblx0XHRcdGFyZWEuZmxvb3IgPSAnc3RvbmVGbG9vcic7XG5cdFx0XHRhcmVhLmZsb29yVHlwZSA9IFV0aWwucmFuZCgxLCB0aGlzLlNUT05FX0ZMT09SUyk7XG5cdFx0XHRpZiAoVXRpbC5jaGFuY2UodGhpcy5XQUxMTEVTU19DSEFOQ0VbZGVwdGgtMV0pKXtcblx0XHRcdFx0YXJlYS53YWxsID0gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcmVhLndhbGwgPSAnc3RvbmVXYWxsJztcblx0XHRcdFx0YXJlYS53YWxsVHlwZSA9IFV0aWwucmFuZCgxLCB0aGlzLlNUT05FX1dBTExTKTtcblx0XHRcdH1cblx0XHRcdGFyZWEuY29ycmlkb3IgPSAnc3RvbmVGbG9vcic7XG5cdFx0fVxuXHRcdGFyZWEuZW5lbWllcyA9IFtdO1xuXHRcdGFyZWEuaXRlbXMgPSBbXTtcblx0XHR2YXIgcmFuZG9tR2FuZyA9IFV0aWwucmFuZG9tRWxlbWVudE9mKHRoaXMuR0FOR1NbZGVwdGgtMV0pO1xuXHRcdGFyZWEuZW5lbWllcyA9IHJhbmRvbUdhbmcubWluaW9ucztcblx0XHRhcmVhLmVuZW15Q291bnQgPSByYW5kb21HYW5nLnF1YW50aXR5ICsgVXRpbC5yYW5kKDEsNCk7XG5cdFx0aWYgKHJhbmRvbUdhbmcpXG5cdFx0XHRhcmVhLmJvc3MgPSByYW5kb21HYW5nLmJvc3M7XG5cdFx0aWYgKFV0aWwuY2hhbmNlKDUwKSl7XG5cdFx0XHRhcmVhLmZlYXR1cmUgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZih0aGlzLk9CSkVDVFMpO1xuXHRcdH1cblx0fSxcblx0cGxhY2VFeGl0czogZnVuY3Rpb24oYXJlYXMpe1xuXHRcdHZhciBkaXN0ID0gbnVsbDtcblx0XHR2YXIgYXJlYTEgPSBudWxsO1xuXHRcdHZhciBhcmVhMiA9IG51bGw7XG5cdFx0dmFyIGZ1c2UgPSAxMDAwO1xuXHRcdGRvIHtcblx0XHRcdGFyZWExID0gVXRpbC5yYW5kb21FbGVtZW50T2YoYXJlYXMpO1xuXHRcdFx0YXJlYTIgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihhcmVhcyk7XG5cdFx0XHRpZiAoZnVzZSA8IDApe1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGRpc3QgPSBVdGlsLmxpbmVEaXN0YW5jZShhcmVhMSwgYXJlYTIpO1xuXHRcdFx0ZnVzZS0tO1xuXHRcdH0gd2hpbGUgKGRpc3QgPCAodGhpcy5jb25maWcuTEVWRUxfV0lEVEggKyB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQpIC8gMyk7XG5cdFx0YXJlYTEuaGFzRXhpdCA9IHRydWU7XG5cdFx0YXJlYTIuaGFzRW50cmFuY2UgPSB0cnVlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlyc3RMZXZlbEdlbmVyYXRvcjsiLCJmdW5jdGlvbiBHZW5lcmF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cdHRoaXMuZmlyc3RMZXZlbEdlbmVyYXRvciA9IG5ldyBGaXJzdExldmVsR2VuZXJhdG9yKGNvbmZpZyk7XG5cdHRoaXMuc2Vjb25kTGV2ZWxHZW5lcmF0b3IgPSBuZXcgU2Vjb25kTGV2ZWxHZW5lcmF0b3IoY29uZmlnKTtcblx0dGhpcy50aGlyZExldmVsR2VuZXJhdG9yID0gbmV3IFRoaXJkTGV2ZWxHZW5lcmF0b3IoY29uZmlnKTtcblx0dGhpcy5tb25zdGVyUG9wdWxhdG9yID0gbmV3IE1vbnN0ZXJQb3B1bGF0b3IoY29uZmlnKTtcblx0dGhpcy5pdGVtUG9wdWxhdG9yID0gbmV3IEl0ZW1Qb3B1bGF0b3IoY29uZmlnKTtcblx0dGhpcy52ZWluR2VuZXJhdG9yID0gbmV3IFZlaW5HZW5lcmF0b3IoY29uZmlnKTtcbn1cblxudmFyIEZpcnN0TGV2ZWxHZW5lcmF0b3IgPSByZXF1aXJlKCcuL0ZpcnN0TGV2ZWxHZW5lcmF0b3IuY2xhc3MnKTtcbnZhciBTZWNvbmRMZXZlbEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vU2Vjb25kTGV2ZWxHZW5lcmF0b3IuY2xhc3MnKTtcbnZhciBUaGlyZExldmVsR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9UaGlyZExldmVsR2VuZXJhdG9yLmNsYXNzJyk7XG52YXIgTW9uc3RlclBvcHVsYXRvciA9IHJlcXVpcmUoJy4vTW9uc3RlclBvcHVsYXRvci5jbGFzcycpO1xudmFyIEl0ZW1Qb3B1bGF0b3IgPSByZXF1aXJlKCcuL0l0ZW1Qb3B1bGF0b3IuY2xhc3MnKTtcbnZhciBWZWluR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9WZWluR2VuZXJhdG9yLmNsYXNzJyk7XG5cbkdlbmVyYXRvci5wcm90b3R5cGUgPSB7XG5cdGdlbmVyYXRlTGV2ZWw6IGZ1bmN0aW9uKGRlcHRoLCB1bmlxdWVSZWdpc3RyeSl7XG5cdFx0dmFyIHNrZXRjaCA9IHRoaXMuZmlyc3RMZXZlbEdlbmVyYXRvci5nZW5lcmF0ZUxldmVsKGRlcHRoKTtcblx0XHR2YXIgbGV2ZWwgPSB0aGlzLnNlY29uZExldmVsR2VuZXJhdG9yLmZpbGxMZXZlbChza2V0Y2gpO1xuXHRcdHRoaXMudGhpcmRMZXZlbEdlbmVyYXRvci5maWxsTGV2ZWwoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5zZWNvbmRMZXZlbEdlbmVyYXRvci5mcmFtZUxldmVsKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMubW9uc3RlclBvcHVsYXRvci5wb3B1bGF0ZUxldmVsKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMuaXRlbVBvcHVsYXRvci5wb3B1bGF0ZUxldmVsKHNrZXRjaCwgbGV2ZWwsIHVuaXF1ZVJlZ2lzdHJ5KTtcblx0XHR0aGlzLnZlaW5HZW5lcmF0b3IudHJhY2VWZWlucyhza2V0Y2gsIGxldmVsKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2tldGNoOiBza2V0Y2gsXG5cdFx0XHRsZXZlbDogbGV2ZWxcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmF0b3I7XG4iLCJmdW5jdGlvbiBJdGVtUG9wdWxhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcblxuSXRlbVBvcHVsYXRvci5wcm90b3R5cGUgPSB7XG5cdHBvcHVsYXRlTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwsIHVuaXF1ZVJlZ2lzdHJ5KXtcblx0XHR0aGlzLnVuaXF1ZVJlZ2lzdHJ5ID0gdW5pcXVlUmVnaXN0cnk7XG5cdFx0dGhpcy5jYWxjdWxhdGVSYXJpdGllcyhsZXZlbC5kZXB0aCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2guYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBza2V0Y2guYXJlYXNbaV07XG5cdFx0XHR0aGlzLnBvcHVsYXRlQXJlYShhcmVhLCBsZXZlbCk7XG5cdFx0fVxuXHR9LFxuXHRwb3B1bGF0ZUFyZWE6IGZ1bmN0aW9uKGFyZWEsIGxldmVsKXtcblx0XHR2YXIgaXRlbXMgPSBVdGlsLnJhbmQoMCwyKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zOyBpKyspe1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gbGV2ZWwuZ2V0RnJlZVBsYWNlKGFyZWEsIGZhbHNlLCB0cnVlKTtcblx0XHRcdHZhciBpdGVtID0gdGhpcy5nZXRBbkl0ZW0oKTtcblx0XHRcdGxldmVsLmFkZEl0ZW0oaXRlbSwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cdFx0fVxuXHR9LFxuXHRjYWxjdWxhdGVSYXJpdGllczogZnVuY3Rpb24oZGVwdGgpe1xuXHRcdHRoaXMudGhyZXNob2xkcyA9IFtdO1xuXHRcdHRoaXMuZ2VuZXJhdGlvbkNoYW5jZVRvdGFsID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuSVRFTVMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLklURU1TW2ldO1xuXHRcdFx0dmFyIG1hbHVzID0gTWF0aC5hYnMoZGVwdGgtaXRlbS5kZXB0aCkgPiAxO1xuXHRcdFx0dmFyIHJhcml0eSA9IG1hbHVzID8gaXRlbS5yYXJpdHkgLyAyIDogaXRlbS5yYXJpdHk7XG5cdFx0XHR0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCArPSByYXJpdHk7XG5cdFx0XHR0aGlzLnRocmVzaG9sZHMucHVzaCh7dGhyZXNob2xkOiB0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCwgaXRlbTogaXRlbX0pO1xuXHRcdH1cblx0fSxcblx0SVRFTVM6IFtcblx0XHQvKiBPcmlnaW5hbCBVNCBpdGVtc1xuXHRcdCAgICB7Y29kZTogJ2RhZ2dlcicsIHJhcml0eTogNTAwfSxcblx0XHRcdHtjb2RlOiAnb2lsRmxhc2snLCByYXJpdHk6IDE0MDB9LFxuXHRcdFx0e2NvZGU6ICdzdGFmZicsIHJhcml0eTogMzUwfSxcblx0XHRcdHtjb2RlOiAnc2xpbmcnLCByYXJpdHk6IDI4MH0sXG5cdFx0XHR7Y29kZTogJ21hY2UnLCByYXJpdHk6IDcwfSxcblx0XHRcdHtjb2RlOiAnYXhlJywgcmFyaXR5OiAzMX0sXG5cdFx0XHR7Y29kZTogJ2JvdycsIHJhcml0eTogMjh9LFxuXHRcdFx0e2NvZGU6ICdzd29yZCcsIHJhcml0eTogMzUwfSxcblx0XHRcdHtjb2RlOiAnaGFsYmVyZCcsIHJhcml0eTogMjN9LFxuXHRcdFx0e2NvZGU6ICdjcm9zc2JvdycsIHJhcml0eTogMTF9LFxuXHRcdFx0e2NvZGU6ICdtYWdpY0F4ZScsIHJhcml0eTogNX0sXG5cdFx0XHR7Y29kZTogJ21hZ2ljQm93JywgcmFyaXR5OiA0fSxcblx0XHRcdHtjb2RlOiAnbWFnaWNTd29yZCcsIHJhcml0eTogNH0sXG5cdFx0XHR7Y29kZTogJ21hZ2ljV2FuZCcsIHJhcml0eTogMn0sXG5cdFx0XHR7Y29kZTogJ2Nsb3RoJywgcmFyaXR5OiAxNDB9LFxuXHRcdFx0e2NvZGU6ICdsZWF0aGVyJywgcmFyaXR5OiAzNX0sXG5cdFx0XHR7Y29kZTogJ2NoYWluJywgcmFyaXR5OiAxMn0sXG5cdFx0XHR7Y29kZTogJ3BsYXRlJywgcmFyaXR5OiA0fSxcblx0IFx0Ki9cblxuXHRcdHtjb2RlOiAnZGFnZ2VyUG9pc29uJywgcmFyaXR5OiAxMDB9LFxuXHRcdHtjb2RlOiAnZGFnZ2VyRmFuZycsIHJhcml0eTogNTAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdkYWdnZXJTdGluZycsIHJhcml0eTogNTAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdzdGFmZkdhcmdveWxlJywgcmFyaXR5OiAxMDAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdzdGFmZkFnZXMnLCByYXJpdHk6IDUwLCB1bmlxdWU6IHRydWV9LFxuXHRcdHtjb2RlOiAnc3RhZmZDYWJ5cnVzJywgcmFyaXR5OiA1MCwgdW5pcXVlOiB0cnVlfSxcblx0XHRcblx0XHR7Y29kZTogJ21hY2VCYW5lJywgcmFyaXR5OiA1MCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ21hY2VCb25lQ3J1c2hlcicsIHJhcml0eTogNTAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdtYWNlU2xheWVyJywgcmFyaXR5OiAyNSwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ21hY2VKdWdnZXJuYXV0JywgcmFyaXR5OiAyNSwgdW5pcXVlOiB0cnVlfSxcblx0XHRcblx0XHR7Y29kZTogJ2F4ZUR3YXJ2aXNoJywgcmFyaXR5OiAxMDB9LFxuXHRcdHtjb2RlOiAnYXhlRGVjZWl2ZXInLCByYXJpdHk6IDUwLCB1bmlxdWU6IHRydWV9LFxuXHRcdHtjb2RlOiAnYXhlUnVuZScsIHJhcml0eTogNTB9LFxuXHRcdFxuXHRcdHtjb2RlOiAnc3dvcmRGaXJlJywgcmFyaXR5OiAxMDAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdzd29yZENoYW9zJywgcmFyaXR5OiAxMDAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdzd29yZERyYWdvbicsIHJhcml0eTogNTB9LFxuXHRcdHtjb2RlOiAnc3dvcmRRdWljaycsIHJhcml0eTogMjUsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0XG5cdFx0e2NvZGU6ICdzbGluZ0V0dGluJywgcmFyaXR5OiAxMDAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdib3dQb2lzb24nLCByYXJpdHk6IDIwMH0sXG5cdFx0e2NvZGU6ICdib3dTbGVlcCcsIHJhcml0eTogMjAwfSxcblx0XHR7Y29kZTogJ2Jvd01hZ2ljJywgcmFyaXR5OiAxMDB9LFxuXHRcdHtjb2RlOiAnY3Jvc3Nib3dNYWdpYycsIHJhcml0eTogNTB9LFxuXHRcdFxuXHRcdHtjb2RlOiAncGhhem9yJywgcmFyaXR5OiAyNSwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ3dhbmRMaWdodG5pbmcnLCByYXJpdHk6IDUwfSxcblx0XHR7Y29kZTogJ3dhbmRGaXJlJywgcmFyaXR5OiA1MH0sXG5cdFx0XG5cdFx0e2NvZGU6ICdsZWF0aGVyRHJhZ29uJywgcmFyaXR5OiA3NX0sXG5cdFx0e2NvZGU6ICdsZWF0aGVySW1wJywgcmFyaXR5OiAxMDB9LFxuXHRcdHtjb2RlOiAnY2hhaW5NYWdpYycsIHJhcml0eTogNTB9LFxuXHRcdHtjb2RlOiAnY2hhaW5Ed2FydmVuJywgcmFyaXR5OiA3NX0sXG5cdFx0e2NvZGU6ICdwbGF0ZUV0ZXJuaXVtJywgcmFyaXR5OiA1fSxcblx0XHR7Y29kZTogJ3BsYXRlTWFnaWMnLCByYXJpdHk6IDEwfSxcblx0XHRcblx0XHR7Y29kZTogJ2N1cmUnLCByYXJpdHk6IDIwMDAsIGRlcHRoOiAxfSxcblx0XHR7Y29kZTogJ2hlYWwnLCByYXJpdHk6IDIwMDAsIGRlcHRoOiAxfSxcblx0XHR7Y29kZTogJ3JlZFBvdGlvbicsIHJhcml0eTogMjAwMCwgZGVwdGg6IDF9LFxuXHRcdHtjb2RlOiAneWVsbG93UG90aW9uJywgcmFyaXR5OiAyMDAwLCBkZXB0aDogMX0sXG5cdFx0e2NvZGU6ICdsaWdodCcsIHJhcml0eTogMjAwMCwgZGVwdGg6IDJ9LFxuXHRcdHtjb2RlOiAnbWlzc2lsZScsIHJhcml0eTogMjAwMCwgZGVwdGg6IDN9LFxuXHRcdHtjb2RlOiAnaWNlYmFsbCcsIHJhcml0eTogMTAwMCwgZGVwdGg6IDR9LFxuXHRcdC8ve2NvZGU6ICdyZXBlbCcsIHJhcml0eTogMTAwMCwgZGVwdGg6IDV9LFxuXHRcdHtjb2RlOiAnYmxpbmsnLCByYXJpdHk6IDY2NiwgZGVwdGg6IDV9LFxuXHRcdHtjb2RlOiAnZmlyZWJhbGwnLCByYXJpdHk6IDY2NiwgZGVwdGg6IDZ9LFxuXHRcdHtjb2RlOiAncHJvdGVjdGlvbicsIHJhcml0eTogNTAwLCBkZXB0aDogNn0sXG5cdFx0e2NvZGU6ICd0aW1lJywgcmFyaXR5OiA0MDAsIGRlcHRoOiA3fSxcblx0XHR7Y29kZTogJ3NsZWVwJywgcmFyaXR5OiA0MDAsIGRlcHRoOiA3fSxcblx0XHQvL3tjb2RlOiAnamlueCcsIHJhcml0eTogMTY2LCBkZXB0aDogOH0sXG5cdFx0Ly97Y29kZTogJ3RyZW1vcicsIHJhcml0eTogMTY2LCBkZXB0aDogOH0sXG5cdFx0e2NvZGU6ICdraWxsJywgcmFyaXR5OiAxMDAsIGRlcHRoOiA4fVxuXHRdLFxuXHRnZXRBbkl0ZW06IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG51bWJlciA9IFV0aWwucmFuZCgwLCB0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRocmVzaG9sZHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0aWYgKG51bWJlciA8PSB0aGlzLnRocmVzaG9sZHNbaV0udGhyZXNob2xkKXtcblx0XHRcdFx0aWYgKHRoaXMudW5pcXVlUmVnaXN0ZXIgJiYgdGhpcy50aHJlc2hvbGRzW2ldLml0ZW0udW5pcXVlICYmIHRoaXMudW5pcXVlUmVnaXN0ZXJbdGhpcy50aHJlc2hvbGRzW2ldLml0ZW0uY29kZV0pe1xuXHRcdFx0XHRcdGkgPSAwO1xuXHRcdFx0XHRcdG51bWJlciA9IFV0aWwucmFuZCgwLCB0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCk7XG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGhpcy50aHJlc2hvbGRzW2ldLml0ZW0uY29kZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMudGhyZXNob2xkc1swXS5pdGVtLmNvZGU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtUG9wdWxhdG9yOyIsImZ1bmN0aW9uIEtyYW1naW5lRXhwb3J0ZXIoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbktyYW1naW5lRXhwb3J0ZXIucHJvdG90eXBlID0ge1xuXHRnZXRMZXZlbDogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdHRoaXMuaW5pdFRpbGVEZWZzKGxldmVsLmNlaWxpbmdIZWlnaHQpO1xuXHRcdHZhciB0aWxlcyA9IHRoaXMuZ2V0VGlsZXMoKTtcblx0XHR2YXIgb2JqZWN0cyA9IHRoaXMuZ2V0T2JqZWN0cyhsZXZlbCk7XG5cdFx0dmFyIG1hcCA9IHRoaXMuZ2V0TWFwKGxldmVsLCBvYmplY3RzKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGlsZXM6IHRpbGVzLFxuXHRcdFx0b2JqZWN0czogb2JqZWN0cyxcblx0XHRcdG1hcDogbWFwXG5cdFx0fTtcblx0fSxcblx0aW5pdFRpbGVEZWZzOiBmdW5jdGlvbihjZWlsaW5nSGVpZ2h0KXtcblx0XHR0aGlzLnRpbGVzID0gW107XG5cdFx0dGhpcy50aWxlc01hcCA9IFtdO1xuXHRcdHRoaXMudGlsZXMucHVzaChudWxsKTtcblx0XHR0aGlzLmNlaWxpbmdIZWlnaHQgPSBjZWlsaW5nSGVpZ2h0O1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF8xJywgNCwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzInLCA1LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfMycsIDYsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF80JywgNywgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzUnLCA4LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfNicsIDksIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX1dBTExfMScsIDEwLCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9XQUxMXzInLCAxMSwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fV0FMTF8zJywgMTIsIDAsIDAsIDApO1xuXHRcdFxuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX0ZMT09SXzEnLCAwLCA1LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9GTE9PUl8yJywgMCwgNiwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fRkxPT1JfMycsIDAsIDcsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX0ZMT09SXzQnLCAwLCA4LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX0ZMT09SXzEnLCAwLCA5LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX0ZMT09SXzInLCAwLCAxMCwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9GTE9PUl8zJywgMCwgMTEsIDMsIDApO1xuXHRcdFxuXHRcdHRoaXMuYWRkVGlsZSgnQlJJREdFJywgMCwgNCwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdXQVRFUicsIDAsIDEwMSwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdMQVZBJywgMCwgMTAzLCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUQUlSU19ET1dOJywgMCwgNTAsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RBSVJTX1VQJywgMCwgNSwgNTAsIDApO1xuXHR9LFxuXHRhZGRUaWxlOiBmdW5jdGlvbiAoaWQsIHdhbGxUZXh0dXJlLCBmbG9vclRleHR1cmUsIGNlaWxUZXh0dXJlLCBmbG9vckhlaWdodCl7XG5cdFx0dmFyIHRpbGUgPSB0aGlzLmNyZWF0ZVRpbGUod2FsbFRleHR1cmUsIGZsb29yVGV4dHVyZSwgY2VpbFRleHR1cmUsIGZsb29ySGVpZ2h0LCB0aGlzLmNlaWxpbmdIZWlnaHQpO1xuXHRcdHRoaXMudGlsZXMucHVzaCh0aWxlKTtcblx0XHR0aGlzLnRpbGVzTWFwW2lkXSA9IHRoaXMudGlsZXMubGVuZ3RoIC0gMTtcblx0fSxcblx0Z2V0VGlsZTogZnVuY3Rpb24oaWQsIHR5cGUpe1xuXHRcdGlmICghdHlwZSlcblx0XHRcdHJldHVybiB0aGlzLnRpbGVzTWFwW2lkXTtcblx0XHR2YXIgdGlsZSA9IHRoaXMudGlsZXNNYXBbaWQrXCJfXCIrdHlwZV07XG5cdFx0aWYgKHRpbGUpXG5cdFx0XHRyZXR1cm4gdGlsZTtcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gdGhpcy50aWxlc01hcFtpZCtcIl8xXCJdO1xuXHR9LFxuXHRjcmVhdGVUaWxlOiBmdW5jdGlvbih3YWxsVGV4dHVyZSwgZmxvb3JUZXh0dXJlLCBjZWlsVGV4dHVyZSwgZmxvb3JIZWlnaHQsIGhlaWdodCl7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHc6IHdhbGxUZXh0dXJlLFxuXHRcdFx0eTogZmxvb3JIZWlnaHQsXG5cdFx0XHRoOiBoZWlnaHQsXG5cdFx0XHRmOiBmbG9vclRleHR1cmUsXG5cdFx0XHRmeTogZmxvb3JIZWlnaHQsXG5cdFx0XHRjOiBjZWlsVGV4dHVyZSxcblx0XHRcdGNoOiBoZWlnaHQsXG5cdFx0XHRzbDogMCxcblx0XHRcdGRpcjogMFxuXHRcdH07XG5cdH0sXG5cdGdldFRpbGVzOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiB0aGlzLnRpbGVzO1xuXHR9LFxuXHRnZXRPYmplY3RzOiBmdW5jdGlvbihsZXZlbCl7XG5cdFx0dmFyIG9iamVjdHMgPSBbXTtcblx0XHRvYmplY3RzLnB1c2goe1xuXHRcdFx0eDogbGV2ZWwuc3RhcnQueCArIDAuNSxcblx0XHRcdHo6IGxldmVsLnN0YXJ0LnkgKyAwLjUsXG5cdFx0XHR5OiAwLFxuXHRcdFx0ZGlyOiAzLFxuXHRcdFx0dHlwZTogJ3BsYXllcidcblx0XHR9KTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmVuZW1pZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGVuZW15ID0gbGV2ZWwuZW5lbWllc1tpXTtcblx0XHRcdHZhciBlbmVteURhdGEgPVxuXHRcdFx0e1xuXHQgICAgICAgICAgICB4OiBlbmVteS54ICsgMC41LFxuXHQgICAgICAgICAgICB6OiBlbmVteS55ICsgMC41LFxuXHQgICAgICAgICAgICB5OiAwLFxuXHQgICAgICAgICAgICB0eXBlOiAnZW5lbXknLFxuXHQgICAgICAgICAgICBlbmVteTogZW5lbXkuY29kZVxuXHQgICAgICAgIH07XG5cdFx0XHRvYmplY3RzLnB1c2goZW5lbXlEYXRhKTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5pdGVtcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgaXRlbSA9IGxldmVsLml0ZW1zW2ldO1xuXHRcdFx0dmFyIGl0ZW1EYXRhID1cblx0XHRcdHtcblx0ICAgICAgICAgICAgeDogaXRlbS54ICsgMC41LFxuXHQgICAgICAgICAgICB6OiBpdGVtLnkgKyAwLjUsXG5cdCAgICAgICAgICAgIHk6IDAsXG5cdCAgICAgICAgICAgIHR5cGU6ICdpdGVtJyxcblx0ICAgICAgICAgICAgaXRlbTogaXRlbS5jb2RlXG5cdCAgICAgICAgfTtcblx0XHRcdG9iamVjdHMucHVzaChpdGVtRGF0YSk7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuZmVhdHVyZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGZlYXR1cmUgPSBsZXZlbC5mZWF0dXJlc1tpXTtcblx0XHRcdHZhciBpdGVtRGF0YSA9XG5cdFx0XHR7XG5cdCAgICAgICAgICAgIHg6IGZlYXR1cmUueCArIDAuNSxcblx0ICAgICAgICAgICAgejogZmVhdHVyZS55ICsgMC41LFxuXHQgICAgICAgICAgICB5OiAwLFxuXHQgICAgICAgICAgICB0eXBlOiAnaXRlbScsIC8vVE9ETzogQ2hhbmdlIHRvIGZlYXR1cmUgb25jZSBpdCdzIHN1cHBvcnRlZFxuXHQgICAgICAgICAgICBpdGVtOiBmZWF0dXJlLmNvZGUgLy9UT0RPOiBDaGFuZ2UgdG8gZmVhdHVyZSBvbmNlIGl0J3Mgc3VwcG9ydGVkXG5cdCAgICAgICAgfTtcblx0XHRcdG9iamVjdHMucHVzaChpdGVtRGF0YSk7XG5cdFx0fVxuXHRcdHJldHVybiBvYmplY3RzO1xuXHR9LFxuXHRnZXRNYXA6IGZ1bmN0aW9uKGxldmVsLCBvYmplY3RzKXtcblx0XHR2YXIgbWFwID0gW107XG5cdFx0dmFyIGNlbGxzID0gbGV2ZWwuY2VsbHM7XG5cdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQ7IHkrKyl7XG5cdFx0XHRtYXBbeV0gPSBbXTtcblx0XHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRcdHZhciBjZWxsID0gY2VsbHNbeF1beV07XG5cdFx0XHRcdHZhciBhcmVhID0gbGV2ZWwuZ2V0QXJlYSh4LHkpO1xuXHRcdFx0XHRpZiAoIWFyZWEud2FsbFR5cGUpXG5cdFx0XHRcdFx0YXJlYS53YWxsVHlwZSA9IDE7XG5cdFx0XHRcdGlmICghYXJlYS5mbG9vclR5cGUpXG5cdFx0XHRcdFx0YXJlYS5mbG9vclR5cGUgPSAxO1xuXHRcdFx0XHR2YXIgaWQgPSBudWxsO1xuXHRcdFx0XHRpZiAoY2VsbCA9PT0gJ3dhdGVyJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJXQVRFUlwiKTtcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09PSAnZmFrZVdhdGVyJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJXQVRFUlwiKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzb2xpZFJvY2snKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIkNBVkVSTl9XQUxMXCIsIDEpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2dyYXlSb2NrJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJDQVZFUk5fV0FMTFwiLCAyKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdkYXJrUm9jaycpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiQ0FWRVJOX1dBTExcIiwgMyk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnY2F2ZXJuRmxvb3InKXsgXG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJDQVZFUk5fRkxPT1JcIiwgYXJlYS5mbG9vclR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2Rvd25zdGFpcnMnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUQUlSU19ET1dOXCIpO1xuXHRcdFx0XHRcdG9iamVjdHMucHVzaCh7XG5cdFx0XHRcdFx0XHR4OiB4ICsgMC41LFxuXHRcdFx0ICAgICAgICAgICAgejogeSArIDAuNSxcblx0XHRcdCAgICAgICAgICAgIHk6IDAsXG5cdFx0XHQgICAgICAgICAgICB0eXBlOiAnc3RhaXJzJyxcblx0XHRcdCAgICAgICAgICAgIGRpcjogJ2Rvd24nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAndXBzdGFpcnMnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUQUlSU19VUFwiKTtcblx0XHRcdFx0XHRpZiAobGV2ZWwuZGVwdGggPiAxKVxuXHRcdFx0XHRcdFx0b2JqZWN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0eDogeCArIDAuNSxcblx0XHRcdFx0ICAgICAgICAgICAgejogeSArIDAuNSxcblx0XHRcdFx0ICAgICAgICAgICAgeTogMCxcblx0XHRcdFx0ICAgICAgICAgICAgdHlwZTogJ3N0YWlycycsXG5cdFx0XHRcdCAgICAgICAgICAgIGRpcjogJ3VwJ1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc3RvbmVXYWxsJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVE9ORV9XQUxMXCIsIGFyZWEud2FsbFR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3N0b25lRmxvb3InKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUT05FX0ZMT09SXCIsYXJlYS5mbG9vclR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2NvcnJpZG9yJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVE9ORV9GTE9PUlwiLCAxKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdicmlkZ2UnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIkJSSURHRVwiKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdsYXZhJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJMQVZBXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1hcFt5XVt4XSA9IGlkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWFwO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS3JhbWdpbmVFeHBvcnRlcjtcbiIsImZ1bmN0aW9uIExldmVsKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufTtcblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG5cbkxldmVsLnByb3RvdHlwZSA9IHtcblx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNlbGxzID0gW107XG5cdFx0dGhpcy5lbmVtaWVzID0gW107XG5cdFx0dGhpcy5lbmVtaWVzTWFwID0ge307XG5cdFx0dGhpcy5pdGVtcyA9IFtdO1xuXHRcdHRoaXMuZmVhdHVyZXMgPSBbXTtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0dGhpcy5jZWxsc1t4XSA9IFtdO1xuXHRcdH1cblx0fSxcblx0YWRkRW5lbXk6IGZ1bmN0aW9uKGVuZW15LCB4LCB5KXtcblx0XHR2YXIgZW5lbXkgPSB7XG5cdFx0XHRjb2RlOiBlbmVteSxcblx0XHRcdHg6IHgsXG5cdFx0XHR5OiB5XG5cdFx0fTtcblx0XHR0aGlzLmVuZW1pZXMucHVzaChlbmVteSk7XG5cdFx0dGhpcy5lbmVtaWVzTWFwW3grXCJfXCIreV0gPSBlbmVteTtcblx0fSxcblx0Z2V0RW5lbXk6IGZ1bmN0aW9uKHgseSl7XG5cdFx0cmV0dXJuIHRoaXMuZW5lbWllc01hcFt4K1wiX1wiK3ldO1xuXHR9LFxuXHRhZGRJdGVtOiBmdW5jdGlvbihpdGVtLCB4LCB5KXtcblx0XHR0aGlzLml0ZW1zLnB1c2goe1xuXHRcdFx0Y29kZTogaXRlbSxcblx0XHRcdHg6IHgsXG5cdFx0XHR5OiB5XG5cdFx0fSk7XG5cdH0sXG5cdGFkZEZlYXR1cmU6IGZ1bmN0aW9uKGZlYXR1cmUsIHgsIHkpe1xuXHRcdHRoaXMuZmVhdHVyZXMucHVzaCh7XG5cdFx0XHRjb2RlOiBmZWF0dXJlLFxuXHRcdFx0eDogeCxcblx0XHRcdHk6IHlcblx0XHR9KTtcblx0fSxcblx0Z2V0RnJlZVBsYWNlOiBmdW5jdGlvbihhcmVhLCBvbmx5V2F0ZXIsIG5vV2F0ZXIpe1xuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0d2hpbGUodHJ1ZSl7XG5cdFx0XHR2YXIgcmFuZFBvaW50ID0ge1xuXHRcdFx0XHR4OiBVdGlsLnJhbmQoYXJlYS54LCBhcmVhLngrYXJlYS53LTEpLFxuXHRcdFx0XHR5OiBVdGlsLnJhbmQoYXJlYS55LCBhcmVhLnkrYXJlYS5oLTEpXG5cdFx0XHR9XG5cdFx0XHR2YXIgY2VsbCA9IHRoaXMuY2VsbHNbcmFuZFBvaW50LnhdW3JhbmRQb2ludC55XTsgXG5cdFx0XHRpZiAob25seVdhdGVyKXtcblx0XHRcdFx0aWYgKGNlbGwgPT0gJ3dhdGVyJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRcdHJldHVybiByYW5kUG9pbnQ7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRpZiAodHJpZXMgPiAxMDAwKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gIGVsc2UgaWYgKG5vV2F0ZXIpe1xuXHRcdFx0XHRpZiAoY2VsbCA9PSAnd2F0ZXInIHx8IGNlbGwgPT0gJ2Zha2VXYXRlcicpe1xuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdFx0aWYgKHRyaWVzID4gMTAwMClcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09IGFyZWEuZmxvb3IgfHwgYXJlYS5jb3JyaWRvciAmJiBjZWxsID09IGFyZWEuY29ycmlkb3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT0gYXJlYS5mbG9vciB8fCBhcmVhLmNvcnJpZG9yICYmIGNlbGwgPT0gYXJlYS5jb3JyaWRvciB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdH1cblx0fSxcblx0aXNGcmVlQXJvdW5kOiBmdW5jdGlvbihzcG90LCBhcmVhKXtcblx0XHRmb3IgKHZhciB4ID0gLTE7IHggPD0gMTsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSAtMTsgeSA8PSAxOyB5Kyspe1xuXHRcdFx0XHRpZiAoeCA9PSAwICYmIHkgPT0gMClcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0dmFyIGNlbGwgPSB0aGlzLmNlbGxzW3Nwb3QueCArIHhdW3Nwb3QueSArIHldO1xuXHRcdFx0XHRpZiAoY2VsbCAhPSBhcmVhLmZsb29yKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdGdldEZyZWVQbGFjZU9uTGV2ZWw6IGZ1bmN0aW9uKG9ubHlXYXRlciwgbm9XYXRlcil7XG5cdFx0dmFyIHRyaWVzID0gMDtcblx0XHR3aGlsZSh0cnVlKXtcblx0XHRcdHZhciByYW5kUG9pbnQgPSB7XG5cdFx0XHRcdHg6IFV0aWwucmFuZCgwLCB0aGlzLmNlbGxzLmxlbmd0aCAtIDEpLFxuXHRcdFx0XHR5OiBVdGlsLnJhbmQoMCwgdGhpcy5jZWxsc1swXS5sZW5ndGggLSAxKVxuXHRcdFx0fVxuXHRcdFx0dmFyIGNlbGwgPSB0aGlzLmNlbGxzW3JhbmRQb2ludC54XVtyYW5kUG9pbnQueV07IFxuXHRcdFx0aWYgKG9ubHlXYXRlcil7XG5cdFx0XHRcdGlmIChjZWxsID09ICd3YXRlcicgfHwgY2VsbCA9PSAnZmFrZVdhdGVyJylcblx0XHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0aWYgKHRyaWVzID4gMTAwMClcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9ICBlbHNlIGlmIChub1dhdGVyKXtcblx0XHRcdFx0aWYgKGNlbGwgPT0gJ3dhdGVyJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKXtcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRcdGlmICh0cmllcyA+IDEwMDApXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2VsbCA9PSAnc3RvbmVGbG9vcicgfHwgY2VsbCA9PSAnY2F2ZXJuRmxvb3InKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJhbmRQb2ludDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChjZWxsID09ICdzdG9uZUZsb29yJyB8fCBjZWxsID09ICdjYXZlcm5GbG9vcicgfHwgY2VsbCA9PSAnZmFrZVdhdGVyJylcblx0XHRcdFx0cmV0dXJuIHJhbmRQb2ludDtcblx0XHR9XG5cdH0sXG5cdGdldEFyZWE6IGZ1bmN0aW9uKHgseSl7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZWFzU2tldGNoLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gdGhpcy5hcmVhc1NrZXRjaFtpXTtcblx0XHRcdGlmICh4ID49IGFyZWEueCAmJiB4IDwgYXJlYS54ICsgYXJlYS53XG5cdFx0XHRcdFx0JiYgeSA+PSBhcmVhLnkgJiYgeSA8IGFyZWEueSArIGFyZWEuaClcblx0XHRcdFx0cmV0dXJuIGFyZWE7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbDsiLCJmdW5jdGlvbiBNb25zdGVyUG9wdWxhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcblxuTW9uc3RlclBvcHVsYXRvci5wcm90b3R5cGUgPSB7XG5cdHBvcHVsYXRlTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gc2tldGNoLmFyZWFzW2ldO1xuXHRcdFx0aWYgKGFyZWEuaGFzRW50cmFuY2UpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0dGhpcy5wb3B1bGF0ZUFyZWEoYXJlYSwgbGV2ZWwpO1xuXHRcdH1cblx0XHR0aGlzLnBvcHVsYXRlVmVybWluKGxldmVsKTtcblx0fSxcblx0cG9wdWxhdGVWZXJtaW46IGZ1bmN0aW9uKCBsZXZlbCl7XG5cdFx0dmFyIHRyaWVzID0gMDtcblx0XHR2YXIgdmVybWluID0gMzA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJtaW47IGkrKyl7XG5cdFx0XHR2YXIgbW9uc3RlciA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGxldmVsLnZlcm1pbik7XG5cdFx0XHR2YXIgb25seVdhdGVyID0gdGhpcy5pc1dhdGVyTW9uc3Rlcihtb25zdGVyKTtcblx0XHRcdHZhciBub1dhdGVyID0gIW9ubHlXYXRlciAmJiAhdGhpcy5pc0ZseWluZ01vbnN0ZXIobW9uc3Rlcik7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBsZXZlbC5nZXRGcmVlUGxhY2VPbkxldmVsKG9ubHlXYXRlciwgbm9XYXRlcik7XG5cdFx0XHRpZiAocG9zaXRpb24pe1xuXHRcdFx0XHRpZiAobGV2ZWwuZ2V0RW5lbXkocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpe1xuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdFx0aWYgKHRyaWVzIDwgMTAwKXtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dHJpZXMgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXZlbC5hZGRFbmVteShtb25zdGVyLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHBvcHVsYXRlQXJlYTogZnVuY3Rpb24oYXJlYSwgbGV2ZWwpe1xuXHRcdGlmIChhcmVhLmJvc3Mpe1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gbGV2ZWwuZ2V0RnJlZVBsYWNlKGFyZWEsIGZhbHNlLCB0cnVlKTtcblx0XHRcdGlmIChwb3NpdGlvbil7XG5cdFx0XHRcdGxldmVsLmFkZEVuZW15KGFyZWEuYm9zcywgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhLmVuZW15Q291bnQ7IGkrKyl7XG5cdFx0XHR2YXIgbW9uc3RlciA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGFyZWEuZW5lbWllcyk7XG5cdFx0XHR2YXIgb25seVdhdGVyID0gdGhpcy5pc1dhdGVyTW9uc3Rlcihtb25zdGVyKTtcblx0XHRcdHZhciBub1dhdGVyID0gIW9ubHlXYXRlciAmJiAhdGhpcy5pc0ZseWluZ01vbnN0ZXIobW9uc3Rlcik7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSwgb25seVdhdGVyLCBub1dhdGVyKTtcblx0XHRcdGlmIChwb3NpdGlvbil7XG5cdFx0XHRcdGlmIChsZXZlbC5nZXRFbmVteShwb3NpdGlvbi54LCBwb3NpdGlvbi55KSl7XG5cdFx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0XHRpZiAodHJpZXMgPCAxMDApe1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0cmllcyA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldmVsLmFkZEVuZW15KG1vbnN0ZXIsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0aXNXYXRlck1vbnN0ZXI6IGZ1bmN0aW9uKG1vbnN0ZXIpe1xuXHRcdHJldHVybiBtb25zdGVyID09ICdvY3RvcHVzJyB8fCBtb25zdGVyID09ICdzZWFTZXJwZW50JzsgXG5cdH0sXG5cdGlzRmx5aW5nTW9uc3RlcjogZnVuY3Rpb24obW9uc3Rlcil7XG5cdFx0cmV0dXJuIG1vbnN0ZXIgPT0gJ2JhdCcgfHwgbW9uc3RlciA9PSAnbW9uZ2JhdCcgfHwgbW9uc3RlciA9PSAnZ2hvc3QnIHx8IG1vbnN0ZXIgPT0gJ2RyYWdvbicgfHwgbW9uc3RlciA9PSAnZ2F6ZXInOyBcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vbnN0ZXJQb3B1bGF0b3I7IiwiZnVuY3Rpb24gU2Vjb25kTGV2ZWxHZW5lcmF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xudmFyIExldmVsID0gcmVxdWlyZSgnLi9MZXZlbC5jbGFzcycpO1xudmFyIENBID0gcmVxdWlyZSgnLi9DQScpO1xuXG5TZWNvbmRMZXZlbEdlbmVyYXRvci5wcm90b3R5cGUgPSB7XG5cdGZpbGxMZXZlbDogZnVuY3Rpb24oc2tldGNoKXtcblx0XHR2YXIgbGV2ZWwgPSBuZXcgTGV2ZWwodGhpcy5jb25maWcpO1xuXHRcdGxldmVsLmluaXQoKTtcblx0XHR0aGlzLmZpbGxTdHJhdGEobGV2ZWwsIHNrZXRjaCk7XG5cdFx0bGV2ZWwuY2VpbGluZ0hlaWdodCA9IHNrZXRjaC5jZWlsaW5nSGVpZ2h0O1xuXHRcdGxldmVsLmRlcHRoID0gc2tldGNoLmRlcHRoO1xuXHRcdGxldmVsLnZlcm1pbiA9IHNrZXRjaC52ZXJtaW47XG5cdFx0aWYgKHNrZXRjaC5oYXNMYXZhKVxuXHRcdFx0dGhpcy5wbG90Uml2ZXJzKGxldmVsLCBza2V0Y2gsICdsYXZhJyk7XG5cdFx0ZWxzZSBpZiAoc2tldGNoLmhhc1JpdmVycylcblx0XHRcdHRoaXMucGxvdFJpdmVycyhsZXZlbCwgc2tldGNoLCAnd2F0ZXInKTtcblx0XHR0aGlzLmNvcHlHZW8obGV2ZWwpO1xuXHRcdHJldHVybiBsZXZlbDtcblx0fSxcblx0ZmlsbFN0cmF0YTogZnVuY3Rpb24obGV2ZWwsIHNrZXRjaCl7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRjb3B5R2VvOiBmdW5jdGlvbihsZXZlbCl7XG5cdFx0dmFyIGdlbyA9IFtdO1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRnZW9beF0gPSBbXTtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0XHRnZW9beF1beV0gPSBsZXZlbC5jZWxsc1t4XVt5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bGV2ZWwuZ2VvID0gZ2VvO1xuXHR9LFxuXHRwbG90Uml2ZXJzOiBmdW5jdGlvbihsZXZlbCwgc2tldGNoLCBsaXF1aWQpe1xuXHRcdHRoaXMucGxhY2VSaXZlcmxpbmVzKGxldmVsLCBza2V0Y2gsIGxpcXVpZCk7XG5cdFx0dGhpcy5mYXR0ZW5SaXZlcnMobGV2ZWwsIGxpcXVpZCk7XG5cdFx0aWYgKGxpcXVpZCA9PSAnbGF2YScpXG5cdFx0XHR0aGlzLmZhdHRlblJpdmVycyhsZXZlbCwgbGlxdWlkKTtcblx0fSxcblx0ZmF0dGVuUml2ZXJzOiBmdW5jdGlvbihsZXZlbCwgbGlxdWlkKXtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbbGlxdWlkXSA+IDEgJiYgVXRpbC5jaGFuY2UoMzApKVxuXHRcdFx0XHRyZXR1cm4gbGlxdWlkO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1tsaXF1aWRdID4gMSlcblx0XHRcdFx0cmV0dXJuIGxpcXVpZDtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0fSxcblx0cGxhY2VSaXZlcmxpbmVzOiBmdW5jdGlvbihsZXZlbCwgc2tldGNoLCBsaXF1aWQpe1xuXHRcdC8vIFBsYWNlIHJhbmRvbSBsaW5lIHNlZ21lbnRzIG9mIHdhdGVyXG5cdFx0dmFyIHJpdmVycyA9IFV0aWwucmFuZCh0aGlzLmNvbmZpZy5NSU5fUklWRVJTLHRoaXMuY29uZmlnLk1BWF9SSVZFUlMpO1xuXHRcdHZhciByaXZlclNlZ21lbnRMZW5ndGggPSB0aGlzLmNvbmZpZy5SSVZFUl9TRUdNRU5UX0xFTkdUSDtcblx0XHR2YXIgcHVkZGxlID0gZmFsc2U7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaXZlcnM7IGkrKyl7XG5cdFx0XHR2YXIgc2VnbWVudHMgPSBVdGlsLnJhbmQodGhpcy5jb25maWcuTUlOX1JJVkVSX1NFR01FTlRTLHRoaXMuY29uZmlnLk1BWF9SSVZFUl9TRUdNRU5UUyk7XG5cdFx0XHR2YXIgcml2ZXJQb2ludHMgPSBbXTtcblx0XHRcdHJpdmVyUG9pbnRzLnB1c2goe1xuXHRcdFx0XHR4OiBVdGlsLnJhbmQoMCwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEgpLFxuXHRcdFx0XHR5OiBVdGlsLnJhbmQoMCwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUKVxuXHRcdFx0fSk7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHNlZ21lbnRzOyBqKyspe1xuXHRcdFx0XHR2YXIgcmFuZG9tUG9pbnQgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihyaXZlclBvaW50cyk7XG5cdFx0XHRcdGlmIChyaXZlclBvaW50cy5sZW5ndGggPiAxICYmICFwdWRkbGUpXG5cdFx0XHRcdFx0VXRpbC5yZW1vdmVGcm9tQXJyYXkocml2ZXJQb2ludHMsIHJhbmRvbVBvaW50KTtcblx0XHRcdFx0dmFyIGlhbmNlID0ge1xuXHRcdFx0XHRcdHg6IFV0aWwucmFuZCgtcml2ZXJTZWdtZW50TGVuZ3RoLCByaXZlclNlZ21lbnRMZW5ndGgpLFxuXHRcdFx0XHRcdHk6IFV0aWwucmFuZCgtcml2ZXJTZWdtZW50TGVuZ3RoLCByaXZlclNlZ21lbnRMZW5ndGgpXG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhciBuZXdQb2ludCA9IHtcblx0XHRcdFx0XHR4OiByYW5kb21Qb2ludC54ICsgaWFuY2UueCxcblx0XHRcdFx0XHR5OiByYW5kb21Qb2ludC55ICsgaWFuY2UueSxcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKG5ld1BvaW50LnggPiAwICYmIG5ld1BvaW50LnggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCAmJiBcblx0XHRcdFx0XHRuZXdQb2ludC55ID4gMCAmJiBuZXdQb2ludC55IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUKVxuXHRcdFx0XHRcdHJpdmVyUG9pbnRzLnB1c2gobmV3UG9pbnQpO1xuXHRcdFx0XHR2YXIgbGluZSA9IFV0aWwubGluZShyYW5kb21Qb2ludCwgbmV3UG9pbnQpO1xuXHRcdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IGxpbmUubGVuZ3RoOyBrKyspe1xuXHRcdFx0XHRcdHZhciBwb2ludCA9IGxpbmVba107XG5cdFx0XHRcdFx0aWYgKHBvaW50LnggPiAwICYmIHBvaW50LnggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCAmJiBcblx0XHRcdFx0XHRcdHBvaW50LnkgPiAwICYmIHBvaW50LnkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQpXG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSBsaXF1aWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGZyYW1lTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRpZiAobGV2ZWwuY2VsbHNbeF1bMF0gIT0gJ3N0b25lV2FsbCcpIGxldmVsLmNlbGxzW3hdWzBdID0gc2tldGNoLnN0cmF0YTtcblx0XHRcdGlmIChsZXZlbC5jZWxsc1t4XVt0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQtMV0gIT0gJ3N0b25lV2FsbCcpIGxldmVsLmNlbGxzW3hdW3RoaXMuY29uZmlnLkxFVkVMX0hFSUdIVC0xXSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0fVxuXHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0aWYgKGxldmVsLmNlbGxzWzBdW3ldICE9ICdzdG9uZVdhbGwnKSBsZXZlbC5jZWxsc1swXVt5XSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0XHRpZiAobGV2ZWwuY2VsbHNbdGhpcy5jb25maWcuTEVWRUxfV0lEVEgtMV1beV0gIT0gJ3N0b25lV2FsbCcpIGxldmVsLmNlbGxzW3RoaXMuY29uZmlnLkxFVkVMX1dJRFRILTFdW3ldID0gc2tldGNoLnN0cmF0YTtcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWNvbmRMZXZlbEdlbmVyYXRvcjsiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN1YmRpdmlkZUFyZWE6IGZ1bmN0aW9uKGJpZ0FyZWEsIG1heERlcHRoLCBNSU5fV0lEVEgsIE1JTl9IRUlHSFQsIE1BWF9XSURUSCwgTUFYX0hFSUdIVCwgU0xJQ0VfUkFOR0VfU1RBUlQsIFNMSUNFX1JBTkdFX0VORCwgYXZvaWRQb2ludHMpe1xuXHRcdHZhciBhcmVhcyA9IFtdO1xuXHRcdHZhciBiaWdBcmVhcyA9IFtdO1xuXHRcdGJpZ0FyZWEuZGVwdGggPSAwO1xuXHRcdGJpZ0FyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0dmFyIHJldHJpZXMgPSAwO1xuXHRcdHdoaWxlIChiaWdBcmVhcy5sZW5ndGggPiAwKXtcblx0XHRcdHZhciBiaWdBcmVhID0gYmlnQXJlYXMucG9wKCk7XG5cdFx0XHRpZiAoYmlnQXJlYS53IDwgTUlOX1dJRFRIICsgMSAmJiBiaWdBcmVhLmggPCBNSU5fSEVJR0hUICsgMSl7XG5cdFx0XHRcdGJpZ0FyZWEuYnJpZGdlcyA9IFtdO1xuXHRcdFx0XHRhcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHZhciBob3Jpem9udGFsU3BsaXQgPSBVdGlsLmNoYW5jZSg1MCk7XG5cdFx0XHRpZiAoYmlnQXJlYS53IDwgTUlOX1dJRFRIICsgMSl7XG5cdFx0XHRcdGhvcml6b250YWxTcGxpdCA9IHRydWU7XG5cdFx0XHR9IFxuXHRcdFx0aWYgKGJpZ0FyZWEuaCA8IE1JTl9IRUlHSFQgKyAxKXtcblx0XHRcdFx0aG9yaXpvbnRhbFNwbGl0ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgYXJlYTEgPSBudWxsO1xuXHRcdFx0dmFyIGFyZWEyID0gbnVsbDtcblx0XHRcdGlmIChob3Jpem9udGFsU3BsaXQpe1xuXHRcdFx0XHR2YXIgc2xpY2UgPSBNYXRoLnJvdW5kKFV0aWwucmFuZChiaWdBcmVhLmggKiBTTElDRV9SQU5HRV9TVEFSVCwgYmlnQXJlYS5oICogU0xJQ0VfUkFOR0VfRU5EKSk7XG5cdFx0XHRcdGFyZWExID0ge1xuXHRcdFx0XHRcdHg6IGJpZ0FyZWEueCxcblx0XHRcdFx0XHR5OiBiaWdBcmVhLnksXG5cdFx0XHRcdFx0dzogYmlnQXJlYS53LFxuXHRcdFx0XHRcdGg6IHNsaWNlXG5cdFx0XHRcdH07XG5cdFx0XHRcdGFyZWEyID0ge1xuXHRcdFx0XHRcdHg6IGJpZ0FyZWEueCxcblx0XHRcdFx0XHR5OiBiaWdBcmVhLnkgKyBzbGljZSxcblx0XHRcdFx0XHR3OiBiaWdBcmVhLncsXG5cdFx0XHRcdFx0aDogYmlnQXJlYS5oIC0gc2xpY2Vcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHNsaWNlID0gTWF0aC5yb3VuZChVdGlsLnJhbmQoYmlnQXJlYS53ICogU0xJQ0VfUkFOR0VfU1RBUlQsIGJpZ0FyZWEudyAqIFNMSUNFX1JBTkdFX0VORCkpO1xuXHRcdFx0XHRhcmVhMSA9IHtcblx0XHRcdFx0XHR4OiBiaWdBcmVhLngsXG5cdFx0XHRcdFx0eTogYmlnQXJlYS55LFxuXHRcdFx0XHRcdHc6IHNsaWNlLFxuXHRcdFx0XHRcdGg6IGJpZ0FyZWEuaFxuXHRcdFx0XHR9XG5cdFx0XHRcdGFyZWEyID0ge1xuXHRcdFx0XHRcdHg6IGJpZ0FyZWEueCtzbGljZSxcblx0XHRcdFx0XHR5OiBiaWdBcmVhLnksXG5cdFx0XHRcdFx0dzogYmlnQXJlYS53LXNsaWNlLFxuXHRcdFx0XHRcdGg6IGJpZ0FyZWEuaFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZWExLncgPCBNSU5fV0lEVEggfHwgYXJlYTEuaCA8IE1JTl9IRUlHSFQgfHxcblx0XHRcdFx0YXJlYTIudyA8IE1JTl9XSURUSCB8fCBhcmVhMi5oIDwgTUlOX0hFSUdIVCl7XG5cdFx0XHRcdGlmIChyZXRyaWVzID4gMTAwKXtcblx0XHRcdFx0XHRiaWdBcmVhLmJyaWRnZXMgPSBbXTtcblx0XHRcdFx0XHRhcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRcdHJldHJpZXMgPSAwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJpZ0FyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdFx0cmV0cmllcysrO1xuXHRcdFx0XHR9XHRcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYmlnQXJlYS5kZXB0aCA9PSBtYXhEZXB0aCAmJiBcblx0XHRcdFx0XHQoYXJlYTEudyA+IE1BWF9XSURUSCB8fCBhcmVhMS5oID4gTUFYX0hFSUdIVCB8fFxuXHRcdFx0XHRcdGFyZWEyLncgPiBNQVhfV0lEVEggfHwgYXJlYTIuaCA+IE1BWF9IRUlHSFQpKXtcblx0XHRcdFx0aWYgKHJldHJpZXMgPCAxMDApIHtcblx0XHRcdFx0XHQvLyBQdXNoIGJhY2sgYmlnIGFyZWFcblx0XHRcdFx0XHRiaWdBcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRcdHJldHJpZXMrKztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXRyaWVzID0gMDtcblx0XHRcdH1cblx0XHRcdGlmIChhdm9pZFBvaW50cyAmJiAodGhpcy5jb2xsaWRlc1dpdGgoYXZvaWRQb2ludHMsIGFyZWEyKSB8fCB0aGlzLmNvbGxpZGVzV2l0aChhdm9pZFBvaW50cywgYXJlYTEpKSl7XG5cdFx0XHRcdGlmIChyZXRyaWVzID4gMTAwKXtcblx0XHRcdFx0XHRiaWdBcmVhLmJyaWRnZXMgPSBbXTtcblx0XHRcdFx0XHRhcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRcdHJldHJpZXMgPSAwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIFB1c2ggYmFjayBiaWcgYXJlYVxuXHRcdFx0XHRcdGJpZ0FyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdFx0cmV0cmllcysrO1xuXHRcdFx0XHR9XHRcdFxuXHRcdFx0XHRjb250aW51ZTsgXG5cdFx0XHR9XG5cdFx0XHRpZiAoYmlnQXJlYS5kZXB0aCA9PSBtYXhEZXB0aCl7XG5cdFx0XHRcdGFyZWExLmJyaWRnZXMgPSBbXTtcblx0XHRcdFx0YXJlYTIuYnJpZGdlcyA9IFtdO1xuXHRcdFx0XHRhcmVhcy5wdXNoKGFyZWExKTtcblx0XHRcdFx0YXJlYXMucHVzaChhcmVhMik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcmVhMS5kZXB0aCA9IGJpZ0FyZWEuZGVwdGggKzE7XG5cdFx0XHRcdGFyZWEyLmRlcHRoID0gYmlnQXJlYS5kZXB0aCArMTtcblx0XHRcdFx0YmlnQXJlYXMucHVzaChhcmVhMSk7XG5cdFx0XHRcdGJpZ0FyZWFzLnB1c2goYXJlYTIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYXJlYXM7XG5cdH0sXG5cdGNvbGxpZGVzV2l0aDogZnVuY3Rpb24oYXZvaWRQb2ludHMsIGFyZWEpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXZvaWRQb2ludHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGF2b2lkUG9pbnQgPSBhdm9pZFBvaW50c1tpXTtcblx0XHRcdGlmIChVdGlsLmZsYXREaXN0YW5jZShhcmVhLngsIGFyZWEueSwgYXZvaWRQb2ludC54LCBhdm9pZFBvaW50LnkpIDw9IDIgfHxcblx0XHRcdFx0VXRpbC5mbGF0RGlzdGFuY2UoYXJlYS54K2FyZWEudywgYXJlYS55LCBhdm9pZFBvaW50LngsIGF2b2lkUG9pbnQueSkgPD0gMiB8fFxuXHRcdFx0XHRVdGlsLmZsYXREaXN0YW5jZShhcmVhLngsIGFyZWEueSthcmVhLmgsIGF2b2lkUG9pbnQueCwgYXZvaWRQb2ludC55KSA8PSAyIHx8XG5cdFx0XHRcdFV0aWwuZmxhdERpc3RhbmNlKGFyZWEueCthcmVhLncsIGFyZWEueSthcmVhLmgsIGF2b2lkUG9pbnQueCwgYXZvaWRQb2ludC55KSA8PSAyKXtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0Y29ubmVjdEFyZWFzOiBmdW5jdGlvbihhcmVhcywgYm9yZGVyKXtcblx0XHQvKiBNYWtlIG9uZSBhcmVhIGNvbm5lY3RlZFxuXHRcdCAqIFdoaWxlIG5vdCBhbGwgYXJlYXMgY29ubmVjdGVkLFxuXHRcdCAqICBTZWxlY3QgYSBjb25uZWN0ZWQgYXJlYVxuXHRcdCAqICBTZWxlY3QgYSB2YWxpZCB3YWxsIGZyb20gdGhlIGFyZWFcblx0XHQgKiAgVGVhciBpdCBkb3duLCBjb25uZWN0aW5nIHRvIHRoZSBhIG5lYXJieSBhcmVhXG5cdFx0ICogIE1hcmsgYXJlYSBhcyBjb25uZWN0ZWRcblx0XHQgKi9cblx0XHRpZiAoIWJvcmRlcil7XG5cdFx0XHRib3JkZXIgPSAxO1xuXHRcdH1cblx0XHR2YXIgY29ubmVjdGVkQXJlYXMgPSBbXTtcblx0XHR2YXIgcmFuZG9tQXJlYSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGFyZWFzKTtcblx0XHRjb25uZWN0ZWRBcmVhcy5wdXNoKHJhbmRvbUFyZWEpO1xuXHRcdHZhciBjdXJzb3IgPSB7fTtcblx0XHR2YXIgdmFyaSA9IHt9O1xuXHRcdGFyZWE6IHdoaWxlIChjb25uZWN0ZWRBcmVhcy5sZW5ndGggPCBhcmVhcy5sZW5ndGgpe1xuXHRcdFx0cmFuZG9tQXJlYSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGNvbm5lY3RlZEFyZWFzKTtcblx0XHRcdHZhciB3YWxsRGlyID0gVXRpbC5yYW5kKDEsNCk7XG5cdFx0XHRzd2l0Y2god2FsbERpcil7XG5cdFx0XHRjYXNlIDE6IC8vIExlZnRcblx0XHRcdFx0Y3Vyc29yLnggPSByYW5kb21BcmVhLng7XG5cdFx0XHRcdGN1cnNvci55ID0gVXRpbC5yYW5kKHJhbmRvbUFyZWEueSArIGJvcmRlciAsIHJhbmRvbUFyZWEueStyYW5kb21BcmVhLmggLSBib3JkZXIpO1xuXHRcdFx0XHR2YXJpLnggPSAtMjtcblx0XHRcdFx0dmFyaS55ID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6IC8vUmlnaHRcblx0XHRcdFx0Y3Vyc29yLnggPSByYW5kb21BcmVhLnggKyByYW5kb21BcmVhLnc7XG5cdFx0XHRcdGN1cnNvci55ID0gVXRpbC5yYW5kKHJhbmRvbUFyZWEueSArIGJvcmRlciwgcmFuZG9tQXJlYS55K3JhbmRvbUFyZWEuaCAtIGJvcmRlcik7XG5cdFx0XHRcdHZhcmkueCA9IDI7XG5cdFx0XHRcdHZhcmkueSA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAzOiAvL1VwXG5cdFx0XHRcdGN1cnNvci54ID0gVXRpbC5yYW5kKHJhbmRvbUFyZWEueCArIGJvcmRlciwgcmFuZG9tQXJlYS54K3JhbmRvbUFyZWEudyAtIGJvcmRlcik7XG5cdFx0XHRcdGN1cnNvci55ID0gcmFuZG9tQXJlYS55O1xuXHRcdFx0XHR2YXJpLnggPSAwO1xuXHRcdFx0XHR2YXJpLnkgPSAtMjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDQ6IC8vRG93blxuXHRcdFx0XHRjdXJzb3IueCA9IFV0aWwucmFuZChyYW5kb21BcmVhLnggKyBib3JkZXIsIHJhbmRvbUFyZWEueCtyYW5kb21BcmVhLncgLSBib3JkZXIpO1xuXHRcdFx0XHRjdXJzb3IueSA9IHJhbmRvbUFyZWEueSArIHJhbmRvbUFyZWEuaDtcblx0XHRcdFx0dmFyaS54ID0gMDtcblx0XHRcdFx0dmFyaS55ID0gMjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHR2YXIgY29ubmVjdGVkQXJlYSA9IHRoaXMuZ2V0QXJlYUF0KGN1cnNvciwgdmFyaSwgYXJlYXMpO1xuXHRcdFx0aWYgKGNvbm5lY3RlZEFyZWEgJiYgIVV0aWwuY29udGFpbnMoY29ubmVjdGVkQXJlYXMsIGNvbm5lY3RlZEFyZWEpKXtcblx0XHRcdFx0c3dpdGNoKHdhbGxEaXIpe1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRpZiAoY3Vyc29yLnkgPD0gY29ubmVjdGVkQXJlYS55ICsgYm9yZGVyIHx8IGN1cnNvci55ID49IGNvbm5lY3RlZEFyZWEueSArIGNvbm5lY3RlZEFyZWEuaCAtIGJvcmRlcilcblx0XHRcdFx0XHRcdGNvbnRpbnVlIGFyZWE7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdGlmIChjdXJzb3IueCA8PSBjb25uZWN0ZWRBcmVhLnggKyBib3JkZXIgfHwgY3Vyc29yLnggPj0gY29ubmVjdGVkQXJlYS54ICsgY29ubmVjdGVkQXJlYS53IC0gYm9yZGVyKVxuXHRcdFx0XHRcdFx0Y29udGludWUgYXJlYTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb25uZWN0QXJlYShyYW5kb21BcmVhLCBjb25uZWN0ZWRBcmVhLCBjdXJzb3IpO1xuXHRcdFx0XHRjb25uZWN0ZWRBcmVhcy5wdXNoKGNvbm5lY3RlZEFyZWEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Z2V0QXJlYUF0OiBmdW5jdGlvbihjdXJzb3IsIHZhcmksIGFyZWFzKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gYXJlYXNbaV07XG5cdFx0XHRpZiAoY3Vyc29yLnggKyB2YXJpLnggPj0gYXJlYS54ICYmIGN1cnNvci54ICsgdmFyaS54IDw9IGFyZWEueCArIGFyZWEudyBcblx0XHRcdFx0XHQmJiBjdXJzb3IueSArIHZhcmkueSA+PSBhcmVhLnkgJiYgY3Vyc29yLnkgKyB2YXJpLnkgPD0gYXJlYS55ICsgYXJlYS5oKVxuXHRcdFx0XHRyZXR1cm4gYXJlYTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRjb25uZWN0QXJlYTogZnVuY3Rpb24oYXJlYTEsIGFyZWEyLCBwb3NpdGlvbil7XG5cdFx0YXJlYTEuYnJpZGdlcy5wdXNoKHtcblx0XHRcdHg6IHBvc2l0aW9uLngsXG5cdFx0XHR5OiBwb3NpdGlvbi55LFxuXHRcdFx0dG86IGFyZWEyXG5cdFx0fSk7XG5cdFx0YXJlYTIuYnJpZGdlcy5wdXNoKHtcblx0XHRcdHg6IHBvc2l0aW9uLngsXG5cdFx0XHR5OiBwb3NpdGlvbi55LFxuXHRcdFx0dG86IGFyZWExXG5cdFx0fSk7XG5cdH1cbn0iLCJmdW5jdGlvbiBUaGlyZExldmVsR2VuZXJhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcbnZhciBDQSA9IHJlcXVpcmUoJy4vQ0EnKTtcbnZhciBTcGxpdHRlciA9IHJlcXVpcmUoJy4vU3BsaXR0ZXInKTtcblxuVGhpcmRMZXZlbEdlbmVyYXRvci5wcm90b3R5cGUgPSB7XG5cdGZpbGxMZXZlbDogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCl7XG5cdFx0dGhpcy5maWxsUm9vbXMoc2tldGNoLCBsZXZlbClcblx0XHR0aGlzLmZhdHRlbkNhdmVybnMobGV2ZWwpO1xuXHRcdHRoaXMucGxhY2VFeGl0cyhza2V0Y2gsIGxldmVsKTtcblx0XHR0aGlzLnJhaXNlSXNsYW5kcyhsZXZlbCk7XG5cdFx0dGhpcy5lbmxhcmdlQnJpZGdlcyhsZXZlbCk7XG5cdFx0dGhpcy5wbGFjZUZlYXR1cmVzKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdGxldmVsLmFyZWFzU2tldGNoID0gc2tldGNoLmFyZWFzO1xuXHRcdHJldHVybiBsZXZlbDtcblx0fSxcblx0ZmF0dGVuQ2F2ZXJuczogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdC8vIEdyb3cgY2F2ZXJuc1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snY2F2ZXJuRmxvb3InXSA+IDAgJiYgVXRpbC5jaGFuY2UoMjApKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2NhdmVybkZsb29yJ10gPiAxKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHQvLyBHcm93IGxhZ29vbiBhcmVhc1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snZmFrZVdhdGVyJ10gPiAwICYmIFV0aWwuY2hhbmNlKDQwKSlcblx0XHRcdFx0cmV0dXJuICdmYWtlV2F0ZXInO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snZmFrZVdhdGVyJ10gPiAwKVxuXHRcdFx0XHRyZXR1cm4gJ2Zha2VXYXRlcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0XG5cdFx0XG5cdFx0Ly8gRXhwYW5kIHdhbGwtbGVzcyByb29tc1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChjdXJyZW50ICE9ICdzb2xpZFJvY2snKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ3N0b25lRmxvb3InXSA+IDIgJiYgVXRpbC5jaGFuY2UoMTApKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxKTtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnc29saWRSb2NrJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydzdG9uZUZsb29yJ10gPiAwICYmIHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddPjApXG5cdFx0XHRcdHJldHVybiAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdC8vIERldGVyaW9yYXRlIHdhbGwgcm9vbXNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnc3RvbmVXYWxsJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydzdG9uZUZsb29yJ10gPiAwICYmIFV0aWwuY2hhbmNlKDUpKVxuXHRcdFx0XHRyZXR1cm4gJ3N0b25lRmxvb3InO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdFxuXHR9LFxuXHRlbmxhcmdlQnJpZGdlczogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChjdXJyZW50ICE9ICdsYXZhJyAmJiBjdXJyZW50ICE9ICd3YXRlcicgJiYgY3VycmVudCAhPSAnZmFrZVdhdGVyJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0LyppZiAoc3Vycm91bmRpbmdbJ2NhdmVybkZsb29yJ10gPiAwIHx8IHN1cnJvdW5kaW5nWydzdG9uZUZsb29yJ10gPiAwKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7Ki9cblx0XHRcdGlmIChzdXJyb3VuZGluZ1snYnJpZGdlJ10gPiAwKVxuXHRcdFx0XHRyZXR1cm4gJ2JyaWRnZSc7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdH0sXG5cdHJhaXNlSXNsYW5kczogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChjdXJyZW50ICE9ICd3YXRlcicpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdHZhciBjYXZlcm5zID0gc3Vycm91bmRpbmdbJ2NhdmVybkZsb29yJ107IFxuXHRcdFx0aWYgKGNhdmVybnMgPiAwICYmIFV0aWwuY2hhbmNlKDcwKSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0Ly8gSXNsYW5kIGZvciBleGl0cyBvbiB3YXRlclxuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChjdXJyZW50ICE9ICdmYWtlV2F0ZXInICYmIGN1cnJlbnQgIT0gJ3dhdGVyJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0dmFyIHN0YWlycyA9IHN1cnJvdW5kaW5nWydkb3duc3RhaXJzJ10gPyBzdXJyb3VuZGluZ1snZG93bnN0YWlycyddIDogMCArXG5cdFx0XHRcdFx0c3Vycm91bmRpbmdbJ3Vwc3RhaXJzJ10gPyBzdXJyb3VuZGluZ1sndXBzdGFpcnMnXSA6IDA7IFxuXHRcdFx0aWYgKHN0YWlycyA+IDApXG5cdFx0XHRcdHJldHVybiAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEpO1xuXHR9LFxuXHRmaWxsUm9vbXM6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gc2tldGNoLmFyZWFzW2ldO1xuXHRcdFx0dmFyIHR5cGUgPSBhcmVhLmFyZWFUeXBlO1xuXHRcdFx0aWYgKHR5cGUgPT09ICdjYXZlcm4nKXsgXG5cdFx0XHRcdHRoaXMuZmlsbFdpdGhDYXZlcm4obGV2ZWwsIGFyZWEpO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlID09PSAncm9vbXMnKXtcblx0XHRcdFx0dGhpcy5maWxsV2l0aFJvb21zKGxldmVsLCBhcmVhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHBsYWNlRXhpdHM6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gc2tldGNoLmFyZWFzW2ldO1xuXHRcdFx0aWYgKCFhcmVhLmhhc0V4aXQgJiYgIWFyZWEuaGFzRW50cmFuY2UpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0dmFyIHRpbGUgPSBudWxsO1xuXHRcdFx0aWYgKGFyZWEuaGFzRXhpdCl7XG5cdFx0XHRcdHRpbGUgPSAnZG93bnN0YWlycyc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aWxlID0gJ3Vwc3RhaXJzJztcblx0XHRcdH1cblx0XHRcdHZhciBmcmVlU3BvdCA9IGxldmVsLmdldEZyZWVQbGFjZShhcmVhKTtcblx0XHRcdGlmIChmcmVlU3BvdC54ID09IDAgfHwgZnJlZVNwb3QueSA9PSAwIHx8IGZyZWVTcG90LnggPT0gbGV2ZWwuY2VsbHMubGVuZ3RoIC0gMSB8fCBmcmVlU3BvdC55ID09IGxldmVsLmNlbGxzWzBdLmxlbmd0aCAtIDEpe1xuXHRcdFx0XHRpLS07XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0bGV2ZWwuY2VsbHNbZnJlZVNwb3QueF1bZnJlZVNwb3QueV0gPSB0aWxlO1xuXHRcdFx0aWYgKGFyZWEuaGFzRXhpdCl7XG5cdFx0XHRcdGxldmVsLmVuZCA9IHtcblx0XHRcdFx0XHR4OiBmcmVlU3BvdC54LFxuXHRcdFx0XHRcdHk6IGZyZWVTcG90Lnlcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxldmVsLnN0YXJ0ID0ge1xuXHRcdFx0XHRcdHg6IGZyZWVTcG90LngsXG5cdFx0XHRcdFx0eTogZnJlZVNwb3QueVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cGxhY2VGZWF0dXJlczogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCl7XG5cdFx0dmFyIHRyaWVzID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdGlmICghYXJlYS5mZWF0dXJlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdHZhciBmcmVlU3BvdCA9IGxldmVsLmdldEZyZWVQbGFjZShhcmVhKTtcblx0XHRcdGlmIChmcmVlU3BvdC54ID09IDAgfHwgZnJlZVNwb3QueSA9PSAwIHx8IGZyZWVTcG90LnggPT0gbGV2ZWwuY2VsbHMubGVuZ3RoIC0gMSB8fCBmcmVlU3BvdC55ID09IGxldmVsLmNlbGxzWzBdLmxlbmd0aCAtIDEpe1xuXHRcdFx0XHRpLS07XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFsZXZlbC5pc0ZyZWVBcm91bmQoZnJlZVNwb3QsIGFyZWEpIHx8XG5cdFx0XHRcdChNYXRoLmFicyhmcmVlU3BvdC54IC0gbGV2ZWwuZW5kLngpIDwgMyAmJiBNYXRoLmFicyhmcmVlU3BvdC55IC0gbGV2ZWwuZW5kLnkpIDwgMykgfHxcblx0XHRcdFx0KE1hdGguYWJzKGZyZWVTcG90LnggLSBsZXZlbC5zdGFydC54KSA8IDMgJiYgTWF0aC5hYnMoZnJlZVNwb3QueSAtIGxldmVsLnN0YXJ0LnkpIDwgMylcblx0XHRcdFx0XHQpe1xuXHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRpZiAodHJpZXMgPiAxMDApe1xuXHRcdFx0XHRcdHRyaWVzID0gMDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRsZXZlbC5hZGRGZWF0dXJlKGFyZWEuZmVhdHVyZSwgZnJlZVNwb3QueCwgZnJlZVNwb3QueSk7XG5cdFx0fVxuXHR9LFxuXHRmaWxsV2l0aENhdmVybjogZnVuY3Rpb24obGV2ZWwsIGFyZWEpe1xuXHRcdC8vIENvbm5lY3QgYWxsIGJyaWRnZXMgd2l0aCBtaWRwb2ludFxuXHRcdHZhciBtaWRwb2ludCA9IHtcblx0XHRcdHg6IE1hdGgucm91bmQoVXRpbC5yYW5kKGFyZWEueCArIGFyZWEudyAqIDEvMywgYXJlYS54K2FyZWEudyAqIDIvMykpLFxuXHRcdFx0eTogTWF0aC5yb3VuZChVdGlsLnJhbmQoYXJlYS55ICsgYXJlYS5oICogMS8zLCBhcmVhLnkrYXJlYS5oICogMi8zKSlcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGJyaWRnZSA9IGFyZWEuYnJpZGdlc1tpXTtcblx0XHRcdHZhciBsaW5lID0gVXRpbC5saW5lKG1pZHBvaW50LCBicmlkZ2UpO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBsaW5lLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIHBvaW50ID0gbGluZVtqXTtcblx0XHRcdFx0dmFyIGN1cnJlbnRDZWxsID0gbGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV07XG5cdFx0XHRcdGlmIChhcmVhLmNhdmVyblR5cGUgPT0gJ3JvY2t5Jylcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9IGFyZWEuZmxvb3I7XG5cdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnRDZWxsID09ICd3YXRlcicgfHwgY3VycmVudENlbGwgPT0gJ2xhdmEnKXtcblx0XHRcdFx0XHRpZiAoYXJlYS5mbG9vciAhPSAnZmFrZVdhdGVyJyAmJiBhcmVhLmNhdmVyblR5cGUgPT0gJ2JyaWRnZXMnKVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSAnYnJpZGdlJztcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9ICdmYWtlV2F0ZXInO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gYXJlYS5mbG9vcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBTY3JhdGNoIHRoZSBhcmVhXG5cdFx0dmFyIHNjcmF0Y2hlcyA9IFV0aWwucmFuZCgyLDQpO1xuXHRcdHZhciBjYXZlU2VnbWVudHMgPSBbXTtcblx0XHRjYXZlU2VnbWVudHMucHVzaChtaWRwb2ludCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY3JhdGNoZXM7IGkrKyl7XG5cdFx0XHR2YXIgcDEgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihjYXZlU2VnbWVudHMpO1xuXHRcdFx0aWYgKGNhdmVTZWdtZW50cy5sZW5ndGggPiAxKVxuXHRcdFx0XHRVdGlsLnJlbW92ZUZyb21BcnJheShjYXZlU2VnbWVudHMsIHAxKTtcblx0XHRcdHZhciBwMiA9IHtcblx0XHRcdFx0eDogVXRpbC5yYW5kKGFyZWEueCwgYXJlYS54K2FyZWEudy0xKSxcblx0XHRcdFx0eTogVXRpbC5yYW5kKGFyZWEueSwgYXJlYS55K2FyZWEuaC0xKVxuXHRcdFx0fVxuXHRcdFx0Y2F2ZVNlZ21lbnRzLnB1c2gocDIpO1xuXHRcdFx0dmFyIGxpbmUgPSBVdGlsLmxpbmUocDIsIHAxKTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbGluZS5sZW5ndGg7IGorKyl7XG5cdFx0XHRcdHZhciBwb2ludCA9IGxpbmVbal07XG5cdFx0XHRcdHZhciBjdXJyZW50Q2VsbCA9IGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldO1xuXHRcdFx0XHRpZiAoY3VycmVudENlbGwgIT0gJ3dhdGVyJykgIFxuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gYXJlYS5mbG9vcjtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGZpbGxXaXRoUm9vbXM6IGZ1bmN0aW9uKGxldmVsLCBhcmVhKXtcblx0XHR2YXIgYmlnQXJlYSA9IHtcblx0XHRcdHg6IGFyZWEueCxcblx0XHRcdHk6IGFyZWEueSxcblx0XHRcdHc6IGFyZWEudyxcblx0XHRcdGg6IGFyZWEuaFxuXHRcdH1cblx0XHR2YXIgbWF4RGVwdGggPSAyO1xuXHRcdHZhciBNSU5fV0lEVEggPSA2O1xuXHRcdHZhciBNSU5fSEVJR0hUID0gNjtcblx0XHR2YXIgTUFYX1dJRFRIID0gMTA7XG5cdFx0dmFyIE1BWF9IRUlHSFQgPSAxMDtcblx0XHR2YXIgU0xJQ0VfUkFOR0VfU1RBUlQgPSAzLzg7XG5cdFx0dmFyIFNMSUNFX1JBTkdFX0VORCA9IDUvODtcblx0XHR2YXIgYXJlYXMgPSBTcGxpdHRlci5zdWJkaXZpZGVBcmVhKGJpZ0FyZWEsIG1heERlcHRoLCBNSU5fV0lEVEgsIE1JTl9IRUlHSFQsIE1BWF9XSURUSCwgTUFYX0hFSUdIVCwgU0xJQ0VfUkFOR0VfU1RBUlQsIFNMSUNFX1JBTkdFX0VORCwgYXJlYS5icmlkZ2VzKTtcblx0XHRTcGxpdHRlci5jb25uZWN0QXJlYXMoYXJlYXMsIGFyZWEud2FsbCA/IDIgOiAxKTsgXG5cdFx0dmFyIGJyaWRnZUFyZWFzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgc3ViYXJlYSA9IGFyZWFzW2ldO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2pdO1xuXHRcdFx0XHRpZiAoU3BsaXR0ZXIuZ2V0QXJlYUF0KGJyaWRnZSx7eDowLHk6MH0sIGFyZWFzKSA9PSBzdWJhcmVhKXtcblx0XHRcdFx0XHRpZiAoIVV0aWwuY29udGFpbnMoYnJpZGdlQXJlYXMsIHN1YmFyZWEpKXtcblx0XHRcdFx0XHRcdGJyaWRnZUFyZWFzLnB1c2goc3ViYXJlYSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN1YmFyZWEuYnJpZGdlcy5wdXNoKHtcblx0XHRcdFx0XHRcdHg6IGJyaWRnZS54LFxuXHRcdFx0XHRcdFx0eTogYnJpZGdlLnlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnVzZUFyZWFzKGJyaWRnZUFyZWFzLCBhcmVhcywgYmlnQXJlYSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgc3ViYXJlYSA9IGFyZWFzW2ldO1xuXHRcdFx0aWYgKCFzdWJhcmVhLnJlbmRlcilcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRzdWJhcmVhLmZsb29yID0gYXJlYS5mbG9vcjtcblx0XHRcdHN1YmFyZWEud2FsbCA9IGFyZWEud2FsbDtcblx0XHRcdHN1YmFyZWEuY29ycmlkb3IgPSBhcmVhLmNvcnJpZG9yO1xuXHRcdFx0dGhpcy5jYXJ2ZVJvb21BdChsZXZlbCwgc3ViYXJlYSk7XG5cdFx0fVxuXHR9LFxuXHRjYXJ2ZVJvb21BdDogZnVuY3Rpb24obGV2ZWwsIGFyZWEpe1xuXHRcdHZhciBtaW5ib3ggPSB7XG5cdFx0XHR4OiBhcmVhLnggKyBNYXRoLmZsb29yKGFyZWEudyAvIDIpLTEsXG5cdFx0XHR5OiBhcmVhLnkgKyBNYXRoLmZsb29yKGFyZWEuaCAvIDIpLTEsXG5cdFx0XHR4MjogYXJlYS54ICsgTWF0aC5mbG9vcihhcmVhLncgLyAyKSsxLFxuXHRcdFx0eTI6IGFyZWEueSArIE1hdGguZmxvb3IoYXJlYS5oIC8gMikrMSxcblx0XHR9O1xuXHRcdC8vIFRyYWNlIGNvcnJpZG9ycyBmcm9tIGV4aXRzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGJyaWRnZSA9IGFyZWEuYnJpZGdlc1tpXTtcblx0XHRcdHZhciB2ZXJ0aWNhbEJyaWRnZSA9IGZhbHNlO1xuXHRcdFx0dmFyIGhvcml6b250YWxCcmlkZ2UgPSBmYWxzZTtcblx0XHRcdGlmIChicmlkZ2UueCA9PSBhcmVhLngpe1xuXHRcdFx0XHQvLyBMZWZ0IENvcnJpZG9yXG5cdFx0XHRcdGhvcml6b250YWxCcmlkZ2UgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gYnJpZGdlLng7IGogPCBicmlkZ2UueCArIGFyZWEudyAvIDI7IGorKyl7XG5cdFx0XHRcdFx0aWYgKGFyZWEud2FsbCl7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnktMV0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnktMV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnkrMV0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnkrMV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPT0gJ3dhdGVyJyB8fCBsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPT0gJ2xhdmEnKXsgXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPSAnYnJpZGdlJztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID0gYXJlYS5jb3JyaWRvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChicmlkZ2UueCA9PSBhcmVhLnggKyBhcmVhLncpe1xuXHRcdFx0XHQvLyBSaWdodCBjb3JyaWRvclxuXHRcdFx0XHRob3Jpem9udGFsQnJpZGdlID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IGJyaWRnZS54OyBqID49IGJyaWRnZS54IC0gYXJlYS53IC8gMjsgai0tKXtcblx0XHRcdFx0XHRpZiAoYXJlYS53YWxsKXtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueS0xXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1tqXVticmlkZ2UueS0xXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueSsxXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1tqXVticmlkZ2UueSsxXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPT0gJ3dhdGVyJyB8fCBsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPT0gJ2xhdmEnKXsgXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPSAnYnJpZGdlJztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID0gYXJlYS5jb3JyaWRvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYnJpZGdlLnkgPT0gYXJlYS55KXtcblx0XHRcdFx0Ly8gVG9wIGNvcnJpZG9yXG5cdFx0XHRcdHZlcnRpY2FsQnJpZGdlID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IGJyaWRnZS55OyBqIDwgYnJpZGdlLnkgKyBhcmVhLmggLyAyOyBqKyspe1xuXHRcdFx0XHRcdGlmIChhcmVhLndhbGwpe1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54LTFdW2pdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2JyaWRnZS54LTFdW2pdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54KzFdW2pdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2JyaWRnZS54KzFdW2pdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9PSAnd2F0ZXInIHx8IGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9PSAnbGF2YScpeyBcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9ICdicmlkZ2UnO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPSBhcmVhLmNvcnJpZG9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRG93biBDb3JyaWRvclxuXHRcdFx0XHR2ZXJ0aWNhbEJyaWRnZSA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGogPSBicmlkZ2UueTsgaiA+PSBicmlkZ2UueSAtIGFyZWEuaCAvIDI7IGotLSl7XG5cdFx0XHRcdFx0aWYgKGFyZWEud2FsbCl7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLngtMV1bal0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbYnJpZGdlLngtMV1bal0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLngrMV1bal0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbYnJpZGdlLngrMV1bal0gPSBhcmVhLndhbGw7IFxuXHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9PSAnd2F0ZXInIHx8IGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9PSAnbGF2YScpeyBcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9ICdicmlkZ2UnO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPSBhcmVhLmNvcnJpZG9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHZlcnRpY2FsQnJpZGdlKXtcblx0XHRcdFx0aWYgKGJyaWRnZS54IDwgbWluYm94LngpXG5cdFx0XHRcdFx0bWluYm94LnggPSBicmlkZ2UueDtcblx0XHRcdFx0aWYgKGJyaWRnZS54ID4gbWluYm94LngyKVxuXHRcdFx0XHRcdG1pbmJveC54MiA9IGJyaWRnZS54O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGhvcml6b250YWxCcmlkZ2Upe1xuXHRcdFx0XHRpZiAoYnJpZGdlLnkgPCBtaW5ib3gueSlcblx0XHRcdFx0XHRtaW5ib3gueSA9IGJyaWRnZS55O1xuXHRcdFx0XHRpZiAoYnJpZGdlLnkgPiBtaW5ib3gueTIpXG5cdFx0XHRcdFx0bWluYm94LnkyID0gYnJpZGdlLnk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciBtaW5QYWRkaW5nID0gMDtcblx0XHRpZiAoYXJlYS53YWxsKVxuXHRcdFx0bWluUGFkZGluZyA9IDE7XG5cdFx0dmFyIHBhZGRpbmcgPSB7XG5cdFx0XHR0b3A6IFV0aWwucmFuZChtaW5QYWRkaW5nLCBtaW5ib3gueSAtIGFyZWEueSAtIG1pblBhZGRpbmcpLFxuXHRcdFx0Ym90dG9tOiBVdGlsLnJhbmQobWluUGFkZGluZywgYXJlYS55ICsgYXJlYS5oIC0gbWluYm94LnkyIC0gbWluUGFkZGluZyksXG5cdFx0XHRsZWZ0OiBVdGlsLnJhbmQobWluUGFkZGluZywgbWluYm94LnggLSBhcmVhLnggLSBtaW5QYWRkaW5nKSxcblx0XHRcdHJpZ2h0OiBVdGlsLnJhbmQobWluUGFkZGluZywgYXJlYS54ICsgYXJlYS53IC0gbWluYm94LngyIC0gbWluUGFkZGluZylcblx0XHR9O1xuXHRcdGlmIChwYWRkaW5nLnRvcCA8IDApIHBhZGRpbmcudG9wID0gMDtcblx0XHRpZiAocGFkZGluZy5ib3R0b20gPCAwKSBwYWRkaW5nLmJvdHRvbSA9IDA7XG5cdFx0aWYgKHBhZGRpbmcubGVmdCA8IDApIHBhZGRpbmcubGVmdCA9IDA7XG5cdFx0aWYgKHBhZGRpbmcucmlnaHQgPCAwKSBwYWRkaW5nLnJpZ2h0ID0gMDtcblx0XHR2YXIgcm9vbXggPSBhcmVhLng7XG5cdFx0dmFyIHJvb215ID0gYXJlYS55O1xuXHRcdHZhciByb29tdyA9IGFyZWEudztcblx0XHR2YXIgcm9vbWggPSBhcmVhLmg7XG5cdFx0Zm9yICh2YXIgeCA9IHJvb214OyB4IDwgcm9vbXggKyByb29tdzsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSByb29teTsgeSA8IHJvb215ICsgcm9vbWg7IHkrKyl7XG5cdFx0XHRcdHZhciBkcmF3V2FsbCA9IGFyZWEud2FsbCAmJiBsZXZlbC5jZWxsc1t4XVt5XSAhPSBhcmVhLmNvcnJpZG9yICYmIGxldmVsLmNlbGxzW3hdW3ldICE9ICdicmlkZ2UnOyBcblx0XHRcdFx0aWYgKHkgPCByb29teSArIHBhZGRpbmcudG9wKXtcblx0XHRcdFx0XHRpZiAoZHJhd1dhbGwgJiYgeSA9PSByb29teSArIHBhZGRpbmcudG9wIC0gMSAmJiB4ICsgMSA+PSByb29teCArIHBhZGRpbmcubGVmdCAmJiB4IDw9IHJvb214ICsgcm9vbXcgLSBwYWRkaW5nLnJpZ2h0KVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeCA8IHJvb214ICsgcGFkZGluZy5sZWZ0KXtcblx0XHRcdFx0XHRpZiAoZHJhd1dhbGwgJiYgeCA9PSByb29teCArIHBhZGRpbmcubGVmdCAtIDEgJiYgeSA+PSByb29teSArIHBhZGRpbmcudG9wICYmIHkgPD0gcm9vbXkgKyByb29taCAtIHBhZGRpbmcuYm90dG9tKVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeSA+IHJvb215ICsgcm9vbWggLSAxIC0gcGFkZGluZy5ib3R0b20pe1xuXHRcdFx0XHRcdGlmIChkcmF3V2FsbCAmJiB5ID09IHJvb215ICsgcm9vbWggLSBwYWRkaW5nLmJvdHRvbSAmJiB4ICsgMSA+PSByb29teCArIHBhZGRpbmcubGVmdCAmJiB4IDw9IHJvb214ICsgcm9vbXcgLSBwYWRkaW5nLnJpZ2h0KVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeCA+IHJvb214ICsgcm9vbXcgLSAxIC0gcGFkZGluZy5yaWdodCl7XG5cdFx0XHRcdFx0aWYgKGRyYXdXYWxsICYmIHggPT0gcm9vbXggKyByb29tdyAtIHBhZGRpbmcucmlnaHQgJiYgeSA+PSByb29teSArIHBhZGRpbmcudG9wICYmIHkgPD0gcm9vbXkgKyByb29taCAtIHBhZGRpbmcuYm90dG9tKVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYXJlYS5tYXJrZWQpXG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSAncGFkZGluZyc7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IGFyZWEuZmxvb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHR9LFxuXHR1c2VBcmVhczogZnVuY3Rpb24oa2VlcEFyZWFzLCBhcmVhcywgYmlnQXJlYSl7XG5cdFx0Ly8gQWxsIGtlZXAgYXJlYXMgc2hvdWxkIGJlIGNvbm5lY3RlZCB3aXRoIGEgc2luZ2xlIHBpdm90IGFyZWFcblx0XHR2YXIgcGl2b3RBcmVhID0gU3BsaXR0ZXIuZ2V0QXJlYUF0KHt4OiBNYXRoLnJvdW5kKGJpZ0FyZWEueCArIGJpZ0FyZWEudy8yKSwgeTogTWF0aC5yb3VuZChiaWdBcmVhLnkgKyBiaWdBcmVhLmgvMil9LHt4OjAseTowfSwgYXJlYXMpO1xuXHRcdHZhciBwYXRoQXJlYXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtlZXBBcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIga2VlcEFyZWEgPSBrZWVwQXJlYXNbaV07XG5cdFx0XHRrZWVwQXJlYS5yZW5kZXIgPSB0cnVlO1xuXHRcdFx0dmFyIGFyZWFzUGF0aCA9IHRoaXMuZ2V0RHJ1bmtlbkFyZWFzUGF0aChrZWVwQXJlYSwgcGl2b3RBcmVhLCBhcmVhcyk7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGFyZWFzUGF0aC5sZW5ndGg7IGorKyl7XG5cdFx0XHRcdGFyZWFzUGF0aFtqXS5yZW5kZXIgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gYXJlYXNbaV07XG5cdFx0XHRpZiAoIWFyZWEucmVuZGVyKXtcblx0XHRcdFx0YnJpZGdlc1JlbW92ZTogZm9yICh2YXIgaiA9IDA7IGogPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHRcdHZhciBicmlkZ2UgPSBhcmVhLmJyaWRnZXNbal07XG5cdFx0XHRcdFx0aWYgKCFicmlkZ2UudG8pXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IGJyaWRnZS50by5icmlkZ2VzLmxlbmd0aDsgaysrKXtcblx0XHRcdFx0XHRcdHZhciBzb3VyY2VCcmlkZ2UgPSBicmlkZ2UudG8uYnJpZGdlc1trXTtcblx0XHRcdFx0XHRcdGlmIChzb3VyY2VCcmlkZ2UueCA9PSBicmlkZ2UueCAmJiBzb3VyY2VCcmlkZ2UueSA9PSBicmlkZ2UueSl7XG5cdFx0XHRcdFx0XHRcdFV0aWwucmVtb3ZlRnJvbUFycmF5KGJyaWRnZS50by5icmlkZ2VzLCBzb3VyY2VCcmlkZ2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Z2V0RHJ1bmtlbkFyZWFzUGF0aDogZnVuY3Rpb24gKGZyb21BcmVhLCB0b0FyZWEsIGFyZWFzKXtcblx0XHR2YXIgY3VycmVudEFyZWEgPSBmcm9tQXJlYTtcblx0XHR2YXIgcGF0aCA9IFtdO1xuXHRcdHBhdGgucHVzaChmcm9tQXJlYSk7XG5cdFx0cGF0aC5wdXNoKHRvQXJlYSk7XG5cdFx0aWYgKGZyb21BcmVhID09IHRvQXJlYSlcblx0XHRcdHJldHVybiBwYXRoO1xuXHRcdHdoaWxlICh0cnVlKXtcblx0XHRcdHZhciByYW5kb21CcmlkZ2UgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihjdXJyZW50QXJlYS5icmlkZ2VzKTtcblx0XHRcdGlmICghcmFuZG9tQnJpZGdlLnRvKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdGlmICghVXRpbC5jb250YWlucyhwYXRoLCByYW5kb21CcmlkZ2UudG8pKXtcblx0XHRcdFx0cGF0aC5wdXNoKHJhbmRvbUJyaWRnZS50byk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmFuZG9tQnJpZGdlLnRvID09IHRvQXJlYSlcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjdXJyZW50QXJlYSA9IHJhbmRvbUJyaWRnZS50bztcblx0XHR9XG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblx0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGhpcmRMZXZlbEdlbmVyYXRvcjsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0cmFuZDogZnVuY3Rpb24gKGxvdywgaGkpe1xuXHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaGkgLSBsb3cgKyAxKSkrbG93O1xuXHR9LFxuXHRyYW5kb21FbGVtZW50T2Y6IGZ1bmN0aW9uIChhcnJheSl7XG5cdFx0cmV0dXJuIGFycmF5W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSphcnJheS5sZW5ndGgpXTtcblx0fSxcblx0ZGlzdGFuY2U6IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xuXHRcdHJldHVybiBNYXRoLnNxcnQoKHgyLXgxKSooeDIteDEpICsgKHkyLXkxKSooeTIteTEpKTtcblx0fSxcblx0ZmxhdERpc3RhbmNlOiBmdW5jdGlvbih4MSwgeTEsIHgyLCB5Mil7XG5cdFx0dmFyIHhEaXN0ID0gTWF0aC5hYnMoeDEgLSB4Mik7XG5cdFx0dmFyIHlEaXN0ID0gTWF0aC5hYnMoeTEgLSB5Mik7XG5cdFx0aWYgKHhEaXN0ID09PSB5RGlzdClcblx0XHRcdHJldHVybiB4RGlzdDtcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4geERpc3QgKyB5RGlzdDtcblx0fSxcblx0bGluZURpc3RhbmNlOiBmdW5jdGlvbihwb2ludDEsIHBvaW50Mil7XG5cdCAgdmFyIHhzID0gMDtcblx0ICB2YXIgeXMgPSAwO1xuXHQgIHhzID0gcG9pbnQyLnggLSBwb2ludDEueDtcblx0ICB4cyA9IHhzICogeHM7XG5cdCAgeXMgPSBwb2ludDIueSAtIHBvaW50MS55O1xuXHQgIHlzID0geXMgKiB5cztcblx0ICByZXR1cm4gTWF0aC5zcXJ0KCB4cyArIHlzICk7XG5cdH0sXG5cdGRpcmVjdGlvbjogZnVuY3Rpb24gKGEsYil7XG5cdFx0cmV0dXJuIHt4OiBzaWduKGIueCAtIGEueCksIHk6IHNpZ24oYi55IC0gYS55KX07XG5cdH0sXG5cdGNoYW5jZTogZnVuY3Rpb24gKGNoYW5jZSl7XG5cdFx0cmV0dXJuIHRoaXMucmFuZCgwLDEwMCkgPD0gY2hhbmNlO1xuXHR9LFxuXHRjb250YWluczogZnVuY3Rpb24oYXJyYXksIGVsZW1lbnQpe1xuXHQgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoZWxlbWVudCkgPiAtMTtcblx0fSxcblx0cmVtb3ZlRnJvbUFycmF5OiBmdW5jdGlvbihhcnJheSwgb2JqZWN0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XG5cdFx0XHRpZiAoYXJyYXlbaV0gPT0gb2JqZWN0KXtcblx0XHRcdFx0dGhpcy5yZW1vdmVGcm9tQXJyYXlJbmRleChhcnJheSwgaSxpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlRnJvbUFycmF5SW5kZXg6IGZ1bmN0aW9uKGFycmF5LCBmcm9tLCB0bykge1xuXHRcdHZhciByZXN0ID0gYXJyYXkuc2xpY2UoKHRvIHx8IGZyb20pICsgMSB8fCBhcnJheS5sZW5ndGgpO1xuXHRcdGFycmF5Lmxlbmd0aCA9IGZyb20gPCAwID8gYXJyYXkubGVuZ3RoICsgZnJvbSA6IGZyb207XG5cdFx0cmV0dXJuIGFycmF5LnB1c2guYXBwbHkoYXJyYXksIHJlc3QpO1xuXHR9LFxuXHRsaW5lOiBmdW5jdGlvbiAoYSwgYil7XG5cdFx0dmFyIGNvb3JkaW5hdGVzQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHR2YXIgeDEgPSBhLng7XG5cdFx0dmFyIHkxID0gYS55O1xuXHRcdHZhciB4MiA9IGIueDtcblx0XHR2YXIgeTIgPSBiLnk7XG5cdCAgICB2YXIgZHggPSBNYXRoLmFicyh4MiAtIHgxKTtcblx0ICAgIHZhciBkeSA9IE1hdGguYWJzKHkyIC0geTEpO1xuXHQgICAgdmFyIHN4ID0gKHgxIDwgeDIpID8gMSA6IC0xO1xuXHQgICAgdmFyIHN5ID0gKHkxIDwgeTIpID8gMSA6IC0xO1xuXHQgICAgdmFyIGVyciA9IGR4IC0gZHk7XG5cdCAgICBjb29yZGluYXRlc0FycmF5LnB1c2goe3g6IHgxLCB5OiB5MX0pO1xuXHQgICAgd2hpbGUgKCEoKHgxID09IHgyKSAmJiAoeTEgPT0geTIpKSkge1xuXHQgICAgXHR2YXIgZTIgPSBlcnIgPDwgMTtcblx0ICAgIFx0aWYgKGUyID4gLWR5KSB7XG5cdCAgICBcdFx0ZXJyIC09IGR5O1xuXHQgICAgXHRcdHgxICs9IHN4O1xuXHQgICAgXHR9XG5cdCAgICBcdGlmIChlMiA8IGR4KSB7XG5cdCAgICBcdFx0ZXJyICs9IGR4O1xuXHQgICAgXHRcdHkxICs9IHN5O1xuXHQgICAgXHR9XG5cdCAgICBcdGNvb3JkaW5hdGVzQXJyYXkucHVzaCh7eDogeDEsIHk6IHkxfSk7XG5cdCAgICB9XG5cdCAgICByZXR1cm4gY29vcmRpbmF0ZXNBcnJheTtcblx0fVxufSIsImZ1bmN0aW9uIFZlaW5HZW5lcmF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xudmFyIExldmVsID0gcmVxdWlyZSgnLi9MZXZlbC5jbGFzcycpO1xudmFyIENBID0gcmVxdWlyZSgnLi9DQScpO1xuXG5WZWluR2VuZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0dHJhY2VWZWluczogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCl7XG5cdFx0dmFyIHZlaW5NYXAgPSB0aGlzLmNyZWF0ZVZlaW5NYXAoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5zZWVkVmVpbnModmVpbk1hcCk7XG5cdFx0dmVpbk1hcCA9IHRoaXMuZ3Jvd1ZlaW5zKHZlaW5NYXApO1xuXHRcdHRoaXMuYXBwbHlWZWlucyhsZXZlbCwgdmVpbk1hcCk7XG5cdH0sXG5cdGNyZWF0ZVZlaW5NYXA6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdHZhciByZXQgPSBbXTtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IGxldmVsLmNlbGxzLmxlbmd0aDsgeCsrKXtcblx0XHRcdHJldFt4XSA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBsZXZlbC5jZWxsc1t4XS5sZW5ndGg7IHkrKyl7XG5cdFx0XHRcdHJldFt4XVt5XSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdHNlZWRWZWluczogZnVuY3Rpb24odmVpbk1hcCl7XG5cdFx0dmFyIHNlZWRzID0gKHZlaW5NYXAubGVuZ3RoICogdmVpbk1hcFswXS5sZW5ndGgpIC8gMTY7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWVkczsgaSsrKXtcblx0XHRcdHZhciBwb2ludCA9IHtcblx0XHRcdFx0eDogTWF0aC5yb3VuZChVdGlsLnJhbmQoMSwgdmVpbk1hcC5sZW5ndGgtMikpLFxuXHRcdFx0XHR5OiBNYXRoLnJvdW5kKFV0aWwucmFuZCgxLCB2ZWluTWFwWzBdLmxlbmd0aC0yKSlcblx0XHRcdH1cblx0XHRcdHZhciBtaW5lcmFsID0gVXRpbC5yYW5kKDEsMik7XG5cdFx0XHRzd2l0Y2ggKG1pbmVyYWwpe1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR2ZWluTWFwW3BvaW50LnhdW3BvaW50LnldID0gJ2dyYXlSb2NrJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHZlaW5NYXBbcG9pbnQueF1bcG9pbnQueV0gPSAnZGFya1JvY2snO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGdyb3dWZWluczogZnVuY3Rpb24odmVpbk1hcCl7XG5cdFx0dmVpbk1hcCA9IENBLnJ1bkNBKHZlaW5NYXAsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snZ3JheVJvY2snXSA+IDAgJiYgVXRpbC5jaGFuY2UoODApKVxuXHRcdFx0XHRyZXR1cm4gJ2dyYXlSb2NrJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAzLCB0cnVlKTtcblx0XHR2ZWluTWFwID0gQ0EucnVuQ0EodmVpbk1hcCwgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydkYXJrUm9jayddID4gMCAmJiBVdGlsLmNoYW5jZSg4MCkpXG5cdFx0XHRcdHJldHVybiAnZGFya1JvY2snO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDMsIHRydWUpO1xuXHRcdHJldHVybiB2ZWluTWFwO1xuXHR9LFxuXHRhcHBseVZlaW5zOiBmdW5jdGlvbihsZXZlbCwgdmVpbk1hcCl7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBsZXZlbC5jZWxscy5sZW5ndGg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IGxldmVsLmNlbGxzW3hdLmxlbmd0aDsgeSsrKXtcblx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW3hdW3ldID09ICdzb2xpZFJvY2snKXtcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IHZlaW5NYXBbeF1beV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWZWluR2VuZXJhdG9yOyIsIndpbmRvdy5HZW5lcmF0b3IgPSByZXF1aXJlKCcuL0dlbmVyYXRvci5jbGFzcycpO1xud2luZG93LkNhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9DYW52YXNSZW5kZXJlci5jbGFzcycpO1xud2luZG93LktyYW1naW5lRXhwb3J0ZXIgPSByZXF1aXJlKCcuL0tyYW1naW5lRXhwb3J0ZXIuY2xhc3MnKTsiXX0=
