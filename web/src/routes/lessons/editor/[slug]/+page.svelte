<script lang="ts">
	import { page } from '$app/stores';
	import rcApi from '$lib/http/rc';
	import { RC_API } from '$lib/http';
	import { onMount } from 'svelte';

	import snarkdown from 'snarkdown';
	import LoadIcon from '$lib/Icons/LoadIcon.svelte';
	import type { Lesson } from '$lib/types/lesson';
	import SecretImage from '$lib/components/common/SecretImage.svelte';

	const lessonId = $page.params.slug;

	let lessonText: string | undefined;
	let lesson: Lesson;

	let newTitle: string;
	let newSubject: string | undefined;

	let lessonCover: null | File;

	onMount(async () => {
		try {
			lesson = (await rcApi.get(`/api/lesson/${lessonId}`)).data;
			newTitle = lesson.title;
			newSubject = lesson.subject;
			lessonText = (await rcApi.get(`/api/lesson/content/${lessonId}`)).data;
		} catch (err) {
			console.error(err);
		}
	});

	const handleKeyDown = (event: any) => {
		if (event.ctrlKey && (event.key === 's' || event.key === 'ы')) {
			event.preventDefault();
			saveText(); // Здесь вызывайте вашу функцию сохранения
		}
	};

	const saveChanges = async () => {
		console.log(newSubject);

		if (lessonCover) {
			const formData = new FormData();
			formData.append('file', lessonCover);

			lesson.coverPath = (await rcApi.post('/api/image/upload', formData)).data;
		}

		try {
			await rcApi.put('/api/lesson', {
				id: parseInt(lessonId),
				title: newTitle,
				coverPath: lesson.coverPath,
				subject: newSubject
			});

			(lesson.title = newTitle), (lesson.subject = newSubject);
		} catch (err) {
			console.error(err);
		}
	};

	const saveText = async () => {
		await rcApi.post(`api/lesson/content/${lessonId}`, { content: lessonText });

		await saveChanges();

		alert('Изменения сохранены!');
	};

	const fileChange = (event: any) => {
		const file = event.target.files[0];

		if (file && file.type.startsWith('image/')) {
			lessonCover = file;
		} else {
			lessonCover = null;
			console.error('Выберите файл изоображения.');
		}
	};
</script>

<div class="grid grid-cols-2 grid-rows-1 w-full gap-16 h-[calc(100vh-224px)]">
	<div class="h-full flex flex-col space-y-2">
		<input class="input input-bordered font-bold text-lg max-w-full" bind:value={newTitle} />
		<textarea class="textarea textarea-bordered w-full" bind:value={newSubject} />

		<div>
			<input type="file" class="file-input file-input-bordered w-full" on:change={fileChange} />
		</div>

		<textarea
			class="resize-none textarea textarea-bordered w-full h-full"
			bind:value={lessonText}
			on:keydown={handleKeyDown}
		/>
		<button class="btn w-full btn-primary" on:click={saveText}><LoadIcon /> Сохранить</button>
	</div>
	<div class="prose w-full min-w-full h-full prose-headings:m-0 overflow-y-scroll">
		{#if lesson}
			<div class="flex flex-col justify-center my-0 items-center">
				<h1 class="">{newTitle}</h1>
				<figure>
					<SecretImage cls="" imageId={lesson.coverPath} />
				</figure>
			</div>
		{/if}
		{@html snarkdown(lessonText || '')}
	</div>
</div>
