const prisma = require('../config/db');

/**
 * Get all products for the current organization
 * Supports search by name or SKU
 */
async function getProducts(req, res) {
  try {
    const { organizationId } = req.user;
    const { search } = req.query;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const defaultThreshold = org ? org.defaultLowStockThreshold : 5;

    const whereClause = {
      organizationId,
    };

    if (search && search.trim() !== '') {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    // Format products and add isLowStock indicator
    const formattedProducts = products.map((prod) => {
      const effectiveThreshold =
        prod.lowStockThreshold !== null && prod.lowStockThreshold !== undefined
          ? prod.lowStockThreshold
          : defaultThreshold;

      const isLowStock = prod.quantity <= effectiveThreshold;

      return {
        ...prod,
        costPrice: prod.costPrice !== null ? parseFloat(prod.costPrice) : null,
        sellingPrice: prod.sellingPrice !== null ? parseFloat(prod.sellingPrice) : null,
        effectiveThreshold,
        isLowStock,
      };
    });

    return res.json({
      success: true,
      count: formattedProducts.length,
      defaultThreshold,
      data: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message,
    });
  }
}

/**
 * Get a single product by ID (scoped to organization)
 */
async function getProductById(req, res) {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const defaultThreshold = org ? org.defaultLowStockThreshold : 5;

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    const effectiveThreshold =
      product.lowStockThreshold !== null && product.lowStockThreshold !== undefined
        ? product.lowStockThreshold
        : defaultThreshold;

    return res.json({
      success: true,
      data: {
        ...product,
        costPrice: product.costPrice !== null ? parseFloat(product.costPrice) : null,
        sellingPrice: product.sellingPrice !== null ? parseFloat(product.sellingPrice) : null,
        effectiveThreshold,
        isLowStock: product.quantity <= effectiveThreshold,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details.',
      error: error.message,
    });
  }
}

/**
 * Create a new product (scoped to organization)
 */
async function createProduct(req, res) {
  try {
    const { organizationId } = req.user;
    const {
      name,
      sku,
      description,
      quantity,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product SKU is required.',
      });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness within the organization
    const existingSku = await prisma.product.findFirst({
      where: {
        organizationId,
        sku: cleanSku,
      },
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${cleanSku}" already exists in your organization.`,
      });
    }

    const parsedQty = quantity !== undefined && quantity !== null && quantity !== ''
      ? parseInt(quantity, 10)
      : 0;

    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid non-negative integer.',
      });
    }

    const parsedCostPrice =
      costPrice !== undefined && costPrice !== null && costPrice !== ''
        ? parseFloat(costPrice)
        : null;

    if (parsedCostPrice !== null && (isNaN(parsedCostPrice) || parsedCostPrice < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cost price must be a valid non-negative number.',
      });
    }

    const parsedSellingPrice =
      sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== ''
        ? parseFloat(sellingPrice)
        : null;

    if (parsedSellingPrice !== null && (isNaN(parsedSellingPrice) || parsedSellingPrice < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be a valid non-negative number.',
      });
    }

    const parsedThreshold =
      lowStockThreshold !== undefined &&
      lowStockThreshold !== null &&
      lowStockThreshold !== ''
        ? parseInt(lowStockThreshold, 10)
        : null;

    if (parsedThreshold !== null && (isNaN(parsedThreshold) || parsedThreshold < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be a valid non-negative integer.',
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        organizationId,
        name: name.trim(),
        sku: cleanSku,
        description: description ? description.trim() : null,
        quantity: parsedQty,
        costPrice: parsedCostPrice,
        sellingPrice: parsedSellingPrice,
        lowStockThreshold: parsedThreshold,
        lastUpdatedBy: req.user.name || req.user.email,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        ...newProduct,
        costPrice: newProduct.costPrice !== null ? parseFloat(newProduct.costPrice) : null,
        sellingPrice: newProduct.sellingPrice !== null ? parseFloat(newProduct.sellingPrice) : null,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product.',
      error: error.message,
    });
  }
}

