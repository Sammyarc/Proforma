// Description: This file contains functions to encrypt and decrypt data using AES-256-CBC algorithm.
// It uses the crypto module from Node.js and dotenv for environment variable management.
// The encryption key and IV are stored in environment variables for security reasons.

// Importing required modules
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET; 
const IV = process.env.ENCRYPTION_IV; // Initialization vector (must be 16 bytes for AES-256-CBC)
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
