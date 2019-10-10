var RenderMode = 
{
  Texture: 1,
  Phong: 2,
  Skybox: 3,
};

var DrawNormalsVertex = false;
var DrawNormalsFace = false;

var decalLines = [];
var decalLinesVBO = null;

var ObjectsLoaded = 0;
var PV = mat4.create();

//Animation
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

function animate()
{
    for(var i = 0; i < ObjCount; i++)
    {
        var obj = ObjList[i];
        if(!obj.animate) continue;

        obj.angle += 0.1;

        var theta = (degToRad(obj.angle));

        obj.transform.pos[0] = 3 * Math.sin(theta);
        obj.transform.pos[2] = 3 * Math.cos(theta);
    }
}

function tick() 
{
    requestAnimFrame(tick);
    
    if(canvasInit && ObjectsLoaded == ObjCount)
    {
        var now = Date.now();
        dt = (now - lastUpdate) / 1000;
        lastUpdate = now;

        resize();
        gl.viewport(0, 0, canvas.width, canvas.height);

        var temp = vec3.create();
        vec3.add(temp, camera.Pos, camera.Front);
        mat4.lookAt(camera.view, camera.Pos, temp, camera.Up);

        if(Rendering)
        {
            //animate();

            DrawObjects();

            if(DrawNormalsVertex)
                DrawVertexNormals();
            if(DrawNormalsFace)
                DrawFaceNormals();

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

    for(var i = 0; i < ObjCount; i++)
    {
        var obj = ObjList[i];

        if(!obj.draw) continue;
        
        mat4.copy(obj.vMatrix, camera.view);
        mat4.copy(obj.pMatrix, persp);

        mat4.identity(obj.mvMatrix);
        mat4.identity(obj.MVPMatrix);

        mat4.translate(obj.mvMatrix, obj.mvMatrix, [(obj.transform.pos[0]), (obj.transform.pos[1]), (obj.transform.pos[2])]);
        mat4.rotate(obj.mvMatrix, obj.mvMatrix, obj.transform.rotation, obj.transform.axis);
        mat4.scale(obj.mvMatrix, obj.mvMatrix, [(obj.transform.scale[0]), (obj.transform.scale[1]), (obj.transform.scale[2])]);
        
        mat4.mul(obj.MVPMatrix, PV, obj.mvMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IBO);

        if(obj.renderMode == RenderMode.Phong)
        {
            gl.useProgram(shaderPhong);
        
            shaderPhong.setUniforms(obj);
            shaderPhong.applyAttribute(obj);

            gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);
        }
        else if(obj.renderMode == RenderMode.Texture)
        {
            gl.useProgram(shaderSmall);
            
            shaderSmall.setUniforms(obj);
            shaderSmall.applyAttribute(obj);

            gl.bindTexture(gl.TEXTURE_2D, obj.texture);
            gl.activeTexture(gl.TEXTURE0);

            gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);
        }
        else
        {
            gl.useProgram(shaderSkybox);
            
            shaderSkybox.setUniforms(obj);
            shaderSkybox.applyAttribute(obj);

            var oldRange = gl.getParameter(gl.DEPTH_RANGE);

            gl.depthRange(1.0, 1.0);

            gl.disable(gl.CULL_FACE);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, obj.texture);

            gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);

            gl.enable(gl.CULL_FACE);
            
            gl.depthRange(oldRange[0], oldRange[1]);
        }
    }
}

function DrawVertexNormals() 
{
    gl.lineWidth(0.1);
    for(var i = 0; i < ObjCount; i++)
    {
        var obj = ObjList[i];

        if(!obj.draw || obj.renderMode != RenderMode.Phong) continue;

        // Draw Lines
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBO);

        gl.useProgram(shaderLine);
    
        shaderLine.setUniforms(obj.MVPMatrix, [1.0, 0.0, 0.0, 1.0]);
        shaderLine.applyAttribute();

        gl.drawArrays(gl.LINES, 0, obj.mesh.vertices.length / 3);
    }
}

function DrawFaceNormals() 
{
    gl.lineWidth(0.1);
    for(var i = 0; i < ObjCount; i++)
    {
        var obj = ObjList[i];

        if(!obj.draw || obj.renderMode != RenderMode.Phong) continue;

        // Draw Lines
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VBOFace);
    
        gl.useProgram(shaderLine);

        shaderLine.setUniforms(obj.MVPMatrix, [1.0, 1.0, 0.0, 1.0]);
        shaderLine.applyAttribute();

        gl.drawArrays(gl.LINES, 0, obj.mesh.faceNormals.length / 3);
    }
}

function DrawDecals() 
{
    // None object associated decals (line, boxes, arrows)

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

//Test 
var skyRendered = false;
var tik = 0;
var canvasLoaded = false;

var fov = 45;

var cam = 3;

var print = false;

var lastUpdate = 0;

var fogDist1 = new Float32Array([79, 201]);