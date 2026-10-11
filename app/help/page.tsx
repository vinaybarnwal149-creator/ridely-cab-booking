"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How is my ride fare calculated?",
    a: "Fares are calculated using: Base Fare + (Distance × Per Km Rate) + (Time × Per Min Rate) × Surge Multiplier (if applicable) + ₹5 Booking Fee - Promo Discounts. The price you confirm upfront is locked for 5 minutes.",
  },
  {
    q: "What is the 4-digit Ride OTP?",
    a: "The ride OTP is a 4-digit security code displayed exclusively on your phone once a driver accepts your trip. Do not share this code until you have verified the vehicle's license plate and are safely inside.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support Stripe card payments (Visa, Mastercard, RuPay, Amex) and Cash directly to the driver upon ride completion.",
  },
  {
    q: "How does the Emergency SOS button work?",
    a: "Pressing and holding the SOS button for 2 seconds creates an emergency alert. It automatically dispatches SMS/email notifications with a live GPS tracking URL to your saved emergency contacts and alerts our 24/7 safety desk.",
  },
  {
    q: "Can I add intermediate stops to my journey?",
    a: "Yes! When booking on the /book screen, you can add up to 3 intermediate stops. The route, duration, and fare will automatically update.",
  },
  {
    q: "What are the ride cancellation fees?",
    a: "Cancellations made within 2 minutes of a driver accepting your request are 100% free. Cancellations after 2 minutes incur a ₹30 fee to compensate the driver for fuel and travel.",
  },
  {
    q: "How do promo codes work?",
    a: "Enter valid codes such as WELCOME50 or FLAT30 during checkout on the /book screen. The discount is applied immediately to your upfront fare quote.",
  },
  {
    q: "How do I become a driver partner?",
    a: "Go to Driver Onboarding, submit your vehicle registration and valid commercial driver's license details. Once our administrative team verifies your application, you can go online immediately.",
  },
  {
    q: "What commission does Ridely charge drivers?",
    a: "Ridely charges a competitive flat 20% platform commission on gross fares. Drivers keep 80% plus 100% of rider tips.",
  },
  {
    q: "Where can I download my ride receipt / tax invoice?",
    a: "Go to Ride History -> Select trip -> Click 'Download PDF Receipt'. We also email an invoice directly to your registered email address.",
  },
  {
    q: "I forgot an item in the cab. What should I do?",
    a: "Visit the Support Center or your ride details page, click 'Report an Issue', choose 'Lost Item', and submit a ticket. Our safety desk will coordinate with the driver to return your belongings.",
  },
  {
    q: "How are driver ratings calculated?",
    a: "Driver ratings are a cumulative average of all rider reviews (1 to 5 stars) across their completed trips. Drivers who maintain a score below 4.5 undergo mandatory retraining.",
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 bg-[#ffffff] text-[#000000]">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#000000] tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-[#5e5e5e] max-w-xl">
          Find instant answers to common questions about booking, payments, safety, and driver onboarding.
        </p>

        {/* Search bar */}
        <div className="mt-8 relative max-w-lg">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#767676]" />
          <input
            type="text"
            placeholder="Search questions (e.g. OTP, fare, cancellation)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#ffffff] border border-[#767676] rounded-[8px] text-xs focus:outline-none focus:border-[#000000] text-[#000000]"
          />
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3 mb-16 max-w-3xl">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between font-medium text-sm text-[#000000] hover:bg-[#f6f6f6] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#767676] shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#767676] shrink-0 ml-4" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#5e5e5e] leading-relaxed border-t border-[#f6f6f6]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-[#767676] text-xs">
            No matching questions found. Submit a support ticket below!
          </div>
        )}
      </div>

      {/* Contact Support CTA */}
      <div className="bg-[#f6f6f6] rounded-[8px] p-6 max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#e5e5e5]">
        <div>
          <h2 className="text-base font-medium text-[#000000] mb-1">
            Still need assistance?
          </h2>
          <p className="text-xs text-[#5e5e5e]">
            Our 24/7 support specialists are ready to help with any ride or payment inquiries.
          </p>
        </div>
        <Link href="/support/new">
          <button className="bg-[#000000] text-[#ffffff] px-5 py-2.5 rounded-[8px] text-xs font-normal hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2 shrink-0">
            <MessageSquarePlus className="w-4 h-4" />
            Create Support Ticket
          </button>
        </Link>
      </div>
    </div>
  );
}
