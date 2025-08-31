from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans

sentiment_model = pipeline("sentiment-analysis", model="distilbert/distilbert-base-uncased-finetuned-sst-2-english", device=-1)
emotion_model = pipeline("text-classification",
                         model="j-hartmann/emotion-english-distilroberta-base",
                         top_k=1, device=-1)
topic_model = pipeline("zero-shot-classification",
                       model="facebook/bart-large-mnli",
                       device=-1)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

CANDIDATE_TOPICS = ["Traffic", "Rent", "Pollution", "Weather", "Environment", "Noise"]
EXTENDED_TOPICS = ["Waste", "Safety", "Animals", "Public Services", "Housing", "Healthcare", "Transport"]

def detect_topic(msg: str, threshold=0.4) -> str:
    result = topic_model(msg, CANDIDATE_TOPICS)
    if result["scores"][0] >= threshold:
        return result["labels"][0]
    return "Misc"

def classify_feedback(df):
    df["sentiment"] = df["message"].apply(lambda x: sentiment_model(x)[0]['label'])

    def get_emotion(text):
        result = emotion_model(text)
        if isinstance(result[0], list):
            return result[0][0]['label']
        return result[0]['label']

    df["emotion"] = df["message"].apply(get_emotion)
    df["topic"] = df["message"].apply(detect_topic)
    return df

def cluster_and_autolabel(df, num_clusters=2):
    misc_df = df[df["topic"] == "Misc"]
    if misc_df.empty:
        return df

    embeddings = embedder.encode(misc_df["message"].tolist(), convert_to_tensor=False)

    kmeans = KMeans(n_clusters=min(num_clusters, len(misc_df)), random_state=42)
    labels = kmeans.fit_predict(embeddings)

    for cluster_id in set(labels):
        cluster_idx = misc_df.index[labels == cluster_id]
        cluster_embs = [embeddings[i] for i, idx in enumerate(misc_df.index) if labels[i] == cluster_id]

        centroid = kmeans.cluster_centers_[cluster_id]

        distances = [((e - centroid) ** 2).sum() for e in cluster_embs]
        best_idx = cluster_idx[distances.index(min(distances))]
        representative_msg = misc_df.loc[best_idx, "message"]

        label_result = topic_model(representative_msg, EXTENDED_TOPICS)
        new_label = label_result["labels"][0]

        df.loc[cluster_idx, "topic"] = new_label

    return df
