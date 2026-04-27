export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 text-center pb-safe pt-1 px-4 pointer-events-none z-10">
      <p className="font-nunito text-xs text-navy-700 select-none">
        © {new Date().getFullYear()} Nakama Math · v{__APP_VERSION__}
      </p>
    </footer>
  )
}
