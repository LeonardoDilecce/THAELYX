/**
  * 
  * function Clone()
  *
  * Creates and returns a new Vector instance with the same
  * components and origin as the current one. This is a deep copy
  * for the origin object.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   A new Vector identical to this one
  *
  * Usage:
  *   const copy = v.Clone();
  *
  */
Vector.prototype.Clone = function()
{
    // Create a new vector with identical values
    return new Vector(
        this.x,
        this.y,
        this.origine
    );
};
