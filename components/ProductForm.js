import {useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import {allowedDisplayValues} from "next/dist/compiled/@next/font/dist/constants";

export default function ProductForm(props) {
    const {
        _id,
        title: existingTitle,
        description: existingDescription,
        price: existingPrice,
        images: existingImages
    } = props;
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const router = useRouter();

    const handleProduct = async (event) => {
        event.preventDefault();
        _id ?
            // update
            await axios.put('/api/products', {title, description, price, _id}) :
            // create
            await axios.post('/api/products', {title, description, price});

        setGoToProducts(true);
    }

    if (goToProducts) {
        router.push('/products');
    }

    const uploadImages = async (event) => {
        const files = event.target?.files;

        if (files?.length > 0) {
            const data = new FormData();

            for (const file of files) {
                data.append('file', file);
            }

            const res = await axios.post('/api/upload', data);
            setImages(prevImages => [...prevImages, ...res.data.links])
            console.log(res.data)
        }
    }

    return (
        <form onSubmit={handleProduct}>
            <label>Product name</label>
            <input
                type='text'
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder='product name'/>
            <label>Photos</label>
            <div className='mb-2 flex flex-wrap gap-2'>
                {console.log(images)}
                {!!images?.length && images.map(image => (
                        <div className='h-24' key={image}>
                            <img className='rounded-lg' src={image} alt="commodityImage"/>
                        </div>
                    )
                )}
                <label
                    className='rounded-lg bg-gray-300 cursor-pointer w-24 h-24 flex justify-center items-center text-sm gap-1 text-gray-500'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                    <div>Upload</div>
                    <input onChange={uploadImages} type="file" className='hidden'/>
                </label>
                {!images?.length && <div>No photos in this product</div>}
            </div>
            <label>Description</label>
            <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder='description'></textarea>
            <label>Price (in USD)</label>
            <input
                type="text"
                value={price}
                onChange={event => setPrice(event.target.value)}
                placeholder='price'/>
            <button
                type='submit'
                className='btn-primary'
            >Save
            </button>
        </form>
    )
}
