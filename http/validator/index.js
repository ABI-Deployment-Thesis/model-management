const path = require('path')
const fs = require('fs')

const { param, body, validationResult } = require('express-validator')

const { PYTHON3, R, FEATURE_TYPES, MODEL_TYPES, ENGINES, LANGUAGES, PY_SERIALIZATION_ALG, NAME_REGEX, PY_FILE_TYPES, R_FILE_TYPES } = require('../../constants')

// Utils
const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        deleteFile(req)
        return res.status(400).json({ error: errors.array() })
    }
    next()
}

const deleteFile = (req) => {
    if (req.file && req.file.path) {
        const filePath = path.dirname(req.file.path)
        if (fs.existsSync(filePath)) {
            logger.debug(`Deleting folder '${filePath}'`)
            fs.rmSync(filePath, { recursive: true, force: true })
        }
    }
}

const fileNotEmpty = (req, res, next) => {
    if (!req.file)
        return res.status(400).json({ error: 'Model file is required' })

    const extFileName = path.extname(req.file.originalname).toLowerCase()
    switch (req.body.language) {
        case PYTHON3:
            if (!PY_FILE_TYPES.includes(extFileName)) {
                deleteFile(req)
                return res.status(400).json({ error: 'Invalid file type' })
            }
            break;
        case R:
            if (!R_FILE_TYPES.includes(extFileName)) {
                deleteFile(req)
                return res.status(400).json({ error: 'Invalid file type' })
            }
            break;
        default:
            deleteFile(req)
            return res.status(400).json({ error: 'Invalid file type' })
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
        const actualOrders = features.map(feature => feature.order).sort((a, b) => a - b)
        if (expectedOrders == actualOrders) {
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

const validateDependencies = (value) => {
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
}

const checkSerializationInDependencies = async (req, res, next) => {
    const dependencies = JSON.parse(req.body.dependencies)
    const serialization = req.body.serialization
    let hasSerialization = false
    dependencies.forEach(dependency => {
        if (dependency.library == serialization) {
            hasSerialization = true
        }
    })
    if (!hasSerialization) {
        await deleteFile(req)
        return res.status(400).json({ error: 'Dependencies must include the serialization library' })
    }

    next()
}

// Validator for getModel
const getModel = [
    param('id').escape(),
    validate
]

// Validator for savePredDockerPyModel
const savePredDockerPyModel = [
    (req, res, next) => {
        req.body.type = "predictive"
        req.body.engine = "docker"
        req.body.language = "Python3"
        next()
    },
    fileNotEmpty,
    body('name')
        .isString().withMessage('Name must be a string')
        .matches(NAME_REGEX).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('serialization')
        .isIn(PY_SERIALIZATION_ALG).withMessage('serialization must be either "joblib" or "pickle"'),
    body('features')
        .custom(validateFeatures),
    body('dependencies')
        .custom(validateDependencies),
    validate,
    checkSerializationInDependencies
]

// Validator for savePredDockerRModel
const savePredDockerRModel = [
    (req, res, next) => {
        req.body.type = "predictive"
        req.body.engine = "docker"
        req.body.language = "R"
        next()
    },
    fileNotEmpty,
    body('name')
        .isString().withMessage('Name must be a string')
        .matches(NAME_REGEX).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('features')
        .custom(validateFeatures),
    body('dependencies')
        .custom(validateDependencies),
    validate
]

module.exports = {
    getModel,
    savePredDockerPyModel,
    savePredDockerRModel
}
