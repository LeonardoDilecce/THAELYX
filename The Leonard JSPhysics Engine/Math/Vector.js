// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
  * 
  * class Vector
  * ------------
  *
  * Last Update: 2026-06-28
  * ------------
  *
  * Represents a 2D mathematical vector with an associated origin point.
  * This class provides the foundational geometric operations used across
  * the physics engine, including spatial transformations, vector algebra,
  * and coordinate‑space manipulations.
  *
  * The Vector class is intentionally lightweight and stateless: each
  * instance stores only its components (x, y) and its origin, while all
  * mathematical operations are implemented as modular methods in separate
  * files for clarity and maintainability.
  *
  * This class provides:
  *   - Basic vector algebra (Add, Subtract, Multiply, Divide)
  *   - Geometric utilities (Magnitude, Direction, Destination)
  *   - Transformations (Rotated, Clone)
  *   - Serialization helpers (ToJSON, FromJSON)
  *
  * The origin property allows the vector to represent both:
  *   - A free vector (origin = {0,0})
  *   - A position vector anchored to a specific point
  *
  * This design supports physics simulations, orbital mechanics,
  * collision detection, and rendering transformations.
  *
  * Usage:
  *   const v = new Vector(3, 4);
  *   const len = v.Magnitude();
  *   const rotated = v.Rotated(Math.PI / 2);
  *
  * Other files in this directory (js/physics/Engine/Math/Vector/)
  * provide the actual implementations of each method.
  * ------------
  * Other Files:
  *   - js/physics/Engine/Math/Vector/Destination.js
  *   - js/physics/Engine/Math/Vector/Direction.js
  *   - js/physics/Engine/Math/Vector/ToJSON.js
  *   - js/physics/Engine/Math/Vector/FromJSON.js
  *   - js/physics/Engine/Math/Vector/Magnitude.js
  *   - js/physics/Engine/Math/Vector/Rotated.js
  *   - js/physics/Engine/Math/Vector/Clone.js
  *   - js/physics/Engine/Math/Vector/Add.js
  *   - js/physics/Engine/Math/Vector/Subtract.js
  *   - js/physics/Engine/Math/Vector/Dot.js
  *   - js/physics/Engine/Math/Vector/Multiply.js
  *   - js/physics/Engine/Math/Vector/Divide.js
  *
  */
class Vector 
{
    constructor(
        x = 0, 
        y = 0, 
        origin = { x: 0, y: 0 }
    ) 
    {
        this.x = x;
        this.y = y;
        this.origin = 
        { 
            ...origin 
        };
        this.__type = "Vettore";
    }
    //Defined in js/physics/Engine/Math/Vector/Destination.js
    get Destination() {};
    //Defined in js/physics/Engine/Math/Vector/Direction.js
    get Direction() {};
    //Defined in js/physics/Engine/Math/Vector/ToJSON.js
    ToJSON() {};
    //Defined in js/physics/Engine/Math/Vector/FromJSON.js
    FromJSON() {};
    //Defined in js/physics/Engine/Math/Vector/Magnitude.js
    Magnitude() {};
    //Defined in js/physics/Engine/Math/Vector/Rotated.js
    Rotated(
        angle
    ) {};
    //Defined in js/physics/Engine/Math/Vector/Clone.js
    Clone() {};
    //Defined in js/physics/Engine/Math/Vector/Add.js
    Add(
        v
    ) {}
    //Defined in js/physics/Engine/Math/Vector/Subtract.js
    Subtract(
        v
    ) {};
    //Defined in js/physics/Engine/Math/Vector/Dot.js
    Dot(
        v
    ) {};
    //Defined in js/physics/Engine/Math/Vector/Multiply.js
    Multiply(
        scalar
    ) {};
    //Defined in js/physics/Engine/Math/Vector/Divide.js
    Divide(
        scalar
    ) {};
}