import { Request, Response } from 'express';
import * as cropService from '../services/cropService.js';
import * as cropPlanService from '../services/cropPlanService.js';

type AuthRequest = Request & { user: { id: string } };

export const createCrop = async (req: AuthRequest, res: Response) => {
    try {
        const { name, region, area, plantingDate, harvestDate, notes } = req.body;

        // Validate suitability
        const suitability = await cropService.validateCropSuitability(name, region, parseFloat(area));

        // Create crop regardless, but include suitability info
        const cropData = {
            crop_type: name,
            location: region,
            area: parseFloat(area),
            planting_date: plantingDate,
            expected_harvest: harvestDate,
            notes,
            suitability_score: suitability.score,
            suitability_reasons: suitability.reasons,
            area_warning: suitability.areaWarning
        };

        const crop = await cropService.createCrop(req.user.id, cropData);
        
        // Generate crop plan automatically
        let plan = null;
        try {
            plan = await cropPlanService.generateCropPlan(crop.id);
        } catch (planError) {
            console.warn('Failed to generate crop plan:', planError);
            // Don't fail the whole request if plan generation fails
        }
        
        res.status(201).json({
            success: true,
            data: crop,
            plan: plan,
            suitability: {
                isSuitable: suitability.isSuitable,
                score: suitability.score,
                reasons: suitability.reasons,
                areaWarning: suitability.areaWarning,
                maxArea: suitability.maxArea
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const getCrops = async (req: AuthRequest, res: Response) => {
    try {
        const crops = await cropService.getCrops(req.user.id);
        const normalizedCrops = crops.map((crop: any) => ({
            ...crop,
            name: crop.crop_type,
            region: crop.location,
            harvest_date: crop.expected_harvest,
        }));
        res.json({ success: true, data: normalizedCrops });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const getCrop = async (req: Request, res: Response) => {
    try {
        const crop = await cropService.getCrop(req.params.id);
        res.json({
            success: true,
            data: {
                ...crop,
                name: crop.crop_type,
                region: crop.location,
                harvest_date: crop.expected_harvest,
            },
        });
    } catch (error) {
        res.status(404).json({ success: false, error: (error as Error).message });
    }
};

export const updateCrop = async (req: Request, res: Response) => {
    try {
        const crop = await cropService.updateCrop(req.params.id, req.body);
        res.json({ success: true, data: crop });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const deleteCrop = async (req: Request, res: Response) => {
    try {
        await cropService.deleteCrop(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};
