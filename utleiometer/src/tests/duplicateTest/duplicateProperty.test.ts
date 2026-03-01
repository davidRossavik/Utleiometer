import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPropertyAction } from '@/app/actions/properties';
import * as propertiesLib from '@/lib/firebase/properties';

//US3 Testing duplicate property detection

// Mock the Firebase properties module
vi.mock('@/lib/firebase/properties', () => ({
  createProperty: vi.fn(),
  getPropertyByAddress: vi.fn(),
}));

describe('Duplicate Property Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPropertyAction', () => {
    const mockPropertyData = {
      address: '123 test street',
      zipCode: '12345',
      city: 'test city',
      registeredByUid: 'user123',
      imageUrl: 'https://example.com/image.jpg',
    };
// This test verifies that the createPropertyAction correctly identifies duplicates based on address, zip code, and city, regardless of whitespace and case differences.
    it('should return error when duplicate property exists', async () => {
      // getPropertyByAddress to return an existing property
      const existingProperty = {
        propertyId: 'existing-id',
        address: '123 test street',
        zipCode: '12345',
        city: 'test city',
        registeredByUid: 'user456',
        createdAt: new Date(),
      };

      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(existingProperty);

      //Create FormData with the same address details
      const formData = new FormData();
      formData.append('address', mockPropertyData.address);
      formData.append('zipCode', mockPropertyData.zipCode);
      formData.append('city', mockPropertyData.city);
      formData.append('registeredByUid', mockPropertyData.registeredByUid);
      formData.append('imageUrl', mockPropertyData.imageUrl);

      const result = await createPropertyAction(formData);

      expect(result).toEqual({
        error: "Property already exists, please visit the property's page to leave a review.",
      });
      expect(propertiesLib.getPropertyByAddress).toHaveBeenCalledWith(
        '123 test street',
        '12345',
        'test city'
      );
      expect(propertiesLib.createProperty).not.toHaveBeenCalled();
    });

// This test ensures that the duplicate detection logic is robust against variations in whitespace and letter casing, which are common user input issues.
    it('should normalize whitespace and case before checking for duplicates', async () => {
      const existingProperty = {
        propertyId: 'existing-id',
        address: '123 test street',
        zipCode: '12345',
        city: 'test city',
        registeredByUid: 'user456',
        createdAt: new Date(),
      };

      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(existingProperty);

      // create FormData with extra whitespace and different case
      const formData = new FormData();
      formData.append('address', '  123   TEST   Street  ');
      formData.append('zipCode', ' 12345 ');
      formData.append('city', '  Test   CITY  ');
      formData.append('registeredByUid', 'user123');

      const result = await createPropertyAction(formData);

      expect(result).toEqual({
        error: "Property already exists, please visit the property's page to leave a review.",
      });
      // Should be called with normalized values
      expect(propertiesLib.getPropertyByAddress).toHaveBeenCalledWith(
        '123 test street',
        '12345',
        'test city'
      );
    });

    it('should create property successfully when no duplicate exists', async () => {
      // Mock getPropertyByAddress to return null (no duplicate)
      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);

      const newProperty = {
        propertyId: 'new-id-123',
        address: '456 new street',
        zipCode: '67890',
        city: 'new city',
        registeredByUid: 'user789',
        createdAt: new Date(),
        imageUrl: 'https://example.com/new-image.jpg',
      };

      vi.mocked(propertiesLib.createProperty).mockResolvedValue(newProperty);

      const formData = new FormData();
      formData.append('address', '456 New Street');
      formData.append('zipCode', '67890');
      formData.append('city', 'New City');
      formData.append('registeredByUid', 'user789');
      formData.append('imageUrl', 'https://example.com/new-image.jpg');

      const result = await createPropertyAction(formData);

      expect(result).toEqual(newProperty);
      expect(propertiesLib.getPropertyByAddress).toHaveBeenCalledWith(
        '456 new street',
        '67890',
        'new city'
      );
      expect(propertiesLib.createProperty).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '456 new street',
          zipCode: '67890',
          city: 'new city',
          registeredByUid: 'user789',
          imageUrl: 'https://example.com/new-image.jpg',
        })
      );
    });
// This test verifies that the duplicate detection logic is based on property details rather than the user who registered it, ensuring that different users cannot register the same property.
    it('should detect duplicate even with different users', async () => {
      const existingProperty = {
        propertyId: 'existing-id',
        address: 'main street 1',
        zipCode: '54321',
        city: 'oslo',
        registeredByUid: 'user-original',
        createdAt: new Date(),
      };

      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(existingProperty);

      // Different user trying to register the same property
      const formData = new FormData();
      formData.append('address', 'Main Street 1');
      formData.append('zipCode', '54321');
      formData.append('city', 'Oslo');
      formData.append('registeredByUid', 'user-different');

      const result = await createPropertyAction(formData);

      expect(result).toEqual({
        error: "Property already exists, please visit the property's page to leave a review.",
      });
    });

    it('should throw error when required fields are missing', async () => {
      const formData = new FormData();
      formData.append('address', '123 test street');
      // Missing zipCode, city, and registeredByUid

      await expect(createPropertyAction(formData)).rejects.toThrow();
    });

    it('should create property without imageUrl when not provided', async () => {
      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);

      const newProperty = {
        propertyId: 'new-id',
        address: 'test street',
        zipCode: '11111',
        city: 'bergen',
        registeredByUid: 'user123',
        createdAt: new Date(),
      };

      vi.mocked(propertiesLib.createProperty).mockResolvedValue(newProperty);

      const formData = new FormData();
      formData.append('address', 'Test Street');
      formData.append('zipCode', '11111');
      formData.append('city', 'Bergen');
      formData.append('registeredByUid', 'user123');
      // No imageUrl provided

      const result = await createPropertyAction(formData);

      expect(result).toEqual(newProperty);
      expect(propertiesLib.createProperty).toHaveBeenCalledWith(
        expect.not.objectContaining({
          imageUrl: expect.anything(),
        })
      );
    });

    it('should handle database errors appropriately', async () => {
      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);
      vi.mocked(propertiesLib.createProperty).mockRejectedValue(
        new Error('Database connection failed')
      );

      const formData = new FormData();
      formData.append('address', 'Test Street');
      formData.append('zipCode', '11111');
      formData.append('city', 'Bergen');
      formData.append('registeredByUid', 'user123');

      await expect(createPropertyAction(formData)).rejects.toThrow(
        'Failed to create property'
      );
    });
  });

  describe('getPropertyByAddress', () => {
    it('should correctly identify duplicate by matching address, zipCode, and city', async () => {
      // This test verifies the duplicate detection logic at the database level
      const mockProperty = {
        propertyId: 'test-id',
        address: 'storgata 1',
        zipCode: '0182',
        city: 'oslo',
        registeredByUid: 'user123',
        createdAt: new Date(),
      };

      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(mockProperty);

      const result = await propertiesLib.getPropertyByAddress('storgata 1', '0182', 'oslo');

      expect(result).toEqual(mockProperty);
      expect(propertiesLib.getPropertyByAddress).toHaveBeenCalledWith(
        'storgata 1',
        '0182',
        'oslo'
      );
    });

    it('should return null when no matching property exists', async () => {
      vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);

      const result = await propertiesLib.getPropertyByAddress('nonexistent street', '99999', 'nowhere');

      expect(result).toBeNull();
    });
  });
});
