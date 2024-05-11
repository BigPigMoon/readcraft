<script lang="ts">
	import '../app.css';

	import { clearTokens, getTokens } from '$lib/store/tokens';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ExitIcon from '$lib/Icons/ExitIcon.svelte';

	$: if (
		browser &&
		!getTokens() &&
		$page.url.pathname !== '/signin' &&
		$page.url.pathname !== '/signup'
	) {
		goto('/signin');
	}

	const handleLogoutButton = () => {
		clearTokens();
		goto('/signin');
	};
</script>

<svelte:head>
	<title>ReadCraft Academy</title>
</svelte:head>

{#if $page.url.pathname !== '/signin' && $page.url.pathname !== '/signup' && !/\d\/reader/.test($page.url.pathname)}
	<div class="h-screen overflow-auto">
		<nav>
			<div class="flex items-center justify-center w-full">
				<div class="navbar w-7/12 rounded-xl bg-base-200 m-4">
					<div class="navbar-start">
						<div class="dropdown">
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label tabindex="0" class="btn btn-ghost xl:hidden">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 12h8m-8 6h16"
									/>
								</svg>
							</label>
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<ul
								tabindex="0"
								class="menu menu-sm dropdown-content mt-3 z-[1] p-2 bg-base-100 rounded-box w-52"
							>
								<li><a href="/">Карточки</a></li>
								<li><a href="/library">Библиотека</a></li>
								<li><a href="/courses">Курсы</a></li>
							</ul>
						</div>
						<a href="/" class="btn btn-ghost normal-case text-xl">ReadCraft Academy</a>
					</div>
					<div class="navbar-center hidden xl:flex">
						<!-- make it join-->
						<ul class="menu menu-horizontal px-1 space-x-2">
							<li><a href="/">Карточки</a></li>
							<li><a href="/library">Библиотека</a></li>
							<li><a href="/courses">Курсы</a></li>
						</ul>
					</div>
					<div class="navbar-end">
						<button on:click={handleLogoutButton} class="btn btn-primary">Выход <ExitIcon /></button
						>
					</div>
				</div>
			</div>
		</nav>

		<main class="max-w-7xl container mx-auto pt-5 h-auto">
			<slot />
		</main>
	</div>
{:else}
	<main>
		<slot />
	</main>
{/if}
