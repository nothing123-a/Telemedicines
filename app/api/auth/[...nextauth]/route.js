import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"
import Doctor from "@/models/Doctor";
import Pharmacist from "@/models/Pharmacist";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDoctor: { label: "Doctor Login", type: "text" },
        isPharmacist: { label: "Pharmacist Login", type: "text" },
      },
      async authorize(credentials) {
        // Demo credentials for testing
        const demoUsers = {
          // Patient demo
          'patient@demo.com': {
            id: 'demo-patient-123',
            name: 'Demo Patient',
            email: 'patient@demo.com',
            password: 'demo123',
            type: 'patient'
          },
          // Doctor demo
          'doctor@demo.com': {
            id: 'demo-doctor-123',
            name: 'Dr. Demo',
            email: 'doctor@demo.com',
            password: 'demo123',
            type: 'doctor'
          },
          // Pharmacist demo
          'pharmacist@demo.com': {
            id: 'demo-pharmacist-123',
            name: 'Demo Pharmacist',
            email: 'pharmacist@demo.com',
            password: 'demo123',
            type: 'pharmacist'
          }
        };

        // Check demo users first
        const demoUser = demoUsers[credentials.email];
        if (demoUser && demoUser.password === credentials.password) {
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            isDoctor: demoUser.type === 'doctor' || credentials.isDoctor === "true",
            isPharmacist: demoUser.type === 'pharmacist' || credentials.isPharmacist === "true",
          };
        }

        // Original database authentication
        await dbConnect();
        let account;

        if (credentials.isDoctor === "true") {
          account = await Doctor.findOne({ email: credentials.email });
        } else if (credentials.isPharmacist === "true") {
          account = await Pharmacist.findOne({ email: credentials.email });
        } else {
          account = await User.findOne({ email: credentials.email });
        }

        if (!account) throw new Error("No account found");
        if (!account.password) throw new Error("Password is required");
        if (!credentials.password) throw new Error("Password is required");

        const isValid = await bcrypt.compare(
          credentials.password,
          account.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: account._id.toString(),
          name: account.name,
          email: account.email,
          isDoctor: credentials.isDoctor === "true",
          isPharmacist: credentials.isPharmacist === "true",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            googleId: profile.sub, // Save Google ID!
          });
        }
      }
      return true;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isDoctor = token.isDoctor || false;
      session.user.isPharmacist = token.isPharmacist || false;
      session.user.googleId = token.googleId || null;
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id || token.id;
        token.isDoctor = user.isDoctor || false;
        token.isPharmacist = user.isPharmacist || false;
        if (profile?.sub) {
          token.googleId = profile.sub;
        }
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };