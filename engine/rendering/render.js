var GlobalState = 
{
    dt : 0.0,
    lastDT : 0,

    orbitSpeed : 30,

    Shader : null,

    GPUTexCoords : false,
    Mapping : 1,
    Entity : 2,

    selectedObject: -1,
    selectedLight: -1,

    maxLightCount : 16,
    lightCount : 0,
    AttCoef : [0.2, 0.1, 0.05],
    Ambient : [0.1, 0.1, 0.1],
    Fog : [0.5, 0.5, 0.5],
    ObjEmissive : [0.9, 0.45, 0.45],
    Shininess: 32.0,

    lightData : [],
    stateData : [],

    lightBuffer : {},
    stateBuffer : {},

    DrawFaceNormals : false,
    DrawVertexNormals : false,
};

var decalLines = [];
var decalLinesVBO = null;

var PV = mat4.create();

window.requestAnimFrame = (function() 
{
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) 
		{
            return window.setTimeout(callback, 1000 / 60);
        }
    );
})();

function tick() 
{
    requestAnimFrame(tick);
    
    if(canvasInit)
    {
        var now = Date.now();
        GlobalState.dt = (now - GlobalState.lastDT) / 1000;
        GlobalState.lastDT = now;

        resize();
        gl.viewport(0, 0, canvas.width, canvas.height);

        var temp = vec3.create();
        vec3.add(temp, camera.Pos, camera.Front);
        mat4.lookAt(camera.view, camera.Pos, temp, camera.Up);

        if(Rendering)
        {
            GlobalState.lightCount = 0;
            GlobalState.lightData = [];
            GlobalState.stateData = [];

            DrawObjects();

            DrawDecals();
        }
    }
    else 
    {
        //console.log(ObjectsLoaded + "} ObjectsLoaded == ObjCount }" + ObjCount)
    }
}

function DrawObjects() 
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var persp = mat4.create();
    mat4.perspective(persp, camera.fov * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);

    mat4.mul(PV, persp, camera.view);
    gl.useProgram(GlobalState.Shader);

    for(var i = 0; i < ObjCount; i++)
    {
        var obj = ObjList[i];

        if(!obj.draw) continue;
        Draw(obj, GlobalState.Shader, persp);
    }
}

function Draw(obj, shader, persp)
{
    mat4.copy(obj.vMatrix, camera.view);
    mat4.copy(obj.pMatrix, persp);

    mat4.identity(obj.mvMatrix);
    mat4.identity(obj.MVPMatrix);

    mat4.translate(obj.mvMatrix, obj.mvMatrix, [(obj.transform.pos[0]), (obj.transform.pos[1]), (obj.transform.pos[2])]);
    mat4.rotate(obj.mvMatrix, obj.mvMatrix, obj.transform.rotation * Math.PI / 180.0, obj.transform.axis);
    mat4.scale(obj.mvMatrix, obj.mvMatrix, [(obj.transform.scale[0]), (obj.transform.scale[1]), (obj.transform.scale[2])]);
    
    mat4.mul(obj.MVPMatrix, PV, obj.mvMatrix);
    
    shader.applyAttribute(obj);
    shader.setUniforms(obj);

    gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);
}

function DrawDecals() 
{
    // Non object associated decals (line, boxes, arrows)

    // Draw lines
    gl.bindBuffer(gl.ARRAY_BUFFER, decalLinesVBO);

    gl.useProgram(shaderLine);

    shaderLine.setUniforms(PV, [1.0, 1.0, 1.0, 1.0]);
    shaderLine.applyAttribute();

    gl.drawArrays(gl.LINES, 0, decalLines.length / 3);
}

function resize() 
{
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    if (canvas.width  != displayWidth || canvas.height != displayHeight) 
    {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
}
