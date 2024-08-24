// Express app
const app = require('.')
const express = require('express')

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', [req.headers.origin])
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST')
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World' })
})

// Import routes
const modelRouter = require('./routes/model.routes')
app.use('/', modelRouter)

module.exports = app