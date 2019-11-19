var Camera = function() 
{ 
	this.fov = 45;

	this.rotation = 0.25;

	this.pitch = 0.0;
	this.yaw = 0.0;

	this.Pos = vec3.create();
	this.Front = vec3.create();
	this.Up = vec3.create();
	this.Right = vec3.create();

	vec3.set(this.Front, 0, 0, -1);
	vec3.set(this.Up, 0, 1, 0);
	vec3.set(this.Right, 1, 0, 0);

	this.view = mat4.create();
}