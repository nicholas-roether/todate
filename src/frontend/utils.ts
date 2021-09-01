import React from "react";

class BiArray<T> {
	public readonly entries: T[];
	private _offset: number;

	public get offset(): number {
		return this._offset;
	}

	constructor(entries: T[], offset: number) {
		this.entries = entries;
		this._offset = offset;
	}

	public get(index: number): T {
		return this.entries[index + this.offset];
	}

	public set(index: number, value: T) {
		if (index >= -this.offset) this.entries[index + this.offset] = value;
		else {
			this._offset = -index;
			const padding = new Array<T>(-index + this.offset - 1);
			this.entries.unshift(value, ...padding);
		}
	}

	public splice(start: number, deleteCount: number = 1, insert?: T) {
		this.assertInRange(start);
		if (insert !== undefined)
			this.entries.splice(start + this.offset, deleteCount, insert);
		else this.entries.splice(start + this.offset, deleteCount);
		if (start == -this.lengthNegative + 1) this._offset -= deleteCount;
	}

	public removeFirst(number: number = 1) {
		this.splice(-this.lengthNegative + 1, number);
	}

	public removeLast(number: number = 1) {
		this.splice(this.lengthPositive - number - 1, number);
	}

	public append(values: T[]) {
		this.entries.push(...values);
	}

	public appendOne(value: T) {
		return this.append([value]);
	}

	public prepend(values: T[]) {
		this.entries.unshift(...values);
		this._offset += values.length;
	}

	public prependOne(value: T) {
		return this.prepend([value]);
	}

	public find(
		predicate: (value: T, index: number) => boolean,
		reverse: boolean = false
	) {
		return this.findValueIndexPair(predicate, reverse)?.[0];
	}

	public findIndex(
		predicate: (value: T, index: number) => boolean,
		reverse: boolean = false
	) {
		return this.findValueIndexPair(predicate, reverse)?.[1];
	}

	public map<R>(callback: (value: T, index: number) => R): R[] {
		return this.entries.map((value, index) =>
			callback(value, index - this.offset)
		);
	}

	public forEach(callback: (value: T, index: number) => void) {
		this.entries.forEach((value, index) =>
			callback(value, index - this.offset)
		);
	}

	public get length() {
		return this.entries.length;
	}

	public get lengthNegative() {
		return this.offset + 1;
	}

	public get lengthPositive() {
		return this.length - this.offset;
	}

	public toString() {
		const descriptor = `StaticBiVector(${this.length})`;
		if (this.length === 0) return descriptor + " [: :]";
		return (
			descriptor +
			// eslint-disable-next-line prettier/prettier
			` [${-this.lengthNegative + 1}: ${this.entries.join(", ")} :${this.lengthPositive - 1}]`
		);
	}

	private findValueIndexPair(
		predicate: (value: T, index: number) => boolean,
		reverse: boolean = false
	): [T, number] | null {
		if (this.length == 0) return null;
		const loopStart = reverse
			? this.lengthPositive - 1
			: -this.lengthNegative + 1;
		const loopCheck: (i: number) => boolean = reverse
			? (i) => i > -this.lengthNegative
			: (i) => i < this.lengthPositive;
		const loopIncrement: (i: number) => number = reverse
			? (i) => --i
			: (i) => ++i;
		for (let i = loopStart; loopCheck(i); i = loopIncrement(i)) {
			const value = this.get(i);
			if (predicate(value, i)) return [value, i];
		}
		return null;
	}

	private assertInRange(index: number) {
		const offsetIndex = index + this.offset;
		if (offsetIndex < 0 || offsetIndex >= this.entries.length)
			throw new RangeError(`Index ${index} is out of range`);
	}

	public static empty<T>(): BiArray<T> {
		return new BiArray<T>([], 0);
	}
}

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

function scrollTo(element: HTMLElement, offset: number, callback: () => void) {
	const fixedOffset = offset.toFixed();
	const onScroll = function () {
		if (window.pageYOffset.toFixed() === fixedOffset) {
			window.removeEventListener("scroll", onScroll);
			callback();
		}
	};

	element.addEventListener("scroll", onScroll);
	onScroll();
	element.scrollTo({
		top: offset,
		behavior: "smooth"
	});
}

export { BiArray, range, findClosestMonday, scrollTo };
