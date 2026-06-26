class Moon
{
    constructor(name,a,e, radius, color, angle, meanSpeed,mass,inclination,epochAnomaly = angle, atmosphere = new Atmosphere()){
        this.name = name;
        this.a = a;
        this.e = e; 
        this.radius = radius;
        this.color = color;
        this.angle = angle;
        this.meanSpeed = meanSpeed;
        this.mass = mass;
        this.inclination = inclination;
        this.atmosphere = atmosphere
        this.position = { x: 0, y: 0 };
        this.influenceAreaRadius = 0;
        this.epochAnomaly = epochAnomaly;
        this.LagrangePoints = {L1:{x:undefined,y:undefined},L2:{x:undefined,y:undefined},L3:{x:undefined,y:undefined},L4:{x:undefined,y:undefined},L5:{x:undefined,y:undefined}}
        this.__type = "Moon";
    }
    toJSON() {
        return {
            __type:  this.__type,
            name : this.name,
            a : this.a,
            e : this.e,
            radius : this.radius,
            color : this.color,
            angle : this.angle,
            meanSpeed : this.meanSpeed,
            mass : this.mass,
            atmosphere : this.atmosphere.toJSON(),
            inclination : this.inclination,
            position : this.position,
            influenceAreaRadius :this.influenceAreaRadius,
            epochAnomaly : this.epochAnomaly,
            LagrangePoints : this.LagrangePoints
        };
    }
    static fromJSON(data) 
    {
        const m = new Moon(
            data.name, data.a, data.e, data.radius, data.color, data.angle,
            data.meanSpeed,data.mass,data.inclination,data.epochAnomaly,new Atmosphere());
        m.position = { ...data.position };
        m.LagrangePoints = data.LagrangePoints;
        m.atmosphere = Atmosphere.fromJSON(data.atmosphere);
        return m;
    }
}