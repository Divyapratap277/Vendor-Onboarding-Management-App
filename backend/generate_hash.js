 const bcrypt = require('bcryptjs'); // Or 'bcrypt';
             const password = 'vendor@2104'; // Replace with your desired password;
             const saltRounds = 10; // Use the same salt rounds as your application;
 
             bcrypt.hash(password, saltRounds, function(err, hash) {
                 if (err) {
                     console.error(err);
                     return;
                 } 
                 console.log(hash);
             });