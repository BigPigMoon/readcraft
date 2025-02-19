<script lang="ts">
	import { onMount } from 'svelte';
	import type { WordData } from '$lib/types/wordData';
	import type { Folder, TreeNode as TreeNodeType } from '$lib/types/card';
	import TreeNode from '../card/TreeNode.svelte';
	import rcApi from '$lib/http/rc';
	import transApi from '$lib/http/translator';

	export let selected: string;
	export let src: string;

	let createCardWord = '';
	let createCardTranslation = '';
	let createSelectedFolder: Folder;

	let word: WordData;
	let words: WordData[];
	let loading = false;

	let tree: TreeNodeType;

	onMount(async () => {
		await translate();

		const treeRes = await rcApi.get<TreeNodeType>('/api/folder/tree');
		tree = treeRes.data;

		createSelectedFolder = tree.root;

		console.log(tree);
	});

	const translate = async () => {
		loading = true;

		if (selected.length !== 0) {
			const res = await transApi.get<WordData[]>(
				`/translate?query=${selected.trim()}&src=${src.toLowerCase()}&dst=ru`
			);

			words = res.data;
			console.log(words);
			loading = false;
		}
	};

	const createCard = async () => {
		await rcApi.post('/api/card/create', {
			word: createCardWord,
			translation: createCardTranslation,
			group_id: createSelectedFolder.id
		});

		// @ts-ignore
		document.getElementById('my_modal_1')?.close();

		createCardWord = '';
		createCardTranslation = '';
		createSelectedFolder = tree.root;
	};

	const selectFolder = (event: any) => {
		const folder: Folder = event.detail;

		createSelectedFolder = folder;
	};
</script>

{#if (!loading && word && word.length !== 0) || words}
	<div class="card-body">
		{#if word && word.length !== 0}
			<h2 class="card-title">{selected}</h2>
			{#each word as variant}
				<p class="font-bold">{variant.text}</p>
				<div class="flex flex-wrap space-x-1">
					{#each variant.translations as translated, index}
						<span
							>{translated.text}{#if index !== variant.translations.length - 1},{/if}</span
						>
					{/each}
				</div>
			{/each}
			<button
				on:click={() => {
					// @ts-ignore
					document.getElementById('my_modal_1')?.showModal();
				}}
				class="btn btn-primary">Создать карточку</button
			>
			<dialog id="my_modal_1" class="modal">
				<div class="modal-box flex flex-col w-full space-y-4">
					<input
						type="text"
						class="input input-bordered"
						placeholder="Cлово..."
						bind:value={createCardWord}
					/>
					<input
						type="text"
						class="input input-bordered"
						placeholder="Перевод..."
						bind:value={createCardTranslation}
					/>

					<select class="select select-bordered w-full" bind:value={createCardTranslation}>
						<option disabled selected={true}>Предпологаемый перевод</option>
						{#each word as variant}
							{#each variant.translations as translation}
								<option>{translation.text}</option>
							{/each}
						{/each}
					</select>
					{#if tree}
						<input class="input input-bordered" bind:value={createSelectedFolder.title} readonly />

						<ul class="menu bg-base-200 rounded-box">
							<TreeNode on:selectFolder={selectFolder} node={tree} />
						</ul>
					{/if}

					<button on:click={createCard} class="btn btn-primary">Создать</button>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		{/if}

		{#if words}
			<h2 class="card-title">{selected}</h2>
			<div class="flex flex-wrap space-x-1">
				<span class="mr-1 text-md">{words.translation}</span>
			</div>
		{/if}
	</div>
{/if}
