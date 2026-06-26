class Parachute{
    constructor(mass = 0,numParachutes = 0,areaParachute = 0,maxDeployAltitude = 0,maxShipSpeed = 0,parachuteMaterial = "",parachuteGeometry = "",openingPercent= 0,cut = false,surface = new SurfaceData()){
        this.mass = mass;
        this.numParachutes = numParachutes;
        this.areaParachute = areaParachute;
        this.maxDeployAltitude = maxDeployAltitude;
        this.maxShipSpeed = maxShipSpeed;
        this.surface = surface;
        this.openingPercent = openingPercent;
        this.parachuteGeometry = parachuteGeometry;
        this.parachuteMaterial = parachuteMaterial;
        this.cut = cut;
        this.actualPa = 0;
        this.TargetOpenPercent = 0;
        if(!this.cut) this.mass += ((this.numParachutes * this.areaParachute) * (paraMaterialsMap[parachuteMaterial]?.m ?? 0))*(parastructureMap[parachuteGeometry]?.a ?? 0);
        this.__type = "Parachute";
    }
    clone(){
        return new Parachute(this.mass,this.numParachutes,this.areaParachute,this.maxDeployAltitude,this.maxShipSpeed,this.parachuteMaterial,
            this.parachuteGeometry,this.openingPercent,this.cut,this.surface.clone())
    }
    toJSON() {
        let realMass = this.mass
        if(!this.cut) realMass = this.mass - (this.numParachutes * this.areaParachute) * (paraMaterialsMap[this.parachuteMaterial]?.m ?? 0)*(parastructureMap[this.parachuteGeometry]?.a ?? 0);
        return {
            __type:  this.__type,
            mass:  realMass,
            numParachutes : this.numParachutes,
            areaParachute : this.areaParachute,
            maxDeployAltitude : this.maxDeployAltitude,
            maxShipSpeed : this.maxShipSpeed,
            openingPercent : this.openingPercent,  
            parachuteMaterial : this.parachuteMaterial,
            parachuteGeometry : this.parachuteGeometry,
            actualPa : this.actualPa,
            surface : this.surface.toJSON(),
            TargetOpenPercent : this.TargetOpenPercent,
            cut : this.cut
        };
    }
    static fromJSON(data) {
        if(data!= null){
            const p = new Parachute(data.mass,data.numParachutes,data.areaParachute,data.maxDeployAltitude,data.maxShipSpeed,data.parachuteMaterial,data.parachuteGeometry,data.openingPercent,data.cut);
            p.actualPa = data.actualPa;
            p.TargetOpenPercent = data.TargetOpenPercent;
            p.surface = SurfaceData.fromJSON(data.surface);
            return p;
        }else return null;   
    }
}