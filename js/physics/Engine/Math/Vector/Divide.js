/**
  * 
  * function Divide(
  *     scalar
  * )
  *
  * Divides the vector components by a scalar (in‑place).
  * If the scalar is zero, the operation is skipped to avoid
  * undefined numerical behavior.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   scalar - numeric divisor
  *
  * Returns:
  *   This vector after modification
  *
  * Usage:
  *   v.Divide(
  *      2
  *   );
  *
  */
Vector.prototype.Divide = function(
    scalar
) 
{
    if (scalar !== 0) 
    {
        this.x /= scalar;
        this.y /= scalar;
    }
    return this;
};