from transformers import MarianMTModel, MarianTokenizer
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import FileResponse
from enum import Enum
from itertools import combinations
from langdetect import detect
from gtts import gTTS
import redis
import uuid
import os
import httpx
import json


app = FastAPI()
r = redis.Redis(host='cache', port=6379, decode_responses=True)
TRANSLATION_SERVICE_URL = "localhost:5001"

# TODO: было бы классно, это забирать с основного API
class Language(str, Enum):
    en = "en"
    ru = "ru"
    de = "de"
    fr = "fr"
    zh = "zh"


def load_model(src, dst):
    try:
        model_name = f"Helsinki-NLP/opus-mt-{src}-{dst}"
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)

        return (tokenizer, model)
    except OSError:
        return None


def preload_models():
    pair_combinations = list(combinations(Language, 2))

    res = {}
    for a, b in pair_combinations:
        res[f"{a.value}-{b.value}"] = load_model(a.value, b.value)
        res[f"{b.value}-{a.value}"] = load_model(b.value, a.value)

    return res


loaded_models = preload_models()


def transltae_text(query, tokenizer, model):
    query_lines = query.split('\n')
    result = ""
    for line in query_lines:
        input_ids = tokenizer(line, return_tensors="pt", padding=True).input_ids
        translated_ids = model.generate(input_ids)
        result += tokenizer.decode(translated_ids[0], skip_special_tokens=True)

    return result


def translate(query: str, src: str, dst: str):
    if src == dst:
        return None
    
    models = loaded_models[f"{src}-{dst}"]

    if models is None:
        to_en_tok, to_en_mod = loaded_models[f"{src}-en"]
        en_text = transltae_text(query, to_en_tok, to_en_mod)
        from_en_tok, from_en_mod = loaded_models[f"en-{dst}"]
        return transltae_text(en_text, from_en_tok, from_en_mod)
    else:
        tokenizer, model = models
        return transltae_text(query, tokenizer, model)


@app.get("/translate")
async def translate_query(query: str = Query(..., title="Query string to translate"),
                         src: Language = Query(..., title="Source language"),
                         dst: Language = Query(..., title="Destination language")):
    translation = translate(query, src.value, dst.value)
    return {"translation": translation}


@app.get("/detect")
async def detect_lang(query: str = Query(..., title="Query string to detect")):
    return detect(query)


audio_folder = "audio"
if not os.path.exists(audio_folder):
    os.makedirs(audio_folder)


@app.get("/text-to-speech/")
async def text_to_speech(text: str = Query(..., title="Text to speech")):
    filename = f"{uuid.uuid4()}.mp3"

    tts = gTTS(text=text, lang=detect(text))
    audio_file = os.path.join(audio_folder, filename)
    tts.save(audio_file)
    
    return FileResponse(audio_file, media_type='audio/mpeg')


# Сохранение результата запроса в Redis
def save_to_redis(query: str, result: str):
    r.set(query, result)

# Получение результата запроса из Redis
def get_from_redis(query: str):
    res = r.get(query)

    if res:
        return json.loads(res)
    return None

# Изменение функции fetch_translations для сохранения результата в Redis
async def fetch_translations(query: str, src: Language, dst: Language) -> str:
    # Сначала проверяем, есть ли результат в Redis
    cached_result = get_from_redis(query)
    if cached_result:
        return cached_result

    # Если результат не найден в Redis, делаем запрос к сервису перевода
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"http://{TRANSLATION_SERVICE_URL}/api/v2/translations",
            params={"query": query, "src": src.value, "dst": dst.value}
        )
        response.raise_for_status()
        translation_result = response.text
        
        # Сохраняем результат в Redis перед возвратом
        save_to_redis(query, translation_result)
        
        return json.loads(translation_result)


@app.get("/word")
async def translate_word(
    query: str = Query(..., title="Query string to translate"),
    src: Language = Query(..., title="Source language"),
    dst: Language = Query(..., title="Destination language")
):
    try:
        return await fetch_translations(query, src, dst)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail="Translation service error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)