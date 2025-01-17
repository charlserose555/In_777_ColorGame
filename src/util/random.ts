import crypto = require('crypto');
import { GAMES } from '../config';
import * as bcrypt from 'bcrypt-nodejs';

// Generate a secure random number
const generatePrivateSeed = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (error, buffer) => {
      if (error) reject(error);
      else resolve(buffer.toString('hex'));
    });
  });
};

// Hash an input (private seed) to SHA256
const buildPrivateHash = (seed: string): string => {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return hash;
};

// Generate a private seed and hash pair
export const generatePrivateSeedHashPair = async (): Promise<{
  seed: string;
  hash: string;
} | null> => {
  try {
    const seed = await generatePrivateSeed();
    const hash = buildPrivateHash(seed);
    return { seed, hash };
  } catch (error) {
    // console.log(error);
    return null;
  }
};

const generateCrashPoint = (seed: string, salt: string): number => {
  const hash = crypto.createHmac('sha256', seed).update(salt).digest('hex');

  const hs = parseInt((100 / (GAMES.crash.houseEdge * 100)).toString());
  if (isCrashHashDivisible(hash, hs)) {
    return 100;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h));
};

const isCrashHashDivisible = (hash: string, mod: number): boolean => {
  let val = 0;

  const o = hash.length % 4;
  for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
};

export const getRandomFourDigitNumber = () => {
  return Math.floor(Math.random() * 9000) + 1000;
}

export const getRandomFourSixNumber = () => {
  return Math.floor(Math.random() * 900000) + 100000;
}

export const generateHash = (password: string) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}