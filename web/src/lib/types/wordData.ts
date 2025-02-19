export type WordData = Variant[];

export interface Variant {
    featured: boolean,
    text: string,
    pos: string | null,
    audio_links: AudioLink[],
    translations: Translation[],
}

export interface AudioLink {
    url: string,
    lang: string,
}

export interface Translation {
    featured: boolean,
    text: String,
    pos: String,
    audioLinks: AudioLink[] | null,
    examples: Example[],
}

export interface Example {
    src: string,
    dst: string,
}

