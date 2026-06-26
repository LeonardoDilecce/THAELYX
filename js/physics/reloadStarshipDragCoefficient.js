function reloadStarshipDragCoefficient(starship) {
    const componentiVisibili = [];
    const vel   = starship.velocity.clone();
    const vMod  = vel.modulo();
    const dirV  = vel.divide(vMod);
    const ang    = starship.angle;
    const orient = new Vettore(Math.cos(ang), Math.sin(ang),{x:starship.position.x,y:starship.position.y});
    function proiettaCilindro(surf, axis) {
        const r     = surf.diameter / 2;
        const h     = surf.height;
        const cosT  = Math.abs(dirV.dot(axis));
        const sinT  = Math.sqrt(1 - cosT*cosT);
        const A_head= Math.PI * r * r; 
        const A_side= h * surf.diameter; 
        const Aproj = A_head * cosT + A_side * sinT;
        const info  = hullStructureMap[surf.kind] || {};
        const cdH   = surf.Cd   > 0 ? surf.Cd   : (info.cd     ?? 0.85);
        const cdS   =                info.sideCd ?? cdH;
        const CdEff = (cdH * A_head * cosT + cdS * A_side * sinT) / Aproj;
        const fattA = info.a ?? 1;
        return { A: Aproj * fattA, CdA: CdEff * (Aproj * fattA) };
    }
    let areaTot = 0, sommaCdA = 0;
    for (const stage of Object.values(starship.Stages)) {
        if (stage.surface?.diameter > 0) {
            const { A, CdA } = proiettaCilindro(stage.surface, orient);
            if(A>0) componentiVisibili.push({id: stage.surface.id,a:{a:A,cD:CdA}});
            areaTot  += A;  
            sommaCdA += CdA;
        }
        const engSurf = stage.Engine?.surface;
        if (engSurf?.diameter > 0) {
            const { A, CdA } = proiettaCilindro(engSurf, orient.clone().multiply(-1));
            if(A>0) componentiVisibili.push({id: engSurf.id,a:{a:A,cD:CdA}});
            areaTot  += A;  
            sommaCdA += CdA;
        }
        const hsSurf  = stage.heatShield?.surface;
        if (hsSurf?.diameter > 0) {
            const { A, CdA } = proiettaCilindro(hsSurf, orient);
            if(A>0) componentiVisibili.push({id: hsSurf.id,a:{a:A,cD:CdA}});
            areaTot  += A;  
            sommaCdA += CdA;
        }
        const parDeploySurface  = stage.parachute?.surface;
        if (parDeploySurface?.diameter > 0) {
            const { A, CdA } = proiettaCilindro(parDeploySurface, orient);
            if(A>0) componentiVisibili.push({id: parDeploySurface.id,a:{a:A,cD:CdA}});
            areaTot  += A;  
            sommaCdA += CdA;
        }
    }
    return {
        A : areaTot,
        Cd: areaTot > 0 ? sommaCdA / areaTot : 0.3,
        surfaces : componentiVisibili
    };
}