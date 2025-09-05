import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Users, 
  MapPin, 
  Building, 
  Vote, 
  Shield, 
  Calendar,
  FileText,
  UserCheck,
  Filter
} from 'lucide-react'

interface GroupingOption {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  values: { value: string; label: string; count: number }[]
}

interface GroupingFiltersProps {
  options: GroupingOption[]
  selectedGroups: Record<string, string[]>
  onGroupChange: (groupKey: string, values: string[]) => void
  onClearAll: () => void
  totalCount: number
  filteredCount: number
}

export const GroupingFilters: React.FC<GroupingFiltersProps> = ({
  options,
  selectedGroups,
  onGroupChange,
  onClearAll,
  totalCount,
  filteredCount
}) => {
  const hasActiveFilters = Object.values(selectedGroups).some(values => values.length > 0)
  
  const toggleValue = (groupKey: string, value: string) => {
    const currentValues = selectedGroups[groupKey] || []
    let newValues: string[]
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value)
    } else {
      newValues = [...currentValues, value]
    }
    
    onGroupChange(groupKey, newValues)
  }

  const clearGroup = (groupKey: string) => {
    onGroupChange(groupKey, [])
  }

  const isValueSelected = (groupKey: string, value: string) => {
    return (selectedGroups[groupKey] || []).includes(value)
  }

  const getSelectedCount = (groupKey: string) => {
    return (selectedGroups[groupKey] || []).length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Ομαδοποίηση & Φίλτρα
          </span>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Εμφάνιση: <span className="font-medium">{filteredCount.toLocaleString('el-GR')}</span> από{' '}
              <span className="font-medium">{totalCount.toLocaleString('el-GR')}</span>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearAll}>
                Καθαρισμός Όλων
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {options.map((option) => {
            const Icon = option.icon
            const selectedCount = getSelectedCount(option.key)
            
            return (
              <AccordionItem key={option.key} value={option.key}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{option.label}</span>
                    {selectedCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {selectedCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {selectedCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearGroup(option.key)}
                        className="text-destructive hover:text-destructive mb-2"
                      >
                        Καθαρισμός επιλογών
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {option.values.map((value) => {
                        const isSelected = isValueSelected(option.key, value.value)
                        
                        return (
                          <button
                            key={value.value}
                            onClick={() => toggleValue(option.key, value.value)}
                            className={`p-2 text-left rounded-md transition-colors border ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'hover:bg-accent border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{value.label}</span>
                              <Badge 
                                variant={isSelected ? "secondary" : "outline"} 
                                className="text-xs"
                              >
                                {value.count}
                              </Badge>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    
                    {option.values.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Δεν υπάρχουν διαθέσιμες επιλογές
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

// Helper function to create grouping options for citizens
export const createCitizenGroupingOptions = (citizens: any[]): GroupingOption[] => {
  const municipalityCount = citizens.reduce((acc, citizen) => {
    const municipality = citizen.municipality || 'Άγνωστο'
    acc[municipality] = (acc[municipality] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const districtCount = citizens.reduce((acc, citizen) => {
    const district = citizen.electoral_district || 'Άγνωστη'
    acc[district] = (acc[district] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recommendationCount = citizens.reduce((acc, citizen) => {
    if (citizen.recommendation_from) {
      acc[citizen.recommendation_from] = (acc[citizen.recommendation_from] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const contactDateCount = citizens.reduce((acc, citizen) => {
    if (citizen.last_contact_date) {
      const year = new Date(citizen.last_contact_date).getFullYear()
      const key = `${year}`
      acc[key] = (acc[key] || 0) + 1
    } else {
      acc['Χωρίς επικοινωνία'] = (acc['Χωρίς επικοινωνία'] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return [
    {
      key: 'municipality',
      label: 'Δήμος',
      icon: Building,
      values: Object.entries(municipalityCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    },
    {
      key: 'electoral_district',
      label: 'Εκλογική Περιφέρεια',
      icon: Vote,
      values: Object.entries(districtCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    },
    {
      key: 'recommendation_from',
      label: 'Σύσταση από',
      icon: UserCheck,
      values: Object.entries(recommendationCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    },
    {
      key: 'last_contact_year',
      label: 'Έτος Τελευταίας Επικοινωνίας',
      icon: Calendar,
      values: Object.entries(contactDateCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    }
  ]
}

// Helper function to create grouping options for military personnel
export const createMilitaryGroupingOptions = (personnel: any[]): GroupingOption[] => {
  const rankCount = personnel.reduce((acc, person) => {
    const rank = person.rank || 'Άγνωστος'
    acc[rank] = (acc[rank] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const essoYearCount = personnel.reduce((acc, person) => {
    if (person.esso_year) {
      acc[person.esso_year] = (acc[person.esso_year] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const essoLetterCount = personnel.reduce((acc, person) => {
    if (person.esso_letter) {
      acc[person.esso_letter] = (acc[person.esso_letter] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const unitCount = personnel.reduce((acc, person) => {
    if (person.service_unit) {
      acc[person.service_unit] = (acc[person.service_unit] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return [
    {
      key: 'rank',
      label: 'Βαθμός',
      icon: Shield,
      values: Object.entries(rankCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    },
    {
      key: 'esso_year',
      label: 'Έτος ESSO',
      icon: Calendar,
      values: Object.entries(essoYearCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => b.value.localeCompare(a.value))
    },
    {
      key: 'esso_letter',
      label: 'Γράμμα ESSO',
      icon: FileText,
      values: Object.entries(essoLetterCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => a.value.localeCompare(b.value))
    },
    {
      key: 'service_unit',
      label: 'Μονάδα Υπηρεσίας',
      icon: Building,
      values: Object.entries(unitCount).map(([value, count]) => ({
        value,
        label: value,
        count: count as number
      })).sort((a, b) => (b.count as number) - (a.count as number))
    }
  ]
}