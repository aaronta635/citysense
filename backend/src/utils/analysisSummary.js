function summarizeAnalysis(analysis) {
    const globalStats = { complaints: {}, positives: {} };
    const suburbStats = [];
    let combinedNewsfeed = [];

    for (const [suburb, data] of Object.entries(analysis)) {
        let complaintCount = 0;
        let positiveCount = 0;

        for (const [topic, count] of Object.entries(data.complaints || {})) {
            globalStats.complaints[topic] = (globalStats.complaints[topic] || 0) + count;
            complaintCount += count;
        }

        for (const [topic, count] of Object.entries(data.positives || {})) {
            globalStats.positives[topic] = (globalStats.positives[topic] || 0) + count;
            positiveCount += count;
        }

        suburbStats.push({
            suburb,
            complaints: complaintCount,
            positives: positiveCount
        });

        if (data.newsfeed && Array.isArray(data.newsfeed)) {
            combinedNewsfeed = combinedNewsfeed.concat(data.newsfeed.map(line => `[${suburb}] ${line}`));
        }
    }

    return { globalStats, suburbStats, combinedNewsfeed };
}

module.exports = { summarizeAnalysis };