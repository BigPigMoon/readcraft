<script lang="ts">
	import { RC_API } from '$lib/http';
	import type { Book } from '$lib/types/book';

	export let book: Book;
</script>

<a class="group hover:cursor-pointer bg-base-300 card w-72 m-4" href={`/library/${book.id}`}>
	<figure class="rounded-xl m-3 mb-0">
		<img
			src="{RC_API}/api/image/download/{book.cover_path}"
			width="400"
			height="600"
			alt="witcher"
		/>
	</figure>
	<div class="card-body mt-0">
		<h2 class="card-title group-hover:text-primary text-base-content">{book.title}</h2>
		{#if book.author}
			<p class="text-base-content">{book.author}</p>
		{/if}
		<div class="flex w-full items-center space-x-3">
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
	</div>
</a>
