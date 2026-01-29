import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";

export async function GET(req, { params }) {
  await dbConnect();
  const { email } = await params; // <-- no await here

  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    return new Response(JSON.stringify({ message: "Not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({ 
      isOnline: doctor.isOnline,
      name: doctor.name  // <-- include name
    }),
    { status: 200 }
  );
}