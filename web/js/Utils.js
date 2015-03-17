function addEvent(obj, type, func){
	if (obj.addEventListener){
		obj.addEventListener(type, func, false);
	}else if (obj.attachEvent){
		obj.attachEvent("on" + type, func);
	}
}

function $$(objId){
	var elem = document.getElementById(objId);
	if (!elem) alert("Couldn't find element: " + objId);
	return elem;
}

function getHttp(){
	var http;
	if  (window.XMLHttpRequest){
		http = new XMLHttpRequest();
	}else if (window.ActiveXObject){
		http = new window.ActiveXObject("Microsoft.XMLHTTP");
	}
	
	return http;
}

function rollDice(param){
	var a = parseInt(param.substring(0, param.indexOf('D')), 10);
	var b = parseInt(param.substring(param.indexOf('D') + 1), 10);
	var roll1 = Math.round(Math.random() * b);
	var roll2 = Math.round(Math.random() * b);
	return Math.ceil(a * (roll1+roll2)/2);
};

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