var ObjCount = 0;
var ObjList = [];

var Obj2Count = 0;
var Obj2List = [];

var abc = [0, 72, 144, 216, 288];
var cba = 0.5;

var ObjModel = function()
{
	this.name = "t";
	
	this.transform = {};
	
	this.vertices = [];
	this.indices = [];
	
	this.vertexNormals = [];
	this.faceNormals = [];
}

var Mouse = function() 
{ 
	this.firstMouse = true;
	this.lastX = canvas.width / 2.0;
	this.lastY = canvas.height / 2.0;

	this.sensitivity = 0.05;
	this.yaw = -90.0;
	this.pitch = 0.0;
}

var Camera = function() 
{ 
	this.fov = 45;

	this.rotation = 0.25;
	this.radius = 12;

	this.Pos = vec3.create();
	this.Front = vec3.create();
	this.Up = vec3.create();

	this.view = mat4.create();
}

var Transform = function()
{
	this.vel = vec3.create();
	this.pos = vec3.create();
	this.scale = vec3.create();
	this.destination = vec3.create();

	vec3.set(this.vel, 1, 1, 1);
	vec3.set(this.pos, 0, 0, 0);
	vec3.set(this.destination, 0, 0, 0);
	vec3.set(this.scale, 1, 1, 1);

	this.oldPosX = 0;
	this.oldPosY = 0;
	this.oldPosZ = 0;

	this.rotation = 0.0;
	this.axis = [1, 0, 0];

	this.lerp = 0.01;
}

var Clock = function()
{
	this.currTime = 0;
	this.lastTime = 0;
	this.elapsedTime = 0;
	this.time = 0;

	this.tick = 0;
}

var Data = function(link1, download1, download2)
{
	this.link = link1;
	this.download = download1;
	this.download2 = download2;
}

//Object
var Obj = function(name, models) 
{
	this.name = name;
	this.textured = false;
	this.shader = null;

	this.data = {};

	this.tint = [1.0, 1.0, 1.0, 1.0];

	this.meshes = models;
	this.models = {};

	this.TextureLocation;
	this.TextureID = 0;
	this.TextureUnit;

	this.vMatrix = mat4.create();
	this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
	this.pMatrix = mat4.create();

	this.transform = {};
	this.clock = {};
}

//Object
var Obj2 = function(name, vertices, indices) 
{
	this.name = name;
	this.inFocus = Focus.OFF;

	this.shader = null;
	this.pickShader = null;

	this.data = {};

	this.pickID;

	this.tint = [1.0, 1.0, 1.0, 1.0];

	this.vertexBuffer = vertices;
	this.indexBuffer = indices;

	this.texture = null;
	this.textureArray = [];
	this.textureID = 0;

	this.skybox = false;

	this.VertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	this.IndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	this.AttrLocPosition = -1;
	this.AttrLocTexCoords = -1;

	this.vMatrix = mat4.create();
	this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
	this.pMatrix = mat4.create();

	this.transform = {};
	this.clock = {};
}

function getObjIDbyName(name)
{
	for(var i = 0; i < ObjCount; i++)
	{
		if(ObjList[i].name == name)
		{
			return i;
		}
	}
	for(var i = 0; i < Obj2Count; i++)
	{
		if(Obj2List[i].name == name)
		{
			return i;
		}
 	}
 	return 0;
}

function getObjByName(name)
{
	for(var i = 0; i < ObjCount; i++)
	{
		if(ObjList[i].name == name)
		{
			return ObjList[i];
		}
 	}
	for(var i = 0; i < Obj2Count; i++)
	{
		if(Obj2List[i].name == name)
		{
			return Obj2List[i];
		}
 	}
 	return ObjList[0];
}

function updateTransform(obj, x, y, z)
{
	if(!isNaN(x))
	{
		obj.transform.oldPosX = obj.transform.pos[0];
		obj.transform.pos[0] = obj.transform.pos[0] + x;
	}
	if(!isNaN(y))
	{
		obj.transform.oldPosY = obj.transform.pos[1];
		obj.transform.pos[1] = obj.transform.pos[1] + y;
	}
	if(!isNaN(z))
	{
		obj.transform.oldPosZ = obj.transform.pos[2];
		obj.transform.pos[2] = obj.transform.pos[2] + z;
	}
}

function updateScale(obj, x, y, z)
{
	if(!isNaN(x))
	{
		obj.transform.scale[0] = obj.transform.scale[0] + x;
	}
	if(!isNaN(y))
	{
		obj.transform.scale[1] = obj.transform.scale[1] + y;
	}
	if(!isNaN(z))
	{
		obj.transform.scale[2] = obj.transform.scale[2] + z;
	}
}

function updateRotation(obj, rot)
{
	if(!isNaN(rot))
	{
		obj.transform.rotation = rot;
	}
}

function updateAxis(obj, Axis)
{
	if(Axis.length == 3)
	{
		obj.transform.axis = Axis;
	}
}

function radToDeg(r) 
{
	return r * 180 / Math.PI;
}

function degToRad(d)
{
	return d * Math.PI / 180;
}

function scaleAndSub(out, a, b, scale) 
{
  out[0] = a[0] - (b[0] * scale);
  out[1] = a[1] - (b[1] * scale);
  out[2] = a[2] - (b[2] * scale);
  return out;
}