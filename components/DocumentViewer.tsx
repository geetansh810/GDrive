import Image from "next/image";
import React from "react";
import {
    FaArrowLeft,
    FaDownload,
    FaPrint,
    FaEllipsisV,
    FaShare,
} from "react-icons/fa";

interface DocumentViewerProps {
    url: string;
    name: string;
    onClose: () => void;
    type: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, name, onClose, type }) => {
    const fileExtension = type;

    const renderPreview = () => {
        if (!url) return <p className="text-center">No file selected</p>;

        // if (["png", "jpg", "jpeg", "gif", "webp"].includes(fileExtension || "")) {
        //     return <img src={url} alt={name} className="max-h-[80vh] mx-auto" />;
        // }

        if (type === "image") {
            return <Image
                src={url} 
                alt={name} 
                className="mx-auto max-h-[80vh]"
                width={500}
                height={500}
            />
        }

        if (fileExtension === "pdf") {
            return (
                <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                    width="100%"
                    height="600px"
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center">
                <p className="text-gray-500">Cannot preview this file type.</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download File
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white w-[90%] max-w-4xl rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b">
                    <button onClick={onClose} className="text-gray-600 hover:text-black">
                        <FaArrowLeft size={20} />
                    </button>
                    <span className="font-medium text-gray-800">{name}</span>
                    <div className="flex gap-4">
                        <button className="text-gray-600 hover:text-black">
                            <FaPrint size={18} />
                        </button>
                        <a href={url} download className="text-gray-600 hover:text-black">
                            <FaDownload size={18} />
                        </a>
                        <button className="text-gray-600 hover:text-black">
                            <FaEllipsisV size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-black">
                            <FaShare size={18} />
                        </button>
                    </div>
                </div>

                {/* Content (File Preview) */}
                <div className="p-4 flex items-center justify-center">{renderPreview()}</div>
            </div>
        </div>
    );
};

export default DocumentViewer;