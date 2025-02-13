"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
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
    console.error("Error fetching Telegram updates:", error);
    throw new Error("Failed to fetch Telegram updates.");
  }
};

// Function to update user's Telegram details in Appwrite
export const updateUserTelegramDetails = async (userId: string, updates: any) => {
  try {
    const { databases } = await createSessionClient(); // Get an admin client instance
    return await databases.updateDocument(  
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      updates
    );
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user Telegram details.");
  }
};
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
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
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();
    const userId = uuidv4(); // Generate a unique userId
    const hashedPassword = bcrypt.hashSync(password); // Encrypt password using userId as salt

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        userId,
        fullName,
        email,
        mobile,
        password: hashedPassword,
        telegramUsername,
        avatar: avatarPlaceholderUrl,
        accountId,
        telegramChatId: null,
        telegramVerified: false,
        telegramUserId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        friends: null,
        friendRequests: null,
        sharedFolders: null,
        fileTransactions: null,
        usageHistory: null,
        metadata: null,
      }
    );
  }

  return { accountId };
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};
export const checkTelegramVerification = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("User not found");

    return user.telegramVerified
  } catch (error) {
    handleError(error, "Failed to check Telegram verification");
    return false;
  } 
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};
