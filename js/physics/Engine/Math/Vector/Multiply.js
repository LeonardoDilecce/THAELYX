/**
  * 
  * function Multiply(
  *     scalar
  * )
  *
  * Multiplies the vector components by a scalar (in‑place).
  * This operation scales the vector's magnitude while
  * preserving its direction (unless the scalar is negative).
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   scalar - numeric multiplier
  *
  * Returns:
  *   This vector after modification
  *
  * Usage:
  *   v.Multiply(
  *      3
  *   );
  *
  */
Vector.prototype.Multiply = function(
    scalar
)  
{
    this.x *= scalar;
    this.y *= scalar;
    return this;
};