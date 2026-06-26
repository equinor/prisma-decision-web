import { Option, Outcome } from '../validators';

export const sortByCreatedAt = (a: Option | Outcome, b: Option | Outcome) =>
	(a.created_at ?? '').localeCompare(b.created_at ?? '');
