import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { Loader2 } from "lucide-react";

const TransactionPhotoCarousel = ({ photos, apiUrl }) => {
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };

    return (
        <div className="w-full h-full">
            {photos && photos.length > 0 ? (
                <Slider {...sliderSettings}>
                    {photos.map(pic => (
                        <div key={pic.id}>
                            <img src={`${apiUrl}/Picture/${pic.id}/file`} alt="Transaction" className="w-full h-48 object-contain cursor-pointer" />
                        </div>
                    ))}
                </Slider>
            ) : (
                <div className="h-48 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm text-gray-500">Loading transaction photos...</p>
                </div>
            )}
        </div>
    );
};

export default TransactionPhotoCarousel;