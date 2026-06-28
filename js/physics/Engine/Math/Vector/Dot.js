/**
  * 
  * function Dot(
  *     v
  * )
  *
  * Computes the dot product between this vector and another.
  * The dot product is defined as:
  *
  *     x₁·x₂ + y₁·y₂
  *
  * It is commonly used for angle calculations, projections,
  * and determining alignment between vectors.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Parameters:
  *   v - vector to dot with
  *
  * Returns:
  *   Scalar dot product value
  *
  * Usage:
  *   const d = v.Dot(
  *      other
  *   );
  *
  */
Vector.prototype.Dot = function(
    v
) 
{
    return this.x * v.x + this.y * v.y;
};