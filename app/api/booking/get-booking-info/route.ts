import { getBookingInfo } from '@/lib/main/functions';
import { apiError, apiSuccess } from '@/lib/api/response';

export async function POST(request: Request) {
  const { bookingId } = await request.json()

  if (!bookingId) {
    return apiError('Booking ID is required', 400);
  }

  try {
    const bookingInfo = await getBookingInfo(Number(bookingId));

    if (!bookingInfo?.length) {
      return apiError('Booking not found', 404);
    }

    return apiSuccess(bookingInfo)
  } catch (error) {
    console.error('Booking Info was not obtained: ', error);
    return apiError('Internal server error', 500);
  }
}