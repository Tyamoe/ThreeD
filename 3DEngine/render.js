var RenderMode = 
{
  Texture: 1,
  Phong: 2,
  Skybox: 3,
};

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
            DrawObjects();
        }

        animate();
    }
    else 
    {
        console.log(ObjectsLoaded + "} ObjectsLoaded == ObjCount }" + ObjCount)
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

function animate() 
{
    var ThisIsI = 0;

    ObjList.forEach(function(element) 
    {
        var obj = element;

        if(obj.animate == false) return;

        obj.clock.timeNow = new Date().getTime();
        obj.clock.elapsed = obj.clock.timeNow - obj.clock.lastTime;

        if (!obj.clock.time) 
        {
            obj.clock.time = 0.0;
        }

        obj.clock.time += obj.clock.elapsed / 1000.0;

        if (obj.clock.lastTime !== 0) 
        {
            if(!obj.skybox && obj.inFocus == Focus.OFF && !Paused)
            {
                abc[ThisIsI] += 0.5;
                var theta = (degToRad(abc[ThisIsI]));

                var x = 6 * Math.sin(theta);
                var z = 6 * Math.cos(theta);

                obj.transform.pos[0] = x;
                obj.transform.pos[1] += dt * obj.transform.lerp;
                if(obj.transform.pos[1] >= 1 || obj.transform.pos[1] <= 0)
                {
                    obj.transform.lerp *= -1;
                }
                obj.transform.pos[2] = z;

                obj.transform.oldPosY = obj.transform.pos[1];
            }
            else if(obj.inFocus == Focus.TRANSIT_TO && !Paused)
            {
                abc[ThisIsI] += 0.5;  //Update Orbit Rotation

                obj.clock.tick += dt;
                obj.transform.oldPosY += 1 * obj.transform.lerp;
                if(obj.transform.oldPosY >= 1 || obj.transform.oldPosY <= 0)
                {
                    obj.transform.lerp *= -1;
                }

                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = 0;
                    obj.inFocus = Focus.ON;
                }
            }
            else if(obj.inFocus == Focus.TRANSIT_TO && Paused)
            {
                Rendering = true;

                obj.clock.tick += dt;

                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = 0;
                    obj.inFocus = Focus.ON;
                }
            }
            else if(obj.inFocus == Focus.ON && !Paused)
            {
                obj.clock.tick += 1;
                if(obj.clock.tick % 40 == 0)
                {
                    obj.texture = obj.textureArray[0];
                }

                abc[ThisIsI] += 0.5;  //Update Orbit Rotation

                var ticks = Math.floor((1.0 / dt));

                for(var j = 0; j < ticks; j++)
                {
                    obj.transform.oldPosY += 1 * obj.transform.lerp;
                    if(obj.transform.oldPosY >= 1 || obj.transform.oldPosY <= 0)
                    {
                        obj.transform.lerp *= -1;
                    }
                }

                var orbit = abc[ThisIsI] + Math.floor((ticks / 2));

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = obj.transform.oldPosY;
                var z = 6 * Math.cos(theta);

                vec3.set(obj.transform.destination, x, y, z);
                vec3.subtract(obj.transform.vel, obj.transform.destination, obj.transform.pos);
            }
            else if(obj.inFocus == Focus.ON && Paused)
            {
                obj.clock.tick += 1;

                if(obj.clock.tick % 40 == 0)
                {
                    if(obj.texture != obj.textureArray[0])
                    {
                        obj.texture = obj.textureArray[0];
                        Rendering = true;
                    }
                    else
                    {
                        Rendering = false;
                    }
                }

                var orbit = abc[ThisIsI];

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = 0;
                var z = 6 * Math.cos(theta);

                vec3.set(obj.transform.destination, x, y, z);
                vec3.subtract(obj.transform.vel, obj.transform.destination, obj.transform.pos);
            }
            else if(obj.inFocus == Focus.TRANSIT_FROM && !Paused)
            {
                abc[ThisIsI] += 0.5;  //Update Orbit Rotation

                obj.clock.tick += dt;
                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = -1;

                    obj.inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(obj.transform.pos[1] < 0)
                    {
                        obj.transform.pos[1] = 0.5;
                    }
                }
            }
            else if(obj.inFocus == Focus.TRANSIT_FROM && Paused)
            {
                Rendering = true;

                obj.clock.tick += dt;
                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = -1;

                    obj.inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(obj.transform.pos[1] < 0)
                    {
                        obj.transform.pos[1] = 0.0;
                    }
                    Rendering = false;
                }
            }
        }
        else
        {
            //console.log(" hi");
            //console.log(ObjList);
        }
        obj.clock.lastTime = obj.clock.timeNow;

        ThisIsI++
    });

    for(var u = 0; u < 0; u++)
    {
        var obj = ObjList[u];

        if(obj.animate == false) return;

        obj.clock.timeNow = new Date().getTime();
        obj.clock.elapsed = obj.clock.timeNow - obj.clock.lastTime;

        if (!obj.clock.time) 
        {
            obj.clock.time = 0.0;
        }

        obj.clock.time += obj.clock.elapsed / 1000.0;

        if (obj.clock.lastTime !== 0) 
        {
            //console.log("obj " + obj.name);
            if(!obj.skybox && obj.inFocus == Focus.OFF && !Paused)
            {
                abc[u] += 0.5;
                var theta = (degToRad(abc[u]));

                var x = 6 * Math.sin(theta);
                var z = 6 * Math.cos(theta);

                obj.transform.pos[0] = x;
                obj.transform.pos[1] += dt * obj.transform.lerp;
                if(obj.transform.pos[1] >= 1 || obj.transform.pos[1] <= 0)
                {
                    obj.transform.lerp *= -1;
                }
                obj.transform.pos[2] = z;

                obj.transform.oldPosY = obj.transform.pos[1];
            }
            else if(obj.inFocus == Focus.TRANSIT_TO && !Paused)
            {
                console.log(obj,name + "| TRANSIT_TO |" + obj.transform.vel + " @ " + dt);
                abc[u] += 0.5;  //Update Orbit Rotation

                obj.clock.tick += dt;
                obj.transform.oldPosY += 1 * obj.transform.lerp;
                if(obj.transform.oldPosY >= 1 || obj.transform.oldPosY <= 0)
                {
                    obj.transform.lerp *= -1;
                }

                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = 0;
                    obj.inFocus = Focus.ON;
                }
            }
            else if(obj.inFocus == Focus.TRANSIT_TO && Paused)
            {
                Rendering = true;

                obj.clock.tick += dt;

                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);
                
                camera.Front[1] = (camera.Front[1] < 0) ? camera.Front[1] + dt : 0;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = 0;
                    obj.inFocus = Focus.ON;
                }
            }
            else if(obj.inFocus == Focus.ON && !Paused)
            {
                obj.clock.tick += 1;
                if(obj.clock.tick % 40 == 0)
                {
                    obj.texture = obj.textureArray[0];
                }

                abc[u] += 0.5;  //Update Orbit Rotation

                var ticks = Math.floor((1.0 / dt));

                for(var j = 0; j < ticks; j++)
                {
                    obj.transform.oldPosY += 1 * obj.transform.lerp;
                    if(obj.transform.oldPosY >= 1 || obj.transform.oldPosY <= 0)
                    {
                        obj.transform.lerp *= -1;
                    }
                }

                var orbit = abc[u] + Math.floor((ticks / 2));

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = obj.transform.oldPosY;
                var z = 6 * Math.cos(theta);

                vec3.set(obj.transform.destination, x, y, z);
                vec3.subtract(obj.transform.vel, obj.transform.destination, obj.transform.pos);
            }
            else if(obj.inFocus == Focus.ON && Paused)
            {
                obj.clock.tick += 1;

                if(obj.clock.tick % 40 == 0)
                {
                    if(obj.texture != obj.textureArray[0])
                    {
                        obj.texture = obj.textureArray[0];
                        Rendering = true;
                    }
                    else
                    {
                        Rendering = false;
                    }
                }

                var orbit = abc[u];

                var theta = (degToRad(orbit));

                var x = 6 * Math.sin(theta);
                var y = 0;
                var z = 6 * Math.cos(theta);

                vec3.set(obj.transform.destination, x, y, z);
                vec3.subtract(obj.transform.vel, obj.transform.destination, obj.transform.pos);
            }
            else if(obj.inFocus == Focus.TRANSIT_FROM && !Paused)
            {
                abc[u] += 0.5;  //Update Orbit Rotation

                obj.clock.tick += dt;
                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = -1;

                    obj.inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(obj.transform.pos[1] < 0)
                    {
                        obj.transform.pos[1] = 0.5;
                    }
                }
            }
            else if(obj.inFocus == Focus.TRANSIT_FROM && Paused)
            {
                Rendering = true;

                obj.clock.tick += dt;
                vec3.scaleAndAdd(obj.transform.pos, obj.transform.pos, obj.transform.vel, dt);

                camera.Front[1] = (camera.Front[1] > -1) ? camera.Front[1] - dt : -1;

                if(vec3.distance(obj.transform.pos, obj.transform.destination) <= 0.1 || obj.clock.tick >= 0.99)//if(vec3.equals(obj.transform.pos, obj.transform.destination))
                {
                    obj.clock.tick = 0;
                    camera.Front[1] = -1;

                    obj.inFocus = Focus.OFF;

                    ObjInFocus = -1;

                    mode = Mode.ORBIT;

                    //Check for glitched Y coord
                    if(obj.transform.pos[1] < 0)
                    {
                        obj.transform.pos[1] = 0.0;
                    }
                    Rendering = false;
                }
            }
        }
        else
        {
            //console.log(" hi");
            //console.log(ObjList);
        }
        obj.clock.lastTime = obj.clock.timeNow;
    }
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