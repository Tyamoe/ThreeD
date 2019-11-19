var SourcePhongLightingVS = `#version 300 es
    precision mediump float;
    
	layout(location = 0) in vec3 vertPosition;
	layout(location = 1) in vec3 vertNormal;
	layout(location = 2) in vec2 vertTexCoord;

	out vec3 outColor;

	#define MAX_LIGHT 16
	#define PI 3.14159265359

	uniform StateData
	{
		vec3 viewPos;
		float ZNear;

		vec3 ambient;
		float ZFar;

		vec3 fog;
		float mapping; //

		vec3 attCoef;
		float entity; //
	} state;

	uniform sampler2D diffuseMap;
	uniform sampler2D specularMap;

	uniform bool generate;

	uniform vec3 boundMin;
	uniform vec3 boundMax;
	uniform vec3 boundCenter;

	uniform mat4 MVP;
	uniform mat4 Model;
	uniform mat4 InvTrModel;

	uniform vec3 lights[MAX_LIGHT * 7];
	uniform int lightCount;

	uniform vec3 emissive;

	vec2 genTexCoords(vec3 fragPos, vec3 Normal);

	void main()
	{
		gl_Position = MVP * vec4(vertPosition, 1.0);

		vec3 fragPos = vec3(Model * vec4(vertPosition, 1.0));
		vec3 viewDir = normalize(state.viewPos - fragPos);
		vec3 norm = vertNormal - vertPosition;
		norm = normalize(norm);

		vec2 tCoords = vec2(0.0);
		if(generate)
		{
			tCoords = genTexCoords(fragPos, norm);
		}
		else
		{
			tCoords = vertTexCoord;
		}

		vec3 d = texture(diffuseMap, tCoords).xyz;
		vec3 s = texture(specularMap, tCoords).xyz;

		float ambientStrength = 0.1;
		float specularStrength = 0.5;

		vec3 result = emissive * 0.2 + state.ambient * d;

		for(int i = 0; i < lightCount; i++)
		{
			int index = i * 7;
	    	vec3 Pos = vec3(lights[index + 0]);
	    	vec3 Emis = vec3(lights[index + 1]);
	    	vec3 Amb = vec3(lights[index + 2]);
	    	vec3 Diff = vec3(lights[index + 3]);
	    	vec3 Spec = vec3(lights[index + 4]);
	    	vec3 Spot = vec3(lights[index + 5]);
	    	vec3 xtra = vec3(lights[index + 6]); // shine, type

		    vec3 lightDir = Pos - fragPos;
  			float dis = length(lightDir);	// Atten
  			lightDir = normalize(lightDir);

  			if(xtra.y == 3.0) // Directional
  			{
  				lightDir = normalize(Pos);
  			}

		    // ambient
		    vec3 ambient = ambientStrength * Amb * d;
		  	
		    // diffuse 
		    float diff = max(dot(norm, lightDir), 0.0);
		    vec3 diffuse = Diff * diff * d;
		    
		    // specular
		    //vec3 reflectDir = reflect(-lightDir, norm);  
		    vec3 reflectDir = 2.0 * norm * dot(norm, lightDir) - lightDir; 
		    //float spec = pow(max(dot(viewDir, reflectDir), 0.0), pow(s.r, 2.0));
		    float spec = pow(max(dot(viewDir, reflectDir), 0.0), xtra.x);
		    vec3 specular = Spec * specularStrength * spec * s;  

  			float att = 1.0;

  			if(xtra.y != 3.0) // Directional
  			{
  				att = 1.0 / (state.attCoef.x + state.attCoef.y * dis + state.attCoef.z * (dis * dis));
  			}

  			float spotEffect = 1.0;
  			if(xtra.y == 2.0)	// Spotlight
  			{
			  	float alpha = dot(lightDir, normalize(Pos)); 
			  	float e = cos(Spot.x) - cos(Spot.y);
			  	float t = alpha - cos(Spot.y);
			  	spotEffect = t / e;
			  	spotEffect = clamp(spotEffect, 0.0, 1.0);
			  	spotEffect = pow(spotEffect, Spot.z);
  			}
		        
		    result += att * spotEffect * (ambient + diffuse + specular);
		}

		float distance = length(state.viewPos - fragPos);
		float S = (state.ZFar - distance) / (state.ZFar - state.ZNear);
		S = clamp(S, 0.0, 1.0);
		vec3 final = S * result + (1.0 - S) * state.fog;

		outColor = final;
	}

	vec2 genTexCoords(vec3 fragPos, vec3 Normal)
	{
		vec2 coords = vec2(0.0);
		if(state.mapping == 1.0)	// cube
		{
	    	vec3 texEntity;

	      	if (state.entity == 1.0) texEntity = abs(fragPos);
	      	else texEntity = abs(Normal);

	      	// +-X
	      	if (texEntity.x >= texEntity.y && texEntity.x >= texEntity.z)
	      	{
	      	  	if (fragPos.x < 0.0) coords.s = fragPos.z;
	      	  	else  coords.s = -fragPos.z;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.z;
	      	  	coords.t /= boundMax.y;
	      	}
	      	// +-Y
	      	else if (texEntity.y >= texEntity.x && texEntity.y >= texEntity.z)
	      	{
	      	  	if (fragPos.y < 0.0) coords.t = fragPos.z;
	      	  	else coords.t = -fragPos.z;

	      	  	coords.s = fragPos.x;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.z;
	      	}
	      	// +-Z
	      	else
	      	{
	      	  	if (fragPos.z < 0.0) coords.s = -fragPos.x;
	      	  	else coords.s = fragPos.x;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.y;
	      	}
	
	      	coords = (coords + 1.0) / 2.0;
		}
		else if(state.mapping == 2.0)	// sphere
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float r = length(texEntity);
	      	float phi = acos(texEntity.z / r);
	      	float U = theta / (2.0 * PI);
	      	float V = (PI - phi) / (PI);
	      	coords = vec2(U, V);
		}
		else	// cylinder
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float U = theta / (2.0 * PI); // convert to 0-1 range
	      	float V = Z;
	      	coords = vec2(U, V);
		}	

		return coords;
	}
`;


