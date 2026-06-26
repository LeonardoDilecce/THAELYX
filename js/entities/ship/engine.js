class Engine{
    constructor(mass = 0,Thrust = 0,angle=0,online=true,thrustPercent=0,tipoCarburante="",surface = new SurfaceData()){
        this.mass = mass;
        this.Thrust = Thrust;
        this.angle = angle;
        this.online = online;
        this.thrustPercent = thrustPercent;
        this.tipoCarburante = tipoCarburante;
        this.surface = surface;
        this.__type = "Engine";
    }
    clone(){
        return new Engine(this.mass,this.Thrust,this.angle,this.online,this.thrustPercent,this.tipoCarburante,this.surface.clone());
    }
    toJSON() {
        return {
            __type:  this.__type,
            Thrust:  this.Thrust,
            angle : this.angle,
            online : this.online,
            mass : this.mass,
            surface : this.surface.toJSON(),
            thrustPercent : this.thrustPercent,
            tipoCarburante : this.tipoCarburante, 
        };
    }
    static fromJSON(data) {
        if (data==null) return null;
        const e = new Engine(data.mass,data.Thrust,data.angle,data.online,data.thrustPercent,data.tipoCarburante);
        e.surface = SurfaceData.fromJSON(data.surface);
        return e;
    }
}