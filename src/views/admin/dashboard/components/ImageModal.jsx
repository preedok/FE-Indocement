import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FormatDate from '../../../../utils/formatDate';
import Slider from "react-slick"; 

const ImageModal = ({ transaction, isOpen, onClose }) => {
    const images = transaction && transaction.pictures ? transaction.pictures : [];
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };
    return (
        <>
            <style>{`
                /* slick-carousel core styles simplified for modal */
                .slick-slider {
                    position: relative;
                    display: block;
                    user-select: none;
                    touch-action: pan-y;
                    -webkit-tap-highlight-color: transparent;
                }
                .slick-list {
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                }
                .slick-slide {
                    display: none;
                    float: left;
                    height: 100%;
                    min-height: 1px;
                }
                .slick-slide.slick-active {
                    display: block;
                }
                .slick-dots {
                    position: absolute;
                    bottom: 10px;
                    display: flex !important;
                    justify-content: center;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    list-style: none;
                }
                .slick-dots li {
                    margin: 0 4px;
                }
                .slick-dots li button {
                    font-size: 0;
                    line-height: 0;
                    display: block;
                    width: 10px;
                    height: 10px;
                    padding: 5px;
                    cursor: pointer;
                    color: transparent;
                    border: 0;
                    outline: none;
                    background: #c5c5c5;
                    border-radius: 50%;
                }
                .slick-dots li.slick-active button {
                    background: #2563eb;
                }
                .slick-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    display: block;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    cursor: pointer;
                    color: transparent;
                    background: rgba(0,0,0,0.25);
                    border-radius: 50%;
                    z-index: 1;
                }
                .slick-prev {
                    left: 8px;
                }
                .slick-next {
                    right: 8px;
                }
                .slick-prev:before, .slick-next:before {
                    font-family: 'slick';
                    font-size: 20px;
                    line-height: 1;
                    opacity: 0.75;
                    color: white;
                }
                /* Arrow content for prev/next */
                .slick-prev:before {
                    content: '←';
                }
                .slick-next:before {
                    content: '→';
                }
                /* Image styling */
                .modal-slider-image {
                    max-width: 100%;
                    max-height: 80vh;
                    margin: 0 auto;
                    display: block;
                    border-radius: 8px;
                    object-fit: contain;
                }
            `}</style>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {images.length > 0
                                    ? <FormatDate dateString={images[0].dateTime} />
                                    : 'No date available'}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center items-center h-full">
                        {images.length > 0 ? (
                            <Slider {...settings}>
                                {images.map((image) => (
                                    <div key={image.id}>
                                        <img
                                            src={`${apiUrl}/Picture/${image.id}/file`}
                                            alt={`Image ${image.id}`}
                                            className="modal-slider-image"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <p>No image available</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageModal;
