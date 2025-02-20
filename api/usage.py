# Install required libraries (if not already installed)
# !pip install requests pandas numpy matplotlib --quiet

# Import libraries
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import time
import json

# For inline plotting in Jupyter
#%matplotlib inline

# Reusable function for retrieving paginated data from the API
def get_data(url, params):
    # Set up the API key and headers
    OPENAI_ADMIN_KEY = 'PLACEHOLDER'

    headers = {
        "Authorization": f"Bearer {OPENAI_ADMIN_KEY}",
        "Content-Type": "application/json",
    }

    # Initialize an empty list to store all data
    all_data = []

    # Initialize pagination cursor
    page_cursor = None

    # Loop to handle pagination
    while True:
        if page_cursor:
            params["page"] = page_cursor

        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data_json = response.json()
            all_data.extend(data_json.get("data", []))

            page_cursor = data_json.get("next_page")
            if not page_cursor:
                break
        else:
            print(f"Error: {response.status_code}")
            break

    if all_data:
        print("Data retrieved successfully!")
    else:
        print("Issue: No data available to retrieve.")
    return all_data



# Calculate start time: n days ago from now
days_ago = 30
start_time = int(time.time()) - (days_ago * 24 * 60 * 60)

# Define parameters with grouping by model and project_id
params = {
    "start_time": start_time,  # Required: Start time (Unix seconds)
    "bucket_width": "1d",  # Optional: '1m', '1h', or '1d' (default '1d')
    "group_by": ["model", "project_id"],  # Group data by model and project_id
    "limit": 7,  # Optional: Number of buckets to return
}

# Initialize an empty list to store all data
all_group_data = get_data(url, params)

# Initialize a list to hold parsed records
records = []

# Iterate through the data to extract bucketed data
for bucket in all_group_data:
    start_time = bucket.get("start_time")
    end_time = bucket.get("end_time")
    for result in bucket.get("results", []):
        records.append(
            {
                "start_time": start_time,
                "end_time": end_time,
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0),
                "input_cached_tokens": result.get("input_cached_tokens", 0),
                "input_audio_tokens": result.get("input_audio_tokens", 0),
                "output_audio_tokens": result.get("output_audio_tokens", 0),
                "num_model_requests": result.get("num_model_requests", 0),
                "project_id": result.get("project_id", "N/A"),
                "user_id": result.get("user_id", "N/A"),
                "api_key_id": result.get("api_key_id", "N/A"),
                "model": result.get("model", "N/A"),
                "batch": result.get("batch", "N/A"),
            }
        )

# Create a DataFrame from the records
df = pd.DataFrame(records)

# Convert Unix timestamps to datetime for readability
df["start_datetime"] = pd.to_datetime(df["start_time"], unit="s", errors="coerce")
df["end_datetime"] = pd.to_datetime(df["end_time"], unit="s", errors="coerce")

# Reorder columns for better readability
df = df[
    [
        "start_datetime",
        "end_datetime",
        "start_time",
        "end_time",
        "input_tokens",
        "output_tokens",
        "input_cached_tokens",
        "input_audio_tokens",
        "output_audio_tokens",
        "num_model_requests",
        "project_id",
        "user_id",
        "api_key_id",
        "model",
        "batch",
    ]
]

# Display the DataFrame
df.head()