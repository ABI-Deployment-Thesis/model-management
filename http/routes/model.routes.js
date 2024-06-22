const router = require('express').Router()

const modelController = require('../controllers/model.controller')
const { isAuthenticated } = require('../middleware')
const utilsMulter = require('../../utils/multer')
const validator = require('../validator')

router.get('/models', isAuthenticated, modelController.getModels)
router.get('/model/:id', isAuthenticated, validator.getModel, modelController.getModel)
router.post('/model', isAuthenticated, utilsMulter.uploadModel, validator.saveModel, modelController.saveModel)

module.exports = router