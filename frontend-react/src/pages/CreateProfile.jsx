import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
    User, Calendar, Ruler, Heart, BookOpen, Briefcase, MapPin,
    Users, Phone, FileText, Camera, ChevronRight, ChevronLeft, Check, Loader2
} from 'lucide-react';
import { createProfile, getMyProfile } from '../services/profileService';
import { updateUser } from '../redux/slices/authSlice';
import ImageCropModal from '../components/ImageCropModal';

// ─── Step Definitions ───────────────────────────────────────────
const STEPS = [
    { id: 1, title: 'Personal', icon: User },
    { id: 2, title: 'Community', icon: Heart },
    { id: 3, title: 'Professional', icon: Briefcase },
    { id: 4, title: 'Family', icon: Users },
    { id: 5, title: 'Contact', icon: Phone }
];

const INITIAL_FORM = {
    firstName: '', lastName: '', dateOfBirth: '', gender: '', height: '', maritalStatus: '',
    caste: '', subCaste: '', gotra: '', rashi: '', nakshatra: '', nadi: '', timeOfBirth: '',
    education: '', occupation: '', annualIncome: '', assets: '',
    fatherName: '', motherName: '', brother: '', sister: '', profileFor: '',
    currentLocation: '', workingPlace: '', country: '', postalAddress: '', contactNumber: '',
    sendersInfo: '', expectations: ''
};

const COUNTRIES = [
    'India',
    'United States', 'United Kingdom', 'Canada', 'Australia',
    'United Arab Emirates', 'Saudi Arabia', 'Germany', 'Singapore', 'New Zealand',
    'Other'
];

// ─── Caste / Sub-Caste Data ─────────────────────────────────────
const SUB_CASTES = {
    Brahmin: ['Smartha', 'Vaishnava', 'Shri Vaishnava', 'Other'],
    Lingayat: [
        'Panchamasali', 'Jangam', 'Banajiga (Linga Balija)', 'Sadar (Sadaru)',
        'Ganiga (Sajjanaganigar)', 'Kuruhinashetty (Jada/Bilimagga/Hatagar)',
        'Agasa (Madivala/Sakalavadu)', 'Hadapada (Nayinda/Navi)', 'Kumbara (Chakrasali)',
        'Gowli (Gauli/Kawadiga)', 'Neygi (Neelagar/Nekar)', 'Nonaba',
        'Akkasale (Sonar/Panchal)', 'Badigar (Carpenters)', 'Kammara (Blacksmiths)',
        'Medara', 'Uppara', 'Hugar (Jeer/Phoolmali)', 'Helava',
        'Ambig (Gangamatha/Sunagara)', 'Bajanthri', 'Bandari', 'Kshaurika',
        'Navalig', 'Kamsala', 'Aradhya', 'Sivasimpi (Shimpi/Simpi)', 'Malgar',
        'Handevazir', 'Kudavakkal', 'Reddi Lingayat', 'Beldar', 'Lonari',
        'Gavali', 'Basuvi', 'Goud-Lingayat', 'Ilgar', 'Dixwant', 'Jingar',
        'Pattesali', 'Padamsali', 'Vani', 'Vakkaliga (Lingayat-Okkaliga)',
        'Kachari', 'Kalal', 'Yadav', 'Samagara', 'Silawat', 'Turkar', 'Other'
    ]
};

const GOTRAS = [
    'Kashyapa', 'Vashistha', 'Agastya', 'Bharadwaja', 'Gautama',
    'Atri', 'Vishvamitra', 'Jamadagni', 'Angirasa', 'Bhrigu',
    'Shandilya', 'Kaundinya', 'Kaushika', 'Parashara', 'Srivatsa',
    'Vatsa', 'Harita', 'Upamanyu', 'Garga', 'Mudgala',
    'Katyayana', 'Sankriti', 'Lohita', 'Kutsa', 'Maitreya',
    'Kanva', 'Jatukarna', 'Kapil', 'Mandavya', 'Dhananjaya', 'Other'
];

