export async function POST(request: Request) {
  const { booking_id, user, timestamp } = await request.json()

  if (!booking_id || !user || !timestamp) {
    return Response.json({ status: 404, message: 'Booking ID is required' });
  }

  try {
    console.log(`QR Code Generated | Booking ID: ${booking_id} | User: ${user} | Timestamp: ${timestamp}`)
    return Response.json({message: `QR Code Generated | Booking ID: ${booking_id} | User: ${user} | Timestamp: ${timestamp}`})
  } catch (error) {
    console.error(error);
    return Response.json({ status: 500, message: 'Internal server error' });
  }
}