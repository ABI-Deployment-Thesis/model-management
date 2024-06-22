const path = require('path')
const fs = require('fs')

const { param, body, validationResult } = require('express-validator')

const { FEATURE_TYPES, MODEL_TYPES, ENGINES, LANGUAGES, NAME_REGEX } = require('../../constants')

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        if (req.file && req.file.path) {
            const filePath = path.dirname(req.file.path)
            if (fs.existsSync(filePath)) {
                logger.debug(`Deleting folder '${filePath}'`)
                fs.rmSync(filePath, { recursive: true, force: true })
            }
        }
        return res.status(400).json({ error: errors.array() })
    }
    next()
}

// Custom middleware to check if the Model file is present
const fileNotEmpty = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Model file is required' })
    }
    next()
}

// Custom validator function to check features
const validateFeatures = (value) => {
    try {
        const features = JSON.parse(value)
        if (!Array.isArray(features)) {
            throw new Error('Features must be an array')
        }

        // Validate feature structure and order
        const expectedOrders = Array.from({ length: features.length }, (_, i) => i + 1)
        const actualOrders = features.map(feature => feature.order)
        if (!expectedOrders.every(order => actualOrders.includes(order))) {
            throw new Error(`Features must have consecutive orders starting from 1 to ${features.length}`)
        }

        features.forEach(feature => {
            if (typeof feature.name !== 'string') {
                throw new Error('Feature name must be a string')
            }
            if (!FEATURE_TYPES.includes(feature.type)) {
                throw new Error('Feature type must be "int", "float", or "bool"')
            }
            if (typeof feature.order !== 'number') {
                throw new Error('Feature order must be a number')
            }
        })

        return true
    } catch (err) {
        throw new Error('Features must be a valid JSON array with correct structure and order')
    }
}

// Validator for getModel
const getModel = [
    param('id').escape(),
    validate
]

// Validator for saveModel
const saveModel = [
    fileNotEmpty,
    body('name')
        .isString().withMessage('Name must be a string')
        .matches(NAME_REGEX).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('type')
        .isIn(MODEL_TYPES).withMessage('Type must be either "preditive" or "optimization"'),
    body('engine')
        .isIn(ENGINES).withMessage('Engine must be either "docker" or "API"'),
    body('language')
        .isIn(LANGUAGES).withMessage('Language must be either "Python3" or "R"'),
    body('features')
        .custom(validateFeatures),
    body('dependencies')
        .custom(value => {
            try {
                const dependencies = JSON.parse(value)
                if (!Array.isArray(dependencies)) {
                    throw new Error('Dependencies must be an array')
                }
                dependencies.forEach(dependency => {
                    if (typeof dependency.library !== 'string') {
                        throw new Error('Dependency library must be a string')
                    }
                    if (typeof dependency.version !== 'string') {
                        throw new Error('Dependency version must be a string')
                    }
                })
                return true
            } catch (err) {
                throw new Error('Dependencies must be a valid JSON array with correct structure')
            }
        }),
    validate
]

module.exports = {
    getModel,
    saveModel
}
