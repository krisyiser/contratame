import './globals.css'

export const metadata = {
  title: 'ContrataMe | Elite Freelance Platform',
  description: 'Connect with premium talent or find your next big project.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
