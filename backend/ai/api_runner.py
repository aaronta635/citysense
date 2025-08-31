import sys, json
import pandas as pd
from data_loader import load_feedback
from ai_pipeline import classify_feedback, cluster_and_autolabel
from analyzer import generate_daily_newsfeed_smart

if __name__ == "__main__":
    try:
        raw = sys.stdin.read()
        print(f"Received data length: {len(raw)}", file=sys.stderr)
        
        payload = json.loads(raw)
        print(f"Payload keys: {list(payload.keys())}", file=sys.stderr)
        
        moods = payload.get("moods", [])
        print(f"Number of moods: {len(moods)}", file=sys.stderr)

        if moods:
            df = pd.DataFrame(moods)
            print(f"DataFrame shape: {df.shape}", file=sys.stderr)
        else:
            df = load_feedback("synthetic_feedback.csv")

        df = classify_feedback(df)
        print("Feedback classified successfully", file=sys.stderr)
        
        print("Starting clustering...", file=sys.stderr)
        df = cluster_and_autolabel(df, 3)
        print("Clustering completed", file=sys.stderr)

        print("Calculating complaints and positives...", file=sys.stderr)
        complaints = df[df["sentiment"] == "NEGATIVE"]["topic"].value_counts().to_dict()
        positives = df[df["sentiment"] == "POSITIVE"]["topic"].value_counts().to_dict()
        print(f"Complaints: {complaints}", file=sys.stderr)
        print(f"Positives: {positives}", file=sys.stderr)

        print("Starting newsfeed generation...", file=sys.stderr)
        newsfeed_lines = []
        for i, (_, row) in enumerate(df.iterrows()):
            print(f"Processing row {i+1}/{len(df)}", file=sys.stderr)
            # Get weather and air data for this suburb
            suburb = row.get("district", "Unknown")
            weather = payload.get("weather", {}).get(suburb, {})
            air = payload.get("pollution", {}).get(suburb, {})
            
            try:
                line = generate_daily_newsfeed_smart(
                    pd.DataFrame([row]),
                    weather,
                    air,
                    1
                )
                newsfeed_lines.append(line)
            except Exception as e:
                print(f"Error processing row: {e}", file=sys.stderr)
                newsfeed_lines.append(f"⚠️ Error processing data for {suburb}")

        result = {
            "complaints": complaints,
            "positives": positives,
            "newsfeed": newsfeed_lines
        }

        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error in main processing: {e}", file=sys.stderr)
        error_result = {
            "complaints": {},
            "positives": {},
            "newsfeed": [f"⚠️ Error: {str(e)}"],
            "error": str(e)
        }
        print(json.dumps(error_result))
