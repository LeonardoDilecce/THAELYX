/**
  * 
  * function FromJSON(
  *     data
  * )
  *
  * Reconstructs a Vector instance from a plain JSON object.
  * The JSON must contain:
  *   - x
  *   - y
  *   - origin { x, y }
  *
  * This method returns a new Vector and does not modify
  * the current instance.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   data - JSON object containing vector fields
  *
  * Returns:
  *   A new Vector reconstructed from JSON data
  *
  * Usage:
  *   const v = Vector.prototype.FromJSON(
  *      jsonData
  *   );
  *
  */
Vector.prototype.FromJSON = function(
    data
) 
{
    return new Vector(
        data.x,
        data.y,
        data.origin
    )
};
