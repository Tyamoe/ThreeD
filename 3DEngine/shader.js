var shaderPath = "https://tyamoe.com/scripts/shaders/";

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
	var vertexShader = loadShaderLocal(gl, SourceSkyboxVS, true);
	var fragmentShader = loadShaderLocal(gl, SourceSkyboxFS, false);

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
	var vertexShader1 = loadShaderLocal(gl, SourceSmallVS, true);
	var fragmentShader1 = loadShaderLocal(gl, SourceSmallFS, false);

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

	// PICK
	var vertexShader12 = loadShaderLocal(gl, SourcePickVS, true);
	var fragmentShader12 = loadShaderLocal(gl, SourcePickFS, false);

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

	shaderPick.MVPUniform = gl.getUniformLocation(shaderPick, "MVP");
	shaderPick.ColorUniform = gl.getUniformLocation(shaderPick, "fcolor");

	// PHONG
	var vertexShader212 = loadShaderLocal(gl, SourcePhongVS, true);
	var fragmentShader212 = loadShaderLocal(gl, SourcePhongFS, false);

	shaderPhong = gl.createProgram();
	gl.attachShader(shaderPhong, vertexShader212);
	gl.attachShader(shaderPhong, fragmentShader212);
	gl.linkProgram(shaderPhong);

	if (!gl.getProgramParameter(shaderPhong, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking shaderPhong!', gl.getProgramInfoLog(shaderPhong));
		return;
	}
	gl.validateProgram(shaderPhong);
	if (!gl.getProgramParameter(shaderPhong, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating shaderPhong!', gl.getProgramInfoLog(shaderPhong));
		return;
	}

	shaderPhong.MVPUniform = gl.getUniformLocation(shaderPhong, "MVP");
	shaderPhong.ModelUniform = gl.getUniformLocation(shaderPhong, "Model");
	shaderPhong.InvTrModelUniform = gl.getUniformLocation(shaderPhong, "InvTrModel");

	shaderPhong.LightPosUniform = gl.getUniformLocation(shaderPhong, "lightPos");
	shaderPhong.LightColorUniform = gl.getUniformLocation(shaderPhong, "lightColor");
	shaderPhong.ViewPosUniform = gl.getUniformLocation(shaderPhong, "viewPos");
	shaderPhong.ColorUniform = gl.getUniformLocation(shaderPhong, "fcolor");

	// Shader Funcs
	shaderPhong.setUniforms = function(obj)
	{
	    gl.uniformMatrix4fv(shaderPhong.MVPUniform, false, obj.MVPMatrix);
	    gl.uniformMatrix4fv(shaderPhong.ModelUniform, false, obj.mvMatrix);

	    var InvTrModel = mat4.create();
	    mat4.invert(InvTrModel, obj.mvMatrix);
	    mat4.transpose(InvTrModel, InvTrModel);

	    gl.uniformMatrix4fv(shaderPhong.InvTrModelUniform, false, InvTrModel);

	    var lc = vec3.create();
	    vec3.set(lc, 1, 1, 1);
	    var lp = vec3.create();
	    vec3.set(lp, 0, 5, 0);

	    gl.uniform3fv(shaderPhong.LightPosUniform, lp);
	    gl.uniform3fv(shaderPhong.LightColorUniform, lc);
	    gl.uniform3fv(shaderPhong.ViewPosUniform, camera.Pos);
	    gl.uniform4fv(shaderPhong.ColorUniform, obj.shadingColor);
	}

	shaderPhong.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderPhong, 'vertPosition');
		obj.AttrLocNormal = gl.getAttribLocation(shaderPhong, 'vertNormal');

	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocPosition,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocNormal != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocNormal,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            3 * Float32Array.BYTES_PER_ELEMENT                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocNormal);
	    }
	}


	shaderPick.setUniforms = function(obj, pickColor)
	{
	    gl.uniformMatrix4fv(shaderPick.MVPUniform, false, obj.MVPMatrix);
	    gl.uniform4fv(shaderPick.ColorUniform, pickColor);
	}

	shaderPick.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderPick, 'vertPosition');
	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocPosition,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	}


	shaderSmall.setUniforms = function(obj)
	{
	    gl.uniform3fv(shaderSmall.eye, new Float32Array([camera.Pos[0], camera.Pos[1], camera.Pos[2]]));
	    gl.uniform2fv(shaderSmall.fogDis, new Float32Array([fogDist1[0], fogDist1[1]]));
	    
	    gl.uniformMatrix4fv(shaderSmall.pMatrixUniform, false, obj.pMatrix);
	    gl.uniformMatrix4fv(shaderSmall.mvMatrixUniform, false, obj.mvMatrix);
	    gl.uniformMatrix4fv(shaderSmall.vMatrixUniform, false, obj.vMatrix);
	    gl.uniform4fv(shaderSmall.colorr, new Float32Array([obj.tint[0], obj.tint[1], obj.tint[2], obj.tint[3]]));

	    var normalMatrix = mat3.create();
	    mat3.normalFromMat4(normalMatrix, obj.mvMatrix);
	    gl.uniformMatrix3fv(shaderSmall.nMatrixUniform, false, normalMatrix);
	}

	shaderSmall.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderSmall, 'vertPosition');
		obj.AttrLocTexCoords = gl.getAttribLocation(shaderSmall, 'vertTexCoord');

	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocPosition,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocTexCoords != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocTexCoords,       // Attribute location
	            2,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
	    }
	}


	shaderSkybox.setUniforms = function(obj)
	{
	    gl.uniform3fv(shaderSkybox.eye, new Float32Array([camera.Pos[0], camera.Pos[1], camera.Pos[2]]));
	    gl.uniform2fv(shaderSkybox.fogDis, new Float32Array([fogDist1[0], fogDist1[1]]));
	    
	    gl.uniformMatrix4fv(shaderSkybox.pMatrixUniform, false, obj.pMatrix);
	    gl.uniformMatrix4fv(shaderSkybox.mvMatrixUniform, false, obj.mvMatrix);
	    gl.uniformMatrix4fv(shaderSkybox.vMatrixUniform, false, obj.vMatrix);
	    gl.uniform4fv(shaderSkybox.colorr, new Float32Array([obj.tint[0], obj.tint[1], obj.tint[2], obj.tint[3]]));

	    var normalMatrix = mat3.create();
	    mat3.normalFromMat4(normalMatrix, obj.mvMatrix);
	    gl.uniformMatrix3fv(shaderSkybox.nMatrixUniform, false, normalMatrix);
	}

	shaderSkybox.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderSkybox, 'vertPosition');
		obj.AttrLocTexCoords = gl.getAttribLocation(shaderSkybox, 'vertTexCoord');
		
	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocPosition,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocTexCoords != -1)
	    {
	        gl.vertexAttribPointer(
	            obj.AttrLocTexCoords,       // Attribute location
	            2,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
	    }
	}
}


var SourcePhongVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec3 vertNormal;

	varying vec3 fragPos;
	varying vec4 Normal;

	uniform mat4 MVP;
	uniform mat4 Model;
	uniform mat4 InvTrModel;

	void main()
	{
    	fragPos = vec3(Model * vec4(vertPosition, 1.0));
    	Normal = InvTrModel * vec4(vertNormal, 1.0); 

		gl_Position = MVP * vec4(vertPosition, 1.0);
	}
`;


var SourcePhongFS = `
	precision mediump float;

	varying vec3 fragPos;
	varying vec4 Normal;

	uniform vec3 lightPos;
	uniform vec3 lightColor;
	uniform vec3 viewPos;
	uniform vec4 fcolor;

	void main()
	{
	    // ambient
	    float ambientStrength = 0.1;
	    vec3 ambient = ambientStrength * lightColor;
	  	
	    // diffuse 
	    vec3 norm = normalize(Normal.xyz);
	    vec3 lightDir = normalize(lightPos - fragPos);
	    float diff = max(dot(norm, lightDir), 0.0);
	    vec3 diffuse = diff * lightColor;
	    
	    // specular
	    float specularStrength = 0.5;
	    vec3 viewDir = normalize(viewPos - fragPos);
	    vec3 reflectDir = reflect(-lightDir, norm);  
	    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
	    vec3 specular = specularStrength * spec * lightColor;  
	        
	    vec3 result = (ambient + diffuse + specular) * fcolor.xyz;

	    gl_FragColor = vec4(result, 1.0);

		//gl_FragColor = fcolor;
	}
`;


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

	uniform mat4 MVP;

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

		gl_FragColor = color;

		//gl_FragColor = texture2D(sampler, fragTexCoord) * tcolor;
		//gl_FragColor = mix(texture2D(sampler, fragTexCoord), tcolor, 0.0);
	}
`;


var SourcePickVS = `
	precision mediump float;

	attribute vec3 vertPosition;

	uniform mat4 MVP;

	void main()
	{
		gl_Position = MVP * vec4(vertPosition, 1.0);
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
		
		gl_FragColor = color;

		//gl_FragColor = textureCube(sampler, fragTexCoord) * tcolor;
	}
`;


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
