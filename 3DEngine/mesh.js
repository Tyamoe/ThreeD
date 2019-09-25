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
		-0.5, 0.5, -0.5,   0, 0,
		-0.5, 0.5, 0.5,    0, 1,
		0.5, 0.5, 0.5,     1, 1,
		0.5, 0.5, -0.5,    1, 0,

		// Left
		-0.5, 0.5, 0.5,    1, 0,
		-0.5, -0.5, 0.5,   1, 1,
		-0.5, -0.5, -0.5,  0, 1,
		-0.5, 0.5, -0.5,   0, 0,

		// Right
		0.5, 0.5, 0.5,     0, 0,
		0.5, -0.5, 0.5,    0, 1,
		0.5, -0.5, -0.5,   1, 1,
		0.5, 0.5, -0.5,    1, 0,

		// Front
		0.5, 0.5, 0.5,     1, 0,
		0.5, -0.5, 0.5,    1, 1,
		-0.5, -0.5, 0.5,   0, 1,
		-0.5, 0.5, 0.5,    0, 0,

		// Back
		0.5, 0.5, -0.5,    0, 0,
		0.5, -0.5, -0.5,   0, 1,
		-0.5, -0.5, -0.5,  1, 1,
		-0.5, 0.5, -0.5,   1, 0,

		// Bottom
		-0.5, -0.5, -0.5,  0, 1,
		-0.5, -0.5, 0.5,   0, 0,
		0.5, -0.5, 0.5,    1, 0,
		0.5, -0.5, -0.5,   1, 1,
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

var SphereVertices = [];
var SphereIndices = [];

var MeshSquare = {};
var MeshBox = {};
var MeshSphere = {};

var MeshLoaded = [];

function IsMeshLoaded(meshName)
{
	MeshLoaded.forEach(function(element)
	{
		//console.log(element.name + " | element.name = meshName | " + meshName);
		if(element.name.includes(meshName)) 
		{
			return element;
		}
	});

	return false;
}

function makeMeshes()
{
	makeSphere();

	MeshSquare = new Mesh("square");
	MeshSquare.vertices = squareVertices;
	MeshSquare.indices = squareIndices;
	MeshSquare.makeBuffers();

	MeshBox = new Mesh("box");
	MeshBox.vertices = boxVertices;
	MeshBox.indices = boxIndices;
	MeshBox.makeBuffers();

	MeshSphere = new Mesh("sphere");
	MeshSphere.vertices = SphereVertices;
	MeshSphere.indices = SphereIndices;
	MeshSphere.makeBuffers();
}

function makeSphere()
{
	var radius = 0.5;
	var stackCount = 10;
	var sectorCount = 15;

	var x, y, z, xy, lengthInv = 1.0 / radius;

	var sectorStep = 2 * Math.PI / sectorCount;
	var stackStep = Math.PI / stackCount;
	var sectorAngle, stackAngle;

	for (var i = 0; i <= stackCount; ++i)
	{
		stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
		xy = radius * Math.cos(stackAngle);             // r * cos(u)
		z = radius * Math.sin(stackAngle);              // r * sin(u)

		// add (sectorCount+1) vertices per stack
		// the first and last vertices have same position and normal, but different tex coords
		for (var j = 0; j <= sectorCount; ++j)
		{
			sectorAngle = j * sectorStep;           // starting from 0 to 2pi

			// vertex position (x, y, z)
			x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
			y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
			//SphereVertices.push({ x, y, z });
			SphereVertices.push(x);
			SphereVertices.push(y);
			SphereVertices.push(z);

			// normalized vertex normal (nx, ny, nz)
			nx = x * lengthInv;
			ny = y * lengthInv;
			nz = z * lengthInv;
			//normals.push_back({ nx, ny, nz });
			SphereVertices.push(nx);
			SphereVertices.push(ny);
			SphereVertices.push(nz);
		}
	}

	// generate CCW index list of sphere triangles
	var k1, k2;
	for (var i = 0; i < stackCount; ++i)
	{
		k1 = i * (sectorCount + 1);     // beginning of current stack
		k2 = k1 + sectorCount + 1;      // beginning of next stack

		for (var j = 0; j < sectorCount; ++j, ++k1, ++k2)
		{
			// 2 triangles per sector excluding first and last stacks
			// k1 => k2 => k1+1
			if (i != 0)
			{
				SphereIndices.push(k1);
				SphereIndices.push(k2);
				SphereIndices.push(k1 + 1);
			}

			// k1+1 => k2 => k2+1
			if (i != (stackCount - 1))
			{
				SphereIndices.push(k1 + 1);
				SphereIndices.push(k2);
				SphereIndices.push(k2 + 1);
			}
		}
	}
}
