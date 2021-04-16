module.exports = {
    mongodb: {
        connectionString: process.env.MONGODB_CONNECTION_STRING,
        dbName: process.env.MONGODB_DB_NAME,
    },
    minio: {
        endpoint: process.env.MINIO_ENDPOINT || "minio",
        port: parseInt(process.env.MINIO_PORT || 9000),
        useSSL: !!(process.env.MINIO_USE_SSL || false),
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
        bucket: process.env.MINIO_BUCKET,
    },
}
