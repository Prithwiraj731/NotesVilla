const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const detectResourceType = (localPath, fallback = 'auto') => {
    try {
        const ext = (localPath.split('.').pop() || '').toLowerCase();
        const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const rawExt = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar'];
        if (imageExt.includes(ext)) return 'image';
        if (rawExt.includes(ext)) return 'raw';
        return fallback;
    } catch (_) {
        return fallback;
    }
};

exports.uploadLocalFile = async (localPath, publicIdBase, resourceType = 'auto') => {
    const chosenType = resourceType === 'auto' ? detectResourceType(localPath, 'auto') : resourceType;
    const res = await cloudinary.uploader.upload(localPath, {
        folder: 'notesvilla/notes',
        public_id: publicIdBase,
        resource_type: chosenType,
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

exports.getDownloadUrl = (publicId, filename, resourceType = 'image') => {
    const ext = filename && filename.includes('.') ? filename.split('.').pop() : undefined;
    const typePath = resourceType === 'raw' ? 'raw' : 'image';
    const base = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${typePath}/upload`;
    if (ext) {
        return `${base}/fl_attachment:${encodeURIComponent(filename)}/${publicId}.${ext}`;
    }
    return `${base}/fl_attachment/${publicId}`;
};


