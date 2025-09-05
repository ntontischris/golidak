import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Request, RequestStatus, Citizen, MilitaryPersonnel } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FileText, Save, X, Search } from 'lucide-react'

interface RequestFormProps {
  request?: Request
  onSave?: (request: Request) => void
  onCancel?: () => void
}

const requestStatuses: { value: RequestStatus; label: string; color: string }[] = [
  { value: 'ΕΚΚΡΕΜΕΙ', label: 'Εκκρεμεί', color: 'bg-yellow-500' },
  { value: 'ΟΛΟΚΛΗΡΩΘΗΚΕ', label: 'Ολοκληρώθηκε', color: 'bg-green-500' },
  { value: 'ΑΠΟΡΡΙΦΘΗΚΕ', label: 'Απορρίφθηκε', color: 'bg-red-500' }
]

export const RequestForm: React.FC<RequestFormProps> = ({ request, onSave, onCancel }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    citizen_id: request?.citizen_id || '',
    military_personnel_id: request?.military_personnel_id || '',
    request_type: request?.request_type || '',
    description: request?.description || '',
    status: request?.status || 'ΕΚΚΡΕΜΕΙ' as RequestStatus,
    send_date: request?.send_date || '',
    completion_date: request?.completion_date || '',
    notes: request?.notes || ''
  })

  // Search states
  const [citizenSearch, setCitizenSearch] = useState('')
  const [militarySearch, setMilitarySearch] = useState('')
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnel[]>([])
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null)
  const [selectedMilitary, setSelectedMilitary] = useState<MilitaryPersonnel | null>(null)

  // Load initial data if editing
  useEffect(() => {
    if (request?.citizen_id) {
      loadCitizen(request.citizen_id)
    }
    if (request?.military_personnel_id) {
      loadMilitaryPersonnel(request.military_personnel_id)
    }
  }, [request])

  const loadCitizen = async (citizenId: string) => {
    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', citizenId)
      .single()

    if (!error && data) {
      setSelectedCitizen(data)
    }
  }

  const loadMilitaryPersonnel = async (personnelId: string) => {
    const { data, error } = await supabase
      .from('military_personnel')
      .select('*')
      .eq('id', personnelId)
      .single()

    if (!error && data) {
      setSelectedMilitary(data)
    }
  }

  const searchCitizens = async (searchTerm: string) => {
    if (!searchTerm) {
      setCitizens([])
      return
    }

    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .or(`surname.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(10)

    if (!error) {
      setCitizens(data || [])
    }
  }

  const searchMilitary = async (searchTerm: string) => {
    if (!searchTerm) {
      setMilitaryPersonnel([])
      return
    }

    const { data, error } = await supabase
      .from('military_personnel')
      .select('*')
      .or(`surname.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(10)

    if (!error) {
      setMilitaryPersonnel(data || [])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen)
    setSelectedMilitary(null)
    setFormData(prev => ({
      ...prev,
      citizen_id: citizen.id,
      military_personnel_id: ''
    }))
    setCitizenSearch('')
    setCitizens([])
  }

  const selectMilitary = (personnel: MilitaryPersonnel) => {
    setSelectedMilitary(personnel)
    setSelectedCitizen(null)
    setFormData(prev => ({
      ...prev,
      military_personnel_id: personnel.id,
      citizen_id: ''
    }))
    setMilitarySearch('')
    setMilitaryPersonnel([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.request_type || !formData.description) {
      setError('Ο τύπος αιτήματος και η περιγραφή είναι υποχρεωτικά')
      setLoading(false)
      return
    }

    if (!formData.citizen_id && !formData.military_personnel_id) {
      setError('Πρέπει να επιλέξετε είτε πολίτη είτε στρατιωτικό προσωπικό')
      setLoading(false)
      return
    }

    try {
      const dataToSubmit = {
        ...formData,
        citizen_id: formData.citizen_id || null,
        military_personnel_id: formData.military_personnel_id || null,
        send_date: formData.send_date || null,
        completion_date: formData.completion_date || null,
        notes: formData.notes || null,
        created_by: user?.id
      }

      let result
      if (request?.id) {
        // Update existing request
        result = await supabase
          .from('requests')
          .update(dataToSubmit)
          .eq('id', request.id)
          .select()
          .single()
      } else {
        // Create new request
        result = await supabase
          .from('requests')
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
          <FileText className="h-5 w-5" />
          {request ? 'Επεξεργασία Αιτήματος' : 'Νέο Αίτημα'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Επιλογή Αιτούντος */}
          <Accordion type="single" collapsible defaultValue="requester" className="w-full">
            <AccordionItem value="requester">
              <AccordionTrigger>Επιλογή Αιτούντος</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Selected Person Display */}
                  {selectedCitizen && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Επιλεγμένος Πολίτης:</p>
                          <p>{selectedCitizen.surname} {selectedCitizen.name}</p>
                          {selectedCitizen.mobile_phone && <p className="text-sm text-muted-foreground">{selectedCitizen.mobile_phone}</p>}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setSelectedCitizen(null)
                          setFormData(prev => ({ ...prev, citizen_id: '' }))
                        }}>
                          Αλλαγή
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMilitary && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Επιλεγμένο Στρατιωτικό Προσωπικό:</p>
                          <p>{selectedMilitary.rank && `${selectedMilitary.rank} `}{selectedMilitary.surname} {selectedMilitary.name}</p>
                          {selectedMilitary.esso && <p className="text-sm text-muted-foreground">ESSO: {selectedMilitary.esso}</p>}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setSelectedMilitary(null)
                          setFormData(prev => ({ ...prev, military_personnel_id: '' }))
                        }}>
                          Αλλαγή
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Search for Citizen */}
                  {!selectedCitizen && !selectedMilitary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Αναζήτηση Πολίτη</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Αναζήτηση πολίτη..."
                            value={citizenSearch}
                            onChange={(e) => {
                              setCitizenSearch(e.target.value)
                              searchCitizens(e.target.value)
                            }}
                            className="pl-10"
                          />
                        </div>
                        {citizens.length > 0 && (
                          <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                            {citizens.map((citizen) => (
                              <button
                                key={citizen.id}
                                type="button"
                                className="w-full p-2 text-left hover:bg-accent transition-colors"
                                onClick={() => selectCitizen(citizen)}
                              >
                                <div className="font-medium">{citizen.surname} {citizen.name}</div>
                                {citizen.mobile_phone && (
                                  <div className="text-sm text-muted-foreground">{citizen.mobile_phone}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Αναζήτηση Στρατιωτικού Προσωπικού</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Αναζήτηση στρατιωτικού..."
                            value={militarySearch}
                            onChange={(e) => {
                              setMilitarySearch(e.target.value)
                              searchMilitary(e.target.value)
                            }}
                            className="pl-10"
                          />
                        </div>
                        {militaryPersonnel.length > 0 && (
                          <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                            {militaryPersonnel.map((personnel) => (
                              <button
                                key={personnel.id}
                                type="button"
                                className="w-full p-2 text-left hover:bg-accent transition-colors"
                                onClick={() => selectMilitary(personnel)}
                              >
                                <div className="font-medium">
                                  {personnel.rank && `${personnel.rank} `}
                                  {personnel.surname} {personnel.name}
                                </div>
                                {personnel.esso && (
                                  <div className="text-sm text-muted-foreground">ESSO: {personnel.esso}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Στοιχεία Αιτήματος */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Τύπος Αιτήματος *</label>
                <Input
                  value={formData.request_type}
                  onChange={(e) => handleInputChange('request_type', e.target.value)}
                  placeholder="π.χ. Βεβαίωση, Πιστοποιητικό"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Κατάσταση</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {requestStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Περιγραφή Αιτήματος *</label>
              <textarea
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Περιγράψτε το αίτημα..."
                required
              />
            </div>
          </div>

          {/* Ημερομηνίες */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dates">
              <AccordionTrigger>Ημερομηνίες</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ημερομηνία Αποστολής</label>
                    <Input
                      type="date"
                      value={formData.send_date}
                      onChange={(e) => handleInputChange('send_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ημερομηνία Ολοκλήρωσης</label>
                    <Input
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => handleInputChange('completion_date', e.target.value)}
                      disabled={formData.status !== 'ΟΛΟΚΛΗΡΩΘΗΚΕ'}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Σημειώσεις */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Σημειώσεις</label>
            <textarea
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Επιπλέον σημειώσεις..."
            />
          </div>

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