import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const middleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const isAdmin = req.nextauth?.token?.isAdmin

    // Se tentando acessar /dashboard/admin sem ser admin, redireciona para /dashboard
    if (req.nextUrl.pathname === "/dashboard/admin" && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
