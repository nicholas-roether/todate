// Studpid hack to trick vscode into doing syntax highlighting
const gql: (t: TemplateStringsArray) => string = t => t.raw.join("");

function findInDocMap(docMap: seedDB.DocMap, id: string): seedDB.Doc | null {
	for(const collection in docMap) {
		for(const entry of docMap[collection])
			if(entry._id == id) return entry;
	}
	return null;
}


export {
	gql,
	findInDocMap
}