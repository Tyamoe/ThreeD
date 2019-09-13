//Paths
var modelPath = "";//"https://tyamoe.com/scripts/models/"
var cubePath = "images/";//"https://tyamoe.com/scripts/models/cube/"

function IncrementCount()
{
	ObjCount++;
  //console.log("Incrementing Count: ", ObjCount);
}

//Objects/Models

function loadObjFromVerts(name1, Vertices, Indices, textArray, skybox)
{	
	Obj2List.push(new Obj2(name1, Vertices, Indices));

	Obj2List[Obj2Count].transform = new Transform();
	Obj2List[Obj2Count].clock = new Clock();

	Obj2List[Obj2Count].skybox = skybox;

	if(!skybox)
	{
		Obj2List[Obj2Count].pickShader = shaderPick;
	}

	Obj2List[Obj2Count].shader = (skybox) ? shaderSkybox : shaderSmall;

	Obj2List[Obj2Count].AttrLocPosition = gl.getAttribLocation(Obj2List[Obj2Count].shader, 'vertPosition');
	Obj2List[Obj2Count].AttrLocTexCoords = gl.getAttribLocation(Obj2List[Obj2Count].shader, 'vertTexCoord');

	if(!skybox)
	{
		for(var i = 0; i < textArray.length; i++)
		{
			Obj2List[Obj2Count].textureArray[i] = loadTexture(gl, textArray[i]);
		}
		Obj2List[Obj2Count].texture = Obj2List[Obj2Count].textureArray[0];

		var theta = (degToRad(abc[Obj2Count]));

		var x = 6 * Math.sin(theta);
		var z = 6 * Math.cos(theta);

		Obj2List[Obj2Count].transform.pos[0] = x;
		Obj2List[Obj2Count].transform.pos[2] = z;
	}
	else
	{
		Obj2List[Obj2Count].texture = loadCubeMap(gl, textArray);
		Obj2List[Obj2Count].transform.pos.z = 0;//-7;
		updateScale(Obj2List[Obj2Count], 34, 34, 34);
	}

	Obj2List[Obj2Count].textureID = texturesLoaded;
	texturesLoaded++;

	//console.log("Obj2:", Obj2List[Obj2Count]);
	Obj2Count++;

	return Obj2List[Obj2Count];
}

function loadModel(name1, objPath, mtlPath, text)
{
	//console.log('Loading Model');
	let p = OBJ.downloadModels([
        {
            name: name1,
            obj: objPath,
            mtl: mtlPath
         }
    ]);

    p.then(models => {
        for ([name, mesh] of Object.entries(models))
        {
            //console.log("Name:", name);
            //console.log("Mesh:", mesh);
        }

    		ObjList.push(new Obj(name1, models));

    		ObjList[ObjCount].transform = new Transform();
    		ObjList[ObjCount].clock = new Clock();
    		ObjList[ObjCount].textured = text;

    		//console.log("Obj:", ObjList[ObjCount]);
       	IncrementCount();
    });
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
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() 
  {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
    {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } 
    else 
    {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };

  image.src = url;

  return texture;
}

var texID;

function loadCubeMap(gl, imgAry)
{
	//RIGHT,LEFT,TOP,BOTTOM,BACK,FRONT
		//Cube Constants values increment, so easy to start with right and just add 1 in a loop
		//To make the code easier costs by making the imgAry coming into the function to have
		//the images sorted in the same way the constants are set.
		//	TEXTURE_CUBE_MAP_POSITIVE_X - Right	:: TEXTURE_CUBE_MAP_NEGATIVE_X - Left
		//	TEXTURE_CUBE_MAP_POSITIVE_Y - Top 	:: TEXTURE_CUBE_MAP_NEGATIVE_Y - Bottom
		//	TEXTURE_CUBE_MAP_POSITIVE_Z - Back	:: TEXTURE_CUBE_MAP_NEGATIVE_Z - Front

	texID = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);	//Setup up scaling
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);	//Setup down scaling
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);	//Stretch image to X position
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	//Stretch image to Y position
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);	//Stretch image to Z position

	const image1 = new Image();
	image1.src = cubePath + imgAry[0];
	image1.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
	}

	const image2 = new Image();
	image2.src = cubePath + imgAry[1];
	image2.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
	}

	const image3 = new Image();
	image3.src = cubePath + imgAry[2];
	image3.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
	}

	const image4 = new Image();
	image4.src = cubePath + imgAry[3];
	image4.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
	}

	const image5 = new Image();
	image5.src = cubePath + imgAry[4];
	image5.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image5);
		CanvasLoaded();
	}

	const image6 = new Image();
	image6.src = cubePath + imgAry[5];
	image6.onload = function() 
	{
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image6);
	}

	return texID;
}

function isPowerOf2(value) 
{
  return (value & (value - 1)) == 0;
}

function loadObj(fileStream)
{
	console.log("Loading: " + fileStream.name);
	var reader = new FileReader();
	
	reader.onload = function(progressEvent)
	{
		//console.log("reader: " + this.result);
		
		var Vertices = [];
		var Indices = [];
		
		var lines = this.result.split('\n');
		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i].split(/\s+/);
			if(line && line.length > 0)
			{
				var lineType = line[0];
				
				if(lineType == "v")
				{
					var cunt = vec3.create();
					vec3.set(cunt, parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));
					console.log("Verts: " + cunt);
					
					Vertices.push(cunt);
				}
				else if(lineType == "f")
				{
					var cunt = vec3.create();
					vec3.set(cunt, parseInt(line[1]), parseInt(line[2]), parseInt(line[3]));
					console.log("Indices: " + cunt);
					
					Indices.push(cunt);
				}
			}
		}
	};
	
	reader.readAsText(fileStream);
}
