function calculateMeanMolarMass(composition) {
    let somma = 0;
    const totale = Object.values(composition).reduce((s, x) => s + x, 0);
    for (const gas in composition) {
        const frazione = composition[gas] / totale;
        const Mgas = gasThermalMap[gas]?.molarMass / 1000;
        if (Mgas) somma += frazione * Mgas;
    }
    return somma;
}