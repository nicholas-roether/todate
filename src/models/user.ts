export interface UserInit {
	readonly nickname: string;
	readonly name: string;
	readonly picture: string;
	readonly updatedAt: Date;
	readonly id: string;
}

class User implements UserInit {
	public readonly nickname: string;
	public readonly name: string;
	public readonly picture: string;
	public readonly updatedAt: Date;
	public readonly id: string;

	constructor(init: UserInit) {
		this.nickname = init.nickname;
		this.name = init.name;
		this.picture = init.picture;
		this.updatedAt = init.updatedAt;
		this.id = init.id;
	}

	public toJson(): string {
		const { nickname, name, picture, updatedAt, id: sub } = this;
		return JSON.stringify({nickname, name, picture, updatedAt: updatedAt.toISOString(), sub});
	}

	public static fromJson(json: string | object): User {
		const obj = typeof json == "object" ? json : JSON.parse(json) as any;
		const user = {
			nickname: obj.nickname,
			name: obj.name,
			picture: obj.picture,
			updatedAt: obj.updated_at ? new Date(obj.updated_at) : undefined,
			id: obj.sub
		}

		const error = new Error("Tried to decode an invalid user object");
		if(!this.isValidUser(user)) {
			console.log("test");
			throw error;
		}
		
		return new User(user);
	}

	private static isValidUser(obj: object): obj is UserInit {
		return "nickname" 	in obj && typeof (obj as any).nickname 	== "string"
			&& "name" 		in obj && typeof (obj as any).name 		== "string"
			&& "picture"	in obj && typeof (obj as any).picture 	== "string"
			&& "updatedAt"	in obj && (obj as any).updatedAt 		instanceof Date
			&& "sub"		in obj && typeof (obj as any).id		== "string";
	}
}

export default User;