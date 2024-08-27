const router = require('express').Router()

const modelController = require('../controllers/model.controller')
const { isAuthenticated } = require('../middleware')
const utilsMulter = require('../../utils/multer')
const validator = require('../validator')

router.get('/models', isAuthenticated, modelController.getModels)
router.get('/models/:id', isAuthenticated, validator.getModel, modelController.getModel)

router.post('/models/predictive/docker/python', isAuthenticated, utilsMulter.uploadModel, validator.savePredDockerPyModel, modelController.saveModel)
router.post('/models/predictive/docker/r', isAuthenticated, utilsMulter.uploadModel, validator.savePredDockerRModel, modelController.saveModel)

router.post('/models/optimization/docker/python', isAuthenticated, utilsMulter.uploadModel, validator.saveOptDockerPyModel, modelController.saveModel)
router.post('/models/optimization/docker/r', isAuthenticated, utilsMulter.uploadModel, validator.saveOptDockerRModel, modelController.saveModel)

module.exports = router