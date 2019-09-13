//Animation
window.requestAnimFrame = (function() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            return window.setTimeout(callback, 1000 / 60);
        }
    );
})();

function resize() 
{
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth || canvas.height != displayHeight) 
    {

      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
}

function animate() 
{
    for(var i = 0; i < ObjCount; i++)
    {
        ObjList[i].clock.timeNow = new Date().getTime();
        ObjList[i].clock.elapsed = ObjList[i].clock.timeNow - ObjList[i].clock.lastTime;

        if (!ObjList[i].clock.time) 
        {
            ObjList[i].clock.time = 0.0;
        }

        ObjList[i].clock.time += ObjList[i].clock.elapsed / 1000.0;

        if (ObjList[i].clock.lastTime !== 0) 
        {
            // do animations
        }

        ObjList[i].clock.lastTime = ObjList[i].clock.timeNow;

    }

    for(var i = 0; i < Obj2Count; i++)
    {
        Obj2List[i].clock.timeNow = new Date().getTime();
        Obj2List[i].clock.elapsed = Obj2List[i].clock.timeNow - Obj2List[i].clock.lastTime;

        if (!Obj2List[i].clock.time) 
        {
            Obj2List[i].clock.time = 0.0;
        }

        Obj2List[i].clock.time += Obj2List[i].clock.elapsed / 1000.0;

        if (Obj2List[i].clock.lastTime !== 0) 
        {

            if(!Obj2List[i].skybox && Obj2List[i].inFocus == Focus.OFF && !Paused)
            {
                abc[i] += 0.5;
                var theta = (degToRad(abc[i]));

                var x = 6 * Math.sin(theta);
                var z = 6 * Math.cos(theta);

                Obj2List[i].transform.pos[0] = x;
                Obj2List[i].transform.pos[1] += dt * Obj2List[i].transform.lerp;
                if(Obj2List[i].transform.pos[1] >= 1 || Obj2List[i].transform.pos[1] <= 0)
                {
                    Obj2List[i].transform.lerp *= -1;
                }
                Obj2List[i].transform.pos[2] = z;

                Obj2List[i].transform.oldPosY = Obj2List[i].transform.pos[1];
            }
            else if(Obj2List[i].inFocus == Focus.TRANSIT_TO && !Paused)
            {
                abc[i] += 0.5;  //Update Orbit Rotation

                Obj2List[i].clock.tick += dt;
                Obj2List[i].transform.oldPosY += 1 * Obj2List[i].transform.lerp;
                if(Obj2List[i].transform.oldPosY >= 1 || Obj2List[i].transform.oldPosY <= 0)
                {
                    Obj2List[i].transform.lerp *= -1;
                }

                vec3.scaleAndAdd(Obj2List[i].transform.pos, Obj2List[i].transform.pos, Obj2List[i].transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(Obj2List[i].transform.pos, Obj2List[i].transform.destination) <= 0.1 || Obj2List[i].clock.tick >= 0.99)//if(vec3.equals(Obj2List[i].transform.pos, Obj2List[i].transform.destination))
                {
                    Obj2List[i].clock.tick = 0;
                    camera.Front[1] = 0;
                    Obj2List[i].inFocus = Focus.ON;
                }
            }
            else if(Obj2List[i].inFocus == Focus.TRANSIT_TO && Paused)
            {
                Rendering = true;

                Obj2List[i].clock.tick += dt;

                vec3.scaleAndAdd(Obj2List[i].transform.pos, Obj2List[i].transform.pos, Obj2List[i].transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(Obj2List[i].transform.pos, Obj2List[i].transform.destination) <= 0.1 || Obj2List[i].clock.tick >= 0.99)//if(vec3.equals(Obj2List[i].transform.pos, Obj2List[i].transform.destination))
                {
                    Obj2List[i].clock.tick = 0;
                    camera.Front[1] = 0;
                    Obj2List[i].inFocus = Focus.ON;
                }
            }
            else if(Obj2List[i].inFocus == Focus.ON && !Paused)
            {
                Obj2List[i].clock.tick += 1;
                if(Obj2List[i].clock.tick % 40 == 0)
                {
                    if(modeLight)
                    {
                        Obj2List[i].texture = Obj2List[i].textureArray[1];
                    }
                    else
                    {
                        Obj2List[i].texture = Obj2List[i].textureArray[2];
                    }
                }

                abc[i] += 0.5;  //Update Orbit Rotation

                var ticks = Math.floor((1.0 / dt));

                for(var j = 0; j < ticks; j++)
                {
                    Obj2List[i].transform.oldPosY += 1 * Obj2List[i].transform.lerp;
                    if(Obj2List[i].transform.oldPosY >= 1 || Obj2List[i].transform.oldPosY <= 0)
                    {
                        Obj2List[i].transform.lerp *= -1;
                    }
                }

                var orbit = abc[i] + Math.floor((ticks / 2));

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = Obj2List[i].transform.oldPosY;
                var z = 6 * Math.cos(theta);

                vec3.set(Obj2List[i].transform.destination, x, y, z);
                vec3.subtract(Obj2List[i].transform.vel, Obj2List[i].transform.destination, Obj2List[i].transform.pos);
            }
            else if(Obj2List[i].inFocus == Focus.ON && Paused)
            {
                Obj2List[i].clock.tick += 1;

                if(Obj2List[i].clock.tick % 40 == 0)
                {
                    if(modeLight && Obj2List[i].texture != Obj2List[i].textureArray[1])
                    {
                        Obj2List[i].texture = Obj2List[i].textureArray[1];
                        Rendering = true;
                    }
                    else if(!modeLight && Obj2List[i].texture != Obj2List[i].textureArray[2])
                    {
                        Obj2List[i].texture = Obj2List[i].textureArray[2];
                        Rendering = true;
                    }
                    else
                    {
                        Rendering = false;
                    }
                }

                var orbit = abc[i];

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = 0;
                var z = 6 * Math.cos(theta);

                vec3.set(Obj2List[i].transform.destination, x, y, z);
                vec3.subtract(Obj2List[i].transform.vel, Obj2List[i].transform.destination, Obj2List[i].transform.pos);
            }
            else if(Obj2List[i].inFocus == Focus.TRANSIT_FROM && !Paused)
            {
                abc[i] += 0.5;  //Update Orbit Rotation

                Obj2List[i].clock.tick += dt;
                vec3.scaleAndAdd(Obj2List[i].transform.pos, Obj2List[i].transform.pos, Obj2List[i].transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(Obj2List[i].transform.pos, Obj2List[i].transform.destination) <= 0.1 || Obj2List[i].clock.tick >= 0.99)//if(vec3.equals(Obj2List[i].transform.pos, Obj2List[i].transform.destination))
                {
                    Obj2List[i].clock.tick = 0;
                    camera.Front[1] = -1;

                    Obj2List[i].inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(Obj2List[i].transform.pos[1] < 0)
                    {
                        Obj2List[i].transform.pos[1] = 0.5;
                    }
                }
            }
            else if(Obj2List[i].inFocus == Focus.TRANSIT_FROM && Paused)
            {
                Rendering = true;

                Obj2List[i].clock.tick += dt;
                vec3.scaleAndAdd(Obj2List[i].transform.pos, Obj2List[i].transform.pos, Obj2List[i].transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(Obj2List[i].transform.pos, Obj2List[i].transform.destination) <= 0.1 || Obj2List[i].clock.tick >= 0.99)//if(vec3.equals(Obj2List[i].transform.pos, Obj2List[i].transform.destination))
                {
                    Obj2List[i].clock.tick = 0;
                    camera.Front[1] = -1;

                    Obj2List[i].inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(Obj2List[i].transform.pos[1] < 0)
                    {
                        Obj2List[i].transform.pos[1] = 0.0;
                    }
                    Rendering = false;
                }
            }
        }
        Obj2List[i].clock.lastTime = Obj2List[i].clock.timeNow;
    }
}

