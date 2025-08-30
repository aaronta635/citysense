# ai/analyzer.py
import random
import pandas as pd
from cause_inference import infer_cause_tags, build_environment_context

def generate_daily_newsfeed_smart(df, weather: dict, air: dict, top_n: int = 3):
    """
    Pick the top-N (district, topic, sentiment) groups by count.
    For each group, select a representative message and fuse validated weather/air context.
    """
    if df.empty:
        return "No news today."

    grouped = df.groupby(["district", "topic", "sentiment"])
    sizes = grouped.size().sort_values(ascending=False)

    # handle ties: take all ties at the Nth cut, but cap a bit
    if len(sizes) == 0:
        return "No news today."
    cutoff_count = sizes.iloc[min(top_n-1, len(sizes)-1)]
    top_groups = sizes[sizes >= cutoff_count].head(top_n + 3)  # a tiny cap

    lines = []
    for (district, topic, sentiment), count in top_groups.items():
        msgs = grouped.get_group((district, topic, sentiment))["message"].tolist()
        # choose a representative message (most cause tags or random if equal)
        scored = [(m, len(infer_cause_tags(m))) for m in msgs]
        max_sc = max(s for _, s in scored)
        candidates = [m for m, s in scored if s == max_sc]
        rep = random.choice(candidates)

        tags = infer_cause_tags(rep)
        ctx = build_environment_context(rep, district, tags, weather, air)

        prefix = "📰" if sentiment == "NEGATIVE" else "🌟"
        lines.append(f"{prefix} [{sentiment}][{district}][{topic}] {rep} ({count} mentions){ctx}")

        if len(lines) >= top_n:
            break

    return "\n".join(lines) if lines else "No news today."
