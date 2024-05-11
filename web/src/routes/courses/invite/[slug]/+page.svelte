<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import rcApi from '$lib/http/rc';
	import { onMount } from 'svelte';

	const inviteCode = $page.params.slug;

	onMount(async () => {
		try {
			await rcApi.post(`api/course/subscribe/${inviteCode}`);
		} catch (err) {
			console.error(err);
		} finally {
			goto('/courses');
		}
	});
</script>
