//Mouse
window.addEventListener('mousemove', handleHover, false);
///window.addEventListener('mousedown', handleClick, false);
window.addEventListener('keydown', handleKeys, false);
window.addEventListener('wheel', handleScroll, false);

var Init = false;
var screenOffsetX = 0.0;
var screenOffsetY = 0.0;
var prevMouseX = 0.0;
var prevMouseY = 0.0;

var ControlCamera = false;

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
  
  if(!canvasInFocus)
  {
    return;
  }

  // UI Hotkeys
  if(event.keyCode == 67)
  {//C
    ControlCamera = !ControlCamera;
    var toggle = document.getElementById("toggleCameraControl");
    toggle.checked = ControlCamera;
  }

  // Camera Control
  var speed = 0.85;

  if(event.keyCode == 87)
  {//W
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Front, speed);
  }
  if(event.keyCode == 83)
  {//S
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Front, -speed);
  }
  if(event.keyCode == 65)
  {//A
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Right, -speed);
  }
  if(event.keyCode == 68)
  {//D
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Right, speed);
  }
  if(event.keyCode == 81)
  {//Q
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Up, speed);
  }
  if(event.keyCode == 69)
  {//E
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Up, -speed);
  }

  //HandleClusterF(event.keyCode);
}

var hcount = 0;
var pcount = 0;
var canvasInFocus = false;

function handleHover(event)
{
  if(!WebGlInitialized)
  {
    //return;
  }

  var x = event.clientX;
  var y = event.clientY;

  var rect = canvas.getBoundingClientRect();

  if(ControlCamera)
  {
    x = x - rect.left;
    y = rect.bottom - y;

    if(!Init)
    {
      prevMouseX = x;
      prevMouseY = y;

      screenOffsetX = x;
      screenOffsetY = y;
      Init = true;
    }
    else
    {
      var sensitivity = 0.75;

      screenOffsetX = x - prevMouseX;
      screenOffsetY = y - prevMouseY;
      prevMouseX = x;
      prevMouseY = y;
      screenOffsetX *= sensitivity;
      screenOffsetY *= sensitivity;

      camera.yaw += screenOffsetX;
      camera.pitch += screenOffsetY;

      if (camera.pitch > 89.0) camera.pitch = 89.0;
      if (camera.pitch < -89.0) camera.pitch = -89.0;

      var tempx = Math.cos(degToRad(camera.pitch)) * Math.cos(degToRad(camera.yaw));
      var tempy = Math.sin(degToRad(camera.pitch));
      var tempz = Math.cos(degToRad(camera.pitch)) * Math.sin(degToRad(camera.yaw));

      vec3.set(camera.Front, tempx, tempy, tempz);
      vec3.normalize(camera.Front, camera.Front);
      vec3.cross(camera.Right, camera.Front, camera.Up);
      vec3.normalize(camera.Right, camera.Right);
    }
  }

  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) 
  {
    canvasInFocus = true;

  }
  else
  {
    canvasInFocus = false;
  }
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
    Pick(x, y);
  }
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

function HandleClusterF(keyCode)
{

  var testj = getObjByName("bunny.obj");
  var testj2 = getObjByName("sphere1");

  //console.log(testj);
  //console.log("--------------------------------------------");
  //console.log(testj2);

  if(keyCode == 187 && !firefox)
  {//Add
    console.log(testj);
    updateScale(testj, 0.5, 0.5, 0.5);
  }
  if(keyCode == 189 && !firefox)
  {//Sub
    updateScale(testj, -0.5, -0.5, -0.5);
  }
  if(keyCode == 61 && firefox)
  {//Add
    updateScale(testj, 0.5, 0.5, 0.5);
  }
  if(keyCode == 173 && firefox)
  {//Sub
    updateScale(testj, -0.5, -0.5, -0.5);
  }

  if(keyCode == 49)
  {//1
    //updateRotation(testj2, 0.785398);
    camera.Front[2] += 0.1;
  }
  if(keyCode == 50)
  {//2
    //updateRotation(testj2, 1.5708);
    camera.Front[2] -= 0.1;
  }

  if(keyCode == 37)
  {//Left
    //updateTransform(testj2, -0.1, "y", "z");
    camera.Front[0] -= 0.1;
  }
  if(keyCode == 38)
  {//Up
    //updateTransform(testj2, "x", 0.1, "z");
    camera.Front[1] += 0.1;
  }
  if(keyCode == 39)
  {//Right
    //updateTransform(testj2, 0.1, "y", "z");
    camera.Front[0] += 0.1;
  }
  if(keyCode == 40)
  {//Down
    //updateTransform(testj2, "x", -0.1, "z");
    camera.Front[1] -= 0.1;
  }

  if(keyCode == 66)
  {//B
    //updateTransform(testj2, "x", "y", 0.1);
    fogDist1[1]  += 1;
    console.log("Fog: " + fogDist1);
  }
  if(keyCode == 67)
  {//C
    //updateTransform(testj2, "x", "y", -0.1);
    if (fogDist1[1] > fogDist1[0]) fogDist1[1] -= 1;
    console.log("Fog: " + fogDist1);
  }

  //CAMERA CONTROLS
  if(keyCode == 65)
  {//A
    var temp = vec3.create();

    vec3.cross(temp, camera.Front, camera.Up);
    vec3.normalize(temp, temp);
    scaleAndSub(camera.Pos, camera.Pos, temp, 0.1);
  }
  if(keyCode == 68)
  {//D
    var temp = vec3.create();

    vec3.cross(temp, camera.Front, camera.Up);
    vec3.normalize(temp, temp);
    vec3.scaleAndAdd(camera.Pos, camera.Pos, temp, 0.1);
  }
  if(keyCode == 87)
  {//W
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Front, (0.1));
  }
  if(keyCode == 83)
  {//S
    scaleAndSub(camera.Pos, camera.Pos, camera.Front, (0.1));
  }
  if(keyCode == 69)
  {//E
    //Move Up
    camera.Pos[1] += 0.2;
  }
  if(keyCode == 81)
  {//Q
    //Move Down
    camera.Pos[1] -= 0.2;
  }
  if(keyCode == 82)
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
  if(keyCode == 84)
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
  if(keyCode == 70)
  {//F
    //Flip
    camera.Front[2] *= -1;
  }

  if(keyCode == 51)
  {//3
    updateRotation(testj2, 0);
  }
  if(keyCode == 52)
  {//4
    updateTransform(testj, "x", -0.1, "z");
  }
  if(keyCode == 53)
  {//5
    fov -= 10;
  }
  if(keyCode == 54)
  {//6
    cam += 10;
    camera.Pos = [0, 0, cam];
    ppp = 1;
  }
  if(keyCode == 55)
  {//7
    updateAxis(testj, [1, 1, 1]);
  }
  if(keyCode == 56)
  {//8
    updateAxis(testj, [1, 0, 0]);
  }

  //Output Key
  if(keyCode == 79)
  {//O
    //Output stuff
    console.log("Camera Pos: x-" + camera.Pos[0] + " y-" + camera.Pos[1] + " z-" + camera.Pos[2]);
    console.log("Camera Front: x-" + camera.Front[0] + " y-" + camera.Front[1] + " z-" + camera.Front[2]);
    console.log("Camera Up: x-" + camera.Up[0] + " y-" + camera.Up[1] + " z-" + camera.Up[2]);
  }
}