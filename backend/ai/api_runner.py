# ai/api_runner.py
import sys, json
import pandas as pd
from data_loader import load_feedback
from ai_pipeline import classify_feedback, cluster_and_autolabel
from analyzer import generate_daily_newsfeed_smart

def enrich_with_env(df, weather, air):
    df = df.copy()
    df["temp_c"] = weather.get("temperature")
    df["is_rain"] = weather.get("is_rain")
    df["pm25"] = air.get("pm25", air.get("pm2_5"))
    df["pm25_category"] = air.get("pm25_category")
    return df

if __name__ == "__main__":
    raw = sys.stdin.read()
    payload = json.loads(raw)

    weather = payload.get("weather", {})
    air = payload.get("air", {})
    moods = payload.get("moods", [])

    if moods:
        df = pd.DataFrame(moods)
    else:
        df = load_feedback("synthetic_feedback.csv")

    df = classify_feedback(df)                 
    df = cluster_and_autolabel(df, 3)      
    df = enrich_with_env(df, weather, air)

    result = {
        "complaints": df[df["sentiment"] == "NEGATIVE"]["topic"].value_counts().to_dict(),
        "positives":  df[df["sentiment"] == "POSITIVE"]["topic"].value_counts().to_dict(),
        "newsfeed":   generate_daily_newsfeed_smart(df, weather, air, top_n=3).split("\n"),
    }
    print(json.dumps(result))
