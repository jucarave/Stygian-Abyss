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
}

var FirstLevelGenerator = require('./FirstLevelGenerator.class');
var SecondLevelGenerator = require('./SecondLevelGenerator.class');
var ThirdLevelGenerator = require('./ThirdLevelGenerator.class');
var MonsterPopulator = require('./MonsterPopulator.class');
var ItemPopulator = require('./ItemPopulator.class');

Generator.prototype = {
	generateLevel: function(depth){
		var sketch = this.firstLevelGenerator.generateLevel(depth);
		var level = this.secondLevelGenerator.fillLevel(sketch);
		this.thirdLevelGenerator.fillLevel(sketch, level);
		this.secondLevelGenerator.frameLevel(sketch, level);
		this.monsterPopulator.populateLevel(sketch, level);
		this.itemPopulator.populateLevel(sketch, level);
		return {
			sketch: sketch,
			level: level
		}
	}
}

module.exports = Generator;
},{"./FirstLevelGenerator.class":"/home/administrator/git/stygiangen/src/FirstLevelGenerator.class.js","./ItemPopulator.class":"/home/administrator/git/stygiangen/src/ItemPopulator.class.js","./MonsterPopulator.class":"/home/administrator/git/stygiangen/src/MonsterPopulator.class.js","./SecondLevelGenerator.class":"/home/administrator/git/stygiangen/src/SecondLevelGenerator.class.js","./ThirdLevelGenerator.class":"/home/administrator/git/stygiangen/src/ThirdLevelGenerator.class.js"}],"/home/administrator/git/stygiangen/src/ItemPopulator.class.js":[function(require,module,exports){
function ItemPopulator(config){
	this.config = config;
}

var Util = require('./Utils');

ItemPopulator.prototype = {
	populateLevel: function(sketch, level){
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
		{code: 'dagger', rarity: 500},
//		{code: 'oilFlask', rarity: 1400},
		{code: 'staff', rarity: 350},
		{code: 'sling', rarity: 280},
		{code: 'mace', rarity: 70},
		{code: 'axe', rarity: 31},
		{code: 'bow', rarity: 28},
		{code: 'sword', rarity: 350},
//		{code: 'halberd', rarity: 23},
		{code: 'crossbow', rarity: 11},
//		{code: 'magicAxe', rarity: 5},
//		{code: 'magicBow', rarity: 4},
//		{code: 'magicSword', rarity: 4},
//		{code: 'magicWand', rarity: 2},
//		{code: 'cloth', rarity: 140},
		{code: 'leather', rarity: 35},
		{code: 'chain', rarity: 12},
		{code: 'plate', rarity: 4},
//		{code: 'magicChain', rarity: 2},
//		{code: 'magicPlate', rarity: 1}
		{code: 'cure', rarity: 1000, depth: 1},
		{code: 'heal', rarity: 1000, depth: 1},
		{code: 'redPotion', rarity: 1000, depth: 1},
		{code: 'yellowPotion', rarity: 1000, depth: 1},
		{code: 'light', rarity: 1000, depth: 2},
		{code: 'missile', rarity: 1000, depth: 3},
		{code: 'iceball', rarity: 500, depth: 4},
		//{code: 'repel', rarity: 500, depth: 5},
		{code: 'blink', rarity: 333, depth: 5},
		{code: 'fireball', rarity: 333, depth: 6},
		{code: 'protection', rarity: 250, depth: 6},
		{code: 'time', rarity: 200, depth: 7},
		{code: 'sleep', rarity: 200, depth: 7},
		//{code: 'jinx', rarity: 166, depth: 8},
		//{code: 'tremor', rarity: 166, depth: 8},
		{code: 'kill', rarity: 142, depth: 8}
	],
	getAnItem: function(){
		var number = Util.rand(0, this.generationChanceTotal);
		for (var i = 0; i < this.thresholds.length; i++){
			if (number <= this.thresholds[i].threshold)
				return this.thresholds[i].item.code;
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
},{}],"/home/administrator/git/stygiangen/src/WebTest.js":[function(require,module,exports){
window.Generator = require('./Generator.class');
window.CanvasRenderer = require('./CanvasRenderer.class');
window.KramgineExporter = require('./KramgineExporter.class');
},{"./CanvasRenderer.class":"/home/administrator/git/stygiangen/src/CanvasRenderer.class.js","./Generator.class":"/home/administrator/git/stygiangen/src/Generator.class.js","./KramgineExporter.class":"/home/administrator/git/stygiangen/src/KramgineExporter.class.js"}]},{},["/home/administrator/git/stygiangen/src/WebTest.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvQ0EuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9DYW52YXNSZW5kZXJlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0ZpcnN0TGV2ZWxHZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9HZW5lcmF0b3IuY2xhc3MuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9JdGVtUG9wdWxhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvS3JhbWdpbmVFeHBvcnRlci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL0xldmVsLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvTW9uc3RlclBvcHVsYXRvci5jbGFzcy5qcyIsIi9ob21lL2FkbWluaXN0cmF0b3IvZ2l0L3N0eWdpYW5nZW4vc3JjL1NlY29uZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvU3BsaXR0ZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9UaGlyZExldmVsR2VuZXJhdG9yLmNsYXNzLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRvci9naXQvc3R5Z2lhbmdlbi9zcmMvVXRpbHMuanMiLCIvaG9tZS9hZG1pbmlzdHJhdG9yL2dpdC9zdHlnaWFuZ2VuL3NyYy9XZWJUZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdHJ1bkNBOiBmdW5jdGlvbihtYXAsIHRyYW5zZm9ybUZ1bmN0aW9uLCB0aW1lcywgY3Jvc3Mpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGltZXM7IGkrKyl7XG5cdFx0XHR2YXIgbmV3TWFwID0gW107XG5cdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IG1hcC5sZW5ndGg7IHgrKyl7XG5cdFx0XHRcdG5ld01hcFt4XSA9IFtdO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXAubGVuZ3RoOyB4Kyspe1xuXHRcdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IG1hcFt4XS5sZW5ndGg7IHkrKyl7XG5cdFx0XHRcdFx0dmFyIHN1cnJvdW5kaW5nTWFwID0gW107XG5cdFx0XHRcdFx0Zm9yICh2YXIgeHggPSB4LTE7IHh4IDw9IHgrMTsgeHgrKyl7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciB5eSA9IHktMTsgeXkgPD0geSsxOyB5eSsrKXtcblx0XHRcdFx0XHRcdFx0aWYgKGNyb3NzICYmICEoeHggPT0geCB8fCB5eSA9PSB5KSlcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0aWYgKHh4ID4gMCAmJiB4eCA8IG1hcC5sZW5ndGggJiYgeXkgPiAwICYmIHl5IDwgbWFwW3hdLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNlbGwgPSBtYXBbeHhdW3l5XTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoc3Vycm91bmRpbmdNYXBbY2VsbF0pXG5cdFx0XHRcdFx0XHRcdFx0XHRzdXJyb3VuZGluZ01hcFtjZWxsXSsrO1xuXHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHN1cnJvdW5kaW5nTWFwW2NlbGxdID0gMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgbmV3Q2VsbCA9IHRyYW5zZm9ybUZ1bmN0aW9uKG1hcFt4XVt5XSwgc3Vycm91bmRpbmdNYXApO1xuXHRcdFx0XHRcdGlmIChuZXdDZWxsKXtcblx0XHRcdFx0XHRcdG5ld01hcFt4XVt5XSA9IG5ld0NlbGw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5ld01hcFt4XVt5XSA9IG1hcFt4XVt5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1hcCA9IG5ld01hcDtcblx0XHR9XG5cdFx0cmV0dXJuIG1hcDtcblx0fVxufSIsImZ1bmN0aW9uIENhbnZhc1JlbmRlcmVyKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUgPSB7XG5cdGRyYXdTa2V0Y2g6IGZ1bmN0aW9uKGxldmVsLCBjYW52YXMsIG92ZXJsYXkpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0Y29udGV4dC5mb250PVwiMTZweCBBdmF0YXJcIjtcblx0XHRpZiAoIW92ZXJsYXkpXG5cdFx0XHRjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdHZhciB6b29tID0gODtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gbGV2ZWwuYXJlYXNbaV07XG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y29udGV4dC5yZWN0KGFyZWEueCAqIHpvb20sIGFyZWEueSAqIHpvb20sIGFyZWEudyAqIHpvb20sIGFyZWEuaCAqIHpvb20pO1xuXHRcdFx0aWYgKCFvdmVybGF5KXtcblx0XHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSAneWVsbG93Jztcblx0XHRcdFx0Y29udGV4dC5maWxsKCk7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG5cdFx0XHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XG5cdFx0XHR2YXIgYXJlYURlc2NyaXB0aW9uID0gJyc7XG5cdFx0XHRpZiAoYXJlYS5hcmVhVHlwZSA9PSAncm9vbXMnKXtcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uID0gXCJEdW5nZW9uXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFyZWEuZmxvb3IgPT0gJ2Zha2VXYXRlcicpeyBcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uID0gXCJMYWdvb25cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFyZWFEZXNjcmlwdGlvbiA9IFwiQ2F2ZXJuXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJlYS5oYXNFeGl0KXtcblx0XHRcdFx0YXJlYURlc2NyaXB0aW9uICs9IFwiIChkKVwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZWEuaGFzRW50cmFuY2Upe1xuXHRcdFx0XHRhcmVhRGVzY3JpcHRpb24gKz0gXCIgKHUpXCI7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG5cdFx0XHRjb250ZXh0LmZpbGxUZXh0KGFyZWFEZXNjcmlwdGlvbiwoYXJlYS54KSogem9vbSArIDUsKGFyZWEueSApKiB6b29tICsgMjApO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBhcmVhLmJyaWRnZXMubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2pdO1xuXHRcdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRjb250ZXh0LnJlY3QoKGJyaWRnZS54KSAqIHpvb20gLyotIHpvb20gLyAyKi8sIChicmlkZ2UueSkgKiB6b29tIC8qLSB6b29tIC8gMiovLCB6b29tLCB6b29tKTtcblx0XHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSAyO1xuXHRcdFx0XHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG5cdFx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRkcmF3TGV2ZWw6IGZ1bmN0aW9uKGxldmVsLCBjYW52YXMpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0Y29udGV4dC5mb250PVwiMTJweCBHZW9yZ2lhXCI7XG5cdFx0Y29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHR2YXIgem9vbSA9IDg7XG5cdFx0dmFyIGNlbGxzID0gbGV2ZWwuY2VsbHM7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb25maWcuTEVWRUxfSEVJR0hUOyB5Kyspe1xuXHRcdFx0XHR2YXIgY29sb3IgPSAnI0ZGRkZGRic7XG5cdFx0XHRcdHZhciBjZWxsID0gY2VsbHNbeF1beV07XG5cdFx0XHRcdGlmIChjZWxsID09PSAnd2F0ZXInKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDAwMEZGJztcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09PSAnbGF2YScpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyNGRjAwMDAnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT09ICdmYWtlV2F0ZXInKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDAwMEZGJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdzb2xpZFJvY2snKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjNTk0QjJEJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdjYXZlcm5GbG9vcicpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyM4NzY0MTgnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2Rvd25zdGFpcnMnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjRkYwMDAwJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICd1cHN0YWlycycpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyMwMEZGMDAnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3N0b25lV2FsbCcpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyNCQkJCQkInO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3N0b25lRmxvb3InKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjNjY2NjY2Jztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdjb3JyaWRvcicpe1xuXHRcdFx0XHRcdGNvbG9yID0gJyNGRjAwMDAnO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3BhZGRpbmcnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjMDBGRjAwJztcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdicmlkZ2UnKXtcblx0XHRcdFx0XHRjb2xvciA9ICcjOTQ2ODAwJztcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuXHRcdFx0XHRjb250ZXh0LmZpbGxSZWN0KHggKiB6b29tLCB5ICogem9vbSwgem9vbSwgem9vbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgZW5lbXkgPSBsZXZlbC5lbmVtaWVzW2ldO1xuXHRcdFx0dmFyIGNvbG9yID0gJyNGRkZGRkYnO1xuXHRcdFx0c3dpdGNoIChlbmVteS5jb2RlKXtcblx0XHRcdGNhc2UgJ2JhdCc6XG5cdFx0XHRcdGNvbG9yID0gJyNFRUVFRUUnO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xhdmFMaXphcmQnOlxuXHRcdFx0XHRjb2xvciA9ICcjMDBGRjg4Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdkYWVtb24nOlxuXHRcdFx0XHRjb2xvciA9ICcjRkY4ODAwJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuXHRcdFx0Y29udGV4dC5maWxsUmVjdChlbmVteS54ICogem9vbSwgZW5lbXkueSAqIHpvb20sIHpvb20sIHpvb20pO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLml0ZW1zLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBpdGVtID0gbGV2ZWwuaXRlbXNbaV07XG5cdFx0XHR2YXIgY29sb3IgPSAnI0ZGRkZGRic7XG5cdFx0XHRzd2l0Y2ggKGl0ZW0uY29kZSl7XG5cdFx0XHRjYXNlICdkYWdnZXInOlxuXHRcdFx0XHRjb2xvciA9ICcjRUVFRUVFJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsZWF0aGVyQXJtb3InOlxuXHRcdFx0XHRjb2xvciA9ICcjMDBGRjg4Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuXHRcdFx0Y29udGV4dC5maWxsUmVjdChpdGVtLnggKiB6b29tLCBpdGVtLnkgKiB6b29tLCB6b29tLCB6b29tKTtcblx0XHR9XG5cdH0sXG5cdGRyYXdMZXZlbFdpdGhJY29uczogZnVuY3Rpb24obGV2ZWwsIGNhbnZhcyl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhcyk7XG5cdFx0dmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRjb250ZXh0LmZvbnQ9XCIxMnB4IEdlb3JnaWFcIjtcblx0XHRjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdHZhciB6b29tID0gODtcblx0XHR2YXIgd2F0ZXIgPSBuZXcgSW1hZ2UoKTtcblx0XHR3YXRlci5zcmMgPSAnaW1nL3dhdGVyLnBuZyc7XG5cdFx0dmFyIGZha2VXYXRlciA9IG5ldyBJbWFnZSgpO1xuXHRcdGZha2VXYXRlci5zcmMgPSAnaW1nL3dhdGVyLnBuZyc7XG5cdFx0dmFyIHNvbGlkUm9jayA9IG5ldyBJbWFnZSgpO1xuXHRcdHNvbGlkUm9jay5zcmMgPSAnaW1nL3NvbGlkUm9jay5wbmcnO1xuXHRcdHZhciBjYXZlcm5GbG9vciA9IG5ldyBJbWFnZSgpO1xuXHRcdGNhdmVybkZsb29yLnNyYyA9ICdpbWcvY2F2ZXJuRmxvb3IucG5nJztcblx0XHR2YXIgZG93bnN0YWlycyA9IG5ldyBJbWFnZSgpO1xuXHRcdGRvd25zdGFpcnMuc3JjID0gJ2ltZy9kb3duc3RhaXJzLnBuZyc7XG5cdFx0dmFyIHVwc3RhaXJzID0gbmV3IEltYWdlKCk7XG5cdFx0dXBzdGFpcnMuc3JjID0gJ2ltZy91cHN0YWlycy5wbmcnO1xuXHRcdHZhciBzdG9uZVdhbGwgPSBuZXcgSW1hZ2UoKTtcblx0XHRzdG9uZVdhbGwuc3JjID0gJ2ltZy9zdG9uZVdhbGwucG5nJztcblx0XHR2YXIgc3RvbmVGbG9vciA9IG5ldyBJbWFnZSgpO1xuXHRcdHN0b25lRmxvb3Iuc3JjID0gJ2ltZy9zdG9uZUZsb29yLnBuZyc7XG5cdFx0dmFyIGJyaWRnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdGJyaWRnZS5zcmMgPSAnaW1nL2JyaWRnZS5wbmcnO1xuXHRcdHZhciBsYXZhID0gbmV3IEltYWdlKCk7XG5cdFx0bGF2YS5zcmMgPSAnaW1nL2xhdmEucG5nJztcblx0XHR2YXIgYmF0ID0gbmV3IEltYWdlKCk7XG5cdFx0YmF0LnNyYyA9ICdpbWcvYmF0LnBuZyc7XG5cdFx0dmFyIGxhdmFMaXphcmQgPSBuZXcgSW1hZ2UoKTtcblx0XHRsYXZhTGl6YXJkLnNyYyA9ICdpbWcvbGF2YUxpemFyZC5wbmcnO1xuXHRcdHZhciBkYWVtb24gPSBuZXcgSW1hZ2UoKTtcblx0XHRkYWVtb24uc3JjID0gJ2ltZy9kYWVtb24ucG5nJztcblx0XHR2YXIgdHJlYXN1cmUgPSBuZXcgSW1hZ2UoKTtcblx0XHR0cmVhc3VyZS5zcmMgPSAnaW1nL3RyZWFzdXJlLnBuZyc7XG5cdFx0dmFyIHRpbGVzID0ge1xuXHRcdFx0d2F0ZXI6IHdhdGVyLFxuXHRcdFx0ZmFrZVdhdGVyOiBmYWtlV2F0ZXIsXG5cdFx0XHRzb2xpZFJvY2s6IHNvbGlkUm9jayxcblx0XHRcdGNhdmVybkZsb29yOiBjYXZlcm5GbG9vcixcblx0XHRcdGRvd25zdGFpcnM6IGRvd25zdGFpcnMsXG5cdFx0XHR1cHN0YWlyczogdXBzdGFpcnMsXG5cdFx0XHRzdG9uZVdhbGw6IHN0b25lV2FsbCxcblx0XHRcdHN0b25lRmxvb3I6IHN0b25lRmxvb3IsXG5cdFx0XHRicmlkZ2U6IGJyaWRnZSxcblx0XHRcdGxhdmE6IGxhdmEsXG5cdFx0XHRiYXQ6IGJhdCxcblx0XHRcdGxhdmFMaXphcmQ6IGxhdmFMaXphcmQsXG5cdFx0XHRkYWVtb246IGRhZW1vbixcblx0XHRcdHRyZWFzdXJlOiB0cmVhc3VyZVxuXHRcdH1cblx0ICAgIHZhciBjZWxscyA9IGxldmVsLmNlbGxzO1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdFx0dmFyIGNlbGwgPSBjZWxsc1t4XVt5XTsgXG5cdFx0XHRcdGNvbnRleHQuZHJhd0ltYWdlKHRpbGVzW2NlbGxdLCB4ICogMTYsIHkgKiAxNik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgZW5lbXkgPSBsZXZlbC5lbmVtaWVzW2ldO1xuXHRcdFx0Y29udGV4dC5kcmF3SW1hZ2UodGlsZXNbZW5lbXkuY29kZV0sIGVuZW15LnggKiAxNiwgZW5lbXkueSAqIDE2KTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbC5pdGVtcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgaXRlbSA9IGxldmVsLml0ZW1zW2ldO1xuXHRcdFx0Y29udGV4dC5kcmF3SW1hZ2UodGlsZXNbJ3RyZWFzdXJlJ10sIGl0ZW0ueCAqIDE2LCBpdGVtLnkgKiAxNik7XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzUmVuZGVyZXI7IiwiZnVuY3Rpb24gRmlyc3RMZXZlbEdlbmVyYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG52YXIgU3BsaXR0ZXIgPSByZXF1aXJlKCcuL1NwbGl0dGVyJyk7XG5cbkZpcnN0TGV2ZWxHZW5lcmF0b3IucHJvdG90eXBlID0ge1xuXHRMQVZBX0NIQU5DRTogICAgIFsxMDAsICAwLCAyMCwgIDAsMTAwLCAxMCwgNTAsMTAwXSxcblx0V0FURVJfQ0hBTkNFOiAgICBbICAwLDEwMCwgMTAsMTAwLCAgMCwgNTAsICAwLCAgMF0sXG5cdENBVkVSTl9DSEFOQ0U6ICAgWyA4MCwgODAsIDIwLCAyMCwgNjAsIDkwLCAxMCwgNTBdLFxuXHRMQUdPT05fQ0hBTkNFOiAgIFsgIDAsIDEwLCAxMCwgMjAsICAwLCAzMCwgIDAsICAwXSxcblx0V0FMTExFU1NfQ0hBTkNFOiBbIDUwLCAxMCwgODAsIDkwLCAxMCwgOTAsIDEwLCA1MF0sXG5cdEhFSUdIVDogICAgICAgICAgWyAgMSwgIDIsICAxLCAgMSwgIDEsICAyLCAgMiwgIDNdLFxuXHRWRVJNSU46IFtcblx0ICAgICAgICAgWydzcGlkZXInLCAncmF0J10sXG5cdCAgICAgICAgIFsnYmF0JywgJ3JhdCddLFxuXHQgICAgICAgICBbJ3NwaWRlciddLFxuXHQgICAgICAgICBbJ2JhdCddLFxuXHQgICAgICAgICBbJ21vbmdiYXQnXSxcblx0ICAgICAgICAgWydoZWFkbGVzcyddLFxuXHQgICAgICAgICBbJ2hlYWRsZXNzJywgJ21vbmdiYXQnXSxcblx0ICAgICAgICAgWydoZWFkbGVzcycsICdza2VsZXRvbiddXG5cdCAgICAgICAgXSxcblx0R0FOR1M6IFtcblx0XHRbIC8vIExldmVsIDFcblx0XHRcdHtib3NzOiAnZGFlbW9uJywgbWluaW9uczogWydtb25nYmF0J10sIHF1YW50aXR5OiAyfSxcblx0XHRcdHttaW5pb25zOiBbJ21vbmdiYXQnXSwgcXVhbnRpdHk6IDJ9LFxuXHRcdFx0e21pbmlvbnM6IFsnbGF2YUxpemFyZCddLCBxdWFudGl0eTogMn0sXG5cdFx0XHR7Ym9zczogJ2h5ZHJhJywgbWluaW9uczogWydtb25nYmF0J10sIHF1YW50aXR5OiAyfVxuXHRcdF0sXG5cdFx0WyAvLyBMZXZlbCAyXG5cdFx0XHR7Ym9zczogJ2RhZW1vbicsIG1pbmlvbnM6IFsnc2VhU2VycGVudCcsICdvY3RvcHVzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnaHlkcmEnLCBtaW5pb25zOiBbJ3NlYVNlcnBlbnQnLCAnb2N0b3B1cyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnc2VhU2VycGVudCcsICdvY3RvcHVzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ3NlYVNlcnBlbnQnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsnb2N0b3B1cyddLCBxdWFudGl0eTogM31cblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgM1xuXHRcdFx0e21pbmlvbnM6IFsnZGFlbW9uJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydkYWVtb24nXSwgcXVhbnRpdHk6IDJ9XG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDRcblx0XHRcdHtib3NzOiAnZ2F6ZXInLCBtaW5pb25zOiBbJ2hlYWRsZXNzJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnbGljaGUnLCBtaW5pb25zOiBbJ2dob3N0J10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHtib3NzOiAnZGFlbW9uJywgbWluaW9uczogWydnYXplcicsICdncmVtbGluJ10sIHF1YW50aXR5OiAzfSxcblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgNVxuXHRcdFx0e21pbmlvbnM6IFsnZHJhZ29uJywgJ3pvcm4nLCAnYmFscm9uJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ3JlYXBlcicsICdnYXplciddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnaGVhZGxlc3MnXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e2Jvc3M6ICd6b3JuJywgbWluaW9uczogWydoZWFkbGVzcyddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7bWluaW9uczogWydkcmFnb24nLCAnbGF2YUxpemFyZCddLCBxdWFudGl0eTogM30sXG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDZcblx0XHRcdHttaW5pb25zOiBbJ3JlYXBlciddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnZGFlbW9uJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHthcmVhVHlwZTogJ2NhdmUnLCBtaW5pb25zOiBbJ2JhdCddLCBxdWFudGl0eTogNX0sXG5cdFx0XHR7YXJlYVR5cGU6ICdjYXZlJywgbWluaW9uczogWydzZWFTZXJwZW50J10sIHF1YW50aXR5OiA1fSxcblx0XHRcdHtib3NzOiAnYmFscm9uJywgbWluaW9uczogWydoeWRyYSddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2JhbHJvbicsIG1pbmlvbnM6IFsnZXZpbE1hZ2UnXSwgcXVhbnRpdHk6IDN9XG5cdFx0XSxcblx0XHRbIC8vIExldmVsIDdcblx0XHRcdHttaW5pb25zOiBbJ2hlYWRsZXNzJ10sIHF1YW50aXR5OiA4fSxcblx0XHRcdHttaW5pb25zOiBbJ2h5ZHJhJ10sIHF1YW50aXR5OiAzfSxcblx0XHRcdHttaW5pb25zOiBbJ3NrZWxldG9uJywgJ3dpc3AnLCAnZ2hvc3QnXSwgcXVhbnRpdHk6IDZ9LFxuXHRcdFx0e2Jvc3M6ICdiYWxyb24nLCBtaW5pb25zOiBbJ3NrZWxldG9uJ10sIHF1YW50aXR5OiAxMH1cblx0XHRdLFxuXHRcdFsgLy8gTGV2ZWwgOFxuXHRcdFx0e21pbmlvbnM6IFsnZHJhZ29uJywgJ2RhZW1vbicsICdiYWxyb24nXSwgcXVhbnRpdHk6IDN9LFxuXHRcdFx0e21pbmlvbnM6IFsnd2FycmlvcicsICdtYWdlJywgJ2JhcmQnLCAnZHJ1aWQnLCAndGlua2VyJywgJ3BhbGFkaW4nLCAnc2hlcGhlcmQnLCAncmFuZ2VyJ10sIHF1YW50aXR5OiA0fSxcblx0XHRcdHttaW5pb25zOiBbJ2dhemVyJywgJ2JhbHJvbiddLCBxdWFudGl0eTogM30sXG5cdFx0XHR7Ym9zczogJ2xpY2hlJywgbWluaW9uczogWydza2VsZXRvbiddLCBxdWFudGl0eTogNH0sXG5cdFx0XHR7bWluaW9uczogWydnaG9zdCcsICd3aXNwJ10sIHF1YW50aXR5OiA0fSxcblx0XHRcdHttaW5pb25zOiBbJ2xhdmFMaXphcmQnXSwgcXVhbnRpdHk6IDV9XG5cdFx0XVx0XHRcblx0XSxcblx0Q0FWRVJOX1dBTExTOiAxLFxuXHRDQVZFUk5fRkxPT1JTOiA0LFxuXHRTVE9ORV9XQUxMUzogNixcblx0U1RPTkVfRkxPT1JTOiAzLFxuXHRnZW5lcmF0ZUxldmVsOiBmdW5jdGlvbihkZXB0aCl7XG5cdFx0dmFyIGhhc1JpdmVyID0gVXRpbC5jaGFuY2UodGhpcy5XQVRFUl9DSEFOQ0VbZGVwdGgtMV0pO1xuXHRcdHZhciBoYXNMYXZhID0gVXRpbC5jaGFuY2UodGhpcy5MQVZBX0NIQU5DRVtkZXB0aC0xXSk7XG5cdFx0dmFyIG1haW5FbnRyYW5jZSA9IGRlcHRoID09IDE7XG5cdFx0dmFyIGFyZWFzID0gdGhpcy5nZW5lcmF0ZUFyZWFzKGRlcHRoLCBoYXNMYXZhKTtcblx0XHR0aGlzLnBsYWNlRXhpdHMoYXJlYXMpO1xuXHRcdHZhciBsZXZlbCA9IHtcblx0XHRcdGhhc1JpdmVyczogaGFzUml2ZXIsXG5cdFx0XHRoYXNMYXZhOiBoYXNMYXZhLFxuXHRcdFx0bWFpbkVudHJhbmNlOiBtYWluRW50cmFuY2UsXG5cdFx0XHRzdHJhdGE6ICdzb2xpZFJvY2snLFxuXHRcdFx0YXJlYXM6IGFyZWFzLFxuXHRcdFx0ZGVwdGg6IGRlcHRoLFxuXHRcdFx0Y2VpbGluZ0hlaWdodDogdGhpcy5IRUlHSFRbZGVwdGgtMV0sXG5cdFx0XHR2ZXJtaW46IHRoaXMuVkVSTUlOW2RlcHRoLTFdXG5cdFx0fSBcblx0XHRyZXR1cm4gbGV2ZWw7XG5cdH0sXG5cdGdlbmVyYXRlQXJlYXM6IGZ1bmN0aW9uKGRlcHRoLCBoYXNMYXZhKXtcblx0XHR2YXIgYmlnQXJlYSA9IHtcblx0XHRcdHg6IDAsXG5cdFx0XHR5OiAwLFxuXHRcdFx0dzogdGhpcy5jb25maWcuTEVWRUxfV0lEVEgsXG5cdFx0XHRoOiB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFRcblx0XHR9XG5cdFx0dmFyIG1heERlcHRoID0gdGhpcy5jb25maWcuU1VCRElWSVNJT05fREVQVEg7XG5cdFx0dmFyIE1JTl9XSURUSCA9IHRoaXMuY29uZmlnLk1JTl9XSURUSDtcblx0XHR2YXIgTUlOX0hFSUdIVCA9IHRoaXMuY29uZmlnLk1JTl9IRUlHSFQ7XG5cdFx0dmFyIE1BWF9XSURUSCA9IHRoaXMuY29uZmlnLk1BWF9XSURUSDtcblx0XHR2YXIgTUFYX0hFSUdIVCA9IHRoaXMuY29uZmlnLk1BWF9IRUlHSFQ7XG5cdFx0dmFyIFNMSUNFX1JBTkdFX1NUQVJUID0gdGhpcy5jb25maWcuU0xJQ0VfUkFOR0VfU1RBUlQ7XG5cdFx0dmFyIFNMSUNFX1JBTkdFX0VORCA9IHRoaXMuY29uZmlnLlNMSUNFX1JBTkdFX0VORDtcblx0XHR2YXIgYXJlYXMgPSBTcGxpdHRlci5zdWJkaXZpZGVBcmVhKGJpZ0FyZWEsIG1heERlcHRoLCBNSU5fV0lEVEgsIE1JTl9IRUlHSFQsIE1BWF9XSURUSCwgTUFYX0hFSUdIVCwgU0xJQ0VfUkFOR0VfU1RBUlQsIFNMSUNFX1JBTkdFX0VORCk7XG5cdFx0U3BsaXR0ZXIuY29ubmVjdEFyZWFzKGFyZWFzLDMpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBhcmVhc1tpXTtcblx0XHRcdHRoaXMuc2V0QXJlYURldGFpbHMoYXJlYSwgZGVwdGgsIGhhc0xhdmEpO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJlYXM7XG5cdH0sXG5cdHNldEFyZWFEZXRhaWxzOiBmdW5jdGlvbihhcmVhLCBkZXB0aCwgaGFzTGF2YSl7XG5cdFx0aWYgKFV0aWwuY2hhbmNlKHRoaXMuQ0FWRVJOX0NIQU5DRVtkZXB0aC0xXSkpe1xuXHRcdFx0YXJlYS5hcmVhVHlwZSA9ICdjYXZlcm4nO1xuXHRcdFx0aWYgKGhhc0xhdmEpe1xuXHRcdFx0XHRhcmVhLmZsb29yID0gJ2NhdmVybkZsb29yJztcblx0XHRcdFx0YXJlYS5jYXZlcm5UeXBlID0gVXRpbC5yYW5kb21FbGVtZW50T2YoWydyb2NreScsJ2JyaWRnZXMnXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoVXRpbC5jaGFuY2UodGhpcy5MQUdPT05fQ0hBTkNFW2RlcHRoLTFdKSl7XG5cdFx0XHRcdFx0YXJlYS5mbG9vciA9ICdmYWtlV2F0ZXInO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFyZWEuZmxvb3IgPSAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFyZWEuY2F2ZXJuVHlwZSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKFsncm9ja3knLCdicmlkZ2VzJywnd2F0ZXJ5J10pO1xuXHRcdFx0fVxuXHRcdFx0YXJlYS5mbG9vclR5cGUgPSBVdGlsLnJhbmQoMSwgdGhpcy5DQVZFUk5fRkxPT1JTKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXJlYS5hcmVhVHlwZSA9ICdyb29tcyc7XG5cdFx0XHRhcmVhLmZsb29yID0gJ3N0b25lRmxvb3InO1xuXHRcdFx0YXJlYS5mbG9vclR5cGUgPSBVdGlsLnJhbmQoMSwgdGhpcy5TVE9ORV9GTE9PUlMpO1xuXHRcdFx0aWYgKFV0aWwuY2hhbmNlKHRoaXMuV0FMTExFU1NfQ0hBTkNFW2RlcHRoLTFdKSl7XG5cdFx0XHRcdGFyZWEud2FsbCA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXJlYS53YWxsID0gJ3N0b25lV2FsbCc7XG5cdFx0XHRcdGFyZWEud2FsbFR5cGUgPSBVdGlsLnJhbmQoMSwgdGhpcy5TVE9ORV9XQUxMUyk7XG5cdFx0XHR9XG5cdFx0XHRhcmVhLmNvcnJpZG9yID0gJ3N0b25lRmxvb3InO1xuXHRcdH1cblx0XHRhcmVhLmVuZW1pZXMgPSBbXTtcblx0XHRhcmVhLml0ZW1zID0gW107XG5cdFx0dmFyIHJhbmRvbUdhbmcgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZih0aGlzLkdBTkdTW2RlcHRoLTFdKTtcblx0XHRhcmVhLmVuZW1pZXMgPSByYW5kb21HYW5nLm1pbmlvbnM7XG5cdFx0YXJlYS5lbmVteUNvdW50ID0gcmFuZG9tR2FuZy5xdWFudGl0eSArIFV0aWwucmFuZCgxLDQpO1xuXHRcdGlmIChyYW5kb21HYW5nKVxuXHRcdFx0YXJlYS5ib3NzID0gcmFuZG9tR2FuZy5ib3NzO1xuXHR9LFxuXHRwbGFjZUV4aXRzOiBmdW5jdGlvbihhcmVhcyl7XG5cdFx0dmFyIGRpc3QgPSBudWxsO1xuXHRcdHZhciBhcmVhMSA9IG51bGw7XG5cdFx0dmFyIGFyZWEyID0gbnVsbDtcblx0XHR2YXIgZnVzZSA9IDEwMDA7XG5cdFx0ZG8ge1xuXHRcdFx0YXJlYTEgPSBVdGlsLnJhbmRvbUVsZW1lbnRPZihhcmVhcyk7XG5cdFx0XHRhcmVhMiA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGFyZWFzKTtcblx0XHRcdGlmIChmdXNlIDwgMCl7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0ZGlzdCA9IFV0aWwubGluZURpc3RhbmNlKGFyZWExLCBhcmVhMik7XG5cdFx0XHRmdXNlLS07XG5cdFx0fSB3aGlsZSAoZGlzdCA8ICh0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCArIHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVCkgLyAzKTtcblx0XHRhcmVhMS5oYXNFeGl0ID0gdHJ1ZTtcblx0XHRhcmVhMi5oYXNFbnRyYW5jZSA9IHRydWU7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaXJzdExldmVsR2VuZXJhdG9yOyIsImZ1bmN0aW9uIEdlbmVyYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0dGhpcy5maXJzdExldmVsR2VuZXJhdG9yID0gbmV3IEZpcnN0TGV2ZWxHZW5lcmF0b3IoY29uZmlnKTtcblx0dGhpcy5zZWNvbmRMZXZlbEdlbmVyYXRvciA9IG5ldyBTZWNvbmRMZXZlbEdlbmVyYXRvcihjb25maWcpO1xuXHR0aGlzLnRoaXJkTGV2ZWxHZW5lcmF0b3IgPSBuZXcgVGhpcmRMZXZlbEdlbmVyYXRvcihjb25maWcpO1xuXHR0aGlzLm1vbnN0ZXJQb3B1bGF0b3IgPSBuZXcgTW9uc3RlclBvcHVsYXRvcihjb25maWcpO1xuXHR0aGlzLml0ZW1Qb3B1bGF0b3IgPSBuZXcgSXRlbVBvcHVsYXRvcihjb25maWcpO1xufVxuXG52YXIgRmlyc3RMZXZlbEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vRmlyc3RMZXZlbEdlbmVyYXRvci5jbGFzcycpO1xudmFyIFNlY29uZExldmVsR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9TZWNvbmRMZXZlbEdlbmVyYXRvci5jbGFzcycpO1xudmFyIFRoaXJkTGV2ZWxHZW5lcmF0b3IgPSByZXF1aXJlKCcuL1RoaXJkTGV2ZWxHZW5lcmF0b3IuY2xhc3MnKTtcbnZhciBNb25zdGVyUG9wdWxhdG9yID0gcmVxdWlyZSgnLi9Nb25zdGVyUG9wdWxhdG9yLmNsYXNzJyk7XG52YXIgSXRlbVBvcHVsYXRvciA9IHJlcXVpcmUoJy4vSXRlbVBvcHVsYXRvci5jbGFzcycpO1xuXG5HZW5lcmF0b3IucHJvdG90eXBlID0ge1xuXHRnZW5lcmF0ZUxldmVsOiBmdW5jdGlvbihkZXB0aCl7XG5cdFx0dmFyIHNrZXRjaCA9IHRoaXMuZmlyc3RMZXZlbEdlbmVyYXRvci5nZW5lcmF0ZUxldmVsKGRlcHRoKTtcblx0XHR2YXIgbGV2ZWwgPSB0aGlzLnNlY29uZExldmVsR2VuZXJhdG9yLmZpbGxMZXZlbChza2V0Y2gpO1xuXHRcdHRoaXMudGhpcmRMZXZlbEdlbmVyYXRvci5maWxsTGV2ZWwoc2tldGNoLCBsZXZlbCk7XG5cdFx0dGhpcy5zZWNvbmRMZXZlbEdlbmVyYXRvci5mcmFtZUxldmVsKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMubW9uc3RlclBvcHVsYXRvci5wb3B1bGF0ZUxldmVsKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMuaXRlbVBvcHVsYXRvci5wb3B1bGF0ZUxldmVsKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRza2V0Y2g6IHNrZXRjaCxcblx0XHRcdGxldmVsOiBsZXZlbFxuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyYXRvcjsiLCJmdW5jdGlvbiBJdGVtUG9wdWxhdG9yKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbHMnKTtcblxuSXRlbVBvcHVsYXRvci5wcm90b3R5cGUgPSB7XG5cdHBvcHVsYXRlTGV2ZWw6IGZ1bmN0aW9uKHNrZXRjaCwgbGV2ZWwpe1xuXHRcdHRoaXMuY2FsY3VsYXRlUmFyaXRpZXMobGV2ZWwuZGVwdGgpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoLmFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBhcmVhID0gc2tldGNoLmFyZWFzW2ldO1xuXHRcdFx0dGhpcy5wb3B1bGF0ZUFyZWEoYXJlYSwgbGV2ZWwpO1xuXHRcdH1cblx0fSxcblx0cG9wdWxhdGVBcmVhOiBmdW5jdGlvbihhcmVhLCBsZXZlbCl7XG5cdFx0dmFyIGl0ZW1zID0gVXRpbC5yYW5kKDAsMik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtczsgaSsrKXtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGxldmVsLmdldEZyZWVQbGFjZShhcmVhLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuZ2V0QW5JdGVtKCk7XG5cdFx0XHRsZXZlbC5hZGRJdGVtKGl0ZW0sIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXHRcdH1cblx0fSxcblx0Y2FsY3VsYXRlUmFyaXRpZXM6IGZ1bmN0aW9uKGRlcHRoKXtcblx0XHR0aGlzLnRocmVzaG9sZHMgPSBbXTtcblx0XHR0aGlzLmdlbmVyYXRpb25DaGFuY2VUb3RhbCA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLklURU1TLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBpdGVtID0gdGhpcy5JVEVNU1tpXTtcblx0XHRcdHZhciBtYWx1cyA9IE1hdGguYWJzKGRlcHRoLWl0ZW0uZGVwdGgpID4gMTtcblx0XHRcdHZhciByYXJpdHkgPSBtYWx1cyA/IGl0ZW0ucmFyaXR5IC8gMiA6IGl0ZW0ucmFyaXR5O1xuXHRcdFx0dGhpcy5nZW5lcmF0aW9uQ2hhbmNlVG90YWwgKz0gcmFyaXR5O1xuXHRcdFx0dGhpcy50aHJlc2hvbGRzLnB1c2goe3RocmVzaG9sZDogdGhpcy5nZW5lcmF0aW9uQ2hhbmNlVG90YWwsIGl0ZW06IGl0ZW19KTtcblx0XHR9XG5cdH0sXG5cdElURU1TOiBbXG5cdFx0e2NvZGU6ICdkYWdnZXInLCByYXJpdHk6IDUwMH0sXG4vL1x0XHR7Y29kZTogJ29pbEZsYXNrJywgcmFyaXR5OiAxNDAwfSxcblx0XHR7Y29kZTogJ3N0YWZmJywgcmFyaXR5OiAzNTB9LFxuXHRcdHtjb2RlOiAnc2xpbmcnLCByYXJpdHk6IDI4MH0sXG5cdFx0e2NvZGU6ICdtYWNlJywgcmFyaXR5OiA3MH0sXG5cdFx0e2NvZGU6ICdheGUnLCByYXJpdHk6IDMxfSxcblx0XHR7Y29kZTogJ2JvdycsIHJhcml0eTogMjh9LFxuXHRcdHtjb2RlOiAnc3dvcmQnLCByYXJpdHk6IDM1MH0sXG4vL1x0XHR7Y29kZTogJ2hhbGJlcmQnLCByYXJpdHk6IDIzfSxcblx0XHR7Y29kZTogJ2Nyb3NzYm93JywgcmFyaXR5OiAxMX0sXG4vL1x0XHR7Y29kZTogJ21hZ2ljQXhlJywgcmFyaXR5OiA1fSxcbi8vXHRcdHtjb2RlOiAnbWFnaWNCb3cnLCByYXJpdHk6IDR9LFxuLy9cdFx0e2NvZGU6ICdtYWdpY1N3b3JkJywgcmFyaXR5OiA0fSxcbi8vXHRcdHtjb2RlOiAnbWFnaWNXYW5kJywgcmFyaXR5OiAyfSxcbi8vXHRcdHtjb2RlOiAnY2xvdGgnLCByYXJpdHk6IDE0MH0sXG5cdFx0e2NvZGU6ICdsZWF0aGVyJywgcmFyaXR5OiAzNX0sXG5cdFx0e2NvZGU6ICdjaGFpbicsIHJhcml0eTogMTJ9LFxuXHRcdHtjb2RlOiAncGxhdGUnLCByYXJpdHk6IDR9LFxuLy9cdFx0e2NvZGU6ICdtYWdpY0NoYWluJywgcmFyaXR5OiAyfSxcbi8vXHRcdHtjb2RlOiAnbWFnaWNQbGF0ZScsIHJhcml0eTogMX1cblx0XHR7Y29kZTogJ2N1cmUnLCByYXJpdHk6IDEwMDAsIGRlcHRoOiAxfSxcblx0XHR7Y29kZTogJ2hlYWwnLCByYXJpdHk6IDEwMDAsIGRlcHRoOiAxfSxcblx0XHR7Y29kZTogJ3JlZFBvdGlvbicsIHJhcml0eTogMTAwMCwgZGVwdGg6IDF9LFxuXHRcdHtjb2RlOiAneWVsbG93UG90aW9uJywgcmFyaXR5OiAxMDAwLCBkZXB0aDogMX0sXG5cdFx0e2NvZGU6ICdsaWdodCcsIHJhcml0eTogMTAwMCwgZGVwdGg6IDJ9LFxuXHRcdHtjb2RlOiAnbWlzc2lsZScsIHJhcml0eTogMTAwMCwgZGVwdGg6IDN9LFxuXHRcdHtjb2RlOiAnaWNlYmFsbCcsIHJhcml0eTogNTAwLCBkZXB0aDogNH0sXG5cdFx0Ly97Y29kZTogJ3JlcGVsJywgcmFyaXR5OiA1MDAsIGRlcHRoOiA1fSxcblx0XHR7Y29kZTogJ2JsaW5rJywgcmFyaXR5OiAzMzMsIGRlcHRoOiA1fSxcblx0XHR7Y29kZTogJ2ZpcmViYWxsJywgcmFyaXR5OiAzMzMsIGRlcHRoOiA2fSxcblx0XHR7Y29kZTogJ3Byb3RlY3Rpb24nLCByYXJpdHk6IDI1MCwgZGVwdGg6IDZ9LFxuXHRcdHtjb2RlOiAndGltZScsIHJhcml0eTogMjAwLCBkZXB0aDogN30sXG5cdFx0e2NvZGU6ICdzbGVlcCcsIHJhcml0eTogMjAwLCBkZXB0aDogN30sXG5cdFx0Ly97Y29kZTogJ2ppbngnLCByYXJpdHk6IDE2NiwgZGVwdGg6IDh9LFxuXHRcdC8ve2NvZGU6ICd0cmVtb3InLCByYXJpdHk6IDE2NiwgZGVwdGg6IDh9LFxuXHRcdHtjb2RlOiAna2lsbCcsIHJhcml0eTogMTQyLCBkZXB0aDogOH1cblx0XSxcblx0Z2V0QW5JdGVtOiBmdW5jdGlvbigpe1xuXHRcdHZhciBudW1iZXIgPSBVdGlsLnJhbmQoMCwgdGhpcy5nZW5lcmF0aW9uQ2hhbmNlVG90YWwpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50aHJlc2hvbGRzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGlmIChudW1iZXIgPD0gdGhpcy50aHJlc2hvbGRzW2ldLnRocmVzaG9sZClcblx0XHRcdFx0cmV0dXJuIHRoaXMudGhyZXNob2xkc1tpXS5pdGVtLmNvZGU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnRocmVzaG9sZHNbMF0uaXRlbS5jb2RlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbVBvcHVsYXRvcjsiLCJmdW5jdGlvbiBLcmFtZ2luZUV4cG9ydGVyKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG5LcmFtZ2luZUV4cG9ydGVyLnByb3RvdHlwZSA9IHtcblx0Z2V0TGV2ZWw6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHR0aGlzLmluaXRUaWxlRGVmcyhsZXZlbC5jZWlsaW5nSGVpZ2h0KTtcblx0XHR2YXIgdGlsZXMgPSB0aGlzLmdldFRpbGVzKCk7XG5cdFx0dmFyIG9iamVjdHMgPSB0aGlzLmdldE9iamVjdHMobGV2ZWwpO1xuXHRcdHZhciBtYXAgPSB0aGlzLmdldE1hcChsZXZlbCwgb2JqZWN0cyk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpbGVzOiB0aWxlcyxcblx0XHRcdG9iamVjdHM6IG9iamVjdHMsXG5cdFx0XHRtYXA6IG1hcFxuXHRcdH07XG5cdH0sXG5cdGluaXRUaWxlRGVmczogZnVuY3Rpb24oY2VpbGluZ0hlaWdodCl7XG5cdFx0dGhpcy50aWxlcyA9IFtdO1xuXHRcdHRoaXMudGlsZXNNYXAgPSBbXTtcblx0XHR0aGlzLnRpbGVzLnB1c2gobnVsbCk7XG5cdFx0dGhpcy5jZWlsaW5nSGVpZ2h0ID0gY2VpbGluZ0hlaWdodDtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfMScsIDQsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF8yJywgNSwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzMnLCA2LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX1dBTExfNCcsIDcsIDAsIDAsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfV0FMTF81JywgOCwgMCwgMCwgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVE9ORV9XQUxMXzYnLCA5LCAwLCAwLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9XQUxMXzEnLCAxMCwgMCwgMCwgMCk7XG5cdFx0XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fRkxPT1JfMScsIDAsIDUsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnQ0FWRVJOX0ZMT09SXzInLCAwLCA2LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0NBVkVSTl9GTE9PUl8zJywgMCwgNywgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdDQVZFUk5fRkxPT1JfNCcsIDAsIDgsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfRkxPT1JfMScsIDAsIDksIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RPTkVfRkxPT1JfMicsIDAsIDEwLCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1NUT05FX0ZMT09SXzMnLCAwLCAxMSwgMywgMCk7XG5cdFx0XG5cdFx0dGhpcy5hZGRUaWxlKCdCUklER0UnLCAwLCA0LCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ1dBVEVSJywgMCwgMTAxLCAzLCAwKTtcblx0XHR0aGlzLmFkZFRpbGUoJ0xBVkEnLCAwLCAxMDMsIDMsIDApO1xuXHRcdHRoaXMuYWRkVGlsZSgnU1RBSVJTX0RPV04nLCAwLCA1MCwgMywgMCk7XG5cdFx0dGhpcy5hZGRUaWxlKCdTVEFJUlNfVVAnLCAwLCA1LCA1MCwgMCk7XG5cdH0sXG5cdGFkZFRpbGU6IGZ1bmN0aW9uIChpZCwgd2FsbFRleHR1cmUsIGZsb29yVGV4dHVyZSwgY2VpbFRleHR1cmUsIGZsb29ySGVpZ2h0KXtcblx0XHR2YXIgdGlsZSA9IHRoaXMuY3JlYXRlVGlsZSh3YWxsVGV4dHVyZSwgZmxvb3JUZXh0dXJlLCBjZWlsVGV4dHVyZSwgZmxvb3JIZWlnaHQsIHRoaXMuY2VpbGluZ0hlaWdodCk7XG5cdFx0dGhpcy50aWxlcy5wdXNoKHRpbGUpO1xuXHRcdHRoaXMudGlsZXNNYXBbaWRdID0gdGhpcy50aWxlcy5sZW5ndGggLSAxO1xuXHR9LFxuXHRnZXRUaWxlOiBmdW5jdGlvbihpZCwgdHlwZSl7XG5cdFx0aWYgKCF0eXBlKVxuXHRcdFx0cmV0dXJuIHRoaXMudGlsZXNNYXBbaWRdO1xuXHRcdHZhciB0aWxlID0gdGhpcy50aWxlc01hcFtpZCtcIl9cIit0eXBlXTtcblx0XHRpZiAodGlsZSlcblx0XHRcdHJldHVybiB0aWxlO1xuXHRcdGVsc2Vcblx0XHRcdHJldHVybiB0aGlzLnRpbGVzTWFwW2lkK1wiXzFcIl07XG5cdH0sXG5cdGNyZWF0ZVRpbGU6IGZ1bmN0aW9uKHdhbGxUZXh0dXJlLCBmbG9vclRleHR1cmUsIGNlaWxUZXh0dXJlLCBmbG9vckhlaWdodCwgaGVpZ2h0KXtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dzogd2FsbFRleHR1cmUsXG5cdFx0XHR5OiBmbG9vckhlaWdodCxcblx0XHRcdGg6IGhlaWdodCxcblx0XHRcdGY6IGZsb29yVGV4dHVyZSxcblx0XHRcdGZ5OiBmbG9vckhlaWdodCxcblx0XHRcdGM6IGNlaWxUZXh0dXJlLFxuXHRcdFx0Y2g6IGhlaWdodCxcblx0XHRcdHNsOiAwLFxuXHRcdFx0ZGlyOiAwXG5cdFx0fTtcblx0fSxcblx0Z2V0VGlsZXM6IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIHRoaXMudGlsZXM7XG5cdH0sXG5cdGdldE9iamVjdHM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHR2YXIgb2JqZWN0cyA9IFtdO1xuXHRcdG9iamVjdHMucHVzaCh7XG5cdFx0XHR4OiBsZXZlbC5zdGFydC54ICsgMC41LFxuXHRcdFx0ejogbGV2ZWwuc3RhcnQueSArIDAuNSxcblx0XHRcdHk6IDAsXG5cdFx0XHRkaXI6IDMsXG5cdFx0XHR0eXBlOiAncGxheWVyJ1xuXHRcdH0pO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgZW5lbXkgPSBsZXZlbC5lbmVtaWVzW2ldO1xuXHRcdFx0dmFyIGVuZW15RGF0YSA9XG5cdFx0XHR7XG5cdCAgICAgICAgICAgIHg6IGVuZW15LnggKyAwLjUsXG5cdCAgICAgICAgICAgIHo6IGVuZW15LnkgKyAwLjUsXG5cdCAgICAgICAgICAgIHk6IDAsXG5cdCAgICAgICAgICAgIHR5cGU6ICdlbmVteScsXG5cdCAgICAgICAgICAgIGVuZW15OiBlbmVteS5jb2RlXG5cdCAgICAgICAgfTtcblx0XHRcdG9iamVjdHMucHVzaChlbmVteURhdGEpO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsLml0ZW1zLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBpdGVtID0gbGV2ZWwuaXRlbXNbaV07XG5cdFx0XHR2YXIgaXRlbURhdGEgPVxuXHRcdFx0e1xuXHQgICAgICAgICAgICB4OiBpdGVtLnggKyAwLjUsXG5cdCAgICAgICAgICAgIHo6IGl0ZW0ueSArIDAuNSxcblx0ICAgICAgICAgICAgeTogMCxcblx0ICAgICAgICAgICAgdHlwZTogJ2l0ZW0nLFxuXHQgICAgICAgICAgICBpdGVtOiBpdGVtLmNvZGVcblx0ICAgICAgICB9O1xuXHRcdFx0b2JqZWN0cy5wdXNoKGl0ZW1EYXRhKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9iamVjdHM7XG5cdH0sXG5cdGdldE1hcDogZnVuY3Rpb24obGV2ZWwsIG9iamVjdHMpe1xuXHRcdHZhciBtYXAgPSBbXTtcblx0XHR2YXIgY2VsbHMgPSBsZXZlbC5jZWxscztcblx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVDsgeSsrKXtcblx0XHRcdG1hcFt5XSA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdFx0dmFyIGNlbGwgPSBjZWxsc1t4XVt5XTtcblx0XHRcdFx0dmFyIGFyZWEgPSBsZXZlbC5nZXRBcmVhKHgseSk7XG5cdFx0XHRcdGlmICghYXJlYS53YWxsVHlwZSlcblx0XHRcdFx0XHRhcmVhLndhbGxUeXBlID0gMTtcblx0XHRcdFx0aWYgKCFhcmVhLmZsb29yVHlwZSlcblx0XHRcdFx0XHRhcmVhLmZsb29yVHlwZSA9IDE7XG5cdFx0XHRcdHZhciBpZCA9IG51bGw7XG5cdFx0XHRcdGlmIChjZWxsID09PSAnd2F0ZXInKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIldBVEVSXCIpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT09ICdmYWtlV2F0ZXInKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIldBVEVSXCIpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3NvbGlkUm9jaycpe1xuXHRcdFx0XHRcdGlkID0gdGhpcy5nZXRUaWxlKFwiQ0FWRVJOX1dBTExcIiwgMSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnY2F2ZXJuRmxvb3InKXsgXG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJDQVZFUk5fRkxPT1JcIiwgYXJlYS5mbG9vclR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2Rvd25zdGFpcnMnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUQUlSU19ET1dOXCIpO1xuXHRcdFx0XHRcdG9iamVjdHMucHVzaCh7XG5cdFx0XHRcdFx0XHR4OiB4ICsgMC41LFxuXHRcdFx0ICAgICAgICAgICAgejogeSArIDAuNSxcblx0XHRcdCAgICAgICAgICAgIHk6IDAsXG5cdFx0XHQgICAgICAgICAgICB0eXBlOiAnc3RhaXJzJyxcblx0XHRcdCAgICAgICAgICAgIGRpcjogJ2Rvd24nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAndXBzdGFpcnMnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUQUlSU19VUFwiKTtcblx0XHRcdFx0XHRpZiAobGV2ZWwuZGVwdGggPiAxKVxuXHRcdFx0XHRcdFx0b2JqZWN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0eDogeCArIDAuNSxcblx0XHRcdFx0ICAgICAgICAgICAgejogeSArIDAuNSxcblx0XHRcdFx0ICAgICAgICAgICAgeTogMCxcblx0XHRcdFx0ICAgICAgICAgICAgdHlwZTogJ3N0YWlycycsXG5cdFx0XHRcdCAgICAgICAgICAgIGRpcjogJ3VwJ1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1lbHNlIGlmIChjZWxsID09PSAnc3RvbmVXYWxsJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVE9ORV9XQUxMXCIsIGFyZWEud2FsbFR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ3N0b25lRmxvb3InKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIlNUT05FX0ZMT09SXCIsYXJlYS5mbG9vclR5cGUpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoY2VsbCA9PT0gJ2NvcnJpZG9yJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJTVE9ORV9GTE9PUlwiLCAxKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdicmlkZ2UnKXtcblx0XHRcdFx0XHRpZCA9IHRoaXMuZ2V0VGlsZShcIkJSSURHRVwiKTtcblx0XHRcdFx0fWVsc2UgaWYgKGNlbGwgPT09ICdsYXZhJyl7XG5cdFx0XHRcdFx0aWQgPSB0aGlzLmdldFRpbGUoXCJMQVZBXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1hcFt5XVt4XSA9IGlkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWFwO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS3JhbWdpbmVFeHBvcnRlcjtcbiIsImZ1bmN0aW9uIExldmVsKGNvbmZpZyl7XG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xufTtcblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG5cbkxldmVsLnByb3RvdHlwZSA9IHtcblx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNlbGxzID0gW107XG5cdFx0dGhpcy5lbmVtaWVzID0gW107XG5cdFx0dGhpcy5lbmVtaWVzTWFwID0ge307XG5cdFx0dGhpcy5pdGVtcyA9IFtdO1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb25maWcuTEVWRUxfV0lEVEg7IHgrKyl7XG5cdFx0XHR0aGlzLmNlbGxzW3hdID0gW107XG5cdFx0fVxuXHR9LFxuXHRhZGRFbmVteTogZnVuY3Rpb24oZW5lbXksIHgsIHkpe1xuXHRcdHZhciBlbmVteSA9IHtcblx0XHRcdGNvZGU6IGVuZW15LFxuXHRcdFx0eDogeCxcblx0XHRcdHk6IHlcblx0XHR9O1xuXHRcdHRoaXMuZW5lbWllcy5wdXNoKGVuZW15KTtcblx0XHR0aGlzLmVuZW1pZXNNYXBbeCtcIl9cIit5XSA9IGVuZW15O1xuXHR9LFxuXHRnZXRFbmVteTogZnVuY3Rpb24oeCx5KXtcblx0XHRyZXR1cm4gdGhpcy5lbmVtaWVzTWFwW3grXCJfXCIreV07XG5cdH0sXG5cdGFkZEl0ZW06IGZ1bmN0aW9uKGl0ZW0sIHgsIHkpe1xuXHRcdHRoaXMuaXRlbXMucHVzaCh7XG5cdFx0XHRjb2RlOiBpdGVtLFxuXHRcdFx0eDogeCxcblx0XHRcdHk6IHlcblx0XHR9KTtcblx0fSxcblx0Z2V0RnJlZVBsYWNlOiBmdW5jdGlvbihhcmVhLCBvbmx5V2F0ZXIsIG5vV2F0ZXIpe1xuXHRcdHZhciB0cmllcyA9IDA7XG5cdFx0d2hpbGUodHJ1ZSl7XG5cdFx0XHR2YXIgcmFuZFBvaW50ID0ge1xuXHRcdFx0XHR4OiBVdGlsLnJhbmQoYXJlYS54LCBhcmVhLngrYXJlYS53LTEpLFxuXHRcdFx0XHR5OiBVdGlsLnJhbmQoYXJlYS55LCBhcmVhLnkrYXJlYS5oLTEpXG5cdFx0XHR9XG5cdFx0XHR2YXIgY2VsbCA9IHRoaXMuY2VsbHNbcmFuZFBvaW50LnhdW3JhbmRQb2ludC55XTsgXG5cdFx0XHRpZiAob25seVdhdGVyKXtcblx0XHRcdFx0aWYgKGNlbGwgPT0gJ3dhdGVyJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRcdHJldHVybiByYW5kUG9pbnQ7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRpZiAodHJpZXMgPiAxMDAwKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gIGVsc2UgaWYgKG5vV2F0ZXIpe1xuXHRcdFx0XHRpZiAoY2VsbCA9PSAnd2F0ZXInIHx8IGNlbGwgPT0gJ2Zha2VXYXRlcicpe1xuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdFx0aWYgKHRyaWVzID4gMTAwMClcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09IGFyZWEuZmxvb3IgfHwgYXJlYS5jb3JyaWRvciAmJiBjZWxsID09IGFyZWEuY29ycmlkb3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT0gYXJlYS5mbG9vciB8fCBhcmVhLmNvcnJpZG9yICYmIGNlbGwgPT0gYXJlYS5jb3JyaWRvciB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdH1cblx0fSxcblx0Z2V0RnJlZVBsYWNlT25MZXZlbDogZnVuY3Rpb24ob25seVdhdGVyLCBub1dhdGVyKXtcblx0XHR2YXIgdHJpZXMgPSAwO1xuXHRcdHdoaWxlKHRydWUpe1xuXHRcdFx0dmFyIHJhbmRQb2ludCA9IHtcblx0XHRcdFx0eDogVXRpbC5yYW5kKDAsIHRoaXMuY2VsbHMubGVuZ3RoIC0gMSksXG5cdFx0XHRcdHk6IFV0aWwucmFuZCgwLCB0aGlzLmNlbGxzWzBdLmxlbmd0aCAtIDEpXG5cdFx0XHR9XG5cdFx0XHR2YXIgY2VsbCA9IHRoaXMuY2VsbHNbcmFuZFBvaW50LnhdW3JhbmRQb2ludC55XTsgXG5cdFx0XHRpZiAob25seVdhdGVyKXtcblx0XHRcdFx0aWYgKGNlbGwgPT0gJ3dhdGVyJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRcdHJldHVybiByYW5kUG9pbnQ7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRpZiAodHJpZXMgPiAxMDAwKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gIGVsc2UgaWYgKG5vV2F0ZXIpe1xuXHRcdFx0XHRpZiAoY2VsbCA9PSAnd2F0ZXInIHx8IGNlbGwgPT0gJ2Zha2VXYXRlcicpe1xuXHRcdFx0XHRcdHRyaWVzKys7XG5cdFx0XHRcdFx0aWYgKHRyaWVzID4gMTAwMClcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIGlmIChjZWxsID09ICdzdG9uZUZsb29yJyB8fCBjZWxsID09ICdjYXZlcm5GbG9vcicpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGNlbGwgPT0gJ3N0b25lRmxvb3InIHx8IGNlbGwgPT0gJ2NhdmVybkZsb29yJyB8fCBjZWxsID09ICdmYWtlV2F0ZXInKVxuXHRcdFx0XHRyZXR1cm4gcmFuZFBvaW50O1xuXHRcdH1cblx0fSxcblx0Z2V0QXJlYTogZnVuY3Rpb24oeCx5KXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJlYXNTa2V0Y2gubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSB0aGlzLmFyZWFzU2tldGNoW2ldO1xuXHRcdFx0aWYgKHggPj0gYXJlYS54ICYmIHggPCBhcmVhLnggKyBhcmVhLndcblx0XHRcdFx0XHQmJiB5ID49IGFyZWEueSAmJiB5IDwgYXJlYS55ICsgYXJlYS5oKVxuXHRcdFx0XHRyZXR1cm4gYXJlYTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsOyIsImZ1bmN0aW9uIE1vbnN0ZXJQb3B1bGF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xuXG5Nb25zdGVyUG9wdWxhdG9yLnByb3RvdHlwZSA9IHtcblx0cG9wdWxhdGVMZXZlbDogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCl7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2guYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBza2V0Y2guYXJlYXNbaV07XG5cdFx0XHRpZiAoYXJlYS5oYXNFbnRyYW5jZSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR0aGlzLnBvcHVsYXRlQXJlYShhcmVhLCBsZXZlbCk7XG5cdFx0fVxuXHRcdHRoaXMucG9wdWxhdGVWZXJtaW4obGV2ZWwpO1xuXHR9LFxuXHRwb3B1bGF0ZVZlcm1pbjogZnVuY3Rpb24oIGxldmVsKXtcblx0XHR2YXIgdHJpZXMgPSAwO1xuXHRcdHZhciB2ZXJtaW4gPSAzMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZlcm1pbjsgaSsrKXtcblx0XHRcdHZhciBtb25zdGVyID0gVXRpbC5yYW5kb21FbGVtZW50T2YobGV2ZWwudmVybWluKTtcblx0XHRcdHZhciBvbmx5V2F0ZXIgPSB0aGlzLmlzV2F0ZXJNb25zdGVyKG1vbnN0ZXIpO1xuXHRcdFx0dmFyIG5vV2F0ZXIgPSAhb25seVdhdGVyICYmICF0aGlzLmlzRmx5aW5nTW9uc3Rlcihtb25zdGVyKTtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGxldmVsLmdldEZyZWVQbGFjZU9uTGV2ZWwob25seVdhdGVyLCBub1dhdGVyKTtcblx0XHRcdGlmIChwb3NpdGlvbil7XG5cdFx0XHRcdGlmIChsZXZlbC5nZXRFbmVteShwb3NpdGlvbi54LCBwb3NpdGlvbi55KSl7XG5cdFx0XHRcdFx0dHJpZXMrKztcblx0XHRcdFx0XHRpZiAodHJpZXMgPCAxMDApe1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0cmllcyA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldmVsLmFkZEVuZW15KG1vbnN0ZXIsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cG9wdWxhdGVBcmVhOiBmdW5jdGlvbihhcmVhLCBsZXZlbCl7XG5cdFx0aWYgKGFyZWEuYm9zcyl7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSwgZmFsc2UsIHRydWUpO1xuXHRcdFx0aWYgKHBvc2l0aW9uKXtcblx0XHRcdFx0bGV2ZWwuYWRkRW5lbXkoYXJlYS5ib3NzLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIHRyaWVzID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWEuZW5lbXlDb3VudDsgaSsrKXtcblx0XHRcdHZhciBtb25zdGVyID0gVXRpbC5yYW5kb21FbGVtZW50T2YoYXJlYS5lbmVtaWVzKTtcblx0XHRcdHZhciBvbmx5V2F0ZXIgPSB0aGlzLmlzV2F0ZXJNb25zdGVyKG1vbnN0ZXIpO1xuXHRcdFx0dmFyIG5vV2F0ZXIgPSAhb25seVdhdGVyICYmICF0aGlzLmlzRmx5aW5nTW9uc3Rlcihtb25zdGVyKTtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGxldmVsLmdldEZyZWVQbGFjZShhcmVhLCBvbmx5V2F0ZXIsIG5vV2F0ZXIpO1xuXHRcdFx0aWYgKHBvc2l0aW9uKXtcblx0XHRcdFx0aWYgKGxldmVsLmdldEVuZW15KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKXtcblx0XHRcdFx0XHR0cmllcysrO1xuXHRcdFx0XHRcdGlmICh0cmllcyA8IDEwMCl7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRyaWVzID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV2ZWwuYWRkRW5lbXkobW9uc3RlciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRpc1dhdGVyTW9uc3RlcjogZnVuY3Rpb24obW9uc3Rlcil7XG5cdFx0cmV0dXJuIG1vbnN0ZXIgPT0gJ29jdG9wdXMnIHx8IG1vbnN0ZXIgPT0gJ3NlYVNlcnBlbnQnOyBcblx0fSxcblx0aXNGbHlpbmdNb25zdGVyOiBmdW5jdGlvbihtb25zdGVyKXtcblx0XHRyZXR1cm4gbW9uc3RlciA9PSAnYmF0JyB8fCBtb25zdGVyID09ICdtb25nYmF0JyB8fCBtb25zdGVyID09ICdnaG9zdCcgfHwgbW9uc3RlciA9PSAnZHJhZ29uJyB8fCBtb25zdGVyID09ICdnYXplcic7IFxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTW9uc3RlclBvcHVsYXRvcjsiLCJmdW5jdGlvbiBTZWNvbmRMZXZlbEdlbmVyYXRvcihjb25maWcpe1xuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG52YXIgTGV2ZWwgPSByZXF1aXJlKCcuL0xldmVsLmNsYXNzJyk7XG52YXIgQ0EgPSByZXF1aXJlKCcuL0NBJyk7XG5cblNlY29uZExldmVsR2VuZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0ZmlsbExldmVsOiBmdW5jdGlvbihza2V0Y2gpe1xuXHRcdHZhciBsZXZlbCA9IG5ldyBMZXZlbCh0aGlzLmNvbmZpZyk7XG5cdFx0bGV2ZWwuaW5pdCgpO1xuXHRcdHRoaXMuZmlsbFN0cmF0YShsZXZlbCwgc2tldGNoKTtcblx0XHRsZXZlbC5jZWlsaW5nSGVpZ2h0ID0gc2tldGNoLmNlaWxpbmdIZWlnaHQ7XG5cdFx0bGV2ZWwuZGVwdGggPSBza2V0Y2guZGVwdGg7XG5cdFx0bGV2ZWwudmVybWluID0gc2tldGNoLnZlcm1pbjtcblx0XHRpZiAoc2tldGNoLmhhc0xhdmEpXG5cdFx0XHR0aGlzLnBsb3RSaXZlcnMobGV2ZWwsIHNrZXRjaCwgJ2xhdmEnKTtcblx0XHRlbHNlIGlmIChza2V0Y2guaGFzUml2ZXJzKVxuXHRcdFx0dGhpcy5wbG90Uml2ZXJzKGxldmVsLCBza2V0Y2gsICd3YXRlcicpO1xuXHRcdHRoaXMuY29weUdlbyhsZXZlbCk7XG5cdFx0cmV0dXJuIGxldmVsO1xuXHR9LFxuXHRmaWxsU3RyYXRhOiBmdW5jdGlvbihsZXZlbCwgc2tldGNoKXtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIOyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQ7IHkrKyl7XG5cdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gc2tldGNoLnN0cmF0YTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNvcHlHZW86IGZ1bmN0aW9uKGxldmVsKXtcblx0XHR2YXIgZ2VvID0gW107XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGdlb1t4XSA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQ7IHkrKyl7XG5cdFx0XHRcdGdlb1t4XVt5XSA9IGxldmVsLmNlbGxzW3hdW3ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRsZXZlbC5nZW8gPSBnZW87XG5cdH0sXG5cdHBsb3RSaXZlcnM6IGZ1bmN0aW9uKGxldmVsLCBza2V0Y2gsIGxpcXVpZCl7XG5cdFx0dGhpcy5wbGFjZVJpdmVybGluZXMobGV2ZWwsIHNrZXRjaCwgbGlxdWlkKTtcblx0XHR0aGlzLmZhdHRlblJpdmVycyhsZXZlbCwgbGlxdWlkKTtcblx0XHRpZiAobGlxdWlkID09ICdsYXZhJylcblx0XHRcdHRoaXMuZmF0dGVuUml2ZXJzKGxldmVsLCBsaXF1aWQpO1xuXHR9LFxuXHRmYXR0ZW5SaXZlcnM6IGZ1bmN0aW9uKGxldmVsLCBsaXF1aWQpe1xuXHRcdGxldmVsLmNlbGxzID0gQ0EucnVuQ0EobGV2ZWwuY2VsbHMsIGZ1bmN0aW9uKGN1cnJlbnQsIHN1cnJvdW5kaW5nKXtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1tsaXF1aWRdID4gMSAmJiBVdGlsLmNoYW5jZSgzMCkpXG5cdFx0XHRcdHJldHVybiBsaXF1aWQ7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nW2xpcXVpZF0gPiAxKVxuXHRcdFx0XHRyZXR1cm4gbGlxdWlkO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHR9LFxuXHRwbGFjZVJpdmVybGluZXM6IGZ1bmN0aW9uKGxldmVsLCBza2V0Y2gsIGxpcXVpZCl7XG5cdFx0Ly8gUGxhY2UgcmFuZG9tIGxpbmUgc2VnbWVudHMgb2Ygd2F0ZXJcblx0XHR2YXIgcml2ZXJzID0gVXRpbC5yYW5kKHRoaXMuY29uZmlnLk1JTl9SSVZFUlMsdGhpcy5jb25maWcuTUFYX1JJVkVSUyk7XG5cdFx0dmFyIHJpdmVyU2VnbWVudExlbmd0aCA9IHRoaXMuY29uZmlnLlJJVkVSX1NFR01FTlRfTEVOR1RIO1xuXHRcdHZhciBwdWRkbGUgPSBmYWxzZTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpdmVyczsgaSsrKXtcblx0XHRcdHZhciBzZWdtZW50cyA9IFV0aWwucmFuZCh0aGlzLmNvbmZpZy5NSU5fUklWRVJfU0VHTUVOVFMsdGhpcy5jb25maWcuTUFYX1JJVkVSX1NFR01FTlRTKTtcblx0XHRcdHZhciByaXZlclBvaW50cyA9IFtdO1xuXHRcdFx0cml2ZXJQb2ludHMucHVzaCh7XG5cdFx0XHRcdHg6IFV0aWwucmFuZCgwLCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSCksXG5cdFx0XHRcdHk6IFV0aWwucmFuZCgwLCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQpXG5cdFx0XHR9KTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2VnbWVudHM7IGorKyl7XG5cdFx0XHRcdHZhciByYW5kb21Qb2ludCA9IFV0aWwucmFuZG9tRWxlbWVudE9mKHJpdmVyUG9pbnRzKTtcblx0XHRcdFx0aWYgKHJpdmVyUG9pbnRzLmxlbmd0aCA+IDEgJiYgIXB1ZGRsZSlcblx0XHRcdFx0XHRVdGlsLnJlbW92ZUZyb21BcnJheShyaXZlclBvaW50cywgcmFuZG9tUG9pbnQpO1xuXHRcdFx0XHR2YXIgaWFuY2UgPSB7XG5cdFx0XHRcdFx0eDogVXRpbC5yYW5kKC1yaXZlclNlZ21lbnRMZW5ndGgsIHJpdmVyU2VnbWVudExlbmd0aCksXG5cdFx0XHRcdFx0eTogVXRpbC5yYW5kKC1yaXZlclNlZ21lbnRMZW5ndGgsIHJpdmVyU2VnbWVudExlbmd0aClcblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIG5ld1BvaW50ID0ge1xuXHRcdFx0XHRcdHg6IHJhbmRvbVBvaW50LnggKyBpYW5jZS54LFxuXHRcdFx0XHRcdHk6IHJhbmRvbVBvaW50LnkgKyBpYW5jZS55LFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAobmV3UG9pbnQueCA+IDAgJiYgbmV3UG9pbnQueCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIICYmIFxuXHRcdFx0XHRcdG5ld1BvaW50LnkgPiAwICYmIG5ld1BvaW50LnkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQpXG5cdFx0XHRcdFx0cml2ZXJQb2ludHMucHVzaChuZXdQb2ludCk7XG5cdFx0XHRcdHZhciBsaW5lID0gVXRpbC5saW5lKHJhbmRvbVBvaW50LCBuZXdQb2ludCk7XG5cdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgbGluZS5sZW5ndGg7IGsrKyl7XG5cdFx0XHRcdFx0dmFyIHBvaW50ID0gbGluZVtrXTtcblx0XHRcdFx0XHRpZiAocG9pbnQueCA+IDAgJiYgcG9pbnQueCA8IHRoaXMuY29uZmlnLkxFVkVMX1dJRFRIICYmIFxuXHRcdFx0XHRcdFx0cG9pbnQueSA+IDAgJiYgcG9pbnQueSA8IHRoaXMuY29uZmlnLkxFVkVMX0hFSUdIVClcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9IGxpcXVpZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0ZnJhbWVMZXZlbDogZnVuY3Rpb24oc2tldGNoLCBsZXZlbCl7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbmZpZy5MRVZFTF9XSURUSDsgeCsrKXtcblx0XHRcdGlmIChsZXZlbC5jZWxsc1t4XVswXSAhPSAnc3RvbmVXYWxsJykgbGV2ZWwuY2VsbHNbeF1bMF0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdFx0aWYgKGxldmVsLmNlbGxzW3hdW3RoaXMuY29uZmlnLkxFVkVMX0hFSUdIVC0xXSAhPSAnc3RvbmVXYWxsJykgbGV2ZWwuY2VsbHNbeF1bdGhpcy5jb25maWcuTEVWRUxfSEVJR0hULTFdID0gc2tldGNoLnN0cmF0YTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmNvbmZpZy5MRVZFTF9IRUlHSFQ7IHkrKyl7XG5cdFx0XHRpZiAobGV2ZWwuY2VsbHNbMF1beV0gIT0gJ3N0b25lV2FsbCcpIGxldmVsLmNlbGxzWzBdW3ldID0gc2tldGNoLnN0cmF0YTtcblx0XHRcdGlmIChsZXZlbC5jZWxsc1t0aGlzLmNvbmZpZy5MRVZFTF9XSURUSC0xXVt5XSAhPSAnc3RvbmVXYWxsJykgbGV2ZWwuY2VsbHNbdGhpcy5jb25maWcuTEVWRUxfV0lEVEgtMV1beV0gPSBza2V0Y2guc3RyYXRhO1xuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlY29uZExldmVsR2VuZXJhdG9yOyIsInZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c3ViZGl2aWRlQXJlYTogZnVuY3Rpb24oYmlnQXJlYSwgbWF4RGVwdGgsIE1JTl9XSURUSCwgTUlOX0hFSUdIVCwgTUFYX1dJRFRILCBNQVhfSEVJR0hULCBTTElDRV9SQU5HRV9TVEFSVCwgU0xJQ0VfUkFOR0VfRU5ELCBhdm9pZFBvaW50cyl7XG5cdFx0dmFyIGFyZWFzID0gW107XG5cdFx0dmFyIGJpZ0FyZWFzID0gW107XG5cdFx0YmlnQXJlYS5kZXB0aCA9IDA7XG5cdFx0YmlnQXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHR2YXIgcmV0cmllcyA9IDA7XG5cdFx0d2hpbGUgKGJpZ0FyZWFzLmxlbmd0aCA+IDApe1xuXHRcdFx0dmFyIGJpZ0FyZWEgPSBiaWdBcmVhcy5wb3AoKTtcblx0XHRcdGlmIChiaWdBcmVhLncgPCBNSU5fV0lEVEggKyAxICYmIGJpZ0FyZWEuaCA8IE1JTl9IRUlHSFQgKyAxKXtcblx0XHRcdFx0YmlnQXJlYS5icmlkZ2VzID0gW107XG5cdFx0XHRcdGFyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGhvcml6b250YWxTcGxpdCA9IFV0aWwuY2hhbmNlKDUwKTtcblx0XHRcdGlmIChiaWdBcmVhLncgPCBNSU5fV0lEVEggKyAxKXtcblx0XHRcdFx0aG9yaXpvbnRhbFNwbGl0ID0gdHJ1ZTtcblx0XHRcdH0gXG5cdFx0XHRpZiAoYmlnQXJlYS5oIDwgTUlOX0hFSUdIVCArIDEpe1xuXHRcdFx0XHRob3Jpem9udGFsU3BsaXQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBhcmVhMSA9IG51bGw7XG5cdFx0XHR2YXIgYXJlYTIgPSBudWxsO1xuXHRcdFx0aWYgKGhvcml6b250YWxTcGxpdCl7XG5cdFx0XHRcdHZhciBzbGljZSA9IE1hdGgucm91bmQoVXRpbC5yYW5kKGJpZ0FyZWEuaCAqIFNMSUNFX1JBTkdFX1NUQVJULCBiaWdBcmVhLmggKiBTTElDRV9SQU5HRV9FTkQpKTtcblx0XHRcdFx0YXJlYTEgPSB7XG5cdFx0XHRcdFx0eDogYmlnQXJlYS54LFxuXHRcdFx0XHRcdHk6IGJpZ0FyZWEueSxcblx0XHRcdFx0XHR3OiBiaWdBcmVhLncsXG5cdFx0XHRcdFx0aDogc2xpY2Vcblx0XHRcdFx0fTtcblx0XHRcdFx0YXJlYTIgPSB7XG5cdFx0XHRcdFx0eDogYmlnQXJlYS54LFxuXHRcdFx0XHRcdHk6IGJpZ0FyZWEueSArIHNsaWNlLFxuXHRcdFx0XHRcdHc6IGJpZ0FyZWEudyxcblx0XHRcdFx0XHRoOiBiaWdBcmVhLmggLSBzbGljZVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgc2xpY2UgPSBNYXRoLnJvdW5kKFV0aWwucmFuZChiaWdBcmVhLncgKiBTTElDRV9SQU5HRV9TVEFSVCwgYmlnQXJlYS53ICogU0xJQ0VfUkFOR0VfRU5EKSk7XG5cdFx0XHRcdGFyZWExID0ge1xuXHRcdFx0XHRcdHg6IGJpZ0FyZWEueCxcblx0XHRcdFx0XHR5OiBiaWdBcmVhLnksXG5cdFx0XHRcdFx0dzogc2xpY2UsXG5cdFx0XHRcdFx0aDogYmlnQXJlYS5oXG5cdFx0XHRcdH1cblx0XHRcdFx0YXJlYTIgPSB7XG5cdFx0XHRcdFx0eDogYmlnQXJlYS54K3NsaWNlLFxuXHRcdFx0XHRcdHk6IGJpZ0FyZWEueSxcblx0XHRcdFx0XHR3OiBiaWdBcmVhLnctc2xpY2UsXG5cdFx0XHRcdFx0aDogYmlnQXJlYS5oXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJlYTEudyA8IE1JTl9XSURUSCB8fCBhcmVhMS5oIDwgTUlOX0hFSUdIVCB8fFxuXHRcdFx0XHRhcmVhMi53IDwgTUlOX1dJRFRIIHx8IGFyZWEyLmggPCBNSU5fSEVJR0hUKXtcblx0XHRcdFx0aWYgKHJldHJpZXMgPiAxMDApe1xuXHRcdFx0XHRcdGJpZ0FyZWEuYnJpZGdlcyA9IFtdO1xuXHRcdFx0XHRcdGFyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdFx0cmV0cmllcyA9IDA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YmlnQXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0XHRyZXRyaWVzKys7XG5cdFx0XHRcdH1cdFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChiaWdBcmVhLmRlcHRoID09IG1heERlcHRoICYmIFxuXHRcdFx0XHRcdChhcmVhMS53ID4gTUFYX1dJRFRIIHx8IGFyZWExLmggPiBNQVhfSEVJR0hUIHx8XG5cdFx0XHRcdFx0YXJlYTIudyA+IE1BWF9XSURUSCB8fCBhcmVhMi5oID4gTUFYX0hFSUdIVCkpe1xuXHRcdFx0XHRpZiAocmV0cmllcyA8IDEwMCkge1xuXHRcdFx0XHRcdC8vIFB1c2ggYmFjayBiaWcgYXJlYVxuXHRcdFx0XHRcdGJpZ0FyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdFx0cmV0cmllcysrO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHJpZXMgPSAwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGF2b2lkUG9pbnRzICYmICh0aGlzLmNvbGxpZGVzV2l0aChhdm9pZFBvaW50cywgYXJlYTIpIHx8IHRoaXMuY29sbGlkZXNXaXRoKGF2b2lkUG9pbnRzLCBhcmVhMSkpKXtcblx0XHRcdFx0aWYgKHJldHJpZXMgPiAxMDApe1xuXHRcdFx0XHRcdGJpZ0FyZWEuYnJpZGdlcyA9IFtdO1xuXHRcdFx0XHRcdGFyZWFzLnB1c2goYmlnQXJlYSk7XG5cdFx0XHRcdFx0cmV0cmllcyA9IDA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gUHVzaCBiYWNrIGJpZyBhcmVhXG5cdFx0XHRcdFx0YmlnQXJlYXMucHVzaChiaWdBcmVhKTtcblx0XHRcdFx0XHRyZXRyaWVzKys7XG5cdFx0XHRcdH1cdFx0XG5cdFx0XHRcdGNvbnRpbnVlOyBcblx0XHRcdH1cblx0XHRcdGlmIChiaWdBcmVhLmRlcHRoID09IG1heERlcHRoKXtcblx0XHRcdFx0YXJlYTEuYnJpZGdlcyA9IFtdO1xuXHRcdFx0XHRhcmVhMi5icmlkZ2VzID0gW107XG5cdFx0XHRcdGFyZWFzLnB1c2goYXJlYTEpO1xuXHRcdFx0XHRhcmVhcy5wdXNoKGFyZWEyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFyZWExLmRlcHRoID0gYmlnQXJlYS5kZXB0aCArMTtcblx0XHRcdFx0YXJlYTIuZGVwdGggPSBiaWdBcmVhLmRlcHRoICsxO1xuXHRcdFx0XHRiaWdBcmVhcy5wdXNoKGFyZWExKTtcblx0XHRcdFx0YmlnQXJlYXMucHVzaChhcmVhMik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhcmVhcztcblx0fSxcblx0Y29sbGlkZXNXaXRoOiBmdW5jdGlvbihhdm9pZFBvaW50cywgYXJlYSl7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhdm9pZFBvaW50cy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXZvaWRQb2ludCA9IGF2b2lkUG9pbnRzW2ldO1xuXHRcdFx0aWYgKFV0aWwuZmxhdERpc3RhbmNlKGFyZWEueCwgYXJlYS55LCBhdm9pZFBvaW50LngsIGF2b2lkUG9pbnQueSkgPD0gMiB8fFxuXHRcdFx0XHRVdGlsLmZsYXREaXN0YW5jZShhcmVhLngrYXJlYS53LCBhcmVhLnksIGF2b2lkUG9pbnQueCwgYXZvaWRQb2ludC55KSA8PSAyIHx8XG5cdFx0XHRcdFV0aWwuZmxhdERpc3RhbmNlKGFyZWEueCwgYXJlYS55K2FyZWEuaCwgYXZvaWRQb2ludC54LCBhdm9pZFBvaW50LnkpIDw9IDIgfHxcblx0XHRcdFx0VXRpbC5mbGF0RGlzdGFuY2UoYXJlYS54K2FyZWEudywgYXJlYS55K2FyZWEuaCwgYXZvaWRQb2ludC54LCBhdm9pZFBvaW50LnkpIDw9IDIpe1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRjb25uZWN0QXJlYXM6IGZ1bmN0aW9uKGFyZWFzLCBib3JkZXIpe1xuXHRcdC8qIE1ha2Ugb25lIGFyZWEgY29ubmVjdGVkXG5cdFx0ICogV2hpbGUgbm90IGFsbCBhcmVhcyBjb25uZWN0ZWQsXG5cdFx0ICogIFNlbGVjdCBhIGNvbm5lY3RlZCBhcmVhXG5cdFx0ICogIFNlbGVjdCBhIHZhbGlkIHdhbGwgZnJvbSB0aGUgYXJlYVxuXHRcdCAqICBUZWFyIGl0IGRvd24sIGNvbm5lY3RpbmcgdG8gdGhlIGEgbmVhcmJ5IGFyZWFcblx0XHQgKiAgTWFyayBhcmVhIGFzIGNvbm5lY3RlZFxuXHRcdCAqL1xuXHRcdGlmICghYm9yZGVyKXtcblx0XHRcdGJvcmRlciA9IDE7XG5cdFx0fVxuXHRcdHZhciBjb25uZWN0ZWRBcmVhcyA9IFtdO1xuXHRcdHZhciByYW5kb21BcmVhID0gVXRpbC5yYW5kb21FbGVtZW50T2YoYXJlYXMpO1xuXHRcdGNvbm5lY3RlZEFyZWFzLnB1c2gocmFuZG9tQXJlYSk7XG5cdFx0dmFyIGN1cnNvciA9IHt9O1xuXHRcdHZhciB2YXJpID0ge307XG5cdFx0YXJlYTogd2hpbGUgKGNvbm5lY3RlZEFyZWFzLmxlbmd0aCA8IGFyZWFzLmxlbmd0aCl7XG5cdFx0XHRyYW5kb21BcmVhID0gVXRpbC5yYW5kb21FbGVtZW50T2YoY29ubmVjdGVkQXJlYXMpO1xuXHRcdFx0dmFyIHdhbGxEaXIgPSBVdGlsLnJhbmQoMSw0KTtcblx0XHRcdHN3aXRjaCh3YWxsRGlyKXtcblx0XHRcdGNhc2UgMTogLy8gTGVmdFxuXHRcdFx0XHRjdXJzb3IueCA9IHJhbmRvbUFyZWEueDtcblx0XHRcdFx0Y3Vyc29yLnkgPSBVdGlsLnJhbmQocmFuZG9tQXJlYS55ICsgYm9yZGVyICwgcmFuZG9tQXJlYS55K3JhbmRvbUFyZWEuaCAtIGJvcmRlcik7XG5cdFx0XHRcdHZhcmkueCA9IC0yO1xuXHRcdFx0XHR2YXJpLnkgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMjogLy9SaWdodFxuXHRcdFx0XHRjdXJzb3IueCA9IHJhbmRvbUFyZWEueCArIHJhbmRvbUFyZWEudztcblx0XHRcdFx0Y3Vyc29yLnkgPSBVdGlsLnJhbmQocmFuZG9tQXJlYS55ICsgYm9yZGVyLCByYW5kb21BcmVhLnkrcmFuZG9tQXJlYS5oIC0gYm9yZGVyKTtcblx0XHRcdFx0dmFyaS54ID0gMjtcblx0XHRcdFx0dmFyaS55ID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM6IC8vVXBcblx0XHRcdFx0Y3Vyc29yLnggPSBVdGlsLnJhbmQocmFuZG9tQXJlYS54ICsgYm9yZGVyLCByYW5kb21BcmVhLngrcmFuZG9tQXJlYS53IC0gYm9yZGVyKTtcblx0XHRcdFx0Y3Vyc29yLnkgPSByYW5kb21BcmVhLnk7XG5cdFx0XHRcdHZhcmkueCA9IDA7XG5cdFx0XHRcdHZhcmkueSA9IC0yO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgNDogLy9Eb3duXG5cdFx0XHRcdGN1cnNvci54ID0gVXRpbC5yYW5kKHJhbmRvbUFyZWEueCArIGJvcmRlciwgcmFuZG9tQXJlYS54K3JhbmRvbUFyZWEudyAtIGJvcmRlcik7XG5cdFx0XHRcdGN1cnNvci55ID0gcmFuZG9tQXJlYS55ICsgcmFuZG9tQXJlYS5oO1xuXHRcdFx0XHR2YXJpLnggPSAwO1xuXHRcdFx0XHR2YXJpLnkgPSAyO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHZhciBjb25uZWN0ZWRBcmVhID0gdGhpcy5nZXRBcmVhQXQoY3Vyc29yLCB2YXJpLCBhcmVhcyk7XG5cdFx0XHRpZiAoY29ubmVjdGVkQXJlYSAmJiAhVXRpbC5jb250YWlucyhjb25uZWN0ZWRBcmVhcywgY29ubmVjdGVkQXJlYSkpe1xuXHRcdFx0XHRzd2l0Y2god2FsbERpcil7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdGlmIChjdXJzb3IueSA8PSBjb25uZWN0ZWRBcmVhLnkgKyBib3JkZXIgfHwgY3Vyc29yLnkgPj0gY29ubmVjdGVkQXJlYS55ICsgY29ubmVjdGVkQXJlYS5oIC0gYm9yZGVyKVxuXHRcdFx0XHRcdFx0Y29udGludWUgYXJlYTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0aWYgKGN1cnNvci54IDw9IGNvbm5lY3RlZEFyZWEueCArIGJvcmRlciB8fCBjdXJzb3IueCA+PSBjb25uZWN0ZWRBcmVhLnggKyBjb25uZWN0ZWRBcmVhLncgLSBib3JkZXIpXG5cdFx0XHRcdFx0XHRjb250aW51ZSBhcmVhO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmNvbm5lY3RBcmVhKHJhbmRvbUFyZWEsIGNvbm5lY3RlZEFyZWEsIGN1cnNvcik7XG5cdFx0XHRcdGNvbm5lY3RlZEFyZWFzLnB1c2goY29ubmVjdGVkQXJlYSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRnZXRBcmVhQXQ6IGZ1bmN0aW9uKGN1cnNvciwgdmFyaSwgYXJlYXMpe1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBhcmVhc1tpXTtcblx0XHRcdGlmIChjdXJzb3IueCArIHZhcmkueCA+PSBhcmVhLnggJiYgY3Vyc29yLnggKyB2YXJpLnggPD0gYXJlYS54ICsgYXJlYS53IFxuXHRcdFx0XHRcdCYmIGN1cnNvci55ICsgdmFyaS55ID49IGFyZWEueSAmJiBjdXJzb3IueSArIHZhcmkueSA8PSBhcmVhLnkgKyBhcmVhLmgpXG5cdFx0XHRcdHJldHVybiBhcmVhO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdGNvbm5lY3RBcmVhOiBmdW5jdGlvbihhcmVhMSwgYXJlYTIsIHBvc2l0aW9uKXtcblx0XHRhcmVhMS5icmlkZ2VzLnB1c2goe1xuXHRcdFx0eDogcG9zaXRpb24ueCxcblx0XHRcdHk6IHBvc2l0aW9uLnksXG5cdFx0XHR0bzogYXJlYTJcblx0XHR9KTtcblx0XHRhcmVhMi5icmlkZ2VzLnB1c2goe1xuXHRcdFx0eDogcG9zaXRpb24ueCxcblx0XHRcdHk6IHBvc2l0aW9uLnksXG5cdFx0XHR0bzogYXJlYTFcblx0XHR9KTtcblx0fVxufSIsImZ1bmN0aW9uIFRoaXJkTGV2ZWxHZW5lcmF0b3IoY29uZmlnKXtcblx0dGhpcy5jb25maWcgPSBjb25maWc7XG59XG5cbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlscycpO1xudmFyIENBID0gcmVxdWlyZSgnLi9DQScpO1xudmFyIFNwbGl0dGVyID0gcmVxdWlyZSgnLi9TcGxpdHRlcicpO1xuXG5UaGlyZExldmVsR2VuZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0ZmlsbExldmVsOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHR0aGlzLmZpbGxSb29tcyhza2V0Y2gsIGxldmVsKVxuXHRcdHRoaXMuZmF0dGVuQ2F2ZXJucyhsZXZlbCk7XG5cdFx0dGhpcy5wbGFjZUV4aXRzKHNrZXRjaCwgbGV2ZWwpO1xuXHRcdHRoaXMucmFpc2VJc2xhbmRzKGxldmVsKTtcblx0XHR0aGlzLmVubGFyZ2VCcmlkZ2VzKGxldmVsKTtcblx0XHRsZXZlbC5hcmVhc1NrZXRjaCA9IHNrZXRjaC5hcmVhcztcblx0XHRyZXR1cm4gbGV2ZWw7XG5cdH0sXG5cdGZhdHRlbkNhdmVybnM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHQvLyBHcm93IGNhdmVybnNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2NhdmVybkZsb29yJ10gPiAwICYmIFV0aWwuY2hhbmNlKDIwKSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddID4gMSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSwgdHJ1ZSk7XG5cdFx0Ly8gR3JvdyBsYWdvb24gYXJlYXNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2Zha2VXYXRlciddID4gMCAmJiBVdGlsLmNoYW5jZSg0MCkpXG5cdFx0XHRcdHJldHVybiAnZmFrZVdhdGVyJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2Zha2VXYXRlciddID4gMClcblx0XHRcdFx0cmV0dXJuICdmYWtlV2F0ZXInO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdFxuXHRcdFxuXHRcdC8vIEV4cGFuZCB3YWxsLWxlc3Mgcm9vbXNcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnc29saWRSb2NrJylcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKHN1cnJvdW5kaW5nWydzdG9uZUZsb29yJ10gPiAyICYmIFV0aWwuY2hhbmNlKDEwKSlcblx0XHRcdFx0cmV0dXJuICdjYXZlcm5GbG9vcic7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSwgMSk7XG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKGN1cnJlbnQgIT0gJ3NvbGlkUm9jaycpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMCAmJiBzdXJyb3VuZGluZ1snY2F2ZXJuRmxvb3InXT4wKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHQvLyBEZXRlcmlvcmF0ZSB3YWxsIHJvb21zXG5cdFx0bGV2ZWwuY2VsbHMgPSBDQS5ydW5DQShsZXZlbC5jZWxscywgZnVuY3Rpb24oY3VycmVudCwgc3Vycm91bmRpbmcpe1xuXHRcdFx0aWYgKGN1cnJlbnQgIT0gJ3N0b25lV2FsbCcpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMCAmJiBVdGlsLmNoYW5jZSg1KSlcblx0XHRcdFx0cmV0dXJuICdzdG9uZUZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxLCB0cnVlKTtcblx0XHRcblx0fSxcblx0ZW5sYXJnZUJyaWRnZXM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnbGF2YScgJiYgY3VycmVudCAhPSAnd2F0ZXInICYmIGN1cnJlbnQgIT0gJ2Zha2VXYXRlcicpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdC8qaWYgKHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddID4gMCB8fCBzdXJyb3VuZGluZ1snc3RvbmVGbG9vciddID4gMClcblx0XHRcdFx0cmV0dXJuIGZhbHNlOyovXG5cdFx0XHRpZiAoc3Vycm91bmRpbmdbJ2JyaWRnZSddID4gMClcblx0XHRcdFx0cmV0dXJuICdicmlkZ2UnO1xuXHRcdH0sIDEsIHRydWUpO1xuXHR9LFxuXHRyYWlzZUlzbGFuZHM6IGZ1bmN0aW9uKGxldmVsKXtcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnd2F0ZXInKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgY2F2ZXJucyA9IHN1cnJvdW5kaW5nWydjYXZlcm5GbG9vciddOyBcblx0XHRcdGlmIChjYXZlcm5zID4gMCAmJiBVdGlsLmNoYW5jZSg3MCkpXG5cdFx0XHRcdHJldHVybiAnY2F2ZXJuRmxvb3InO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sIDEsIHRydWUpO1xuXHRcdC8vIElzbGFuZCBmb3IgZXhpdHMgb24gd2F0ZXJcblx0XHRsZXZlbC5jZWxscyA9IENBLnJ1bkNBKGxldmVsLmNlbGxzLCBmdW5jdGlvbihjdXJyZW50LCBzdXJyb3VuZGluZyl7XG5cdFx0XHRpZiAoY3VycmVudCAhPSAnZmFrZVdhdGVyJyAmJiBjdXJyZW50ICE9ICd3YXRlcicpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdHZhciBzdGFpcnMgPSBzdXJyb3VuZGluZ1snZG93bnN0YWlycyddID8gc3Vycm91bmRpbmdbJ2Rvd25zdGFpcnMnXSA6IDAgK1xuXHRcdFx0XHRcdHN1cnJvdW5kaW5nWyd1cHN0YWlycyddID8gc3Vycm91bmRpbmdbJ3Vwc3RhaXJzJ10gOiAwOyBcblx0XHRcdGlmIChzdGFpcnMgPiAwKVxuXHRcdFx0XHRyZXR1cm4gJ2NhdmVybkZsb29yJztcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LCAxKTtcblx0fSxcblx0ZmlsbFJvb21zOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdHZhciB0eXBlID0gYXJlYS5hcmVhVHlwZTtcblx0XHRcdGlmICh0eXBlID09PSAnY2F2ZXJuJyl7IFxuXHRcdFx0XHR0aGlzLmZpbGxXaXRoQ2F2ZXJuKGxldmVsLCBhcmVhKTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ3Jvb21zJyl7XG5cdFx0XHRcdHRoaXMuZmlsbFdpdGhSb29tcyhsZXZlbCwgYXJlYSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwbGFjZUV4aXRzOiBmdW5jdGlvbihza2V0Y2gsIGxldmVsKXtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaC5hcmVhcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYXJlYSA9IHNrZXRjaC5hcmVhc1tpXTtcblx0XHRcdGlmICghYXJlYS5oYXNFeGl0ICYmICFhcmVhLmhhc0VudHJhbmNlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdHZhciB0aWxlID0gbnVsbDtcblx0XHRcdGlmIChhcmVhLmhhc0V4aXQpe1xuXHRcdFx0XHR0aWxlID0gJ2Rvd25zdGFpcnMnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGlsZSA9ICd1cHN0YWlycyc7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZnJlZVNwb3QgPSBsZXZlbC5nZXRGcmVlUGxhY2UoYXJlYSk7XG5cdFx0XHRpZiAoZnJlZVNwb3QueCA9PSAwIHx8IGZyZWVTcG90LnkgPT0gMCB8fCBmcmVlU3BvdC54ID09IGxldmVsLmNlbGxzLmxlbmd0aCAtIDEgfHwgZnJlZVNwb3QueSA9PSBsZXZlbC5jZWxsc1swXS5sZW5ndGggLSAxKXtcblx0XHRcdFx0aS0tO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGxldmVsLmNlbGxzW2ZyZWVTcG90LnhdW2ZyZWVTcG90LnldID0gdGlsZTtcblx0XHRcdGlmIChhcmVhLmhhc0V4aXQpe1xuXHRcdFx0XHRsZXZlbC5lbmQgPSB7XG5cdFx0XHRcdFx0eDogZnJlZVNwb3QueCxcblx0XHRcdFx0XHR5OiBmcmVlU3BvdC55XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXZlbC5zdGFydCA9IHtcblx0XHRcdFx0XHR4OiBmcmVlU3BvdC54LFxuXHRcdFx0XHRcdHk6IGZyZWVTcG90Lnlcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGZpbGxXaXRoQ2F2ZXJuOiBmdW5jdGlvbihsZXZlbCwgYXJlYSl7XG5cdFx0Ly8gQ29ubmVjdCBhbGwgYnJpZGdlcyB3aXRoIG1pZHBvaW50XG5cdFx0dmFyIG1pZHBvaW50ID0ge1xuXHRcdFx0eDogTWF0aC5yb3VuZChVdGlsLnJhbmQoYXJlYS54ICsgYXJlYS53ICogMS8zLCBhcmVhLngrYXJlYS53ICogMi8zKSksXG5cdFx0XHR5OiBNYXRoLnJvdW5kKFV0aWwucmFuZChhcmVhLnkgKyBhcmVhLmggKiAxLzMsIGFyZWEueSthcmVhLmggKiAyLzMpKVxuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWEuYnJpZGdlcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2ldO1xuXHRcdFx0dmFyIGxpbmUgPSBVdGlsLmxpbmUobWlkcG9pbnQsIGJyaWRnZSk7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGxpbmUubGVuZ3RoOyBqKyspe1xuXHRcdFx0XHR2YXIgcG9pbnQgPSBsaW5lW2pdO1xuXHRcdFx0XHR2YXIgY3VycmVudENlbGwgPSBsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XTtcblx0XHRcdFx0aWYgKGFyZWEuY2F2ZXJuVHlwZSA9PSAncm9ja3knKVxuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gYXJlYS5mbG9vcjtcblx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudENlbGwgPT0gJ3dhdGVyJyB8fCBjdXJyZW50Q2VsbCA9PSAnbGF2YScpe1xuXHRcdFx0XHRcdGlmIChhcmVhLmZsb29yICE9ICdmYWtlV2F0ZXInICYmIGFyZWEuY2F2ZXJuVHlwZSA9PSAnYnJpZGdlcycpXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1twb2ludC54XVtwb2ludC55XSA9ICdicmlkZ2UnO1xuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW3BvaW50LnhdW3BvaW50LnldID0gJ2Zha2VXYXRlcic7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSBhcmVhLmZsb29yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIFNjcmF0Y2ggdGhlIGFyZWFcblx0XHR2YXIgc2NyYXRjaGVzID0gVXRpbC5yYW5kKDIsNCk7XG5cdFx0dmFyIGNhdmVTZWdtZW50cyA9IFtdO1xuXHRcdGNhdmVTZWdtZW50cy5wdXNoKG1pZHBvaW50KTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjcmF0Y2hlczsgaSsrKXtcblx0XHRcdHZhciBwMSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGNhdmVTZWdtZW50cyk7XG5cdFx0XHRpZiAoY2F2ZVNlZ21lbnRzLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFV0aWwucmVtb3ZlRnJvbUFycmF5KGNhdmVTZWdtZW50cywgcDEpO1xuXHRcdFx0dmFyIHAyID0ge1xuXHRcdFx0XHR4OiBVdGlsLnJhbmQoYXJlYS54LCBhcmVhLngrYXJlYS53LTEpLFxuXHRcdFx0XHR5OiBVdGlsLnJhbmQoYXJlYS55LCBhcmVhLnkrYXJlYS5oLTEpXG5cdFx0XHR9XG5cdFx0XHRjYXZlU2VnbWVudHMucHVzaChwMik7XG5cdFx0XHR2YXIgbGluZSA9IFV0aWwubGluZShwMiwgcDEpO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBsaW5lLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0dmFyIHBvaW50ID0gbGluZVtqXTtcblx0XHRcdFx0dmFyIGN1cnJlbnRDZWxsID0gbGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV07XG5cdFx0XHRcdGlmIChjdXJyZW50Q2VsbCAhPSAnd2F0ZXInKSAgXG5cdFx0XHRcdFx0bGV2ZWwuY2VsbHNbcG9pbnQueF1bcG9pbnQueV0gPSBhcmVhLmZsb29yO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0ZmlsbFdpdGhSb29tczogZnVuY3Rpb24obGV2ZWwsIGFyZWEpe1xuXHRcdHZhciBiaWdBcmVhID0ge1xuXHRcdFx0eDogYXJlYS54LFxuXHRcdFx0eTogYXJlYS55LFxuXHRcdFx0dzogYXJlYS53LFxuXHRcdFx0aDogYXJlYS5oXG5cdFx0fVxuXHRcdHZhciBtYXhEZXB0aCA9IDI7XG5cdFx0dmFyIE1JTl9XSURUSCA9IDY7XG5cdFx0dmFyIE1JTl9IRUlHSFQgPSA2O1xuXHRcdHZhciBNQVhfV0lEVEggPSAxMDtcblx0XHR2YXIgTUFYX0hFSUdIVCA9IDEwO1xuXHRcdHZhciBTTElDRV9SQU5HRV9TVEFSVCA9IDMvODtcblx0XHR2YXIgU0xJQ0VfUkFOR0VfRU5EID0gNS84O1xuXHRcdHZhciBhcmVhcyA9IFNwbGl0dGVyLnN1YmRpdmlkZUFyZWEoYmlnQXJlYSwgbWF4RGVwdGgsIE1JTl9XSURUSCwgTUlOX0hFSUdIVCwgTUFYX1dJRFRILCBNQVhfSEVJR0hULCBTTElDRV9SQU5HRV9TVEFSVCwgU0xJQ0VfUkFOR0VfRU5ELCBhcmVhLmJyaWRnZXMpO1xuXHRcdFNwbGl0dGVyLmNvbm5lY3RBcmVhcyhhcmVhcywgYXJlYS53YWxsID8gMiA6IDEpOyBcblx0XHR2YXIgYnJpZGdlQXJlYXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBzdWJhcmVhID0gYXJlYXNbaV07XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGFyZWEuYnJpZGdlcy5sZW5ndGg7IGorKyl7XG5cdFx0XHRcdHZhciBicmlkZ2UgPSBhcmVhLmJyaWRnZXNbal07XG5cdFx0XHRcdGlmIChTcGxpdHRlci5nZXRBcmVhQXQoYnJpZGdlLHt4OjAseTowfSwgYXJlYXMpID09IHN1YmFyZWEpe1xuXHRcdFx0XHRcdGlmICghVXRpbC5jb250YWlucyhicmlkZ2VBcmVhcywgc3ViYXJlYSkpe1xuXHRcdFx0XHRcdFx0YnJpZGdlQXJlYXMucHVzaChzdWJhcmVhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3ViYXJlYS5icmlkZ2VzLnB1c2goe1xuXHRcdFx0XHRcdFx0eDogYnJpZGdlLngsXG5cdFx0XHRcdFx0XHR5OiBicmlkZ2UueVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMudXNlQXJlYXMoYnJpZGdlQXJlYXMsIGFyZWFzLCBiaWdBcmVhKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBzdWJhcmVhID0gYXJlYXNbaV07XG5cdFx0XHRpZiAoIXN1YmFyZWEucmVuZGVyKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdHN1YmFyZWEuZmxvb3IgPSBhcmVhLmZsb29yO1xuXHRcdFx0c3ViYXJlYS53YWxsID0gYXJlYS53YWxsO1xuXHRcdFx0c3ViYXJlYS5jb3JyaWRvciA9IGFyZWEuY29ycmlkb3I7XG5cdFx0XHR0aGlzLmNhcnZlUm9vbUF0KGxldmVsLCBzdWJhcmVhKTtcblx0XHR9XG5cdH0sXG5cdGNhcnZlUm9vbUF0OiBmdW5jdGlvbihsZXZlbCwgYXJlYSl7XG5cdFx0dmFyIG1pbmJveCA9IHtcblx0XHRcdHg6IGFyZWEueCArIE1hdGguZmxvb3IoYXJlYS53IC8gMiktMSxcblx0XHRcdHk6IGFyZWEueSArIE1hdGguZmxvb3IoYXJlYS5oIC8gMiktMSxcblx0XHRcdHgyOiBhcmVhLnggKyBNYXRoLmZsb29yKGFyZWEudyAvIDIpKzEsXG5cdFx0XHR5MjogYXJlYS55ICsgTWF0aC5mbG9vcihhcmVhLmggLyAyKSsxLFxuXHRcdH07XG5cdFx0Ly8gVHJhY2UgY29ycmlkb3JzIGZyb20gZXhpdHNcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZWEuYnJpZGdlcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgYnJpZGdlID0gYXJlYS5icmlkZ2VzW2ldO1xuXHRcdFx0dmFyIHZlcnRpY2FsQnJpZGdlID0gZmFsc2U7XG5cdFx0XHR2YXIgaG9yaXpvbnRhbEJyaWRnZSA9IGZhbHNlO1xuXHRcdFx0aWYgKGJyaWRnZS54ID09IGFyZWEueCl7XG5cdFx0XHRcdC8vIExlZnQgQ29ycmlkb3Jcblx0XHRcdFx0aG9yaXpvbnRhbEJyaWRnZSA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGogPSBicmlkZ2UueDsgaiA8IGJyaWRnZS54ICsgYXJlYS53IC8gMjsgaisrKXtcblx0XHRcdFx0XHRpZiAoYXJlYS53YWxsKXtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueS0xXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1tqXVticmlkZ2UueS0xXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1tqXVticmlkZ2UueSsxXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1tqXVticmlkZ2UueSsxXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9PSAnd2F0ZXInIHx8IGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9PSAnbGF2YScpeyBcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9ICdicmlkZ2UnO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPSBhcmVhLmNvcnJpZG9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGJyaWRnZS54ID09IGFyZWEueCArIGFyZWEudyl7XG5cdFx0XHRcdC8vIFJpZ2h0IGNvcnJpZG9yXG5cdFx0XHRcdGhvcml6b250YWxCcmlkZ2UgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gYnJpZGdlLng7IGogPj0gYnJpZGdlLnggLSBhcmVhLncgLyAyOyBqLS0pe1xuXHRcdFx0XHRcdGlmIChhcmVhLndhbGwpe1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55LTFdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2pdW2JyaWRnZS55LTFdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55KzFdICE9IGFyZWEuY29ycmlkb3IpIGxldmVsLmNlbGxzW2pdW2JyaWRnZS55KzFdID0gYXJlYS53YWxsO1xuXHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0aWYgKGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9PSAnd2F0ZXInIHx8IGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9PSAnbGF2YScpeyBcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2pdW2JyaWRnZS55XSA9ICdicmlkZ2UnO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1tqXVticmlkZ2UueV0gPSBhcmVhLmNvcnJpZG9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChicmlkZ2UueSA9PSBhcmVhLnkpe1xuXHRcdFx0XHQvLyBUb3AgY29ycmlkb3Jcblx0XHRcdFx0dmVydGljYWxCcmlkZ2UgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gYnJpZGdlLnk7IGogPCBicmlkZ2UueSArIGFyZWEuaCAvIDI7IGorKyl7XG5cdFx0XHRcdFx0aWYgKGFyZWEud2FsbCl7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLngtMV1bal0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbYnJpZGdlLngtMV1bal0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLngrMV1bal0gIT0gYXJlYS5jb3JyaWRvcikgbGV2ZWwuY2VsbHNbYnJpZGdlLngrMV1bal0gPSBhcmVhLndhbGw7XG5cdFx0XHRcdFx0fSBcblx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID09ICd3YXRlcicgfHwgbGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID09ICdsYXZhJyl7IFxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID0gJ2JyaWRnZSc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9IGFyZWEuY29ycmlkb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBEb3duIENvcnJpZG9yXG5cdFx0XHRcdHZlcnRpY2FsQnJpZGdlID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IGJyaWRnZS55OyBqID49IGJyaWRnZS55IC0gYXJlYS5oIC8gMjsgai0tKXtcblx0XHRcdFx0XHRpZiAoYXJlYS53YWxsKXtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueC0xXVtqXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1ticmlkZ2UueC0xXVtqXSA9IGFyZWEud2FsbDtcblx0XHRcdFx0XHRcdGlmIChsZXZlbC5jZWxsc1ticmlkZ2UueCsxXVtqXSAhPSBhcmVhLmNvcnJpZG9yKSBsZXZlbC5jZWxsc1ticmlkZ2UueCsxXVtqXSA9IGFyZWEud2FsbDsgXG5cdFx0XHRcdFx0fSBcblx0XHRcdFx0XHRpZiAobGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID09ICd3YXRlcicgfHwgbGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID09ICdsYXZhJyl7IFxuXHRcdFx0XHRcdFx0bGV2ZWwuY2VsbHNbYnJpZGdlLnhdW2pdID0gJ2JyaWRnZSc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldmVsLmNlbGxzW2JyaWRnZS54XVtqXSA9IGFyZWEuY29ycmlkb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodmVydGljYWxCcmlkZ2Upe1xuXHRcdFx0XHRpZiAoYnJpZGdlLnggPCBtaW5ib3gueClcblx0XHRcdFx0XHRtaW5ib3gueCA9IGJyaWRnZS54O1xuXHRcdFx0XHRpZiAoYnJpZGdlLnggPiBtaW5ib3gueDIpXG5cdFx0XHRcdFx0bWluYm94LngyID0gYnJpZGdlLng7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaG9yaXpvbnRhbEJyaWRnZSl7XG5cdFx0XHRcdGlmIChicmlkZ2UueSA8IG1pbmJveC55KVxuXHRcdFx0XHRcdG1pbmJveC55ID0gYnJpZGdlLnk7XG5cdFx0XHRcdGlmIChicmlkZ2UueSA+IG1pbmJveC55Milcblx0XHRcdFx0XHRtaW5ib3gueTIgPSBicmlkZ2UueTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIG1pblBhZGRpbmcgPSAwO1xuXHRcdGlmIChhcmVhLndhbGwpXG5cdFx0XHRtaW5QYWRkaW5nID0gMTtcblx0XHR2YXIgcGFkZGluZyA9IHtcblx0XHRcdHRvcDogVXRpbC5yYW5kKG1pblBhZGRpbmcsIG1pbmJveC55IC0gYXJlYS55IC0gbWluUGFkZGluZyksXG5cdFx0XHRib3R0b206IFV0aWwucmFuZChtaW5QYWRkaW5nLCBhcmVhLnkgKyBhcmVhLmggLSBtaW5ib3gueTIgLSBtaW5QYWRkaW5nKSxcblx0XHRcdGxlZnQ6IFV0aWwucmFuZChtaW5QYWRkaW5nLCBtaW5ib3gueCAtIGFyZWEueCAtIG1pblBhZGRpbmcpLFxuXHRcdFx0cmlnaHQ6IFV0aWwucmFuZChtaW5QYWRkaW5nLCBhcmVhLnggKyBhcmVhLncgLSBtaW5ib3gueDIgLSBtaW5QYWRkaW5nKVxuXHRcdH07XG5cdFx0aWYgKHBhZGRpbmcudG9wIDwgMCkgcGFkZGluZy50b3AgPSAwO1xuXHRcdGlmIChwYWRkaW5nLmJvdHRvbSA8IDApIHBhZGRpbmcuYm90dG9tID0gMDtcblx0XHRpZiAocGFkZGluZy5sZWZ0IDwgMCkgcGFkZGluZy5sZWZ0ID0gMDtcblx0XHRpZiAocGFkZGluZy5yaWdodCA8IDApIHBhZGRpbmcucmlnaHQgPSAwO1xuXHRcdHZhciByb29teCA9IGFyZWEueDtcblx0XHR2YXIgcm9vbXkgPSBhcmVhLnk7XG5cdFx0dmFyIHJvb213ID0gYXJlYS53O1xuXHRcdHZhciByb29taCA9IGFyZWEuaDtcblx0XHRmb3IgKHZhciB4ID0gcm9vbXg7IHggPCByb29teCArIHJvb213OyB4Kyspe1xuXHRcdFx0Zm9yICh2YXIgeSA9IHJvb215OyB5IDwgcm9vbXkgKyByb29taDsgeSsrKXtcblx0XHRcdFx0dmFyIGRyYXdXYWxsID0gYXJlYS53YWxsICYmIGxldmVsLmNlbGxzW3hdW3ldICE9IGFyZWEuY29ycmlkb3IgJiYgbGV2ZWwuY2VsbHNbeF1beV0gIT0gJ2JyaWRnZSc7IFxuXHRcdFx0XHRpZiAoeSA8IHJvb215ICsgcGFkZGluZy50b3Ape1xuXHRcdFx0XHRcdGlmIChkcmF3V2FsbCAmJiB5ID09IHJvb215ICsgcGFkZGluZy50b3AgLSAxICYmIHggKyAxID49IHJvb214ICsgcGFkZGluZy5sZWZ0ICYmIHggPD0gcm9vbXggKyByb29tdyAtIHBhZGRpbmcucmlnaHQpXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IGFyZWEud2FsbDtcblx0XHRcdFx0fSBlbHNlIGlmICh4IDwgcm9vbXggKyBwYWRkaW5nLmxlZnQpe1xuXHRcdFx0XHRcdGlmIChkcmF3V2FsbCAmJiB4ID09IHJvb214ICsgcGFkZGluZy5sZWZ0IC0gMSAmJiB5ID49IHJvb215ICsgcGFkZGluZy50b3AgJiYgeSA8PSByb29teSArIHJvb21oIC0gcGFkZGluZy5ib3R0b20pXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IGFyZWEud2FsbDtcblx0XHRcdFx0fSBlbHNlIGlmICh5ID4gcm9vbXkgKyByb29taCAtIDEgLSBwYWRkaW5nLmJvdHRvbSl7XG5cdFx0XHRcdFx0aWYgKGRyYXdXYWxsICYmIHkgPT0gcm9vbXkgKyByb29taCAtIHBhZGRpbmcuYm90dG9tICYmIHggKyAxID49IHJvb214ICsgcGFkZGluZy5sZWZ0ICYmIHggPD0gcm9vbXggKyByb29tdyAtIHBhZGRpbmcucmlnaHQpXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IGFyZWEud2FsbDtcblx0XHRcdFx0fSBlbHNlIGlmICh4ID4gcm9vbXggKyByb29tdyAtIDEgLSBwYWRkaW5nLnJpZ2h0KXtcblx0XHRcdFx0XHRpZiAoZHJhd1dhbGwgJiYgeCA9PSByb29teCArIHJvb213IC0gcGFkZGluZy5yaWdodCAmJiB5ID49IHJvb215ICsgcGFkZGluZy50b3AgJiYgeSA8PSByb29teSArIHJvb21oIC0gcGFkZGluZy5ib3R0b20pXG5cdFx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9IGFyZWEud2FsbDtcblx0XHRcdFx0fSBlbHNlIGlmIChhcmVhLm1hcmtlZClcblx0XHRcdFx0XHRsZXZlbC5jZWxsc1t4XVt5XSA9ICdwYWRkaW5nJztcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGxldmVsLmNlbGxzW3hdW3ldID0gYXJlYS5mbG9vcjtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdH0sXG5cdHVzZUFyZWFzOiBmdW5jdGlvbihrZWVwQXJlYXMsIGFyZWFzLCBiaWdBcmVhKXtcblx0XHQvLyBBbGwga2VlcCBhcmVhcyBzaG91bGQgYmUgY29ubmVjdGVkIHdpdGggYSBzaW5nbGUgcGl2b3QgYXJlYVxuXHRcdHZhciBwaXZvdEFyZWEgPSBTcGxpdHRlci5nZXRBcmVhQXQoe3g6IE1hdGgucm91bmQoYmlnQXJlYS54ICsgYmlnQXJlYS53LzIpLCB5OiBNYXRoLnJvdW5kKGJpZ0FyZWEueSArIGJpZ0FyZWEuaC8yKX0se3g6MCx5OjB9LCBhcmVhcyk7XG5cdFx0dmFyIHBhdGhBcmVhcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2VlcEFyZWFzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBrZWVwQXJlYSA9IGtlZXBBcmVhc1tpXTtcblx0XHRcdGtlZXBBcmVhLnJlbmRlciA9IHRydWU7XG5cdFx0XHR2YXIgYXJlYXNQYXRoID0gdGhpcy5nZXREcnVua2VuQXJlYXNQYXRoKGtlZXBBcmVhLCBwaXZvdEFyZWEsIGFyZWFzKTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgYXJlYXNQYXRoLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0YXJlYXNQYXRoW2pdLnJlbmRlciA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJlYXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGFyZWEgPSBhcmVhc1tpXTtcblx0XHRcdGlmICghYXJlYS5yZW5kZXIpe1xuXHRcdFx0XHRicmlkZ2VzUmVtb3ZlOiBmb3IgKHZhciBqID0gMDsgaiA8IGFyZWEuYnJpZGdlcy5sZW5ndGg7IGorKyl7XG5cdFx0XHRcdFx0dmFyIGJyaWRnZSA9IGFyZWEuYnJpZGdlc1tqXTtcblx0XHRcdFx0XHRpZiAoIWJyaWRnZS50bylcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgYnJpZGdlLnRvLmJyaWRnZXMubGVuZ3RoOyBrKyspe1xuXHRcdFx0XHRcdFx0dmFyIHNvdXJjZUJyaWRnZSA9IGJyaWRnZS50by5icmlkZ2VzW2tdO1xuXHRcdFx0XHRcdFx0aWYgKHNvdXJjZUJyaWRnZS54ID09IGJyaWRnZS54ICYmIHNvdXJjZUJyaWRnZS55ID09IGJyaWRnZS55KXtcblx0XHRcdFx0XHRcdFx0VXRpbC5yZW1vdmVGcm9tQXJyYXkoYnJpZGdlLnRvLmJyaWRnZXMsIHNvdXJjZUJyaWRnZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRnZXREcnVua2VuQXJlYXNQYXRoOiBmdW5jdGlvbiAoZnJvbUFyZWEsIHRvQXJlYSwgYXJlYXMpe1xuXHRcdHZhciBjdXJyZW50QXJlYSA9IGZyb21BcmVhO1xuXHRcdHZhciBwYXRoID0gW107XG5cdFx0cGF0aC5wdXNoKGZyb21BcmVhKTtcblx0XHRwYXRoLnB1c2godG9BcmVhKTtcblx0XHRpZiAoZnJvbUFyZWEgPT0gdG9BcmVhKVxuXHRcdFx0cmV0dXJuIHBhdGg7XG5cdFx0d2hpbGUgKHRydWUpe1xuXHRcdFx0dmFyIHJhbmRvbUJyaWRnZSA9IFV0aWwucmFuZG9tRWxlbWVudE9mKGN1cnJlbnRBcmVhLmJyaWRnZXMpO1xuXHRcdFx0aWYgKCFyYW5kb21CcmlkZ2UudG8pXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0aWYgKCFVdGlsLmNvbnRhaW5zKHBhdGgsIHJhbmRvbUJyaWRnZS50bykpe1xuXHRcdFx0XHRwYXRoLnB1c2gocmFuZG9tQnJpZGdlLnRvKTtcblx0XHRcdH1cblx0XHRcdGlmIChyYW5kb21CcmlkZ2UudG8gPT0gdG9BcmVhKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGN1cnJlbnRBcmVhID0gcmFuZG9tQnJpZGdlLnRvO1xuXHRcdH1cblx0XHRyZXR1cm4gcGF0aDtcblx0fVxuXHRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaGlyZExldmVsR2VuZXJhdG9yOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRyYW5kOiBmdW5jdGlvbiAobG93LCBoaSl7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChoaSAtIGxvdyArIDEpKStsb3c7XG5cdH0sXG5cdHJhbmRvbUVsZW1lbnRPZjogZnVuY3Rpb24gKGFycmF5KXtcblx0XHRyZXR1cm4gYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmFycmF5Lmxlbmd0aCldO1xuXHR9LFxuXHRkaXN0YW5jZTogZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG5cdFx0cmV0dXJuIE1hdGguc3FydCgoeDIteDEpKih4Mi14MSkgKyAoeTIteTEpKih5Mi15MSkpO1xuXHR9LFxuXHRmbGF0RGlzdGFuY2U6IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKXtcblx0XHR2YXIgeERpc3QgPSBNYXRoLmFicyh4MSAtIHgyKTtcblx0XHR2YXIgeURpc3QgPSBNYXRoLmFicyh5MSAtIHkyKTtcblx0XHRpZiAoeERpc3QgPT09IHlEaXN0KVxuXHRcdFx0cmV0dXJuIHhEaXN0O1xuXHRcdGVsc2Vcblx0XHRcdHJldHVybiB4RGlzdCArIHlEaXN0O1xuXHR9LFxuXHRsaW5lRGlzdGFuY2U6IGZ1bmN0aW9uKHBvaW50MSwgcG9pbnQyKXtcblx0ICB2YXIgeHMgPSAwO1xuXHQgIHZhciB5cyA9IDA7XG5cdCAgeHMgPSBwb2ludDIueCAtIHBvaW50MS54O1xuXHQgIHhzID0geHMgKiB4cztcblx0ICB5cyA9IHBvaW50Mi55IC0gcG9pbnQxLnk7XG5cdCAgeXMgPSB5cyAqIHlzO1xuXHQgIHJldHVybiBNYXRoLnNxcnQoIHhzICsgeXMgKTtcblx0fSxcblx0ZGlyZWN0aW9uOiBmdW5jdGlvbiAoYSxiKXtcblx0XHRyZXR1cm4ge3g6IHNpZ24oYi54IC0gYS54KSwgeTogc2lnbihiLnkgLSBhLnkpfTtcblx0fSxcblx0Y2hhbmNlOiBmdW5jdGlvbiAoY2hhbmNlKXtcblx0XHRyZXR1cm4gdGhpcy5yYW5kKDAsMTAwKSA8PSBjaGFuY2U7XG5cdH0sXG5cdGNvbnRhaW5zOiBmdW5jdGlvbihhcnJheSwgZWxlbWVudCl7XG5cdCAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihlbGVtZW50KSA+IC0xO1xuXHR9LFxuXHRyZW1vdmVGcm9tQXJyYXk6IGZ1bmN0aW9uKGFycmF5LCBvYmplY3QpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcblx0XHRcdGlmIChhcnJheVtpXSA9PSBvYmplY3Qpe1xuXHRcdFx0XHR0aGlzLnJlbW92ZUZyb21BcnJheUluZGV4KGFycmF5LCBpLGkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmVGcm9tQXJyYXlJbmRleDogZnVuY3Rpb24oYXJyYXksIGZyb20sIHRvKSB7XG5cdFx0dmFyIHJlc3QgPSBhcnJheS5zbGljZSgodG8gfHwgZnJvbSkgKyAxIHx8IGFycmF5Lmxlbmd0aCk7XG5cdFx0YXJyYXkubGVuZ3RoID0gZnJvbSA8IDAgPyBhcnJheS5sZW5ndGggKyBmcm9tIDogZnJvbTtcblx0XHRyZXR1cm4gYXJyYXkucHVzaC5hcHBseShhcnJheSwgcmVzdCk7XG5cdH0sXG5cdGxpbmU6IGZ1bmN0aW9uIChhLCBiKXtcblx0XHR2YXIgY29vcmRpbmF0ZXNBcnJheSA9IG5ldyBBcnJheSgpO1xuXHRcdHZhciB4MSA9IGEueDtcblx0XHR2YXIgeTEgPSBhLnk7XG5cdFx0dmFyIHgyID0gYi54O1xuXHRcdHZhciB5MiA9IGIueTtcblx0ICAgIHZhciBkeCA9IE1hdGguYWJzKHgyIC0geDEpO1xuXHQgICAgdmFyIGR5ID0gTWF0aC5hYnMoeTIgLSB5MSk7XG5cdCAgICB2YXIgc3ggPSAoeDEgPCB4MikgPyAxIDogLTE7XG5cdCAgICB2YXIgc3kgPSAoeTEgPCB5MikgPyAxIDogLTE7XG5cdCAgICB2YXIgZXJyID0gZHggLSBkeTtcblx0ICAgIGNvb3JkaW5hdGVzQXJyYXkucHVzaCh7eDogeDEsIHk6IHkxfSk7XG5cdCAgICB3aGlsZSAoISgoeDEgPT0geDIpICYmICh5MSA9PSB5MikpKSB7XG5cdCAgICBcdHZhciBlMiA9IGVyciA8PCAxO1xuXHQgICAgXHRpZiAoZTIgPiAtZHkpIHtcblx0ICAgIFx0XHRlcnIgLT0gZHk7XG5cdCAgICBcdFx0eDEgKz0gc3g7XG5cdCAgICBcdH1cblx0ICAgIFx0aWYgKGUyIDwgZHgpIHtcblx0ICAgIFx0XHRlcnIgKz0gZHg7XG5cdCAgICBcdFx0eTEgKz0gc3k7XG5cdCAgICBcdH1cblx0ICAgIFx0Y29vcmRpbmF0ZXNBcnJheS5wdXNoKHt4OiB4MSwgeTogeTF9KTtcblx0ICAgIH1cblx0ICAgIHJldHVybiBjb29yZGluYXRlc0FycmF5O1xuXHR9XG59Iiwid2luZG93LkdlbmVyYXRvciA9IHJlcXVpcmUoJy4vR2VuZXJhdG9yLmNsYXNzJyk7XG53aW5kb3cuQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL0NhbnZhc1JlbmRlcmVyLmNsYXNzJyk7XG53aW5kb3cuS3JhbWdpbmVFeHBvcnRlciA9IHJlcXVpcmUoJy4vS3JhbWdpbmVFeHBvcnRlci5jbGFzcycpOyJdfQ==
