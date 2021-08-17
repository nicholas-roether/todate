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
	category: mongoose.Types.ObjectId
}, {timestamps: true});


export interface ReminderMethods {
	findCategory: () => Promise<CategoryDocument | null>,
}

ReminderSchema.method({
	async findCategory(): Promise<CategoryDocument | null> {
		const db = await Database.get();
		const collectionId = this.get("category");
		if(!collectionId) return null;
		return db.Category.findById(collectionId).exec();
	},
});

export interface ReminderQueryHelpers {
	before(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>,
	after(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>
}

ReminderSchema.query.before = function(date) {
	if(!date) return this;
	return this.find({
		dueAt: {
			$lte: date
		}
	});
}

ReminderSchema.query.after = function(date) {
	if(!date) return this;
	const duration = this.duration ?? 0;
	date = new Date(date.getTime() + duration);
	return this.find({
		dueAt: {
			$gte: date
		}
	});
}

export type ReminderModelType = mongoose.Model<Reminder, ReminderQueryHelpers, ReminderMethods>;

export type ReminderDocument = InstanceType<ReminderModelType>

export default ReminderSchema;