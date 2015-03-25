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
				if (this.uniqueRegistry && this.thresholds[i].item.unique) {
					if (this.uniqueRegistry[this.thresholds[i].item.code]){
						i = 0;
						number = Util.rand(0, this.generationChanceTotal);
						continue
					} else {
						this.uniqueRegistry[this.thresholds[i].item.code] = true;
					}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvQ0EuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9DYW52YXNSZW5kZXJlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0ZpcnN0TGV2ZWxHZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9HZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9JdGVtUG9wdWxhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvS3JhbWdpbmVFeHBvcnRlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0xldmVsLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvTW9uc3RlclBvcHVsYXRvci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL1NlY29uZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvU3BsaXR0ZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9UaGlyZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvVXRpbHMuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9WZWluR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvV2ViVGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdHJ1bkNBOiBmdW5jdGlvbihtYXAsIHRyYW5zZm9ybUZ1bmN0aW9uLCB0aW1lcywgY3Jvc3Mpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGltZXM7IGkrKyl7XG5cdFx0XHR2YXIgbmV3TWFwID0gW107XG5cdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IG1hcC5sZW5ndGg7IHgrKyl7XG5cdFx0XHRcdG5ld01hcFt4XSA9IFtdO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXAubGVuZ3RoOyB4Kyspe1xuXHRcdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IG1hcFt4XS5sZW5ndGg7IHkrKyl7XG5cdFx0XHRcdFx0dmFyIHN1cnJvdW5kaW5nTWFwID0gW107XG5cdFx0XHRcdFx0Zm9yICh2YXIgeHggPSB4LTE7IHh4IDw9IHgrMTsgeHgrKyl7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciB5eSA9IHktMTsgeXkgPD0geSsxOyB5eSsrKXtcblx0XHRcdFx0XHRcdFx0aWYgKGNyb3NzICYmICEoeHggPT0geCB8fCB5eSA9PSB5KSlcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0aWYgKHh4ID4gMCAmJiB4eCA8IG1hcC5sZW5ndGggJiYgeXkgPiAwICYmIHl5IDwgbWFwW3hdLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNlbGwgPSBtYXBbeHhdW3l5XTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoc3Vycm91bmRpbmdNYXBbY2VsbF0pXG5cdFx0XHRcdFx0XHRcdFx0XHRzdXJyb3VuZGluZ01hcFtjZWxsXSsrO1xuXHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHN1cnJvdW5kaW5nTWFwW2NlbGxdID0gMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgbmV3Q2VsbCA9IHRyYW5zZm9ybUZ1bmN0aW9uKG1hcFt4XVt5XSwgc3Vycm91bmRpbmdNYXApO1xuXHRcdFx0XHRcdGlmIChuZXdDZWxsKXtcblx0XHRcdFx0XHRcdG5ld01hcFt4XVt5XSA9IG5ld0NlbGw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5ld01hcFt4XVt5XSA9IG1hcFt4XVt5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1hcCA9IG5ld01hcDtcblx0XHR9XG5cdFx0cmV0dXJuIG1hcDtcblx0fVxufSIsImZ1bmN0aW9uIENhbnZhc1JlbmRlcmVyKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUgPSB7XG5cdGRyYXdTa2V0Y2g6IGZ1bmN0aW9uKGxldmVsLCBjYW52YXMsIG92ZXJsYXkpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0Y29udGV4dC5mb250PVwiMTZweCBBdmF0YXJcIjtcblx0XHRpZiAoIW92ZXJsYXkpXG5cdFx0XHRjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdHZhciB6b29tID0gODtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gbGV2ZWwuYXJlYXNbaV07XG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y29udGV4dC5yZWN0KGFyZWEueCAqIHpvb20sIGFyZWEueSAqIHpvb20sIGFyZWEudyAqIHpvb20sIGFyZWEuaCAqIHpvb20pO1xuXHRcdFx0aWYgKCFvdmVybGF5KXtcblx0XHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSAneWVsbG93Jztcblx0XHRcdFx0Y29udGV4dC5maWxsKCk7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG5cdFx0XHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XG5cdFx0XHR2YXIgYXJlYURlc2NyaXB0aW9uID0gJyc7XG5cdFx0XHRpZiAoYXJlYS5hcmVhVHlwZSA9PSAncm9vbXMnKXtcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uID0gXCJEdW5nZW9uXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFyZWEuZmxvb3IgPT0gJ2Zha2VXYXRlcicpeyBcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uID0gXCJMYWdvb25cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFyZWFEZXNjcmlwdGlvbiA9IFwiQ2F2ZXJuXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJlYS5oYXNFeGl0KXtcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uICs9IFwiIChkKVwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZWEuaGFzRW50cmFuY2Upe1xuXHRcdFx0XHRhcmVhRGVzY3JpcHRpb24gKz0gXCIgKHUpXCI7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG5cdFx0XHRjb250ZXh0LmZpbGxUZXh0KGFyZWFEZXNjcmlwdGlvbiwoYXJlYS54KSogem9vbSArIDUsKGFyZWEueSApKiB6b29tICsgMjApO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2pdO1xuXHRcdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRjb250ZXh0LnJlY3QoKGJyaWRnZS54KSAqIHpvb20gLyotIHpvb20gLyAyKi8sIChicmlkZ2UueSkgKiB6b29tIC8qLSB6b29tIC8gMiovLCB6b29tLCB6b29tKTtcblx0XHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSAyO1xuXHRcdFx0XHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG5cdFx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRkcmF3TGV2ZWw6IGZ1bmN0aW9uKGxldmVsLCBjYW52YXMpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0Y29udGV4dC5mb250PVwiMTJweCBHZW9yZ2lhXCI7XG5cdFx0Y29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHR2YXIgem9vbSA9IDg7XG5cdFx0dmFyIGNlbGxzID0gbGV2ZWwuY2VsbHM7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0XHR2YXIgY29sb3IgPSAnI0ZGRkZGRic7XG5cdFx0XHRcdHZhciBjZWxsID0gY2VsbHNbeF1beV07XG5cdFx0XHRcdGlmIChjZWxsID09PSAnd2F0ZXInKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDAwMEZGJztcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09PSAnbGF2YScpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyNGRjAwMDAnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT09ICdmYWtlV2F0ZXInKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDAwMEZGJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzb2xpZFJvY2snKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjNTk0QjJEJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdkYXJrUm9jaycpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyMzMzJiMWEnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2dyYXlSb2NrJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzU5NTk1OSc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnY2F2ZXJuRmxvb3InKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjODc2NDE4Jztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdkb3duc3RhaXJzJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnI0ZGMDAwMCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAndXBzdGFpcnMnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDBGRjAwJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzdG9uZVdhbGwnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjQkJCQkJCJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzdG9uZUZsb29yJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzY2NjY2Nic7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnY29ycmlkb3InKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjRkYwMDAwJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdwYWRkaW5nJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzAwRkYwMCc7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnYnJpZGdlJyl7XG5cdFx0XHRcdFx0Y29sb3IgPSAnIzk0NjgwMCc7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcblx0XHRcdFx0Y29udGV4dC5maWxsUmVjdCh4ICogem9vbSwgeSAqIHpvb20sIHpvb20sIHpvb20pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmVuZW1pZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGVuZW15ID0gbGV2ZWwuZW5lbWllc1tpXTtcblx0XHRcdHZhciBjb2xvciA9ICcjRkZGRkZGJztcblx0XHRcdHN3aXRjaCAoZW5lbXkuY29kZSl7XG5cdFx0XHRjYXNlICdiYXQnOlxuXHRcdFx0XHRjb2xvciA9ICcjRUVFRUVFJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsYXZhTGl6YXJkJzpcblx0XHRcdFx0Y29sb3IgPSAnIzAwRkY4OCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnZGFlbW9uJzpcblx0XHRcdFx0Y29sb3IgPSAnI0ZGODgwMCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcblx0XHRcdGNvbnRleHQuZmlsbFJlY3QoZW5lbXkueCAqIHpvb20sIGVuZW15LnkgKiB6b29tLCB6b29tLCB6b29tKTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5pdGVtcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgaXRlbSA9IGxldmVsLml0ZW1zW2ldO1xuXHRcdFx0dmFyIGNvbG9yID0gJyNGRkZGRkYnO1xuXHRcdFx0c3dpdGNoIChpdGVtLmNvZGUpe1xuXHRcdFx0Y2FzZSAnZGFnZ2VyJzpcblx0XHRcdFx0Y29sb3IgPSAnI0VFRUVFRSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGVhdGhlckFybW9yJzpcblx0XHRcdFx0Y29sb3IgPSAnIzAwRkY4OCc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcblx0XHRcdGNvbnRleHQuZmlsbFJlY3QoaXRlbS54ICogem9vbSwgaXRlbS55ICogem9vbSwgem9vbSwgem9vbSk7XG5cdFx0fVxuXHR9LFxuXHRkcmF3TGV2ZWxXaXRoSWNvbnM6IGZ1bmN0aW9uKGxldmVsLCBjYW52YXMpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0Y29udGV4dC5mb250PVwiMTJweCBHZW9yZ2lhXCI7XG5cdFx0Y29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHR2YXIgem9vbSA9IDg7XG5cdFx0dmFyIHdhdGVyID0gbmV3IEltYWdlKCk7XG5cdFx0d2F0ZXIuc3JjID0gJ2ltZy93YXRlci5wbmcnO1xuXHRcdHZhciBmYWtlV2F0ZXIgPSBuZXcgSW1hZ2UoKTtcblx0XHRmYWtlV2F0ZXIuc3JjID0gJ2ltZy93YXRlci5wbmcnO1xuXHRcdHZhciBzb2xpZFJvY2sgPSBuZXcgSW1hZ2UoKTtcblx0XHRzb2xpZFJvY2suc3JjID0gJ2ltZy9zb2xpZFJvY2sucG5nJztcblx0XHR2YXIgY2F2ZXJuRmxvb3IgPSBuZXcgSW1hZ2UoKTtcblx0XHRjYXZlcm5GbG9vci5zcmMgPSAnaW1nL2NhdmVybkZsb29yLnBuZyc7XG5cdFx0dmFyIGRvd25zdGFpcnMgPSBuZXcgSW1hZ2UoKTtcblx0XHRkb3duc3RhaXJzLnNyYyA9ICdpbWcvZG93bnN0YWlycy5wbmcnO1xuXHRcdHZhciB1cHN0YWlycyA9IG5ldyBJbWFnZSgpO1xuXHRcdHVwc3RhaXJzLnNyYyA9ICdpbWcvdXBzdGFpcnMucG5nJztcblx0XHR2YXIgc3RvbmVXYWxsID0gbmV3IEltYWdlKCk7XG5cdFx0c3RvbmVXYWxsLnNyYyA9ICdpbWcvc3RvbmVXYWxsLnBuZyc7XG5cdFx0dmFyIHN0b25lRmxvb3IgPSBuZXcgSW1hZ2UoKTtcblx0XHRzdG9uZUZsb29yLnNyYyA9ICdpbWcvc3RvbmVGbG9vci5wbmcnO1xuXHRcdHZhciBicmlkZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHRicmlkZ2Uuc3JjID0gJ2ltZy9icmlkZ2UucG5nJztcblx0XHR2YXIgbGF2YSA9IG5ldyBJbWFnZSgpO1xuXHRcdGxhdmEuc3JjID0gJ2ltZy9sYXZhLnBuZyc7XG5cdFx0dmFyIGJhdCA9IG5ldyBJbWFnZSgpO1xuXHRcdGJhdC5zcmMgPSAnaW1nL2JhdC5wbmcnO1xuXHRcdHZhciBsYXZhTGl6YXJkID0gbmV3IEltYWdlKCk7XG5cdFx0bGF2YUxpemFyZC5zcmMgPSAnaW1nL2xhdmFMaXphcmQucG5nJztcblx0XHR2YXIgZGFlbW9uID0gbmV3IEltYWdlKCk7XG5cdFx0ZGFlbW9uLnNyYyA9ICdpbWcvZGFlbW9uLnBuZyc7XG5cdFx0dmFyIHRyZWFzdXJlID0gbmV3IEltYWdlKCk7XG5cdFx0dHJlYXN1cmUuc3JjID0gJ2ltZy90cmVhc3VyZS5wbmcnO1xuXHRcdHZhciB0aWxlcyA9IHtcblx0XHRcdHdhdGVyOiB3YXRlcixcblx0XHRcdGZha2VXYXRlcjogZmFrZVdhdGVyLFxuXHRcdFx0c29saWRSb2NrOiBzb2xpZFJvY2ssXG5cdFx0XHRjYXZlcm5GbG9vcjogY2F2ZXJuRmxvb3IsXG5cdFx0XHRkb3duc3RhaXJzOiBkb3duc3RhaXJzLFxuXHRcdFx0dXBzdGFpcnM6IHVwc3RhaXJzLFxuXHRcdFx0c3RvbmVXYWxsOiBzdG9uZVdhbGwsXG5cdFx0XHRzdG9uZUZsb29yOiBzdG9uZUZsb29yLFxuXHRcdFx0YnJpZGdlOiBicmlkZ2UsXG5cdFx0XHRsYXZhOiBsYXZhLFxuXHRcdFx0YmF0OiBiYXQsXG5cdFx0XHRsYXZhTGl6YXJkOiBsYXZhTGl6YXJkLFxuXHRcdFx0ZGFlbW9uOiBkYWVtb24sXG5cdFx0XHR0cmVhc3VyZTogdHJlYXN1cmVcblx0XHR9XG5cdCAgICB2YXIgY2VsbHMgPSBsZXZlbC5jZWxscztcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQ7IHkrKyl7XG5cdFx0XHRcdHZhciBjZWxsID0gY2VsbHNbeF1beV07IFxuXHRcdFx0XHRjb250ZXh0LmRyYXdJbWFnZSh0aWxlc1tjZWxsXSwgeCAqIDE2LCB5ICogMTYpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmVuZW1pZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGVuZW15ID0gbGV2ZWwuZW5lbWllc1tpXTtcblx0XHRcdGNvbnRleHQuZHJhd0ltYWdlKHRpbGVzW2VuZW15LmNvZGVdLCBlbmVteS54ICogMTYsIGVuZW15LnkgKiAxNik7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuaXRlbXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGl0ZW0gPSBsZXZlbC5pdGVtc1tpXTtcblx0XHRcdGNvbnRleHQuZHJhd0ltYWdlKHRpbGVzWyd0cmVhc3VyZSddLCBpdGVtLnggKiAxNiwgaXRlbS55ICogMTYpO1xuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1JlbmRlcmVyOyIsImZ1bmN0aW9uIEZpcnN0TGV2ZWxHZW5lcmF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xudmFyIFNwbGl0dGVyID0gcmVxdWlyZSgnLi9TcGxpdHRlcicpO1xuXG5GaXJzdExldmVsR2VuZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0TEFWQV9DSEFOQ0U6ICAgICBbMTAwLCAgMCwgMjAsICAwLDEwMCwgMTAsIDUwLDEwMF0sXG5cdFdBVEVSX0NIQU5DRTogICAgWyAgMCwxMDAsIDEwLDEwMCwgIDAsIDUwLCAgMCwgIDBdLFxuXHRDQVZFUk5fQ0hBTkNFOiAgIFsgODAsIDgwLCAyMCwgMjAsIDYwLCA5MCwgMTAsIDUwXSxcblx0TEFHT09OX0NIQU5DRTogICBbICAwLCAxMCwgMTAsIDIwLCAgMCwgMzAsICAwLCAgMF0sXG5cdFdBTExMRVNTX0NIQU5DRTogWyA1MCwgMTAsIDgwLCA5MCwgMTAsIDkwLCAxMCwgNTBdLFxuXHRIRUlHSFQ6ICAgICAgICAgIFsgIDEsICAyLCAgMSwgIDEsICAxLCAgMiwgIDIsICAzXSxcblx0VkVSTUlOOiBbXG5cdCAgICAgICAgIFsnc3BpZGVyJywgJ3JhdCddLFxuXHQgICAgICAgICBbJ2JhdCcsICdyYXQnXSxcblx0ICAgICAgICAgWydzcGlkZXInXSxcblx0ICAgICAgICAgWydiYXQnXSxcblx0ICAgICAgICAgWydtb25nYmF0J10sXG5cdCAgICAgICAgIFsnaGVhZGxlc3MnXSxcblx0ICAgICAgICAgWydoZWFkbGVzcycsICdtb25nYmF0J10sXG5cdCAgICAgICAgIFsnaGVhZGxlc3MnLCAnc2tlbGV0b24nXVxuXHQgICAgICAgIF0sXG4gICAgT0JKRUNUUzogWydvcmInLCAnZGVhZFRyZWUnLCAndHJlZScsICdzdGF0dWUnLCAnc2lnblBvc3QnLCAnd2VsbCcsICdzbWFsbFNpZ24nLCAnbGFtcCcsICdmbGFtZScsICdjYW1wZmlyZScsICdhbHRhcicsICdwcmlzb25lclRoaW5nJywgJ2ZvdW50YWluJ10sXG5cdEdBTkdTOiBbXG5cdFx0WyAvLyBMZXZlbCAxXG5cdFx0XHR7Ym9zczogJ2RhZW1vbicsIG1pbmlvbnM6IFsnbW9uZ2JhdCddLCBxdWFudGl0eTogMn0sXG5cdFx0XHR7bWluaW9uczogWydtb25nYmF0J10sIHF1YW50aXR5OiAyfSxcblx0XHRcdHttaW5pb25zOiBbJ2xhdmFMaXphcmQnXSwgcXVhbnRpdHk6IDJ9LFxuXHRcdFx0e2Jvc3M6ICdoeWRyYScsIG1pbmlvbnM6IFsnbW9uZ2JhdCddLCBxdWFudGl0eTogMn1cblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgMlxuXHRcdFx0e2Jvc3M6ICdkYWVtb24nLCBtaW5pb25zOiBbJ3NlYVNlcnBlbnQnLCAnb2N0b3B1cyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2h5ZHJhJywgbWluaW9uczogWydzZWFTZXJwZW50JywgJ29jdG9wdXMnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ3NlYVNlcnBlbnQnLCAnb2N0b3B1cyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWydzZWFTZXJwZW50J10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ29jdG9wdXMnXSwgcXVhbnRpdHk6IDN9XG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDNcblx0XHRcdHttaW5pb25zOiBbJ2RhZW1vbiddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnZGFlbW9uJ10sIHF1YW50aXR5OiAyfVxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCA0XG5cdFx0XHR7Ym9zczogJ2dhemVyJywgbWluaW9uczogWydoZWFkbGVzcyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2xpY2hlJywgbWluaW9uczogWydnaG9zdCddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2RhZW1vbicsIG1pbmlvbnM6IFsnZ2F6ZXInLCAnZ3JlbWxpbiddLCBxdWFudGl0eTogM30sXG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDVcblx0XHRcdHttaW5pb25zOiBbJ2RyYWdvbicsICd6b3JuJywgJ2JhbHJvbiddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWydyZWFwZXInLCAnZ2F6ZXInXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ2hlYWRsZXNzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnem9ybicsIG1pbmlvbnM6IFsnaGVhZGxlc3MnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsnZHJhZ29uJywgJ2xhdmFMaXphcmQnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCA2XG5cdFx0XHR7bWluaW9uczogWydyZWFwZXInXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ2RhZW1vbiddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7YXJlYVR5cGU6ICdjYXZlJywgbWluaW9uczogWydiYXQnXSwgcXVhbnRpdHk6IDV9LFxuXHRcdFx0e2FyZWFUeXBlOiAnY2F2ZScsIG1pbmlvbnM6IFsnc2VhU2VycGVudCddLCBxdWFudGl0eTogNX0sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnaHlkcmEnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ2V2aWxNYWdlJ10sIHF1YW50aXR5OiAzfVxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCA3XG5cdFx0XHR7bWluaW9uczogWydoZWFkbGVzcyddLCBxdWFudGl0eTogOH0sXG5cdFx0XHR7bWluaW9uczogWydoeWRyYSddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWydza2VsZXRvbicsICd3aXNwJywgJ2dob3N0J10sIHF1YW50aXR5OiA2fSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydza2VsZXRvbiddLCBxdWFudGl0eTogMTB9XG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDhcblx0XHRcdHttaW5pb25zOiBbJ2RyYWdvbicsICdkYWVtb24nLCAnYmFscm9uJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ3dhcnJpb3InLCAnbWFnZScsICdiYXJkJywgJ2RydWlkJywgJ3RpbmtlcicsICdwYWxhZGluJywgJ3NoZXBoZXJkJywgJ3JhbmdlciddLCBxdWFudGl0eTogNH0sXG5cdFx0XHR7bWluaW9uczogWydnYXplcicsICdiYWxyb24nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICdsaWNoZScsIG1pbmlvbnM6IFsnc2tlbGV0b24nXSwgcXVhbnRpdHk6IDR9LFxuXHRcdFx0e21pbmlvbnM6IFsnZ2hvc3QnLCAnd2lzcCddLCBxdWFudGl0eTogNH0sXG5cdFx0XHR7bWluaW9uczogWydsYXZhTGl6YXJkJ10sIHF1YW50aXR5OiA1fVxuXHRcdF1cdFx0XG5cdF0sXG5cdENBVkVSTl9XQUxMUzogMSxcblx0Q0FWRVJOX0ZMT09SUzogNCxcblx0U1RPTkVfV0FMTFM6IDYsXG5cdFNUT05FX0ZMT09SUzogMyxcblx0Z2VuZXJhdGVMZXZlbDogZnVuY3Rpb24oZGVwdGgpe1xuXHRcdHZhciBoYXNSaXZlciA9IFV0aWwuY2hhbmNlKHRoaXMuV0FURVJfQ0hBTkNFW2RlcHRoLTFdKTtcblx0XHR2YXIgaGFzTGF2YSA9IFV0aWwuY2hhbmNlKHRoaXMuTEFWQV9DSEFOQ0VbZGVwdGgtMV0pO1xuXHRcdHZhciBtYWluRW50cmFuY2UgPSBkZXB0aCA9PSAxO1xuXHRcdHZhciBhcmVhcyA9IHRoaXMuZ2VuZXJhdGVBcmVhcyhkZXB0aCwgaGFzTGF2YSk7XG5cdFx0dGhpcy5wbGFjZUV4aXRzKGFyZWFzKTtcblx0XHR2YXIgbGV2ZWwgPSB7XG5cdFx0XHRoYXNSaXZlcnM6IGhhc1JpdmVyLFxuXHRcdFx0aGFzTGF2YTogaGFzTGF2YSxcblx0XHRcdG1haW5FbnRyYW5jZTogbWFpbkVudHJhbmNlLFxuXHRcdFx0c3RyYXRhOiAnc29saWRSb2NrJyxcblx0XHRcdGFyZWFzOiBhcmVhcyxcblx0XHRcdGRlcHRoOiBkZXB0aCxcblx0XHRcdGNlaWxpbmdIZWlnaHQ6IHRoaXMuSEVJR0hUW2RlcHRoLTFdLFxuXHRcdFx0dmVybWluOiB0aGlzLlZFUk1JTltkZXB0aC0xXVxuXHRcdH0gXG5cdFx0cmV0dXJuIGxldmVsO1xuXHR9LFxuXHRnZW5lcmF0ZUFyZWFzOiBmdW5jdGlvbihkZXB0aCwgaGFzTGF2YSl7XG5cdFx0dmFyIGJpZ0FyZWEgPSB7XG5cdFx0XHR4OiAwLFxuXHRcdFx0eTogMCxcblx0XHRcdHc6IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRILFxuXHRcdFx0aDogdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUXG5cdFx0fVxuXHRcdHZhciBtYXhEZXB0aCA9IHRoaXMuY29uZmlnLlNVQkRJVklTSU9OX0RFUFRIO1xuXHRcdHZhciBNSU5fV0lEVEggPSB0aGlzLmNvbmZpZy5NSU5fV0lEVEg7XG5cdFx0dmFyIE1JTl9IRUlHSFQgPSB0aGlzLmNvbmZpZy5NSU5fSEVJR0hUO1xuXHRcdHZhciBNQVhfV0lEVEggPSB0aGlzLmNvbmZpZy5NQVhfV0lEVEg7XG5cdFx0dmFyIE1BWF9IRUlHSFQgPSB0aGlzLmNvbmZpZy5NQVhfSEVJR0hUO1xuXHRcdHZhciBTTElDRV9SQU5HRV9TVEFSVCA9IHRoaXMuY29uZmlnLlNMSUNFX1JBTkdFX1NUQVJUO1xuXHRcdHZhciBTTElDRV9SQU5HRV9FTkQgPSB0aGlzLmNvbmZpZy5TTElDRV9SQU5HRV9FTkQ7XG5cdFx0dmFyIGFyZWFzID0gU3BsaXR0ZXIuc3ViZGl2aWRlQXJlYShiaWdBcmVhLCBtYXhEZXB0aCwgTUlOX1dJRFRILCBNSU5fSEVJR0hULCBNQVhfV0lEVEgsIE1BWF9IRUlHSFQsIFNMSUNFX1JBTkdFX1NUQVJULCBTTElDRV9SQU5HRV9FTkQpO1xuXHRcdFNwbGl0dGVyLmNvbm5lY3RBcmVhcyhhcmVhcywzKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gYXJlYXNbaV07XG5cdFx0XHR0aGlzLnNldEFyZWFEZXRhaWxzKGFyZWEsIGRlcHRoLCBoYXNMYXZhKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFyZWFzO1xuXHR9LFxuXHRzZXRBcmVhRGV0YWlsczogZnVuY3Rpb24oYXJlYSwgZGVwdGgsIGhhc0xhdmEpe1xuXHRcdGlmIChVdGlsLmNoYW5jZSh0aGlzLkNBVkVSTl9DSEFOQ0VbZGVwdGgtMV0pKXtcblx0XHRcdGFyZWEuYXJlYVR5cGUgPSAnY2F2ZXJuJztcblx0XHRcdGlmIChoYXNMYXZhKXtcblx0XHRcdFx0YXJlYS5mbG9vciA9ICdjYXZlcm5GbG9vcic7XG5cdFx0XHRcdGFyZWEuY2F2ZXJuVHlwZSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKFsncm9ja3knLCdicmlkZ2VzJ10pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKFV0aWwuY2hhbmNlKHRoaXMuTEFHT09OX0NIQU5DRVtkZXB0aC0xXSkpe1xuXHRcdFx0XHRcdGFyZWEuZmxvb3IgPSAnZmFrZVdhdGVyJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhcmVhLmZsb29yID0gJ2NhdmVybkZsb29yJztcblx0XHRcdFx0fVxuXHRcdFx0XHRhcmVhLmNhdmVyblR5cGUgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihbJ3JvY2t5JywnYnJpZGdlcycsJ3dhdGVyeSddKTtcblx0XHRcdH1cblx0XHRcdGFyZWEuZmxvb3JUeXBlID0gVXRpbC5yYW5kKDEsIHRoaXMuQ0FWRVJOX0ZMT09SUyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFyZWEuYXJlYVR5cGUgPSAncm9vbXMnO1xuXHRcdFx0YXJlYS5mbG9vciA9ICdzdG9uZUZsb29yJztcblx0XHRcdGFyZWEuZmxvb3JUeXBlID0gVXRpbC5yYW5kKDEsIHRoaXMuU1RPTkVfRkxPT1JTKTtcblx0XHRcdGlmIChVdGlsLmNoYW5jZSh0aGlzLldBTExMRVNTX0NIQU5DRVtkZXB0aC0xXSkpe1xuXHRcdFx0XHRhcmVhLndhbGwgPSBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFyZWEud2FsbCA9ICdzdG9uZVdhbGwnO1xuXHRcdFx0XHRhcmVhLndhbGxUeXBlID0gVXRpbC5yYW5kKDEsIHRoaXMuU1RPTkVfV0FMTFMpO1xuXHRcdFx0fVxuXHRcdFx0YXJlYS5jb3JyaWRvciA9ICdzdG9uZUZsb29yJztcblx0XHR9XG5cdFx0YXJlYS5lbmVtaWVzID0gW107XG5cdFx0YXJlYS5pdGVtcyA9IFtdO1xuXHRcdHZhciByYW5kb21HYW5nID0gVXRpbC5yYW5kb21FbGVtZW50T2YodGhpcy5HQU5HU1tkZXB0aC0xXSk7XG5cdFx0YXJlYS5lbmVtaWVzID0gcmFuZG9tR2FuZy5taW5pb25zO1xuXHRcdGFyZWEuZW5lbXlDb3VudCA9IHJhbmRvbUdhbmcucXVhbnRpdHkgKyBVdGlsLnJhbmQoMSw0KTtcblx0XHRpZiAocmFuZG9tR2FuZylcblx0XHRcdGFyZWEuYm9zcyA9IHJhbmRvbUdhbmcuYm9zcztcblx0XHRpZiAoVXRpbC5jaGFuY2UoNTApKXtcblx0XHRcdGFyZWEuZmVhdHVyZSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKHRoaXMuT0JKRUNUUyk7XG5cdFx0fVxuXHR9LFxuXHRwbGFjZUV4aXRzOiBmdW5jdGlvbihhcmVhcyl7XG5cdFx0dmFyIGRpc3QgPSBudWxsO1xuXHRcdHZhciBhcmVhMSA9IG51bGw7XG5cdFx0dmFyIGFyZWEyID0gbnVsbDtcblx0XHR2YXIgZnVzZSA9IDEwMDA7XG5cdFx0ZG8ge1xuXHRcdFx0YXJlYTEgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihhcmVhcyk7XG5cdFx0XHRhcmVhMiA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGFyZWFzKTtcblx0XHRcdGlmIChmdXNlIDwgMCl7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0ZGlzdCA9IFV0aWwubGluZURpc3RhbmNlKGFyZWExLCBhcmVhMik7XG5cdFx0XHRmdXNlLS07XG5cdFx0fSB3aGlsZSAoZGlzdCA8ICh0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCArIHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVCkgLyAzKTtcblx0XHRhcmVhMS5oYXNFeGl0ID0gdHJ1ZTtcblx0XHRhcmVhMi5oYXNFbnRyYW5jZSA9IHRydWU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaXJzdExldmVsR2VuZXJhdG9yOyIsImZ1bmN0aW9uIEdlbmVyYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0dGhpcy5maXJzdExldmVsR2VuZXJhdG9yID0gbmV3IEZpcnN0TGV2ZWxHZW5lcmF0b3IoY29uZmlnKTtcblx0dGhpcy5zZWNvbmRMZXZlbEdlbmVyYXRvciA9IG5ldyBTZWNvbmRMZXZlbEdlbmVyYXRvcihjb25maWcpO1xuXHR0aGlzLnRoaXJkTGV2ZWxHZW5lcmF0b3IgPSBuZXcgVGhpcmRMZXZlbEdlbmVyYXRvcihjb25maWcpO1xuXHR0aGlzLm1vbnN0ZXJQb3B1bGF0b3IgPSBuZXcgTW9uc3RlclBvcHVsYXRvcihjb25maWcpO1xuXHR0aGlzLml0ZW1Qb3B1bGF0b3IgPSBuZXcgSXRlbVBvcHVsYXRvcihjb25maWcpO1xuXHR0aGlzLnZlaW5HZW5lcmF0b3IgPSBuZXcgVmVpbkdlbmVyYXRvcihjb25maWcpO1xufVxuXG52YXIgRmlyc3RMZXZlbEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vRmlyc3RMZXZlbEdlbmVyYXRvci5jbGFzcycpO1xudmFyIFNlY29uZExldmVsR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9TZWNvbmRMZXZlbEdlbmVyYXRvci5jbGFzcycpO1xudmFyIFRoaXJkTGV2ZWxHZW5lcmF0b3IgPSByZXF1aXJlKCcuL1RoaXJkTGV2ZWxHZW5lcmF0b3IuY2xhc3MnKTtcbnZhciBNb25zdGVyUG9wdWxhdG9yID0gcmVxdWlyZSgnLi9Nb25zdGVyUG9wdWxhdG9yLmNsYXNzJyk7XG52YXIgSXRlbVBvcHVsYXRvciA9IHJlcXVpcmUoJy4vSXRlbVBvcHVsYXRvci5jbGFzcycpO1xudmFyIFZlaW5HZW5lcmF0b3IgPSByZXF1aXJlKCcuL1ZlaW5HZW5lcmF0b3IuY2xhc3MnKTtcblxuR2VuZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0Z2VuZXJhdGVMZXZlbDogZnVuY3Rpb24oZGVwdGgsIHVuaXF1ZVJlZ2lzdHJ5KXtcblx0XHR2YXIgc2tldGNoID0gdGhpcy5maXJzdExldmVsR2VuZXJhdG9yLmdlbmVyYXRlTGV2ZWwoZGVwdGgpO1xuXHRcdHZhciBsZXZlbCA9IHRoaXMuc2Vjb25kTGV2ZWxHZW5lcmF0b3IuZmlsbExldmVsKHNrZXRjaCk7XG5cdFx0dGhpcy50aGlyZExldmVsR2VuZXJhdG9yLmZpbGxMZXZlbChza2V0Y2gsIGxldmVsKTtcblx0XHR0aGlzLnNlY29uZExldmVsR2VuZXJhdG9yLmZyYW1lTGV2ZWwoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5tb25zdGVyUG9wdWxhdG9yLnBvcHVsYXRlTGV2ZWwoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5pdGVtUG9wdWxhdG9yLnBvcHVsYXRlTGV2ZWwoc2tldGNoLCBsZXZlbCwgdW5pcXVlUmVnaXN0cnkpO1xuXHRcdHRoaXMudmVpbkdlbmVyYXRvci50cmFjZVZlaW5zKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRza2V0Y2g6IHNrZXRjaCxcblx0XHRcdGxldmVsOiBsZXZlbFxuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyYXRvcjtcbiIsImZ1bmN0aW9uIEl0ZW1Qb3B1bGF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xuXG5JdGVtUG9wdWxhdG9yLnByb3RvdHlwZSA9IHtcblx0cG9wdWxhdGVMZXZlbDogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCwgdW5pcXVlUmVnaXN0cnkpe1xuXHRcdHRoaXMudW5pcXVlUmVnaXN0cnkgPSB1bmlxdWVSZWdpc3RyeTtcblx0XHR0aGlzLmNhbGN1bGF0ZVJhcml0aWVzKGxldmVsLmRlcHRoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdHRoaXMucG9wdWxhdGVBcmVhKGFyZWEsIGxldmVsKTtcblx0XHR9XG5cdH0sXG5cdHBvcHVsYXRlQXJlYTogZnVuY3Rpb24oYXJlYSwgbGV2ZWwpe1xuXHRcdHZhciBpdGVtcyA9IFV0aWwucmFuZCgwLDIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXM7IGkrKyl7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSwgZmFsc2UsIHRydWUpO1xuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLmdldEFuSXRlbSgpO1xuXHRcdFx0bGV2ZWwuYWRkSXRlbShpdGVtLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblx0XHR9XG5cdH0sXG5cdGNhbGN1bGF0ZVJhcml0aWVzOiBmdW5jdGlvbihkZXB0aCl7XG5cdFx0dGhpcy50aHJlc2hvbGRzID0gW107XG5cdFx0dGhpcy5nZW5lcmF0aW9uQ2hhbmNlVG90YWwgPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5JVEVNUy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuSVRFTVNbaV07XG5cdFx0XHR2YXIgbWFsdXMgPSBNYXRoLmFicyhkZXB0aC1pdGVtLmRlcHRoKSA+IDE7XG5cdFx0XHR2YXIgcmFyaXR5ID0gbWFsdXMgPyBpdGVtLnJhcml0eSAvIDIgOiBpdGVtLnJhcml0eTtcblx0XHRcdHRoaXMuZ2VuZXJhdGlvbkNoYW5jZVRvdGFsICs9IHJhcml0eTtcblx0XHRcdHRoaXMudGhyZXNob2xkcy5wdXNoKHt0aHJlc2hvbGQ6IHRoaXMuZ2VuZXJhdGlvbkNoYW5jZVRvdGFsLCBpdGVtOiBpdGVtfSk7XG5cdFx0fVxuXHR9LFxuXHRJVEVNUzogW1xuXHRcdC8qIE9yaWdpbmFsIFU0IGl0ZW1zXG5cdFx0ICAgIHtjb2RlOiAnZGFnZ2VyJywgcmFyaXR5OiA1MDB9LFxuXHRcdFx0e2NvZGU6ICdvaWxGbGFzaycsIHJhcml0eTogMTQwMH0sXG5cdFx0XHR7Y29kZTogJ3N0YWZmJywgcmFyaXR5OiAzNTB9LFxuXHRcdFx0e2NvZGU6ICdzbGluZycsIHJhcml0eTogMjgwfSxcblx0XHRcdHtjb2RlOiAnbWFjZScsIHJhcml0eTogNzB9LFxuXHRcdFx0e2NvZGU6ICdheGUnLCByYXJpdHk6IDMxfSxcblx0XHRcdHtjb2RlOiAnYm93JywgcmFyaXR5OiAyOH0sXG5cdFx0XHR7Y29kZTogJ3N3b3JkJywgcmFyaXR5OiAzNTB9LFxuXHRcdFx0e2NvZGU6ICdoYWxiZXJkJywgcmFyaXR5OiAyM30sXG5cdFx0XHR7Y29kZTogJ2Nyb3NzYm93JywgcmFyaXR5OiAxMX0sXG5cdFx0XHR7Y29kZTogJ21hZ2ljQXhlJywgcmFyaXR5OiA1fSxcblx0XHRcdHtjb2RlOiAnbWFnaWNCb3cnLCByYXJpdHk6IDR9LFxuXHRcdFx0e2NvZGU6ICdtYWdpY1N3b3JkJywgcmFyaXR5OiA0fSxcblx0XHRcdHtjb2RlOiAnbWFnaWNXYW5kJywgcmFyaXR5OiAyfSxcblx0XHRcdHtjb2RlOiAnY2xvdGgnLCByYXJpdHk6IDE0MH0sXG5cdFx0XHR7Y29kZTogJ2xlYXRoZXInLCByYXJpdHk6IDM1fSxcblx0XHRcdHtjb2RlOiAnY2hhaW4nLCByYXJpdHk6IDEyfSxcblx0XHRcdHtjb2RlOiAncGxhdGUnLCByYXJpdHk6IDR9LFxuXHQgXHQqL1xuXG5cdFx0e2NvZGU6ICdkYWdnZXJQb2lzb24nLCByYXJpdHk6IDEwMH0sXG5cdFx0e2NvZGU6ICdkYWdnZXJGYW5nJywgcmFyaXR5OiA1MCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ2RhZ2dlclN0aW5nJywgcmFyaXR5OiA1MCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ3N0YWZmR2FyZ295bGUnLCByYXJpdHk6IDEwMCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ3N0YWZmQWdlcycsIHJhcml0eTogNTAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdzdGFmZkNhYnlydXMnLCByYXJpdHk6IDUwLCB1bmlxdWU6IHRydWV9LFxuXHRcdFxuXHRcdHtjb2RlOiAnbWFjZUJhbmUnLCByYXJpdHk6IDUwLCB1bmlxdWU6IHRydWV9LFxuXHRcdHtjb2RlOiAnbWFjZUJvbmVDcnVzaGVyJywgcmFyaXR5OiA1MCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ21hY2VTbGF5ZXInLCByYXJpdHk6IDI1LCB1bmlxdWU6IHRydWV9LFxuXHRcdHtjb2RlOiAnbWFjZUp1Z2dlcm5hdXQnLCByYXJpdHk6IDI1LCB1bmlxdWU6IHRydWV9LFxuXHRcdFxuXHRcdHtjb2RlOiAnYXhlRHdhcnZpc2gnLCByYXJpdHk6IDEwMH0sXG5cdFx0e2NvZGU6ICdheGVEZWNlaXZlcicsIHJhcml0eTogNTAsIHVuaXF1ZTogdHJ1ZX0sXG5cdFx0e2NvZGU6ICdheGVSdW5lJywgcmFyaXR5OiA1MH0sXG5cdFx0XG5cdFx0e2NvZGU6ICdzd29yZEZpcmUnLCByYXJpdHk6IDEwMCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ3N3b3JkQ2hhb3MnLCByYXJpdHk6IDEwMCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ3N3b3JkRHJhZ29uJywgcmFyaXR5OiA1MH0sXG5cdFx0e2NvZGU6ICdzd29yZFF1aWNrJywgcmFyaXR5OiAyNSwgdW5pcXVlOiB0cnVlfSxcblx0XHRcblx0XHR7Y29kZTogJ3NsaW5nRXR0aW4nLCByYXJpdHk6IDEwMCwgdW5pcXVlOiB0cnVlfSxcblx0XHR7Y29kZTogJ2Jvd1BvaXNvbicsIHJhcml0eTogMjAwfSxcblx0XHR7Y29kZTogJ2Jvd1NsZWVwJywgcmFyaXR5OiAyMDB9LFxuXHRcdHtjb2RlOiAnYm93TWFnaWMnLCByYXJpdHk6IDEwMH0sXG5cdFx0e2NvZGU6ICdjcm9zc2Jvd01hZ2ljJywgcmFyaXR5OiA1MH0sXG5cdFx0XG5cdFx0e2NvZGU6ICdwaGF6b3InLCByYXJpdHk6IDI1LCB1bmlxdWU6IHRydWV9LFxuXHRcdHtjb2RlOiAnd2FuZExpZ2h0bmluZycsIHJhcml0eTogNTB9LFxuXHRcdHtjb2RlOiAnd2FuZEZpcmUnLCByYXJpdHk6IDUwfSxcblx0XHRcblx0XHR7Y29kZTogJ2xlYXRoZXJEcmFnb24nLCByYXJpdHk6IDc1fSxcblx0XHR7Y29kZTogJ2xlYXRoZXJJbXAnLCByYXJpdHk6IDEwMH0sXG5cdFx0e2NvZGU6ICdjaGFpbk1hZ2ljJywgcmFyaXR5OiA1MH0sXG5cdFx0e2NvZGU6ICdjaGFpbkR3YXJ2ZW4nLCByYXJpdHk6IDc1fSxcblx0XHR7Y29kZTogJ3BsYXRlRXRlcm5pdW0nLCByYXJpdHk6IDV9LFxuXHRcdHtjb2RlOiAncGxhdGVNYWdpYycsIHJhcml0eTogMTB9LFxuXHRcdFxuXHRcdHtjb2RlOiAnY3VyZScsIHJhcml0eTogMjAwMCwgZGVwdGg6IDF9LFxuXHRcdHtjb2RlOiAnaGVhbCcsIHJhcml0eTogMjAwMCwgZGVwdGg6IDF9LFxuXHRcdHtjb2RlOiAncmVkUG90aW9uJywgcmFyaXR5OiAyMDAwLCBkZXB0aDogMX0sXG5cdFx0e2NvZGU6ICd5ZWxsb3dQb3Rpb24nLCByYXJpdHk6IDIwMDAsIGRlcHRoOiAxfSxcblx0XHR7Y29kZTogJ2xpZ2h0JywgcmFyaXR5OiAyMDAwLCBkZXB0aDogMn0sXG5cdFx0e2NvZGU6ICdtaXNzaWxlJywgcmFyaXR5OiAyMDAwLCBkZXB0aDogM30sXG5cdFx0e2NvZGU6ICdpY2ViYWxsJywgcmFyaXR5OiAxMDAwLCBkZXB0aDogNH0sXG5cdFx0Ly97Y29kZTogJ3JlcGVsJywgcmFyaXR5OiAxMDAwLCBkZXB0aDogNX0sXG5cdFx0e2NvZGU6ICdibGluaycsIHJhcml0eTogNjY2LCBkZXB0aDogNX0sXG5cdFx0e2NvZGU6ICdmaXJlYmFsbCcsIHJhcml0eTogNjY2LCBkZXB0aDogNn0sXG5cdFx0e2NvZGU6ICdwcm90ZWN0aW9uJywgcmFyaXR5OiA1MDAsIGRlcHRoOiA2fSxcblx0XHR7Y29kZTogJ3RpbWUnLCByYXJpdHk6IDQwMCwgZGVwdGg6IDd9LFxuXHRcdHtjb2RlOiAnc2xlZXAnLCByYXJpdHk6IDQwMCwgZGVwdGg6IDd9LFxuXHRcdC8ve2NvZGU6ICdqaW54JywgcmFyaXR5OiAxNjYsIGRlcHRoOiA4fSxcblx0XHQvL3tjb2RlOiAndHJlbW9yJywgcmFyaXR5OiAxNjYsIGRlcHRoOiA4fSxcblx0XHR7Y29kZTogJ2tpbGwnLCByYXJpdHk6IDEwMCwgZGVwdGg6IDh9XG5cdF0sXG5cdGdldEFuSXRlbTogZnVuY3Rpb24oKXtcblx0XHR2YXIgbnVtYmVyID0gVXRpbC5yYW5kKDAsIHRoaXMuZ2VuZXJhdGlvbkNoYW5jZVRvdGFsKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGhyZXNob2xkcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRpZiAobnVtYmVyIDw9IHRoaXMudGhyZXNob2xkc1tpXS50aHJlc2hvbGQpe1xuXHRcdFx0XHRpZiAodGhpcy51bmlxdWVSZWdpc3RyeSAmJiB0aGlzLnRocmVzaG9sZHNbaV0uaXRlbS51bmlxdWUpIHtcblx0XHRcdFx0XHRpZiAodGhpcy51bmlxdWVSZWdpc3RyeVt0aGlzLnRocmVzaG9sZHNbaV0uaXRlbS5jb2RlXSl7XG5cdFx0XHRcdFx0XHRpID0gMDtcblx0XHRcdFx0XHRcdG51bWJlciA9IFV0aWwucmFuZCgwLCB0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCk7XG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLnVuaXF1ZVJlZ2lzdHJ5W3RoaXMudGhyZXNob2xkc1tpXS5pdGVtLmNvZGVdID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXMudGhyZXNob2xkc1tpXS5pdGVtLmNvZGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnRocmVzaG9sZHNbMF0uaXRlbS5jb2RlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbVBvcHVsYXRvcjsiLCJmdW5jdGlvbiBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG5LcmFtZ2luZUV4cG9ydGVyLnByb3RvdHlwZSA9IHtcblx0Z2V0TGV2ZWw6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHR0aGlzLmluaXRUaWxlRGVmcyhsZXZlbC5jZWlsaW5nSGVpZ2h0KTtcblx0XHR2YXIgdGlsZXMgPSB0aGlzLmdldFRpbGVzKCk7XG5cdFx0dmFyIG9iamVjdHMgPSB0aGlzLmdldE9iamVjdHMobGV2ZWwpO1xuXHRcdHZhciBtYXAgPSB0aGlzLmdldE1hcChsZXZlbCwgb2JqZWN0cyk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpbGVzOiB0aWxlcyxcblx0XHRcdG9iamVjdHM6IG9iamVjdHMsXG5cdFx0XHRtYXA6IG1hcFxuXHRcdH07XG5cdH0sXG5cdGluaXRUaWxlRGVmczogZnVuY3Rpb24oY2VpbGluZ0hlaWdodCl7XG5cdFx0dGhpcy50aWxlcyA9IFtdO1xuXHRcdHRoaXMudGlsZXNNYXAgPSBbXTtcblx0XHR0aGlzLnRpbGVzLnB1c2gobnVsbCk7XG5cdFx0dGhpcy5jZWlsaW5nSGVpZ2h0ID0gY2VpbGluZ0hlaWdodDtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfMScsIDQsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF8yJywgNSwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzMnLCA2LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfNCcsIDcsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF81JywgOCwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzYnLCA5LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9XQUxMXzEnLCAxMCwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fV0FMTF8yJywgMTEsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX1dBTExfMycsIDEyLCAwLCAwLCAwKTtcblx0XHRcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9GTE9PUl8xJywgMCwgNSwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fRkxPT1JfMicsIDAsIDYsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX0ZMT09SXzMnLCAwLCA3LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9GTE9PUl80JywgMCwgOCwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9GTE9PUl8xJywgMCwgOSwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9GTE9PUl8yJywgMCwgMTAsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfRkxPT1JfMycsIDAsIDExLCAzLCAwKTtcblx0XHRcblx0XHR0aGlzLmFkZFRpbGUoJ0JSSURHRScsIDAsIDQsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnV0FURVInLCAwLCAxMDEsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnTEFWQScsIDAsIDEwMywgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVEFJUlNfRE9XTicsIDAsIDUwLCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUQUlSU19VUCcsIDAsIDUsIDUwLCAwKTtcblx0fSxcblx0YWRkVGlsZTogZnVuY3Rpb24gKGlkLCB3YWxsVGV4dHVyZSwgZmxvb3JUZXh0dXJlLCBjZWlsVGV4dHVyZSwgZmxvb3JIZWlnaHQpe1xuXHRcdHZhciB0aWxlID0gdGhpcy5jcmVhdGVUaWxlKHdhbGxUZXh0dXJlLCBmbG9vclRleHR1cmUsIGNlaWxUZXh0dXJlLCBmbG9vckhlaWdodCwgdGhpcy5jZWlsaW5nSGVpZ2h0KTtcblx0XHR0aGlzLnRpbGVzLnB1c2godGlsZSk7XG5cdFx0dGhpcy50aWxlc01hcFtpZF0gPSB0aGlzLnRpbGVzLmxlbmd0aCAtIDE7XG5cdH0sXG5cdGdldFRpbGU6IGZ1bmN0aW9uKGlkLCB0eXBlKXtcblx0XHRpZiAoIXR5cGUpXG5cdFx0XHRyZXR1cm4gdGhpcy50aWxlc01hcFtpZF07XG5cdFx0dmFyIHRpbGUgPSB0aGlzLnRpbGVzTWFwW2lkK1wiX1wiK3R5cGVdO1xuXHRcdGlmICh0aWxlKVxuXHRcdFx0cmV0dXJuIHRpbGU7XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIHRoaXMudGlsZXNNYXBbaWQrXCJfMVwiXTtcblx0fSxcblx0Y3JlYXRlVGlsZTogZnVuY3Rpb24od2FsbFRleHR1cmUsIGZsb29yVGV4dHVyZSwgY2VpbFRleHR1cmUsIGZsb29ySGVpZ2h0LCBoZWlnaHQpe1xuXHRcdHJldHVybiB7XG5cdFx0XHR3OiB3YWxsVGV4dHVyZSxcblx0XHRcdHk6IGZsb29ySGVpZ2h0LFxuXHRcdFx0aDogaGVpZ2h0LFxuXHRcdFx0ZjogZmxvb3JUZXh0dXJlLFxuXHRcdFx0Znk6IGZsb29ySGVpZ2h0LFxuXHRcdFx0YzogY2VpbFRleHR1cmUsXG5cdFx0XHRjaDogaGVpZ2h0LFxuXHRcdFx0c2w6IDAsXG5cdFx0XHRkaXI6IDBcblx0XHR9O1xuXHR9LFxuXHRnZXRUaWxlczogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy50aWxlcztcblx0fSxcblx0Z2V0T2JqZWN0czogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdHZhciBvYmplY3RzID0gW107XG5cdFx0b2JqZWN0cy5wdXNoKHtcblx0XHRcdHg6IGxldmVsLnN0YXJ0LnggKyAwLjUsXG5cdFx0XHR6OiBsZXZlbC5zdGFydC55ICsgMC41LFxuXHRcdFx0eTogMCxcblx0XHRcdGRpcjogMyxcblx0XHRcdHR5cGU6ICdwbGF5ZXInXG5cdFx0fSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5lbmVtaWVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBlbmVteSA9IGxldmVsLmVuZW1pZXNbaV07XG5cdFx0XHR2YXIgZW5lbXlEYXRhID1cblx0XHRcdHtcblx0ICAgICAgICAgICAgeDogZW5lbXkueCArIDAuNSxcblx0ICAgICAgICAgICAgejogZW5lbXkueSArIDAuNSxcblx0ICAgICAgICAgICAgeTogMCxcblx0ICAgICAgICAgICAgdHlwZTogJ2VuZW15Jyxcblx0ICAgICAgICAgICAgZW5lbXk6IGVuZW15LmNvZGVcblx0ICAgICAgICB9O1xuXHRcdFx0b2JqZWN0cy5wdXNoKGVuZW15RGF0YSk7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuaXRlbXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGl0ZW0gPSBsZXZlbC5pdGVtc1tpXTtcblx0XHRcdHZhciBpdGVtRGF0YSA9XG5cdFx0XHR7XG5cdCAgICAgICAgICAgIHg6IGl0ZW0ueCArIDAuNSxcblx0ICAgICAgICAgICAgejogaXRlbS55ICsgMC41LFxuXHQgICAgICAgICAgICB5OiAwLFxuXHQgICAgICAgICAgICB0eXBlOiAnaXRlbScsXG5cdCAgICAgICAgICAgIGl0ZW06IGl0ZW0uY29kZVxuXHQgICAgICAgIH07XG5cdFx0XHRvYmplY3RzLnB1c2goaXRlbURhdGEpO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmZlYXR1cmVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBmZWF0dXJlID0gbGV2ZWwuZmVhdHVyZXNbaV07XG5cdFx0XHR2YXIgaXRlbURhdGEgPVxuXHRcdFx0e1xuXHQgICAgICAgICAgICB4OiBmZWF0dXJlLnggKyAwLjUsXG5cdCAgICAgICAgICAgIHo6IGZlYXR1cmUueSArIDAuNSxcblx0ICAgICAgICAgICAgeTogMCxcblx0ICAgICAgICAgICAgdHlwZTogJ2l0ZW0nLCAvL1RPRE86IENoYW5nZSB0byBmZWF0dXJlIG9uY2UgaXQncyBzdXBwb3J0ZWRcblx0ICAgICAgICAgICAgaXRlbTogZmVhdHVyZS5jb2RlIC8vVE9ETzogQ2hhbmdlIHRvIGZlYXR1cmUgb25jZSBpdCdzIHN1cHBvcnRlZFxuXHQgICAgICAgIH07XG5cdFx0XHRvYmplY3RzLnB1c2goaXRlbURhdGEpO1xuXHRcdH1cblx0XHRyZXR1cm4gb2JqZWN0cztcblx0fSxcblx0Z2V0TWFwOiBmdW5jdGlvbihsZXZlbCwgb2JqZWN0cyl7XG5cdFx0dmFyIG1hcCA9IFtdO1xuXHRcdHZhciBjZWxscyA9IGxldmVsLmNlbGxzO1xuXHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0bWFwW3ldID0gW107XG5cdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0XHR2YXIgY2VsbCA9IGNlbGxzW3hdW3ldO1xuXHRcdFx0XHR2YXIgYXJlYSA9IGxldmVsLmdldEFyZWEoeCx5KTtcblx0XHRcdFx0aWYgKCFhcmVhLndhbGxUeXBlKVxuXHRcdFx0XHRcdGFyZWEud2FsbFR5cGUgPSAxO1xuXHRcdFx0XHRpZiAoIWFyZWEuZmxvb3JUeXBlKVxuXHRcdFx0XHRcdGFyZWEuZmxvb3JUeXBlID0gMTtcblx0XHRcdFx0dmFyIGlkID0gbnVsbDtcblx0XHRcdFx0aWYgKGNlbGwgPT09ICd3YXRlcicpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiV0FURVJcIik7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2VsbCA9PT0gJ2Zha2VXYXRlcicpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiV0FURVJcIik7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc29saWRSb2NrJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJDQVZFUk5fV0FMTFwiLCAxKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdncmF5Um9jaycpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiQ0FWRVJOX1dBTExcIiwgMik7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnZGFya1JvY2snKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIkNBVkVSTl9XQUxMXCIsIDMpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2NhdmVybkZsb29yJyl7IFxuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiQ0FWRVJOX0ZMT09SXCIsIGFyZWEuZmxvb3JUeXBlKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdkb3duc3RhaXJzJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVEFJUlNfRE9XTlwiKTtcblx0XHRcdFx0XHRvYmplY3RzLnB1c2goe1xuXHRcdFx0XHRcdFx0eDogeCArIDAuNSxcblx0XHRcdCAgICAgICAgICAgIHo6IHkgKyAwLjUsXG5cdFx0XHQgICAgICAgICAgICB5OiAwLFxuXHRcdFx0ICAgICAgICAgICAgdHlwZTogJ3N0YWlycycsXG5cdFx0XHQgICAgICAgICAgICBkaXI6ICdkb3duJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3Vwc3RhaXJzJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVEFJUlNfVVBcIik7XG5cdFx0XHRcdFx0aWYgKGxldmVsLmRlcHRoID4gMSlcblx0XHRcdFx0XHRcdG9iamVjdHMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdHg6IHggKyAwLjUsXG5cdFx0XHRcdCAgICAgICAgICAgIHo6IHkgKyAwLjUsXG5cdFx0XHRcdCAgICAgICAgICAgIHk6IDAsXG5cdFx0XHRcdCAgICAgICAgICAgIHR5cGU6ICdzdGFpcnMnLFxuXHRcdFx0XHQgICAgICAgICAgICBkaXI6ICd1cCdcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3N0b25lV2FsbCcpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiU1RPTkVfV0FMTFwiLCBhcmVhLndhbGxUeXBlKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzdG9uZUZsb29yJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVE9ORV9GTE9PUlwiLGFyZWEuZmxvb3JUeXBlKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdjb3JyaWRvcicpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiU1RPTkVfRkxPT1JcIiwgMSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnYnJpZGdlJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJCUklER0VcIik7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnbGF2YScpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiTEFWQVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtYXBbeV1beF0gPSBpZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hcDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtyYW1naW5lRXhwb3J0ZXI7XG4iLCJmdW5jdGlvbiBMZXZlbChjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn07XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xuXG5MZXZlbC5wcm90b3R5cGUgPSB7XG5cdGluaXQ6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jZWxscyA9IFtdO1xuXHRcdHRoaXMuZW5lbWllcyA9IFtdO1xuXHRcdHRoaXMuZW5lbWllc01hcCA9IHt9O1xuXHRcdHRoaXMuaXRlbXMgPSBbXTtcblx0XHR0aGlzLmZlYXR1cmVzID0gW107XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdHRoaXMuY2VsbHNbeF0gPSBbXTtcblx0XHR9XG5cdH0sXG5cdGFkZEVuZW15OiBmdW5jdGlvbihlbmVteSwgeCwgeSl7XG5cdFx0dmFyIGVuZW15ID0ge1xuXHRcdFx0Y29kZTogZW5lbXksXG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeVxuXHRcdH07XG5cdFx0dGhpcy5lbmVtaWVzLnB1c2goZW5lbXkpO1xuXHRcdHRoaXMuZW5lbWllc01hcFt4K1wiX1wiK3ldID0gZW5lbXk7XG5cdH0sXG5cdGdldEVuZW15OiBmdW5jdGlvbih4LHkpe1xuXHRcdHJldHVybiB0aGlzLmVuZW1pZXNNYXBbeCtcIl9cIit5XTtcblx0fSxcblx0YWRkSXRlbTogZnVuY3Rpb24oaXRlbSwgeCwgeSl7XG5cdFx0dGhpcy5pdGVtcy5wdXNoKHtcblx0XHRcdGNvZGU6IGl0ZW0sXG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeVxuXHRcdH0pO1xuXHR9LFxuXHRhZGRGZWF0dXJlOiBmdW5jdGlvbihmZWF0dXJlLCB4LCB5KXtcblx0XHR0aGlzLmZlYXR1cmVzLnB1c2goe1xuXHRcdFx0Y29kZTogZmVhdHVyZSxcblx0XHRcdHg6IHgsXG5cdFx0XHR5OiB5XG5cdFx0fSk7XG5cdH0sXG5cdGdldEZyZWVQbGFjZTogZnVuY3Rpb24oYXJlYSwgb25seVdhdGVyLCBub1dhdGVyKXtcblx0XHR2YXIgdHJpZXMgPSAwO1xuXHRcdHdoaWxlKHRydWUpe1xuXHRcdFx0dmFyIHJhbmRQb2ludCA9IHtcblx0XHRcdFx0eDogVXRpbC5yYW5kKGFyZWEueCwgYXJlYS54K2FyZWEudy0xKSxcblx0XHRcdFx0eTogVXRpbC5yYW5kKGFyZWEueSwgYXJlYS55K2FyZWEuaC0xKVxuXHRcdFx0fVxuXHRcdFx0dmFyIGNlbGwgPSB0aGlzLmNlbGxzW3JhbmRQb2ludC54XVtyYW5kUG9pbnQueV07IFxuXHRcdFx0aWYgKG9ubHlXYXRlcil7XG5cdFx0XHRcdGlmIChjZWxsID09ICd3YXRlcicgfHwgY2VsbCA9PSAnZmFrZVdhdGVyJylcblx0XHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0aWYgKHRyaWVzID4gMTAwMClcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9ICBlbHNlIGlmIChub1dhdGVyKXtcblx0XHRcdFx0aWYgKGNlbGwgPT0gJ3dhdGVyJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKXtcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRcdGlmICh0cmllcyA+IDEwMDApXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2VsbCA9PSBhcmVhLmZsb29yIHx8IGFyZWEuY29ycmlkb3IgJiYgY2VsbCA9PSBhcmVhLmNvcnJpZG9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJhbmRQb2ludDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChjZWxsID09IGFyZWEuZmxvb3IgfHwgYXJlYS5jb3JyaWRvciAmJiBjZWxsID09IGFyZWEuY29ycmlkb3IgfHwgY2VsbCA9PSAnZmFrZVdhdGVyJylcblx0XHRcdFx0cmV0dXJuIHJhbmRQb2ludDtcblx0XHR9XG5cdH0sXG5cdGlzRnJlZUFyb3VuZDogZnVuY3Rpb24oc3BvdCwgYXJlYSl7XG5cdFx0Zm9yICh2YXIgeCA9IC0xOyB4IDw9IDE7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gLTE7IHkgPD0gMTsgeSsrKXtcblx0XHRcdFx0aWYgKHggPT0gMCAmJiB5ID09IDApXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdHZhciBjZWxsID0gdGhpcy5jZWxsc1tzcG90LnggKyB4XVtzcG90LnkgKyB5XTtcblx0XHRcdFx0aWYgKGNlbGwgIT0gYXJlYS5mbG9vcilcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRnZXRGcmVlUGxhY2VPbkxldmVsOiBmdW5jdGlvbihvbmx5V2F0ZXIsIG5vV2F0ZXIpe1xuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0d2hpbGUodHJ1ZSl7XG5cdFx0XHR2YXIgcmFuZFBvaW50ID0ge1xuXHRcdFx0XHR4OiBVdGlsLnJhbmQoMCwgdGhpcy5jZWxscy5sZW5ndGggLSAxKSxcblx0XHRcdFx0eTogVXRpbC5yYW5kKDAsIHRoaXMuY2VsbHNbMF0ubGVuZ3RoIC0gMSlcblx0XHRcdH1cblx0XHRcdHZhciBjZWxsID0gdGhpcy5jZWxsc1tyYW5kUG9pbnQueF1bcmFuZFBvaW50LnldOyBcblx0XHRcdGlmIChvbmx5V2F0ZXIpe1xuXHRcdFx0XHRpZiAoY2VsbCA9PSAnd2F0ZXInIHx8IGNlbGwgPT0gJ2Zha2VXYXRlcicpXG5cdFx0XHRcdFx0cmV0dXJuIHJhbmRQb2ludDtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdGlmICh0cmllcyA+IDEwMDApXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSAgZWxzZSBpZiAobm9XYXRlcil7XG5cdFx0XHRcdGlmIChjZWxsID09ICd3YXRlcicgfHwgY2VsbCA9PSAnZmFrZVdhdGVyJyl7XG5cdFx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0XHRpZiAodHJpZXMgPiAxMDAwKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT0gJ3N0b25lRmxvb3InIHx8IGNlbGwgPT0gJ2NhdmVybkZsb29yJykge1xuXHRcdFx0XHRcdHJldHVybiByYW5kUG9pbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoY2VsbCA9PSAnc3RvbmVGbG9vcicgfHwgY2VsbCA9PSAnY2F2ZXJuRmxvb3InIHx8IGNlbGwgPT0gJ2Zha2VXYXRlcicpXG5cdFx0XHRcdHJldHVybiByYW5kUG9pbnQ7XG5cdFx0fVxuXHR9LFxuXHRnZXRBcmVhOiBmdW5jdGlvbih4LHkpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmVhc1NrZXRjaC5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHRoaXMuYXJlYXNTa2V0Y2hbaV07XG5cdFx0XHRpZiAoeCA+PSBhcmVhLnggJiYgeCA8IGFyZWEueCArIGFyZWEud1xuXHRcdFx0XHRcdCYmIHkgPj0gYXJlYS55ICYmIHkgPCBhcmVhLnkgKyBhcmVhLmgpXG5cdFx0XHRcdHJldHVybiBhcmVhO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7IiwiZnVuY3Rpb24gTW9uc3RlclBvcHVsYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG5cbk1vbnN0ZXJQb3B1bGF0b3IucHJvdG90eXBlID0ge1xuXHRwb3B1bGF0ZUxldmVsOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdGlmIChhcmVhLmhhc0VudHJhbmNlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdHRoaXMucG9wdWxhdGVBcmVhKGFyZWEsIGxldmVsKTtcblx0XHR9XG5cdFx0dGhpcy5wb3B1bGF0ZVZlcm1pbihsZXZlbCk7XG5cdH0sXG5cdHBvcHVsYXRlVmVybWluOiBmdW5jdGlvbiggbGV2ZWwpe1xuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0dmFyIHZlcm1pbiA9IDMwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmVybWluOyBpKyspe1xuXHRcdFx0dmFyIG1vbnN0ZXIgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihsZXZlbC52ZXJtaW4pO1xuXHRcdFx0dmFyIG9ubHlXYXRlciA9IHRoaXMuaXNXYXRlck1vbnN0ZXIobW9uc3Rlcik7XG5cdFx0XHR2YXIgbm9XYXRlciA9ICFvbmx5V2F0ZXIgJiYgIXRoaXMuaXNGbHlpbmdNb25zdGVyKG1vbnN0ZXIpO1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gbGV2ZWwuZ2V0RnJlZVBsYWNlT25MZXZlbChvbmx5V2F0ZXIsIG5vV2F0ZXIpO1xuXHRcdFx0aWYgKHBvc2l0aW9uKXtcblx0XHRcdFx0aWYgKGxldmVsLmdldEVuZW15KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKXtcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRcdGlmICh0cmllcyA8IDEwMCl7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRyaWVzID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV2ZWwuYWRkRW5lbXkobW9uc3RlciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwb3B1bGF0ZUFyZWE6IGZ1bmN0aW9uKGFyZWEsIGxldmVsKXtcblx0XHRpZiAoYXJlYS5ib3NzKXtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGxldmVsLmdldEZyZWVQbGFjZShhcmVhLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRpZiAocG9zaXRpb24pe1xuXHRcdFx0XHRsZXZlbC5hZGRFbmVteShhcmVhLmJvc3MsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgdHJpZXMgPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYS5lbmVteUNvdW50OyBpKyspe1xuXHRcdFx0dmFyIG1vbnN0ZXIgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihhcmVhLmVuZW1pZXMpO1xuXHRcdFx0dmFyIG9ubHlXYXRlciA9IHRoaXMuaXNXYXRlck1vbnN0ZXIobW9uc3Rlcik7XG5cdFx0XHR2YXIgbm9XYXRlciA9ICFvbmx5V2F0ZXIgJiYgIXRoaXMuaXNGbHlpbmdNb25zdGVyKG1vbnN0ZXIpO1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gbGV2ZWwuZ2V0RnJlZVBsYWNlKGFyZWEsIG9ubHlXYXRlciwgbm9XYXRlcik7XG5cdFx0XHRpZiAocG9zaXRpb24pe1xuXHRcdFx0XHRpZiAobGV2ZWwuZ2V0RW5lbXkocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpe1xuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdFx0aWYgKHRyaWVzIDwgMTAwKXtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dHJpZXMgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXZlbC5hZGRFbmVteShtb25zdGVyLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGlzV2F0ZXJNb25zdGVyOiBmdW5jdGlvbihtb25zdGVyKXtcblx0XHRyZXR1cm4gbW9uc3RlciA9PSAnb2N0b3B1cycgfHwgbW9uc3RlciA9PSAnc2VhU2VycGVudCc7IFxuXHR9LFxuXHRpc0ZseWluZ01vbnN0ZXI6IGZ1bmN0aW9uKG1vbnN0ZXIpe1xuXHRcdHJldHVybiBtb25zdGVyID09ICdiYXQnIHx8IG1vbnN0ZXIgPT0gJ21vbmdiYXQnIHx8IG1vbnN0ZXIgPT0gJ2dob3N0JyB8fCBtb25zdGVyID09ICdkcmFnb24nIHx8IG1vbnN0ZXIgPT0gJ2dhemVyJzsgXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNb25zdGVyUG9wdWxhdG9yOyIsImZ1bmN0aW9uIFNlY29uZExldmVsR2VuZXJhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcbnZhciBMZXZlbCA9IHJlcXVpcmUoJy4vTGV2ZWwuY2xhc3MnKTtcbnZhciBDQSA9IHJlcXVpcmUoJy4vQ0EnKTtcblxuU2Vjb25kTGV2ZWxHZW5lcmF0b3IucHJvdG90eXBlID0ge1xuXHRmaWxsTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCl7XG5cdFx0dmFyIGxldmVsID0gbmV3IExldmVsKHRoaXMuY29uZmlnKTtcblx0XHRsZXZlbC5pbml0KCk7XG5cdFx0dGhpcy5maWxsU3RyYXRhKGxldmVsLCBza2V0Y2gpO1xuXHRcdGxldmVsLmNlaWxpbmdIZWlnaHQgPSBza2V0Y2guY2VpbGluZ0hlaWdodDtcblx0XHRsZXZlbC5kZXB0aCA9IHNrZXRjaC5kZXB0aDtcblx0XHRsZXZlbC52ZXJtaW4gPSBza2V0Y2gudmVybWluO1xuXHRcdGlmIChza2V0Y2guaGFzTGF2YSlcblx0XHRcdHRoaXMucGxvdFJpdmVycyhsZXZlbCwgc2tldGNoLCAnbGF2YScpO1xuXHRcdGVsc2UgaWYgKHNrZXRjaC5oYXNSaXZlcnMpXG5cdFx0XHR0aGlzLnBsb3RSaXZlcnMobGV2ZWwsIHNrZXRjaCwgJ3dhdGVyJyk7XG5cdFx0dGhpcy5jb3B5R2VvKGxldmVsKTtcblx0XHRyZXR1cm4gbGV2ZWw7XG5cdH0sXG5cdGZpbGxTdHJhdGE6IGZ1bmN0aW9uKGxldmVsLCBza2V0Y2gpe1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y29weUdlbzogZnVuY3Rpb24obGV2ZWwpe1xuXHRcdHZhciBnZW8gPSBbXTtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0Z2VvW3hdID0gW107XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdFx0Z2VvW3hdW3ldID0gbGV2ZWwuY2VsbHNbeF1beV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGxldmVsLmdlbyA9IGdlbztcblx0fSxcblx0cGxvdFJpdmVyczogZnVuY3Rpb24obGV2ZWwsIHNrZXRjaCwgbGlxdWlkKXtcblx0XHR0aGlzLnBsYWNlUml2ZXJsaW5lcyhsZXZlbCwgc2tldGNoLCBsaXF1aWQpO1xuXHRcdHRoaXMuZmF0dGVuUml2ZXJzKGxldmVsLCBsaXF1aWQpO1xuXHRcdGlmIChsaXF1aWQgPT0gJ2xhdmEnKVxuXHRcdFx0dGhpcy5mYXR0ZW5SaXZlcnMobGV2ZWwsIGxpcXVpZCk7XG5cdH0sXG5cdGZhdHRlblJpdmVyczogZnVuY3Rpb24obGV2ZWwsIGxpcXVpZCl7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nW2xpcXVpZF0gPiAxICYmIFV0aWwuY2hhbmNlKDMwKSlcblx0XHRcdFx0cmV0dXJuIGxpcXVpZDtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbbGlxdWlkXSA+IDEpXG5cdFx0XHRcdHJldHVybiBsaXF1aWQ7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdH0sXG5cdHBsYWNlUml2ZXJsaW5lczogZnVuY3Rpb24obGV2ZWwsIHNrZXRjaCwgbGlxdWlkKXtcblx0XHQvLyBQbGFjZSByYW5kb20gbGluZSBzZWdtZW50cyBvZiB3YXRlclxuXHRcdHZhciByaXZlcnMgPSBVdGlsLnJhbmQodGhpcy5jb25maWcuTUlOX1JJVkVSUyx0aGlzLmNvbmZpZy5NQVhfUklWRVJTKTtcblx0XHR2YXIgcml2ZXJTZWdtZW50TGVuZ3RoID0gdGhpcy5jb25maWcuUklWRVJfU0VHTUVOVF9MRU5HVEg7XG5cdFx0dmFyIHB1ZGRsZSA9IGZhbHNlO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcml2ZXJzOyBpKyspe1xuXHRcdFx0dmFyIHNlZ21lbnRzID0gVXRpbC5yYW5kKHRoaXMuY29uZmlnLk1JTl9SSVZFUl9TRUdNRU5UUyx0aGlzLmNvbmZpZy5NQVhfUklWRVJfU0VHTUVOVFMpO1xuXHRcdFx0dmFyIHJpdmVyUG9pbnRzID0gW107XG5cdFx0XHRyaXZlclBvaW50cy5wdXNoKHtcblx0XHRcdFx0eDogVXRpbC5yYW5kKDAsIHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIKSxcblx0XHRcdFx0eTogVXRpbC5yYW5kKDAsIHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVClcblx0XHRcdH0pO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzZWdtZW50czsgaisrKXtcblx0XHRcdFx0dmFyIHJhbmRvbVBvaW50ID0gVXRpbC5yYW5kb21FbGVtZW50T2Yocml2ZXJQb2ludHMpO1xuXHRcdFx0XHRpZiAocml2ZXJQb2ludHMubGVuZ3RoID4gMSAmJiAhcHVkZGxlKVxuXHRcdFx0XHRcdFV0aWwucmVtb3ZlRnJvbUFycmF5KHJpdmVyUG9pbnRzLCByYW5kb21Qb2ludCk7XG5cdFx0XHRcdHZhciBpYW5jZSA9IHtcblx0XHRcdFx0XHR4OiBVdGlsLnJhbmQoLXJpdmVyU2VnbWVudExlbmd0aCwgcml2ZXJTZWdtZW50TGVuZ3RoKSxcblx0XHRcdFx0XHR5OiBVdGlsLnJhbmQoLXJpdmVyU2VnbWVudExlbmd0aCwgcml2ZXJTZWdtZW50TGVuZ3RoKVxuXHRcdFx0XHR9O1xuXHRcdFx0XHR2YXIgbmV3UG9pbnQgPSB7XG5cdFx0XHRcdFx0eDogcmFuZG9tUG9pbnQueCArIGlhbmNlLngsXG5cdFx0XHRcdFx0eTogcmFuZG9tUG9pbnQueSArIGlhbmNlLnksXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChuZXdQb2ludC54ID4gMCAmJiBuZXdQb2ludC54IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEggJiYgXG5cdFx0XHRcdFx0bmV3UG9pbnQueSA+IDAgJiYgbmV3UG9pbnQueSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVClcblx0XHRcdFx0XHRyaXZlclBvaW50cy5wdXNoKG5ld1BvaW50KTtcblx0XHRcdFx0dmFyIGxpbmUgPSBVdGlsLmxpbmUocmFuZG9tUG9pbnQsIG5ld1BvaW50KTtcblx0XHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCBsaW5lLmxlbmd0aDsgaysrKXtcblx0XHRcdFx0XHR2YXIgcG9pbnQgPSBsaW5lW2tdO1xuXHRcdFx0XHRcdGlmIChwb2ludC54ID4gMCAmJiBwb2ludC54IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEggJiYgXG5cdFx0XHRcdFx0XHRwb2ludC55ID4gMCAmJiBwb2ludC55IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUKVxuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gbGlxdWlkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRmcmFtZUxldmVsOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0aWYgKGxldmVsLmNlbGxzW3hdWzBdICE9ICdzdG9uZVdhbGwnKSBsZXZlbC5jZWxsc1t4XVswXSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0XHRpZiAobGV2ZWwuY2VsbHNbeF1bdGhpcy5jb25maWcuTEVWRUxfSEVJR0hULTFdICE9ICdzdG9uZVdhbGwnKSBsZXZlbC5jZWxsc1t4XVt0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQtMV0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdH1cblx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdGlmIChsZXZlbC5jZWxsc1swXVt5XSAhPSAnc3RvbmVXYWxsJykgbGV2ZWwuY2VsbHNbMF1beV0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdFx0aWYgKGxldmVsLmNlbGxzW3RoaXMuY29uZmlnLkxFVkVMX1dJRFRILTFdW3ldICE9ICdzdG9uZVdhbGwnKSBsZXZlbC5jZWxsc1t0aGlzLmNvbmZpZy5MRVZFTF9XSURUSC0xXVt5XSA9IHNrZXRjaC5zdHJhdGE7XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2Vjb25kTGV2ZWxHZW5lcmF0b3I7IiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzdWJkaXZpZGVBcmVhOiBmdW5jdGlvbihiaWdBcmVhLCBtYXhEZXB0aCwgTUlOX1dJRFRILCBNSU5fSEVJR0hULCBNQVhfV0lEVEgsIE1BWF9IRUlHSFQsIFNMSUNFX1JBTkdFX1NUQVJULCBTTElDRV9SQU5HRV9FTkQsIGF2b2lkUG9pbnRzKXtcblx0XHR2YXIgYXJlYXMgPSBbXTtcblx0XHR2YXIgYmlnQXJlYXMgPSBbXTtcblx0XHRiaWdBcmVhLmRlcHRoID0gMDtcblx0XHRiaWdBcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdHZhciByZXRyaWVzID0gMDtcblx0XHR3aGlsZSAoYmlnQXJlYXMubGVuZ3RoID4gMCl7XG5cdFx0XHR2YXIgYmlnQXJlYSA9IGJpZ0FyZWFzLnBvcCgpO1xuXHRcdFx0aWYgKGJpZ0FyZWEudyA8IE1JTl9XSURUSCArIDEgJiYgYmlnQXJlYS5oIDwgTUlOX0hFSUdIVCArIDEpe1xuXHRcdFx0XHRiaWdBcmVhLmJyaWRnZXMgPSBbXTtcblx0XHRcdFx0YXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHR2YXIgaG9yaXpvbnRhbFNwbGl0ID0gVXRpbC5jaGFuY2UoNTApO1xuXHRcdFx0aWYgKGJpZ0FyZWEudyA8IE1JTl9XSURUSCArIDEpe1xuXHRcdFx0XHRob3Jpem9udGFsU3BsaXQgPSB0cnVlO1xuXHRcdFx0fSBcblx0XHRcdGlmIChiaWdBcmVhLmggPCBNSU5fSEVJR0hUICsgMSl7XG5cdFx0XHRcdGhvcml6b250YWxTcGxpdCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGFyZWExID0gbnVsbDtcblx0XHRcdHZhciBhcmVhMiA9IG51bGw7XG5cdFx0XHRpZiAoaG9yaXpvbnRhbFNwbGl0KXtcblx0XHRcdFx0dmFyIHNsaWNlID0gTWF0aC5yb3VuZChVdGlsLnJhbmQoYmlnQXJlYS5oICogU0xJQ0VfUkFOR0VfU1RBUlQsIGJpZ0FyZWEuaCAqIFNMSUNFX1JBTkdFX0VORCkpO1xuXHRcdFx0XHRhcmVhMSA9IHtcblx0XHRcdFx0XHR4OiBiaWdBcmVhLngsXG5cdFx0XHRcdFx0eTogYmlnQXJlYS55LFxuXHRcdFx0XHRcdHc6IGJpZ0FyZWEudyxcblx0XHRcdFx0XHRoOiBzbGljZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRhcmVhMiA9IHtcblx0XHRcdFx0XHR4OiBiaWdBcmVhLngsXG5cdFx0XHRcdFx0eTogYmlnQXJlYS55ICsgc2xpY2UsXG5cdFx0XHRcdFx0dzogYmlnQXJlYS53LFxuXHRcdFx0XHRcdGg6IGJpZ0FyZWEuaCAtIHNsaWNlXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBzbGljZSA9IE1hdGgucm91bmQoVXRpbC5yYW5kKGJpZ0FyZWEudyAqIFNMSUNFX1JBTkdFX1NUQVJULCBiaWdBcmVhLncgKiBTTElDRV9SQU5HRV9FTkQpKTtcblx0XHRcdFx0YXJlYTEgPSB7XG5cdFx0XHRcdFx0eDogYmlnQXJlYS54LFxuXHRcdFx0XHRcdHk6IGJpZ0FyZWEueSxcblx0XHRcdFx0XHR3OiBzbGljZSxcblx0XHRcdFx0XHRoOiBiaWdBcmVhLmhcblx0XHRcdFx0fVxuXHRcdFx0XHRhcmVhMiA9IHtcblx0XHRcdFx0XHR4OiBiaWdBcmVhLngrc2xpY2UsXG5cdFx0XHRcdFx0eTogYmlnQXJlYS55LFxuXHRcdFx0XHRcdHc6IGJpZ0FyZWEudy1zbGljZSxcblx0XHRcdFx0XHRoOiBiaWdBcmVhLmhcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmIChhcmVhMS53IDwgTUlOX1dJRFRIIHx8IGFyZWExLmggPCBNSU5fSEVJR0hUIHx8XG5cdFx0XHRcdGFyZWEyLncgPCBNSU5fV0lEVEggfHwgYXJlYTIuaCA8IE1JTl9IRUlHSFQpe1xuXHRcdFx0XHRpZiAocmV0cmllcyA+IDEwMCl7XG5cdFx0XHRcdFx0YmlnQXJlYS5icmlkZ2VzID0gW107XG5cdFx0XHRcdFx0YXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0XHRyZXRyaWVzID0gMDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRiaWdBcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRcdHJldHJpZXMrKztcblx0XHRcdFx0fVx0XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGJpZ0FyZWEuZGVwdGggPT0gbWF4RGVwdGggJiYgXG5cdFx0XHRcdFx0KGFyZWExLncgPiBNQVhfV0lEVEggfHwgYXJlYTEuaCA+IE1BWF9IRUlHSFQgfHxcblx0XHRcdFx0XHRhcmVhMi53ID4gTUFYX1dJRFRIIHx8IGFyZWEyLmggPiBNQVhfSEVJR0hUKSl7XG5cdFx0XHRcdGlmIChyZXRyaWVzIDwgMTAwKSB7XG5cdFx0XHRcdFx0Ly8gUHVzaCBiYWNrIGJpZyBhcmVhXG5cdFx0XHRcdFx0YmlnQXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0XHRyZXRyaWVzKys7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0cmllcyA9IDA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXZvaWRQb2ludHMgJiYgKHRoaXMuY29sbGlkZXNXaXRoKGF2b2lkUG9pbnRzLCBhcmVhMikgfHwgdGhpcy5jb2xsaWRlc1dpdGgoYXZvaWRQb2ludHMsIGFyZWExKSkpe1xuXHRcdFx0XHRpZiAocmV0cmllcyA+IDEwMCl7XG5cdFx0XHRcdFx0YmlnQXJlYS5icmlkZ2VzID0gW107XG5cdFx0XHRcdFx0YXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0XHRyZXRyaWVzID0gMDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBQdXNoIGJhY2sgYmlnIGFyZWFcblx0XHRcdFx0XHRiaWdBcmVhcy5wdXNoKGJpZ0FyZWEpO1xuXHRcdFx0XHRcdHJldHJpZXMrKztcblx0XHRcdFx0fVx0XHRcblx0XHRcdFx0Y29udGludWU7IFxuXHRcdFx0fVxuXHRcdFx0aWYgKGJpZ0FyZWEuZGVwdGggPT0gbWF4RGVwdGgpe1xuXHRcdFx0XHRhcmVhMS5icmlkZ2VzID0gW107XG5cdFx0XHRcdGFyZWEyLmJyaWRnZXMgPSBbXTtcblx0XHRcdFx0YXJlYXMucHVzaChhcmVhMSk7XG5cdFx0XHRcdGFyZWFzLnB1c2goYXJlYTIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXJlYTEuZGVwdGggPSBiaWdBcmVhLmRlcHRoICsxO1xuXHRcdFx0XHRhcmVhMi5kZXB0aCA9IGJpZ0FyZWEuZGVwdGggKzE7XG5cdFx0XHRcdGJpZ0FyZWFzLnB1c2goYXJlYTEpO1xuXHRcdFx0XHRiaWdBcmVhcy5wdXNoKGFyZWEyKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGFyZWFzO1xuXHR9LFxuXHRjb2xsaWRlc1dpdGg6IGZ1bmN0aW9uKGF2b2lkUG9pbnRzLCBhcmVhKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGF2b2lkUG9pbnRzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhdm9pZFBvaW50ID0gYXZvaWRQb2ludHNbaV07XG5cdFx0XHRpZiAoVXRpbC5mbGF0RGlzdGFuY2UoYXJlYS54LCBhcmVhLnksIGF2b2lkUG9pbnQueCwgYXZvaWRQb2ludC55KSA8PSAyIHx8XG5cdFx0XHRcdFV0aWwuZmxhdERpc3RhbmNlKGFyZWEueCthcmVhLncsIGFyZWEueSwgYXZvaWRQb2ludC54LCBhdm9pZFBvaW50LnkpIDw9IDIgfHxcblx0XHRcdFx0VXRpbC5mbGF0RGlzdGFuY2UoYXJlYS54LCBhcmVhLnkrYXJlYS5oLCBhdm9pZFBvaW50LngsIGF2b2lkUG9pbnQueSkgPD0gMiB8fFxuXHRcdFx0XHRVdGlsLmZsYXREaXN0YW5jZShhcmVhLngrYXJlYS53LCBhcmVhLnkrYXJlYS5oLCBhdm9pZFBvaW50LngsIGF2b2lkUG9pbnQueSkgPD0gMil7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdGNvbm5lY3RBcmVhczogZnVuY3Rpb24oYXJlYXMsIGJvcmRlcil7XG5cdFx0LyogTWFrZSBvbmUgYXJlYSBjb25uZWN0ZWRcblx0XHQgKiBXaGlsZSBub3QgYWxsIGFyZWFzIGNvbm5lY3RlZCxcblx0XHQgKiAgU2VsZWN0IGEgY29ubmVjdGVkIGFyZWFcblx0XHQgKiAgU2VsZWN0IGEgdmFsaWQgd2FsbCBmcm9tIHRoZSBhcmVhXG5cdFx0ICogIFRlYXIgaXQgZG93biwgY29ubmVjdGluZyB0byB0aGUgYSBuZWFyYnkgYXJlYVxuXHRcdCAqICBNYXJrIGFyZWEgYXMgY29ubmVjdGVkXG5cdFx0ICovXG5cdFx0aWYgKCFib3JkZXIpe1xuXHRcdFx0Ym9yZGVyID0gMTtcblx0XHR9XG5cdFx0dmFyIGNvbm5lY3RlZEFyZWFzID0gW107XG5cdFx0dmFyIHJhbmRvbUFyZWEgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihhcmVhcyk7XG5cdFx0Y29ubmVjdGVkQXJlYXMucHVzaChyYW5kb21BcmVhKTtcblx0XHR2YXIgY3Vyc29yID0ge307XG5cdFx0dmFyIHZhcmkgPSB7fTtcblx0XHRhcmVhOiB3aGlsZSAoY29ubmVjdGVkQXJlYXMubGVuZ3RoIDwgYXJlYXMubGVuZ3RoKXtcblx0XHRcdHJhbmRvbUFyZWEgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihjb25uZWN0ZWRBcmVhcyk7XG5cdFx0XHR2YXIgd2FsbERpciA9IFV0aWwucmFuZCgxLDQpO1xuXHRcdFx0c3dpdGNoKHdhbGxEaXIpe1xuXHRcdFx0Y2FzZSAxOiAvLyBMZWZ0XG5cdFx0XHRcdGN1cnNvci54ID0gcmFuZG9tQXJlYS54O1xuXHRcdFx0XHRjdXJzb3IueSA9IFV0aWwucmFuZChyYW5kb21BcmVhLnkgKyBib3JkZXIgLCByYW5kb21BcmVhLnkrcmFuZG9tQXJlYS5oIC0gYm9yZGVyKTtcblx0XHRcdFx0dmFyaS54ID0gLTI7XG5cdFx0XHRcdHZhcmkueSA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOiAvL1JpZ2h0XG5cdFx0XHRcdGN1cnNvci54ID0gcmFuZG9tQXJlYS54ICsgcmFuZG9tQXJlYS53O1xuXHRcdFx0XHRjdXJzb3IueSA9IFV0aWwucmFuZChyYW5kb21BcmVhLnkgKyBib3JkZXIsIHJhbmRvbUFyZWEueStyYW5kb21BcmVhLmggLSBib3JkZXIpO1xuXHRcdFx0XHR2YXJpLnggPSAyO1xuXHRcdFx0XHR2YXJpLnkgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzogLy9VcFxuXHRcdFx0XHRjdXJzb3IueCA9IFV0aWwucmFuZChyYW5kb21BcmVhLnggKyBib3JkZXIsIHJhbmRvbUFyZWEueCtyYW5kb21BcmVhLncgLSBib3JkZXIpO1xuXHRcdFx0XHRjdXJzb3IueSA9IHJhbmRvbUFyZWEueTtcblx0XHRcdFx0dmFyaS54ID0gMDtcblx0XHRcdFx0dmFyaS55ID0gLTI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA0OiAvL0Rvd25cblx0XHRcdFx0Y3Vyc29yLnggPSBVdGlsLnJhbmQocmFuZG9tQXJlYS54ICsgYm9yZGVyLCByYW5kb21BcmVhLngrcmFuZG9tQXJlYS53IC0gYm9yZGVyKTtcblx0XHRcdFx0Y3Vyc29yLnkgPSByYW5kb21BcmVhLnkgKyByYW5kb21BcmVhLmg7XG5cdFx0XHRcdHZhcmkueCA9IDA7XG5cdFx0XHRcdHZhcmkueSA9IDI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNvbm5lY3RlZEFyZWEgPSB0aGlzLmdldEFyZWFBdChjdXJzb3IsIHZhcmksIGFyZWFzKTtcblx0XHRcdGlmIChjb25uZWN0ZWRBcmVhICYmICFVdGlsLmNvbnRhaW5zKGNvbm5lY3RlZEFyZWFzLCBjb25uZWN0ZWRBcmVhKSl7XG5cdFx0XHRcdHN3aXRjaCh3YWxsRGlyKXtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0aWYgKGN1cnNvci55IDw9IGNvbm5lY3RlZEFyZWEueSArIGJvcmRlciB8fCBjdXJzb3IueSA+PSBjb25uZWN0ZWRBcmVhLnkgKyBjb25uZWN0ZWRBcmVhLmggLSBib3JkZXIpXG5cdFx0XHRcdFx0XHRjb250aW51ZSBhcmVhO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRpZiAoY3Vyc29yLnggPD0gY29ubmVjdGVkQXJlYS54ICsgYm9yZGVyIHx8IGN1cnNvci54ID49IGNvbm5lY3RlZEFyZWEueCArIGNvbm5lY3RlZEFyZWEudyAtIGJvcmRlcilcblx0XHRcdFx0XHRcdGNvbnRpbnVlIGFyZWE7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuY29ubmVjdEFyZWEocmFuZG9tQXJlYSwgY29ubmVjdGVkQXJlYSwgY3Vyc29yKTtcblx0XHRcdFx0Y29ubmVjdGVkQXJlYXMucHVzaChjb25uZWN0ZWRBcmVhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGdldEFyZWFBdDogZnVuY3Rpb24oY3Vyc29yLCB2YXJpLCBhcmVhcyl7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IGFyZWFzW2ldO1xuXHRcdFx0aWYgKGN1cnNvci54ICsgdmFyaS54ID49IGFyZWEueCAmJiBjdXJzb3IueCArIHZhcmkueCA8PSBhcmVhLnggKyBhcmVhLncgXG5cdFx0XHRcdFx0JiYgY3Vyc29yLnkgKyB2YXJpLnkgPj0gYXJlYS55ICYmIGN1cnNvci55ICsgdmFyaS55IDw9IGFyZWEueSArIGFyZWEuaClcblx0XHRcdFx0cmV0dXJuIGFyZWE7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0Y29ubmVjdEFyZWE6IGZ1bmN0aW9uKGFyZWExLCBhcmVhMiwgcG9zaXRpb24pe1xuXHRcdGFyZWExLmJyaWRnZXMucHVzaCh7XG5cdFx0XHR4OiBwb3NpdGlvbi54LFxuXHRcdFx0eTogcG9zaXRpb24ueSxcblx0XHRcdHRvOiBhcmVhMlxuXHRcdH0pO1xuXHRcdGFyZWEyLmJyaWRnZXMucHVzaCh7XG5cdFx0XHR4OiBwb3NpdGlvbi54LFxuXHRcdFx0eTogcG9zaXRpb24ueSxcblx0XHRcdHRvOiBhcmVhMVxuXHRcdH0pO1xuXHR9XG59IiwiZnVuY3Rpb24gVGhpcmRMZXZlbEdlbmVyYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG52YXIgQ0EgPSByZXF1aXJlKCcuL0NBJyk7XG52YXIgU3BsaXR0ZXIgPSByZXF1aXJlKCcuL1NwbGl0dGVyJyk7XG5cblRoaXJkTGV2ZWxHZW5lcmF0b3IucHJvdG90eXBlID0ge1xuXHRmaWxsTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdHRoaXMuZmlsbFJvb21zKHNrZXRjaCwgbGV2ZWwpXG5cdFx0dGhpcy5mYXR0ZW5DYXZlcm5zKGxldmVsKTtcblx0XHR0aGlzLnBsYWNlRXhpdHMoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5yYWlzZUlzbGFuZHMobGV2ZWwpO1xuXHRcdHRoaXMuZW5sYXJnZUJyaWRnZXMobGV2ZWwpO1xuXHRcdHRoaXMucGxhY2VGZWF0dXJlcyhza2V0Y2gsIGxldmVsKTtcblx0XHRsZXZlbC5hcmVhc1NrZXRjaCA9IHNrZXRjaC5hcmVhcztcblx0XHRyZXR1cm4gbGV2ZWw7XG5cdH0sXG5cdGZhdHRlbkNhdmVybnM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHQvLyBHcm93IGNhdmVybnNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2NhdmVybkZsb29yJ10gPiAwICYmIFV0aWwuY2hhbmNlKDIwKSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddID4gMSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0Ly8gR3JvdyBsYWdvb24gYXJlYXNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2Zha2VXYXRlciddID4gMCAmJiBVdGlsLmNoYW5jZSg0MCkpXG5cdFx0XHRcdHJldHVybiAnZmFrZVdhdGVyJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2Zha2VXYXRlciddID4gMClcblx0XHRcdFx0cmV0dXJuICdmYWtlV2F0ZXInO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdFxuXHRcdFxuXHRcdC8vIEV4cGFuZCB3YWxsLWxlc3Mgcm9vbXNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnc29saWRSb2NrJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydzdG9uZUZsb29yJ10gPiAyICYmIFV0aWwuY2hhbmNlKDEwKSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSk7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKGN1cnJlbnQgIT0gJ3NvbGlkUm9jaycpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMCAmJiBzdXJyb3VuZGluZ1snY2F2ZXJuRmxvb3InXT4wKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHQvLyBEZXRlcmlvcmF0ZSB3YWxsIHJvb21zXG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKGN1cnJlbnQgIT0gJ3N0b25lV2FsbCcpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMCAmJiBVdGlsLmNoYW5jZSg1KSlcblx0XHRcdFx0cmV0dXJuICdzdG9uZUZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRcblx0fSxcblx0ZW5sYXJnZUJyaWRnZXM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnbGF2YScgJiYgY3VycmVudCAhPSAnd2F0ZXInICYmIGN1cnJlbnQgIT0gJ2Zha2VXYXRlcicpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdC8qaWYgKHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddID4gMCB8fCBzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMClcblx0XHRcdFx0cmV0dXJuIGZhbHNlOyovXG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2JyaWRnZSddID4gMClcblx0XHRcdFx0cmV0dXJuICdicmlkZ2UnO1xuXHRcdH0sIDEsIHRydWUpO1xuXHR9LFxuXHRyYWlzZUlzbGFuZHM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnd2F0ZXInKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgY2F2ZXJucyA9IHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddOyBcblx0XHRcdGlmIChjYXZlcm5zID4gMCAmJiBVdGlsLmNoYW5jZSg3MCkpXG5cdFx0XHRcdHJldHVybiAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdC8vIElzbGFuZCBmb3IgZXhpdHMgb24gd2F0ZXJcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnZmFrZVdhdGVyJyAmJiBjdXJyZW50ICE9ICd3YXRlcicpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdHZhciBzdGFpcnMgPSBzdXJyb3VuZGluZ1snZG93bnN0YWlycyddID8gc3Vycm91bmRpbmdbJ2Rvd25zdGFpcnMnXSA6IDAgK1xuXHRcdFx0XHRcdHN1cnJvdW5kaW5nWyd1cHN0YWlycyddID8gc3Vycm91bmRpbmdbJ3Vwc3RhaXJzJ10gOiAwOyBcblx0XHRcdGlmIChzdGFpcnMgPiAwKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxKTtcblx0fSxcblx0ZmlsbFJvb21zOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdHZhciB0eXBlID0gYXJlYS5hcmVhVHlwZTtcblx0XHRcdGlmICh0eXBlID09PSAnY2F2ZXJuJyl7IFxuXHRcdFx0XHR0aGlzLmZpbGxXaXRoQ2F2ZXJuKGxldmVsLCBhcmVhKTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ3Jvb21zJyl7XG5cdFx0XHRcdHRoaXMuZmlsbFdpdGhSb29tcyhsZXZlbCwgYXJlYSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwbGFjZUV4aXRzOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdGlmICghYXJlYS5oYXNFeGl0ICYmICFhcmVhLmhhc0VudHJhbmNlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdHZhciB0aWxlID0gbnVsbDtcblx0XHRcdGlmIChhcmVhLmhhc0V4aXQpe1xuXHRcdFx0XHR0aWxlID0gJ2Rvd25zdGFpcnMnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGlsZSA9ICd1cHN0YWlycyc7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZnJlZVNwb3QgPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSk7XG5cdFx0XHRpZiAoZnJlZVNwb3QueCA9PSAwIHx8IGZyZWVTcG90LnkgPT0gMCB8fCBmcmVlU3BvdC54ID09IGxldmVsLmNlbGxzLmxlbmd0aCAtIDEgfHwgZnJlZVNwb3QueSA9PSBsZXZlbC5jZWxsc1swXS5sZW5ndGggLSAxKXtcblx0XHRcdFx0aS0tO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGxldmVsLmNlbGxzW2ZyZWVTcG90LnhdW2ZyZWVTcG90LnldID0gdGlsZTtcblx0XHRcdGlmIChhcmVhLmhhc0V4aXQpe1xuXHRcdFx0XHRsZXZlbC5lbmQgPSB7XG5cdFx0XHRcdFx0eDogZnJlZVNwb3QueCxcblx0XHRcdFx0XHR5OiBmcmVlU3BvdC55XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXZlbC5zdGFydCA9IHtcblx0XHRcdFx0XHR4OiBmcmVlU3BvdC54LFxuXHRcdFx0XHRcdHk6IGZyZWVTcG90Lnlcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHBsYWNlRmVhdHVyZXM6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2guYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBza2V0Y2guYXJlYXNbaV07XG5cdFx0XHRpZiAoIWFyZWEuZmVhdHVyZSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR2YXIgZnJlZVNwb3QgPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSk7XG5cdFx0XHRpZiAoZnJlZVNwb3QueCA9PSAwIHx8IGZyZWVTcG90LnkgPT0gMCB8fCBmcmVlU3BvdC54ID09IGxldmVsLmNlbGxzLmxlbmd0aCAtIDEgfHwgZnJlZVNwb3QueSA9PSBsZXZlbC5jZWxsc1swXS5sZW5ndGggLSAxKXtcblx0XHRcdFx0aS0tO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmICghbGV2ZWwuaXNGcmVlQXJvdW5kKGZyZWVTcG90LCBhcmVhKSB8fFxuXHRcdFx0XHQoTWF0aC5hYnMoZnJlZVNwb3QueCAtIGxldmVsLmVuZC54KSA8IDMgJiYgTWF0aC5hYnMoZnJlZVNwb3QueSAtIGxldmVsLmVuZC55KSA8IDMpIHx8XG5cdFx0XHRcdChNYXRoLmFicyhmcmVlU3BvdC54IC0gbGV2ZWwuc3RhcnQueCkgPCAzICYmIE1hdGguYWJzKGZyZWVTcG90LnkgLSBsZXZlbC5zdGFydC55KSA8IDMpXG5cdFx0XHRcdFx0KXtcblx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0aWYgKHRyaWVzID4gMTAwKXtcblx0XHRcdFx0XHR0cmllcyA9IDA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0bGV2ZWwuYWRkRmVhdHVyZShhcmVhLmZlYXR1cmUsIGZyZWVTcG90LngsIGZyZWVTcG90LnkpO1xuXHRcdH1cblx0fSxcblx0ZmlsbFdpdGhDYXZlcm46IGZ1bmN0aW9uKGxldmVsLCBhcmVhKXtcblx0XHQvLyBDb25uZWN0IGFsbCBicmlkZ2VzIHdpdGggbWlkcG9pbnRcblx0XHR2YXIgbWlkcG9pbnQgPSB7XG5cdFx0XHR4OiBNYXRoLnJvdW5kKFV0aWwucmFuZChhcmVhLnggKyBhcmVhLncgKiAxLzMsIGFyZWEueCthcmVhLncgKiAyLzMpKSxcblx0XHRcdHk6IE1hdGgucm91bmQoVXRpbC5yYW5kKGFyZWEueSArIGFyZWEuaCAqIDEvMywgYXJlYS55K2FyZWEuaCAqIDIvMykpXG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYS5icmlkZ2VzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBicmlkZ2UgPSBhcmVhLmJyaWRnZXNbaV07XG5cdFx0XHR2YXIgbGluZSA9IFV0aWwubGluZShtaWRwb2ludCwgYnJpZGdlKTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbGluZS5sZW5ndGg7IGorKyl7XG5cdFx0XHRcdHZhciBwb2ludCA9IGxpbmVbal07XG5cdFx0XHRcdHZhciBjdXJyZW50Q2VsbCA9IGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldO1xuXHRcdFx0XHRpZiAoYXJlYS5jYXZlcm5UeXBlID09ICdyb2NreScpXG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSBhcmVhLmZsb29yO1xuXHRcdFx0XHRlbHNlIGlmIChjdXJyZW50Q2VsbCA9PSAnd2F0ZXInIHx8IGN1cnJlbnRDZWxsID09ICdsYXZhJyl7XG5cdFx0XHRcdFx0aWYgKGFyZWEuZmxvb3IgIT0gJ2Zha2VXYXRlcicgJiYgYXJlYS5jYXZlcm5UeXBlID09ICdicmlkZ2VzJylcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gJ2JyaWRnZSc7XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSAnZmFrZVdhdGVyJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9IGFyZWEuZmxvb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gU2NyYXRjaCB0aGUgYXJlYVxuXHRcdHZhciBzY3JhdGNoZXMgPSBVdGlsLnJhbmQoMiw0KTtcblx0XHR2YXIgY2F2ZVNlZ21lbnRzID0gW107XG5cdFx0Y2F2ZVNlZ21lbnRzLnB1c2gobWlkcG9pbnQpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NyYXRjaGVzOyBpKyspe1xuXHRcdFx0dmFyIHAxID0gVXRpbC5yYW5kb21FbGVtZW50T2YoY2F2ZVNlZ21lbnRzKTtcblx0XHRcdGlmIChjYXZlU2VnbWVudHMubGVuZ3RoID4gMSlcblx0XHRcdFx0VXRpbC5yZW1vdmVGcm9tQXJyYXkoY2F2ZVNlZ21lbnRzLCBwMSk7XG5cdFx0XHR2YXIgcDIgPSB7XG5cdFx0XHRcdHg6IFV0aWwucmFuZChhcmVhLngsIGFyZWEueCthcmVhLnctMSksXG5cdFx0XHRcdHk6IFV0aWwucmFuZChhcmVhLnksIGFyZWEueSthcmVhLmgtMSlcblx0XHRcdH1cblx0XHRcdGNhdmVTZWdtZW50cy5wdXNoKHAyKTtcblx0XHRcdHZhciBsaW5lID0gVXRpbC5saW5lKHAyLCBwMSk7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGxpbmUubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgcG9pbnQgPSBsaW5lW2pdO1xuXHRcdFx0XHR2YXIgY3VycmVudENlbGwgPSBsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XTtcblx0XHRcdFx0aWYgKGN1cnJlbnRDZWxsICE9ICd3YXRlcicpICBcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9IGFyZWEuZmxvb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRmaWxsV2l0aFJvb21zOiBmdW5jdGlvbihsZXZlbCwgYXJlYSl7XG5cdFx0dmFyIGJpZ0FyZWEgPSB7XG5cdFx0XHR4OiBhcmVhLngsXG5cdFx0XHR5OiBhcmVhLnksXG5cdFx0XHR3OiBhcmVhLncsXG5cdFx0XHRoOiBhcmVhLmhcblx0XHR9XG5cdFx0dmFyIG1heERlcHRoID0gMjtcblx0XHR2YXIgTUlOX1dJRFRIID0gNjtcblx0XHR2YXIgTUlOX0hFSUdIVCA9IDY7XG5cdFx0dmFyIE1BWF9XSURUSCA9IDEwO1xuXHRcdHZhciBNQVhfSEVJR0hUID0gMTA7XG5cdFx0dmFyIFNMSUNFX1JBTkdFX1NUQVJUID0gMy84O1xuXHRcdHZhciBTTElDRV9SQU5HRV9FTkQgPSA1Lzg7XG5cdFx0dmFyIGFyZWFzID0gU3BsaXR0ZXIuc3ViZGl2aWRlQXJlYShiaWdBcmVhLCBtYXhEZXB0aCwgTUlOX1dJRFRILCBNSU5fSEVJR0hULCBNQVhfV0lEVEgsIE1BWF9IRUlHSFQsIFNMSUNFX1JBTkdFX1NUQVJULCBTTElDRV9SQU5HRV9FTkQsIGFyZWEuYnJpZGdlcyk7XG5cdFx0U3BsaXR0ZXIuY29ubmVjdEFyZWFzKGFyZWFzLCBhcmVhLndhbGwgPyAyIDogMSk7IFxuXHRcdHZhciBicmlkZ2VBcmVhcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIHN1YmFyZWEgPSBhcmVhc1tpXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgYXJlYS5icmlkZ2VzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIGJyaWRnZSA9IGFyZWEuYnJpZGdlc1tqXTtcblx0XHRcdFx0aWYgKFNwbGl0dGVyLmdldEFyZWFBdChicmlkZ2Use3g6MCx5OjB9LCBhcmVhcykgPT0gc3ViYXJlYSl7XG5cdFx0XHRcdFx0aWYgKCFVdGlsLmNvbnRhaW5zKGJyaWRnZUFyZWFzLCBzdWJhcmVhKSl7XG5cdFx0XHRcdFx0XHRicmlkZ2VBcmVhcy5wdXNoKHN1YmFyZWEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdWJhcmVhLmJyaWRnZXMucHVzaCh7XG5cdFx0XHRcdFx0XHR4OiBicmlkZ2UueCxcblx0XHRcdFx0XHRcdHk6IGJyaWRnZS55XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy51c2VBcmVhcyhicmlkZ2VBcmVhcywgYXJlYXMsIGJpZ0FyZWEpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIHN1YmFyZWEgPSBhcmVhc1tpXTtcblx0XHRcdGlmICghc3ViYXJlYS5yZW5kZXIpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0c3ViYXJlYS5mbG9vciA9IGFyZWEuZmxvb3I7XG5cdFx0XHRzdWJhcmVhLndhbGwgPSBhcmVhLndhbGw7XG5cdFx0XHRzdWJhcmVhLmNvcnJpZG9yID0gYXJlYS5jb3JyaWRvcjtcblx0XHRcdHRoaXMuY2FydmVSb29tQXQobGV2ZWwsIHN1YmFyZWEpO1xuXHRcdH1cblx0fSxcblx0Y2FydmVSb29tQXQ6IGZ1bmN0aW9uKGxldmVsLCBhcmVhKXtcblx0XHR2YXIgbWluYm94ID0ge1xuXHRcdFx0eDogYXJlYS54ICsgTWF0aC5mbG9vcihhcmVhLncgLyAyKS0xLFxuXHRcdFx0eTogYXJlYS55ICsgTWF0aC5mbG9vcihhcmVhLmggLyAyKS0xLFxuXHRcdFx0eDI6IGFyZWEueCArIE1hdGguZmxvb3IoYXJlYS53IC8gMikrMSxcblx0XHRcdHkyOiBhcmVhLnkgKyBNYXRoLmZsb29yKGFyZWEuaCAvIDIpKzEsXG5cdFx0fTtcblx0XHQvLyBUcmFjZSBjb3JyaWRvcnMgZnJvbSBleGl0c1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYS5icmlkZ2VzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBicmlkZ2UgPSBhcmVhLmJyaWRnZXNbaV07XG5cdFx0XHR2YXIgdmVydGljYWxCcmlkZ2UgPSBmYWxzZTtcblx0XHRcdHZhciBob3Jpem9udGFsQnJpZGdlID0gZmFsc2U7XG5cdFx0XHRpZiAoYnJpZGdlLnggPT0gYXJlYS54KXtcblx0XHRcdFx0Ly8gTGVmdCBDb3JyaWRvclxuXHRcdFx0XHRob3Jpem9udGFsQnJpZGdlID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IGJyaWRnZS54OyBqIDwgYnJpZGdlLnggKyBhcmVhLncgLyAyOyBqKyspe1xuXHRcdFx0XHRcdGlmIChhcmVhLndhbGwpe1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55LTFdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2pdW2JyaWRnZS55LTFdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55KzFdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2pdW2JyaWRnZS55KzFdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID09ICd3YXRlcicgfHwgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID09ICdsYXZhJyl7IFxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID0gJ2JyaWRnZSc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9IGFyZWEuY29ycmlkb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYnJpZGdlLnggPT0gYXJlYS54ICsgYXJlYS53KXtcblx0XHRcdFx0Ly8gUmlnaHQgY29ycmlkb3Jcblx0XHRcdFx0aG9yaXpvbnRhbEJyaWRnZSA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGogPSBicmlkZ2UueDsgaiA+PSBicmlkZ2UueCAtIGFyZWEudyAvIDI7IGotLSl7XG5cdFx0XHRcdFx0aWYgKGFyZWEud2FsbCl7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnktMV0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnktMV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnkrMV0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnkrMV0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0fSBcblx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID09ICd3YXRlcicgfHwgbGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID09ICdsYXZhJyl7IFxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbal1bYnJpZGdlLnldID0gJ2JyaWRnZSc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9IGFyZWEuY29ycmlkb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGJyaWRnZS55ID09IGFyZWEueSl7XG5cdFx0XHRcdC8vIFRvcCBjb3JyaWRvclxuXHRcdFx0XHR2ZXJ0aWNhbEJyaWRnZSA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGogPSBicmlkZ2UueTsgaiA8IGJyaWRnZS55ICsgYXJlYS5oIC8gMjsgaisrKXtcblx0XHRcdFx0XHRpZiAoYXJlYS53YWxsKXtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueC0xXVtqXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1ticmlkZ2UueC0xXVtqXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueCsxXVtqXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1ticmlkZ2UueCsxXVtqXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPT0gJ3dhdGVyJyB8fCBsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPT0gJ2xhdmEnKXsgXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPSAnYnJpZGdlJztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID0gYXJlYS5jb3JyaWRvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERvd24gQ29ycmlkb3Jcblx0XHRcdFx0dmVydGljYWxCcmlkZ2UgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gYnJpZGdlLnk7IGogPj0gYnJpZGdlLnkgLSBhcmVhLmggLyAyOyBqLS0pe1xuXHRcdFx0XHRcdGlmIChhcmVhLndhbGwpe1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54LTFdW2pdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2JyaWRnZS54LTFdW2pdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2JyaWRnZS54KzFdW2pdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2JyaWRnZS54KzFdW2pdID0gYXJlYS53YWxsOyBcblx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPT0gJ3dhdGVyJyB8fCBsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPT0gJ2xhdmEnKXsgXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1ticmlkZ2UueF1bal0gPSAnYnJpZGdlJztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID0gYXJlYS5jb3JyaWRvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh2ZXJ0aWNhbEJyaWRnZSl7XG5cdFx0XHRcdGlmIChicmlkZ2UueCA8IG1pbmJveC54KVxuXHRcdFx0XHRcdG1pbmJveC54ID0gYnJpZGdlLng7XG5cdFx0XHRcdGlmIChicmlkZ2UueCA+IG1pbmJveC54Milcblx0XHRcdFx0XHRtaW5ib3gueDIgPSBicmlkZ2UueDtcblx0XHRcdH1cblx0XHRcdGlmIChob3Jpem9udGFsQnJpZGdlKXtcblx0XHRcdFx0aWYgKGJyaWRnZS55IDwgbWluYm94LnkpXG5cdFx0XHRcdFx0bWluYm94LnkgPSBicmlkZ2UueTtcblx0XHRcdFx0aWYgKGJyaWRnZS55ID4gbWluYm94LnkyKVxuXHRcdFx0XHRcdG1pbmJveC55MiA9IGJyaWRnZS55O1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgbWluUGFkZGluZyA9IDA7XG5cdFx0aWYgKGFyZWEud2FsbClcblx0XHRcdG1pblBhZGRpbmcgPSAxO1xuXHRcdHZhciBwYWRkaW5nID0ge1xuXHRcdFx0dG9wOiBVdGlsLnJhbmQobWluUGFkZGluZywgbWluYm94LnkgLSBhcmVhLnkgLSBtaW5QYWRkaW5nKSxcblx0XHRcdGJvdHRvbTogVXRpbC5yYW5kKG1pblBhZGRpbmcsIGFyZWEueSArIGFyZWEuaCAtIG1pbmJveC55MiAtIG1pblBhZGRpbmcpLFxuXHRcdFx0bGVmdDogVXRpbC5yYW5kKG1pblBhZGRpbmcsIG1pbmJveC54IC0gYXJlYS54IC0gbWluUGFkZGluZyksXG5cdFx0XHRyaWdodDogVXRpbC5yYW5kKG1pblBhZGRpbmcsIGFyZWEueCArIGFyZWEudyAtIG1pbmJveC54MiAtIG1pblBhZGRpbmcpXG5cdFx0fTtcblx0XHRpZiAocGFkZGluZy50b3AgPCAwKSBwYWRkaW5nLnRvcCA9IDA7XG5cdFx0aWYgKHBhZGRpbmcuYm90dG9tIDwgMCkgcGFkZGluZy5ib3R0b20gPSAwO1xuXHRcdGlmIChwYWRkaW5nLmxlZnQgPCAwKSBwYWRkaW5nLmxlZnQgPSAwO1xuXHRcdGlmIChwYWRkaW5nLnJpZ2h0IDwgMCkgcGFkZGluZy5yaWdodCA9IDA7XG5cdFx0dmFyIHJvb214ID0gYXJlYS54O1xuXHRcdHZhciByb29teSA9IGFyZWEueTtcblx0XHR2YXIgcm9vbXcgPSBhcmVhLnc7XG5cdFx0dmFyIHJvb21oID0gYXJlYS5oO1xuXHRcdGZvciAodmFyIHggPSByb29teDsgeCA8IHJvb214ICsgcm9vbXc7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gcm9vbXk7IHkgPCByb29teSArIHJvb21oOyB5Kyspe1xuXHRcdFx0XHR2YXIgZHJhd1dhbGwgPSBhcmVhLndhbGwgJiYgbGV2ZWwuY2VsbHNbeF1beV0gIT0gYXJlYS5jb3JyaWRvciAmJiBsZXZlbC5jZWxsc1t4XVt5XSAhPSAnYnJpZGdlJzsgXG5cdFx0XHRcdGlmICh5IDwgcm9vbXkgKyBwYWRkaW5nLnRvcCl7XG5cdFx0XHRcdFx0aWYgKGRyYXdXYWxsICYmIHkgPT0gcm9vbXkgKyBwYWRkaW5nLnRvcCAtIDEgJiYgeCArIDEgPj0gcm9vbXggKyBwYWRkaW5nLmxlZnQgJiYgeCA8PSByb29teCArIHJvb213IC0gcGFkZGluZy5yaWdodClcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gYXJlYS53YWxsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHggPCByb29teCArIHBhZGRpbmcubGVmdCl7XG5cdFx0XHRcdFx0aWYgKGRyYXdXYWxsICYmIHggPT0gcm9vbXggKyBwYWRkaW5nLmxlZnQgLSAxICYmIHkgPj0gcm9vbXkgKyBwYWRkaW5nLnRvcCAmJiB5IDw9IHJvb215ICsgcm9vbWggLSBwYWRkaW5nLmJvdHRvbSlcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gYXJlYS53YWxsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHkgPiByb29teSArIHJvb21oIC0gMSAtIHBhZGRpbmcuYm90dG9tKXtcblx0XHRcdFx0XHRpZiAoZHJhd1dhbGwgJiYgeSA9PSByb29teSArIHJvb21oIC0gcGFkZGluZy5ib3R0b20gJiYgeCArIDEgPj0gcm9vbXggKyBwYWRkaW5nLmxlZnQgJiYgeCA8PSByb29teCArIHJvb213IC0gcGFkZGluZy5yaWdodClcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gYXJlYS53YWxsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHggPiByb29teCArIHJvb213IC0gMSAtIHBhZGRpbmcucmlnaHQpe1xuXHRcdFx0XHRcdGlmIChkcmF3V2FsbCAmJiB4ID09IHJvb214ICsgcm9vbXcgLSBwYWRkaW5nLnJpZ2h0ICYmIHkgPj0gcm9vbXkgKyBwYWRkaW5nLnRvcCAmJiB5IDw9IHJvb215ICsgcm9vbWggLSBwYWRkaW5nLmJvdHRvbSlcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gYXJlYS53YWxsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFyZWEubWFya2VkKVxuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSBhcmVhLmZsb29yO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fSxcblx0dXNlQXJlYXM6IGZ1bmN0aW9uKGtlZXBBcmVhcywgYXJlYXMsIGJpZ0FyZWEpe1xuXHRcdC8vIEFsbCBrZWVwIGFyZWFzIHNob3VsZCBiZSBjb25uZWN0ZWQgd2l0aCBhIHNpbmdsZSBwaXZvdCBhcmVhXG5cdFx0dmFyIHBpdm90QXJlYSA9IFNwbGl0dGVyLmdldEFyZWFBdCh7eDogTWF0aC5yb3VuZChiaWdBcmVhLnggKyBiaWdBcmVhLncvMiksIHk6IE1hdGgucm91bmQoYmlnQXJlYS55ICsgYmlnQXJlYS5oLzIpfSx7eDowLHk6MH0sIGFyZWFzKTtcblx0XHR2YXIgcGF0aEFyZWFzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZWVwQXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGtlZXBBcmVhID0ga2VlcEFyZWFzW2ldO1xuXHRcdFx0a2VlcEFyZWEucmVuZGVyID0gdHJ1ZTtcblx0XHRcdHZhciBhcmVhc1BhdGggPSB0aGlzLmdldERydW5rZW5BcmVhc1BhdGgoa2VlcEFyZWEsIHBpdm90QXJlYSwgYXJlYXMpO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBhcmVhc1BhdGgubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHRhcmVhc1BhdGhbal0ucmVuZGVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IGFyZWFzW2ldO1xuXHRcdFx0aWYgKCFhcmVhLnJlbmRlcil7XG5cdFx0XHRcdGJyaWRnZXNSZW1vdmU6IGZvciAodmFyIGogPSAwOyBqIDwgYXJlYS5icmlkZ2VzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2pdO1xuXHRcdFx0XHRcdGlmICghYnJpZGdlLnRvKVxuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCBicmlkZ2UudG8uYnJpZGdlcy5sZW5ndGg7IGsrKyl7XG5cdFx0XHRcdFx0XHR2YXIgc291cmNlQnJpZGdlID0gYnJpZGdlLnRvLmJyaWRnZXNba107XG5cdFx0XHRcdFx0XHRpZiAoc291cmNlQnJpZGdlLnggPT0gYnJpZGdlLnggJiYgc291cmNlQnJpZGdlLnkgPT0gYnJpZGdlLnkpe1xuXHRcdFx0XHRcdFx0XHRVdGlsLnJlbW92ZUZyb21BcnJheShicmlkZ2UudG8uYnJpZGdlcywgc291cmNlQnJpZGdlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGdldERydW5rZW5BcmVhc1BhdGg6IGZ1bmN0aW9uIChmcm9tQXJlYSwgdG9BcmVhLCBhcmVhcyl7XG5cdFx0dmFyIGN1cnJlbnRBcmVhID0gZnJvbUFyZWE7XG5cdFx0dmFyIHBhdGggPSBbXTtcblx0XHRwYXRoLnB1c2goZnJvbUFyZWEpO1xuXHRcdHBhdGgucHVzaCh0b0FyZWEpO1xuXHRcdGlmIChmcm9tQXJlYSA9PSB0b0FyZWEpXG5cdFx0XHRyZXR1cm4gcGF0aDtcblx0XHR3aGlsZSAodHJ1ZSl7XG5cdFx0XHR2YXIgcmFuZG9tQnJpZGdlID0gVXRpbC5yYW5kb21FbGVtZW50T2YoY3VycmVudEFyZWEuYnJpZGdlcyk7XG5cdFx0XHRpZiAoIXJhbmRvbUJyaWRnZS50bylcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRpZiAoIVV0aWwuY29udGFpbnMocGF0aCwgcmFuZG9tQnJpZGdlLnRvKSl7XG5cdFx0XHRcdHBhdGgucHVzaChyYW5kb21CcmlkZ2UudG8pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJhbmRvbUJyaWRnZS50byA9PSB0b0FyZWEpXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y3VycmVudEFyZWEgPSByYW5kb21CcmlkZ2UudG87XG5cdFx0fVxuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRoaXJkTGV2ZWxHZW5lcmF0b3I7IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdHJhbmQ6IGZ1bmN0aW9uIChsb3csIGhpKXtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGhpIC0gbG93ICsgMSkpK2xvdztcblx0fSxcblx0cmFuZG9tRWxlbWVudE9mOiBmdW5jdGlvbiAoYXJyYXkpe1xuXHRcdHJldHVybiBhcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqYXJyYXkubGVuZ3RoKV07XG5cdH0sXG5cdGRpc3RhbmNlOiBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCh4Mi14MSkqKHgyLXgxKSArICh5Mi15MSkqKHkyLXkxKSk7XG5cdH0sXG5cdGZsYXREaXN0YW5jZTogZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIpe1xuXHRcdHZhciB4RGlzdCA9IE1hdGguYWJzKHgxIC0geDIpO1xuXHRcdHZhciB5RGlzdCA9IE1hdGguYWJzKHkxIC0geTIpO1xuXHRcdGlmICh4RGlzdCA9PT0geURpc3QpXG5cdFx0XHRyZXR1cm4geERpc3Q7XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIHhEaXN0ICsgeURpc3Q7XG5cdH0sXG5cdGxpbmVEaXN0YW5jZTogZnVuY3Rpb24ocG9pbnQxLCBwb2ludDIpe1xuXHQgIHZhciB4cyA9IDA7XG5cdCAgdmFyIHlzID0gMDtcblx0ICB4cyA9IHBvaW50Mi54IC0gcG9pbnQxLng7XG5cdCAgeHMgPSB4cyAqIHhzO1xuXHQgIHlzID0gcG9pbnQyLnkgLSBwb2ludDEueTtcblx0ICB5cyA9IHlzICogeXM7XG5cdCAgcmV0dXJuIE1hdGguc3FydCggeHMgKyB5cyApO1xuXHR9LFxuXHRkaXJlY3Rpb246IGZ1bmN0aW9uIChhLGIpe1xuXHRcdHJldHVybiB7eDogc2lnbihiLnggLSBhLngpLCB5OiBzaWduKGIueSAtIGEueSl9O1xuXHR9LFxuXHRjaGFuY2U6IGZ1bmN0aW9uIChjaGFuY2Upe1xuXHRcdHJldHVybiB0aGlzLnJhbmQoMCwxMDApIDw9IGNoYW5jZTtcblx0fSxcblx0Y29udGFpbnM6IGZ1bmN0aW9uKGFycmF5LCBlbGVtZW50KXtcblx0ICAgIHJldHVybiBhcnJheS5pbmRleE9mKGVsZW1lbnQpID4gLTE7XG5cdH0sXG5cdHJlbW92ZUZyb21BcnJheTogZnVuY3Rpb24oYXJyYXksIG9iamVjdCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuXHRcdFx0aWYgKGFycmF5W2ldID09IG9iamVjdCl7XG5cdFx0XHRcdHRoaXMucmVtb3ZlRnJvbUFycmF5SW5kZXgoYXJyYXksIGksaSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbW92ZUZyb21BcnJheUluZGV4OiBmdW5jdGlvbihhcnJheSwgZnJvbSwgdG8pIHtcblx0XHR2YXIgcmVzdCA9IGFycmF5LnNsaWNlKCh0byB8fCBmcm9tKSArIDEgfHwgYXJyYXkubGVuZ3RoKTtcblx0XHRhcnJheS5sZW5ndGggPSBmcm9tIDwgMCA/IGFycmF5Lmxlbmd0aCArIGZyb20gOiBmcm9tO1xuXHRcdHJldHVybiBhcnJheS5wdXNoLmFwcGx5KGFycmF5LCByZXN0KTtcblx0fSxcblx0bGluZTogZnVuY3Rpb24gKGEsIGIpe1xuXHRcdHZhciBjb29yZGluYXRlc0FycmF5ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIHgxID0gYS54O1xuXHRcdHZhciB5MSA9IGEueTtcblx0XHR2YXIgeDIgPSBiLng7XG5cdFx0dmFyIHkyID0gYi55O1xuXHQgICAgdmFyIGR4ID0gTWF0aC5hYnMoeDIgLSB4MSk7XG5cdCAgICB2YXIgZHkgPSBNYXRoLmFicyh5MiAtIHkxKTtcblx0ICAgIHZhciBzeCA9ICh4MSA8IHgyKSA/IDEgOiAtMTtcblx0ICAgIHZhciBzeSA9ICh5MSA8IHkyKSA/IDEgOiAtMTtcblx0ICAgIHZhciBlcnIgPSBkeCAtIGR5O1xuXHQgICAgY29vcmRpbmF0ZXNBcnJheS5wdXNoKHt4OiB4MSwgeTogeTF9KTtcblx0ICAgIHdoaWxlICghKCh4MSA9PSB4MikgJiYgKHkxID09IHkyKSkpIHtcblx0ICAgIFx0dmFyIGUyID0gZXJyIDw8IDE7XG5cdCAgICBcdGlmIChlMiA+IC1keSkge1xuXHQgICAgXHRcdGVyciAtPSBkeTtcblx0ICAgIFx0XHR4MSArPSBzeDtcblx0ICAgIFx0fVxuXHQgICAgXHRpZiAoZTIgPCBkeCkge1xuXHQgICAgXHRcdGVyciArPSBkeDtcblx0ICAgIFx0XHR5MSArPSBzeTtcblx0ICAgIFx0fVxuXHQgICAgXHRjb29yZGluYXRlc0FycmF5LnB1c2goe3g6IHgxLCB5OiB5MX0pO1xuXHQgICAgfVxuXHQgICAgcmV0dXJuIGNvb3JkaW5hdGVzQXJyYXk7XG5cdH1cbn0iLCJmdW5jdGlvbiBWZWluR2VuZXJhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcbnZhciBMZXZlbCA9IHJlcXVpcmUoJy4vTGV2ZWwuY2xhc3MnKTtcbnZhciBDQSA9IHJlcXVpcmUoJy4vQ0EnKTtcblxuVmVpbkdlbmVyYXRvci5wcm90b3R5cGUgPSB7XG5cdHRyYWNlVmVpbnM6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdHZhciB2ZWluTWFwID0gdGhpcy5jcmVhdGVWZWluTWFwKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMuc2VlZFZlaW5zKHZlaW5NYXApO1xuXHRcdHZlaW5NYXAgPSB0aGlzLmdyb3dWZWlucyh2ZWluTWFwKTtcblx0XHR0aGlzLmFwcGx5VmVpbnMobGV2ZWwsIHZlaW5NYXApO1xuXHR9LFxuXHRjcmVhdGVWZWluTWFwOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHR2YXIgcmV0ID0gW107XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBsZXZlbC5jZWxscy5sZW5ndGg7IHgrKyl7XG5cdFx0XHRyZXRbeF0gPSBbXTtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgbGV2ZWwuY2VsbHNbeF0ubGVuZ3RoOyB5Kyspe1xuXHRcdFx0XHRyZXRbeF1beV0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRzZWVkVmVpbnM6IGZ1bmN0aW9uKHZlaW5NYXApe1xuXHRcdHZhciBzZWVkcyA9ICh2ZWluTWFwLmxlbmd0aCAqIHZlaW5NYXBbMF0ubGVuZ3RoKSAvIDE2O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VlZHM7IGkrKyl7XG5cdFx0XHR2YXIgcG9pbnQgPSB7XG5cdFx0XHRcdHg6IE1hdGgucm91bmQoVXRpbC5yYW5kKDEsIHZlaW5NYXAubGVuZ3RoLTIpKSxcblx0XHRcdFx0eTogTWF0aC5yb3VuZChVdGlsLnJhbmQoMSwgdmVpbk1hcFswXS5sZW5ndGgtMikpXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWluZXJhbCA9IFV0aWwucmFuZCgxLDIpO1xuXHRcdFx0c3dpdGNoIChtaW5lcmFsKXtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dmVpbk1hcFtwb2ludC54XVtwb2ludC55XSA9ICdncmF5Um9jayc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR2ZWluTWFwW3BvaW50LnhdW3BvaW50LnldID0gJ2RhcmtSb2NrJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRncm93VmVpbnM6IGZ1bmN0aW9uKHZlaW5NYXApe1xuXHRcdHZlaW5NYXAgPSBDQS5ydW5DQSh2ZWluTWFwLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2dyYXlSb2NrJ10gPiAwICYmIFV0aWwuY2hhbmNlKDgwKSlcblx0XHRcdFx0cmV0dXJuICdncmF5Um9jayc7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMywgdHJ1ZSk7XG5cdFx0dmVpbk1hcCA9IENBLnJ1bkNBKHZlaW5NYXAsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snZGFya1JvY2snXSA+IDAgJiYgVXRpbC5jaGFuY2UoODApKVxuXHRcdFx0XHRyZXR1cm4gJ2RhcmtSb2NrJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAzLCB0cnVlKTtcblx0XHRyZXR1cm4gdmVpbk1hcDtcblx0fSxcblx0YXBwbHlWZWluczogZnVuY3Rpb24obGV2ZWwsIHZlaW5NYXApe1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgbGV2ZWwuY2VsbHMubGVuZ3RoOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBsZXZlbC5jZWxsc1t4XS5sZW5ndGg7IHkrKyl7XG5cdFx0XHRcdGlmIChsZXZlbC5jZWxsc1t4XVt5XSA9PSAnc29saWRSb2NrJyl7XG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbeF1beV0gPSB2ZWluTWFwW3hdW3ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVmVpbkdlbmVyYXRvcjsiLCJ3aW5kb3cuR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9HZW5lcmF0b3IuY2xhc3MnKTtcbndpbmRvdy5DYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vQ2FudmFzUmVuZGVyZXIuY2xhc3MnKTtcbndpbmRvdy5LcmFtZ2luZUV4cG9ydGVyID0gcmVxdWlyZSgnLi9LcmFtZ2luZUV4cG9ydGVyLmNsYXNzJyk7Il19
