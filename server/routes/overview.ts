import express from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { RequestWithUser } from '../types/express';

const router = express.Router();

// Get overview data for the current user's project
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    
    // Get the user's project
    const projects = await storage.getProjectsByUserId(userId);
    if (!projects || projects.length === 0) {
      return res.status(404).json({ error: 'No project found for user' });
    }
    
    const projectId = projects[0].id;
    
    // Get or create overview data
    let overview = await storage.getWeddingOverviewByProjectId(projectId);
    
    if (!overview) {
      // Create default overview data
      overview = await storage.createWeddingOverview({
        projectId,
        weddingDate: '',
        ceremonyLocation: '',
        cocktailHourLocation: '',
        receptionLocation: '',
        brideParty: [],
        groomParty: [],
        engagementParty: '',
        dressShoppingDate: '',
        saveTheDateSent: '',
        dressFitting: '',
        bridalShower: '',
        sendWeddingInvites: '',
        bachelorBacheloretteParty: '',
        rsvpDue: '',
        rehearsalDinner: '',
        honeymoonStart: '',
        honeymoonEnd: '',
        customImportantDates: [],
        customGettingStartedQuestions: [],
        customWeddingPartyQuestions: [],
        customMiscellaneousQuestions: [],
        customCeremonyQuestions: [],
        customCocktailHourQuestions: [],
        customReceptionQuestions: [],
        customMinorDetailsQuestions: [],
        areYouPlanningTogether: '',
        doYouWantOutdoorCeremony: '',
        willYouHaveBridalParty: '',
        howManyBridalParty: '',
        howWillYouAskBridalParty: '',
        bridalPartyResponsibilities: '',
        bridalPartyAttire: '',
        bridalPartyHairMakeup: '',
        bridalPartyWalkingOrder: '',
        willYouNeedHotelBlock: '',
        willYouProvideTransportation: '',
        willYouHaveDressCode: '',
        whoWillHandOutTips: '',
        doYouWantUnplugged: '',
        doYouWantAisleRunner: '',
        willYouHaveFlowerGirls: '',
        willYouHaveRingBearer: '',
        whatTypeOfOfficiant: '',
        willYouWriteVows: '',
        willYouUseUnityCandle: '',
        willYouDoSandCeremony: '',
        whoWillWalkBrideDown: '',
        whatWillCeremonyMusic: '',
        whoWillPlayMusic: '',
        willYouHaveReceivingLine: '',
        whereWillYouTakePictures: '',
        willYouDoFirstLook: '',
        whatKindOfCeremonyDecor: '',
        whoWillSetupTakedown: '',
        whereWillCocktailHour: '',
        whatCocktailEntertainment: '',
        willYouServingFood: '',
        willYouHaveSignatureBar: '',
        willYouHaveSpecialtyDrinks: '',
        willYouBeMingling: '',
        whatKindOfDecorCocktail: '',
        whereWillReception: '',
        willYouDoReceivingLineReception: '',
        howLongReception: ''
      });
    }
    
    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// Update overview data
router.patch('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    
    // Get the user's project
    const projects = await storage.getProjectsByUserId(userId);
    if (!projects || projects.length === 0) {
      return res.status(404).json({ error: 'No project found for user' });
    }
    
    const projectId = projects[0].id;
    
    // Update the overview
    const updatedOverview = await storage.updateWeddingOverview(projectId, updates);
    
    if (!updatedOverview) {
      return res.status(404).json({ error: 'Overview not found' });
    }
    
    res.json(updatedOverview);
  } catch (error) {
    console.error('Error updating overview:', error);
    res.status(500).json({ error: 'Failed to update overview data' });
  }
});

export default router; 