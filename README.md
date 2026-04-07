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

## 📁 Project Structure
