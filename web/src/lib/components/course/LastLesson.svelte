<script lang="ts">
	import type { Course } from '$lib/types/course';
	import type { Lesson } from '$lib/types/lesson';

	export let loading: boolean;
	export let lesson: Lesson;
	export let courses: Course[];
</script>

<div class="w-fit">
	{#if loading}
		<div></div>
	{:else if lesson !== null && lesson !== undefined}
		<span class="font-bold ml-6">Урок на котором вы остановились</span>
		<div class="card bg-neutral w-fit m-4">
			<div class="card-body">
				<p>{courses.filter((item) => item.id === lesson.courseId)[0].title}</p>
				<p class="card-title">{lesson.title}</p>
				<div class="card-actions justify-end">
					<a class="btn btn-primary" href={`/lessons/reader/${lesson.id}`}>Продолжить</a>
				</div>
			</div>
		</div>
	{/if}
</div>
