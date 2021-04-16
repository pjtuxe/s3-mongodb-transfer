const minioClient = require('./services/minio.service')
const config = require('./services/config.service')
const mongoService = require('./services/mongodb.service')
const fs = require('fs')
let exec = require('child_process').exec

function getCollectionName(name) {
    return name.split('-')[0]
}

function getTempPath(name) {
    return `/tmp/${name}`
}

function processDocument(name) {
    let collection = mongoService.getDB().collection('document_migrations')
    // Create log entry
    collection.insertOne({
        name,
        createdAt: new Date(),
        status: 'processing'
    })

    // Download file
    minioClient.fGetObject(config.minio.bucket, name, getTempPath(name), function (err) {
        if (err) {
            return console.log(err)
        }

        // Import file
        let command = 'mongoimport -d %database% -c %collection% --file %file%'
            .replace('%database%', config.mongodb.dbName)
            .replace('%collection%', getCollectionName(name))
            .replace('%file%', getTempPath(name))

        exec(command, (err, stdout, stderr) => {
            // Clean up downloaded file
            fs.unlinkSync(getTempPath(name))

            // Update log entry
            collection.updateOne(
                { name },
                { '$set': { status: 'finished', finishedAt: new Date() } }
            )
        })
    })
}

function isDocumentProcessed(name) {
    return new Promise(resolve => {
        mongoService.getDB().collection('document_migrations')
            .findOne({ name })
            .then(document => {
                resolve(true)
            })
            .catch(err => {
                resolve(false)
            })
    })
}

function fetchMinioData() {
    return new Promise((resolve, reject) => {
        let stream = minioClient.listObjectsV2(config.minio.bucket)
        let documents = []
        stream.on('data', document => documents.push(document))
        stream.on('error', reject)
        stream.on('end', _ => { resolve(documents) })
    })
}

function main() {
    console.log("start app")

    fetchMinioData().then(documents => {
        documents.forEach(document => {
            isDocumentProcessed(document.name).then(isProcessed => {
                if (!isProcessed) {
                    processDocument(document.name)
                }
            })
        })
    })
}

(() => {
    main()
    //setInterval(main, 60 * 1000)
})()
