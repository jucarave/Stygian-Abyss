function Vec4(a, b, c, d){
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
}

Vec4.prototype.equals = function(a, b, c, d){
	if (c == undefined) c = 0;
	if (d == undefined) d = 0;
	
	if (arguments.length == 1){
		return (this.a == a.a && this.b == a.b && this.c == a.c && this.d == a.d);
	}else{
		return (this.a == a && this.b == b && this.c == c && this.d == d);
	}
};

Vec4.prototype.set = function(a, b, c, d){
	if (c == undefined) c = 0;
	if (d == undefined) d = 0;
	
	if (arguments.length == 1){
		this.a = a.a;
		this.b = a.b;
		this.c = a.c;
		this.d = a.d;
	}else{
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
	}
};

Vec4.prototype.clone = function(){
	return vec4(this.a, this.b, this.c, this.d);
};

Vec4.prototype.dot = function(vector){
	var result = this.a * vector.a + this.b * vector.b + this.c * vector.c + this.d * vector.d;
	return result;
};

Vec4.prototype.multiply = function(number){
	this.a *= number;
	this.b *= number;
	this.c *= number;
	this.d *= number;
	
	return this;
};

Vec4.prototype.sum = function(vector){
	this.a += vector.a;
	this.b += vector.b;
	this.c += vector.c;
	this.d += vector.d;
	
	return this;
};

function vec2(a, b){
	return new Vec4(a,b,0,0);
}

function vec3(a, b, c){
	return new Vec4(a,b,c,0);
}

function vec4(a, b, c, d){
	return new Vec4(a,b,c,d);
}