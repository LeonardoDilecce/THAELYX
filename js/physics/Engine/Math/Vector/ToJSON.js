/**
  * 
  * function toJSON()
  *
  * Serializes the vector into a plain JSON object containing:
  *   - __type
  *   - x
  *   - y
  *   - origin { x, y }
  *
  * This is used for saving, exporting, or transferring vector
  * data in a structured format.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   JSON object representing this vector
  *
  * Usage:
  *   const json = v.toJSON();
  *
  */
Vector.prototype.toJSON = function() 
{
    return (
    {
        __type: this.__type,
        x: this.x,
        y: this.y,
        origin: this.origin
    });
};