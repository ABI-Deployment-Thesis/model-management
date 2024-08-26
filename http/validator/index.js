const path = require('path')
const fs = require('fs')
const unzipper = require('unzipper')

const { param, body, validationResult } = require('express-validator')

const {
    PREDICTIVE,
    OPTIMIZATION,
    DOCKER,
    PYTHON3,
    R,
    RDS,
    FEATURE_TYPES,
    PY_SERIALIZATION_ALG,
    NATIVE_SERIALIZATION_ALG,
    NAME_REGEX,
    PY_FILE_TYPES,
    R_FILE_TYPES,
    COMPRESSION_FILE_TYPES
} = require('../../constants')

// Utils
const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        deleteFile(req)
        return res.status(400).json({ error: errors.array() })
    }
    next()
}

const deleteFile = async (req) => {
    if (req.file && req.file.path) {
        const filePath = path.dirname(req.file.path)
        if (await fs.existsSync(filePath)) {
            logger.debug(`Deleting folder '${filePath}'`)
            await fs.rmSync(filePath, { recursive: true, force: true })
        }
    }
}

const validateFileExtension = (extFileName, validExtensions, errorMessage) => {
    if (!validExtensions.includes(extFileName)) {
        throw new Error(errorMessage)
    }
}

const handlePredictiveModel = (language, extFileName) => {
    switch (language) {
        case PYTHON3:
            validateFileExtension(extFileName, PY_FILE_TYPES, 'Invalid file type for Python predictive model')
            break
        case R:
            validateFileExtension(extFileName, R_FILE_TYPES, 'Invalid file type for R predictive model')
            break
        default:
            throw new Error('Unsupported language for predictive model')
    }
}

const handleOptimizationModel = async (language, extFileName, filePath) => {
    validateFileExtension(extFileName, COMPRESSION_FILE_TYPES, 'Invalid file type for optimization model')

    const mainFileName = language === PYTHON3 ? 'main.py' : language === R ? 'main.r' : null
    if (!mainFileName) throw new Error('Unsupported language for optimization model')

    const destPath = path.join(path.dirname(filePath), 'model')
    await unzip(filePath, destPath)
    const files = await fs.promises.readdir(destPath)

    if (!files.includes(mainFileName)) {
        throw new Error(`${mainFileName} is required in the optimization model`)
    }

    await fs.promises.rm(filePath, { recursive: true, force: true })
    return destPath
}

const fileNotEmpty = async (req, res, next) => {
    try {
        if (!req.file) throw new Error('Model file is required')

        const extFileName = path.extname(req.file.originalname).toLowerCase()

        if (req.body.type === PREDICTIVE) {
            handlePredictiveModel(req.body.language, extFileName)
        } else if (req.body.type === OPTIMIZATION) {
            req.file.path = await handleOptimizationModel(req.body.language, extFileName, req.file.path)
        } else {
            throw new Error('Invalid model type')
        }

        next()
    } catch (err) {
        logger.error(err.message)
        deleteFile(req)
        res.status(400).json({ error: err.message })
    }
}

async function unzip(zipPath, destPath) {
    const directory = await unzipper.Open.file(zipPath)
    await directory.extract({ path: destPath })
}

// Custom validator function to check features
const validateFeatures = (value) => {
    try {
        const features = value
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
        const dependencies = value
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
    const dependencies = req.body.dependencies
    const serialization = req.body.serialization
    let hasSerialization = false
    if (NATIVE_SERIALIZATION_ALG.includes(serialization)) { // Native language serialization algorithms
        hasSerialization = true
    } else {
        dependencies.forEach(dependency => {
            if (dependency.library == serialization) {
                hasSerialization = true
            }
        })
    }
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
        try {
            req.body.type = PREDICTIVE
            req.body.engine = DOCKER
            req.body.docker_tag = req.body.docker_tag == undefined ? '3.9' : req.body.docker_tag
            req.body.cpu_percentage = req.body.cpu_percentage == undefined ? 500000000 : Number(req.body.cpu_percentage) * 10000000
            req.body.language = PYTHON3
            req.body.features = JSON.parse(req.body.features)
            req.body.dependencies = JSON.parse(req.body.dependencies)
            next()
        } catch (err) {
            logger.error(err)
            deleteFile(req)
            res.status(400).json({ error: 'features and dependencies must be a valid JSON array with correct structure' })
        }
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
        try {
            req.body.type = PREDICTIVE
            req.body.engine = DOCKER
            req.body.docker_tag = req.body.docker_tag == undefined ? '24.04' : req.body.docker_tag
            req.body.cpu_percentage = req.body.cpu_percentage == undefined ? 500000000 : Number(req.body.cpu_percentage) * 10000000
            req.body.serialization = RDS
            req.body.language = R
            req.body.features = JSON.parse(req.body.features)
            req.body.dependencies = JSON.parse(req.body.dependencies)
            next()
        } catch (err) {
            logger.error(err)
            deleteFile(req)
            res.status(400).json({ error: 'features and dependencies must be a valid JSON array with correct structure' })
        }
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

// Validator for saveOptDockerPyModel
const saveOptDockerPyModel = [
    (req, res, next) => {
        try {
            req.body.type = OPTIMIZATION
            req.body.engine = DOCKER
            req.body.docker_tag = req.body.docker_tag == undefined ? '3.9' : req.body.docker_tag
            req.body.cpu_percentage = req.body.cpu_percentage == undefined ? 500000000 : Number(req.body.cpu_percentage) * 10000000
            req.body.language = PYTHON3
            req.body.features = []
            req.body.dependencies = JSON.parse(req.body.dependencies)
            next()
        } catch (err) {
            logger.error(err)
            deleteFile(req)
            res.status(400).json({ error: 'features and dependencies must be a valid JSON array with correct structure' })
        }
    },
    fileNotEmpty,
    body('name')
        .isString().withMessage('Name must be a string')
        .matches(NAME_REGEX).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('dependencies')
        .custom(validateDependencies),
    validate
]
module.exports = {
    getModel,
    savePredDockerPyModel,
    savePredDockerRModel,
    saveOptDockerPyModel
}
