#!/bin/bash

# Script to create sample mood data for 10 Sydney suburbs
# This will populate the Moods table with 1 mood per suburb for simple testing

echo "Creating sample mood data for Sydney suburbs (1 per suburb)..."

# Base URL for the API
BASE_URL="http://localhost:3000/v1/citysense/mood/form"

# Function to submit mood data
submit_mood() {
    local suburb=$1
    local mood=$2
    local reason=$3
    
    echo "Submitting $mood mood for $suburb: $reason"
    
    curl -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"selectedMood\": \"$mood\",
            \"selectedSuburb\": \"$suburb\",
            \"reasonText\": \"$reason\"
        }"
    
    echo -e "\n---"
    sleep 0.5  # Small delay between requests
}

# 1. Sydney CBD - Business district
submit_mood "Sydney" "Happy" "Great weather today, perfect for lunch in the park"

# 2. Bondi - Beach vibes
submit_mood "Bondi" "Happy" "Perfect beach day, waves are amazing"

# 3. Parramatta - Growing area
submit_mood "Parramatta" "Neutral" "Construction everywhere but progress is good"

# 4. Manly - Coastal lifestyle
submit_mood "Manly" "Happy" "Ferry ride was beautiful this morning"

# 5. Chatswood - Asian community hub
submit_mood "Chatswood" "Happy" "Amazing food options, love the diversity"

# 6. Hurstville - Family area
submit_mood "Hurstville" "Happy" "Great schools in the area"

# 7. Blacktown - Western Sydney
submit_mood "Blacktown" "Neutral" "Affordable housing options"

# 8. Randwick - University area
submit_mood "Randwick" "Stressed" "Exam period is overwhelming"

# 9. Auburn - Diverse community
submit_mood "Auburn" "Happy" "Amazing cultural diversity and food"

# 10. Campbelltown - Outer suburb
submit_mood "Campbelltown" "Happy" "Great for families, lots of parks"

echo -e "\n✅ Sample mood data creation completed!"
echo "Total: 10 mood submissions (1 per suburb)"
echo -e "\nYou can now check the combined data endpoint:"
echo "curl http://localhost:3000/v1/citysense/data/combined"
