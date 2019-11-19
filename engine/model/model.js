var ModelCount = 0;
var ModelList = [];

var Model = function(name, Mesh) 
{
	this.name = name;
	this.draw = true;
	this.angle = 0;

	this.transform = {};
	this.mesh = Mesh;

	this.shadingColor = [1.0, 1.0, 1.0, 1.0];
	this.tint = [1.0, 1.0, 1.0, 1.0];

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

function CreateModel(name1, mesh, transform = null, show = true)
{	
	if(isString(mesh))
	{	
		mesh = modelPath + mesh;
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", mesh);
		xhr.responseType = "blob";
		xhr.onload = function() 
		{
		    blob = xhr.response;
		    blob.name = mesh;
		    loadOBJ(blob, name1, transform, show);
			
			ObjectsLoaded--;
			return;
		}
		xhr.send();
		return;
	}

	ModelList.push(new Obj(name1, mesh));
	if(transform == null)
	{
		ModelList[ModelCount].transform = new Transform();
	}
	else 
	{
		ModelList[ModelCount].transform = transform;
	}

	ModelList[ModelCount].draw = show;
	
	ModelList[ModelCount].AttrLocPosition = gl.getAttribLocation(shaderPhongLighting, 'vertPosition');
	ModelList[ModelCount].AttrLocTexCoords = gl.getAttribLocation(shaderPhongLighting, 'vertTexCoord');
	ModelList[ModelCount].AttrLocNormal = gl.getAttribLocation(shaderPhongLighting, 'vertNormal');

	ModelCount++;

	return ModelList[ModelCount - 1];
}

function getObjIDbyName(name)
{
	for(var i = 0; i < ObjCount; i++)
	{
		if(ModelList[i].name == name)
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
		if(ModelList[i].name == name)
		{
			return ModelList[i];
		}
 	}
 	return ModelList[0];
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