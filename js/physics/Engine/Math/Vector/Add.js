/**
  * 
  * function Add(
  *     v
  * )
  *
  * Adds another vector's components to this vector (in-place).
  * This operation modifies the current vector and returns it,
  * allowing method chaining.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   v - Vector to add (must contain x and y components)
  *
  * Returns:
  *   This vector after modification
  *
  * Usage:
  *   v.Add(otherVector);
  *   v.Add(force).Add(acceleration);
  *
  */
Vector.prototype.Add = function(
    v
)
{
    // Add component-wise
    this.x += v.x;
    this.y += v.y;
    return this;
};
