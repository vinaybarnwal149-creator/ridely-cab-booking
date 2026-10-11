export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold mb-8">
        TEMPLATE — Review with qualified legal counsel before production commercial use.
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
      <p className="text-xs text-slate-500 mb-8">Last Updated: October 2026</p>

      <div className="prose prose-slate text-sm text-slate-600 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
          <p>By creating an account or accessing Ridely, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Rides and Fare Structure</h2>
          <p>Fares are calculated based on transparent formulas including base fare, distance, time, booking fees, and applicable surge pricing. Fares are locked for 5 minutes during quote creation.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Cancellation Policies</h2>
          <p>Riders can cancel rides free of charge within 2 minutes of acceptance. Beyond 2 minutes, a cancellation fee of ₹30 applies to compensate drivers.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Code of Conduct</h2>
          <p>Both riders and drivers must treat each other with dignity and respect. Zero tolerance applies to harassment, intoxicated conduct, or vehicle damage.</p>
        </section>
      </div>
    </div>
  );
}

