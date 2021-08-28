import * as mongoose from "mongoose";
import Database from "../db";
import { CategoryDocument } from "./category";

export interface Reminder {
	owner: string,
	title: string,
	description: string,
	createdAt: Date,
	updatedAt: Date,
	dueAt: Date,
	duration?: number,
	wholeDay: boolean,
	notificationOffsets: number[],
	category?: mongoose.Types.ObjectId
}

const ReminderSchema = new mongoose.Schema<Reminder>({
	owner: {type: String, required: true},
	title: {type: String, default: "Untitled Reminder"},
	description: {type: String, default: ""},
	dueAt: {type: Date, required: true},
	duration: {type: Number, default: 0},
	wholeDay: {type: Boolean, default: false},
	notificationOffsets: {type: [Number], default: []},
	category: {type: mongoose.Types.ObjectId, ref: "Category" }
}, {timestamps: true});


export interface ReminderMethods {
	findCategory: () => Promise<CategoryDocument | null>,
	getStart: () => Date,
	getEnd: () => Date
}

ReminderSchema.method({
	async findCategory(): Promise<CategoryDocument | null> {
		const db = await Database.get();
		const collectionId = this.get("category");
		if(!collectionId) return null;
		return db.Category.findById(collectionId).where({ owner: this.owner }).exec();
	},
	// getStart(): Date {
	// 	if(!this.wholeDay) return this.dueAt;
	// 	// return date from start of the day
	// 	return new Date(86400000 * Math.floor(this.dueAt.getTime() / 86400000));
	// },
	// getEnd(): Date {
	// 	let startDate = this.dueAt;
	// 	if(this.wholeDay)
	// 		startDate = new Date(86400000 * Math.floor(startDate.getTime() / 86400000));
	// 	return new Date(startDate.getTime() + this.duration ?? 0);
	// }
});

export interface ReminderQueryHelpers {
	before(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>,
	after(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>
}

// To allow for correct chaining of query helpers w/o overriding the previous $or-query
function combineOr(query: mongoose.Query<any, any>, newOr: {[key: string]: any}[]) {
	const prevOr = query.getFilter().$or;
	if(!prevOr) return { $or: newOr }
	return {
		$and: [
			{ $or: newOr },
			{ $or: prevOr }
		]
	}
}

ReminderSchema.query.before = function(date: Date) {
	if(!date) return this;
	return this.where(combineOr(this, [
		{
			wholeDay: false,
			dueAt: { $lt: date }
		},
		{
			wholeDay: true,
			$where: `86400000 * Math.floor(this.dueAt.getTime() / 86400000) < ${date.getTime()}`,
		}
	]));
}

ReminderSchema.query.after = function(date) {
	if(!date) return this;
	return this.where(combineOr(this, [
		{
			wholeDay: false,
			$or: [
				{
					duration: 0,
					dueAt: {
						// Include zero-duration events that start on the border
						$gte: date
					}
				},
				{
					duration: {
						$gt: 0
					},
					$where: `${date.getTime()} < this.dueAt.getTime() + this.duration`
				}
			]
		},
		{
			wholeDay: true,
			$where: `${date.getTime()} < 86400000 * (Math.floor(this.dueAt.getTime() / 86400000) + 1)`
		}
	]));
}

export type ReminderModelType = mongoose.Model<Reminder, ReminderQueryHelpers, ReminderMethods>;

export type ReminderDocument = InstanceType<ReminderModelType>

export default ReminderSchema;