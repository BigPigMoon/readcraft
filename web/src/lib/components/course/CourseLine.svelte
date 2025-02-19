<script lang="ts">
	import CopyIcon from '$lib/Icons/CopyIcon.svelte';
	import CourseLesson from './CourseLesson.svelte';
	import EditIcon from '$lib/Icons/EditIcon.svelte';
	import MinusIcon from '$lib/Icons/MinusIcon.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Lesson } from '$lib/types/lesson';
	import rcApi from '$lib/http/rc';
	import TrashIcon from '$lib/Icons/TrashIcon.svelte';

	export let courseTitle: string;
	export let author: boolean = false;
	export let courseId: number;
	export let language: string;

	let dispatch = createEventDispatcher();

	let lessons: Lesson[] = [];

	onMount(() => {
		rcApi.get<Lesson[]>(`/api/lesson?course=${courseId}`).then((res) => {
			lessons = res.data;
		});
	});

	const deleteCourse = () => {
		rcApi.delete(`/api/course/${courseId}`);

		dispatch('remove', courseId);
	};

	const generateInviteCode = async () => {
		const res = await rcApi.get<string>(`api/course/gen/link/${courseId}`);

		return res.data;
	};

	const copyToClipboard = async () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.value = window.location.origin + `/courses/invite/${await generateInviteCode()}`;
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
		alert('Ссылка скопирована в буфер обмена!');
	};

	const unsubscribe = async () => {
		await rcApi.post(`/api/course/unsub/${courseId}`);
		location.reload();
	};
</script>

<div class="w-full p-4 my-7 rounded-box">
	<div class="flex justify-between">
		<div>
			<h1 class="font-bold text-lg justify-start">{courseTitle}</h1>
			<span class="text-sm"><span class="font-bold">Язык курса:</span> {language}</span>
		</div>
		{#if author}
			<div class="flex space-x-4">
				<button class="btn btn-outline btn-primary" on:click={deleteCourse}
					><TrashIcon /> удалить</button
				>
				<a href={`/courses/${courseId}`} class="btn btn-secondary font-bold">
					<span>Редактировать</span>
					<EditIcon />
				</a>
				<button class="btn btn-secondary font-bold" on:click={copyToClipboard}>
					<span>Ссылка</span>
					<CopyIcon />
				</button>
			</div>
		{:else}
			<div>
				<button class="btn btn-error" on:click={unsubscribe}><MinusIcon />Отписаться</button>
			</div>
		{/if}
	</div>
	<div class="carousel carousel-center w-full space-x-5 mt-3">
		{#each lessons as lesson}
			<CourseLesson
				id={lesson.id}
				imageUrl={lesson.coverPath}
				title={lesson.title}
				description={lesson.subject}
			/>
		{/each}
	</div>
</div>
