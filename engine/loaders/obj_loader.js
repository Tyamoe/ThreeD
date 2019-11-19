function loadOBJ(fileStream, Name, transform = null, show = false)
{
	console.log("Loading: " + fileStream.name);
	var reader = new FileReader();
	
	reader.onload = function(progressEvent)
	{
		var Vertices = [];
		var NormalsVertices = [];
		var NormalsFace = [];
		var Indices = [];

		var MapPlanar = [];
		var MapSphere = [];
		var MapCylinder = [];

		var MapPlanarN = [];
		var MapSphereN = [];
		var MapCylinderN = [];

		var NormalsVertexSum = [];
		var zero = vec3.create();
		vec3.set(zero, 0, 0, 0);
		var minVec = vec3.fromValues(100000, 100000, 100000);
		var maxVec = vec3.fromValues(-100000, -100000, -100000);
		
		var MaxDis = 0.0;
		var MaxMag = 0.0;

		var minX = Infinity;
		var minY = Infinity;
		var minZ = Infinity;
		var maxX = -Infinity;
		var maxY = -Infinity;
		var maxZ = -Infinity;
		
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

					vec3.min(minVec, minVec, vvv);
					vec3.max(maxVec, maxVec, vvv);
					
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

		var v1 = vec3.create();
		var v2 = vec3.create();
		var v3 = vec3.create();

		var vec1 = vec3.create();
		var vec2 = vec3.create();

		var crossP = vec3.create();

		var dx = maxX + minX; //
		var dy = maxY + minY; //
		var dz = maxZ + minZ; //

		var sx = (dx / 2.0); //
		var sy = (dy / 2.0); //
		var sz = (dz / 2.0); //

		minX = Infinity;
		minY = Infinity;
		minZ = Infinity;
		maxX = -Infinity;
		maxY = -Infinity;
		maxZ = -Infinity;

		// Vertex Centering
		for(var i = 0; i < Vertices.length; i += 3)
		{
			var oldLow = -MaxDis;
			var oldHigh = MaxDis;
			var newLow = -1.0;
			var newHigh = 1.0;

			var x = Vertices[i + 0];
			var y = Vertices[i + 1];
			var z = Vertices[i + 2];

			x -= sx;
			y -= sy;
			z -= sz;
			
			//x = ( (x - -MaxDis) / (MaxDis - -MaxDis) ) * (0.5 - -0.5 + -0.5);
			//y = ( (y - -MaxDis) / (MaxDis - -MaxDis) ) * (0.5 - -0.5 + -0.5);
			//z = ( (z - -MaxDis) / (MaxDis - -MaxDis) ) * (0.5 - -0.5 + -0.5);

			x = mapToRange(x, -MaxDis, MaxDis, -1.0, 1.0);
			y = mapToRange(y, -MaxDis, MaxDis, -1.0, 1.0);
			z = mapToRange(z, -MaxDis, MaxDis, -1.0, 1.0);

			Vertices[i + 0] = x;
			Vertices[i + 1] = y;
			Vertices[i + 2] = z;

			minX = minX > x ? x : minX;
			minY = minY > y ? y : minY;
			minZ = minZ > z ? z : minZ;

			maxX = maxX < x ? x : maxX;
			maxY = maxY < y ? y : maxY;
			maxZ = maxZ < z ? z : maxZ;
		}

		dx = maxX + minX; //
		dy = maxY + minY; //
		dz = maxZ + minZ; //
		sx = (dx / 2.0); //
		sy = (dy / 2.0); //
		sz = (dz / 2.0); //

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

		// Vertex Normals
		for(var i = 0; i < Vertices.length; i += 3)
		{
			var x = Vertices[i + 0];
			var y = Vertices[i + 1];
			var z = Vertices[i + 2];

			NormalsVertices.push( x );
			NormalsVertices.push( y );
			NormalsVertices.push( z );

			vec3.normalize(vec1, NormalsVertexSum[i / 3]);

			NormalsVertices.push(x + (vec1[0] * 0.02));
			NormalsVertices.push(y + (vec1[1] * 0.02));
			NormalsVertices.push(z + (vec1[2] * 0.02));
		}


		let uv = [];
		// Texture Coords
		for(var i = 0; i < NormalsVertices.length; i += 6)
		{
			let vertex = vec3.fromValues(NormalsVertices[i+0], NormalsVertices[i+1], NormalsVertices[i+2]);
			let normal = vec3.fromValues(NormalsVertices[i+3] - vertex[0], NormalsVertices[i+4] - vertex[1], NormalsVertices[i+5] - vertex[2]);
			vec3.normalize(normal, normal);

			// Cylindrical
            uv = CylinderMap(vertex, minZ, maxZ);

			MapCylinder.push(uv[0]);
			MapCylinder.push(uv[1]);

            uv = CylinderMap(normal, minZ, maxZ);

			MapCylinderN.push(uv[0]);
			MapCylinderN.push(uv[1]);

			// Spherical
            uv = SphereMap(vertex);

			MapSphere.push(uv[0]);
			MapSphere.push(uv[1]);

            uv = SphereMap(normal);

			MapSphereN.push(uv[0]);
			MapSphereN.push(uv[1]);

			// Cubic
            uv = CubicMap(vertex, vertex, {X:maxX,Y:maxY,Z:maxZ});

			MapPlanar.push(uv[0]);
			MapPlanar.push(uv[1]);

            uv = CubicMap(normal, vertex, {X:maxX,Y:maxY,Z:maxZ});

			MapPlanarN.push(uv[0]);
			MapPlanarN.push(uv[1]);
		}

		var NewMesh = new Mesh(fileStream.name);
		NewMesh.vertices = NormalsVertices;
		NewMesh.indices = Indices;
		NewMesh.faceNormals = NormalsFace;
		NewMesh.UVPlanar = MapPlanar;
		NewMesh.UVSphere = MapSphere;
		NewMesh.UVCylinder = MapCylinder;
		NewMesh.UVPlanarN = MapPlanarN;
		NewMesh.UVSphereN = MapSphereN;
		NewMesh.UVCylinderN = MapCylinderN;

		NewMesh.boundMin = [minX, minY, minZ];
		NewMesh.boundMax = [maxX, maxY, maxZ];
		NewMesh.boundCenter = [sx, sy, sz];

		NewMesh.makeBuffers();

		MeshLoaded.push(NewMesh);

		return CreateObject(Name, NewMesh, transform, show);
	};
	
	reader.readAsText(fileStream);
}
