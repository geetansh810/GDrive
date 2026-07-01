import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFile extends Document {
  type: string;
  name: string;
  url: string;
  extension: string;
  size: number;
  owner: mongoose.Types.ObjectId;
  accountId: string;
  users: string[];
  bucketFileId: string;
  telegramFileId: string;
  telegramFileURL: string;
  thumbnail: string | null;
  telegramChatId: string;
  modifiedAt: string;
}

const FileSchema = new Schema<IFile>(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, default: "" },
    extension: { type: String, default: "" },
    size: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: String, default: "" },
    users: { type: [String], default: [] },
    bucketFileId: { type: String, default: "" },
    telegramFileId: { type: String, default: "" },
    telegramFileURL: { type: String, default: "" },
    thumbnail: { type: String, default: null },
    telegramChatId: { type: String, default: "" },
    modifiedAt: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const FileModel: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>("File", FileSchema);

export default FileModel;
