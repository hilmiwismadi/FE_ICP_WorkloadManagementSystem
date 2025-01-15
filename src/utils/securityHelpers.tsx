import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

export const encryptData = (data: string): string => {
  try {
    const secretKey = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_SECRET_KEY!);
    return CryptoJS.AES.encrypt(data, secretKey, { mode: CryptoJS.mode.ECB }).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptData = (cipherText: string): string => {
  try {
    const secretKey = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_SECRET_KEY!);
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey, { mode: CryptoJS.mode.ECB });
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
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
