import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useNotices(classId, maxCount = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classId || !firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(firestore, 'notices'),
      where('targetClasses', 'array-contains', classId),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const notices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(notices);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [classId, maxCount]);

  return { data, loading, error };
}
