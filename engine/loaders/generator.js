function CylinderMap(entity, minZ, maxZ)
{
  var x = entity[0];
  var y = entity[1];
  var z = entity[2];

  z = (z - minZ) / (maxZ - minZ); 
  var theta = Math.atan2(y, x) * 180 / Math.PI;

  var u = theta / 360.0;
  var v = z;

  return [u,v];
}

function SphereMap(entity)
{
  let x = entity[0];
  let y = entity[1];
  let z = entity[2];

  var r = Math.sqrt(x * x + y * y + z * z);
  var theta = Math.atan2(y, x) * 180 / Math.PI;
  var phi = Math.acos(z / r) * 180 / Math.PI;

  var u = theta / 360.0;
  var v = (180.0 - phi) / 180.0;

  return [u,v];
}

function CubicMap(entity, vertex, bounds)
{
  var x = vertex[0];
  var y = vertex[1];
  var z = vertex[2];

  var ax = Math.abs(entity[0]);
  var ay = Math.abs(entity[1]);
  var az = Math.abs(entity[2]);

    var u;
  var v;

    if (ax >= ay && ax >= az)
    {
        (x < 0.0) ? (u = z) : (u = -z);
        v = y;
        u /= bounds.Z;
        v /= bounds.Y;
    }
    else if (ay >= ax && ay >= az)
    {
        (y < 0.0) ? (v = z) : (v = -z);
        u = x;
        u /= bounds.X;
        v /= bounds.Z;
    }
    else
    {
        (z < 0.0) ? (u = -x) : (u = x);
        v = y;
        u /= bounds.X;
        v /= bounds.Y;
    }

    u = (u + 1.0) / 2.0;
    v = (v + 1.0) / 2.0;

    return [u,v];
}