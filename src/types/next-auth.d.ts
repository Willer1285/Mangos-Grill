import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string;
      lastName: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }
}