const RASHIS = [
    'Mesha (Aries) ♈', 'Vrishabha (Taurus) ♉', 'Mithuna (Gemini) ♊',
    'Karka (Cancer) ♋', 'Simha (Leo) ♌', 'Kanya (Virgo) ♍',
    'Tula (Libra) ♎', 'Vrischika (Scorpio) ♏', 'Dhanu (Sagittarius) ♐',
    'Makara (Capricorn) ♑', 'Kumbha (Aquarius) ♒', 'Meena (Pisces) ♓', 'Other'
];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
    'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati', 'Other'
];

const NADIS = ['Adi', 'Madhya', 'Antya', 'Other'];

// ─── Form Field Component ───────────────────────────────────────
const FormField = ({ label, name, type = 'text', value, onChange, required, options, placeholder, icon: Icon }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="label flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5 text-primary-500" />}
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'select' ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="input"
            >
                <option value="">Select {label}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={3}
                className="input resize-none"
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="input"
            />
        )}
    </div>
);

/** Dropdown that reveals a free-text input when "Other" is selected */
const DropdownWithOther = ({ label, name, options, value, isOther, onSelect, onOtherChange, placeholder = '' }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="label">{label}</label>
        <select id={name} value={isOther ? 'Other' : value} onChange={onSelect} className="input">
            <option value="">Select {label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {isOther && (
            <input
                type="text"
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                value={value}
                onChange={onOtherChange}
                className="input mt-2"
            />
        )}
    </div>
);

// ─── Step Progress Bar ──────────────────────────────────────────
const StepProgress = ({ currentStep }) => (
    <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${isCompleted ? 'bg-green-500 text-white' :
                                isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' :
                                    'bg-slate-200 dark:bg-slate-700 text-slate-400'}
                        `}>
                            {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-primary-600' : 'text-slate-400'
                            }`}>
                            {step.title}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded transition-colors ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Main Component ─────────────────────────────────────────────
const CreateProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    // Tracks which community fields have "Other" selected
    const [othersMap, setOthersMap] = useState({ subCaste: false, gotra: false, rashi: false, nakshatra: false, nadi: false });
    // Crop modal state: { imageSrc, fileName, type: 'primary'|'gallery', pendingQueue: File[] }
    const [cropTarget, setCropTarget] = useState(null);

    // Fetch existing profile on mount
    useEffect(() => {
        const fetchExistingProfile = async () => {
            try {
                const response = await getMyProfile();
                if (response.success && response.data) {
                    const p = response.data;
                    setIsEditMode(true);

                    // Format dateOfBirth for input[type=date]
                    let dob = '';
                    if (p.dateOfBirth) {
                        const d = new Date(p.dateOfBirth);
                        dob = d.toISOString().split('T')[0];
                    }

                    // Determine gender from profileCode (4th char: m/f)
                    let gender = '';
                    if (p.profileCode) {
                        const g = p.profileCode[3]?.toLowerCase();
                        if (g === 'm') gender = 'm';
                        else if (g === 'f') gender = 'f';
                    }

                    setFormData({
                        firstName: p.firstName || '',
                        lastName: p.lastName || '',
                        dateOfBirth: dob,
                        gender: gender,
                        height: p.height || '',
                        maritalStatus: p.maritalStatus || '',
                        caste: p.caste || '',
                        subCaste: p.subCaste || '',

                        gotra: p.gotra || '',
                        rashi: p.rashi || '',
                        nakshatra: p.nakshatra || '',
                        nadi: p.nadi || '',
                        timeOfBirth: p.timeOfBirth || '',
                        education: p.education || '',
                        occupation: p.occupation || '',
                        annualIncome: p.annualIncome || '',
                        assets: p.assets || '',
                        fatherName: p.fatherName || '',
                        motherName: p.motherName || '',
                        brother: p.brother || '',
                        sister: p.sister || '',
                        profileFor: p.profileFor || '',
                        currentLocation: p.currentLocation || '',
                        workingPlace: p.workingPlace || '',
                        country: p.country || '',
                        postalAddress: p.postalAddress || '',
                        contactNumber: p.contactNumber || '',
                        sendersInfo: p.sendersInfo || '',
                        expectations: p.expectations || ''
                    });

                    // Detect custom "Other" values for all community dropdowns
                    const detectOthers = {};
                    const communityChecks = {
                        subCaste: p.caste && p.subCaste && SUB_CASTES[p.caste] ? SUB_CASTES[p.caste] : null,
                        gotra: p.gotra ? GOTRAS : null,
                        rashi: p.rashi ? RASHIS : null,
                        nakshatra: p.nakshatra ? NAKSHATRAS : null,
                        nadi: p.nadi ? NADIS : null,
                        country: p.country ? COUNTRIES : null,
                    };
                    const communityValues = { subCaste: p.subCaste, gotra: p.gotra, rashi: p.rashi, nakshatra: p.nakshatra, nadi: p.nadi, country: p.country };
                    for (const [field, list] of Object.entries(communityChecks)) {
                        if (list && communityValues[field] && !list.includes(communityValues[field])) {
                            detectOthers[field] = true;
                        }
                    }
                    if (Object.keys(detectOthers).length > 0) {
                        setOthersMap(prev => ({ ...prev, ...detectOthers }));
                    }

                    // Show existing photo
                    if (p.photoUrl) {
                        setPhotoPreview(p.photoUrl);
                    }

                    // Show existing gallery
                    if (p.photos && p.photos.length > 1) {
                        // Filter out primary photo and get the rest
                        const gallery = p.photos.filter(ph => !ph.isPrimary);
                        setExistingGallery(gallery);
                    }
                }
            } catch (err) {
                // No profile found (404) — that's fine, stay in create mode
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchExistingProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'caste') {
            // Reset sub-caste when caste changes
            setFormData(prev => ({ ...prev, caste: value, subCaste: '' }));
            setOthersMap(prev => ({ ...prev, subCaste: false }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Generic handler factory for any DropdownWithOther select
    const makeDropdownHandler = (fieldName) => (e) => {
        const val = e.target.value;
        if (val === 'Other') {
            setFormData(prev => ({ ...prev, [fieldName]: '' }));
            setOthersMap(prev => ({ ...prev, [fieldName]: true }));
        } else {
            setFormData(prev => ({ ...prev, [fieldName]: val }));
            setOthersMap(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    // Generic handler factory for the "Other" free-text input
    const makeOtherInputHandler = (fieldName) => (e) =>
        setFormData(prev => ({ ...prev, [fieldName]: e.target.value }));

    // Opens crop modal for the primary profile photo
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        // Reset input so same file can be re-selected after cancel
        e.target.value = '';
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { toast.error('Photo must be under 50MB'); return; }
        setCropTarget({
            imageSrc: URL.createObjectURL(file),
            fileName: file.name,
            type: 'primary',
            pendingQueue: []
        });
    };

    // Opens crop modal for each gallery file in sequence
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        e.target.value = '';
        const slotsLeft = 2 - galleryFiles.length - existingGallery.length;
        if (files.length > slotsLeft) {
            toast.error(`You can only add ${slotsLeft} more photo${slotsLeft === 1 ? '' : 's'}`);
            return;
        }
        const validFiles = files.filter(f => {
            if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name} is too large (max 50MB)`); return false; }
            return true;
        });
        if (validFiles.length === 0) return;
        // Open crop modal for the first file; the rest go into pendingQueue
        const [first, ...rest] = validFiles;
        setCropTarget({
            imageSrc: URL.createObjectURL(first),
            fileName: first.name,
            type: 'gallery',
            pendingQueue: rest
        });
    };

    // Called when user clicks "Crop & Use"
    const handleCropConfirm = useCallback((croppedFile, previewUrl) => {
        const { type, pendingQueue } = cropTarget;
        if (type === 'primary') {
            setPhotoFile(croppedFile);
            setPhotoPreview(previewUrl);
        } else {
            setGalleryFiles(prev => [...prev, croppedFile]);
            setGalleryPreviews(prev => [...prev, previewUrl]);
        }
        // If more gallery files are queued, open the modal for the next one
        if (pendingQueue && pendingQueue.length > 0) {
            const [next, ...remaining] = pendingQueue;
            setCropTarget({
                imageSrc: URL.createObjectURL(next),
                fileName: next.name,
                type: 'gallery',
                pendingQueue: remaining
            });
        } else {
            setCropTarget(null);
        }
    }, [cropTarget]);

    // Called when user cancels the crop modal (discards entire remaining queue)
    const handleCropCancel = useCallback(() => {
        setCropTarget(null);
    }, []);

    const removeGalleryImage = (index, isExisting) => {
        if (isExisting) {
            // For now, we don't support deleting existing gallery images via API in this view
            // Just remove from local state view
            setExistingGallery(prev => prev.filter((_, i) => i !== index));
        } else {
            setGalleryFiles(prev => prev.filter((_, i) => i !== index));
            setGalleryPreviews(prev => {
                // Revoke URL to avoid memory leaks
                URL.revokeObjectURL(prev[index]);
                return prev.filter((_, i) => i !== index);
            });
        }
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.firstName.trim()) { toast.error('Please enter your first name'); return false; }
            if (!formData.lastName.trim()) { toast.error('Please enter your last name'); return false; }
            if (!formData.dateOfBirth) { toast.error('Please enter date of birth'); return false; }
            if (!formData.gender) { toast.error('Please select gender'); return false; }
        }
        return true;
    };

    const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 5)); };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setIsSubmitting(true);

        try {
            // Pass the S3 keys of existing gallery photos to keep
            // so the backend can remove any that were deleted
            const photosToKeep = existingGallery.map(ph => ph.rawUrl || ph.url);
            const response = await createProfile(formData, photoFile, galleryFiles, photosToKeep);
            if (response.success) {
                // Sync fresh photoUrl into Redux store so navbar avatar updates immediately
                if (response.data?.photoUrl) {
                    dispatch(updateUser({ photoUrl: response.data.photoUrl }));
                }
                toast.success(isEditMode ? 'Profile updated successfully! ✨' : 'Profile created successfully! 🎉');
                navigate('/profiles');
            } else {
                toast.error(response.message || 'Failed to save profile');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading State ───────────────────────────────────────────
    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    // ── Step Content Renderer ───────────────────────────────────
    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required icon={User} placeholder="Enter your first name" />
                    <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required icon={User} placeholder="Enter your last name" />
                    <FormField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required icon={Calendar} />
                    <FormField label="Gender" name="gender" type="select" value={formData.gender} onChange={handleChange} required icon={User}
                        options={[{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }]} />
                    <FormField label="Height" name="height" value={formData.height} onChange={handleChange} icon={Ruler} placeholder="e.g. 5'8&quot;" />
                    <FormField label="Marital Status" name="maritalStatus" type="select" value={formData.maritalStatus} onChange={handleChange} icon={Heart}
                        options={[
                            { value: 'unmarried', label: 'Unmarried' },
                            { value: 'divorced', label: 'Divorced' },
                            { value: 'widow', label: 'Widow' },
                            { value: 'widower', label: 'Widower' }
                        ]} />
                    <FormField label="Profile For" name="profileFor" type="select" value={formData.profileFor} onChange={handleChange} icon={Users}
                        options={[
                            { value: 'self', label: 'Self' },
                            { value: 'son', label: 'Son' },
                            { value: 'daughter', label: 'Daughter' },
                            { value: 'brother', label: 'Brother' },
                            { value: 'sister', label: 'Sister' }
                        ]} />
                </div>
            );
            case 2: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Caste Dropdown */}
                    <div className="space-y-1.5">
                        <label htmlFor="caste" className="label flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-primary-500" />
                            Caste
                        </label>
                        <select
                            id="caste"
                            name="caste"
                            value={formData.caste}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="">Select Caste</option>
                            <option value="Brahmin">Brahmin</option>
                            <option value="Lingayat">Lingayat</option>
                        </select>
                    </div>

                    {/* Sub-Caste Dropdown (depends on caste) */}
                    <div className="space-y-1.5">
                        <label htmlFor="subCaste" className="label">Sub-Caste</label>
                        {formData.caste && SUB_CASTES[formData.caste] ? (
                            <>
                                <select
                                    id="subCaste"
                                    value={othersMap.subCaste ? 'Other' : formData.subCaste}
                                    onChange={makeDropdownHandler('subCaste')}
                                    className="input"
                                >
                                    <option value="">Select Sub-Caste</option>
                                    {SUB_CASTES[formData.caste].map(sc => (
                                        <option key={sc} value={sc}>{sc}</option>
                                    ))}
                                </select>
                                {othersMap.subCaste && (
                                    <input
                                        type="text"
                                        placeholder="Enter your sub-caste"
                                        value={formData.subCaste}
                                        onChange={makeOtherInputHandler('subCaste')}
                                        className="input mt-2"
                                    />
                                )}
                            </>
                        ) : (
                            <input
                                id="subCaste"
                                type="text"
                                name="subCaste"
                                value={formData.subCaste}
                                onChange={handleChange}
                                placeholder={formData.caste ? 'Enter sub-caste' : 'Select a caste first'}
                                disabled={!formData.caste}
                                className="input disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        )}
                    </div>

                    <DropdownWithOther
                        label="Gotra" name="gotra"
                        options={GOTRAS}
                        value={formData.gotra}
                        isOther={othersMap.gotra}
                        onSelect={makeDropdownHandler('gotra')}
                        onOtherChange={makeOtherInputHandler('gotra')}
                        placeholder="Enter your gotra"
                    />
                    <DropdownWithOther
                        label="Rashi" name="rashi"
                        options={RASHIS}
                        value={formData.rashi}
                        isOther={othersMap.rashi}
                        onSelect={makeDropdownHandler('rashi')}
                        onOtherChange={makeOtherInputHandler('rashi')}
                        placeholder="Enter your rashi"
                    />
                    <DropdownWithOther
                        label="Nakshatra" name="nakshatra"
                        options={NAKSHATRAS}
                        value={formData.nakshatra}
                        isOther={othersMap.nakshatra}
                        onSelect={makeDropdownHandler('nakshatra')}
                        onOtherChange={makeOtherInputHandler('nakshatra')}
                        placeholder="Enter your nakshatra"
                    />
                    <DropdownWithOther
                        label="Nadi" name="nadi"
                        options={NADIS}
                        value={formData.nadi}
                        isOther={othersMap.nadi}
                        onSelect={makeDropdownHandler('nadi')}
                        onOtherChange={makeOtherInputHandler('nadi')}
                        placeholder="Enter your nadi"
                    />
                    <FormField label="Time of Birth" name="timeOfBirth" type="time" value={formData.timeOfBirth} onChange={handleChange} icon={Calendar} />
                </div>
            );
            case 3: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Education" name="education" value={formData.education} onChange={handleChange} icon={BookOpen} placeholder="e.g. B.E. Computer Science" />
                    <FormField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} icon={Briefcase} placeholder="e.g. Software Engineer" />
                    <FormField label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="e.g. ₹5,00,000" />
                    <FormField label="Assets" name="assets" value={formData.assets} onChange={handleChange} placeholder="e.g. House, Car" />
                </div>
            );
            case 4: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} icon={User} placeholder="Father's full name" />
                    <FormField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} icon={User} placeholder="Mother's full name" />
                    <FormField label="Brothers" name="brother" value={formData.brother} onChange={handleChange} placeholder="e.g. 1 (married)" />
                    <FormField label="Sisters" name="sister" value={formData.sister} onChange={handleChange} placeholder="e.g. 2 (1 married)" />
                </div>
            );
            case 5: return (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Current Location" name="currentLocation" value={formData.currentLocation} onChange={handleChange} icon={MapPin} placeholder="e.g. Bangalore, Karnataka" />
                        <FormField label="Work Location" name="workingPlace" value={formData.workingPlace} onChange={handleChange} icon={MapPin} placeholder="e.g. Bengaluru, Dubai" />
                        <DropdownWithOther
                            label="Country"
                            name="country"
                            options={COUNTRIES}
                            value={formData.country}
                            isOther={othersMap.country}
                            onSelect={makeDropdownHandler('country')}
                            onOtherChange={makeOtherInputHandler('country')}
                            placeholder="Enter country name"
                        />
                        <FormField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} icon={Phone} placeholder="+91 1234567890" />
                        <FormField label="Sender's Info" name="sendersInfo" value={formData.sendersInfo} onChange={handleChange} placeholder="Who is sending this profile" />
                    </div>
                    <FormField label="Postal Address" name="postalAddress" type="textarea" value={formData.postalAddress} onChange={handleChange} icon={MapPin} placeholder="Full postal address" />
                    <FormField label="Expectations" name="expectations" type="textarea" value={formData.expectations} onChange={handleChange} icon={FileText} placeholder="What are you looking for in a partner?" />

                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="label flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-primary-500" />
                            Profile Photo
                        </label>
                        <div className="flex items-center gap-4">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-lg object-cover border-2 border-primary-200 shadow-sm"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-slate-400" />
                                </div>
                            )}
                            <label className="btn btn-outline cursor-pointer text-sm">
                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">JPG, JPEG, PNG. Max 50MB.</p>
                    </div>

                    {/* Gallery Upload */}
                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="label flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-primary-500" />
                            Additional Photos (Max 2)
                        </label>
                        <p className="text-xs text-slate-500 mb-3">Add up to 2 extra photos for your gallery (only visible to unlocked profiles).</p>

                        <div className="flex flex-wrap gap-4">
                            {/* Existing Gallery Images */}
                            {existingGallery.map((photo, index) => (
                                <div key={`existing-${index}`} className="relative group shrink-0">
                                    <img
                                        src={photo.url}
                                        alt="Gallery"
                                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(index, true)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ))}

                            {/* New Previews */}
                            {galleryPreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative group shrink-0">
                                    <img
                                        src={preview}
                                        alt="New Gallery"
                                        className="w-20 h-20 rounded-lg object-cover border border-primary-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(index, false)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button — show when total photos < 2 */}
                            {existingGallery.length + galleryFiles.length < 2 && (
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                                    <Camera className="w-6 h-6 text-slate-400" />
                                    <span className="text-[10px] text-slate-500 mt-1">Add</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        {isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}
                    </h1>
                    <p className="text-slate-500">
                        {isEditMode ? 'Update your details to keep your profile fresh' : 'Fill in your details to find your perfect match'}
                    </p>
                </div>

                {/* Step Progress */}
                <StepProgress currentStep={step} />

                {/* Form Card */}
                <div className="card p-6 md:p-8 animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                        {React.createElement(STEPS[step - 1].icon, { className: 'w-5 h-5 text-primary-600' })}
                        {STEPS[step - 1].title} Details
                    </h2>

                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={step === 1 ? () => navigate(-1) : prevStep}
                            className="btn btn-outline flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {step === 1 ? 'Cancel' : 'Previous'}
                        </button>

                        {step < 5 ? (
                            <button onClick={nextStep} className="btn btn-primary flex items-center gap-2">
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? 'Updating...' : 'Creating...'}</>
                                ) : (
                                    <><Check className="w-4 h-4" /> {isEditMode ? 'Update Profile' : 'Create Profile'}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Crop Modal Overlay */}
            {cropTarget && (
                <ImageCropModal
                    imageSrc={cropTarget.imageSrc}
                    fileName={cropTarget.fileName}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
};

export default CreateProfile;
