/**
  * 
  * get Destination
  *
  * Computes the absolute destination point of the vector,
  * defined as:
  *
  *      Destination = origine + (x, y)
  *
  * Useful for geometric operations, raycasting, and rendering.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   Object { x, y } representing the endpoint of the vector
  *
  * Usage:
  *   const end = v.Destination;
  *
  */
Object.defineProperty(Vector.prototype, "Destination",
    {
        get: function()
        {
            // Endpoint = origin + direction
            return (
            {
                x: this.origine.x + this.x,
                y: this.origine.y + this.y
            });
        }
    }
);
