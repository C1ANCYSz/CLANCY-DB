const DB = require('./db');

const db = new DB('db.json');

const users = db.collection('users');

users.delete({});

console.log("=== INSERTING USERS ===");
users.insert({ name: 'Alice', age: 25, city: 'New York' });
users.insert({ name: 'Bob', age: 30, city: 'Los Angeles' });
users.insert({ name: 'Charlie', age: 22, city: 'Chicago' });

console.log("=== FIND USERS ===");
const foundUsers = users.find({ age: { $gte: 25 } });
console.log(foundUsers.data);

console.log("=== UPDATE USERS ===");
foundUsers.update({ city: 'San Francisco' });
console.log(users.find({}).data);

console.log("=== DELETE USERS ===");
const deleted = users.delete({ age: { $lt: 25 } });
console.log(`Deleted ${deleted.deletedCount} user(s)`);
console.log(users.find({}).data);

console.log("=== AGGREGATION: GROUP BY CITY ===");
const aggregationResult = users.aggregate([
    { $group: { _id: "city", count: { $sum: 1 } } }
]);
console.log(aggregationResult);
