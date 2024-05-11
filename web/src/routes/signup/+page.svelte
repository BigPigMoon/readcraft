<script lang="ts">
	import { goto } from '$app/navigation';
	import { RC_API } from '$lib/http';
	import { setTokens } from '$lib/store/tokens';
	import type { Tokens } from '$lib/types/tokens';
	import axios from 'axios';

	let name = '';
	let email = '';
	let password = '';
	let repPassword = '';

	let loading = false;

	$: passwordEquals = password === repPassword;

	const handleRegistration = async () => {
		loading = true;

		axios
			.post<Tokens>(`${RC_API}/api/auth/local/signup`, {
				email,
				password,
				name
			})
			.then((res) => {
				setTokens(res.data);
				loading = false;
				goto('/');
			})
			.catch((err) => {
				console.error(err);
			});
	};
</script>

<div class="hero min-h-screen bg-screen">
	<div class="hero-overlay bg-opacity-60"></div>
	<div class="hero-content w-full h-full">
		<div class="card w-full lg:w-1/3 h-fit bg-base-200">
			<div class="card-title my-10">
				<div class="text-3xl font-bold text-center w-full">Регистрация</div>
			</div>
			<div class="card-body">
				<form class="w-full px-8 space-y-4" on:submit|preventDefault={handleRegistration}>
					<div class="form-control">
						<input
							type="text"
							placeholder="Имя"
							class="input input-bordered"
							required
							bind:value={name}
						/>
					</div>
					<div class="form-control">
						<input
							type="email"
							placeholder="Почта"
							class="input input-bordered"
							required
							bind:value={email}
						/>
					</div>
					<div class="form-control">
						<input
							type="password"
							placeholder="Пароль"
							class="input input-bordered"
							required
							bind:value={password}
						/>
					</div>
					<div class="form-control">
						<input
							type="password"
							placeholder="Повтор пароля"
							class="input input-bordered"
							required
							bind:value={repPassword}
						/>
					</div>
					<div class="flex flex-col mt-2 justify-start items-start">
						{#if name?.length != 0 && name.length < 6}
							<span class="label-text-alt text-error">Слишком короткое имя</span>
						{/if}
						{#if password?.length && password.length < 6}
							<span class="label-text-alt text-error">Слишком короткий пароль</span>
						{/if}
						{#if !passwordEquals}
							<span class="label-text-alt text-error">Пароли не совпадают</span>
						{/if}
					</div>
					<div class="form-control my-6 flex items-center">
						<button type="submit" class="btn btn-primary w-fit">
							{#if loading}
								<span class="loading loading-spinner"></span>
							{:else}
								Зарегистрироваться
							{/if}
						</button>
					</div>
				</form>
			</div>
			<div class="card-actions my-10">
				<div class="w-full flex justify-center mt-4">
					<a href="/signin" class="link link-hover">Авторизация</a>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.bg-screen {
		background-image: url('library-bg.jpg');
		background-size: cover;
		background-position: center;
	}
</style>
