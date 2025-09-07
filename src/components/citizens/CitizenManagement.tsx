import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Citizen } from '@/types'
import { CitizenForm } from './CitizenForm'
import { CitizenSearch } from './CitizenSearch'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

type ViewMode = 'list' | 'form' | 'view'

export const CitizenManagement: React.FC = () => {
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [municipalityFilter, setMunicipalityFilter] = useState('')
  const ITEMS_PER_PAGE = 20

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadCitizens = async (page = 1, search = '', municipality = '') => {
    setLoading(true)
    try {
      let query = supabase
        .from('citizens')
        .select(`
          id, surname, name, patronymic, mobile_phone, email, 
          municipality, electoral_district, last_contact_date, 
          recommendation_from, created_at, updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply search filter
      if (search.trim()) {
        query = query.or(`surname.ilike.%${search}%,name.ilike.%${search}%,mobile_phone.ilike.%${search}%,email.ilike.%${search}%`)
      }

      // Apply municipality filter
      if (municipality) {
        query = query.eq('municipality', municipality)
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error loading citizens:', error)
        return
      }

      setCitizens(data || [])
      setTotalCount(count || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading citizens:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCitizens(1, debouncedSearchTerm, municipalityFilter)
  }, [debouncedSearchTerm, municipalityFilter])

  useEffect(() => {
    loadCitizens(1)
  }, [])

  const handleAddNew = () => {
    setSelectedCitizen(null)
    setViewMode('form')
  }

  const handleEdit = (citizen: Citizen) => {
    setSelectedCitizen(citizen)
    setViewMode('form')
  }

  const handleView = (citizen: Citizen) => {
    setSelectedCitizen(citizen)
    setViewMode('view')
  }

  const handleDelete = async (citizen: Citizen) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον πολίτη "${citizen.surname} ${citizen.name}";`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('citizens')
        .delete()
        .eq('id', citizen.id)

      if (error) {
        console.error('Error deleting citizen:', error)
        return
      }

      await loadCitizens()
    } catch (error) {
      console.error('Error deleting citizen:', error)
    }
  }

  const handleSave = async () => {
    await loadCitizens()
    setViewMode('list')
  }

  const handleCancel = () => {
    setSelectedCitizen(null)
    setViewMode('list')
  }

  const handleSelectFromSearch = (citizen: Citizen) => {
    handleView(citizen)
  }

  if (viewMode === 'form') {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleCancel}>
          ← Επιστροφή στη Λίστα
        </Button>
        <CitizenForm
          citizen={selectedCitizen || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (viewMode === 'view' && selectedCitizen) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            ← Επιστροφή στη Λίστα
          </Button>
          <Button onClick={() => handleEdit(selectedCitizen)}>
            <Edit className="h-4 w-4 mr-2" />
            Επεξεργασία
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Προφίλ Πολίτη
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Βασικά Στοιχεία */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Βασικά Στοιχεία</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Επώνυμο</label>
                  <p className="text-lg">{selectedCitizen.surname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Όνομα</label>
                  <p className="text-lg">{selectedCitizen.name}</p>
                </div>
                {selectedCitizen.patronymic && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Πατρώνυμο</label>
                    <p>{selectedCitizen.patronymic}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Στοιχεία Επικοινωνίας */}
            {(selectedCitizen.mobile_phone || selectedCitizen.landline_phone || selectedCitizen.email) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Στοιχεία Επικοινωνίας</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCitizen.mobile_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCitizen.mobile_phone}</span>
                    </div>
                  )}
                  {selectedCitizen.landline_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCitizen.landline_phone}</span>
                    </div>
                  )}
                  {selectedCitizen.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCitizen.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Διεύθυνση */}
            {(selectedCitizen.address || selectedCitizen.municipality || selectedCitizen.area) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Διεύθυνση & Τοποθεσία</h3>
                <div className="space-y-2">
                  {selectedCitizen.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCitizen.address}</span>
                      {selectedCitizen.postal_code && <span>({selectedCitizen.postal_code})</span>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedCitizen.municipality && (
                      <Badge variant="secondary">{selectedCitizen.municipality}</Badge>
                    )}
                    {selectedCitizen.electoral_district && (
                      <Badge variant="outline">{selectedCitizen.electoral_district}</Badge>
                    )}
                    {selectedCitizen.area && (
                      <Badge variant="outline">{selectedCitizen.area}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Άλλα Στοιχεία */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Άλλα Στοιχεία</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCitizen.recommendation_from && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Σύσταση από</label>
                    <p>{selectedCitizen.recommendation_from}</p>
                  </div>
                )}
                {selectedCitizen.last_contact_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Τελευταία Επικοινωνία</label>
                    <p>{formatDate(selectedCitizen.last_contact_date)}</p>
                  </div>
                )}
              </div>
              {selectedCitizen.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Παρατηρήσεις</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedCitizen.notes}</p>
                </div>
              )}
            </div>

            {/* Στοιχεία Δημιουργίας */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <p>Εγγραφή: {formatDate(selectedCitizen.created_at)}</p>
                <p>Τελευταία ενημέρωση: {formatDate(selectedCitizen.updated_at)}</p>
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
              <Users className="h-5 w-5" />
              Διαχείριση Πολιτών ({totalCount})
            </span>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Νέος Πολίτης
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση (επώνυμο, όνομα, τηλέφωνο, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={municipalityFilter}
                onChange={(e) => setMunicipalityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Όλοι οι Δήμοι</option>
                <option value="ΠΑΥΛΟΥ ΜΕΛΑ">ΠΑΥΛΟΥ ΜΕΛΑ</option>
                <option value="ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ">ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ</option>
                <option value="ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ">ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ</option>
                <option value="ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ">ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ</option>
                <option value="ΘΕΣΣΑΛΟΝΙΚΗΣ">ΘΕΣΣΑΛΟΝΙΚΗΣ</option>
                <option value="ΚΑΛΑΜΑΡΙΑΣ">ΚΑΛΑΜΑΡΙΑΣ</option>
                <option value="ΑΛΛΟ">ΑΛΛΟ</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Search */}
      <CitizenSearch onSelectCitizen={handleSelectFromSearch} />

      {/* Citizens List */}
      <Card>
        <CardHeader>
          <CardTitle>Όλοι οι Πολίτες</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Φόρτωση πολιτών...</p>
            </div>
          ) : citizens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Δεν υπάρχουν εγγεγραμμένοι πολίτες</p>
              <Button onClick={handleAddNew} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη Πρώτου Πολίτη
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {citizens.map((citizen) => (
                <div
                  key={citizen.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">
                          {citizen.surname} {citizen.name}
                        </h3>
                        {citizen.recommendation_from && (
                          <Badge variant="outline" className="text-xs">
                            Σύσταση: {citizen.recommendation_from}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {citizen.mobile_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {citizen.mobile_phone}
                          </span>
                        )}
                        {citizen.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {citizen.email}
                          </span>
                        )}
                        {citizen.municipality && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {citizen.municipality}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {citizen.electoral_district && (
                          <Badge variant="secondary" className="text-xs">
                            {citizen.electoral_district}
                          </Badge>
                        )}
                        {citizen.last_contact_date && (
                          <Badge variant="outline" className="text-xs">
                            Τελ. επικοινωνία: {formatDate(citizen.last_contact_date)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(citizen)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(citizen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(citizen)}
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

          {/* Pagination */}
          {!loading && totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Σελίδα {currentPage} από {Math.ceil(totalCount / ITEMS_PER_PAGE)} 
                · Σύνολο {totalCount.toLocaleString('el-GR')} πολίτες
                · Εμφάνιση {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCitizens(currentPage - 1, debouncedSearchTerm, municipalityFilter)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Προηγούμενη
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCitizens(currentPage + 1, debouncedSearchTerm, municipalityFilter)}
                  disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                >
                  Επόμενη
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}