const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

/**
 * Generate HTML template for profile
 */
const generateProfileHtml = (profile) => {
    const formatDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return 'N/A';
        const parts = timeStr.split(':');
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            let hours = parseInt(parts[0], 10);
            let minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const paddedHours = hours.toString().padStart(2, '0');
            return `${paddedHours}:${minutes} ${ampm}`;
        }
        return timeStr;
    };

    // Prioritize Base64 image, fallback to URL, then placeholder
    const photoSrc = profile.photoBase64 || profile.photoUrl || 'https://via.placeholder.com/150?text=No+Photo';

    console.log('Generating PDF for:', profile.firstName, 'Photo source type:', profile.photoBase64 ? 'Base64' : 'URL');

    // Tighter styles for guaranteed single page fit
    const styles = `
        <style>
            @page { margin: 15px; size: A4; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; max-width: 100%; margin: 0; padding: 20px; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #e65100; padding-bottom: 8px; margin-bottom: 15px; }
            .header h1 { color: #e65100; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { color: #666; margin: 2px 0 0; font-size: 11px; }
            
            .content-wrapper { display: flex; flex-direction: column; gap: 10px; }
            
            .profile-summary { display: flex; gap: 20px; margin-bottom: 15px; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .profile-photo { width: 130px; height: 170px; object-fit: cover; border-radius: 6px; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .profile-main-info { flex: 1; padding-top: 5px; }
            .profile-main-info h2 { margin: 0 0 5px; color: #333; font-size: 22px; }
            
            .section { margin-bottom: 5px; background: transparent; border-radius: 4px; overflow: hidden; }
            .section-title { background: #fff3e0; color: #e65100; padding: 3px 10px; font-weight: bold; font-size: 11px; border-left: 4px solid #e65100; margin-bottom: 5px; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 20px; padding: 0 10px; }
            .grid-full { display: grid; grid-template-columns: 1fr; gap: 2px 20px; padding: 0 10px; }
            
            .row { display: flex; border-bottom: 1px solid #f9f9f9; padding: 2px 0; align-items: baseline; }
            .label { width: 110px; font-weight: bold; color: #555; flex-shrink: 0; font-size: 10px; }
            .value { flex: 1; color: #000; font-weight: 500; font-size: 11px; }
            
            .footer { text-align: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 5px; font-size: 8px; color: #999; }
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                color: rgba(230, 81, 0, 0.08);
                white-space: nowrap;
                z-index: -10;
                font-weight: bold;
                pointer-events: none;
                width: 150%;
                text-align: center;
            }
        </style>
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Profile - ${profile.profileCode}</title>
        ${styles}
    </head>
    <body>
        <div class="watermark">VIDHILIKHIT MATRIMONY</div>
        <div class="header">
            <h1>VidhiLikhit Matrimony</h1>
            <p>Trusted & Verified Matrimonial Services</p>
        </div>

        <div class="profile-summary">
            <!-- Use object-fit: cover and specific dimensions -->
            <img src="${photoSrc}" class="profile-photo" alt="Profile Photo" onerror="this.src='https://via.placeholder.com/150?text=Error'"/>
            <div class="profile-main-info">
                <h2>${profile.firstName}</h2>
                <div style="color: #e65100; font-weight: bold; margin-bottom: 10px; font-size: 14px;">${profile.profileCode}</div>
                
                <div class="grid" style="padding: 0; gap: 4px 20px;">
                    <div class="row">
                        <span class="label" style="width: 100px;">Age / Height:</span>
                        <span class="value">${profile.age} yrs, ${profile.height || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label" style="width: 100px;">Marital Status:</span>
                        <span class="value" style="text-transform: capitalize;">${profile.maritalStatus || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label" style="width: 100px;">Location:</span>
                        <span class="value">${profile.currentLocation || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label" style="width: 100px;">Education:</span>
                        <span class="value">${profile.education || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label" style="width: 100px;">Occupation:</span>
                        <span class="value">${profile.occupation || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label" style="width: 100px;">Income:</span>
                        <span class="value">${profile.annualIncome || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="section">
                <div class="section-title">Personal Information</div>
                <div class="grid">
                    <div class="row"><span class="label">Date of Birth:</span><span class="value">${formatDate(profile.dateOfBirth)}</span></div>
                    <div class="row"><span class="label">Time of Birth:</span><span class="value">${formatTime12Hour(profile.timeOfBirth)}</span></div>
                    <div class="row"><span class="label">Profile For:</span><span class="value">${profile.profileFor || 'N/A'}</span></div>
                    <div class="row"><span class="label">Diet:</span><span class="value">${profile.diet || 'N/A'}</span></div>
                    <div class="row"><span class="label">Working Place:</span><span class="value">${profile.workingPlace || 'N/A'}</span></div>
                    <div class="row"><span class="label">Assets:</span><span class="value">${profile.assets || 'N/A'}</span></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Religious & Astrological</div>
                <div class="grid">
                    <div class="row"><span class="label">Caste:</span><span class="value">${profile.caste || 'N/A'}</span></div>
                    <div class="row"><span class="label">Sub Caste:</span><span class="value">${profile.subCaste || 'N/A'}</span></div>
                    <div class="row"><span class="label">Gotra:</span><span class="value">${profile.gotra || 'N/A'}</span></div>
                    <div class="row"><span class="label">Rashi:</span><span class="value">${profile.rashi || 'N/A'}</span></div>
                    <div class="row"><span class="label">Nakshatra:</span><span class="value">${profile.nakshatra || 'N/A'}</span></div>
                    <div class="row"><span class="label">Nadi:</span><span class="value">${profile.nadi || 'N/A'}</span></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Family Details</div>
                <div class="grid">
                    <div class="row"><span class="label">Father's Name:</span><span class="value">${profile.fatherName || 'N/A'}</span></div>
                    <div class="row"><span class="label">Mother's Name:</span><span class="value">${profile.motherName || 'N/A'}</span></div>
                    <div class="row"><span class="label">Brothers:</span><span class="value">${profile.brother || 'N/A'}</span></div>
                    <div class="row"><span class="label">Sisters:</span><span class="value">${profile.sister || 'N/A'}</span></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="grid">
                    <div class="row"><span class="label">Contact Number:</span><span class="value">${profile.contactNumber || 'N/A'}</span></div>
                    <div class="row"><span class="label">Sender's Info:</span><span class="value">${profile.sendersInfo || 'N/A'}</span></div>
                    <div class="row" style="grid-column: span 2;"><span class="label">Address:</span><span class="value">${profile.postalAddress || 'N/A'}</span></div>
                </div>
            </div>

             ${profile.expectations ? `
            <div class="section">
                <div class="section-title">Partner Expectations</div>
                <div style="padding: 0 10px;">
                    <p style="margin: 0; font-size: 10px;">${profile.expectations.substring(0, 300)}${profile.expectations.length > 300 ? '...' : ''}</p>
                </div>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} | VidhiLikhit Matrimony</p>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate PDF from profile data
 * @param {Object} profile - Profile data
 * @returns {Promise<Buffer>} - PDF Buffer
 */
