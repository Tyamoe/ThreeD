var Mouse = function() 
{ 
  this.firstMouse = true;
  this.lastX = canvas.width / 2.0;
  this.lastY = canvas.height / 2.0;

  this.sensitivity = 0.05;
  this.yaw = -90.0;
  this.pitch = 0.0;
}

var Keyboard = function() 
{ 
  
}

//Mouse
window.addEventListener('mousemove', handleHover, false);
///window.addEventListener('mousedown', handleClick, false);
window.addEventListener('keydown', handleKeys, false);
window.addEventListener('keyup', handleKeysUp, false);
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

function handleKeysUp(event)
{
  if(event.keyCode == 17)
  {
    Init = false;
    ControlCamera = false;
  }
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

  if(event.keyCode == 17)
  {
    if(!ControlCamera && Init)
    {
      Init = false;
    }
    ControlCamera = true;
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
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Up, -speed);
  }
  if(event.keyCode == 69)
  {//E
    vec3.scaleAndAdd(camera.Pos, camera.Pos, camera.Up, speed);
  }
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
