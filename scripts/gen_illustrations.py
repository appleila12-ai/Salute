"""Genera il set di illustrazioni TutelApp (stile italiano, palette brand) con Gemini Nano Banana."""
import asyncio
import base64
import os
import sys

from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT = "/app/frontend/assets/images/illustrations"
os.makedirs(OUT, exist_ok=True)

STYLE = (
    "Flat vector illustration, modern minimal editorial style, warm and empathetic mood. "
    "Strict color palette: cerulean blue #2A75D3, dark navy #0B2A48, teal #2F6E82, "
    "soft light blue background #E6F0FB, small warm amber accents #F59E0B, white. "
    "Italian setting and Italian people. Soft rounded shapes, clean composition, generous negative space. "
    "Wide 16:9 horizontal banner composition. "
    "ABSOLUTELY NO text, no words, no letters, no logos, no watermark."
)

SUBJECTS = {
    "home_hero": "A female caregiver warmly holding the hands of an elderly Italian woman seated in an armchair, cozy Italian home interior with a window with wooden shutters and a plant",
    "wizard_diagnosi": "An Italian family doctor handing a medical report to a patient in a small doctor's office, stethoscope around the neck, desk with folder",
    "wizard_lavoro": "A person at an office desk balancing work documents and family: laptop, papers, a framed family photo, clock on the wall",
    "wizard_certificato": "A doctor filling in and stamping an official certificate at a desk, Italian health card (tessera sanitaria) and pen on the table",
    "diritti104": "A stylized balance scale of justice sheltering a family (adult and elderly person) under a protective umbrella, documents floating gently",
    "patronati": "An Italian patronato help desk: a friendly clerk behind a counter assisting an elderly couple with paperwork, folders and desk plant",
    "territorio": "A small Italian town square with arcades (portici) and a bell tower, people helping each other: one pushing a wheelchair, one carrying groceries for an elderly neighbor",
    "trasporti": "A white and orange volunteer ambulance van of Italian Pubblica Assistenza parked in front of an Italian house, two volunteers gently helping a person in a wheelchair aboard",
    "domiciliare": "A home-care nurse measuring the blood pressure of an elderly Italian man sitting on a sofa in his living room, medical bag nearby",
    "fisioterapia": "A physiotherapist helping a patient do gentle rehabilitation exercises with an elastic band in a bright clinic gym",
    "rsa": "A welcoming Italian care residence (RSA) with a small garden, elderly people sitting on a bench and a caring staff member offering tea",
}


async def gen(name: str, subject: str) -> bool:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    for attempt in range(2):
        try:
            chat = LlmChat(
                api_key=api_key,
                session_id=f"tutelapp-illustration-{name}-{attempt}",
                system_message="You are an expert illustrator.",
            )
            chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
                modalities=["image", "text"]
            )
            msg = UserMessage(text=f"{STYLE} Scene: {subject}.")
            _text, images = await chat.send_message_multimodal_response(msg)
            if images:
                data = base64.b64decode(images[0]["data"])
                with open(f"{OUT}/{name}.png", "wb") as f:
                    f.write(data)
                print(f"OK {name} ({len(data)//1024} KB)", flush=True)
                return True
            print(f"NOIMG {name} attempt {attempt}", flush=True)
        except Exception as e:
            print(f"ERR {name} attempt {attempt}: {e}", flush=True)
    return False


async def main():
    only = sys.argv[1:] or list(SUBJECTS.keys())
    ok = 0
    for name in only:
        if await gen(name, SUBJECTS[name]):
            ok += 1
    print(f"DONE {ok}/{len(only)}", flush=True)


asyncio.run(main())
