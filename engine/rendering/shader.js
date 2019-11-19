var scount = 0;

function CompileShader(gl, vertSource, fragSource)
{
	var shader = null;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertSource);
	gl.compileShader(vertexShader);
	gl.shaderSource(fragmentShader, fragSource);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
	{
		console.error('Shader: ' + scount);
		alert(gl.getShaderInfoLog(vertexShader));
		return null;
	}
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
	{
		console.error('Shader: ' + scount);
		alert(gl.getShaderInfoLog(fragmentShader));
		return null;
	}

	shader = gl.createProgram();
	gl.attachShader(shader, vertexShader);
	gl.attachShader(shader, fragmentShader);
	gl.linkProgram(shader);
	if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking shader!', gl.getProgramInfoLog(shader));
		return;
	}
	gl.validateProgram(shader);
	if (!gl.getProgramParameter(shader, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating shader!', gl.getProgramInfoLog(shader));
		return;
	}

	gl.useProgram(shader);

	var numUniforms = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);

	/*for(var i = 0 ; i < numUniforms; i++)
	{
		var uniform = gl.getActiveUniform(shader, i);
		console.log(uniform.name);
	}*/

	shader.MVPUniform = gl.getUniformLocation(shader, "MVP");
	shader.ModelUniform = gl.getUniformLocation(shader, "Model");
	shader.InvTrModelUniform = gl.getUniformLocation(shader, "InvTrModel");

	shader.LightPosUniform = gl.getUniformLocation(shader, "lightPos");
	shader.LightColorUniform = gl.getUniformLocation(shader, "lightColor");
	shader.ViewPosUniform = gl.getUniformLocation(shader, "viewPos");
	shader.ColorUniform = gl.getUniformLocation(shader, "emissive");

	//shader.StateUniform = gl.getUniformLocation(shader, "state");
	shader.LightCountUniform = gl.getUniformLocation(shader, "lightCount");
	shader.LightsUniform = gl.getUniformLocation(shader, "lights");

	shader.DiffTextUniform = gl.getUniformLocation(shader, "diffuseMap");
	shader.SpecTextUniform = gl.getUniformLocation(shader, "specularMap");

	shader.GenerateUniform = gl.getUniformLocation(shader, "generate");

	shader.BoundMinUniform = gl.getUniformLocation(shader, "boundMin");
	shader.BoundMaxUniform = gl.getUniformLocation(shader, "boundMax");
	shader.BoundCenterUniform = gl.getUniformLocation(shader, "boundCenter");

	scount++;

	return shader;
}

function makeShaders()
{
	// Shaders
	shaderPick = CompileShader(gl, SourcePickVS, SourcePickFS);
	shaderLine = CompileShader(gl, SourceLineVS, SourceLineFS);
	shaderDiffuse = CompileShader(gl, SourceDiffuseVS, SourceDiffuseFS);
	shaderBlinn = CompileShader(gl, currSourceBlinnVS, currSourceBlinnFS);
	shaderPhong = CompileShader(gl, currSourcePhongVS, currSourcePhongFS);
	shaderPhongLighting = CompileShader(gl, currSourcePhongLightingVS, currSourcePhongLightingFS);

	setupPhongLighting();
	setupPhong();
	setupBlinn();
	setupDiffuse();
	setupLine();
	setupPick();

	GlobalState.Shader = shaderPhongLighting;

	//GlobalState.lightData = new Float32Array(8 * 28);
	GlobalState.stateData = new Float32Array(16);

	//var uniformLightDataLoc = gl.getUniformBlockIndex(shaderPhongLighting, "LightData[0]");
    gl.useProgram(shaderPhongLighting);
	var uniformStateDataLoc1 = gl.getUniformBlockIndex(shaderPhongLighting, "StateData");
    gl.uniformBlockBinding(shaderPhongLighting, uniformStateDataLoc1, 0);
    gl.useProgram(shaderPhong);
	var uniformStateDataLoc2 = gl.getUniformBlockIndex(shaderPhong, "StateData");
    gl.uniformBlockBinding(shaderPhong, uniformStateDataLoc2, 0);
    gl.useProgram(shaderBlinn);
	var uniformStateDataLoc3 = gl.getUniformBlockIndex(shaderBlinn, "StateData");
    gl.uniformBlockBinding(shaderBlinn, uniformStateDataLoc3, 0);
    
    //console.log("Hi: " + gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS));

    //gl.uniformBlockBinding(shaderPhongLighting, uniformLightDataLoc, 0);

	//GlobalState.lightBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.UNIFORM_BUFFER, GlobalState.lightBuffer);
    //gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(GlobalState.lightData), gl.DYNAMIC_DRAW);

	GlobalState.stateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, GlobalState.stateBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(GlobalState.stateData), gl.DYNAMIC_DRAW);

    //console.log(new Float32Array(GlobalState.lightData));
    //console.log(new Float32Array(GlobalState.lightData).byteLength);

    //gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, GlobalState.lightBuffer);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, GlobalState.stateBuffer);
}

