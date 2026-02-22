const axios = require('axios');
const { Profile, Subscription } = require('../models');
const { generateProfilePdf } = require('../services/pdfService');
const { getPresignedUrl } = require('../services/uploadService');

/**
 * Helper to fetch image and convert to base64
 */
const fetchImageAsBase64 = async (url) => {
    try {
        if (!url) {
            console.log('PDF Debug: No URL provided for image fetch');
            return null;
        }
        console.log(`PDF Debug: Fetching image from ${url}`);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        console.log(`PDF Debug: Image fetched successfully (Size: ${buffer.length})`);
        return `data:${mimeType};base64,${buffer}`;
    } catch (error) {
        console.error('PDF Debug: Error fetching image for PDF:', error.message);
        if (error.response) {
            console.error('PDF Debug: Response Status:', error.response.status);
        }
        return null;
    }
};

/**
 * Download Profile PDF
 * GET /api/profiles/:id/pdf
 */
const downloadProfilePdf = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user._id;

        // 1. Get Profile
        let profile;
        if (id === 'me') {
            profile = await Profile.findOne({ userId: requestingUserId });
        } else {
            profile = await Profile.findById(id);
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // 2. Check Permissions
        const isOwner = profile.userId.toString() === requestingUserId.toString();
        const isAdmin = req.user.role === 'admin';

        let isUnlocked = false;
        if (!isOwner && !isAdmin) {
            const subscription = await Subscription.findOne({ userId: requestingUserId });
            isUnlocked = subscription &&
                subscription.unlockedProfileIds &&
                subscription.unlockedProfileIds.some(pid => pid.toString() === id);

            if (!isUnlocked && !profile.isUnlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'You must unlock this profile to download the biodata.'
                });
            }
        }

        // 3. Prepare Data
        let photoUrl = null;
        let photoBase64 = null;

        if (profile.photos && profile.photos.length > 0) {
            const primary = profile.photos.find(p => p.isPrimary);
            const rawUrl = primary ? primary.url : profile.photos[0].url;
            photoUrl = await getPresignedUrl(rawUrl);

            // Convert to Base64 for reliable PDF rendering
            if (photoUrl) {
                photoBase64 = await fetchImageAsBase64(photoUrl);
            }
        }

        const profileData = {
            ...profile.toObject(),
            photoUrl,
            photoBase64, // Pass the base64 string
            age: profile.age
        };

        // 4. Generate PDF
        const pdfBuffer = await generateProfilePdf(profileData);

        // 5. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Profile_${profile.profileCode}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.end(pdfBuffer);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    downloadProfilePdf
};
