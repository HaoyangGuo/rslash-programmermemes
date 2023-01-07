import Link from "next/link";
import React from "react";

const Hero = () => {
	return (
		<>
			<div className="mb-5 flex flex-col justify-between items-center shadow-lg">
				<div className="h-36 flex items-center text-white bg-[url(/img/herobackground.png)] justify-center w-full text-center text-2xl sm:text-3xl px-5 font-medium">
					r/ProgrammerMemes
				</div>
				<div className="w-full h-16 flex items-center justify-center bg-white text-lg sm:text-xl font-medium">
					Memes about everything programming and CS
				</div>
			</div>
		</>
	);
};

export default Hero;
