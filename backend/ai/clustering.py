from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
import re
from collections import Counter

def auto_discover_topics(df, num_clusters=2):
    misc_df = df[df["topic"] == "Misc"]

    if misc_df.empty:
        return df

    model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
    embeddings = model.encode(misc_df["message"].tolist())

    kmeans = KMeans(n_clusters=num_clusters, random_state=0)
    labels = kmeans.fit_predict(embeddings)

    misc_df = misc_df.copy()
    misc_df["cluster_id"] = labels

    cluster_names = {}
    for cid in set(labels):
        cluster_msgs = " ".join(misc_df[misc_df["cluster_id"] == cid]["message"].tolist())
        words = re.findall(r'\b[a-z]{4,}\b', cluster_msgs.lower())
        if words:
            common_word = Counter(words).most_common(1)[0][0].capitalize()
            cluster_names[cid] = common_word
        else:
            cluster_names[cid] = f"Cluster_{cid}"

    misc_df["topic"] = misc_df["cluster_id"].map(cluster_names)

    df.update(misc_df)
    return df
