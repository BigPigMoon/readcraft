<script lang="ts">
	import { page } from '$app/stores';
	import rcApi from '$lib/http/rc';
	import type { Book } from '$lib/types/book';
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import Translation from '$lib/components/book/Translation.svelte';

	const bookId = $page.params.slug;

	let book: Book;
	let chunk;
	let chunkPage: number;

	let scrollElement;
	let pageWidth = 0;
	let pageNum = 0;
	let nextNeedLoad = false;
	let prevPageCount = 0;

	onMount(() => {
		rcApi.get<Book>(`/api/book/${bookId}`).then((res) => {
			book = res.data;
		});

		rcApi.get<any[]>(`/api/book/page/${bookId}`).then((res) => {
			chunk = setChunkText(res.data.content);
			chunkPage = res.data.chunk;

			scrollElement = document.querySelector('#scrollElement');

			window.addEventListener('resize', () => {
				pageWidth = scrollElement.offsetWidth + 32 * 4;
			});
		});
	});

	const nextPage = () => {
		if (nextNeedLoad) {
			rcApi.post(`/api/book/page/${bookId}?page=${chunkPage + 1}`).then((res) => {
				prevPageCount = pageNum;

				rcApi.get(`/api/book/page/${bookId}`).then((res) => {
					chunk = setChunkText(res.data.content);
					chunkPage = res.data.chunk;
					console.log(chunkPage);

					pageNum = 0;
					const transformValue = `translate3d(-${pageWidth * pageNum}px, 0px, 0px)`;
					scrollElement.style.transform = transformValue;
				});

				nextNeedLoad = false;
			});
		} else {
			pageNum += 1;
			updateTransform();
		}
	};

	const prevPage = () => {
		if (pageNum <= 0) {
			rcApi.post(`/api/book/page/${bookId}?page=${chunkPage - 1}`).then((res) => {
				rcApi.get(`/api/book/page/${bookId}`).then((res) => {
					console.log(res.data);

					chunk = setChunkText(res.data.content);
					chunkPage = res.data.chunk;

					pageNum = prevPageCount;
					const transformValue = `translate3d(-${pageWidth * pageNum}px, 0px, 0px)`;
					scrollElement.style.transform = transformValue;
				});
			});
		} else {
			pageNum -= 1;
			updateTransform();
		}
	};

	const updateTransform = () => {
		const transformValue = `translate3d(-${pageWidth * pageNum}px, 0px, 0px)`;
		scrollElement.style.transform = transformValue;
	};

	const elementOnScreen = () => {
		const elementToCheck = document.getElementById('OutOfBound');

		const rect = elementToCheck.getBoundingClientRect();

		const isVisible =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth);

		if (isVisible) {
			nextNeedLoad = true;
		} else {
			nextNeedLoad = false;
		}
	};

	const setChunkText = (originText: string): string => {
		let regex = /<body[^>]*>([\s\S]*?)<\/body>/i;
		let match = originText.match(regex);

		if (match && match[1]) {
			return match[1];
		} else {
			return originText;
		}
	};

	afterUpdate(() => {
		if (scrollElement) {
			pageWidth = scrollElement.offsetWidth + 32 * 4;

			elementOnScreen();
		}
	});

	let selectedText = '';
	let timeout: any;
	let showCard: boolean = false;

	let cardStyle = {
		top: '32px',
		left: '32px'
	};

	function handleSelection() {
		selectedText = window.getSelection().toString();

		if (selectedText.trim().length === 0) {
			showCard = false;
			return;
		}

		// Если уже есть таймаут, сбросить его
		if (timeout) {
			clearTimeout(timeout);
		}

		// Установить новый таймаут на 1 секунду
		timeout = setTimeout(() => {
			setCardPosition();

			showCard = true;
		}, 400);
	}

	function setCardPosition() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			// Устанавливаем координаты для позиционирования карточки
			cardStyle.top = rect.top + window.scrollY + 'px';
			cardStyle.left = rect.left + window.scrollX + 'px';
		}
	}
</script>

<div class="h-screen w-screen bg-base-300">
	<nav class="flex justify-center w-full">
		<div class="navbar w-5/6 h-20">
			<div class="navbar-start">
				<a class="btn btn-primary" href="/library/{bookId}">
					<svg
						class="h-8 w-8 fill-current"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path>
					</svg>
					Назад
				</a>
			</div>
			{#if book}
				<div class="navbar-center">{book.title}</div>
			{/if}
			<div class="navbar-end"></div>
		</div>
	</nav>

	<div>
		<button
			class="h-full w-24 fixed left-0 flex justify-center items-center transition-opacity opacity-0 hover:opacity-100"
			on:click={prevPage}
		>
			<svg
				class="h-24 w-24 fill-current mb-48"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path>
			</svg>
		</button>
		<button
			class="h-full w-24 fixed right-0 flex justify-center items-center transition-opacity opacity-0 hover:opacity-100"
			on:click={nextPage}
		>
			<svg
				class="h-24 w-24 mb-48 fill-current"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
			</svg>
		</button>
	</div>

	<div class="fixed top-24 bottom-24 left-28 right-28 z-[3]">
		{#if showCard}
			<div
				class="card w-96 bg-base-100 shadow-xl absolute z-10"
				style={`top: ${cardStyle.top}; left: ${cardStyle.left};`}
			>
				<Translation selected={selectedText} src={book.language} />
			</div>
		{/if}

		<div class="overflow-hidden h-full min-w-full prose">
			{#if chunk}
				<div
					class="columns-2 gap-32 h-full"
					style="column-fill: auto;"
					bind:this={scrollElement}
					on:mouseup={handleSelection}
					role="main"
				>
					{@html chunk}
					<div id="OutOfBound"></div>
				</div>
			{/if}
		</div>
	</div>
</div>
