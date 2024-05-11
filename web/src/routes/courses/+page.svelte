<script lang="ts">
	import PlusIcon from '$lib/Icons/PlusIcon.svelte';
	import CloseIcon from '$lib/Icons/CloseIcon.svelte';
	import CourseLine from '$lib/components/course/CourseLine.svelte';
	import rcApi from '$lib/http/rc';
	import { onMount } from 'svelte';
	import type { Course } from '$lib/types/course';
	import { languageNames } from '$lib/languages';
	import { getLastLesson } from '$lib/store/lesson';
	import type { Lesson } from '$lib/types/lesson';
	import LastLesson from '$lib/components/course/LastLesson.svelte';

	let loading = false;
	let courses: Array<Course> = [];

	let createCourseTitle: string;
	let createCourseLang: string;

	let filterLang: string;

	let languages: string[] = [];

	let lastLesson: Lesson;

	onMount(async () => {
		loading = true;

		try {
			courses = (await rcApi.get<Course[]>('/api/course/all?subscriptions=true')).data.sort(
				(a, b) => (a.isOwner === b.isOwner ? 0 : a.isOwner ? -1 : 1)
			);
			languages = (await rcApi.get<string[]>('/api/languages/available')).data;

			const lastLessonId = getLastLesson();
			if (lastLessonId) {
				lastLesson = (await rcApi.get<Lesson>(`/api/lesson/get/${lastLessonId}`)).data;
			}
		} catch (err) {
		} finally {
			loading = false;
		}
	});

	const createCouresHandler = async () => {
		if (createCourseError) return;

		const new_course_id = await rcApi.post<number>('/api/course/create', {
			title: createCourseTitle,
			language: createCourseLang
		});

		const newCourse: Course = {
			isOwner: true,
			language: createCourseLang,
			title: createCourseTitle,
			id: new_course_id.data
		};

		courses = [...courses, newCourse].sort((a, b) =>
			a.isOwner === b.isOwner ? 0 : a.isOwner ? -1 : 1
		);

		createCourseTitle = '';

		// @ts-ignore
		document.getElementById('create_course')?.close();

		location.reload();
	};

	const removeItem = (event: any) => {
		const id = event.detail;

		courses = courses.filter((item) => item.id !== id);

		location.reload();
	};

	$: filterCourse = courses.filter(
		(item) => !filterLang || filterLang === 'all' || item.language === filterLang
	);
	$: createCourseError = createCourseTitle?.length === 0 || createCourseLang === null;
</script>

<div class="flex justify-between">
	<LastLesson {loading} lesson={lastLesson} {courses} />
	<div class="w-96 flex flex-col">
		<div class="pr-12 mb-4 font-bold flex w-full justify-end">Язык курса</div>
		<select class="select select-bordered w-full max-w-xs" bind:value={filterLang}>
			<option value="all" selected>Все</option>
			{#each languages as code}
				<option value={code}>{languageNames[code]}</option>
			{/each}
		</select>
	</div>
</div>

<div class="mt-8">
	<button
		class="btn btn-primary"
		on:click={() => {
			// @ts-ignore
			document.getElementById('create_course')?.showModal();
		}}
	>
		<PlusIcon /> Создать новый курс
	</button>
	<dialog id="create_course" class="modal">
		<div class="modal-box">
			<form method="dialog" class="mt-4">
				<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
					<CloseIcon />
				</button>
				<div class="form-control w-full space-y-6">
					<div>
						<div class="label">
							<span class="label-text">Имя курса</span>
						</div>
						<input
							type="text"
							placeholder="Имя курса..."
							class="input input-bordered w-full"
							bind:value={createCourseTitle}
						/>
					</div>
					<div>
						<div class="label">
							<span class="label-text">Язык курса</span>
						</div>
						<select class="select select-bordered w-full" bind:value={createCourseLang}>
							{#each languages as code}
								<option value={code}>{languageNames[code]}</option>
							{/each}
						</select>
					</div>
					{#if createCourseError}
						<span class="label-text-alt text-error">Все поля должны быть заполнены.</span>
					{/if}
				</div>
			</form>
			<button class="btn btn-primary mt-12 w-full" on:click={createCouresHandler}> Создать </button>
		</div>
	</dialog>
</div>

{#if loading}
	<div class="w-full mt-32 flex justify-center items-center">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}

{#each filterCourse as course}
	<CourseLine
		author={course.isOwner}
		courseTitle={course.title}
		courseId={course.id}
		language={languageNames[course.language]}
		on:remove={removeItem}
	/>
{/each}
