/**
  * 
  * function Magnitude()
  *
  * Computes the Euclidean length of the vector using:
  *
  *     √(x² + y²)
  *
  * This value represents the vector's modulus and is useful
  * for normalization, distance calculations, and physics
  * operations involving vector strength.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   Length of the vector (non‑negative scalar)
  *
  * Usage:
  *   const len = v.Magnitude();
  *
  */
Vector.prototype.Magnitude = function()
{
    return Math.hypot(
        this.x, 
        this.y
    );
};