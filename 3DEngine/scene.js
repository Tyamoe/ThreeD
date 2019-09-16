function makeScene()
{
	camera = new Camera();
	vec3.set(camera.Pos, 0.36, 14.23, 14.8);
	vec3.set(camera.Front, 0, -1, -1);
	vec3.set(camera.Up, 0, 1, 0);

	// Load Objects
	//loadObjFromVerts("krunk", MeshBox, ["block.png"], RenderMode.Texture, true);

	loadObjFromVerts("sphere1", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("sphere2", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("sphere3", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("sphere4", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("sphere5", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);

	//loadObjFromVerts("Bunny", "https://tyamoe.com/scripts/models/bunny.obj", new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);

	loadObjFromVerts("Skybox", MeshBox, ["dark_px.jpg", "dark_nx.jpg", "dark_py.jpg", "dark_ny.jpg", "dark_pz.jpg", "dark_nz.jpg"], RenderMode.Skybox, false);
	
	// Start Update Function
	tick();
}