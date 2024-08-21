const router = require('express').Router()

const modelController = require('../controllers/model.controller')
const { isAuthenticated } = require('../middleware')
const utilsMulter = require('../../utils/multer')
const validator = require('../validator')

router.get('/models', isAuthenticated, modelController.getModels)
router.get('/models/:id', isAuthenticated, validator.getModel, modelController.getModel)

router.post('/models/predictives/docker/python', isAuthenticated, utilsMulter.uploadModel, validator.savePredDockerPyModel, modelController.saveModel)
router.post('/models/predictives/docker/r', isAuthenticated, utilsMulter.uploadModel, validator.savePredDockerRModel, modelController.saveModel)

module.exports = router