# CERTVault - Blockchain Certificate Verification System

> A decentralized, tamper-proof certificate verification system using blockchain technology

---

## 📌 About The Project

**CERTVault** ek blockchain-based platform hai jo educational certificates ko secure aur tamper-proof banata hai.

### Problem Statement

- Fake certificates ek badi problem ban gayi hai education aur recruitment mein
- Certificate verify karne mein bahut time lagta hai (hafto mahino)
- Employers ko universities par depend rehna padta hai
- Centralized systems hack ho sakte hain

### Our Solution

- Har certificate ka unique cryptographic hash (digital fingerprint) banate hain
- Hash ko decentralized blockchain network par store karte hain
- Har certificate ke liye QR code generate karte hain
- Employers instantly verify kar sakte hain authenticity

---

## 🚀 Features

### For Universities
- Easy certificate upload
- Automatic hash generation
- QR code generation for each certificate
- Dashboard to view all certificates

### For Employers
- Instant QR-based verification
- Manual certificate ID verification
- Blockchain explorer to view all records
- Tamper-proof verification results

### For Students
- Own your digital credentials
- Share QR code with employers
- Lifetime access to certificates
- No middleman required

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5, CSS3, JavaScript | Frontend UI |
| Node.js + Express.js | Backend API |
| SHA-256 (Crypto) | Hash generation |
| QRCode.js | QR code generation |
| JSON files | Data storage |

---
## 📁 Project Structure
certvault-blockchain/
│
├── frontend/
│ ├── index.html # Upload certificate page
│ ├── admin.html # Admin panel
│ ├── blockchain.html # Blockchain explorer
│ ├── verify.html # QR verification page
│ └── style.css # Common styles
│
├── backend/
│ ├── server.js # Main server
│ ├── package.json # Dependencies
│ └── data/
│ ├── certificates.json
│ └── blockchain.json
│
├── .gitignore
├── README.md
└── LICENSE


---

## ▶️ How to Run (Step by Step)

**Step 1:** Download or clone the project folder

**Step 2:** Open the project in VS Code

**Step 3:** Open terminal in VS Code (Ctrl + `)

**Step 4:** Go to backend folder

**Step 5:** Install dependencies

**Step 6:** Start the server

**Step 7:** Open browser and go to  http://localhost:3000

**Step 8:** Application is now running

> **Note:** Node.js must be installed on your computer

---

## 🎮 How to Use

### For Universities (Issuing Certificates)

**Step 1:** Open http://localhost:3000

**Step 2:** Fill student name, course, institution

**Step 3:** Select issue date

**Step 4:** Upload certificate file (PDF/JPG/PNG)

**Step 5:** Click "Anchor to Blockchain" button

**Step 6:** QR code will appear on screen

**Step 7:** Download QR code and share with student

### For Employers (Verifying Certificates)

**Option A - Scan QR Code:**

**Step 1:** Open http://localhost:3000/verify.html

**Step 2:** Click "Start Camera Scanner"

**Step 3:** Allow camera permission

**Step 4:** Scan the QR code

**Step 5:** Verification result appears instantly

**Option B - Manual Entry:**

**Step 1:** Open http://localhost:3000/verify.html

**Step 2:** Enter Certificate ID

**Step 3:** Click "Verify" button

**Step 4:** Result shows if certificate is valid

### For Anyone (View Blockchain)

**Step 1:** Open http://localhost:3000/blockchain.html

**Step 2:** All blocks in chain are displayed

**Step 3:** Click any block for details

**Step 4:** View block hash, timestamp, certificate data

### For Admin (Revoking Certificates)

**Step 1:** Open http://localhost:3000/admin.html

**Step 2:** Enter Certificate ID

**Step 3:** Enter reason (optional)

**Step 4:** Click "Revoke" button

**Step 5:** Certificate is permanently revoked

---

## 🔒 How Blockchain Verification Works

**Step 1:** University uploads certificate into the system

**Step 2:** System generates a unique hash from the certificate data

**Step 3:** This hash is stored on the blockchain through a smart contract

**Step 4:** A QR code linked to the certificate is generated and shared with student

**Step 5:** When scanned, system retrieves the hash and compares it with blockchain data

**Step 6:** If both hashes match → certificate is verified as authentic

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/certificates | Get all certificates |
| GET | /api/blockchain | Get full blockchain data |
| POST | /api/upload | Upload new certificate |
| POST | /api/admin/revoke | Revoke a certificate |

---

## 📊 Impact

- Eliminates certificate fraud and forgery
- Reduces verification time from days to seconds
- Saves cost and effort for organizations
- Builds a transparent and trustworthy ecosystem

---

## 👥 Team - Tech Titans

| Name | Roll Number |
|------|-------------|
| Shekhar Rajput | 25BMR10013 |
| Sarthak Shrivastava | 25MEI10064 |
| Aarunya Agrawal | 25BCE11031 |
| Ankit Paul | 25BSA10034 |

---

## 🏆 Hackathon Details

| Field | Value |
|-------|-------|
| **Hackathon Name** | Next Gen AI Hackathon 2026 |
| **Round** | Round 2 |
| **Team Name** | Tech Titans |
| **Project Name** | CERTVault |

---

## 🚀 Future Scope

- Deploy on real blockchain (Ethereum / Polygon)
- Write Solidity smart contracts
- Store certificate files on IPFS
- Create mobile app for Android and iOS
- Add MetaMask wallet integration
- Email notifications for certificate issuance
- Bulk certificate upload feature
- Advanced analytics dashboard

---

## 📄 License

MIT License - Copyright (c) 2024 Tech Titans

---

<div align="center">

**⭐ Made with ❤️ by Tech Titans ⭐**

*CERTVault – Verify Instantly, Trust Forever*

**Submitted for Next Gen AI Hackathon 2026 | Round 2**

</div>


