<script lang="ts">
	import { page } from '$app/stores';
	import rcApi from '$lib/http/rc';
	import { onMount } from 'svelte';
	import type { Card } from '$lib/types/card';
	import ReloadIcon from '$lib/Icons/ReloadIcon.svelte';
	import ExitIcon from '$lib/Icons/ExitIcon.svelte';

	const folderId = $page.params.slug;

	let cards: Card[];
	let learning: Card[];

	let errors: number = 0;

	interface Option {
		word: string;
		isCorrect: boolean;
		isWrong: boolean;
	}

	let currentWord: Card;
	let options: Option[] = [];

	let loading = true;

	let isTryAgain = false;
	let isAnswerGetted = false;

	let isEnd = false;

	onMount(async () => {
		const getAllCards = await rcApi.get<Card[]>(`/api/card/${folderId}`);
		cards = getAllCards.data;
		learning = getAllCards.data;

		shuffleArray(learning);

		reloadGame();

		loading = false;
	});

	const reloadGame = () => {
		if (learning.length === 0) {
			isEnd = true;
			return;
		}

		isAnswerGetted = false;

		currentWord = learning[0];
		learning = learning.filter((card) => {
			return card.id !== currentWord.id;
		});

		options = [
			{
				word: currentWord.translation,
				isCorrect: false,
				isWrong: false
			}
		];

		for (let i = 0; i < 3; i++) {
			const randomCard: Card = getRandomElement(cards);

			let badWord = false;
			for (let index = 0; index < options.length; index++) {
				const element = options[index];

				if (element.word === randomCard.translation) {
					i--;
					badWord = true;
				}
			}

			if (badWord) continue;

			options.push({
				word: randomCard.translation,
				isCorrect: false,
				isWrong: false
			});
		}

		shuffleArray(options);

		isTryAgain = false;

		console.log(Math.floor(((cards.length - learning.length - 1) / cards.length) * 100));
	};

	const shuffleArray = (array: any[]) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			// Обменять элементы array[i] и array[j]
			[array[i], array[j]] = [array[j], array[i]];
		}
	};

	const getRandomElement = (array: any[]) => {
		const randomIndex = Math.floor(Math.random() * array.length);
		return array[randomIndex];
	};

	const getAnswer = async (answer: Option) => {
		if (isAnswerGetted) return;

		isAnswerGetted = true;

		if (answer.word === currentWord.translation) {
			let correctId = options.findIndex((val) => {
				return val === answer;
			});

			options[correctId].isCorrect = true;
			options = options;

			await new Promise((resolve) => setTimeout(resolve, 1500));

			reloadGame();
		} else {
			let wrongId = options.findIndex((val) => {
				return val === answer;
			});
			options[wrongId].isWrong = true;

			let correctId = options.findIndex((val) => {
				return val.word === currentWord.translation;
			});
			options[correctId].isCorrect = true;

			options = options;
			errors++;

			await new Promise((resolve) => setTimeout(resolve, 700));
			learning.push(currentWord);
			isTryAgain = true;
		}
	};

	const getGoodPhrase = () => {
		const phrase = [
			'Не волнуйтесь, вы все еще учитесь!',
			'Не совсем верно, но вы делаете успехи!',
			'Не волнуйтесь, со временем вы все освоите!'
		];

		return getRandomElement(phrase);
	};

	const reloadAllGame = () => {
		isEnd = false;
		learning = cards;
		reloadGame();
	};

	const getCorrectErrorWord = (errors: number) => {
		if (errors !== 11 && errors.toString().slice(-1) === '1') {
			return 'ошибку';
		} else if (errors !== 12 && errors.toString().slice(-1) === '2') {
			return 'ошибки';
		} else {
			return 'ошибок';
		}
	};
</script>

<div class="flex items-center flex-col space-y-6">
	{#if !loading}
		<progress
			class="progress progress-primary w-full"
			value={isEnd ? 100 : Math.round(((cards.length - learning.length - 1) / cards.length) * 100)}
			max="100"
		></progress>

		<div class="card max-w-3xl w-full bg-base-200 flex flex-col p-10">
			{#if !isEnd}
				<div class="flex h-52">
					<h1 class="font-bold text-2xl">{currentWord.word}</h1>
				</div>

				<div class="font-bold mb-5">
					{#if isTryAgain}
						<span class="text-error">{getGoodPhrase()}</span>
					{:else}
						Выберите правильное слово
					{/if}
				</div>

				<div class="grid grid-rows-2 grid-cols-2 gap-8 gap-x-20">
					{#each options as option, index}
						<div class="flex justify-center items-center">
							<button
								class="btn max-w-xs w-full justify-start space-x-8"
								class:btn-success={option.isCorrect}
								class:btn-error={option.isWrong}
								class:btn-outline={!isAnswerGetted}
								class:btn-ghost={!isAnswerGetted}
								disabled={isAnswerGetted && !option.isCorrect && !option.isWrong}
								on:click={() => {
									getAnswer(option);
								}}
							>
								<span>{index + 1}</span>
								<span>{option.word}</span>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<div class="h-96 flex flex-col space-y-4 justify-between">
					<div class="flex flex-col space-y-4">
						<h1 class="font-bold text-3xl">Отлично, вы превосходно справляетесь!</h1>
						<p>Вы выучили эту группу слов!</p>
					</div>
					<div class="flex flex-col w-full justify-center text-center space-y-6 mb-32">
						{#if errors > 0}
							<p>Вы допустили {errors} {getCorrectErrorWord(errors)}.</p>
						{/if}
						<p>Хотите начать сначала?</p>
						<div class="w-full flex justify-center space-x-10">
							<button class="btn btn-accent" on:click={reloadAllGame}><ReloadIcon /> Заново</button>
							<a class="btn btn-primary" href="/">Выбрать другую группу <ExitIcon /></a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
	{#if isTryAgain}
		<button class="btn btn-primary max-w-xl w-full" on:click={reloadGame}>Продолжить</button>
	{/if}
</div>
