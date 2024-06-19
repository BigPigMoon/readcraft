<script lang="ts">
	import { page } from '$app/stores';
	import rcApi from '$lib/http/rc';
	import { RC_API } from '$lib/http';
	import { onMount } from 'svelte';

	import snarkdown from 'snarkdown';
	import type { Lesson } from '$lib/types/lesson';
	import SecretImage from '$lib/components/common/SecretImage.svelte';

	const lessonId = $page.params.slug;

	let lessonText: string | undefined;
	let lesson: Lesson;

	onMount(async () => {
		try {
			lesson = (await rcApi.get(`/api/lesson/${lessonId}`)).data;
		} catch (err) {
			console.error(err);
		}
		try {
			lessonText = (await rcApi.get(`/api/lesson/content/${lessonId}`)).data;
		} catch (err) {
			lessonText = 'В данный момент тут пусто :(';
			console.error(err);
		}
	});
</script>

<div class="mx-64 mb-16">
	<div class="prose w-full min-w-full prose-headings:m-0">
		{#if lesson}
			<h1 class="text-center">{lesson.title}</h1>

			<div class="flex justify-center my-0">
				<SecretImage imageId={lesson.coverPath} cls="w-fit" />
			</div>
		{/if}
		{@html snarkdown(lessonText || '')}
	</div>
</div>
<div class="p-8"></div>
