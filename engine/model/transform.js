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