function Pick(x, y, mode1)
{
    if(mode1 == Mode.ORBIT)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < Obj2Count; i++)
        {
            mat4.copy(Obj2List[i].vMatrix, camera.view);

            mat4.perspective(Obj2List[i].pMatrix, camera.fov * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);

            mat4.identity(Obj2List[i].mvMatrix);

            mat4.translate(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, [(Obj2List[i].transform.pos[0]), (Obj2List[i].transform.pos[1]), (Obj2List[i].transform.pos[2])]);
            
            mat4.rotate(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, Obj2List[i].transform.rotation, Obj2List[i].transform.axis);

            mat4.scale(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, [(Obj2List[i].transform.scale[0]), (Obj2List[i].transform.scale[1]), (Obj2List[i].transform.scale[2])]);
            
            mvPushMatrix(Obj2List[i]);

            if(Obj2List[i].pickShader != null)
            {
                gl.useProgram(Obj2List[i].pickShader);
            }
            else
            {
                gl.useProgram(Obj2List[i].shader);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, Obj2List[i].VertexBufferObject);

            applyAttributes(Obj2List[i]);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Obj2List[i].IndexBufferObject);

            if(Obj2List[i].pickShader != null)
            {
                setPickMatrixUniforms(Obj2List[i], 1);
                Obj2List[i].AttrLocPosition = gl.getAttribLocation(Obj2List[i].pickShader, 'vertPosition');
                // Convert "i", the integer mesh ID, into an RGB color
                var r = i + 100 + 1;
                var g = i + 100 + 1;
                var b = i + 100 + 1;

                gl.uniform4fv(Obj2List[i].pickShader.color, new Float32Array([r/255.0, g/255.0, b/255.0, 1.0]));
            }
            else
            {
                setMatrixUniforms(Obj2List[i]);
            }

            if(Obj2List[i].skybox)
            {
                var oldRange = gl.getParameter(gl.DEPTH_RANGE);

                gl.depthRange(1.0, 1.0);

                gl.disable(gl.CULL_FACE);
                
                gl.activeTexture(gl.TEXTURE0);
        
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, Obj2List[i].texture);

                gl.drawElements(gl.TRIANGLES, Obj2List[i].indexBuffer.length, gl.UNSIGNED_SHORT, 0);

                gl.enable(gl.CULL_FACE);
                
                gl.depthRange(oldRange[0], oldRange[1]); 
            }
            else
            {
                //gl.bindTexture(gl.TEXTURE_2D, Obj2List[i].texture);

                //gl.activeTexture(gl.TEXTURE0);

                gl.drawElements(gl.TRIANGLES, Obj2List[i].indexBuffer.length, gl.UNSIGNED_SHORT, 0);
            }

            mvPopMatrix(Obj2List[i]);

            if(Obj2List[i].pickShader != null)
            {
                Obj2List[i].AttrLocPosition = gl.getAttribLocation(Obj2List[i].shader, 'vertPosition');
            }
        }

        var pixels = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Convert the color back to an integer ID
        var pickID = (pixels[0] > 100) ? (pixels[0] % 100) - 1 : -1;

        if(pickID < 0)
        {
             return;
        }

        if(pickID < Obj2Count)
        {
            var newPos = vec3.create();
            var newFront = vec3.create();

            vec3.set(newFront, 0, 0, -1);

            vec3.scaleAndAdd(newPos, camera.Pos, newFront, 3.5);
                
            ObjInFocus = pickID;

            Obj2List[pickID].inFocus = Focus.TRANSIT_TO;
            
            vec3.subtract(Obj2List[pickID].transform.vel, newPos, Obj2List[pickID].transform.pos);

            vec3.copy(Obj2List[pickID].transform.destination, newPos);
            mode = Mode.FOCUS;
        }
    }
    else if(mode == Mode.FOCUS)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < Obj2Count; i++)
        {
            mat4.copy(Obj2List[i].vMatrix, camera.view);

            mat4.perspective(Obj2List[i].pMatrix, camera.fov * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);

            mat4.identity(Obj2List[i].mvMatrix);

            mat4.translate(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, [(Obj2List[i].transform.pos[0]), (Obj2List[i].transform.pos[1]), (Obj2List[i].transform.pos[2])]);
            
            mat4.rotate(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, Obj2List[i].transform.rotation, Obj2List[i].transform.axis);

            mat4.scale(Obj2List[i].mvMatrix, Obj2List[i].mvMatrix, [(Obj2List[i].transform.scale[0]), (Obj2List[i].transform.scale[1]), (Obj2List[i].transform.scale[2])]);
            
            mvPushMatrix(Obj2List[i]);

            gl.useProgram(Obj2List[i].shader);

            gl.bindBuffer(gl.ARRAY_BUFFER, Obj2List[i].VertexBufferObject);

            applyAttributes(Obj2List[i]);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Obj2List[i].IndexBufferObject);

            setMatrixUniforms(Obj2List[i]);

            if(Obj2List[i].skybox)
            {
                var oldRange = gl.getParameter(gl.DEPTH_RANGE);

                gl.depthRange(1.0, 1.0);

                gl.disable(gl.CULL_FACE);
                
                gl.activeTexture(gl.TEXTURE0);
        
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, Obj2List[i].texture);

                gl.drawElements(gl.TRIANGLES, Obj2List[i].indexBuffer.length, gl.UNSIGNED_SHORT, 0);

                gl.enable(gl.CULL_FACE);
                
                gl.depthRange(oldRange[0], oldRange[1]); 
            }
            else
            {
                gl.bindTexture(gl.TEXTURE_2D, Obj2List[i].texture);

                gl.activeTexture(gl.TEXTURE0);

                gl.drawElements(gl.TRIANGLES, Obj2List[i].indexBuffer.length, gl.UNSIGNED_SHORT, 0);
            }

            mvPopMatrix(Obj2List[i]);
        }

        var pixels = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        console.log("Focus Mode Seatching for button clicks: " + pixels);
        //Search for button clicks

        if(parsePixel(pixels) == Pixel.EXIT)
        {
            //Set object to return back to orbit
            Obj2List[ObjInFocus].clock.tick = 0;
            Obj2List[ObjInFocus].inFocus = Focus.TRANSIT_FROM;
            Obj2List[ObjInFocus].texture = Obj2List[ObjInFocus].textureArray[0];
            //console.log("Exit button clicked: " + Obj2List[ObjInFocus].name);
        }
        else if(parsePixel(pixels) == Pixel.DOWNLOAD)
        {
            //download
            toggleFullScreenButton();
            window.open(Obj2List[ObjInFocus].data.download, '_blank');
        }
        else if(parsePixel(pixels) == Pixel.DOWNLOAD2)
        {
            //download
            toggleFullScreenButton();
            window.open(Obj2List[ObjInFocus].data.download2, '_blank');
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
            window.open(Obj2List[ObjInFocus].data.link, '_blank');
        }
        else
        {
            //Invalid
            console.log("Invalid CLick: " + Obj2List[ObjInFocus].name);
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

function setPickMatrixUniforms(obj, pick) 
{
    gl.uniformMatrix4fv(obj.pickShader.pMatrixUniform, false, obj.pMatrix);
    gl.uniformMatrix4fv(obj.pickShader.mvMatrixUniform, false, obj.mvMatrix);
    gl.uniformMatrix4fv(obj.pickShader.vMatrixUniform, false, obj.vMatrix);

    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, obj.mvMatrix);
    gl.uniformMatrix3fv(obj.pickShader.nMatrixUniform, false, normalMatrix);
}