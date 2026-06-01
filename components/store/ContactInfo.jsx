import { siteContact } from "@/lib/siteContact";

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.28-.059.42l2.292 2.292c.14.105.319.076.42-.059l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465.668.25 1.272.644 1.772 1.153.509.5.902 1.104 1.153 1.772.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.903 4.903 0 0 1-1.153 1.772c-.5.509-1.104.902-1.772 1.153-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.903 4.903 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427.25-.668.644-1.272 1.153-1.772.509-.509 1.104-.902 1.772-1.153.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2Zm-1.163 1.63h2.326c2.407 0 2.695.009 3.646.052.984.045 1.518.207 1.875.344.471.183.808.402 1.161.755.353.353.572.69.755 1.161.137.357.299.891.344 1.875.043.951.052 1.239.052 3.646v2.326c0 2.407-.009 2.695-.052 3.646-.045.984-.207 1.518-.344 1.875a3.111 3.111 0 0 1-.755 1.161 3.111 3.111 0 0 1-1.161.755c-.357.137-.891.299-1.875.344-.951.043-1.239.052-3.646.052h-2.326c-2.407 0-2.695-.009-3.646-.052-.984-.045-1.518-.207-1.875-.344a3.111 3.111 0 0 1-1.161-.755 3.111 3.111 0 0 1-.755-1.161c-.137-.357-.299-.891-.344-1.875-.043-.951-.052-1.239-.052-3.646v-2.326c0-2.407.009-2.695.052-3.646.045-.984.207-1.518.344-1.875.183-.471.402-.808.755-1.161.353-.353.69-.572 1.161-.755.357-.137.891-.299 1.875-.344.951-.043 1.239-.052 3.646-.052ZM12 7.378a4.622 4.622 0 1 0 0 9.244 4.622 4.622 0 0 0 0-9.244Zm0 1.63a3.092 3.092 0 1 1 0 6.184 3.092 3.092 0 0 1 0-6.184Zm5.806-3.406a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
    </svg>
  );
}

const linkClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-primary/10 hover:text-primary";

export default function ContactInfo({ compact = false }) {
  const items = [
    {
      icon: <PhoneIcon />,
      href: siteContact.phoneHref,
      label: siteContact.phone,
      external: false,
    },
    {
      icon: <EmailIcon />,
      href: siteContact.emailHref,
      label: siteContact.email,
      external: false,
    },
    {
      icon: <FacebookIcon />,
      href: siteContact.facebook.href,
      label: siteContact.facebook.label,
      external: true,
    },
    {
      icon: <InstagramIcon />,
      href: siteContact.instagram.href,
      label: `@${siteContact.instagram.label}`,
      external: true,
    },
  ];

  return (
    <ul className={`flex flex-col gap-1 ${compact ? "text-sm" : ""}`}>
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            className={linkClass}
            {...(item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <span className="text-primary">{item.icon}</span>
            <span className="break-all">{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
