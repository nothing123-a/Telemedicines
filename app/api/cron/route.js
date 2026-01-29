export async function GET() {
  try {
    const timestamp = new Date().toISOString();
    console.log(`🔄 Cron job executed at ${timestamp}`);
    
    return Response.json({ 
      success: true,
      message: 'Cron job executed successfully',
      timestamp,
      uptime: process.uptime()
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}