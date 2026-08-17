'use client';

import { useState } from 'react';

export function useImageUpload(initialImages: string[] = []) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function uploadFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadError(null);

        const results: string[] = [];
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error || 'Upload failed');
                setUploading(false);
                return;
            }
            results.push(data.url);
        }

        setImages(prev => [...prev, ...results]);
        setUploading(false);
    }

    function removeImage(index: number) {
        setImages(prev => prev.filter((_, i) => i !== index));
    }

    function setInitial(urls: string[]) {
        setImages(urls);
    }

    return { images, uploading, uploadError, uploadFiles, removeImage, setInitial };
}
