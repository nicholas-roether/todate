import useSWR from "swr";
import User from "../models/user";

async function fetchUser(): Promise<User> {
	const res = await fetch("/api/auth/me");
	if(!res.ok) return null;
	const user = User.fromJson(await res.json());
	return user;
}

function useUser() {
	return useSWR("/", () => fetchUser());
}

export {
	fetchUser,
	useUser
}