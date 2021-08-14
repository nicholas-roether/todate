import { NextApiHandler } from "next";
import auth0 from "../../../src/auth/auth0";

const me: NextApiHandler = async (req, res) => {
	try {
		await auth0.handleProfile(req, res);
	} catch(error) {
		console.error(error);
		res.status(error.status || 500).end(error.message);
	}
}

export default me;