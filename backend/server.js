/**
 * CERTVault - Decentralized Blockchain Certificate Verification System
 * @version 1.0.0
 * @description Tamper-proof certificate storage and verification using blockchain technology
 * @author Tech Titans
 * @license MIT
 */

const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

// ==================== INITIALIZATION ====================

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== DATA PERSISTENCE ====================

const DATA_FILE = path.join(__dirname, 'data.json');

/**
 * Load data from JSON file
 * @returns {Object} Loaded data object
 */
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return null;
}

/**
 * Save data to JSON file
 * @param {Object} data - Data to save
 * @returns {boolean} Success status
 */
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Initialize data structures
let blockchain = [];
let certificateStore = {};
let revokedCertificates = new Set();
let totalVerifications = 0;

const savedData = loadData();

if (savedData && savedData.blockchain && savedData.blockchain.length > 0) {
    blockchain = savedData.blockchain;
    certificateStore = savedData.certificates || {};
    revokedCertificates = new Set(savedData.revokedCertificates || []);
    totalVerifications = savedData.totalVerifications || 0;
    console.log('✅ Data loaded from data.json');
} else {
    // Create genesis block
    const genesisBlock = {
        index: 0,
        timestamp: Date.now(),
        data: 'GENESIS_BLOCK',
        previousHash: '0'.repeat(64),
        hash: crypto.createHash('sha256').update('GENESIS_BLOCK').digest('hex'),
    };
    blockchain.push(genesisBlock);
    console.log('✅ Genesis block created');
}

/**
 * Persist current state to disk
 */
function persistData() {
    saveData({
        blockchain: blockchain,
        certificates: certificateStore,
        revokedCertificates: [...revokedCertificates],
        totalVerifications: totalVerifications,
        metadata: {
            lastUpdated: new Date().toISOString(),
            version: '1.0.0',
            totalCertificatesIssued: Object.keys(certificateStore).length,
        },
    });
}

// ==================== SECURITY MIDDLEWARE ====================

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const qrcodesDir = path.join(__dirname, 'public', 'qrcodes');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(qrcodesDir)) fs.mkdirSync(qrcodesDir, { recursive: true });

// ==================== MULTER CONFIGURATION ====================

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
    }
};

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});

// ==================== BLOCKCHAIN HELPER FUNCTIONS ====================

/**
 * Calculate SHA-256 hash of a block
 */
function calculateBlockHash(index, timestamp, data, previousHash) {
    const blockString = `${index}${timestamp}${JSON.stringify(data)}${previousHash}`;
    return crypto.createHash('sha256').update(blockString).digest('hex');
}

/**
 * Add new block to blockchain
 */
function addBlock(data) {
    const previousBlock = blockchain[blockchain.length - 1];
    const index = blockchain.length;
    const timestamp = Date.now();
    const previousHash = previousBlock.hash;
    const hash = calculateBlockHash(index, timestamp, data, previousHash);

    const newBlock = { index, timestamp, data, previousHash, hash };
    blockchain.push(newBlock);
    persistData();
    return newBlock;
}

/**
 * Validate blockchain integrity
 */
function isBlockchainValid() {
    for (let i = 1; i < blockchain.length; i++) {
        const current = blockchain[i];
        const previous = blockchain[i - 1];
        if (current.previousHash !== previous.hash) return false;
        const recalculated = calculateBlockHash(
            current.index, current.timestamp, current.data, current.previousHash
        );
        if (current.hash !== recalculated) return false;
    }
    return true;
}

/**
 * Generate SHA-256 hash of file buffer
 */
function generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Sanitize string input
 */
function sanitizeString(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
}

// ==================== PAGE ROUTES ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.get('/verify/:certId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.get('/blockchain', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blockchain.html'));
});

// ==================== API ROUTES ====================

/**
 * POST /api/upload - Issue new certificate
 */
