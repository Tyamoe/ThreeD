var shaderPath = "shaders/";

function loadShader(gl, shaderName) 
{
	var fragment = "fs";
	var vertex = "vs";

	//console.log('Loading Shader');

	var script = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", shaderPath + shaderName + ".txt", false);
	xmlhttp.send();
	if (xmlhttp.status==200) 
	{
		script = xmlhttp.responseText;
	}

	var shader;
	if(shaderName.indexOf(fragment) !== -1)
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}

	gl.shaderSource(shader, script);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function loadShaderLocal(gl, ShaderSource, vertex) 
{
	var shader;
	if(!vertex)
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}

	gl.shaderSource(shader, ShaderSource);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function makeShaders()
{
	//SKYBOX
	var vertexShader = loadShaderLocal(gl, SourceSkyboxVS, true);// loadShader(gl, "skybox-vs");
	var fragmentShader = loadShaderLocal(gl, SourceSkyboxFS, false);// loadShader(gl, "skybox-fs");

	shaderSkybox = gl.createProgram();
	gl.attachShader(shaderSkybox, vertexShader);
	gl.attachShader(shaderSkybox, fragmentShader);
	gl.linkProgram(shaderSkybox);
	if (!gl.getProgramParameter(shaderSkybox, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking shaderSkybox!', gl.getProgramInfoLog(shaderSkybox));
		return;
	}
	gl.validateProgram(shaderSkybox);
	if (!gl.getProgramParameter(shaderSkybox, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating shaderSkybox!', gl.getProgramInfoLog(shaderSkybox));
		return;
	}

	shaderSkybox.pMatrixUniform = gl.getUniformLocation(shaderSkybox, "uPMatrix");
	shaderSkybox.mvMatrixUniform = gl.getUniformLocation(shaderSkybox, "uMVMatrix");
	shaderSkybox.nMatrixUniform = gl.getUniformLocation(shaderSkybox, "uNMatrix");
	shaderSkybox.vMatrixUniform = gl.getUniformLocation(shaderSkybox, "viewMatrix");
	shaderSkybox.eye = gl.getUniformLocation(shaderSkybox, "Eye");
	shaderSkybox.fogDis = gl.getUniformLocation(shaderSkybox, "fog");
	shaderSkybox.colorr = gl.getUniformLocation(shaderSkybox, "tcolor");

	//SMALL
	var vertexShader1 = loadShaderLocal(gl, SourceSmallVS, true);// loadShader(gl, "small-vs");
	var fragmentShader1 = loadShaderLocal(gl, SourceSmallFS, false);// loadShader(gl, "small-fs");

	shaderSmall = gl.createProgram();
	gl.attachShader(shaderSmall, vertexShader1);
	gl.attachShader(shaderSmall, fragmentShader1);
	gl.linkProgram(shaderSmall);
	if (!gl.getProgramParameter(shaderSmall, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking shaderSmall!', gl.getProgramInfoLog(shaderSmall));
		return;
	}
	gl.validateProgram(shaderSmall);
	if (!gl.getProgramParameter(shaderSmall, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating shaderSmall!', gl.getProgramInfoLog(shaderSmall));
		return;
	}

	shaderSmall.pMatrixUniform = gl.getUniformLocation(shaderSmall, "uPMatrix");
	shaderSmall.mvMatrixUniform = gl.getUniformLocation(shaderSmall, "uMVMatrix");
	shaderSmall.nMatrixUniform = gl.getUniformLocation(shaderSmall, "uNMatrix");
	shaderSmall.vMatrixUniform = gl.getUniformLocation(shaderSmall, "viewMatrix");
	shaderSmall.eye = gl.getUniformLocation(shaderSmall, "Eye");
	shaderSmall.fogDis = gl.getUniformLocation(shaderSmall, "fog");
	shaderSmall.colorr = gl.getUniformLocation(shaderSmall, "tcolor");

	var vertexShader12 = loadShaderLocal(gl, SourcePickVS, true);// loadShader(gl, "pick-vs");
	var fragmentShader12 = loadShaderLocal(gl, SourcePickFS, false);// loadShader(gl, "pick-fs");

	shaderPick = gl.createProgram();
	gl.attachShader(shaderPick, vertexShader12);
	gl.attachShader(shaderPick, fragmentShader12);
	gl.linkProgram(shaderPick);

	if (!gl.getProgramParameter(shaderPick, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking shaderPick!', gl.getProgramInfoLog(shaderPick));
		return;
	}
	gl.validateProgram(shaderPick);
	if (!gl.getProgramParameter(shaderPick, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating shaderPick!', gl.getProgramInfoLog(shaderPick));
		return;
	}

	shaderPick.pMatrixUniform = gl.getUniformLocation(shaderPick, "uPMatrix");
	shaderPick.mvMatrixUniform = gl.getUniformLocation(shaderPick, "uMVMatrix");
	shaderPick.nMatrixUniform = gl.getUniformLocation(shaderPick, "uNMatrix");
	shaderPick.vMatrixUniform = gl.getUniformLocation(shaderPick, "viewMatrix");
	shaderPick.color = gl.getUniformLocation(shaderPick, "fcolor");
}

function initShaders(text) 
{
		//console.log('Init Shaders - textured:', text);

		var program = null;

    var fragmentShader = (text) ? loadShader(gl, "shader_text-fs") : loadShader(gl, "shader_notext-fs");
    var vertexShader = (text) ? loadShader(gl, "shader_text-vs") : loadShader(gl, "shader_notext-vs");

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        alert("Could not initialise shaders");
    }
    gl.useProgram(program);

    if(!text)
    {
	    const attrs = {
	        aVertexPosition: OBJ.Layout.POSITION.key,
	        aVertexNormal: OBJ.Layout.NORMAL.key,
	        aTextureCoord: OBJ.Layout.UV.key,
	        aDiffuse: OBJ.Layout.DIFFUSE.key,
	        aSpecular: OBJ.Layout.SPECULAR.key,
	        aSpecularExponent: OBJ.Layout.SPECULAR_EXPONENT.key
	    };

	    program.attrIndices = {};
	    for (const attrName in attrs) 
	    {
	        if (!attrs.hasOwnProperty(attrName)) 
	        {
	            continue;
	        }
	        program.attrIndices[attrName] = gl.getAttribLocation(program, attrName);
	        if (program.attrIndices[attrName] != -1) 
	        {
	            gl.enableVertexAttribArray(program.attrIndices[attrName]);
	        } 
	        else 
	        {
	            console.warn(
	                'Shader attribute "' +
	                    attrName +
	                    '" not found in shader. Is it undeclared or unused in the shader code?'
	            );
	        }
	    }

	    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	    program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
	    program.vMatrixUniform = gl.getUniformLocation(program, "viewMatrix");

	    program.applyAttributePointers = function(model) {
	        const layout = model.mesh.vertexBuffer.layout;
	        for (const attrName in attrs) 
	        {
	          if (!attrs.hasOwnProperty(attrName) || program.attrIndices[attrName] == -1) 
	          {
	            continue;
	          }
	          const layoutKey = attrs[attrName];
	          if (program.attrIndices[attrName] != -1) 
	          {
	          	const attr = layout[layoutKey];
	          	gl.vertexAttribPointer(
	             	program.attrIndices[attrName],
	             	attr.size,
	             	gl[attr.type],
	             	attr.normalized,
	             	attr.stride,
	             	attr.offset
	           	);
	          }
	        }
	    };
    }
    else
    {
	    const attrs = {
	        aVertexPosition: OBJ.Layout.POSITION.key,
	        aTextureCoord: OBJ.Layout.UV.key,
	    };

	    program.attrIndices = {};
	    for (const attrName in attrs) 
	    {
	        if (!attrs.hasOwnProperty(attrName)) 
	        {
	            continue;
	        }
	        program.attrIndices[attrName] = gl.getAttribLocation(program, attrName);
	        if (program.attrIndices[attrName] != -1) 
	        {
	            gl.enableVertexAttribArray(program.attrIndices[attrName]);
	        } 
	        else 
	        {
	            console.warn(
	                'Shader attribute "' +
	                    attrName +
	                    '" not found in shader. Is it undeclared or unused in the shader code?'
	            );
	        }
	    }

	    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	    program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
	    program.vMatrixUniform = gl.getUniformLocation(program, "viewMatrix");

	    program.applyAttributePointers = function(model) {
	        const layout = model.mesh.vertexBuffer.layout;
	        for (const attrName in attrs) 
	        {
	          if (!attrs.hasOwnProperty(attrName) || program.attrIndices[attrName] == -1) 
	          {
	            continue;
	          }
	          const layoutKey = attrs[attrName];
	          if (program.attrIndices[attrName] != -1) 
	          {
	          	const attr = layout[layoutKey];
	          	gl.vertexAttribPointer(
	             	program.attrIndices[attrName],
	             	attr.size,
	             	gl[attr.type],
	             	attr.normalized,
	             	attr.stride,
	             	attr.offset
	           	);
	          }
	        }
	    };
    }

    for(var i = 0; i < ObjCount; i++)
    {
    	if(ObjList[i].textured == text)
    	{
    		ObjList[i].shader = program;
    		if(text == true)
    		{
    			//Set texture location and id
  				var textureLocation = gl.getUniformLocation(program, "texture1");
  				ObjList[i].TextureLocation = textureLocation;
  				ObjList[i].TextureID = 0;

  				ObjList[i].TextureUnit = loadTexture(gl, modelPath + "solidTexture.png");
    		}
    	}
    }
}


var SourceSmallVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;

	varying vec2 fragTexCoord;
	varying vec4 vPosition;

	varying float vDistance;
	varying vec2 u_FogDist;

	uniform vec2 fog;
	uniform vec3 Eye;

	uniform mat4 viewMatrix;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;

	void main()
	{
		vDistance = distance(uMVMatrix * vec4(vertPosition, 1.0), vec4(Eye, 1.0));
		u_FogDist = fog;
		fragTexCoord = vertTexCoord;
		vPosition = uMVMatrix * vec4(vertPosition, 1.0);
		gl_Position = uPMatrix * viewMatrix * vPosition;
	}
`;


var SourceSmallFS = `
	precision mediump float;

	varying vec2 fragTexCoord;
	varying float vDistance;
	varying vec2 u_FogDist;

	uniform sampler2D sampler;
	uniform vec4 tcolor;

	void main()
	{
		const float FogDensity = 0.04;
		vec4 u_FogColor = vec4(0.323, 0.323, 0.423, 1.0);

		//float fogFactor = clamp((u_FogDist.y - vDistance) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
		float fogFactor = clamp((1.0 /exp(vDistance * FogDensity)), 0.0, 1.0);

		vec4 color = mix(u_FogColor, texture2D(sampler, fragTexCoord), fogFactor);

		//gl_FragColor = color;

		gl_FragColor = texture2D(sampler, fragTexCoord) * tcolor;
		//gl_FragColor = mix(texture2D(sampler, fragTexCoord), tcolor, 0.0);
	}
`;


var SourcePickVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec4 color;

	varying vec4 vPosition;

	uniform mat4 viewMatrix;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;

	void main()
	{
		vPosition = uMVMatrix * vec4(vertPosition, 1.0);
		gl_Position = uPMatrix * viewMatrix * vPosition;
	}
`;


var SourcePickFS = `
	precision mediump float;

	uniform vec4 fcolor;

	void main()
	{
		gl_FragColor = fcolor;
	}
`;


var SourceSkyboxVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;

	varying vec3 fragTexCoord;
	varying vec4 vPosition;

	varying float vDistance;
	varying vec2 u_FogDist;

	uniform vec2 fog;
	uniform vec3 Eye;

	uniform mat4 viewMatrix;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;

	void main()
	{
		vDistance = distance(uMVMatrix * vec4(vertPosition, 1.0), vec4(Eye, 1.0));
		u_FogDist = fog;
		fragTexCoord = vertPosition;
		vPosition = uMVMatrix * vec4(vertPosition, 1.0);
		gl_Position = uPMatrix * viewMatrix * vPosition;
	}
`;


var SourceSkyboxFS = `
	precision mediump float;

	varying vec3 fragTexCoord;
	varying float vDistance;
	varying vec2 u_FogDist;

	uniform samplerCube sampler;
	uniform vec4 tcolor;

	void main()
	{
		const float FogDensity = 0.02;
		vec4 u_FogColor = vec4(0.323, 0.323, 0.423, 1.0);

		//float fogFactor = clamp((u_FogDist.y - vDistance) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
		float fogFactor = clamp((1.0 /exp(vDistance * FogDensity)), 0.0, 1.0);
		
		vec4 color = mix(u_FogColor, textureCube(sampler, fragTexCoord) * tcolor, fogFactor);
		
		//gl_FragColor = color;

		gl_FragColor = textureCube(sampler, fragTexCoord) * tcolor;
	}
`;
