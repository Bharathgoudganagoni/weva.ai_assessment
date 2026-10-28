const prisma = require('../config/db');

/**
 * Get dashboard overview metrics and low stock items
 * Strictly scoped to the authenticated organization
 */
async function getDashboardSummary(req, res) {
  try {
    const { organizationId } = req.user;

    // Fetch organization default threshold
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
      },
    });

    const defaultThreshold = org ? org.defaultLowStockThreshold : 5;

    // Fetch all products for this organization
    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { quantity: 'asc' }, // Low stock first
    });

    const totalProducts = products.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalSellingValue = 0;

    const lowStockProducts = [];

    for (const p of products) {
      const qty = p.quantity || 0;
      totalStockUnits += qty;

      if (p.costPrice) {
        totalCostValue += parseFloat(p.costPrice) * qty;
      }
      if (p.sellingPrice) {
        totalSellingValue += parseFloat(p.sellingPrice) * qty;
      }

      const threshold =
        p.lowStockThreshold !== null && p.lowStockThreshold !== undefined
          ? p.lowStockThreshold
          : defaultThreshold;

      if (qty <= threshold) {
        lowStockProducts.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: qty,
          lowStockThreshold: p.lowStockThreshold,
          effectiveThreshold: threshold,
          sellingPrice: p.sellingPrice ? parseFloat(p.sellingPrice) : null,
          costPrice: p.costPrice ? parseFloat(p.costPrice) : null,
          updatedAt: p.updatedAt,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        organization: {
          id: org.id,
          name: org.name,
          defaultLowStockThreshold: defaultThreshold,
        },
        metrics: {
          totalProducts,
          totalStockUnits,
          lowStockCount: lowStockProducts.length,
          totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
          totalCostValue: parseFloat(totalCostValue.toFixed(2)),
        },
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard summary.',
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardSummary,
};
