const { Schema, model } = require('mongoose')

const { FEATURE_TYPES } = require('../constants')

const FeatureSchema = Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    type: {
        type: String,
        trim: true,
        enum: FEATURE_TYPES,
        required: true
    },
    order: {
        type: Number,
        trim: true,
        required: true
    },
    deleted: {
        type: Boolean,
        trim: true,
        required: true,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
})

module.exports = model('feature', FeatureSchema)