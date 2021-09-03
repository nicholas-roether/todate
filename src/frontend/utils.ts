function range(start: number, end: number, step: number = 1) {
	const arr: number[] = [];
	for (let i = start; i < end; i += step) {
		arr.push(i);
	}
	return arr;
}

function findClosestMonday(date: Date) {
	const ret = new Date(date);
	ret.setHours(0, 0, 0, 0);
	ret.setDate(ret.getDate() - ret.getDay() + 1);
	return ret;
}

export { range, findClosestMonday };
