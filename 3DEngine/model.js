//Paths
var modelPath = "https://tyamoe.com/scripts/models/";
var cubePath = "https://tyamoe.com/scripts/models/cube/";

function loadObjFromVerts(name1, mesh, Shading, renderMode, Animate)
{	
	ObjectsLoaded++;
	if(isString(mesh))
	{	
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", mesh);
		xhr.responseType = "blob";
		xhr.onload = function() 
		{
		    blob = xhr.response;
		    loadObj(blob, name1, Shading, renderMode, Animate);
			
		ObjectsLoaded--;
			// Start Update Function
			//tick();
			return;
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

	return ObjList[ObjCount - 1];
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

function loadObj(fileStream, Name, Shading, renderMode, Animate)
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
		var posted = false;
		var zero = vec3.create();
		vec3.set(zero, 0, 0, 0);
		
		var MaxDis = 0.0;
		var MaxMag = 0.0;

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
					var vvv = vec3.create();
					vec3.set(vvv, parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));
					var dis = vec3.distance(vvv, zero);
					
					if(dis > MaxDis)
					{
						MaxDis =  dis;
						MaxMag = vec3.length(vvv);
					}
					
					Vertices.push(vvv[0]);
					Vertices.push(vvv[1]);
					Vertices.push(vvv[2]);

					NormalsVertexSum.push(vec3.set(vec3.create(), 0, 0, 0));
				}
				else if(lineType == "f")
				{	
					if(line[1].includes("/"))
					{
						for(var j = 1; j < line.length; j++)
						{
							line[j] = line[j].substring(0, line[j].search("/"));
						}
					}
					Indices.push(parseInt(line[1]) - 1);
					Indices.push(parseInt(line[2]) - 1);
					Indices.push(parseInt(line[3]) - 1);
					
					if(line.length > 4 && line[4] != "") 
					{
						/*if(!posted)
						{
							posted = true;
							console.log(Name + "*4: " + line.length);
							console.log(line);
						}*/
						for(var j = 4; j < line.length; j++)
						{
							Indices.push(parseInt(line[1]) - 1);
							Indices.push(parseInt(line[j - 1]) - 1);
							Indices.push(parseInt(line[j]) - 1);
						}
					}
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
			
			console.log("Ind: " + Indices.length + " | NVS: " + NormalsVertexSum.length);
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

			console.log("MaxMag: " + MaxMag + " | MaxDis: " + MaxDis);

			// Vertex Normals
			for(var i = 0; i < Vertices.length; i += 3)
			{
				/*
				T mapToRange(T val, Q r1s, Q r1e, Q r2s, Q r2e)
				{
					return (val - r1s) / (r1e - r1s) * (r2e - r2s) + r2s;
				}
				*/
				
				var oldLow = 0.0;
				var oldHigh = MaxMag;
				var newLow = -1.0;
				var newHigh = 1.0;
				//NormalsVertices.push(Vertices[i + 0]);
				//NormalsVertices.push(Vertices[i + 1]);
				//NormalsVertices.push(Vertices[i + 2]);
				NormalsVertices.push( ( (Vertices[i + 0] - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow) );
				NormalsVertices.push( ( (Vertices[i + 1] - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow) );
				NormalsVertices.push( ( (Vertices[i + 2] - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow) );

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

		return loadObjFromVerts(Name, NewMesh, Shading, renderMode, Animate);
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
