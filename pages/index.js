import Layout from "@/components/Layout";
import {useSession} from "next-auth/react";
import Image from "next/image";

export default function Home() {
    const { data: session} = useSession();

    if (!session) return;
    return (
        <Layout>
            <div className='text-blue-900 flex justify-between'>
                <h2>
                    Hi, <b>{session?.user?.name}</b>
                </h2>
                <div className='flex bg-grey-300 text-black rounded-lg overflow-hidden'>
                    <img src={session?.user?.image} alt="userImage" className='w-8 h-8' width={5} height={5}/>
                    <span className='px-2'>
                        {session?.user?.name}
                    </span>
                </div>
            </div>
        </Layout>
    )
}


