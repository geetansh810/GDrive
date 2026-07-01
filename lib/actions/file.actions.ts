"use server";

// https://api.telegram.org/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/getUpdates
// https://api.telegram.org/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/getFile?file_id=BQACAgUAAyEGAASLei-nAAMGZ6J-VuBYVBz2ayzUd0PVwAycY9oAAkkTAAL94BlVPK08cvT5kv02BA
// https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_9.png

import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import FileModel from "@/lib/models/file.model";
import { getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser, fetchTelegramUpdates } from "@/lib/actions/user.actions";

import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const NEXT_PUBLIC_TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleError = (error: unknown, message: string) => {
//   console.log(error, message);
  throw error;
};

const uploadToTelegram = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  telegramChatId: string | undefined
) => {
  try {
    const formData = new FormData();
    formData.append("chat_id", telegramChatId);
    formData.append("document", fileBuffer, { filename: fileName }); // Upload everything as a document

    // Send the file using Telegram's sendDocument API
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendDocument`,
      formData,
      { headers: formData.getHeaders() }
    );

//     console.log("Telegram Upload Success:", JSON.stringify(response.data));

    // Extract Telegram file ID
    const telegramFileId = response.data.result.document.file_id;
    return telegramFileId;
  } catch {
//     console.error("Telegram Upload Failed:", error);
    throw new Error("Failed to upload to Telegram");
  }
};
const getTelegramFileURL = async (telegramFileId: string) => {
  const response = await axios.get(
    `https://api.telegram.org/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/getFile?file_id=${telegramFileId}`
  );
//   console.log("URL Response -> ",response.data);
//   console.log("-------------");

  const filePath = response.data.result.file_path;
//   console.log(`https://api.telegram.org/file/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/${filePath}`);
  
  return `https://api.telegram.org/file/bot${NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/${filePath}`;
};

