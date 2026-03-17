import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const font = Red_Hat_Display({ subsets: ["latin"], weight: ["400", "500", "700"] });
// const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Transvip Chile",
	description: "Operaciones | Aeropuerto",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={font.className}>
				{children}
			</body>
		</html>
	);
}
