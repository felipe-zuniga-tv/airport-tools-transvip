import { apiError, apiSuccess } from '@/lib/api/response';

export async function POST(request: Request) {
  const { booking_id, user, timestamp } = await request.json()

  if (!booking_id || !user || !timestamp) {
    return apiError('Booking ID, user and timestamp are required', 400);
  }

  try {
    const message = `QR Code Generated | Booking ID: ${booking_id} | User: ${user} | Timestamp: ${timestamp}`;
    console.log(message)
    return apiSuccess({ message })
  } catch (error) {
    console.error(error);
    return apiError('Internal server error', 500);
  }
}