	var squareVertices = 
	[
		// Positions        // Texture Coords (Zoom in)
		0.5,  1.0, 0.5,   1.0, 1.0,  // Top Right
		0.5,  1.0,-0.5,   1.0, 0.0,  // Bottom Right
		-0.5, 1.0,-0.5,   0.0, 0.0,  // Bottom Left
		-0.5, 1.0, 0.5,    0.0, 1.0   // Top Left
	];

	var squareIndices =
	[ // Note that we start from 0!
		0, 1, 3, // First Triangle
		1, 2, 3  // Second Triangle
	];


	var boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,   1, 1,
		-1.0, -1.0, -1.0,  0, 1,
		-1.0, 1.0, -1.0,   0, 0,

		// Right
		1.0, 1.0, 1.0,     0, 0,
		1.0, -1.0, 1.0,    0, 1,
		1.0, -1.0, -1.0,   1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Front
		1.0, 1.0, 1.0,     1, 0,
		1.0, -1.0, 1.0,    1, 1,
		-1.0, -1.0, 1.0,   0, 1,
		-1.0, 1.0, 1.0,    0, 0,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,   0, 1,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   1, 0,

		// Bottom
		-1.0, -1.0, -1.0,  0, 1,
		-1.0, -1.0, 1.0,   0, 0,
		1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, -1.0,   1, 1,
	];
	
	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

function initBuffers() 
{
	console.log('Init Buffer');
 	var layout = new OBJ.Layout(
  	OBJ.Layout.POSITION,
  	OBJ.Layout.NORMAL,
   	OBJ.Layout.DIFFUSE,
   	OBJ.Layout.UV,
 		OBJ.Layout.SPECULAR,
   	OBJ.Layout.SPECULAR_EXPONENT
  );
  console.log("ObjCount:", ObjCount);
  console.log("Obj2Count:", Obj2Count);

	for(var i = 0; i < ObjCount; i++)
  {
    // initialize the mesh's buffers
    for (var mesh in ObjList[i].meshes) 
    {
        // Create the vertex buffer for this mesh
        var vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var vertexData = ObjList[i].meshes[mesh].makeBufferData(layout);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        vertexBuffer.numItems = vertexData.numItems;
        vertexBuffer.layout = layout;
        ObjList[i].meshes[mesh].vertexBuffer = vertexBuffer;

        // Create the index buffer for this mesh
        var indexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        var indexData = ObjList[i].meshes[mesh].makeIndexBufferData();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
        indexBuffer.numItems = indexData.numItems;
        ObjList[i].meshes[mesh].indexBuffer = indexBuffer;

        // this loops through the mesh names and creates new
        // model objects and setting their mesh to the current mesh
        ObjList[i].models[mesh] = {};
        ObjList[i].models[mesh].mesh = ObjList[i].meshes[mesh];
        console.log("mesh:", mesh + " " + mesh.type);
    }
  }
}