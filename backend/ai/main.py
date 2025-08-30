from data_loader import load_feedback
from ai_pipeline import classify_feedback, cluster_and_autolabel
from analyzer import generate_daily_newsfeed_smart  

def main():
    weather = {"temperature": 18, "is_rain": True, "description": "Rain"}
    air = {"pm25": 80, "pm25_category": "Unhealthy"}

    df = load_feedback("synthetic_feedback.csv")

    df = classify_feedback(df)

    df = cluster_and_autolabel(df, num_clusters=3)
    df.to_csv("classified_feedback.csv", index=False)
    print("✅ Saved to classified_feedback.csv")
    print(df[["district", "message", "sentiment", "emotion", "topic"]].head())
    print("\n--- Daily Newsfeed ---")
    print(generate_daily_newsfeed_smart(df, weather, air, top_n=3))

if __name__ == "__main__":
    main()
