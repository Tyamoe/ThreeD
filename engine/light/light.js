var LightMode = 
{
  Point: 1,
  Spot: 2,
  Dir: 3,
};

var Light = function(obj_, mode_, color_)
{
	this.name = obj_.name;
	this.obj = obj_;
	this.enabled = true;

	this.data = new LightData();
}

var LightData = function()
{
	this.type = 1.0;
	this.pos = new Float32Array([0.0, 0.0, 0.0]);
	this.color = new Float32Array([1.0, 0.0, 0.0]);
	this.ambColor = new Float32Array([0.1, 0.1, 0.1]);
	this.diffColor = new Float32Array([0.3, 0.3, 0.3]);
	this.specColor = new Float32Array([0.2, 0.2, 0.2]);
	this.shininess = 32.0;
	this.inner = 12.5;
	this.outer = 18.0;
	this.falloff = 5.0;
}