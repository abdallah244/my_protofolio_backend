const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Attempt to connect to the database using the connection string from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // Log success message with the connected host
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        // Log error message and exit the process if connection fails
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB; // Export the connectDB function