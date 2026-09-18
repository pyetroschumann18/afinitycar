import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="site-header"><div className="shell header-inner">
      <Link className="brand" href="/" aria-label="AfinityCar, página inicial">
        <span className="brand-mark"><Image src="/brand/afinitycar-logo.png" alt="" width={56} height={56} priority /></span>
        <span className="brand-word">Afinity<span>Car</span><small>Intermediação automotiva</small></span>
      </Link>
      <nav aria-label="Navegação principal" className="header-nav"><a href="#qualificacao">Sua busca</a><a href="#veiculos">Veículos</a></nav>
    </div></header>
  );
}
