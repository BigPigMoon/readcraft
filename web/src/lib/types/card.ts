export interface Item {
	cards?: Card[];
	folders?: Folder[];
}

export interface Card {
	id: number;
	word: string;
	translation: string;
	folderId: number;
}

export interface Folder {
	id: number;
	title: string;
	inviteCode: string;
	parentId: number;
}

export interface TreeNode {
	root: Folder;
	children: TreeNode[];
}
