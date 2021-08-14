import * as mongoose from "mongoose";
import CollectionModel, { CollectionDocument } from "./collection";

export interface Reminder {
	owner: string,
	title: string,
	description: string,
	createdAt: Date,
	updatedAt: Date,
	dueAt: Date,
	wholeDay: boolean,
	notificationOffsets: number[],
	collection?: mongoose.Types.ObjectId
}

const ReminderSchema = new mongoose.Schema<Reminder>({
	owner: {type: String, required: true},
	title: {type: String, default: "Untitled Reminder"},
	description: {type: String, default: ""},
	dueAt: {type: Date, required: true},
	wholeDay: {type: Boolean, default: false},
	notificationOffsets: {type: [Number], default: []},
	collection: mongoose.Types.ObjectId
}, {timestamps: true});


interface ReminderMethods {
	findParentCollection: () => Promise<CollectionDocument | null>,
	findRootCollection: () => Promise<CollectionDocument | null>
}

ReminderSchema.method({
	async findParentCollection(): Promise<CollectionDocument | null> {
		const collectionId = this.get("collection");
		if(!collectionId) return null;
		return CollectionModel.findById(collectionId).exec();
	},
	async findRootCollection(): Promise<CollectionDocument | null> {
		const parentCollection = await (this as ReminderDocument).findParentCollection();
		if(!parentCollection) return null;
		return parentCollection.findRootCollection();
	}
})

const ReminderModel = mongoose.model<Reminder, mongoose.Model<Reminder, {}, ReminderMethods>>("reminder", ReminderSchema);

export type ReminderDocument = InstanceType<typeof ReminderModel>

export default ReminderModel;