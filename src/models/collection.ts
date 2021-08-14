import * as mongoose from "mongoose";

export interface Collection {
	owner: string,
	name: string,
	parent: mongoose.Types.ObjectId
}

const CollectionSchema = new mongoose.Schema<Collection>({
	owner: {type: String, required: true},
	name: {type: String, default: "Unnamed Collection"},
	parent: mongoose.Types.ObjectId
});


interface CollectionMethods {
	findRootCollection: () => Promise<CollectionDocument>,
	findChildCollections: () => Promise<CollectionDocument[]>,
	findReminders: () => Promise<CollectionDocument[]>
}

CollectionSchema.method({
	async findRootCollection(): Promise<CollectionDocument> {
		const findParent: (document: CollectionDocument) => Promise<CollectionDocument> = async document => {
			const parent = document.get("parent");
			if(!parent) return document;
			return CollectionModel.findById(parent).exec();
		}
		const findRoot: (document: CollectionDocument) => Promise<CollectionDocument> = async document => {
			if(!document.get("parent")) return document;
			return findRoot(await findParent(document));
		}
		return findRoot(this as CollectionDocument);
	},
	async findChildCollections(): Promise<CollectionDocument[]> {
		return CollectionModel.find({"collection": this._id}).exec();
	},
	async findReminders(): Promise<CollectionDocument[]> {
		return CollectionModel.find({"collection": this._id}).exec();
	}
});

const CollectionModel = mongoose.model<Collection, mongoose.Model<Collection, {}, CollectionMethods>>("colleciton", CollectionSchema);

export type CollectionDocument = InstanceType<typeof CollectionModel>;

export default CollectionModel;