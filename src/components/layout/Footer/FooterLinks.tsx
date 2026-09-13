import React from "react";
import Link from "next/link";
import { FooterLinkGroup } from "./footer.data";

interface FooterLinksProps {
  group: FooterLinkGroup;
}

export function FooterLinks({ group }: FooterLinksProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm md:text-base font-medium text-neutral-900 leading-none">
        {group.title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {group.links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className="text-xs md:text-sm text-neutral-600 hover:text-primary focus-visible:text-primary focus-visible:outline-none transition-colors duration-150 inline-block py-0.5"
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
