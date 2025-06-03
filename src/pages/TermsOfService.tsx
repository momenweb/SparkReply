import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using SparkReply, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily access SparkReply for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained within SparkReply</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Terms</h2>
              <p>You are responsible for maintaining the security of your account and password. SparkReply cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. API Usage</h2>
              <p>Your use of any APIs through our service must comply with the respective API provider's terms of service. You are responsible for any API keys and credentials you use with SparkReply.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Content Generation</h2>
              <p>You retain ownership of any content you generate using SparkReply. However, you are responsible for ensuring that any generated content complies with applicable laws and platform policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitations</h2>
              <p>In no event shall SparkReply or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use SparkReply.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Revisions</h2>
              <p>SparkReply may revise these terms of service at any time without notice. By using this service you are agreeing to be bound by the then current version of these terms of service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </section>

            <section className="pt-6">
              <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 