var SourcePhongLightingFS = `#version 300 es
    precision highp float;
    precision highp int;
    
    layout(std140, column_major) uniform;

	in vec3 outColor;
	out vec4 color;

	void main()
	{
	    color = vec4(outColor, 1.0);
	}
`;

var currSourcePhongLightingVS = SourcePhongLightingVS;
var currSourcePhongLightingFS = SourcePhongLightingFS;

var SourcePhongVS = `#version 300 es
	precision mediump float;
    
	layout(location = 0) in vec3 vertPosition;
	layout(location = 1) in vec3 vertNormal;
	layout(location = 2) in vec2 vertTexCoord;

	out vec3 fragPos;
	out vec4 Normal;
	out vec2 TexCoord;

	uniform mat4 MVP;
	uniform mat4 Model;
	uniform mat4 InvTrModel;

	void main()
	{
		TexCoord = vertTexCoord;
		vec3 norm = vertNormal - vertPosition;
		fragPos = vec3(Model * vec4(vertPosition, 1.0));
		Normal = InvTrModel * vec4(normalize(norm), 1.0); 

		gl_Position = MVP * vec4(vertPosition, 1.0);
	}
`;

var SourcePhongFS = `#version 300 es
	precision mediump float;

	in vec3 fragPos;
	in vec4 Normal;
	in vec2 TexCoord;
	
	out vec4 color;

	#define MAX_LIGHT 16
	#define PI 3.14159265359

	uniform StateData
	{
		vec3 viewPos;
		float ZNear;

		vec3 ambient;
		float ZFar;

		vec3 fog;
		float mapping; //

		vec3 attCoef;
		float entity; //
	} state;

	uniform sampler2D diffuseMap;
	uniform sampler2D specularMap;

	uniform bool generate;

	uniform vec3 boundMin;
	uniform vec3 boundMax;
	uniform vec3 boundCenter;

	uniform vec3 lights[MAX_LIGHT * 7];
	uniform int lightCount;

	uniform vec3 emissive;

	vec2 genTexCoords();

	void main()
	{
		vec2 tCoords = vec2(0.0);
		if(generate)
		{
			tCoords = genTexCoords();
		}
		else
		{
			tCoords = TexCoord;
		}

		vec3 d = texture(diffuseMap, tCoords).xyz;
		vec3 s = texture(specularMap, tCoords).xyz;

		vec3 viewDir = normalize(state.viewPos - fragPos);
		vec3 norm = normalize(Normal.xyz);

		float ambientStrength = 0.1;
		float specularStrength = 0.5;

		vec3 result = emissive * 0.2 + state.ambient * d;

		for(int i = 0; i < lightCount; i++)
		{
			int index = i * 7;
	    	vec3 Pos = vec3(lights[index + 0]);
	    	vec3 Emis = vec3(lights[index + 1]);
	    	vec3 Amb = vec3(lights[index + 2]);
	    	vec3 Diff = vec3(lights[index + 3]);
	    	vec3 Spec = vec3(lights[index + 4]);
	    	vec3 Spot = vec3(lights[index + 5]);
	    	vec3 xtra = vec3(lights[index + 6]); // shine, type

		    vec3 lightDir = Pos - fragPos;
  			float dis = length(lightDir);	// Atten
  			lightDir = normalize(lightDir);

  			if(xtra.y == 3.0) // Directional
  			{
  				lightDir = normalize(Pos);
  			}

		    // ambient
		    vec3 ambient = ambientStrength * Amb * d;
		  	
		    // diffuse 
		    float diff = max(dot(norm, lightDir), 0.0);
		    vec3 diffuse = Diff * diff * d;
		    
		    // specular
		    //vec3 reflectDir = reflect(-lightDir, norm);  
		    vec3 reflectDir = 2.0 * norm * dot(norm, lightDir) - lightDir; 
		    //float spec = pow(max(dot(viewDir, reflectDir), 0.0), pow(s.r, 2.0));
		    float spec = pow(max(dot(viewDir, reflectDir), 0.0), xtra.x);
		    vec3 specular = Spec * specularStrength * spec * s;  

  			float att = 1.0;

  			if(xtra.y != 3.0) // Directional
  			{
  				att = 1.0 / (state.attCoef.x + state.attCoef.y * dis + state.attCoef.z * (dis * dis));
  			}

  			float spotEffect = 1.0;
  			if(xtra.y == 2.0)	// Spotlight
  			{
			  	float alpha = dot(lightDir, normalize(Pos)); 
			  	float e = cos(Spot.x) - cos(Spot.y);
			  	float t = alpha - cos(Spot.y);
			  	spotEffect = t / e;
			  	spotEffect = clamp(spotEffect, 0.0, 1.0);
			  	spotEffect = pow(spotEffect, Spot.z);
  			}
		        
		    result += att * spotEffect * (ambient + diffuse + specular);
		}

		float distance = length(state.viewPos - fragPos);
		float S = (state.ZFar - distance) / (state.ZFar - state.ZNear);
		S = clamp(S, 0.0, 1.0);
		vec3 final = S * result + (1.0 - S) * state.fog;
		//outColor = final;

	    color = vec4(final, 1.0);
	}

	vec2 genTexCoords()
	{
		vec2 coords = vec2(0.0);
		if(state.mapping == 1.0)	// cube
		{
	    	vec3 texEntity;

	      	if (state.entity == 1.0) texEntity = abs(fragPos);
	      	else texEntity = abs(Normal.xyz);

	      	// +-X
	      	if (texEntity.x >= texEntity.y && texEntity.x >= texEntity.z)
	      	{
	      	  	if (fragPos.x < 0.0) coords.s = fragPos.z;
	      	  	else  coords.s = -fragPos.z;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.z;
	      	  	coords.t /= boundMax.y;
	      	}
	      	// +-Y
	      	else if (texEntity.y >= texEntity.x && texEntity.y >= texEntity.z)
	      	{
	      	  	if (fragPos.y < 0.0) coords.t = fragPos.z;
	      	  	else coords.t = -fragPos.z;

	      	  	coords.s = fragPos.x;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.z;
	      	}
	      	// +-Z
	      	else
	      	{
	      	  	if (fragPos.z < 0.0) coords.s = -fragPos.x;
	      	  	else coords.s = fragPos.x;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.y;
	      	}
	
	      	coords = (coords + 1.0) / 2.0;
		}
		else if(state.mapping == 2.0)	// sphere
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal.xyz;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float r = length(texEntity);
	      	float phi = acos(texEntity.z / r);
	      	float U = theta / (2.0 * PI);
	      	float V = (PI - phi) / (PI);
	      	coords = vec2(U, V);
		}
		else	// cylinder
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal.xyz;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float U = theta / (2.0 * PI); // convert to 0-1 range
	      	float V = Z;
	      	coords = vec2(U, V);
		}	

		return coords;
	}
`;

