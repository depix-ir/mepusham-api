"use client";

import React from "react";
import Image from "next/image";
import { BlogContentBlock } from "@/types/blog";

interface BlogContentRendererProps {
  content: BlogContentBlock[];
  className?: string;
}

export function BlogContentRenderer({ content, className = "" }: BlogContentRendererProps) {
  if (!content || content.length === 0) return null;

  return (
    <div className={`space-y-6 text-neutral-800 leading-relaxed max-width-prose font-normal ${className}`}>
      {content.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                className="text-base md:text-lg text-neutral-800 leading-8 md:leading-9 tracking-normal"
              >
                {block.text}
              </p>
            );

          case "heading": {
            const HeadingTag = block.level === 2 ? "h2" : "h3";
            const classes =
              block.level === 2
                ? "text-xl md:text-2xl font-bold text-foreground mt-8 mb-4 pt-2 leading-snug border-r-4 border-primary pr-3"
                : "text-lg md:text-xl font-bold text-foreground mt-6 mb-3 leading-snug";

            return (
              <HeadingTag key={index} className={classes}>
                {block.text}
              </HeadingTag>
            );
          }

          case "image":
            return (
              <figure key={index} className="my-8 space-y-2">
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-subtle border border-[#EEEEEE]">
                  <Image
                    src={block.src}
                    alt={block.alt || "تصویر مقاله"}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs md:text-sm text-neutral-500 italic mt-2">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "quote":
            return (
              <blockquote
                key={index}
                className="my-6 p-4 md:p-6 bg-surface-subtle border-r-4 border-primary rounded-l-xl text-foreground font-medium text-base md:text-lg italic leading-relaxed"
              >
                «{block.text}»
              </blockquote>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            const listClasses = block.ordered
              ? "list-decimal list-inside space-y-2.5 my-4 text-base md:text-lg text-neutral-800 pr-2"
              : "list-disc list-inside space-y-2.5 my-4 text-base md:text-lg text-neutral-800 pr-2";

            return (
              <ListTag key={index} className={listClasses}>
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    <span>{item}</span>
                  </li>
                ))}
              </ListTag>
            );
          }

          case "table":
            return (
              <div key={index} className="my-8 w-full overflow-x-auto rounded-xl border border-[#EEEEEE]">
                <table className="w-full min-w-[500px] text-right text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-subtle border-b border-[#EEEEEE]">
                      {block.headers.map((header, headIdx) => (
                        <th
                          key={headIdx}
                          className="p-3 md:p-4 font-bold text-foreground border-l last:border-l-0 border-[#EEEEEE]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                    {block.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-surface-subtle/40 transition-colors"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="p-3 md:p-4 text-neutral-700 border-l last:border-l-0 border-[#EEEEEE]"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
