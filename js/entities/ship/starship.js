class Starship {
    constructor(name = "Test Starship",mass = 0, position = {x:0,y:0}, relativePosition = {x:0,y:-6.371e6},
        velocity = new Vettore(0, 0,0,0), accelleration = new Vettore(0, 0,0,0), angularAccelleration = 0, angularVelocity = 0,
        angle = Math.PI + Math.PI/2,altitudineRelativa= 0,relatedObject = "Earth",EnginesOnline = false,
        TypeRelObj = "",targetedObj = {type:"",name:""},ferma = true,stages = {
            1 : new Stage()
        },actualStage = 1) {
        this.name = name;
        this.mass = mass; 
        this.position = position;
        this.relativePosition =relativePosition; 
        this.velocity = velocity;  
        this.acceleration = accelleration;
        this.angularAccelleration = angularAccelleration;
        this.angularVelocity =angularVelocity;
        this.angle = angle; 
        this.altitudineRelativa = altitudineRelativa; 
        this.relatedObject = relatedObject;
        this.Stages = stages;
        this.actualStage =actualStage;
        this.EnginesOnline = EnginesOnline;
        this.TypeRelObj = TypeRelObj;
        this.targetedObj = targetedObj;
        this.ferma = ferma;
        this.mass += Object.values(this.Stages).reduce((sum, stage) => sum + stage.mass, 0);
        this.__type = "Starship";
    }
    clone(){
        const newVel = this.velocity.clone();
        const newAcc = this.acceleration.clone();
        const newStagesMap = {};
        for (const key in this.Stages) {
            const stage = this.Stages[key];
            newStagesMap[key] = stage.clone();
        }
        const newPos = { x: this.position.x, y: this.position.y };
        const newRel = { x: this.relativePosition.x, y: this.relativePosition.y };
        return new Starship(
            "clone", this.mass, newPos, newRel,newVel,
            newAcc,this.angularAccelleration, this.angularVelocity,
            this.angle, this.altitudineRelativa,this.relatedObject,
            this.EnginesOnline, this.TypeRelObj, this.targetedObj,
            this.ferma,newStagesMap, this.actualStage);
    }
    static fromJSON(data) {
        const velocity = Vettore.fromJSON(data.velocity);
        const Accelleration = new Vettore(0,0,{x:0,y:0});
        const stages = {};
        for (const [k, v] of Object.entries(data.Stages)) {
            stages[k] = Stage.fromJSON(v);
        }   
        const s = new Starship(data.name,data.mass,data.position,data.relativePosition,velocity,Accelleration,
            data.angularAccelleration,data.angularVelocity,data.angle,data.altitudineRelativa,data.relatedObject,
        data.EnginesOnline,data.typeRelObj,data.targetedObj,data.ferma,stages,data.actualStage);
        return s;
    }
    toJSON() { 
        const realMass = this.mass - Object.values(this.Stages).reduce((sum, stage) => sum + stage.mass, 0);
        return {
            __type:  this.__type,
            name:  this.name,
            mass : realMass,
            position : this.position,
            relativePosition : this.relativePosition,
            velocity : this.velocity.toJSON(),
            acceleration:  this.acceleration.toJSON(),
            angularAccelleration : this.angularAccelleration,
            angularVelocity : this.angularVelocity,
            angle : this.angle,
            altitudineRelativa : this.altitudineRelativa,
            relatedObject : this.relatedObject, 
            Stages: Object.fromEntries(Object.entries(this.Stages).map(([k, v]) => [k, v.toJSON()])),
            actualStage : this.actualStage,
            EnginesOnline : this.EnginesOnline,
            TypeRelObj : this.TypeRelObj,
            targetedObj : this.targetedObj,
            ferma : this.ferma
        };
    }
}