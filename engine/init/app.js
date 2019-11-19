var gl;
var canvas = null;

var camera;
var mouse;

var shaderSkybox = {};
var shaderSmall = {};
var shaderPick = {};
var shaderLine = {};
var shaderPhong = {};
var shaderPhongLighting = {};
var shaderDiffuse = {};
var shaderBlinn = {};

var WebGlInitialized = false;

function InitEngine()
{
	canvas = document.getElementById('GLContext');
	gl = canvas.getContext('webgl2', { antialias: true });

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

	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.depthFunc(gl.LEQUAL);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0.12, 0.12, 0.12, 1.0);

	mouse = new Mouse();
	camera = new Camera();
	
	makeShaders();

	setup();

	tick();
}
