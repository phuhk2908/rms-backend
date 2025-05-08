# API Request and Response Examples

This document provides example request and response data for all API endpoints in the Restaurant Management System.

## Table of Contents
1. [Authentication](#authentication)
2. [Menu](#menu)
3. [Order](#order)
4. [Reservation](#reservation)
5. [Payment](#payment)
6. [Supplier](#supplier)
7. [Kitchen Display](#kitchen-display)
8. [Inventory](#inventory)
9. [Report](#report)
10. [Notification](#notification)

## Authentication

### Login Request
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Register Request
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MANAGER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Menu

### Create Menu Category Request
```json
{
  "name": "Pizza",
  "description": "Traditional and specialty pizzas",
  "isActive": true
}
```

### Update Menu Category Request
```json
{
  "name": "Artisanal Pizza",
  "description": "Handcrafted pizzas with premium ingredients",
  "isActive": true
}
```

### Create Menu Item Request
```json
{
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Classic Margherita Pizza",
  "description": "Fresh tomatoes, mozzarella, basil, and olive oil on our signature crust",
  "price": 14.99,
  "isActive": true,
  "preparationTime": 15,
  "imageUrl": "https://example.com/images/margherita-pizza.jpg",
  "ingredientIds": [
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002"
  ]
}
```

### Update Menu Item Request
```json
{
  "price": 16.99,
  "description": "Fresh tomatoes, buffalo mozzarella, basil, and extra virgin olive oil on our signature crust",
  "preparationTime": 20
}
```

### Menu Category Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Pizza",
  "description": "Traditional and specialty pizzas",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Menu Item Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Classic Margherita Pizza",
  "description": "Fresh tomatoes, mozzarella, basil, and olive oil on our signature crust",
  "price": 14.99,
  "isActive": true,
  "preparationTime": 15,
  "imageUrl": "https://example.com/images/margherita-pizza.jpg",
  "category": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Pizza",
    "description": "Traditional and specialty pizzas",
    "isActive": true
  },
  "recipes": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Margherita Base Recipe",
      "description": "Base recipe for Margherita pizza",
      "instructions": "Mix ingredients, knead dough, let rise...",
      "preparationTime": 30,
      "cookingTime": 15,
      "servings": 1,
      "difficulty": "MEDIUM",
      "ingredients": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Flour",
          "quantity": 250,
          "unit": "GRAMS"
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Order

### Create Order Request
```json
{
  "tableId": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "menuItemId": "123e4567-e89b-12d3-a456-426614174000",
      "quantity": 2,
      "specialInstructions": "Extra cheese please"
    }
  ],
  "paymentMethod": "CREDIT_CARD",
  "isTakeout": false,
  "notes": "Customer is celebrating birthday"
}
```

### Update Order Request
```json
{
  "status": "IN_PROGRESS",
  "notes": "Customer requested extra napkins"
}
```

### Order Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2024-001",
  "table": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "number": "T1",
    "capacity": 4,
    "status": "OCCUPIED"
  },
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "menuItem": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Classic Margherita Pizza",
        "price": 14.99
      },
      "quantity": 2,
      "unitPrice": 14.99,
      "totalPrice": 29.98,
      "specialInstructions": "Extra cheese please",
      "status": "PREPARING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "subtotal": 29.98,
  "tax": 2.99,
  "tip": 4.50,
  "totalAmount": 37.47,
  "paymentMethod": "CREDIT_CARD",
  "status": "IN_PROGRESS",
  "isTakeout": false,
  "notes": "Customer is celebrating birthday",
  "createdBy": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Reservation

### Create Reservation Request
```json
{
  "tableId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "customerPhone": "+1234567890",
  "partySize": 4,
  "reservationTime": "2024-01-01T19:00:00.000Z",
  "duration": 120,
  "specialRequests": "Window seat preferred"
}
```

### Update Reservation Request
```json
{
  "status": "CONFIRMED",
  "specialRequests": "Window seat preferred, celebrating anniversary"
}
```

### Reservation Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "table": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "number": "T1",
    "capacity": 4
  },
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "customerPhone": "+1234567890",
  "partySize": 4,
  "reservationTime": "2024-01-01T19:00:00.000Z",
  "duration": 120,
  "status": "CONFIRMED",
  "specialRequests": "Window seat preferred",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Payment

### Create Payment Request
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 37.47,
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "txn_123456789"
}
```

### Update Payment Request
```json
{
  "status": "COMPLETED",
  "transactionId": "txn_123456789"
}
```

### Payment Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "order": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2024-001"
  },
  "amount": 37.47,
  "paymentMethod": "CREDIT_CARD",
  "status": "COMPLETED",
  "transactionId": "txn_123456789",
  "paymentDate": "2024-01-01T20:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Supplier

### Create Supplier Request
```json
{
  "name": "Fresh Produce Co.",
  "contactPerson": "Jane Smith",
  "email": "jane@freshproduce.com",
  "phone": "+1234567890",
  "address": "123 Market St, City, State 12345",
  "taxId": "TAX123456789",
  "paymentTerms": "NET30",
  "isActive": true
}
```

### Update Supplier Request
```json
{
  "contactPerson": "Jane Smith-Jones",
  "phone": "+1234567891",
  "paymentTerms": "NET15"
}
```

### Supplier Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Fresh Produce Co.",
  "contactPerson": "Jane Smith",
  "email": "jane@freshproduce.com",
  "phone": "+1234567890",
  "address": "123 Market St, City, State 12345",
  "taxId": "TAX123456789",
  "paymentTerms": "NET30",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Kitchen Display

### Update Order Item Status Request
```json
{
  "orderItemId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "PREPARING",
  "notes": "Started preparation"
}
```

### Update Order Status Request
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "IN_PROGRESS",
  "notes": "All items are being prepared"
}
```

### Kitchen Display Response
```json
{
  "activeOrders": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "orderNumber": "ORD-2024-001",
      "tableNumber": "T1",
      "status": "IN_PROGRESS",
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "menuItem": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Classic Margherita Pizza",
            "description": "Fresh tomatoes, mozzarella, basil, and olive oil"
          },
          "quantity": 2,
          "specialInstructions": "Extra cheese please",
          "status": "PREPARING",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPendingItems": 5,
  "totalInProgressItems": 3,
  "totalCompletedItems": 12
}
```

## Inventory

### Create Inventory Item Request
```json
{
  "name": "Fresh Mozzarella",
  "description": "High-quality fresh mozzarella cheese",
  "category": "DAIRY",
  "quantity": 10.5,
  "minimumQuantity": 5,
  "unitPrice": 8.99,
  "location": "Refrigerator A-1",
  "notes": "Order more when below 5kg"
}
```

### Update Inventory Item Request
```json
{
  "quantity": 8.5,
  "location": "Refrigerator A-2",
  "notes": "Moving to new location"
}
```

### Inventory Item Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Fresh Mozzarella",
  "description": "High-quality fresh mozzarella cheese",
  "category": "DAIRY",
  "quantity": 10.5,
  "minimumQuantity": 5,
  "unitPrice": 8.99,
  "location": "Refrigerator A-1",
  "status": "IN_STOCK",
  "notes": "Order more when below 5kg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Report

### Generate Report Request
```json
{
  "reportType": "SALES",
  "timeRange": "LAST_MONTH",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z",
  "filters": {
    "category": "Pizza"
  }
}
```

### Sales Report Response
```json
{
  "reportType": "SALES",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "data": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "totalOrders": 150,
    "totalRevenue": 4500.00,
    "averageOrderValue": 30.00,
    "salesByItem": [
      {
        "itemName": "Classic Margherita Pizza",
        "category": "Pizza",
        "quantitySold": 75,
        "totalRevenue": 1124.25,
        "averagePrice": 14.99
      }
    ],
    "paymentMethodBreakdown": {
      "CREDIT_CARD": 60,
      "CASH": 30,
      "MOBILE_PAYMENT": 10
    },
    "hourlyBreakdown": {
      "12:00": 20,
      "13:00": 35,
      "14:00": 25
    }
  }
}
```

### Inventory Report Response
```json
{
  "reportType": "INVENTORY",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "data": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "totalItems": 100,
    "totalValue": 5000.00,
    "lowStockItems": [
      {
        "itemName": "Fresh Mozzarella",
        "currentStock": 4.5,
        "minimumStock": 5.0,
        "quantityUsed": 25.5,
        "quantityReceived": 30.0,
        "totalCost": 269.70
      }
    ],
    "inventoryByCategory": {
      "DAIRY": 2500.00,
      "PRODUCE": 1500.00,
      "MEAT": 1000.00
    }
  }
}
```

## Notification

### Create Notification Request
```json
{
  "type": "LOW_STOCK",
  "title": "Low Stock Alert",
  "message": "Fresh Mozzarella is running low (4.5kg remaining)",
  "priority": "HIGH",
  "relatedEntityId": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "currentStock": 4.5,
    "minimumStock": 5.0
  }
}
```

### Update Notification Request
```json
{
  "isRead": true,
  "isAcknowledged": true
}
```

### Notification Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "LOW_STOCK",
  "title": "Low Stock Alert",
  "message": "Fresh Mozzarella is running low (4.5kg remaining)",
  "priority": "HIGH",
  "isRead": false,
  "isAcknowledged": false,
  "relatedEntityId": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "currentStock": 4.5,
    "minimumStock": 5.0
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Notification Preferences Response
```json
{
  "email": {
    "enabled": true,
    "address": "john.doe@example.com"
  },
  "push": {
    "enabled": true,
    "deviceTokens": ["device_token_1", "device_token_2"]
  },
  "sms": {
    "enabled": false,
    "phoneNumber": "+1234567890"
  },
  "enabledTypes": [
    "LOW_STOCK",
    "ORDER_STATUS",
    "RESERVATION"
  ],
  "minimumPriority": "MEDIUM"
}
``` 