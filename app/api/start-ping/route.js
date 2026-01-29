import { startSelfPing } from '../../../lib/selfPing';

export async function POST() {
  try {
    startSelfPing();
    return Response.json({ 
      success: true, 
      message: 'Self-ping started' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}