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

var SphereFaces = [];
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
	MeshSphere.faceNormals = SphereFaces;
	MeshSphere.makeBuffers();
}

function makeSphere()
{
	var radius = 0.1;
	var stackCount = 20;
	var sectorCount = 25;

	var x, y, z, xy, lengthInv = 1.0 / radius;

	var sectorStep = 2 * Math.PI / sectorCount;
	var stackStep = Math.PI / stackCount;
	var sectorAngle, stackAngle;

	for (var i = 0; i <= stackCount; ++i)
	{
		stackAngle = Math.PI / 2 - i * stackStep;
		xy = radius * Math.cos(stackAngle);
		z = radius * Math.sin(stackAngle);

		for (var j = 0; j <= sectorCount; ++j)
		{
			sectorAngle = j * sectorStep;

			x = xy * Math.cos(sectorAngle);
			y = xy * Math.sin(sectorAngle);

			SphereVertices.push(x);
			SphereVertices.push(y);
			SphereVertices.push(z);

			var norm = vec3.create();
			vec3.set(norm, x * lengthInv, y * lengthInv, z * lengthInv);
			vec3.normalize(norm, norm);

			nx += norm[0];
			ny += norm[1];
			nz += norm[2];

			SphereVertices.push(x + norm[0] * 0.0235);
			SphereVertices.push(y + norm[1] * 0.0235);
			SphereVertices.push(z + norm[2] * 0.0235);
		}
	}

	var k1, k2;
	for (var i = 0; i < stackCount; ++i)
	{
		k1 = i * (sectorCount + 1);
		k2 = k1 + sectorCount + 1;

		for (var j = 0; j < sectorCount; ++j, ++k1, ++k2)
		{
			if (i != 0)
			{
				SphereIndices.push(k1);
				SphereIndices.push(k2);
				SphereIndices.push(k1 + 1);
			}

			if (i != (stackCount - 1))
			{
				SphereIndices.push(k1 + 1);
				SphereIndices.push(k2);
				SphereIndices.push(k2 + 1);
			}
		}
	}

	var nx = 0.0, ny = 0.0, nz = 0.0;
	for(var i = 0; i < SphereIndices.length; i += 3)
	{
		var x1, y1, z1;
		var i1 = SphereIndices[i];
		var i2 = SphereIndices[i + 1];
		var i3 = SphereIndices[i + 2];

		x1 = (SphereVertices[i1 * 6 + 0] + SphereVertices[i2 * 6 + 0] + SphereVertices[i3 * 6 + 0]) / 3.0;
		y1 = (SphereVertices[i1 * 6 + 1] + SphereVertices[i2 * 6 + 1] + SphereVertices[i3 * 6 + 1]) / 3.0;
		z1 = (SphereVertices[i1 * 6 + 2] + SphereVertices[i2 * 6 + 2] + SphereVertices[i3 * 6 + 2]) / 3.0;

		nx = (SphereVertices[i1 * 6 + 3] + SphereVertices[i2 * 6 + 3] + SphereVertices[i3 * 6 + 3]) / 3.0;
		ny = (SphereVertices[i1 * 6 + 4] + SphereVertices[i2 * 6 + 4] + SphereVertices[i3 * 6 + 4]) / 3.0;
		nz = (SphereVertices[i1 * 6 + 5] + SphereVertices[i2 * 6 + 5] + SphereVertices[i3 * 6 + 5]) / 3.0;

		SphereFaces.push(x1);
		SphereFaces.push(y1);
		SphereFaces.push(z1);

		var norm1 = vec3.create();
		vec3.set(norm1, nx, ny, nz);
		vec3.normalize(norm1, norm1);

		SphereFaces.push(x1 + norm1[0] * 0.02);
		SphereFaces.push(y1 + norm1[1] * 0.02);
		SphereFaces.push(z1 + norm1[2] * 0.02);
	}
}
