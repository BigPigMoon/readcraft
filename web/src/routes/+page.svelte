<script lang="ts">
	import FolderIcon from '$lib/Icons/FolderIcon.svelte';
	import CreateFolderIcon from '$lib/Icons/CreateFolderIcon.svelte';
	import WordCard from '$lib/components/card/WordCard.svelte';
	import FolderCard from '$lib/components/card/FolderCard.svelte';
	import CopyIcon from '$lib/Icons/CopyIcon.svelte';
	import HomeIcon from '$lib/Icons/HomeIcon.svelte';
	import DownloadIcon from '$lib/Icons/DownloadIcon.svelte';
	import { onMount } from 'svelte';
	import type { Item, Card, Folder } from '$lib/types/card';
	import rcApi from '$lib/http/rc';

	let items: Item[] = [];
	let selectedFolderId: number;
	let path: Folder[] = [];

	let isNewFolder = false;
	let newFolderTitle = '';

	let newCardWord = '';
	let newCardTranslation = '';

	let inviteCodeValue = '';

	onMount(async () => {
		let folderId: number;

		let storedFolderId = localStorage.getItem('selectedFolder');
		if (!storedFolderId) {
			folderId = (await rcApi.get<number>('/api/group/root')).data;
		} else {
			folderId = parseInt(storedFolderId);
		}

		await selectFolder(folderId);
	});

	const createCard = async () => {
		const createWordRes = await rcApi.post('/api/card/create', {
			word: newCardWord,
			translation: newCardTranslation,
			group_id: selectedFolderId
		});

		let newCard: Card = {
			id: createWordRes.data,
			group_id: selectedFolderId,
			word: newCardWord,
			translation: newCardTranslation
		};

		newCardTranslation = '';
		newCardWord = '';

		items = [...items, { Card: newCard }];
		items = items.sort(sortItems);
	};

	const createFolder = async () => {
		if (newFolderEmpty) return;

		const createFolderRes = await rcApi.post('/api/group/create', {
			title: newFolderTitle,
			group_id: selectedFolderId
		});

		let newGroup: Folder = {
			id: createFolderRes.data,
			title: newFolderTitle,
			group_id: selectedFolderId,
			invite_code: ''
		};

		newFolderTitle = '';

		items = [...items, { Group: newGroup }];
		items = items.sort(sortItems);

		isNewFolder = false;
	};

	const onFolderClick = async (folderId: number | undefined) => {
		if (folderId === undefined) return;
		if (selectedFolderId === folderId) return;

		localStorage.setItem('selectedFolder', folderId.toString());

		await selectFolder(folderId);
	};

	const selectFolder = async (folderId: number) => {
		selectedFolderId = folderId;

		const getItemsRes = (await rcApi.get<Item[]>(`/api/group/items/${selectedFolderId}`)).data.sort(
			sortItems
		);

		items = [...getItemsRes];

		path = (await rcApi.get<Folder[]>(`/api/group/path/${selectedFolderId}`)).data.reverse();
	};

	const sortItems = (a: Item, b: Item) => {
		// Если у обоих элементов есть тип 'Group', то они равны между собой
		if (a.Group && b.Group) {
			return 0;
		} else if (a.Group) {
			return -1; // Элемент 'a' идет первым, так как у него тип 'Group'
		} else if (b.Group) {
			return 1; // Элемент 'b' идет первым, так как у него тип 'Group'
		}

		// Если у обоих элементов нет типа 'Group', сравниваем по типу 'Card'
		if (a.Card && b.Card) {
			return 0;
		} else if (a.Card) {
			return -1; // Элемент 'a' идет первым, так как у него тип 'Card'
		} else if (b.Card) {
			return 1; // Элемент 'b' идет первым, так как у него тип 'Card'
		}

		return 0;
	};

	const onRemoveItem = (event: any) => {
		const { id, type } = event.detail;

		removeItem(id, type);
	};

	const removeItem = (id: number, type: string) => {
		if (type === 'card') {
			items = items.filter((item) => {
				if (item.Card) {
					return item.Card.id !== id;
				}
				return true; // Если элемент не является ни Card, ни Group, оставляем его в списке
			});
		} else if (type === 'folder') {
			items = items.filter((item) => {
				if (item.Group) {
					return item.Group.id !== id;
				}
				return true; // Если элемент не является ни Card, ни Group, оставляем его в списке
			});
		}
	};

	const deleteItemDrop = async (event: DragEvent) => {
		event.preventDefault();

		const data = event.dataTransfer?.getData('text/plain');

		if (data === undefined) return;

		const item = JSON.parse(data);

		const id = item.id;
		if (item.type === 'card') {
			await rcApi.delete(`/api/card/delete/${id}`);

			items = items.filter((item) => {
				if (item.Card) {
					return item.Card.id !== id;
				}
				return true; // Если элемент не является ни Card, ни Group, оставляем его в списке
			});
		} else if (item.type === 'folder') {
			await rcApi.delete(`/api/group/delete/${id}`);
			items = items.filter((item) => {
				if (item.Group) {
					return item.Group.id !== id;
				}
				return true; // Если элемент не является ни Card, ни Group, оставляем его в списке
			});
		}
	};

	const moveItemHere = async (event: DragEvent, id: number) => {
		event.preventDefault();

		const data = event.dataTransfer?.getData('text/plain');

		if (id === selectedFolderId) return;

		if (data === undefined) return;

		const item = JSON.parse(data);

		if (item.type === 'card') {
			await rcApi.put('/api/card/update', {
				id: item.id,
				word: item.word,
				translation: item.translation,
				group_id: id
			});
			removeItem(item.id, 'card');
		} else if (item.type === 'folder') {
			if (id === item.id) return;

			await rcApi.put('/api/group/update', {
				id: item.id,
				title: item.title,
				group_id: id
			});

			removeItem(item.id, 'folder');
		}
	};

	const copyFolderCode = () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.value = path.slice(-1)[0].invite_code;
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
		alert('Код скопирован в буфер обмена!');
	};

	const pasteFolderItems = () => {
		if (inviteCodeEmpty) return;

		rcApi
			.post('/api/group/copy', {
				invite_code: inviteCodeValue,
				parent_id: selectedFolderId
			})
			.then((res) => {
				location.reload();
			});
	};

	$: newFolderEmpty = newFolderTitle.length === 0;
	$: disableCreateCard = newCardTranslation.length === 0 || newCardWord.length === 0;

	$: inviteCodeEmpty = inviteCodeValue.length === 0;
