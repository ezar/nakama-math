export function Footer() {
  return (
    <footer className="w-full text-center py-3 px-4">
      <p className="font-nunito text-xs text-navy-600 select-none">
        © {new Date().getFullYear()} Nakama Math · v{__APP_VERSION__}
      </p>
    </footer>
  )
}
