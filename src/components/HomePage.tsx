import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, FileText, Calendar, BarChart3, Shield, Database, LogIn } from 'lucide-react'

interface HomePageProps {
  onLoginClick: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Golidak</h1>
          </div>
          <Button onClick={onLoginClick} className="flex items-center space-x-2">
            <LogIn className="h-4 w-4" />
            <span>Σύνδεση</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Σύστημα Διαχείρισης Πολιτών
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Μια ολοκληρωμένη πλατφόρμα για τη διαχείριση δημόσιων υπηρεσιών, 
          την παρακολούθηση αιτημάτων πολιτών και την οργάνωση στρατιωτικών καθηκόντων.
        </p>
        <Button size="lg" onClick={onLoginClick} className="text-lg px-8 py-3">
          Είσοδος στο Σύστημα
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Χαρακτηριστικά Πλατφόρμας</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Διαχείριση Πολιτών</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Καταχώρηση και διαχείριση προσωπικών στοιχείων πολιτών, 
                με δυνατότητα αναζήτησης και ομαδοποίησης.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Διαχείριση Αιτημάτων</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Παρακολούθηση και επεξεργασία αιτημάτων πολιτών με σύστημα 
                κατηγοριοποίησης και προτεραιότητας.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Στρατιωτική Διαχείριση</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Οργάνωση στρατιωτικού προσωπικού, καθηκόντων και 
                παρακολούθηση στρατιωτικής υπηρεσίας.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Σύστημα Υπενθυμίσεων</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Αυτόματες υπενθυμίσεις για σημαντικές ημερομηνίες, 
                προθεσμίες και επερχόμενα καθήκοντα.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Στατιστικά & Αναφορές</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Λεπτομερείς αναφορές και στατιστικά για καλύτερη 
                κατανόηση των δεδομένων και τάσεων.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Διαχείριση Χρηστών</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Σύστημα ρόλων και δικαιωμάτων για ασφαλή πρόσβαση 
                στα δεδομένα και τις λειτουργίες του συστήματος.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">Σχετικά με το Project</h3>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-center text-muted-foreground">
                Το <strong>Golidak</strong> είναι ένα σύγχρονο σύστημα διαχείρισης που αναπτύχθηκε 
                για να καλύψει τις ανάγκες δημόσιων οργανισμών και υπηρεσιών. Προσφέρει 
                ολοκληρωμένες λύσεις για τη διαχείριση πολιτών, την επεξεργασία αιτημάτων, 
                την οργάνωση στρατιωτικού προσωπικού και την παροχή λεπτομερών στατιστικών.
              </p>
              <p className="text-center text-muted-foreground mt-4">
                Με έμφαση στην ασφάλεια, την ευκολία χρήσης και την αποδοτικότητα, 
                το σύστημα παρέχει μια ενιαία πλατφόρμα για όλες τις διαχειριστικές ανάγκες, 
                βελτιώνοντας την ποιότητα υπηρεσιών προς τους πολίτες.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Golidak - Σύστημα Διαχείρισης Πολιτών. Όλα τα δικαιώματα διατηρούνται.
          </p>
        </div>
      </footer>
    </div>
  )
}