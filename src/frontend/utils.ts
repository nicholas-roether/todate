class BidirectionalArray<T> {
	private positive: T[] = [];
	private negative: T[] = [];
	private _minIndex: number | null = null;
	private _maxIndex: number | null = null;

	public set(index: number, value: T) {
		this.assertValidIndex(index);
		if (index >= 0) this.positive[index] = value;
		else this.negative[-index - 1] = value;
		this.updateMaxIndecies(index);
	}

	public get(index: number) {
		this.assertInRange(index);
		if (index >= 0) return this.positive[index];
		return this.negative[-index - 1];
	}

	public delete(index: number) {
		this.assertInRange(index);
		if (index >= 0) this.positive.splice(index, 1);
		else this.negative.splice(-index - 1, 1);
		this.updateMaxIndeciesDelete(index);
	}

	public pushFront(value: T) {
		this.set(this.maxIndex ? this.maxIndex + 1 : 0, value);
		return this.length;
	}

	public pushBack(value: T) {
		this.set(this.minIndex ? this.minIndex - 1 : 0, value);
		return this.length;
	}

	public popFront() {
		this.assertNotEmpty();
		const value = this.get(<number>this.maxIndex);
		this.delete(<number>this.maxIndex);
		return value;
	}

	public popBack() {
		this.assertNotEmpty();
		const value = this.get(<number>this.minIndex);
		this.delete(<number>this.minIndex);
		return value;
	}

	public clear() {
		this.positive = [];
		this.negative = [];
		this._minIndex = null;
		this._maxIndex = null;
	}

	public find(predicate: (value: T, index: number) => boolean): T | null {
		if (this.empty) return null;
		for (let i = <number>this.minIndex; i <= <number>this.maxIndex; i++) {
			const value = this.get(i);
			if (predicate(value, i)) return value;
		}
		return null;
	}

	public findLast(predicate: (value: T, index: number) => boolean): T | null {
		if (this.empty) return null;
		for (let i = <number>this.maxIndex; i >= <number>this.minIndex; i--) {
			const value = this.get(i);
			if (predicate(value, i)) return value;
		}
		return null;
	}

	public findIndex(
		predicate: (value: T, index: number) => boolean
	): number | null {
		if (this.empty) return null;
		for (let i = <number>this.minIndex; i <= <number>this.maxIndex; i++) {
			const value = this.get(i);
			if (predicate(value, i)) return i;
		}
		return null;
	}

	public findLastIndex(
		predicate: (value: T, index: number) => boolean
	): number | null {
		if (this.empty) return null;
		for (let i = <number>this.maxIndex; i >= <number>this.minIndex; i--) {
			const value = this.get(i);
			if (predicate(value, i)) return i;
		}
		return null;
	}

	public getEntries() {
		return [...this.negative, ...this.positive];
	}

	public toString() {
		// eslint-disable-next-line prettier/prettier
		return `BidirectionalArray(${this.length}) [<${this.minIndex}> ${this.getEntries().join(", ")} <${this.maxIndex}>]`;
	}

	public get minIndex() {
		return this._minIndex;
	}

	public get maxIndex() {
		return this._maxIndex;
	}

	public get length() {
		if (this.maxIndex == null || this.minIndex == null) return 0;
		return this.maxIndex - this.minIndex + 1;
	}

	public get empty() {
		return (
			this.length === 0 ||
			this.maxIndex === null ||
			this.minIndex === null
		);
	}

	private assertNotEmpty() {
		if (this.empty)
			throw new RangeError("This bidirectional array is empty");
	}

	private assertValidIndex(index: number) {
		if (!Number.isInteger(index))
			throw new TypeError(`Indecies must be integers; Got ${index}`);
	}

	private assertInRange(index: number) {
		this.assertNotEmpty();
		this.assertValidIndex(index);
		if (<number>this.minIndex > index) {
			throw new RangeError(
				`Out of range; Minimum index is ${this.minIndex}, got ${index}.`
			);
		}
		if (<number>this.maxIndex < index) {
			throw new RangeError(
				`Out of range; Maximum index is ${this.maxIndex}, got ${index}.`
			);
		}
	}

	private updateMaxIndecies(newIndex: number) {
		if (!this._minIndex || this._minIndex > newIndex)
			this._minIndex = newIndex;
		if (!this._maxIndex || this._maxIndex < newIndex)
			this._maxIndex = newIndex;
	}

	private updateMaxIndeciesDelete(deletedIndex: number) {
		this.assertInRange(deletedIndex);
		if (deletedIndex == this.maxIndex) {
			(<number>this._maxIndex)--;
			if (this.maxIndex < <number>this.minIndex) {
				this._maxIndex = null;
				this._minIndex = null;
				return;
			}
			this._maxIndex = this.findLastIndex((value) => value !== undefined);
		} else if (deletedIndex == this.minIndex) {
			(<number>this._minIndex)++;
			if (<number>this.maxIndex < this.minIndex) {
				this._maxIndex = null;
				this._minIndex = null;
				return;
			}
			this._minIndex = this.findIndex((value) => value !== undefined);
		}
	}
}

export { BidirectionalArray };
