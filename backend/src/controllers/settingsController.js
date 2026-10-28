const prisma = require('../config/db');

/**
 * Get current organization settings
 */
async function getSettings(req, res) {
  try {
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    return res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings.',
      error: error.message,
    });
  }
}

/**
 * Update organization settings (e.g. defaultLowStockThreshold, organization name)
 */
async function updateSettings(req, res) {
  try {
    const { organizationId } = req.user;
    const { defaultLowStockThreshold, name } = req.body;

    const updateData = {};

    if (defaultLowStockThreshold !== undefined) {
      const parsed = parseInt(defaultLowStockThreshold, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          message: 'Default low stock threshold must be a non-negative integer.',
        });
      }
      updateData.defaultLowStockThreshold = parsed;
    }

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Organization name must be at least 2 characters.',
        });
      }
      updateData.name = name.trim();
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        defaultLowStockThreshold: updatedOrg.defaultLowStockThreshold,
        updatedAt: updatedOrg.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings.',
      error: error.message,
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
