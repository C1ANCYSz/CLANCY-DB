# ClancyDB - Lightweight JSON Database

ClancyDB is a lightweight, file-based NoSQL database inspired by MongoDB. It provides an easy-to-use API for storing, querying, and managing JSON-based data.

## Features
✅ **Lightweight & File-Based** – Stores data efficiently in JSON format.  
✅ **Collections & Models** – Organize and structure your data easily.  
✅ **Schema Validation** – Built-in validation with Joi for data integrity.  
✅ **Aggregation Pipeline** – Supports MongoDB-like query operators.  
✅ **Indexing** – Optimize queries with basic indexing support.  
✅ **Simple API** – Designed for ease of use with a clean syntax.

---

## Installation
Install ClancyDB using npm:
```sh
npm install clancydb
```

---

## Quick Start
### Initialize Database
```javascript
const ClancyDB = require('clancydb');
const db = new ClancyDB('data.json');
```

### Define a Model
```javascript
const User = db.model('users', {
    name: { type: 'string', required: true },
    age: { type: 'number', required: true }
});
```

### Insert Data
```javascript
User.insert({ name: 'Alice', age: 25 });
```

### Query Data
```javascript
const users = User.find({ age: { $gte: 18 } });
console.log(users.data);
```

### Update Data
```javascript
const user = User.find({ name: 'Alice' });
user.update({ age: 26 });
```

### Delete Data
```javascript
User.delete({ age: { $lt: 18 } });
```

---

## Aggregation Example
Perform advanced queries using aggregation operators:
```javascript
const results = User.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $group: { _id: null, averageAge: { $avg: 'age' } } }
]);
console.log(results);
```

### Supported Aggregation Operators
- **$match** – Filter documents based on conditions.
- **$group** – Group data and perform calculations.
- **$sort** – Sort documents by field values.
- **$limit** – Restrict the number of results.
- **$skip** – Skip a specified number of documents.
- **$project** – Select specific fields.
- **$unwind** – Expand array fields into separate documents.
- **$lookup** – Perform joins with other collections.
- **$count** – Count the number of matching documents.

---

## License
IDK, it's open-source.

## More Details
For more details, visit the [GitHub repository](https://github.com/C1ANCYSz/CLANCY-DB).

