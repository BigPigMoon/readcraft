from transformers import MarianMTModel, MarianTokenizer
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from enum import Enum
from itertools import combinations
from langdetect import detect
from gtts import gTTS
import redis
import uuid
import os
import json


app = FastAPI()
r = redis.Redis(host='cache', port=6379, decode_responses=True)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Укажите ваш домен, с которого приходят запросы
    allow_methods=["*"],  # Укажите разрешенные HTTP методы
    allow_headers=["*"],  # Разрешите любые заголовки
)

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

print('preload models........................')
loaded_models = preload_models()
print('models preloaded')


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
    redis_key = f"{query}:{src}:{dst}"
    translation = translate(query, src.value, dst.value)
    save_to_redis(redis_key, translation)
    return {"translation": translation}


@app.get("/detect")
async def detect_lang(query: str = Query(..., title="Query string to detect")):
    lang = detect(query)
    if lang in ["bg", "mk", "uk"]:
        lang = "ru"
    return lang


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

print('server started')


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)