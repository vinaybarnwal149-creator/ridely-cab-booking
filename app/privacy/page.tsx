export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold mb-8">
        TEMPLATE — Review with qualified legal counsel before production commercial use.
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
      <p className="text-xs text-slate-500 mb-8">Last Updated: October 2026</p>

      <div className="prose prose-slate text-sm text-slate-600 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
          <p>We collect personal information such as your name, phone number, email address, geolocation during ride booking, and payment records.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. How Geolocation is Handled</h2>
          <p>Driver location is tracked to match nearby requests and calculate routes. Driver live location is shared with riders exclusively while a trip is active. Location logs are retained for 30 days and purged automatically.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Payment Information</h2>
          <p>Credit/debit card data is processed directly via PCI-DSS compliant providers (Stripe). We never store raw credit card numbers on our servers.</p>
        </section>
      </div>
    </div>
  );
}

