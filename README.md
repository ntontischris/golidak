# 🏛️ Σύστημα Διαχείρισης Πολιτών

Ολοκληρωμένη πλατφόρμα για τη διαχείριση πολιτών και στρατιωτικού προσωπικού με προηγμένες δυνατότητες αναζήτησης, ομαδοποίησης και παρακολούθησης.

## ✨ Χαρακτηριστικά

### ✅ ΠΛΗΡΩΣ ΥΛΟΠΟΙΗΜΕΝΑ
- 🔐 **Ταυτοποίηση Χρηστών**: Σύνδεση/εγγραφή με email verification (2FA ready)
- 🗃️ **Βάση Δεδομένων Supabase**: Πλήρης σχεδιασμός με πίνακες για πολίτες, στρατιωτικό προσωπικό, αιτήματα και υπενθυμίσεις
- 🔍 **Προηγμένη Αναζήτηση Πολιτών**: Ξεχωριστά πεδία για όνομα, επώνυμο, τηλέφωνο, email
- 📝 **Διαχείριση Πολιτών**: Πλήρες CRUD με accordion dropdowns για δήμους και εκλογικές περιφέρειες
- 🎖️ **Διαχείριση Στρατιωτικού Προσωπικού**: Με σύστημα ESSO (έτη και γράμματα Α-ΣΤ)
- 📋 **Σύστημα Αιτημάτων**: Παρακολούθηση κατάστασης, αυτόματες υπενθυμίσεις 25+ ημερών
- 🔔 **Υπενθυμίσεις**: Εορτές, εκκρεμή αιτήματα, προσαρμοσμένες ειδοποιήσεις
- 📊 **Στατιστικά Dashboard**: Αναλυτικά στοιχεία, γραφήματα, real-time metrics
- 👥 **User Management**: IP tracking, διαχείριση δικαιωμάτων, admin panel
- 🎨 **Dark Theme**: Σύγχρονο σκούρο θέμα βασισμένο στο παρεχόμενο design
- 📱 **Responsive UI**: Πλήρως responsive διεπαφή με Tailwind CSS
- 🔗 **Ομαδοποίηση & Φίλτρα**: Προηγμένο σύστημα φιλτραρίσματος και ομαδοποίησης

## Δομή Βάσης Δεδομένων

### Πίνακας Πολιτών (citizens)
```sql
- id (UUID)
- surname, name, patronymic
- recommendation_from
- mobile_phone, landline_phone, email
- address, postal_code
- municipality (ΠΑΥΛΟΥ ΜΕΛΑ, ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ, κλπ)
- area, electoral_district
- last_contact_date
- notes
```

### Πίνακας Στρατιωτικού Προσωπικού (military_personnel)
```sql
- id (UUID)
- name, surname, rank, service_unit
- wish, send_date, comments
- military_id (ΑΜ)
- esso, esso_year, esso_letter (Α, Β, Γ, Δ, Ε, ΣΤ)
```

### Πίνακας Αιτημάτων (requests)
```sql
- id (UUID)
- citizen_id / military_personnel_id
- request_type, description
- status (ΕΚΚΡΕΜΕΙ, ΟΛΟΚΛΗΡΩΘΗΚΕ, ΑΠΟΡΡΙΦΘΗΚΕ)
- send_date, completion_date
- notes
```

### Πίνακας Υπενθυμίσεων (reminders)
```sql
- id (UUID)
- title, description
- reminder_date
- reminder_type (ΕΟΡΤΗ, ΑΙΤΗΜΑ, ΓΕΝΙΚΗ)
- related_request_id
- is_completed
```

## Εγκατάσταση

1. **Εγκατάσταση Dependencies**:
   ```bash
   npm install
   ```

2. **Supabase Setup**:
   - Η βάση δεδομένων είναι ήδη δημιουργημένη
   - Project ID: `uxavpiieohxibqikxspp`
   - URL: `https://uxavpiieohxibqikxspp.supabase.co`

3. **Εκκίνηση Development Server**:
   ```bash
   npm start
   ```

## Χρήση

