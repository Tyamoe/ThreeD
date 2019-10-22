//Paths
var modelPath = "https://tyamoe.com/scripts/models/";
var cubePath = "https://tyamoe.com/scripts/models/cube/";

function loadObjFromVerts(name1, mesh, Shading, renderMode, Animate)
{	
	ObjectsLoaded++;
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
		    loadObj(blob, name1, Shading, renderMode, Animate);
			
			ObjectsLoaded--;
			return;
		}
		xhr.send();
		return;
	}

	ObjList.push(new Obj(name1, mesh));

	ObjList[ObjCount].transform = new Transform();
	ObjList[ObjCount].renderMode = renderMode;
	ObjList[ObjCount].animate = Animate;

	if(renderMode == RenderMode.Skybox)
	{
		ObjList[ObjCount].skybox = true;
		ObjList[ObjCount].shader = shaderSkybox;

		ObjList[ObjCount].texture = loadCubeMap(gl, Shading);
		ObjList[ObjCount].transform.pos.z = 0;//-7;
		updateScale(ObjList[ObjCount], 154, 154, 154);

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
			var currObj = 0;

			var iterator1 = abc[Symbol.iterator]();

			for (let item of iterator1) 
			{
				if(item[1] == false)
				{
					currObj = item[0];
					abc.set(item[0], true);
					break;
				}
			}

			var theta = (degToRad(currObj));

			var x = 8 * Math.sin(theta);
			var z = 8 * Math.cos(theta);

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
			var currObj = 0;

			var iterator1 = abc[Symbol.iterator]();

			for (let item of iterator1) 
			{
				if(item[1] == false)
				{
					currObj = item[0];
					abc.set(item[0], true);
					break;
				}
			}

			var theta = (degToRad(currObj));

			var x = 3 * Math.sin(theta);
			var z = 3 * Math.cos(theta);

			ObjList[ObjCount].angle = currObj;
			ObjList[ObjCount].transform.pos[0] = x;
			ObjList[ObjCount].transform.pos[2] = z;
		}
		else
		{
			//ObjList[ObjCount].draw = false;
			updateScale(ObjList[ObjCount], 0, 0, 0);
			//updateTransform(ObjList[ObjCount], 5, -2, 0);
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
	var meshLoaded = IsMeshLoaded(fileStream.name);
	if(meshLoaded != false)
	{
		console.log("Already Loaded: " + meshLoaded.name);
		return loadObjFromVerts(Name, meshLoaded, Shading, renderMode, Animate);
	}
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

		var minX = 10000.0;
		var maxX = -10000.0;
		var minY = 10000.0;
		var maxY = -10000.0;
		var minZ = 10000.0;
		var maxZ = -10000.0;

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

					minX = minX > vvv[0] ? vvv[0] : minX;
					minY = minY > vvv[1] ? vvv[1] : minY;
					minZ = minZ > vvv[2] ? vvv[2] : minZ;

					maxX = maxX < vvv[0] ? vvv[0] : maxX;
					maxY = maxY < vvv[1] ? vvv[1] : maxY;
					maxZ = maxZ < vvv[2] ? vvv[2] : maxZ;
					
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

			var w = Math.abs(maxX - minX);
			var h = Math.abs(maxY - minY);
			var d = Math.abs(maxZ - minZ);

			var dx = maxX + minX; //
			var dy = maxY + minY; //
			var dz = maxZ + minZ; //

			var sx = (dx / 2.0); //
			var sy = (dy / 2.0); //
			var sz = (dz / 2.0); //

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

				var x = (Vertices[vi1] + Vertices[vi2] + Vertices[vi3]) / 3.0;
				var y = (Vertices[vi1 + 1] + Vertices[vi2 + 1] + Vertices[vi3 + 1]) / 3.0;
				var z = (Vertices[vi1 + 2] + Vertices[vi2 + 2] + Vertices[vi3 + 2]) / 3.0;

				var oldLow = 0.0;
				var oldHigh = MaxMag;
				var newLow = -1.0;
				var newHigh = 1.0;

				if(!Animate)
				{
					x -= sx; //
					y -= sy; //
					z -= sz; //
				}

				x = ( (x - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);
				y = ( (y - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);
				z = ( (z - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);

				vec3.subtract(vec1, v1, v2);
				vec3.subtract(vec2, v1, v3);

				vec3.cross(crossP, vec1, vec2);
				vec3.normalize(crossP, crossP);

				NormalsFace.push(x);
				NormalsFace.push(y);
				NormalsFace.push(z);
				NormalsFace.push(x + (crossP[0] * 0.02));
				NormalsFace.push(y + (crossP[1] * 0.02));
				NormalsFace.push(z + (crossP[2] * 0.02));

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

			//console.log("MaxMag: " + MaxMag + " | MaxDis: " + MaxDis);

			// Vertex Normals
			for(var i = 0; i < Vertices.length; i += 3)
			{
				var oldLow = 0.0;
				var oldHigh = MaxMag;
				var newLow = -1.0;
				var newHigh = 1.0;

				var x = Vertices[i + 0];
				var y = Vertices[i + 1];
				var z = Vertices[i + 2];

				if(!Animate)
				{
					x -= sx;
					y -= sy;
					z -= sz;
				}
				
				x = ( (x - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);
				y = ( (y - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);
				z = ( (z - oldLow) / (oldHigh - oldLow) ) * (newHigh - newLow + newLow);
				NormalsVertices.push( x );
				NormalsVertices.push( y );
				NormalsVertices.push( z );

				vec3.normalize(vec1, NormalsVertexSum[i / 3]);

				NormalsVertices.push(x + (vec1[0] * 0.02));
				NormalsVertices.push(y + (vec1[1] * 0.02));
				NormalsVertices.push(z + (vec1[2] * 0.02));
			}
		}

		var NewMesh = new Mesh(fileStream.name);
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

function isString(value) 
{
	return typeof value === 'string' || value instanceof String;
}
