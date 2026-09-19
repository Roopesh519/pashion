'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Monitor, Smartphone } from 'lucide-react';
import styles from './page.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type BannerImages = { desktopImage: string; mobileImage: string };
const initialImages: BannerImages = { desktopImage: '', mobileImage: '' };

function validateImage(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Only JPEG, PNG, WebP, and GIF images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
        return 'Image size must be 5 MB or less.';
    }
    return null;
}

export default function AdminBannerPage() {
    const desktopInputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<BannerImages>(initialImages);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<'desktopImage' | 'mobileImage' | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadBanner = async () => {
            try {
                const res = await fetch('/api/admin/banner');
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to load banner');
                if (data.banner) {
                    setImages({
                        desktopImage: data.banner.desktopImage || '',
                        mobileImage: data.banner.mobileImage || '',
                    });
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load banner');
            } finally {
                setLoading(false);
            }
        };
        loadBanner();
    }, []);

    const upload = async (variant: keyof BannerImages, files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;

        const validationError = validateImage(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(variant);
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to upload image');
            setImages((current) => ({ ...current, [variant]: data.url }));
        } catch (err: any) {
            setError(err?.message || 'Failed to upload image');
        } finally {
            setUploading(null);
        }
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!images.desktopImage || !images.mobileImage) {
            setError('Upload both the desktop and mobile banner images before saving.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/banner', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(images),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save banner');
            setSuccess('Homepage banner saved successfully.');
        } catch (err: any) {
            setError(err?.message || 'Failed to save banner');
        } finally {
            setSaving(false);
        }
    };

    const renderUploader = (
        variant: keyof BannerImages,
        title: string,
        description: string,
        Icon: typeof Monitor,
        inputRef: React.RefObject<HTMLInputElement | null>
    ) => (
        <section className={styles.card}>
            <div className={styles.cardHeading}>
                <Icon size={22} />
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
            {images[variant] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.preview} src={images[variant]} alt={`${title} preview`} />
            ) : (
                <div className={styles.placeholder}><ImagePlus size={32} /> <span>No image selected</span></div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(event) => {
                    upload(variant, event.target.files);
                    event.currentTarget.value = '';
                }}
            />
            <button
                type="button"
                className={styles.uploadButton}
                onClick={() => inputRef.current?.click()}
                disabled={Boolean(uploading) || saving}
            >
                {uploading === variant ? <Loader2 size={17} className="spin" /> : <ImagePlus size={17} />}
                {uploading === variant ? 'Uploading...' : images[variant] ? 'Replace image' : 'Upload image'}
            </button>
        </section>
    );

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Homepage Banner</h1>
                <p>Set the hero image visitors see on desktop and mobile. Each file must be an image and 5 MB or smaller.</p>
            </header>

            {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
            {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}

            {loading ? <div className={styles.loading}><Loader2 size={22} className="spin" /> Loading banner...</div> : (
                <form onSubmit={save}>
                    <div className={styles.grid}>
                        {renderUploader('desktopImage', 'Web banner', 'Recommended: 1920 × 900 px (landscape, 2.13:1). Keep important artwork away from the outer edges.', Monitor, desktopInputRef)}
                        {renderUploader('mobileImage', 'Mobile banner', 'Recommended: 900 × 1200 px (portrait, 3:4). Keep important artwork centered.', Smartphone, mobileInputRef)}
                    </div>
                    <button className={styles.saveButton} type="submit" disabled={saving || Boolean(uploading)}>
                        {saving ? <Loader2 size={17} className="spin" /> : null}
                        {saving ? 'Saving...' : 'Save banner'}
                    </button>
                </form>
            )}
        </div>
    );
}
