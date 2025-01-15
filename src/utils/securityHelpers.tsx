import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

// Encryption Helper
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, process.env.NEXT_PUBLIC_SECRET_KEY!).toString();
};

// Decryption Helper
export const decryptData = (cipherText: string): string => {
  const bytes = CryptoJS.AES.decrypt(cipherText, process.env.NEXT_PUBLIC_SECRET_KEY!);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Set Encrypted Cookie
export const setSecureCookie = (key: string, value: string) => {
  const encryptedValue = encryptData(value);
  Cookies.set(key, encryptedValue, {
    expires: 1 / 24,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
};

// Get Decrypted Cookie
export const getDecryptedCookie = (key: string): string | null => {
  const encryptedValue = Cookies.get(key);
  return encryptedValue ? decryptData(encryptedValue) : null;
};
