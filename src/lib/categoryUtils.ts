export function slugifyCategoryName(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeCategoryIdentifier(value: string) {
    return decodeURIComponent(value).trim();
}

export function buildCategoryProductQuery(identifier: string, categoryName?: string) {
    if (categoryName) {
        return { category: categoryName };
    }

    const normalized = normalizeCategoryIdentifier(identifier);
    const hyphenated = slugifyCategoryName(normalized);
    const displayName = normalized.replace(/-/g, ' ');

    return {
        $or: [
            { category: new RegExp(`^${escapeRegExp(normalized)}$`, 'i') },
            { category: new RegExp(`^${escapeRegExp(displayName)}$`, 'i') },
            { category: new RegExp(`^${escapeRegExp(hyphenated)}$`, 'i') },
        ],
    };
}
