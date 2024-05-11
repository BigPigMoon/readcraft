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

	let items: (Folder | Card)[] = [];
	let selectedFolderId: number;
	let path: Folder[] = [];

	let isNewFolder = false;
	let newFolderTitle = '';

	let newCardWord = '';
	let newCardTranslation = '';

	let inviteCodeValue = '';

	onMount(async () => {
		let folderId: number;

		// FIXME:
		let storedFolderId = localStorage.getItem('selectedFolder');
		if (!storedFolderId) {
			folderId = (await rcApi.get<Folder>('/api/folder/root')).data.id;
		} else {
			folderId = parseInt(storedFolderId);
		}

		await selectFolder(folderId);
	});

	const createCard = async () => {
		const createWordRes = await rcApi.post('/api/card', {
			word: newCardWord,
			translation: newCardTranslation,
			folderId: selectedFolderId
		});

		let newCard: Card = createWordRes.data;

		newCardTranslation = '';
		newCardWord = '';

		items = [...items, newCard];
	};

	const createFolder = async () => {
		if (newFolderEmpty) return;

		const createFolderRes = await rcApi.post('/api/folder', {
			title: newFolderTitle,
			folderId: selectedFolderId
		});

		let newFolder: Folder = createFolderRes.data;

		newFolderTitle = '';

		items = [newFolder, ...items];

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

		let itemsRes;
		try {
			itemsRes = await rcApi.get<Item>(`/api/folder/items/${selectedFolderId}`);
		} catch (err) {
			if (err.response.status === 404) {
				console.error('selected folder not found');
				selectedFolderId = (await rcApi.get<Folder>('/api/folder/root')).data.id;
				itemsRes = await rcApi.get<Item>(`/api/folder/items/${selectedFolderId}`);
				localStorage.setItem('selectedFolder', selectedFolderId.toString());
			}
		}

		items = [];
		if (itemsRes) {
			const getItemsRes = itemsRes.data;
			if (getItemsRes.folders) {
				items = [...getItemsRes.folders, ...items];
			}
			if (getItemsRes.cards) {
				items = [...items, ...getItemsRes.cards];
			}

			path = (await rcApi.get<Folder[]>(`/api/folder/path/${selectedFolderId}`)).data;
		}
	};

	const onRemoveItem = (event: any) => {
		const { id, type } = event.detail;

		removeItem(id, type);
	};

	const removeItem = (id: number, type: string) => {
		if (type === 'card') {
			items = items.filter((item) => {
				return !(isCard(item) && item.id === id);
			});
		} else if (type === 'folder') {
			items = items.filter((item) => {
				return !(isFolder(item) && item.id === id);
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
			await rcApi.delete(`/api/card/${id}`);

			items = items.filter((item) => {
				return !(isCard(item) && item.id === id);
			});
		} else if (item.type === 'folder') {
			await rcApi.delete(`/api/folder/${id}`);
			items = items.filter((item) => {
				return !(isFolder(item) && item.id === id);
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
			await rcApi.put('/api/card', {
				id: item.id,
				word: item.word,
				translation: item.translation,
				folderId: id
			});
			removeItem(item.id, 'card');
		} else if (item.type === 'folder') {
			if (id === item.id) return;

			await rcApi.put('/api/folder', {
				id: item.id,
				title: item.title,
				folderId: id
			});

			removeItem(item.id, 'folder');
		}
	};

	const copyFolderCode = () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.value = path.slice(-1)[0].inviteCode;
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
		alert('Код скопирован в буфер обмена!');
	};

	const pasteFolderItems = () => {
		if (inviteCodeEmpty) return;

		rcApi
			.post('/api/folder/copy', {
				inviteCode: inviteCodeValue,
				parentId: selectedFolderId
			})
			.then((res) => {
				location.reload();
			});
	};

	const isCard = (item: any) => {
		return 'word' in item && 'translation' in item;
	};

	const isFolder = (item: any) => {
		return 'title' in item && 'inviteCode' in item;
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
							{#if isCard(item)}
								<WordCard id={item.id} word={item.word} translation={item.translation} />
							{/if}
							{#if isFolder(item)}
								<button
									on:click={async () => {
										await onFolderClick(item.id);
									}}
								>
									<FolderCard on:removeItem={onRemoveItem} id={item.id} title={item.title} />
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
