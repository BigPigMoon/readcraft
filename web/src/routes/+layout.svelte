<script lang="ts">
	import '../app.css';

	import { clearTokens, getTokens } from '$lib/store/tokens';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ExitIcon from '$lib/Icons/ExitIcon.svelte';
	import rcApi from '$lib/http/rc';

	$: if (
		browser &&
		!getTokens() &&
		$page.url.pathname !== '/signin' &&
		$page.url.pathname !== '/signup'
	) {
		goto('/signin');
	}

	const handleLogoutButton = () => {
		rcApi.post('/api/auth/logout');
		clearTokens();
		localStorage.setItem('selectedFolder', '');
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
								<li><a href="/translator">Переводчик</a></li>
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
							<li><a href="/translator">Переводчик</a></li>
							<li><a href="/courses">Курсы</a></li>
						</ul>
					</div>
					<div class="navbar-end flex flex-row space-x-7">
						<div class="flex justify-center items-center w-8 h-8">
							<label class="swap swap-rotate">
								<!-- this hidden checkbox controls the state -->
								<input type="checkbox" class="theme-controller" value="dim" />

								<!-- sun icon -->
								<svg
									class="swap-off fill-current w-full h-full"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									><path
										d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
									/></svg
								>

								<!-- moon icon -->
								<svg
									class="swap-on fill-current w-full h-full"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									><path
										d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
									/></svg
								>
							</label>
						</div>
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
