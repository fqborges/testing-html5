
var Director = {
  _scene : null,
  
  setScene : function(scene) {
    // end previous scene
    var prevScene = this._scene;
    if(prevScene && prevScene.endScene) {
      prevScene.endScene();
    }
    // replace scene
    this._scene = scene;
    // begin new scene
    if(scene && scene.beginScene) {
      scene.beginScene();
    }
  },
  
  unsetScene : function() {
    // remove any scene
    this.setScene(null);
  }
  
};

//--------------------
/**
 * Main
 **/

var em = new EntityManager();

window.addEventListener('load', function() {

  var ent = em.createEntity();
  alert(ent.id);
  
});