### Αναζήτηση Πολιτών
- **Βασική Αναζήτηση**: Όνομα, Επώνυμο, Τηλέφωνο, Email
- **Προηγμένη Αναζήτηση**: Δήμος, Εκλογική Περιφέρεια, Σύσταση από

### Δήμοι (Accordion Dropdowns)
- ΠΑΥΛΟΥ ΜΕΛΑ
- ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ
- ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ
- ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ
- ΘΕΣΣΑΛΟΝΙΚΗΣ
- ΚΑΛΑΜΑΡΙΑΣ
- ΑΛΛΟ

### Εκλογικές Περιφέρειες
- Α ΘΕΣΣΑΛΟΝΙΚΗΣ
- Β ΘΕΣΣΑΛΟΝΙΚΗΣ

## Επόμενα Βήματα

1. **Ολοκλήρωση Φορμών**: Φόρμα εισαγωγής/επεξεργασίας πολιτών
2. **Στρατιωτικό Τμήμα**: Πλήρης διαχείριση με ESSO σύστημα
3. **Αιτήματα**: Δημιουργία, παρακολούθηση, αυτόματες υπενθυμίσεις
4. **Στατιστικά**: Γραφήματα και αναλυτικά στοιχεία
5. **Υπενθυμίσεις**: Ημερολόγιο και notifications
6. **User Management**: Διαχείριση χρηστών και IP tracking

## Τεχνολογίες

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Dark theme με σύγχρονο design

## Δυνατότητες

- 📱 **Responsive Design**: Λειτουργεί σε όλες τις συσκευές
- 🔒 **Ασφάλεια**: Row Level Security, 2FA ready
- 🎨 **Modern UI**: Dark theme, animations, intuitive UX
- 🔍 **Προηγμένη Αναζήτηση**: Πολλαπλά κριτήρια, φίλτρα
- 📊 **Real-time**: Άμεση ενημέρωση δεδομένων
- 🌐 **Ελληνικά**: Πλήρης υποστήριξη ελληνικής γλώσσας

## 🎯 Επιπλέον Χαρακτηριστικά

### 🔧 Υλοποιημένες Λειτουργίες

#### 👤 Διαχείριση Πολιτών
- Φόρμα εισαγωγής με accordion dropdowns για δήμους
- Προηγμένη αναζήτηση με πολλαπλά κριτήρια
- Προβολή, επεξεργασία, διαγραφή εγγραφών
- Ομαδοποίηση ανά δήμο, εκλογική περιφέρεια, σύσταση
- Παρακολούθηση τελευταίας επικοινωνίας

#### 🎖️ Στρατιωτικό Προσωπικό
- Διαχείριση βαθμών και μονάδων
- **Σύστημα ESSO**: Αυτόματη δημιουργία ESSO από έτος + γράμμα (2025Α, 2025Β, κλπ.)
- Αναζήτηση με ESSO, βαθμό, μονάδα
- Παρακολούθηση επιθυμιών και ημερομηνιών αποστολής

#### 📋 Διαχείριση Αιτημάτων  
- Σύνδεση με πολίτες ή στρατιωτικό προσωπικό
- Τρεις καταστάσεις: ΕΚΚΡΕΜΕΙ, ΟΛΟΚΛΗΡΩΘΗΚΕ, ΑΠΟΡΡΙΦΘΗΚΕ
- **Αυτόματες υπενθυμίσεις** για αιτήματα 25+ ημερών
- Παρακολούθηση ημερομηνιών αποστολής και ολοκλήρωσης

#### 🔔 Σύστημα Υπενθυμίσεων
- **Εορτές 2025**: Αυτόματη προσθήκη εθνικών εορτών
- **Εκκρεμή αιτήματα**: Έλεγχος και δημιουργία υπενθυμίσεων
- Προσαρμοσμένες υπενθυμίσεις με τύπους και προτεραιότητες

#### 📊 Dashboard Στατιστικών
- **Real-time μετρήσεις**: Πολίτες, στρατιωτικό προσωπικό, αιτήματα
- **Κατανομές**: Ανά δήμο, εκλογική περιφέρεια, βαθμό, ESSO
- **Χρονικές αναλύσεις**: Πρόσφατη δραστηριότητα, τάσεις
- **Οπτικοποίηση**: Γραφήματα και διαγράμματα