var currSourcePhongVS = SourcePhongVS;
var currSourcePhongFS = SourcePhongFS;

var SourceBlinnVS = `#version 300 es
	precision mediump float;
    
	layout(location = 0) in vec3 vertPosition;
	layout(location = 1) in vec3 vertNormal;
	layout(location = 2) in vec2 vertTexCoord;

	out vec3 fragPos;
	out vec4 Normal;
	out vec2 TexCoord;

	uniform mat4 MVP;
	uniform mat4 Model;
	uniform mat4 InvTrModel;

	void main()
	{
		TexCoord = vertTexCoord;
		vec3 norm = vertNormal - vertPosition;
		fragPos = vec3(Model * vec4(vertPosition, 1.0));
		Normal = InvTrModel * vec4(normalize(norm), 1.0); 

		gl_Position = MVP * vec4(vertPosition, 1.0);
	}
`;


var SourceBlinnFS = `#version 300 es
	precision mediump float;

	in vec3 fragPos;
	in vec4 Normal;
	in vec2 TexCoord;
	
	out vec4 color;

	#define MAX_LIGHT 16
	#define PI 3.14159265359

	uniform StateData
	{
		vec3 viewPos;
		float ZNear;

		vec3 ambient;
		float ZFar;

		vec3 fog;
		float mapping; //

		vec3 attCoef;
		float entity; // 
	} state;

	uniform sampler2D diffuseMap;
	uniform sampler2D specularMap;

	uniform bool generate;

	uniform vec3 boundMin;
	uniform vec3 boundMax;
	uniform vec3 boundCenter;

	uniform vec3 lights[MAX_LIGHT * 7];
	uniform int lightCount;

	uniform vec3 emissive;

	vec2 genTexCoords();

	void main()
	{
		vec2 tCoords = vec2(0.0);
		if(generate)
		{
			tCoords = genTexCoords();
		}
		else
		{
			tCoords = TexCoord;
		}

		vec3 d = texture(diffuseMap, tCoords).xyz;
		vec3 s = texture(specularMap, tCoords).xyz;

		vec3 viewDir = normalize(state.viewPos - fragPos);
		vec3 norm = normalize(Normal.xyz);

		float ambientStrength = 0.1;
		float specularStrength = 0.5;

		vec3 result = emissive * 0.2 + state.ambient * d;

		for(int i = 0; i < lightCount; i++)
		{
			int index = i * 7;
	    	vec3 Pos = vec3(lights[index + 0]);
	    	vec3 Emis = vec3(lights[index + 1]);
	    	vec3 Amb = vec3(lights[index + 2]);
	    	vec3 Diff = vec3(lights[index + 3]);
	    	vec3 Spec = vec3(lights[index + 4]);
	    	vec3 Spot = vec3(lights[index + 5]);
	    	vec3 xtra = vec3(lights[index + 6]); // shine, type

		    vec3 lightDir = Pos - fragPos;
  			float dis = length(lightDir);	// Atten
  			lightDir = normalize(lightDir);

  			if(xtra.y == 3.0) // Directional
  			{
  				lightDir = -normalize(Pos);
  			}

		    // ambient
		    vec3 ambient = ambientStrength * Amb * d;
		  	
		    // diffuse 
		    float diff = max(dot(norm, lightDir), 0.0);
		    vec3 diffuse = Diff * diff * d;
		    
		    // specular
		    //vec3 reflectDir = reflect(-lightDir, norm);  
	    	vec3 reflectDir = normalize(viewDir + lightDir); 
		    //float spec = pow(max(dot(viewDir, reflectDir), 0.0), pow(s.r, 2.0));
		    float spec = pow(max(dot(viewDir, reflectDir), 0.0), xtra.x);
		    vec3 specular = Spec * specularStrength * spec * s;  

  			float att = 1.0;

  			if(xtra.y != 3.0) // Directional
  			{
  				att = 1.0 / (state.attCoef.x + state.attCoef.y * dis + state.attCoef.z * (dis * dis));
  			}

  			float spotEffect = 1.0;
  			if(xtra.y == 2.0)	// Spotlight
  			{
			  	float alpha = dot(lightDir, normalize(Pos)); 
			  	float e = cos(Spot.x) - cos(Spot.y);
			  	float t = alpha - cos(Spot.y);
			  	spotEffect = t / e;
			  	spotEffect = clamp(spotEffect, 0.0, 1.0);
			  	spotEffect = pow(spotEffect, Spot.z);
  			}
		        
		    result += att * spotEffect * (ambient + diffuse + specular);
		}

		float distance = length(state.viewPos - fragPos);
		float S = (state.ZFar - distance) / (state.ZFar - state.ZNear);
		S = clamp(S, 0.0, 1.0);
		vec3 final = S * result + (1.0 - S) * state.fog;
		//outColor = final;

	    color = vec4(final, 1.0);
	}

	vec2 genTexCoords()
	{
		vec2 coords = vec2(0.0);
		if(state.mapping == 1.0)	// cube
		{
	    	vec3 texEntity;

	      	if (state.entity == 1.0) texEntity = abs(fragPos);
	      	else texEntity = abs(Normal.xyz);

	      	// +-X
	      	if (texEntity.x >= texEntity.y && texEntity.x >= texEntity.z)
	      	{
	      	  	if (fragPos.x < 0.0) coords.s = fragPos.z;
	      	  	else  coords.s = -fragPos.z;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.z;
	      	  	coords.t /= boundMax.y;
	      	}
	      	// +-Y
	      	else if (texEntity.y >= texEntity.x && texEntity.y >= texEntity.z)
	      	{
	      	  	if (fragPos.y < 0.0) coords.t = fragPos.z;
	      	  	else coords.t = -fragPos.z;

	      	  	coords.s = fragPos.x;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.z;
	      	}
	      	// +-Z
	      	else
	      	{
	      	  	if (fragPos.z < 0.0) coords.s = -fragPos.x;
	      	  	else coords.s = fragPos.x;

	      	  	coords.t = fragPos.y;
	      	  	coords.s /= boundMax.x;
	      	  	coords.t /= boundMax.y;
	      	}
	
	      	coords = (coords + 1.0) / 2.0;
		}
		else if(state.mapping == 2.0)	// sphere
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal.xyz;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float r = length(texEntity);
	      	float phi = acos(texEntity.z / r);
	      	float U = theta / (2.0 * PI);
	      	float V = (PI - phi) / (PI);
	      	coords = vec2(U, V);
		}
		else	// cylinder
		{
	      	vec3 texEntity;
	      	if (state.entity == 1.0) texEntity = fragPos - boundCenter;
	      	else texEntity = Normal.xyz;

	      	float theta = atan(texEntity.y, texEntity.x);
	      	float Z = (texEntity.z - boundMin.z) / (boundMax.z - boundMin.z);
	      	float U = theta / (2.0 * PI); // convert to 0-1 range
	      	float V = Z;
	      	coords = vec2(U, V);
		}	

		return coords;
	}
`;

