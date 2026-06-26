function calculateGasCp(composition) {
    let somma = 0;
    const totale = Object.values(composition).reduce((s, x) => s + x, 0);
    for (const gas in composition) {
        const frazione = composition[gas] / totale;
        const cp = gasThermalMap[gas]?.specificHeat;
        if (cp) somma += frazione * cp;
    }
    return somma;
}