//Matrix
function mvPushMatrix(obj) 
{
    var copy = mat4.create();
    mat4.copy(copy, obj.mvMatrix);
    obj.mvMatrixStack.push(copy);
}

function mvPopMatrix(obj) 
{
    if (obj.mvMatrixStack.length === 0) {
        throw "Invalid popMatrix!";
    }
    obj.mvMatrix = obj.mvMatrixStack.pop();
}

function setMatrixUniforms(obj) 
{
    gl.uniform3fv(obj.shader.eye, new Float32Array([camera.Pos[0], camera.Pos[1], camera.Pos[2]]));
    gl.uniform2fv(obj.shader.fogDis, new Float32Array([fogDist1[0], fogDist1[1]]));
    
    gl.uniformMatrix4fv(obj.shader.pMatrixUniform, false, obj.pMatrix);
    gl.uniformMatrix4fv(obj.shader.mvMatrixUniform, false, obj.mvMatrix);
    gl.uniformMatrix4fv(obj.shader.vMatrixUniform, false, obj.vMatrix);
    gl.uniform4fv(obj.shader.colorr, new Float32Array([obj.tint[0], obj.tint[1], obj.tint[2], obj.tint[3]]));

    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, obj.mvMatrix);
    gl.uniformMatrix3fv(obj.shader.nMatrixUniform, false, normalMatrix);
}

