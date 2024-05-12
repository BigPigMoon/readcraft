export interface Book {
	id: number;
	created_at: string;
	updated_at: string;
	title: string;
	language: string;
	filename: string;
	coverPath: null | string;
	author: string | null;
	subject: null | null;
	progress: number;
}