app.post('/api/upload', upload.single('certificate'), [
    body('studentName').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('courseName').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('institution').optional().trim().isLength({ max: 200 }),
    body('issueDate').optional().isISO8601(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const studentName = sanitizeString(req.body.studentName);
        const courseName = sanitizeString(req.body.courseName);
        const institution = sanitizeString(req.body.institution) || 'Unknown Institution';
        const issueDate = req.body.issueDate || new Date().toISOString().split('T')[0];
        const fileHash = generateFileHash(req.file.buffer);
        const certId = uuidv4();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const verifyUrl = `${baseUrl}/verify/${certId}`;

        const blockData = {
            certId, studentName, courseName, issueDate, institution,
            fileName: req.file.originalname, fileSize: req.file.size,
            mimeType: req.file.mimetype, fileHash, issuedAt: Date.now(),
        };

        const newBlock = addBlock(blockData);

        certificateStore[certId] = {
            ...blockData,
            blockIndex: newBlock.index,
            blockHash: newBlock.hash,
            verifyUrl,
            revoked: false,
            revokedAt: null,
            revokedReason: null,
        };
        persistData();

        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 300, margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });

        return res.status(201).json({
            success: true,
            certId,
            fileHash,
            blockIndex: newBlock.index,
            blockHash: newBlock.hash,
            verifyUrl,
            qrCode: qrCodeDataUrl,
            message: 'Certificate successfully anchored to blockchain',
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/verify/:certId - Verify certificate by ID
 */
app.get('/api/verify/:certId', [
    param('certId').isUUID().withMessage('Invalid certificate ID format'),
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ valid: false, reason: 'Invalid certificate ID format' });
        }

        const { certId } = req.params;
        const certificate = certificateStore[certId];

        if (!certificate) {
            return res.status(404).json({ valid: false, reason: 'Certificate ID not found on blockchain' });
        }

        if (revokedCertificates.has(certId) || certificate.revoked === true) {
            return res.json({
                valid: false,
                revoked: true,
                reason: 'This certificate has been revoked',
                certificate: {
                    certId: certificate.certId,
                    studentName: certificate.studentName,
                    courseName: certificate.courseName,
                    institution: certificate.institution,
                    issueDate: certificate.issueDate,
                    revokedReason: certificate.revokedReason,
                },
            });
        }

        if (!isBlockchainValid()) {
            return res.status(500).json({ valid: false, reason: 'Blockchain integrity check failed' });
        }

        const block = blockchain[certificate.blockIndex];
        if (!block || block.data.certId !== certId) {
            return res.status(409).json({ valid: false, reason: 'Blockchain mismatch detected' });
        }

        // Increment verification count
        totalVerifications++;
        persistData();

        return res.json({
            valid: true,
            revoked: false,
            certificate: {
                certId: certificate.certId,
                studentName: certificate.studentName,
                courseName: certificate.courseName,
                institution: certificate.institution,
                issueDate: certificate.issueDate,
                issuedAt: certificate.issuedAt,
                fileHash: certificate.fileHash,
                fileName: certificate.fileName,
                fileSize: certificate.fileSize,
                verifyUrl: certificate.verifyUrl,
                blockIndex: certificate.blockIndex,
                blockHash: certificate.blockHash,
            },
            block: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                timestamp: block.timestamp,
            },
            message: 'Certificate verified successfully on blockchain',
        });

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ valid: false, reason: 'Internal server error' });
    }
});

/**
 * POST /api/revoke - Revoke a certificate
 */
app.post('/api/revoke', [
    body('certId').isUUID().withMessage('Invalid certificate ID format'),
    body('reason').optional().trim().isLength({ max: 500 }),
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Validation failed' });
        }

        const { certId, reason } = req.body;
        const certificate = certificateStore[certId];

        if (!certificate) {
            return res.status(404).json({ success: false, error: 'Certificate not found' });
        }

        if (revokedCertificates.has(certId) || certificate.revoked === true) {
            return res.status(400).json({ success: false, error: 'Certificate already revoked' });
        }

        revokedCertificates.add(certId);
        certificate.revoked = true;
        certificate.revokedAt = new Date().toISOString();
        certificate.revokedReason = reason || 'Administrative action';
        certificateStore[certId] = certificate;

        addBlock({
            type: 'REVOCATION',
            certId,
            reason: reason || 'Administrative action',
            revokedAt: Date.now(),
        });
        persistData();

        return res.json({
            success: true,
            message: 'Certificate revoked successfully',
            certificate: {
                certId: certificate.certId,
                studentName: certificate.studentName,
                revoked: true,
                revokedAt: certificate.revokedAt,
                revokedReason: certificate.revokedReason,
            },
        });

    } catch (error) {
        console.error('Revocation error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/verify-file - Verify by uploading file
 */
app.post('/api/verify-file', upload.single('certificate'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ valid: false, reason: 'No file uploaded' });
        }

        const fileHash = generateFileHash(req.file.buffer);
        const match = Object.values(certificateStore).find((c) => c.fileHash === fileHash);

        if (!match) {
            return res.json({ valid: false, fileHash, reason: 'No matching certificate found' });
        }

        if (revokedCertificates.has(match.certId)) {
            return res.json({ valid: false, revoked: true, reason: 'Certificate has been revoked' });
        }

        const block = blockchain[match.blockIndex];
        
        // Increment verification count
        totalVerifications++;
        persistData();

        return res.json({
            valid: true,
            fileHash,
            certificate: {
                certId: match.certId,
                studentName: match.studentName,
                courseName: match.courseName,
                institution: match.institution,
                issueDate: match.issueDate,
                verifyUrl: match.verifyUrl,
            },
            block: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                timestamp: block.timestamp,
            },
        });

    } catch (error) {
        return res.status(500).json({ valid: false, reason: error.message });
    }
});

