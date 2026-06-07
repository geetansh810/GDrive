import Image from "next/image";
import React, { useState, useEffect } from "react";
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        const fileLoader = document.createElement("img"); // Correct way to create an image element
        fileLoader.src = url;
        fileLoader.onload = () => setIsLoading(false);
        fileLoader.onerror = () => setIsLoading(false);
    }, [url]);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name; // Set the original file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderPreview = () => {
        if (!url) return <p className="text-center">No file selected</p>;

        if (type === "image") {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <Image
                        src={url}
                        alt={name}
                        className="w-full h-full object-contain"
                        width={500}
                        height={500}
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        if (type === "document") {
            return (
                <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                    className="w-full h-full"
                    onLoad={() => setIsLoading(false)}
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-gray-500">Cannot preview this file type.</p>
                <a
                    href={url}
                    download={name}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download File
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-dark-200 w-[90%] max-w-6xl h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden text-dark-200 dark:text-light-100">
                {/* Header */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-100 px-4 py-3 border-b border-gray-200 dark:border-white/5">
                    <button onClick={onClose} className="text-gray-600 dark:text-light-200 hover:text-black dark:hover:text-white transition-colors">
                        <FaArrowLeft size={20} />
                    </button>
                    <span className="font-medium text-gray-800 dark:text-light-100">{name}</span>
                    <div className="flex gap-4">
                        <button className="text-gray-600 dark:text-light-200 hover:text-black dark:hover:text-white transition-colors">
                            <FaPrint size={18} />
                        </button>
                        <button onClick={handleDownload} className="text-gray-600 dark:text-light-200 hover:text-black dark:hover:text-white transition-colors">
                            <FaDownload size={18} />
                        </button>
                        <button className="text-gray-600 dark:text-light-200 hover:text-black dark:hover:text-white transition-colors">
                            <FaEllipsisV size={18} />
                        </button>
                        <button className="text-gray-600 dark:text-light-200 hover:text-black dark:hover:text-white transition-colors">
                            <FaShare size={18} />
                        </button>
                    </div>
                </div>

                {/* Content (File Preview) */}
                <div className="flex-1 flex items-center justify-center relative bg-gray-50 dark:bg-dark-100/50">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-brand-100 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;