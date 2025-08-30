import sys, json
import pandas as pd
from data_loader import load_feedback
from ai_pipeline import classify_feedback, cluster_and_autolabel
from analyzer import generate_daily_newsfeed_smart

if __name__ == "__main__":
    raw = sys.stdin.read()
    payload = json.loads(raw)

    moods = payload.get("moods", [])

    if moods:
        df = pd.DataFrame(moods)
    else:
        df = load_feedback("synthetic_feedback.csv")

    df = classify_feedback(df)
    df = cluster_and_autolabel(df, 3)

    complaints = df[df["sentiment"] == "NEGATIVE"]["topic"].value_counts().to_dict()
    positives  = df[df["sentiment"] == "POSITIVE"]["topic"].value_counts().to_dict()

    newsfeed_lines = []
    for _, row in df.iterrows():
        weather = row.get("weather", {})
        air     = row.get("air", {})
        line = generate_daily_newsfeed_smart(
            pd.DataFrame([row]),
            weather,
            air,
            1
        )
    newsfeed_lines.append(line)



    result = {
        "complaints": complaints,
        "positives": positives,
        "newsfeed": newsfeed_lines
    }

    print(json.dumps(result))