var currSourceBlinnVS = SourceBlinnVS;
var currSourceBlinnFS = SourceBlinnFS;

var SourceDiffuseVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec3 vertNormal;

	uniform mat4 MVP;

	void main()
	{
		gl_Position = MVP * vec4(vertPosition, 1.0);
	}
`;


var SourceDiffuseFS = `
	precision mediump float;

	uniform vec3 emissive;

	void main()
	{
	    gl_FragColor = vec4(emissive, 1.0);
	}
`;


var SourceLineVS = `
		precision mediump float;

		attribute vec3 vertPosition;

		uniform mat4 MVP;

		void main()
		{
			gl_Position = MVP * vec4(vertPosition, 1.0);
		}
`;


var SourceLineFS = `
		precision mediump float;

		uniform vec4 fcolor;

		void main()
		{
			gl_FragColor = fcolor;
		}
`;


var SourceSmallVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;

	varying vec2 fragTexCoord;
	varying vec4 vPosition;

	varying float vDistance;
	varying vec2 u_FogDist;

	uniform vec2 fog;
	uniform vec3 Eye;

	uniform mat4 MVP;

	uniform mat4 viewMatrix;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;

	void main()
	{
		vDistance = distance(uMVMatrix * vec4(vertPosition, 1.0), vec4(Eye, 1.0));
		u_FogDist = fog;
		fragTexCoord = vertTexCoord;
		vPosition = uMVMatrix * vec4(vertPosition, 1.0);
		gl_Position = uPMatrix * viewMatrix * vPosition;
	}
`;


