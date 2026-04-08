export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="container-responsive grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-brand-800">Threadly</h3>
          <p className="mt-2 text-sm text-brand-700">
            Handcrafted textiles, smart shopping. Powered by ML for the perfect fit.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-brand-800">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm text-brand-700">
            <li>Sarees</li><li>Shirts</li><li>Fabrics</li><li>Dupattas</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-brand-800">Help</h4>
          <ul className="mt-2 space-y-1 text-sm text-brand-700">
            <li>Shipping</li><li>Returns</li><li>FAQ</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-brand-800">Newsletter</h4>
          <p className="mt-2 text-sm text-brand-700">Get 10% off your first order.</p>
          <form className="mt-3 flex gap-2">
            <input type="email" placeholder="you@example.com" className="input flex-1" />
            <button className="btn-primary">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-brand-100 py-4 text-center text-xs text-brand-700">
        © {new Date().getFullYear()} Threadly. Crafted with care.
      </div>
    </footer>
  );
}
