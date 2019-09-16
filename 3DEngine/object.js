var ObjCount = 0;
var ObjList = [];

var abc = [0, 72, 144, 216, 288];
var cba = 0.5;

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

	this.Pos = vec3.create();
	this.Front = vec3.create();
	this.Up = vec3.create();

	this.view = mat4.create();
}

var Model = function(Name, Mesh, Color)
{
	this.name = Name;
	
	this.transform = {};
	this.mesh = Mesh;

	this.color = vec3.create();
	this.shadingColor = [0.5, 0.5, 0.5, 1.0];
}

// Legacy Object Class
var Obj = function(name, Mesh) 
{
	this.name = name;
	this.inFocus = Focus.OFF;

	this.renderMode = RenderMode.Phong;
	this.shader = null;
	this.pickShader = null;

	this.skybox = false;
	this.animate = false;

	this.pickID;

	this.shadingColor = [1.0, 1.0, 1.0, 1.0];
	this.tint = [1.0, 1.0, 1.0, 1.0];

	this.transform = {};
	this.clock = {};

	this.mesh = Mesh;

	this.AttrLocPosition = -1;
	this.AttrLocTexCoords = -1;
	this.AttrLocNormal = -1;

	this.texture = null;
	this.textureArray = [];
	this.textureID = 0;

	this.vMatrix = mat4.create();
	this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
	this.pMatrix = mat4.create();

	this.MVPMatrix = mat4.create();
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