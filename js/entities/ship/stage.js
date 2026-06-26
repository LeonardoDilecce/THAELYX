class Stage{
    constructor(mass = 0,quantitaCarburante = 0,tipoCarburante = "",surface = new SurfaceData(),engine = null,parachute = null,heatShield = null){
        this.mass = mass;
        this.Engine = engine;
        this.heatShield = heatShield;
        this.parachute = parachute;
        this.quantitaCarburante = quantitaCarburante;
        this.tipoCarburante = tipoCarburante;
        this.surface = surface;
        if(this.Engine != null) this.mass += this.Engine.mass
        if(this.heatShield != null) this.mass += this.heatShield.mass;
        if(this.parachute != null) this.mass += this.parachute.mass;
        const massFuel = ( this.quantitaCarburante * (fuelMap[this.tipoCarburante]?.density??0)??0)
        if(isFinite(massFuel)) this.mass += massFuel;
        this.__type = "Stage";
    }
    clone(){
        let stageMass = this.mass
        if(this.Engine != null) stageMass -= this.Engine.mass
        if(this.heatShield != null) stageMass -= this.heatShield.mass;
        if(this.parachute != null) stageMass -= this.parachute.mass;
        if(this.quantitaCarburante>0&&this.tipoCarburante!=null&&this.tipoCarburante!="") {
            stageMass -= (this.quantitaCarburante * ((fuelMap[this.tipoCarburante]?.density??0)??0));
        }
        return new Stage(stageMass,this.quantitaCarburante,this.tipoCarburante,this.surface.clone(),
        this.Engine?.clone()??null,this.parachute?.clone()??null,this.heatShield?.clone()??null)
    }
    toJSON() {
        let massFuel = ( this.quantitaCarburante *  (fuelMap[this.tipoCarburante]?.density??0))
        if(!isFinite(massFuel)) massFuel = 0;
        const realMass = this.mass - massFuel - (this.parachute?.mass??0) -  (this.Engine?.mass??0)-  (this.heatShield?.mass??0);
        const par = this.parachute?.toJSON()??null;
        const engine = this.Engine?.toJSON()??null;
        const heat = this.heatShield?.toJSON()??null;
        return {
            __type:  this.__type,
            mass:  realMass,
            Engine : engine,
            parachute : par,
            heatShield : heat,
            surface : this.surface.toJSON(),
            quantitaCarburante : this.quantitaCarburante,
            tipoCarburante : this.tipoCarburante,
        };
    }
    static fromJSON(data) {
        const s = new Stage(data.mass,data.quantitaCarburante,data.tipoCarburante);
        s.Engine = Engine.fromJSON(data.Engine);
        s.parachute = Parachute.fromJSON(data.parachute);
        s.heatShield = HeatShield.fromJSON(data.heatShield);
        s.surface = SurfaceData.fromJSON(data.surface);
        if(s.Engine) s.mass+=s.Engine.mass;
        if(s.parachute) s.mass+=s.parachute.mass;
        if(s.heatShield) s.mass+=s.heatShield.mass;
        return s;
    }
}