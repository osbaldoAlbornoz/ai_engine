import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#020202] pt-32 pb-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-8">
          Terms of <span className="text-primary">Service</span>
        </h1>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p className="text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using The AI Engine Lab (the "Site"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
          <p>
            Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">2. Affiliate Disclosure</h2>
          <p>
            The AI Engine Lab is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p>
            When you click on product links on our site that lead to Amazon and make a purchase, we may receive a commission. This comes at no additional cost to you and helps support the maintenance of our platform. We strive to provide unbiased and accurate information about AI hardware, regardless of any affiliate partnerships.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">3. Accuracy of Information</h2>
          <p>
            While we strive to provide accurate and up-to-date product specifications, AI performance scores, benchmarks, and pricing information, we cannot guarantee that all information displayed on the Site is complete, current, or error-free.
          </p>
          <p>
            Technical specifications are collected from manufacturer documentation, publicly available technical data, and other reliable sources. Product configurations may vary depending on the specific model, region, retailer, or seller listing.
          </p>
          <p>
            Prices, availability, promotions, and product details on third-party websites, including Amazon.com, may change without notice.
          </p>
          <p>
            Before making a purchase decision, users should verify the final specifications, price, and availability directly on the retailer's or manufacturer's website. The AI Engine Lab is not responsible for discrepancies between information displayed on the Site and the final product listing provided by third-party sellers.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            The AI Engine Lab and its creators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or any products purchased through links on our Site. The AI scores and recommendations are provided for informational purposes only and do not constitute professional advice.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, use, or publication by you of any such matters or any part of the Site is strictly prohibited.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">6. Third-Party Links</h2>
          <p>
            The Site contains links to third-party websites (e.g., Amazon). These links are provided solely as a convenience to you. We do not endorse the contents on any such third-party websites and are not responsible for the content of linked third-party sites.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">7. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Your continued use of the Site following any such modification constitutes your agreement to follow and be bound by the Terms of Service as modified.
          </p>
        </div>
      </div>
    </div>
  );
}