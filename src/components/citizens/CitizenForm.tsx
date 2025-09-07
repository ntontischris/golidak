import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Citizen, Municipality, ElectoralDistrict } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { User, Save, X } from 'lucide-react'

interface CitizenFormProps {
  citizen?: Citizen
  onSave?: (citizen: Citizen) => void
  onCancel?: () => void
}

const municipalities: Municipality[] = [
  'ΠΑΥΛΟΥ ΜΕΛΑ',
  'ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ',
  'ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ',
  'ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ',
  'ΘΕΣΣΑΛΟΝΙΚΗΣ',
  'ΚΑΛΑΜΑΡΙΑΣ',
  'ΑΛΛΟ'
]

const electoralDistricts: ElectoralDistrict[] = [
  'Α ΘΕΣΣΑΛΟΝΙΚΗΣ',
  'Β ΘΕΣΣΑΛΟΝΙΚΗΣ'
]

export const CitizenForm: React.FC<CitizenFormProps> = ({ citizen, onSave, onCancel }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    surname: citizen?.surname || '',
    name: citizen?.name || '',
    recommendation_from: citizen?.recommendation_from || '',
    patronymic: citizen?.patronymic || '',
    mobile_phone: citizen?.mobile_phone || '',
    landline_phone: citizen?.landline_phone || '',
    email: citizen?.email || '',
    address: citizen?.address || '',
    postal_code: citizen?.postal_code || '',
    municipality: citizen?.municipality || '' as Municipality,
    area: citizen?.area || '',
    electoral_district: citizen?.electoral_district || '' as ElectoralDistrict,
    last_contact_date: citizen?.last_contact_date || '',
    notes: citizen?.notes || ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.surname || !formData.name) {
      setError('Το επώνυμο και το όνομα είναι υποχρεωτικά')
      setLoading(false)
      return
    }

    try {
      const dataToSubmit = {
        ...formData,
        municipality: formData.municipality || null,
        electoral_district: formData.electoral_district || null,
        last_contact_date: formData.last_contact_date || null,
        created_by: user?.id
      }

      let result
      if (citizen?.id) {
        // Update existing citizen
        result = await supabase
          .from('citizens')
          .update(dataToSubmit)
          .eq('id', citizen.id)
          .select()
          .single()
      } else {
        // Create new citizen
        result = await supabase
          .from('citizens')
          .insert(dataToSubmit)
          .select()
          .single()
      }

      if (result.error) {
        setError('Σφάλμα κατά την αποθήκευση: ' + result.error.message)
        return
      }

      onSave?.(result.data)
    } catch (err) {
      setError('Παρουσιάστηκε σφάλμα')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {citizen ? 'Επεξεργασία Πολίτη' : 'Νέος Πολίτης'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Βασικά Στοιχεία */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Επώνυμο *</label>
              <Input
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                placeholder="Επώνυμο"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Όνομα *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Όνομα"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Πατρώνυμο</label>
              <Input
                value={formData.patronymic}
                onChange={(e) => handleInputChange('patronymic', e.target.value)}
                placeholder="Πατρώνυμο"
              />
            </div>
          </div>

          {/* Στοιχεία Επικοινωνίας */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="contact">
              <AccordionTrigger>Στοιχεία Επικοινωνίας</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Κινητό</label>
                    <Input
                      value={formData.mobile_phone}
                      onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                      placeholder="Κινητό τηλέφωνο"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Σταθερό</label>
                    <Input
                      value={formData.landline_phone}
                      onChange={(e) => handleInputChange('landline_phone', e.target.value)}
                      placeholder="Σταθερό τηλέφωνο"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Διεύθυνση και Τοποθεσία */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="location">
              <AccordionTrigger>Διεύθυνση & Τοποθεσία</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Διεύθυνση</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Διεύθυνση"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ταχυδρομικός Κώδικας</label>
                      <Input
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        placeholder="ΤΚ"
                      />
                    </div>
                  </div>

                  {/* Δήμος - Accordion */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Δήμος</label>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="municipality">
                        <AccordionTrigger className="text-sm">
                          {formData.municipality || 'Επιλέξτε Δήμο'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {municipalities.map((municipality) => (
                              <button
                                key={municipality}
                                type="button"
                                className={`p-2 text-left rounded-md transition-colors ${
                                  formData.municipality === municipality
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                                onClick={() => handleInputChange('municipality', municipality)}
                              >
                                {municipality}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Περιοχή</label>
                    <Input
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Περιοχή"
                    />
                  </div>

                  {/* Εκλογική Περιφέρεια - Accordion */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Εκλογική Περιφέρεια</label>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="district">
                        <AccordionTrigger className="text-sm">
                          {formData.electoral_district || 'Επιλέξτε Εκλογική Περιφέρεια'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {electoralDistricts.map((district) => (
                              <button
                                key={district}
                                type="button"
                                className={`p-2 text-left rounded-md transition-colors ${
                                  formData.electoral_district === district
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                                onClick={() => handleInputChange('electoral_district', district)}
                              >
                                {district}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Άλλα Στοιχεία */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="other">
              <AccordionTrigger>Άλλα Στοιχεία</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Σύσταση από</label>
                    <Input
                      value={formData.recommendation_from}
                      onChange={(e) => handleInputChange('recommendation_from', e.target.value)}
                      placeholder="Σύσταση από"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Τελευταία Επικοινωνία</label>
                    <Input
                      type="date"
                      value={formData.last_contact_date}
                      onChange={(e) => handleInputChange('last_contact_date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium">Παρατηρήσεις</label>
                  <textarea
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm mt-1"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Παρατηρήσεις"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Ακύρωση
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}