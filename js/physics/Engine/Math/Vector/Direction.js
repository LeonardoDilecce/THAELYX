/**
  * 
  * get Direction
  *
  * Computes the angle (in radians) of the vector relative to
  * the positive X axis using atan2(y, x).
  *
  * The angle is in the range [-π, +π].
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   Angle in radians
  *
  * Usage:
  *   const angle = v.Direction;
  *
  */
Object.defineProperty(Vector.prototype, "Direction",
    {
        get: function()
        {
            // Angle of the vector in radians
            return Math.atan2(
                this.y, 
                this.x
            );
        }
    }
);
