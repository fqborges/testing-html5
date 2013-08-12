//--------------------
/**
 * IdentifierPool
 **/
var IdentifierPool = function(){
  this._nextID = 0;
};

IdentifierPool.prototype.get = function(){
  return this._nextID++;
}

//--------------------
/**
 * EntityManager
 **/
var EntityManager = function(){
  this._idPool = new IdentifierPool();
};

/**
 * createEntity -> Entity
 **/
EntityManager.prototype.createEntity = function(){
  return new Entity( this._idPool.get() );
};

//--------------------
/**
 * Entity
 **/
var Entity = function(id){
  this.id = id;
};

Entity.prototype.toString = function(){
  return '[Entity id=' + this.id + ']';
};

//--------------------
/**
 * World
 **/
var World = function(){
  this._em = new EntityManager();
};

/**
 * createEntity -> Entity
 **/
World.prototype.createEntity = function(){
  return this._em.createEntity();
};

//--------------------
/**
 * Main
 **/

window.addEventListener('load', function() {
    var world = new World();
    var entity = world.createEntity();
    alert(entity.toString());
    
    
});
