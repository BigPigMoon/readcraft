<script lang="ts">
	import EditIcon from '$lib/Icons/EditIcon.svelte';
	import TrashIcon from '$lib/Icons/TrashIcon.svelte';
	import rcApi from '$lib/http/rc';
	import { createEventDispatcher } from 'svelte';

	export let id: number;
	export let title: string;
	export let index: number;

	const dispatch = createEventDispatcher();

	const removeLesson = async () => {
		await rcApi.delete(`/api/lesson/delete/${id}`);

		dispatch('remove', id);
	};

	const downLessonOrder = () => {
		dispatch('down', index);
	};

	const upLessonOrder = () => {
		dispatch('up', index);
	};
</script>

<div class="card card-side h-fit bg-neutral">
	<div class="card-body flex-row items-center justify-between space-x-10">
		<div class="flex-grow flex-row flex items-center space-x-4">
			<div class="flex justify-center items-center flex-col">
				<!-- <button class="btn btn-circle btn-ghost btn-sm" on:click={upLessonOrder}>
					<MiniUpArrow />
				</button> -->
				<p class="font-bold text-lg">{index}</p>
				<!-- <button class="btn btn-circle btn-ghost btn-sm" on:click={downLessonOrder}>
					<MiniDownArrow />
				</button> -->
			</div>
			<span class="font-bold text-lg">{title}</span>
		</div>
		<div class="flex flex-row space-x-4 items-center">
			<button class="btn btn-primary btn-outline" on:click={removeLesson}
				><TrashIcon /> Удалить</button
			>
			<div class="flex justify-end w-full space-x-4">
				<a class="btn btn-secondary" href={`/lessons/editor/${id}`}>
					Редактировать текст урока <EditIcon /></a
				>
			</div>
		</div>
	</div>
</div>
