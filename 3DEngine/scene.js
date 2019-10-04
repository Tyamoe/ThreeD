function makeScene()
{
	camera = new Camera();
	vec3.set(camera.Pos, 0.55, 5.24167, 6.46749);
	vec3.set(camera.Front, -0.0996, -0.6461, -0.7567);
	vec3.set(camera.Up, 0, 1, 0);

	loadObjFromVerts("Sphere1", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere2", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere3", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere4", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere5", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere6", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere7", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);
	loadObjFromVerts("Sphere8", MeshSphere, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, true);

	loadObjFromVerts("bunny.obj", "bunny.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("sphere.obj", "sphere.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("rhino.obj", "rhino.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("quad.obj", "quad.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("cup.obj", "cup.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("cube2.obj", "cube2.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("starwars1.obj", "starwars1.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("4Sphere.obj", "4Sphere.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("cube.obj", "cube.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("triangle.obj", "triangle.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("bunny_high_poly.obj", "bunny_high_poly.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("sphere_modified.obj", "sphere_modified.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	loadObjFromVerts("lucy_princeton.obj", "lucy_princeton.obj", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
}