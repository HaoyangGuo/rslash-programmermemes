import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Roboto } from "@next/font/google";
import NavBar from "../components/NavBar";

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["100", "300", "400", "500", "700", "900"],
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<main className={roboto.className}>
				<Component {...pageProps} />
			</main>
		</>
	);
}