/**
 * Update a product (scoped to organization)
 */
async function updateProduct(req, res) {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      quantity,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = req.body;

    // Check if product exists under this organization
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty.',
        });
      }
      updateData.name = name.trim();
    }

    if (sku !== undefined) {
      if (!sku || !sku.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product SKU cannot be empty.',
        });
      }
      const cleanSku = sku.trim().toUpperCase();
      // If SKU is changed, check uniqueness
      if (cleanSku !== product.sku) {
        const skuConflict = await prisma.product.findFirst({
          where: {
            organizationId,
            sku: cleanSku,
            id: { not: id },
          },
        });
        if (skuConflict) {
          return res.status(409).json({
            success: false,
            message: `SKU "${cleanSku}" is already taken by another product in your organization.`,
          });
        }
      }
      updateData.sku = cleanSku;
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (quantity !== undefined) {
      const parsedQty = parseInt(quantity, 10);
      if (isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a valid non-negative integer.',
        });
      }
      updateData.quantity = parsedQty;
    }

    if (costPrice !== undefined) {
      if (costPrice === null || costPrice === '') {
        updateData.costPrice = null;
      } else {
        const parsed = parseFloat(costPrice);
        if (isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: 'Cost price must be a valid non-negative number.',
          });
        }
        updateData.costPrice = parsed;
      }
    }

    if (sellingPrice !== undefined) {
      if (sellingPrice === null || sellingPrice === '') {
        updateData.sellingPrice = null;
      } else {
        const parsed = parseFloat(sellingPrice);
        if (isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: 'Selling price must be a valid non-negative number.',
          });
        }
        updateData.sellingPrice = parsed;
      }
    }

    if (lowStockThreshold !== undefined) {
      if (lowStockThreshold === null || lowStockThreshold === '') {
        updateData.lowStockThreshold = null;
      } else {
        const parsed = parseInt(lowStockThreshold, 10);
        if (isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: 'Low stock threshold must be a valid non-negative integer.',
          });
        }
        updateData.lowStockThreshold = parsed;
      }
    }

    updateData.lastUpdatedBy = req.user.name || req.user.email;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        ...updatedProduct,
        costPrice: updatedProduct.costPrice !== null ? parseFloat(updatedProduct.costPrice) : null,
        sellingPrice: updatedProduct.sellingPrice !== null ? parseFloat(updatedProduct.sellingPrice) : null,
      },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product.',
      error: error.message,
    });
  }
}

/**
 * Adjust stock inline (+/- delta units)
 */
async function adjustStock(req, res) {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { delta, note } = req.body;

    const parsedDelta = parseInt(delta, 10);
    if (isNaN(parsedDelta) || parsedDelta === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delta must be a non-zero integer (e.g. +5 or -2).',
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    const newQuantity = product.quantity + parsedDelta;
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot decrease stock below 0. Current stock: ${product.quantity}, requested change: ${parsedDelta}.`,
      });
    }

    const updater = req.user.name || req.user.email;
    const noteInfo = note ? ` (${note.trim()})` : '';

    const updated = await prisma.product.update({
      where: { id },
      data: {
        quantity: newQuantity,
        lastUpdatedBy: `${updater}${noteInfo}`,
      },
    });

    return res.json({
      success: true,
      message: `Stock updated by ${parsedDelta > 0 ? '+' : ''}${parsedDelta} units. New quantity: ${newQuantity}.`,
      data: {
        ...updated,
        costPrice: updated.costPrice !== null ? parseFloat(updated.costPrice) : null,
        sellingPrice: updated.sellingPrice !== null ? parseFloat(updated.sellingPrice) : null,
      },
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust product stock.',
      error: error.message,
    });
  }
}

/**
 * Delete a product (scoped to organization)
 */
async function deleteProduct(req, res) {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: `Product "${product.name}" (SKU: ${product.sku}) was successfully deleted.`,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message,
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
};
