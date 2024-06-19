<script lang="ts">
	import rcApi from '$lib/http/rc';
	import { onDestroy, onMount } from 'svelte';

	export let imageId: string | null | undefined;
	export let cls: string;

	let imageUrl = '';

	async function fetchImage() {
		if (imageId === null) {
			return;
		}
		console.log(imageId);
		try {
			const image = await rcApi.get(`/api/image/download/${imageId}`, { responseType: 'blob' });

			const blob = image.data;
			imageUrl = URL.createObjectURL(blob);
		} catch (error) {
			console.error(error.message);
		}
	}

	onMount(fetchImage);

	onDestroy(() => {
		imageUrl = '';
	});
</script>

{#if imageUrl && imageId !== null}
	{#key imageUrl}
		<img class={cls} src={imageUrl} alt="" />
	{/key}
{/if}
