import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING_COST = 15;

type CheckoutItem = {
  product: string;
  quantity: number;
  size?: string;
  color?: string;
};

type CustomerInfo = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zip: string;
  country?: string;
};

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

function asRequiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new OrderValidationError(`Please provide a valid ${field}`);
  }
  return value.trim();
}

export function parseCheckout(data: unknown): { customerInfo: CustomerInfo; items: CheckoutItem[] } {
  if (!data || typeof data !== 'object') throw new OrderValidationError('Invalid checkout request');
  const request = data as { customerInfo?: Record<string, unknown>; items?: unknown };
  const customer = request.customerInfo;
  if (!customer) throw new OrderValidationError('Customer information is required');

  const email = asRequiredString(customer.email, 'email', 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new OrderValidationError('Please provide a valid email');

  if (!Array.isArray(request.items) || request.items.length === 0 || request.items.length > 25) {
    throw new OrderValidationError('Your cart must contain between 1 and 25 items');
  }

  const items = request.items.map((item): CheckoutItem => {
    if (!item || typeof item !== 'object') throw new OrderValidationError('Invalid order item');
    const parsed = item as Record<string, unknown>;
    if (typeof parsed.product !== 'string' || !mongoose.Types.ObjectId.isValid(parsed.product)) {
      throw new OrderValidationError('Invalid product in cart');
    }
    if (!Number.isInteger(parsed.quantity) || (parsed.quantity as number) < 1 || (parsed.quantity as number) > 99) {
      throw new OrderValidationError('Each item quantity must be between 1 and 99');
    }
    return {
      product: parsed.product,
      quantity: parsed.quantity as number,
      size: typeof parsed.size === 'string' ? parsed.size.trim() : undefined,
      color: typeof parsed.color === 'string' ? parsed.color.trim() : undefined,
    };
  });

  return {
    customerInfo: {
      email,
      firstName: asRequiredString(customer.firstName, 'first name', 60),
      lastName: asRequiredString(customer.lastName, 'last name', 60),
      phone: typeof customer.phone === 'string' ? customer.phone.trim().slice(0, 20) : undefined,
      address: asRequiredString(customer.address, 'address', 200),
      city: asRequiredString(customer.city, 'city', 100),
      state: typeof customer.state === 'string' ? customer.state.trim().slice(0, 100) : undefined,
      zip: asRequiredString(customer.zip, 'postal code', 20),
      country: typeof customer.country === 'string' && customer.country.trim() ? customer.country.trim().slice(0, 2).toUpperCase() : 'US',
    },
    items,
  };
}

export async function calculateOrderTotal(requestData: unknown): Promise<number> {
  const { items } = parseCheckout(requestData);
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.product, (quantities.get(item.product) || 0) + item.quantity);

  const productIds = [...quantities.keys()].map((id) => new mongoose.Types.ObjectId(id));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  if (products.length !== productIds.length) throw new OrderValidationError('One or more products are no longer available');

  const productsById = new Map(products.map((product: any) => [product._id.toString(), product]));
  let subtotalCents = 0;

  for (const item of items) {
    const product = productsById.get(item.product);
    if (!product) throw new OrderValidationError('Product not found');
    subtotalCents += Math.round(product.price * 100) * item.quantity;
  }

  const shippingCents = subtotalCents > FREE_SHIPPING_THRESHOLD * 100 ? 0 : STANDARD_SHIPPING_COST * 100;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  
  return subtotalCents + shippingCents + taxCents;
}

export async function createOrderFromCheckout(
  userId: string, 
  requestData: unknown, 
  paymentOptions?: { method: string; transactionId: string; status: string }
) {
  const { customerInfo, items } = parseCheckout(requestData);
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.product, (quantities.get(item.product) || 0) + item.quantity);

  const session = await mongoose.startSession();
  let createdOrderId: mongoose.Types.ObjectId | null = null;
  let updatedProductIds: string[] = [];

  try {
    await session.withTransaction(async () => {
      const productIds = [...quantities.keys()].map((id) => new mongoose.Types.ObjectId(id));
      const products = await Product.find({ _id: { $in: productIds } }).session(session).lean();
      if (products.length !== productIds.length) throw new OrderValidationError('One or more products are no longer available');

      const productsById = new Map(products.map((product: any) => [product._id.toString(), product]));
      const orderItems = items.map((item) => {
        const product = productsById.get(item.product);
        if (!product) throw new OrderValidationError('One or more products are no longer available');
        if (item.size && !product.sizes?.includes(item.size)) throw new OrderValidationError(`${product.name} is not available in size ${item.size}`);
        if (item.color && !product.colors?.some((color: { name?: string }) => color.name === item.color)) {
          throw new OrderValidationError(`${product.name} is not available in color ${item.color}`);
        }
        return {
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          size: item.size,
          color: item.color,
          image: product.images?.[0] || '',
        };
      });

      for (const [productId, quantity] of quantities) {
        const result = await Product.updateOne(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) throw new OrderValidationError('One or more items no longer have enough stock');
      }

      const subtotalCents = orderItems.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
      const shippingCents = subtotalCents > FREE_SHIPPING_THRESHOLD * 100 ? 0 : STANDARD_SHIPPING_COST * 100;
      const taxCents = Math.round(subtotalCents * TAX_RATE);
      const [order] = await Order.create([{
        user: new mongoose.Types.ObjectId(userId),
        customerInfo,
        items: orderItems,
        subtotal: subtotalCents / 100,
        shippingCost: shippingCents / 100,
        tax: taxCents / 100,
        totalAmount: (subtotalCents + shippingCents + taxCents) / 100,
        paymentMethod: paymentOptions?.method || 'credit_card',
        paymentStatus: paymentOptions?.status || 'pending',
        transactionId: paymentOptions?.transactionId,
        shippingMethod: 'standard',
        statusHistory: [{ status: 'pending', notes: 'Order created' }],
      }], { session });

      createdOrderId = order._id;
      updatedProductIds = [...quantities.keys()];
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrderId) throw new Error('Order could not be created');
  const order = await Order.findById(createdOrderId).populate('items.product');
  const products = await Product.find({ _id: { $in: updatedProductIds } }).lean() as unknown as Array<{
    _id: mongoose.Types.ObjectId;
    stock: number;
    name: string;
  }>;
  return { order, products };
}
