function mapToRange(val, r1s, r1e, r2s, r2e)
{
 	return (val - r1s) / (r1e - r1s) * (r2e - r2s) + r2s;
}

function isPowerOf2(value) 
{
  return (value & (value - 1)) == 0;
}

function isString(value) 
{
	return typeof value === 'string' || value instanceof String;
}