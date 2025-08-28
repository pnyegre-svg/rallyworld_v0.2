
import { collection, getDocs, Firestore, QueryDocumentSnapshot } from 'firebase/firestore';

export type Competitor = {
  id: string;
  name: string;
  team: string;
  country: string;
  avatar: string;
  vehicle: string;
};

// Firestore converter for the Competitor object
const competitorConverter = {
  fromFirestore: (snapshot: QueryDocumentSnapshot): Competitor => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      team: data.team,
      country: data.country,
      avatar: data.avatar,
      vehicle: data.vehicle,
    };
  },
  toFirestore: (competitor: Competitor) => {
    // Exclude 'id' when writing to Firestore
    const { id, ...data } = competitor;
    return data;
  }
};

export const getCompetitors = async (db: Firestore): Promise<Competitor[]> => {
  const competitorsCollection = collection(db, 'competitors').withConverter(competitorConverter);
  try {
    const querySnapshot = await getDocs(competitorsCollection);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting competitors: ", error);
    return [];
  }
};
