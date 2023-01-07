import React, { useState } from "react";
import Image from "next/image";

type NaturalPostImageProps = {
  imageUrl: string;
}

const NaturalPostImage: React.FC<NaturalPostImageProps> = ({imageUrl}) => {
	const [imageRatio, setImageRatio] = useState("16/9");
	return (
		<div
			className="relative mt-1 overflow-hidden"
			style={{
				aspectRatio: imageRatio,
			}}
		>
			<Image
				src={imageUrl}
				alt="meme"
				fill
				onLoadingComplete={(img) => {
					setImageRatio(`${img.naturalWidth}/${img.naturalHeight}`);
				}}
				style={{
					objectFit: "cover",
				}}
				sizes="100%"
				priority
			/>
		</div>
	);
};

export default NaturalPostImage;
