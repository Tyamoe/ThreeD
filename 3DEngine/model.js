//Paths
var modelPath = "https://tyamoe.com/scripts/models/";
var cubePath = "https://tyamoe.com/scripts/models/cube/";

function loadObjFromVerts(name1, mesh, Shading, renderMode, Animate)
{	
	if(isString(mesh))
	{	
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", mesh);
		xhr.responseType = "blob";
		xhr.onload = function() 
		{
		    blob = xhr.response;
		    loadObj(blob, name1);
		}
		xhr.send();

		return;
	}

	ObjList.push(new Obj(name1, mesh));

	ObjList[ObjCount].transform = new Transform();
	ObjList[ObjCount].clock = new Clock();

	ObjList[ObjCount].renderMode = renderMode;
	ObjList[ObjCount].animate = Animate;

	if(renderMode == RenderMode.Skybox)
	{
		ObjList[ObjCount].skybox = true;
		ObjList[ObjCount].shader = shaderSkybox;

		ObjList[ObjCount].texture = loadCubeMap(gl, Shading);
		ObjList[ObjCount].transform.pos.z = 0;//-7;
		updateScale(ObjList[ObjCount], 34, 34, 34);

		ObjList[ObjCount].textureID = texturesLoaded;
		texturesLoaded++;
	}
	else if(renderMode == RenderMode.Texture)
	{
		ObjList[ObjCount].pickShader = shaderPick;
		ObjList[ObjCount].shader = shaderSmall;

		for(var i = 0; i < Shading.length; i++)
		{
			ObjList[ObjCount].textureArray[i] = loadTexture(gl, Shading[i]);
		}
		ObjList[ObjCount].texture = ObjList[ObjCount].textureArray[0];

		if(Animate)
		{
			var theta = (degToRad(abc[ObjCount]));

			var x = 6 * Math.sin(theta);
			var z = 6 * Math.cos(theta);

			ObjList[ObjCount].transform.pos[0] = x;
			ObjList[ObjCount].transform.pos[2] = z;
		}

		ObjList[ObjCount].textureID = texturesLoaded;
		texturesLoaded++;
	}
	else if(renderMode == RenderMode.Phong)
	{
		ObjList[ObjCount].pickShader = shaderPick;
		ObjList[ObjCount].shader = shaderPhong;

		ObjList[ObjCount].shadingColor = Shading;

		if(Animate)
		{
			var theta = (degToRad(abc[ObjCount]));

			var x = 6 * Math.sin(theta);
			var z = 6 * Math.cos(theta);

			ObjList[ObjCount].transform.pos[0] = x;
			ObjList[ObjCount].transform.pos[2] = z;
		}
	}

	ObjList[ObjCount].AttrLocPosition = gl.getAttribLocation(ObjList[ObjCount].shader, 'vertPosition');
	ObjList[ObjCount].AttrLocTexCoords = gl.getAttribLocation(ObjList[ObjCount].shader, 'vertTexCoord');
	ObjList[ObjCount].AttrLocNormal = gl.getAttribLocation(ObjList[ObjCount].shader, 'vertNormal');

	ObjCount++;

	return ObjList[ObjCount];
}

function loadTexture(gl, url) 
{
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  const pixel = new Uint8Array([0, 0, 255, 255]);  // Texture loading color

  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  const image = new Image();
  image.crossOrigin = "";
  image.onload = function() 
  {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
    {
       gl.generateMipmap(gl.TEXTURE_2D);
    } 
    else 
    {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };

  image.src = modelPath + url;

  return texture;
}

var texID;

function loadCubeMap(gl, imgAry)
{
	//	RIGHT,LEFT,TOP,BOTTOM,BACK,FRONT
	//	TEXTURE_CUBE_MAP_POSITIVE_X - Right	:: TEXTURE_CUBE_MAP_NEGATIVE_X - Left
	//	TEXTURE_CUBE_MAP_POSITIVE_Y - Top 	:: TEXTURE_CUBE_MAP_NEGATIVE_Y - Bottom
	//	TEXTURE_CUBE_MAP_POSITIVE_Z - Back	:: TEXTURE_CUBE_MAP_NEGATIVE_Z - Front

	texID = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	const image1 = new Image();
  	image1.crossOrigin = "";
	image1.src = cubePath + imgAry[0];
	image1.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
	}

	const image2 = new Image();
  	image2.crossOrigin = "";
	image2.src = cubePath + imgAry[1];
	image2.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
	}

	const image3 = new Image();
  	image3.crossOrigin = "";
	image3.src = cubePath + imgAry[2];
	image3.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
	}

	const image4 = new Image();
  	image4.crossOrigin = "";
	image4.src = cubePath + imgAry[3];
	image4.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
	}

	const image5 = new Image();
  	image5.crossOrigin = "";
	image5.src = cubePath + imgAry[4];
	image5.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image5);
		CanvasLoaded();
	}

	const image6 = new Image();
  	image6.crossOrigin = "";
	image6.src = cubePath + imgAry[5];
	image6.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image6);
	}

	return texID;
}

