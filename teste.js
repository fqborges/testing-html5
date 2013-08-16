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
 * MovementSystem
 **/
var MovementSystem = function(){
  this._worldBox = null;
};

MovementSystem.prototype.addToWorld = function() {};

MovementSystem.prototype.removeFromWorld = function () {};

MovementSystem.prototype.step = function(delta, entities) {

  if(!this._worldBox) {
    for (var i=0, ent; ent=entities[i]; i++) {
      if(ent.has('worldBox')) {
        this._worldBox = ent;
        break;
      }
    }
    if(!this._worldBox) {
      return;
    }
  } else {
    if(!this._worldBox.has('worldBox')) {
      this._worldBox = null;
      return;
    }
  }
  
  var box = this._worldBox.get('worldBox');

  var dt = delta / 1000;
  for (var i=0, ent; ent=entities[i]; i++) {
    if(!this._acceptEntity(ent)) continue;
    
    var v = ent.get('velocidade');
    var p = ent.get('posicao');
    
    var px = p.x + v.x * dt;
    var py = p.y + v.y * dt;
    
    if( px < box.left ) { 
      px = box.left;
      v.x = -v.x;
    } else if ( px > box.right) {
      px = box.right;
      v.x = -v.x;
    }
    
    if( py < box.top ) { 
      py = box.top;
      v.y = -v.y;
    } else if ( py > box.bottom) {
      py = box.bottom;
      v.y = -v.y;
    }
    
    p.x = px;
    p.y = py;
  }
};

MovementSystem.prototype._acceptEntity = function(ent) {
  return ent.has('velocidade') && ent.has('posicao');
};

//--------------------
/**
 * DisplaySystem
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
 * EntityFactory
 **/
var EntityFactory = function(world){
  this._world = world;
};

EntityFactory.prototype.createBall = function(px, py, vx, vy, color) {
  px = px||0;
  py = py||0;
  vx = vx||0;
  vy = vy||0;
  var world = this._world;
  var entity = world.createEntity();
  entity.add('velocidade', { x:vx, y: vy} );
  entity.add('posicao', { x:px, y:py } );
  entity.add('display', { displayObject: this._createCircleShape(color) }); 
  
  world.addEntity(entity);
};

EntityFactory.prototype.createWorldBox = function(top, bottom, left, right) {
  top = top || 0;
  bottom = bottom || 240;
  left = left || 0;
  right = right || 320;
  
  var world = this._world;
  var entity = world.createEntity();
  entity.add('worldBox', { top:top, bottom:bottom, left:left, right:right } );
  
  world.addEntity(entity);
};

EntityFactory.prototype._createCircleShape = function(color) {
  color = color||'red';
  var circle = new createjs.Shape();
  
  circle.graphics.beginFill(color).drawCircle(0, 0, 10);
  circle.x = 100;
  circle.y = 100;
  
  return circle;
};

//--------------------
/**
 * Main
 **/

var main = function() {
  
    var fpsDiv = document.getElementById('fps');

    var world = new World();
    var factory = new EntityFactory(world);
    
    world.addSystem( new MovementSystem() );
    world.addSystem( new DisplaySystem() );
    
    factory.createWorldBox();
    
    var colors = ['red','blue','green','black','orange'];
    for(var i = 0; i<250; i++ ) {
      factory.createBall(
          20*Math.random(), 
          20*Math.random(),
          55 + 45*Math.random(), 
          55 + 45*Math.random(),
          colors[i%5]
      );
    }
    
    createjs.Ticker.addEventListener('tick', tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(60);
    function tick(event) { 
      if(!event.paused) {
        world.step(event.delta);
      }
      fpsDiv.innerHTML = String( createjs.Ticker.getMeasuredFPS() );
    };
};

var pause = function() {
  var paused = createjs.Ticker.getPaused();
  createjs.Ticker.setPaused(!paused);
}

root.Teste.main = main;
root.Teste.pause = pause;

})(this);
