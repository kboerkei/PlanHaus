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
  
  // Custom Questions for each section
  customGettingStartedQuestions: Array<{id: string, question: string, answer: string}>;
  customWeddingPartyQuestions: Array<{id: string, question: string, answer: string}>;
  customMiscellaneousQuestions: Array<{id: string, question: string, answer: string}>;
  customCeremonyQuestions: Array<{id: string, question: string, answer: string}>;
  customCocktailHourQuestions: Array<{id: string, question: string, answer: string}>;
  customReceptionQuestions: Array<{id: string, question: string, answer: string}>;
  customMinorDetailsQuestions: Array<{id: string, question: string, answer: string}>;
  
  // Getting Started Questions
  areYouPlanningTogether: string;
  doYouWantOutdoorCeremony: string;
  
  // Wedding Party Questions
  willYouHaveBridalParty: string;
  howManyBridalParty: string;
  howWillYouAskBridalParty: string;
  bridalPartyResponsibilities: string;
  bridalPartyAttire: string;
  bridalPartyHairMakeup: string;
  bridalPartyWalkingOrder: string;
  
  // Miscellaneous Questions
  willYouNeedHotelBlock: string;
  willYouProvideTransportation: string;
  willYouHaveDressCode: string;
  whoWillHandOutTips: string;
  
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
  const [isAddingQuestion, setIsAddingQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingCustomQuestion, setEditingCustomQuestion] = useState<string | null>(null);
  const [editCustomQuestion, setEditCustomQuestion] = useState('');
  const [editCustomAnswer, setEditCustomAnswer] = useState('');

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

  const addCustomQuestion = (section: string) => {
    if (!newQuestion.trim()) return;
    
    const sectionField = `custom${section}Questions` as keyof OverviewData;
    const currentQuestions = (overviewData?.[sectionField] as Array<{id: string, question: string, answer: string}>) || [];
    
    const newQuestionItem = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };
    
    const updateData = {
      [sectionField]: [...currentQuestions, newQuestionItem]
    };
    
    console.log('Adding custom question:', { section, sectionField, updateData });
    
    updateOverviewMutation.mutate(updateData);
    
    setIsAddingQuestion(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  const deleteCustomQuestion = (section: string, questionId: string) => {
    const sectionField = `custom${section}Questions` as keyof OverviewData;
    const currentQuestions = (overviewData?.[sectionField] as Array<{id: string, question: string, answer: string}>) || [];
    const updatedQuestions = currentQuestions.filter(q => q.id !== questionId);
    
    updateOverviewMutation.mutate({
      [sectionField]: updatedQuestions
    });
  };

  const startEditCustomQuestion = (section: string, questionId: string, question: string, answer: string) => {
    setEditingCustomQuestion(`${section}-${questionId}`);
    setEditCustomQuestion(question);
    setEditCustomAnswer(answer);
  };

  const saveCustomQuestion = (section: string, questionId: string) => {
    const sectionField = `custom${section}Questions` as keyof OverviewData;
    const currentQuestions = (overviewData?.[sectionField] as Array<{id: string, question: string, answer: string}>) || [];
    const updatedQuestions = currentQuestions.map(q => 
      q.id === questionId 
        ? { ...q, question: editCustomQuestion.trim(), answer: editCustomAnswer.trim() }
        : q
    );
    
    updateOverviewMutation.mutate({
      [sectionField]: updatedQuestions
    });
    
    setEditingCustomQuestion(null);
    setEditCustomQuestion('');
    setEditCustomAnswer('');
  };

  const cancelCustomEdit = () => {
    setEditingCustomQuestion(null);
    setEditCustomQuestion('');
    setEditCustomAnswer('');
  };

  const deleteStandardQuestion = (field: keyof OverviewData) => {
    updateOverviewMutation.mutate({
      [field]: null
    });
  };

  const renderSectionWithAddDelete = (
    sectionTitle: string,
    sectionKey: string,
    questions: Array<{field: keyof OverviewData, label: string, type?: 'text' | 'date' | 'textarea'}>,
    titleColor: string = 'text-gray-600'
  ) => {
    const customQuestionsField = `custom${sectionKey}Questions` as keyof OverviewData;
    const customQuestions = (overviewData?.[customQuestionsField] as Array<{id: string, question: string, answer: string}>) || [];

    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg ${titleColor}`}>{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.map(({field, label, type = 'text'}) => 
            <div key={field}>{renderEditableField(label, field, overviewData?.[field] || '', type, true)}</div>
          )}
          
          {/* Custom Questions */}
          {customQuestions.map((customQ: {id: string, question: string, answer: string}) => {
            const isEditingThis = editingCustomQuestion === `${sectionKey}-${customQ.id}`;
            
            return (
              <div key={customQ.id} className="py-2 border-b border-gray-100">
                {isEditingThis ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Edit question..."
                      value={editCustomQuestion}
                      onChange={(e) => setEditCustomQuestion(e.target.value)}
                    />
                    <Input
                      placeholder="Edit answer..."
                      value={editCustomAnswer}
                      onChange={(e) => setEditCustomAnswer(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveCustomQuestion(sectionKey, customQ.id)} className="bg-green-600 text-white">
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelCustomEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 w-1/3">{customQ.question}:</span>
                    <div className="flex-1 flex items-center justify-between">
                      <span 
                        className="text-gray-800 cursor-pointer hover:text-blue-600"
                        onClick={() => startEditCustomQuestion(sectionKey, customQ.id, customQ.question, customQ.answer)}
                      >
                        {customQ.answer || 'Click to add answer'}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditCustomQuestion(sectionKey, customQ.id, customQ.question, customQ.answer)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCustomQuestion(sectionKey, customQ.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Add Custom Question */}
          {isAddingQuestion === sectionKey ? (
            <div className="space-y-2 py-2 border-b border-gray-100">
              <Input
                placeholder="Enter your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <Input
                placeholder="Enter your answer (optional)..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addCustomQuestion(sectionKey)} className="bg-green-600 text-white">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingQuestion(null)}>
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingQuestion(sectionKey)}
              className="w-full mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Question
            </Button>
          )}
        </CardContent>
      </Card>
    );
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
              {showDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteStandardQuestion(field)}
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
        {renderSectionWithAddDelete('Getting Started', 'GettingStarted', [
          {field: 'areYouPlanningTogether', label: 'Are you planning to have your wedding during "busy season" (May-October)?'},
          {field: 'doYouWantOutdoorCeremony', label: 'Do you want an outdoor ceremony?'}
        ], 'text-rose-600')}

        {/* Wedding Party Questions */}
        {renderSectionWithAddDelete('Wedding Party', 'WeddingParty', [
          {field: 'willYouHaveBridalParty', label: 'Will you be having a bridal party?'},
          {field: 'howManyBridalParty', label: 'How many people will you be having in your bridal party?'},
          {field: 'howWillYouAskBridalParty', label: 'How will you ask them to be in your bridal party?', type: 'textarea'},
          {field: 'bridalPartyResponsibilities', label: 'What responsibilities would you like them to take on?', type: 'textarea'},
          {field: 'bridalPartyAttire', label: 'What will you want them to wear? (Dresses, suits, tuxes, etc.)', type: 'textarea'},
          {field: 'bridalPartyHairMakeup', label: 'How will you want your bridesmaids hair & makeup?', type: 'textarea'},
          {field: 'bridalPartyWalkingOrder', label: 'What is the order you want people walking down the aisle?', type: 'textarea'}
        ], 'text-pink-600')}

        {/* Miscellaneous Questions */}
        {renderSectionWithAddDelete('Miscellaneous', 'Miscellaneous', [
          {field: 'willYouNeedHotelBlock', label: 'Will you need a hotel block for guests?'},
          {field: 'willYouProvideTransportation', label: 'Will you need to provide transportation for guests?'},
          {field: 'willYouHaveDressCode', label: 'Will you be having a dress code?'},
          {field: 'whoWillHandOutTips', label: 'Who will hand out tips day of?'}
        ], 'text-indigo-600')}

        {/* Ceremony Questions */}
        {renderSectionWithAddDelete('Ceremony', 'Ceremony', [
          {field: 'doYouWantUnplugged', label: 'Do you want an unplugged ceremony?'},
          {field: 'doYouWantAisleRunner', label: 'Do you want to have an aisle runner?'},
          {field: 'willYouHaveFlowerGirls', label: 'Will you have flower girls and ring bearers?'},
          {field: 'willYouHaveRingBearer', label: 'Will you have a ring bearer?'},
          {field: 'whatTypeOfOfficiant', label: 'What type of officiant do you want?'},
          {field: 'willYouWriteVows', label: 'Will you write your own vows?'},
          {field: 'willYouUseUnityCandle', label: 'Will you use a unity candle during your ceremony?'},
          {field: 'willYouDoSandCeremony', label: 'Will you do a sand ceremony?'},
          {field: 'whoWillWalkBrideDown', label: 'Who will walk the bride down the aisle?'},
          {field: 'whatWillCeremonyMusic', label: 'What will your ceremony music be?', type: 'textarea'},
          {field: 'whoWillPlayMusic', label: 'Who will play the music?'},
          {field: 'willYouHaveReceivingLine', label: 'Will you have a receiving line after your ceremony?'},
          {field: 'whereWillYouTakePictures', label: 'Where will you take pictures after ceremony?', type: 'textarea'},
          {field: 'willYouDoFirstLook', label: 'Will you do a first look?'},
          {field: 'whatKindOfCeremonyDecor', label: 'What kind of ceremony decor will you have?', type: 'textarea'},
          {field: 'whoWillSetupTakedown', label: 'Who will set up and take down ceremony flowers and decor?'}
        ], 'text-blue-600')}

        {/* Cocktail Hour Questions */}
        {renderSectionWithAddDelete('Cocktail Hour', 'CocktailHour', [
          {field: 'whereWillCocktailHour', label: 'Where will cocktail hour be held?'},
          {field: 'whatCocktailEntertainment', label: 'What cocktail hour entertainment will you have?'},
          {field: 'willYouServingFood', label: 'Will you be serving food?'},
          {field: 'willYouHaveSignatureBar', label: 'Will you have a signature bar or cocktail?'},
          {field: 'willYouHaveSpecialtyDrinks', label: 'Will you have specialty drinks?'},
          {field: 'willYouBeMingling', label: 'Will you be mingling with your cocktail hour?'},
          {field: 'whatKindOfDecorCocktail', label: 'What kind of decor will you have?', type: 'textarea'}
        ], 'text-amber-600')}

        {/* Reception Questions */}
        {renderSectionWithAddDelete('Reception', 'Reception', [
          {field: 'whereWillReception', label: 'Where will the reception be held?'},
          {field: 'willYouDoReceivingLineReception', label: 'Will you do a receiving line at the reception?'},
          {field: 'howLongReception', label: 'How long is your reception?'},
          {field: 'whatKindOfMeal', label: 'What kind of meal will you serve?'},
          {field: 'willYouHaveToasts', label: 'Will you have toasts?'},
          {field: 'willYouHaveGuestbook', label: 'Will you have a guestbook?'},
          {field: 'willYouHaveWeddingFavor', label: 'Will you have wedding favors?'},
          {field: 'willYouServeCake', label: 'Will you serve cake?'},
          {field: 'willYouCutCake', label: 'Will you cut the cake?'}
        ], 'text-purple-600')}

        {/* Minor Details */}
        {renderSectionWithAddDelete('The Minor Details', 'MinorDetails', [
          {field: 'brideWalkingWith', label: 'Who is bringing the bride to the venue?'},
          {field: 'groomWalkingWith', label: 'Who is bringing the groom to the venue?'},
          {field: 'weddingPartyTransport', label: 'How is the wedding party getting home?', type: 'textarea'},
          {field: 'ringsToVenue', label: 'Who is responsible for bringing the rings to the venue?'},
          {field: 'dressToVenue', label: 'Who is responsible for bringing the dress to the venue?'},
          {field: 'belongingsTransport', label: 'Who is responsible for getting the bride and groom\'s belongings into their getaway car?', type: 'textarea'},
          {field: 'getawayCar', label: 'Who is driving the getaway car?'},
          {field: 'decorTakeHome', label: 'Who is in charge of taking all the decor home from the venue?'},
          {field: 'giftsFromVenue', label: 'Who is in charge of taking all the gifts home from the venue?'},
          {field: 'floralsDisposal', label: 'Are the florals to be trashed or is someone taking them home?', type: 'textarea'},
          {field: 'bouquetPreservation', label: 'Who is responsible for caring for your bouquet if you are having it preserved?', type: 'textarea'},
          {field: 'finalVenueSweep', label: 'Who will do a final sweep of the venue for any items left by wedding party and guests?'},
          {field: 'leftoverFood', label: 'What is to be done with any leftover food and/or alcohol?', type: 'textarea'},
          {field: 'lateNightSnack', label: 'Who will get you your go-food and cake boxes into your getaway car for your late night snack?', type: 'textarea'}
        ], 'text-gray-600')}
      </div>
    </div>
  );
}