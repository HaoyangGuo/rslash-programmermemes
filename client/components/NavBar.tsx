import React, { Fragment } from "react";
import { CommandLineIcon, Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useRouter } from "next/router";
import { Github } from "lucide-react";

const NavBar: React.FC = () => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({});
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const handleLogoutButtonClicked = async () => {
    await logout({});
    router.reload();
  };

  let body = null;
  let menu = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <Link href="/login">
          <button className="text-center text-base font-medium mr-2 rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500">
            Log In
          </button>
        </Link>
        <Link href="/register">
          <button className="text-center text-base font-medium rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500">
            Register
          </button>
        </Link>
      </>
    );
    menu = (
      <>
        <Menu.Item>
          <Link href="/login">
            <button className="text-center text-base font-medium rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500">
              Log In
            </button>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/register">
            <button className="text-center text-base font-medium rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500">
              Register
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
          onClick={() => handleLogoutButtonClicked()}
          disabled={logoutFetching}
          className="text-center text-base font-medium mr-2 rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500"
        >
          Log Out
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
            onClick={() => handleLogoutButtonClicked()}
            disabled={logoutFetching}
            className="text-center text-base font-medium rounded-full w-28 py-1.5 border text-white bg-orange-600 hover:bg-orange-500"
          >
            Log Out
          </button>
        </Menu.Item>
      </>
    );
  }

  return (
    <div className="flex justify-between items-center bg-white h-16 px-4 border-b-[1px] border-gray-200">
      <a
        className="hidden absolute top-[0.8rem] left-2 md:flex gap-1 p-0.5 md:py-1.5 md:px-2.5 hover:cursor-pointer text-base bg-black text-white rounded-full items-center hover:underline"
        href="https://github.com/HaoyangGuo/rslash-programmermemes"
      >
        <Github className="w-6 h-6" />
        <span className="hidden md:block">Source Code</span>
      </a>
      <div className="md:max-w-3xl mx-auto w-full flex justify-between items-center">
        <Link
          href={"/"}
          className="flex items-center hover:bg-gray-200 pr-1 rounded"
        >
          <CommandLineIcon className="w-10 h-10 mr-1 text-orange-600" />
          <div className="text-2xl font-bold">r/ProgrammerMemes</div>
        </Link>
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
              <div className="py-4 items-center flex flex-col gap-2">
                {menu}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(NavBar);