function setupPhongLighting()
{
	shaderPhongLighting.setUniforms = function(obj)
	{
	    gl.uniformMatrix4fv(shaderPhongLighting.MVPUniform, false, obj.MVPMatrix);
	    gl.uniformMatrix4fv(shaderPhongLighting.ModelUniform, false, obj.mvMatrix);

	    var InvTrModel = mat4.create();
	    mat4.invert(InvTrModel, obj.mvMatrix);
	    mat4.transpose(InvTrModel, InvTrModel);

	    gl.uniformMatrix4fv(shaderPhongLighting.InvTrModelUniform, false, InvTrModel);
	    
	    gl.uniform3fv(shaderPhongLighting.ColorUniform, GlobalState.ObjEmissive);

	    gl.uniform1i(shaderPhongLighting.LightCountUniform, GlobalState.lightCount);
	    gl.uniform3fv(shaderPhongLighting.LightsUniform, GlobalState.lightData);

	    gl.uniform1i(shaderPhongLighting.DiffTextUniform, 0);
	    gl.uniform1i(shaderPhongLighting.SpecTextUniform, 1);

		 gl.uniform1i(shaderPhongLighting.GenerateUniform, GlobalState.GPUTexCoords);
		 gl.uniform3fv(shaderPhongLighting.BoundMinUniform, obj.mesh.boundMin);
		 gl.uniform3fv(shaderPhongLighting.BoundMaxUniform, obj.mesh.boundMax);
		 gl.uniform3fv(shaderPhongLighting.BoundCenterUniform, obj.mesh.boundCenter);
	}
	shaderPhongLighting.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderPhongLighting, 'vertPosition');
		obj.AttrLocNormal = gl.getAttribLocation(shaderPhongLighting, 'vertNormal');
		obj.AttrLocTexCoords = gl.getAttribLocation(shaderPhongLighting, 'vertTexCoord');

	    gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);

	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocPosition, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocNormal != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocNormal, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
	        gl.enableVertexAttribArray(obj.AttrLocNormal);
	    }

	    if(GlobalState.Mapping == 1)	// Cubic
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanar);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanarN);
	    }
	    else if(GlobalState.Mapping == 2) // Sphere
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphere);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphereN);
	    }
	    else
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinder);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinderN);
	    }

	    if(obj.AttrLocTexCoords != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocTexCoords, 2, gl.FLOAT, gl.FALSE, 0, 0);
	        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
	    }

	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IBO);
	}
}

function setupPhong()
{
	shaderPhong.setUniforms = function(obj)
	{
	    gl.uniformMatrix4fv(shaderPhong.MVPUniform, false, obj.MVPMatrix);
	    gl.uniformMatrix4fv(shaderPhong.ModelUniform, false, obj.mvMatrix);

	    var InvTrModel = mat4.create();
	    mat4.invert(InvTrModel, obj.mvMatrix);
	    mat4.transpose(InvTrModel, InvTrModel);

	    gl.uniformMatrix4fv(shaderPhong.InvTrModelUniform, false, InvTrModel);

	    gl.uniform3fv(shaderPhong.ColorUniform, GlobalState.ObjEmissive);

	    gl.uniform1i(shaderPhong.LightCountUniform, GlobalState.lightCount);
	    gl.uniform3fv(shaderPhong.LightsUniform, GlobalState.lightData);

	    gl.uniform1i(shaderPhong.DiffTextUniform, 0);
	    gl.uniform1i(shaderPhong.SpecTextUniform, 1);

		gl.uniform1i(shaderPhong.GenerateUniform, GlobalState.GPUTexCoords);
		gl.uniform3fv(shaderPhong.BoundMinUniform, obj.mesh.boundMin);
		gl.uniform3fv(shaderPhong.BoundMaxUniform, obj.mesh.boundMax);
		gl.uniform3fv(shaderPhong.BoundCenterUniform, obj.mesh.boundCenter);
	}
	shaderPhong.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderPhong, 'vertPosition');
		obj.AttrLocNormal = gl.getAttribLocation(shaderPhong, 'vertNormal');
		obj.AttrLocTexCoords = gl.getAttribLocation(shaderPhong, 'vertTexCoord');

	    gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);

	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocPosition, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocNormal != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocNormal, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
	        gl.enableVertexAttribArray(obj.AttrLocNormal);
	    }

	    if(GlobalState.Mapping == 1)	// Cubic
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanar);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanarN);
	    }
	    else if(GlobalState.Mapping == 2) // Sphere
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphere);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphereN);
	    }
	    else
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinder);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinderN);
	    }

	    if(obj.AttrLocTexCoords != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocTexCoords, 2, gl.FLOAT, gl.FALSE, 0, 0);
	        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
	    }

	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IBO);
	}
}

