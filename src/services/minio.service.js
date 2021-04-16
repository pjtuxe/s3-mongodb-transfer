const Minio = require('minio')
const config = require('./config.service')
let minioClient

try {
    minioClient = new Minio.Client({
        endPoint: config.minio.endpoint,
        port: config.minio.port,
        useSSL: config.minio.useSSL,
        accessKey: config.minio.accessKey,
        secretKey: config.minio.secretKey,
    })
} catch (e) {

}

module.exports = minioClient
