'use client'
import React, { useState } from "react";
import DocumentViewer from "@/components/DocumentViewer";
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile } from "react-icons/fa";
import Sort from "./Sort";
import { Models } from "node-appwrite";
import CustomCard from "./CustomCard";
// const files = [
//     { name: "Profile Image", url: "https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_10.png" },
//     { name: "Document 1", url: "https://api.telegram.org/file/bot7993411433:AAH28tznkIcStXuyLR3bX738H4Px9pig3e0/documents/file_11.pdf" },
//     // { name: "Word Document", url: "https://your-telegram-file-url.com/sample.docx" },
//     // { name: "Unknown File", url: "https://your-telegram-file-url.com/sample.xyz" }
// ];

const MyDrive = ({ files } : {files : any}) => {
    const [selectedFile, setSelectedFile] = useState<any>(null);

    console.log("---------");
    console.log(files);

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

        <div className="page-container">
            <section className="w-full">
                <h1 className="h1 capitalize">My Drive</h1>

                <div className="total-size-section">
                    <p className="body-1">
                        Total: <span className="h5">0 MB</span>
                    </p>

                    <div className="sort-container">
                        <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

                        <Sort />
                    </div>
                </div>
            </section>

            {/* Render the files */}
            {files.total > 0 ? (
                <section className="file-list">
                    {files.documents.map((file: Models.Document) => (
                        <div key={file.$id} onClick={() => setSelectedFile(file)} >
                            <CustomCard  file={file}/>
                        </div>
                    ))}
                </section>
            ) : (
                <p className="empty-list">No files uploaded</p>
            )}
            {selectedFile && (
                <DocumentViewer
                    url={selectedFile.telegramFileURL}
                    type={selectedFile.type}
                    name={selectedFile.name}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </div>

        // <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        //     {/* {files.map((file, index) => (
        //         <div
        //             key={index}
        //             onClick={() => setSelectedFile(file)}
        //             className="flex flex-col items-center cursor-pointer p-4 border rounded-lg hover:bg-gray-100"
        //         >
        //             {getFileIcon(file.url)}
        //             <p className="mt-2 text-sm text-center">{file.name}</p>
        //         </div>
        //     ))} */}

        // </div >
    );
};

export default MyDrive;