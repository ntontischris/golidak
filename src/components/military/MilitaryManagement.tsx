import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MilitaryPersonnel, MilitarySearchFilters } from '@/types'
import { MilitaryForm } from './MilitaryForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Edit, Trash2, Search, Eye, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type ViewMode = 'list' | 'form' | 'view'

export const MilitaryManagement: React.FC = () => {
  const [personnel, setPersonnel] = useState<MilitaryPersonnel[]>([])
  const [selectedPersonnel, setSelectedPersonnel] = useState<MilitaryPersonnel | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<MilitarySearchFilters>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const essoLetters = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ']
  const currentYear = new Date().getFullYear()
  const essoYears = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  const loadPersonnel = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('military_personnel')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`)
      }
      if (filters.surname) {
        query = query.ilike('surname', `%${filters.surname}%`)
      }
      if (filters.rank) {
        query = query.ilike('rank', `%${filters.rank}%`)
      }
      if (filters.esso) {
        query = query.ilike('esso', `%${filters.esso}%`)
      }
      if (filters.esso_year) {
        query = query.eq('esso_year', filters.esso_year)
      }
      if (filters.esso_letter) {
        query = query.eq('esso_letter', filters.esso_letter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading personnel:', error)
        return
      }

      setPersonnel(data || [])
    } catch (error) {
      console.error('Error loading personnel:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPersonnel()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddNew = () => {
    setSelectedPersonnel(null)
    setViewMode('form')
  }

  const handleEdit = (person: MilitaryPersonnel) => {
    setSelectedPersonnel(person)
    setViewMode('form')
  }

  const handleView = (person: MilitaryPersonnel) => {
    setSelectedPersonnel(person)
    setViewMode('view')
  }

  const handleDelete = async (person: MilitaryPersonnel) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το στέλεχος "${person.surname} ${person.name}";`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('military_personnel')
        .delete()
        .eq('id', person.id)

      if (error) {
        console.error('Error deleting personnel:', error)
        return
      }

      await loadPersonnel()
    } catch (error) {
      console.error('Error deleting personnel:', error)
    }
  }

  const handleSave = async () => {
    await loadPersonnel()
    setViewMode('list')
  }

  const handleCancel = () => {
    setSelectedPersonnel(null)
    setViewMode('list')
  }

  const handleFilterChange = (key: keyof MilitarySearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  if (viewMode === 'form') {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleCancel}>
          ← Επιστροφή στη Λίστα
        </Button>
        <MilitaryForm
          personnel={selectedPersonnel || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (viewMode === 'view' && selectedPersonnel) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            ← Επιστροφή στη Λίστα
          </Button>
          <Button onClick={() => handleEdit(selectedPersonnel)}>
            <Edit className="h-4 w-4 mr-2" />
            Επεξεργασία
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Προφίλ Στρατιωτικού Προσωπικού
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Βασικά Στοιχεία */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Βασικά Στοιχεία</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Όνομα</label>
                  <p className="text-lg">{selectedPersonnel.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Επώνυμο</label>
                  <p className="text-lg">{selectedPersonnel.surname}</p>
                </div>
                {selectedPersonnel.rank && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Βαθμός</label>
                    <p>{selectedPersonnel.rank}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Στρατιωτικά Στοιχεία */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Στρατιωτικά Στοιχεία</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPersonnel.service_unit && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Μονάδα Υπηρεσίας</label>
                    <p>{selectedPersonnel.service_unit}</p>
                  </div>
                )}
                {selectedPersonnel.military_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ΑΜ</label>
                    <p>{selectedPersonnel.military_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ESSO */}
            {selectedPersonnel.esso && (
              <div>
                <h3 className="text-lg font-semibold mb-3">ESSO Σύστημα</h3>
                <div className="flex gap-4 items-center">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {selectedPersonnel.esso}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Έτος: {selectedPersonnel.esso_year} | Γράμμα: {selectedPersonnel.esso_letter}
                  </div>
                </div>
              </div>
            )}

            {/* Επιθυμία και Σχόλια */}
            {(selectedPersonnel.wish || selectedPersonnel.comments || selectedPersonnel.send_date) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Επιθυμία & Σχόλια</h3>
                <div className="space-y-4">
                  {selectedPersonnel.wish && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Επιθυμία</label>
                      <p className="mt-1 p-3 bg-muted rounded-md">{selectedPersonnel.wish}</p>
                    </div>
                  )}
                  {selectedPersonnel.send_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ημερομηνία Αποστολής</label>
                      <p>{formatDate(selectedPersonnel.send_date)}</p>
                    </div>
                  )}
                  {selectedPersonnel.comments && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Σχόλια</label>
                      <p className="mt-1 p-3 bg-muted rounded-md">{selectedPersonnel.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Στοιχεία Δημιουργίας */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <p>Εγγραφή: {formatDate(selectedPersonnel.created_at)}</p>
                <p>Τελευταία ενημέρωση: {formatDate(selectedPersonnel.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Στρατιωτικό Προσωπικό ({personnel.length})
            </span>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Νέο Στέλεχος
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Αναζήτηση Στρατιωτικού Προσωπικού
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Όνομα</label>
              <Input
                placeholder="Όνομα"
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Επώνυμο</label>
              <Input
                placeholder="Επώνυμο"
                value={filters.surname || ''}
                onChange={(e) => handleFilterChange('surname', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Βαθμός</label>
              <Input
                placeholder="Βαθμός"
                value={filters.rank || ''}
                onChange={(e) => handleFilterChange('rank', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">ESSO</label>
              <Input
                placeholder="ESSO (π.χ. 2025Α)"
                value={filters.esso || ''}
                onChange={(e) => handleFilterChange('esso', e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Απόκρυψη' : 'Εμφάνιση'} Φίλτρων ESSO
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium block mb-1">Έτος ESSO</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={filters.esso_year || ''}
                  onChange={(e) => handleFilterChange('esso_year', e.target.value)}
                >
                  <option value="">Όλα τα έτη</option>
                  {essoYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Γράμμα ESSO</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={filters.esso_letter || ''}
                  onChange={(e) => handleFilterChange('esso_letter', e.target.value)}
                >
                  <option value="">Όλα τα γράμματα</option>
                  {essoLetters.map(letter => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={clearFilters} className="w-full">
            Καθαρισμός Φίλτρων
          </Button>
        </CardContent>
      </Card>

      {/* Personnel List */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Προσωπικού</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Φόρτωση προσωπικού...</p>
            </div>
          ) : personnel.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {Object.values(filters).some(value => value) 
                  ? 'Δεν βρέθηκαν στελέχη με τα συγκεκριμένα κριτήρια'
                  : 'Δεν υπάρχει εγγεγραμμένο στρατιωτικό προσωπικό'
                }
              </p>
              {!Object.values(filters).some(value => value) && (
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη Πρώτου Στελέχους
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {personnel.map((person) => (
                <div
                  key={person.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">
                          {person.rank && `${person.rank} `}
                          {person.surname} {person.name}
                        </h3>
                        {person.esso && (
                          <Badge variant="default">
                            ESSO: {person.esso}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {person.service_unit && (
                          <span>Μονάδα: {person.service_unit}</span>
                        )}
                        {person.military_id && (
                          <span>ΑΜ: {person.military_id}</span>
                        )}
                        {person.send_date && (
                          <span>Αποστολή: {formatDate(person.send_date)}</span>
                        )}
                      </div>

                      {person.wish && (
                        <div className="text-sm">
                          <span className="font-medium">Επιθυμία:</span> {person.wish.slice(0, 100)}
                          {person.wish.length > 100 && '...'}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(person)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(person)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}