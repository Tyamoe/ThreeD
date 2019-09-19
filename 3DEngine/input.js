//Mouse
window.addEventListener('mousemove', handleHover, false);
///window.addEventListener('mousedown', handleClick, false);
window.addEventListener('keydown', handleKeys, false);
window.addEventListener('wheel', handleScroll, false);

function handleScroll(event)
{
  if(!WebGlInitialized)
  {
    return;
  }
  
  if(!canvasInFocus)
  {
    return;
  }

  //camera.fov += (event.deltaY / event.deltaY);
}

function handleKeys(event)
{
  if(!WebGlInitialized)
  {
    return;
  }
  
  //console.log("IDJijjd");
  
  if(!canvasInFocus)
  {
    return;
  }

  var testj = getObjByName("bunny.obj");
  var testj2 = getObjByName("sphere1");

  //console.log(testj);
  //console.log("--------------------------------------------");
  //console.log(testj2);

  if(event.keyCode == 187 && !firefox)
  {//Add
    console.log(testj);
    updateScale(testj, 0.5, 0.5, 0.5);
  }
  if(event.keyCode == 189 && !firefox)
  {//Sub
    updateScale(testj, -0.5, -0.5, -0.5);
  }

  if(event.keyCode == 61 && firefox)
  {//Add
    updateScale(testj, 0.5, 0.5, 0.5);
  }
  if(event.keyCode == 173 && firefox)
  {//Sub
    updateScale(testj, -0.5, -0.5, -0.5);
  }

  if(event.keyCode == 49)
  {//1
    //updateRotation(testj2, 0.785398);
    camera.Front[2] += 0.1;
  }
  if(event.keyCode == 50)
  {//2
    //updateRotation(testj2, 1.5708);
    camera.Front[2] -= 0.1;
  }

  if(event.keyCode == 37)
  {//Left
   	//updateTransform(testj2, -0.1, "y", "z");
    camera.Front[0] -= 0.1;
  }
  if(event.keyCode == 38)
  {//Up
  	//updateTransform(testj2, "x", 0.1, "z");
    camera.Front[1] += 0.1;
  }
  if(event.keyCode == 39)
  {//Right
   	//updateTransform(testj2, 0.1, "y", "z");
    camera.Front[0] += 0.1;
  }
  if(event.keyCode == 40)
  {//Down
    //updateTransform(testj2, "x", -0.1, "z");
    camera.Front[1] -= 0.1;
  }

  if(event.keyCode == 66)
  {//B
   	//updateTransform(testj2, "x", "y", 0.1);
    fogDist1[1]  += 1;
    console.log("Fog: " + fogDist1);
  }
  if(event.keyCode == 67)
  {//C
   	//updateTransform(testj2, "x", "y", -0.1);
    if (fogDist1[1] > fogDist1[0]) fogDist1[1] -= 1;
    console.log("Fog: " + fogDist1);
  }

  //CAMERA CONTROLS
  if(event.keyCode == 65)
  {//A
   	var temp = vec3.create();

   	vec3.cross(temp, camera.Front, camera.Up);
   	vec3.normalize(temp, temp);
   	scaleAndSub(camera.Pos, camera.Pos, temp, 0.1);
  }
  if(event.keyCode == 68)
  {//D
   	var temp = vec3.create();

   	vec3.cross(temp, camera.Front, camera.Up);
   	vec3.normalize(temp, temp);
   	vec3.scaleAndAdd(camera.Pos, camera.Pos, temp, 0.1);
  }
  if(event.keyCode == 87)
  {//W
   	vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Front, (0.1));
  }
  if(event.keyCode == 83)
  {//S
   	scaleAndSub(camera.Pos, camera.Pos, camera.Front, (0.1));
  }
  if(event.keyCode == 69)
  {//E
    //Move Up
    camera.Pos[1] += 0.2;
  }
  if(event.keyCode == 81)
  {//Q
    //Move Down
    camera.Pos[1] -= 0.2;
  }
  if(event.keyCode == 82)
  {//R
    //Rotate Left
    camera.rotation += 1;
    var theta = (degToRad(camera.rotation));

    var x = camera.radius * Math.sin(theta);
    var z = camera.radius * Math.cos(theta);

    camera.Pos[0] = x;
    camera.Pos[2] = z;

    var direction = vec3.create();

    vec3.subtract(direction, [0, 0, 0], camera.Pos);
    vec3.copy(camera.Front, direction);
  }
  if(event.keyCode == 84)
  {//T
    //Rotate Right
    camera.rotation -= 1;
    var theta = (degToRad(camera.rotation));

    var x = camera.radius * Math.sin(theta);
    var z = camera.radius * Math.cos(theta);

    camera.Pos[0] = x;
    camera.Pos[2] = z;

    var direction = vec3.create();

    vec3.subtract(direction, [0, 0, 0], camera.Pos);
    vec3.copy(camera.Front, direction);
  }
  if(event.keyCode == 70)
  {//F
    //Flip
    camera.Front[2] *= -1;
  }

  if(event.keyCode == 51)
  {//3
  	updateRotation(testj2, 0);
  }
  if(event.keyCode == 52)
  {//4
  	updateTransform(testj, "x", -0.1, "z");
  }
  if(event.keyCode == 53)
  {//5
  	fov -= 10;
  }
  if(event.keyCode == 54)
  {//6
  	cam += 10;
  	camera.Pos = [0, 0, cam];
  	ppp = 1;
  }
  if(event.keyCode == 55)
  {//7
  	updateAxis(testj, [1, 1, 1]);
  }
  if(event.keyCode == 56)
  {//8
  	updateAxis(testj, [1, 0, 0]);
  }

  //Output Key
  if(event.keyCode == 79)
  {//O
    //Output stuff
    console.log("Camera Pos: x-" + camera.Pos[0] + " y-" + camera.Pos[1] + " z-" + camera.Pos[2]);
    console.log("Camera Front: x-" + camera.Front[0] + " y-" + camera.Front[1] + " z-" + camera.Front[2]);
    console.log("Camera Up: x-" + camera.Up[0] + " y-" + camera.Up[1] + " z-" + camera.Up[2]);
  }

	//event.preventDefault();
}

