from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017')
    db = client['paperly_db']
    
    # Remove handwriting fields from admin
    result = db.users.update_one(
        {'email': 'charlie@admin.com'}, 
        {'$unset': {
            'handwriting_style': '', 
            'handwriting_confidence': '',
            'handwriting_sample_url': '',
            'handwriting_samples': ''
        }}
    )
    print(f'Modify count: {result.modified_count}')

except Exception as e:
    print(e)
