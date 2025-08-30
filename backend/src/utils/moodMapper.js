function mapMoodToAIFormat(moodRecord) {
    if (!moodRecord) return null;

    return {
        district: moodRecord.suburb,
        message: moodRecord.explaination || "",
        timestamp: moodRecord.timestamp || new Date().toISOString(),
    };
}

module.exports = { mapMoodToAIFormat };
