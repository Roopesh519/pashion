import { describe, expect, it } from 'vitest';
import { OrderValidationError, parseCheckout } from './orderService';

const productId = '507f1f77bcf86cd799439011';
const validCheckout = {
  customerInfo: {
    email: 'Customer@Example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    address: '12 Example Street',
    city: 'London',
    zip: 'N1 9GU',
  },
  items: [{ product: productId, quantity: 2, size: 'M', color: 'Black', price: 0.01 }],
};

describe('parseCheckout', () => {
  it('accepts valid checkout details and only retains trusted item fields', () => {
    const checkout = parseCheckout(validCheckout);

    expect(checkout.customerInfo.email).toBe('customer@example.com');
    expect(checkout.items).toEqual([{ product: productId, quantity: 2, size: 'M', color: 'Black' }]);
  });

  it.each([
    ['an invalid email', { ...validCheckout, customerInfo: { ...validCheckout.customerInfo, email: 'invalid' } }],
    ['a zero quantity', { ...validCheckout, items: [{ product: productId, quantity: 0 }] }],
    ['an invalid product id', { ...validCheckout, items: [{ product: 'not-an-id', quantity: 1 }] }],
  ])('rejects %s', (_description, request) => {
    expect(() => parseCheckout(request)).toThrow(OrderValidationError);
  });
});
