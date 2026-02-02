import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from utils.mongo import db

# Writer Locations (Mock)
LOCATIONS = {
    'Alan': {'lat': 51.9977, 'lon': -0.7407}, # Bletchley
    'Ada': {'lat': 51.5074, 'lon': -0.1278}, # London
    'Grace': {'lat': 38.8799, 'lon': -77.1067}, # Arlington
}

writers = db.users.find({'$or': [{'role': 'provider'}, {'role': 'WRITER'}]})
count = 0

for writer in writers:
    name_key = writer.get('first_name', '')
    
    if name_key in LOCATIONS:
        coords = LOCATIONS[name_key]
    else:
        # Default to random near NY if unknown
        coords = {
            'lat': 40.7128 + random.uniform(-0.5, 0.5),
            'lon': -74.0060 + random.uniform(-0.5, 0.5)
        }

    db.users.update_one(
        {'_id': writer['_id']},
        {'$set': {'coordinates': {'lat': coords['lat'], 'lon': coords['lon']}}}
    )
    print(f"Updated {writer.get('email')} with location {coords}")
    count += 1

print(f"Updated {count} writers with coordinates.")
