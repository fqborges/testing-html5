this.Teste = this.Teste || {};

(function(root){

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
 * giveBack({int})
 **/
IdentifierPool.prototype.giveBack = function(id){
  this._ids.push(id);
}

//--------------------
/**
 * EntityManager
 **/
var EntityManager = function(){
  this._componentMappers = {};
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
  system.addToWorld();
}

//--------------------
/**
 * 
 **/
var MovementSystem = function(){};

MovementSystem.prototype.addToWorld = function() {};

MovementSystem.prototype.removeFromWorld = function () {};

MovementSystem.prototype.step = function(delta, entities) {
  var dt = delta / 1000;
  for (var i=0, ent; ent=entities[i]; i++) {
    if(!this._acceptEntity(ent)) continue;
    
    var v = ent.get('velocidade');
    var p = ent.get('posicao');
    
    p.x = p.x + v.x * dt;
    p.y = p.y + v.y * dt;
  }
};

MovementSystem.prototype._acceptEntity = function(ent) {
  return ent.has('velocidade') && ent.has('posicao');
};

//--------------------
/**
 * 
 **/
var DisplaySystem = function(){
  this.stage = null;
  this._displayObjects = {};
};

DisplaySystem.prototype.addToWorld = function() {
  var stage = new createjs.Stage('canvas'); 
  stage.snapPixelsEnabled = true;
  this.stage = stage;
};

DisplaySystem.prototype.removeFromWorld = function () {};

DisplaySystem.prototype.step = function(delta, entities) {
  var dt = delta / 1000;
  var displayObject;
  
  for (var i=0, ent; ent=entities[i]; i++) {
    displayObject = this._displayObjects[ent.id];
    
    if(!this._acceptEntity(ent)) {
      if(displayObject) {
        stage.removeChild(displayObject);
        this._displayObjects[ent.id] = null;
      }
      continue;
    } else {
      var d = ent.get('display');
      var p = ent.get('posicao');
      
      if(!displayObject) {
        this._displayObjects[ent.id] = displayObject = d.displayObject;
        this.stage.addChild(displayObject);
      }
      
      displayObject.x = p.x;
      displayObject.y = p.y;
    }
  }
  
  this.stage.update();
};

DisplaySystem.prototype._acceptEntity = function(ent) {
  return ent.has('display') && ent.has('posicao');
};

//--------------------
/**
 * Main
 **/

var main = function() {
    var world = new World();
    
    world.addSystem( new MovementSystem() );
    world.addSystem( new DisplaySystem() );
    
    var entity = world.createEntity();
    entity.add('velocidade', { x:100, y: 50} );
    entity.add('posicao', {x:0, y:0} );

    var circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 10);
    circle.x = 100;
    circle.y = 100;    
    
    entity.add('display', { displayObject: circle }); 
    
    world.addEntity(entity);
    
    createjs.Ticker.addEventListener('tick', tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS = 60;
    //function tick(event) { 
    //  world.step(event.delta);
    
    //};
    
    var stage, circle;
    stage = new createjs.Stage("canvas");
    
    circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 40);
    circle.y = 50;
    stage.addChild(circle);
  	
		function tick(event) {
			circle.x = circle.x + 5;
			if (circle.x > stage.canvas.width) { circle.x = 0; }
			stage.update(event); // important!!
		}
    
    //for( var i=0, step; step = steps[i]; i++ ) {
    //  world.step(step);
      
    //  var p = entity.get('posicao');
    //  alert('[pos x=' + p.x + ', y=' + p.y + ']');
    //}
};

root.Teste.main = main;

})(this);
