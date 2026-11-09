// The URL carries only an opaque id. File paths stay in the Python registry.
export function recordingPath(recordingId, resource = '') {
  if (!/^[a-f0-9]{32}$/.test(recordingId || '')) throw new Error('Open lysn from a recording in Streamlit.');
  return `/api/lysn/recordings/${recordingId}${resource ? `/${resource}` : ''}`;
}

export async function integrationRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
