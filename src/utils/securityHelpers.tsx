import CryptoJS from 'crypto-js';

// Encryption for cookie data
export const encryptCookieData = (data: string): string => {
  try {
    const secretKey = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_SECRET_KEY!);
    const cipherText = CryptoJS.AES.encrypt(data, secretKey, {
      mode: CryptoJS.mode.ECB
    });
    return encodeURIComponent(cipherText.toString());
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

// Decryption for cookie data
export const decryptCookieData = (encryptedData: string): string => {
  try {
    const decodedData = decodeURIComponent(encryptedData);
    const secretKey = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_SECRET_KEY!);
    const bytes = CryptoJS.AES.decrypt(decodedData, secretKey, {
      mode: CryptoJS.mode.ECB
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};