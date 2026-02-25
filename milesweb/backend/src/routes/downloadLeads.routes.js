import { Router } from 'express';
import { downloadLeadsController } from '../controllers/downloadLeads.controller.js';

const router = Router();

router.post('/', downloadLeadsController.create.bind(downloadLeadsController));

export default router;
