var canvasInit = false;
var firefox = false;

window.onload = function()
{
	document.title = "ThreeD";

	var viewerDiv = document.getElementById("ViewerDiv");
	var height = viewerDiv.clientHeight;
	var width = viewerDiv.clientWidth;

	var Canvas = document.createElement('canvas');
	Canvas.id = 'GLContext';

	var loadingDiv = document.createElement('div');
	loadingDiv.id = 'loading';

	loadingDiv.setAttribute("style", "position: absolute; left:0%; right:0%; top:0%; bottom:0%; text-align: center; background-color: red;");

	var loadingBar = document.createElement('div');
	loadingBar.className = 'loader';

	loadingDiv.appendChild(loadingBar);

	viewerDiv.appendChild(Canvas);
	viewerDiv.appendChild(loadingDiv); 
  
	Canvas.setAttribute("style", "width: 100%; height: 100%;");

	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{		
		firefox = true;
	}

	InitUI();
	InitEngine();
}

function CanvasLoaded()
{
 	var elem = document.getElementById('loading');
  	elem.parentNode.removeChild(elem);
  	canvasInit = true;
}

function toggleFullScreenButton() 
{
	var fullscreen = document.getElementById("fullscreen");
	fullscreen.style.backgroundColor = blue;
	fullscreen.style.backgroundSize = "100% 100%";
}

// mozfullscreenerror event handler
function errorHandler() 
{
   alert('mozfullscreenerror');
}
document.documentElement.addEventListener('mozfullscreenerror', errorHandler, false);

// toggle full screen
function toggleFullScreen() 
{
	var fullscreen = document.getElementById("fullscreen");

	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) 
	{  
		//Switch to minizmie icon
		fullscreen.style.backgroundColor = yellow;
		fullscreen.style.backgroundSize = "100% 100%";

		// current working methods
		if (document.documentElement.requestFullscreen) 
		{
			document.documentElement.requestFullscreen();
		} 
		else if (document.documentElement.mozRequestFullScreen) 
		{
			document.documentElement.mozRequestFullScreen();
		} 
		else if (document.documentElement.webkitRequestFullscreen) 
		{
			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} 
	else 
	{
		//Switch to maximize icon
		fullscreen.style.backgroundColor = blue;
		fullscreen.style.backgroundSize = "100% 100%";

		if (document.cancelFullScreen) 
		{
			document.cancelFullScreen();
		} 
		else if (document.mozCancelFullScreen)
		{
			document.mozCancelFullScreen();
		} 
		else if (document.webkitCancelFullScreen) 
		{
			document.webkitCancelFullScreen();
		}
	}
}
