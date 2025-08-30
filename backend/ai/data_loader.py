import pandas as pd

def load_feedback(filepath="synthetic_feedback.csv"):
    """Load citizen feedback dataset"""
    df = pd.read_csv(filepath)
    return df
