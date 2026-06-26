class Star{
    constructor(name,a,e,radius,color,angle,meanSpeed,mass,inclination,planets = [],corona = new Atmosphere(),luminosity = 0){
        this.name = name;
        this.a = a;
        this.e = e; 
        this.radius = radius;
        this.color = color;
        this.angle = angle;
        this.meanSpeed = meanSpeed;
        this.planets = planets;
        this.mass = mass;
        this.corona = corona;
        this.position = { x: 0, y: 0 };
        this.influenceAreaRadius = 0;
        this.epochAnomaly = a;
        this.inclination = inclination;
        this.luminosity = luminosity;
        this.__type = "Star";
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
            planets : this.planets.map(p => p.toJSON()),
            mass : this.mass,
            corona : this.corona.toJSON(),
            luminosity : this.luminosity,
            inclination : this.inclination,
            influenceAreaRadius :this.influenceAreaRadius,
            epochAnomaly : this.epochAnomaly,
        };
    }
    static fromJSON(data) {
        const s = new Star(data.name, data.a, data.e, data.radius, data.color, data.angle,
            data.meanSpeed, data.mass, data.inclination,[],new Atmosphere(),data.luminosity)
        s.position = { ...data.position };
        s.planets = data.planets.map(p => Planet.fromJSON(p));
        s.corona = Atmosphere.fromJSON(data.corona);
        s.influenceAreaRadius = data.influenceAreaRadius;
        return s;
    }
}