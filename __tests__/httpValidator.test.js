const express = require('express')
const multer = require('multer')
const request = require('supertest')

const { savePredDockerPyModel } = require('../http/validator')

// Configure multer
const upload = multer()

// Mock controller for testing
const mockController = (req, res) => {
    res.status(200).json({ message: 'Passed validation' })
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.post('/models/predictives/docker/python', upload.single('file'), savePredDockerPyModel, mockController)

describe('saveModel Validator Middleware', () => {
    it('should pass validation for a valid request', async () => {
        const validRequest = {
            name: 'Model XPTO',
            type: 'predictive',
            engine: 'docker',
            language: 'Python3',
            serialization: 'joblib',
            features: JSON.stringify([
                { name: 'glasses', type: 'boolean', order: 2 },
                { name: 'age', type: 'int', order: 1 },
                { name: 'city_code', type: 'float', order: 3 },
            ]),
            dependencies: JSON.stringify([
                { library: 'joblib', version: '1.0.1' },
                { library: 'pandas', version: '1.3.4' },
                { library: 'scikit-learn', version: '0.24.1' }
            ])
        }

        const response = await request(app)
            .post('/models/predictives/docker/python')
            .field('name', validRequest.name)
            .field('type', validRequest.type)
            .field('engine', validRequest.engine)
            .field('language', validRequest.language)
            .field('serialization', validRequest.serialization)
            .field('features', validRequest.features)
            .field('dependencies', validRequest.dependencies)
            .attach('file', './__tests__/data/model.sav')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Passed validation')
    })

    it('should fail validation for an invalid request', async () => {
        const invalidRequest = {
            name: 'M', // Invalid name, too short
            type: 'invalidType', // Invalid type
            engine: 'invalidEngine', // Invalid engine
            language: 'invalidLanguage', // Invalid language
            features: JSON.stringify([
                { name: 'age', type: 'invalidType', order: 2 } // Invalid feature type and order
            ]),
            dependencies: JSON.stringify([
                { library: 'joblib', version: 1.0 } // Invalid version, should be string
            ])
        }

        const response = await request(app)
            .post('/models/predictives/docker/python')
            .field('name', invalidRequest.name)
            .field('type', invalidRequest.type)
            .field('engine', invalidRequest.engine)
            .field('language', invalidRequest.language)
            .field('features', invalidRequest.features)
            .field('dependencies', invalidRequest.dependencies)
            .attach('file', './__tests__/data/model.sav')

        expect(response.status).toBe(400)
        expect(response.body.error).toBeInstanceOf(Array)
        expect(response.body.error).not.toHaveLength(0)
    })
})
