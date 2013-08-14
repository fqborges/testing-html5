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

//--------------------
/**
 * IdentifierPool
 **/
var IdentifierPool = function(){
  this._ids = [];
  this._nextID = 0;
};

/**
 * get() -> {int}
 **/
IdentifierPool.prototype.get = function(){
  return this._ids.length > 0 ?
         this._ids.pop() :
         this._nextID++;
}

/**
 * giveBack( {int} )
 **/
IdentifierPool.prototype.giveBack = function(id){
  this._ids.push(id);
}

//--------------------
/**
 * EntityManager
 **/
var EntityManager = function(){
  this._idPool = new IdentifierPool();
};

/**
 * createEntity() -> {Entity}
 **/
EntityManager.prototype.createEntity = function(){
  return new Entity(this._idPool.get(), this);
};

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
}

//--------------------
/**
 * Main
 **/

window.addEventListener('load', function() {
    var world = new World();
    
    world.addSystem( {
      acceptEntity : function(ent) {
        return ent.has('velocidade') && ent.has('posicao');
      },
      step : function(delta, entities) {
        var dt = delta / 1000;
        for (var i=0, ent; ent=entities[i]; i++) {
          if(!this.acceptEntity(ent)) continue;
          
          var v = ent.get('velocidade');
          var p = ent.get('posicao');
          
          p.x = p.x + v.x * dt;
          p.y = p.y + v.y * dt;
        }
      }
    } );
    
    var entity = world.createEntity();
    entity.add('velocidade', { x:1, y: 1} );
    entity.add('posicao', {x:0, y:0} );
    world.addEntity(entity);
    
    var steps = [200, 300, 500];
    
    for( var i=0, step; step = steps[i]; i++ ) {
      world.step(step);
      
      var p = entity.get('posicao');
      alert('[pos x=' + p.x + ', y=' + p.y + ']');
    }
    
});
