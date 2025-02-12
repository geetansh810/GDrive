import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite"; // Appwrite client
import axios from "axios";

export async function GET(req: Request) {
    try {
        const { databases } = await createSessionClient();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Fetch Telegram updates
        const response = await axios.get(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`
        );

        const updates = response.data.result;

        // Check if the user has started the bot
        const chat = updates.find((update: any) => update.message?.from?.id.toString() === userId);

        if (chat) {
            const telegramChatId = chat.message.chat.id.toString();

            // Update Appwrite database
            await databases.updateDocument(
                "database_id", // Replace with your actual Appwrite database ID
                "users_collection", // Replace with your collection ID
                userId,
                { telegramChatId }
            );

            return NextResponse.json({ success: true, telegramChatId });
        }

        return NextResponse.json({ success: false, message: "Telegram bot not started yet" });
    } catch (error) {
        console.error("Error checking Telegram status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}