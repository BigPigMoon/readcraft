<script lang="ts">
	import { goto } from '$app/navigation';
	import { setLastLesson } from '$lib/store/lesson';
	import SecretImage from '../common/SecretImage.svelte';

	export let id: number;
	export let title: string;
	export let imageUrl: string | undefined;
	export let description: string | undefined | null;

	const readCourse = () => {
		setLastLesson(id);
		goto(`/lessons/reader/${id}`);
	};
</script>

<div class="carousel-item">
	<div class="card w-72 bg-neutral">
		<figure>
			<SecretImage cls="w-full" imageId={imageUrl} />
		</figure>
		<div class="card-body">
			<h2 class="card-title text-neutral-content">{title}</h2>
			<p class="text-neutral-content">{@html description?.replace(/\n/g, '<br>') || ''}</p>
			<div class="card-actions justify-end">
				<button on:click={readCourse} class="btn btn-primary">Читать</button>
			</div>
		</div>
	</div>
</div>
