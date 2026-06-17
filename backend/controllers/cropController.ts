import { Request, Response } from 'express';
import * as cropService from '../services/cropService.js';
import * as cropPlanService from '../services/cropPlanService.js';
import { safeRecordAuditLog } from '../services/auditService.js';

type AuthRequest = Request & {
    user: {
        id: string;
        email?: string;
        full_name?: string;
        role?: string;
    };
};

export const createCrop = async (req: AuthRequest, res: Response) => {
    try {
        const { cropName, region, area, plantingDate, harvestDate, notes } = req.body;
        const numericArea = parseFloat(area);
        const avgDurationDays =
            plantingDate && harvestDate
                ? Math.max(
                      0,
                      Math.ceil(
                          (new Date(harvestDate).getTime() - new Date(plantingDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                      ),
                  )
                : null;
        const cropType = await cropService.getOrCreateCropType(cropName, avgDurationDays);

        // Validate suitability
        const suitability = await cropService.validateCropSuitability(cropType.name, region, numericArea);

        // Create crop regardless, but include suitability info
        const cropData: Record<string, unknown> = {
            name: cropType.name,
            location: region,
            area: numericArea,
            planting_date: plantingDate,
            expected_harvest: harvestDate,
            notes,
            suitability_score: suitability.score,
            suitability_reasons: suitability.reasons,
            area_warning: suitability.areaWarning
        };

        if (cropType.id) {
            cropData.crop_type_id = cropType.id;
        }

        const crop = await cropService.createCrop(req.user.id, cropData);
        await safeRecordAuditLog({
            actor: req.user,
            entityType: 'crop',
            entityId: crop.id,
            entityLabel: crop.name || cropType.name,
            action: 'create',
            description: `Created crop ${crop.name || cropType.name}`,
            details: {
                location: crop.location || region,
                area: crop.area ?? numericArea,
                status: crop.status || 'planted',
            },
        });
        
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
            data: {
                ...crop,
                name: crop.name || cropType.name,
                region: crop.location,
                harvest_date: crop.expected_harvest,
            },
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
            name: crop.name || crop.crop_type || 'Unknown crop',
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
                name: crop.name || crop.crop_type || 'Unknown crop',
                region: crop.location,
                harvest_date: crop.expected_harvest,
            },
        });
    } catch (error) {
        res.status(404).json({ success: false, error: (error as Error).message });
    }
};

export const getCropTypes = async (_req: Request, res: Response) => {
    try {
        const cropTypes = await cropService.getCropTypes();
        res.json({ success: true, data: cropTypes });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const updateCrop = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const previousCrop = await cropService.getCrop(req.params.id);
        const crop = await cropService.updateCrop(req.params.id, req.body);
        await safeRecordAuditLog({
            actor: authReq.user,
            entityType: 'crop',
            entityId: crop.id,
            entityLabel: crop.name || crop.crop_type || previousCrop?.name || 'Unknown crop',
            action: 'update',
            description: `Updated crop ${crop.name || crop.crop_type || previousCrop?.name || 'Unknown crop'}`,
            details: {
                before: {
                    name: previousCrop?.name,
                    status: previousCrop?.status,
                    location: previousCrop?.location,
                },
                after: {
                    name: crop.name,
                    status: crop.status,
                    location: crop.location,
                },
                changes: req.body,
            },
        });
        res.json({ success: true, data: crop });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const deleteCrop = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const crop = await cropService.getCrop(req.params.id);
        await cropService.deleteCrop(req.params.id);
        await safeRecordAuditLog({
            actor: authReq.user,
            entityType: 'crop',
            entityId: crop.id,
            entityLabel: crop.name || crop.crop_type || 'Unknown crop',
            action: 'delete',
            description: `Deleted crop ${crop.name || crop.crop_type || 'Unknown crop'}`,
            details: {
                status: crop.status,
                location: crop.location,
                area: crop.area,
            },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};