/**
 * GET /api/blockchain - Get full blockchain
 */
app.get('/api/blockchain', (req, res) => {
    try {
        const summary = blockchain.map((block) => ({
            index: block.index,
            timestamp: block.timestamp,
            previousHash: block.previousHash,
            hash: block.hash,
            data: block.index === 0 ? 'GENESIS_BLOCK' : {
                certId: block.data.certId || null,
                studentName: block.data.studentName,
                courseName: block.data.courseName,
                institution: block.data.institution,
                type: block.data.type || 'CERTIFICATE',
            },
        }));

        return res.json({
            success: true,
            chain: summary,
            fullChain: blockchain,
            length: blockchain.length,
            isValid: isBlockchainValid(),
            certificatesCount: Object.keys(certificateStore).length,
            revokedCount: revokedCertificates.size,
            totalVerifications: totalVerifications,
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to retrieve blockchain' });
    }
});

/**
 * GET /api/certificates - Get all certificates
 */
app.get('/api/certificates', (req, res) => {
    try {
        const certificates = Object.values(certificateStore).map((cert) => ({
            certId: cert.certId,
            studentName: cert.studentName,
            courseName: cert.courseName,
            institution: cert.institution,
            issueDate: cert.issueDate,
            issuedAt: cert.issuedAt,
            fileSize: cert.fileSize,
            fileName: cert.fileName,
            blockIndex: cert.blockIndex,
            revoked: revokedCertificates.has(cert.certId) || cert.revoked === true,
            revokedAt: cert.revokedAt,
            revokedReason: cert.revokedReason,
        }));

        return res.json({ success: true, total: certificates.length, certificates });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to retrieve certificates' });
    }
});

/**
 * GET /api/stats - Get system statistics
 */
app.get('/api/stats', (req, res) => {
    try {
        const certificates = Object.values(certificateStore);
        const totalFileSize = certificates.reduce((sum, cert) => sum + (cert.fileSize || 0), 0);

        return res.json({
            success: true,
            statistics: {
                totalCertificates: certificates.length,
                activeCertificates: certificates.length - revokedCertificates.size,
                revokedCertificates: revokedCertificates.size,
                totalVerifications: totalVerifications,
                totalBlockchainSize: blockchain.length,
                totalStorageUsed: `${(totalFileSize / (1024 * 1024)).toFixed(2)} MB`,
                blockchainValid: isBlockchainValid(),
            },
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to retrieve statistics' });
    }
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        blockchainLength: blockchain.length,
        certificatesCount: Object.keys(certificateStore).length,
        totalVerifications: totalVerifications,
        blockchainValid: isBlockchainValid(),
    });
});

/**
 * GET /api/decentralized-info - Blockchain concept info
 */
app.get('/api/decentralized-info', (req, res) => {
    res.json({
        concept: 'Blockchain-based decentralized verification',
        explanation: 'Each certificate hash is cryptographically linked to previous blocks',
        trustless: 'No central authority required for verification',
        immutable: 'Once stored on blockchain, data cannot be modified',
        consensus: 'Proof-of-Concept with cryptographic hashing',
    });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
});

// ==================== SERVER STARTUP ====================

const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗███████╗██████╗ ████████╗██╗   ██╗ █████╗ ██╗     ║
║  ██╔════╝██╔════╝██╔══██╗╚══██╔══╝██║   ██║██╔══██╗██║     ║
║  ██║     █████╗  ██████╔╝   ██║   ██║   ██║███████║██║     ║
║  ██║     ██╔══╝  ██╔══██╗   ██║   ╚██╗ ██╔╝██╔══██║██║     ║
║  ╚██████╗███████╗██║  ██║   ██║    ╚████╔╝ ██║  ██║███████╗ ║
║   ╚═════╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═══╝  ╚═╝  ╚═╝╚══════╝ ║
║                                                              ║
║   CERTVault - Blockchain Certificate Verification System    ║
║   Decentralized | Tamper-Proof | Instant Verification       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    
    🚀 Server: http://localhost:${PORT}
    📋 Admin: http://localhost:${PORT}/admin
    🔍 Verify: http://localhost:${PORT}/verify
    ⛓️  Blockchain: http://localhost:${PORT}/blockchain
    
    📦 Blockchain size: ${blockchain.length} blocks
    🔒 Blockchain valid: ${isBlockchainValid()}
    📜 Certificates stored: ${Object.keys(certificateStore).length}
    🔢 Total verifications: ${totalVerifications}
    💾 Data persistence: ✅ Enabled (data.json)
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, saving data...');
    persistData();
    server.close(() => console.log('Server closed'));
});

process.on('SIGINT', () => {
    console.log('SIGINT received, saving data...');
    persistData();
    server.close(() => console.log('Server closed'));
});

module.exports = app;
