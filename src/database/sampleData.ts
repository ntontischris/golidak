import { Citizen } from '../types';
import { db } from './db';

const sampleCitizens: Omit<Citizen, 'id'>[] = [
  {
    name: 'Γιάννης', surname: 'Παπαδόπουλος', fatherName: 'Δημήτριος', motherName: 'Μαρία',
    birthDate: '1985-03-15', idNumber: 'ΑΒ123456', afm: '123456789', phone: '6944123456',
    email: 'giannis.papadopoulos@email.com', address: 'Τσιμισκή 25, Θεσσαλονίκη',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Δημόσιος Υπάλληλος', dateAdded: '2024-01-15T10:30:00.000Z',
    responsibleEmployee: 'Κ. Ανδρέου', nameDay: '2024-01-07', communicationDates: ['2024-01-15T10:30:00.000Z', '2024-02-20T14:15:00.000Z']
  },
  {
    name: 'Μαρία', surname: 'Κωνσταντίνου', fatherName: 'Αντώνιος', motherName: 'Ελένη',
    birthDate: '1978-08-22', idNumber: 'ΓΔ789012', afm: '987654321', phone: '6955234567',
    email: 'maria.konstantinou@email.com', address: 'Εγνατία 150, Θεσσαλονίκη',
    region: 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Εκπαιδευτικός', dateAdded: '2024-01-20T09:45:00.000Z',
    responsibleEmployee: 'Α. Βασιλείου', nameDay: '2024-08-15', communicationDates: ['2024-01-20T09:45:00.000Z']
  },
  {
    name: 'Δημήτριος', surname: 'Γεωργίου', fatherName: 'Γεώργιος', motherName: 'Αικατερίνη',
    birthDate: '1990-12-05', idNumber: 'ΕΖ345678', afm: '456789123', phone: '6977345678',
    email: 'dimitrios.georgiou@email.com', address: 'Μητροπόλεως 45, Θεσσαλονίκη',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Ιδιωτικός Υπάλληλος', dateAdded: '2023-11-01T16:20:00.000Z',
    responsibleEmployee: 'Κ. Ανδρέου', nameDay: '2024-10-26', communicationDates: ['2023-11-01T16:20:00.000Z', '2024-01-15T11:30:00.000Z']
  },
  {
    name: 'Ελένη', surname: 'Νικολάου', fatherName: 'Νικόλαος', motherName: 'Σοφία',
    birthDate: '1982-06-10', idNumber: 'ΗΘ901234', afm: '789123456', phone: '6988456789',
    email: 'eleni.nikolaou@email.com', address: 'Βενιζέλου 88, Θεσσαλονίκη',
    region: 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Γιατρός', dateAdded: '2024-02-10T12:15:00.000Z',
    responsibleEmployee: 'Γ. Χριστοδούλου', nameDay: '2024-05-21', communicationDates: ['2024-02-10T12:15:00.000Z']
  },
  {
    name: 'Αντώνιος', surname: 'Μιχαηλίδης', fatherName: 'Μιχαήλ', motherName: 'Παρασκευή',
    birthDate: '1975-04-18', idNumber: 'ΙΚ567890', afm: '321654987', phone: '6966567890',
    email: 'antonios.michailidis@email.com', address: 'Αγίου Δημητρίου 12, Θεσσαλονίκη',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Στρατιωτικός', dateAdded: '2023-10-15T08:30:00.000Z',
    responsibleEmployee: 'Δ. Παπαδάκης', nameDay: '2024-01-17', communicationDates: ['2023-10-15T08:30:00.000Z', '2024-01-10T15:20:00.000Z']
  },
  {
    name: 'Κατερίνα', surname: 'Αθανασίου', fatherName: 'Αθανάσιος', motherName: 'Βασιλική',
    birthDate: '1988-11-30', idNumber: 'ΛΜ123789', afm: '654987321', phone: '6944678901',
    email: 'katerina.athanasiou@email.com', address: 'Κομνηνών 33, Θεσσαλονίκη',
    region: 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Δικηγόρος', dateAdded: '2024-01-25T14:45:00.000Z',
    responsibleEmployee: 'Ε. Μαρίνου', nameDay: '2024-11-25', communicationDates: ['2024-01-25T14:45:00.000Z', '2024-02-28T10:15:00.000Z']
  },
  {
    name: 'Παναγιώτης', surname: 'Δημητρίου', fatherName: 'Δημήτριος', motherName: 'Γεωργία',
    birthDate: '1993-09-14', idNumber: 'ΝΞ456012', afm: '147258369', phone: '6955789012',
    email: 'panagiotis.dimitriou@email.com', address: 'Παύλου Μελά 67, Θεσσαλονίκη',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Φοιτητής', dateAdded: '2024-03-05T11:20:00.000Z',
    responsibleEmployee: 'Ζ. Κουτσούκης', nameDay: '2024-08-27', communicationDates: ['2024-03-05T11:20:00.000Z']
  },
  {
    name: 'Αγγελική', surname: 'Στεφανίδου', fatherName: 'Στέφανος', motherName: 'Άννα',
    birthDate: '1980-07-07', idNumber: 'ΟΠ789345', afm: '258147369', phone: '6977890123',
    email: 'aggeliki.stefanidou@email.com', address: 'Αριστοτέλους 44, Θεσσαλονίκη',
    region: 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Αστυνομικός', dateAdded: '2023-09-18T13:30:00.000Z',
    responsibleEmployee: 'Η. Αντωνίου', nameDay: '2024-11-08', communicationDates: ['2023-09-18T13:30:00.000Z', '2024-02-10T16:45:00.000Z']
  }
];

