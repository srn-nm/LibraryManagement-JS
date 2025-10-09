export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

export async function apiFetch(endpoint, options = {}) {
  const baseURL = "https://karyar-library-management-system.liara.run/api";
  const token = getCookie("token");
  const response = await fetch(`${baseURL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    },
    ...options
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "API request failed");
  return json;
}
