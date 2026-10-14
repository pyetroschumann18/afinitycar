import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="site-header"><div className="shell header-inner">
      <Link className="brand" href="/" aria-label="AfinityCar, página inicial">
        <span className="brand-monogram">
          <Image
            src="/brand/af-logo.png"
            alt="AF"
            width={44}
            height={44}
            priority
            className="brand-logo-img"
          />
        </span>
        <span className="brand-word">Afinity<span>Car</span><small>Intermediação automotiva</small></span>
      </Link>
      <nav aria-label="Navegação principal" className="header-nav"><a href="#qualificacao">Sua busca</a><a href="#veiculos">Veículos</a></nav>
    </div></header>
  );
}
