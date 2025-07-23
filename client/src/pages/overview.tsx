import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Heart, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OverviewData {
  id: number;
  projectId: number;
  weddingDate: string;
  ceremonyLocation: string;
  cocktailHourLocation: string;
  receptionLocation: string;
  
  // Wedding Party
  brideParty: string[];
  groomParty: string[];
  
  // Important Dates
  engagementParty: string;
  dressShoppingDate: string;
  saveTheDateSent: string;
  dressFitting: string;
  bridalShower: string;
  sendWeddingInvites: string;
  bachelorBacheloretteParty: string;
  rsvpDue: string;
  rehearsalDinner: string;
  honeymoonStart: string;
  honeymoonEnd: string;
  
  // Custom Important Dates
  customImportantDates: Array<{id: string, label: string, date: string}>;
  
  // Getting Started Questions
  areYouPlanningTogether: string;
  doYouWantOutdoorCeremony: string;
  
  // Ceremony Questions
  doYouWantUnplugged: string;
  doYouWantAisleRunner: string;
  willYouHaveFlowerGirls: string;
  willYouHaveRingBearer: string;
  whatTypeOfOfficiant: string;
  willYouWriteVows: string;
  willYouUseUnityCandle: string;
  willYouDoSandCeremony: string;
  whoWillWalkBrideDown: string;
  whatWillCeremonyMusic: string;
  whoWillPlayMusic: string;
  willYouHaveReceivingLine: string;
  whereWillYouTakePictures: string;
  willYouDoFirstLook: string;
  whatKindOfCeremonyDecor: string;
  whoWillSetupTakedown: string;
  
  // Cocktail Hour Questions
  whereWillCocktailHour: string;
  whatCocktailEntertainment: string;
  willYouServingFood: string;
  willYouHaveSignatureBar: string;
  willYouHaveSpecialtyDrinks: string;
  willYouBeMingling: string;
  whatKindOfDecorCocktail: string;
  
  // Reception Questions
  whereWillReception: string;
  willYouDoReceivingLineReception: string;
  howLongReception: string;
  whatKindOfMeal: string;
  willYouHaveToasts: string;
  willYouHaveGuestbook: string;
  willYouHaveWeddingFavor: string;
  willYouServeCake: string;
  willYouCutCake: string;
  
  // Minor Details
  brideWalkingWith: string;
  groomWalkingWith: string;
  weddingPartyTransport: string;
  ringsToVenue: string;
  dressToVenue: string;
  belongingsTransport: string;
  getawayCar: string;
  decorTakeHome: string;
  giftsFromVenue: string;
  floralsDisposal: string;
  bouquetPreservation: string;
  finalVenueSweep: string;
  leftoverFood: string;
  lateNightSnack: string;
}

