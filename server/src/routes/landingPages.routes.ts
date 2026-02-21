import { Router } from 'express';
import { landingPagesController } from '../controllers/landingPages.controller';

const router = Router();

router.post('/generate', landingPagesController.generate.bind(landingPagesController));
router.get('/:id', landingPagesController.getById.bind(landingPagesController));
router.get('/preview/:publicUrl', landingPagesController.getByPublicUrl.bind(landingPagesController));
router.post('/:id/sections/:sectionType/regenerate', landingPagesController.regenerateSection.bind(landingPagesController));

export default router;
