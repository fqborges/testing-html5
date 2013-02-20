(function() {
  
  var Camera = function(context) {
    this.context = context;
    var canvas = context.canvas;
    
    this.cx = 0;
    this.cy = 0;
    this.w = canvas.width*0.5;
    this.h = canvas.height*0.5;
    this.a = 0;
    
    this.viewport = {
      x:0,
      y:0,
      w:canvas.width,
      h:canvas.height
    };
     
  };

  Camera.prototype = {
    
    begin: function() {
      this.context.save();
      this._applyRotation();
      this._applyScale();
      this._applyTranslation();
    },
    
    end: function() {
      this.context.restore();
    },
    
    _applyScale: function() {
      var sx = this.viewport.w / this.w;
      var sy = this.viewport.h / this.h;
      this.context.scale(sx, sy);
    },
    
    _applyTranslation: function() {
      var tx = this.viewport.x - this.cx + this.w*0.5;
      var ty = this.viewport.y - this.cy + this.h*0.5;
      this.context.translate(tx, ty);
    },
    
    _applyRotation: function() {
      this.context.translate(this.cx, this.cy);
      this.context.rotate(this.a*Math.PI/180);
      this.context.translate(-this.cx, -this.cy);
    },
    
    resize: function(w, h){
      this.w = w;
      this.h = h;
    },
    
    lookAt: function(x, y) {
      this.cx = x;
      this.cy = y;
    },
    
    translate: function(dx, dy) {
      this.lookAt(this.cx + dx, this.cy + dy);
    },
    
    rotate: function(a) {
      this.a = (this.a + a)%360;
    }
  };
  
  var _oldCamera = this.Camera;
  this.Camera = Camera;
  
  Camera.noConflict = function() {
    this.Camera = oldCamera;
    return this;
  };
  
}).call(this);