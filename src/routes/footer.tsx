export function Footer() {
  return (
    <footer className="relative p-10 pt-10 bg-footer bg-no-repeat bg-cover bg-center 2xl:bg-contain 2xl:bg-repeat mt-10">
      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/images/footer/island.png"
          alt="island"
          className="h-12 w-12 mb-2 "
        />
        <p className="text-center font-bold text-lg">Nusaventure</p>
      </div>

      <div className="text-center mt-8">
        <p>&copy; Nusaventure 2024</p>
      </div>
    </footer>
  );
}
