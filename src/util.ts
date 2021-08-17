function highestMultipleBelow(number: number, limit: number): number {
	return number * Math.floor(limit / number);
}

function today(): Date {
	return new Date(highestMultipleBelow(86400000, Date.now()));
}

function tomorrow(): Date {
	return new Date(highestMultipleBelow(86400000, Date.now() + 86400000));
}

export {
	highestMultipleBelow,
	today,
	tomorrow
}