function loadObj(fileStream, Name)
{
	console.log("Loading: " + fileStream.name);
	var reader = new FileReader();
	
	reader.onload = function(progressEvent)
	{
		var Vertices = [];
		var NormalsVertices = [];
		var NormalsFace = [];
		var Indices = [];

		var NormalsVertexSum = [];
		
		var zero = vec3.create();
		vec3.set(zero, 0, 0, 0);
		var hasNormals = false;
		var lines = this.result.split('\n');
		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i].split(/\s+/);
			if(line && line.length > 0)
			{
				var lineType = line[0];
				
				if(lineType == "v")
				{
					Vertices.push(parseFloat(line[1]));
					Vertices.push(parseFloat(line[2]));
					Vertices.push(parseFloat(line[3]));

					NormalsVertexSum.push(vec3.set(vec3.create(), 0, 0, 0));
				}
				else if(lineType == "f")
				{
					Indices.push(parseInt(line[1]) - 1);
					Indices.push(parseInt(line[2]) - 1);
					Indices.push(parseInt(line[3]) - 1);
				}
				else if(lineType == "n")
				{
					hasNormals = true;
				}
			}
		}

		if(!hasNormals)
		{
			var v1 = vec3.create();
			var v2 = vec3.create();
			var v3 = vec3.create();

			var vec1 = vec3.create();
			var vec2 = vec3.create();

			var crossP = vec3.create();

			// Face Normals
			for(var i = 0; i < (Indices.length / 3); i++)
			{
				var ii = i * 3;
				var vi1 = Indices[ii + 0] * 3;
				var vi2 = Indices[ii + 1] * 3;
				var vi3 = Indices[ii + 2] * 3;

				vec3.set(v1, Vertices[vi1], Vertices[vi1 + 1], Vertices[vi1 + 2]);
				vec3.set(v2, Vertices[vi2], Vertices[vi2 + 1], Vertices[vi2 + 2]);
				vec3.set(v3, Vertices[vi3], Vertices[vi3 + 1], Vertices[vi3 + 2]);

				vec3.subtract(vec1, v1, v2);
				vec3.subtract(vec2, v1, v3);

				vec3.cross(crossP, vec1, vec2);
				vec3.normalize(crossP, crossP);

				NormalsFace.push(crossP[0]);
				NormalsFace.push(crossP[1]);
				NormalsFace.push(crossP[2]);

				NormalsVertexSum[vi1 / 3][0] += crossP[0];
				NormalsVertexSum[vi1 / 3][1] += crossP[1];
				NormalsVertexSum[vi1 / 3][2] += crossP[2];

				NormalsVertexSum[vi2 / 3][0] += crossP[0];
				NormalsVertexSum[vi2 / 3][1] += crossP[1];
				NormalsVertexSum[vi2 / 3][2] += crossP[2];

				NormalsVertexSum[vi3 / 3][0] += crossP[0];
				NormalsVertexSum[vi3 / 3][1] += crossP[1];
				NormalsVertexSum[vi3 / 3][2] += crossP[2];
			}

			// Vertex Normals
			for(var i = 0; i < Vertices.length; i += 3)
			{
				NormalsVertices.push(Vertices[i + 0]);
				NormalsVertices.push(Vertices[i + 1]);
				NormalsVertices.push(Vertices[i + 2]);

				vec3.normalize(vec1, NormalsVertexSum[i / 3]);

				NormalsVertices.push(vec1[0]);
				NormalsVertices.push(vec1[1]);
				NormalsVertices.push(vec1[2]);
			}
		}

		var NewMesh = new Mesh();
		NewMesh.vertices = NormalsVertices;
		NewMesh.indices = Indices;
		NewMesh.faceNormals = NormalsFace;
		NewMesh.makeBuffers();

		MeshLoaded.push(NewMesh);

		loadObjFromVerts(Name, NewMesh, [0.55, 0.55, 0.55, 1], RenderMode.Phong, false);
	};
	
	reader.readAsText(fileStream);
}

function isPowerOf2(value) 
{
  return (value & (value - 1)) == 0;
}

function isString (value) 
{
	return typeof value === 'string' || value instanceof String;
}
