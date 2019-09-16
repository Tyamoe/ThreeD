function Pick(x, y, mode1)
{
    if(mode1 == Mode.ORBIT)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var persp = mat4.create();
        mat4.perspective(persp, camera.fov * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);
        mat4.mul(PV, persp, camera.view);

        for(var i = 0; i < ObjCount; i++)
        {
            var obj = ObjList[i];

            mat4.copy(obj.vMatrix, camera.view);
            mat4.copy(obj.pMatrix, persp);

            mat4.identity(obj.mvMatrix);
            mat4.identity(obj.MVPMatrix);

            mat4.translate(obj.mvMatrix, obj.mvMatrix, [(obj.transform.pos[0]), (obj.transform.pos[1]), (obj.transform.pos[2])]);
            mat4.rotate(obj.mvMatrix, obj.mvMatrix, obj.transform.rotation, obj.transform.axis);
            mat4.scale(obj.mvMatrix, obj.mvMatrix, [(obj.transform.scale[0]), (obj.transform.scale[1]), (obj.transform.scale[2])]);
            
            mat4.mul(obj.MVPMatrix, PV, obj.mvMatrix);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.VertexBufferObject);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.mesh.IndexBufferObject);

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

                gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_SHORT, 0);

                gl.enable(gl.CULL_FACE);
                gl.depthRange(oldRange[0], oldRange[1]); 
            }
            else
            {
                gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
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
            var newPos = vec3.create();
            var newFront = vec3.create();

            vec3.set(newFront, 0, 0, -1);

            vec3.scaleAndAdd(newPos, camera.Pos, newFront, 3.5);
                
            ObjInFocus = pickID;

            ObjList[pickID].inFocus = Focus.TRANSIT_TO;
            
            vec3.subtract(ObjList[pickID].transform.vel, newPos, ObjList[pickID].transform.pos);

            vec3.copy(ObjList[pickID].transform.destination, newPos);
            mode = Mode.FOCUS;
        }
    }
    else if(mode == Mode.FOCUS)
    {
        DrawObjects();

        var pixels = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        console.log("Focus Mode Seatching for button clicks: " + pixels);

        //Search for button clicks
        if(parsePixel(pixels) == Pixel.EXIT)
        {
            //Set object to return back to orbit
            ObjList[ObjInFocus].clock.tick = 0;
            ObjList[ObjInFocus].inFocus = Focus.TRANSIT_FROM;
            ObjList[ObjInFocus].texture = ObjList[ObjInFocus].textureArray[0];
            //console.log("Exit button clicked: " + Obj2List[ObjInFocus].name);
        }
        else if(parsePixel(pixels) == Pixel.DOWNLOAD)
        {
            //download
            toggleFullScreenButton();
            window.open(ObjList[ObjInFocus].data.download, '_blank');
        }
        else if(parsePixel(pixels) == Pixel.DOWNLOAD2)
        {
            //download
            toggleFullScreenButton();
            window.open(ObjList[ObjInFocus].data.download2, '_blank');
        }
        else if(parsePixel(pixels) == Pixel.NEXT)
        {
            //Switch to next page (change texture to next page)
        }
        else if(parsePixel(pixels) == Pixel.PREVIOUS)
        {
            //Switch to previous page (change texture to previous page)
        }
        else if(parsePixel(pixels) == Pixel.LINK)
        {
            //Open link
            toggleFullScreenButton();
            window.open(ObjList[ObjInFocus].data.link, '_blank');
        }
        else
        {
            //Invalid
            console.log("Invalid CLick: " + ObjList[ObjInFocus].name);
        }
    }
}

function parsePixel(pixel)
{
    if(pixel[0] == 255 && (pixel[1] + pixel[2]) == 0)
    {
        return Pixel.EXIT;
    }

    if(pixel[1] == 155 && (pixel[0] + pixel[2]) == 0)
    {
        return Pixel.DOWNLOAD;
    }

    if(pixel[1] == 156 && (pixel[0] + pixel[2]) == 0)
    {
        return Pixel.DOWNLOAD2;
    }

    if(pixel[0] == 255 && pixel[1] == 155)
    {
        return Pixel.NEXT;
    }

    if(pixel[0] == 255 && pixel[1] == 150)
    {
        return Pixel.PREVIOUS;
    }

    if(pixel[0] == 255 && pixel[1] == 255 && pixel[2] == 0)
    {
        return Pixel.LINK;
    }

    if(pixel[0] == 130 && pixel[1] == 0 && pixel[2] == 255)
    {
        return Pixel.LINK;
    }

    return Pixel.INVALID;
}
