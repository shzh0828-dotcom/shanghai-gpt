import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Shanghai · Between Two Shores',description:'Explore an interactive miniature of the Bund, Lujiazui, museums and shopping, from daylight to nightfall.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
