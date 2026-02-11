/**
 * Product Model Schema
 * Defines the structure for products in the PetShop e-commerce application
 * Includes product details, pricing, inventory, reviews, and administrative features
 */

const mongoose = require("mongoose");
const URLSlugs = require('mongoose-url-slugs'); // For generating SEO-friendly URLs
const { districts } = require("../middleware/common");
const Schema = mongoose.Schema;

// Product Schema Definition
const productSchema = mongoose.Schema({
    // Basic Product Information
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 128
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'productbrand' // Reference to brand collection
    },
    
    // Inventory Management
    quantity: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32
    },
    
    // Product Classification
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'category' // Reference to category collection (multiple categories supported)
    }],
    // Rating System
    averageRating: {
        type: mongoose.Decimal128 // High precision decimal for ratings
    },
    totalRatingUsers: {
        type: Number // Count of users who rated this product
    },
    
    // Seller Information
    soldBy: {
        type: Schema.Types.ObjectId,
        ref: 'admin' // Reference to admin/seller who listed the product
    },
    
    // Product Media
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'productimages' // Reference to product images collection
    }],
    
    // Product Policies
    warranty: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    return: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32
    },
    size: [{
        type: String,
        trim: true,
        maxlength: 32
    }],
    model: {
        type: String,
        trim: true,
        maxlength: 128
    },
    color: [{
        type: String,
        trim: true,
        maxlength: 128
    }],
    weight: [{
        type: String,
        trim: true,
        maxlength: 128
    }],
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    highlights: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    tags: [{
        type: String
    }],
    // Pricing Information
    price: {
        type: mongoose.Decimal128, // High precision decimal for currency
        required: true
    },
    discountRate: {
        type: Number, // Percentage discount (can be float)
        default: 0
    },
    
    // Additional Media
    videoURL: [{
        type: String // URLs for product videos
    }],
    
    // Administrative Status Fields
    isVerified: {
        type: Date,
        default: null // Date when product was verified (null = not verified)
    },
    isRejected: {
        type: Date,
        default: null // Date when product was rejected (null = not rejected)
    },
    isDeleted: {
        type: Date,
        default: null // Soft delete - date when product was deleted
    },
    isFeatured: {
        type: Date,
        default: null // Date when product was featured (null = not featured)
    },
    
    // Analytics and Performance Metrics
    viewsCount: {
        type: Number,
        default: 0, // Number of times product was viewed
    },
    trendingScore: {
        type: mongoose.Decimal128,
        default: 0 // Algorithm-calculated trending score
    },
    noOfSoldOut: {
        type: Number,
        default: 0, // Number of units sold
    },
    // SEO and URL Management
    slug: {
        type: String,
        unique: true // Auto-generated SEO-friendly URL slug
    },
    
    // Geographic Availability
    availableDistricts: [{
        type: String,
        enum: districts, // Predefined list of districts where product is available
        required: true
    }],
    
    // Administrative Notes
    remark: [{
        type: Schema.Types.ObjectId,
        ref: 'remark' // Reference to admin remarks/notes about the product
    }],
    
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Plugin to automatically generate URL slugs from product name
productSchema.plugin(URLSlugs('name', { field: 'slug', update: true }));

// Export the Product model
module.exports = mongoose.model("product", productSchema);