PhysicsEngine.prototype.ComputeCentrifugalAcceleration = function(
    relativePositionX,
    relativePositionY,
    omega
)
{
    return new Vector(
        relativePositionX, 
        relativePositionY
    ).multiply(
        omega * omega
    );
}