export async function notifyOps(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.info('[ops-notification]', event, payload);
  }
}
