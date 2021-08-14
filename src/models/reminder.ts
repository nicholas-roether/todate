import * as mongoose from "mongoose";
import CategoryModel, { CategoryDocument } from "./collection";

export interface Reminder {
	owner: string,
	title: string,
	description: string,
	createdAt: Date,
	updatedAt: Date,
	dueAt: Date,
	wholeDay: boolean,
	notificationOffsets: number[],
	category?: mongoose.Types.ObjectId
}

const ReminderSchema = new mongoose.Schema<Reminder>({
	owner: {type: String, required: true},
	title: {type: String, default: "Untitled Reminder"},
	description: {type: String, default: ""},
	dueAt: {type: Date, required: true},
	wholeDay: {type: Boolean, default: false},
	notificationOffsets: {type: [Number], default: []},
	category: mongoose.Types.ObjectId
}, {timestamps: true});


interface ReminderMethods {
	findCategory: () => Promise<CategoryDocument | null>,
}

ReminderSchema.method({
	async findCategory(): Promise<CategoryDocument | null> {
		const collectionId = this.get("category");
		if(!collectionId) return null;
		return CategoryModel.findById(collectionId).exec();
	},
});

interface ReminderQueryHelpers {
	before(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>,
	after(date: Date | null): mongoose.QueryWithHelpers<any, ReminderDocument, ReminderQueryHelpers>
}

ReminderSchema.query.before = function(date) {
	if(!date) return this;
	return this.find({
		"dueAt": {
			"$lte": date
		}
	});
}

ReminderSchema.query.after = function(date) {
	if(!date) return this;
	return this.find({
		"dueAt": {
			"$gte": date
		}
	});
}

const ReminderModel = mongoose.model<Reminder, mongoose.Model<Reminder, ReminderQueryHelpers, ReminderMethods>>("reminder", ReminderSchema);

export type ReminderDocument = InstanceType<typeof ReminderModel>

export default ReminderModel;