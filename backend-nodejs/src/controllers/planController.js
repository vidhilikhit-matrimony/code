const Plan = require('../models/Plan');

/**
 * Get all active plans (Public)
 * GET /api/plans/active
 */
const getActivePlans = async (req, res, next) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ amount: 1 });
        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all plans (Admin)
 * GET /api/admin/plans
 */
const getAllPlans = async (req, res, next) => {
    try {
        const plans = await Plan.find().sort({ amount: 1 });
        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new plan (Admin)
 * POST /api/admin/plans
 */
const createPlan = async (req, res, next) => {
    try {
        const { name, amount, views, color, popular } = req.body;
        const newPlan = new Plan({ name, amount, views, color, popular });
        await newPlan.save();

        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            data: newPlan
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a plan (Admin)
 * PUT /api/admin/plans/:id
 */
const updatePlan = async (req, res, next) => {
    try {
        const { name, amount, views, color, popular, isActive } = req.body;
        const updated = await Plan.findByIdAndUpdate(
            req.params.id,
            { name, amount, views, color, popular, isActive },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Plan updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivePlans,
    getAllPlans,
    createPlan,
    updatePlan
};