</script>

<div class="h-[calc(100vh-224px)]">
	<div class="flex space-x-10 h-full">
		<div class="float-right flex-grow p-4 card bg-base-200 w-full space-y-3">
			<div class="flex flex-row justify-between">
				<div class="px-4 bg-base-200 w-fit rounded-xl">
					<div class="text-sm breadcrumbs max-w-lg">
						<ul>
							{#each path as folder, index}
								<li>
									<button
										on:click={async () => {
											await onFolderClick(folder.id);
										}}
										on:drop={(e) => {
											moveItemHere(e, folder.id);
										}}
										ondragover="return false"
										class="flex flex-nowrap hover:bg-base-300 bg-opacity-50 rounded-full p-2"
									>
										{#if index === 0}
											<HomeIcon />
										{:else}
											<FolderIcon />
										{/if}
										{folder.title}
									</button>
								</li>
							{/each}

							<li>
								{#if isNewFolder}
									<div class="flex flex-row space-x-2 items-center">
										<input
											type="text"
											placeholder="Имя папки"
											bind:value={newFolderTitle}
											class:input-error={newFolderEmpty}
											class="input input-bordered input-xs w-full max-w-xs"
										/>

										<button class="btn btn-sm btn-primary" on:click={createFolder}>Создать</button>
									</div>
								{:else}
									<button
										on:click={() => {
											isNewFolder = true;
										}}
										class="flex flex-nowrap hover:bg-base-300 bg-opacity-50 rounded-full p-2"
									>
										<CreateFolderIcon />Создать папку
									</button>
								{/if}
							</li>
						</ul>
					</div>
				</div>
				<div>
					<button
						class="btn btn-outline btn-primary"
						on:click={() => {
							// @ts-ignore
							document.getElementById('my_modal_1')?.showModal();
						}}
						>Вставить слова <DownloadIcon />
					</button>
					<dialog id="my_modal_1" class="modal">
						<div class="modal-box flex flex-col space-y-4">
							<input
								bind:value={inviteCodeValue}
								class="input input-bordered w-full"
								class:input-error={inviteCodeEmpty}
								type="text"
								placeholder="Код папки..."
							/>
							<div class="flex w-full justify-center">
								<button class="btn btn-primary" on:click={pasteFolderItems}>Вставить</button>
							</div>
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
					<button class="btn btn-secondary" on:click={copyFolderCode}
						>Скопировать код <CopyIcon /></button
					>
				</div>
			</div>

			<div class="h-full bg-base-100 rounded-xl overflow-y-auto p-3 space-y-1">
				<div class="flex flex-wrap">
					{#if items.length > 0}
						{#each items as item}
							{#if item.Card}
								<WordCard
									id={item.Card.id}
									word={item.Card.word}
									translation={item.Card.translation}
								/>
							{/if}
							{#if item.Group}
								<button
									on:click={async () => {
										await onFolderClick(item.Group?.id);
									}}
								>
									<FolderCard
										on:removeItem={onRemoveItem}
										id={item.Group.id}
										title={item.Group.title}
									/>
								</button>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
			<a class="w-full btn btn-primary" href="/game/{selectedFolderId}">Учить эту группу</a>
		</div>
		<div class="w-1/3 flex flex-col space-y-10">
			<div class="flex flex-col space-y-7 w-full">
				<div class="flex flex-col float-left h-fit card space-y-3 w-full bg-base-200 p-5">
					<p class="font-bold capitalize">Новая карточка</p>
					<input
						bind:value={newCardWord}
						type="text"
						placeholder="Слово"
						class="input input-bordered w-full"
					/>
					<input
						bind:value={newCardTranslation}
						type="text"
						placeholder="Перевод"
						class="input input-bordered w-full"
					/>
					<button
						class:btn-disabled={disableCreateCard}
						class="btn btn-primary w-fit self-end"
						on:click={createCard}>Создать</button
					>
				</div>
			</div>

			<div class="flex flex-col space-y-7 w-full h-full">
				<div class="flex flex-col card w-full bg-base-200">
					<div
						class="h-full border-dashed m-10 border rounded-xl"
						on:drop={deleteItemDrop}
						role="dialog"
						id="trash-zone"
						ondragover="return false"
					>
						<div class="h-64 flex justify-center items-center opacity-15">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-32 h-32"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