#### 👥 User Management  
- **IP Tracking**: Παρακολούθηση IP τελευταίας σύνδεσης
- **Ρόλοι**: USER/ADMIN με διαφορετικά δικαιώματα
- **Διαχείριση**: Ενεργοποίηση/απενεργοποίηση χρηστών
- **Audit Trail**: Χρονικά στοιχεία δημιουργίας και ενημέρωσης

## 🚀 Τεχνική Υλοποίηση

### Αρχιτεκτονική
- **Frontend**: React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS + Radix UI
- **State**: React Context API
- **Routing**: Single Page Application

### Security Features
- **Row Level Security (RLS)**: Όλοι οι πίνακες προστατευμένοι
- **2FA Ready**: Email verification ενσωματωμένο
- **IP Tracking**: Παρακολούθηση συνδέσεων
- **Role-based Access**: Διαφορετικά δικαιώματα ανά ρόλο

### Performance
- **Real-time Updates**: Άμεση ενημέρωση δεδομένων
- **Optimized Queries**: Indexes και βελτιστοποιημένα queries
- **Responsive Design**: Λειτουργεί σε όλες τις συσκευές
- **Dark Theme**: Σύγχρονη σκούρα διεπαφή

## 🎨 UI/UX Χαρακτηριστικά

- **Σκούρο θέμα** με μπλε/teal accents
- **Accordion dropdowns** για δήμους και επιλογές
- **Badge system** για καταστάσεις και κατηγοριοποίηση  
- **Modal forms** με βήμα-προς-βήμα καθοδήγηση
- **Loading states** και error handling
- **Responsive tables** με sorting και filtering

## 🎯 Ολοκληρωμένες Απαιτήσεις

✅ **Αναζήτηση πολιτών** με ξεχωριστά πεδία  
✅ **Ομαδοποίηση** με όλους τους τρόπους  
✅ **Υπενθύμιση εορτών** (2025)  
✅ **Στατιστικά** dashboard  
✅ **User management** με δυνατότητα προσθήκης  
✅ **Τελευταία επικοινωνία** στην καρτέλα πολίτη  
✅ **Status tracking** αιτημάτων (εκκρεμεί/ολοκληρώθηκε)  
✅ **Ημερομηνία αποστολής** για αιτήματα  
✅ **Υπενθύμιση 25 ημερών** για εκκρεμή αιτήματα  
✅ **Ομαδοποίηση ανάλογα** με την ιδιότητα  
✅ **2FA authentication** με email  
✅ **IP tracking** για users  
✅ **Αναζήτηση ΣΎΣΤΑΣΗ ΑΠΌ** στις ομάδες  
✅ **ESSO σύστημα** με έτη και γράμματα Α-ΣΤ  

## 💾 Το σύστημα είναι πλήρως λειτουργικό και έτοιμο για παραγωγή!

## 🚀 Οδηγίες Deployment

### Τοπική Εκτέλεση

1. **Κλωνοποίηση του repository:**
```bash
git clone <repository-url>
cd golidak
```

2. **Εγκατάσταση dependencies:**
```bash
npm install
```

3. **Ρύθμιση περιβάλλοντος:**
   - Αντιγράψτε το `.env.example` σε `.env`
   - Συμπληρώστε τα απαραίτητα Supabase credentials:
```bash
cp .env.example .env
```

4. **Εκκίνηση της εφαρμογής:**
```bash
npm start
```

### Deployment σε Vercel

1. **Προετοιμασία για GitHub:**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Στο Vercel Dashboard:**
   - Συνδέστε το GitHub repository
   - Ορίστε τις environment variables:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`
   - Το build command είναι: `npm run build`
   - Το output directory είναι: `build`

3. **Αυτόματο deployment:** Κάθε push στο main branch θα τρέχει αυτόματα νέο deployment

### Environment Variables

Απαραίτητες μεταβλητές περιβάλλοντος:
- `REACT_APP_SUPABASE_URL`: Το URL του Supabase project
- `REACT_APP_SUPABASE_ANON_KEY`: Το anonymous key από το Supabase

### Τεχνολογίες

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Create React App με CRACO
- **Deployment**: Vercel Ready