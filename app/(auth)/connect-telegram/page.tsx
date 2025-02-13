"use client";

import { useEffect, useState } from "react";
import { updateUserTelegramDetails, fetchTelegramUpdates, getCurrentUser, signOutUser, checkTelegramVerification } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, RefreshCcw, Pencil, Send } from "lucide-react";

const ConnectTelegram = () => {
    const [telegramUsername, setTelegramUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const userData = await getCurrentUser();
                if(userData.telegramVerified) {
                    window.location.href = "/"; // Redirect to sign-in page
                }
                setUser(userData);
                setTelegramUsername(userData.telegramUsername);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    const handleRefresh = async () => {
        setIsLoading(true);
        setMessage("");

        try {
            console.log(await checkTelegramVerification());

            const updates = await fetchTelegramUpdates();
            console.log("Telegram Updates:", updates);

            const startMessage = updates.find(
                (update : any) =>
                    update.message &&
                    update.message.text === "/start" &&
                    update.message.chat.username === telegramUsername
            );
            console.log(startMessage, user);
            
            if (startMessage) {
                const updatedUser = await updateUserTelegramDetails(user.$id, {
                    telegramChatId: startMessage.message.chat.id + "",
                    telegramUserId: startMessage.message.from.id + "",
                    telegramVerified: true,
                });

                setMessage("Successfully connected to Telegram bot!");
                console.log("Updated User:", updatedUser);
                if (updatedUser.telegramVerified) {
                    window.location.href = "/"; // Redirect to sign-in page
                }
            } else {
                setMessage("No matching /start message found. Try again after starting chat.");
            }
        } catch (error) {
            console.log("Error fetching Telegram updates:", error);
            setMessage("Failed to fetch updates. Please try again.");
        }

        setIsLoading(false);
    };

    const handleUpdateUsername = async () => {
        setIsLoading(true);
        try {
            await updateUserTelegramDetails(user.$id, { telegramUsername });
            setMessage("Telegram username updated successfully.");
            setIsModalOpen(false);
        } catch (error) {
            console.log("Error updating Telegram username:", error);
            setMessage("Failed to update username.");
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await signOutUser();
        window.location.href = "/sign-in"; // Redirect to sign-in page
    };

    const handleStartChat = () => {
        window.open(`https://t.me/GeetDriveBot?start`, "_blank");
    };

    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {/* Logout button in header */}
            <div className="absolute top-4 right-4">
                <Button onClick={handleLogout} variant="destructive" className="flex gap-2 items-center">
                    <LogOut />
                    Logout
                </Button>
            </div>

            {/* Main Card */}
            <div className="bg-white shadow-lg rounded-2xl p-20 w-full max-w-md flex flex-col items-center text-center">
                {/* Avatar & Name */}
                <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={user?.avatar || "/default-avatar.png"} alt="User Avatar" />
                    <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">Hi, {user?.fullName || "User"}</h2>

                {/* Telegram Username Display */}
                <p className="text-gray-600 text-lg mt-2">
                    Your Telegram username: <strong className="text-blue-600 text-lime-600">@{telegramUsername}</strong>
                </p>

                {/* Change Username Button */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4 flex gap-2 items-center">
                            <Pencil size={16} />
                            Change Username
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-6">
                        <DialogTitle>Update Telegram Username</DialogTitle>
                        <Input
                            value={telegramUsername}
                            onChange={(e) => setTelegramUsername(e.target.value)}
                            className="mt-4"
                        />
                        <Button onClick={handleUpdateUsername} className="mt-4 w-full">
                            Save Changes
                        </Button>
                    </DialogContent>
                </Dialog>

                {/* Buttons Row */}
                <div className="flex gap-4 mt-6">
                    {/* Refresh Button */}
                    <Button onClick={handleRefresh} disabled={isLoading} className="flex gap-2 items-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
                        {isLoading ? "Refreshing..." : "Refresh Status"}
                    </Button>

                    {/* Start Chat Button */}
                    <Button onClick={handleStartChat} className="flex gap-2 items-center bg-teal-600 text-white hover:bg-teal-700">
                        <Send />
                        Start Chat
                    </Button>
                </div>


                {/* Status Message */}
                {message && <p className="mt-4 text-lg text-blue-600">{message}</p>}
            </div>
        </div>
    );
};

export default ConnectTelegram;