const generateProfilePdf = async (profile) => {
    try {
        console.log(`Starting PDF generation for profile: ${profile.profileCode}`);
        const browser = await puppeteer.launch({
            headless: true, // Use boolean for compatibility
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Fix for low memory/docker
                '--disable-gpu',           // Disable GPU
                '--font-render-hinting=none' // Better text rendering
            ]
        });
        const page = await browser.newPage();

        console.log('Generating HTML content...');
        const html = generateProfileHtml(profile);

        // Use 'domcontentloaded' to avoid strict network idle wait which can fail with external images
        // Also add timeout to prevent indefinite hanging
        await page.setContent(html, {
            waitUntil: ['domcontentloaded', 'networkidle2'],
            timeout: 60000
        });

        console.log('Rendering PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        await browser.close();

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('Generated PDF buffer is empty');
        }

        console.log(`PDF generation complete. Size: ${pdfBuffer.length} bytes`);
        return pdfBuffer;

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};

/**
 * Generate HTML for bulk public profiles PDF
 * No photos included (public endpoint)
 */
const generatePublicProfilesHtml = (profiles, community, gender) => {
    const formatDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return 'N/A';
        const parts = timeStr.split(':');
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            let hours = parseInt(parts[0], 10);
            let minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const paddedHours = hours.toString().padStart(2, '0');
            return `${paddedHours}:${minutes} ${ampm}`;
        }
        return timeStr;
    };

    const filterLabel = [
        community ? community.charAt(0).toUpperCase() + community.slice(1) : 'All',
        gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All'
    ].join(' · ');

    const tableRows = profiles.map((p, index) => {
        const agHeight = `${p.age ? p.age + ' yrs' : 'N/A'}\n${p.height || 'N/A'}`;
        const dobTime = `${formatDate(p.dateOfBirth)}\n${formatTime12Hour(p.timeOfBirth)}\n${agHeight}`;

        const astro = `Gotra: ${p.gotra || 'N/A'}\nRashi: ${p.rashi || 'N/A'}\nNakshatra: ${p.nakshatra || 'N/A'}\nNadi: ${p.nadi || 'N/A'}`;

        const prof = `${p.education || 'N/A'}\n${p.occupation || 'N/A'}\n${p.annualIncome || 'N/A'}`;

        const loc = `Current: ${p.currentLocation || 'N/A'}\nJob: ${p.workingPlace || 'N/A'}`;

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${p.firstName || ''}</strong></td>
                <td style="white-space: pre-line;">${dobTime}</td>
                <td style="white-space: pre-line;">${astro}</td>
                <td style="white-space: pre-line;">${prof}</td>
                <td style="white-space: pre-line;">${loc}</td>
            </tr>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>VidhiLikhit Matrimony - ${filterLabel} Profiles</title>
        <style>
            @page { margin: 20px; size: A4 landscape; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 20px; font-size: 11px; }
            .doc-header { text-align: center; border-bottom: 3px solid #e65100; padding-bottom: 12px; margin-bottom: 20px; }
            .doc-header h1 { color: #e65100; margin: 0 0 4px; font-size: 24px; letter-spacing: 1px; }
            .doc-header .sub { color: #666; font-size: 12px; }
            .filter-badge { display: inline-block; margin-top: 6px; background: #fff3e0; color: #e65100; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; border: 1px solid #ffcc80; }
            .owner-contact { margin-top: 8px; font-size: 11px; color: #444; }
            .owner-contact .sep { margin: 0 8px; color: #ccc; }
            .total-count { text-align: right; color: #888; font-size: 10px; margin-bottom: 10px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th { background: #e65100; color: white; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; vertical-align: top; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            
            .doc-footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 8px; color: #aaa; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80px; color: rgba(230,81,0,0.05); white-space: nowrap; z-index: -10; font-weight: bold; pointer-events: none; }
        </style>
    </head>
    <body>
        <div class="watermark">VIDHILIKHIT MATRIMONY</div>
        <div class="doc-header">
            <h1>VidhiLikhit Matrimony</h1>
            <div class="sub">Trusted &amp; Verified Matrimonial Services — Community Profile Booklet</div>
            <div class="owner-contact">
                <span><strong>Ajeet Allagikar</strong></span>
                <span class="sep">|</span>
                <span>📞 +91 8123656445</span>
                <span class="sep">|</span>
                <span>✉ support@vidhilikhit.com</span>
            </div>
            <div class="filter-badge">${filterLabel} • ${profiles.length} Profile${profiles.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="total-count">Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Total: ${profiles.length} profile(s)</div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">Sr.</th>
                    <th style="width: 15%;">First Name</th>
                    <th style="width: 20%;">DOB, Time, Age & Height</th>
                    <th style="width: 20%;">Gotra, Rashi, Nakshatra, Nadi</th>
                    <th style="width: 20%;">Edu, Occ & Income</th>
                    <th style="width: 20%;">Location (Current & Job)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div class="doc-footer">VidhiLikhit Matrimony — For queries call 8123656445 or email support@vidhilikhit.com</div>
    </body>
    </html>
    `;
};

/**
 * Generate PDF from multiple public profiles
 * @param {Array} profiles - Array of profile documents
 * @param {string} community - e.g. 'brahmin'
 * @param {string} gender - e.g. 'male'
 * @returns {Promise<Buffer>} - PDF Buffer
 */
const generatePublicProfilesPdf = async (profiles, community, gender) => {
    try {
        console.log(`Starting public PDF generation for ${profiles.length} profiles (${community}/${gender})`);
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none'
            ]
        });
        const page = await browser.newPage();
        const html = generatePublicProfilesHtml(profiles, community, gender);

        await page.setContent(html, {
            waitUntil: ['domcontentloaded'],
            timeout: 60000
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('Generated PDF buffer is empty');
        }

        console.log(`Public PDF generation complete. Size: ${pdfBuffer.length} bytes`);
        return pdfBuffer;

    } catch (error) {
        console.error('Public PDF Generation Error:', error);
        throw new Error(`Failed to generate public PDF: ${error.message}`);
    }
};

/**
 * Generate HTML for admin bulk profiles PDF
 * Includes phone number and address (sensitive — admin only)
 */
const generateAdminProfilesHtml = (profiles, community, gender) => {
    const formatDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return 'N/A';
        const parts = timeStr.split(':');
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            let hours = parseInt(parts[0], 10);
            let minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const paddedHours = hours.toString().padStart(2, '0');
            return `${paddedHours}:${minutes} ${ampm}`;
        }
        return timeStr;
    };

    const communityLabel = community && community !== 'all'
        ? community.charAt(0).toUpperCase() + community.slice(1) : 'All';
    const genderLabel = gender && gender !== 'all'
        ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All';
    const filterLabel = `${communityLabel} · ${genderLabel}`;

    const tableRows = profiles.map((p, index) => {
        const agHeight = `${p.age ? p.age + ' yrs' : 'N/A'}\n${p.height || 'N/A'}`;
        const dobTime = `${formatDate(p.dateOfBirth)}\n${formatTime12Hour(p.timeOfBirth)}\n${agHeight}`;

        const astro = `Gotra: ${p.gotra || 'N/A'}\nRashi: ${p.rashi || 'N/A'}\nNakshatra: ${p.nakshatra || 'N/A'}\nNadi: ${p.nadi || 'N/A'}`;

        const prof = `${p.education || 'N/A'}\n${p.occupation || 'N/A'}\n${p.annualIncome || 'N/A'}`;

        const loc = `Current: ${p.currentLocation || 'N/A'}\nJob: ${p.workingPlace || 'N/A'}`;

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${p.firstName || ''}</strong></td>
                <td style="white-space: pre-line;">${dobTime}</td>
                <td style="white-space: pre-line;">${astro}</td>
                <td style="white-space: pre-line;">${prof}</td>
                <td style="white-space: pre-line;">${loc}</td>
                <td><strong>${p.contactNumber || 'N/A'}</strong></td>
            </tr>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>VidhiLikhit Admin — ${filterLabel} Profiles</title>
        <style>
            @page { margin: 20px; size: A4 landscape; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 20px; font-size: 11px; }
            .doc-header { text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 12px; margin-bottom: 20px; }
            .doc-header h1 { color: #1a237e; margin: 0 0 4px; font-size: 24px; letter-spacing: 1px; }
            .doc-header .sub { color: #666; font-size: 12px; }
            .admin-badge-header { display: inline-block; margin-top: 6px; background: #e3f2fd; color: #1a237e; padding: 3px 14px; border-radius: 999px; font-size: 11px; font-weight: bold; border: 1px solid #90caf9; margin-right: 8px; }
            .filter-badge { display: inline-block; margin-top: 6px; background: #fff3e0; color: #e65100; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; border: 1px solid #ffcc80; }
            .owner-contact { margin-top: 8px; font-size: 11px; color: #5c6bc0; }
            .owner-contact .sep { margin: 0 8px; color: #9fa8da; }
            .total-count { text-align: right; color: #888; font-size: 10px; margin-bottom: 10px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th { background: #1a237e; color: white; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; vertical-align: top; }
            tr:nth-child(even) { background-color: #f5f5f5; }
            
            .doc-footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 8px; color: #aaa; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80px; color: rgba(26,35,126,0.04); white-space: nowrap; z-index: -10; font-weight: bold; pointer-events: none; }
            .confidential { position: fixed; bottom: 30px; right: 30px; font-size: 10px; color: rgba(26,35,126,0.2); font-weight: bold; letter-spacing: 2px; transform: rotate(-10deg); }
        </style>
    </head>
    <body>
        <div class="watermark">ADMIN CONFIDENTIAL</div>
        <div class="confidential">CONFIDENTIAL</div>
        <div class="doc-header">
            <h1>VidhiLikhit Matrimony</h1>
            <div class="sub">Admin Report — Includes Contact Details</div>
            <div class="owner-contact">
                <span><strong>Ajeet Allagikar</strong></span>
                <span class="sep">|</span>
                <span>📞 +91 8123656445</span>
                <span class="sep">|</span>
                <span>✉ support@vidhilikhit.com</span>
            </div>
            <div>
                <span class="admin-badge-header">ADMIN ONLY</span>
                <span class="filter-badge">${filterLabel} • ${profiles.length} Profile${profiles.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
        <div class="total-count">Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Total: ${profiles.length} profile(s)</div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">Sr.</th>
                    <th style="width: 15%;">First Name</th>
                    <th style="width: 16%;">DOB, Time, Age & Height</th>
                    <th style="width: 16%;">Gotra, Rashi, Nakshatra, Nadi</th>
                    <th style="width: 16%;">Edu, Occ & Income</th>
                    <th style="width: 16%;">Location (Current & Job)</th>
                    <th style="width: 16%;">Phone Number</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div class="doc-footer">VidhiLikhit Admin Report — CONFIDENTIAL — For internal use only</div>
    </body>
    </html>
    `;
};

/**
 * Generate admin PDF (includes contact: phone + address)
 */
const generateAdminProfilesPdf = async (profiles, community, gender) => {
    try {
        console.log(`Starting admin PDF generation for ${profiles.length} profiles (${community}/${gender})`);
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none'
            ]
        });
        const page = await browser.newPage();
        const html = generateAdminProfilesHtml(profiles, community, gender);

        await page.setContent(html, { waitUntil: ['domcontentloaded'], timeout: 60000 });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        if (!pdfBuffer || pdfBuffer.length === 0) throw new Error('Generated PDF buffer is empty');
        console.log(`Admin PDF generation complete. Size: ${pdfBuffer.length} bytes`);
        return pdfBuffer;

    } catch (error) {
        console.error('Admin PDF Generation Error:', error);
        throw new Error(`Failed to generate admin PDF: ${error.message}`);
    }
};

module.exports = {
    generateProfilePdf,
    generatePublicProfilesPdf,
    generateAdminProfilesPdf
};
