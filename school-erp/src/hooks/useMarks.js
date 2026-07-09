import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useMarks(studentId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      collection(firestore, 'marks', studentId, 'subjects'),
      (snap) => {
        const subjects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        subjects.sort((a, b) => (a.subjectName || '').localeCompare(b.subjectName || ''));
        setData(subjects);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [studentId]);

  return { data, loading, error };
}
