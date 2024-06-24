const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const modelController = require('./controllers/model.controller')

const packageDefinition = protoLoader.loadSync('./grpc/protos/ModelMgmtService.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const ModelMgmtService = protoDescriptor.ModelMgmtService

const server = new grpc.Server()
server.addService(ModelMgmtService.service, { GetModel: modelController.getModel, GetModels: modelController.getModels })

const address = `0.0.0.0:${process.env.GRPC_PORT}`
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    logger.info(`gRPC server hosted on port ${address}`)
})