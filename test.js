const DB = require('./db');

(async () => {
    const db = new DB('./db.json');

    const User = db.model('users', {
        name: { type: 'string' , required: true},
        city: { type: 'string' },
        age: { type: 'number', args: ['integer', 18] },
    });

   
    


   const users = await User.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $sort: { age: -1 } },
   
    { $group:
        {
             _id: 'city',
            totalAge: { $sum: 'age' },
            totalUsers: {$sum: 1 } 
        }
    },
   
   
    
]);

console.log(users);

    
   
   
    
   
   
})();
