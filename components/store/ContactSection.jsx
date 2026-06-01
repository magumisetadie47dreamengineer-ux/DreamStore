import { brand } from "@/lib/brand";
import ContactInfo from "./ContactInfo";

export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="card bg-base-200 border border-base-content/10 shadow-none overflow-hidden">
        <div className="h-1 w-full bg-primary" />
        <div className="card-body lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary mb-2">
              Connect
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Talk to {brand.dreamChaser}
            </h2>
            <p className="mt-3 text-base-content/55 text-sm leading-relaxed">
              {brand.mantraSub}
            </p>
          </div>
          <div className="glass-panel rounded-sm p-6 min-w-[280px]">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}
