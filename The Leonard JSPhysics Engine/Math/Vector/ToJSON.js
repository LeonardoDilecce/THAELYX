// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
  * 
  * function ToJSON()
  *
  * Serializes the vector into a plain JSON object containing:
  *   - __type
  *   - x
  *   - y
  *   - origin { x, y }
  *
  * This is used for saving, exporting, or transferring vector
  * data in a structured format.
  *
  * ------------
  * Last Update: 2026-06-28
  * ------------
  *
  * Returns:
  *   JSON object representing this vector
  *
  * Usage:
  *   const json = v.ToJSON();
  *
  */
Vector.prototype.ToJSON = function() 
{
    return (
    {
        __type: this.__type,
        x: this.x,
        y: this.y,
        origin: this.origin
    });
};