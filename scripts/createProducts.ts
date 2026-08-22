import dotenv from "dotenv";
import readline from "readline";

dotenv.config({
  path: ".env.local",
});

const dbConnect = require("../src/lib/db").default;
const Product = require("../src/models/Product").default;

// ============================================================
// CONFIGURATION
// ============================================================

const PRODUCT_IMAGE =
    "https://res.cloudinary.com/eso4hftc/image/upload/v1787320105/pashion/products/uicb1dr9of8lkz9h9qkw.jpg";

const CATEGORIES = [
    "Hoodies",
    "T-Shirts",
    "Pants",
];

const SIZES = ["S", "M", "L", "XL"];

// ============================================================
// PRODUCT DATA
// ============================================================

const PRODUCT_DATA = {
    Hoodies: {
        names: [
            "Classic Hoodie",
            "Premium Hoodie",
            "Oversized Hoodie",
            "Essential Hoodie",
            "Cotton Hoodie",
            "Street Hoodie",
            "Casual Hoodie",
            "Minimal Hoodie",
        ],

        colors: [
            { name: "White", value: "#ffffff" },
            { name: "Black", value: "#000000" },
            { name: "Grey", value: "#808080" },
            { name: "Navy Blue", value: "#000080" },
        ],

        prices: [499, 599, 699, 799, 899, 999],
    },

    "T-Shirts": {
        names: [
            "Classic T-Shirt",
            "Premium T-Shirt",
            "Cotton T-Shirt",
            "Oversized T-Shirt",
            "Essential T-Shirt",
            "Casual T-Shirt",
            "Basic T-Shirt",
            "Street T-Shirt",
        ],

        colors: [
            { name: "White", value: "#ffffff" },
            { name: "Black", value: "#000000" },
            { name: "Blue", value: "#0000ff" },
            { name: "Grey", value: "#808080" },
        ],

        prices: [299, 349, 399, 449, 499, 599],
    },

    Pants: {
        names: [
            "Classic Pants",
            "Casual Pants",
            "Slim Fit Pants",
            "Relaxed Pants",
            "Cargo Pants",
            "Cotton Pants",
            "Essential Pants",
            "Street Pants",
        ],

        colors: [
            { name: "Black", value: "#000000" },
            { name: "Grey", value: "#808080" },
            { name: "Navy Blue", value: "#000080" },
            { name: "Beige", value: "#f5f5dc" },
        ],

        prices: [699, 799, 899, 999, 1099, 1299],
    },
};

// ============================================================
// HELPERS
// ============================================================

function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSlug(name: string, index: number): string {
    return `${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now()}-${index}`;
}

// ============================================================
// GENERATE PRODUCT
// ============================================================

function generateProduct(index: number) {
    const category = randomItem(CATEGORIES);

    const categoryData =
        PRODUCT_DATA[category as keyof typeof PRODUCT_DATA];

    const productName = randomItem(categoryData.names);

    const color = randomItem(categoryData.colors);

    const price = randomItem(categoryData.prices);

    const name = `${color.name} ${productName}`;

    // Occasionally give the product an original price
    const hasOriginalPrice = Math.random() < 0.4;

    const originalPrice = hasOriginalPrice
        ? price + randomNumber(100, 500)
        : undefined;

    return {
        name,

        description: `<p>${name}</p>`,

        price,

        ...(originalPrice ? { originalPrice } : {}),

        images: [PRODUCT_IMAGE],

        category,

        slug: generateSlug(productName, index),

        sizes: [...SIZES],

        colors: [
            {
                name: color.name,
                value: color.value,
            },
        ],

        stock: randomNumber(50, 200),

        isFeatured: Math.random() < 0.2,

        badge: randomItem([
            "",
            "",
            "",
            "",
            "New",
            "Popular",
            "Sale",
        ]),
    };
}

// ============================================================
// ASK FOR NUMBER OF PRODUCTS
// ============================================================

function askForNumber(): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(
            "How many products do you want to create? ",
            (answer) => {
                rl.close();

                const count = Number(answer);

                if (!Number.isInteger(count) || count <= 0) {
                    console.error(
                        "❌ Please enter a valid positive number."
                    );

                    process.exit(1);
                }

                resolve(count);
            }
        );
    });
}

// ============================================================
// MAIN
// ============================================================

async function run() {
    try {
        const count = await askForNumber();

        console.log("\n🔌 Connecting to MongoDB...");

        await dbConnect();

        console.log(`✅ MongoDB connected`);
        console.log(`\n🚀 Creating ${count} products...\n`);

        let created = 0;
        let failed = 0;

        for (let i = 1; i <= count; i++) {
            try {
                const productData = generateProduct(i);

                const product = await Product.create(productData);

                created++;

                console.log(
                    `✅ [${i}/${count}] ${product.name}`
                );

                console.log(
                    `   Category : ${product.category}`
                );

                console.log(
                    `   Price    : ₹${product.price}`
                );

                if (product.originalPrice) {
                    console.log(
                        `   Original : ₹${product.originalPrice}`
                    );
                }

                console.log(
                    `   Stock    : ${product.stock}`
                );

                console.log(
                    `   Slug     : ${product.slug}`
                );

                console.log("");
            } catch (error: any) {
                failed++;

                console.error(
                    `❌ [${i}/${count}] Failed`
                );

                console.error(
                    `   ${error.message}`
                );

                console.log("");
            }
        }

        console.log("======================================");
        console.log("          PRODUCT CREATION");
        console.log("======================================");
        console.log(`Requested : ${count}`);
        console.log(`Created   : ${created}`);
        console.log(`Failed    : ${failed}`);
        console.log("======================================");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Script failed:");
        console.error(error);

        process.exit(1);
    }
}

run();