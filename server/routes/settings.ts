import { Router } from 'express';
import { getAllSettings, updateSetting, updateMultipleSettings } from '../repositories/settings.js';

export const settingsRouter = Router();

settingsRouter.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings from Google Sheets:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

settingsRouter.put('/', async (req, res) => {
  try {
    const { key, value, settings, updatedBy } = req.body;

    if (settings && typeof settings === 'object') {
      const results = await updateMultipleSettings(settings, updatedBy || 'admin');
      return res.json({ success: true, data: results });
    }

    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const result = await updateSetting(key, value, updatedBy || 'admin');
    res.json({ success: true, setting: result });
  } catch (error: any) {
    console.error('Error saving settings to Google Sheets:', error);
    res.status(500).json({ error: error.message || 'Failed to update setting' });
  }
});

settingsRouter.post('/', async (req, res) => {
  try {
    const { key, value, settings, updatedBy } = req.body;

    if (settings && typeof settings === 'object') {
      const results = await updateMultipleSettings(settings, updatedBy || 'admin');
      return res.json({ success: true, data: results });
    }

    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const result = await updateSetting(key, value, updatedBy || 'admin');
    res.json({ success: true, setting: result });
  } catch (error: any) {
    console.error('Error saving settings to Google Sheets:', error);
    res.status(500).json({ error: error.message || 'Failed to update setting' });
  }
});

export default settingsRouter;
