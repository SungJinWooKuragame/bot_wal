import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const middleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const token = req.nextauth?.token
    const isAdmin = token?.isAdmin === true

    const pathname = req.nextUrl.pathname

    // Se tentando acessar /dashboard/admin sem ser admin, redireciona para /dashboard
    if (pathname === "/dashboard/admin" && !isAdmin) {
      console.log("[Middleware] Admin attempt blocked - redirecting to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Se tentar /dashboard sem ser admin, deixa passar (página de cliente)
    // Se for admin em /dashboard, deixa passar (será redirecionado pela página)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      },
    },
    pages: {
      signIn: "/",
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*"],
}

