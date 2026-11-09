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

// Navigating to return_url would create a new Streamlit WebSocket/session and
// discard uploads. Only focus the tab that launched this editor, even when the
// two apps are on different ports. Never navigate as a fallback.
export function returnToStreamlit(editorWindow = window) {
  try {
    const streamlitWindow = editorWindow.opener;
    if (streamlitWindow && !streamlitWindow.closed) {
      streamlitWindow.focus();
      return 'Switch to your existing Streamlit tab if your browser did not bring it forward. Your files remain loaded there.';
    }
  } catch {
    // Browser isolation policies may prevent access to the opener.
  }
  return 'Switch to your existing Streamlit tab to keep your loaded files. For automatic return, open lysn using Open lysn annotation in that tab and keep it open.';
}
