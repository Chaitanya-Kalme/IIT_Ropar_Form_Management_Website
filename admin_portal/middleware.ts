import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/sign-in', // redirects here if not authenticated
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/forms/:path*',
    '/users/:path*',
    '/students/:path*',
    // add every protected route here
  ],
};