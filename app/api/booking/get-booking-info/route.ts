import { getBookingInfo } from '@/lib/chat/functions';

export async function POST(request: Request) {
  const { bookingId, isShared } = await request.json()

  if (!bookingId) {
    return Response.json({ status: 404, message: 'Booking ID is required' });
  }

  try {
    const bookingInfo = await getBookingInfo(Number(bookingId), isShared);
    if (!bookingInfo) {
      return Response.json({ status: 404, message: 'Booking not found' });
    }
    return Response.json(bookingInfo)
  } catch (error) {
    console.error(error);
    return Response.json({ status: 500, message: 'Internal server error' });
  }
}