export const sortByCreatedAt = <T extends { created_at?: string }>(items: T[]): T[] =>
	[...items].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));
