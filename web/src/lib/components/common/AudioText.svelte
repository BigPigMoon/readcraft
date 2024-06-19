<script lang="ts">
	import SoundIcon from '$lib/Icons/SoundIcon.svelte';
	import StopIcon from '$lib/Icons/StopIcon.svelte';
	import transApi from '$lib/http/translator';

	export let textForSpeech: string;
	let isPlaying = false;
	let audio: HTMLAudioElement | null | undefined;

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

	const toggleAudio = async () => {
		console.log(textForSpeech);
		if (isPlaying) {
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
				isPlaying = false;
			}
		} else {
			if (textForSpeech) {
				audio = await textToSpeech(textForSpeech);
				audio!.onended = () => {
					isPlaying = false;
				};
				audio!.play();
				isPlaying = true;
			}
		}
	};
</script>

<button class="btn btn-circle btn-ghost" on:click={async () => await toggleAudio()}>
	{#if isPlaying}
		<StopIcon />
	{:else}
		<SoundIcon />
	{/if}
</button>
