function Pick(x, y)
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

        if(obj.pickShader != null)
        {
            shaderPick.applyAttribute(obj);
            gl.useProgram(shaderPick);

            var r = i + 100 + 1;
            var g = i + 100 + 1;
            var b = i + 100 + 1;

            shaderPick.setUniforms(obj, new Float32Array([r/255.0, g/255.0, b/255.0, 1.0]));
        }
        else
        {
            shaderSkybox.applyAttribute(obj);
            gl.useProgram(shaderSkybox);
            shaderSkybox.setUniforms(obj);
        }

        if(obj.skybox)
        {
            var oldRange = gl.getParameter(gl.DEPTH_RANGE);

            gl.depthRange(1.0, 1.0);
            gl.disable(gl.CULL_FACE);
                
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, obj.texture);

            gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);

            gl.enable(gl.CULL_FACE);
            gl.depthRange(oldRange[0], oldRange[1]); 
        }
        else
        {
            gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_INT, 0);
        }
    }

    var pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Convert the color back to an integer ID
    var pickID = (pixels[0] > 100) ? (pixels[0] % 100) - 1 : -1;

    if(pickID < 0)
    {
        console.log("No " + pixels);
        return;
    }

    if(pickID < ObjCount)
    {
         console.log("Object Clicked : " + ObjList[pickID].name);
    }
}
