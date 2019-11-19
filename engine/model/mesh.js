var Mesh = function(Name)
{
	this.name = Name;
	this.vertices = [];
	this.indices = [];
	
	this.faceNormals = [];
	
	this.UVPlanar = [];
	this.UVSphere  = [];
	this.UVCylinder = [];
	
	this.UVPlanarN = [];
	this.UVSphereN  = [];
	this.UVCylinderN = [];

	this.boundMin = [];
	this.boundMax = [];
	this.boundCenter = [];

	this.VBOFace = null;

	this.VBOUVPlanar = null;
	this.VBOUVSphere = null;
	this.VBOUVCylinder = null;

	this.VBOUVPlanarN = null;
	this.VBOUVSphereN = null;
	this.VBOUVCylinderN = null;

	this.VBO = null;
	this.IBO = null;

	this.VAO = null;

	this.makeBuffers = function ()
	{
		this.VBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		this.IBO = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
		
		this.VBOFace = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOFace);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.faceNormals), gl.STATIC_DRAW);
		
		this.VBOUVPlanar = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVPlanar);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVPlanar), gl.STATIC_DRAW);
		
		this.VBOUVSphere = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVSphere);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVSphere), gl.STATIC_DRAW);
		
		this.VBOUVCylinder = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVCylinder);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVCylinder), gl.STATIC_DRAW);
		
		this.VBOUVPlanarN = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVPlanarN);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVPlanarN), gl.STATIC_DRAW);
		
		this.VBOUVSphereN = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVSphereN);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVSphereN), gl.STATIC_DRAW);
		
		this.VBOUVCylinderN = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOUVCylinderN);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVCylinderN), gl.STATIC_DRAW);

		this.UVPlanar = [];
		this.UVSphere  = [];
		this.UVCylinder = [];
		
		this.UVPlanarN = [];
		this.UVSphereN  = [];
		this.UVCylinderN = [];
	}
}