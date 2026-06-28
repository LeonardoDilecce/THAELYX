PhysicsEngine.prototype.ComputeCoriolisAcceleration = function(
    relativeVelocity,
    omega
)
{
    return new Vector(
        -relativeVelocity.y, 
        relativeVelocity.x
    ).multiply(
        -2 * omega
    );
}