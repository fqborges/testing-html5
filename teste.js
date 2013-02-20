;/**/
 
/* begin - https://gist.github.com/paulirish/1579671 at 19/02/2013 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
*/
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
/* end - https://gist.github.com/paulirish/1579671 at 19/02/2013 */

var G = new (function() {
  /* @privates */
  var entities = [];
  var nextEntityID = 0;
  
  this.createEntity = function createEntity(entity)
  {
    entity.id = nextEntityID;
    nextEntityID += 1;
    
    entities.push(entity);
  }
  
  this.getEntities = function getEntities() {
    return entities.slice(0);
  }
  
})();

var BLOCK_SIZE = 16;
var stage = {
  w:7,
  h:7,
  data:[ ['#', '#', '#', '#', '#', '#', '#'],
         ['#', ' ', ' ', ' ', ' ', ' ', '#'],
         ['#', ' ', ' ', ' ', ' ', ' ', '#'],
         ['s', ' ', ' ', 'n', ' ', ' ', 'e'],
         ['#', ' ', ' ', '#', ' ', ' ', '#'],
         ['#', ' ', ' ', '#', ' ', ' ', '#'],
         ['#', '#', '#', '#', '#', '#', '#'] ]
};

var D = new (function() {
  /* @privates */
  var ctx = null;

  this.setup = function(canvas) {
    ctx = canvas.getContext("2d");
    D.ctx = ctx;
    ctx.lineJoin="round";
    ctx.lineCap="round";
    ctx.translate(10, 10);
    ctx.fillStyle="#ffffff";
    ctx.strokeStyle="#white";
    //ctx.lineWidth = 2;
    //ctx.lineCap="square";
  };
  
  this.drawStage = function(w, h) {
    ctx.fillRect( 0, 0, w*BLOCK_SIZE, h*BLOCK_SIZE );
  };
  
  this.drawBlock = function(e) {
    var x = e.x, y=e.y;
    var c = ctx.lineWidth/2;
    ctx.strokeRect( x*BLOCK_SIZE+c, y*BLOCK_SIZE+c, BLOCK_SIZE, BLOCK_SIZE );
    var s = BLOCK_SIZE/8;
    ctx.strokeRect( x*BLOCK_SIZE+s+c, y*BLOCK_SIZE+s+c, BLOCK_SIZE-2*s, BLOCK_SIZE-2*s );
  };
  
  this.drawStart = function(e) {
    var x = e.x, y=e.y;
    var c = ctx.lineWidth/2
    var cx = c + (x+0.5)*BLOCK_SIZE;
    var cy = c + (y+0.5)*BLOCK_SIZE;
    var r = BLOCK_SIZE/2-1;
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    r -= 2;
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy - (r-1));
    ctx.moveTo(cx + r, cy);
    ctx.lineTo(cx, cy + (r-1));
    ctx.stroke();
  };
  
  this.drawNode = function(e) {
    var x = e.x, y=e.y;
    var c = ctx.lineWidth/2
    var cx = c + (x+0.5)*BLOCK_SIZE;
    var cy = c + (y+0.5)*BLOCK_SIZE;
    var r = BLOCK_SIZE/2-1;
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.10*Math.PI, 1.9*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();
  };
  
  this.drawEnd = function(e) {
    var x = e.x, y=e.y;
    var c = ctx.lineWidth/2
    var cx = c + (x+0.5)*BLOCK_SIZE;
    var cy = c + (y+0.5)*BLOCK_SIZE;
    var r = BLOCK_SIZE/2-1;
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    r -= 2;
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    r -= 2;
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.stroke();
  };
  
  this.drawImage = function(e) {
    var x = e.x, y=e.y, img=e.image;
    ctx.drawImage(img,x*BLOCK_SIZE,y*BLOCK_SIZE);
  };
  
  this.drawSelection = function(x, y) {
    var ctx = this.ctx;
    var r = 1;
    var c = this.ctx.lineWidth/2
    var cx = c + x + r;
    var cy = c + y + r;
    var bkp = ctx.fillStyle;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = bkp;
  };
})();

var selection = null;

var I = {};
I.setup = function(canvas) {
  canvas.onclick = function(e) {
      e = e || window.event;

      var target = e.target || e.srcElement,
          rect = target.getBoundingClientRect(),
          offsetX = e.clientX - rect.left,
          offsetY = e.clientY - rect.top;

      I.onclick && I.onclick(offsetX, offsetY);
      console.log([offsetX, offsetY, target]);
  };
};


var A = new (function() {
  
  var images = {};
  
  this loadImage = function(src) {
    var img = new Image(150,20);
    var done = false;
    img.onload = function() {
      this.images[src] = img;
    }
    img.src = 'images/' + src;
  }
  
  this.getImage = function(src) {
    
  }
  
})();



function setup() {
  
  images.push(loadImage('block.png'));
  images.push(loadImage('end.png'));
  images.push(loadImage('note.png'));
  images.push(loadImage('start.png'));

  var canvas = document.getElementById('canvas');
  D.setup(canvas);
  I.setup(canvas);
  I.onclick = function(x, y) {
    selection || (selection = {});
    selection.x = x;
    selection.y = y;
  };
  
  for(var x = 0; x<stage.w; x++ ) {
    for(var y = 0; y<stage.h; y++ ) {
      var col=x, row=y;
      var item = stage.data[row][col];
      
      switch(item) {
        case '#': G.createEntity( {x:x, y:y, draw:D.drawImage, image:images[0] } ); break;
        case 's': G.createEntity( {x:x, y:y, draw:D.drawImage, image:images[1]} ); break;
        case 'n': G.createEntity( {x:x, y:y, draw:D.drawImage, image:images[2]} ); break;
        case 'e': G.createEntity( {x:x, y:y, draw:D.drawImage, image:images[3]} ); break;
        default: break;
      }
    }
  }
}

function update(dt) {
  D.drawStage(stage.w, stage.h, D.ctx);
  var entities = G.getEntities();
  for(var i = 0; i<entities.length; i++ ) {
    var e = entities[i];
    e.draw && e.draw(e);
  }
  
  if(selection) {
    D.drawSelection(selection.x, selection.y, D.ctx);
  }
}

/**
  Main
*/
window.addEventListener('load', function() {

  setup();
  
  var lastTime = new Date().getTime();
  var loop = function(time) {
    window.requestAnimationFrame( loop );
  
    var currTime = new Date().getTime();
    var dt = currTime - lastTime;
  
    update(dt);
  };
  window.requestAnimationFrame( loop );
  
});
