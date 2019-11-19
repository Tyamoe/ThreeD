function setup()
{
	vec3.set(camera.Pos, 0.55, 5.24167, 6.46749);
	vec3.set(camera.Front, -0.0996, -0.6461, -0.7567);
	vec3.set(camera.Up, 0, 1, 0);

	bindEvents();

	CanvasLoaded();
}

function bindEvents()
{
	canvas.onmousedown = function(ev) 
	{
		var x = ev.clientX, y = ev.clientY;

		var rect = ev.target.getBoundingClientRect();

		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) 
		{
			x = x - rect.left, y = rect.bottom - y;
			Pick(x, y);
		}
 	}
}