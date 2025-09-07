import { describe, it, expect } from 'vitest';
import { 
  coupleSchema, 
  weddingBasicsSchema, 
  budgetSchema, 
  ceremonyReceptionSchema, 
  vendorPreferencesSchema, 
  logisticsSchema, 
  reviewSubmitSchema,
  intakeSchema,
  validateStep,
  calculateBudgetRemaining,
  getPresetBudgetSplits
} from '../schemas/intake';
import {
  toProjectMeta,
  toBudgetPlan,
  toTimelineSeed,
  toVendorFilters,
  toSiteContentPrefs,
  toGuestPrefs,
  toEventDetails,
  isIntakeComplete,
  getIntakeCompletion
} from '../lib/mapping/prefillMappings';

describe('Intake Schema Validation', () => {
  describe('Step 1: Couple & Contacts', () => {
    it('should validate valid couple data', () => {
      const validData = {
        couple: {
          firstName: ['John', 'Jane'],
          lastName: ['Doe', 'Smith']
        },
        emails: ['john@example.com', 'jane@example.com'],
        phones: ['+1234567890', '+1234567891'],
        pronouns: 'they/them',
        preferredLanguage: 'en',
        communicationPreferences: 'email',
        decisionMakers: ['Partner A', 'Partner B']
      };

      const result = coupleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        couple: {
          firstName: ['John', 'Jane'],
          lastName: ['Doe', 'Smith']
        },
        emails: ['invalid-email', 'jane@example.com'],
        phones: ['+1234567890', '+1234567891'],
        pronouns: 'they/them',
        preferredLanguage: 'en',
        communicationPreferences: 'email',
        decisionMakers: []
      };

      const result = coupleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('emails');
      }
    });

    it('should reject invalid phone format', () => {
      const invalidData = {
        couple: {
          firstName: ['John', 'Jane'],
          lastName: ['Doe', 'Smith']
        },
        emails: ['john@example.com', 'jane@example.com'],
        phones: ['invalid-phone', '+1234567891'],
        pronouns: 'they/them',
        preferredLanguage: 'en',
        communicationPreferences: 'email',
        decisionMakers: []
      };

      const result = coupleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phones');
      }
    });
  });

  describe('Step 2: Wedding Basics', () => {
    it('should validate valid wedding basics data', () => {
      const validData = {
        workingTitle: 'John & Jane\'s Wedding',
        date: '2024-06-15',
        isDateFlexible: false,
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA'
        },
        venues: {
          ceremonyVenueName: 'Central Park',
          receptionVenueName: 'The Plaza',
          bothSameVenue: false
        },
        settings: {
          indoorOutdoor: ['outdoor', 'indoor'],
          accessibilityNeeds: 'Wheelchair accessible'
        },
        guests: {
          estimatedGuestCount: 150,
          adultsOnly: false,
          minorsCount: 10
        },
        vips: ['Grandma Smith', 'Uncle John'],
        style: {
          styleVibes: ['modern', 'classic'],
          colorPalette: ['navy', 'blush'],
          priorities: ['food', 'music', 'photos']
        }
      };

      const result = weddingBasicsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject future date requirement', () => {
      const invalidData = {
        workingTitle: 'John & Jane\'s Wedding',
        date: '2020-06-15', // Past date
        isDateFlexible: false,
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA'
        },
        venues: {
          ceremonyVenueName: 'Central Park',
          receptionVenueName: 'The Plaza',
          bothSameVenue: false
        },
        settings: {
          indoorOutdoor: ['outdoor'],
          accessibilityNeeds: ''
        },
        guests: {
          estimatedGuestCount: 150,
          adultsOnly: false,
          minorsCount: 0
        },
        vips: [],
        style: {
          styleVibes: ['modern'],
          colorPalette: [],
          priorities: ['food']
        }
      };

      const result = weddingBasicsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Step 3: Budget', () => {
    it('should validate valid budget data', () => {
      const validData = {
        totalBudget: 50000,
        currency: 'USD',
        presetSplit: 'classic',
        categories: [
          { name: 'venue', percent: 45 },
          { name: 'catering', percent: 30 },
          { name: 'photography', percent: 10 },
          { name: 'florals', percent: 8 },
          { name: 'music', percent: 7 }
        ],
        mustHaves: ['Live band', 'Professional photos'],
        niceToHaves: ['Photo booth', 'Late night snacks']
      };

      const result = budgetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject budget categories that don\'t sum to 100%', () => {
      const invalidData = {
        totalBudget: 50000,
        currency: 'USD',
        presetSplit: 'classic',
        categories: [
          { name: 'venue', percent: 45 },
          { name: 'catering', percent: 30 },
          { name: 'photography', percent: 10 }
          // Missing categories, only sums to 85%
        ],
        mustHaves: [],
        niceToHaves: []
      };

      const result = budgetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Step 4: Ceremony & Reception', () => {
    it('should validate valid ceremony data', () => {
      const validData = {
        ceremony: {
          type: 'civil',
          officiantNeeded: true,
          officiantNotes: 'Need secular officiant'
        },
        timeline: {
          preferences: 'Sunset ceremony',
          sunsetCeremony: true
        },
        dining: {
          mealStyle: 'plated',
          barPreference: 'open'
        },
        seating: {
          style: 'rounds',
          danceFloorRequired: true,
          stageRequired: false
        },
        specialMoments: ['first look', 'sparkler exit'],
        timing: {
          noiseOrdinanceTime: '22:00',
          venueCutoffTime: '23:00'
        }
      };

      const result = ceremonyReceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Step 5: Vendor Preferences', () => {
    it('should validate valid vendor preferences', () => {
      const validData = {
        requiredVendors: ['photographer', 'caterer', 'dj'],
        photographer: {
          style: 'documentary'
        },
        music: {
          bandOrDJ: 'dj',
          genres: ['pop', 'rock', 'jazz']
        },
        florals: {
          style: 'minimal'
        },
        catering: {
          notes: 'Vegetarian options needed',
          dietaryRestrictions: ['vegetarian', 'gluten-free'],
          cuisinePreferences: ['italian', 'mediterranean']
        },
        rentals: ['tables', 'chairs', 'linens'],
        budgetBands: {
          photographer: 'high',
          caterer: 'medium'
        },
        search: {
          radiusMiles: 50,
          preferredZip: '10001',
          availabilityWindow: {
            from: '2024-06-01',
            to: '2024-06-30'
          }
        },
        inspiration: ['https://pinterest.com/board1', 'https://instagram.com/account']
      };

      const result = vendorPreferencesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Step 6: Logistics', () => {
    it('should validate valid logistics data', () => {
      const validData = {
        travel: {
          majorityFromOutOfTown: true,
          hotelBlocksNeeded: 2,
          shuttleNeeded: true,
          ceremonyToReceptionTravelTime: 30,
          accessibilityNotes: 'Wheelchair accessible shuttle needed'
        },
        guests: {
          kidsPolicy: 'family-only',
          rsvpPreference: 'site'
        },
        website: {
          needed: true,
          copyTone: 'friendly',
          bilingualSite: false
        }
      };

      const result = logisticsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Step 7: Review & Submit', () => {
    it('should validate valid review data', () => {
      const validData = {
        consent: true,
        emailCopy: true
      };

      const result = reviewSubmitSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject without consent', () => {
      const invalidData = {
        consent: false,
        emailCopy: true
      };

      const result = reviewSubmitSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Complete Intake Schema', () => {
    it('should validate complete intake data', () => {
      const validData = {
        step1: {
          couple: {
            firstName: ['John', 'Jane'],
            lastName: ['Doe', 'Smith']
          },
          emails: ['john@example.com', 'jane@example.com'],
          phones: ['+1234567890', '+1234567891'],
          pronouns: 'they/them',
          preferredLanguage: 'en',
          communicationPreferences: 'email',
          decisionMakers: ['Partner A', 'Partner B']
        },
        step2: {
          workingTitle: 'John & Jane\'s Wedding',
          date: '2024-06-15',
          isDateFlexible: false,
          location: {
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          venues: {
            ceremonyVenueName: 'Central Park',
            receptionVenueName: 'The Plaza',
            bothSameVenue: false
          },
          settings: {
            indoorOutdoor: ['outdoor'],
            accessibilityNeeds: ''
          },
          guests: {
            estimatedGuestCount: 150,
            adultsOnly: false,
            minorsCount: 0
          },
          vips: [],
          style: {
            styleVibes: ['modern'],
            colorPalette: [],
            priorities: ['food']
          }
        },
        step3: {
          totalBudget: 50000,
          currency: 'USD',
          presetSplit: 'classic',
          categories: [
            { name: 'venue', percent: 45 },
            { name: 'catering', percent: 30 },
            { name: 'photography', percent: 10 },
            { name: 'florals', percent: 8 },
            { name: 'music', percent: 7 }
          ],
          mustHaves: [],
          niceToHaves: []
        },
        step4: {
          ceremony: {
            type: 'civil',
            officiantNeeded: false,
            officiantNotes: ''
          },
          timeline: {
            preferences: '',
            sunsetCeremony: false
          },
          dining: {
            mealStyle: 'plated',
            barPreference: 'open'
          },
          seating: {
            style: 'rounds',
            danceFloorRequired: true,
            stageRequired: false
          },
          specialMoments: [],
          timing: {
            noiseOrdinanceTime: '',
            venueCutoffTime: ''
          }
        },
        step5: {
          requiredVendors: [],
          photographer: {
            style: undefined
          },
          music: {
            bandOrDJ: undefined,
            genres: []
          },
          florals: {
            style: undefined
          },
          catering: {
            notes: '',
            dietaryRestrictions: [],
            cuisinePreferences: []
          },
          rentals: [],
          budgetBands: {},
          search: {
            radiusMiles: 50,
            preferredZip: '',
            availabilityWindow: undefined
          },
          inspiration: []
        },
        step6: {
          travel: {
            majorityFromOutOfTown: false,
            hotelBlocksNeeded: 0,
            shuttleNeeded: false,
            ceremonyToReceptionTravelTime: 0,
            accessibilityNotes: ''
          },
          guests: {
            kidsPolicy: 'all',
            rsvpPreference: 'site'
          },
          website: {
            needed: false,
            copyTone: 'friendly',
            bilingualSite: false
          }
        },
        step7: {
          consent: true,
          emailCopy: false
        }
      };

      const result = intakeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Validation Helpers', () => {
  it('should validate individual steps', () => {
    const step1Data = {
      couple: {
        firstName: ['John', 'Jane'],
        lastName: ['Doe', 'Smith']
      },
      emails: ['john@example.com', 'jane@example.com'],
      phones: ['+1234567890', '+1234567891'],
      pronouns: 'they/them',
      preferredLanguage: 'en',
      communicationPreferences: 'email',
      decisionMakers: []
    };

    const result = validateStep('step1', step1Data);
    expect(result.success).toBe(true);
  });

  it('should calculate budget remaining correctly', () => {
    const categories = [
      { name: 'venue' as const, percent: 45 },
      { name: 'catering' as const, percent: 30 },
      { name: 'photography' as const, percent: 10 },
      { name: 'florals' as const, percent: 8 },
      { name: 'music' as const, percent: 7 }
    ];

    const remaining = calculateBudgetRemaining(categories);
    expect(remaining).toBe(0);
  });

  it('should return preset budget splits', () => {
    const presets = getPresetBudgetSplits();
    expect(presets).toHaveProperty('classic');
    expect(presets).toHaveProperty('diy-heavy');
    expect(presets).toHaveProperty('luxury');
    expect(presets).toHaveProperty('minimalist');
  });
});

describe('Mapping Functions', () => {
  const mockIntakeData = {
    step1: {
      couple: {
        firstName: ['John', 'Jane'],
        lastName: ['Doe', 'Smith']
      },
      emails: ['john@example.com', 'jane@example.com'],
      phones: ['+1234567890', '+1234567891'],
      pronouns: 'they/them',
      preferredLanguage: 'en',
      communicationPreferences: 'email',
      decisionMakers: ['Partner A', 'Partner B']
    },
    step2: {
      workingTitle: 'John & Jane\'s Wedding',
      date: '2024-06-15',
      isDateFlexible: false,
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      venues: {
        ceremonyVenueName: 'Central Park',
        receptionVenueName: 'The Plaza',
        bothSameVenue: false
      },
      settings: {
        indoorOutdoor: ['outdoor'],
        accessibilityNeeds: ''
      },
      guests: {
        estimatedGuestCount: 150,
        adultsOnly: false,
        minorsCount: 0
      },
      vips: [],
      style: {
        styleVibes: ['modern', 'classic'],
        colorPalette: ['navy', 'blush'],
        priorities: ['food', 'music', 'photos']
      }
    },
    step3: {
      totalBudget: 50000,
      currency: 'USD',
      presetSplit: 'classic',
      categories: [
        { name: 'venue', percent: 45 },
        { name: 'catering', percent: 30 },
        { name: 'photography', percent: 10 },
        { name: 'florals', percent: 8 },
        { name: 'music', percent: 7 }
      ],
      mustHaves: ['Live band'],
      niceToHaves: ['Photo booth']
    },
    step4: {
      ceremony: {
        type: 'civil',
        officiantNeeded: false,
        officiantNotes: ''
      },
      timeline: {
        preferences: '',
        sunsetCeremony: false
      },
      dining: {
        mealStyle: 'plated',
        barPreference: 'open'
      },
      seating: {
        style: 'rounds',
        danceFloorRequired: true,
        stageRequired: false
      },
      specialMoments: ['first look'],
      timing: {
        noiseOrdinanceTime: '',
        venueCutoffTime: ''
      }
    },
    step5: {
      requiredVendors: ['photographer', 'caterer'],
      photographer: {
        style: 'documentary'
      },
      music: {
        bandOrDJ: 'dj',
        genres: ['pop', 'rock']
      },
      florals: {
        style: 'minimal'
      },
      catering: {
        notes: '',
        dietaryRestrictions: [],
        cuisinePreferences: []
      },
      rentals: ['tables', 'chairs'],
      budgetBands: {},
      search: {
        radiusMiles: 50,
        preferredZip: '10001',
        availabilityWindow: undefined
      },
      inspiration: []
    },
    step6: {
      travel: {
        majorityFromOutOfTown: false,
        hotelBlocksNeeded: 0,
        shuttleNeeded: false,
        ceremonyToReceptionTravelTime: 0,
        accessibilityNotes: ''
      },
      guests: {
        kidsPolicy: 'all',
        rsvpPreference: 'site'
      },
      website: {
        needed: false,
        copyTone: 'friendly',
        bilingualSite: false
      }
    },
    step7: {
      consent: true,
      emailCopy: false
    }
  };

  describe('toProjectMeta', () => {
    it('should map intake data to project metadata', () => {
      const result = toProjectMeta(mockIntakeData);
      
      expect(result).toMatchObject({
        title: 'John & Jane\'s Wedding',
        date: '2024-06-15',
        city: 'New York',
        country: 'USA',
        guestCount: 150,
        styleVibes: ['modern', 'classic'],
        colorPalette: ['navy', 'blush'],
        priorities: ['food', 'music', 'photos']
      });
    });
  });

  describe('toBudgetPlan', () => {
    it('should map intake data to budget plan', () => {
      const result = toBudgetPlan(mockIntakeData);
      
      expect(result).toMatchObject({
        currency: 'USD',
        total: 50000,
        categories: expect.arrayContaining([
          expect.objectContaining({ name: 'venue', percent: 45 }),
          expect.objectContaining({ name: 'catering', percent: 30 })
        ])
      });
    });
  });

  describe('toTimelineSeed', () => {
    it('should generate timeline tasks', () => {
      const result = toTimelineSeed(mockIntakeData);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('dueDate');
    });
  });

  describe('toVendorFilters', () => {
    it('should map intake data to vendor filters', () => {
      const result = toVendorFilters(mockIntakeData);
      
      expect(result).toMatchObject({
        radiusMiles: 50,
        location: '10001',
        requiredVendors: ['photographer', 'caterer']
      });
    });
  });

  describe('toSiteContentPrefs', () => {
    it('should map intake data to site content preferences', () => {
      const result = toSiteContentPrefs(mockIntakeData);
      
      expect(result).toMatchObject({
        tone: 'friendly',
        bilingual: false,
        rsvpPreference: 'site'
      });
    });
  });

  describe('toGuestPrefs', () => {
    it('should map intake data to guest preferences', () => {
      const result = toGuestPrefs(mockIntakeData);
      
      expect(result).toMatchObject({
        estimatedCount: 150,
        adultsOnly: false,
        kidsPolicy: 'all',
        rsvpPreference: 'site'
      });
    });
  });

  describe('toEventDetails', () => {
    it('should map intake data to event details', () => {
      const result = toEventDetails(mockIntakeData);
      
      expect(result).toMatchObject({
        ceremonyType: 'civil',
        mealStyle: 'plated',
        barPreference: 'open',
        seatingStyle: 'rounds'
      });
    });
  });

  describe('isIntakeComplete', () => {
    it('should return true for complete intake data', () => {
      const result = isIntakeComplete(mockIntakeData);
      expect(result).toBe(true);
    });

    it('should return false for incomplete intake data', () => {
      const incompleteData = { ...mockIntakeData };
      delete incompleteData.step1;
      
      const result = isIntakeComplete(incompleteData);
      expect(result).toBe(false);
    });
  });

  describe('getIntakeCompletion', () => {
    it('should calculate completion percentage', () => {
      const result = getIntakeCompletion(mockIntakeData);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
}); 