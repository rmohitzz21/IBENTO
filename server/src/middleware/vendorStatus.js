import Vendor from '../models/Vendor.js'

/**
 * Middleware: requires the authenticated user to have an approved vendor account.
 * Attaches `req.vendor` for downstream handlers to use.
 *
 * Use on routes where a non-approved vendor must be blocked from taking action
 * (e.g., accepting leads, managing services, posting to calendar).
 */
export const requireApprovedVendor = async (req, res, next) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })

  if (!vendor) {
    return res.status(403).json({
      success: false,
      message: 'No vendor profile found. Please apply first.',
      code: 'VENDOR_NOT_FOUND',
    })
  }

  if (vendor.status !== 'approved') {
    const messages = {
      pending: 'Your vendor application is under review. You will be notified once approved.',
      rejected: 'Your vendor application was rejected. Please contact support.',
      suspended: 'Your vendor account has been suspended. Please contact support at support@ibento.in.',
    }
    return res.status(403).json({
      success: false,
      message: messages[vendor.status] || 'Vendor account is not approved.',
      code: `VENDOR_${vendor.status.toUpperCase()}`,
      status: vendor.status,
    })
  }

  req.vendor = vendor
  next()
}
