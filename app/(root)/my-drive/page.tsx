'use client'
import React, { useState } from "react";
import DocumentViewer from "@/components/DocumentViewer";
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile } from "react-icons/fa";

const files = [
    { name: "Profile Image", url: "https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_10.png" },
    { name: "Document 1", url: "https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_11.pdf" },
    // { name: "Word Document", url: "https://your-telegram-file-url.com/sample.docx" },
    // { name: "Unknown File", url: "https://your-telegram-file-url.com/sample.xyz" }
];

const ParentComponent = () => {
    const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);

    const getFileIcon = (url: string) => {
        const fileExtension = url.split(".").pop()?.toLowerCase();

        if (["png", "jpg", "jpeg", "gif", "webp"].includes(fileExtension || "")) {
            return <FaFileImage size={50} className="text-blue-500" />;
        }
        if (fileExtension === "pdf") {
            return <FaFilePdf size={50} className="text-red-500" />;
        }
        if (["doc", "docx", "txt"].includes(fileExtension || "")) {
            return <FaFileAlt size={50} className="text-green-500" />;
        }
        return <FaFile size={50} className="text-gray-500" />;
    };

    return (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
                <div
                    key={index}
                    onClick={() => setSelectedFile(file)}
                    className="flex flex-col items-center cursor-pointer p-4 border rounded-lg hover:bg-gray-100"
                >
                    {getFileIcon(file.url)}
                    <p className="mt-2 text-sm text-center">{file.name}</p>
                </div>
            ))}

            {selectedFile && (
                <DocumentViewer
                    url={selectedFile.url}
                    name={selectedFile.name}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </div>
    );
};

export default ParentComponent;