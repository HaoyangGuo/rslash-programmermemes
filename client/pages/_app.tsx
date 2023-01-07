import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Roboto } from "@next/font/google";
import Head from "next/head";

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["100", "300", "400", "500", "700", "900"],
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>r/ProgrammerMemes</title>
			</Head>
			<main className={roboto.className}>
				<Component {...pageProps} />
			</main>
		</>
	);
}
