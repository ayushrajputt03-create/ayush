import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useStudentData(studentId) {
  const [data, setData] = useState(null);
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
      doc(firestore, 'students', studentId),
      (snap) => {
        if (snap.exists()) {
          setData({ id: snap.id, ...snap.data() });
        } else {
          setData(null);
        }
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
