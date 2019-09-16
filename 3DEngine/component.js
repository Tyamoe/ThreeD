var Mesh = function()
{
	this.vertices = [];
	this.indices = [];
	
	this.faceNormals = [];

	this.VertexBufferObject = null;
	this.IndexBufferObject = null;

	this.makeBuffers = function ()
	{
		this.VertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		this.IndexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
	}
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

// Component Funcs
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