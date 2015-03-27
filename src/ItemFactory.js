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
