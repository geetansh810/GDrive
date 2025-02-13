"use server";

// https://api.telegram.org/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/getUpdates
// https://api.telegram.org/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/getFile?file_id=BQACAgUAAyEGAASLei-nAAMGZ6J-VuBYVBz2ayzUd0PVwAycY9oAAkkTAAL94BlVPK08cvT5kv02BA
// https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_9.png

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

import axios from 'axios';
import FormData from 'form-data';
import { generateThumbnail } from "./cloudinary.actions";
const NEXT_PUBLIC_TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN!;

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

const uploadToTelegram = async (fileBuffer: Buffer, fileName: string, mimeType: string, telegramChatId: string | undefined) => {
  try {
    const formData = new FormData();
    formData.append("chat_id", telegramChatId);

    // Choose the correct Telegram API field based on file type
    let telegramField: string;
    if (mimeType.startsWith("image/")) {
      telegramField = "photo"; // Image upload
    } else if (mimeType.startsWith("video/")) {
      telegramField = "video"; // Video upload
    } else {
      telegramField = "document"; // PDFs & other files
    }

    // Append the file
    formData.append(telegramField, fileBuffer, { filename: fileName });

    // Upload to Telegram
    const response = await axios.post(
      `https://api.telegram.org/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/send${telegramField.charAt(0).toUpperCase() + telegramField.slice(1)}`,
      formData,
      { headers: formData.getHeaders() }
    );

    console.log("Telegram Upload Success:", JSON.stringify(response.data));
    console.log("telegramField", telegramField);

    // Extract Telegram file ID
    const fieldData = response.data.result[telegramField];
    const telegramFileId = Array.isArray(fieldData) ? fieldData[0].file_id : fieldData.file_id;
    return telegramFileId;
  } catch (error) {
    console.error("Telegram Upload Failed:", error);
    throw new Error("Failed to upload to Telegram");
  }
};

const getTelegramFileURL = async (telegramFileId: string) => {
  const response = await axios.get(
    `https://api.telegram.org/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/getFile?file_id=${telegramFileId}`
  );
  // console.log("URL Response -> ",response.data);
  // console.log("-------------");

  const filePath = response.data.result.file_path;
  return `https://api.telegram.org/file/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/${filePath}`;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
  telegramChatId
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();
  try {

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const inputFile = InputFile.fromBuffer(file, file.name);

    // const bucketFile = await storage.createFile(
    //   appwriteConfig.bucketId,
    //   ID.unique(),
    //   inputFile,
    // );

    // Start both uploads in parallel
    const [bucketFile, telegramFileId, thumbnailUrl] = await Promise.all([
      storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile),
      uploadToTelegram(buffer, file.name, file.type, telegramChatId), // Pass Buffer instead of File
      generateThumbnail(buffer, file.type, file.name)
    ]);

    console.log("telegramFileId -> ", telegramFileId);
    console.log("thumbnailUrl -> ", thumbnailUrl)
    // console.log("telegramFileURL -> ", getTelegramFileURL(telegramFileId));

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
      telegramFileId,
      telegramFileURL: await getTelegramFileURL(telegramFileId),
      thumbnail: thumbnailUrl, // Store the thumbnail URL
      telegramChatId,
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };


    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        console.log(error, "------");

        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    console.log("newFile -> ",newFile);

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    console.log({ files });

    files.documents.forEach(async (file) => {
      const telegramFileId = file.telegramFileId;
      const generatedTelegramFileUrl = await getTelegramFileURL(telegramFileId);
      file.telegramFileUrl = generatedTelegramFileUrl;
    });

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
