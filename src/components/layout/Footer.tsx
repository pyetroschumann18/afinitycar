import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-main" data-reveal>
        <div className="footer-intro">
          <p className="footer-eyebrow">AfinityCar</p>
          <strong>Sua busca merece uma boa conversa.</strong>
          <p>Encontre o veículo ideal com atendimento personalizado, ágil e transparente.</p>
        </div>
        <div className="footer-contact-block">
          <span>Comece por aqui</span>
          <Link className="footer-form-cta" href="/#qualificacao">Preencher formulário <span aria-hidden="true">↗</span></Link>
          <p>Nossa equipe especializada está pronta para responder suas dúvidas e te atender.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} AfinityCar</span>
        <nav aria-label="Links do rodapé"><Link href="/#qualificacao">Sua busca</Link><Link href="/#veiculos">Veículos</Link></nav>
        <span>AfinityCar Automóveis</span>
      </div>
    </footer>
  );
}
