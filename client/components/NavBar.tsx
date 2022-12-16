import React, { Fragment } from "react";
import { CommandLineIcon, Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const NavBar: React.FC<{}> = () => {
	const [{ data, fetching }] = useMeQuery({});
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

	let body = null;
	let menu = null;

	if (fetching) {
	} else if (!data?.me) {
		body = (
			<>
				<Link href="/login">
					<button className="text-center text-base mr-2 rounded-full border border-transparent bg-orange-600 py-1 w-28 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1">
						login
					</button>
				</Link>
				<Link href="/register">
					<button className="text-center text-base rounded-full border border-transparent bg-gray-300 py-1 w-28 font-medium text-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1">
						register
					</button>
				</Link>
			</>
		);
		menu = (
			<>
				<Menu.Item>
					<Link href="/login">
						<button className="text-center text-base rounded-full border border-transparent bg-orange-600 py-1 w-28 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1">
							login
						</button>
					</Link>
				</Menu.Item>
				<Menu.Item>
					<Link href="/register">
						<button className="text-center text-base rounded-full border border-transparent bg-gray-300 py-1 w-28 font-medium text-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1">
							register
						</button>
					</Link>
				</Menu.Item>
			</>
		);
	} else {
		body = (
			<>
				<div className="mr-4 font-medium">{data.me.username}</div>
				<button
					onClick={() => logout({})}
					disabled={logoutFetching}
					className="text-center text-base rounded-full border border-transparent bg-gray-300 py-1 w-28 font-medium text-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
				>
					logout
				</button>
			</>
		);
		menu = (
			<>
				<Menu.Item>
					<div className="font-medium">{data.me.username}</div>
				</Menu.Item>
				<Menu.Item>
					<button
						onClick={() => logout({})}
						disabled={logoutFetching}
						className="text-center text-base rounded-full border border-transparent bg-gray-300 py-1 w-28 font-medium text-black hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
					>
						logout
					</button>
				</Menu.Item>
			</>
		);
	}

	return (
		<div className="flex justify-between items-center border-b-[1px] border-gray-200 h-14 px-4">
			<div className="flex items-center">
				<CommandLineIcon className="w-12 h-12 mr-2 text-orange-600" />
				<div className="text-2xl font-bold">r/programmermemes</div>
			</div>
			<div className="items-center hidden md:flex">{body}</div>
			<Menu as="div" className="relative inline-block text-left md:hidden">
				<div>
					<Menu.Button className="inline-flex w-full justify-center border-gray-300 p-2">
						<Bars3Icon className="h-7 w-7" />
					</Menu.Button>
				</div>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						<div className="py-4 items-center flex flex-col gap-2">{menu}</div>
					</Menu.Items>
				</Transition>
			</Menu>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(NavBar);
