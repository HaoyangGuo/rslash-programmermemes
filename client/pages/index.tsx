import { withUrqlClient } from "next-urql";
import Head from "next/head";
import Image from "next/image";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import NavBar from "../components/NavBar";

function Home() {
	const [{ data }] = usePostsQuery();

	return (
		<div className="">
			<NavBar />
      <div>Hello World</div>
      <br />
			{!data ? <div>Loading...</div> : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
		</div>
	);
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Home);