var SourceSmallFS = `
	precision mediump float;

	varying vec2 fragTexCoord;
	varying float vDistance;
	varying vec2 u_FogDist;

	uniform sampler2D sampler;
	uniform vec4 tcolor;

	void main()
	{
		const float FogDensity = 0.04;
		vec4 u_FogColor = vec4(0.323, 0.323, 0.423, 1.0);

		//float fogFactor = clamp((u_FogDist.y - vDistance) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
		float fogFactor = clamp((1.0 /exp(vDistance * FogDensity)), 0.0, 1.0);

		vec4 color = mix(u_FogColor, texture2D(sampler, fragTexCoord), fogFactor);

		gl_FragColor = color;

		//gl_FragColor = texture2D(sampler, fragTexCoord) * tcolor;
		//gl_FragColor = mix(texture2D(sampler, fragTexCoord), tcolor, 0.0);
	}
`;


var SourcePickVS = `
	precision mediump float;

	attribute vec3 vertPosition;

	uniform mat4 MVP;

	void main()
	{
		gl_Position = MVP * vec4(vertPosition, 1.0);
	}
`;


var SourcePickFS = `
	precision mediump float;

	uniform vec4 emissive;

	void main()
	{
		gl_FragColor = emissive;
	}
`;


var SourceSkyboxVS = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;

	varying vec3 fragTexCoord;
	varying vec4 vPosition;

	varying float vDistance;
	varying vec2 u_FogDist;

	uniform vec2 fog;
	uniform vec3 Eye;

	uniform mat4 viewMatrix;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat3 uNMatrix;

	void main()
	{
		vDistance = distance(uMVMatrix * vec4(vertPosition, 1.0), vec4(Eye, 1.0));
		u_FogDist = fog;
		fragTexCoord = vertPosition;
		vPosition = uMVMatrix * vec4(vertPosition, 1.0);
		gl_Position = uPMatrix * viewMatrix * vPosition;
	}
`;


var SourceSkyboxFS = `
	precision mediump float;

	varying vec3 fragTexCoord;
	varying float vDistance;
	varying vec2 u_FogDist;

	uniform samplerCube sampler;
	uniform vec4 tcolor;

	void main()
	{
		const float FogDensity = 0.02;
		vec4 u_FogColor = vec4(0.323, 0.323, 0.423, 1.0);

		//float fogFactor = clamp((u_FogDist.y - vDistance) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
		float fogFactor = clamp((1.0 /exp(vDistance * FogDensity)), 0.0, 1.0);
		
		vec4 color = mix(u_FogColor, textureCube(sampler, fragTexCoord) * tcolor, fogFactor);
		
		gl_FragColor = color;

		//gl_FragColor = textureCube(sampler, fragTexCoord) * tcolor;
	}
`;