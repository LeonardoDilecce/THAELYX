class Planet{
    constructor(name,a,e,radius,color,angle,meanSpeed,mass,inclination,epochAnomaly = 0,moons = [],atmosphere = new Atmosphere(),isBase = false){
        this.name = name;
        this.a = a;
        this.e = e; 
        this.radius = radius;
        this.color = color;
        this.angle = angle;
        this.meanSpeed = meanSpeed;
        this.moons = moons;
        this.mass = mass;
        this.spacebase = isBase;
        this.atmosphere = atmosphere
        this.inclination = inclination;
        this.position = { x: 0, y: 0 };
        this.influenceAreaRadius = 0;
        this.epochAnomaly = epochAnomaly;
        this.LagrangePoints = {L1:{x:undefined,y:undefined},L2:{x:undefined,y:undefined},L3:{x:undefined,y:undefined},L4:{x:undefined,y:undefined},L5:{x:undefined,y:undefined}}
        this.__type = "Planet";
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
            moons : this.moons.map(m => m.toJSON()),
            mass : this.mass,
            spacebase : this.spacebase,
            atmosphere : this.atmosphere.toJSON(),
            inclination : this.inclination,
            position : this.position,
            influenceAreaRadius :this.influenceAreaRadius,
            epochAnomaly : this.epochAnomaly,
            LagrangePoints : this.LagrangePoints
        };
    }
    static fromJSON(data) {
        const p = new Planet(
            data.name, data.a, data.e, data.radius, data.color, data.angle,
            data.meanSpeed, data.mass, data.inclination, data.epochAnomaly,
        [],new Atmosphere(), data.spacebase);
        p.position = { ...data.position };
        p.LagrangePoints = data.LagrangePoints;
        p.moons = data.moons.map(m => Moon.fromJSON(m));
        p.atmosphere = Atmosphere.fromJSON(data.atmosphere);
        return p;
    }
}