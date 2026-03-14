import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

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
			<body className={plusJakartaSans.className}>
				{children}
			</body>
		</html>
	);
}
