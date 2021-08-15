import * as mongoose from "mongoose";
import CategorySchema, { Category, CategoryModelType } from "./schemas/category";
import ReminderSchema, { Reminder, ReminderModelType } from "./schemas/reminder";

function getModelErrorSafe<TDoc, TModel extends mongoose.Model<TDoc, {}, any>>(name: string, schema: mongoose.Schema<TDoc>): TModel {
	let res: TModel;
	try {
		res = mongoose.model<TDoc, TModel>(name, schema);
	} catch(e) {
		res = mongoose.model(name) as TModel;
	}
	return res;
}

class Database {
	private static instanceCount: number = 0;
	private static instance: Database;

	private readonly ready: Promise<void>

	// Models
	private static _Reminder: ReminderModelType;
	private static _Category: CategoryModelType;


	private constructor() {
		// Model registrations
		if(!Database._Reminder) Database._Reminder = getModelErrorSafe<Reminder, ReminderModelType>("reminder", ReminderSchema);
		if(!Database._Category) Database._Category = getModelErrorSafe<Category, CategoryModelType>("category", CategorySchema);

		mongoose.connections.forEach(conn => conn.close());

		this.ready = new Promise((res, rej) => {
			mongoose.connection.on("error", err => {
				console.error(`MongoDB connection error: ${err}`);
				rej(err);
			});
			mongoose.connection.once("open", () => {
				res();
			});
		});

		mongoose.connect(process.env.DATABASE_URL, {
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useNewUrlParser: true
		});
	}

	public close() {
		Database.instanceCount--;
		if(Database.instanceCount == 0) {
			Database.instance == null;
			mongoose.connection.close();
		}
	}

	// Model getters
	public get Reminder() { return Database._Reminder }
	public get Category() { return Database._Category }

	public static async get(): Promise<Database> {
		if(!this.instance) this.instance = new Database();
		await this.instance.ready;
		this.instanceCount++;
		return this.instance;
	}
}

export default Database;