var hcount = 0;
var pcount = 0;
var canvasInFocus = false;

function handleHover(event)
{
  if(!WebGlInitialized)
  {
    return;
  }

 /* hcount++;
  if(hcount % 2 != 0)
  {
    return;
  }*/

  var x = event.clientX;
  var y = event.clientY;

  var rect = canvas.getBoundingClientRect();

  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) 
  {
    canvasInFocus = true;
    pcount++;
    if(pcount % 2 != 0)
    {
      return;
    }
    x = x - rect.left;
    y = rect.bottom - y;
    //Pick(x, y, false);
  }
  else
  {
    canvasInFocus = false;
  }

	/*var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  if(mouse.firstMouse)
  {
  	mouse.lastX = x;
  	mouse.lastY = y;

  	mouse.firstMouse = false;
  }

  var xoffset = x - mouse.lastX;
	var yoffset = mouse.lastY - y; // Reversed since y-coordinates go from bottom to left
	
	mouse.lastX = x;
	mouse.lastY = y;

	xoffset *= mouse.sensitivity;
	yoffset *= mouse.sensitivity;

	mouse.yaw += xoffset;
	mouse.pitch += yoffset;

	// Make sure that when pitch is out of bounds, screen doesn't get flipped
	if (mouse.pitch > 89.0)
	{
		mouse.pitch = 89.0;
	}
	if (mouse.pitch < -89.0)
	{
		mouse.pitch = -89.0;
	}

	var xx = Math.cos(degToRad(mouse.yaw)) * Math.cos(degToRad(mouse.pitch));

	var yy = Math.sin(degToRad(mouse.pitch));

	var zz = Math.sin(degToRad(mouse.yaw)) * Math.cos(degToRad(mouse.pitch));

	var temp = vec3.fromValues(xx, yy, zz);

	vec3.normalize(camera.Front, temp);

  if(InBounds(x, y))
  {
  	//In
  }
  else
  {
  	//Out
  }*/
}

function handleClick(event)
{
  if(!WebGlInitialized)
  {
    return;
  }

  var x = event.clientX;
  var y = event.clientY;

  var rect = canvas.getBoundingClientRect();

  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) 
  {
    x = x - rect.left;
    y = rect.bottom - y;
    Pick(x, y, true);
  }
        /*
  event.preventDefault();     
	var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;   

  var x_pos = (event.clientX / window.innerWidth) * 2 - 1;
  var y_pos = -(event.clientY / window.innerHeight) * 2 + 1;
  var z_pos = 0.5;

  if(InBounds(x, y))
  {

    Pick(x, y);

    //translate the position to world space
    var pos = vec3.create();
    vec3.set(pos, 1, 1, 1);

    var combine = mat4.create();

    var proj = mat4.create();

    mat4.perspective(proj, 45 * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);
        
    vec3.transformMat4(pos, pos, proj);

    console.log(x + " " + y + "click: " + pos);
  }
  else
  {
  	//translateY = translateY - 1;
  }*/
}

function InBounds(x, y)
{
	var cWidth = canvas.width;
	var cHeight = canvas.height;

	if(x > cWidth || y > cHeight)
	{
		return false;
	}
	else if(x < 0 || y < 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}