function reloadButtons(starship,altitude,targetRadius,targetAtmosphere){
    if(starship!=null){
        const par =globalGameData.Starship?.Stages[globalGameData.Starship.actualStage].parachute??null; 
        if(starship.name!="clone"&&par!=null){
            if(!isFinite(starship.velocity.modulo())||starship.velocity.modulo()>par.maxShipSpeed){
                document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${starship.velocity.modulo()} m/s`;
                document.getElementById("ParachuteButton").classList.add("NoClickButton");
                document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                document.getElementById("ParachuteButton").style.fontSize = "5px";
            }else if(targetAtmosphere==null||starship.altitudineRelativa>targetAtmosphere.maxAltitude||targetAtmosphere.density<=1e-5){
                document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute in space`;
                document.getElementById("ParachuteButton").classList.add("NoClickButton");
                document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                document.getElementById("ParachuteButton").style.fontSize = "5px";
            } else if(starship.altitudineRelativa > par.maxDeployAltitude){
                document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${starship.altitudineRelativa/1000} Km altitude`;
                document.getElementById("ParachuteButton").classList.add("NoClickButton");
                document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                document.getElementById("ParachuteButton").style.fontSize = "5px";
            } else if(par.cut){
                document.getElementById("ParachuteButton").textContent = " ";
                document.getElementById("ParachuteButton").classList.add("NoClickButton");
                document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
                document.getElementById("ParachuteButton").style.fontSize = "10px";
            } else{
                if(par.openingPercent>=100){
                    document.getElementById("ParachuteButton").textContent = `Cut Parchute`;
                    document.getElementById("ParachuteButton").classList.remove("NoClickButton");
                }else{
                    document.getElementById("ParachuteButton").textContent = `Deploy Parachute`;
                    document.getElementById("ParachuteButton").classList.remove("NoClickButton");
                }
                document.getElementById("ParachuteButton").style.fontSize = "10px";
                document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
            }
        }
        if(starship.name!="clone"&&globalGameData.Starship!=null){
            const engine =globalGameData.Starship.Stages[globalGameData.Starship.actualStage]?.Engine??null; 
            const carb = globalGameData.Starship.Stages[globalGameData.Starship.actualStage]?.quantitaCarburante??0;
            if(engine&&carb>0){
                document.getElementById("toggleEngines").classList.remove("NoClickButton");
                document.getElementById("LeftEngines").classList.remove("NoClickButton");
                document.getElementById("RightEngines").classList.remove("NoClickButton");
                document.getElementById("LeftEngines").textContent = "◄";
                document.getElementById("RightEngines").textContent = "►";
                if(globalGameData.Starship.EnginesOnline){
                    document.getElementById("toggleEngines").textContent = "Deactivate Engines";
                }else{
                    document.getElementById("toggleEngines").textContent = "Activate Engines";
                }
            }else{
                document.getElementById("toggleEngines").textContent = " ";
                document.getElementById("toggleEngines").classList.add("NoClickButton");
                document.getElementById("LeftEngines").textContent = " ";
                document.getElementById("LeftEngines").classList.add("NoClickButton");
                document.getElementById("RightEngines").textContent = " ";
                document.getElementById("RightEngines").classList.add("NoClickButton");
                document.getElementById("ParachuteButton").style.fontSize = "10px";
                document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
                document.getElementById("thrustValue").textContent = 0;
            }
        }
        if(globalGameData.Starship&&altitude<targetRadius*5){
            if(globalGameData.chronometer.speed>3&&!globalGameData.Starship.ferma){ 
                const slider = document.getElementById("speedSlider");
                let value = parseFloat(slider.value);
                value = 3;
                document.getElementById("speedSlider").max = 3;
                globalGameData.chronometer.speed = 3; 
                document.getElementById("speedValue").textContent = value.toFixed(1);
            }
        }else{
            document.getElementById("speedSlider").max = 250;
        }
        if(starship.name!="clone"){
            if(starship.actualStage<Math.max(...Object.keys(starship.Stages).map(Number))){
                document.getElementById("StageSeparator").textContent = `Separate Stage ${starship.actualStage}`;
                document.getElementById("StageSeparator").classList.remove("NoClickButton");
            }
        }
    }else{
        document.getElementById("ParachuteButton").textContent = " ";
        document.getElementById("ParachuteButton").classList.add("NoClickButton");
        document.getElementById("StageSeparator").textContent = " ";
        document.getElementById("StageSeparator").classList.add("NoClickButton");
        document.getElementById("toggleEngines").textContent = " ";
        document.getElementById("toggleEngines").classList.add("NoClickButton");
        document.getElementById("LeftEngines").textContent = " ";
        document.getElementById("LeftEngines").classList.add("NoClickButton");
        document.getElementById("RightEngines").textContent = " ";
        document.getElementById("RightEngines").classList.add("NoClickButton");
        document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
        document.getElementById("ParachuteButton").style.fontSize = "10px";
        document.getElementById("speedSlider").max = 250;
    }
}