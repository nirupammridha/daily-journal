'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function JournalPage() {
  const [journals, setJournals] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const fetchJournals = async () => {
    const { data } = await supabase
      .from('journals')
      .select('*')
      .order('created_at', { ascending: false });
    setJournals(data || []);
  };

  const addJournal = async () => {
    const user = await supabase.auth.getUser();
    await supabase.from('journals').insert({
      title,
      content,
      user_id: user.data.user.id
    });
    setTitle('');
    setContent('');
    fetchJournals();
  };

  const deleteJournal = async (id) => {
    await supabase.from('journals').delete().eq('id', id);
    fetchJournals();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/auth');
    });
    fetchJournals();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <button onClick={logout} className="text-red-600 float-right">Logout</button>
      <h1 className="text-2xl font-bold mb-4">Daily Journal</h1>
      
      <div className="space-y-2">
        <input
          className="w-full border p-2"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-2"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2" onClick={addJournal}>
          Add Entry
        </button>
      </div>

      <hr />

      {journals.map(j => (
        <div key={j.id} className="border p-4 mt-4">
          <h2 className="font-bold">{j.title}</h2>
          <p>{j.content}</p>
          <button onClick={() => deleteJournal(j.id)} className="text-sm text-red-500">Delete</button>
        </div>
      ))}
    </div>
  );
}
