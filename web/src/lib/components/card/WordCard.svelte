<script lang="ts">
	export let id: number;
	export let word: string;
	export let translation: string;

	const handleDragStart = (event: DragEvent) => {
		event.dataTransfer?.setData(
			'text/plain',
			JSON.stringify({
				id: id,
				type: 'card',
				word,
				translation
			})
		);
	};
</script>

<div
	class="flex flex-row items-center card bg-base-200 py-2 px-5 w-fit h-16 space-x-3 m-1"
	id="card-{id}"
	draggable="true"
	on:dragstart={handleDragStart}
	role="dialog"
>
	<div class="flex flex-col items-start">
		<span class="font-normal text-base-content">{word}</span>
		<span class="font-normal text-base-content/50">{translation}</span>
	</div>
</div>
