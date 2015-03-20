var circular = {
	currentId: 1,
	transients: {},
	reviverFunctions: {},
	prototypes: {}
};

/**
 * All classes for Circular objects should be registered
 */
circular.registerClass = function(type, class_){
	circular.prototypes[type] = class_;
};

/**
 * Optionally, some classes may have reviver associated
 * TODO: Merge with registerClass
 */
circular.setReviver = function(typeId, reviverFunction){
	circular.reviverFunctions[typeId] = reviverFunction;
};

/**
 * Used to create an object's _c attribute for
 * an object that requires circular serialization.
 */
circular.register = function(type){
	return {
		type: type,
		uid: circular.currentId++
	};
};

/**
 * Used to create an object's _c attribute for
 * an object that doesn't require circular 
 * serialization.
 */
circular.setSafe = function(){
	return {
		isCircularSafe: true
	};
};

/**
 * Marks a field as transient for a type
 * TODO: Merge with registerClass as an additional param
 */
circular.setTransient = function(type, attributeName) {
	if (!circular.transients[type]){
		circular.transients[type] = {};
	}
	circular.transients[type][attributeName] = true;
};

circular._isTransient = function(type, attributeName) {
	return circular.transients[type] && circular.transients[type][attributeName];
};

/**
 * Returns a serialized version of the object, replacing all
 * object fields to pointers to a master table.
 */
circular.serialize = function (object){
	var objectMap = {};
	var serializableObject = circular._serializeObject(object, objectMap);
	var returnData = {
		object: serializableObject,
		references: objectMap
	};
	return JSON.stringify(returnData);
};

circular._serializeObject = function (object, objectMap){
	var serializableObject = null;
	if (isArray(object)){
		serializableObject = new Array();
	} else {
		serializableObject = {};
	}
	if (!object._c && !isArray(object)){
		console.log(object);
		throw "ERROR: "+(typeof object)+" without Circular metadata...";
	} else if (!isArray(object)){
		// Reference the serialized object in the object map
		objectMap["x"+object._c.uid] = serializableObject;
	}
	for (var component in object){
		var componentName = component;
		var attribute = object[componentName];
		if (!isArray(object) && circular._isTransient(object._c.type, componentName)){
			// Skip transient attributes
			continue;
		} else if (typeof attribute == 'function'){
			// Functions are not saved
			continue;
		} else if (componentName === '_c'){
			// Circular metadata is saved verbatim
			serializableObject[componentName] = attribute;
		} else if (isArray(attribute)){
			// Arrays are always serialized, no need to check for metadata
			serializableObject[componentName] = circular._serializeObject(attribute, objectMap);
		} else if (attribute == null || typeof attribute !== "object"){
			// Native values are saved verbatim
			serializableObject[componentName] = attribute;
		} else {
			// An Object that might be serialized
			if (attribute._c){
				if (attribute._c.isCircularSafe){
					serializableObject[componentName] = object[componentName];
				} else {
					if (!objectMap["x"+attribute._c.uid]){
						objectMap["x"+attribute._c.uid] = circular._serializeObject(attribute, objectMap);
					}
					serializableObject[componentName] = attribute._c;
				}
			} else {
				if (object._c){
					throw "ERROR: "+componentName+" attribute from circular type "+object._c.type+" has no Circular metadata";
				} else {
					throw "ERROR: ["+componentName+"] attribute from non circular object has no Circular metadata";
				}
			}
		}
	}
	return serializableObject;
};

circular.parse = function(json, reviverData){
	var serializedObject = JSON.parse(json);
	var objectMap = [];
	return circular._deserializeObject(serializedObject.object, serializedObject.references, objectMap, reviverData);
};

circular._deserializeObject = function (object, references, objectMap, reviverData){
	var deserializedObject = null;
	if (isArray(object)){
		deserializedObject = [];
	} else if (object._c){
		if (circular.prototypes[object._c.type]){
			deserializedObject = new circular.prototypes[object._c.type]();
		} else {
			console.log("Warning: prototype for "+object._c.type+" was not found, using {}");
			deserializedObject = {};
		}
		objectMap["x"+object._c.uid] = deserializedObject;
		if (object._c.uid > circular.currentId){
			// Update the circular currentId index, to avoid new objects to overlap with existing for future cerealizations
			circular.currentId = object._c.uid;
		}
	}
	for (var component in object){
		var componentName = component;
		var attribute = object[componentName]; 
		if (componentName === '_c'){
			deserializedObject[componentName] = object[componentName];
			// Circular metadata is restored verbatim
		} else if (isArray(attribute)){
			deserializedObject[componentName] = circular._deserializeObject(attribute, references, objectMap, reviverData);
		} else if (
			attribute &&
			typeof attribute == "object" &&
			attribute.type && 
			attribute.uid){
			if (!objectMap["x"+attribute.uid]){
				circular._deserializeObject(references["x"+attribute.uid], references, objectMap, reviverData);
				if (circular.reviverFunctions[attribute.type]){
					circular.reviverFunctions[attribute.type](objectMap["x"+attribute.uid], reviverData);
				}
			}
			deserializedObject[componentName] = objectMap["x"+attribute.uid];
		} else {
			deserializedObject[componentName] = attribute;
		}
	}
	return deserializedObject;
};

circular.test = function(){
	var country = {
		_c: {
			uid: 1,
			type: 'Country'
		},
		name: 'Colombia'
	};
	var people = [{
		_c: {
			uid: 2,
			type: 'Person'
		},
		name: 'Jhon',
		age: 400,
		country: country
	}, {
		_c: {
			uid: 3,
			type: 'Person'
		},
		name: 'Sarah',
		age: 300,
		country: country
	}];
	circular.setTransient('Person', 'age');
	country.leader = people[0];
	console.log("Original Data");
	console.log(people);
	var serialized = circular.serialize(people);
	console.log("Serialized Data");
	console.log(JSON.parse(serialized));
	var deserialized = circular.parse(serialized);
	console.log("De-cerealized Data");
	console.log(deserialized);
};

function isArray(object){
	return Object.prototype.toString.call( object ) === '[object Array]';
}