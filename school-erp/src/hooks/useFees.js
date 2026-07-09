import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useFees(studentId) {
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

    const q = query(
      collection(firestore, 'fees'),
      where('studentId', '==', studentId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const fees = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        fees.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
        setData(fees);
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
