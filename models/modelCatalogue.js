const { Schema, model } = require('mongoose')

const { NONE, MODEL_TYPES, ENGINES, LANGUAGES, SERIALIZATION_ALG } = require('../constants')

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
    mem_limit: {
        type: String,
        trim: true,
        required: true,
        default: '256M'
    },
    cpu_percentage: {
        type: Number,
        trim: true,
        required: true,
        default: 500000000
    },
    language: {
        type: String,
        trim: true,
        enum: LANGUAGES.concat([NONE]),
        required: true,
        default: NONE
    },
    serialization: {
        type: String,
        trim: true,
        enum: SERIALIZATION_ALG.concat([NONE]),
        required: true,
        default: NONE
    },
    dependencies: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'dependency'
            }
        ],
        required: true,
        default: []
    },
    features: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'feature'
            }
        ],
        required: true,
        default: []
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