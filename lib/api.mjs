export async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  if (data === null) throw new Error("The server returned an invalid response.");
  return data;
}
