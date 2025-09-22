const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadLocalFile = async (localPath, publicIdBase, resourceType = 'auto') => {
    const res = await cloudinary.uploader.upload(localPath, {
        folder: 'notesvilla/notes',
        public_id: publicIdBase,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false
    });
    return {
        url: res.secure_url,
        publicId: res.public_id,
        format: res.format,
        bytes: res.bytes,
        resourceType: res.resource_type
    };
};

exports.getDownloadUrl = (publicId, filename) => {
    const ext = filename && filename.includes('.') ? filename.split('.').pop() : undefined;
    const base = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    if (ext) {
        return `${base}/fl_attachment:${encodeURIComponent(filename)}/${publicId}.${ext}`;
    }
    return `${base}/fl_attachment/${publicId}`;
};


