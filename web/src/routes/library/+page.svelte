<script lang="ts">
	import CloseIcon from '$lib/Icons/CloseIcon.svelte';
	import LoadIcon from '$lib/Icons/LoadIcon.svelte';
	import PickerIcon from '$lib/Icons/PickerIcon.svelte';
	import WorldIcon from '$lib/Icons/WorldIcon.svelte';
	import BookCard from '$lib/components/book/BookCard.svelte';
	import Loading from '$lib/components/common/Loading.svelte';
	import rcApi from '$lib/http/rc';
	import { languageNames } from '$lib/languages';
	import type { Book } from '$lib/types/book';
	import { onMount } from 'svelte';
	import ePub from 'epubjs';

	let books: Book[] = [];
	let loading = false;

	let languages: string[] = [];
	let filterLang: string;
	let filterTime: string;
	let searchString: string = '';

	// create book vars
	let selectedFile: null | File;
	let bookCover: null | File;

	let createTitle: string;
	let createAuthor: string;
	let createSubject: string;
	let createLang: string;

	onMount(async () => {
		loading = true;

		try {
			languages = (await rcApi.get<string[]>('/api/language')).data;
			const res = await rcApi.get<Book[]>('/api/book');

			books = res.data;
		} catch (err) {
		} finally {
			loading = false;
		}
	});

	const createBook = async () => {
		if (selectedFile && bookCover) {
			const formData = new FormData();
			formData.append('file', selectedFile);

			const coverFormData = new FormData();
			coverFormData.append('file', bookCover);

			rcApi.post('/api/image/upload', coverFormData).then((imageRes) => {
				rcApi.post('/api/book/upload', formData).then((bookRes) => {
					if (bookRes.status === 200) {
						rcApi
							.post('/api/book', {
								title: createTitle,
								language: createLang,
								filename: bookRes.data,
								cover_path: imageRes.data,
								author: createAuthor.length > 0 ? createAuthor : null,
								subject: createSubject.length > 0 ? createSubject : null
							})
							.then((res) => {
								location.reload();
							});
					}
				});
			});
		}
	};

	const fileChange = (event) => {
		const file = event.target.files[0];

		if (file && file.type === 'application/epub+zip') {
			selectedFile = file;

			selectedFile?.arrayBuffer().then((val) => {
				const book = ePub();

				book.loaded.metadata.then((val) => {
					createTitle = val.title;
					createAuthor = val.creator;
					createSubject = val.description;
					createLang = val.language;

					createLang = createLang.toUpperCase();
				});

				book.coverUrl().then((url) => {
					fetch(url)
						.then((response) => response.blob())
						.then((blob) => {
							// Создание объекта File
							const coverFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
							console.log('Обложка в формате File:', coverFile);
							bookCover = coverFile;
						})
						.catch((error) => console.error('Ошибка при извлечении обложки:', error));
				});

				book.open(val);
			});
		} else {
			selectedFile = null;
			console.error('Выберите файл в формате EPUB.');
		}
	};

	const coverFileChange = (event) => {
		const file = event.target.files[0];

		if (file && file.type.startsWith('image/')) {
			bookCover = file;
		} else {
			bookCover = null;
			console.error('Выберите файл изоображения.');
		}
	};

	$: filteredBooks = books
		.filter(
			(item) =>
				item.title.toLowerCase().includes(searchString.toLowerCase()) &&
				(!filterLang || filterLang === 'all' || item.language === filterLang)
		)
		.sort(
			filterTime === 'new'
				? (a: Book, b: Book) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				: (b: Book, a: Book) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
		);

	$: createBookError = Boolean(selectedFile);
	$: bookCoverMissing = bookCover === null;
</script>

<div class="flex flex-col space-y-3">
	<div>
		<input
			type="text"
			placeholder="Поиск..."
			class="input input-bordered w-full bg-base-300"
			bind:value={searchString}
		/>
	</div>
	<div class="flex w-full items-center space-x-4 px-10 justify-between">
		<div class="flex flex-1 items-center space-x-8">
			<div class="w-64 flex flex-row items-center">
				<div class="mr-4">
					<WorldIcon />
				</div>
				<select class="select select-bordered w-full max-w-xs" bind:value={filterLang}>
					<option value="all" selected>Все</option>
					{#each languages as code}
						<option value={code}>{languageNames[code]}</option>
					{/each}
				</select>
			</div>
			<div class="w-64 flex flex-row items-center">
				<div class="mr-4">
					<PickerIcon />
				</div>
				<select class="select select-bordered w-full max-w-xs" bind:value={filterTime}>
					<option value="new" selected>Недавние</option>
					<option value="old">Старые</option>
				</select>
			</div>
		</div>
		<button
			class="btn btn-primary"
			on:click={() => {
				// @ts-ignore
				document.getElementById('create_course')?.showModal();
			}}
		>
			<LoadIcon /> Добавить книгу
		</button>
		<dialog id="create_course" class="modal">
			<div class="modal-box">
				<form method="dialog" class="mt-4">
					<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
						<CloseIcon />
					</button>
					<div class="form-control w-full mt-8">
						<input
							accept=".epub"
							on:change={fileChange}
							type="file"
							class="file-input file-input-bordered w-full"
						/>
						{#if selectedFile}
							<div>
								<div class="label">
									<span class="label-text">Имя</span>
								</div>
								<input type="text" class="input input-bordered w-full" bind:value={createTitle} />
							</div>
							<div>
								<div class="label">
									<span class="label-text">Автор</span>
								</div>
								<input type="text" class="input input-bordered w-full" bind:value={createAuthor} />
							</div>
							<div>
								<div class="label">
									<span class="label-text">Обложка</span>
								</div>
								<input
									on:change={coverFileChange}
									type="file"
									class="file-input file-input-bordered w-full"
								/>
								{#if bookCoverMissing}
									<div class="label text-error">
										<span class="label-text-alt">Обложка не была загружена</span>
									</div>
								{/if}
							</div>
							<div>
								<div class="label">
									<span class="label-text">Язык</span>
								</div>
								<select class="select select-bordered w-full" bind:value={createLang}>
									{#each languages as code}
										<option value={code}>{languageNames[code]}</option>
									{/each}
								</select>
							</div>
							<div>
								<div class="label">
									<span class="label-text">Описание</span>
								</div>
								<textarea
									class="textarea textarea-bordered w-full h-32"
									bind:value={createSubject}
								/>
							</div>
						{/if}
					</div>
				</form>
				<button
					class="btn btn-primary mt-12 w-full"
					class:btn-disabled={!createBookError}
					on:click={createBook}
				>
					Создать
				</button>
			</div>
		</dialog>
	</div>
</div>
{#if loading}
	<Loading />
{:else}
	<div class="flex justify-items-center w-full">
		<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredBooks as book}
				<BookCard {book} />
			{/each}
		</div>
	</div>
{/if}
