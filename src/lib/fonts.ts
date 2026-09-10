import localFont from "next/font/local";

export const peydaFont = localFont({
  src: [
    {
      path: "../../public/font/peyda-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/Peyda-Medium.woff2",
      weight: "400", // Fallback for regular if regular file is not present
      style: "normal",
    },
    {
      path: "../../public/font/Peyda-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Peyda-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/font/Peyda-black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-peyda",
  display: "swap",
});
