import { doc, getDoc, Firestore } from 'firebase/firestore';
import { Course } from '../types';

export class GetCourseWithTasks {
  constructor(private readonly db: Firestore) {}

  async execute(courseId: string): Promise<Course | null> {
    try {
      const courseRef = doc(this.db, 'courses', courseId);
      const docSnap = await getDoc(courseRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        description: data.description || '',
        tasks: data.tasks || [],
      };
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  }
}