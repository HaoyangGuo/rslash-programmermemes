import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Post from "../components/Post";
import Link from "next/link";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";

function Home() {
	const [variables, setVariables] = useState({
		limit: 10,
		cursor: null as null | string,
	});
	const [{ data, fetching, error }] = usePostsQuery({
		variables,
	});

	if (!fetching && !data) {
		return (
			<div className="bg-white h-screen flex justify-center items-center absolute top-0 left-0 w-screen">
				<div>Something went wrong: </div>
				<div>{error?.message}</div>
			</div>
		);
	}

	return (
		<>
			<NavBar pageProps={false} />
			<div className="bg-gray-100">
				<Hero />
				<div className="max-w-3xl px-5 mx-auto flex flex-col">
					<div className="border border-gray-300 flex h-16 mb-5 bg-white rounded shadow items-center px-5">
						<Link
							href={"/create-post"}
							className="bg-orange-600 w-64 text-center py-2 mx-auto rounded-full text-white font-medium text-base"
						>
							Create a post for your meme!
						</Link>
					</div>
					<div className="space-y-4 pb-5 min-h-screen">
						{!data && fetching ? (
							<div>Loading...</div>
						) : (
							data!.posts.posts.map((p) =>
								!p ? null : <Post key={p.id} post={p} />
							)
						)}
					</div>
					{data && data.posts.hasMore ? (
						<div className="flex justify-center">
							<button
								disabled={fetching}
								onClick={() => {
									setVariables({
										limit: variables.limit,
										cursor:
											data!.posts.posts[data!.posts.posts.length - 1].createdAt,
									});
								}}
								className={`btext-center text-base font-medium rounded-full w-28 py-2 text-white bg-orange-600 hover:bg-orange-500 my-10 ${
									fetching ? "bg-orange-700" : null
								}`}
							>
								Load More
							</button>
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Home);
