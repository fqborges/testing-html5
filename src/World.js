
(function(root) {

//--------------------
/**
 * World
 **/
var World = function(){
  this._systems = [];
  this._ents = [];
  this._em = new EntityManager();
};

/**
 * createEntity -> {Entity}
 **/
World.prototype.createEntity = function(){
  return this._em.createEntity();
};

/**
 * addEntity( {Entity} )
 **/
World.prototype.addEntity = function(entity){
  return this._ents.push(entity);
};

/**
 * step( {number} )
 **/
World.prototype.step = function(delta) {
  var systems = this._systems;
  for(var i=0, sys; sys=systems[i]; i++ ) {
    sys.step && sys.step(delta, this._ents);
  }
}

/**
 * addSystem( {object} )
 **/
World.prototype.addSystem = function(system) {
  this._systems.push(system);
  system.addToWorld();
}

root.World = World;

})(this);