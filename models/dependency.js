const { Schema, model } = require('mongoose')

const DependencySchema = new Schema({
    library: {
        type: String,
        trim: true,
        required: true
    },
    version: {
        type: String,
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

module.exports = model('dependency', DependencySchema)