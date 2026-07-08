import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#020202] pt-32 pb-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-8">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p className="text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you visit AiEngine, we may collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-400">
            <li><strong>Device Information:</strong> version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
            <li><strong>Usage Information:</strong> data on how you navigate and use our features to help us optimize our content and improve your experience.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">2. Affiliate Relationships</h2>
          <p>
            AiEngine is a participant in the Amazon Services LLC Associates Program. As an Amazon Associate, we earn from qualifying purchases. When you click on product links on our site and make a purchase on Amazon, we may receive a commission. 
          </p>
          <p>
            We do not collect or store your payment information. All transactions are securely processed by Amazon.com. Please review Amazon's Privacy Notice to understand how they handle your personal and financial information.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">3. Use of Personal Information</h2>
          <p>
            We use the order information that we collect generally to fulfill any orders placed through the Site (including providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-400">
            <li>Communicate with you;</li>
            <li>Screen our orders for potential risk or fraud; and</li>
            <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">4. Sharing Personal Information</h2>
          <p>
            We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use analytics tools to help us understand how our customers use the Site. We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">5. Your Rights</h2>
          <p>
            If you are a resident of certain territories (such as Europe), you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">6. Changes</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">7. Contact Us</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email.
          </p>
        </div>
      </div>
    </div>
  );
}
