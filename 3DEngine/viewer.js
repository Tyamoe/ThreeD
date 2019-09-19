var canvasInit = false;

window.onload = function()
{
	document.title = "Obj File Viewer";

	var viewerDiv = document.getElementById("ViewerDiv");
	var height = viewerDiv.clientHeight;
	var width = viewerDiv.clientWidth;

	var iCanvas = document.createElement('canvas');
	iCanvas.id = 'game-surface';

	var iLoad = document.createElement('div');
	iLoad.id = 'loading';

	iLoad.setAttribute("style", "position: absolute; left:0%; right:0%; top:0%; bottom:0%; text-align: center; background-color: red;");

	var iLoading = document.createElement('div');
	iLoading.className = 'loader';

	iLoad.appendChild(iLoading);

	var PauseButton = document.createElement('div');
	PauseButton.id = 'PauseButton';
	PauseButton.setAttribute("style", "position:absolute; right:0.5%; top:0.5%; width:4vw; height:4vw; background-color: white;");
	PauseButton.onclick = function () { togglePause(); };

	var UnfocusButton = document.createElement('div');
	UnfocusButton.id = 'UnfocusButton';
	UnfocusButton.setAttribute("style", "position:absolute; right:5vw; top:0.5%; width:4vw; height:4vw; background-color: red;");
	UnfocusButton.onclick = function () { UnfocusNode(); };

	viewerDiv.appendChild(iCanvas);
	viewerDiv.appendChild(PauseButton); 
	viewerDiv.appendChild(UnfocusButton); 
	viewerDiv.appendChild(iLoad); 
  
	iCanvas.setAttribute("style", "width: 100%; height: 100%;");

	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{		
		firefox = true;
	}

	InitWebGL();
}

var fileToLoad = null;
function SelectFile(files)
{
	console.log("File: " + files[0].name);
	fileToLoad = files[0];

	/*https://stackoverflow.com/questions/24817347/how-do-you-convert-a-local-uri-to-path/24844838#24844838
	const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
	Cu.import("resource://gre/modules/NetUtil.jsm");

	var aFileURL = 'file:///C:/path-to-local-file/root.png';
	var path = NetUtil.newURI(aFileURL).QueryInterface(Ci.nsIFileURL).file.path;*/
}

function LoadSelectFile()
{
	loadObj(fileToLoad, fileToLoad.name, new Float32Array([0.55, 0.55, 0.55, 1]), RenderMode.Phong, false);
}

function UnfocusNode()
{
    ObjList[ObjInFocus].clock.tick = 0;
    ObjList[ObjInFocus].inFocus = Focus.TRANSIT_FROM;
}

function togglePause()
{
	if(Paused)
	{
		Paused = false;
		Rendering = true;
	}
	else
	{
		Paused = true;
		Rendering = false;
	}
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
