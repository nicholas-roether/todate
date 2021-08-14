import * as mongoose from "mongoose";
import ReminderModel, { ReminderDocument } from "./reminder";

export interface Category {
	owner: string,
	name: string,
	// TODO convert to enum
	icon: string
}

const CategorySchema = new mongoose.Schema<Category>({
	owner: {type: String, required: true},
	name: {type: String, default: "Unnamed Collection"},
	icon: String
});


interface CategoryMethods {
	findReminders: (from?: Date, to?: Date) => Promise<ReminderDocument[]>
}

CategorySchema.method({
	async findReminders(from?: Date, to?: Date): Promise<ReminderDocument[]> {
		return ReminderModel.find({"category": this._id}).after(from).before(to).exec();
	}
});

const CategoryModel = mongoose.model<Category, mongoose.Model<Category, {}, CategoryMethods>>("collection", CategorySchema);

export type CategoryDocument = InstanceType<typeof CategoryModel>;

export default CategoryModel;