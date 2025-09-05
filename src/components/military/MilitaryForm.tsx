import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MilitaryPersonnel, EssoLetter } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Shield, Save, X } from 'lucide-react'

interface MilitaryFormProps {
  personnel?: MilitaryPersonnel
  onSave?: (personnel: MilitaryPersonnel) => void
  onCancel?: () => void
}

const essoLetters: EssoLetter[] = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ']
const currentYear = new Date().getFullYear()
const essoYears = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

const militaryRanks = [
  'Στρατιώτης',
  'Δεκανέας',
  'Λοχίας',
  'Επιλοχίας',
  'Ανθυπολοχαγός',
  'Υπολοχαγός',
  'Λοχαγός',
  'Ταγματάρχης',
  'Αντισυνταγματάρχης',
  'Συνταγματάρχης',
  'Ταξίαρχος',
  'Υποστράτηγος',
  'Αντιστράτηγος',
  'Στρατηγός'
]

export const MilitaryForm: React.FC<MilitaryFormProps> = ({ personnel, onSave, onCancel }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: personnel?.name || '',
    surname: personnel?.surname || '',
    rank: personnel?.rank || '',
    service_unit: personnel?.service_unit || '',
    wish: personnel?.wish || '',
    send_date: personnel?.send_date || '',
    comments: personnel?.comments || '',
    military_id: personnel?.military_id || '',
    esso_year: personnel?.esso_year || '',
    esso_letter: personnel?.esso_letter || '' as EssoLetter
  })

  // Auto-generate ESSO when year and letter are selected
  React.useEffect(() => {
    if (formData.esso_year && formData.esso_letter) {
      setFormData(prev => ({
        ...prev,
        esso: `${prev.esso_year}${prev.esso_letter}`
      }))
    }
  }, [formData.esso_year, formData.esso_letter])

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

    if (!formData.name || !formData.surname) {
      setError('Το όνομα και το επώνυμο είναι υποχρεωτικά')
      setLoading(false)
      return
    }

    try {
      const dataToSubmit = {
        ...formData,
        rank: formData.rank || null,
        service_unit: formData.service_unit || null,
        wish: formData.wish || null,
        send_date: formData.send_date || null,
        comments: formData.comments || null,
        military_id: formData.military_id || null,
        esso_year: formData.esso_year || null,
        esso_letter: formData.esso_letter || null,
        esso: formData.esso_year && formData.esso_letter ? `${formData.esso_year}${formData.esso_letter}` : null,
        created_by: user?.id
      }

      let result
      if (personnel?.id) {
        // Update existing personnel
        result = await supabase
          .from('military_personnel')
          .update(dataToSubmit)
          .eq('id', personnel.id)
          .select()
          .single()
      } else {
        // Create new personnel
        result = await supabase
          .from('military_personnel')
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
          <Shield className="h-5 w-5" />
          {personnel ? 'Επεξεργασία Στρατιωτικού Προσωπικού' : 'Νέο Στρατιωτικό Προσωπικό'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium">Επώνυμο *</label>
              <Input
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                placeholder="Επώνυμο"
                required
              />
            </div>
          </div>

          {/* Στρατιωτικά Στοιχεία */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="military">
              <AccordionTrigger>Στρατιωτικά Στοιχεία</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Βαθμός</label>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="rank">
                        <AccordionTrigger className="text-sm">
                          {formData.rank || 'Επιλέξτε Βαθμό'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2">
                            {militaryRanks.map((rank) => (
                              <button
                                key={rank}
                                type="button"
                                className={`p-2 text-left rounded-md transition-colors text-sm ${
                                  formData.rank === rank
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                                onClick={() => handleInputChange('rank', rank)}
                              >
                                {rank}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Μονάδα Υπηρεσίας</label>
                    <Input
                      value={formData.service_unit}
                      onChange={(e) => handleInputChange('service_unit', e.target.value)}
                      placeholder="Μονάδα Υπηρεσίας"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ΑΜ (Αριθμός Μητρώου)</label>
                    <Input
                      value={formData.military_id}
                      onChange={(e) => handleInputChange('military_id', e.target.value)}
                      placeholder="ΑΜ"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ESSO Σύστημα */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="esso">
              <AccordionTrigger>ESSO Σύστημα</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Επιλέξτε έτος και γράμμα για να δημιουργηθεί αυτόματα το ESSO
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Έτος ESSO */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Έτος ESSO</label>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="year">
                          <AccordionTrigger className="text-sm">
                            {formData.esso_year || 'Επιλέξτε Έτος'}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-2">
                              {essoYears.map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  className={`p-2 text-center rounded-md transition-colors ${
                                    formData.esso_year === year
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-accent'
                                  }`}
                                  onClick={() => handleInputChange('esso_year', year)}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Γράμμα ESSO */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Γράμμα ESSO</label>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="letter">
                          <AccordionTrigger className="text-sm">
                            {formData.esso_letter || 'Επιλέξτε Γράμμα'}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-3 gap-2">
                              {essoLetters.map((letter) => (
                                <button
                                  key={letter}
                                  type="button"
                                  className={`p-2 text-center rounded-md transition-colors font-bold ${
                                    formData.esso_letter === letter
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-accent'
                                  }`}
                                  onClick={() => handleInputChange('esso_letter', letter)}
                                >
                                  {letter}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Αυτόματο ESSO */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ESSO (Αυτόματο)</label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-bold">
                        {formData.esso_year && formData.esso_letter ? 
                          `${formData.esso_year}${formData.esso_letter}` : 
                          'Επιλέξτε έτος και γράμμα'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Επιθυμία και Σχόλια */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger>Επιθυμία & Σχόλια</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Επιθυμία</label>
                    <textarea
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                      rows={3}
                      value={formData.wish}
                      onChange={(e) => handleInputChange('wish', e.target.value)}
                      placeholder="Επιθυμία του στρατιωτικού"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ημερομηνία Αποστολής</label>
                    <Input
                      type="date"
                      value={formData.send_date}
                      onChange={(e) => handleInputChange('send_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Σχόλια</label>
                    <textarea
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                      rows={4}
                      value={formData.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      placeholder="Σχόλια και παρατηρήσεις"
                    />
                  </div>
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