// Helper to map a MongoDB file doc to the shape the app expects (with $id, $createdAt, $updatedAt)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFileToDocument = (file: any) => {
  const obj = typeof file.toObject === "function" ? file.toObject() : file;
  return {
    ...obj,
    $id: obj._id.toString(),
    $createdAt: obj.createdAt?.toISOString?.() ?? new Date().toISOString(),
    $updatedAt: obj.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path: filePath,
  telegramChatId
}: UploadFileProps) => {
  try {
    await connectToDatabase();

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file locally to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueId = uuidv4();
    const safeFileName = `${uniqueId}-${file.name}`;
    const localFilePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(localFilePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    // Start both uploads in parallel
    // Wrap generateThumbnail so a Cloudinary failure doesn't abort the entire upload
    const telegramFileId = await uploadToTelegram(buffer, file.name, file.type, telegramChatId);
    const telegramFileURL = await getTelegramFileURL(telegramFileId);
    const fileType = getFileType(file.name).type;
    const thumbnailUrl = fileType === "image" ? telegramFileURL : null;

//     console.log("telegramFileId -> ", telegramFileId);
//     console.log("telegramFileURL -> ", telegramFileURL);

    const fileDocument = {
      type: fileType,
      name: file.name,
      url: fileUrl,
      extension: getFileType(file.name).extension,
      size: buffer.length,
      owner: new mongoose.Types.ObjectId(ownerId),
      accountId,
      users: [],
      bucketFileId: uniqueId,
      telegramFileId,
      telegramFileURL,
      thumbnail: thumbnailUrl,
      telegramChatId,
      modifiedAt: new Date().toISOString(),
    };

    const newFile = await FileModel.create(fileDocument);

//     console.log("newFile -> ", newFile);

    revalidatePath(filePath);
    return parseStringify(mapFileToDocument(newFile));
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    // Build MongoDB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      $or: [
        { owner: new mongoose.Types.ObjectId(currentUser.$id) },
        { users: currentUser.email },
      ],
    };

    if (types.length > 0) {
      filter.type = { $in: types };
    }

    if (searchText) {
      filter.name = { $regex: searchText, $options: "i" };
    }

    // Parse sort
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort) {
      const [sortBy, orderBy] = sort.split("-");
      const mongoSortField = sortBy === "$createdAt" ? "createdAt" : sortBy === "$updatedAt" ? "updatedAt" : sortBy;
      sortObj = { [mongoSortField]: orderBy === "asc" ? 1 : -1 };
    }

    let query = FileModel.find(filter).sort(sortObj);
    if (limit) {
      query = query.limit(limit);
    }

    const files = await query.lean();

    // Generate fresh Telegram file URLs
    const documents = await Promise.all(
      files.map(async (file) => {
        const mapped = mapFileToDocument(file);
        try {
          const generatedTelegramFileUrl = await getTelegramFileURL(mapped.telegramFileId);
          mapped.telegramFileURL = generatedTelegramFileUrl;
          mapped.telegramFileUrl = generatedTelegramFileUrl;
        } catch {
          // Keep existing URL if refresh fails
        }
        return mapped;
      })
    );

    return parseStringify({ documents, total: documents.length });
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const getTelegramFiles = async ({
  searchText = "",
  sort = "$createdAt-desc",
}: {
  searchText?: string;
  sort?: string;
} = {}) => {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");
    if (!currentUser.telegramChatId) {
      return parseStringify({ documents: [], total: 0 });
    }

    // 1. Fetch files from MongoDB (bot-sent files)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbFilter: any = {
      owner: new mongoose.Types.ObjectId(currentUser.$id),
      telegramChatId: currentUser.telegramChatId,
    };
    const dbFiles = await FileModel.find(dbFilter).lean();

    // 2. Map and refresh URLs for MongoDB files
    const documents = await Promise.all(
      dbFiles.map(async (file) => {
        const mapped = mapFileToDocument(file);
        // Ensure owner details are set in the shape components expect
        mapped.owner = {
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || "/default-avatar.png",
        };
        try {
          if (mapped.telegramFileId) {
            const generatedTelegramFileUrl = await getTelegramFileURL(mapped.telegramFileId);
            mapped.telegramFileURL = generatedTelegramFileUrl;
            mapped.telegramFileUrl = generatedTelegramFileUrl;
            mapped.url = generatedTelegramFileUrl;
          }
        } catch {
//           console.error(`Failed to refresh URL for DB file ${mapped.name}:`, err);
        }
        return mapped;
      })
    );

    // 3. Fetch live updates from Telegram (user-sent files)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updates: any[] = [];
    try {
      updates = await fetchTelegramUpdates();
    } catch {
//       console.error("Failed to fetch Telegram updates:", err);
    }

    for (const update of updates) {
      const message = update.message;
      if (!message) continue;

      // Filter updates from the user's connected telegram chat
      const chatId = message.chat?.id?.toString();
      if (chatId !== currentUser.telegramChatId) continue;

      // Identify media
      let mediaType = "";
      let telegramFileId = "";
      let name = "";
      let size = 0;
      let extension = "";

      if (message.document) {
        telegramFileId = message.document.file_id;
        name = message.document.file_name || `telegram_doc_${message.document.file_unique_id}`;
        size = message.document.file_size || 0;
        extension = name.split(".").pop()?.toLowerCase() || "";
        mediaType = getFileType(name).type;
      } else if (message.photo && message.photo.length > 0) {
        const photoObj = message.photo[message.photo.length - 1];
        telegramFileId = photoObj.file_id;
        name = `photo_${photoObj.file_unique_id}.jpg`;
        size = photoObj.file_size || 0;
        extension = "jpg";
        mediaType = "image";
      } else if (message.video) {
        telegramFileId = message.video.file_id;
        name = message.video.file_name || `video_${message.video.file_unique_id}.mp4`;
        size = message.video.file_size || 0;
        extension = name.split(".").pop()?.toLowerCase() || "mp4";
        mediaType = "video";
      } else if (message.audio) {
        telegramFileId = message.audio.file_id;
        name = message.audio.file_name || `audio_${message.audio.file_unique_id}.mp3`;
        size = message.audio.file_size || 0;
        extension = name.split(".").pop()?.toLowerCase() || "mp3";
        mediaType = "audio";
      } else if (message.voice) {
        telegramFileId = message.voice.file_id;
        name = `voice_${message.voice.file_unique_id}.ogg`;
        size = message.voice.file_size || 0;
        extension = "ogg";
        mediaType = "audio";
      }

      if (!telegramFileId) continue;

      // Check if file is already added (either from DB or from a previous update in this list)
      if (documents.some((doc) => doc.telegramFileId === telegramFileId)) continue;

      // Resolve the actual telegram download link
      let telegramFileURL = "";
      try {
        telegramFileURL = await getTelegramFileURL(telegramFileId);
      } catch {
//         console.error(`Failed to get file URL for telegramFileId ${telegramFileId}`, err);
        continue;
      }

      // Convert date to ISO string
      const createdAtISO = message.date
        ? new Date(message.date * 1000).toISOString()
        : new Date().toISOString();

      documents.push({
        $id: telegramFileId,
        type: mediaType,
        name,
        url: telegramFileURL,
        extension,
        size,
        owner: {
          fullName: currentUser.fullName,
          avatar: currentUser.avatar || "/default-avatar.png",
        },
        accountId: currentUser.accountId,
        users: [],
        bucketFileId: "",
        telegramFileId,
        telegramFileURL,
        telegramFileUrl: telegramFileURL,
        thumbnail: mediaType === "image" ? telegramFileURL : null,
        telegramChatId: currentUser.telegramChatId,
        modifiedAt: createdAtISO,
        $createdAt: createdAtISO,
        $updatedAt: createdAtISO,
      });
    }

    // 4. Apply search filter in-memory
    let filteredDocs = documents;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredDocs = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchLower)
      );
    }

    // 5. Apply sorting in-memory
    if (sort) {
      const [sortBy, orderBy] = sort.split("-");
      const isAsc = orderBy === "asc";
      
      filteredDocs.sort((a, b) => {
        let valA = a.createdAt;
        let valB = b.createdAt;

        if (sortBy === "$createdAt") {
          valA = new Date(a.$createdAt).getTime();
          valB = new Date(b.$createdAt).getTime();
        } else if (sortBy === "$updatedAt") {
          valA = new Date(a.$updatedAt).getTime();
          valB = new Date(b.$updatedAt).getTime();
        } else if (sortBy === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === "size") {
          valA = a.size;
          valB = b.size;
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }

    return parseStringify({ documents: filteredDocs, total: filteredDocs.length });
  } catch (error) {
    handleError(error, "Failed to get Telegram files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path: filePath,
}: RenameFileProps) => {
  try {
    await connectToDatabase();
    const newName = `${name}.${extension}`;
    const updatedFile = await FileModel.findByIdAndUpdate(
      fileId,
      { name: newName },
      { new: true }
    ).lean();

    revalidatePath(filePath);
    return parseStringify(mapFileToDocument(updatedFile));
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path: filePath,
}: UpdateFileUsersProps) => {
  try {
    await connectToDatabase();
    const updatedFile = await FileModel.findByIdAndUpdate(
      fileId,
      { users: emails },
      { new: true }
    ).lean();

    revalidatePath(filePath);
    return parseStringify(mapFileToDocument(updatedFile));
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path: filePath,
}: DeleteFileProps) => {
  try {
    await connectToDatabase();

    const deletedFile = await FileModel.findByIdAndDelete(fileId);

    if (deletedFile) {
      // Delete local file
      const localFilePath = path.join(process.cwd(), "public", "uploads", `${bucketFileId}-${deletedFile.name}`);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    revalidatePath(filePath);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await FileModel.find({ owner: new mongoose.Types.ObjectId(currentUser.$id) }).lean();

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.forEach((file) => {
      const mapped = mapFileToDocument(file);
      const fileType = mapped.type as FileType;
      totalSpace[fileType].size += mapped.size;
      totalSpace.used += mapped.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(mapped.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = mapped.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
