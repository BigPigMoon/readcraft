export interface Book {
	id: number;
	createdAt: string;
	updatedAt: string;
	title: string;
	language: string;
	filename: string;
	covePath: null | string;
	author: string | null;
	subject: null | null;
	progress: number;
}
