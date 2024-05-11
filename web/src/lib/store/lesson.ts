const LAST_LESSON_ID = 'lastLessonId'

export const getLastLesson = (): string | null => {
    return localStorage.getItem(LAST_LESSON_ID);
}

export const setLastLesson = (id: number) => {
    localStorage.setItem(LAST_LESSON_ID, id.toString());
}