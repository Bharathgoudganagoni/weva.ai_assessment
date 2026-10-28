const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting StockFlow Database Seeding ---');

  // Clear existing data in reverse order of foreign keys
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Organization 1: Acme Retailers (demo@stockflow.com)
  const acmeOrg = await prisma.organization.create({
    data: {
      name: 'Acme Retailers',
      defaultLowStockThreshold: 5,
      users: {
        create: {
          email: 'demo@stockflow.com',
          password: hashedPassword,
          name: 'Bharath Admin',
        },
      },
    },
    include: {
      users: true,
    },
  });

  console.log(`Created Org 1: ${acmeOrg.name} (${acmeOrg.id}) with User: demo@stockflow.com`);

  const acmeProducts = [
    {
      organizationId: acmeOrg.id,
      name: 'Wireless Noise-Canceling Headphones',
      sku: 'TECH-WNC-01',
      description: 'Over-ear premium headphones with active noise cancellation and 30-hour battery life.',
      quantity: 24,
      costPrice: 45.00,
      sellingPrice: 89.99,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Ergonomic Mechanical Keyboard',
      sku: 'TECH-EMK-02',
      description: 'Custom hot-swappable RGB mechanical keyboard with brown tactile switches.',
      quantity: 3, // Low stock: 3 <= 6
      costPrice: 42.00,
      sellingPrice: 79.99,
      lowStockThreshold: 6,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Ultra-Wide 34" Curved Monitor',
      sku: 'DISP-U34-03',
      description: '144Hz WQHD curved productivity monitor with HDR support and USB-C display link.',
      quantity: 2, // Low stock: 2 <= 4
      costPrice: 280.00,
      sellingPrice: 499.00,
      lowStockThreshold: 4,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Organic Cotton Crewneck T-Shirt (M)',
      sku: 'APP-COT-04',
      description: '100% certified combed organic ring-spun cotton unisex crewneck.',
      quantity: 0, // Out of stock!
      costPrice: 8.50,
      sellingPrice: 24.99,
      lowStockThreshold: 10,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Stainless Steel Insulated Bottle (750ml)',
      sku: 'ACC-BOT-05',
      description: 'Double-wall vacuum insulated water flask with leakproof bamboo cap.',
      quantity: 4, // Low stock: 4 <= 5
      costPrice: 6.20,
      sellingPrice: 18.50,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Anodized Aluminum Laptop Riser Stand',
      sku: 'OFF-STD-06',
      description: 'Elevated ergonomic cooling stand compatible with all 10-17 inch notebooks.',
      quantity: 15,
      costPrice: 12.00,
      sellingPrice: 29.99,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: '1080p Pro Webcam with Dual Mic',
      sku: 'TECH-CAM-07',
      description: 'Full HD streaming webcam with privacy shutter and AI noise reduction.',
      quantity: 18,
      costPrice: 19.50,
      sellingPrice: 44.99,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: '7-in-1 USB-C Multiport Hub',
      sku: 'ACC-HUB-08',
      description: 'Aluminum multiport adapter with 4K HDMI, 100W Power Delivery, and SD reader.',
      quantity: 32,
      costPrice: 14.00,
      sellingPrice: 34.99,
      lowStockThreshold: 8,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Executive High-Back Mesh Chair',
      sku: 'OFF-CHR-09',
      description: 'Ergonomic task chair with adjustable 3D lumbar support and breathable mesh.',
      quantity: 1, // Low stock: 1 <= 3
      costPrice: 110.00,
      sellingPrice: 229.00,
      lowStockThreshold: 3,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Ceramic Matte Desk Mug (350ml)',
      sku: 'HOM-MUG-10',
      description: 'Artisan handcrafted ceramic mug with heat-retaining double glazed finish.',
      quantity: 45,
      costPrice: 3.50,
      sellingPrice: 12.00,
      lowStockThreshold: 10,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Precision Bluetooth Silent Mouse',
      sku: 'TECH-PBM-11',
      description: 'Rechargeable wireless ergonomic mouse with ultra-quiet acoustic switches.',
      quantity: 28,
      costPrice: 11.00,
      sellingPrice: 24.50,
      lowStockThreshold: 6,
      lastUpdatedBy: 'Bharath Admin',
    },
    {
      organizationId: acmeOrg.id,
      name: 'Heavy-Duty Extended Desk Mat (90x40cm)',
      sku: 'ACC-MAT-12',
      description: 'Waterproof non-slip micro-textured desk pad with stitched edges.',
      quantity: 0, // Out of stock!
      costPrice: 5.00,
      sellingPrice: 19.99,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Bharath Admin',
    },
  ];

  for (const prod of acmeProducts) {
    await prisma.product.create({ data: prod });
  }

  // 2. Create Organization 2: Apex Logistics (for testing multi-tenant isolation)
  const apexOrg = await prisma.organization.create({
    data: {
      name: 'Apex Logistics',
      defaultLowStockThreshold: 8,
      users: {
        create: {
          email: 'tester@apex.com',
          password: hashedPassword,
          name: 'Apex Manager',
        },
      },
    },
  });

  console.log(`Created Org 2: ${apexOrg.name} (${apexOrg.id}) with User: tester@apex.com`);

  const apexProducts = [
    {
      organizationId: apexOrg.id,
      name: 'Industrial Barcode Scanner 2D',
      sku: 'IND-SCN-01',
      description: 'Rugged wireless handheld 2D barcode scanner for warehouse inventory.',
      quantity: 5, // Low stock: 5 <= org default 8
      costPrice: 95.00,
      sellingPrice: 169.00,
      lowStockThreshold: null,
      lastUpdatedBy: 'Apex Manager',
    },
    {
      organizationId: apexOrg.id,
      name: 'Thermal Shipping Label Printer',
      sku: 'IND-PRN-02',
      description: 'High-speed 4x6 thermal printer for warehouse dispatch.',
      quantity: 14,
      costPrice: 110.00,
      sellingPrice: 219.00,
      lowStockThreshold: 5,
      lastUpdatedBy: 'Apex Manager',
    },
    {
      organizationId: apexOrg.id,
      name: 'Pallet Wrap Stretch Film (Roll of 4)',
      sku: 'IND-WRP-03',
      description: '80-gauge cast industrial stretch film for pallet containment.',
      quantity: 2, // Low stock: 2 <= 8
      costPrice: 28.00,
      sellingPrice: 59.99,
      lowStockThreshold: 8,
      lastUpdatedBy: 'Apex Manager',
    },
  ];

  for (const prod of apexProducts) {
    await prisma.product.create({ data: prod });
  }

  console.log('--- Fresh Seeding Completed Successfully! ---');
  console.log('Demo Credentials:');
  console.log('  Org 1 (Acme): demo@stockflow.com / password123 (12 products)');
  console.log('  Org 2 (Apex): tester@apex.com / password123 (3 products)');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
