export const eventIntakeConfigs = {
  wedding: [
    { id: 'weddingDate', label: 'Wedding Date', type: 'date', required: true },
    { id: 'partnerName', label: 'Partner\'s Name', type: 'text' },
    { id: 'guestCount', label: 'Estimated Guest Count', type: 'number' },
    { id: 'venueType', label: 'Venue Type', type: 'select', options: ['Indoor', 'Outdoor', 'Destination', 'Undecided'] },
    { id: 'budget', label: 'Estimated Budget', type: 'number' },
    { id: 'vision', label: 'Describe Your Wedding Vision', type: 'textarea' },
    { id: 'city', label: 'Event Location (City or Venue)', type: 'text' }
  ],

  birthday: [
    { id: 'birthdayDate', label: 'Date of the Party', type: 'date' },
    { id: 'name', label: 'Name of the Person Celebrating', type: 'text' },
    { id: 'age', label: 'Age Turning', type: 'number' },
    { id: 'theme', label: 'Theme or Style', type: 'text' },
    { id: 'guestCount', label: 'Estimated Guest Count', type: 'number' },
    { id: 'activities', label: 'Planned Activities or Entertainment', type: 'textarea' }
  ],

  baby_shower: [
    { id: 'babyShowerDate', label: 'Baby Shower Date', type: 'date' },
    { id: 'parentName', label: 'Expecting Parent\'s Name', type: 'text' },
    { id: 'dueDate', label: 'Baby\'s Due Date', type: 'date' },
    { id: 'gender', label: 'Baby\'s Gender', type: 'select', options: ['Boy', 'Girl', 'Surprise', 'Unknown'] },
    { id: 'guestCount', label: 'Estimated Guest Count', type: 'number' },
    { id: 'theme', label: 'Shower Theme', type: 'text' },
    { id: 'activities', label: 'Planned Games and Activities', type: 'textarea' }
  ],

  reunion: [
    { id: 'reunionDate', label: 'Reunion Date', type: 'date' },
    { id: 'reunionType', label: 'Type of Reunion', type: 'select', options: ['Family', 'High School', 'College', 'Military', 'Work', 'Friends'] },
    { id: 'groupName', label: 'Group/Organization Name', type: 'text' },
    { id: 'guestCount', label: 'Expected Attendees', type: 'number' },
    { id: 'yearsApart', label: 'Years Since Last Gathering', type: 'number' },
    { id: 'activities', label: 'Planned Activities', type: 'textarea' },
    { id: 'specialNotes', label: 'Special Memories or Notes', type: 'textarea' }
  ],

  dinner_party: [
    { id: 'dinnerDate', label: 'Dinner Party Date', type: 'date' },
    { id: 'guestCount', label: 'Number of Guests', type: 'number' },
    { id: 'seatingStyle', label: 'Seating Style', type: 'select', options: ['Formal Seated', 'Buffet Style', 'Family Style', 'Cocktail Style'] },
    { id: 'cuisine', label: 'Cuisine Type', type: 'text' },
    { id: 'occasion', label: 'Occasion or Theme', type: 'text' },
    { id: 'dietaryRestrictions', label: 'Dietary Restrictions', type: 'textarea' },
    { id: 'specialNotes', label: 'Any Special Notes or Requests', type: 'textarea' }
  ],

  corporate: [
    { id: 'eventDate', label: 'Event Date', type: 'date' },
    { id: 'company', label: 'Company/Organization Name', type: 'text' },
    { id: 'eventType', label: 'Type of Corporate Event', type: 'select', options: ['Conference', 'Team Building', 'Product Launch', 'Holiday Party', 'Training', 'Networking'] },
    { id: 'attendeeCount', label: 'Expected Attendees', type: 'number' },
    { id: 'budget', label: 'Event Budget', type: 'number' },
    { id: 'objectives', label: 'Event Objectives', type: 'textarea' },
    { id: 'specialRequirements', label: 'Special Requirements or Notes', type: 'textarea' }
  ]
};