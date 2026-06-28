/**
  * 
  * function Subtract(
  *     v
  * )
  *
  * Subtracts another vector's components from this vector
  * (in‑place). This operation modifies the current vector
  * and returns it, allowing method chaining.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   v - vector to subtract
  *
  * Returns:
  *   This vector after modification
  *
  * Usage:
  *   v.Subtract(
  *      other
  *   );
  *
  */
Vector.prototype.Subtract = function(
    v
) 
{
    this.x -= v.x;
    this.y -= v.y;
    return this;
};