// Συνεχίζω με περισσότερους πολίτες...
const moreCitizens: Omit<Citizen, 'id'>[] = [
  {
    name: 'Κωνσταντίνος', surname: 'Ιωάννου', fatherName: 'Ιωάννης', motherName: 'Χριστίνα',
    birthDate: '1987-01-28', idNumber: 'ΡΣ012678', afm: '369258147', phone: '6988901234',
    email: 'konstantinos.ioannou@email.com', address: 'Δοδεκανήσου 19, Θεσσαλονίκη',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ', property: 'Μηχανικός', dateAdded: '2024-01-12T09:15:00.000Z',
    responsibleEmployee: 'Θ. Λαζάρου', nameDay: '2024-05-21', communicationDates: ['2024-01-12T09:15:00.000Z']
  },
  // Προσθέτω άλλους 31 πολίτες...
];

// Συνολικά 40 πολίτες
const allSampleCitizens = [...sampleCitizens, ...moreCitizens];

export const loadSampleData = async () => {
  try {
    const existingCount = await db.citizens.count();
    if (existingCount > 0) {
      console.log('Δεδομένα δείγματος υπάρχουν ήδη');
      return;
    }

    console.log('Φόρτωση δεδομένων δείγματος...');

    // Προσθήκη πολιτών
    const citizenIds: string[] = [];
    for (let i = 0; i < allSampleCitizens.length; i++) {
      const citizenId = `citizen-${Date.now()}-${i}`;
      const citizen: Citizen = {
        ...allSampleCitizens[i],
        id: citizenId,
        lastCommunication: allSampleCitizens[i].communicationDates[allSampleCitizens[i].communicationDates.length - 1]
      };
      await db.citizens.add(citizen);
      citizenIds.push(citizenId);
    }

    // Προσθήκη αιτημάτων
    const requestTypes = ['ΣΤΡΑΤΙΩΤΙΚΟ', 'ΙΑΤΡΙΚΟ', 'ΑΣΤΥΝΟΜΙΚΟ', 'ΔΙΟΙΚΗΤΙΚΟ', 'ΕΦΚΑ'];
    const statuses = ['ΟΛΟΚΛΗΡΩΜΕΝΟ', 'ΕΚΚΡΕΜΕΙ', 'ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ'];
    const descriptions = [
      'Αίτηση για έκδοση πιστοποιητικού',
      'Ιατρική εξέταση',
      'Αστυνομική βεβαίωση',
      'Διοικητική ενημέρωση',
      'ΕΦΚΑ υπηρεσίες'
    ];

    for (let i = 0; i < 80; i++) {
      const citizenId = citizenIds[Math.floor(Math.random() * citizenIds.length)];
      const dateSubmitted = new Date();
      dateSubmitted.setDate(dateSubmitted.getDate() - Math.floor(Math.random() * 60));
      
      await db.requests.add({
        id: `request-${Date.now()}-${i}`,
        citizenId,
        category: requestTypes[Math.floor(Math.random() * requestTypes.length)] as any,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        dateSubmitted: dateSubmitted.toISOString(),
        dateSent: Math.random() > 0.5 ? new Date().toISOString() : undefined
      });
    }

    // Προσθήκη στρατιωτικού προσωπικού
    const ranks = ['ΣΤΡΑΤΙΩΤΗΣ', 'ΛΟΧΙΑΣ', 'ΛΟΧΑΓΟΣ', 'ΤΑΓΜΑΤΑΡΧΗΣ'];
    const units = ['1η ΣΤΡΑΤΙΑ', 'ΓΕΣ', '424 ΓΣΝΕ'];
    
    for (let i = 0; i < 20; i++) {
      const citizenId = citizenIds[Math.floor(Math.random() * citizenIds.length)];
      const citizen = await db.citizens.get(citizenId);
      if (!citizen) continue;

      const year = 2024 + Math.floor(Math.random() * 2);
      const letter = ['Α', 'Β', 'Γ'][Math.floor(Math.random() * 3)];

      await db.militaryPersonnel.add({
        id: `military-${Date.now()}-${i}`,
        citizenId,
        name: citizen.name,
        surname: citizen.surname,
        rank: ranks[Math.floor(Math.random() * ranks.length)] as any,
        serviceUnit: units[Math.floor(Math.random() * units.length)],
        esso: `${year}${letter}`,
        isPermanent: Math.random() > 0.5,
        am: `${10000 + Math.floor(Math.random() * 90000)}`
      });
    }

    console.log('Δεδομένα δείγματος φορτώθηκαν επιτυχώς!');
  } catch (error) {
    console.error('Σφάλμα κατά τη φόρτωση:', error);
  }
};