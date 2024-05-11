<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DownloadIcon from '$lib/Icons/DownloadIcon.svelte';
	import TrashIcon from '$lib/Icons/TrashIcon.svelte';
	import Loading from '$lib/components/common/Loading.svelte';
	import rcApi from '$lib/http/rc';
	import { RC_API } from '$lib/http';
	import { languageNames } from '$lib/languages';
	import type { Book } from '$lib/types/book';
	import { onMount } from 'svelte';

	const bookId = $page.params.slug;
	let book: Book;
	let loading = false;

	onMount(async () => {
		loading = true;

		try {
			const res = await rcApi.get<Book>(`/api/book/get/${bookId}`);

			book = res.data;
		} catch (err) {
		} finally {
			loading = false;
		}
	});

	const downloadBook = () => {
		rcApi
			.get(`/api/book/download/${bookId}`, {
				responseType: 'blob'
			})
			.then((response) => {
				const downloadUrl = URL.createObjectURL(response.data);

				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = book.title + '.epub';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			});
	};

	const deleteBook = () => {
		rcApi.delete(`/api/book/delete/${bookId}`).then((res) => {
			goto('/library');
		});
	};
</script>

<div class="flex w-full justify-center h-[calc(100vh-224px)]">
	<div class="card card-side w-full h-full bg-base-200">
		{#if loading}
			<Loading />
		{:else if book}
			<figure>
				<img class="h-full max-w-5xl" src="{RC_API}/api/image/{book.cover_path}" alt="witcher" />
			</figure>
			<div class="card-body w-fit">
				<div class="h-full space-y-4 flex-col">
					<h2 class="card-title font-bold text-2xl">
						{#if book.author}
							{book.author},
						{/if}
						{book.title}
					</h2>
					<p>
						<span class="font-bold">Язык: </span>{languageNames[book.language]}
					</p>
					<div class="flex items-center space-x-3 max-w-md">
						<p class="font-bold">Прогресс:</p>
						<progress
							class="progress flex-grow"
							class:progress-error={book.progress <= 25}
							class:progress-info={book.progress > 25 && book.progress <= 75}
							class:progress-success={book.progress > 75}
							value={book.progress}
							max="100"
						/>
						<span class="text-base-content font-semibold">{book.progress}%</span>
					</div>
					{#if book.subject}
						<textarea class="resize-none h-64 textarea w-full" readonly>{book.subject}</textarea>
					{/if}
				</div>
				<div class="card-actions">
					<div class="flex-1 flex space-x-3">
						<button on:click={downloadBook} class="btn btn-primary">
							<DownloadIcon /> Скачать
						</button>
						<button on:click={deleteBook} class="btn btn-secondary btn-outline">
							<TrashIcon /> Удалить
						</button>
					</div>
					<a href="/library/{bookId}/reader" class="btn btn-primary">Читать</a>
				</div>
			</div>
		{/if}
	</div>
</div>
