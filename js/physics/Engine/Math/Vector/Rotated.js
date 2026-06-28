/**
  * 
  * function Rotated(
  *     angle
  * )
  *
  * Returns a new vector obtained by rotating this vector
  * around its origin by the given angle (in radians).
  *
  * Rotation uses the standard 2D rotation matrix:
  *
  *   x' = x·cosθ − y·sinθ
  *   y' = x·sinθ + y·cosθ
  *
  * The original vector is not modified.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   angle - rotation angle in radians
  *
  * Returns:
  *   A new rotated Vector instance
  *
  * Usage:
  *   const r = v.Rotated(
  *      Math.PI / 2
  *   );
  *
  */
Vector.prototype.Rotated = function(
    angle
)
{
    const cos = Math.cos(
        angle
    );
    const sin = Math.sin(
        angle
    );
    return new Vector(
        this.x * cos - this.y * sin,
        this.x * sin + this.y * cos,
        this.origine
    );
};