var importPanel = null;

var importFiles = null;

function ImportPanel()
{
	importPanel.style.display = "block";
}

function CloseImportPanel()
{
	importPanel.style.display = "none";
}

function ImportSelectFile(files)
{
	console.log("File: " + files[0].name);
	importFiles = files[0];
}

function LoadSelectFile()
{
	loadObj(importFiles, "Test", new Float32Array([0.9, 0.45, 0.45, 1]), RenderMode.Phong, false);
	CloseImportPanel();
}