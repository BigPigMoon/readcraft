<script lang="ts">
	import type { TreeNode } from '$lib/types/card';
	import { createEventDispatcher, onMount } from 'svelte';

	export let node: TreeNode;

	const dispatch = createEventDispatcher();

	const selectFolder = () => {
		console.log('dispatch: ', node.root);
		dispatch('selectFolder', node.root);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li>
	{#if node.children.length > 0}
		<details>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<summary on:click={selectFolder}>{node.root.title}</summary>
			<ul>
				{#each node.children as child}
					<svelte:self on:selectFolder node={child} />
				{/each}
			</ul>
		</details>
	{:else}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<span on:click={selectFolder}>{node.root.title}</span>
	{/if}
</li>
