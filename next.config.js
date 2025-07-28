/** @type {import ('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptomized: true
    }
}

MediaSourceHandle.exports = nextConfig
