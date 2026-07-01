import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  telegramUsername: string;
  avatar: string;
  accountId: string;
  telegramChatId: string | null;
  telegramVerified: boolean;
  telegramUserId: string | null;
  friends: string[] | null;
  friendRequests: string[] | null;
  sharedFolders: string[] | null;
  fileTransactions: string[] | null;
  usageHistory: string[] | null;
  metadata: Record<string, unknown> | null;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    telegramUsername: { type: String, default: "" },
    avatar: { type: String, default: "" },
    accountId: { type: String, default: "" },
    telegramChatId: { type: String, default: null },
    telegramVerified: { type: Boolean, default: false },
    telegramUserId: { type: String, default: null },
    friends: { type: [String], default: null },
    friendRequests: { type: [String], default: null },
    sharedFolders: { type: [String], default: null },
    fileTransactions: { type: [String], default: null },
    usageHistory: { type: [String], default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
