# ClancyDB - Lightweight JSON Database

ClancyDB is a lightweight, file-based NoSQL database inspired by MongoDB. It provides simple data storage, schema validation, and an aggregation pipeline using JSON files.

## Features
- **Lightweight & File-Based**: Stores data in JSON format.
- **Collections & Models**: Organize data with schemas.
- **Indexing**: Supports basic indexing for faster queries.
- **Aggregation Pipeline**: MongoDB-like query operators.
- **Schema Validation**: Built-in Joi validation.

## Installation
```sh
npm install clancydb
```

## Usage
### Initialize Database
```javascript
const ClancyDB = require('clancydb');
const db = new ClancyDB('data.json');
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

## Aggregation Operators
- `$match` - Filter documents.
- `$group` - Group data and perform aggregations.
- `$sort` - Sort documents.
- `$limit` - Limit the number of results.
- `$skip` - Skip documents.
- `$project` - Select specific fields.
- `$unwind` - Expand array fields.
- `$lookup` - Join collections.
- `$count` - Count documents.

