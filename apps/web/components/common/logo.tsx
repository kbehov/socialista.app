import Link from 'next/link'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className="bg-foreground size-6 rounded-md flex items-center justify-center text-background text-lg leading-none transition-transform duration-200 group-hover:scale-105">
        ✹
      </span>
      <span className="text-lg font-medium tracking-tight leading-none">Socialista</span>
    </Link>
  )
}

export default Logo
