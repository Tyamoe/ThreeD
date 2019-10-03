// WebGL context
var gl;
// the canvas element
var canvas = null;

var camera;

var mouse;

var dt = 0.016;

var Paused = false;
var Rendering = true;

var ObjInFocus = -1;

// main shader program
var shaderSkybox = null;
var shaderSmall = null;
var shaderPick = null;
var shaderPhong = null;
var shaderLine = null;

var texturesLoaded = 0;
var modelsLoaded = false;
var WebGlInitialized = false;

var firefox = false;

var modelCount = 0;

function InitWebGL()
{
	canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl2', { antialias: true });

	canvas.onmousedown = function(ev) 
	{
		var x = ev.clientX, y = ev.clientY;

		var rect = ev.target.getBoundingClientRect();

		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) 
		{
			x = x - rect.left, y = rect.bottom - y;
			Pick(x, y);
		}
 	}

	if (!gl) 
	{
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) 
	{
		alert('Your browser does not support WebGL');
		return;
	}

	WebGlInitialized = true;

	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.cullFace(gl.BACK);									//Back is also default
	gl.frontFace(gl.CCW);									//Dont really need to set it, its ccw by default.
	gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
	gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
	gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending
	gl.clearColor(0.12, 0.12, 0.12, 1.0);	  //Set clear color

	mouse = new Mouse();
	
	makeShaders();
	makeMeshes();

	makeScene();

	// Start Update Function
	tick();
}
