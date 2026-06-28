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