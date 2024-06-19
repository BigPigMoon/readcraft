<script lang="ts">
	import rcApi from '$lib/http/rc';
	import { languageNames } from '$lib/languages';
	import { onMount } from 'svelte';
	import WorldIcon from '$lib/Icons/WorldIcon.svelte';
	import SoundIcon from '$lib/Icons/SoundIcon.svelte';
	import CopyIcon from '$lib/Icons/CopyIcon.svelte';
	import StopIcon from '$lib/Icons/StopIcon.svelte';
	import SwapIcon from '$lib/Icons/SwapIcon.svelte';
	import type { TransData } from '$lib/types/transData';
	import lodash from 'lodash'; // Импортируем функцию дебаунса из lodash
	import transApi from '$lib/http/translator';

	let languages: string[] = [];
	let srcLanguages: string[] = [];
	let loading = false;

	let srcLang = 'none';
	let dstLang = 'RU';
	let srcText: string | undefined;
	let dstText: string | undefined;

	let srcAudio: HTMLAudioElement | null;
	let dstAudio: HTMLAudioElement | null;
	let srcIsPlaying = false;
	let dstIsPlaying = false;

	let detectedLang: string;
	let detectRes: any;

	onMount(async () => {
		loading = true;

		try {
			languages = (await rcApi.get<string[]>('/api/language')).data;
			srcLanguages = languages.filter((val) => val !== 'RU');
		} catch (err) {
		} finally {
			loading = false;
		}
	});

	const translateText = async () => {
		srcAudio = null;
		dstAudio = null;

		if (srcText === undefined || srcText.length === 0) return;
		else {
			let src = srcLang;

			if (src === 'none') {
				detectRes = await transApi.get<string>(`/detect?query=${srcText}`);

				src = detectRes.data;
			}

			if (src.toLocaleLowerCase() !== dstLang.toLocaleLowerCase()) {
				const translateRes = await transApi.get<TransData>(
					`/translate?query=${srcText}&src=${src.toLowerCase()}&dst=${dstLang.toLocaleLowerCase()}`
				);
				dstText = translateRes.data.translation;
			} else {
				dstText = srcText;
			}
		}
	};

	const onTextareaInput = (event) => {
		resizeTextArea(event);
	};

	const swap = async () => {
		if (srcLang === 'none') {
			if (detectedLang && detectedLang !== 'null') {
				srcLang = dstLang;
				dstLang = detectedLang.toUpperCase();
			}
		} else {
			const tempLang = srcLang;
			srcLang = dstLang;
			dstLang = tempLang;
		}

		const tempText = srcText;
		srcText = dstText;
		dstText = tempText;

		const tempAudio = srcAudio;
		srcAudio = dstAudio;
		dstAudio = tempAudio;
	};

	const textToSpeech = async (text: string): Promise<HTMLAudioElement | undefined> => {
		try {
			const audioRes = await transApi.get(`/text-to-speech?text=${text}`, {
				responseType: 'blob'
			});

			const blob = await audioRes.data;
			const audioUrl = URL.createObjectURL(blob);
			return new Audio(audioUrl);
		} catch {
			console.error('could not read audio');
		}
	};

	async function toggleAudio(variant: string) {
		if (variant === 'src') {
			if (srcIsPlaying || dstIsPlaying) {
				if (srcAudio) {
					srcAudio.pause();
					srcAudio.currentTime = 0;
					srcIsPlaying = false;
				}
				if (dstAudio) {
					dstAudio.pause();
					dstAudio.currentTime = 0;
					dstIsPlaying = false;
				}
			} else {
				if (srcText !== undefined) {
					if (!srcAudio) {
						srcAudio = await textToSpeech(srcText);
						srcAudio.onended = () => {
							srcIsPlaying = false;
						};
					}
					srcAudio.play();
					srcIsPlaying = true;
				}
			}
		} else if (variant === 'dst') {
			if (srcIsPlaying || dstIsPlaying) {
				if (srcAudio) {
					srcAudio.pause();
					srcAudio.currentTime = 0;
					srcIsPlaying = false;
				}
				if (dstAudio) {
					dstAudio.pause();
					dstAudio.currentTime = 0;
					dstIsPlaying = false;
				}
			} else {
				if (dstText !== undefined) {
					if (!dstAudio) {
						dstAudio = await textToSpeech(dstText);
						if (!dstAudio) return;
						dstAudio.onended = () => {
							dstIsPlaying = false;
						};
					}
					dstAudio.play();
					dstIsPlaying = true;
				}
			}
		}
	}

	const resizeTextArea = (event) => {
		const textarea = event.target;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight + 4}px`;

		debouncedSendRequest();
	};

	const debouncedSendRequest = lodash.debounce(translateText, 1500); // 3000 миллисекунд (3 секунды)
	$: {
		if (detectRes && detectRes.data) {
			detectedLang = detectRes.data;
		} else {
			detectedLang = 'none';
		}
	}
</script>

<div class="flex flex-col w-full lg:flex-row">
	<div class="flex flex-col w-full space-y-3 min-h-96 p-5 rounded-box">
		<div class="w-full flex flex-row justify-center items-center">
			<div class="mr-4">
				<WorldIcon />
			</div>
			<select
				class="select select-bordered w-full"
				bind:value={srcLang}
				on:change={async () => await translateText()}
			>
				<option value="none" selected>Определить язык</option>
				{#each languages as code}
					<option value={code}>{languageNames[code]}</option>
				{/each}
			</select>
			<button
				on:click={() => navigator.clipboard.writeText(srcText)}
				class="btn btn-circle btn-ghost"
			>
				<CopyIcon />
			</button>
			<button class="btn btn-circle btn-ghost" on:click={async () => await toggleAudio('src')}>
				{#if srcIsPlaying}
					<StopIcon />
				{:else}
					<SoundIcon />
				{/if}
			</button>
		</div>
		<textarea
			on:input={onTextareaInput}
			class="resize-none textarea textarea-bordered w-full min-h-64"
			bind:value={srcText}
		/>
		{#if detectedLang && detectedLang !== 'none' && srcLang === 'none'}
			<div class="text-sm">
				Язык тектса: <span class="text-secondary">
					{languageNames[detectedLang.toUpperCase()]}
				</span>
			</div>
		{/if}
	</div>
	<div class="divider lg:divider-horizontal">
		<button class="btn btn-square btn-ghost" on:click={swap}>
			<SwapIcon />
		</button>
	</div>
	<div class="flex flex-col space-y-3 w-full min-h-96 p-5 rounded-box">
		<div class="w-full flex flex-row justify-center items-center">
			<button
				on:click={() => navigator.clipboard.writeText(dstText)}
				class="btn btn-circle btn-ghost"
			>
				<CopyIcon />
			</button>
			<button class="btn btn-circle btn-ghost" on:click={async () => await toggleAudio('dst')}>
				{#if dstIsPlaying}
					<StopIcon />
				{:else}
					<SoundIcon />
				{/if}
			</button>
			<select
				class="select select-bordered w-full"
				bind:value={dstLang}
				on:change={async () => await translateText()}
			>
				<option value="RU" selected>Русский</option>
				{#each srcLanguages as code}
					<option value={code}>{languageNames[code]}</option>
				{/each}
			</select>
			<div class="ml-4">
				<WorldIcon />
			</div>
		</div>
		<textarea
			on:input={onTextareaInput}
			class="resize-none textarea textarea-bordered w-full min-h-64"
			bind:value={dstText}
		/>
	</div>
</div>