function setupBlinn()
{
	shaderBlinn.setUniforms = function(obj)
	{
	    gl.uniformMatrix4fv(shaderBlinn.MVPUniform, false, obj.MVPMatrix);
	    gl.uniformMatrix4fv(shaderBlinn.ModelUniform, false, obj.mvMatrix);

	    var InvTrModel = mat4.create();
	    mat4.invert(InvTrModel, obj.mvMatrix);
	    mat4.transpose(InvTrModel, InvTrModel);

	    gl.uniformMatrix4fv(shaderBlinn.InvTrModelUniform, false, InvTrModel);

	    gl.uniform3fv(shaderBlinn.ColorUniform, GlobalState.ObjEmissive);

	    gl.uniform1i(shaderBlinn.LightCountUniform, GlobalState.lightCount);
	    gl.uniform3fv(shaderBlinn.LightsUniform, GlobalState.lightData);

	    gl.uniform1i(shaderBlinn.DiffTextUniform, 0);
	    gl.uniform1i(shaderBlinn.SpecTextUniform, 1);

		 gl.uniform1i(shaderBlinn.GenerateUniform, GlobalState.GPUTexCoords);
		 gl.uniform3fv(shaderBlinn.BoundMinUniform, obj.mesh.boundMin);
		 gl.uniform3fv(shaderBlinn.BoundMaxUniform, obj.mesh.boundMax);
		 gl.uniform3fv(shaderBlinn.BoundCenterUniform, obj.mesh.boundCenter);
	}
	shaderBlinn.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderBlinn, 'vertPosition');
		obj.AttrLocNormal = gl.getAttribLocation(shaderBlinn, 'vertNormal');
		obj.AttrLocTexCoords = gl.getAttribLocation(shaderBlinn, 'vertTexCoord');

	    gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);

	    if(obj.AttrLocPosition != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocPosition, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	    if(obj.AttrLocNormal != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocNormal, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
	        gl.enableVertexAttribArray(obj.AttrLocNormal);
	    }

	    if(GlobalState.Mapping == 1)	// Cubic
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanar);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVPlanarN);
	    }
	    else if(GlobalState.Mapping == 2) // Sphere
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphere);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVSphereN);
	    }
	    else
	    {
	    	if(GlobalState.Entity == 1)	// Vertex
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinder);
	    	else 	// Normal
	    		gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOUVCylinderN);
	    }

	    if(obj.AttrLocTexCoords != -1)
	    {
	        gl.vertexAttribPointer(obj.AttrLocTexCoords, 2, gl.FLOAT, gl.FALSE, 0, 0);
	        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
	    }

	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IBO);
	}
}

function setupDiffuse()
{
	shaderDiffuse.setUniforms = function(obj)
	{
	    gl.uniformMatrix4fv(shaderDiffuse.MVPUniform, false, obj.MVPMatrix);
	    gl.uniform3fv(shaderDiffuse.ColorUniform, obj.shadingColor);
	}
	shaderDiffuse.applyAttribute = function(obj)
	{
		obj.AttrLocPosition = gl.getAttribLocation(shaderDiffuse, 'vertPosition');
		obj.AttrLocNormal = gl.getAttribLocation(shaderDiffuse, 'vertNormal');

	    gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IBO);

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
}

function setupPick()
{
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
	            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(obj.AttrLocPosition);
	    }
	}
}

function setupLine()
{
	shaderLine.setUniforms = function(Matrix, lineColor)
	{
	    gl.uniformMatrix4fv(shaderLine.MVPUniform, false, Matrix);
	    gl.uniform4fv(shaderLine.ColorUniform, lineColor);
	}
	shaderLine.applyAttribute = function()
	{
		var loc = gl.getAttribLocation(shaderLine, 'vertPosition');
	    if(loc != -1)
	    {
	        gl.vertexAttribPointer(
	            loc,        // Attribute location
	            3,                          // Number of elements per attribute
	            gl.FLOAT,                   // Type of elements
	            gl.FALSE,
	            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	            0                           // Offset from the beginning of a single vertex to this attribute
	        );

	        gl.enableVertexAttribArray(loc);
	    }
	}
}