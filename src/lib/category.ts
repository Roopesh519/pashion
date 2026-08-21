import Category from '@/models/Category';
import { normalizeCategoryIdentifier, slugifyCategoryName, escapeRegExp } from './categoryUtils';

export * from './categoryUtils';

export interface CategoryOption {
    _id?: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    featured?: boolean;
    sortOrder?: number;
    productCount?: number;
}

export async function resolveCategoryNames(values: string[]) {
    const normalizedValues = Array.from(
        new Set(values.map(normalizeCategoryIdentifier).filter(Boolean))
    );

    if (normalizedValues.length === 0) {
        return [];
    }

    const slugs = normalizedValues.map(slugifyCategoryName);
    const categories = (await Category.find({
        $or: [
            { slug: { $in: slugs } },
            { name: { $in: normalizedValues } },
        ],
    }).lean()) as unknown as CategoryOption[];

    const matchedIdentifiers = new Set<string>();
    categories.forEach((category) => {
        matchedIdentifiers.add(category.name);
        matchedIdentifiers.add(category.slug);
    });

    const matchedNames = categories.map((category) => category.name);

    return Array.from(
        new Set([
            ...matchedNames,
            ...normalizedValues.filter((value) => !matchedIdentifiers.has(value) && !matchedIdentifiers.has(slugifyCategoryName(value))),
        ])
    );
}

export async function findCategoryByIdentifier(identifier: string) {
    const normalized = normalizeCategoryIdentifier(identifier);
    const slug = slugifyCategoryName(normalized);

    return Category.findOne({
        $or: [
            { slug },
            { name: new RegExp(`^${escapeRegExp(normalized)}$`, 'i') },
        ],
    }).lean<CategoryOption | null>();
}

