/**
 * User Model Schema
 * Defines the structure and behavior for user accounts in the PetShop application
 * Supports multiple login methods (system, Facebook, Google) and includes security features
 */

const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema;

// User Schema Definition
const userSchema = new mongoose.Schema({
    // Basic User Information
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        // unique:true - Currently commented out, consider enabling for production
    },
    userID: {
        type: String,
        trim: true,
        unique: true  // Unique identifier for each user
    },
    
    // Authentication Method
    loginDomain: {
        type: String,
        default: "system", // Default to system login
        enum: ['system', 'facebook', 'google'] // Supported login providers
    },
    // Security Fields
    password: {
        type: String,
        // required: true - Currently optional to support social logins
    },
    salt: String, // Salt for password hashing
    
    // User Profile Information
    location: [{
        type: Schema.Types.ObjectId,
        ref: "address" // Reference to address collection
    }],
    photo: {
        type: String // User uploaded profile photo
    },
    socialPhoto: {
        type: String // Profile photo from social login providers
    },
    dob: {
        type: String // Date of birth
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    
    // Account Management
    resetPasswordLink: {
        type: String,
        default: "" // Token for password reset
    },
    emailVerifyLink: {
        type: String,
        default: "" // Token for email verification
    },
    isBlocked: {
        type: Date,
        default: null // Date when user was blocked (null = not blocked)
    }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create geospatial index for location-based queries
userSchema.index({ geolocation: "2dsphere" });

/**
 * Password Hashing Function
 * Uses SHA512 algorithm with salt for secure password storage
 */
const sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        passwordHash: value
    };
};

/**
 * Pre-save Middleware
 * Automatically hashes password when it's modified
 */
userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        // Generate random salt
        const ranStr = function (n) {
            return crypto.randomBytes(Math.ceil(8))
                .toString('hex')
                .slice(0, n);
        };
        
        // Apply SHA512 algorithm with salt
        let salt = ranStr(16);
        let passwordData = sha512(user.password, salt);
        user.password = passwordData.passwordHash;
        user.salt = salt;
        next();
    } else {
        next();
    }
})
/**
 * Static Method: Find User by Credentials
 * Authenticates user by email and password for system login
 */
userSchema.statics.findByCredentials = async function (email, password) {
    let User = this;
    // Find user with system login domain
    const user = await User.findOne({ email, loginDomain: 'system' })
    if (!user) return ''
    
    // Hash provided password with user's salt and compare
    let passwordData = sha512(password, user.salt)
    if (passwordData.passwordHash == user.password) {
        return user
    }
}

// Export the User model
module.exports = mongoose.model("user", userSchema);