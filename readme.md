# ClancyDB - Lightweight JSON Database

ClancyDB is a lightweight file-based NoSQL database inspired by MongoDB. It provides simple data storage, schema validation, and aggregation pipeline capabilities using JSON files.

## Features
- **Lightweight & File-Based**: Stores data in JSON format.
- **Collections & Models**: Organize data into collections and define schemas.
- **Indexing**: Supports basic indexing for faster queries.
- **Aggregation Pipeline**: Implements MongoDB-like aggregation operators.
- **Schema Validation**: Uses Joi for field validation.

## Installation
```sh
npm install fs-extra lodash async-lock joi
```

## Usage
### Initialize Database
```javascript
const DB = require('./db');
const db = new DB('data.json');
```

### Define a Model
```javascript
const userModel = db.model('users', {
    name: { type: 'string', required: true },
    age: { type: 'number', required: true }
});
```

### Insert Data
```javascript
userModel.insert({ name: 'Alice', age: 25 });
```

### Query Data
```javascript
const users = userModel.find({ age: { $gte: 18 } });
console.log(users);
```

### Aggregation Example
```javascript
const results = userModel.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $group: { _id: null, averageAge: { $avg: 'age' } } }
]);
console.log(results);
```

## Aggregation Pipeline Operators
- `$match`: Filters documents based on conditions.
- `$group`: Groups data and performs aggregations.
- `$sort`: Sorts documents by fields.
- `$limit`: Limits the number of results.
- `$skip`: Skips a specified number of documents.
- `$project`: Selects specific fields.
- `$unwind`: Expands array fields into separate documents.
- `$lookup`: Performs simple joins between collections.
- `$count`: Counts documents in the pipeline.


