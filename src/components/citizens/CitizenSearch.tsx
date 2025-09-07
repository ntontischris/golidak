import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Citizen, SearchFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      {/* Modern Search Form with Glass Effect */}
      <div className="glass-card p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Αναζήτηση Πολιτών</h2>
            <p className="text-sm text-foreground-muted">Βρείτε πολίτες χρησιμοποιώντας τα παρακάτω φίλτρα</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Search Fields - Responsive Grid */}
          <div className="grid-responsive">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Όνομα</label>
              <Input
                className="input-modern"
                placeholder="Εισάγετε όνομα..."
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Επώνυμο</label>
              <Input
                className="input-modern"
                placeholder="Εισάγετε επώνυμο..."
                value={filters.surname || ''}
                onChange={(e) => handleFilterChange('surname', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Τηλέφωνο</label>
              <Input
                className="input-modern"
                placeholder="Εισάγετε τηλέφωνο..."
                value={filters.phone || ''}
                onChange={(e) => handleFilterChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                className="input-modern"
                placeholder="Εισάγετε email..."
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full glass-card border-card-border hover:border-border-hover transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Απόκρυψη' : 'Εμφάνιση'} Προηγμένων Φίλτρων
          </Button>

          {/* Advanced Search Fields with Animation */}
          {showAdvanced && (
            <div className="animate-fade-in-up grid-responsive pt-6 border-t border-card-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Δήμος</label>
                <select
                  className="input-modern"
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Εκλογική Περιφέρεια</label>
                <select
                  className="input-modern"
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Σύσταση από</label>
                <Input
                  className="input-modern"
                  placeholder="Εισάγετε όνομα συστήνοντος..."
                  value={filters.recommendation_from || ''}
                  onChange={(e) => handleFilterChange('recommendation_from', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSearch} 
              disabled={loading} 
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Αναζήτηση...
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Αναζήτηση
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="btn-secondary"
            >
              Καθαρισμός
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Results Section */}
      {citizens.length > 0 && (
        <div className="glass-card p-6 lg:p-8 animate-fade-in-up">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-xl">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Αποτελέσματα</h3>
                <p className="text-sm text-foreground-muted">
                  Βρέθηκαν {citizens.length} πολίτες
                </p>
              </div>
            </div>
            
            {/* Results count badge */}
            <div className="px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-semibold">{citizens.length}</span>
            </div>
          </div>

          {/* Citizens Grid - Responsive Layout */}
          <div className="grid-responsive-lg">
            {citizens.map((citizen) => (
              <div
                key={citizen.id}
                className="glass-card p-6 cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                onClick={() => onSelectCitizen?.(citizen)}
              >
                <div className="space-y-4">
                  {/* Citizen Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {citizen.surname} {citizen.name}
                      </h4>
                      <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    {citizen.mobile_phone && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Phone className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground-muted">Κινητό</p>
                          <p className="font-medium text-foreground">{citizen.mobile_phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {citizen.email && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground-muted">Email</p>
                          <p className="font-medium text-foreground truncate">{citizen.email}</p>
                        </div>
                      </div>
                    )}

                    {citizen.municipality && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <MapPin className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground-muted">Δήμος</p>
                          <p className="font-medium text-foreground">{citizen.municipality}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {citizen.electoral_district && (
                      <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30">
                        {citizen.electoral_district}
                      </Badge>
                    )}
                    {citizen.recommendation_from && (
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        Σύσταση: {citizen.recommendation_from}
                      </Badge>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-card-border space-y-1">
                    {citizen.last_contact_date && (
                      <p className="text-xs text-foreground-muted">
                        Τελευταία επικοινωνία: {formatDate(citizen.last_contact_date)}
                      </p>
                    )}
                    <p className="text-xs text-foreground-muted">
                      Εγγραφή: {formatDate(citizen.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {citizens.length === 0 && Object.values(filters).some(value => value) && !loading && (
        <div className="glass-card p-8 lg:p-12 text-center animate-fade-in-up">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 bg-muted/10 rounded-xl inline-block">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Δεν βρέθηκαν αποτελέσματα</h3>
              <p className="text-foreground-muted">
                Δεν βρέθηκαν πολίτες με τα συγκεκριμένα κριτήρια αναζήτησης.
                Δοκιμάστε να αλλάξετε τα φίλτρα σας.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="btn-secondary"
            >
              Καθαρισμός Φίλτρων
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}