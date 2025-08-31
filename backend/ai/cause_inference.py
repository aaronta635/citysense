# ai/cause_inference.py
import re
from transformers import pipeline

# Reuse a lightweight NLI model for zero-shot multi-label cause tagging
_zs = pipeline("zero-shot-classification",
               model="facebook/bart-large-mnli",
               device=-1)

# Causes we want to detect from text
CAUSE_LABELS = [
    "weather: rain",
    "weather: heat",
    "weather: cold",
    "weather: storm",
    "air quality: pollution",
    "accident",
    "operational delay",
    "infrastructure failure",
]

def _pm_read(air: dict):
    # your Node returns either pm25 or pm2_5; handle both
    pm = air.get("pm25")
    if pm is None:
        pm = air.get("pm2_5")
    return pm

def _pm_category(pm):
    if pm is None: return None
    # simple US EPA-style bins (approx)
    if pm <= 12: return "Good"
    if pm <= 35: return "Moderate"
    if pm <= 55: return "Unhealthy (Sensitive)"
    return "Unhealthy"

def infer_cause_tags(message: str, threshold: float = 0.45) -> dict:
    """Zero-shot multi-label cause tagging from message text."""
    res = _zs(message, CAUSE_LABELS, multi_label=True)
    scores = dict(zip(res["labels"], res["scores"]))
    # keep only confident tags
    return {k: v for k, v in scores.items() if v >= threshold}

def build_environment_context(message: str, district: str, tags: dict, weather: dict, air: dict) -> str:
    """Validate text-inferred causes against actual weather/air and build a short context."""
    parts = []

    is_rain = bool(weather.get("is_rain"))
    temp = weather.get("temperature")
    desc = weather.get("description") or weather.get("main")

    pm = _pm_read(air)
    pm_cat = air.get("pm25_category") or _pm_category(pm)

    # If text suggests rain AND it actually rained -> add weather context
    if any(t.startswith("weather: rain") for t in tags) and is_rain:
        if temp is not None:
            parts.append(f"rain in {district} ({int(round(temp))}°C)")
        else:
            parts.append(f"rain in {district}")

    # Heat / cold hints validated by temperature when available
    if any(t.startswith("weather: heat") for t in tags) and (temp is not None and temp >= 28):
        parts.append(f"hot conditions ({int(round(temp))}°C)")
    if any(t.startswith("weather: cold") for t in tags) and (temp is not None and temp <= 10):
        parts.append(f"cold conditions ({int(round(temp))}°C)")

    # If text hints pollution AND PM2.5 is actually elevated -> add AQI context
    if any("air quality" in t for t in tags) and (pm is not None and pm >= 35):
        if pm_cat:
            parts.append(f"poor air ({pm_cat}, PM2.5={pm:.0f})")
        else:
            parts.append(f"poor air (PM2.5={pm:.0f})")

    # Fallback: if message literally mentions weather words, add a neutral weather line
    if not parts and re.search(r"\brain|storm|fog|heat|cold|snow\b", message.lower()):
        if desc and temp is not None:
            parts.append(f"{desc.lower()} ({int(round(temp))}°C)")
        elif desc:
            parts.append(desc.lower())

    return (" Context: " + " and ".join(parts) + ".") if parts else ""
