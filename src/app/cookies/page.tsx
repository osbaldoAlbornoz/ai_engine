import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#020202] pt-32 pb-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-8">
          Cookie <span className="text-primary">Policy</span>
        </h1>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p className="text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">1. What Are Cookies</h2>
          <p>
            As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-zinc-400">
            <li><strong>Essential Cookies:</strong> These cookies are essential to provide you with services available through our website and to enable you to use some of its features.</li>
            <li><strong>Analytics Cookies:</strong> These cookies are used to collect information about how visitors use our website. We use the information to compile reports and to help us improve the website.</li>
            <li><strong>Affiliate Cookies:</strong> As an Amazon Associate, cookies may be placed on your device by Amazon when you click our affiliate links. This helps track the origin of the click so that any resulting purchases can be credited to our account.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">3. Third Party Cookies</h2>
          <p>
            In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-400">
            <li>This site uses analytics solutions to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</li>
            <li>We partner with the Amazon Services LLC Associates Program. Clicking on links that direct to Amazon.com will result in cookies being set by Amazon in accordance with their privacy and cookie policies.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">4. Disabling Cookies</h2>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.
          </p>

          <h2 className="text-2xl font-bold text-white font-heading mt-8 mb-4">5. More Information</h2>
          <p>
            Hopefully, that has clarified things for you. As was previously mentioned, if there is something that you aren't sure whether you need or not, it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
          </p>
          <p>
            If you are still looking for more information, you can contact us through our preferred contact methods.
          </p>
        </div>
      </div>
    </div>
  );
}