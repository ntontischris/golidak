import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Citizen, SearchFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Phone, Mail, MapPin, Users, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CitizenSearchProps {
  onSelectCitizen?: (citizen: Citizen) => void
}

export const CitizenSearch: React.FC<CitizenSearchProps> = ({ onSelectCitizen }) => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const municipalities = [
    'ΠΑΥΛΟΥ ΜΕΛΑ',
    'ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ', 
    'ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ',
    'ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ',
    'ΘΕΣΣΑΛΟΝΙΚΗΣ',
    'ΚΑΛΑΜΑΡΙΑΣ',
    'ΑΛΛΟ'
  ]

  const electoralDistricts = ['Α ΘΕΣΣΑΛΟΝΙΚΗΣ', 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ']

  const handleSearch = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`)
      }
      if (filters.surname) {
        query = query.ilike('surname', `%${filters.surname}%`)
      }
      if (filters.phone) {
        query = query.or(`mobile_phone.ilike.%${filters.phone}%,landline_phone.ilike.%${filters.phone}%`)
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`)
      }
      if (filters.municipality) {
        query = query.eq('municipality', filters.municipality)
      }
      if (filters.electoral_district) {
        query = query.eq('electoral_district', filters.electoral_district)
      }
      if (filters.recommendation_from) {
        query = query.ilike('recommendation_from', `%${filters.recommendation_from}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error searching citizens:', error)
        return
      }

      setCitizens(data || [])
    } catch (error) {
      console.error('Error searching citizens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setCitizens([])
  }

  useEffect(() => {
    if (Object.values(filters).some(value => value)) {
      handleSearch()
    }
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Αναζήτηση Πολιτών
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search Fields */}
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
              <label className="text-sm font-medium block mb-1">Τηλέφωνο</label>
              <Input
                placeholder="Τηλέφωνο"
                value={filters.phone || ''}
                onChange={(e) => handleFilterChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input
                placeholder="Email"
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Απόκρυψη' : 'Εμφάνιση'} Προηγμένων Φίλτρων
          </Button>

          {/* Advanced Search Fields */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium block mb-1">Δήμος</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={filters.municipality || ''}
                  onChange={(e) => handleFilterChange('municipality', e.target.value)}
                >
                  <option value="">Όλοι οι Δήμοι</option>
                  {municipalities.map(municipality => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Εκλογική Περιφέρεια</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={filters.electoral_district || ''}
                  onChange={(e) => handleFilterChange('electoral_district', e.target.value)}
                >
                  <option value="">Όλες οι Περιφέρειες</option>
                  {electoralDistricts.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Σύσταση από</label>
                <Input
                  placeholder="Σύσταση από"
                  value={filters.recommendation_from || ''}
                  onChange={(e) => handleFilterChange('recommendation_from', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              {loading ? 'Αναζήτηση...' : 'Αναζήτηση'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Καθαρισμός
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {citizens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Αποτελέσματα ({citizens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {citizens.map((citizen) => (
                <div
                  key={citizen.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onSelectCitizen?.(citizen)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {citizen.surname} {citizen.name}
                      </h3>
                      
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
                          <Badge variant="secondary">
                            {citizen.electoral_district}
                          </Badge>
                        )}
                        {citizen.recommendation_from && (
                          <Badge variant="outline">
                            Σύσταση: {citizen.recommendation_from}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      {citizen.last_contact_date && (
                        <p>Τελευταία επικοινωνία: {formatDate(citizen.last_contact_date)}</p>
                      )}
                      <p>Εγγραφή: {formatDate(citizen.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {citizens.length === 0 && Object.values(filters).some(value => value) && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Δεν βρέθηκαν πολίτες με τα συγκεκριμένα κριτήρια
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}