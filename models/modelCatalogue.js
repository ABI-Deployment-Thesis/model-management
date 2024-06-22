const { Schema, model } = require('mongoose')

const { MODEL_TYPES, ENGINES, LANGUAGES } = require('../constants')

const ModelCatalogueSchema = new Schema({
    user_id: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    type: {
        type: String,
        trim: true,
        enum: MODEL_TYPES,
        required: true
    },
    file_path: {
        type: String,
        trim: true,
        required: true
    },
    engine: {
        type: String,
        trim: true,
        enum: ENGINES,
        required: true,
        default: 'docker'
    },
    language: {
        type: String,
        trim: true,
        enum: LANGUAGES,
        required: false,
    },
    dependencies: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'dependency'
            }
        ],
        required: false
    },
    features: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'feature'
            }
        ],
        required: false
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

module.exports = model('model_catalogue', ModelCatalogueSchema)