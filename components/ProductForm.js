import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {ReactSortable} from "react-sortablejs";

export default function ProductForm(props) {
    const {
        _id,
        title: existingTitle,
        price: existingPrice,
        images: existingImages,
        category:assignedCategory,
        description: existingDescription,
    } = props;
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const [category, setCategory] = useState(assignedCategory || '');
    const [categories,setCategories] = useState([]);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading,setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, []);

    const handleProduct = async (event) => {
        event.preventDefault();
        _id ?
            // update
            await axios.put('/api/products', {title, description, price, _id, images, category}) :
            // create
            await axios.post('/api/products', {title, description, price, images, category});

        setGoToProducts(true);
    }

    if (goToProducts) {
        router.push('/products');
    }

    const uploadImages = async (event) => {
        const files = event.target?.files;

        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();

            for (const file of files) {
                data.append('file', file);
            }

            const res = await axios.post('/api/upload', data);
            setImages(prevImages => [...prevImages, ...res.data.links]);
            setIsUploading(false);
        }
    }

    const updateImagesOrder = images => {
        setImages(images);
    }

    const propertiesToFill = [];

    if (categories.length > 0 && category) {
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        while(catInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
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
            <div className='flex flex-col mb-2'>
                <label>Category</label>
                <select className='border border-gray-300 rounded-md px-1 w-full' value={category}
                        onChange={ev => setCategory(ev.target.value)}>
                    <option value="">Uncategorized</option>
                    {categories.length > 0 && categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <label>Photos</label>
            <div className='mb-2 flex flex-wrap gap-2'>
                <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-1">
                    {!!images?.length && images.map(image => (
                            <div className='h-24' key={image}>
                                <img className='rounded-lg' src={image} alt="commodityImage"/>
                            </div>
                        )
                    )}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner />
                    </div>
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
