const express = require('express')
const multer = require('multer')
const request = require('supertest')

const { saveModel } = require('../http/validator')

// Configure multer
const upload = multer()

// Mock controller for testing
const mockController = (req, res) => {
    res.status(200).json({ message: 'Passed validation' })
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.post('/save-model', upload.none(), saveModel, mockController)

describe('saveModel Validator Middleware', () => {
    it('should pass validation for a valid request', async () => {
        const validRequest = {
            name: 'Model XPTO',
            type: 'predictive',
            engine: 'docker',
            language: 'Python3',
            features: JSON.stringify([
                { name: 'age', type: 'int', order: 1 },
                { name: 'glasses', type: 'bool', order: 2 },
                { name: 'city_code', type: 'float', order: 3 },
            ]),
            dependencies: JSON.stringify([
                { library: 'joblib', version: '1.0.1' },
                { library: 'pandas', version: '1.3.4' },
                { library: 'scikit-learn', version: '0.24.1' }
            ])
        }

        const response = await request(app)
            .post('/save-model')
            .field('name', validRequest.name)
            .field('type', validRequest.type)
            .field('engine', validRequest.engine)
            .field('language', validRequest.language)
            .field('features', validRequest.features)
            .field('dependencies', validRequest.dependencies)

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
            .post('/save-model')
            .field('name', invalidRequest.name)
            .field('type', invalidRequest.type)
            .field('engine', invalidRequest.engine)
            .field('language', invalidRequest.language)
            .field('features', invalidRequest.features)
            .field('dependencies', invalidRequest.dependencies)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeInstanceOf(Array)
        expect(response.body.errors).not.toHaveLength(0)
    })
})
