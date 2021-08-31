import * as mongoose from "mongoose";
import Database from "../db";
import ReminderModel, { ReminderDocument } from "./reminder";

export interface Category {
	owner: string;
	name: string;
	// TODO convert to enum
	icon: string;
	expandByDefault: boolean;
}

const CategorySchema = new mongoose.Schema<Category>({
	owner: { type: String, required: true },
	name: { type: String, default: "Unnamed Collection" },
	icon: String,
	expandByDefault: { type: Boolean, default: true }
});

export interface CategoryMethods {
	findReminders: (from?: Date, to?: Date) => Promise<ReminderDocument[]>;
}

CategorySchema.method({
	async findReminders(from?: Date, to?: Date): Promise<ReminderDocument[]> {
		const db = await Database.get();
		return db.Reminder.find({ category: this._id, owner: this.owner })
			.after(from)
			.before(to)
			.exec();
	}
});

export type CategoryModelType = mongoose.Model<Category, {}, CategoryMethods>;

export type CategoryDocument = InstanceType<CategoryModelType>;

export default CategorySchema;
