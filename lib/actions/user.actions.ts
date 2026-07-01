"use server";

import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user.model";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const fetchTelegramUpdates = async () => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/getUpdates`
    );
    return response.data.result || [];
  } catch (error) {
//     console.error("Error fetching Telegram updates:", error);
    throw new Error("Failed to fetch Telegram updates.");
  }
};

// Function to update user's Telegram details in MongoDB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUserTelegramDetails = async (userId: string, updates: any) => {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).lean();

    if (!updatedUser) throw new Error("User not found");

    return mapUserToDocument(updatedUser);
  } catch (error) {
//     console.error("Error updating user details:", error);
    throw new Error("Failed to update user Telegram details.");
  }
};

const getUserByEmail = async (email: string) => {
  await connectToDatabase();
  const user = await User.findOne({ email }).lean();
  return user ? mapUserToDocument(user) : null;
};

const handleError = (error: unknown, message: string) => {
//   console.log(error, message);
  throw error;
};

// Helper to map a MongoDB user document to the shape the app expects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUserToDocument = (user: any) => {
  return {
    ...user,
    $id: user._id.toString(),
    $createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    $updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
};

export const createAccount = async ({
  fullName,
  email,
  mobile,
  password,
  telegramUsername,
}: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  telegramUsername: string;
}) => {
  await connectToDatabase();

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const userId = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await User.create({
    userId,
    fullName,
    email,
    mobile,
    password: hashedPassword,
    telegramUsername,
    avatar: avatarPlaceholderUrl,
    accountId: userId,
    telegramChatId: null,
    telegramVerified: false,
    telegramUserId: null,
    friends: null,
    friendRequests: null,
    sharedFolders: null,
    fileTransactions: null,
    usageHistory: null,
    metadata: null,
  });

  // Set session cookie
  (await cookies()).set("session", newUser._id.toString(), {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return parseStringify({ accountId: newUser._id.toString() });
};

export const signInUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return parseStringify({ accountId: null, error: "User not found" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return parseStringify({ accountId: null, error: "Invalid password" });
    }

    // Set session cookie
    (await cookies()).set("session", user._id.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify({ accountId: user._id.toString() });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const getCurrentUser = async () => {
  try {
    const session = (await cookies()).get("session");
    if (!session || !session.value) return null;

    await connectToDatabase();

    const user = await User.findById(session.value).lean();
    if (!user) return null;

    return parseStringify(mapUserToDocument(user));
  } catch (error) {
//     console.log(error);
    return null;
  }
};

export const checkTelegramVerification = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("User not found");

    return user.telegramVerified;
  } catch (error) {
    handleError(error, "Failed to check Telegram verification");
    return false;
  }
};

export const signOutUser = async () => {
  try {
    (await cookies()).delete("session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};
