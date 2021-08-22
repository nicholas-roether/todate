// Studpid hack to trick vscode into doing syntax highlighting
// @ts-ignore
const gql: (t: TemplateStringsArray) => string = t => t.raw.join("");

const CATEGORY_EXISTS = gql`
	query($id: ID!) {
		categoryExists(id: $id)
	}
`;

const GET_CATEGORY = gql`
	query(
		$id: ID!,
		$remindersFrom: Date,
		$remindersTo: Date
	) {
		getCategory(
			id: $id,
			remindersFrom: $remindersFrom,
			remindersTo: $remindersTo
		) {
			id,
			name,
			icon,
			expandByDefault,
			content {
				id,
				title,
				description,
				updatedAt,
				createdAt,
				dueAt,
				duration,
				wholeDay,
				notificationOffsets
			}
		}
	}
`;