export default function OverviewPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editArrayValue, setEditArrayValue] = useState<string[]>([]);
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDateLabel, setNewDateLabel] = useState('');
  const [newDateValue, setNewDateValue] = useState('');

  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['/api/overview'],
    queryFn: () => apiRequest('/api/overview'),
  });

  const updateOverviewMutation = useMutation({
    mutationFn: (data: Partial<OverviewData>) => 
      apiRequest('/api/overview', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/overview'] });
      toast({ title: 'Overview updated successfully!' });
      setEditingField(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update overview',
        variant: 'destructive'
      });
    }
  });

  const startEdit = (field: string, value: string | string[]) => {
    setEditingField(field);
    if (Array.isArray(value)) {
      setEditArrayValue(value);
    } else {
      setEditValue(value || '');
    }
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const updateData = {
      [editingField]: editingField.includes('Party') ? editArrayValue : editValue
    };
    
    updateOverviewMutation.mutate(updateData);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setEditArrayValue([]);
  };

  const addArrayItem = () => {
    setEditArrayValue([...editArrayValue, '']);
  };

  const updateArrayItem = (index: number, value: string) => {
    const newArray = [...editArrayValue];
    newArray[index] = value;
    setEditArrayValue(newArray);
  };

  const removeArrayItem = (index: number) => {
    setEditArrayValue(editArrayValue.filter((_, i) => i !== index));
  };

  const addCustomDate = () => {
    if (!newDateLabel.trim() || !newDateValue) return;
    
    const customDates = overviewData?.customImportantDates || [];
    const newDate = {
      id: Date.now().toString(),
      label: newDateLabel.trim(),
      date: newDateValue
    };
    
    updateOverviewMutation.mutate({
      customImportantDates: [...customDates, newDate]
    });
    
    setIsAddingDate(false);
    setNewDateLabel('');
    setNewDateValue('');
  };

  const deleteCustomDate = (dateId: string) => {
    const customDates = overviewData?.customImportantDates || [];
    const updatedDates = customDates.filter((date: {id: string, label: string, date: string}) => date.id !== dateId);
    
    updateOverviewMutation.mutate({
      customImportantDates: updatedDates
    });
  };

  const deleteImportantDate = (field: keyof OverviewData) => {
    updateOverviewMutation.mutate({
      [field]: null
    });
  };

  const renderEditableField = (
    label: string, 
    field: keyof OverviewData, 
    value: string | string[], 
    type: 'text' | 'date' | 'array' | 'textarea' = 'text',
    showDelete: boolean = false
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600 w-1/3">{label}:</span>
        
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            {type === 'array' ? (
              <div className="flex-1">
                {editArrayValue.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem(index, e.target.value)}
                      className="flex-1"
                      placeholder="Enter name..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addArrayItem}
                  className="mb-2"
                >
                  Add Person
                </Button>
              </div>
            ) : type === 'textarea' ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1"
                rows={2}
              />
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1"
              />
            )}
            <Button size="sm" onClick={saveEdit} className="bg-green-600 text-white">
              <Save className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-gray-800">
              {Array.isArray(value) ? value.join(', ') || 'Not set' : value || 'Not set'}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEdit(field, value)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              {showDelete && value && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteImportantDate(field)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-600" />
          <h1 className="text-2xl font-semibold text-gray-800">Wedding Overview</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-rose-600" />
        <h1 className="text-2xl font-semibold text-gray-800">Wedding Overview</h1>
      </div>

      <div className="space-y-6">
        {/* Basic Wedding Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-rose-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Wedding Date', 'weddingDate', overviewData?.weddingDate || '', 'date')}
            {renderEditableField('Ceremony Location', 'ceremonyLocation', overviewData?.ceremonyLocation || '')}
            {renderEditableField('Cocktail Hour Location', 'cocktailHourLocation', overviewData?.cocktailHourLocation || '')}
            {renderEditableField('Reception Location', 'receptionLocation', overviewData?.receptionLocation || '')}
          </CardContent>
        </Card>

        {/* Wedding Party */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                  Bridesmaids
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableField('Bride\'s Party', 'brideParty', overviewData?.brideParty || [], 'array')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Groomsmen
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableField('Groom\'s Party', 'groomParty', overviewData?.groomParty || [], 'array')}
            </CardContent>
          </Card>
        </div>

        {/* Important Dates */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Important Dates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Engagement Party', 'engagementParty', overviewData?.engagementParty || '', 'date', true)}
            {renderEditableField('Dress Shopping', 'dressShoppingDate', overviewData?.dressShoppingDate || '', 'date', true)}
            {renderEditableField('Send Save the Dates', 'saveTheDateSent', overviewData?.saveTheDateSent || '', 'date', true)}
            {renderEditableField('Dress Fitting', 'dressFitting', overviewData?.dressFitting || '', 'date', true)}
            {renderEditableField('Bridal Shower', 'bridalShower', overviewData?.bridalShower || '', 'date', true)}
            {renderEditableField('Send Wedding Invites', 'sendWeddingInvites', overviewData?.sendWeddingInvites || '', 'date', true)}
            {renderEditableField('Bachelor/Bachelorette Party', 'bachelorBacheloretteParty', overviewData?.bachelorBacheloretteParty || '', 'date', true)}
            {renderEditableField('RSVP Due', 'rsvpDue', overviewData?.rsvpDue || '', 'date', true)}
            {renderEditableField('Rehearsal Dinner', 'rehearsalDinner', overviewData?.rehearsalDinner || '', 'date', true)}
            {renderEditableField('Honeymoon Start', 'honeymoonStart', overviewData?.honeymoonStart || '', 'date', true)}
            {renderEditableField('Honeymoon End', 'honeymoonEnd', overviewData?.honeymoonEnd || '', 'date', true)}
            
            {/* Custom Important Dates */}
            {overviewData?.customImportantDates?.map((customDate: {id: string, label: string, date: string}) => (
              <div key={customDate.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600 w-1/3">{customDate.label}:</span>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-800">{customDate.date || 'Not set'}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCustomDate(customDate.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Add Custom Date */}
            {isAddingDate ? (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <Input
                  placeholder="Date name (e.g., Venue Visit)"
                  value={newDateLabel}
                  onChange={(e) => setNewDateLabel(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newDateValue}
                  onChange={(e) => setNewDateValue(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={addCustomDate} className="bg-green-600 text-white">
                  <Save className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingDate(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingDate(true)}
                className="w-full mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Date
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Getting Started Questions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-rose-600">Getting Started</CardTitle>
            <p className="text-sm text-gray-500">Things to consider as you begin planning.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Are you planning to have your wedding during "busy season" (May-October)?', 'areYouPlanningTogether', overviewData?.areYouPlanningTogether || '')}
            {renderEditableField('Do you want an outdoor ceremony?', 'doYouWantOutdoorCeremony', overviewData?.doYouWantOutdoorCeremony || '')}
          </CardContent>
        </Card>

        {/* Ceremony Questions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-600">Ceremony</CardTitle>
            <p className="text-sm text-gray-500">Detailed ceremony planning considerations.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Do you want an unplugged ceremony?', 'doYouWantUnplugged', overviewData?.doYouWantUnplugged || '')}
            {renderEditableField('Do you want to have an aisle runner?', 'doYouWantAisleRunner', overviewData?.doYouWantAisleRunner || '')}
            {renderEditableField('Will you have flower girls and ring bearers?', 'willYouHaveFlowerGirls', overviewData?.willYouHaveFlowerGirls || '')}
            {renderEditableField('Will you have a ring bearer?', 'willYouHaveRingBearer', overviewData?.willYouHaveRingBearer || '')}
            {renderEditableField('What type of officiant do you want?', 'whatTypeOfOfficiant', overviewData?.whatTypeOfOfficiant || '')}
            {renderEditableField('Will you write your own vows?', 'willYouWriteVows', overviewData?.willYouWriteVows || '')}
            {renderEditableField('Will you use a unity candle during your ceremony?', 'willYouUseUnityCandle', overviewData?.willYouUseUnityCandle || '')}
            {renderEditableField('Will you do a sand ceremony?', 'willYouDoSandCeremony', overviewData?.willYouDoSandCeremony || '')}
            {renderEditableField('Who will walk the bride down the aisle?', 'whoWillWalkBrideDown', overviewData?.whoWillWalkBrideDown || '')}
            {renderEditableField('What will your ceremony music be?', 'whatWillCeremonyMusic', overviewData?.whatWillCeremonyMusic || '', 'textarea')}
            {renderEditableField('Who will play the music?', 'whoWillPlayMusic', overviewData?.whoWillPlayMusic || '')}
            {renderEditableField('Will you have a receiving line after your ceremony?', 'willYouHaveReceivingLine', overviewData?.willYouHaveReceivingLine || '')}
            {renderEditableField('Where will you take pictures after ceremony?', 'whereWillYouTakePictures', overviewData?.whereWillYouTakePictures || '', 'textarea')}
            {renderEditableField('Will you do a first look?', 'willYouDoFirstLook', overviewData?.willYouDoFirstLook || '')}
            {renderEditableField('What kind of ceremony decor will you have?', 'whatKindOfCeremonyDecor', overviewData?.whatKindOfCeremonyDecor || '', 'textarea')}
            {renderEditableField('Who will set up and take down ceremony flowers and decor?', 'whoWillSetupTakedown', overviewData?.whoWillSetupTakedown || '')}
          </CardContent>
        </Card>

        {/* Cocktail Hour Questions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-amber-600">Cocktail Hour</CardTitle>
            <p className="text-sm text-gray-500">Planning your cocktail hour experience.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Where will cocktail hour be held?', 'whereWillCocktailHour', overviewData?.whereWillCocktailHour || '')}
            {renderEditableField('What cocktail hour entertainment will you have?', 'whatCocktailEntertainment', overviewData?.whatCocktailEntertainment || '')}
            {renderEditableField('Will you be serving food?', 'willYouServingFood', overviewData?.willYouServingFood || '')}
            {renderEditableField('Will you have a signature bar or cocktail?', 'willYouHaveSignatureBar', overviewData?.willYouHaveSignatureBar || '')}
            {renderEditableField('Will you have specialty drinks?', 'willYouHaveSpecialtyDrinks', overviewData?.willYouHaveSpecialtyDrinks || '')}
            {renderEditableField('Will you be mingling with your cocktail hour?', 'willYouBeMingling', overviewData?.willYouBeMingling || '')}
            {renderEditableField('What kind of decor will you have?', 'whatKindOfDecorCocktail', overviewData?.whatKindOfDecorCocktail || '', 'textarea')}
          </CardContent>
        </Card>

        {/* Reception Questions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-purple-600">Reception</CardTitle>
            <p className="text-sm text-gray-500">Reception planning details and considerations.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Where will the reception be held?', 'whereWillReception', overviewData?.whereWillReception || '')}
            {renderEditableField('Will you do a receiving line at the reception?', 'willYouDoReceivingLineReception', overviewData?.willYouDoReceivingLineReception || '')}
            {renderEditableField('How long is your reception?', 'howLongReception', overviewData?.howLongReception || '')}
            {renderEditableField('What kind of meal will you serve?', 'whatKindOfMeal', overviewData?.whatKindOfMeal || '')}
            {renderEditableField('Will you have toasts?', 'willYouHaveToasts', overviewData?.willYouHaveToasts || '')}
            {renderEditableField('Will you have a guestbook?', 'willYouHaveGuestbook', overviewData?.willYouHaveGuestbook || '')}
            {renderEditableField('Will you have wedding favors?', 'willYouHaveWeddingFavor', overviewData?.willYouHaveWeddingFavor || '')}
            {renderEditableField('Will you serve cake?', 'willYouServeCake', overviewData?.willYouServeCake || '')}
            {renderEditableField('Will you cut the cake?', 'willYouCutCake', overviewData?.willYouCutCake || '')}
          </CardContent>
        </Card>

        {/* Minor Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-600">The Minor Details</CardTitle>
            <p className="text-sm text-gray-500">
              There's a lot of small details that can easily be overlooked or forgotten, so we created this list to help avoid that.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderEditableField('Who is bringing the bride to the venue?', 'brideWalkingWith', overviewData?.brideWalkingWith || '')}
            {renderEditableField('Who is bringing the groom to the venue?', 'groomWalkingWith', overviewData?.groomWalkingWith || '')}
            {renderEditableField('How is the wedding party getting home?', 'weddingPartyTransport', overviewData?.weddingPartyTransport || '', 'textarea')}
            {renderEditableField('Who is responsible for bringing the rings to the venue?', 'ringsToVenue', overviewData?.ringsToVenue || '')}
            {renderEditableField('Who is responsible for bringing the dress to the venue?', 'dressToVenue', overviewData?.dressToVenue || '')}
            {renderEditableField('Who is responsible for getting the bride and groom\'s belongings into their getaway car?', 'belongingsTransport', overviewData?.belongingsTransport || '', 'textarea')}
            {renderEditableField('Who is driving the getaway car?', 'getawayCar', overviewData?.getawayCar || '')}
            {renderEditableField('Who is in charge of taking all the decor home from the venue?', 'decorTakeHome', overviewData?.decorTakeHome || '')}
            {renderEditableField('Who is in charge of taking all the gifts home from the venue?', 'giftsFromVenue', overviewData?.giftsFromVenue || '')}
            {renderEditableField('Are the florals to be trashed or is someone taking them home?', 'floralsDisposal', overviewData?.floralsDisposal || '', 'textarea')}
            {renderEditableField('Who is responsible for caring for your bouquet if you are having it preserved?', 'bouquetPreservation', overviewData?.bouquetPreservation || '', 'textarea')}
            {renderEditableField('Who will do a final sweep of the venue for any items left by wedding party and guests?', 'finalVenueSweep', overviewData?.finalVenueSweep || '')}
            {renderEditableField('What is to be done with any leftover food and/or alcohol?', 'leftoverFood', overviewData?.leftoverFood || '', 'textarea')}
            {renderEditableField('Who will get you your go-food and cake boxes into your getaway car for your late night snack?', 'lateNightSnack', overviewData?.lateNightSnack || '', 'textarea')}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}