function applyAttributes(obj)
{
    //Normal location 
    if(obj.AttrLocPosition != -1)
    {
        gl.vertexAttribPointer(
            obj.AttrLocPosition,        // Attribute location
            3,                          // Number of elements per attribute
            gl.FLOAT,                   // Type of elements
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0                           // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(obj.AttrLocPosition);
    }
    //Normal Textire location
    if(obj.AttrLocTexCoords != -1)
    {
        gl.vertexAttribPointer(
            obj.AttrLocTexCoords,       // Attribute location
            2,                          // Number of elements per attribute
            gl.FLOAT,                   // Type of elements
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(obj.AttrLocTexCoords);
    }
}

//Draw
function DrawObjects() 
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(var i = 0; i < ObjCount; i++)
    {
        mat4.copy(ObjList[i].vMatrix, camera.view);

        mat4.perspective(ObjList[i].pMatrix, camera.fov * Math.PI / 180.0, canvas.width / canvas.height, 0.01, 1000.0);

        mat4.identity(ObjList[i].mvMatrix);

        mat4.translate(ObjList[i].mvMatrix, ObjList[i].mvMatrix, [(ObjList[i].transform.pos[0]), (ObjList[i].transform.pos[1]), (ObjList[i].transform.pos[2])]);
        
        mat4.rotate(ObjList[i].mvMatrix, ObjList[i].mvMatrix, ObjList[i].transform.rotation, ObjList[i].transform.axis);
        //mat4.rotate(ObjList[i].mvMatrix, ObjList[i].mvMatrix, ObjList[i].clock.time * ObjList[i].transform.rotation * Math.PI, [0, 1, 0]);
        mat4.scale(ObjList[i].mvMatrix, ObjList[i].mvMatrix, [(ObjList[i].transform.scale[0]), (ObjList[i].transform.scale[1]), (ObjList[i].transform.scale[2])]);
        
        mvPushMatrix(ObjList[i]);

        gl.useProgram(ObjList[i].shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, ObjList[i].models[ObjList[i].name].mesh.vertexBuffer);
        ObjList[i].shader.applyAttributePointers(ObjList[i].models[ObjList[i].name]);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ObjList[i].models[ObjList[i].name].mesh.indexBuffer);
        
        setMatrixUniforms(ObjList[i]);
        
        gl.drawElements(gl.TRIANGLES, ObjList[i].models[ObjList[i].name].mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        mvPopMatrix(ObjList[i]);
    }
}

function DrawObjects2() 
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
}

function tick() 
{
    requestAnimFrame(tick);
	
	if(canvasInit)
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
			DrawObjects2();
		}

		animate();
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

var fogDist1 = new Float32Array([55, 81]);