// src/modules/user/user.service.ts
import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
/**
 * Fetches all users from the database.
 * Note: Uses lowercase 'user' as defined in your Prisma schema.
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
      password: false, // Explicitly exclude password
      phone: true,
      faydaId: true,
      createdAt: true,
      // Exclude password for security
    },
  });
};

/**
 * Creates a new user with hashed password.
 * Uses email as the primary identity.
 */
export const createUser = async (userData: any) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Explicitly typing the data object helps TS see you aren't using 'username'
  return await prisma.user.create({
    data: {
      username: userData.username, // Add this
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      faydaId: userData.faydaId,
      password: hashedPassword,
    } as any, // Temporary 'as any' cast if the generated types are still being stubborn
  });
};

/* 
  ===========================================================
  FAYDA ID & OTP FLOW (COMMENTED FOR LATER)
  ===========================================================
  export const verifyFaydaOtp = async (faydaId: string, otp: string) => {
    // Logic to verify against Govt API
    return true; 
  };
*/

/**
 * Finds a single user by their unique username.
 */
export const findUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};
