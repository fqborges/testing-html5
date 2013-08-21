
var root = this;

(function() {

//--------------------
/**
 * Entity
 **/
var Entity = function(id, entityManager){
  this._em = entityManager;
  this.id = id;
  
  this._components = {};
};

/**
 * add( {string}, {object} )
 **/
Entity.prototype.add = function(name, component){
  this._components[name] =  component;
};

/**
 * get( {string} ) -> {object}
 **/
Entity.prototype.get = function(name){
  return this._components[name];
};

/**
 * has( {string} ) -> {boolean}
 **/
Entity.prototype.has = function(name){
  return !!this._components[name];
};

/**
 * toString() -> {string}
 **/
Entity.prototype.toString = function(){
  return '[Entity id=' + this.id + ']';
};

root.Entity = Entity;

})();