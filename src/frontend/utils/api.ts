export async function fetchApi(endpoint: string, options = {}) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, options);
  if (!res.ok) throw new Error('API error');
  return res.json();
} 